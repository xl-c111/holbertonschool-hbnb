from flask_restx import Namespace, Resource, fields
from flask import request
from app.services import facade


api = Namespace('amenities', description='Amenities operations')

amenity_model = api.model('Amenity', {
    'id': fields.String(readonly=True),
    'name': fields.String(required=True, description='Name of the amenity'),
    'description': fields.String(required=True, description='Description of the amenity'),
    'number' : fields.Integer(required=True, description='Number of this amenity available'),
})

amenity_brief_model = api.model('AmenityBrief', {
    'id': fields.String(readonly=True),
    'name': fields.String(required=True, description='Name of the amenity'),
})


@api.route('/')
class AmenityList(Resource):
    @api.marshal_list_with(amenity_model)
    def get(self):
        """Fetch all amenities"""
        return facade.get_all_amenities()

    @api.expect(amenity_model)
    @api.marshal_with(amenity_brief_model, code=201)
    def post(self):

        """Create a new amenity"""
        data = request.json

        if not data:
            return {"error": "No JSON data provided"}, 400

        try:
            new_amenity = facade.create_amenity(data)
            return {'id': new_amenity.id, 'name': new_amenity.name}, 201
        except ValueError as e:
            return {"error": str(e)}, 400
        except PermissionError as e:
            return {"error": str(e)}, 403
        except ValueError as e:
            print("DEBUG: ValueError thrown in POST:", e)
            return {"error": str(e)}, 400


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
    def put(self, amenity_id):
        """Update an existing amenity"""
        amenity = facade.get_amenity(amenity_id)
        if not amenity:
            return {"error": "Amenity not found"}, 404

        data = request.get_json()
        updated_amenity = facade.update_amenity(amenity_id, data)
        return updated_amenity, 200

    def delete(self, amenity_id):
        """Delete an amenity"""
        amenity = facade.get_amenity(amenity_id)
        if not amenity:
            return {"error": "Amenity not found"}, 404

        facade.delete_amenity(amenity_id)
        return {"message": "Amenity deleted successfully"}, 204
