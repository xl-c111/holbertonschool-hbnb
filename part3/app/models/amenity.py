from datetime import datetime
from .baseclass import BaseModel
from app.models.place_amenity import place_amenity
from sqlalchemy.orm import validates
from app.extensions import db


class Amenity(BaseModel):

    __tablename__ = 'amenities'
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(100), nullable=False)
    number = db.Column(db.Integer, nullable=False)

    # ---validates---

    @validates('name')
    def validates_name(self, key, value):
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Name must be a non-emty string.")
        return value.strip()

    # --methods---

    def save(self):
        """Update the updated_at timestamp whenever the object is modified"""
        self.updated_at = datetime.now()
