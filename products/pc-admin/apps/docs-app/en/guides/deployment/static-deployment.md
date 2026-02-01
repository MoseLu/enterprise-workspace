---
title: Static File Deployment Guide
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-01-27'
updated: '2025-01-27'
publish: true
tags:
- guides
- deployment
- static
- nginx
sidebar_label: Static Deployment
sidebar_order: 11
sidebar_group: deployment
---

# Static File Deployment Guide

## Overview

This solution provides a fast deployment method without Docker, directly deploying built static files to a Baota Panel server. Compared to Docker deployment, this approach:

- ✅ **Fast Deployment**: No need to pull images, directly sync files
- ✅ **Low Resource Usage**: No need to run containers
- ✅ **Simple Configuration**: Directly use Nginx to serve static files
- ✅ **High Flexibility**: Supports single app or batch deployment

## Prerequisites

1. **Server Environment**
   - Baota Panel installed
   - Nginx configured and running
   - Corresponding website created for each app (or use subdomain)

2. **Local Environment**
   - Node.js >= 20.19.0
   - pnpm >= 8.0.0
   - rsync or scp (rsync recommended, supports incremental sync)
   - SSH client

3. **Server Access**
   - SSH keys configured
   - Server user has permission to access website directories

## Configure Deployment Paths

### 1. Create Deployment Configuration File

Copy the example configuration file:

```bash
cp deploy.config.example.json deploy.config.json
```

### 2. Edit Configuration File

Edit `deploy.config.json`, set deployment path for each app:

```json
{
  "apps": {
    "admin-app": {
      "deployPath": "/www/wwwroot/admin.bellis.com.cn",
      "domain": "admin.bellis.com.cn"
    }
  }
}
```

**Note**: If no configuration file is created, the script will use default paths (based on app name).

## Usage

### Local Deployment

#### Deploy Single Application

```bash
# Build application first
pnpm --filter admin-app build

# Then deploy
pnpm deploy:static:admin

# Or use script to deploy directly
./scripts/deploy-static.sh --app admin-app
```

#### Deploy All Applications

```bash
# Build all applications first
pnpm build:all

# Then batch deploy
pnpm deploy:static:all

# Or use script
./scripts/deploy-static.sh --all
```

#### Using Environment Variables

```bash
export SERVER_HOST="your-server-ip"
export SERVER_USER="root"
export SERVER_PORT="22"
export SSH_KEY="~/.ssh/id_rsa"

pnpm deploy:static:admin
```

### GitHub Actions Deployment

#### Manual Trigger

1. Go to GitHub repository
2. Click "Actions" tab
3. Select "Deploy Static Files" workflow
4. Click "Run workflow"
5. Select app to deploy (or select "all")
6. Click "Run workflow"

#### Trigger via API

```bash
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO/dispatches \
  -d '{
    "event_type": "deploy-static",
    "client_payload": {
      "app": "admin-app"
    }
  }'
```

## Deployment Process

1. **Build Application**
   - Run `pnpm --filter <app> build`
   - Generate `apps/<app>/dist` directory

2. **Verify Build Artifacts**
   - Check if `dist` directory exists and is not empty

3. **Create Backup**
   - Backup currently deployed files on server
   - Backup path: `/www/backups/<app>/<timestamp>/`

4. **Sync Files**
   - Use `rsync` or `scp` to sync files to server
   - Exclude `.map` files and other unnecessary files

5. **Set Permissions**
   - Set file owner to `www:www`
   - Set directory permissions to `755`, file permissions to `644`

6. **Reload Nginx**
   - Automatically reload Nginx configuration (if possible)

## Baota Panel Configuration

### 1. Create Website

Create a website for each app in Baota Panel:

- **Website Domain**: e.g., `admin.bellis.com.cn`
- **Website Root Directory**: e.g., `/www/wwwroot/admin.bellis.com.cn`
- **Website Type**: Static website

### 2. Configure Nginx

Ensure Nginx configuration supports SPA routing:

```nginx
server {
    listen 80;
    server_name admin.bellis.com.cn;
    root /www/wwwroot/admin.bellis.com.cn;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Configure SSL

Configure SSL certificate for each website in Baota Panel.

## Common Issues

### 1. SSH Connection Failed

**Problem**: Cannot connect to server

**Solution**:
- Check if `SERVER_HOST`, `SERVER_USER`, `SERVER_PORT` are correct
- Confirm SSH keys are correctly configured
- Test SSH connection: `ssh -i ~/.ssh/id_rsa -p 22 root@your-server-ip`

### 2. Permission Error

**Problem**: Files cannot be accessed after upload

**Solution**:
- Ensure server user has permission to access website directory
- Check file permissions: `chown -R www:www /www/wwwroot/your-site`
- Check directory permissions: `chmod -R 755 /www/wwwroot/your-site`

### 3. Files Not Updated

**Problem**: Website content not updated after deployment

**Solution**:
- Clear browser cache
- Check Nginx cache configuration
- Confirm files are correctly synced to server

### 4. Build Failed

**Problem**: Build step failed

**Solution**:
- Check Node.js and pnpm versions
- Run `pnpm install` to install dependencies
- Check error messages in build logs

## Comparison with Docker Deployment

| Feature | Static Deployment | Docker Deployment |
|------|---------|------------|
| Deployment Speed | Fast (direct file sync) | Slow (need to pull images) |
| Resource Usage | Low (static files only) | High (need to run containers) |
| Environment Consistency | Depends on server environment | Fully consistent |
| Rollback Speed | Fast (direct file replacement) | Slow (need to pull old images) |
| Use Cases | Pure frontend apps | Apps requiring specific runtime environment |

## Best Practices

1. **Use rsync**: Faster than scp, supports incremental sync
2. **Create Backups**: Automatically backup before deployment for quick rollback
3. **Deploy in Batches**: Production environments recommend batch deployment to avoid affecting all apps simultaneously
4. **Monitor Deployment**: Check if website is accessible after deployment
5. **Version Management**: Keep deployment history for troubleshooting

## Related Commands

```bash
# Build and deploy single app
pnpm --filter admin-app build && pnpm deploy:static:admin

# Build and deploy all apps
pnpm build:all && pnpm deploy:static:all

# Deploy only (no build)
pnpm deploy:static:admin

# View help
./scripts/deploy-static.sh --help
```
