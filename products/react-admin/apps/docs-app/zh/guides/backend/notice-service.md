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
sidebar_label: 通知服务
sidebar_order: 7
sidebar_group: guides-backend
---

# Notice Service (通知服务)

## 1. 服务说明

Notice Service是BTC Shop Flow 项目的**通知服务**，负责系统通知消息推送邮件发送短信发送等功能

### 主要职责
- 站内消息通知
- 邮件通知发送
- 短信通知发送
- WebSocket实时推送
- 消息模板管理
- 通知历史记录

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
| Spring WebSocket | 5.3.24 | WebSocket实时推送 |
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
| OpenFeign | 3.1.5 | 声明式服务调用 |

### 消息发送
| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Boot Mail | 2.7.6 | JavaMail邮件发送集成 |
| 阿里云短信SDK | - | 短信发送（通过system-service） |

### 工具库
| 技术 | 版本 | 说明 |
|------|------|------|
| Lombok | 1.18.24 | 简化Java代码 |
| Sa-Token | 1.44.0 | 权限认证框架 |

## 3. 模块结构

```
notice-service/
src/main/java/com/btc/noticeservice/
controller/ # 控制层
NoticeController.java # 通知接口
MessageController.java # 消息接口
service/ # 服务层
NoticeService.java # 通知服务
EmailService.java # 邮件服务
SmsService.java # 短信服务
pojo/ # 实体类
Notice.java # 通知实体
config/ # 配置类
MailConfig.java # 邮件配置
WebSocketConfig.java # WebSocket配置
NoticeServiceApplication.java # 启动类
src/main/resources/
application.properties # 配置文件
banner.txt # 启动横幅
static/ # 静态资源
```

## 4. 核心功能

### 1. 站内通知
- 系统通知发送
- 用户消息通知
- 通知已读/未读状态
- 通知删除

### 2. 邮件通知
- 文本邮件发送
- HTML邮件发送
- 带附件邮件
- 邮件模板支持

### 3. 短信通知
- 验证码短信
- 通知短信
- 营销短信
- 短信模板管理

### 4. WebSocket推送
- 实时消息推送
- 在线状态维护
- 消息订阅机制

### 5. 消息模板
- 通知模板管理
- 变量替换
- 多语言支持

## 5. API接口

### 通知接口
- `POST /api/notice/send` - 发送通知
- `GET /api/notice/list` - 通知列表
- `PUT /api/notice/read/{id}` - 标记已读
- `DELETE /api/notice/{id}` - 删除通知

### 邮件接口
- `POST /api/notice/email/send` - 发送邮件
- `POST /api/notice/email/template` - 模板邮件

### 短信接口
- `POST /api/notice/sms/send` - 发送短信
- `POST /api/notice/sms/verify` - 发送验证码

## 6. 配置说明

### 邮件配置
```properties
spring.mail.host=smtp.example.com
spring.mail.port=587
spring.mail.username=noreply@example.com
spring.mail.password=your-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### WebSocket配置
```properties
websocket.endpoint=/ws/notice
websocket.allowed-origins=*
```

## 7. 服务端口

- **默认端口**: 未明确指定
- **Nacos注册**: notice-service

## 8. 服务依赖

### 内部服务调用
- **system-service**: 获取用户信息短信发送

### 外部服务
- **Nacos**: 服务注册中心
- **MySQL**: 数据存储
- **邮件服务器**: SMTP邮件发送
- **阿里云短信**: 短信发送

## 9. 注意事项

1. **邮件配置**: 确保SMTP服务器配置正确
2. **短信限流**: 控制短信发送频率，避免滥用
3. **WebSocket连接**: 注意连接数限制和心跳维护
4. **消息持久化**: 重要通知需持久化到数据库
5. **异步发送**: 大量通知使用异步方式发送
