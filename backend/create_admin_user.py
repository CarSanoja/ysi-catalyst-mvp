"""
Script to create admin user
Email: carlos.6sanoja@gmail.com
Password: Carlos123*
Role: admin
"""
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.core.config import settings
from app.models.user import User

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_admin_user():
    """Create admin user in database"""

    engine = create_engine(settings.DATABASE_URL)

    with Session(engine) as session:
        # Check if user already exists
        existing_user = session.query(User).filter(User.email == "carlos.6sanoja@gmail.com").first()

        if existing_user:
            print(f"✓ User already exists: {existing_user.email}")
            print(f"  Role: {existing_user.role}")
            print(f"  Active: {existing_user.is_active}")

            # Update password if user wants
            response = input("\nDo you want to update the password? (y/n): ")
            if response.lower() == 'y':
                existing_user.hashed_password = get_password_hash("Carlos123*")
                session.commit()
                print("✓ Password updated successfully!")
            return

        # Create new admin user
        admin_user = User(
            email="carlos.6sanoja@gmail.com",
            hashed_password=get_password_hash("Carlos123*"),
            full_name="Carlos Sanoja",
            role="admin",
            is_active=True,
            is_superuser=True
        )

        session.add(admin_user)
        session.commit()
        session.refresh(admin_user)

        print("=" * 60)
        print("✅ Admin user created successfully!")
        print("=" * 60)
        print(f"Email: {admin_user.email}")
        print(f"Password: Carlos123*")
        print(f"Role: {admin_user.role}")
        print(f"ID: {admin_user.id}")
        print("=" * 60)


if __name__ == "__main__":
    print("=" * 60)
    print("Creating Admin User")
    print("=" * 60)
    print()

    try:
        create_admin_user()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
