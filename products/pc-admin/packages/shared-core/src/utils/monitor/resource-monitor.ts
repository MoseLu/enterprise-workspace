/**
 * 资源监控
 * 使用 Resource Timing API 监控资源加载性能
 */

import type { ResourceInfo, ResourceType } from './types';
import { getCollector } from './collector';
import { getConfig } from './config';

/**
 * 资源观察器实例
 */
let resourceObserver: PerformanceObserver | null = null;

/**
 * 是否已初始化
 */
let initialized = false;

/**
 * 判断资源类型
 */
function getResourceType(url: string): ResourceType {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.endsWith('.js') || lowerUrl.includes('/js/')) {
    return 'script';
  }
  if (lowerUrl.endsWith('.css') || lowerUrl.includes('/css/')) {
    return 'stylesheet';
  }
  if (/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(lowerUrl)) {
    return 'image';
  }
  if (/\.(woff|woff2|ttf|otf|eot)$/i.test(lowerUrl)) {
    return 'font';
  }
  return 'other';
}

/**
 * 从 PerformanceResourceTiming 提取资源信息
 */
function extractResourceInfo(entry: PerformanceResourceTiming): ResourceInfo {
  return {
    type: getResourceType(entry.name),
    url: entry.name,
    size: entry.transferSize || 0,
    loadTime: entry.duration,
    dnsTime: entry.domainLookupEnd - entry.domainLookupStart,
    tcpTime: entry.connectEnd - entry.connectStart,
    sslTime: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
    requestTime: entry.responseStart > 0 && entry.requestStart > 0 ? entry.responseStart - entry.requestStart : 0,
  };
}

/**
 * 上报资源性能事件
 */
function reportResourcePerformance(resource: ResourceInfo): void {
  const config = getConfig();
  if (!config.enableResourceMonitoring) {
    return;
  }

  const collector = getCollector();
  collector.collect({
    eventType: 'performance:resource',
    data: {
      resource,
    },
  });
}

/**
 * 上报资源错误事件
 */
function reportResourceError(resource: ResourceInfo, error: Error | string): void {
  const config = getConfig();
  if (!config.enableErrorTracking) {
    return;
  }

  const collector = getCollector();
  collector.collect({
    eventType: 'error:resource',
    data: {
      resource,
      error: {
        name: error instanceof Error ? error.name : 'ResourceError',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        errorType: 'resource',
      },
    },
  });
}

/**
 * 初始化资源监控
 */
export function initResourceMonitor(): void {
  if (initialized) {
    return;
  }

  const config = getConfig();
  if (!config.enableResourceMonitoring) {
    return;
  }

  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return;
  }

  try {
    // 监听资源加载
    resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          const resourceInfo = extractResourceInfo(resourceEntry);
          
          // 只上报关键资源（JS、CSS）或加载时间较长的资源
          if (
            resourceInfo.type === 'script' ||
            resourceInfo.type === 'stylesheet' ||
            (resourceInfo.loadTime && resourceInfo.loadTime > 1000)
          ) {
            reportResourcePerformance(resourceInfo);
          }
        }
      }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });
  } catch (error) {
    console.warn('[ResourceMonitor] PerformanceObserver 初始化失败:', error);
  }

  // 监听资源加载错误
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      if (event.target && (event.target as HTMLElement).tagName) {
        const target = event.target as HTMLElement;
        const resourceInfo: ResourceInfo = {
          type: getResourceType(target.getAttribute('src') || target.getAttribute('href') || ''),
          url: target.getAttribute('src') || target.getAttribute('href') || '',
        };
        reportResourceError(resourceInfo, event.error || new Error('Resource load failed'));
      }
    }, true);
  }

  initialized = true;
}

/**
 * 手动上报资源性能
 */
export function reportResourcePerformanceManually(resource: ResourceInfo): void {
  reportResourcePerformance(resource);
}

/**
 * 手动上报资源错误
 */
export function reportResourceErrorManually(resource: ResourceInfo, error: Error | string): void {
  reportResourceError(resource, error);
}

/**
 * 销毁资源监控
 */
export function destroyResourceMonitor(): void {
  if (resourceObserver) {
    resourceObserver.disconnect();
    resourceObserver = null;
  }
  initialized = false;
}
