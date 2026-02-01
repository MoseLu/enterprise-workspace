#!/usr/bin/env node

/**
 * 将 main-app 的 EPS 产物复制到其他子应用
 * 确保所有子应用都能共享相同的 EPS 数据
 */
import { logger } from '../../utils/logger.mjs';

import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { getRootDir } from '../../utils/path-helper.mjs';

const PROJECT_ROOT = getRootDir();

// main-app 的 EPS 数据源
const MAIN_EPS_DIR = join(PROJECT_ROOT, 'apps/main-app/build/eps');

// 需要复制 EPS 数据的子应用列表
const SUB_APPS = [
  'admin-app',
  'logistics-app',
  'engineering-app',
  'quality-app',
  'production-app',
  'finance-app',
  'system-app',
  'layout-app',
];

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  info: (msg) => logger.info(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => logger.info(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => logger.info(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => logger.info(`${colors.red}[ERROR]${colors.reset} ${msg}`),
};

function copyEpsData() {
  // 检查 main-app 的 EPS 数据是否存在
  if (!existsSync(MAIN_EPS_DIR)) {
    log.error(`main-app 的 EPS 数据目录不存在: ${MAIN_EPS_DIR}`);
    log.info('请先构建 main-app 以生成 EPS 数据');
    process.exit(1);
  }

  // 检查 EPS 数据文件是否存在
  const epsJsonPath = join(MAIN_EPS_DIR, 'eps.json');
  if (!existsSync(epsJsonPath)) {
    log.error(`main-app 的 EPS 数据文件不存在: ${epsJsonPath}`);
    log.info('请先构建 main-app 以生成 EPS 数据');
    process.exit(1);
  }

  log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.info('📦 复制 main-app 的 EPS 数据到其他子应用');
  log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.info(`EPS 数据源: ${MAIN_EPS_DIR}`);
  log.info('');

  let successCount = 0;
  let skipCount = 0;

  // 复制 EPS 数据到每个子应用
  for (const app of SUB_APPS) {
    const appDir = join(PROJECT_ROOT, 'apps', app);
    const targetEpsDir = join(appDir, 'build/eps');

    if (!existsSync(appDir)) {
      log.warning(`应用目录不存在，跳过: ${appDir}`);
      skipCount++;
      continue;
    }

    log.info(`复制 EPS 数据到 ${app}...`);

    // 创建目标目录
    if (!existsSync(targetEpsDir)) {
      mkdirSync(targetEpsDir, { recursive: true });
    }

    let copiedFiles = 0;

    // 复制所有 EPS 文件
    try {
      const files = readdirSync(MAIN_EPS_DIR);
      
      for (const file of files) {
        const sourcePath = join(MAIN_EPS_DIR, file);
        const targetPath = join(targetEpsDir, file);

        // 只复制文件，不复制目录
        if (statSync(sourcePath).isFile()) {
          copyFileSync(sourcePath, targetPath);
          log.info(`  ✓ 复制 ${file}`);
          copiedFiles++;
        }
      }

      if (copiedFiles > 0) {
        log.success(`✅ ${app} 的 EPS 数据已更新 (${copiedFiles} 个文件)`);
        successCount++;
      } else {
        log.warning(`⚠️  ${app}: 未找到可复制的文件`);
        skipCount++;
      }
    } catch (error) {
      log.error(`复制 ${app} 的 EPS 数据失败: ${error.message}`);
      skipCount++;
    }
  }

  log.info('');
  log.success('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.success(`✅ EPS 数据复制完成 (成功: ${successCount}, 跳过: ${skipCount})`);
  log.success('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// 运行复制
copyEpsData();

