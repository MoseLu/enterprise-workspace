# Docker Jenkins 403 错误完整修复指南

## 问题诊断结果

根据诊断脚本的结果：

1. ✅ **容器已挂载数据卷**（使用 Docker 命名卷）
2. ❌ **手动 API 测试仍然返回 403**
3. ⚠️ **容器状态为 "Created"（未启动）**

## 核心问题

**Docker 环境的权限配置问题**，可能原因：
1. 权限配置未持久化（虽然卷已挂载，但配置可能未保存）
2. 授权策略不是 "Matrix-based security"
3. 容器需要重启才能让权限生效
4. Jenkins URL 配置与实际访问 URL 不匹配

## 完整修复步骤

### 步骤 1：启动并检查 Jenkins 容器

```powershell
# 启动容器
docker start jenkins

# 等待 Jenkins 完全启动（30-60秒）
Start-Sleep -Seconds 60

# 检查容器状态
docker ps --filter "name=jenkins"
```

### 步骤 2：访问 Jenkins Web UI

1. 打开浏览器：`http://localhost:9000` 或 `http://10.80.8.199:9000`
2. 使用管理员账号登录

### 步骤 3：修复 Jenkins URL 配置（重要！）

1. 进入：**Manage Jenkins** → **System Configuration**（系统配置）
2. 找到 **"Jenkins URL"** 字段
3. 设置为：`http://10.80.8.199:9000`（与您实际访问的 URL 一致）
4. 点击 **"Save"**（保存）

### 步骤 4：配置授权策略

1. 进入：**Manage Jenkins** → **Security**（安全）
2. 找到 **"Authorization"**（授权）部分
3. **必须选择：** "Matrix-based security"（矩阵安全）
   - ❌ 不能是 "Logged-in users can do anything"
   - ❌ 不能是 "Anyone can do anything"
4. 在权限矩阵中：
   - 点击 **"Add user…"**（添加用户）
   - 输入：`Mose`
   - 勾选权限：
     - **Overall** → **Administer**（推荐）
     - 或至少：
       - **Overall** → **Read**
       - **Job** → **Create**
       - **Job** → **Configure**
       - **Job** → **Read**
5. 滚动到底部，点击 **"Save"**（保存）

### 步骤 5：重启 Jenkins 容器

```powershell
# 重启容器（让配置生效）
docker restart jenkins

# 等待 Jenkins 完全启动
Start-Sleep -Seconds 60
```

### 步骤 6：重新登录

1. 退出 Jenkins Web UI（Sign out）
2. 等待 5-10 秒
3. 使用 Mose 账号重新登录
4. 确认可以访问 Jenkins

### 步骤 7：验证修复

运行诊断脚本：

```powershell
.\jenkins\diagnose-docker-jenkins.ps1 -JenkinsUrl "http://10.80.8.199:9000" -JenkinsUser "Mose" -JenkinsPassword "123456"
```

如果手动 API 测试通过，运行创建脚本：

```powershell
.\jenkins\create-jobs.ps1 -JenkinsUrl "http://10.80.8.199:9000" -JenkinsUser "Mose" -JenkinsPassword "123456"
```

## 使用 API Token（推荐，更安全）

### 生成 API Token

1. 登录 Jenkins 作为 Mose
2. 点击右上角用户名 → **Configure**（配置）
3. 滚动到 **"API Token"** 部分
4. 点击 **"Add new Token"** → **"Generate"**
5. 复制生成的 Token（只显示一次！）

### 使用 API Token 测试

```powershell
.\jenkins\test-with-api-token.ps1 -JenkinsUrl "http://10.80.8.199:9000" -JenkinsUser "Mose" -ApiToken "your-token-here"
```

### 使用 API Token 创建 Jobs

修改 `create-jobs.ps1` 脚本，使用 API Token 而不是密码。

## 如果仍然失败

### 选项 A：切换到 Bind Mount（更容易访问数据）

```powershell
# 1. 停止并删除当前容器
docker stop jenkins
docker rm jenkins

# 2. 创建数据目录
New-Item -ItemType Directory -Force -Path "D:\jenkins_data"

# 3. 启动新容器（使用 bind mount）
docker run -d `
  -p 9000:8080 `
  -p 50000:50000 `
  -v "D:\jenkins_data:/var/jenkins_home" `
  --name jenkins `
  jenkins/jenkins:lts

# 4. 等待启动
Start-Sleep -Seconds 60

# 5. 重新配置权限（见步骤 3-6）
```

### 选项 B：检查 Docker 网络

```powershell
# 获取容器 IP
docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" jenkins

# 尝试使用容器 IP 访问
# 例如：http://172.17.0.2:8080
```

## 快速检查清单

- [ ] Jenkins 容器正在运行
- [ ] 可以访问 Jenkins Web UI
- [ ] Jenkins URL 配置正确（与实际访问 URL 一致）
- [ ] 授权策略 = "Matrix-based security"
- [ ] 用户 "Mose" 在权限矩阵中
- [ ] 权限已勾选（至少 Job/Create）
- [ ] 配置已保存
- [ ] 容器已重启
- [ ] 用户已重新登录
- [ ] 手动 API 测试通过

## 相关脚本

- `diagnose-docker-jenkins.ps1` - 全面诊断脚本
- `fix-docker-jenkins.ps1` - 修复指导脚本
- `test-with-api-token.ps1` - API Token 测试脚本
- `test-api-direct.ps1` - 直接 API 测试脚本

## 常见问题

### Q: 为什么权限配置了但不生效？

**A:** 
- Docker 容器需要重启才能让权限配置生效
- 授权策略必须是 "Matrix-based security"
- 配置必须保存（点击 Save 按钮）

### Q: 使用命名卷还是 bind mount？

**A:**
- **命名卷**：Docker 管理，更安全，但 Windows 上难以直接访问
- **Bind mount**：直接映射到 Windows 路径，更容易访问和备份
- 推荐使用 **bind mount**（`-v D:\jenkins_data:/var/jenkins_home`）

### Q: 如何备份 Jenkins 数据？

**A:**
```powershell
# 如果使用 bind mount
Copy-Item -Path "D:\jenkins_data" -Destination "D:\jenkins_data_backup" -Recurse

# 如果使用命名卷
docker exec jenkins tar czf /tmp/backup.tar.gz /var/jenkins_home
docker cp jenkins:/tmp/backup.tar.gz .
```
