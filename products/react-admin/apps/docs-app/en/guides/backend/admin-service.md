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
sidebar_label: Admin Service
sidebar_order: 4
sidebar_group: guides-backend
---

# Admin Service (管理服务)

## 1. Service Description

Admin Service is the **backend management service** of the BTC Shop Flow project, providing system management, data statistics, configuration management, and other backend functions for administrators.

### Main Responsibilities
- System configuration management
- Data statistics and reports
- System monitoring
- Operation log queries
- System parameter configuration
- Administrator-specific functions

## 2. Technology Stack

### Core Framework
| Technology | Version | Description |
|------|------|------|
| Spring Boot | 2.7.6 | Core framework |
| Java | 17 | JDK version |
| Maven | 3.6+ | Project build tool |

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

### Common Module
| Module | Version | Description |
|------|------|------|
| common | 0.0.1-SNAPSHOT | Base CRUD, async operation support |

### Utility Libraries
| Technology | Version | Description |
|------|------|------|
| Lombok | 1.18.24 | Simplify Java code |
| Sa-Token | 1.44.0 | Permission authentication framework |

## 3. Module Structure

```
admin-service/
src/main/java/com/btc/adminservice/
controller/ # Controller layer
AdminController.java # Admin interfaces
ConfigController.java # Configuration management
StatisticsController.java # Statistics interfaces
service/ # Service layer
AdminService.java # Admin service
StatisticsService.java # Statistics service
pojo/ # Entity classes
AdminServiceApplication.java # Main class
src/main/resources/
application.properties # Configuration file
banner.txt # Startup banner
static/ # Static resources
```

## 4. Core Features

### 1. System Configuration Management
- System parameter configuration
- Business rule configuration
- Dictionary data management
- Configuration version management

### 2. Data Statistics
- User statistics
- Order statistics
- Sales statistics
- Real-time data monitoring

### 3. Report Functions
- Daily report generation
- Weekly report generation
- Monthly report generation
- Custom reports

### 4. Log Queries
- Operation log queries
- System log queries
- Audit log queries
- Log export

### 5. System Monitoring
- Service health status
- Interface call statistics
- Error rate monitoring
- Performance metrics

## 5. API Interfaces

### Configuration Management
- `GET /api/admin/config/list` - Configuration list
- `POST /api/admin/config` - Add configuration
- `PUT /api/admin/config` - Update configuration
- `DELETE /api/admin/config/{id}` - Delete configuration

### Data Statistics
- `GET /api/admin/stats/user` - User statistics
- `GET /api/admin/stats/order` - Order statistics
- `GET /api/admin/stats/sales` - Sales statistics
- `GET /api/admin/stats/dashboard` - Dashboard data

### Log Management
- `GET /api/admin/log/operation` - Operation logs
- `GET /api/admin/log/system` - System logs
- `GET /api/admin/log/export` - Log export

## 6. Configuration

### Nacos Configuration
```properties
spring.cloud.nacos.server-addr=127.0.0.1:8848
spring.cloud.nacos.config.file-extension=yaml
```

### Database Configuration
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/btc_admin
spring.datasource.username=root
spring.datasource.password=123456
```

## 7. Service Port

- **Default Port**: Not explicitly specified
- **Nacos Registration**: admin-service

## 8. Service Dependencies

### Internal Services
- **common**: Common module
- **system-service**: User and permission data

### External Services
- **Nacos**: Service registry
- **MySQL**: Data storage

## 9. Notes

1. **Permission Control**: Admin interfaces require strict permission control
2. **Data Security**: Sensitive configurations need encrypted storage
3. **Operation Auditing**: All admin operations need audit log recording
4. **Performance Optimization**: Large data statistics use cache or async processing
