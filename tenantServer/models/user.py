from utils.db import get_db
import bcrypt

db = get_db()

class User:
    def __init__(self, name, email, password, whatsapp_number_id):
        self.name = name
        self.email = email
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        self.role = "user"  # Always set to "user"
        self.whatsapp_number_id = whatsapp_number_id  # This is the tenant ID

    def save(self):
        db.users.insert_one(self.__dict__)

    @staticmethod
    def find_by_email(email):
        user_data = db.users.find_one({"email": email})
        return User(**user_data) if user_data else None

    def to_dict(self):
        return {
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "whatsapp_number_id": self.whatsapp_number_id
        }

    @staticmethod
    def find_by_tenant(whatsapp_number_id):
        users = db.users.find({"whatsapp_number_id": whatsapp_number_id})
        return [User(**user_data).to_dict() for user_data in users]