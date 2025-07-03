from flask import Flask
from flask_restx import Api
from app.api.v1.users import api as users_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.places import api as places_ns
from app.api.v1.amenities import api as amenities_ns
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()  # Create the SQLAlchemy object


def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:1234@localhost/hbnb'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    api = Api(app, version='1.0', title='HBnB API',
              description='HBnB Application API')

    # Register the users namespace
    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')

    return app
