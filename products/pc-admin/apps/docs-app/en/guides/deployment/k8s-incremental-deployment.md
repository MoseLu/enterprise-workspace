---
title: K8s Incremental Build and Deployment Guide
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-01-27'
updated: '2025-01-27'
publish: true
tags:
- guides
- deployment
- kubernetes
- docker
sidebar_label: K8s Incremental Deployment
sidebar_order: 6
sidebar_group: deployment
---

# K8s Incremental Build and Deployment Guide

This document details how to use incremental build and deployment features to achieve an extremely simple update process: "only build incrementally when code changes, only deploy incrementally when apps change".

## Table of Contents

- [Core Concepts](#core-concepts)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Instructions](#detailed-instructions)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Core Concepts

### Incremental Build

Utilize Docker layer caching mechanism to only rebuild layers with code changes:
- **Stable Layers First**: Base images, dependency installation, etc., infrequently changed content
- **Variable Layers Last**: Source code and other frequently changed content
- **Cache Reuse**: Unchanged layers directly reused, significantly improving build speed

### Incremental Distribution

Images only transfer changed layers to private image registry:
- **Layer Transfer**: Docker Registry 2.0+ supports layer storage
- **Only Transfer Changes**: Only transfer changed image layers (usually tens of KB to a few MB)
- **Network Optimization**: Private registry avoids public network transfer delays

### Incremental Deployment

Split K8s resources by application, only update modified applications:
- **Independent Deployment**: Each application has independent Deployment resources
- **Rolling Update**: Only restart Pods of changed applications, does not affect other services
- **Fast Response**: Updates complete in seconds, no need to wait for full deployment

## Prerequisites

### 0. Configuration File Setup (Recommended)

Creating a configuration file can avoid manually specifying IP addresses each time:

```bash
# Copy configuration file template
cp .k8s-config.example .k8s-config

# Edit configuration file
# Set PRIVATE_REGISTRY=your private registry address
# Example: PRIVATE_REGISTRY=192.168.1.100:5000
```

The `.k8s-config` configuration file will not be committed to Git, so you can safely store local configurations.

### 1. Environment Requirements

- **Local Environment**:
  - Docker (19.03+, supports Buildx)
  - kubectl (K8s cluster access configured)
  - Git

- **Cloud Server Environment**:
  - Docker (for running private image registry)
  - Kubernetes cluster (single-node/multi-node both OK)
  - Network connectivity (local can access cloud server)

### 2. Set Up Private Image Registry

#### Start Docker Registry on Cloud Server

```bash
# Method 1: Use provided script (recommended)
bash scripts/setup-private-registry.sh

# Method 2: Manual start
docker run -d \
  --restart=always \
  --name private-registry \
  -p 5000:5000 \
  -v /var/lib/registry:/var/lib/registry \
  registry:2
```

#### Configure Local Docker to Access Private Registry

**Linux/macOS**:
```bash
# Edit /etc/docker/daemon.json
sudo nano /etc/docker/daemon.json

# Add the following content (replace with your cloud server IP)
{
  "insecure-registries": ["192.168.1.100:5000"]
}

# Restart Docker
sudo systemctl restart docker
```

**Windows (Docker Desktop)**:
1. Open Docker Desktop Settings
2. Go to "Docker Engine"
3. Add configuration:
```json
{
  "insecure-registries": ["192.168.1.100:5000"]
}
```
4. Click "Apply & Restart"

#### Verify Private Registry

```bash
# Test connection
docker pull alpine:latest
docker tag alpine:latest <cloud-server-IP>:5000/alpine:test
docker push <cloud-server-IP>:5000/alpine:test

# Verify push success
curl http://<cloud-server-IP>:5000/v2/_catalog
```

### 3. Configure K8s to Access Private Registry (Optional)

If private registry requires authentication, create imagePullSecrets:

```bash
kubectl create secret docker-registry registry-secret \
  --docker-server=<cloud-server-IP>:5000 \
  --docker-username=<username> \
  --docker-password=<password> \
  -n btc-shopflow
```

Then add to Deployment's `spec.template.spec`:
```yaml
imagePullSecrets:
- name: registry-secret
```

## Quick Start

### Method 1: Use Configuration File (Recommended)

```bash
# 1. Copy configuration file template
cp .k8s-config.example .k8s-config

# 2. Edit configuration file, set private registry address
# Edit .k8s-config, set PRIVATE_REGISTRY=192.168.1.100:5000

# 3. Incremental build and deploy (no need to specify IP)
pnpm build-deploy:k8s

# 4. View deployment status
kubectl get pods -n btc-shopflow
```

### Method 2: Use Command Line Parameters

```bash
# Incremental build and deploy (specify private registry address)
pnpm build-deploy:k8s --registry 192.168.1.100:5000
```

### Method 3: Use Environment Variables

```bash
# Set environment variable
export PRIVATE_REGISTRY="192.168.1.100:5000"

# Incremental build and deploy
pnpm build-deploy:k8s
```

### Method 4: Use GitHub Actions (Recommended for CI/CD)

GitHub Actions will automatically detect changes and execute incremental build and deployment, **no need to manually specify IP**, all configurations are in GitHub Secrets.

**For detailed configuration instructions, refer to**: [GitHub Actions K8s Configuration Guide](./github-actions-k8s-setup.md)

**Quick Configuration Steps**:

1. **Add Secrets in GitHub Repository Settings** (Settings → Secrets and variables → Actions):
   
   **Image Registry Configuration**:
   
   - `PRIVATE_REGISTRY` (Optional): Private image registry address
     - **Using Private Docker Registry** (e.g., `192.168.1.100:5000`):
       - Set to: `192.168.1.100:5000`
       - If private registry **does not require authentication**: `PRIVATE_REGISTRY_USERNAME` and `PRIVATE_REGISTRY_PASSWORD` can be left empty
       - If private registry **requires authentication**: need to set username and password
     - **Using GHCR** (GitHub Container Registry, recommended):
       - Leave empty or set to: `ghcr.io`
       - `PRIVATE_REGISTRY_USERNAME`: Leave empty (automatically uses `github.actor`, i.e., GitHub username)
       - `PRIVATE_REGISTRY_PASSWORD`: Leave empty (automatically uses `GITHUB_TOKEN`, automatically provided by GitHub Actions)
     - **Using Other Public Registry** (e.g., Docker Hub):
       - Set to: `docker.io` or leave empty
       - `PRIVATE_REGISTRY_USERNAME`: Docker Hub username
       - `PRIVATE_REGISTRY_PASSWORD`: Docker Hub password or Access Token
   
   - `PRIVATE_REGISTRY_USERNAME` (Optional): Registry username
     - **Private Docker Registry (requires authentication)**: Your username
     - **GHCR**: Leave empty (automatically uses GitHub username)
     - **Docker Hub**: Docker Hub username
     - **Private registry (no authentication)**: Leave empty
   
   - `PRIVATE_REGISTRY_PASSWORD` (Optional): Registry password or Token
     - **Private Docker Registry (requires authentication)**: Your password
     - **GHCR**: Leave empty (automatically uses `GITHUB_TOKEN`)
     - **Docker Hub**: Docker Hub password or [Access Token](https://hub.docker.com/settings/security)
     - **Private registry (no authentication)**: Leave empty
   
   **Configuration Examples**:
   
   ```yaml
   # Example 1: Use GHCR (simplest, recommended)
   PRIVATE_REGISTRY: (leave empty)
   PRIVATE_REGISTRY_USERNAME: (leave empty)
   PRIVATE_REGISTRY_PASSWORD: (leave empty)
   # Note: GitHub Actions will automatically use GITHUB_TOKEN and github.actor
   
   # Example 2: Use Private Docker Registry (no authentication)
   PRIVATE_REGISTRY: 192.168.1.100:5000
   PRIVATE_REGISTRY_USERNAME: (leave empty)
   PRIVATE_REGISTRY_PASSWORD: (leave empty)
   
   # Example 3: Use Private Docker Registry (requires authentication)
   PRIVATE_REGISTRY: registry.example.com:5000
   PRIVATE_REGISTRY_USERNAME: myuser
   PRIVATE_REGISTRY_PASSWORD: mypassword
   
   # Example 4: Use Docker Hub
   PRIVATE_REGISTRY: docker.io
   PRIVATE_REGISTRY_USERNAME: mydockerhubuser
   PRIVATE_REGISTRY_PASSWORD: mydockerhubtoken
   ```
   
   **K8s Deployment Configuration** (if automatic deployment in GitHub Actions is needed):
   - `K8S_SERVER`: K8s API server address (e.g., `https://kubernetes.example.com:6443`)
   - `K8S_CA_CERT`: K8s CA certificate (base64 encoded)
   - `K8S_TOKEN`: K8s access token
   - `K8S_NAMESPACE`: K8s namespace (default: `btc-shopflow`)

2. **Auto Trigger**: Push code to `develop` branch, GitHub Actions will automatically:
   - Detect changed applications
   - Only build changed applications
   - Push to configured image registry
   - Automatically deploy to K8s (if K8s Secrets are configured)

3. **Manual Trigger**:
   - Select "Build and Deploy to K8s (Incremental)" workflow in GitHub Actions page
   - Click "Run workflow"
   - Can choose:
     - `deploy_all`: Deploy all apps (no change detection)
     - `skip_build`: Skip build step
     - `skip_deploy`: Skip deployment step

**Advantages**:
- ✅ No need to manually specify IP, configure once
- ✅ Auto-detect changes, only build and deploy changed apps
- ✅ Supports parallel builds, faster
- ✅ Complete build and deployment logs
- ✅ Supports rollback and viewing history

### Common Commands

```bash
# Incremental build and deploy (default: only changed apps)
pnpm build-deploy:k8s

# Full build and deploy (all apps)
pnpm build-deploy:k8s:all

# Build only (no deploy)
pnpm build:k8s

# Deploy only (no build, need to build images first)
pnpm deploy:k8s --apps system-app,admin-app

# Specify comparison base (relative to specific commit)
pnpm build-deploy:k8s --base origin/develop

# Override configuration with command line parameters
pnpm build-deploy:k8s --registry 192.168.1.100:5000 --namespace my-namespace
```

## Detailed Instructions

### Workflow

```
Local code modification
    ↓
Execute incremental build script
    ↓
Detect changed apps (git diff)
    ↓
Only build changed apps (reuse unchanged layers)
    ↓
Push incremental images to private registry (only transfer changed layers)
    ↓
Trigger K8s to only update that app (rolling update)
    ↓
Verify update results
```

### Change Detection Logic

Script uses `git diff` to detect changes:

1. **App Code Changes**: Detect changes in `apps/<app-name>/` directory
2. **Shared Package Changes**: Detect changes in `packages/`, `configs/`, `scripts/` and other shared resources
3. **Configuration File Changes**: Detect changes in `turbo.json`, `package.json`, `pnpm-lock.yaml` and other configuration files

If shared packages or configuration files have changes, all apps will be marked as needing build.

### Image Tag Strategy

- **Dynamic Tags**: Use Git short commit hash (7 digits), e.g., `system-app:a1b2c3d`
- **latest Tag**: Also push `latest` tag as backup
- **Uniqueness Guarantee**: Each commit has unique image tag, avoiding overwrites

### K8s Deployment Strategy

- **Rolling Update**: `maxSurge: 1`, `maxUnavailable: 0`
- **Zero Downtime**: Ensures service is not interrupted during update
- **Auto Rollback**: If new version startup fails, automatically rollback to previous version

## Best Practices

### 1. Development Workflow

```bash
# 1. Modify code
vim apps/system-app/src/...

# 2. Commit code (optional but recommended)
git add .
git commit -m "feat: add new feature"

# 3. Incremental build and deploy
pnpm build-deploy:k8s --registry <cloud-server-IP>:5000

# 4. Verify update
kubectl get pods -n btc-shopflow -w
```

### 2. Multi-App Collaborative Development

If multiple developers modify different apps simultaneously:

```bash
# Developer A: Modify system-app
pnpm build-deploy:k8s --registry <cloud-server-IP>:5000
# Only build and deploy system-app

# Developer B: Modify admin-app
pnpm build-deploy:k8s --registry <cloud-server-IP>:5000
# Only build and deploy admin-app, does not affect system-app
```

### 3. Shared Package Updates

If shared packages (packages/) are modified, all apps need to be rebuilt:

```bash
# Modify shared package
vim packages/shared-core/src/...

# Incremental build will detect shared package changes, automatically build all apps
pnpm build-deploy:k8s:all --registry <cloud-server-IP>:5000
```

### 4. Performance Optimization

- **Utilize Local Cache**: After first build, subsequent builds will reuse cache layers
- **Parallel Builds**: Can build multiple apps simultaneously (modify script to support parallel)
- **Network Optimization**: Use intranet or VPN to connect to cloud server, reduce transfer time

## Troubleshooting

### 1. Build Failed

**Problem**: Image build failed

```bash
# View build logs
bash scripts/build-incremental-k8s.sh --registry <address> --dry-run

# Manually build single app
docker buildx build \
  --build-arg APP_DIR=apps/system-app \
  -t <registry-address>/system-app:test \
  -f Dockerfile .
```

**Solution**:
- Check Dockerfile syntax
- Confirm app directory exists
- Check if dependency installation succeeded

### 2. Push Failed

**Problem**: Image push failed

```bash
# Test private registry connection
curl http://<cloud-server-IP>:5000/v2/_catalog

# Check Docker configuration
cat /etc/docker/daemon.json

# Manually test push
docker push <registry-address>/alpine:test
```

**Solution**:
- Confirm private registry is running
- Check `insecure-registries` configuration
- Confirm network connectivity

### 3. Deployment Failed

**Problem**: K8s deployment failed

```bash
# View Pod status
kubectl get pods -n btc-shopflow

# View Pod logs
kubectl logs <pod-name> -n btc-shopflow

# View Deployment events
kubectl describe deployment btc-system-app -n btc-shopflow
```

**Solution**:
- Check if image exists: `docker pull <registry-address>/system-app:latest`
- Confirm K8s can access private registry (configure imagePullSecrets)
- Check if resource limits are sufficient

### 4. Image Pull Failed

**Problem**: K8s cannot pull images

```bash
# Check if image exists
kubectl describe pod <pod-name> -n btc-shopflow | grep -i image

# Test pulling image from K8s node
# Execute on K8s node
docker pull <registry-address>/system-app:latest
```

**Solution**:
- Confirm K8s nodes can access private registry
- Configure imagePullSecrets (if authentication is needed)
- Check if network policies block access

## Advanced Configuration

### Custom Build Parameters

```bash
# Specify comparison base
pnpm build-deploy:k8s --registry <address> --base origin/develop

# Skip build (deploy only)
pnpm build-deploy:k8s --registry <address> --skip-build

# Skip deploy (build only)
pnpm build-deploy:k8s --registry <address> --skip-deploy
```

### Environment Variable Configuration

```bash
# Set default private registry address
export PRIVATE_REGISTRY="192.168.1.100:5000"

# Set K8s namespace
export K8S_NAMESPACE="btc-shopflow"

# Set Git SHA (override auto-detection)
export GIT_SHA="a1b2c3d"
```

## Comparison with Existing Process

### Traditional Method (Full Build and Deploy)

```bash
# Build all apps (time: 10-20 minutes)
docker build ...

# Push all images (time: 5-10 minutes)
docker push ...

# Deploy all apps (time: 2-5 minutes)
kubectl apply ...
```

**Total Time**: 17-35 minutes

### Incremental Method (Only Changed Apps)

```bash
# Detect changes (time: <1 second)
git diff ...

# Build changed apps (time: 1-3 minutes, reuse cache)
docker buildx build --cache-from ...

# Push changed images (time: 10-30 seconds, only transfer changed layers)
docker push ...

# Deploy changed apps (time: 10-30 seconds, rolling update)
kubectl set image ...
```

**Total Time**: 1-4 minutes (80%+ improvement)

## Summary

Incremental build and deployment solution achieves:
- ✅ **Extremely Simple Process**: One-click execution, automatic change detection
- ✅ **Fast Updates**: Only process changed parts, 80%+ speed improvement
- ✅ **Zero Downtime**: Rolling updates, does not affect other services
- ✅ **Resource Saving**: Only transfer changed layers, save network bandwidth
- ✅ **Easy Maintenance**: No complex tools needed, use basic commands

---

**Related Documentation**:
- [K8s Deployment Guide](../k8s/README.md)
- [Dockerfile Optimization Guide](../Dockerfile)
- [Private Registry Setup Script](../scripts/setup-private-registry.sh)
