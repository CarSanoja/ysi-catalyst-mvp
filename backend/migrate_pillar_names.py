#!/usr/bin/env python3
"""
Migrate Pillar Names - Merge duplicate pillars into canonical names
Updates existing GlobalInsight records to use normalized pillar names
"""

import logging
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import SessionLocal
from app.models.global_insight import GlobalInsight

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pillar migration map
PILLAR_MIGRATION_MAP = {
    "mental_health": "wellbeing_recognition",
    "recognition": "wellbeing_recognition",
}


def migrate_pillar_names(dry_run: bool = False):
    """
    Migrate pillar names to canonical forms

    Args:
        dry_run: If True, only simulate without making DB changes
    """
    db = SessionLocal()

    try:
        logger.info("Starting pillar name migration...")

        # Get current pillar distribution
        pillar_counts = db.query(
            GlobalInsight.pillar,
            func.count(GlobalInsight.id).label('count')
        ).group_by(GlobalInsight.pillar).all()

        logger.info("\nCurrent pillar distribution:")
        for pillar, count in pillar_counts:
            logger.info(f"  {pillar}: {count} insights")

        # Process each migration
        total_updated = 0

        for old_pillar, new_pillar in PILLAR_MIGRATION_MAP.items():
            insights_to_update = db.query(GlobalInsight).filter(
                GlobalInsight.pillar == old_pillar
            ).all()

            count = len(insights_to_update)

            if count == 0:
                logger.info(f"\n✓ No insights found with pillar '{old_pillar}'")
                continue

            logger.info(f"\n{'[DRY RUN] ' if dry_run else ''}Migrating {count} insights from '{old_pillar}' to '{new_pillar}'...")

            if not dry_run:
                for insight in insights_to_update:
                    insight.pillar = new_pillar
                    logger.debug(f"  Updated insight ID {insight.id}: {insight.canonical_text[:50]}...")

                db.commit()
                logger.info(f"✅ Successfully migrated {count} insights")
            else:
                for insight in insights_to_update:
                    logger.info(f"  [WOULD UPDATE] ID {insight.id}: {insight.canonical_text[:50]}...")

            total_updated += count

        # Get final pillar distribution
        if not dry_run:
            pillar_counts_after = db.query(
                GlobalInsight.pillar,
                func.count(GlobalInsight.id).label('count')
            ).group_by(GlobalInsight.pillar).all()

            logger.info("\n" + "="*60)
            logger.info("MIGRATION SUMMARY")
            logger.info("="*60)
            logger.info(f"Total insights updated: {total_updated}")
            logger.info("\nFinal pillar distribution:")
            for pillar, count in pillar_counts_after:
                logger.info(f"  {pillar}: {count} insights")
            logger.info("="*60)
            logger.info("\n✅ Migration completed successfully!")
        else:
            logger.info("\n" + "="*60)
            logger.info("DRY RUN SUMMARY")
            logger.info("="*60)
            logger.info(f"Total insights that would be updated: {total_updated}")
            logger.info("="*60)
            logger.info("\n⚠️  DRY RUN MODE - No changes were made to the database")

    except Exception as e:
        logger.error(f"Error during migration: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import sys

    print("""
╔════════════════════════════════════════════════════════════╗
║   Global Insights Pillar Migration Script                ║
║   Normalize pillar names to canonical forms               ║
╚════════════════════════════════════════════════════════════╝
""")

    if "--help" in sys.argv or "-h" in sys.argv:
        print("""
Usage:
  python3 migrate_pillar_names.py [OPTIONS]

Options:
  --dry-run    Simulate the migration without making database changes
  --help, -h   Show this help message

Migrations:
  mental_health -> wellbeing_recognition
  recognition   -> wellbeing_recognition

Examples:
  # Run in dry-run mode to see what would be changed
  python3 migrate_pillar_names.py --dry-run

  # Actually perform the migration
  python3 migrate_pillar_names.py
""")
        sys.exit(0)

    # Check for dry-run flag
    dry_run = "--dry-run" in sys.argv

    if dry_run:
        logger.info("🔍 Running in DRY RUN mode - no database changes will be made\n")

    try:
        migrate_pillar_names(dry_run=dry_run)
    except KeyboardInterrupt:
        logger.info("\n❌ Migration cancelled by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Migration failed: {str(e)}")
        sys.exit(1)
