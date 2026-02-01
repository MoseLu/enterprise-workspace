---
title: Quick Setup Guide - LAN Access to Documentation Center
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-10-14'
updated: '2025-10-14'
publish: true
tags:
- overview
- setup
- network
sidebar_label: Quick Setup
sidebar_order: 2
sidebar_group: guides
---

# Quick Setup Guide - LAN Access to Documentation Center

## Problem

Currently, the documentation center can only be accessed via `localhost:8080` and cannot be accessed from other devices on the LAN.

## Solution

### 1. Modify Vite Configuration

Modify server configuration in main application's `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0',  // Allow external access
    port: 8080,
    strictPort: true
  }
})
```

### 2. Modify VitePress Configuration

Modify server configuration in documentation site's `.vitepress/config.ts`:

```typescript
export default defineConfig({
  vite: {
    server: {
      host: '0.0.0.0',  // Allow external access
      port: 8085,
      strictPort: true
    }
  }
})
```

### 3. Firewall Settings

Ensure Windows Firewall allows the following ports:
- `8080` - Main application port
- `8085` - Documentation site port

### 4. Network Access

After configuration, access via the following addresses:
- Main Application: `http://[your-IP]:8080`
- Documentation Center: `http://[your-IP]:8080/docs`
- Documentation Site: `http://[your-IP]:8085`

## Verification Steps

1. **Check Configuration**: Confirm configuration files are correctly modified
2. **Restart Service**: Restart development server
3. **Test Access**: Test access from other devices
4. **Check Network**: Confirm network connection is normal

## Common Issues

### Issue 1: Cannot Access
- **Check IP Address**: Confirm using correct IP address
- **Check Firewall**: Ensure firewall allows port access
- **Check Service Status**: Confirm service is running

### Issue 2: Port Conflict
- **Check Port Occupancy**: `netstat -ano | findstr :8080`
- **Modify Port**: Specify other port in configuration
- **Terminate Process**: Terminate process occupying the port

## Security Notes

1. **Development Environment**: This configuration is only for development environment
2. **Production Environment**: Production environment requires stricter security configuration
3. **Access Control**: Consider adding access control mechanisms
4. **Network Security**: Pay attention to network security and firewall settings

---

**Applicable Environment**: Development Environment
**Security Level**: Low (development use only)
**Maintenance Team**: Development Team
