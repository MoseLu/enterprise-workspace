#!/usr/bin/env node

/**
 * 统一开发脚本
 * 使用 turbo 统一管理所有应用的开发服务器
 * 替代当前的 concurrently 方式
 */
import { logger } from '../../utils/logger.mjs';

// 导入已更新为使用新的 utils 模块
import { getDefaultDevApps, parseAppArgs, getAppPackageNames } from '../../utils/monorepo-helper.mjs';
import { getRootDir } from '../../utils/path-helper.mjs';
import { runTurbo } from '../../utils/turbo-helper.mjs';
import { interceptCommand } from '../skills/command-interceptor.mjs';
import { ensureSnapshotDir, getSnapshotDir } from '../../utils/heap-snapshot-manager.mjs';
import { join } from 'path';

const rootDir = getRootDir();

// 初始化堆快照目录
try {
  ensureSnapshotDir();
} catch (error) {
  logger.warn('⚠️  堆快照目录初始化失败，OOM 诊断功能可能不可用:', error.message);
}

// 配置 Node.js 内存诊断参数
// 注意：很多诊断参数（如 --heap-dump-on-out-of-memory、--trace-gc）不能通过 NODE_OPTIONS 传递
// 只能在启动时直接作为 node 参数传递
// 对于通过 turbo 启动的子进程，我们只能传递 --max-old-space-size（这是唯一允许的内存相关参数）
const snapshotDir = getSnapshotDir();
// 只传递允许在 NODE_OPTIONS 中使用的参数（仅内存限制）
const nodeOptions = '--max-old-space-size=4096';

async function runTurboDev(apps = null) {
  const args = ['run', 'dev'];
  
  if (apps && apps.length > 0) {
    const packages = getAppPackageNames(apps);
    if (packages.length > 0) {
      args.push('--filter', packages.join('...'));
    }
  }
  
  // 设置并发数为 30，基于 14 核 20 线程 CPU 优化（当前有 22 个工作空间）
  args.push('--concurrency=30');

  logger.info(`🚀 启动开发服务器...`);
  if (apps && apps.length > 0) {
    logger.info(`📦 应用: ${apps.map(app => app.displayName).join(', ')}`);
  } else {
    logger.info(`📦 所有应用`);
  }
  logger.info(`📊 内存诊断已启用: 堆快照目录=${snapshotDir}`);

  // 通过环境变量传递 Node.js 参数给所有子进程
  const code = await runTurbo(args, {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: nodeOptions
    }
  });
  
  // 返回结果，让拦截器处理退出
  if (code !== 0) {
    throw new Error(`Turbo命令执行失败，退出码: ${code}`);
  }
  
  return { success: true, code };
}

// 主逻辑（自动记录dev-workflow skill执行）
const args = process.argv.slice(2);

(async () => {
  const commandName = args.length === 0 ? 'dev' : (args[0] === '--all' || args[0] === '-a' ? 'dev:all' : 'dev:app');
  
  try {
    const result = await interceptCommand(commandName, async () => {
      if (args.length === 0) {
        // 使用默认开发应用列表
        const defaultApps = getDefaultDevApps();
        return await runTurboDev(defaultApps);
      } else if (args[0] === '--all' || args[0] === '-a') {
        // 启动所有应用
        return await runTurboDev(null);
      } else {
        // 启动指定应用
        const apps = parseAppArgs(args);
        return await runTurboDev(apps);
      }
    }, {
      context: {
        args,
        description: `启动开发服务器${args.length > 0 ? `: ${args.join(' ')}` : ''}`
      },
      longRunning: true // 标记为长期运行命令
    });
    
    // 如果是长期运行命令，拦截器已异步执行，这里只需要等待（不退出）
    if (result && result.longRunning) {
      logger.info('✅ 开发服务器启动中，skill执行已记录...');
      // interceptCommand 已经异步执行了命令，不需要再次执行
      // 不退出，让服务器继续运行
    }
  } catch (error) {
    logger.error('❌ 启动失败:', error);
    process.exit(1);
  }
})();
