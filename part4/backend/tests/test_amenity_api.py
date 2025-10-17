import pytest


def _amenity_payload(**overrides):
    data = {
        "name": "Wi-Fi",
        "description": "High-speed internet",
        "number": 5,
    }
    data.update(overrides)
    return data


def test_create_amenity_requires_authentication(client):
    response = client.post("/api/v1/amenities/", json=_amenity_payload())
    assert response.status_code == 401


def test_create_amenity_success(client, register_user):
    creator = register_user()

    response = client.post(
        "/api/v1/amenities/",
        headers=creator["headers"],
        json=_amenity_payload(),
    )

    assert response.status_code == 201
    body = response.get_json()
    assert body["name"] == "Wi-Fi"


@pytest.mark.parametrize(
    "payload",
    [
        {"name": "   ", "description": "desc", "number": 1},
        {"name": "Wi-Fi", "description": "", "number": 1},
        {"name": "Wi-Fi", "description": "desc", "number": "five"},
    ],
)
def test_create_amenity_validation_errors(client, register_user, payload):
    creator = register_user()

    response = client.post(
        "/api/v1/amenities/",
        headers=creator["headers"],
        json=payload,
    )

    assert response.status_code == 400


def test_list_amenities_returns_created_items(client, create_amenity):
    create_amenity(name="Wi-Fi")
    create_amenity(name="Pool")

    response = client.get("/api/v1/amenities/")

    assert response.status_code == 200
    names = {item["name"] for item in response.get_json()}
    assert {"Wi-Fi", "Pool"}.issubset(names)
