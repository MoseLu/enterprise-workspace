# 部署策略

## 概述

本文档说明 BTC Shopflow 项目支持的各种部署策略及其适用场景。

## 部署策略对比

### 静态部署 vs Docker 部署

| 特性 | 静态部署 | Docker 部署 |
|------|---------|------------|
| **构建产物** | 静态文件 | Docker 镜像 |
| **部署方式** | 直接上传文件 | 推送镜像到仓库 |
| **适用场景** | 简单项目 | 复杂项目 |
| **优势** | 快速、简单 | 环境一致、易扩展 |
| **劣势** | 环境依赖 | 需要 Docker 环境 |

详细对比请参考：[静态 vs Docker 部署](../../jenkins/static-vs-docker-deployment.md)

### 部署策略选择

1. **静态部署**: 适用于简单的前端应用
2. **Docker 部署**: 适用于需要环境隔离的应用
3. **增量部署**: 适用于大型 Monorepo 项目

## 增量部署

### 策略说明

只部署变更的应用，减少构建和部署时间。

### 触发方式

- **SCM Polling**: 定时检查代码变更
- **Webhook**: 代码推送时自动触发
- **手动触发**: 手动执行构建

详细说明请参考：
- [SCM Polling 指南](../../jenkins/jenkins-poll-scm-guide.md)
- [智能触发策略](../../jenkins/smart-trigger-strategy.md)
- [SCM Polling vs 手动构建](../../jenkins/scm-polling-vs-manual-build.md)

## 部署流程

### 标准流程

1. **代码提交** → 触发 Webhook 或 SCM Polling
2. **构建应用** → 执行构建脚本
3. **上传产物** → 上传到服务器或推送镜像
4. **部署应用** → 在服务器上部署
5. **验证部署** → 检查部署结果

### 回滚策略

如果部署失败，可以：
1. 使用之前的构建产物
2. 回滚到上一个版本
3. 检查构建日志定位问题

## 部署配置

### Jenkinsfile

每个应用都有对应的 Jenkinsfile：
- `Jenkinsfile.main-app` - 主应用
- `Jenkinsfile.admin-app` - 管理应用
- `Jenkinsfile.all-apps` - 所有应用

### 环境变量

在 Jenkins 任务中配置环境变量：
- `DEPLOY_ENV`: 部署环境（dev/staging/prod）
- `CDN_ENABLED`: 是否启用 CDN
- `DOCKER_REGISTRY`: Docker 镜像仓库地址

## 最佳实践

1. **使用增量部署**: 只构建变更的应用
2. **配置 Webhook**: 自动触发构建
3. **使用 Docker**: 确保环境一致性
4. **监控部署**: 及时发现问题

## 相关文档

- [Jenkins 配置](./jenkins-setup.md) - Jenkins 安装配置
- [部署运维](../deployment/) - 部署文档
