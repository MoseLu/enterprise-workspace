# 🌐 BTC ShopFlow 域名配置说明

## 📋 域名规划

基于泛域名 `*.bellis.com.cn`，各应用的域名分配如下：

### 🎯 主要应用域名

| 应用名称 | 子域名 | 完整域名 | 端口 | 描述 |
|---------|--------|----------|------|------|
| 系统主应用 | - | `bellis.com.cn` | 8080 | 微前端主容器应用 |
| 管理应用 | admin | `admin.bellis.com.cn` | 8081 | 系统管理后台 |
| 物流应用 | logistics | `logistics.bellis.com.cn` | 8082 | 物流管理模块 |
| 质量应用 | quality | `quality.bellis.com.cn` | 8083 | 质量控制模块 |
| 生产应用 | production | `production.bellis.com.cn` | 8084 | 生产管理模块 |
| 工程应用 | engineering | `engineering.bellis.com.cn` | 8085 | 工程设计模块 |
| 财务应用 | finance | `finance.bellis.com.cn` | 8086 | 财务管理模块 |
| 文档站点 | docs | `docs.bellis.com.cn` | 8087 | 项目文档站点 |
| 移动应用 | mobile | `mobile.bellis.com.cn` | 8091 | 移动端应用 |

### 🔗 API 服务域名

| 服务类型 | 域名 | 描述 |
|---------|------|------|
| API 服务 | `api.bellis.com.cn` | 后端 API 接口 |
| 静态资源 | `static.bellis.com.cn` | 静态资源 CDN（可选） |
| 文件服务 | `files.bellis.com.cn` | 文件上传下载服务（可选） |

## 🛠️ DNS 配置要求

### 1. 泛域名证书
确保您的 SSL 证书支持泛域名 `*.bellis.com.cn`

### 2. DNS 记录配置
```bash
# A 记录 - 指向 Kubernetes Ingress Controller 的外部 IP
bellis.com.cn.          IN  A       <INGRESS_EXTERNAL_IP>
*.bellis.com.cn.        IN  A       <INGRESS_EXTERNAL_IP>

# 或者使用 CNAME 记录指向负载均衡器
bellis.com.cn.          IN  CNAME   <LOAD_BALANCER_DOMAIN>
*.bellis.com.cn.        IN  CNAME   <LOAD_BALANCER_DOMAIN>
```

### 3. TLS 证书配置
```bash
# 创建 TLS Secret
kubectl create secret tls bellis-tls \
  --cert=bellis.com.cn.crt \
  --key=bellis.com.cn.key \
  -n btc-shopflow

# 或使用 cert-manager 自动获取 Let's Encrypt 证书
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: bellis-wildcard-cert
  namespace: btc-shopflow
spec:
  secretName: bellis-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - "*.bellis.com.cn"
  - "bellis.com.cn"
```

## 🔧 Kubernetes 配置更新

### 已更新的配置文件

1. **ConfigMap** (`k8s/configmap.yaml`)
   - `API_BASE_URL`: `https://api.bellis.com.cn`
   - `QIANKUN_BASE_URL`: `https://btc-shopflow.bellis.com.cn`

2. **Ingress** (`k8s/ingress.yaml`)
   - 所有 host 规则更新为 `*.bellis.com.cn`
   - TLS 证书名称更新为 `bellis-tls`

3. **Helm Values** (`k8s/helm/values.yaml`)
   - 所有域名配置更新
   - TLS 配置更新

## 🚀 部署后验证

### 1. DNS 解析验证
```bash
# 验证 DNS 解析
nslookup bellis.com.cn
nslookup admin.bellis.com.cn
nslookup logistics.bellis.com.cn

# 验证所有子域名
for app in admin logistics quality production engineering finance docs mobile; do
  echo "Testing $app.bellis.com.cn"
  nslookup $app.bellis.com.cn
done
```

### 2. SSL 证书验证
```bash
# 检查 SSL 证书
openssl s_client -connect bellis.com.cn:443 -servername bellis.com.cn

# 验证证书有效期
curl -I https://bellis.com.cn
```

### 3. 应用访问验证
```bash
# 验证各应用访问
curl -I https://bellis.com.cn
curl -I https://admin.bellis.com.cn
curl -I https://logistics.bellis.com.cn
# ... 其他应用
```

## 🔒 安全配置

### 1. CORS 配置
已在 Ingress 中配置 CORS 允许跨域访问：
```yaml
nginx.ingress.kubernetes.io/cors-allow-origin: "*"
nginx.ingress.kubernetes.io/enable-cors: "true"
```

### 2. 安全头配置
Nginx 配置中已包含安全头：
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
```

### 3. 强制 HTTPS
```yaml
nginx.ingress.kubernetes.io/ssl-redirect: "true"
nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
```

## 📊 监控和日志

### 域名相关监控指标
- DNS 解析时间
- SSL 证书有效期
- 域名访问量统计
- 各子域名响应时间

### 告警配置
```yaml
# 证书过期告警
- alert: SSLCertificateExpiry
  expr: probe_ssl_earliest_cert_expiry - time() < 86400 * 30
  labels:
    severity: warning
  annotations:
    summary: "SSL 证书即将过期"
    description: "域名 {{ $labels.instance }} 的 SSL 证书将在 30 天内过期"
```

## 🔄 域名迁移计划

如需更改域名，按以下步骤操作：

1. **准备新域名证书**
2. **更新 DNS 记录**
3. **更新 Kubernetes 配置**
4. **滚动更新应用**
5. **验证新域名访问**
6. **更新文档和配置**

## 📞 技术支持

如遇域名配置问题，请联系：
- **项目维护者**: BTC IT Team
- **邮箱**: mlu@bellis-technology.cn
- **域名管理**: 请联系 Bellis 技术团队

---

**注意**: 
- 确保所有子域名都正确解析到 Kubernetes Ingress Controller
- 定期检查 SSL 证书有效期
- 监控各域名的访问状态和性能指标
