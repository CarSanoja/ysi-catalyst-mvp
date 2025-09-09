from app.db.base_class import Base

# Import all models to ensure they are registered with SQLAlchemy
from app.models.user import User
from app.models.session import Session
from app.models.insight import Insight
from app.models.participant import Participant
from app.models.action import Action
from app.models.theme import Theme
from app.models.organization import Organization

# New models
from app.models.quote import Quote
from app.models.capture_lane import CaptureLane
from app.models.charter_document import CharterDocument
from app.models.citation import Citation
from app.models.interaction import Interaction
from app.models.next_step import NextStep
from app.models.knowledge_query import KnowledgeQuery
from app.models.processed_file import ProcessedFile
from app.models.activity_log import ActivityLog
from app.models.metrics_snapshot import MetricsSnapshot
from app.models.text_embedding import TextEmbedding