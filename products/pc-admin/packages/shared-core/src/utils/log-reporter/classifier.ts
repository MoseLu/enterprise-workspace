/**
 * 日志分类器
 * 根据频率自动分类高频/低频日志
 */

import type { LogEntry, LogFrequency, LogPriority, LogClassificationResult, LogFrequencyThresholds } from './types';

/**
 * 日志分类器类
 */
export class LogClassifier {
  private frequencyMap = new Map<string, number[]>(); // key: `${appId}:${eventType}` -> timestamps[]
  private readonly thresholds: LogFrequencyThresholds;

  constructor(thresholds?: Partial<LogFrequencyThresholds>) {
    this.thresholds = {
      highFrequencyThreshold: thresholds?.highFrequencyThreshold || 10,
      checkWindow: thresholds?.checkWindow || 10000,
    };
  }

  /**
   * 分类日志
   * @param entry 日志条目
   * @param appId 应用ID
   * @returns 分类结果
   */
  classify(entry: LogEntry, appId: string): LogClassificationResult {
    const frequency = this.determineFrequency(entry, appId);
    const priority = this.determinePriority(entry, frequency);
    const needsProcessing = frequency === 'high';

    return {
      frequency,
      priority,
      needsProcessing,
    };
  }

  /**
   * 确定日志频率
   */
  private determineFrequency(entry: LogEntry, appId: string): LogFrequency {
    // 1. 检查 level - 错误和致命错误总是低频
    if (entry.level === 'error' || entry.level === 'fatal') {
      return 'low';
    }

    // 2. 检查 eventType - 预定义的高频事件类型（立即识别为高频，无需等待统计）
    const eventType = entry.extensions?.eventType;
    if (eventType) {
      // 所有监控类日志统一识别为高频（这些日志通常批量出现，应该合并上报）
      const monitorEventTypes = [
        'performance:page',      // 页面性能监控
        'performance:resource',  // 资源性能监控
        'performance:metric',   // 性能指标
        'route:navigation',     // 路由导航（所有路由导航，不仅仅是启动时）
        'route:change',         // 路由切换
        'app:lifecycle',        // 应用生命周期
        'user:action',          // 用户行为
        'user:click',           // 用户点击
        'user:scroll',          // 用户滚动
      ];

      if (monitorEventTypes.some(type =>
        eventType.toLowerCase().includes(type) ||
        eventType.toLowerCase().startsWith(type)
      )) {
        // 立即识别为高频，记录时间戳用于统计
        const key = `${appId}:${eventType}`;
        const timestamps = this.frequencyMap.get(key) || [];
        const now = Date.now();
        const windowStart = now - this.thresholds.checkWindow;
        const recentTimestamps = timestamps.filter(ts => ts >= windowStart);
        recentTimestamps.push(now);
        this.frequencyMap.set(key, recentTimestamps.slice(-100));
        // 强制识别为高频，这样会进入高频队列，有更长的延迟时间（15-20秒）
        return 'high';
      }

      // 明确的低频事件类型
      const lowFrequencyEventTypes = ['login', 'logout', 'error', 'exception'];
      if (lowFrequencyEventTypes.some(type =>
        eventType.toLowerCase().includes(type) ||
        eventType.toLowerCase().endsWith(type) ||
        eventType.toLowerCase().startsWith(type)
      )) {
        return 'low';
      }
    }

    // 3. 检查 message 模式 - 低频消息模式
    const message = entry.message?.toLowerCase() || '';
    const lowFrequencyPatterns = ['login', 'logout', 'error', 'exception', 'failed', 'fail'];
    if (lowFrequencyPatterns.some(pattern => message.includes(pattern))) {
      return 'low';
    }

    // 4. 检查频率统计 - 根据上报频率判断
    const key = `${appId}:${eventType || entry.level}`;
    const timestamps = this.frequencyMap.get(key) || [];
    const now = Date.now();
    const windowStart = now - this.thresholds.checkWindow;

    // 清理过期时间戳
    const recentTimestamps = timestamps.filter(ts => ts >= windowStart);

    // 统计最近时间窗口内的日志数量
    const recentCount = recentTimestamps.length;

    if (recentCount >= this.thresholds.highFrequencyThreshold) {
      // 频率超过阈值，判定为高频
      return 'high';
    }

    // 记录本次时间戳
    recentTimestamps.push(now);
    // 只保留最近时间窗口内的时间戳（限制数量避免内存泄漏）
    const limitedTimestamps = recentTimestamps.slice(-100);
    this.frequencyMap.set(key, limitedTimestamps);

    return 'low';
  }

  /**
   * 确定日志优先级
   */
  private determinePriority(entry: LogEntry, frequency: LogFrequency): LogPriority {
    // 错误日志总是高优先级
    if (entry.level === 'error' || entry.level === 'fatal') {
      return 'high';
    }

    // 低频日志通常是正常优先级
    if (frequency === 'low') {
      return 'normal';
    }

    // 高频日志通常是低优先级
    return 'low';
  }

  /**
   * 清理过期数据（防止内存泄漏）
   */
  cleanup(maxAge: number = 60000): void {
    const now = Date.now();
    const cutoff = now - maxAge;

    for (const [key, timestamps] of this.frequencyMap.entries()) {
      const filtered = timestamps.filter(ts => ts >= cutoff);
      if (filtered.length === 0) {
        this.frequencyMap.delete(key);
      } else {
        this.frequencyMap.set(key, filtered);
      }
    }
  }

  /**
   * 重置分类器
   */
  reset(): void {
    this.frequencyMap.clear();
  }
}
