#!/usr/bin/env node

/**
 * react-admin 开发脚本
 * 支持单个应用开发和批量开发
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
const appsToRun = appFilter ? [appFilter] : APPS;

console.log('🚀 启动 react-admin 开发服务器...\n');

// 检查应用是否存在
const invalidApps = appsToRun.filter((app) => !APPS.includes(app));
if (invalidApps.length > 0) {
  console.error(`❌ 未找到应用: ${invalidApps.join(', ')}`);
  console.error(`可用应用: ${APPS.join(', ')}`);
  process.exit(1);
}

// 启动应用
let started = 0;
const total = appsToRun.length;

appsToRun.forEach((app) => {
  const appPath = path.resolve(__dirname, `apps/${app}`);
  console.log(`📦 启动 ${app}...`);

  const child = spawn('pnpm', ['dev'], {
    cwd: appPath,
    stdio: 'inherit',
    shell: true,
  });

  child.on('spawn', () => {
    console.log(`✅ ${app} 已启动`);
    started++;
    if (started === total) {
      console.log('\n🎉 所有应用已启动!');
    }
  });

  child.on('error', (err) => {
    console.error(`❌ ${app} 启动失败:`, err.message);
  });
});
