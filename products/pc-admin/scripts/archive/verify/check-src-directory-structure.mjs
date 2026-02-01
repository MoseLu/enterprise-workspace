#!/usr/bin/env node

/**
 * 检查所有应用的 src 目录结构
 * 确保不会同时存在 pages、views 和 modules 目录
 */

import { readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const appsDir = join(rootDir, 'apps');
const apps = readdirSync(appsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log('检查应用 src 目录结构...\n');

const issues = [];

apps.forEach(appName => {
  const appSrcDir = join(appsDir, appName, 'src');
  
  try {
    if (!statSync(appSrcDir).isDirectory()) {
      return;
    }
  } catch (err) {
    return;
  }
  
  const hasPages = readdirSync(appSrcDir).includes('pages');
  const hasViews = readdirSync(appSrcDir).includes('views');
  const hasModules = readdirSync(appSrcDir).includes('modules');
  
  const issuesForApp = [];
  
  if (hasPages && hasViews && hasModules) {
    issuesForApp.push('同时存在 pages、views 和 modules');
  } else if (hasPages && hasViews) {
    issuesForApp.push('同时存在 pages 和 views');
  } else if (hasPages && hasModules) {
    // pages 和 modules 可以共存（pages 用于孤立页面如 404）
    // 但需要检查是否有其他问题
  } else if (hasViews && hasModules) {
    issuesForApp.push('同时存在 views 和 modules（views 应在 modules 下）');
  }
  
  if (issuesForApp.length > 0) {
    issues.push({
      app: appName,
      hasPages,
      hasViews,
      hasModules,
      issues: issuesForApp
    });
  }
  
  console.log(`${appName.padEnd(20)}: pages=${hasPages ? '✓' : '✗'} views=${hasViews ? '✓' : '✗'} modules=${hasModules ? '✓' : '✗'}`);
});

console.log('\n' + '='.repeat(80));
console.log('问题汇总：\n');

if (issues.length === 0) {
  console.log('✓ 所有应用目录结构正常');
} else {
  issues.forEach(({ app, hasPages, hasViews, hasModules, issues: appIssues }) => {
    console.log(`\n❌ ${app}:`);
    console.log(`   状态: pages=${hasPages}, views=${hasViews}, modules=${hasModules}`);
    appIssues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
  });
}

process.exit(issues.length > 0 ? 1 : 0);
