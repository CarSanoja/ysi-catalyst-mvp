# YSI Catalyst Platform: Frontend to Database Analysis

**Document Version**: 2.0  
**Date**: 2025-09-09  
**Author**: Claude (AI Assistant)  
**Project**: Youth & Social Innovation Initiative Platform  
**Implementation Status**: 🟢 **MVP RAG COMPLETADO** ✅

## 🎉 Implementation Status Overview

### ✅ **COMPLETADO** - MVP RAG System
- 🟢 **Database Models**: 15+ modelos implementados → [`/app/models/`](ysi-backend/app/models/)
- 🟢 **RAG Services**: Embedding + Search services → [`/app/services/`](ysi-backend/app/services/)
- 🟢 **API Endpoints**: Knowledge base API → [`/app/api/v1/knowledge.py`](ysi-backend/app/api/v1/knowledge.py)
- 🟢 **Vector Database**: PostgreSQL + pgvector → [`alembic/versions/001_add_pgvector...py`](ysi-backend/alembic/versions/)
- 🟢 **Data Pipeline**: Ingestion automation → [`/app/scripts/data_ingestion.py`](ysi-backend/app/scripts/data_ingestion.py)
- 🟢 **Professional Logging**: Complete monitoring → [`/app/services/logging_service.py`](ysi-backend/app/services/logging_service.py)

### 🟡 **EN PROGRESO** - Testing & Integration
- 🔄 Data loading with real transcripts
- 🔄 Performance optimization
- 🔄 API testing and validation

### 🔴 **PENDIENTE** - Frontend & Production
- 🚫 React components integration
- 🚫 Production deployment
- 🚫 Advanced analytics

**📊 Estado General**: **MVP FUNCIONAL** - Listo para consultas RAG sobre transcripciones de stakeholders

---

## Executive Summary

This document provides a comprehensive analysis of the YSI Catalyst frontend application, mapping each UI component to required database structures for the Python/FastAPI backend. The analysis covers data flows, storage requirements, low-cost optimization strategies, and detailed logging approaches for AWS deployment.

**🚀 UPDATE (Sept 2025)**: The complete MVP RAG system has been implemented based on this analysis, providing natural language queries over stakeholder transcripts with hybrid vector + full-text search.

## Table of Contents

1. [🎯 Implementation Status by Component](#implementation-status-by-component) 
2. [Frontend Components Analysis](#1-frontend-components-analysis)
3. [Data Flow Mapping](#2-data-flow-mapping)
4. [Database Schema Requirements](#3-database-schema-requirements) ✅ **IMPLEMENTADO**
5. [Storage Architecture (S3)](#4-storage-architecture-s3) ✅ **DISEÑADO**
6. [Logging & Monitoring Strategy](#5-logging--monitoring-strategy) ✅ **IMPLEMENTADO**
7. [API Endpoints Specification](#6-api-endpoints-specification) ✅ **IMPLEMENTADO** 
8. [Low-Cost AWS Architecture](#7-low-cost-aws-architecture) ✅ **DISEÑADO**
9. [Implementation Roadmap](#8-implementation-roadmap) ✅ **COMPLETADO MVP**

---

## 🎯 Implementation Status by Component

| Component | Analysis Status | Implementation Status | Files Created |
|-----------|----------------|----------------------|---------------|
| **RAG System** | ✅ Complete | ✅ **COMPLETADO** | `text_embedding.py`, `embedding_service.py`, `search_service.py` |
| **Database Models** | ✅ Complete | ✅ **COMPLETADO** | 15+ models in `/app/models/` |
| **API Endpoints** | ✅ Complete | ✅ **COMPLETADO** | `/app/api/v1/knowledge.py` |
| **Data Pipeline** | ✅ Complete | ✅ **COMPLETADO** | `/app/scripts/data_ingestion.py` |
| **Logging System** | ✅ Complete | ✅ **COMPLETADO** | `/app/services/logging_service.py` |
| **Monitoring** | ✅ Complete | ✅ **COMPLETADO** | `/app/services/monitoring_service.py` |
| **Vector Database** | ✅ Complete | ✅ **COMPLETADO** | `001_add_pgvector_...py` migration |
| **S3 Integration** | ✅ Complete | 🟡 **DISEÑADO** | Architecture documented |
| **Frontend Integration** | ✅ Complete | 🔴 **PENDIENTE** | React components needed |
| **Production Deploy** | ✅ Complete | 🔴 **PENDIENTE** | Docker + AWS setup needed |

### 🏆 Logros Técnicos Destacados
- **Hybrid Search**: Vector + Full-text + Reciprocal Rank Fusion implementado
- **Professional Vector Storage**: pgvector con índices HNSW optimizados  
- **Natural Language Queries**: Procesamiento inteligente de consultas en español/inglés
- **Cost Optimization**: Tracking completo de tokens OpenAI y recursos AWS
- **Enterprise Logging**: Structured JSON logs para compliance y debugging

---

## 1. Frontend Components Analysis

### 1.1 Dashboard Component (`Dashboard.tsx`)

**Purpose**: Main dashboard providing overview of all YSI activities and metrics

**Data Elements Identified:**

#### Key Metrics
- **Sessions MTD**: Monthly session count with drill-down capability
- **Voices Represented**: Unique participants count + regional distribution
- **Pillar Coverage**: Progress bars for Capital (78%), Recognition (65%), Wellbeing (82%)
- **Action Items**: Closed vs Open items (32/45) with assignment tracking
- **Avg Time to Summary**: Processing efficiency metric (18 minutes)
- **Representation Balance**: Gender (52%/48%) and regional distribution

#### Team Management
- **Team Members**: 16+ members with roles, photos, names
  ```json
  {
    "name": "Sarah Chen",
    "role": "Program Director", 
    "image": "url",
    "region": "Asia-Pacific",
    "expertise": ["Innovation", "Leadership"]
  }
  ```

#### Activity Feed
- **Recent Activity**: Real-time feed with 4 types:
  - `quote`: Key quotes with speaker attribution
  - `contradiction`: Flagged contradictions between sessions
  - `action`: New action items with assignees
  - `insight`: Auto-generated insights

#### Quick Exports
- **Export Templates**: 
  - Executive Summary (EN/ES)
  - Slide Deck 
  - One-Pager
  - Last generated timestamps

#### Upcoming Events
- **Session Calendar**: Scheduled sessions with types:
  - Innovation Workshop
  - Leadership Circle  
  - Impact Measurement

**Database Requirements:**
- Daily metrics snapshots
- Team member profiles
- Activity logging system
- Export generation tracking
- Session scheduling

---

### 1.2 LiveCapture Component (`LiveCapture.tsx`)

**Purpose**: Real-time multi-lane capture during sessions with AI assistance

**Data Elements Identified:**

#### Multi-Lane Architecture
- **4 Shaper Lanes**: Individual capture streams for team members
- **1 AI Lane**: Automated insight generation
- **Lane Configuration**:
  ```json
  {
    "shaper-1": {"name": "Sarah Chen", "color": "blue"},
    "shaper-2": {"name": "Marcus Johnson", "color": "green"},
    "shaper-3": {"name": "Elena Rodriguez", "color": "purple"},
    "shaper-4": {"name": "David Kim", "color": "orange"},
    "ai-lane": {"name": "AI Insights", "color": "gradient"}
  }
  ```

#### Capture Entries Structure
```json
{
  "id": "timestamp-based-id",
  "timestamp": "14:23:45",
  "content": "Note content text",
  "author": "Sarah Chen",
  "tags": ["capital", "wellbeing"],
  "highlighted": true,
  "hasTension": false,
  "pillar": "capital"
}
```

#### AI-Generated Insights
- **Auto-highlights**: Key quotes detection
- **Contradiction Detection**: Cross-reference conflicting statements
- **Theme Emergence**: Pattern recognition for new themes
- **Real-time Processing**: Live analysis during capture

#### Live Features
- **Recording State**: Active/Paused with visual indicators
- **Live Captions**: Real-time transcription display
- **Language Toggle**: EN/ES switching
- **Quick Actions**: Star, tension flag, tagging buttons

**Database Requirements:**
- Session-based capture lanes
- Real-time entry storage
- AI insight generation logs
- Recording state management
- Live transcription storage

---

### 1.3 Insights Component (`Insights.tsx`)

**Purpose**: AI-powered analysis and synthesis of captured session data

**Data Elements Identified:**

#### Insight Structure
```json
{
  "id": "insight-uuid",
  "title": "Digital Infrastructure as Innovation Foundation",
  "summary": "Multiple participants emphasized...",
  "quotes": [
    {
      "text": "Quote content",
      "speaker": "Sarah Chen", 
      "timestamp": "14:23:45",
      "sessionId": "session-001"
    }
  ],
  "scores": {
    "novelty": 65,
    "impact": 89, 
    "feasibility": 72,
    "equity": 94,
    "evidence": 88
  },
  "theme": "Infrastructure & Access",
  "participants": ["Sarah Chen", "Dr. James Wright"],
  "relatedSessions": ["Regional Leadership Forum"]
}
```

#### Scoring System
- **5-Dimensional Scoring**: Each metric 0-100%
  - **Novelty**: How new/unique the insight is
  - **Impact**: Potential influence on outcomes
  - **Feasibility**: Practicality of implementation
  - **Equity**: Inclusiveness and fairness considerations
  - **Evidence**: Strength of supporting data

#### Cross-Session Relationships
- **Related Sessions**: Links between sessions sharing themes
- **Participant Networks**: Who contributes to which insights
- **Quote Provenance**: Full traceability to original sources

#### Action Integration
- **Convert to Actions**: Direct pathway from insights to actionable items
- **Assignment Capability**: Link insights to responsible team members

**Database Requirements:**
- Complex insight object storage (JSONB)
- Multi-dimensional scoring system
- Cross-session relationship mapping
- Quote-to-insight linkage system
- Theme clustering and categorization

---

### 1.4 CharterBuilder Component (`CharterBuilder.tsx`)

**Purpose**: Collaborative document creation with evidence-based citations

**Data Elements Identified:**

#### Document Structure
```json
{
  "sections": {
    "principles": {
      "title": "Principles",
      "content": "Markdown/HTML content",
      "progress": {"completed": 3, "total": 5},
      "lastEdit": {"time": "2h ago", "editor": "Sarah Chen"},
      "citations": ["citation-id-1", "citation-id-2"]
    }
  }
}
```

#### Citation System
```json
{
  "id": "citation-uuid",
  "type": "quote|insight|session",
  "content": "Citation text",
  "speaker": "Sarah Chen",
  "timestamp": "14:23:45", 
  "sessionId": "session-001",
  "relevanceScore": 94,
  "consentStatus": "public|chatham-house|private"
}
```

#### Advanced Features
- **Two View Modes**:
  - **Narrative**: Rich text editor with inline citations
  - **Evidence Map**: Visual relationship graph
- **Inline Toolbar**: Cite, Insert Insight, Redact functions
- **Citation Drawer**: Smart suggestion system by relevance
- **Version Control**: Full edit history with editor attribution
- **Consent Management**: Chatham House rules integration

#### Evidence Diversity Tracking
```json
{
  "diversity": {
    "regions": 8,
    "stakeholders": 12,
    "sessions": 5
  }
}
```

**Database Requirements:**
- Document versioning system
- Citation management with relevance scoring
- Consent status tracking
- Evidence diversity metrics
- Collaborative editing logs
- Export format generation

---

### 1.5 StakeholderCRM Component (`StakeholderCRM.tsx`)

**Purpose**: Complete stakeholder relationship management system

**Data Elements Identified:**

#### Stakeholder Profile
```json
{
  "id": "stakeholder-uuid",
  "name": "Dr. James Wright",
  "type": "individual|organization",
  "email": "james@example.com",
  "phone": "+1-555-0123",
  "organization": "UN Sustainable Development",
  "position": "Director of Innovation",
  "location": "Geneva, Switzerland",
  "avatar": "s3://avatars/james.jpg",
  "tags": ["UN", "Innovation", "Leadership"],
  "pillars": ["capital", "recognition"],
  "pipeline": "engaged",
  "engagementScore": 85,
  "consentStatus": "public",
  "lastInteraction": "2024-01-15",
  "owner": "Sarah Chen"
}
```

#### Interaction Tracking
```json
{
  "id": "interaction-uuid",
  "type": "meeting|email|session|call|document",
  "title": "Innovation Strategy Discussion",
  "date": "2024-01-15T14:30:00Z",
  "summary": "Discussed regional expansion...",
  "evidenceLinks": ["session-003", "document-pdf-1"],
  "participants": ["Sarah Chen", "Marcus Johnson"],
  "consentLevel": "chatham-house"
}
```

#### Pipeline Management
- **Stages**: Prospect → Engaged → Committed
- **Engagement Scoring Algorithm**:
  - Recency of interactions (40%)
  - Frequency of participation (30%) 
  - Influence/Impact level (20%)
  - Mission alignment (10%)

#### Next Steps System
```json
{
  "id": "nextstep-uuid",
  "title": "Schedule follow-up on regional expansion",
  "description": "Detailed description...",
  "dueDate": "2024-02-01",
  "owner": "Sarah Chen",
  "status": "pending|in-progress|completed",
  "priority": "high"
}
```

**Database Requirements:**
- Comprehensive stakeholder profiles
- Interaction history logging
- Pipeline status tracking
- Engagement scoring system
- Next steps/task management
- Integration with external systems (Gmail, Drive)

---

### 1.6 KnowledgeBase Component (`KnowledgeBase.tsx`)

**Purpose**: AI-powered natural language search across all session data

**Data Elements Identified:**

#### Query System
```json
{
  "query": "What inclusive finance models emerged in Latin America?",
  "filters": {
    "pillar": "capital",
    "region": "latin-america", 
    "stakeholderType": "social-enterprise"
  },
  "results": {
    "summary": "AI-generated summary...",
    "confidence": 85,
    "diversityScore": 72
  }
}
```

#### Search Results Structure
```json
{
  "pinnedQuotes": [
    {
      "text": "Quote content",
      "speaker": "Maria Santos",
      "session": "Latin America Summit", 
      "timestamp": "15:45:20",
      "consentStatus": "public",
      "language": "ES"
    }
  ],
  "supportingInsights": [
    {
      "headline": "Microfinance Innovation Patterns",
      "explanation": "Detailed explanation...",
      "evidenceCount": 12,
      "theme": "Financial Inclusion",
      "pillar": "capital",
      "region": "latin-america"
    }
  ],
  "contradictions": [
    {
      "summary": "Conflicting views on scalability vs. local impact",
      "source1": {"quote": "...", "speaker": "Person A"},
      "source2": {"quote": "...", "speaker": "Person B"}
    }
  ]
}
```

#### Advanced Features
- **Cross-session Search**: Find patterns across multiple sessions
- **Contradiction Detection**: Identify conflicting viewpoints
- **Diversity Scoring**: Measure representation in results
- **Saved Queries**: Store frequent searches
- **Redaction Control**: Respect consent levels in results

**Database Requirements:**
- Full-text search indexing
- Natural language query processing
- Cross-reference relationship mapping
- Contradiction detection algorithms
- Query result caching
- Consent-aware filtering

---

### 1.7 ManualCapture Component (`ManualCapture.tsx`)

**Purpose**: Post-session processing of documents and audio files

**Data Elements Identified:**

#### File Processing Pipeline
```json
{
  "processedNote": {
    "id": "file-process-uuid",
    "originalText": "Raw input text",
    "processedText": "Cleaned and structured text",
    "timestamp": "2024-01-15T10:30:00Z",
    "speakers": [
      {
        "id": "speaker-1",
        "name": "Sarah Chen", 
        "timestamps": ["10:15", "10:45", "11:20"]
      }
    ],
    "pillars": ["capital", "wellbeing"],
    "terms": [
      {
        "original": "micro-finance",
        "normalized": "microfinance",
        "context": "financial inclusion discussion"
      }
    ],
    "confidence": 85,
    "lowConfidenceSegments": [
      {"start": "10:45", "end": "10:47", "reason": "overlapping speech"}
    ]
  }
}
```

#### AI-Powered Extraction
- **Automatic Speaker Identification**: Voice/text pattern recognition
- **Pillar Classification**: Auto-categorization by YSI's 3 pillars
- **Quote Extraction**: Identify high-value quotable content
- **Action Item Detection**: Find actionable tasks and commitments
- **Term Normalization**: Standardize vocabulary across sessions

#### File Support
- **Text Files**: Direct processing of notes, transcripts
- **Audio Files**: Transcription + speaker identification
- **Confidence Scoring**: Quality assessment for each segment

**Database Requirements:**
- File upload and storage system (S3 integration)
- Processing status tracking
- Speaker identification and matching
- Automated content extraction
- Confidence scoring and quality control
- Integration with main session data

---

## 2. Data Flow Mapping

### 2.1 Session Lifecycle Data Flow

```mermaid
graph TD
    A[Session Creation] --> B[Live Capture]
    B --> C[Multi-lane Entries]
    C --> D[AI Processing]
    D --> E[Insight Generation]
    E --> F[Quote Extraction]
    F --> G[Knowledge Base Update]
    G --> H[Charter Integration]
    H --> I[Export Generation]
    
    B --> J[Manual Capture]
    J --> K[File Processing]
    K --> D
    
    E --> L[Dashboard Metrics]
    F --> M[Stakeholder Updates]
```

### 2.2 Cross-Component Data Dependencies

#### Dashboard Dependencies
- **Sessions**: For MTD count, recent activity
- **Insights**: For pillar coverage metrics
- **Actions**: For open/closed ratios
- **Participants**: For voice representation stats
- **Exports**: For quick export timestamps

#### LiveCapture Dependencies
- **Sessions**: Current session context
- **Users**: Lane assignments and permissions
- **AI Service**: Real-time processing
- **Transcription Service**: Live captions

#### Insights Dependencies
- **Sessions**: Source data for analysis
- **Quotes**: Evidence linking
- **Participants**: Attribution and diversity
- **Themes**: Categorization system

#### CharterBuilder Dependencies
- **Insights**: Citation sources
- **Quotes**: Direct citations
- **Sessions**: Evidence provenance
- **Users**: Edit tracking and permissions

#### StakeholderCRM Dependencies
- **Participants**: Core profile data
- **Sessions**: Interaction history
- **Actions**: Follow-up tasks
- **External Systems**: Gmail, Drive integration

#### KnowledgeBase Dependencies
- **ALL COMPONENTS**: Search across entire data corpus
- **AI/ML Services**: Natural language processing
- **Search Index**: Elasticsearch/similar

### 2.3 Real-time Data Flows

#### Live Session Updates
- **LiveCapture** → WebSocket → **Dashboard** (activity feed)
- **AI Processing** → WebSocket → **LiveCapture** (AI lane updates)
- **Transcription** → WebSocket → **LiveCapture** (live captions)

#### Cross-Session Analytics
- **Session End** → Batch Processing → **Insights Generation**
- **New Insights** → **Knowledge Base** index update
- **Insight Score Changes** → **Dashboard** metrics update

---

## 3. Database Schema Requirements

### 3.1 New Tables Required

#### Metrics and Analytics
```sql
CREATE TABLE metrics_snapshots (
    id SERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    sessions_mtd INTEGER DEFAULT 0,
    voices_represented INTEGER DEFAULT 0,
    unique_leaders INTEGER DEFAULT 0,
    regions_count INTEGER DEFAULT 0,
    pillar_coverage JSONB, -- {capital: 78, recognition: 65, wellbeing: 82}
    representation_balance JSONB, -- {gender: {male: 52, female: 48}, regional: {...}}
    action_items_open INTEGER DEFAULT 0,
    action_items_closed INTEGER DEFAULT 0,
    avg_time_to_summary FLOAT, -- in minutes
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Multi-Lane Capture System
```sql
CREATE TABLE capture_lanes (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    lane_type VARCHAR(20) NOT NULL CHECK (lane_type IN ('shaper', 'ai')),
    lane_identifier VARCHAR(50) NOT NULL, -- 'shaper-1', 'ai-lane'
    lane_name VARCHAR(100), -- 'Sarah Chen', 'AI Insights'
    lane_color VARCHAR(50), -- 'blue', 'gradient'
    entries JSONB DEFAULT '[]'::jsonb, -- Array of capture entries
    recording_state VARCHAR(20) DEFAULT 'active', -- active, paused, completed
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(session_id, lane_identifier)
);

CREATE INDEX idx_capture_lanes_session ON capture_lanes(session_id);
CREATE INDEX idx_capture_lanes_type ON capture_lanes(lane_type);
```

#### Quotes and Evidence System
```sql
CREATE TABLE quotes (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    speaker VARCHAR(200),
    timestamp VARCHAR(20), -- "14:23:45"
    pillar VARCHAR(50) CHECK (pillar IN ('capital', 'recognition', 'wellbeing')),
    consent_status VARCHAR(20) DEFAULT 'public' CHECK (consent_status IN ('public', 'chatham-house', 'private')),
    highlighted BOOLEAN DEFAULT FALSE,
    has_tension BOOLEAN DEFAULT FALSE,
    confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 100),
    language VARCHAR(5) DEFAULT 'EN',
    source_type VARCHAR(20) DEFAULT 'live' CHECK (source_type IN ('live', 'manual', 'ai')),
    lane_id INTEGER REFERENCES capture_lanes(id),
    created_by_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quotes_session ON quotes(session_id);
CREATE INDEX idx_quotes_pillar ON quotes(pillar);
CREATE INDEX idx_quotes_speaker ON quotes(speaker);
CREATE INDEX idx_quotes_consent ON quotes(consent_status);
CREATE INDEX idx_quotes_content_fts ON quotes USING gin(to_tsvector('english', content));
```

#### Charter Documents and Citations
```sql
CREATE TABLE charter_documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    sections JSONB DEFAULT '{}'::jsonb, -- Document sections with content
    version INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published')),
    created_by_id INTEGER REFERENCES users(id),
    current_editor_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE citations (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES charter_documents(id) ON DELETE CASCADE,
    section_id VARCHAR(100) NOT NULL, -- 'principles', 'priorities'
    paragraph_id VARCHAR(100), -- For precise positioning
    citation_type VARCHAR(20) NOT NULL CHECK (citation_type IN ('quote', 'insight', 'session')),
    quote_id INTEGER REFERENCES quotes(id),
    insight_id INTEGER REFERENCES insights(id),
    session_id INTEGER REFERENCES sessions(id),
    relevance_score FLOAT CHECK (relevance_score >= 0 AND relevance_score <= 100),
    position_in_text INTEGER, -- Character position
    created_by_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_citations_document ON citations(document_id);
CREATE INDEX idx_citations_type ON citations(citation_type);
CREATE INDEX idx_citations_relevance ON citations(relevance_score DESC);
```

#### Stakeholder Interaction Tracking
```sql
CREATE TABLE interactions (
    id SERIAL PRIMARY KEY,
    stakeholder_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('meeting', 'email', 'session', 'call', 'document')),
    title VARCHAR(200) NOT NULL,
    summary TEXT,
    interaction_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    evidence_links JSONB DEFAULT '[]'::jsonb, -- Array of evidence IDs/URLs
    participants_involved JSONB DEFAULT '[]'::jsonb, -- Array of participant names/IDs
    consent_level VARCHAR(20) DEFAULT 'public' CHECK (consent_level IN ('public', 'chatham-house', 'private')),
    created_by_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_interactions_stakeholder ON interactions(stakeholder_id);
CREATE INDEX idx_interactions_type ON interactions(interaction_type);
CREATE INDEX idx_interactions_date ON interactions(interaction_date DESC);
```

#### Next Steps and Task Management
```sql
CREATE TABLE next_steps (
    id SERIAL PRIMARY KEY,
    stakeholder_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
    interaction_id INTEGER REFERENCES interactions(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE,
    owner_id INTEGER REFERENCES users(id),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
    completion_date TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_next_steps_stakeholder ON next_steps(stakeholder_id);
CREATE INDEX idx_next_steps_owner ON next_steps(owner_id);
CREATE INDEX idx_next_steps_status ON next_steps(status);
CREATE INDEX idx_next_steps_due_date ON next_steps(due_date);
```

#### Knowledge Base Queries
```sql
CREATE TABLE knowledge_queries (
    id SERIAL PRIMARY KEY,
    query_text TEXT NOT NULL,
    query_hash VARCHAR(64) UNIQUE, -- For deduplication
    results JSONB DEFAULT '{}'::jsonb, -- Summary, confidence, citations
    filters_applied JSONB DEFAULT '{}'::jsonb, -- Pillar, region, etc.
    confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 100),
    diversity_score FLOAT CHECK (diversity_score >= 0 AND diversity_score <= 100),
    user_id INTEGER REFERENCES users(id),
    is_saved BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    query_count INTEGER DEFAULT 1, -- How many times this query was run
    last_executed TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_knowledge_queries_user ON knowledge_queries(user_id);
CREATE INDEX idx_knowledge_queries_saved ON knowledge_queries(is_saved);
CREATE INDEX idx_knowledge_queries_hash ON knowledge_queries(query_hash);
CREATE INDEX idx_knowledge_queries_text_fts ON knowledge_queries USING gin(to_tsvector('english', query_text));
```

#### File Processing System
```sql
CREATE TABLE processed_files (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id),
    original_filename VARCHAR(300) NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('text', 'audio', 'pdf', 'doc', 'video')),
    file_size_bytes BIGINT,
    s3_key VARCHAR(500) NOT NULL, -- S3 object key
    s3_bucket VARCHAR(100) DEFAULT 'ysi-catalyst-storage',
    processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'queued')),
    processing_progress INTEGER DEFAULT 0 CHECK (processing_progress >= 0 AND processing_progress <= 100),
    extracted_content TEXT,
    speakers_identified JSONB DEFAULT '[]'::jsonb,
    confidence_overall FLOAT CHECK (confidence_overall >= 0 AND confidence_overall <= 100),
    low_confidence_segments JSONB DEFAULT '[]'::jsonb,
    processing_error TEXT,
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_processed_files_session ON processed_files(session_id);
CREATE INDEX idx_processed_files_status ON processed_files(processing_status);
CREATE INDEX idx_processed_files_type ON processed_files(file_type);
CREATE INDEX idx_processed_files_s3_key ON processed_files(s3_key);
```

#### Activity Logging System
```sql
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_id INTEGER REFERENCES sessions(id), -- NULL for non-session activities
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- session, insight, quote, stakeholder, document
    entity_id INTEGER,
    details JSONB DEFAULT '{}'::jsonb, -- Action-specific metadata
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100), -- For request tracing
    duration_ms INTEGER, -- Action duration
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action_type);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_session ON activity_logs(session_id);
```

### 3.2 Modifications to Existing Tables

#### Sessions Table Enhancements
```sql
-- Add new columns to existing sessions table
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS live_captions TEXT,
ADD COLUMN IF NOT EXISTS capture_lanes_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'pending' 
    CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS recording_started_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS recording_ended_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS export_configs JSONB DEFAULT '{}'::jsonb, -- Export preferences
ADD COLUMN IF NOT EXISTS consent_summary JSONB DEFAULT '{}'::jsonb; -- Consent status summary
```

#### Insights Table Enhancements  
```sql
-- Add detailed tracking to insights
ALTER TABLE insights
ADD COLUMN IF NOT EXISTS quotes_linked JSONB DEFAULT '[]'::jsonb, -- Array of quote IDs
ADD COLUMN IF NOT EXISTS participants_involved JSONB DEFAULT '[]'::jsonb, -- Array of participant names
ADD COLUMN IF NOT EXISTS related_sessions JSONB DEFAULT '[]'::jsonb, -- Array of session IDs  
ADD COLUMN IF NOT EXISTS confidence_breakdown JSONB DEFAULT '{}'::jsonb, -- Per-score confidence
ADD COLUMN IF NOT EXISTS evidence_diversity JSONB DEFAULT '{}'::jsonb, -- Diversity metrics
ADD COLUMN IF NOT EXISTS theme_confidence FLOAT CHECK (theme_confidence >= 0 AND theme_confidence <= 100),
ADD COLUMN IF NOT EXISTS last_updated_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
```

#### Participants Table CRM Enhancement
```sql
-- Transform participants into full stakeholder CRM
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS stakeholder_type VARCHAR(20) DEFAULT 'individual' 
    CHECK (stakeholder_type IN ('individual', 'organization')),
ADD COLUMN IF NOT EXISTS pipeline_status VARCHAR(20) DEFAULT 'prospect' 
    CHECK (pipeline_status IN ('prospect', 'engaged', 'committed', 'inactive')),
ADD COLUMN IF NOT EXISTS engagement_score FLOAT DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS pillars_involved JSONB DEFAULT '[]'::jsonb, -- ['capital', 'recognition', 'wellbeing']
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS position VARCHAR(200),
ADD COLUMN IF NOT EXISTS website VARCHAR(500),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS avatar_s3_key VARCHAR(500),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES users(id), -- Account owner
ADD COLUMN IF NOT EXISTS last_interaction_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS interaction_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_zone VARCHAR(50),
ADD COLUMN IF NOT EXISTS communication_preferences JSONB DEFAULT '{}'::jsonb;
```

#### Actions Table Enhancement
```sql
-- Connect actions to broader ecosystem
ALTER TABLE actions
ADD COLUMN IF NOT EXISTS interaction_id INTEGER REFERENCES interactions(id),
ADD COLUMN IF NOT EXISTS insight_id INTEGER REFERENCES insights(id), -- Source insight
ADD COLUMN IF NOT EXISTS stakeholder_id INTEGER REFERENCES participants(id),
ADD COLUMN IF NOT EXISTS action_type VARCHAR(50) DEFAULT 'follow_up' 
    CHECK (action_type IN ('follow_up', 'research', 'outreach', 'documentation', 'meeting', 'review')),
ADD COLUMN IF NOT EXISTS estimated_hours FLOAT,
ADD COLUMN IF NOT EXISTS actual_hours FLOAT,
ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '[]'::jsonb, -- Array of dependent action IDs
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS completion_notes TEXT;
```

#### Users Table Enhancements
```sql
-- Add user preferences and tracking
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_s3_key VARCHAR(500),
ADD COLUMN IF NOT EXISTS time_zone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS language_preference VARCHAR(5) DEFAULT 'EN',
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS dashboard_config JSONB DEFAULT '{}'::jsonb, -- Custom dashboard settings
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS session_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS insights_created INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS documents_edited INTEGER DEFAULT 0;
```

### 3.3 Database Triggers and Functions

#### Automatic Metrics Updates
```sql
-- Function to update user statistics
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'sessions' AND TG_OP = 'INSERT' THEN
        UPDATE users 
        SET session_count = session_count + 1
        WHERE id = NEW.created_by_id;
    ELSIF TG_TABLE_NAME = 'insights' AND TG_OP = 'INSERT' THEN
        UPDATE users 
        SET insights_created = insights_created + 1
        WHERE id = NEW.created_by_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_user_session_stats
    AFTER INSERT ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER trigger_update_user_insight_stats
    AFTER INSERT ON insights  
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();
```

#### Activity Logging Trigger
```sql
-- Function for automatic activity logging
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_logs (
        user_id, 
        action_type, 
        entity_type, 
        entity_id, 
        details
    ) VALUES (
        COALESCE(NEW.created_by_id, NEW.owner_id, 1), 
        TG_OP || '_' || TG_TABLE_NAME,
        TG_TABLE_NAME,
        NEW.id,
        json_build_object('timestamp', NOW(), 'table', TG_TABLE_NAME)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to key tables
CREATE TRIGGER trigger_log_sessions AFTER INSERT OR UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER trigger_log_insights AFTER INSERT OR UPDATE ON insights
    FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER trigger_log_quotes AFTER INSERT OR UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION log_activity();
```

---

## 4. Storage Architecture (S3)

### 4.1 S3 Bucket Structure

```
ysi-catalyst-storage/
├── audio-files/
│   ├── sessions/
│   │   └── session-{id}/
│   │       ├── original/
│   │       │   └── {timestamp}-recording.wav
│   │       ├── processed/
│   │       │   ├── transcript.json
│   │       │   └── speakers.json
│   │       └── clips/
│   │           └── {quote-id}-{timestamp}.wav
│   └── manual-uploads/
│       └── {upload-id}/
│           └── {filename}
├── documents/
│   ├── exports/
│   │   ├── executive-summaries/
│   │   │   └── {date}/
│   │   │       ├── executive-summary-en.pdf
│   │   │       └── executive-summary-es.pdf
│   │   ├── slide-decks/
│   │   │   └── {session-id}/
│   │   │       └── {date}-slides.pptx
│   │   └── one-pagers/
│   │       └── {topic}/
│   │           └── {date}-onepager.pdf
│   ├── charters/
│   │   ├── drafts/
│   │   │   └── {document-id}/
│   │   │       └── v{version}/
│   │   │           ├── charter.docx
│   │   │           └── citations.json
│   │   └── published/
│   │       └── youth-social-innovation-charter-v{final}.pdf
│   └── templates/
│       ├── export-templates/
│       └── document-templates/
├── media/
│   ├── avatars/
│   │   ├── users/
│   │   │   └── {user-id}/
│   │   │       ├── profile.jpg
│   │   │       └── thumbnail.jpg
│   │   └── stakeholders/
│   │       └── {stakeholder-id}/
│   │           └── avatar.jpg
│   ├── session-assets/
│   │   └── {session-id}/
│   │       ├── presentation-materials/
│   │       └── shared-documents/
│   └── organization-logos/
│       └── {org-id}/
│           └── logo.png
├── backups/
│   ├── database/
│   │   └── {date}/
│   │       ├── full-backup.sql
│   │       └── incremental-{timestamp}.sql
│   ├── files/
│   │   └── {date}/
│   │       └── file-manifest.json
│   └── configurations/
│       └── {date}/
│           └── system-config.json
└── logs/
    ├── application/
    │   └── {date}/
    │       ├── api-access.log
    │       ├── errors.log
    │       └── performance.log
    ├── processing/
    │   └── {date}/
    │       ├── file-processing.log
    │       └── ai-insights.log
    └── security/
        └── {date}/
            ├── authentication.log
            └── authorization.log
```

### 4.2 S3 Configuration for Cost Optimization

#### Lifecycle Policies
```json
{
  "Rules": [
    {
      "ID": "audio-files-lifecycle",
      "Status": "Enabled",
      "Filter": {"Prefix": "audio-files/"},
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90, 
          "StorageClass": "GLACIER"
        },
        {
          "Days": 365,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ]
    },
    {
      "ID": "logs-lifecycle",
      "Status": "Enabled", 
      "Filter": {"Prefix": "logs/"},
      "Transitions": [
        {
          "Days": 7,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 2555
      }
    }
  ]
}
```

#### Intelligent Tiering
```json
{
  "Id": "intelligent-tiering-config",
  "Status": "Enabled",
  "Filter": {
    "And": {
      "Prefix": "documents/",
      "Tags": [
        {
          "Key": "auto-tier",
          "Value": "enabled"
        }
      ]
    }
  },
  "Tiering": {
    "AccessTier": "ARCHIVE_ACCESS",
    "Days": 90
  }
}
```

### 4.3 File Processing Pipeline

#### Upload Flow
```python
# Upload workflow for different file types
FILE_PROCESSING_CONFIG = {
    "audio": {
        "max_size_mb": 500,
        "allowed_formats": [".wav", ".mp3", ".m4a", ".flac"],
        "processing_steps": [
            "virus_scan",
            "format_validation", 
            "audio_analysis",
            "transcription",
            "speaker_identification",
            "quote_extraction",
            "insight_generation"
        ],
        "storage_class": "STANDARD",
        "retention_days": 2555  # 7 years
    },
    "document": {
        "max_size_mb": 50,
        "allowed_formats": [".pdf", ".docx", ".txt", ".md"],
        "processing_steps": [
            "virus_scan",
            "text_extraction",
            "content_analysis",
            "entity_recognition",
            "theme_classification"
        ],
        "storage_class": "STANDARD_IA",
        "retention_days": 1825  # 5 years
    },
    "image": {
        "max_size_mb": 10,
        "allowed_formats": [".jpg", ".png", ".gif", ".webp"],
        "processing_steps": [
            "virus_scan",
            "image_optimization",
            "thumbnail_generation",
            "metadata_extraction"
        ],
        "storage_class": "STANDARD",
        "retention_days": 1825
    }
}
```

---

## 5. Logging & Monitoring Strategy

### 5.1 Comprehensive Logging Architecture

#### Application Layer Logging
```python
# Structured logging configuration
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "structured": {
            "format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s | %(request_id)s | %(user_id)s",
            "class": "pythonjsonlogger.jsonlogger.JsonFormatter"
        }
    },
    "handlers": {
        "cloudwatch": {
            "level": "INFO",
            "class": "watchtower.CloudWatchLogsHandler",
            "log_group": "ysi-catalyst-app",
            "stream_name": "{hostname}-{time:%Y-%m-%d}",
            "formatter": "structured"
        },
        "s3_archive": {
            "level": "DEBUG", 
            "class": "logging_handlers.S3Handler",
            "bucket": "ysi-catalyst-storage",
            "key_prefix": "logs/application/",
            "formatter": "structured"
        }
    },
    "loggers": {
        "ysi_catalyst": {
            "handlers": ["cloudwatch", "s3_archive"],
            "level": "INFO",
            "propagate": False
        },
        "database": {
            "handlers": ["cloudwatch"],
            "level": "WARNING"
        },
        "security": {
            "handlers": ["cloudwatch", "s3_archive"], 
            "level": "INFO"
        }
    }
}
```

#### Database Activity Logging
```sql
-- Enable PostgreSQL logging
ALTER SYSTEM SET log_statement = 'mod'; -- Log all data-modifying statements
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1 second
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
SELECT pg_reload_conf();
```

#### API Request Logging
```python
# FastAPI middleware for comprehensive request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Generate request ID
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    # Extract user info
    user_id = getattr(request.state, 'user_id', 'anonymous')
    
    # Log request start
    logger.info(
        "API_REQUEST_START",
        extra={
            "request_id": request_id,
            "user_id": user_id,
            "method": request.method,
            "url": str(request.url),
            "client_ip": request.client.host,
            "user_agent": request.headers.get("user-agent"),
            "content_length": request.headers.get("content-length")
        }
    )
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration = time.time() - start_time
    
    # Log response
    logger.info(
        "API_REQUEST_END",
        extra={
            "request_id": request_id,
            "user_id": user_id,
            "status_code": response.status_code,
            "duration_ms": round(duration * 1000, 2),
            "response_size": response.headers.get("content-length")
        }
    )
    
    return response
```

### 5.2 Business Logic Logging

#### Session Activity Tracking
```python
class SessionActivityLogger:
    """Log all session-related activities with full context"""
    
    @staticmethod
    def log_session_created(session_id: int, user_id: int, details: dict):
        logger.info(
            "SESSION_CREATED",
            extra={
                "session_id": session_id,
                "user_id": user_id,
                "session_type": details.get("type"),
                "participant_count": details.get("participant_count", 0),
                "duration_planned": details.get("duration_minutes"),
                "consent_settings": details.get("consent_settings"),
                "pillars": details.get("pillars", [])
            }
        )
    
    @staticmethod
    def log_capture_entry(session_id: int, lane_id: str, entry_data: dict):
        logger.info(
            "CAPTURE_ENTRY_ADDED",
            extra={
                "session_id": session_id,
                "lane_id": lane_id,
                "entry_id": entry_data.get("id"),
                "content_length": len(entry_data.get("content", "")),
                "has_tags": len(entry_data.get("tags", [])) > 0,
                "is_highlighted": entry_data.get("highlighted", False),
                "has_tension": entry_data.get("has_tension", False),
                "timestamp": entry_data.get("timestamp")
            }
        )
    
    @staticmethod  
    def log_ai_insight_generated(session_id: int, insight_data: dict):
        logger.info(
            "AI_INSIGHT_GENERATED",
            extra={
                "session_id": session_id,
                "insight_type": insight_data.get("type"),
                "confidence_score": insight_data.get("confidence"),
                "processing_duration": insight_data.get("processing_time_ms"),
                "source_entries_count": insight_data.get("source_count", 0)
            }
        )
```

#### Stakeholder Interaction Logging  
```python
class StakeholderActivityLogger:
    """Track all stakeholder-related activities for CRM insights"""
    
    @staticmethod
    def log_interaction_created(stakeholder_id: int, interaction_data: dict):
        logger.info(
            "STAKEHOLDER_INTERACTION",
            extra={
                "stakeholder_id": stakeholder_id,
                "interaction_type": interaction_data.get("type"),
                "duration_minutes": interaction_data.get("duration"),
                "participant_count": len(interaction_data.get("participants", [])),
                "consent_level": interaction_data.get("consent_level"),
                "evidence_links_count": len(interaction_data.get("evidence_links", []))
            }
        )
    
    @staticmethod
    def log_engagement_score_update(stakeholder_id: int, old_score: float, new_score: float, factors: dict):
        logger.info(
            "ENGAGEMENT_SCORE_UPDATED",
            extra={
                "stakeholder_id": stakeholder_id,
                "old_score": old_score,
                "new_score": new_score,
                "score_delta": new_score - old_score,
                "update_factors": factors
            }
        )
```

#### Document and Export Logging
```python
class DocumentActivityLogger:
    """Track document creation, editing, and export activities"""
    
    @staticmethod
    def log_charter_edit(document_id: int, user_id: int, edit_details: dict):
        logger.info(
            "CHARTER_DOCUMENT_EDITED",
            extra={
                "document_id": document_id,
                "user_id": user_id,
                "section_edited": edit_details.get("section"),
                "edit_type": edit_details.get("type"),  # content, citation, formatting
                "characters_added": edit_details.get("chars_added", 0),
                "characters_removed": edit_details.get("chars_removed", 0),
                "citations_added": edit_details.get("citations_added", 0)
            }
        )
    
    @staticmethod
    def log_export_generated(export_type: str, document_id: int, user_id: int, export_data: dict):
        logger.info(
            "DOCUMENT_EXPORT_GENERATED",
            extra={
                "export_type": export_type,
                "document_id": document_id,
                "user_id": user_id,
                "format": export_data.get("format"),
                "file_size_bytes": export_data.get("file_size"),
                "generation_time_ms": export_data.get("generation_time"),
                "s3_key": export_data.get("s3_key"),
                "citation_count": export_data.get("citation_count", 0)
            }
        )
```

### 5.3 Security and Audit Logging

#### Authentication and Authorization
```python
class SecurityLogger:
    """Security-focused logging for audit compliance"""
    
    @staticmethod
    def log_login_attempt(email: str, success: bool, ip_address: str, details: dict):
        logger.warning(
            "LOGIN_ATTEMPT",
            extra={
                "email": email,
                "success": success,
                "ip_address": ip_address,
                "user_agent": details.get("user_agent"),
                "timestamp": datetime.utcnow().isoformat(),
                "session_id": details.get("session_id"),
                "failure_reason": details.get("failure_reason") if not success else None
            }
        )
    
    @staticmethod
    def log_permission_check(user_id: int, resource: str, action: str, granted: bool):
        logger.info(
            "PERMISSION_CHECK", 
            extra={
                "user_id": user_id,
                "resource": resource,
                "action": action,
                "granted": granted,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    @staticmethod
    def log_data_access(user_id: int, entity_type: str, entity_id: int, consent_level: str):
        logger.info(
            "DATA_ACCESS",
            extra={
                "user_id": user_id,
                "entity_type": entity_type,
                "entity_id": entity_id,
                "consent_level": consent_level,
                "access_granted": True,  # Only log if access granted
                "timestamp": datetime.utcnow().isoformat()
            }
        )
```

#### File and Processing Security
```python
class FileSecurityLogger:
    """Log file operations for security monitoring"""
    
    @staticmethod
    def log_file_upload(user_id: int, filename: str, file_details: dict):
        logger.info(
            "FILE_UPLOAD",
            extra={
                "user_id": user_id,
                "filename": filename,
                "file_size": file_details.get("size"),
                "file_type": file_details.get("type"),
                "virus_scan_result": file_details.get("virus_scan"),
                "s3_key": file_details.get("s3_key"),
                "upload_duration_ms": file_details.get("upload_time")
            }
        )
    
    @staticmethod
    def log_sensitive_data_access(user_id: int, data_type: str, access_details: dict):
        logger.warning(
            "SENSITIVE_DATA_ACCESS",
            extra={
                "user_id": user_id,
                "data_type": data_type,  # PII, financial, etc.
                "access_reason": access_details.get("reason"),
                "consent_verified": access_details.get("consent_verified", False),
                "redaction_applied": access_details.get("redaction_applied", False)
            }
        )
```

### 5.4 Performance and Monitoring

#### Application Performance Monitoring
```python
import time
from functools import wraps

def monitor_performance(operation_name: str):
    """Decorator to monitor performance of key operations"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            
            try:
                result = await func(*args, **kwargs)
                success = True
                error = None
            except Exception as e:
                result = None
                success = False
                error = str(e)
                raise
            finally:
                duration = time.time() - start_time
                
                logger.info(
                    "PERFORMANCE_METRIC",
                    extra={
                        "operation": operation_name,
                        "duration_ms": round(duration * 1000, 2),
                        "success": success,
                        "error": error,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                )
            
            return result
        return wrapper
    return decorator

# Usage examples
@monitor_performance("ai_insight_generation")
async def generate_insights(session_data: dict):
    # AI processing logic
    pass

@monitor_performance("database_query_complex")
async def complex_cross_session_query(filters: dict):
    # Complex database query
    pass
```

#### Resource Usage Monitoring
```python
class ResourceMonitor:
    """Monitor system resource usage"""
    
    @staticmethod
    def log_resource_usage():
        import psutil
        
        logger.info(
            "RESOURCE_USAGE",
            extra={
                "cpu_percent": psutil.cpu_percent(interval=1),
                "memory_percent": psutil.virtual_memory().percent,
                "disk_usage_percent": psutil.disk_usage('/').percent,
                "active_connections": len(psutil.net_connections()),
                "timestamp": datetime.utcnow().isoformat()
            }
        )
```

### 5.5 Cost Monitoring and Optimization

#### AWS Service Usage Tracking
```python
class CostMonitor:
    """Monitor AWS service usage for cost optimization"""
    
    @staticmethod
    def log_s3_operation(operation: str, bucket: str, key: str, size_bytes: int = None):
        logger.info(
            "S3_OPERATION",
            extra={
                "operation": operation,  # PUT, GET, DELETE
                "bucket": bucket,
                "key": key,
                "size_bytes": size_bytes,
                "estimated_cost_usd": CostMonitor.calculate_s3_cost(operation, size_bytes),
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    @staticmethod
    def log_database_query_cost(query_type: str, execution_time_ms: float, rows_affected: int):
        logger.info(
            "DATABASE_COST",
            extra={
                "query_type": query_type,
                "execution_time_ms": execution_time_ms,
                "rows_affected": rows_affected,
                "estimated_rcu": CostMonitor.calculate_rds_cost(execution_time_ms),
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    @staticmethod
    def calculate_s3_cost(operation: str, size_bytes: int) -> float:
        # Simplified cost calculation
        costs = {
            "PUT": 0.0005,  # per 1000 requests
            "GET": 0.0004,  # per 1000 requests
            "storage": 0.023  # per GB per month
        }
        if operation in costs:
            return costs[operation] / 1000  # Per request
        elif operation == "storage" and size_bytes:
            return (size_bytes / (1024**3)) * costs["storage"] / (30*24)  # Per hour
        return 0.0

    @staticmethod
    def calculate_rds_cost(execution_time_ms: float) -> float:
        # Simplified RDS cost calculation based on execution time
        base_cost_per_hour = 0.02  # t3.micro pricing
        return (execution_time_ms / (1000 * 60 * 60)) * base_cost_per_hour
```

---

## 6. API Endpoints Specification

### 6.1 Dashboard Endpoints

#### Metrics and Analytics
```python
# GET /api/v1/dashboard/metrics
{
  "sessions_mtd": 23,
  "voices_represented": {
    "total": 147,
    "unique_leaders": 89,
    "regions": 23
  },
  "pillar_coverage": {
    "capital": 78,
    "recognition": 65, 
    "wellbeing": 82
  },
  "action_items": {
    "open": 45,
    "closed": 32,
    "completion_rate": 71.1
  },
  "avg_time_to_summary_minutes": 18,
  "representation_balance": {
    "gender": {"male": 52, "female": 48},
    "regional": {"balanced": true, "score": 85}
  }
}

# GET /api/v1/dashboard/recent-activity
{
  "activities": [
    {
      "id": 1,
      "type": "quote",
      "session": "Social Impact Accelerator",
      "time": "2h",
      "content": "We need to shift from charity mindset...",
      "speaker": "Dr. James Wright",
      "metadata": {"highlighted": true}
    }
  ],
  "pagination": {"page": 1, "total": 50}
}

# GET /api/v1/dashboard/exports
{
  "exports": [
    {
      "type": "executive_summary",
      "title": "Executive Summary (EN)",
      "last_generated": "2h ago",
      "s3_key": "documents/exports/executive-summaries/2024-01-15/summary-en.pdf",
      "languages": ["EN", "ES"]
    }
  ]
}
```

### 6.2 Live Capture Endpoints

#### Session Management
```python
# POST /api/v1/sessions/{session_id}/capture/start
{
  "lane_config": {
    "shaper_lanes": [
      {"id": "shaper-1", "user_id": 1, "name": "Sarah Chen"},
      {"id": "shaper-2", "user_id": 2, "name": "Marcus Johnson"}
    ],
    "ai_lane_enabled": true
  },
  "recording_settings": {
    "enable_live_captions": true,
    "language": "EN",
    "consent_mode": "chatham_house"
  }
}

# POST /api/v1/sessions/{session_id}/capture/entry
{
  "lane_id": "shaper-1",
  "content": "Key insight about digital infrastructure...",
  "timestamp": "14:23:45",
  "tags": ["capital", "infrastructure"],
  "highlighted": false,
  "has_tension": false
}

# GET /api/v1/sessions/{session_id}/capture/lanes
{
  "lanes": {
    "shaper-1": {
      "name": "Sarah Chen",
      "entries": [
        {
          "id": "entry-uuid",
          "timestamp": "14:23:45",
          "content": "Note content",
          "tags": ["capital"],
          "highlighted": true
        }
      ]
    },
    "ai-lane": {
      "name": "AI Insights",
      "entries": [
        {
          "id": "ai-insight-uuid",
          "timestamp": "14:24:00", 
          "type": "highlight",
          "insight": "Digital infrastructure theme emerging",
          "confidence": 85
        }
      ]
    }
  }
}

# WebSocket: /ws/sessions/{session_id}/live-capture
{
  "type": "entry_added",
  "lane_id": "shaper-1",
  "entry": {...},
  "timestamp": "2024-01-15T14:23:45Z"
}
```

### 6.3 Insights Endpoints

#### Insight Management
```python
# GET /api/v1/insights
{
  "insights": [
    {
      "id": "insight-uuid",
      "title": "Digital Infrastructure as Innovation Foundation",
      "summary": "Multiple participants emphasized...",
      "quotes": [
        {
          "id": "quote-uuid",
          "text": "Quote content",
          "speaker": "Sarah Chen",
          "timestamp": "14:23:45",
          "session_id": "session-001",
          "consent_status": "public"
        }
      ],
      "scores": {
        "novelty": 65,
        "impact": 89,
        "feasibility": 72,
        "equity": 94,
        "evidence": 88
      },
      "theme": "Infrastructure & Access",
      "participants": ["Sarah Chen", "Dr. James Wright"],
      "related_sessions": ["session-001", "session-003"]
    }
  ],
  "pagination": {"page": 1, "total": 25},
  "filters_applied": {"pillar": "capital"}
}

# POST /api/v1/insights/{insight_id}/convert-to-action
{
  "action": {
    "title": "Implement digital infrastructure assessment",
    "description": "Based on insight findings...",
    "owner_id": 1,
    "priority": "high",
    "due_date": "2024-02-15"
  }
}

# PUT /api/v1/insights/{insight_id}/scores
{
  "scores": {
    "novelty": 70,
    "impact": 90,
    "feasibility": 75,
    "equity": 95,
    "evidence": 85
  },
  "updated_by": 1
}
```

### 6.4 Charter Builder Endpoints

#### Document Management
```python
# GET /api/v1/charter-documents/{document_id}
{
  "id": "doc-uuid",
  "title": "Youth Social Innovation Charter",
  "sections": {
    "principles": {
      "title": "Principles",
      "content": "Markdown content with citations...",
      "progress": {"completed": 3, "total": 5},
      "last_edit": {"time": "2h ago", "editor": "Sarah Chen"}
    }
  },
  "version": 1,
  "status": "draft",
  "citations_count": 15
}

# POST /api/v1/charter-documents/{document_id}/citations
{
  "section_id": "principles",
  "paragraph_id": "p1",
  "citation_type": "quote",
  "quote_id": "quote-uuid",
  "relevance_score": 94,
  "position_in_text": 150
}

# GET /api/v1/charter-documents/{document_id}/citations/suggestions
{
  "text_selection": "digital infrastructure enables innovation",
  "suggestions": [
    {
      "citation": {
        "id": "quote-uuid",
        "type": "quote", 
        "content": "Without reliable internet...",
        "speaker": "Sarah Chen",
        "relevance_score": 94,
        "consent_status": "public"
      }
    }
  ]
}

# POST /api/v1/charter-documents/{document_id}/export
{
  "format": "pdf",
  "language": "EN",
  "include_citations": true,
  "export_options": {
    "consent_filter": "public_only"
  }
}
```

### 6.5 Stakeholder CRM Endpoints

#### Stakeholder Management
```python
# GET /api/v1/stakeholders
{
  "stakeholders": [
    {
      "id": "stakeholder-uuid",
      "name": "Dr. James Wright",
      "type": "individual",
      "email": "james@example.com",
      "organization": "UN Sustainable Development",
      "position": "Director of Innovation",
      "location": "Geneva, Switzerland",
      "pipeline": "engaged",
      "engagement_score": 85,
      "last_interaction": "2024-01-15T14:30:00Z",
      "tags": ["UN", "Innovation"],
      "pillars": ["capital", "recognition"],
      "owner": "Sarah Chen"
    }
  ],
  "pagination": {"page": 1, "total": 156},
  "filters": {"pillar": "capital", "pipeline": "engaged"}
}

# POST /api/v1/stakeholders/{stakeholder_id}/interactions
{
  "type": "meeting",
  "title": "Innovation Strategy Discussion", 
  "date": "2024-01-15T14:30:00Z",
  "duration_minutes": 60,
  "summary": "Discussed regional expansion strategies...",
  "participants": ["Sarah Chen", "Marcus Johnson"],
  "consent_level": "chatham_house",
  "evidence_links": ["session-003"]
}

# GET /api/v1/stakeholders/{stakeholder_id}/engagement-history
{
  "score_history": [
    {"date": "2024-01-01", "score": 70},
    {"date": "2024-01-15", "score": 85}
  ],
  "score_factors": {
    "recency": 90,
    "frequency": 75,
    "influence": 85,
    "alignment": 90
  },
  "interactions_count": 12,
  "sessions_participated": 5
}

# POST /api/v1/stakeholders/{stakeholder_id}/next-steps
{
  "title": "Schedule follow-up on regional expansion",
  "description": "Follow up on Latin America expansion plans...",
  "due_date": "2024-02-01",
  "owner_id": 1,
  "priority": "high"
}
```

### 6.6 Knowledge Base Endpoints

#### Search and Query
```python
# POST /api/v1/knowledge-base/query
{
  "query": "What inclusive finance models emerged in Latin America?",
  "filters": {
    "pillar": "capital",
    "region": "latin_america",
    "stakeholder_type": "social_enterprise",
    "time_range": {"start": "2024-01-01", "end": "2024-01-31"}
  },
  "options": {
    "include_contradictions": true,
    "max_results": 20,
    "min_confidence": 70
  }
}

# Response
{
  "query_id": "query-uuid",
  "results": {
    "summary": "Several innovative microfinance models emerged...",
    "confidence": 85,
    "diversity_score": 72,
    "processing_time_ms": 1250
  },
  "pinned_quotes": [
    {
      "id": "quote-uuid",
      "text": "Community-based microfinance shows 40% higher success rates",
      "speaker": "Maria Santos",
      "session": "Latin America Financial Innovation Summit",
      "timestamp": "15:45:20",
      "relevance_score": 92
    }
  ],
  "supporting_insights": [
    {
      "id": "insight-uuid", 
      "headline": "Community-Driven Financial Models",
      "explanation": "Analysis of regional approaches...",
      "evidence_count": 8,
      "theme": "Financial Inclusion"
    }
  ],
  "contradictions": [
    {
      "summary": "Scalability vs. Community Focus tension",
      "sources": [
        {"quote": "Local models can't scale...", "speaker": "Person A"},
        {"quote": "Scale destroys community connection...", "speaker": "Person B"}
      ]
    }
  ]
}

# GET /api/v1/knowledge-base/saved-queries
{
  "queries": [
    {
      "id": "saved-query-uuid",
      "query_text": "Youth recognition mechanisms by region",
      "last_executed": "2024-01-15T10:30:00Z",
      "execution_count": 5,
      "is_public": false
    }
  ]
}

# POST /api/v1/knowledge-base/queries/{query_id}/save
{
  "is_public": false,
  "tags": ["finance", "latin-america"]
}
```

### 6.7 File Processing Endpoints

#### Upload and Processing
```python
# POST /api/v1/files/upload
# Content-Type: multipart/form-data
{
  "file": "binary data",
  "session_id": "session-uuid",
  "file_type": "audio",
  "processing_options": {
    "enable_transcription": true,
    "enable_speaker_identification": true,
    "enable_ai_analysis": true,
    "language": "EN"
  }
}

# Response
{
  "file_id": "file-uuid",
  "upload_status": "success",
  "s3_key": "audio-files/sessions/session-123/original/recording.wav",
  "processing_status": "queued",
  "estimated_processing_time_minutes": 15
}

# GET /api/v1/files/{file_id}/status
{
  "id": "file-uuid",
  "processing_status": "processing",
  "progress_percentage": 65,
  "stages_completed": [
    "virus_scan",
    "format_validation", 
    "transcription"
  ],
  "current_stage": "speaker_identification",
  "estimated_completion": "2024-01-15T15:45:00Z"
}

# GET /api/v1/files/{file_id}/results
{
  "id": "file-uuid",
  "processing_status": "completed",
  "results": {
    "transcript": "Full transcript text...",
    "speakers": [
      {
        "id": "speaker-1",
        "name": "Sarah Chen",
        "confidence": 92,
        "segments": [
          {"start": "00:01:15", "end": "00:01:45", "text": "..."}
        ]
      }
    ],
    "extracted_quotes": [
      {
        "text": "Digital infrastructure is foundational...",
        "speaker": "Sarah Chen",
        "timestamp": "00:01:30",
        "confidence": 88,
        "pillar": "capital"
      }
    ],
    "insights_generated": [
      {
        "title": "Infrastructure Investment Priority",
        "confidence": 85,
        "supporting_evidence_count": 3
      }
    ]
  },
  "confidence_overall": 87,
  "low_confidence_segments": [
    {"start": "00:15:30", "end": "00:15:45", "reason": "overlapping_speech"}
  ]
}
```

### 6.8 Authentication and User Management

#### Authentication Endpoints
```python
# POST /api/v1/auth/login
{
  "email": "sarah@ysi.org",
  "password": "secure_password"
}

# Response
{
  "access_token": "jwt_token_string",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "email": "sarah@ysi.org",
    "full_name": "Sarah Chen",
    "role": "program_director",
    "permissions": ["session_create", "document_edit", "export_generate"],
    "preferences": {
      "language": "EN",
      "timezone": "UTC",
      "dashboard_config": {...}
    }
  }
}

# GET /api/v1/users/me/activity
{
  "recent_activities": [
    {
      "action": "session_created",
      "timestamp": "2024-01-15T14:30:00Z",
      "entity": {"type": "session", "id": "session-123"}
    }
  ],
  "statistics": {
    "sessions_created": 45,
    "insights_generated": 120,
    "documents_edited": 15,
    "last_active": "2024-01-15T14:30:00Z"
  }
}
```

---

## 7. Low-Cost AWS Architecture

### 7.1 Infrastructure Overview

#### Core Services Configuration
```yaml
# docker-compose.production.yml
version: '3.8'
services:
  # Application containers
  backend:
    image: ysi-catalyst-backend:latest
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    environment:
      - DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/ysi_db
      - REDIS_URL=redis://elasticache-endpoint:6379/0
      - S3_BUCKET=ysi-catalyst-storage
    
  frontend:
    image: ysi-catalyst-frontend:latest
    deploy:
      replicas: 1
      resources:
        limits:
          cpus: '0.25'
          memory: 256M
    environment:
      - REACT_APP_API_URL=https://api.ysi-catalyst.org
```

#### AWS Service Selection (Low-Cost)
```terraform
# RDS - PostgreSQL
resource "aws_db_instance" "ysi_postgres" {
  identifier = "ysi-catalyst-db"
  engine = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"  # $0.018/hour
  allocated_storage = 20  # 20GB
  max_allocated_storage = 100  # Auto-scaling up to 100GB
  
  storage_encrypted = true
  backup_retention_period = 7
  backup_window = "03:00-04:00"
  maintenance_window = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "ysi-catalyst-final-snapshot"
  
  tags = {
    Environment = "production"
    Project = "YSI-Catalyst"
    CostOptimized = "true"
  }
}

# ElastiCache - Redis
resource "aws_elasticache_subnet_group" "ysi_cache_subnet" {
  name = "ysi-cache-subnet"
  subnet_ids = data.aws_subnets.default.ids
}

resource "aws_elasticache_cluster" "ysi_redis" {
  cluster_id = "ysi-catalyst-cache"
  engine = "redis"
  node_type = "cache.t3.micro"  # $0.017/hour
  num_cache_nodes = 1
  parameter_group_name = "default.redis7"
  port = 6379
  subnet_group_name = aws_elasticache_subnet_group.ysi_cache_subnet.name
  
  tags = {
    Environment = "production"
    Project = "YSI-Catalyst"
  }
}

# ECS Fargate - Application Hosting
resource "aws_ecs_cluster" "ysi_cluster" {
  name = "ysi-catalyst"
  
  setting {
    name = "containerInsights"
    value = "disabled"  # Disable to save costs
  }
  
  tags = {
    Environment = "production"
    Project = "YSI-Catalyst"
  }
}

resource "aws_ecs_service" "ysi_backend" {
  name = "ysi-backend"
  cluster = aws_ecs_cluster.ysi_cluster.id
  task_definition = aws_ecs_task_definition.ysi_backend.arn
  desired_count = 1  # Scale up during peak usage
  
  launch_type = "FARGATE"
  platform_version = "LATEST"
  
  network_configuration {
    subnets = data.aws_subnets.default.ids
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }
  
  enable_execute_command = true  # For debugging
}

# Application Load Balancer
resource "aws_lb" "ysi_alb" {
  name = "ysi-catalyst-alb"
  internal = false
  load_balancer_type = "application"
  security_groups = [aws_security_group.alb.id]
  subnets = data.aws_subnets.default.ids
  
  enable_deletion_protection = false
  enable_cross_zone_load_balancing = true
  idle_timeout = 60
  
  tags = {
    Environment = "production"
    Project = "YSI-Catalyst"
  }
}
```

#### S3 Configuration with Cost Optimization
```terraform
resource "aws_s3_bucket" "ysi_storage" {
  bucket = "ysi-catalyst-storage"
  
  tags = {
    Environment = "production"
    Project = "YSI-Catalyst"
  }
}

resource "aws_s3_bucket_versioning" "ysi_storage_versioning" {
  bucket = aws_s3_bucket.ysi_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Intelligent Tiering for cost optimization
resource "aws_s3_bucket_intelligent_tiering_configuration" "ysi_storage_tiering" {
  bucket = aws_s3_bucket.ysi_storage.id
  name = "ysi-intelligent-tiering"
  
  status = "Enabled"
  
  tiering {
    access_tier = "ARCHIVE_ACCESS"
    days = 90
  }
  
  tiering {
    access_tier = "DEEP_ARCHIVE_ACCESS"
    days = 180
  }
}

# Lifecycle rules for automated cost optimization
resource "aws_s3_bucket_lifecycle_configuration" "ysi_storage_lifecycle" {
  bucket = aws_s3_bucket.ysi_storage.id
  
  rule {
    id = "audio_files_lifecycle"
    status = "Enabled"
    
    filter {
      prefix = "audio-files/"
    }
    
    transition {
      days = 30
      storage_class = "STANDARD_IA"
    }
    
    transition {
      days = 90
      storage_class = "GLACIER"
    }
    
    transition {
      days = 365
      storage_class = "DEEP_ARCHIVE"
    }
  }
  
  rule {
    id = "logs_lifecycle"
    status = "Enabled"
    
    filter {
      prefix = "logs/"
    }
    
    expiration {
      days = 90  # Delete old logs after 90 days
    }
  }
  
  rule {
    id = "backup_lifecycle"
    status = "Enabled"
    
    filter {
      prefix = "backups/"
    }
    
    transition {
      days = 1
      storage_class = "STANDARD_IA"
    }
    
    transition {
      days = 30
      storage_class = "GLACIER"
    }
  }
}
```

### 7.2 Cost Monitoring and Optimization

#### CloudWatch Alarms for Budget Control
```terraform
resource "aws_cloudwatch_metric_alarm" "high_cost_alarm" {
  alarm_name = "ysi-catalyst-high-cost"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods = "2"
  metric_name = "EstimatedCharges"
  namespace = "AWS/Billing"
  period = "86400"  # 24 hours
  statistic = "Maximum"
  threshold = "50"  # Alert if monthly cost exceeds $50
  alarm_description = "This metric monitors AWS estimated charges"
  alarm_actions = [aws_sns_topic.cost_alerts.arn]
  
  dimensions = {
    Currency = "USD"
  }
}

resource "aws_sns_topic" "cost_alerts" {
  name = "ysi-catalyst-cost-alerts"
}

resource "aws_sns_topic_subscription" "cost_email_alert" {
  topic_arn = aws_sns_topic.cost_alerts.arn
  protocol = "email"
  endpoint = "admin@ysi-catalyst.org"
}
```

#### Auto-Scaling Configuration
```terraform
resource "aws_appautoscaling_target" "ysi_backend_target" {
  max_capacity = 4  # Maximum of 4 instances
  min_capacity = 1  # Minimum of 1 instance
  resource_id = "service/${aws_ecs_cluster.ysi_cluster.name}/${aws_ecs_service.ysi_backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace = "ecs"
}

resource "aws_appautoscaling_policy" "ysi_backend_scale_up" {
  name = "ysi-backend-scale-up"
  policy_type = "StepScaling"
  resource_id = aws_appautoscaling_target.ysi_backend_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ysi_backend_target.scalable_dimension
  service_namespace = aws_appautoscaling_target.ysi_backend_target.service_namespace
  
  step_scaling_policy_configuration {
    adjustment_type = "ChangeInCapacity"
    cooldown = 300
    metric_aggregation_type = "Average"
    
    step_adjustment {
      metric_interval_lower_bound = 0
      scaling_adjustment = 1
    }
  }
}

# Scale up when CPU > 70%
resource "aws_cloudwatch_metric_alarm" "ysi_backend_cpu_high" {
  alarm_name = "ysi-backend-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods = "2"
  metric_name = "CPUUtilization"
  namespace = "AWS/ECS"
  period = "300"
  statistic = "Average"
  threshold = "70"
  alarm_description = "This metric monitors ECS cpu utilization"
  alarm_actions = [aws_appautoscaling_policy.ysi_backend_scale_up.arn]
  
  dimensions = {
    ServiceName = aws_ecs_service.ysi_backend.name
    ClusterName = aws_ecs_cluster.ysi_cluster.name
  }
}
```

### 7.3 Estimated Monthly Costs (USD)

#### Breakdown by Service
```yaml
Cost_Estimation:
  RDS_PostgreSQL:
    instance: "db.t3.micro"
    cost_per_hour: 0.018
    monthly_cost: 13.10  # 730 hours
    storage_20gb: 2.30
    backup_7_days: 1.00
    total: 16.40
    
  ElastiCache_Redis:
    instance: "cache.t3.micro"
    cost_per_hour: 0.017
    monthly_cost: 12.40
    
  ECS_Fargate:
    backend_instances: 2
    cpu_vcpu: 0.5
    memory_gb: 1
    cost_per_vcpu_hour: 0.04048
    cost_per_gb_hour: 0.004445
    backend_monthly: 29.63  # (0.5 * 0.04048 + 1 * 0.004445) * 730 * 2
    
    frontend_instance: 1
    cpu_vcpu: 0.25
    memory_gb: 0.5
    frontend_monthly: 7.41
    
    total_fargate: 37.04
    
  S3_Storage:
    standard_storage_gb: 50
    standard_cost: 1.15  # $0.023 per GB
    ia_storage_gb: 200
    ia_cost: 2.50  # $0.0125 per GB
    glacier_storage_gb: 1000
    glacier_cost: 4.00  # $0.004 per GB
    requests_put_1000: 5.00
    requests_get_1000: 2.00
    data_transfer_gb: 100
    data_transfer_cost: 9.00  # First 1GB free, then $0.09/GB
    total_s3: 23.65
    
  Application_Load_Balancer:
    alb_hours: 730
    alb_cost: 18.25  # $0.025 per hour
    lcu_hours: 730
    lcu_cost: 5.84   # $0.008 per LCU-hour (estimated 1 LCU)
    total_alb: 24.09
    
  CloudWatch_Logs:
    ingestion_gb: 10
    ingestion_cost: 5.00  # $0.50 per GB
    storage_gb: 100
    storage_cost: 3.00  # $0.03 per GB
    total_cloudwatch: 8.00
    
  Lambda_Functions:  # For file processing
    requests_million: 0.1
    requests_cost: 0.20
    gb_seconds: 1000
    compute_cost: 1.67
    total_lambda: 1.87
    
  Total_Monthly_Cost: 123.05
  
  Annual_Cost: 1476.60
  
  Cost_Per_User_Monthly: 8.21  # Assuming 15 active users
  
# Cost optimization opportunities:
Optimizations:
  - Use Reserved Instances for RDS: Save 20-40%
  - Implement Spot Instances for non-critical workloads: Save 50-90%
  - Optimize S3 storage classes: Save 30-60% on storage
  - Use CloudWatch Logs retention policies: Save 50% on log storage
  - Implement auto-shutdown for development environments: Save 65% on dev costs
  
Projected_Optimized_Cost: 85.00  # With optimizations applied
```

### 7.4 Backup and Disaster Recovery

#### Automated Backup Strategy
```terraform
# RDS Automated Backups
resource "aws_db_instance" "ysi_postgres" {
  # ... other configuration ...
  
  backup_retention_period = 7
  backup_window = "03:00-04:00"
  copy_tags_to_snapshot = true
  delete_automated_backups = false
  
  # Point-in-time recovery
  enabled_cloudwatch_logs_exports = ["postgresql"]
}

# S3 Cross-Region Replication for critical data
resource "aws_s3_bucket_replication_configuration" "ysi_storage_replication" {
  role = aws_iam_role.s3_replication.arn
  bucket = aws_s3_bucket.ysi_storage.id
  
  status = "Enabled"
  
  rule {
    id = "replicate_documents"
    status = "Enabled"
    
    filter {
      prefix = "documents/"
    }
    
    destination {
      bucket = aws_s3_bucket.ysi_storage_backup.arn
      storage_class = "STANDARD_IA"
    }
  }
}

# Lambda function for database backups to S3
resource "aws_lambda_function" "db_backup" {
  filename = "db_backup.zip"
  function_name = "ysi-db-backup"
  role = aws_iam_role.lambda_backup.arn
  handler = "backup.handler"
  runtime = "python3.9"
  timeout = 300
  
  environment {
    variables = {
      DATABASE_URL = "postgresql://..."
      S3_BUCKET = aws_s3_bucket.ysi_storage.bucket
      BACKUP_PREFIX = "backups/database/"
    }
  }
}

# CloudWatch Events to trigger daily backups
resource "aws_cloudwatch_event_rule" "daily_backup" {
  name = "ysi-daily-backup"
  description = "Trigger daily database backup"
  schedule_expression = "cron(0 2 * * ? *)"  # Daily at 2 AM
}

resource "aws_cloudwatch_event_target" "lambda_backup_target" {
  rule = aws_cloudwatch_event_rule.daily_backup.name
  target_id = "TriggerLambdaBackup"
  arn = aws_lambda_function.db_backup.arn
}
```

### 7.5 Security Configuration

#### IAM Roles and Policies
```terraform
# ECS Task Role
resource "aws_iam_role" "ecs_task_role" {
  name = "ysi-catalyst-ecs-task-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# S3 Access Policy (Least Privilege)
resource "aws_iam_policy" "s3_access" {
  name = "ysi-catalyst-s3-access"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "${aws_s3_bucket.ysi_storage.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.ysi_storage.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_s3_access" {
  role = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.s3_access.arn
}

# WAF for Application Protection
resource "aws_wafv2_web_acl" "ysi_waf" {
  name = "ysi-catalyst-waf"
  description = "WAF for YSI Catalyst application"
  scope = "REGIONAL"
  
  default_action {
    allow {}
  }
  
  rule {
    name = "AWSManagedRulesCommonRuleSet"
    priority = 1
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        name = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name = "CommonRuleSetMetric"
      sampled_requests_enabled = true
    }
  }
  
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name = "YSICatalystWAF"
    sampled_requests_enabled = true
  }
}

# Associate WAF with ALB
resource "aws_wafv2_web_acl_association" "ysi_waf_alb" {
  resource_arn = aws_lb.ysi_alb.arn
  web_acl_arn = aws_wafv2_web_acl.ysi_waf.arn
}
```

---

## 8. Implementation Roadmap

### 8.1 Phase 1: Core Infrastructure (Weeks 1-2)

#### Database Setup and Basic Backend
```markdown
**Week 1: Database Foundation**
- [ ] Set up PostgreSQL database on AWS RDS
- [ ] Create all core tables with proper indexes
- [ ] Implement database triggers for activity logging
- [ ] Set up Redis for caching and sessions
- [ ] Configure S3 buckets with lifecycle policies
- [ ] Set up basic FastAPI application structure
- [ ] Implement authentication system
- [ ] Create database migration system with Alembic

**Week 2: Core API Development**
- [ ] Implement User management endpoints
- [ ] Create Session management APIs
- [ ] Build basic Activity logging system  
- [ ] Set up file upload handling with S3
- [ ] Implement basic CRUD operations
- [ ] Add input validation and error handling
- [ ] Create comprehensive API documentation
- [ ] Set up automated testing framework
```

### 8.2 Phase 2: Live Capture System (Weeks 3-4)

#### Real-time Multi-lane Capture
```markdown
**Week 3: Live Capture Backend**
- [ ] Implement multi-lane capture system
- [ ] Create WebSocket endpoints for real-time updates
- [ ] Build capture entry storage and retrieval
- [ ] Implement AI lane integration framework
- [ ] Create quote extraction and tagging system
- [ ] Set up live transcription pipeline
- [ ] Add consent management for capture sessions
- [ ] Implement session state management

**Week 4: Live Capture Enhancement**
- [ ] Add tension flagging and highlighting
- [ ] Implement pillar-based tagging system
- [ ] Create cross-lane insight correlation
- [ ] Build live captions display system
- [ ] Add recording state management
- [ ] Implement language switching capability
- [ ] Create capture quality monitoring
- [ ] Add real-time backup and recovery
```

### 8.3 Phase 3: Intelligence Layer (Weeks 5-6)

#### AI-Powered Insights and Analysis
```markdown
**Week 5: Insight Generation System**
- [ ] Implement insight extraction algorithms
- [ ] Create 5-dimensional scoring system
- [ ] Build quote-to-insight linking system
- [ ] Implement theme clustering and categorization
- [ ] Create cross-session relationship mapping
- [ ] Add participant attribution system
- [ ] Build evidence strength calculation
- [ ] Implement insight quality validation

**Week 6: Knowledge Base Foundation**
- [ ] Set up full-text search with PostgreSQL
- [ ] Implement natural language query processing
- [ ] Create cross-session search capabilities
- [ ] Build contradiction detection system
- [ ] Add diversity scoring for search results
- [ ] Implement consent-aware result filtering
- [ ] Create saved query management
- [ ] Add query performance optimization
```

### 8.4 Phase 4: Document Management (Weeks 7-8)

#### Charter Builder and Export System
```markdown
**Week 7: Charter Document System**
- [ ] Implement document versioning system
- [ ] Create citation management with relevance scoring
- [ ] Build inline editing capabilities
- [ ] Implement evidence mapping system
- [ ] Add collaboration features with edit tracking
- [ ] Create consent-based citation filtering
- [ ] Build evidence diversity tracking
- [ ] Implement document review workflow

**Week 8: Export and Publishing**
- [ ] Create multi-format export system (PDF, DOCX, PPTX)
- [ ] Implement template-based generation
- [ ] Add bilingual export capabilities
- [ ] Build citation formatting system
- [ ] Create automated slide generation
- [ ] Implement one-pager creation
- [ ] Add export scheduling and automation
- [ ] Create sharing and distribution system
```

### 8.5 Phase 5: Stakeholder CRM (Weeks 9-10)

#### Complete Relationship Management
```markdown
**Week 9: Stakeholder Management**
- [ ] Implement comprehensive stakeholder profiles
- [ ] Create pipeline tracking system
- [ ] Build engagement scoring algorithm
- [ ] Implement interaction history tracking
- [ ] Add next steps and task management
- [ ] Create stakeholder search and filtering
- [ ] Build relationship mapping system
- [ ] Implement contact import/export

**Week 10: CRM Integration and Analytics**
- [ ] Add external system integrations (Gmail, Calendar)
- [ ] Implement stakeholder analytics dashboard
- [ ] Create engagement trend analysis
- [ ] Build communication preference management
- [ ] Add automated follow-up reminders
- [ ] Implement stakeholder segmentation
- [ ] Create diversity and representation tracking
- [ ] Add CRM reporting and insights
```

### 8.6 Phase 6: File Processing (Weeks 11-12)

#### Advanced File and Media Processing
```markdown
**Week 11: File Processing Pipeline**
- [ ] Implement multi-format file upload system
- [ ] Create audio transcription pipeline
- [ ] Build speaker identification system
- [ ] Implement automated content extraction
- [ ] Add file quality assessment
- [ ] Create processing status tracking
- [ ] Build error handling and retry mechanisms
- [ ] Implement file metadata extraction

**Week 12: Processing Intelligence**
- [ ] Add automated quote extraction from files
- [ ] Implement theme detection in processed content
- [ ] Create confidence scoring for processed content
- [ ] Build low-confidence segment flagging
- [ ] Add automated insight generation from files
- [ ] Implement term normalization system
- [ ] Create batch processing capabilities
- [ ] Add processing analytics and monitoring
```

### 8.7 Phase 7: Dashboard and Analytics (Weeks 13-14)

#### Comprehensive Metrics and Visualization
```markdown
**Week 13: Dashboard Development**
- [ ] Implement key metrics calculation and caching
- [ ] Create real-time activity feed system
- [ ] Build pillar coverage tracking
- [ ] Implement representation balance analytics
- [ ] Add export generation tracking
- [ ] Create upcoming events management
- [ ] Build team member directory
- [ ] Implement dashboard personalization

**Week 14: Advanced Analytics**
- [ ] Create trend analysis and forecasting
- [ ] Implement comparative analytics across sessions
- [ ] Build participation pattern analysis
- [ ] Add impact measurement tracking
- [ ] Create automated report generation
- [ ] Implement alert and notification system
- [ ] Build performance monitoring dashboard
- [ ] Add cost tracking and optimization alerts
```

### 8.8 Phase 8: Integration and Deployment (Weeks 15-16)

#### Production Deployment and Optimization
```markdown
**Week 15: Production Infrastructure**
- [ ] Set up production AWS environment
- [ ] Configure auto-scaling and load balancing
- [ ] Implement comprehensive monitoring
- [ ] Set up backup and disaster recovery
- [ ] Configure security policies and WAF
- [ ] Implement SSL certificates and domain setup
- [ ] Create deployment pipelines
- [ ] Set up cost monitoring and alerting

**Week 16: Testing and Go-Live**
- [ ] Conduct comprehensive integration testing
- [ ] Perform load and performance testing
- [ ] Execute security penetration testing
- [ ] Complete user acceptance testing
- [ ] Implement final bug fixes and optimizations
- [ ] Create user documentation and training materials
- [ ] Execute production deployment
- [ ] Monitor initial production usage and optimize
```

### 8.9 Success Metrics and KPIs

#### Phase-by-Phase Success Criteria
```yaml
Phase_1_Success:
  - Database performance: < 100ms for 95% of queries
  - API response time: < 200ms for standard endpoints
  - Authentication: 100% secure login/logout
  - File upload: Support files up to 500MB
  - Test coverage: > 90% for core functions

Phase_2_Success:
  - Real-time updates: < 50ms latency for WebSocket
  - Concurrent users: Support 50+ simultaneous users
  - Data integrity: 100% capture entry preservation
  - Live transcription: < 2 second delay
  - Session reliability: 99.9% uptime during sessions

Phase_3_Success:
  - Insight accuracy: > 85% relevance score from user feedback
  - Search performance: < 500ms for complex queries
  - Cross-session correlation: Find 90% of related content
  - Scoring consistency: < 10% variance between similar insights
  - Query success rate: > 95% of natural language queries return results

Phase_4_Success:
  - Document generation: < 30 seconds for standard exports
  - Citation accuracy: > 95% proper attribution
  - Export quality: Professional-grade PDF/DOCX output
  - Version control: 100% edit history preservation
  - Collaboration: Support 10+ simultaneous editors

Phase_5_Success:
  - Engagement scoring: < 5% error rate in calculations
  - CRM data integrity: 100% stakeholder information preservation
  - Integration success: 90% successful external system connections
  - User adoption: > 80% daily active user rate for CRM features
  - Follow-up efficiency: 50% improvement in task completion

Phase_6_Success:
  - Processing accuracy: > 90% for audio transcription
  - File support: 100% of specified formats processed successfully
  - Processing speed: < 2x real-time for audio files
  - Content extraction: > 95% of key quotes identified
  - Error handling: < 1% processing failures

Phase_7_Success:
  - Dashboard load time: < 2 seconds for full metrics
  - Metric accuracy: 100% calculation correctness
  - Real-time updates: < 5 second delay for activity feed
  - User engagement: > 70% daily dashboard usage
  - Report generation: < 60 seconds for complex reports

Phase_8_Success:
  - System uptime: 99.9% availability
  - Response time: < 300ms for 95% of requests under load
  - Cost efficiency: Stay under $150/month operational cost
  - Security: Pass all penetration testing requirements
  - User satisfaction: > 4.5/5 rating from initial users
```

---

## Conclusion

This comprehensive analysis provides a detailed roadmap for transforming the YSI Catalyst frontend into a fully functional, cost-effective, and highly scalable backend system. The approach prioritizes:

1. **Low-cost optimization** through careful AWS service selection and configuration
2. **Comprehensive logging** for complete operational visibility
3. **Scalable architecture** that can grow with the organization
4. **Data integrity** through robust database design and backup strategies
5. **Security-first approach** with proper access controls and monitoring
6. **Phase-by-phase implementation** to ensure steady progress and early value delivery

The estimated monthly operational cost of approximately $85-125 makes this solution accessible for non-profit organizations while providing enterprise-grade capabilities. The 16-week implementation timeline ensures systematic development with clear success criteria at each phase.

The platform will serve as a comprehensive tool for the Youth & Social Innovation Initiative, enabling effective session management, intelligent insight generation, collaborative document creation, and stakeholder relationship management - all while maintaining the highest standards of data protection and consent management required for international development work.

---

**Next Steps:**
1. Review and approve this technical specification
2. Set up development environment and initial AWS infrastructure
3. Begin Phase 1 implementation with database setup and core API development
4. Establish regular review cycles to ensure alignment with YSI's evolving needs

**Contact Information:**
For questions about this analysis or implementation support, please reach out to the development team.