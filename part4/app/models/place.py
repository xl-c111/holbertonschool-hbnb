import uuid
from datetime import datetime
from app.extensions import db
from app.models.place_amenity import place_amenity
from .baseclass import BaseModel
from sqlalchemy.orm import validates, relationship


class Place(BaseModel):

    __tablename__ = 'places'

    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    owner_id = db.Column(db.String(60), db.ForeignKey(
        'users.id'), nullable=False)

    # Many-to-one relationship from Owner to Place
    owner = db.relationship(
        'User', back_populates='places')
    # One-to-many relationship from Place to Review
    reviews = db.relationship(
        'Review', back_populates='place', cascade='all, delete-orphan'
    )
    # many-to-many relationship between Place and Amenity
    amenities = db.relationship(
    'Amenity',
    secondary=place_amenity,
    back_populates='places'
)



    # ---validates---

    @validates('title')
    def validates_title(self, key, value):
        value = value.strip()
        if 0 < len(value) <= 100:
            return value
        else:
            raise ValueError("Invalid title length!")

    @validates('description')
    def validates_description(self, key, value):
        return value.strip()

    @validates('price')
    def validates_price(self, key, value):
        if isinstance(value, (int, float)) and value > 0.0:
            return value
        else:
            raise ValueError("Invalid value specified for price")

    @validates('latitude')
    def validates_latitude(self, key, value):
        if isinstance(value, (int, float)) and -90.0 <= value <= 90.0:
            return value
        else:
            raise ValueError("Invalid value specified for Latitude")

    @validates('longitude')
    def validates_longitude(self, key, value):
        if isinstance(value, (int, float)) and -180.0 <= value <= 180.0:
            return value
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
