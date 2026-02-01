# Cookie 工具使用文档

## 简介

Cookie 工具提供了统一的 Cookie 操作接口，支持环境判断、SameSite、Secure 等完整功能，适用于跨子域名共享用户偏好设置和用户信息。

## API 文档

### getCookie(name: string): string | null

获取 Cookie 值。

**参数：**
- `name`: Cookie 名称

**返回值：**
- Cookie 值（已自动解码），如果不存在则返回 `null`

**示例：**
```typescript
import { getCookie } from '@btc/shared-core/utils/storage/cookie';

const userId = getCookie('user_id');
```

### setCookie(name: string, value: string, days?: number, options?: CookieOptions): void

设置 Cookie。

**参数：**
- `name`: Cookie 名称
- `value`: Cookie 值（会自动编码）
- `days`: 过期天数（可选，默认 7 天）
- `options`: 额外选项（可选）
  - `sameSite?: 'Strict' | 'Lax' | 'None'`: SameSite 属性
  - `secure?: boolean`: Secure 属性
  - `domain?: string`: Domain 属性
  - `path?: string`: Path 属性（默认 '/'）

**示例：**
```typescript
import { setCookie } from '@btc/shared-core/utils/storage/cookie';

// 基本使用
setCookie('user_id', '12345', 7);

// 带选项
setCookie('token', 'abc123', 7, {
  sameSite: 'None',
  secure: true,
  domain: '.bellis.com.cn',
  path: '/',
});
```

### deleteCookie(name: string, options?: DeleteCookieOptions): void

删除 Cookie。

**参数：**
- `name`: Cookie 名称
- `options`: 额外选项（可选）
  - `domain?: string`: Domain 属性
  - `path?: string`: Path 属性（默认 '/'）

**注意：** 如果 Cookie 是 HttpOnly 的，前端无法删除，需要后端通过 Set-Cookie header 清除。

**示例：**
```typescript
import { deleteCookie } from '@btc/shared-core/utils/storage/cookie';

// 基本删除
deleteCookie('user_id');

// 带 domain 删除（跨子域名）
deleteCookie('user_id', {
  domain: '.bellis.com.cn',
  path: '/',
});
```

### getCookieDomain(): string | undefined

获取跨子域名共享的 Cookie domain。

**返回值：**
- 生产环境：`.bellis.com.cn`
- 开发环境：`.localhost`（如果支持）
- 其他环境：`undefined`

**示例：**
```typescript
import { getCookieDomain } from '@btc/shared-core/utils/storage/cookie';

const domain = getCookieDomain();
// 生产环境: '.bellis.com.cn'
// 开发环境: '.localhost' 或 undefined
```

## 使用示例

### 存储用户信息

```typescript
import { setCookie, getCookie, deleteCookie } from '@btc/shared-core/utils/storage/cookie';

// 存储用户信息
const userInfo = { id: 1, name: 'John' };
setCookie('btc_user', JSON.stringify(userInfo), 7);

// 读取用户信息
const userStr = getCookie('btc_user');
if (userStr) {
  const user = JSON.parse(userStr);
  console.log(user);
}

// 删除用户信息
deleteCookie('btc_user');
```

### 跨子域名共享

```typescript
import { setCookie, getCookieDomain } from '@btc/shared-core/utils/storage/cookie';

// 自动使用跨子域名 domain
const domain = getCookieDomain();
setCookie('shared_data', 'value', 7, {
  domain: domain, // 自动设置为 .bellis.com.cn（生产环境）
  path: '/',
});
```

## 注意事项

### 1. 跨域和 SameSite

- **HTTPS 环境**：自动设置 `SameSite=None` 和 `Secure`
- **HTTP 环境**：不设置 SameSite（使用浏览器默认值）
- **SameSite=None**：必须配合 `Secure` 属性，且只能在 HTTPS 环境下使用

### 2. Cookie 大小限制

- 单个 Cookie 通常限制为 **4KB**
- 超过限制的 Cookie 会被浏览器拒绝

### 3. 编码处理

- `setCookie` 会自动使用 `encodeURIComponent` 编码值
- `getCookie` 会自动使用 `decodeURIComponent` 解码值
- 无需手动编码/解码

### 4. 环境判断

工具会根据当前环境自动判断：
- 生产环境（`bellis.com.cn`）：设置 domain 为 `.bellis.com.cn`
- 开发环境（`localhost`）：尝试设置 domain 为 `.localhost`（某些浏览器可能不支持）
- 其他环境：不设置 domain

### 5. 跨子域名共享

通过设置 `domain` 属性（如 `.bellis.com.cn`），Cookie 可以在所有子域名之间共享：
- `admin.bellis.com.cn`
- `system.bellis.com.cn`
- `finance.bellis.com.cn`

## 最佳实践

1. **统一使用工具函数**：不要直接使用 `document.cookie`
2. **合理设置过期时间**：根据数据重要性设置合适的 `days` 参数
3. **注意安全性**：敏感信息使用 `Secure` 和 `HttpOnly`（HttpOnly 需要后端设置）
4. **跨域场景**：使用 `getCookieDomain()` 自动获取合适的 domain
