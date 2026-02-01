/**
 * 日志上报核心逻辑
 * 负责将日志上报到服务器
 * 集成分类器、处理器、限流器
 */

import type { LogEntry, LogReporterOptions, LogReportResponse, LogReportRequest, LogPriority } from './types';
import { LogQueue } from './queue';
import { LogClassifier } from './classifier';
import { LogProcessor } from './processor';
import { AdaptiveRateLimiter } from './rate-limiter';
import { getCurrentAppId } from '../env-info';
import { getFullAppId, getSimpleAppName, convertToServerLogEntry, toISOString, estimateLogSize, generateBatchId } from './utils';
import { isBusinessApp, isSpecialAppById } from '../../configs/app-env.config';

/**
 * 日志上报器类
 */
export class LogReporter {
  private queue: LogQueue;
  private classifier: LogClassifier;
  private processor: LogProcessor;
  private rateLimiter: AdaptiveRateLimiter;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private readonly enabled: boolean;
  private readonly silent: boolean;
  private appName: string;
  
  // 最小批次大小配置（用于处理后的日志数量检查）
  private readonly highFrequencyMinBatchSize: number = 15;
  private readonly lowFrequencyMinBatchSize: number = 50;

  constructor(options: LogReporterOptions = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.enabled = options.enabled !== false;
    this.silent = options.silent || false;

    // 获取应用名称
    this.appName = this.getAppName();

    // 初始化分类器
    this.classifier = new LogClassifier();

    // 初始化处理器
    this.processor = new LogProcessor();

    // 初始化自适应限流器（默认QPS为10）
    this.rateLimiter = new AdaptiveRateLimiter({
      defaultQPS: 10,
      maxQueueSize: 200,
    });

    // 创建日志队列
    // onFlush 现在支持传递 isHighFrequency 参数，用于判断处理后的日志数量是否达到最小批次大小
    this.queue = new LogQueue(
      (logs, skipRetry, isHighFrequency) => this.reportLogs(logs, skipRetry, isHighFrequency),
      {
        batchSize: options.batchSize || 10,
        maxWaitTime: options.maxWaitTime || 5000,
      }
    );

    // 定期清理分类器数据（防止内存泄漏）
    setInterval(() => {
      this.classifier.cleanup(60000); // 清理60秒前的数据
    }, 30000); // 每30秒清理一次
  }

  /**
   * 获取应用名称
   */
  private getAppName(): string {
    // 优先从环境信息获取
    const appId = getCurrentAppId();
    if (appId) {
      return appId;
    }

    // 从 window 对象获取
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.__APP_NAME__) {
        return win.__APP_NAME__;
      }
      if (win.__QIANKUN_APP_NAME__) {
        return win.__QIANKUN_APP_NAME__;
      }
    }

    // 默认值
    return 'unknown';
  }

  /**
   * 上报日志（批量）
   * @param skipRetry 是否跳过重试（用于测试场景）
   * @param isHighFrequency 是否来自高频队列（用于确定最小批次大小）
   * @returns true 表示上报成功，false 表示日志数量太少需要重新放回队列，void 表示其他情况
   */
  private async reportLogs(logs: LogEntry[], skipRetry: boolean = false, isHighFrequency?: boolean): Promise<boolean | void> {
    if (!this.enabled || logs.length === 0) {
      return;
    }

    // 确保所有日志都有应用名称，并过滤掉特殊应用
    const logsWithAppName = logs
      .map(log => ({
        ...log,
        appName: log.appName || this.appName,
      }))
      .filter(log => {
        // 只上报主应用和业务应用的日志，过滤掉特殊应用
        const appName = log.appName;
        const appNameForCheck = appName.endsWith('-app') ? appName : `${appName}-app`;
        // 允许 invalid-app 通过，用于测试错误情况
        if (appNameForCheck === 'invalid-app') {
          return true;
        }
        // 允许主应用（main-app）上报
        if (appNameForCheck === 'main-app') {
          return true;
        }
        // 允许业务应用上报
        return isBusinessApp(appNameForCheck);
      });

    // 如果所有日志都被过滤掉，直接返回
    if (logsWithAppName.length === 0) {
      return;
    }

    // 重要：按应用分组，确保同一批次只包含同一个应用的日志
    // appId 是唯一应用标识，不能混用
    const logsByApp = new Map<string, LogEntry[]>();
    for (const log of logsWithAppName) {
      const appName = log.appName || this.appName;
      const fullAppId = getFullAppId(appName);
      if (!logsByApp.has(fullAppId)) {
        logsByApp.set(fullAppId, []);
      }
      logsByApp.get(fullAppId)!.push(log);
    }

    // 如果日志来自多个应用，应该只处理当前应用的日志（其他应用的日志应该重新放回队列）
    // 但通常情况下，每个应用都有自己的LogReporter实例，所以应该只有一个应用
    // 为了安全，我们只处理第一个应用的日志，其他应用的日志可以丢弃或记录警告
    const appIds = Array.from(logsByApp.keys());
    if (appIds.length > 1) {
      // 多个应用的日志混在一起，这是不应该发生的情况
      // 应该只处理当前应用的日志，其他应用的日志应该被过滤掉
      if (!this.silent && import.meta.env.DEV) {
        console.warn('[LogReporter] 检测到多个应用的日志混在一起，只处理当前应用的日志:', {
          currentApp: this.appName,
          allApps: appIds,
        });
      }
    }

    // 获取当前应用的日志（优先使用当前应用的日志，如果存在）
    const currentAppId = getFullAppId(this.appName);
    const appLogs = logsByApp.get(currentAppId) || logsByApp.get(appIds[0]) || logsWithAppName;

    // 数据整理：处理日志（去重、合并、采样）
    const processed = this.processor.process(appLogs);
    const logsToSend = processed.logs;

    if (logsToSend.length === 0) {
      return;
    }

    // 检查处理后的日志数量是否达到最小批次大小
    // 如果不知道是否高频，通过日志内容判断（大部分监控类日志是高频）
    let shouldBeHighFrequency = isHighFrequency;
    if (shouldBeHighFrequency === undefined) {
      // 通过日志内容判断：如果有监控类日志，很可能是高频
      const hasMonitorLogs = logsToSend.some(log => {
        const eventType = log.extensions?.eventType;
        return eventType && (
          eventType.includes('performance') ||
          eventType.includes('route') ||
          eventType.includes('app:lifecycle') ||
          eventType.includes('user:')
        );
      });
      shouldBeHighFrequency = hasMonitorLogs;
    }

    // 根据频率类型确定最小批次大小
    const minBatchSize = shouldBeHighFrequency 
      ? this.highFrequencyMinBatchSize  // 高频：15条
      : this.lowFrequencyMinBatchSize;  // 低频：50条

    // 如果处理后的日志数量少于最小批次大小，应该重新放回队列等待更多日志
    // 但需要设置一个绝对最小值阈值，避免日志永远不上报
    const absoluteMinThreshold = shouldBeHighFrequency ? 3 : 10;
    
    if (logsToSend.length < minBatchSize && logsToSend.length >= absoluteMinThreshold) {
      // 处理后的日志数量少于最小批次大小，但大于绝对最小值
      // 这种情况下，应该等待更多日志，重新放回队列
      // 返回 false，让队列知道应该重新放回日志
      return false;
    }
    
    // 如果处理后的日志数量太少（小于绝对最小值），仍然上报（避免日志丢失）
    // 或者已经达到最小批次大小，正常上报

    // 获取应用ID（用于批次号生成和限流）
    const appName = logsToSend[0]?.appName || this.appName;
    const fullAppId = getFullAppId(appName);

    // 自适应限流：等待直到可以发送请求（确保不超过QPS限制）
    await this.rateLimiter.waitForSlot();

    // 重试机制（测试场景可以跳过）
    const maxAttempts = skipRetry ? 1 : this.maxRetries + 1;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await this.sendLogs(logsToSend, fullAppId);
        if (response.success) {
          // 上报成功，通知限流器
          this.rateLimiter.onSuccess();
          return true; // 上报成功，返回 true
        }
        throw new Error(response.message || '上报失败');
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // 如果是 429 错误（Too Many Requests），通知限流器
        if (error instanceof Error && error.message.includes('429')) {
          this.rateLimiter.on429Error();
          // 429 错误表示限流，等待更长时间后重试
          await this.sleep(2000); // 等待 2 秒
          continue;
        } else {
          // 其他错误
          this.rateLimiter.onFailure();
        }

        // 如果是最后一次尝试，直接抛出错误（不等待）
        if (attempt >= maxAttempts - 1) {
          break;
        }

        // 如果不是最后一次尝试，等待后重试
        await this.sleep(this.retryDelay * (attempt + 1)); // 指数退避
      }
    }

    // 所有重试都失败，抛出错误
    if (lastError) {
      if (!this.silent) {
        console.error('[LogReporter] 日志上报失败（已重试）:', lastError);
      }
      throw lastError;
    }
  }

  /**
   * 发送日志到服务器
   */
  private async sendLogs(logs: LogEntry[], fullAppId: string): Promise<LogReportResponse> {
    if (logs.length === 0) {
      return { success: true, count: 0 };
    }

    // 获取应用名称（从日志或fullAppId中提取）
    const appName = logs[0]?.appName || this.appName;

    // 转换为服务器格式并过滤过大的日志
    const serverLogs = logs
      .map(convertToServerLogEntry)
      .filter(entry => {
        const size = estimateLogSize(entry);
        if (size > 2048) {
          console.warn('[LogReporter] 日志条目过大，已跳过:', entry);
          return false;
        }
        return true;
      });

    if (serverLogs.length === 0) {
      return { success: true, count: 0, message: '所有日志条目都被过滤' };
    }

    // 生成批次号（格式：batch-{timestamp}-{appId}）
    const batchId = generateBatchId(fullAppId);

    // 构建请求体
    // 批次时间戳使用当前时间（而非日志内部时间戳），因为上报时间一定晚于日志生成时间
    const batchTimestamp = toISOString(Date.now());
    
    // 从完整应用ID提取简化应用名称
    const simpleAppName = getSimpleAppName(fullAppId);
    
    const requestBody: LogReportRequest = {
      appId: fullAppId,
      appName: simpleAppName,
      timestamp: batchTimestamp,
      logs: serverLogs,
      // 如果后端支持批次号，可以添加到请求体中
      // batchId: batchId,
    };

    // URL 使用不带 -app 后缀的应用名
    const appNameForUrl = appName.endsWith('-app') ? appName.slice(0, -4) : appName;
    const url = `/api/system/logs/${appNameForUrl}/receive`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        // 不阻塞主线程，使用 keepalive（如果支持）
        keepalive: true,
      });

      // 先尝试解析响应体（无论成功还是失败）
      let responseData: any;
      try {
        responseData = await response.json();
      } catch {
        // 如果无法解析 JSON，使用默认处理
        responseData = null;
      }

      // 检查 HTTP 状态码
      if (!response.ok) {
        // 尝试解析后端返回的错误信息
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        if (responseData) {
          // 后端可能返回 {code, msg, data} 格式的错误
          if (responseData.msg) {
            errorMessage = `HTTP ${response.status}: ${responseData.msg}`;
          } else if (responseData.message) {
            errorMessage = `HTTP ${response.status}: ${responseData.message}`;
          }
        }
        throw new Error(errorMessage);
      }

      // 检查响应体中的业务状态码（即使 HTTP 状态码是 200，业务状态码也可能表示错误）
      if (responseData && typeof responseData.code === 'number' && responseData.code !== 200) {
        // 业务状态码表示错误
        let errorMessage = `业务错误 ${responseData.code}`;
        if (responseData.msg) {
          errorMessage = `业务错误 ${responseData.code}: ${responseData.msg}`;
        } else if (responseData.message) {
          errorMessage = `业务错误 ${responseData.code}: ${responseData.message}`;
        }
        throw new Error(errorMessage);
      }

      // 响应成功
      return {
        success: true,
        message: responseData?.message,
        count: responseData?.count || serverLogs.length,
      };
    } catch (error) {
      // 网络错误或其他错误
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * 添加日志到队列
   */
  report(entry: LogEntry): void {
    if (!this.enabled) {
      return;
    }

    // 确保日志有应用名称和时间戳
    const appName = entry.appName || this.appName;
    const logEntry: LogEntry = {
      ...entry,
      appName,
      timestamp: entry.timestamp || Date.now(),
    };

    // 只上报主应用和业务应用的日志，过滤掉特殊应用（layout-app, docs-app, home-app）
    // 判断方式：检查 appName 是否为主应用或业务应用
    const appNameForCheck = appName.endsWith('-app') ? appName : `${appName}-app`;
    // 允许 invalid-app 通过，用于测试错误情况
    if (appNameForCheck === 'invalid-app') {
      // 测试用应用，允许上报
    } else if (appNameForCheck === 'main-app') {
      // 主应用，允许上报
    } else if (!isBusinessApp(appNameForCheck)) {
      // 如果不是业务应用，静默跳过，不进行上报
      if (import.meta.env.DEV) {
        console.debug('[LogReporter] 跳过特殊应用的日志上报:', appName);
      }
      return;
    }

    // 获取应用ID（用于分类）
    const fullAppId = getFullAppId(appName);

    // 分类日志：确定频率和优先级
    const classification = this.classifier.classify(logEntry, fullAppId);

    // 根据分类结果添加到对应队列
    this.queue.add(
      logEntry,
      classification.priority,
      classification.frequency === 'high'
    );
  }

  /**
   * 立即刷新队列（用于应用关闭时）
   * @param throwOnError 是否在错误时抛出异常（默认 true，用于测试场景）
   * @param skipRetry 是否跳过重试（默认 false，测试场景可以设为 true）
   * @throws 如果上报失败且 throwOnError 为 true，会抛出错误
   */
  async flush(throwOnError: boolean = true, skipRetry: boolean = false): Promise<void> {
    // 使用队列的 flush 方法，传递 throwOnError 和 skipRetry 参数
    await this.queue.flush(throwOnError, skipRetry);
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue.clear();
  }

  /**
   * 获取队列长度
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * 睡眠函数（用于重试延迟）
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 销毁上报器
   */
  destroy(): void {
    this.queue.destroy();
    this.classifier.reset();
    this.rateLimiter.reset();
  }
}
