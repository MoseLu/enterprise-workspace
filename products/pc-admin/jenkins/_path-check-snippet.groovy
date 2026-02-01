// 路径检查代码片段（用于复制到各个 Jenkinsfile）
// 在 stages 块的第一个 stage 之前插入此代码

stage('Check Changes') {
    steps {
        script {
            // 检查变更文件，只有应用相关变更时才构建
            echo "🔍 检查代码变更..."
            
            def changedFiles = ""
            if (isUnix()) {
                changedFiles = sh(
                    script: '''
                        # 尝试获取最近一次提交的变更文件
                        if git rev-parse --verify HEAD~1 >/dev/null 2>&1; then
                            git diff --name-only HEAD~1 HEAD
                        else
                            # 如果没有上一个提交，检查工作区的变更
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
            
            // 定义需要触发构建的路径
            def triggerPaths = [
                "apps/${env.APP_NAME}/",  // 应用代码变更
                "jenkins/Jenkinsfile.${env.APP_NAME}"  // Jenkinsfile 变更
            ]
            
            // 共享依赖变更时提示（通常应该触发全量构建）
            def sharedPaths = [
                "packages/",
                "configs/",
                "scripts/"
            ]
            
            def shouldBuild = false
            def isSharedChange = false
            def changedFileList = changedFiles.split('\n')
            
            echo "📋 变更文件列表："
            for (file in changedFileList) {
                echo "  - ${file}"
                // 检查是否是应用相关变更
                for (path in triggerPaths) {
                    if (file.contains(path)) {
                        shouldBuild = true
                        echo "    ✅ 匹配应用路径: ${path}"
                        break
                    }
                }
                // 检查是否是共享依赖变更
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

