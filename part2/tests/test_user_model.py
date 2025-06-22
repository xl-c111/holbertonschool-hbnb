from app.models.user import User


def test_user_creation():
    user = User(first_name="John", last_name="Doe",
                email="john.doe@example.com",  is_admin=False)
    assert user.first_name == "John"
    assert user.last_name == "Doe"
    assert user.email == "john.doe@example.com"
    assert user.is_admin == False

    print("User creation test passed!")


test_user_creation()
