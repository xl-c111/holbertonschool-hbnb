from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

def test_sqlalchemy_connection():
    try:
        print("Testing SQLAlchemy connection...")

        # Replace with your actual credentials
        DATABASE_URL = 'mysql+mysqlconnector://hbnb_user:1234@localhost/hbnb_db'

        engine = create_engine(DATABASE_URL)

        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("SQLAlchemy connection successful!")
            print(f"Test query result: {result.fetchone()}")

    except SQLAlchemyError as e:
        print(f"SQLAlchemy connection failed: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    test_sqlalchemy_connection()