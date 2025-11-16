#!/bin/bash
# Add Sample Data to Production Database
# Usage: ./add-production-data.sh

set -e  # Exit on error

EC2_IP="98.82.136.20"
SSH_KEY="$HOME/.ssh/hbnb-backend-key.pem"

echo "🗄️  Adding sample data to production database..."

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ubuntu@$EC2_IP << 'ENDSSH'
  set -e

  echo "📂 Navigating to project directory..."
  cd /home/ubuntu/holbertonschool-hbnb

  echo "📊 Adding sample data with production config..."
  source backend/venv/bin/activate

  python3 << 'EOPY'
import sys
sys.path.insert(0, 'backend')
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.place import Place
from app.models.review import Review

app = create_app('config.ProductionConfig')

with app.app_context():
    print("🚀 Adding sample data...")

    # Create hosts
    hosts = []
    hosts_data = [
        {'email': 'john.doe@example.com', 'first_name': 'John', 'last_name': 'Doe'},
        {'email': 'sarah.chen@example.com', 'first_name': 'Sarah', 'last_name': 'Chen'},
        {'email': 'mike.johnson@example.com', 'first_name': 'Mike', 'last_name': 'Johnson'}
    ]

    for data in hosts_data:
        existing = User.query.filter_by(email=data['email']).first()
        if not existing:
            user = User(email=data['email'], first_name=data['first_name'], last_name=data['last_name'])
            user.hash_password('Strongpass123!')
            db.session.add(user)
            hosts.append(user)
        else:
            hosts.append(existing)

    # Create guests
    guests = []
    guests_data = [
        {'email': 'emma.wilson@example.com', 'first_name': 'Emma', 'last_name': 'Wilson'},
        {'email': 'alex.martinez@example.com', 'first_name': 'Alex', 'last_name': 'Martinez'},
        {'email': 'lisa.anderson@example.com', 'first_name': 'Lisa', 'last_name': 'Anderson'}
    ]

    for data in guests_data:
        existing = User.query.filter_by(email=data['email']).first()
        if not existing:
            user = User(email=data['email'], first_name=data['first_name'], last_name=data['last_name'])
            user.hash_password('Strongpass123!')
            db.session.add(user)
            guests.append(user)
        else:
            guests.append(existing)

    db.session.commit()
    print(f"✅ Created/verified {len(hosts) + len(guests)} users")

    # Create properties (only if they don't exist)
    properties_data = [
        {'title': 'Malibu Beach House', 'description': 'Beachfront modern hideaway in Malibu', 'price': 1850.0, 'lat': 34.0259, 'lon': -118.78, 'host_idx': 1},
        {'title': 'Mirror House Sud', 'description': 'Mirror Houses immersed in apple orchards with Dolomites views', 'price': 1600.0, 'lat': 46.4983, 'lon': 11.3548, 'host_idx': 0},
        {'title': 'Palm Springs Desert Retreat', 'description': 'Sculptural desert home with private pool and spa', 'price': 1450.0, 'lat': 33.8303, 'lon': -116.545, 'host_idx': 0},
        {'title': 'Lake Tahoe Modern Lakehouse', 'description': 'Glassy lakefront stay with private dock on Tahoe north shore', 'price': 1750.0, 'lat': 39.0968, 'lon': -120.032, 'host_idx': 0},
        {'title': 'Mountain Villa Aspen', 'description': 'Luxurious mountain villa near Aspen peaks with ski access', 'price': 2200.0, 'lat': 39.1911, 'lon': -106.818, 'host_idx': 1},
        {'title': 'Forest Cabin Portland', 'description': 'Cozy Douglas-fir cabin outside Portland with fireplace', 'price': 950.0, 'lat': 45.5152, 'lon': -122.678, 'host_idx': 2}
    ]

    places = []
    for data in properties_data:
        existing = Place.query.filter_by(title=data['title']).first()
        if not existing:
            place = Place(
                title=data['title'],
                description=data['description'],
                price=data['price'],
                latitude=data['lat'],
                longitude=data['lon'],
                owner_id=hosts[data['host_idx']].id
            )
            db.session.add(place)
            places.append(place)
        else:
            places.append(existing)

    db.session.commit()
    print(f"✅ Created/verified {len(places)} properties")

    # Create reviews
    reviews_data = [
        {'place_idx': 0, 'guest_idx': 2, 'text': 'Beautiful beachfront location! Amazing ocean views.', 'rating': 4},
        {'place_idx': 1, 'guest_idx': 0, 'text': 'Absolutely stunning! The mirror architecture is incredible.', 'rating': 5},
        {'place_idx': 2, 'guest_idx': 1, 'text': 'Modern desert oasis! Pool and spa were amazing.', 'rating': 5},
        {'place_idx': 3, 'guest_idx': 2, 'text': 'Lakefront paradise! Waking up to Tahoe views was magical.', 'rating': 5},
        {'place_idx': 4, 'guest_idx': 1, 'text': 'Dream ski vacation! Incredible mountain views.', 'rating': 5},
        {'place_idx': 5, 'guest_idx': 0, 'text': 'Cozy cabin surrounded by nature! Perfect for disconnecting.', 'rating': 5}
    ]

    for data in reviews_data:
        existing = Review.query.filter_by(
            user_id=guests[data['guest_idx']].id,
            place_id=places[data['place_idx']].id
        ).first()
        if not existing:
            review = Review(
                text=data['text'],
                rating=data['rating'],
                user_id=guests[data['guest_idx']].id,
                place_id=places[data['place_idx']].id
            )
            db.session.add(review)

    db.session.commit()
    print(f"✅ Created/verified reviews")
    print("\n✅ Sample data complete!")
EOPY

  echo "✅ Sample data added successfully!"
ENDSSH

echo ""
echo "✅ Production database populated!"
echo "🌐 You can now view properties at: https://d2gfqpg21nkiyl.cloudfront.net"
