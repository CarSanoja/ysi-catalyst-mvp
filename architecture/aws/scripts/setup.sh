#!/bin/bash

set -e

LOG_FILE="/var/log/ysi-setup.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

echo "========================================="
echo "YSI Backend EC2 Setup Script"
echo "Started at: $(date)"
echo "========================================="

DB_ENDPOINT="${1:-ysi-db.cxxx.us-east-1.rds.amazonaws.com}"
DB_PASSWORD="${2:-YsiAdmin2024!}"
GITHUB_REPO="${3:-https://github.com/CarSanoja/ysi-catalyst-mvp.git}"

echo "[1/10] Updating system packages..."
sudo yum update -y

echo "[2/10] Installing Docker..."
sudo yum install -y docker
sudo service docker start
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

echo "[3/10] Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "[4/10] Installing Git..."
sudo yum install -y git

echo "[5/10] Installing nginx..."
sudo amazon-linux-extras install nginx1 -y

echo "[6/10] Installing Python 3.11 and dependencies..."
sudo yum install -y python3.11 python3-pip

echo "[7/10] Installing MySQL client..."
sudo yum install -y mysql

echo "[8/10] Installing Cloudflared..."
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /tmp/cloudflared
chmod +x /tmp/cloudflared
sudo mv /tmp/cloudflared /usr/local/bin/

echo "[9/10] Configuring nginx..."

sudo mkdir -p /etc/nginx/ssl

sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx-selfsigned.key \
    -out /etc/nginx/ssl/nginx-selfsigned.crt \
    -subj "/C=US/ST=State/L=City/O=YSI/CN=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"

cat <<'NGINX_HTTP' | sudo tee /etc/nginx/conf.d/ysi-backend-http.conf
server {
    listen 80;
    server_name _;

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
NGINX_HTTP

cat <<'NGINX_8080' | sudo tee /etc/nginx/conf.d/ysi-backend-port8080.conf
server {
    listen 8080;
    server_name _;

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
NGINX_8080

cat <<'NGINX_HTTPS' | sudo tee /etc/nginx/conf.d/ysi-backend.conf
server {
    listen 443 ssl;
    server_name _;

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

        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;

        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
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
NGINX_HTTPS

sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx

echo "[10/10] Cloning repository and starting backend..."

cd /home/ec2-user
git clone $GITHUB_REPO ysi-backend
cd ysi-backend/backend

cat <<ENV_FILE > .env
DB_HOST=$DB_ENDPOINT
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=$DB_PASSWORD
DB_NAME=ysi_platform
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_TIME_MINUTES=10080
ENV_FILE

sudo -u ec2-user docker-compose up -d

cat <<'DOCKER_SERVICE' | sudo tee /etc/systemd/system/ysi-backend.service
[Unit]
Description=YSI Backend Docker Compose Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ec2-user/ysi-backend/backend
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
StandardOutput=journal
User=ec2-user

[Install]
WantedBy=multi-user.target
DOCKER_SERVICE

sudo systemctl daemon-reload
sudo systemctl enable ysi-backend.service

cat <<'CLOUDFLARED_SERVICE' | sudo tee /etc/systemd/system/cloudflared-tunnel.service
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/cloudflared tunnel --url http://localhost:8080 --no-autoupdate
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
CLOUDFLARED_SERVICE

sudo systemctl daemon-reload
sudo systemctl enable cloudflared-tunnel.service
sudo systemctl start cloudflared-tunnel.service

echo "========================================="
echo "Setup Complete!"
echo "Started at: $(date)"
echo "========================================="
echo ""
echo "Services Status:"
sudo systemctl status nginx --no-pager | head -n 3
sudo systemctl status docker --no-pager | head -n 3
sudo systemctl status ysi-backend --no-pager | head -n 3
sudo systemctl status cloudflared-tunnel --no-pager | head -n 3
echo ""
echo "To get the Cloudflare tunnel URL, run:"
echo "sudo journalctl -u cloudflared-tunnel -n 50 | grep trycloudflare"
echo ""
echo "Ports:"
echo "  - HTTP: 80, 8080"
echo "  - HTTPS: 443"
echo "  - Backend: 8000 (internal)"
echo ""
echo "Logs available at: $LOG_FILE"
echo "========================================="