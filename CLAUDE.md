# CLAUDE.md

> **企业工作空间项目配置** - AI 助手自动加载的规范配置文件
> 
> **重要提示**：本文件为项目主配置，所有 AI 助手启动时自动加载，无需手动操作。

---

## 自动加载状态

本项目采用多层次配置，确保所有 AI 助手自动遵守项目规范：

| AI 助手 | 配置读取 | 自动加载 |
|---------|----------|----------|
| Claude Code | CLAUDE.md + AGENTS.md | ✅ 自动 |
| Cursor | CLAUDE.md + .cursor/rules/ | ✅ 自动 |
| Windsurf | CLAUDE.md + AGENTS.md | ✅ 自动 |
| Codex CLI | CLAUDE.md + AGENTS.md | ✅ 自动 |
| 其他 AI | AGENTS.md | ✅ 自动 |

**加载优先级**：
1. `CLAUDE.md`（本文件）- 项目主配置
2. `AGENTS.md` - 多 Agent 详细配置
3. `RULE.md` - 详细规则说明
4. `.specify/memory/constitution.md` - 项目原则
5. `.cursor/rules/` - 具体规则

---

## 项目概述

**企业工作空间**是一个全链路协同编程系统，采用 SpecKit 规范驱动开发方法论。系统包含以下核心产品：

### 产品模块

| 产品 | 描述 | 技术栈 |
|------|------|--------|
| **agent-cli-web** | AI Agent 交互界面 | React 18 + TypeScript + Vite |
| **agent-orchestrator** | 多 Agent 编排调度平台 | Go + Gin + PostgreSQL |
| **ops-platform** | 运维管理平台 | React 18 + TypeScript + Go |
| **pc-admin** | 管理控制台 | Vue 3 + TypeScript + Element Plus |

---

## 开发方法论

### 规范驱动开发流程

本项目采用 GitHub SpecKit 规范驱动开发方法论，所有功能开发必须遵循以下流程：

```
需求定义 → 规格说明 → 技术规划 → 任务分解 → 实施开发 → 测试验收
```

**每个阶段都有对应的模板和支持文件：**

| 阶段 | 命令 | 输出文件 | 位置 |
|------|------|----------|------|
| 需求定义 | `/speckit.specify` | spec.md | specs/FEATURE-*/ |
| 技术规划 | `/speckit.plan` | plan.md | specs/FEATURE-*/ |
| 任务分解 | `/speckit.tasks` | tasks.md | specs/FEATURE-*/ |
| 实施开发 | `/speckit.implement` | 代码 | products/*/ |
| 测试验收 | 手动验证 | 测试报告 | reports/ |

### 可用命令

在 Claude Code 对话中，可使用以下命令：

**核心命令**：

| 命令 | 描述 |
|------|------|
| `/speckit.constitution` | 创建或更新项目治理原则 |
| `/speckit.specify` | 定义功能需求（what & why） |
| `/speckit.plan` | 创建技术实施计划（how） |
| `/speckit.tasks` | 生成可执行任务列表 |
| `/speckit.implement` | 执行所有开发任务 |

**辅助命令**：

| 命令 | 描述 |
|------|------|
| `/speckit.clarify` | 澄清规格中的模糊之处 |
| `/speckit.analyze` | 跨工件一致性分析 |
| `/speckit.checklist` | 生成质量检查清单 |

---

## 强制规则（必须遵守）

### 规则 R1：代码质量

#### TypeScript 严格模式

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**违规示例**：
```typescript
// ❌ 禁止：any 类型
function process(data: any) { return data.value; }

// ✅ 必须：明确类型
function process(data: { value: string }): string { return data.value; }
```

#### 错误处理

**Go 语言**：
```go
// ❌ 禁止：裸用 panic
if err != nil { panic(err) }

// ✅ 必须：返回错误
if err != nil { return nil, fmt.Errorf("failed: %w", err) }
```

**TypeScript**：
```typescript
// ❌ 禁止：忽略错误
fetch(url).then(r => r.json())

// ✅ 必须：处理错误
try {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
} catch (e) {
  throw new Error(`Fetch failed: ${e}`);
}
```

#### 测试覆盖率

- **核心业务逻辑**：不低于 80%
- **检查命令**：`npm run test:coverage`

### 规则 R2：安全性

#### 输入验证

所有用户输入必须验证和清理：

```typescript
// ❌ 禁止：直接使用输入（XSS/SQL 注入风险）
element.innerHTML = userInput;
db.query(`SELECT * FROM users WHERE name = '${username}'`);

// ✅ 必须：验证和清理
element.textContent = sanitize(userInput);
db.query('SELECT * FROM users WHERE name = ?', [username]);
```

#### 认证授权

所有 API 端点必须进行认证和授权：

```typescript
// ✅ 必须：认证中间件 + 授权检查
router.get('/api/admin/users', 
  authenticate,
  authorize('admin'),
  handler
);
```

#### 敏感数据

```typescript
// ❌ 禁止：明文存储密码
User.create({ password: rawPassword });

// ✅ 必须：加密存储
User.create({ password: await bcrypt.hash(rawPassword, 12) });
```

### 规则 R3：Git 规范

#### 提交信息（Conventional Commits）

```
<type>(<scope>): <description>

# 示例：
feat(auth): 添加用户登录功能
fix(db): 修复连接池泄漏问题
docs: 更新 API 文档
```

#### 分支命名

```
feature/TICKET-123-user-login
bugfix/TICKET-456-fix-crash
hotfix/TICKET-789-security-patch
```

---

## 推荐规则（应尽量遵守）

### R5：代码风格

| 元素 | 规范 | 示例 |
|------|------|------|
| 变量 | camelCase | `userName` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY` |
| 函数 | camelCase，动词开头 | `getUser()` |
| 类 | PascalCase | `UserController` |
| 文件 | kebab-case | `user-service.ts` |

### R6：性能

#### 避免 N+1 查询

```typescript
// ❌ 不好：循环查询
for (const user of users) {
  const posts = await Post.find({ userId: user.id });
}

// ✅ 好：预加载
const users = await User.findAll({ include: Post });
```

#### 使用缓存

```typescript
// ✅ 好：热点数据缓存
const cached = await redis.get(`product:${id}`);
if (cached) return JSON.parse(cached);
const product = await Product.findById(id);
await redis.set(`product:${id}`, JSON.stringify(product), 'EX', 3600);
return product;
```

---

## 项目结构

```
.enterprise-workspace/
├── CLAUDE.md                    ← 项目主配置（AI 自动加载）
├── AGENTS.md                    ← 多 AI 助手详细配置
├── RULE.md                      ← 详细规则说明
├── README.md                    ← 项目说明
├── CLAUDE.md
├── AGENTS.md
├── RULE.md
├── .specify/                    ← SpecKit 配置
│   ├── memory/
│   │   └── constitution.md      ← 项目原则
│   ├── templates/               ← 规范模板
│   │   ├── spec-template.md     ← 功能规格模板
│   │   ├── plan-template.md     ← 技术计划模板
│   │   └── tasks-template.md    ← 任务模板
│   ├── scripts/                 ← 自动化脚本
│   ├── INSTALL.md               ← 安装指南
│   ├── AUTO-LOAD.md             ← 自动加载说明
│   └── 使用指南.md              ← 完整教程
├── .cursor/                     ← Cursor 专用配置
│   └── rules/
│       └── spec-driven-development.jsonc  ← 规则配置
├── products/                    ← 产品模块
│   ├── agent-cli-web/
│   ├── agent-orchestrator/
│   ├── ops-platform/
│   └── pc-admin/
├── docs/                        ← 项目文档
├── scripts/                     ← 通用脚本
├── .github/                     ← GitHub 配置
├── .cicd/                       ← CI/CD 配置
└── docker-compose.yml           ← Docker 编排
```

---

## 技术栈指南

### 前端技术

| 类别 | 技术 | 版本要求 |
|------|------|----------|
| 框架 | React / Vue | 18+ / 3+ |
| 语言 | TypeScript | 5+ |
| 构建 | Vite | 5+ |
| 状态管理 | Zustand / Pinia | 最新 |
| UI 组件 | AntD / Element Plus | 最新 |
| 样式 | Tailwind CSS | 3+ |

### 后端技术

| 类别 | 技术 | 版本要求 |
|------|------|----------|
| 语言 | Go / Python | 1.21+ / 3.11+ |
| 框架 | Gin / FastAPI | 最新 |
| 数据库 | PostgreSQL / MongoDB | 14+ / 6+ |
| 缓存 | Redis | 7+ |
| 消息队列 | Kafka / RabbitMQ | 3.x / 3.12+ |

### 基础设施

| 类别 | 技术 |
|------|------|
| 容器化 | Docker |
| 编排 | Kubernetes / Docker Compose |
| CI/CD | GitHub Actions / Jenkins |
| 监控 | Prometheus / Grafana |

---

## 常用命令

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 代码格式化
npm run format
```

### 测试

```bash
# 运行所有测试
npm test

# 测试覆盖率
npm run test:coverage

# E2E 测试
npm run test:e2e
```

### 构建部署

```bash
# 构建
npm run build
docker build -t app:latest .

# 部署
docker-compose up -d
./scripts/cd/deploy-prod.sh
```

---

## 质量门禁

代码合并前必须通过以下检查：

| 检查项 | 要求 | 命令 |
|--------|------|------|
| 类型检查 | 无错误 | `npm run type-check` |
| 代码检查 | ESLint 通过 | `npm run lint` |
| 格式化 | Prettier 通过 | `npm run format:check` |
| 单元测试 | 全部通过 | `npm test` |
| 覆盖率 | ≥80% | `npm run test:coverage` |
| 构建 | 成功 | `npm run build` |

---

## 故障排查

### 规范未加载

```bash
# 检查配置文件
ls -la CLAUDE.md AGENTS.md RULE.md
ls -la .specify/memory/
ls -la .cursor/rules/

# 查看文件内容
head -50 CLAUDE.md
```

### 依赖问题

```bash
# 重新安装
rm -rf node_modules package-lock.json
npm install

# Go 依赖
go mod tidy
```

### 测试失败

```bash
# 详细输出
npm test -- --verbose

# 覆盖率报告
open coverage/lcov-report/index.html
```

### 端口冲突

```bash
# Windows
netstat -ano | findstr :3000

# Linux/macOS
lsof -i :3000

# 解决方案：修改 .env 中的 PORT
```

---

## 文档链接

| 文档 | 位置 | 描述 |
|------|------|------|
| 主配置 | CLAUDE.md | 本文件 |
| 详细规则 | RULE.md | 完整规则说明 |
| 多 Agent | AGENTS.md | 所有 AI 助手配置 |
| SpecKit | .specify/ | 规范驱动开发配置 |
| 开发规范 | docs/development/ | 开发相关文档 |
| 架构文档 | docs/architecture/ | 系统架构 |
| API 文档 | docs/api/ | 接口文档 |

---

## AI 协作最佳实践

本项目采用基于 Claude Code 之父 Boris Cherny 分享的十大技巧，结合 Cursor subagent 模式进行高效协作。

### 核心原则

| # | 技巧 | 说明 |
|---|------|------|
| 1 | 计划模式优先 | 复杂任务先规划，避免返工 |
| 2 | CLAUDE.md 持续迭代 | 记录错误和规则，降低 AI 错误率 |
| 3 | Subagent 模式 | 任务分解与隔离，保持上下文整洁 |
| 4 | 自动化修复 | CI 失败、生产问题快速响应 |
| 5 | 提示词优化 | 明确约束，提升输出质量 |

### 相关文档

- [AI Coding 最佳实践](../docs/devstation-docs/02-ai-integration/04-ai-coding-best-practices.md)
- [任务规划模板](../docs/devstation-docs/02-ai-integration/05-planning-template.md)
- [编码规范速查表](../docs/development/coding-standards-quick-ref.md)
- [Subagent 使用指南](../docs/devstation-docs/02-ai-integration/06-subagent-guide.md)

### 快速开始

1. 阅读 `04-ai-coding-best-practices.md` 了解完整技巧
2. 复杂任务使用 `05-planning-template.md` 进行规划
3. 遵循 `coding-standards-quick-ref.md` 确保代码质量
4. 使用 subagent 时参考 `06-subagent-guide.md`

### 常见场景

**功能开发**：
- 规划阶段：使用模板明确需求和技术方案
- 执行阶段：使用 subagent 并行处理子任务
- 评审阶段：检查类型检查、测试覆盖、lint 通过

**Bug 修复**：
- 分析日志，确定根本原因
- 制定修复方案，评估回归风险
- 实施修复，运行验证
- 记录问题和解决方案

---

## 贡献指南

1. 创建分支：`git checkout -b feature/xxx`
2. 遵循规范开发
3. 提交前检查：`npm run check`
4. 创建 Pull Request
5. 通过审查后合并

---

## RAG Knowledge Base 集成

### 启用状态

本项目已集成 **RAG Knowledge Base** 系统，提供智能知识检索能力。

### 知识库位置

| 组件 | 路径 |
|------|------|
| 主模块 | `knowledge-base/RAG/` |
| 知识索引 | `knowledge-base/RAG/knowledge-index.json` |
| 概念图谱 | `knowledge-base/RAG/knowledge-graph.json` |
| 类型定义 | `knowledge-base/RAG/types/index.ts` |

### 核心功能

#### 1. 知识检索
- **组件检索**：搜索 UI 组件的定义、Props、Events
- **Hook 检索**：搜索 React Hooks 的签名和使用方式
- **模式检索**：搜索设计模式和最佳实践
- **文档检索**：搜索项目文档和决策记录

#### 2. 智能预加载
- 根据用户意图自动预加载相关知识
- 基于项目结构预测性加载依赖
- 多级缓存确保毫秒级响应

#### 3. 知识图谱遍历
- 通过概念关系发现相关知识
- 支持多跳关系遍历（默认深度 3）
- 可按关系类型过滤

### 使用方式

```typescript
import { KnowledgeLoader, getKnowledgeLoader } from 'knowledge-base/RAG';

// 获取知识加载器实例
const loader = getKnowledgeLoader({
  basePath: './knowledge-base/RAG',
  enableHotReload: true
});

// 加载所有知识
await loader.loadAll();

// 检索组件
const menuComponent = loader.findByAlias('Menu');
const related = loader.findRelated(menuComponent.id);

// 按类别检索
const allHooks = loader.getByCategory('HOOK');
const frontendComponents = loader.getByDomain('frontend');

// 图谱遍历
const graph = loader.getConceptGraph();
const relatedNodes = loader.traverseGraph('component:shared.Menu', 2);
```

### 触发词自动检索

当用户询问以下类型问题时，系统自动检索知识库：

| 模式 | 示例 | 检索类型 |
|------|------|----------|
| 在哪里/位置/定义 | "Menu 组件在哪里？" | 组件定位 |
| 如何使用/API | "useMenu 怎么用？" | API 检索 |
| 是什么 | "ThemeProvider 是什么？" | 概念理解 |
| 相关/关联 | "Menu 相关组件有哪些？" | 关系发现 |
| 规范/最佳实践 | "表单验证最佳实践" | 模式检索 |

### 性能指标

| 指标 | 目标值 |
|------|--------|
| 检索延迟 P50 | < 100ms |
| 检索延迟 P95 | < 300ms |
| L1 缓存命中率 | > 70% |
| 知识条目数量 | 100+ |

---

## 知识库贡献指南

### 添加新组件知识

1. 在 `knowledge-index.json` 中添加组件条目
2. 更新 `knowledge-graph.json` 添加节点和关系
3. 运行验证确保结构正确
4. 提交 PR

### 知识分类

| 类别 | 说明 | 示例 |
|------|------|------|
| COMPONENT | UI 组件 | Menu, Table, Form |
| HOOK | React Hooks | useMenuState, useTheme |
| UTILITY | 工具函数 | formatDate, parseJSON |
| TYPE | 类型定义 | MenuProps, UserConfig |
| PATTERN | 设计模式 | Factory, Singleton |
| DECISION | 架构决策 | ADR-001, ADR-002 |
| DOCUMENT | 文档 | README, GUIDE |

---

---

## Qwen 低成本模型集成配置

本项目已集成通义千问 Qwen 低成本模型系列，通过知识库自动调用实现无缝模型切换，优化开发成本。

### Qwen 模型配置总览

| 模型类型 | 模型名称 | 成本等级 | 适用场景 |
|----------|----------|----------|----------|
| 通用系列 | qwen-flash | 💰💰 | 简单问答、文本处理、快速迭代 |
| 通用系列 | qwen-turbo | 💰💰💰 | 日常开发、代码注释、文档生成 |
| 通用系列 | qwen-plus | 💰💰💰💰 | 复杂任务、代码审查 |
| Coder 系列 | qwen3-coder-flash | 💰💰 | 代码专用低成本、基础代码补全 |
| Coder 系列 | qwen-coder-flash | 💰💰 | 代码补全、快速开发 |
| Coder 系列 | qwen-coder-turbo | 💰💰💰 | 中等复杂度代码任务 |
| Coder 系列 | qwen-coder-plus | 💰💰💰💰 | 高质量代码生成 |
| 视觉系列 | qwen-vl-max | 💰💰💰💰💰 | 多模态图像处理 |

### 推荐模型使用优先级

#### 日常开发首选（低成本）

| 优先级 | 模型 | 成本 | 推荐度 |
|--------|------|------|--------|
| 1 | qwen-flash | 💰💰 | ⭐⭐⭐⭐⭐ |
| 2 | qwen-turbo | 💰💰💰 | ⭐⭐⭐⭐⭐ |
| 3 | qwen3-coder-flash | 💰 | ⭐⭐⭐⭐ |
| 4 | qwen-coder-flash | 💰💰 | ⭐⭐⭐⭐ |

#### 代码开发专用矩阵

| 任务类型 | 首选模型 | 降级模型 | 成本控制 |
|----------|----------|----------|----------|
| 代码注释 | qwen3-coder-flash | qwen-flash | 最优 |
| 代码补全 | qwen-coder-flash | qwen3-coder-flash | 优 |
| 简单重构 | qwen-coder-flash | qwen-turbo | 良 |
| 代码审查 | qwen-plus | qwen-turbo | 中 |
| 复杂重构 | qwen-coder-plus | qwen-plus | 中高 |

### 知识库自动模型选择

#### 触发条件与模型映射

| 知识库操作 | 触发条件 | 推荐模型 | 降级方案 |
|------------|----------|----------|----------|
| 组件检索 | 简单属性查询 | qwen-flash | 无需降级 |
| Hook 检索 | API 查找 | qwen-turbo | qwen-flash |
| 模式检索 | 最佳实践查询 | qwen-turbo | qwen-flash |
| 文档检索 | 概念理解 | qwen-plus | qwen-turbo |
| 关系发现 | 复杂图遍历 | qwen-plus | qwen-turbo |
| 多跳推理 | 深度分析 | qwen-plus | qwen-coder-plus |

#### 自动切换策略

```typescript
// 知识库模型自动选择配置
interface ModelSelectionConfig {
  // 基础检索（简单查询）
  basicRetrieval: {
    default: 'qwen-flash',
    fallback: []
  },
  // 标准检索（常规操作）
  standardRetrieval: {
    default: 'qwen-turbo',
    fallback: ['qwen-flash']
  },
  // 深度检索（复杂理解）
  deepRetrieval: {
    default: 'qwen-plus',
    fallback: ['qwen-turbo', 'qwen-flash']
  },
  // 代码相关检索
  codeRetrieval: {
    default: 'qwen3-coder-flash',
    fallback: ['qwen-coder-flash', 'qwen-turbo']
  }
}
```

### OpenCode 集成配置

#### 配置文件位置

```
C:\Users\mlu\.config\opencode\opencode.json
```

#### 推荐低成本模型配置

```json
{
  "qwen": {
    "name": "通义千问 Qwen（低成本组合）",
    "npm": "@ai-sdk/openai",
    "options": {
      "baseURL": "https://dashscope.aliyuncs.com/compatible-mode/v1",
      "apiKey": "sk-18ef2958ce844b6b893f4c13427c7e62"
    },
    "models": {
      "qwen-flash": {
        "name": "Qwen-Flash（极速低成本）",
        "modalities": { "input": ["text"], "output": ["text"] },
        "limit": { "context": 128000, "output": 8192 },
        "costLevel": "lowest",
        "useCase": "简单问答、文本处理"
      },
      "qwen-turbo": {
        "name": "Qwen-Turbo（性价比首选）",
        "modalities": { "input": ["text"], "output": ["text"] },
        "limit": { "context": 128000, "output": 8192 },
        "costLevel": "low",
        "useCase": "日常开发、代码注释"
      },
      "qwen3-coder-flash": {
        "name": "Qwen3-Coder-Flash（代码专用低成本）",
        "modalities": { "input": ["text"], "output": ["text"] },
        "limit": { "context": 128000, "output": 8192 },
        "costLevel": "lowest",
        "useCase": "代码注释、简单代码"
      },
      "qwen-coder-flash": {
        "name": "Qwen-Coder-Flash（代码补全低成本）",
        "modalities": { "input": ["text"], "output": ["text"] },
        "limit": { "context": 128000, "output": 8192 },
        "costLevel": "low",
        "useCase": "代码补全、快速开发"
      }
    }
  }
}
```

### 成本优化最佳实践

#### 分层使用策略

| 场景 | 推荐模型 | 成本控制 |
|------|----------|----------|
| 简单问答 | qwen-flash | 最低成本 |
| 代码注释 | qwen3-coder-flash | 代码专用，便宜 |
| 代码补全 | qwen-coder-flash | 快速响应 |
| 文档生成 | qwen-turbo | 质量与成本平衡 |
| 代码审查 | qwen-plus | 需要更好理解力 |
| 复杂重构 | qwen-coder-plus | 高质量代码 |

#### 成本监控与限额

| 监控项 | 配置位置 | 建议值 |
|--------|----------|--------|
| API 调用限额 | 智谱控制台 | 每日 10 万 tokens |
| 成本预警 | 自定义 | 月度成本 > 100 元 |
| 模型降级 | 知识库配置 | 自动触发 |

#### 缓存策略

```typescript
// 知识库检索结果缓存配置
interface CacheConfig {
  // 简单查询缓存（使用 qwen-flash）
  basicQueryTTL: 3600,        // 1 小时
  // 标准查询缓存（使用 qwen-turbo）
  standardQueryTTL: 1800,     // 30 分钟
  // 深度查询缓存（使用 qwen-plus）
  deepQueryTTL: 900,          // 15 分钟
  // 代码查询缓存（使用 qwen3-coder-flash）
  codeQueryTTL: 7200          // 2 小时
}
```

### 成本参考（相对值）

基于智谱官方定价（参考值）：

| 模型 | 输入成本 | 输出成本 | 相对值 |
|------|----------|----------|--------|
| qwen-flash | 0.002 元/千 tokens | 0.004 元/千 tokens | 1x（基准） |
| qwen-turbo | 0.004 元/千 tokens | 0.008 元/千 tokens | 2x |
| qwen-plus | 0.02 元/千 tokens | 0.06 元/千 tokens | 10-15x |
| qwen-max | 0.04 元/千 tokens | 0.12 元/千 tokens | 20-30x |

### 月均成本估算

| 使用模式 | 推荐组合 | 月均成本估算 |
|----------|----------|--------------|
| 主力开发 | qwen-flash + qwen-turbo | < 15 元/月 |
| 代码专用 | qwen3-coder-flash | < 5 元/月 |
| 轻量使用 | qwen-flash 为主 | < 10 元/月 |
| 全功能 | qwen-flash + qwen-plus | < 50 元/月 |

### 立即启用步骤

1. **配置 OpenCode**：在 `opencode.json` 中添加上述 Qwen 模型配置
2. **更新知识库**：在 `knowledge-base/RAG/` 中配置模型自动选择规则
3. **设置限额**：在智谱控制台设置 API 调用限额
4. **监控成本**：定期检查 API 调用量和成本消耗

### 故障排查

| 问题 | 解决方案 |
|------|----------|
| 模型调用失败 | 检查 API Key 和 baseURL 配置 |
| 成本异常 | 检查是否有模型误用，启用缓存 |
| 响应慢 | 确认使用了正确的低成本模型 |
| 切换失效 | 检查知识库模型选择配置是否正确 |

---

## 模型限流自动切换配置

本项目已集成模型限流（429 错误）自动检测与切换机制，当模型额度用完或触发限流时自动降级到备选模型。

### 限流错误处理策略

#### 错误类型识别

| 错误代码 | 错误类型 | 处理策略 |
|----------|----------|----------|
| 429 | Rate Limit（请求频率限制） | 等待后重试，超限则切换模型 |
| 429_1 | Token 额度用尽 | 立即切换模型 |
| 429_2 | 请求并发超限 | 排队重试，超时切换 |
| 429_3 | 账户额度耗尽 | 切换到备用账户模型 |
| 500 | 服务器内部错误 | 重试后切换 |
| 503 | 服务不可用 | 立即切换 |

#### 自动切换触发条件

```typescript
// 限流错误自动切换配置
interface RateLimitConfig {
  // 是否启用自动切换
  enableAutoSwitch: true,

  // 最大重试次数（切换前）
  maxRetriesBeforeSwitch: 2,

  // 重试间隔（毫秒）
  retryDelay: 1000,

  // 指数退避因子
  exponentialBackoff: 2,

  // 单模型连续失败阈值
  maxConsecutiveFailures: 3,

  // 全局限流阈值（全局失败次数）
  globalFailureThreshold: 10,

  // 冷却时间（毫秒）
  cooldownPeriod: 60000,

  // 切换后的恢复检查间隔
  recoveryCheckInterval: 300000
}
```

### 模型降级优先级链

#### 低成本模型降级链

```typescript
// 模型降级配置
const modelFallbackChains = {
  // 通用系列降级链
  'qwen-plus': ['qwen-turbo', 'qwen-flash'],
  'qwen-turbo': ['qwen-flash'],
  'qwen-flash': [],

  // Coder 系列降级链
  'qwen-coder-plus': ['qwen-coder-turbo', 'qwen-coder-flash', 'qwen3-coder-flash'],
  'qwen-coder-turbo': ['qwen-coder-flash', 'qwen3-coder-flash'],
  'qwen-coder-flash': ['qwen3-coder-flash'],
  'qwen3-coder-flash': [],

  // 视觉系列降级链
  'qwen-vl-max': ['qwen-vl-plus', 'qwen-plus'],
  'qwen-vl-plus': ['qwen-plus', 'qwen-turbo', 'qwen-flash'],

  // 跨系列通用降级（终极备选）
  'qwen-any': ['qwen-flash', 'qwen3-coder-flash']
}
```

#### 知识库操作降级链

```typescript
// 知识库操作模型降级配置
const knowledgeBaseFallbackConfig = {
  // 基础检索降级链
  basicRetrieval: {
    primary: 'qwen-flash',
    fallbackChain: [],
    retryOn429: true,
    maxRetries: 1
  },

  // 标准检索降级链
  standardRetrieval: {
    primary: 'qwen-turbo',
    fallbackChain: ['qwen-flash'],
    retryOn429: true,
    maxRetries: 2
  },

  // 深度检索降级链
  deepRetrieval: {
    primary: 'qwen-plus',
    fallbackChain: ['qwen-turbo', 'qwen-flash'],
    retryOn429: true,
    maxRetries: 3
  },

  // 代码检索降级链
  codeRetrieval: {
    primary: 'qwen3-coder-flash',
    fallbackChain: ['qwen-coder-flash', 'qwen-turbo', 'qwen-flash'],
    retryOn429: true,
    maxRetries: 2
  }
}
```

### 自动切换决策引擎

#### 切换决策逻辑

```typescript
// 自动切换决策引擎配置
interface SwitchDecisionEngine {
  // 决策因素权重
  factors: {
    // 错误类型权重
    errorType: {
      '429_1': 1.0,    // 额度用尽 - 最高优先级切换
      '429_2': 0.8,    // 并发超限 - 高优先级切换
      '429_3': 1.0,    // 账户耗尽 - 最高优先级切换
      '500': 0.3,      // 服务器错误 - 低权重切换
      '503': 0.9       // 服务不可用 - 高优先级切换
    },

    // 响应时间权重
    responseTime: {
      // 超过此阈值考虑切换（毫秒）
      threshold: 30000,
      // 权重因子
      factor: 0.2
    },

    // 连续失败权重
    consecutiveFailures: {
      // 超过此次数触发切换
      threshold: 3,
      // 权重因子
      factor: 0.4
    }
  },

  // 切换决策算法
  decisionAlgorithm: 'weighted_score',

  // 切换阈值（综合分数）
  switchThreshold: 0.7
}

// 决策流程
const switchDecisionFlow = [
  '1. 检测到错误响应（429/500/503）',
  '2. 记录错误类型和上下文',
  '3. 计算综合分数 = 错误类型权重 × 1.0 + 连续失败权重 + 响应时间权重',
  '4. 如果分数 >= 0.7，触发模型切换',
  '5. 从降级链中选择下一个模型',
  '6. 标记原模型为冷却状态',
  '7. 使用新模型重试请求',
  '8. 记录切换日志'
]
```

### 健康检查与故障转移

#### 模型健康状态监控

```typescript
// 模型健康状态配置
interface ModelHealthConfig {
  // 健康检查间隔（毫秒）
  checkInterval: 60000,

  // 连续健康检查失败阈值
  consecutiveFailureThreshold: 3,

  // 恢复检测阈值
  recoveryThreshold: 5,

  // 不健康模型冷却时间（毫秒）
  unhealthyCooldown: 300000,

  // 健康状态评分
  healthScore: {
    // 成功响应加分
    successBonus: 10,
    // 限流扣分
    rateLimitPenalty: 30,
    // 错误扣分
    errorPenalty: 50,
    // 超时扣分
    timeoutPenalty: 20,
    // 最低健康分数
    minHealthScore: 30
  }
}

// 健康状态类型
type ModelHealthStatus =
  | 'healthy'      // 健康（分数 >= 80）
  | 'degraded'     // 降级（分数 50-80）
  | 'unhealthy'     // 不健康（分数 < 50）
  | 'cooling'      // 冷却中
  | 'recovering'   // 恢复中
```

#### 故障转移配置

```typescript
// 故障转移配置
interface FailoverConfig {
  // 是否启用故障转移
  enableFailover: true,

  // 故障转移触发条件
  triggerConditions: {
    // 连续限流次数
    consecutiveRateLimits: 5,
    // 连续错误次数
    consecutiveErrors: 10,
    // 平均响应时间超标（毫秒）
    avgResponseTimeThreshold: 60000,
    // 错误率超标（百分比）
    errorRateThreshold: 0.3
  },

  // 故障转移目标
  failoverTargets: [
    {
      name: 'primary-fallback',
      models: ['qwen-turbo', 'qwen-flash', 'qwen3-coder-flash'],
      description: '主模型降级链'
    },
    {
      name: 'emergency',
      models: ['qwen-flash'],
      description: '紧急模式 - 只用最便宜模型'
    },
    {
      name: 'cross-series',
      models: ['qwen-coder-flash', 'qwen3-coder-flash'],
      description: '跨系列降级'
    }
  ],

  // 故障转移恢复策略
  recoveryStrategy: {
    // 恢复检查间隔（毫秒）
    checkInterval: 120000,
    // 恢复成功率阈值
    successRateThreshold: 0.9,
    // 恢复连续成功次数
    consecutiveSuccessRequired: 3,
    // 自动恢复时间（毫秒）
    autoRestoreTimeout: 3600000
  }
}
```

### OpenCode 集成配置（完整版）

#### 完整配置模板

```json
{
  "qwen": {
    "name": "通义千问 Qwen（低成本智能切换版）",
    "npm": "@ai-sdk/openai",
    "options": {
      "baseURL": "https://dashscope.aliyuncs.com/compatible-mode/v1",
      "apiKey": "sk-18ef2958ce844b6b893f4c13427c7e62"
    },
    "models": {
      "qwen-flash": {
        "name": "Qwen-Flash（极速低成本）",
        "modalities": { "input": ["text"], "output": ["text"] },
        "limit": { "context": 128000, "output": 8192 },
        "costLevel": "lowest",
        "priority": 1,
        "fallbackIndex": 0,
        "healthStatus": "healthy",
        "useCase": "简单问答、文本处理"
      },
      "qwen-turbo": {
        "name": "Qwen-Turbo（性价比首选）",
        "modalities": { "input": ["text"], "output": ["text"] },
        "limit": { "context": 128000, "output": 8192 },
        "costLevel": "low",
        "priority": 2,
        "fallbackIndex": 1,
        "healthStatus": "healthy",
        "useCase": "日常开发、代码注释"
      },
      "qwen3-coder-flash": {
        "name": "Qwen3-Coder-Flash（代码专用低成本）",
        "modalities": { "input": ["text"], "output": ["text"] },
        "limit": { "context": 128000, "output": 8192 },
        "costLevel": "lowest",
        "priority": 3,
        "fallbackIndex": 2,
        "healthStatus": "healthy",
        "useCase": "代码注释、简单代码"
      },
      "qwen-coder-flash": {
        "name": "Qwen-Coder-Flash（代码补全低成本）",
        "modalities": { "input": ["text"], "output": ["text"] },
        "limit": { "context": 128000, "output": 8192 },
        "costLevel": "low",
        "priority": 4,
        "fallbackIndex": 3,
        "healthStatus": "healthy",
        "useCase": "代码补全、快速开发"
      },
      "qwen-plus": {
        "name": "Qwen-Plus（通用增强版）",
        "modalities": { "input": ["text"], "output": ["text"] },
        "limit": { "context": 128000, "output": 8192 },
        "costLevel": "medium",
        "priority": 5,
        "fallbackIndex": 6,
        "healthStatus": "healthy",
        "useCase": "复杂任务、代码审查"
      },
      "qwen-coder-plus": {
        "name": "Qwen-Coder-Plus（代码增强版）",
        "modalities": { "input": ["text"], "output": ["text"] },
        "limit": { "context": 128000, "output": 8192 },
        "costLevel": "medium-high",
        "priority": 6,
        "fallbackIndex": 7,
        "healthStatus": "healthy",
        "useCase": "高质量代码生成"
      }
    },
    "rateLimitConfig": {
      "enableAutoSwitch": true,
      "maxRetriesBeforeSwitch": 2,
      "retryDelay": 1000,
      "exponentialBackoff": 2,
      "maxConsecutiveFailures": 3,
      "cooldownPeriod": 60000
    },
    "healthConfig": {
      "checkInterval": 60000,
      "consecutiveFailureThreshold": 3,
      "minHealthScore": 30,
      "unhealthyCooldown": 300000
    },
    "fallbackChains": {
      "qwen-plus": ["qwen-turbo", "qwen-flash"],
      "qwen-turbo": ["qwen-flash"],
      "qwen-coder-plus": ["qwen-coder-turbo", "qwen-coder-flash", "qwen3-coder-flash"],
      "qwen-coder-turbo": ["qwen-coder-flash", "qwen3-coder-flash"],
      "qwen-coder-flash": ["qwen3-coder-flash"],
      "qwen3-coder-flash": []
    }
  }
}
```

### 限流日志与监控

#### 日志记录配置

```typescript
// 限流日志配置
interface RateLimitLoggingConfig {
  // 是否启用详细日志
  enableVerboseLogging: true,

  // 记录内容
  logContent: [
    'timestamp',
    'modelName',
    'errorType',
    'errorCode',
    'retryCount',
    'switchedTo',
    'responseTime',
    'fallbackChain',
    'healthScore'
  ],

  // 日志级别
  logLevel: {
    '429_1': 'WARN',     // 额度用尽
    '429_2': 'INFO',     // 并发超限
    '429_3': 'ERROR',    // 账户耗尽
    '500': 'WARN',
    '503': 'ERROR'
  },

  // 告警阈值
  alertThreshold: {
    // 每小时切换次数告警
    hourlySwitchAlert: 10,
    // 每日额度耗尽告警
    dailyQuotaDepletedAlert: 3,
    // 连续故障告警
    consecutiveFailureAlert: 5
  }
}
```

### 百炼平台联动配置

#### 额度监控与自动切换

```typescript
// 百炼平台联动配置
interface BailianIntegrationConfig {
  // 启用额度监控
  enableQuotaMonitoring: true,

  // 额度检查间隔（毫秒）
  quotaCheckInterval: 60000,

  // 剩余额度阈值（百分比）
  lowQuotaThreshold: 0.1,

  // 额度用尽处理
  quotaExhaustedAction: {
    // 是否自动切换模型
    autoSwitch: true,
    // 切换到备用模型组
    fallbackGroup: 'lowest-cost',
    // 发送告警
    sendAlert: true,
    // 记录日志
    logEvent: true
  },

  // API 响应监控
  apiResponseMonitoring: {
    // 检测 429 错误
    detect429: true,
    // 提取错误详情
    extractErrorDetails: true,
    // 同步更新本地状态
    syncLocalStatus: true
  }
}
```

### 立即启用步骤（完整版）

1. **更新 OpenCode 配置**：复制上述完整 JSON 模板到 `opencode.json`
2. **配置百炼平台**：在百炼平台设置每日调用限额（建议 100 万 tokens）
3. **启用监控**：确保日志系统已配置
4. **设置告警**：配置企业微信/钉钉告警 webhook
5. **验证切换**：手动测试 429 错误触发自动切换

### 故障排查（限流相关）

| 问题 | 排查步骤 | 解决方案 |
|------|----------|----------|
| 429 错误频繁 | 1. 检查日志确认错误类型<br>2. 查看模型降级链<br>3. 检查并发请求数 | 启用自动切换，增加降级模型 |
| 切换未触发 | 1. 检查 maxRetriesBeforeSwitch<br>2. 验证 healthScore<br>3. 查看 cooldownPeriod | 调整切换阈值，缩短冷却时间 |
| 模型未恢复 | 1. 检查 recoveryCheckInterval<br>2. 验证 consecutiveSuccessRequired<br>3. 查看 autoRestoreTimeout | 调整恢复策略，手动重置状态 |
| 日志缺失 | 1. 检查 enableVerboseLogging<br>2. 验证 logLevel 配置<br>3. 查看日志收集系统 | 启用详细日志，确认日志路径 |

---

## 150+ 模型精简配置策略

本项目从 150+ Qwen 模型中精选最实用的模型子集，平衡成本与能力，满足 95% 日常开发需求。

### 模型精简原则

| 原则 | 说明 | 应用 |
|------|------|------|
| 成本效益优先 | 保留低成本高效模型 | qwen-flash、qwen-turbo |
| 场景覆盖 | 覆盖通用、代码、视觉场景 | 8 个精选模型 |
| 能力梯度 | 从低到高形成能力阶梯 | flash → turbo → plus → max |
| 降级完整 | 每个模型有完整降级链 | 6 条降级链 |
| 冗余设计 | 关键场景有备选模型 | 代码场景 2 个选择 |

### 精选模型清单

#### 通用系列（4 个）

| 模型名称 | 优先级 | 成本等级 | 保留理由 | 替代方案 |
|----------|--------|----------|----------|----------|
| qwen-flash | ⭐⭐⭐⭐⭐ | 💰💰 | 最低成本，覆盖 60% 场景 | 无需替代 |
| qwen-turbo | ⭐⭐⭐⭐⭐ | 💰💰💰 | 性价比首选，平衡成本与能力 | qwen-flash |
| qwen-plus | ⭐⭐⭐⭐ | 💰💰💰💰 | 复杂任务首选，理解力强 | qwen-turbo → qwen-flash |
| qwen-max | ⭐⭐⭐ | 💰💰💰💰💰 | 旗舰模型，极限场景 | qwen-plus |

#### Coder 系列（4 个）

| 模型名称 | 优先级 | 成本等级 | 保留理由 | 替代方案 |
|----------|--------|----------|----------|----------|
| qwen3-coder-flash | ⭐⭐⭐⭐⭐ | 💰💰 | 最新代码模型，性价比极高 | qwen-coder-flash |
| qwen-coder-flash | ⭐⭐⭐⭐⭐ | 💰💰 | 代码补全首选，快速响应 | qwen3-coder-flash |
| qwen-coder-turbo | ⭐⭐⭐⭐ | 💰💰💰 | 中等复杂度代码 | qwen-coder-flash |
| qwen-coder-plus | ⭐⭐⭐ | 💰💰💰💰 | 高质量代码生成 | qwen-coder-turbo |

#### VL 视觉系列（2 个）

| 模型名称 | 优先级 | 成本等级 | 保留理由 | 替代方案 |
|----------|--------|----------|----------|----------|
| qwen-vl-plus | ⭐⭐⭐⭐ | 💰💰💰💰 | 视觉理解性价比 | qwen-vl-max |
| qwen-vl-max | ⭐⭐⭐ | 💰💰💰💰💰 | 最高视觉能力 | qwen-vl-plus |

#### Math 数学系列（2 个）

| 模型名称 | 优先级 | 成本等级 | 保留理由 | 替代方案 |
|----------|--------|----------|----------|----------|
| qwen-math-turbo | ⭐⭐⭐⭐ | 💰💰💰 | 数学计算优化 | qwen-turbo |
| qwen-math-plus | ⭐⭐⭐ | 💰💰💰💰 | 高精度数学推理 | qwen-math-turbo |

#### QVQ 推理系列（2 个）

| 模型名称 | 优先级 | 成本等级 | 保留理由 | 替代方案 |
|----------|--------|----------|----------|----------|
| qvq-72b-preview | ⭐⭐⭐ | 💰💰💰💰 | 推理增强 | qwen-plus |
| qvq-plus | ⭐⭐⭐ | 💰💰💰💰 | 增强推理 | qvq-72b-preview |

### 模型废弃建议

| 废弃模型 | 废弃原因 | 替代方案 |
|----------|----------|----------|
| qwen-max | 成本过高 | qwen-plus |
| qwen-vl-max | 成本过高 | qwen-vl-plus |
| qwen-math-plus | 性价比低 | qwen-math-turbo |
| qwen-coder-max | 冗余 | qwen-coder-plus |
| qwen3-max | 可用 qwen-plus | qwen-plus |
| qwen3-vl-max | 可用 qwen-vl-plus | qwen-vl-plus |

### 精简配置模板

```json
{
  "qwen": {
    "name": "通义千问 Qwen（精简实用版）",
    "version": "2.0.0",
    "description": "从 150+ 模型中精选 14 个实用模型，覆盖 95% 场景",
    "models": {
      "essential": {
        "qwen-flash": {
          "name": "Qwen-Flash（必备）",
          "costLevel": "lowest",
          "useCase": ["简单问答", "文本处理", "快速迭代"],
          "capability": 60
        },
        "qwen-turbo": {
          "name": "Qwen-Turbo（必备）",
          "costLevel": "low",
          "useCase": ["日常开发", "代码注释", "文档生成"],
          "capability": 80
        },
        "qwen3-coder-flash": {
          "name": "Qwen3-Coder-Flash（必备）",
          "costLevel": "lowest",
          "useCase": ["代码注释", "简单代码"],
          "capability": 75
        },
        "qwen-coder-flash": {
          "name": "Qwen-Coder-Flash（必备）",
          "costLevel": "low",
          "useCase": ["代码补全", "快速开发"],
          "capability": 80
        }
      },
      "enhanced": {
        "qwen-plus": {
          "name": "Qwen-Plus（增强）",
          "costLevel": "medium",
          "useCase": ["复杂任务", "代码审查"],
          "capability": 90
        },
        "qwen-coder-turbo": {
          "name": "Qwen-Coder-Turbo（增强）",
          "costLevel": "medium",
          "useCase": ["中等代码", "代码重构"],
          "capability": 85
        },
        "qwen-coder-plus": {
          "name": "Qwen-Coder-Plus（增强）",
          "costLevel": "medium-high",
          "useCase": ["高质量代码", "复杂重构"],
          "capability": 95
        }
      },
      "specialized": {
        "qwen-vl-plus": {
          "name": "Qwen-VL-Plus（视觉）",
          "costLevel": "medium-high",
          "useCase": ["图像理解", "视觉问答"],
          "capability": 90
        },
        "qwen-math-turbo": {
          "name": "Qwen-Math-Turbo（数学）",
          "costLevel": "medium",
          "useCase": ["数学计算", "数值推理"],
          "capability": 85
        },
        "qvq-72b-preview": {
          "name": "QVQ-72B-Preview（推理）",
          "costLevel": "high",
          "useCase": ["复杂推理", "逻辑分析"],
          "capability": 95
        }
      },
      "premium": {
        "qwen-max": {
          "name": "Qwen-Max（旗舰）",
          "costLevel": "highest",
          "useCase": ["极限场景", "最高质量"],
          "capability": 100,
          "restriction": "仅特殊审批使用"
        },
        "qwen-vl-max": {
          "name": "Qwen-VL-Max（旗舰视觉）",
          "costLevel": "highest",
          "useCase": ["复杂视觉理解"],
          "capability": 100,
          "restriction": "仅特殊审批使用"
        }
      }
    },
    "statistics": {
      "totalModels": 14,
      "essential": 4,
      "enhanced": 3,
      "specialized": 3,
      "premium": 2,
      "costSavings": "约 80% vs 全量配置"
    }
  }
}
```

---

## 模型性能对比与选择策略

### 性能指标对比

#### 响应时间（毫秒）

| 模型 | P50 | P90 | P99 | 冷启动 |
|------|-----|-----|-----|--------|
| qwen-flash | 200 | 500 | 1000 | 500ms |
| qwen-turbo | 300 | 800 | 1500 | 800ms |
| qwen-plus | 500 | 1500 | 3000 | 1500ms |
| qwen-max | 800 | 2500 | 5000 | 2500ms |
| qwen-coder-flash | 250 | 600 | 1200 | 600ms |
| qwen-coder-plus | 600 | 1800 | 3500 | 1800ms |

#### 吞吐量（TPS）

| 模型 | 并发上限 | 推荐并发 | 批处理支持 |
|------|----------|----------|------------|
| qwen-flash | 100 | 50 | ✅ 最佳 |
| qwen-turbo | 80 | 30 | ✅ 良好 |
| qwen-plus | 50 | 20 | ✅ 支持 |
| qwen-max | 30 | 10 | ⚠️ 有限 |
| qwen-coder-flash | 90 | 40 | ✅ 最佳 |
| qwen-coder-plus | 40 | 15 | ✅ 支持 |

#### 能力评分

| 维度 | qwen-flash | qwen-turbo | qwen-plus | qwen-coder-flash |
|------|------------|------------|-----------|------------------|
| 代码理解 | 70 | 80 | 90 | 95 |
| 代码生成 | 65 | 75 | 85 | 92 |
| 文本理解 | 75 | 85 | 95 | 70 |
| 逻辑推理 | 60 | 75 | 90 | 80 |
| 创意写作 | 70 | 80 | 90 | 60 |
| 上下文理解 | 70 | 80 | 95 | 75 |

### 场景选择决策树

```
用户请求 → 分析请求类型 → 选择模型

                    ┌─ 简单问答 ───→ qwen-flash
                    │
                    ├─ 代码注释 ───→ qwen3-coder-flash
                    │
                    ├─ 代码补全 ───→ qwen-coder-flash
                    │
                    ├─ 代码审查 ───→ qwen-plus（首次）
                    │              ↓
                    │         qwen-turbo（降级）
                    │
                    ├─ 复杂推理 ───→ qvq-72b-preview
                    │              ↓
                    │         qwen-plus（降级）
                    │
                    ├─ 图像理解 ───→ qwen-vl-plus
                    │              ↓
                    │         qwen-plus（降级）
                    │
                    └─ 数学计算 ───→ qwen-math-turbo
                                       ↓
                                  qwen-turbo（降级）
```

### 动态选择策略

```typescript
// 动态模型选择器配置
interface DynamicModelSelector {
  // 决策因素
  factors: {
    // 任务复杂度（0-100）
    complexity: {
      weight: 0.3,
      thresholds: {
        simple: { max: 30, model: 'qwen-flash' },
        moderate: { max: 60, model: 'qwen-turbo' },
        complex: { max: 100, model: 'qwen-plus' }
      }
    },
    // 响应时间要求（毫秒）
    latencyRequirement: {
      weight: 0.2,
      thresholds: {
        realtime: { max: 500, model: 'qwen-flash' },
        fast: { max: 1500, model: 'qwen-turbo' },
        normal: { max: 5000, model: 'qwen-plus' }
      }
    },
    // 代码相关度（0-1）
    codeRelevance: {
      weight: 0.25,
      thresholds: {
        high: { min: 0.7, model: 'qwen-coder-flash' },
        medium: { min: 0.3, model: 'qwen-turbo' },
        low: { min: 0, model: 'qwen-flash' }
      }
    },
    // 准确度要求（0-1）
    accuracyRequirement: {
      weight: 0.25,
      thresholds: {
        high: { min: 0.9, model: 'qwen-plus' },
        medium: { min: 0.5, model: 'qwen-turbo' },
        low: { min: 0, model: 'qwen-flash' }
      }
    }
  },

  // 选择算法
  algorithm: 'weighted_decision_tree',

  // 缓存配置
  caching: {
    enable: true,
    TTL: 3600,
    maxEntries: 1000
  }
}
```

---

## 批量操作与并发控制

### 并发限制配置

```typescript
// 并发控制配置
interface ConcurrencyConfig {
  // 全局并发限制
  global: {
    maxConcurrent: 50,
    burstLimit: 100,
    burstWindow: 60000
  },

  // 按模型并发限制
  perModel: {
    'qwen-flash': { max: 50, burst: 100 },
    'qwen-turbo': { max: 30, burst: 60 },
    'qwen-plus': { max: 20, burst: 40 },
    'qwen-coder-flash': { max: 40, burst: 80 },
    'qwen-coder-plus': { max: 15, burst: 30 },
    'qwen-vl-plus': { max: 10, burst: 20 }
  },

  // 按场景并发限制
  perScenario: {
    codeCompletion: { max: 20, burst: 40 },
    codeReview: { max: 10, burst: 20 },
    generalChat: { max: 30, burst: 60 },
    documentGeneration: { max: 5, burst: 10 }
  },

  // 队列配置
  queue: {
    enabled: true,
    maxSize: 1000,
    priorityLevels: 3,
    timeout: 30000
  }
}
```

### 批处理优化

```typescript
// 批处理配置
interface BatchProcessingConfig {
  // 是否启用批处理
  enabled: true,

  // 批处理参数
  batch: {
    // 最大批大小
    maxBatchSize: 10,
    // 最小批大小
    minBatchSize: 3,
    // 最大等待时间（毫秒）
    maxWaitTime: 500,
    // 批处理间隔（毫秒）
    interval: 100
  },

  // 支持批处理的场景
  supportedScenarios: [
    'codeCompletion',
    'textGeneration',
    'translation',
    'summarization'
  ],

  // 不支持批处理的场景
  unsupportedScenarios: [
    'codeReview',
    'complexReasoning',
    'imageUnderstanding'
  ],

  // 批处理收益
  benefits: {
    // 吞吐量提升
    throughputIncrease: '2-5x',
    // 成本降低
    costReduction: '20-30%',
    // 延迟增加
    latencyIncrease: '100-500ms'
  }
}
```

### 流量整形配置

```typescript
// 流量整形配置
interface TrafficShapingConfig {
  // 令牌桶配置
  tokenBucket: {
    // 桶容量
    capacity: 100,
    // 填充速率
    refillRate: 50,
    // 填充间隔（毫秒）
    refillInterval: 1000
  },

  // 漏桶配置
  leakyBucket: {
    // 桶容量
    capacity: 200,
    // 流出速率
    drainRate: 100,
    // 流出间隔（毫秒）
    drainInterval: 1000
  },

  // 优先级队列
  priorityQueue: {
    enabled: true,
    levels: 5,
    weights: {
      critical: 1.0,
      high: 0.8,
      normal: 0.6,
      low: 0.4,
      background: 0.2
    }
  },

  // 降级策略
  degradation: {
    enabled: true,
    // 降级触发条件
    triggers: {
      // CPU 使用率
      cpuThreshold: 0.8,
      // 内存使用率
      memoryThreshold: 0.85,
      // 队列积压
      queueBacklog: 100
    },
    // 降级动作
    actions: {
      reduceConcurrency: 0.5,
      enableBatching: true,
      rejectLowPriority: true
    }
  }
}
```

---

## 成本分析与优化

### 成本分析仪表板

```typescript
// 成本分析配置
interface CostAnalysisConfig {
  // 统计周期
  period: {
    realtime: true,
    hourly: true,
    daily: true,
    weekly: true,
    monthly: true
  },

  // 统计维度
  dimensions: [
    'byModel',
    'byScenario',
    'byUser',
    'byProject',
    'byTimeSlot'
  ],

  // 成本指标
  metrics: {
    // 总成本
    totalCost: { enabled: true, unit: '元' },
    // 令牌消耗
    tokenConsumption: { enabled: true, unit: 'tokens' },
    // 请求次数
    requestCount: { enabled: true, unit: '次' },
    // 平均成本
    avgCostPerRequest: { enabled: true, unit: '元/次' },
    // 成本占比
    costPercentage: { enabled: true, unit: '%' }
  },

  // 成本趋势
  trends: {
    enabled: true,
    // 对比周期
    compareWith: 'previous_period',
    // 预测周期
    forecastPeriod: 7,
    // 异常检测
    anomalyDetection: true
  }
}
```

### 成本优化策略

#### 策略一：智能上下文压缩

```typescript
// 上下文压缩配置
interface ContextCompressionConfig {
  enabled: true,

  // 压缩策略
  strategies: [
    {
      name: 'removeRedundant',
      description: '移除重复内容',
      savings: '10-20%',
      trigger: 'duplicates > 30%'
    },
    {
      name: 'summarizeHistory',
      description: '历史消息摘要',
      savings: '30-50%',
      trigger: 'history > 10 messages'
    },
    {
      name: 'extractKeyPoints',
      description: '提取关键点',
      savings: '40-60%',
      trigger: 'longContext > 5000 tokens'
    }
  ],

  // 压缩质量阈值
  qualityThreshold: 0.8,

  // 最大压缩比
  maxCompressionRatio: 0.3
}
```

#### 策略二：响应缓存

```typescript
// 智能缓存配置
interface SmartCachingConfig {
  enabled: true,

  // 缓存策略
  strategies: {
    // 精确匹配缓存
    exactMatch: {
      enabled: true,
      TTL: 86400,
      keyFields: ['prompt', 'model']
    },
    // 语义相似缓存
    semanticMatch: {
      enabled: true,
      TTL: 3600,
      similarityThreshold: 0.95,
      maxCachedEntries: 1000
    },
    // 模式缓存
    patternMatch: {
      enabled: true,
      TTL: 7200,
      patternTypes: ['codeTemplate', 'commonQuery']
    }
  },

  // 缓存命中率目标
  hitRateTarget: {
    overall: 0.4,
    codeRelated: 0.5,
    generalChat: 0.3
  },

  // 缓存收益
  benefits: {
    costSavings: '30-50%',
    latencyReduction: '50-80%',
    throughputIncrease: '1.5-2x'
  }
}
```

#### 策略三：模型动态调度

```typescript
// 动态调度优化配置
interface DynamicSchedulingConfig {
  // 负载均衡
  loadBalancing: {
    // 策略
    strategy: 'weighted_round_robin',
    // 权重配置
    weights: {
      'qwen-flash': 40,
      'qwen-turbo': 30,
      'qwen-plus': 15,
      'qwen-coder-flash': 15
    },
    // 动态调整
    dynamicAdjustment: {
      enabled: true,
      adjustmentInterval: 300000,
      loadThreshold: 0.8
    }
  },

  // 成本优化调度
  costOptimization: {
    enabled: true,
    // 优先使用低成本模型
    preferLowCost: true,
    // 成本预算
    budget: {
      daily: 10,
      weekly: 50,
      monthly: 200
    },
    // 超预算策略
    overBudgetAction: 'reject_new_requests'
  },

  // 性能优化调度
  performanceOptimization: {
    enabled: true,
    // 优先使用高性能模型
    preferHighPerformance: false,
    // 性能阈值
    latencyThreshold: 2000
  }
}
```

### 成本报告模板

```markdown
## 📊 成本分析报告

### 报告周期：2026-02-01 ~ 2026-02-06

### 一、成本概览

| 指标 | 本周 | 上周 | 变化 |
|------|------|------|------|
| 总成本 | ¥45.23 | ¥52.18 | -13.3% |
| 令牌消耗 | 2.1M | 2.5M | -16.0% |
| 请求次数 | 15,230 | 18,450 | -17.4% |
| 平均成本/请求 | ¥0.003 | ¥0.003 | 0% |

### 二、模型成本分布

| 模型 | 成本 | 占比 | 请求次数 |
|------|------|------|----------|
| qwen-flash | ¥12.50 | 27.6% | 8,230 |
| qwen-turbo | ¥15.20 | 33.6% | 4,120 |
| qwen-plus | ¥10.80 | 23.9% | 1,850 |
| qwen-coder-flash | ¥6.73 | 14.9% | 1,030 |

### 三、场景成本分布

| 场景 | 成本 | 占比 | 优化建议 |
|------|------|------|----------|
| 代码补全 | ¥18.20 | 40.2% | 可增加 qwen-coder-flash 使用 |
| 代码审查 | ¥12.50 | 27.6% | 首次审查用 qwen-turbo |
| 日常对话 | ¥8.30 | 18.3% | 可进一步压缩上下文 |
| 文档生成 | ¥6.23 | 13.8% | 优化 |

### 四、优化建议

1. **代码补全场景**：增加 qwen-coder-flash 使用率（当前 15% → 目标 30%）
2. **日常对话**：启用上下文压缩，节省 20% 令牌
3. **降级链优化**：qwen-plus 降级到 qwen-turbo 的触发阈值从 3 次降到 2 次

### 五、下周预测

| 场景 | 预测成本 | 置信度 |
|------|----------|--------|
| 基准情景 | ¥42.50 | 85% |
| 乐观情景 | ¥38.00 | 70% |
| 悲观情景 | ¥55.00 | 75% |
```

---

## 监控仪表盘配置

### 监控指标体系

```typescript
// 监控指标配置
interface MonitoringConfig {
  // 核心指标
  coreMetrics: [
    {
      name: 'request_count',
      description: '请求总数',
      unit: '次',
      thresholds: { warning: 10000, critical: 50000 }
    },
    {
      name: 'success_rate',
      description: '成功率',
      unit: '%',
      thresholds: { warning: 95, critical: 90 }
    },
    {
      name: 'avg_latency',
      description: '平均延迟',
      unit: 'ms',
      thresholds: { warning: 2000, critical: 5000 }
    },
    {
      name: 'p99_latency',
      description: 'P99 延迟',
      unit: 'ms',
      thresholds: { warning: 5000, critical: 10000 }
    },
    {
      name: 'cost_per_request',
      description: '单次请求成本',
      unit: '元',
      thresholds: { warning: 0.01, critical: 0.05 }
    }
  ],

  // 模型级指标
  modelMetrics: [
    {
      name: 'model_requests',
      description: '模型请求数',
      perModel: true
    },
    {
      name: 'model_latency',
      description: '模型延迟',
      perModel: true
    },
    {
      name: 'model_errors',
      description: '模型错误数',
      perModel: true,
      errorTypes: ['429', '500', '503']
    },
    {
      name: 'fallback_count',
      description: '降级次数',
      perModel: true
    }
  ],

  // 业务指标
  businessMetrics: [
    {
      name: 'code_completion_count',
      description: '代码补全次数'
    },
    {
      name: 'code_review_count',
      description: '代码审查次数'
    },
    {
      name: 'cost_by_scenario',
      description: '场景成本分布'
    }
  ]
}
```

### 告警配置

```typescript
// 告警配置
interface AlertingConfig {
  // 告警渠道
  channels: {
    // 企业微信
    wechat: {
      enabled: true,
      webhook: 'https://qyapi.weixin.qq.com/...',
      mentions: ['@all']
    },
    // 钉钉
    dingtalk: {
      enabled: true,
      webhook: 'https://oapi.dingtalk.com/...',
      keywords: ['Qwen监控']
    },
    // 邮件
    email: {
      enabled: false,
      recipients: ['team@company.com']
    }
  },

  // 告警规则
  rules: [
    {
      name: 'cost_budget_exceeded',
      condition: 'daily_cost > 50',
      severity: 'critical',
      channels: ['wechat', 'dingtalk']
    },
    {
      name: 'model_429_high',
      condition: '429_rate > 0.1',
      severity: 'warning',
      channels: ['wechat']
    },
    {
      name: 'success_rate_low',
      condition: 'success_rate < 0.95',
      severity: 'warning',
      channels: ['wechat', 'email']
    },
    {
      name: 'latency_high',
      condition: 'avg_latency > 3000',
      severity: 'warning',
      channels: ['wechat']
    },
    {
      name: 'fallback_chain_exhausted',
      condition: 'fallback_exhausted == true',
      severity: 'critical',
      channels: ['wechat', 'dingtalk', 'email']
    }
  ],

  // 告警抑制
  suppression: {
    enabled: true,
    // 相同告警抑制时间（秒）
    sameAlertCooldown: 300,
    // 告警升级
    escalation: {
      enabled: true,
      afterAlerts: 3,
      upgradeTo: 'critical'
    }
  }
}
```

### 监控仪表盘配置

```typescript
// 仪表盘配置
interface DashboardConfig {
  // 仪表盘列表
  dashboards: [
    {
      id: 'overview',
      name: '概览',
      widgets: [
        { type: 'metric', metric: 'total_cost', title: '今日成本' },
        { type: 'metric', metric: 'request_count', title: '今日请求' },
        { type: 'metric', metric: 'success_rate', title: '成功率' },
        { type: 'metric', metric: 'avg_latency', title: '平均延迟' },
        { type: 'chart', chartType: 'line', metric: 'cost_trend', title: '成本趋势' },
        { type: 'chart', chartType: 'pie', metric: 'cost_by_model', title: '模型成本分布' },
        { type: 'table', data: 'top_requests', title: 'Top 10 请求' },
        { type: 'alert_list', severity: 'critical', title: '活跃告警' }
      ]
    },
    {
      id: 'model_performance',
      name: '模型性能',
      widgets: [
        { type: 'table', data: 'model_stats', title: '模型统计' },
        { type: 'chart', chartType: 'bar', metric: 'latency_by_model', title: '延迟对比' },
        { type: 'chart', chartType: 'line', metric: 'requests_by_model', title: '请求趋势' },
        { type: 'heatmap', data: 'fallback_matrix', title: '降级矩阵' }
      ]
    },
    {
      id: 'cost_analysis',
      name: '成本分析',
      widgets: [
        { type: 'metric', metric: 'monthly_cost', title: '月度成本' },
        { type: 'chart', chartType: 'area', metric: 'cost_by_scenario', title: '场景成本' },
        { type: 'chart', chartType: 'line', metric: 'cost_trend', title: '成本趋势' },
        { type: 'table', data: 'optimization_suggestions', title: '优化建议' }
      ]
    }
  ],

  // 自动刷新
  autoRefresh: {
    enabled: true,
    interval: 60000
  },

  // 时间范围
  timeRange: {
    default: '24h',
    available: ['1h', '6h', '24h', '7d', '30d']
  }
}
```

### 运维脚本

```bash
#!/bin/bash
# qwen-model-ops.sh - Qwen 模型运维脚本

# 常用命令
commands=(
  "status          # 查看模型状态"
  "health          # 健康检查"
  "cost            # 成本统计"
  "switch          # 手动切换模型"
  "fallback         # 查看降级统计"
  "alert           # 查看活跃告警"
  "config          # 查看当前配置"
  "restart         # 重启服务"
)

# 示例用法
examples=(
  "# 查看模型状态"
  "./qwen-ops.sh status"
  ""
  "# 查看今日成本"
  "./qwen-ops.sh cost --today"
  ""
  "# 查看降级统计"
  "./qwen-ops.sh fallback --model qwen-plus"
  ""
  "# 手动切换模型"
  "./qwen-ops.sh switch --from qwen-plus --to qwen-turbo"
  ""
  "# 健康检查"
  "./qwen-ops.sh health --verbose"
)

# Cron 定时任务示例
cron_jobs=(
  "# 每小时成本统计"
  "0 * * * * /path/to/qwen-ops.sh cost --hourly >> /var/log/qwen-cost.log"
  ""
  "# 每日健康检查"
  "0 8 * * * /path/to/qwen-ops.sh health --daily >> /var/log/qwen-health.log"
  ""
  "# 每周成本报告"
  "0 9 * * 1 /path/to/qwen-ops.sh cost --weekly --report >> /var/log/qwen-weekly.log"
)
```

---

## 配置更新日志

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 2.0.0 | 2026-02-06 | 新增限流自动切换、精简模型配置、性能对比、并发控制、成本分析、监控仪表盘 |
| 2.0.1 | 2026-02-06 | 新增独立配置文件 config/qwen-models.json、运维脚本 scripts/qwen-ops.sh |
| 2.0.0 | 2026-02-06 | 新增限流自动切换、精简模型配置、性能对比、并发控制、成本分析、监控仪表盘 |
| 1.1.0 | 2026-02-06 | 新增 Qwen 低成本模型集成、知识库自动选择 |
| 1.0.0 | 2026-02-01 | 初始版本 |

---

## 独立配置文件

本项目提供独立的 Qwen 模型配置文件，支持配置与代码分离，便于维护和部署。

### 配置文件结构

```
enterprise-workspace/
├── config/
│   └── qwen-models.json          # Qwen 模型主配置文件
├── scripts/
│   └── qwen-ops.sh               # Qwen 模型运维脚本
└── CLAUDE.md                     # 配置文档
```

### 配置文件说明

| 文件 | 说明 | 用途 |
|------|------|------|
| `config/qwen-models.json` | 模型配置主文件 | 定义所有模型、降级链、健康检查、成本配置 |
| `scripts/qwen-ops.sh` | 运维脚本 | 健康检查、成本统计、模型切换、告警管理 |

### 使用方法

```bash
# 查看模型状态
./scripts/qwen-ops.sh status

# 健康检查
./scripts/qwen-ops.sh health --verbose

# 成本统计
./scripts/qwen-ops.sh cost --today --trend

# 手动切换模型
./scripts/qwen-ops.sh switch --from qwen-plus --to qwen-turbo

# 运行测试
./scripts/qwen-ops.sh test --all

# 配置验证
./scripts/qwen-ops.sh config --validate
```

### 配置热更新

```bash
# 编辑配置
./scripts/qwen-ops.sh config --edit

# 或手动编辑
vim config/qwen-models.json

# 验证配置
./scripts/qwen-ops.sh config --validate
```

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `CONFIG_DIR` | 配置文件目录 | `./config` |
| `LOG_DIR` | 日志目录 | `./logs` |
| `DASHSCOPE_API_KEY` | API Key | - |

```bash
# 示例
export CONFIG_DIR="/etc/qwen"
export LOG_DIR="/var/log/qwen"
export DASHSCOPE_API_KEY="sk-xxx"
./scripts/qwen-ops.sh status
```

---

## 集成测试用例

本项目提供完整的 Qwen 模型集成测试用例，验证模型配置、降级策略、限流处理等功能。

### 测试目录结构

```
tests/
├── qwen/
│   ├── unit/                    # 单元测试
│   │   ├── config-validation.test.js
│   │   ├── model-selection.test.js
│   │   └── fallback-chain.test.js
│   ├── integration/              # 集成测试
│   │   ├── model-api.test.js
│   │   ├── rate-limit.test.js
│   │   └── health-check.test.js
│   ├── e2e/                     # 端到端测试
│   │   └── full-workflow.test.js
│   ├── fixtures/                # 测试数据
│   │   ├── mock-responses.json
│   │   └── test-config.json
│   └── utils/                   # 测试工具
│       ├── test-helpers.js
│       └── mock-server.js
└── jest.config.js
```

### 测试命令

```bash
# 运行所有测试
pnpm test:qwen

# 运行单元测试
pnpm test:qwen:unit

# 运行集成测试
pnpm test:qwen:integration

# 运行 E2E 测试
pnpm test:qwen:e2e

# 生成覆盖率报告
pnpm test:qwen:coverage
```

### 单元测试用例

```javascript
// tests/qwen/unit/config-validation.test.js

describe('配置验证', () => {
  const path = require('path');

  test('配置文件 JSON 格式正确', () => {
    const config = require('../../../config/qwen-models.json');
    expect(config).toBeDefined();
    expect(config.version).toBe('2.0.0');
  });

  test('所有必需字段存在', () => {
    const config = require('../../../config/qwen-models.json');
    expect(config.models).toBeDefined();
    expect(config.rateLimit).toBeDefined();
    expect(config.concurrency).toBeDefined();
    expect(config.healthCheck).toBeDefined();
    expect(config.failover).toBeDefined();
  });

  test('模型数量符合预期', () => {
    const config = require('../../../config/qwen-models.json');
    const totalModels = config.statistics.totalModels;
    expect(totalModels).toBe(14);
  });

  test('降级链完整', () => {
    const config = require('../../../config/qwen-models.json');
    const enhancedModels = [...config.models.enhanced, ...config.models.specialized, ...config.models.premium];

    enhancedModels.forEach(model => {
      if (model.fallback && model.fallback.length > 0) {
        model.fallback.forEach(fallbackModel => {
          // 验证降级模型存在
          const exists = Object.values(config.models)
            .flat()
            .some(m => m.name === fallbackModel);
          expect(exists).toBe(true);
        });
      }
    });
  });

  test('定价配置有效', () => {
    const config = require('../../../config/qwen-models.json');
    const allModels = Object.values(config.models).flat();

    allModels.forEach(model => {
      expect(model.pricing).toBeDefined();
      expect(model.pricing.input).toBeGreaterThan(0);
      expect(model.pricing.output).toBeGreaterThan(0);
    });
  });
});
```

### 集成测试用例

```javascript
// tests/qwen/integration/rate-limit.test.js

const { ModelRouter } = require('../../../src/qwen/router');
const { RateLimitHandler } = require('../../../src/qwen/rate-limit');

describe('限流处理集成测试', () => {
  let router;
  let rateLimitHandler;

  beforeAll(() => {
    const config = require('../../../config/qwen-models.json');
    router = new ModelRouter(config);
    rateLimitHandler = new RateLimitHandler(config.rateLimit);
  });

  test('429 错误触发自动切换', async () => {
    // 模拟 429 错误
    const mockError = {
      status: 429,
      error: {
        type: 'rate_limit',
        code: '429_1'
      }
    };

    // 初始使用 qwen-plus
    router.setCurrentModel('qwen-plus');

    // 触发限流
    const shouldSwitch = rateLimitHandler.shouldAutoSwitch(mockError);
    expect(shouldSwitch).toBe(true);

    // 验证切换到降级模型
    const nextModel = router.getFallbackModel('qwen-plus');
    expect(nextModel).toBe('qwen-turbo');
  });

  test('连续失败触发降级', async () => {
    // 模拟连续失败
    const failures = [
      { status: 429 },
      { status: 429 },
      { status: 429 }
    ];

    const shouldSwitch = failures.every(f => rateLimitHandler.shouldAutoSwitch(f));
    expect(shouldSwitch).toBe(true);
  });

  test('降级链完整执行', async () => {
    const fallbackSequence = [];

    // qwen-plus 降级链
    fallbackSequence.push('qwen-plus');
    fallbackSequence.push('qwen-turbo');
    fallbackSequence.push('qwen-flash');

    expect(fallbackSequence).toEqual([
      'qwen-plus',
      'qwen-turbo',
      'qwen-flash'
    ]);
  });

  test('恢复后自动回滚', async () => {
    // 模拟恢复
    const router = new ModelRouter(require('../../../config/qwen-models.json'));

    // 初始状态
    expect(router.getCurrentModel()).toBe('qwen-plus');

    // 切换到降级模型
    router.fallback();
    expect(router.getCurrentModel()).toBe('qwen-turbo');

    // 恢复检查
    router.checkRecovery();
    expect(router.getCurrentModel()).toBe('qwen-plus');
  });
});
```

### 端到端测试

```javascript
// tests/qwen/e2e/full-workflow.test.js

const { QwenService } = require('../../../src/qwen/service');
const { CostAnalyzer } = require('../../../src/qwen/cost-analyzer');

describe('完整工作流 E2E 测试', () => {
  let qwenService;
  let costAnalyzer;

  beforeAll(() => {
    const config = require('../../../config/qwen-models.json');
    qwenService = new QwenService(config);
    costAnalyzer = new CostAnalyzer(config.cost);
  });

  test('简单问答使用 qwen-flash', async () => {
    const request = {
      type: 'simple_qa',
      content: '什么是 TypeScript？',
      requireHighAccuracy: false
    };

    const selectedModel = await qwenService.selectModel(request);
    expect(selectedModel).toBe('qwen-flash');
  });

  test('代码补全使用 qwen-coder-flash', async () => {
    const request = {
      type: 'code_completion',
      content: 'function add(a, b) {',
      requireHighAccuracy: false
    };

    const selectedModel = await qwenService.selectModel(request);
    expect(selectedModel).toBe('qwen-coder-flash');
  });

  test('代码审查使用 qwen-plus', async () => {
    const request = {
      type: 'code_review',
      content: reviewCode,
      requireHighAccuracy: true
    };

    const selectedModel = await qwenService.selectModel(request);
    expect(selectedModel).toBe('qwen-plus');
  });

  test('成本在预算范围内', async () => {
    const requests = Array(100).fill({
      type: 'simple_qa',
      content: '测试问题'
    });

    const totalCost = await costAnalyzer.estimateCost(requests);
    expect(totalCost).toBeLessThan(costAnalyzer.getDailyBudget());
  });

  test('限流时自动降级', async () => {
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push({
        type: 'code_review',
        content: '代码',
        simulateRateLimit: i >= 5 // 前5个正常，后5个触发限流
      });
    }

    const results = await qwenService.processRequests(requests);

    // 验证降级发生
    const models = results.map(r => r.model);
    const hasFallback = models.some(m => m === 'qwen-turbo');
    expect(hasFallback).toBe(true);
  });
});
```

### 测试覆盖率要求

| 测试类型 | 最低覆盖率 | 目标覆盖率 |
|----------|------------|------------|
| 单元测试 | 80% | 90% |
| 集成测试 | 70% | 85% |
| E2E 测试 | 60% | 75% |
| 整体 | 75% | 85% |

### CI 集成

```yaml
# .github/workflows/qwen-test.yml

name: Qwen Model Tests

on:
  push:
    paths:
      - 'config/qwen-models.json'
      - 'src/qwen/**'
      - 'tests/qwen/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Run unit tests
        run: pnpm test:qwen:unit

      - name: Run integration tests
        run: pnpm test:qwen:integration
        env:
          DASHSCOPE_API_KEY: ${{ secrets.DASHSCOPE_API_KEY }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## A/B 测试框架

本项目提供 A/B 测试框架，支持新旧模型对比、不同策略效果验证。

### A/B 测试配置

```json
{
  "abTesting": {
    "enabled": true,
    "experiments": [
      {
        "id": "exp_001",
        "name": "qwen-flash vs qwen-turbo",
        "description": "对比简单问答场景下两个模型的性能和成本",
        "control": "qwen-flash",
        "treatment": "qwen-turbo",
        "trafficSplit": {
          "control": 50,
          "treatment": 50
        },
        "metrics": [
          "latency",
          "cost",
          "user_satisfaction"
        ],
        "duration": 604800,
        "minSampleSize": 1000,
        "stopConditions": {
          "pValue": 0.05,
          "power": 0.8
        }
      },
      {
        "id": "exp_002",
        "name": "qwen-coder-flash vs qwen3-coder-flash",
        "description": "对比代码补全场景下新旧模型效果",
        "control": "qwen-coder-flash",
        "treatment": "qwen3-coder-flash",
        "trafficSplit": {
          "control": 50,
          "treatment": 50
        },
        "metrics": [
          "completion_rate",
          "edit_distance",
          "user_rating"
        ],
        "duration": 432000,
        "minSampleSize": 500
      }
    ],
    "analysis": {
      "confidenceLevel": 0.95,
      "minimumEffectSize": 0.05,
      "outlierRemoval": {
        "enabled": true,
        "method": "iqr",
        "factor": 1.5
      }
    }
  }
}
```

### A/B 测试 API

```typescript
// src/qwen/ab-testing/types.ts

interface ABExperiment {
  id: string;
  name: string;
  description: string;
  control: string;          // 对照组模型
  treatment: string;        // 实验组模型
  trafficSplit: {
    control: number;         // 对照组流量百分比
    treatment: number;      // 实验组流量百分比
  };
  metrics: ABMetric[];
  duration: number;         // 实验持续时间（毫秒）
  minSampleSize: number;
  stopConditions?: {
    pValue?: number;         // P 值阈值
    power?: number;         // 统计功效
  };
}

interface ABMetric {
  name: string;
  type: 'continuous' | 'categorical' | 'conversion';
  aggregation: 'mean' | 'sum' | 'count' | 'rate';
  direction: 'higher' | 'lower';  // 指标优化方向
}

interface ABResult {
  experimentId: string;
  status: 'running' | 'completed' | 'stopped';
  sampleSize: {
    control: number;
    treatment: number;
  };
  results: {
    metric: string;
    controlValue: number;
    treatmentValue: number;
    lift: number;
    pValue: number;
    confidenceInterval: [number, number];
    significant: boolean;
  }[];
  recommendation: 'control' | 'treatment' | 'inconclusive';
}
```

### A/B 测试服务

```typescript
// src/qwen/ab-testing/service.ts

class ABTestingService {
  private experiments: Map<string, ABExperiment> = new Map();
  private assignments: Map<string, string> = new Map();

  // 流量分配
  assign(experimentId: string, userId: string): 'control' | 'treatment' {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment not found: ${experimentId}`);
    }

    // 使用用户 ID 进行一致性哈希
    const hash = this.hash(userId + experimentId);
    const bucket = hash % 100;

    if (bucket < experiment.trafficSplit.control) {
      return 'control';
    }
    return 'treatment';
  }

  // 选择模型
  selectModel(experimentId: string, userId: string): string {
    const assignment = this.assign(experimentId, userId);
    const experiment = this.experiments.get(experimentId);

    if (assignment === 'control') {
      return experiment.control;
    }
    return experiment.treatment;
  }

  // 记录指标
  recordMetric(experimentId: string, userId: string, metric: string, value: number): void {
    const assignment = this.assign(experimentId, userId);
    // 记录到时序数据库
    this.writeMetric({
      experiment: experimentId,
      group: assignment,
      metric,
      value,
      timestamp: Date.now()
    });
  }

  // 分析结果
  analyze(experimentId: string): ABResult {
    const experiment = this.experiments.get(experimentId);
    const results = [];

    for (const metricConfig of experiment.metrics) {
      const controlData = this.queryMetrics(experimentId, 'control', metricConfig.name);
      const treatmentData = this.queryMetrics(experimentId, 'treatment', metricConfig.name);

      const controlValue = this.aggregate(controlData, metricConfig.aggregation);
      const treatmentValue = this.aggregate(treatmentData, metricConfig.aggregation);
      const lift = (treatmentValue - controlValue) / controlValue;

      const { pValue, confidenceInterval } = this.statisticalTest(
        controlData,
        treatmentData,
        experiment.analysis.confidenceLevel
      );

      results.push({
        metric: metricConfig.name,
        controlValue,
        treatmentValue,
        lift,
        pValue,
        confidenceInterval,
        significant: pValue < experiment.analysis.confidenceLevel
      });
    }

    // 生成推荐
    const recommendation = this.generateRecommendation(results, experiment);

    return {
      experimentId,
      status: 'running',
      sampleSize: {
        control: this.getSampleSize(experimentId, 'control'),
        treatment: this.getSampleSize(experimentId, 'treatment')
      },
      results,
      recommendation
    };
  }

  // 生成推荐
  private generateRecommendation(results: any[], experiment: ABExperiment): 'control' | 'treatment' | 'inconclusive' {
    const significantResults = results.filter(r => r.significant);

    if (significantResults.length === 0) {
      return 'inconclusive';
    }

    const treatmentWins = significantResults.filter(r => {
      if (r.metric === 'latency' || r.metric === 'cost') {
        return r.lift < 0;  // 越低越好
      }
      return r.lift > 0;    // 越高越好
    }).length;

    if (treatmentWins > significantResults.length / 2) {
      return 'treatment';
    }
    return 'control';
  }
}
```

### A/B 测试仪表盘

```typescript
// A/B 测试仪表盘配置
const abDashboard = {
  title: 'Qwen A/B 测试仪表盘',

  widgets: [
    {
      type: 'experiment_list',
      title: '运行中的实验',
      columns: ['name', 'status', 'progress', 'days_left']
    },
    {
      type: 'funnel',
      title: '实验流量漏斗',
      steps: ['总请求', '分配成功', '结果记录', '完成实验']
    },
    {
      type: 'comparison_chart',
      title: '模型对比',
      metrics: ['latency', 'cost', 'success_rate']
    },
    {
      type: 'results_table',
      title: '实验结果',
      columns: ['metric', 'control', 'treatment', 'lift', 'p_value', 'significant']
    },
    {
      type: 'recommendation_card',
      title: '当前推荐'
    }
  ]
};
```

### A/B 测试最佳实践

| 实践 | 说明 |
|------|------|
| 单一变量 | 每次实验只改变一个变量 |
| 足够样本 | 确保达到最小样本量 |
| 持续时间 | 运行足够长时间避免新奇效应 |
| 监控副作用 | 关注非预期影响 |
| 记录上下文 | 记录实验背景和预期 |

---

**版本**：2.0.1
**最后更新**：2026-02-06
**维护者**：企业架构组
