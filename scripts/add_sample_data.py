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

DEFAULT_PASSWORD = 'Strongpass123!'

app = create_app()

with app.app_context():
    print("🚀 Setting up sample data for HBnB...\n")

    # Create multiple hosts to demonstrate multi-tenant architecture
    hosts_data = [
        {
            'email': 'john.doe@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'phone': '+1 (555) 987-6543',
            'location': 'San Francisco, CA',
            'is_admin': False
        },
        {
            'email': 'sarah.chen@example.com',
            'first_name': 'Sarah',
            'last_name': 'Chen',
            'phone': '+1 (555) 234-5678',
            'location': 'Seattle, WA',
            'is_admin': False
        },
        {
            'email': 'mike.johnson@example.com',
            'first_name': 'Mike',
            'last_name': 'Johnson',
            'phone': '+1 (555) 876-5432',
            'location': 'Portland, OR',
            'is_admin': False
        }
    ]

    hosts = {}
    print("👥 Creating host accounts...")
    for host_data in hosts_data:
        existing = User.query.filter_by(email=host_data['email']).first()
        if existing:
            host = existing
            host.hash_password(DEFAULT_PASSWORD)  # Update password to new default
            print(f"   ✓ Updated: {host.email}")
        else:
            host = User(
                id=str(uuid.uuid4()),
                first_name=host_data['first_name'],
                last_name=host_data['last_name'],
                email=host_data['email'],
                is_admin=host_data['is_admin']
            )
            host.hash_password(DEFAULT_PASSWORD)
            db.session.add(host)
            print(f"   ✅ Created: {host.email}")

        # Update contact info
        host.phone_number = host_data['phone']
        host.home_location = host_data['location']
        hosts[host_data['email']] = host

    db.session.commit()

    # Curated properties distributed across multiple hosts
    # This demonstrates multi-tenant architecture
    places_data = [
        # John Doe's properties (luxury/premium)
        {
            'owner': 'john.doe@example.com',
            'title': 'Mirror House Sud',
            'description': 'Stunning modernist retreat with floor-to-ceiling reflective glass walls nestled among apple orchards with breathtaking Dolomites views. Features minimalist luxury interiors, designer furnishings, spa-like bathrooms, and private terraces. The mirrored facade seamlessly blends architecture with nature, creating an ever-changing canvas of mountain beauty and orchard serenity.',
            'price': 1600.0,
            'latitude': 46.498295,
            'longitude': 11.354758
        },
        {
            'owner': 'john.doe@example.com',
            'title': 'Lake Tahoe Modern Lakehouse',
            'description': 'Architectural gem on Lake Tahoe\'s north shore featuring expansive windows framing crystal-clear waters and Sierra Nevada peaks. Includes private dock, chef\'s kitchen, stone fireplace, and master suite with lake-view soaking tub. Multiple deck spaces perfect for BBQs and stargazing, with direct access to water activities and nearby ski resorts.',
            'price': 1750.0,
            'latitude': 39.096849,
            'longitude': -120.032351
        },
        {
            'owner': 'john.doe@example.com',
            'title': 'Palm Springs Desert Retreat',
            'description': 'Mid-century modern desert sanctuary showcasing clean lines and floor-to-ceiling glass walls. Features saltwater infinity pool, spa grotto, vintage designer furniture, and three en-suite bedrooms. Professional desert landscaping with native cacti frames dramatic mountain views, while being minutes from downtown Palm Springs dining and shopping.',
            'price': 1450.0,
            'latitude': 33.830296,
            'longitude': -116.545292
        },

        # Sarah Chen's properties (coastal/mountain)
        {
            'owner': 'sarah.chen@example.com',
            'title': 'Mountain Villa Aspen',
            'description': 'Expansive luxury villa on Aspen\'s slopes combining rustic mountain charm with modern sophistication. Features vaulted ceilings, river-rock fireplace, gourmet kitchen, five bedroom suites, and panoramic peak views. Includes home theater, game room, private hot tub, heated garage, and ski-in access to world-class slopes.',
            'price': 2200.0,
            'latitude': 39.191098,
            'longitude': -106.817539
        },
        {
            'owner': 'sarah.chen@example.com',
            'title': 'Malibu Beach House',
            'description': 'Contemporary oceanfront masterpiece with walls of sliding glass opening to private beach access. Features polished concrete floors, chef\'s kitchen, designer furnishings, and three bedrooms including luxurious master suite. Private deck spans the full length with multiple lounging areas, perfect for watching surfers and spectacular Pacific sunsets.',
            'price': 1850.0,
            'latitude': 34.025921,
            'longitude': -118.779757
        },

        # Mike Johnson's property (affordable/cozy)
        {
            'owner': 'mike.johnson@example.com',
            'title': 'Forest Cabin Portland',
            'description': 'Enchanting Douglas-fir cabin in lush Pacific Northwest forest featuring massive windows bringing nature inside. Includes wood-burning fireplace, cozy reading nook, sleeping loft with skylight, and wraparound deck with Adirondack chairs. Direct trail access to old-growth forest and waterfalls, yet only 20 minutes from downtown Portland.',
            'price': 950.0,
            'latitude': 45.5152,
            'longitude': -122.6784
        }
    ]

    print("\n🏠 Creating properties...")
    for place_data in places_data:
        owner = hosts[place_data['owner']]
        existing = Place.query.filter_by(title=place_data['title']).first()

        if existing:
            existing.description = place_data['description']
            existing.price = place_data['price']
            existing.latitude = place_data['latitude']
            existing.longitude = place_data['longitude']
            existing.owner_id = owner.id
            db.session.add(existing)
            print(f"   ✓ Updated: {existing.title} (Owner: {owner.first_name})")
        else:
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
            print(f"   ✅ Created: {place.title} (Owner: {owner.first_name})")

    # Create sample amenities
    print("\n✨ Creating amenities...")
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
            print(f"   ✅ Created: {amenity.name}")
        else:
            print(f"   ✓ Exists: {existing.name}")

    # Create guest users for reviews
    print("\n👤 Creating guest accounts for reviews...")
    guests_data = [
        {'email': 'emma.wilson@example.com', 'first_name': 'Emma', 'last_name': 'Wilson'},
        {'email': 'alex.martinez@example.com', 'first_name': 'Alex', 'last_name': 'Martinez'},
        {'email': 'lisa.anderson@example.com', 'first_name': 'Lisa', 'last_name': 'Anderson'}
    ]

    guests = {}
    for guest_data in guests_data:
        existing = User.query.filter_by(email=guest_data['email']).first()
        if existing:
            guest = existing
            guest.hash_password(DEFAULT_PASSWORD)  # Update password to new default
            print(f"   ✓ Updated: {guest.email}")
        else:
            guest = User(
                id=str(uuid.uuid4()),
                first_name=guest_data['first_name'],
                last_name=guest_data['last_name'],
                email=guest_data['email'],
                is_admin=False
            )
            guest.hash_password(DEFAULT_PASSWORD)
            db.session.add(guest)
            print(f"   ✅ Created: {guest.email}")
        guests[guest_data['email']] = guest

    db.session.commit()

    # Create sample reviews for properties
    print("\n⭐ Creating sample reviews...")

    # Get all places to add reviews
    all_places = Place.query.all()

    reviews_data = [
        {
            'place_title': 'Mirror House Sud',
            'user_email': 'emma.wilson@example.com',
            'rating': 5,
            'text': 'Absolutely stunning property! The mirror architecture blends beautifully with the apple orchards. Perfect for a peaceful getaway in the Dolomites. Would definitely stay again!'
        },
        {
            'place_title': 'Mountain Villa Aspen',
            'user_email': 'alex.martinez@example.com',
            'rating': 5,
            'text': 'Dream ski vacation! The villa offers incredible mountain views and easy access to the slopes. Sarah was a wonderful host. Highly recommended for winter sports enthusiasts.'
        },
        {
            'place_title': 'Malibu Beach House',
            'user_email': 'lisa.anderson@example.com',
            'rating': 4,
            'text': 'Beautiful beachfront location with amazing ocean views. The deck is perfect for morning coffee and sunset watching. Only minor issue was some traffic noise, but overall a fantastic stay.'
        },
        {
            'place_title': 'Forest Cabin Portland',
            'user_email': 'emma.wilson@example.com',
            'rating': 5,
            'text': 'Cozy cabin surrounded by nature! Perfect for disconnecting and enjoying the forest. The fireplace made evenings so relaxing. Great value for the price.'
        },
        {
            'place_title': 'Palm Springs Desert Retreat',
            'user_email': 'alex.martinez@example.com',
            'rating': 5,
            'text': 'Modern desert oasis! The pool and spa were amazing after hiking. Architecture is stunning and the mountain vistas are breathtaking. John thought of everything!'
        },
        {
            'place_title': 'Lake Tahoe Modern Lakehouse',
            'user_email': 'lisa.anderson@example.com',
            'rating': 5,
            'text': 'Lakefront paradise! Waking up to Tahoe views was magical. The private dock made kayaking easy. Clean, modern, and perfectly located. Will be back next summer!'
        }
    ]

    for review_data in reviews_data:
        place = Place.query.filter_by(title=review_data['place_title']).first()
        if not place:
            continue

        user = guests[review_data['user_email']]

        # Check if review already exists
        existing_review = Review.query.filter_by(
            place_id=place.id,
            user_id=user.id
        ).first()

        if existing_review:
            existing_review.rating = review_data['rating']
            existing_review.text = review_data['text']
            db.session.add(existing_review)
            print(f"   ✓ Updated: {place.title} ({review_data['rating']}⭐)")
        else:
            review = Review(
                id=str(uuid.uuid4()),
                place_id=place.id,
                user_id=user.id,
                rating=review_data['rating'],
                text=review_data['text']
            )
            db.session.add(review)
            print(f"   ✅ Created: {place.title} ({review_data['rating']}⭐)")

    db.session.commit()

    # Summary
    print("\n" + "="*60)
    print("✅ Sample data loaded successfully!")
    print("="*60)
    print(f"\n📊 Database Summary:")
    print(f"   Total users: {User.query.count()}")
    print(f"   Total places: {Place.query.count()}")
    print(f"   Total amenities: {Amenity.query.count()}")
    print(f"   Total reviews: {Review.query.count()}")

    print(f"\n👥 Host Accounts (All use password: {DEFAULT_PASSWORD}):")
    print(f"   📧 john.doe@example.com - 3 properties (luxury tier)")
    print(f"   📧 sarah.chen@example.com - 2 properties (coastal/mountain)")
    print(f"   📧 mike.johnson@example.com - 1 property (cozy cabin)")

    print(f"\n👥 Guest Accounts (for booking/reviews, password: {DEFAULT_PASSWORD}):")
    print("   📧 emma.wilson@example.com")
    print("   📧 alex.martinez@example.com")
    print("   📧 lisa.anderson@example.com")

    print("\n💡 Testing Tips:")
    print("   - Login as any host to see their specific listings")
    print("   - Login as guest to book properties (hosts can't book their own)")
    print("   - Each property has real reviews from guests")
    print("   - Use Stripe test card: 4242 4242 4242 4242")
    print("   - All accounts use the same password for easy testing")
    print("\n" + "="*60 + "\n")
