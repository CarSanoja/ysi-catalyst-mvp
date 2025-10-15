#!/usr/bin/env python3
"""
Database setup script for YSI MVP with pgvector
Initializes PostgreSQL database with vector extension and runs migrations
"""

import os
import sys
import asyncio
import subprocess
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent))

from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def check_postgresql_connection():
    """Check if PostgreSQL is running and accessible"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            logger.info(f"PostgreSQL connection successful: {version}")
            return True
    except Exception as e:
        logger.error(f"PostgreSQL connection failed: {str(e)}")
        return False


def enable_pgvector_extension():
    """Enable pgvector extension in PostgreSQL"""
    try:
        with engine.connect() as conn:
            # Enable vector extension
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm;"))
            conn.commit()
            
            # Verify extensions
            result = conn.execute(text("""
                SELECT extname FROM pg_extension 
                WHERE extname IN ('vector', 'pg_trgm');
            """))
            extensions = [row[0] for row in result.fetchall()]
            
            logger.info(f"Enabled extensions: {extensions}")
            return True
            
    except Exception as e:
        logger.error(f"Failed to enable pgvector extension: {str(e)}")
        return False


def run_alembic_migrations():
    """Run Alembic migrations"""
    try:
        # Initialize alembic if needed
        if not Path("alembic/versions").exists():
            logger.info("Initializing Alembic...")
            subprocess.run(["alembic", "init", "alembic"], check=True, cwd=".")
        
        # Run migrations
        logger.info("Running Alembic migrations...")
        result = subprocess.run(
            ["alembic", "upgrade", "head"], 
            check=True, 
            capture_output=True, 
            text=True,
            cwd="."
        )
        
        logger.info("Migrations completed successfully")
        logger.info(result.stdout)
        return True
        
    except subprocess.CalledProcessError as e:
        logger.error(f"Alembic migration failed: {str(e)}")
        logger.error(e.stderr)
        return False
    except FileNotFoundError:
        logger.error("Alembic not found. Install with: pip install alembic")
        return False


def create_tables():
    """Create database tables using SQLAlchemy"""
    try:
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Tables created successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to create tables: {str(e)}")
        return False


def verify_setup():
    """Verify that the setup was successful"""
    try:
        with engine.connect() as conn:
            # Check if pgvector is working
            conn.execute(text("SELECT '[1,2,3]'::vector;"))
            logger.info("✓ pgvector extension is working")
            
            # Check if tables exist
            result = conn.execute(text("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'text_embeddings';
            """))
            
            if result.fetchone():
                logger.info("✓ text_embeddings table exists")
            else:
                logger.warning("! text_embeddings table not found")
            
            # Check vector index
            result = conn.execute(text("""
                SELECT indexname FROM pg_indexes 
                WHERE tablename = 'text_embeddings' AND indexname = 'embedding_hnsw_idx';
            """))
            
            if result.fetchone():
                logger.info("✓ HNSW vector index exists")
            else:
                logger.warning("! HNSW vector index not found")
        
        return True
        
    except Exception as e:
        logger.error(f"Setup verification failed: {str(e)}")
        return False


def setup_database():
    """Complete database setup process"""
    logger.info("Starting YSI database setup with pgvector...")
    
    # Step 1: Check PostgreSQL connection
    if not check_postgresql_connection():
        logger.error("Cannot proceed without PostgreSQL connection")
        return False
    
    # Step 2: Enable pgvector extension
    if not enable_pgvector_extension():
        logger.error("Cannot proceed without pgvector extension")
        return False
    
    # Step 3: Run migrations or create tables
    migration_success = run_alembic_migrations()
    if not migration_success:
        logger.info("Alembic migration failed, trying direct table creation...")
        if not create_tables():
            logger.error("Table creation also failed")
            return False
    
    # Step 4: Verify setup
    if not verify_setup():
        logger.error("Setup verification failed")
        return False
    
    logger.info("🎉 Database setup completed successfully!")
    logger.info("Next steps:")
    logger.info("1. Install dependencies: pip install -r requirements.txt")
    logger.info("2. Run data ingestion: python -m app.scripts.data_ingestion")
    logger.info("3. Start the API server: uvicorn app.main:app --reload")
    
    return True


if __name__ == "__main__":
    success = setup_database()
    sys.exit(0 if success else 1)