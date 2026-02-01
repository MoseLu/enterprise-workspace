/**
 * 命令包装器
 * 提供通用的命令执行包装，自动记录skill执行
 * 可以在package.json的scripts中使用
 */

import { interceptCommand, identifySkillForCommand } from './command-interceptor.mjs';
import { logger } from './utils/logger.mjs';
import { spawn } from 'child_process';

/**
 * 执行命令并自动记录skill
 * @param {string} command - 命令名称（如 dev:all）
 * @param {array} args - 命令参数
 * @param {object} options - 选项
 */
export async function executeCommandWithTracking(command, args = [], options = {}) {
  const skillName = identifySkillForCommand(command);
  
  if (!skillName) {
    logger.debug(`[CommandWrapper] 命令 "${command}" 无对应skill，直接执行`);
    return executeCommand(command, args, options);
  }
  
  logger.info(`[CommandWrapper] 执行命令 "${command}"，自动记录skill: ${skillName}`);
  
  return interceptCommand(command, async () => {
    return executeCommand(command, args, options);
  }, {
    context: {
      args,
      ...options
    }
  });
}

/**
 * 执行命令（不记录skill）
 */
function executeCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    // 这里需要根据实际命令执行
    // 由于命令可能是pnpm script，需要特殊处理
    const process = spawn('pnpm', [command, ...args], {
      cwd: options.cwd || process.cwd(),
      stdio: options.stdio || 'inherit',
      shell: true
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, code });
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * CLI入口：包装命令执行
 * 用法: node scripts/commands/skills/command-wrapper.mjs <command> [args...]
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  if (!command) {
    console.error('用法: node command-wrapper.mjs <command> [args...]');
    process.exit(1);
  }
  
  executeCommandWithTracking(command, args)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('命令执行失败:', error);
      process.exit(1);
    });
}
