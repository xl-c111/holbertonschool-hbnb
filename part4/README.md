# HBnB - Holberton AirBnB Clone (Part 4)

A full-stack web application built with Flask (Python), MySQL, and vanilla JavaScript that simulates a property rental platform with user authentication, place listings, reviews, and amenities management.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Database Setup
```bash
mysql -u root -p
# In MySQL prompt:
CREATE USER IF NOT EXISTS 'hbnb_user'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON *.* TO 'hbnb_user'@'localhost';
EXIT;

# Import schema
mysql -u root -p < hbnb_db.sql
```

### Step 2: Start Backend
```bash
./setup_and_run.sh
```
Creates test users (Alice & Bob), sample places, and starts server on `http://127.0.0.1:5000`

**Login Credentials:**
- **Alice:** `alice@example.com` / `Password123!` (owns 2 places)
- **Bob:** `bob@example.com` / `Password123!` (owns 2 places)

### Step 3: Start Frontend
```bash
cd base_files && python3 -m http.server 8000
# Open: http://localhost:8000/login.html
```

### Testing Review Feature
1. Login as **Alice** → Review **Bob's places** (Ghostly Cottage, Cozy Beach House)
2. Try to review Alice's own place → Error: "Cannot review your own place"
3. Switch to **Bob** → Review **Alice's places** (Haunted Mansion, Mysterious Castle)

**Business Rules:**
- ❌ Cannot review your own places
- ❌ Cannot review the same place twice

---

## Tech Stack

**Backend:** Flask, SQLAlchemy, MySQL, JWT, Bcrypt
**Frontend:** HTML5, CSS3, Vanilla JavaScript
**Features:** User authentication, Place CRUD, Review system with business rules, Amenities management

## Key Features
- JWT-based authentication with bcrypt password hashing
- Review restrictions (no self-reviews, no duplicates)
- Place filtering by price range
- Many-to-many relationships (places ↔ amenities)
- 36+ unit tests with pytest

## Database Schema

5 tables: `users`, `places`, `reviews`, `amenities`, `place_amenity` (junction table)
- Foreign keys with CASCADE DELETE
- See `hbnb_db.sql` for complete schema
- See `ARCHITECTURE.md` for detailed ERD and system design

## API Documentation

**Swagger UI:** `http://127.0.0.1:5000/api/v1/` (when server is running)

**Key Endpoints:**
- `POST /api/v1/users/` - Register
- `POST /api/v1/auth/login` - Login (returns JWT)
- `GET /api/v1/places/` - List places
- `POST /api/v1/reviews/` - Submit review
- `GET /api/v1/places/<id>/reviews` - Get place reviews
 - `POST /api/v1/amenities/` - Create amenity (global)
 - `POST /api/v1/places/<place_id>/amenities/<amenity_id>` - Attach amenity to place (owner/admin only)
 - `DELETE /api/v1/places/<place_id>/amenities/<amenity_id>` - Detach amenity from place (owner/admin only)

## Testing

**Run unit tests:**
```bash
mysql -u hbnb_user -p1234 -e "CREATE DATABASE IF NOT EXISTS hbnb_db_test;"
python3 -m pytest tests/ -v
```
36+ tests covering user registration, authentication, places, reviews, and amenities.

## Troubleshooting

**Reset database:**
```bash
mysql -u root -p < hbnb_db.sql && python3 add_sample_data.py
```

**Port 5000 in use:**
```bash
lsof -ti:5000 | xargs kill -9
```

---

## Authors

**Xiaoling Cui & Wawa** - Holberton School HBnB Project

---

## For Interviewers

This project demonstrates:
- **Full-stack development:** Flask backend + vanilla JS frontend
- **Database design:** Normalized schema with foreign keys and many-to-many relationships
- **Authentication:** JWT + bcrypt password hashing
- **Business logic:** Review validation (no self-reviews, no duplicates)
- **Testing:** 36+ unit tests with pytest
- **Architecture:** MVC pattern with service/repository layers
- **Documentation:** Swagger API docs + architecture documentation

### Clean API Contracts (What to Expect)
- Requests exclude server-managed fields like `id` and `owner_id`.
- Amenity creation is global:
  - `POST /api/v1/amenities` body: `{ "name": "WiFi", "description": "Fast", "number": 1 }`
  - Attach/detach amenities to a place via:
    - `POST /api/v1/places/<place_id>/amenities/<amenity_id>` (JWT owner/admin required)
    - `DELETE /api/v1/places/<place_id>/amenities/<amenity_id>` (JWT owner/admin required)
- Reviews: the server injects `user_id` from JWT; clients send `{ text, rating, place_id }`.
