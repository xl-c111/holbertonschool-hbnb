from app.models.booking import Booking
from app.persistence.repository import SQLAlchemyRepository
from datetime import date
from sqlalchemy import and_, or_


class BookingRepository(SQLAlchemyRepository):
    """Repository for Booking model with availability checking"""

    def __init__(self):
        super().__init__(Booking)

    def check_availability(self, place_id, check_in, check_out, exclude_booking_id=None):
        """
        Check if a place is available for the given dates
        Returns True if available, False if there's a conflict
        """
        query = self.model.query.filter(
            and_(
                Booking.place_id == place_id,
                Booking.status.in_(['pending', 'confirmed']),
                or_(
                    # New booking starts during existing booking
                    and_(
                        Booking.check_in_date <= check_in,
                        Booking.check_out_date > check_in
                    ),
                    # New booking ends during existing booking
                    and_(
                        Booking.check_in_date < check_out,
                        Booking.check_out_date >= check_out
                    ),
                    # New booking completely contains existing booking
                    and_(
                        Booking.check_in_date >= check_in,
                        Booking.check_out_date <= check_out
                    )
                )
            )
        )

        # Exclude current booking if updating
        if exclude_booking_id:
            query = query.filter(Booking.id != exclude_booking_id)

        conflicts = query.all()
        return len(conflicts) == 0

    def get_bookings_for_place(self, place_id, status=None):
        """Get all bookings for a place, optionally filtered by status"""
        query = self.model.query.filter_by(place_id=place_id)
        if status:
            query = query.filter_by(status=status)
        return query.order_by(Booking.check_in_date).all()

    def get_bookings_for_guest(self, guest_id, status=None):
        """Get all bookings for a guest, optionally filtered by status"""
        query = self.model.query.filter_by(guest_id=guest_id)
        if status:
            query = query.filter_by(status=status)
        return query.order_by(Booking.check_in_date.desc()).all()

    def get_upcoming_bookings(self, guest_id):
        """Get upcoming bookings for a guest"""
        return self.model.query.filter(
            and_(
                Booking.guest_id == guest_id,
                Booking.check_in_date >= date.today(),
                Booking.status.in_(['pending', 'confirmed'])
            )
        ).order_by(Booking.check_in_date).all()

    def get_past_bookings(self, guest_id):
        """Get past bookings for a guest"""
        return self.model.query.filter(
            and_(
                Booking.guest_id == guest_id,
                or_(
                    Booking.check_out_date < date.today(),
                    Booking.status == 'completed'
                )
            )
        ).order_by(Booking.check_out_date.desc()).all()
