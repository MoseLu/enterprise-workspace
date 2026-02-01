/**
 * 错误监控增强
 * 添加 API 错误详情、路由错误、性能错误等
 */

import type { ErrorInfo, RouteInfo, ApiInfo, ResourceInfo } from './types';
import { getCollector } from './collector';
import { getConfig } from './config';

/**
 * 上报运行时错误（增强版）
 */
export function reportRuntimeError(
  error: Error,
  route?: RouteInfo
): void {
  const config = getConfig();
  if (!config.enableErrorTracking) {
    return;
  }

  const collector = getCollector();
  collector.collect({
    eventType: 'error:runtime',
    data: {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        errorType: 'runtime',
      },
      route,
    },
  });
}

/**
 * 上报 API 错误（增强版）
 */
export function reportApiError(
  api: ApiInfo,
  error: Error | string,
  route?: RouteInfo
): void {
  const config = getConfig();
  if (!config.enableErrorTracking) {
    return;
  }

  const collector = getCollector();
  collector.collect({
    eventType: 'error:api',
    data: {
      api,
      error: {
        name: error instanceof Error ? error.name : 'ApiError',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        errorType: 'api',
        errorCode: api.statusCode ? `HTTP_${api.statusCode}` : 'NETWORK_ERROR',
      },
      route,
    },
  });
}

/**
 * 上报路由错误
 */
export function reportRouteError(
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

/**
 * 上报资源错误
 */
export function reportResourceError(
  resource: ResourceInfo,
  error: Error | string
): void {
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
 * 上报性能错误
 */
export function reportPerformanceError(
  error: Error | string,
  route?: RouteInfo
): void {
  const config = getConfig();
  if (!config.enableErrorTracking) {
    return;
  }

  const collector = getCollector();
  collector.collect({
    eventType: 'error:performance',
    data: {
      error: {
        name: error instanceof Error ? error.name : 'PerformanceError',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        errorType: 'performance',
      },
      route,
    },
  });
}
