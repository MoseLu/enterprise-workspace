pipeline {
    agent any
    
    // 环境变量配置
    environment {
        // Node.js 版本
        NODE_VERSION = '20'
        // pnpm 版本
        PNPM_VERSION = '8.15.0'
        // 部署配置路径
        DEPLOY_CONFIG = 'deploy.config.json'
    }
    
    options {
        // 构建超时时间（30分钟）
        timeout(time: 30, unit: 'MINUTES')
        // 保留最近10次构建
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // 构建标签
        timestamps()
    }
    
    parameters {
        // 选择要部署的应用（多选）
        choice(
            name: 'APP_NAME',
            choices: [
                'system-app',
                'admin-app',
                'logistics-app',
                'quality-app',
                'production-app',
                'engineering-app',
                'finance-app',
                'mobile-app',
                'all'
            ],
            description: '选择要部署的应用（选择 all 部署所有应用）'
        )
        // 服务器配置（直接使用参数，不需要 Credentials）
        string(
            name: 'SERVER_HOST',
            defaultValue: '47.112.31.96',
            description: '服务器地址'
        )
        string(
            name: 'SERVER_USER',
            defaultValue: 'root',
            description: '服务器用户名'
        )
        string(
            name: 'SERVER_PORT',
            defaultValue: '22',
            description: 'SSH 端口'
        )
        string(
            name: 'SSH_KEY_PATH',
            defaultValue: '/var/jenkins_home/.ssh/id_rsa',
            description: 'SSH 私钥路径（在 Jenkins 服务器上的路径，Windows 上部署阶段会被跳过）'
        )
        // 是否跳过测试
        booleanParam(
            name: 'SKIP_TESTS',
            defaultValue: true,
            description: '是否跳过测试（加快构建速度）'
        )
        // 是否清理缓存
        booleanParam(
            name: 'CLEAN_BUILD',
            defaultValue: false,
            description: '是否清理构建缓存（强制重新构建）'
        )
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "📦 检出代码..."
                    checkout scm
                    // 显示 Git 信息
                    if (isUnix()) {
                    sh '''
                        echo "Git 信息:"
                        echo "  分支: $(git branch --show-current)"
                        echo "  提交: $(git rev-parse --short HEAD)"
                        echo "  作者: $(git log -1 --pretty=format:'%an <%ae>')"
                        echo "  消息: $(git log -1 --pretty=format:'%s')"
                    '''
                    } else {
                        bat '''
                            @echo off
                            echo Git 信息:
                            for /f "delims=" %%i in ('git branch --show-current') do echo   分支: %%i
                            for /f "delims=" %%i in ('git rev-parse --short HEAD') do echo   提交: %%i
                            for /f "delims=" %%i in ('git log -1 --pretty=format:"%%an ^<%%ae^>"') do echo   作者: %%i
                            for /f "delims=" %%i in ('git log -1 --pretty=format:"%%s"') do echo   消息: %%i
                        '''
                    }
                }
            }
        }
        
        stage('Setup Environment') {
            steps {
                script {
                    echo "🔧 设置构建环境..."
                    // 安装 Node.js
                    if (isUnix()) {
                    sh '''
                        if command -v nvm &> /dev/null; then
                            source ~/.nvm/nvm.sh
                            nvm install ${NODE_VERSION}
                            nvm use ${NODE_VERSION}
                        elif command -v node &> /dev/null; then
                            echo "Node.js 已安装: $(node --version)"
                        else
                            echo "错误: 未找到 Node.js，请安装 Node.js ${NODE_VERSION}"
                            exit 1
                        fi
                        
                        # 安装 pnpm
                        if ! command -v pnpm &> /dev/null; then
                            echo "安装 pnpm ${PNPM_VERSION}..."
                            npm install -g pnpm@${PNPM_VERSION}
                        fi
                        echo "pnpm 版本: $(pnpm --version)"
                    '''
                    } else {
                        bat '''
                            @echo off
                            where node >nul 2>&1
                            if %errorlevel% neq 0 (
                                echo 错误: 未找到 Node.js，请安装 Node.js %NODE_VERSION%
                                exit /b 1
                            )
                            echo Node.js 已安装:
                            node --version
                            
                            where pnpm >nul 2>&1
                            if %errorlevel% neq 0 (
                                echo 安装 pnpm %PNPM_VERSION%...
                                call npm install -g pnpm@%PNPM_VERSION%
                            )
                            echo pnpm 版本:
                            pnpm --version
                        '''
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    echo "📚 安装依赖..."
                    if (isUnix()) {
                    sh '''
                        # 清理并安装依赖
                        pnpm install --frozen-lockfile
                        echo "✅ 依赖安装完成"
                    '''
                    } else {
                        bat '''
                            @echo off
                            call pnpm install --frozen-lockfile
                            echo ✅ 依赖安装完成
                        '''
                    }
                }
            }
        }
        
        stage('Lint & Type Check') {
            when {
                expression { !params.SKIP_TESTS }
            }
            steps {
                script {
                    echo "🔍 代码检查..."
                    if (isUnix()) {
                    sh '''
                        echo "运行 ESLint..."
                        pnpm lint || echo "⚠️ Lint 检查失败，但继续构建"
                        
                        echo "运行 TypeScript 类型检查..."
                        pnpm type-check || echo "⚠️ 类型检查失败，但继续构建"
                    '''
                    } else {
                        bat '''
                            @echo off
                            echo 运行 ESLint...
                            call pnpm lint || echo ⚠️ Lint 检查失败，但继续构建
                            
                            echo 运行 TypeScript 类型检查...
                            call pnpm type-check || echo ⚠️ 类型检查失败，但继续构建
                        '''
                    }
                }
            }
        }
        
        stage('Test') {
            when {
                expression { !params.SKIP_TESTS }
            }
            steps {
                script {
                    echo "🧪 运行测试..."
                    if (isUnix()) {
                    sh '''
                        echo "运行单元测试..."
                        pnpm test:unit || echo "⚠️ 单元测试失败，但继续构建"
                    '''
                    } else {
                        bat '''
                            @echo off
                            echo 运行单元测试...
                            call pnpm test:unit || echo ⚠️ 单元测试失败，但继续构建
                        '''
                    }
                }
            }
        }
        
        stage('Build') {
            steps {
                script {
                    echo "🔨 构建应用..."
                    def appName = params.APP_NAME
                    
                    if (isUnix()) {
                    if (appName == 'all') {
                            // 构建所有应用并复制到 dist 目录
                        sh '''
                                echo "构建所有应用并复制到 dist 目录..."
                                pnpm build-dist:all
                                echo "✅ 所有应用构建完成，产物在 dist 目录"
                        '''
                    } else {
                        // 构建单个应用
                        sh """
                            echo "构建应用: ${appName}..."
                                pnpm build-dist:${appName}
                                echo "✅ ${appName} 构建完成，产物在 dist/${appName} 目录"
                            """
                        }
                    } else {
                        if (appName == 'all') {
                            // 构建所有应用并复制到 dist 目录
                            bat '''
                                @echo off
                                echo 构建所有应用并复制到 dist 目录...
                                call pnpm build-dist:all
                                echo ✅ 所有应用构建完成，产物在 dist 目录
                            '''
                        } else {
                            // 构建单个应用
                            bat """
                                @echo off
                                echo 构建应用: ${appName}...
                                call pnpm build-dist:${appName}
                                echo ✅ ${appName} 构建完成，产物在 dist\\${appName} 目录
                            """
                        }
                    }
                }
            }
        }
        
        stage('Verify Build Artifacts') {
            steps {
                script {
                    echo "✅ 验证构建产物..."
                    def appName = params.APP_NAME
                    
                    if (isUnix()) {
                    if (appName == 'all') {
                        sh '''
                                echo "验证 dist 目录下的构建产物..."
                                if [ -d "dist" ] && [ -n "$(ls -A dist 2>/dev/null)" ]; then
                                    echo "✅ dist 目录存在且不为空"
                                    echo "应用列表:"
                                    ls -1 dist/ | while read app; do
                                        if [ -d "dist/$app" ] && [ -n "$(ls -A dist/$app 2>/dev/null)" ]; then
                                            echo "  ✅ $app: $(du -sh dist/$app | awk '{print $1}')"
                                else
                                            echo "  ❌ $app: 目录为空"
                                        fi
                                    done
                                else
                                    echo "❌ dist 目录不存在或为空"
                                    exit 1
                                fi
                        '''
                    } else {
                        sh """
                                if [ -d "dist/${appName}" ] && [ -n "\$(ls -A dist/${appName} 2>/dev/null)" ]; then
                                echo "✅ ${appName}: 构建产物验证通过"
                                    du -sh dist/${appName} | awk '{print "大小: " \$1}'
                            else
                                echo "❌ ${appName}: 构建产物不存在或为空"
                                exit 1
                            fi
                        """
                        }
                    } else {
                        if (appName == 'all') {
                            bat '''
                                @echo off
                                echo 验证 dist 目录下的构建产物...
                                if exist "dist" (
                                    dir /b "dist" >nul 2>&1
                                    if !errorlevel! equ 0 (
                                        echo ✅ dist 目录存在且不为空
                                        echo 应用列表:
                                        for /d %%a in (dist\*) do (
                                            if exist "%%a" (
                                                echo   ✅ %%~na: 存在
                                            ) else (
                                                echo   ❌ %%~na: 目录为空
                                            )
                                        )
                                    ) else (
                                        echo ❌ dist 目录为空
                                        exit /b 1
                                    )
                                ) else (
                                    echo ❌ dist 目录不存在
                                    exit /b 1
                                )
                            '''
                        } else {
                            bat """
                                @echo off
                                if exist "dist\\${appName}" (
                                    dir /b "dist\\${appName}" >nul 2>&1
                                    if !errorlevel! equ 0 (
                                        echo ✅ ${appName}: 构建产物验证通过
                                    ) else (
                                        echo ❌ ${appName}: 构建产物为空
                                        exit /b 1
                                    )
                                ) else (
                                    echo ❌ ${appName}: 构建产物不存在
                                    exit /b 1
                                )
                            """
                        }
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    echo "🚀 部署到服务器..."
                    def appName = params.APP_NAME
                    
                    // 准备 SSH 密钥和配置环境变量
                    def serverHost = params.SERVER_HOST
                    def serverUser = params.SERVER_USER
                    def serverPort = params.SERVER_PORT
                    def sshKeyPath = params.SSH_KEY_PATH
                    
                    if (isUnix()) {
                    sh """
                        echo "🚀 部署配置:"
                        echo "  服务器: ${serverUser}@${serverHost}:${serverPort}"
                        echo "  SSH 密钥: ${sshKeyPath}"
                        echo "  应用: ${appName}"
                        
                        # 检查 SSH 密钥是否存在
                        if [ ! -f "${sshKeyPath}" ]; then
                            echo "❌ SSH 密钥文件不存在: ${sshKeyPath}"
                            echo "💡 请确保 SSH 密钥已放置在 Jenkins 服务器上，或修改 SSH_KEY_PATH 参数"
                            exit 1
                        fi
                        
                        # 设置权限
                        chmod 600 "${sshKeyPath}" || true
                        
                        # 设置环境变量供部署脚本使用
                        export SERVER_HOST="${serverHost}"
                        export SERVER_USER="${serverUser}"
                        export SERVER_PORT="${serverPort}"
                        export SSH_KEY="${sshKeyPath}"
                        
                        # 测试 SSH 连接
                        echo "测试 SSH 连接..."
                        if ssh -i "${sshKeyPath}" -p "${serverPort}" \
                            -o ConnectTimeout=10 -o StrictHostKeyChecking=no \
                            "${serverUser}@${serverHost}" "echo 'SSH connection successful'" 2>&1; then
                            echo "✅ SSH 连接成功"
                        else
                            echo "❌ SSH 连接失败，请检查："
                            echo "  1. SSH 密钥路径是否正确: ${sshKeyPath}"
                            echo "  2. 服务器地址是否正确: ${serverHost}"
                            echo "  3. 用户名是否正确: ${serverUser}"
                            echo "  4. 端口是否正确: ${serverPort}"
                            exit 1
                        fi
                    """
                    
                    // 执行部署
                    if (appName == 'all') {
                        sh """
                            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                            echo "部署所有应用..."
                            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                            
                            export SERVER_HOST="${serverHost}"
                            export SERVER_USER="${serverUser}"
                            export SERVER_PORT="${serverPort}"
                            export SSH_KEY="${sshKeyPath}"
                            
                            bash scripts/deploy-static.sh --all
                        """
                    } else {
                        sh """
                            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                            echo "部署应用: ${appName}..."
                            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                            
                            export SERVER_HOST="${serverHost}"
                            export SERVER_USER="${serverUser}"
                            export SERVER_PORT="${serverPort}"
                            export SSH_KEY="${sshKeyPath}"
                            
                            bash scripts/deploy-static.sh --app ${appName}
                            """
                        }
                    } else {
                        // Windows 上使用 PowerShell 或 Git Bash
                        bat """
                            @echo off
                            echo 🚀 部署配置:
                            echo   服务器: ${serverUser}@${serverHost}:${serverPort}
                            echo   SSH 密钥: ${sshKeyPath}
                            echo   应用: ${appName}
                            
                            REM 检查 SSH 密钥是否存在
                            if not exist "${sshKeyPath}" (
                                echo ❌ SSH 密钥文件不存在: ${sshKeyPath}
                                echo 💡 请确保 SSH 密钥已放置在 Jenkins 服务器上，或修改 SSH_KEY_PATH 参数
                                exit /b 1
                            )
                            
                            REM 设置环境变量
                            set SERVER_HOST=${serverHost}
                            set SERVER_USER=${serverUser}
                            set SERVER_PORT=${serverPort}
                            set SSH_KEY=${sshKeyPath}
                            
                            REM 测试 SSH 连接（使用 Git Bash 或 OpenSSH）
                            echo 测试 SSH 连接...
                            where bash >nul 2>&1
                            if !errorlevel! equ 0 (
                                REM 使用 Git Bash
                                bash -c "ssh -i '${sshKeyPath}' -p ${serverPort} -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${serverUser}@${serverHost} 'echo SSH connection successful'" 2>&1
                                if !errorlevel! equ 0 (
                                    echo ✅ SSH 连接成功
                                ) else (
                                    echo ❌ SSH 连接失败
                                    exit /b 1
                                )
                            ) else (
                                REM 使用 OpenSSH（Windows 10+）
                                ssh -i "${sshKeyPath}" -p ${serverPort} -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${serverUser}@${serverHost} "echo SSH connection successful" 2>&1
                                if !errorlevel! equ 0 (
                                    echo ✅ SSH 连接成功
                                ) else (
                                    echo ❌ SSH 连接失败，请检查配置
                                    exit /b 1
                                )
                            )
                            
                            REM 执行部署（使用 Git Bash 执行部署脚本）
                            echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                            if "${appName}"=="all" (
                                echo 部署所有应用...
                            ) else (
                                echo 部署应用: ${appName}...
                            )
                            echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                            
                            where bash >nul 2>&1
                            if !errorlevel! equ 0 (
                                REM 使用 Git Bash
                                if "${appName}"=="all" (
                                    bash -c "export SERVER_HOST='${serverHost}' SERVER_USER='${serverUser}' SERVER_PORT='${serverPort}' SSH_KEY='${sshKeyPath}' && bash scripts/deploy-static.sh --all"
                                ) else (
                                    bash -c "export SERVER_HOST='${serverHost}' SERVER_USER='${serverUser}' SERVER_PORT='${serverPort}' SSH_KEY='${sshKeyPath}' && bash scripts/deploy-static.sh --app ${appName}"
                                )
                            ) else (
                                echo ❌ 未找到 bash，无法执行部署脚本
                                echo 💡 请安装 Git for Windows 或使用 Linux/Unix 服务器运行 Jenkins
                                exit /b 1
                            )
                        """
                    }
                }
            }
        }
        
        stage('Post-Deploy Verification') {
            steps {
                script {
                    echo "🔍 部署后验证..."
                    // 可以添加健康检查
                    if (isUnix()) {
                    sh '''
                        echo "部署完成，可以进行人工验证"
                        echo "或添加自动化健康检查脚本"
                    '''
                    } else {
                        bat '''
                            @echo off
                            echo 部署完成，可以进行人工验证
                            echo 或添加自动化健康检查脚本
                        '''
                    }
                }
            }
        }
    }
    
    post {
        success {
            script {
                echo "✅ 构建和部署成功！"
                // 可以发送成功通知（邮件、企业微信等）
            }
        }
        failure {
            script {
                echo "❌ 构建或部署失败"
                // 可以发送失败通知
            }
        }
        always {
            echo "构建流程完成"
        }
    }
}
