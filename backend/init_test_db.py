#!/usr/bin/env python3

"""
Initialize Test Database
Creates basic tables and test data for RAGFlow integration testing
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import hashlib

# Add project to path
sys.path.append('/app')

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://ysi_user:ysi_password@postgres:5432/ysi_db")

def create_basic_tables(engine):
    """Create basic tables needed for the application"""
    
    with engine.connect() as conn:
        # Enable required extensions
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"))
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS \"vector\";"))
        print("✅ PostgreSQL extensions enabled")
        
        # Create users table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),
                role VARCHAR(50) DEFAULT 'shaper',
                is_active BOOLEAN DEFAULT true,
                is_superuser BOOLEAN DEFAULT false,
                avatar_s3_key VARCHAR(500),
                time_zone VARCHAR(50) DEFAULT 'UTC',
                language_preference VARCHAR(5) DEFAULT 'EN',
                notification_preferences JSONB DEFAULT '{}',
                dashboard_config JSONB DEFAULT '{}',
                last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                session_count INTEGER DEFAULT 0,
                insights_created INTEGER DEFAULT 0,
                documents_edited INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE
            );
        """))
        
        # Create organizations table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS organizations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                description TEXT,
                website VARCHAR(255),
                sector VARCHAR(255),
                region VARCHAR(255),
                organization_type VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE
            );
        """))
        
        # Create sessions table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                session_type VARCHAR(255),
                scheduled_at TIMESTAMP WITH TIME ZONE,
                duration_minutes INTEGER,
                is_chatham_house BOOLEAN DEFAULT false,
                recording_consent BOOLEAN DEFAULT false,
                language VARCHAR(10) DEFAULT 'en',
                agenda JSONB,
                notes JSONB,
                transcript TEXT,
                ai_summary TEXT,
                live_captions TEXT,
                capture_lanes_config JSONB DEFAULT '{}',
                processing_status VARCHAR(50) DEFAULT 'pending',
                recording_started_at TIMESTAMP WITH TIME ZONE,
                recording_ended_at TIMESTAMP WITH TIME ZONE,
                created_by_id INTEGER REFERENCES users(id),
                organization_id INTEGER REFERENCES organizations(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE
            );
        """))
        
        conn.commit()
        print("✅ Basic tables created successfully")

def create_test_user(engine):
    """Create test user for authentication"""
    
    with engine.connect() as conn:
        # Check if user exists
        result = conn.execute(text("SELECT id FROM users WHERE email = '12-11095@usb.ve'")).fetchone()
        
        if not result:
            # Hash password using bcrypt (same as the app)
            import bcrypt
            password = "Carlos123"
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            conn.execute(text("""
                INSERT INTO users (email, hashed_password, full_name, role, is_active, is_superuser)
                VALUES ('12-11095@usb.ve', :password, 'Carlos Test User', 'admin', true, true)
            """), {"password": hashed_password})
            
            conn.commit()
            print("✅ Test user created: 12-11095@usb.ve")
        else:
            print("✅ Test user already exists")

def create_test_organization(engine):
    """Create test organization"""
    
    with engine.connect() as conn:
        # Check if organization exists
        result = conn.execute(text("SELECT id FROM organizations WHERE name = 'YSI Test Organization'")).fetchone()
        
        if not result:
            conn.execute(text("""
                INSERT INTO organizations (name, description, organization_type)
                VALUES ('YSI Test Organization', 'Test organization for RAGFlow integration', 'testing')
            """))
            
            conn.commit()
            print("✅ Test organization created")
        else:
            print("✅ Test organization already exists")

def main():
    """Initialize test database"""
    print("🔧 Initializing YSI Test Database")
    print("=================================")
    
    try:
        # Create engine
        engine = create_engine(DATABASE_URL)
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database connection successful")
        
        # Create basic tables
        create_basic_tables(engine)
        
        # Create test data
        create_test_user(engine)
        create_test_organization(engine)
        
        print("")
        print("✅ Database initialization completed successfully!")
        print("")
        print("Test credentials:")
        print("  Email: 12-11095@usb.ve")
        print("  Password: Carlos123")
        print("  Role: admin")
        
        return True
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
