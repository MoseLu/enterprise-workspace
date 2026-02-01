---
title: Environment Installation
sidebar_label: Environment Installation
sidebar_order: 1
---

# Environment Installation Guide

## Prerequisites

### Node.js Version
- **Recommended Version**: Node.js >= 18.0.0
- **Minimum Version**: Node.js >= 16.0.0

### Package Manager
- **Recommended**: pnpm >= 8.0.0
- **Install**: `npm install -g pnpm`

### Other Tools
- Git >= 2.0.0
- Code editor (VS Code recommended)

## Installation Steps

### 1. Clone Project

```bash
git clone <repository-url>
cd btc-shopflow-monorepo
```

### 2. Install Dependencies

```bash
# Install all dependencies (including all applications and shared packages)
pnpm install
```

### 3. Environment Variables Configuration

Copy environment variable template files:

```bash
# Main application
cp apps/main-app/.env.example apps/main-app/.env

# Sub-applications (as needed)
cp apps/admin-app/.env.example apps/admin-app/.env
```

Edit `.env` files and configure necessary environment variables.

### 4. Verify Installation

```bash
# Check Node version
node --version

# Check pnpm version
pnpm --version

# Check dependency installation
pnpm list --depth=0
```

## Common Issues

### Dependency Installation Failed
- Clear cache: `pnpm store prune`
- Delete `node_modules` and `pnpm-lock.yaml`, reinstall

### Port Conflicts
- Modify port configuration in each application's `vite.config.ts`

### Permission Issues (Windows)
- Run terminal as administrator
- Or use Git Bash

## Next Steps

After installation, please check:

- [Start Project](./quick-start.md) - Start project
- [Project Structure](./project-structure.md) - Understand directory structure
