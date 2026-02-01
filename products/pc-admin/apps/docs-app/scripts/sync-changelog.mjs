#!/usr/bin/env node

/**
 * 同步根目录的 CHANGELOG.md 到文档应用
 * 
 * 使用方式：
 *   node apps/docs-app/scripts/sync-changelog.mjs
 * 
 * 或者在 package.json 中添加脚本：
 *   "sync:changelog": "node apps/docs-app/scripts/sync-changelog.mjs"
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 计算根目录路径（从 docs-app/scripts 到项目根目录）
const rootDir = join(__dirname, '../../..');
const changelogSourcePath = join(rootDir, 'CHANGELOG.md');
const changelogTargetPath = join(__dirname, '../zh/changelog/content.md');

console.log('🔄 同步 CHANGELOG.md...');
console.log(`源文件: ${changelogSourcePath}`);
console.log(`目标文件: ${changelogTargetPath}`);

// 检查源文件是否存在
if (!existsSync(changelogSourcePath)) {
  console.error(`❌ 源文件不存在: ${changelogSourcePath}`);
  process.exit(1);
}

try {
  // 读取根目录的 CHANGELOG.md
  const changelogContent = readFileSync(changelogSourcePath, 'utf-8');
  
  // 写入到文档应用目录
  writeFileSync(changelogTargetPath, changelogContent, 'utf-8');
  
  console.log('✅ CHANGELOG.md 同步成功！');
} catch (error) {
  console.error('❌ 同步失败:', error.message);
  process.exit(1);
}
