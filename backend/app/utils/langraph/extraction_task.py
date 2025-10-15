"""
Text processing task for insight extraction
Integrates with the job system for async processing
"""

import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime

from app.utils.langraph.insight_agent import extract_insights_from_text
from app.utils.langraph.network_agent import extract_network_from_text
from app.schemas.insights import ExtractedInsightSchema, ExtractedInsightSchemaExpanded
from app.schemas.networks import NetworkAnalysisSchema

# Configure logging
logger = logging.getLogger(__name__)


class InsightExtractionTask:
    """
    Task for extracting insights from text using LangGraph agent
    Designed to work with the TextProcessingJob system
    """

    def __init__(self):
        self.task_name = "insight_extraction"

    def _convert_pillar_analysis_to_dict(self, pillar_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert pillar analysis from Pydantic objects to plain dicts for JSON serialization

        Args:
            pillar_analysis: Dict with YSIPillarAnalysis objects

        Returns:
            Dict with plain Python dictionaries
        """
        if not pillar_analysis:
            return {}

        result = {}
        for pillar_key, pillar_data in pillar_analysis.items():
            # Check if pillar_data is a Pydantic model
            if hasattr(pillar_data, 'model_dump'):
                # Convert Pydantic model to dict
                result[pillar_key] = pillar_data.model_dump()
            elif isinstance(pillar_data, dict):
                # If already a dict, check if it contains Pydantic objects in lists
                pillar_dict = {}
                for key, value in pillar_data.items():
                    if isinstance(value, list):
                        # Convert list items if they're Pydantic models
                        pillar_dict[key] = [
                            item.model_dump() if hasattr(item, 'model_dump') else item
                            for item in value
                        ]
                    else:
                        pillar_dict[key] = value
                result[pillar_key] = pillar_dict
            else:
                # Fallback
                result[pillar_key] = pillar_data

        return result

    async def process_text(
        self,
        text: str,
        context: str = "",
        job_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Process text and extract insights

        Args:
            text: The text to analyze
            context: Additional context about the text
            job_id: Optional job ID for logging/tracking

        Returns:
            Dict containing the extracted insights and metadata
        """
        start_time = datetime.now()

        try:
            logger.info(f"Starting parallel analysis (insights + network) for job {job_id}")

            # Execute both agents in parallel for faster processing
            insights_task = extract_insights_from_text(
                text=text,
                context=context,
                use_expanded=True
            )

            network_task = extract_network_from_text(
                text=text,
                context=context
            )

            # Wait for both analyses to complete
            insights, network_analysis = await asyncio.gather(
                insights_task,
                network_task,
                return_exceptions=True
            )

            # Handle potential errors from parallel execution
            if isinstance(insights, Exception):
                logger.error(f"Insights extraction failed for job {job_id}: {insights}")
                raise insights

            if isinstance(network_analysis, Exception):
                logger.warning(f"Network analysis failed for job {job_id}: {network_analysis}")
                # Continue with insights only if network analysis fails
                network_analysis = None

            # Calculate processing time
            end_time = datetime.now()
            processing_time = (end_time - start_time).total_seconds()

            # Convert to the format expected by the frontend
            result = {
                "themes_identified": [insights.main_theme] + insights.subthemes,
                "sentiment_analysis": {
                    "overall_sentiment": insights.general_perception,
                    "confidence": 0.95,  # High confidence for LLM-based analysis
                    "positive_indicators": 1 if insights.general_perception == "positive" else 0,
                    "negative_indicators": 1 if insights.general_perception == "negative" else 0
                },
                "content_analysis": {
                    "word_count": len(text.split()),
                    "character_count": len(text),
                    "paragraph_count": len(text.split('\n\n'))
                },
                "key_points": insights.proposed_actions[:5],  # Limit to top 5
                "action_items": insights.proposed_actions,
                "participants_mentioned": insights.key_actors,
                "challenges": insights.challenges,
                "opportunities": insights.opportunities,
                "context_provided": context,
                "processing_timestamp": end_time.isoformat(),
                "processing_time_seconds": processing_time,
                "model_used": "gpt-4o-mini",
                "confidence_score": 0.95,
                # Enhanced YSI pillar analysis - convert Pydantic objects to dicts
                "ysi_pillar_analysis": self._convert_pillar_analysis_to_dict(insights.pillar_analysis) if hasattr(insights, 'pillar_analysis') else {},
                # Network analysis from specialized agent
                "network_analysis": network_analysis.model_dump() if network_analysis else {},
                # Include full structured insights for frontend compatibility
                "structured_insights": {
                    "main_theme": insights.main_theme,
                    "subthemes": insights.subthemes,
                    "key_actors": insights.key_actors,
                    "general_perception": insights.general_perception,
                    "proposed_actions": insights.proposed_actions,
                    "challenges": insights.challenges,
                    "opportunities": insights.opportunities,
                    "pillar_analysis": self._convert_pillar_analysis_to_dict(insights.pillar_analysis) if hasattr(insights, 'pillar_analysis') else {},
                    "network_analysis": network_analysis.model_dump() if network_analysis else {}
                }
            }

            logger.info(f"Successfully extracted insights for job {job_id} in {processing_time:.2f}s")
            return result

        except Exception as e:
            logger.error(f"Failed to extract insights for job {job_id}: {str(e)}")
            raise ValueError(f"Insight extraction failed: {str(e)}")

    def validate_input(self, text: str) -> bool:
        """Validate input text before processing"""
        if not text or not text.strip():
            return False

        if len(text) < 10:
            return False

        if len(text) > 50000:
            return False

        return True

    async def process_with_fallback(
        self,
        text: str,
        context: str = "",
        job_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Process text with fallback to simple analysis if LangGraph fails
        """
        try:
            # Try the full LangGraph processing
            return await self.process_text(text, context, job_id)

        except Exception as e:
            logger.warning(f"LangGraph processing failed for job {job_id}, using fallback: {str(e)}")

            # Fallback to simple analysis
            return self._simple_fallback_analysis(text, context)

    def _simple_fallback_analysis(self, text: str, context: str) -> Dict[str, Any]:
        """
        Simple fallback analysis when LangGraph fails
        """
        # Basic keyword-based analysis
        themes = []
        key_points = []
        action_items = []
        participants = []
        sentiment = "neutral"
        confidence = 0.6

        # Simple keyword-based analysis for demo
        text_lower = text.lower()
        if "climate" in text_lower or "environment" in text_lower:
            themes.append("Climate Action")
        if "education" in text_lower or "learning" in text_lower:
            themes.append("Education")
        if "innovation" in text_lower or "technology" in text_lower:
            themes.append("Innovation")
        if "finance" in text_lower or "investment" in text_lower:
            themes.append("Capital Access")

        # Extract potential action items
        text_lines = text.split('\n')
        for line in text_lines:
            line_lower = line.lower()
            if any(word in line_lower for word in ['action:', 'todo:', 'next steps:', 'follow up:']):
                action_items.append(line.strip())
            elif any(word in line_lower for word in ['key point:', 'important:', 'note:']):
                key_points.append(line.strip())

        # Detect sentiment
        positive_words = ['success', 'great', 'excellent', 'positive', 'good', 'achievement']
        negative_words = ['problem', 'issue', 'concern', 'challenge', 'difficulty', 'failure']

        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)

        if positive_count > negative_count:
            sentiment = "positive"
        elif negative_count > positive_count:
            sentiment = "negative"

        return {
            "themes_identified": themes or ["General Discussion"],
            "sentiment_analysis": {
                "overall_sentiment": sentiment,
                "confidence": confidence,
                "positive_indicators": positive_count,
                "negative_indicators": negative_count
            },
            "content_analysis": {
                "word_count": len(text.split()),
                "character_count": len(text),
                "paragraph_count": len(text.split('\n\n'))
            },
            "key_points": key_points if key_points else ["No explicit key points identified"],
            "action_items": action_items if action_items else ["No explicit action items found"],
            "participants_mentioned": participants,
            "challenges": ["Unable to extract detailed challenges (fallback mode)"],
            "opportunities": ["Unable to extract detailed opportunities (fallback mode)"],
            "context_provided": context,
            "processing_timestamp": datetime.now().isoformat(),
            "model_used": "fallback_analysis",
            "confidence_score": confidence
        }


# Factory function
def create_extraction_task() -> InsightExtractionTask:
    """Create an insight extraction task instance"""
    return InsightExtractionTask()


# Convenience function for direct usage
async def extract_insights_task(
    text: str,
    context: str = "",
    job_id: Optional[int] = None,
    use_fallback: bool = True
) -> Dict[str, Any]:
    """
    High-level function to extract insights using the task system

    Args:
        text: Text to analyze
        context: Additional context
        job_id: Job ID for tracking
        use_fallback: Whether to use fallback if LangGraph fails

    Returns:
        Dict with extracted insights
    """
    task = create_extraction_task()

    # Validate input
    if not task.validate_input(text):
        raise ValueError("Invalid input text: must be between 10 and 50,000 characters")

    # Process with or without fallback
    if use_fallback:
        return await task.process_with_fallback(text, context, job_id)
    else:
        return await task.process_text(text, context, job_id)