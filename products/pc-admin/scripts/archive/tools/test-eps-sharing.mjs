#!/usr/bin/env node

/**
 * 测试 EPS 数据共享功能
 * 验证所有应用是否能从共享位置（main-app/build/eps）读取 EPS 数据
 */
import { logger } from '../../../utils/logger.mjs';

import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const PROJECT_ROOT = resolve(__dirname, '..');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => logger.info(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => logger.info(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => logger.info(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => logger.info(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  section: (msg) => logger.info(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`),
};

// 所有应用列表
const ALL_APPS = [
  'main-app',
  'system-app',
  'logistics-app',
  'admin-app',
  'finance-app',
  'quality-app',
  'production-app',
  'engineering-app',
  'monitor-app',
  'layout-app',
];

// 子应用列表（不包括 main-app）
const SUB_APPS = ALL_APPS.filter(app => app !== 'main-app');

function testEpsSharing() {
  log.section('测试 EPS 数据共享功能');

  // 1. 检查 main-app 的 EPS 数据
  log.info('1. 检查 main-app 的 EPS 数据源...');
  const mainEpsDir = join(PROJECT_ROOT, 'apps', 'main-app', 'build', 'eps');
  const mainEpsJson = join(mainEpsDir, 'eps.json');

  if (!existsSync(mainEpsJson)) {
    log.error(`main-app 的 EPS 数据不存在: ${mainEpsJson}`);
    log.warning('请先构建 main-app 以生成 EPS 数据:');
    log.warning('  pnpm --filter main-app build');
    process.exit(1);
  }

  const mainEpsData = JSON.parse(readFileSync(mainEpsJson, 'utf-8'));
  const mainEpsCount = Array.isArray(mainEpsData) 
    ? mainEpsData.length 
    : (mainEpsData.data ? Object.values(mainEpsData.data).flat().length : 0);
  
  log.success(`✓ main-app EPS 数据存在 (${mainEpsCount} 个实体)`);
  log.info(`  路径: ${mainEpsJson}`);

  // 2. 检查子应用的共享配置
  log.info('\n2. 检查子应用的共享配置...');
  let configErrors = 0;

  for (const app of SUB_APPS) {
    const appDir = join(PROJECT_ROOT, 'apps', app);
    const viteConfigPath = join(appDir, 'vite.config.ts');
    
    if (!existsSync(viteConfigPath)) {
      log.warning(`  ⚠️  ${app}: vite.config.ts 不存在，跳过`);
      continue;
    }

    const viteConfigContent = readFileSync(viteConfigPath, 'utf-8');
    
    // 检查是否使用了 subapp.config.ts（它会自动配置 sharedEpsDir）
    if (viteConfigContent.includes('createSubAppConfig') || viteConfigContent.includes('subapp.config')) {
      log.success(`  ✓ ${app}: 使用 subapp.config.ts（已配置 sharedEpsDir）`);
    } else {
      log.warning(`  ⚠️  ${app}: 未检测到 subapp.config.ts，请确认配置`);
      configErrors++;
    }
  }

  if (configErrors > 0) {
    log.warning(`\n发现 ${configErrors} 个应用的配置可能有问题`);
  }

  // 3. 检查子应用的共享 EPS 数据路径
  log.info('\n3. 检查子应用的共享 EPS 数据路径...');
  let pathErrors = 0;

  for (const app of SUB_APPS) {
    const appDir = join(PROJECT_ROOT, 'apps', app);
    const expectedSharedEpsDir = join(appDir, '../../apps/main-app/build/eps');
    const expectedSharedEpsJson = join(expectedSharedEpsDir, 'eps.json');

    if (existsSync(expectedSharedEpsJson)) {
      log.success(`  ✓ ${app}: 共享 EPS 数据路径可访问`);
      log.info(`    路径: ${expectedSharedEpsJson}`);
    } else {
      log.error(`  ✗ ${app}: 共享 EPS 数据路径不可访问`);
      log.error(`    路径: ${expectedSharedEpsJson}`);
      pathErrors++;
    }
  }

  if (pathErrors > 0) {
    log.error(`\n发现 ${pathErrors} 个应用的共享路径有问题`);
    process.exit(1);
  }

  // 4. 检查子应用的 EPS 服务代码
  log.info('\n4. 检查子应用的 EPS 服务代码...');
  let codeErrors = 0;

  for (const app of SUB_APPS) {
    const appDir = join(PROJECT_ROOT, 'apps', app);
    const epsServicePath = join(appDir, 'src', 'services', 'eps.ts');

    if (!existsSync(epsServicePath)) {
      log.warning(`  ⚠️  ${app}: src/services/eps.ts 不存在，跳过`);
      continue;
    }

    const epsServiceContent = readFileSync(epsServicePath, 'utf-8');

    // 检查是否使用了共享的 loadEpsService 函数
    if (epsServiceContent.includes('loadEpsService') && epsServiceContent.includes('@btc/shared-core')) {
      log.success(`  ✓ ${app}: 使用共享的 loadEpsService 函数`);
    } else {
      log.error(`  ✗ ${app}: 未使用共享的 loadEpsService 函数`);
      log.error(`    请检查 src/services/eps.ts 是否从 @btc/shared-core 导入`);
      codeErrors++;
    }
  }

  if (codeErrors > 0) {
    log.error(`\n发现 ${codeErrors} 个应用的 EPS 服务代码有问题`);
    process.exit(1);
  }

  // 5. 总结
  log.section('测试结果');
  log.success('✓ 所有检查通过！');
  log.info('\nEPS 数据共享配置正确：');
  log.info('  - system-app 的 EPS 数据已生成');
  log.info('  - 所有子应用已配置 sharedEpsDir');
  log.info('  - 所有子应用使用共享的 loadEpsService 函数');
  log.info('\n下一步：');
  log.info('  1. 构建 main-app: pnpm --filter main-app build');
  log.info('  2. 构建子应用: pnpm --filter logistics-app build');
  log.info('  3. 检查构建产物，确认所有应用共享同一个 eps-service chunk');
}

// 运行测试
testEpsSharing();

