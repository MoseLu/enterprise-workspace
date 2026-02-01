# 多智能体编排引擎

> **任务编号**: OP-002  
> **优先级**: P0  
> **预估工时**: 3周  
> **所属模块**: 02-core-modules/02-agent-orchestrator  
> **前置依赖**: OP-001 (运维平台核心架构设计)

## 1. 概述

### 1.1 任务目标

设计并实现多智能体编排引擎，支持多种类型的 AI 智能体（Agent）的生命周期管理、工作流编排、任务分发和状态监控。本引擎是 ops-platform 的核心组件，提供灵活、可扩展的智能体协作能力。

### 1.2 核心能力

- **智能体注册与发现**：支持多种类型智能体的注册、配置和发现
- **工作流编排**：可视化的工作流设计器，支持条件分支、并行执行、循环等控制流
- **任务分发**：基于负载均衡和优先级的智能任务分发
- **状态监控**：实时监控智能体状态和任务执行状态
- **故障恢复**：智能体故障自动恢复，任务自动重试

### 1.3 核心用户故事

| 编号 | 角色 | 故事 | 价值 |
|------|------|------|------|
| US-01 | 开发者 | 开发者可以注册新的 AI 智能体，配置其能力和参数 | 灵活扩展平台能力 |
| US-02 | 架构师 | 架构师可以设计复杂的工作流，组合多个智能体完成复杂任务 | 解决复杂业务问题 |
| US-03 | 运维人员 | 运维人员可以监控所有智能体的状态，及时发现和处理异常 | 保证系统稳定性 |
| US-04 | 管理员 | 管理员可以配置智能体的负载均衡策略和资源限制 | 优化资源利用 |

## 2. 验收标准

### 2.1 功能验收标准

- [ ] 支持至少 5 种不同类型的智能体（ChatAgent、CodeAgent、ReviewAgent 等）
- [ ] 支持工作流可视化设计（DSL 或 JSON 格式）
- [ ] 支持工作流条件分支（if/else、switch）
- [ ] 支持工作流并行执行（parallel）
- [ ] 支持工作流循环执行（loop、while）
- [ ] 支持任务优先级调度（0-100）
- [ ] 支持智能体负载均衡（轮询、最少连接、CPU 使用率）
- [ ] 支持智能体状态实时监控
- [ ] 支持故障自动转移
- [ ] 支持任务自动重试（可配置重试次数和间隔）

### 2.2 非功能验收标准

- [ ] 单个工作流支持最多 100 个节点
- [ ] 支持 1000+ 智能体同时在线
- [ ] 任务分发延迟 < 100ms
- [ ] 状态同步延迟 < 1s
- [ ] 系统可用性 99.9%

## 3. 系统架构

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Orchestration Layer                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Workflow Engine (编排引擎)                          │    │
│  │  - 解析工作流定义                                                     │    │
│  │  - 执行控制流（顺序、分支、并行、循环）                                │    │
│  │  - 管理执行上下文                                                     │    │
│  │  - 处理异常和重试                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Task Dispatcher (任务分发器)                        │    │
│  │  - 任务队列管理                                                       │    │
│  │  - 负载均衡策略                                                       │    │
│  │  - 任务优先级调度                                                     │    │
│  │  - 任务状态追踪                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Agent Registry (智能体注册表)                       │    │
│  │  - 智能体注册/注销                                                    │    │
│  │  - 智能体元数据管理                                                   │    │
│  │  - 智能体发现                                                         │    │
│  │  - 健康检查                                                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    State Manager (状态管理器)                          │    │
│  │  - 工作流执行状态                                                     │    │
│  │  - 任务执行状态                                                       │    │
│  │  - 智能体状态                                                         │    │
│  │  - 状态持久化                                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 工作流引擎设计

#### 3.2.1 工作流定义 (DSL)

```yaml
# 工作流定义示例
workflow:
  id: "workflow-code-review"
  name: "代码审查工作流"
  version: "1.0.0"
  
  triggers:
    - type: webhook
      url: "/api/v1/webhooks/code-review"
    - type: manual
      allowed_roles: ["admin", "developer"]

  variables:
    - name: repository_url
      type: string
      required: true
    - name: pull_request_id
      type: string
      required: true
    - name: code_changes
      type: object
      required: false

  nodes:
    - id: "start"
      type: "start"
      position: { x: 100, y: 100 }
      
    - id: "fetch-code"
      type: "action"
      name: "获取代码"
      agent: "CodeFetcher"
      input:
        repository_url: "${workflow.variables.repository_url}"
        target: "refs/heads/main"
      position: { x: 100, y: 200 }
      
    - id: "run-static-analysis"
      type: "action"
      name: "静态分析"
      agent: "StaticAnalyzer"
      depends_on: ["fetch-code"]
      input:
        code: "${nodes.fetch-code.output.code}"
      position: { x: 100, y: 300 }
      
    - id: "run-security-scan"
      type: "action"
      name: "安全扫描"
      agent: "SecurityScanner"
      depends_on: ["fetch-code"]
      parallel_with: ["run-static-analysis"]
      input:
        code: "${nodes.fetch-code.output.code}"
      position: { x: 300, y: 300 }
      
    - id: "review-decision"
      type: "condition"
      name: "审查决策"
      depends_on: ["run-static-analysis", "run-security-scan"]
      condition: |
        ${nodes.run-static-analysis.output.issues_count == 0} &&
        ${nodes.run-security-scan.output.critical_issues == 0}
      position: { x: 200, y: 400 }
      
    - id: "generate-report"
      type: "action"
      name: "生成报告"
      agent: "ReportGenerator"
      depends_on: ["review-decision"]
      when: "condition_true"
      input:
        static_result: "${nodes.run-static-analysis.output}"
        security_result: "${nodes.run-security-scan.output}"
      position: { x: 200, y: 500 }
      
    - id: "flag-issues"
      type: "action"
      name: "标记问题"
      agent: "IssueMarker"
      depends_on: ["review-decision"]
      when: "condition_false"
      input:
        issues: "${concat(nodes.run-static-analysis.output.issues, nodes.run-security-scan.output.critical_issues)}"
      position: { x: 400, y: 500 }
      
    - id: "end"
      type: "end"
      name: "结束"
      depends_on: ["generate-report", "flag-issues"]
      position: { x: 300, y: 600 }

  outputs:
    - name: "report_url"
      value: "${nodes.generate-report.output.report_url}"
    - name: "issues_count"
      value: "${nodes.flag-issues.output.issues_count}"
```

#### 3.2.2 节点类型定义

```go
// NodeType 节点类型
type NodeType string

const (
    NodeTypeStart     NodeType = "start"      // 开始节点
    NodeTypeEnd       NodeType = "end"        // 结束节点
    NodeTypeAction    NodeType = "action"     // 动作节点
    NodeTypeCondition NodeType = "condition"  // 条件节点
    NodeTypeParallel  NodeType = "parallel"   // 并行节点
    NodeTypeLoop      NodeType = "loop"       // 循环节点
    NodeTypeSubWorkflow NodeType = "sub_workflow" // 子工作流
)

// Node 节点定义
type Node struct {
    ID          string                 `json:"id"`
    Type        NodeType               `json:"type"`
    Name        string                 `json:"name"`
    Description string                 `json:"description,omitempty"`
    Agent       string                 `json:"agent,omitempty"`
    Input       map[string]interface{} `json:"input,omitempty"`
    Output      map[string]interface{} `json:"output,omitempty"`
    DependsOn   []string               `json:"depends_on,omitempty"`
    ParallelWith []string              `json:"parallel_with,omitempty"`
    When        string                 `json:"when,omitempty"`
    Condition   string                 `json:"condition,omitempty"`
    Position    Position               `json:"position"`
    Config      map[string]interface{} `json:"config,omitempty"`
}

// Position 位置
type Position struct {
    X int `json:"x"`
    Y int `json:"y"`
}
```

### 3.3 智能体类型定义

```go
// AgentType 智能体类型
type AgentType string

const (
    AgentTypeChat        AgentType = "chat"         // 对话智能体
    AgentTypeCode        AgentType = "code"         // 代码智能体
    AgentTypeReview      AgentType = "review"       // 审查智能体
    AgentTypeAnalysis    AgentType = "analysis"     // 分析智能体
    AgentTypeGeneration  AgentType = "generation"   // 生成智能体
)

// AIEmployee 智能体
type AIEmployee struct {
    ID            uuid.UUID           `json:"id" ent:"id,uuid"`
    TenantID      uuid.UUID           `json:"tenant_id" ent:"tenant_id,uuid"`
    Name          string              `json:"name" ent:"name"`
    Type          AgentType           `json:"type" ent:"type"`
    Position      string              `json:"position" ent:"position"`
    Description   string              `json:"description" ent:"description"`
    
    // 连接配置
    RepositoryURL string              `json:"repository_url" ent:"repository_url"`
    Platform      RepoPlatform        `json:"platform" ent:"platform"`
    Token         string              `json:"-" ent:"token"` // 加密存储
    
    // 运行时配置
    Config        AgentConfig         `json:"config" ent:"config,json"`
    Capabilities  []string            `json:"capabilities" ent:"capabilities,json"`
    
    // 状态
    Status        AgentStatus         `json:"status" ent:"status"`
    Load          float64             `json:"load" ent:"load"` // 0.0 - 1.0
    LastHeartbeat time.Time           `json:"last_heartbeat" ent:"last_heartbeat"`
    
    // 指标
    Metrics       AgentMetrics        `json:"metrics" ent:"metrics,json"`
    
    // 审计字段
    CreatedAt     time.Time           `json:"created_at" ent:"created_at"`
    UpdatedAt     time.Time           `json:"updated_at" ent:"updated_at"`
}

// AgentConfig 智能体配置
type AgentConfig struct {
    Model           string             `json:"model"`            // 使用的模型
    Temperature     float64            `json:"temperature"`      // 0.0 - 1.0
    MaxTokens       int                `json:"max_tokens"`       // 最大 Token 数
    SystemPrompt    string             `json:"system_prompt"`    // 系统提示
    Timeout         int                `json:"timeout"`          // 超时时间（秒）
    RetryCount      int                `json:"retry_count"`      // 重试次数
    RetryInterval   int                `json:"retry_interval"`   // 重试间隔（秒）
    RateLimit       RateLimitConfig    `json:"rate_limit"`       // 速率限制
}

// AgentMetrics 智能体指标
type AgentMetrics struct {
    TotalTasks      int64     `json:"total_tasks"`      // 总任务数
    CompletedTasks  int64     `json:"completed_tasks"`  // 完成数
    FailedTasks     int64     `json:"failed_tasks"`     // 失败数
    AvgExecutionTime float64  `json:"avg_execution_time"` // 平均执行时间
    SuccessRate     float64   `json:"success_rate"`      // 成功率
    LastTaskAt      *time.Time `json:"last_task_at"`     // 最后任务时间
}
```

## 4. API 设计

### 4.1 智能体管理 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/v1/agents | 列出智能体 |
| POST | /api/v1/agents | 创建智能体 |
| GET | /api/v1/agents/{id} | 获取智能体详情 |
| PUT | /api/v1/agents/{id} | 更新智能体 |
| DELETE | /api/v1/agents/{id} | 删除智能体 |
| POST | /api/v1/agents/{id}/activate | 激活智能体 |
| POST | /api/v1/agents/{id}/deactivate | 停用智能体 |
| GET | /api/v1/agents/{id}/status | 获取智能体状态 |
| GET | /api/v1/agents/{id}/metrics | 获取智能体指标 |
| GET | /api/v1/agents/{id}/capabilities | 获取智能体能力列表 |

### 4.2 工作流管理 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/v1/workflows | 列出工作流 |
| POST | /api/v1/workflows | 创建工作流 |
| GET | /api/v1/workflows/{id} | 获取工作流详情 |
| PUT | /api/v1/workflows/{id} | 更新工作流 |
| DELETE | /api/v1/workflows/{id} | 删除工作流 |
| POST | /api/v1/workflows/{id}/validate | 验证工作流 |
| GET | /api/v1/workflows/{id}/execute | 执行工作流 |
| GET | /api/v1/workflows/{id}/instances | 获取执行实例 |

### 4.3 工作流执行 API

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/v1/executions | 启动执行 |
| GET | /api/v1/executions/{id} | 获取执行详情 |
| GET | /api/v1/executions/{id}/status | 获取执行状态 |
| GET | /api/v1/executions/{id}/progress | 获取执行进度 |
| POST | /api/v1/executions/{id}/cancel | 取消执行 |
| POST | /api/v1/executions/{id}/retry | 重试执行 |
| GET | /api/v1/executions/{id}/logs | 获取执行日志 |

### 4.4 API 详细定义

#### 4.4.1 创建智能体

**请求**：
```json
POST /api/v1/agents
Content-Type: application/json

{
  "name": "代码审查智能体",
  "type": "review",
  "position": "Senior Reviewer",
  "description": "负责代码审查和质量问题检测",
  "repository_url": "https://github.com/example/repo",
  "platform": "github",
  "config": {
    "model": "gpt-4",
    "temperature": 0.3,
    "max_tokens": 8192,
    "system_prompt": "你是一个专业的代码审查工程师...",
    "timeout": 300,
    "retry_count": 3,
    "retry_interval": 10
  },
  "capabilities": [
    "code_review",
    "vulnerability_scan",
    "performance_analysis"
  ]
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
    "name": "代码审查智能体",
    "type": "review",
    "status": "inactive",
    "created_at": "2026-02-01T10:00:00Z"
  }
}
```

#### 4.4.2 创建工作流

**请求**：
```json
POST /api/v1/workflows
Content-Type: application/json

{
  "name": "代码审查工作流",
  "description": "自动化的代码审查流程",
  "definition": {
    "nodes": [
      {
        "id": "start",
        "type": "start"
      },
      {
        "id": "fetch-code",
        "type": "action",
        "name": "获取代码",
        "agent": "code-fetcher",
        "depends_on": ["start"]
      },
      {
        "id": "review-code",
        "type": "action",
        "name": "审查代码",
        "agent": "code-reviewer",
        "depends_on": ["fetch-code"]
      },
      {
        "id": "end",
        "type": "end",
        "depends_on": ["review-code"]
      }
    ]
  }
}
```

## 5. 数据模型

### 5.1 数据库表设计

```sql
-- ai_employees 智能体表
CREATE TABLE ai_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    position VARCHAR(100),
    description TEXT,
    repository_url VARCHAR(500),
    platform VARCHAR(50),
    token_encrypted VARCHAR(500),
    config JSONB DEFAULT '{}',
    capabilities TEXT[] DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'inactive',
    load DECIMAL(5,4) DEFAULT 0,
    last_heartbeat TIMESTAMP WITH TIME ZONE,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_employees_tenant ON ai_employees(tenant_id);
CREATE INDEX idx_ai_employees_status ON ai_employees(status);
CREATE INDEX idx_ai_employees_type ON ai_employees(type);

-- workflows 工作流表
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    definition JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workflows_tenant ON workflows(tenant_id);

-- workflow_executions 工作流执行表
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    input JSONB DEFAULT '{}',
    output JSONB DEFAULT '{}',
    progress INT DEFAULT 0,
    current_node VARCHAR(100),
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);

-- node_executions 节点执行表
CREATE TABLE node_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES workflow_executions(id),
    node_id VARCHAR(100) NOT NULL,
    node_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    input JSONB DEFAULT '{}',
    output JSONB DEFAULT '{}',
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_node_executions_execution ON node_executions(execution_id);
```

## 6. 实现步骤

### 阶段 1：智能体注册与发现 (第1周)

#### Day 1-2: 基础框架

1. 创建智能体服务目录结构
2. 实现 Agent 实体和 Ent Schema
3. 实现 Agent Repository
4. 实现 Agent Service 基础 CRUD

#### Day 3-4: 智能体注册

1. 实现智能体注册 API
2. 实现智能体激活/停用逻辑
3. 实现心跳检测机制
4. 实现智能体状态同步

#### Day 5: 负载均衡

1. 实现负载均衡策略接口
2. 实现轮询策略
3. 实现最少连接策略
4. 实现 CPU 使用率策略

### 阶段 2：工作流引擎 (第2周)

#### Day 1-2: 工作流定义

1. 设计工作流 DSL 格式
2. 实现工作流解析器
3. 实现节点验证器
4. 实现依赖关系解析

#### Day 3-4: 执行引擎

1. 实现工作流执行器
2. 实现节点调度器
3. 实现控制流处理（顺序、分支、并行）
4. 实现执行上下文管理

#### Day 5: 状态管理

1. 实现执行状态持久化
2. 实现状态恢复机制
3. 实现检查点机制
4. 实现超时处理

### 阶段 3：任务分发 (第3周)

#### Day 1-2: 任务队列

1. 实现任务队列
2. 实现优先级调度
3. 实现任务分发器
4. 实现任务状态追踪

#### Day 3-4: 故障恢复

1. 实现智能体故障检测
2. 实现任务自动重试
3. 实现故障转移
4. 实现死信处理

#### Day 5: 优化与测试

1. 性能优化
2. 编写单元测试
3. 编写集成测试
4. 文档完善

## 7. 测试用例

### 7.1 单元测试

```go
// 测试工作流解析
func TestWorkflowParser_Parse(t *testing.T) {
    definition := `...`
    parser := NewWorkflowParser()
    
    workflow, err := parser.Parse(definition)
    
    assert.NoError(t, err)
    assert.NotNil(t, workflow)
    assert.Len(t, workflow.Nodes, 5)
    assert.Len(t, workflow.Edges, 4)
}

// 测试负载均衡
func TestLoadBalancer_Select(t *testing.T) {
    agents := []*Agent{
        {ID: "1", Load: 0.5, Status: AgentStatusActive},
        {ID: "2", Load: 0.3, Status: AgentStatusActive},
        {ID: "3", Load: 0.8, Status: AgentStatusActive},
    }
    
    balancer := NewLeastConnectionsBalancer()
    selected := balancer.Select(agents)
    
    assert.Equal(t, "2", selected.ID) // 选择连接数最少的
}

// 测试工作流执行
func TestWorkflowExecutor_Execute(t *testing.T) {
    workflow := &Workflow{...}
    executor := NewWorkflowExecutor()
    
    result, err := executor.Execute(context.Background(), workflow, testInput)
    
    assert.NoError(t, err)
    assert.Equal(t, StatusCompleted, result.Status)
    assert.Equal(t, 100, result.Progress)
}
```

### 7.2 集成测试

```go
// 测试完整工作流执行
func TestWorkflowExecution_Integration(t *testing.T) {
    // Setup test environment
    server := NewTestServer()
    defer server.Close()
    
    // Create agent
    agent := server.CreateAgent(&CreateAgentRequest{...})
    
    // Create workflow
    workflow := server.CreateWorkflow(&CreateWorkflowRequest{...})
    
    // Execute workflow
    execution := server.ExecuteWorkflow(workflow.ID, map[string]interface{}{
        "repository_url": "https://github.com/test/repo",
    })
    
    // Wait for completion
    result := server.WaitForExecution(execution.ID, 30*time.Second)
    
    assert.Equal(t, StatusCompleted, result.Status)
    assert.NotEmpty(t, result.Output["report_url"])
}
```

## 8. 验收检查清单

### 8.1 功能验收

- [ ] 智能体注册和激活正常
- [ ] 智能体状态同步及时
- [ ] 负载均衡策略生效
- [ ] 工作流定义解析正确
- [ ] 工作流执行控制流正确
- [ ] 任务分发及时
- [ ] 故障恢复机制生效
- [ ] 状态持久化正常

### 8.2 性能验收

- [ ] 工作流解析 < 100ms
- [ ] 任务分发 < 100ms
- [ ] 状态同步 < 1s
- [ ] 支持 1000+ 智能体
- [ ] 支持 100+ 节点工作流

### 8.3 文档验收

- [ ] API 文档完整
- [ ] 工作流 DSL 文档清晰
- [ ] 配置示例丰富
- [ ] 故障处理指南可用

---

**相关文档**
- [Agent 规格](AGENT_SPEC.md)
- [工作流定义](WORKFLOW_DEFINITION.md)
- [API 设计](API_DESIGN.md)
- [实现步骤](IMPLEMENTATION.md)
- [测试用例](TEST_CASES.md)

**前置依赖**
- OP-001: 运维平台核心架构设计

**后续任务**
- OP-003: 任务调度与队列系统
- OP-004: Git 平台 Webhook 集成
