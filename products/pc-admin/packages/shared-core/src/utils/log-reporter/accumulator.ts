/**
 * 日志累加器
 * 应用层使用，合并重复日志
 */

import type { LogEntry, LogEntryWithCount, LogAccumulatorOptions } from './types';
import { calculateLogHash } from './utils';

interface AccumulatedLog {
  entry: LogEntry;
  count: number;
  firstTimestamp: number;
  lastTimestamp: number;
}

/**
 * 日志累加器类
 * 相同日志在时间窗口内自动累加计数，只上报一次日志 + 重复次数
 */
export class LogAccumulator {
  private accumulatedLogs = new Map<string, AccumulatedLog>();
  private readonly timeWindow: number;
  private readonly autoFlush: boolean;
  private readonly autoFlushInterval: number;
  private autoFlushTimer: ReturnType<typeof setInterval> | null = null;
  private onReport: (entry: LogEntryWithCount) => void;

  constructor(
    options: LogAccumulatorOptions = {},
    onReport: (entry: LogEntryWithCount) => void
  ) {
    this.timeWindow = options.timeWindow || 1000;
    this.autoFlush = options.autoFlush || false;
    this.autoFlushInterval = options.autoFlushInterval || 5000;
    this.onReport = onReport;

    if (this.autoFlush) {
      this.startAutoFlush();
    }
  }

  /**
   * 上报日志（自动累加相同日志）
   */
  report(entry: LogEntry): void {
    const now = Date.now();
    const hash = calculateLogHash(entry);

    const existing = this.accumulatedLogs.get(hash);

    if (existing) {
      // 检查是否在时间窗口内
      if (now - existing.lastTimestamp <= this.timeWindow) {
        // 在时间窗口内，累加计数
        existing.count++;
        existing.lastTimestamp = now;
        return;
      } else {
        // 超出时间窗口，先上报之前的累加日志
        this.flushSingle(hash, existing);
      }
    }

    // 新的日志或超出时间窗口，创建新的累加记录
    this.accumulatedLogs.set(hash, {
      entry: { ...entry },
      count: 1,
      firstTimestamp: now,
      lastTimestamp: now,
    });
  }

  /**
   * 上报单个累加的日志
   */
  private flushSingle(hash: string, accumulated: AccumulatedLog): void {
    const entryWithCount: LogEntryWithCount = {
      ...accumulated.entry,
      repeatCount: accumulated.count > 1 ? accumulated.count : undefined,
    };

    this.onReport(entryWithCount);
    this.accumulatedLogs.delete(hash);
  }

  /**
   * 强制刷新所有累加的日志
   */
  flush(): void {
    const entries = Array.from(this.accumulatedLogs.entries());
    for (const [hash, accumulated] of entries) {
      this.flushSingle(hash, accumulated);
    }
  }

  /**
   * 启动自动刷新
   */
  private startAutoFlush(): void {
    if (this.autoFlushTimer) {
      return;
    }

    this.autoFlushTimer = setInterval(() => {
      this.flush();
    }, this.autoFlushInterval);
  }

  /**
   * 停止自动刷新
   */
  private stopAutoFlush(): void {
    if (this.autoFlushTimer) {
      clearInterval(this.autoFlushTimer);
      this.autoFlushTimer = null;
    }
  }

  /**
   * 清空累加器
   */
  clear(): void {
    this.accumulatedLogs.clear();
  }

  /**
   * 销毁累加器
   */
  destroy(): void {
    this.stopAutoFlush();
    this.flush(); // 先上报所有日志
    this.clear();
  }

  /**
   * 获取当前累加的日志数量
   */
  getAccumulatedCount(): number {
    return this.accumulatedLogs.size;
  }
}