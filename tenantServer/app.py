from flask import Flask, send_from_directory, request, jsonify
from routes.messageRoutes import message_bp
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from message_controller import handle_incoming_messages
from bson import ObjectId
import os

app = Flask(__name__)
app.secret_key = 'security_key'
CORS(app)

# Ensure the audio_files directory exists
os.makedirs('audio_files', exist_ok=True)

# Connect to MongoDB
client = MongoClient("mongodb+srv://techvaseegrah:kL5RvAyrOQBVFQAc@cluster0.pbjj6kp.mongodb.net/whatsapp_commerce?retryWrites=true&w=majority&appName=Cluster0")
db = client['whatsapp_commerce']
users_collection = db['users']

app.register_blueprint(message_bp, url_prefix='/api')

@app.route('/')
def index():
    return "Welcome to the Multi-Tenant Webhook Application!"

@app.route('/audio/<filename>')
def serve_audio(filename):
    return send_from_directory('audio_files', filename)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Check if user already exists
    if users_collection.find_one({"email": data['email']}):
        return jsonify({"error": "User already exists"}), 400

    # Hash the password before storing it
    hashed_password = generate_password_hash(data['password'], method='sha256')

    # Create a new user document
    user = {
        "email": data['email'],
        "password": hashed_password,
        "whatsapp_number": data.get('whatsappNumber'),
        "access_token": data.get('accessToken'),
        "verify_token": data.get('verifyToken')
    }

    # Insert the user document into MongoDB
    users_collection.insert_one(user)

    return jsonify({"message": "User registered successfully!"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # Find the user by email
    user = users_collection.find_one({"email": data['email']})

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if the password matches
    if not check_password_hash(user['password'], data['password']):
        return jsonify({"error": "Invalid password"}), 401

    # Return user data (except the password)
    user_data = {
        "email": user['email'],
        "whatsapp_number": user.get('whatsapp_number'),
        "access_token": user.get('access_token'),
        "verify_token": user.get('verify_token')
    }

    return jsonify(user_data), 200

@app.route('/webhook', methods=['GET', 'POST'])
def webhook():
    tenant_id = request.args.get('tenant_id')
    tenant = users_collection.find_one({"_id": ObjectId(tenant_id)})
    if not tenant:
        return "Invalid tenant", 400

    if request.method == 'GET':
        return verify_webhook(tenant)
    elif request.method == 'POST':
        incoming_msg = request.get_json()
        result = handle_incoming_messages(tenant, incoming_msg)
        return jsonify(result), 200

def verify_webhook(tenant):
    mode = request.args.get('hub.mode')
    token = request.args.get('hub.verify_token')
    challenge = request.args.get('hub.challenge')

    if mode and token:
        if mode == 'subscribe' and token == tenant['verify_token']:
            return challenge, 200
        else:
            return "Verification token mismatch", 403
    return "Verification failed", 400

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=80)