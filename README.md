# HBnB Evolution

Full-stack rental platform with Flask + SQLAlchemy + MySQL backend and vanilla HTML/CSS/JS frontend. Features JWT authentication, layered architecture, and production-ready patterns.

---

## Quick Start

1. **Database**
   ```bash
   # Start MySQL
   brew services start mysql
   mysql -u root

   # Inside MySQL prompt:
   CREATE USER IF NOT EXISTS 'hbnb_user'@'localhost' IDENTIFIED BY '1234';
   GRANT ALL PRIVILEGES ON *.* TO 'hbnb_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;

   # Import schema
   mysql -u root < docs/hbnb_db.sql
   ```

2. **Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python3 ../scripts/add_sample_data.py  # Add test data
   python3 run.py                          # Start API at http://127.0.0.1:5000
   ```

3. **Frontend**
   ```bash
   cd frontend
   python3 -m http.server 3000
   # Visit http://localhost:3000
   ```

---

## Testing Guide for Interviewers

**Demo Accounts:**
- **Alice**: `alice@example.com` / `Password123!` (owns Haunted Mansion + Mysterious Castle)
- **Bob**: `bob@example.com` / `Password123!` (owns Ghostly Cottage + Cozy Beach House)

**Test Flow:**
1. **Browse** - Open `http://localhost:3000` → see 4 places without login → filter by price
2. **Register** - Click "Login" → "Register here" → create account (password needs uppercase, lowercase, number, special char)
3. **Login** - Use demo account or your new account
4. **Review** - View a place you don't own → click "Share Your Supernatural Experience" → submit review (rating 1-5)
5. **Business Rules** - Try reviewing your own place (blocked) → try duplicate review (blocked)

---

## Key Features
- JWT auth + bcrypt password hashing
- Public browsing (view places without login) + authenticated reviews
- Layered architecture (models → repositories → services → API namespaces)
- Business rules: no self-reviews, one review per user/place, owner/admin-only updates
- Interactive API docs at `http://127.0.0.1:5000/api/v1/`

## Running Tests
```bash
cd backend && python3 -m pytest -v
```
Uses in-memory SQLite (no MySQL needed). Tests cover auth, users, places, amenities, reviews, and business rules.

## Project Structure

```
backend/         # Flask API with SQLAlchemy + MySQL
frontend/        # Static HTML/CSS/JS client
docs/            # Database schema and documentation
scripts/         # Setup and utility scripts
```

## Troubleshooting
- **Reset DB**: `mysql -u root < docs/hbnb_db.sql && python3 scripts/add_sample_data.py`
- **Free port**: `lsof -ti:5000 | xargs kill -9`

**Authors:** Xiaoling Cui & Wawa
