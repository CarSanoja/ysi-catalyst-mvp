# Manual EC2 Setup Documentation

## Overview
This document details all manual configurations performed on the EC2 instance that need to be automated for future deployments.

## System Information
- **Instance Type**: t3.micro
- **OS**: Amazon Linux 2
- **IP**: 52.90.163.197
- **Region**: us-east-1

## Manual Installations Performed

### 1. Docker and Docker Compose
```bash
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Git
```bash
sudo yum install -y git
```

### 3. nginx
```bash
sudo amazon-linux-extras install nginx1 -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4. Python 3.11 and pip
```bash
sudo yum install -y python3.11
sudo yum install -y python3-pip
```

### 5. MySQL Client
```bash
sudo yum install -y mysql
```

### 6. Cloudflared (for HTTPS tunnel)
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/
```

### 7. Certbot (installed but not used)
```bash
sudo yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
sudo yum install -y certbot python2-certbot-nginx
```

## nginx Configuration

### HTTP Configuration (port 80)
File: `/etc/nginx/conf.d/ysi-backend-http.conf`
```nginx
server {
    listen 80;
    server_name 52.90.163.197;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

### HTTP Configuration (port 8080)
File: `/etc/nginx/conf.d/ysi-backend-port8080.conf`
```nginx
server {
    listen 8080;
    server_name 52.90.163.197;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

### HTTPS Configuration (port 443) with self-signed certificate
File: `/etc/nginx/conf.d/ysi-backend.conf`
```nginx
server {
    listen 443 ssl;
    server_name 52.90.163.197;

    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        add_header 'Access-Control-Allow-Origin' 'https://ysi15.vercel.app' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;

        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://ysi15.vercel.app';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Allow-Credentials' 'true';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

## Self-Signed SSL Certificate Creation
```bash
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx-selfsigned.key \
    -out /etc/nginx/ssl/nginx-selfsigned.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=52.90.163.197"
```

## Backend Application Deployment

### Clone Repository
```bash
cd /home/ec2-user
git clone https://github.com/CarSanoja/ysi-catalyst-mvp.git ysi-backend
cd ysi-backend/backend
```

### Docker Compose Configuration
The backend runs via Docker Compose with:
- FastAPI application on port 8000
- MySQL database connection to RDS

### Start Backend
```bash
docker-compose up -d
```

## Cloudflare Tunnel Setup (Temporary)

### Current Manual Process
```bash
nohup cloudflared tunnel --url http://localhost:8080 > /tmp/cloudflared.log 2>&1 &
```

This generates a random URL like: `https://[random-subdomain].trycloudflare.com`

### Issues with Current Setup
1. Tunnel URL changes on every restart
2. Process dies if server restarts
3. Not persistent
4. Manual intervention required

## Services Running

### Active Processes
- **nginx**: Reverse proxy on ports 80, 443, 8080
- **docker**: Container runtime
- **uvicorn**: FastAPI server on port 8000 (inside Docker)
- **cloudflared**: HTTPS tunnel (temporary process)

### Port Mapping
- Port 80 → nginx → localhost:8080 (but uvicorn is on 8000)
- Port 443 → nginx → localhost:8000 (HTTPS with self-signed cert)
- Port 8080 → nginx → localhost:8000 (HTTP)
- Port 8000 → uvicorn (FastAPI application)

## Security Groups Configuration
The EC2 instance security group allows:
- SSH (22)
- HTTP (80)
- HTTPS (443)
- Custom TCP (8080)
- Custom TCP (8000)

## Environment Variables
None set at system level. Application uses Docker Compose environment variables.

## Issues to Address in Automation

1. **Cloudflare Tunnel**: Needs to be set up as a permanent service
2. **nginx Configuration**: Should be templated and automated
3. **SSL Certificates**: Consider Let's Encrypt instead of self-signed
4. **Service Management**: All services should auto-start on boot
5. **Repository Cloning**: Should use deploy keys instead of public access
6. **Docker Compose**: Should auto-start on system boot
7. **Updates**: No automatic update mechanism
8. **Monitoring**: No health checks or monitoring configured
9. **Logs**: No centralized logging
10. **Backup**: No backup strategy for configuration files

## Recommended Automation Approach

1. Use CloudFormation UserData to run setup script
2. Create systemd services for all components
3. Use configuration management (Ansible/Terraform)
4. Implement health checks and auto-recovery
5. Set up CloudWatch monitoring
6. Use AWS Systems Manager for maintenance