import uuid
from datetime import datetime
import re
from app.extensions import db, bcrypt
from .baseclass import BaseModel
from sqlalchemy.orm import validates, relationship


class User(BaseModel):

    __tablename__ = 'users'

    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    reviews = db.relationship(
        'Review', back_populates='user', cascade='all, delete-orphan')
    places = db.relationship(
        'Place', back_populates='owner', cascade='all, delete-orphan')

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

    # ---validates---
    @validates('first_name', 'last_name')
    def validate_name(self, key, value):
        if not isinstance(value, str):
            raise ValueError("{} must be a string.".format(key))
        value = value.strip()
        if len(value) == 0:
            raise ValueError("{} cannot be empty.".format(key))
        if not 1 <= len(value) <= 50:
            raise ValueError(
                "{} length must be between 1 and 50 characters.".format(key))
        if not value.replace(" ", "").isalpha():
            raise ValueError(
                "{} can only contain letters and spaces.".format(key))
        return value

    @validates('email')
    def validate_email(self, key, value):
        value = value.strip().lower()
        if not re.fullmatch(r"^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$", value):
            raise ValueError("Invalid email format.")
        return value

    @validates('is_admin')
    def validate_is_admin(self, key, value):
        if not isinstance(value, bool):
            raise ValueError(
                "is_admin must be a boolean value (True or False).")
        return value

    @validates('password')
    def validate_password(self, key, value):
        if not isinstance(value, str):
            raise ValueError("Password must be a string.")
        value = value.strip()
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Z]", value):
            raise ValueError(
                "Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", value):
            raise ValueError(
                "Password must contain at least one lowercase letter.")
        if not re.search(r"\d", value):
            raise ValueError("Password must contain at least one number.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise ValueError(
                "Password must contain at least one special character.")
        return value

    # ---methods---
    def register(self):
        if User.query.filter_by(email=self.email).first():
            raise ValueError("Email already registered.")
        db.session.add(self)

    def update(self, data):
        if 'first_name' in data:
            self.first_name = data['first_name']
        if 'last_name' in data:
            self.last_name = data['last_name']
        if 'email' in data:
            self.email = data['email']
        self.updated_at = datetime.utcnow()

    def delete_account(self):
        db.session.delete(self)

    def write_review(self, review):
        from app.models.review import Review
        if self.is_admin:
            raise PermissionError(
                "Owner/admin is not allowed to write reviews.")
        if not isinstance(review, Review):
            raise ValueError("Input must be a Review object.")
        review.user = self
        db.session.add(review)

    def add_place(self, place):
        from app.models.place import Place
        # check the parameter place is an instance of Place class
        if not self.is_admin:
            raise PermissionError("Only owner/admin can add places.")
        if not isinstance(place, Place):
            raise ValueError("Input must be a Place object.")
        place.owner = self
        db.session.add(place)
