#!/usr/bin/env node

/**
 * dev:all 在新窗口启动脚本
 * 在独立的 PowerShell 窗口中启动开发服务器
 */

import { logger } from '../../utils/logger.mjs';
import { getRootDir } from '../../utils/path-helper.mjs';
import { checkAndKillPorts } from './port-manager.mjs';
import { spawn } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = getRootDir();

/**
 * 检查端口占用情况并自动停止Node.js进程
 */
function checkPorts() {
  try {
    const result = checkAndKillPorts(true); // 自动停止
    
    if (result.hasOccupied && result.killedCount === 0) {
      // 有占用但无法自动停止（可能是系统进程）
      logger.warn('\n⚠️  部分端口被占用且无法自动停止，请手动处理\n');
      // 不退出，让用户决定是否继续
    } else if (result.killedCount > 0) {
      logger.info(`\n✅ 已清理 ${result.killedCount} 个占用端口的Node.js进程，可以继续启动\n`);
    }
  } catch (error) {
    logger.error('端口检查失败:', error);
    // 不退出，让启动继续
  }
}

/**
 * 在新窗口中启动开发服务器
 */
function startDevInNewWindow() {
  // 先检查端口
  checkPorts();
  
  // 构建要在新窗口中执行的命令
  // 使用 dev-all.mjs 而不是 dev-with-check.mjs，避免重复检查端口和skill记录
  const devScriptPath = join(rootDir, 'scripts', 'commands', 'dev', 'dev-all.mjs');
  
  logger.info('🚀 正在新窗口中启动开发服务器...\n');
  logger.info(`📁 工作目录: ${rootDir}\n`);
  
  // 在 Windows 中使用 PowerShell 启动新窗口
  if (process.platform === 'win32') {
    // 转义路径中的特殊字符（PowerShell 需要转义单引号）
    const escapedPath = rootDir.replace(/'/g, "''");
    const escapedScriptPath = devScriptPath.replace(/'/g, "''");
    
    // 构建要在新窗口中执行的命令
    const command = `cd '${escapedPath}'; Write-Host '🚀 开发服务器启动中...' -ForegroundColor Cyan; Write-Host ''; node '${escapedScriptPath}'`;
    
    // 使用 Start-Process 启动新的 PowerShell 窗口
    // -NoExit: 保持窗口打开
    // -Command: 执行命令
    try {
      const psArgs = [
        '-NoExit',
        '-Command',
        command
      ];
      
      spawn('powershell', psArgs, {
        stdio: 'inherit',
        shell: false,
        detached: true
      });
      
      logger.info('✅ 开发服务器将在新窗口中启动\n');
      logger.info('💡 提示：开发服务器运行在新窗口中，您可以关闭当前窗口\n');
      logger.info('💡 要停止服务器，请在新窗口中按 Ctrl+C\n');
    } catch (error) {
      logger.error('❌ 启动新窗口失败:', error);
      logger.info('\n💡 请手动在新终端中运行:');
      logger.info(`   cd "${rootDir}"`);
      logger.info(`   pnpm dev:all\n`);
    }
  } else {
    // Linux/Mac 使用 xterm 或 gnome-terminal
    logger.warn('⚠️  非 Windows 系统，请手动在新终端中运行:');
    logger.info(`   cd "${rootDir}"`);
    logger.info(`   pnpm dev:all\n`);
  }
}

// 主逻辑
startDevInNewWindow();
