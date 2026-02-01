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

## 贡献指南

1. 创建分支：`git checkout -b feature/xxx`
2. 遵循规范开发
3. 提交前检查：`npm run check`
4. 创建 Pull Request
5. 通过审查后合并

---

**版本**：1.0.0  
**最后更新**：2026-02-01  
**维护者**：企业架构组
