#!/bin/bash

# YSI Catalyst Backend Deployment Script
# This script deploys the backend infrastructure to AWS using CloudFormation

set -e

# Configuration
STACK_NAME="ysi-backend"
REGION="us-east-1"
KEY_PAIR_NAME="ysi-backend-key"
ENVIRONMENT="production"

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

# Function to check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
}

# Function to check if key pair exists
check_key_pair() {
    print_status "Checking if key pair '$KEY_PAIR_NAME' exists..."
    if ! aws ec2 describe-key-pairs --key-names "$KEY_PAIR_NAME" --region "$REGION" &> /dev/null; then
        print_warning "Key pair '$KEY_PAIR_NAME' does not exist."
        read -p "Do you want to create it? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            create_key_pair
        else
            print_error "Key pair is required for deployment. Exiting."
            exit 1
        fi
    else
        print_status "Key pair '$KEY_PAIR_NAME' already exists."
    fi
}

# Function to create key pair
create_key_pair() {
    print_status "Creating key pair '$KEY_PAIR_NAME'..."
    aws ec2 create-key-pair --key-name "$KEY_PAIR_NAME" --region "$REGION" --query 'KeyMaterial' --output text > "${KEY_PAIR_NAME}.pem"
    chmod 400 "${KEY_PAIR_NAME}.pem"
    print_status "Key pair created and saved as '${KEY_PAIR_NAME}.pem'"
    print_warning "Keep this file safe! You'll need it to SSH into your instance."
}

# Function to deploy CloudFormation stack
deploy_stack() {
    print_status "Deploying CloudFormation stack '$STACK_NAME'..."

    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" &> /dev/null; then
        print_status "Stack exists. Updating..."
        aws cloudformation update-stack \
            --stack-name "$STACK_NAME" \
            --template-body file://cloudformation/ec2-backend.yaml \
            --parameters ParameterKey=KeyPairName,ParameterValue="$KEY_PAIR_NAME" \
                        ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
            --capabilities CAPABILITY_NAMED_IAM \
            --region "$REGION"

        print_status "Waiting for stack update to complete..."
        aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME" --region "$REGION"
    else
        print_status "Creating new stack..."
        aws cloudformation create-stack \
            --stack-name "$STACK_NAME" \
            --template-body file://cloudformation/ec2-backend.yaml \
            --parameters ParameterKey=KeyPairName,ParameterValue="$KEY_PAIR_NAME" \
                        ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
            --capabilities CAPABILITY_NAMED_IAM \
            --region "$REGION"

        print_status "Waiting for stack creation to complete..."
        aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME" --region "$REGION"
    fi
}

# Function to get stack outputs
get_outputs() {
    print_status "Getting stack outputs..."

    INSTANCE_ID=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query 'Stacks[0].Outputs[?OutputKey==`InstanceId`].OutputValue' --output text)
    PUBLIC_IP=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query 'Stacks[0].Outputs[?OutputKey==`PublicIP`].OutputValue' --output text)
    BACKEND_URL=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query 'Stacks[0].Outputs[?OutputKey==`BackendURL`].OutputValue' --output text)
    SSH_COMMAND=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" --query 'Stacks[0].Outputs[?OutputKey==`SSHCommand`].OutputValue' --output text)

    echo "=================================================="
    echo "DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "=================================================="
    echo "Instance ID: $INSTANCE_ID"
    echo "Public IP: $PUBLIC_IP"
    echo "Backend URL: $BACKEND_URL"
    echo "SSH Command: $SSH_COMMAND"
    echo "=================================================="
    echo ""
    echo "Next steps:"
    echo "1. SSH into the instance using: $SSH_COMMAND"
    echo "2. Clone your repository and set up the backend"
    echo "3. Run the setup script: ./setup-backend.sh"
    echo "4. Update your frontend environment variables with: $BACKEND_URL"
}

# Function to setup backend on the instance
setup_backend_remote() {
    print_status "Setting up backend on the remote instance..."
    print_warning "Make sure you have the private key file (${KEY_PAIR_NAME}.pem) in the current directory."

    # Copy setup script to instance
    scp -i "${KEY_PAIR_NAME}.pem" -o StrictHostKeyChecking=no setup-backend.sh ec2-user@"$PUBLIC_IP":/tmp/

    # Execute setup script
    ssh -i "${KEY_PAIR_NAME}.pem" -o StrictHostKeyChecking=no ec2-user@"$PUBLIC_IP" "chmod +x /tmp/setup-backend.sh && /tmp/setup-backend.sh"
}

# Main execution
main() {
    print_status "Starting YSI Backend deployment..."

    # Change to script directory
    cd "$(dirname "$0")"

    # Pre-deployment checks
    check_aws_cli
    check_key_pair

    # Deploy infrastructure
    deploy_stack

    # Get outputs
    get_outputs

    # Ask if user wants to setup backend automatically
    read -p "Do you want to setup the backend on the instance now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_backend_remote
    else
        print_status "You can setup the backend later by running: ./setup-backend.sh"
    fi

    print_status "Deployment script completed!"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --stack-name   Set stack name (default: ysi-backend)"
        echo "  --region       Set AWS region (default: us-east-1)"
        echo "  --key-name     Set key pair name (default: ysi-backend-key)"
        echo "  --environment  Set environment (default: production)"
        exit 0
        ;;
    --stack-name)
        STACK_NAME="$2"
        shift 2
        ;;
    --region)
        REGION="$2"
        shift 2
        ;;
    --key-name)
        KEY_PAIR_NAME="$2"
        shift 2
        ;;
    --environment)
        ENVIRONMENT="$2"
        shift 2
        ;;
esac

# Run main function
main "$@"