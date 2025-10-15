-- Basic Tables Setup for YSI Backend
-- Creates essential tables needed for application startup

-- Users table
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

-- Organizations table
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

-- Sessions table
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

-- Create default admin user if not exists
-- Note: Password hash will be created by init_test_db.py script using proper bcrypt
-- This is just a placeholder for manual creation if needed

-- Create default organization if not exists
INSERT INTO organizations (name, description, organization_type)
SELECT 'YSI Organization', 
       'Youth & Social Innovation Initiative', 
       'ngo'
WHERE NOT EXISTS (
    SELECT 1 FROM organizations WHERE name = 'YSI Organization'
);

-- Log successful initialization
SELECT 'Basic tables and default data created successfully' AS status;
