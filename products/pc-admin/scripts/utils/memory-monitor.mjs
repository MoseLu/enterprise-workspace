#!/usr/bin/env node

/**
 * 内存监控工具
 * 实时监控 Node.js 进程内存使用情况，支持多进程监控和告警
 */

import { logger } from './logger.mjs';

const DEFAULT_INTERVAL = 5000; // 默认 5 秒监控一次
const DEFAULT_WARNING_THRESHOLD = 0.8; // 默认警告阈值 80%
const DEFAULT_CRITICAL_THRESHOLD = 0.9; // 默认严重警告阈值 90%

let monitoringInterval = null;
let monitoringProcesses = new Map(); // 存储被监控的进程信息
let memoryHistory = []; // 内存使用历史记录
let maxHistorySize = 100; // 最多保留 100 条历史记录

/**
 * 格式化内存大小（字节转 MB）
 */
function formatMemory(bytes) {
  return (bytes / 1024 / 1024).toFixed(2);
}

/**
 * 获取进程内存使用情况
 */
function getMemoryUsage(process = global.process) {
  if (!process.memoryUsage) {
    return null;
  }
  
  const usage = process.memoryUsage();
  return {
    rss: usage.rss,                    // 进程占用的总系统内存
    heapTotal: usage.heapTotal,         // V8 已申请的堆内存
    heapUsed: usage.heapUsed,           // V8 当前正在使用的堆内存（核心关注）
    external: usage.external,          // 非堆内存（Buffer、C++扩展等）
    arrayBuffers: usage.arrayBuffers || 0, // ArrayBuffer 内存
    timestamp: Date.now()
  };
}

/**
 * 检查内存使用是否超过阈值
 */
function checkMemoryThreshold(memUsage, maxHeapSize = 4096 * 1024 * 1024) {
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
  const maxHeapMB = maxHeapSize / 1024 / 1024;
  const usagePercent = heapUsedMB / maxHeapMB;
  
  return {
    usagePercent,
    isWarning: usagePercent >= DEFAULT_WARNING_THRESHOLD,
    isCritical: usagePercent >= DEFAULT_CRITICAL_THRESHOLD,
    heapUsedMB,
    maxHeapMB
  };
}

/**
 * 监控单个进程的内存使用
 */
function monitorProcess(processId, process, options = {}) {
  const {
    name = 'unknown',
    maxHeapSize = 4096 * 1024 * 1024, // 默认 4GB
    onWarning = null,
    onCritical = null
  } = options;

  const memUsage = getMemoryUsage(process);
  if (!memUsage) {
    logger.warn(`[MemoryMonitor] 进程 ${name} (${processId}) 不支持内存监控`);
    return null;
  }

  const threshold = checkMemoryThreshold(memUsage, maxHeapSize);
  
  // 记录到历史
  memoryHistory.push({
    processId,
    name,
    ...memUsage,
    ...threshold,
    timestamp: Date.now()
  });

  // 限制历史记录大小
  if (memoryHistory.length > maxHistorySize) {
    memoryHistory.shift();
  }

  // 输出内存使用情况
  const memInfo = {
    RSS: `${formatMemory(memUsage.rss)} MB`,
    Heap: `${formatMemory(memUsage.heapUsed)}/${formatMemory(memUsage.heapTotal)} MB`,
    External: `${formatMemory(memUsage.external)} MB`,
    Usage: `${(threshold.usagePercent * 100).toFixed(1)}%`
  };

  if (threshold.isCritical) {
    logger.error(`[MemoryMonitor] ⚠️  严重警告: ${name} 内存使用 ${(threshold.usagePercent * 100).toFixed(1)}%`, memInfo);
    if (onCritical) {
      onCritical({ processId, name, memUsage, threshold });
    }
  } else if (threshold.isWarning) {
    logger.warn(`[MemoryMonitor] ⚠️  警告: ${name} 内存使用 ${(threshold.usagePercent * 100).toFixed(1)}%`, memInfo);
    if (onWarning) {
      onWarning({ processId, name, memUsage, threshold });
    }
  } else {
    logger.debug(`[MemoryMonitor] ${name}:`, memInfo);
  }

  return { memUsage, threshold };
}

/**
 * 启动内存监控
 * @param {object} options - 监控选项
 * @param {number} options.interval - 监控间隔（毫秒），默认 5000
 * @param {number} options.maxHeapSize - 最大堆内存大小（字节），默认 4GB
 * @param {Function} options.onWarning - 警告回调
 * @param {Function} options.onCritical - 严重警告回调
 * @param {Array} options.processes - 要监控的进程列表 [{id, process, name, maxHeapSize}]
 */
export function startMonitoring(options = {}) {
  const {
    interval = DEFAULT_INTERVAL,
    maxHeapSize = 4096 * 1024 * 1024,
    onWarning = null,
    onCritical = null,
    processes = []
  } = options;

  // 如果已经在监控，先停止
  if (monitoringInterval) {
    stopMonitoring();
  }

  // 添加主进程到监控列表
  if (!monitoringProcesses.has('main')) {
    monitoringProcesses.set('main', {
      id: 'main',
      process: global.process,
      name: '主进程',
      maxHeapSize,
      onWarning,
      onCritical
    });
  }

  // 添加其他进程到监控列表
  for (const proc of processes) {
    if (proc.id && proc.process) {
      monitoringProcesses.set(proc.id, {
        id: proc.id,
        process: proc.process,
        name: proc.name || proc.id,
        maxHeapSize: proc.maxHeapSize || maxHeapSize,
        onWarning: proc.onWarning || onWarning,
        onCritical: proc.onCritical || onCritical
      });
    }
  }

  logger.info(`[MemoryMonitor] 启动内存监控，间隔 ${interval}ms，监控 ${monitoringProcesses.size} 个进程`);

  // 立即执行一次监控
  performMonitoring();

  // 设置定时监控
  monitoringInterval = setInterval(() => {
    performMonitoring();
  }, interval);

  return {
    stop: stopMonitoring,
    getHistory: () => [...memoryHistory],
    addProcess: (proc) => {
      if (proc.id && proc.process) {
        monitoringProcesses.set(proc.id, {
          id: proc.id,
          process: proc.process,
          name: proc.name || proc.id,
          maxHeapSize: proc.maxHeapSize || maxHeapSize,
          onWarning: proc.onWarning || onWarning,
          onCritical: proc.onCritical || onCritical
        });
      }
    },
    removeProcess: (processId) => {
      monitoringProcesses.delete(processId);
    }
  };
}

/**
 * 执行一次监控
 */
function performMonitoring() {
  for (const [processId, procInfo] of monitoringProcesses.entries()) {
    try {
      // 检查进程是否还存在
      if (procInfo.process.killed || (procInfo.process.exitCode !== null && procInfo.process.exitCode !== undefined)) {
        monitoringProcesses.delete(processId);
        continue;
      }

      monitorProcess(processId, procInfo.process, {
        name: procInfo.name,
        maxHeapSize: procInfo.maxHeapSize,
        onWarning: procInfo.onWarning,
        onCritical: procInfo.onCritical
      });
    } catch (error) {
      logger.warn(`[MemoryMonitor] 监控进程 ${procInfo.name} 失败:`, error.message);
    }
  }
}

/**
 * 停止内存监控
 */
export function stopMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    logger.info('[MemoryMonitor] 内存监控已停止');
  }
  monitoringProcesses.clear();
  memoryHistory = [];
}

/**
 * 获取内存使用报告
 */
export function getMemoryReport() {
  const current = memoryHistory[memoryHistory.length - 1];
  if (!current) {
    return null;
  }

  // 计算趋势（最近 10 条记录的平均增长率）
  const recentHistory = memoryHistory.slice(-10);
  if (recentHistory.length < 2) {
    return {
      current,
      trend: 'insufficient_data'
    };
  }

  const first = recentHistory[0];
  const last = recentHistory[recentHistory.length - 1];
  const timeDiff = last.timestamp - first.timestamp;
  const heapDiff = last.heapUsed - first.heapUsed;
  const growthRate = timeDiff > 0 ? (heapDiff / timeDiff) * 1000 : 0; // 字节/秒

  let trend = 'stable';
  if (growthRate > 1024 * 1024) { // 超过 1MB/秒
    trend = 'growing_fast';
  } else if (growthRate > 0) {
    trend = 'growing';
  } else if (growthRate < -1024 * 1024) {
    trend = 'decreasing_fast';
  } else if (growthRate < 0) {
    trend = 'decreasing';
  }

  return {
    current,
    trend,
    growthRate: formatMemory(Math.abs(growthRate)) + ' MB/s',
    history: recentHistory
  };
}

/**
 * 导出内存使用历史为 CSV
 */
export function exportHistoryToCSV() {
  if (memoryHistory.length === 0) {
    return '';
  }

  const headers = ['timestamp', 'processId', 'name', 'rss_mb', 'heapUsed_mb', 'heapTotal_mb', 'external_mb', 'usage_percent'];
  const rows = memoryHistory.map(record => [
    new Date(record.timestamp).toISOString(),
    record.processId,
    record.name,
    formatMemory(record.rss),
    formatMemory(record.heapUsed),
    formatMemory(record.heapTotal),
    formatMemory(record.external),
    (record.usagePercent * 100).toFixed(2)
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
