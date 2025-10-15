from fastapi import APIRouter
from app.api.endpoints import auth, users, sessions, insights, actions, themes, organizations, analytics, shapers, documents, notes, upload, stakeholders, global_insights

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])
api_router.include_router(actions.router, prefix="/actions", tags=["actions"])
api_router.include_router(themes.router, prefix="/themes", tags=["themes"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(shapers.router, prefix="/shapers", tags=["shapers"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(stakeholders.router, prefix="/stakeholders", tags=["stakeholders"])
api_router.include_router(global_insights.router, prefix="/global-insights", tags=["global-insights"])