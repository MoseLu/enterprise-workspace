---
title: Admin Service (管理服务)
type: guide
project: backend
owner: dev-team
created: '2025-10-13'
updated: '2025-10-14'
publish: true
tags:
- guides
- backend
- admin
- microservices
sidebar_label: 管理服务
sidebar_order: 4
sidebar_group: guides-backend
---

# Admin Service (管理服务)

## 1. 服务说明

Admin Service是BTC Shop Flow 项目的**后台管理服务**，为管理员提供系统管理数据统计配置管理等后台功能

### 主要职责
- 系统配置管理
- 数据统计和报表
- 系统监控
- 操作日志查询
- 系统参数配置
- 管理员专用功能

## 2. 技术栈

### 核心框架
| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 2.7.6 | 核心框架 |
| Java | 17 | JDK版本 |
| Maven | 3.6+ | 项目构建工具 |

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

### 公共模块
| 模块 | 版本 | 说明 |
|------|------|------|
| common | 0.0.1-SNAPSHOT | 基础CRUD异步操作支持 |

### 工具库
| 技术 | 版本 | 说明 |
|------|------|------|
| Lombok | 1.18.24 | 简化Java代码 |
| Sa-Token | 1.44.0 | 权限认证框架 |

## 3. 模块结构

```
admin-service/
src/main/java/com/btc/adminservice/
controller/ # 控制层
AdminController.java # 管理接口
ConfigController.java # 配置管理
StatisticsController.java # 统计接口
service/ # 服务层
AdminService.java # 管理服务
StatisticsService.java # 统计服务
pojo/ # 实体类
AdminServiceApplication.java # 启动类
src/main/resources/
application.properties # 配置文件
banner.txt # 启动横幅
static/ # 静态资源
```

## 4. 核心功能

### 1. 系统配置管理
- 系统参数配置
- 业务规则配置
- 字典数据管理
- 配置版本管理

### 2. 数据统计
- 用户统计
- 订单统计
- 销售统计
- 实时数据监控

### 3. 报表功能
- 日报表生成
- 周报表生成
- 月报表生成
- 自定义报表

### 4. 日志查询
- 操作日志查询
- 系统日志查询
- 审计日志查询
- 日志导出

### 5. 系统监控
- 服务健康状态
- 接口调用统计
- 错误率监控
- 性能指标

## 5. API接口

### 配置管理
- `GET /api/admin/config/list` - 配置列表
- `POST /api/admin/config` - 新增配置
- `PUT /api/admin/config` - 更新配置
- `DELETE /api/admin/config/{id}` - 删除配置

### 数据统计
- `GET /api/admin/stats/user` - 用户统计
- `GET /api/admin/stats/order` - 订单统计
- `GET /api/admin/stats/sales` - 销售统计
- `GET /api/admin/stats/dashboard` - 仪表盘数据

### 日志管理
- `GET /api/admin/log/operation` - 操作日志
- `GET /api/admin/log/system` - 系统日志
- `GET /api/admin/log/export` - 日志导出

## 6. 配置说明

### Nacos配置
```properties
spring.cloud.nacos.server-addr=127.0.0.1:8848
spring.cloud.nacos.config.file-extension=yaml
```

### 数据库配置
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/btc_admin
spring.datasource.username=root
spring.datasource.password=123456
```

## 7. 服务端口

- **默认端口**: 未明确指定
- **Nacos注册**: admin-service

## 8. 服务依赖

### 内部服务
- **common**: 公共模块
- **system-service**: 用户和权限数据

### 外部服务
- **Nacos**: 服务注册中心
- **MySQL**: 数据存储

## 9. 注意事项

1. **权限控制**: 管理接口需严格的权限控制
2. **数据安全**: 敏感配置需加密存储
3. **操作审计**: 所有管理操作需记录审计日志
4. **性能优化**: 大数据量统计使用缓存或异步处理
