#!/usr/bin/env node

/**
 * 错误监控服务启动脚本
 * 独立的后台服务，用于监控开发、构建等命令的错误
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const scriptPath = join(__dirname, '../commands/skills/monitor-service.mjs');
const args = process.argv.slice(2);

// 检查是否需要在后台运行
const isBackground = args.includes('--background') || args.includes('-b');
if (isBackground) {
  args.splice(args.indexOf('--background') !== -1 ? args.indexOf('--background') : args.indexOf('-b'), 1);
}

// 添加内存限制参数，防止 OOM（4GB 内存限制）
// 根据服务器实际内存调整，如果服务器内存小于 4GB，可以设置为 2048（2GB）
const nodeArgs = ['--max-old-space-size=4096', scriptPath, ...args];

const child = spawn('node', nodeArgs, {
  stdio: isBackground ? ['ignore', 'ignore', 'ignore'] : 'inherit',
  shell: false,
  detached: isBackground,
  cwd: process.cwd(),
  windowsHide: true // Windows: 隐藏命令行窗口
});

if (isBackground) {
  child.unref();
  // 等待一小段时间确保进程启动
  setTimeout(() => {
    console.log('✅ 监控服务已在后台启动');
    console.log('📊 访问 http://localhost:3001 查看监控界面');
    process.exit(0);
  }, 500);
} else {
  child.on('close', (code) => {
    process.exit(code || 0);
  });

  child.on('error', (err) => {
    console.error('❌ 启动失败:', err);
    process.exit(1);
  });
}
