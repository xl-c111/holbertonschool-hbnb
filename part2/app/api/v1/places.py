from flask_restx import Namespace, Resource, fields
from flask import request
from app.services import facade
from app.persistence.repository import InMemoryRepository
from flask_jwt_extended import jwt_required, get_jwt_identity


api = Namespace('places', description='Place operations')


place_model = api.model('Place', {
    'id': fields.String(readonly=True),
    'title': fields.String(required=True),
    'description': fields.String(required=True),
    'price': fields.Float(required=True),
    'latitude': fields.Float(required=True),
    'longitude': fields.Float(required=True),
    'owner_id': fields.String(required=True),  # pass owner's user_id
    'amenity_ids': fields.List(fields.String), # optional, to attach amenities
})

@api.route('/')
class PlaceList(Resource):
    @api.marshal_list_with(place_model)
    def get(self):
        return facade.get_all_places()

    @api.expect(place_model)
    @api.marshal_with(place_model, code=201)
    @jwt_required()
    def post(self):
        current_user = get_jwt_identity()
        data = request.json
        data['owner_id'] = current_user['id']
        data['status'] = 'pending_approval'
        return facade.create_place(data), 201

@api.route('/<string:place_id>')
class PlaceResource(Resource):
    @api.marshal_with(place_model)
    def get(self, place_id):
        return facade.get_place(place_id)

    @api.expect(place_model)
    @api.marshal_with(place_model)
    @jwt_required()
    def put(self, place_id):
        current_user = get_jwt_identity()
        place = facade.get_place(place_id)

        if place['owner_id'] != current_user['id']:
            return {"error": "Only the owner can update this place"}, 403
        data = request.json
        data['status'] = 'pending_approval'
        return facade.update_place(place_id, data)

    @jwt_required()
    def delete(self, place_id):
        current_user = get_jwt_identity()
        place = facade.get_place(place_id)

        if place['owner_id'] != current_user['id']:
            return {"error": "Only the owner can delete this place"}, 403
        # Mark for deletion, pending admin approval
        return facade.request_delete_place(place_id)

#  ________________Admin Approval Endpoint_____________________
# This endpoint allows an admin to approve a place for public visibility.

@api.route('/<string:place_id>/approve')
class PlaceApproval(Resource):
    @jwt_required()
    def post(self, place_id):
        current_user = get_jwt_identity()
        if current_user.get("role") != "admin":
            return {"error": "Admin access required"}, 403
        return facade.approve_place(place_id)

@api.route('/<string:place_id>/reject')
class PlaceRejection(Resource):
    @jwt_required()
    def post(self, place_id):
        current_user = get_jwt_identity()
        if current_user.get("role") != "admin":
            return {"error": "Admin access required"}, 403
        return facade.reject_place(place_id)

@api.route('/<string:place_id>/delete')
class PlaceDeletion(Resource):
    @jwt_required()
    def post(self, place_id):
        current_user = get_jwt_identity()
        if current_user.get("role") != "admin":
            return {"error": "Admin access required"}, 403
        return facade.delete_place(place_id)


