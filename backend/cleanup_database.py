#!/usr/bin/env python3
"""
Database Cleanup Script
Removes old data to start fresh with the new quote-extraction system
"""

import logging
import sys
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import SessionLocal
from app.models.global_insight import GlobalInsight
from app.models.text_processing_job import TextProcessingJob
from app.enums import ProcessingStatus

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def show_current_stats(db: Session):
    """Display current database statistics"""

    # Global Insights
    total_insights = db.query(GlobalInsight).count()
    insights_by_pillar = db.query(
        GlobalInsight.pillar,
        func.count(GlobalInsight.id).label('count')
    ).group_by(GlobalInsight.pillar).all()

    # Text Processing Jobs
    total_jobs = db.query(TextProcessingJob).count()
    completed_jobs = db.query(TextProcessingJob).filter(
        TextProcessingJob.status == ProcessingStatus.COMPLETED
    ).count()

    logger.info("\n" + "="*60)
    logger.info("CURRENT DATABASE STATISTICS")
    logger.info("="*60)
    logger.info(f"Global Insights:")
    logger.info(f"  Total: {total_insights}")
    for pillar, count in insights_by_pillar:
        logger.info(f"    {pillar}: {count}")
    logger.info(f"\nText Processing Jobs:")
    logger.info(f"  Total: {total_jobs}")
    logger.info(f"  Completed: {completed_jobs}")
    logger.info("="*60 + "\n")

    return {
        "total_insights": total_insights,
        "total_jobs": total_jobs,
        "completed_jobs": completed_jobs
    }


def cleanup_global_insights(db: Session, dry_run: bool = False):
    """Delete all global insights"""

    count = db.query(GlobalInsight).count()

    if count == 0:
        logger.info("✓ No global insights to delete")
        return 0

    if dry_run:
        logger.info(f"[DRY RUN] Would delete {count} global insights")
        return count

    logger.info(f"Deleting {count} global insights...")
    deleted = db.query(GlobalInsight).delete()
    db.commit()
    logger.info(f"✅ Deleted {deleted} global insights")

    return deleted


def cleanup_processing_jobs(db: Session, mode: str = "reset", dry_run: bool = False):
    """
    Clean up text processing jobs

    Modes:
    - reset: Clear result field and set status to RECEIVED (keep job records)
    - delete_completed: Delete all completed jobs
    - delete_all: Delete ALL jobs
    """

    if mode == "reset":
        jobs = db.query(TextProcessingJob).filter(
            TextProcessingJob.status == ProcessingStatus.COMPLETED
        ).all()
        count = len(jobs)

        if count == 0:
            logger.info("✓ No completed jobs to reset")
            return 0

        if dry_run:
            logger.info(f"[DRY RUN] Would reset {count} completed jobs")
            return count

        logger.info(f"Resetting {count} completed jobs (clearing results)...")
        for job in jobs:
            job.result = None
            job.status = ProcessingStatus.RECEIVED
            job.completed_at = None

        db.commit()
        logger.info(f"✅ Reset {count} jobs to RECEIVED status")
        return count

    elif mode == "delete_completed":
        count = db.query(TextProcessingJob).filter(
            TextProcessingJob.status == ProcessingStatus.COMPLETED
        ).count()

        if count == 0:
            logger.info("✓ No completed jobs to delete")
            return 0

        if dry_run:
            logger.info(f"[DRY RUN] Would delete {count} completed jobs")
            return count

        logger.info(f"Deleting {count} completed jobs...")
        deleted = db.query(TextProcessingJob).filter(
            TextProcessingJob.status == ProcessingStatus.COMPLETED
        ).delete()
        db.commit()
        logger.info(f"✅ Deleted {deleted} completed jobs")
        return deleted

    elif mode == "delete_all":
        count = db.query(TextProcessingJob).count()

        if count == 0:
            logger.info("✓ No jobs to delete")
            return 0

        if dry_run:
            logger.info(f"[DRY RUN] Would delete ALL {count} jobs")
            return count

        logger.info(f"⚠️  Deleting ALL {count} jobs...")
        deleted = db.query(TextProcessingJob).delete()
        db.commit()
        logger.info(f"✅ Deleted {deleted} jobs")
        return deleted

    else:
        raise ValueError(f"Invalid mode: {mode}")


def main():
    """Main cleanup function"""

    import argparse

    parser = argparse.ArgumentParser(description="Clean up YSI database")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be deleted without actually deleting"
    )
    parser.add_argument(
        "--jobs-mode",
        choices=["reset", "delete_completed", "delete_all", "keep"],
        default="reset",
        help="How to handle text processing jobs (default: reset)"
    )
    parser.add_argument(
        "--skip-insights",
        action="store_true",
        help="Skip deleting global insights"
    )
    parser.add_argument(
        "--yes",
        action="store_true",
        help="Skip confirmation prompt"
    )

    args = parser.parse_args()

    print("""
╔════════════════════════════════════════════════════════════╗
║   YSI Database Cleanup Script                             ║
║   Clean old data to start fresh with quote extraction    ║
╚════════════════════════════════════════════════════════════╝
""")

    if args.dry_run:
        logger.info("🔍 Running in DRY RUN mode - no changes will be made\n")

    db = SessionLocal()

    try:
        # Show current stats
        stats = show_current_stats(db)

        # Build cleanup plan
        plan = []
        if not args.skip_insights and stats['total_insights'] > 0:
            plan.append(f"• Delete {stats['total_insights']} global insights")

        if args.jobs_mode == "reset" and stats['completed_jobs'] > 0:
            plan.append(f"• Reset {stats['completed_jobs']} completed jobs to RECEIVED status")
        elif args.jobs_mode == "delete_completed" and stats['completed_jobs'] > 0:
            plan.append(f"• Delete {stats['completed_jobs']} completed jobs")
        elif args.jobs_mode == "delete_all" and stats['total_jobs'] > 0:
            plan.append(f"• Delete ALL {stats['total_jobs']} jobs")

        if not plan:
            logger.info("✓ Nothing to clean up. Database is already empty.")
            return

        # Show cleanup plan
        logger.info("CLEANUP PLAN:")
        for item in plan:
            logger.info(item)
        logger.info("")

        # Confirm
        if not args.yes and not args.dry_run:
            response = input("⚠️  Are you sure you want to proceed? (yes/no): ")
            if response.lower() != "yes":
                logger.info("❌ Cleanup cancelled by user")
                return

        # Execute cleanup
        logger.info("\nStarting cleanup...\n")

        # Delete global insights
        if not args.skip_insights:
            cleanup_global_insights(db, dry_run=args.dry_run)

        # Handle jobs
        if args.jobs_mode != "keep":
            cleanup_processing_jobs(db, mode=args.jobs_mode, dry_run=args.dry_run)

        # Final stats
        logger.info("\n" + "="*60)
        if args.dry_run:
            logger.info("DRY RUN COMPLETED - No changes were made")
        else:
            logger.info("CLEANUP COMPLETED")
            show_current_stats(db)
        logger.info("="*60)

    except Exception as e:
        logger.error(f"❌ Error during cleanup: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
