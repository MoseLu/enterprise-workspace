# BTC Shopflow 文档中心

欢迎来到 BTC Shopflow Monorepo 项目文档中心。

## 📚 文档导航

### 🚀 快速开始
- [环境安装](./getting-started/installation.md) - 开发环境搭建
- [快速开始](./getting-started/quick-start.md) - 启动项目
- [项目结构](./getting-started/project-structure.md) - Monorepo 结构说明

### 🏗️ 架构设计
- [架构总览](./architecture/overview.md) - 系统架构概览
- [模块架构完整对比](./module-architecture-complete-comparison.md) - 与 cool-admin 的架构对比
- [图表系统](./architecture/chart-system.md) - 图表架构设计
- [认证架构](./architecture/auth.md) - 认证授权设计

### 💻 开发指南
- [应用开发](./development/app-development.md) - 应用开发指南
- [脚本使用](./development/scripts-usage.md) - 脚本工具说明
- [脚本架构重构](./development/scripts-refactoring.md) - Scripts 架构重构说明
- [脚本归档报告](./development/scripts-archive-complete.md) - Scripts 归档完成报告
- [Git 工作流](./development/git-workflow.md) - Git 使用规范

#### 专题指南
- [国际化 (i18n)](./guides/i18n/) - i18n 完整指南
  - [快速开始](./guides/i18n/quick-start.md)
  - [扁平结构](./guides/i18n/flat-structure.md)
  - [命名规范](./guides/i18n/naming-convention.md)
  - [ESLint 规则](./guides/i18n/eslint-rules.md)
  - [加载顺序](./guides/i18n/loading-order.md)
- [路由系统](./guides/routing/) - 自动路由发现
  - [自动路由发现](./guides/routing/auto-discovery.md)
- [样式系统](./guides/styling/) - CSS 架构和设计令牌

### 🚀 部署运维
- [K8s 部署](./deployment/k8s.md) - Kubernetes 部署指南
- [CDN 加速](./deployment/cdn-acceleration.md) - CDN 资源加速
- [Nginx 子域名代理](../apps/docs-app/guides/deployment/nginx-subdomain-proxy.md) - Nginx 配置
- [K8s 增量部署](../apps/docs-app/guides/deployment/k8s-incremental-deployment.md) - 增量部署
- [反向代理架构](../apps/docs-app/guides/deployment/reverse-proxy-architecture.md) - 反向代理
- [子域名布局集成](../apps/docs-app/guides/deployment/subdomain-layout-integration.md) - 子域名集成
- [GitHub Actions + K8s](../apps/docs-app/guides/deployment/github-actions-k8s-setup.md) - GitHub Actions

### 🔄 CI/CD
- [Jenkins 配置](./ci-cd/jenkins-setup.md) - Jenkins 安装配置
- [部署策略](./ci-cd/deployment-strategy.md) - 部署策略说明

### 📚 API 参考
- [存储 API](./api/storage-usage.md) - 存储工具使用
- [用户检查 API](./api/user-check.md) - 用户检查 API
- [Shared Components](../packages/shared-components/README.md) - 共享组件库
- [Shared Core](../packages/shared-core/README.md) - 核心工具包

### 🔬 技术研究
- [Speculation Rules API 评估](./research/speculation-rules.md) - 技术调研

### 📦 归档文档
- [迁移历史](./archive/) - 已完成的迁移和重构记录

## 📖 VitePress 文档站点

完整的用户和开发者文档请访问：
- **本地开发**: `http://localhost:5173` (运行 `pnpm docs:dev`)
- **生产环境**: [部署后的文档地址]

文档源码位于：[apps/docs-app/](../apps/docs-app/)

## 🛠️ 组件文档

### Shared Components
所有共享组件的 API 文档：[packages/shared-components/src/components/](../packages/shared-components/src/components/)

每个组件目录下都有 `README.md` 文档，包含：
- API 说明
- Props 定义
- 事件说明
- 示例代码

### 用户级组件文档
详细的组件使用指南和示例：[apps/docs-app/packages/components/](../apps/docs-app/packages/components/)

## 📋 专题文档

### 插件系统
- [插件自动扫描](../apps/admin-app/src/plugins/README.md)
- 插件管理器：[packages/shared-core/src/btc/plugins/](../packages/shared-core/src/btc/plugins/)

### 工具和实用程序
- [i18n 脚本](../scripts/i18n/README.md)
- [命令行工具](../scripts/commands/README.md)

## 🔍 查找文档

### 按主题查找
- **国际化**: 搜索 `i18n`
- **路由**: 搜索 `router`, `route`
- **部署**: 搜索 `deployment`, `nginx`, `k8s`
- **组件**: 查看 `packages/shared-components/src/components/`
- **CI/CD**: 查看 `jenkins/` 目录

### 按文件类型查找
- **README**: 包和模块的总览文档
- **guides/**: 使用指南和教程
- **adr/**: 架构决策记录 (Architecture Decision Records)
- **sop/**: 标准操作流程 (Standard Operating Procedures)

## 📝 贡献文档

### 文档规范
请参考：
- [文档审计与重构方案](./DOCUMENTATION_AUDIT_AND_RESTRUCTURE.md)
- [文档清理检查清单](./DOCUMENTATION_CLEANUP_CHECKLIST.md)
- [文档迁移映射表](./DOCUMENTATION_MIGRATION_MAP.md)

### 编写文档
1. 使用 kebab-case 命名文件
2. 遵循 Markdown 规范
3. 添加清晰的标题和章节
4. 包含代码示例和截图
5. 保持文档简洁和最新

### 提交文档
1. 在正确的目录创建文档
2. 更新相关的导航文件
3. 在 PR 中说明文档变更
4. 确保链接有效

## 🆘 获取帮助

### 文档问题
如果发现文档问题：
1. 搜索现有 issue
2. 创建新 issue，标签 `documentation`
3. 或直接提交 PR 修复

### 联系方式
- 项目负责人：查看 [CONTRIBUTING.md](../CONTRIBUTING.md)
- 技术支持：查看项目 README

## 📊 文档状态

### 统计数据
- 总文档数：约 200+
- 组件文档：50+
- 指南文档：30+
- 架构文档：15+

### 最近更新
- 2024-01: 模块架构对比分析完成
- 2024-01: 自动路由发现文档更新
- 2024-01: 错误页面组件文档更新
- 2024-01: 文档清理方案制定

### 待办事项
查看 [DOCUMENTATION_CLEANUP_CHECKLIST.md](./DOCUMENTATION_CLEANUP_CHECKLIST.md)

## 🔗 相关资源

### 外部文档
- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Element Plus 文档](https://element-plus.org/)
- [VitePress 文档](https://vitepress.dev/)

### 工具文档
- [pnpm 文档](https://pnpm.io/)
- [Qiankun 文档](https://qiankun.umijs.org/)
- [ECharts 文档](https://echarts.apache.org/)

---

*最后更新: 2024-01*
