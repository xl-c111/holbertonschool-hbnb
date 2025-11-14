#!/usr/bin/env python3
"""
Database initialization script for AWS RDS deployment.

Run this script to create all database tables in production.

Usage:
    python init_db.py
"""

from app import create_app
from app.extensions import db
import os


def init_database():
    """Initialize database tables."""
    # Get configuration from environment or use production by default
    config_class = os.getenv('FLASK_CONFIG', 'config.ProductionConfig')

    print(f"Creating app with config: {config_class}")
    app = create_app(config_class)

    with app.app_context():
        try:
            # Create all tables
            print("Creating database tables...")
            db.create_all()
            print("✓ Database tables created successfully!")

            # List all tables created
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()

            print(f"\nCreated {len(tables)} tables:")
            for table in tables:
                print(f"  - {table}")

        except Exception as e:
            print(f"✗ Error creating database tables: {e}")
            raise


if __name__ == "__main__":
    init_database()
