from flask import Flask, make_response, request, jsonify
from routes.auth_routes import auth_bp
from routes.messageRoutes import message_bp
from routes.tenant_routes import tenant_bp
from utils.db import init_db
import os
from dotenv import load_dotenv
from flask_cors import CORS
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config.from_object('config')

# Initialize CORS with more specific settings
CORS(app, resources={r"/*": {"origins": ["http://127.0.0.1:5500", "http://localhost:5500", "http://192.168.47.221"], "supports_credentials": True}})

# Initialize database
try:
    init_db(app)
    # Ensure the audio_files directory exists
    os.makedirs('audio_files', exist_ok=True)
except Exception as e:
    logger.error("An error occurred during initialization:", exc_info=True)

# Register blueprints
app.register_blueprint(message_bp, url_prefix='/api')
app.register_blueprint(tenant_bp, url_prefix='/tenant')

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

@app.after_request
def after_request(response):
    # Remove any existing Access-Control-Allow-Origin headers
    response.headers.pop('Access-Control-Allow-Origin', None)
    
    # Set the Access-Control-Allow-Origin header based on the request origin
    origin = request.headers.get('Origin')
    if origin in ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://192.168.47.221']:
        response.headers.add('Access-Control-Allow-Origin', origin)
    
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

@app.route('/')
def index():
    return "Welcome to the Multi-Tenant Webhook Application!"

@app.errorhandler(500)
def internal_server_error(error):
    logger.error('Server Error: %s', str(error))
    return jsonify(error="Internal Server Error"), 500

@app.errorhandler(404)
def not_found_error(error):
    logger.error('Not Found: %s', str(error))
    return jsonify(error="Not Found"), 404

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=80, debug=True)