# HBnB - BL and API

## Directory Structure
```
hbnb/
├── app/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │       ├── __init__.py
│   │       ├── users.py
│   │       ├── places.py
│   │       ├── reviews.py
│   │       ├── amenities.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── place.py
│   │   ├── review.py
│   │   ├── amenity.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── facade.py
│   ├── persistence/
│       ├── __init__.py
│       ├── repository.py
├── run.py
├── config.py
├── requirements.txt
├── README.md
```
## Directory and File Purpose

- **app/**
  Core application package containing all major modules.

  - **app/__init__.py**
    Initializes the Flask app and sets up blueprints.

  - **app/api/**
    Contains the RESTful API endpoints, organized by version.

    - **app/api/__init__.py**
      Initializes the API subpackage.

    - **app/api/v1/**
      Version 1 of the API endpoints.

      - **users.py**
         Defines API endpoints for user operations such as creating, retrieving, updating, and deleting users.

         **Endpoints:**
        - `POST /api/v1/users/`: Registers a new user and performs a check for email uniqueness.
        - `GET /api/v1/users/<user_id>`: Retrieves user details by ID.

        **Example: user JSON Payload**
         ```json
        {
        "first_name": "Alice",
        "last_name": "Smith",
        "email": "alice@example.com"
        }
        ```
        **Example curl:**
        ```bash
        curl -X POST http://127.0.0.1:5000/api/v1/users/ \
        -H "Content-Type: application/json" \
        -d '{"first_name": "Alice", "last_name": "Smith", "email": "alice@example.com"}'
        ```

      - **places.py**
        Handles API routes for managing places, including creation, retrieval, updating, and deletion of place records.

        **Endpoints:**
        - `POST /api/v1/places/`: Register a new place.
        - `GET /api/v1/places/`: Return a list of all places.
        - `GET /api/v1/places/<place_id>`: Retrieve details of a specific place, including its associated owner and amenities.
        - `PUT /api/v1/places/<place_id>`: Update place information.

        **Example: place JSON Payload**
        ```json
        {
        "id": "1fa85f64-5717-4562-b3fc-2c963f66afa6",
        "title": "Cozy Apartment",
        "description": "A nice place to stay",
        "price": 100.0,
        "latitude": 37.7749,
        "longitude": -122.4194,
        "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
        }
        ```
        **Example curl:**

        ```bash
        curl -X POST http://127.0.0.1:5000/api/v1/place/ \
        -H "Content-Type: application/json" \
        -d '{
        "title": "Cozy Apartment",
        "description": "A nice place to stay",
        "price": 100.0,
        "latitude": 37.7749,
        "longitude": -122.4194,
        "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
        }'
        ```

      - **reviews.py**
        Implements API endpoints for reviews, allowing users to add, view, update, and delete reviews for places.

        **Endpoints:**
        - `POST /api/v1/reviews/`: Register a new review.
        - `GET /api/v1/reviews/`: Return a list of all reviews.
        - `GET /api/v1/reviews/<review_id>`: Retrieve details of a specific review.
        - `GET /api/v1/places/<place_id>/reviews`: Retrieve all reviews for a specific place.
        - `PUT /api/v1/reviews/<review_id>`: Update a review’s information.
        - `DELETE /api/v1/reviews/<review_id>`: Delete a review.

        **Example: review JSON Payload**
        ```json
        {
        "id": "2fa85f64-5717-4562-b3fc-2c963f66afa6",
        "text": "Great place to stay!",
        "rating": 5,
        "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "place_id": "1fa85f64-5717-4562-b3fc-2c963f66afa6"
         }
        ```
        **Example curl:**

        ```bash
        curl -X POST http://127.0.0.1:5000/api/v1/review/ \
        -H "Content-Type: application/json" \
        -d '{
          "text": "Great place to stay!",
          "rating": 5,
          "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "place_id": "1fa85f64-5717-4562-b3fc-2c963f66afa6"
        }'

        ```

      - **amenities.py**
        Provides API routes for amenities, supporting operations to create, list, update, and remove amenities associated with places.

        **Endpoints:**
        - `POST /api/v1/amenities/`: Register a new amenity.
        - `GET /api/v1/amenities/`: Retrieve a list of all amenities.
        - `GET /api/v1/amenities/<amenity_id>`: Get amenity details by ID.
        - `PUT /api/v1/amenities/<amenity_id>`: Update an amenity's information.

        **Example: amenity JSON Payload**
        ```json
        {
        "id": "1fa85f64-5717-4562-b3fc-2c963f66afa6",
        "name": "Wi-Fi"
        }
        ```
        **Example curl:**

        ```bash
        ### Create an amenity
        curl -X POST http://127.0.0.1:5000/api/v1/amenities/ \
        -H "Content-Type: application/json" \
        -d '{
        "name": "WiFi",
        "description": "High-speed wireless internet access",
        "number": 10,
        "place_id": "123e4567-e89b-12d3-a456-426614174000"
        }'
        ```


  - **app/models/**
    Business logic classes (domain models).

    - **user.py, place.py, review.py, amenity.py**
      Define the main data models.

  - **app/services/**
    Service layer that implements the Facade pattern.

    - **facade.py**
      Bridges API endpoints and underlying models/repositories.

  - **app/persistence/**
    Data access and storage layer using an in-memory repository.

    - **repository.py**
      Implements in-memory data storage (to be replaced by a database solution later).

- **run.py**
  Entry point for running the Flask application.

- **config.py**
  Application and environment configuration settings.

- **requirements.txt**
  Lists all required Python packages.

- **README.md**
  Project overview and setup instructions.

---

## Install Required Packages

- **List the dependencies in `requirements.txt`:**
```
flask
flask-restx
```
- **Install the dependencies using:**
```
pip install -r requirements.txt
```
## Run the Application
```
python3 run.py
```
The API will be available at [http://127.0.0.1:5000/](http://127.0.0.1:5000/).



