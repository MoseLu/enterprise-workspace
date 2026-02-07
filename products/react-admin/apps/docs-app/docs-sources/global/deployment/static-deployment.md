# 静态文件部署指南

## 概述

本方案提供了一种无需 Docker 的快速部署方式，直接将构建好的静态文件部署到宝塔面板服务器。相比 Docker 部署，这种方式：

- ✅ **部署速度快**：无需拉取镜像，直接同步文件
- ✅ **资源占用少**：不需要运行容器
- ✅ **配置简单**：直接使用 Nginx 提供静态文件服务
- ✅ **灵活性强**：支持单应用或批量部署

## 前置要求

1. **服务器环境**
   - 宝塔面板已安装
   - Nginx 已配置并运行
   - 每个应用已创建对应的网站（或使用子域名）

2. **本地环境**
   - Node.js >= 20.19.0
   - pnpm >= 8.0.0
   - rsync 或 scp（推荐 rsync，支持增量同步）
   - SSH 客户端

3. **服务器访问**
   - SSH 密钥已配置
   - 服务器用户有权限访问网站目录

## 配置部署路径

### 1. 创建部署配置文件

复制示例配置文件：

```bash
cp deploy.config.example.json deploy.config.json
```

### 2. 编辑配置文件

编辑 `deploy.config.json`，设置每个应用的部署路径：

```json
{
  "apps": {
    "admin-app": {
      "deployPath": "/www/wwwroot/admin.bellis.com.cn",
      "domain": "admin.bellis.com.cn"
    }
  }
}
```

**注意**：如果不创建配置文件，脚本会使用默认路径（基于应用名称）。

## 使用方法

### 本地部署

#### 部署单个应用

```bash
# 先构建应用
pnpm --filter admin-app build

# 然后部署
pnpm deploy:static:admin

# 或使用脚本直接部署
./scripts/deploy-static.sh --app admin-app
```

#### 部署所有应用

```bash
# 先构建所有应用
pnpm build:all

# 然后批量部署
pnpm deploy:static:all

# 或使用脚本
./scripts/deploy-static.sh --all
```

#### 使用环境变量

```bash
export SERVER_HOST="your-server-ip"
export SERVER_USER="root"
export SERVER_PORT="22"
export SSH_KEY="~/.ssh/id_rsa"

pnpm deploy:static:admin
```

### GitHub Actions 部署

#### 手动触发

1. 进入 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择 "Deploy Static Files" workflow
4. 点击 "Run workflow"
5. 选择要部署的应用（或选择 "all"）
6. 点击 "Run workflow"

#### 通过 API 触发

```bash
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO/dispatches \
  -d '{
    "event_type": "deploy-static",
    "client_payload": {
      "app": "admin-app"
    }
  }'
```

## 部署流程

1. **构建应用**
   - 运行 `pnpm --filter <app> build`
   - 生成 `apps/<app>/dist` 目录

2. **验证构建产物**
   - 检查 `dist` 目录是否存在且不为空

3. **创建备份**
   - 在服务器上备份当前部署的文件
   - 备份路径：`/www/backups/<app>/<timestamp>/`

4. **同步文件**
   - 使用 `rsync` 或 `scp` 同步文件到服务器
   - 排除 `.map` 文件和其他不必要文件

5. **设置权限**
   - 设置文件所有者为 `www:www`
   - 设置目录权限为 `755`，文件权限为 `644`

6. **重载 Nginx**
   - 自动重载 Nginx 配置（如果可能）

## 宝塔面板配置

### 1. 创建网站

在宝塔面板中为每个应用创建网站：

- **网站域名**：如 `admin.bellis.com.cn`
- **网站根目录**：如 `/www/wwwroot/admin.bellis.com.cn`
- **网站类型**：静态网站

### 2. 配置 Nginx

确保 Nginx 配置支持 SPA 路由：

```nginx
server {
    listen 80;
    server_name admin.bellis.com.cn;
    root /www/wwwroot/admin.bellis.com.cn;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. 配置 SSL

在宝塔面板中为每个网站配置 SSL 证书。

## 常见问题

### 1. SSH 连接失败

**问题**：无法连接到服务器

**解决方案**：
- 检查 `SERVER_HOST`、`SERVER_USER`、`SERVER_PORT` 是否正确
- 确认 SSH 密钥已正确配置
- 测试 SSH 连接：`ssh -i ~/.ssh/id_rsa -p 22 root@your-server-ip`

### 2. 权限错误

**问题**：文件上传后无法访问

**解决方案**：
- 确保服务器用户有权限访问网站目录
- 检查文件权限：`chown -R www:www /www/wwwroot/your-site`
- 检查目录权限：`chmod -R 755 /www/wwwroot/your-site`

### 3. 文件未更新

**问题**：部署后网站内容未更新

**解决方案**：
- 清除浏览器缓存
- 检查 Nginx 缓存配置
- 确认文件已正确同步到服务器

### 4. 构建失败

**问题**：构建步骤失败

**解决方案**：
- 检查 Node.js 和 pnpm 版本
- 运行 `pnpm install` 安装依赖
- 检查构建日志中的错误信息

## 与 Docker 部署的对比

| 特性 | 静态部署 | Docker 部署 |
|------|---------|------------|
| 部署速度 | 快（直接同步文件） | 慢（需要拉取镜像） |
| 资源占用 | 低（仅静态文件） | 高（需要运行容器） |
| 环境一致性 | 依赖服务器环境 | 完全一致 |
| 回滚速度 | 快（直接替换文件） | 慢（需要拉取旧镜像） |
| 适用场景 | 纯前端应用 | 需要特定运行环境的应用 |

## 最佳实践

1. **使用 rsync**：比 scp 更快，支持增量同步
2. **创建备份**：部署前自动备份，便于快速回滚
3. **分批部署**：生产环境建议分批部署，避免同时影响所有应用
4. **监控部署**：部署后检查网站是否正常访问
5. **版本管理**：保留部署历史，便于问题排查

## 相关命令

```bash
# 构建并部署单个应用
pnpm --filter admin-app build && pnpm deploy:static:admin

# 构建并部署所有应用
pnpm build:all && pnpm deploy:static:all

# 仅部署（不构建）
pnpm deploy:static:admin

# 查看帮助
./scripts/deploy-static.sh --help
```

