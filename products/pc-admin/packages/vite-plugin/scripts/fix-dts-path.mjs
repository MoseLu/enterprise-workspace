#!/usr/bin/env node
/**
 * 修复类型定义文件路径
 * 将 dist/src/index.d.ts 移动到 dist/index.d.ts（如果存在）
 * 如果 dist/index.d.ts 已经存在，则跳过
 */

import { existsSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageDir = resolve(__dirname, '..');

const srcDtsPath = resolve(packageDir, 'dist/src/index.d.ts');
const targetDtsPath = resolve(packageDir, 'dist/index.d.ts');

// 如果目标文件已存在，直接返回
if (existsSync(targetDtsPath)) {
  console.log('✅ dist/index.d.ts 已存在');
  process.exit(0);
}

// 如果源文件存在，复制到目标位置
if (existsSync(srcDtsPath)) {
  try {
    copyFileSync(srcDtsPath, targetDtsPath);
    console.log('✅ 已生成 dist/index.d.ts');
  } catch (error) {
    console.error('❌ 复制类型定义文件失败:', error);
    process.exit(1);
  }
} else {
  console.warn('⚠️  dist/src/index.d.ts 不存在，跳过修复');
  // 如果两个文件都不存在，这是错误
  if (!existsSync(targetDtsPath)) {
    console.error('❌ dist/index.d.ts 不存在，类型声明文件生成失败');
    process.exit(1);
  }
}
