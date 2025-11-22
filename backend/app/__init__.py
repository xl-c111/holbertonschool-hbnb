from flask import Flask
from flask_restx import Api
from config import DevelopmentConfig
from app.extensions import db, bcrypt, jwt, limiter
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


def _is_production_config(config_class):
    if isinstance(config_class, str):
        return config_class.endswith("ProductionConfig")
    return getattr(config_class, "__name__", "") == "ProductionConfig"


def _validate_production_config(app):
    required_keys = ['SECRET_KEY', 'JWT_SECRET_KEY', 'SQLALCHEMY_DATABASE_URI']
    missing = [key for key in required_keys if not app.config.get(key)]
    if missing:
        missing_list = ", ".join(missing)
        raise RuntimeError(f"Missing required production settings: {missing_list}")


def create_app(config_class="config.DevelopmentConfig"):
    app = Flask(__name__,
                static_folder='../base_files',
                static_url_path=''
                )
    app.config.from_object(config_class)

    if _is_production_config(config_class):
        _validate_production_config(app)

    # initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    limiter.init_app(app)

    # Configure CORS - Allow frontend origin from config
    frontend_url = app.config.get('FRONTEND_URL', '*')
    CORS(app, resources={r"/api/*": {"origins": frontend_url}}, supports_credentials=True)

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

    @app.after_request
    def set_security_headers(response):
        response.headers.setdefault('X-Content-Type-Options', 'nosniff')
        response.headers.setdefault('X-Frame-Options', 'DENY')
        response.headers.setdefault('X-XSS-Protection', '1; mode=block')
        response.headers.setdefault('Referrer-Policy', 'no-referrer-when-downgrade')
        # Content-Security-Policy kept minimal; adjust if you add inline scripts/styles
        response.headers.setdefault('Content-Security-Policy', "default-src 'self'")
        return response

    return app
