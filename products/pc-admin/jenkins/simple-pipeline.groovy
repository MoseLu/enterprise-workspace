// 简化的 Jenkins Pipeline 配置
// 可以直接复制到 Jenkins Pipeline Job 的 Pipeline script 中

pipeline {
    agent any
    
    parameters {
        choice(
            name: 'APP_NAME',
            choices: ['system-app', 'admin-app', 'logistics-app', 'quality-app', 'production-app', 'engineering-app', 'finance-app', 'mobile-app', 'all'],
            description: '选择要部署的应用'
        )
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
            description: 'SSH 私钥路径（在 Jenkins 服务器上）'
        )
        booleanParam(
            name: 'SKIP_TESTS',
            defaultValue: true,
            description: '跳过测试（加快构建速度）'
        )
    }
    
    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh '''
                    echo "📦 Git 信息:"
                    echo "  分支: $(git branch --show-current)"
                    echo "  提交: $(git rev-parse --short HEAD)"
                '''
            }
        }
        
        stage('Setup') {
            steps {
                sh '''
                    # 检查 Node.js
                    if ! command -v node &> /dev/null; then
                        echo "❌ Node.js 未安装，请先安装 Node.js 20+"
                        exit 1
                    fi
                    echo "✅ Node.js: $(node --version)"
                    
                    # 安装 pnpm
                    if ! command -v pnpm &> /dev/null; then
                        echo "安装 pnpm..."
                        npm install -g pnpm@8.15.0
                    fi
                    echo "✅ pnpm: $(pnpm --version)"
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'pnpm install --frozen-lockfile'
            }
        }
        
        stage('Build') {
            steps {
                script {
                    def appName = params.APP_NAME
                    
                    if (appName == 'all') {
                        sh '''
                            echo "🔨 构建所有应用..."
                            pnpm build:all
                        '''
                    } else {
                        sh """
                            echo "🔨 构建应用: ${appName}..."
                            pnpm --filter ${appName} run build
                        """
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    def appName = params.APP_NAME
                    def serverHost = params.SERVER_HOST
                    def serverUser = params.SERVER_USER
                    def serverPort = params.SERVER_PORT
                    def sshKey = params.SSH_KEY_PATH
                    
                    sh """
                        echo "🚀 部署到服务器..."
                        echo "  服务器: ${serverUser}@${serverHost}:${serverPort}"
                        echo "  应用: ${appName}"
                        
                        # 设置环境变量
                        export SERVER_HOST="${serverHost}"
                        export SERVER_USER="${serverUser}"
                        export SERVER_PORT="${serverPort}"
                        export SSH_KEY="${sshKey}"
                        
                        # 执行部署
                        if [ "${appName}" == "all" ]; then
                            bash scripts/deploy-static.sh --all
                        else
                            bash scripts/deploy-static.sh --app ${appName}
                        fi
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo "✅ 构建和部署成功！"
        }
        failure {
            echo "❌ 构建或部署失败"
        }
        always {
            echo "构建完成"
        }
    }
}
