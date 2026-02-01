---
title: Verdaccio Quick Start Guide
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-01-27'
updated: '2025-01-27'
publish: true
tags:
- guides
- deployment
- verdaccio
- npm
sidebar_label: Verdaccio Quick Start
sidebar_order: 9
sidebar_group: deployment
---

# Verdaccio Quick Start Guide

## Current Status

**These packages cannot be used via npm yet**, you need to complete the following steps first.

> **Tip**: It's recommended to use shell scripts (`.sh`) to avoid PowerShell encoding issues. On Windows, you can use Git Bash to run them.

## Complete Setup Process

### Step 1: Start Verdaccio

**Using shell script (recommended, avoids encoding issues):**

Run in Git Bash or Linux/Mac terminal:
```bash
# Linux/Mac need to add execute permission first
chmod +x scripts/start-verdaccio.sh
./scripts/start-verdaccio.sh

# Windows Git Bash can run directly
bash scripts/start-verdaccio.sh
```

**Or using PowerShell script:**
```powershell
.\scripts\start-verdaccio.ps1
```

The service will start at `http://localhost:4873`.

### Step 2: Create User and Login

Run in a new terminal window:

```bash
npm adduser --registry http://localhost:4873
```

Enter:
- Username: (your username)
- Password: (your password)
- Email: (your email)

Or if you already have a user:

```bash
npm login --registry http://localhost:4873
```

### Step 3: Build All Shared Component Libraries

```bash
# Build all shared packages
pnpm run predev:all
```

Or build separately:

```bash
pnpm --filter "@btc/shared-utils" build
pnpm --filter "@btc/shared-core" build
pnpm --filter "@btc/subapp-manifests" build
pnpm --filter "@btc/vite-plugin" build
pnpm --filter "@btc/shared-components" build
```

### Step 4: Publish All Packages

**Using shell script (recommended, avoids encoding issues):**

Run in Git Bash or Linux/Mac terminal:
```bash
# Linux/Mac need to add execute permission first
chmod +x scripts/publish-to-verdaccio.sh
./scripts/publish-to-verdaccio.sh

# Windows Git Bash can run directly
bash scripts/publish-to-verdaccio.sh
```

**Or using PowerShell script:**
```powershell
.\scripts\publish-to-verdaccio.ps1
```

The script will automatically:
- Check if Verdaccio is running
- Check login status
- Build all packages
- Publish all packages in dependency order

### Step 5: Verify Publication

**Using shell script (recommended, avoids encoding issues):**

Run in Git Bash or Linux/Mac terminal:
```bash
# Linux/Mac need to add execute permission first
chmod +x scripts/check-verdaccio-status.sh
./scripts/check-verdaccio-status.sh

# Windows Git Bash can run directly
bash scripts/check-verdaccio-status.sh
```

**Or using PowerShell script:**
```powershell
.\scripts\check-verdaccio-status.ps1
```

Or access Web UI: http://localhost:4873

## Using Published Packages

After publication is complete, you can use them in any project:

### 1. Configure .npmrc

Create or update `.npmrc` in project root:

```
@btc:registry=http://localhost:4873
```

### 2. Install Packages

```bash
pnpm add @btc/shared-components @btc/shared-core @btc/shared-utils @btc/subapp-manifests @btc/vite-plugin
```

### 3. Use Packages

```typescript
import { BtcCrud } from '@btc/shared-components';
import { usePluginManager } from '@btc/shared-core';
```

## Check Current Status

Run the check script to view current status:

**Using shell script (recommended, avoids encoding issues):**

Run in Git Bash or Linux/Mac terminal:
```bash
# Linux/Mac
chmod +x scripts/check-verdaccio-status.sh
./scripts/check-verdaccio-status.sh

# Windows Git Bash
bash scripts/check-verdaccio-status.sh
```

**Or using PowerShell script:**
```powershell
.\scripts\check-verdaccio-status.ps1
```

## Common Issues

### Q: How to know if packages are published?

A: Run the check script or access http://localhost:4873 to view Web UI.

### Q: What to do if publication fails?

A: 
1. Ensure Verdaccio is running
2. Ensure you're logged in
3. Ensure all packages are built (have dist directory)
4. Check package dependency order (publish base packages first)

### Q: How to use in other projects?

A: 
1. Configure `.npmrc` to add `@btc:registry=http://localhost:4873`
2. Ensure Verdaccio service is accessible (if for team use, need to deploy to server)
3. Install packages: `pnpm add @btc/shared-components`

## Next Steps

After completing the above steps, all `@btc/*` packages can be normally installed and used via npm/pnpm.
