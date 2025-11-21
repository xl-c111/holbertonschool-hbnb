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

# Input model (for creating/updating places - no owner_id)
place_input_model = api.model('PlaceInput', {
    'title': fields.String(required=True, description='Title of the place', example='Luxury Beachfront Villa'),
    'description': fields.String(required=True, description='Description of the place', example='Beautiful 3-bedroom villa with ocean views'),
    'price': fields.Float(required=True, description='Price per night in USD', example=500.00),
    'latitude': fields.Float(required=True, description='Latitude coordinate', example=34.0522),
    'longitude': fields.Float(required=True, description='Longitude coordinate', example=-118.2437)
})

# Output model (for responses - includes owner_id)
place_model = api.model('Place', {
    'id': fields.String(readonly=True, description='Place ID', example='550e8400-e29b-41d4-a716-446655440000'),
    'title': fields.String(required=True, description='Title of the place', example='Luxury Beachfront Villa'),
    'description': fields.String(description='Description of the place', example='Beautiful 3-bedroom villa with ocean views'),
    'price': fields.Float(required=True, description='Price per night in USD', example=500.00),
    'latitude': fields.Float(required=True, description='Latitude coordinate', example=34.0522),
    'longitude': fields.Float(required=True, description='Longitude coordinate', example=-118.2437),
    'owner_id': fields.String(description='ID of the property owner', example='550e8400-e29b-41d4-a716-446655440001'),
    'amenities': fields.List(fields.Nested(amenity_model), description='List of amenities'),
    'reviews': fields.List(fields.Nested(review_model), description='List of reviews')
})

error_model = api.model('Error', {
    'error': fields.String(description='Error message', example='Place not found')
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
    @api.doc(
        description='Create a new property listing (authentication required)',
        responses={
            201: ('Place created successfully', place_model),
            400: ('Validation error', error_model),
            401: ('Authentication required', error_model),
            404: ('User not found', error_model)
        },
        security='Bearer Auth'
    )
    @api.expect(place_input_model)
    @jwt_required()
    def post(self):
        """Create a new property listing"""
        user_id = get_jwt_identity()

        # Get the actual user object
        user = facade.get_user(user_id)
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

    @api.doc(
        description='Retrieve all property listings with amenities and reviews',
        responses={
            200: ('List of places', [place_model])
        }
    )
    @api.marshal_list_with(place_model)
    def get(self):
        """Get all property listings"""
        return [serialize_place(place) for place in facade.get_all_places()]


@api.route('/<string:place_id>')
class PlaceResource(Resource):
    @api.doc(
        description='Retrieve detailed information about a specific property including amenities and reviews',
        params={'place_id': 'The unique identifier of the place'},
        responses={
            200: ('Place details', place_model),
            404: ('Place not found', error_model)
        }
    )
    @api.marshal_with(place_model)
    def get(self, place_id):
        """Get property details by ID"""
        places = facade.get_place_with_details(place_id)
        if not places:
            return {"error": "Place not found"}, 404
        # Fetch the place by ID
        return serialize_place(places)

    @api.doc(
        description='Update property details (owner only)',
        params={'place_id': 'The unique identifier of the place'},
        responses={
            200: ('Place updated successfully', place_model),
            400: ('Validation error', error_model),
            401: ('Authentication required', error_model),
            403: ('Not authorized - only owner can update', error_model),
            404: ('Place not found', error_model)
        },
        security='Bearer Auth'
    )
    @jwt_required()
    @api.expect(place_input_model)
    @api.marshal_with(place_model)
    def put(self, place_id):
        """Update property listing (owner only)"""
        place = facade.get_place(place_id)
        if not place:
            return {"error": "Place not found"}, 404
        data = request.json or {}

        user_id = get_jwt_identity()
        user = facade.get_user(user_id)
        if not user:
            return {"error": "User not found"}, 404
        try:
            updated_place = place.update_by_owner_or_admin(user, **data)
            return serialize_place(updated_place)
        except PermissionError as e:
            return {"error": str(e)}, 403

    @jwt_required()
    def delete(self, place_id):
        place = facade.get_place(place_id)
        if not place:
            return {"error": "Place not found"}, 404
        user_id = get_jwt_identity()
        user = facade.get_user(user_id)
        if not user:
            return {"error": "User not found"}, 404
        # Only owner or admin can delete
        if place.owner_id != user.id and not getattr(user, 'is_admin', False):
            return {"error": "Unauthorized action"}, 403
        facade.delete_place(place_id)
        return {"message": "Place deleted successfully"}, 200


@api.route('/<string:place_id>/amenities/<string:amenity_id>')
class PlaceAmenityResource(Resource):
    @jwt_required()
    def post(self, place_id, amenity_id):
        place = facade.get_place(place_id)
        if not place:
            return {"error": "Place not found"}, 404
        user_id = get_jwt_identity()
        user = facade.get_user(user_id)
        if not user:
            return {"error": "User not found"}, 404

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

    @jwt_required()
    def delete(self, place_id, amenity_id):
        place = facade.get_place(place_id)
        if not place:
            return {"error": "Place not found"}, 404
        user_id = get_jwt_identity()
        user = facade.get_user(user_id)
        if not user:
            return {"error": "User not found"}, 404

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
                'user_name': f"{review.user.first_name} {review.user.last_name}" if review.user else "Anonymous",
                'place_id': review.place_id
            })
        return review_list, 200
