---
title: Start Development Environment
type: sop
project: development
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- sop
- development
- environment
sidebar_label: Start Development Environment
sidebar_order: 1
sidebar_group: sop-development
---

# Start Development Environment

## Prerequisites
- Node.js >= 18 installed
- pnpm >= 8 installed

## Operation Steps

### 1. Install Dependencies
```bash
cd btc-shopflow-monorepo
pnpm install
```

### 2. Start Main Application (Required)
```bash
pnpm --filter admin-app dev
```

### 3. Start Sub-Applications (As Needed)
```bash
# Open new terminal window
pnpm --filter logistics-app dev
pnpm --filter engineering-app dev
pnpm --filter quality-app dev
pnpm --filter production-app dev
```

## Verification
Access http://localhost:8080 should see main application interface

## Failure Rollback
If startup fails:
1. Delete all node_modules: `pnpm clean`
2. Reinstall: `pnpm install`
3. Check if ports are occupied
