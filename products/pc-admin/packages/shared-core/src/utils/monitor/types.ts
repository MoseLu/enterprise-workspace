/**
 * 监控事件类型系统
 * 定义所有监控事件的数据结构
 */

/**
 * 事件类型枚举
 */
export type MonitorEventType =
  | 'app:lifecycle' // 应用生命周期
  | 'app:unload' // 应用卸载
  | 'app:communication' // 跨应用通信
  | 'route:navigation' // 路由导航
  | 'api:request' // API 请求
  | 'api:response' // API 响应
  | 'performance:page' // 页面性能
  | 'performance:resource' // 资源性能
  | 'performance:longtask' // 长任务检测
  | 'error:runtime' // 运行时错误
  | 'error:api' // API 错误
  | 'error:route' // 路由错误
  | 'error:resource' // 资源错误
  | 'error:performance' // 性能错误
  | 'error:promise' // Promise 错误
  | 'error:validation' // 表单验证错误
  | 'error:storage' // 存储错误
  | 'user:action' // 用户操作
  | 'business:event' // 业务事件
  | 'system:memory' // 系统内存
  | 'system:network' // 系统网络
  | 'system:network:change' // 网络状态变化
  | 'system:device' // 系统设备
  | 'system:visibility' // 页面可见性
  | 'console:error' // 控制台错误
  | 'console:warn' // 控制台警告
  | 'websocket:connect' // WebSocket 连接
  | 'websocket:error' // WebSocket 错误
  | 'websocket:close'; // WebSocket 关闭

/**
 * 应用生命周期事件类型
 */
export type AppLifecycleEventType =
  | 'bootstrap:start' // 应用启动开始
  | 'bootstrap:end' // 应用启动结束
  | 'mount:start' // 应用挂载开始
  | 'mount:end' // 应用挂载结束
  | 'unmount:start' // 应用卸载开始
  | 'unmount:end' // 应用卸载结束
  | 'update'; // 应用更新

/**
 * 用户操作类型
 */
export type UserActionType = 'click' | 'submit' | 'scroll' | 'focus' | 'blur' | 'change' | 'input';

/**
 * 资源类型
 */
export type ResourceType = 'script' | 'stylesheet' | 'image' | 'font' | 'other';

/**
 * 错误类型
 */
export type ErrorType = 'runtime' | 'api' | 'route' | 'resource' | 'performance' | 'promise' | 'validation' | 'storage';

/**
 * 设备类型
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet';

/**
 * 性能指标数据
 */
export interface PerformanceMetrics {
  /**
   * 持续时间（毫秒）
   */
  duration?: number;
  /**
   * 开始时间（毫秒）
   */
  startTime?: number;
  /**
   * 结束时间（毫秒）
   */
  endTime?: number;
  /**
   * First Contentful Paint（首次内容绘制）
   */
  fcp?: number;
  /**
   * Largest Contentful Paint（最大内容绘制）
   */
  lcp?: number;
  /**
   * First Input Delay（首次输入延迟）
   */
  fid?: number;
  /**
   * Cumulative Layout Shift（累积布局偏移）
   */
  cls?: number;
  /**
   * Time to First Byte（首字节时间）
   */
  ttfb?: number;
  /**
   * DOM Ready 时间
   */
  domReady?: number;
  /**
   * Load Complete 时间
   */
  loadComplete?: number;
  /**
   * 其他性能指标
   */
  [key: string]: any;
}

/**
 * 路由信息
 */
export interface RouteInfo {
  /**
   * 来源路由
   */
  from?: string;
  /**
   * 目标路由
   */
  to?: string;
  /**
   * 路由名称
   */
  routeName?: string;
  /**
   * 路由路径
   */
  routePath?: string;
  /**
   * 路由参数
   */
  routeParams?: Record<string, any>;
  /**
   * 路由查询参数
   */
  routeQuery?: Record<string, any>;
}

/**
 * API 信息
 */
export interface ApiInfo {
  /**
   * API URL
   */
  url?: string;
  /**
   * API 端点（相对路径）
   */
  endpoint?: string;
  /**
   * HTTP 方法
   */
  method?: string;
  /**
   * 状态码
   */
  statusCode?: number;
  /**
   * 响应时间（毫秒）
   */
  responseTime?: number;
  /**
   * 响应大小（字节）
   */
  responseSize?: number;
  /**
   * 请求大小（字节）
   */
  requestSize?: number;
  /**
   * 重试次数
   */
  retryCount?: number;
}

/**
 * 错误信息（增强版）
 */
export interface ErrorInfo {
  /**
   * 错误名称
   */
  name?: string;
  /**
   * 错误消息
   */
  message?: string;
  /**
   * 错误堆栈
   */
  stack?: string;
  /**
   * 错误类型
   */
  errorType?: ErrorType;
  /**
   * 错误代码
   */
  errorCode?: string;
  /**
   * 其他错误信息
   */
  [key: string]: any;
}

/**
 * 资源信息
 */
export interface ResourceInfo {
  /**
   * 资源类型
   */
  type?: ResourceType;
  /**
   * 资源 URL
   */
  url?: string;
  /**
   * 资源大小（字节）
   */
  size?: number;
  /**
   * 加载时间（毫秒）
   */
  loadTime?: number;
  /**
   * DNS 查询时间（毫秒）
   */
  dnsTime?: number;
  /**
   * TCP 连接时间（毫秒）
   */
  tcpTime?: number;
  /**
   * SSL 握手时间（毫秒）
   */
  sslTime?: number;
  /**
   * 请求响应时间（毫秒）
   */
  requestTime?: number;
}

/**
 * 用户行为信息
 */
export interface UserActionInfo {
  /**
   * 操作类型
   */
  actionType?: UserActionType;
  /**
   * 元素类型
   */
  elementType?: string;
  /**
   * 元素 ID
   */
  elementId?: string;
  /**
   * 元素类名
   */
  elementClass?: string;
  /**
   * 元素文本（截断）
   */
  elementText?: string;
  /**
   * 滚动深度（百分比）
   */
  scrollDepth?: number;
}

/**
 * 业务信息
 */
export interface BusinessInfo {
  /**
   * 业务事件名称
   */
  eventName?: string;
  /**
   * 业务事件分类
   */
  eventCategory?: string;
  /**
   * 业务事件值
   */
  eventValue?: number;
  /**
   * 业务事件标签
   */
  eventTags?: Record<string, string>;
  /**
   * 其他业务信息
   */
  [key: string]: any;
}

/**
 * 系统内存信息
 */
export interface SystemMemoryInfo {
  /**
   * 已使用堆内存（MB）
   */
  heapUsed?: number;
  /**
   * 总堆内存（MB）
   */
  heapTotal?: number;
  /**
   * JS 堆大小限制（MB）
   */
  jsHeapSizeLimit?: number;
}

/**
 * 系统网络信息
 */
export interface SystemNetworkInfo {
  /**
   * 是否在线
   */
  online?: boolean;
  /**
   * 网络类型
   */
  connectionType?: string;
  /**
   * 有效网络类型
   */
  effectiveType?: string;
  /**
   * 下行速度（Mbps）
   */
  downlink?: number;
  /**
   * 往返时间（ms）
   */
  rtt?: number;
  /**
   * 网络状态变化前的状态
   */
  previousState?: boolean;
}

/**
 * 系统设备信息
 */
export interface SystemDeviceInfo {
  /**
   * 浏览器
   */
  browser?: string;
  /**
   * 浏览器版本
   */
  browserVersion?: string;
  /**
   * 操作系统
   */
  os?: string;
  /**
   * 操作系统版本
   */
  osVersion?: string;
  /**
   * 屏幕宽度
   */
  screenWidth?: number;
  /**
   * 屏幕高度
   */
  screenHeight?: number;
  /**
   * 设备类型
   */
  deviceType?: DeviceType;
  /**
   * User Agent
   */
  userAgent?: string;
}

/**
 * 系统可见性信息
 */
export interface SystemVisibilityInfo {
  /**
   * 是否隐藏
   */
  hidden?: boolean;
  /**
   * 可见性状态
   */
  visibilityState?: 'visible' | 'hidden' | 'prerender';
  /**
   * 页面隐藏时长（毫秒）
   */
  hiddenTime?: number;
}

/**
 * 系统信息
 */
export interface SystemInfo {
  /**
   * 内存信息
   */
  memory?: SystemMemoryInfo;
  /**
   * 网络信息
   */
  network?: SystemNetworkInfo;
  /**
   * 设备信息
   */
  device?: SystemDeviceInfo;
  /**
   * 可见性信息
   */
  visibility?: SystemVisibilityInfo;
}

/**
 * 监控事件数据结构（内部使用）
 */
export interface MonitorEvent {
  /**
   * 事件类型
   */
  eventType: MonitorEventType;
  /**
   * 时间戳（毫秒）
   */
  timestamp: number;
  /**
   * 应用名称
   */
  appName: string;
  /**
   * 会话ID
   */
  sessionId: string;
  /**
   * 用户ID（可选）
   */
  userId?: string;
  /**
   * 事件数据
   */
  data: {
    /**
     * 性能指标
     */
    performance?: PerformanceMetrics;
    /**
     * 路由信息
     */
    route?: RouteInfo;
    /**
     * API 信息
     */
    api?: ApiInfo;
    /**
     * 错误信息
     */
    error?: ErrorInfo;
    /**
     * 资源信息
     */
    resource?: ResourceInfo;
    /**
     * 用户行为信息
     */
    userAction?: UserActionInfo;
    /**
     * 业务信息
     */
    business?: BusinessInfo;
    /**
     * 系统信息
     */
    system?: SystemInfo;
    /**
     * WebSocket 信息
     */
    websocket?: WebSocketInfo;
    /**
     * 控制台信息
     */
    console?: ConsoleInfo;
    /**
     * 表单验证信息
     */
    validation?: ValidationInfo;
    /**
     * 存储信息
     */
    storage?: StorageInfo;
    /**
     * 跨应用通信信息
     */
    communication?: CommunicationInfo;
    /**
     * 长任务信息
     */
    longTask?: LongTaskInfo;
    /**
     * 卸载信息
     */
    unload?: UnloadInfo;
    /**
     * 上下文信息
     */
    context?: Record<string, any>;
    /**
     * 其他数据
     */
    [key: string]: any;
  };
  /**
   * 扩展信息
   */
  extensions?: Record<string, any>;
}

/**
 * 应用生命周期事件数据
 */
export interface AppLifecycleEventData {
  /**
   * 生命周期事件类型
   */
  lifecycleEvent: AppLifecycleEventType;
  /**
   * 持续时间（毫秒）
   */
  duration?: number;
  /**
   * 其他信息
   */
  [key: string]: any;
}

/**
 * 路由导航事件数据
 */
export interface RouteNavigationEventData {
  /**
   * 路由信息
   */
  route: RouteInfo;
  /**
   * 性能指标
   */
  performance?: PerformanceMetrics;
}

/**
 * API 请求事件数据
 */
export interface ApiRequestEventData {
  /**
   * API 信息
   */
  api: ApiInfo;
}

/**
 * API 响应事件数据
 */
export interface ApiResponseEventData {
  /**
   * API 信息
   */
  api: ApiInfo;
  /**
   * 是否成功
   */
  success?: boolean;
}

/**
 * 页面性能事件数据
 */
export interface PagePerformanceEventData {
  /**
   * 性能指标
   */
  performance: PerformanceMetrics;
  /**
   * 路由信息（可选）
   */
  route?: RouteInfo;
}

/**
 * 资源性能事件数据
 */
export interface ResourcePerformanceEventData {
  /**
   * 资源信息
   */
  resource: ResourceInfo;
}

/**
 * 错误事件数据
 */
export interface ErrorEventData {
  /**
   * 错误信息
   */
  error: ErrorInfo;
  /**
   * 路由信息（可选）
   */
  route?: RouteInfo;
  /**
   * API 信息（可选）
   */
  api?: ApiInfo;
  /**
   * 资源信息（可选）
   */
  resource?: ResourceInfo;
}

/**
 * 用户行为事件数据
 */
export interface UserActionEventData {
  /**
   * 用户行为信息
   */
  userAction: UserActionInfo;
  /**
   * 路由信息（可选）
   */
  route?: RouteInfo;
}

/**
 * 业务事件数据
 */
export interface BusinessEventData {
  /**
   * 业务信息
   */
  business: BusinessInfo;
  /**
   * 路由信息（可选）
   */
  route?: RouteInfo;
}

/**
 * 系统事件数据
 */
export interface SystemEventData {
  /**
   * 系统信息
   */
  system: SystemInfo;
}

/**
 * WebSocket 信息
 */
export interface WebSocketInfo {
  /**
   * WebSocket URL
   */
  url?: string;
  /**
   * 就绪状态（0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED）
   */
  readyState?: number;
  /**
   * 错误信息
   */
  error?: string;
  /**
   * 关闭代码
   */
  closeCode?: number;
  /**
   * 关闭原因
   */
  closeReason?: string;
}

/**
 * 控制台信息
 */
export interface ConsoleInfo {
  /**
   * 控制台级别
   */
  level?: 'error' | 'warn' | 'info' | 'debug' | 'log';
  /**
   * 控制台参数
   */
  args?: any[];
}

/**
 * 表单验证信息
 */
export interface ValidationInfo {
  /**
   * 表单 ID
   */
  formId?: string;
  /**
   * 字段名
   */
  field?: string;
  /**
   * 验证规则
   */
  rule?: string;
  /**
   * 错误消息
   */
  message?: string;
  /**
   * 字段值
   */
  value?: any;
}

/**
 * 存储信息
 */
export interface StorageInfo {
  /**
   * 存储类型
   */
  type?: 'localStorage' | 'sessionStorage' | 'indexedDB';
  /**
   * 存储键名
   */
  key?: string;
  /**
   * 操作类型
   */
  operation?: 'getItem' | 'setItem' | 'removeItem' | 'clear';
  /**
   * 存储大小（字节）
   */
  size?: number;
}

/**
 * 跨应用通信信息
 */
export interface CommunicationInfo {
  /**
   * 通信类型
   */
  type?: 'postMessage' | 'event' | 'storage';
  /**
   * 来源应用
   */
  from?: string;
  /**
   * 目标应用
   */
  to?: string;
  /**
   * 消息内容
   */
  message?: any;
  /**
   * 是否成功
   */
  success?: boolean;
}

/**
 * 长任务信息
 */
export interface LongTaskInfo {
  /**
   * 任务名称
   */
  name?: string;
  /**
   * 任务归属信息
   */
  attribution?: Array<{
    name?: string;
    entryType?: string;
    startTime?: number;
    duration?: number;
  }>;
}

/**
 * 卸载信息
 */
export interface UnloadInfo {
  /**
   * 卸载类型
   */
  type?: 'beforeunload' | 'unload' | 'pagehide';
  /**
   * 卸载原因
   */
  reason?: 'navigation' | 'close' | 'reload';
}
