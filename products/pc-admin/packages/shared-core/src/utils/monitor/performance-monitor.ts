/**
 * 页面性能监控
 * 使用 Performance Observer 和 Navigation Timing API 收集 Web Vitals 指标
 */

import type { PerformanceMetrics } from './types';
import { getCollector } from './collector';
import { getConfig } from './config';

/**
 * 性能观察器实例
 */
let performanceObserver: PerformanceObserver | null = null;
let navigationObserver: PerformanceObserver | null = null;
let resourceObserver: PerformanceObserver | null = null;

/**
 * 是否已初始化
 */
let initialized = false;

/**
 * 获取 Navigation Timing 指标
 */
function getNavigationTimingMetrics(): Partial<PerformanceMetrics> {
  if (typeof window === 'undefined' || !window.performance) {
    return {};
  }

  const timing = window.performance.timing;
  const navigation = window.performance.navigation;

  // 计算各种时间指标
  const metrics: Partial<PerformanceMetrics> = {};

  // TTFB (Time to First Byte)
  if (timing.responseStart > 0 && timing.requestStart > 0) {
    metrics.ttfb = timing.responseStart - timing.requestStart;
  }

  // DOM Ready
  if (timing.domContentLoadedEventEnd > 0 && timing.navigationStart > 0) {
    metrics.domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
  }

  // Load Complete
  if (timing.loadEventEnd > 0 && timing.navigationStart > 0) {
    metrics.loadComplete = timing.loadEventEnd - timing.navigationStart;
  }

  // Duration (总加载时间)
  if (timing.loadEventEnd > 0 && timing.navigationStart > 0) {
    metrics.duration = timing.loadEventEnd - timing.navigationStart;
  }

  return metrics;
}

/**
 * 上报页面性能指标
 */
function reportPagePerformance(metrics: PerformanceMetrics, routePath?: string): void {
  const config = getConfig();
  if (!config.enablePerformance) {
    return;
  }

  const collector = getCollector();
  collector.collect({
    eventType: 'performance:page',
    data: {
      performance: metrics,
      route: routePath ? { routePath } : undefined,
    },
  });
}

/**
 * 初始化 Performance Observer（监听 Web Vitals）
 */
function initPerformanceObserver(): void {
  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return;
  }

  try {
    // 监听 Paint 指标（FCP, LCP）
    performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint') {
          const paintEntry = entry as PerformancePaintTiming;
          if (paintEntry.name === 'first-contentful-paint') {
            // FCP
            const metrics: PerformanceMetrics = {
              fcp: paintEntry.startTime,
            };
            reportPagePerformance(metrics);
          }
        } else if (entry.entryType === 'largest-contentful-paint') {
          // LCP
          const lcpEntry = entry as any;
          const metrics: PerformanceMetrics = {
            lcp: lcpEntry.startTime,
          };
          reportPagePerformance(metrics);
        } else if (entry.entryType === 'first-input') {
          // FID
          const fidEntry = entry as any;
          const metrics: PerformanceMetrics = {
            fid: fidEntry.processingStart - fidEntry.startTime,
          };
          reportPagePerformance(metrics);
        } else if (entry.entryType === 'layout-shift') {
          // CLS (需要累积计算)
          const clsEntry = entry as any;
          if (!clsEntry.hadRecentInput) {
            // 累积 CLS 值（这里简化处理，实际应该累积所有 layout-shift）
            const metrics: PerformanceMetrics = {
              cls: clsEntry.value,
            };
            reportPagePerformance(metrics);
          }
        }
      }
    });

    // 观察 Paint 和 Largest Contentful Paint
    performanceObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
  } catch (error) {
    // 某些浏览器可能不支持某些 entryTypes
    console.warn('[PerformanceMonitor] PerformanceObserver 初始化失败:', error);
  }
}

/**
 * 初始化 Navigation Timing 监控
 */
function initNavigationTiming(): void {
  if (typeof window === 'undefined' || !window.performance) {
    return;
  }

  // 等待页面加载完成
  if (document.readyState === 'complete') {
    reportNavigationTiming();
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => {
        reportNavigationTiming();
      }, 0);
    });
  }
}

/**
 * 上报 Navigation Timing 指标
 */
function reportNavigationTiming(): void {
  const metrics = getNavigationTimingMetrics();
  if (Object.keys(metrics).length > 0) {
    reportPagePerformance(metrics as PerformanceMetrics);
  }
}

/**
 * 初始化性能监控
 */
export function initPerformanceMonitor(): void {
  if (initialized) {
    return;
  }

  const config = getConfig();
  if (!config.enablePerformance) {
    return;
  }

  // 初始化 Performance Observer
  initPerformanceObserver();

  // 初始化 Navigation Timing
  initNavigationTiming();

  initialized = true;
}

/**
 * 手动上报页面性能指标
 */
export function reportPerformanceMetrics(metrics: PerformanceMetrics, routePath?: string): void {
  reportPagePerformance(metrics, routePath);
}

/**
 * 销毁性能监控
 */
export function destroyPerformanceMonitor(): void {
  if (performanceObserver) {
    performanceObserver.disconnect();
    performanceObserver = null;
  }
  if (navigationObserver) {
    navigationObserver.disconnect();
    navigationObserver = null;
  }
  if (resourceObserver) {
    resourceObserver.disconnect();
    resourceObserver = null;
  }
  initialized = false;
}
