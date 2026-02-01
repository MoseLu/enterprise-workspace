/**
 * Pino Logger for Node.js Scripts
 * 专门用于 Node.js 脚本的 pino logger，自动上报到日志中心
 */

import pino from 'pino';
import { Writable } from 'stream';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 将 pino 日志转换为 LogEntry 格式
 */
function convertPinoLogToLogEntry(log, appName = 'scripts') {
  const levelMap = {
    10: 'debug',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal',
  };

  const level = levelMap[log.level] || 'info';
  const message = log.msg || log.message || '';
  
  let timestamp;
  if (log.time) {
    timestamp = typeof log.time === 'number' ? log.time : new Date(log.time).getTime();
  } else {
    timestamp = Date.now();
  }

  let error;
  if (log.err || log.error) {
    const err = log.err || log.error;
    error = {
      name: err.name || 'Error',
      message: err.message || String(err),
      stack: err.stack,
    };
  }

  const pinoBuiltInFields = ['level', 'time', 'pid', 'hostname', 'msg', 'message', 'err', 'error', 'v', 'appName', 'name'];
  const context = {};
  for (const [key, value] of Object.entries(log)) {
    if (!pinoBuiltInFields.includes(key)) {
      context[key] = value;
    }
  }

  return {
    level,
    message,
    timestamp,
    appName: appName || log.appName || 'scripts',
    loggerName: log.loggerName || log.name || 'pino',
    context: Object.keys(context).length > 0 ? context : undefined,
    error,
  };
}

/**
 * 直接通过 HTTP 上报日志到日志中心
 * @deprecated 此函数为内部使用，应用应该通过 SDK (reportLog) 上报日志
 * 注意：此函数仅在 Node.js 环境（scripts）中使用，前端应用必须使用 SDK
 * 在 Node.js 环境中，需要确保有可用的 HTTP 客户端（如 node-fetch 或原生 fetch）
 */
async function reportLogViaHttp(logEntry) {
  try {
    // 构建服务器格式的日志条目
    const serverLogEntry = {
      timestamp: new Date(logEntry.timestamp).toISOString(),
      logLevel: logEntry.level.toUpperCase(),
      loggerName: logEntry.loggerName || 'pino',
      microApp: {
        microAppType: 'main',
        microAppName: logEntry.appName,
      },
      message: logEntry.message,
      data: logEntry.error || null,
      extensions: logEntry.context || {},
    };

    // 构建请求体
    const appName = logEntry.appName;
    const fullAppId = `btc-shopflow-${appName}${appName.endsWith('-app') ? '' : '-app'}`;
    
    const requestBody = {
      appId: fullAppId,
      timestamp: new Date().toISOString(),
      logs: JSON.stringify([serverLogEntry]),
    };

    // 发送 HTTP 请求（异步，不阻塞）
    // 注意：Node.js 18+ 支持原生 fetch，否则需要安装 node-fetch
    // URL 使用不带 -app 后缀的应用名
    const appNameForUrl = appName.endsWith('-app') ? appName.slice(0, -4) : appName;
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/system/logs/${appNameForUrl}/receive`;
    
    // 注意：在 Node.js 环境中，如果没有运行开发服务器，这个请求会失败
    // 但我们静默处理，不影响主程序
    if (typeof fetch !== 'undefined') {
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }).catch(() => {
        // 静默处理错误
      });
    }
  } catch (error) {
    // 静默处理错误
  }
}

/**
 * 创建上报 stream（用于上报到日志中心）
 */
function createReportStream(appName, minLevel = 'info') {
  const levelMap = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
  };

  const minLevelNum = levelMap[minLevel] || 30;

  return new Writable({
    objectMode: true,
    write(chunk, encoding, callback) {
      try {
        // Pino 默认输出 JSON 字符串，直接解析即可（不需要手动 JSON.stringify）
        const log = typeof chunk === 'string' ? JSON.parse(chunk) : chunk;

        if (log.level < minLevelNum) {
          callback();
          return;
        }

        const logEntry = convertPinoLogToLogEntry(log, appName);

        // 异步上报（不阻塞）
        // reportLogViaHttp 会将 LogEntry 转换为 ServerLogEntry 并序列化为 JSON 字符串发送
        setTimeout(() => {
          reportLogViaHttp(logEntry).catch(() => {
            // 静默处理错误
          });
        }, 0);

        callback();
      } catch (error) {
        callback();
      }
    },
  });
}

/**
 * 创建 pino logger 实例
 */
export function createPinoLogger(options = {}) {
  const {
    name = 'script',
    level = process.env.LOG_LEVEL || 'info',
    appName = 'scripts',
    enableReport = true,
    reportMinLevel = 'info',
  } = options;

  const streams = [
    // 控制台输出（开发环境使用 pretty）
    {
      level,
      stream: process.env.NODE_ENV === 'production'
        ? process.stdout
        : pino.transport({
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'yyyy-mm-dd HH:MM:ss',
              ignore: 'pid,hostname',
            },
          }),
    },
  ];

  // 如果启用上报，添加上报 stream
  if (enableReport) {
    streams.push({
      level: reportMinLevel,
      stream: createReportStream(appName, reportMinLevel),
    });
  }

  return pino(
    {
      name,
      level,
      serializers: {
        err: pino.stdSerializers.err,
        error: pino.stdSerializers.err,
      },
      formatters: {
        log(object) {
          object.appName = appName;
          return object;
        },
      },
    },
    pino.multistream(streams)
  );
}

/**
 * 默认 logger 实例
 */
let defaultLogger = null;

/**
 * 获取默认 logger 实例
 */
export function getPinoLogger(options = {}) {
  if (!defaultLogger) {
    defaultLogger = createPinoLogger(options);
  }
  return defaultLogger;
}

/**
 * 导出默认 logger（兼容原有接口）
 */
export const logger = getPinoLogger();
