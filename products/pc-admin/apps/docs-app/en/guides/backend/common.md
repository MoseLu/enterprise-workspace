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
sidebar_label: Common Module
sidebar_order: 9
sidebar_group: guides-backend
---

# Common Module (公共模块)

## 1. Module Description

Common module is the **core common module** of the entire BTC Shop Flow project, providing common base functionality, utility classes, and async operation support for all business services.

### Main Responsibilities
- Provide common CRUD operation base classes (BaseService, BaseController, BaseMapper)
- Encapsulate async data operation functionality (based on RabbitMQ)
- Provide unified return result encapsulation (DataResult, JsonResult)
- Provide common utility classes and exception handling
- Provide common configuration and annotations

## 2. Technology Stack

### Core Framework
- **Spring Boot**: 2.7.6
- **Java**: 17
- **Maven**: Project build tool

### Persistence Layer
| Technology | Version | Description |
|------|------|------|
| MyBatis-Flex | 1.11.1 | MyBatis enhancement tool, provides powerful CRUD functionality |
| MyBatis-Flex Codegen | 1.11.1 | Code generator support |

### Message Queue
| Technology | Version | Description |
|------|------|------|
| Spring Boot AMQP | 2.7.6 | Spring AMQP integration |
| RabbitMQ Client | 5.16.0 (transitive dependency) | RabbitMQ Java client |

**Features**:
- Support async insert, update, delete operations
- Dead letter queue mechanism
- Auto retry mechanism (up to 3 times)
- Three-queue isolation architecture

### JSON Processing
| Technology | Version | Description |
|------|------|------|
| Jackson Databind | 2.13.4.2 | JSON serialization/deserialization |
| Jackson Datatype JSR310 | 2.13.4 | Java 8 time type support |

**Configuration Features**:
- Custom Date serialization format (yyyy-MM-dd HH:mm:ss)
- JavaTimeModule support for LocalDateTime
- Ignore unknown properties configuration
- Accept empty string as null

### Utility Libraries
| Technology | Version | Description |
|------|------|------|
| Lombok | 1.18.24 | Simplify Java code, reduce boilerplate |
| Swagger | 3.0.0 | API documentation generation |
| Sa-Token | 1.44.0 | Lightweight permission authentication framework |

## 3. Module Structure

```
common/
src/main/java/com/btc/common/
annotation/ # Custom annotations
ApiOperation.java
config/ # Configuration classes
CommonAutoConfiguration.java # Auto-configuration class
MyBatisFlexConfiguration.java # MyBatis-Flex configuration
RabbitMQConfig.java # RabbitMQ configuration
controller/ # Base controllers
BaseController.java # Provides common CRUD interfaces
dto/ # Data transfer objects
AsyncInsertMessage.java # Async operation messages
PageQuery.java # Pagination query parameters
PageResult.java # Pagination results
entity/ # Base entities
BaseEntity.java
enumeration/ # Enumeration classes
SmsCodeEnum.java
exception/ # Exception handling
BaseResponseCode.java
ResponseCodeInterface.java
mapper/ # Base Mapper
BaseMapper.java
pojo/ # POJO objects
EmailObject.java
routes/ # Route constants
Routes.java
service/ # Service interfaces
AsyncInsertService.java # Async operation service interface
BaseService.java # Base service interface
impl/
AsyncInsertMessageConsumer.java # Message consumer
AsyncInsertServiceImpl.java # Async operation implementation
BaseServiceImpl.java # Base service implementation
util/ # Utility classes
DataResult.java # Unified return result
JsonResult.java # JSON return result
src/main/resources/
META-INF/
spring.factories # Spring auto-configuration
application.properties # Configuration file
```

## 4. Core Features

### 1. Common CRUD Base Classes

#### BaseService Interface
Provides standard data operation interfaces:
- **Async Insert**: asyncSave(), asyncSaveBatch()
- **Async Update**: asyncUpdateById(), asyncUpdateBatchById()
- **Async Delete**: asyncRemoveById(), asyncRemoveByIds()
- **Query Operations**: getById(), list(), page()

#### BaseController Class
Provides standard REST API interfaces:
- **POST** `/async/add` - Async insert
- **PUT** `/async/update` - Async update
- **DELETE** `/async/{id}` - Async delete
- **GET** `/{id}` - Query single
- **GET** `/list` - Query list
- **GET** `/page` - Pagination query

### 2. RabbitMQ Async Operations

#### Queue Architecture (Three-Queue Isolation)
- **INSERT Queue**: async.insert.queue (insert operations)
- **UPDATE Queue**: async.update.queue (update operations)
- **DELETE Queue**: async.delete.queue (delete operations)

#### Features
- Operations immediately return message ID
- Background async processing
- Auto retry on failure (up to 3 times)
- Dead letter queue handles final failed messages
- Complete logging and monitoring

### 3. Date Field Serialization Optimization
```java
// Date fields use string format serialization
Format: yyyy-MM-dd HH:mm:ss
Example: "2025-10-13 13:50:27"
```

Avoids ClassCastException issues caused by timestamp format.

## 5. Configuration

### RabbitMQ Configuration
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

### Enable/Disable RabbitMQ
- Enable: `spring.rabbitmq.enabled=true`
- Disable: `spring.rabbitmq.enabled=false`

## 6. Usage

### 1. Inherit BaseServiceImpl in Service
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

### 2. Inherit BaseController in Controller
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

### 3. Use Async Operations
```java
// Async insert
String messageId = departmentService.asyncSave(department);

// Async update
String messageId = departmentService.asyncUpdateById(department);

// Async delete
String messageId = departmentService.asyncRemoveById(id);
```

## 7. Dependencies

### Dependent Services
- system-service
- gateway-service
- admin-service
- supplier-service
- upload-service
- search-service
- notice-service
- dispatch-service

### External Component Dependencies
- RabbitMQ (106.52.209.154:5672)
- MySQL (via business service configuration)

## 8. Notes

1. **RabbitMQ Must Be Configured**: If using async functionality, ensure RabbitMQ service is running
2. **Date Field Format**: Unified use of string format to avoid ClassCastException
3. **Auto Configuration**: Auto-assembled via spring.factories, no manual scanning needed
4. **Generic Types**: BaseService and BaseController use generics, need to correctly specify type parameters

## 9. Related Documentation

- MyBatis-Flex Official Documentation: https://mybatis-flex.com
- RabbitMQ Official Documentation: https://www.rabbitmq.com
- Spring AMQP Documentation: https://spring.io/projects/spring-amqp
