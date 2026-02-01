# 项目文档审计与重构方案

## 一、现状统计

### 1. 文档总览
- **总计文档数**: 约 200+ 个 Markdown 文件（排除 node_modules）
- **总文档大小**: 约 1.8 MB
- **最大文档**: `module-architecture-complete-comparison.md` (25.65 KB, 514 行)

### 2. 文档分布

| 目录 | 数量 | 主要内容 |
|------|------|---------|
| `docs/` | 37 | 架构设计、部署指南、国际化文档 |
| `jenkins/` | 26 | CI/CD 配置、部署策略 |
| `components/` | 18 | 组件文档（分散在各目录） |
| `design-tokens/` | 16 | 设计令牌迁移记录 |
| `deployment/` | 12 | 部署相关文档 |
| `integration/` | 10 | 集成指南 |
| `shared-components/` | 10 | 共享组件文档 |
| 其他 | 100+ | 分散在各应用和包中 |

## 二、主要问题

### 1. 文档重复（Duplicate）

#### 严重重复
- **Nginx 代理配置**:
  - `docs/NGINX_SUBDOMAIN_PROXY.md` (18.6 KB)
  - `apps/docs-app/guides/deployment/nginx-subdomain-proxy.md` (18.88 KB)
  
- **K8s 部署指南**:
  - `docs/K8S_INCREMENTAL_DEPLOYMENT.md` (14.33 KB)
  - `apps/docs-app/guides/deployment/k8s-incremental-deployment.md` (14.6 KB)
  - `k8s/KUBERNETES_DEPLOYMENT.md` (15.34 KB)
  
- **反向代理架构**:
  - `docs/REVERSE_PROXY_ARCHITECTURE.md` (8.42 KB)
  - `apps/docs-app/guides/deployment/reverse-proxy-architecture.md` (8.71 KB)
  
- **子域名布局集成**:
  - `docs/SUBDOMAIN_LAYOUT_INTEGRATION.md` (8.65 KB)
  - `apps/docs-app/guides/deployment/subdomain-layout-integration.md` (8.96 KB)
  
- **GitHub Actions + K8s**:
  - `docs/GITHUB_ACTIONS_K8S_SETUP.md` (9.76 KB)
  - `apps/docs-app/guides/deployment/github-actions-k8s-setup.md` (10.07 KB)

#### 轻微重复
- **输入框封装**: 根目录下有两个相似文档
  - `封装输入框.md` (22.76 KB)
  - `输入框封装分析与建议.md` (9.96 KB)

- **README 文件**: 多个应用有相同的空 README
  - `apps/*/src/components/README.md` (10+ 个)
  - `apps/*/src/composables/README.md` (10+ 个)
  - `apps/*/src/config/README.md` (10+ 个)

### 2. 过时文档（Obsolete）

#### 迁移完成文档（应归档）
```
packages/design-tokens/
├── MIGRATION_COMPLETE.md
├── MIGRATION_SUMMARY.md
├── MIGRATION_MILESTONES.md
├── MIGRATION_CURRENT_STATE.md
├── MIGRATION_PROGRESS.md
├── MIGRATION_EXECUTION_GUIDE.md
├── MIGRATION_INDEX.md
├── MIGRATION_ATOMIC_STEPS.md
├── IMPLEMENTATION_COMPLETE.md
├── IMPLEMENTATION_STATUS.md
├── PLAN_EXECUTION_SUMMARY.md
└── FINAL_VERIFICATION.md
```

**建议**: 合并为一个 `MIGRATION_HISTORY.md`，其余移至 `archive/` 目录

#### 错误报告（应清理）
```
ts-error-reports/SUMMARY.md
lint-error-reports/SUMMARY.md
lint-error-reports/README.md
```

**建议**: 错误报告应该是临时文件，不应纳入版本控制

#### 日志迁移文档（已完成）
```
CONSOLE_TO_LOGGER_MIGRATION_REPORT.md
MIGRATION_COMPLETE_SUMMARY.md
LOGGING_LIBRARY_ANALYSIS.md
```

**建议**: 移至 `docs/archive/migrations/`

#### 样式重构文档（已完成）
```
packages/shared-components/src/styles/
├── IMPLEMENTATION_SUMMARY.md
└── ITCSS_RESTRUCTURE_PLAN.md
```

### 3. 位置不当（Misplaced）

#### 应移至 docs-app
- 根目录的中文文档:
  - `封装输入框.md` → 应该在 `apps/docs-app/guides/components/`
  - `输入框封装分析与建议.md` → 同上
  - `常见问题.md` → 应该在 `apps/docs-app/guides/faq.md`

- 顶层文档:
  - `SPECULATION_RULES_API_EVALUATION.md` → `docs/technical-research/`
  
#### 应移至 docs/
- `auth/README.md` → `docs/auth-architecture.md`
- `k8s/README.md` → `docs/deployment/k8s.md`

### 4. 命名不规范（Poor Naming）

#### 全大写命名（不符合规范）
```
LOGGING_LIBRARY_ANALYSIS.md
CONSOLE_TO_LOGGER_MIGRATION_REPORT.md
MIGRATION_COMPLETE_SUMMARY.md
SPECULATION_RULES_API_EVALUATION.md
等等...
```

**建议**: 统一使用 kebab-case 命名（如 `logging-library-analysis.md`）

#### 无意义命名
- `常见问题.md` → 应该是 `FAQ.md` 或 `common-issues.md`
- `封装输入框.md` → 应该是 `input-component-design.md`

### 5. 结构混乱（Poor Structure）

#### 组件文档分散
组件文档分散在多个位置：
- `packages/shared-components/src/components/*/README.md` (50+ 个)
- `apps/docs-app/packages/components/*.md` (15+ 个)
- `apps/*/src/components/*/README.md` (20+ 个)

#### Jenkins 文档过多
`jenkins/` 目录下有 26 个文档，但很多是重复内容或应该合并的主题。

## 三、清理方案

### Phase 1: 删除重复文档（优先级：高）

#### 1.1 删除 docs/ 下的重复文档
```bash
# 保留 apps/docs-app/guides/ 中的版本，删除 docs/ 中的重复文档
rm docs/NGINX_SUBDOMAIN_PROXY.md
rm docs/K8S_INCREMENTAL_DEPLOYMENT.md
rm docs/REVERSE_PROXY_ARCHITECTURE.md
rm docs/SUBDOMAIN_LAYOUT_INTEGRATION.md
rm docs/GITHUB_ACTIONS_K8S_SETUP.md
```

#### 1.2 删除空 README 文件
```bash
# 删除所有 2 行的空 README（只有标题和占位符）
find apps -name "README.md" -size -150c -delete
```

#### 1.3 删除错误报告文件
```bash
rm -rf ts-error-reports
rm -rf lint-error-reports
```

### Phase 2: 归档过时文档（优先级：高）

#### 2.1 创建归档目录
```bash
mkdir -p docs/archive/{migrations,design-tokens,css-architecture}
```

#### 2.2 归档迁移文档
```bash
# 设计令牌迁移
mv packages/design-tokens/MIGRATION_*.md docs/archive/design-tokens/
mv packages/design-tokens/IMPLEMENTATION_*.md docs/archive/design-tokens/
mv packages/design-tokens/PLAN_EXECUTION_SUMMARY.md docs/archive/design-tokens/
mv packages/design-tokens/FINAL_VERIFICATION.md docs/archive/design-tokens/

# 创建一个简洁的迁移历史总结
cat > packages/design-tokens/MIGRATION_HISTORY.md << EOF
# 设计令牌迁移历史

迁移已于 2024 年完成。详细迁移记录见 \`docs/archive/design-tokens/\`。

## 当前状态
- ✅ 设计令牌系统已完全实现
- ✅ 所有应用已集成
- ✅ CSS 变量已标准化

## 文档
- [README.md](./README.md) - 使用指南
- [TOKENS_STRUCTURE.md](./TOKENS_STRUCTURE.md) - 令牌结构
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - 测试指南
EOF
```

```bash
# 日志迁移
mv CONSOLE_TO_LOGGER_MIGRATION_REPORT.md docs/archive/migrations/
mv MIGRATION_COMPLETE_SUMMARY.md docs/archive/migrations/
mv LOGGING_LIBRARY_ANALYSIS.md docs/archive/migrations/

# CSS 架构重构
mv packages/shared-components/src/styles/IMPLEMENTATION_SUMMARY.md docs/archive/css-architecture/
mv packages/shared-components/src/styles/ITCSS_RESTRUCTURE_PLAN.md docs/archive/css-architecture/
```

### Phase 3: 重新组织文档结构（优先级：中）

#### 3.1 移动位置不当的文档
```bash
# 根目录中文文档 → docs-app
mv 封装输入框.md apps/docs-app/guides/components/input-component-design.md
mv 输入框封装分析与建议.md apps/docs-app/guides/components/input-component-analysis.md
mv 常见问题.md apps/docs-app/guides/faq.md

# 技术研究文档 → docs/research/
mkdir -p docs/research
mv SPECULATION_RULES_API_EVALUATION.md docs/research/speculation-rules-evaluation.md

# 架构文档 → docs/architecture/
mkdir -p docs/architecture
mv auth/README.md docs/architecture/auth.md
```

#### 3.2 合并 Jenkins 文档
创建一个统一的 Jenkins 文档结构：
```
docs/ci-cd/
├── README.md              # Jenkins 总览
├── setup.md               # 安装配置（合并多个 setup 文档）
├── deployment.md          # 部署策略（合并 deployment-*.md）
├── webhook-triggers.md    # Webhook 和触发器（合并 webhook 和 trigger 文档）
└── best-practices.md      # 最佳实践
```

#### 3.3 统一组件文档位置
**策略**: 
- **源码级文档**: 保留在 `packages/shared-components/src/components/*/README.md`
  - 用于开发者查看组件 API 和使用方法
  - 简洁、技术性强
  
- **用户级文档**: 放在 `apps/docs-app/packages/components/*.md`
  - 用于用户查看完整示例和最佳实践
  - 详细、包含示例

### Phase 4: 规范文档命名（优先级：低）

#### 4.1 统一命名格式
```bash
# 全大写 → kebab-case
mv docs/ESLINT-I18N-RULES.md docs/eslint-i18n-rules.md
mv docs/I18N-NAMING-CONVENTION.md docs/i18n-naming-convention.md
mv docs/I18N-LOADING-ORDER.md docs/i18n-loading-order.md
mv docs/CDN_RESOURCE_ACCELERATION.md docs/cdn-resource-acceleration.md
mv docs/STORAGE_USAGE_AUDIT.md docs/storage-usage-audit.md
# ... 更多文件
```

## 四、新文档架构设计

### 目标原则
1. **单一来源（Single Source of Truth）**: 每个主题只有一份文档
2. **清晰分层**: 用户文档 vs 开发文档 vs 架构文档
3. **易于发现**: 合理的目录结构，明确的命名
4. **及时更新**: 文档与代码同步更新

### 推荐结构

```
btc-shopflow-monorepo/
├── README.md                           # 项目总览
├── CONTRIBUTING.md                     # 贡献指南
├── CHANGELOG.md                        # 变更日志
├── SECURITY.md                         # 安全政策
│
├── docs/                               # 📁 核心文档目录
│   ├── README.md                       # 文档导航
│   │
│   ├── getting-started/                # 🚀 快速开始
│   │   ├── installation.md
│   │   ├── quick-start.md
│   │   └── project-structure.md
│   │
│   ├── architecture/                   # 🏗️ 架构设计
│   │   ├── overview.md                 # 架构总览
│   │   ├── micro-frontend.md           # 微前端架构
│   │   ├── module-system.md            # 模块系统（合并现有的 module-* 文档）
│   │   ├── plugin-system.md            # 插件系统
│   │   ├── auth.md                     # 认证授权
│   │   ├── i18n.md                     # 国际化架构
│   │   └── storage.md                  # 存储架构
│   │
│   ├── development/                    # 💻 开发指南
│   │   ├── app-development.md          # 应用开发
│   │   ├── component-development.md    # 组件开发
│   │   ├── coding-standards.md         # 编码规范
│   │   ├── testing.md                  # 测试指南
│   │   └── debugging.md                # 调试技巧
│   │
│   ├── deployment/                     # 🚀 部署文档
│   │   ├── overview.md                 # 部署总览
│   │   ├── nginx-proxy.md              # Nginx 代理配置
│   │   ├── k8s-deployment.md           # K8s 部署
│   │   └── cdn-acceleration.md         # CDN 加速
│   │
│   ├── ci-cd/                          # 🔄 CI/CD
│   │   ├── README.md                   # Jenkins 总览
│   │   ├── setup.md                    # 安装配置
│   │   ├── deployment.md               # 部署策略
│   │   ├── webhook-triggers.md         # Webhook 触发
│   │   └── best-practices.md           # 最佳实践
│   │
│   ├── guides/                         # 📖 专题指南
│   │   ├── i18n/                       # 国际化指南
│   │   │   ├── quick-start.md
│   │   │   ├── best-practices.md
│   │   │   ├── flat-structure.md
│   │   │   └── eslint-rules.md
│   │   │
│   │   ├── routing/                    # 路由指南
│   │   │   ├── auto-discovery.md
│   │   │   └── configuration.md
│   │   │
│   │   └── styling/                    # 样式指南
│   │       ├── css-architecture.md
│   │       ├── design-tokens.md
│   │       └── best-practices.md
│   │
│   ├── api/                            # 📚 API 文档
│   │   ├── shared-core.md
│   │   ├── shared-components.md
│   │   └── plugin-api.md
│   │
│   ├── research/                       # 🔬 技术研究
│   │   └── speculation-rules-evaluation.md
│   │
│   └── archive/                        # 📦 归档文档
│       ├── migrations/                 # 迁移记录
│       │   ├── logger-migration.md
│       │   └── console-to-logger.md
│       ├── design-tokens/              # 设计令牌迁移
│       └── css-architecture/           # CSS 架构重构
│
├── apps/                               # 应用目录
│   ├── docs-app/                       # 📖 VitePress 文档站点
│   │   ├── README.md
│   │   ├── overview/                   # 项目概览
│   │   ├── guides/                     # 用户指南
│   │   │   ├── components/             # 组件使用指南
│   │   │   ├── forms/                  # 表单指南
│   │   │   ├── backend/                # 后端指南
│   │   │   ├── deployment/             # 部署指南
│   │   │   └── integration/            # 集成指南
│   │   ├── packages/                   # 包文档
│   │   │   ├── components/             # 组件详细文档
│   │   │   ├── utils/                  # 工具文档
│   │   │   └── plugins/                # 插件文档
│   │   ├── sop/                        # 标准操作流程
│   │   ├── adr/                        # 架构决策记录
│   │   └── types/                      # 类型文档
│   │
│   └── */                              # 其他应用
│       └── README.md                   # 应用说明
│
├── packages/                           # 包目录
│   ├── shared-components/
│   │   ├── README.md                   # 包总览
│   │   └── src/components/*/README.md  # 组件 API 文档（简洁）
│   │
│   ├── shared-core/
│   │   ├── README.md
│   │   └── src/*/README.md             # 工具和 API 文档
│   │
│   └── design-tokens/
│       ├── README.md                   # 使用指南
│       ├── TOKENS_STRUCTURE.md         # 令牌结构
│       ├── TESTING_GUIDE.md            # 测试指南
│       └── MIGRATION_HISTORY.md        # 迁移历史（简要）
│
└── scripts/                            # 脚本目录
    ├── README.md                       # 脚本总览
    ├── i18n/README.md                  # i18n 脚本文档
    └── commands/README.md              # 命令行工具文档
```

### 文档分类说明

| 目录 | 用途 | 受众 | 维护频率 |
|------|------|------|---------|
| `docs/getting-started/` | 新手入门 | 新开发者 | 低 |
| `docs/architecture/` | 架构设计 | 架构师、高级开发者 | 中 |
| `docs/development/` | 开发规范 | 所有开发者 | 中 |
| `docs/deployment/` | 部署运维 | DevOps | 低 |
| `docs/ci-cd/` | CI/CD 流程 | DevOps | 低 |
| `docs/guides/` | 专题指南 | 相关开发者 | 高 |
| `docs/api/` | API 参考 | 所有开发者 | 中 |
| `docs/research/` | 技术调研 | 技术决策者 | 低 |
| `docs/archive/` | 历史文档 | 参考 | 不维护 |
| `apps/docs-app/` | 用户文档 | 用户、开发者 | 高 |
| `packages/*/README.md` | API 文档 | 开发者 | 高 |

## 五、文档规范

### 1. 命名规范

#### 文件命名
- **格式**: kebab-case（`my-document.md`）
- **语言**: 英文为主，中文文档加 `.zh.md` 后缀
- **特殊文件**: 全大写（`README.md`, `CHANGELOG.md`, `LICENSE`）

#### 标题格式
- **一级标题**: `# 文档标题`（每个文档只有一个）
- **二级标题**: `## 主要章节`
- **三级标题**: `### 子章节`
- **不要跳级**: 不要直接从 `##` 跳到 `####`

### 2. 文档模板

#### 架构文档模板
```markdown
# [功能名称] 架构

## 概述
简要描述这个功能的目的和核心价值。

## 架构设计
### 总体架构
[架构图]

### 核心概念
- 概念1: 说明
- 概念2: 说明

### 技术栈
- 技术1: 用途
- 技术2: 用途

## 实现细节
### 模块1
说明...

### 模块2
说明...

## API 参考
[链接到 API 文档]

## 最佳实践
1. 实践1
2. 实践2

## 常见问题
### 问题1
解答...

## 参考资料
- [相关文档链接]
```

#### 指南文档模板
```markdown
# [功能] 使用指南

## 快速开始
最简单的使用示例

## 基础用法
### 用法1
说明和示例...

### 用法2
说明和示例...

## 高级用法
### 高级特性1
说明和示例...

## 示例
### 完整示例1
代码示例...

## 注意事项
1. 注意1
2. 注意2

## 相关文档
- [相关文档链接]
```

### 3. Markdown 规范

#### 链接
- **内部链接**: 使用相对路径
  ```markdown
  [架构文档](./architecture/overview.md)
  ```
- **外部链接**: 使用绝对 URL
  ```markdown
  [Vue 官方文档](https://vuejs.org/)
  ```

#### 代码块
- **指定语言**: 
  ```markdown
  ```typescript
  const foo = 'bar';
  ```
  ```
- **文件路径**: 使用注释标注
  ```markdown
  ```typescript
  // src/utils/helper.ts
  export function helper() {}
  ```
  ```

#### 列表
- **无序列表**: 使用 `-` 
- **有序列表**: 使用 `1. 2. 3.`
- **嵌套列表**: 使用 2 空格缩进

#### 表格
- **对齐**: 使用 `:` 控制对齐
  ```markdown
  | 左对齐 | 居中 | 右对齐 |
  |:-------|:----:|-------:|
  | 内容   | 内容 | 内容   |
  ```

### 4. 文档维护规则

#### 更新频率
- **API 文档**: 代码变更时同步更新
- **架构文档**: 架构变更时更新
- **指南文档**: 季度review一次

#### 过时标记
如果文档过时但暂时不能删除，添加警告：
```markdown
> ⚠️ **已过时**: 本文档已过时，请参考 [新文档](./new-doc.md)
```

#### 归档规则
- 迁移完成的文档 → `docs/archive/migrations/`
- 已废弃的特性文档 → `docs/archive/deprecated/`
- 保留至少 1 年，然后可以删除

## 六、执行计划

### Week 1: 清理重复和过时文档
- [ ] 删除 `docs/` 下的重复部署文档（5个）
- [ ] 删除空 README 文件（30+ 个）
- [ ] 删除错误报告目录（2个）
- [ ] 归档迁移文档到 `docs/archive/`（20+ 个）

### Week 2: 重组文档结构
- [ ] 创建新的 `docs/` 目录结构
- [ ] 移动根目录中文文档到 `docs-app/`
- [ ] 合并 Jenkins 文档到 `docs/ci-cd/`
- [ ] 整理 i18n 相关文档到 `docs/guides/i18n/`

### Week 3: 规范命名和内容
- [ ] 重命名全大写文档为 kebab-case
- [ ] 统一文档格式（使用模板）
- [ ] 添加文档导航（`docs/README.md`）

### Week 4: 更新和验证
- [ ] 更新所有内部链接
- [ ] 验证文档可访问性
- [ ] 更新 docs-app 的导航
- [ ] 添加文档贡献指南

## 七、成功指标

### 定量指标
- 文档总数减少 30%（从 200+ 到 140 左右）
- 重复文档减少 100%（0 个重复）
- 归档文档占比 < 15%

### 定性指标
- ✅ 每个主题只有一份文档
- ✅ 文档位置符合直觉
- ✅ 新开发者能在 5 分钟内找到需要的文档
- ✅ 文档命名统一规范

## 八、维护计划

### 日常维护
- **代码变更时**: 同步更新相关文档
- **每周**: 检查 PR 中的文档变更
- **每月**: 检查文档链接有效性

### 定期 Review
- **季度**: Review 所有指南文档
- **半年**: Review 架构文档
- **年度**: 全面审计文档，清理过时内容

### 责任分配
- **Tech Lead**: 架构文档维护
- **DevOps**: 部署和 CI/CD 文档
- **前端开发**: 组件和样式文档
- **i18n 负责人**: 国际化文档
- **所有开发者**: 自己负责模块的文档

## 附录

### A. 待清理文档清单

见 [DOCUMENTATION_CLEANUP_CHECKLIST.md](./DOCUMENTATION_CLEANUP_CHECKLIST.md)

### B. 文档迁移映射表

见 [DOCUMENTATION_MIGRATION_MAP.md](./DOCUMENTATION_MIGRATION_MAP.md)

### C. 参考资料

- [Write the Docs](https://www.writethedocs.org/)
- [Google 开发者文档风格指南](https://developers.google.com/style)
- [Microsoft 写作风格指南](https://docs.microsoft.com/en-us/style-guide/welcome/)
