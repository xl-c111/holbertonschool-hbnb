import uuid
from datetime import datetime, date
from app.extensions import db
from .baseclass import BaseModel
from sqlalchemy.orm import validates, relationship


class Booking(BaseModel):
    """Booking model for place reservations"""

    __tablename__ = 'bookings'

    place_id = db.Column(db.String(60), db.ForeignKey('places.id'), nullable=False)
    guest_id = db.Column(db.String(60), db.ForeignKey('users.id'), nullable=False)
    check_in_date = db.Column(db.Date, nullable=False)
    check_out_date = db.Column(db.Date, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(
        db.Enum('pending', 'confirmed', 'cancelled', 'completed', name='booking_status'),
        default='pending',
        nullable=False
    )

    # Relationships
    place = db.relationship('Place', back_populates='bookings')
    guest = db.relationship('User', back_populates='bookings')

    # --- Validations ---

    @validates('check_in_date', 'check_out_date')
    def validate_dates(self, key, value):
        """Validate booking dates"""
        if not isinstance(value, date):
            raise ValueError(f"{key} must be a date object")

        # Check that dates are not in the past
        if value < date.today():
            raise ValueError(f"{key} cannot be in the past")

        return value

    @validates('total_price')
    def validate_price(self, key, value):
        """Validate total price"""
        if not isinstance(value, (int, float)) or value <= 0:
            raise ValueError("Total price must be a positive number")
        return float(value)

    @validates('status')
    def validate_status(self, key, value):
        """Validate booking status"""
        valid_statuses = ['pending', 'confirmed', 'cancelled', 'completed']
        if value not in valid_statuses:
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        return value

    # --- Methods ---

    def validate_booking_dates(self):
        """Validate that check-out is after check-in"""
        if self.check_out_date <= self.check_in_date:
            raise ValueError("Check-out date must be after check-in date")

    def calculate_total_price(self, price_per_night):
        """Calculate total price based on number of nights"""
        if not self.check_in_date or not self.check_out_date:
            raise ValueError("Check-in and check-out dates must be set")

        nights = (self.check_out_date - self.check_in_date).days
        if nights <= 0:
            raise ValueError("Booking must be at least 1 night")

        self.total_price = nights * price_per_night
        return self.total_price

    def can_cancel(self):
        """Check if booking can be cancelled"""
        return self.status in ['pending', 'confirmed']

    def cancel(self):
        """Cancel the booking"""
        if not self.can_cancel():
            raise ValueError(f"Cannot cancel booking with status: {self.status}")
        self.status = 'cancelled'
        self.updated_at = datetime.utcnow()

    def confirm(self):
        """Confirm the booking"""
        if self.status != 'pending':
            raise ValueError("Only pending bookings can be confirmed")
        self.status = 'confirmed'
        self.updated_at = datetime.utcnow()

    def complete(self):
        """Mark booking as completed (after check-out date)"""
        if self.status != 'confirmed':
            raise ValueError("Only confirmed bookings can be completed")
        if date.today() < self.check_out_date:
            raise ValueError("Booking can only be completed after check-out date")
        self.status = 'completed'
        self.updated_at = datetime.utcnow()
