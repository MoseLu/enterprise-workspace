#!/usr/bin/env node

/**
 * 统一开发命令入口
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getRootDir } from '../utils/path-helper.mjs';
import { ensureSnapshotDir } from '../utils/heap-snapshot-manager.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const scriptPath = join(__dirname, '../commands/dev/dev-all.mjs');
const args = process.argv.slice(2);

// 初始化堆快照目录
const rootDir = getRootDir();
try {
  ensureSnapshotDir();
} catch (error) {
  // 如果初始化失败，继续执行（不影响开发）
  console.warn('⚠️  堆快照目录初始化失败，OOM 诊断功能可能不可用:', error.message);
}

// 添加 Node.js 内存诊断参数
const nodeArgs = [
  '--heap-dump-on-out-of-memory',                    // OOM 时自动生成堆快照
  `--heap-dump-path=${join(rootDir, '.heap-snapshots')}`, // 快照保存目录
  '--trace-gc',                                      // 打印 GC 日志
  '--max-old-space-size=4096',                       // 临时扩大内存限制到 4GB
  scriptPath,
  ...args
];

const child = spawn('node', nodeArgs, {
  stdio: 'inherit',
  shell: false,
});

child.on('close', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('❌ 启动失败:', err);
  process.exit(1);
});
