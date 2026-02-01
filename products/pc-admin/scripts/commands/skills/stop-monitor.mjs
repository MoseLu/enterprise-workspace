#!/usr/bin/env node

/**
 * 停止监控服务
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function stopMonitor() {
  try {
    // 查找占用 3001 端口的进程
    const { stdout } = await execAsync('netstat -ano | findstr :3001');
    
    if (!stdout.trim()) {
      console.log('❌ 监控服务未运行');
      return;
    }

    // 提取 PID
    const lines = stdout.trim().split('\n');
    const pids = new Set();
    
    for (const line of lines) {
      const match = line.match(/\s+(\d+)\s*$/);
      if (match) {
        pids.add(match[1]);
      }
    }

    // 终止进程
    for (const pid of pids) {
      try {
        await execAsync(`taskkill /F /PID ${pid}`);
        console.log(`✅ 已停止进程 ${pid}`);
      } catch (error) {
        console.error(`❌ 停止进程 ${pid} 失败:`, error.message);
      }
    }

    console.log('✅ 监控服务已停止');
  } catch (error) {
    if (error.message.includes('findstr')) {
      console.log('❌ 监控服务未运行');
    } else {
      console.error('❌ 停止监控服务失败:', error.message);
    }
  }
}

stopMonitor();
