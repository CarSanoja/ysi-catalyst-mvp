# YSI Catalyst Backend - AWS Deployment Guide

This guide will help you deploy the YSI Catalyst backend to AWS using CloudFormation.

## Architecture Overview

The deployment creates a cost-optimized AWS infrastructure:

- **EC2 Instance**: t3.micro (free tier eligible)
- **Elastic IP**: For consistent backend URL
- **Security Groups**: Configured for HTTP/HTTPS/SSH access
- **IAM Roles**: Minimal permissions for EC2
- **RDS**: Uses existing database (not modified)

## Prerequisites

### 1. AWS Account Setup

1. **AWS Account**: Active AWS account with billing configured
2. **AWS CLI**: Installed and configured
3. **Permissions**: IAM user with CloudFormation, EC2, and IAM permissions

### 2. Local Requirements

```bash
# Install AWS CLI (if not already installed)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
```

### 3. Repository Access

- Ensure your repository is accessible: `https://github.com/CarSanoja/ysi-catalyst-mvp.git`
- Verify backend code is in the `backend/` directory

## Quick Deployment

### Option 1: Automated Deployment (Recommended)

```bash
# Navigate to the architecture directory
cd architecture/aws/scripts

# Make scripts executable
chmod +x deploy.sh
chmod +x setup-backend.sh

# Run deployment
./deploy.sh
```

The script will:
1. Check for AWS CLI and permissions
2. Create/verify SSH key pair
3. Deploy CloudFormation stack
4. Output connection details

### Option 2: Manual Deployment

#### Step 1: Create SSH Key Pair

```bash
# Create key pair (if not exists)
aws ec2 create-key-pair --key-name ysi-backend-key --region us-east-1 --query 'KeyMaterial' --output text > ysi-backend-key.pem
chmod 400 ysi-backend-key.pem
```

#### Step 2: Deploy CloudFormation Stack

```bash
aws cloudformation create-stack \
  --stack-name ysi-backend \
  --template-body file://cloudformation/ec2-backend.yaml \
  --parameters ParameterKey=KeyPairName,ParameterValue=ysi-backend-key \
              ParameterKey=Environment,ParameterValue=production \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

#### Step 3: Wait for Completion

```bash
aws cloudformation wait stack-create-complete --stack-name ysi-backend --region us-east-1
```

#### Step 4: Get Outputs

```bash
aws cloudformation describe-stacks --stack-name ysi-backend --region us-east-1 --query 'Stacks[0].Outputs'
```

## Post-Deployment Setup

### 1. Connect to Instance

```bash
# Get public IP from CloudFormation outputs
PUBLIC_IP=$(aws cloudformation describe-stacks --stack-name ysi-backend --region us-east-1 --query 'Stacks[0].Outputs[?OutputKey==`PublicIP`].OutputValue' --output text)

# SSH into instance
ssh -i ysi-backend-key.pem ec2-user@$PUBLIC_IP
```

### 2. Setup Backend Application

#### Option A: Automated Setup

```bash
# Copy setup script to instance
scp -i ysi-backend-key.pem setup-backend.sh ec2-user@$PUBLIC_IP:/tmp/

# Run setup script
ssh -i ysi-backend-key.pem ec2-user@$PUBLIC_IP "chmod +x /tmp/setup-backend.sh && /tmp/setup-backend.sh"
```

#### Option B: Manual Setup

```bash
# SSH into instance
ssh -i ysi-backend-key.pem ec2-user@$PUBLIC_IP

# Update system
sudo yum update -y

# Install Python and dependencies
sudo yum install -y python39 python39-pip git

# Clone repository
sudo mkdir -p /opt/ysi-backend
sudo chown ec2-user:ec2-user /opt/ysi-backend
git clone https://github.com/CarSanoja/ysi-catalyst-mvp.git /opt/ysi-backend

# Setup virtual environment
cd /opt/ysi-backend/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your actual configuration

# Start application
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

### 3. Configure Environment Variables

Edit `/opt/ysi-backend/backend/.env`:

```bash
# Database Configuration (keep existing)
DATABASE_URL=mysql+pymysql://adminysi:WXzpZd71VtlB53vRx5@ysi.cv860emi8n70.us-east-1.rds.amazonaws.com:3306/ysi

# Update CORS for production
BACKEND_CORS_ORIGINS=["https://your-vercel-domain.vercel.app","http://localhost:3000"]

# Set production secret key
SECRET_KEY=your-production-secret-key-here

# Configure other settings as needed
```

### 4. Start Services

```bash
# Create systemd service
sudo systemctl enable ysi-backend
sudo systemctl start ysi-backend

# Check status
sudo systemctl status ysi-backend

# View logs
sudo journalctl -u ysi-backend -f
```

## Configuration

### CloudFormation Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `KeyPairName` | `ysi-backend-key` | SSH key pair name |
| `InstanceType` | `t3.micro` | EC2 instance type |
| `Environment` | `production` | Environment name |

### Security Groups

The deployment creates a security group with these rules:

| Type | Port | Source | Description |
|------|------|--------|-------------|
| SSH | 22 | 0.0.0.0/0 | SSH access |
| HTTP | 80 | 0.0.0.0/0 | HTTP (nginx proxy) |
| HTTPS | 443 | 0.0.0.0/0 | HTTPS (future SSL) |
| Custom | 8080 | 0.0.0.0/0 | FastAPI backend |

### Cost Optimization

- **Instance Type**: t3.micro (free tier eligible)
- **Storage**: Standard EBS (included in free tier)
- **Network**: No NAT Gateway or Load Balancer
- **Monitoring**: Basic CloudWatch (free tier)

**Estimated Monthly Cost**: $0-15 (depending on free tier usage)

## Monitoring and Maintenance

### Health Checks

```bash
# Check if backend is responding
curl http://YOUR_PUBLIC_IP:8080/health

# Check nginx status
sudo systemctl status nginx

# Check backend service
sudo systemctl status ysi-backend
```

### Log Monitoring

```bash
# Backend application logs
sudo journalctl -u ysi-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -f
```

### Updates

```bash
# Update application code
cd /opt/ysi-backend
git pull
sudo systemctl restart ysi-backend

# Update system packages
sudo yum update -y
sudo reboot  # if kernel updated
```

## Troubleshooting

### Common Issues

#### 1. Service Won't Start

```bash
# Check service status
sudo systemctl status ysi-backend

# View detailed logs
sudo journalctl -u ysi-backend --no-pager

# Check if port is in use
sudo netstat -tlnp | grep 8080
```

#### 2. Database Connection Issues

```bash
# Test database connectivity
cd /opt/ysi-backend/backend
source venv/bin/activate
python -c "from app.db.session import engine; print(engine.connect())"
```

#### 3. Permission Issues

```bash
# Check file permissions
ls -la /opt/ysi-backend/

# Fix ownership if needed
sudo chown -R ec2-user:ec2-user /opt/ysi-backend/
```

### Stack Management

```bash
# Update stack
aws cloudformation update-stack \
  --stack-name ysi-backend \
  --template-body file://cloudformation/ec2-backend.yaml \
  --parameters ParameterKey=KeyPairName,ParameterValue=ysi-backend-key \
  --capabilities CAPABILITY_NAMED_IAM

# Delete stack (careful!)
aws cloudformation delete-stack --stack-name ysi-backend

# View stack events
aws cloudformation describe-stack-events --stack-name ysi-backend
```

## Security Considerations

### SSH Key Management

- Store SSH private key securely
- Use SSH agent for key management
- Consider rotating keys periodically

### Network Security

- Security group allows worldwide access (required for web app)
- Consider VPN or bastion host for SSH access in production
- Enable AWS CloudTrail for audit logging

### Application Security

- Use strong SECRET_KEY in production
- Enable HTTPS with SSL certificate
- Regularly update dependencies
- Monitor for security vulnerabilities

## SSL/HTTPS Setup (Optional)

### Using Let's Encrypt

```bash
# Install certbot
sudo yum install -y certbot python3-certbot-nginx

# Get certificate (requires domain name)
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Backup and Recovery

### Database Backup

The RDS instance should have automated backups enabled. Verify:

```bash
aws rds describe-db-instances --db-instance-identifier ysi --query 'DBInstances[0].BackupRetentionPeriod'
```

### Application Backup

```bash
# Backup configuration
tar -czf ysi-backend-config-$(date +%Y%m%d).tar.gz /opt/ysi-backend/backend/.env

# Store in S3 (optional)
aws s3 cp ysi-backend-config-$(date +%Y%m%d).tar.gz s3://your-backup-bucket/
```

## Support

For deployment issues:
1. Check CloudFormation events in AWS Console
2. Review EC2 instance logs
3. Verify security group settings
4. Test network connectivity

Common AWS documentation:
- [CloudFormation User Guide](https://docs.aws.amazon.com/cloudformation/)
- [EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [VPC User Guide](https://docs.aws.amazon.com/vpc/)