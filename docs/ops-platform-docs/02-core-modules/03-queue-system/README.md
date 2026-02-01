# 任务调度与队列系统

> **任务编号**: OP-003  
> **优先级**: P0  
> **预估工时**: 2周  
> **所属模块**: 02-core-modules/03-queue-system  
> **前置依赖**: OP-001 (运维平台核心架构设计), OP-002 (多智能体编排引擎)

## 1. 概述

### 1.1 任务目标

设计并实现高性能的任务调度与队列系统，支持任务的优先级调度、延迟执行、周期性执行、任务依赖和死信处理。该系统是整个平台任务执行的核心基础设施，支撑多智能体编排引擎和用户任务提交的所有任务。

### 1.2 核心能力

- **优先级调度**：支持 0-100 优先级，数值越大优先级越高
- **延迟执行**：支持指定延迟时间执行任务
- **周期性执行**：支持 Cron 表达式和固定间隔的任务调度
- **任务依赖**：支持任务间的依赖关系（DAG）
- **死信处理**：任务失败后进入死信队列，支持人工处理
- **公平调度**：多租户任务公平分配资源
- **流量控制**：基于令牌桶的流量限制

### 1.3 核心用户故事

| 编号 | 角色 | 故事 | 价值 |
|------|------|------|------|
| US-01 | 开发者 | 开发者可以提交高优先级任务，优先执行 | 紧急任务快速响应 |
| US-02 | 调度员 | 调度员可以设置定时任务，按计划执行 | 自动化运维 |
| US-03 | 开发者 | 开发者可以设置任务失败重试 | 提高任务成功率 |
| US-04 | 运维人员 | 运维人员可以查看队列积压情况 | 及时发现和处理问题 |

## 2. 验收标准

### 2.1 功能验收标准

- [ ] 支持优先级调度（0-100）
- [ ] 支持延迟执行（最大 7 天）
- [ ] 支持 Cron 表达式调度
- [ ] 支持固定间隔调度
- [ ] 支持任务依赖（DAG）
- [ ] 支持任务重试（可配置次数和间隔）
- [ ] 支持死信队列
- [ ] 支持多租户公平调度
- [ ] 支持流量控制
- [ ] 支持任务取消

### 2.2 非功能验收标准

- [ ] 支持 10,000+ QPS 任务提交
- [ ] 任务分发延迟 < 50ms（P95）
- [ ] 支持 100,000+ 待执行任务
- [ ] 系统可用性 99.99%
- [ ] 数据持久化 RPO < 1 秒

## 3. 系统架构

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          任务入口层                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │ REST API     │  │ gRPC API     │  │ Webhook      │                      │
│  └──────────────┘  └──────────────┘  └──────────────┘                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                          任务处理层                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Task Dispatcher (任务分发器)                        │    │
│  │  - 任务验证                                                           │    │
│  │  - 优先级排序                                                         │    │
│  │  - 流量控制                                                           │    │
│  │  - 租户隔离                                                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Scheduler (调度器)                                 │    │
│  │  - Cron 解析                                                          │    │
│  │  - 延迟任务处理                                                       │    │
│  │  - 周期性任务生成                                                     │    │
│  │  - 依赖检查                                                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Queue Manager (队列管理器)                          │    │
│  │  - 优先级队列（Heap）                                                  │    │
│  │  - 延迟队列（Sorted Set）                                             │    │
│  │  - 死信队列                                                           │    │
│  │  - 任务存储（KV）                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 队列设计

```go
// QueueType 队列类型
type QueueType string

const (
    QueueTypePriority QueueType = "priority"  // 优先级队列
    QueueTypeDelayed  QueueType = "delayed"   // 延迟队列
    QueueTypeDeadLetter QueueType = "dead_letter" // 死信队列
    QueueTypeRetry     QueueType = "retry"    // 重试队列
)

// PriorityQueue 优先级队列
type PriorityQueue struct {
    heap      *Heap[Task]  // 最小堆，按优先级排序
    lock      sync.RWMutex
    maxSize   int64
}

// DelayedQueue 延迟队列（基于 Redis Sorted Set）
type DelayedQueue struct {
    redis     *redis.Client
    key       string
    scoreType float64  // 使用时间戳作为 score
}

// DeadLetterQueue 死信队列
type DeadLetterQueue struct {
    primaryQueue string
    maxRetries   int
    storage      *Storage
}
```

### 3.3 任务状态机

```
任务状态流转：

                    ┌─────────────┐
                    │   PENDING   │  创建任务
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   QUEUED    │  进入队列
                    └──────┬──────┘
                           │
     ┌─────────────────────┼─────────────────────┐
     │                     │                     │
┌────▼────┐          ┌────▼────┐          ┌──────▼──────┐
│ SCHEDULED│          │ RUNNING │          │  RETRYING   │
└────┬────┘          └────┬────┘          └──────┬──────┘
     │                    │                     │
     │         ┌──────────┼──────────┐         │
     │         │          │          │         │
     │    ┌────▼────┐     │     ┌────▼────┐    │
     │    │ SUCCESS │     │     │  FAILED │────┘
     │    └─────────┘     │     └────┬─────┘
     │                    │          │
     │                    │     ┌────▼─────┐
     │                    │     │  RETRY   │───[重试次数 < 最大]
     │                    │     └────┬─────┘
     │                    │          │
     │                    │     ┌────▼─────┐
     │                    └────►│ DEAD_LETTER│───[超过最大重试]
     │                          └─────┬─────┘
     │                                │
                        ┌────────────▼────────────┐
                        │       CANCELLED          │  手动取消
                        └─────────────────────────┘
```

### 3.4 任务数据结构

```go
// Task 任务实体
type Task struct {
    ID            uuid.UUID       `json:"id" ent:"id,uuid"`
    TenantID      uuid.UUID       `json:"tenant_id" ent:"tenant_id,uuid"`
    Type          string          `json:"type" ent:"type"`
    Name          string          `json:"name" ent:"name"`
    
    // 任务内容
    Payload       json.RawMessage `json:"payload" ent:"payload,json"`
    
    // 调度配置
    Priority      int             `json:"priority" ent:"priority"` // 0-100
    ScheduleType  ScheduleType    `json:"schedule_type" ent:"schedule_type"`
    ScheduleAt    *time.Time      `json:"schedule_at" ent:"schedule_at"` // 延迟/定时执行时间
    CronExpr      string          `json:"cron_expr" ent:"cron_expr"` // Cron 表达式
    Interval      int             `json:"interval" ent:"interval"` // 固定间隔（秒）
    
    // 依赖配置
    DependsOn     []uuid.UUID     `json:"depends_on" ent:"depends_on,json"` // 依赖任务 ID
    Dependents    []uuid.UUID     `json:"dependents" ent:"dependents,json"` // 依赖当前任务的任务
    
    // 执行配置
    AgentID       *uuid.UUID      `json:"agent_id" ent:"agent_id,uuid"` // 指定执行智能体
    AgentType     string          `json:"agent_type" ent:"agent_type"` // 指定智能体类型
    Timeout       int             `json:"timeout" ent:"timeout"` // 超时时间（秒）
    RetryPolicy   RetryPolicy     `json:"retry_policy" ent:"retry_policy,json"`
    
    // 状态
    Status        TaskStatus      `json:"status" ent:"status"`
    Progress      int             `json:"progress" ent:"progress"` // 0-100
    CurrentAttempt int            `json:"current_attempt" ent:"current_attempt"`
    StartedAt     *time.Time      `json:"started_at" ent:"started_at"`
    CompletedAt   *time.Time      `json:"completed_at" ent:"completed_at"`
    
    // 结果
    Output        json.RawMessage `json:"output" ent:"output,json"`
    Error         string          `json:"error" ent:"error"`
    
    // 元数据
    Metadata      map[string]string `json:"metadata" ent:"metadata,json"`
    CreatedBy     uuid.UUID       `json:"created_by" ent:"created_by,uuid"`
    
    // 审计字段
    CreatedAt     time.Time       `json:"created_at" ent:"created_at"`
    UpdatedAt     time.Time       `json:"updated_at" ent:"updated_at"`
}

// ScheduleType 调度类型
type ScheduleType string

const (
    ScheduleTypeNow      ScheduleType = "now"       // 立即执行
    ScheduleTypeDelayed  ScheduleType = "delayed"   // 延迟执行
    ScheduleTypeCron     ScheduleType = "cron"      // Cron 表达式
    ScheduleTypeInterval ScheduleType = "interval"  // 固定间隔
)

// RetryPolicy 重试策略
type RetryPolicy struct {
    MaxRetries    int     `json:"max_retries"`    // 最大重试次数
    RetryInterval int     `json:"retry_interval"` // 重试间隔（秒）
    BackoffMultiplier float64 `json:"backoff_multiplier"` // 退避乘数
    MaxRetryInterval int    `json:"max_retry_interval"` // 最大重试间隔
}
```

## 4. API 设计

### 4.1 任务 API

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/v1/tasks | 创建任务 |
| GET | /api/v1/tasks | 列出任务 |
| GET | /api/v1/tasks/{id} | 获取任务详情 |
| PUT | /api/v1/tasks/{id} | 更新任务 |
| DELETE | /api/v1/tasks/{id} | 取消/删除任务 |
| POST | /api/v1/tasks/{id}/retry | 重试任务 |
| POST | /api/v1/tasks/{id}/cancel | 取消任务 |
| GET | /api/v1/tasks/{id}/logs | 获取任务日志 |

### 4.2 任务模板 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/v1/task-templates | 列出任务模板 |
| POST | /api/v1/task-templates | 创建任务模板 |
| GET | /api/v1/task-templates/{id} | 获取模板详情 |
| PUT | /api/v1/task-templates/{id} | 更新模板 |
| DELETE | /api/v1/task-templates/{id} | 删除模板 |
| POST | /api/v1/task-templates/{id}/execute | 从模板执行任务 |

### 4.3 队列管理 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/v1/queues/stats | 获取队列统计 |
| GET | /api/v1/queues/pending | 获取待执行任务 |
| GET | /api/v1/queues/delayed | 获取延迟任务 |
| GET | /api/v1/queues/dead-letter | 获取死信任务 |
| POST | /api/v1/queues/dead-letter/{id}/retry | 重试死信任务 |
| POST | /api/v1/queues/dead-letter/{id}/discard | 丢弃死信任务 |

### 4.4 API 详细定义

#### 4.4.1 创建任务

**请求**：
```json
POST /api/v1/tasks
Content-Type: application/json

{
  "name": "代码审查任务",
  "type": "code_review",
  "payload": {
    "repository_url": "https://github.com/example/repo",
    "pull_request_id": 123,
    "files": ["src/main.go", "src/utils.go"]
  },
  "priority": 80,
  "schedule_type": "now",
  "timeout": 300,
  "retry_policy": {
    "max_retries": 3,
    "retry_interval": 10,
    "backoff_multiplier": 2.0,
    "max_retry_interval": 300
  },
  "metadata": {
    "project": "backend",
    "environment": "production"
  }
}
```

**响应**：
```json
201 Created
Content-Type: application/json

{
  "code": 201,
  "message": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "代码审查任务",
    "type": "code_review",
    "status": "queued",
    "priority": 80,
    "created_at": "2026-02-01T10:00:00Z"
  }
}
```

#### 4.4.2 创建定时任务

**请求**：
```json
POST /api/v1/tasks
Content-Type: application/json

{
  "name": "每日健康检查",
  "type": "health_check",
  "payload": {
    "check_items": ["database", "cache", "api"]
  },
  "priority": 50,
  "schedule_type": "cron",
  "cron_expr": "0 0 8 * * ?",  // 每天 8:00 执行
  "timeout": 600,
  "retry_policy": {
    "max_retries": 2,
    "retry_interval": 60
  }
}
```

## 5. 数据模型

### 5.1 数据库表设计

```sql
-- tasks 任务表
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    
    priority INT NOT NULL DEFAULT 50,
    schedule_type VARCHAR(50) NOT NULL DEFAULT 'now',
    schedule_at TIMESTAMP WITH TIME ZONE,
    cron_expr VARCHAR(100),
    interval_seconds INT,
    
    depends_on UUID[] DEFAULT '{}',
    dependents UUID[] DEFAULT '{}',
    
    agent_id UUID,
    agent_type VARCHAR(100),
    timeout INT DEFAULT 300,
    retry_policy JSONB DEFAULT '{"max_retries": 0, "retry_interval": 0}',
    
    status VARCHAR(50) NOT DEFAULT 'pending',
    progress INT DEFAULT 0,
    current_attempt INT DEFAULT 0,
    output JSONB DEFAULT '{}',
    error TEXT,
    
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    metadata JSONB DEFAULT '{}',
    created_by UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tasks_tenant ON tasks(tenant_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority DESC);
CREATE INDEX idx_tasks_schedule_at ON tasks(schedule_at) WHERE status = 'pending';
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- task_templates 任务模板表
CREATE TABLE task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL,
    payload_schema JSONB NOT NULL,
    default_payload JSONB DEFAULT '{}',
    priority INT DEFAULT 50,
    timeout INT DEFAULT 300,
    retry_policy JSONB DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_task_templates_tenant ON task_templates(tenant_id);

-- task_dependencies 任务依赖表
CREATE TABLE task_dependencies (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) DEFAULT 'completion',  -- completion, success, failure
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (task_id, depends_on_task_id)
);

-- task_logs 任务日志表
CREATE TABLE task_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_task_logs_task ON task_logs(task_id);
CREATE INDEX idx_task_logs_created_at ON task_logs(created_at DESC);
```

### 5.2 Redis 数据结构

```yaml
# Redis 键设计

# 优先级队列（使用 Redis Stream）
key: "ops:queue:priority:{tenant_id}"
type: Redis Stream
fields:
  - task_id
  - priority
  - payload

# 延迟队列（使用 Sorted Set）
key: "ops:queue:delayed"
score: 执行时间戳 (Unix timestamp)
member: task_id

# 待执行任务哈希
key: "ops:tasks:pending:{task_id}"
type: Hash
fields:
  - status
  - priority
  - payload
  - created_at

# 任务结果
key: "ops:tasks:result:{task_id}"
type: Hash
fields:
  - status
  - output
  - error
  - completed_at

# 任务进度
key: "ops:tasks:progress:{task_id}"
type: String
value: 进度百分比

# 死信队列
key: "ops:queue:dead-letter"
type: List
values: task_id 列表

# 租户流量控制
key: "ops:ratelimit:{tenant_id}"
type: Hash
fields:
  - tokens
  - last_refill

# 统计计数器
key: "ops:stats:{tenant_id}:{date}"
type: Hash
fields:
  - total_tasks
  - completed_tasks
  - failed_tasks
  - avg_execution_time
```

## 6. 实现步骤

### 阶段 1：核心队列实现 (第1周)

#### Day 1-2: 基础框架

1. 创建队列服务目录结构
2. 实现 Task 实体和 Ent Schema
3. 实现 Task Repository
4. 实现 Task Service 基础 CRUD

#### Day 3-4: 优先级队列

1. 实现优先级队列数据结构
2. 实现入队和出队操作
3. 实现基于租户的公平调度
4. 实现任务状态更新

#### Day 5: 延迟队列

1. 实现延迟任务存储
2. 实现延迟任务扫描器
3. 实现延迟任务转移
4. 实现延迟任务取消

### 阶段 2：调度器实现 (第2周)

#### Day 1-2: Cron 调度

1. 实现 Cron 表达式解析器
2. 实现周期性任务生成
3. 实现任务模板管理
4. 实现 Cron 任务触发

#### Day 3-4: 依赖和重试

1. 实现任务依赖解析
2. 实现依赖检查器
3. 实现重试策略
4. 实现死信处理

#### Day 5: 优化和测试

1. 性能优化（批量处理）
2. 编写单元测试
3. 编写集成测试
4. 文档完善

## 7. 测试用例

### 7.1 单元测试

```go
// 测试优先级队列
func TestPriorityQueue_PushPop(t *testing.T) {
    q := NewPriorityQueue(1000)
    
    // Push tasks with different priorities
    q.Push(&Task{ID: "1", Priority: 30})
    q.Push(&Task{ID: "2", Priority: 80})
    q.Push(&Task{ID: "3", Priority: 50})
    
    // Pop should return highest priority first
    task := q.Pop()
    assert.Equal(t, "2", task.ID) // Priority 80
    
    task = q.Pop()
    assert.Equal(t, "3", task.ID) // Priority 50
    
    task = q.Pop()
    assert.Equal(t, "1", task.ID) // Priority 30
}

// 测试 Cron 解析
func TestCronParser_Parse(t *testing.T) {
    parser := NewCronParser()
    
    next, err := parser.Next("0 0 8 * * ?") // 每天 8:00
    assert.NoError(t, err)
    assert.NotNil(t, next)
    assert.Equal(t, 8, next.Hour())
    assert.Equal(t, 0, next.Minute())
}

// 测试任务依赖
func TestTaskDependency_Check(t *testing.T) {
    dependencies := []uuid.UUID{
        uuid.MustParse("task-1-id"),
        uuid.MustParse("task-2-id"),
    }
    
    checker := NewDependencyChecker()
    
    allCompleted, err := checker.AllCompleted(dependencies)
    assert.NoError(t, err)
    assert.True(t, allCompleted)
}
```

### 7.2 集成测试

```go
// 测试完整任务流程
func TestTaskFlow_Integration(t *testing.T) {
    // Setup
    server := NewTestServer()
    defer server.Close()
    
    // Create task
    task := server.CreateTask(&CreateTaskRequest{
        Name: "测试任务",
        Type: "test",
        Payload: map[string]interface{}{"key": "value"},
        Priority: 80,
        ScheduleType: "now",
    })
    assert.Equal(t, 201, task.StatusCode)
    
    // Wait for execution
    result := server.WaitForTask(task.ID, 10*time.Second)
    
    assert.Equal(t, "completed", result.Status)
    assert.Equal(t, 100, result.Progress)
}

// 测试延迟任务
func TestDelayedTask_Integration(t *testing.T) {
    server := NewTestServer()
    defer server.Close()
    
    // Create delayed task (1 minute later)
    task := server.CreateTask(&CreateTaskRequest{
        Name: "延迟任务",
        Type: "test",
        Payload: map[string]interface{}{"key": "value"},
        ScheduleType: "delayed",
        ScheduleAt: time.Now().Add(1 * time.Minute),
    })
    
    // Check task status immediately
    status := server.GetTaskStatus(task.ID)
    assert.Equal(t, "pending", status.Status)
    
    // Wait for execution
    result := server.WaitForTask(task.ID, 90*time.Second)
    assert.Equal(t, "completed", result.Status)
}
```

## 8. 验收检查清单

### 8.1 功能验收

- [ ] 任务创建正常
- [ ] 优先级调度生效
- [ ] 延迟任务按时执行
- [ ] Cron 任务按计划执行
- [ ] 任务依赖正确处理
- [ ] 重试机制生效
- [ ] 死信处理正常
- [ ] 任务取消正常

### 8.2 性能验收

- [ ] 任务提交 QPS > 10,000
- [ ] 任务分发延迟 < 50ms
- [ ] 队列存储支持 > 100,000 任务
- [ ] 死信查询正常

### 8.3 文档验收

- [ ] API 文档完整
- [ ] Cron 表达式文档清晰
- [ ] 配置示例丰富

---

**相关文档**
- [规格说明](SPECIFICATION.md)
- [设计文档](DESIGN.md)
- [实现步骤](IMPLEMENTATION.md)
- [测试用例](TEST_CASES.md)

**前置依赖**
- OP-001: 运维平台核心架构设计
- OP-002: 多智能体编排引擎

**后续任务**
- OP-004: Git 平台 Webhook 集成
- OP-005: 计费与配额管理系统
