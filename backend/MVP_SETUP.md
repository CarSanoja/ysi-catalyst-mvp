# YSI RAG-Powered MVP Setup Guide

## Quick Start Guide

Este MVP implementa un sistema RAG (Retrieval-Augmented Generation) profesional para el platform YSI Catalyst con embeddings vectoriales y búsqueda híbrida.

## Características del MVP

- ✅ **Vector Database**: PostgreSQL + pgvector para embeddings profesionales
- ✅ **Hybrid Search**: Combinación de búsqueda vectorial + texto completo
- ✅ **Natural Language Queries**: Procesamiento inteligente de consultas
- ✅ **Data Ingestion Pipeline**: Carga automática de transcripciones existentes  
- ✅ **Professional Logging**: Monitoreo completo de operaciones y costos
- ✅ **RESTful API**: Endpoints completos para consultas y gestión

## Arquitectura Técnica

```
Frontend → FastAPI → Search Service → Embedding Service → PostgreSQL + pgvector
                                  ↗
                  Hybrid Search (Vector + Full-text + RRF)
```

## Instalación Rápida

### 1. Prerrequisitos

```bash
# PostgreSQL con pgvector
brew install postgresql pgvector  # macOS
sudo apt install postgresql postgresql-contrib  # Ubuntu

# Python 3.8+
python --version
```

### 2. Configuración del Proyecto

```bash
cd /Users/carlos/Documents/YSI/ysi-backend

# Instalar dependencias (incluye pgvector, OpenAI, etc.)
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu OPENAI_API_KEY y DATABASE_URL
```

### 3. Setup de Base de Datos

```bash
# Configuración automática completa
python setup_database.py

# Verificar que pgvector está funcionando
psql -d ysi_db -c "SELECT '[1,2,3]'::vector;"
```

### 4. Cargar Datos Existentes

```bash
# Crear directorio de datos
mkdir -p /Users/carlos/Documents/YSI/data/transcripts

# Copiar tus archivos de transcripciones (.txt, .json, .csv)
# Luego ejecutar:
python -m app.scripts.data_ingestion --transcripts-dir /Users/carlos/Documents/YSI/data/transcripts
```

### 5. Iniciar el Servidor

```bash
uvicorn app.main:app --reload --port 8000
```

## API Endpoints del MVP

### 🔍 Búsqueda Inteligente
```bash
# Consulta de lenguaje natural
POST /api/knowledge/query
{
  "query": "¿Qué ha dicho María sobre funding?",
  "search_mode": "hybrid",
  "limit": 10
}

# Encontrar contenido similar
GET /api/knowledge/search/similar?text=discussion about funding&limit=5

# Estadísticas del conocimiento
GET /api/knowledge/stats
```

### 📊 Gestión de Datos
```bash
# Procesar texto individual
POST /api/knowledge/embeddings/process?text=New meeting transcript...

# Ingestion de datos (admin only)
POST /api/knowledge/ingest
{
  "transcripts_dir": "/path/to/transcripts",
  "source_type": "meeting_transcript"
}

# Consultas recientes del usuario
GET /api/knowledge/queries/recent?limit=20
```

## Ejemplos de Uso

### 1. Búsqueda Contextual de Stakeholders
```python
import httpx

response = httpx.post("http://localhost:8000/api/knowledge/query", json={
    "query": "What did stakeholders say about funding challenges last month?",
    "search_mode": "hybrid",
    "context": {"time_filter": "last_30_days"},
    "limit": 5
})

results = response.json()
for result in results['results']:
    print(f"Similarity: {result['similarity']:.2f}")
    print(f"Source: {result['source_type']} - {result['metadata'].get('date')}")
    print(f"Text: {result['highlighted_snippet']}")
    print("---")
```

### 2. Análisis de Temas Recurrentes
```python
# Buscar patrones en reuniones
response = httpx.post("http://localhost:8000/api/knowledge/query", json={
    "query": "recurring themes in team meetings about sustainability",
    "search_mode": "semantic",
    "source_types": ["meeting_transcript"]
})
```

### 3. Seguimiento de Action Items
```python
response = httpx.post("http://localhost:8000/api/knowledge/query", json={
    "query": "action items assigned to development team this week",
    "search_mode": "hybrid",
    "context": {"query_type": "action"}
})
```

## Estructura de Archivos Creados

```
ysi-backend/
├── app/
│   ├── models/
│   │   └── text_embedding.py          # Modelo vectorial profesional
│   ├── services/
│   │   ├── embedding_service.py       # Procesamiento de embeddings
│   │   └── search_service.py          # Búsqueda híbrida avanzada  
│   ├── api/v1/
│   │   └── knowledge.py               # API endpoints RAG
│   └── scripts/
│       └── data_ingestion.py          # Pipeline de carga de datos
├── alembic/versions/
│   └── 001_add_pgvector_and_text_embeddings.py  # Migración
├── requirements.txt                    # Dependencias actualizadas
├── setup_database.py                  # Setup automático
└── MVP_SETUP.md                      # Esta guía
```

## Características Avanzadas Implementadas

### 🧠 Búsqueda Inteligente
- **Hybrid Search**: Vector similarity + Full-text search + RRF fusion
- **Query Analysis**: Detección automática de intención y entidades
- **Contextual Ranking**: Re-ranking basado en contexto del usuario
- **Natural Language**: Soporte para consultas en español e inglés

### 🎯 Optimizaciones de Rendimiento  
- **HNSW Index**: Índice vectorial optimizado (m=16, ef_construction=64)
- **Batch Processing**: Procesamiento eficiente de documentos múltiples
- **Caching**: Deduplicación por hash SHA256
- **Cost Tracking**: Monitoreo de tokens y costos OpenAI

### 📈 Monitoreo y Analytics
- **Structured Logging**: Logs estructurados JSON para todas las operaciones
- **Performance Metrics**: Tiempo de respuesta y throughput
- **Query Analytics**: Tracking de consultas populares y patrones
- **Cost Monitoring**: Estimación de costos AWS y OpenAI

## Próximos Pasos

1. **Test del Sistema**: Ejecutar consultas de prueba
2. **Carga de Datos**: Importar transcripciones históricas
3. **Ajuste Fino**: Optimizar parámetros de búsqueda
4. **Frontend Integration**: Conectar con React frontend
5. **Production Setup**: Docker, monitoring, backups

## Troubleshooting

### Error: pgvector extension not found
```bash
# Instalar pgvector
brew install pgvector  # macOS
# O compilar desde source si es necesario
```

### Error: OpenAI API key not found
```bash
export OPENAI_API_KEY="your-key-here"
# O agregar a .env file
```

### Error: No embeddings found
```bash
# Verificar datos cargados
python -c "from app.services.embedding_service import embedding_service; print(embedding_service.get_embedding_stats())"
```

## Documentación Técnica

- **Vector Storage**: Embeddings de 1536 dimensiones (OpenAI ada-002)
- **Chunk Strategy**: 1000 tokens con 100 tokens de overlap
- **Search Fusion**: RRF con pesos 70% vector / 30% texto
- **Index Strategy**: HNSW para vectores, GIN para metadatos, B-tree para filtros

**¡Tu MVP RAG está listo para usar! 🚀**