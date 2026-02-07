---
title: Nginx 子域名反向代理配置指南
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
sidebar_label: Nginx子域名代理
sidebar_order: 7
sidebar_group: deployment
---

# Nginx 子域名反向代理配置指南

## 📋 架构概览

使用子域名将不同应用路由到不同的Docker容器：

```
客户端请求
    ↓
[Nginx反向代理] (服务器:80/443)
    ├─ bellis.com.cn → 30080 (main-app)
    ├─ admin.bellis.com.cn → 30081 (admin-app)
    ├─ logistics.bellis.com.cn → 30082 (logistics-app)
    ├─ quality.bellis.com.cn → 30083 (quality-app)
    ├─ production.bellis.com.cn → 30084 (production-app)
    ├─ engineering.bellis.com.cn → 30085 (engineering-app)
    ├─ finance.bellis.com.cn → 30086 (finance-app)
    └─ mobile.bellis.com.cn → 30091 (mobile-app)
    ↓
[Docker容器] (内部端口80)
```

## 🌐 域名规划

| 应用 | 子域名 | 容器端口 | 说明 |
|------|--------|---------|------|
| main-app | `bellis.com.cn` | 30080 | 主应用（根域名） |
| admin-app | `admin.bellis.com.cn` | 30081 | 管理应用 |
| logistics-app | `logistics.bellis.com.cn` | 30082 | 物流应用 |
| quality-app | `quality.bellis.com.cn` | 30083 | 质量应用 |
| production-app | `production.bellis.com.cn` | 30084 | 生产应用 |
| engineering-app | `engineering.bellis.com.cn` | 30085 | 工程应用 |
| finance-app | `finance.bellis.com.cn` | 30086 | 财务应用 |
| mobile-app | `mobile.bellis.com.cn` | 30091 | 移动应用 |

## 📝 DNS配置

### 1. 配置DNS解析

在你的DNS服务商（如阿里云、腾讯云）添加以下A记录：

```
记录类型    主机记录            记录值（服务器IP）
A          @                  你的服务器IP
A          admin              你的服务器IP
A          logistics          你的服务器IP
A          quality            你的服务器IP
A          production           你的服务器IP
A          engineering        你的服务器IP
A          finance            你的服务器IP
A          mobile             你的服务器IP
```

这样会创建：
- `bellis.com.cn` → 服务器IP
- `admin.bellis.com.cn` → 服务器IP
- `logistics.bellis.com.cn` → 服务器IP
- 等等...

### 2. 验证DNS解析

```bash
# 验证DNS解析
dig bellis.com.cn
dig admin.bellis.com.cn
dig logistics.bellis.com.cn
```

## 🔧 Nginx配置

### 方案1：单一配置文件（推荐）

创建 `/etc/nginx/conf.d/btc-shopflow.conf`：

```nginx
# ============================================
# BTC ShopFlow - 主应用（根域名）
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name bellis.com.cn www.bellis.com.cn;

    # HTTP重定向到HTTPS
    return 301 https://bellis.com.cn$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name bellis.com.cn www.bellis.com.cn;

    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/bellis.com.cn/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/bellis.com.cn/privkey.pem;
    
    # SSL优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 日志配置
    access_log /var/log/nginx/btc-main-app.access.log;
    error_log /var/log/nginx/btc-main-app.error.log;
    
    # 代理到main-app容器
    location / {
        proxy_pass http://127.0.0.1:30080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # WebSocket支持（如果需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓冲设置
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:30080/health;
        access_log off;
    }
}

# ============================================
# BTC ShopFlow - 管理应用
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

# ============================================
# BTC ShopFlow - 物流应用
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name logistics.bellis.com.cn;

    return 301 https://logistics.bellis.com.cn$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name logistics.bellis.com.cn;

    ssl_certificate /etc/nginx/ssl/bellis.com.cn/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/bellis.com.cn/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/btc-logistics-app.access.log;
    error_log /var/log/nginx/btc-logistics-app.error.log;

    location / {
        proxy_pass http://127.0.0.1:30082;
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

# ============================================
# BTC ShopFlow - 质量应用
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name quality.bellis.com.cn;

    return 301 https://quality.bellis.com.cn$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name quality.bellis.com.cn;

    ssl_certificate /etc/nginx/ssl/bellis.com.cn/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/bellis.com.cn/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/btc-quality-app.access.log;
    error_log /var/log/nginx/btc-quality-app.error.log;

    location / {
        proxy_pass http://127.0.0.1:30083;
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

# ============================================
# BTC ShopFlow - 生产应用
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name production.bellis.com.cn;

    return 301 https://production.bellis.com.cn$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name production.bellis.com.cn;

    ssl_certificate /etc/nginx/ssl/bellis.com.cn/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/bellis.com.cn/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/btc-production-app.access.log;
    error_log /var/log/nginx/btc-production-app.error.log;

    location / {
        proxy_pass http://127.0.0.1:30084;
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

# ============================================
# BTC ShopFlow - 工程应用
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name engineering.bellis.com.cn;

    return 301 https://engineering.bellis.com.cn$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name engineering.bellis.com.cn;

    ssl_certificate /etc/nginx/ssl/bellis.com.cn/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/bellis.com.cn/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/btc-engineering-app.access.log;
    error_log /var/log/nginx/btc-engineering-app.error.log;

    location / {
        proxy_pass http://127.0.0.1:30085;
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

# ============================================
# BTC ShopFlow - 财务应用
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name finance.bellis.com.cn;

    return 301 https://finance.bellis.com.cn$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name finance.bellis.com.cn;

    ssl_certificate /etc/nginx/ssl/bellis.com.cn/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/bellis.com.cn/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/btc-finance-app.access.log;
    error_log /var/log/nginx/btc-finance-app.error.log;

    location / {
        proxy_pass http://127.0.0.1:30086;
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

# ============================================
# BTC ShopFlow - 移动应用
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name mobile.bellis.com.cn;

    return 301 https://mobile.bellis.com.cn$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name mobile.bellis.com.cn;

    ssl_certificate /etc/nginx/ssl/bellis.com.cn/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/bellis.com.cn/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/btc-mobile-app.access.log;
    error_log /var/log/nginx/btc-mobile-app.error.log;

    location / {
        proxy_pass http://127.0.0.1:30091;
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

### 方案2：使用通配符证书（更简洁）

如果你的SSL证书支持通配符（`*.bellis.com.cn`），可以使用更简洁的配置：

```nginx
# 使用map指令简化配置
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

# HTTP服务器 - 所有子域名重定向到HTTPS
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

# HTTPS服务器 - 所有子域名
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

    # 通配符SSL证书
    ssl_certificate /etc/nginx/ssl/bellis.com.cn/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/bellis.com.cn/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 动态代理到对应端口
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

## 📦 SSL证书配置

### 1. 使用Let's Encrypt（免费，支持通配符需要DNS验证）

```bash
# 安装certbot
apt update
apt install certbot python3-certbot-nginx -y

# 申请通配符证书（需要DNS验证）
certbot certonly --manual --preferred-challenges dns \
  -d "*.bellis.com.cn" -d "bellis.com.cn" \
  --email your-email@example.com

# 或者单独为每个子域名申请（更简单）
certbot --nginx -d bellis.com.cn -d www.bellis.com.cn
certbot --nginx -d admin.bellis.com.cn
certbot --nginx -d logistics.bellis.com.cn
# ... 其他子域名
```

### 2. 证书存储位置

```bash
# Let's Encrypt证书通常存储在
/etc/letsencrypt/live/bellis.com.cn/fullchain.pem
/etc/letsencrypt/live/bellis.com.cn/privkey.pem

# 创建软链接到nginx目录
mkdir -p /etc/nginx/ssl/bellis.com.cn
ln -s /etc/letsencrypt/live/bellis.com.cn/fullchain.pem /etc/nginx/ssl/bellis.com.cn/fullchain.pem
ln -s /etc/letsencrypt/live/bellis.com.cn/privkey.pem /etc/nginx/ssl/bellis.com.cn/privkey.pem
```

## 🚀 部署步骤

### 1. 创建Nginx配置文件

```bash
# 在服务器上执行
sudo nano /etc/nginx/conf.d/btc-shopflow.conf

# 粘贴上面的配置文件内容
# 保存并退出
```

### 2. 创建SSL证书目录

```bash
sudo mkdir -p /etc/nginx/ssl/bellis.com.cn
```

### 3. 配置SSL证书

```bash
# 使用certbot申请证书
sudo certbot --nginx -d bellis.com.cn -d www.bellis.com.cn \
  -d admin.bellis.com.cn -d logistics.bellis.com.cn \
  -d quality.bellis.com.cn -d production.bellis.com.cn \
  -d engineering.bellis.com.cn -d finance.bellis.com.cn \
  -d mobile.bellis.com.cn
```

### 4. 测试Nginx配置

```bash
# 测试配置语法
sudo nginx -t

# 如果配置正确，会显示：
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 5. 重新加载Nginx

```bash
# 重新加载配置（不中断服务）
sudo nginx -s reload

# 或者重启Nginx
sudo systemctl restart nginx
```

### 6. 验证配置

```bash
# 检查Nginx状态
sudo systemctl status nginx

# 测试各个子域名
curl -I https://bellis.com.cn
curl -I https://admin.bellis.com.cn
curl -I https://logistics.bellis.com.cn
```

## 🔍 故障排查

### 1. 检查Nginx错误日志

```bash
sudo tail -f /var/log/nginx/error.log
```

### 2. 检查容器是否运行

```bash
docker ps | grep btc-
```

### 3. 检查端口是否监听

```bash
netstat -tlnp | grep -E "30080|30081|30082|30083|30084|30085|30086|30091"
```

### 4. 测试内部连接

```bash
curl http://127.0.0.1:30080
curl http://127.0.0.1:30081
```

## ✅ 优势

1. **统一入口**: 所有应用通过Nginx统一管理
2. **SSL终止**: 在Nginx层处理HTTPS，容器内保持HTTP
3. **域名路由**: 通过子域名清晰区分不同应用
4. **易于管理**: 集中配置，便于维护
5. **性能优化**: Nginx可以添加缓存、压缩等优化

## 📝 注意事项

1. **DNS传播**: DNS配置更改后可能需要几小时才能生效
2. **防火墙**: 确保防火墙开放80和443端口
3. **容器网络**: 容器端口应该只绑定到127.0.0.1，不对外暴露
4. **证书续期**: Let's Encrypt证书需要每90天续期一次，可以设置自动续期

## 🔄 自动证书续期

```bash
# 设置cron任务自动续期
sudo crontab -e

# 添加以下行（每天凌晨3点检查并续期）
0 3 * * * certbot renew --quiet --nginx
```
