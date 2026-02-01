#!/usr/bin/env node

/**
 * 为关键架构部分生成 CHANGELOG.md 和 README.md 模板
 * 
 * 使用方式：
 *   node scripts/commands/tools/generate-docs-template.mjs <path> [--type app|package|directory]
 * 
 * 例如：
 *   node scripts/commands/tools/generate-docs-template.mjs apps/main-app --type app
 *   node scripts/commands/tools/generate-docs-template.mjs packages/shared-core --type package
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../../..');

const args = process.argv.slice(2);
const targetPath = args[0];
const typeArg = args.find(arg => arg.startsWith('--type='));
const type = typeArg ? typeArg.split('=')[1] : 'auto';

if (!targetPath) {
  console.error('❌ 请提供目标路径');
  console.log('使用方式: node scripts/commands/tools/generate-docs-template.mjs <path> [--type=app|package|directory]');
  process.exit(1);
}

const fullPath = join(rootDir, targetPath);

if (!existsSync(fullPath)) {
  console.error(`❌ 路径不存在: ${fullPath}`);
  process.exit(1);
}

// 自动检测类型
function detectType(path) {
  if (path.includes('/apps/') || path.includes('\\apps\\')) {
    return 'app';
  }
  if (path.includes('/packages/') || path.includes('\\packages\\')) {
    return 'package';
  }
  return 'directory';
}

const docType = type === 'auto' ? detectType(fullPath) : type;
const name = basename(fullPath);

// CHANGELOG 模板
function generateChangelogTemplate(name, type) {
  return `# 更新日志

本文档记录 ${name} 的所有重要变更。版本号遵循[语义化版本规范](https://semver.org/lang/zh-CN/)。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

## [未发布]

### 变更
- 待添加变更记录

---

## 变更类型说明

- **新增**: 新功能
- **变更**: 现有功能的变更
- **废弃**: 即将移除的功能
- **移除**: 已移除的功能
- **修复**: Bug 修复
- **安全**: 安全相关的修复
- **重构**: 代码重构，不改变功能
- **性能**: 性能优化
- **文档**: 文档更新

## 相关链接

- [项目根目录 CHANGELOG](../../../CHANGELOG.md)
- [版本发布指南](../../../docs/development/version-release-guide.md)
`;
}

// README 模板
function generateReadmeTemplate(name, type) {
  const isApp = type === 'app';
  const isPackage = type === 'package';
  
  let template = `# ${name}

`;
  
  if (isApp) {
    template += `## 📋 应用概述

简要描述此应用的功能和用途。

## 🏗️ 架构说明

### 技术栈
- Vue 3 + TypeScript
- Vite
- Pinia
- Element Plus
- @btc/shared-components
- @btc/shared-core

### 目录结构

\`\`\`
${name}/
├── src/
│   ├── modules/          # 业务模块
│   ├── plugins/          # 应用插件
│   ├── bootstrap/        # 启动配置
│   ├── router/           # 路由配置
│   ├── locales/          # 国际化
│   └── main.ts          # 入口文件
├── public/               # 静态资源
├── package.json
└── vite.config.ts
\`\`\`

## 🚀 快速开始

### 安装依赖

\`\`\`bash
pnpm install
\`\`\`

### 开发模式

\`\`\`bash
pnpm dev
\`\`\`

### 构建

\`\`\`bash
pnpm build
\`\`\`

## 📦 依赖说明

### 核心依赖
- \`@btc/shared-core\` - 核心业务逻辑
- \`@btc/shared-components\` - 共享组件库

### 开发依赖
- \`vite\` - 构建工具
- \`vue\` - 前端框架

## 🔧 配置说明

### 环境变量

\`\`\`env
# 应用端口
VITE_PORT=8080

# API 地址
VITE_API_BASE_URL=http://localhost:3000
\`\`\`

## 📚 相关文档

- [开发指南](../../../docs/development/app-development.md)
- [组件文档](../../../packages/shared-components/README.md)
- [CHANGELOG](./CHANGELOG.md)
`;
  } else if (isPackage) {
    template += `## 📦 包概述

简要描述此包的功能和用途。

## 🚀 安装

\`\`\`bash
pnpm add @btc/${name}
\`\`\`

## 📖 使用指南

### 基本使用

\`\`\`typescript
import { /* 导出内容 */ } from '@btc/${name}';
\`\`\`

## 📚 API 文档

### 主要导出

- \`export1\` - 功能描述
- \`export2\` - 功能描述

## 🏗️ 架构设计

### 核心概念

说明包的核心设计理念和架构。

### 目录结构

\`\`\`
${name}/
├── src/
│   ├── index.ts         # 主入口
│   └── ...
├── package.json
└── README.md
\`\`\`

## 🔧 开发

### 构建

\`\`\`bash
pnpm build
\`\`\`

### 测试

\`\`\`bash
pnpm test
\`\`\`

## 📚 相关文档

- [项目根目录 README](../../../README.md)
- [CHANGELOG](./CHANGELOG.md)
`;
  } else {
    template += `## 📋 目录概述

简要描述此目录的功能和用途。

## 📂 目录结构

\`\`\`
${name}/
├── ...
\`\`\`

## 📚 相关文档

- [项目根目录 README](../../README.md)
- [CHANGELOG](./CHANGELOG.md)
`;
  }
  
  return template;
}

// 生成文档
try {
  const changelogPath = join(fullPath, 'CHANGELOG.md');
  const readmePath = join(fullPath, 'README.md');
  
  let created = [];
  
  // 生成 CHANGELOG
  if (!existsSync(changelogPath)) {
    const changelogContent = generateChangelogTemplate(name, docType);
    writeFileSync(changelogPath, changelogContent, 'utf-8');
    created.push('CHANGELOG.md');
    console.log(`✅ 已创建: ${changelogPath}`);
  } else {
    console.log(`⏭️  已存在: ${changelogPath}`);
  }
  
  // 生成 README
  if (!existsSync(readmePath)) {
    const readmeContent = generateReadmeTemplate(name, docType);
    writeFileSync(readmePath, readmeContent, 'utf-8');
    created.push('README.md');
    console.log(`✅ 已创建: ${readmePath}`);
  } else {
    console.log(`⏭️  已存在: ${readmePath}`);
  }
  
  if (created.length > 0) {
    console.log(`\n🎉 成功创建 ${created.length} 个文档文件！`);
    console.log(`\n💡 提示: 请根据实际情况编辑这些文档，添加具体内容。`);
  } else {
    console.log(`\n✅ 所有文档已存在，无需创建。`);
  }
} catch (error) {
  console.error(`❌ 生成文档失败:`, error.message);
  process.exit(1);
}
