---
title: Common Module (公共模块)
type: guide
project: backend
owner: dev-team
created: '2025-10-13'
updated: '2025-10-14'
publish: true
tags:
  - guides
  - backend
  - common
  - microservices
sidebar_label: 公共模块
sidebar_order: 9
sidebar_group: guides-backend
---

# Common Module (公共模块)

## 1. 模块说明

Common模块是整个BTC Shop Flow 项目的**核心公共模块**，为所有业务服务提供通用的基础功能工具类和异步操作支持

### 主要职责
- 提供通用的CRUD操作基类（BaseServiceBaseControllerBaseMapper）
- 封装异步数据操作功能（基于RabbitMQ）
- 提供统一的返回结果封装（DataResultJsonResult）
- 提供公共的工具类和异常处理
- 提供通用的配置和注解

## 2. 技术栈

### 核心框架
- **Spring Boot**: 2.7.6
- **Java**: 17
- **Maven**: 项目构建工具

### 持久层
| 技术 | 版本 | 说明 |
|------|------|------|
| MyBatis-Flex | 1.11.1 | MyBatis增强工具，提供强大的CRUD功能 |
| MyBatis-Flex Codegen | 1.11.1 | 代码生成器支持 |

### 消息队列
| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Boot AMQP | 2.7.6 | Spring AMQP集成 |
| RabbitMQ Client | 5.16.0 (传递依赖) | RabbitMQ Java客户端 |

**功能特性**:
- 支持异步新增更新删除操作
- 死信队列机制
- 自动重试机制（最多3次）
- 三队列隔离架构

### JSON处理
| 技术 | 版本 | 说明 |
|------|------|------|
| Jackson Databind | 2.13.4.2 | JSON序列化/反序列化 |
| Jackson Datatype JSR310 | 2.13.4 | Java 8时间类型支持 |

**配置特性**:
- 自定义Date序列化格式（yyyy-MM-dd HH:mm:ss）
- JavaTimeModule支持LocalDateTime
- 忽略未知属性配置
- 接受空字符串为null

### 工具库
| 技术 | 版本 | 说明 |
|------|------|------|
| Lombok | 1.18.24 | 简化Java代码，减少样板代码 |
| Swagger | 3.0.0 | API文档生成 |
| Sa-Token | 1.44.0 | 轻量级权限认证框架 |

## 3. 模块结构

```
common/
src/main/java/com/btc/common/
annotation/ # 自定义注解
ApiOperation.java
config/ # 配置类
CommonAutoConfiguration.java # 自动配置类
MyBatisFlexConfiguration.java # MyBatis-Flex配置
RabbitMQConfig.java # RabbitMQ配置
controller/ # 基础控制器
BaseController.java # 提供通用CRUD接口
dto/ # 数据传输对象
AsyncInsertMessage.java # 异步操作消息
PageQuery.java # 分页查询参数
PageResult.java # 分页结果
entity/ # 基础实体
BaseEntity.java
enumeration/ # 枚举类
SmsCodeEnum.java
exception/ # 异常处理
BaseResponseCode.java
ResponseCodeInterface.java
mapper/ # 基础Mapper
BaseMapper.java
pojo/ # POJO对象
EmailObject.java
routes/ # 路由常量
Routes.java
service/ # 服务接口
AsyncInsertService.java # 异步操作服务接口
BaseService.java # 基础服务接口
impl/
AsyncInsertMessageConsumer.java # 消息消费者
AsyncInsertServiceImpl.java # 异步操作实现
BaseServiceImpl.java # 基础服务实现
util/ # 工具类
DataResult.java # 统一返回结果
JsonResult.java # JSON返回结果
src/main/resources/
META-INF/
spring.factories # Spring自动配置
application.properties # 配置文件
```

## 4. 核心功能

### 1. 通用CRUD基类

#### BaseService接口
提供标准的数据操作接口：
- **异步新增**: asyncSave(), asyncSaveBatch()
- **异步更新**: asyncUpdateById(), asyncUpdateBatchById()
- **异步删除**: asyncRemoveById(), asyncRemoveByIds()
- **查询操作**: getById(), list(), page()

#### BaseController类
提供标准的REST API接口：
- **POST** `/async/add` - 异步新增
- **PUT** `/async/update` - 异步更新
- **DELETE** `/async/{id}` - 异步删除
- **GET** `/{id}` - 查询单个
- **GET** `/list` - 查询列表
- **GET** `/page` - 分页查询

### 2. RabbitMQ异步操作

#### 队列架构（三队列隔离）
- **INSERT队列**: async.insert.queue（新增操作）
- **UPDATE队列**: async.update.queue（更新操作）
- **DELETE队列**: async.delete.queue（删除操作）

#### 特性
- 操作立即返回消息ID
- 后台异步处理
- 失败自动重试（最多3次）
- 死信队列处理最终失败的消息
- 完整的日志和监控

### 3. Date字段序列化优化
```java
// Date字段使用字符串格式序列化
格式: yyyy-MM-dd HH:mm:ss
示例: "2025-10-13 13:50:27"
```

避免了时间戳格式导致的ClassCastException问题

## 5. 配置说明

### RabbitMQ配置
```properties
spring.rabbitmq.enabled=true
spring.rabbitmq.host=106.52.209.154
spring.rabbitmq.port=5672
spring.rabbitmq.username=root
spring.rabbitmq.password=123456
spring.rabbitmq.virtual-host=/root
spring.rabbitmq.publisher-confirm-type=correlated
spring.rabbitmq.publisher-returns=true
```

### 启用/禁用RabbitMQ
- 启用: `spring.rabbitmq.enabled=true`
- 禁用: `spring.rabbitmq.enabled=false`

## 6. 使用方式

### 1. 在Service中继承BaseServiceImpl
```java
@Service
public class DepartmentService extends BaseServiceImpl<DepartmentMapper, Department>
implements IDepartmentService {

@Resource
private DepartmentMapper departmentMapper;

@Override
protected DepartmentMapper baseMapper() {
return departmentMapper;
}
}
```

### 2. 在Controller中继承BaseController
```java
@RestController
@RequestMapping("/department")
public class DepartmentController extends BaseController<DepartmentService, Department> {

@Resource
private DepartmentService departmentService;

@Override
protected DepartmentService baseService() {
return departmentService;
}
}
```

### 3. 使用异步操作
```java
// 异步新增
String messageId = departmentService.asyncSave(department);

// 异步更新
String messageId = departmentService.asyncUpdateById(department);

// 异步删除
String messageId = departmentService.asyncRemoveById(id);
```

## 7. 依赖关系

### 被依赖服务
- system-service
- gateway-service
- admin-service
- supplier-service
- upload-service
- search-service
- notice-service
- dispatch-service

### 依赖外部组件
- RabbitMQ（106.52.209.154:5672）
- MySQL（通过业务服务配置）

## 8. 注意事项

1. **RabbitMQ必须配置**: 如使用异步功能，需确保RabbitMQ服务运行
2. **Date字段格式**: 统一使用字符串格式避免ClassCastException
3. **自动配置**: 通过spring.factories自动装配，无需手动扫描
4. **泛型类型**: BaseService和BaseController使用泛型，需正确指定类型参数

## 9. 相关文档

- MyBatis-Flex官方文档: https://mybatis-flex.com
- RabbitMQ官方文档: https://www.rabbitmq.com
- Spring AMQP文档: https://spring.io/projects/spring-amqp
