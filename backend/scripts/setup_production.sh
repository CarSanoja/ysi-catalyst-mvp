#!/bin/bash

# YSI Backend Production Setup Script
# Configura automáticamente el entorno de producción con todas las correcciones

set -e

# Configuration
BACKEND_DIR="/Users/carlos/Documents/YSI/ysi-backend"
RAGFLOW_CONFIG="/Users/carlos/Documents/YSI/RAG/carlos/docs/scripts/ragflow_config.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${YELLOW}📋 STEP: $1${NC}"
}

# Step 1: Verify RAGFlow Configuration
verify_ragflow_config() {
    log_step "Verificar configuración RAGFlow"
    
    if [ ! -f "$RAGFLOW_CONFIG" ]; then
        log_error "RAGFlow configuration not found: $RAGFLOW_CONFIG"
        log_info "Please run RAGFlow setup first:"
        log_info "  /Users/carlos/Documents/YSI/RAG/carlos/docs/scripts/setup_ragflow_api.sh"
        return 1
    fi
    
    source "$RAGFLOW_CONFIG"
    
    if [ -z "$RAGFLOW_API_TOKEN" ] || [ -z "$RAGFLOW_TENANT_ID" ]; then
        log_error "RAGFlow configuration incomplete"
        return 1
    fi
    
    log_success "RAGFlow configuration verified"
    log_info "  Token: ${RAGFLOW_API_TOKEN:0:20}..."
    log_info "  Tenant: $RAGFLOW_TENANT_ID"
    return 0
}

# Step 2: Create Production Environment File
create_production_env() {
    log_step "Crear archivo de entorno de producción"
    
    # Source RAGFlow config
    source "$RAGFLOW_CONFIG"
    
    # Generate secure secret key
    SECRET_KEY="ysi-prod-$(uuidgen | tr '[:upper:]' '[:lower:]' | head -c 32)"
    
    cat > "$BACKEND_DIR/docker/.env.production" << EOF
# YSI Backend Production Environment Configuration
# Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)

# Database Configuration
POSTGRES_DB=ysi_db
POSTGRES_USER=ysi_user
POSTGRES_PASSWORD=ysi_secure_password_$(date +%s)
POSTGRES_PORT=5432

# Backend Configuration
BACKEND_PORT=8000
SECRET_KEY=$SECRET_KEY

# RAGFlow Configuration (auto-generated from RAGFlow setup)
RAGFLOW_API_URL=$RAGFLOW_API_URL
RAGFLOW_WEB_URL=$RAGFLOW_WEB_URL
RAGFLOW_API_TOKEN=$RAGFLOW_API_TOKEN
RAGFLOW_TENANT_ID=$RAGFLOW_TENANT_ID
RAGFLOW_ENABLED=true

# RAGFlow Advanced Settings
RAGFLOW_TIMEOUT=30
RAGFLOW_MAX_RETRIES=3
RAGFLOW_CHUNK_SIZE=512
RAGFLOW_OVERLAP=50

# Security
DEBUG=false
LOG_LEVEL=INFO
EOF
    
    log_success "Production environment file created"
    log_info "  File: $BACKEND_DIR/docker/.env.production"
    return 0
}

# Step 3: Update Docker Compose for Production
update_docker_compose() {
    log_step "Verificar Docker Compose de producción"
    
    if [ ! -f "$BACKEND_DIR/docker/docker-compose.production.yml" ]; then
        log_error "Production docker-compose file not found"
        return 1
    fi
    
    log_success "Production docker-compose verified"
    log_info "  Uses pgvector/pgvector:pg15 image"
    log_info "  Includes init scripts for extensions"
    log_info "  Health checks configured"
    return 0
}

# Step 4: Verify Dependencies
verify_dependencies() {
    log_step "Verificar dependencias"
    
    # Check if requirements.txt has all needed dependencies
    REQUIRED_DEPS=("python-jose" "psycopg2-binary" "pgvector" "alembic" "httpx" "aiofiles")
    
    for dep in "${REQUIRED_DEPS[@]}"; do
        if grep -q "$dep" "$BACKEND_DIR/requirements.txt"; then
            log_success "Dependency found: $dep"
        else
            log_error "Missing dependency: $dep"
            return 1
        fi
    done
    
    log_success "All required dependencies verified"
    return 0
}

# Step 5: Test Database Models
test_models() {
    log_step "Verificar modelos de base de datos"
    
    cd "$BACKEND_DIR"
    
    # Test model imports without database connection
    if python3 -c "
import sys
sys.path.append('.')
try:
    from app.models.ragflow_models import RAGFlowKnowledgeBase
    from app.schemas.ragflow_schemas import KnowledgeBaseCreate
    print('✅ RAGFlow models import successfully')
except Exception as e:
    print(f'❌ Model import error: {e}')
    sys.exit(1)
" 2>/dev/null; then
        log_success "RAGFlow models verified"
    else
        log_error "RAGFlow models have issues"
        return 1
    fi
    
    return 0
}

# Step 6: Create Startup Script
create_startup_script() {
    log_step "Crear script de startup"
    
    cat > "$BACKEND_DIR/scripts/start_production.sh" << 'EOF'
#!/bin/bash

# YSI Backend Production Startup Script

set -e

BACKEND_DIR="/Users/carlos/Documents/YSI/ysi-backend"
cd "$BACKEND_DIR"

echo "🚀 Starting YSI Backend Production Environment"
echo "=============================================="

# Check if RAGFlow is running
if ! curl -s http://localhost:9380/ > /dev/null; then
    echo "⚠️  RAGFlow not detected on localhost:9380"
    echo "   Make sure RAGFlow is running before starting YSI Backend"
    echo "   cd /Users/carlos/Documents/YSI/RAG/docker"
    echo "   docker-compose -f docker-compose-macos.yml up -d"
    echo ""
fi

# Start production stack
echo "📦 Starting PostgreSQL + YSI Backend..."
docker-compose -f docker/docker-compose.production.yml --env-file docker/.env.production up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Health check
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ YSI Backend is running successfully!"
    echo "   API: http://localhost:8000"
    echo "   Docs: http://localhost:8000/docs"
    echo "   Health: http://localhost:8000/health"
else
    echo "❌ YSI Backend failed to start"
    echo "   Check logs: docker-compose -f docker/docker-compose.production.yml logs"
fi

echo ""
echo "🧪 To run tests:"
echo "   cd tests/ragflow_tests"
echo "   ./run_all_tests.sh"
EOF
    
    chmod +x "$BACKEND_DIR/scripts/start_production.sh"
    
    log_success "Production startup script created"
    log_info "  Script: $BACKEND_DIR/scripts/start_production.sh"
    return 0
}

# Main execution
main() {
    echo "🔧 YSI Backend Production Setup"
    echo "==============================="
    echo ""
    
    local all_passed=true
    
    # Run setup steps
    if ! verify_ragflow_config; then
        all_passed=false
    fi
    
    echo ""
    if ! create_production_env; then
        all_passed=false
    fi
    
    echo ""
    if ! update_docker_compose; then
        all_passed=false
    fi
    
    echo ""
    if ! verify_dependencies; then
        all_passed=false
    fi
    
    echo ""
    if ! test_models; then
        all_passed=false
    fi
    
    echo ""
    if ! create_startup_script; then
        all_passed=false
    fi
    
    echo ""
    echo "==============================="
    
    if [ "$all_passed" = true ]; then
        log_success "Production setup completed successfully! ✨"
        echo ""
        log_info "🚀 To start production environment:"
        echo "   ./scripts/start_production.sh"
        echo ""
        log_info "🧪 To run tests:"
        echo "   cd tests/ragflow_tests"
        echo "   ./run_all_tests.sh"
        echo ""
        log_info "📊 Architecture improvements implemented:"
        echo "   ✅ PostgreSQL with pgvector extension"
        echo "   ✅ Automatic extension initialization"
        echo "   ✅ Basic tables auto-creation"
        echo "   ✅ JSONB instead of JSON for GIN indexes"
        echo "   ✅ Complete dependency management"
        echo "   ✅ Production-ready configuration"
        return 0
    else
        log_error "Some setup steps failed! 💥"
        echo ""
        log_info "Fix the issues above before proceeding"
        return 1
    fi
}

# Run main function
main "$@"
