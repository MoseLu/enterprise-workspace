#!/usr/bin/env node

/**
 * 生成文档索引页面
 * 扫描所有应用的 README 和 CHANGELOG 文件，生成索引页面
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../../..');
const docsAppDir = join(rootDir, 'apps/docs-app');
const indexPath = join(docsAppDir, 'zh/quick-start/docs-index.md');

// 关键架构部分
const criticalPaths = {
  apps: {
    mainApp: { path: join(rootDir, 'apps/main-app'), name: '主应用', displayName: '主应用 (main-app)' },
    systemApp: { path: join(rootDir, 'apps/system-app'), name: '系统应用', displayName: '系统应用 (system-app)' },
    layoutApp: { path: join(rootDir, 'apps/layout-app'), name: '布局应用', displayName: '布局应用 (layout-app)' },
    adminApp: { path: join(rootDir, 'apps/admin-app'), name: '管理应用', displayName: '管理应用 (admin-app)' },
    logisticsApp: { path: join(rootDir, 'apps/logistics-app'), name: '物流应用', displayName: '物流应用 (logistics-app)' },
    productionApp: { path: join(rootDir, 'apps/production-app'), name: '生产应用', displayName: '生产应用 (production-app)' },
    qualityApp: { path: join(rootDir, 'apps/quality-app'), name: '品质应用', displayName: '品质应用 (quality-app)' },
    engineeringApp: { path: join(rootDir, 'apps/engineering-app'), name: '工程应用', displayName: '工程应用 (engineering-app)' },
    financeApp: { path: join(rootDir, 'apps/finance-app'), name: '财务应用', displayName: '财务应用 (finance-app)' },
    operationsApp: { path: join(rootDir, 'apps/operations-app'), name: '运营应用', displayName: '运营应用 (operations-app)' },
    personnelApp: { path: join(rootDir, 'apps/personnel-app'), name: '人事应用', displayName: '人事应用 (personnel-app)' },
    dashboardApp: { path: join(rootDir, 'apps/dashboard-app'), name: '仪表盘应用', displayName: '仪表盘应用 (dashboard-app)' },
    homeApp: { path: join(rootDir, 'apps/home-app'), name: '首页应用', displayName: '首页应用 (home-app)' },
    docsApp: { path: join(rootDir, 'apps/docs-app'), name: '文档应用', displayName: '文档应用 (docs-app)' },
  },
  packages: {
    sharedCore: { path: join(rootDir, 'packages/shared-core'), name: '共享核心包', displayName: '@btc/shared-core' },
    sharedComponents: { path: join(rootDir, 'packages/shared-components'), name: '共享组件包', displayName: '@btc/shared-components' },
    sharedRouter: { path: join(rootDir, 'packages/shared-router'), name: '共享路由包', displayName: '@btc/shared-router' },
    vitePlugin: { path: join(rootDir, 'packages/vite-plugin'), name: 'Vite插件包', displayName: '@btc/vite-plugin' },
    designTokens: { path: join(rootDir, 'packages/design-tokens'), name: '设计令牌包', displayName: 'design-tokens' },
  },
  directories: {
    scripts: { path: join(rootDir, 'scripts'), name: '脚本目录', displayName: '脚本目录 (scripts)' },
    configs: { path: join(rootDir, 'configs'), name: '配置目录', displayName: '配置目录 (configs)' },
  },
};

function checkDoc(path, docType) {
  const docPath = join(path, docType);
  return existsSync(docPath);
}

function generateGitHubUrl(relativePath, docType) {
  // 生成 GitHub 链接
  const repoUrl = 'https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop';
  const cleanPath = relativePath ? relativePath.replace(/\\/g, '/') : '';
  const fullPath = cleanPath ? `${cleanPath}/${docType}` : docType;
  return `${repoUrl}/${fullPath}`;
}

function generateIndexContent() {
  let content = `---
title: 文档索引
sidebar_label: 文档索引
sidebar_order: 4
---

# 文档索引

本文档提供了项目中所有应用和共享包的 README 和 CHANGELOG 文档的完整索引。

`;

  // 应用文档
  content += `## 📱 应用文档

### 核心应用

| 应用名称 | README | CHANGELOG |
|---------|--------|-----------|\n`;

  const coreApps = ['mainApp', 'systemApp', 'layoutApp', 'homeApp'];
  for (const key of coreApps) {
    const app = criticalPaths.apps[key];
    if (!existsSync(app.path)) continue;
    
    const relPath = relative(rootDir, app.path);
    const hasReadme = checkDoc(app.path, 'README.md');
    const hasChangelog = checkDoc(app.path, 'CHANGELOG.md');
    
    const readmeLink = hasReadme ? `[README.md](${generateGitHubUrl(relPath, 'README.md')})` : '-';
    const changelogLink = hasChangelog ? `[CHANGELOG.md](${generateGitHubUrl(relPath, 'CHANGELOG.md')})` : '-';
    
    content += `| **${app.displayName}** | ${readmeLink} | ${changelogLink} |\n`;
  }

  content += `\n### 业务应用\n\n| 应用名称 | README | CHANGELOG |\n|---------|--------|-----------|\n`;

  const businessApps = ['adminApp', 'logisticsApp', 'productionApp', 'qualityApp', 'engineeringApp', 'financeApp', 'operationsApp', 'personnelApp', 'dashboardApp'];
  for (const key of businessApps) {
    const app = criticalPaths.apps[key];
    if (!existsSync(app.path)) continue;
    
    const relPath = relative(rootDir, app.path);
    const hasReadme = checkDoc(app.path, 'README.md');
    const hasChangelog = checkDoc(app.path, 'CHANGELOG.md');
    
    const readmeLink = hasReadme ? `[README.md](${generateGitHubUrl(relPath, 'README.md')})` : '-';
    const changelogLink = hasChangelog ? `[CHANGELOG.md](${generateGitHubUrl(relPath, 'CHANGELOG.md')})` : '-';
    
    content += `| **${app.displayName}** | ${readmeLink} | ${changelogLink} |\n`;
  }

  content += `\n### 其他应用\n\n| 应用名称 | README | CHANGELOG |\n|---------|--------|-----------|\n`;

  const otherApps = ['docsApp'];
  for (const key of otherApps) {
    const app = criticalPaths.apps[key];
    if (!existsSync(app.path)) continue;
    
    const relPath = relative(rootDir, app.path);
    const hasReadme = checkDoc(app.path, 'README.md');
    const hasChangelog = checkDoc(app.path, 'CHANGELOG.md');
    
    const readmeLink = hasReadme ? `[README.md](${generateGitHubUrl(relPath, 'README.md')})` : '-';
    const changelogLink = hasChangelog ? `[CHANGELOG.md](${generateGitHubUrl(relPath, 'CHANGELOG.md')})` : '-';
    
    content += `| **${app.displayName}** | ${readmeLink} | ${changelogLink} |\n`;
  }

  // 共享包文档
  content += `\n## 📦 共享包文档\n\n| 包名称 | README | CHANGELOG |\n|-------|--------|-----------|\n`;

  for (const [key, pkg] of Object.entries(criticalPaths.packages)) {
    if (!existsSync(pkg.path)) continue;
    
    const relPath = relative(rootDir, pkg.path);
    const hasReadme = checkDoc(pkg.path, 'README.md');
    const hasChangelog = checkDoc(pkg.path, 'CHANGELOG.md');
    
    const readmeLink = hasReadme ? `[README.md](${generateGitHubUrl(relPath, 'README.md')})` : '-';
    const changelogLink = hasChangelog ? `[CHANGELOG.md](${generateGitHubUrl(relPath, 'CHANGELOG.md')})` : '-';
    
    content += `| **${pkg.displayName}** | ${readmeLink} | ${changelogLink} |\n`;
  }

  // 重要目录文档
  content += `\n## 📂 重要目录文档\n\n| 目录名称 | README | CHANGELOG |\n|---------|--------|-----------|\n`;

  for (const [key, dir] of Object.entries(criticalPaths.directories)) {
    if (!existsSync(dir.path)) continue;
    
    const relPath = relative(rootDir, dir.path);
    const hasReadme = checkDoc(dir.path, 'README.md');
    const hasChangelog = checkDoc(dir.path, 'CHANGELOG.md');
    
    const readmeLink = hasReadme ? `[README.md](${generateGitHubUrl(relPath, 'README.md')})` : '-';
    const changelogLink = hasChangelog ? `[CHANGELOG.md](${generateGitHubUrl(relPath, 'CHANGELOG.md')})` : '-';
    
    content += `| **${dir.displayName}** | ${readmeLink} | ${changelogLink} |\n`;
  }

  // 项目根目录
  const repoUrl = 'https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop';
  content += `\n## 📋 项目根目录\n\n`;
  content += `- [README.md](${repoUrl}/README.md) - 项目总体说明\n`;
  content += `- [CHANGELOG.md](${repoUrl}/CHANGELOG.md) - 项目更新日志（[查看文档版本](/changelog/)）\n`;

  // 使用说明
  content += `\n## 💡 使用说明\n\n`;
  content += `- **README.md**: 包含应用/包的概述、架构说明、快速开始指南和 API 文档\n`;
  content += `- **CHANGELOG.md**: 记录应用/包的版本变更、架构变更、API 变更等\n\n`;
  content += `所有文档遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 和 [Conventional Commits](https://www.conventionalcommits.org/) 规范。\n`;

  return content;
}

try {
  const content = generateIndexContent();
  writeFileSync(indexPath, content, 'utf-8');
  console.log(`✅ 文档索引已生成: ${indexPath}`);
} catch (error) {
  console.error(`❌ 生成文档索引失败:`, error.message);
  process.exit(1);
}
