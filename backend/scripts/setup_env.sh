#!/bin/bash

# YSI Backend Environment Setup Script
# Automatically configures environment variables for RAGFlow integration

set -e

# Configuration
BACKEND_DIR="/Users/carlos/Documents/YSI/ysi-backend"
RAGFLOW_CONFIG="/Users/carlos/Documents/YSI/RAG/carlos/docs/scripts/ragflow_config.env"
ENV_FILE="$BACKEND_DIR/.env"

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

# Check if RAGFlow config exists
check_ragflow_config() {
    if [ -f "$RAGFLOW_CONFIG" ]; then
        log_success "RAGFlow configuration found: $RAGFLOW_CONFIG"
        return 0
    else
        log_error "RAGFlow configuration not found: $RAGFLOW_CONFIG"
        log_info "Please run the RAGFlow setup script first:"
        log_info "  /Users/carlos/Documents/YSI/RAG/carlos/docs/scripts/setup_ragflow_api.sh"
        return 1
    fi
}

# Create .env file
create_env_file() {
    log_info "Creating .env file for YSI Backend..."
    
    # Source RAGFlow config
    source "$RAGFLOW_CONFIG"
    
    cat > "$ENV_FILE" << EOF
# YSI Backend Environment Configuration
# Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)

# Core Application Settings
SECRET_KEY=ysi-secret-key-$(uuidgen | tr '[:upper:]' '[:lower:]' | head -c 16)
DATABASE_URL=postgresql://ysi_user:ysi_password@localhost:5432/ysi_db
REDIS_URL=redis://localhost:6379/0

# OpenAI Configuration (update with your key)
OPENAI_API_KEY=

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

# Development Settings
DEBUG=true
LOG_LEVEL=INFO
EOF
    
    log_success ".env file created: $ENV_FILE"
    return 0
}

# Update existing .env file
update_env_file() {
    log_info "Updating existing .env file..."
    
    # Source RAGFlow config
    source "$RAGFLOW_CONFIG"
    
    # Backup existing .env
    cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%s)"
    log_info "Backup created: $ENV_FILE.backup.$(date +%s)"
    
    # Update RAGFlow variables
    sed -i '' "s|^RAGFLOW_API_URL=.*|RAGFLOW_API_URL=$RAGFLOW_API_URL|" "$ENV_FILE"
    sed -i '' "s|^RAGFLOW_WEB_URL=.*|RAGFLOW_WEB_URL=$RAGFLOW_WEB_URL|" "$ENV_FILE"
    sed -i '' "s|^RAGFLOW_API_TOKEN=.*|RAGFLOW_API_TOKEN=$RAGFLOW_API_TOKEN|" "$ENV_FILE"
    sed -i '' "s|^RAGFLOW_TENANT_ID=.*|RAGFLOW_TENANT_ID=$RAGFLOW_TENANT_ID|" "$ENV_FILE"
    
    # Add missing variables if they don't exist
    if ! grep -q "RAGFLOW_ENABLED" "$ENV_FILE"; then
        echo "RAGFLOW_ENABLED=true" >> "$ENV_FILE"
    fi
    
    if ! grep -q "RAGFLOW_TIMEOUT" "$ENV_FILE"; then
        echo "RAGFLOW_TIMEOUT=30" >> "$ENV_FILE"
    fi
    
    if ! grep -q "RAGFLOW_MAX_RETRIES" "$ENV_FILE"; then
        echo "RAGFLOW_MAX_RETRIES=3" >> "$ENV_FILE"
    fi
    
    if ! grep -q "RAGFLOW_CHUNK_SIZE" "$ENV_FILE"; then
        echo "RAGFLOW_CHUNK_SIZE=512" >> "$ENV_FILE"
    fi
    
    if ! grep -q "RAGFLOW_OVERLAP" "$ENV_FILE"; then
        echo "RAGFLOW_OVERLAP=50" >> "$ENV_FILE"
    fi
    
    log_success ".env file updated successfully"
    return 0
}

# Test configuration
test_configuration() {
    log_info "Testing configuration..."
    
    cd "$BACKEND_DIR"
    
    # Test Python import
    if python3 -c "from app.core.config import settings; print(f'RAGFlow URL: {settings.RAGFLOW_API_URL}'); print(f'RAGFlow Token: {settings.RAGFLOW_API_TOKEN[:20]}...')" 2>/dev/null; then
        log_success "Configuration loaded successfully in Python"
        return 0
    else
        log_error "Failed to load configuration in Python"
        return 1
    fi
}

# Show configuration summary
show_summary() {
    log_info "Configuration Summary:"
    echo ""
    
    if [ -f "$ENV_FILE" ]; then
        echo "📄 Environment File: $ENV_FILE"
        echo "🔗 RAGFlow API URL: $(grep RAGFLOW_API_URL $ENV_FILE | cut -d'=' -f2)"
        echo "🔑 RAGFlow Token: $(grep RAGFLOW_API_TOKEN $ENV_FILE | cut -d'=' -f2 | head -c 20)..."
        echo "🏢 RAGFlow Tenant: $(grep RAGFLOW_TENANT_ID $ENV_FILE | cut -d'=' -f2)"
        echo "✅ RAGFlow Enabled: $(grep RAGFLOW_ENABLED $ENV_FILE | cut -d'=' -f2)"
    fi
    
    echo ""
    log_info "Next steps:"
    echo "1. Update OPENAI_API_KEY in .env file if needed"
    echo "2. Verify database connection settings"
    echo "3. Run YSI Backend: cd $BACKEND_DIR && python -m uvicorn app.main:app --reload"
}

# Main function
main() {
    echo "🔧 YSI Backend Environment Setup"
    echo "================================"
    
    # Check RAGFlow config
    if ! check_ragflow_config; then
        return 1
    fi
    
    # Create or update .env file
    if [ -f "$ENV_FILE" ]; then
        log_warning ".env file already exists"
        read -p "Do you want to update it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            update_env_file
        else
            log_info "Keeping existing .env file"
        fi
    else
        create_env_file
    fi
    
    # Test configuration
    test_configuration
    
    # Show summary
    show_summary
    
    log_success "Environment setup completed!"
    return 0
}

# Run main function
main "$@"
