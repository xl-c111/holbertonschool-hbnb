import unittest
import uuid
from app import create_app, db
from config import TestingConfig

class TestReviewAPI(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestingConfig)
        self.app.app_context().push()
        db.create_all()
        self.client = self.app.test_client()

        # Register main user
        self.email = f"test_{uuid.uuid4().hex[:6]}@example.com"
        self.password = "TestPassword1!"
        resp = self.client.post("/api/v1/users/", json={
            "first_name": "Main",
            "last_name": "User",
            "email": self.email,
            "password": self.password
        })
        self.user_id = resp.get_json()["id"]

        # Login
        login = self.client.post("/api/v1/auth/login", json={
            "email": self.email,
            "password": self.password
        })
        self.token = login.get_json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

        # Create place owned by current user
        place_resp = self.client.post("/api/v1/places/", json={
            "title": "My Place",
            "description": "Test place",
            "price": 200,
            "latitude": 1.0,
            "longitude": 1.0,
            "owner_id": self.user_id
        }, headers=self.headers)
        self.my_place_id = place_resp.get_json()["id"]

        # Register another user
        self.email2 = f"other_{uuid.uuid4().hex[:6]}@example.com"
        self.password2 = "OtherPassword1!"
        resp2 = self.client.post("/api/v1/users/", json={
            "first_name": "Other",
            "last_name": "User",
            "email": self.email2,
            "password": self.password2
        })
        self.other_user_id = resp2.get_json()["id"]

        # Login other user
        login2 = self.client.post("/api/v1/auth/login", json={
            "email": self.email2,
            "password": self.password2
        })
        self.token2 = login2.get_json()["access_token"]
        self.headers2 = {"Authorization": f"Bearer {self.token2}"}

        # Create place owned by other user
        other_place = self.client.post("/api/v1/places/", json={
            "title": "Other Place",
            "description": "Nice place",
            "price": 150,
            "latitude": 2.0,
            "longitude": 2.0,
            "owner_id": self.other_user_id
        }, headers=self.headers2)
        self.other_place_id = other_place.get_json()["id"]

    def _review_payload(self, user_id=None, place_id=None):
        return {
            "text": "Great place!",
            "rating": 5,
            "user_id": user_id or self.user_id,
            "place_id": place_id or self.other_place_id
        }

    def test_review_other_user_place_success(self):
        resp = self.client.post("/api/v1/reviews/", json=self._review_payload(), headers=self.headers)
        self.assertEqual(resp.status_code, 201)

    def test_cannot_review_own_place(self):
        payload = self._review_payload(place_id=self.my_place_id)
        resp = self.client.post("/api/v1/reviews/", json=payload, headers=self.headers)
        self.assertEqual(resp.status_code, 400)

    def test_cannot_review_same_place_twice(self):
        self.client.post("/api/v1/reviews/", json=self._review_payload(), headers=self.headers)
        resp = self.client.post("/api/v1/reviews/", json=self._review_payload(), headers=self.headers)
        self.assertEqual(resp.status_code, 400)

    def test_unauthenticated_user_cannot_review(self):
        resp = self.client.post("/api/v1/reviews/", json=self._review_payload())
        self.assertEqual(resp.status_code, 401)

    def test_user_id_mismatch_in_payload(self):
        payload = self._review_payload(user_id=self.other_user_id)
        resp = self.client.post("/api/v1/reviews/", json=payload, headers=self.headers)
        self.assertEqual(resp.status_code, 403)

    def test_update_review_success(self):
  
        review = self.client.post("/api/v1/reviews/", json=self._review_payload(), headers=self.headers)
        print("POST review status:", review.status_code)
        print("POST review json:", review.get_json())
        review_id = review.get_json()["id"]
        updated_payload = {
            "text": "Updated review text",
            "rating": 4
        }
        resp = self.client.put(f"/api/v1/reviews/{review_id}", json=updated_payload, headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.get_json()["text"], "Updated review text")

    def test_update_review_unauthenticated(self):

        review = self.client.post("/api/v1/reviews/", json=self._review_payload(), headers=self.headers)
        review_id = review.get_json()["id"]
        updated_payload = {
            "text": "Malicious update",
            "rating": 1
        }
        resp = self.client.put(f"/api/v1/reviews/{review_id}", json=updated_payload)
        self.assertEqual(resp.status_code, 401)



if __name__ == "__main__":
    unittest.main()



# python3 -m tests.test_review_api -v
