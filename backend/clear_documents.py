"""
Script to clear documents and global insights from database
"""
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, text
from app.core.config import settings

def clear_documents_and_insights():
    """Clear processed files, text processing jobs, and global insights"""

    engine = create_engine(settings.DATABASE_URL)

    with engine.connect() as connection:
        # First, list all tables
        print("Checking available tables...")
        tables_result = connection.execute(text("SHOW TABLES"))
        tables = [row[0] for row in tables_result]
        print(f"Available tables: {', '.join(tables)}")
        print()

        # Disable foreign key checks
        connection.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        connection.commit()

        # Define tables to clear (check if they exist first)
        tables_to_clear = []

        if 'text_processing_jobs' in tables:
            tables_to_clear.append('text_processing_jobs')

        if 'processed_file' in tables:  # Note: singular, not plural
            tables_to_clear.append('processed_file')

        if 'global_insights' in tables:
            tables_to_clear.append('global_insights')

        # Clear the tables
        for table_name in tables_to_clear:
            print(f"Clearing {table_name}...")
            connection.execute(text(f"TRUNCATE TABLE {table_name}"))
            connection.commit()
            print(f"✓ {table_name} cleared")

        # Re-enable foreign key checks
        connection.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
        connection.commit()

        # Verify
        print("\nVerifying tables are empty:")
        for table_name in tables_to_clear:
            count = connection.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()
            print(f"  {table_name}: {count} rows")

        print("\n✅ All specified tables successfully cleared!")

if __name__ == "__main__":
    print("=" * 60)
    print("Clearing Documents and Global Insights")
    print("=" * 60)
    print()

    try:
        clear_documents_and_insights()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
