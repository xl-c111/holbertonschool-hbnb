from flask_restx import Namespace, Resource, fields
from app.services import facade
from flask_jwt_extended import jwt_required, get_jwt_identity

api = Namespace('users', description='User operations')

# Define the user model for input validation and documentation
user_model = api.model('User', {
    'first_name': fields.String(required=True, description='First name of the user'),
    'last_name': fields.String(required=True, description='Last name of the user'),
    'email': fields.String(required=True, description='Email of the user'),
    'password': fields.String(required=True, description='Password of the user', min_length=8)
})

user_update_model = api.model('UserUpdate', {
    'first_name': fields.String(required=False, description='First name'),
    'last_name': fields.String(required=False, description='Last name')
})

@api.route('/')
class UserList(Resource):
    @api.expect(user_model, validate=True)
    # declare a 201 response for successful creation
    @api.response(201, 'User successfully created')
    @api.response(400, 'Email already registered')
    @api.response(400, 'Invalid input data')
    # define a POST method
    def post(self):
        """Register a new user"""
        user_data = api.payload
        existing_user = facade.get_user_by_email(user_data['email'])
        if existing_user:
            return {'error': 'Email already registered'}, 400
        try:
            new_user = facade.create_user(user_data)
            return {'id': new_user.id,
                    'message': 'User registered successfully.'
                    }, 201
        except ValueError as e:
            return {'error': str(e)}, 400

    @api.response(200, 'List of users retrieved successfully')
    def get(self):
        users = facade.get_all_users()
        if not users:
            return [], 200
        user_list = []
        for user in users:
            # extract key info from each user obj, create a dict and append it to user_list
            user_list.append({
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email
            })
        return user_list, 200


@api.route('/<user_id>')
class UserResource(Resource):
    @api.response(200, 'User details retrieved successfully')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """Get user details by ID"""
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        return {'id': user.id, 'first_name': user.first_name, 'last_name': user.last_name, 'email': user.email}, 200

    @jwt_required()
    @api.expect(user_update_model, validate=True)
    @api.response(200, 'User updated successfully')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Unauthorized action')
    @api.response(404, 'User not found')
    def put(self, user_id):
        """update user info by ID"""
        identity = get_jwt_identity()
        current_user_id = identity.get('id')

        if user_id != current_user_id:
            return {'error': 'Unauthorized action'}, 403
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        
        update_data = api.payload

        if 'email' in update_data or 'password' in update_data:
            return {'error': 'You cannot modify email or password.'}, 400

        updated_user = facade.update_user(user_id, update_data)
        return {
            'id': updated_user.id,
            'first_name': updated_user.first_name,
            'last_name': updated_user.last_name,
            'email': updated_user.email
        }, 200
    
    @jwt_required()
    @api.response(200, 'User deleted successfully')
    @api.response(403, 'Unauthorized action')
    @api.response(404, 'User not found')
    def delete(self, user_id):
        """Delete a user by ID"""
        identity = get_jwt_identity()
        current_user_id = identity.get('id')

        user = facade.get_user(user_id)
        if str(user_id).strip() != str(current_user_id).strip():
            return {'error': 'Unauthorized action'}, 403
        if not user:
            return {"error": "User not found"}, 404
        try:
            result = facade.delete_user(user_id)
            return {"message": "User deleted successfully"}, 200
        except Exception as e:
            return {"error": str(e)}, 400
