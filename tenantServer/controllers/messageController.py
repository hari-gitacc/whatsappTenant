from flask import request, jsonify, current_app
import openai
import os
import logging
import requests
from gtts import gTTS
from io import BytesIO
import tempfile
import langid
import re
import time
from bson import ObjectId
from models.tenant import Tenant
from utils.db import get_db

db = get_db()

# Setup basic logging
logging.basicConfig(level=logging.INFO)

def send_whatsapp_message(tenant, recipient_id, message_content, is_voice=False):
    url = f"https://graph.facebook.com/v20.0/{tenant.whatsapp_phone_number_id}/messages"
    headers = {
        'Authorization': f'Bearer {tenant.whatsapp_token}',
        'Content-Type': 'application/json'
    }
    if is_voice:
        data = {
            "messaging_product": "whatsapp",
            "to": recipient_id,
            "type": "audio",
            "audio": {
                "link": message_content
            }
        }
    else:
        data = {
            "messaging_product": "whatsapp",
            "to": recipient_id,
            "text": {
                "body": message_content
            }
        }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code != 200:
        logging.error(f"Failed to send message: {response.status_code}, {response.text}")
    else:
        logging.info(f"Message sent successfully: {response.json()}")

# Load predefined responses from the text file
def load_predefined_responses():
    predefined_responses = {}
    with open('responses.txt', 'r', encoding='utf-8') as file:
        lines = file.readlines()
        for line in lines:
            if '=' in line:
                question, response = line.split('=', 1)
                predefined_responses[question.strip().lower()] = response.strip()
    return predefined_responses

predefined_responses = load_predefined_responses()

def verify_webhook():
    mode = request.args.get('hub.mode')
    token = request.args.get('hub.verify_token')
    challenge = request.args.get('hub.challenge')
    tenant_id = request.args.get('tenant_id')

    tenant = Tenant.find_by_id(tenant_id)
    if not tenant:
        logging.error(f"Invalid tenant ID: {tenant_id}")
        return "Invalid tenant", 400

    logging.debug(f"Verification request: mode={mode}, token={token}, challenge={challenge}")

    if mode and token:
        if mode == 'subscribe' and token == tenant.verify_token:
            logging.info(f"WEBHOOK_VERIFIED for tenant {tenant_id}")
            return challenge, 200
        else:
            logging.error(f"Verification token mismatch for tenant {tenant_id}")
            return "Verification token mismatch", 403
    logging.error(f"Verification failed for tenant {tenant_id}")
    return "Verification failed", 400

def handle_incoming_messages():
    incoming_msg = request.get_json()
    logging.debug(f"Incoming webhook message: {incoming_msg}")
    
    tenant_id = incoming_msg.get('tenant_id')
    tenant = Tenant.find_by_id(tenant_id)
    if not tenant:
        logging.error(f"Invalid tenant ID: {tenant_id}")
        return jsonify({"error": "Invalid tenant"}), 400

    for entry in incoming_msg.get('entry', []):
        for change in entry.get('changes', []):
            value = change.get('value', {})
            if 'messages' in value:
                for msg in value['messages']:
                    sender_id = msg.get('from')
                    profile_name = value['contacts'][0]['profile']['name'] if 'contacts' in value and 'profile' in value['contacts'][0] else 'Unknown'
                    if 'text' in msg:
                        message_text = msg['text']['body']
                        process_user_message(tenant, sender_id, message_text, profile_name, is_audio=False)
                    elif 'audio' in msg:
                        audio_id = msg['audio']['id']
                        handle_audio_message(tenant, sender_id, audio_id, profile_name)
    return jsonify(status="success"), 200

def handle_audio_message(tenant, sender_id, audio_id, profile_name):
    url = f"https://graph.facebook.com/v20.0/{audio_id}"
    headers = {
        'Authorization': f'Bearer {tenant.whatsapp_token}'
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        audio_url = response.json().get('url')
        audio_content = requests.get(audio_url, headers=headers).content
        audio_path = save_audio_file(audio_content)
        user_message = transcribe_audio(audio_path)
        logging.info(f"Transcribed audio message to text: {user_message}")
        process_user_message(tenant, sender_id, user_message, profile_name, is_audio=True)
    else:
        logging.error(f"Failed to fetch audio message: {response.status_code}, {response.text}")

def save_audio_file(audio_content):
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".ogg", dir="audio_files")
    temp_file.write(audio_content)
    temp_file.close()
    return temp_file.name

def transcribe_audio(audio_path):
    with open(audio_path, "rb") as audio_file:
        result = openai.Audio.transcribe("whisper-1", audio_file)
    return result["text"]

def process_user_message(tenant, sender_id, message_text, profile_name, is_audio):
    logging.info(f"Processing message from {sender_id} ({profile_name}): {message_text}")

    detected_language = detect_language(message_text)
    response_text = find_predefined_response(message_text)
    
    if not response_text:
        response_text = get_gpt_response(message_text)
        if not response_text:
            response_text = "I'm sorry, but your query seems to be out of context. Please contact our customer service for more assistance."
    
    if is_audio:
        response_audio = synthesize_speech(response_text, detected_language)
        if response_audio:
            audio_path = save_audio_to_server(response_audio)
            send_whatsapp_message(tenant, sender_id, audio_path, is_voice=True)
            response_data = {
                "sender_id": sender_id,
                "username": profile_name,
                "message_type": "audio",
                "audio_url": audio_path
            }
        else:
            response_text = "I'm sorry, but I couldn't synthesize the audio response."
            send_whatsapp_message(tenant, sender_id, response_text, is_voice=False)
            response_data = {
                "sender_id": sender_id,
                "username": profile_name,
                "message_type": "text",
                "response": response_text
            }
    else:
        send_whatsapp_message(tenant, sender_id, response_text, is_voice=False)
        response_data = {
            "sender_id": sender_id,
            "username": profile_name,
            "message_type": "text",
            "response": response_text
        }

    save_message_to_db({
        "tenant_id": str(tenant._id),
        "sender_id": sender_id,
        "username": profile_name,
        "message_text": message_text,
        "response_text": response_text,
        "detected_language": detected_language,
        "timestamp": int(time.time()),
        "is_audio": is_audio
    })

def save_message_to_db(message_data):
    try:
        message_data['_id'] = str(ObjectId())
        db.whatsapp_responses.insert_one(message_data)
        logging.info("Message saved to MongoDB successfully.")
    except Exception as e:
        logging.error(f"Failed to save message to MongoDB. Error: {e}")

def find_predefined_response(user_input):
    user_words = set(re.findall(r'\w+', user_input.lower()))
    best_match = None
    highest_overlap = 0
    for question, response in predefined_responses.items():
        question_words = set(re.findall(r'\w+', question))
        overlap = len(user_words & question_words)
        if overlap > highest_overlap:
            highest_overlap = overlap
            best_match = response
    return best_match

def get_gpt_response(user_input):
    program_keywords = ["program", "code", "turnover", "bot", "function", "language", "library", "python", "integer", "variable", "java", "programming", "syntax", "algorithm","plugin", "loop", "class", "object", "method", "Module", "framework", "compiler", "interpreter", "debugger ", "IDE", "API", "database", "server", "client", "frontend", "backend", "web", "app", "software", "hardware", "computer", "network", "security", "cybersecurity", "encryption", "decryption", "authentication", "authorization", "access", "permission", "firewall", "router", "switch", "protocol", "IP", "TCP", "UDP", "HTTP", "HTTPS", "FTP", "SSH", "SSL", "TLS", "DNS", "DHCP", "VPN", "sql", "meta", "llama", "Claude", "Gemini", "chatgpt", "openai", "AI", "api", "technology", "nlp", "chat-gpt", "chat gpt"]

    if any(keyword in user_input.lower() for keyword in program_keywords):
        return "I'm sorry; my developers would kill me if I answered this question 🤪. Did you know they have all the logs of our conversations, and they check them every day. You can ask me anything about our products or services, and I will help you with it."
    
    if user_input.lower().strip() in ["hi", "hello", "hey"]:
        return "Alloo 🤩, I'm Chattu an AI chatbot. If you have any questions feel free to ping me here ma. Note sometimes my responses may not always be accurate. Kindly continue your chat in English for a fulfilling experience.❤️"
    
    if user_input.lower().strip() in ["who are you", "what are you"]:
        return "I'm an AI assistant here to help you with your queries about our products and services. How can I assist you?"
    
    logging.info(f"Fetching response from GPT-4 for input: {user_input}")
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": user_input}
            ],
            max_tokens=150
        )
        gpt_response = response['choices'][0]['message']['content'].strip()
        logging.info(f"GPT-4 response: {gpt_response}")
        return gpt_response
    except Exception as e:
        logging.error(f"Failed to get response from GPT-4. Error: {e}")
        return "I'm sorry, but your query seems to be out of context. Please contact our customer service for more assistance."

def synthesize_speech(text, lang):
    try:
        tts = gTTS(text=text, lang=lang, slow=False)
        audio_file = BytesIO()
        tts.write_to_fp(audio_file)
        audio_file.seek(0)
        logging.info("Synthesized speech successfully.")
        return audio_file.read()
    except Exception as e:
        logging.error(f"Failed to synthesize speech. Error: {e}")
        return None

def save_audio_to_server(audio_data):
    try:
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3", dir="audio_files")
        temp_file.write(audio_data)
        temp_file.close()
        audio_url = f"{current_app.config['SITE_URL']}/audio/{os.path.basename(temp_file.name)}"
        logging.info(f"Audio file saved to server at URL: {audio_url}")
        return audio_url
    except Exception as e:
        logging.error(f"Failed to save audio to server. Error: {e}")
        return None

def detect_language(text):
    lang, _ = langid.classify(text)
    return lang