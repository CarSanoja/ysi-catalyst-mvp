# YSI Catalyst: Data Flow Diagrams and Relationships

**Document Version**: 2.0  
**Date**: 2025-09-09  
**Author**: Claude (AI Assistant)  
**Implementation Status**: 🟢 **MVP RAG IMPLEMENTADO** ✅

## 🎉 RAG System Integration Status

### ✅ **COMPLETADO** - RAG Data Flows
- 🟢 **Vector Embeddings**: TextEmbedding model con pgvector
- 🟢 **Hybrid Search**: Vector + Full-text + RRF fusion  
- 🟢 **Natural Language Processing**: Query analysis y contextual understanding
- 🟢 **Data Ingestion**: Pipeline automatizado para transcripciones
- 🟢 **Knowledge API**: Endpoints completos para consultas RAG

**🚀 UPDATE**: Todos los diagramas han sido actualizados para incluir el flujo completo del sistema RAG implementado.  

---

## 🧠 RAG System Data Flow (IMPLEMENTADO ✅)

### RAG Architecture Overview

```mermaid
graph TD
    A[User Natural Language Query] --> B[Knowledge API Endpoint]
    B --> C[Search Service]
    C --> D[Query Analysis Engine]
    D --> E{Query Type Detection}
    
    E -->|Stakeholder Query| F[Entity Extraction]
    E -->|Meeting Query| G[Temporal Filtering]  
    E -->|Topic Query| H[Semantic Analysis]
    
    F --> I[Embedding Service]
    G --> I
    H --> I
    
    I --> J[OpenAI ada-002]
    J --> K[Query Vector Generation]
    
    K --> L[Hybrid Search Engine]
    L --> M[Vector Similarity Search]
    L --> N[Full-text Search]
    
    M --> O[PostgreSQL + pgvector]
    N --> O
    
    M --> P[RRF Fusion Engine]
    N --> P
    
    P --> Q[Contextual Reranking]
    Q --> R[Response Generation]
    R --> S[Citation & Source Attribution]
    S --> T[Structured JSON Response]
    T --> U[Logging & Analytics]
    
    style A fill:#e1f5fe
    style B fill:#c8e6c9
    style O fill:#fff3e0
    style T fill:#f3e5f5
```

### Text Embedding Pipeline (IMPLEMENTADO ✅)

```mermaid
graph LR
    A[Raw Transcript Files] --> B[Data Ingestion Service]
    B --> C{File Type Detection}
    
    C -->|.txt| D[Plain Text Parser]
    C -->|.json| E[Structured Data Parser]
    C -->|.csv| F[Tabular Data Parser]
    
    D --> G[Text Normalization]
    E --> G
    F --> G
    
    G --> H[Intelligent Chunking]
    H --> I[1000 tokens + 100 overlap]
    
    I --> J[SHA256 Hash Generation]
    J --> K[Duplicate Detection]
    
    K -->|New Content| L[OpenAI Embedding API]
    K -->|Duplicate| M[Skip Processing]
    
    L --> N[Vector Generation - 1536 dims]
    N --> O[TextEmbedding Model]
    O --> P[PostgreSQL + pgvector]
    
    P --> Q[HNSW Index Creation]
    Q --> R[Metadata Indexing]
    R --> S[Performance Optimization]
    
    style A fill:#e3f2fd
    style L fill:#fff8e1  
    style P fill:#e8f5e8
```

### Hybrid Search Flow (IMPLEMENTADO ✅)

```mermaid
graph TD
    A[Natural Language Query] --> B[Query Analysis]
    B --> C[Intent Classification]
    B --> D[Entity Extraction]
    B --> E[Time Filter Detection]
    
    C --> F[Search Strategy Selection]
    F --> G[Vector Search Path]
    F --> H[Text Search Path]
    
    G --> I[Query → OpenAI Embedding]
    I --> J[Cosine Similarity Search]
    J --> K[HNSW Index Lookup]
    
    H --> L[Full-text PostgreSQL Search]
    L --> M[ILIKE Pattern Matching]
    M --> N[GIN Index Utilization]
    
    K --> O[Vector Results - Ranked by Similarity]
    N --> P[Text Results - Ranked by Relevance]
    
    O --> Q[Reciprocal Rank Fusion]
    P --> Q
    
    Q --> R[RRF Score Calculation]
    R --> S[Combined Results Ranking]
    
    S --> T[Contextual Reranking]
    T --> U[User Preference Adjustment]
    T --> V[Temporal Relevance Boost]
    T --> W[Source Type Weighting]
    
    U --> X[Final Ranked Results]
    V --> X
    W --> X
    
    X --> Y[Response Generation]
    Y --> Z[Citation Attribution]
    
    style A fill:#e1f5fe
    style Q fill:#fff3e0
    style X fill:#e8f5e8
```

---

## Entity Relationship Overview

### Core Entities and Their Relationships

```mermaid
erDiagram
    USER ||--o{ SESSION : creates
    USER ||--o{ CAPTURE_LANE : assigned_to
    USER ||--o{ INSIGHT : creates
    USER ||--o{ CHARTER_DOCUMENT : edits
    USER ||--o{ PARTICIPANT : owns
    USER ||--o{ TEXT_EMBEDDING : processes
    USER ||--o{ KNOWLEDGE_QUERY : performs
    
    SESSION ||--o{ CAPTURE_LANE : contains
    SESSION ||--o{ PARTICIPANT : has
    SESSION ||--o{ QUOTE : generates
    SESSION ||--o{ INSIGHT : produces
    SESSION ||--o{ ACTION : spawns
    SESSION ||--o{ PROCESSED_FILE : processes
    SESSION ||--o{ TEXT_EMBEDDING : generates
    
    CAPTURE_LANE ||--o{ QUOTE : captures
    
    QUOTE }o--|| THEME : categorized_by
    QUOTE }o--|| SESSION : belongs_to
    QUOTE }o--|| CAPTURE_LANE : created_in
    QUOTE ||--o{ TEXT_EMBEDDING : vectorized_as
    
    INSIGHT }o--|| SESSION : derived_from
    INSIGHT }o--|| THEME : classified_as
    INSIGHT ||--o{ CITATION : cited_in
    INSIGHT ||--o{ TEXT_EMBEDDING : vectorized_as
    
    PARTICIPANT ||--o{ INTERACTION : has
    PARTICIPANT ||--o{ NEXT_STEP : assigned
    PARTICIPANT }o--|| ORGANIZATION : belongs_to
    
    INTERACTION ||--o{ NEXT_STEP : generates
    INTERACTION ||--o{ TEXT_EMBEDDING : vectorized_as
    
    CHARTER_DOCUMENT ||--o{ CITATION : contains
    
    CITATION }o--|| QUOTE : references
    CITATION }o--|| INSIGHT : references
    CITATION }o--|| SESSION : references
    CITATION }o--|| TEXT_EMBEDDING : found_via
    
    ACTION }o--|| SESSION : from
    ACTION }o--|| INSIGHT : triggered_by
    ACTION }o--|| INTERACTION : follows
    
    TEXT_EMBEDDING {
        int id PK
        string content_hash UK "SHA256 for deduplication"
        string source_type "meeting_transcript, insight, etc"
        int source_id "Reference to original entity"
        vector embedding "1536 dimensions - OpenAI ada-002"
        json metadata "Filters and context"
        int token_count "Cost tracking"
        timestamp created_at
    }
    
    KNOWLEDGE_QUERY {
        int id PK
        int user_id FK
        string query_text
        string search_mode "hybrid, vector, text, semantic"
        int result_count
        int processing_time_ms
        json query_analysis "Intent, entities, filters"
        timestamp created_at
    }
    
    KNOWLEDGE_QUERY }o--|| USER : performed_by
    KNOWLEDGE_QUERY ||--o{ TEXT_EMBEDDING : searches
    ACTION }o--|| PARTICIPANT : assigned_to
    
    PROCESSED_FILE }o--|| SESSION : belongs_to
    
    ACTIVITY_LOG }o--|| USER : performed_by
    ACTIVITY_LOG }o--|| SESSION : relates_to
    
    KNOWLEDGE_QUERY }o--|| USER : executed_by
    
    METRICS_SNAPSHOT : daily_aggregates
```

## Data Flow Diagrams

### 1. Live Session Capture Flow

```mermaid
flowchart TD
    A[Session Started] --> B[Create Capture Lanes]
    B --> C[4 Shaper Lanes + 1 AI Lane]
    
    C --> D[Real-time Entry Capture]
    D --> E[Entry Processing]
    E --> F{Entry Type}
    
    F -->|Manual Entry| G[Store in Capture Lane]
    F -->|AI Generated| H[AI Processing]
    
    G --> I[Apply Tags & Highlights]
    H --> I
    
    I --> J[Real-time Updates via WebSocket]
    J --> K[Frontend Live Display]
    
    G --> L[Quote Extraction]
    L --> M[Store Quote Entity]
    M --> N[Link to Session & Lane]
    
    H --> O[Generate AI Insights]
    O --> P[Store Insight Entity]
    P --> Q[Link Evidence & Quotes]
    
    subgraph "Live Transcription"
        R[Audio Input] --> S[Transcription Service]
        S --> T[Live Captions Display]
        T --> U[Store Transcript]
    end
    
    subgraph "Logging Layer"
        V[Activity Logger]
        G --> V
        H --> V
        L --> V
        O --> V
    end
```

### 2. File Processing Pipeline

```mermaid
flowchart TD
    A[File Upload] --> B[Virus Scan]
    B --> C{Scan Result}
    
    C -->|Safe| D[Store in S3]
    C -->|Threat| E[Reject & Log]
    
    D --> F[Create ProcessedFile Record]
    F --> G[Queue for Processing]
    
    G --> H{File Type}
    
    H -->|Audio| I[Audio Processing Pipeline]
    H -->|Document| J[Document Processing Pipeline]
    H -->|Image| K[Image Processing Pipeline]
    
    I --> L[Audio Transcription]
    L --> M[Speaker Identification]
    M --> N[Quote Extraction]
    N --> O[Insight Generation]
    
    J --> P[Text Extraction]
    P --> Q[Entity Recognition]
    Q --> R[Theme Classification]
    
    K --> S[Image Optimization]
    S --> T[Metadata Extraction]
    
    O --> U[Update ProcessedFile Status]
    R --> U
    T --> U
    
    U --> V[Link to Session]
    V --> W[Trigger Notifications]
    
    subgraph "S3 Storage Structure"
        X[Original Files]
        Y[Processed Results]
        Z[Extracted Clips]
    end
    
    D --> X
    L --> Y
    N --> Z
```

### 3. Insight Generation and Knowledge Graph

```mermaid
flowchart TD
    A[Raw Session Data] --> B[Multi-Source Input]
    B --> C[Live Capture Entries]
    B --> D[Processed Files]
    B --> E[Historical Context]
    
    C --> F[AI Analysis Engine]
    D --> F
    E --> F
    
    F --> G[Pattern Recognition]
    G --> H[Theme Clustering]
    H --> I[Cross-Session Correlation]
    
    I --> J[Generate Insights]
    J --> K[5-Dimensional Scoring]
    
    K --> L{Quality Gates}
    L -->|Pass| M[Store Insight]
    L -->|Fail| N[Flag for Review]
    
    M --> O[Link Evidence]
    O --> P[Link Participants]
    P --> Q[Update Knowledge Graph]
    
    Q --> R[Search Index Update]
    R --> S[Available for Citations]
    
    subgraph "Scoring Dimensions"
        T[Novelty Score]
        U[Impact Score]
        V[Feasibility Score]
        W[Equity Score]
        X[Evidence Strength]
    end
    
    K --> T
    K --> U
    K --> V
    K --> W
    K --> X
    
    subgraph "Knowledge Graph Updates"
        Y[Entity Relationships]
        Z[Theme Networks]
        AA[Session Connections]
    end
    
    Q --> Y
    Q --> Z
    Q --> AA
```

### 4. Charter Document Collaboration Flow

```mermaid
flowchart TD
    A[User Opens Document] --> B[Check Edit Permissions]
    B --> C{Permission Level}
    
    C -->|Editor| D[Enable Full Editing]
    C -->|Reviewer| E[Enable Comments Only]
    C -->|Viewer| F[Read-Only Mode]
    
    D --> G[Real-time Collaboration]
    G --> H[Text Selection]
    H --> I[Inline Toolbar]
    
    I --> J[Cite Action]
    I --> K[Insert Insight]
    I --> L[Redact Content]
    
    J --> M[Citation Suggestions]
    M --> N[Relevance Scoring]
    N --> O[Select Citation]
    O --> P[Insert with Tracking]
    
    K --> Q[Available Insights]
    Q --> R[Filter by Context]
    R --> S[Insert Insight]
    
    L --> T[Apply Redaction Rules]
    T --> U[Chatham House Compliance]
    
    P --> V[Update Document Version]
    S --> V
    U --> V
    
    V --> W[Log Edit Activity]
    W --> X[Sync to Collaborators]
    
    subgraph "Version Control"
        Y[Document Versions]
        Z[Edit History]
        AA[Attribution Tracking]
    end
    
    V --> Y
    W --> Z
    X --> AA
    
    subgraph "Export Generation"
        BB[PDF Export]
        CC[DOCX Export]
        DD[PPTX Export]
        EE[Multilingual Variants]
    end
    
    V --> BB
    V --> CC
    V --> DD
    V --> EE
```

### 5. Stakeholder CRM Data Flow

```mermaid
flowchart TD
    A[Stakeholder Created] --> B[Initial Profile Setup]
    B --> C[Pipeline Status: Prospect]
    
    C --> D[Interaction Tracking]
    D --> E[Log Interaction]
    E --> F[Update Engagement Score]
    
    F --> G{Score Calculation}
    G --> H[Recency Factor 40%]
    G --> I[Frequency Factor 30%]
    G --> J[Influence Factor 20%]
    G --> K[Alignment Factor 10%]
    
    H --> L[Weighted Score]
    I --> L
    J --> L
    K --> L
    
    L --> M{Pipeline Progression}
    M -->|Score > 70| N[Move to Engaged]
    M -->|Score > 85| O[Move to Committed]
    M -->|Score < 40| P[Flag for Follow-up]
    
    E --> Q[Generate Next Steps]
    Q --> R[Task Assignment]
    R --> S[Due Date Tracking]
    
    S --> T[Task Completion]
    T --> U[Update Interaction History]
    U --> V[Trigger Score Recalculation]
    V --> F
    
    subgraph "Integration Points"
        W[Gmail Integration]
        X[Calendar Integration]
        Y[Drive Integration]
    end
    
    E --> W
    R --> X
    Q --> Y
    
    subgraph "Analytics Output"
        Z[Engagement Trends]
        AA[Pipeline Analysis]
        BB[Diversity Metrics]
    end
    
    L --> Z
    M --> AA
    B --> BB
```

### 6. Knowledge Base Query Processing

```mermaid
flowchart TD
    A[Natural Language Query] --> B[Query Preprocessing]
    B --> C[Intent Recognition]
    C --> D[Entity Extraction]
    
    D --> E[Search Strategy]
    E --> F{Query Type}
    
    F -->|Factual| G[Direct Entity Search]
    F -->|Analytical| H[Cross-Reference Analysis]
    F -->|Comparative| I[Multi-Entity Comparison]
    
    G --> J[Session Data Search]
    H --> J
    I --> J
    
    J --> K[Quote Matching]
    K --> L[Insight Correlation]
    L --> M[Evidence Gathering]
    
    M --> N[Relevance Scoring]
    N --> O[Diversity Analysis]
    O --> P[Confidence Assessment]
    
    P --> Q[Result Compilation]
    Q --> R[Contradiction Detection]
    R --> S[Supporting Evidence]
    
    S --> T[Consent Filtering]
    T --> U{Consent Levels}
    
    U -->|Public| V[Include All Results]
    U -->|Chatham House| W[Anonymize Sources]
    U -->|Private| X[Exclude from Results]
    
    V --> Y[Final Result Set]
    W --> Y
    X --> Y
    
    Y --> Z[Cache Results]
    Z --> AA[Return to User]
    
    subgraph "Search Index"
        BB[Full-Text Index]
        CC[Entity Graph Index]
        DD[Temporal Index]
    end
    
    J --> BB
    L --> CC
    M --> DD
```

### 7. Dashboard Metrics Aggregation Flow

```mermaid
flowchart TD
    A[Daily Metrics Collection] --> B[Data Sources]
    
    B --> C[Session Data]
    B --> D[Participant Data]
    B --> E[Insight Data]
    B --> F[Action Data]
    B --> G[Activity Logs]
    
    C --> H[Sessions MTD Count]
    D --> I[Voice Representation Stats]
    E --> J[Pillar Coverage Analysis]
    F --> K[Action Completion Rates]
    G --> L[Activity Patterns]
    
    H --> M[Metrics Aggregator]
    I --> M
    J --> M
    K --> M
    L --> M
    
    M --> N[Calculate Derived Metrics]
    N --> O[Representation Balance]
    N --> P[Engagement Trends]
    N --> Q[Performance Indicators]
    
    O --> R[Store Daily Snapshot]
    P --> R
    Q --> R
    
    R --> S[Real-time Dashboard Updates]
    S --> T[WebSocket Push to Frontend]
    
    T --> U[Dashboard Visualization]
    U --> V[User Interactions]
    V --> W[Drill-down Queries]
    
    W --> X[Detailed Analytics]
    X --> Y[Export Reports]
    
    subgraph "Alert System"
        Z[Threshold Monitoring]
        AA[Alert Generation]
        BB[Notification Dispatch]
    end
    
    R --> Z
    Z --> AA
    AA --> BB
    
    subgraph "Historical Analysis"
        CC[Trend Calculation]
        DD[Comparative Analysis]
        EE[Forecasting]
    end
    
    R --> CC
    CC --> DD
    DD --> EE
```

## Cross-Component Data Dependencies

### Component Interaction Matrix

| Component | Depends On | Provides To | Data Shared |
|-----------|------------|-------------|-------------|
| **Dashboard** | Sessions, Insights, Actions, Participants | Frontend Display | Aggregated metrics, activity feed |
| **LiveCapture** | Sessions, Users, AI Service | Insights, Quotes | Real-time entries, transcriptions |
| **Insights** | Sessions, Quotes, Participants, AI Service | CharterBuilder, KnowledgeBase | Scored insights, evidence links |
| **CharterBuilder** | Insights, Quotes, Sessions, Users | Export Services | Citations, document versions |
| **StakeholderCRM** | Participants, Sessions, Actions | Analytics, Reporting | Interaction history, engagement scores |
| **KnowledgeBase** | All Components | Search Results | Cross-referenced data, contradictions |
| **ManualCapture** | Sessions, AI Service | Quotes, Insights | Processed content, extracted entities |

### Data Flow Priorities

#### Real-time Data Flows (< 100ms latency)
1. **LiveCapture** → **Frontend Dashboard** (activity feed updates)
2. **LiveCapture** → **WebSocket Clients** (real-time collaboration)
3. **Transcription** → **LiveCapture** (live captions)
4. **AI Processing** → **LiveCapture** (AI lane updates)

#### Near Real-time Data Flows (< 5 seconds)
1. **Quote Extraction** → **Knowledge Base Index**
2. **Insight Generation** → **Citation Suggestions**
3. **Engagement Score Updates** → **CRM Dashboard**
4. **Activity Logging** → **Security Monitoring**

#### Batch Processing Flows (minutes to hours)
1. **File Processing** → **Content Extraction**
2. **Daily Metrics** → **Snapshot Generation**
3. **Cross-session Analysis** → **Theme Clustering**
4. **Export Generation** → **Document Creation**

## Data Consistency and Integrity

### Transaction Boundaries

#### Session-Scoped Transactions
- Creating session with initial participants
- Live capture entry with quote extraction
- Session completion with summary generation

#### Document-Scoped Transactions
- Charter editing with version control
- Citation insertion with evidence linking
- Export generation with consent verification

#### Stakeholder-Scoped Transactions
- Interaction logging with score updates
- Pipeline status changes with history
- Next step creation with notifications

### Data Validation Rules

#### Input Validation
```python
# Session creation validation
def validate_session_creation(session_data):
    required_fields = ["title", "facilitator_id", "created_by_id"]
    consent_rules = validate_consent_settings(session_data.get("consent"))
    participant_limits = validate_participant_count(session_data.get("participants"))
    return all([required_fields_check, consent_rules, participant_limits])

# Quote validation
def validate_quote(quote_data):
    content_check = len(quote_data.get("content", "")) > 10
    speaker_check = quote_data.get("speaker") is not None
    consent_check = quote_data.get("consent_status") in ["public", "chatham-house", "private"]
    return all([content_check, speaker_check, consent_check])

# Insight scoring validation
def validate_insight_scores(scores):
    required_dimensions = ["novelty", "impact", "feasibility", "equity", "evidence"]
    score_range_valid = all(0 <= scores.get(dim, -1) <= 100 for dim in required_dimensions)
    return len(scores) == len(required_dimensions) and score_range_valid
```

#### Referential Integrity
```sql
-- Foreign key constraints ensure referential integrity
ALTER TABLE quotes ADD CONSTRAINT fk_quotes_session 
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE citations ADD CONSTRAINT fk_citations_document 
    FOREIGN KEY (document_id) REFERENCES charter_documents(id) ON DELETE CASCADE;

ALTER TABLE interactions ADD CONSTRAINT fk_interactions_stakeholder 
    FOREIGN KEY (stakeholder_id) REFERENCES participants(id) ON DELETE CASCADE;

-- Check constraints ensure data validity
ALTER TABLE insights ADD CONSTRAINT chk_novelty_score 
    CHECK (novelty_score >= 0 AND novelty_score <= 100);

ALTER TABLE participants ADD CONSTRAINT chk_engagement_score 
    CHECK (engagement_score >= 0 AND engagement_score <= 100);

ALTER TABLE quotes ADD CONSTRAINT chk_consent_status 
    CHECK (consent_status IN ('public', 'chatham-house', 'private'));
```

## Performance Optimization Strategies

### Database Query Optimization
```sql
-- Indexes for frequent queries
CREATE INDEX idx_sessions_date_status ON sessions(created_at, status);
CREATE INDEX idx_quotes_session_pillar ON quotes(session_id, pillar);
CREATE INDEX idx_insights_theme_scores ON insights(theme_id, impact_score, novelty_score);
CREATE INDEX idx_participants_engagement ON participants(engagement_score DESC, pipeline_status);

-- Materialized views for complex aggregations
CREATE MATERIALIZED VIEW daily_session_metrics AS
SELECT 
    DATE(created_at) as metric_date,
    COUNT(*) as session_count,
    COUNT(DISTINCT facilitator_id) as unique_facilitators,
    AVG(duration_minutes) as avg_duration
FROM sessions 
WHERE status = 'completed'
GROUP BY DATE(created_at);

-- Refresh materialized view daily
REFRESH MATERIALIZED VIEW daily_session_metrics;
```

### Caching Strategy
```python
# Redis caching for frequently accessed data
class CacheService:
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
    
    def cache_dashboard_metrics(self, metrics_data):
        key = f"dashboard:metrics:{datetime.now().strftime('%Y-%m-%d')}"
        self.redis_client.setex(key, 3600, json.dumps(metrics_data))  # 1 hour TTL
    
    def cache_session_insights(self, session_id, insights):
        key = f"session:{session_id}:insights"
        self.redis_client.setex(key, 1800, json.dumps(insights))  # 30 minutes TTL
    
    def cache_knowledge_query(self, query_hash, results):
        key = f"knowledge:query:{query_hash}"
        self.redis_client.setex(key, 7200, json.dumps(results))  # 2 hours TTL
```

This comprehensive data flow documentation ensures that all components of the YSI Catalyst platform work together seamlessly while maintaining data integrity, performance, and security.