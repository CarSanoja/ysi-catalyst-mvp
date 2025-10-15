"""
Minimal test server for RAGFlow integration testing
No database dependencies, only basic endpoints for testing
"""

from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import os

app = FastAPI(
    title="YSI RAGFlow Test API",
    description="Minimal API for RAGFlow Integration Testing",
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

# Test token
TEST_TOKEN = "test-jwt-token-for-ragflow-testing-12345"

# Mock authentication
@app.post("/api/v1/auth/login")
async def login_test(username: str = Form(...), password: str = Form(...)):
    if username == "12-11095@usb.ve" and password == "Carlos123":
        return {
            "access_token": TEST_TOKEN,
            "token_type": "bearer",
            "expires_in": 86400
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# Mock user dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials == TEST_TOKEN:
        return {"id": 1, "email": "12-11095@usb.ve", "role": "admin"}
    else:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
async def root():
    return {"message": "YSI RAGFlow Test API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "mode": "test"}

# RAGFlow Health Check
@app.get("/api/v1/ragflow/health")
async def ragflow_health():
    ragflow_url = os.getenv("RAGFLOW_API_URL", "http://host.docker.internal:9380")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{ragflow_url}/")
            if response.status_code == 200:
                return {
                    "status": "healthy", 
                    "ragflow_url": ragflow_url,
                    "tenant_id": os.getenv("RAGFLOW_TENANT_ID", "unknown"),
                    "response": response.json()
                }
            else:
                return {"status": "unhealthy", "error": f"HTTP {response.status_code}"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# RAGFlow Info (protected)
@app.get("/api/v1/ragflow/info")
async def ragflow_info(current_user = Depends(get_current_user)):
    return {
        "integration_version": "1.0.0-test",
        "ragflow_url": os.getenv("RAGFLOW_API_URL", "http://host.docker.internal:9380"),
        "ragflow_web_url": os.getenv("RAGFLOW_WEB_URL", "http://host.docker.internal:9381"),
        "tenant_id": os.getenv("RAGFLOW_TENANT_ID", "unknown"),
        "api_token": f"{os.getenv('RAGFLOW_API_TOKEN', 'unknown')[:20]}..." if os.getenv('RAGFLOW_API_TOKEN') else "not configured",
        "current_user": current_user,
        "test_mode": True,
        "supported_features": {
            "basic_auth": True,
            "ragflow_health": True,
            "ragflow_connectivity": True
        }
    }

# RAGFlow Status (protected, admin only)
@app.get("/api/v1/ragflow/status")
async def ragflow_status(current_user = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin permissions required")
    
    return {
        "ragflow_service": "healthy",
        "database": "test-mode", 
        "api_endpoints": "healthy",
        "test_mode": True,
        "timestamp": "2025-09-24T18:00:00Z"
    }

# Basic RAGFlow API test endpoint
@app.post("/api/v1/ragflow/test-connection")
async def test_ragflow_connection(current_user = Depends(get_current_user)):
    """Test direct connection to RAGFlow API"""
    ragflow_url = os.getenv("RAGFLOW_API_URL", "http://host.docker.internal:9380")
    ragflow_token = os.getenv("RAGFLOW_API_TOKEN")
    
    if not ragflow_token:
        raise HTTPException(status_code=500, detail="RAGFlow token not configured")
    
    try:
        headers = {
            "Authorization": f"Bearer {ragflow_token}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Test basic API call
            response = await client.get(f"{ragflow_url}/v1/datasets", headers=headers)
            
            return {
                "status": "success",
                "ragflow_url": ragflow_url,
                "response_code": response.status_code,
                "response_data": response.json() if response.status_code == 200 else response.text,
                "test_user": current_user
            }
            
    except Exception as e:
        return {
            "status": "error",
            "ragflow_url": ragflow_url,
            "error": str(e),
            "test_user": current_user
        }
