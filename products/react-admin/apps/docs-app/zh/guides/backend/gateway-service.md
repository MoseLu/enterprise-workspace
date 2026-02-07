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
sidebar_label: 网关服务
sidebar_order: 2
sidebar_group: guides-backend
---

# Gateway Service (网关服务)

## 1. 服务说明

Gateway Service是BTC Shop Flow 项目的**API网关服务**，作为系统的统一入口，负责请求路由负载均衡安全认证限流熔断等功能

### 主要职责
- 统一API入口和路由转发
- 服务负载均衡
- 安全认证和授权
- 接口限流和熔断
- 跨域处理（CORS）
- 日志记录和监控
- API文档聚合

## 2. 技术栈

### 核心框架
| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 2.7.6 | 核心框架 |
| Spring Cloud | 2021.0.5 | 微服务框架 |
| Java | 17 | JDK版本 |
| Maven | 3.6+ | 项目构建工具 |

### 网关组件
| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Cloud Gateway | 3.1.4 | 响应式API网关 |
| Spring WebFlux | 5.3.24 | 响应式Web框架 |
| Reactor Core | 3.4.25 | 响应式编程核心库 |

**功能特性**:
- 动态路由配置
- 过滤器链机制
- 断言工厂
- 负载均衡

### 微服务组件
| 技术 | 版本 | 说明 |
|------|------|------|
| Nacos Discovery | 2021.0.5.0 | 服务注册与发现 |
| Nacos Config | 2021.0.5.0 | 动态配置中心 |
| Spring Cloud LoadBalancer | 3.1.4 | 客户端负载均衡 |

### 安全认证
| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Security | 5.7.5 | Spring安全框架 |
| Spring OAuth2 Client | 5.7.5 | OAuth2客户端 |
| Spring OAuth2 Resource Server | 5.7.5 | OAuth2资源服务器 |
| Keycloak Adapter | 21.1.2 | Keycloak身份认证集成 |

### 限流熔断
| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Data Redis | 2.7.6 | Redis集成（分布式限流） |
| Lettuce | 6.2.1.RELEASE | Redis客户端 |
| Bucket4j | 7.6.0 (可选) | 令牌桶限流算法 |

### 数据库
| 技术 | 版本 | 说明 |
|------|------|------|
| MySQL Connector | 8.0.31 | MySQL数据库驱动 |
| MyBatis-Flex | 1.11.1 | 持久层框架（存储网关配置） |

### API文档
| 技术 | 版本 | 说明 |
|------|------|------|
| Knife4j | 2.0.2 | API文档聚合展示 |
| Swagger | 3.0.0 | API规范和文档生成 |

### 工具库
| 技术 | 版本 | 说明 |
|------|------|------|
| Lombok | 1.18.24 | 简化Java代码 |
| Hutool | 5.8.16 | Java工具类库 |
| Sa-Token | 1.44.0 | 权限认证框架 |

## 3. 模块结构

```
gateway-service/
src/main/java/com/btc/gatewayservice/
config/ # 配置类
CorsConfig.java # 跨域配置
RateLimitConfig.java # 限流配置
RateLimitFilterConfig.java # 限流过滤器
RedisConfig.java # Redis配置
SwaggerConfig.java # Swagger配置
filter/ # 网关过滤器
AuthGlobalFilter.java # 认证过滤器
LogGlobalFilter.java # 日志过滤器
RateLimitGatewayFilter.java # 限流过滤器
handler/ # 处理器
CustomExceptionHandler.java # 异常处理
GatewayServiceApplication.java # 启动类
src/main/resources/
application.yml # 主配置文件
application-dev.yml # 开发环境配置
banner.txt # 启动横幅
static/ # 静态资源
```

## 4. 核心功能

### 1. 路由转发
动态路由配置，支持：
- 基于路径的路由
- 基于服务名的路由
- 负载均衡策略
- 路由权重配置

### 2. 安全认证
- OAuth2认证
- Keycloak集成
- JWT令牌验证
- 权限拦截

### 3. 限流保护
- 基于Redis的分布式限流
- IP限流
- 用户限流
- 接口限流
- 令牌桶算法

### 4. 跨域处理
- 全局CORS配置
- 支持预检请求
- 自定义跨域规则

### 5. 日志监控
- 请求日志记录
- 响应时间统计
- 错误日志追踪

## 5. 配置说明

### 路由配置示例
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

### 限流配置
```yaml
# Redis限流配置
rate-limit:
enabled: true
default-capacity: 100 # 默认容量
default-tokens: 10 # 每次请求消耗令牌数
default-refill-period: 1s # 令牌刷新周期
```

### Nacos配置
```properties
spring.cloud.nacos.server-addr=127.0.0.1:8848
spring.cloud.nacos.config.file-extension=yaml
```

## 6. 路由规则

### 当前路由配置
- `/api/user/**` system-service（用户系统服务）
- `/api/admin/**` admin-service（管理服务）
- `/api/supplier/**` supplier-service（供应商服务）
- `/api/upload/**` upload-service（上传服务）
- `/api/search/**` search-service（搜索服务）
- `/api/notice/**` notice-service（通知服务）
- `/api/dispatch/**` dispatch-service（调度服务）

## 7. 服务端口

- **默认端口**: 未在配置中明确指定（通常8080）
- **Nacos注册**: gateway-service

## 8. 安全机制

### 认证流程
```
客户端请求 Gateway 认证过滤器 Keycloak验证 后端服务

Token验证

权限检查

限流检查
```

### 过滤器链
1. **AuthGlobalFilter**: 认证过滤
2. **RateLimitGatewayFilter**: 限流过滤
3. **LogGlobalFilter**: 日志过滤
4. **StripPrefix**: 去除路径前缀

## 9. 限流策略

### IP限流
- 每IP每秒最多100次请求
- 超出限制返回429状态码

### 接口限流
- 根据接口路径配置不同限流策略
- 支持动态调整限流参数

### 用户限流
- 根据用户ID进行限流
- 防止单用户滥用

## 10. 服务依赖

### 内部服务依赖
- 所有微服务（通过路由转发）

### 外部服务依赖
- **Nacos**: 服务发现（127.0.0.1:8848）
- **Keycloak**: 认证服务（10.80.9.76:8080）
- **Redis**: 限流存储（127.0.0.1:6379）
- **MySQL**: 网关配置存储

## 11. 注意事项

1. **网关性能**: 作为统一入口，需确保高性能和高可用
2. **限流配置**: 根据实际业务量调整限流参数
3. **认证配置**: 确保Keycloak配置正确
4. **Redis连接**: 限流功能依赖Redis，需确保连接正常
5. **路由更新**: 支持动态路由，可通过Nacos配置中心更新

## Docker支持

提供Dockerfile支持容器化部署：
```dockerfile
FROM openjdk:17-jdk-slim
VOLUME /tmp
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

## 12. 相关文档

- Spring Cloud Gateway官方文档: https://spring.io/projects/spring-cloud-gateway
- Nacos官方文档: https://nacos.io
- Keycloak官方文档: https://www.keycloak.org
