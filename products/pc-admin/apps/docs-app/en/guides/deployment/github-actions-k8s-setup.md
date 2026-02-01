---
title: GitHub Actions K8s Incremental Deployment Configuration Guide
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-01-27'
updated: '2025-01-27'
publish: true
tags:
- guides
- deployment
- github-actions
- kubernetes
sidebar_label: GitHub Actions K8s Configuration
sidebar_order: 4
sidebar_group: deployment
---

# GitHub Actions K8s Incremental Deployment Configuration Guide

This document details how to configure GitHub Actions to achieve automatic incremental build and deployment to K8s.

## 🎉 Zero Configuration for First Use!

**Workflow automatically detects configuration and uses best solution**:

- ✅ **Default to GHCR**: No configuration needed, works out of the box
- ✅ **Auto-detect Private Registry**: If `PRIVATE_REGISTRY` is set, automatically uses it
- ✅ **Auto-judge Authentication**: If username and password are not set, automatically tries anonymous access (suitable for private registries that don't require authentication)

**Just push code to `develop` branch to automatically trigger!**

## Table of Contents

- [Quick Start](#quick-start)
- [Auto Configuration Notes](#auto-configuration-notes)
- [Detailed Configuration Instructions](#detailed-configuration-instructions)
- [Image Registry Configuration](#image-registry-configuration)
- [K8s Cluster Configuration](#k8s-cluster-configuration)
- [Verify Configuration](#verify-configuration)
- [Common Issues](#common-issues)

## Quick Start

### Method 1: Zero Configuration Use (Recommended)

**Suitable for most scenarios (same developer, using GHCR)**:

1. **No configuration needed**
2. Push code to `develop` branch
3. GitHub Actions automatically:
   - Detects changed applications
   - Builds and pushes to GHCR
   - Automatically deploys to K8s (if K8s Secrets are configured)

### Method 2: Use Private Registry (No Authentication)

**Suitable for intranet private registry, no authentication required**:

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add Secret:
   - `PRIVATE_REGISTRY`: `192.168.1.100:5000` (your private registry address)
3. **No need to set** `PRIVATE_REGISTRY_USERNAME` and `PRIVATE_REGISTRY_PASSWORD` (leave empty)

### Method 3: Use Private Registry (Requires Authentication)

**Suitable for private registries that require authentication**:

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add Secrets:
   - `PRIVATE_REGISTRY`: `registry.example.com:5000`
   - `PRIVATE_REGISTRY_USERNAME`: `myuser`
   - `PRIVATE_REGISTRY_PASSWORD`: `mypassword`

## Auto Configuration Notes

Workflow automatically detects configuration before running, selecting by the following priority:

1. **Detect `PRIVATE_REGISTRY` Secret**:
   - If set: Use private registry
   - If not set: Use GHCR (default)

2. **Detect Authentication Configuration** (only when using private registry):
   - If both `PRIVATE_REGISTRY_USERNAME` and `PRIVATE_REGISTRY_PASSWORD` are set: Use authentication login
   - If not set or only one is set: Try anonymous access (suitable for private registries that don't require authentication)

3. **When Using GHCR**:
   - Automatically uses `github.actor` (GitHub username) as username
   - Automatically uses `GITHUB_TOKEN` (automatically provided by GitHub Actions) as password

**Configuration Detection Log Example**:
```
🔍 Detecting image registry configuration...
✅ Private registry not configured, will use GitHub Container Registry (GHCR)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Configuration Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Image Registry: ghcr.io
Using GHCR: true
Requires Authentication: false
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Detailed Configuration Instructions

### Image Registry Configuration

#### Option 1: GitHub Container Registry (GHCR) - Recommended

**Advantages**:
- ✅ No additional configuration needed
- ✅ Automatically uses GitHub Token, secure and reliable
- ✅ Well integrated with GitHub
- ✅ Free to use

**Configuration**:
```
PRIVATE_REGISTRY: (leave empty, default to ghcr.io)
PRIVATE_REGISTRY_USERNAME: (leave empty, automatically uses github.actor)
PRIVATE_REGISTRY_PASSWORD: (leave empty, automatically uses GITHUB_TOKEN)
```

**Image Address Format**:
```
ghcr.io/<github-username>/<repository-name>/<app-name>:<tag>
Example: ghcr.io/bellisgit/btc-shopflow-monorepo/system-app:a1b2c3d
```

#### Option 2: Private Docker Registry (No Authentication)

**Use Case**: Intranet private registry, authentication not enabled

**Configuration**:
```
PRIVATE_REGISTRY: 192.168.1.100:5000
PRIVATE_REGISTRY_USERNAME: (leave empty)
PRIVATE_REGISTRY_PASSWORD: (leave empty)
```

**Notes**:
- Ensure GitHub Actions runner can access this address
- If registry is on private network, need to configure VPN or use self-hosted runner

#### Option 3: Private Docker Registry (Requires Authentication)

**Use Case**: Private registry with authentication enabled (e.g., Harbor, Nexus)

**Configuration**:
```
PRIVATE_REGISTRY: registry.example.com:5000
PRIVATE_REGISTRY_USERNAME: myuser
PRIVATE_REGISTRY_PASSWORD: mypassword
```

**Get Credentials**:
- Contact registry administrator for username and password
- Or use service account Token

#### Option 4: Docker Hub

**Configuration**:
```
PRIVATE_REGISTRY: docker.io
PRIVATE_REGISTRY_USERNAME: mydockerhubuser
PRIVATE_REGISTRY_PASSWORD: mydockerhubtoken
```

**Get Docker Hub Token**:
1. Login to [Docker Hub](https://hub.docker.com/)
2. Go to Account Settings → Security
3. Create Access Token
4. Use Token as password (don't use account password)

### K8s Cluster Configuration (Optional)

If automatic deployment to K8s in GitHub Actions is needed, configure the following Secrets:

#### Required Configuration

- `K8S_SERVER`: K8s API server address
  - Format: `https://kubernetes.example.com:6443`
  - Get method: `kubectl cluster-info` or contact cluster administrator

- `K8S_CA_CERT`: K8s CA certificate (base64 encoded)
  - Get method:
    ```bash
    # Get from kubeconfig file
    kubectl config view --raw -o jsonpath='{.clusters[0].cluster.certificate-authority-data}'
    
    # Or get from certificate file
    cat /path/to/ca.crt | base64 -w 0
    ```

- `K8S_TOKEN`: K8s access token
  - Get method:
    ```bash
    # Get from kubeconfig file
    kubectl config view --raw -o jsonpath='{.users[0].user.token}'
    
    # Or create ServiceAccount Token
    kubectl create serviceaccount github-actions -n btc-shopflow
    kubectl create clusterrolebinding github-actions-binding \
      --clusterrole=cluster-admin \
      --serviceaccount=btc-shopflow:github-actions
    kubectl get secret -n btc-shopflow -o jsonpath='{.items[?(@.metadata.annotations.kubernetes\.io/service-account\.name=="github-actions")].data.token}' | base64 -d
    ```

#### Optional Configuration

- `K8S_NAMESPACE`: K8s namespace
  - Default: `btc-shopflow`
  - If using other namespace, set this Secret

## Configuration Steps

### Step 1: Go to GitHub Secrets Settings

1. Open GitHub repository
2. Click Settings
3. Click Secrets and variables → Actions
4. Click New repository secret

### Step 2: Add Secrets

Follow the configuration instructions above to add required Secrets one by one.

**Secret Naming Rules**:
- Must use uppercase letters and underscores
- Example: `PRIVATE_REGISTRY`, `K8S_SERVER`

### Step 3: Verify Configuration

1. Push code to `develop` branch
2. View GitHub Actions page
3. Check if workflow runs successfully
4. View build logs to confirm image push succeeded

## Verify Configuration

### Verify Image Registry Configuration

Look for in GitHub Actions logs:
```
✅ Image push succeeded: <registry>/<app-name>:<tag>
```

If you see errors:
- `unauthorized`: Check `PRIVATE_REGISTRY_USERNAME` and `PRIVATE_REGISTRY_PASSWORD`
- `connection refused`: Check if `PRIVATE_REGISTRY` address is correct, network reachable

### Verify K8s Configuration

Look for in GitHub Actions logs:
```
✅ Deployment verification succeeded: X/Y Pods ready
```

If you see errors:
- `Unable to connect to the server`: Check `K8S_SERVER` address
- `Unauthorized`: Check if `K8S_TOKEN` is valid
- `certificate signed by unknown authority`: Check if `K8S_CA_CERT` is correct

## Common Issues

### Q1: Do I need to configure Secrets when using GHCR?

**A**: No. GitHub Actions automatically uses `GITHUB_TOKEN` and `github.actor`, no additional configuration needed.

### Q2: Private registry doesn't require authentication, do I still need to set username and password?

**A**: No. Leave `PRIVATE_REGISTRY_USERNAME` and `PRIVATE_REGISTRY_PASSWORD` empty.

### Q3: How to test private registry connection?

**A**: Execute locally:
```bash
docker login <PRIVATE_REGISTRY>
docker pull alpine:latest
docker tag alpine:latest <PRIVATE_REGISTRY>/alpine:test
docker push <PRIVATE_REGISTRY>/alpine:test
```

### Q4: K8s Token expired, what to do?

**A**: Regenerate Token and update GitHub Secret:
```bash
# Recreate ServiceAccount Token
kubectl delete secret -n btc-shopflow github-actions-token
kubectl create secret generic github-actions-token \
  --from-literal=token=<new-token> \
  -n btc-shopflow
```

### Q5: Can I support multiple image registries simultaneously?

**A**: Currently workflow only supports one image registry. If you need to use multiple registries, you can:
1. Modify workflow file, add conditional logic
2. Or use different workflow files

### Q6: How to view currently configured Secrets?

**A**: GitHub Secrets are encrypted, cannot directly view values. But you can:
1. View GitHub Actions logs (values will be hidden)
2. Use same configuration when testing locally

## Security Recommendations

1. **Use Tokens Instead of Passwords**:
   - Docker Hub: Use Access Token
   - K8s: Use ServiceAccount Token
   - Regularly rotate Tokens

2. **Principle of Least Privilege**:
   - K8s ServiceAccount only grants necessary permissions
   - Don't use `cluster-admin` (unless necessary)

3. **Protect Secrets**:
   - Don't commit Secrets to code repository
   - Regularly review and update Secrets
   - Use environment-specific Secrets (e.g., development, production)

## Configuration Checklist

- [ ] `PRIVATE_REGISTRY` is set (or leave empty to use GHCR)
- [ ] `PRIVATE_REGISTRY_USERNAME` is set (if needed)
- [ ] `PRIVATE_REGISTRY_PASSWORD` is set (if needed)
- [ ] `K8S_SERVER` is set (if automatic deployment is needed)
- [ ] `K8S_CA_CERT` is set (if automatic deployment is needed)
- [ ] `K8S_TOKEN` is set (if automatic deployment is needed)
- [ ] `K8S_NAMESPACE` is set (optional, default: btc-shopflow)
- [ ] Image registry connection tested
- [ ] K8s connection tested (if needed)

---

**Related Documentation**:
- [K8s Incremental Deployment Guide](./k8s-incremental-deployment.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
