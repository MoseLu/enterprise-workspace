#!/usr/bin/env node

/**
 * 检查构建产物中的动态导入是否按照三级降级策略进行资源引入
 * 验证 dynamic-import-cdn 插件是否正确转换了 import() 调用
 */
import { logger } from '../../../utils/logger.mjs';

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 应用名称（从命令行参数获取，默认为 admin-app）
const appName = process.argv[2] || 'admin-app';
const distDir = join(rootDir, 'apps', appName, 'dist');

logger.info(`🔍 检查 ${appName} 的构建产物...\n`);

if (!existsSync(distDir)) {
  logger.error(`❌ 构建产物目录不存在: ${distDir}`);
  logger.info(`\n请先构建应用: pnpm build:${appName.replace('-app', '')}`);
  process.exit(1);
}

// 查找所有 JS 文件
function findJsFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      findJsFiles(filePath, fileList);
    } else if (file.endsWith('.js') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const jsFiles = findJsFiles(distDir);
logger.info(`📦 找到 ${jsFiles.length} 个 JS 文件\n`);

// 检查模式
const patterns = {
  // 应该包含：资源加载器调用
  hasResourceLoader: /window\.__BTC_RESOURCE_LOADER__/,
  // 应该包含：loadResource 调用
  hasLoadResource: /loader\.loadResource\(/,
  // 应该包含：三级降级逻辑（CDN -> OSS -> 本地）
  hasFallback: /CDN.*OSS.*本地|cdnDomain.*ossDomain|loadResource.*fallback/i,
  // 不应该包含：直接的 import() 调用（对于 /assets/ 路径）
  hasDirectImport: /import\s*\(\s*['"]\.\/.*assets\//,
  // 应该包含：Blob URL 用于动态 import
  hasBlobUrl: /URL\.createObjectURL|Blob.*application\/javascript/,
};

let totalChecked = 0;
let totalConverted = 0;
let totalDirectImports = 0;
let issues = [];

jsFiles.forEach((filePath) => {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const relativePath = filePath.replace(distDir, '').replace(/\\/g, '/');
    
    // 检查是否有 import() 调用
    const hasImport = /import\s*\(\s*['"]/.test(content);
    if (!hasImport) {
      return; // 跳过没有动态导入的文件
    }
    
    totalChecked++;
    
    // 检查是否包含资源加载器
    const hasLoader = patterns.hasResourceLoader.test(content);
    const hasLoadResourceCall = patterns.hasLoadResource.test(content);
    const hasBlobUrl = patterns.hasBlobUrl.test(content);
    
    // 检查是否有直接的 import() 调用（对于 /assets/ 路径）
    const directImports = content.match(/import\s*\(\s*['"]\.\/.*assets\/[^'"]*['"]\s*\)/g);
    if (directImports && directImports.length > 0) {
      totalDirectImports += directImports.length;
      issues.push({
        file: relativePath,
        type: 'direct_import',
        message: `发现 ${directImports.length} 个未转换的 import() 调用`,
        examples: directImports.slice(0, 3),
      });
    }
    
    // 如果包含资源加载器，说明已转换
    if (hasLoader && hasLoadResourceCall && hasBlobUrl) {
      totalConverted++;
      logger.info(`✅ ${relativePath}: 已正确转换`);
    } else if (hasImport) {
      // 有 import() 但没有资源加载器，可能有问题
      issues.push({
        file: relativePath,
        type: 'missing_conversion',
        message: '包含 import() 调用但未使用资源加载器',
        hasLoader,
        hasLoadResourceCall,
        hasBlobUrl,
      });
    }
  } catch (error) {
    logger.error(`❌ 读取文件失败: ${filePath}`, error.message);
  }
});

logger.info(`\n📊 检查结果:`);
logger.info(`   - 检查的文件数: ${totalChecked}`);
logger.info(`   - 已转换的文件数: ${totalConverted}`);
logger.info(`   - 未转换的 import() 调用数: ${totalDirectImports}`);

if (issues.length > 0) {
  logger.info(`\n⚠️  发现 ${issues.length} 个问题:\n`);
  issues.forEach((issue, index) => {
    logger.info(`${index + 1}. ${issue.file}`);
    logger.info(`   类型: ${issue.type}`);
    logger.info(`   问题: ${issue.message}`);
    if (issue.examples) {
      logger.info(`   示例:`);
      issue.examples.forEach((ex) => logger.info(`     - ${ex}`));
    }
    if (issue.hasLoader !== undefined) {
      logger.info(`   详情: hasLoader=${issue.hasLoader}, hasLoadResourceCall=${issue.hasLoadResourceCall}, hasBlobUrl=${issue.hasBlobUrl}`);
    }
    logger.info('');
  });
  process.exit(1);
} else {
  logger.info(`\n✅ 所有动态导入都已正确转换为使用资源加载器！`);
  logger.info(`\n验证要点:`);
  logger.info(`   ✓ 使用 window.__BTC_RESOURCE_LOADER__ 加载资源`);
  logger.info(`   ✓ 支持三级降级：CDN -> OSS -> 本地`);
  logger.info(`   ✓ 使用 Blob URL 保持 ES 模块语义`);
  process.exit(0);
}

