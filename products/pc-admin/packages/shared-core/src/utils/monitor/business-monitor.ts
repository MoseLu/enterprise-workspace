/**
 * 业务指标监控
 * 提供业务事件和业务指标埋点 API
 */

import type { BusinessInfo, RouteInfo } from './types';
import { getCollector } from './collector';
import { getConfig } from './config';

/**
 * 获取当前路由路径
 */
function getCurrentRoutePath(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.location.pathname;
}

/**
 * 上报业务事件
 */
function reportBusinessEvent(
  business: BusinessInfo,
  route?: RouteInfo
): void {
  const config = getConfig();
  if (!config.enableBusinessTracking) {
    return;
  }

  const collector = getCollector();
  collector.collect({
    eventType: 'business:event',
    data: {
      business,
      route,
    },
  });
}

/**
 * 业务事件埋点
 * @param eventName 事件名称（如 "order:create", "order:pay"）
 * @param data 业务数据
 * @param route 路由信息（可选，如果不提供会自动获取当前路由）
 */
export function trackBusinessEvent(
  eventName: string,
  data?: Record<string, any>,
  route?: RouteInfo
): void {
  const business: BusinessInfo = {
    eventName,
    eventCategory: eventName.split(':')[0] || 'unknown',
    eventValue: data?.value,
    eventTags: data?.tags,
    ...data,
  };

  const routeInfo: RouteInfo = route || {
    routePath: getCurrentRoutePath(),
  };

  reportBusinessEvent(business, routeInfo);
}

/**
 * 业务指标统计
 * @param metricName 指标名称
 * @param value 指标值
 * @param tags 标签（可选）
 * @param route 路由信息（可选）
 */
export function trackBusinessMetric(
  metricName: string,
  value: number,
  tags?: Record<string, string>,
  route?: RouteInfo
): void {
  const business: BusinessInfo = {
    eventName: `metric:${metricName}`,
    eventCategory: 'metric',
    eventValue: value,
    eventTags: tags,
  };

  const routeInfo: RouteInfo = route || {
    routePath: getCurrentRoutePath(),
  };

  reportBusinessEvent(business, routeInfo);
}
