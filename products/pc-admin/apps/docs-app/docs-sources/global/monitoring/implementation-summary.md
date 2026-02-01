# 监控体系埋点实现总结

## 概述

本文档总结了所有应用数据埋点的实现情况，确保关键上报指标已完整覆盖。

## 实现状态：✅ 已完成

所有监控埋点已按照计划完整实现，覆盖了以下9个核心监控维度：

---

## 1. 应用生命周期监控 ✅

### 实现位置
- **主应用 (main-app)**: `apps/main-app/src/bootstrap/index.ts`
- **子应用 (system-app 等)**: `apps/*/src/bootstrap/index.ts`
- **子应用生命周期**: `packages/shared-core/src/composables/subapp-lifecycle/useSubAppLifecycle.ts`

### 埋点覆盖
- ✅ `bootstrap:start` - 应用启动开始
- ✅ `bootstrap:end` - 应用启动结束
- ✅ `mount:start` - 应用挂载开始
- ✅ `mount:end` - 应用挂载结束
- ✅ `unmount:start` - 应用卸载开始
- ✅ `unmount:end` - 应用卸载结束
- ✅ `update` - 应用更新

### 上报数据
- 生命周期事件类型
- 持续时间（duration）
- 应用名称（appName）
- 会话ID（sessionId）
- 时间戳（timestamp）

---

## 2. 路由性能监控 ✅

### 实现位置
- **主应用路由守卫**: `apps/main-app/src/router/guards/beforeEach.ts`, `afterEach.ts`
- **子应用路由同步**: `packages/shared-core/src/composables/subapp-lifecycle/useSubAppRouteSync.ts`

### 埋点覆盖
- ✅ 路由导航开始 (`trackRouteNavigationStart`)
- ✅ 路由导航结束 (`trackRouteNavigationEnd`)
- ✅ 路由导航完成 (`trackRouteNavigation`)
- ✅ 路由错误 (`trackRouteError`)

### 上报数据
- 路由路径（from/to）
- 路由名称（routeName）
- 路由参数（routeParams）
- 路由查询（routeQuery）
- 导航持续时间
- 路由元数据（meta）

---

## 3. API 性能监控 ✅

### 实现位置
- **共享请求拦截器**: `packages/shared-core/src/btc/service/request.ts`
- **应用特定请求拦截器**: `apps/*/src/utils/http.ts`

### 埋点覆盖
- ✅ API 请求开始 (`trackAPIRequest`)
- ✅ API 响应成功 (`trackAPIResponse`)
- ✅ API 响应失败 (`trackAPIError`)

### 上报数据
- API 端点（endpoint）
- HTTP 方法（method）
- 请求ID（requestId）
- 状态码（statusCode）
- 响应时间（responseTime）
- 请求/响应大小（requestSize/responseSize）
- 错误信息（error）

---

## 4. 页面性能监控（Web Vitals）✅

### 实现位置
- `packages/shared-core/src/utils/monitor/performance-monitor.ts`

### 埋点覆盖
- ✅ FCP (First Contentful Paint)
- ✅ LCP (Largest Contentful Paint)
- ✅ FID (First Input Delay)
- ✅ CLS (Cumulative Layout Shift)
- ✅ TTFB (Time to First Byte)
- ✅ DOM Ready
- ✅ Load Complete

### 上报数据
- 所有 Web Vitals 指标
- 导航时间（Navigation Timing）
- 页面加载性能指标
- 路由路径（routePath）

---

## 5. 资源监控 ✅

### 实现位置
- `packages/shared-core/src/utils/monitor/resource-monitor.ts`

### 埋点覆盖
- ✅ 资源加载性能（脚本、样式表、图片等）
- ✅ 资源加载错误
- ✅ 慢资源（加载时间 > 1秒）

### 上报数据
- 资源类型（type）
- 资源URL（url）
- 加载时间（loadTime）
- 资源大小（size）
- 错误信息（error）

---

## 6. 错误监控增强 ✅

### 实现位置
- `packages/shared-core/src/utils/monitor/error-monitor-enhance.ts`

### 埋点覆盖
- ✅ 运行时错误 (`reportRuntimeError`)
- ✅ API 错误 (`reportApiError`)
- ✅ 路由错误 (`reportRouteError`)
- ✅ 资源错误 (`reportResourceErrorEnhanced`)
- ✅ 性能错误 (`reportPerformanceError`)

### 上报数据
- 错误类型（errorType）
- 错误名称（name）
- 错误消息（message）
- 错误堆栈（stack）
- 错误代码（errorCode）
- 关联的路由/API/资源信息

---

## 7. 用户行为监控 ✅

### 实现位置
- `packages/shared-core/src/utils/monitor/user-behavior-monitor.ts`

### 埋点覆盖
- ✅ 点击事件（自动捕获）
- ✅ 表单提交（自动捕获）
- ✅ 自定义用户操作 (`trackUserAction`)

### 上报数据
- 操作类型（actionType）
- 操作元素（element）
- 操作值（value）
- 关联的路由信息

---

## 8. 业务指标监控 ✅

### 实现位置
- `packages/shared-core/src/utils/monitor/business-monitor.ts`

### 埋点覆盖
- ✅ 业务事件 (`trackBusinessEvent`)
- ✅ 业务指标 (`trackBusinessMetric`)

### 上报数据
- 业务事件名称（eventName）
- 业务事件分类（category）
- 业务指标值（metricValue）
- 业务指标单位（metricUnit）
- 自定义业务数据（data）

---

## 9. 系统监控 ✅

### 实现位置
- `packages/shared-core/src/utils/monitor/system-monitor.ts`

### 埋点覆盖
- ✅ 内存使用 (`reportSystemMemory`)
- ✅ 网络状态 (`reportSystemNetwork`)
- ✅ 设备信息 (`reportSystemDevice`)

### 上报数据
- 内存使用情况（memory）
- 网络连接类型（networkType）
- 设备类型（deviceType）
- 浏览器信息（browser）
- 操作系统（os）

---

## 应用集成情况

### 主应用 (main-app) ✅
- ✅ 初始化监控系统（`initMonitor`）
- ✅ 生命周期监控（bootstrap start/end）
- ✅ 路由监控（beforeEach/afterEach）
- ✅ API 监控（Axios 拦截器）

### 子应用 (system-app, finance-app, logistics-app 等) ✅
- ✅ 初始化监控系统（`initMonitor`）
- ✅ 生命周期监控（bootstrap start/end）
- ✅ 路由监控（router afterEach）
- ✅ API 监控（Axios 拦截器）

### 子应用生命周期管理 ✅
- ✅ 创建子应用（`createSubApp`）- bootstrap 监控
- ✅ 挂载子应用（`mountSubApp`）- mount 监控
- ✅ 卸载子应用（`unmountSubApp`）- unmount 监控
- ✅ 更新子应用（`updateSubApp`）- update 监控

---

## 数据上报流程

1. **收集阶段**: 各监控模块收集事件数据
2. **队列阶段**: `MonitorCollector` 将事件加入队列
3. **批量上报**: 达到 `batchSize`（默认10）或 `maxWaitTime`（默认5000ms）时触发上报
4. **转换阶段**: `transformMonitorEventToLogEntry` 将事件转换为 `LogEntry`
5. **上报阶段**: `LogReporter` 将日志批量上报到服务器

---

## 配置选项

所有应用均使用以下配置（可在各应用的 `bootstrap/index.ts` 中调整）：

```typescript
{
  appName: 'app-name',
  enableAPM: true,                    // 应用性能监控
  enableErrorTracking: true,          // 错误追踪
  enableUserBehavior: true,           // 用户行为监控
  enablePerformance: true,            // 性能监控
  enableResourceMonitoring: true,     // 资源监控
  enableBusinessTracking: true,       // 业务追踪
  enableSystemMonitoring: false,      // 系统监控（默认关闭）
  sampleRate: 1.0,                    // 采样率（1.0 = 100%）
}
```

---

## 数据查询支持

所有上报的数据都支持通过 `LogQueryParams` 进行查询，包括：

- 基础查询：appId, logLevel, loggerName, messageKeyword, timeRange
- 微前端信息：microAppType, microAppName, microAppInstanceId, microAppLifecycle
- 事件类型：eventType
- 会话和用户：sessionId, userId
- 路由查询：routePath, routeName
- API 查询：apiEndpoint, apiMethod, apiStatusCode, apiResponseTimeRange
- 错误查询：errorType, errorCode, hasError
- 性能查询：performanceRange
- 资源查询：resourceType, resourceUrl
- 用户行为查询：userActionType, userActionElement
- 业务查询：businessEventName, businessEventCategory
- 系统查询：deviceType, browser, os

---

## 总结

✅ **所有应用数据埋点已完整实现**

- ✅ 9个核心监控维度全部覆盖
- ✅ 主应用和所有子应用均已集成
- ✅ 生命周期、路由、API、性能、资源、错误、用户行为、业务、系统监控全部就绪
- ✅ 数据上报流程完整，支持批量上报和采样率控制
- ✅ 查询接口支持多维度过滤

**关键上报指标已全部覆盖，监控体系已就绪！**
