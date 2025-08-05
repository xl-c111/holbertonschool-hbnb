# Testing Process Log

## 1. Endpoints and Models Tested

- **API Endpoints**
  - `/api/v1/users/` &nbsp; *User creation*
  - `/api/v1/places/` &nbsp; *Place creation*
  - `/api/v1/reviews/` &nbsp; *Review creation*
- **Model Unit Tests**
  - `Amenity`
  - `Place`
  - `User`

---

## 2. Input Data Used

### a) User API

| Test Case             | Input Example                                                                                  |
|-----------------------|-----------------------------------------------------------------------------------------------|
| Valid User            | `{ "first_name": "Jane", "last_name": "Doe", "email": "jane.doe@example.com" }`              |
| Empty `first_name`    | `{ "first_name": "", "last_name": "Doe", "email": "jane.doe@example.com" }`                  |
| Empty `last_name`     | `{ "first_name": "Jane", "last_name": "", "email": "jane.doe@example.com" }`                 |
| Empty `email`         | `{ "first_name": "Jane", "last_name": "Doe", "email": "" }`                                  |
| Invalid `email`       | `{ "first_name": "Jane", "last_name": "Doe", "email": "invalid-email" }`                     |
| All fields empty      | `{ "first_name": "", "last_name": "", "email": "" }`                                         |

### b) Place API

| Test Case                | Input Example (with a valid `owner_id`)                                                                              |
|--------------------------|----------------------------------------------------------------------------------------------------------------------|
| Valid Place              | `{ "title": "Nice Apartment", "description": "Cozy", "price": 100, "latitude": 45, "longitude": 120, "owner_id": "<uuid>" }` |
| Empty `title`            | `{ ... "title": "", ... }`                                                                                           |
| Non-positive `price`     | `{ ... "price": 0, ... }`, `{ ... "price": -10, ... }`                                                              |
| Latitude out of bounds   | `{ ... "latitude": -91, ... }`, `{ ... "latitude": 91, ... }`                                                       |
| Longitude out of bounds  | `{ ... "longitude": -181, ... }`, `{ ... "longitude": 181, ... }`                                                   |

### c) Review API

| Test Case                  | Input Example (with valid/invalid `user_id`/`place_id`)                                      |
|----------------------------|----------------------------------------------------------------------------------------------|
| Valid Review               | `{ "text": "Great place!", "rating": 5, "user_id": "<valid user_id>", "place_id": "<valid place_id>" }` |
| Empty `text`               | `{ "text": "", "rating": 5, "user_id": "<valid user_id>", "place_id": "<valid place_id>" }`  |
| Invalid `user_id`          | `{ "text": "Nice", "rating": 5, "user_id": "non-existent", "place_id": "<valid place_id>" }` |
| Invalid `place_id`         | `{ "text": "Nice", "rating": 5, "user_id": "<valid user_id>", "place_id": "non-existent" }`  |

### d) Model Unit Tests

```python
# Amenity creation
amenity = Amenity(name="Wi-Fi")
assert amenity.name == "Wi-Fi"

# Place creation and relationship
owner = User(first_name="Alice", last_name="Smith", email="alice.smith@example.com", is_admin=False)
place = Place(title="Cozy Apartment", description="A nice place to stay", price=100, latitude=37.7749, longitude=-122.4194, owner=owner)
review = Review(text="Great stay!", rating=5, place=place, user=owner)
place.add_review(review)
assert place.title == "Cozy Apartment"
assert place.price == 100
assert len(place.reviews) == 1
assert place.reviews[0].text == "Great stay!"

# User creation
user = User(first_name="John", last_name="Doe", email="john.doe@example.com", is_admin=False)
assert user.first_name == "John"
assert user.last_name == "Doe"
assert user.email == "john.doe@example.com"
assert user.is_admin == False
```
---

## 3. Expected Output vs. Actual Output

### API Tests

| Endpoint  | Test Case              | Expected Output          | Actual Output (after fix) | Issues?                            |
|-----------|-----------------------|--------------------------|--------------------------|-------------------------------------|
| User      | Valid                 | 201 Created              | 201 Created              | None                                |
| User      | Invalid field/empty   | 400 Bad Request          | 400 Bad Request          | None                                |
| Place     | Valid                 | 201 Created              | 201 Created              | None                                |
| Place     | Invalid field/empty   | 400 Bad Request          | 400 Bad Request          | None                                |
| Review    | Valid                 | 201 Created              | 201 Created              | None                                |
| Review    | Invalid field/empty   | 400 or 404 (logic)       | 400 or 404               | 500 (before try/except was added)   |

### Model Unit Tests

| Test                        | Expected Output              | Actual Output   | Issues |
|-----------------------------|-----------------------------|-----------------|--------|
| Amenity creation            | Amenity fields correct      | Passed          | None   |
| Place creation/relationship | Fields and reviews correct  | Passed          | None   |
| User creation               | User fields correct         | Passed          | None   |

---

## 4. Issues Encountered and Solutions

- **Missing required fields** in test payloads caused errors and HTTP 500.  
  _Solution:_ Added all required fields to test input.
- **Validation errors not handled** in API endpoints led to HTTP 500.  
  _Solution:_ Wrapped endpoint logic in `try/except` to return proper 400/404 responses.
- **Duplicate user email** in tests caused creation to fail with 400.  
  _Solution:_ Each test generates a unique email using UUID.
- **Invalid user_id/place_id in reviews** initially returned 500.  
  _Solution:_ Handled as 400/404 after fixing endpoint error handling.
- **Model Unit Tests:** All passed as expected with no issues.

---

## 5. Sample Output (Model Tests)

```
Amenity creation test passed!
Place creation and relationship test passed!
User creation test passed!
```
---

## Summary

- All major endpoints and core model logic have been tested for both valid and invalid input.
- API tests required careful input construction and robust error handling in endpoints.
- Model tests confirm object creation and relationships work as intended.
- All tests now pass and the system is robust to input errors and edge cases.

---

> **This document summarizes the test coverage, input data, expected and actual results, and solutions to issues encountered during testing.**
