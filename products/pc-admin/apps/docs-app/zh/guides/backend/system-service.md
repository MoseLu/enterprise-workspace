---
title: System Service (系统服务)
type: guide
project: backend
owner: dev-team
created: '2025-10-13'
updated: '2025-10-14'
publish: true
tags:
  - guides
  - backend
  - system
  - microservices
sidebar_label: 系统服务
sidebar_order: 3
sidebar_group: guides-backend
---

# System Service (系统服务)

## 1. 服务说明

System Service是BTC Shop Flow 项目的**核心业务服务**，负责系统管理用户管理权限管理等核心功能

### 主要职责

- 用户管理（用户注册登录信息维护）
- 角色权限管理（RBAC权限模型）
- 菜单管理（动态菜单配置）
- 部门管理（组织架构管理）
- 租户管理（多租户支持）
- 用户档案管理
- 系统日志管理（登录日志短信日志邮件日志）

## 2. 技术栈

### 核心框架

| 技术        | 版本  | 说明         |
| ----------- | ----- | ------------ |
| Spring Boot | 2.7.6 | 核心框架     |
| Java        | 17    | JDK版本      |
| Maven       | 3.6+  | 项目构建工具 |

### Web层

| 技术                   | 版本  | 说明            |
| ---------------------- | ----- | --------------- |
| Spring Web             | 2.7.6 | REST API开发    |
| Swagger                | 3.0.0 | API文档自动生成 |
| Knife4j                | 2.0.2 | 增强版API文档UI |
| Springfox Boot Starter | 3.0.0 | Swagger集成     |

### 持久层

| 技术            | 版本   | 说明                  |
| --------------- | ------ | --------------------- |
| MyBatis-Flex    | 1.11.1 | 高性能MyBatis增强框架 |
| MySQL Connector | 8.0.31 | MySQL数据库驱动       |
| Druid           | 1.2.23 | 阿里巴巴数据库连接池  |

### 安全认证

| 技术                          | 版本        | 说明                       |
| ----------------------------- | ----------- | -------------------------- |
| Keycloak Spring Boot Starter  | 21.1.2      | Keycloak集成               |
| Keycloak Admin Client         | 21.1.2      | Keycloak管理客户端         |
| Spring Security               | 5.7.5       | Spring安全框架             |
| Spring OAuth2 Client          | 5.7.5       | OAuth2客户端支持           |
| Spring OAuth2 Resource Server | 5.7.5       | OAuth2资源服务器           |
| Sa-Token Spring Boot Starter  | 1.44.0      | 轻量级权限认证框架         |
| RESTEasy                      | 4.7.9.Final | JAX-RS实现（Keycloak依赖） |

### 消息队列

| 技术             | 版本   | 说明                |
| ---------------- | ------ | ------------------- |
| Spring Boot AMQP | 2.7.6  | Spring AMQP集成     |
| RabbitMQ Client  | 5.16.0 | RabbitMQ Java客户端 |

**功能特性**:

- 异步数据操作（新增更新删除）
- 消息驱动架构
- 死信队列机制
- 自动重试（最多3次）

### 微服务组件

| 技术            | 版本       | 说明           |
| --------------- | ---------- | -------------- |
| Nacos Discovery | 2021.0.5.0 | 服务注册与发现 |
| Nacos Config    | 2021.0.5.0 | 配置中心       |
| OpenFeign       | 3.1.5      | 声明式服务调用 |

### 缓存

| 技术              | 版本          | 说明        |
| ----------------- | ------------- | ----------- |
| Spring Data Redis | 2.7.6         | Redis集成   |
| Lettuce           | 6.2.1.RELEASE | Redis客户端 |

**应用场景**:

- 缓存管理
- 分布式锁
- 会话管理

### 工具库

| 技术       | 版本    | 说明                             |
| ---------- | ------- | -------------------------------- |
| Hutool All | 5.8.16  | Java工具类库（验证码加密日期等） |
| Lombok     | 1.18.24 | 简化Java代码                     |
| FastJSON   | 1.2.83  | 阿里巴巴JSON处理库               |

### 云服务集成

| 服务           | 版本/SDK | 说明                           |
| -------------- | -------- | ------------------------------ |
| 阿里云短信服务 | -        | 短信验证码发送                 |
| 阿里云OSS      | -        | 对象存储（通过upload-service） |

## 3. 模块结构

```
system-service/
src/main/java/com/btc/systemservice/
controller/ # 控制层
BtcSysUserController.java # 用户管理
BtcSysRoleController.java # 角色管理
BtcSysMenuController.java # 菜单管理
BtcSysDepartmentController.java # 部门管理
BtcSysTenantController.java # 租户管理
BtcSysPermissionController.java # 权限管理
BtcSysProfileController.java # 用户档案
service/ # 服务层
impl/ # 服务实现
mapper/ # 数据访问层
pojo/ # 实体类
BtcSysUser.java # 用户实体
BtcSysRole.java # 角色实体
BtcSysMenu.java # 菜单实体
BtcSysDepartment.java # 部门实体
BtcSysTenant.java # 租户实体
Domain.java # 领域实体
dto/ # 数据传输对象
config/ # 配置类
KeycloakConfig.java # Keycloak配置
RedisConfig.java # Redis配置
WebConfig.java # Web配置
exception/ # 异常处理
util/ # 工具类
src/main/resources/
mapper/ # MyBatis XML映射文件
static/ # 静态资源
i18n/ # 国际化资源
sql/ # 数据库脚本
application.properties # 配置文件
```

## 4. 核心功能

### 1. 用户管理系统

- 用户注册登录
- 用户信息CRUD
- 用户档案管理
- 用户密码管理
- 登录日志记录

### 2. 权限管理系统（RBAC）

- 角色管理
- 权限管理
- 菜单管理
- 角色-权限-菜单关联
- 基于租户的权限隔离

### 3. 组织架构管理

- 部门管理
- 租户管理
- 多租户数据隔离

### 4. 异步数据操作

- 异步新增用户/角色/部门等
- 异步更新数据
- 异步删除数据
- 基于RabbitMQ的消息驱动

### 5. 日志管理

- 登录日志（BtcSysLoginLog）
- 短信日志（BtcSysSmsLog）
- 邮件日志（BtcSysEmailLog）

## 5. 配置说明

### 数据库配置

```properties
# 主数据库
mybatis-flex.datasource.btc_saas_main.url=jdbc:mysql://localhost:3306/btc_saas_main
mybatis-flex.datasource.btc_saas_main.username=root
mybatis-flex.datasource.btc_saas_main.password=123456

# 日志数据库
mybatis-flex.datasource.bellis_log.url=jdbc:mysql://localhost:3306/bellis_log
mybatis-flex.datasource.bellis_log.username=root
mybatis-flex.datasource.bellis_log.password=123456
```

### Keycloak配置

```properties
keycloak.realm=user-realm
keycloak.auth-server-url=http://10.80.9.76:8080
keycloak.resource=user-client
keycloak.credentials.secret=5kEUpJgdiN7efrrWtqrPZIxYLI6AiV25

# Keycloak管理员配置
keycloak-admin.username=admin
keycloak-admin.password=admin
```

### Redis配置

```properties
spring.redis.host=127.0.0.1
spring.redis.port=6379
spring.redis.database=0
spring.redis.password=
```

### RabbitMQ配置

```properties
spring.rabbitmq.enabled=true
spring.rabbitmq.host=106.52.209.154
spring.rabbitmq.port=5672
spring.rabbitmq.username=root
spring.rabbitmq.password=123456
spring.rabbitmq.virtual-host=/root
```

### 阿里云短信配置

```properties
aliyun.template-code=SMS_495675094
aliyun.access-key-id=your-access-key-id
aliyun.access-key-secret=your-access-key-secret
```

## 6. API接口示例

### 用户管理

- `POST /api/user/user/async/add` - 异步新增用户
- `PUT /api/user/user/async/update` - 异步更新用户
- `DELETE /api/user/user/async/{id}` - 异步删除用户
- `GET /api/user/user/{id}` - 查询用户
- `GET /api/user/user/list` - 用户列表

### 角色管理

- `POST /api/user/role/asyncAddWithLogic` - 异步新增角色
- `PUT /api/user/role/async/update` - 异步更新角色
- `DELETE /api/user/role/async/{id}` - 异步删除角色

### 菜单管理

- `POST /api/user/menu/asyncAddWithTenant` - 异步新增菜单
- `PUT /api/user/menu/async/update` - 异步更新菜单
- `GET /api/user/menu/list` - 菜单列表

### 部门管理

- `POST /api/user/department/asyncAdd` - 异步新增部门
- `PUT /api/user/department/async/update` - 异步更新部门
- `GET /api/user/department/findByName` - 根据名称查询

## 7. 服务端口

- **默认端口**: 8100
- **Nacos注册**: systemService

## 8. 数据库表

### 系统管理表（btc_saas_main库）

- btc_sys_user - 用户表
- btc_sys_role - 角色表
- btc_sys_menu - 菜单表
- btc_sys_permission - 权限表
- btc_sys_department - 部门表
- btc_sys_tenant - 租户表
- btc_sys_user_profile - 用户档案表

### 日志表（bellis_log库）

- btc_sys_login_log - 登录日志
- btc_sys_sms_log - 短信日志
- btc_sys_email_log - 邮件日志

## 9. 服务依赖

### 内部服务

- **common**: 公共模块（CRUD基类异步操作）

### 外部服务

- **Nacos**: 服务注册中心（127.0.0.1:8848）
- **Keycloak**: 认证服务器（10.80.9.76:8080）
- **RabbitMQ**: 消息队列（106.52.209.154:5672）
- **Redis**: 缓存服务（127.0.0.1:6379）
- **MySQL**: 数据库服务（localhost:3306）

## 10. 已知问题

### Date字段序列化问题（已修复）

- **问题**: JSON序列化Date为时间戳导致ClassCastException
- **修复**: 使用字符串格式 `yyyy-MM-dd HH:mm:ss`
- **详情**: 参见`异步更新Date字段问题修复报告.md`

## 11. 相关文档

- 异步更新Date字段问题修复报告.md
- Dockerfile - Docker镜像构建
- HELP.md - Spring Boot帮助文档
