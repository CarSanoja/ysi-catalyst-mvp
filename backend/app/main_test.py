"""
Test version of main.py for RAGFlow testing
Simplified version without complex database relationships
"""

from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from app.core.config import settings
import httpx
import asyncio

app = FastAPI(
    title="YSI Catalyst API - Test Mode",
    description="Backend API for RAGFlow Integration Testing",
    version="1.0.0-test",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Mock authentication for testing
@app.post("/api/v1/auth/login")
async def login_test(username: str = Form(...), password: str = Form(...)):
    # Simple validation for testing
    if username == "12-11095@usb.ve" and password == "Carlos123":
        return {
            "access_token": "test-jwt-token-for-ragflow-testing-12345",
            "token_type": "bearer",
            "expires_in": 86400
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# Mock user dependency
async def get_current_user(token: str = Depends(security)):
    if token.credentials == "test-jwt-token-for-ragflow-testing-12345":
        return {"id": 1, "email": "12-11095@usb.ve", "role": "admin"}
    else:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
async def root():
    return {"message": "YSI Catalyst API - Test Mode", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "mode": "test"}

# RAGFlow Health Check
@app.get("/api/v1/ragflow/health")
async def ragflow_health():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://host.docker.internal:9380/")
            if response.status_code == 200:
                return {"status": "healthy", "ragflow_url": "http://host.docker.internal:9380"}
            else:
                return {"status": "unhealthy", "error": f"HTTP {response.status_code}"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# RAGFlow Info (protected)
@app.get("/api/v1/ragflow/info")
async def ragflow_info(current_user = Depends(get_current_user)):
    return {
        "integration_version": "1.0.0-test",
        "ragflow_url": "http://host.docker.internal:9380",
        "tenant_id": settings.RAGFLOW_TENANT_ID,
        "current_user": current_user,
        "test_mode": True
    }

# RAGFlow Status (protected, admin only)
@app.get("/api/v1/ragflow/status")
async def ragflow_status(current_user = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin permissions required")
    
    return {
        "ragflow_service": "healthy",
        "database": "healthy", 
        "api_endpoints": "healthy",
        "test_mode": True
    }
