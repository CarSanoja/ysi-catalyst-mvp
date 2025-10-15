# RAGFlow API Integration Guide

**Versión**: 1.0  
**Fecha**: 2025-09-24  
**Autor**: YSI Development Team  
**Proyecto**: YSI Catalyst - RAGFlow Integration  

---

## 📋 **Resumen Ejecutivo**

Esta guía documenta la integración completa de RAGFlow con YSI Backend, proporcionando endpoints API para gestión de Knowledge Bases, upload de documentos, y consultas RAG (Retrieval Augmented Generation).

### **Capacidades Principales**
- 🏗️ **Knowledge Base Management**: CRUD completo con permisos granulares
- 📄 **Document Upload**: Individual y masivo con validación completa
- 🔍 **RAG Queries**: Search, Chat, y Agent con IA avanzada
- 🔒 **Access Control**: Permisos granulares por usuario y recurso
- 📊 **Analytics**: Métricas de uso y performance completas

---

## 🔧 **Configuración**

### **Variables de Entorno**
```bash
# RAGFlow Configuration
RAGFLOW_API_URL=http://localhost:9380
RAGFLOW_WEB_URL=http://localhost:9381
RAGFLOW_API_TOKEN=ragflow-ab5579c6-6728-45b6-9b1c-151375258e43
RAGFLOW_TENANT_ID=e5a98b6495d011f098bd7a5d01274a94
RAGFLOW_ENABLED=true

# RAGFlow Advanced Settings
RAGFLOW_TIMEOUT=30
RAGFLOW_MAX_RETRIES=3
RAGFLOW_CHUNK_SIZE=512
RAGFLOW_OVERLAP=50
```

### **Base URL**
```
http://localhost:8000/api/v1/ragflow
```

### **Autenticación**
Todos los endpoints requieren autenticación JWT:
```bash
Authorization: Bearer <jwt_token>
```

---

## 🏗️ **Knowledge Base Management**

### **Crear Knowledge Base**
```bash
POST /ragflow/knowledge-bases/

# Request Body:
{
    "name": "Mi Knowledge Base",
    "description": "Descripción opcional",
    "language": "English",
    "chunk_method": "naive",
    "organization_id": 1
}

# Response:
{
    "id": 1,
    "ragflow_kb_id": "kb-12345",
    "name": "Mi Knowledge Base",
    "status": "active",
    "created_at": "2025-09-24T10:00:00Z",
    "created_by_user_id": 1
}
```

### **Listar Knowledge Bases**
```bash
GET /ragflow/knowledge-bases/?limit=50&offset=0&accessible_only=true

# Response:
{
    "knowledge_bases": [
        {
            "id": 1,
            "ragflow_kb_id": "kb-12345",
            "name": "Mi Knowledge Base",
            "status": "active",
            "created_at": "2025-09-24T10:00:00Z"
        }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
}
```

### **Obtener Knowledge Base Específico**
```bash
GET /ragflow/knowledge-bases/{kb_id}

# Response: Detalles completos del KB
```

### **Actualizar Knowledge Base**
```bash
PUT /ragflow/knowledge-bases/{kb_id}

# Request Body:
{
    "name": "Nuevo nombre",
    "description": "Nueva descripción"
}
```

### **Eliminar Knowledge Base**
```bash
DELETE /ragflow/knowledge-bases/{kb_id}?hard_delete=false

# Soft delete por defecto, hard_delete=true para eliminación permanente
```

### **Estadísticas de Knowledge Base**
```bash
GET /ragflow/knowledge-bases/{kb_id}/stats

# Response:
{
    "ragflow_kb_id": "kb-12345",
    "document_count": 5,
    "total_size_bytes": 1048576,
    "total_chunks": 150,
    "total_tokens": 25000,
    "processing_status": {
        "success": 4,
        "processing": 1
    },
    "file_types": {
        "pdf": 2,
        "txt": 2,
        "docx": 1
    }
}
```

---

## 📄 **Document Management**

### **Upload Documento Individual**
```bash
POST /ragflow/documents/{kb_id}/upload

# Multipart form data:
curl -H "Authorization: Bearer $TOKEN" \
     -F "file=@documento.pdf" \
     -F "custom_name=Mi Documento" \
     -F "chunk_method=naive" \
     "http://localhost:8000/api/v1/ragflow/documents/{kb_id}/upload"

# Response:
{
    "id": 1,
    "ragflow_doc_id": "doc-67890",
    "name": "Mi Documento",
    "file_type": "pdf",
    "file_size": 1048576,
    "status": "uploading",
    "progress": 0
}
```

### **Upload Masivo**
```bash
POST /ragflow/documents/{kb_id}/bulk-upload

# Múltiples archivos:
curl -H "Authorization: Bearer $TOKEN" \
     -F "files=@doc1.pdf" \
     -F "files=@doc2.txt" \
     -F "files=@doc3.docx" \
     "http://localhost:8000/api/v1/ragflow/documents/{kb_id}/bulk-upload"

# Response:
{
    "successful_uploads": [...],
    "failed_uploads": [...],
    "total_files": 3,
    "successful_count": 2,
    "failed_count": 1
}
```

### **Listar Documentos**
```bash
GET /ragflow/documents/{kb_id}/documents?limit=20&status=success&uploaded_by_me=false

# Response:
{
    "documents": [
        {
            "id": 1,
            "ragflow_doc_id": "doc-67890",
            "name": "Mi Documento",
            "status": "success",
            "progress": 100,
            "chunk_count": 25,
            "token_count": 5000
        }
    ],
    "total": 1
}
```

### **Estado de Documento**
```bash
GET /ragflow/documents/document/{doc_id}

# Response: Detalles completos del documento
```

### **Sincronizar Estado**
```bash
POST /ragflow/documents/document/{doc_id}/sync

# Sincroniza estado con RAGFlow
```

### **Obtener Chunks**
```bash
GET /ragflow/documents/document/{doc_id}/chunks

# Response:
{
    "document_id": "doc-67890",
    "chunks": [
        {
            "chunk_id": "chunk-1",
            "content": "Contenido del chunk...",
            "metadata": {...}
        }
    ],
    "total_chunks": 25
}
```

### **Eliminar Documento**
```bash
DELETE /ragflow/documents/document/{doc_id}?hard_delete=false

# Soft delete por defecto
```

---

## 🤖 **RAG Queries**

### **Búsqueda Semántica**
```bash
POST /ragflow/queries/{kb_id}/search

# Request Body:
{
    "query_text": "¿Cuáles son las características principales?",
    "top_k": 5,
    "similarity_threshold": 0.7,
    "rerank": true,
    "session_id": 123
}

# Response:
{
    "id": 1,
    "query_type": "search",
    "response_text": "Las características principales son...",
    "response_chunks": [
        {
            "content": "Chunk relevante...",
            "similarity_score": 0.95
        }
    ],
    "response_time_ms": 850,
    "status": "success",
    "tokens_used": 150
}
```

### **Chat Conversacional**
```bash
POST /ragflow/queries/{kb_id}/chat

# Request Body:
{
    "query_text": "Hola, ¿puedes explicarme sobre este documento?",
    "conversation_id": "conv-12345",  # Opcional para continuidad
    "temperature": 0.7,
    "max_tokens": 500,
    "stream": false
}

# Response:
{
    "id": 2,
    "query_type": "chat",
    "response_text": "¡Hola! Basándome en el documento...",
    "ragflow_conversation_id": "conv-12345",
    "ragflow_message_id": "msg-67890",
    "status": "success",
    "tokens_used": 320
}
```

### **Consulta con Agente AI**
```bash
POST /ragflow/queries/{kb_id}/agent

# Request Body:
{
    "query_text": "Analiza este documento y proporciona un resumen ejecutivo con insights clave",
    "agent_type": "default",
    "reasoning_steps": true,
    "include_sources": true
}

# Response:
{
    "id": 3,
    "query_type": "agent",
    "response_text": "Análisis completo:\n\n1. Resumen ejecutivo...",
    "response_chunks": [
        {
            "reasoning_step": "Análisis inicial...",
            "sources": [...]
        }
    ],
    "status": "success",
    "tokens_used": 1200
}
```

---

## 📊 **Analytics y Historial**

### **Historial de Consultas**
```bash
GET /ragflow/queries/history?limit=50&kb_id={kb_id}&query_type=search&my_queries_only=true

# Response:
{
    "queries": [...],
    "total": 25,
    "limit": 50,
    "offset": 0
}
```

### **Historial de Conversación**
```bash
GET /ragflow/queries/conversation/{conversation_id}

# Response:
{
    "conversation_id": "conv-12345",
    "messages": [...],
    "total_messages": 5
}
```

### **Analytics Personales**
```bash
GET /ragflow/queries/my-analytics?start_date=2025-09-01&end_date=2025-09-24

# Response:
{
    "total_queries": 50,
    "by_type": {
        "search": 20,
        "chat": 25,
        "agent": 5
    },
    "by_status": {
        "success": 48,
        "error": 2
    },
    "avg_response_time_ms": 1250,
    "total_tokens_used": 15000,
    "successful_queries": 48,
    "failed_queries": 2,
    "unique_users": 1,
    "query_trends": {
        "2025-09-24": 15,
        "2025-09-23": 20
    }
}
```

### **Analytics por Knowledge Base**
```bash
GET /ragflow/queries/{kb_id}/analytics

# Analytics específicos de un KB
```

---

## 🔒 **Permission Management**

### **Otorgar Permisos**
```bash
POST /ragflow/knowledge-bases/{kb_id}/permissions

# Request Body:
{
    "user_id": 2,
    "can_read": true,
    "can_query": true,
    "can_upload": false,
    "can_edit": false,
    "can_delete": false,
    "can_admin": false,
    "expires_at": "2025-12-31T23:59:59Z"
}

# Response: Detalles del permiso otorgado
```

### **Listar Permisos**
```bash
GET /ragflow/knowledge-bases/{kb_id}/permissions

# Response:
{
    "permissions": [
        {
            "user_id": 1,
            "can_read": true,
            "can_query": true,
            "can_upload": true,
            "can_edit": true,
            "can_delete": true,
            "can_admin": true,
            "granted_at": "2025-09-24T10:00:00Z"
        }
    ],
    "total": 1
}
```

### **Revocar Permisos**
```bash
DELETE /ragflow/knowledge-bases/{kb_id}/permissions/{user_id}

# Revoca todos los permisos del usuario para el KB
```

---

## 🏥 **Health Checks y Monitoreo**

### **Health Check General**
```bash
GET /ragflow/health

# Response:
{
    "status": "healthy",
    "ragflow_url": "http://localhost:9380",
    "tenant_id": "e5a98b6495d011f098bd7a5d01274a94",
    "response": {...}
}
```

### **Estado del Sistema**
```bash
GET /ragflow/status  # Requiere admin

# Response:
{
    "ragflow_service": "healthy",
    "database": "healthy",
    "api_endpoints": "healthy",
    "last_check": "2025-09-24T15:30:00Z"
}
```

### **Información del Sistema**
```bash
GET /ragflow/info

# Response:
{
    "integration_version": "1.0.0",
    "ragflow_url": "http://localhost:9380",
    "tenant_id": "e5a98b6495d011f098bd7a5d01274a94",
    "supported_features": {
        "knowledge_bases": true,
        "document_upload": true,
        "search_queries": true,
        "chat_queries": true,
        "agent_queries": true,
        "permissions": true,
        "analytics": true
    },
    "supported_file_types": [
        "pdf", "txt", "docx", "doc", "md", 
        "csv", "json", "xlsx", "xls"
    ],
    "max_file_size_mb": 50,
    "current_user": {
        "id": 1,
        "email": "user@example.com",
        "role": "admin"
    }
}
```

---

## 🔄 **Flujos de Trabajo Típicos**

### **Flujo 1: Setup Inicial**
```bash
# 1. Verificar salud del sistema
curl -H "Authorization: Bearer $TOKEN" \
     "$BASE_URL/ragflow/health"

# 2. Crear Knowledge Base
curl -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "Mi KB", "description": "Descripción"}' \
     "$BASE_URL/ragflow/knowledge-bases/"

# 3. Verificar creación
curl -H "Authorization: Bearer $TOKEN" \
     "$BASE_URL/ragflow/knowledge-bases/"
```

### **Flujo 2: Upload y Procesamiento**
```bash
# 1. Upload documento
curl -H "Authorization: Bearer $TOKEN" \
     -F "file=@documento.pdf" \
     "$BASE_URL/ragflow/documents/{kb_id}/upload"

# 2. Verificar estado de procesamiento
curl -H "Authorization: Bearer $TOKEN" \
     "$BASE_URL/ragflow/documents/document/{doc_id}"

# 3. Listar documentos procesados
curl -H "Authorization: Bearer $TOKEN" \
     "$BASE_URL/ragflow/documents/{kb_id}/documents?status=success"
```

### **Flujo 3: Consultas RAG**
```bash
# 1. Búsqueda semántica
curl -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"query_text": "¿Qué información contiene?", "top_k": 5}' \
     "$BASE_URL/ragflow/queries/{kb_id}/search"

# 2. Chat conversacional
curl -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"query_text": "Explícame el contenido principal"}' \
     "$BASE_URL/ragflow/queries/{kb_id}/chat"

# 3. Análisis con agente
curl -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"query_text": "Analiza y resume los puntos clave"}' \
     "$BASE_URL/ragflow/queries/{kb_id}/agent"
```

### **Flujo 4: Gestión de Permisos**
```bash
# 1. Listar permisos actuales
curl -H "Authorization: Bearer $TOKEN" \
     "$BASE_URL/ragflow/knowledge-bases/{kb_id}/permissions"

# 2. Otorgar permisos a usuario
curl -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"user_id": 2, "can_read": true, "can_query": true}' \
     "$BASE_URL/ragflow/knowledge-bases/{kb_id}/permissions"

# 3. Revocar permisos
curl -H "Authorization: Bearer $TOKEN" \
     -X DELETE \
     "$BASE_URL/ragflow/knowledge-bases/{kb_id}/permissions/{user_id}"
```

---

## 📊 **Códigos de Estado HTTP**

| Código | Significado | Uso |
|--------|-------------|-----|
| **200** | OK | Operación exitosa |
| **201** | Created | Recurso creado exitosamente |
| **204** | No Content | Eliminación exitosa |
| **400** | Bad Request | Datos de entrada inválidos |
| **401** | Unauthorized | Token JWT faltante o inválido |
| **403** | Forbidden | Permisos insuficientes |
| **404** | Not Found | Recurso no encontrado |
| **422** | Unprocessable Entity | Validación de datos falló |
| **500** | Internal Server Error | Error del servidor |

---

## 🚨 **Manejo de Errores**

### **Estructura de Error Estándar**
```json
{
    "error": "ValidationError",
    "message": "Query text cannot be empty",
    "details": {
        "field": "query_text",
        "provided_value": "",
        "expected": "non-empty string"
    }
}
```

### **Errores Comunes**

#### **Authentication Errors**
```bash
# 401 Unauthorized
{
    "detail": "Not authenticated"
}

# 403 Forbidden  
{
    "detail": "Insufficient permissions to access this Knowledge Base"
}
```

#### **Validation Errors**
```bash
# 400 Bad Request
{
    "detail": "Validation error: Query text cannot be empty"
}

# 422 Unprocessable Entity
{
    "detail": [
        {
            "loc": ["body", "query_text"],
            "msg": "field required",
            "type": "value_error.missing"
        }
    ]
}
```

#### **RAGFlow Service Errors**
```bash
# 500 Internal Server Error
{
    "detail": "RAGFlow service error: Connection timeout"
}
```

---

## 🎯 **Mejores Prácticas**

### **Performance**
1. **Paginación**: Usar `limit` y `offset` para grandes datasets
2. **Filtros**: Aplicar filtros específicos para reducir carga
3. **Timeouts**: Configurar timeouts apropiados para operaciones largas
4. **Retry Logic**: Implementar retry para operaciones críticas

### **Seguridad**
1. **JWT Tokens**: Renovar tokens antes de expiración
2. **Permisos**: Aplicar principio de menor privilegio
3. **Validación**: Validar todos los inputs del usuario
4. **Audit**: Revisar logs de acceso regularmente

### **Monitoreo**
1. **Health Checks**: Verificar estado del sistema regularmente
2. **Analytics**: Monitorear uso y performance
3. **Error Tracking**: Configurar alertas para errores
4. **Resource Usage**: Monitorear tokens y costos

---

## 🧪 **Testing**

### **Test Suite Automatizado**
```bash
cd /Users/carlos/Documents/YSI/ysi-backend/tests/ragflow_tests

# Ejecutar todos los tests
./run_all_tests.sh

# Ejecutar test específico
./01_health_check.sh
./02_authentication.sh
./03_knowledge_base.sh
# ... etc
```

### **Tests Manuales con cURL**
Consultar ejemplos en cada sección de este documento.

---

## 🔧 **Troubleshooting**

### **Problemas Comunes**

#### **RAGFlow No Responde**
```bash
# Verificar servicios RAGFlow
cd /Users/carlos/Documents/YSI/RAG/docker
docker-compose -f docker-compose-macos.yml ps
docker-compose -f docker-compose-macos.yml logs ragflow-server
```

#### **Token JWT Inválido**
```bash
# Obtener nuevo token
curl -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "password"}' \
     "http://localhost:8000/api/v1/auth/login"
```

#### **Documentos No Se Procesan**
```bash
# Verificar estado de procesamiento
curl -H "Authorization: Bearer $TOKEN" \
     "$BASE_URL/ragflow/documents/document/{doc_id}"

# Verificar logs RAGFlow
docker logs ragflow-server
```

#### **Queries Sin Resultados**
```bash
# Verificar que documentos estén procesados
curl -H "Authorization: Bearer $TOKEN" \
     "$BASE_URL/ragflow/documents/{kb_id}/documents?status=success"

# Verificar estadísticas de KB
curl -H "Authorization: Bearer $TOKEN" \
     "$BASE_URL/ragflow/knowledge-bases/{kb_id}/stats"
```

---

## 📞 **Soporte**

### **Logs y Debugging**
- **YSI Backend logs**: Consola de uvicorn
- **RAGFlow logs**: `docker logs ragflow-server`
- **Test logs**: `/tmp/ragflow_test_reports/`

### **Configuración**
- **YSI Backend**: `/Users/carlos/Documents/YSI/ysi-backend/.env`
- **RAGFlow**: `/Users/carlos/Documents/YSI/RAG/docker/.env`

### **Documentación Adicional**
- **Roadmap**: `/Users/carlos/Documents/YSI/ysi-backend/docs/YSI_RAGFLOW_INTEGRATION_ROADMAP.md`
- **Tenant Strategy**: `/Users/carlos/Documents/YSI/RAG/carlos/docs/YSI_TENANT_STRATEGY.md`
- **RAGFlow Docs**: `/Users/carlos/Documents/YSI/RAG/docs/`

---

**Última actualización**: 2025-09-24  
**Versión API**: 1.0.0  
**Compatibilidad**: YSI Backend v1.0 + RAGFlow latest
