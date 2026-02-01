# 主应用（system-app）单独构建部署指南

## 概述

主应用（system-app）是微前端架构的容器应用，负责：
- 提供微前端基座（qiankun）
- 管理子应用的加载和切换
- 提供系统管理功能
- 作为其他子应用的基础依赖

**建议优先部署主应用**，因为其他子应用可能依赖主应用的更新。

## 创建 Jenkins Job

### 方法 1：使用 Jenkins Web UI

1. **创建新的 Pipeline Job**
   - 登录 Jenkins
   - 点击 "新建 Item"
   - 输入 Job 名称：`btc-shopflow-deploy-system-app`
   - 选择 "Pipeline"
   - 点击 "OK"

2. **配置 Pipeline**
   - 在 "Pipeline" 部分，选择 "Pipeline script from SCM"
   - **SCM**: 选择 "Git"
   - **Repository URL**: 输入你的 Git 仓库地址
   - **Credentials**: 选择相应的 Git 凭证（如果需要）
   - **Branches to build**: 输入分支（如 `*/main` 或 `*/master`）
   - **Script Path**: 输入 `jenkins/Jenkinsfile.system-app`
   - 点击 "Save"

3. **配置参数（可选）**
   - 构建参数会在首次构建后自动创建
   - 可以在 Job 配置页面的 "This project is parameterized" 部分查看和修改

### 方法 2：使用 PowerShell 脚本（Windows）

```powershell
# 使用项目提供的创建脚本
cd btc-shopflow-monorepo
.\jenkins\create-jobs.ps1 -JobName "btc-shopflow-deploy-system-app" -JenkinsfilePath "jenkins/Jenkinsfile.system-app"
```

### 方法 3：使用 Shell 脚本（Linux/Unix）

```bash
# 使用项目提供的创建脚本
cd btc-shopflow-monorepo
bash jenkins/setup-jenkins-job.sh btc-shopflow-deploy-system-app jenkins/Jenkinsfile.system-app
```

## 构建参数说明

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `SERVER_HOST` | String | `47.112.31.96` | 部署服务器地址 |
| `SERVER_USER` | String | `root` | SSH 用户名 |
| `SERVER_PORT` | String | `22` | SSH 端口 |
| `SSH_KEY_PATH` | String | `/var/jenkins_home/.ssh/id_rsa` | SSH 私钥路径（Jenkins 服务器上的路径） |
| `SKIP_TESTS` | Boolean | `true` | 是否跳过测试（加快构建速度） |
| `CLEAN_BUILD` | Boolean | `false` | 是否清理构建缓存（强制重新构建） |
| `BUILD_SHARED_DEPS` | Boolean | `true` | 是否构建共享依赖包（@btc/* 包） |
| `ENABLE_CDN` | Boolean | `true` | 是否启用 CDN 加速（将资源 URL 转换为 CDN 地址） |
| `ENABLE_CDN_UPLOAD` | Boolean | `false` | 是否启用 CDN 上传（将构建产物上传到 CDN，需要配置 CDN 凭证） |

## 构建流程

1. **Checkout** - 检出代码
2. **Setup Environment** - 设置 Node.js 和 pnpm 环境
3. **Install Dependencies** - 安装项目依赖
4. **Build Shared Dependencies** - 构建共享依赖包（可选，默认启用）
   - @btc/vite-plugin
   - @btc/shared-utils
   - @btc/shared-core
   - @btc/shared-components
   - @btc/subapp-manifests
5. **Lint & Type Check** - 代码检查和类型检查（可选）
6. **Test** - 运行测试（可选）
7. **Build** - 构建主应用
   - 执行 `pnpm build:system`
   - 执行 `node scripts/build-to-dist.mjs --app system-app`
8. **Verify Build Artifacts** - 验证构建产物
   - 检查 `dist/bellis.com.cn` 目录
   - 验证关键文件（index.html, assets 等）
9. **Deploy** - 部署到服务器
   - 使用 `scripts/deploy-static.sh --app system-app`
10. **Post-Deploy Verification** - 部署后验证提示

## 构建产物

构建完成后，主应用的构建产物位于：
- **目录**: `dist/bellis.com.cn/`
- **域名**: `bellis.com.cn`

## 部署验证

部署完成后，建议验证以下内容：

1. **主应用页面是否正常加载**
   - 访问：`https://bellis.com.cn`
   - 检查页面是否正常显示

2. **子应用是否能正常加载**
   - 检查子应用路由是否正常工作
   - 验证子应用切换功能

3. **微前端路由是否正常工作**
   - 测试应用间路由跳转
   - 验证 qiankun 容器是否正常

## 常见问题

### 1. 构建失败：找不到 rollup.config.ts

**问题**: 构建时出现 `Could not resolve "../build/rollup.config.ts"` 错误

**解决方案**: 确保 `configs/vite/factories/subapp.config.ts` 和 `mainapp.config.ts` 中的导入路径包含 `.ts` 扩展名：
```typescript
import { createRollupConfig } from '../build/rollup.config.ts';
```

### 2. SSH 连接失败

**问题**: 部署阶段 SSH 连接失败

**解决方案**:
- 检查 SSH 密钥路径是否正确
- 确保 SSH 密钥权限为 600：`chmod 600 /path/to/id_rsa`
- 验证服务器地址、用户名、端口是否正确
- 测试 SSH 连接：`ssh -i /path/to/id_rsa -p 22 root@47.112.31.96`

### 3. 构建产物验证失败

**问题**: 构建产物不存在或为空

**解决方案**:
- 检查构建日志，确认构建是否成功
- 验证 `dist/bellis.com.cn` 目录是否存在
- 检查 `scripts/build-to-dist.mjs` 脚本是否正常执行

### 4. 共享依赖构建失败

**问题**: 共享依赖包构建失败，但应用构建继续

**说明**: 这是正常行为，共享依赖构建失败不会阻止应用构建。但如果应用构建也失败，可能需要：
- 检查共享依赖包的构建日志
- 手动构建共享依赖：`pnpm --filter @btc/shared-components run build`
- 设置 `BUILD_SHARED_DEPS=false` 跳过共享依赖构建（如果依赖已存在）

## 与其他 Job 的配合

### 部署顺序建议

1. **优先部署主应用**（system-app）
   - 主应用是微前端容器，其他应用依赖它

2. **然后部署子应用**
   - 可以使用 `Jenkinsfile.all-apps` 并行部署所有子应用
   - 或使用 `Jenkinsfile.single-app` 单独部署某个子应用

### 触发其他 Job

如果需要部署主应用后自动触发子应用部署，可以在 Jenkins 中配置：
- 在 "Post-build Actions" 中添加 "Trigger parameterized build on other projects"
- 配置要触发的子应用 Job

## 相关文档

- [Jenkins 部署策略对比](./deployment-strategy-comparison.md)
- [单应用部署指南](./Jenkinsfile.single-app)（查看文件注释）
- [全量应用部署指南](./Jenkinsfile.all-apps)（查看文件注释）
- [创建 Jobs 指南](./create-jobs-guide.md)

## 技术支持

如遇到问题，请：
1. 查看 Jenkins 构建日志
2. 检查服务器部署日志
3. 参考项目文档
4. 联系开发团队

