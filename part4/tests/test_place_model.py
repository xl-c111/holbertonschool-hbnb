import unittest
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.place import Place
from app.models.review import Review


class TestPlaceModel(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.drop_all()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_place_creation(self):
        owner = User(first_name="Alice", last_name="Wonder",
                     email="alice@example.com", password="StrongPass1!")
        db.session.add(owner)
        db.session.commit()

        place = Place(title="Cozy Apartment", description="A nice place to stay", price=100.0,
                      latitude=37.7749, longitude=-122.4194, owner=owner)
        db.session.add(place)
        db.session.commit()

        review = Review(text="Great stay!", rating=5, place=place, user=owner)
        place.add_review(review)
        db.session.commit()

        self.assertEqual(place.title, "Cozy Apartment")
        self.assertEqual(place.price, 100.0)
        self.assertEqual(len(place.reviews), 1)
        self.assertEqual(place.reviews[0].text, "Great stay!")


# python3 -m unittest tests/test_place_model.py -v
