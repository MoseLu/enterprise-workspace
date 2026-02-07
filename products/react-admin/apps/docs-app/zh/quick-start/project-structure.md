---
title: 项目结构
sidebar_label: 项目结构
sidebar_order: 3
---

# 项目结构

## Monorepo 结构概览

```
btc-shopflow-monorepo/
├── apps/                    # 应用目录
│   ├── main-app/            # 主应用（核心应用）
│   ├── admin-app/           # 管理后台应用
│   ├── system-app/          # 系统管理应用
│   ├── logistics-app/       # 物流应用
│   ├── finance-app/         # 财务应用
│   ├── quality-app/         # 质量应用
│   ├── engineering-app/    # 工程应用
│   ├── production-app/     # 生产应用
│   ├── operations-app/     # 运营应用
│   ├── dashboard-app/      # 仪表盘应用
│   ├── personnel-app/      # 人事应用
│   ├── docs-app/           # 文档站点（VitePress）
│   ├── layout-app/         # 布局应用
│   ├── home-app/           # 首页应用
│   └── mobile-app/         # 移动应用
│
├── packages/                # 共享包目录
│   ├── shared-core/        # 核心工具包
│   ├── shared-components/  # 共享组件包
│   ├── shared-router/      # 路由工具包
│   ├── design-tokens/      # 设计令牌包
│   └── vite-plugin/        # Vite 插件包
│
├── scripts/                 # 脚本目录
│   ├── i18n/               # i18n 相关脚本
│   └── commands/           # 命令行工具
│
├── configs/                # 全局配置
├── auth/                   # 认证相关
└── k8s/                    # Kubernetes 配置
```

## 应用目录结构

每个应用遵循统一的结构：

```
apps/{app-name}/
├── src/
│   ├── modules/            # 业务模块
│   │   └── {module-name}/
│   │       ├── config.ts   # 模块配置
│   │       ├── views/      # 视图组件
│   │       ├── composables/# Composables
│   │       └── index.ts    # 模块导出
│   ├── plugins/            # 应用插件
│   ├── bootstrap/          # 启动配置
│   ├── router/             # 路由配置
│   ├── locales/            # 国际化
│   └── main.ts             # 入口文件
├── docs/                    # 应用专属文档
├── package.json
└── vite.config.ts
```

## 共享包结构

```
packages/{package-name}/
├── src/                     # 源代码
├── docs/                    # 包文档
├── README.md                # 包说明
├── CHANGELOG.md             # 变更日志
└── package.json
```

## 关键目录说明

### apps/
所有应用代码，每个应用独立运行，也可作为微前端子应用。

### packages/
共享代码包，供多个应用复用：
- `shared-core`: 核心工具、类型定义、工具函数
- `shared-components`: UI 组件库
- `shared-router`: 路由工具
- `design-tokens`: 设计系统令牌
- `vite-plugin`: Vite 插件集合

### scripts/
项目级脚本工具：
- `i18n/`: 国际化脚本
- `commands/`: 命令行工具

## 模块系统

### 模块目录结构

```
modules/{module-name}/
├── config.ts                # 模块配置（路由、国际化等）
├── views/                   # 视图组件
│   └── index.vue
├── composables/             # Composables
│   └── useModule.ts
├── utils/                   # 工具函数（可选）
└── index.ts                 # 模块导出
```

### 模块配置

每个模块的 `config.ts` 包含：
- 模块元数据（name、label、order）
- 路由配置（views）
- 国际化配置（locale）
- 表格/表单配置（columns、forms）

## 相关文档

- [开发指南](/zh/guides/) - 应用开发指南
- [组件文档](/zh/components/) - 组件使用说明
- [共享包](/zh/packages/) - 共享包文档
