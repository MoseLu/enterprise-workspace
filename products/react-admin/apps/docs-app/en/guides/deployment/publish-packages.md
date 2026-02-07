---
title: Publish Shared Component Libraries to Verdaccio
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
sidebar_label: Publish Packages
sidebar_order: 8
sidebar_group: deployment
---

# Publish Shared Component Libraries to Verdaccio

## Overview

This document explains how to publish the project's shared component libraries to Verdaccio private registry.

## Shared Component Library List

The project contains the following shared component libraries (in dependency order):

1. **@btc/shared-utils** - Shared utilities library (base, no internal dependencies)
2. **@btc/shared-core** - Shared core library (depends on shared-utils)
3. **@btc/subapp-manifests** - Sub-application manifest configuration
4. **@btc/vite-plugin** - Vite plugin collection
5. **@btc/shared-components** - Shared components library (depends on shared-core, shared-utils, subapp-manifests)

## Pre-publication Preparation

### 1. Ensure Verdaccio is Running

```powershell
# Windows
.\scripts\start-verdaccio.ps1

# Linux/Mac
./scripts/start-verdaccio.sh
```

### 2. Login to Verdaccio

```bash
npm login --registry http://localhost:4873
```

Enter username, password, and email.

### 3. Build All Packages

```bash
# Build all shared packages
pnpm --filter "@btc/shared-utils" build
pnpm --filter "@btc/shared-core" build
pnpm --filter "@btc/subapp-manifests" build
pnpm --filter "@btc/vite-plugin" build
pnpm --filter "@btc/shared-components" build
```

Or use project script:

```bash
pnpm run predev:all
```

## Publication Process

### Method 1: Use Auto-publish Script (Recommended)

```powershell
# Windows
.\scripts\publish-to-verdaccio.ps1
```

The script will automatically:
1. Check if Verdaccio is running
2. Check login status
3. Build all packages
4. Publish all packages in dependency order

### Method 2: Manual Publication

Publish one by one in dependency order:

```bash
# 1. Publish shared-utils (base package)
cd packages/shared-utils
npm publish --registry http://localhost:4873

# 2. Publish shared-core
cd ../shared-core
npm publish --registry http://localhost:4873

# 3. Publish subapp-manifests
cd ../subapp-manifests
npm publish --registry http://localhost:4873

# 4. Publish vite-plugin
cd ../vite-plugin
npm publish --registry http://localhost:4873

# 5. Publish shared-components
cd ../shared-components
npm publish --registry http://localhost:4873
```

## Dependency Relationship Notes

### Workspace Dependency Handling

During publication, `workspace:*` dependencies are converted to `peerDependencies`, and using projects need to install these dependencies themselves.

For example, `@btc/shared-components` dependency relationships:

```json
{
  "peerDependencies": {
    "@btc/shared-core": "^1.0.0",
    "@btc/shared-utils": "^1.0.0",
    "@btc/subapp-manifests": "^0.0.1"
  }
}
```

### Using Published Packages

When using published packages in a project, you need to install all peerDependencies:

```bash
pnpm add @btc/shared-components @btc/shared-core @btc/shared-utils @btc/subapp-manifests
```

## Version Management

### Version Number Notes

**Verdaccio does not automatically set version numbers**, version numbers are determined by the `version` field in each package's `package.json`. Before publishing a new version, you need to manually update the version number.

### Update Version Number

#### Method 1: Use Batch Update Script (Recommended)

The project provides a script to batch update all package version numbers:

**Windows (PowerShell):**
```powershell
# Update patch version (1.0.0 -> 1.0.1)
.\scripts\version-packages.ps1 patch

# Update minor version (1.0.0 -> 1.1.0)
.\scripts\version-packages.ps1 minor

# Update major version (1.0.0 -> 2.0.0)
.\scripts\version-packages.ps1 major

# Use custom version number
.\scripts\version-packages.ps1 patch 1.0.5
```

**Linux/Mac (Bash):**
```bash
# Add execute permission (first run)
chmod +x scripts/version-packages.sh

# Update patch version
./scripts/version-packages.sh patch

# Update minor version
./scripts/version-packages.sh minor

# Update major version
./scripts/version-packages.sh major

# Use custom version number
./scripts/version-packages.sh patch 1.0.5
```

The script automatically updates all package version numbers in dependency order.

#### Method 2: Manually Update Single Package

```bash
# Navigate to package directory
cd packages/shared-components

# Use pnpm version command
pnpm version patch  # 1.0.0 -> 1.0.1
pnpm version minor  # 1.0.0 -> 1.1.0
pnpm version major  # 1.0.0 -> 2.0.0

# Or directly edit package.json
```

#### Version Number Type Notes

- **patch** (Patch version): Bug fixes, backward compatible (1.0.0 -> 1.0.1)
- **minor** (Minor version): New features, backward compatible (1.0.0 -> 1.1.0)
- **major** (Major version): Breaking changes, may be incompatible (1.0.0 -> 2.0.0)
- **prepatch/preminor/premajor**: Pre-release versions (1.0.0 -> 1.0.1-0)

### Publish New Version Process

1. **Update Version Number**
   ```bash
   # Use script to batch update
   .\scripts\version-packages.ps1 patch
   ```

2. **Build All Packages**
   ```bash
   pnpm run predev:all
   ```

3. **Publish to Verdaccio**
   ```bash
   # Use publish script
   .\scripts\publish-with-pnpm.ps1
   ```

### Version Number Consistency

It's recommended to keep related package version numbers synchronized, especially:
- `@btc/shared-utils`, `@btc/shared-core`, `@btc/shared-components` usually maintain the same major version number
- `@btc/subapp-manifests` and `@btc/vite-plugin` can have independent version numbers

## Verify Publication

### View Published Packages

Access Verdaccio Web UI: http://localhost:4873

### Test Installation

Test installation in another project:

```bash
# Create test project
mkdir test-package && cd test-package
pnpm init

# Configure .npmrc
echo "@btc:registry=http://localhost:4873" >> .npmrc

# Install packages
pnpm add @btc/shared-components @btc/shared-core @btc/shared-utils @btc/subapp-manifests
```

## Common Issues

### 1. Publication Failed: 401 Unauthorized

- Ensure you're logged in: `npm whoami --registry http://localhost:4873`
- Re-login: `npm login --registry http://localhost:4873`

### 2. Publication Failed: Package Already Exists

- Update version number: `npm version patch`
- Or use `--force` to force publish (not recommended)

### 3. Dependencies Not Found

- Ensure publishing in dependency order
- Check if peerDependencies are correctly configured
- Ensure dependency packages have been published to private registry

### 4. Build Failed

- Check TypeScript type errors
- Ensure all dependencies are installed: `pnpm install`
- Check build script configuration

## Maintenance Recommendations

1. **Version Consistency**: Keep related package version numbers synchronized
2. **Dependency Management**: Regularly check and update peerDependencies
3. **Documentation Updates**: Update README and changelog when publishing new versions
4. **Test Verification**: Verify package functionality in test projects before publishing
