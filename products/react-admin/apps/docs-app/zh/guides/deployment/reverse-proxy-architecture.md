---
title: BTC ShopFlow 容器反向代理架构
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
sidebar_label: 反向代理架构
sidebar_order: 10
sidebar_group: deployment
---

# BTC ShopFlow 容器反向代理架构

## 📋 当前架构概览

### 架构类型
**直接端口映射**（无统一反向代理）

每个应用容器直接通过端口映射暴露到主机，**没有使用统一的Nginx反向代理**。

## 🏗️ 架构图

```
客户端请求
    ↓
[服务器:80/443] (如果有外部Nginx)
    ↓
[主机端口映射]
    ├─ 30080 → btc-system-app:80
    ├─ 30081 → btc-admin-app:80
    ├─ 30082 → btc-logistics-app:80
    ├─ 30083 → btc-quality-app:80
    ├─ 30084 → btc-production-app:80
    ├─ 30085 → btc-engineering-app:80
    ├─ 30086 → btc-finance-app:80
    └─ 30091 → btc-mobile-app:80
    ↓
[容器内Nginx] (每个容器内)
    ├─ nginx:alpine
    └─ /usr/share/nginx/html (静态文件)
```

## 🔌 端口映射配置

### 生产环境端口（`.github/workflows/main.yml`）

| 应用 | 容器名称 | 主机端口 | 容器端口 | 访问地址 |
|------|---------|---------|---------|---------|
| system-app | btc-system-app | 30080 | 80 | `http://服务器IP:30080` |
| admin-app | btc-admin-app | 30081 | 80 | `http://服务器IP:30081` |
| logistics-app | btc-logistics-app | 30082 | 80 | `http://服务器IP:30082` |
| quality-app | btc-quality-app | 30083 | 80 | `http://服务器IP:30083` |
| production-app | btc-production-app | 30084 | 80 | `http://服务器IP:30084` |
| engineering-app | btc-engineering-app | 30085 | 80 | `http://服务器IP:30085` |
| finance-app | btc-finance-app | 30086 | 80 | `http://服务器IP:30086` |
| mobile-app | btc-mobile-app | 30091 | 80 | `http://服务器IP:30091` |

### 本地开发端口（`docker-compose.yml`）

| 应用 | 主机端口 | 容器端口 |
|------|---------|---------|
| system-app | 8080 | 80 |
| admin-app | 8081 | 80 |
| logistics-app | 8082 | 80 |
| quality-app | 8083 | 80 |
| production-app | 8084 | 80 |
| engineering-app | 8085 | 80 |
| finance-app | 8086 | 80 |
| mobile-app | 8091 | 80 |

## 📦 容器内Nginx配置

每个容器内部使用 **nginx:alpine** 并提供静态文件服务。

### 配置文件：`docker/nginx.conf`

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

    # gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;
}
```

### 配置说明

- **SPA路由支持**: `try_files $uri $uri/ /index.html` 支持前端路由
- **静态文件服务**: 从 `/usr/share/nginx/html` 提供静态文件
- **Gzip压缩**: 启用基本压缩以减少传输大小

## 🔍 当前架构特点

### ✅ 优点

1. **简单直接**: 每个应用独立，互不干扰
2. **易于调试**: 直接访问端口，问题定位简单
3. **资源隔离**: 每个容器独立运行
4. **扩展灵活**: 可以独立扩展每个应用

### ❌ 缺点

1. **没有统一入口**: 需要通过不同端口访问不同应用
2. **缺少SSL终止**: 如果需要在外部提供HTTPS，需要外部Nginx
3. **缺少统一路由**: 无法通过路径（如 `/admin`, `/finance`）访问
4. **缺少负载均衡**: 无法对同一应用进行负载均衡
5. **CORS问题**: 跨域访问可能需要额外配置

## 🌐 外部Nginx反向代理（可选）

如果需要统一入口和域名访问，可以在服务器上配置外部Nginx反向代理：

### 配置示例

```nginx
# /etc/nginx/conf.d/btc-shopflow.conf

server {
    listen 80;
    server_name btc-shopflow.com;
    
    # 强制HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name btc-shopflow.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # 主应用（系统应用）
    location / {
        proxy_pass http://127.0.0.1:30080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 管理应用
    location /admin {
        proxy_pass http://127.0.0.1:30081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 财务应用
    location /finance {
        proxy_pass http://127.0.0.1:30086;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 物流应用
    location /logistics {
        proxy_pass http://127.0.0.1:30082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 质量应用
    location /quality {
        proxy_pass http://127.0.0.1:30083;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 生产应用
    location /production {
        proxy_pass http://127.0.0.1:30084;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 工程应用
    location /engineering {
        proxy_pass http://127.0.0.1:30085;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 移动应用
    location /mobile {
        proxy_pass http://127.0.0.1:30091;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 使用外部Nginx的好处

1. **统一入口**: 所有应用通过一个域名访问
2. **SSL终止**: 在Nginx层面处理HTTPS
3. **路径路由**: 通过路径（如 `/admin`）访问不同应用
4. **统一日志**: 集中管理访问日志
5. **安全增强**: 可以添加WAF、限流等安全功能

## 🔧 Docker网络配置

所有容器在同一个Docker网络中：

```yaml
networks:
  btc-network:
    driver: bridge
```

容器之间可以通过容器名称相互访问：
- `btc-system-app:80`
- `btc-admin-app:80`
- 等等...

## 📊 访问方式对比

### 当前方式（直接端口访问）

```
http://服务器IP:30080    # 系统应用
http://服务器IP:30081    # 管理应用
http://服务器IP:30086    # 财务应用
...
```

### 使用外部Nginx后

```
https://btc-shopflow.com/           # 系统应用
https://btc-shopflow.com/admin      # 管理应用
https://btc-shopflow.com/finance    # 财务应用
...
```

## 🚀 建议的改进方案

### 方案1：添加外部Nginx反向代理（推荐用于生产环境）

**优点**:
- 统一入口和SSL管理
- 更好的安全性和日志管理
- 支持路径路由

**实施步骤**:
1. 在服务器上安装Nginx
2. 配置SSL证书
3. 创建反向代理配置（参考上面的配置示例）
4. 重启Nginx服务

### 方案2：使用Docker Compose的Nginx服务

在 `docker-compose.yml` 中添加一个Nginx容器作为统一入口：

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
      # ... 其他应用
    networks:
      - btc-network
```

### 方案3：使用Traefik（现代化方案）

使用Traefik作为反向代理，支持自动服务发现和SSL证书自动申请。

## 📝 总结

**当前架构**: 直接端口映射，无统一反向代理
- 每个容器独立暴露端口
- 容器内使用nginx:alpine提供静态文件
- 简单但缺少统一入口

**建议**: 在生产环境添加外部Nginx作为统一反向代理
- 提供统一域名访问
- 处理SSL/TLS
- 支持路径路由
- 更好的安全性和可维护性
