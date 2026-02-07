---
title: Gateway Service (网关服务)
type: guide
project: backend
owner: dev-team
created: '2025-10-13'
updated: '2025-10-14'
publish: true
tags:
- guides
- backend
- gateway
- microservices
sidebar_label: Gateway Service
sidebar_order: 2
sidebar_group: guides-backend
---

# Gateway Service (网关服务)

## 1. Service Description

Gateway Service is the **API Gateway service** of the BTC Shop Flow project, serving as the unified entry point of the system, responsible for request routing, load balancing, security authentication, rate limiting, circuit breaking, and other functions.

### Main Responsibilities
- Unified API entry point and routing
- Service load balancing
- Security authentication and authorization
- Interface rate limiting and circuit breaking
- Cross-origin handling (CORS)
- Logging and monitoring
- API documentation aggregation

## 2. Technology Stack

### Core Framework
| Technology | Version | Description |
|------|------|------|
| Spring Boot | 2.7.6 | Core framework |
| Spring Cloud | 2021.0.5 | Microservices framework |
| Java | 17 | JDK version |
| Maven | 3.6+ | Project build tool |

### Gateway Components
| Technology | Version | Description |
|------|------|------|
| Spring Cloud Gateway | 3.1.4 | Reactive API gateway |
| Spring WebFlux | 5.3.24 | Reactive web framework |
| Reactor Core | 3.4.25 | Reactive programming core library |

**Features**:
- Dynamic routing configuration
- Filter chain mechanism
- Predicate factory
- Load balancing

### Microservices Components
| Technology | Version | Description |
|------|------|------|
| Nacos Discovery | 2021.0.5.0 | Service registration and discovery |
| Nacos Config | 2021.0.5.0 | Dynamic configuration center |
| Spring Cloud LoadBalancer | 3.1.4 | Client-side load balancing |

### Security Authentication
| Technology | Version | Description |
|------|------|------|
| Spring Security | 5.7.5 | Spring security framework |
| Spring OAuth2 Client | 5.7.5 | OAuth2 client |
| Spring OAuth2 Resource Server | 5.7.5 | OAuth2 resource server |
| Keycloak Adapter | 21.1.2 | Keycloak identity authentication integration |

### Rate Limiting & Circuit Breaking
| Technology | Version | Description |
|------|------|------|
| Spring Data Redis | 2.7.6 | Redis integration (distributed rate limiting) |
| Lettuce | 6.2.1.RELEASE | Redis client |
| Bucket4j | 7.6.0 (Optional) | Token bucket rate limiting algorithm |

### Database
| Technology | Version | Description |
|------|------|------|
| MySQL Connector | 8.0.31 | MySQL database driver |
| MyBatis-Flex | 1.11.1 | Persistence layer framework (gateway configuration storage) |

### API Documentation
| Technology | Version | Description |
|------|------|------|
| Knife4j | 2.0.2 | API documentation aggregation display |
| Swagger | 3.0.0 | API specification and documentation generation |

### Utility Libraries
| Technology | Version | Description |
|------|------|------|
| Lombok | 1.18.24 | Simplify Java code |
| Hutool | 5.8.16 | Java utility library |
| Sa-Token | 1.44.0 | Permission authentication framework |

## 3. Module Structure

```
gateway-service/
src/main/java/com/btc/gatewayservice/
config/ # Configuration classes
CorsConfig.java # CORS configuration
RateLimitConfig.java # Rate limiting configuration
RateLimitFilterConfig.java # Rate limiting filter
RedisConfig.java # Redis configuration
SwaggerConfig.java # Swagger configuration
filter/ # Gateway filters
AuthGlobalFilter.java # Authentication filter
LogGlobalFilter.java # Logging filter
RateLimitGatewayFilter.java # Rate limiting filter
handler/ # Handlers
CustomExceptionHandler.java # Exception handling
GatewayServiceApplication.java # Main class
src/main/resources/
application.yml # Main configuration file
application-dev.yml # Development environment configuration
banner.txt # Startup banner
static/ # Static resources
```

## 4. Core Features

### 1. Route Forwarding
Dynamic routing configuration, supports:
- Path-based routing
- Service name-based routing
- Load balancing strategies
- Route weight configuration

### 2. Security Authentication
- OAuth2 authentication
- Keycloak integration
- JWT token verification
- Permission interception

### 3. Rate Limiting Protection
- Redis-based distributed rate limiting
- IP rate limiting
- User rate limiting
- Interface rate limiting
- Token bucket algorithm

### 4. Cross-Origin Handling
- Global CORS configuration
- Supports preflight requests
- Custom CORS rules

### 5. Logging & Monitoring
- Request logging
- Response time statistics
- Error log tracking

## 5. Configuration

### Route Configuration Example
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: system-service
          uri: lb://systemService
          predicates:
            - Path=/api/user/**
          filters:
            - StripPrefix=1
```

### Rate Limiting Configuration
```yaml
# Redis rate limiting configuration
rate-limit:
  enabled: true
  default-capacity: 100 # Default capacity
  default-tokens: 10 # Tokens consumed per request
  default-refill-period: 1s # Token refresh period
```

### Nacos Configuration
```properties
spring.cloud.nacos.server-addr=127.0.0.1:8848
spring.cloud.nacos.config.file-extension=yaml
```

## 6. Route Rules

### Current Route Configuration
- `/api/user/**` → system-service (User system service)
- `/api/admin/**` → admin-service (Admin service)
- `/api/supplier/**` → supplier-service (Supplier service)
- `/api/upload/**` → upload-service (Upload service)
- `/api/search/**` → search-service (Search service)
- `/api/notice/**` → notice-service (Notice service)
- `/api/dispatch/**` → dispatch-service (Dispatch service)

## 7. Service Port

- **Default Port**: Not explicitly specified in configuration (usually 8080)
- **Nacos Registration**: gateway-service

## 8. Security Mechanism

### Authentication Flow
```
Client Request → Gateway → Authentication Filter → Keycloak Verification → Backend Service

Token Verification

Permission Check

Rate Limiting Check
```

### Filter Chain
1. **AuthGlobalFilter**: Authentication filtering
2. **RateLimitGatewayFilter**: Rate limiting filtering
3. **LogGlobalFilter**: Logging filtering
4. **StripPrefix**: Remove path prefix

## 9. Rate Limiting Strategy

### IP Rate Limiting
- Maximum 100 requests per IP per second
- Returns 429 status code when limit exceeded

### Interface Rate Limiting
- Configure different rate limiting strategies based on interface paths
- Supports dynamic adjustment of rate limiting parameters

### User Rate Limiting
- Rate limiting based on user ID
- Prevents single user abuse

## 10. Service Dependencies

### Internal Service Dependencies
- All microservices (via route forwarding)

### External Service Dependencies
- **Nacos**: Service discovery (127.0.0.1:8848)
- **Keycloak**: Authentication service (10.80.9.76:8080)
- **Redis**: Rate limiting storage (127.0.0.1:6379)
- **MySQL**: Gateway configuration storage

## 11. Notes

1. **Gateway Performance**: As unified entry point, ensure high performance and high availability
2. **Rate Limiting Configuration**: Adjust rate limiting parameters based on actual business volume
3. **Authentication Configuration**: Ensure Keycloak configuration is correct
4. **Redis Connection**: Rate limiting depends on Redis, ensure connection is normal
5. **Route Updates**: Supports dynamic routing, can be updated via Nacos configuration center

## Docker Support

Provides Dockerfile support for containerized deployment:
```dockerfile
FROM openjdk:17-jdk-slim
VOLUME /tmp
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

## 12. Related Documentation

- Spring Cloud Gateway Official Documentation: https://spring.io/projects/spring-cloud-gateway
- Nacos Official Documentation: https://nacos.io
- Keycloak Official Documentation: https://www.keycloak.org
