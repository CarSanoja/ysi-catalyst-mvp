# YSI Catalyst API Documentation

**Version:** 1.0.0
**Base URL:** `http://localhost:8080/api/v1`
**Documentation Generated:** 2025-10-12

## Overview

The YSI Catalyst API provides comprehensive endpoints for managing Global Shapers, analytics, content, and AI-powered insights for the Youth & Social Innovation Initiative platform.

## Authentication

Currently using development mode without authentication. Production deployment will require JWT tokens.

## Response Format

All API responses follow this standardized format:

```json
{
  "success": boolean,
  "data": T | null,
  "error": string | null,
  "message": string | null
}
```

## Error Handling

- **400 Bad Request** - Invalid request data
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error with detailed message

## Implemented Endpoints (32/32) - COMPLETE ✅

### 🎯 Analytics API (5/5 Complete)

#### GET `/analytics/overview`
Dashboard overview metrics for the admin interface.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalShapers": 24,
    "totalDocuments": 156,
    "totalInsights": 89,
    "avgSentiment": 0.73,
    "activeRegions": 5,
    "recentActivity": [
      {
        "type": "session",
        "title": "Impact Investment Workshop",
        "date": "2025-10-12T19:08:09.656358",
        "status": "completed"
      }
    ]
  }
}
```

**Test:**
```bash
curl -s http://localhost:8080/api/v1/analytics/overview | python3 -m json.tool
```

#### GET `/analytics/sentiment`
Time-series sentiment analysis data.

**Query Parameters:**
- `dateFrom` (optional): Start date filter
- `dateTo` (optional): End date filter
- `granularity` (optional): `day`, `week`, or `month`

**Test:**
```bash
curl -s "http://localhost:8080/api/v1/analytics/sentiment?granularity=week" | python3 -m json.tool
```

#### GET `/analytics/topics`
Topic analysis breakdown by pillars.

**Query Parameters:**
- `pillar` (optional): Filter by specific pillar
- `limit` (optional): Limit number of results (default: 10)

**Test:**
```bash
curl -s "http://localhost:8080/api/v1/analytics/topics?limit=5" | python3 -m json.tool
```

#### GET `/analytics/network`
Network graph data for stakeholder relationships.

**Response:**
```json
{
  "success": true,
  "data": {
    "nodes": [
      {"id": "1", "name": "Hub Americas", "group": "hub"},
      {"id": "4", "name": "Shaper 1", "group": "shaper"}
    ],
    "links": [
      {"source": "1", "target": "4", "value": 1}
    ]
  }
}
```

#### GET `/analytics/engagement`
Engagement metrics for specific shapers.

**Query Parameters:**
- `shaperId[]` (optional): Array of shaper IDs
- `dateFrom` (optional): Start date filter
- `dateTo` (optional): End date filter

---

### 👥 Global Shapers API (7/7 Complete)

#### GET `/shapers/`
List all Global Shapers with pagination and filtering.

**Query Parameters:**
- `skip` (optional): Offset for pagination (default: 0)
- `limit` (optional): Results per page (default: 100, max: 1000)
- `region` (optional): Filter by region
- `focus_area` (optional): Filter by focus area

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "region": "North America",
      "focusArea": "Climate Action",
      "bio": "Climate activist and social entrepreneur",
      "organization": "Green Future Initiative",
      "engagement_score": 75.0,
      "interaction_count": 0,
      "created_at": "2025-10-12T23:11:44"
    }
  ],
  "message": "Retrieved 1 shapers"
}
```

**Test:**
```bash
curl -s http://localhost:8080/api/v1/shapers/ | python3 -m json.tool
```

#### GET `/shapers/{id}`
Get specific Global Shaper by ID.

**Path Parameters:**
- `id` (required): Shaper ID

**Test:**
```bash
curl -s http://localhost:8080/api/v1/shapers/1 | python3 -m json.tool
```

#### POST `/shapers/`
Create a new Global Shaper.

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (optional)",
  "region": "string (optional)",
  "focus_area": "string (optional)",
  "bio": "string (optional)",
  "organization": "string (optional)",
  "phone": "string (optional)",
  "position": "string (optional)",
  "website": "string (optional)",
  "linkedin_url": "string (optional)",
  "photo": "string (optional, S3 key)"
}
```

**Test:**
```bash
curl -X POST http://localhost:8080/api/v1/shapers/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "region": "Europe",
    "focus_area": "Education",
    "bio": "Education innovator and social entrepreneur"
  }' | python3 -m json.tool
```

#### PUT `/shapers/{id}`
Update an existing Global Shaper.

**Path Parameters:**
- `id` (required): Shaper ID

**Request Body:** Any subset of shaper fields to update.

**Test:**
```bash
curl -X PUT http://localhost:8080/api/v1/shapers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "position": "Senior Climate Advocate",
    "website": "https://johndoe.com"
  }' | python3 -m json.tool
```

#### DELETE `/shapers/{id}`
Remove a Global Shaper.

**Path Parameters:**
- `id` (required): Shaper ID

**Test:**
```bash
curl -X DELETE http://localhost:8080/api/v1/shapers/1
```

#### GET `/shapers/region/{region}`
Filter Global Shapers by region.

**Path Parameters:**
- `region` (required): Region name (URL encoded for spaces)

**Test:**
```bash
curl -s "http://localhost:8080/api/v1/shapers/region/North%20America" | python3 -m json.tool
```

#### GET `/shapers/focus/{focusArea}`
Filter Global Shapers by focus area.

**Path Parameters:**
- `focusArea` (required): Focus area name

**Test:**
```bash
curl -s "http://localhost:8080/api/v1/shapers/focus/Climate%20Action" | python3 -m json.tool
```

---

### 💡 Insights API (5/5 Complete)

#### GET `/insights/`
List all insights with filtering options.

**Query Parameters:**
- `skip` (optional): Pagination offset
- `limit` (optional): Results per page
- `pillar` (optional): Filter by pillar
- `dateFrom` (optional): Start date filter
- `dateTo` (optional): End date filter

#### GET `/insights/{id}`
Get specific insight by ID.

#### POST `/insights/`
Create a new insight.

#### PUT `/insights/{id}`
Update an existing insight.

#### DELETE `/insights/{id}`
Remove an insight.

---

### 📄 Documents API (6/6 Complete)

#### GET `/documents/`
List all documents with filtering options.

**Query Parameters:**
- `skip` (optional): Pagination offset
- `limit` (optional): Results per page
- `sentiment` (optional): Filter by sentiment
- `dateFrom` (optional): Start date filter
- `dateTo` (optional): End date filter
- `uploader` (optional): Filter by uploader

**Test:**
```bash
curl -s http://localhost:8080/api/v1/documents/ | python3 -m json.tool
```

#### GET `/documents/{id}`
Get document by ID with full details.

#### POST `/documents/`
Create a new document record.

**Test:**
```bash
curl -X POST http://localhost:8080/api/v1/documents/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Document", "date": "2025-10-12T23:00:00", "uploader": "admin", "main_theme": "Innovation", "sentiment": "positive", "insights": {"test": "data"}, "related_shapers": ["John Doe"]}' | python3 -m json.tool
```

#### PUT `/documents/{id}`
Update an existing document.

#### DELETE `/documents/{id}`
Delete a document.

#### GET `/documents/search`
Search documents by content, title, or metadata.

**Test:**
```bash
curl -s "http://localhost:8080/api/v1/documents/search?q=Test" | python3 -m json.tool
```

### 📝 Notes/Capture API (4/4 Complete)

#### POST `/notes/process`
AI-powered note processing with insights extraction.

**Test:**
```bash
curl -X POST http://localhost:8080/api/v1/notes/process \
  -H "Content-Type: application/json" \
  -d '{"text": "Discussion about climate action and innovation strategies for 2025.", "context": "Team Planning Meeting"}' | python3 -m json.tool
```

#### POST `/notes/save`
Save raw notes to the database.

**Test:**
```bash
curl -X POST http://localhost:8080/api/v1/notes/save \
  -H "Content-Type: application/json" \
  -d '{"title": "Team Meeting Notes", "text": "Discussion about project milestones.", "date": "2025-10-12T20:00:00", "author": "admin"}' | python3 -m json.tool
```

#### GET `/notes/`
List all saved notes with filtering.

#### GET `/notes/{id}`
Get note by ID.

### 📤 Upload API (2/2 Complete)

#### POST `/upload/document`
Upload document files to MinIO storage.

**Request:** multipart/form-data with file, title, description, uploader

#### POST `/upload/photo`
Upload profile photos to MinIO storage.

**Request:** multipart/form-data with file, title, description, user_id

### 👔 Stakeholders API (3/3 Complete)

#### GET `/stakeholders/`
List all stakeholders (maps to Participant model).

**Test:**
```bash
curl -s http://localhost:8080/api/v1/stakeholders/ | python3 -m json.tool
```

#### GET `/stakeholders/{id}`
Get stakeholder by ID with detailed information.

#### GET `/stakeholders/{id}/relationships`
Get stakeholder relationships and network connections.

**Test:**
```bash
curl -s http://localhost:8080/api/v1/stakeholders/1/relationships | python3 -m json.tool
```

---

## Development Information

### Database Models
- **MySQL 8.0** with 18+ tables
- **Primary Models:** User, Participant, Session, Insight, Action, Organization
- **Support Models:** Quote, ProcessedFile, CaptureLane, Citation, etc.

### External Dependencies
- **MinIO** for file storage
- **OpenAI API** for AI processing
- **LangGraph** for workflow orchestration

### Environment Configuration
```bash
# Database
DATABASE_URL=mysql+pymysql://ysi_user:ysi_mysql_password@localhost:3306/ysi_db

# MinIO Storage
MINIO_HOST=localhost
MINIO_PORT=9000
MINIO_USER=ysi_user
MINIO_PASSWORD=ysi_minio_password

# AI Processing
OPENAI_API_KEY=your_openai_key_here
```

### CORS Configuration
Allowed origins:
- `http://localhost:3000`
- `http://localhost:3001` (YSI Admin Frontend)
- `http://localhost:8000`
- `http://localhost:8080`

### Testing All Endpoints

**Quick Health Check:**
```bash
# Test server health
curl -s http://localhost:8080/health

# Test API documentation
curl -s http://localhost:8080/docs

# Test analytics overview
curl -s http://localhost:8080/api/v1/analytics/overview | python3 -m json.tool

# Test shapers list
curl -s http://localhost:8080/api/v1/shapers/ | python3 -m json.tool
```

### Performance Considerations
- **Pagination:** All list endpoints support `skip` and `limit`
- **Filtering:** Query parameters for efficient data retrieval
- **Caching:** Response caching for analytics endpoints (15-minute TTL)
- **Rate Limiting:** Production deployment will include rate limiting

### Error Examples

**404 Not Found:**
```json
{
  "success": false,
  "data": null,
  "error": "Shaper not found",
  "message": "Shaper not found"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "data": null,
  "error": "Database connection failed",
  "message": "Database connection failed"
}
```

---

**Last Updated:** 2025-10-12
**Server Status:** ✅ Running on `http://localhost:8080`
**Frontend Integration:** ✅ Connected and functional