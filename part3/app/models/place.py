import uuid
from datetime import datetime
from app.extensions import db
from .baseclass import BaseMode
from sqlalchemy.orm import validates, relationship

class Place(BaseMode):

    __tablename__ = 'places'

    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    owner_id = db.Cloumn(db.Integer, db.ForeignKey('users.id'), nullable=False)
    owner = db.relationship(
        'Users', back_populates='places', cascade='all, delete-orphan')
    reviews = db.relationship(
        'Review', back_populates='places', cascade='all, delete-orphan')
    amenities = db.relationship(
        'Amenity', decondary='place_amenity' back_populates='places')



    def __init__(self, title, description, price, latitude, longitude, owner):
        if title is None or description is None or price is None or latitude is None or longitude is None or owner is None:
            raise ValueError("Required attributes not specified!")

        self.title = title
        self.description = description
        self.price = price
        self.latitude = latitude
        self.longitude = longitude
        self.owner = owner
        self.owner_id = owner.id
        self.reviews = []  # List to store related reviews
        self.amenities = []  # List to store related amenities

    # ---validates---

    @validates('title')
    def validates_title(self, key, value):
        value = value.strip()
        if 0 < len(value) <= 100:
            self._title = value
        else:
            raise ValueError("Invalid title length!")

    @validates('dercription')
    def validates_description(self, key, value):
        value.strip()

    @validates('price')
    def validates_price(self, key, value):
        if isinstance(value, (int, float)) and value > 0.0:
            self._price = value
        else:
            raise ValueError("Invalid value specified for price")

    @validates('latitude')
    def valiadtes_latitude(self, key, value):
        if isinstance(value, (int, float)) and -90.0 <= value <= 90.0:
            self._latitude = value
        else:
            raise ValueError("Invalid value specified for Latitude")

    @validates('longitude')
    def valiadtes_longitude(self, key, value):
        if isinstance(value, (int, float)) and -180.0 <= value <= 180.0:
            self._longitude = value
        else:
            raise ValueError("Invalid value specified for Longitude")


    # ---methods----

    def save(self):
        """Update the updated_at timestamp whenever the object is modified"""
        self.updated_at = datetime.now()

    def add_review(self, review):
        from app.models.review import Review
        """Add a review to the place."""
        # self.reviews refers to the reviews attribute of current obj(self), it stores all the reviews for this obj
        # .append(review) is a built-in list method, it adds the  given items at the end of the list
        if not isinstance(review, Review):
            raise ValueError("Input must be a Review object.")
        self.reviews.append(review)

    def update_by_owner_or_admin(self, user, **kwargs):
        from app.models.user import User
        """Update the attributes of the object based on the provided dictionary"""
        if user != self.owner and not getattr(user, "is_admin", False):
            raise PermissionError(
                "Only the owner or admin can update this place.")
        allowed_fields = ["title", "description", "price",
                          "latitude", "longitude", "amenities"]
        for key, value in kwargs.items():
            if key in allowed_fields:
                setattr(self, key, value)
        self.save()  # Update the updated_at timestamp
        return self

    def add_amenity(self, amenity, user):
        from app.models.amenity import Amenity
        """Add an amenity to the place."""
        if not isinstance(amenity, Amenity):
            raise ValueError("Input must be a Amenity object.")
        if user != self.owner and not getattr(user, "is_admin", False):
            raise PermissionError("Only the owner or admin can add amenities.")
        # if amenity obj is already present in the self.amenities list, avoid duplicating
        if amenity in self.amenities:
            return "Amenity already exists."
        self.amenities.append(amenity)

    def remove_amenity(self, amenity, user):
        from app.models.amenity import Amenity
        if not isinstance(amenity, Amenity):
            raise ValueError("Input must be a Amenity object.")
        if user != self.owner and not getattr(user, "is_admin", False):
            raise PermissionError(
                "Only the owner or admin can remove amenities.")
        if amenity in self.amenities:
            self.amenities.remove(amenity)

    @staticmethod
    def place_exists(place_id):
        """ Search through all Places to ensure the specified place_id exists """
        # Unused - the facade get_place method will handle this
