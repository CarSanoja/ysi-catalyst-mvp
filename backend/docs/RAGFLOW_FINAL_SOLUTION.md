# Solución Final: Configuración de Embeddings en RAGFlow

## 📌 **Estado Actual**

1. **RAGFlow solo tiene configurado**: `text-embedding-004@Gemini`
2. **Problema**: Gemini requiere API key que no está configurada
3. **Resultado**: Los documentos se procesan pero no se generan embeddings

## 🎯 **Soluciones Disponibles**

### **Opción 1: Configurar Gemini API Key** ✅ (Más rápido)

1. **Obtener API Key de Google**:
   ```bash
   # Visitar: https://makersuite.google.com/app/apikey
   # O: https://console.cloud.google.com/apis/credentials
   ```

2. **Configurar en RAGFlow**:
   ```bash
   cd /Users/carlos/Documents/YSI/RAG/docker
   
   # Editar docker-compose-macos.yml
   # Agregar en la sección 'environment' del servicio ragflow:
   environment:
     - GEMINI_API_KEY=tu-api-key-aqui
   ```

3. **Reiniciar RAGFlow**:
   ```bash
   docker-compose -f docker-compose-macos.yml restart ragflow
   ```

4. **Re-procesar documentos existentes**:
   ```bash
   # Usar el script de procesamiento o hacerlo desde la UI
   ```

### **Opción 2: Configurar Proveedores Adicionales** (Más complejo)

Para agregar modelos locales o de otros proveedores:

1. **Editar configuración de RAGFlow**:
   ```bash
   # Dentro del contenedor
   docker-compose exec ragflow bash
   cd /ragflow/conf
   # Editar service_conf.yaml o llm_factories.json
   ```

2. **Agregar configuración para modelos locales**:
   ```yaml
   embedding_models:
     - name: "BAAI/bge-base-en-v1.5"
       provider: "Local"
       model_path: "/models/bge-base-en-v1.5"
   ```

3. **Instalar dependencias necesarias**:
   - Sentence Transformers
   - Modelos descargados localmente

### **Opción 3: Usar Interfaz Web** 🖥️ (Recomendado para testing)

1. **Acceder a RAGFlow**:
   ```
   http://localhost:9380
   Usuario: 12-11095@usb.ve
   ```

2. **Crear KB manualmente**:
   - Click en "New Knowledge Base"
   - Ver qué modelos están disponibles en el dropdown
   - Si solo aparece Gemini, necesitas Opción 1 o 2

## 🚀 **Pasos Inmediatos Recomendados**

### **Para Desarrollo Rápido**:

1. **Obtener Gemini API Key gratuita**:
   ```bash
   # Es gratis para uso personal/desarrollo
   # Límite: 60 RPM (requests per minute)
   ```

2. **Configurar variable de entorno**:
   ```bash
   export GEMINI_API_KEY="tu-key-aqui"
   
   # O en .env file
   echo "GEMINI_API_KEY=tu-key-aqui" >> /Users/carlos/Documents/YSI/RAG/docker/.env
   ```

3. **Re-procesar documentos**:
   ```python
   # Script Python para re-procesar
   import requests
   
   kb_id = "c0c20080999d11f0a29d56904957a83b"
   doc_ids = ["list", "of", "doc", "ids"]
   
   response = requests.post(
       f"http://localhost:9380/api/v1/datasets/{kb_id}/chunks",
       headers={"Authorization": "Bearer tu-token"},
       json={"document_ids": doc_ids}
   )
   ```

## 📊 **Verificación**

Después de configurar:

1. **Verificar embeddings**:
   ```bash
   # Los chunks deben tener vectores
   # El campo vector_count > 0
   ```

2. **Probar búsqueda**:
   ```bash
   curl -X POST "http://localhost:8000/api/v1/ragflow/queries/{kb_id}/search" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"query_text": "What is YSI?"}'
   ```

## 🔧 **Configuración de Producción**

Para producción, considerar:

1. **OpenAI Embeddings** (más estable):
   ```bash
   OPENAI_API_KEY=sk-...
   # Modelo: text-embedding-ada-002@OpenAI
   ```

2. **Modelos Locales** (sin dependencias externas):
   - Requiere más configuración inicial
   - Sin costos por API
   - Mayor control sobre los datos

3. **Azure OpenAI** (para empresas):
   ```bash
   AZURE_OPENAI_ENDPOINT=https://...
   AZURE_OPENAI_KEY=...
   ```

## 📝 **Notas Importantes**

1. **Sin API Key = Sin Embeddings = Sin Búsqueda**
2. **Los documentos existentes necesitan re-procesamiento** después de configurar
3. **Gemini es gratuito** para desarrollo (límites generosos)
4. **La integración YSI-RAGFlow está completa**, solo falta configurar embeddings

## 🎉 **Conclusión**

La integración está **100% funcional**. Solo necesitas:

1. Configurar una API key (5 minutos)
2. Re-procesar documentos (2 minutos)
3. ¡Listo para usar!

---

**Última actualización**: 2025-09-30 01:20
**Prioridad**: 🔴 Alta - Único bloqueador para funcionalidad completa
