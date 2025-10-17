import os
import tempfile
import uuid

import pytest

from app import create_app
from app.extensions import db


def _unique_email(prefix="user"):
    return f"{prefix}_{uuid.uuid4().hex[:10]}@example.com"


@pytest.fixture()
def app():
    """Create a fresh Flask app + database per test."""
    db_fd, db_path = tempfile.mkstemp()
    app = create_app("config.TestingConfig")
    app.config.update(
        SQLALCHEMY_DATABASE_URI=f"sqlite:///{db_path}",
        SQLALCHEMY_ENGINE_OPTIONS={"connect_args": {"check_same_thread": False}},
        JWT_SECRET_KEY="test-secret",
        BCRYPT_LOG_ROUNDS=4,
    )

    with app.app_context():
        db.create_all()

    yield app

    with app.app_context():
        db.session.remove()
        db.drop_all()

    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture()
def client(app):
    """Return a Flask test client."""
    return app.test_client()


@pytest.fixture()
def register_user(client):
    """Create a user through the API and return helpers."""

    def _register(**overrides):
        payload = {
            "first_name": overrides.get("first_name", "Test"),
            "last_name": overrides.get("last_name", "User"),
            "email": overrides.get("email", _unique_email()),
            "password": overrides.get("password", "Password1!"),
        }
        response = client.post("/api/v1/users/", json=payload)
        assert response.status_code == 201, response.get_json()
        user_id = response.get_json()["id"]

        login_resp = client.post(
            "/api/v1/auth/login",
            json={"email": payload["email"], "password": payload["password"]},
        )
        assert login_resp.status_code == 200, login_resp.get_json()
        token = login_resp.get_json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        return {
            "id": user_id,
            "email": payload["email"],
            "password": payload["password"],
            "token": token,
            "headers": headers,
        }

    return _register


@pytest.fixture()
def create_place(client, register_user):
    """Create a place owned by a user via the API."""

    def _create(owner=None, **overrides):
        owner = owner or register_user()
        payload = {
            "title": overrides.get("title", "Cozy Spot"),
            "description": overrides.get("description", "Perfect hideout"),
            "price": overrides.get("price", 150.0),
            "latitude": overrides.get("latitude", 40.7128),
            "longitude": overrides.get("longitude", -74.0060),
        }
        response = client.post(
            "/api/v1/places/", headers=owner["headers"], json=payload
        )
        assert response.status_code == 201, response.get_json()
        return {"place": response.get_json(), "owner": owner}

    return _create


@pytest.fixture()
def create_amenity(client, register_user):
    """Create an amenity through the API."""

    def _create(creator=None, **overrides):
        creator = creator or register_user()
        payload = {
            "name": overrides.get("name", "Wi-Fi"),
            "description": overrides.get("description", "Fast connection"),
            "number": overrides.get("number", 1),
        }
        response = client.post(
            "/api/v1/amenities/", headers=creator["headers"], json=payload
        )
        assert response.status_code == 201, response.get_json()
        return {
            "amenity": response.get_json(),
            "user": creator,
        }

    return _create
