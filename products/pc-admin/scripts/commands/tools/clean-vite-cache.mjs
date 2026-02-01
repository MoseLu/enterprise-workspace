#!/usr/bin/env node
/**
 * 清理所有 Vite 缓存脚本
 * 用法: node scripts/clean-vite-cache.mjs
 */
import { logger } from '../../utils/logger.mjs';

import { existsSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getRootDir } from '../../utils/path-helper.mjs';

const rootDir = getRootDir();

/**
 * 递归查找并删除目录
 */
function cleanDirectory(dirPath, description) {
  if (!existsSync(dirPath)) {
    return { cleaned: false, path: dirPath };
  }
  
  try {
    rmSync(dirPath, { recursive: true, force: true });
    return { cleaned: true, path: dirPath, description };
  } catch (error) {
    return { cleaned: false, path: dirPath, error: error.message, description };
  }
}

/**
 * 动态查找所有应用和包的 vite 缓存
 */
function findAllViteCaches() {
  const caches = [];
  
  // 查找所有应用的 vite 缓存
  const appsDir = join(rootDir, 'apps');
  if (existsSync(appsDir)) {
    const apps = readdirSync(appsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    apps.forEach(appName => {
      // apps/{app-name}/node_modules/.vite
      caches.push({
        path: join(appsDir, appName, 'node_modules', '.vite'),
        description: `应用 ${appName} (node_modules/.vite)`
      });
      
      // apps/{app-name}/.vite
      caches.push({
        path: join(appsDir, appName, '.vite'),
        description: `应用 ${appName} (.vite)`
      });
      
      // docs-app 的特殊缓存
      if (appName === 'docs-app') {
        // .vitepress/cache
        caches.push({
          path: join(appsDir, appName, '.vitepress', 'cache'),
          description: `应用 ${appName} (.vitepress/cache)`
        });
      }
    });
  }
  
  // 查找所有包的 vite 缓存
  const packagesDir = join(rootDir, 'packages');
  if (existsSync(packagesDir)) {
    const packages = readdirSync(packagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    packages.forEach(pkgName => {
      // packages/{pkg-name}/node_modules/.vite
      caches.push({
        path: join(packagesDir, pkgName, 'node_modules', '.vite'),
        description: `包 ${pkgName} (node_modules/.vite)`
      });
      
      // packages/{pkg-name}/.vite
      caches.push({
        path: join(packagesDir, pkgName, '.vite'),
        description: `包 ${pkgName} (.vite)`
      });
    });
  }
  
  // 根目录的 vite 缓存
  caches.push({
    path: join(rootDir, 'node_modules', '.vite'),
    description: '根目录 (node_modules/.vite)'
  });
  
  caches.push({
    path: join(rootDir, '.vite'),
    description: '根目录 (.vite)'
  });
  
  return caches;
}

/**
 * 主函数
 */
function main() {
  logger.info('🧹 正在清理所有 Vite 缓存...\n');
  
  const caches = findAllViteCaches();
  let cleanedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  
  caches.forEach(({ path, description }) => {
    const result = cleanDirectory(path, description);
    
    if (result.cleaned) {
      logger.info(`✅ 已清理: ${result.description}`);
      cleanedCount++;
    } else if (result.error) {
      logger.error(`❌ 清理失败: ${result.description} - ${result.error}`);
      failedCount++;
    } else {
      skippedCount++;
    }
  });
  
  logger.info(`\n📊 清理统计:`);
  logger.info(`   ✅ 已清理: ${cleanedCount} 个缓存目录`);
  logger.info(`   ⏭️  跳过（不存在）: ${skippedCount} 个`);
  if (failedCount > 0) {
    logger.info(`   ❌ 失败: ${failedCount} 个`);
  }
  logger.info(`\n✨ 清理完成！\n`);
}

main();
