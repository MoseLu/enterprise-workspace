# BTC ShopFlow Kubernetes 部署指南

本目录包含了 BTC ShopFlow 微前端项目的完整 Kubernetes 部署配置。

## 📁 文件结构

```
k8s/
├── README.md                    # 本文档
├── deploy.sh                    # 部署脚本
├── namespace.yaml               # 命名空间配置
├── configmap.yaml              # 配置映射
├── ingress.yaml                # Ingress 路由配置
├── hpa.yaml                    # 水平自动扩展配置
└── deployments/                # 应用部署配置
    ├── system-app.yaml         # 系统应用
    ├── admin-app.yaml          # 管理应用
    ├── logistics-app.yaml      # 物流应用
    └── all-apps.yaml           # 其他应用
```

## 🚀 快速开始

### 前提条件

1. **Kubernetes 集群**: 确保有可用的 K8s 集群
2. **kubectl**: 已配置并能连接到集群
3. **Docker 镜像**: 确保所有应用镜像已构建并推送到镜像仓库
4. **Ingress Controller**: 集群中已安装 Nginx Ingress Controller
5. **私有镜像仓库**: 已搭建并配置（推荐用于增量部署）

### 增量构建和部署（推荐）

**增量构建和部署**是推荐的部署方式，实现"修改代码仅增量构建、修改应用仅增量部署"的极简更新流程。

#### 1. 设置私有镜像仓库

```bash
# 在云服务器上执行（首次设置）
bash scripts/setup-private-registry.sh

# 配置本地 Docker 允许访问私有仓库
# 编辑 /etc/docker/daemon.json（Linux）或 Docker Desktop 设置（Windows/Mac）
# 添加：{ "insecure-registries": ["<云服务器IP>:5000"] }
# 然后重启 Docker
```

#### 2. 增量构建和部署

```bash
# 增量构建和部署（仅变更的应用）
pnpm build-deploy:k8s --registry <云服务器IP>:5000

# 全量构建和部署（所有应用）
pnpm build-deploy:k8s:all --registry <云服务器IP>:5000

# 仅构建（不部署）
pnpm build:k8s --registry <云服务器IP>:5000

# 仅部署（不构建）
pnpm deploy:k8s --registry <云服务器IP>:5000 --apps system-app,admin-app
```

详细说明请参考：[增量部署文档](docs/K8S_INCREMENTAL_DEPLOYMENT.md)

### 传统部署方式

#### 方式一：使用部署脚本

```bash
# 部署到开发环境
./deploy.sh dev deploy

# 部署到生产环境
./deploy.sh prod deploy

# 查看部署状态
./deploy.sh dev status

# 删除部署
./deploy.sh dev delete
```

#### 方式二：手动部署

```bash
# 1. 创建命名空间
kubectl apply -f namespace.yaml

# 2. 应用配置
kubectl apply -f configmap.yaml -n btc-shopflow

# 3. 部署应用
kubectl apply -f deployments/ -n btc-shopflow

# 4. 配置路由
kubectl apply -f ingress.yaml -n btc-shopflow

# 5. 启用自动扩展
kubectl apply -f hpa.yaml -n btc-shopflow
```

## 🔧 配置说明

### 应用架构

项目采用微前端架构，包含以下应用：

| 应用名称 | 端口 | 域名 | 描述 |
|---------|------|------|------|
| system-app | 8080 | bellis.com.cn | 系统主应用 |
| admin-app | 8081 | admin.bellis.com.cn | 管理应用 |
| logistics-app | 8082 | logistics.bellis.com.cn | 物流应用 |
| quality-app | 8083 | quality.bellis.com.cn | 质量应用 |
| production-app | 8084 | production.bellis.com.cn | 生产应用 |
| engineering-app | 8085 | engineering.bellis.com.cn | 工程应用 |
| finance-app | 8086 | finance.bellis.com.cn | 财务应用 |
| docs-app | 8087 | docs.bellis.com.cn | 文档站点 |
| mobile-app | 8091 | mobile.bellis.com.cn | 移动应用 |

### 资源配置

#### 核心应用（system, admin, logistics）
- **副本数**: 2
- **CPU请求**: 50m，限制: 200m
- **内存请求**: 64Mi，限制: 256Mi
- **自动扩展**: 2-10 个副本

#### 其他应用
- **副本数**: 1
- **CPU请求**: 25m，限制: 100m
- **内存请求**: 32Mi，限制: 128Mi

### 网络配置

#### Ingress 路由策略

1. **子域名路由**（推荐）:
   - `bellis.com.cn` → system-app
   - `admin.bellis.com.cn` → admin-app
   - `logistics.bellis.com.cn` → logistics-app

2. **路径路由**（备选）:
   - `/` → system-app
   - `/admin` → admin-app
   - `/logistics` → logistics-app

## 🔍 监控和调试

### 查看部署状态

```bash
# 查看所有 Pod
kubectl get pods -n btc-shopflow

# 查看服务
kubectl get services -n btc-shopflow

# 查看 Ingress
kubectl get ingress -n btc-shopflow

# 查看自动扩展状态
kubectl get hpa -n btc-shopflow
```

### 查看日志

```bash
# 查看特定应用日志
kubectl logs -f deployment/btc-system-app -n btc-shopflow

# 查看所有应用日志
kubectl logs -f -l component=frontend -n btc-shopflow
```

### 调试 Pod

```bash
# 进入 Pod 调试
kubectl exec -it deployment/btc-system-app -n btc-shopflow -- /bin/sh

# 查看 Pod 详情
kubectl describe pod <pod-name> -n btc-shopflow
```

## 🔐 安全配置

### TLS 证书

```bash
# 创建 TLS Secret（使用 Let's Encrypt 或自签名证书）
kubectl create secret tls bellis-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  -n btc-shopflow
```

### 网络策略

```yaml
# 示例：限制 Pod 间通信
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: btc-shopflow-netpol
  namespace: btc-shopflow
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
```

## 📈 扩展和优化

### 自动扩展

项目已配置 HPA（水平自动扩展）：
- **CPU 阈值**: 70%
- **内存阈值**: 80%
- **扩展策略**: 渐进式扩展，避免抖动

### 资源优化

```bash
# 查看资源使用情况
kubectl top pods -n btc-shopflow
kubectl top nodes

# 调整资源限制（编辑部署）
kubectl edit deployment btc-system-app -n btc-shopflow
```

### 存储配置

如需持久化存储：

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: btc-shopflow-storage
  namespace: btc-shopflow
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

## 🚨 故障排除

### 常见问题

1. **镜像拉取失败**
   ```bash
   # 检查镜像是否存在
   docker pull btc-shopflow/system-app:latest
   
   # 配置镜像拉取密钥
   kubectl create secret docker-registry regcred \
     --docker-server=<registry-url> \
     --docker-username=<username> \
     --docker-password=<password>
   ```

2. **Pod 启动失败**
   ```bash
   # 查看 Pod 事件
   kubectl describe pod <pod-name> -n btc-shopflow
   
   # 查看容器日志
   kubectl logs <pod-name> -n btc-shopflow
   ```

3. **Ingress 无法访问**
   ```bash
   # 检查 Ingress Controller
   kubectl get pods -n ingress-nginx
   
   # 检查 DNS 解析
   nslookup bellis.com.cn
   ```

### 回滚部署

```bash
# 查看部署历史
kubectl rollout history deployment/btc-system-app -n btc-shopflow

# 回滚到上一版本
kubectl rollout undo deployment/btc-system-app -n btc-shopflow

# 回滚到指定版本
kubectl rollout undo deployment/btc-system-app --to-revision=2 -n btc-shopflow
```

## 📞 支持

如遇问题，请联系：
- 项目维护者: BTC IT Team
- 邮箱: mlu@bellis-technology.cn
- 项目地址: https://github.com/BellisGit/btc-shopflow-monorepo

---

**注意**: 请根据实际环境调整配置参数，确保安全性和性能要求。
