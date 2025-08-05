from app.extensions import db


place_amenity = db.Table(
    'place_amenity',
    db.Column('place_id', db.String(60), db.ForeignKey(
        'places.id'), primary_key=True, nullable=False),
    db.Column('amenity_id', db.String(60), db.ForeignKey(
        'amenities.id'), primary_key=True, nullable=False)
)
