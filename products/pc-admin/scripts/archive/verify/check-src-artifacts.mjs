#!/usr/bin/env node

/**
 * 检查并清理 src 目录下的构建产物
 * 
 * 功能：
 * - 递归查找指定目录下 src 目录中的 .js 和 .map 文件
 * - 只删除那些有对应 .ts 文件的 .js 文件
 * - 只删除那些有对应 .d.ts 文件的 .d.ts.map 文件
 * - 排除配置文件和脚本文件
 * - 输出详细的清理日志
 * 
 * 用法：
 *   node scripts/check-src-artifacts.mjs <目录路径>
 * 
 * 示例：
 *   node scripts/check-src-artifacts.mjs apps/main-app
 *   node scripts/check-src-artifacts.mjs packages/shared-core
 */

import { logger } from '../../../utils/logger.mjs';
import { existsSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 需要排除的文件和目录
const EXCLUDE_PATTERNS = [
  /vite\.config\.js$/,
  /\.config\.js$/,
  /scripts\/.*\.js$/,
  /node_modules/,
];

/**
 * 检查文件是否应该被排除
 */
function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * 检查 .js 文件是否有对应的 .ts 文件
 */
function hasCorrespondingTsFile(jsPath) {
  const tsPath = jsPath.replace(/\.js$/, '.ts');
  return existsSync(tsPath);
}

/**
 * 检查 .d.ts.map 文件是否有对应的 .d.ts 文件
 */
function hasCorrespondingDtsFile(mapPath) {
  // mapPath 格式: index.d.ts.map
  // 对应的 .d.ts 文件: index.d.ts
  const dtsPath = mapPath.replace(/\.d\.ts\.map$/, '.d.ts');
  return existsSync(dtsPath);
}

/**
 * 递归查找并清理构建产物
 */
function cleanArtifacts(dirPath, srcPath, stats) {
  if (!existsSync(srcPath)) {
    logger.warn(`⚠️  ${dirPath}: src 目录不存在: ${srcPath}`);
    return;
  }

  try {
    const entries = readdirSync(srcPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(srcPath, entry.name);
      const relativePath = fullPath.replace(rootDir + '\\', '').replace(rootDir + '/', '');

      // 跳过排除的文件
      if (shouldExclude(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        // 递归处理子目录
        cleanArtifacts(dirPath, fullPath, stats);
      } else if (entry.isFile()) {
        const ext = extname(entry.name);
        const baseName = basename(entry.name, ext);

        // 处理 .js 文件
        if (ext === '.js') {
          if (hasCorrespondingTsFile(fullPath)) {
            try {
              unlinkSync(fullPath);
              stats.deletedFiles++;
              logger.info(`  ✅ 删除: ${relativePath}`);
            } catch (error) {
              stats.failedFiles++;
              logger.warn(`  ⚠️  删除失败: ${relativePath} - ${error.message}`);
            }
          } else {
            stats.skippedFiles++;
            logger.debug(`  ⏭️  跳过（无对应 .ts 文件）: ${relativePath}`);
          }
        }
        // 处理 .d.ts.map 文件
        else if (ext === '.map' && entry.name.endsWith('.d.ts.map')) {
          if (hasCorrespondingDtsFile(fullPath)) {
            try {
              unlinkSync(fullPath);
              stats.deletedFiles++;
              logger.info(`  ✅ 删除: ${relativePath}`);
            } catch (error) {
              stats.failedFiles++;
              logger.warn(`  ⚠️  删除失败: ${relativePath} - ${error.message}`);
            }
          } else {
            stats.skippedFiles++;
            logger.debug(`  ⏭️  跳过（无对应 .d.ts 文件）: ${relativePath}`);
          }
        }
      }
    }
  } catch (error) {
    logger.error(`❌ 处理目录失败: ${srcPath} - ${error.message}`);
    stats.failedDirs++;
  }
}

/**
 * 主函数
 */
function main() {
  const targetDir = process.argv[2];

  if (!targetDir) {
    logger.error('❌ 请提供目录路径参数');
    logger.info('用法: node scripts/check-src-artifacts.mjs <目录路径>');
    logger.info('示例: node scripts/check-src-artifacts.mjs apps/main-app');
    logger.info('示例: node scripts/check-src-artifacts.mjs packages/shared-core');
    process.exit(1);
  }

  const dirPath = join(rootDir, targetDir);
  const srcPath = join(dirPath, 'src');

  if (!existsSync(dirPath)) {
    logger.error(`❌ 目录不存在: ${dirPath}`);
    process.exit(1);
  }

  logger.info(`🔍 检查 ${targetDir} 的 src 目录中的构建产物...`);
  logger.info(`   目录: ${srcPath}\n`);

  const stats = {
    deletedFiles: 0,
    skippedFiles: 0,
    failedFiles: 0,
    failedDirs: 0,
  };

  cleanArtifacts(targetDir, srcPath, stats);

  logger.info('\n📊 清理统计:');
  logger.info(`   ✅ 已删除: ${stats.deletedFiles} 个文件`);
  logger.info(`   ⏭️  已跳过: ${stats.skippedFiles} 个文件`);
  if (stats.failedFiles > 0) {
    logger.warn(`   ⚠️  删除失败: ${stats.failedFiles} 个文件`);
  }
  if (stats.failedDirs > 0) {
    logger.warn(`   ⚠️  处理失败: ${stats.failedDirs} 个目录`);
  }

  if (stats.deletedFiles > 0) {
    logger.info(`\n✅ 清理完成！已删除 ${stats.deletedFiles} 个构建产物文件`);
  } else {
    logger.info(`\n✅ 检查完成！未发现需要清理的构建产物`);
  }
}

main();
