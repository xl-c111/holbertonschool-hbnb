from flask_restx import Namespace, Resource, fields
from flask import request
from app.services import facade
from flask_jwt_extended import jwt_required, get_jwt_identity


api = Namespace('places', description='Place operations')


place_model = api.model('Place', {
    'id': fields.String(readonly=True, description='Unique identifier for the place'),
    'title': fields.String(required=True, description='Title of the place'),
    'description': fields.String(required=True, description='Description of the place'),
    'price': fields.Float(required=True , description='Price per night for the place'),
    'latitude': fields.Float(required=True, description='Latitude of the place'),
    'longitude': fields.Float(required=True, description='Longitude of the place'),
    'amenities': fields.List(fields.String), #  to attach amenities
})

def serialize_place(place):
    return {
        "id": place.id,
        "title": place.title,
        "description": place.description,
        "price": place.price,
        "latitude": place.latitude,
        "longitude": place.longitude,
        "amenities": [str(a.id) for a in getattr(place, "amenities", [])]
    }

@api.route('/')
class PlaceList(Resource):
    @api.expect(place_model)
    @api.marshal_with(place_model, code=201)
    @jwt_required()
    def post(self):
        current_user = get_jwt_identity()
        user_obj = facade.get_user(current_user['id'])
        data = request.json
        data['owner'] = user_obj
        data['status'] = 'pending_approval'
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
        places = facade.get_all_places()
        if not places:
            return {"error": "Place not found"}, 404
        # Fetch the place by ID
        return serialize_place(places)

    @api.expect(place_model)
    @api.marshal_with(place_model)
    @jwt_required()
    def put(self, place_id):
        current_user = get_jwt_identity()
        place = facade.get_place(place_id)

        if not place:
            return {"error": "Place not found"}, 404

        if str(place.owner.id) != current_user['id']:
            # Ensure the current user is the owner of the place
            return {"error": "Only the owner can update this place"}, 403
        data = request.json
        updated_place = facade.update_place(place_id, data)
        return serialize_place(updated_place)

    @jwt_required()
    def delete(self, place_id):
        current_user = get_jwt_identity()
        place = facade.get_place(place_id)

        if not place:
            return {"error": "Place not found"}, 404

        if str(place.owner.id) != current_user['id']:
            return {"error": "Only the owner can delete this place"}, 403
        facade.delete_place(place_id)
        return 'Place deleted successfully', 204