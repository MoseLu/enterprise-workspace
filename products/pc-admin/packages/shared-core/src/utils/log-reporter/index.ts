/**
 * 日志上报中心统一导出
 */

export * from './types';
export * from './queue';
export * from './reporter';
export * from './utils';
export { getLogFilterOptions } from './utils';
export type { LogFilterOptions } from './utils';

// 日志累加器导出（应用层使用）
export { LogAccumulator } from './accumulator';
export type { LogAccumulatorOptions, LogEntryWithCount } from './types';

// 日志分类器导出
export { LogClassifier } from './classifier';

// 日志处理器导出
export { LogProcessor } from './processor';

// 自适应限流器导出
export { AdaptiveRateLimiter } from './rate-limiter';

// Pino 集成导出
export {
  createPinoLogger,
  getDefaultPinoLogger,
  initPinoLogReporter,
  getPinoLogReporter,
} from './pino-integration';
export {
  convertPinoLogToLogEntry,
  pinoLogReporterTransport,
} from './pino-transport';

// 创建默认的日志上报器实例
import { LogReporter } from './reporter';
import type { LogReporterOptions } from './types';

let defaultReporter: LogReporter | null = null;

/**
 * 获取默认的日志上报器实例
 * @param options 配置选项
 * @returns 日志上报器实例
 */
export function getLogReporter(options?: LogReporterOptions): LogReporter {
  if (!defaultReporter) {
    // 默认启用静默模式，避免错误打印到控制台
    defaultReporter = new LogReporter({
      silent: true,
      ...options,
    });
  }
  return defaultReporter;
}

/**
 * 初始化日志上报器
 * @param options 配置选项
 */
export function initLogReporter(options?: LogReporterOptions): LogReporter {
  if (defaultReporter) {
    defaultReporter.destroy();
  }
  // 默认启用静默模式，避免错误打印到控制台
  defaultReporter = new LogReporter({
    silent: true,
    ...options,
  });
  return defaultReporter;
}

/**
 * 上报日志（使用默认上报器）
 * @param entry 日志条目
 */
export function reportLog(entry: Parameters<LogReporter['report']>[0]): void {
  const reporter = getLogReporter();
  reporter.report(entry);
}

/**
 * 获取队列长度（使用默认上报器）
 * @returns 队列中的日志数量
 */
export function getQueueLength(): number {
  const reporter = getLogReporter();
  return reporter.getQueueLength();
}
