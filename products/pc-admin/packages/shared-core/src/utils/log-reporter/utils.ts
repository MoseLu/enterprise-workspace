/**
 * 日志上报工具函数
 */

import type { LogLevel, LogLevelUpper, MicroAppInfo, LogEntry, ServerLogEntry } from './types';
import { getCurrentAppId } from '../env-info';
import { getAllApps } from '../../configs/app-scanner';

/**
 * 从路由路径匹配模块配置，获取模块名称
 * 通过扫描模块配置文件，根据路径匹配找到对应的模块
 */
function getModuleNameFromPath(path?: string): string | null {
  if (typeof window === 'undefined' || !path) {
    return null;
  }

  try {
    // 尝试从全局获取路由到模块的映射（如果路由扫描器已经建立）
    const win = window as any;
    if (win.__BTC_ROUTE_MODULE_MAP__) {
      const routeMap = win.__BTC_ROUTE_MODULE_MAP__;
      // 尝试精确匹配
      if (routeMap[path]) {
        return routeMap[path];
      }
      // 尝试前缀匹配（找到最长的匹配路径）
      let bestMatch: { path: string; module: string } | null = null;
      for (const [routePath, moduleName] of Object.entries(routeMap)) {
        if (path.startsWith(routePath)) {
          if (!bestMatch || routePath.length > bestMatch.path.length) {
            bestMatch = { path: routePath, module: moduleName as string };
          }
        }
      }
      if (bestMatch) {
        return bestMatch.module;
      }
    }

    // 如果全局映射不存在，尝试从路径推断（兜底方案）
    // 移除开头的斜杠
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    const segments = normalizedPath.split('/').filter(Boolean);
    
    if (segments.length === 0) {
      return null;
    }

    // 检查是否是主应用的路由（没有应用前缀，直接是模块路径）
    // 主应用的路由：/overview, /todo, /profile, /log-reporter-test 等
    // 这些路由都在"工作台"（dashboard）一级菜单下，但模块名称是路径本身
    const mainAppRoutes = ['overview', 'todo', 'profile', 'log-reporter-test'];
    if (segments.length === 1 && mainAppRoutes.includes(segments[0])) {
      // 主应用的路由，模块名称就是路径本身
      return segments[0];
    }

    // 第一个段是应用名称（admin, system, logistics等），第二个段通常是模块名称
    // 例如：/admin/access/user-manage -> segments = ['admin', 'access', 'user-manage']
    // 模块名称是 'access'
    if (segments.length >= 2) {
      return segments[1];
    }
    
    // 如果只有一个段，可能是系统应用的路径，例如：/log-reporter-test
    // 这种情况下，模块名称就是路径本身
    if (segments.length === 1) {
      const firstSegment = segments[0];
      // 排除一些特殊路径
      if (firstSegment !== 'login' && firstSegment !== 'profile' && firstSegment !== '404') {
        return firstSegment;
      }
    }
  } catch (error) {
    // 静默失败，返回 null
  }
  
  return null;
}

/**
 * 获取当前模块名称（从路由路径匹配模块配置）
 */
function getCurrentModuleName(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // 获取当前路由路径
  const path = window.location.pathname;
  return getModuleNameFromPath(path);
}

/**
 * 将小写日志级别转换为大写
 */
export function toLogLevelUpper(level: LogLevel): LogLevelUpper {
  return level.toUpperCase() as LogLevelUpper;
}

/**
 * 获取完整应用ID（如 "btc-shopflow-admin-app"）
 */
export function getFullAppId(appName: string): string {
  // 如果已经是完整格式，直接返回
  if (appName.includes('btc-shopflow-') && appName.endsWith('-app')) {
    return appName;
  }
  
  // 否则构建完整格式
  return `btc-shopflow-${appName}${appName.endsWith('-app') ? '' : '-app'}`;
}

/**
 * 从完整应用ID提取简化应用名称（如从 "btc-shopflow-admin-app" 提取 "admin"）
 */
export function getSimpleAppName(fullAppId: string): string {
  // 移除 "btc-shopflow-" 前缀
  let appName = fullAppId.replace(/^btc-shopflow-/, '');
  // 移除 "-app" 后缀
  appName = appName.replace(/-app$/, '');
  return appName;
}

/**
 * 获取微前端应用信息
 */
export function getMicroAppInfo(appName?: string): MicroAppInfo {
  const win = typeof window !== 'undefined' ? (window as any) : null;
  
  // 确定应用类型
  let microAppType: 'main' | 'sub' | 'layout' = 'sub';
  if (win?.__POWERED_BY_QIANKUN__) {
    // 在 qiankun 环境中，判断是主应用还是子应用
    const currentAppId = getCurrentAppId();
    if (currentAppId === 'main' || currentAppId === 'system') {
      microAppType = 'main';
    } else {
      microAppType = 'sub';
    }
  } else {
    // 不在 qiankun 环境中，可能是独立运行的主应用或 layout 应用
    const currentAppId = getCurrentAppId();
    if (currentAppId === 'layout') {
      microAppType = 'layout';
    } else if (currentAppId === 'main' || currentAppId === 'system') {
      microAppType = 'main';
    }
  }
  
  // 获取应用名称（从 appName 参数或环境信息）
  let microAppName = appName || getCurrentAppId() || 'unknown';
  // 确保格式为 "xxx-app"
  if (!microAppName.endsWith('-app')) {
    microAppName = `${microAppName}-app`;
  }
  
  // 获取实例ID（如果存在）
  let microAppInstanceId: string | undefined;
  if (win) {
    microAppInstanceId = win.__QIANKUN_APP_INSTANCE_ID__ || 
                        win.__APP_INSTANCE_ID__ ||
                        `${microAppName}-instance-${Date.now()}`;
  }
  
  // 获取生命周期状态（默认为 mount）
  const microAppLifecycle: 'mount' | 'unmount' | 'update' = 'mount';
  
  return {
    microAppType,
    microAppName,
    microAppInstanceId,
    microAppLifecycle,
  };
}

/**
 * 将时间戳（毫秒）转换为 ISO 8601 格式
 */
export function toISOString(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * 将内部日志条目转换为服务器格式
 */
export function convertToServerLogEntry(entry: LogEntry): ServerLogEntry {
  // 获取微前端信息（如果未提供则自动检测）
  const microApp = entry.microApp || getMicroAppInfo(entry.appName);
  
  // 构建扩展信息
  const extensions: Record<string, any> = {};
  
  // 将 context 合并到 extensions
  if (entry.context) {
    Object.assign(extensions, entry.context);
  }
  
  // 将其他扩展字段合并到 extensions（排除已处理的字段）
  const excludeKeys = ['level', 'message', 'timestamp', 'appName', 'loggerName', 'microApp', 'context', 'error', 'data', 'extensions'];
  for (const key in entry) {
    if (!excludeKeys.includes(key) && entry[key] !== undefined) {
      extensions[key] = entry[key];
    }
  }
  
  // 如果已有 extensions，合并它们
  if (entry.extensions) {
    Object.assign(extensions, entry.extensions);
  }
  
  // 构建 data 字段
  let data: any = null;
  if (entry.data !== undefined) {
    data = entry.data;
  } else if (entry.error) {
    // 如果有错误信息，将其作为 data
    data = entry.error;
  }
  
  // 生成 loggerName（从模块配置获取，而不是用户提供或使用 appName）
  // 优先从路由路径提取模块名称
  let loggerName: string;
  if (entry.loggerName) {
    // 如果用户明确提供了 loggerName，使用它（向后兼容）
    loggerName = entry.loggerName;
  } else {
    // 从路由路径提取模块名称
    const moduleName = getCurrentModuleName();
    if (moduleName) {
      loggerName = moduleName;
    } else {
      // 如果无法从路径提取，使用 appName 作为兜底
      loggerName = entry.appName || 'unknown';
    }
  }
  
  return {
    timestamp: toISOString(entry.timestamp),
    logLevel: toLogLevelUpper(entry.level),
    loggerName,
    microApp,
    message: entry.message,
    data,
    ...(Object.keys(extensions).length > 0 && { extensions }),
  };
}

/**
 * 检查日志条目大小（估算，不超过2KB）
 */
export function estimateLogSize(entry: ServerLogEntry): number {
  try {
    const json = JSON.stringify(entry);
    // 使用 UTF-8 编码，每个字符最多 4 字节（对于 emoji 等），但通常 ASCII 字符是 1 字节
    // 这里使用一个保守的估算：字符串长度 * 2（假设平均每个字符 2 字节）
    return json.length * 2;
  } catch {
    // 如果序列化失败，返回一个较大的值以确保被过滤
    return 5000;
  }
}

/**
 * 计算日志条目的hash值（用于去重和累加）
 * 基于关键字段：message + level + eventType + route
 */
export function calculateLogHash(entry: LogEntry): string {
  try {
    const key = [
      entry.message || '',
      entry.level || '',
      entry.extensions?.eventType || '',
      entry.extensions?.route?.to || '',
      entry.extensions?.route?.from || '',
      entry.extensions?.userAction?.actionType || '',
      entry.extensions?.business?.eventName || '',
    ].join('|');
    
    // 简单的hash函数（基于字符串长度和字符码）
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    
    return hash.toString(36);
  } catch {
    // 如果计算失败，使用时间戳作为fallback
    return Date.now().toString(36);
  }
}

/**
 * 生成批次号ID
 * 格式：batch-{timestamp}-{appId}
 */
export function generateBatchId(appId: string): string {
  const timestamp = Date.now();
  const shortAppId = appId.replace(/btc-shopflow-|-app/g, '');
  return `batch-${timestamp}-${shortAppId}`;
}

/**
 * 判断两个日志条目是否相同（用于去重）
 */
export function isLogEntryEqual(entry1: LogEntry, entry2: LogEntry): boolean {
  return calculateLogHash(entry1) === calculateLogHash(entry2);
}

/**
 * 日志筛选选项类型
 */
export interface LogFilterOptions {
  appIds: Array<{ label: string; value: string }>;
  logLevels: Array<{ label: string; value: string }>;
  microAppTypes: Array<{ label: string; value: string }>;
  microAppNames: Array<{ label: string; value: string }>;
  microAppLifecycles: Array<{ label: string; value: string }>;
}

/**
 * 获取日志筛选选项
 * 从日志中心统一提供所有下拉菜单选项，避免硬编码
 * @returns 日志筛选选项对象
 */
export function getLogFilterOptions(): LogFilterOptions {
  // 获取所有应用
  const apps = getAllApps();

  // appId 格式：btc-shopflow-{appId}-app（与日志上报时的格式一致）
  const appIds = apps
    .filter(app => app.enabled !== false)
    .map(app => ({
      label: app.name || app.id,
      value: getFullAppId(app.id),
    }));

  // 日志级别选项（从 LogLevelUpper 类型定义）
  // 注意：LogLevelUpper 类型只包含 DEBUG, INFO, WARN, ERROR, FATAL，不包含 TRACE
  const logLevels: Array<{ label: string; value: string }> = [
    { label: '错误', value: 'ERROR' },
    { label: '警告', value: 'WARN' },
    { label: '信息', value: 'INFO' },
    { label: '调试', value: 'DEBUG' },
    { label: '致命', value: 'FATAL' },
    { label: '跟踪', value: 'TRACE' },
  ];

  // 微应用类型选项（从 MicroAppInfo.microAppType 类型定义）
  const microAppTypes: Array<{ label: string; value: 'main' | 'sub' | 'layout' }> = [
    { label: '主应用', value: 'main' },
    { label: '子应用', value: 'sub' },
    { label: '布局应用', value: 'layout' },
  ];

  // 微应用名称选项（从应用列表获取，格式为 "xxx-app"）
  const microAppNames = apps
    .filter(app => app.enabled !== false)
    .map(app => ({
      label: app.name || app.id,
      value: `${app.id}-app`,
    }));

  // 微应用生命周期选项（从 MicroAppInfo.microAppLifecycle 类型定义）
  const microAppLifecycles: Array<{ label: string; value: 'mount' | 'unmount' | 'update' }> = [
    { label: '挂载', value: 'mount' },
    { label: '卸载', value: 'unmount' },
    { label: '更新', value: 'update' },
  ];

  return {
    appIds,
    logLevels,
    microAppTypes,
    microAppNames,
    microAppLifecycles,
  };
}
