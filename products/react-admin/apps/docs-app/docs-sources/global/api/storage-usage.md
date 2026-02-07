# 存储使用审计报告

## 概述

本报告检查了项目中所有使用 cookie、localStorage 和 sessionStorage 的地方，确认是否都使用了共享代码库的 storage 工具。

## 共享代码库的 Storage 工具

### 1. Cookie 工具
- **位置**: `packages/shared-core/src/utils/storage/cookie/index.ts`
- **导出**: `getCookie`, `setCookie`, `deleteCookie`, `getCookieDomain`
- **使用方式**: 
  ```typescript
  import { getCookie, setCookie, deleteCookie } from '@btc/shared-core/utils/cookie';
  ```

### 2. LocalStorage 工具
- **位置**: `packages/shared-core/src/utils/storage/local/index.ts`
- **导出**: `storage` (单例实例)
- **使用方式**:
  ```typescript
  import { storage } from '@btc/shared-utils';
  // 或
  import { storage } from '@btc/shared-core/utils/storage/local';
  ```

### 3. SessionStorage 工具
- **位置**: `packages/shared-core/src/utils/storage/session/index.ts`
- **导出**: `sessionStorage` (单例实例)
- **使用方式**:
  ```typescript
  import { sessionStorage } from '@btc/shared-core/utils/storage/session';
  ```

## 发现的问题

### ❌ 问题 1: 直接使用 localStorage 的情况

#### 1.1 应用存储工具中的向后兼容代码
**位置**: 多个应用的 `src/utils/app-storage.ts`
- `main-app`, `system-app`, `finance-app`, `engineering-app`, `dashboard-app`, `operations-app`, `production-app`, `personnel-app`, `layout-app`

**问题代码**:
```typescript
const getItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);  // ❌ 直接使用
  } catch {
    return null;
  }
};

const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);  // ❌ 直接使用
  } catch {
    // 忽略删除错误
  }
};
```

**说明**: 这些函数用于向后兼容和清理旧数据，但应该使用共享工具。

#### 1.2 domain-cache.ts 文件
**位置**: 所有应用的 `src/utils/domain-cache.ts`
- `admin-app`, `main-app`, `system-app`, `layout-app`, `logistics-app`, `quality-app`, `finance-app`, `engineering-app`, `dashboard-app`, `operations-app`, `production-app`, `personnel-app`

**问题代码**:
```typescript
const localData = localStorage.getItem(DOMAIN_ME_STORAGE_KEY);  // ❌ 直接使用
localStorage.removeItem(DOMAIN_ME_STORAGE_KEY);  // ❌ 直接使用
localStorage.setItem(DOMAIN_ME_STORAGE_KEY, dataStr);  // ❌ 直接使用
```

#### 1.3 mobile-app 中的存储
**位置**: 
- `apps/mobile-app/src/modules/auth/composables/useRememberMe.ts`
- `apps/mobile-app/src/stores/auth.ts`

**问题代码**:
```typescript
// useRememberMe.ts
const stored = localStorage.getItem(STORAGE_KEY);  // ❌ 直接使用
localStorage.setItem(STORAGE_KEY, username);  // ❌ 直接使用
localStorage.removeItem(STORAGE_KEY);  // ❌ 直接使用

// auth.ts
localStorage.setItem('mobile_token', newToken);  // ❌ 直接使用
localStorage.removeItem('mobile_token');  // ❌ 直接使用
localStorage.setItem('mobile_user', JSON.stringify(userData));  // ❌ 直接使用
localStorage.removeItem('mobile_user');  // ❌ 直接使用
```

#### 1.4 admin-app 和 logistics-app 的 app-storage/index.ts
**位置**: 
- `apps/admin-app/src/utils/app-storage/index.ts`
- `apps/logistics-app/src/utils/app-storage/index.ts`

**问题代码**:
```typescript
// 大量直接使用 localStorage
localStorage.getItem(APP_STORAGE_KEYS.TOKEN);  // ❌
localStorage.setItem(APP_STORAGE_KEYS.TOKEN, token);  // ❌
localStorage.removeItem(APP_STORAGE_KEYS.TOKEN);  // ❌
// ... 等等
```

#### 1.5 HTTP 工具中的开发环境 API URL 存储
**位置**: 
- `apps/main-app/src/utils/http.ts`
- `apps/system-app/src/utils/http.ts`

**问题代码**:
```typescript
localStorage.getItem('dev_api_base_url');  // ❌ 直接使用
localStorage.setItem('dev_api_base_url', item.value);  // ❌ 直接使用
localStorage.removeItem('dev_api_base_url');  // ❌ 直接使用
```

#### 1.6 i18n 和配置中的 locale 存储
**位置**: 多个应用
- `apps/admin-app/src/i18n/getters.ts`
- `apps/admin-app/src/config/index.ts`
- `apps/admin-app/src/router/index.ts`
- `apps/finance-app/src/i18n/getters.ts`
- `apps/system-app/src/micro/index.ts`
- `apps/system-app/src/bootstrap/core/ui.ts`
- `apps/system-app/src/config/index.ts`
- `apps/main-app/src/config/config/index.ts`
- `apps/main-app/src/i18n/getters.ts`
- `apps/layout-app/src/runtime/i18n/getters.ts`
- `apps/logistics-app/src/micro/index.ts`
- `apps/quality-app/src/micro/index.ts`
- `apps/admin-app/src/micro/index.ts`

**问题代码**:
```typescript
const currentLocale = localStorage.getItem('locale') || 'zh-CN';  // ❌ 直接使用
```

#### 1.7 locale-switcher 组件
**位置**: `apps/main-app/src/modules/base/components/layout/locale-switcher/index.vue`

**问题代码**:
```typescript
localStorage.setItem('locale', value);  // ❌ 直接使用
```

#### 1.8 其他直接使用
- `apps/admin-app/src/modules/access/views/perm-compose/composables/usePermComposeData.ts`: 存储 mock 数据
- `apps/admin-app/src/composables/useUser.ts`: 存储用户信息
- `apps/main-app/src/composables/useUser.ts`: 清理用户信息
- `apps/system-app/src/utils/domain-cache.ts`: 清理 is_logged_in
- `apps/layout-app/src/template/utils/domain-cache.ts`: 清理 is_logged_in

### ❌ 问题 2: 直接使用 sessionStorage 的情况

#### 2.1 domain-cache.ts 文件
**位置**: 所有应用的 `src/utils/domain-cache.ts`

**问题代码**:
```typescript
const sessionData = sessionStorage.getItem(DOMAIN_ME_STORAGE_KEY);  // ❌ 直接使用
sessionStorage.removeItem(DOMAIN_ME_STORAGE_KEY);  // ❌ 直接使用
sessionStorage.setItem(DOMAIN_ME_STORAGE_KEY, dataStr);  // ❌ 直接使用
```

#### 2.2 路由守卫和初始化文件
**位置**: 多个应用
- `apps/main-app/src/router/guards/beforeEach.ts`
- `apps/main-app/src/micro/composables/useQiankunLifecycle.ts`
- `apps/system-app/src/router/index.ts`
- `apps/system-app/src/micro/index.ts`
- `apps/quality-app/src/utils/init-layout-app.ts`
- `apps/production-app/src/utils/init-layout-app.ts`
- `apps/personnel-app/src/utils/init-layout-app.ts`
- `apps/operations-app/src/utils/init-layout-app.ts`
- `apps/logistics-app/src/utils/init-layout-app.ts`
- `apps/layout-app/src/template/utils/init-layout-app.ts`
- `apps/finance-app/src/utils/init-layout-app.ts`
- `apps/engineering-app/src/utils/init-layout-app.ts`
- `apps/dashboard-app/src/utils/init-layout-app.ts`
- `apps/admin-app/src/utils/init-layout-app.ts`

**问题代码**:
```typescript
sessionStorage.getItem('__BTC_ROUTE_NORMALIZING__');  // ❌ 直接使用
sessionStorage.setItem('__BTC_ROUTE_NORMALIZING__', '1');  // ❌ 直接使用
sessionStorage.removeItem('__BTC_ROUTE_NORMALIZING__');  // ❌ 直接使用
sessionStorage.getItem('__BTC_NAV_LOADING__');  // ❌ 直接使用
sessionStorage.removeItem('__BTC_NAV_LOADING__');  // ❌ 直接使用
```

#### 2.3 HTTP 工具中的用户检查状态
**位置**: 
- `apps/main-app/src/utils/http.ts`
- `apps/system-app/src/utils/http.ts`

**问题代码**:
```typescript
sessionStorage.removeItem('__btc_user_check_polling_state');  // ❌ 直接使用
```

### ❌ 问题 3: 直接使用 document.cookie 的情况

#### 3.1 logistics-app 的 bootstrap
**位置**: `apps/logistics-app/src/bootstrap/index.ts`

**问题代码**:
```typescript
document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';  // ❌ 直接使用
```

### ✅ 正确使用共享工具的情况

#### 1. logoutCore.ts
**位置**: `packages/shared-core/src/auth/logoutCore.ts`

**正确代码**:
```typescript
sessionStorage.set('logout_timestamp', Date.now());  // ✅ 使用共享工具
sessionStorage.remove('logout_timestamp');  // ✅ 使用共享工具
```

#### 2. 大部分 app-storage.ts 文件
**位置**: 多个应用的 `src/utils/app-storage.ts`

**说明**: 这些文件主要使用共享的 `storage` 和 `getCookie`/`deleteCookie` 工具，但包含一些向后兼容的 `localStorage` 直接调用。

## 建议的修复方案

### 1. 统一使用共享工具

#### 对于 localStorage:
```typescript
// ❌ 错误
localStorage.getItem('key');
localStorage.setItem('key', value);
localStorage.removeItem('key');

// ✅ 正确
import { storage } from '@btc/shared-utils';
storage.get('key');
storage.set('key', value);
storage.remove('key');
```

#### 对于 sessionStorage:
```typescript
// ❌ 错误
sessionStorage.getItem('key');
sessionStorage.setItem('key', value);
sessionStorage.removeItem('key');

// ✅ 正确
import { sessionStorage } from '@btc/shared-core/utils/storage/session';
sessionStorage.get('key');
sessionStorage.set('key', value);
sessionStorage.remove('key');
```

#### 对于 Cookie:
```typescript
// ❌ 错误
document.cookie = 'key=value; path=/';

// ✅ 正确
import { setCookie, deleteCookie } from '@btc/shared-core/utils/cookie';
setCookie('key', 'value');
deleteCookie('key');
```

### 2. 优先级修复列表

#### 高优先级（影响核心功能）:
1. ✅ `apps/admin-app/src/utils/app-storage/index.ts` - 核心存储工具
2. ✅ `apps/logistics-app/src/utils/app-storage/index.ts` - 核心存储工具
3. ✅ `apps/mobile-app/src/stores/auth.ts` - 认证存储
4. ✅ `apps/mobile-app/src/modules/auth/composables/useRememberMe.ts` - 用户偏好

#### 中优先级（影响功能一致性）:
5. ✅ 所有 `domain-cache.ts` 文件
6. ✅ 所有 `app-storage.ts` 中的向后兼容代码
7. ✅ i18n 和配置中的 locale 存储
8. ✅ `locale-switcher` 组件

#### 低优先级（开发工具或临时存储）:
9. ⚠️ HTTP 工具中的 `dev_api_base_url` 存储（开发环境专用）
10. ⚠️ 路由守卫中的临时状态存储（可以考虑使用共享工具）

### 3. 特殊情况处理

#### 向后兼容代码
对于需要向后兼容的代码（如清理旧数据），可以保留直接使用，但应该：
1. 添加注释说明这是向后兼容代码
2. 考虑在迁移完成后移除

#### 开发环境专用存储
对于开发环境专用的存储（如 `dev_api_base_url`），可以：
1. 继续使用直接调用（因为不影响生产环境）
2. 或使用共享工具以保持一致性

## 总结

### 统计
- **直接使用 localStorage**: 约 200+ 处
- **直接使用 sessionStorage**: 约 50+ 处
- **直接使用 document.cookie**: 约 5 处
- **正确使用共享工具**: 大部分核心存储逻辑

### 主要问题
1. **不一致性**: 项目中存在大量直接使用原生 API 的情况，与共享工具混用
2. **维护困难**: 直接使用原生 API 的代码难以统一管理和维护
3. **功能缺失**: 直接使用原生 API 无法享受共享工具提供的功能（如前缀、序列化、错误处理等）

### 建议
1. **逐步迁移**: 优先修复高优先级文件，然后逐步迁移其他文件
2. **代码审查**: 在代码审查中禁止直接使用原生存储 API
3. **ESLint 规则**: 考虑添加 ESLint 规则禁止直接使用 `localStorage`、`sessionStorage` 和 `document.cookie`
