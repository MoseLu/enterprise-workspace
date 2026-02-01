/**
 * 清理构建产物和缓存
 * 确保每次构建都从干净的状态开始，避免 hash 不匹配的问题
 */
import { logger } from '@btc/shared-core';

import { existsSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appDir = join(__dirname, '..');

const pathsToClean = [
  // 构建输出目录（必须清理，确保构建前完全干净）
  join(appDir, 'dist'),
  // Vite 缓存目录（清理缓存，避免使用旧的 hash）
  // 注意：需要清理所有可能的 Vite 缓存位置
  join(appDir, 'node_modules', '.vite'),
  join(appDir, '.vite'),
  // Vite 构建缓存（如果存在）
  join(appDir, 'node_modules', '.vite', 'build'),
  // 可能的其他缓存位置
  join(appDir, 'node_modules', '.cache'),
  join(appDir, '.cache'),
];

logger.info('🧹 正在清理物流应用的构建产物和缓存...\n');
logger.info(`   工作目录: ${appDir}\n`);

let cleanedCount = 0;

// 无条件清理 dist 目录，确保构建前完全干净
// 不检查是否有旧文件，直接清理，避免任何残留
const distDir = join(appDir, 'dist');
if (existsSync(distDir)) {
  // 先检查是否有旧的 qiankun 文件（仅用于提示）
  const assetsDir = join(distDir, 'assets');
  const oldQiankunHashes = ['CsCXIXJD']; // 已知的旧 hash
  if (existsSync(assetsDir)) {
    try {
      const files = readdirSync(assetsDir);
      const qiankunFiles = files.filter(f => f.startsWith('qiankun-') && f.endsWith('.js'));
      
      if (qiankunFiles.length > 1) {
        logger.info(`⚠️  发现多个 qiankun 文件: ${qiankunFiles.join(', ')}`);
      }
      
      // 检查是否有已知的旧 hash
      for (const qiankunFile of qiankunFiles) {
        for (const oldHash of oldQiankunHashes) {
          if (qiankunFile.includes(oldHash)) {
            logger.info(`⚠️  发现旧的 qiankun 文件: ${qiankunFile}`);
            break;
          }
        }
      }
    } catch (error) {
      // 忽略读取错误，继续清理
    }
  }
}

// 强制清理所有路径，确保完全干净
// 先清理 dist，确保它被完全删除（使用更多重试）
const distPath = pathsToClean[0]; // dist 是第一个
if (existsSync(distPath)) {
  try {
    rmSync(distPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    logger.info(`✓ 已清理: ${distPath.replace(appDir, '.')}`);
    cleanedCount++;
  } catch (error) {
    logger.error(`✗ 清理 dist 失败: ${error.message}`);
    logger.error(`   这可能导致构建后仍有旧文件，请手动删除: ${distPath}`);
  }
}

// 然后清理其他缓存路径
pathsToClean.slice(1).forEach((path) => {
  if (existsSync(path)) {
    try {
      rmSync(path, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      logger.info(`✓ 已清理: ${path.replace(appDir, '.')}`);
      cleanedCount++;
    } catch (error) {
      logger.error(`✗ 清理失败: ${path}`, error.message);
      // 即使清理失败，也继续清理其他路径
    }
  }
});

// 验证 dist 目录是否真的被清理了
if (existsSync(join(appDir, 'dist'))) {
  logger.warn(`\n⚠️  警告: dist 目录仍然存在，可能清理不彻底。`);
  logger.warn(`   请手动检查并删除: ${join(appDir, 'dist')}\n`);
} else {
  logger.info(`\n✅ 清理完成！已清理 ${cleanedCount} 个目录，dist 目录已确认删除。\n`);
}

