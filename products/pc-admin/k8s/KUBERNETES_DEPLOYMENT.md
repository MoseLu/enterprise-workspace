# 🚀 BTC ShopFlow Kubernetes 部署完整方案

## 📋 项目概述

BTC ShopFlow 是一个基于微前端架构的企业级供应链管理系统，现已完成 Kubernetes 部署方案设计。本文档提供完整的部署指南和最佳实践。

## 🏗️ 架构设计

### 微前端应用架构
```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes 集群                          │
├─────────────────────────────────────────────────────────────┤
│  Ingress Controller (Nginx)                                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ system-app  │ │ admin-app   │ │logistics-app│   ...    │
│  │ (主应用)     │ │ (管理应用)   │ │ (物流应用)   │          │
│  │ Port: 8080  │ │ Port: 8081  │ │ Port: 8082  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### 应用清单
| 应用 | 端口 | 域名 | 副本数 | 自动扩展 |
|------|------|------|--------|----------|
| system-app | 8080 | bellis.com.cn | 2 | 2-10 |
| admin-app | 8081 | admin.bellis.com.cn | 2 | 2-8 |
| logistics-app | 8082 | logistics.bellis.com.cn | 2 | 2-6 |
| quality-app | 8083 | quality.bellis.com.cn | 1 | 否 |
| production-app | 8084 | production.bellis.com.cn | 1 | 否 |
| engineering-app | 8085 | engineering.bellis.com.cn | 1 | 否 |
| finance-app | 8086 | finance.bellis.com.cn | 1 | 否 |
| docs-app | 8087 | docs.bellis.com.cn | 1 | 否 |
| mobile-app | 8091 | mobile.bellis.com.cn | 1 | 否 |

## 📁 部署文件结构

```
k8s/
├── README.md                    # 详细部署指南
├── deploy.sh                    # 一键部署脚本
├── namespace.yaml               # 命名空间配置
├── configmap.yaml              # 应用配置
├── ingress.yaml                # 路由配置
├── hpa.yaml                    # 自动扩展配置
├── deployments/                # 应用部署配置
│   ├── system-app.yaml         # 系统应用
│   ├── admin-app.yaml          # 管理应用
│   ├── logistics-app.yaml      # 物流应用
│   └── all-apps.yaml           # 其他应用
├── helm/                       # Helm Chart
│   ├── Chart.yaml
│   └── values.yaml
├── ci-cd/                      # CI/CD 配置
│   └── github-actions.yml
└── monitoring/                 # 监控配置
    └── prometheus.yaml
```

## 🚀 快速部署

### 方式一：使用部署脚本（推荐）

```bash
# 进入 K8s 目录
cd btc-shopflow-monorepo/k8s

# 部署到生产环境
./deploy.sh prod deploy

# 查看部署状态
./deploy.sh prod status

# 部署到开发环境
./deploy.sh dev deploy
```

### 方式二：使用 Helm（推荐生产环境）

```bash
# 安装 Helm Chart
helm install btc-shopflow ./helm -n btc-shopflow --create-namespace

# 升级部署
helm upgrade btc-shopflow ./helm -n btc-shopflow

# 卸载
helm uninstall btc-shopflow -n btc-shopflow
```

### 方式三：手动部署

```bash
# 应用所有配置
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml -n btc-shopflow
kubectl apply -f deployments/ -n btc-shopflow
kubectl apply -f ingress.yaml -n btc-shopflow
kubectl apply -f hpa.yaml -n btc-shopflow
```

## 🔧 配置详解

### 1. 资源配置

#### 核心应用（高优先级）
- **CPU**: 请求 50m，限制 200m
- **内存**: 请求 64Mi，限制 256Mi
- **副本数**: 2（支持自动扩展到 10）

#### 辅助应用（标准配置）
- **CPU**: 请求 25m，限制 100m
- **内存**: 请求 32Mi，限制 128Mi
- **副本数**: 1

### 2. 网络配置

#### Ingress 路由策略
```yaml
# 子域名路由（推荐）
bellis.com.cn → system-app
admin.bellis.com.cn → admin-app
logistics.bellis.com.cn → logistics-app

# 路径路由（备选）
bellis.com.cn/ → system-app
bellis.com.cn/admin → admin-app
bellis.com.cn/logistics → logistics-app
```

#### 安全配置
- **TLS 加密**: 支持 Let's Encrypt 自动证书
- **CORS 配置**: 允许跨域访问
- **安全头**: 包含 XSS、CSRF 防护

### 3. 自动扩展配置

```yaml
# HPA 配置
CPU 阈值: 70%
内存阈值: 80%
扩展策略: 渐进式扩展
最小副本: 2
最大副本: 2-10（根据应用重要性）
```

## 📊 监控和告警

### Prometheus 监控指标
- **应用状态**: Pod 健康状态
- **资源使用**: CPU、内存、网络
- **性能指标**: 响应时间、错误率
- **业务指标**: 用户访问量、功能使用情况

### Grafana 仪表板
- **系统概览**: 集群整体状态
- **应用详情**: 单个应用性能
- **资源趋势**: 历史使用情况
- **告警面板**: 实时告警信息

### 告警规则
- **应用下线**: 1分钟内响应
- **高CPU使用**: 80% 持续 5分钟
- **高内存使用**: 90% 持续 5分钟
- **Pod重启**: 频繁重启告警

## 🔄 CI/CD 集成

### GitHub Actions 工作流

```yaml
触发条件:
- Push to main/develop: 自动部署到生产环境
- Pull Request: 部署到开发环境进行测试

部署流程:
1. 代码检出
2. 构建 Docker 镜像
3. 推送到镜像仓库
4. 更新 K8s 部署
5. 验证部署结果
```

### 部署策略
- **滚动更新**: 零停机部署
- **蓝绿部署**: 快速回滚能力
- **金丝雀发布**: 渐进式发布

## 🛡️ 安全最佳实践

### 1. 镜像安全
```bash
# 使用非 root 用户
USER 101

# 最小化镜像
FROM nginx:alpine

# 安全扫描
docker scan btc-shopflow/system-app:latest
```

### 2. 网络安全
```yaml
# 网络策略
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: btc-shopflow-netpol
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

### 3. 访问控制
```yaml
# RBAC 配置
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: btc-shopflow-role
rules:
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list", "watch"]
```

## 🔍 故障排除

### 常见问题及解决方案

#### 1. Pod 启动失败
```bash
# 查看 Pod 状态
kubectl describe pod <pod-name> -n btc-shopflow

# 查看日志
kubectl logs <pod-name> -n btc-shopflow

# 常见原因：
- 镜像拉取失败
- 资源不足
- 配置错误
```

#### 2. 服务无法访问
```bash
# 检查服务
kubectl get svc -n btc-shopflow

# 检查端点
kubectl get endpoints -n btc-shopflow

# 检查 Ingress
kubectl describe ingress btc-shopflow-ingress -n btc-shopflow
```

#### 3. 性能问题
```bash
# 查看资源使用
kubectl top pods -n btc-shopflow
kubectl top nodes

# 调整资源限制
kubectl edit deployment btc-system-app -n btc-shopflow
```

## 📈 性能优化

### 1. 资源优化
- **CPU 限制**: 根据实际使用情况调整
- **内存限制**: 避免 OOM 杀死
- **存储优化**: 使用 SSD 存储类

### 2. 网络优化
- **CDN 集成**: 静态资源加速
- **负载均衡**: 多副本分布
- **缓存策略**: Redis 集群

### 3. 扩展策略
- **水平扩展**: 增加副本数
- **垂直扩展**: 增加资源配置
- **集群扩展**: 增加节点数量

## 🎯 生产环境建议

### 1. 高可用配置
```yaml
# Pod 反亲和性
podAntiAffinity:
  requiredDuringSchedulingIgnoredDuringExecution:
  - labelSelector:
      matchLabels:
        app: btc-system-app
    topologyKey: kubernetes.io/hostname
```

### 2. 备份策略
```bash
# 定期备份配置
kubectl get all -n btc-shopflow -o yaml > backup-$(date +%Y%m%d).yaml

# 备份持久化数据
velero backup create btc-shopflow-backup --include-namespaces btc-shopflow
```

### 3. 灾难恢复
- **多区域部署**: 跨可用区分布
- **数据备份**: 定期备份关键数据
- **恢复演练**: 定期进行恢复测试

## 📞 技术支持

### 联系方式
- **项目维护者**: BTC IT Team
- **邮箱**: mlu@bellis-technology.cn
- **项目地址**: https://github.com/BellisGit/btc-shopflow-monorepo

### 文档资源
- **K8s 官方文档**: https://kubernetes.io/docs/
- **Helm 文档**: https://helm.sh/docs/
- **Nginx Ingress**: https://kubernetes.github.io/ingress-nginx/

---

## ✅ 部署检查清单

### 部署前检查
- [ ] Kubernetes 集群可用
- [ ] kubectl 配置正确
- [ ] Docker 镜像已构建并推送
- [ ] 域名 DNS 配置完成
- [ ] TLS 证书准备就绪

### 部署后验证
- [ ] 所有 Pod 运行正常
- [ ] 服务可以正常访问
- [ ] Ingress 路由工作正常
- [ ] 自动扩展配置生效
- [ ] 监控告警正常工作

### 生产环境额外检查
- [ ] 备份策略已配置
- [ ] 安全策略已应用
- [ ] 性能监控已启用
- [ ] 日志收集已配置
- [ ] 灾难恢复计划已制定

---

## 🏢 宝塔面板部署指南

### 前置条件
- 已安装宝塔面板 7.x 或更高版本
- 服务器配置：4核8G内存，100G硬盘以上
- 已安装 Docker 和 Docker Compose
- 已配置域名解析

### 1. 环境准备

#### 1.1 安装 Docker
```bash
# 在宝塔面板终端中执行
curl -fsSL https://get.docker.com | bash -s docker
systemctl start docker
systemctl enable docker

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### 1.2 安装 Kubernetes (K3s)
```bash
# 安装 K3s (轻量级 Kubernetes)
curl -sfL https://get.k3s.io | sh -

# 配置 kubectl
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config

# 验证安装
kubectl get nodes
```

### 2. 项目部署

#### 2.1 克隆项目
```bash
# 在宝塔面板文件管理器中，或通过终端
cd /www/wwwroot
git clone https://github.com/BellisGit/btc-shopflow-monorepo.git
cd btc-shopflow-monorepo
```

#### 2.2 构建 Docker 镜像
```bash
# 构建所有应用镜像
./scripts/build-all.sh

# 或单独构建
docker build -t btc-shopflow/system-app:latest -f apps/system-app/Dockerfile .
docker build -t btc-shopflow/admin-app:latest -f apps/admin-app/Dockerfile .
docker build -t btc-shopflow/finance-app:latest -f apps/finance-app/Dockerfile .
```

#### 2.3 部署到 Kubernetes
```bash
# 进入 k8s 目录
cd k8s

# 执行一键部署脚本
chmod +x deploy.sh
./deploy.sh

# 或手动部署
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f deployments/
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
```

### 3. 宝塔面板配置

#### 3.1 反向代理配置
在宝塔面板中配置反向代理：

1. **添加站点**
   - 域名：`bellis.com.cn`
   - 根目录：`/www/wwwroot/btc-shopflow-monorepo`

2. **配置反向代理**
   ```nginx
   # 主应用
   location / {
       proxy_pass http://127.0.0.1:30080;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
   }
   
   # 管理应用
   location /admin {
       proxy_pass http://127.0.0.1:30081;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
   }
   
   # 财务应用
   location /finance {
       proxy_pass http://127.0.0.1:30086;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```

#### 3.2 SSL 证书配置
1. 在宝塔面板中申请 Let's Encrypt 证书
2. 或上传自有证书
3. 强制 HTTPS 访问

#### 3.3 防火墙配置
开放必要端口：
- 80 (HTTP)
- 443 (HTTPS)
- 30080-30091 (K8s NodePort)

### 4. 监控和维护

#### 4.1 宝塔面板监控
- 启用系统监控
- 配置资源告警
- 设置自动备份

#### 4.2 应用健康检查
```bash
# 检查 Pod 状态
kubectl get pods -n btc-shopflow

# 查看应用日志
kubectl logs -f deployment/btc-system-app -n btc-shopflow

# 检查服务状态
kubectl get svc -n btc-shopflow
```

#### 4.3 自动化脚本
创建维护脚本 `/www/server/panel/script/btc-maintenance.sh`：
```bash
#!/bin/bash
# BTC ShopFlow 维护脚本

# 检查应用状态
echo "=== 检查应用状态 ==="
kubectl get pods -n btc-shopflow

# 重启异常应用
echo "=== 重启异常应用 ==="
kubectl rollout restart deployment -n btc-shopflow

# 清理未使用的镜像
echo "=== 清理 Docker 镜像 ==="
docker system prune -f

echo "=== 维护完成 ==="
```

### 5. 故障排除

#### 5.1 常见问题
1. **Pod 启动失败**
   ```bash
   kubectl describe pod <pod-name> -n btc-shopflow
   kubectl logs <pod-name> -n btc-shopflow
   ```

2. **服务无法访问**
   ```bash
   kubectl get svc -n btc-shopflow
   kubectl get ingress -n btc-shopflow
   ```

3. **资源不足**
   ```bash
   kubectl top nodes
   kubectl top pods -n btc-shopflow
   ```

#### 5.2 性能优化
- 调整 Pod 资源限制
- 配置 HPA 自动扩展
- 优化 Nginx 配置
- 启用 CDN 加速

### 6. 备份和恢复

#### 6.1 数据备份
```bash
# 备份 Kubernetes 配置
kubectl get all -n btc-shopflow -o yaml > /www/backup/k8s-backup-$(date +%Y%m%d).yaml

# 备份应用数据
tar -czf /www/backup/btc-shopflow-$(date +%Y%m%d).tar.gz /www/wwwroot/btc-shopflow-monorepo
```

#### 6.2 自动备份
在宝塔面板计划任务中添加：
```bash
# 每日凌晨 2 点备份
0 2 * * * /www/server/panel/script/btc-backup.sh
```

### 7. 升级部署

#### 7.1 滚动更新
```bash
# 更新代码
cd /www/wwwroot/btc-shopflow-monorepo
git pull origin develop

# 重新构建镜像
./scripts/build-all.sh

# 滚动更新
kubectl rollout restart deployment -n btc-shopflow
```

#### 7.2 版本回滚
```bash
# 查看部署历史
kubectl rollout history deployment/btc-system-app -n btc-shopflow

# 回滚到上一版本
kubectl rollout undo deployment/btc-system-app -n btc-shopflow
```

---

## 📱 宝塔面板快速部署总结

### 一键部署命令
```bash
# 1. 安装环境
curl -fsSL https://get.docker.com | bash -s docker
curl -sfL https://get.k3s.io | sh -

# 2. 部署项目
cd /www/wwwroot
git clone https://github.com/BellisGit/btc-shopflow-monorepo.git
cd btc-shopflow-monorepo/k8s
chmod +x deploy.sh && ./deploy.sh

# 3. 配置反向代理（在宝塔面板中操作）
# 4. 申请 SSL 证书（在宝塔面板中操作）
```

### 访问地址
- 主应用：https://bellis.com.cn
- 管理后台：https://bellis.com.cn/admin
- 财务系统：https://bellis.com.cn/finance

---

🎉 **恭喜！您的 BTC ShopFlow 项目现已完全支持 Kubernetes 部署！**

这套完整的 K8s 部署方案包含了从基础部署到生产级优化的所有配置，支持自动扩展、监控告警、CI/CD 集成等企业级功能，并特别针对宝塔面板用户提供了详细的部署指南。
