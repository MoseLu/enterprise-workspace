/**
 * API 性能监控
 * 监控 API 请求/响应时间、成功率、错误率
 */

import type { ApiInfo } from './types';
import { getCollector } from './collector';
import { getConfig } from './config';

/**
 * API 请求时间戳记录
 */
const apiRequestTimestamps: Map<string, number> = new Map();

/**
 * 生成 API 请求的唯一键
 */
function generateApiKey(method: string, endpoint: string, requestId?: string): string {
  return requestId || `${method}:${endpoint}:${Date.now()}`;
}

/**
 * 记录 API 请求开始时间
 */
function recordApiRequestStart(apiKey: string): void {
  apiRequestTimestamps.set(apiKey, performance.now());
}

/**
 * 记录 API 请求结束时间并返回持续时间
 */
function recordApiRequestEnd(apiKey: string): number | null {
  const startTime = apiRequestTimestamps.get(apiKey);
  if (startTime) {
    apiRequestTimestamps.delete(apiKey);
    return performance.now() - startTime;
  }
  return null;
}

/**
 * 上报 API 请求事件
 */
function reportApiRequest(api: ApiInfo): void {
  const config = getConfig();
  if (!config.enableAPM) {
    return;
  }

  const collector = getCollector();
  collector.collect({
    eventType: 'api:request',
    data: {
      api,
    },
  });
}

/**
 * 上报 API 响应事件
 */
function reportApiResponse(api: ApiInfo, success: boolean): void {
  const config = getConfig();
  if (!config.enableAPM) {
    return;
  }

  const collector = getCollector();
  collector.collect({
    eventType: 'api:response',
    data: {
      api,
      context: {
        success,
      },
    },
  });
}

/**
 * 上报 API 错误事件
 */
function reportApiError(api: ApiInfo, error: Error | string): void {
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
    },
  });
}

/**
 * 监控 API 请求开始
 * @returns 请求ID，用于后续关联响应
 */
export function trackAPIRequest(
  url: string,
  method: string = 'GET',
  requestId?: string
): string {
  const apiKey = generateApiKey(method, url, requestId);
  recordApiRequestStart(apiKey);

  const apiInfo: ApiInfo = {
    url,
    endpoint: extractEndpoint(url),
    method: method.toUpperCase(),
  };

  reportApiRequest(apiInfo);

  return apiKey;
}

/**
 * 监控 API 响应
 */
export function trackAPIResponse(
  url: string,
  method: string = 'GET',
  statusCode: number,
  responseTime?: number,
  responseSize?: number,
  requestSize?: number,
  requestId?: string
): void {
  const apiKey = generateApiKey(method, url, requestId);
  const duration = responseTime || recordApiRequestEnd(apiKey);

  const apiInfo: ApiInfo = {
    url,
    endpoint: extractEndpoint(url),
    method: method.toUpperCase(),
    statusCode,
    responseTime: duration || undefined,
    responseSize,
    requestSize,
  };

  const success = statusCode >= 200 && statusCode < 400;
  reportApiResponse(apiInfo, success);

  // 如果是错误状态码，也上报错误事件
  if (!success) {
    reportApiError(apiInfo, new Error(`HTTP ${statusCode}`));
  }
}

/**
 * 监控 API 错误
 */
export function trackAPIError(
  url: string,
  method: string = 'GET',
  error: Error | string,
  statusCode?: number,
  requestId?: string
): void {
  const apiKey = generateApiKey(method, url, requestId);
  const duration = recordApiRequestEnd(apiKey);

  const apiInfo: ApiInfo = {
    url,
    endpoint: extractEndpoint(url),
    method: method.toUpperCase(),
    statusCode,
    responseTime: duration || undefined,
  };

  reportApiError(apiInfo, error);
}

/**
 * 从完整 URL 中提取端点（相对路径）
 */
function extractEndpoint(url: string): string {
  try {
    // 如果是相对路径，直接返回
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return url.split('?')[0]; // 移除查询参数
    }

    // 如果是完整 URL，提取路径部分
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    // 如果解析失败，返回原始 URL
    return url;
  }
}
