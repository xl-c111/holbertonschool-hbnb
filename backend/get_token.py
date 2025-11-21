#!/usr/bin/env python3
"""
Quick script to get a JWT token for testing
Usage: python3 get_token.py
"""

import requests
import sys

API_URL = "http://localhost:5000"

# Test accounts from sample data
TEST_USERS = {
    "host": {
        "email": "john.doe@example.com",
        "password": "Strongpass123!",
        "name": "John Doe (Host)"
    },
    "guest": {
        "email": "emma.wilson@example.com",
        "password": "Strongpass123!",
        "name": "Emma Wilson (Guest)"
    },
    "host2": {
        "email": "sarah.chen@example.com",
        "password": "Strongpass123!",
        "name": "Sarah Chen (Host)"
    }
}

def get_token(email, password):
    """Get JWT token from API"""
    try:
        response = requests.post(
            f"{API_URL}/api/v1/auth/login",
            json={"email": email, "password": password}
        )

        if response.status_code == 200:
            return response.json()["access_token"]
        else:
            print(f"❌ Login failed: {response.json()}")
            return None
    except requests.exceptions.ConnectionError:
        print(f"❌ Could not connect to {API_URL}")
        print("   Make sure the backend is running: cd backend && python3 run.py")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def main():
    print("🔑 JWT Token Generator\n")
    print("Available test accounts:")
    for key, user in TEST_USERS.items():
        print(f"  {key}: {user['name']} ({user['email']})")

    print("\nSelect account (or press Enter for default host):")
    choice = input("> ").strip().lower() or "host"

    if choice not in TEST_USERS:
        print(f"Invalid choice. Using 'host' account.")
        choice = "host"

    user = TEST_USERS[choice]
    print(f"\n🔐 Logging in as {user['name']}...")

    token = get_token(user['email'], user['password'])

    if token:
        print("\n✅ Success! Your JWT token:\n")
        print(f"Bearer {token}\n")
        print("=" * 80)
        print("\n📋 Copy the full line above (including 'Bearer') to use in:")
        print("   - Swagger UI: Click 'Authorize' button")
        print("   - Postman: Authorization → Type: Bearer Token")
        print("   - curl: -H 'Authorization: Bearer TOKEN'\n")

        # Verify token works
        print("🧪 Testing token...")
        response = requests.get(
            f"{API_URL}/api/v1/users/me",
            headers={"Authorization": f"Bearer {token}"}
        )

        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ Token verified! Logged in as: {user_data['email']}\n")
        else:
            print("⚠️  Token generated but verification failed\n")
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
