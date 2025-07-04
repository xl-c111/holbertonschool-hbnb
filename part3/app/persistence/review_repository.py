from app.models.review import Review
from app import db
from app.persistence.repository import SQLAlchemyRepository


class ReviewRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(Review)

    def get_review_by_user_id(self, user_id):
        return self.model.query.filter_by(user_id=user_id).all()

    def get_review_by_place_id(self, place_id):
        return self.model.query.filter_by(place_id=place_id).all()
