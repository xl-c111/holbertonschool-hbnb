import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")

    #  build database URI from environment variables
    DB_USER = os.getenv('DB_USER', 'hbnb_user')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '1234')
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_NAME = os.getenv('DB_NAME', 'hbnb_db')



class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')

    # Production security settings
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    # JWT settings
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', os.getenv('SECRET_KEY'))
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour

class TestingConfig(Config):
    TESTING = True
    DEBUG = True
    # Use in-memory SQLite for fast, isolated tests (no MySQL required)
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    BCRYPT_LOG_ROUNDS = 4  # Minimal rounds for testing (default is 12, very slow!)
    JWT_SECRET_KEY = "test-secret-key"
    SQLALCHEMY_TRACK_MODIFICATIONS = False