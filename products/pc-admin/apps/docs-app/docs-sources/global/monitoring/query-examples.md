# 监控查询字段使用示例

本文档展示各个查询字段在实际监控场景中的使用示例，帮助判断字段的必要性。

## 一、核心查询场景（高频使用）

### 场景1：排查 API 性能问题
**问题**：用户反馈订单列表加载很慢，需要找出慢接口

```typescript
{
  appId: 'btc-shopflow-admin-app',
  eventType: 'api:request,api:response',  // 只查询 API 相关事件
  apiEndpoint: '/api/order/list',          // 特定接口
  apiResponseTimeRange: {                  // 响应时间超过 2 秒的
    min: 2000
  },
  timeRange: {
    startTime: '2026-01-15T10:00:00.000Z',
    endTime: '2026-01-15T11:00:00.000Z'
  }
}
```

**必要性**：⭐⭐⭐⭐⭐ 必需
- `eventType`: 区分 API 事件和其他事件
- `apiEndpoint`: 精确定位问题接口
- `apiResponseTimeRange`: 找出慢接口

---

### 场景2：排查页面加载性能问题
**问题**：首页加载慢，需要分析页面性能指标

```typescript
{
  appId: 'btc-shopflow-admin-app',
  eventType: 'performance:page',           // 页面性能事件
  routePath: '/dashboard',                 // 特定页面
  performanceRange: {                      // LCP 超过 2.5 秒的
    lcp: { min: 2500 }
  },
  timeRange: {
    startTime: '2026-01-15T10:00:00.000Z',
    endTime: '2026-01-15T11:00:00.000Z'
  }
}
```

**必要性**：⭐⭐⭐⭐⭐ 必需
- `eventType`: 区分性能事件
- `routePath`: 定位具体页面
- `performanceRange`: 找出性能差的页面

---

### 场景3：排查错误问题
**问题**：生产环境频繁报错，需要找出错误原因

```typescript
{
  appId: 'btc-shopflow-admin-app',
  eventType: 'error:runtime,error:api',   // 所有错误事件
  hasError: true,                          // 只查询有错误的
  errorType: 'api',                        // API 错误
  apiStatusCode: 500,                      // 500 错误
  timeRange: {
    startTime: '2026-01-15T10:00:00.000Z',
    endTime: '2026-01-15T11:00:00.000Z'
  }
}
```

**必要性**：⭐⭐⭐⭐⭐ 必需
- `eventType`: 区分错误类型
- `hasError`: 快速过滤错误
- `errorType`: 区分运行时错误和 API 错误
- `apiStatusCode`: 定位 HTTP 错误

---

## 二、业务分析场景（中频使用）

### 场景4：分析用户行为路径
**问题**：分析用户从首页到下单的完整路径

```typescript
{
  appId: 'btc-shopflow-admin-app',
  eventType: 'route:navigation,user:action', // 路由和用户操作
  userId: 'user-12345',                     // 特定用户
  sessionId: 'session-abc123',              // 特定会话
  routePath: '/order/create',               // 订单创建页面
  userActionType: 'click,submit',           // 点击和提交操作
  timeRange: {
    startTime: '2026-01-15T10:00:00.000Z',
    endTime: '2026-01-15T11:00:00.000Z'
  }
}
```

**必要性**：
- `userId`: ⭐⭐⭐⭐ 必需（用户行为分析）
- `sessionId`: ⭐⭐⭐ 有用（会话追踪）
- `routePath`: ⭐⭐⭐⭐⭐ 必需（页面分析）
- `userActionType`: ⭐⭐⭐⭐ 必需（操作分析）

---

### 场景5：业务转化漏斗分析
**问题**：分析订单创建到支付的转化率

```typescript
{
  appId: 'btc-shopflow-admin-app',
  eventType: 'business:event',             // 业务事件
  businessEventName: 'order:create,order:pay', // 订单创建和支付
  businessEventCategory: 'order',           // 订单类业务
  timeRange: {
    startTime: '2026-01-15T00:00:00.000Z',
    endTime: '2026-01-15T23:59:59.000Z'
  }
}
```

**必要性**：
- `businessEventName`: ⭐⭐⭐⭐⭐ 必需（业务分析核心）
- `businessEventCategory`: ⭐⭐⭐⭐ 有用（业务分类）

---

### 场景6：设备兼容性问题排查
**问题**：移动端用户反馈页面显示异常

```typescript
{
  appId: 'btc-shopflow-mobile-app',
  eventType: 'error:runtime',              // 运行时错误
  deviceType: 'mobile',                    // 移动设备
  browser: 'Safari',                       // Safari 浏览器
  os: 'iOS',                               // iOS 系统
  hasError: true,
  timeRange: {
    startTime: '2026-01-15T10:00:00.000Z',
    endTime: '2026-01-15T11:00:00.000Z'
  }
}
```

**必要性**：
- `deviceType`: ⭐⭐⭐⭐ 必需（设备兼容性）
- `browser`: ⭐⭐⭐ 有用（浏览器兼容性）
- `os`: ⭐⭐⭐ 有用（系统兼容性）

---

## 三、运维监控场景（低频但重要）

### 场景7：应用启动性能监控
**问题**：监控应用启动时间，优化启动性能

```typescript
{
  appId: 'btc-shopflow-admin-app',
  eventType: 'app:lifecycle',              // 应用生命周期
  microAppLifecycle: 'mount',              // 应用挂载
  performanceRange: {                      // 启动时间超过 3 秒
    duration: { min: 3000 }
  },
  timeRange: {
    startTime: '2026-01-15T00:00:00.000Z',
    endTime: '2026-01-15T23:59:59.000Z'
  }
}
```

**必要性**：
- `eventType`: ⭐⭐⭐⭐⭐ 必需
- `microAppLifecycle`: ⭐⭐⭐⭐ 有用（已有字段）
- `performanceRange`: ⭐⭐⭐⭐⭐ 必需

---

### 场景8：资源加载问题排查
**问题**：某些资源加载失败，影响页面功能

```typescript
{
  appId: 'btc-shopflow-admin-app',
  eventType: 'performance:resource',        // 资源性能事件
  resourceType: 'script',                   // JS 资源
  resourceUrl: '/static/js/vendor',        // 特定资源路径
  hasError: true,                          // 加载失败的
  timeRange: {
    startTime: '2026-01-15T10:00:00.000Z',
    endTime: '2026-01-15T11:00:00.000Z'
  }
}
```

**必要性**：
- `resourceType`: ⭐⭐⭐⭐ 必需（资源分类）
- `resourceUrl`: ⭐⭐⭐ 有用（资源定位，可能用 messageKeyword 替代）

---

### 场景9：路由切换性能分析
**问题**：路由切换卡顿，需要找出慢路由

```typescript
{
  appId: 'btc-shopflow-admin-app',
  eventType: 'route:navigation',           // 路由导航事件
  routePath: '/order',                      // 订单相关路由
  performanceRange: {                      // 切换时间超过 500ms
    duration: { min: 500 }
  },
  timeRange: {
    startTime: '2026-01-15T10:00:00.000Z',
    endTime: '2026-01-15T11:00:00.000Z'
  }
}
```

**必要性**：
- `routePath`: ⭐⭐⭐⭐⭐ 必需
- `routeName`: ⭐⭐ 可选（可能用 routePath 替代）

---

## 四、字段必要性评估总结

### ⭐⭐⭐⭐⭐ 必需字段（核心功能）

1. **eventType** - 事件类型区分，所有查询的基础
2. **apiEndpoint** - API 问题排查必需
3. **apiResponseTimeRange** - 性能分析必需
4. **routePath** - 页面分析必需
5. **performanceRange** - 性能分析必需
6. **hasError** - 错误排查必需
7. **errorType** - 错误分类必需
8. **businessEventName** - 业务分析必需

### ⭐⭐⭐⭐ 重要字段（常用功能）

1. **userId** - 用户行为分析
2. **apiMethod** - API 方法过滤
3. **apiStatusCode** - HTTP 状态码过滤
4. **resourceType** - 资源类型分类
5. **userActionType** - 用户操作分析
6. **businessEventCategory** - 业务分类
7. **deviceType** - 设备兼容性

### ⭐⭐⭐ 有用字段（特定场景）

1. **sessionId** - 会话追踪（可替代：用 userId + timeRange）
2. **routeName** - 路由名称（可替代：用 routePath）
3. **resourceUrl** - 资源 URL（可替代：用 messageKeyword）
4. **userActionElement** - 操作元素（可替代：用 messageKeyword）
5. **browser** - 浏览器（可替代：用 deviceType）
6. **os** - 操作系统（可替代：用 deviceType）
7. **errorCode** - 错误代码（可替代：用 errorType + messageKeyword）

### ⭐⭐ 可选字段（低频使用）

1. **microAppInstanceId** - 微前端实例（已有 microAppName）
2. **apiMethod** - 如果后端支持，可以合并到 apiEndpoint 查询

---

## 五、简化建议

### 方案A：保留核心字段（推荐）

```typescript
interface LogQueryParams {
  // 基础查询（必需）
  appId?: string;
  logLevel?: string;
  loggerName?: string;
  messageKeyword?: string;
  timeRange?: { startTime: string; endTime: string };
  
  // 微前端信息（已有）
  microAppType?: string;
  microAppName?: string;
  microAppLifecycle?: string;
  
  // 事件类型（必需）
  eventType?: string;
  
  // 用户和会话（重要）
  userId?: string;
  sessionId?: string;  // 可选，但有用
  
  // 路由查询（必需）
  routePath?: string;
  
  // API 查询（必需）
  apiEndpoint?: string;
  apiMethod?: string;        // 可选
  apiStatusCode?: number;
  apiResponseTimeRange?: { min?: number; max?: number };
  
  // 错误查询（必需）
  errorType?: string;
  hasError?: boolean;
  
  // 性能查询（必需）
  performanceRange?: {
    duration?: { min?: number; max?: number };
    fcp?: { min?: number; max?: number };
    lcp?: { min?: number; max?: number };
    ttfb?: { min?: number; max?: number };
  };
  
  // 资源查询（重要）
  resourceType?: string;
  
  // 用户行为查询（重要）
  userActionType?: string;
  
  // 业务查询（必需）
  businessEventName?: string;
  businessEventCategory?: string;
  
  // 系统查询（重要）
  deviceType?: string;
  
  // 向后兼容
  action?: string;
}
```

### 方案B：最简方案（如果后端查询性能有限）

可以去掉以下字段，用 `messageKeyword` 替代：
- `routeName` → 用 `routePath` 或 `messageKeyword`
- `resourceUrl` → 用 `messageKeyword`
- `userActionElement` → 用 `messageKeyword`
- `browser`, `os` → 用 `deviceType` 或 `messageKeyword`
- `errorCode` → 用 `errorType` + `messageKeyword`

---

## 六、实际使用频率预估

| 字段 | 使用频率 | 优先级 |
|------|---------|--------|
| eventType | 90% | P0 |
| apiEndpoint | 70% | P0 |
| apiResponseTimeRange | 60% | P0 |
| routePath | 65% | P0 |
| performanceRange | 55% | P0 |
| hasError | 50% | P0 |
| errorType | 45% | P0 |
| businessEventName | 40% | P0 |
| userId | 35% | P1 |
| apiStatusCode | 30% | P1 |
| deviceType | 25% | P1 |
| resourceType | 20% | P1 |
| userActionType | 20% | P1 |
| sessionId | 15% | P2 |
| routeName | 10% | P2 |
| browser/os | 10% | P2 |

**建议**：优先实现 P0 字段，P1 字段根据开发资源决定，P2 字段可以后续迭代。
