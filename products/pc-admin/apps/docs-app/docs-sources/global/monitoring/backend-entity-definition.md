# 后端实体定义指南

## 一、核心问题

前端上报的 JSON 结构中，每条日志的 `extensions` 和 `data` 字段结构都不同，这取决于 `eventType`。例如：
- `app:lifecycle` 事件包含 `performance` 和 `system` 字段
- `route:navigation` 事件包含 `route` 和 `performance` 字段
- `api:request` 事件包含 `api` 和 `performance` 字段
- `error:api` 事件包含 `error`、`api` 和 `data` 字段

## 二、解决方案

### 方案一：使用 JSON/JSONB 类型存储（推荐）

这是最灵活的方案，适合关系型数据库（PostgreSQL、MySQL 5.7+）和 NoSQL 数据库。

#### 2.1 数据库表结构设计

**PostgreSQL 示例**：

```sql
-- 日志批次表
CREATE TABLE log_batches (
    id BIGSERIAL PRIMARY KEY,
    app_id VARCHAR(255) NOT NULL,
    app_name VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- 索引
    INDEX idx_log_batches_app_id (app_id),
    INDEX idx_log_batches_app_name (app_name),
    INDEX idx_log_batches_timestamp (timestamp),
    INDEX idx_log_batches_created_at (created_at)
);

-- 日志条目表
CREATE TABLE log_entries (
    id BIGSERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL REFERENCES log_batches(id) ON DELETE CASCADE,
    
    -- 基础字段（固定结构）
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    log_level VARCHAR(20) NOT NULL,  -- INFO, ERROR, WARN, DEBUG
    logger_name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    
    -- 微应用信息（JSONB，固定结构）
    micro_app JSONB NOT NULL,
    
    -- 灵活字段（JSONB，根据 eventType 动态变化）
    data JSONB,  -- 错误信息等（可为 null）
    extensions JSONB,  -- 扩展信息（可为 null）
    
    -- 从 extensions 中提取的常用字段（用于索引和查询）
    event_type VARCHAR(50) GENERATED ALWAYS AS (extensions->>'eventType') STORED,
    session_id VARCHAR(255) GENERATED ALWAYS AS (extensions->>'sessionId') STORED,
    user_id VARCHAR(255) GENERATED ALWAYS AS (extensions->>'userId') STORED,
    
    -- 索引
    INDEX idx_log_entries_batch_id (batch_id),
    INDEX idx_log_entries_timestamp (timestamp),
    INDEX idx_log_entries_log_level (log_level),
    INDEX idx_log_entries_logger_name (logger_name),
    INDEX idx_log_entries_event_type (event_type),
    INDEX idx_log_entries_session_id (session_id),
    INDEX idx_log_entries_user_id (user_id),
    
    -- JSONB 索引（用于查询 extensions 中的字段）
    INDEX idx_log_entries_extensions_route USING GIN (extensions jsonb_path_ops),
    INDEX idx_log_entries_extensions_api USING GIN (extensions jsonb_path_ops),
    INDEX idx_log_entries_extensions_error USING GIN (extensions jsonb_path_ops),
    INDEX idx_log_entries_extensions_performance USING GIN (extensions jsonb_path_ops)
);
```

**MySQL 8.0+ 示例**：

```sql
-- 日志批次表
CREATE TABLE log_batches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    app_id VARCHAR(255) NOT NULL,
    app_name VARCHAR(100) NOT NULL,
    timestamp DATETIME(3) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    INDEX idx_app_id (app_id),
    INDEX idx_app_name (app_name),
    INDEX idx_timestamp (timestamp),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 日志条目表
CREATE TABLE log_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    batch_id BIGINT NOT NULL,
    
    -- 基础字段
    timestamp DATETIME(3) NOT NULL,
    log_level VARCHAR(20) NOT NULL,
    logger_name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    
    -- 微应用信息（JSON）
    micro_app JSON NOT NULL,
    
    -- 灵活字段（JSON）
    data JSON,
    extensions JSON,
    
    -- 从 extensions 中提取的字段（用于索引）
    event_type VARCHAR(50) GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(extensions, '$.eventType'))) STORED,
    session_id VARCHAR(255) GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(extensions, '$.sessionId'))) STORED,
    user_id VARCHAR(255) GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(extensions, '$.userId'))) STORED,
    
    -- 外键
    FOREIGN KEY (batch_id) REFERENCES log_batches(id) ON DELETE CASCADE,
    
    -- 索引
    INDEX idx_batch_id (batch_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_log_level (log_level),
    INDEX idx_logger_name (logger_name),
    INDEX idx_event_type (event_type),
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    
    -- JSON 索引（MySQL 8.0+ 支持）
    INDEX idx_extensions_route ((CAST(extensions->'$.route' AS CHAR(255)))),
    INDEX idx_extensions_api ((CAST(extensions->'$.api' AS CHAR(255))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 2.2 后端实体定义（TypeScript/Node.js）

```typescript
/**
 * 微应用信息（固定结构）
 */
export interface MicroAppInfo {
  microAppType: 'sub' | 'main';
  microAppName: string;
  microAppInstanceId: string;
  microAppLifecycle: string;
}

/**
 * 日志条目实体（数据库模型）
 */
export interface LogEntryEntity {
  id?: number;  // 数据库生成
  batchId: number;
  
  // 基础字段（固定结构）
  timestamp: Date | string;
  logLevel: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';
  loggerName: string;
  message: string;
  
  // 微应用信息（JSON/JSONB，固定结构）
  microApp: MicroAppInfo;
  
  // 灵活字段（JSON/JSONB，动态结构）
  data: any | null;  // 根据 eventType 不同而不同
  extensions: any | null;  // 根据 eventType 不同而不同
  
  // 生成的字段（从 extensions 提取，用于索引）
  eventType?: string;
  sessionId?: string;
  userId?: string;
}

/**
 * 日志批次实体（数据库模型）
 */
export interface LogBatchEntity {
  id?: number;  // 数据库生成
  appId: string;
  appName: string;
  timestamp: Date | string;
  createdAt?: Date | string;  // 数据库生成
}

/**
 * 上报请求 DTO（前端 -> 后端）
 */
export interface LogBatchRequestDTO {
  appId: string;
  appName: string;
  timestamp: string;  // ISO 8601
  logs: LogEntryRequestDTO[];
}

/**
 * 单条日志上报 DTO
 */
export interface LogEntryRequestDTO {
  timestamp: string;  // ISO 8601
  logLevel: string;
  loggerName: string;
  microApp: MicroAppInfo;
  message: string;
  data: any | null;
  extensions: any | null;  // 灵活结构
}
```

#### 2.3 后端实体定义（Java/Spring Boot）

```java
package com.btc.monitor.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 日志批次实体
 */
@Entity
@Table(name = "log_batches", indexes = {
    @Index(name = "idx_app_id", columnList = "appId"),
    @Index(name = "idx_app_name", columnList = "appName"),
    @Index(name = "idx_timestamp", columnList = "timestamp")
})
@Data
public class LogBatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 255)
    private String appId;
    
    @Column(nullable = false, length = 100)
    private String appName;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LogEntry> logs = new ArrayList<>();
}

/**
 * 日志条目实体
 */
@Entity
@Table(name = "log_entries", indexes = {
    @Index(name = "idx_batch_id", columnList = "batchId"),
    @Index(name = "idx_timestamp", columnList = "timestamp"),
    @Index(name = "idx_log_level", columnList = "logLevel"),
    @Index(name = "idx_event_type", columnList = "eventType"),
    @Index(name = "idx_session_id", columnList = "sessionId")
})
@Data
public class LogEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private LogBatch batch;
    
    // 基础字段
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private LogLevel logLevel;
    
    @Column(nullable = false, length = 100)
    private String loggerName;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    
    // 微应用信息（JSON）
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "JSON")
    private MicroAppInfo microApp;
    
    // 灵活字段（JSON）
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private Map<String, Object> data;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private Map<String, Object> extensions;
    
    // 生成的字段（从 extensions 提取）
    @Column(length = 50)
    private String eventType;
    
    @Column(length = 255)
    private String sessionId;
    
    @Column(length = 255)
    private String userId;
}

/**
 * 微应用信息（固定结构）
 */
@Data
@Embeddable
public class MicroAppInfo {
    private String microAppType;
    private String microAppName;
    private String microAppInstanceId;
    private String microAppLifecycle;
}

/**
 * 日志级别枚举
 */
public enum LogLevel {
    INFO, ERROR, WARN, DEBUG
}

/**
 * 上报请求 DTO
 */
@Data
public class LogBatchRequestDTO {
    private String appId;
    private String appName;
    private String timestamp;
    private List<LogEntryRequestDTO> logs;
}

/**
 * 单条日志上报 DTO
 */
@Data
public class LogEntryRequestDTO {
    private String timestamp;
    private String logLevel;
    private String loggerName;
    private MicroAppInfo microApp;
    private String message;
    private Map<String, Object> data;
    private Map<String, Object> extensions;
}
```

#### 2.4 后端实体定义（Go/GORM）

```go
package entity

import (
    "time"
    "database/sql/driver"
    "encoding/json"
    "gorm.io/datatypes"
)

// LogBatch 日志批次实体
type LogBatch struct {
    ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
    AppID     string    `gorm:"type:varchar(255);not null;index:idx_app_id" json:"appId"`
    AppName   string    `gorm:"type:varchar(100);not null;index:idx_app_name" json:"appName"`
    Timestamp time.Time `gorm:"type:timestamp;not null;index:idx_timestamp" json:"timestamp"`
    CreatedAt time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP" json:"createdAt"`
    
    Logs      []LogEntry `gorm:"foreignKey:BatchID;constraint:OnDelete:CASCADE" json:"logs"`
}

// LogEntry 日志条目实体
type LogEntry struct {
    ID         uint           `gorm:"primaryKey;autoIncrement" json:"id"`
    BatchID    uint           `gorm:"not null;index:idx_batch_id" json:"batchId"`
    
    // 基础字段
    Timestamp  time.Time      `gorm:"type:timestamp;not null;index:idx_timestamp" json:"timestamp"`
    LogLevel   string         `gorm:"type:varchar(20);not null;index:idx_log_level" json:"logLevel"`
    LoggerName string         `gorm:"type:varchar(100);not null;index:idx_logger_name" json:"loggerName"`
    Message    string         `gorm:"type:text;not null" json:"message"`
    
    // 微应用信息（JSON）
    MicroApp   datatypes.JSON `gorm:"type:json;not null" json:"microApp"`
    
    // 灵活字段（JSON）
    Data       datatypes.JSON `gorm:"type:json" json:"data"`
    Extensions datatypes.JSON `gorm:"type:json;index:idx_extensions,type:gin" json:"extensions"`
    
    // 生成的字段（从 extensions 提取）
    EventType  string         `gorm:"type:varchar(50);index:idx_event_type" json:"eventType"`
    SessionID  string         `gorm:"type:varchar(255);index:idx_session_id" json:"sessionId"`
    UserID     string         `gorm:"type:varchar(255);index:idx_user_id" json:"userId"`
    
    // 关联
    Batch      LogBatch       `gorm:"foreignKey:BatchID" json:"-"`
}

// MicroAppInfo 微应用信息（固定结构）
type MicroAppInfo struct {
    MicroAppType        string `json:"microAppType"`
    MicroAppName        string `json:"microAppName"`
    MicroAppInstanceID  string `json:"microAppInstanceId"`
    MicroAppLifecycle   string `json:"microAppLifecycle"`
}

// LogBatchRequestDTO 上报请求 DTO
type LogBatchRequestDTO struct {
    AppID     string              `json:"appId"`
    AppName   string              `json:"appName"`
    Timestamp string              `json:"timestamp"`
    Logs      []LogEntryRequestDTO `json:"logs"`
}

// LogEntryRequestDTO 单条日志上报 DTO
type LogEntryRequestDTO struct {
    Timestamp  string                 `json:"timestamp"`
    LogLevel   string                 `json:"logLevel"`
    LoggerName string                 `json:"loggerName"`
    MicroApp   MicroAppInfo           `json:"microApp"`
    Message    string                 `json:"message"`
    Data       map[string]interface{} `json:"data"`
    Extensions map[string]interface{} `json:"extensions"`
}
```

## 三、关键设计要点

### 3.1 为什么使用 JSON/JSONB？

1. **灵活性**：`extensions` 和 `data` 字段结构根据 `eventType` 动态变化
2. **可扩展性**：新增事件类型不需要修改表结构
3. **性能**：JSONB（PostgreSQL）支持索引和高效查询
4. **完整性**：保留完整的原始数据结构

### 3.2 生成的字段（Generated Columns）

为了支持高效查询，从 `extensions` 中提取常用字段作为生成列：

- `eventType`：事件类型（用于分类查询）
- `sessionId`：会话ID（用于会话追踪）
- `userId`：用户ID（用于用户行为分析）

这些字段在插入时自动从 `extensions` 中提取，无需手动维护。

### 3.3 索引策略

1. **固定字段索引**：`timestamp`、`logLevel`、`loggerName` 等
2. **生成字段索引**：`eventType`、`sessionId`、`userId`
3. **JSONB 索引**（PostgreSQL）：
   - GIN 索引：支持 JSON 路径查询
   - 表达式索引：针对特定路径（如 `extensions->>'route.routePath'`）

### 3.4 查询示例

**PostgreSQL 查询示例**：

```sql
-- 查询特定事件类型
SELECT * FROM log_entries 
WHERE event_type = 'api:request' 
  AND timestamp >= '2026-01-16 00:00:00';

-- 查询特定路由的日志
SELECT * FROM log_entries 
WHERE extensions->'route'->>'routePath' = '/order/list';

-- 查询 API 响应时间超过阈值的请求
SELECT * FROM log_entries 
WHERE event_type = 'api:request'
  AND (extensions->'api'->>'responseTime')::int > 5000;

-- 查询特定用户的错误日志
SELECT * FROM log_entries 
WHERE user_id = 'user-12345'
  AND log_level = 'ERROR';
```

## 四、数据转换逻辑

### 4.1 接收上报数据

```typescript
// 后端接收处理示例（TypeScript）
async function receiveLogBatch(request: LogBatchRequestDTO): Promise<LogBatchEntity> {
  // 1. 创建批次
  const batch = await logBatchRepository.create({
    appId: request.appId,
    appName: request.appName,
    timestamp: new Date(request.timestamp),
  });
  
  // 2. 批量插入日志条目
  const logEntries = request.logs.map(log => ({
    batchId: batch.id,
    timestamp: new Date(log.timestamp),
    logLevel: log.logLevel,
    loggerName: log.loggerName,
    message: log.message,
    microApp: log.microApp,  // JSON 自动序列化
    data: log.data,  // JSON 自动序列化
    extensions: log.extensions,  // JSON 自动序列化
    // 生成的字段会自动从 extensions 中提取
  }));
  
  await logEntryRepository.bulkCreate(logEntries);
  
  return batch;
}
```

### 4.2 数据验证

```typescript
// 验证 extensions 结构
function validateExtensions(extensions: any, eventType: string): boolean {
  if (!extensions || !extensions.eventType) {
    return false;
  }
  
  // 验证 eventType 是否匹配
  if (extensions.eventType !== eventType) {
    return false;
  }
  
  // 根据 eventType 验证必需字段
  switch (eventType) {
    case 'api:request':
      return !!extensions.api;
    case 'route:navigation':
      return !!extensions.route;
    case 'error:runtime':
      return !!extensions.error;
    // ... 其他类型
    default:
      return true;  // 允许未知类型（扩展性）
  }
}
```

## 五、总结

### 5.1 核心设计原则

1. **固定字段 + 灵活字段**：
   - 固定字段：`timestamp`、`logLevel`、`loggerName`、`message`、`microApp`
   - 灵活字段：`data`、`extensions`（使用 JSON/JSONB）

2. **生成字段优化查询**：
   - 从 `extensions` 提取常用字段作为生成列
   - 支持高效索引和查询

3. **索引策略**：
   - 固定字段：B-tree 索引
   - JSONB 字段：GIN 索引（PostgreSQL）
   - 生成字段：B-tree 索引

### 5.2 数据库选择建议

1. **PostgreSQL**（推荐）：
   - JSONB 类型性能优秀
   - 支持 GIN 索引
   - 支持 JSON 路径查询
   - 支持生成列

2. **MySQL 8.0+**：
   - JSON 类型支持
   - 支持生成列
   - JSON 路径查询

3. **MongoDB**（NoSQL）：
   - 原生支持灵活结构
   - 无需 JSON 转换
   - 适合大量写入场景

### 5.3 注意事项

1. **数据验证**：在接收数据时验证 `extensions` 结构
2. **性能优化**：合理使用索引，避免全表扫描
3. **数据迁移**：如果未来需要修改结构，JSON 字段更容易迁移
4. **查询性能**：复杂查询可能需要额外的索引或物化视图
