from app.persistence.repository import InMemoryRepository
from app.models.place import Place


class HBnBFacade:
    def __init__(self):
        self.user_repo = InMemoryRepository()
        self.place_repo = InMemoryRepository()
        self.review_repo = InMemoryRepository()
        self.amenity_repo = InMemoryRepository()

    # Placeholder method for creating a user
    def create_user(self, user_data):
        # Logic will be implemented in later tasks
        pass




    #  _________________Place Operations____________________

    def place_exists(self, place_id):
        return self.place_repo.get(place_id) is not None

    # Placeholder method for creating a place
    def create_place(self, data):
        required_fields = ['title', 'description', 'price', 'latitude', 'longitude', 'owner']
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing field: {field}")
        place = Place(**data)
        self.place_repo.create(place.id, place)
        return place

    # Placeholder method for fetching all places
    def get_all_places(self):
        return self.place_repo.get_all()

    # Placeholder method for fetching a place by ID
    def get_place(self, place_id):
       return self.place_repo.get(place_id)


    # Placeholder method for updating a place
    def update_place(self, place_id, place_data):
        place = self.place_repo.get(place_id)
        if not place:
            return None
        # Update the place with the provided data
        for key in ['title', 'description', 'price', 'latitude', 'longitude']:
            if key in place_data:
                setattr(place, key, place_data[key])
        place.save()
        self.place_repo.update(place_id, place)
        return place


    # Placeholder method for deleting a place
    def request_delete_place(self, place_id):
        place = self.place_repo.get(place_id)
        if not place:
            return None
        self.place_repo.delete(place_id)
        return place



    #  _________________Amenity Operations____________________

    # Placeholder method for fetching all amenities
    def get_all_amenities(self):
        return self.amenity_repo.get_all()

    # Placeholder methof for creating an amenity
    def create_amenity(self, amenity_data, user_id):
        # check if place_id is provided
        place_id = amenity_data.get('place_id')
        if not place_id:
            raise ValueError("Missing field: place_id")

        # check if the place exists
        place = self.place_repo.get(place_id)
        if not place:
            raise ValueError(f"Place with ID {place_id} does not exist")

        # check if the user is the owner of the place
        if str(place.owner.id) != user_id:
            raise PermissionError("User is not the owner of the place")

        # create the amenity

        from app.models.amenity import Amenity
        amenity = Amenity(
        name=amenity_data['name'],
        description=amenity_data['description'],
        number=amenity_data['number'],
        place_id=place_id
    )
        self.amenity_repo.create(amenity.id, amenity)
        return amenity

    # Placeholder method for fetching an amenity by ID
    def get_amenity(self, amenity_id):
        return self.amenity_repo.get(amenity_id)


    # Placeholder method for updating an amenity
    def update_amenity(self, amenity_id, amenity_data):
        existing_amenity = self.amenity_repo.get(amenity_id)
        if not existing_amenity:
            return None
        for key in ['name', 'description', 'number']:
            if key in amenity_data:
                setattr(existing_amenity, key, amenity_data[key])
        existing_amenity.save()

        self.amenity_repo.update(amenity_id, existing_amenity)
        return existing_amenity

    # Placeholder method for deleting an amenity
    def delete_amenity(self, amenity_id):
        amenity = self.amenity_repo.get(amenity_id)
        if not amenity:
            return None
        self.amenity_repo.delete(amenity_id)
        return amenity

