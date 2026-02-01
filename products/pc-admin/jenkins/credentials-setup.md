# Jenkins Credentials 配置指南

## 概述

本文档说明如何在 Jenkins 中配置部署所需的凭证（Credentials）。

## 必需凭证列表

| ID | 类型 | 说明 | 示例值 |
|---|---|---|---|
| `ssh-deploy-key` | Secret file 或 SSH Username with private key | SSH 私钥文件 | ~/.ssh/id_rsa 的内容 |
| `deploy-server-host` | Secret text | 服务器地址 | `47.112.31.96` 或 `your-server.com` |
| `deploy-server-user` | Secret text | 服务器用户名 | `root` |
| `deploy-server-port` | Secret text | SSH 端口 | `22` |
| `oss-access-key-id` | Secret text | 阿里云 OSS AccessKey ID（可选，用于 CDN 上传） | `LTAI5t...` |
| `oss-access-key-secret` | Secret text | 阿里云 OSS AccessKey Secret（可选，用于 CDN 上传） | `xxx...` |

## 配置步骤

### 1. 进入 Credentials 管理

1. 登录 Jenkins
2. 点击 **Manage Jenkins**（管理 Jenkins）
3. 点击 **Credentials**（凭证）
4. 点击 **System** → **Global credentials (unrestricted)**（全局凭证）

### 2. 配置 SSH 私钥

有两种方式配置 SSH 私钥：

#### 方式一：Secret file（推荐，简单）

1. 点击 **Add Credentials**（添加凭证）
2. 配置如下：
   - **Kind**（类型）: `Secret file`
   - **File**（文件）: 选择或上传你的 SSH 私钥文件（如 `~/.ssh/id_rsa`）
   - **ID**: `ssh-deploy-key`
   - **Description**: `SSH 部署密钥`
3. 点击 **OK**

#### 方式二：SSH Username with private key（更灵活）

1. 点击 **Add Credentials**（添加凭证）
2. 配置如下：
   - **Kind**（类型）: `SSH Username with private key`
   - **ID**: `ssh-deploy-key`
   - **Description**: `SSH 部署密钥`
   - **Username**: 服务器用户名（如 `root`）
   - **Private Key**: 选择 **Enter directly**，然后粘贴私钥内容
   - 或者选择 **From the Jenkins master ~/.ssh** 使用服务器上的密钥
3. 点击 **OK**

**注意**：如果使用方式二，可能需要调整 Jenkinsfile 中的环境变量引用方式。

### 3. 配置服务器地址

1. 点击 **Add Credentials**（添加凭证）
2. 配置如下：
   - **Kind**（类型）: `Secret text`
   - **Secret**（密钥）: 输入服务器地址（如 `47.112.31.96`）
   - **ID**: `deploy-server-host`
   - **Description**: `部署服务器地址`
3. 点击 **OK**

### 4. 配置服务器用户名

1. 点击 **Add Credentials**（添加凭证）
2. 配置如下：
   - **Kind**（类型）: `Secret text`
   - **Secret**（密钥）: 输入服务器用户名（如 `root`）
   - **ID**: `deploy-server-user`
   - **Description**: `部署服务器用户名`
3. 点击 **OK**

### 5. 配置 SSH 端口

1. 点击 **Add Credentials**（添加凭证）
2. 配置如下：
   - **Kind**（类型）: `Secret text`
   - **Secret**（密钥）: 输入 SSH 端口（如 `22`）
   - **ID**: `deploy-server-port`
   - **Description**: `SSH 端口`
3. 点击 **OK**

### 6. 配置 OSS AccessKey ID（可选，用于 CDN 上传）

如果需要在构建时自动上传构建产物到阿里云 OSS/CDN，需要配置 OSS 凭证：

1. 点击 **Add Credentials**（添加凭证）
2. 配置如下：
   - **Kind**（类型）: `Secret text`
   - **Secret**（密钥）: 输入阿里云 OSS AccessKey ID（如 `LTAI5t...`）
   - **ID**: `oss-access-key-id`
   - **Description**: `阿里云 OSS AccessKey ID`
3. 点击 **OK**

### 7. 配置 OSS AccessKey Secret（可选，用于 CDN 上传）

1. 点击 **Add Credentials**（添加凭证）
2. 配置如下：
   - **Kind**（类型）: `Secret text`
   - **Secret**（密钥）: 输入阿里云 OSS AccessKey Secret
   - **ID**: `oss-access-key-secret`
   - **Description**: `阿里云 OSS AccessKey Secret`
3. 点击 **OK**

**注意**：
- OSS 凭证是可选的，只有在需要自动上传构建产物到 CDN 时才需要配置
- 如果未配置 OSS 凭证，构建时会跳过 CDN 上传步骤，但不会影响构建成功
- OSS 凭证用于上传构建产物到阿里云 OSS，然后通过 CDN 加速访问

## 验证配置

配置完成后，可以通过以下方式验证：

1. 在 Pipeline Job 配置中，查看环境变量部分是否正确识别了这些凭证
2. 运行一次构建，检查是否能够正确读取凭证

## 安全建议

1. **最小权限原则**：SSH 私钥应该只具有部署目录的访问权限
2. **定期轮换**：定期更换 SSH 密钥
3. **不要提交密钥**：确保 SSH 私钥不会被提交到 Git 仓库
4. **使用专用密钥**：为 Jenkins 部署创建专用的 SSH 密钥对，不要使用个人密钥

## 常见问题

### Q: 如果我的服务器配置是固定的，可以硬编码吗？

A: 不推荐硬编码。使用 Credentials 的好处：
- 安全性：敏感信息不会出现在日志中
- 灵活性：不同环境可以使用不同的凭证
- 可维护性：修改配置不需要修改代码

### Q: 可以使用环境变量吗？

A: 可以，但需要确保 Jenkins 节点上有这些环境变量。推荐使用 Jenkins Credentials，因为：
- 集中管理
- 更好的安全性
- 可以在不同节点间共享

### Q: SSH 连接失败怎么办？

A: 检查以下几点：
1. SSH 私钥是否正确配置
2. 私钥是否有正确的权限（600）
3. 服务器地址、用户名、端口是否正确
4. Jenkins 服务器是否可以访问部署服务器（网络连通性）
5. 服务器上是否允许该用户通过 SSH 登录

## 将 SSH 密钥放到 Jenkins 容器中

如果你的 Jenkins 运行在 Docker 容器中，需要将 SSH 私钥文件复制到容器内。根据当前的 Jenkinsfile 配置，密钥需要放在 `/var/jenkins_home/.ssh/id_rsa`。

### 方法 1：使用 PowerShell 脚本（Windows 推荐）

如果你在 Windows 上使用 Docker Desktop，可以使用项目提供的脚本：

```powershell
# 使用默认配置（容器名: jenkins，密钥路径: ~/.ssh/id_rsa）
.\jenkins\setup-ssh-key.ps1

# 或者指定自定义路径
.\jenkins\setup-ssh-key.ps1 -ContainerName "jenkins" -SshKeyPath "C:\Users\YourName\.ssh\id_rsa"
```

脚本会自动：
- 检查 Docker 和容器状态
- 创建必要的目录
- 复制 SSH 密钥文件
- 设置正确的权限（600）
- 验证配置

### 方法 2：使用 docker cp 命令（Linux/Mac 推荐）

在 Linux 或 Mac 上，可以直接使用 docker cp 命令：

```bash
# 1. 确保你有 SSH 私钥文件（通常是 ~/.ssh/id_rsa）
#    如果没有，先生成一个：
#    ssh-keygen -t rsa -b 4096 -C "jenkins@deploy"

# 2. 查找 Jenkins 容器名称或 ID
docker ps | grep jenkins

# 3. 创建 .ssh 目录（如果不存在）
docker exec -u root jenkins mkdir -p /var/jenkins_home/.ssh

# 4. 复制 SSH 私钥到容器
docker cp ~/.ssh/id_rsa jenkins:/var/jenkins_home/.ssh/id_rsa

# 5. 设置正确的权限
docker exec -u root jenkins chmod 600 /var/jenkins_home/.ssh/id_rsa
docker exec -u root jenkins chown jenkins:jenkins /var/jenkins_home/.ssh/id_rsa

# 6. 验证文件是否存在
docker exec jenkins ls -la /var/jenkins_home/.ssh/id_rsa
```

**Windows 用户注意**：在 Windows PowerShell 中，路径需要使用双引号，并且路径分隔符会自动处理：
```powershell
# Windows PowerShell 示例
docker cp "$env:USERPROFILE\.ssh\id_rsa" jenkins:/var/jenkins_home/.ssh/id_rsa
```

### 方法 3：使用 docker cp 命令（手动方式）

如果你更喜欢手动操作，可以使用 docker cp 命令：

**Windows PowerShell:**
```powershell
# 1. 查找 Jenkins 容器
docker ps

# 2. 创建 .ssh 目录
docker exec -u root jenkins mkdir -p /var/jenkins_home/.ssh

# 3. 复制密钥（使用 Windows 路径）
docker cp "$env:USERPROFILE\.ssh\id_rsa" jenkins:/var/jenkins_home/.ssh/id_rsa

# 4. 设置权限
docker exec -u root jenkins chmod 600 /var/jenkins_home/.ssh/id_rsa
docker exec -u root jenkins chown jenkins:jenkins /var/jenkins_home/.ssh/id_rsa

# 5. 验证
docker exec jenkins ls -la /var/jenkins_home/.ssh/id_rsa
```

**Linux/Mac:**
```bash
# 命令与上面方法 2 相同
```

### 方法 4：进入容器手动创建

```bash
# 1. 进入 Jenkins 容器（以 root 用户）
docker exec -it -u root jenkins bash

# 2. 在容器内创建目录和文件
mkdir -p /var/jenkins_home/.ssh
chown jenkins:jenkins /var/jenkins_home/.ssh

# 3. 创建密钥文件（使用你喜欢的编辑器，或从主机复制）
#    如果你在主机上有密钥，可以先复制到容器：
#    （在主机上执行）docker cp ~/.ssh/id_rsa jenkins:/tmp/id_rsa
#    （在容器内执行）cp /tmp/id_rsa /var/jenkins_home/.ssh/id_rsa

# 4. 设置权限
chmod 600 /var/jenkins_home/.ssh/id_rsa
chown jenkins:jenkins /var/jenkins_home/.ssh/id_rsa

# 5. 退出容器
exit
```

### 方法 5：使用 Docker 卷挂载（永久方案）

如果你使用 Docker Compose 或直接运行 Docker 容器，可以挂载 SSH 密钥目录：

```yaml
# docker-compose.yml 示例
version: '3'
services:
  jenkins:
    image: jenkins/jenkins:lts
    volumes:
      - jenkins_home:/var/jenkins_home
      - /path/to/your/.ssh:/var/jenkins_home/.ssh:ro  # 只读挂载 SSH 目录
    # ... 其他配置
```

或者使用 Docker 命令：

```bash
docker run -d \
  -v jenkins_home:/var/jenkins_home \
  -v /path/to/your/.ssh:/var/jenkins_home/.ssh:ro \
  --name jenkins \
  jenkins/jenkins:lts
```

**Windows Docker 用户注意**：
- Windows 路径需要使用正斜杠或双反斜杠，例如：`C:/Users/YourName/.ssh:/var/jenkins_home/.ssh:ro`
- 或者使用环境变量：`$env:USERPROFILE\.ssh:/var/jenkins_home/.ssh:ro`

**注意**：使用卷挂载时，确保主机的 SSH 密钥文件权限正确（600）。

### 验证配置

配置完成后，可以通过以下方式验证：

```bash
# 1. 检查文件是否存在
docker exec jenkins ls -la /var/jenkins_home/.ssh/id_rsa

# 2. 检查文件权限（应该是 -rw------- 即 600）
docker exec jenkins stat -c "%a %n" /var/jenkins_home/.ssh/id_rsa

# 3. 测试 SSH 连接（在容器内）
docker exec jenkins ssh -i /var/jenkins_home/.ssh/id_rsa -o StrictHostKeyChecking=no root@47.112.31.96 "echo 'SSH connection successful'"
```

### 注意事项

1. **权限安全**：确保 SSH 私钥文件权限为 600，只有所有者可以读写
2. **密钥管理**：建议使用专用密钥对，不要使用个人密钥
3. **密钥位置**：默认路径是 `/var/jenkins_home/.ssh/id_rsa`，也可以在 Jenkins Job 参数中修改 `SSH_KEY_PATH`
4. **密钥格式**：确保密钥文件是 OpenSSH 格式，如果使用其他格式可能需要转换
