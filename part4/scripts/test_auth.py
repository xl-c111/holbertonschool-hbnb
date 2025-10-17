#!/usr/bin/env python3
"""Test authentication logic"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000/api/v1"

print("=" * 60)
print("TESTING AUTHENTICATION LOGIC")
print("=" * 60)

# Test 1: Valid login with Alice
print("\n1. Testing login with Alice (valid credentials)...")
response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": "alice@example.com", "password": "Password123!"}
)
print(f"   Status: {response.status_code}")
print(f"   Response: {response.json()}")
if response.status_code == 200 and 'access_token' in response.json():
    alice_token = response.json()['access_token']
    print("   ✅ Login successful!")
else:
    print("   ❌ Login failed!")
    alice_token = None

# Test 2: Invalid password
print("\n2. Testing login with wrong password...")
response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": "alice@example.com", "password": "WrongPassword"}
)
print(f"   Status: {response.status_code}")
print(f"   Response: {response.json()}")
if response.status_code == 401:
    print("   ✅ Correctly rejected invalid password!")
else:
    print("   ❌ Should have rejected invalid password!")

# Test 3: Non-existent user
print("\n3. Testing login with non-existent user...")
response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": "nobody@example.com", "password": "Password123!"}
)
print(f"   Status: {response.status_code}")
print(f"   Response: {response.json()}")
if response.status_code == 401:
    print("   ✅ Correctly rejected non-existent user!")
else:
    print("   ❌ Should have rejected non-existent user!")

# Test 4: Valid login with Bob
print("\n4. Testing login with Bob (valid credentials)...")
response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": "bob@example.com", "password": "Password123!"}
)
print(f"   Status: {response.status_code}")
print(f"   Response: {response.json()}")
if response.status_code == 200 and 'access_token' in response.json():
    bob_token = response.json()['access_token']
    print("   ✅ Login successful!")
else:
    print("   ❌ Login failed!")
    bob_token = None

# Test 5: Use JWT token to access protected endpoint
if alice_token:
    print("\n5. Testing JWT token with protected endpoint (get places)...")
    response = requests.get(
        f"{BASE_URL}/places/",
        headers={"Authorization": f"Bearer {alice_token}"}
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        places = response.json()
        print(f"   ✅ JWT token works! Found {len(places)} places")
        for place in places:
            print(f"      - {place['title']}")
    else:
        print("   ❌ JWT token failed!")

# Test 6: Try to access protected endpoint without token
print("\n6. Testing protected endpoint without token...")
response = requests.get(f"{BASE_URL}/places/")
print(f"   Status: {response.status_code}")
if response.status_code == 401:
    print("   ✅ Correctly rejected request without token!")
else:
    print("   ❌ Should have rejected request without token!")

# Test 7: Test JWT identity is correct (string user_id)
if bob_token:
    print("\n7. Testing review submission with Bob's token...")
    # First, get a place ID owned by Alice
    response = requests.get(
        f"{BASE_URL}/places/",
        headers={"Authorization": f"Bearer {bob_token}"}
    )
    places = response.json()
    alice_place = None
    for place in places:
        # Get place details to check owner
        detail_response = requests.get(
            f"{BASE_URL}/places/{place['id']}",
            headers={"Authorization": f"Bearer {bob_token}"}
        )
        place_detail = detail_response.json()
        # Find a place not owned by Bob
        if place_detail.get('title') in ['Haunted Mansion', 'Mysterious Castle']:
            alice_place = place['id']
            print(f"   Found Alice's place: {place_detail['title']}")
            break

    if alice_place:
        # Try to submit a review
        response = requests.post(
            f"{BASE_URL}/reviews/",
            headers={"Authorization": f"Bearer {bob_token}"},
            json={
                "place_id": alice_place,
                "text": "Great place! Very spooky!",
                "rating": 5
            }
        )
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        if response.status_code == 201:
            print("   ✅ Review submission works! JWT identity is correct!")
        elif response.status_code == 400 and "already reviewed" in str(response.json()):
            print("   ✅ JWT works (review already exists)!")
        else:
            print(f"   ❌ Review submission failed: {response.json()}")

print("\n" + "=" * 60)
print("AUTHENTICATION TEST COMPLETE")
print("=" * 60)
