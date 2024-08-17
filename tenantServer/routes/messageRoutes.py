from flask import Blueprint, request, send_from_directory
from controllers.messageController import verify_webhook, handle_incoming_messages

message_bp = Blueprint('message', __name__)

@message_bp.route('/webhook', methods=['GET', 'POST'])
def webhook():
    if request.method == 'GET':
        return verify_webhook()
    elif request.method == 'POST':
        return handle_incoming_messages()

@message_bp.route('/audio/<filename>')
def serve_audio(filename):
    return send_from_directory('audio_files', filename)