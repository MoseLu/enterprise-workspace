# GitHub Webhook 配置指南

## 概述

GitHub Webhook 可以在代码推送到 GitHub 时立即通知 Jenkins，自动触发构建。这比 Poll SCM 更高效，响应更快。

## 优势对比

| 特性 | GitHub Webhook | Poll SCM |
|------|----------------|----------|
| **响应速度** | 立即触发（秒级） | 有延迟（取决于轮询间隔） |
| **服务器负载** | 低（按需触发） | 高（持续轮询） |
| **实时性** | 推送后立即构建 | 需要等待轮询时间 |
| **配置复杂度** | 中等（需要配置 Webhook） | 简单（只需 cron） |

## 配置步骤

### 步骤 1：安装 GitHub 插件（如果未安装）

1. 登录 Jenkins
2. 进入 **Manage Jenkins** → **Plugins**（插件管理）
3. 在 **Available**（可用插件）中搜索 **GitHub Plugin**
4. 勾选并点击 **Install without restart**（安装不重启）
5. 等待安装完成

### 步骤 2：配置 Jenkins GitHub 服务器

1. 进入 **Manage Jenkins** → **Configure System**（系统配置）
2. 向下滚动找到 **GitHub** 部分
3. 点击 **Add GitHub Server**（添加 GitHub 服务器）
4. 配置如下：
   - **Name**: `GitHub`（或自定义名称）
   - **API URL**: `https://api.github.com`（GitHub 公开 API）
   - **Credentials**: 
     - 点击 **Add** → **Jenkins**
     - **Kind**: `Secret text`
     - **Secret**: 输入 GitHub Personal Access Token（见下方如何获取）
     - **ID**: `github-token`
     - 点击 **Add**
   - 勾选 **Manage hooks**（管理 Webhook）
5. 点击 **Test connection**（测试连接）验证配置
6. 点击 **Save**（保存）

### 步骤 3：获取 GitHub Personal Access Token

1. 登录 GitHub
2. 点击右上角头像 → **Settings**（设置）
3. 左侧菜单选择 **Developer settings**（开发者设置）
4. 选择 **Personal access tokens** → **Tokens (classic)**
5. 点击 **Generate new token** → **Generate new token (classic)**
6. 配置 Token：
   - **Note**: `Jenkins Webhook`（描述）
   - **Expiration**: 选择过期时间（建议选择较长时间）
   - **Scopes**（权限）：
     - ✅ `repo`（完整仓库访问权限）
     - ✅ `admin:repo_hook`（管理仓库 Webhook）
7. 点击 **Generate token**（生成令牌）
8. **重要**：复制生成的 Token（只显示一次，请妥善保存）

### 步骤 4：在 Jenkinsfile 中配置 Webhook 触发

在 `Jenkinsfile.logistics-app` 中添加 `triggers` 配置：

```groovy
pipeline {
    agent any
    
    // 配置 GitHub Webhook 触发
    triggers {
        // 当代码推送到 develop 分支时触发构建
        githubPush()
    }
    
    // 或者更精确的配置：
    // triggers {
    //     // 只监听特定分支的推送
    //     githubPush()
    // }
    
    // ... 其他配置
}
```

### 步骤 5：在 GitHub 仓库中配置 Webhook

1. 进入 GitHub 仓库页面
2. 点击 **Settings**（设置）
3. 左侧菜单选择 **Webhooks**
4. 点击 **Add webhook**（添加 Webhook）
5. 配置 Webhook：
   - **Payload URL**: `http://your-jenkins-url/github-webhook/`
     - 例如：`http://localhost:9000/github-webhook/`
     - 如果 Jenkins 在服务器上：`http://your-server-ip:port/github-webhook/`
   - **Content type**: `application/json`
   - **Secret**: （可选，如果 Jenkins 配置了 Secret）
   - **Which events would you like to trigger this webhook?**:
     - 选择 **Just the push event**（仅推送事件）
     - 或者选择 **Let me select individual events**，然后勾选：
       - ✅ **Pushes**（推送）
   - 勾选 **Active**（激活）
6. 点击 **Add webhook**（添加 Webhook）

### 步骤 6：验证 Webhook 配置

1. 在 GitHub Webhook 页面，可以看到刚创建的 Webhook
2. 点击 Webhook 查看 **Recent Deliveries**（最近交付）
3. 进行测试：
   - 在仓库中做一个小的修改并推送
   - 查看 Webhook 的 **Recent Deliveries**，应该显示 `200` 状态码
   - 在 Jenkins 中应该自动触发构建

## Jenkinsfile 配置示例

### 完整示例（推荐）

```groovy
pipeline {
    agent any
    
    // 配置 GitHub Webhook 触发
    triggers {
        githubPush()
    }
    
    environment {
        NODE_VERSION = '20'
        PNPM_VERSION = '8.15.0'
        APP_NAME = 'logistics-app'
    }
    
    // ... 其他配置
}
```

### 只监听特定分支

如果需要只监听特定分支（如 `develop`），可以在 `stages` 中添加条件：

```groovy
pipeline {
    agent any
    
    triggers {
        githubPush()
    }
    
    stages {
        stage('Checkout') {
            when {
                // 只处理 develop 分支
                branch 'develop'
            }
            steps {
                // ...
            }
        }
    }
}
```

## 网络配置要求

### 如果 Jenkins 在本地或内网

如果 Jenkins 运行在本地或内网，GitHub 无法直接访问，需要：

1. **使用内网穿透工具**（如 ngrok、frp）：
   ```bash
   # 使用 ngrok 示例
   ngrok http 9000
   # 会生成一个公网 URL，如：https://xxxx.ngrok.io
   # 在 GitHub Webhook 中使用：https://xxxx.ngrok.io/github-webhook/
   ```

2. **或者使用 GitHub App**（更复杂但更安全）

3. **或者使用 Poll SCM 作为替代方案**

### 如果 Jenkins 在公网服务器

直接使用服务器的公网 IP 或域名：
- `http://your-server-ip:9000/github-webhook/`
- 或 `https://jenkins.yourdomain.com/github-webhook/`

## 安全配置（可选但推荐）

### 1. 配置 Webhook Secret

1. 在 GitHub Webhook 配置中设置 **Secret**
2. 在 Jenkins 系统配置中：
   - 进入 **Manage Jenkins** → **Configure System**
   - 找到 **GitHub** 部分
   - 在 **Secret** 字段输入相同的 Secret

### 2. 使用 HTTPS

如果 Jenkins 暴露在公网，强烈建议使用 HTTPS：
- 配置 SSL 证书
- 使用 `https://` 而不是 `http://`

## 故障排除

### 问题 1：Webhook 没有触发构建

**检查清单**：
1. ✅ GitHub Webhook 是否配置正确（Payload URL、事件类型）
2. ✅ Jenkins GitHub 插件是否已安装
3. ✅ Jenkins GitHub 服务器配置是否正确
4. ✅ Webhook 的 **Recent Deliveries** 是否显示成功（200 状态码）
5. ✅ Jenkinsfile 中是否配置了 `triggers { githubPush() }`

**解决方法**：
- 查看 GitHub Webhook 的 **Recent Deliveries**，查看错误信息
- 查看 Jenkins 系统日志：**Manage Jenkins** → **System Log**
- 测试 Webhook：在 GitHub 中点击 **Redeliver**（重新交付）

### 问题 2：Webhook 显示 403 或 401 错误

**可能原因**：
- GitHub Token 权限不足或已过期
- Jenkins 配置的 Token 不正确

**解决方法**：
1. 重新生成 GitHub Personal Access Token
2. 确保 Token 有 `repo` 和 `admin:repo_hook` 权限
3. 在 Jenkins 中更新 Token

### 问题 3：Webhook 显示连接超时

**可能原因**：
- Jenkins 服务器无法从公网访问
- 防火墙阻止了连接

**解决方法**：
1. 检查 Jenkins 服务器是否可以从公网访问
2. 检查防火墙配置
3. 使用内网穿透工具（如 ngrok）

### 问题 4：所有分支都触发构建

**解决方法**：
- 在 Jenkinsfile 中使用 `when { branch 'develop' }` 限制分支

## 与 Poll SCM 结合使用

可以同时配置 Webhook 和 Poll SCM，Webhook 作为主要触发方式，Poll SCM 作为备用：

```groovy
triggers {
    githubPush()                    // 主要触发方式：推送时立即触发
    pollSCM('H/30 * * * *')        // 备用：每 30 分钟检查一次（防止 Webhook 失效）
}
```

## 推荐配置

### 开发环境

```groovy
triggers {
    githubPush()  // 推送时立即触发
}
```

### 生产环境

```groovy
triggers {
    githubPush()                    // 推送时立即触发
    pollSCM('H * * * *')           // 每小时检查一次作为备用
}
```

## 相关文档

- [Jenkins GitHub Plugin 文档](https://plugins.jenkins.io/github/)
- [GitHub Webhooks 文档](https://docs.github.com/en/developers/webhooks-and-events/webhooks)
- [Jenkins Pipeline Triggers 文档](https://www.jenkins.io/doc/book/pipeline/syntax/#triggers)

