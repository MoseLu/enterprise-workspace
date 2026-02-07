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
sidebar_label: System Service
sidebar_order: 3
sidebar_group: guides-backend
---

# System Service (系统服务)

## 1. Service Description

System Service is the **core business service** of the BTC Shop Flow project, responsible for system management, user management, permission management, and other core functions.

### Main Responsibilities

- User management (user registration, login, information maintenance)
- Role and permission management (RBAC permission model)
- Menu management (dynamic menu configuration)
- Department management (organizational structure management)
- Tenant management (multi-tenant support)
- User profile management
- System log management (login logs, SMS logs, email logs)

## 2. Technology Stack

### Core Framework

| Technology        | Version  | Description         |
| ----------- | ----- | ------------ |
| Spring Boot | 2.7.6 | Core framework     |
| Java        | 17    | JDK version      |
| Maven       | 3.6+  | Project build tool |

### Web Layer

| Technology                   | Version  | Description            |
| ---------------------- | ----- | --------------- |
| Spring Web             | 2.7.6 | REST API development    |
| Swagger                | 3.0.0 | API documentation auto-generation |
| Knife4j                | 2.0.2 | Enhanced API documentation UI |
| Springfox Boot Starter | 3.0.0 | Swagger integration     |

### Persistence Layer

| Technology            | Version   | Description                  |
| --------------- | ------ | --------------------- |
| MyBatis-Flex    | 1.11.1 | High-performance MyBatis enhancement framework |
| MySQL Connector | 8.0.31 | MySQL database driver       |
| Druid           | 1.2.23 | Alibaba database connection pool  |

### Security Authentication

| Technology                          | Version        | Description                       |
| ----------------------------- | ----------- | -------------------------- |
| Keycloak Spring Boot Starter  | 21.1.2      | Keycloak integration               |
| Keycloak Admin Client         | 21.1.2      | Keycloak management client         |
| Spring Security               | 5.7.5       | Spring security framework             |
| Spring OAuth2 Client          | 5.7.5       | OAuth2 client support           |
| Spring OAuth2 Resource Server | 5.7.5       | OAuth2 resource server           |
| Sa-Token Spring Boot Starter  | 1.44.0      | Lightweight permission authentication framework         |
| RESTEasy                      | 4.7.9.Final | JAX-RS implementation (Keycloak dependency) |

### Message Queue

| Technology             | Version   | Description                |
| ---------------- | ------ | ------------------- |
| Spring Boot AMQP | 2.7.6  | Spring AMQP integration     |
| RabbitMQ Client  | 5.16.0 | RabbitMQ Java client |

**Features**:

- Async data operations (insert, update, delete)
- Message-driven architecture
- Dead letter queue mechanism
- Auto retry (up to 3 times)

### Microservices Components

| Technology            | Version       | Description           |
| --------------- | ---------- | -------------- |
| Nacos Discovery | 2021.0.5.0 | Service registration and discovery |
| Nacos Config    | 2021.0.5.0 | Configuration center       |
| OpenFeign       | 3.1.5      | Declarative service invocation |

### Cache

| Technology              | Version          | Description        |
| ----------------- | ------------- | ----------- |
| Spring Data Redis | 2.7.6         | Redis integration   |
| Lettuce           | 6.2.1.RELEASE | Redis client |

**Use Cases**:

- Cache management
- Distributed locks
- Session management

### Utility Libraries

| Technology       | Version    | Description                             |
| ---------- | ------- | -------------------------------- |
| Hutool All | 5.8.16  | Java utility library (verification code, encryption, date, etc.) |
| Lombok     | 1.18.24 | Simplify Java code                     |
| FastJSON   | 1.2.83  | Alibaba JSON processing library               |

### Cloud Service Integration

| Service           | Version/SDK | Description                           |
| -------------- | -------- | ------------------------------ |
| Alibaba Cloud SMS Service | -        | SMS verification code sending                 |
| Alibaba Cloud OSS      | -        | Object storage (via upload-service) |

## 3. Module Structure

```
system-service/
src/main/java/com/btc/systemservice/
controller/ # Controller layer
BtcSysUserController.java # User management
BtcSysRoleController.java # Role management
BtcSysMenuController.java # Menu management
BtcSysDepartmentController.java # Department management
BtcSysTenantController.java # Tenant management
BtcSysPermissionController.java # Permission management
BtcSysProfileController.java # User profile
service/ # Service layer
impl/ # Service implementation
mapper/ # Data access layer
pojo/ # Entity classes
BtcSysUser.java # User entity
BtcSysRole.java # Role entity
BtcSysMenu.java # Menu entity
BtcSysDepartment.java # Department entity
BtcSysTenant.java # Tenant entity
Domain.java # Domain entity
dto/ # Data transfer objects
config/ # Configuration classes
KeycloakConfig.java # Keycloak configuration
RedisConfig.java # Redis configuration
WebConfig.java # Web configuration
exception/ # Exception handling
util/ # Utility classes
src/main/resources/
mapper/ # MyBatis XML mapping files
static/ # Static resources
i18n/ # Internationalization resources
sql/ # Database scripts
application.properties # Configuration file
```

## 4. Core Features

### 1. User Management System

- User registration and login
- User information CRUD
- User profile management
- User password management
- Login log recording

### 2. Permission Management System (RBAC)

- Role management
- Permission management
- Menu management
- Role-permission-menu associations
- Tenant-based permission isolation

### 3. Organizational Structure Management

- Department management
- Tenant management
- Multi-tenant data isolation

### 4. Async Data Operations

- Async insert for users/roles/departments, etc.
- Async data updates
- Async data deletion
- RabbitMQ-based message-driven architecture

### 5. Log Management

- Login logs (BtcSysLoginLog)
- SMS logs (BtcSysSmsLog)
- Email logs (BtcSysEmailLog)

## 5. Configuration

### Database Configuration

```properties
# Main database
mybatis-flex.datasource.btc_saas_main.url=jdbc:mysql://localhost:3306/btc_saas_main
mybatis-flex.datasource.btc_saas_main.username=root
mybatis-flex.datasource.btc_saas_main.password=123456

# Log database
mybatis-flex.datasource.bellis_log.url=jdbc:mysql://localhost:3306/bellis_log
mybatis-flex.datasource.bellis_log.username=root
mybatis-flex.datasource.bellis_log.password=123456
```

### Keycloak Configuration

```properties
keycloak.realm=user-realm
keycloak.auth-server-url=http://10.80.9.76:8080
keycloak.resource=user-client
keycloak.credentials.secret=5kEUpJgdiN7efrrWtqrPZIxYLI6AiV25

# Keycloak administrator configuration
keycloak-admin.username=admin
keycloak-admin.password=admin
```

### Redis Configuration

```properties
spring.redis.host=127.0.0.1
spring.redis.port=6379
spring.redis.database=0
spring.redis.password=
```

### RabbitMQ Configuration

```properties
spring.rabbitmq.enabled=true
spring.rabbitmq.host=106.52.209.154
spring.rabbitmq.port=5672
spring.rabbitmq.username=root
spring.rabbitmq.password=123456
spring.rabbitmq.virtual-host=/root
```

### Alibaba Cloud SMS Configuration

```properties
aliyun.template-code=SMS_495675094
aliyun.access-key-id=your-access-key-id
aliyun.access-key-secret=your-access-key-secret
```

## 6. API Interface Examples

### User Management

- `POST /api/user/user/async/add` - Async insert user
- `PUT /api/user/user/async/update` - Async update user
- `DELETE /api/user/user/async/{id}` - Async delete user
- `GET /api/user/user/{id}` - Query user
- `GET /api/user/user/list` - User list

### Role Management

- `POST /api/user/role/asyncAddWithLogic` - Async insert role
- `PUT /api/user/role/async/update` - Async update role
- `DELETE /api/user/role/async/{id}` - Async delete role

### Menu Management

- `POST /api/user/menu/asyncAddWithTenant` - Async insert menu
- `PUT /api/user/menu/async/update` - Async update menu
- `GET /api/user/menu/list` - Menu list

### Department Management

- `POST /api/user/department/asyncAdd` - Async insert department
- `PUT /api/user/department/async/update` - Async update department
- `GET /api/user/department/findByName` - Query by name

## 7. Service Port

- **Default Port**: 8100
- **Nacos Registration**: systemService

## 8. Database Tables

### System Management Tables (btc_saas_main database)

- btc_sys_user - User table
- btc_sys_role - Role table
- btc_sys_menu - Menu table
- btc_sys_permission - Permission table
- btc_sys_department - Department table
- btc_sys_tenant - Tenant table
- btc_sys_user_profile - User profile table

### Log Tables (bellis_log database)

- btc_sys_login_log - Login logs
- btc_sys_sms_log - SMS logs
- btc_sys_email_log - Email logs

## 9. Service Dependencies

### Internal Services

- **common**: Common module (CRUD base classes, async operations)

### External Services

- **Nacos**: Service registry (127.0.0.1:8848)
- **Keycloak**: Authentication server (10.80.9.76:8080)
- **RabbitMQ**: Message queue (106.52.209.154:5672)
- **Redis**: Cache service (127.0.0.1:6379)
- **MySQL**: Database service (localhost:3306)

## 10. Known Issues

### Date Field Serialization Issue (Fixed)

- **Issue**: JSON serialization of Date as timestamp causing ClassCastException
- **Fix**: Use string format `yyyy-MM-dd HH:mm:ss`
- **Details**: See `Async Update Date Field Issue Fix Report.md`

## 11. Related Documentation

- Async Update Date Field Issue Fix Report.md
- Dockerfile - Docker image build
- HELP.md - Spring Boot help documentation
