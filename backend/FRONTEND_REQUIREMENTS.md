# YSI Backend - Frontend API Requirements

This document outlines the API endpoints required by the YSI Admin Frontend and their implementation status in the backend.

## Overview

The frontend expects the backend to be running on `http://localhost:8080` with the API base path `/api/v1`.

All API responses must follow this standardized format:
```json
{
  "success": boolean,
  "data": T | null,
  "error": string | null,
  "message": string | null
}
```

## Implementation Status

| Category | Total | Implemented | Pending |
|----------|-------|-------------|---------|
| Shapers | 7 | 7 | 0 |
| Documents | 6 | 6 | 0 |
| Notes | 4 | 4 | 0 |
| Insights | 5 | 5 | 0 |
| Analytics | 5 | 5 | 0 |
| Upload | 2 | 2 | 0 |
| Stakeholders | 3 | 3 | 0 |
| **TOTAL** | **32** | **32** | **0** |

## Endpoint Specifications

### 1. Global Shapers API (`/api/v1/shapers`)

Maps to: `Participant` model with role="shaper"

| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/shapers` | List all shapers | ✅ Implemented |
| GET | `/shapers/:id` | Get shaper by ID | ✅ Implemented |
| POST | `/shapers` | Create new shaper | ✅ Implemented |
| PUT | `/shapers/:id` | Update shaper | ✅ Implemented |
| DELETE | `/shapers/:id` | Delete shaper | ✅ Implemented |
| GET | `/shapers/region/:region` | Filter by region | ✅ Implemented |
| GET | `/shapers/focus/:focusArea` | Filter by focus area | ✅ Implemented |

**Request Body (POST/PUT):**
```json
{
  "name": "string",
  "email": "string",
  "region": "string",
  "focusArea": "string",
  "photo": "string (S3 key)",
  "bio": "string",
  "organization": "string"
}
```

### 2. Documents API (`/api/v1/documents`)

Maps to: `ProcessedFile` + `Session` models

| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/documents` | List all documents | ✅ Implemented |
| GET | `/documents/:id` | Get document by ID | ✅ Implemented |
| POST | `/documents` | Create document | ✅ Implemented |
| PUT | `/documents/:id` | Update document | ✅ Implemented |
| DELETE | `/documents/:id` | Delete document | ✅ Implemented |
| GET | `/documents/search?q=` | Search documents | ✅ Implemented |

**Query Parameters (GET /documents):**
- `sentiment`: Filter by sentiment
- `dateFrom`: Start date filter
- `dateTo`: End date filter
- `uploader`: Filter by uploader

**Request Body (POST/PUT):**
```json
{
  "title": "string",
  "date": "string (ISO)",
  "uploader": "string",
  "mainTheme": "string",
  "sentiment": "positive | neutral | negative",
  "insights": {},
  "relatedShapers": ["id1", "id2"]
}
```

### 3. Notes/Capture API (`/api/v1/notes`)

Maps to: Session notes + AI processing

| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| POST | `/notes/process` | Process with AI | ✅ Implemented |
| POST | `/notes/save` | Save raw notes | ✅ Implemented |
| GET | `/notes` | List all notes | ✅ Implemented |
| GET | `/notes/:id` | Get note by ID | ✅ Implemented |

**Request Body (POST /notes/process):**
```json
{
  "text": "string",
  "context": "string (optional)"
}
```

**Request Body (POST /notes/save):**
```json
{
  "title": "string",
  "text": "string",
  "date": "string (ISO)",
  "author": "string"
}
```

### 4. Insights API (`/api/v1/insights`)

Maps to: `Insight` model (existing)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/insights` | List insights | ✅ Implemented |
| GET | `/insights/:id` | Get insight | ✅ Implemented |
| POST | `/insights` | Create insight | ✅ Implemented |
| PUT | `/insights/:id` | Update insight | ❌ Pending |
| DELETE | `/insights/:id` | Delete insight | ❌ Pending |
| POST | `/insights/generate` | Generate from docs | ❌ Pending |

**Query Parameters (GET /insights):**
- `pillar`: Filter by pillar (capital_access, recognition, wellbeing)
- `dateFrom`: Start date filter
- `dateTo`: End date filter

### 5. Analytics API (`/api/v1/analytics`)

Aggregation endpoints for dashboard

| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/analytics/overview` | Dashboard metrics | ✅ Implemented |
| GET | `/analytics/sentiment` | Sentiment trends | ✅ Implemented |
| GET | `/analytics/topics` | Topic analysis | ✅ Implemented |
| GET | `/analytics/network` | Network graph data | ✅ Implemented |
| GET | `/analytics/engagement` | Engagement metrics | ✅ Implemented |

**Response (GET /analytics/overview):**
```json
{
  "success": true,
  "data": {
    "totalShapers": 24,
    "totalDocuments": 156,
    "totalInsights": 89,
    "avgSentiment": 0.73,
    "activeRegions": 5,
    "recentActivity": []
  }
}
```

### 6. Upload API (`/api/v1/upload`)

File upload to MinIO storage

| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| POST | `/upload/document` | Upload document | ✅ Implemented |
| POST | `/upload/photo` | Upload photo | ✅ Implemented |

**Request (multipart/form-data):**
- `file`: File binary
- `title`: Optional metadata
- `description`: Optional metadata
- `uploader`: Optional metadata

### 7. Stakeholders API (`/api/v1/stakeholders`)

Legacy support - Maps to `Participant` model

| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/stakeholders` | List all | ✅ Implemented |
| GET | `/stakeholders/:id` | Get by ID | ✅ Implemented |
| GET | `/stakeholders/:id/relationships` | Get relations | ✅ Implemented |

## Testing Examples

### Test Analytics Overview
```bash
curl -s http://localhost:8080/api/v1/analytics/overview | python3 -m json.tool
```

Expected response:
```json
{
  "success": true,
  "data": {
    "totalShapers": 24,
    "totalDocuments": 156,
    "totalInsights": 89,
    "avgSentiment": 0.73,
    "activeRegions": 5,
    "recentActivity": [...]
  },
  "error": null,
  "message": null
}
```

### Test Create Shaper
```bash
curl -X POST http://localhost:8080/api/v1/shapers/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "region": "North America",
    "focus_area": "Climate Action",
    "bio": "Climate activist and social entrepreneur",
    "organization": "Green Future Initiative"
  }' | python3 -m json.tool
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "region": "North America",
    "focusArea": "Climate Action",
    "bio": "Climate activist and social entrepreneur",
    "organization": "Green Future Initiative",
    "engagement_score": 75.0,
    "created_at": "2025-10-12T23:11:44"
  },
  "message": "Shaper created successfully"
}
```

### Test List Shapers
```bash
curl -s http://localhost:8080/api/v1/shapers/ | python3 -m json.tool
```

### Test Get Shaper by ID
```bash
curl -s http://localhost:8080/api/v1/shapers/1 | python3 -m json.tool
```

### Test Filter by Region
```bash
curl -s "http://localhost:8080/api/v1/shapers/region/North%20America" | python3 -m json.tool
```

### Test Update Shaper
```bash
curl -X PUT http://localhost:8080/api/v1/shapers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "position": "Senior Climate Advocate",
    "website": "https://johndoe.com"
  }' | python3 -m json.tool
```

### Test Process Notes
```bash
curl -X POST http://localhost:8080/api/v1/notes/process \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Discussion about sustainable finance solutions...",
    "context": "Workshop on Impact Investment"
  }'
```

### Test Upload Document
```bash
curl -X POST http://localhost:8080/api/v1/upload/document \
  -F "file=@document.pdf" \
  -F "title=Impact Report 2024" \
  -F "uploader=admin@ysi.org"
```

## Frontend Integration

The frontend is configured to connect to:
- Development: `http://localhost:3001/api` (needs update to `http://localhost:8080/api/v1`)
- Production: Configure via `REACT_APP_API_URL` environment variable

To update frontend connection:
1. Update `REACT_APP_API_URL` in frontend `.env` to `http://localhost:8080/api/v1`
2. Or update the default in `src/services/api.ts`

## Implementation Priority

1. **Phase 1 - Core Dashboard** (Day 1)
   - Analytics Overview endpoint
   - Shapers CRUD (for team display)
   - Basic insights listing

2. **Phase 2 - Content Management** (Day 2)
   - Documents CRUD
   - Notes processing with AI
   - Upload functionality

3. **Phase 3 - Advanced Features** (Day 3)
   - Detailed analytics
   - Search functionality
   - Stakeholder relationships

## Notes

- All list endpoints should support pagination (`skip`, `limit`)
- All endpoints should validate input using Pydantic schemas
- File uploads are stored in MinIO, metadata in MySQL
- AI processing uses OpenAI via LangGraph
- Authentication will be added in Phase 2