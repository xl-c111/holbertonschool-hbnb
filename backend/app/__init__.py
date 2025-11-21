from flask import Flask
from flask_restx import Api
from config import DevelopmentConfig
from app.extensions import db, bcrypt, jwt
from app.api.v1.users import api as users_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.places import api as places_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.auth import api as auth_ns
from app.api.v1.bookings import api as bookings_ns
from app.api.v1.payments import api as payments_ns
import os
from dotenv import load_dotenv
from flask_cors import CORS

# Load environment variables
load_dotenv()


def create_app(config_class="config.DevelopmentConfig"):
    app = Flask(__name__,
                static_folder='../base_files',
                static_url_path=''
                )
    app.config.from_object(config_class)

    # initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)

    # Configure CORS - Allow all origins in development
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Configure authorization for Swagger UI
    authorizations = {
        'Bearer Auth': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': "Type in the *'Value'* input box below: **'Bearer &lt;JWT&gt;'**, where JWT is the token from /api/v1/auth/login"
        }
    }

    # register API namespace
    api = Api(
        app,
        version='1.0',
        title='HBnB API',
        description='HBnB - Luxury Property Rental Platform API\n\n'
                    'Complete REST API for property listings, bookings, reviews, and payments.\n\n'
                    '**Authentication:** Most endpoints require JWT authentication. '
                    'Use /api/v1/auth/login to get your access token, then click "Authorize" button above.',
        authorizations=authorizations,
        security='Bearer Auth',
        doc='/doc'  # Swagger UI available at /doc
    )
    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(auth_ns, path='/api/v1/auth')
    api.add_namespace(bookings_ns, path='/api/v1/bookings')
    api.add_namespace(payments_ns, path='/api/v1/payments')

    return app
