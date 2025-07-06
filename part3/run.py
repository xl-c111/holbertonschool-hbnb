from app import create_app
from app.extensions import db
import mysql.connector
import os
from dotenv import load_dotenv


load_dotenv()


def create_database_if_not_exists():
    config = {
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', ''),
        'host': os.getenv('DB_HOST', 'localhost'),
    }
    db_name = os.getenv('DB_NAME', 'hbnb_db')
    try:
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        print(f"Database '{db_name}' is ready.")

    except mysql.connector.Error as e:
        print(f"MySQL Error: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()


# step 1: ensure the target database exists
create_database_if_not_exists()

# step 2: initialize the Flask application instance
app = create_app()

# step 3: create all database tables with the app context
with app.app_context():
    # db.drop_all()
    db.create_all()
    print("Tables created.")


if __name__ == '__main__':
    app.run(debug=True)
