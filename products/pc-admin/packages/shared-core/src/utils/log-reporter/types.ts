/**
 * 日志上报中心类型定义
 */

/**
 * 日志级别（小写，用于内部使用）
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * 日志级别（大写，用于上报）
 */
export type LogLevelUpper = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

/**
 * 错误信息
 */
export interface ErrorInfo {
  name?: string;
  message?: string;
  stack?: string;
  [key: string]: any;
}

/**
 * 微前端应用信息
 */
export interface MicroAppInfo {
  /**
   * 微前端应用类型
   */
  microAppType: 'main' | 'sub' | 'layout';
  /**
   * 微前端应用名称（如 "admin-app"）
   */
  microAppName: string;
  /**
   * 微前端应用实例ID
   */
  microAppInstanceId?: string;
  /**
   * 微前端应用生命周期状态
   */
  microAppLifecycle?: 'mount' | 'unmount' | 'update';
}

/**
 * 日志条目（内部使用）
 */
export interface LogEntry {
  /**
   * 日志级别（小写）
   */
  level: LogLevel;
  /**
   * 日志消息
   */
  message: string;
  /**
   * 时间戳（毫秒）
   */
  timestamp: number;
  /**
   * 应用名称（用于确定上报的应用ID）
   */
  appName: string;
  /**
   * 日志记录器名称（可选）
   */
  loggerName?: string;
  /**
   * 微前端应用信息（可选，如果不提供会自动检测）
   */
  microApp?: MicroAppInfo;
  /**
   * 上下文信息（会被转换为 extensions）
   */
  context?: Record<string, any>;
  /**
   * 错误信息（如果是错误日志，会被转换为 data）
   */
  error?: ErrorInfo;
  /**
   * 数据字段（可选）
   */
  data?: any;
  /**
   * 扩展信息（可选）
   */
  extensions?: Record<string, any>;
  /**
   * 其他扩展字段
   */
  [key: string]: any;
}

/**
 * 扩展信息（结构化监控数据）
 */
export interface LogExtensions {
  /**
   * 事件类型
   */
  eventType?: string;
  /**
   * 会话ID
   */
  sessionId?: string;
  /**
   * 用户ID
   */
  userId?: string;
  /**
   * 性能指标
   */
  performance?: {
    duration?: number;
    startTime?: number;
    endTime?: number;
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
    domReady?: number;
    loadComplete?: number;
    [key: string]: any;
  };
  /**
   * 路由信息
   */
  route?: {
    from?: string;
    to?: string;
    routeName?: string;
    routePath?: string;
    routeParams?: Record<string, any>;
    routeQuery?: Record<string, any>;
  };
  /**
   * API 信息
   */
  api?: {
    url?: string;
    endpoint?: string;
    method?: string;
    statusCode?: number;
    responseTime?: number;
    responseSize?: number;
    requestSize?: number;
    retryCount?: number;
  };
  /**
   * 错误信息（增强）
   */
  error?: {
    name?: string;
    message?: string;
    stack?: string;
    errorType?: string;
    errorCode?: string;
    [key: string]: any;
  };
  /**
   * 资源信息
   */
  resource?: {
    type?: string;
    url?: string;
    size?: number;
    loadTime?: number;
    dnsTime?: number;
    tcpTime?: number;
    sslTime?: number;
    requestTime?: number;
  };
  /**
   * 用户行为信息
   */
  userAction?: {
    actionType?: string;
    elementType?: string;
    elementId?: string;
    elementClass?: string;
    elementText?: string;
    scrollDepth?: number;
  };
  /**
   * 业务信息
   */
  business?: {
    eventName?: string;
    eventCategory?: string;
    eventValue?: number;
    eventTags?: Record<string, string>;
    [key: string]: any;
  };
  /**
   * 系统信息
   */
  system?: {
    memory?: {
      heapUsed?: number;
      heapTotal?: number;
      jsHeapSizeLimit?: number;
    };
    network?: {
      online?: boolean;
      connectionType?: string;
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      previousState?: boolean; // 网络状态变化前的状态
    };
    device?: {
      browser?: string;
      browserVersion?: string;
      os?: string;
      osVersion?: string;
      screenWidth?: number;
      screenHeight?: number;
      deviceType?: string;
      userAgent?: string;
    };
    visibility?: {
      hidden?: boolean;
      visibilityState?: 'visible' | 'hidden' | 'prerender';
      hiddenTime?: number; // 页面隐藏时长（毫秒）
    };
  };
  /**
   * WebSocket 信息
   */
  websocket?: {
    url?: string;
    readyState?: number; // 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED
    error?: string;
    closeCode?: number;
    closeReason?: string;
  };
  /**
   * 控制台信息
   */
  console?: {
    level?: 'error' | 'warn' | 'info' | 'debug' | 'log';
    args?: any[]; // 控制台参数
  };
  /**
   * 表单验证信息
   */
  validation?: {
    formId?: string;
    field?: string;
    rule?: string;
    message?: string;
    value?: any;
  };
  /**
   * 存储信息
   */
  storage?: {
    type?: 'localStorage' | 'sessionStorage' | 'indexedDB';
    key?: string;
    operation?: 'getItem' | 'setItem' | 'removeItem' | 'clear';
    size?: number; // 存储大小（字节）
  };
  /**
   * 跨应用通信信息
   */
  communication?: {
    type?: 'postMessage' | 'event' | 'storage';
    from?: string; // 来源应用
    to?: string; // 目标应用
    message?: any;
    success?: boolean;
  };
  /**
   * 长任务信息
   */
  longTask?: {
    name?: string;
    attribution?: Array<{
      name?: string;
      entryType?: string;
      startTime?: number;
      duration?: number;
    }>;
  };
  /**
   * 卸载信息
   */
  unload?: {
    type?: 'beforeunload' | 'unload' | 'pagehide';
    reason?: 'navigation' | 'close' | 'reload';
  };
  /**
   * 其他扩展字段
   */
  [key: string]: any;
}

/**
 * 上报日志条目（服务器格式）
 */
export interface ServerLogEntry {
  /**
   * 时间戳（ISO 8601 格式）
   */
  timestamp: string;
  /**
   * 日志级别（大写）
   */
  logLevel: LogLevelUpper;
  /**
   * 日志记录器名称
   */
  loggerName: string;
  /**
   * 微前端应用信息
   */
  microApp: MicroAppInfo;
  /**
   * 日志消息
   */
  message: string;
  /**
   * 数据字段（可为 null）
   */
  data: any;
  /**
   * 扩展信息（结构化监控数据）
   */
  extensions?: LogExtensions;
}

/**
 * 日志上报请求体（服务器格式）
 */
export interface LogReportRequest {
  /**
   * 应用ID（完整格式，如 "btc-shopflow-admin-app"）
   */
  appId: string;
  /**
   * 应用名称（简化名称，如 "admin"）
   */
  appName: string;
  /**
   * 请求发送时间（ISO 8601 格式）
   */
  timestamp: string;
  /**
   * 批量日志数组（最多10条，单条不超过2KB）
   */
  logs: ServerLogEntry[];
}

/**
 * 日志上报选项
 */
export interface LogReporterOptions {
  /**
   * 批量上报的最大日志数量
   * @default 10
   */
  batchSize?: number;
  /**
   * 批量上报的最大等待时间（毫秒）
   * @default 5000
   */
  maxWaitTime?: number;
  /**
   * 最大重试次数
   * @default 3
   */
  maxRetries?: number;
  /**
   * 重试延迟（毫秒）
   * @default 1000
   */
  retryDelay?: number;
  /**
   * 是否启用上报
   * @default true
   */
  enabled?: boolean;
  /**
   * 是否在错误时静默处理（不打印控制台错误）
   * @default false
   */
  silent?: boolean;
}

/**
 * 日志上报响应
 */
export interface LogReportResponse {
  success: boolean;
  message?: string;
  count?: number;
}

/**
 * 日志频率类型
 */
export type LogFrequency = 'low' | 'high';

/**
 * 日志优先级
 */
export type LogPriority = 'high' | 'normal' | 'low';

/**
 * 日志频率阈值配置
 */
export interface LogFrequencyThresholds {
  /**
   * 单位时间内（如10秒）相同类型日志数量阈值
   * @default 10
   */
  highFrequencyThreshold: number;
  /**
   * 检查时间窗口（毫秒）
   * @default 10000
   */
  checkWindow: number;
}

/**
 * 日志累加器选项
 */
export interface LogAccumulatorOptions {
  /**
   * 累加时间窗口（毫秒），相同日志在此时间窗口内会合并
   * @default 1000
   */
  timeWindow?: number;
  /**
   * 是否自动刷新（定期将累加的日志上报）
   * @default false
   */
  autoFlush?: boolean;
  /**
   * 自动刷新间隔（毫秒）
   * @default 5000
   */
  autoFlushInterval?: number;
}

/**
 * 日志条目（带累加计数）
 */
export interface LogEntryWithCount extends LogEntry {
  /**
   * 重复次数（累加后的计数）
   */
  repeatCount?: number;
}

/**
 * 日志分类结果
 */
export interface LogClassificationResult {
  /**
   * 频率类型
   */
  frequency: LogFrequency;
  /**
   * 优先级
   */
  priority: LogPriority;
  /**
   * 是否需要数据整理
   */
  needsProcessing: boolean;
}
