/**
 * Shell 命令执行封装
 * 跨平台 Shell 命令执行工具
 */

import { spawn, spawnSync } from 'child_process';
import { logger } from './logger.mjs';

const isWindows = process.platform === 'win32';

/**
 * 异步执行 Shell 命令
 * @param {string} command - 命令
 * @param {string[]} args - 参数
 * @param {object} options - 执行选项
 * @returns {Promise<{code: number, stdout: string, stderr: string}>}
 */
export function execAsync(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const cmd = isWindows && !command.endsWith('.exe') && !command.endsWith('.cmd') 
      ? `${command}.cmd` 
      : command;

    const child = spawn(cmd, args, {
      stdio: options.stdio || 'pipe',
      shell: isWindows,
      env: { ...process.env, ...options.env },
      cwd: options.cwd,
      ...options,
    });

    let stdout = '';
    let stderr = '';

    if (child.stdout) {
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    child.on('close', (code) => {
      resolve({ code: code || 0, stdout, stderr });
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * 同步执行 Shell 命令
 * @param {string} command - 命令
 * @param {string[]} args - 参数
 * @param {object} options - 执行选项
 * @returns {{code: number, stdout: string, stderr: string}}
 */
export function execSync(command, args = [], options = {}) {
  const cmd = isWindows && !command.endsWith('.exe') && !command.endsWith('.cmd') 
    ? `${command}.cmd` 
    : command;

  const result = spawnSync(cmd, args, {
    stdio: options.stdio || 'pipe',
    shell: isWindows,
    env: { ...process.env, ...options.env },
    cwd: options.cwd,
    ...options,
  });

  return {
    code: result.status || 0,
    stdout: result.stdout?.toString() || '',
    stderr: result.stderr?.toString() || '',
  };
}

/**
 * 执行命令并显示输出
 * @param {string} command - 命令
 * @param {string[]} args - 参数
 * @param {object} options - 执行选项
 * @returns {Promise<number>} 退出码
 */
export function execWithOutput(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const cmd = isWindows && !command.endsWith('.exe') && !command.endsWith('.cmd') 
      ? `${command}.cmd` 
      : command;

    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: isWindows,
      env: { ...process.env, ...options.env },
      cwd: options.cwd,
      ...options,
    });

    child.on('close', (code) => {
      resolve(code || 0);
    });

    child.on('error', (err) => {
      logger.error(`执行命令失败: ${command}`, err);
      reject(err);
    });
  });
}
