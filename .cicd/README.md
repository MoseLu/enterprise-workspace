# 企业级 CI/CD 配置目录

本目录包含企业级项目的持续集成和持续部署（CI/CD）配置文件，支持 GitHub Actions 和 Jenkins 两种 CI/CD 系统。

## 目录结构

```
.cicd/
├── github-actions/           # GitHub Actions 工作流配置
│   ├── ci.yml                # 通用 CI 工作流
│   ├── cd-test.yml           # 测试环境 CD 工作流
│   ├── cd-prod.yml           # 生产环境 CD 工作流
│   └── templates/            # 复用模板
│       ├── job-templates.yml     # 作业模板
│       ├── step-templates.yml    # 步骤模板
│       └── cache-templates.yml   # 缓存模板
├── jenkins/                  # Jenkins 流水线配置
│   ├── Jenkinsfile.ci        # 通用 CI 流水线
│   ├── Jenkinsfile.cd-test   # 测试环境 CD 流水线
│   └── Jenkinsfile.cd-prod   # 生产环境 CD 流水线
├── env/                      # 环境配置文件
│   ├── common.env            # 通用配置（所有环境共享）
│   ├── test.env              # 测试环境配置
│   └── prod.env              # 生产环境配置
└── artifacts/                # 制品存储目录
    └── README.md             # 制品说明文档
```

## 快速开始

### GitHub Actions 使用方法

1. 将 `.cicd/github-actions/` 目录复制到项目根目录
2. 根据实际项目需求修改配置文件中的参数
3. 配置必要的 GitHub Secrets
4. 提交代码后自动触发 CI/CD 流程

### Jenkins 使用方法

1. 将 `.cicd/jenkins/` 目录中的 Jenkinsfile 复制到项目根目录
2. 在 Jenkins 中创建对应的 Pipeline 任务
3. 配置必要的凭证和插件
4. 手动或自动触发构建流程

## 配置文件说明

### GitHub Actions 配置

#### ci.yml（通用 CI 工作流）

此工作流包含以下阶段：

- **代码质量检查**：ESLint、Prettier、TypeScript 类型检查
- **单元测试**：运行测试并生成覆盖率报告
- **项目构建**：构建生产版本
- **安全扫描**：依赖漏洞扫描、代码安全分析

触发条件：主分支和开发分支的 push 操作，所有分支的 pull request

#### cd-test.yml（测试环境 CD）

此工作流包含以下阶段：

- **Docker 镜像构建**：构建并推送容器镜像
- **Kubernetes 部署**：部署到测试环境集群
- **健康检查**：验证应用健康状态
- **集成测试**：执行 API 测试集合

触发条件：开发分支的代码合并，手动触发

#### cd-prod.yml（生产环境 CD）

此工作流包含以下阶段：

- **预部署检查**：验证版本标签和环境配置
- **数据库迁移**：执行必要的数据库迁移
- **滚动更新**：零停机部署到生产环境
- **健康检查**：多次验证确保服务可用
- **部署验证**：验证所有服务状态

触发条件：主分支的代码合并（需要审批），手动触发（需要审批）

### Jenkins 配置

#### Jenkinsfile.ci（通用 CI 流水线）

此流水线包含以下阶段：

- 检出代码
- 设置构建环境
- 代码质量检查
- 单元测试
- 项目构建
- 安全扫描
- 生成构建报告

支持参数化构建：Node.js 版本选择、是否跳过测试、是否跳过代码检查

#### Jenkinsfile.cd-test（测试环境 CD）

此流水线包含以下阶段：

- 环境检查
- Docker 镜像构建
- 推送镜像
- 配置 Kubernetes
- 部署应用
- 等待部署
- 健康检查
- 集成测试

支持参数化构建：版本号、是否跳过测试、是否强制重新部署

#### Jenkinsfile.cd-prod（生产环境 CD）

此流水线包含以下阶段：

- 部署审批（需要手动审批）
- 预部署检查
- Docker 镜像构建
- 推送镜像
- 数据库迁移
- 滚动更新部署
- 健康检查
- 服务状态验证

支持参数化构建：版本号（必填）、回滚模式、数据库迁移

## 环境配置说明

### 通用配置（common.env）

包含所有环境共有的配置变量：

- 应用基础配置（名称、端口、调试模式等）
- 数据库配置（连接信息、连接池等）
- Redis 配置
- JWT 配置
- 消息队列配置
- 日志配置
- 文件上传配置
- CORS 配置
- 速率限制配置
- 安全配置
- 国际化配置
- 业务配置

### 测试环境配置（test.env）

针对测试环境的特定配置：

- 测试数据库配置
- 测试 Redis 配置
- 测试邮件服务配置
- 测试覆盖率阈值
- E2E 测试配置

### 生产环境配置（prod.env）

针对生产环境的特定配置：

- 生产数据库配置（高可用连接、SSL）
- 生产 Redis 配置（集群或哨兵模式）
- 生产消息队列配置
- 对象存储配置（S3）
- CDN 配置
- 监控配置（APM）
- 高可用配置（多区域部署）

## 敏感信息管理

### 推荐的敏感信息存储方式

1. **GitHub Secrets**：在 GitHub 仓库设置中配置
2. **Jenkins Credentials**：在 Jenkins 中配置全局凭证
3. **密钥管理服务**：使用 HashiCorp Vault、AWS Secrets Manager 等

### 需要配置的密钥

#### GitHub Secrets

| 密钥名称 | 说明 |
|---------|------|
| GHCR_TOKEN | GitHub Container Registry 访问令牌 |
| KUBECONFIG_TEST | 测试环境 Kubernetes 配置 |
| KUBECONFIG_PROD | 生产环境 Kubernetes 配置 |
| SLACK_WEBHOOK_URL | Slack 通知 Webhook |
| DB_PASSWORD | 数据库密码 |
| JWT_SECRET | JWT 密钥 |

#### Jenkins Credentials

| 凭证 ID | 类型 | 说明 |
|---------|------|------|
| github-credentials | Username with password | GitHub 访问凭证 |
| ghcr-credentials | Username with password | Container Registry 访问凭证 |
| kubeconfig-test | Kubernetes configuration | 测试环境 Kubeconfig |
| kubeconfig-prod | Kubernetes configuration | 生产环境 Kubeconfig |
| slack-webhook | Secret text | Slack Webhook URL |

## 自定义配置

### 修改项目名称

在配置文件中搜索并替换 `enterprise-workspace` 为实际项目名称：

```bash
# 使用命令行工具替换
find .cicd -type f -name "*.yml" -o -name "*.env" -o -name "Jenkinsfile*" | xargs sed -i 's/enterprise-workspace/your-project-name/g'
```

### 添加自定义步骤

在 GitHub Actions 工作流中添加步骤：

```yaml
- name: 自定义步骤
  run: |
    echo "执行自定义命令"
```

在 Jenkinsfile 中添加阶段：

```groovy
stage('自定义阶段') {
    steps {
        echo '执行自定义操作'
    }
}
```

### 修改触发条件

修改 GitHub Actions 触发条件：

```yaml
on:
  push:
    branches: [main, develop, release/*]
  pull_request:
    branches: [main, develop]
```

## 最佳实践

1. **环境隔离**：不同环境使用独立的配置和凭证
2. **审批流程**：生产环境部署必须经过审批
3. **回滚机制**：保留快速回滚能力
4. **监控告警**：配置完善的监控和告警机制
5. **日志收集**：统一日志收集和分析
6. **安全扫描**：集成安全扫描工具
7. **覆盖率要求**：设置代码覆盖率阈值

## 常见问题

### Q: 如何跳过某个阶段？

**GitHub Actions**：使用条件判断

```yaml
- name: 自定义步骤
  if: always()  # 总是执行，或使用其他条件
  run: echo "执行"
```

**Jenkins**：使用 when 条件

```groovy
stage('阶段名称') {
    when {
        expression { return !params.SKIP_STAGE }
    }
    steps {
        // ...
    }
}
```

### Q: 如何添加自定义环境变量？

**GitHub Actions**：

```yaml
env:
  CUSTOM_VAR: custom-value
```

**Jenkins**：

```groovy
environment {
    CUSTOM_VAR = 'custom-value'
}
```

### Q: 如何修改超时时间？

**GitHub Actions**：

```yaml
- name: 长时间任务
  timeout-minutes: 60
  run: ./long-task.sh
```

**Jenkins**：

```groovy
options {
    timeout(time: 1, unit: 'HOURS')
}
```

## 相关文档

- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [Jenkins Pipeline 官方文档](https://www.jenkins.io/doc/book/pipeline/)
- [Kubernetes 部署策略](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [CI/CD 最佳实践](https://docs.gitlab.com/ee/ci/introduction/)

## 贡献指南

1. 确保配置文件有清晰的中文注释
2. 遵循现有的代码风格和格式
3. 测试配置文件在目标环境中的兼容性
4. 更新本文档以反映配置变更

## 许可证

本 CI/CD 配置模板基于 MIT 许可证开源。
