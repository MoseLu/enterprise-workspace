---
title: 文档中心部署指南
type: guide
project: deployment
owner: dev-team
created: '2025-10-13'
updated: '2025-01-27'
publish: true
tags:
- guides
- deployment
- production
sidebar_label: 部署指南
sidebar_order: 1
sidebar_group: guides
---

# 部署指南

本部分包含了所有部署相关的文档，涵盖 Docker 部署、静态文件部署、K8s 部署、Nginx 配置等。

## 部署文档列表

### 基础部署
- **[CORS配置](./cors-config.md)** - 跨域资源共享配置说明
- **[静态部署](./static-deployment.md)** - 静态文件部署到宝塔面板
- **[反向代理架构](./reverse-proxy-architecture.md)** - 容器反向代理架构说明

### 容器化部署
- **[K8s增量部署](./k8s-incremental-deployment.md)** - Kubernetes 增量构建和部署指南
- **[GitHub Actions K8s配置](./github-actions-k8s-setup.md)** - GitHub Actions 自动部署到 K8s

### 网络配置
- **[Nginx子域名代理](./nginx-subdomain-proxy.md)** - Nginx 子域名反向代理配置
- **[子域名布局集成](./subdomain-layout-integration.md)** - 子域名访问时使用主应用 Layout

### 包管理
- **[包发布](./publish-packages.md)** - 发布共享组件库到 Verdaccio
- **[Verdaccio快速开始](./quick-start-verdaccio.md)** - Verdaccio 私有仓库快速开始指南

### 其他配置
- **[EPS共享方案](./eps-sharing-solution.md)** - EPS 服务共享方案
- **[图标CDN配置](./icons-cdn-setup.md)** - 图标文件 CDN 配置说明

## 快速导航

### 开发环境部署
1. 查看 [快速开始指南](../getting-started.md) 了解开发环境配置
2. 参考 [静态部署](./static-deployment.md) 进行本地测试部署

### 生产环境部署
1. **Docker部署**：参考 [K8s增量部署](./k8s-incremental-deployment.md) 或 [反向代理架构](./reverse-proxy-architecture.md)
2. **静态部署**：参考 [静态部署](./static-deployment.md)
3. **Nginx配置**：参考 [Nginx子域名代理](./nginx-subdomain-proxy.md)

### CI/CD 部署
1. 配置 GitHub Actions：参考 [GitHub Actions K8s配置](./github-actions-k8s-setup.md)
2. 设置 Secrets 和变量
3. 推送代码自动触发部署

## 部署方式对比

| 部署方式 | 适用场景 | 优点 | 缺点 |
|---------|---------|------|------|
| **Docker部署** | 生产环境、需要环境一致性 | 环境一致、易于扩展 | 资源占用较高 |
| **静态部署** | 纯前端应用、快速部署 | 部署快速、资源占用低 | 依赖服务器环境 |
| **K8s部署** | 大规模生产环境 | 自动扩展、滚动更新 | 配置复杂 |

## 相关文档

- [应用概览](../apps-overview.md) - 了解各应用的端口和配置
- [项目总览](/zh/quick-start/project-overview) - 了解项目整体架构
- [开发指南](../getting-started.md) - 开发环境配置

---

**最后更新**: 2025-01-27
**维护团队**: 开发团队
