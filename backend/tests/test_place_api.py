import pytest


def _place_payload(**overrides):
    data = {
        "title": "Nice Apartment",
        "description": "Cozy and quiet.",
        "price": 100.0,
        "latitude": 45.0,
        "longitude": 120.0,
    }
    data.update(overrides)
    return data


def test_create_place_requires_auth(client):
    response = client.post("/api/v1/places/", json=_place_payload())
    assert response.status_code == 401


def test_create_place_success(client, register_user):
    owner = register_user()

    response = client.post(
        "/api/v1/places/",
        headers=owner["headers"],
        json=_place_payload(),
    )

    assert response.status_code == 201
    assert response.get_json()["title"] == "Nice Apartment"


@pytest.mark.parametrize("field,value", [
    ("title", ""),
    ("price", 0),
    ("price", -5),
    ("latitude", -91),
    ("latitude", 91),
    ("longitude", -181),
    ("longitude", 181),
])
def test_create_place_validation_errors(client, register_user, field, value):
    owner = register_user()
    payload = _place_payload()
    payload[field] = value

    response = client.post(
        "/api/v1/places/",
        headers=owner["headers"],
        json=payload,
    )

    assert response.status_code == 400
