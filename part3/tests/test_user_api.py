from app import create_app
import unittest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


class TestUserEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_create_user(self):
        """Valid user creation should return 201"""
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane.doe@example.com"
        })
        self.assertEqual(response.status_code, 201)

    def test_create_user_first_name_empty(self):
        """Empty first_name should return 400"""
        response = self.client.post('/api/v1/users/', json={
            "first_name": "",
            "last_name": "Doe",
            "email": "jane.doe@example.com"
        })
        self.assertEqual(response.status_code, 400)

    def test_create_user_last_name_empty(self):
        """Empty last_name should return 400"""
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "",
            "email": "jane.doe@example.com"
        })
        self.assertEqual(response.status_code, 400)

    def test_create_user_email_empty(self):
        """Empty email should return 400"""
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": ""
        })
        self.assertEqual(response.status_code, 400)

    def test_create_user_email_invalid(self):
        """Invalid email format should return 400"""
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "invalid-email"
        })
        self.assertEqual(response.status_code, 400)

    def test_create_user_all_empty(self):
        """All fields empty should return 400"""
        response = self.client.post('/api/v1/users/', json={
            "first_name": "",
            "last_name": "",
            "email": ""
        })
        self.assertEqual(response.status_code, 400)


if __name__ == '__main__':
    unittest.main()


# python3 -m tests.test_user_api -v
