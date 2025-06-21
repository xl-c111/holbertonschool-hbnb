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
        # Ownership is checked in the facade

        try:
            new_amenity = facade.create_amenity(data, current_user['id'])
            return new_amenity, 201
        except ValueError as e:
            return {"error": str(e)}, 400
        except PermissionError as e:
            return {"error": str(e)}, 403


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
        if not amenity:
            return {"error": "Amenity not found"}, 404
        # Check ownership
        place = facade.get_place(amenity.place_id)
        if not place or str(place.owner.id) != current_user['id']:
            return {"error": "Only the owner can update this amenity"}, 403
        data = request.json
        updated_amenity = facade.update_amenity(amenity_id, data)
        return updated_amenity

    @jwt_required()
    def delete(self, amenity_id):
        """Delete an amenity"""
        current_user = get_jwt_identity()
        amenity = facade.get_amenity(amenity_id)
        if not amenity:
            return {"error": "Amenity not found"}, 404
        # Check ownership via place
        place = facade.get_place(amenity.place_id)
        if not place or str(place.owner.id) != current_user['id']:
            return {"error": "Only the owner of the place can delete this amenity"}, 403
        facade.delete_amenity(amenity_id)
        return {"message": "Amenity deleted successfully"}, 204