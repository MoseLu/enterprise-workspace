# Enterprise Workspace

## 概述

Enterprise Workspace 是一个企业级 Monorepo 项目，采用多技术栈架构设计，集成前端多端应用、PC 中后台系统、AI 辅助开发平台、业务后端服务以及辅助工具项目。

## 技术栈

| 模块 | 技术栈 | 说明 |
|------|--------|------|
| 前端多端 | Taro + React + TypeScript | 支持 H5、微信小程序、支付宝小程序 |
| PC 中后台 | Ant Design Pro + React + TypeScript | 企业级中后台解决方案，支持 30+ 子应用 |
| AI Studio | React + Spring Boot + Freemarker | CRUD 自动生成、代码审核、热更新平台 |
| 业务后端 | Spring Boot + MyBatis + Nacos | 微服务架构，支持多模块 |
| 辅助工具 | Python + Go | 数据处理、自动化测试、CLI 工具 |

## 快速开始

### 环境要求

- Node.js >= 20.0.0
- Pnpm >= 9.0.0
- Docker & Docker Compose
- Git

### 1. 克隆项目

```bash
# 克隆工作区（包含所有子模块）
git clone https://github.com/your-org/enterprise-workspace.git
cd enterprise-workspace

# 初始化所有子模块
git submodule update --init --recursive
```

### 2. 安装依赖

```bash
# 使用 pnpm 安装所有依赖
pnpm install

# 或使用全局安装脚本
npm run install:all
```

### 3. 启动中间件

```bash
# 使用 Docker Compose 启动所有中间件
docker-compose -f docker-compose.yml up -d

# 启动的服务包括：
# - MySQL (3306)
# - Redis (6379)
# - Nacos (8848)
# - MinIO (9000/9001) - 可选
# - Elasticsearch (9200) - 可选
```

### 4. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
vim .env
```

### 5. 启动开发服务

```bash
# 启动所有开发服务
pnpm dev

# 或分别启动各模块
pnpm dev:frontend      # Taro 多端前端
pnpm dev:pc-admin      # PC 中后台
pnpm dev:ai-studio     # AI Studio
pnpm dev:backend       # 业务后端
```

### 6. 访问应用

| 应用 | 地址 | 说明 |
|------|------|------|
| Taro H5 | http://localhost:3000 | H5 端应用 |
| PC 中后台 | http://localhost:8001 | Ant Design Pro |
| AI Studio | http://localhost:3001 | CRUD 生成平台 |
| Nacos 控制台 | http://localhost:8848/nacos | 配置中心 |
| MinIO 控制台 | http://localhost:9001 | 对象存储 |

## 目录结构

```
enterprise-workspace/
├── README.md                    # 项目总入口（本文档）
├── CHANGELOG.md                 # 版本变更日志
├── package.json                 # 工作区级依赖配置
├── turbo.json                   # Turbo 任务调度配置
├── docker-compose.yml           # 本地开发中间件配置
├── .env.example                 # 环境变量模板
├── .gitignore                   # 版本控制忽略规则
│
├── docs/                        # 项目文档
│   ├── development/             # 开发规范文档
│   ├── architecture/            # 架构设计文档
│   ├── api/                     # API 文档
│   ├── cicd/                    # CI/CD 文档
│   ├── deploy/                  # 部署文档
│   └── middleware/              # 中间件文档
│
├── frontend/                    # Taro 多端前端模块
│   ├── apps/                    # 多端业务应用
│   ├── packages/                # 公共复用包
│   └── config/                  # 构建配置
│
├── pc-admin/                    # PC 中后台系统
│   ├── design-token/            # 原子化设计体系
│   ├── bootstrap/               # 统一启动入口
│   ├── core/                    # 核心框架层
│   ├── apps/                    # 30+ 业务子应用
│   └── generated/               # AI 生成代码目录
│
├── ai-studio/                   # AI Studio 基座
│   ├── frontend/                # AI Studio 前端
│   ├── backend/                 # AI Studio 后端
│   ├── template/                # 代码生成模板库
│   └── config/                  # 全局配置
│
├── backend/                     # 业务后端服务
│   ├── common/                  # 公共模块
│   ├── api/                     # 接口层
│   ├── service/                 # 业务层
│   ├── model/                   # 数据层
│   └── config/                  # 配置类
│
├── auxiliary/                   # 辅助工具项目
│   ├── python/                  # Python 工具
│   └── go/                      # Go 工具
│
├── infra/                       # 基础设施配置
│   ├── docker/                  # Docker 配置
│   ├── nacos/                   # Nacos 配置
│   ├── redis/                   # Redis 配置
│   └── keycloak/                # Keycloak 配置
│
├── .cicd/                       # CI/CD 配置
│   ├── github-actions/          # GitHub Actions 配置
│   ├── jenkins/                 # Jenkins 配置
│   └── env/                     # 环境配置
│
├── products/                    # 产品子仓库（Git Submodules）
│   ├── agent-cli-web/           # Agent CLI Web
│   ├── agent-orchestrator/      # Agent Orchestrator
│   ├── ops-platform/            # 运维平台
│   └── pc-admin/                # PC 管理端
│
├── references/                  # 参考资料目录
├── artifacts/                   # 构建产物目录（.gitignore）
├── logs/                        # 日志目录（.gitignore）
├── temp/                        # 临时文件目录（.gitignore）
└── backup/                      # 备份目录（.gitignore）
```

## 子仓库列表

本工作区通过 Git Submodules 集成以下产品仓库：

| 子仓库 | 路径 | 说明 |
|--------|------|------|
| agent-cli-web | products/agent-cli-web | Agent CLI Web 应用 |
| agent-orchestrator | products/agent-orchestrator | Agent 编排器 |
| ops-platform | products/ops-platform | 运维管理平台 |
| pc-admin | products/pc-admin | PC 管理端（备选代码源） |

## 可用命令

### 开发命令

```bash
# 启动开发服务
pnpm dev                    # 启动所有模块
pnpm dev:frontend           # 仅启动前端多端
pnpm dev:pc-admin           # 仅启动 PC 中后台
pnpm dev:ai-studio          # 仅启动 AI Studio
pnpm dev:backend            # 仅启动后端服务
```

### 构建命令

```bash
# 构建所有模块
pnpm build
pnpm build:frontend         # 构建前端多端
pnpm build:pc-admin         # 构建 PC 中后台
pnpm build:ai-studio        # 构建 AI Studio
pnpm build:backend          # 构建后端服务
pnpm build:all              # 全量构建
```

### 测试命令

```bash
# 运行测试
pnpm test                   # 运行所有测试
pnpm test:frontend          # 仅前端测试
pnpm test:backend           # 仅后端测试
pnpm test:ci                # CI 环境测试
```

### 代码检查命令

```bash
# 代码检查
pnpm lint                   # 检查所有模块
pnpm lint:fix               # 自动修复问题
pnpm lint:frontend          # 仅前端检查
pnpm lint:backend           # 仅后端检查
```

### AI Studio 命令

```bash
# AI Studio 功能
pnpm ai:generate            # 代码生成
pnpm ai:hot-update          # 热更新
pnpm ai:preview             # 预览生成效果
```

### 依赖管理命令

```bash
# 依赖管理
pnpm install:all            # 安装所有依赖
pnpm clean                  # 清理构建产物
pnpm clean:cache            # 清理缓存
```

### CI/CD 命令

```bash
# CI/CD 命令
pnpm ci:validate            # CI 前置校验
pnpm ci:cache               # 依赖缓存
pnpm cd:deploy:test         # 部署到测试环境
pnpm cd:deploy:prod         # 部署到生产环境
```

## AI Studio 使用指南

### 创建 CRUD 需求

1. 访问 AI Studio（http://localhost:3001）
2. 点击「创建 CRUD 需求」
3. 输入表名或导入表结构文件（Excel/JSON/SQL）
4. 确认字段信息（字段名、类型、长度、备注）
5. 提交审核

### IT 审核流程

1. IT 管理员登录 AI Studio
2. 查看待审核需求列表
3. 审核字段定义和代码生成规则
4. 通过审核或驳回修改

### 生成和预览

1. 审核通过后自动生成代码
2. 部署到测试环境预览
3. 确认生成效果
4. 提交生产发布

### 生产热更新

1. IT 管理员确认生产发布
2. 执行热更新（代码替换 + SQL 执行）
3. 验证更新结果
4. 记录发布日志

## CI/CD 流程

### Git Flow

- **feature/xxx**: 功能分支
- **develop**: 开发分支
- **release/xxx**: 发布分支
- **hotfix/xxx**: 紧急修复分支
- **main**: 主分支（生产代码）

### 流水线

1. **CI 流水线**: 代码检查 → 构建 → 测试
2. **CD 测试环境**: 部署到测试环境 → 集成测试
3. **CD 生产环境**: 手动触发 → 灰度发布 → 全量发布
4. **CRUD 热更新**: 代码生成 → 审核 → 测试 → 热更新

## 文档链接

- [开发规范](docs/development/coding-standard.md)
- [环境搭建](docs/development/environment-setup.md)
- [AI Studio 开发指南](docs/development/ai-studio-dev.md)
- [架构设计](docs/architecture/)
- [API 文档](docs/api/)
- [CI/CD 文档](docs/cicd/)
- [部署文档](docs/deploy/)
- [中间件文档](docs/middleware/)

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -m 'feat: 添加新功能'`)
4. 推送到分支 (`git push origin feature/xxx`)
5. 创建 Pull Request

## 许可证

本项目为内部使用项目，许可证信息请参考 LICENSE 文件。

## 联系方式

如有问题，请联系：

- 项目负责人: [待添加]
- 技术支持: [待添加]
