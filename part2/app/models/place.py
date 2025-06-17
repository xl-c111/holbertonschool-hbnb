import uuid
from datetime import datetime
from app.models.user import User
from app.models.review import Review
from app.models.amenity import Amenity


class Place:
    def __init__(self, title, description, price, latitude, longitude, owner):
        if title is None or description is None or price is None or latitude is None or longitude is None or owner is None:
            raise ValueError("Required attributes not specified!")
        self.id = str(uuid.uuid4())
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
        self.title = title
        self.description = description
        self.price = price
        self.latitude = latitude
        self.longitude = longitude
        self.owner = owner
        self.reviews = []  # List to store related reviews
        self.amenities = []  # List to store related amenities

    # getter and setter methods

    @property
    def title(self):
        return self._title

    @title.setter
    def title(self, value):
        value = value.strip()
        if 0 < len(value) <= 100:
            self._title = value
        else:
            raise ValueError("Invalid title length!")

    @property
    def description(self):
        return self._description

    @description.setter
    def description(self, value):
        self._description = value.strip()

    @property
    def price(self):
        return self._price

    @price.setter
    def price(self, value):
        if isinstance(value, (int, float)) and value > 0.0:
            self._price = value
        else:
            raise ValueError("Invalid value specified for price")

    @property
    def latitude(self):
        return self._latitude

    @latitude.setter
    def latitude(self, value):
        if isinstance(value, (int, float)) and -90.0 <= value <= 90.0:
            self._latitude = value
        else:
            raise ValueError("Invalid value specified for Latitude")

    @property
    def longitude(self):
        return self._longitude

    @longitude.setter
    def longitude(self, value):
        if isinstance(value, (int, float)) and -180.0 <= value <= 180.0:
            self._longitude = value
        else:
            raise ValueError("Invalid value specified for Longitude")

    @property
    def owner(self):
        return self._owner

    @owner.setter
    def owner(self, value):
        # p = User("Tom") --> p = Place() --> p.owner = u
        # createa User obj u with name "Tom", create a place obj named p, set u as the owner of place p
        # triggers the owner setter to check if u is a User obj
        if isinstance(value, User):
            self._owner = value
        else:
            raise ValueError("Invalid object type passed in for owner!")

    # ---methods----

    def save(self):
        """Update the updated_at timestamp whenever the object is modified"""
        self.updated_at = datetime.now()

    def add_review(self, review):
        """Add a review to the place."""
        # self.reviews refers to the reviews attribute of current obj(self), it stores all the reviews for this obj
        # .append(review) is a built-in list method, it adds the  given items at the end of the list
        if not isinstance(review, Review):
            raise ValueError("Input must be a Review object.")
        self.reviews.append(review)

    def update_by_owner(self, user, **kwargs):
        """Update the attributes of the object based on the provided dictionary"""
        if user != self.owner:
            raise PermissionError("Only the owner can update this place.")
        allowed_fields = ["title", "description", "price",
                          "latitude", "longitude", "amenities"]
        for key, value in kwargs.items():
            if key in allowed_fields:
                setattr(self, key, value)
        self.save()  # Update the updated_at timestamp
        return self

    def add_amenity(self, amenity, user):
        """Add an amenity to the place."""
        if not isinstance(amenity, Amenity):
            raise ValueError("Input must be a Amenity object.")
        if user != self.owner:
            raise PermissionError("Only the owner can add amenities.")
        # if amenity obj is already present in the self.amenities list, avoid duplicating
        if amenity in self.amenities:
            return
        self.amenities.append(amenity)

    def remove_amenity(self, amenity, user):
        if not isinstance(amenity, Amenity):
            raise ValueError("Input must be a Amenity object.")
        if user != self.owner:
            raise PermissionError("Only the owner can remove amenities.")
        if amenity in self.amenities:
            self.amenities.remove(amenity)

    @staticmethod
    def place_exists(place_id):
        """ Search through all Places to ensure the specified place_id exists """
        # Unused - the facade get_place method will handle this
