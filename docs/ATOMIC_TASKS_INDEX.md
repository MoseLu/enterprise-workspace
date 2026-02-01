# 原子任务索引与导航

> 本文档提供所有原子任务的快速索引、依赖关系和导航指南。

## 文档目录结构

```
docs/
├── ops-platform-docs/                          # 运维管理平台
│   ├── 01-architecture/                        # 架构设计
│   │   ├── 01-system-overview/
│   │   │   ├── README.md                       # 系统概述
│   │   │   ├── REQUIREMENTS.md                 # 需求规格
│   │   │   └── VISION.md                       # 愿景与目标
│   │   ├── 02-domain-model/
│   │   │   ├── ENTITIES.md                     # 核心实体
│   │   │   ├── RELATIONSHIPS.md                # 关系模型
│   │   │   └── BUSINESS_RULES.md               # 业务规则
│   │   ├── 03-api-design/
│   │   │   ├── OPENAPI.yaml                    # OpenAPI 规范
│   │   │   └── ERROR_CODES.md                  # 错误码定义
│   │   └── 04-data-model/
│   │       ├── DATABASE_SCHEMA.md              # 数据库设计
│   │       └── MIGRATIONS.md                   # 迁移脚本
│   │
│   ├── 02-core-modules/                        # 核心模块
│   │   ├── 01-task-management/
│   │   │   ├── README.md                       # 任务管理概览
│   │   │   ├── SPECIFICATION.md                # 详细规格
│   │   │   ├── API_DESIGN.md                   # API 设计
│   │   │   ├── DATA_MODEL.md                   # 数据模型
│   │   │   ├── IMPLEMENTATION.md               # 实现步骤
│   │   │   └── TEST_CASES.md                   # 测试用例
│   │   ├── 02-agent-orchestrator/
│   │   │   ├── README.md                       # 编排器概览
│   │   │   ├── AGENT_SPEC.md                   # Agent 规格
│   │   │   ├── WORKFLOW_DEFINITION.md          # 工作流定义
│   │   │   ├── API_DESIGN.md                   # API 设计
│   │   │   └── IMPLEMENTATION.md               # 实现步骤
│   │   ├── 03-queue-system/
│   │   │   ├── README.md                       # 队列系统概览
│   │   │   ├── SPECIFICATION.md                # 规格说明
│   │   │   ├── DESIGN.md                       # 设计文档
│   │   │   └── IMPLEMENTATION.md               # 实现步骤
│   │   └── 04-webhook-handler/
│   │       ├── README.md                       # Webhook 概览
│   │       ├── SUPPORTED_PLATFORMS.md          # 支持的平台
│   │       ├── EVENT_MAPPING.md                # 事件映射
│   │       ├── SECURITY.md                     # 安全配置
│   │       └── IMPLEMENTATION.md               # 实现步骤
│   │
│   ├── 03-enterprise-features/                 # 企业功能
│   │   ├── 01-billing-system/
│   │   │   ├── README.md                       # 计费系统概览
│   │   │   ├── PLAN_DEFINITION.md              # 套餐定义
│   │   │   ├── USAGE_TRACKING.md               # 使用量追踪
│   │   │   ├── API_DESIGN.md                   # API 设计
│   │   │   └── IMPLEMENTATION.md               # 实现步骤
│   │   ├── 02-security-scanner/
│   │   │   ├── README.md                       # 安全扫描概览
│   │   │   ├── SCAN_RULES.md                   # 扫描规则
│   │   │   ├── INTEGRATION.md                  # 集成方式
│   │   │   └── IMPLEMENTATION.md               # 实现步骤
│   │   ├── 03-audit-logging/
│   │   │   ├── README.md                       # 审计日志概览
│   │   │   ├── LOG_EVENTS.md                   # 事件定义
│   │   │   ├── RETENTION_POLICY.md             # 保留策略
│   │   │   └── IMPLEMENTATION.md               # 实现步骤
│   │   └── 04-multi-tenant/
│   │       ├── README.md                       # 多租户概览
│   │       ├── TENANT_MODEL.md                 # 租户模型
│   │       ├── ISOLATION_STRATEGY.md           # 隔离策略
│   │       └── IMPLEMENTATION.md               # 实现步骤
│   │
│   ├── 04-frontend/                            # 前端设计
│   │   ├── 01-ui-components/
│   │   │   ├── COMPONENT_LIBRARY.md            # 组件库
│   │   │   ├── DESIGN_SYSTEM.md                # 设计系统
│   │   │   └── ATOMS.md                        # 原子组件
│   │   ├── 02-pages/
│   │   │   ├── DASHBOARD_PAGE.md               # 仪表盘页面
│   │   │   ├── AGENT_MANAGEMENT_PAGE.md        # Agent 管理页面
│   │   │   ├── TASK_MONITOR_PAGE.md            # 任务监控页面
│   │   │   └── BILLING_PAGE.md                 # 账单管理页面
│   │   └── 03-state-management/
│   │       ├── STATE_DESIGN.md                 # 状态设计
│   │       └── STORE_STRUCTURE.md              # Store 结构
│   │
│   └── 05-infrastructure/                      # 基础设施
│       ├── 01-deployment/
│       │   ├── DOCKER_COMPOSE.md               # Docker Compose
│       │   ├── KUBERNETES.md                   # K8s 配置
│       │   └── ENVIRONMENT.md                  # 环境配置
│       ├── 02-monitoring/
│       │   ├── METRICS.md                      # 指标定义
│       │   ├── ALERTING.md                     # 告警配置
│       │   and LOGGING.md                      # 日志配置
│       └── 03-security/
│           ├── AUTHENTICATION.md               # 认证配置
│           ├── AUTHORIZATION.md                # 授权配置
│           └── TLS_CONFIG.md                   # TLS 配置
│
└── devstation-docs/                            # 开发者工作站
    ├── 01-architecture/                        # 架构设计
    │   ├── 01-system-overview/
    │   │   ├── README.md                       # 系统概述
    │   │   └── REQUIREMENTS.md                 # 需求规格
    │   ├── 02-core-modules/
    │   │   ├── LOCAL_ENGINE.md                 # 本地引擎
    │   │   ├── CONTEXT_MANAGER.md              # 上下文管理
    │   │   └── TASK_ORCHESTRATOR.md            # 任务编排
    │   └── 03-data-model/
    │       └── LOCAL_STORAGE.md                # 本地存储
    │
    ├── 02-ai-integration/                      # AI 集成
    │   ├── 01-model-management/
    │   │   ├── README.md                       # 模型管理概览
    │   │   ├── OLLAMA_INTEGRATION.md           # Ollama 集成
    │   │   ├── API_PROVIDER.md                 # API 提供者
    │   │   and IMPLEMENTATION.md               # 实现步骤
    │   ├── 02-context-management/
    │   │   ├── README.md                       # 上下文管理概览
    │   │   ├── CONTEXT_FORMAT.md               # 上下文格式
    │   │   ├── MEMORY_SYSTEM.md                # 记忆系统
    │   │   and IMPLEMENTATION.md               # 实现步骤
    │   └── 03-code-intelligence/
    │       ├── README.md                       # 代码智能概览
    │       ├── COMPLETION_ENGINE.md            # 补全引擎
    │       and IMPLEMENTATION.md               # 实现步骤
    │
    ├── 03-ide-integration/                     # IDE 集成
    │   ├── 01-vscode-extension/
    │   │   ├── README.md                       # VSCode 扩展概览
    │   │   ├── COMMAND_DEFINITION.md           # 命令定义
    │   │   and IMPLEMENTATION.md               # 实现步骤
    │   ├── 02-ui-components/
    │   │   ├── SIDEBAR.md                      # 侧边栏设计
    │   │   and PANEL.md                        # 面板设计
    │   └── 03-communication/
    │       ├── PROTOCOL.md                     # 通信协议
    │       and IMPLEMENTATION.md               # 实现步骤
    │
    ├── 04-user-experience/                     # 用户体验
    │   ├── 01-onboarding/
    │   │   ├── README.md                       # 引导流程概览
    │   │   and IMPLEMENTATION.md               # 实现步骤
    │   ├── 02-preferences/
    │   │   ├── README.md                       # 偏好设置概览
    │   │   and CONFIG_SCHEMA.md                # 配置 Schema
    │   └── 03-shortcuts/
    │       └── KEYBINDINGS.md                  # 快捷键定义
    │
    └── 05-infrastructure/                      # 基础设施
        ├── 01-performance/
        │   ├── BENCHMARKS.md                   # 性能基准
        │   and OPTIMIZATION.md                 # 优化策略
        └── 02-security/
            └── LOCAL_SECURITY.md               # 本地安全配置
```

## 原子任务列表

### Ops-Platform 任务 (8个)

| 编号 | 任务名称 | 优先级 | 预估工时 | 负责人 | 状态 |
|------|----------|--------|----------|--------|------|
| OP-001 | 运维平台核心架构设计 | P0 | 1周 | 待分配 | ⏳ |
| OP-002 | 多智能体编排引擎 | P0 | 3周 | 待分配 | ⏳ |
| OP-003 | 任务调度与队列系统 | P0 | 2周 | 待分配 | ⏳ |
| OP-004 | Git 平台 Webhook 集成 | P1 | 2周 | 待分配 | ⏳ |
| OP-005 | 计费与配额管理系统 | P1 | 2周 | 待分配 | ⏳ |
| OP-006 | 安全扫描集成 | P1 | 2周 | 待分配 | ⏳ |
| OP-007 | 前端 UI 组件与页面 | P1 | 3周 | 待分配 | ⏳ |
| OP-008 | 部署与监控配置 | P2 | 1周 | 待分配 | ⏳ |

### DevStation 任务 (8个)

| 编号 | 任务名称 | 优先级 | 预估工时 | 负责人 | 状态 |
|------|----------|--------|----------|--------|------|
| DS-001 | 开发者工作站核心架构 | P0 | 1周 | 待分配 | ⏳ |
| DS-002 | 本地 Ollama 集成 | P0 | 2周 | 待分配 | ⏳ |
| DS-003 | 上下文管理系统 | P0 | 2周 | 待分配 | ⏳ |
| DS-004 | 代码补全引擎 | P1 | 2周 | 待分配 | ⏳ |
| DS-005 | VSCode 扩展开发 | P1 | 3周 | 待分配 | ⏳ |
| DS-006 | 用户引导与偏好设置 | P2 | 1周 | 待分配 | ⏳ |
| DS-007 | IDE 通信协议 | P1 | 1周 | 待分配 | ⏳ |
| DS-008 | 性能优化与本地安全 | P2 | 1周 | 待分配 | ⏳ |

## 依赖关系图

### Ops-Platform 依赖

```
OP-001 (架构设计)
    │
    ├── OP-002 (编排引擎) ────────┐
    │       │                     │
    │       ├── OP-003 (队列系统) │
    │       │                     │
    │       └── OP-004 (Webhook)  │
    │                             │
    ├── OP-005 (计费系统) ────────┤
    │                             │
    ├── OP-006 (安全扫描) ────────┤
    │                             │
    └── OP-007 (前端 UI) ─────────┴── OP-008 (部署监控)
```

### DevStation 依赖

```
DS-001 (架构设计)
    │
    ├── DS-002 (Ollama 集成)
    │       │
    │       └── DS-003 (上下文管理)
    │               │
    │               └── DS-004 (代码补全)
    │
    ├── DS-005 (VSCode 扩展)
    │       │
    │       ├── DS-007 (通信协议)
    │       │
    │       └── DS-006 (用户设置)
    │
    └── DS-008 (性能优化)
```

## 快速开始指南

### SubAgent 任务分配流程

1. **选择任务**：根据依赖关系和优先级选择可用任务
2. **阅读概览**：阅读任务目录下的 `README.md`
3. **详细规格**：阅读 `SPECIFICATION.md` 或 `REQUIREMENTS.md`
4. **API 设计**：如有需要，参考 `API_DESIGN.md`
5. **数据模型**：参考 `DATA_MODEL.md` 或 `DATABASE_SCHEMA.md`
6. **实现步骤**：按照 `IMPLEMENTATION.md` 逐步实现
7. **测试验证**：使用 `TEST_CASES.md` 验证功能

### 每个任务包含的文件

每个原子任务应包含以下标准文件：

```
task-id-task-name/
├── README.md                       # 任务概述和快速导航
├── SPECIFICATION.md                # 详细需求规格
├── API_DESIGN.md                   # API 接口设计（可选）
├── DATA_MODEL.md                   # 数据模型设计（可选）
├── IMPLEMENTATION.md               # 分步实现指南
├── TEST_CASES.md                   # 测试用例
└── CHECKLIST.md                    # 验收检查清单
```

## 文档编写规范

### 文件命名规则

- 使用 kebab-case（小写连字符）
- 使用英文名称
- 包含文档类型后缀（README, SPECIFICATION, DESIGN 等）

### 文档模板

#### README.md 模板

```markdown
# 任务名称

## 概述
[简短描述任务目标]

## 所属模块
[模块名称]

## 前置依赖
- [依赖任务列表]
- [依赖技术/工具]

## 验收标准
- [ ] 标准 1
- [ ] 标准 2
- [ ] 标准 3

## 交付物
- [ ] 交付物 1
- [ ] 交付物 2

## 预估工时
[X] 天

## 详细文档
- [详细规格](SPECIFICATION.md)
- [API 设计](API_DESIGN.md)
- [实现步骤](IMPLEMENTATION.md)
- [测试用例](TEST_CASES.md)
```

## 维护指南

### 文档更新流程

1. 在对应任务目录下创建/修改文档
2. 更新本索引文档的相关章节
3. 提交 PR 并关联相关任务

### 版本管理

- 每个任务文档使用独立版本号
- 格式：`MAJOR.MINOR.PATCH`
- 每次重大变更更新主版本号

## 常见问题

### Q1: 如何开始一个新任务？
A: 从 `README.md` 开始，按照文档顺序阅读和执行。

### Q2: 任务之间有冲突怎么办？
A: 参考依赖关系图，确认任务的执行顺序。

### Q3: 需要修改已有任务的范围？
A: 创建 Issue 讨论，评审后更新相关文档。

---

**文档版本**: 1.0.0  
**最后更新**: 2026-02-01  
**维护者**: 企业架构组
