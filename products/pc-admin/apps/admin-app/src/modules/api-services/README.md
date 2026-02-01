# API 服务模块

## 概述

`api-services` 模块用于统一管理所有不在 EPS（Element Plus Service）系统中的后端 API 服务。EPS 系统通过自动化方式管理标准 CRUD 接口，但系统中仍有许多非标准的 API 需要手动管理，本模块就是为这些 API 提供统一的封装和调用方式。

## 目录结构

```
modules/api-services/
├── sys/
│   └── index.ts           # 系统级别 API（例如接口文档、系统设置等）
├── index.ts              # 统一导出所有 API 服务
├── config.ts             # 模块配置文件
├── types.ts              # 共享类型定义
└── README.md             # 本文件
```

## 使用方式

### 导入 API 服务

```typescript
import { codeApi, sysApi } from '@/modules/api-services';
// 注意：authApi 已移除，请使用全局 __APP_AUTH_API__ 获取
```

### 使用示例

#### 1. 使用全局 authApi

```typescript
// 认证相关 API 服务已移至全局，请使用 __APP_AUTH_API__
const authApi = (window as any).__APP_AUTH_API__;

if (authApi) {
  try {
    const response = await authApi.login({
      username: 'admin',
      password: '123456',
      captchaId: 'xxx',  // 可选
      captcha: 'xxxx'    // 可选
    });
    
    // 处理登录响应...
  } catch (error) {
    console.error('登录失败:', error);
  }
}
```

#### 2. 系统级别 API

```typescript
import { sysApi } from '@/modules/api-services';

try {
  const docs = await sysApi.getDocs();
  // 处理响应...
} catch (error) {
  console.error('获取文档失败:', error);
}
```

## 相关文档

- [EPS 系统文档](../../../../docs/eps-system.md)
- [API 服务类型定义](./types.ts)
