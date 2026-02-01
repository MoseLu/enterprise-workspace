/**
 * 清理构建缓存脚本
 * 
 * 注意：此脚本已被 `build-to-dist.mjs` 中的清理逻辑替代
 * `build-to-dist.mjs` 提供了更完善的清理和自纠错机制
 * 
 * 此脚本保留用于 `prebuild:all` 钩子，但建议使用 `pnpm build-dist:all` 进行构建
 * 该命令会自动清理所有缓存并确保构建产物可用
 */
import { logger } from '../../utils/logger.mjs';

import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { getRootDir } from '../../utils/path-helper.mjs';

const rootDir = getRootDir();

const pathsToClean = [
  // 应用的 Vite 缓存
  'apps/admin-app/node_modules/.vite',
  'apps/logistics-app/node_modules/.vite',
  'apps/engineering-app/node_modules/.vite',
  'apps/quality-app/node_modules/.vite',
  'apps/production-app/node_modules/.vite',
  'apps/finance-app/node_modules/.vite',
  'apps/system-app/node_modules/.vite',
  'apps/layout-app/node_modules/.vite',
  'apps/docs-app/node_modules/.vite',
  'apps/monitor-app/node_modules/.vite',
  
  // 应用的构建输出
  'apps/admin-app/dist',
  'apps/logistics-app/dist',
  'apps/engineering-app/dist',
  'apps/quality-app/dist',
  'apps/production-app/dist',
  'apps/finance-app/dist',
  'apps/system-app/dist',
  'apps/layout-app/dist',
  'apps/docs-app/dist',
  'apps/monitor-app/dist',
  
  // 应用的 Vite 缓存（根目录下的 .vite）
  'apps/admin-app/.vite',
  'apps/logistics-app/.vite',
  'apps/engineering-app/.vite',
  'apps/quality-app/.vite',
  'apps/production-app/.vite',
  'apps/finance-app/.vite',
  'apps/system-app/.vite',
  'apps/layout-app/.vite',
  'apps/docs-app/.vite',
  'apps/monitor-app/.vite',
  
  // 包的 Vite 缓存
  'packages/shared-core/node_modules/.vite',
  'packages/shared-components/node_modules/.vite',
  'packages/shared-utils/node_modules/.vite',
  
  // 注意：不清理共享包的 dist 目录，因为：
  // 1. 共享包需要被其他应用依赖，删除 dist 会导致应用启动失败
  // 2. 共享包应该通过 build:share 命令单独构建和管理
  // 3. 如果需要清理，应该使用 pnpm --filter @btc/shared-core run clean（如果存在）
  // 'packages/shared-core/dist',
  // 'packages/shared-components/dist',
  // 'packages/shared-utils/dist',
  
  // Turbo 缓存（可选，如果需要强制重新构建所有应用）
  // '.turbo',
];

logger.info('🧹 正在清理构建缓存...\n');

let cleanedCount = 0;
let skippedCount = 0;

pathsToClean.forEach((relativePath) => {
  const fullPath = join(rootDir, relativePath);
  
  if (existsSync(fullPath)) {
    try {
      rmSync(fullPath, { recursive: true, force: true });
      logger.info(`✓ 已清理: ${relativePath}`);
      cleanedCount++;
    } catch (error) {
      logger.error(`✗ 清理失败: ${relativePath}`, error.message);
    }
  } else {
    skippedCount++;
  }
});

logger.info(`\n✅ 清理完成！已清理 ${cleanedCount} 个目录，跳过 ${skippedCount} 个不存在的目录。\n`);

