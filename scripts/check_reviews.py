#!/usr/bin/env python3
"""Check if reviews exist in the database"""
import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import create_app
from app.models.review import Review
from app.models.place import Place

app = create_app()

with app.app_context():
    reviews = Review.query.all()
    places = Place.query.all()

    print(f"\n📊 Database Status:")
    print(f"   Total reviews: {len(reviews)}")
    print(f"   Total places: {len(places)}")

    if reviews:
        print("\n📝 Reviews found:")
        for review in reviews:
            place = Place.query.get(review.place_id)
            print(f"   - {place.title if place else 'Unknown Place'}: {review.rating}⭐ by User {review.user_id}")
            print(f"     \"{review.text[:50]}...\"")
    else:
        print("\n⚠️  No reviews found in database!")
        print("   Run: python3 scripts/add_sample_data.py")

    print("\n🏠 Places in database:")
    for place in places:
        place_reviews = Review.query.filter_by(place_id=place.id).all()
        print(f"   - {place.title}: {len(place_reviews)} review(s)")

    print()
