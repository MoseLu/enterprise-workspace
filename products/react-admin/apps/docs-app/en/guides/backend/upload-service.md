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
sidebar_label: Upload Service
sidebar_order: 5
sidebar_group: guides-backend
---

# Upload Service (文件上传服务)

## 1. Service Description

Upload Service is the **file upload service** of the BTC Shop Flow project, responsible for handling file upload, storage, and management functions.

### Main Responsibilities
- File upload processing
- File storage management (local/cloud)
- Image compression and cropping
- File access URL generation
- File metadata management
- Support for Alibaba Cloud OSS storage
- Support for Tencent Cloud COS storage

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

### Persistence Layer
| Technology | Version | Description |
|------|------|------|
| MyBatis-Plus | 3.4.1 | MyBatis enhancement tool |
| Dynamic Datasource | 3.5.2 | Dynamic multi-datasource |
| MySQL Connector | 8.0.31 | MySQL database driver |
| Druid | 1.0.18 | Alibaba database connection pool |

### Microservices Components
| Technology | Version | Description |
|------|------|------|
| Nacos Discovery | 2021.0.5.0 | Service registration and discovery |
| Nacos Config | 2021.0.5.0 | Configuration center |
| OpenFeign | 3.1.5 | Declarative service invocation |

### Cloud Storage Integration
| Technology | Version | Description |
|------|------|------|
| Alibaba Cloud OSS SDK | 3.15.1 | Alibaba Cloud object storage |
| Tencent Cloud COS SDK | 5.6.61 | Tencent Cloud object storage |

### Image Processing
| Technology | Version | Description |
|------|------|------|
| Thumbnailator | 0.4.19 | Image compression and scaling library |
| ImageIO | JDK Built-in | Java image processing API |

### Utility Libraries
| Technology | Version | Description |
|------|------|------|
| Hutool All | 5.8.16 | Java utility library |
| Lombok | 1.18.24 | Simplify Java code |
| Jackson | 2.13.0 | JSON processing library |
| PageHelper | 1.4.0 | MyBatis pagination plugin |

## 3. Module Structure

```
upload-service/
src/main/java/com/btc/uploadservice/
controller/ # Controller layer
FileUploadController.java # File upload interfaces
service/ # Service layer
FileStorageService.java # File storage service
OssService.java # OSS service
CosService.java # COS service
config/ # Configuration classes
OssConfig.java # OSS configuration
CosConfig.java # COS configuration
pojo/ # Entity classes
FileInfo.java # File information entity
util/ # Utility classes
FileUtil.java # File processing utilities
src/main/resources/
application.properties # Configuration file
static/ # Static resources
```

## 4. Core Features

### 1. File Upload
- Single file upload
- Multiple file batch upload
- Large file chunk upload
- Resume upload support

### 2. File Storage
- **Local Storage**: Files saved to server local
- **Alibaba Cloud OSS**: Store to Alibaba Cloud object storage
- **Tencent Cloud COS**: Store to Tencent Cloud object storage
- Storage strategy can be configured and switched

### 3. Image Processing
- Image compression
- Image cropping
- Thumbnail generation
- Format conversion

### 4. File Management
- File list queries
- File information queries
- File deletion
- File access URL generation

## 5. API Interfaces

### File Upload Interfaces
- `POST /api/upload/file` - Single file upload
- `POST /api/upload/files` - Multiple file upload
- `POST /api/upload/image` - Image upload (with compression)
- `POST /api/upload/chunk` - Chunk upload

### File Management Interfaces
- `GET /api/upload/list` - File list
- `GET /api/upload/{id}` - File information
- `DELETE /api/upload/{id}` - Delete file
- `GET /api/upload/url/{id}` - Get access URL

## 6. Configuration

### Alibaba Cloud OSS Configuration
```properties
aliyun.oss.endpoint=oss-cn-hangzhou.aliyuncs.com
aliyun.oss.access-key-id=YOUR_ACCESS_KEY
aliyun.oss.access-key-secret=YOUR_SECRET_KEY
aliyun.oss.bucket-name=your-bucket
```

### Tencent Cloud COS Configuration
```properties
tencent.cos.secret-id=YOUR_SECRET_ID
tencent.cos.secret-key=YOUR_SECRET_KEY
tencent.cos.region=ap-guangzhou
tencent.cos.bucket-name=your-bucket
```

### File Upload Limits
```properties
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB
```

## 7. Service Port

- **Default Port**: Not explicitly specified
- **Nacos Registration**: upload-service

## 8. Service Dependencies

### External Services
- **Nacos**: Service registry
- **Alibaba Cloud OSS**: Object storage
- **Tencent Cloud COS**: Object storage (optional)
- **MySQL**: File metadata storage

## 9. Notes

1. **File Size Limits**: Configure reasonable file size limits based on business needs
2. **Storage Space**: Regularly clean up unused files to avoid storage space shortage
3. **Security Control**: Validate file types to prevent malicious file uploads
4. **Access Permissions**: Control file access permissions to protect sensitive data
5. **CDN Acceleration**: Production environment recommends configuring CDN for file access acceleration
