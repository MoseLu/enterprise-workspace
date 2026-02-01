# Jenkins Docker 部署指南

## 概述

本指南介绍如何使用 Jenkins 通过 Docker 方式部署应用。与静态文件部署不同，Docker 部署会将应用打包成 Docker 镜像，然后在服务器上使用 Docker Compose 运行容器。

## 两种部署方式对比

### 静态文件部署（当前方案）

```
Jenkins 构建
    ↓
生成静态文件 (dist/)
    ↓
SSH 上传到服务器
    ↓
部署到 /www/wwwroot/bellis.com.cn/releases/xxx/
    ↓
Nginx 直接提供静态文件
```

**优点：**
- ✅ 性能最优（Nginx 直接提供静态文件）
- ✅ 部署简单快速
- ✅ 资源占用最小
- ✅ 运维简单

**缺点：**
- ❌ 需要服务器配置 Nginx
- ❌ 版本管理需要手动处理

### Docker 部署（可选方案）

```
Jenkins 构建
    ↓
生成静态文件 (dist/)
    ↓
构建 Docker 镜像
    ↓
保存镜像为 tar.gz
    ↓
SSH 上传到服务器
    ↓
在服务器上加载镜像
    ↓
docker-compose up -d 启动容器
    ↓
Nginx 反向代理到容器端口
```

**优点：**
- ✅ 环境隔离
- ✅ 版本管理（镜像版本化）
- ✅ 一致性（开发、测试、生产环境一致）
- ✅ 易于扩展（水平扩展）

**缺点：**
- ❌ 性能略低（有容器开销）
- ❌ 资源占用更大
- ❌ 部署时间更长
- ❌ 需要 Docker 环境

## 前提条件

### 1. Jenkins 服务器需要

- ✅ Docker 已安装
- ✅ 有足够的磁盘空间（构建镜像需要空间）
- ✅ SSH 访问部署服务器的权限

**⚠️ 重要：如果 Jenkins 运行在 Docker 容器中，需要额外配置：**

#### 在 Jenkins 容器中配置 Docker 支持

如果 Jenkins 运行在 Docker 容器中（最常见的情况），需要进行以下配置：

**方法 1：挂载 Docker socket 并安装 Docker CLI（推荐）**

1. **挂载 Docker socket**：在启动 Jenkins 容器时添加以下参数：
   ```bash
   -v /var/run/docker.sock:/var/run/docker.sock
   ```

2. **安装 Docker CLI**：进入容器安装 Docker CLI
   ```bash
   docker exec -u root jenkins bash -c 'apt-get update && apt-get install -y docker.io'
   ```

3. **完整启动命令示例**：

   **Linux/Mac (bash)**:
   ```bash
   docker run -d \
     -p 9000:8080 \
     -p 50000:50000 \
     -v jenkins_home:/var/jenkins_home \
     -v /var/run/docker.sock:/var/run/docker.sock \
     --name jenkins \
     jenkins/jenkins:lts
   
   # 然后安装 Docker CLI
   docker exec -u root jenkins bash -c 'apt-get update && apt-get install -y docker.io'
   ```

   **Windows PowerShell（推荐使用一行命令）**:
   ```powershell
   docker run -d -p 9000:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home -v /var/run/docker.sock:/var/run/docker.sock --name jenkins jenkins/jenkins:lts
   ```
   
   ⚠️ **注意**：如果容器 `jenkins` 已存在，需要先删除：
   ```powershell
   docker rm jenkins
   ```
   
   然后安装 Docker CLI 和 Node.js：
   ```powershell
   # 安装 Docker CLI
   docker exec -u root jenkins bash -c 'apt-get update && apt-get install -y docker.io'
   
   # 安装 Node.js 20
   docker exec -u root jenkins bash -c 'curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs'
   ```
   
   验证安装：
   ```powershell
   # 验证 Docker
   docker exec jenkins docker --version
   
   # 验证 Node.js
   docker exec jenkins node --version
   ```

**方法 2：使用包含 Docker 的 Jenkins 镜像**

使用自定义 Dockerfile 创建包含 Docker CLI 的 Jenkins 镜像：

```dockerfile
FROM jenkins/jenkins:lts
USER root
RUN apt-get update && \
    apt-get install -y docker.io && \
    usermod -aG docker jenkins
USER jenkins
```

**方法 3：使用 Docker-in-Docker (DinD)**

如果需要完全隔离的 Docker 环境，可以使用 DinD：

```bash
docker run -d \
  -p 9000:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  --privileged \
  docker:dind \
  jenkins/jenkins:lts
```

⚠️ **注意**：DinD 需要 `--privileged` 模式，安全性较低，不推荐用于生产环境。

### 2. 部署服务器需要

- ✅ Docker 已安装
- ✅ Docker Compose 已安装（或 Docker v2 的 `docker compose` 命令）
- ✅ 有足够的磁盘空间和内存

### 3. 检查 Docker 环境

在 Jenkins 服务器上检查：

```bash
# 检查 Docker
docker --version

# 检查 Docker 是否运行
docker ps
```

**如果 Jenkins 在容器中运行，检查容器内的 Docker：**

```bash
# 进入容器检查
docker exec jenkins docker --version

# 检查 Docker socket 是否挂载
docker exec jenkins ls -l /var/run/docker.sock
```

在部署服务器上检查：

```bash
# 检查 Docker
docker --version

# 检查 Docker Compose（v1）
docker-compose --version

# 或检查 Docker Compose（v2）
docker compose version
```

## 创建 Jenkins Job

### 方法 1：使用 Jenkins Web UI

1. **创建新的 Pipeline Job**
   - 登录 Jenkins
   - 点击 "新建 Item"
   - 输入 Job 名称：`btc-shopflow-deploy-system-app-docker`
   - 选择 "Pipeline"
   - 点击 "OK"

2. **配置 Pipeline**
   - 在 "Pipeline" 部分，选择 "Pipeline script from SCM"
   - **SCM**: 选择 "Git"
   - **Repository URL**: 输入你的 Git 仓库地址
   - **Branches to build**: 输入分支（如 `*/develop`）
   - **Script Path**: 输入 `jenkins/Jenkinsfile.main-app.docker`
   - 点击 "Save"

### 方法 2：修改现有 Job

如果您已经有静态部署的 Job，可以：

1. 复制现有 Job
2. 修改 Script Path 为 `jenkins/Jenkinsfile.main-app.docker`
3. 保存

## 构建参数说明

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `SERVER_HOST` | String | `47.112.31.96` | 部署服务器地址 |
| `SERVER_USER` | String | `root` | SSH 用户名 |
| `SERVER_PORT` | String | `22` | SSH 端口 |
| `SSH_KEY_PATH` | String | `/var/jenkins_home/.ssh/id_rsa` | SSH 私钥路径 |
| `REMOTE_PATH` | String | `/www/wwwroot/btc-shopflow-monorepo` | 服务器上的项目路径 |
| `SKIP_TESTS` | Boolean | `true` | 是否跳过测试 |
| `CLEAN_BUILD` | Boolean | `false` | 是否清理构建缓存 |
| `BUILD_SHARED_DEPS` | Boolean | `true` | 是否构建共享依赖包 |

## 部署流程

Jenkins Pipeline 会执行以下步骤：

1. **Checkout**: 检出代码
2. **Setup Environment**: 检查 Node.js、pnpm、Docker 环境
3. **Install Dependencies**: 安装项目依赖
4. **Build Shared Dependencies**: 构建共享依赖包（可选）
5. **Build Application**: 构建应用（生成 dist/）
6. **Build Docker Image**: 构建 Docker 镜像
7. **Save Docker Image**: 将镜像保存为 tar.gz 文件
8. **Upload to Server**: 上传镜像文件到服务器
9. **Deploy on Server**: 在服务器上加载镜像并启动容器
10. **Cleanup**: 清理临时文件

## 服务器配置

### Nginx 反向代理配置

如果使用 Docker 部署，需要在 Nginx 中配置反向代理：

```nginx
server {
    listen 80;
    server_name bellis.com.cn;
    
    location / {
        proxy_pass http://localhost:30080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Docker Compose 配置

部署脚本会在服务器上自动创建 `docker-compose.prod.yml`：

```yaml
version: '3.8'

services:
  system-app:
    image: btc-shopflow/system-app:latest
    container_name: btc-system-app
    ports:
      - "30080:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    networks:
      - btc-network

networks:
  btc-network:
    driver: bridge
```

## 访问地址

部署成功后，应用可以通过以下地址访问：

- **直接访问容器端口**: `http://服务器IP:30080`
- **通过 Nginx 反向代理**: `http://bellis.com.cn`（需要配置 Nginx）

## 常见问题

### Q1: Docker 镜像构建失败

**可能原因：**
- Dockerfile 路径不正确
- 构建上下文不正确
- 缺少必要的文件

**解决方法：**
- 检查 `apps/${APP_NAME}/Dockerfile` 是否存在
- 检查构建上下文是否正确
- 查看构建日志

### Q2: SSH 上传镜像失败

**可能原因：**
- SSH 密钥配置不正确
- 服务器磁盘空间不足
- 网络问题

**解决方法：**
- 检查 SSH 密钥权限（600）
- 检查服务器磁盘空间：`df -h`
- 检查网络连接

### Q3: 容器启动失败

**可能原因：**
- 端口被占用
- Docker Compose 配置错误
- 镜像加载失败

**解决方法：**
- 检查端口占用：`netstat -tlnp | grep 30080`
- 检查容器日志：`docker logs btc-system-app`
- 手动加载镜像：`docker load < tmp/docker-images/system-app.tar.gz`

### Q4: 性能问题

**Docker 部署的性能会比静态部署略低：**

- 容器有额外的运行时开销
- 如果使用 Nginx 反向代理，会有额外的网络跳转

**优化建议：**
- 使用静态部署（当前方案）获得最佳性能
- 如果必须使用 Docker，可以考虑直接在容器内配置 Nginx 而不是反向代理

## 回滚方案

### 方法 1：使用镜像版本

修改 Jenkinsfile，使用版本标签而不是 `latest`：

```groovy
DOCKER_IMAGE = "btc-shopflow/${APP_NAME}:${env.BUILD_NUMBER}"
```

这样每个构建都有唯一的镜像版本，可以快速回滚。

### 方法 2：手动回滚

在服务器上执行：

```bash
# 停止当前容器
docker-compose -f docker-compose.prod.yml down

# 加载旧版本镜像（如果有备份）
docker load < old-image.tar.gz

# 修改 docker-compose.prod.yml 使用旧镜像
# 然后重新启动
docker-compose -f docker-compose.prod.yml up -d
```

## 建议

### ✅ **继续使用静态部署**

对于您当前的前端应用，**静态文件部署方案仍然是最优选择**：

1. **性能更好**：Nginx 直接提供静态文件，无容器开销
2. **部署更快**：不需要构建和传输镜像
3. **运维更简单**：不需要管理容器
4. **资源占用更少**：不需要 Docker 运行时

### ⚠️ **何时考虑 Docker 部署**

以下情况可以考虑 Docker 部署：

- 需要环境隔离（不同应用需要不同运行时环境）
- 需要水平扩展（单个应用需要多个实例）
- 计划迁移到 Kubernetes
- 多环境一致性要求高
- 团队 Docker 经验丰富

## 总结

Jenkins 完全支持通过 Docker 部署应用，项目中已经提供了 `Jenkinsfile.main-app.docker` 作为示例。但**对于前端静态应用，静态文件部署方案仍然更优**。您可以根据实际需求选择合适的部署方式。
