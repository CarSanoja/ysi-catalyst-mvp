from fastapi import APIRouter
from app.api.endpoints import auth, users, sessions, insights, actions, themes, organizations
from app.api.v1 import knowledge

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])
api_router.include_router(actions.router, prefix="/actions", tags=["actions"])
api_router.include_router(themes.router, prefix="/themes", tags=["themes"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"])

# RAG Knowledge Base API
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["knowledge", "rag", "embeddings"])