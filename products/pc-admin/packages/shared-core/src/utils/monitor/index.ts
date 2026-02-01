/**
 * 监控系统统一导出
 * 提供 initMonitor 等公共 API
 */

import { initConfig, getConfig, updateConfig, resetConfig, getOrCreateSessionId } from './config';
import { MonitorCollector, getCollector, setCollector, destroyCollector } from './collector';
import { initPerformanceMonitor, destroyPerformanceMonitor } from './performance-monitor';
import { initResourceMonitor, destroyResourceMonitor } from './resource-monitor';
import { initUserBehaviorMonitor, destroyUserBehaviorMonitor } from './user-behavior-monitor';
import { initSystemMonitor, destroySystemMonitor } from './system-monitor';
import type { MonitorConfig } from './config';

/**
 * 初始化监控系统
 */
export function initMonitor(config: MonitorConfig): void {
  // 1. 初始化配置
  const finalConfig = initConfig(config);

  // 2. 创建新的收集器（使用最新配置）
  // 注意：每个应用应该有自己独立的收集器，使用最新配置创建
  const collector = new MonitorCollector(
    finalConfig.appName,
    finalConfig.sessionId,
    finalConfig.userId
  );
  setCollector(collector);

  // 3. 根据配置初始化各个监控模块

  if (finalConfig.enablePerformance) {
    initPerformanceMonitor();
  }

  if (finalConfig.enableResourceMonitoring) {
    initResourceMonitor();
  }

  if (finalConfig.enableUserBehavior) {
    initUserBehaviorMonitor();
  }

  if (finalConfig.enableSystemMonitoring) {
    initSystemMonitor();
  }
}

/**
 * 销毁监控系统
 */
export function destroyMonitor(): void {
  destroyPerformanceMonitor();
  destroyResourceMonitor();
  destroyUserBehaviorMonitor();
  destroySystemMonitor();
  destroyCollector();
  resetConfig();
}

/**
 * 更新监控配置
 */
export function updateMonitorConfig(updates: Partial<MonitorConfig>): void {
  updateConfig(updates);
}

/**
 * 导出所有监控相关的 API
 */

// 生命周期监控
export {
  trackBootstrapStart,
  trackBootstrapEnd,
  trackMountStart,
  trackMountEnd,
  trackUnmountStart,
  trackUnmountEnd,
  trackUpdate,
  wrapBootstrap,
  wrapMount,
  wrapUnmount,
  wrapUpdate,
} from './lifecycle-monitor';

// 路由监控
export {
  trackRouteNavigationStart,
  trackRouteNavigationEnd,
  trackRouteNavigation,
  trackRouteError,
} from './route-monitor';

// API 监控
export {
  trackAPIRequest,
  trackAPIResponse,
  trackAPIError,
} from './api-monitor';

// 性能监控
export {
  initPerformanceMonitor,
  reportPerformanceMetrics,
  destroyPerformanceMonitor,
} from './performance-monitor';

// 资源监控
export {
  initResourceMonitor,
  reportResourcePerformanceManually as reportResourcePerformance,
  reportResourceErrorManually as reportResourceError,
  destroyResourceMonitor,
} from './resource-monitor';

// 错误监控增强
export {
  reportRuntimeError,
  reportApiError,
  reportRouteError,
  reportResourceError as reportResourceErrorEnhanced,
  reportPerformanceError,
} from './error-monitor-enhance';

// 用户行为监控
export {
  initUserBehaviorMonitor,
  trackUserClick,
  trackFormSubmit,
  trackUserAction,
  destroyUserBehaviorMonitor,
} from './user-behavior-monitor';

// 业务监控
export {
  trackBusinessEvent,
  trackBusinessMetric,
} from './business-monitor';

// 系统监控
export {
  initSystemMonitor,
  reportSystemMemory,
  reportSystemNetwork,
  reportSystemDevice,
  destroySystemMonitor,
} from './system-monitor';

// 类型导出
export type {
  MonitorEvent,
  MonitorEventType,
  AppLifecycleEventType,
  UserActionType,
  ResourceType,
  ErrorType,
  DeviceType,
  PerformanceMetrics,
  RouteInfo,
  ApiInfo,
  ErrorInfo,
  ResourceInfo,
  UserActionInfo,
  BusinessInfo,
  SystemInfo,
} from './types';

export type { MonitorConfig } from './config';
