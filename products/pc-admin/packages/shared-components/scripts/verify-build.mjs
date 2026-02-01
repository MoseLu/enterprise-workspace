#!/usr/bin/env node
/**
 * 验证构建产物是否存在
 * 在构建后运行，确保关键文件已生成
 */

import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageDir = resolve(__dirname, '..');

const requiredFiles = [
  'dist/index.mjs',
  'dist/index.js',
  'dist/index.d.ts',
];

let hasError = false;

console.log('\n🔍 验证构建产物...\n');

for (const file of requiredFiles) {
  const filePath = resolve(packageDir, file);
  if (existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.error(`❌ ${file} - 文件不存在！`);
    hasError = true;
  }
}

if (hasError) {
  console.error('\n❌ 构建产物验证失败！某些必需文件不存在。');
  process.exit(1);
} else {
  console.log('\n✅ 所有构建产物验证通过！');
  process.exit(0);
}
