from app.persistence.repository import SQLAlchemyRepository
from app.persistence.user_repository import UserRepository
from app.persistence.review_repository import ReviewRepository
from app.models.place import Place
from app.models.user import User
from app.models.review import Review
from app.models.amenity import Amenity
from app.extensions import db
from sqlalchemy.orm import selectinload




class HBnBFacade:
    def __init__(self):
        self.user_repo = UserRepository()
        self.place_repo = SQLAlchemyRepository(Place)
        self.review_repo = ReviewRepository()
        self.amenity_repo = SQLAlchemyRepository(Amenity)

     #  _________________User Operations____________________

    def create_user(self, user_data):
        """Create a new user after checking email uniqueness"""
        existing = self.user_repo.get_user_by_email(user_data['email'])
        if existing:
            raise ValueError("Email already registered.")
        user = User(**user_data)
        user.hash_password(user_data['password'])

        self.user_repo.add(user)
        return user

    def get_user(self, user_id):
        """Retrieve a user by ID"""
        return self.user_repo.get(user_id)

    def get_user_by_email(self, email):
        """Retrieve a user by email"""
        return self.user_repo.get_user_by_email(email)

    def get_all_users(self):
        """Return all users"""
        return self.user_repo.get_all()

    def update_user(self, user_id, data):
        """Update an existing user"""
        self.user_repo.update(user_id, data)
        return self.user_repo.get(user_id)

    def delete_user(self, user_id):
        """Delete a user using repository"""
        self.user_repo.delete(user_id)

    #  _________________Place Operations____________________

    def place_exists(self, place_id):
        return self.place_repo.get(place_id) is not None

    # Placeholder method for creating a place
    def create_place(self, data):
        required_fields = ['title', 'description',
                           'price', 'latitude', 'longitude', 'owner_id']
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing field: {field}")
        # Convert owner_id to owner object
        owner = self.get_user(data['owner_id'])
        if not owner:
            raise ValueError("Owner not found")
        data['owner'] = owner
        data.pop('owner_id')  # Remove owner_id so Place doesn't get it
        place = Place(**data)
        self.place_repo.add(place)
        return place

    # Placeholder method for fetching all places
    def get_all_places(self):
        return self.place_repo.get_all()

    # Placeholder method for fetching a place by ID
    def get_place(self, place_id):
        return self.place_repo.get(place_id)

    # Placeholder method for updating a place

    def update_place(self, place_id, place_data):
        place = self.place_repo.get(place_id)
        if not place:
            return None
        # Update the place with the provided data
        for key in ['title', 'description', 'price', 'latitude', 'longitude']:
            if key in place_data:
                setattr(place, key, place_data[key])
        self.place_repo.update(place_id, place)
        return place

    # Placeholder method for deleting a place

    def delete_place(self, place_id):
        place = self.place_repo.get(place_id)
        if not place:
            return None
        self.place_repo.delete(place_id)
        return place

    def add_amenity_to_place(self, place_id, amenity_id, user):
        place = self.place_repo.get(place_id)
        amenity = self.amenity_repo.get(amenity_id)

        if not place or not amenity:
            return None

        if place.owner_id != user.id:
            raise PermissionError("Unauthorized")
        place.add_amenity(amenity, user)
        db.session.commit()
        return amenity

    def get_place_with_details(self, place_id):
        place = db.session.query(Place).options(
            selectinload(Place.amenities),
            selectinload(Place.reviews)
        ).filter_by(id=place_id).first()
        return place



   #  _________________Amenities Operations____________________

    # Placeholder methof for creating an amenity
    def create_amenity(self, amenity_data):
        # debug
        print(f"DEBUG: Received amenity_data: {amenity_data}")
        print(f"DEBUG: Data type: {type(amenity_data)}")

        requires_fields = ['name', 'description', 'number']
        for field in requires_fields:
            if field not in amenity_data or amenity_data[field] is None:
                raise ValueError(f"Missing or null field: {field}")

        place_id = amenity_data['place_id']
        place = self.place_repo.get(place_id)
        if not place:
            raise ValueError(f"Place with ID {place_id} does not exist.")

        if amenity_data['owner_id'] != place.owner_id:
            raise PermissionError("User is not the owner of this place.")


        # create the amenity

        amenity = Amenity(
            name=amenity_data['name'],
            description=amenity_data['description'],
            number=amenity_data['number']
        )

        self.amenity_repo.add(amenity)
        return amenity


    def get_amenity(self, amenity_id):
        return self.amenity_repo.get(amenity_id)

    def update_amenity(self, amenity_id, amenity_data):

        if not isinstance(amenity_data, dict):
             raise TypeError(f"Expected amenity_data to be dict, got {type(amenity_data)}")

        existing_amenity = self.amenity_repo.get(amenity_id)
        if not existing_amenity:
            return None
        for key, value in amenity_data.items():
            if hasattr(existing_amenity, key):
                setattr(existing_amenity, key, value)

        self.amenity_repo.update(amenity_id, existing_amenity)
        return existing_amenity

    def get_amenities_for_place(self, place_id):
        place = self.place_repo.get(place_id)
        if not place:
            raise ValueError(f"Place with ID {place_id} does not exist")

        return place.amenities

    # Placeholder method for deleting an amenity
    def delete_amenity(self, amenity_id):
        amenity = self.amenity_repo.get(amenity_id)
        if not amenity:
            return None
        self.amenity_repo.delete(amenity_id)
        return amenity

    def get_all_amenities(self):
        return self.amenity_repo.get_all()

 #  _________________Review Operations____________________

    def create_review(self, review_data):
        user = self.user_repo.get(review_data['user_id'])
        place = self.place_repo.get(review_data['place_id'])
        if user is None or place is None:
            raise ValueError("User or Place not found!")

        if place.owner_id == user.id:
            raise ValueError("You cannot review your own place.")

        existing_reviews = self.review_repo.get_all_by_attribute("place_id", place.id) or []
        if any(review.user.id == user.id for review in existing_reviews):
            raise ValueError("You have already reviewed this place.")


        review = Review(
            text=review_data['text'],
            rating=review_data['rating'],
            place=place,
            user=user
        )
        self.review_repo.add(review)
        return review

    def get_review(self, review_id):
        return self.review_repo.get(review_id)

    def get_all_reviews(self):
        return self.review_repo.get_all()

    def get_reviews_by_place(self, place_id):
        return self.review_repo.get_by_attribute("place_id", place_id) or []

    def update_review(self, review_id, review_data, user):
        review = self.review_repo.get(review_id)
        if not review:
            return None
        if review.user.id != user.id and not getattr(user, 'is_admin', False):
            raise PermissionError("Not allowed to edit this review.")
        review.text = review_data.get('text', review.text)
        review.rating = review_data.get('rating', review.rating)
        db.session.commit()
        return review


    def delete_review(self, review_id, user):
        review = self.review_repo.get(review_id)
        if not review:
            return None
        if review.user.id != user.id and not getattr(user, 'is_admin', False):
            raise PermissionError("Unauthorized action.")
        self.review_repo.delete(review_id)
        return True
