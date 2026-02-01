#!/usr/bin/env node
/**
 * 创建 dist/src/index.d.ts 和 dist/index.d.ts 文件
 * 这个文件是为了支持使用 dist/src 路径的应用
 * 由于 vite-plugin-dts 已经生成了 dist/src 目录结构，我们只需要创建一个 index.d.ts
 * 来重新导出所有内容，路径保持相对路径 './xxx' 即可
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distSrcDir = join(rootDir, 'dist', 'src');
const distSrcIndexDts = join(distSrcDir, 'index.d.ts');
const distIndexDts = join(rootDir, 'dist', 'index.d.ts');
const srcIndexDts = join(rootDir, 'src', 'index.d.ts');

// 确保 dist/src 目录存在
if (!existsSync(distSrcDir)) {
  mkdirSync(distSrcDir, { recursive: true });
}

// 读取 src/index.d.ts 的内容或使用 dist/src/index.d.ts（如果 vite-plugin-dts 已生成）
let content;
if (existsSync(distSrcIndexDts)) {
  // vite-plugin-dts 已经生成了 dist/src/index.d.ts，直接使用
  content = readFileSync(distSrcIndexDts, 'utf-8');
} else if (existsSync(srcIndexDts)) {
  // 读取 src/index.d.ts 的内容
  content = readFileSync(srcIndexDts, 'utf-8');
  
  // 路径保持不变，因为 dist/src 目录下的文件结构和 src 目录下的结构一致
  // 所有相对路径 './xxx' 都指向 dist/src/xxx，这是正确的
  writeFileSync(distSrcIndexDts, content, 'utf-8');
  console.log('✓ Created dist/src/index.d.ts');
} else {
  // 如果都不存在，创建一个基本的重新导出文件
  content = `// Auto-generated index.d.ts for dist/src path support
// This file re-exports all types from the dist/src directory structure

export * from './btc';
export * from './composables';
export * from './eps';
export * from './types';
export * from './utils';
`;

  writeFileSync(distSrcIndexDts, content, 'utf-8');
  console.log('✓ Created dist/src/index.d.ts (fallback)');
}

// 复制 dist/src/index.d.ts 到 dist/index.d.ts（用于验证脚本）
if (existsSync(distSrcIndexDts)) {
  copyFileSync(distSrcIndexDts, distIndexDts);
  console.log('✓ Created dist/index.d.ts');
}

