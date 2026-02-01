/**
 * 统一日志模块
 * 基于 console 的日志系统，集成到现有的日志上报机制
 */

import type { LogContext, LogLevel } from './types';
import { getCurrentAppId } from '../env-info';
import { reportLog, type LogEntry } from '../log-reporter';
import { isDevelopment } from '../../env';

// 全局上下文（用户信息、请求ID等）
let globalContext: LogContext = {};

// 当前日志级别
let currentLogLevel: LogLevel = isDevelopment() ? 'debug' : 'warn';

// 日志级别映射（数字越大，级别越高）
const logLevelMap: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

/**
 * 设置全局日志上下文
 */
export function setLogContext(context: LogContext) {
  globalContext = { ...globalContext, ...context };
}

/**
 * 获取全局日志上下文
 */
export function getLogContext(): LogContext {
  return { ...globalContext };
}

/**
 * 清除全局日志上下文
 */
export function clearLogContext() {
  globalContext = {};
}

/**
 * 格式化日志消息（添加上下文信息）
 */
function formatMessage(message: string, context?: LogContext): string {
  const mergedContext = { ...globalContext, ...context };
  const contextStr = Object.keys(mergedContext).length > 0
    ? ` [${JSON.stringify(mergedContext)}]`
    : '';
  return `${message}${contextStr}`;
}

/**
 * 检查是否应该记录该级别的日志
 */
function shouldLog(level: LogLevel): boolean {
  return logLevelMap[level] >= logLevelMap[currentLogLevel];
}

/**
 * 便捷的日志方法
 */
export const logger = {
  /**
   * Debug 级别日志
   */
  debug: (message: string, ...args: any[]) => {
    if (!shouldLog('debug')) return;
    try {
      const formattedMessage = formatMessage(message);
      console.debug(formattedMessage, ...args);
    } catch (error) {
      console.debug(message, ...args);
    }
  },

  /**
   * Info 级别日志
   */
  info: (message: string, ...args: any[]) => {
    if (!shouldLog('info')) return;
    try {
      const formattedMessage = formatMessage(message);
      console.info(formattedMessage, ...args);
    } catch (error) {
      console.info(message, ...args);
    }
  },

  /**
   * Warn 级别日志
   */
  warn: (message: string, ...args: any[]) => {
    if (!shouldLog('warn')) return;
    try {
      const formattedMessage = formatMessage(message);
      console.warn(formattedMessage, ...args);
    } catch (error) {
      console.warn(message, ...args);
    }
  },

  /**
   * Error 级别日志
   * 专门用于错误上报：将错误通过日志上报中心上报到服务器
   */
  error: (message: string, error?: Error | any, ...args: any[]) => {
    if (!shouldLog('error')) return;

    try {
      const formattedMessage = formatMessage(message);
      console.error(formattedMessage, error, ...args);

      // 上报错误到日志上报中心
      try {
        // 获取当前上下文
        const context = getLogContext();
        const appId = context.appId || getCurrentAppId() || 'unknown';

        // 构建日志条目
        const logEntry: LogEntry = {
          level: 'error',
          message: formattedMessage,
          timestamp: Date.now(),
          appName: appId,
          context: {
            ...context,
            args: args.length > 0 ? args : undefined,
          },
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          } : error ? {
            message: String(error),
          } : undefined,
        };

        // 上报到日志上报中心（异步，不阻塞主线程）
        setTimeout(() => {
          try {
            reportLog(logEntry);
          } catch (e) {
            // 上报失败不影响日志记录，静默处理
          }
        }, 0);
      } catch (reportErr) {
        // 上报失败不影响日志记录，静默处理
      }
    } catch (e) {
      console.error(message, error, ...args);
    }
  },

  /**
   * Fatal 级别日志
   * 专门用于错误上报：将致命错误通过日志上报中心上报到服务器
   */
  fatal: (message: string, error?: Error | any, ...args: any[]) => {
    if (!shouldLog('fatal')) return;

    try {
      const formattedMessage = formatMessage(message);
      console.error(`[FATAL] ${formattedMessage}`, error, ...args);

      // 上报错误到日志上报中心
      try {
        // 获取当前上下文
        const context = getLogContext();
        const appId = context.appId || getCurrentAppId() || 'unknown';

        // 构建日志条目
        const logEntry: LogEntry = {
          level: 'fatal',
          message: formattedMessage,
          timestamp: Date.now(),
          appName: appId,
          context: {
            ...context,
            args: args.length > 0 ? args : undefined,
          },
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          } : error ? {
            message: String(error),
          } : undefined,
        };

        // 上报到日志上报中心（异步，不阻塞主线程）
        setTimeout(() => {
          try {
            reportLog(logEntry);
          } catch (e) {
            // 上报失败不影响日志记录，静默处理
          }
        }, 0);
      } catch (reportErr) {
        // 上报失败不影响日志记录，静默处理
      }
    } catch (e) {
      console.error(`[FATAL] ${message}`, error, ...args);
    }
  },

  /**
   * 创建带上下文的子 logger
   */
  child: (context: LogContext) => {
    return {
      debug: (message: string, ...args: any[]) => {
        console.debug(formatMessage(message, context), ...args);
      },
      info: (message: string, ...args: any[]) => {
        console.info(formatMessage(message, context), ...args);
      },
      warn: (message: string, ...args: any[]) => {
        console.warn(formatMessage(message, context), ...args);
      },
      error: (message: string, error?: Error | any, ...args: any[]) => {
        console.error(formatMessage(message, context), error, ...args);
      },
      fatal: (message: string, error?: Error | any, ...args: any[]) => {
        console.error(`[FATAL] ${formatMessage(message, context)}`, error, ...args);
      },
    };
  },

  /**
   * 设置日志级别
   */
  setLevel: (level: LogLevel) => {
    currentLogLevel = level;
  },

  /**
   * 获取当前日志级别
   */
  getLevel: (): LogLevel => {
    return currentLogLevel;
  },
};

/**
 * 重新初始化 logger（当上下文变化时调用）
 * 现在只是一个空函数，因为不再需要重新初始化
 */
export function reinitializeLogger(context?: LogContext) {
  if (context) {
    setLogContext(context);
  }
}

/**
 * 获取 logger 实例（为了兼容性保留）
 */
export function getLogger(context?: LogContext) {
  if (context) {
    return logger.child(context);
  }
  return logger;
}

