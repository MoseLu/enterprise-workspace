# Jenkins 安装和配置

## 概述

本文档说明如何安装和配置 Jenkins，以及如何设置必要的凭证和插件。

## 安装 Jenkins

### Docker 部署（推荐）

参考：[Docker 部署指南](../apps/docs-app/guides/deployment/docker-deployment-guide.md)

### 手动安装

1. 下载 Jenkins
2. 安装 Java 运行环境
3. 启动 Jenkins 服务

详细步骤请参考：[安装和访问指南](../../jenkins/install-and-access.md)

## 必需插件

安装以下 Jenkins 插件：

- Git Plugin
- Pipeline Plugin
- Docker Pipeline Plugin
- SSH Pipeline Steps
- Credentials Binding Plugin

完整列表请参考：[必需插件列表](../../jenkins/required-plugins.md)

## 凭证配置

### 必需凭证

| ID | 类型 | 说明 |
|---|---|---|
| `ssh-deploy-key` | SSH Username with private key | SSH 私钥 |
| `deploy-server-host` | Secret text | 服务器地址 |
| `deploy-server-user` | Secret text | 服务器用户名 |
| `deploy-server-port` | Secret text | SSH 端口 |
| `oss-access-key-id` | Secret text | 阿里云 OSS AccessKey ID（可选） |
| `oss-access-key-secret` | Secret text | 阿里云 OSS AccessKey Secret（可选） |

### 配置步骤

详细配置步骤请参考：[凭证配置指南](../../jenkins/credentials-setup.md)

## 任务管理

### 创建任务

- [创建任务指南](../../jenkins/create-jobs-guide.md)
- [CLI 创建任务](../../jenkins/create-individual-jobs-cli-guide.md)

### 任务配置

- [SCM 路径过滤](../../jenkins/scm-path-filter-guide.md)
- [Poll SCM 配置](../../jenkins/jenkins-poll-scm-guide.md)

## Webhook 配置

### GitHub Webhook

配置 GitHub Webhook 自动触发构建：

详细步骤请参考：[GitHub Webhook 配置](../../jenkins/github-webhook-setup-guide.md)

## 权限管理

- [创建管理员](../../jenkins/how-to-create-admin.md)
- [权限授予指南](../../jenkins/grant-permissions-guide.md)

## 故障排查

- [Docker Jenkins 修复指南](../../jenkins/docker-jenkins-fix-guide.md)
- [403 错误排查](../../jenkins/troubleshoot-403.md)
- [反向代理错误修复](../../jenkins/fix-reverse-proxy-error.md)

## 相关文档

- [部署策略](./deployment-strategy.md) - 部署策略说明
- [Jenkins 最佳实践](./best-practices.md) - 最佳实践
