from flask_restx import Namespace, Resource, fields
from app.services import facade

# create a Namesapce, groups all user-related routes together
api = Namespace('users', description='User operations')

# Define the user model for input validation and documentation
user_model = api.model('User', {
    'first_name': fields.String(required=True, description='First name of the user'),
    'last_name': fields.String(required=True, description='Last name of the user'),
    'email': fields.String(required=True, description='Email of the user')
})


@api.route('/')
class UserList(Resource):
    # tell API this method excepts a request body matching user_model schema and validate it automatically
    @api.expect(user_model, validate=True)
    # declare a 201 response for successful creation
    @api.response(201, 'User successfully created')
    @api.response(400, 'Email already registered')
    @api.response(400, 'Invalid input data')
    # define a POST method
    def post(self):
        """Register a new user"""
        # api.payload parses user's request(JSON data) into Python dict and stores it user_data
        user_data = api.payload

        # Simulate email uniqueness check (to be replaced by real validation with persistence)
        # use the facade method to check if the email is registered
        existing_user = facade.get_user_by_email(user_data['email'])
        if existing_user:
            return {'error': 'Email already registered'}, 400

        # use facade method to create a new user and get the obj
        new_user = facade.create_user(user_data)
        return {'id': new_user.id, 'first_name': new_user.first_name, 'last_name': new_user.last_name, 'email': new_user.email}, 201

    @api.response(200, 'List of users retrieved successfully')
    # define a GET method for the route'/', used to rerieve all users' info
    def get(self):
        # call facade method get_all_users() method to retrieve a list of users' obj
        users = facade.get_all_users()
        if not users:
            return [], 200
        # initialize an empty list to store all users' info in dict format
        user_list = []
        # loop through all user objs just retrieved
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

    @api.expect(user_model, validate=True)
    @api.response(200, 'User updated successfully')
    @api.response(400, 'Invalid input data')
    @api.response(404, 'User not found')
    # define a PUT method used to update user info with given user_id
    def put(self, user_id):
        # look up the user obj b user_id and store it in user
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        # parse user's update request(update info in JSON format) into python dict and store it to update_data
        update_data = api.payload

        # check if the new email in the request is already registered to other user
        existing_user = facade.get_user_by_email(update_data['email'])
        if existing_user and existing_user.id != user.id:
            return {'error': 'Email already registered by another user'}, 400

        # call update_user() method from facade, updates the specific info with new data and return a updated user obj
        updated_user = facade.update_user(user_id, update_data)
        return {
            'id': updated_user.id,
            'first_name': updated_user.first_name,
            'last_name': updated_user.last_name,
            'email': updated_user.email
        }, 200
