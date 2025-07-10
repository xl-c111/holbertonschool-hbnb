import unittest
import uuid
import json
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions import db
from app.models.user import User

class TestUserEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app("config.TestingConfig")
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

        self.email = f"jane_{uuid.uuid4().hex[:8]}@example.com"
        self.password = "StrongPass1!"

        self.register_data = {
            "first_name": "Jane",
            "last_name": "Doe",
            "email": self.email,
            "password": self.password
        }

        self.login_data = {
            "email": self.email,
            "password": self.password
        }

        self.client.post("/api/v1/users/", json=self.register_data)
        login_response = self.client.post("/api/v1/auth/login", json=self.login_data)
        self.token = login_response.get_json()["access_token"]

        with self.app.app_context():
            self.user = User.query.filter_by(email=self.email).first()
            self.user_id = str(self.user.id)

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def auth_header(self):
        return {"Authorization": f"Bearer {self.token}"}

    # ✅ User registration validation tests

    def test_create_user_valid(self):
        email = f"jane_{uuid.uuid4().hex[:8]}@example.com"
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": email,
            "password": "StrongPass1!"
        })
        self.assertEqual(response.status_code, 201)

    def test_create_user_first_name_empty(self):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "",
            "last_name": "Doe",
            "email": "jane2@example.com",
            "password": "StrongPass1!"
        })
        self.assertEqual(response.status_code, 400)

    def test_create_user_last_name_empty(self):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "",
            "email": "jane3@example.com",
            "password": "StrongPass1!"
        })
        self.assertEqual(response.status_code, 400)

    def test_create_user_email_empty(self):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "",
            "password": "StrongPass1!"
        })
        self.assertEqual(response.status_code, 400)

    def test_create_user_email_invalid(self):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "invalid-email",
            "password": "StrongPass1!"
        })
        self.assertEqual(response.status_code, 400)

    def test_create_user_all_empty(self):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "",
            "last_name": "",
            "email": "",
            "password": ""
        })
        self.assertEqual(response.status_code, 400)

    # ✅ User update permission tests

    def test_modify_self_success(self):
        response = self.client.put(f"/api/v1/users/{self.user_id}",
                                   headers=self.auth_header(),
                                   json={"first_name": "Updated Jane"})
        self.assertEqual(response.status_code, 201)
        self.assertIn("Updated Jane", response.get_data(as_text=True))

    def test_modify_other_user_should_fail(self):
        fake_id = "00000000-0000-0000-0000-000000000999"
        response = self.client.put(f"/api/v1/users/{fake_id}",
                                   headers=self.auth_header(),
                                   json={"first_name": "Hacked"})
        self.assertEqual(response.status_code, 403)
        self.assertIn("Unauthorized action", response.get_data(as_text=True))

    def test_modify_email_should_fail(self):
        response = self.client.put(f"/api/v1/users/{self.user_id}",
                                   headers=self.auth_header(),
                                   json={"email": "new@email.com"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("You cannot modify email or password", response.get_data(as_text=True))

    def test_modify_password_should_fail(self):
        response = self.client.put(f"/api/v1/users/{self.user_id}",
                                   headers=self.auth_header(),
                                   json={"password": "NewPass123!"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("You cannot modify email or password", response.get_data(as_text=True))

if __name__ == '__main__':
    unittest.main()

# python3 -m tests.test_user_api -v
