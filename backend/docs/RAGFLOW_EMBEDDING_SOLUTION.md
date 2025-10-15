# Solución: Configurar Modelo de Embeddings en RAGFlow

## 🎯 **Problema Identificado**

El modelo de embeddings `text-embedding-004@Gemini` está configurado en el Knowledge Base pero **no tiene API key configurada**, por lo que:
- Los documentos se procesan y crean chunks
- NO se generan vectores de embeddings
- Las búsquedas no encuentran resultados porque no hay vectores para comparar

## 🔧 **Soluciones**

### **Opción 1: Configurar Gemini API Key** (Requiere cuenta Google Cloud)

1. Obtener API key de Google Cloud:
   ```bash
   # Visitar: https://console.cloud.google.com/apis/credentials
   # Crear API key para Gemini API
   ```

2. Configurar en RAGFlow:
   ```bash
   # Editar docker-compose-macos.yml
   environment:
     - GOOGLE_API_KEY=your-api-key-here
     - GEMINI_API_KEY=your-api-key-here
   ```

3. Reiniciar RAGFlow:
   ```bash
   docker-compose -f docker-compose-macos.yml restart ragflow
   ```

### **Opción 2: Usar Modelo Local** (Recomendado) ✅

1. Acceder a la interfaz web de RAGFlow:
   ```
   http://localhost:9380
   Usuario: 12-11095@usb.ve
   Password: [tu password]
   ```

2. Crear nuevo Knowledge Base con configuración:
   - **Name**: YSI Local Embeddings KB
   - **Embedding Model**: `BAAI/bge-large-en-v1.5` (o cualquier modelo local disponible)
   - **Chunk Method**: Naive
   - **Chunk Size**: 512

3. Re-subir documentos al nuevo KB

4. Actualizar el KB ID en las pruebas

### **Opción 3: Usar OpenAI Embeddings** (Requiere API key de OpenAI)

Similar a Opción 1 pero con:
```bash
environment:
  - OPENAI_API_KEY=your-openai-api-key
```

Y seleccionar modelo: `text-embedding-ada-002@OpenAI`

## 📝 **Pasos Inmediatos**

1. **Verificar modelos disponibles en RAGFlow**:
   ```bash
   # En la interfaz web, al crear KB ver dropdown de "Embedding Model"
   ```

2. **Crear nuevo KB con modelo local**:
   - Los modelos que terminan en `@Local` no requieren API key
   - Ejemplos: `bge-large-zh-v1.5@Local`, `bge-base-en-v1.5@Local`

3. **Migrar datos**:
   ```python
   # Script para re-subir documentos al nuevo KB
   new_kb_id = "nuevo-kb-id-aqui"
   # Re-usar los scripts de upload existentes
   ```

## 🚀 **Script de Migración Rápida**

```bash
#!/bin/bash
# migrate_to_local_embeddings.sh

# 1. Crear nuevo KB via API
NEW_KB_RESPONSE=$(curl -X POST "http://localhost:9380/api/v1/datasets" \
  -H "Authorization: Bearer ragflow-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "YSI Local Embeddings KB",
    "description": "KB with local embedding model",
    "embedding_model": "BAAI/bge-base-en-v1.5",
    "chunk_method": "naive"
  }')

NEW_KB_ID=$(echo $NEW_KB_RESPONSE | jq -r '.data.id')

# 2. Re-subir documentos
for file in *.txt; do
  curl -X POST "http://localhost:9380/api/v1/datasets/$NEW_KB_ID/documents" \
    -H "Authorization: Bearer ragflow-token" \
    -F "file=@$file"
done

# 3. Procesar documentos
# ... (usar endpoint de chunks)
```

## ✅ **Verificación**

Después de implementar la solución:

1. Los documentos deben mostrar progreso de embeddings
2. Las búsquedas deben devolver resultados relevantes
3. El campo `vector_count` debe ser > 0 en los chunks

## 📚 **Referencias**

- [RAGFlow Embedding Models Docs](https://github.com/infiniflow/ragflow/blob/main/docs/embeddings.md)
- [Local Models Setup](https://github.com/infiniflow/ragflow/blob/main/docs/local-models.md)
- [Gemini API Setup](https://ai.google.dev/gemini-api/docs/get-started/tutorial)

---

**Última actualización**: 2025-09-25 22:40
**Prioridad**: 🔴 Alta - Bloqueador para funcionalidad de búsqueda
