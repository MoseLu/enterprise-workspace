---
title: Icon Files CDN Configuration Guide
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-01-27'
updated: '2025-01-27'
publish: true
tags:
- guides
- deployment
- cdn
- oss
sidebar_label: Icons CDN Setup
sidebar_order: 5
sidebar_group: deployment
---

# Icon Files CDN Configuration Guide

## Overview

The project is configured to serve icon files (`icons/` directory and `logo.png`) through Alibaba Cloud OSS and CDN. Uses file fingerprinting mechanism, only uploads when files change, avoiding unnecessary upload operations.

## Configuration Requirements

### Environment Variable Configuration (Using .env.oss File)

**Recommended Method**: Use `.env.oss` file to store sensitive information, this file is ignored by `.gitignore` and will not be committed to the code repository.

1. **Create Configuration File**:
   ```bash
   # Copy example file
   cp .env.oss.example .env.oss
   
   # Or using PowerShell
   Copy-Item .env.oss.example .env.oss
   ```

2. **Edit `.env.oss` file**, fill in actual key information:
   ```properties
   OSS_ACCESS_KEY_ID=your_access_key_id
   OSS_ACCESS_KEY_SECRET=your_access_key_secret
   OSS_REGION=oss-cn-shenzhen          # Optional, default: oss-cn-shenzhen
   OSS_BUCKET=bellis1                  # Optional, default: bellis1
   CDN_STATIC_ASSETS_URL=https://all.bellis.com.cn  # Optional, default: https://all.bellis.com.cn
   ```

3. **Use Script to Load Environment Variables** (Recommended):
   ```powershell
   # PowerShell
   . .\scripts\set-oss-env.ps1
   pnpm build:layout
   
   # Windows CMD
   scripts\set-oss-env.bat
   pnpm build:layout
   ```

**Alternative Method**: Directly set environment variables in command line (only valid for current session):
```powershell
# PowerShell
$env:OSS_ACCESS_KEY_ID = "your_access_key_id"
$env:OSS_ACCESS_KEY_SECRET = "your_access_key_secret"
pnpm build:layout
```

**Note**: `.env.oss` file contains sensitive information, is ignored by `.gitignore`, and will not be committed to the code repository.

### CDN Configuration

CDN Domain: `https://all.bellis.com.cn`
- Origin: `bellis1.oss-cn-shenzhen.aliyuncs.com`
- Acceleration Region: Mainland China
- Business Type: Image small files

## Workflow

### 1. Build layout-app

When building layout-app (production environment):

1. **Copy Icon Files**: `copyIconsPlugin` copies `public/icons/` and `logo.png` to `dist/` directory (for local development and fallback solution)

2. **Upload to OSS**: `uploadIconsToOssPlugin` automatically executes after build completion:
   - Calculate MD5 hash value for each file
   - Check ETag of corresponding file in OSS (Alibaba Cloud OSS ETag is file MD5)
   - Only upload when file hash values differ
   - Upload to OSS paths:
     - `icons/favicon-32x32.png`
     - `icons/favicon-16x16.png`
     - `icons/apple-touch-icon.png`
     - `icons/android-chrome-192x192.png`
     - `icons/android-chrome-512x512.png`
     - `logo.png`

### 2. Build Other Applications

When building other applications (admin-app, system-app, logistics-app, etc.):

1. **No Longer Copy Icon Files**: Removed `copyIconsPlugin` and `copyLogoPlugin`

2. **Replace Icon Paths**: `replaceIconsWithCdnPlugin` automatically replaces icon paths in `index.html` with CDN URLs during build:
   - `/logo.png` → `https://all.bellis.com.cn/logo.png`
   - `/icons/favicon-32x32.png` → `https://all.bellis.com.cn/icons/favicon-32x32.png`
   - etc...

### 3. Runtime Logo URL Resolution

`resolveAppLogoUrl()` function automatically returns the correct URL based on environment:
- **Production Environment**: Returns CDN URL (`https://all.bellis.com.cn/logo.png`)
- **Development/Preview Environment**: Returns local path (`/logo.png`)

## File Structure

### File Structure in OSS

```
bellis1 (OSS Bucket)
├── icons/
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   └── ...
└── logo.png
```

### CDN Access Paths

- `https://all.bellis.com.cn/logo.png`
- `https://all.bellis.com.cn/icons/favicon-32x32.png`
- `https://all.bellis.com.cn/icons/favicon-16x16.png`
- etc...

## Manual Upload (If Needed)

If you need to manually upload icon files outside the build process:

```bash
# Set environment variables
export OSS_ACCESS_KEY_ID=your_access_key_id
export OSS_ACCESS_KEY_SECRET=your_access_key_secret

# Execute upload script
node scripts/upload-icons-to-oss.mjs
```

The script will automatically:
- Check if files exist and have the same hash value
- Only upload changed files
- Display upload progress and results

## Notes

1. **CDN Cache**: After file updates, CDN cache may take time to refresh. If icon files are updated, you may need to:
   - Wait for CDN cache to expire (long-term cache configured)
   - Or manually refresh cache in Alibaba Cloud CDN console

2. **Fallback Solution**: If CDN is unavailable, layout-app build artifacts still contain icon files, can serve as fallback solution

3. **Development Environment**: Development environment does not use CDN, continues to use local paths to ensure development experience

4. **File Fingerprinting**: Uses MD5 hash value to determine if files changed, ensuring only truly changed files are uploaded

## Related Files

- `scripts/upload-icons-to-oss.mjs` - OSS upload script
- `configs/vite/plugins/upload-icons-to-oss.ts` - Vite upload plugin
- `configs/vite/plugins/replace-icons-with-cdn.ts` - Icon path replacement plugin
- `configs/unified-env-config.ts` - CDN URL configuration
- `configs/layout-bridge.ts` - Logo URL resolution function
