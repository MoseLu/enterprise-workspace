---
title: Deployment Guide
type: guide
project: deployment
owner: dev-team
created: 2025-10-13
updated: 2025-01-27
publish: true
tags:
- guides
- deployment
- production
sidebar_label: Deployment Guide
sidebar_order: 1
sidebar_group: guides
---

# Deployment Guide

This section contains all deployment-related documentation covering Docker deployment, static file deployment, K8s deployment, Nginx configuration, etc.

## Deployment Documentation List

### Basic Deployment
- **[CORS Configuration](./cors-config.md)** - Cross-Origin Resource Sharing configuration guide
- **[Static Deployment](./static-deployment.md)** - Deploy static files to Baota Panel
- **[Reverse Proxy Architecture](./reverse-proxy-architecture.md)** - Container reverse proxy architecture guide

### Containerized Deployment
- **[K8s Incremental Deployment](./k8s-incremental-deployment.md)** - Kubernetes incremental build and deployment guide
- **[GitHub Actions K8s Setup](./github-actions-k8s-setup.md)** - GitHub Actions automatic deployment to K8s

### Network Configuration
- **[Nginx Subdomain Proxy](./nginx-subdomain-proxy.md)** - Nginx subdomain reverse proxy configuration
- **[Subdomain Layout Integration](./subdomain-layout-integration.md)** - Use main application Layout when accessing via subdomain

### Package Management
- **[Package Publishing](./publish-packages.md)** - Publish shared component library to Verdaccio
- **[Verdaccio Quick Start](./quick-start-verdaccio.md)** - Verdaccio private repository quick start guide

### Other Configuration
- **[EPS Sharing Solution](./eps-sharing-solution.md)** - EPS service sharing solution
- **[Icon CDN Setup](./icons-cdn-setup.md)** - Icon file CDN configuration guide

## Quick Navigation

### Development Environment Deployment
1. Check [Quick Start Guide](../getting-started.md) for development environment configuration
2. Refer to [Static Deployment](./static-deployment.md) for local test deployment

### Production Environment Deployment
1. **Docker Deployment**: Refer to [K8s Incremental Deployment](./k8s-incremental-deployment.md) or [Reverse Proxy Architecture](./reverse-proxy-architecture.md)
2. **Static Deployment**: Refer to [Static Deployment](./static-deployment.md)
3. **Nginx Configuration**: Refer to [Nginx Subdomain Proxy](./nginx-subdomain-proxy.md)

### CI/CD Deployment
1. Configure GitHub Actions: Refer to [GitHub Actions K8s Setup](./github-actions-k8s-setup.md)
2. Set up Secrets and variables
3. Push code to automatically trigger deployment

## Deployment Method Comparison

| Deployment Method | Use Cases | Advantages | Disadvantages |
|---------|---------|------|------|
| **Docker Deployment** | Production environments, need environment consistency | Consistent environment, easy to scale | Higher resource usage |
| **Static Deployment** | Pure frontend applications, quick deployment | Fast deployment, low resource usage | Depends on server environment |
| **K8s Deployment** | Large-scale production environments | Auto-scaling, rolling updates | Complex configuration |

## Related Documentation

- [Application Overview](../apps-overview.md) - Understand ports and configuration for each application
- [Project Overview](/en/quick-start/project-overview) - Understand overall project architecture
- [Development Guide](../getting-started.md) - Development environment configuration

---

**Last Updated**: 2025-01-27
**Maintenance Team**: Development Team
