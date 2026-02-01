/**
 * 监控收集器核心模块
 * 统一收集所有监控数据，支持批量上报和采样率控制
 */

import type { MonitorEvent } from './types';
import { getConfig } from './config';
import { transformMonitorEventToLogEntry } from './transformer';
import { reportLog } from '../log-reporter';
import { getOrCreateSessionId } from './config';

/**
 * 监控收集器类
 */
export class MonitorCollector {
  private sessionId: string;
  private userId?: string;
  private appName: string;
  private eventQueue: MonitorEvent[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(appName: string, sessionId?: string, userId?: string) {
    this.appName = appName;
    this.sessionId = sessionId || getOrCreateSessionId();
    this.userId = userId;
  }

  /**
   * 收集监控事件
   */
  collect(event: Omit<MonitorEvent, 'appName' | 'sessionId' | 'timestamp'>): void {
    const config = getConfig();

    // 采样率控制
    if (config.sampleRate < 1.0 && Math.random() > config.sampleRate) {
      return;
    }

    // 构建完整事件
    const fullEvent: MonitorEvent = {
      ...event,
      appName: this.appName,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
    };

    // 添加到队列
    this.eventQueue.push(fullEvent);

    // 检查是否需要立即上报
    if (this.eventQueue.length >= (config.batchSize || 10)) {
      this.flush();
    } else {
      // 设置定时器，在最大等待时间后上报
      this.scheduleFlush();
    }
  }

  /**
   * 批量收集监控事件
   */
  collectBatch(events: Omit<MonitorEvent, 'appName' | 'sessionId' | 'timestamp'>[]): void {
    events.forEach(event => this.collect(event));
  }

  /**
   * 立即上报队列中的所有事件
   */
  flush(): void {
    if (this.eventQueue.length === 0) {
      return;
    }

    // 清除定时器
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // 转换并上报
    const logEntries = this.eventQueue.map(transformMonitorEventToLogEntry);
    logEntries.forEach(entry => {
      reportLog(entry);
    });

    // 清空队列
    this.eventQueue = [];
  }

  /**
   * 安排定时上报
   */
  private scheduleFlush(): void {
    if (this.flushTimer) {
      return; // 已有定时器，不需要重复设置
    }

    const config = getConfig();
    const maxWaitTime = config.maxWaitTime || 5000;

    this.flushTimer = setTimeout(() => {
      this.flush();
    }, maxWaitTime);
  }

  /**
   * 更新用户ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * 更新会话ID
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * 销毁收集器（清理资源）
   */
  destroy(): void {
    // 立即上报剩余事件
    this.flush();

    // 清除定时器
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

/**
 * 全局监控收集器实例
 */
let globalCollector: MonitorCollector | null = null;

/**
 * 获取或创建全局监控收集器
 */
export function getCollector(): MonitorCollector {
  if (!globalCollector) {
    const config = getConfig();
    globalCollector = new MonitorCollector(config.appName, config.sessionId, config.userId);
  }
  return globalCollector;
}

/**
 * 设置全局监控收集器
 */
export function setCollector(collector: MonitorCollector): void {
  globalCollector = collector;
}

/**
 * 销毁全局监控收集器
 */
export function destroyCollector(): void {
  if (globalCollector) {
    globalCollector.destroy();
    globalCollector = null;
  }
}
