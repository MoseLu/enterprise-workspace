#!/usr/bin/env node

/**
 * react-admin 构建脚本
 * 支持单个应用构建和批量构建
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 应用列表
const APPS = [
  'admin-app',
  'dashboard-app',
  'docs-app',
  'engineering-app',
  'finance-app',
  'home-app',
  'layout-app',
  'logistics-app',
  'main-app',
  'operations-app',
  'personnel-app',
  'production-app',
  'system-app',
];

// 解析命令行参数
const args = process.argv.slice(2);
const appFilter = args.find((arg) => arg.startsWith('--app='))?.replace('--app=', '');
const buildAll = args.includes('--all');
const appsToBuild = buildAll ? APPS : (appFilter ? [appFilter] : APPS);

console.log('🔨 构建 react-admin 应用...\n');

// 检查应用是否存在
const invalidApps = appsToBuild.filter((app) => !APPS.includes(app));
if (invalidApps.length > 0) {
  console.error(`❌ 未找到应用: ${invalidApps.join(', ')}`);
  console.error(`可用应用: ${APPS.join(', ')}`);
  process.exit(1);
}

// 串行构建应用
async function buildApps(apps) {
  for (const app of apps) {
    const appPath = path.resolve(__dirname, `apps/${app}`);
    console.log(`📦 构建 ${app}...`);

    await new Promise((resolve, reject) => {
      const child = spawn(
        'pnpm',
        ['run', 'build'],
        {
          cwd: appPath,
          stdio: 'inherit',
          shell: true,
        }
      );

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${app} 构建完成\n`);
          resolve();
        } else {
          console.error(`❌ ${app} 构建失败\n`);
          reject(new Error(`Build failed with exit code ${code}`));
        }
      });

      child.on('error', (err) => {
        console.error(`❌ ${app} 构建错误:`, err.message);
        reject(err);
      });
    });
  }
}

buildApps(appsToBuild)
  .then(() => {
    console.log('🎉 所有应用构建完成!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('构建失败:', err.message);
    process.exit(1);
  });
