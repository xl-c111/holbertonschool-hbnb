import uuid
from datetime import datetime
from app.models.user import User
from app.models.place import Place


class Amenity:
    def __init__(self, name):
        if name is None:
            raise ValueError("Required attributes not specified!")
        self.id = str(uuid.uuid4())
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
        self.name = name

    # ---getter and setter
    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        if not isinstance(value, str):
            raise ValueError("Name must be a string.")
        value = value.strip()
        if len(value) == 0:
            raise ValueError("Name must be a non-empty string.")
        self._name = value
        self.save()

    # --methods---

    def save(self):
        """Update the updated_at timestamp whenever the object is modified"""
        self.updated_at = datetime.now()
