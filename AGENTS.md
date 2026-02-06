# AGENTS.md

> 本文件为所有 AI 编程助手提供项目规范配置。无论你使用哪种 AI 助手，启动时都会自动加载这些配置。

## 自动加载说明

**重要提示**：本项目的规范配置是自动加载的，无需手动操作。当 AI 助手打开本项目时，会自动读取以下配置文件：

1. **CLAUDE.md**（最高优先级） - 项目主配置，包含所有开发规范和指导
2. **.specify/memory/constitution.md** - 项目治理原则
3. **.cursor/rules/spec-driven-development.jsonc** - Cursor 专用规则
4. **.specify/AUTO-LOAD.md** - 自动加载机制说明

所有 AI 助手在启动时会自动加载这些配置，并在整个会话过程中遵守这些规范。

## 支持的 AI 助手

### 1. Claude Code (Anthropic)

**配置读取：**
- 主配置：`CLAUDE.md`
- 规范核心：`.specify/memory/constitution.md`

**自动加载方式：**
Claude Code 启动时自动读取项目根目录的 `CLAUDE.md` 文件，该文件会被加载到 AI 的上下文中，作为所有交互的参考基准。

**验证方式：**
启动 Claude Code 后，你可以询问：
```
请确认已加载的项目规范，并列出当前会话遵守的主要规则。
```

### 2. Cursor (AI IDE)

**配置读取：**
- 主规则：`.cursor/rules/spec-driven-development.jsonc`
- 规范核心：`.specify/memory/constitution.md`
- 辅助配置：`CLAUDE.md`

**自动加载方式：**
Cursor 通过 `.cursor/rules/` 目录下的规则文件自动加载规范。规则文件已配置 `autoLoad: true`，确保启动时自动加载。

**Cursor 特定功能：**
- 支持规则文件中的 `match.filePatterns` 自动匹配文件类型
- 支持优先级设置，高优先级规则优先应用
- 支持条件触发，`when` 字段控制规则应用时机

### 3. Windsurf (AI IDE)

**配置读取：**
- 主配置：`CLAUDE.md`
- 规范核心：`.specify/memory/constitution.md`

**自动加载方式：**
Windsurf 使用与 Claude 相同的配置机制，读取项目根目录的 `CLAUDE.md` 文件。

### 4. Codex CLI (OpenAI)

**配置读取：**
- 主配置：`CLAUDE.md`
- 规范核心：`.specify/memory/constitution.md`
- 模板目录：`.specify/templates/`

**自动加载方式：**
Codex CLI 读取项目根目录的 `CLAUDE.md` 文件和 `.specify/` 目录下的配置模板。

### 5. 其他 AI 助手

本项目规范设计为与大多数 AI 编程助手兼容：

**通用配置读取：**
- 主配置：`CLAUDE.md`（通用 Markdown 格式）
- 规范核心：`.specify/memory/constitution.md`
- 模板目录：`.specify/templates/`

**兼容性说明：**
- `CLAUDE.md` 使用通用 Markdown 格式，几乎所有 AI 助手都能解析
- `constitution.md` 同样使用 Markdown 格式，易于理解和遵循
- 模板文件提供标准化结构，可根据具体工具调整

## 项目规范概览

### 代码质量标准

**TypeScript / JavaScript：**
- 启用严格模式（`strict: true`）
- 所有类型必须显式定义
- 禁止使用 `any` 类型（除非有特殊注释说明）
- 接口和类型定义要完整

**Go 语言：**
- 使用静态分析工具（golangci-lint）
- 错误处理规范化，禁止裸用 `panic`
- 遵循 Go 编码规范（Effective Go）

**通用要求：**
- 函数长度不超过 50 行
- 复杂逻辑必须添加注释
- 遵循 DRY（Don't Repeat Yourself）原则
- 依赖管理遵循最小依赖原则

### 测试要求

**测试覆盖率：**
- 核心业务逻辑测试覆盖率不低于 80%
- 新增功能必须有对应的测试用例
- 关键路径必须有多重保护

**测试类型：**
- 单元测试：验证单个函数/组件
- 集成测试：验证模块间协作
- E2E 测试：验证完整用户流程
- 性能测试：验证性能指标

**测试数据：**
- 使用工厂模式生成测试数据
- 避免硬编码测试数据
- 测试数据应具有代表性

### 安全性要求

**认证授权：**
- 使用 OAuth 2.0 / OIDC 进行身份认证
- 支持多因素认证
- Token 定期刷新

**数据安全：**
- 敏感数据加密存储
- 传输使用 HTTPS / TLS 1.3
- 遵循最小权限原则（RBAC / ABAC）

**输入验证：**
- 所有用户输入必须验证和清理
- 防止 SQL 注入、XSS、CSRF 等攻击
- 使用参数化查询

**审计日志：**
- 记录关键操作
- 日志保留至少 180 天
- 支持审计追踪

### 性能要求

**前端性能：**
- LCP（最大内容绘制）不超过 2.5 秒
- CLS（累积布局偏移）不超过 0.1
- FID（首次输入延迟）不超过 100 毫秒
- 首屏加载资源不超过 500KB（压缩后）

**后端性能：**
- API 响应时间 P95 不超过 500ms
- 支持至少 1000 QPS 并发请求
- 数据库查询优化，避免 N+1 问题

**资源管理：**
- 合理配置数据库连接池
- 合理配置 HTTP 连接池
- 避免内存泄漏

### 文档要求

**代码文档：**
- API 文档使用 OpenAPI / Swagger 规范
- 复杂逻辑必须有清晰的注释
- 每个项目必须有 README

**技术文档：**
- 系统架构文档
- 模块设计文档
- 部署运维文档

**变更记录：**
- 使用 Conventional Commits
- 重大变更必须有 Change Log
- 提交信息清晰明确

### Git 提交规范

本项目使用 **release-please** 实现 CHANGELOG 自动生成，所有提交必须遵循 **Conventional Commits** 规范。

#### 提交信息格式

```
<类型>(<作用域>): <描述>

# 示例
feat(Core): 新增用户认证功能
fix(Desktop): 修复登录页面样式问题
chore(TUI): 更新依赖版本
docs(Core): 补充API文档
```

#### 类型说明

| 类型 | 说明 | 版本升级 |
|------|------|----------|
| `feat` | 新功能 | Minor 版本 (1.1.0 → 1.2.0) |
| `fix` | Bug 修复 | Patch 版本 (1.1.0 → 1.1.1) |
| `feat!` / `fix!` | 破坏性变更 | Major 版本 (1.1.0 → 2.0.0) |
| `chore` | 工程化变更 | Patch 版本 |
| `docs` | 文档更新 | Patch 版本 |
| `style` | 代码格式 | Patch 版本 |
| `refactor` | 重构 | Patch 版本 |
| `perf` | 性能优化 | Patch 版本 |
| `test` | 测试相关 | Patch 版本 |
| `build` | 构建相关 | Patch 版本 |
| `ci` | CI 配置 | Patch 版本 |
| `revert` | 回滚提交 | 无版本升级 |

#### 作用域说明

| 作用域 | 说明 |
|--------|------|
| `Core` | 核心功能、基础设施、后端服务 |
| `TUI` | 终端用户界面 |
| `Desktop` | 桌面应用程序 |

#### 本地校验

项目配置了 `commitlint + husky`，提交时自动校验格式：

```bash
# 安装依赖后自动初始化 husky
pnpm install

# 手动初始化 husky（如果需要）
npx husky install
```

#### 自动化流程

1. **提交代码** → commitlint 校验本地格式
2. **推送到主分支** → GitHub Actions 检测提交
3. **自动生成 PR** → release-please 创建版本更新 PR
4. **合并 PR** → 自动更新 CHANGELOG、打 Tag、创建 Release

## 开发流程

### 规范驱动开发流程

本项目采用 SpecKit 规范驱动开发方法论：

```
需求定义 → 规格说明 → 技术规划 → 任务分解 → 实施开发 → 测试验收
```

### 可用命令

在 AI 助手对话中，可以使用以下命令：

**核心命令：**
- `/speckit.constitution` - 创建或更新项目原则
- `/speckit.specify` - 定义功能需求
- `/speckit.plan` - 创建技术实施计划
- `/speckit.tasks` - 生成任务列表
- `/speckit.implement` - 执行实现

**辅助命令：**
- `/speckit.clarify` - 澄清规格中的模糊之处
- `/speckit.analyze` - 跨工件一致性分析
- `/speckit.checklist` - 生成质量检查清单

### 分支策略

**分支命名规范：**
- `main` - 生产分支
- `develop` - 开发分支
- `feature/*` - 功能分支
- `bugfix/*` - 修复分支
- `hotfix/*` - 紧急修复分支

**合并策略：**
- 所有变更通过 Pull Request 合并
- 必须通过 CI 检查和代码审查
- 合并前必须更新最新 main 分支

## 技术栈指南

### 前端技术

**核心框架：**
- React 18+ / Vue 3
- TypeScript 5+
- Vite 5+

**状态管理：**
- Zustand（推荐）
- Pinia（Vue）
- React Query / TanStack Query

**UI 组件：**
- Ant Design（企业级）
- Element Plus（Vue）
- Headless UI / Radix UI

**样式方案：**
- Tailwind CSS（推荐）
- CSS Modules
- Styled Components

### 后端技术

**核心语言：**
- Go 1.21+（推荐）
- Python 3.11+
- Node.js 20+

**Web 框架：**
- Gin（Go，推荐）
- FastAPI（Python）
- Express.js（Node.js）

**数据库：**
- PostgreSQL 14+（推荐）
- MongoDB 6+
- Redis 7+（缓存）

**消息队列：**
- Kafka 3.x（推荐）
- RabbitMQ 3.12+
- NATS

### 基础设施

**容器化：**
- Docker
- Docker Compose

**编排：**
- Kubernetes（生产）
- Docker Compose（开发）

**CI/CD：**
- GitHub Actions
- Jenkins

**监控：**
- Prometheus
- Grafana
- ELK Stack

## 常用命令

### 开发环境

```bash
# 安装依赖
npm install

# 安装 Go 依赖
go mod download

# 安装 Python 依赖
pip install -r requirements.txt

# 启动开发服务器
npm run dev

# 启动后端服务
go run cmd/server/main.go

# 运行类型检查
npm run type-check

# 运行代码检查
npm run lint

# 代码格式化
npm run format
```

### 测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行 E2E 测试
npm run test:e2e

# 生成测试覆盖率
npm run test:coverage
```

### 构建部署

```bash
# 构建前端
npm run build

# 构建后端
go build -o bin/server cmd/server/main.go

# 构建镜像
docker build -t app:latest .

# 本地部署
docker-compose up -d

# 部署到生产
./scripts/cd/deploy-prod.sh
```

## 质量门禁

在合并代码前，必须通过以下检查：

1. **代码质量**
   - ESLint / Go linter 通过
   - 类型检查无错误
   - 代码覆盖率达标

2. **测试要求**
   - 单元测试通过率 100%
   - 集成测试通过
   - E2E 测试通过

3. **安全要求**
   - 依赖漏洞扫描通过
   - 安全代码扫描通过
   - 无敏感信息泄露

4. **审查要求**
   - 至少一名开发者审查通过
   - 审查意见已处理
   - 文档已更新

## 故障排查

### 常见问题

**1. 规范未加载**

```bash
# 检查配置文件是否存在
ls -la CLAUDE.md
ls -la .specify/memory/constitution.md
ls -la .cursor/rules/

文件内容
head -30 CLAUDE.md
# 检查head -50 .specify/memory/constitution.md
```

**2. 依赖安装失败**

```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install

# 或使用 pnpm
pnpm install

# Go 依赖
go mod tidy
```

**3. 测试失败**

```bash
# 查看详细错误
npm test -- --verbose

# 运行特定测试
npm test -- --testNamePattern="测试名称"

# 查看测试覆盖率
npm run test:coverage
```

**4. 端口被占用**

```bash
# 查看占用端口的进程
netstat -ano | findstr :3000

# 或使用 lsof（Linux/macOS）
lsof -i :3000

# 修改端口配置
# 编辑 .env 文件
PORT=3001
```

### 日志位置

- **前端日志**：浏览器开发者工具 Console
- **后端日志**：`./logs/server.log`
- **Docker 日志**：`docker-compose logs`
- **CI/CD 日志**：GitHub Actions / Jenkins 控制台

## 环境配置

### 环境变量

创建 `.env` 文件（从 `.env.example` 复制）：

```bash
cp .env.example .env
```

**必需的环境变量：**

| 变量名 | 描述 | 示例 |
|--------|------|------|
| DATABASE_URL | 数据库连接字符串 | postgresql://user:pass@localhost:5432/db |
| REDIS_URL | Redis 连接字符串 | redis://localhost:6379 |
| JWT_SECRET | JWT 密钥 | your-secret-key |

**可选的环境变量：**

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| LOG_LEVEL | 日志级别 | info |
| PORT | 服务端口 | 3000 |
| NODE_ENV | 环境 | development |

### 开发环境要求

确保已安装以下工具：

- Node.js 18+
- Go 1.21+
- Python 3.11+
- Docker Desktop
- PostgreSQL 14+
- Redis 7+

## 资源链接

**项目资源：**
- [项目规范文档](docs/development/系统开发规范.md)
- [CI/CD 配置](.cicd/)
- [架构文档](docs/architecture/)
- [API 文档](docs/)

**外部资源：**
- [SpecKit 官方文档](https://github.com/github/spec-kit)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Go 官方文档](https://go.dev/doc/)
- [React 官方文档](https://react.dev/)

## 贡献指南

1. **创建分支**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **遵循规范开发**
   - 遵循 `constitution.md` 中的原则
   - 编写测试用例
   - 更新文档

3. **提交代码**
    ```bash
    git add .
    git commit -m "feat(Core): 添加用户认证功能"
    ```
    
    **注意**：提交信息必须包含作用域（Core/TUI/Desktop），否则无法自动生成 CHANGELOG。

4. **创建 Pull Request**
   - 描述变更内容
   - 链接相关 Issue
   - 等待代码审查

5. **合并代码**
   - 通过审查后合并
   - 删除功能分支

## 支持

- **文档**：[docs/](docs/)
- **Issue**：[GitHub Issues](https://github.com/your-org/enterprise-workspace/issues)
- **讨论**：[GitHub Discussions](https://github.com/your-org/enterprise-workspace/discussions)

## 版本信息

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0.0 | 2026-02-01 | 初始版本，支持多 AI 助手自动加载 |
