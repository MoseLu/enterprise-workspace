---
title: Backend Development Guide
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
sidebar_label: Backend Development Guide
sidebar_order: 1
sidebar_group: guides-backend
sidebar_collapsed: false
---

# Backend Development Guide

BTC Shop Flow backend adopts a microservices architecture based on Spring Cloud, providing complete backend service development, deployment, and maintenance guides.

## Architecture Overview

### Microservices Architecture
- **API Gateway**: Unified entry point, routing, security authentication
- **Core Services**: User management, permission management, system management
- **Business Services**: File upload, search service, notification service
- **Base Services**: Task scheduling, common modules

### Technology Stack
- **Framework**: Spring Boot 2.7.6 + Spring Cloud 2021.0.5
- **Database**: MySQL 8.0 + MyBatis-Flex 1.11.1
- **Cache**: Redis 5.0 + Spring Data Redis
- **Message Queue**: RabbitMQ 3.8 + Spring Boot AMQP
- **Search Engine**: Elasticsearch 7.x + Spring Data Elasticsearch
- **Service Registry**: Nacos 2.x
- **Security Authentication**: Keycloak + OAuth2 + Sa-Token

## Service Documentation

### Core Services
- **[Gateway Service (网关服务)](./gateway-service)** - API Gateway, unified entry point
- **[System Service (系统服务)](./system-service)** - User management, permission management
- **[Admin Service (管理服务)](./admin-service)** - System configuration, data statistics

### Business Services
- **[Upload Service (上传服务)](./upload-service)** - File upload, cloud storage
- **[Search Service (搜索服务)](./search-service)** - Full-text search, intelligent recommendations
- **[Notice Service (通知服务)](./notice-service)** - Message notifications, email, SMS

### Base Services
- **[Dispatch Service (调度服务)](./dispatch-service)** - Scheduled task scheduling
- **[Common Module (公共模块)](./common)** - Common CRUD, async operations

## Quick Start

### Environment Requirements
- JDK 17+
- Maven 3.6+
- MySQL 8.0+
- Redis 5.0+
- RabbitMQ 3.8+
- Elasticsearch 7.x
- Nacos 2.x

### Startup Steps

1. **Start Infrastructure**
```bash
# Start MySQL, Redis, RabbitMQ, Nacos, Elasticsearch
```

2. **Build Project**
```bash
mvn clean install -DskipTests
```

3. **Start Services**
```bash
# 1. Start gateway service
cd gateway-service
mvn spring-boot:run

# 2. Start system service
cd system-service
mvn spring-boot:run

# 3. Start other services (as needed)
```

4. **Access API Documentation**
- Swagger UI: http://localhost:8080/swagger-ui.html
- Knife4j: http://localhost:8080/doc.html

## Service Architecture

### Port Planning
| Service | Port | Description |
|------|------|------|
| gateway-service | 8080 | API Gateway |
| system-service | 8100 | System Service |
| admin-service | 8200 | Admin Service |
| upload-service | 8400 | Upload Service |
| search-service | 8500 | Search Service |
| notice-service | 8600 | Notice Service |
| dispatch-service | 8700 | Dispatch Service |

### Dependencies
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

## Development Standards

### Code Standards
- Use Lombok to simplify code
- Unified exception handling
- Unified return result encapsulation (DataResult)
- RESTful API design

### Database Standards
- Table names use snake_case: btc_sys_user
- Field names use snake_case: user_name
- Required fields: id, create_time, update_time
- Soft delete field: is_deleted

### API Standards
- Unified use of /api prefix
- Version control: /api/v1, /api/v2
- Async operations: /async path
- Batch operations: /batch path

## Development Tools

### API Documentation
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Knife4j**: http://localhost:8080/doc.html

### Monitoring Tools
- **Nacos Console**: http://localhost:8848/nacos
- **XXL-Job Console**: http://localhost:8080/xxl-job-admin

### Database Tools
- **MySQL**: localhost:3306
- **Redis**: localhost:6379
- **Elasticsearch**: localhost:9200

## Related Documentation

### Architecture Design
- [Backend Architecture Overview](../backend-architecture) - Overall architecture design
- [Deployment Guide](../deployment/) - Deployment configuration guide

### Development Guides
- [Component Development Guide](/en/guides/components/) - Frontend component development
- [Form Processing Guide](/en/guides/forms/) - Form development standards
- [Integration Deployment Guide](/en/guides/integration/) - System integration guide

## Best Practices

### Service Design
1. **Single Responsibility**: Each service focuses on specific functionality
2. **Low Coupling**: Clear dependency relationships between services
3. **High Cohesion**: Related functionality organized together
4. **Testable**: Provide complete test coverage

### Data Management
1. **Async Operations**: Use RabbitMQ to handle time-consuming operations
2. **Cache Strategy**: Reasonable use of Redis cache
3. **Data Isolation**: Multi-tenant data isolation
4. **Transaction Management**: Distributed transaction handling

### Security Design
1. **Authentication & Authorization**: Keycloak + OAuth2
2. **Permission Control**: Fine-grained permission management
3. **Data Encryption**: Encrypted storage of sensitive data
4. **Access Control**: API access rate limiting and circuit breaking

---

**Version**: 3.0.0
**Last Updated**: 2025-10-14
**Maintenance Team**: BTC Development Team
