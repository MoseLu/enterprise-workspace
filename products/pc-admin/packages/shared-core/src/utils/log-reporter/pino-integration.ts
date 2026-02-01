/**
 * Pino 集成模块
 * 提供便捷的 pino logger 实例，自动集成日志上报
 */

import pino from 'pino';
import type { Logger, StreamEntry } from 'pino';
import { LogReporter } from './reporter';
import { convertPinoLogToLogEntry } from './pino-transport';
import { getCurrentAppId } from '../env-info';
import type { LogReporterOptions } from './types';

// 避免循环依赖，直接在这里实现 getLogReporter 的逻辑
let defaultReporter: LogReporter | null = null;

/**
 * 获取默认的日志上报器实例（避免循环依赖）
 */
function getLogReporter(options?: LogReporterOptions): LogReporter {
  if (!defaultReporter) {
    defaultReporter = new LogReporter(options);
  }
  return defaultReporter;
}

// 全局 LogReporter 实例
let logReporter: LogReporter | null = null;

/**
 * 初始化日志上报器
 */
export function initPinoLogReporter(options?: LogReporterOptions) {
  logReporter = new LogReporter(options);
  return logReporter;
}

/**
 * 获取日志上报器实例
 */
export function getPinoLogReporter(): LogReporter | null {
  return logReporter || getLogReporter();
}

/**
 * 创建自定义 stream，用于上报日志到 LogReporter
 * 使用简单的对象实现 pino stream 接口，而不是 Node.js 的 Writable（浏览器兼容）
 */
function createReportStream(
  reporter: LogReporter,
  appName: string,
  minLevel: pino.Level = 'info'
): { write: (chunk: any) => void } {
  const levelMap: Record<string, number> = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
  };

  const minLevelNum = levelMap[minLevel] || 30;

  return {
    write(chunk: any) {
      try {
        // Pino 默认输出 JSON 字符串，直接解析即可（不需要手动 JSON.stringify）
        // chunk 已经是 JSON 字符串格式，例如: {"level":30,"time":1234567890,"msg":"message",...}
        const log = typeof chunk === 'string' ? JSON.parse(chunk) : chunk;

        // 检查日志级别
        if (log.level < minLevelNum) {
          return;
        }

        // 转换为我们的 LogEntry 格式（包含 microApp 等信息）
        const logEntry = convertPinoLogToLogEntry(log, appName);

        // 上报日志（异步，不阻塞）
        // LogReporter 会将 LogEntry 转换为 ServerLogEntry 并序列化为 JSON 字符串发送
        setTimeout(() => {
          try {
            reporter.report(logEntry);
          } catch (error) {
            // 静默处理错误，避免影响主程序
            console.error('[PinoReportStream] 上报日志失败:', error);
          }
        }, 0);
      } catch (error) {
        // 静默处理错误
      }
    },
  };
}

/**
 * 创建 pino logger 实例，自动集成日志上报
 */
export function createPinoLogger(options: {
  name?: string;
  level?: string;
  appName?: string;
  reporter?: LogReporter;
  reporterOptions?: LogReporterOptions;
  enableReport?: boolean;
  reportMinLevel?: pino.Level;
} = {}): Logger {
  // 获取日志级别（浏览器环境使用默认值）
  const getLogLevel = () => {
    if (typeof process !== 'undefined' && process.env?.LOG_LEVEL) {
      return process.env.LOG_LEVEL;
    }
    return 'info';
  };

  const {
    name = 'app',
    level = getLogLevel(),
    appName,
    reporter,
    reporterOptions,
    enableReport = true,
    reportMinLevel = 'info',
  } = options;

  // 获取应用名称
  const finalAppName = appName || getCurrentAppId() || 'unknown';

  // 构建 streams
  const streams: StreamEntry[] = [
    // 控制台输出（浏览器环境直接输出，Node.js 环境使用 pretty）
    {
      level: level as pino.Level,
      stream: typeof window === 'undefined' && typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'
        ? pino.transport({
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          })
        : undefined, // 浏览器环境使用默认输出
    },
  ];

  // 如果启用上报，添加上报 stream
  if (enableReport) {
    // 获取或创建 LogReporter 实例
    let reporterInstance = reporter;
    if (!reporterInstance) {
      reporterInstance = getPinoLogReporter();
      if (!reporterInstance) {
        reporterInstance = new LogReporter(reporterOptions);
        logReporter = reporterInstance;
      }
    }

    // 创建上报 stream
    const reportStream = createReportStream(reporterInstance, finalAppName, reportMinLevel);
    streams.push({
      level: reportMinLevel,
      stream: reportStream,
    });
  }

  // 创建 pino logger
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
          // 添加应用名称
          object.appName = finalAppName;
          return object;
        },
      },
    },
    pino.multistream(streams)
  );
}

/**
 * 默认 logger 实例（懒加载）
 */
let defaultLogger: Logger | null = null;

/**
 * 获取默认 logger 实例
 */
export function getDefaultPinoLogger(): Logger {
  if (!defaultLogger) {
    defaultLogger = createPinoLogger();
  }
  return defaultLogger;
}
