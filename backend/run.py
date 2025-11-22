from app import create_app
from app.extensions import db
import mysql.connector
import os
from dotenv import load_dotenv


load_dotenv()


def create_database_if_not_exists():
    """Optional helper to bootstrap a local database when explicitly requested."""
    config = {
        'user': os.getenv('DB_USER', 'hbnb_user'),
        'password': os.getenv('DB_PASSWORD', '1234'),
        'host': os.getenv('DB_HOST', 'localhost'),
    }
    db_name = os.getenv('DB_NAME', 'hbnb_db')
    try:
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
    except mysql.connector.Error as e:
        # Surface the error rather than failing silently
        raise RuntimeError(f"MySQL error while ensuring database exists: {e}") from e
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()


def build_app():
    """Create the Flask application based on environment selection."""
    flask_env = os.getenv('FLASK_ENV', 'development')
    config_class = "config.ProductionConfig" if flask_env == 'production' else "config.DevelopmentConfig"
    return create_app(config_class)


def maybe_prepare_database(app):
    """
    For local dev only: optionally create the database and tables.
    Controlled via HBNB_CREATE_DB_ON_STARTUP=true.
    """
    if os.getenv("HBNB_CREATE_DB_ON_STARTUP", "false").lower() != "true":
        return
    create_database_if_not_exists()
    with app.app_context():
        db.create_all()


# Create app instance for gunicorn
app = build_app()


def main():
    app = build_app()
    maybe_prepare_database(app)
    app.run(debug=app.config.get("DEBUG", False))


if __name__ == '__main__':
    main()
