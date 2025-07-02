from app import create_app
import unittest
import sys
import os
import uuid
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


class TestReviewEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        # Create a user
        email = f"review_test_{uuid.uuid4().hex}@example.com"
        user_resp = self.client.post('/api/v1/users/', json={
            "first_name": "Review",
            "last_name": "Tester",
            "email": email
        })
        print("User create status:", user_resp.status_code)
        print("User create response:", user_resp.get_json())
        self.assertEqual(user_resp.status_code, 201)
        self.user_id = user_resp.get_json()["id"]

        # Create a place
        place_resp = self.client.post('/api/v1/places/', json={
            "title": "Review Place",
            "description": "Place for review test",
            "price": 80,
            "latitude": 30.0,
            "longitude": 120.0,
            "owner_id": self.user_id
        })
        print("Place create status:", place_resp.status_code)
        print("Place create response:", place_resp.get_json())
        self.assertEqual(place_resp.status_code, 201)
        self.place_id = place_resp.get_json()["id"]

    def valid_review_payload(self, **overrides):
        """Helper to get a valid review payload, with option to override fields"""
        data = {
            "text": "Great place!",
            "rating": 5,
            "user_id": self.user_id,
            "place_id": self.place_id
        }
        data.update(overrides)
        return data

    def test_create_review_valid(self):
        """Valid review creation should return 201"""
        response = self.client.post(
            '/api/v1/reviews/', json=self.valid_review_payload())
        self.assertEqual(response.status_code, 201)

    def test_create_review_text_empty(self):
        """Empty text should return 400"""
        response = self.client.post(
            '/api/v1/reviews/', json=self.valid_review_payload(text=""))
        self.assertEqual(response.status_code, 400)

    def test_create_review_invalid_user(self):
        """Non-existent user_id should return 400 or 404 depending on your API logic"""
        response = self.client.post(
            '/api/v1/reviews/', json=self.valid_review_payload(user_id="non-existent-user-id"))
        # Change to 404 if your API uses 404 for not found entities
        self.assertIn(response.status_code, [400, 404])

    def test_create_review_invalid_place(self):
        """Non-existent place_id should return 400 or 404 depending on your API logic"""
        response = self.client.post(
            '/api/v1/reviews/', json=self.valid_review_payload(place_id="non-existent-place-id"))
        # Change to 404 if your API uses 404 for not found entities
        self.assertIn(response.status_code, [400, 404])


if __name__ == '__main__':
    unittest.main()
