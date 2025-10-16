# YSI Catalyst - Deployment Architecture

This directory contains all the deployment configurations and documentation for the YSI Catalyst platform.

## Architecture Overview

YSI Catalyst uses a modern, cost-effective deployment architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (Vercel)      │───▶│   (AWS EC2)     │───▶│   (AWS RDS)     │
│                 │    │                 │    │                 │
│ React + Vite    │    │ FastAPI + Python│    │ MySQL Database  │
│ Static Hosting  │    │ t3.micro        │    │ (Existing)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Components

- **Frontend**: React application hosted on Vercel for global CDN and SSL
- **Backend**: FastAPI Python application on AWS EC2 with minimal cost
- **Database**: Existing MySQL RDS instance (not modified)

## Quick Start

### 1. Deploy Backend to AWS

```bash
cd architecture/aws/scripts
chmod +x deploy.sh
./deploy.sh
```

### 2. Deploy Frontend to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables (see `vercel/deployment-guide.md`)
3. Deploy

## Directory Structure

```
architecture/
├── aws/                          # AWS deployment files
│   ├── cloudformation/           # CloudFormation templates
│   │   └── ec2-backend.yaml     # Main infrastructure template
│   ├── scripts/                 # Deployment scripts
│   │   ├── deploy.sh           # Automated deployment script
│   │   └── setup-backend.sh    # Backend application setup
│   └── docs/                   # AWS documentation
│       └── deployment-guide.md # Detailed AWS deployment guide
├── vercel/                     # Vercel deployment files
│   ├── vercel.json            # Vercel configuration
│   └── deployment-guide.md    # Vercel deployment guide
└── README.md                  # This file
```

## Deployment Options

### Option 1: Automated Deployment (Recommended)

**Backend (AWS)**:
```bash
cd architecture/aws/scripts
./deploy.sh
```

**Frontend (Vercel)**:
- Use Vercel dashboard or CLI
- Follow `vercel/deployment-guide.md`

### Option 2: Manual Deployment

**Backend**:
1. Deploy CloudFormation stack manually
2. SSH into EC2 instance
3. Run setup script manually

**Frontend**:
1. Configure build settings in Vercel
2. Set environment variables
3. Deploy from GitHub

## Cost Estimation

### AWS (Backend)
- **EC2 t3.micro**: $0-8.5/month (free tier eligible)
- **Elastic IP**: $0 (while attached)
- **EBS Storage**: $0-1/month (free tier eligible)
- **Data Transfer**: $0-1/month (1GB free)

**Total AWS Cost**: $0-10/month

### Vercel (Frontend)
- **Hobby Plan**: $0/month (100GB bandwidth, 100 deployments)
- **Pro Plan**: $20/month (1TB bandwidth, unlimited deployments)

**Total Monthly Cost**: $0-30/month

## Environment Configuration

### Backend Environment Variables
```bash
DATABASE_URL=mysql+pymysql://...  # Existing RDS
SECRET_KEY=production-secret
BACKEND_CORS_ORIGINS=["https://your-app.vercel.app"]
```

### Frontend Environment Variables
```bash
VITE_API_URL=http://YOUR_EC2_IP:8080
VITE_APP_TITLE=YSI Catalyst Admin
VITE_ENVIRONMENT=production
```

## Security Features

### AWS Security
- Security groups restrict access to necessary ports only
- IAM roles with minimal required permissions
- Optional SSH key pair for secure access

### Vercel Security
- Automatic HTTPS/SSL certificates
- Security headers configured
- Environment variable encryption

### Application Security
- CORS properly configured
- Input validation with Pydantic
- Database connection security

## Monitoring and Maintenance

### Health Checks
- Backend: `http://YOUR_EC2_IP:8080/health`
- Frontend: Vercel provides uptime monitoring

### Logging
- **AWS**: CloudWatch logs and SSH access for debugging
- **Vercel**: Function logs and analytics dashboard

### Updates
- **Backend**: SSH into EC2, git pull, restart service
- **Frontend**: Push to GitHub, automatic deployment

## Scaling Considerations

### Current Architecture (Cost-Optimized)
- Single EC2 instance
- Direct database connection
- Suitable for MVP and small-scale deployment

### Future Scaling Options
- **Load Balancer**: Add ALB for multiple EC2 instances
- **Auto Scaling**: Implement auto-scaling groups
- **Caching**: Add Redis/ElastiCache
- **CDN**: CloudFront for static assets
- **Database**: Read replicas for scaling reads

## Backup and Recovery

### Database
- RDS automated backups (existing)
- Point-in-time recovery available

### Application
- Code: Git repository
- Configuration: Environment variables
- User data: Database backups

## Support and Troubleshooting

### Common Issues

1. **CORS Errors**: Check backend CORS configuration
2. **Database Connection**: Verify RDS accessibility
3. **Build Failures**: Check Vercel build logs
4. **502 Errors**: Check backend service status

### Getting Help

- **AWS Issues**: Check CloudFormation events and EC2 logs
- **Vercel Issues**: Check build logs and function logs
- **Application Issues**: Check backend service logs

### Useful Commands

```bash
# AWS Backend
ssh -i key.pem ec2-user@YOUR_IP
sudo systemctl status ysi-backend
sudo journalctl -u ysi-backend -f

# Vercel Frontend
vercel logs
vercel env ls
```

## Development vs Production

### Development
- Local backend: `http://localhost:8080`
- Local frontend: `http://localhost:3000`
- Development database or local SQLite

### Production
- Backend: AWS EC2 with Elastic IP
- Frontend: Vercel with custom domain
- Production RDS database

## Next Steps

After deployment:

1. **Custom Domain**: Configure custom domain in Vercel
2. **SSL Certificate**: Enable HTTPS for backend (Let's Encrypt)
3. **Monitoring**: Set up CloudWatch alarms
4. **Backup Strategy**: Implement regular backups
5. **CI/CD**: Set up automated deployments

## Contributing

When modifying the architecture:

1. Update CloudFormation templates
2. Test deployment scripts
3. Update documentation
4. Version control all changes