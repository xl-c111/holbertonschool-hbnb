import uuid
from datetime import datetime
from app.extensions import db
from .baseclass import BaseModel
from app.models.user import User
from app.models.place import Place
from sqlalchemy.orm import validates, relationship
from sqlalchemy import ForeignKey


class Review(BaseModel):
    __tablename__ = 'reviews'

    text = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False)

    user_id = db.Column(db.String(36), db.ForeignKey(
        'users.id'), nullable=False)
    place_id = db.Column(db.String(36), db.ForeignKey(
        'places.id'), nullable=False)
    # Many-to-one relationship from Review to Place
    place = db.relationship('Place', back_populates='reviews')
    # Many-to-one relationship from Review to User
    user = db.relationship('User', back_populates='reviews')

    # ---validates---

    @validates('text')
    def validate_text(self, key, value):
        if not isinstance(value, str):
            raise ValueError("Text must be a string.")
        value = value.strip()
        if len(value) == 0:
            raise ValueError("Text must be a non-empty string.")
        return value

    @validates('rating')
    def validate_rating(self, key, value):
        if not isinstance(value, int):
            raise ValueError("Rating must be an integer.")
        if value > 5 or value < 1:
            raise ValueError("Rating must be between 1 and 5.")
        return value

    # ---methods----

    def can_update_by(self, user):
        """Only the author of this review can edit it"""
        return self.user.id == user.id

    def can_delete_by(self, user):
        """Only admin can delete the review"""
        return getattr(user, "is_admin", False)

    def update(self, user, new_text=None,  new_rating=None):
        if not self.can_update_by(user):
            raise PermissionError("Only author of this review can update it.")

        # mean no update has been made yet
        updated = False
        if new_text is not None:
            self.text = new_text
            updated = True
        if new_rating is not None:
            self.rating = new_rating
            updated = True
        if updated:
            self.updated_at = datetime.utcnow()

    def delete(self, user):
        if not self.can_delete_by(user):
            raise PermissionError("Only admin can delete this review.")
        db.session.delete(self)
