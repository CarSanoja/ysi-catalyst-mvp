# RAGFlow Search Troubleshooting Guide

## 🔍 **Problema: Búsquedas No Devuelven Resultados**

### **Síntomas**
- Documentos subidos y procesados correctamente
- Estado de documentos: `success`
- Chunks creados (5 chunks total en KB)
- Tokens contados (546 tokens total)
- Búsquedas siempre devuelven: "Sorry! No relevant content was found in the knowledge base!"

### **Configuración Actual**
```json
{
  "embedding_model": "text-embedding-004@Gemini",
  "similarity_threshold": 0.2,
  "vector_similarity_weight": 0.3,
  "chunk_token_num": 512,
  "delimiter": "\\n",
  "layout_recognize": "DeepDOC"
}
```

### **Diagnósticos Realizados**

1. **Verificación de Documentos** ✅
   - Documentos tienen estado `DONE` en RAGFlow
   - Chunks creados correctamente
   - Tokens contados

2. **Pruebas de Búsqueda**
   - Búsqueda via YSI Backend API ❌
   - Búsqueda directa en RAGFlow API ❌
   - Diferentes queries probadas:
     - "What is YSI?" ❌
     - "Youth Startup Initiative" ❌
     - "mentorship programs" ❌
     - "YSI services mentorship funding" ❌

3. **Verificación de Servicios**
   - Elasticsearch: Running (healthy)
   - RAGFlow Server: Running
   - No errores en logs

### **Posibles Causas**

1. **Modelo de Embeddings No Configurado**
   - Gemini API key no configurada
   - Modelo no disponible/activo
   - Error silencioso en generación de embeddings

2. **Problema de Indexación**
   - Documentos procesados pero no indexados
   - Índice de Elasticsearch corrupto o vacío
   - Mismatch entre embedding model para indexar vs buscar

3. **Configuración de Búsqueda**
   - `similarity_threshold` muy restrictivo (aunque 0.2 es bajo)
   - `vector_similarity_weight` inadecuado

### **Soluciones Propuestas**

#### 1. **Verificar API Key de Gemini**
```bash
# En el contenedor RAGFlow
docker-compose exec ragflow env | grep -i gemini
docker-compose exec ragflow env | grep -i api_key
```

#### 2. **Cambiar Modelo de Embeddings**
Considerar usar un modelo local o diferente:
- BAAI/bge-large-zh-v1.5
- OpenAI text-embedding-ada-002
- Modelo local de Ollama

#### 3. **Re-indexar Documentos**
```bash
# Eliminar y volver a procesar documentos
# O crear un nuevo KB con modelo diferente
```

#### 4. **Verificar Elasticsearch**
```bash
# Verificar índices
curl -X GET "localhost:9200/_cat/indices?v"

# Buscar documentos en el índice
curl -X GET "localhost:9200/ragflow*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match_all": {}
  },
  "size": 1
}'
```

#### 5. **Usar Modelo de Embeddings Local**
En lugar de Gemini, configurar un modelo que no requiera API externa:
1. Modificar configuración del KB
2. Usar modelo de Sentence Transformers
3. Re-procesar documentos

### **Configuración Alternativa Recomendada**

```json
{
  "embedding_model": "BAAI/bge-large-zh-v1.5",
  "similarity_threshold": 0.1,
  "vector_similarity_weight": 0.7,
  "chunk_token_num": 256,
  "delimiter": "\\n\\n"
}
```

### **Pasos para Resolución**

1. **Verificar configuración de Gemini**
   ```bash
   # Buscar en archivos de configuración
   grep -r "GEMINI" /ragflow/
   grep -r "API_KEY" /ragflow/
   ```

2. **Crear nuevo KB con modelo diferente**
   - Usar interfaz web de RAGFlow
   - Seleccionar modelo de embeddings local
   - Re-subir documentos

3. **Monitorear logs durante procesamiento**
   ```bash
   docker-compose logs -f ragflow | grep -E "(embedding|vector|index)"
   ```

### **Workaround Temporal**

Mientras se resuelve el problema de embeddings:
1. Usar RAGFlow solo para almacenamiento de documentos
2. Implementar búsqueda basada en keywords en el backend
3. Usar full-text search de PostgreSQL como fallback

### **Referencias**
- [RAGFlow Embedding Models](https://docs.ragflow.io/docs/dev/configurations#embedding-models)
- [Elasticsearch Vector Search](https://www.elastic.co/guide/en/elasticsearch/reference/current/knn-search.html)
- [Gemini API Setup](https://ai.google.dev/tutorials/setup)

---

**Última actualización**: 2025-09-25 22:35
**Estado**: 🔴 Pendiente de resolución
