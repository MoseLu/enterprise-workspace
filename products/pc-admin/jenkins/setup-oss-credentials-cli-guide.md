# Jenkins OSS 凭证配置脚本使用指南

## 概述

`setup-oss-credentials-cli.ps1` 脚本用于通过 Jenkins CLI 自动配置 OSS 凭证到 Jenkins。脚本会从环境变量或命令行参数读取 OSS 凭证，并通过 Jenkins CLI 创建或更新 Jenkins Credentials。

## 前置要求

1. **Jenkins 正在运行且可访问**
2. **Java 已安装**（Jenkins CLI 需要 Java 运行）
3. **jenkins-cli.jar 文件存在**（脚本会自动查找，或手动指定路径）
4. **OSS 凭证**（AccessKey ID 和 AccessKey Secret）

## 使用方法

### 方式 1：从环境变量读取（推荐）

1. **设置环境变量**：
   ```powershell
   $env:OSS_ACCESS_KEY_ID = "your_access_key_id"
   $env:OSS_ACCESS_KEY_SECRET = "your_access_key_secret"
   ```

2. **运行脚本**：
   ```powershell
   cd btc-shopflow-monorepo
   .\jenkins\setup-oss-credentials-cli.ps1
   ```

### 方式 2：通过命令行参数传入

```powershell
.\jenkins\setup-oss-credentials-cli.ps1 -AccessKeyId "your_access_key_id" -AccessKeySecret "your_access_key_secret"
```

### 方式 3：指定 Jenkins URL 和认证信息

```powershell
.\jenkins\setup-oss-credentials-cli.ps1 `
    -JenkinsUrl "http://localhost:9000" `
    -JenkinsUser "username" `
    -JenkinsPassword "password" `
    -AccessKeyId "your_access_key_id" `
    -AccessKeySecret "your_access_key_secret"
```

## 参数说明

| 参数 | 说明 | 默认值 | 必需 |
|------|------|--------|------|
| `-JenkinsUrl` | Jenkins 服务器地址 | `http://localhost:9000` | 否 |
| `-JenkinsUser` | Jenkins 用户名 | 空（无认证） | 否 |
| `-JenkinsPassword` | Jenkins 密码或 API Token | 空（无认证） | 否 |
| `-JenkinsCliPath` | jenkins-cli.jar 文件路径 | 自动查找 | 否 |
| `-AccessKeyId` | OSS AccessKey ID | 从环境变量读取 | 是* |
| `-AccessKeySecret` | OSS AccessKey Secret | 从环境变量读取 | 是* |
| `-JavaCmd` | Java 命令路径 | `java` | 否 |

*如果未通过参数提供，必须设置环境变量 `OSS_ACCESS_KEY_ID` 和 `OSS_ACCESS_KEY_SECRET`

## 配置的凭证

脚本会创建以下两个 Jenkins Credentials：

1. **oss-access-key-id**
   - 类型：Secret text
   - 描述：阿里云 OSS AccessKey ID
   - ID：`oss-access-key-id`

2. **oss-access-key-secret**
   - 类型：Secret text
   - 描述：阿里云 OSS AccessKey Secret
   - ID：`oss-access-key-secret`

## 工作流程

1. 检查前置条件（Java、jenkins-cli.jar）
2. 读取 OSS 凭证（从环境变量或参数）
3. 为每个凭证生成 XML 配置
4. 通过 Jenkins CLI 创建凭证
5. 如果凭证已存在，先删除后重新创建（更新）
6. 输出配置结果

## 示例输出

```
[INFO] 开始配置 Jenkins OSS 凭证...
[INFO] Jenkins URL: http://localhost:9000

[INFO] Java 已安装: openjdk version "17.0.1"
[INFO] OSS AccessKey ID: LTAI5t...
[INFO] OSS AccessKey Secret: xxx...

[INFO] 正在创建凭证: oss-access-key-id
[SUCCESS] 凭证 'oss-access-key-id' 创建成功

[INFO] 正在创建凭证: oss-access-key-secret
[SUCCESS] 凭证 'oss-access-key-secret' 创建成功

[SUCCESS] 所有 OSS 凭证配置完成！
[INFO] 已配置的凭证:
  - oss-access-key-id
  - oss-access-key-secret

[INFO] 现在可以在 Jenkins Pipeline 中使用这些凭证进行 CDN 上传了
```

## 验证配置

配置完成后，可以通过以下方式验证：

1. **在 Jenkins Web UI 中验证**：
   - 登录 Jenkins
   - 进入 **Manage Jenkins** → **Credentials** → **System** → **Global credentials (unrestricted)**
   - 查看是否存在 `oss-access-key-id` 和 `oss-access-key-secret`

2. **运行一次构建**：
   - 运行 `logistics-app` 或其他应用的构建
   - 检查构建日志，应该看到 "✅ OSS 凭证已配置，将上传到 CDN" 而不是警告信息

## 故障排除

### 错误：Jenkins CLI JAR 文件不存在

**解决方案**：
1. 从 Jenkins 服务器下载 jenkins-cli.jar：
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:9000/jnlpJars/jenkins-cli.jar" -OutFile "jenkins\jenkins-cli.jar"
   ```

2. 或指定正确的路径：
   ```powershell
   .\setup-oss-credentials-cli.ps1 -JenkinsCliPath "完整路径\jenkins-cli.jar"
   ```

### 错误：未找到 Java

**解决方案**：
- 确保 Java 已安装并添加到系统 PATH 环境变量中
- 或使用 `-JavaCmd` 参数指定 Java 的完整路径

### 错误：OSS 凭证未设置

**解决方案**：
- 设置环境变量：
  ```powershell
  $env:OSS_ACCESS_KEY_ID = "your_access_key_id"
  $env:OSS_ACCESS_KEY_SECRET = "your_access_key_secret"
  ```
- 或通过参数传入：
  ```powershell
  .\setup-oss-credentials-cli.ps1 -AccessKeyId "xxx" -AccessKeySecret "xxx"
  ```

### 错误：凭证创建失败（权限不足）

**解决方案**：
- 确保 Jenkins 用户具有创建和管理 Credentials 的权限
- 检查 Jenkins 用户是否有 "Credentials" 相关的权限

### 错误：凭证已存在

**解决方案**：
- 脚本会自动处理：如果凭证已存在，会先删除后重新创建（更新）
- 如果更新失败，可以手动在 Jenkins Web UI 中删除旧凭证后重新运行脚本

## 安全建议

1. **使用 API Token 而非密码**：
   - 在 Jenkins 用户配置页面生成 API Token
   - 使用 API Token 作为 `-JenkinsPassword` 参数值

2. **保护凭证信息**：
   - 不要在脚本中硬编码凭证
   - 使用环境变量或安全的凭证管理工具
   - 不要将包含凭证的脚本提交到版本控制系统

3. **最小权限原则**：
   - OSS AccessKey 应该只具有必要的权限（上传到指定 Bucket）
   - 不要使用具有过高权限的 AccessKey

## 相关文档

- [Jenkins Credentials 配置指南](./credentials-setup.md)
- [Jenkinsfile.logistics-app](./Jenkinsfile.logistics-app)

