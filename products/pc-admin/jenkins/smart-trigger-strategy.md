# Jenkins 智能触发策略配置说明

## 触发规则

### 1. 全量构建（btc-shopflow-deploy-all）

**触发条件**：
- ✅ `packages/` 目录变更（共享包更新）
- ✅ `configs/` 目录变更（配置文件更新）
- ✅ `scripts/` 目录变更（构建脚本更新）
- ✅ `jenkins/Jenkinsfile.all-apps` 变更

**不触发条件**：
- ❌ 只有单个应用（`apps/xxx-app/`）变更（应由对应的应用 Job 处理）

### 2. 单个应用构建（btc-shopflow-deploy-{app-name}）

**触发条件**：
- ✅ `apps/{app-name}/` 目录变更
- ✅ `jenkins/Jenkinsfile.{app-name}` 变更

**不触发条件**：
- ❌ 只有共享依赖（`packages/`, `configs/`）变更（应触发全量构建）

### 3. Docker 应用构建（btc-shopflow-deploy-{app-name}-docker）

**触发条件**：
- ✅ `apps/{app-name}/` 目录变更
- ✅ `jenkins/Jenkinsfile.{app-name}.docker` 变更

**不触发条件**：
- ❌ 只有共享依赖变更

## 实施状态

### ✅ 已更新

1. **Jenkinsfile.all-apps** - 全量构建，只监听共享包和配置变更
2. **Jenkinsfile.logistics-app** - 物流应用，只监听 logistics-app 变更
3. **Jenkinsfile.system-app** - 系统应用，只监听 system-app 变更
4. **Jenkinsfile.main-app.docker** - 系统应用 Docker 部署，只监听 system-app 变更

### ⏳ 待更新

#### 单个应用 Jenkinsfile（需要添加路径检查）：
- `Jenkinsfile.admin-app`
- `Jenkinsfile.dashboard-app`
- `Jenkinsfile.engineering-app`
- `Jenkinsfile.finance-app`
- `Jenkinsfile.operations-app`
- `Jenkinsfile.personnel-app`
- `Jenkinsfile.production-app`
- `Jenkinsfile.quality-app`

#### Docker 应用 Jenkinsfile（需要添加路径检查）：
- `Jenkinsfile.home-app.docker`
- `Jenkinsfile.layout-app.docker`

## 如何更新剩余的 Jenkinsfile

### 方法 1：手动更新（推荐）

1. 打开需要更新的 Jenkinsfile
2. 找到 `stages {` 块
3. 在第一个 `stage('Checkout')` 之前插入以下代码：

```groovy
stage('Check Changes') {
    steps {
        script {
            // 检查变更文件，只有应用相关变更时才构建
            echo "🔍 检查代码变更..."
            
            def changedFiles = ""
            if (isUnix()) {
                changedFiles = sh(
                    script: '''
                        if git rev-parse --verify HEAD~1 >/dev/null 2>&1; then
                            git diff --name-only HEAD~1 HEAD
                        else
                            git diff --name-only HEAD
                        fi
                    ''',
                    returnStdout: true
                ).trim()
            } else {
                changedFiles = bat(
                    script: '''
                        @echo off
                        git rev-parse --verify HEAD~1 >nul 2>&1
                        if %errorlevel% equ 0 (
                            git diff --name-only HEAD~1 HEAD
                        ) else (
                            git diff --name-only HEAD
                        )
                    ''',
                    returnStdout: true
                ).trim()
            }
            
            if (!changedFiles) {
                echo "⏭️  没有检测到变更，跳过构建"
                currentBuild.result = 'ABORTED'
                return
            }
            
            // 对于单个应用，使用：
            def triggerPaths = [
                "apps/${env.APP_NAME}/",
                "jenkins/Jenkinsfile.${env.APP_NAME}"
            ]
            
            // 对于 Docker 应用，使用：
            // def triggerPaths = [
            //     "apps/${env.APP_NAME}/",
            //     "jenkins/Jenkinsfile.${env.APP_NAME}.docker"
            // ]
            
            def sharedPaths = ["packages/", "configs/", "scripts/"]
            
            def shouldBuild = false
            def isSharedChange = false
            def changedFileList = changedFiles.split('\n')
            
            echo "📋 变更文件列表："
            for (file in changedFileList) {
                echo "  - ${file}"
                for (path in triggerPaths) {
                    if (file.contains(path)) {
                        shouldBuild = true
                        echo "    ✅ 匹配应用路径: ${path}"
                        break
                    }
                }
                if (!shouldBuild) {
                    for (path in sharedPaths) {
                        if (file.contains(path)) {
                            isSharedChange = true
                            echo "    ⚠️  检测到共享依赖变更: ${path}"
                            echo "    💡 提示：共享依赖变更应该触发全量构建（btc-shopflow-deploy-all）"
                            break
                        }
                    }
                }
            }
            
            if (!shouldBuild && isSharedChange) {
                echo "⏭️  只检测到共享依赖变更，应该触发全量构建而非单个应用构建"
                echo "💡 建议：共享包或配置变更时，使用 btc-shopflow-deploy-all Job"
                currentBuild.result = 'ABORTED'
                return
            }
            
            if (!shouldBuild) {
                echo "⏭️  变更文件不相关，跳过构建"
                echo "💡 提示：只有 ${env.APP_NAME} 相关变更才会触发此构建"
                currentBuild.result = 'ABORTED'
                return
            }
            
            echo "✅ 检测到 ${env.APP_NAME} 相关变更，继续构建"
        }
    }
}
```

### 方法 2：参考已更新的文件

可以参考以下已更新的文件：
- `Jenkinsfile.logistics-app` - 单个应用示例
- `Jenkinsfile.main-app.docker` - Docker 应用示例

## 测试验证

更新后，可以通过以下方式测试：

1. **测试单个应用变更**：
   - 修改 `apps/admin-app/src/xxx.vue`
   - 提交并推送
   - 应该只触发 `btc-shopflow-deploy-admin-app` Job

2. **测试共享依赖变更**：
   - 修改 `packages/shared-components/src/xxx.ts`
   - 提交并推送
   - 应该只触发 `btc-shopflow-deploy-all` Job
   - 不应该触发单个应用的 Job

3. **测试配置变更**：
   - 修改 `configs/xxx.ts`
   - 提交并推送
   - 应该只触发 `btc-shopflow-deploy-all` Job

## 注意事项

1. **首次提交**：如果是首次提交到仓库，`git diff HEAD~1 HEAD` 可能失败，代码已经处理了这种情况
2. **合并提交**：合并提交会包含多个文件的变更，路径检查会正确识别
3. **同时变更**：如果同时变更了应用代码和共享依赖，两个 Job 都会被触发（这是合理的）

## 总结

- ✅ **已实现**：全量构建、logistics-app、system-app、main-app.docker
- ⏳ **待完成**：其余 8 个单个应用 + 2 个 Docker 应用
- 📋 **参考**：使用已更新的文件作为模板
- 🔍 **测试**：修改代码后验证触发逻辑是否正确

