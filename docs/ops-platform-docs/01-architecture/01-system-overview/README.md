# 运维平台核心架构设计

> **任务编号**: OP-001  
> **优先级**: P0  
> **预估工时**: 1周  
> **所属模块**: 01-architecture/01-system-overview

## 1. 概述

### 1.1 任务目标

设计并文档化企业级运维管理平台的整体架构，包括系统边界、核心组件、模块划分和技术选型。本架构设计遵循 SpecKit 规范驱动开发方法论，为后续8个原子任务提供统一的架构指导。

### 1.2 产品定位

ops-platform 是一个企业级 AI 运维管理平台，提供以下核心能力：

- **多智能体管理**：集中管理、监控和调度多个 AI 编程智能体
- **任务编排**：可视化的工作流编排和任务调度
- **资源监控**：实时监控 AI 任务执行状态和资源使用
- **安全审计**：完整的操作审计和安全合规管理
- **计费管理**：基于使用量的计费和配额管理

### 1.3 核心用户故事

| 编号 | 角色 | 故事 | 价值 |
|------|------|------|------|
| US-01 | 运维管理员 | 平台管理员可以创建、配置和管理多个 AI 智能体 | 集中管理所有 AI 编程资源 |
| US-02 | 任务调度员 | 可以为不同任务分配不同的 AI 智能体执行 | 优化资源利用效率 |
| US-03 | 安全审计员 | 平台记录所有关键操作，支持合规审计 | 满足企业安全合规要求 |
| US-04 | 财务管理员 | 可以查看团队使用量统计和费用报表 | 成本控制和预算管理 |

## 2. 验收标准

### 2.1 功能验收标准

- [ ] 系统架构文档完整，包含所有核心组件说明
- [ ] API 规范文档使用 OpenAPI 3.0 格式
- [ ] 数据库 Schema 包含所有实体的完整定义
- [ ] 技术选型经过评估，有明确的选型理由
- [ ] 架构设计支持水平扩展
- [ ] 架构设计支持多租户隔离

### 2.2 非功能验收标准

- [ ] 系统支持 1000+ 并发用户
- [ ] API 响应时间 P95 < 200ms
- [ ] 系统可用性 99.9%
- [ ] 支持多活部署
- [ ] 数据持久化 RPO < 1小时

## 3. 系统架构

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              用户层                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Web 管理界面  │  │ VSCode 插件  │  │ CLI 工具     │  │ Git 机器人   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│                            API 网关层                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Kong / Traefik (API Gateway)                      │    │
│  │  - 认证授权  - 限流熔断  - 路由转发  - 请求日志                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│                           服务层                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ 认证服务      │  │ 用户服务      │  │ 智能体服务    │  │ 任务服务     │    │
│  │ Auth Service │  │ User Service │  │ Agent Service│  │ Task Service │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ 队列服务      │  │ 扫描服务      │  │ 计费服务      │  │ 审计服务     │    │
│  │ Queue Service│  │ Scan Service │  │ Billing Serv.│  │ Audit Service│    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│                            数据层                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ PostgreSQL   │  │ Redis        │  │ Kafka        │  │ S3 / MinIO   │    │
│  │ (主数据库)    │  │ (缓存/会话)   │  │ (消息队列)    │  │ (文件存储)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│                           外部集成                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ GitHub API   │  │ GitLab API   │  │ LLM Providers│  │ 安全扫描引擎 │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 核心组件说明

| 组件 | 职责 | 技术选型 | 部署模式 |
|------|------|----------|----------|
| API Gateway | 请求路由、认证、限流 | Kong / Traefik | Docker |
| Auth Service | 用户认证、授权 | Go + Gin | K8s Deployment |
| User Service | 用户管理、租户管理 | Go + Gin | K8s Deployment |
| Agent Service | 智能体生命周期管理 | Go + Gin | K8s Deployment |
| Task Service | 任务创建、调度、执行 | Go + Gin | K8s Deployment |
| Queue Service | 消息队列管理 | Go + Kafka | K8s Deployment |
| Scan Service | 代码安全扫描 | Go | K8s Job |
| Billing Service | 计费、配额管理 | Go + Gin | K8s Deployment |
| Audit Service | 审计日志记录 | Go + Gin | K8s Deployment |

### 3.3 微服务通信

#### 3.3.1 同步通信 (REST API)

```yaml
# API 设计规范
- 协议: HTTP/1.1 或 HTTP/2
- 格式: JSON
- 版本: /api/v1/*
- 认证: JWT Bearer Token
- 错误处理: 统一错误码格式
```

#### 3.3.2 异步通信 (事件驱动)

```yaml
# 事件总线: Kafka
- 事件格式: CloudEvents
- 消费者组: 按服务拆分
- 消息持久化: 7天
- 死信队列: 保留 30天
```

#### 3.3.3 服务发现

```yaml
- 方案: Kubernetes Service Discovery
- 负载均衡: Round Robin
- 健康检查: Liveness + Readiness Probes
```

## 4. 技术选型

### 4.1 后端技术栈

| 类别 | 技术 | 版本 | 选型理由 |
|------|------|------|----------|
| 语言 | Go | 1.21+ | 高性能、协程支持、生态成熟 |
| 框架 | Gin | 1.9+ | 性能优秀、简单易用 |
| ORM | Ent | 0.12+ | 类型安全、自动迁移、丰富功能 |
| 数据库 | PostgreSQL | 15+ | 可靠性、功能丰富 |
| 缓存 | Redis | 7.0+ | 高性能、丰富数据结构 |
| 消息队列 | Kafka | 3.x | 高吞吐、持久化 |
| 配置管理 | Consul | 1.15+ | 服务发现、配置中心 |

### 4.2 前端技术栈

| 类别 | 技术 | 版本 | 选型理由 |
|------|------|------|----------|
| 框架 | React | 18+ | 生态成熟、组件化 |
| 语言 | TypeScript | 5.0+ | 类型安全 |
| 状态管理 | Zustand | 4.x | 简单、性能好 |
| UI 组件 | Ant Design | 5.x | 企业级、丰富组件 |
| 构建工具 | Vite | 5.x | 快速、热更新 |

### 4.3 基础设施

| 类别 | 技术 | 用途 |
|------|------|------|
| 容器化 | Docker | 应用打包 |
| 编排 | Kubernetes | 服务编排 |
| CI/CD | GitHub Actions | 持续集成 |
| 监控 | Prometheus + Grafana | 指标监控 |
| 日志 | ELK Stack | 日志收集 |
| Tracing | Jaeger | 链路追踪 |

## 5. 数据模型

### 5.1 核心实体

```go
// User 用户实体
type User struct {
    ID        uuid.UUID
    TenantID  uuid.UUID
    Email     string
    Name      string
    Role      UserRole
    Status    UserStatus
    CreatedAt time.Time
    UpdatedAt time.Time
}

// Tenant 租户实体
type Tenant struct {
    ID          uuid.UUID
    Name        string
    Plan        TenantPlan
    Status      TenantStatus
    Quota       Quota
    CreatedAt   time.Time
    UpdatedAt   time.Time
}

// AIEmployee AI智能体实体
type AIEmployee struct {
    ID            uuid.UUID
    TenantID      uuid.UUID
    Name          string
    Position      AIEmployeePosition
    RepositoryURL string
    Platform      RepoPlatform
    Status        AIEmployeeStatus
    Config        AIEmployeeConfig
    CreatedAt     time.Time
    UpdatedAt     time.Time
}

// Task 任务实体
type Task struct {
    ID          uuid.UUID
    TenantID    uuid.UUID
    AgentID     uuid.UUID
    Type        TaskType
    Status      TaskStatus
    Input       TaskInput
    Output      TaskOutput
    Progress    int
    StartedAt   *time.Time
    CompletedAt *time.Time
    CreatedAt   time.Time
    UpdatedAt   time.Time
}
```

### 5.2 数据库 Schema

#### 5.2.1 用户相关表

```sql
-- tenants 表
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'free',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    quota JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- users 表
CREATE TABLE users (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user_groups 表
CREATE TABLE user_groups (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user_group_members 表
CREATE TABLE user_group_members (
    user_id UUID NOT NULL REFERENCES users(id),
    group_id UUID NOT NULL REFERENCES user_groups(id),
    PRIMARY KEY (user_id, group_id)
);
```

#### 5.2.2 智能体相关表

```sql
-- ai_employees 表
CREATE TABLE ai_employees (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100) NOT NULL,
    repository_url VARCHAR(500) NOT NULL,
    repository_user VARCHAR(255),
    platform VARCHAR(50) NOT NULL,
    token VARCHAR(500),
    webhook_secret VARCHAR(500),
    webhook_url VARCHAR(500),
    parameters JSONB DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'inactive',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ai_employee_configs 表
CREATE TABLE ai_employee_configs (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES ai_employees(id),
    model VARCHAR(100),
    system_prompt TEXT,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INT DEFAULT 4096,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5.2.3 任务相关表

```sql
-- tasks 表
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    agent_id UUID NOT NULL REFERENCES ai_employees(id),
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    input JSONB NOT NULL DEFAULT '{}',
    output JSONB DEFAULT '{}',
    progress INT DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- task_records 表
CREATE TABLE task_records (
    id UUID PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES tasks(id),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- task_queue 表
CREATE TABLE task_queue (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    task_type VARCHAR(100) NOT NULL,
    priority INT DEFAULT 0,
    payload JSONB NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'queued',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 6. API 设计

### 6.1 API 规范

API 规范使用 OpenAPI 3.0 格式，完整规范请参阅 [OPENAPI.yaml](OPENAPI.yaml)。

### 6.2 核心 API 端点

#### 6.2.1 认证 API

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/v1/auth/login | 用户登录 |
| POST | /api/v1/auth/register | 用户注册 |
| POST | /api/v1/auth/logout | 用户登出 |
| POST | /api/v1/auth/refresh | 刷新 Token |
| GET | /api/v1/auth/me | 获取当前用户 |

#### 6.2.2 用户 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/v1/users | 列出用户 |
| POST | /api/v1/users | 创建用户 |
| GET | /api/v1/users/{id} | 获取用户详情 |
| PUT | /api/v1/users/{id} | 更新用户 |
| DELETE | /api/v1/users/{id} | 删除用户 |

#### 6.2.3 智能体 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/v1/agents | 列出智能体 |
| POST | /api/v1/agents | 创建智能体 |
| GET | /api/v1/agents/{id} | 获取智能体详情 |
| PUT | /api/v1/agents/{id} | 更新智能体 |
| DELETE | /api/v1/agents/{id} | 删除智能体 |
| POST | /api/v1/agents/{id}/activate | 激活智能体 |
| POST | /api/v1/agents/{id}/deactivate | 停用智能体 |

#### 6.2.4 任务 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/v1/tasks | 列出任务 |
| POST | /api/v1/tasks | 创建任务 |
| GET | /api/v1/tasks/{id} | 获取任务详情 |
| DELETE | /api/v1/tasks/{id} | 取消任务 |
| GET | /api/v1/tasks/{id}/logs | 获取任务日志 |

### 6.3 错误码定义

| 错误码 | 描述 | HTTP 状态码 |
|--------|------|-------------|
| 40001 | 参数错误 | 400 |
| 40002 | 参数验证失败 | 400 |
| 40101 | 未授权 | 401 |
| 40102 | Token 过期 | 401 |
| 40301 | 禁止访问 | 403 |
| 40302 | 权限不足 | 403 |
| 40401 | 资源不存在 | 404 |
| 40901 | 资源冲突 | 409 |
| 42901 | 请求过于频繁 | 429 |
| 50001 | 服务器内部错误 | 500 |
| 50002 | 数据库错误 | 500 |

## 7. 安全设计

### 7.1 认证授权

#### 7.1.1 JWT Token 设计

```go
type JWTClaims struct {
    UserID    uuid.UUID `json:"user_id"`
    TenantID  uuid.UUID `json:"tenant_id"`
    Role      string    `json:"role"`
    ExpiresAt int64     `json:"expires_at"`
    IssuedAt  int64     `json:"issued_at"`
}

// Token 配置
const (
    AccessTokenExpiry  = 24 * time.Hour   // 24小时
    RefreshTokenExpiry = 7 * 24 * time.Hour // 7天
    Issuer             = "ops-platform"
)
```

#### 7.1.2 RBAC 权限模型

```go
// 角色定义
type Role string

const (
    RoleSuperAdmin Role = "super_admin"  // 超级管理员
    RoleTenantAdmin Role = "tenant_admin" // 租户管理员
    RoleDeveloper Role = "developer"     // 开发者
    RoleViewer Role = "viewer"           // 查看者
)

// 权限定义
type Permission string

const (
    PermManageUsers      Permission = "manage_users"
    PermManageAgents     Permission = "manage_agents"
    PermManageTasks      Permission = "manage_tasks"
    PermViewBilling      Permission = "view_billing"
    PermManageBilling    Permission = "manage_billing"
    PermViewAudit        Permission = "view_audit"
    PermManageSettings   Permission = "manage_settings"
)
```

### 7.2 数据安全

- **传输加密**: 所有 API 使用 HTTPS/TLS 1.3
- **存储加密**: 敏感数据（Token、密钥）使用 AES-256 加密
- **数据库隔离**: 多租户数据逻辑隔离
- **审计日志**: 所有关键操作记录审计日志

## 8. 实现步骤

### 阶段 1：项目初始化 (第1天)

1. 初始化 Go 项目结构
2. 配置 Ent ORM 和数据库连接
3. 设置 Gin 框架和中间件
4. 配置日志和监控
5. 初始化 Git 仓库和 CI/CD

### 阶段 2：核心实体实现 (第2天)

1. 实现 Tenant 实体和 Repository
2. 实现 User 实体和 Repository
3. 实现 AIEmployee 实体和 Repository
4. 实现 Task 实体和 Repository
5. 编写单元测试（覆盖率 > 80%）

### 阶段 3：认证授权 (第3天)

1. 实现 JWT Token 生成和验证
2. 实现登录/注册 API
3. 实现权限中间件
4. 实现 RBAC 逻辑
5. 编写集成测试

### 阶段 4：基础 API (第4天)

1. 实现用户管理 API
2. 实现智能体 CRUD API
3. 实现任务管理 API
4. 实现错误处理中间件
5. 编写 API 测试

### 阶段 5：基础设施集成 (第5天)

1. 配置 Redis 缓存
2. 配置 Kafka 消息队列
3. 配置 S3 文件存储
4. 配置监控指标
5. 完成部署配置

## 9. 测试用例

### 9.1 单元测试

```go
// 示例：用户服务测试
func TestUserService_CreateUser(t *testing.T) {
    // Arrange
    svc := NewUserService(mockRepo, mockCache)
    req := &CreateUserRequest{
        Email: "test@example.com",
        Name:  "Test User",
    }

    // Act
    user, err := svc.CreateUser(context.Background(), req)

    // Assert
    assert.NoError(t, err)
    assert.Equal(t, req.Email, user.Email)
    assert.Equal(t, req.Name, user.Name)
    mockRepo.AssertExpectations(t)
}
```

### 9.2 集成测试

```go
// 示例：API 集成测试
func TestAuthAPI_Login(t *testing.T) {
    // Setup test server
    server := NewTestServer()
    defer server.Close()

    // Test login
    resp := server.Post("/api/v1/auth/login", map[string]string{
        "email":    "test@example.com",
        "password": "password",
    })

    assert.Equal(t, 200, resp.StatusCode)
    assert.NotEmpty(t, resp.Body["access_token"])
}
```

## 10. 验收检查清单

### 10.1 功能验收

- [ ] 用户注册和登录功能正常
- [ ] 用户管理 CRUD 操作正常
- [ ] 智能体管理 CRUD 操作正常
- [ ] 任务创建和查询正常
- [ ] 权限控制生效
- [ ] 错误提示友好

### 10.2 性能验收

- [ ] API 响应时间 P95 < 200ms
- [ ] 支持 100 并发用户
- [ ] 数据库查询优化合理
- [ ] 缓存命中率高

### 10.3 安全验收

- [ ] JWT Token 安全
- [ ] 密码加密存储
- [ ] SQL 注入防护
- [ ] XSS 防护
- [ ] 审计日志完整

### 10.4 文档验收

- [ ] API 文档完整
- [ ] 代码注释清晰
- [ ] README 文档齐全
- [ ] 部署文档可用

---

**相关文档**
- [详细规格](SPECIFICATION.md)
- [API 设计](API_DESIGN.md)
- [数据模型](DATA_MODEL.md)
- [实现步骤](IMPLEMENTATION.md)
- [测试用例](TEST_CASES.md)

**前置依赖**
- 无（首个任务）

**后续任务**
- OP-002: 多智能体编排引擎
- OP-003: 任务调度与队列系统
- OP-007: 前端 UI 组件与页面
