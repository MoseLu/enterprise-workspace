# 规范自动加载器

> 本目录包含项目规范配置，所有 AI 助手启动时自动加载。

## 目录结构

```
.specify/
├── auto-load/                    # 自动加载配置
│   ├── constitution.loader      # 项目原则加载器
│   ├── specs.loader             # 规格文档加载器
│   └── rules.loader             # 规则加载器
├── memory/
│   └── constitution.md          # 项目治理原则（核心规范）
├── templates/                    # 规范模板
│   ├── spec-template.md         # 功能规格模板
│   ├── plan-template.md         # 技术实施计划模板
│   └── tasks-template.md        # 任务分解模板
└── scripts/
    ├── common.sh                # 公共函数库
    └── spec-loader.sh           # 规范加载脚本
```

## 自动加载机制

### 1. Claude 自动加载

Claude 启动时自动读取项目根目录的 `CLAUDE.md` 文件，该文件包含完整的项目指导和规范配置。

**配置位置：**
- 主配置：`CLAUDE.md`
- 规范核心：`.specify/memory/constitution.md`
- 规则文件：`.cursor/rules/spec-driven-development.jsonc`

**加载优先级：**
1. `CLAUDE.md` - 项目主配置（最高优先级）
2. `.specify/memory/constitution.md` - 项目原则
3. `.cursor/rules/` - 具体规则配置

### 2. Cursor 自动加载

Cursor 通过 `.cursor/rules/` 目录下的规则文件自动加载规范配置。

**配置位置：**
- 主规则：`.cursor/rules/spec-driven-development.jsonc`
- 规则目录：`.cursor/rules/`

**启用方式：**
规则文件已配置 `autoLoad: true`，Cursor 启动时自动加载。

### 3. Windsurf 自动加载

Windsurf 使用与 Claude 相同的配置机制，读取项目根目录的 `CLAUDE.md` 文件。

### 4. Codex CLI 自动加载

Codex CLI 读取项目根目录的 `CLAUDE.md` 文件和 `.specify/` 目录下的配置。

## 加载流程

### 启动时加载顺序

```
1. AI 助手启动
   ↓
2. 读取项目根目录 CLAUDE.md
   ↓
3. 读取 .specify/memory/constitution.md
   ↓
4. 读取 .cursor/rules/*.jsonc (如果存在)
   ↓
5. 加载所有规范配置到上下文
   ↓
6. 开始交互
```

### 配置合并规则

当存在多个配置文件时，按以下规则合并：

1. **优先级覆盖**：更高优先级的配置覆盖低优先级配置
2. **增量合并**：列表类配置（如规则列表）进行增量合并
3. **互斥覆盖**：互斥的配置项由优先级决定

## 使用方法

### 1. 验证自动加载

启动 AI 助手后，运行以下命令验证规范是否已加载：

```bash
# 检查 CLAUDE.md 是否存在
cat CLAUDE.md | head -20

# 检查 constitution 是否存在
cat .specify/memory/constitution.md | head -30

# 检查 Cursor 规则
cat .cursor/rules/spec-driven-development.jsonc | head -50
```

### 2. 刷新配置

如果修改了规范配置，需要刷新 AI 助手的上下文：

**方法 1：重启 AI 助手**
关闭当前会话，重新打开项目。

**方法 2：重新加载配置**
在对话中输入：
```
请重新加载项目配置，读取最新的 CLAUDE.md 和 constitution.md
```

### 3. 查看已加载规范

在 AI 助手中运行：

```
已加载的项目规范有哪些？请列出所有已加载的配置和规则。
```

## 配置说明

### CLAUDE.md 结构

```markdown
# CLAUDE.md

> 本文件为 AI 助手提供项目指导和规范驱动开发工作流程。

## 项目概述
[项目简介]

## 规范驱动开发流程
[开发流程说明]

## 可用命令
[AI 助手可用命令]

## 开发规范
[代码规范、Git 规范]

## 技术栈指南
[前端/后端/基础设施]

## 常用命令
[项目常用命令]

## 质量门禁
[代码质量要求]

## 故障排查
[常见问题解决]
```

### constitution.md 结构

```markdown
# 项目原则 Constitution

## 1 代码质量标准
- [类型安全、错误处理、测试要求]

## 2 用户体验一致性
- [设计原则、性能要求]

## 3 性能要求
- [前端性能、后端性能]

## 4 安全性要求
- [数据安全、应用安全]

## 5 架构原则
- [系统架构、数据架构]

## 6 开发流程规范
- [需求管理、版本控制]

## 7 文档规范
- [代码文档、技术文档]

## 8 协作规范
- [沟通协作、会议效率]

## 9 规范治理
- [规范演进、合规检查]

## 10 决策指南
- [优先级判断、争议解决]
```

### 规则文件结构

```jsonc
{
  "rules": [
    {
      "id": "rule-id",
      "name": "规则名称",
      "description": "规则描述",
      "match": {
        "filePatterns": ["**/*.ts", "**/*.tsx"]
      },
      "when": "always",
      "actions": [
        {
          "type": "read",
          "paths": [".specify/memory/constitution.md"]
        }
      ],
      "priority": "high"
    }
  ],
  "version": "1.0.0",
  "autoLoad": true
}
```

## 常见问题

### Q1: AI 助手没有加载规范配置

**检查步骤：**
1. 确认配置文件存在且格式正确
2. 检查文件权限是否可读
3. 重启 AI 助手

**解决方案：**
```bash
# 确认文件存在
ls -la CLAUDE.md
ls -la .specify/memory/constitution.md
ls -la .cursor/rules/

# 检查文件内容
head -50 CLAUDE.md
```

### Q2: 多个 AI 助手的配置不一致

**解决方案：**
所有 AI 助手使用相同的核心配置源（CLAUDE.md 和 constitution.md），确保配置一致性。不同 AI 助手的特定配置（如 Cursor 规则）会增量合并。

### Q3: 如何更新已加载的规范

**方法 1：重启会话**
关闭当前会话，重新打开项目。

**方法 2：使用刷新命令**
```
请使用最新的项目规范配置，包括刚更新的 constitution.md
```

### Q4: 规范配置不适用于当前任务

**解决方案：**
可以在对话中临时覆盖规范配置：
```
暂时跳过测试覆盖率要求，本次任务以快速原型验证为主
```

但这不会修改实际配置文件，只是当前会话的临时调整。

## 最佳实践

### 1. 规范文件维护

- **定期评审**：每季度评审规范的有效性
- **版本管理**：规范变更使用 Git 版本控制
- **变更通知**：重大规范变更通知所有团队成员

### 2. 配置同步

- **所有 AI 助手使用相同的核心配置**
- **特定配置使用增量合并**
- **避免配置冲突**

### 3. 新成员加入

新成员加入项目时：
1. 阅读 `CLAUDE.md` 了解项目整体情况
2. 阅读 `.specify/memory/constitution.md` 了解开发原则
3. 参考 `.specify/使用指南.md` 学习规范驱动开发流程

## 高级配置

### 1. 自定义加载行为

可以通过创建 `.specify/auto-load/` 目录下的自定义加载器来修改加载行为：

```bash
# 创建自定义加载器
mkdir -p .specify/auto-load

# 编辑自定义加载脚本
vim .specify/auto-load/constitution.loader
```

### 2. 环境特定配置

创建环境特定的配置文件：

```bash
# 开发环境配置
.vscode/settings.json

# 生产环境配置（如果需要）
.production/
```

### 3. 排除特定文件

在 `.cursorignore` 或 `.gitignore` 中排除敏感文件：

```bash
# 排除规范配置（但保留版本控制）
.specify/auto-load/

# 保留核心规范
!.specify/memory/constitution.md
```

## 相关文档

- [CLAUDE.md](../CLAUDE.md) - 项目主配置
- [constitution.md](memory/constitution.md) - 项目原则
- [使用指南.md](使用指南.md) - 完整使用教程
- [SpecKit 官方文档](https://github.com/github/spec-kit)

## 版本信息

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0.0 | 2026-02-01 | 初始版本 |
