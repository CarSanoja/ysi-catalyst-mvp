#!/bin/bash

# YSI Catalyst Backend Setup Script
# This script sets up the backend application on the EC2 instance

set -e

# Configuration
REPO_URL="https://github.com/CarSanoja/ysi-catalyst-mvp.git"
APP_DIR="/opt/ysi-backend"
SERVICE_NAME="ysi-backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if running as root or with sudo
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root. Some commands will be executed as ec2-user."
        SUDO_USER="ec2-user"
    else
        SUDO_USER=$(whoami)
    fi
}

# Function to install Python dependencies
install_python_deps() {
    print_status "Installing Python and dependencies..."

    # Install Python 3.9 (required for the backend)
    sudo yum install -y python39 python39-pip python39-devel

    # Create symbolic links
    sudo alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1
    sudo alternatives --install /usr/bin/pip3 pip3 /usr/bin/pip3.9 1

    # Upgrade pip
    python3 -m pip install --user --upgrade pip

    print_status "Python setup completed."
}

# Function to clone repository
clone_repository() {
    print_status "Cloning repository..."

    # Remove existing directory if it exists
    if [ -d "$APP_DIR" ]; then
        sudo rm -rf "$APP_DIR"
    fi

    # Create app directory
    sudo mkdir -p "$APP_DIR"
    sudo chown "$SUDO_USER:$SUDO_USER" "$APP_DIR"

    # Clone repository
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"

    print_status "Repository cloned successfully."
}

# Function to setup Python virtual environment
setup_virtualenv() {
    print_status "Setting up Python virtual environment..."

    cd "$APP_DIR/backend"

    # Create virtual environment
    python3 -m venv venv
    source venv/bin/activate

    # Upgrade pip in virtual environment
    pip install --upgrade pip

    # Install requirements
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
    else
        print_warning "requirements.txt not found. Installing basic dependencies..."
        pip install fastapi uvicorn sqlalchemy pymysql python-dotenv pydantic python-multipart
    fi

    print_status "Virtual environment setup completed."
}

# Function to setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."

    cd "$APP_DIR/backend"

    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating template..."
        cat > .env << 'EOF'
# YSI Catalyst Backend Environment Configuration

# Database Configuration
DATABASE_URL=mysql+pymysql://adminysi:WXzpZd71VtlB53vRx5@ysi.cv860emi8n70.us-east-1.rds.amazonaws.com:3306/ysi

# Security
SECRET_KEY=ysi-catalyst-production-secret-key-change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# API Configuration
API_V1_STR=/api/v1

# CORS Origins (for frontend integration)
BACKEND_CORS_ORIGINS=["https://your-vercel-domain.vercel.app","http://localhost:3000"]

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Application Settings
PROJECT_NAME=YSI Catalyst

# RAGFlow Configuration
RAGFLOW_API_URL=http://localhost:9380
RAGFLOW_WEB_URL=http://localhost:9381
RAGFLOW_API_TOKEN=your-ragflow-token
RAGFLOW_TENANT_ID=your-tenant-id
RAGFLOW_ENABLED=false
EOF
        print_warning "Please update the .env file with your actual configuration values."
    fi

    print_status "Environment setup completed."
}

# Function to create systemd service
create_systemd_service() {
    print_status "Creating systemd service..."

    sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null << EOF
[Unit]
Description=YSI Catalyst FastAPI Backend
After=network.target

[Service]
Type=simple
User=$SUDO_USER
WorkingDirectory=$APP_DIR/backend
Environment=PATH=$APP_DIR/backend/venv/bin
ExecStart=$APP_DIR/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8080
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable ${SERVICE_NAME}

    print_status "Systemd service created and enabled."
}

# Function to start services
start_services() {
    print_status "Starting services..."

    # Start backend service
    sudo systemctl start ${SERVICE_NAME}

    # Check service status
    if sudo systemctl is-active --quiet ${SERVICE_NAME}; then
        print_status "Backend service started successfully."
    else
        print_error "Failed to start backend service. Checking logs..."
        sudo journalctl -u ${SERVICE_NAME} --lines=20
        return 1
    fi

    # Restart nginx to ensure it's running
    sudo systemctl restart nginx
    sudo systemctl enable nginx

    print_status "All services started successfully."
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."

    cd "$APP_DIR/backend"
    source venv/bin/activate

    # Check if alembic is installed
    if pip list | grep -q alembic; then
        # Run migrations if alembic is available
        if [ -d "alembic" ]; then
            alembic upgrade head
            print_status "Database migrations completed."
        else
            print_warning "Alembic directory not found. Skipping migrations."
        fi
    else
        print_warning "Alembic not installed. Skipping migrations."
    fi
}

# Function to test the backend
test_backend() {
    print_status "Testing backend..."

    # Wait a moment for the service to start
    sleep 5

    # Test the health endpoint
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        print_status "Backend is responding to health checks."
    else
        print_warning "Backend health check failed. Checking if it's running on port 8080..."
        if curl -f http://localhost:8080 > /dev/null 2>&1; then
            print_status "Backend is running but health endpoint not found."
        else
            print_error "Backend is not responding. Check logs with: sudo journalctl -u ${SERVICE_NAME}"
        fi
    fi
}

# Function to show final status
show_status() {
    echo "=================================================="
    echo "BACKEND SETUP COMPLETED!"
    echo "=================================================="
    echo "Backend directory: $APP_DIR"
    echo "Service name: $SERVICE_NAME"
    echo "Service status: $(sudo systemctl is-active ${SERVICE_NAME})"
    echo "=================================================="
    echo ""
    echo "Useful commands:"
    echo "- Check service status: sudo systemctl status ${SERVICE_NAME}"
    echo "- View logs: sudo journalctl -u ${SERVICE_NAME} -f"
    echo "- Restart service: sudo systemctl restart ${SERVICE_NAME}"
    echo "- Update code: cd $APP_DIR && git pull && sudo systemctl restart ${SERVICE_NAME}"
    echo ""
    echo "Don't forget to:"
    echo "1. Update the .env file with your actual configuration"
    echo "2. Update CORS origins to include your Vercel domain"
    echo "3. Test the API endpoints"
}

# Main execution
main() {
    print_status "Starting YSI Backend setup..."

    check_permissions
    install_python_deps
    clone_repository
    setup_virtualenv
    setup_environment
    run_migrations
    create_systemd_service
    start_services
    test_backend
    show_status

    print_status "Backend setup completed successfully!"
}

# Error handling
trap 'print_error "Setup failed at line $LINENO. Check the logs above."' ERR

# Run main function
main "$@"