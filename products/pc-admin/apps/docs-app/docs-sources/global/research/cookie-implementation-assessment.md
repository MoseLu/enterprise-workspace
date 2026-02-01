# Cookie 实现评估报告

## 当前实现情况

### 1. 实现位置
- **统一实现**：`packages/shared-core/src/utils/cookie/index.ts`
- **各应用实现**：每个应用都有自己的 `src/utils/cookie.ts`（main-app, system-app, admin-app 等）

### 2. 核心功能

#### shared-core 实现（简化版）
```typescript
// 功能
- getCookie(name: string): string | null
- setCookie(name, value, days, options)
- deleteCookie(name, options)

// 特点
- 使用 encodeURIComponent 编码值
- 简单的 SameSite 处理（HTTPS 默认 Lax）
- 支持 domain, path, secure, sameSite 选项
```

#### 各应用实现（完整版）
```typescript
// 功能
- getCookie(name: string): string | null
- setCookie(name, value, days, options)
- deleteCookie(name, options)
- getCookieDomain(): string | undefined

// 特点
- 值不编码（直接使用原始值）
- 复杂的环境判断逻辑（开发/预览/生产）
- 详细的 SameSite=None + Secure 处理
- 支持 IP 地址环境特殊处理
```

### 3. 发现的问题

#### 问题 1：代码重复
- 多个应用有几乎相同的 cookie 实现
- 维护成本高，修改需要同步多个文件

#### 问题 2：实现不一致
- **编码差异**：
  - shared-core: 使用 `encodeURIComponent(value)` ✅
  - 其他应用: 直接使用 `${value}` ❌
  
- **功能差异**：
  - shared-core: 简单实现，缺少环境判断
  - 其他应用: 完整实现，包含环境相关逻辑

#### 问题 3：getCookie 解码处理
- shared-core: 使用 `decodeURIComponent` ✅
- 其他应用: 使用 try-catch 处理解码，更健壮 ✅

### 4. 当前实现的功能覆盖

✅ **已实现功能**：
- 基本 CRUD（get/set/delete）
- SameSite 支持（Strict/Lax/None）
- Secure 支持
- Domain 支持（跨子域名）
- Path 支持
- Expires 支持（通过 days 参数）
- 环境相关的特殊处理（开发/预览/生产）

❌ **缺失功能**：
- 不支持 Date 对象作为 expires（只能通过 days）
- 不支持 Max-Age（只能通过 expires）
- 没有 getAllCookies() 方法
- 没有 JSON 序列化/反序列化支持

## js-cookie 库评估

### js-cookie 优势

1. **成熟稳定**
   - 广泛使用，经过充分测试
   - 自动处理编码/解码
   - 支持多种 expires 格式（Date、Number、String）

2. **API 简洁**
   ```typescript
   Cookies.set('name', 'value', { expires: 7, sameSite: 'strict' })
   Cookies.get('name')
   Cookies.remove('name')
   ```

3. **功能完整**
   - 支持 expires（Date/Number）
   - 支持 maxAge
   - 支持 path, domain, secure, sameSite
   - 支持 JSON 序列化（通过 converter）

### js-cookie 劣势

1. **无法满足特殊需求**
   - 项目需要环境相关的 SameSite 逻辑（IP 地址、预览环境等）
   - js-cookie 无法自动处理这些业务逻辑

2. **迁移成本**
   - 需要修改所有使用 cookie 的地方
   - 需要统一各应用的实现

3. **依赖增加**
   - 增加 ~1KB 的依赖（gzipped）

## 建议方案

### 方案 1：不引入 js-cookie，统一现有实现 ⭐ 推荐

**优点**：
- 无需引入新依赖
- 保持对业务逻辑的完全控制
- 迁移成本低

**实施步骤**：
1. 将各应用的完整 cookie 实现迁移到 `shared-core`
2. 统一使用 shared-core 的实现
3. 删除各应用的重复实现
4. 修复编码问题（统一使用 encodeURIComponent）

**代码示例**：
```typescript
// packages/shared-core/src/utils/cookie/index.ts
// 整合各应用的完整实现，包含环境判断逻辑
export function setCookie(name, value, days, options) {
  // 使用 encodeURIComponent 编码
  // 包含环境相关的 SameSite 逻辑
  // 支持 IP 地址、预览环境等特殊处理
}
```

### 方案 2：引入 js-cookie，封装业务逻辑

**优点**：
- 使用成熟库，减少维护成本
- API 更简洁

**缺点**：
- 需要封装业务逻辑（环境判断等）
- 迁移成本较高
- 仍然需要自定义代码处理特殊需求

**实施步骤**：
1. 安装 js-cookie
2. 创建封装层处理业务逻辑
3. 逐步迁移各应用

**代码示例**：
```typescript
// packages/shared-core/src/utils/cookie/index.ts
import Cookies from 'js-cookie';

export function setCookie(name, value, days, options) {
  // 业务逻辑：环境判断
  const isHttps = window.location.protocol === 'https:';
  const isIpAddress = /^\d+\.\d+\.\d+\.\d+/.test(window.location.hostname);
  
  // 调用 js-cookie
  Cookies.set(name, value, {
    expires: days,
    sameSite: determineSameSite(options, isHttps, isIpAddress),
    secure: determineSecure(options, isHttps),
    domain: options?.domain,
    path: options?.path || '/',
  });
}
```

## 最终建议

**推荐方案 1：统一现有实现，不引入 js-cookie**

**理由**：
1. ✅ 项目已有完整的 cookie 实现，功能满足需求
2. ✅ 需要处理复杂的业务逻辑（环境判断），js-cookie 无法直接满足
3. ✅ 避免增加依赖，保持项目轻量
4. ✅ 迁移成本低，只需统一实现即可

**需要做的事情**：
1. 将完整的 cookie 实现（包含环境判断逻辑）迁移到 `shared-core`
2. 统一使用 `encodeURIComponent` 编码
3. 各应用改为从 `@btc/shared-core/utils/cookie` 导入
4. 删除各应用的重复实现

**如果未来需要**：
- 如果项目规模扩大，需要更复杂的 cookie 管理
- 如果需要 JSON 序列化等高级功能
- 可以考虑引入 js-cookie 并封装业务逻辑

## 总结

当前实现已经足够完善，**不建议引入 js-cookie**。建议统一现有实现，消除代码重复，保持对业务逻辑的完全控制。
