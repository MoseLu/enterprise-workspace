---
title: Dispatch Service (调度服务)
type: guide
project: backend
owner: dev-team
created: '2025-10-13'
updated: '2025-10-14'
publish: true
tags:
  - guides
  - backend
  - dispatch
  - microservices
sidebar_label: Dispatch Service
sidebar_order: 8
sidebar_group: guides-backend
---

# Dispatch Service (调度服务)

## 1. Service Description

Dispatch Service is the **task scheduling service** of the BTC Shop Flow project, providing distributed task scheduling and scheduled task management functions based on XXL-Job.

### Main Responsibilities
- Scheduled task scheduling
- Distributed task execution
- Task execution monitoring
- Task log management
- Task failure retry
- Task execution reports

## 2. Technology Stack

### Core Framework
| Technology | Version | Description |
|------|------|------|
| Spring Boot | 2.7.6 | Core framework |
| Java | 17 | JDK version |
| Maven | 3.6+ | Project build tool |

### Task Scheduling
| Technology | Version | Description |
|------|------|------|
| XXL-Job Core | 2.4.0 | Distributed task scheduling platform |

**Features**:
- Dynamic task scheduling
- Executor management
- Task monitoring and logs
- Multiple execution modes (Bean/GLUE)
- Sharding and broadcasting
- Failover

### Web Layer
| Technology | Version | Description |
|------|------|------|
| Spring Web | 2.7.6 | REST API development |
| Swagger | 3.0.0 | API documentation generation |
| Springfox Boot Starter | 3.0.0 | Swagger integration |

### Database
| Technology | Version | Description |
|------|------|------|
| MySQL Connector | 8.0.31 | MySQL database driver |

### Microservices Components
| Technology | Version | Description |
|------|------|------|
| Nacos Discovery | 2021.0.5.0 | Service registration and discovery |
| Nacos Config | 2021.0.5.0 | Configuration center |
| OpenFeign | 3.1.5 | Declarative service invocation |

### Utility Libraries
| Technology | Version | Description |
|------|------|------|
| Lombok | 1.18.24 | Simplify Java code |
| Sa-Token | 1.44.0 | Permission authentication framework |

## 3. Module Structure

```
dispatch-service/
src/main/java/com/btc/dispatchservice/
controller/ # Controller layer
JobController.java # Task management interfaces
service/ # Service layer
DispatchService.java # Dispatch service
job/ # Scheduled tasks
DataSyncJob.java # Data synchronization task
ReportJob.java # Report generation task
CleanupJob.java # Data cleanup task
config/ # Configuration classes
XxlJobConfig.java # XXL-Job configuration
DispatchServiceApplication.java # Main class
src/main/resources/
application.properties # Configuration file
static/ # Static resources
```

## 4. Core Features

### 1. Scheduled Task Management
- Task creation and configuration
- Task start/stop
- Task trigger method configuration
- Cron expression configuration

### 2. Task Execution
- Bean mode execution
- GLUE mode execution (Java/Python/Shell/PHP)
- Sharding and broadcasting execution
- Failover

### 3. Task Monitoring
- Task execution status monitoring
- Execution time statistics
- Success/failure rate statistics
- Real-time log viewing

### 4. Common Task Types
- **Data Synchronization Tasks**: Regularly sync data
- **Report Generation Tasks**: Scheduled business report generation
- **Data Cleanup Tasks**: Clean up expired data
- **Cache Refresh Tasks**: Scheduled cache refresh
- **Message Push Tasks**: Scheduled message push

## 5. API Interfaces

### Task Management Interfaces
- `POST /api/dispatch/job/create` - Create task
- `PUT /api/dispatch/job/update` - Update task
- `DELETE /api/dispatch/job/{id}` - Delete task
- `POST /api/dispatch/job/start/{id}` - Start task
- `POST /api/dispatch/job/stop/{id}` - Stop task
- `POST /api/dispatch/job/trigger/{id}` - Manually trigger task

### Task Query Interfaces
- `GET /api/dispatch/job/list` - Task list
- `GET /api/dispatch/job/{id}` - Task details
- `GET /api/dispatch/job/log/{id}` - Task execution logs

## 6. Configuration

### XXL-Job Configuration
```properties
# XXL-Job scheduler address
xxl.job.admin.addresses=http://localhost:8080/xxl-job-admin

# Executor configuration
xxl.job.executor.appname=dispatch-service
xxl.job.executor.ip=
xxl.job.executor.port=9999
xxl.job.executor.logpath=/data/applogs/xxl-job/jobhandler
xxl.job.executor.logretentiondays=30

# Scheduler communication TOKEN
xxl.job.accessToken=default_token
```

### Nacos Configuration
```properties
spring.cloud.nacos.server-addr=127.0.0.1:8848
spring.cloud.nacos.config.file-extension=yaml
```

## Scheduled Task Examples

### Data Synchronization Task
```java
@XxlJob("dataSyncJob")
public void dataSyncJob() {
  // Execute data synchronization daily at 2 AM
  // Cron: 0 0 2 * * ?
}
```

### Report Generation Task
```java
@XxlJob("reportJob")
public void reportJob() {
  // Generate daily report at 8 AM
  // Cron: 0 0 8 * * ?
}
```

### Data Cleanup Task
```java
@XxlJob("cleanupJob")
public void cleanupJob() {
  // Clean up expired data at 3 AM every Sunday
  // Cron: 0 0 3 ? * SUN
}
```

## 7. Service Port

- **Default Port**: Not explicitly specified
- **Executor Port**: 9999
- **Nacos Registration**: dispatch-service

## 8. Service Dependencies

### Internal Service Calls
- Can call all business services to execute tasks

### External Services
- **XXL-Job Scheduler**: Task scheduling management
- **Nacos**: Service registry
- **MySQL**: Task configuration storage

## 9. Notes

1. **XXL-Job Deployment**: Need to deploy XXL-Job scheduler separately
2. **Task Idempotency**: Ensure tasks can be executed repeatedly
3. **Task Timeout**: Reasonably set task timeout
4. **Log Cleanup**: Regularly clean up task execution logs
5. **Sharding Tasks**: Use sharding for large data volume tasks
6. **Failure Alerts**: Configure task failure alert mechanism
