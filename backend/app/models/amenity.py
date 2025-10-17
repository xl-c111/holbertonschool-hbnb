from datetime import datetime
from .baseclass import BaseModel
from app.models.place_amenity import place_amenity
from sqlalchemy.orm import validates, relationship
from app.extensions import db


class Amenity(BaseModel):

    __tablename__ = 'amenities'
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(100), nullable=False)
    number = db.Column(db.Integer, nullable=True)


    # many to many relationship
    places = db.relationship(
    'Place',
    secondary=place_amenity,
    back_populates='amenities'
)


    # ---validates---

    @validates('name')
    def validates_name(self, key, value):
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Name must be a non-empty string.")
        return value.strip()

    @validates('description')
    def validates_description(self, key, value):
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Description must be a non-empty string.")
        return value.strip()

    @validates('number')
    def validates_number(self, key, value):
        if value is None:
            return value
        if not isinstance(value, int):
            raise ValueError("Number must be an integer.")
        return value

    # --methods---

    def __repr__(self):
        return f"<Amenity(id={self.id}, name='{self.name}', number={self.number})>"

    def to_dict(self):
        """Convert amenity to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'number': self.number,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def save(self):
        """Update the updated_at timestamp whenever the object is modified"""
        self.updated_at = datetime.utcnow()
