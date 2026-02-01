# 登录页重定向逻辑分析

本文档详细分析了项目中所有重定向到 `/login` 的逻辑位置和触发条件。

## 目录

1. [主应用路由守卫](#主应用路由守卫)
2. [系统应用路由守卫](#系统应用路由守卫)
3. [登录页重定向守卫](#登录页重定向守卫)
4. [路由配置中的重定向](#路由配置中的重定向)
5. [工具函数](#工具函数)
6. [总结](#总结)

---

## 主应用路由守卫

### 1. beforeEach 守卫 - 认证检查 (`apps/main-app/src/router/guards/beforeEach.ts`)

#### 1.1 `handleAuthentication` 函数（第 243-332 行）

**触发条件：**
- 访问非公开页面
- 用户未认证

**重定向逻辑：**
```typescript
// 将相对路径转换为完整 URL
const convertCallback = async () => {
  const { convertPathToFullUrl } = await import('@btc/auth-shared/composables/redirect');
  return await convertPathToFullUrl(to.fullPath);
};

convertCallback().then((fullCallbackUrl) => {
  next({
    path: '/login',
    query: { oauth_callback: fullCallbackUrl },
  });
}).catch((error) => {
  // 如果转换失败，使用原始路径
  next({
    path: '/login',
    query: { oauth_callback: to.fullPath },
  });
});
```

**位置：** `beforeEach` 守卫的第 540 行被调用

#### 1.2 `handleUnmatchedRoute` 函数（第 337-445 行）

**触发条件：**
- 路由未匹配（`to.matched.length === 0`）
- 不是主应用路由
- 不是公开页面
- 不是 duty 页面
- 不是 home-app 页面
- 用户未认证

**重定向逻辑：**
```typescript
if (!isAuthenticatedUser) {
  const convertCallback = async () => {
    const { convertPathToFullUrl } = await import('@btc/auth-shared/composables/redirect');
    return await convertPathToFullUrl(to.fullPath);
  };
  
  convertCallback().then((fullCallbackUrl) => {
    next({
      path: '/login',
      query: { oauth_callback: fullCallbackUrl },
    });
  }).catch((error) => {
    next({
      path: '/login',
      query: { oauth_callback: to.fullPath },
    });
  });
  return true;
}
```

**位置：** `beforeEach` 守卫的第 548 行被调用

### 2. afterEach 守卫 - 路由匹配调试 (`apps/main-app/src/router/guards/afterEach.ts`)

#### `handleRouteMatching` 函数（第 11-70 行）

**触发条件：**
- 生产环境（`import.meta.env.PROD`）
- 路由未匹配（`to.matched.length === 0`）
- 不是公开页面
- 用户未认证

**重定向逻辑：**
```typescript
if (!isAuth) {
  const { convertPathToFullUrl } = await import('@btc/auth-shared/composables/redirect');
  const fullCallbackUrl = await convertPathToFullUrl(to.fullPath);
  
  try {
    const loginRoute = router.resolve('/login');
    if (loginRoute && loginRoute.matched.length > 0) {
      router.replace({
        path: '/login',
        query: { oauth_callback: fullCallbackUrl },
      }).catch(() => {
        window.location.href = `/login?oauth_callback=${encodeURIComponent(fullCallbackUrl)}`;
      });
    } else {
      window.location.href = `/login?oauth_callback=${encodeURIComponent(fullCallbackUrl)}`;
    }
  } catch (error) {
    window.location.href = `/login?oauth_callback=${encodeURIComponent(fullCallbackUrl)}`;
  }
}
```

**位置：** `afterEach` 守卫的第 348 行被调用

---

## 系统应用路由守卫

### `apps/system-app/src/router/index.ts`

#### 1. 认证检查（第 1007-1014 行）

**触发条件：**
- 不是公开页面
- 用户未认证

**重定向逻辑：**
```typescript
if (!isAuthenticatedUser) {
  const loginUrl = getMainAppLoginUrl(to.fullPath);
  window.location.href = loginUrl;
  return;
}
```

#### 2. 未匹配路由处理（第 1042-1047 行）

**触发条件：**
- 路由未匹配（`to.matched.length === 0`）
- 不是根路径 `/`
- 不是 duty 页面
- 不是 home-app 页面
- 用户未认证

**重定向逻辑：**
```typescript
if (!isAuthenticatedUser) {
  const loginUrl = getMainAppLoginUrl(to.fullPath);
  window.location.href = loginUrl;
  return;
}
```

**注意：** 系统应用使用 `getMainAppLoginUrl` 获取主应用的登录页 URL（因为子应用没有登录页面）

---

## 登录页重定向守卫

### `packages/shared-router/src/guards/loginRedirectGuard.ts`

这个守卫用于处理**已认证用户访问登录页时的重定向**，它本身不直接重定向到 `/login`，而是处理从 `/login` 重定向出去的逻辑。

**作用：**
- 检查已认证用户访问 `/login` 时的重定向逻辑
- 防止循环重定向
- 处理跨应用跳转
- 处理 `oauth_callback` 参数

**关键逻辑：**
- 如果已认证且没有退出参数，重定向到目标页面（不是 `/login`）
- 如果重定向路径是 `/login`，会强制改为默认首页（防止循环）

---

## 路由配置中的重定向

### Catch-all 路由 (`apps/main-app/src/router/routes.ts` 第 270-320 行)

**路径：** `/:pathMatch(.*)*`

**触发条件：**
- 所有未匹配的路由
- 不是 duty 页面
- 不是 home-app 页面
- 不是主应用路由
- 用户未认证

**重定向逻辑：**
```typescript
beforeEnter: (to, _from, next) => {
  // ... 其他检查 ...
  
  const isAuthenticatedUser = isAuthenticated();
  
  if (!isAuthenticatedUser) {
    next({
      path: '/login',
      query: { oauth_callback: to.fullPath },
    });
    return;
  }
  
  // 已登录但路由未匹配，重定向到 404 页面
  next('/404');
}
```

---

## 工具函数

### 1. `getMainAppLoginUrl` (`packages/shared-core/src/utils/get-main-app-login-url.ts`)

**作用：** 生成主应用登录页的完整 URL（用于子应用重定向）

**逻辑：**
- 开发环境：使用主应用的端口（8080）
- 生产/测试环境：如果当前在子域名，重定向到主域名
- 支持 `oauth_callback` 参数

**使用场景：**
- 系统应用的重定向
- 其他子应用需要重定向到登录页时

### 2. `convertPathToFullUrl` (`auth/shared/composables/redirect.ts`)

**作用：** 将相对路径转换为完整 URL（用于 `oauth_callback` 参数）

**逻辑：**
- 根据环境（开发/测试/生产）生成完整 URL
- 确保回调 URL 可以在登录后正确重定向

---

## 总结

### 重定向到 `/login` 的场景汇总

1. **主应用路由守卫**（3 处）
   - `handleAuthentication`：访问非公开页面且未认证
   - `handleUnmatchedRoute`：路由未匹配且未认证
   - `handleRouteMatching`：生产环境下路由未匹配且未认证

2. **系统应用路由守卫**（2 处）
   - 认证检查：非公开页面且未认证
   - 未匹配路由：路由未匹配且未认证

3. **路由配置**（1 处）
   - Catch-all 路由的 `beforeEnter`：未匹配路由且未认证

### 重定向方式

1. **使用 `next()` 方法**（Vue Router）
   - 主要用于主应用的 `beforeEach` 守卫
   - 不会触发页面刷新

2. **使用 `window.location.href`**
   - 主要用于系统应用和跨应用跳转
   - 会触发页面刷新

### 回调 URL 参数

所有重定向都会携带 `oauth_callback` 查询参数：
- 参数值：目标页面的完整 URL 或相对路径
- 用途：登录成功后重定向回原页面

### 防止循环重定向

项目中有多处检查防止循环重定向到 `/login`：
- `loginRedirectGuard` 中检查重定向路径是否为 `/login`
- 如果检测到会强制改为默认首页（`/workbench/overview`）

---

## 相关文件清单

- `packages/shared-router/src/guards/loginRedirectGuard.ts` - 登录页重定向守卫
- `packages/shared-router/src/guards/authGuard.ts` - 认证守卫
- `apps/main-app/src/router/guards/beforeEach.ts` - 主应用路由前置守卫
- `apps/main-app/src/router/guards/afterEach.ts` - 主应用路由后置守卫
- `apps/main-app/src/router/routes.ts` - 主应用路由配置
- `apps/system-app/src/router/index.ts` - 系统应用路由配置
- `packages/shared-core/src/utils/get-main-app-login-url.ts` - 获取主应用登录页 URL
- `auth/shared/composables/redirect.ts` - 重定向相关工具函数
