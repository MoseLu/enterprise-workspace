# 批量更新所有 Jenkinsfile 添加路径过滤功能
# 使用方法: .\jenkins\update-jenkinsfiles-path-filter.ps1

$ErrorActionPreference = "Stop"

# 定义需要更新的单个应用 Jenkinsfile
$appJenkinsfiles = @(
    'jenkins/Jenkinsfile.admin-app',
    'jenkins/Jenkinsfile.dashboard-app',
    'jenkins/Jenkinsfile.engineering-app',
    'jenkins/Jenkinsfile.finance-app',
    'jenkins/Jenkinsfile.operations-app',
    'jenkins/Jenkinsfile.personnel-app',
    'jenkins/Jenkinsfile.production-app',
    'jenkins/Jenkinsfile.quality-app'
)

# 定义需要更新的 Docker 应用 Jenkinsfile
$dockerJenkinsfiles = @(
    'jenkins/Jenkinsfile.home-app.docker',
    'jenkins/Jenkinsfile.layout-app.docker'
)

Write-Host "📝 批量更新 Jenkinsfile 添加路径过滤功能" -ForegroundColor Cyan
Write-Host ""

# 路径检查代码块（用于单个应用）
$checkChangesStage = @'
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
                    
                    def triggerPaths = [
                        "apps/${env.APP_NAME}/",
                        "jenkins/Jenkinsfile.${env.APP_NAME}"
                    ]
                    
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
        
'@

# 路径检查代码块（用于 Docker 应用）
$checkChangesStageDocker = @'
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
                    
                    def triggerPaths = [
                        "apps/${env.APP_NAME}/",
                        "jenkins/Jenkinsfile.${env.APP_NAME}.docker"
                    ]
                    
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
                        echo "⏭️  只检测到共享依赖变更，应该触发全量构建而非 Docker 应用构建"
                        currentBuild.result = 'ABORTED'
                        return
                    }
                    
                    if (!shouldBuild) {
                        echo "⏭️  变更文件不相关，跳过构建"
                        echo "💡 提示：只有 ${env.APP_NAME} 相关变更才会触发此 Docker 构建"
                        currentBuild.result = 'ABORTED'
                        return
                    }
                    
                    echo "✅ 检测到 ${env.APP_NAME} 相关变更，继续 Docker 构建"
                }
            }
        }
        
'@

Write-Host "✅ 已准备路径检查代码块" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  注意：此脚本仅生成代码片段，需要手动将代码插入到各个 Jenkinsfile 中" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 需要更新的文件：" -ForegroundColor Cyan
Write-Host "  - 已更新：Jenkinsfile.all-apps, Jenkinsfile.logistics-app, Jenkinsfile.system-app, Jenkinsfile.main-app.docker" -ForegroundColor Green
Write-Host "  - 待更新：单个应用 Jenkinsfile (${appJenkinsfiles.Count} 个)" -ForegroundColor Yellow
Write-Host "  - 待更新：Docker 应用 Jenkinsfile (${dockerJenkinsfiles.Count} 个)" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 使用方法：" -ForegroundColor Cyan
Write-Host "  1. 在每个 Jenkinsfile 的 'stages {' 之后、" -ForegroundColor White
Write-Host "  2. 第一个 'stage('Checkout')' 之前插入路径检查代码块" -ForegroundColor White
Write-Host "  3. 对于 Docker 应用，使用 Docker 版本的代码块" -ForegroundColor White

