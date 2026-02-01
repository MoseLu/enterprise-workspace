# Jenkins 单应用/全量应用部署策略

本文档说明如何在 Jenkins 中实现单应用部署和全量应用部署的几种方案。

## 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **方案一：单个 Job + 参数选择** | 简单，一个 Job 管理所有 | 需要手动选择参数 | 小团队，部署频率低 |
| **方案二：多个 Jobs** | 清晰，可并行，可单独触发 | 需要维护多个 Jobs | 需要独立管理每个应用 |
| **方案三：Matrix Strategy** | 自动化，并行执行 | 需要 Jenkins 支持 | 自动化 CI/CD |
| **方案四：Shared Library** | 代码复用，易于维护 | 需要创建共享库 | 大型项目，多团队协作 |

## 方案一：单个 Job + 参数选择（当前方案）

### 说明

使用一个 Pipeline Job，通过参数 `APP_NAME` 选择要部署的应用。

### 配置

当前 Jenkinsfile 已经实现了这个方案：

```groovy
parameters {
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
            'all'  // 全量部署
        ],
        description: '选择要部署的应用（选择 all 部署所有应用）'
    )
}
```

### 使用方法

1. 进入 Jenkins Job
2. 点击 **Build with Parameters**
3. 选择 `APP_NAME` 参数：
   - 选择单个应用（如 `system-app`）→ 部署单个应用
   - 选择 `all` → 部署所有应用
4. 点击 **Build**

### 优点

- ✅ 简单，只需要一个 Job
- ✅ 易于维护，所有配置集中在一个 Jenkinsfile
- ✅ 适合小团队

### 缺点

- ❌ 需要手动选择参数
- ❌ 无法并行执行多个应用的部署
- ❌ 构建历史混在一起

---

## 方案二：多个 Jobs（推荐）

### 说明

为每个应用创建一个独立的 Job，并创建一个全量部署的 Job。

### 配置步骤

#### 1. 创建单个应用的 Jobs

为每个应用创建一个 Job：

- `btc-shopflow-deploy-system-app`
- `btc-shopflow-deploy-admin-app`
- `btc-shopflow-deploy-logistics-app`
- `btc-shopflow-deploy-quality-app`
- `btc-shopflow-deploy-production-app`
- `btc-shopflow-deploy-engineering-app`
- `btc-shopflow-deploy-finance-app`
- `btc-shopflow-deploy-mobile-app`

每个 Job 使用相同的 Jenkinsfile，但通过环境变量或参数指定应用名称。

#### 2. 创建 Jenkinsfile 模板

创建一个支持应用名称参数的 Jenkinsfile：

```groovy
pipeline {
    agent any
    
    parameters {
        // 应用名称（从 Job 名称或参数获取）
        string(
            name: 'APP_NAME',
            defaultValue: env.JOB_NAME.replace('btc-shopflow-deploy-', '').replace('-app', '-app'),
            description: '应用名称（自动从 Job 名称获取）'
        )
        // ... 其他参数
    }
    
    stages {
        stage('Build') {
            steps {
                script {
                    def appName = params.APP_NAME
                    if (isUnix()) {
                        sh "pnpm build-dist:${appName}"
                    } else {
                        bat "call pnpm build-dist:${appName}"
                    }
                }
            }
        }
        // ... 其他阶段
    }
}
```

#### 3. 创建全量部署 Job

创建一个 `btc-shopflow-deploy-all` Job，使用以下 Jenkinsfile：

```groovy
pipeline {
    agent any
    
    parameters {
        // ... 服务器配置参数
    }
    
    stages {
        stage('Build All') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'pnpm build-dist:all'
                    } else {
                        bat 'call pnpm build-dist:all'
                    }
                }
            }
        }
        
        stage('Deploy All') {
            steps {
                script {
                    // 使用部署脚本部署所有应用
                    if (isUnix()) {
                        sh '''
                            export SERVER_HOST="${params.SERVER_HOST}"
                            export SERVER_USER="${params.SERVER_USER}"
                            export SERVER_PORT="${params.SERVER_PORT}"
                            export SSH_KEY="${params.SSH_KEY_PATH}"
                            bash scripts/deploy-static.sh --all
                        '''
                    } else {
                        bat '''
                            set SERVER_HOST=%SERVER_HOST%
                            set SERVER_USER=%SERVER_USER%
                            set SERVER_PORT=%SERVER_PORT%
                            set SSH_KEY=%SSH_KEY_PATH%
                            bash scripts/deploy-static.sh --all
                        '''
                    }
                }
            }
        }
    }
}
```

### 使用方法

#### 部署单个应用

1. 进入对应的应用 Job（如 `btc-shopflow-deploy-system-app`）
2. 点击 **Build Now** 或 **Build with Parameters**
3. 配置服务器参数（如果需要）
4. 点击 **Build**

#### 部署所有应用

1. 进入 `btc-shopflow-deploy-all` Job
2. 点击 **Build Now** 或 **Build with Parameters**
3. 配置服务器参数
4. 点击 **Build**

### 优点

- ✅ 每个应用独立管理
- ✅ 可以并行执行多个应用的部署
- ✅ 构建历史清晰，按应用分类
- ✅ 可以为不同应用设置不同的触发条件

### 缺点

- ❌ 需要创建多个 Jobs
- ❌ 需要维护多个 Job 配置（但可以使用相同的 Jenkinsfile）

---

## 方案三：Matrix Strategy（高级）

### 说明

使用 Jenkins 的 Matrix Strategy 并行构建和部署多个应用。

### 配置

需要修改 Jenkinsfile 使用 `matrix` 指令：

```groovy
pipeline {
    agent any
    
    parameters {
        choice(
            name: 'DEPLOY_MODE',
            choices: ['single', 'all'],
            description: '部署模式：single=单个应用，all=所有应用'
        )
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
                'mobile-app'
            ],
            description: '要部署的应用（仅在 single 模式下使用）'
        )
    }
    
    stages {
        stage('Build and Deploy') {
            when {
                expression { params.DEPLOY_MODE == 'all' }
            }
            matrix {
                agent any
                axes {
                    axis {
                        name 'APP_NAME'
                        values 'system-app', 'admin-app', 'logistics-app', 'quality-app', 
                               'production-app', 'engineering-app', 'finance-app', 'mobile-app'
                    }
                }
                stages {
                    stage('Build') {
                        steps {
                            script {
                                if (isUnix()) {
                                    sh "pnpm build-dist:${APP_NAME}"
                                } else {
                                    bat "call pnpm build-dist:${APP_NAME}"
                                }
                            }
                        }
                    }
                    stage('Deploy') {
                        steps {
                            script {
                                if (isUnix()) {
                                    sh """
                                        export SERVER_HOST="${params.SERVER_HOST}"
                                        export SERVER_USER="${params.SERVER_USER}"
                                        export SERVER_PORT="${params.SERVER_PORT}"
                                        export SSH_KEY="${params.SSH_KEY_PATH}"
                                        bash scripts/deploy-static.sh --app ${APP_NAME}
                                    """
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build and Deploy Single') {
            when {
                expression { params.DEPLOY_MODE == 'single' }
            }
            stages {
                stage('Build') {
                    steps {
                        script {
                            def appName = params.APP_NAME
                            if (isUnix()) {
                                sh "pnpm build-dist:${appName}"
                            } else {
                                bat "call pnpm build-dist:${appName}"
                            }
                        }
                    }
                }
                stage('Deploy') {
                    steps {
                        script {
                            def appName = params.APP_NAME
                            if (isUnix()) {
                                sh """
                                    export SERVER_HOST="${params.SERVER_HOST}"
                                    export SERVER_USER="${params.SERVER_USER}"
                                    export SERVER_PORT="${params.SERVER_PORT}"
                                    export SSH_KEY="${params.SSH_KEY_PATH}"
                                    bash scripts/deploy-static.sh --app ${appName}
                                """
                            }
                        }
                    }
                }
            }
        }
    }
}
```

### 使用方法

1. 进入 Jenkins Job
2. 点击 **Build with Parameters**
3. 选择 `DEPLOY_MODE`：
   - `single` → 部署单个应用，然后选择 `APP_NAME`
   - `all` → 并行部署所有应用
4. 点击 **Build**

### 优点

- ✅ 自动化程度高
- ✅ 可以并行执行多个应用的部署
- ✅ 适合 CI/CD 自动化场景

### 缺点

- ❌ 需要 Jenkins 2.x 及以上版本
- ❌ 配置相对复杂
- ❌ 并行部署可能导致服务器负载高

---

## 方案四：Shared Library（企业级）

### 说明

创建一个 Jenkins Shared Library，定义通用的部署 Pipeline，然后为每个应用创建简单的 Job 配置。

### 配置步骤

#### 1. 创建 Shared Library

在 Git 仓库中创建 `vars/deployApp.groovy`：

```groovy
def call(Map config) {
    pipeline {
        agent any
        
        parameters {
            string(
                name: 'APP_NAME',
                defaultValue: config.appName,
                description: '应用名称'
            )
            // ... 其他参数
        }
        
        stages {
            stage('Build') {
                steps {
                    script {
                        def appName = params.APP_NAME
                        if (isUnix()) {
                            sh "pnpm build-dist:${appName}"
                        } else {
                            bat "call pnpm build-dist:${appName}"
                        }
                    }
                }
            }
            // ... 其他阶段
        }
    }
}
```

#### 2. 在 Jenkins 中配置 Shared Library

1. 进入 **Manage Jenkins** → **Configure System**
2. 找到 **Global Pipeline Libraries**
3. 添加库配置：
   - **Name**: `btc-shopflow-pipeline`
   - **Default version**: `main` 或 `develop`
   - **Retrieval method**: Modern SCM
   - **Source Code Management**: Git
   - **Project Repository**: 你的 Git 仓库地址

#### 3. 创建应用 Jobs

每个应用的 Job 只需要一个简单的 Jenkinsfile：

```groovy
@Library('btc-shopflow-pipeline') _

deployApp(
    appName: 'system-app'
)
```

### 优点

- ✅ 代码复用，易于维护
- ✅ 统一的部署流程
- ✅ 适合大型项目和多团队协作

### 缺点

- ❌ 需要创建和维护 Shared Library
- ❌ 配置相对复杂

---

## 推荐方案

根据项目规模和团队情况，推荐以下方案：

### 小团队（< 5 人）

**推荐：方案一（单个 Job + 参数选择）**

- 简单直接
- 易于维护
- 当前已实现

### 中等团队（5-20 人）

**推荐：方案二（多个 Jobs）**

- 每个应用独立管理
- 可以并行执行
- 构建历史清晰

### 大型团队（> 20 人）或企业级

**推荐：方案四（Shared Library）**

- 代码复用
- 统一管理
- 易于扩展

### 自动化 CI/CD

**推荐：方案三（Matrix Strategy）**

- 自动化程度高
- 并行执行
- 适合持续集成

---

## 快速切换方案

如果你当前使用方案一，想切换到方案二，可以：

1. 创建多个 Jobs（使用相同的 Jenkinsfile）
2. 为每个 Job 设置默认的 `APP_NAME` 参数
3. 创建全量部署 Job

需要我帮你创建方案二的配置吗？
