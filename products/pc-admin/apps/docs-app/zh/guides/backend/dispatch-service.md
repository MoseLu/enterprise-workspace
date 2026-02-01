---
title: Dispatch Service (调度服务)
type: guide
project: backend
owner: dev-team
created: '2025-10-13'
updated: '2025-10-14'
publish: true
tags:
  - guides
  - backend
  - dispatch
  - microservices
sidebar_label: 调度服务
sidebar_order: 8
sidebar_group: guides-backend
---

# Dispatch Service (调度服务)

## 1. 服务说明

Dispatch Service是BTC Shop Flow 项目的**任务调度服务**，基于XXL-Job提供分布式任务调度和定时任务管理功能

### 主要职责
- 定时任务调度
- 分布式任务执行
- 任务执行监控
- 任务日志管理
- 任务失败重试
- 任务执行报表

## 2. 技术栈

### 核心框架
| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 2.7.6 | 核心框架 |
| Java | 17 | JDK版本 |
| Maven | 3.6+ | 项目构建工具 |

### 任务调度
| 技术 | 版本 | 说明 |
|------|------|------|
| XXL-Job Core | 2.4.0 | 分布式任务调度平台 |

**功能特性**:
- 动态任务调度
- 执行器管理
- 任务监控和日志
- 多种执行模式（Bean/GLUE）
- 分片广播
- 故障转移

### Web层
| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Web | 2.7.6 | REST API开发 |
| Swagger | 3.0.0 | API文档生成 |
| Springfox Boot Starter | 3.0.0 | Swagger集成 |

### 数据库
| 技术 | 版本 | 说明 |
|------|------|------|
| MySQL Connector | 8.0.31 | MySQL数据库驱动 |

### 微服务组件
| 技术 | 版本 | 说明 |
|------|------|------|
| Nacos Discovery | 2021.0.5.0 | 服务注册与发现 |
| Nacos Config | 2021.0.5.0 | 配置中心 |
| OpenFeign | 3.1.5 | 声明式服务调用 |

### 工具库
| 技术 | 版本 | 说明 |
|------|------|------|
| Lombok | 1.18.24 | 简化Java代码 |
| Sa-Token | 1.44.0 | 权限认证框架 |

## 3. 模块结构

```
dispatch-service/
src/main/java/com/btc/dispatchservice/
controller/ # 控制层
JobController.java # 任务管理接口
service/ # 服务层
DispatchService.java # 调度服务
job/ # 定时任务
DataSyncJob.java # 数据同步任务
ReportJob.java # 报表生成任务
CleanupJob.java # 数据清理任务
config/ # 配置类
XxlJobConfig.java # XXL-Job配置
DispatchServiceApplication.java # 启动类
src/main/resources/
application.properties # 配置文件
static/ # 静态资源
```

## 4. 核心功能

### 1. 定时任务管理
- 任务创建和配置
- 任务启动/停止
- 任务触发方式配置
- Cron表达式配置

### 2. 任务执行
- Bean模式执行
- GLUE模式执行（Java/Python/Shell/PHP）
- 分片广播执行
- 故障转移

### 3. 任务监控
- 任务执行状态监控
- 执行时间统计
- 成功/失败率统计
- 实时日志查看

### 4. 常见任务类型
- **数据同步任务**: 定期同步数据
- **报表生成任务**: 定时生成业务报表
- **数据清理任务**: 清理过期数据
- **缓存刷新任务**: 定时刷新缓存
- **消息推送任务**: 定时推送消息

## 5. API接口

### 任务管理接口
- `POST /api/dispatch/job/create` - 创建任务
- `PUT /api/dispatch/job/update` - 更新任务
- `DELETE /api/dispatch/job/{id}` - 删除任务
- `POST /api/dispatch/job/start/{id}` - 启动任务
- `POST /api/dispatch/job/stop/{id}` - 停止任务
- `POST /api/dispatch/job/trigger/{id}` - 手动触发任务

### 任务查询接口
- `GET /api/dispatch/job/list` - 任务列表
- `GET /api/dispatch/job/{id}` - 任务详情
- `GET /api/dispatch/job/log/{id}` - 任务执行日志

## 6. 配置说明

### XXL-Job配置
```properties
# XXL-Job调度中心地址
xxl.job.admin.addresses=http://localhost:8080/xxl-job-admin

# 执行器配置
xxl.job.executor.appname=dispatch-service
xxl.job.executor.ip=
xxl.job.executor.port=9999
xxl.job.executor.logpath=/data/applogs/xxl-job/jobhandler
xxl.job.executor.logretentiondays=30

# 调度中心通讯TOKEN
xxl.job.accessToken=default_token
```

### Nacos配置
```properties
spring.cloud.nacos.server-addr=127.0.0.1:8848
spring.cloud.nacos.config.file-extension=yaml
```

## 定时任务示例

### 数据同步任务
```java
@XxlJob("dataSyncJob")
public void dataSyncJob() {
// 每天凌晨2点执行数据同步
// Cron: 0 0 2 * * ?
}
```

### 报表生成任务
```java
@XxlJob("reportJob")
public void reportJob() {
// 每天早上8点生成日报
// Cron: 0 0 8 * * ?
}
```

### 数据清理任务
```java
@XxlJob("cleanupJob")
public void cleanupJob() {
// 每周日凌晨3点清理过期数据
// Cron: 0 0 3 ? * SUN
}
```

## 7. 服务端口

- **默认端口**: 未明确指定
- **执行器端口**: 9999
- **Nacos注册**: dispatch-service

## 8. 服务依赖

### 内部服务调用
- 可调用所有业务服务执行任务

### 外部服务
- **XXL-Job调度中心**: 任务调度管理
- **Nacos**: 服务注册中心
- **MySQL**: 任务配置存储

## 9. 注意事项

1. **XXL-Job部署**: 需要单独部署XXL-Job调度中心
2. **任务幂等性**: 确保任务可重复执行
3. **任务超时**: 合理设置任务超时时间
4. **日志清理**: 定期清理任务执行日志
5. **分片任务**: 大数据量任务使用分片处理
6. **失败告警**: 配置任务失败告警机制
