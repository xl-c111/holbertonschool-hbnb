# HBnB - BL and API

## Directory Structure
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

      - **users.py, places.py, reviews.py, amenities.py**  
        Define API routes and logic for users, places, reviews, and amenities.

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

List the dependencies in `requirements.txt`:
flask
flask-restx


Install the dependencies using:
```
pip install -r requirements.txt
```
## Run the Application
```
python3 run.py
```
The API will be available at [http://127.0.0.1:5000/](http://127.0.0.1:5000/).




