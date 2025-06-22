from flask_restx import Namespace, Resource, fields
from flask import request
from app.services import facade
from app.models.review import Review
from flask_login import current_user

api = Namespace('reviews', description='Review operations')

# Define the review model for input validation and documentation
review_model = api.model('Review', {
    'text': fields.String(required=True, description='Text of the review'),
    'rating': fields.Integer(required=True, description='Rating of the place (1-5)'),
    'user_id': fields.String(required=True, description='ID of the user'),
    'place_id': fields.String(required=True, description='ID of the place')
})


@api.route('/')
class ReviewList(Resource):
    @api.expect(review_model)
    @api.response(201, 'Review successfully created')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Register a new review"""
        review_data = api.payload
        # fetch existing reviews for a place
        reviews = facade.get_reviews_by_place(review_data['place_id'])
        if reviews is None:
            reviews = []
        for review in reviews:
            # if user already submitted a review
            if review.user.id == review_data['user_id']:
                return {'error': 'You have already reviewed this place.'}, 400
        # return a new review obj
        new_review = facade.create_review(review_data)
        return {'id': new_review.id, 'text': new_review.text, 'rating': new_review.rating, 'user_id': new_review.user.id, 'place_id': new_review.place.id}, 201

    @api.response(200, 'List of reviews retrieved successfully')
    def get(self):
        """Retrieve a list of all reviews"""
        reviews = facade.get_all_reviews()
        review_list = []
        for review in reviews:
            review_list.append({
                'id': review.id,
                'text': review.text,
                'rating': review.rating,
                'user_id': review.user_id,
                'place_id': review.place_id
            })
        return review_list, 200


@api.route('/<review_id>')
class ReviewResource(Resource):
    @api.response(200, 'Review details retrieved successfully')
    @api.response(404, 'Review not found')
    def get(self, review_id):
        """Get review details by ID"""
        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404
        return {'id': review.id, 'text': review.text, 'rating': review.rating, 'user_id': review.user_id, 'place_id': review.place_id}, 200

    @api.expect(review_model)
    @api.response(200, 'Review updated successfully')
    @api.response(404, 'Review not found')
    @api.response(400, 'Invalid input data')
    def put(self, review_id):
        """Update a review's information"""
        update_data = api.payload

        try:
            updated_review = facade.update_review(review_id, update_data)
            if not updated_review:
                return {'error': 'Review not found'}, 404
            return {
                'id': updated_review.id,
                'text': updated_review.text,
                'rating': updated_review.rating,
                'user_id': updated_review.user.id,
                'place_id': updated_review.place.id,
            }, 200
        except ValueError as e:
            return {'error': str(e)}, 400
        except Exception as e:
            return {'error': 'Internal server error: ' + str(e)}, 500

    @api.response(200, 'Review deleted successfully')
    @api.response(404, 'Review not found')
    def delete(self, review_id):
        """Delete a review"""
        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404

        try:
            # using delete() method from Review class to check if the user is admin
            review.delete(current_user)
        except PermissionError as e:
            return {'error': str(e)}, 403

        result = facade.delete_review(review_id)
        if not result:
            return {'error': 'Delete failed'}, 500
        return {'message': 'Review deleted successfully'}, 200


@api.route('/places/<place_id>/reviews')
class PlaceReviewList(Resource):
    @api.response(200, 'List of reviews for the place retrieved successfully')
    @api.response(404, 'Place not found')
    def get(self, place_id):
        """Get all reviews for a specific place"""
        reviews = facade.get_reviews_by_place(place_id)
        # if reviews is None or len(reviews) == 0:
        if not reviews:
            return {'error': 'Place not found or no reviews for this place'}, 404

        review_list = []
        for review in reviews:
            review_list.append({
                'id': review.id,
                'text': review.text,
                'rating': review.rating,
                'user_id': review.user.id,
                'place_id': review.place.id
            })

        return review_list, 200
