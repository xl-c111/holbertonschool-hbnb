import uuid

from app.extensions import db
from app.models.place import Place


def test_owner_can_attach_and_detach_amenity(client, app, create_place, create_amenity):
    created = create_place()
    place = created["place"]
    owner = created["owner"]
    amenity = create_amenity(creator=owner)["amenity"]

    attach = client.post(
        f"/api/v1/places/{place['id']}/amenities/{amenity['id']}",
        headers=owner["headers"],
    )
    assert attach.status_code == 201

    with app.app_context():
        db_place = db.session.get(Place, place["id"])
        assert amenity["id"] in {a.id for a in db_place.amenities}

    detach = client.delete(
        f"/api/v1/places/{place['id']}/amenities/{amenity['id']}",
        headers=owner["headers"],
    )
    assert detach.status_code == 200

    with app.app_context():
        db_place = db.session.get(Place, place["id"])
        assert amenity["id"] not in {a.id for a in db_place.amenities}


def test_cannot_attach_with_invalid_ids(client, register_user):
    user = register_user()
    fake_place = str(uuid.uuid4())
    fake_amenity = str(uuid.uuid4())

    response = client.post(
        f"/api/v1/places/{fake_place}/amenities/{fake_amenity}",
        headers=user["headers"],
    )
    assert response.status_code == 404


def test_only_owner_can_attach_amenity(client, create_place, create_amenity, register_user):
    created = create_place()
    place = created["place"]
    owner = created["owner"]

    amenity = create_amenity()["amenity"]

    other_user = register_user()

    response = client.post(
        f"/api/v1/places/{place['id']}/amenities/{amenity['id']}",
        headers=other_user["headers"],
    )

    assert response.status_code == 403
