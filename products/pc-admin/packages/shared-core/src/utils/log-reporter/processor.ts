/**
 * 日志处理器
 * 数据整理：去重、合并、采样
 */

import type { LogEntry, LogEntryWithCount } from './types';
import { calculateLogHash, isLogEntryEqual } from './utils';

interface ProcessedLogs {
  logs: LogEntry[];
  removedCount: number;
}

/**
 * 日志处理器类
 */
export class LogProcessor {
  /**
   * 处理日志列表（去重、合并、采样）
   */
  process(logs: LogEntry[]): ProcessedLogs {
    if (logs.length === 0) {
      return { logs: [], removedCount: 0 };
    }

    let processedLogs = [...logs];
    let removedCount = 0;

    // 1. 处理累加计数日志（如果已经包含repeatCount，保留）
    processedLogs = processedLogs.map(log => {
      if ('repeatCount' in log && (log as LogEntryWithCount).repeatCount) {
        return log; // 已经是累加后的日志，直接保留
      }
      return log;
    });

    // 2. 对资源性能日志进行采样合并（在去重之前，因为资源日志URL不同，需要按类型合并）
    const { logs: sampledLogs, removed: sampleRemovedCount } = this.sampleResourceLogs(processedLogs);
    processedLogs = sampledLogs;
    removedCount += sampleRemovedCount;

    // 3. 完全重复日志去重
    const { logs: deduplicatedLogs, removed: dedupeCount } = this.deduplicateLogs(processedLogs);
    processedLogs = deduplicatedLogs;
    removedCount += dedupeCount;

    // 4. 路由切换日志优化（只保留最终状态）
    const { logs: routeOptimizedLogs, removed: routeRemovedCount } = this.optimizeRouteLogs(processedLogs);
    processedLogs = routeOptimizedLogs;
    removedCount += routeRemovedCount;

    // 5. 格式化日志消息和数值（格式化数值、处理N/A值、清理格式）
    processedLogs = processedLogs.map(log => this.formatLogEntry(log));

    return {
      logs: processedLogs,
      removedCount,
    };
  }

  /**
   * 对资源性能日志进行采样合并
   * 相同类型的资源日志（如所有JS文件、所有CSS文件）按时间窗口合并统计
   */
  private sampleResourceLogs(logs: LogEntry[]): { logs: LogEntry[]; removed: number } {
    const resourceLogs: LogEntry[] = [];
    const nonResourceLogs: LogEntry[] = [];

    // 分离资源性能日志和其他日志
    for (const log of logs) {
      const eventType = log.extensions?.eventType;
      if (eventType === 'performance:resource') {
        resourceLogs.push(log);
      } else {
        nonResourceLogs.push(log);
      }
    }

    if (resourceLogs.length === 0) {
      return { logs, removed: 0 };
    }

    // 按资源类型分组（如：js, css, other等）
    const resourceGroups = new Map<string, LogEntry[]>();
    for (const log of resourceLogs) {
      const resourceType = log.extensions?.resource?.type || 'other';
      if (!resourceGroups.has(resourceType)) {
        resourceGroups.set(resourceType, []);
      }
      resourceGroups.get(resourceType)!.push(log);
    }

    // 对每组资源日志进行采样合并（每30秒采样一次，扩大采样窗口）
    const sampledLogs: LogEntry[] = [];
    const sampleWindow = 30000; // 30秒采样窗口（扩大窗口，合并更多日志）

    for (const [resourceType, groupLogs] of resourceGroups.entries()) {
      if (groupLogs.length <= 10) {
        // 数量少（<=10条），直接保留
        sampledLogs.push(...groupLogs);
      } else {
        // 数量多（>10条），进行采样合并
        const sampled = this.sampleLogs(groupLogs, sampleWindow);
        sampledLogs.push(...sampled);
      }
    }

    // 合并采样后的资源日志和其他日志，按时间戳排序
    const allLogs = [...sampledLogs, ...nonResourceLogs].sort((a, b) => a.timestamp - b.timestamp);

    return {
      logs: allLogs,
      removed: logs.length - allLogs.length,
    };
  }

  /**
   * 完全重复日志去重
   * 相同时间窗口内完全相同的日志只保留最新的
   */
  private deduplicateLogs(logs: LogEntry[]): { logs: LogEntry[]; removed: number } {
    const seen = new Map<string, LogEntry>(); // hash -> 最新日志
    const timeWindow = 5000; // 5秒时间窗口

    for (const log of logs) {
      const hash = calculateLogHash(log);
      const existing = seen.get(hash);

      if (existing) {
        // 检查时间窗口
        const timeDiff = Math.abs(log.timestamp - existing.timestamp);
        if (timeDiff <= timeWindow) {
          // 在时间窗口内，保留较新的日志
          if (log.timestamp > existing.timestamp) {
            seen.set(hash, log);
          }
          // 否则保留现有的（已跳过当前日志）
        } else {
          // 超出时间窗口，两个都保留
          seen.set(hash, log);
        }
      } else {
        seen.set(hash, log);
      }
    }

    const deduplicatedLogs = Array.from(seen.values());
    const removed = logs.length - deduplicatedLogs.length;

    return {
      logs: deduplicatedLogs.sort((a, b) => a.timestamp - b.timestamp), // 按时间戳排序
      removed,
    };
  }

  /**
   * 路由切换日志优化
   * 识别路由切换序列（如 B→C→D→F），只保留最终状态（F页面）
   */
  private optimizeRouteLogs(logs: LogEntry[]): { logs: LogEntry[]; removed: number } {
    const routeLogs: LogEntry[] = [];
    const nonRouteLogs: LogEntry[] = [];
    const routeSequence = new Map<string, LogEntry[]>(); // 用户/会话 -> 路由日志序列

    // 分离路由日志和非路由日志
    for (const log of logs) {
      const route = log.extensions?.route;
      if (route && route.from && route.to) {
        routeLogs.push(log);
      } else {
        nonRouteLogs.push(log);
      }
    }

    if (routeLogs.length === 0) {
      return { logs, removed: 0 };
    }

    // 按用户/会话分组
    for (const log of routeLogs) {
      const sessionId = log.extensions?.sessionId || 'default';
      const userId = log.extensions?.userId || 'default';
      const key = `${sessionId}:${userId}`;

      if (!routeSequence.has(key)) {
        routeSequence.set(key, []);
      }
      routeSequence.get(key)!.push(log);
    }

    // 处理每个序列，只保留最终状态
    const optimizedRouteLogs: LogEntry[] = [];
    let routeRemovedCount = 0;

    for (const [key, sequence] of routeSequence.entries()) {
      if (sequence.length === 1) {
        // 只有一个路由日志，保留
        optimizedRouteLogs.push(sequence[0]);
      } else {
        // 多个路由日志，按时间戳排序，只保留最后一个
        sequence.sort((a, b) => a.timestamp - b.timestamp);
        const finalRoute = sequence[sequence.length - 1];
        
        // 检查是否确实是路由切换序列（from和to有连续性）
        let isValidSequence = true;
        for (let i = 0; i < sequence.length - 1; i++) {
          const current = sequence[i];
          const next = sequence[i + 1];
          if (current.extensions?.route?.to !== next.extensions?.route?.from) {
            // 不是连续的路由切换，可能不是同一个序列
            // 但为了安全起见，仍然只保留最后一个
            break;
          }
        }

        optimizedRouteLogs.push(finalRoute);
        routeRemovedCount += sequence.length - 1;
      }
    }

    // 合并优化后的路由日志和非路由日志，按时间戳排序
    const allLogs = [...optimizedRouteLogs, ...nonRouteLogs].sort((a, b) => a.timestamp - b.timestamp);

    return {
      logs: allLogs,
      removed: routeRemovedCount,
    };
  }

  /**
   * 格式化日志条目（格式化数值、处理N/A值、清理格式）
   */
  private formatLogEntry(entry: LogEntry): LogEntry {
    const formatted = { ...entry };

    // 格式化数值字段（保留2位小数）
    if (formatted.extensions?.performance) {
      const perf = formatted.extensions.performance;
      const formattedPerf: Record<string, any> = {};
      for (const [key, value] of Object.entries(perf)) {
        if (typeof value === 'number') {
          // 保留2位小数，四舍五入
          formattedPerf[key] = Math.round(value * 100) / 100;
        } else {
          formattedPerf[key] = value;
        }
      }
      formatted.extensions = {
        ...formatted.extensions,
        performance: formattedPerf,
      };
    }

    // 格式化资源信息中的数值
    if (formatted.extensions?.resource) {
      const resource = formatted.extensions.resource;
      const formattedResource: Record<string, any> = {};
      for (const [key, value] of Object.entries(resource)) {
        if (typeof value === 'number') {
          formattedResource[key] = Math.round(value * 100) / 100;
        } else {
          formattedResource[key] = value;
        }
      }
      formatted.extensions = {
        ...formatted.extensions,
        resource: formattedResource,
      };
    }

    // 格式化API信息中的数值
    if (formatted.extensions?.api) {
      const api = formatted.extensions.api;
      const formattedApi: Record<string, any> = {};
      for (const [key, value] of Object.entries(api)) {
        if (typeof value === 'number') {
          formattedApi[key] = Math.round(value * 100) / 100;
        } else {
          formattedApi[key] = value;
        }
      }
      formatted.extensions = {
        ...formatted.extensions,
        api: formattedApi,
      };
    }

    // 格式化消息中的数值和N/A值
    if (formatted.message) {
      formatted.message = this.formatLogMessage(formatted.message, formatted.extensions);
    }

    return formatted;
  }

  /**
   * 格式化日志消息（处理N/A值、格式化数值）
   */
  private formatLogMessage(message: string, extensions?: Record<string, any>): string {
    const eventType = extensions?.eventType;

    // 格式化性能页面消息
    if (eventType === 'performance:page' && extensions?.performance) {
      const perf = extensions.performance;
      const parts: string[] = [];
      
      // 只显示有效的指标（不为undefined、null、NaN）
      if (typeof perf.fcp === 'number' && !isNaN(perf.fcp)) {
        parts.push(`FCP=${Math.round(perf.fcp * 100) / 100}ms`);
      }
      if (typeof perf.lcp === 'number' && !isNaN(perf.lcp)) {
        parts.push(`LCP=${Math.round(perf.lcp * 100) / 100}ms`);
      }
      if (typeof perf.fid === 'number' && !isNaN(perf.fid)) {
        parts.push(`FID=${Math.round(perf.fid * 100) / 100}ms`);
      }
      if (typeof perf.cls === 'number' && !isNaN(perf.cls)) {
        parts.push(`CLS=${Math.round(perf.cls * 10000) / 10000}`); // CLS 保留4位小数
      }
      if (typeof perf.ttfb === 'number' && !isNaN(perf.ttfb)) {
        parts.push(`TTFB=${Math.round(perf.ttfb * 100) / 100}ms`);
      }
      if (typeof perf.domReady === 'number' && !isNaN(perf.domReady)) {
        parts.push(`DOM Ready=${Math.round(perf.domReady * 100) / 100}ms`);
      }
      if (typeof perf.loadComplete === 'number' && !isNaN(perf.loadComplete)) {
        parts.push(`Load Complete=${Math.round(perf.loadComplete * 100) / 100}ms`);
      }
      if (typeof perf.duration === 'number' && !isNaN(perf.duration)) {
        parts.push(`Duration=${Math.round(perf.duration * 100) / 100}ms`);
      }

      if (parts.length > 0) {
        return `页面性能: ${parts.join(', ')}`;
      } else {
        return '页面性能: 无有效指标';
      }
    }

    // 其他消息类型，替换 N/A 值
    // 例如：将 "N/Ams"、"N/A" 等替换为更合理的格式，或者从消息中移除
    let formatted = message;
    
    // 移除 "=N/A" 模式（包括 =N/Ams, =N/A 等）
    formatted = formatted.replace(/=N\/A\w*/g, '');
    
    // 移除独立的 "N/A" 值（前后有逗号或空格的情况）
    formatted = formatted.replace(/,\s*N\/A\w*\s*/g, ',');
    formatted = formatted.replace(/\s*N\/A\w*\s*,/g, ',');
    formatted = formatted.replace(/:\s*N\/A\w*/g, ':');
    
    // 移除多余的逗号和空格
    formatted = formatted.replace(/,\s*,/g, ',');
    formatted = formatted.replace(/:\s*,/g, ':');
    formatted = formatted.replace(/,\s*$/g, ''); // 移除末尾的逗号
    formatted = formatted.trim();

    return formatted;
  }

  /**
   * 采样日志（用于统计型日志）
   * 按时间窗口采样，合并相同类型的日志
   */
  sampleLogs(logs: LogEntry[], sampleWindow: number = 10000): LogEntry[] {
    if (logs.length === 0) {
      return [];
    }

    const sampleMap = new Map<string, { log: LogEntry; count: number; windowStart: number }>();
    const now = Date.now();

    for (const log of logs) {
      const eventType = log.extensions?.eventType || log.level;
      const key = `${log.appName}:${eventType}`;
      const sample = sampleMap.get(key);

      if (sample) {
        const windowIndex = Math.floor((now - sample.windowStart) / sampleWindow);
        const logWindowIndex = Math.floor((log.timestamp - sample.windowStart) / sampleWindow);

        if (windowIndex === logWindowIndex) {
          // 同一时间窗口，累加计数
          sample.count++;
          // 保留最新的日志
          if (log.timestamp > sample.log.timestamp) {
            sample.log = log;
          }
        } else {
          // 新时间窗口，创建新的采样
          sampleMap.set(key, {
            log,
            count: 1,
            windowStart: log.timestamp - (log.timestamp % sampleWindow),
          });
        }
      } else {
        // 首次遇到此类日志
        sampleMap.set(key, {
          log,
          count: 1,
          windowStart: log.timestamp - (log.timestamp % sampleWindow),
        });
      }
    }

    // 转换回日志列表，添加计数信息
    return Array.from(sampleMap.values()).map(({ log, count }) => ({
      ...log,
      extensions: {
        ...log.extensions,
        sampleCount: count > 1 ? count : undefined,
      },
    }));
  }
}