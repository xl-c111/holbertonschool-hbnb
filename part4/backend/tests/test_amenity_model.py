import pytest

from app.models.amenity import Amenity


def test_amenity_to_dict_includes_expected_fields():
    amenity = Amenity(name="Wi-Fi", description="High speed", number=2)

    data = amenity.to_dict()

    assert data["name"] == "Wi-Fi"
    assert data["description"] == "High speed"
    assert data["number"] == 2


def test_amenity_name_validation_requires_non_empty_string():
    amenity = Amenity(description="desc", number=1)

    with pytest.raises(ValueError):
        amenity.name = "   "
