#!/usr/bin/env python3
"""
Backfill Global Insights from Existing Documents
Processes all completed TextProcessingJobs and aggregates insights
"""

import asyncio
import logging
from datetime import datetime
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.text_processing_job import TextProcessingJob
from app.models.global_insight import GlobalInsight
from app.enums import ProcessingStatus
from app.utils.langraph.aggregation_task import process_global_insights_aggregation

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def backfill_global_insights(dry_run: bool = False):
    """
    Backfill global insights from all completed text processing jobs

    Args:
        dry_run: If True, only simulate without making DB changes
    """
    db = SessionLocal()

    try:
        # Get all completed jobs with results
        logger.info("Fetching completed text processing jobs...")
        jobs = db.query(TextProcessingJob).filter(
            TextProcessingJob.status == ProcessingStatus.COMPLETED,
            TextProcessingJob.result.isnot(None)
        ).all()

        total_jobs = len(jobs)
        logger.info(f"Found {total_jobs} completed jobs to process")

        if total_jobs == 0:
            logger.info("No jobs to process. Exiting.")
            return

        # Get current insights count
        insights_before = db.query(GlobalInsight).count()
        logger.info(f"Current global insights in database: {insights_before}")

        # Process each job
        processed_count = 0
        skipped_count = 0
        error_count = 0

        for idx, job in enumerate(jobs, 1):
            job_id = job.id

            try:
                # Check if result has pillar analysis
                result = job.result
                pillar_analysis = result.get("ysi_pillar_analysis", {}) if result else {}

                if not pillar_analysis:
                    logger.warning(f"[{idx}/{total_jobs}] Job {job_id}: No pillar analysis found, skipping")
                    skipped_count += 1
                    continue

                # Prepare document metadata
                themes = result.get("themes_identified", [])
                doc_metadata = {
                    "title": themes[0] if themes else f"Document {job_id}",
                    "date": job.completed_at.isoformat() if job.completed_at else datetime.now().isoformat(),
                    "uploader": "System",
                    "region": None,
                    "stakeholder": None
                }

                logger.info(f"[{idx}/{total_jobs}] Processing Job {job_id}: {doc_metadata['title'][:50]}...")

                if dry_run:
                    logger.info(f"  [DRY RUN] Would process pillar analysis with {len(pillar_analysis)} pillars")
                    for pillar_key, pillar_data in pillar_analysis.items():
                        if isinstance(pillar_data, dict):
                            problems = pillar_data.get("problems", [])
                            proposals = pillar_data.get("proposals", [])
                            logger.info(f"    - {pillar_key}: {len(problems)} problems, {len(proposals)} proposals")
                else:
                    # Actually process the insights
                    await process_global_insights_aggregation(
                        job_id=job_id,
                        pillar_analysis=pillar_analysis,
                        doc_metadata=doc_metadata,
                        db=db
                    )
                    logger.info(f"  ✅ Successfully processed Job {job_id}")

                processed_count += 1

                # Small delay to avoid overwhelming the database
                await asyncio.sleep(0.1)

            except Exception as e:
                logger.error(f"[{idx}/{total_jobs}] Job {job_id}: Error processing - {str(e)}")
                error_count += 1
                continue

        # Get final insights count
        if not dry_run:
            insights_after = db.query(GlobalInsight).count()
            new_insights = insights_after - insights_before
        else:
            insights_after = insights_before
            new_insights = 0

        # Print summary
        logger.info("\n" + "="*60)
        logger.info("BACKFILL SUMMARY")
        logger.info("="*60)
        logger.info(f"Total jobs found:        {total_jobs}")
        logger.info(f"Successfully processed:  {processed_count}")
        logger.info(f"Skipped (no analysis):   {skipped_count}")
        logger.info(f"Errors:                  {error_count}")
        logger.info("-"*60)
        logger.info(f"Global insights before:  {insights_before}")
        logger.info(f"Global insights after:   {insights_after}")
        logger.info(f"New insights created:    {new_insights}")
        logger.info("="*60)

        if dry_run:
            logger.info("\n⚠️  DRY RUN MODE - No changes were made to the database")
        else:
            logger.info("\n✅ Backfill completed successfully!")

    except Exception as e:
        logger.error(f"Fatal error during backfill: {str(e)}")
        raise
    finally:
        db.close()


async def main():
    """Main entry point"""
    import sys

    # Check for dry-run flag
    dry_run = "--dry-run" in sys.argv

    if dry_run:
        logger.info("🔍 Running in DRY RUN mode - no database changes will be made\n")

    try:
        await backfill_global_insights(dry_run=dry_run)
    except KeyboardInterrupt:
        logger.info("\n❌ Backfill cancelled by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Backfill failed: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════╗
║   Global Insights Backfill Script                         ║
║   Process existing documents to populate global insights  ║
╚════════════════════════════════════════════════════════════╝
""")

    import sys
    if "--help" in sys.argv or "-h" in sys.argv:
        print("""
Usage:
  python3 backfill_global_insights.py [OPTIONS]

Options:
  --dry-run    Simulate the backfill without making database changes
  --help, -h   Show this help message

Examples:
  # Run in dry-run mode to see what would be processed
  python3 backfill_global_insights.py --dry-run

  # Actually perform the backfill
  python3 backfill_global_insights.py
""")
        sys.exit(0)

    asyncio.run(main())
