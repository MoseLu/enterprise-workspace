---
title: 应用目录说明
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-10-14'
updated: '2025-01-27'
publish: true
tags:
- overview
- apps
- micro-frontend
sidebar_label: 应用概览
sidebar_order: 3
sidebar_group: guides
---

# 应用概览

本目录包含所有微前端应用，采用 qiankun 微前端框架构建。

## 应用列表

### 1. system-app（系统应用）
- **开发端口**：8080
- **预览端口**：4180
- **生产域名**：bellis.com.cn
- **功能**：微前端容器和系统管理
- **特点**：作为主应用（基座应用），负责路由管理和子应用加载
- **启动命令**：`pnpm dev:system`

### 2. admin-app（管理应用）
- **开发端口**：8081
- **预览端口**：4181
- **生产域名**：admin.bellis.com.cn
- **功能**：后台管理模块，包含系统管理、权限配置等功能
- **特点**：包含全局布局、汉堡菜单、应用切换器
- **启动命令**：`pnpm dev:admin`
- **详细文档**：[主应用说明](../main-app-readme)

### 3. logistics-app（物流应用）
- **开发端口**：8082
- **预览端口**：4182
- **生产域名**：logistics.bellis.com.cn
- **功能**：物流管理相关功能
- **特点**：独立的业务模块应用
- **启动命令**：`pnpm dev:logistics`

### 4. quality-app（品质应用）
- **开发端口**：8083
- **预览端口**：4183
- **生产域名**：quality.bellis.com.cn
- **功能**：质量控制与检验
- **特点**：独立的业务模块应用
- **启动命令**：`pnpm dev:quality`

### 5. production-app（生产应用）
- **开发端口**：8084
- **预览端口**：4184
- **生产域名**：production.bellis.com.cn
- **功能**：生产计划与管理
- **特点**：独立的业务模块应用
- **启动命令**：`pnpm dev:production`

### 6. engineering-app（工程应用）
- **开发端口**：8085
- **预览端口**：4185
- **生产域名**：engineering.bellis.com.cn
- **功能**：工程设计与管理
- **特点**：独立的业务模块应用
- **启动命令**：`pnpm dev:engineering`

### 7. finance-app（财务应用）
- **开发端口**：8086
- **预览端口**：4186
- **生产域名**：finance.bellis.com.cn
- **功能**：财务管理模块
- **特点**：独立的业务模块应用
- **启动命令**：`pnpm dev:finance`

### 8. mobile-app（移动应用）
- **开发端口**：8091
- **预览端口**：4191
- **生产域名**：mobile.bellis.com.cn
- **功能**：移动端应用，首期聚焦盘点功能
- **特点**：支持 PWA、离线优先、支持 Capacitor 构建原生应用
- **技术栈**：Vue 3 + Vant Mobile + Capacitor
- **启动命令**：`pnpm dev:mobile`
- **详细文档**：查看 [mobile-app README](../../../apps/mobile-app/README.md)

### 9. docs-site-app（文档站点）
- **开发端口**：4172
- **预览端口**：4173
- **生产域名**：docs.bellis.com.cn
- **功能**：项目文档和技术文档
- **特点**：基于 VitePress 的文档系统
- **启动命令**：`pnpm dev:docs`

### 10. monitor-app（监控应用）
- **开发端口**：8089
- **预览端口**：4189
- **生产域名**：monitor.bellis.com.cn
- **功能**：全局错误监控和展示
- **特点**：实时接收并展示主应用和所有子应用产生的错误和警告
- **启动命令**：`pnpm dev:monitor`
- **详细文档**：查看 [monitor-app README](../../../apps/monitor-app/README.md)

### 11. layout-app（布局应用）
- **开发端口**：8088
- **预览端口**：4192
- **生产域名**：layout.bellis.com.cn
- **功能**：布局组件和共享布局功能
- **特点**：提供统一的布局组件
- **启动命令**：`pnpm dev:layout`

## 微前端架构

### qiankun 框架
- **主应用**: main-app 作为容器应用，负责路由管理和子应用加载
- **子应用**: 各业务应用作为独立应用（admin-app、logistics-app 等）
- **通信**: 通过 qiankun 的 props 和全局状态管理进行应用间通信

### 独立开发
- **技术栈**: 每个应用都是独立的 Vue 3 项目
- **部署**: 支持独立构建和部署
- **团队**: 支持多团队并行开发

## 开发指南

### 启动所有应用
```bash
# 启动所有应用（包含依赖构建）
pnpm dev:all

# 或启动所有应用开发服务器（不构建依赖）
pnpm dev
```

### 启动单个应用
```bash
pnpm dev:system      # 系统应用
pnpm dev:admin       # 管理应用
pnpm dev:logistics   # 物流应用
pnpm dev:quality     # 品质应用
pnpm dev:production # 生产应用
pnpm dev:engineering # 工程应用
pnpm dev:finance     # 财务应用
pnpm dev:mobile      # 移动应用
pnpm dev:docs        # 文档站点
pnpm dev:monitor     # 监控应用
```

### 构建应用
```bash
# 构建所有应用
pnpm build:all

# 构建特定应用
pnpm build:system
pnpm build:admin
pnpm build:logistics
# ... 其他应用类似
```

### 部署应用
```bash
# 构建并部署特定应用
pnpm build-deploy:system
pnpm build-deploy:admin
pnpm build-deploy:logistics
# ... 其他应用类似

# 部署所有应用
pnpm deploy:all
```

---

**架构类型**: 微前端  
**框架**: qiankun  
**维护团队**: 前端团队
