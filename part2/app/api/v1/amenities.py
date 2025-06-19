from flask_restx import Namespace, Resource, fields
from flask import request
from app.services import facade
from flask_jwt_extended import jwt_required, get_jwt_identity


api = Namespace('amenities', description='Amenities operations')

amenity_model = api.model('Amenity', {
    'id': fields.String(readonly=True),
    'name': fields.String(required=True, description='Name of the amenity'),
    'description': fields.String(required=True, description='Description of the amenity'),
    'number' : fields.Integer(required=True, description='Number of this amenity available'),
    'place_id': fields.String(required=True, description='ID of the place this amenity belongs to'),
})

@api.route('/')
class AmenityList(Resource):
    @api.marshal_list_with(amenity_model)
    def get(self):
        """Fetch all amenities"""
        return facade.get_all_amenities()

    @api.expect(amenity_model)
    @api.marshal_with(amenity_model, code=201)
    @jwt_required()
    def post(self):
        """Create a new amenity"""
        current_user = get_jwt_identity()
        data = request.json
        data['owner_id'] = current_user['id']
        return facade.create_amenity(data, current_user['id']), 201

@api.route('/<string:amenity_id>')
class AmenityResource(Resource):
    @api.marshal_with(amenity_model)
    def get(self, amenity_id):
        """Fetch an amenity by ID"""
        amenity = facade.get_amenity(amenity_id)
        if not amenity:
            return {"error": "Amenity not found"}, 404
        return amenity

    @api.expect(amenity_model)
    @api.marshal_with(amenity_model)
    @jwt_required()
    def put(self, amenity_id):
        """Update an existing amenity"""
        current_user = get_jwt_identity()
        amenity = facade.get_amenity(amenity_id)
        if amenity['owner_id'] != current_user['id']:
            return {"error": "Only the owner can update this amenity"}, 403
        data = request.json
        return facade.update_amenity(amenity_id, data)

    @jwt_required()
    def delete(self, amenity_id):
        """Delete an amenity"""
        current_user = get_jwt_identity()
        amenity = facade.get_amenity(amenity_id)
        if amenity['owner_id'] != current_user['id']:
            return {"error": "Only the owner can delete this amenity"}, 403
        return facade.delete_amenity(amenity_id)


