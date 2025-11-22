from app.persistence.repository import SQLAlchemyRepository
from app.persistence.user_repository import UserRepository
from app.persistence.review_repository import ReviewRepository
from app.persistence.booking_repository import BookingRepository
from app.models.place import Place
from app.models.user import User
from app.models.review import Review
from app.models.amenity import Amenity
from app.models.booking import Booking
from app.extensions import db
import bleach
from sqlalchemy.orm import selectinload
from datetime import datetime, date


class HBnBFacade:
    def __init__(self):
        self.user_repo = UserRepository()
        self.place_repo = SQLAlchemyRepository(Place)
        self.review_repo = ReviewRepository()
        self.amenity_repo = SQLAlchemyRepository(Amenity)
        self.booking_repo = BookingRepository()

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
        # Sanitize free-form text fields
        data['title'] = bleach.clean(data['title'] or "", strip=True)
        data['description'] = bleach.clean(
            data['description'] or "",
            tags=['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
            strip=True
        )
        place = Place(**data)
        self.place_repo.add(place)
        return place

    # Placeholder method for fetching all places
    def get_all_places(self):
        # Use eager loading to fetch amenities and reviews in one query
        places = db.session.query(Place).options(
            selectinload(Place.amenities),
            selectinload(Place.reviews)
        ).all()
        return places

    # Placeholder method for fetching a place by ID
    def get_place(self, place_id):
        return self.place_repo.get(place_id)

    # Placeholder method for updating a place

    def update_place(self, place_id, place_data):
        place = self.place_repo.get(place_id)
        if not place:
            return None
        # Update the place with the provided data
        update_dict = {}
        for key in ['title', 'description', 'price', 'latitude', 'longitude']:
            if key in place_data:
                update_dict[key] = place_data[key]
        self.place_repo.update(place_id, update_dict)
        return self.place_repo.get(place_id)

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

        if place.owner_id != user.id and not getattr(user, 'is_admin', False):
            raise PermissionError("Unauthorized")
        place.add_amenity(amenity, user)
        db.session.commit()
        return amenity

    def delete_amenity_from_place(self, place_id, amenity_id, user):
        place = self.place_repo.get(place_id)
        amenity = self.amenity_repo.get(amenity_id)

        if not place or not amenity:
            raise ValueError("Place or Amenity not found")

        if place.owner_id != user.id and not getattr(user, 'is_admin', False):
            raise PermissionError("Unauthorized")

        place.remove_amenity(amenity, user)
        db.session.commit()
        return True

    def get_place_with_details(self, place_id):
        place = db.session.query(Place).options(
            selectinload(Place.amenities),
            selectinload(Place.reviews)
        ).filter_by(id=place_id).first()
        return place

    def get_reviews_for_place(self, place_id):
        return self.review_repo.get_all_by_attribute("place_id", place_id) or []


   #  _________________Amenities Operations____________________

    # Placeholder method for creating an amenity

    def create_amenity(self, amenity_data):
        # Global amenity creation (no implicit place association here)
        required_fields = ['name', 'description', 'number']
        for field in required_fields:
            if field not in amenity_data or amenity_data[field] is None:
                raise ValueError(f"Missing or null field: {field}")

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
            raise TypeError(
                f"Expected amenity_data to be dict, got {type(amenity_data)}")

        existing_amenity = self.amenity_repo.get(amenity_id)
        if not existing_amenity:
            return None

        update_dict = {}
        for key, value in amenity_data.items():
            if hasattr(existing_amenity, key):
                update_dict[key] = value

        self.amenity_repo.update(amenity_id, update_dict)
        return self.amenity_repo.get(amenity_id)

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

        existing_reviews = self.review_repo.get_all_by_attribute(
            "place_id", place.id) or []
        if any(review.user.id == user.id for review in existing_reviews):
            raise ValueError("You have already reviewed this place.")

        review = Review(
            text=bleach.clean(
                review_data['text'],
                tags=['p', 'br', 'strong', 'em'],
                strip=True
            ),
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
        return self.review_repo.get_all_by_attribute("place_id", place_id) or []

    def update_review(self, review_id, review_data, user):
        review = self.review_repo.get(review_id)
        if not review:
            return None
        if review.user.id != user.id and not getattr(user, 'is_admin', False):
            raise PermissionError("Not allowed to edit this review.")
        if 'text' in review_data:
            review.text = bleach.clean(
                review_data['text'],
                tags=['p', 'br', 'strong', 'em'],
                strip=True
            )
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

 #  _________________Booking Operations____________________

    def create_booking(self, booking_data):
        """Create a new booking with availability check"""
        # Validate required fields
        required_fields = ['place_id', 'guest_id', 'check_in_date', 'check_out_date']
        for field in required_fields:
            if field not in booking_data:
                raise ValueError(f"Missing field: {field}")

        # Get place and guest
        place = self.place_repo.get(booking_data['place_id'])
        guest = self.user_repo.get(booking_data['guest_id'])

        if not place:
            raise ValueError("Place not found")
        if not guest:
            raise ValueError("Guest not found")

        # Prevent self-booking
        if place.owner_id == guest.id:
            raise ValueError("You cannot book your own place")

        # Parse dates
        check_in = booking_data['check_in_date']
        check_out = booking_data['check_out_date']

        # Convert string dates to date objects if needed
        if isinstance(check_in, str):
            check_in = datetime.strptime(check_in, '%Y-%m-%d').date()
        if isinstance(check_out, str):
            check_out = datetime.strptime(check_out, '%Y-%m-%d').date()

        # Check availability
        is_available = self.booking_repo.check_availability(
            place.id, check_in, check_out
        )
        if not is_available:
            raise ValueError("Place is not available for selected dates")

        # Create booking
        booking = Booking(
            place_id=place.id,
            guest_id=guest.id,
            check_in_date=check_in,
            check_out_date=check_out
        )

        # Validate dates
        booking.validate_booking_dates()

        # Calculate total price
        booking.calculate_total_price(place.price)

        # Save booking
        self.booking_repo.add(booking)
        return booking

    def get_booking(self, booking_id):
        """Get a booking by ID"""
        return self.booking_repo.get(booking_id)

    def get_all_bookings(self):
        """Get all bookings"""
        return self.booking_repo.get_all()

    def get_user_bookings(self, user_id, status=None):
        """Get all bookings for a user (as guest)"""
        return self.booking_repo.get_bookings_for_guest(user_id, status)

    def get_place_bookings(self, place_id, status=None):
        """Get all bookings for a place"""
        return self.booking_repo.get_bookings_for_place(place_id, status)

    def get_upcoming_bookings(self, user_id):
        """Get upcoming bookings for a user"""
        return self.booking_repo.get_upcoming_bookings(user_id)

    def get_past_bookings(self, user_id):
        """Get past bookings for a user"""
        return self.booking_repo.get_past_bookings(user_id)

    def check_place_availability(self, place_id, check_in, check_out):
        """Check if a place is available for given dates"""
        # Convert string dates if needed
        if isinstance(check_in, str):
            check_in = datetime.strptime(check_in, '%Y-%m-%d').date()
        if isinstance(check_out, str):
            check_out = datetime.strptime(check_out, '%Y-%m-%d').date()

        return self.booking_repo.check_availability(place_id, check_in, check_out)

    def cancel_booking(self, booking_id, user):
        """Cancel a booking"""
        booking = self.booking_repo.get(booking_id)
        if not booking:
            raise ValueError("Booking not found")

        # Check permissions: guest or place owner can cancel
        place = self.place_repo.get(booking.place_id)
        if booking.guest_id != user.id and place.owner_id != user.id and not getattr(user, 'is_admin', False):
            raise PermissionError("You don't have permission to cancel this booking")

        booking.cancel()
        db.session.commit()
        return booking

    def confirm_booking(self, booking_id, user):
        """Confirm a booking (place owner only)"""
        booking = self.booking_repo.get(booking_id)
        if not booking:
            raise ValueError("Booking not found")

        # Check permissions: only place owner can confirm
        place = self.place_repo.get(booking.place_id)
        if place.owner_id != user.id and not getattr(user, 'is_admin', False):
            raise PermissionError("Only the place owner can confirm bookings")

        booking.confirm()
        db.session.commit()
        return booking

    def complete_booking(self, booking_id):
        """Mark booking as completed (after check-out date)"""
        booking = self.booking_repo.get(booking_id)
        if not booking:
            raise ValueError("Booking not found")

        booking.complete()
        db.session.commit()
        return booking
