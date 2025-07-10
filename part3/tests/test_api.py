import requests

url = "http://127.0.0.1:5000/api/v1/amenities/"
data = {
    "name": "Wi-Fi",
    "description": "Free wireless internet access",
    "number": 1,
    "place_id": "741ecf07-0ba2-4047-9d68-738a4abb4fce"
}

response = requests.post(url, json=data)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
