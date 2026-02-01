#!/usr/bin/env node

/**
 * 错误监控服务
 * 独立的后台服务，用于监控开发、构建等命令的错误
 */

import { getMonitorServer } from './dev-error-monitor-server.mjs';
import { initDatabase } from './database/init.mjs';
import { logger } from './utils/logger.mjs';
import { DevErrorListener } from './dev-error-listener.mjs';
import { reportError } from './dev-error-reporter.mjs';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getRootDir } from '../../utils/path-helper.mjs';
import { getAllApps, getAppById } from '../../utils/monorepo-helper.mjs';
import treeKill from 'tree-kill';
import { startMonitoring, stopMonitoring, getMemoryReport } from '../../utils/memory-monitor.mjs';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = getRootDir();

// 全局状态
let monitorServer = null;
let activeListeners = new Map(); // commandId -> { listener, process, command, args }
let commandCounter = 0;
let memoryMonitor = null; // 内存监控实例

// Dev 服务器管理
let devServerProcesses = new Map(); // appId -> { process, app, status, startTime, logs }
let devStatusClients = new Set(); // SSE 客户端连接（用于推送dev服务器状态）

// 限制全局 Map/Set 的大小，防止内存泄漏
const MAX_ACTIVE_LISTENERS = 50; // 最多同时管理 50 个命令
const MAX_DEV_SERVER_PROCESSES = 30; // 最多同时管理 30 个 dev 服务器
const MAX_DEV_STATUS_CLIENTS = 100; // 最多同时支持 100 个 SSE 客户端

/**
 * 启动监控服务
 */
async function startMonitorService() {
  try {
    // 初始化数据库
    initDatabase();
    logger.info('[MonitorService] 数据库已初始化');

    // 启动内存监控
    try {
      memoryMonitor = startMonitoring({
        interval: 10000, // 每 10 秒监控一次（监控服务不需要太频繁）
        maxHeapSize: 4096 * 1024 * 1024, // 4GB
        onWarning: ({ name, memUsage, threshold }) => {
          logger.warn(`[MonitorService] ⚠️  内存警告: ${name} 使用 ${(threshold.usagePercent * 100).toFixed(1)}%`);
        },
        onCritical: ({ name, memUsage, threshold }) => {
          logger.error(`[MonitorService] 🚨 内存严重警告: ${name} 使用 ${(threshold.usagePercent * 100).toFixed(1)}%，可能即将 OOM！`);
        },
        processes: [] // 子进程将在启动时添加
      });
      logger.info('[MonitorService] 内存监控已启动');
    } catch (error) {
      logger.warn('[MonitorService] 内存监控启动失败:', error.message);
    }

    // 启动监控服务器
    monitorServer = getMonitorServer({ port: 3001 });
    
    // 检查服务器是否已启动
    if (!monitorServer.server) {
      monitorServer.start();
      // 等待服务器启动完成
      await new Promise((resolve, reject) => {
        if (!monitorServer.server) {
          // 如果服务器创建失败，等待一下再检查
          setTimeout(() => {
            if (monitorServer.server) {
              monitorServer.server.once('listening', () => {
                logger.info(`[MonitorService] 错误监控服务器已启动: ${monitorServer.getUrl()}`);
                resolve();
              });
              monitorServer.server.once('error', (error) => {
                if (error.code !== 'EADDRINUSE') {
                  reject(error);
                } else {
                  logger.warn(`[MonitorService] 端口 ${3001} 已被占用，可能已有服务在运行`);
                  resolve(); // 即使端口被占用，也继续（可能是之前的实例）
                }
              });
            } else {
              reject(new Error('服务器创建失败'));
            }
          }, 100);
        } else {
          // 服务器已创建，等待监听事件
          if (monitorServer.server.listening) {
            // 服务器已经在监听
            logger.info(`[MonitorService] 错误监控服务器已启动: ${monitorServer.getUrl()}`);
            resolve();
          } else {
            monitorServer.server.once('listening', () => {
              logger.info(`[MonitorService] 错误监控服务器已启动: ${monitorServer.getUrl()}`);
              resolve();
            });
            monitorServer.server.once('error', (error) => {
              if (error.code !== 'EADDRINUSE') {
                reject(error);
              } else {
                logger.warn(`[MonitorService] 端口 ${3001} 已被占用，可能已有服务在运行`);
                resolve(); // 即使端口被占用，也继续（可能是之前的实例）
              }
            });
          }
        }
      });
    } else {
      logger.info(`[MonitorService] 错误监控服务器已在运行: ${monitorServer.getUrl()}`);
    }

    // 设置 API 路由（必须在服务器启动后）
    setupAPIRoutes();

    // 处理进程退出
    // 注意：不要监听 'exit' 事件，因为它会在进程正常退出时触发，导致服务器被关闭
    // 只在收到信号时关闭服务器
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    // 移除 'exit' 事件监听，避免在正常退出时关闭服务器
    // process.on('exit', gracefulShutdown);

    // 保持进程运行
    logger.info('[MonitorService] 监控服务已启动，等待命令...');
    logger.info('[MonitorService] 按 Ctrl+C 停止服务');
    
    // 防止进程退出
    // 方法1：尝试恢复 stdin（交互式终端）
    try {
      if (process.stdin.isTTY) {
        process.stdin.resume();
      }
    } catch (e) {
      // stdin 可能不可用，忽略
    }
    
    // 方法2：设置一个定期清理任务（非交互式终端）
    // 这样可以防止 Node.js 在没有活跃句柄时自动退出，同时定期清理内存
    const keepAliveInterval = setInterval(() => {
      // 定期清理无效客户端和过期数据
      cleanupResources();
    }, 5 * 60 * 1000); // 每 5 分钟执行一次清理
    
    // 在进程退出时清除定时器
    process.on('exit', () => {
      clearInterval(keepAliveInterval);
    });
    
    // 方法3：保持服务器连接活跃
    if (monitorServer && monitorServer.server) {
      // 服务器已经在监听，会保持进程运行
      // 但为了确保，我们检查一下
    }
  } catch (error) {
    logger.error('[MonitorService] 启动失败:', error);
    console.error('[MonitorService] 错误详情:', error);
    process.exit(1);
  }
}

/**
 * 设置 API 路由
 */
function setupAPIRoutes() {
  const server = monitorServer.server;
  if (!server) {
    logger.warn('[MonitorService] 无法设置 API 路由：服务器未启动');
    return;
  }

  // 保存原始 request handler（DevErrorMonitorServer 创建的）
  const originalHandler = (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // 提供 HTML 页面
    if (url.pathname === '/' || url.pathname === '/index.html') {
      monitorServer.serveHTML(req, res);
      return;
    }

    // 提供静态文件（favicon/logo）
    if (url.pathname === '/logo.png' || url.pathname === '/favicon.ico') {
      monitorServer.serveStaticFile(req, res, url.pathname);
      return;
    }

    // SSE 端点
    if (url.pathname === '/events') {
      logger.info(`[MonitorService] 处理 SSE 连接请求: ${url.pathname}`);
      monitorServer.handleSSE(req, res);
      return;
    }

    // Dev 服务器状态 SSE 端点
    if (url.pathname === '/sse/dev-status') {
      handleDevStatusSSE(req, res);
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  };
  
  // 获取现有的监听器（DevErrorMonitorServer 创建的）
  const existingListeners = server.listeners('request');
  logger.debug(`[MonitorService] 找到 ${existingListeners.length} 个现有的 request 监听器`);
  
  // 移除所有现有的 request 监听器
  server.removeAllListeners('request');
  
  // 添加新的统一请求处理器
  server.on('request', (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      
      // 记录所有请求（用于调试）
      logger.debug(`[MonitorService] 收到请求: ${req.method} ${url.pathname} from ${req.socket.remoteAddress || 'unknown'}`);

      // API 路由
      if (url.pathname.startsWith('/api/')) {
        handleAPIRequest(req, res, url);
        return;
      }

      // 其他请求使用原始处理器
      originalHandler(req, res);
    } catch (error) {
      logger.error('[MonitorService] 处理请求时出错:', error);
      try {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      } catch (e) {
        // 响应可能已经发送，忽略
      }
    }
  });
  
  logger.info('[MonitorService] API 路由已设置，SSE 端点: /events');
}

/**
 * 处理 API 请求
 */
async function handleAPIRequest(req, res, url) {
  const method = req.method;
  const pathname = url.pathname;

  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 解析请求体
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      let data = {};
      if (body) {
        data = JSON.parse(body);
      }

      // 路由处理
      if (pathname === '/api/commands' && method === 'GET') {
        // 获取所有运行中的命令
        await handleGetCommands(req, res);
      } else if (pathname === '/api/commands' && method === 'POST') {
        // 启动新命令
        await handleStartCommand(req, res, data);
      } else if (pathname.startsWith('/api/commands/') && method === 'DELETE') {
        // 停止命令
        const commandId = pathname.split('/').pop();
        await handleStopCommand(req, res, commandId);
      } else if (pathname === '/api/stats' && method === 'GET') {
        // 获取统计信息
        await handleGetStats(req, res);
      } else if (pathname === '/api/dev/status' && method === 'GET') {
        // 获取所有应用的dev服务器状态
        handleGetDevStatus(req, res);
      } else if (pathname === '/api/dev/start-all' && method === 'POST') {
        // 启动所有应用的dev服务器
        await handleStartAllDevServers(req, res, data);
      } else if (pathname === '/api/dev/stop-all' && method === 'POST') {
        // 停止所有应用的dev服务器
        await handleStopAllDevServers(req, res);
      } else if (pathname.startsWith('/api/dev/start/') && method === 'POST') {
        // 启动单个应用的dev服务器
        const appId = pathname.split('/').pop();
        await handleStartDevServer(req, res, appId);
      } else if (pathname.startsWith('/api/dev/stop/') && method === 'POST') {
        // 停止单个应用的dev服务器
        const appId = pathname.split('/').pop();
        await handleStopDevServer(req, res, appId);
      } else if (pathname === '/api/errors/report' && method === 'POST') {
        // 接收错误上报（从应用代码中上报）
        await handleReportErrors(req, res, data);
      } else if (pathname === '/api/startup/event' && method === 'POST') {
        // 接收启动事件上报
        await handleStartupEvent(req, res, data);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    } catch (error) {
      logger.error('[MonitorService] API 处理错误:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

/**
 * 检测外部进程（通过 dev-with-check.mjs 等启动的）
 * 简化版本：只检测明显的 dev:all 和 build 进程
 */
async function detectExternalProcesses() {
  const detected = [];
  
  try {
    const isWindows = process.platform === 'win32';
    let command;
    
    if (isWindows) {
      // Windows: 使用 wmic 查找包含 dev:all 或 build 的进程
      // 简化查询，只查找包含 "turbo" 和 "dev" 或 "build" 的 node 进程
      command = `wmic process where "name='node.exe' or name='node.cmd'" get processid,commandline /format:list | findstr /i "turbo dev build"`;
    } else {
      // Unix: 使用 ps 命令
      command = `ps aux | grep -E "(turbo|pnpm).*(dev|build)" | grep -v grep | grep -v "monitor-service"`;
    }
    
    logger.debug(`[MonitorService] 执行进程检测命令: ${command.substring(0, 100)}...`);
    
    const { stdout } = await execAsync(command, { 
      maxBuffer: 10 * 1024 * 1024,
      shell: true,
      timeout: 3000, // 3秒超时
      windowsHide: true // Windows: 隐藏命令行窗口
    });
    
    logger.debug(`[MonitorService] 进程检测输出长度: ${stdout?.length || 0} 字符`);
    
    if (stdout && stdout.trim()) {
      const lines = stdout.split('\n').filter(line => line.trim());
      logger.info(`[MonitorService] 解析 ${lines.length} 行进程信息`);
      const seen = new Set();
      
      // Windows 需要先收集所有行，然后配对 ProcessId 和 CommandLine
      let currentPid = null;
      let currentCmd = null;
      let processGroup = {}; // 用于收集一个进程的所有信息
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        if (isWindows) {
          // Windows 格式: CommandLine=xxx 或 ProcessId=xxx
          const cmdMatch = line.match(/CommandLine=(.+)/i);
          const pidMatch = line.match(/ProcessId=(\d+)/i);
          
          if (pidMatch) {
            // 如果之前有收集的完整进程信息，先处理
            if (processGroup.pid && processGroup.cmd) {
              processCommandLine(processGroup.cmd, processGroup.pid, detected, seen);
            }
            // 开始新的进程组
            processGroup = { pid: pidMatch[1].trim(), cmd: null };
          }
          if (cmdMatch) {
            processGroup.cmd = cmdMatch[1].trim();
          }
          
          // 如果同时有 PID 和命令，立即处理
          if (processGroup.pid && processGroup.cmd) {
            processCommandLine(processGroup.cmd, processGroup.pid, detected, seen);
            processGroup = { pid: null, cmd: null }; // 重置
          }
        } else {
          // Unix: 直接处理
          processCommandLine(line, null, detected, seen);
        }
      }
      
      // Windows: 处理最后一个未配对的命令
      if (isWindows && processGroup.pid && processGroup.cmd) {
        processCommandLine(processGroup.cmd, processGroup.pid, detected, seen);
      }
      
      logger.info(`[MonitorService] ✅ 检测到 ${detected.length} 个外部进程`);
      if (detected.length > 0) {
        detected.forEach(cmd => {
          logger.info(`[MonitorService]   - ${cmd.command} (PID: ${cmd.id.split('_')[1] || 'unknown'})`);
        });
      }
    } else {
      logger.warn('[MonitorService] ⚠️  进程检测无输出或输出为空');
    }
  } catch (error) {
    // 记录错误但不影响主要功能
    logger.warn(`[MonitorService] 检测外部进程失败: ${error.message}`);
  }
  
  return detected;
}

/**
 * 处理命令行，提取命令信息
 */
function processCommandLine(commandLine, pid, detected, seen) {
  if (!commandLine || seen.has(commandLine)) {
    return;
  }
  
  // 排除监控服务自身和其他无关进程
  if (commandLine.includes('monitor-service') || 
      commandLine.includes('monitor.js') ||
      commandLine.includes('dev-error-monitor') ||
      !commandLine.includes('turbo') && !commandLine.includes('pnpm')) {
    return;
  }
  
  // 判断命令类型 - 更宽松的匹配
  // 匹配包含 "turbo run dev" 或 "turbo.js run dev" 或 "dev:all" 或 "dev-all-with-check" 的进程
  const hasTurboDev = /turbo.*run.*dev|turbo.*dev/i.test(commandLine);
  const hasPnpmDev = /pnpm.*dev/i.test(commandLine) && !commandLine.includes('monitor');
  const hasDevAll = /dev:all|dev-all-with-check/i.test(commandLine);
  const isDevAll = hasTurboDev || hasPnpmDev || hasDevAll;
  
  // 匹配包含 "turbo run build" 或 "pnpm build" 的进程
  const hasTurboBuild = /turbo.*run.*build|turbo.*build/i.test(commandLine);
  const hasPnpmBuild = /pnpm.*build/i.test(commandLine);
  const isBuild = (hasTurboBuild || hasPnpmBuild) && !isDevAll;
  
  if (isDevAll || isBuild) {
    seen.add(commandLine);
    
    // 提取命令和参数
    const cmd = isDevAll ? 'dev:all' : 'build';
    const args = [];
    
    // 提取参数
    // 匹配 "turbo run dev" 或 "turbo.js run dev" 或 "pnpm dev" 等
    let match = commandLine.match(/(?:turbo|turbo\.js|pnpm)\s+(?:run\s+)?(\w+(?::\w+)?)(?:\s+(.+))?/i);
    if (match) {
      const subCmd = match[1];
      if (subCmd === 'dev' || subCmd === 'dev:all') {
        args.push('dev');
      } else if (subCmd === 'build') {
        args.push('build');
      }
      if (match[2]) {
        // 提取额外参数，但排除一些常见参数
        const extraArgs = match[2].split(/\s+/).filter(a => 
          a && 
          !a.startsWith('--') && 
          !a.includes('node_modules') &&
          !a.includes('.js') &&
          !a.includes('.mjs') &&
          !a.includes('scripts/')
        );
        args.push(...extraArgs);
      }
    } else if (hasDevAll) {
      // 如果是 dev-all-with-check.mjs，直接使用 dev:all
      args.push('dev');
    }
    
    detected.push({
      id: `external_${pid || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      command: cmd,
      args: args.length > 0 ? args : [cmd],
      status: 'running',
      startTime: Date.now() - 120000 // 估算启动时间（2分钟前）
    });
    
    logger.info(`[MonitorService] ✅ 检测到外部进程: ${cmd} (PID: ${pid || 'unknown'})`);
    logger.debug(`[MonitorService]   命令行: ${commandLine.substring(0, 150)}...`);
  }
}

/**
 * 获取所有运行中的命令
 */
async function handleGetCommands(req, res) {
  logger.debug('[MonitorService] 处理 GET /api/commands 请求');
  
  // 获取 monitor-service 管理的命令
  const managedCommands = Array.from(activeListeners.entries()).map(([id, info]) => ({
    id,
    command: info.command,
    args: info.args,
    status: info.process && !info.process.killed ? 'running' : 'stopped',
    startTime: info.startTime
  }));
  
  logger.debug(`[MonitorService] 管理的命令数: ${managedCommands.length}`);

  // 检测外部进程（通过 dev-with-check.mjs 等启动的）
  let detectedCommands = [];
  try {
    detectedCommands = await detectExternalProcesses();
    logger.debug(`[MonitorService] 检测到的外部进程数: ${detectedCommands.length}`);
  } catch (error) {
    logger.warn(`[MonitorService] 检测外部进程失败: ${error.message}`);
  }
  
  // 合并命令列表（去重：如果命令和参数相同，只保留一个）
  const allCommands = [...managedCommands];
  const seenKeys = new Set(managedCommands.map(c => `${c.command}_${c.args.join('_')}`));
  
  for (const cmd of detectedCommands) {
    const key = `${cmd.command}_${cmd.args.join('_')}`;
    if (!seenKeys.has(key)) {
      allCommands.push(cmd);
      seenKeys.add(key);
    }
  }

  logger.info(`[MonitorService] 返回 ${allCommands.length} 个命令（管理的: ${managedCommands.length}, 检测的: ${detectedCommands.length}）`);
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ commands: allCommands }));
}

/**
 * 启动命令
 */
async function handleStartCommand(req, res, data) {
  const { command, args = [] } = data;

  if (!command) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'command is required' }));
    return;
  }

  try {
    const commandId = `cmd_${++commandCounter}_${Date.now()}`;
    const result = await startCommand(commandId, command, args);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      commandId: result.commandId,
      message: `命令已启动: ${command} ${args.join(' ')}`
    }));
  } catch (error) {
    logger.error('[MonitorService] 启动命令失败:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

/**
 * 停止命令
 */
async function handleStopCommand(req, res, commandId) {
  const info = activeListeners.get(commandId);
  if (!info) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Command not found' }));
    return;
  }

  try {
    await stopCommand(commandId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: '命令已停止' }));
  } catch (error) {
    logger.error('[MonitorService] 停止命令失败:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

/**
 * 获取统计信息
 */
async function handleGetStats(req, res) {
  const { getDbManager } = await import('./database/db.mjs');
  const db = getDbManager();

  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN severity = 'error' THEN 1 ELSE 0 END) as errors,
        SUM(CASE WHEN severity = 'warning' THEN 1 ELSE 0 END) as warnings,
        SUM(CASE WHEN severity = 'info' THEN 1 ELSE 0 END) as info
      FROM dev_errors
      WHERE last_seen_at >= strftime('%s', 'now', '-1 day')
    `).get();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats || { total: 0, critical: 0, errors: 0, warnings: 0, info: 0 }));
  } catch (error) {
    logger.error('[MonitorService] 获取统计失败:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

/**
 * 启动命令并监听错误
 */
async function startCommand(commandId, command, args) {
  // 创建错误监听器
  const errorListener = new DevErrorListener({
    minSeverity: 'warning',
    autoReport: true,
    reportThreshold: 1,
    debounceMs: 3000
  });

  // 监听上报事件
  errorListener.on('report', async (error, dbRecord) => {
    logger.info(`[MonitorService] 检测到错误: ${error.errorType} - ${error.packageName || '未知'}`);
    try {
      await reportError(error, dbRecord, { useCursor: false });
    } catch (err) {
      logger.error('[MonitorService] 上报错误失败:', err);
    }
  });

  errorListener.on('error', () => {});
  errorListener.on('warning', () => {});

  // 启动监听器
  errorListener.start();

  // 根据命令类型启动进程
  let process;
  if (command === 'dev:all' || command === 'dev') {
    // 开发服务器 - 直接运行 turbo，不通过 dev-with-check.mjs（避免递归）
    process = spawn('pnpm', ['turbo', 'run', 'dev', '--concurrency=30', ...args], {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      windowsHide: true // Windows: 隐藏命令行窗口
    });
  } else if (command === 'build') {
    // 构建命令
    process = spawn('pnpm', ['turbo', 'run', 'build', ...args], {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      windowsHide: true // Windows: 隐藏命令行窗口
    });
  } else if (command.startsWith('turbo ')) {
    // Turbo 命令
    const turboArgs = command.split(' ').slice(1);
    process = spawn('pnpm', ['turbo', ...turboArgs, ...args], {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      windowsHide: true // Windows: 隐藏命令行窗口
    });
  } else {
    // 其他命令
    const [cmd, ...cmdArgs] = command.split(' ');
    process = spawn(cmd, [...cmdArgs, ...args], {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      windowsHide: true // Windows: 隐藏命令行窗口
    });
  }

  // 定义日志监听函数（便于后续移除，防止内存泄漏）
  const onStdoutData = (chunk) => {
    errorListener.processChunk(chunk, 'stdout');
  };

  const onStderrData = (chunk) => {
    errorListener.processChunk(chunk, 'stderr');
  };

  // 监听进程输出
  process.stdout.on('data', onStdoutData);
  process.stderr.on('data', onStderrData);

  // 监听进程退出
  process.on('exit', (code) => {
    logger.info(`[MonitorService] 命令 ${commandId} 已退出，退出码: ${code}`);
    
    // 关键：移除所有事件监听器，释放资源（防止内存泄漏）
    process.stdout.removeListener('data', onStdoutData);
    process.stderr.removeListener('data', onStderrData);
    process.removeAllListeners();
    
    errorListener.stop();
    activeListeners.delete(commandId);
  });

  process.on('error', (error) => {
    logger.error(`[MonitorService] 命令 ${commandId} 启动失败:`, error);
    
    // 关键：移除所有事件监听器，释放资源（防止内存泄漏）
    process.stdout.removeListener('data', onStdoutData);
    process.stderr.removeListener('data', onStderrData);
    process.removeAllListeners();
    
    errorListener.stop();
    activeListeners.delete(commandId);
  });

  // 限制 activeListeners 大小，防止内存泄漏
  if (activeListeners.size >= MAX_ACTIVE_LISTENERS) {
    // 删除最旧的命令（按启动时间）
    const oldestCommand = Array.from(activeListeners.entries())
      .sort((a, b) => (a[1].startTime || 0) - (b[1].startTime || 0))[0];
    if (oldestCommand) {
      logger.warn(`[MonitorService] 达到最大命令数限制，停止最旧命令: ${oldestCommand[0]}`);
      stopCommand(oldestCommand[0]).catch(err => {
        logger.error(`[MonitorService] 停止最旧命令失败:`, err);
      });
    }
  }

  // 保存监听器信息
  activeListeners.set(commandId, {
    listener: errorListener,
    process,
    command,
    args,
    startTime: Date.now()
  });

  // 将进程添加到内存监控（如果监控已启动）
  if (memoryMonitor && process && process.pid) {
    try {
      memoryMonitor.addProcess({
        id: `command-${commandId}`,
        process: process,
        name: `命令: ${command}`,
        maxHeapSize: 4096 * 1024 * 1024
      });
    } catch (error) {
      // 忽略错误，继续执行
    }
  }

  logger.info(`[MonitorService] 命令已启动: ${commandId} - ${command} ${args.join(' ')}`);

  return { commandId, process };
}

/**
 * 停止命令
 */
async function stopCommand(commandId) {
  const info = activeListeners.get(commandId);
  if (!info) {
    throw new Error('Command not found');
  }

  // 停止监听器
  if (info.listener) {
    info.listener.stop();
  }

  // 终止进程并清理资源
  if (info.process && !info.process.killed) {
    // 关键：移除所有事件监听器，释放资源（防止内存泄漏）
    try {
      info.process.removeAllListeners();
      if (info.process.stdout) {
        info.process.stdout.removeAllListeners();
      }
      if (info.process.stderr) {
        info.process.stderr.removeAllListeners();
      }
    } catch (e) {
      // 忽略错误
    }
    
    info.process.kill('SIGTERM');
    // 如果 5 秒后还没退出，强制终止
    setTimeout(() => {
      if (info.process && !info.process.killed) {
        try {
          info.process.kill('SIGKILL');
        } catch (e) {
          // 忽略错误
        }
      }
    }, 5000);
  }

  activeListeners.delete(commandId);
  logger.info(`[MonitorService] 命令已停止: ${commandId}`);
}

/**
 * 清理资源（定期调用，防止内存泄漏）
 */
function cleanupResources() {
  const now = Date.now();
  let cleanedCount = 0;

  // 清理超时的命令（超过 24 小时未活动）
  const commandTimeout = 24 * 60 * 60 * 1000; // 24 小时
  for (const [commandId, info] of activeListeners.entries()) {
    if (info.startTime && (now - info.startTime) > commandTimeout) {
      logger.warn(`[MonitorService] 清理超时命令: ${commandId}`);
      stopCommand(commandId).catch(err => {
        logger.error(`[MonitorService] 清理超时命令失败:`, err);
      });
      cleanedCount++;
    }
  }

  // 清理超时的 dev 服务器（超过 24 小时未活动）
  for (const [appId, devInfo] of devServerProcesses.entries()) {
    if (devInfo.startTime && (now - devInfo.startTime) > commandTimeout) {
      logger.warn(`[MonitorService] 清理超时 dev 服务器: ${appId}`);
      stopDevServer(appId).catch(err => {
        logger.error(`[MonitorService] 清理超时 dev 服务器失败:`, err);
      });
      cleanedCount++;
    }
  }

  // 清理无效的 dev 状态客户端（超过 10 分钟未活动）
  const clientTimeout = 10 * 60 * 1000; // 10 分钟
  const clientsToRemove = [];
  for (const client of devStatusClients) {
    if (client.res.destroyed || client.res.writableEnded || client.req.destroyed) {
      clientsToRemove.push(client);
    } else if (client.createTime && (now - client.createTime) > clientTimeout) {
      // 超时客户端
      clientsToRemove.push(client);
    }
  }

  for (const client of clientsToRemove) {
    try {
      if (!client.res.destroyed && !client.res.writableEnded) {
        client.res.end();
      }
    } catch (e) {
      // 忽略错误
    }
    devStatusClients.delete(client);
    cleanedCount++;
  }

  if (cleanedCount > 0) {
    logger.info(`[MonitorService] 清理完成: 清理了 ${cleanedCount} 个资源`);
  }

  // 输出内存使用情况（用于监控）
  if (process.memoryUsage) {
    const memUsage = process.memoryUsage();
    const memMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };
    logger.debug(`[MonitorService] 内存使用: RSS=${memMB.rss}MB, Heap=${memMB.heapUsed}/${memMB.heapTotal}MB, External=${memMB.external}MB`);
  }

  // 如果内存监控已启动，输出内存报告
  if (memoryMonitor) {
    try {
      const report = getMemoryReport();
      if (report && report.current) {
        const current = report.current;
        const heapUsedMB = Math.round(current.heapUsed / 1024 / 1024);
        const usagePercent = (current.usagePercent * 100).toFixed(1);
        logger.debug(`[MonitorService] 内存监控报告: ${current.name} - ${heapUsedMB}MB (${usagePercent}%), 趋势: ${report.trend}`);
        
        // 检测内存泄漏（持续增长）
        if (report.trend === 'growing_fast' || report.trend === 'growing') {
          logger.warn(`[MonitorService] ⚠️  检测到内存持续增长，可能存在内存泄漏！趋势: ${report.trend}, 增长率: ${report.growthRate}`);
        }
      }
    } catch (error) {
      // 忽略错误
    }
  }
}

/**
 * 优雅关闭
 */
function gracefulShutdown() {
  logger.info('[MonitorService] 正在关闭监控服务...');

  // 停止内存监控
  if (memoryMonitor) {
    try {
      memoryMonitor.stop();
      logger.info('[MonitorService] 内存监控已停止');
    } catch (error) {
      logger.warn('[MonitorService] 停止内存监控失败:', error.message);
    }
  }

  // 停止所有命令
  for (const [commandId] of activeListeners.entries()) {
    stopCommand(commandId).catch(err => {
      logger.error(`[MonitorService] 停止命令 ${commandId} 失败:`, err);
    });
  }

  // 停止所有dev服务器
  for (const [appId] of devServerProcesses.entries()) {
    stopDevServer(appId).catch(err => {
      logger.error(`[MonitorService] 停止dev服务器 ${appId} 失败:`, err);
    });
  }

  // 清理所有客户端连接
  for (const client of devStatusClients) {
    try {
      if (!client.res.destroyed && !client.res.writableEnded) {
        client.res.end();
      }
    } catch (e) {
      // 忽略错误
    }
  }
  devStatusClients.clear();

  // 停止监控服务器
  if (monitorServer) {
    monitorServer.stop();
  }

  logger.info('[MonitorService] 监控服务已关闭');
  process.exit(0);
}

/**
 * 处理 Dev 服务器状态 SSE 连接
 */
function handleDevStatusSSE(req, res) {
  const clientId = `${req.socket.remoteAddress}:${req.socket.remotePort || Date.now()}`;
  logger.info(`[MonitorService] 新的 Dev 状态 SSE 客户端连接: ${clientId}`);
  
  // 设置 SSE 响应头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
    'X-Accel-Buffering': 'no'
  });

  // 发送初始连接确认和当前状态
  try {
    res.write('data: {"type":"connected"}\n\n');
    
    // 发送所有应用的当前状态
    const status = getDevServersStatus();
    res.write(`data: ${JSON.stringify({ type: 'init', data: status })}\n\n`);
    
    logger.info(`[MonitorService] 已发送初始状态到客户端: ${clientId}`);
  } catch (err) {
    logger.error(`[MonitorService] 发送初始状态失败: ${err.message}`);
    return;
  }

  // 添加到客户端集合
  devStatusClients.add(res);
  logger.info(`[MonitorService] 当前 Dev 状态客户端连接数: ${devStatusClients.size}`);

  // 处理客户端断开
  req.on('close', () => {
    devStatusClients.delete(res);
    logger.info(`[MonitorService] Dev 状态客户端断开: ${clientId}, 剩余连接数: ${devStatusClients.size}`);
    try {
      res.end();
    } catch (err) {
      // 忽略错误
    }
  });
  
  req.on('error', (err) => {
    logger.error(`[MonitorService] Dev 状态客户端连接错误: ${clientId}, ${err.message}`);
    devStatusClients.delete(res);
  });
}

/**
 * 向所有 Dev 状态 SSE 客户端推送状态
 */
function pushDevStatusUpdate(type, data) {
  const message = JSON.stringify({ type, data, time: new Date().toLocaleString() });
  const sseMessage = `data: ${message}\n\n`;
  
  const clientsToNotify = Array.from(devStatusClients);
  let successCount = 0;
  const clientsToRemove = [];
  
  for (const client of clientsToNotify) {
    try {
      // 检查客户端是否有效
      if (client.res.destroyed || client.res.writableEnded || client.req.destroyed) {
        clientsToRemove.push(client);
        continue;
      }
      
      client.res.write(sseMessage);
      successCount++;
    } catch (err) {
      logger.warn(`[MonitorService] Dev 状态客户端断开，移除连接: ${err.message}`);
      clientsToRemove.push(client);
    }
  }
  
  // 移除无效客户端
  for (const client of clientsToRemove) {
    devStatusClients.delete(client);
  }
  
  if (successCount > 0) {
    logger.debug(`[MonitorService] ✅ 成功推送 Dev 状态到 ${successCount}/${clientsToNotify.length} 个客户端`);
  }
}

/**
 * 获取所有应用的dev服务器状态
 */
function getDevServersStatus() {
  const apps = getAllApps();
  return apps.map(app => {
    const devInfo = devServerProcesses.get(app.id);
    return {
      appId: app.id,
      appName: app.name,
      displayName: app.displayName,
      packageName: app.packageName,
      status: devInfo ? (devInfo.process && !devInfo.process.killed ? 'running' : 'stopped') : 'stopped',
      startTime: devInfo?.startTime || null,
      logs: devInfo?.logs?.slice(-50) || [] // 最近50条日志
    };
  });
}

/**
 * 获取所有应用的dev服务器状态（HTTP API）
 */
function handleGetDevStatus(req, res) {
  logger.debug('[MonitorService] 处理 GET /api/dev/status 请求');
  
  const status = getDevServersStatus();
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ servers: status }));
}

/**
 * 启动所有应用的dev服务器
 */
async function handleStartAllDevServers(req, res, data) {
  logger.info('[MonitorService] 处理 POST /api/dev/start-all 请求');
  
  const apps = getAllApps();
  const { exclude = [] } = data; // 支持排除某些应用
  
  const appsToStart = apps.filter(app => !exclude.includes(app.id));
  
  pushDevStatusUpdate('starting-all', { 
    message: `正在启动 ${appsToStart.length} 个应用的dev服务器...`,
    apps: appsToStart.map(app => app.id)
  });
  
  try {
    // 并发启动所有应用（但限制并发数）
    const concurrency = 5; // 最多同时启动5个
    const results = [];
    
    for (let i = 0; i < appsToStart.length; i += concurrency) {
      const batch = appsToStart.slice(i, i + concurrency);
      const batchPromises = batch.map(app => startDevServer(app.id));
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
      
      // 等待一小段时间再启动下一批
      if (i + concurrency < appsToStart.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failCount = results.filter(r => r.status === 'rejected').length;
    
    pushDevStatusUpdate('started-all', {
      message: `启动完成：成功 ${successCount} 个，失败 ${failCount} 个`,
      success: successCount,
      failed: failCount
    });
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      message: `已启动 ${successCount} 个应用的dev服务器`,
      successCount,
      failCount
    }));
  } catch (error) {
    logger.error('[MonitorService] 启动所有dev服务器失败:', error);
    pushDevStatusUpdate('error', { message: `启动失败: ${error.message}` });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

/**
 * 停止所有应用的dev服务器
 */
async function handleStopAllDevServers(req, res) {
  logger.info('[MonitorService] 处理 POST /api/dev/stop-all 请求');
  
  const appIds = Array.from(devServerProcesses.keys());
  
  pushDevStatusUpdate('stopping-all', {
    message: `正在停止 ${appIds.length} 个应用的dev服务器...`,
    apps: appIds
  });
  
  try {
    const results = await Promise.allSettled(
      appIds.map(appId => stopDevServer(appId))
    );
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failCount = results.filter(r => r.status === 'rejected').length;
    
    pushDevStatusUpdate('stopped-all', {
      message: `停止完成：成功 ${successCount} 个，失败 ${failCount} 个`,
      success: successCount,
      failed: failCount
    });
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      message: `已停止 ${successCount} 个应用的dev服务器`,
      successCount,
      failCount
    }));
  } catch (error) {
    logger.error('[MonitorService] 停止所有dev服务器失败:', error);
    pushDevStatusUpdate('error', { message: `停止失败: ${error.message}` });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

/**
 * 启动单个应用的dev服务器（HTTP API）
 */
async function handleStartDevServer(req, res, appId) {
  logger.info(`[MonitorService] 处理 POST /api/dev/start/${appId} 请求`);
  
  try {
    await startDevServer(appId);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      message: `应用 ${appId} 的dev服务器已启动`
    }));
  } catch (error) {
    logger.error(`[MonitorService] 启动应用 ${appId} 的dev服务器失败:`, error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

/**
 * 停止单个应用的dev服务器（HTTP API）
 */
async function handleStopDevServer(req, res, appId) {
  logger.info(`[MonitorService] 处理 POST /api/dev/stop/${appId} 请求`);
  
  try {
    await stopDevServer(appId);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      message: `应用 ${appId} 的dev服务器已停止`
    }));
  } catch (error) {
    logger.error(`[MonitorService] 停止应用 ${appId} 的dev服务器失败:`, error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

/**
 * 启动单个应用的dev服务器
 */
async function startDevServer(appId) {
  const app = getAppById(appId);
  if (!app) {
    throw new Error(`应用 ${appId} 不存在`);
  }
  
  // 检查是否已在运行
  const existing = devServerProcesses.get(appId);
  if (existing && existing.process && !existing.process.killed) {
    logger.warn(`[MonitorService] 应用 ${appId} 的dev服务器已在运行中`);
    pushDevStatusUpdate('log', {
      appId,
      message: `应用 ${app.displayName} 的dev服务器已在运行中`
    });
    return;
  }
  
  // 限制 dev 服务器进程数量，防止内存泄漏
  if (devServerProcesses.size >= MAX_DEV_SERVER_PROCESSES) {
    // 删除最旧的 dev 服务器（按启动时间）
    const oldestDevServer = Array.from(devServerProcesses.entries())
      .sort((a, b) => (a[1].startTime || 0) - (b[1].startTime || 0))[0];
    if (oldestDevServer) {
      logger.warn(`[MonitorService] 达到最大 dev 服务器数限制，停止最旧服务器: ${oldestDevServer[0]}`);
      stopDevServer(oldestDevServer[0]).catch(err => {
        logger.error(`[MonitorService] 停止最旧 dev 服务器失败:`, err);
      });
    }
  }
  
  logger.info(`[MonitorService] 启动应用 ${appId} (${app.displayName}) 的dev服务器...`);
  
  pushDevStatusUpdate('starting', {
    appId,
    appName: app.displayName,
    message: `正在启动 ${app.displayName} 的dev服务器...`
  });
  
  // 启动dev服务器进程
  const process = spawn('pnpm', ['--filter', app.packageName, 'dev'], {
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    windowsHide: true
  });
  
  const devInfo = {
    process,
    app,
    status: 'starting',
    startTime: Date.now(),
    logs: [] // 限制日志数量，防止内存泄漏
  };
  
  // 定义日志监听函数（便于后续移除，防止内存泄漏）
  const onStdoutData = (chunk) => {
    const log = chunk.toString().trim();
    if (log) {
      devInfo.logs.push({
        time: new Date().toLocaleString(),
        type: 'stdout',
        content: log
      });
      
      // 限制日志数量，防止内存泄漏（仅保留最新 100 条）
      if (devInfo.logs.length > 100) {
        devInfo.logs.shift();
      }
      
      // 推送日志到SSE客户端
      pushDevStatusUpdate('log', {
        appId,
        appName: app.displayName,
        type: 'stdout',
        content: log,
        time: new Date().toLocaleString()
      });
      
      // 检测启动成功（Vite 启动成功的标志）
      if (log.includes('Local:') || log.includes('Network:') || log.includes('ready in')) {
        devInfo.status = 'running';
        pushDevStatusUpdate('started', {
          appId,
          appName: app.displayName,
          message: `${app.displayName} 的dev服务器已启动`,
          log: log
        });
      }
    }
  };

  const onStderrData = (chunk) => {
    const log = chunk.toString().trim();
    if (log) {
      devInfo.logs.push({
        time: new Date().toLocaleString(),
        type: 'stderr',
        content: log
      });
      
      // 限制日志数量，防止内存泄漏（仅保留最新 100 条）
      if (devInfo.logs.length > 100) {
        devInfo.logs.shift();
      }
      
      // 推送日志到SSE客户端
      pushDevStatusUpdate('log', {
        appId,
        appName: app.displayName,
        type: 'stderr',
        content: log,
        time: new Date().toLocaleString()
      });
    }
  };
  
  // 监听进程输出
  process.stdout.on('data', onStdoutData);
  process.stderr.on('data', onStderrData);
  
  // 监听进程退出
  process.on('exit', (code) => {
    logger.info(`[MonitorService] 应用 ${appId} 的dev服务器已退出，退出码: ${code}`);
    
    // 关键：移除所有事件监听器，释放资源（防止内存泄漏）
    process.stdout.removeListener('data', onStdoutData);
    process.stderr.removeListener('data', onStderrData);
    process.removeAllListeners();
    
    // 清理 devInfo 中的大对象，仅保留基础状态
    devInfo.status = 'stopped';
    devInfo.process = null;
    devInfo.logs = devInfo.logs.slice(-10); // 仅保留最后 10 条日志
    
    pushDevStatusUpdate('stopped', {
      appId,
      appName: app.displayName,
      message: `${app.displayName} 的dev服务器已停止`,
      exitCode: code
    });
    devServerProcesses.delete(appId);
  });
  
  process.on('error', (error) => {
    logger.error(`[MonitorService] 应用 ${appId} 的dev服务器启动失败:`, error);
    
    // 关键：移除所有事件监听器，释放资源（防止内存泄漏）
    process.stdout.removeListener('data', onStdoutData);
    process.stderr.removeListener('data', onStderrData);
    process.removeAllListeners();
    
    // 清理 devInfo 中的大对象，仅保留基础状态
    devInfo.status = 'error';
    devInfo.process = null;
    devInfo.logs = devInfo.logs.slice(-10); // 仅保留最后 10 条日志
    
    pushDevStatusUpdate('error', {
      appId,
      appName: app.displayName,
      message: `${app.displayName} 的dev服务器启动失败: ${error.message}`,
      error: error.message
    });
    devServerProcesses.delete(appId);
  });
  
  // 保存进程信息
  devServerProcesses.set(appId, devInfo);
  
  return { appId, process };
}

/**
 * 停止单个应用的dev服务器
 */
async function stopDevServer(appId) {
  const devInfo = devServerProcesses.get(appId);
  if (!devInfo) {
    throw new Error(`应用 ${appId} 的dev服务器未运行`);
  }
  
  logger.info(`[MonitorService] 停止应用 ${appId} (${devInfo.app.displayName}) 的dev服务器...`);
  
  pushDevStatusUpdate('stopping', {
    appId,
    appName: devInfo.app.displayName,
    message: `正在停止 ${devInfo.app.displayName} 的dev服务器...`
  });
  
  return new Promise((resolve, reject) => {
    if (!devInfo.process || devInfo.process.killed) {
      // 清理资源
      devInfo.process = null;
      devInfo.logs = [];
      devServerProcesses.delete(appId);
      resolve();
      return;
    }
    
    // 关键：先移除所有事件监听器，释放资源（防止内存泄漏）
    try {
      if (devInfo.process.stdout) {
        devInfo.process.stdout.removeAllListeners();
      }
      if (devInfo.process.stderr) {
        devInfo.process.stderr.removeAllListeners();
      }
      devInfo.process.removeAllListeners();
    } catch (e) {
      // 忽略错误
    }
    
    // 使用 tree-kill 终止进程及其子进程
    treeKill(devInfo.process.pid, 'SIGTERM', (err) => {
      if (err) {
        logger.error(`[MonitorService] 停止应用 ${appId} 的dev服务器失败:`, err);
        // 如果 SIGTERM 失败，尝试 SIGKILL
        treeKill(devInfo.process.pid, 'SIGKILL', (killErr) => {
          if (killErr) {
            logger.error(`[MonitorService] 强制停止应用 ${appId} 的dev服务器失败:`, killErr);
            reject(killErr);
          } else {
            // 清理资源
            devInfo.process = null;
            devInfo.logs = [];
            devServerProcesses.delete(appId);
            pushDevStatusUpdate('stopped', {
              appId,
              appName: devInfo.app.displayName,
              message: `${devInfo.app.displayName} 的dev服务器已强制停止`
            });
            resolve();
          }
        });
      } else {
        // 清理资源
        devInfo.process = null;
        devInfo.logs = [];
        devServerProcesses.delete(appId);
        pushDevStatusUpdate('stopped', {
          appId,
          appName: devInfo.app.displayName,
          message: `${devInfo.app.displayName} 的dev服务器已停止`
        });
        resolve();
      }
    });
  });
}

/**
 * 处理错误上报（从应用代码中上报）
 */
async function handleReportErrors(req, res, data) {
  try {
    const { errors } = data;
    
    if (!Array.isArray(errors) || errors.length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request: errors must be a non-empty array' }));
      return;
    }

    // 通过监控服务器广播每个错误（使用 SSE 推送到可视化页面）
    for (const error of errors) {
      // 格式化错误数据，确保包含必要字段
      const errorData = {
        ...error,
        errorType: error.errorType || 'runtime',
        severity: error.severity || (error.level >= 60 ? 'critical' : error.level >= 50 ? 'error' : 'warning'),
        errorMessage: error.errorMessage || error.msg || error.message || 'Unknown error',
        timestamp: error.timestamp || Date.now(),
        appId: error.appId || 'unknown',
      };

      // 广播到监控服务器（实时推送）
      monitorServer.broadcastError(errorData);
      
      logger.debug(`[MonitorService] 收到错误上报: ${errorData.appId} - ${errorData.errorMessage.substring(0, 50)}...`);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      message: `已接收 ${errors.length} 个错误上报`,
      count: errors.length 
    }));
  } catch (error) {
    logger.error('[MonitorService] 处理错误上报失败:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

/**
 * 处理启动事件上报
 */
async function handleStartupEvent(req, res, data) {
  try {
    const { appId, eventType, data: eventData, timestamp } = data;
    
    if (!appId || !eventType) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request: appId and eventType are required' }));
      return;
    }

    // 通过 SSE 推送启动事件到可视化页面
    const eventMessage = {
      type: 'startup',
      data: {
        appId,
        eventType,
        data: eventData,
        timestamp: timestamp || Date.now(),
      },
      time: new Date().toISOString(),
    };

    // 广播到所有 SSE 客户端
    const message = JSON.stringify(eventMessage);
    const sseMessage = `data: ${message}\n\n`;
    
    const clientsToNotify = Array.from(monitorServer.clients);
    for (const client of clientsToNotify) {
      try {
        client.write(sseMessage);
      } catch (err) {
        // 客户端可能已断开，从集合中移除
        monitorServer.clients.delete(client);
      }
    }

    logger.debug(`[MonitorService] 收到启动事件: ${appId} - ${eventType}`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      message: '启动事件已接收并推送',
    }));
  } catch (error) {
    logger.error('[MonitorService] 处理启动事件失败:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

// 启动服务（直接启动，不检查条件）
// 使用 .catch() 处理异步错误，避免未捕获的 Promise 导致进程退出
startMonitorService().catch((error) => {
  console.error('[MonitorService] 启动失败:', error);
  if (logger && typeof logger.error === 'function') {
    logger.error('[MonitorService] 启动失败:', error);
  }
  process.exit(1);
});

export { startMonitorService, startCommand, stopCommand };
