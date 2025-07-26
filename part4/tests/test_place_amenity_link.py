import unittest
import uuid
from app import create_app
from app.extensions import db
from app.models.place import Place
from app.models.amenity import Amenity
from app.models.user import User
from sqlalchemy import text
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


class TestPlaceAmenityAPI(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()

        email = f"user_{uuid.uuid4().hex}@example.com"
        user_resp = self.client.post('/api/v1/users/', json={
            "first_name": "Test",
            "last_name": "User",
            "email": email,
            "password": "StrongPass123!"
        })
        self.assertEqual(user_resp.status_code, 201)
        self.user_id = user_resp.get_json()["id"]

        place_resp = self.client.post('/api/v1/places/', json={
            "title": "Test Place",
            "description": "For testing",
            "price": 120.0,
            "latitude": -37.81,
            "longitude": 144.96,
            "owner_id": self.user_id
        })
        print("Place response:", place_resp.status_code, place_resp.get_json())
        self.assertEqual(place_resp.status_code, 201)
        self.place_id = place_resp.get_json()["id"]

        amenity_resp = self.client.post("/api/v1/amenities/", json={
            "name": "Wi-Fi",
            "description": "Fast and reliable",
            "number": 3,
            "place_id": self.place_id,
            "owner_id": self.user_id
        })
        print("Amenity response:", amenity_resp.status_code,
              amenity_resp.get_json())
        self.assertEqual(amenity_resp.status_code, 201)
        self.amenity_id = amenity_resp.get_json()["id"]

    def test_add_amenity_to_place_creates_association(self):
        resp = self.client.post(
            f"/api/v1/places/{self.place_id}/amenities/{self.amenity_id}")
        self.assertEqual(resp.status_code, 201)
        result = db.session.execute(
            text(
                "SELECT * FROM place_amenity WHERE place_id = :place_id AND amenity_id = :amenity_id"),
            {"place_id": self.place_id, "amenity_id": self.amenity_id}
        ).fetchone()
        self.assertIsNotNone(result)

    def test_delete_amenity_from_place_removes_association(self):
        self.client.post(
            f"/api/v1/places/{self.place_id}/amenities/{self.amenity_id}")
        resp = self.client.delete(
            f"/api/v1/places/{self.place_id}/amenities/{self.amenity_id}")
        self.assertEqual(resp.status_code, 200)
        result = db.session.execute(
            text(
                "SELECT * FROM place_amenity WHERE place_id = :place_id AND amenity_id = :amenity_id"),
            {"place_id": self.place_id, "amenity_id": self.amenity_id}
        ).fetchone()
        self.assertIsNone(result)

    def test_place_or_amenity_not_found(self):
        fake_id = str(uuid.uuid4())
        resp = self.client.post(
            f"/api/v1/places/{self.place_id}/amenities/{fake_id}")
        self.assertEqual(resp.status_code, 404)
        resp = self.client.post(
            f"/api/v1/places/{fake_id}/amenities/{self.amenity_id}")
        self.assertEqual(resp.status_code, 404)

    def test_unauthorized_addition(self):
        email2 = f"other_{uuid.uuid4().hex}@example.com"
        user_resp2 = self.client.post('/api/v1/users/', json={
            "first_name": "Other",
            "last_name": "User",
            "email": email2,
            "password": "OtherPass456!"
        })
        other_user_id = user_resp2.get_json()["id"]

        place_resp2 = self.client.post('/api/v1/places/', json={
            "title": "Other Place",
            "description": "No access",
            "price": 99.0,
            "owner_id": other_user_id
        })
        other_place_id = place_resp2.get_json()["id"]

        resp = self.client.post(
            f"/api/v1/places/{other_place_id}/amenities/{self.amenity_id}")
        self.assertEqual(resp.status_code, 404)


if __name__ == '__main__':
    unittest.main()


# python3 -m unittest tests.test_place_amenity_link
