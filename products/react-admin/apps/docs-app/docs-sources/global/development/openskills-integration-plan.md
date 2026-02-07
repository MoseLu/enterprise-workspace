# OpenSkills 集成方案

## 概述

OpenSkills 是一个为 AI 编码代理提供通用技能加载系统的工具，可以让 Cursor 等 AI 工具更智能地理解和操作项目。

## 为什么引入 OpenSkills

### 当前痛点
1. AI 代理需要重复理解项目结构和操作流程
2. 复杂的操作（如发布流程）需要多次交互
3. 项目特定的知识散落在文档中，AI 难以快速定位
4. Monorepo 操作复杂，需要了解多个脚本和命令

### OpenSkills 的优势
1. **渐进式加载**：按需加载技能详情，不污染初始 prompt
2. **可复用**：技能可以在团队间共享和版本控制
3. **标准化**：使用 Anthropic 的 SKILL.md 标准格式
4. **多代理支持**：支持 Cursor, Claude Code, Windsurf, Aider 等

## 安装步骤

### 1. 全局安装 OpenSkills

```bash
npm i -g openskills
```

### 2. 选择安装位置

#### 方案 A：仅用于 Cursor（推荐）
```bash
# 安装到项目的 .claude/skills/
cd btc-shopflow-monorepo
openskills install <source>
```

#### 方案 B：多 AI 代理共用
```bash
# 安装到项目的 .agent/skills/（通用位置）
cd btc-shopflow-monorepo
openskills install <source> --universal
```

### 3. 更新 .gitignore

```bash
# 在项目根目录的 .gitignore 中添加
.claude/skills/
.agent/skills/
```

## 建议的项目技能（基于实际开发流程分析）

### 核心技能（必备）

#### 1. monorepo-quick-start（Monorepo 快速上手）⭐

**功能**：
- 项目结构概览（15个应用 + 7个包）
- 常用命令速查
- 应用和包的依赖关系
- 快速定位文件和模块

**使用场景**：
- "项目有哪些应用？"
- "system-app 在哪里？"
- "shared-components 包含哪些组件？"
- "如何在 admin-app 中运行开发服务器？"

**优先级**：⭐⭐⭐⭐⭐（必备）

#### 2. dev-workflow（开发工作流）⭐

**功能**：
- 本地开发环境启动（dev, dev:all）
- 热重载和调试技巧
- 端口配置和冲突解决
- 微前端联调指南

**使用场景**：
- "启动开发服务器"
- "同时运行多个应用"
- "端口被占用怎么办？"
- "如何调试主应用和子应用？"

**优先级**：⭐⭐⭐⭐⭐（必备）

#### 3. build-guide（构建指南）⭐

**功能**：
- 3种构建模式详解（build, build-cdn, build-dist, build-dist-cdn）
- 单应用构建 vs 全量构建
- 预览构建（preview-build）
- 构建产物位置和使用

**使用场景**：
- "构建 system-app"
- "什么时候用 build-cdn？"
- "预览构建结果"
- "构建所有应用"

**优先级**：⭐⭐⭐⭐⭐（必备）

#### 4. scripts-navigator（Scripts 导航器）⭐

**功能**：
- Scripts 新架构导航（v1.0.10 重构后）
- 脚本分类和位置（bin/, commands/, utils/, config/, shell/）
- 常用脚本速查表
- 脚本依赖关系

**使用场景**：
- "清理缓存的脚本在哪？"
- "如何运行类型检查？"
- "scripts 目录结构是怎样的？"
- "turbo-helper 有哪些方法？"

**优先级**：⭐⭐⭐⭐⭐（必备，刚重构完成）

### 高频技能（常用）

#### 5. release-automation（发布自动化）⭐

**功能**：
- 全自动发布流程（--auto 模式）
- CHANGELOG 自动生成
- 版本号规范（语义化版本）
- Git 标签和分支管理

**使用场景**：
- "发布 1.0.11 版本"
- "全自动发布新版本"
- "更新 CHANGELOG"
- "创建 hotfix 版本"

**优先级**：⭐⭐⭐⭐（高频）

#### 6. i18n-toolkit（国际化工具包）⭐

**功能**：
- 扁平化 i18n 结构管理
- 翻译完整性检查（check-completeness）
- 重复翻译检测（find-duplicates）
- 翻译文件合并（locale-merge）
- 新增翻译 key 的规范

**使用场景**：
- "检查缺失的英文翻译"
- "合并所有应用的 i18n 文件"
- "添加新的菜单翻译"
- "验证 i18n key 格式"

**优先级**：⭐⭐⭐⭐（高频）

#### 7. deploy-toolkit（部署工具包）⭐

**功能**：
- 4种部署方式（本地、静态、K8s、BPS）
- 环境配置（测试/生产）
- 部署测试和验证
- CI/CD 流程（GitHub Actions + Jenkins）

**使用场景**：
- "部署 admin-app 到测试环境"
- "静态资源部署"
- "K8s 增量部署"
- "触发 Jenkins 构建"

**优先级**：⭐⭐⭐⭐（高频）

#### 8. quality-assurance（质量保证）⭐

**功能**：
- Lint 检查和修复
- 类型检查（type-check）
- 循环依赖检查（check-circular）
- 测试运行（unit, integration, e2e）
- 错误报告生成

**使用场景**：
- "检查 TypeScript 错误"
- "运行 lint 并自动修复"
- "检测循环依赖"
- "生成 lint 错误报告"

**优先级**：⭐⭐⭐⭐（高频）

### 专项技能（按需）

#### 9. component-development（组件开发）

**功能**：
- 共享组件开发流程
- BTC 组件库使用指南
- 组件命名规范
- 组件导出和引用

**使用场景**：
- "创建新的 BTC 组件"
- "在应用中使用共享组件"
- "组件库有哪些可用组件？"
- "组件命名规范是什么？"

**优先级**：⭐⭐⭐（中频）

#### 10. module-system（模块系统）

**功能**：
- 模块自动扫描机制
- 模块配置规范（config.ts）
- 路由自动发现
- 模块间通信

**使用场景**：
- "在 admin-app 中添加新模块"
- "模块配置怎么写？"
- "路由如何自动生成？"
- "模块间如何通信？"

**优先级**：⭐⭐⭐（中频）

#### 11. troubleshooting（故障排查）

**功能**：
- 常见错误诊断和解决
- 构建失败排查
- 运行时错误调试
- 性能问题定位

**使用场景**：
- "构建失败怎么办？"
- "为什么应用加载不出来？"
- "如何调试微前端通信问题？"
- "性能慢怎么优化？"

**优先级**：⭐⭐⭐（中频）

#### 12. docs-system（文档系统）

**功能**：
- Docs-app 使用指南
- VitePress 配置
- 文档编写规范
- 文档部署流程

**使用场景**：
- "添加新的文档页面"
- "更新组件文档"
- "文档本地预览"
- "部署文档站点"

**优先级**：⭐⭐⭐（中频）

#### 13. git-workflow（Git 工作流）

**功能**：
- Git 分支策略（develop, main, release）
- Commit 规范（Conventional Commits）
- PR 流程
- Husky 钩子

**使用场景**：
- "创建功能分支"
- "提交信息怎么写？"
- "如何创建 PR？"
- "Commit 格式验证失败"

**优先级**：⭐⭐⭐（中频）

#### 14. cache-management（缓存管理）

**功能**：
- Vite 缓存清理
- Node modules 清理
- Turbo 缓存清理
- 构建产物清理

**使用场景**：
- "清理所有缓存"
- "Vite 缓存问题"
- "重新安装依赖"
- "构建缓存导致问题"

**优先级**：⭐⭐（低频但重要）

#### 15. cdn-ops（CDN 操作）

**功能**：
- CDN 构建和上传
- 静态资源加速配置
- 图标 CDN 设置
- CDN 缓存刷新

**使用场景**：
- "上传应用到 CDN"
- "配置 CDN 加速"
- "图标库 CDN 部署"
- "刷新 CDN 缓存"

**优先级**：⭐⭐（低频）

#### 16. app-creation（应用创建）

**功能**：
- 使用 create-app-cli 创建新应用
- 应用配置模板
- 微前端集成步骤
- 应用注册流程

**使用场景**：
- "创建新的子应用"
- "配置微前端路由"
- "注册到主应用"
- "应用模板在哪？"

**优先级**：⭐⭐（低频）

#### 17. package-management（包管理）

**功能**：
- pnpm workspace 管理
- 依赖升级策略
- 私有包发布（Verdaccio）
- Changesets 使用

**使用场景**：
- "升级依赖"
- "发布私有包"
- "使用 Verdaccio"
- "管理版本变更"

**优先级**：⭐⭐（低频）

#### 18. performance-optimization（性能优化）

**功能**：
- 构建性能分析
- 运行时性能优化
- Bundle 体积优化
- 懒加载策略

**使用场景**：
- "分析构建速度"
- "优化包体积"
- "实现懒加载"
- "性能瓶颈在哪？"

**优先级**：⭐⭐（低频但重要）

### 辅助技能（特殊场景）

#### 19. jenkins-ops（Jenkins 操作）

**功能**：
- Jenkins 配置管理
- Pipeline 编写
- 触发构建
- 故障排查

**使用场景**：
- "触发 Jenkins 构建"
- "更新 Jenkins 配置"
- "Jenkins 构建失败"
- "添加新的 Jenkins job"

**优先级**：⭐（特殊场景）

#### 20. k8s-deployment（K8s 部署）

**功能**：
- K8s 配置管理
- 增量部署流程
- 服务健康检查
- 回滚操作

**使用场景**：
- "K8s 增量部署"
- "检查 Pod 状态"
- "回滚到上一个版本"
- "更新 K8s 配置"

**优先级**：⭐（特殊场景）

## 技能结构示例

### 基本技能结构

```
.claude/skills/
└── monorepo-ops/
    ├── SKILL.md              # 技能定义和指令
    ├── references/
    │   ├── apps-config.md    # 应用配置说明
    │   └── structure.md      # 目录结构说明
    ├── scripts/
    │   └── list-apps.mjs     # 辅助脚本
    └── assets/
        └── templates/         # 模板文件
```

### SKILL.md 格式

```markdown
---
name: monorepo-ops
description: Monorepo 操作技能，帮助理解和操作 BTC ShopFlow 的 monorepo 结构
---

# Monorepo 操作指南

## 项目结构

BTC ShopFlow 是一个 pnpm monorepo，包含：

- **apps/**：15 个微前端应用
- **packages/**：共享包（components, core, utils 等）
- **scripts/**：构建和部署脚本

## 常用操作

### 列出所有应用

使用 turbo.js 工具：
\`\`\`bash
node scripts/commands/tools/turbo.js ls
\`\`\`

### 在特定应用中运行命令

\`\`\`bash
pnpm --filter=@btc/admin-app <command>
\`\`\`

### 构建所有应用

\`\`\`bash
pnpm build:all
\`\`\`

## 应用列表

查看 apps.config.json 获取完整的应用配置。

主要应用包括：
- admin-app：管理后台
- system-app：系统配置
- logistics-app：物流管理
- ... （其他应用）

## 依赖关系

所有应用都依赖以下共享包：
- @btc/shared-core
- @btc/shared-components
- @btc/shared-router
- @btc/build-utils
```

## 使用方式

### 1. 在 .cursorrules 中配置

在项目根目录的 `.cursorrules` 文件末尾添加：

```markdown
## 项目技能系统

本项目使用 OpenSkills 管理项目特定的操作技能。

### 可用技能

使用以下命令查看所有可用技能：
\`\`\`bash
openskills list
\`\`\`

### 加载技能

当需要执行特定操作时，使用以下命令加载相关技能：
\`\`\`bash
openskills read <skill-name>
\`\`\`

示例：
- `openskills read monorepo-ops` - 加载 Monorepo 操作技能
- `openskills read release-flow` - 加载发布流程技能
- `openskills read i18n-ops` - 加载国际化操作技能

### 技能开发

新技能存储在 `.claude/skills/` 目录下，使用 SKILL.md 格式。
```

### 2. 或者使用 AGENTS.md（可选）

如果项目使用 AGENTS.md，可以通过 `openskills sync` 自动同步：

```bash
openskills sync
```

这会自动更新 AGENTS.md 文件，添加 `<available_skills>` 部分。

## 安装现有技能（可选）

可以从 Anthropic 的技能市场安装一些通用技能：

```bash
# 交互式选择安装
openskills install anthropics/skills

# 推荐安装的技能
# - xlsx: Excel 文件处理
# - docx: Word 文档处理
# - skill-creator: 技能创建指南
```

## 创建自定义技能

### 1. 创建技能目录

```bash
mkdir -p .claude/skills/monorepo-ops
```

### 2. 创建 SKILL.md

参考上面的格式创建技能定义文件。

### 3. 添加辅助资源（可选）

- `references/`：参考文档
- `scripts/`：辅助脚本
- `assets/`：模板、配置等

### 4. 测试技能

```bash
# 列出技能
openskills list

# 加载技能
openskills read monorepo-ops

# 更新 .cursorrules 或 AGENTS.md
openskills sync
```

## 技能开发最佳实践

### 1. 使用清晰的指令

- 使用祈使句（"执行 X"，"检查 Y"）
- 提供具体的命令和示例
- 包含错误处理指南

### 2. 结构化内容

- 使用标题组织内容
- 使用列表和代码块
- 包含"何时使用"部分

### 3. 引用项目文件

```markdown
## 配置文件位置

- 应用配置：`apps.config.json`
- 构建配置：`scripts/config/build.config.js`
- 部署配置：`scripts/config/deploy.config.js`
```

### 4. 提供上下文

```markdown
## 背景

本项目使用 Turbo 进行 monorepo 管理，所有脚本统一存放在 `scripts/` 目录下。

最近完成了 scripts 架构重构（v1.0.10），新结构为：
- `bin/`：统一命令入口
- `commands/`：具体命令实现
- `utils/`：公共工具函数
- `config/`：配置文件
```

## 维护和更新

### 更新技能

1. 编辑 `.claude/skills/<skill-name>/SKILL.md`
2. 重新加载：`openskills read <skill-name>`
3. 更新配置：`openskills sync`

### 版本控制

建议将自定义技能纳入版本控制：

```bash
# 在 .gitignore 中移除（如果要版本控制）
# .claude/skills/

# 或者只版本控制自定义技能
.gitignore:
.claude/skills/*
!.claude/skills/monorepo-ops/
!.claude/skills/scripts-ops/
!.claude/skills/release-flow/
!.claude/skills/i18n-ops/
!.claude/skills/build-deploy/
```

## 预期效果

引入 OpenSkills 后，AI 代理可以：

1. **快速理解项目**：加载 monorepo-ops 技能即可了解整个项目结构
2. **执行复杂操作**：如发布新版本只需一个指令
3. **减少重复询问**：项目特定的知识已编码在技能中
4. **提高准确性**：标准化的操作流程减少错误

## 实施计划

### 阶段 1：基础设施（第 1 天）

**目标**：安装 OpenSkills 并配置基础环境

1. **安装 OpenSkills**
   ```bash
   npm i -g openskills
   ```

2. **创建技能目录**
   ```bash
   mkdir -p .claude/skills
   ```

3. **更新 .gitignore**
   ```bash
   echo ".claude/skills/" >> .gitignore
   ```

4. **更新 .cursorrules**
   添加技能系统说明（见下文）

### 阶段 2：核心技能创建（第 2-3 天）

**优先级顺序**：按使用频率和重要性

#### 第一批：日常开发必备（⭐⭐⭐⭐⭐）

1. **monorepo-quick-start** - 项目快速上手
2. **dev-workflow** - 开发工作流
3. **build-guide** - 构建指南
4. **scripts-navigator** - Scripts 导航器

#### 第二批：高频操作（⭐⭐⭐⭐）

5. **release-automation** - 发布自动化
6. **i18n-toolkit** - 国际化工具包
7. **deploy-toolkit** - 部署工具包
8. **quality-assurance** - 质量保证

#### 第三批：专项功能（⭐⭐⭐）

9. **component-development** - 组件开发
10. **module-system** - 模块系统
11. **troubleshooting** - 故障排查
12. **docs-system** - 文档系统
13. **git-workflow** - Git 工作流

#### 第四批：辅助功能（⭐⭐）

14. **cache-management** - 缓存管理
15. **cdn-ops** - CDN 操作
16. **app-creation** - 应用创建
17. **package-management** - 包管理
18. **performance-optimization** - 性能优化

#### 第五批：特殊场景（⭐）

19. **jenkins-ops** - Jenkins 操作
20. **k8s-deployment** - K8s 部署

### 阶段 3：测试和优化（第 4-5 天）

1. 测试每个技能的实际效果
2. 根据反馈优化指令
3. 补充遗漏的场景
4. 完善错误处理指南

### 阶段 4：文档和推广（第 6-7 天）

1. 完善技能文档
2. 创建使用教程
3. 团队培训
4. 收集使用反馈

## 推荐的实施策略

### 策略 1：快速验证（推荐）

**适合**：想快速体验 OpenSkills 的效果

1. 只创建前 4 个核心技能（第一批）
2. 实际使用 1-2 周
3. 根据效果决定是否继续

**投入**：2-3 天
**收益**：覆盖 80% 的日常开发场景

### 策略 2：全面部署

**适合**：确定长期使用 OpenSkills

1. 按阶段完整实施所有 20 个技能
2. 建立技能维护机制
3. 团队全面采用

**投入**：1-2 周
**收益**：覆盖 95% 的开发场景

### 策略 3：最小化（试验）

**适合**：先试用，观察效果

1. 只创建 1-2 个最常用的技能
2. 观察 1 周使用效果
3. 决定是否继续

**投入**：半天
**收益**：验证 OpenSkills 的价值

## .cursorrules 配置示例

在项目根目录的 `.cursorrules` 末尾添加：

```markdown
---

## 🎯 项目技能系统（OpenSkills）

本项目使用 OpenSkills 管理 Cursor AI 的项目专属技能，实现渐进式知识加载。

### 📚 可用技能列表

使用以下命令查看所有已安装的技能：
\`\`\`bash
openskills list
\`\`\`

### 🔧 加载技能

当需要执行特定操作时，通过以下方式加载相关技能：

\`\`\`bash
openskills read <skill-name>
\`\`\`

#### 核心技能（日常开发必备）

- \`openskills read monorepo-quick-start\` - Monorepo 快速上手
  - 何时使用：不熟悉项目结构，需要了解应用和包的位置
  
- \`openskills read dev-workflow\` - 开发工作流
  - 何时使用：启动开发服务器，本地开发和调试
  
- \`openskills read build-guide\` - 构建指南
  - 何时使用：构建应用，了解不同构建模式
  
- \`openskills read scripts-navigator\` - Scripts 导航器
  - 何时使用：查找或运行 scripts 目录下的脚本

#### 高频技能

- \`openskills read release-automation\` - 发布自动化
  - 何时使用：发布新版本，更新 CHANGELOG
  
- \`openskills read i18n-toolkit\` - 国际化工具包
  - 何时使用：管理翻译文件，添加/检查翻译
  
- \`openskills read deploy-toolkit\` - 部署工具包
  - 何时使用：部署应用到测试/生产环境
  
- \`openskills read quality-assurance\` - 质量保证
  - 何时使用：代码检查，lint/type-check/test

#### 专项技能

- \`openskills read component-development\` - 组件开发
- \`openskills read module-system\` - 模块系统
- \`openskills read troubleshooting\` - 故障排查
- \`openskills read docs-system\` - 文档系统
- \`openskills read git-workflow\` - Git 工作流
- \`openskills read cache-management\` - 缓存管理
- \`openskills read cdn-ops\` - CDN 操作
- \`openskills read app-creation\` - 应用创建
- \`openskills read package-management\` - 包管理
- \`openskills read performance-optimization\` - 性能优化

#### 辅助技能（特殊场景）

- \`openskills read jenkins-ops\` - Jenkins 操作
- \`openskills read k8s-deployment\` - K8s 部署

### 💡 使用建议

1. **按需加载**：只在需要时加载技能，避免污染 context
2. **组合使用**：复杂任务可以组合多个技能
3. **定期更新**：技能会随项目演进持续更新

### 🛠️ 技能开发

技能存储在 `.claude/skills/` 目录，使用标准的 SKILL.md 格式。

如需创建新技能或更新现有技能，参考：
- 文档：`docs/development/openskills-integration-plan.md`
- 示例：`.claude/skills/*/SKILL.md`
```

## 下一步行动

### 快速验证方案（推荐）⭐

**目标**：2-3 天内创建核心技能，立即提升开发效率

**步骤**：
1. 安装 OpenSkills：`npm i -g openskills`
2. 创建第一批 4 个核心技能（monorepo-quick-start, dev-workflow, build-guide, scripts-navigator）
3. 更新 `.cursorrules` 配置
4. 实际使用 1-2 周，观察效果
5. 根据反馈决定是否继续扩展

**预期效果**：
- Cursor 能快速理解项目结构
- 开发、构建操作一次到位
- 减少 80% 的重复性问题询问

### 全面实施方案

**目标**：1-2 周内完成所有 20 个技能

**步骤**：
1. 第 1 天：基础设施 + 第一批（4 个）
2. 第 2-3 天：第二批（4 个）
3. 第 4-5 天：第三批（5 个）
4. 第 6 天：第四批（5 个）
5. 第 7 天：第五批（2 个）+ 测试优化

**预期效果**：
- 覆盖 95% 的开发场景
- Cursor 成为项目专家
- 团队开发效率显著提升

## 参考资源

- [OpenSkills GitHub](https://github.com/numman-ali/openskills)
- [Anthropic Skills 市场](https://github.com/anthropics/skills)
- [技能创建指南]（安装后可用）：`openskills read skill-creator`
