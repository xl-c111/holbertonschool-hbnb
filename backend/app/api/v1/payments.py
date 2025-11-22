from flask_restx import Namespace, Resource, fields
from flask import request
import stripe
import os
from datetime import datetime, date
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import facade
from app.extensions import limiter

api = Namespace('payments', description='Payment operations')

# Initialize Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# Payment intent model
payment_intent_model = api.model('PaymentIntent', {
    'place_id': fields.String(required=True, description='Place ID'),
    'check_in_date': fields.String(required=True, description='Check-in date (YYYY-MM-DD)'),
    'check_out_date': fields.String(required=True, description='Check-out date (YYYY-MM-DD)'),
    'currency': fields.String(required=False, description='Currency code (default: usd)')
})

payment_intent_response = api.model('PaymentIntentResponse', {
    'client_secret': fields.String(description='Client secret for confirming payment'),
    'payment_intent_id': fields.String(description='Payment intent ID')
})


def _parse_dates(check_in_str: str, check_out_str: str):
    """Parse dates from strings and validate order"""
    check_in = datetime.strptime(check_in_str, "%Y-%m-%d").date()
    check_out = datetime.strptime(check_out_str, "%Y-%m-%d").date()
    if check_out <= check_in:
        raise ValueError("Check-out date must be after check-in date")
    return check_in, check_out


def _calculate_amount_cents(price_per_night: float, check_in: date, check_out: date) -> int:
    nights = (check_out - check_in).days
    if nights <= 0:
        raise ValueError("Booking must be at least 1 night")
    return int(round(price_per_night * nights * 100))


@api.route('/create-payment-intent')
class CreatePaymentIntent(Resource):
    @api.expect(payment_intent_model)
    @api.marshal_with(payment_intent_response)
    @jwt_required()
    @limiter.limit("10 per minute")
    def post(self):
        """Create a Stripe payment intent for a booking"""
        user_id = get_jwt_identity()
        user = facade.get_user(user_id)

        if not user:
            return {'error': 'User not found'}, 404

        data = request.json or {}
        place_id = data.get('place_id')
        check_in_str = data.get('check_in_date')
        check_out_str = data.get('check_out_date')
        currency = data.get('currency', 'usd')

        if not place_id or not check_in_str or not check_out_str:
            return {'error': 'place_id, check_in_date, and check_out_date are required'}, 400

        place = facade.get_place(place_id)
        if not place:
            return {'error': 'Place not found'}, 404

        try:
            check_in, check_out = _parse_dates(check_in_str, check_out_str)
            # Basic availability check before taking payment
            if not facade.check_place_availability(place_id, check_in, check_out):
                return {'error': 'Place is not available for selected dates'}, 400

            amount_cents = _calculate_amount_cents(place.price, check_in, check_out)
        except ValueError as e:
            return {'error': str(e)}, 400

        try:
            # Create payment intent
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency,
                metadata={
                    'user_id': user_id,
                    'user_email': user.email,
                    'place_id': place_id,
                    'check_in_date': check_in_str,
                    'check_out_date': check_out_str,
                    'expected_amount_cents': str(amount_cents),
                },
                automatic_payment_methods={
                    'enabled': True,
                },
            )

            return {
                'client_secret': payment_intent.client_secret,
                'payment_intent_id': payment_intent.id
            }, 200

        except stripe.error.StripeError as e:
            return {'error': str(e)}, 400
        except Exception as e:
            return {'error': 'Payment processing failed'}, 500


@api.route('/verify-payment/<string:payment_intent_id>')
class VerifyPayment(Resource):
    @jwt_required()
    def get(self, payment_intent_id):
        """Verify a payment intent status"""
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            return {
                'id': payment_intent.id,
                'status': payment_intent.status,
                'amount': payment_intent.amount,
                'currency': payment_intent.currency,
                'metadata': payment_intent.metadata
            }, 200

        except stripe.error.StripeError as e:
            return {'error': str(e)}, 400
        except Exception as e:
            return {'error': 'Payment verification failed'}, 500
