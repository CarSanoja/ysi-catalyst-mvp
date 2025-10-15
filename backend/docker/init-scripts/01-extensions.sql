-- PostgreSQL Extensions Setup for YSI Backend
-- This script runs automatically when PostgreSQL container starts

-- Enable UUID extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Vector extension for pgvector support
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enable other useful extensions
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";  -- Query performance monitoring
CREATE EXTENSION IF NOT EXISTS "pg_trgm";             -- Trigram matching for text search

-- Log successful initialization
SELECT 'PostgreSQL extensions initialized successfully' AS status;
