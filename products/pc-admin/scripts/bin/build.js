#!/usr/bin/env node

/**
 * 统一构建命令入口
 * 简化版本，直接调用对应的构建脚本
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const command = args[0];
const restArgs = args.slice(1);

let scriptPath;

switch (command) {
  case 'cdn':
    scriptPath = join(__dirname, '../commands/build/cdn-build.mjs');
    break;
  case 'dist':
    scriptPath = join(__dirname, '../commands/build/dist-build.mjs');
    break;
  case 'dist-cdn':
    scriptPath = join(__dirname, '../commands/build/dist-cdn-build.mjs');
    break;
  case 'preview':
    scriptPath = join(__dirname, '../commands/build/preview-build.mjs');
    break;
  default:
    console.error('❌ 未知的构建命令:', command);
    console.error('可用命令: cdn, dist, dist-cdn, preview');
    process.exit(1);
}

const child = spawn('node', [scriptPath, ...restArgs], {
  stdio: 'inherit',
  shell: false,
});

child.on('close', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('❌ 执行失败:', err);
  process.exit(1);
});
