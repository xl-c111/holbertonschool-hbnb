import pytest


def _review_payload(place_id, **overrides):
    data = {
        "text": "Great place!",
        "rating": 5,
        "place_id": place_id,
    }
    data.update(overrides)
    return data


def test_user_can_review_other_users_place(client, create_place, register_user):
    created = create_place()
    place = created["place"]

    reviewer = register_user()

    response = client.post(
        "/api/v1/reviews/",
        headers=reviewer["headers"],
        json=_review_payload(place["id"]),
    )

    assert response.status_code == 201


def test_user_cannot_review_own_place(client, create_place):
    created = create_place()
    place = created["place"]
    owner = created["owner"]

    response = client.post(
        "/api/v1/reviews/",
        headers=owner["headers"],
        json=_review_payload(place["id"]),
    )

    assert response.status_code == 400


def test_user_cannot_review_same_place_twice(client, create_place, register_user):
    created = create_place()
    place = created["place"]

    reviewer = register_user()
    payload = _review_payload(place["id"])

    first = client.post(
        "/api/v1/reviews/",
        headers=reviewer["headers"],
        json=payload,
    )
    assert first.status_code == 201

    second = client.post(
        "/api/v1/reviews/",
        headers=reviewer["headers"],
        json=payload,
    )
    assert second.status_code == 400


def test_unauthenticated_user_cannot_review(client, create_place):
    place = create_place()["place"]

    response = client.post("/api/v1/reviews/", json=_review_payload(place["id"]))
    assert response.status_code == 401


def test_update_review_success(client, create_place, register_user):
    created = create_place()
    place = created["place"]

    reviewer = register_user()
    review_resp = client.post(
        "/api/v1/reviews/",
        headers=reviewer["headers"],
        json=_review_payload(place["id"]),
    )
    review_id = review_resp.get_json()["id"]

    update = client.put(
        f"/api/v1/reviews/{review_id}",
        headers=reviewer["headers"],
        json={"text": "Updated", "rating": 4},
    )

    assert update.status_code == 200
    assert update.get_json()["text"] == "Updated"


def test_update_review_requires_auth(client, create_place, register_user):
    created = create_place()
    place = created["place"]

    reviewer = register_user()
    review_resp = client.post(
        "/api/v1/reviews/",
        headers=reviewer["headers"],
        json=_review_payload(place["id"]),
    )
    review_id = review_resp.get_json()["id"]

    response = client.put(
        f"/api/v1/reviews/{review_id}",
        json={"text": "Bad", "rating": 1},
    )

    assert response.status_code == 401


def test_update_review_forbidden_for_other_users(client, create_place, register_user):
    created = create_place()
    place = created["place"]

    reviewer = register_user()
    other_user = register_user()

    review_resp = client.post(
        "/api/v1/reviews/",
        headers=reviewer["headers"],
        json=_review_payload(place["id"]),
    )
    review_id = review_resp.get_json()["id"]

    response = client.put(
        f"/api/v1/reviews/{review_id}",
        headers=other_user["headers"],
        json={"text": "Hijacked", "rating": 1},
    )

    assert response.status_code == 403
