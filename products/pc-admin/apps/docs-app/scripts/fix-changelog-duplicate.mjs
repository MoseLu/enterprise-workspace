#!/usr/bin/env node

/**
 * 修复 changelog/index.md 中的重复内容
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const indexPath = join(__dirname, '../zh/changelog/index.md');

const content = readFileSync(indexPath, 'utf-8');

// 找到 <!-- CHANGELOG_CONTENT --> 标记的位置
const marker = '<!-- CHANGELOG_CONTENT -->';
const markerIndex = content.indexOf(marker);

if (markerIndex === -1) {
  console.log('⚠️  未找到 CHANGELOG_CONTENT 标记');
  process.exit(0);
}

// 保留标记之前的内容，移除标记之后的所有内容
const beforeMarker = content.substring(0, markerIndex + marker.length);
const newContent = beforeMarker + '\n\n';

writeFileSync(indexPath, newContent, 'utf-8');
console.log('✅ 已清理 changelog/index.md 中的重复内容');
