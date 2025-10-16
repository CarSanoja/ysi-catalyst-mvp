#!/bin/bash

set -e

STACK_NAME="ysi-backend-stack"
REGION="us-east-1"
TEMPLATE_FILE="cloudformation-backend-automated.yaml"
PARAMS_FILE="parameters.json"

echo "========================================="
echo "YSI Backend Automated Deployment"
echo "Started at: $(date)"
echo "========================================="

if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "Error: CloudFormation template $TEMPLATE_FILE not found!"
    exit 1
fi

if [ ! -f "$PARAMS_FILE" ]; then
    echo "Creating default parameters file..."
    cat <<'PARAMS' > $PARAMS_FILE
[
  {
    "ParameterKey": "Environment",
    "ParameterValue": "production"
  },
  {
    "ParameterKey": "InstanceType",
    "ParameterValue": "t3.micro"
  },
  {
    "ParameterKey": "DBPassword",
    "ParameterValue": "YsiAdmin2024!"
  },
  {
    "ParameterKey": "GitHubRepo",
    "ParameterValue": "https://github.com/CarSanoja/ysi-catalyst-mvp.git"
  },
  {
    "ParameterKey": "CorsOrigins",
    "ParameterValue": "http://localhost:3000,http://localhost:3001,http://localhost:8000,http://localhost:8080,http://localhost,https://bool-mic-acrylic-elliott.trycloudflare.com,https://ysi-catalyst-mvp.vercel.app,https://ysi-catalyst-mvp-git-main-carsanojas-projects.vercel.app"
  }
]
PARAMS
    echo "Created $PARAMS_FILE with default values."
    echo "You can modify this file before running the deployment."
fi

check_stack_exists() {
    aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION > /dev/null 2>&1
}

echo "Checking if stack exists..."
if check_stack_exists; then
    echo "Stack $STACK_NAME exists. Updating..."
    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters file://$PARAMS_FILE \
        --capabilities CAPABILITY_IAM \
        --region $REGION

    echo "Waiting for stack update to complete..."
    aws cloudformation wait stack-update-complete --stack-name $STACK_NAME --region $REGION
    echo "Stack update completed successfully!"
else
    echo "Stack $STACK_NAME does not exist. Creating..."
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters file://$PARAMS_FILE \
        --capabilities CAPABILITY_IAM \
        --region $REGION

    echo "Waiting for stack creation to complete..."
    aws cloudformation wait stack-create-complete --stack-name $STACK_NAME --region $REGION
    echo "Stack creation completed successfully!"
fi

echo "========================================="
echo "Deployment Complete!"
echo "========================================="

echo "Getting stack outputs..."
OUTPUTS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs' --output table)
echo "$OUTPUTS"

echo ""
echo "Getting instance information..."
INSTANCE_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs[?OutputKey==`InstanceId`].OutputValue' --output text)
PUBLIC_IP=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs[?OutputKey==`PublicIP`].OutputValue' --output text)

echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo ""
echo "Waiting for instance to be fully ready..."
sleep 30

echo "Getting Cloudflare tunnel URL..."
PRIVATE_KEY=$(aws ec2 describe-key-pairs --key-names ysi-backend-key-production --region $REGION --query 'KeyPairs[0].KeyMaterial' --output text 2>/dev/null || echo "")

if [ -z "$PRIVATE_KEY" ]; then
    echo "Getting private key from AWS..."
    aws ssm get-parameter --name "/ec2/keypair/$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs[?OutputKey==`KeyPairId`].OutputValue' --output text)" --with-decryption --region $REGION --query 'Parameter.Value' --output text > ysi-backend-key.pem 2>/dev/null || echo "Could not retrieve private key automatically"
    chmod 600 ysi-backend-key.pem 2>/dev/null || echo "Private key not available for automatic retrieval"
fi

echo ""
echo "To get the Cloudflare tunnel URL, run:"
echo "ssh -i ysi-backend-key.pem ec2-user@$PUBLIC_IP \"sudo journalctl -u cloudflared-tunnel -n 50 | grep trycloudflare\""
echo ""
echo "Backend endpoints:"
echo "  HTTP:  http://$PUBLIC_IP:8080/api/v1"
echo "  HTTPS: https://$PUBLIC_IP/api/v1 (self-signed certificate)"
echo ""
echo "To connect via SSH:"
echo "ssh -i ysi-backend-key.pem ec2-user@$PUBLIC_IP"
echo ""
echo "Setup logs:"
echo "ssh -i ysi-backend-key.pem ec2-user@$PUBLIC_IP \"tail -f /var/log/ysi-setup.log\""
echo ""
echo "========================================="
echo "Next Steps:"
echo "1. Wait ~5 minutes for all services to start"
echo "2. Get the Cloudflare tunnel URL"
echo "3. Update frontend environment.ts with the new URL"
echo "4. Update Vercel configuration"
echo "5. Commit and push changes"
echo "========================================="