---
title: 后端架构概览
type: guide
project: backend
owner: dev-team
created: '2025-10-14'
updated: '2025-10-14'
publish: true
tags:
- overview
- backend
- architecture
- microservices
sidebar_label: 后端架构
sidebar_order: 5
sidebar_group: guides-backend
---

# 后端架构概览

BTC Shop Flow 采用基于 **Spring Cloud 微服务架构** 的企业级 SaaS 平台，支持多租户分布式部署高并发处理

## 架构特点

- **微服务架构**: 基于 Spring Cloud 的分布式微服务
- **安全认证**: Keycloak + OAuth2 + Sa-Token 多重安全保障
- **异步处理**: 基于 RabbitMQ 的异步数据操作
- **数据持久化**: MyBatis-Flex 高性能 ORM
- **全文搜索**: Elasticsearch 搜索引擎
- **多租户**: 完整的多租户隔离方案
- **API网关**: 统一的 API 入口和路由
- **高性能**: Redis 缓存 + 限流 + 熔断

## 核心服务

### 1. Gateway Service (网关服务)
- **端口**: 8080
- **职责**: API 网关路由转发安全认证限流熔断
- **技术**: Spring Cloud Gateway + OAuth2 + Redis

### 2. System Service (系统服务)
- **端口**: 8100
- **职责**: 用户管理权限管理菜单管理租户管理
- **技术**: Keycloak + MyBatis-Flex + Redis + RabbitMQ

### 3. Admin Service (管理服务)
- **端口**: 8200
- **职责**: 系统配置数据统计系统监控
- **技术**: Spring Boot + Common Module + Sa-Token

### 4. Upload Service (上传服务)
- **端口**: 8400
- **职责**: 文件上传云存储集成图片处理
- **技术**: 阿里云 OSS + 腾讯云 COS + Thumbnailator

### 5. Search Service (搜索服务)
- **端口**: 8500
- **职责**: 全文搜索智能推荐搜索统计
- **技术**: Elasticsearch + Spring Data Elasticsearch

### 6. Notice Service (通知服务)
- **端口**: 8600
- **职责**: 消息通知邮件发送短信发送实时推送
- **技术**: WebSocket + JavaMail + Spring Boot

### 7. Dispatch Service (调度服务)
- **端口**: 8700/9999
- **职责**: 定时任务调度任务监控失败重试
- **技术**: XXL-Job

### 8. Common Module (公共模块)
- **职责**: 通用 CRUD 基类异步操作消息队列集成
- **技术**: MyBatis-Flex + RabbitMQ + Jackson

## 技术栈概览

### 后端核心框架
| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 2.7.6 | 核心应用框架 |
| Spring Cloud | 2021.0.5 | 微服务框架 |
| Spring Cloud Gateway | 3.1.4 | API网关 |
| Java | 17 | JDK版本 |

### 微服务组件
| 技术 | 版本 | 说明 |
|------|------|------|
| Nacos Discovery | 2021.0.5.0 | 服务注册与发现 |
| Nacos Config | 2021.0.5.0 | 配置中心 |
| OpenFeign | 3.1.5 | 声明式服务调用 |
| RabbitMQ Client | 5.16.0 | 消息队列客户端 |

### 数据层
| 技术 | 版本 | 说明 |
|------|------|------|
| MyBatis-Flex | 1.11.1 | 高性能ORM框架 |
| MySQL Connector | 8.0.31 | MySQL数据库驱动 |
| Spring Data Redis | 2.7.6 | Redis集成 |
| Elasticsearch Client | 7.17.7 | 搜索引擎客户端 |

### 安全认证
| 技术 | 版本 | 说明 |
|------|------|------|
| Keycloak Spring Boot Starter | 21.1.2 | Keycloak集成 |
| Spring OAuth2 Client | 5.7.5 | OAuth2客户端 |
| Sa-Token Spring Boot Starter | 1.44.0 | 轻量级权限认证框架 |

## 系统架构图

```
Client/前端

Gateway Service (8080)
API网关/限流

System Upload Search
Service Service Service
(8100) (8400) (8500)

Admin Notice Dispatch
Service Service Service
(8200) (8600) (8700)

基础设施/中间件

Nacos MySQL Redis
RabbitMQ ES Keycloak
```

## 服务端口规划

| 服务 | 端口 | 说明 |
|------|------|------|
| gateway-service | 8080 | API网关 |
| system-service | 8100 | 系统服务 |
| admin-service | 8200 | 管理服务 |
| upload-service | 8400 | 上传服务 |
| search-service | 8500 | 搜索服务 |
| notice-service | 8600 | 通知服务 |
| dispatch-service | 8700 | 调度服务 |

## 基础设施

### 服务注册中心
- **Nacos**: 127.0.0.1:8848

### 消息队列
- **RabbitMQ**: 106.52.209.154:5672
- 用户名: root
- 密码: 123456
- 虚拟主机: /root

### 缓存
- **Redis**: 127.0.0.1:6379

### 数据库
- **MySQL**: localhost:3306
- btc_saas_main - 主数据库
- bellis_log - 日志数据库

### 搜索引擎
- **Elasticsearch**: localhost:9200

### 认证服务
- **Keycloak**: 10.80.9.76:8080

## 核心特性

### 1. 异步数据操作
基于 RabbitMQ 的完整异步 CRUD 功能：
- 异步新增（INSERT 操作）
- 异步更新（UPDATE 操作）
- 异步删除（DELETE 操作）
- 自动重试机制（最多3次）
- 死信队列处理
- 操作隔离（独立队列）

### 2. 多租户支持
- 租户数据隔离
- 租户权限隔离
- 租户配置独立
- 租户计费管理

### 3. 安全认证
- Keycloak 统一认证
- OAuth2 授权
- JWT 令牌
- 细粒度权限控制

### 4. 高可用设计
- 服务注册与发现
- 负载均衡
- 熔断降级
- 分布式事务

## 相关文档

### 服务详细文档
- [Gateway Service](./backend/gateway-service) - API网关服务
- [System Service](./backend/system-service) - 系统核心服务
- [Admin Service](./backend/admin-service) - 后台管理服务
- [Upload Service](./backend/upload-service) - 文件上传服务
- [Search Service](./backend/search-service) - 搜索服务
- [Notice Service](./backend/notice-service) - 通知服务
- [Dispatch Service](./backend/dispatch-service) - 任务调度服务
- [Common Module](./backend/common) - 公共模块

### 开发指南
- [后端开发指南](./backend/) - 后端开发完整指南
- [部署指南](./deployment/) - 部署配置指南

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
1. **启动基础设施**（MySQLRedisRabbitMQNacosElasticsearch）
2. **构建项目**：`mvn clean install -DskipTests`
3. **启动服务**：先启动 Gateway 和 System 服务，再启动其他服务
4. **访问API文档**：http://localhost:8080/swagger-ui.html

---

**版本**: 3.0.0
**更新日期**: 2025-10-14
**维护团队**: BTC开发团队
