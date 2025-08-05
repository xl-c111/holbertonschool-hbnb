from flask import Flask
from flask_restx import Api
from config import DevelopmentConfig
from app.extensions import db, bcrypt, jwt
from app.api.v1.users import api as users_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.places import api as places_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.auth import api as auth_ns
import os
from dotenv import load_dotenv

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

    # register API namespace
    api = Api(app, version='1.0', title='HBnB API',
              description='HBnB Application API')
    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(auth_ns, path='/api/v1/auth')

    return app
