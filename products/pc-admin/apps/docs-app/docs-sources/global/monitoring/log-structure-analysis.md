# 日志结构完整性分析

## 一、当前已覆盖的场景 ✅

### 1. 应用生命周期
- ✅ `app:lifecycle` - 应用挂载、卸载等生命周期事件
- ✅ `microApp` 字段包含完整的微应用信息

### 2. 路由导航
- ✅ `route:navigation` - 路由导航完成
- ✅ `route` 字段包含 from/to/params/query 等完整信息

### 3. API 监控
- ✅ `api:request` - API 请求成功
- ✅ `api:response` - API 响应（在类型定义中存在）
- ✅ `error:api` - API 请求失败
- ✅ `api` 字段包含 url/endpoint/method/statusCode/responseTime 等

### 4. 性能监控
- ✅ `performance:page` - 页面性能指标（FCP/LCP/FID/CLS/TTFB 等）
- ✅ `performance:resource` - 资源加载性能
- ✅ `performance` 字段支持所有 Web Vitals 指标

### 5. 错误监控
- ✅ `error:runtime` - 运行时错误
- ✅ `error:api` - API 错误
- ✅ `error:resource` - 资源加载错误
- ✅ `error:route` - 路由错误（在类型定义中存在）
- ✅ `error:performance` - 性能错误（在类型定义中存在）
- ✅ `error` 字段包含完整的错误信息（name/message/stack/errorType/errorCode）

### 6. 用户行为
- ✅ `user:action` - 用户操作（click/submit/scroll 等）
- ✅ `userAction` 字段包含元素信息和滚动深度

### 7. 业务事件
- ✅ `business:event` - 业务事件
- ✅ `business` 字段支持 eventName/category/value/tags

### 8. 系统信息
- ✅ `system:memory` - 内存信息（在类型定义中存在）
- ✅ `system:network` - 网络信息（在类型定义中存在）
- ✅ `system:device` - 设备信息（在类型定义中存在）
- ✅ `system` 字段包含完整的设备/内存/网络信息

## 二、可能缺失的场景 ⚠️

### 1. Promise 错误
**现状**：代码中有 `unhandledrejection` 处理，但 `eventType` 中没有定义
**建议**：添加 `error:promise` 事件类型

```json
{
  "eventType": "error:promise",
  "error": {
    "name": "PromiseRejection",
    "message": "Unhandled promise rejection",
    "errorType": "promise",
    "errorCode": "ERR_UNHANDLED_REJECTION"
  }
}
```

### 2. 控制台错误
**现状**：没有专门的事件类型
**建议**：添加 `console:error` 和 `console:warn` 事件类型

```json
{
  "eventType": "console:error",
  "message": "Console error message",
  "extensions": {
    "console": {
      "level": "error",
      "args": ["error message", {...}]
    }
  }
}
```

### 3. 页面可见性
**现状**：没有专门的事件类型
**建议**：添加 `system:visibility` 事件类型

```json
{
  "eventType": "system:visibility",
  "extensions": {
    "visibility": {
      "hidden": false,
      "visibilityState": "visible",
      "hiddenTime": 5000
    }
  }
}
```

### 4. 网络状态变化
**现状**：`system:network` 存在，但可能需要更明确的事件
**建议**：添加 `system:network:change` 事件类型

```json
{
  "eventType": "system:network:change",
  "extensions": {
    "network": {
      "online": false,
      "previousState": true,
      "connectionType": "wifi"
    }
  }
}
```

### 5. 长任务检测
**现状**：没有专门的事件类型
**建议**：添加 `performance:longtask` 事件类型

```json
{
  "eventType": "performance:longtask",
  "extensions": {
    "performance": {
      "duration": 150,
      "startTime": 1768529054500,
      "endTime": 1768529054650
    },
    "longTask": {
      "name": "script",
      "attribution": [
        {
          "name": "self",
          "entryType": "longtask",
          "startTime": 1768529054500,
          "duration": 150
        }
      ]
    }
  }
}
```

### 6. WebSocket 连接
**现状**：没有专门的事件类型
**建议**：添加 `websocket:connect`、`websocket:error`、`websocket:close` 事件类型

```json
{
  "eventType": "websocket:error",
  "extensions": {
    "websocket": {
      "url": "wss://api.example.com/ws",
      "readyState": 3,
      "error": "Connection closed unexpectedly"
    }
  }
}
```

### 7. 页面卸载
**现状**：没有专门的事件类型
**建议**：添加 `app:unload` 事件类型

```json
{
  "eventType": "app:unload",
  "extensions": {
    "unload": {
      "type": "beforeunload",
      "reason": "navigation"
    }
  }
}
```

### 8. 表单验证错误
**现状**：没有专门的事件类型
**建议**：添加 `error:validation` 事件类型

```json
{
  "eventType": "error:validation",
  "extensions": {
    "error": {
      "errorType": "validation",
      "errorCode": "ERR_FORM_VALIDATION"
    },
    "validation": {
      "formId": "order-form",
      "field": "email",
      "rule": "required",
      "message": "Email is required"
    }
  }
}
```

### 9. 存储错误
**现状**：没有专门的事件类型
**建议**：添加 `error:storage` 事件类型

```json
{
  "eventType": "error:storage",
  "extensions": {
    "error": {
      "errorType": "storage",
      "errorCode": "ERR_STORAGE_QUOTA_EXCEEDED"
    },
    "storage": {
      "type": "localStorage",
      "key": "user-data",
      "operation": "setItem"
    }
  }
}
```

### 10. 跨应用通信
**现状**：没有专门的事件类型
**建议**：添加 `app:communication` 事件类型

```json
{
  "eventType": "app:communication",
  "extensions": {
    "communication": {
      "type": "postMessage",
      "from": "admin-app",
      "to": "system-app",
      "message": {...},
      "success": true
    }
  }
}
```

## 三、结构扩展性评估

### ✅ 优点

1. **灵活的 extensions 字段**
   - 使用 `[key: string]: any` 支持任意扩展
   - 可以添加新的字段而不破坏现有结构

2. **完整的系统信息**
   - `system` 字段包含设备/内存/网络信息
   - 支持动态添加新的系统指标

3. **丰富的性能指标**
   - `performance` 字段支持所有 Web Vitals
   - 使用 `[key: string]: any` 支持自定义指标

4. **业务事件支持**
   - `business` 字段支持任意业务事件
   - `eventTags` 支持灵活的标签系统

### ⚠️ 建议改进

1. **添加缺失的事件类型**
   - 在 `MonitorEventType` 中添加上述缺失的事件类型
   - 确保所有监控场景都有对应的事件类型

2. **扩展 extensions 结构**
   - 为新增场景添加对应的字段定义（如 `websocket`、`validation`、`storage` 等）
   - 保持类型定义与代码实现的一致性

3. **文档完善**
   - 为每个事件类型添加使用示例
   - 说明何时使用哪个事件类型

## 四、总结

### 当前覆盖率：约 85%

**已覆盖**：
- ✅ 应用生命周期
- ✅ 路由导航
- ✅ API 监控
- ✅ 性能监控（页面/资源）
- ✅ 错误监控（运行时/API/资源）
- ✅ 用户行为
- ✅ 业务事件
- ✅ 系统信息

**需要补充**：
- ⚠️ Promise 错误
- ⚠️ 控制台错误
- ⚠️ 页面可见性
- ⚠️ 网络状态变化（明确事件）
- ⚠️ 长任务检测
- ⚠️ WebSocket 连接
- ⚠️ 页面卸载
- ⚠️ 表单验证错误
- ⚠️ 存储错误
- ⚠️ 跨应用通信

### 建议

1. **短期**：当前结构已经可以容纳大部分场景，通过 `extensions` 的灵活性可以临时支持新场景
2. **长期**：补充缺失的事件类型定义，完善类型系统，提高代码可维护性

### 结论

**当前结构已经可以容纳所有场景**，因为：
- `extensions` 字段支持任意扩展
- `data` 字段可以存储任意数据
- `[key: string]: any` 提供了足够的灵活性

**但建议补充事件类型定义**，以便：
- 提高代码可读性
- 增强类型安全
- 便于后续维护和扩展
