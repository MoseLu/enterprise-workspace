# 制品目录说明

此目录用于存储 CI/CD 流程生成的各类制品文件。

## 制品类型

| 类型 | 说明 | 存储位置 |
|-----|------|---------|
| 构建产物 | 编译后的文件、Docker 镜像等 | Docker Registry / 对象存储 |
| 测试报告 | 单元测试、集成测试报告 | `test-results/` |
| 覆盖率报告 | 代码覆盖率报告 | `coverage/` |
| 构建日志 | CI/CD 执行日志 | `logs/` |
| 部署记录 | 部署历史记录 | `deployments/` |
| 备份文件 | 数据库备份、配置文件备份 | `backups/` |

## 目录结构

```
artifacts/
├── test-results/          # 测试报告目录
│   ├── unit/              # 单元测试报告
│   ├── integration/       # 集成测试报告
│   └── e2e/               # 端到端测试报告
├── coverage/              # 覆盖率报告目录
│   ├── html/              # HTML 格式报告
│   └── lcov/              # LCOV 格式报告
├── logs/                  # 构建日志目录
│   ├── ci/                # CI 日志
│   ├── cd-test/           # 测试环境 CD 日志
│   └── cd-prod/           # 生产环境 CD 日志
├── deployments/           # 部署记录目录
│   ├── test/              # 测试环境部署记录
│   └── prod/              # 生产环境部署记录
└── backups/               # 备份文件目录
    ├── database/          # 数据库备份
    └── config/            # 配置文件备份
```

## 制品保留策略

| 制品类型 | 保留时间 | 说明 |
|---------|---------|------|
| Docker 镜像 | 30 天 | 生产环境镜像保留更长时间 |
| 测试报告 | 7 天 | 过期后自动清理 |
| 覆盖率报告 | 30 天 | 用于趋势分析 |
| 构建日志 | 14 天 | 过期后压缩归档 |
| 部署记录 | 永久 | 保留所有部署历史 |
| 数据库备份 | 30 天 | 每日备份，保留 30 天 |

## 自动清理规则

```bash
# 清理测试报告（7 天前）
find test-results -type f -mtime +7 -delete

# 清理覆盖率报告（30 天前）
find coverage -type f -mtime +30 -delete

# 清理构建日志（14 天前）
find logs -type f -mtime +14 -delete

# 清理旧 Docker 镜像（保留最近 10 个）
docker image prune -a --filter "until=240h"
```

## 相关配置

- GitHub Actions: `.cicd/github-actions/ci.yml`
- Jenkins: `.cicd/jenkins/Jenkinsfile.ci`
