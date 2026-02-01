# SessionStorage 工具使用文档

## 简介

SessionStorage 工具提供了统一的 sessionStorage 操作接口，支持前缀、自动序列化、错误处理等功能。SessionStorage 中的数据在浏览器标签页关闭后会自动清除。

## API 文档

### get<T>(key: string): T | null

获取存储值。

**参数：**
- `key`: 键名（不需要包含前缀 `btc_`）

**返回值：**
- 存储的值（已自动反序列化），如果不存在则返回 `null`

**示例：**
```typescript
import { sessionStorage } from '@btc/shared-core/utils/storage/session';

// 获取字符串
const name = sessionStorage.get<string>('user_name');

// 获取对象
const user = sessionStorage.get<UserInfo>('user_info');

// 获取数组
const items = sessionStorage.get<string[]>('items');
```

### set(key: string, value: unknown): void

设置存储值。

**参数：**
- `key`: 键名（不需要包含前缀 `btc_`）
- `value`: 要存储的值（会自动序列化为 JSON）

**示例：**
```typescript
import { sessionStorage } from '@btc/shared-core/utils/storage/session';

// 存储字符串
sessionStorage.set('user_name', 'John');

// 存储对象
sessionStorage.set('user_info', { id: 1, name: 'John' });

// 存储数组
sessionStorage.set('items', ['item1', 'item2']);
```

### remove(key: string): void

移除存储值。

**参数：**
- `key`: 键名（不需要包含前缀 `btc_`）

**示例：**
```typescript
import { sessionStorage } from '@btc/shared-core/utils/storage/session';

sessionStorage.remove('user_name');
```

### clear(): void

清空所有带前缀的存储值。

**示例：**
```typescript
import { sessionStorage } from '@btc/shared-core/utils/storage/session';

// 清除所有 btc_ 前缀的 sessionStorage 数据
sessionStorage.clear();
```

### getAll(): Record<string, any>

获取所有带前缀的存储数据。

**返回值：**
- 所有存储数据的对象

**示例：**
```typescript
import { sessionStorage } from '@btc/shared-core/utils/storage/session';

const allData = sessionStorage.getAll();
// { user_name: 'John', user_info: { id: 1 }, items: [...] }
```

## 使用示例

### 基本使用

```typescript
import { sessionStorage } from '@btc/shared-core/utils/storage/session';

// 存储数据
sessionStorage.set('user_check_status', 'active');
sessionStorage.set('user_info', { id: 1, name: 'John' });

// 读取数据
const status = sessionStorage.get<string>('user_check_status');
const user = sessionStorage.get<UserInfo>('user_info');

// 删除数据
sessionStorage.remove('user_check_status');
```

### 与 Pinia Store 配合使用

```typescript
import { defineStore } from 'pinia';
import { persistedStatePluginSession } from '@btc/shared-core/utils/storage';

// 在 Store 初始化时使用 sessionStorage 插件
const pinia = createPinia();
pinia.use(persistedStatePluginSession);

// 在 Store 中配置持久化
export const useMyStore = defineStore('myStore', () => {
  const data = ref({});
  
  return { data };
}, {
  persist: {
    // 使用 sessionStorage（已在插件中配置）
    storage: sessionStorage,
  },
});
```

### 自定义前缀

如果需要自定义前缀，可以创建新的实例：

```typescript
import { SessionStorageUtil } from '@btc/shared-core/utils/storage/session';

// 创建自定义前缀的实例
const customSession = new SessionStorageUtil('my_prefix_');

customSession.set('key', 'value');
const value = customSession.get('key');
```

## 与 localStorage 的区别

| 特性 | SessionStorage | LocalStorage |
|------|----------------|--------------|
| 生命周期 | 标签页关闭后清除 | 永久保存（除非手动清除） |
| 作用域 | 单个标签页 | 同源的所有标签页 |
| 存储大小 | 通常 5-10MB | 通常 5-10MB |
| 适用场景 | 临时数据、会话数据 | 持久化数据、用户偏好 |

## Pinia Store 持久化配置

### 使用 sessionStorage

```typescript
import { defineStore } from 'pinia';
import { persistedStatePluginSession } from '@btc/shared-core/utils/storage';

// Store 配置
export const useSessionStore = defineStore('session', () => {
  const tempData = ref({});
  
  return { tempData };
}, {
  persist: {
    // 使用 sessionStorage 插件
    storage: sessionStorage,
    paths: ['tempData'],
  },
});
```

### 使用 localStorage（默认）

```typescript
import { defineStore } from 'pinia';
import { persistedStatePlugin } from '@btc/shared-core/utils/storage';

// Store 配置
export const usePersistentStore = defineStore('persistent', () => {
  const data = ref({});
  
  return { data };
}, {
  persist: {
    // 默认使用 localStorage（已在插件中配置）
    paths: ['data'],
  },
});
```

## 注意事项

### 1. 数据生命周期

- SessionStorage 中的数据在**标签页关闭后自动清除**
- 刷新页面不会清除数据
- 新标签页无法访问其他标签页的 sessionStorage

### 2. 存储限制

- 通常限制为 **5-10MB**（不同浏览器可能不同）
- 超过限制会抛出 `QuotaExceededError` 异常
- 工具会自动捕获异常并输出警告

### 3. 序列化

- 所有值都会自动序列化为 JSON
- 支持基本类型、对象、数组等
- 不支持函数、Symbol、undefined 等

### 4. 前缀管理

- 默认前缀为 `btc_`
- 实际存储的键名为 `btc_${key}`
- `clear()` 和 `getAll()` 只操作带前缀的键

### 5. 错误处理

- 所有操作都有 try-catch 保护
- 存储失败会输出警告但不会抛出异常
- 读取失败返回 `null`

## 最佳实践

1. **用于临时数据**：SessionStorage 适合存储会话期间的临时数据
2. **避免敏感信息**：不要存储敏感信息（如密码、token）
3. **合理使用前缀**：使用统一的前缀便于管理和清理
4. **配合 Pinia**：使用 `pinia-plugin-persistedstate` 简化 Store 持久化

## 常见使用场景

### 1. 用户检查状态

```typescript
import { sessionStorage } from '@btc/shared-core/utils/storage/session';

// 存储用户检查状态
sessionStorage.set('user_check_status', 'active');
sessionStorage.set('user_check_remaining_time', 3600);

// 读取状态
const status = sessionStorage.get<string>('user_check_status');
const remaining = sessionStorage.get<number>('user_check_remaining_time');
```

### 2. 导航标记

```typescript
import { sessionStorage } from '@btc/shared-core/utils/storage/session';

// 存储当前导航的应用名称
sessionStorage.set('nav_app_name', '系统管理');

// 读取应用名称
const appName = sessionStorage.get<string>('nav_app_name');
```

### 3. 退出登录标记

```typescript
import { sessionStorage } from '@btc/shared-core/utils/storage/session';

// 设置退出登录时间戳
sessionStorage.set('logout_timestamp', Date.now());

// 检查是否刚退出登录（5秒内）
const timestamp = sessionStorage.get<number>('logout_timestamp');
if (timestamp && Date.now() - timestamp < 5000) {
  // 允许访问登录页
}
```
