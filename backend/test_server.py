#!/usr/bin/env python3
"""
Simple test to verify basic FastAPI server can start
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Simple app for testing
app = FastAPI(
    title="YSI Catalyst API - Test",
    description="Basic test server",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "YSI Catalyst API - Test Server", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "test": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)