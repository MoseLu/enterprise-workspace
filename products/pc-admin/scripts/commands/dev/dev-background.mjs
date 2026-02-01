#!/usr/bin/env node

/**
 * 后台启动 dev:all 脚本
 * 在后台运行开发服务器，不影响当前终端
 */
import { logger } from '../../utils/logger.mjs';
import { getRootDir } from '../../utils/path-helper.mjs';
import { join } from 'path';
import { existsSync, writeFileSync, readFileSync, unlinkSync } from 'fs';
import { spawn } from 'child_process';
import { platform } from 'os';

const rootDir = getRootDir();
const pidFile = join(rootDir, '.dev-all.pid');
const logFile = join(rootDir, '.dev-all.log');

/**
 * 检查是否已有 dev:all 在运行
 */
function isDevAllRunning() {
  if (!existsSync(pidFile)) {
    return false;
  }
  
  try {
    const pid = parseInt(readFileSync(pidFile, 'utf-8').trim());
    if (isNaN(pid)) {
      return false;
    }
    
    // 检查进程是否存在
    try {
      process.kill(pid, 0); // 信号 0 只检查进程是否存在，不发送信号
      return true;
    } catch (error) {
      // 进程不存在，删除 PID 文件
      unlinkSync(pidFile);
      return false;
    }
  } catch (error) {
    return false;
  }
}

/**
 * 停止所有 dev 进程
 */
function stopAllDev() {
  if (!existsSync(pidFile)) {
    logger.info('✅ 没有运行中的 dev:all 进程');
    return;
  }
  
  try {
    const pid = parseInt(readFileSync(pidFile, 'utf-8').trim());
    if (isNaN(pid)) {
      logger.warn('⚠️  PID 文件格式错误');
      unlinkSync(pidFile);
      return;
    }
    
    logger.info(`🛑 正在停止 dev:all 进程 (PID: ${pid})...`);
    
    // 在 Windows 上使用 taskkill，在 Unix 上使用 kill
    if (platform() === 'win32') {
      // Windows: 使用 taskkill 停止进程及其子进程
      const taskkill = spawn('taskkill', ['/F', '/T', '/PID', pid.toString()], {
        stdio: 'inherit',
        shell: true
      });
      
      taskkill.on('close', (code) => {
        if (code === 0) {
          logger.info('✅ dev:all 进程已停止');
        } else {
          logger.warn('⚠️  停止进程时出现问题，可能进程已不存在');
        }
        // 删除 PID 文件
        if (existsSync(pidFile)) {
          unlinkSync(pidFile);
        }
      });
    } else {
      // Unix: 使用 kill 停止进程及其子进程
      try {
        process.kill(pid, 'SIGTERM');
        // 等待一下，如果还没停止，强制停止
        setTimeout(() => {
          try {
            process.kill(pid, 'SIGKILL');
          } catch (e) {
            // 进程可能已经停止
          }
        }, 2000);
        logger.info('✅ dev:all 进程已停止');
      } catch (error) {
        logger.warn('⚠️  停止进程时出现问题，可能进程已不存在');
      }
      // 删除 PID 文件
      if (existsSync(pidFile)) {
        unlinkSync(pidFile);
      }
    }
    
    // 同时停止所有相关的 node 进程（turbo 启动的子进程）
    // 注意：由于 turbo 会启动多个子进程，我们需要停止整个进程树
    // taskkill /T 已经处理了子进程，所以这里不需要额外操作
    logger.info('✅ 所有开发服务器进程已清理');
  } catch (error) {
    logger.error('❌ 停止 dev:all 失败:', error);
  }
}

/**
 * 后台启动 dev:all
 */
async function startDevAllBackground() {
  if (isDevAllRunning()) {
    logger.warn('⚠️  dev:all 已在运行中，请先使用 pnpm dev:stop 停止');
    return;
  }
  
  logger.info('🚀 正在后台启动 dev:all...');
  
  const devScriptPath = join(rootDir, 'scripts', 'commands', 'dev', 'dev-with-check.mjs');
  
  if (platform() === 'win32') {
    // Windows: 使用 Start-Process 后台启动
    // 创建临时 PowerShell 脚本文件
    const { writeFileSync: writeFile } = await import('fs');
    const tempPsScript = join(rootDir, '.dev-all-start.ps1');
    
    const errorLogFile = logFile.replace(/\.log$/, '.error.log');
    const psScriptContent = `$scriptPath = "${devScriptPath.replace(/\\/g, '\\\\')}"
$logFile = "${logFile.replace(/\\/g, '\\\\')}"
$errorLogFile = "${errorLogFile.replace(/\\/g, '\\\\')}"
$pidFile = "${pidFile.replace(/\\/g, '\\\\')}"

# 确保日志文件目录存在
$logDir = Split-Path -Parent $logFile
if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# 启动进程（标准输出和标准错误分别重定向）
$process = Start-Process -FilePath "node" -ArgumentList $scriptPath -PassThru -WindowStyle Hidden -RedirectStandardOutput $logFile -RedirectStandardError $errorLogFile

# 保存 PID
$process.Id | Out-File -FilePath $pidFile -Encoding utf8 -NoNewline

Write-Host "✅ dev:all 已在后台启动 (PID: $($process.Id))"
Write-Host "📝 日志文件: $logFile"
Write-Host "📝 错误日志: $errorLogFile"
Write-Host "🛑 停止命令: pnpm dev:stop"
`;
    
    // 写入临时脚本文件
    writeFile(tempPsScript, psScriptContent, 'utf-8');
    
    const ps = spawn('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', tempPsScript], {
      stdio: 'inherit',
      shell: true,
      cwd: rootDir
    });
    
    ps.on('close', async (code) => {
      // 删除临时脚本文件
      try {
        const { unlinkSync } = await import('fs');
        if (existsSync(tempPsScript)) {
          unlinkSync(tempPsScript);
        }
      } catch (e) {
        // 忽略删除错误
      }
      
      if (code === 0) {
        // 等待一下，确保 PID 文件已写入
        setTimeout(() => {
          if (existsSync(pidFile)) {
            try {
              const pid = readFileSync(pidFile, 'utf-8').trim();
              const errorLogFile = logFile.replace(/\.log$/, '.error.log');
              logger.info(`\n✅ dev:all 已在后台启动 (PID: ${pid})`);
              logger.info(`📝 日志文件: ${logFile}`);
              logger.info(`📝 错误日志: ${errorLogFile}`);
              logger.info('🛑 停止命令: pnpm dev:stop');
            } catch (e) {
              const errorLogFile = logFile.replace(/\.log$/, '.error.log');
              logger.info('\n✅ dev:all 已在后台启动');
              logger.info(`📝 日志文件: ${logFile}`);
              logger.info(`📝 错误日志: ${errorLogFile}`);
              logger.info('🛑 停止命令: pnpm dev:stop');
            }
          }
        }, 500);
      } else {
        logger.error('❌ 启动失败');
      }
    });
  } else {
    // Unix: 使用 nohup 后台启动
    const child = spawn('nohup', ['node', devScriptPath], {
      detached: true,
      stdio: ['ignore', 'ignore', 'ignore'],
      cwd: rootDir
    });
    
    // 保存 PID
    writeFileSync(pidFile, child.pid.toString());
    
    // 重定向输出到日志文件
    const logStream = require('fs').createWriteStream(logFile, { flags: 'a' });
    child.stdout?.pipe(logStream);
    child.stderr?.pipe(logStream);
    
    child.unref(); // 让父进程可以退出
    
    logger.info(`✅ dev:all 已在后台启动 (PID: ${child.pid})`);
    logger.info(`📝 日志文件: ${logFile}`);
    logger.info('🛑 停止命令: pnpm dev:stop');
  }
}

// 主逻辑
const command = process.argv[2];

(async () => {
  if (command === 'stop') {
    stopAllDev();
  } else if (command === 'start' || !command) {
    await startDevAllBackground();
  } else {
    logger.error('❌ 未知命令:', command);
    logger.info('用法:');
    logger.info('  pnpm dev:all:background    # 后台启动 dev:all');
    logger.info('  pnpm dev:stop              # 停止所有 dev 进程');
    process.exit(1);
  }
})();
