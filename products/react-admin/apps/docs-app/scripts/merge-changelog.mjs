#!/usr/bin/env node

/**
 * 将 content.md 的内容合并到 index.md
 * 这个脚本在文档构建前运行，将 CHANGELOG 内容嵌入到 index.md
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const indexPath = join(__dirname, '../zh/changelog/index.md');
const contentPath = join(__dirname, '../zh/changelog/content.md');

if (!existsSync(contentPath)) {
  console.warn('⚠️  content.md 不存在，跳过合并');
  process.exit(0);
}

try {
  let indexContent = readFileSync(indexPath, 'utf-8');
  let changelogContent = readFileSync(contentPath, 'utf-8');
  
  // 移除 content.md 开头的第一个标题（如果有的话）
  // 匹配格式：可能的前导空行 + # 标题 + 空行
  changelogContent = changelogContent.replace(/^(\s*#\s+[^\n]+\n\s*)+/, '').trim();
  
  // 找到 <!-- CHANGELOG_CONTENT --> 标记
  const marker = '<!-- CHANGELOG_CONTENT -->';
  
  if (indexContent.includes(marker)) {
    // 找到标记位置，保留标记之前的内容，替换标记之后的所有内容
    const markerIndex = indexContent.indexOf(marker);
    const beforeMarker = indexContent.substring(0, markerIndex + marker.length);
    
    // 移除标记之后的所有重复内容
    const newContent = beforeMarker + '\n\n' + changelogContent;
    writeFileSync(indexPath, newContent, 'utf-8');
  } else {
    // 如果标记不存在，在文件末尾添加标记和内容
    const newContent = indexContent + '\n\n' + marker + '\n\n' + changelogContent;
    writeFileSync(indexPath, newContent, 'utf-8');
  }
  
  console.log('✅ CHANGELOG 内容已合并到 index.md');
} catch (error) {
  console.error('❌ 合并失败:', error.message);
  process.exit(1);
}
