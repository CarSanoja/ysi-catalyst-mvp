# YSI Backend AWS Deployment

## Overview
Automated AWS infrastructure deployment for YSI Backend using CloudFormation, Docker, nginx, and Cloudflare tunnel.

## Architecture
- **EC2 t3.micro**: Web server with nginx reverse proxy
- **RDS MySQL**: Database instance (db.t3.micro)
- **Docker**: Backend application containerization
- **Cloudflare Tunnel**: HTTPS endpoint without domain/SSL management
- **VPC**: Isolated network environment

## Files Structure
```
architecture/aws/
├── README.md                              # This file
├── cloudformation-backend-automated.yaml  # Full CloudFormation template
├── deploy.sh                             # Deployment script
├── docs/
│   └── manual-setup.md                   # Manual configuration documentation
└── scripts/
    ├── setup.sh                          # EC2 setup automation script
    └── cloudflare-tunnel-manager.sh      # Tunnel management script
```

## Quick Deployment

### Prerequisites
1. AWS CLI configured with appropriate permissions
2. GitHub repository accessible (public or with deploy keys)

### Deploy Infrastructure
```bash
cd architecture/aws
./deploy.sh
```

This will:
1. Create CloudFormation stack with all resources
2. Deploy EC2 instance with automated setup
3. Install and configure all services
4. Start Cloudflare tunnel
5. Provide connection details

## Step-by-Step Deployment

### 1. Configure Parameters (Optional)
```bash
cp parameters.json.example parameters.json
# Edit parameters.json with your values
```

### 2. Deploy Stack
```bash
aws cloudformation create-stack \
    --stack-name ysi-backend-stack \
    --template-body file://cloudformation-backend-automated.yaml \
    --parameters file://parameters.json \
    --capabilities CAPABILITY_IAM \
    --region us-east-1
```

### 3. Wait for Completion
```bash
aws cloudformation wait stack-create-complete \
    --stack-name ysi-backend-stack \
    --region us-east-1
```

### 4. Get Outputs
```bash
aws cloudformation describe-stacks \
    --stack-name ysi-backend-stack \
    --region us-east-1 \
    --query 'Stacks[0].Outputs'
```

## Post-Deployment Steps

### 1. Get Cloudflare Tunnel URL
```bash
# SSH to instance
ssh -i ysi-backend-key.pem ec2-user@[PUBLIC_IP]

# Get tunnel URL
sudo journalctl -u cloudflared-tunnel -n 50 | grep trycloudflare
```

### 2. Update Frontend Configuration
```bash
# Update frontend/src/utils/environment.ts
# Replace hardcoded URLs with new Cloudflare tunnel URL

# Update architecture/vercel/vercel.json
# Update VITE_API_BASE_URL with new tunnel URL
```

### 3. Deploy Frontend Changes
```bash
git add -A
git commit -m "Update backend URL with new Cloudflare tunnel"
git push
```

## Services and Ports

### Running Services
- **nginx**: Reverse proxy (ports 80, 443, 8080)
- **docker-compose**: Backend application
- **uvicorn**: FastAPI server (port 8000, internal)
- **cloudflared**: HTTPS tunnel service
- **mysql**: RDS database (port 3306, private)

### Port Mapping
- `80` → nginx → localhost:8080 → uvicorn:8000
- `443` → nginx → uvicorn:8000 (HTTPS with self-signed cert)
- `8080` → nginx → uvicorn:8000 (HTTP direct)
- `8000` → uvicorn (FastAPI backend)

### Endpoints
- **HTTP**: `http://[PUBLIC_IP]:8080/api/v1`
- **HTTPS**: `https://[PUBLIC_IP]/api/v1` (self-signed)
- **Cloudflare**: `https://[random].trycloudflare.com/api/v1` (trusted SSL)

## Management Commands

### Connect to Instance
```bash
ssh -i ysi-backend-key.pem ec2-user@[PUBLIC_IP]
```

### Check Services Status
```bash
sudo systemctl status nginx
sudo systemctl status docker
sudo systemctl status ysi-backend
sudo systemctl status cloudflared-tunnel
```

### View Logs
```bash
# Setup logs
tail -f /var/log/ysi-setup.log

# Cloudflare tunnel logs
sudo journalctl -u cloudflared-tunnel -f

# Backend application logs
cd /home/ec2-user/ysi-backend/backend
docker-compose logs -f
```

### Restart Services
```bash
# Restart nginx
sudo systemctl restart nginx

# Restart backend
sudo systemctl restart ysi-backend

# Restart Cloudflare tunnel
sudo systemctl restart cloudflared-tunnel
```

## Cloudflare Tunnel Management

### Get Current URL
```bash
sudo journalctl -u cloudflared-tunnel -n 50 | grep trycloudflare
```

### Restart Tunnel (Gets New URL)
```bash
sudo systemctl restart cloudflared-tunnel
# Wait 30 seconds then check for new URL
```

### Make URL Persistent (Manual)
The tunnel URL changes on restart. To keep the same URL:
1. Create Cloudflare account
2. Use authenticated tunnels instead of quick tunnels
3. Configure domain name

## Troubleshooting

### Backend Not Starting
```bash
# Check Docker status
sudo systemctl status docker

# Check backend logs
cd /home/ec2-user/ysi-backend/backend
docker-compose logs

# Restart backend
sudo systemctl restart ysi-backend
```

### Database Connection Issues
```bash
# Check RDS status
aws rds describe-db-instances --db-instance-identifier ysi-db-production

# Test connection from EC2
mysql -h [RDS_ENDPOINT] -u admin -p ysi_platform
```

### Tunnel Not Working
```bash
# Check tunnel status
sudo systemctl status cloudflared-tunnel

# Restart tunnel
sudo systemctl restart cloudflared-tunnel

# Check logs
sudo journalctl -u cloudflared-tunnel -n 100
```

### CORS Issues
Check nginx configuration in `/etc/nginx/conf.d/`:
- Verify CORS headers are present
- Ensure proxy_pass points to correct port
- Restart nginx after changes

## Security Considerations

### Current Security
- VPC with private subnets for database
- Security groups restricting access
- Self-signed SSL certificates
- Database in private subnet

### Recommendations for Production
1. **Use proper SSL certificates** (Let's Encrypt or ACM)
2. **Implement WAF** for web application firewall
3. **Enable CloudTrail** for audit logging
4. **Use Secrets Manager** for database passwords
5. **Enable VPC Flow Logs** for network monitoring
6. **Implement backup strategy** for RDS and data

## Cost Optimization

### Current Resources (Monthly Estimates)
- **EC2 t3.micro**: ~$8.50/month
- **RDS db.t3.micro**: ~$12.50/month
- **EBS storage**: ~$2/month
- **Data transfer**: Variable
- **Total**: ~$23/month

### Cost Reduction Options
1. **Use RDS Free Tier** (first year only)
2. **Scheduled scaling** (stop instances during low usage)
3. **Reserved instances** for predictable workloads
4. **Monitor with CloudWatch** to optimize usage

## Monitoring and Alerts

### CloudWatch Metrics
- EC2 CPU utilization
- RDS connections and CPU
- Application logs

### Recommended Alerts
- High CPU usage (>80% for 5 minutes)
- Database connection failures
- Application errors
- Disk space usage (>85%)

## Backup and Recovery

### Automated Backups
- **RDS**: 7-day backup retention enabled
- **Snapshots**: Manual snapshots before major changes

### Disaster Recovery
1. **Database**: Restore from RDS backup
2. **Application**: Redeploy from GitHub
3. **Configuration**: Documented in manual-setup.md

## Updates and Maintenance

### Application Updates
```bash
# SSH to instance
cd /home/ec2-user/ysi-backend
git pull
cd backend
docker-compose down
docker-compose up -d --build
```

### System Updates
```bash
sudo yum update -y
sudo systemctl restart docker
sudo systemctl restart ysi-backend
```

### Security Updates
- Monitor AWS Security Bulletins
- Apply patches during maintenance windows
- Update Docker images regularly

## Support

### Common Issues
1. **Mixed Content Errors**: Use Cloudflare tunnel HTTPS URL
2. **Database Connection**: Check security groups and credentials
3. **Service Down**: Check systemctl status and logs
4. **New Tunnel URL**: Update frontend configuration and redeploy

### Getting Help
1. Check logs first: `/var/log/ysi-setup.log`
2. Verify service status: `systemctl status [service]`
3. Review documentation: `docs/manual-setup.md`
4. Check AWS Console for resource status