# 架构设计

本部分包含 BTC Shopflow 项目的架构设计文档。

## 文档列表

- [架构总览](./overview.md) - 系统架构概览
- [模块架构对比](../module-architecture-complete-comparison.md) - 与 cool-admin 的详细对比
- [图表系统](./chart-system.md) - 图表架构设计
- [认证架构](./auth.md) - 认证授权设计

## 核心架构

### 微前端架构
- 主应用 + 多子应用
- Qiankun 微前端框架
- 独立开发和部署

### 模块系统
- 自动路由发现
- 模块配置统一
- 插件系统支持

### 共享包
- shared-core: 核心工具
- shared-components: UI 组件库
- design-tokens: 设计系统

## 相关文档

- [开发指南](../development/app-development.md) - 应用开发
- [专题指南](../guides/) - 功能指南
