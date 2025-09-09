#!/usr/bin/env python3
"""
Data Ingestion Pipeline for YSI MVP
Loads existing meeting transcripts and stakeholder data into embeddings database
"""

import asyncio
import os
import json
import csv
from typing import List, Dict, Any, Optional
from pathlib import Path
import argparse
from datetime import datetime

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.embedding_service import embedding_service
from app.models.user import User
from app.models.session import Session as YSISession
from app.models.participant import Participant
from app.services.logging_service import session_logger

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataIngestionPipeline:
    """
    Professional data ingestion pipeline for YSI transcripts and stakeholder data
    """
    
    def __init__(self, data_dir: str = "/Users/carlos/Documents/YSI/data"):
        self.data_dir = Path(data_dir)
        self.db = SessionLocal()
        self.processed_count = 0
        self.error_count = 0
        
    async def load_meeting_transcripts(self, transcripts_dir: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Load meeting transcripts from various formats
        Supports: .txt, .json, .csv files
        """
        if transcripts_dir:
            transcripts_path = Path(transcripts_dir)
        else:
            transcripts_path = self.data_dir / "transcripts"
        
        if not transcripts_path.exists():
            logger.warning(f"Transcripts directory not found: {transcripts_path}")
            return []
        
        transcripts = []
        
        # Process different file formats
        for file_path in transcripts_path.rglob("*"):
            if file_path.is_file():
                try:
                    if file_path.suffix.lower() == '.txt':
                        transcript = await self._load_txt_transcript(file_path)
                    elif file_path.suffix.lower() == '.json':
                        transcript = await self._load_json_transcript(file_path)
                    elif file_path.suffix.lower() == '.csv':
                        transcript = await self._load_csv_transcript(file_path)
                    else:
                        logger.info(f"Skipping unsupported file: {file_path}")
                        continue
                    
                    if transcript:
                        transcripts.append(transcript)
                        logger.info(f"Loaded transcript: {file_path.name}")
                        
                except Exception as e:
                    logger.error(f"Failed to load {file_path}: {str(e)}")
                    self.error_count += 1
        
        logger.info(f"Loaded {len(transcripts)} transcripts from {transcripts_path}")
        return transcripts
    
    async def _load_txt_transcript(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """Load plain text transcript"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            
            if not content:
                return None
            
            # Extract metadata from filename if possible
            filename = file_path.stem
            metadata = self._parse_filename_metadata(filename)
            
            return {
                'text': content,
                'source_type': 'meeting_transcript',
                'metadata': {
                    'filename': filename,
                    'file_path': str(file_path),
                    'format': 'txt',
                    **metadata
                },
                'title': f"Meeting Transcript: {filename}"
            }
            
        except Exception as e:
            logger.error(f"Error loading txt file {file_path}: {str(e)}")
            return None
    
    async def _load_json_transcript(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """Load JSON transcript with structured data"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Handle different JSON structures
            if isinstance(data, dict):
                text = data.get('transcript') or data.get('text') or data.get('content')
                if not text:
                    # Try to concatenate speaker turns
                    turns = data.get('turns', []) or data.get('dialogue', [])
                    if turns:
                        text = self._format_speaker_turns(turns)
                
                metadata = {
                    'filename': file_path.stem,
                    'format': 'json',
                    **{k: v for k, v in data.items() if k not in ['transcript', 'text', 'content', 'turns', 'dialogue']}
                }
                
            elif isinstance(data, list):
                # Array of speaker turns
                text = self._format_speaker_turns(data)
                metadata = {
                    'filename': file_path.stem,
                    'format': 'json',
                    'turn_count': len(data)
                }
            else:
                text = str(data)
                metadata = {'filename': file_path.stem, 'format': 'json'}
            
            if not text:
                return None
                
            return {
                'text': text,
                'source_type': 'meeting_transcript',
                'metadata': metadata,
                'title': f"Meeting Transcript: {file_path.stem}"
            }
            
        except Exception as e:
            logger.error(f"Error loading JSON file {file_path}: {str(e)}")
            return None
    
    async def _load_csv_transcript(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """Load CSV transcript (typically with speaker, timestamp, text columns)"""
        try:
            content_parts = []
            metadata = {'filename': file_path.stem, 'format': 'csv'}
            
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                for row in reader:
                    # Try common column names
                    speaker = row.get('speaker') or row.get('name') or row.get('participant')
                    text = row.get('text') or row.get('content') or row.get('message')
                    timestamp = row.get('timestamp') or row.get('time')
                    
                    if text:
                        if speaker:
                            if timestamp:
                                content_parts.append(f"[{timestamp}] {speaker}: {text}")
                            else:
                                content_parts.append(f"{speaker}: {text}")
                        else:
                            content_parts.append(text)
            
            if not content_parts:
                return None
            
            full_text = '\n'.join(content_parts)
            metadata['turn_count'] = len(content_parts)
            
            return {
                'text': full_text,
                'source_type': 'meeting_transcript',
                'metadata': metadata,
                'title': f"Meeting Transcript: {file_path.stem}"
            }
            
        except Exception as e:
            logger.error(f"Error loading CSV file {file_path}: {str(e)}")
            return None
    
    def _format_speaker_turns(self, turns: List[Dict]) -> str:
        """Format speaker turns into readable transcript"""
        formatted_turns = []
        
        for turn in turns:
            speaker = turn.get('speaker') or turn.get('name') or turn.get('participant') or 'Speaker'
            text = turn.get('text') or turn.get('content') or turn.get('message', '')
            timestamp = turn.get('timestamp') or turn.get('time')
            
            if text:
                if timestamp:
                    formatted_turns.append(f"[{timestamp}] {speaker}: {text}")
                else:
                    formatted_turns.append(f"{speaker}: {text}")
        
        return '\n'.join(formatted_turns)
    
    def _parse_filename_metadata(self, filename: str) -> Dict[str, Any]:
        """Extract metadata from filename patterns"""
        metadata = {}
        
        # Common patterns: date_stakeholder_topic.txt, meeting_2024-01-15.txt, etc.
        filename_lower = filename.lower()
        
        # Extract date patterns
        import re
        date_patterns = [
            r'(\d{4}-\d{2}-\d{2})',
            r'(\d{2}-\d{2}-\d{4})',
            r'(\d{4}_\d{2}_\d{2})'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, filename)
            if match:
                metadata['date_from_filename'] = match.group(1)
                break
        
        # Extract stakeholder/participant info
        if 'stakeholder' in filename_lower:
            metadata['involves_stakeholders'] = True
        
        if 'team' in filename_lower:
            metadata['meeting_type'] = 'team'
        elif 'stakeholder' in filename_lower:
            metadata['meeting_type'] = 'stakeholder'
        elif 'workshop' in filename_lower:
            metadata['meeting_type'] = 'workshop'
        
        return metadata
    
    async def create_basic_users(self) -> Dict[str, int]:
        """Create basic user accounts for data ingestion"""
        users = {}
        
        try:
            # Create admin user if not exists
            admin = self.db.query(User).filter(User.email == "admin@ysi.org").first()
            if not admin:
                admin = User(
                    email="admin@ysi.org",
                    hashed_password="$2b$12$dummy_hash_for_data_ingestion",
                    full_name="YSI Admin",
                    role="admin",
                    is_active=True,
                    is_superuser=True
                )
                self.db.add(admin)
                self.db.commit()
                self.db.refresh(admin)
            users['admin'] = admin.id
            
            # Create data processor user
            processor = self.db.query(User).filter(User.email == "data@ysi.org").first()
            if not processor:
                processor = User(
                    email="data@ysi.org",
                    hashed_password="$2b$12$dummy_hash_for_data_ingestion",
                    full_name="Data Processor",
                    role="admin",
                    is_active=True
                )
                self.db.add(processor)
                self.db.commit()
                self.db.refresh(processor)
            users['processor'] = processor.id
            
            logger.info(f"Created/verified {len(users)} users")
            return users
            
        except Exception as e:
            logger.error(f"Failed to create basic users: {str(e)}")
            self.db.rollback()
            return {}
    
    async def process_transcripts_to_embeddings(self, transcripts: List[Dict[str, Any]], user_id: int) -> None:
        """Process transcripts into embeddings using batch processing"""
        try:
            # Prepare documents for batch processing
            documents = []
            
            for i, transcript in enumerate(transcripts):
                # Enhanced metadata
                enhanced_metadata = {
                    **transcript.get('metadata', {}),
                    'ingestion_batch': datetime.now().isoformat(),
                    'document_index': i,
                    'total_documents': len(transcripts)
                }
                
                # Add title if available
                if 'title' in transcript:
                    enhanced_metadata['title'] = transcript['title']
                
                documents.append({
                    'text': transcript['text'],
                    'source_type': transcript['source_type'],
                    'metadata': enhanced_metadata,
                    'user_id': user_id
                })
            
            logger.info(f"Processing {len(documents)} documents to embeddings...")
            
            # Batch process with progress tracking
            embeddings = await embedding_service.batch_process_documents(
                documents=documents,
                chunk_size=1000,  # Optimal chunk size
                batch_size=5  # Smaller batches to avoid rate limits
            )
            
            self.processed_count += len(embeddings)
            logger.info(f"Successfully created {len(embeddings)} embeddings")
            
        except Exception as e:
            logger.error(f"Failed to process transcripts to embeddings: {str(e)}")
            self.error_count += 1
            raise
    
    async def run_full_ingestion(self, transcripts_dir: Optional[str] = None) -> Dict[str, Any]:
        """Run complete data ingestion pipeline"""
        start_time = datetime.now()
        logger.info("Starting YSI data ingestion pipeline...")
        
        try:
            # Step 1: Create basic users
            users = await self.create_basic_users()
            if not users:
                raise Exception("Failed to create basic users")
            
            processor_user_id = users['processor']
            
            # Step 2: Load transcripts
            transcripts = await self.load_meeting_transcripts(transcripts_dir)
            if not transcripts:
                logger.warning("No transcripts found to process")
                return {
                    'status': 'completed',
                    'transcripts_loaded': 0,
                    'embeddings_created': 0,
                    'errors': self.error_count
                }
            
            # Step 3: Process to embeddings
            await self.process_transcripts_to_embeddings(transcripts, processor_user_id)
            
            # Step 4: Get final stats
            stats = embedding_service.get_embedding_stats(self.db)
            
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            result = {
                'status': 'completed',
                'transcripts_loaded': len(transcripts),
                'embeddings_created': self.processed_count,
                'errors': self.error_count,
                'duration_seconds': duration,
                'embedding_stats': stats,
                'users_created': len(users)
            }
            
            logger.info(f"Data ingestion completed: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Data ingestion failed: {str(e)}")
            return {
                'status': 'failed',
                'error': str(e),
                'transcripts_loaded': 0,
                'embeddings_created': self.processed_count,
                'errors': self.error_count + 1
            }
        
        finally:
            self.db.close()
    
    def cleanup(self):
        """Cleanup resources"""
        if self.db:
            self.db.close()


async def main():
    """Command line interface for data ingestion"""
    parser = argparse.ArgumentParser(description="YSI Data Ingestion Pipeline")
    parser.add_argument("--transcripts-dir", type=str, help="Directory containing transcript files")
    parser.add_argument("--data-dir", type=str, default="/Users/carlos/Documents/YSI/data", help="Base data directory")
    
    args = parser.parse_args()
    
    pipeline = DataIngestionPipeline(data_dir=args.data_dir)
    
    try:
        result = await pipeline.run_full_ingestion(args.transcripts_dir)
        print(json.dumps(result, indent=2))
        
        if result['status'] == 'completed':
            exit(0)
        else:
            exit(1)
            
    except Exception as e:
        logger.error(f"Pipeline failed: {str(e)}")
        exit(1)
    
    finally:
        pipeline.cleanup()


if __name__ == "__main__":
    asyncio.run(main())