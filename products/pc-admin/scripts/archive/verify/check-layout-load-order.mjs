#!/usr/bin/env node

/**
 * 检查 layout-app 的加载顺序和依赖关系
 */
import { logger } from '../../../utils/logger.mjs';

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const layoutDistDir = resolve(rootDir, 'apps', 'layout-app', 'dist');
const manifestPath = resolve(layoutDistDir, 'manifest.json');
const indexHtmlPath = resolve(layoutDistDir, 'index.html');

// 读取 manifest.json
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

// 读取 index.html
const indexHtml = readFileSync(indexHtmlPath, 'utf-8');

logger.info('=== Layout App 加载顺序检查 ===\n');

// 1. 检查 manifest.json 中的 imports 字段
logger.info('1. Manifest.json 中的 imports 字段:');
let hasImports = false;
for (const [key, entry] of Object.entries(manifest)) {
  if (entry.imports && entry.imports.length > 0) {
    hasImports = true;
    logger.info(`   ${key}:`);
    entry.imports.forEach(imp => {
      logger.info(`     - ${imp}`);
    });
  }
}
if (!hasImports) {
  logger.info('   ⚠️  没有找到 imports 字段（可能需要在构建时提取）');
}
logger.info('');

// 2. 检查 index.html 中的加载顺序
logger.info('2. Index.html 中的加载顺序:');
const scriptMatches = indexHtml.matchAll(/import\(['"]([^'"]+)['"]\)/g);
const htmlLoadOrder = [];
for (const match of scriptMatches) {
  const url = match[1];
  const fileName = url.substring(url.lastIndexOf('/') + 1);
  htmlLoadOrder.push(fileName);
  logger.info(`   ${htmlLoadOrder.length}. ${fileName}`);
}
logger.info('');

// 3. 检查正确的加载顺序（根据优先级）
logger.info('3. 正确的加载顺序（根据优先级）:');
const files = Object.values(manifest).map(entry => ({
  file: entry.file,
  priority: getPriority(entry.file),
  isEntry: entry.isEntry || false,
}));

files.sort((a, b) => a.priority - b.priority);

files.forEach((file, index) => {
  logger.info(`   ${index + 1}. ${file.file} (优先级: ${file.priority}, 入口: ${file.isEntry})`);
});
logger.info('');

// 4. 检查静态导入关系
logger.info('4. 静态导入关系:');
const assetsDir = resolve(layoutDistDir, 'assets');
const indexFile = files.find(f => f.file.includes('index-DJgeuTfS'));
if (indexFile) {
  const indexContent = readFileSync(resolve(assetsDir, indexFile.file.replace('assets/', '')), 'utf-8');
  const staticImports = indexContent.match(/^import.*from\s+["']\.\/([^"']+)["']/gm);
  if (staticImports) {
    staticImports.forEach(imp => {
      const match = imp.match(/from\s+["']\.\/([^"']+)["']/);
      if (match) {
        logger.info(`   ${indexFile.file} -> ${match[1]}`);
      }
    });
  }
}
logger.info('');

// 5. 检查动态导入
logger.info('5. 动态导入（在 index-DJgeuTfS 中）:');
if (indexFile) {
  const indexContent = readFileSync(resolve(assetsDir, indexFile.file.replace('assets/', '')), 'utf-8');
  const dynamicImports = indexContent.matchAll(/import\(["']\.\/([^"']+)["']\)/g);
  const dynamicFiles = new Set();
  for (const match of dynamicImports) {
    dynamicFiles.add(match[1]);
  }
  dynamicFiles.forEach(file => {
    logger.info(`   ${file}`);
  });
}
logger.info('');

// 6. 验证加载顺序是否正确
logger.info('6. 加载顺序验证:');
const expectedOrder = files.map(f => f.file.replace('assets/', ''));
const actualOrder = htmlLoadOrder;

let isCorrect = true;
if (expectedOrder.length !== actualOrder.length) {
  isCorrect = false;
  logger.info(`   ⚠️  文件数量不匹配: 期望 ${expectedOrder.length}，实际 ${actualOrder.length}`);
} else {
  for (let i = 0; i < expectedOrder.length; i++) {
    if (expectedOrder[i] !== actualOrder[i]) {
      isCorrect = false;
      logger.info(`   ❌ 位置 ${i + 1} 不匹配:`);
      logger.info(`      期望: ${expectedOrder[i]}`);
      logger.info(`      实际: ${actualOrder[i]}`);
    }
  }
}

if (isCorrect) {
  logger.info('   ✅ 加载顺序正确');
} else {
  logger.info('   ⚠️  加载顺序需要调整');
}

function getPriority(fileName) {
  if (fileName.includes('vendor-') && !fileName.includes('echarts-vendor')) {
    return 1;
  } else if (fileName.includes('echarts-vendor')) {
    return 2;
  } else if (fileName.includes('menu-registry') ||
             fileName.includes('eps-service') ||
             fileName.includes('auth-api')) {
    return 3;
  } else if (fileName.includes('index-') || fileName.includes('main-')) {
    return 4;
  }
  return 999;
}

