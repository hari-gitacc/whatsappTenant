from flask import request, jsonify
from models.tenant import Tenant
from models.user import User
import requests
import bcrypt

def create_tenant():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    whatsapp_number_id = data.get('whatsapp_number_id')
    access_token = data.get('access_token')
    verify_token = data.get('verify_token')

    if not all([name, email, password, whatsapp_number_id, access_token, verify_token]):
        return jsonify({"message": "All fields are required"}), 400

    try:
        # Validate WhatsApp credentials
        test_url = f"https://graph.facebook.com/v20.0/{whatsapp_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        response = requests.get(test_url, headers=headers)

        if response.status_code == 200:
            existing_tenant = Tenant.find_existing(email, whatsapp_number_id, access_token, verify_token)
            if existing_tenant:
                if existing_tenant.get('email') == email:
                    return jsonify({"message": "Email already exists"}), 400
                elif existing_tenant.get('whatsapp_number_id') == whatsapp_number_id:
                    return jsonify({"message": "WhatsApp Number ID already exists"}), 400
                elif existing_tenant.get('access_token') == access_token:
                    return jsonify({"message": "Access Token already exists"}), 400
                elif existing_tenant.get('verify_token') == verify_token:
                    return jsonify({"message": "Verify Token already exists"}), 400

            tenant = Tenant(name, email, password, whatsapp_number_id, access_token, verify_token)
            tenant.save()
            return jsonify(tenant.to_dict()), 201
        else:
            return jsonify({"message": "Invalid WhatsApp credentials"}), 400
    except Exception as e:
        print(f"Error saving tenant: {str(e)}")
        return jsonify({"message": "Internal Server Error"}), 500

def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    try:
        tenant = Tenant.find_by_email(email)
        user = User.find_by_email(email) if not tenant else None

        if not tenant and not user:
            return jsonify({"message": "Invalid credentials"}), 401

        if tenant:
            if bcrypt.checkpw(password.encode('utf-8'), tenant.password.encode('utf-8')):
                response = tenant.to_dict()
                response['role'] = 'tenant'
                return jsonify(response), 200
        elif user:
            if bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
                response = user.to_dict()
                tenant = Tenant.find_by_id(user.whatsapp_number_id)
                response['tenant'] = tenant.to_dict() if tenant else None
                return jsonify(response), 200

        return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        print(f"Error logging in: {str(e)}")
        return jsonify({"message": "Internal Server Error"}), 500

def add_user():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    whatsapp_number_id = data.get('whatsapp_number_id')

    if not all([name, email, password, whatsapp_number_id]):
        return jsonify({"message": "All fields are required"}), 400

    try:
        tenant = Tenant.find_by_id(whatsapp_number_id)
        if not tenant:
            return jsonify({"message": "Invalid WhatsApp Number ID"}), 400

        existing_user = User.find_by_email(email)
        if existing_user:
            return jsonify({"message": "User with this email already exists"}), 400

        new_user = User(name, email, password, whatsapp_number_id)
        new_user.save()

        return jsonify(new_user.to_dict()), 201
    except Exception as e:
        print(f"Error adding user: {str(e)}")
        return jsonify({"message": "Internal Server Error"}), 500

def get_users_by_tenant(whatsapp_number_id):
    try:
        users = User.find_by_tenant(whatsapp_number_id)
        return jsonify(users), 200
    except Exception as e:
        print(f"Error getting users: {str(e)}")
        return jsonify({"message": "Internal Server Error"}), 500