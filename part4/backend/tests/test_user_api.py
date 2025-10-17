import uuid

import pytest


@pytest.mark.parametrize(
    "payload,status",
    [
        ({"first_name": "Jane", "last_name": "Doe", "email": "jane@example.com", "password": "StrongPass1!"}, 201),
        ({"first_name": "", "last_name": "Doe", "email": "jane2@example.com", "password": "StrongPass1!"}, 400),
        ({"first_name": "Jane", "last_name": "", "email": "jane3@example.com", "password": "StrongPass1!"}, 400),
        ({"first_name": "Jane", "last_name": "Doe", "email": "", "password": "StrongPass1!"}, 400),
        ({"first_name": "Jane", "last_name": "Doe", "email": "invalid-email", "password": "StrongPass1!"}, 400),
        ({"first_name": "", "last_name": "", "email": "", "password": ""}, 400),
    ],
)
def test_user_registration_validation(client, payload, status):
    data = dict(payload)
    if status == 201:
        data["email"] = f"user_{uuid.uuid4().hex[:6]}@example.com"

    response = client.post("/api/v1/users/", json=data)
    assert response.status_code == status


def test_user_can_update_own_profile(client, register_user):
    user = register_user()

    response = client.put(
        f"/api/v1/users/{user['id']}",
        headers=user["headers"],
        json={"first_name": "Updated"},
    )

    assert response.status_code == 200
    assert response.get_json()["first_name"] == "Updated"


def test_user_cannot_update_other_user(client, register_user):
    user_one = register_user()
    user_two = register_user()

    response = client.put(
        f"/api/v1/users/{user_one['id']}",
        headers=user_two["headers"],
        json={"first_name": "Hacked"},
    )

    assert response.status_code == 403
    assert "Unauthorized" in response.get_json()["error"]


@pytest.mark.parametrize("field", ["email", "password"])
def test_user_cannot_update_email_or_password(client, register_user, field):
    user = register_user()
    payload = {field: "new@example.com" if field == "email" else "NewPass123!"}

    response = client.put(
        f"/api/v1/users/{user['id']}",
        headers=user["headers"],
        json=payload,
    )

    assert response.status_code == 400
    assert "cannot modify" in response.get_json()["error"].lower()
