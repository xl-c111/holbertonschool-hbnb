# 🏡 HBnB API Project

This project is a RESTful API backend for a simplified HBnB platform, allowing users to register, log in, and manage places, amenities, and reviews. It is built with **Flask**, **SQLAlchemy**, and uses **JWT** for secure authentication. The app follows a modular architecture with clear separation between routes, services, and persistence layers.

---

## ⚙️ Installation

> 🐳 **Note:** This project runs inside a **Docker container**. You **do not** need to manually create a Python virtual environment.

### 1. Start MySQL Service
Make sure the MySQL server is running:

```bash
sudo systemctl start mysql
```

### 2. Log in to MySQL as Root

```bash
mysql -u root -p
```

### 3. Create Database and User

Inside the MySQL prompt, execute the following:

```sql
DROP USER IF EXISTS 'hbnb_user'@'localhost';
CREATE USER 'hbnb_user'@'localhost' IDENTIFIED BY '1234';
ALTER USER 'hbnb_user'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON hbnb_db.* TO 'hbnb_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Initialize Database Schema

From the project root, run the SQL script to create the tables:

```bash
mysql -u root -p < hbnb_db.sql
```

### 5. Verify the Tables

```bash
mysql -u root -p -e "USE hbnb_db; SHOW TABLES;"
```

---

## ▶️ How to Run

Start the Flask application using the following command:

```bash
python3 run.py
```

By default, the API will be available at:  
`http://localhost:5000/api/v1/`

---

## 📡 API Routes (Coming Soon)

> This section will contain the full list of available API endpoints. For now, here are a few examples:

| Method | Endpoint                | Description            |
|--------|-------------------------|------------------------|
| POST   | `/api/v1/users/`        | Register a new user    |
| POST   | `/api/v1/auth/login`    | Login and get a token  |
| DELETE | `/api/v1/users/<id>`    | Delete a user (auth)   |
| GET    | `/api/v1/places/`       | List all places        |

More details will be added soon.

---

## 🗂️ Project Structure

<details>
<summary><strong>Click to expand</strong></summary>

```bash
holbertonschool-hbnb/
├── app/
│   ├── api/
│   │   └── v1/                     # Version 1 API endpoints
│   │       ├── users.py            # User-related routes (register, update, delete)
│   │       ├── auth.py             # Login, registration, JWT token generation
│   │       ├── places.py           # Place-related endpoints
│   │       ├── reviews.py          # Review-related endpoints
│   │       ├── amenities.py        # Amenity-related endpoints
│   │       └── __init__.py         # API namespace registration
│   ├── models/                     # SQLAlchemy ORM models
│   │   ├── user.py                 # User model
│   │   ├── place.py                # Place model
│   │   ├── review.py               # Review model
│   │   ├── amenity.py              # Amenity model
│   │   ├── place_amenity.py        # Many-to-many association between places and amenities
│   │   ├── baseclass.py            # Declarative base model class
│   │   └── __init__.py
│   ├── persistence/                # Repository layer: handles DB access
│   │   ├── user_repository.py      # Data access methods for User model
│   │   ├── review_repository.py    # Data access for Review model
│   │   ├── repository.py           # Base repository abstraction
│   │   └── __init__.py
│   ├── services/                   # Business logic/service layer
│   │   ├── facade.py               # Central API for business operations (create_user, delete_place, etc.)
│   │   └── __init__.py
│   ├── extensions.py               # Initializes Flask extensions (db, jwt, api)
│   └── __init__.py                 # App factory: defines create_app()
│
├── config.py                       # Loads app settings from environment variables
├── run.py                          # Entry point to run the Flask application
├── requirements.txt                # Project dependencies
├── .env                            # Environment variables (DB credentials, secret keys, etc.)
├── .gitignore                      # Git ignore rules
├── README.md                       # Project documentation
├── hbnb_db.sql                     # Optional SQL schema initialization script
├── connect_test.py                 # Simple script to test DB connectivity
└── tests/                          # Unit tests directory
```

</details>

---

## 👩‍💻 Author

**Xiaoling Cui**  
**Wawa Niampoung** 


---

