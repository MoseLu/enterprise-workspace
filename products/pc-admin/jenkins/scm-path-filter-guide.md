# Jenkins SCM 路径过滤触发指南

## 当前状态

### 问题：全部触发

**当前配置**：所有 Jenkinsfile 都使用 `pollSCM('H/2 * * * *')`，这意味着：

- ❌ **所有 Job 都会被触发**：当仓库有任何变更时，所有配置了 `pollSCM` 的 Job 都会触发构建
- ❌ **资源浪费**：即使只修改了 `logistics-app`，所有应用的 Job 都会触发
- ❌ **构建队列拥堵**：多个无关的构建同时运行

**示例场景**：
- 修改了 `apps/logistics-app/src/xxx.vue`
- 结果：所有 15+ 个应用的 Job 都被触发（system-app, admin-app, logistics-app, quality-app 等）

## 解决方案

### 方案 1：使用 `when` + `changeset` 条件（推荐）

在 Jenkinsfile 中添加路径过滤，只有当相关文件变更时才执行构建：

```groovy
pipeline {
    agent any
    
    triggers {
        pollSCM('H/2 * * * *')  // 每 2 分钟检查一次
    }
    
    stages {
        stage('Check Changes') {
            steps {
                script {
                    // 检查变更的文件路径
                    def changes = sh(
                        script: 'git diff --name-only HEAD~1 HEAD',
                        returnStdout: true
                    ).trim()
                    
                    // 定义应用相关的路径
                    def appPaths = [
                        "apps/logistics-app/",
                        "packages/",  // 共享包变更也会触发
                        "configs/",  // 配置变更也会触发
                        "jenkins/Jenkinsfile.logistics-app"  // Jenkinsfile 变更也会触发
                    ]
                    
                    // 检查是否有相关变更
                    def shouldBuild = false
                    for (path in appPaths) {
                        if (changes.contains(path)) {
                            shouldBuild = true
                            break
                        }
                    }
                    
                    if (!shouldBuild) {
                        echo "⏭️  没有相关文件变更，跳过构建"
                        currentBuild.result = 'ABORTED'
                        return
                    }
                    
                    echo "✅ 检测到相关文件变更，继续构建"
                }
            }
        }
        
        // ... 其他 stages
    }
}
```

**优点**：
- ✅ 精确触发：只构建变更的应用
- ✅ 无需额外配置：只需修改 Jenkinsfile
- ✅ 支持共享依赖：可以配置共享包变更时也触发

**缺点**：
- ⚠️ 仍然会触发 Job（但会快速中止），占用少量资源
- ⚠️ 需要每个 Jenkinsfile 单独配置

### 方案 2：使用 GitHub Webhook + 路径过滤（最佳方案）

使用 GitHub Webhook 可以实现更精确的触发控制：

#### 2.1 在 Jenkins 中配置 Webhook 接收

1. 安装插件：**GitHub Plugin** 和 **GitHub Branch Source Plugin**
2. 在 Job 配置中：
   - 勾选 **"GitHub hook trigger for GITScm polling"**
   - 或使用 **"Build when a change is pushed to GitHub"**

#### 2.2 在 GitHub 中配置 Webhook

1. 进入仓库设置 → Webhooks → Add webhook
2. 配置：
   - **Payload URL**: `http://your-jenkins-url/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: 选择 `Just the push event`
   - **Active**: 勾选

#### 2.3 在 Jenkinsfile 中添加路径过滤

```groovy
pipeline {
    agent any
    
    triggers {
        // 使用 GitHub Webhook 触发（需要配置 Webhook）
        githubPush()
    }
    
    stages {
        stage('Checkout') {
            when {
                // 只处理特定路径的变更
                anyOf {
                    changeset "apps/logistics-app/**"
                    changeset "packages/**"
                    changeset "configs/**"
                    changeset "jenkins/Jenkinsfile.logistics-app"
                }
            }
            steps {
                checkout scm
            }
        }
        
        // ... 其他 stages
    }
}
```

**优点**：
- ✅ 精确触发：只触发相关 Job
- ✅ 实时响应：推送后立即触发（秒级）
- ✅ 减少负载：不轮询，按需触发
- ✅ 路径过滤：在 Pipeline 层面过滤

**缺点**：
- ⚠️ 需要配置 Webhook（需要 Jenkins 可被 GitHub 访问）
- ⚠️ 需要网络配置（如果 Jenkins 在本地）

### 方案 3：使用 `when` + `changeset` 语法（简化版）

使用 Jenkins Pipeline 的内置 `changeset` 语法：

```groovy
pipeline {
    agent any
    
    triggers {
        pollSCM('H/2 * * * *')
    }
    
    stages {
        stage('Build') {
            when {
                anyOf {
                    changeset "apps/logistics-app/**"
                    changeset "packages/**"
                    changeset "configs/**"
                    changeset "jenkins/Jenkinsfile.logistics-app"
                }
            }
            steps {
                echo "构建 logistics-app"
                // ... 构建步骤
            }
        }
    }
}
```

**优点**：
- ✅ 语法简洁
- ✅ 内置支持，无需额外脚本

**缺点**：
- ⚠️ 仍然会触发 Job（但 stage 会被跳过）
- ⚠️ 需要 Jenkins 2.0+ 支持

## 推荐配置

### 对于当前项目（btc-shopflow-monorepo）

**推荐使用方案 1（when + changeset）**，因为：
1. 无需额外网络配置
2. 可以精确控制哪些文件变更触发构建
3. 可以处理共享依赖的情况

### 示例：更新 logistics-app 的 Jenkinsfile

```groovy
pipeline {
    agent any
    
    environment {
        APP_NAME = 'logistics-app'
    }
    
    triggers {
        pollSCM('H/2 * * * *')
    }
    
    stages {
        stage('Check Changes') {
            steps {
                script {
                    // 获取最近一次提交的变更文件
                    def changedFiles = sh(
                        script: 'git diff --name-only HEAD~1 HEAD 2>/dev/null || git diff --name-only HEAD',
                        returnStdout: true
                    ).trim()
                    
                    if (!changedFiles) {
                        echo "⏭️  没有检测到变更，跳过构建"
                        currentBuild.result = 'ABORTED'
                        return
                    }
                    
                    // 定义需要触发构建的路径
                    def relevantPaths = [
                        "apps/${env.APP_NAME}/",
                        "packages/",
                        "configs/",
                        "scripts/",
                        "jenkins/Jenkinsfile.${env.APP_NAME}"
                    ]
                    
                    def shouldBuild = false
                    for (path in relevantPaths) {
                        if (changedFiles.contains(path)) {
                            shouldBuild = true
                            echo "✅ 检测到相关变更: ${path}"
                            break
                        }
                    }
                    
                    if (!shouldBuild) {
                        echo "⏭️  变更文件不相关，跳过构建"
                        echo "变更文件列表："
                        changedFiles.split('\n').each { file ->
                            echo "  - ${file}"
                        }
                        currentBuild.result = 'ABORTED'
                        return
                    }
                    
                    echo "✅ 检测到相关文件变更，继续构建"
                }
            }
        }
        
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        // ... 其他构建 stages
    }
}
```

## 路径映射规则

建议的路径映射规则：

| 应用 | 触发路径 |
|------|---------|
| `system-app` | `apps/system-app/**`, `packages/**`, `configs/**`, `jenkins/Jenkinsfile.system-app` |
| `logistics-app` | `apps/logistics-app/**`, `packages/**`, `configs/**`, `jenkins/Jenkinsfile.logistics-app` |
| `admin-app` | `apps/admin-app/**`, `packages/**`, `configs/**`, `jenkins/Jenkinsfile.admin-app` |
| ... | ... |

**共享依赖处理**：
- `packages/**` 变更 → 触发所有应用（因为所有应用都依赖共享包）
- `configs/**` 变更 → 触发所有应用（配置变更影响所有应用）
- `scripts/**` 变更 → 触发所有应用（构建脚本变更）

## 实施步骤

1. **选择一个方案**（推荐方案 1）
2. **更新所有 Jenkinsfile**，添加路径过滤逻辑
3. **测试验证**：
   - 修改某个应用的代码
   - 确认只有该应用的 Job 被触发
   - 修改共享包代码
   - 确认所有应用的 Job 都被触发
4. **监控构建日志**，确保过滤逻辑正常工作

## 注意事项

1. **首次提交**：如果使用 `git diff HEAD~1 HEAD`，首次提交可能无法检测变更，建议使用 `git diff HEAD` 作为备选
2. **合并提交**：合并提交可能包含多个文件的变更，需要正确处理
3. **共享依赖**：共享包（`packages/`）变更时，可能需要触发所有应用
4. **Jenkinsfile 变更**：Jenkinsfile 本身的变更也应该触发构建（用于测试配置）

## 总结

- **当前状态**：全部触发（所有 Job 都会触发）
- **目标状态**：精确触发（只触发相关应用的 Job）
- **推荐方案**：使用 `when` + `changeset` 条件过滤
- **最佳方案**：使用 GitHub Webhook + 路径过滤（需要网络配置）

