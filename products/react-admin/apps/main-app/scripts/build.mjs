#!/usr/bin/env node

/**
 * 构建脚本
 * 用于构建 main-app React 应用
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'path';
import { existsSync, rmSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectDir = resolve(__dirname, '..');
const distDir = resolve(projectDir, 'dist');

const args = process.argv.slice(2);

// 清理构建产物
if (args[0] === 'build') {
  console.info('🧹 清理构建产物...');

  if (existsSync(distDir)) {
    try {
      rmSync(distDir, { recursive: true, force: true });
      console.info('✅ 已清理 dist 目录');
    } catch (error) {
      console.warn('⚠️  无法清理 dist 目录:', error.message);
    }
  }

  console.info('📦 开始构建...\n');
}

// 运行 vite build
const child = spawn('node', [
  resolve(__dirname, '../node_modules/vite/bin/vite.js'),
  ...args,
], {
  stdio: 'inherit',
  cwd: projectDir,
  shell: false,
});

child.on('error', (error) => {
  console.error('Error:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
