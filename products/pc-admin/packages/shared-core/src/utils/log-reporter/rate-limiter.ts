/**
 * 自适应限流器
 * QPS控制、退避机制、队列管理
 */

import type { LogEntry } from './types';

interface ReportQueue {
  pending: LogEntry[][];
  priority: 'high' | 'normal' | 'low';
  maxSize: number;
}

/**
 * 自适应限流器类
 */
export class AdaptiveRateLimiter {
  private requestTimestamps: number[] = [];
  private currentQPS: number;
  private readonly defaultQPS: number;
  private consecutiveSuccesses: number = 0;
  private consecutiveFailures: number = 0;
  private queue: ReportQueue;
  private readonly maxQueueSize: number;
  private readonly recoverySuccessThreshold: number;
  private readonly recoveryQueueThreshold: number;

  constructor(options: {
    defaultQPS?: number;
    maxQueueSize?: number;
    recoverySuccessThreshold?: number;
    recoveryQueueThreshold?: number;
  } = {}) {
    this.defaultQPS = options.defaultQPS || 5;
    this.currentQPS = this.defaultQPS;
    this.maxQueueSize = options.maxQueueSize || 200;
    this.recoverySuccessThreshold = options.recoverySuccessThreshold || 10;
    this.recoveryQueueThreshold = options.recoveryQueueThreshold || 20;

    this.queue = {
      pending: [],
      priority: 'normal',
      maxSize: this.maxQueueSize,
    };
  }

  /**
   * 等待直到可以发送请求（确保不超过QPS限制）
   */
  async waitForSlot(): Promise<void> {
    const now = Date.now();
    const oneSecondAgo = now - 1000;

    // 清理1秒之前的请求时间戳
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneSecondAgo);

    // 如果达到当前QPS限制，等待
    if (this.requestTimestamps.length >= this.currentQPS) {
      const oldestTime = this.requestTimestamps[0];
      const waitTime = 1000 - (now - oldestTime) + 50; // 50ms缓冲确保安全
      if (waitTime > 0) {
        await this.sleep(waitTime);
        // 递归检查，确保等待后仍然符合限制
        return this.waitForSlot();
      }
    }

    // 记录本次请求时间戳
    this.requestTimestamps.push(now);
  }

  /**
   * 处理429错误（Too Many Requests）
   */
  on429Error(): void {
    // 降低QPS
    this.currentQPS = Math.max(2, this.currentQPS - 1);
    this.consecutiveSuccesses = 0;
    this.consecutiveFailures++;
    
    // 清理请求时间戳，重置限流窗口
    this.requestTimestamps.length = 0;
  }

  /**
   * 处理成功上报
   */
  onSuccess(): void {
    this.consecutiveSuccesses++;
    this.consecutiveFailures = 0;

    // 逐步恢复QPS
    if (this.consecutiveSuccesses >= this.recoverySuccessThreshold && this.currentQPS < this.defaultQPS) {
      this.currentQPS = Math.min(this.defaultQPS, this.currentQPS + 1);
      this.consecutiveSuccesses = 0;
    }
  }

  /**
   * 处理上报失败（非429错误）
   */
  onFailure(): void {
    this.consecutiveSuccesses = 0;
    this.consecutiveFailures++;
  }

  /**
   * 添加批次到队列
   */
  enqueue(logs: LogEntry[], priority: 'high' | 'normal' | 'low' = 'normal'): boolean {
    // 检查队列大小
    if (this.queue.pending.length >= this.queue.maxSize) {
      // 队列已满，丢弃低优先级批次
      if (priority === 'low') {
        return false; // 拒绝添加
      }
      
      // 如果是高优先级，移除最旧的正常优先级批次
      if (priority === 'high') {
        const normalIndex = this.queue.pending.findIndex((_, index) => {
          // 这里简化处理，假设批次顺序代表优先级
          return index < this.queue.pending.length;
        });
        if (normalIndex !== -1) {
          this.queue.pending.splice(normalIndex, 1);
        }
      }
    }

    // 根据优先级插入队列
    if (priority === 'high') {
      this.queue.pending.unshift(logs);
    } else {
      this.queue.pending.push(logs);
    }

    // 检查队列积压情况，触发退避
    this.checkBackoff();

    return true;
  }

  /**
   * 从队列获取下一个批次
   */
  dequeue(): LogEntry[] | null {
    if (this.queue.pending.length === 0) {
      return null;
    }

    // 优先返回高优先级批次
    // 简化实现：第一个批次（如果是高优先级插入的）优先
    return this.queue.pending.shift() || null;
  }

  /**
   * 检查队列积压情况，触发退避
   */
  private checkBackoff(): void {
    const queueLength = this.queue.pending.length;

    if (queueLength > 100) {
      // 重度积压，触发重度退避
      this.currentQPS = Math.max(2, this.currentQPS - 1);
      this.consecutiveSuccesses = 0;
    } else if (queueLength > 50) {
      // 中度积压，触发退避
      if (this.currentQPS > 3) {
        this.currentQPS = 3;
        this.consecutiveSuccesses = 0;
      }
    } else if (queueLength < this.recoveryQueueThreshold) {
      // 队列恢复正常，逐步恢复QPS
      if (this.currentQPS < this.defaultQPS) {
        // 恢复逻辑由 onSuccess 处理
      }
    }
  }

  /**
   * 获取当前队列长度
   */
  getQueueLength(): number {
    return this.queue.pending.length;
  }

  /**
   * 获取当前QPS设置
   */
  getCurrentQPS(): number {
    return this.currentQPS;
  }

  /**
   * 清空队列
   */
  clearQueue(): void {
    this.queue.pending = [];
  }

  /**
   * 睡眠函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 重置限流器
   */
  reset(): void {
    this.currentQPS = this.defaultQPS;
    this.consecutiveSuccesses = 0;
    this.consecutiveFailures = 0;
    this.requestTimestamps = [];
    this.clearQueue();
  }
}