# Jenkins 创建 Item 详细步骤指南

## 问题说明

如果你看不到 **"Build with Parameters"** 选项，这是因为 Jenkins 需要先运行一次 Pipeline 才能识别 Jenkinsfile 中定义的参数。

## 完整步骤

### 步骤 1: 创建 Pipeline Job

1. **打开 Jenkins 首页**
   - 访问 `http://localhost:8080`（或你的 Jenkins 地址）
   - 登录 Jenkins

2. **点击 "New Item"（新建任务）**
   - 在 Jenkins 首页左侧菜单或顶部导航栏找到 **"New Item"** 按钮
   - 点击它

3. **输入任务名称**
   - 在 **"Enter an item name"** 输入框中输入：`btc-shopflow-deploy`
   - 或者使用你喜欢的名称

4. **选择任务类型**
   - 在下方选择 **"Pipeline"**（流水线）
   - 不要选择其他类型（如 Freestyle project）

5. **点击 "OK" 按钮**

### 步骤 2: 配置 Pipeline

在配置页面中，找到 **"Pipeline"** 部分（通常在页面底部），按以下配置：

1. **Definition（定义）**
   - 选择：**"Pipeline script from SCM"**
   - 不要选择 "Pipeline script"

2. **SCM（源代码管理）**
   - 选择：**"Git"**

3. **Repository URL（仓库地址）**
   - 输入：`https://github.com/BellisGit/btc-shopflow-monorepo.git`
   - 或者你的 Git 仓库地址

4. **Credentials（凭证）**
   - 如果是公开仓库，留空即可
   - 如果是私有仓库，需要选择 Git 凭证

5. **Branch Specifier（分支）**
   - 输入：`*/develop`
   - 或者你的主要分支名称

6. **Script Path（脚本路径）**
   - 输入：`Jenkinsfile`
   - 这是项目根目录的 Jenkinsfile 文件名

7. **点击 "Save"（保存）按钮**

### 步骤 3: 首次运行（重要！）

保存后，你会进入 Job 的详情页面。现在需要运行第一次构建：

1. **找到 "Build Now"（立即构建）**
   - 在左侧菜单中找到 **"Build Now"** 链接
   - 点击它

2. **等待构建完成**
   - 构建可能会失败（这是正常的，因为可能还没有配置好环境）
   - 但这次运行会让 Jenkins 读取 Jenkinsfile 并识别参数

3. **查看构建状态**
   - 在页面底部的 **"Build History"（构建历史）** 中可以看到构建进度
   - 点击构建号可以查看详细日志

### 步骤 4: 查看参数选项

首次构建完成后（无论成功或失败）：

1. **刷新页面**
   - 按 `F5` 或点击浏览器刷新按钮

2. **查找 "Build with Parameters"**
   - 刷新后，左侧菜单中会出现 **"Build with Parameters"** 选项
   - 如果还是没有，继续看下面的解决方案

### 如果仍然看不到 "Build with Parameters"

如果首次构建后仍然看不到参数选项，可以尝试：

#### 方法 1: 检查 Jenkinsfile 是否正确加载

1. 进入 Job 配置页面（点击左侧 **"Configure"**）
2. 检查 **Pipeline** 部分的配置是否正确
3. 确保 **Script Path** 是 `Jenkinsfile`
4. 保存并再次运行构建

#### 方法 2: 手动触发参数识别

1. 进入 Job 配置页面
2. 在 **Pipeline** 部分，临时改为 **"Pipeline script"**
3. 将 Jenkinsfile 的内容复制粘贴到脚本框中
4. 保存
5. 运行一次构建
6. 然后再改回 **"Pipeline script from SCM"**，保存

#### 方法 3: 检查 Jenkins 版本和插件

确保安装了以下插件：
- **Pipeline** 插件
- **Git Plugin**

检查方法：
1. **Manage Jenkins** → **Manage Plugins** → **Installed**
2. 搜索 "Pipeline" 和 "Git"，确认已安装

## 使用参数构建

一旦看到 **"Build with Parameters"** 选项：

1. **点击 "Build with Parameters"**
2. **选择参数**：
   - **APP_NAME**: 选择要部署的应用（如 `system-app`）或 `all`（部署所有应用）
   - **SERVER_HOST**: 服务器地址（默认：`47.112.31.96`）
   - **SERVER_USER**: 服务器用户名（默认：`root`）
   - **SERVER_PORT**: SSH 端口（默认：`22`）
   - **SSH_KEY_PATH**: SSH 私钥路径（默认：`/var/jenkins_home/.ssh/id_rsa`）
   - **SKIP_TESTS**: 是否跳过测试（默认：`true`）
   - **CLEAN_BUILD**: 是否清理构建缓存（默认：`false`）

3. **点击 "Build" 按钮**

## 常见问题

### Q: 我点击了 "Build Now"，但构建失败了，怎么办？

A: 首次构建失败是正常的，因为可能还没有配置好环境（如 Node.js、pnpm 等）。重要的是让 Jenkins 读取一次 Jenkinsfile。构建失败后，刷新页面，应该就能看到 "Build with Parameters" 了。

### Q: 我在 Jenkins 首页看不到 "New Item" 按钮？

A: 检查你的权限：
1. 确保你已登录
2. 确保你的账户有创建 Job 的权限
3. 联系 Jenkins 管理员分配权限

### Q: 我创建了 Job，但配置页面中没有 "Pipeline" 部分？

A: 确保你选择的是 **"Pipeline"** 类型，而不是其他类型（如 Freestyle project）。

### Q: 参数选项显示不正确？

A: 检查 Jenkinsfile 中的 `parameters` 部分是否正确。确保语法没有错误。

## 下一步

配置完成后，参考以下文档：
- `credentials-setup.md` - 配置部署凭证
- `quick-start.md` - 快速开始指南
