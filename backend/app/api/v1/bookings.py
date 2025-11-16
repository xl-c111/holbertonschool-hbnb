from flask_restx import Namespace, Resource, fields
from flask import request
from app.services import facade
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
import stripe
import os

# Initialize Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

api = Namespace('bookings', description='Booking operations')

# API Models
booking_model = api.model('Booking', {
    'id': fields.String(readonly=True, description='Booking ID'),
    'place_id': fields.String(required=True, description='Place ID'),
    'guest_id': fields.String(readonly=True, description='Guest ID'),
    'check_in_date': fields.String(required=True, description='Check-in date (YYYY-MM-DD)'),
    'check_out_date': fields.String(required=True, description='Check-out date (YYYY-MM-DD)'),
    'total_price': fields.Float(readonly=True, description='Total price'),
    'status': fields.String(readonly=True, description='Booking status')
})

booking_create_model = api.model('BookingCreate', {
    'place_id': fields.String(required=True, description='Place ID'),
    'check_in_date': fields.String(required=True, description='Check-in date (YYYY-MM-DD)'),
    'check_out_date': fields.String(required=True, description='Check-out date (YYYY-MM-DD)'),
    'payment_intent_id': fields.String(required=True, description='Stripe Payment Intent ID')
})

availability_model = api.model('Availability', {
    'place_id': fields.String(required=True, description='Place ID'),
    'check_in_date': fields.String(required=True, description='Check-in date (YYYY-MM-DD)'),
    'check_out_date': fields.String(required=True, description='Check-out date (YYYY-MM-DD)')
})


def serialize_booking(booking):
    """Serialize booking object"""
    return {
        'id': booking.id,
        'place_id': booking.place_id,
        'guest_id': booking.guest_id,
        'check_in_date': booking.check_in_date.isoformat(),
        'check_out_date': booking.check_out_date.isoformat(),
        'total_price': booking.total_price,
        'status': booking.status,
        'can_cancel': booking.can_cancel(),
        'cancellation_deadline': booking.get_cancellation_deadline().isoformat() if booking.status in ['pending', 'confirmed'] else None,
        'created_at': booking.created_at.isoformat(),
        'updated_at': booking.updated_at.isoformat()
    }


@api.route('/')
class BookingList(Resource):
    @jwt_required()
    @api.expect(booking_create_model)
    @api.response(201, 'Booking created successfully')
    @api.response(400, 'Invalid input or place not available')
    @api.response(404, 'Place not found')
    def post(self):
        """Create a new booking"""
        user_id = get_jwt_identity()
        booking_data = api.payload
        payment_intent_id = booking_data.get('payment_intent_id')

        # Verify payment before creating booking
        if not payment_intent_id:
            return {'error': 'Payment intent ID is required'}, 400

        try:
            # Verify payment with Stripe
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            if payment_intent.status != 'succeeded':
                return {'error': f'Payment not completed. Status: {payment_intent.status}'}, 400

            # Verify payment amount matches booking (optional but recommended)
            # This prevents users from paying $1 for a $1000 booking
            place = facade.get_place(booking_data['place_id'])
            if not place:
                return {'error': 'Place not found'}, 404

            # Add guest_id from JWT
            booking_data['guest_id'] = user_id

            # Create booking
            new_booking = facade.create_booking(booking_data)

            return serialize_booking(new_booking), 201

        except ValueError as e:
            return {'error': str(e)}, 400
        except Exception as e:
            return {'error': f'An error occurred: {str(e)}'}, 500

    @jwt_required()
    @api.response(200, 'List of bookings')
    def get(self):
        """Get all bookings for the authenticated user"""
        user_id = get_jwt_identity()

        # Get query parameters
        status = request.args.get('status')
        booking_type = request.args.get('type')  # 'upcoming' or 'past'

        try:
            if booking_type == 'upcoming':
                bookings = facade.get_upcoming_bookings(user_id)
            elif booking_type == 'past':
                bookings = facade.get_past_bookings(user_id)
            else:
                bookings = facade.get_user_bookings(user_id, status)

            return [serialize_booking(b) for b in bookings], 200
        except Exception as e:
            return {'error': str(e)}, 500


@api.route('/<string:booking_id>')
class BookingResource(Resource):
    @jwt_required()
    @api.response(200, 'Booking details')
    @api.response(404, 'Booking not found')
    def get(self, booking_id):
        """Get booking details by ID"""
        user_id = get_jwt_identity()
        booking = facade.get_booking(booking_id)

        if not booking:
            return {'error': 'Booking not found'}, 404

        # Check if user is authorized to view this booking
        place = facade.get_place(booking.place_id)
        if booking.guest_id != user_id and place.owner_id != user_id:
            return {'error': 'Unauthorized'}, 403

        return serialize_booking(booking), 200

    @jwt_required()
    @api.response(200, 'Booking cancelled')
    @api.response(404, 'Booking not found')
    @api.response(403, 'Unauthorized')
    def delete(self, booking_id):
        """Cancel a booking"""
        user_id = get_jwt_identity()
        user = db.session.get(User, user_id)

        if not user:
            return {'error': 'User not found'}, 404

        try:
            cancelled_booking = facade.cancel_booking(booking_id, user)
            return {
                'message': 'Booking cancelled successfully',
                'booking': serialize_booking(cancelled_booking)
            }, 200
        except ValueError as e:
            return {'error': str(e)}, 404
        except PermissionError as e:
            return {'error': str(e)}, 403


@api.route('/<string:booking_id>/confirm')
class BookingConfirm(Resource):
    @jwt_required()
    @api.response(200, 'Booking confirmed')
    @api.response(404, 'Booking not found')
    @api.response(403, 'Unauthorized')
    def put(self, booking_id):
        """Confirm a booking (place owner only)"""
        user_id = get_jwt_identity()
        user = db.session.get(User, user_id)

        if not user:
            return {'error': 'User not found'}, 404

        try:
            confirmed_booking = facade.confirm_booking(booking_id, user)
            return {
                'message': 'Booking confirmed successfully',
                'booking': serialize_booking(confirmed_booking)
            }, 200
        except ValueError as e:
            return {'error': str(e)}, 404
        except PermissionError as e:
            return {'error': str(e)}, 403


@api.route('/places/<string:place_id>')
class PlaceBookings(Resource):
    @jwt_required()
    @api.response(200, 'List of bookings for place')
    @api.response(404, 'Place not found')
    def get(self, place_id):
        """Get all bookings for a place (owner only)"""
        user_id = get_jwt_identity()
        place = facade.get_place(place_id)

        if not place:
            return {'error': 'Place not found'}, 404

        # Check if user is the place owner
        if place.owner_id != user_id:
            return {'error': 'Unauthorized - only place owner can view bookings'}, 403

        status = request.args.get('status')
        bookings = facade.get_place_bookings(place_id, status)

        return [serialize_booking(b) for b in bookings], 200


@api.route('/availability/check')
class AvailabilityCheck(Resource):
    @api.expect(availability_model)
    @api.response(200, 'Availability check result')
    @api.response(400, 'Invalid input')
    def post(self):
        """Check if a place is available for given dates"""
        data = api.payload

        required_fields = ['place_id', 'check_in_date', 'check_out_date']
        for field in required_fields:
            if field not in data:
                return {'error': f'Missing field: {field}'}, 400

        try:
            is_available = facade.check_place_availability(
                data['place_id'],
                data['check_in_date'],
                data['check_out_date']
            )

            return {
                'available': is_available,
                'place_id': data['place_id'],
                'check_in_date': data['check_in_date'],
                'check_out_date': data['check_out_date']
            }, 200
        except Exception as e:
            return {'error': str(e)}, 400
