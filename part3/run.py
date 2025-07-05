from app import create_app
from app.extensions import db
import mysql.connector


def create_database_if_not_exists():
    config = {
        'user': 'root',
        'password': 1234,
        'host': 'localhost'
    }
    try:
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS hbnb")
        print("Database 'hbnb' is ready.")

    except mysql.connector.Error as e:
        print("{}".format(e))

    finally:
        cursor.close()
        connection.close()


# step 1: ensure the target database exists
create_database_if_not_exists()

# step 2: initialize the Flask application instance
app = create_app()

# step 3: create all database tables with the app context
with app.app_context():
    db.drop_all()
    db.create_all()
    print("Tables created.")


if __name__ == '__main__':
    app.run(debug=True)
