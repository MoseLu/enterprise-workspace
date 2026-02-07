---
title: 'BTC 共享工具库'
type: package
project: utils
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- packages
- utils
- shared-utils
sidebar_label: 共享工具
sidebar_order: 11
sidebar_group: packages
---
# BTC 共享工具库

> **版本**: 1.0.0
> **类型**: 工具函数库
> **用途**: 跨应用共享的纯函数工具

---

## 包含内容

### 工具函数

| 函数 | 说明 | 使用场景 |
|------|------|---------|
| `storage` | 本地存储封装 | localStorage/sessionStorage |
| `formHook` | 表单数据转换 | 表单提交/绑定 |
| `http` | HTTP 请求封装 | API 调用 |
| `date` | 日期工具 | 日期格式化 |
| `tree` | 树形数据处理 | 菜单/组织树 |

---

## 快速开始

### 安装

```bash
pnpm add @btc/shared-utils
```

### 使用

#### Storage

```typescript
import { storage } from '@btc/shared-utils';

// 保存数据
storage.set('user', { name: '张三' });

// 读取数据
const user = storage.get('user');

// 删除数据
storage.remove('user');

// 清空所有
storage.clear();
```

#### Form Hook

```typescript
import { formHook } from '@btc/shared-utils';

// 数字转换
formHook.bind({ prop: 'age', value: '18', hook: 'number' });
// value 变为: 18 (number)

// 分割字符串
formHook.bind({ prop: 'tags', value: 'a,b,c', hook: 'split' });
// value 变为: ['a', 'b', 'c']

// 日期范围
formHook.submit({ prop: 'dateRange', value: [start, end], hook: 'datetimeRange' });
// value 变为: { startTime: 'xxx', endTime: 'xxx' }
```

#### HTTP

```typescript
import { http } from '@btc/shared-utils';

// GET 请求
const data = await http.get('/api/users');

// POST 请求
await http.post('/api/users', { name: '张三' });

// PUT 请求
await http.put('/api/users/1', { name: '李四' });

// DELETE 请求
await http.delete('/api/users/1');
```

---

## API 文档

### storage

```typescript
interface Storage {
get<T>(key: string): T | null;
set<T>(key: string, value: T, ttl?: number): void;
remove(key: string): void;
clear(): void;
}
```

### formHook

```typescript
interface FormHook {
bind(options: HookOptions): any;
submit(options: HookOptions): any;
}

// 支持的转换类型
type HookType =
| 'number' // 字符串 数字
| 'string' // 任意 字符串
| 'split' // 字符串 数组
| 'join' // 数组 字符串
| 'boolean' // 任意 布尔
| 'datetimeRange' // [Date, Date] {startTime, endTime}
| 'json' // 对象 JSON 字符串
| 'empty'; // null/undefined undefined
```

### http

```typescript
interface Http {
get<T>(url: string, params?: any): Promise<T>;
post<T>(url: string, data?: any): Promise<T>;
put<T>(url: string, data?: any): Promise<T>;
delete<T>(url: string): Promise<T>;
}
```

---

## 开发

### 构建

```bash
pnpm build
```

### 测试

```bash
pnpm test
```

---

## 许可证

MIT

