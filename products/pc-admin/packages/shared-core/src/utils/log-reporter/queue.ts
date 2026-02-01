/**
 * 日志队列管理
 * 负责批量收集日志，并在合适的时机批量上报
 * 支持分类队列和优先级
 */

import type { LogEntry, LogReporterOptions, LogPriority } from './types';

/**
 * 日志队列类（支持分类和优先级）
 */
export class LogQueue {
  // 分类队列：低频队列（快速处理）和高频队列（延迟处理）
  private lowFrequencyQueue: LogEntry[] = [];
  private highFrequencyQueue: LogEntry[] = [];
  
  // 定时器
  private lowFrequencyTimer: ReturnType<typeof setTimeout> | null = null;
  private highFrequencyTimer: ReturnType<typeof setTimeout> | null = null;
  
  // 首次添加日志的时间（用于最大等待时间检查）
  private lowFrequencyFirstAddTime: number | null = null;
  private highFrequencyFirstAddTime: number | null = null;
  
  // 配置
  private readonly lowFrequencyBatchSize: number;
  private readonly lowFrequencyMinBatchSize: number; // 最小批次大小（日志少时等待更多日志）
  private readonly lowFrequencyMaxWaitTime: number;
  private readonly lowFrequencyMaxIdleTime: number; // 最大空闲等待时间（防止日志长时间滞留）
  private readonly highFrequencyBatchSize: number;
  private readonly highFrequencyMinBatchSize: number;
  private readonly highFrequencyMaxWaitTime: number;
  private readonly highFrequencyMaxIdleTime: number;
  
  private onFlush: (logs: LogEntry[], skipRetry?: boolean, isHighFrequency?: boolean) => Promise<boolean | void>;
  // 返回值：true 表示上报成功，false 表示日志数量太少需要重新放回队列，void 表示其他情况

  constructor(
    onFlush: (logs: LogEntry[], skipRetry?: boolean, isHighFrequency?: boolean) => Promise<boolean | void>,
    options: Pick<LogReporterOptions, 'batchSize' | 'maxWaitTime'> = {}
  ) {
    this.onFlush = onFlush;
    
    // 低频队列：大批次，长延迟（累积到50条或5分钟再上报）
    this.lowFrequencyBatchSize = Math.floor((options.batchSize || 10) * 0.5) || 5;
    this.lowFrequencyMinBatchSize = 50; // 最小批次50条（大幅提高，减少上报频率）
    this.lowFrequencyMaxWaitTime = 300000; // 5分钟延迟（300秒）
    this.lowFrequencyMaxIdleTime = 300000; // 最大空闲时间5分钟（300秒）
    
    // 高频队列：大批次，长延迟（延迟上报，需要整理）
    // 增加延迟时间，让高频日志有更多时间积累和合并
    // 批量大小设置为200，让更多日志积累后再处理（因为处理后可能合并为少量日志）
    this.highFrequencyBatchSize = 200;
    this.highFrequencyMinBatchSize = 15; // 最小批次15条（提高最小批次，减少上报频率）
    this.highFrequencyMaxWaitTime = 20000; // 20秒延迟（提高延迟时间）
    this.highFrequencyMaxIdleTime = Math.max((options.maxWaitTime || 5000) * 6, 60000); // 最大空闲时间60秒
  }

  /**
   * 添加日志到队列（根据优先级和频率）
   */
  add(entry: LogEntry, priority: LogPriority = 'normal', isHighFrequency: boolean = false): void {
    const targetQueue = isHighFrequency ? this.highFrequencyQueue : this.lowFrequencyQueue;
    const batchSize = isHighFrequency ? this.highFrequencyBatchSize : this.lowFrequencyBatchSize;
    
    // 记录首次添加日志的时间
    if (targetQueue.length === 0) {
      if (isHighFrequency) {
        this.highFrequencyFirstAddTime = Date.now();
      } else {
        this.lowFrequencyFirstAddTime = Date.now();
      }
    }
    
    // 根据优先级插入（高优先级在前）
    if (priority === 'high') {
      targetQueue.unshift(entry);
    } else {
      targetQueue.push(entry);
    }

    // 如果队列达到批量大小，检查是否应该刷新
    if (targetQueue.length >= batchSize) {
      if (isHighFrequency) {
        // 高频队列：即使达到批量大小，也检查最小批次大小（因为处理后可能合并为少量日志）
        // 但批量大小已经很大（200），所以通常可以直接刷新
        this.flushHighFrequency();
      } else {
        this.flushLowFrequency();
      }
      return;
    }

    // 如果这是第一条日志，启动定时器
    if (targetQueue.length === 1) {
      if (isHighFrequency) {
        this.startHighFrequencyTimer();
      } else {
        this.startLowFrequencyTimer();
      }
    }
  }

  /**
   * 启动低频队列定时器
   */
  private startLowFrequencyTimer(): void {
    if (this.lowFrequencyTimer) {
      clearTimeout(this.lowFrequencyTimer);
    }

    this.lowFrequencyTimer = setTimeout(() => {
      this.checkAndFlushLowFrequency();
    }, this.lowFrequencyMaxWaitTime);
  }

  /**
   * 启动高频队列定时器
   */
  private startHighFrequencyTimer(): void {
    if (this.highFrequencyTimer) {
      clearTimeout(this.highFrequencyTimer);
    }

    this.highFrequencyTimer = setTimeout(() => {
      this.checkAndFlushHighFrequency();
    }, this.highFrequencyMaxWaitTime);
  }

  /**
   * 检查并刷新低频队列（检查最小批次大小和最大空闲时间）
   */
  private checkAndFlushLowFrequency(): void {
    if (this.lowFrequencyQueue.length === 0) {
      return;
    }

    const now = Date.now();
    const firstAddTime = this.lowFrequencyFirstAddTime || now;
    const idleTime = now - firstAddTime;

    // 检查是否达到最小批次大小
    const hasMinBatch = this.lowFrequencyQueue.length >= this.lowFrequencyMinBatchSize;
    
    // 检查是否超过最大空闲时间
    const exceedsMaxIdleTime = idleTime >= this.lowFrequencyMaxIdleTime;

    if (hasMinBatch || exceedsMaxIdleTime) {
      // 达到最小批次或超过最大空闲时间，刷新队列
      this.flushLowFrequency();
    } else {
      // 日志数量太少且未超过最大空闲时间，继续等待
      // 重新启动定时器
      this.startLowFrequencyTimer();
    }
  }

  /**
   * 检查并刷新高频队列（检查最小批次大小和最大空闲时间）
   */
  private checkAndFlushHighFrequency(): void {
    if (this.highFrequencyQueue.length === 0) {
      return;
    }

    const now = Date.now();
    const firstAddTime = this.highFrequencyFirstAddTime || now;
    const idleTime = now - firstAddTime;

    // 检查是否达到最小批次大小
    const hasMinBatch = this.highFrequencyQueue.length >= this.highFrequencyMinBatchSize;
    
    // 检查是否超过最大空闲时间
    const exceedsMaxIdleTime = idleTime >= this.highFrequencyMaxIdleTime;

    if (hasMinBatch || exceedsMaxIdleTime) {
      // 达到最小批次或超过最大空闲时间，刷新队列
      this.flushHighFrequency();
    } else {
      // 日志数量太少且未超过最大空闲时间，继续等待
      // 重新启动定时器
      this.startHighFrequencyTimer();
    }
  }

  /**
   * 刷新低频队列（批量上报）
   */
  private async flushLowFrequency(throwOnError: boolean = false, skipRetry: boolean = false): Promise<void> {
    if (this.lowFrequencyQueue.length === 0) {
      return;
    }

    // 清除定时器
    if (this.lowFrequencyTimer) {
      clearTimeout(this.lowFrequencyTimer);
      this.lowFrequencyTimer = null;
    }

    // 重置首次添加时间
    this.lowFrequencyFirstAddTime = null;

    // 复制队列并清空
    const logsToSend = [...this.lowFrequencyQueue];
    this.lowFrequencyQueue = [];

    // 批量上报
    try {
      const result = await this.onFlush(logsToSend, skipRetry, false);
      // 如果返回 false，表示日志数量太少，需要重新放回队列
      if (result === false) {
        // 重新放回低频队列
        if (this.lowFrequencyQueue.length + this.highFrequencyQueue.length < 100) {
          this.lowFrequencyQueue.unshift(...logsToSend);
          // 重新启动定时器
          this.startLowFrequencyTimer();
        }
      }
    } catch (error) {
      // 上报失败，将日志重新加入队列（优先加入低频队列）
      if (this.lowFrequencyQueue.length + this.highFrequencyQueue.length < 100) {
        this.lowFrequencyQueue.unshift(...logsToSend);
      }
      if (throwOnError) {
        throw error;
      }
    }
  }

  /**
   * 刷新高频队列（批量上报）
   */
  private async flushHighFrequency(throwOnError: boolean = false, skipRetry: boolean = false): Promise<void> {
    if (this.highFrequencyQueue.length === 0) {
      return;
    }

    // 清除定时器
    if (this.highFrequencyTimer) {
      clearTimeout(this.highFrequencyTimer);
      this.highFrequencyTimer = null;
    }

    // 重置首次添加时间
    this.highFrequencyFirstAddTime = null;

    // 复制队列并清空
    const logsToSend = [...this.highFrequencyQueue];
    this.highFrequencyQueue = [];

    // 批量上报
    try {
      const result = await this.onFlush(logsToSend, skipRetry, true);
      // 如果返回 false，表示日志数量太少，需要重新放回队列
      if (result === false) {
        // 重新放回高频队列
        if (this.lowFrequencyQueue.length + this.highFrequencyQueue.length < 100) {
          this.highFrequencyQueue.unshift(...logsToSend);
          // 重新启动定时器
          this.startHighFrequencyTimer();
        }
      }
    } catch (error) {
      // 上报失败，将日志重新加入队列（加入高频队列）
      if (this.lowFrequencyQueue.length + this.highFrequencyQueue.length < 100) {
        this.highFrequencyQueue.unshift(...logsToSend);
      }
      if (throwOnError) {
        throw error;
      }
    }
  }

  /**
   * 刷新所有队列（批量上报）
   * @param throwOnError 是否在错误时抛出异常（默认 false，用于测试场景）
   * @param skipRetry 是否跳过重试（默认 false，测试场景可以设为 true）
   */
  async flush(throwOnError: boolean = false, skipRetry: boolean = false): Promise<void> {
    // 先刷新低频队列（优先）
    await this.flushLowFrequency(throwOnError, skipRetry);
    // 再刷新高频队列
    await this.flushHighFrequency(throwOnError, skipRetry);
  }

  /**
   * 清空队列
   */
  clear(): void {
    if (this.lowFrequencyTimer) {
      clearTimeout(this.lowFrequencyTimer);
      this.lowFrequencyTimer = null;
    }
    if (this.highFrequencyTimer) {
      clearTimeout(this.highFrequencyTimer);
      this.highFrequencyTimer = null;
    }
    this.lowFrequencyQueue = [];
    this.highFrequencyQueue = [];
  }

  /**
   * 获取队列总长度
   */
  get length(): number {
    return this.lowFrequencyQueue.length + this.highFrequencyQueue.length;
  }

  /**
   * 获取低频队列长度
   */
  get lowFrequencyLength(): number {
    return this.lowFrequencyQueue.length;
  }

  /**
   * 获取高频队列长度
   */
  get highFrequencyLength(): number {
    return this.highFrequencyQueue.length;
  }

  /**
   * 销毁队列
   */
  destroy(): void {
    this.clear();
  }
}
