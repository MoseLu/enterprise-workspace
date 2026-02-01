/**
 * 开发错误监控服务器
 * 提供 HTML 界面和 SSE 实时推送错误
 */

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { logger } from './utils/logger.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Logo 文件路径（使用本地 public 目录）
const logoPath = join(__dirname, 'public', 'logo.png');

/**
 * 错误监控服务器类
 */
export class DevErrorMonitorServer {
  constructor(options = {}) {
    this.port = options.port || 3001;
    this.clients = new Set(); // SSE 客户端连接
    this.errorBuffer = []; // 错误缓冲区（用于新连接时发送历史错误）
    this.maxBufferSize = options.maxBufferSize || 500; // 减少到 500 条，降低内存占用
    this.server = null;
    this.cleanupInterval = null; // 清理定时器
    this.clientHeartbeats = new WeakMap(); // 客户端心跳映射（使用 WeakMap 自动清理）
  }

  /**
   * 启动服务器
   */
  start() {
    if (this.server) {
      return;
    }

    this.server = createServer((req, res) => {
      const url = new URL(req.url, `http://${req.headers.host}`);

      // 提供 HTML 页面
      if (url.pathname === '/' || url.pathname === '/index.html') {
        this.serveHTML(req, res);
        return;
      }

      // 提供静态文件（favicon/logo）
      if (url.pathname === '/logo.png' || url.pathname === '/favicon.ico') {
        this.serveStaticFile(req, res, url.pathname);
        return;
      }

      // SSE 端点
      if (url.pathname === '/events') {
        this.handleSSE(req, res);
        return;
      }

      // 404
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    });

    this.server.listen(this.port, '0.0.0.0', () => {
      logger.info(`📊 错误监控服务器已启动: http://localhost:${this.port}`);
      
      // 启动定时清理任务：清理无效 SSE 客户端和过期错误缓冲区
      this.startCleanupTask();
    });

    this.server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.warn(`端口 ${this.port} 已被占用，错误监控服务器可能已在运行`);
        // 如果端口被占用，尝试使用现有实例
        // 不抛出错误，让调用者处理
      } else {
        logger.error('[DevErrorMonitorServer] 服务器错误:', error);
        throw error; // 其他错误应该抛出
      }
    });
  }

  /**
   * 启动清理任务（定期清理无效客户端和过期错误）
   */
  startCleanupTask() {
    // 如果已有清理任务，先清除
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // 每 5 分钟执行一次清理
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * 清理无效客户端和过期错误
   */
  cleanup() {
    const now = Date.now();
    const clientTimeout = 10 * 60 * 1000; // 10 分钟超时
    const errorRetention = 24 * 60 * 60 * 1000; // 24 小时保留期
    let cleanedClients = 0;
    let cleanedErrors = 0;

    // 清理超时的 SSE 客户端
    const clientsToRemove = [];
    for (const client of this.clients) {
      // 检查连接是否有效
      if (client.res.destroyed || client.res.writableEnded || client.req.destroyed) {
        clientsToRemove.push(client);
        continue;
      }
      
      // 检查是否超时（超过 10 分钟未收到心跳）
      if (now - client.lastHeartbeat > clientTimeout) {
        clientsToRemove.push(client);
        continue;
      }
    }

    // 移除无效客户端
    for (const client of clientsToRemove) {
      try {
        if (client.heartbeatInterval) {
          clearInterval(client.heartbeatInterval);
        }
        if (!client.res.destroyed && !client.res.writableEnded) {
          client.res.end();
        }
      } catch (e) {
        // 忽略错误
      }
      this.clients.delete(client);
      cleanedClients++;
    }

    // 清理过期的错误缓冲区（超过 24 小时）
    const initialLength = this.errorBuffer.length;
    this.errorBuffer = this.errorBuffer.filter(error => {
      const errorTime = error.timestamp || 0;
      return now - errorTime < errorRetention;
    });
    cleanedErrors = initialLength - this.errorBuffer.length;

    if (cleanedClients > 0 || cleanedErrors > 0) {
      logger.debug(`[DevErrorMonitorServer] 清理完成: 移除 ${cleanedClients} 个无效客户端, 清理 ${cleanedErrors} 条过期错误, 当前客户端数: ${this.clients.size}, 错误缓冲区: ${this.errorBuffer.length}`);
    }
  }

  /**
   * 停止服务器
   */
  stop() {
    // 停止清理任务
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.server) {
      // 关闭所有 SSE 连接
      for (const client of this.clients) {
        try {
          if (client.heartbeatInterval) {
            clearInterval(client.heartbeatInterval);
          }
          if (!client.res.destroyed && !client.res.writableEnded) {
            client.res.write('data: {"type":"close"}\n\n');
            client.res.end();
          }
        } catch (e) {
          // 忽略错误
        }
      }
      this.clients.clear();

      this.server.close(() => {
        logger.info('[DevErrorMonitorServer] 服务器已停止');
      });
      this.server = null;
    }
  }

  /**
   * 提供 HTML 页面
   */
  serveHTML(req, res) {
    try {
      const htmlPath = join(__dirname, 'dev-error-monitor.html');
      const html = readFileSync(htmlPath, 'utf-8');
      
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      });
      res.end(html);
    } catch (error) {
      logger.error('[DevErrorMonitorServer] 读取 HTML 文件失败:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  }

  /**
   * 提供静态文件（Logo/Favicon）
   */
  serveStaticFile(req, res, pathname) {
    try {
      // 确定文件路径
      let filePath;
      if (pathname === '/favicon.ico') {
        // favicon.ico 也使用 logo.png
        filePath = logoPath;
      } else {
        // 从 public 目录提供文件
        const fileName = pathname.substring(1); // 移除前导斜杠
        filePath = join(__dirname, 'public', fileName);
      }

      if (!existsSync(filePath)) {
        logger.warn(`[DevErrorMonitorServer] 文件不存在: ${filePath}`);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }

      const fileContent = readFileSync(filePath);
      const ext = filePath.split('.').pop().toLowerCase();
      const contentTypeMap = {
        'png': 'image/png',
        'ico': 'image/x-icon',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'svg': 'image/svg+xml',
      };
      const contentType = contentTypeMap[ext] || 'application/octet-stream';
      
      logger.debug(`[DevErrorMonitorServer] 提供静态文件: ${req.url} (${contentType}, ${fileContent.length} bytes)`);
      
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 缓存 24 小时
        'Content-Length': fileContent.length
      });
      res.end(fileContent);
    } catch (error) {
      logger.error('[DevErrorMonitorServer] 提供静态文件失败:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  }

  /**
   * 处理 SSE 连接
   */
  handleSSE(req, res) {
    const clientId = `${req.socket.remoteAddress}:${req.socket.remotePort || Date.now()}`;
    const createTime = Date.now();
    logger.debug(`[DevErrorMonitorServer] 新的 SSE 客户端连接: ${clientId}`);
    
    // 设置 SSE 响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'X-Accel-Buffering': 'no' // 禁用 nginx 缓冲
    });

    // 发送初始连接确认
    try {
      res.write('data: {"type":"connected"}\n\n');
    } catch (err) {
      logger.error(`[DevErrorMonitorServer] 发送连接确认失败: ${err.message}`);
      return;
    }

    // 创建客户端对象（包含创建时间和心跳定时器）
    const client = {
      res,
      req,
      clientId,
      createTime,
      heartbeatInterval: null,
      lastHeartbeat: Date.now()
    };

    // 先添加到客户端集合（这样后续的错误也能立即收到）
    this.clients.add(client);

    // 发送历史错误（最近 50 条，减少内存占用）
    const recentErrors = this.errorBuffer.slice(-50);
    
    if (recentErrors.length > 0) {
      for (let i = 0; i < recentErrors.length; i++) {
        const error = recentErrors[i];
        try {
          // 限制错误对象大小，避免发送过大对象
          const errorData = {
            id: error.id,
            errorType: error.errorType,
            errorMessage: error.errorMessage?.substring(0, 500), // 限制错误消息长度
            severity: error.severity,
            timestamp: error.timestamp
          };
          const message = `data: ${JSON.stringify({ type: 'error', data: errorData })}\n\n`;
          res.write(message);
        } catch (err) {
          // 如果发送失败，可能是客户端已断开，移除连接
          this.clients.delete(client);
          return;
        }
      }
    }

    // 定期发送心跳，保持连接活跃
    client.heartbeatInterval = setInterval(() => {
      try {
        if (this.clients.has(client) && !res.writableEnded && !req.destroyed) {
          res.write(': heartbeat\n\n');
          client.lastHeartbeat = Date.now();
        } else {
          // 连接已断开，清理
          clearInterval(client.heartbeatInterval);
          this.clients.delete(client);
        }
      } catch (err) {
        // 发送失败，清理连接
        clearInterval(client.heartbeatInterval);
        this.clients.delete(client);
      }
    }, 30000); // 每30秒发送一次心跳

    // 处理客户端断开
    const cleanup = () => {
      if (client.heartbeatInterval) {
        clearInterval(client.heartbeatInterval);
        client.heartbeatInterval = null;
      }
      this.clients.delete(client);
      logger.debug(`[DevErrorMonitorServer] 客户端断开: ${clientId}, 剩余连接数: ${this.clients.size}`);
      try {
        if (!res.writableEnded && !res.destroyed) {
          res.end();
        }
      } catch (err) {
        // 忽略错误
      }
    };

    req.on('close', cleanup);
    req.on('error', (err) => {
      logger.debug(`[DevErrorMonitorServer] 客户端连接错误: ${clientId}, ${err.message}`);
      cleanup();
    });
    
    res.on('error', (err) => {
      logger.debug(`[DevErrorMonitorServer] 响应错误: ${clientId}, ${err.message}`);
      cleanup();
    });
    
    res.on('finish', cleanup);
  }

  /**
   * 广播错误到所有客户端
   */
  broadcastError(error) {
    // 限制错误对象大小，避免内存占用过大
    const errorWithId = {
      id: this.errorBuffer.length + 1,
      errorType: error.errorType,
      errorMessage: error.errorMessage?.substring(0, 1000) || error.msg?.substring(0, 1000) || 'Unknown error', // 限制长度
      severity: error.severity,
      packageName: error.packageName,
      timestamp: error.timestamp || Date.now(),
      // 不包含完整的错误对象，只保留关键信息
    };
    
    this.errorBuffer.push(errorWithId);

    // 限制缓冲区大小
    if (this.errorBuffer.length > this.maxBufferSize) {
      this.errorBuffer.shift();
    }

    // 广播到所有客户端
    const message = JSON.stringify({ type: 'error', data: errorWithId });
    const sseMessage = `data: ${message}\n\n`;
    
    if (this.clients.size === 0) {
      // 没有客户端时静默处理，不输出日志
      return; // 没有客户端，直接返回
    }
    
    // 复制客户端集合，避免在迭代时修改
    const clientsToNotify = Array.from(this.clients);
    let successCount = 0;
    
    for (const client of clientsToNotify) {
      try {
        // 检查客户端是否有效
        if (client.res.destroyed || client.res.writableEnded || client.req.destroyed) {
          this.clients.delete(client);
          continue;
        }
        
        client.res.write(sseMessage);
        successCount++;
      } catch (err) {
        // 客户端可能已断开，从集合中移除（静默处理）
        this.clients.delete(client);
      }
    }
  }

  /**
   * 获取服务器 URL
   */
  getUrl() {
    return `http://localhost:${this.port}`;
  }
}

// 单例模式
let serverInstance = null;

/**
 * 获取或创建服务器实例
 */
export function getMonitorServer(options = {}) {
  if (!serverInstance) {
    serverInstance = new DevErrorMonitorServer(options);
  }
  return serverInstance;
}
