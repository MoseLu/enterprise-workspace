# Jenkins 自动轮询（Poll SCM）配置指南

## 概述

Jenkins 的自动轮询（Poll SCM）功能可以定期检查 Git 仓库是否有新的提交，如果有则自动触发构建。这对于持续集成非常有用。

## 配置方式

### 方式 1：在 Jenkinsfile 中配置（推荐）

在 Jenkinsfile 的 `triggers` 部分添加 `pollSCM` 配置：

```groovy
pipeline {
    agent any
    
    // 配置自动轮询
    triggers {
        // 每 2 分钟检查一次代码变更
        pollSCM('H/2 * * * *')
        
        // 或者使用其他时间间隔：
        // pollSCM('H * * * *')      // 每小时检查一次
        // pollSCM('H/15 * * * *')   // 每 15 分钟检查一次
        // pollSCM('0 9 * * *')      // 每天上午 9 点检查一次
        // pollSCM('* H/2 * * *')    // 每 2 小时检查一次
    }
    
    // ... 其他配置
}
```

### 方式 2：在 Jenkins Web UI 中配置

1. **登录 Jenkins**
2. **进入 Job 配置页面**：
   - 点击要配置的 Job（如 `btc-shopflow-deploy-logistics-app`）
   - 点击左侧的 **Configure**（配置）
3. **找到 Build Triggers 部分**：
   - 向下滚动找到 **Build Triggers**（构建触发器）部分
4. **启用 Poll SCM**：
   - 勾选 **Poll SCM**（轮询 SCM）
   - 在 **Schedule**（计划）输入框中输入 cron 表达式
5. **保存配置**：
   - 点击页面底部的 **Save**（保存）

## Cron 表达式说明

Jenkins 使用标准的 cron 表达式格式：

```
分 时 日 月 星期
*  *  *  *  *
│  │  │  │  │
│  │  │  │  └── 星期几 (0-7, 0 和 7 都表示星期日)
│  │  │  └──── 月份 (1-12)
│  │  └────── 日期 (1-31)
│  └──────── 小时 (0-23)
└────────── 分钟 (0-59)
```

### 常用 Cron 表达式示例

| 表达式 | 说明 | 示例 |
|--------|------|------|
| `H/2 * * * *` | 每 2 分钟检查一次（使用 H 避免所有 Job 同时触发） | 每 2 分钟 |
| `H/5 * * * *` | 每 5 分钟检查一次（使用 H 避免所有 Job 同时触发） | 每 5 分钟 |
| `H/15 * * * *` | 每 15 分钟检查一次 | 每 15 分钟 |
| `H * * * *` | 每小时检查一次 | 每小时 |
| `* H/2 * * *` | 每 2 小时检查一次 | 每 2 小时 |
| `H 9 * * *` | 每天上午 9 点检查一次 | 每天 9:00 |
| `H 9,17 * * *` | 每天上午 9 点和下午 5 点检查 | 每天 9:00 和 17:00 |
| `H 9 * * 1-5` | 工作日上午 9 点检查 | 周一到周五 9:00 |
| `0 0 * * *` | 每天午夜检查 | 每天 00:00 |

### 关于 `H` 符号

`H` 是 Jenkins 的特殊符号，表示"哈希值"（Hash），用于：
- **分散负载**：避免所有 Job 在同一时间触发
- **随机化时间**：Jenkins 会在指定时间范围内随机选择一个时间点

例如：
- `H/2 * * * *` 表示每 2 分钟检查一次，但具体时间会在 0-1、2-3、4-5 等时间段内随机
- `H/5 * * * *` 表示每 5 分钟检查一次，但具体时间会在 0-4、5-9、10-14 等时间段内随机
- `H 9 * * *` 表示每天 9 点左右检查（可能在 9:00-9:59 之间的任意时间）

## 在 logistics-app 中配置示例

### 更新 Jenkinsfile.logistics-app

在 `Jenkinsfile.logistics-app` 的 `pipeline` 块中添加 `triggers`：

```groovy
pipeline {
    agent any
    
    // 添加自动轮询配置
    triggers {
        // 每 2 分钟检查一次代码变更
        pollSCM('H/2 * * * *')
    }
    
    environment {
        NODE_VERSION = '20'
        PNPM_VERSION = '8.15.0'
        APP_NAME = 'logistics-app'
        DEPLOY_CONFIG = 'deploy.config.json'
    }
    
    // ... 其他配置保持不变
}
```

## 验证配置

### 1. 检查轮询是否生效

配置完成后，可以在 Jenkins Job 页面查看：
- 进入 Job 页面
- 查看左侧的 **Build History**（构建历史）
- 如果配置正确，Jenkins 会在指定时间自动触发构建

### 2. 查看轮询日志

1. 进入 Job 配置页面
2. 点击 **View Configuration**（查看配置）
3. 在 **Build Triggers** 部分可以看到配置的 cron 表达式
4. 在构建历史中，自动触发的构建会显示 **Started by timer** 或 **Started by SCM polling**

### 3. 手动测试轮询

可以通过以下方式测试轮询是否工作：
1. 在 Job 配置页面，点击 **Build Triggers** 部分的 **Poll Now**（立即轮询）按钮
2. 如果有新的提交，会立即触发构建

## 注意事项

### 1. 性能考虑

- **轮询频率**：不要设置过于频繁的轮询（如每分钟），这会增加 Jenkins 和 Git 服务器的负载
- **推荐频率**：对于开发分支，建议每 2-15 分钟检查一次；对于生产分支，可以设置为每小时或每天

### 2. 网络和权限

- 确保 Jenkins 服务器可以访问 Git 仓库
- 确保 Jenkins 有权限读取仓库（如果是私有仓库，需要配置 Git 凭证）

### 3. 避免重复构建

- 如果同时配置了 **Poll SCM** 和 **GitHub Webhook**，可能会触发重复构建
- 建议只使用一种触发方式：
  - **Webhook**（推荐）：代码推送后立即触发，响应更快
  - **Poll SCM**：作为备用方案，或者在没有 Webhook 支持时使用

### 4. 分支过滤

如果需要只轮询特定分支，可以在 Jenkinsfile 中添加条件：

```groovy
triggers {
    pollSCM('H/2 * * * *')
}

stages {
    stage('Checkout') {
        when {
            // 只处理 develop 分支
            branch 'develop'
        }
        steps {
            // ...
        }
    }
}
```

## 与 GitHub Webhook 对比

| 特性 | Poll SCM | GitHub Webhook |
|------|----------|----------------|
| **响应速度** | 有延迟（取决于轮询间隔） | 立即触发 |
| **服务器负载** | 持续轮询，增加负载 | 按需触发，负载低 |
| **配置复杂度** | 简单（只需 cron 表达式） | 需要配置 Webhook URL |
| **网络要求** | Jenkins 主动连接 Git | Git 主动通知 Jenkins |
| **适用场景** | 简单场景、备用方案 | 生产环境推荐 |

## 推荐配置

### 开发环境

```groovy
triggers {
    // 每 2 分钟检查一次，适合开发分支
    pollSCM('H/2 * * * *')
}
```

### 生产环境

```groovy
triggers {
    // 每小时检查一次，适合生产分支
    pollSCM('H * * * *')
}
```

### 或者使用 Webhook（推荐）

如果可能，建议使用 GitHub Webhook 替代 Poll SCM，响应更快且负载更低。

## 故障排除

### 问题 1：轮询没有触发构建

**可能原因**：
- Cron 表达式格式错误
- Jenkins 时区设置不正确
- Git 仓库无法访问

**解决方法**：
1. 检查 cron 表达式格式是否正确
2. 在 Jenkins 系统配置中检查时区设置
3. 测试 Git 仓库连接：在 Job 配置页面点击 **Test Connection**

### 问题 2：轮询过于频繁

**解决方法**：
- 增加轮询间隔（如从 `H/2` 改为 `H/5`、`H/15` 或 `H * * * *`）

### 问题 3：轮询没有检测到新提交

**可能原因**：
- Git 凭证配置不正确
- 分支配置不正确

**解决方法**：
1. 检查 Git 凭证是否正确配置
2. 确认轮询的分支名称是否正确
3. 手动点击 **Poll Now** 测试

## 相关文档

- [Jenkins Pipeline Triggers 文档](https://www.jenkins.io/doc/book/pipeline/syntax/#triggers)
- [Cron 表达式说明](https://en.wikipedia.org/wiki/Cron)

