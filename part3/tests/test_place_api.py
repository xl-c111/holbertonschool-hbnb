from app import create_app
import unittest
import sys
import os
import uuid
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


class TestPlaceEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        email = f"unittest_{uuid.uuid4().hex}@example.com"
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Unit",
            "last_name": "Test",
            "email": email
        })
        print("User create status:", response.status_code)
        print("User create response:", response.get_json())
        self.assertEqual(response.status_code, 201)
        self.owner_id = response.get_json()["id"]

    def valid_place_payload(self, **overrides):
        """Helper to get a valid payload, with option to override fields"""
        data = {
            "title": "Nice Apartment",
            "description": "Cozy and quiet.",
            "price": 100,
            "latitude": 45.0,
            "longitude": 120.0,
            "owner_id": self.owner_id
        }
        data.update(overrides)
        return data

    def test_create_place_valid(self):
        """Valid place creation should return 201"""
        response = self.client.post(
            '/api/v1/places/', json=self.valid_place_payload())
        self.assertEqual(response.status_code, 201)

    def test_create_place_title_empty(self):
        """Empty title should return 400"""
        response = self.client.post(
            '/api/v1/places/', json=self.valid_place_payload(title=""))
        self.assertEqual(response.status_code, 400)

    def test_create_place_price_not_positive(self):
        """Non-positive price should return 400"""
        response = self.client.post(
            '/api/v1/places/', json=self.valid_place_payload(price=0))
        self.assertEqual(response.status_code, 400)
        response = self.client.post(
            '/api/v1/places/', json=self.valid_place_payload(price=-5))
        self.assertEqual(response.status_code, 400)

    def test_create_place_latitude_out_of_bounds(self):
        """Latitude out of bounds should return 400"""
        response = self.client.post(
            '/api/v1/places/', json=self.valid_place_payload(latitude=-91))
        self.assertEqual(response.status_code, 400)
        response = self.client.post(
            '/api/v1/places/', json=self.valid_place_payload(latitude=91))
        self.assertEqual(response.status_code, 400)

    def test_create_place_longitude_out_of_bounds(self):
        """Longitude out of bounds should return 400"""
        response = self.client.post(
            '/api/v1/places/', json=self.valid_place_payload(longitude=-181))
        self.assertEqual(response.status_code, 400)
        response = self.client.post(
            '/api/v1/places/', json=self.valid_place_payload(longitude=181))
        self.assertEqual(response.status_code, 400)


if __name__ == '__main__':
    unittest.main()


# python3 -m tests.test_place_api -v
