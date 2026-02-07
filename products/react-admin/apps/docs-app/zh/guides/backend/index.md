---
title: 后端开发指南
type: guide
project: backend
owner: dev-team
created: '2025-10-14'
updated: '2025-10-14'
publish: true
tags:
- guides
- backend
- development
sidebar_label: 后端开发指南
sidebar_order: 1
sidebar_group: guides-backend
sidebar_collapsed: false
---

# 后端开发指南

BTC Shop Flow 后端采用基于 Spring Cloud 的微服务架构，提供完整的后端服务开发部署和维护指南

## 架构概览

### 微服务架构
- **API网关**: 统一入口，路由转发，安全认证
- **核心服务**: 用户管理权限管理系统管理
- **业务服务**: 文件上传搜索服务通知服务
- **基础服务**: 任务调度公共模块

### 技术栈
- **框架**: Spring Boot 2.7.6 + Spring Cloud 2021.0.5
- **数据库**: MySQL 8.0 + MyBatis-Flex 1.11.1
- **缓存**: Redis 5.0 + Spring Data Redis
- **消息队列**: RabbitMQ 3.8 + Spring Boot AMQP
- **搜索引擎**: Elasticsearch 7.x + Spring Data Elasticsearch
- **服务注册**: Nacos 2.x
- **安全认证**: Keycloak + OAuth2 + Sa-Token

## 服务文档

### 核心服务
- **[Gateway Service (网关服务)](./gateway-service)** - API网关，统一入口
- **[System Service (系统服务)](./system-service)** - 用户管理权限管理
- **[Admin Service (管理服务)](./admin-service)** - 系统配置数据统计

### 业务服务
- **[Upload Service (上传服务)](./upload-service)** - 文件上传云存储
- **[Search Service (搜索服务)](./search-service)** - 全文搜索智能推荐
- **[Notice Service (通知服务)](./notice-service)** - 消息通知邮件短信

### 基础服务
- **[Dispatch Service (调度服务)](./dispatch-service)** - 定时任务调度
- **[Common Module (公共模块)](./common)** - 通用CRUD异步操作

## 快速开始

### 环境要求
- JDK 17+
- Maven 3.6+
- MySQL 8.0+
- Redis 5.0+
- RabbitMQ 3.8+
- Elasticsearch 7.x
- Nacos 2.x

### 启动步骤

1. **启动基础设施**
```bash
# 启动MySQLRedisRabbitMQNacosElasticsearch
```

2. **构建项目**
```bash
mvn clean install -DskipTests
```

3. **启动服务**
```bash
# 1. 启动网关服务
cd gateway-service
mvn spring-boot:run

# 2. 启动系统服务
cd system-service
mvn spring-boot:run

# 3. 启动其他服务（按需）
```

4. **访问API文档**
- Swagger UI: http://localhost:8080/swagger-ui.html
- Knife4j: http://localhost:8080/doc.html

## 服务架构

### 端口规划
| 服务 | 端口 | 说明 |
|------|------|------|
| gateway-service | 8080 | API网关 |
| system-service | 8100 | 系统服务 |
| admin-service | 8200 | 管理服务 |
| upload-service | 8400 | 上传服务 |
| search-service | 8500 | 搜索服务 |
| notice-service | 8600 | 通知服务 |
| dispatch-service | 8700 | 调度服务 |

### 依赖关系
```
gateway-service [Nacos, Redis, Keycloak]
system-service [common, Nacos, MySQL, Redis, RabbitMQ, Keycloak]
admin-service [common, Nacos, MySQL]
upload-service [Nacos, MySQL, OSS, COS]
search-service [Nacos, MySQL, Elasticsearch]
notice-service [Nacos, MySQL, WebSocket]
dispatch-service [Nacos, MySQL, XXL-Job]
common [MyBatis-Flex, RabbitMQ, Jackson]
```

## 开发规范

### 代码规范
- 使用Lombok简化代码
- 统一的异常处理
- 统一的返回结果封装（DataResult）
- RESTful API设计

### 数据库规范
- 表名使用下划线命名：btc_sys_user
- 字段名使用下划线命名：user_name
- 必备字段：id, create_time, update_time
- 软删除字段：is_deleted

### 接口规范
- 统一使用/api前缀
- 版本控制：/api/v1/api/v2
- 异步操作：/async路径
- 批量操作：/batch路径

## 开发工具

### API文档
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Knife4j**: http://localhost:8080/doc.html

### 监控工具
- **Nacos控制台**: http://localhost:8848/nacos
- **XXL-Job控制台**: http://localhost:8080/xxl-job-admin

### 数据库工具
- **MySQL**: localhost:3306
- **Redis**: localhost:6379
- **Elasticsearch**: localhost:9200

## 相关文档

### 架构设计
- [后端架构概览](../backend-architecture) - 整体架构设计
- [部署指南](../deployment/) - 部署配置指南

### 开发指南
- [组件开发指南](/zh/guides/components/) - 前端组件开发
- [表单处理指南](/zh/guides/forms/) - 表单开发规范
- [集成部署指南](/zh/guides/integration/) - 系统集成指南

## 最佳实践

### 服务设计
1. **单一职责**: 每个服务专注于特定功能
2. **低耦合**: 服务间依赖关系清晰
3. **高内聚**: 相关功能组织在一起
4. **可测试**: 提供完整的测试覆盖

### 数据管理
1. **异步操作**: 使用RabbitMQ处理耗时操作
2. **缓存策略**: 合理使用Redis缓存
3. **数据隔离**: 多租户数据隔离
4. **事务管理**: 分布式事务处理

### 安全设计
1. **认证授权**: Keycloak + OAuth2
2. **权限控制**: 细粒度权限管理
3. **数据加密**: 敏感数据加密存储
4. **访问控制**: API访问限流和熔断

---

**版本**: 3.0.0
**更新日期**: 2025-10-14
**维护团队**: BTC开发团队
