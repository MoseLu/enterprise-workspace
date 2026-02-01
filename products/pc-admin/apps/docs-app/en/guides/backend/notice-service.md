---
title: Notice Service (通知服务)
type: guide
project: backend
owner: dev-team
created: '2025-10-13'
updated: '2025-10-14'
publish: true
tags:
  - guides
  - backend
  - notice
  - microservices
sidebar_label: Notice Service
sidebar_order: 7
sidebar_group: guides-backend
---

# Notice Service (通知服务)

## 1. Service Description

Notice Service is the **notification service** of the BTC Shop Flow project, responsible for system notifications, message push, email sending, SMS sending, and other functions.

### Main Responsibilities
- In-site message notifications
- Email notification sending
- SMS notification sending
- WebSocket real-time push
- Message template management
- Notification history records

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
| Spring WebSocket | 5.3.24 | WebSocket real-time push |
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

### Message Sending
| Technology | Version | Description |
|------|------|------|
| Spring Boot Mail | 2.7.6 | JavaMail email sending integration |
| Alibaba Cloud SMS SDK | - | SMS sending (via system-service) |

### Utility Libraries
| Technology | Version | Description |
|------|------|------|
| Lombok | 1.18.24 | Simplify Java code |
| Sa-Token | 1.44.0 | Permission authentication framework |

## 3. Module Structure

```
notice-service/
src/main/java/com/btc/noticeservice/
controller/ # Controller layer
NoticeController.java # Notification interfaces
MessageController.java # Message interfaces
service/ # Service layer
NoticeService.java # Notification service
EmailService.java # Email service
SmsService.java # SMS service
pojo/ # Entity classes
Notice.java # Notification entity
config/ # Configuration classes
MailConfig.java # Email configuration
WebSocketConfig.java # WebSocket configuration
NoticeServiceApplication.java # Main class
src/main/resources/
application.properties # Configuration file
banner.txt # Startup banner
static/ # Static resources
```

## 4. Core Features

### 1. In-Site Notifications
- System notification sending
- User message notifications
- Notification read/unread status
- Notification deletion

### 2. Email Notifications
- Text email sending
- HTML email sending
- Email with attachments
- Email template support

### 3. SMS Notifications
- Verification code SMS
- Notification SMS
- Marketing SMS
- SMS template management

### 4. WebSocket Push
- Real-time message push
- Online status maintenance
- Message subscription mechanism

### 5. Message Templates
- Notification template management
- Variable replacement
- Multi-language support

## 5. API Interfaces

### Notification Interfaces
- `POST /api/notice/send` - Send notification
- `GET /api/notice/list` - Notification list
- `PUT /api/notice/read/{id}` - Mark as read
- `DELETE /api/notice/{id}` - Delete notification

### Email Interfaces
- `POST /api/notice/email/send` - Send email
- `POST /api/notice/email/template` - Template email

### SMS Interfaces
- `POST /api/notice/sms/send` - Send SMS
- `POST /api/notice/sms/verify` - Send verification code

## 6. Configuration

### Email Configuration
```properties
spring.mail.host=smtp.example.com
spring.mail.port=587
spring.mail.username=noreply@example.com
spring.mail.password=your-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### WebSocket Configuration
```properties
websocket.endpoint=/ws/notice
websocket.allowed-origins=*
```

## 7. Service Port

- **Default Port**: Not explicitly specified
- **Nacos Registration**: notice-service

## 8. Service Dependencies

### Internal Service Calls
- **system-service**: Get user information, SMS sending

### External Services
- **Nacos**: Service registry
- **MySQL**: Data storage
- **Email Server**: SMTP email sending
- **Alibaba Cloud SMS**: SMS sending

## 9. Notes

1. **Email Configuration**: Ensure SMTP server configuration is correct
2. **SMS Rate Limiting**: Control SMS sending frequency to avoid abuse
3. **WebSocket Connections**: Pay attention to connection limits and heartbeat maintenance
4. **Message Persistence**: Important notifications need to be persisted to database
5. **Async Sending**: Use async method for large volume notifications
