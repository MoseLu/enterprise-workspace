/**
 * 监控数据转换器
 * 将监控事件转换为 LogEntry 格式
 */

import type { LogEntry, LogLevel } from '../log-reporter/types';
import type {
  MonitorEvent,
  MonitorEventType,
  PerformanceMetrics,
  RouteInfo,
  ApiInfo,
  ErrorInfo,
  ResourceInfo,
  UserActionInfo,
  BusinessInfo,
  SystemInfo,
} from './types';

/**
 * 根据事件类型确定日志级别
 */
function getLogLevelFromEventType(eventType: MonitorEventType): LogLevel {
  if (eventType.startsWith('error:')) {
    return 'error';
  }
  if (eventType.startsWith('performance:') || eventType.startsWith('api:')) {
    return 'info';
  }
  if (eventType === 'app:lifecycle' || eventType === 'route:navigation') {
    return 'info';
  }
  if (eventType === 'user:action' || eventType === 'business:event') {
    return 'info';
  }
  if (eventType.startsWith('system:')) {
    return 'debug';
  }
  return 'info';
}

/**
 * 根据事件类型生成日志消息
 */
function generateMessage(eventType: MonitorEventType, data: MonitorEvent['data']): string {
  switch (eventType) {
    case 'app:lifecycle':
      return `应用生命周期: ${data.context?.lifecycleEvent || 'unknown'}`;
    case 'route:navigation':
      return `路由导航: ${data.route?.from || '/'} -> ${data.route?.to || '/'}`;
    case 'api:request':
      return `API 请求: ${data.api?.method || 'GET'} ${data.api?.endpoint || data.api?.url || 'unknown'}`;
    case 'api:response':
      return `API 响应: ${data.api?.method || 'GET'} ${data.api?.endpoint || data.api?.url || 'unknown'} ${data.api?.statusCode || ''}`;
    case 'performance:page':
      return `页面性能: FCP=${data.performance?.fcp || 'N/A'}ms, LCP=${data.performance?.lcp || 'N/A'}ms`;
    case 'performance:resource':
      return `资源性能: ${data.resource?.type || 'unknown'} ${data.resource?.url || 'unknown'}`;
    case 'error:runtime':
      return `运行时错误: ${data.error?.message || 'unknown'}`;
    case 'error:api':
      return `API 错误: ${data.api?.endpoint || 'unknown'} ${data.error?.message || 'unknown'}`;
    case 'error:route':
      return `路由错误: ${data.route?.routePath || 'unknown'} ${data.error?.message || 'unknown'}`;
    case 'error:resource':
      return `资源错误: ${data.resource?.url || 'unknown'} ${data.error?.message || 'unknown'}`;
    case 'error:performance':
      return `性能错误: ${data.error?.message || 'unknown'}`;
    case 'user:action':
      return `用户操作: ${data.userAction?.actionType || 'unknown'} ${data.userAction?.elementType || ''}`;
    case 'business:event':
      return `业务事件: ${data.business?.eventName || 'unknown'}`;
    case 'system:memory':
      return `系统内存: ${data.system?.memory?.heapUsed || 'N/A'}MB / ${data.system?.memory?.heapTotal || 'N/A'}MB`;
    case 'system:network':
      return `系统网络: ${data.system?.network?.effectiveType || 'unknown'}`;
    case 'system:device':
      return `系统设备: ${data.system?.device?.browser || 'unknown'} on ${data.system?.device?.os || 'unknown'}`;
    default:
      return `监控事件: ${eventType}`;
  }
}

/**
 * 构建扩展信息（extensions）
 */
function buildExtensions(event: MonitorEvent): Record<string, any> {
  const extensions: Record<string, any> = {
    eventType: event.eventType,
  };

  // 会话和用户信息
  if (event.sessionId) {
    extensions.sessionId = event.sessionId;
  }
  if (event.userId) {
    extensions.userId = event.userId;
  }

  // 性能指标
  if (event.data.performance) {
    extensions.performance = event.data.performance;
  }

  // 路由信息
  if (event.data.route) {
    extensions.route = event.data.route;
  }

  // API 信息
  if (event.data.api) {
    extensions.api = event.data.api;
  }

  // 错误信息
  if (event.data.error) {
    extensions.error = event.data.error;
  }

  // 资源信息
  if (event.data.resource) {
    extensions.resource = event.data.resource;
  }

  // 用户行为信息
  if (event.data.userAction) {
    extensions.userAction = event.data.userAction;
  }

  // 业务信息
  if (event.data.business) {
    extensions.business = event.data.business;
  }

  // 系统信息
  if (event.data.system) {
    extensions.system = event.data.system;
  }

  // 其他上下文信息
  if (event.data.context) {
    Object.assign(extensions, event.data.context);
  }

  // 合并外部扩展信息
  if (event.extensions) {
    Object.assign(extensions, event.extensions);
  }

  return extensions;
}

/**
 * 将监控事件转换为 LogEntry
 */
export function transformMonitorEventToLogEntry(event: MonitorEvent): LogEntry {
  const logLevel = getLogLevelFromEventType(event.eventType);
  const message = generateMessage(event.eventType, event.data);
  const extensions = buildExtensions(event);

  // 构建 data 字段（如果是错误事件，将错误信息放入 data）
  let data: any = undefined;
  if (event.data.error) {
    data = {
      name: event.data.error.name,
      message: event.data.error.message,
      stack: event.data.error.stack,
      ...event.data.error,
    };
  }

  // 确定 loggerName
  const loggerName = `monitor:${event.eventType.split(':')[0]}`;

  return {
    level: logLevel,
    message,
    timestamp: event.timestamp,
    appName: event.appName,
    loggerName,
    extensions,
    data,
  };
}

/**
 * 批量转换监控事件为 LogEntry
 */
export function transformMonitorEventsToLogEntries(events: MonitorEvent[]): LogEntry[] {
  return events.map(transformMonitorEventToLogEntry);
}
