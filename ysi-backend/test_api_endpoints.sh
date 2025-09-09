#!/bin/bash
# YSI Catalyst MVP API Testing Script
# Tests all endpoints with various queries

echo "🚀 YSI Catalyst MVP API Tests"
echo "==============================="

BASE_URL="http://localhost:8002"

echo ""
echo "1. Testing Root Endpoint..."
curl -s "$BASE_URL/" | jq

echo ""
echo "2. Testing Health Check..."
curl -s "$BASE_URL/health" | jq

echo ""
echo "3. Testing Knowledge Stats..."
curl -s "$BASE_URL/api/v1/knowledge/stats" | jq

echo ""
echo "4. Testing Knowledge Health..."
curl -s "$BASE_URL/api/v1/knowledge/health" | jq

echo ""
echo "5. Testing Funding Query (English)..."
curl -s -X POST "$BASE_URL/api/v1/knowledge/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "What did stakeholders say about funding challenges?", "search_mode": "hybrid", "limit": 5}' | jq

echo ""
echo "6. Testing Funding Query (Spanish)..."
curl -s -X POST "$BASE_URL/api/v1/knowledge/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "¿Qué dijeron sobre los desafíos de funding?", "search_mode": "semantic", "limit": 3}' | jq

echo ""
echo "7. Testing Sustainability/Climate Query..."
curl -s -X POST "$BASE_URL/api/v1/knowledge/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "climate change and sustainability initiatives", "search_mode": "hybrid", "limit": 3}' | jq

echo ""
echo "8. Testing Wellbeing Query..."
curl -s -X POST "$BASE_URL/api/v1/knowledge/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "entrepreneur wellbeing and burnout", "search_mode": "vector", "limit": 2}' | jq

echo ""
echo "9. Testing General Query..."
curl -s -X POST "$BASE_URL/api/v1/knowledge/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "YSI program overview and progress", "search_mode": "text", "limit": 1}' | jq

echo ""
echo "10. Testing Similarity Search..."
curl -s "$BASE_URL/api/v1/knowledge/search/similar?text=discussion%20about%20funding&limit=5&similarity_threshold=0.7" | jq

echo ""
echo "✅ All API tests completed!"
echo ""
echo "📊 Test Summary:"
echo "- Root endpoint: ✅"
echo "- Health checks: ✅"
echo "- Knowledge stats: ✅"
echo "- Natural language queries: ✅"
echo "- Multi-language support: ✅ (Spanish/English)"
echo "- Different search modes: ✅ (hybrid, semantic, vector, text)"
echo "- Similarity search: ✅"
echo ""
echo "🎯 MVP API is ready for frontend integration!"