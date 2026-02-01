# 日志查询分页问题解决方案

## 问题描述

当前后端返回的是批次列表（batch list），但实际日志条数大于批次条数，导致分页统计不准确。

**示例**：
- 后端返回：20条批次记录
- 实际日志：28条（因为每个批次包含多条日志）
- `total: 28` 是实际日志总数
- `list` 只有20条批次记录

**问题**：
- 前端展开批次后得到28条日志，但分页是基于批次的（page=1, size=20）
- 用户看到的是28条日志，但分页显示的是20条批次的分页信息
- 分页统计不准确

## 解决方案

### 方案A：后端展开批次为日志（推荐）

**核心思路**：后端查询时展开批次为单条日志，返回展开后的日志列表。

#### 实现步骤

1. **查询批次**：先按查询条件过滤批次（批次级别字段：appId, timeRange）
2. **展开日志**：遍历批次，展开批次内的 `logs` 数组
3. **过滤日志**：对展开后的日志进行过滤（日志级别和 extensions 字段）
4. **分页处理**：对过滤后的日志进行分页
5. **返回结果**：返回展开后的单条日志列表

#### 后端实现逻辑

```typescript
// 伪代码示例
async function queryLogs(params: LogQueryParams) {
  const { page = 1, size = 10, keyword = {} } = params;
  
  // 1. 先查询批次（批次级别过滤）
  const batches = await queryBatches({
    appId: keyword.appId,
    timeRange: keyword.timeRange, // 批次时间戳过滤
  });
  
  // 2. 展开批次为日志
  const allLogs: ServerLogEntry[] = [];
  for (const batch of batches) {
    for (const log of batch.logs) {
      // 添加批次信息到日志（可选）
      allLogs.push({
        ...log,
        batchId: batch.id,
        batchTimestamp: batch.timestamp,
        batchCreatedAt: batch.createdAt,
      });
    }
  }
  
  // 3. 过滤日志（日志级别和 extensions 字段过滤）
  const filteredLogs = allLogs.filter(log => {
    // 日志级别过滤
    if (keyword.logLevel && log.logLevel !== keyword.logLevel) {
      return false;
    }
    
    // loggerName 过滤
    if (keyword.loggerName && log.loggerName !== keyword.loggerName) {
      return false;
    }
    
    // messageKeyword 过滤
    if (keyword.messageKeyword && !log.message.includes(keyword.messageKeyword)) {
      return false;
    }
    
    // 时间范围过滤（日志级别）
    if (keyword.timeRange) {
      const logTime = new Date(log.timestamp).getTime();
      const startTime = new Date(keyword.timeRange.startTime).getTime();
      const endTime = new Date(keyword.timeRange.endTime).getTime();
      if (logTime < startTime || logTime > endTime) {
        return false;
      }
    }
    
    // extensions 字段过滤
    if (keyword.eventType && log.extensions?.eventType !== keyword.eventType) {
      return false;
    }
    
    if (keyword.routePath && !log.extensions?.route?.routePath?.includes(keyword.routePath)) {
      return false;
    }
    
    if (keyword.apiEndpoint && !log.extensions?.api?.endpoint?.includes(keyword.apiEndpoint)) {
      return false;
    }
    
    // ... 其他 extensions 字段过滤
    
    return true;
  });
  
  // 4. 计算总数
  const total = filteredLogs.length;
  
  // 5. 分页
  const start = (page - 1) * size;
  const end = start + size;
  const paginatedLogs = filteredLogs.slice(start, end);
  
  // 6. 返回结果
  return {
    list: paginatedLogs,
    total,
    page,
    size,
  };
}
```

#### 返回格式

```json
{
  "code": 200,
  "msg": "响应成功",
  "data": {
    "list": [
      {
        "batchId": 335,
        "batchTimestamp": "2026-01-16T02:04:15.000+00:00",
        "batchCreatedAt": "2026-01-16T02:04:15.000+00:00",
        "timestamp": "2026-01-16T02:04:14.832Z",
        "logLevel": "DEBUG",
        "loggerName": "log-reporter-test",
        "microApp": {
          "microAppType": "sub",
          "microAppName": "production-app",
          "microAppInstanceId": "production-app-instance-1768529054832",
          "microAppLifecycle": "mount"
        },
        "message": "这是一条测试日志消息",
        "data": null,
        "extensions": {
          "eventType": "app:lifecycle"
        }
      },
      {
        "batchId": 335,
        "batchTimestamp": "2026-01-16T02:04:15.000+00:00",
        "batchCreatedAt": "2026-01-16T02:04:15.000+00:00",
        "timestamp": "2026-01-16T02:04:15.832Z",
        "logLevel": "INFO",
        "loggerName": "log-reporter-test",
        "microApp": {
          "microAppType": "sub",
          "microAppName": "production-app",
          "microAppInstanceId": "production-app-instance-1768529054832",
          "microAppLifecycle": "mount"
        },
        "message": "批量测试日志 1",
        "data": null,
        "extensions": {
          "eventType": "route:navigation"
        }
      }
      // ... 更多日志
    ],
    "page": 1,
    "size": 20,
    "total": 28
  }
}
```

#### 优势

- ✅ 分页统计准确：`total` 和 `list.length` 一致
- ✅ 前端处理简单：不需要展开批次
- ✅ 查询逻辑清晰：后端统一处理
- ✅ 性能可控：可以通过索引优化批次查询

#### 注意事项

1. **性能优化**：
   - 批次查询需要建立索引（appId, timestamp）
   - 日志过滤可以在内存中进行（如果数据量不大）
   - 如果数据量很大，可能需要数据库层面的日志表

2. **批次信息保留**：
   - 在展开的日志中添加 `batchId`, `batchTimestamp`, `batchCreatedAt` 字段
   - 方便前端显示批次信息

3. **查询顺序**：
   - 先按批次级别字段过滤批次（减少数据量）
   - 再展开批次为日志
   - 最后按日志级别和 extensions 字段过滤

---

### 方案B：前端处理（不推荐）

如果后端无法修改，前端可以处理，但需要调整分页逻辑：

1. **前端展开批次**：将批次展开为单条日志
2. **前端分页**：对展开后的日志进行前端分页
3. **问题**：需要一次性加载所有批次，性能差

**不推荐原因**：
- 需要加载所有批次数据，内存占用大
- 前端分页性能差
- 无法利用数据库索引

---

### 方案C：混合方案（折中）

后端返回两个字段：
- `batches`: 批次列表（用于分页）
- `logs`: 展开后的日志列表（用于显示）
- `total`: 实际日志总数

**问题**：
- 数据结构复杂
- 前端需要处理两套数据

---

## 推荐方案

**推荐使用方案A**：后端展开批次为日志，返回展开后的日志列表。

### 实现要点

1. **查询批次**：先按批次级别字段（appId, timeRange）过滤批次
2. **展开日志**：遍历批次，展开 `logs` 数组
3. **过滤日志**：按日志级别和 extensions 字段过滤
4. **分页处理**：对过滤后的日志进行分页
5. **返回格式**：返回展开后的单条日志列表，包含批次信息（batchId, batchTimestamp）

### 前端调整

前端不再需要展开批次，直接使用返回的日志列表：

```typescript
// 修改前：需要展开批次
const expandedList: any[] = [];
for (const batch of data.list || []) {
  for (const log of batch.logs) {
    expandedList.push({ ...log, batchId: batch.id });
  }
}

// 修改后：直接使用返回的日志列表
const logs = data.list || [];
```

### 后端接口调整

后端需要修改查询接口，返回展开后的日志列表，而不是批次列表。

---

## 总结

**问题**：批次分页 vs 日志分页不一致

**解决方案**：后端展开批次为日志，返回展开后的日志列表，分页基于日志条数

**优势**：
- 分页统计准确
- 前端处理简单
- 查询逻辑清晰
- 性能可控
