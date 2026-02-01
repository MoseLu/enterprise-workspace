/**
 * 路由性能监控
 * 监控路由切换时间、组件加载时间等
 */

import type { RouteInfo } from './types';
import { getCollector } from './collector';
import { getConfig } from './config';

/**
 * 路由导航时间戳记录
 */
const routeNavigationTimestamps: Map<string, number> = new Map();

/**
 * 记录路由导航开始时间
 */
function recordRouteNavigationStart(routeKey: string): void {
  routeNavigationTimestamps.set(routeKey, performance.now());
}

/**
 * 记录路由导航结束时间并返回持续时间
 */
function recordRouteNavigationEnd(routeKey: string): number | null {
  const startTime = routeNavigationTimestamps.get(routeKey);
  if (startTime) {
    routeNavigationTimestamps.delete(routeKey);
    return performance.now() - startTime;
  }
  return null;
}

/**
 * 生成路由导航的唯一键
 */
function generateRouteKey(from: string, to: string): string {
  return `${from}->${to}`;
}

/**
 * 上报路由导航事件
 */
function reportRouteNavigation(
  route: RouteInfo,
  duration?: number
): void {
  const config = getConfig();
  if (!config.enableAPM) {
    return;
  }

  const collector = getCollector();
  collector.collect({
    eventType: 'route:navigation',
    data: {
      route,
      performance: duration ? { duration } : undefined,
    },
  });
}

/**
 * 监控路由导航开始
 */
export function trackRouteNavigationStart(
  from: string,
  to: string
): void {
  const routeKey = generateRouteKey(from, to);
  recordRouteNavigationStart(routeKey);
}

/**
 * 监控路由导航结束
 */
export function trackRouteNavigationEnd(
  from: string,
  to: string,
  routeName?: string,
  routeParams?: Record<string, any>,
  routeQuery?: Record<string, any>
): void {
  const routeKey = generateRouteKey(from, to);
  const duration = recordRouteNavigationEnd(routeKey);

  const routeInfo: RouteInfo = {
    from,
    to,
    routeName,
    routePath: to,
    routeParams,
    routeQuery,
  };

  reportRouteNavigation(routeInfo, duration || undefined);
}

/**
 * 监控路由导航（完整信息）
 */
export function trackRouteNavigation(
  route: RouteInfo,
  duration?: number
): void {
  reportRouteNavigation(route, duration);
}

/**
 * 监控路由错误
 */
export function trackRouteError(
  route: RouteInfo,
  error: Error | string
): void {
  const config = getConfig();
  if (!config.enableErrorTracking) {
    return;
  }

  const collector = getCollector();
  collector.collect({
    eventType: 'error:route',
    data: {
      route,
      error: {
        name: error instanceof Error ? error.name : 'RouteError',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        errorType: 'route',
      },
    },
  });
}
