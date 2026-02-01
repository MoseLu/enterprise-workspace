import { logger } from '../../../utils/logger.mjs';
#!/usr/bin/env node

/**
 * 构建并预览所有应用
 * 使用 turbo.js 来处理环境变量问题
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require('child_process');
const path = require('path');

const turboScript = path.join(__dirname, 'turbo.js');
const isWindows = process.platform === 'win32';

// 清理环境变量，避免 Windows 上的 NODE_PATH 长度限制问题
const cleanEnv = { ...process.env };
if (isWindows) {
  // 在 Windows 上，清除 NODE_PATH 以避免长度限制问题
  // Node.js 会自动解析 node_modules，不需要 NODE_PATH
  delete cleanEnv.NODE_PATH;
}

logger.info('开始构建所有应用...');

// 运行构建（turbo.js 已经处理了 NODE_PATH 问题）
const buildProcess = spawn('node', [turboScript, 'run', 'build'], {
  stdio: 'inherit',
  shell: false,
  cwd: path.join(__dirname, '..'),
  env: cleanEnv,
});

buildProcess.on('close', (buildCode) => {
  if (buildCode !== 0) {
    logger.error(`构建失败，退出码: ${buildCode}`);
    process.exit(buildCode);
  }

  logger.info('构建成功，开始预览...');

  // 运行预览（turbo.js 已经处理了 NODE_PATH 问题）
  const previewProcess = spawn('node', [turboScript, 'run', 'preview', '--concurrency=25'], {
    stdio: 'inherit',
    shell: false,
    cwd: path.join(__dirname, '..'),
    env: cleanEnv,
  });

  previewProcess.on('close', (previewCode) => {
    process.exit(previewCode || 0);
  });

  previewProcess.on('error', (err) => {
    logger.error('预览进程启动失败:', err);
    process.exit(1);
  });
});

buildProcess.on('error', (err) => {
  logger.error('构建进程启动失败:', err);
  process.exit(1);
});

