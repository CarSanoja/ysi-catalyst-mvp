#!/usr/bin/env python3

"""
Simple RAGFlow Test Server
Completely independent server for testing RAGFlow integration
No database dependencies, no complex models
"""

from fastapi import FastAPI, Depends, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import os
import uvicorn

app = FastAPI(
    title="RAGFlow Integration Test API",
    description="Simple API for testing RAGFlow integration",
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
TEST_TOKEN = "test-jwt-token-for-ragflow-testing-12345"

@app.post("/api/v1/auth/login")
async def login(username: str = Form(...), password: str = Form(...)):
    if username == "12-11095@usb.ve" and password == "Carlos123":
        return {
            "access_token": TEST_TOKEN,
            "token_type": "bearer",
            "expires_in": 86400
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials == TEST_TOKEN:
        return {"id": 1, "email": "12-11095@usb.ve", "role": "admin"}
    else:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
async def root():
    return {"message": "RAGFlow Test API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "mode": "test"}

@app.get("/api/v1/ragflow/health")
async def ragflow_health():
    ragflow_url = os.getenv("RAGFLOW_API_URL", "http://localhost:9380")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{ragflow_url}/")
            return {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "ragflow_url": ragflow_url,
                "tenant_id": os.getenv("RAGFLOW_TENANT_ID", "unknown"),
                "response": response.json() if response.status_code == 200 else None
            }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.get("/api/v1/ragflow/info")
async def ragflow_info(current_user = Depends(get_current_user)):
    return {
        "integration_version": "1.0.0-test",
        "ragflow_url": os.getenv("RAGFLOW_API_URL", "http://localhost:9380"),
        "tenant_id": os.getenv("RAGFLOW_TENANT_ID", "unknown"),
        "current_user": current_user,
        "test_mode": True
    }

@app.get("/api/v1/ragflow/status")
async def ragflow_status(current_user = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin permissions required")
    
    return {
        "ragflow_service": "healthy",
        "database": "test-mode",
        "api_endpoints": "healthy",
        "test_mode": True
    }

@app.post("/api/v1/ragflow/test-connection")
async def test_ragflow(current_user = Depends(get_current_user)):
    ragflow_url = os.getenv("RAGFLOW_API_URL", "http://localhost:9380")
    ragflow_token = os.getenv("RAGFLOW_API_TOKEN")
    
    if not ragflow_token:
        return {"status": "error", "message": "RAGFlow token not configured"}
    
    try:
        headers = {"Authorization": f"Bearer {ragflow_token}"}
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(f"{ragflow_url}/api/v1/datasets", headers=headers)
            return {
                "status": "success",
                "response_code": response.status_code,
                "data": response.json() if response.status_code == 200 else response.text
            }
    except Exception as e:
        return {"status": "error", "error": str(e)}

# Mock Knowledge Base endpoints for testing
@app.post("/api/v1/ragflow/knowledge-bases/")
async def create_kb(current_user = Depends(get_current_user)):
    # Mock KB creation - simulate RAGFlow API call
    ragflow_url = os.getenv("RAGFLOW_API_URL", "http://localhost:9380")
    ragflow_token = os.getenv("RAGFLOW_API_TOKEN")
    
    try:
        headers = {"Authorization": f"Bearer {ragflow_token}", "Content-Type": "application/json"}
        kb_data = {
            "name": f"Test KB {len(str(hash('test')))%1000}",
            "description": "Test Knowledge Base created by automated testing",
            "language": "English",
            "chunk_method": "naive"
        }
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(f"{ragflow_url}/api/v1/datasets", json=kb_data, headers=headers)
            
            if response.status_code in [200, 201]:
                result = response.json()
                # Extract KB ID from response
                kb_id = result.get("data", {}).get("dataset_id", f"test-kb-{hash('test')%1000}")
                
                return {
                    "id": 1,
                    "ragflow_kb_id": kb_id,
                    "ragflow_tenant_id": os.getenv("RAGFLOW_TENANT_ID"),
                    "name": kb_data["name"],
                    "description": kb_data["description"],
                    "language": kb_data["language"],
                    "chunk_method": kb_data["chunk_method"],
                    "status": "active",
                    "created_by_user_id": current_user["id"],
                    "created_at": "2025-09-24T18:15:00Z"
                }
            else:
                raise HTTPException(status_code=500, detail=f"RAGFlow error: {response.text}")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating KB: {str(e)}")

@app.get("/api/v1/ragflow/knowledge-bases/")
async def list_kbs(current_user = Depends(get_current_user)):
    # Mock KB listing - simulate RAGFlow API call
    ragflow_url = os.getenv("RAGFLOW_API_URL", "http://localhost:9380")
    ragflow_token = os.getenv("RAGFLOW_API_TOKEN")
    
    try:
        headers = {"Authorization": f"Bearer {ragflow_token}"}
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(f"{ragflow_url}/api/v1/datasets", headers=headers)
            
            if response.status_code == 200:
                ragflow_data = response.json()
                
                # Transform RAGFlow response to our format
                kbs = []
                if "data" in ragflow_data and ragflow_data["data"]:
                    for kb in ragflow_data["data"]:
                        kbs.append({
                            "id": len(kbs) + 1,
                            "ragflow_kb_id": kb.get("id", "unknown"),
                            "name": kb.get("name", "Unknown KB"),
                            "description": kb.get("description", ""),
                            "status": "active",
                            "created_by_user_id": current_user["id"]
                        })
                
                return {
                    "knowledge_bases": kbs,
                    "total": len(kbs),
                    "limit": 50,
                    "offset": 0
                }
            else:
                return {
                    "knowledge_bases": [],
                    "total": 0,
                    "limit": 50,
                    "offset": 0
                }
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing KBs: {str(e)}")

@app.get("/api/v1/ragflow/knowledge-bases/{kb_id}")
async def get_kb(kb_id: str, current_user = Depends(get_current_user)):
    return {
        "id": 1,
        "ragflow_kb_id": kb_id,
        "name": "Test Knowledge Base",
        "description": "Mock KB for testing",
        "status": "active",
        "created_by_user_id": current_user["id"]
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
