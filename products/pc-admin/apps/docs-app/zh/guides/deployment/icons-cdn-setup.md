---
title: 图标文件 CDN 配置说明
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
sidebar_label: 图标CDN配置
sidebar_order: 5
sidebar_group: deployment
---

# 图标文件 CDN 配置说明

## 概述

项目已配置图标文件（`icons/` 目录和 `logo.png`）通过阿里云 OSS 和 CDN 提供服务。使用文件指纹机制，只在文件变化时才上传，避免不必要的上传操作。

## 配置要求

### 环境变量配置（使用 .env.oss 文件）

**推荐方式**：使用 `.env.oss` 文件存储敏感信息，该文件已被 `.gitignore` 忽略，不会被提交到代码仓库。

1. **创建配置文件**：
   ```bash
   # 复制示例文件
   cp .env.oss.example .env.oss
   
   # 或使用 PowerShell
   Copy-Item .env.oss.example .env.oss
   ```

2. **编辑 `.env.oss` 文件**，填入实际的密钥信息：
   ```properties
   OSS_ACCESS_KEY_ID=your_access_key_id
   OSS_ACCESS_KEY_SECRET=your_access_key_secret
   OSS_REGION=oss-cn-shenzhen          # 可选，默认: oss-cn-shenzhen
   OSS_BUCKET=bellis1                  # 可选，默认: bellis1
   CDN_STATIC_ASSETS_URL=https://all.bellis.com.cn  # 可选，默认: https://all.bellis.com.cn
   ```

3. **使用脚本加载环境变量**（推荐）：
   ```powershell
   # PowerShell
   . .\scripts\set-oss-env.ps1
   pnpm build:layout
   
   # Windows CMD
   scripts\set-oss-env.bat
   pnpm build:layout
   ```

**替代方式**：直接在命令行设置环境变量（仅当前会话有效）：
```powershell
# PowerShell
$env:OSS_ACCESS_KEY_ID = "your_access_key_id"
$env:OSS_ACCESS_KEY_SECRET = "your_access_key_secret"
pnpm build:layout
```

**注意**：`.env.oss` 文件包含敏感信息，已被 `.gitignore` 忽略，不会被提交到代码仓库。

### CDN 配置

CDN 域名：`https://all.bellis.com.cn`
- 源站：`bellis1.oss-cn-shenzhen.aliyuncs.com`
- 加速区域：中国内地
- 业务类型：图片小文件

## 工作流程

### 1. 构建 layout-app

当构建 layout-app 时（生产环境）：

1. **复制图标文件**：`copyIconsPlugin` 将 `public/icons/` 和 `logo.png` 复制到 `dist/` 目录（用于本地开发和降级方案）

2. **上传到 OSS**：`uploadIconsToOssPlugin` 在构建完成后自动执行：
   - 计算每个文件的 MD5 哈希值
   - 检查 OSS 中对应文件的 ETag（阿里云 OSS 的 ETag 是文件 MD5）
   - 只有文件哈希值不同时才上传
   - 上传到 OSS 路径：
     - `icons/favicon-32x32.png`
     - `icons/favicon-16x16.png`
     - `icons/apple-touch-icon.png`
     - `icons/android-chrome-192x192.png`
     - `icons/android-chrome-512x512.png`
     - `logo.png`

### 2. 构建其他应用

当构建其他应用（admin-app、system-app、logistics-app 等）时：

1. **不再复制图标文件**：已移除 `copyIconsPlugin` 和 `copyLogoPlugin`

2. **替换图标路径**：`replaceIconsWithCdnPlugin` 在构建时自动将 `index.html` 中的图标路径替换为 CDN URL：
   - `/logo.png` → `https://all.bellis.com.cn/logo.png`
   - `/icons/favicon-32x32.png` → `https://all.bellis.com.cn/icons/favicon-32x32.png`
   - 等等...

### 3. 运行时 Logo URL 解析

`resolveAppLogoUrl()` 函数会根据环境自动返回正确的 URL：
- **生产环境**：返回 CDN URL（`https://all.bellis.com.cn/logo.png`）
- **开发/预览环境**：返回本地路径（`/logo.png`）

## 文件结构

### OSS 中的文件结构

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

### CDN 访问路径

- `https://all.bellis.com.cn/logo.png`
- `https://all.bellis.com.cn/icons/favicon-32x32.png`
- `https://all.bellis.com.cn/icons/favicon-16x16.png`
- 等等...

## 手动上传（如果需要）

如果需要在构建流程外手动上传图标文件：

```bash
# 设置环境变量
export OSS_ACCESS_KEY_ID=your_access_key_id
export OSS_ACCESS_KEY_SECRET=your_access_key_secret

# 执行上传脚本
node scripts/upload-icons-to-oss.mjs
```

脚本会自动：
- 检查文件是否已存在且哈希值相同
- 只上传变化的文件
- 显示上传进度和结果

## 注意事项

1. **CDN 缓存**：文件更新后，CDN 缓存可能需要时间刷新。如果更新了图标文件，可能需要：
   - 等待 CDN 缓存过期（已配置长期缓存）
   - 或在阿里云 CDN 控制台手动刷新缓存

2. **降级方案**：如果 CDN 不可用，layout-app 的构建产物中仍包含图标文件，可以作为降级方案

3. **开发环境**：开发环境不使用 CDN，继续使用本地路径，确保开发体验

4. **文件指纹**：使用 MD5 哈希值判断文件是否变化，确保只有真正变化的文件才会上传

## 相关文件

- `scripts/upload-icons-to-oss.mjs` - OSS 上传脚本
- `configs/vite/plugins/upload-icons-to-oss.ts` - Vite 上传插件
- `configs/vite/plugins/replace-icons-with-cdn.ts` - 图标路径替换插件
- `configs/unified-env-config.ts` - CDN URL 配置
- `configs/layout-bridge.ts` - Logo URL 解析函数
