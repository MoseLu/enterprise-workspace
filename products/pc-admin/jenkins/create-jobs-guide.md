# Jenkins Jobs 批量创建指南

## 方法一：使用 PowerShell 脚本自动创建（推荐）

### 前置要求

1. **Jenkins 已启动**并可以访问
2. **Java** 已安装（用于运行 Jenkins CLI）
3. **PowerShell**（Windows 自带）

### 使用步骤

1. **打开 PowerShell**

   在项目根目录打开 PowerShell，或者导航到项目目录：
   ```powershell
   cd C:\Users\mlu\Desktop\btc-shopflow\btc-shopflow-monorepo
   ```

2. **运行脚本**

   ```powershell
   .\jenkins\create-jobs.ps1
   ```

   或者指定 Jenkins URL：
   ```powershell
   .\jenkins\create-jobs.ps1 -JenkinsUrl "http://localhost:8080"
   ```

3. **等待完成**

   脚本会自动：
   - 下载 Jenkins CLI（如果不存在）
   - 创建 8 个单应用部署 Jobs
   - 创建 1 个全量部署 Job
   - 总共创建 9 个 Jobs

### 创建的 Jobs 列表

**单应用部署 Jobs：**
- `btc-shopflow-deploy-system-app`
- `btc-shopflow-deploy-admin-app`
- `btc-shopflow-deploy-logistics-app`
- `btc-shopflow-deploy-quality-app`
- `btc-shopflow-deploy-production-app`
- `btc-shopflow-deploy-engineering-app`
- `btc-shopflow-deploy-finance-app`
- `btc-shopflow-deploy-mobile-app`

**全量部署 Job：**
- `btc-shopflow-deploy-all`

### 脚本参数

```powershell
.\jenkins\create-jobs.ps1 `
    -JenkinsUrl "http://localhost:8080" `
    -GitRepoUrl "https://github.com/BellisGit/btc-shopflow-monorepo.git" `
    -Branch "develop"
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `JenkinsUrl` | Jenkins 服务器地址 | `http://localhost:8080` |
| `GitRepoUrl` | Git 仓库地址 | `https://github.com/BellisGit/btc-shopflow-monorepo.git` |
| `Branch` | Git 分支 | `develop` |

---

## 方法二：手动创建（如果脚本失败）

如果 PowerShell 脚本无法使用，可以手动创建 Jobs。

### 步骤

#### 1. 创建单个应用 Jobs

为每个应用重复以下步骤：

1. 在 Jenkins 首页点击 **New Item**
2. 输入 Job 名称（如 `btc-shopflow-deploy-system-app`）
3. 选择 **Pipeline**
4. 点击 **OK**

5. 在配置页面：
   - **Pipeline** → **Definition**: `Pipeline script from SCM`
   - **SCM**: `Git`
   - **Repository URL**: `https://github.com/BellisGit/btc-shopflow-monorepo.git`
   - **Branch Specifier**: `*/develop`
   - **Script Path**: `jenkins/Jenkinsfile.single-app`
   - 点击 **Save**

6. 在 **Build with Parameters** 中，确认 `APP_NAME` 参数已正确设置（应该自动从 Job 名称提取）

#### 2. 创建全量部署 Job

1. 在 Jenkins 首页点击 **New Item**
2. 输入 Job 名称：`btc-shopflow-deploy-all`
3. 选择 **Pipeline**
4. 点击 **OK**

5. 在配置页面：
   - **Pipeline** → **Definition**: `Pipeline script from SCM`
   - **SCM**: `Git`
   - **Repository URL**: `https://github.com/BellisGit/btc-shopflow-monorepo.git`
   - **Branch Specifier**: `*/develop`
   - **Script Path**: `jenkins/Jenkinsfile.all-apps`
   - 点击 **Save**

---

## 方法三：使用 Jenkins Web UI 批量创建（需要插件）

如果你安装了 **Job DSL Plugin** 或 **Configuration as Code Plugin**，可以使用更高级的批量创建方式。

### 使用 Job DSL

1. 安装 **Job DSL Plugin**
2. 创建一个 **Freestyle Project** 或 **Pipeline Job**
3. 在构建步骤中添加 **Process Job DSLs**
4. 使用 DSL 脚本批量创建 Jobs

---

## 验证创建结果

创建完成后，在 Jenkins 首页应该能看到所有创建的 Jobs：

```
btc-shopflow-deploy-all
btc-shopflow-deploy-admin-app
btc-shopflow-deploy-engineering-app
btc-shopflow-deploy-finance-app
btc-shopflow-deploy-logistics-app
btc-shopflow-deploy-mobile-app
btc-shopflow-deploy-production-app
btc-shopflow-deploy-quality-app
btc-shopflow-deploy-system-app
```

## 测试 Jobs

### 测试单个应用部署

1. 进入任意一个单应用 Job（如 `btc-shopflow-deploy-system-app`）
2. 点击 **Build with Parameters**
3. 检查参数是否正确（`APP_NAME` 应该自动设置为应用名称）
4. 配置服务器参数（如果需要）
5. 点击 **Build**

### 测试全量部署

1. 进入 `btc-shopflow-deploy-all` Job
2. 点击 **Build with Parameters**
3. 配置服务器参数
4. 点击 **Build**

## 常见问题

### Q: 脚本执行失败，提示无法连接 Jenkins

**A:** 检查：
1. Jenkins 是否已启动
2. Jenkins URL 是否正确
3. 防火墙是否阻止了连接

### Q: 脚本提示需要认证

**A:** 如果 Jenkins 启用了安全认证，需要：
1. 在 Jenkins 中生成 API Token
2. 修改脚本，添加认证参数

或者使用 Jenkins Web UI 手动创建。

### Q: Job 创建成功但无法运行

**A:** 检查：
1. Git 仓库地址是否正确
2. 分支名称是否正确
3. Script Path 是否正确（`jenkins/Jenkinsfile.single-app` 或 `jenkins/Jenkinsfile.all-apps`）
4. 确保代码已推送到 Git 仓库

### Q: 如何删除已创建的 Jobs？

**A:** 在 Jenkins Web UI 中：
1. 进入 Job 页面
2. 点击左侧菜单的 **Delete Project**
3. 确认删除

或者使用 Jenkins CLI：
```powershell
java -jar jenkins-cli.jar -s http://localhost:8080 delete-job btc-shopflow-deploy-system-app
```

## 下一步

创建完 Jobs 后，参考以下文档：
- `deployment-strategies.md` - 了解不同的部署策略
- `quick-start.md` - 快速开始指南
- `credentials-setup.md` - 配置部署凭证
