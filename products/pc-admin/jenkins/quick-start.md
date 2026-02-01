# Jenkins 快速开始指南

## 前提条件

1. **Jenkins 已安装**（版本 2.x 或更高）
2. **Node.js 20+** 已安装在 Jenkins 服务器上
3. **pnpm** 已安装（或 Pipeline 会自动安装）
4. **Git** 已安装
5. **SSH 客户端** 已安装

## 快速配置（5 分钟）

### 步骤 1: 安装必需插件（2 分钟）

1. 登录 Jenkins
2. 进入 **Manage Jenkins** → **Manage Plugins** → **Available**
3. 搜索并安装以下插件：
   - **Pipeline**
   - **Git Plugin**
   - **Credentials Binding Plugin**
   - **SSH Pipeline Steps**（可选，用于 SSH 操作）

### 步骤 2: 配置 Credentials（2 分钟）

按照 `credentials-setup.md` 文档配置以下凭证：

- `ssh-deploy-key`: SSH 私钥
- `deploy-server-host`: 服务器地址
- `deploy-server-user`: 服务器用户名
- `deploy-server-port`: SSH 端口

**快速示例**：
- 服务器地址：`47.112.31.96`
- 用户名：`root`
- 端口：`22`
- SSH 密钥：你的 `~/.ssh/id_rsa` 文件内容

### 步骤 3: 创建 Pipeline Job（1 分钟）

1. 点击 **New Item**
2. 输入任务名称：`btc-shopflow-deploy`
3. 选择 **Pipeline**
4. 点击 **OK**

5. 在 **Pipeline** 配置中：
   - **Definition**: `Pipeline script from SCM`
   - **SCM**: `Git`
   - **Repository URL**: 你的 Git 仓库地址（如 `https://github.com/BellisGit/btc-shopflow-monorepo.git`）
   - **Credentials**: 如果是私有仓库，选择 Git 凭证
   - **Branch Specifier**: `*/develop`（或你的主要分支）
   - **Script Path**: `Jenkinsfile`
   - 点击 **Save**

## 第一次运行

1. 点击 Pipeline Job 名称进入
2. 点击 **Build with Parameters**
3. 选择参数：
   - **APP_NAME**: 选择一个应用（如 `system-app`）或 `all`（部署所有应用）
   - **SKIP_TESTS**: `true`（首次测试可以跳过，加快速度）
   - **CLEAN_BUILD**: `false`
4. 点击 **Build**

5. 查看构建日志，确认构建和部署成功

## 验证部署

构建成功后，访问你的网站确认部署是否成功：

- system-app: `http://bellis.com.cn`
- admin-app: `http://admin.bellis.com.cn`
- 等等...

## 下一步

### 1. 配置部署配置文件

确保项目中有 `deploy.config.json` 文件（或复制 `deploy.config.example.json`）：

```bash
cp deploy.config.example.json deploy.config.json
```

然后根据实际服务器路径修改配置。

### 2. 配置自动触发（可选）

如果需要代码推送后自动构建，可以在 Jenkinsfile 的 `triggers` 部分取消注释：

```groovy
triggers {
    pollSCM('H/2 * * * *')  // 每 2 分钟检查一次
}
```

### 3. 配置通知（可选）

添加邮件或企业微信通知，在构建失败时发送通知。

## 常用操作

### 部署单个应用

1. **Build with Parameters**
2. 选择应用名称（如 `admin-app`）
3. 点击 **Build**

### 部署所有应用

1. **Build with Parameters**
2. 选择 `all`
3. 点击 **Build**

### 查看构建历史

点击 Pipeline Job，可以看到所有构建历史，包括：
- 构建状态（成功/失败）
- 构建时间
- 构建参数
- 构建日志

### 回滚到之前的版本

由于使用了 `releases/current` 的部署结构，回滚很简单：

1. 查看构建历史，找到需要回滚的构建
2. 查看该构建的部署日志，找到 release 目录名称
3. 在服务器上手动切换 symlink，或重新运行那个构建

## 故障排查

### 构建失败

1. **查看构建日志**：点击失败的构建 → **Console Output**
2. **常见问题**：
   - Node.js 版本不匹配：确保 Jenkins 服务器上安装了 Node.js 20+
   - 依赖安装失败：检查网络连接和 pnpm 配置
   - SSH 连接失败：检查 Credentials 配置

### 部署失败

1. **检查 SSH 连接**：构建日志中应该有 SSH 连接测试
2. **检查服务器路径**：确保 `deploy.config.json` 中的路径正确
3. **检查权限**：确保 SSH 用户有权限写入部署目录

### 构建产物不存在

1. **检查构建阶段**：确认构建阶段是否成功
2. **检查 dist 目录**：构建日志中应该显示 dist 目录验证结果

## 获取帮助

如果遇到问题：

1. 查看 `docs/JENKINS_SETUP.md` 获取详细配置说明
2. 查看构建日志获取详细错误信息
3. 检查 Jenkins 系统日志：**Manage Jenkins** → **System Log**
