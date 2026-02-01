#!/usr/bin/env node

/**
 * 创建英文文档：复制目录结构并翻译核心文档
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const docsAppDir = join(__dirname, '..');
const zhDir = join(docsAppDir, 'zh');
const enDir = join(docsAppDir, 'en');

/**
 * 递归复制目录结构
 */
function copyDirectoryStructure(src, dest) {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryStructure(srcPath, destPath);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // 只复制 markdown 文件，不翻译
      copyFileSync(srcPath, destPath);
    }
  }
}

// 复制整个目录结构
console.log('📁 复制目录结构...');
copyDirectoryStructure(zhDir, enDir);
console.log('✅ 目录结构复制完成');
