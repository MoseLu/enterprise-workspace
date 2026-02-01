/**
 * 命令系统工具函数
 */
import { logger } from '../../utils/logger.mjs';

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const rootDir = resolve(__dirname, '../..');

/**
 * 执行命令
 */
export function executeCommand(command, options = {}) {
  try {
    execSync(command, {
      stdio: 'inherit',
      cwd: rootDir,
      shell: true,
      ...options,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      exitCode: error.status || 1,
    };
  }
}

/**
 * 格式化命令显示
 */
export function formatCommand(command) {
  return `\x1b[36m${command}\x1b[0m`;
}

/**
 * 显示执行前的提示
 */
export function showCommandPreview(command, description) {
  logger.info('\n' + '='.repeat(60));
  if (description) {
    logger.info(`\x1b[33m${description}\x1b[0m`);
  }
  logger.info(`执行命令: ${formatCommand(command)}`);
  logger.info('='.repeat(60) + '\n');
}

/**
 * 显示成功消息
 */
export function showSuccess(message) {
  logger.info(`\x1b[32m✓\x1b[0m ${message}`);
}

/**
 * 显示错误消息
 */
export function showError(message) {
  logger.error(`\x1b[31m✗\x1b[0m ${message}`);
}

/**
 * 显示信息消息
 */
export function showInfo(message) {
  logger.info(`\x1b[34mℹ\x1b[0m ${message}`);
}

/**
 * 显示警告消息
 */
export function showWarning(message) {
  logger.info(`\x1b[33m⚠\x1b[0m ${message}`);
}

