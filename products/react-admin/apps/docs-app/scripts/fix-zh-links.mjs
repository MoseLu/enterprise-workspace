#!/usr/bin/env node

/**
 * 修复 zh/ 目录下所有文档中的链接，添加 /zh 前缀
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const zhDir = join(__dirname, '../zh');

// 需要添加 /zh 前缀的路径模式
const linkPatterns = [
  { pattern: /\]\(\/(quick-start|guides|adr|sop|packages|components|changelog|rfc)\//g, replacement: '](/zh/$1/' },
  { pattern: /\]\(\/(quick-start|guides|adr|sop|packages|components|changelog|rfc)\"\)/g, replacement: '](/zh/$1")' },
  // 修复相对路径的绝对路径引用（如果它们指向根目录）
  { pattern: /\]\(\/(docs-sources)\//g, replacement: '](/zh/$1/' },
];

/**
 * 递归扫描目录下的所有 .md 文件
 */
function scanMarkdownFiles(dir) {
  const files = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...scanMarkdownFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Failed to scan ${dir}:`, error.message);
  }
  return files;
}

/**
 * 修复文件中的链接
 */
function fixLinksInFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;

    for (const { pattern, replacement } of linkPatterns) {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }

    if (modified) {
      writeFileSync(filePath, content, 'utf-8');
      return true;
    }
    return false;
  } catch (error) {
    console.warn(`Failed to process ${filePath}:`, error.message);
    return false;
  }
}

// 主函数
function main() {
  console.log('🔍 扫描 zh/ 目录下的所有 Markdown 文件...');
  const files = scanMarkdownFiles(zhDir);
  console.log(`找到 ${files.length} 个文件`);

  let fixedCount = 0;
  for (const file of files) {
    if (fixLinksInFile(file)) {
      fixedCount++;
      const relativePath = file.replace(zhDir + '\\', '').replace(zhDir + '/', '');
      console.log(`✅ 已修复: ${relativePath}`);
    }
  }

  console.log(`\n✨ 完成！共修复 ${fixedCount} 个文件`);
}

main();
