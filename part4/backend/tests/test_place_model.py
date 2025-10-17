import pytest

from app.extensions import db
from app.models.place import Place
from app.models.review import Review
from app.models.user import User


@pytest.fixture()
def owner(app):
    with app.app_context():
        user = User(
            first_name="Alice",
            last_name="Wonder",
            email="alice@example.com",
            password="Password1!",
        )
        user.hash_password("Password1!")
        db.session.add(user)
        db.session.commit()
        yield user


def test_place_persists_and_relates_reviews(app, owner):
    with app.app_context():
        place = Place(
            title="Cozy Apartment",
            description="A nice place to stay",
            price=100.0,
            latitude=37.7749,
            longitude=-122.4194,
            owner=owner,
        )
        db.session.add(place)
        db.session.commit()

        reviewer = User(
            first_name="Bob",
            last_name="Guest",
            email="bob@example.com",
            password="Password1!",
        )
        reviewer.hash_password("Password1!")
        db.session.add(reviewer)
        db.session.commit()

        review = Review(text="Great stay!", rating=5, place=place, user=reviewer)
        db.session.add(review)
        db.session.commit()

        refreshed_place = db.session.get(Place, place.id)
        assert refreshed_place.title == "Cozy Apartment"
        assert refreshed_place.price == 100.0
        assert len(refreshed_place.reviews) == 1
        assert refreshed_place.reviews[0].text == "Great stay!"
