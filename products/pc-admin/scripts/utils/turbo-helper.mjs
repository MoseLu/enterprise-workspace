/**
 * Turbo 命令封装工具
 * 封装 turbo 命令执行，处理 Windows 环境变量问题
 */

import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';
import { getRootDir } from './path-helper.mjs';
import { logger } from './logger.mjs';

const rootNodeModules = join(getRootDir(), 'node_modules');
const isWindows = process.platform === 'win32';

let turboPath = null;

/**
 * 查找 turbo 可执行文件路径
 */
function findTurboPath() {
  if (turboPath) return turboPath;

  // 首先尝试在 pnpm 的 .pnpm 目录中查找
  const pnpmDir = join(rootNodeModules, '.pnpm');
  if (existsSync(pnpmDir)) {
    try {
      const entries = require('fs').readdirSync(pnpmDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith('turbo@')) {
          const possiblePaths = [
            join(pnpmDir, entry.name, 'node_modules', 'turbo', 'bin', 'turbo.js'),
            join(pnpmDir, entry.name, 'node_modules', 'turbo', 'bin', 'turbo'),
          ];
          for (const possiblePath of possiblePaths) {
            if (existsSync(possiblePath)) {
              turboPath = possiblePath;
              return turboPath;
            }
          }
        }
      }
    } catch (error) {
      // 忽略错误，继续查找
    }
  }

  // 尝试直接在 node_modules 中查找
  const possiblePaths = [
    join(rootNodeModules, 'turbo', 'bin', 'turbo.js'),
    join(rootNodeModules, 'turbo', 'bin', 'turbo'),
  ];
  for (const possiblePath of possiblePaths) {
    if (existsSync(possiblePath)) {
      turboPath = possiblePath;
      return turboPath;
    }
  }

  // 尝试使用 require.resolve
  try {
    turboPath = require.resolve('turbo/bin/turbo.js');
    return turboPath;
  } catch (e) {
    try {
      turboPath = require.resolve('turbo/bin/turbo');
      return turboPath;
    } catch (e2) {
      // 仍然找不到
    }
  }

  throw new Error('Cannot find turbo. Please run: pnpm install');
}

/**
 * 执行 turbo 命令
 * @param {string[]} args - turbo 命令参数
 * @param {object} options - 执行选项
 * @param {string[]} nodeArgs - Node.js 启动参数（可选，用于内存诊断等）
 * @returns {Promise<number>} 退出码
 */
export function runTurbo(args = [], options = {}, nodeArgs = []) {
  return new Promise((resolve, reject) => {
    const turboPath = findTurboPath();
    
    // 在 Windows 上，清除 NODE_PATH 以避免长度限制问题
    const env = { ...process.env };
    if (isWindows) {
      delete env.NODE_PATH;
    }
    // 关键：设置 NODE_ENV=development，确保 Node.js 能识别 package.json exports 中的 development 条件
    // 这样 shared-components 等包在开发环境下会使用源码路径（./src/index.ts）而不是构建产物（./dist/index.mjs）
    if (!env.NODE_ENV) {
      env.NODE_ENV = 'development';
    }

    // 合并 Node.js 参数（如果提供）
    const finalNodeArgs = nodeArgs.length > 0 
      ? [...nodeArgs, turboPath, ...args]
      : [turboPath, ...args];

    const child = spawn('node', finalNodeArgs, {
      cwd: options.cwd || getRootDir(),
      stdio: options.stdio || 'inherit',
      shell: false,
      env: { ...env, ...options.env },
    });

    child.on('close', (code) => {
      resolve(code || 0);
    });

    child.on('error', (err) => {
      logger.error('Failed to start turbo:', err);
      reject(err);
    });
  });
}
