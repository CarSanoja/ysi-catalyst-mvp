#!/bin/bash

# Script para migrar a un modelo de embeddings local
# Autor: YSI Integration Team
# Fecha: 2025-09-25

set -e

# Configuración
RAGFLOW_URL="http://localhost:9380/api/v1"
RAGFLOW_TOKEN="ragflow-ab5579c6-6728-45b6-9b1c-151375258e43"
YSI_BACKEND_URL="http://localhost:8000/api/v1"
USER_EMAIL="12-11095@usb.ve"
USER_PASS="Carlos123"

echo "🚀 Migración a Embeddings Locales para YSI-RAGFlow"
echo "=================================================="

# 1. Login en YSI Backend
echo -e "\n1️⃣ Autenticando en YSI Backend..."
JWT_TOKEN=$(curl -s -X POST -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$USER_EMAIL&password=$USER_PASS" \
  $YSI_BACKEND_URL/auth/login | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

if [ -z "$JWT_TOKEN" ]; then
  echo "❌ Error: No se pudo autenticar"
  exit 1
fi
echo "✅ Autenticación exitosa"

# 2. Crear nuevo KB con modelo local
echo -e "\n2️⃣ Creando nuevo Knowledge Base con embeddings locales..."

# Intentar con diferentes modelos locales comunes
MODELS=("BAAI/bge-base-en-v1.5" "BAAI/bge-small-en-v1.5" "sentence-transformers/all-MiniLM-L6-v2" "text-embedding-ada-002")

for MODEL in "${MODELS[@]}"; do
  echo "   Probando modelo: $MODEL"
  
  KB_RESPONSE=$(curl -s -X POST "$YSI_BACKEND_URL/ragflow/knowledge-bases" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"YSI KB - Local Embeddings\",
      \"description\": \"Knowledge Base with local embedding model for better search\",
      \"language\": \"English\",
      \"embedding_model\": \"$MODEL\",
      \"chunk_method\": \"naive\",
      \"chunk_size\": 512
    }")
  
  # Verificar si fue exitoso
  if echo "$KB_RESPONSE" | grep -q "ragflow_kb_id"; then
    NEW_KB_ID=$(echo "$KB_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['ragflow_kb_id'])")
    echo "✅ KB creado exitosamente con modelo: $MODEL"
    echo "   KB ID: $NEW_KB_ID"
    break
  else
    echo "   ❌ Modelo $MODEL no disponible o error"
  fi
done

if [ -z "$NEW_KB_ID" ]; then
  echo "❌ Error: No se pudo crear el KB con ningún modelo"
  echo "   Intenta crear manualmente desde la interfaz web"
  exit 1
fi

# 3. Subir documentos de prueba
echo -e "\n3️⃣ Subiendo documentos al nuevo KB..."

# Crear documentos de prueba si no existen
cat > /tmp/ysi_info.txt << 'EOF'
YSI (Youth Startup Initiative) Overview
=======================================

What is YSI?
YSI is an innovative program designed to empower young entrepreneurs by providing comprehensive support for their startup journey.

Mission Statement:
To create a sustainable ecosystem where young entrepreneurs aged 18-30 can thrive, innovate, and contribute to economic growth.

Core Services:
1. Mentorship Programs - Connect with experienced entrepreneurs and industry experts
2. Funding Access - Seed funding, grants, and investor connections
3. Business Training - Workshops on business planning, marketing, and finance
4. Networking Events - Demo days, pitch competitions, and community meetups
5. Resource Center - Coworking spaces, legal advice, and technical support

Success Metrics:
- 500+ startups launched
- 2,000+ jobs created
- $50M+ in collective revenue
- 85% survival rate after 2 years

Contact Information:
Email: info@ysi.org
Phone: +1-555-YSI-HELP
Website: www.ysi.org
EOF

cat > /tmp/ysi_faq.txt << 'EOF'
YSI Frequently Asked Questions
==============================

Q: Who can apply to YSI?
A: Young entrepreneurs aged 18-30 with a startup idea or early-stage business.

Q: What types of businesses does YSI support?
A: We support all industries including tech, social enterprises, creative industries, and traditional businesses.

Q: How much funding is available?
A: Seed funding ranges from $5,000 to $50,000 depending on the stage and potential of your startup.

Q: What is the application process?
A: 1) Submit online application 2) Initial screening 3) Pitch presentation 4) Final interview 5) Decision within 2 weeks

Q: Is there any cost to join YSI?
A: No, YSI is completely free for selected entrepreneurs. We take no equity in your business.

Q: How long is the program?
A: The core program is 6 months with ongoing support available for up to 2 years.

Q: Can international entrepreneurs apply?
A: Yes, we accept applications from entrepreneurs worldwide, with programs in multiple countries.
EOF

# Subir documentos
for FILE in /tmp/ysi_*.txt; do
  FILENAME=$(basename "$FILE")
  echo "   Subiendo: $FILENAME"
  
  UPLOAD_RESPONSE=$(curl -s -X POST "$YSI_BACKEND_URL/ragflow/documents/$NEW_KB_ID/upload" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -F "file=@$FILE")
  
  if echo "$UPLOAD_RESPONSE" | grep -q "ragflow_doc_id"; then
    DOC_ID=$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['ragflow_doc_id'])")
    echo "   ✅ Documento subido: $DOC_ID"
    
    # Agregar al array de IDs
    DOC_IDS+=("$DOC_ID")
  else
    echo "   ❌ Error subiendo $FILENAME"
  fi
done

# 4. Procesar documentos
echo -e "\n4️⃣ Procesando documentos..."
if [ ${#DOC_IDS[@]} -gt 0 ]; then
  DOC_IDS_JSON=$(printf '"%s",' "${DOC_IDS[@]}" | sed 's/,$//')
  
  PROCESS_RESPONSE=$(curl -s -X POST "$RAGFLOW_URL/datasets/$NEW_KB_ID/chunks" \
    -H "Authorization: Bearer $RAGFLOW_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"document_ids\": [$DOC_IDS_JSON]}")
  
  echo "✅ Procesamiento iniciado"
  
  # Esperar procesamiento
  echo "⏳ Esperando procesamiento (30 segundos)..."
  sleep 30
else
  echo "❌ No hay documentos para procesar"
fi

# 5. Sincronizar KB
echo -e "\n5️⃣ Sincronizando Knowledge Base..."
SYNC_RESPONSE=$(curl -s -X POST "$YSI_BACKEND_URL/ragflow/knowledge-bases/$NEW_KB_ID/sync" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')

if echo "$SYNC_RESPONSE" | grep -q "chunk_count"; then
  echo "✅ Sincronización completada"
else
  echo "⚠️  Error en sincronización (no crítico)"
fi

# 6. Probar búsqueda
echo -e "\n6️⃣ Probando búsqueda en el nuevo KB..."
SEARCH_RESPONSE=$(curl -s -X POST "$YSI_BACKEND_URL/ragflow/queries/$NEW_KB_ID/search" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query_text": "What is YSI and what services does it provide?"
  }')

echo "Respuesta de búsqueda:"
echo "$SEARCH_RESPONSE" | python3 -m json.tool | grep -E "(response_text|total)" || echo "$SEARCH_RESPONSE"

# 7. Resumen
echo -e "\n📊 RESUMEN DE MIGRACIÓN"
echo "======================="
echo "✅ Nuevo KB ID: $NEW_KB_ID"
echo "✅ Documentos subidos: ${#DOC_IDS[@]}"
echo "✅ Modelo de embeddings: $MODEL"
echo ""
echo "🎯 Próximos pasos:"
echo "1. Actualiza KB_ID en tus pruebas a: $NEW_KB_ID"
echo "2. Verifica que las búsquedas devuelvan resultados"
echo "3. Si aún no funciona, revisa los logs de RAGFlow"
echo ""
echo "💡 Tip: Si las búsquedas siguen sin funcionar, crea el KB manualmente"
echo "   desde la interfaz web en http://localhost:9380"

# Limpiar archivos temporales
rm -f /tmp/ysi_*.txt

echo -e "\n✨ Migración completada!"
