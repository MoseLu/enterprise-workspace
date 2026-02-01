#!/usr/bin/env node
/**
 * 清理指定端口的脚本
 * 用于在启动开发服务器前清理可能残留的进程
 */
import { logger } from '@btc/shared-core';

import { execSync } from 'child_process';

// docs-app 的端口配置（与 .vitepress/config.ts 中的配置保持一致）
// 端口已更新为 8094，避免与其他应用冲突
const port = 8094;

/**
 * 清理指定端口
 */
function killPort(port) {
  try {
    // Windows: 查找占用端口的进程
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
    const lines = result.trim().split('\n').filter(line => line.includes('LISTENING'));
    
    if (lines.length === 0) {
      logger.info(`✅ 端口 ${port} 未被占用`);
      return;
    }

    // 提取进程 ID
    const pids = new Set();
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid)) {
        pids.add(pid);
      }
    }

    // 终止进程
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        logger.info(`✅ 已终止占用端口 ${port} 的进程 (PID: ${pid})`);
      } catch (error) {
        // 进程可能已经不存在，忽略错误
        logger.info(`⚠️  无法终止进程 ${pid}（可能已不存在）`);
      }
    }
  } catch (error) {
    // 如果没有找到占用端口的进程，netstat 会返回错误，这是正常的
    if (error.message && error.message.includes('findstr')) {
      logger.info(`✅ 端口 ${port} 未被占用`);
    } else {
      logger.error(`❌ 清理端口 ${port} 时出错:`, error.message);
    }
  }
}

// 清理主端口
logger.info(`🔍 检查端口 ${port}...`);
killPort(port);
logger.info(`✅ 端口清理完成\n`);

