# Jenkins 安装和访问指南

## 快速检查 Jenkins 是否已安装

### Windows 系统

打开浏览器，尝试访问以下地址：

- `http://localhost:8080`
- `http://127.0.0.1:8080`

如果能打开 Jenkins 登录页面，说明已经安装了。

### Linux 系统

在终端运行：

```bash
# 检查 Jenkins 服务是否运行
systemctl status jenkins

# 或者检查端口
netstat -tlnp | grep 8080
```

## 如果还没有安装 Jenkins

### 方式一：使用 Docker（最简单，推荐）

#### Windows/Mac

1. **安装 Docker Desktop**（如果还没有）

2. **运行 Jenkins**：

```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts
```

3. **获取初始密码**：

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

#### Linux

```bash
# 运行 Jenkins 容器
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts

# 查看初始密码
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### 方式二：直接安装（Linux）

#### Ubuntu/Debian

```bash
# 添加 Jenkins 仓库
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# 安装 Jenkins
sudo apt-get update
sudo apt-get install jenkins

# 启动 Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# 查看初始密码
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

#### CentOS/RHEL

```bash
# 添加 Jenkins 仓库
sudo wget -O /etc/yum.repos.d/jenkins.repo \
    https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

# 安装 Jenkins
sudo yum install jenkins

# 启动 Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# 查看初始密码
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 方式三：宝塔面板安装（如果使用宝塔）

1. 登录宝塔面板
2. 软件商店 → 搜索 "Jenkins"
3. 点击安装
4. 安装完成后，点击设置 → 查看访问地址

## 访问 Jenkins

### 1. 打开浏览器

访问：**http://localhost:8080**

如果 Jenkins 安装在远程服务器上，使用服务器 IP：
**http://你的服务器IP:8080**

### 2. 首次登录

首次访问需要输入初始管理员密码：

- **Docker 安装**：运行 `docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword`
- **Linux 安装**：运行 `sudo cat /var/lib/jenkins/secrets/initialAdminPassword`

复制密码，粘贴到 Jenkins 页面，点击 **Continue**

### 3. 安装插件

选择 **Install suggested plugins**（安装推荐插件），等待安装完成

### 4. 创建管理员账户

- 用户名
- 密码
- 确认密码
- 全名（可选）
- 邮箱（可选）

点击 **Save and Continue**

### 5. 配置 Jenkins URL

保持默认 `http://localhost:8080` 或修改为实际地址，点击 **Save and Finish**

### 6. 完成

点击 **Start using Jenkins**，进入 Jenkins 首页

## Jenkins 首页位置

安装完成后，Jenkins 首页就是：

- **本地**：http://localhost:8080
- **远程服务器**：http://你的服务器IP:8080

## 常见问题

### Q: 8080 端口被占用怎么办？

A: 修改端口：

**Docker 方式**：
```bash
# 停止现有容器
docker stop jenkins
docker rm jenkins

# 使用新端口运行（例如 9080）
docker run -d \
  --name jenkins \
  -p 9080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts
```

然后访问：http://localhost:9080

**Linux 系统**：
编辑 `/etc/default/jenkins`（Ubuntu）或 `/etc/sysconfig/jenkins`（CentOS）：
```bash
HTTP_PORT=9080
```

然后重启：
```bash
sudo systemctl restart jenkins
```

### Q: 忘记初始密码怎么办？

**Docker 方式**：
```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

**Linux 系统**：
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Q: 无法访问 Jenkins 页面？

1. 检查防火墙是否开放 8080 端口
2. 检查 Jenkins 服务是否运行
3. 检查端口是否正确
