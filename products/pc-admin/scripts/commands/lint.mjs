#!/usr/bin/env node
/**
 * Lint 命令管理脚本（向后兼容接口）
 * 用法: node scripts/commands/lint.mjs [app-name] [--fix]
 * 示例: node scripts/commands/lint.mjs system --fix
 * 
 * 注意：此文件保持向后兼容，内部调用新的处理器
 */
import { logger } from '../../utils/logger.mjs';

import { handleLint } from './handlers/lint.mjs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '../..');

const args = process.argv.slice(2);
const fix = args.includes('--fix');
const appName = args.find(arg => !arg.startsWith('--'));

// 如果没有指定应用，检查所有应用
if (!appName) {
  // 使用旧的逻辑：检查所有应用、packages 和 configs
  // 定义所有可能的应用映射
  const allApps = {
    system: 'apps/system-app',
    admin: 'apps/admin-app',
    logistics: 'apps/logistics-app',
    finance: 'apps/finance-app',
    engineering: 'apps/engineering-app',
    quality: 'apps/quality-app',
    production: 'apps/production-app',
    monitor: 'apps/monitor-app',
    layout: 'apps/layout-app',
    docs: 'apps/docs-app',
  };
  
  // 只包含实际存在的应用目录
  const apps = {};
  for (const [key, appDir] of Object.entries(allApps)) {
    const appPath = resolve(rootDir, appDir);
    if (existsSync(appPath)) {
      apps[key] = `${appDir}/src/**/*.{ts,tsx,vue}`;
    }
  }
  
  const patterns = [
    ...Object.values(apps),
    'packages/**/src/**/*.{ts,tsx,vue}',
    'configs/**/*.{ts,tsx}',
  ];
  
  const command = ['pnpm exec eslint', ...patterns.map(p => `"${p}"`)];
  if (fix) {
    command.push('--fix');
  } else {
    command.push('--max-warnings', '0');
  }
  
  const action = fix ? '修复' : '检查';
  logger.info(`\n🔍 正在${action}所有应用和包的代码...\n`);
  
  try {
    execSync(command.join(' '), { 
      stdio: 'inherit',
      cwd: rootDir,
      shell: true
    });
    // 如果执行成功，显示成功消息
    logger.info(`\n✅ 代码${action}完成，未发现任何问题！\n`);
  } catch (error) {
    // 错误信息已经在 stdio: 'inherit' 模式下显示了
    logger.info(`\n❌ 代码${action}发现问题，请查看上面的错误信息。\n`);
    process.exit(error.status || 1);
  }
} else {
  // 使用新的处理器处理单个应用
  (async () => {
    try {
      const subCommand = fix ? 'fix' : 'check';
      await handleLint(appName, subCommand);
    } catch (error) {
      logger.error('执行失败:', error);
      process.exit(1);
    }
  })();
}

