import uuid
from datetime import datetime
import re


class User:
    # a list of User objects
    users_db = []

    def __init__(self, first_name, last_name, email, password, is_admin=False):
        if first_name is None or last_name is None or email is None or is_admin is None:
            raise ValueError("Required attributes not specified!")
        self.id = str(uuid.uuid4())
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        # calls the method, handles the hashing and assigns the result to self.passowrd internally
        self.hash_password(password)
        self.is_admin = is_admin
        self.reviews = []
        self.places = []

    # --- password methods ---

    def hash_password(self, password):
        from app import bcrypt
        """Hashes the password before storing it."""
        # there is no return, this method returns None
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def verify_password(self, password):
        from app import bcrypt
        """Verifies if the provided password matches the hashed password."""
        return bcrypt.check_password_hash(self.password, password)

    # ---getter and setter---

    @property
    def first_name(self):
        return self._first_name

    @first_name.setter
    def first_name(self, value):
        if not isinstance(value, str):
            raise ValueError("First name must be a string.")
        value = value.strip()
        if len(value) == 0:
            raise ValueError("First name cannot be empty.")
        if not 1 <= len(value) <= 50:
            raise ValueError(
                "First name length must be between 1 and 50 characters.")
        if not value.replace(" ", "").isalpha():
            raise ValueError("First name can only contain letters and spaces.")
        self._first_name = value

    @property
    def last_name(self):
        return self._last_name

    @last_name.setter
    def last_name(self, value):
        if not isinstance(value, str):
            raise ValueError("Last name must be a string.")
        value = value.strip()
        if len(value) == 0:
            raise ValueError("Last name cannot be empty.")
        if not 1 <= len(value) <= 50:
            raise ValueError(
                "Last name length must be between 1 and 50 characters.")
        if not value.replace(" ", "").isalpha():
            raise ValueError("Last name can only contain letters and spaces.")
        self._last_name = value

    @property
    def email(self):
        return self._email

    @email.setter
    def email(self, value):
        value = value.strip().lower()
        if not re.fullmatch(r"^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$", value):
            raise ValueError("Invalid email format.")
        self._email = value

    @property
    def is_admin(self):
        return self._is_admin

    @is_admin.setter
    def is_admin(self, value):
        if not isinstance(value, bool):
            raise ValueError(
                "is_admin must be a boolean value (True or False).")
        self._is_admin = value

    # ---methods---

    def save(self):
        """Update the updated_at timestamp whenever the object is modified"""
        self.updated_at = datetime.now()

    def register(self):
        # loop through the User-Obj list to check if user's email matches new user's email
        for user in User.users_db:
            if user.email == self.email:
                raise ValueError("Email already registered.")
        User.users_db.append(self)
        print(f"User {self.email} registered successfully.")

    def update(self, data):
        if 'first_name' in data:
            self.first_name = data['first_name']
        if 'last_name' in data:
            self.last_name = data['last_name']
        if 'email' in data:
            self.email = data['email']
        self.save()

    def delete_account(self):
        if self in User.users_db:
            User.users_db.remove(self)
            print(f"User {self.email} deleted.")
        else:
            print("User not found.")

    def write_review(self, review):
        from app.models.review import Review
        if self.is_admin:
            raise PermissionError(
                "Owner/admin is not allowed to write reviews.")
        if not isinstance(review, Review):
            raise ValueError("Input must be a Review object.")
        self.reviews.append(review)

    def add_place(self, place):
        from app.models.place import Place
        # check the parameter place is an instance of Place class
        if not self.is_admin:
            raise PermissionError("Only owner/admin can add places.")
        if not isinstance(place, Place):
            raise ValueError("Input must be a Place object.")
        place.owner = self
        self.places.append(place)
