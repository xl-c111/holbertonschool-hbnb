from flask_restx import Namespace, Resource, fields
from flask import request
from app.services import facade



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


def serialize_place(place):
    return {
        "id": place.id,
        "title": place.title,
        "description": place.description,
        "price": place.price,
        "latitude": place.latitude,
        "longitude": place.longitude,
        "amenities": [str(a.id) for a in getattr(place, "amenities", [])],
        "owner_id": str(place.owner.id) if place.owner else None
    }


@api.route('/')
class PlaceList(Resource):
    @api.expect(place_model)
    @api.marshal_with(place_model, code=201)
    def post(self):
        data = request.json
        new_place = facade.create_place(data)
        if new_place:
            return serialize_place(new_place), 201
        return {'message': 'Failed to create place'}, 400

    @api.marshal_list_with(place_model)
    def get(self):
        return [serialize_place(place) for place in facade.get_all_places()]


@api.route('/<string:place_id>')
class PlaceResource(Resource):
    @api.marshal_with(place_model)
    def get(self, place_id):
        places = facade.get_place(place_id)
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
        updated_place = facade.update_by_owner_or_admin(place_id, data)
        return serialize_place(updated_place)


    def delete(self, place_id):
        place = facade.get_place(place_id)
        if not place:
            return {"error": "Place not found"}, 404
        facade.delete_place(place_id)
        return 'Place deleted successfully', 204
