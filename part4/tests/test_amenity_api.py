from app import create_app
import unittest
import sys
import os
import uuid
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


class TestAmenityEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        # Create a user to act as the owner of the amenity
        email = f"unittest_{uuid.uuid4().hex}@example.com"
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Unit",
            "last_name": "Test",
            "email": email,
            "password": "StrongPass1!"
        })
        self.assertEqual(response.status_code, 201)
        self.owner_id = response.get_json()["id"]

        place_resp = self.client.post('/api/v1/places/', json={
            "title": "Test Place",
            "description": "Cozy spot",
            "price": 120.0,
            "latitude": 33.7,
            "longitude": 151.1,
            "owner_id": self.owner_id
        })
        self.assertEqual(place_resp.status_code, 201)
        self.place_id = place_resp.get_json()["id"]

    def valid_amenity_payload(self, **overrides):
        """Return a valid amenity payload, with optional field overrides"""
        data = {
            "name": "Wi-Fi",
            "description": "High-speed internet",
            "number": 5,
            "owner_id": self.owner_id,
            "place_id": self.place_id
        }
        data.update(overrides)
        return data

    def test_create_amenity_valid(self):
        """Creating a valid amenity should return 201"""
        response = self.client.post(
            '/api/v1/amenities/', json=self.valid_amenity_payload())
        self.assertEqual(response.status_code, 201)
        self.assertIn("id", response.get_json())

    def test_create_amenity_empty_name(self):
        """Empty name field should return 400"""
        response = self.client.post(
            '/api/v1/amenities/', json=self.valid_amenity_payload(name="   "))
        self.assertEqual(response.status_code, 400)

    def test_create_amenity_missing_description(self):
        """Missing description field should return 400"""
        payload = self.valid_amenity_payload()
        payload.pop("description")
        response = self.client.post('/api/v1/amenities/', json=payload)
        self.assertEqual(response.status_code, 400)

    def test_create_amenity_number_not_int(self):
        """Non-integer number field should return 400"""
        response = self.client.post(
            '/api/v1/amenities/', json=self.valid_amenity_payload(number="five"))
        self.assertEqual(response.status_code, 400)

    def test_get_all_amenities(self):
        """GET request should return a list of amenities"""
        # First insert one amenity
        self.client.post('/api/v1/amenities/',
                         json=self.valid_amenity_payload())
        response = self.client.get('/api/v1/amenities/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.get_json(), list)

    def test_create_amenity_not_owner(self):
        """Should return 403 if user is not owner of the place"""
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Fake",
            "last_name": "Owner",
            "email": f"fake_{uuid.uuid4().hex}@example.com",
            "password": "AnotherStrong1!"
        })
        self.assertEqual(response.status_code, 201)
        fake_user_id = response.get_json()["id"]

        response = self.client.post(
            '/api/v1/amenities/', json=self.valid_amenity_payload(owner_id=fake_user_id))
        self.assertEqual(response.status_code, 403)

    def test_create_amenity_invalid_place(self):
        """Should return 400 if place_id does not exist"""
        response = self.client.post(
            '/api/v1/amenities/', json=self.valid_amenity_payload(place_id="non-existent-id"))
        self.assertEqual(response.status_code, 400)


if __name__ == '__main__':
    unittest.main()


# python3 -m tests.test_amenity_api -v
