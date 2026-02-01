# 监控数据结构设计

本文档说明上报日志结构和查询结构的区别，以及能够囊括所有场景的统一结构设计。

## 一、核心概念

### 1.1 数据结构的关系

```
上报日志结构 (ServerLogEntry)
    ↓ 存储到数据库
数据库记录
    ↓ 通过查询条件过滤
查询参数结构 (LogQueryParams)
    ↓ 返回匹配的记录
查询结果 (ServerLogEntry[])
```

**关键区别**：
- **上报结构**：存储结构，包含完整的监控数据（所有字段都有值）
- **查询结构**：过滤条件，用于检索（大部分字段为可选，用于过滤）

### 1.2 为什么不一样？

1. **存储 vs 查询**：存储需要完整数据，查询只需要过滤条件
2. **性能考虑**：查询结构支持范围查询（如 `apiResponseTimeRange`），存储结构是具体值
3. **灵活性**：查询支持模糊匹配、范围查询等，存储是精确值

---

## 二、上报日志结构（存储结构）

### 2.1 批次结构（LogBatch）

#### 2.1.1 上报结构（前端 -> 后端）

```typescript
/**
 * 日志批次上报结构（前端上报到后端）
 * 注意：createdAt 和 id 由数据库生成，不需要前端上报
 */
interface LogBatchRequest {
  /**
   * 应用ID（完整格式，如 "btc-shopflow-admin-app"）
   */
  appId: string;
  
  /**
   * 应用名称（简化名称，如 "admin"）
   */
  appName: string;
  
  /**
   * 批次时间戳（ISO 8601 格式）
   * 通常是批次中第一条日志的时间戳
   */
  timestamp: string;
  
  /**
   * 日志数组（该批次包含的所有日志）
   */
  logs: ServerLogEntry[];
}
```

#### 2.1.2 返回结构（后端 -> 前端）

```typescript
/**
 * 日志批次返回结构（后端返回给前端）
 * 包含数据库生成的字段
 */
interface LogBatchResponse {
  /**
   * 批次ID（主键，数据库生成）
   */
  id: number;
  
  /**
   * 应用ID（完整格式，如 "btc-shopflow-admin-app"）
   */
  appId: string;
  
  /**
   * 应用名称（简化名称，如 "admin"）
   */
  appName: string;
  
  /**
   * 批次时间戳（ISO 8601 格式）
   * 通常是批次中第一条日志的时间戳
   */
  timestamp: string;
  
  /**
   * 创建时间（ISO 8601 格式）
   * 数据库生成，记录创建时间
   */
  createdAt: string;
  
  /**
   * 日志数组（该批次包含的所有日志）
   */
  logs: ServerLogEntry[];
}
```

### 2.2 完整的 ServerLogEntry 结构（单条日志）

```typescript
/**
 * 上报日志条目（服务器格式）- 完整结构
 * 这是 logs 数组中的单条日志记录
 */
interface ServerLogEntry {
  // ========== 基础字段（必需）==========
  /**
   * 时间戳（ISO 8601 格式）
   */
  timestamp: string;
  
  /**
   * 日志级别（大写）
   */
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  
  /**
   * 日志记录器名称
   */
  loggerName: string;
  
  /**
   * 微前端应用信息
   */
  microApp: {
    microAppType: 'main' | 'sub' | 'layout';
    microAppName: string;
    microAppInstanceId?: string;
    microAppLifecycle?: 'mount' | 'unmount' | 'update';
  };
  
  /**
   * 日志消息
   */
  message: string;
  
  /**
   * 数据字段（可为 null）
   * - 错误日志：存储错误对象
   * - 业务日志：存储业务数据
   * - 其他：存储相关数据
   */
  data: any;
  
  // ========== 扩展字段（可选，结构化）==========
  /**
   * 扩展信息 - 包含所有监控数据
   */
  extensions?: {
    // ---------- 事件类型（必需）----------
    /**
     * 事件类型
     * - app:lifecycle - 应用生命周期
     * - route:navigation - 路由导航
     * - api:request - API 请求
     * - api:response - API 响应
     * - performance:page - 页面性能
     * - performance:resource - 资源性能
     * - error:runtime - 运行时错误
     * - error:api - API 错误
     * - error:resource - 资源错误
     * - user:action - 用户操作
     * - business:event - 业务事件
     */
    eventType?: string;
    
    // ---------- 会话和用户信息 ----------
    /**
     * 会话ID（用于追踪用户会话）
     */
    sessionId?: string;
    
    /**
     * 用户ID
     */
    userId?: string;
    
    // ---------- 性能指标 ----------
    /**
     * 性能指标
     */
    performance?: {
      /**
       * 持续时间（毫秒）
       */
      duration?: number;
      
      /**
       * 开始时间（毫秒时间戳）
       */
      startTime?: number;
      
      /**
       * 结束时间（毫秒时间戳）
       */
      endTime?: number;
      
      /**
       * First Contentful Paint（首次内容绘制，毫秒）
       */
      fcp?: number;
      
      /**
       * Largest Contentful Paint（最大内容绘制，毫秒）
       */
      lcp?: number;
      
      /**
       * First Input Delay（首次输入延迟，毫秒）
       */
      fid?: number;
      
      /**
       * Cumulative Layout Shift（累积布局偏移）
       */
      cls?: number;
      
      /**
       * Time to First Byte（首字节时间，毫秒）
       */
      ttfb?: number;
      
      /**
       * DOM Ready 时间（毫秒）
       */
      domReady?: number;
      
      /**
       * Load Complete 时间（毫秒）
       */
      loadComplete?: number;
    };
    
    // ---------- 路由信息 ----------
    /**
     * 路由信息
     */
    route?: {
      /**
       * 来源路由路径
       */
      from?: string;
      
      /**
       * 目标路由路径
       */
      to?: string;
      
      /**
       * 路由名称
       */
      routeName?: string;
      
      /**
       * 当前路由路径
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
    };
    
    // ---------- API 信息 ----------
    /**
     * API 信息
     */
    api?: {
      /**
       * API URL（完整路径）
       */
      url?: string;
      
      /**
       * API 端点（相对路径，如 /api/order/list）
       */
      endpoint?: string;
      
      /**
       * HTTP 方法
       */
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      
      /**
       * HTTP 状态码
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
    };
    
    // ---------- 错误信息 ----------
    /**
     * 错误信息（增强）
     */
    error?: {
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
       * - runtime - 运行时错误
       * - api - API 错误
       * - route - 路由错误
       * - resource - 资源错误
       * - performance - 性能错误
       */
      errorType?: string;
      
      /**
       * 错误代码
       */
      errorCode?: string;
    };
    
    // ---------- 资源信息 ----------
    /**
     * 资源信息
     */
    resource?: {
      /**
       * 资源类型
       * - script - JS 脚本
       * - stylesheet - CSS 样式
       * - image - 图片
       * - font - 字体
       * - other - 其他
       */
      type?: string;
      
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
    };
    
    // ---------- 用户行为信息 ----------
    /**
     * 用户行为信息
     */
    userAction?: {
      /**
       * 操作类型
       * - click - 点击
       * - submit - 提交
       * - scroll - 滚动
       * - focus - 聚焦
       * - blur - 失焦
       * - change - 改变
       */
      actionType?: string;
      
      /**
       * 元素类型
       * - button - 按钮
       * - form - 表单
       * - link - 链接
       * - input - 输入框
       */
      elementType?: string;
      
      /**
       * 元素ID
       */
      elementId?: string;
      
      /**
       * 元素类名
       */
      elementClass?: string;
      
      /**
       * 元素文本（截断，最多100字符）
       */
      elementText?: string;
      
      /**
       * 滚动深度（百分比，0-100）
       */
      scrollDepth?: number;
    };
    
    // ---------- 业务信息 ----------
    /**
     * 业务信息
     */
    business?: {
      /**
       * 业务事件名称
       * 如：order:create, order:pay, user:register
       */
      eventName?: string;
      
      /**
       * 业务事件分类
       * 如：order, payment, user
       */
      eventCategory?: string;
      
      /**
       * 业务事件值（数值）
       */
      eventValue?: number;
      
      /**
       * 业务事件标签（键值对）
       */
      eventTags?: Record<string, string>;
      
      /**
       * 其他业务数据
       */
      [key: string]: any;
    };
    
    // ---------- 系统信息 ----------
    /**
     * 系统信息
     */
    system?: {
      /**
       * 内存信息
       */
      memory?: {
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
      };
      
      /**
       * 网络信息
       */
      network?: {
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
         * - 4g, 3g, 2g, slow-2g
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
      };
      
      /**
       * 设备信息
       */
      device?: {
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
         * 屏幕宽度（像素）
         */
        screenWidth?: number;
        
        /**
         * 屏幕高度（像素）
         */
        screenHeight?: number;
        
        /**
         * 设备类型
         * - desktop - 桌面
         * - mobile - 移动设备
         * - tablet - 平板
         */
        deviceType?: string;
        
        /**
         * User Agent
         */
        userAgent?: string;
      };
    };
    
    // ---------- 其他扩展字段 ----------
    /**
     * 其他扩展字段
     */
    [key: string]: any;
  };
}
```

---

## 三、查询参数结构（过滤条件）

### 3.1 完整的 LogQueryParams 结构

```typescript
/**
 * 日志查询参数 - 用于过滤和检索
 * 注意：这是查询条件，不是存储结构
 */
interface LogQueryParams {
  // ========== 基础查询（必需）==========
  /**
   * 应用ID（完整格式，如 "btc-shopflow-admin-app"）
   */
  appId?: string;
  
  /**
   * 日志级别
   */
  logLevel?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  
  /**
   * 日志记录器名称
   */
  loggerName?: string;
  
  /**
   * 消息关键词（模糊匹配）
   */
  messageKeyword?: string;
  
  /**
   * 时间范围
   */
  timeRange?: {
    startTime: string;  // ISO 8601 格式
    endTime: string;    // ISO 8601 格式
  };
  
  // ========== 微前端信息 ==========
  /**
   * 微前端应用类型
   */
  microAppType?: 'main' | 'sub' | 'layout';
  
  /**
   * 微前端应用名称
   */
  microAppName?: string;
  
  /**
   * 微前端应用实例ID
   */
  microAppInstanceId?: string;
  
  /**
   * 微前端应用生命周期状态
   */
  microAppLifecycle?: 'mount' | 'unmount' | 'update';
  
  // ========== 事件类型查询 ==========
  /**
   * 事件类型（支持多个，用逗号分隔）
   * 如：'app:lifecycle,route:navigation'
   */
  eventType?: string;
  
  // ========== 会话和用户查询 ==========
  /**
   * 会话ID
   */
  sessionId?: string;
  
  /**
   * 用户ID
   */
  userId?: string;
  
  // ========== 路由查询 ==========
  /**
   * 路由路径（支持模糊匹配）
   */
  routePath?: string;
  
  /**
   * 路由名称（精确匹配）
   */
  routeName?: string;
  
  // ========== API 查询 ==========
  /**
   * API 端点（支持模糊匹配）
   */
  apiEndpoint?: string;
  
  /**
   * HTTP 方法
   */
  apiMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  
  /**
   * HTTP 状态码
   */
  apiStatusCode?: number;
  
  /**
   * API 响应时间范围（毫秒）
   */
  apiResponseTimeRange?: {
    min?: number;
    max?: number;
  };
  
  // ========== 错误查询 ==========
  /**
   * 错误类型
   */
  errorType?: string;
  
  /**
   * 错误代码
   */
  errorCode?: string;
  
  /**
   * 是否有错误（布尔值）
   */
  hasError?: boolean;
  
  // ========== 性能查询 ==========
  /**
   * 性能指标范围
   */
  performanceRange?: {
    /**
     * 持续时间范围（毫秒）
     */
    duration?: { min?: number; max?: number };
    
    /**
     * FCP 范围（毫秒）
     */
    fcp?: { min?: number; max?: number };
    
    /**
     * LCP 范围（毫秒）
     */
    lcp?: { min?: number; max?: number };
    
    /**
     * FID 范围（毫秒）
     */
    fid?: { min?: number; max?: number };
    
    /**
     * CLS 范围
     */
    cls?: { min?: number; max?: number };
    
    /**
     * TTFB 范围（毫秒）
     */
    ttfb?: { min?: number; max?: number };
  };
  
  // ========== 资源查询 ==========
  /**
   * 资源类型
   */
  resourceType?: string;
  
  /**
   * 资源 URL（支持模糊匹配）
   */
  resourceUrl?: string;
  
  // ========== 用户行为查询 ==========
  /**
   * 用户操作类型
   */
  userActionType?: string;
  
  /**
   * 操作元素（支持模糊匹配）
   */
  userActionElement?: string;
  
  // ========== 业务查询 ==========
  /**
   * 业务事件名称
   */
  businessEventName?: string;
  
  /**
   * 业务事件分类
   */
  businessEventCategory?: string;
  
  // ========== 系统查询 ==========
  /**
   * 设备类型
   */
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  
  /**
   * 浏览器
   */
  browser?: string;
  
  /**
   * 操作系统
   */
  os?: string;
  
  // ========== 向后兼容 ==========
  /**
   * 操作（保留，映射到 userActionType）
   */
  action?: string;
}
```

---

## 四、结构对比和映射关系

### 4.1 存储结构 vs 查询结构

| 存储结构（ServerLogEntry） | 查询结构（LogQueryParams） | 映射关系 |
|---------------------------|---------------------------|---------|
| `extensions.eventType` | `eventType` | 精确匹配或包含匹配 |
| `extensions.userId` | `userId` | 精确匹配 |
| `extensions.sessionId` | `sessionId` | 精确匹配 |
| `extensions.route.routePath` | `routePath` | 模糊匹配 |
| `extensions.route.routeName` | `routeName` | 精确匹配 |
| `extensions.api.endpoint` | `apiEndpoint` | 模糊匹配 |
| `extensions.api.method` | `apiMethod` | 精确匹配 |
| `extensions.api.statusCode` | `apiStatusCode` | 精确匹配 |
| `extensions.api.responseTime` | `apiResponseTimeRange` | 范围查询 |
| `extensions.error.errorType` | `errorType` | 精确匹配 |
| `extensions.error.errorCode` | `errorCode` | 精确匹配 |
| `extensions.error` (存在) | `hasError` | 存在性查询 |
| `extensions.performance.duration` | `performanceRange.duration` | 范围查询 |
| `extensions.performance.fcp` | `performanceRange.fcp` | 范围查询 |
| `extensions.performance.lcp` | `performanceRange.lcp` | 范围查询 |
| `extensions.performance.ttfb` | `performanceRange.ttfb` | 范围查询 |
| `extensions.resource.type` | `resourceType` | 精确匹配 |
| `extensions.resource.url` | `resourceUrl` | 模糊匹配 |
| `extensions.userAction.actionType` | `userActionType` | 精确匹配 |
| `extensions.userAction.elementType` | `userActionElement` | 模糊匹配 |
| `extensions.business.eventName` | `businessEventName` | 精确匹配 |
| `extensions.business.eventCategory` | `businessEventCategory` | 精确匹配 |
| `extensions.system.device.deviceType` | `deviceType` | 精确匹配 |
| `extensions.system.device.browser` | `browser` | 模糊匹配 |
| `extensions.system.device.os` | `os` | 模糊匹配 |

### 4.2 关键区别

1. **存储是具体值，查询是过滤条件**
   - 存储：`extensions.api.responseTime = 1234`（具体值）
   - 查询：`apiResponseTimeRange = { min: 1000, max: 2000 }`（范围）

2. **存储是嵌套结构，查询是扁平结构**
   - 存储：`extensions.route.routePath = '/order/list'`
   - 查询：`routePath = '/order/list'`

3. **存储包含所有数据，查询只包含过滤条件**
   - 存储：包含完整的 `extensions` 对象
   - 查询：只包含需要过滤的字段

---

## 五、统一结构设计（能够囊括所有场景）

### 5.1 核心设计原则

1. **批次结构**：批次级别存储应用信息和时间戳
2. **日志结构**：单条日志包含完整监控数据，通过 `extensions` 扩展
3. **查询结构**：扁平、可选、支持范围查询
4. **映射关系**：查询字段映射到 `logs` 数组中每条记录的 `extensions` 字段

### 5.2 统一的数据模型

```typescript
/**
 * 统一监控数据模型
 * 这是能够囊括所有场景的核心结构
 */

// ========== 存储层：批次结构 ==========
interface LogBatch {
  id: number;
  appId: string;
  appName: string;
  timestamp: string;
  createdAt: string;
  logs: ServerLogEntry[];  // 批量日志数组
}

// ========== 存储层：单条日志 ==========
interface ServerLogEntry {
  // 基础字段
  timestamp: string;
  logLevel: string;
  loggerName: string;
  microApp: MicroAppInfo;
  message: string;
  data: any;
  
  // 扩展字段（结构化）
  extensions?: MonitorExtensions;
}

// ========== 扩展字段：所有监控数据 ==========
interface MonitorExtensions {
  // 事件类型（必需，用于区分监控类型）
  eventType: MonitorEventType;
  
  // 会话和用户
  sessionId?: string;
  userId?: string;
  
  // 性能指标
  performance?: PerformanceMetrics;
  
  // 路由信息
  route?: RouteInfo;
  
  // API 信息
  api?: ApiInfo;
  
  // 错误信息
  error?: ErrorInfo;
  
  // 资源信息
  resource?: ResourceInfo;
  
  // 用户行为
  userAction?: UserActionInfo;
  
  // 业务信息
  business?: BusinessInfo;
  
  // 系统信息
  system?: SystemInfo;
}

// ========== 查询层：过滤条件 ==========
interface MonitorQueryParams {
  // 基础查询
  appId?: string;
  logLevel?: string;
  loggerName?: string;
  messageKeyword?: string;
  timeRange?: TimeRange;
  
  // 微前端
  microAppType?: string;
  microAppName?: string;
  microAppLifecycle?: string;
  
  // 事件类型
  eventType?: string | string[];
  
  // 会话和用户
  sessionId?: string;
  userId?: string;
  
  // 路由查询（映射到 extensions.route）
  routePath?: string;
  routeName?: string;
  
  // API 查询（映射到 extensions.api）
  apiEndpoint?: string;
  apiMethod?: string;
  apiStatusCode?: number;
  apiResponseTimeRange?: NumberRange;
  
  // 错误查询（映射到 extensions.error）
  errorType?: string;
  errorCode?: string;
  hasError?: boolean;
  
  // 性能查询（映射到 extensions.performance）
  performanceRange?: {
    duration?: NumberRange;
    fcp?: NumberRange;
    lcp?: NumberRange;
    fid?: NumberRange;
    cls?: NumberRange;
    ttfb?: NumberRange;
  };
  
  // 资源查询（映射到 extensions.resource）
  resourceType?: string;
  resourceUrl?: string;
  
  // 用户行为查询（映射到 extensions.userAction）
  userActionType?: string;
  userActionElement?: string;
  
  // 业务查询（映射到 extensions.business）
  businessEventName?: string;
  businessEventCategory?: string;
  
  // 系统查询（映射到 extensions.system）
  deviceType?: string;
  browser?: string;
  os?: string;
}

// ========== 辅助类型 ==========
type MonitorEventType =
  | 'app:lifecycle'
  | 'route:navigation'
  | 'api:request'
  | 'api:response'
  | 'performance:page'
  | 'performance:resource'
  | 'error:runtime'
  | 'error:api'
  | 'error:resource'
  | 'user:action'
  | 'business:event';

interface TimeRange {
  startTime: string;
  endTime: string;
}

interface NumberRange {
  min?: number;
  max?: number;
}
```

---

## 六、总结

### 6.1 关键结论

1. **上报结构和查询结构不一样**
   - 上报结构：完整、嵌套、存储所有数据
   - 查询结构：扁平、可选、只包含过滤条件

2. **统一结构设计**
   - 存储层：`ServerLogEntry` 的 `extensions` 字段包含所有监控数据
   - 查询层：`LogQueryParams` 的字段映射到 `extensions` 的对应路径

3. **能够囊括所有场景的结构**
   - 通过 `extensions` 字段的嵌套结构，可以存储任意监控数据
   - 通过查询参数的扁平结构，可以灵活过滤任意字段
   - 通过映射关系，实现存储和查询的对应

### 6.2 实现建议

1. **存储层**：使用 `ServerLogEntry` 的 `extensions` 字段存储所有监控数据
2. **查询层**：使用 `LogQueryParams` 的扁平字段进行过滤
3. **映射层**：后端实现查询参数到存储结构的映射逻辑

这样设计的好处：
- ✅ 存储结构灵活，可以存储任意监控数据
- ✅ 查询结构清晰，易于使用
- ✅ 向后兼容，不影响现有功能
- ✅ 易于扩展，新增监控类型只需扩展 `extensions`
