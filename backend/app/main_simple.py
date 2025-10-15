from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import knowledge_simple

app = FastAPI(
    title="YSI Catalyst API - MVP",
    description="MVP Backend API for Youth & Social Innovation Initiative Platform",
    version="1.0.0-mvp",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "YSI Catalyst API - MVP",
        "status": "running",
        "version": "1.0.0-mvp",
        "features": {
            "knowledge_base": "mock",
            "rag_search": "mock",
            "embeddings": "not_implemented"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "mode": "mvp",
        "services": {
            "api": "healthy",
            "database": "not_configured",
            "embeddings": "not_implemented",
            "search": "mock"
        }
    }

# Include knowledge API with mock responses
app.include_router(knowledge_simple.router, prefix="/api/v1/knowledge", tags=["knowledge", "mvp"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)