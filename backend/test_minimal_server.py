#!/usr/bin/env python3

"""
Minimal test server to verify FastAPI is working
"""

from fastapi import FastAPI
import uvicorn

app = FastAPI(title="YSI Test Server")

@app.get("/")
def read_root():
    return {"message": "YSI Backend Test Server is running!", "status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ysi-backend-test"}

if __name__ == "__main__":
    print("🚀 Starting YSI Test Server...")
    print("📍 URL: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
