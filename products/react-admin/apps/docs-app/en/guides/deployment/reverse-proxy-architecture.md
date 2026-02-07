---
title: BTC ShopFlow Container Reverse Proxy Architecture
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-01-27'
updated: '2025-01-27'
publish: true
tags:
- guides
- deployment
- architecture
- docker
sidebar_label: Reverse Proxy Architecture
sidebar_order: 10
sidebar_group: deployment
---

# BTC ShopFlow Container Reverse Proxy Architecture

## Current Architecture Overview

### Architecture Type
**Direct Port Mapping** (No unified reverse proxy)

Each application container is directly exposed to the host through port mapping, **no unified Nginx reverse proxy is used**.

## Architecture Diagram

```
Client Request
    ↓
[Server:80/443] (If external Nginx exists)
    ↓
[Host Port Mapping]
    ├─ 30080 → btc-system-app:80
    ├─ 30081 → btc-admin-app:80
    ├─ 30082 → btc-logistics-app:80
    ├─ 30083 → btc-quality-app:80
    ├─ 30084 → btc-production-app:80
    ├─ 30085 → btc-engineering-app:80
    ├─ 30086 → btc-finance-app:80
    └─ 30091 → btc-mobile-app:80
    ↓
[Container Nginx] (Inside each container)
    ├─ nginx:alpine
    └─ /usr/share/nginx/html (Static files)
```

## Port Mapping Configuration

### Production Environment Ports (`.github/workflows/main.yml`)

| Application | Container Name | Host Port | Container Port | Access URL |
|------|---------|---------|---------|---------|
| system-app | btc-system-app | 30080 | 80 | `http://server-IP:30080` |
| admin-app | btc-admin-app | 30081 | 80 | `http://server-IP:30081` |
| logistics-app | btc-logistics-app | 30082 | 80 | `http://server-IP:30082` |
| quality-app | btc-quality-app | 30083 | 80 | `http://server-IP:30083` |
| production-app | btc-production-app | 30084 | 80 | `http://server-IP:30084` |
| engineering-app | btc-engineering-app | 30085 | 80 | `http://server-IP:30085` |
| finance-app | btc-finance-app | 30086 | 80 | `http://server-IP:30086` |
| mobile-app | btc-mobile-app | 30091 | 80 | `http://server-IP:30091` |

### Local Development Ports (`docker-compose.yml`)

| Application | Host Port | Container Port |
|------|---------|---------|
| system-app | 8080 | 80 |
| admin-app | 8081 | 80 |
| logistics-app | 8082 | 80 |
| quality-app | 8083 | 80 |
| production-app | 8084 | 80 |
| engineering-app | 8085 | 80 |
| finance-app | 8086 | 80 |
| mobile-app | 8091 | 80 |

## Container Nginx Configuration

Each container internally uses **nginx:alpine** to serve static files.

### Configuration File: `docker/nginx.conf`

```nginx
server {
    listen 80;
    server_name _;
    charset utf-8;
    sendfile on;
    default_type application/octet-stream;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # gzip compression
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;
}
```

### Configuration Notes

- **SPA Route Support**: `try_files $uri $uri/ /index.html` supports frontend routing
- **Static File Serving**: Serves static files from `/usr/share/nginx/html`
- **Gzip Compression**: Enables basic compression to reduce transfer size

## Current Architecture Characteristics

### ✅ Advantages

1. **Simple and Direct**: Each app is independent, no interference
2. **Easy to Debug**: Direct port access, simple problem location
3. **Resource Isolation**: Each container runs independently
4. **Flexible Scaling**: Can independently scale each application

### ❌ Disadvantages

1. **No Unified Entry**: Need to access different apps through different ports
2. **Missing SSL Termination**: Need external Nginx if HTTPS is required externally
3. **Missing Unified Routing**: Cannot access via paths (like `/admin`, `/finance`)
4. **Missing Load Balancing**: Cannot load balance the same application
5. **CORS Issues**: Cross-origin access may require additional configuration

## External Nginx Reverse Proxy (Optional)

If you need a unified entry and domain access, you can configure an external Nginx reverse proxy on the server:

### Configuration Example

```nginx
# /etc/nginx/conf.d/btc-shopflow.conf

server {
    listen 80;
    server_name btc-shopflow.com;
    
    # Force HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name btc-shopflow.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Main app (system app)
    location / {
        proxy_pass http://127.0.0.1:30080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Admin app
    location /admin {
        proxy_pass http://127.0.0.1:30081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Finance app
    location /finance {
        proxy_pass http://127.0.0.1:30086;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Logistics app
    location /logistics {
        proxy_pass http://127.0.0.1:30082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Quality app
    location /quality {
        proxy_pass http://127.0.0.1:30083;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Production app
    location /production {
        proxy_pass http://127.0.0.1:30084;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Engineering app
    location /engineering {
        proxy_pass http://127.0.0.1:30085;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Mobile app
    location /mobile {
        proxy_pass http://127.0.0.1:30091;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Benefits of Using External Nginx

1. **Unified Entry**: All apps accessed through one domain
2. **SSL Termination**: Handle HTTPS at Nginx level
3. **Path Routing**: Access different apps via paths (like `/admin`)
4. **Unified Logging**: Centralized access log management
5. **Enhanced Security**: Can add WAF, rate limiting and other security features

## Docker Network Configuration

All containers are on the same Docker network:

```yaml
networks:
  btc-network:
    driver: bridge
```

Containers can access each other by container name:
- `btc-system-app:80`
- `btc-admin-app:80`
- etc...

## Access Method Comparison

### Current Method (Direct Port Access)

```
http://server-IP:30080    # System app
http://server-IP:30081    # Admin app
http://server-IP:30086    # Finance app
...
```

### After Using External Nginx

```
https://btc-shopflow.com/           # System app
https://btc-shopflow.com/admin      # Admin app
https://btc-shopflow.com/finance    # Finance app
...
```

## Recommended Improvement Solutions

### Solution 1: Add External Nginx Reverse Proxy (Recommended for Production)

**Advantages**:
- Unified entry and SSL management
- Better security and log management
- Supports path routing

**Implementation Steps**:
1. Install Nginx on server
2. Configure SSL certificates
3. Create reverse proxy configuration (refer to configuration example above)
4. Restart Nginx service

### Solution 2: Use Docker Compose Nginx Service

Add an Nginx container as unified entry in `docker-compose.yml`:

```yaml
services:
  nginx-proxy:
    image: nginx:alpine
    container_name: btc-nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - system-app
      - admin-app
      # ... other apps
    networks:
      - btc-network
```

### Solution 3: Use Traefik (Modern Solution)

Use Traefik as reverse proxy, supports automatic service discovery and SSL certificate auto-issuance.

## Summary

**Current Architecture**: Direct port mapping, no unified reverse proxy
- Each container independently exposes port
- Container uses nginx:alpine to serve static files
- Simple but lacks unified entry

**Recommendation**: Add external Nginx as unified reverse proxy in production environment
- Provides unified domain access
- Handles SSL/TLS
- Supports path routing
- Better security and maintainability
