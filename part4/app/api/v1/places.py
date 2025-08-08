from flask_restx import Namespace, Resource, fields
from flask import request
from app.services import facade
from flask_jwt_extended import jwt_required, get_jwt_identity

api = Namespace('places', description='Place operations')

amenity_model = api.model('PlaceAmenity', {
    'id': fields.String(description='Amenity ID'),
    'name': fields.String(description='Name of the amenity')
})

user_model = api.model('PlaceUser', {
    'id': fields.String(description='User ID'),
    'first_name': fields.String(description='First name of the owner'),
    'last_name': fields.String(description='Last name of the owner'),
    'email': fields.String(description='Email of the owner')
})

review_model = api.model('PlaceReview', {
    'id': fields.String(description='Review ID'),
    'text': fields.String(description='Text of the review'),
    'rating': fields.Integer(description='Rating of the place (1-5)'),
    'user_id': fields.String(description='ID of the user')
})

place_model = api.model('Place', {
    'id': fields.String(readonly=True, description='Place ID'),
    'title': fields.String(required=True, description='Title of the place'),
    'description': fields.String(description='Description of the place'),
    'price': fields.Float(required=True, description='Price per night'),
    'latitude': fields.Float(required=True, description='Latitude of the place'),
    'longitude': fields.Float(required=True, description='Longitude of the place'),
    'owner_id': fields.String(required=True, description='ID of the owner'),
    'amenities': fields.List(fields.Nested(amenity_model), description='List of amenities'),
    'reviews': fields.List(fields.Nested(review_model), description='List of reviews')
})


def serialize_create_place(place):
    return {
        "id": place.id,
        "title": place.title,
        "description": place.description,
        "price": place.price,
        "latitude": place.latitude,
        "longitude": place.longitude,
        "owner_id": str(place.owner.id) if place.owner else None
    }

def serialize_place(place):
    return {
        "id": place.id,
        "title": place.title,
        "description": place.description,
        "price": place.price,
        "latitude": place.latitude,
        "longitude": place.longitude,
        "owner_id": str(place.owner.id) if place.owner else None,
        "amenities": [serialize_amenity(a) for a in place.amenities],
        "reviews": [serialize_review(r) for r in place.reviews]
    }

def serialize_amenity(amenity):
    return {
        "id": amenity.id,
        "name": amenity.name
    }

def serialize_review(review):
    return {
        "id": review.id,
        "text": review.text,
        "rating": review.rating,
        "user_id": review.user_id
    }

@api.route('/')
class PlaceList(Resource):
    @api.expect(place_model)
    @jwt_required()
    def post(self):
        current_user = get_jwt_identity()

        # Get the actual user object
        user = facade.get_user(current_user['id'])
        if not user:
            return {'error': 'User not found'}, 404

        # Get data from api.payload (not request.json)
        data = api.payload

        # Add the current user as owner
        data['owner_id'] = user.id

        try:
            new_place = facade.create_place(data)
            return serialize_create_place(new_place), 201
        except ValueError as e:
            return {'error': str(e)}, 400


    @api.marshal_list_with(place_model)
    def get(self):
        return [serialize_place(place) for place in facade.get_all_places()]


@api.route('/<string:place_id>')
class PlaceResource(Resource):
    @api.marshal_with(place_model)
    def get(self, place_id):
        places = facade.get_place_with_details(place_id)
        if not places:
            return {"error": "Place not found"}, 404
        # Fetch the place by ID
        return serialize_place(places)

    @api.expect(place_model)
    @api.marshal_with(place_model)
    def put(self, place_id):
        place = facade.get_place(place_id)
        if not place:
            return {"error": "Place not found"}, 404
        data = request.json

        current_user = place.owner
        try:
            updated_place = place.update_by_owner_or_admin(
                current_user, **data)
            return serialize_place(updated_place)

        except PermissionError as e:
            return {"error": str(e)}, 403

    def delete(self, place_id):
        place = facade.get_place(place_id)
        if not place:
            return {"error": "Place not found"}, 404
        facade.delete_place(place_id)
        return 'Place deleted successfully', 204


@api.route('/<string:place_id>/amenities/<string:amenity_id>')
class PlaceAmenityResource(Resource):
    def post(self, place_id, amenity_id):
        place = facade.get_place(place_id)
        if not place:
            return {"error": "Place not found"}, 404

        user = place.owner

        try:
            amenity = facade.add_amenity_to_place(place_id, amenity_id, user)
            if amenity is None:
                return {"error": "Place or Amenity not found"}, 404
            return {
                "id": amenity.id,
                "name": amenity.name
            }, 201
        except ValueError as e:
            return {"error": str(e)}, 400
        except PermissionError as e:
            return {"error": str(e)}, 403

    def delete(self, place_id, amenity_id):
        # Replace this with actual user context
        place = facade.get_place(place_id)
        if not place:
            return {"error": "Place not found"}, 404

        user = place.owner

        try:
            facade.delete_amenity_from_place(place_id, amenity_id, user)
            return {"message": "Amenity removed successfully"}, 200
        except ValueError as e:
            return {"error": str(e)}, 400
        except PermissionError as e:
            return {"error": str(e)}, 403

@api.route('/<string:place_id>/reviews')
class PlaceReviewList(Resource):
    @api.response(200, 'Reviews for place retrieved successfully')
    def get(self, place_id):
        """Retrieve reviews for a specific place"""
        reviews = facade.get_reviews_for_place(place_id)
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
