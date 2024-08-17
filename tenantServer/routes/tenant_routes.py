from flask import Blueprint
from controllers.tenant_controller import create_tenant, login, add_user

tenant_bp = Blueprint('tenant', __name__)

@tenant_bp.route('/', methods=['POST'])
def create():
    return create_tenant()

@tenant_bp.route('/login', methods=['POST'])
def tenant_login():
    return login()

@tenant_bp.route('/add-user', methods=['POST'])
def tenant_add_user():
    return add_user()