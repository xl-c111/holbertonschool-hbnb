import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')
    DEBUG = False


class DevelopmentConfig(Config):
    DEBUG = True


config = {
    'development': DevelopmentConfig,
    'default': DevelopmentConfig
}

app = Flask(__name__)  # <-- Create the Flask app

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:1234@localhost/hbnb'
db = SQLAlchemy(app)