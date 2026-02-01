---
title: K8s 增量构建和部署指南
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-01-27'
updated: '2025-01-27'
publish: true
tags:
- guides
- deployment
- kubernetes
- docker
sidebar_label: K8s增量部署
sidebar_order: 6
sidebar_group: deployment
---

# K8s 增量构建和部署指南

本文档详细说明如何使用增量构建和部署功能，实现"修改代码仅增量构建、修改应用仅增量部署"的极简更新流程。

## 📋 目录

- [核心概念](#核心概念)
- [前置准备](#前置准备)
- [快速开始](#快速开始)
- [详细说明](#详细说明)
- [最佳实践](#最佳实践)
- [故障排查](#故障排查)

## 核心概念

### 增量构建

利用 Docker 分层缓存机制，仅重新构建代码变更的层：
- **稳定层在前**：基础镜像、依赖安装等不常变更的内容
- **变化层在后**：源代码等频繁变更的内容
- **缓存复用**：未变更的层直接复用，大幅提升构建速度

### 增量分发

镜像仅传输变更的分层到私有镜像仓库：
- **分层传输**：Docker Registry 2.0+ 支持分层存储
- **仅传变更**：只传输变更的镜像层（通常几十KB到几MB）
- **网络优化**：私有仓库避免公网传输延迟

### 增量部署

按应用拆分 K8s 资源，仅更新修改的应用：
- **独立 Deployment**：每个应用独立的 Deployment 资源
- **滚动更新**：仅重启变更应用的 Pod，不影响其他服务
- **快速响应**：秒级完成更新，无需等待全量部署

## 前置准备

### 0. 配置文件设置（推荐）

创建配置文件可以避免每次手动指定 IP 地址：

```bash
# 复制配置文件模板
cp .k8s-config.example .k8s-config

# 编辑配置文件
# 设置 PRIVATE_REGISTRY=你的私有仓库地址
# 例如：PRIVATE_REGISTRY=192.168.1.100:5000
```

配置文件 `.k8s-config` 不会被提交到 Git，可以安全地存储本地配置。

### 1. 环境要求

- **本地环境**：
  - Docker（19.03+，支持 Buildx）
  - kubectl（已配置 K8s 集群访问）
  - Git

- **云服务器环境**：
  - Docker（用于运行私有镜像仓库）
  - Kubernetes 集群（单节点/多节点均可）
  - 网络连通性（本地能访问云服务器）

### 2. 设置私有镜像仓库

#### 在云服务器上启动 Docker Registry

```bash
# 方式一：使用提供的脚本（推荐）
bash scripts/setup-private-registry.sh

# 方式二：手动启动
docker run -d \
  --restart=always \
  --name private-registry \
  -p 5000:5000 \
  -v /var/lib/registry:/var/lib/registry \
  registry:2
```

#### 配置本地 Docker 访问私有仓库

**Linux/macOS**:
```bash
# 编辑 /etc/docker/daemon.json
sudo nano /etc/docker/daemon.json

# 添加以下内容（替换为你的云服务器IP）
{
  "insecure-registries": ["192.168.1.100:5000"]
}

# 重启 Docker
sudo systemctl restart docker
```

**Windows (Docker Desktop)**:
1. 打开 Docker Desktop 设置
2. 进入 "Docker Engine"
3. 添加配置：
```json
{
  "insecure-registries": ["192.168.1.100:5000"]
}
```
4. 点击 "Apply & Restart"

#### 验证私有仓库

```bash
# 测试连接
docker pull alpine:latest
docker tag alpine:latest <云服务器IP>:5000/alpine:test
docker push <云服务器IP>:5000/alpine:test

# 验证推送成功
curl http://<云服务器IP>:5000/v2/_catalog
```

### 3. 配置 K8s 访问私有仓库（可选）

如果私有仓库需要认证，创建 imagePullSecrets：

```bash
kubectl create secret docker-registry registry-secret \
  --docker-server=<云服务器IP>:5000 \
  --docker-username=<用户名> \
  --docker-password=<密码> \
  -n btc-shopflow
```

然后在 Deployment 的 `spec.template.spec` 中添加：
```yaml
imagePullSecrets:
- name: registry-secret
```

## 快速开始

### 方式一：使用配置文件（推荐）

```bash
# 1. 复制配置文件模板
cp .k8s-config.example .k8s-config

# 2. 编辑配置文件，设置私有仓库地址
# 编辑 .k8s-config，设置 PRIVATE_REGISTRY=192.168.1.100:5000

# 3. 增量构建和部署（无需指定 IP）
pnpm build-deploy:k8s

# 4. 查看部署状态
kubectl get pods -n btc-shopflow
```

### 方式二：使用命令行参数

```bash
# 增量构建和部署（指定私有仓库地址）
pnpm build-deploy:k8s --registry 192.168.1.100:5000
```

### 方式三：使用环境变量

```bash
# 设置环境变量
export PRIVATE_REGISTRY="192.168.1.100:5000"

# 增量构建和部署
pnpm build-deploy:k8s
```

### 方式四：使用 GitHub Actions（推荐用于 CI/CD）

GitHub Actions 会自动检测变更并执行增量构建和部署，**无需手动指定 IP**，所有配置都在 GitHub Secrets 中。

**详细配置说明请参考**：[GitHub Actions K8s 配置指南](./github-actions-k8s-setup.md)

**快速配置步骤**：

1. **在 GitHub 仓库设置中添加 Secrets**（Settings → Secrets and variables → Actions）：
   
   **镜像仓库配置**：
   
   - `PRIVATE_REGISTRY`（可选）: 私有镜像仓库地址
     - **使用私有 Docker Registry**（如：`192.168.1.100:5000`）:
       - 设置为：`192.168.1.100:5000`
       - 如果私有仓库**不需要认证**：`PRIVATE_REGISTRY_USERNAME` 和 `PRIVATE_REGISTRY_PASSWORD` 可以留空
       - 如果私有仓库**需要认证**：需要设置用户名和密码
     - **使用 GHCR**（GitHub Container Registry，推荐）:
       - 留空或设置为：`ghcr.io`
       - `PRIVATE_REGISTRY_USERNAME`: 留空（自动使用 `github.actor`，即 GitHub 用户名）
       - `PRIVATE_REGISTRY_PASSWORD`: 留空（自动使用 `GITHUB_TOKEN`，GitHub Actions 自动提供）
     - **使用其他公共仓库**（如 Docker Hub）:
       - 设置为：`docker.io` 或留空
       - `PRIVATE_REGISTRY_USERNAME`: Docker Hub 用户名
       - `PRIVATE_REGISTRY_PASSWORD`: Docker Hub 密码或 Access Token
   
   - `PRIVATE_REGISTRY_USERNAME`（可选）: 仓库用户名
     - **私有 Docker Registry（需要认证）**: 你的用户名
     - **GHCR**: 留空（自动使用 GitHub 用户名）
     - **Docker Hub**: Docker Hub 用户名
     - **私有仓库（不需要认证）**: 留空
   
   - `PRIVATE_REGISTRY_PASSWORD`（可选）: 仓库密码或 Token
     - **私有 Docker Registry（需要认证）**: 你的密码
     - **GHCR**: 留空（自动使用 `GITHUB_TOKEN`）
     - **Docker Hub**: Docker Hub 密码或 [Access Token](https://hub.docker.com/settings/security)
     - **私有仓库（不需要认证）**: 留空
   
   **配置示例**：
   
   ```yaml
   # 示例 1: 使用 GHCR（最简单，推荐）
   PRIVATE_REGISTRY: (留空)
   PRIVATE_REGISTRY_USERNAME: (留空)
   PRIVATE_REGISTRY_PASSWORD: (留空)
   # 说明：GitHub Actions 会自动使用 GITHUB_TOKEN 和 github.actor
   
   # 示例 2: 使用私有 Docker Registry（不需要认证）
   PRIVATE_REGISTRY: 192.168.1.100:5000
   PRIVATE_REGISTRY_USERNAME: (留空)
   PRIVATE_REGISTRY_PASSWORD: (留空)
   
   # 示例 3: 使用私有 Docker Registry（需要认证）
   PRIVATE_REGISTRY: registry.example.com:5000
   PRIVATE_REGISTRY_USERNAME: myuser
   PRIVATE_REGISTRY_PASSWORD: mypassword
   
   # 示例 4: 使用 Docker Hub
   PRIVATE_REGISTRY: docker.io
   PRIVATE_REGISTRY_USERNAME: mydockerhubuser
   PRIVATE_REGISTRY_PASSWORD: mydockerhubtoken
   ```
   
   **K8s 部署配置**（如果需要在 GitHub Actions 中自动部署）：
   - `K8S_SERVER`: K8s API 服务器地址（如：`https://kubernetes.example.com:6443`）
   - `K8S_CA_CERT`: K8s CA 证书（base64 编码）
   - `K8S_TOKEN`: K8s 访问令牌
   - `K8S_NAMESPACE`: K8s 命名空间（默认：`btc-shopflow`）

2. **自动触发**：推送代码到 `develop` 分支，GitHub Actions 会自动：
   - 检测变更的应用
   - 仅构建变更的应用
   - 推送到配置的镜像仓库
   - 自动部署到 K8s（如果配置了 K8s Secrets）

3. **手动触发**：
   - 在 GitHub Actions 页面选择 "Build and Deploy to K8s (Incremental)" 工作流
   - 点击 "Run workflow"
   - 可以选择：
     - `deploy_all`: 部署所有应用（不检测变更）
     - `skip_build`: 跳过构建步骤
     - `skip_deploy`: 跳过部署步骤

**优势**：
- ✅ 无需手动指定 IP，配置一次即可
- ✅ 自动检测变更，仅构建和部署变更的应用
- ✅ 支持并行构建，速度更快
- ✅ 完整的构建和部署日志
- ✅ 支持回滚和查看历史

### 常用命令

```bash
# 增量构建和部署（默认：仅变更的应用）
pnpm build-deploy:k8s

# 全量构建和部署（所有应用）
pnpm build-deploy:k8s:all

# 仅构建（不部署）
pnpm build:k8s

# 仅部署（不构建，需要先构建镜像）
pnpm deploy:k8s --apps system-app,admin-app

# 指定对比基准（相对于特定提交）
pnpm build-deploy:k8s --base origin/develop

# 使用命令行参数覆盖配置
pnpm build-deploy:k8s --registry 192.168.1.100:5000 --namespace my-namespace
```

## 详细说明

### 工作流程

```
本地修改代码
    ↓
执行增量构建脚本
    ↓
检测变更的应用（git diff）
    ↓
仅构建变更应用（复用未修改层）
    ↓
推送增量镜像到私有仓库（仅传变更层）
    ↓
触发 K8s 仅更新该应用（滚动更新）
    ↓
验证更新结果
```

### 变更检测逻辑

脚本使用 `git diff` 检测变更：

1. **应用代码变更**：检测 `apps/<app-name>/` 目录下的变更
2. **共享包变更**：检测 `packages/`、`configs/`、`scripts/` 等共享资源的变更
3. **配置文件变更**：检测 `turbo.json`、`package.json`、`pnpm-lock.yaml` 等配置文件的变更

如果共享包或配置文件有变更，所有应用都会被标记为需要构建。

### 镜像标签策略

- **动态标签**：使用 Git 短提交哈希（7位），如 `system-app:a1b2c3d`
- **latest 标签**：同时推送 `latest` 标签作为备选
- **唯一性保证**：每次提交都有唯一的镜像标签，避免覆盖

### K8s 部署策略

- **滚动更新**：`maxSurge: 1`, `maxUnavailable: 0`
- **零停机**：确保更新过程中服务不中断
- **自动回滚**：如果新版本启动失败，自动回滚到上一版本

## 最佳实践

### 1. 开发流程

```bash
# 1. 修改代码
vim apps/system-app/src/...

# 2. 提交代码（可选，但推荐）
git add .
git commit -m "feat: 添加新功能"

# 3. 增量构建和部署
pnpm build-deploy:k8s --registry <云服务器IP>:5000

# 4. 验证更新
kubectl get pods -n btc-shopflow -w
```

### 2. 多应用协同开发

如果多个开发者同时修改不同应用：

```bash
# 开发者 A：修改 system-app
pnpm build-deploy:k8s --registry <云服务器IP>:5000
# 仅构建和部署 system-app

# 开发者 B：修改 admin-app
pnpm build-deploy:k8s --registry <云服务器IP>:5000
# 仅构建和部署 admin-app，不影响 system-app
```

### 3. 共享包更新

如果修改了共享包（packages/），所有应用都需要重新构建：

```bash
# 修改共享包
vim packages/shared-core/src/...

# 增量构建会检测到共享包变更，自动构建所有应用
pnpm build-deploy:k8s:all --registry <云服务器IP>:5000
```

### 4. 性能优化

- **利用本地缓存**：首次构建后，后续构建会复用缓存层
- **并行构建**：可以同时构建多个应用（修改脚本支持并行）
- **网络优化**：使用内网或 VPN 连接云服务器，减少传输时间

## 故障排查

### 1. 构建失败

**问题**：镜像构建失败

```bash
# 查看构建日志
bash scripts/build-incremental-k8s.sh --registry <地址> --dry-run

# 手动构建单个应用
docker buildx build \
  --build-arg APP_DIR=apps/system-app \
  -t <仓库地址>/system-app:test \
  -f Dockerfile .
```

**解决方案**：
- 检查 Dockerfile 语法
- 确认应用目录存在
- 检查依赖安装是否成功

### 2. 推送失败

**问题**：镜像推送失败

```bash
# 测试私有仓库连接
curl http://<云服务器IP>:5000/v2/_catalog

# 检查 Docker 配置
cat /etc/docker/daemon.json

# 手动测试推送
docker push <仓库地址>/alpine:test
```

**解决方案**：
- 确认私有仓库正在运行
- 检查 `insecure-registries` 配置
- 确认网络连通性

### 3. 部署失败

**问题**：K8s 部署失败

```bash
# 查看 Pod 状态
kubectl get pods -n btc-shopflow

# 查看 Pod 日志
kubectl logs <pod-name> -n btc-shopflow

# 查看 Deployment 事件
kubectl describe deployment btc-system-app -n btc-shopflow
```

**解决方案**：
- 检查镜像是否存在：`docker pull <仓库地址>/system-app:latest`
- 确认 K8s 能访问私有仓库（配置 imagePullSecrets）
- 检查资源限制是否足够

### 4. 镜像拉取失败

**问题**：K8s 无法拉取镜像

```bash
# 检查镜像是否存在
kubectl describe pod <pod-name> -n btc-shopflow | grep -i image

# 测试从 K8s 节点拉取镜像
# 在 K8s 节点上执行
docker pull <仓库地址>/system-app:latest
```

**解决方案**：
- 确认 K8s 节点能访问私有仓库
- 配置 imagePullSecrets（如果需要认证）
- 检查网络策略是否阻止访问

## 高级配置

### 自定义构建参数

```bash
# 指定对比基准
pnpm build-deploy:k8s --registry <地址> --base origin/develop

# 跳过构建（仅部署）
pnpm build-deploy:k8s --registry <地址> --skip-build

# 跳过部署（仅构建）
pnpm build-deploy:k8s --registry <地址> --skip-deploy
```

### 环境变量配置

```bash
# 设置默认私有仓库地址
export PRIVATE_REGISTRY="192.168.1.100:5000"

# 设置 K8s 命名空间
export K8S_NAMESPACE="btc-shopflow"

# 设置 Git SHA（覆盖自动检测）
export GIT_SHA="a1b2c3d"
```

## 与现有流程的对比

### 传统方式（全量构建和部署）

```bash
# 构建所有应用（耗时：10-20分钟）
docker build ...

# 推送所有镜像（耗时：5-10分钟）
docker push ...

# 部署所有应用（耗时：2-5分钟）
kubectl apply ...
```

**总耗时**：17-35分钟

### 增量方式（仅变更应用）

```bash
# 检测变更（耗时：<1秒）
git diff ...

# 构建变更应用（耗时：1-3分钟，复用缓存）
docker buildx build --cache-from ...

# 推送变更镜像（耗时：10-30秒，仅传变更层）
docker push ...

# 部署变更应用（耗时：10-30秒，滚动更新）
kubectl set image ...
```

**总耗时**：1-4分钟（提升 80%+）

## 总结

增量构建和部署方案实现了：
- ✅ **极简流程**：一键执行，自动检测变更
- ✅ **快速更新**：仅处理变更部分，速度提升 80%+
- ✅ **零停机**：滚动更新，不影响其他服务
- ✅ **资源节省**：仅传输变更层，节省网络带宽
- ✅ **易于维护**：无需复杂工具，使用基础命令即可

---

**相关文档**：
- [K8s 部署指南](../k8s/README.md)
- [Dockerfile 优化说明](../Dockerfile)
- [私有仓库设置脚本](../scripts/setup-private-registry.sh)
