# Jenkins 独立构建 Jobs 批量创建指南（使用 Java CLI）

## 概述

此脚本使用 **Jenkins Java CLI** 来批量创建除了系统应用构建和全量构建之外的其他独立构建脚本的 Jenkins jobs。

### 排除的构建类型

- ❌ **系统应用构建**（`Jenkinsfile.system-app` 和 `Jenkinsfile.main-app.docker`）
- ❌ **全量构建**（`Jenkinsfile.all-apps`）

### 创建的独立构建 Jobs

脚本会创建以下 9 个独立应用的构建 jobs：

1. ✅ `btc-shopflow-deploy-admin-app` → `Jenkinsfile.admin-app`
2. ✅ `btc-shopflow-deploy-dashboard-app` → `Jenkinsfile.dashboard-app`
3. ✅ `btc-shopflow-deploy-engineering-app` → `Jenkinsfile.engineering-app`
4. ✅ `btc-shopflow-deploy-finance-app` → `Jenkinsfile.finance-app`
5. ✅ `btc-shopflow-deploy-logistics-app` → `Jenkinsfile.logistics-app`
6. ✅ `btc-shopflow-deploy-operations-app` → `Jenkinsfile.operations-app`
7. ✅ `btc-shopflow-deploy-personnel-app` → `Jenkinsfile.personnel-app`
8. ✅ `btc-shopflow-deploy-production-app` → `Jenkinsfile.production-app`
9. ✅ `btc-shopflow-deploy-quality-app` → `Jenkinsfile.quality-app`

## 前置要求

1. **Jenkins 已启动**并可以访问
2. **Java** 已安装（Jenkins CLI 需要 Java 运行）
3. **PowerShell**（Windows 自带）
4. **jenkins-cli.jar** 文件存在于 `jenkins/jenkins-cli.jar`

### 获取 Jenkins CLI JAR

如果 `jenkins-cli.jar` 不存在，可以从 Jenkins 服务器下载：

```powershell
# 使用 PowerShell 下载
Invoke-WebRequest -Uri "http://localhost:9000/jnlpJars/jenkins-cli.jar" -OutFile "jenkins\jenkins-cli.jar"
```

或者直接在浏览器中访问：`http://your-jenkins-url/jnlpJars/jenkins-cli.jar`

## 使用方法

### 基本用法

在项目根目录打开 PowerShell，运行：

```powershell
.\jenkins\create-individual-jobs-cli.ps1
```

### 指定 Jenkins URL

如果 Jenkins 不在默认地址（`http://localhost:9000`），可以指定：

```powershell
.\jenkins\create-individual-jobs-cli.ps1 -JenkinsUrl "http://10.80.8.199:9000"
```

### 使用认证

如果 Jenkins 启用了安全认证，需要提供用户名和密码：

```powershell
.\jenkins\create-individual-jobs-cli.ps1 -JenkinsUser "username" -JenkinsPassword "password"
```

### 完整参数示例

```powershell
.\jenkins\create-individual-jobs-cli.ps1 `
    -JenkinsUrl "http://localhost:9000" `
    -GitRepoUrl "https://github.com/BellisGit/btc-shopflow-monorepo.git" `
    -Branch "develop" `
    -JenkinsUser "admin" `
    -JenkinsPassword "admin-password" `
    -JenkinsCliPath ".\jenkins\jenkins-cli.jar"
```

### 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `JenkinsUrl` | Jenkins 服务器地址 | `http://localhost:9000` |
| `GitRepoUrl` | Git 仓库地址 | `https://github.com/BellisGit/btc-shopflow-monorepo.git` |
| `Branch` | Git 分支 | `develop` |
| `JenkinsUser` | Jenkins 用户名（可选） | 空 |
| `JenkinsPassword` | Jenkins 密码或 API Token（可选） | 空 |
| `JenkinsCliPath` | jenkins-cli.jar 文件路径 | `.\jenkins\jenkins-cli.jar` |

## 脚本执行流程

1. **检查前置条件**
   - 验证 `jenkins-cli.jar` 文件是否存在
   - 验证 Java 是否已安装

2. **连接 Jenkins**
   - 使用 Jenkins CLI 测试连接
   - 显示 Jenkins 版本信息

3. **批量创建 Jobs**
   - 遍历所有独立应用
   - 为每个应用生成配置 XML
   - 使用 Jenkins CLI 创建或更新 Job
   - 跳过已存在的 Jobs

4. **输出结果**
   - 显示创建成功的数量
   - 显示跳过的数量（已存在）
   - 显示失败的数量

## 验证结果

### 在 Jenkins Web UI 中查看

创建完成后，在 Jenkins 首页应该能看到所有创建的 Jobs：

```
btc-shopflow-deploy-admin-app
btc-shopflow-deploy-dashboard-app
btc-shopflow-deploy-engineering-app
btc-shopflow-deploy-finance-app
btc-shopflow-deploy-logistics-app
btc-shopflow-deploy-operations-app
btc-shopflow-deploy-personnel-app
btc-shopflow-deploy-production-app
btc-shopflow-deploy-quality-app
```

### 使用 Jenkins CLI 验证

```powershell
# 列出所有 jobs
java -jar .\jenkins\jenkins-cli.jar -s http://localhost:9000 list-jobs

# 查看特定 job 的配置
java -jar .\jenkins\jenkins-cli.jar -s http://localhost:9000 get-job btc-shopflow-deploy-admin-app
```

## 测试 Jobs

### 测试单个应用构建

1. 进入任意一个独立应用 Job（如 `btc-shopflow-deploy-admin-app`）
2. 点击 **Build with Parameters**
3. 检查参数是否正确
4. 配置服务器参数（如果需要）
5. 点击 **Build**

### 参数说明

每个 Job 包含以下可配置参数：

- `SERVER_HOST`: 服务器地址（默认: `47.112.31.96`）
- `SERVER_USER`: 服务器用户名（默认: `root`）
- `SERVER_PORT`: SSH 端口（默认: `22`）
- `SSH_KEY_PATH`: SSH 私钥路径（默认: `/var/jenkins_home/.ssh/id_rsa`）
- `SKIP_TESTS`: 是否跳过测试（默认: `true`）
- `CLEAN_BUILD`: 是否清理构建缓存（默认: `false`）
- `BUILD_SHARED_DEPS`: 是否构建共享依赖包（默认: `true`）
- `ENABLE_CDN`: 是否启用 CDN 加速（默认: `true`）
- `ENABLE_CDN_UPLOAD`: 是否启用 CDN 上传（默认: `false`）

## 常见问题

### Q: 脚本提示 "Jenkins CLI JAR 文件不存在"

**A:** 请下载 `jenkins-cli.jar` 文件：

```powershell
Invoke-WebRequest -Uri "http://your-jenkins-url/jnlpJars/jenkins-cli.jar" -OutFile "jenkins\jenkins-cli.jar"
```

### Q: 脚本提示 "未找到 Java"

**A:** 请安装 Java（JDK 或 JRE 均可）：

- 下载地址：https://www.oracle.com/java/technologies/downloads/
- 安装后确保 `java` 命令在系统 PATH 中

### Q: 脚本执行失败，提示权限错误

**A:** 如果 Jenkins 启用了安全认证，需要：

1. 确保提供了正确的用户名和密码
2. 检查用户是否有创建 Jobs 的权限：
   - **Overall** → **Administer**（推荐）
   - 或至少：**Job** → **Create**, **Job** → **Configure**, **Job** → **Read**

### Q: Job 创建成功但无法运行

**A:** 检查：

1. Git 仓库地址是否正确
2. 分支名称是否正确
3. Script Path 是否正确（应为 `jenkins/Jenkinsfile.xxx-app`）
4. 确保代码已推送到 Git 仓库

### Q: 如何删除已创建的 Jobs？

**A:** 使用 Jenkins CLI：

```powershell
java -jar .\jenkins\jenkins-cli.jar -s http://localhost:9000 delete-job btc-shopflow-deploy-admin-app
```

或者使用 Jenkins Web UI：

1. 进入 Job 页面
2. 点击左侧菜单的 **Delete Project**
3. 确认删除

### Q: 如何更新已存在的 Job？

**A:** 脚本会自动检测已存在的 Job 并尝试更新。如果需要强制更新，可以：

1. 先删除 Job
2. 重新运行脚本创建

或者使用 Jenkins CLI 手动更新：

```powershell
# 获取当前配置
java -jar .\jenkins\jenkins-cli.jar -s http://localhost:9000 get-job btc-shopflow-deploy-admin-app > config.xml

# 修改 config.xml 后更新
java -jar .\jenkins\jenkins-cli.jar -s http://localhost:9000 update-job btc-shopflow-deploy-admin-app < config.xml
```

## 与 REST API 脚本的区别

### create-individual-jobs-cli.ps1（本脚本）
- ✅ 使用 **Jenkins Java CLI**
- ✅ 需要 Java 环境
- ✅ 需要 `jenkins-cli.jar` 文件
- ✅ 命令行操作，适合自动化场景

### create-jobs.ps1（REST API 脚本）
- ✅ 使用 **Jenkins REST API**
- ✅ 不需要 Java（只使用 PowerShell）
- ✅ 不需要 CLI JAR 文件
- ✅ 纯 HTTP 请求，更轻量

两种方法都可以实现相同的功能，根据环境选择合适的方式。

## 下一步

创建完 Jobs 后，参考以下文档：

- `deployment-strategies.md` - 了解不同的部署策略
- `quick-start.md` - 快速开始指南
- `credentials-setup.md` - 配置部署凭证
- `create-jobs-guide.md` - 了解 REST API 方式的创建方法

## 脚本维护

如果需要添加新的独立构建应用：

1. 在 `jenkins/` 目录下创建对应的 `Jenkinsfile.xxx-app`
2. 编辑 `create-individual-jobs-cli.ps1`
3. 在 `$apps` 数组中添加新应用的配置：

```powershell
$apps = @(
    # ... 现有应用 ...
    @{ Name = "new-app"; Jenkinsfile = "Jenkinsfile.new-app" }
)
```

## 技术支持

如有问题，请检查：

1. Jenkins 日志：`http://your-jenkins-url/log/all`
2. PowerShell 错误输出
3. Jenkins CLI 版本兼容性
