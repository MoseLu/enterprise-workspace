import { logger } from '../../utils/logger.mjs';
#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const repoRoot = path.resolve(__dirname, '..');
const pnpmCmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const nodeCmd = process.platform === 'win32' ? 'node.exe' : 'node';

const run = (args, extraEnv = {}) => {
  const result = spawnSync(pnpmCmd, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const runNode = (scriptPath, args = [], extraEnv = {}) => {
  const result = spawnSync(nodeCmd, [scriptPath, ...args], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

// 清理所有应用的构建产物和缓存，确保强制重新构建
const appsToClean = [
  'system-app',
  'admin-app',
  'logistics-app',
  'engineering-app',
  'quality-app',
  'production-app',
  'finance-app',
  'layout-app',
];

logger.info('🧹 清理所有应用的构建产物和缓存...');
logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

appsToClean.forEach((appName) => {
  const distPath = path.join(repoRoot, 'apps', appName, 'dist');
  const viteCachePath1 = path.join(repoRoot, 'apps', appName, 'node_modules', '.vite');
  const viteCachePath2 = path.join(repoRoot, 'apps', appName, '.vite');

  let cleaned = false;

  // 清理构建产物（但保留 build/eps 目录）
  if (fs.existsSync(distPath)) {
    try {
      // 如果存在 build/eps 目录，先保存
      const epsDir = path.join(repoRoot, 'apps', appName, 'build', 'eps');
      let epsBackup = null;
      if (fs.existsSync(epsDir)) {
        const tempBackup = path.join(repoRoot, 'apps', appName, 'build', 'eps.backup');
        if (fs.existsSync(tempBackup)) {
          fs.rmSync(tempBackup, { recursive: true, force: true });
        }
        fs.cpSync(epsDir, tempBackup, { recursive: true });
        epsBackup = tempBackup;
      }

      fs.rmSync(distPath, { recursive: true, force: true });

      // 恢复 build/eps 目录
      if (epsBackup && fs.existsSync(epsBackup)) {
        const targetEpsDir = path.join(repoRoot, 'apps', appName, 'build', 'eps');
        if (!fs.existsSync(path.dirname(targetEpsDir))) {
          fs.mkdirSync(path.dirname(targetEpsDir), { recursive: true });
        }
        fs.cpSync(epsBackup, targetEpsDir, { recursive: true });
        fs.rmSync(epsBackup, { recursive: true, force: true });
      }

      cleaned = true;
    } catch (error) {
      logger.warn(`⚠️  ${appName}: 清理构建产物失败:`, error.message);
    }
  }

  // 清理 Vite 缓存
  [viteCachePath1, viteCachePath2].forEach((cachePath, index) => {
    if (fs.existsSync(cachePath)) {
      try {
        fs.rmSync(cachePath, { recursive: true, force: true });
        cleaned = true;
      } catch (error) {
        logger.warn(`⚠️  ${appName}: 清理 Vite 缓存失败 (${index === 0 ? 'node_modules/.vite' : '.vite'}):`, error.message);
      }
    }
  });

  if (cleaned) {
    logger.info(`✓ ${appName}: 已清理构建产物和缓存`);
  }
});

logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
logger.info('✅ 所有应用的缓存清理完成\n');

// 清理 Turbo 缓存（强制重新构建所有应用）
const turboCachePath = path.join(repoRoot, '.turbo');
logger.info('🧹 清理 Turbo 构建缓存...');
if (fs.existsSync(turboCachePath)) {
  try {
    fs.rmSync(turboCachePath, { recursive: true, force: true });
    logger.info('✓ 已清理 Turbo 构建缓存');
  } catch (error) {
    logger.warn('⚠️  清理 Turbo 缓存失败:', error.message);
  }
}

// 清理 packages 的构建输出和缓存
const packagesToClean = [
  'packages/shared-core',
  'packages/shared-components',
  'packages/shared-utils',
];

logger.info('🧹 清理共享包的构建产物和缓存...');
packagesToClean.forEach((pkgName) => {
  const pkgDistPath = path.join(repoRoot, pkgName, 'dist');
  const pkgViteCachePath1 = path.join(repoRoot, pkgName, 'node_modules', '.vite');
  const pkgViteCachePath2 = path.join(repoRoot, pkgName, '.vite');

  [pkgDistPath, pkgViteCachePath1, pkgViteCachePath2].forEach((cachePath) => {
    if (fs.existsSync(cachePath)) {
      try {
        fs.rmSync(cachePath, { recursive: true, force: true });
      } catch (error) {
        logger.warn(`⚠️  清理 ${pkgName} 缓存失败:`, error.message);
      }
    }
  });
});
logger.info('✅ 共享包缓存清理完成\n');

// 步骤 1: 先构建 system-app，生成完整的 EPS 数据
logger.info('');
logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
logger.info('📦 步骤 1: 构建 system-app 以生成 EPS 数据');
logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
logger.info('🔨 构建 system-app...');
run(['build:system'], { VITE_PREVIEW: 'false' });
logger.info('✅ system-app 构建完成');
logger.info('');

// 步骤 2: 复制 system-app 的 EPS 数据到其他子应用
logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
logger.info('📦 步骤 2: 复制 EPS 数据到所有子应用');
logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const copyEpsScriptPath = path.join(repoRoot, 'scripts', 'copy-eps-from-system.mjs');
runNode(copyEpsScriptPath, [], {});
logger.info('');

// 步骤 2.5: 验证 EPS 数据是否已正确复制
logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
logger.info('🔍 步骤 2.5: 验证 EPS 数据复制结果');
logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const mainEpsPath = path.join(repoRoot, 'apps', 'main-app', 'build', 'eps', 'eps.json');
const targetApps = ['admin-app', 'logistics-app', 'engineering-app', 'quality-app', 'production-app', 'finance-app', 'system-app', 'layout-app'];

if (!fs.existsSync(mainEpsPath)) {
  logger.error('❌ 错误: main-app 的 EPS 文件不存在:', mainEpsPath);
  process.exit(1);
}

const mainEpsData = JSON.parse(fs.readFileSync(mainEpsPath, 'utf-8'));
const mainEpsCount = Array.isArray(mainEpsData) ? mainEpsData.length :
                       (mainEpsData.data ? Object.values(mainEpsData.data).flat().length : 0);
logger.info(`✅ main-app EPS 数据: ${mainEpsCount} 个实体`);

let allValid = true;
for (const appName of targetApps) {
  const targetEpsPath = path.join(repoRoot, 'apps', appName, 'build', 'eps', 'eps.json');
  if (!fs.existsSync(targetEpsPath)) {
    logger.error(`❌ ${appName}: EPS 文件不存在`);
    allValid = false;
    continue;
  }

  try {
    const targetEpsData = JSON.parse(fs.readFileSync(targetEpsPath, 'utf-8'));
    const targetEpsCount = Array.isArray(targetEpsData) ? targetEpsData.length :
                           (targetEpsData.data ? Object.values(targetEpsData.data).flat().length : 0);

    if (targetEpsCount === 0) {
      logger.error(`❌ ${appName}: EPS 数据为空`);
      allValid = false;
    } else if (targetEpsCount !== systemEpsCount) {
      logger.warn(`⚠️  ${appName}: EPS 实体数量不匹配 (${targetEpsCount} vs ${systemEpsCount})`);
    } else {
      logger.info(`✅ ${appName}: EPS 数据验证通过 (${targetEpsCount} 个实体)`);
    }
  } catch (error) {
    logger.error(`❌ ${appName}: EPS 文件读取失败 - ${error.message}`);
    allValid = false;
  }
}

if (!allValid) {
  logger.error('');
  logger.error('❌ EPS 数据验证失败，请检查复制脚本是否正常执行');
  process.exit(1);
}

logger.info('');

// 步骤 3: 构建所有应用（强制重新构建，不使用缓存）
logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
logger.info('🔨 步骤 3: 构建所有应用（强制重新构建，不使用缓存）');
logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
// 使用 --force 标志强制 turbo 重新构建所有应用，避免使用缓存
// 特别针对移动端应用，使用 --no-cache 确保完全重新构建
const turboScriptPath = path.join(repoRoot, 'scripts', 'commands', 'tools', 'turbo.js');
runNode(turboScriptPath, ['run', 'build', '--force', '--no-cache'], { VITE_PREVIEW: 'false' });

// 构建成功后继续执行原来的静态发布
run(['deploy:static:all']);
