from flask_restx import Namespace, Resource, fields
from flask import request
import stripe
import os
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import facade

api = Namespace('payments', description='Payment operations')

# Initialize Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# Payment intent model
payment_intent_model = api.model('PaymentIntent', {
    'amount': fields.Integer(required=True, description='Amount in cents'),
    'currency': fields.String(required=False, description='Currency code (default: usd)'),
    'booking_details': fields.Raw(description='Booking metadata')
})

payment_intent_response = api.model('PaymentIntentResponse', {
    'client_secret': fields.String(description='Client secret for confirming payment'),
    'payment_intent_id': fields.String(description='Payment intent ID')
})


@api.route('/create-payment-intent')
class CreatePaymentIntent(Resource):
    @api.expect(payment_intent_model)
    @api.marshal_with(payment_intent_response)
    @jwt_required()
    def post(self):
        """Create a Stripe payment intent for a booking"""
        user_id = get_jwt_identity()
        user = facade.get_user(user_id)

        if not user:
            return {'error': 'User not found'}, 404

        data = request.json
        amount = data.get('amount')
        currency = data.get('currency', 'usd')
        booking_details = data.get('booking_details', {})

        if not amount or amount <= 0:
            return {'error': 'Invalid amount'}, 400

        try:
            # Create payment intent
            payment_intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                metadata={
                    'user_id': user_id,
                    'user_email': user.email,
                    'place_id': booking_details.get('place_id', ''),
                    'check_in': booking_details.get('check_in_date', ''),
                    'check_out': booking_details.get('check_out_date', ''),
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
