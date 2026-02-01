---
title: Upload Service (文件上传服务)
type: guide
project: backend
owner: dev-team
created: '2025-10-13'
updated: '2025-10-14'
publish: true
tags:
  - guides
  - backend
  - upload
  - microservices
sidebar_label: 文件上传服务
sidebar_order: 5
sidebar_group: guides-backend
---

# Upload Service (文件上传服务)

## 1. 服务说明

Upload Service是BTC Shop Flow 项目的**文件上传服务**，负责处理文件上传存储和管理功能

### 主要职责
- 文件上传处理
- 文件存储管理（本地/云端）
- 图片压缩和裁剪
- 文件访问URL生成
- 文件元数据管理
- 支持阿里云OSS存储
- 支持腾讯云COS存储

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

### 持久层
| 技术 | 版本 | 说明 |
|------|------|------|
| MyBatis-Plus | 3.4.1 | MyBatis增强工具 |
| Dynamic Datasource | 3.5.2 | 动态多数据源 |
| MySQL Connector | 8.0.31 | MySQL数据库驱动 |
| Druid | 1.0.18 | 阿里巴巴数据库连接池 |

### 微服务组件
| 技术 | 版本 | 说明 |
|------|------|------|
| Nacos Discovery | 2021.0.5.0 | 服务注册与发现 |
| Nacos Config | 2021.0.5.0 | 配置中心 |
| OpenFeign | 3.1.5 | 声明式服务调用 |

### 云存储集成
| 技术 | 版本 | 说明 |
|------|------|------|
| 阿里云OSS SDK | 3.15.1 | 阿里云对象存储 |
| 腾讯云COS SDK | 5.6.61 | 腾讯云对象存储 |

### 图片处理
| 技术 | 版本 | 说明 |
|------|------|------|
| Thumbnailator | 0.4.19 | 图片压缩和缩放库 |
| ImageIO | JDK内置 | Java图片处理API |

### 工具库
| 技术 | 版本 | 说明 |
|------|------|------|
| Hutool All | 5.8.16 | Java工具类库 |
| Lombok | 1.18.24 | 简化Java代码 |
| Jackson | 2.13.0 | JSON处理库 |
| PageHelper | 1.4.0 | MyBatis分页插件 |

## 3. 模块结构

```
upload-service/
src/main/java/com/btc/uploadservice/
controller/ # 控制层
FileUploadController.java # 文件上传接口
service/ # 服务层
FileStorageService.java # 文件存储服务
OssService.java # OSS服务
CosService.java # COS服务
config/ # 配置类
OssConfig.java # OSS配置
CosConfig.java # COS配置
pojo/ # 实体类
FileInfo.java # 文件信息实体
util/ # 工具类
FileUtil.java # 文件处理工具
src/main/resources/
application.properties # 配置文件
static/ # 静态资源
```

## 4. 核心功能

### 1. 文件上传
- 单文件上传
- 多文件批量上传
- 大文件分片上传
- 断点续传支持

### 2. 文件存储
- **本地存储**: 文件保存到服务器本地
- **阿里云OSS**: 存储到阿里云对象存储
- **腾讯云COS**: 存储到腾讯云对象存储
- 存储策略可配置切换

### 3. 图片处理
- 图片压缩
- 图片裁剪
- 缩略图生成
- 格式转换

### 4. 文件管理
- 文件列表查询
- 文件信息查询
- 文件删除
- 文件访问URL生成

## 5. API接口

### 文件上传接口
- `POST /api/upload/file` - 单文件上传
- `POST /api/upload/files` - 多文件上传
- `POST /api/upload/image` - 图片上传（带压缩）
- `POST /api/upload/chunk` - 分片上传

### 文件管理接口
- `GET /api/upload/list` - 文件列表
- `GET /api/upload/{id}` - 文件信息
- `DELETE /api/upload/{id}` - 删除文件
- `GET /api/upload/url/{id}` - 获取访问URL

## 6. 配置说明

### 阿里云OSS配置
```properties
aliyun.oss.endpoint=oss-cn-hangzhou.aliyuncs.com
aliyun.oss.access-key-id=YOUR_ACCESS_KEY
aliyun.oss.access-key-secret=YOUR_SECRET_KEY
aliyun.oss.bucket-name=your-bucket
```

### 腾讯云COS配置
```properties
tencent.cos.secret-id=YOUR_SECRET_ID
tencent.cos.secret-key=YOUR_SECRET_KEY
tencent.cos.region=ap-guangzhou
tencent.cos.bucket-name=your-bucket
```

### 文件上传限制
```properties
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB
```

## 7. 服务端口

- **默认端口**: 未明确指定
- **Nacos注册**: upload-service

## 8. 服务依赖

### 外部服务
- **Nacos**: 服务注册中心
- **阿里云OSS**: 对象存储
- **腾讯云COS**: 对象存储（可选）
- **MySQL**: 文件元数据存储

## 9. 注意事项

1. **文件大小限制**: 根据业务需求配置合理的文件大小限制
2. **存储空间**: 定期清理无用文件，避免存储空间不足
3. **安全控制**: 验证文件类型，防止恶意文件上传
4. **访问权限**: 控制文件访问权限，保护敏感数据
5. **CDN加速**: 生产环境建议配置CDN加速文件访问
