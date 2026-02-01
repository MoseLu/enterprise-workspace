# SCM 轮询 vs 手动构建的差异分析

## 问题描述

通过 SCM 轮询自动触发的构建可能出现错误，而手动构建则正常工作。这是为什么？

## 根本原因

### 关键差异：Jenkinsfile 的加载方式

当 Jenkins Job 配置为 **"Pipeline script from SCM"** 时，存在两种不同的执行路径：

#### 1. **SCM 轮询触发（自动构建）**

```
触发流程：
1. Jenkins 定时器触发轮询检查
2. Jenkins 发现代码仓库有新提交
3. Jenkins 从 SCM 检出 Jenkinsfile（指定的 Script Path，如 `jenkins/Jenkinsfile.logistics-app`）
4. Jenkins 解析并执行这个 Jenkinsfile
5. 在 Jenkinsfile 的 Checkout stage 中，再次执行 `checkout scm` 检出实际代码
```

**关键点**：
- Jenkinsfile **必须存在于代码仓库中**
- Jenkinsfile 是从 **Git 仓库的最新版本** 中检出的
- 如果在 Jenkinsfile 中有语法错误或配置问题，会导致构建失败

#### 2. **手动构建**

```
触发流程：
1. 用户点击 "Build Now" 按钮
2. Jenkins 使用**当前已加载的 Jenkinsfile**（可能来自上次成功构建时的缓存）
3. 执行 Jenkinsfile，在 Checkout stage 中执行 `checkout scm` 检出代码
```

**关键点**：
- 可能使用**缓存的 Jenkinsfile 版本**
- 不会先检查 SCM 中的 Jenkinsfile 是否有更新
- 如果 Jenkinsfile 在仓库中被修改了，但还没有被加载，手动构建仍使用旧版本

## 常见问题和解决方案

### 问题 1：Jenkinsfile 路径错误

**症状**：SCM 轮询失败，手动构建正常

**原因**：Jenkins 在 SCM 中找不到指定的 Jenkinsfile 路径

**解决**：
1. 检查 Job 配置中的 **Script Path** 是否正确（如 `jenkins/Jenkinsfile.logistics-app`）
2. 确保该文件已提交到 Git 仓库
3. 检查分支配置是否正确

### 问题 2：Jenkinsfile 语法错误

**症状**：SCM 轮询失败，错误信息显示 Jenkinsfile 解析失败

**原因**：Jenkinsfile 中有语法错误或配置问题

**解决**：
1. 检查 Jenkinsfile 语法
2. 使用 Jenkins 的 "Declarative Pipeline Linter" 验证语法
3. 查看构建日志中的具体错误信息

### 问题 3：环境变量或参数差异

**症状**：SCM 轮询时某些变量未定义或值不同

**原因**：SCM 轮询时可能使用默认参数值，而手动构建时可以使用自定义参数

**解决**：
1. 在 Jenkinsfile 中设置合理的默认参数值
2. 使用 `when` 条件判断构建触发方式
3. 确保所有必要的参数都有默认值

### 问题 4：工作目录或工作空间差异

**症状**：文件路径找不到或权限问题

**原因**：SCM 轮询可能使用不同的工作空间

**解决**：
1. 使用相对路径而非绝对路径
2. 确保所有文件路径基于工作空间根目录
3. 检查文件权限设置

## 验证方法

### 方法 1：检查 Jenkinsfile 是否在仓库中

```bash
# 在本地仓库中检查
git ls-files | grep Jenkinsfile
```

确保所有 Jenkinsfile 都已提交到仓库。

### 方法 2：检查 Script Path 配置

1. 进入 Job 配置页面
2. 查看 **Pipeline** → **Definition** → **Script Path**
3. 确保路径与仓库中的实际路径匹配

### 方法 3：查看构建日志

比较手动构建和 SCM 轮询构建的日志：

1. **手动构建日志**：查看开头部分，看 Jenkinsfile 是从哪里加载的
2. **SCM 轮询构建日志**：查看是否有 "Checking for changes" 或 "Found changes" 信息

## 最佳实践

### 1. 始终使用 SCM 中的 Jenkinsfile

✅ **推荐**：使用 "Pipeline script from SCM"
- Jenkinsfile 版本控制
- 所有构建使用相同的脚本
- 易于追踪变更

❌ **不推荐**：直接在 Jenkins UI 中编写 Pipeline script
- 无法版本控制
- 容易丢失配置

### 2. 在 Jenkinsfile 中添加错误处理

```groovy
pipeline {
    agent any
    
    options {
        timeout(time: 30, unit: 'MINUTES')
        retry(2)  // 失败时自动重试
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    try {
                        checkout scm
                    } catch (Exception e) {
                        echo "❌ Checkout 失败: ${e.getMessage()}"
                        currentBuild.result = 'FAILURE'
                        throw e
                    }
                }
            }
        }
        // ... 其他 stages
    }
}
```

### 3. 使用参数化构建

```groovy
parameters {
    string(name: 'BRANCH', defaultValue: env.BRANCH_NAME ?: 'main', description: '构建分支')
    booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: '是否跳过测试')
}
```

这样可以确保手动构建和自动构建使用相同的参数逻辑。

### 4. 验证 Jenkinsfile 语法

在提交前验证 Jenkinsfile：

```bash
# 使用 Jenkins CLI 验证（如果可用）
java -jar jenkins-cli.jar -s http://your-jenkins-url declarative-linter < Jenkinsfile
```

或在 Jenkins UI 中使用 "Pipeline Syntax" → "Declarative Pipeline Linter"

## 调试步骤

如果遇到 SCM 轮询失败但手动构建正常的情况：

1. **检查构建日志**
   - 查看 SCM 轮询构建的完整日志
   - 找出第一个错误点

2. **验证 Jenkinsfile 路径**
   ```bash
   # 在仓库中确认文件存在
   ls -la jenkins/Jenkinsfile.logistics-app
   ```

3. **测试手动轮询**
   - 在 Job 配置页面点击 "Poll Now"
   - 观察是否触发构建以及构建是否成功

4. **检查 Git 配置**
   - 确认 Jenkins 可以访问仓库
   - 检查分支配置是否正确

5. **对比构建日志**
   - 比较成功的手动构建和失败的 SCM 轮询构建
   - 找出差异点

## 总结

**SCM 轮询和手动构建使用的是同一个 Jenkinsfile，但加载方式不同**：

- **SCM 轮询**：每次都从 SCM 检出最新的 Jenkinsfile
- **手动构建**：可能使用缓存的 Jenkinsfile

**如果 SCM 轮询失败而手动构建成功，通常是因为**：
1. Jenkinsfile 在仓库中有问题（语法错误、路径错误等）
2. 环境或参数配置差异
3. Git 检出相关问题

**解决建议**：
1. 确保 Jenkinsfile 已正确提交到仓库
2. 验证 Jenkinsfile 语法
3. 检查 Script Path 配置
4. 查看详细的构建日志找出根本原因

