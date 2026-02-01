# 企业工作空间 SpecKit 集成

> 规范驱动开发（Spec-Driven Development）配置与指南

## 概述

本目录包含企业工作空间的 SpecKit 集成配置，用于实施 GitHub 规范驱动开发方法论。SpecKit 是一套工具包，帮助团队通过规范来开发流程，从驱动整个需求定义到代码实现，确保开发过程更加规范、可预测和高效。

规范驱动开发与传统开发方式有本质区别。传统开发中，代码是核心，规范只是辅助性的文档，最终往往被丢弃。而规范驱动开发改变了这一范式：规范本身成为可执行的，直接生成可工作的实现，而不仅仅是指导开发。这种方法强调先定义「做什么」和「为什么做」，再考虑「怎么做」，从而提高开发质量和效率。

## 目录结构

```
.specify/
├── INSTALL.md                    # 安装指南
├── memory/
│   └── constitution.md           # 项目治理原则
├── templates/
│   ├── spec-template.md          # 功能规格模板
│   ├── plan-template.md          # 技术实施计划模板
│   └── tasks-template.md         # 任务分解模板
└── scripts/
    ├── common.sh                 # 公共函数库
    ├── create-new-feature.sh     # 创建新功能
    ├── setup-plan.sh             # 设置实施计划
    └── update-claude-md.sh       # 更新 CLAUDE.md
```

## 快速开始

### 环境准备

在开始使用 SpecKit 之前，请确保已安装以下工具：

- **Git**：版本控制
- **uv**：Python 包管理工具
- **Python 3.11+**：运行时环境
- **AI Agent**：Claude Code、Codex CLI、Cursor 或 Windsurf

详细的安装步骤请参考 [INSTALL.md](INSTALL.md)。

### 初始化项目

如果你刚克隆项目或首次使用 SpecKit，需要进行初始化：

```bash
# 检查必要工具
specify check

# 如果需要，初始化项目配置
# （通常项目已经预配置好）
```

### 创建新功能

要开始开发新功能，使用创建功能脚本：

```bash
# 进入项目根目录
cd e:\enterprise-workspace

# 创建新功能（替换为实际功能名称）
bash .specify/scripts/create-new-feature.sh "用户认证模块"

# 或者使用 AI Agent 创建
# 在 Claude Code 中运行：
# /speckit.specify 开发一个用户认证模块，支持邮箱密码登录和 JWT 令牌
```

## 开发工作流

### 第一阶段：定义需求

使用 `/speckit.specify` 命令定义功能需求。在这个阶段，重点是明确「做什么」和「为什么做」，而不是技术实现细节。详细的需求定义是后续所有工作的基础，模糊的需求会导致返工和质量问题。

**提示词示例：**

```
开发一个任务管理功能。用户可以创建项目、添加团队成员、分配任务。
任务有状态（待办、进行中、审核中、已完成），支持拖拽排序。
每个任务可以有多个评论，支持@提及团队成员。
任务卡片需要显示任务标题、负责人、截止日期、优先级。
```

**输出：** `specs/FEATURE-XXX-xxxx/spec.md`

### 第二阶段：创建技术计划

需求定义完成后，使用 `/speckit.plan` 命令创建技术实施计划。在这个阶段，需要明确技术栈选择、架构设计和实现方案。技术决策应该基于项目实际需求，而不是追求最新技术。

**提示词示例：**

```
基于以下技术栈，创建任务管理功能的技术实施计划：
- 前端：React 18 + TypeScript + Vite
- 后端：Go + Gin + GORM
- 数据库：PostgreSQL 14+
- 缓存：Redis 7+

要求：
1. RESTful API 设计
2. 数据库表结构设计
3. 前端组件设计
4. 性能优化策略
```

**输出：** `specs/FEATURE-XXX-xxxx/plan.md`

### 第三阶段：任务分解

技术计划确定后，使用 `/speckit.tasks` 命令将计划分解为可执行的任务。任务分解应该足够细粒度，每个任务应该可以在数小时内完成，便于跟踪进度和验证。

**输出：** `specs/FEATURE-XXX-xxxx/tasks.md`

### 第四阶段：实施开发

任务分解完成后，使用 `/speckit.implement` 命令开始开发。AI Agent 会按照任务列表顺序执行，每个任务完成后会自动进入下一个任务。开发过程中应遵循项目原则和代码规范。

**前置条件：**
- 规格文档完成
- 实施计划确定
- 任务列表生成

### 第五阶段：测试验收

开发完成后，进行全面测试：

- **单元测试**：验证单个函数/组件的正确性
- **集成测试**：验证模块间的协作
- **E2E 测试**：验证完整的用户流程
- **性能测试**：验证性能指标达标
- **安全测试**：验证安全性要求

## 模板说明

### 功能规格模板

`templates/spec-template.md` 提供了功能规格文档的标准结构，包括：

- **概述**：功能名称、优先级、目标用户
- **用户故事**：用户角色、意图和价值
- **功能需求**：详细的功能列表和交互流程
- **非功能需求**：性能、安全、可用性要求
- **数据模型**：实体设计和关系
- **接口设计**：API 定义和参数
- **测试需求**：测试策略和用例

### 技术实施计划模板

`templates/plan-template.md` 提供了技术实施计划的完整结构，包括：

- **项目概述**：技术栈选择和架构设计
- **详细设计**：前后端设计、数据库设计
- **API 设计**：接口定义和错误处理
- **安全设计**：认证授权和数据安全
- **性能设计**：性能指标和优化策略
- **部署设计**：部署架构和回滚策略

### 任务分解模板

`templates/tasks-template.md` 提供了任务分解的标准格式，包括：

- **阶段划分**：按功能模块划分阶段
- **任务详情**：任务描述、验收标准、依赖关系
- **执行记录**：任务状态跟踪
- **验收总结**：功能验收检查

## 脚本使用

### 公共函数

`scripts/common.sh` 提供了常用的函数库：

```bash
# 引入公共脚本
source .specify/scripts/common.sh

# 检查必要工具
check_prerequisites

# 检查 AI Agent
check_ai_agent

# 初始化环境
init_speckit_env
```

### 创建新功能

`scripts/create-new-feature.sh` 快速初始化功能目录：

```bash
# 基本用法
bash .specify/scripts/create-new-feature.sh "用户认证模块"

# 指定 AI Agent
bash .specify/scripts/create-new-feature.sh "用户认证模块" --ai claude

# 强制覆盖已存在目录
bash .specify/scripts/create-new-feature.sh "用户认证模块" --force
```

### 设置实施计划

`scripts/setup-plan.sh` 辅助设置技术实施计划：

```bash
# 基本用法
bash .specify/scripts/setup-plan.sh --feature FEATURE-20260201-0001

# 指定 AI Agent
bash .specify/scripts/setup-plan.sh --feature FEATURE-20260201-0001 --ai claude

# 跳过技术调研
bash .specify/scripts/setup-plan.sh --feature FEATURE-20260201-0001 --skip-research
```

### 更新 CLAUDE.md

`scripts/update-claude-md.sh` 根据项目状态更新 CLAUDE.md：

```bash
# 预览更改
bash .specify/scripts/update-claude-md.sh --dry-run

# 强制覆盖
bash .specify/scripts/update-claude-md.sh --force

# 显示完整信息
bash .specify/scripts/update-claude-md.sh --all
```

## 项目原则

`memory/constitution.md` 定义了项目的核心原则，包括：

- **代码质量标准**：类型安全、错误处理、测试要求
- **用户体验一致性**：设计原则、性能要求
- **安全性要求**：数据安全、应用安全
- **架构原则**：系统架构、数据架构
- **开发流程规范**：需求管理、版本控制
- **决策指南**：优先级判断、争议解决

所有开发活动必须遵循这些原则。当原则发生冲突时，按照以下优先级处理：安全性优先于一切，可维护性优先于性能优化，标准化优先于定制化。

## 最佳实践

### 需求定义阶段

在定义需求时，应该关注用户目标和业务价值，而不是技术实现。好的需求描述应该具体、可验证、有优先级。可以使用用户故事格式：「作为[角色]，我希望[功能]，以便[价值]」。每个用户故事应该有明确的验收标准，这些标准应该是可测试的。

### 技术设计阶段

技术设计应该基于实际需求，避免过度工程。选择成熟稳定的技术，而不是追求最新版本。设计文档应该包含备选方案和选择理由，便于后续评审和优化。在做技术决策时，要考虑团队的技术能力和维护成本。

### 任务分解阶段

任务应该足够细粒度，便于估算和跟踪。每个任务应该有一个明确的完成标准，任务之间的依赖关系应该清晰。优先完成关键路径上的任务，识别可以并行执行的任务以提高效率。

### 代码实现阶段

遵循项目代码规范，确保代码质量。及时编写测试用例，测试驱动开发是推荐的做法。保持提交粒度适中，每个提交应该是一个完整的、可工作的变更。及时更新相关文档，保持文档与代码同步。

## 常见问题

### 找不到 AI Agent

确保已安装支持的 AI Agent 之一：Claude Code、Codex CLI、Cursor 或 Windsurf。如果没有安装，可以访问各自的官网下载安装包。安装完成后，需要在终端中重新加载环境变量。

### 模板文件不适用

如果标准模板不完全适合你的项目，可以在模板基础上进行裁剪和调整。模板只是起点，应该根据实际项目需求进行定制。也可以创建项目特定的模板，放置在 `templates/` 目录下覆盖默认模板。

### 任务分解粒度问题

如果任务太大，难以在短时间内完成，说明任务分解不够细。尝试将大任务拆分为更小的子任务，每个任务应该可以在数小时内完成并验证。如果任务太琐碎，可以将相关任务合并为一个中等粒度的任务。

### AI Agent 不按预期工作

确保你的提示词足够具体和详细。AI Agent 需要明确的指导才能产生高质量的输出。如果输出不符合预期，尝试重新组织提示词，明确表达你的期望。也可以使用 `/speckit.clarify` 命令进行多轮澄清和细化。

## 参考资源

- [SpecKit 官方文档](https://github.com/github/spec-kit)
- [规范驱动开发指南](spec-driven.md)
- [项目开发规范](../docs/development/系统开发规范.md)
- [CI/CD 配置](../.cicd/)
- [架构文档](../docs/architecture/)

## 维护

本配置由企业架构组维护。如有问题或建议，请提交 Issue 或联系技术委员会。

## 许可

本项目遵循 MIT 许可协议。
