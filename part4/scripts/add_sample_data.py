#!/usr/bin/env python3
"""Add sample data to the database for testing"""
import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.place import Place
from app.models.amenity import Amenity
from app.models.review import Review
import uuid

app = create_app()

with app.app_context():
    # Create first test user (Alice)
    existing_user1 = User.query.filter_by(email='alice@example.com').first()
    if existing_user1:
        user1 = existing_user1
        print(f"Using existing user: {user1.email}")
    else:
        print("Creating first test user (Alice)...")
        user1 = User(
            id=str(uuid.uuid4()),
            first_name='Alice',
            last_name='Smith',
            email='alice@example.com',
            is_admin=False
        )
        user1.hash_password('Password123!')
        db.session.add(user1)
        db.session.commit()
        print(f"✅ Test user 1 created: {user1.email}")

    # Create second test user (Bob)
    existing_user2 = User.query.filter_by(email='bob@example.com').first()
    if existing_user2:
        user2 = existing_user2
        print(f"Using existing user: {user2.email}")
    else:
        print("Creating second test user (Bob)...")
        user2 = User(
            id=str(uuid.uuid4()),
            first_name='Bob',
            last_name='Johnson',
            email='bob@example.com',
            is_admin=False
        )
        user2.hash_password('Password123!')
        db.session.add(user2)
        db.session.commit()
        print(f"✅ Test user 2 created: {user2.email}")

    # Create sample places - split between Alice and Bob
    places_data = [
        {
            'title': 'Haunted Mansion',
            'description': 'A spooky Victorian mansion with mysterious sounds at night',
            'price': 150.0,
            'latitude': 40.7128,
            'longitude': -74.0060,
            'owner': user1  # Alice's place
        },
        {
            'title': 'Ghostly Cottage',
            'description': 'A cozy cottage in the woods with paranormal activity',
            'price': 75.0,
            'latitude': 42.3601,
            'longitude': -71.0589,
            'owner': user2  # Bob's place
        },
        {
            'title': 'Mysterious Castle',
            'description': 'An ancient castle with secret passages and eerie whispers',
            'price': 250.0,
            'latitude': 51.5074,
            'longitude': -0.1278,
            'owner': user1  # Alice's place
        },
        {
            'title': 'Cozy Beach House',
            'description': 'A beautiful beachfront property with ocean views',
            'price': 200.0,
            'latitude': 34.0522,
            'longitude': -118.2437,
            'owner': user2  # Bob's place
        }
    ]

    created_places = []
    for place_data in places_data:
        owner = place_data.pop('owner')
        # Check if place already exists
        existing = Place.query.filter_by(title=place_data['title']).first()
        if not existing:
            place = Place(
                id=str(uuid.uuid4()),
                title=place_data['title'],
                description=place_data['description'],
                price=place_data['price'],
                latitude=place_data['latitude'],
                longitude=place_data['longitude'],
                owner_id=owner.id
            )
            db.session.add(place)
            created_places.append(place)
            print(f"Created place: {place.title} (owner: {owner.first_name})")
        else:
            # Update existing place with correct owner
            existing.owner_id = owner.id
            db.session.add(existing)
            created_places.append(existing)
            print(f"Updated place: {existing.title} (owner: {owner.first_name})")

    # Create sample amenities
    amenities_data = [
        {'name': 'WiFi', 'description': 'High-speed internet'},
        {'name': 'Parking', 'description': 'Free parking available'},
        {'name': 'Pool', 'description': 'Swimming pool'}
    ]

    for amenity_data in amenities_data:
        existing = Amenity.query.filter_by(name=amenity_data['name']).first()
        if not existing:
            amenity = Amenity(
                id=str(uuid.uuid4()),
                name=amenity_data['name'],
                description=amenity_data['description']
            )
            db.session.add(amenity)
            print(f"Created amenity: {amenity.name}")
        else:
            print(f"Amenity already exists: {existing.name}")

    db.session.commit()
    print("\n✅ Sample data added successfully!")
    print(f"Total users: {User.query.count()}")
    print(f"Total places: {Place.query.count()}")
    print(f"Total amenities: {Amenity.query.count()}")
    print("\n📝 Test Accounts:")
    print("   Alice (has 2 places):")
    print("     Email: alice@example.com")
    print("     Password: Password123!")
    print("   Bob (has 2 places):")
    print("     Email: bob@example.com")
    print("     Password: Password123!")
    print("\n💡 Testing Tips:")
    print("   - Login as Alice to review Bob's places")
    print("   - Login as Bob to review Alice's places")
    print("   - You CANNOT review your own places!")
