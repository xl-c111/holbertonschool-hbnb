from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import create_access_token
from app.services import facade
from app.extensions import limiter



api = Namespace('auth', description='Authentication operations')

# Request models
login_model = api.model('Login', {
    'email': fields.String(required=True, description='User email address', example='john.doe@example.com'),
    'password': fields.String(required=True, description='User password (min 8 characters)', example='Strongpass123!')
})

# Response models
login_response = api.model('LoginResponse', {
    'access_token': fields.String(description='JWT access token', example='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
})

error_response = api.model('ErrorResponse', {
    'error': fields.String(description='Error message', example='Invalid credentials')
})

@api.route('/login')
class Login(Resource):
    @api.doc(
        description='Authenticate user and receive JWT token for protected endpoints',
        responses={
            200: ('Success', login_response),
            401: ('Invalid credentials', error_response),
            400: ('Missing required fields', error_response)
        }
    )
    @api.expect(login_model, validate=True)
    @api.marshal_with(login_response, code=200)
    @limiter.limit("5 per minute")
    def post(self):
        """Authenticate user and return a JWT token"""
        credentials = api.payload

        # Step 1: Retrieve the user based on the provided email
        user = facade.get_user_by_email(credentials['email'])

        # Step 2: Check if the user exists and the password is correct
        if not user or not user.verify_password(credentials['password']):
            return {'error': 'Invalid credentials'}, 401

        # Step 3: Create a JWT token with the user's id
        access_token = create_access_token(identity=str(user.id))

        # Step 4: Return the JWT token to the client
        return {'access_token': access_token}, 200
