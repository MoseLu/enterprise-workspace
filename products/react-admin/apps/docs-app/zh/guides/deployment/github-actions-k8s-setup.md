---
title: GitHub Actions K8s 增量部署配置指南
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-01-27'
updated: '2025-01-27'
publish: true
tags:
- guides
- deployment
- github-actions
- kubernetes
sidebar_label: GitHub Actions K8s配置
sidebar_order: 4
sidebar_group: deployment
---

# GitHub Actions K8s 增量部署配置指南

本文档详细说明如何配置 GitHub Actions 以实现自动增量构建和部署到 K8s。

## 🎉 首次使用无需配置！

**工作流会自动检测配置并使用最佳方案**：

- ✅ **默认使用 GHCR**：无需任何配置，开箱即用
- ✅ **自动检测私有仓库**：如果设置了 `PRIVATE_REGISTRY`，自动使用
- ✅ **自动判断认证**：如果未设置用户名和密码，自动尝试匿名访问（适用于不需要认证的私有仓库）

**只需推送代码到 `develop` 分支即可自动触发！**

## 📋 目录

- [快速开始](#快速开始)
- [自动配置说明](#自动配置说明)
- [详细配置说明](#详细配置说明)
- [镜像仓库配置](#镜像仓库配置)
- [K8s 集群配置](#k8s-集群配置)
- [验证配置](#验证配置)
- [常见问题](#常见问题)

## 快速开始

### 方式一：零配置使用（推荐）

**适用于大多数场景（同一开发者，使用 GHCR）**：

1. **无需任何配置**
2. 推送代码到 `develop` 分支
3. GitHub Actions 自动：
   - 检测变更的应用
   - 构建并推送到 GHCR
   - 自动部署到 K8s（如果配置了 K8s Secrets）

### 方式二：使用私有仓库（不需要认证）

**适用于内网私有仓库，不需要认证的场景**：

1. 进入 GitHub 仓库 → Settings → Secrets and variables → Actions
2. 添加 Secret：
   - `PRIVATE_REGISTRY`: `192.168.1.100:5000`（你的私有仓库地址）
3. **无需设置** `PRIVATE_REGISTRY_USERNAME` 和 `PRIVATE_REGISTRY_PASSWORD`（留空即可）

### 方式三：使用私有仓库（需要认证）

**适用于需要认证的私有仓库**：

1. 进入 GitHub 仓库 → Settings → Secrets and variables → Actions
2. 添加 Secrets：
   - `PRIVATE_REGISTRY`: `registry.example.com:5000`
   - `PRIVATE_REGISTRY_USERNAME`: `myuser`
   - `PRIVATE_REGISTRY_PASSWORD`: `mypassword`

## 自动配置说明

工作流会在运行前自动检测配置，按以下优先级选择：

1. **检测 `PRIVATE_REGISTRY` Secret**：
   - 如果设置了：使用私有仓库
   - 如果未设置：使用 GHCR（默认）

2. **检测认证配置**（仅当使用私有仓库时）：
   - 如果同时设置了 `PRIVATE_REGISTRY_USERNAME` 和 `PRIVATE_REGISTRY_PASSWORD`：使用认证登录
   - 如果未设置或只设置了其中一个：尝试匿名访问（适用于不需要认证的私有仓库）

3. **使用 GHCR 时**：
   - 自动使用 `github.actor`（GitHub 用户名）作为用户名
   - 自动使用 `GITHUB_TOKEN`（GitHub Actions 自动提供）作为密码

**配置检测日志示例**：
```
🔍 检测镜像仓库配置...
✅ 未配置私有仓库，将使用 GitHub Container Registry (GHCR)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 配置摘要
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
镜像仓库: ghcr.io
使用 GHCR: true
需要认证: false
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 详细配置说明

### 镜像仓库配置

#### 选项 1: GitHub Container Registry (GHCR) - 推荐

**优点**：
- ✅ 无需额外配置
- ✅ 自动使用 GitHub Token，安全可靠
- ✅ 与 GitHub 集成良好
- ✅ 免费使用

**配置**：
```
PRIVATE_REGISTRY: (留空，默认使用 ghcr.io)
PRIVATE_REGISTRY_USERNAME: (留空，自动使用 github.actor)
PRIVATE_REGISTRY_PASSWORD: (留空，自动使用 GITHUB_TOKEN)
```

**镜像地址格式**：
```
ghcr.io/<github-username>/<repository-name>/<app-name>:<tag>
例如：ghcr.io/bellisgit/btc-shopflow-monorepo/system-app:a1b2c3d
```

#### 选项 2: 私有 Docker Registry（不需要认证）

**适用场景**：内网私有仓库，未启用认证

**配置**：
```
PRIVATE_REGISTRY: 192.168.1.100:5000
PRIVATE_REGISTRY_USERNAME: (留空)
PRIVATE_REGISTRY_PASSWORD: (留空)
```

**注意事项**：
- 确保 GitHub Actions runner 能访问该地址
- 如果仓库在私有网络，需要配置 VPN 或使用自托管 runner

#### 选项 3: 私有 Docker Registry（需要认证）

**适用场景**：启用了认证的私有仓库（如 Harbor、Nexus）

**配置**：
```
PRIVATE_REGISTRY: registry.example.com:5000
PRIVATE_REGISTRY_USERNAME: myuser
PRIVATE_REGISTRY_PASSWORD: mypassword
```

**获取凭据**：
- 联系仓库管理员获取用户名和密码
- 或使用服务账户的 Token

#### 选项 4: Docker Hub

**配置**：
```
PRIVATE_REGISTRY: docker.io
PRIVATE_REGISTRY_USERNAME: mydockerhubuser
PRIVATE_REGISTRY_PASSWORD: mydockerhubtoken
```

**获取 Docker Hub Token**：
1. 登录 [Docker Hub](https://hub.docker.com/)
2. 进入 Account Settings → Security
3. 创建 Access Token
4. 使用 Token 作为密码（不要使用账户密码）

### K8s 集群配置（可选）

如果需要在 GitHub Actions 中自动部署到 K8s，需要配置以下 Secrets：

#### 必需配置

- `K8S_SERVER`: K8s API 服务器地址
  - 格式：`https://kubernetes.example.com:6443`
  - 获取方式：`kubectl cluster-info` 或联系集群管理员

- `K8S_CA_CERT`: K8s CA 证书（base64 编码）
  - 获取方式：
    ```bash
    # 从 kubeconfig 文件获取
    kubectl config view --raw -o jsonpath='{.clusters[0].cluster.certificate-authority-data}'
    
    # 或从证书文件获取
    cat /path/to/ca.crt | base64 -w 0
    ```

- `K8S_TOKEN`: K8s 访问令牌
  - 获取方式：
    ```bash
    # 从 kubeconfig 文件获取
    kubectl config view --raw -o jsonpath='{.users[0].user.token}'
    
    # 或创建 ServiceAccount Token
    kubectl create serviceaccount github-actions -n btc-shopflow
    kubectl create clusterrolebinding github-actions-binding \
      --clusterrole=cluster-admin \
      --serviceaccount=btc-shopflow:github-actions
    kubectl get secret -n btc-shopflow -o jsonpath='{.items[?(@.metadata.annotations.kubernetes\.io/service-account\.name=="github-actions")].data.token}' | base64 -d
    ```

#### 可选配置

- `K8S_NAMESPACE`: K8s 命名空间
  - 默认值：`btc-shopflow`
  - 如果使用其他命名空间，设置此 Secret

## 配置步骤

### 步骤 1: 进入 GitHub Secrets 设置

1. 打开 GitHub 仓库
2. 点击 Settings
3. 点击 Secrets and variables → Actions
4. 点击 New repository secret

### 步骤 2: 添加 Secrets

按照上面的配置说明，逐个添加所需的 Secrets。

**Secret 命名规则**：
- 必须使用大写字母和下划线
- 例如：`PRIVATE_REGISTRY`、`K8S_SERVER`

### 步骤 3: 验证配置

1. 推送代码到 `develop` 分支
2. 查看 GitHub Actions 页面
3. 检查工作流是否成功运行
4. 查看构建日志，确认镜像推送成功

## 验证配置

### 验证镜像仓库配置

在 GitHub Actions 日志中查找：
```
✅ 镜像推送成功: <registry>/<app-name>:<tag>
```

如果看到错误：
- `unauthorized`: 检查 `PRIVATE_REGISTRY_USERNAME` 和 `PRIVATE_REGISTRY_PASSWORD`
- `connection refused`: 检查 `PRIVATE_REGISTRY` 地址是否正确，网络是否可达

### 验证 K8s 配置

在 GitHub Actions 日志中查找：
```
✅ 部署验证成功: X/Y Pods 就绪
```

如果看到错误：
- `Unable to connect to the server`: 检查 `K8S_SERVER` 地址
- `Unauthorized`: 检查 `K8S_TOKEN` 是否有效
- `certificate signed by unknown authority`: 检查 `K8S_CA_CERT` 是否正确

## 常见问题

### Q1: 使用 GHCR 需要配置 Secrets 吗？

**A**: 不需要。GitHub Actions 会自动使用 `GITHUB_TOKEN` 和 `github.actor`，无需额外配置。

### Q2: 私有仓库不需要认证，还需要设置用户名和密码吗？

**A**: 不需要。将 `PRIVATE_REGISTRY_USERNAME` 和 `PRIVATE_REGISTRY_PASSWORD` 留空即可。

### Q3: 如何测试私有仓库连接？

**A**: 在本地执行：
```bash
docker login <PRIVATE_REGISTRY>
docker pull alpine:latest
docker tag alpine:latest <PRIVATE_REGISTRY>/alpine:test
docker push <PRIVATE_REGISTRY>/alpine:test
```

### Q4: K8s Token 过期了怎么办？

**A**: 重新生成 Token 并更新 GitHub Secret：
```bash
# 重新创建 ServiceAccount Token
kubectl delete secret -n btc-shopflow github-actions-token
kubectl create secret generic github-actions-token \
  --from-literal=token=<new-token> \
  -n btc-shopflow
```

### Q5: 可以同时支持多个镜像仓库吗？

**A**: 目前工作流只支持一个镜像仓库。如果需要使用多个仓库，可以：
1. 修改工作流文件，添加条件判断
2. 或使用不同的工作流文件

### Q6: 如何查看当前配置的 Secrets？

**A**: GitHub Secrets 是加密的，无法直接查看值。但可以：
1. 查看 GitHub Actions 日志（值会被隐藏）
2. 在本地测试时使用相同的配置

## 安全建议

1. **使用 Token 而非密码**：
   - Docker Hub: 使用 Access Token
   - K8s: 使用 ServiceAccount Token
   - 定期轮换 Token

2. **最小权限原则**：
   - K8s ServiceAccount 只授予必要的权限
   - 不要使用 `cluster-admin`（除非必要）

3. **保护 Secrets**：
   - 不要将 Secrets 提交到代码仓库
   - 定期审查和更新 Secrets
   - 使用环境特定的 Secrets（如：开发、生产）

## 配置检查清单

- [ ] `PRIVATE_REGISTRY` 已设置（或留空使用 GHCR）
- [ ] `PRIVATE_REGISTRY_USERNAME` 已设置（如需要）
- [ ] `PRIVATE_REGISTRY_PASSWORD` 已设置（如需要）
- [ ] `K8S_SERVER` 已设置（如需要自动部署）
- [ ] `K8S_CA_CERT` 已设置（如需要自动部署）
- [ ] `K8S_TOKEN` 已设置（如需要自动部署）
- [ ] `K8S_NAMESPACE` 已设置（可选，默认：btc-shopflow）
- [ ] 已测试镜像仓库连接
- [ ] 已测试 K8s 连接（如需要）

---

**相关文档**：
- [K8s 增量部署指南](./k8s-incremental-deployment.md)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
