---
title: Nginx Subdomain Reverse Proxy Configuration Guide
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-01-27'
updated: '2025-01-27'
publish: true
tags:
- guides
- deployment
- nginx
- reverse-proxy
sidebar_label: Nginx Subdomain Proxy
sidebar_order: 7
sidebar_group: deployment
---

# Nginx Subdomain Reverse Proxy Configuration Guide

## Architecture Overview

Use subdomains to route different applications to different Docker containers:

```
Client Request
    ↓
[Nginx Reverse Proxy] (Server:80/443)
    ├─ bellis.com.cn → 30080 (main-app)
    ├─ admin.bellis.com.cn → 30081 (admin-app)
    ├─ logistics.bellis.com.cn → 30082 (logistics-app)
    ├─ quality.bellis.com.cn → 30083 (quality-app)
    ├─ production.bellis.com.cn → 30084 (production-app)
    ├─ engineering.bellis.com.cn → 30085 (engineering-app)
    ├─ finance.bellis.com.cn → 30086 (finance-app)
    └─ mobile.bellis.com.cn → 30091 (mobile-app)
    ↓
[Docker Containers] (Internal port 80)
```

## Domain Planning

| Application | Subdomain | Container Port | Description |
|------|--------|---------|------|
| main-app | `bellis.com.cn` | 30080 | Main app (root domain) |
| admin-app | `admin.bellis.com.cn` | 30081 | Admin app |
| logistics-app | `logistics.bellis.com.cn` | 30082 | Logistics app |
| quality-app | `quality.bellis.com.cn` | 30083 | Quality app |
| production-app | `production.bellis.com.cn` | 30084 | Production app |
| engineering-app | `engineering.bellis.com.cn` | 30085 | Engineering app |
| finance-app | `finance.bellis.com.cn` | 30086 | Finance app |
| mobile-app | `mobile.bellis.com.cn` | 30091 | Mobile app |

## DNS Configuration

### 1. Configure DNS Resolution

Add the following A records in your DNS provider (e.g., Alibaba Cloud, Tencent Cloud):

```
Record Type    Host Record            Record Value (Server IP)
A             @                      Your server IP
A             admin                  Your server IP
A             logistics              Your server IP
A             quality                Your server IP
A             production             Your server IP
A             engineering            Your server IP
A             finance                Your server IP
A             mobile                 Your server IP
```

This creates:
- `bellis.com.cn` → Server IP
- `admin.bellis.com.cn` → Server IP
- `logistics.bellis.com.cn` → Server IP
- etc...

### 2. Verify DNS Resolution

```bash
# Verify DNS resolution
dig bellis.com.cn
dig admin.bellis.com.cn
dig logistics.bellis.com.cn
```

## Nginx Configuration

### Solution 1: Single Configuration File (Recommended)

Create `/etc/nginx/conf.d/btc-shopflow.conf`:

```nginx
# ============================================
# BTC ShopFlow - Main App (Root Domain)
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name bellis.com.cn www.bellis.com.cn;

    # HTTP redirect to HTTPS
    return 301 https://bellis.com.cn$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name bellis.com.cn www.bellis.com.cn;

    # SSL certificate configuration
    ssl_certificate /etc/nginx/ssl/bellis.com.cn/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/bellis.com.cn/privkey.pem;
    
    # SSL optimization configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Log configuration
    access_log /var/log/nginx/btc-main-app.access.log;
    error_log /var/log/nginx/btc-main-app.error.log;
    
    # Proxy to main-app container
    location / {
        proxy_pass http://127.0.0.1:30080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering settings
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:30080/health;
        access_log off;
    }
}

# ============================================
# BTC ShopFlow - Admin App
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name admin.bellis.com.cn;

    return 301 https://admin.bellis.com.cn$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.bellis.com.cn;

    ssl_certificate /etc/nginx/ssl/bellis.com.cn/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/bellis.com.cn/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/btc-admin-app.access.log;
    error_log /var/log/nginx/btc-admin-app.error.log;

    location / {
        proxy_pass http://127.0.0.1:30081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }
}

# Similar configurations for other apps (logistics, quality, production, engineering, finance, mobile)
# ... (repeated pattern for each app with corresponding port)
```

### Solution 2: Use Wildcard Certificate (Simpler)

If your SSL certificate supports wildcards (`*.bellis.com.cn`), you can use a simpler configuration:

```nginx
# Use map directive to simplify configuration
map $host $backend_port {
    bellis.com.cn              30080;
    www.bellis.com.cn          30080;
    admin.bellis.com.cn        30081;
    logistics.bellis.com.cn    30082;
    quality.bellis.com.cn      30083;
    production.bellis.com.cn   30084;
    engineering.bellis.com.cn  30085;
    finance.bellis.com.cn      30086;
    mobile.bellis.com.cn       30091;
    default                    30080;
}

# HTTP server - All subdomains redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name 
        bellis.com.cn
        www.bellis.com.cn
        admin.bellis.com.cn
        logistics.bellis.com.cn
        quality.bellis.com.cn
        production.bellis.com.cn
        engineering.bellis.com.cn
        finance.bellis.com.cn
        mobile.bellis.com.cn;

    return 301 https://$host$request_uri;
}

# HTTPS server - All subdomains
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name 
        bellis.com.cn
        www.bellis.com.cn
        admin.bellis.com.cn
        logistics.bellis.com.cn
        quality.bellis.com.cn
        production.bellis.com.cn
        engineering.bellis.com.cn
        finance.bellis.com.cn
        mobile.bellis.com.cn;

    # Wildcard SSL certificate
    ssl_certificate /etc/nginx/ssl/bellis.com.cn/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/bellis.com.cn/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Dynamically proxy to corresponding port
    location / {
        proxy_pass http://127.0.0.1:$backend_port;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }
}
```

## SSL Certificate Configuration

### 1. Use Let's Encrypt (Free, wildcard requires DNS verification)

```bash
# Install certbot
apt update
apt install certbot python3-certbot-nginx -y

# Apply for wildcard certificate (requires DNS verification)
certbot certonly --manual --preferred-challenges dns \
  -d "*.bellis.com.cn" -d "bellis.com.cn" \
  --email your-email@example.com

# Or apply separately for each subdomain (simpler)
certbot --nginx -d bellis.com.cn -d www.bellis.com.cn
certbot --nginx -d admin.bellis.com.cn
certbot --nginx -d logistics.bellis.com.cn
# ... other subdomains
```

### 2. Certificate Storage Location

```bash
# Let's Encrypt certificates usually stored in
/etc/letsencrypt/live/bellis.com.cn/fullchain.pem
/etc/letsencrypt/live/bellis.com.cn/privkey.pem

# Create symlink to nginx directory
mkdir -p /etc/nginx/ssl/bellis.com.cn
ln -s /etc/letsencrypt/live/bellis.com.cn/fullchain.pem /etc/nginx/ssl/bellis.com.cn/fullchain.pem
ln -s /etc/letsencrypt/live/bellis.com.cn/privkey.pem /etc/nginx/ssl/bellis.com.cn/privkey.pem
```

## Deployment Steps

### 1. Create Nginx Configuration File

```bash
# Execute on server
sudo nano /etc/nginx/conf.d/btc-shopflow.conf

# Paste configuration file content above
# Save and exit
```

### 2. Create SSL Certificate Directory

```bash
sudo mkdir -p /etc/nginx/ssl/bellis.com.cn
```

### 3. Configure SSL Certificate

```bash
# Apply for certificate using certbot
sudo certbot --nginx -d bellis.com.cn -d www.bellis.com.cn \
  -d admin.bellis.com.cn -d logistics.bellis.com.cn \
  -d quality.bellis.com.cn -d production.bellis.com.cn \
  -d engineering.bellis.com.cn -d finance.bellis.com.cn \
  -d mobile.bellis.com.cn
```

### 4. Test Nginx Configuration

```bash
# Test configuration syntax
sudo nginx -t

# If configuration is correct, will display:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 5. Reload Nginx

```bash
# Reload configuration (does not interrupt service)
sudo nginx -s reload

# Or restart Nginx
sudo systemctl restart nginx
```

### 6. Verify Configuration

```bash
# Check Nginx status
sudo systemctl status nginx

# Test each subdomain
curl -I https://bellis.com.cn
curl -I https://admin.bellis.com.cn
curl -I https://logistics.bellis.com.cn
```

## Troubleshooting

### 1. Check Nginx Error Logs

```bash
sudo tail -f /var/log/nginx/error.log
```

### 2. Check if Containers are Running

```bash
docker ps | grep btc-
```

### 3. Check if Ports are Listening

```bash
netstat -tlnp | grep -E "30080|30081|30082|30083|30084|30085|30086|30091"
```

### 4. Test Internal Connection

```bash
curl http://127.0.0.1:30080
curl http://127.0.0.1:30081
```

## Advantages

1. **Unified Entry**: All apps managed through Nginx
2. **SSL Termination**: Handle HTTPS at Nginx layer, containers remain HTTP
3. **Domain Routing**: Clearly distinguish different apps via subdomains
4. **Easy Management**: Centralized configuration, easy to maintain
5. **Performance Optimization**: Nginx can add caching, compression and other optimizations

## Notes

1. **DNS Propagation**: DNS configuration changes may take several hours to take effect
2. **Firewall**: Ensure firewall opens ports 80 and 443
3. **Container Network**: Container ports should only bind to 127.0.0.1, not exposed externally
4. **Certificate Renewal**: Let's Encrypt certificates need renewal every 90 days, can set up automatic renewal

## Automatic Certificate Renewal

```bash
# Set up cron job for automatic renewal
sudo crontab -e

# Add the following line (check and renew daily at 3 AM)
0 3 * * * certbot renew --quiet --nginx
```
