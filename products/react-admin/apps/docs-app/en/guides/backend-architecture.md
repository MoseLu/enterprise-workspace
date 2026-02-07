---
title: Backend Architecture Overview
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
sidebar_label: Backend Architecture
sidebar_order: 5
sidebar_group: guides-backend
---

# Backend Architecture Overview

BTC Shop Flow adopts an enterprise-level SaaS platform based on **Spring Cloud microservices architecture**, supporting multi-tenant, distributed deployment, and high-concurrency processing.

## Architecture Characteristics

- **Microservices Architecture**: Distributed microservices based on Spring Cloud
- **Security Authentication**: Keycloak + OAuth2 + Sa-Token multi-layer security
- **Async Processing**: Async data operations based on RabbitMQ
- **Data Persistence**: MyBatis-Flex high-performance ORM
- **Full-Text Search**: Elasticsearch search engine
- **Multi-Tenant**: Complete multi-tenant isolation solution
- **API Gateway**: Unified API entry point and routing
- **High Performance**: Redis cache + rate limiting + circuit breaking

## Core Services

### 1. Gateway Service (网关服务)
- **Port**: 8080
- **Responsibilities**: API gateway, routing, security authentication, rate limiting, circuit breaking
- **Technology**: Spring Cloud Gateway + OAuth2 + Redis

### 2. System Service (系统服务)
- **Port**: 8100
- **Responsibilities**: User management, permission management, menu management, tenant management
- **Technology**: Keycloak + MyBatis-Flex + Redis + RabbitMQ

### 3. Admin Service (管理服务)
- **Port**: 8200
- **Responsibilities**: System configuration, data statistics, system monitoring
- **Technology**: Spring Boot + Common Module + Sa-Token

### 4. Upload Service (上传服务)
- **Port**: 8400
- **Responsibilities**: File upload, cloud storage integration, image processing
- **Technology**: Alibaba Cloud OSS + Tencent Cloud COS + Thumbnailator

### 5. Search Service (搜索服务)
- **Port**: 8500
- **Responsibilities**: Full-text search, intelligent recommendations, search statistics
- **Technology**: Elasticsearch + Spring Data Elasticsearch

### 6. Notice Service (通知服务)
- **Port**: 8600
- **Responsibilities**: Message notifications, email sending, SMS sending, real-time push
- **Technology**: WebSocket + JavaMail + Spring Boot

### 7. Dispatch Service (调度服务)
- **Port**: 8700/9999
- **Responsibilities**: Scheduled task scheduling, task monitoring, failure retry
- **Technology**: XXL-Job

### 8. Common Module (公共模块)
- **Responsibilities**: Common CRUD base classes, async operations, message queue integration
- **Technology**: MyBatis-Flex + RabbitMQ + Jackson

## Technology Stack Overview

### Backend Core Framework
| Technology | Version | Description |
|------|------|------|
| Spring Boot | 2.7.6 | Core application framework |
| Spring Cloud | 2021.0.5 | Microservices framework |
| Spring Cloud Gateway | 3.1.4 | API Gateway |
| Java | 17 | JDK version |

### Microservices Components
| Technology | Version | Description |
|------|------|------|
| Nacos Discovery | 2021.0.5.0 | Service registration and discovery |
| Nacos Config | 2021.0.5.0 | Configuration center |
| OpenFeign | 3.1.5 | Declarative service invocation |
| RabbitMQ Client | 5.16.0 | Message queue client |

### Data Layer
| Technology | Version | Description |
|------|------|------|
| MyBatis-Flex | 1.11.1 | High-performance ORM framework |
| MySQL Connector | 8.0.31 | MySQL database driver |
| Spring Data Redis | 2.7.6 | Redis integration |
| Elasticsearch Client | 7.17.7 | Search engine client |

### Security Authentication
| Technology | Version | Description |
|------|------|------|
| Keycloak Spring Boot Starter | 21.1.2 | Keycloak integration |
| Spring OAuth2 Client | 5.7.5 | OAuth2 client |
| Sa-Token Spring Boot Starter | 1.44.0 | Lightweight permission authentication framework |

## System Architecture Diagram

```
Client/Frontend

Gateway Service (8080)
API Gateway/Rate Limiting

System    Upload    Search
Service   Service   Service
(8100)    (8400)    (8500)

Admin     Notice    Dispatch
Service   Service   Service
(8200)    (8600)    (8700)

Infrastructure/Middleware

Nacos    MySQL    Redis
RabbitMQ ES       Keycloak
```

## Service Port Planning

| Service | Port | Description |
|------|------|------|
| gateway-service | 8080 | API Gateway |
| system-service | 8100 | System Service |
| admin-service | 8200 | Admin Service |
| upload-service | 8400 | Upload Service |
| search-service | 8500 | Search Service |
| notice-service | 8600 | Notice Service |
| dispatch-service | 8700 | Dispatch Service |

## Infrastructure

### Service Registry
- **Nacos**: 127.0.0.1:8848

### Message Queue
- **RabbitMQ**: 106.52.209.154:5672
- Username: root
- Password: 123456
- Virtual Host: /root

### Cache
- **Redis**: 127.0.0.1:6379

### Database
- **MySQL**: localhost:3306
- btc_saas_main - Main database
- bellis_log - Log database

### Search Engine
- **Elasticsearch**: localhost:9200

### Authentication Service
- **Keycloak**: 10.80.9.76:8080

## Core Features

### 1. Async Data Operations
Complete async CRUD functionality based on RabbitMQ:
- Async insert (INSERT operations)
- Async update (UPDATE operations)
- Async delete (DELETE operations)
- Auto retry mechanism (up to 3 times)
- Dead letter queue handling
- Operation isolation (independent queues)

### 2. Multi-Tenant Support
- Tenant data isolation
- Tenant permission isolation
- Tenant configuration independence
- Tenant billing management

### 3. Security Authentication
- Keycloak unified authentication
- OAuth2 authorization
- JWT tokens
- Fine-grained permission control

### 4. High Availability Design
- Service registration and discovery
- Load balancing
- Circuit breaking and degradation
- Distributed transactions

## Related Documentation

### Service Detailed Documentation
- [Gateway Service](./backend/gateway-service) - API Gateway service
- [System Service](./backend/system-service) - System core service
- [Admin Service](./backend/admin-service) - Backend management service
- [Upload Service](./backend/upload-service) - File upload service
- [Search Service](./backend/search-service) - Search service
- [Notice Service](./backend/notice-service) - Notification service
- [Dispatch Service](./backend/dispatch-service) - Task scheduling service
- [Common Module](./backend/common) - Common module

### Development Guides
- [Backend Development Guide](./backend/) - Complete backend development guide
- [Deployment Guide](./deployment/) - Deployment configuration guide

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
1. **Start Infrastructure** (MySQL, Redis, RabbitMQ, Nacos, Elasticsearch)
2. **Build Project**: `mvn clean install -DskipTests`
3. **Start Services**: Start Gateway and System services first, then other services
4. **Access API Documentation**: http://localhost:8080/swagger-ui.html

---

**Version**: 3.0.0
**Last Updated**: 2025-10-14
**Maintenance Team**: BTC Development Team
