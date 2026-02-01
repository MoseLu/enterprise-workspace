# 主应用存储管理工具

主应用专用的存储管理工具，提供统一的存储管理接口，支持类型安全、版本管理、数据迁移等功能。

## 功能特性

- ✅ **类型安全**：完整的 TypeScript 类型定义
- ✅ **统一管理**：整合所有 localStorage 键，避免冗余
- ✅ **数据迁移**：自动迁移旧的存储 key 到新的统一存储
- ✅ **存储监听**：支持监听存储变化
- ✅ **统计信息**：提供存储使用情况统计
- ✅ **清理功能**：自动清理过期或无效的存储
- ✅ **导出功能**：支持导出所有存储数据（用于备份或调试）

## 使用方法

### 基本使用

```typescript
import { appStorage } from '@/utils/app-storage';

// 初始化（在应用启动时调用）
appStorage.init('1.0.0');

// 用户信息
appStorage.user.set({ name: '张三', avatar: '/avatar.jpg' });
const user = appStorage.user.get();
appStorage.user.setAvatar('/new-avatar.jpg');
appStorage.user.setUsername('zhangsan');

// 应用设置
appStorage.settings.set({ systemThemeType: 'dark' });
appStorage.settings.setItem('menuType', 'left');
const theme = appStorage.settings.getItem('systemThemeType');

// 认证信息
appStorage.auth.setToken('token123');
appStorage.auth.setRefreshToken('refreshToken123');
```

### 存储监听

```typescript
// 监听用户信息变化
const unsubscribe = appStorage.addListener('user', (key, newValue, oldValue) => {
  console.log('用户信息已更新:', newValue);
});

// 取消监听
unsubscribe();
```

### 存储统计

```typescript
const stats = appStorage.getStats();
console.log(`总键数: ${stats.totalKeys}`);
console.log(`总大小: ${(stats.totalSize / 1024).toFixed(2)} KB`);
stats.keys.forEach(key => {
  console.log(`${key.key}: ${(key.size / 1024).toFixed(2)} KB`);
});
```

### 清理存储

```typescript
// 清理过期或无效的存储
const result = appStorage.cleanup();
console.log(`已清理 ${result.removed.length} 个键，释放 ${(result.freed / 1024).toFixed(2)} KB`);

// 清除所有应用存储（危险操作）
appStorage.clearAll();
```

### 导出存储数据

```typescript
// 导出所有存储数据（用于备份或调试）
const data = appStorage.export();
console.log(JSON.stringify(data, null, 2));
```

## 存储键名

所有存储键名都定义在 `APP_STORAGE_KEYS` 常量中：

- `USER`: 用户信息（`btc_user`）
- `SETTINGS`: 应用设置（`btc_settings`）
- `TOKEN`: 认证 token
- `REFRESH_TOKEN`: 刷新 token
- `LOCALE`: 语言设置
- `THEME`: 主题设置

## 数据迁移

存储管理器会在初始化时自动迁移旧的存储 key：

- `btc_systemThemeType` → `btc_settings.systemThemeType`
- `btc_systemThemeMode` → `btc_settings.systemThemeMode`
- `btc_systemThemeColor` → `btc_settings.systemThemeColor`
- `username` → `btc_user.username`

## 注意事项

1. 必须在应用启动时调用 `appStorage.init()` 进行初始化
2. 使用 `appStorage.clearAll()` 会清除所有应用存储，请谨慎使用
3. 存储监听器会在存储变化时自动触发，注意避免循环更新

