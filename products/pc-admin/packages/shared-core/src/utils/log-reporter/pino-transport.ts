/**
 * Pino Transport for LogReporter
 * 将 pino 日志自动上报到日志上报中心
 */

import type { LogEntry } from './types';
import { LogReporter } from './reporter';
import type { LogReporterOptions } from './types';

// 创建全局 LogReporter 实例
let globalReporter: LogReporter | null = null;

/**
 * 初始化全局 LogReporter
 */
export function initLogReporter(options?: LogReporterOptions) {
  globalReporter = new LogReporter(options);
  return globalReporter;
}

/**
 * 获取全局 LogReporter 实例
 */
export function getLogReporter(): LogReporter | null {
  return globalReporter;
}

/**
 * Pino Transport 函数
 * 将 pino 日志转换为 LogEntry 并上报
 */
export function pinoLogReporterTransport(options: Record<string, any> = {}) {
  return {
    target: './pino-transport-worker.mjs',
    options: {
      ...options,
    },
  };
}

/**
 * 将 pino 日志对象转换为 LogEntry
 */
export function convertPinoLogToLogEntry(log: any, appName?: string): LogEntry {
  // 提取日志级别（pino 使用数字级别）
  const levelMap: Record<number, LogEntry['level']> = {
    10: 'debug',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal',
  };

  const level = levelMap[log.level] || 'info';

  // 提取消息
  const message = log.msg || log.message || '';

  // 提取时间戳（pino 使用秒级时间戳）
  let timestamp: number;
  if (log.time) {
    // pino 的时间戳可能是数字（毫秒）或字符串（ISO）
    if (typeof log.time === 'number') {
      timestamp = log.time;
    } else {
      timestamp = new Date(log.time).getTime();
    }
  } else {
    timestamp = Date.now();
  }

  // 提取错误信息
  let error: LogEntry['error'] | undefined;
  if (log.err || log.error) {
    const err = log.err || log.error;
    error = {
      name: err.name || 'Error',
      message: err.message || String(err),
      stack: err.stack,
    };
  }

  // 提取上下文信息（除了 pino 内置字段）
  const pinoBuiltInFields = ['level', 'time', 'pid', 'hostname', 'msg', 'message', 'err', 'error', 'v', 'appName', 'name'];
  const context: Record<string, any> = {};
  for (const [key, value] of Object.entries(log)) {
    if (!pinoBuiltInFields.includes(key)) {
      context[key] = value;
    }
  }

  return {
    level,
    message,
    timestamp,
    appName: appName || log.appName || 'unknown',
    loggerName: log.loggerName || log.name || 'pino',
    context: Object.keys(context).length > 0 ? context : undefined,
    error,
  };
}

/**
 * 创建 pino transport worker（用于 worker 线程）
 * 注意：这个文件会被 pino 在 worker 线程中加载
 */
export function createPinoTransportWorker() {
  // 这个函数会在 worker 线程中执行
  // 由于 worker 线程的限制，我们需要使用动态导入
  return {
    async worker(log: any) {
      // 在 worker 线程中，我们需要通过消息传递来上报日志
      // 但更好的方式是直接在主线程中处理
      // 所以这个 transport 实际上会在主线程中执行
      return log;
    },
  };
}
