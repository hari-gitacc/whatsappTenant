from flask import request, jsonify
from models.user import User
from utils.auth import generate_token, hash_password

def register_user():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    tenant_id = data.get('tenant_id')
    role = data.get('role', 'user')

    if User.find_by_email(email):
        return jsonify({'message': 'User already exists'}), 400

    hashed_password = hash_password(password)
    user = User(email=email, password=hashed_password, name=name, tenant_id=tenant_id, role=role)
    user.save()

    token = generate_token(user.id)
    return jsonify({'token': token, 'user_id': str(user.id)}), 201

def login_user():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.find_by_email(email)
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid credentials'}), 401

    token = generate_token(user.id)
    return jsonify({'token': token, 'user_id': str(user.id)}), 200