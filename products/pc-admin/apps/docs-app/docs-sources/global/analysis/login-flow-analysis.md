# 登录表单提交流程分析

本文档详细梳理了从用户点击"登录"按钮到最终完成重定向的完整流程。

## 流程图概览

```
用户点击登录按钮
    ↓
表单验证 (password-form/index.vue)
    ↓
触发 submit 事件
    ↓
usePasswordLogin.submit()
    ↓
authApi.login() → API 请求
    ↓
requestAdapter.post() → HTTP 请求适配器
    ↓
http.post() → Axios 实例
    ↓
【请求拦截器】处理请求头、baseURL
    ↓
发送 HTTP 请求 → /api/system/auth/login
    ↓
【响应拦截器】处理响应数据
    ↓
http.ts 的 onFulfilled 处理登录响应
    ↓
设置 is_logged_in 标记到 Cookie 和 Storage
    ↓
记录登录时间
    ↓
启动用户检查轮询
    ↓
延迟加载域列表和用户信息
    ↓
返回登录响应到 usePasswordLogin
    ↓
显示"登录成功"消息
    ↓
等待 500ms 确保状态稳定
    ↓
router.replace() → 触发路由导航
    ↓
【路由守卫】beforeEach
    ↓
1. logoutGuard (退出登录守卫)
    ↓
2. loginRedirectGuard (登录页重定向守卫)
    ↓
    - 检查认证状态
    - 提取 oauth_callback 参数
    - 验证并规范化重定向路径
    - 判断是否跨应用跳转
    - 执行重定向 (next() 或 handleCrossAppRedirect)
    ↓
3. authGuard (认证守卫)
    ↓
最终跳转到目标页面
```

## 详细流程说明

### 阶段 1: 表单提交

**文件**: `apps/main-app/src/pages/login/password-form/index.vue`

1. **用户操作**: 用户填写用户名和密码，点击"登录"按钮
2. **表单验证**: `formRef.value.validate()` 验证表单数据
3. **触发事件**: 通过 `emit('submit', { ...form })` 触发提交事件
4. **防止重复提交**: 使用 `isSubmitting` 标记防止重复提交

**关键代码**:
```typescript
const handleSubmit = async () => {
  if (!formRef.value) return;
  if (isSubmitting) return; // 防止重复提交
  
  try {
    isSubmitting = true;
    await formRef.value.validate();
    emit('submit', { ...form }); // 触发提交事件
  } catch {
    // 验证失败
  } finally {
    setTimeout(() => {
      isSubmitting = false;
    }, 100);
  }
};
```

### 阶段 2: 登录请求发起

**文件**: `apps/main-app/src/pages/login/composables/usePasswordLogin.ts`

1. **接收提交**: `submit` 函数接收表单数据
2. **设置加载状态**: `loading.value = true`
3. **调用登录 API**: `authApi.login({ username, password })`

**关键代码**:
```typescript
const loginResponse = await authApi.login({
  username: formData.username,
  password: formData.password
});
```

### 阶段 3: API 请求处理

**文件**: `apps/main-app/src/modules/api-services/auth/index.ts`

1. **API 客户端**: `authApi` 通过 `createAuthApi(apiClient)` 创建
2. **构建 URL**: `apiClient.post('auth', '/login', data)` 
   - 分类: `'auth'` → 基础路径: `/system/auth`
   - 端点: `/login`
   - 完整路径: `/system/auth/login`
3. **请求适配器**: `requestAdapter.post(url, data)`

**关键代码**:
```typescript
// API 客户端构建完整 URL
buildUrl('auth', '/login') → '/system/auth/login'

// 请求适配器调用 HTTP 实例
requestAdapter.post('/system/auth/login', data)
```

### 阶段 4: HTTP 请求发送

**文件**: `apps/main-app/src/utils/requestAdapter.ts` → `apps/main-app/src/utils/http.ts`

1. **HTTP 实例**: `http.post(url, data)` 使用 Axios 发送请求
2. **BaseURL**: `/api` (通过 Vite 代理转发到后端)
3. **完整 URL**: `/api/system/auth/login`
4. **请求拦截器**: 处理请求头、baseURL 验证等

**关键配置**:
- BaseURL: `/api`
- 目标后端: `http://10.80.9.76:8115` (开发环境)
- 代理配置: `apps/main-app/src/config/proxy.ts`

### 阶段 5: 响应拦截处理

**文件**: `apps/main-app/src/utils/http.ts`

**响应拦截器处理流程**:

1. **识别登录响应**: 检查 URL 是否包含 `/login`
   ```typescript
   const isLoginResponse = url.includes('/base/open/login') || url.endsWith('/login');
   ```

2. **调用统一拦截器**: `interceptor.onFulfilled(response)` 处理标准响应格式

3. **登录成功处理** (如果 `response.code === 200`):
   - **设置登录标记**: 
     ```typescript
     const updatedSettings = { ...currentSettings, is_logged_in: true };
     syncSettingsToCookie(updatedSettings);
     ```
   - **记录登录时间**: `recordLoginTime()` (用于存储有效性检查的宽限期)
   - **清除轮询状态**: `sessionStorage.remove('__btc_user_check_polling_state')`
   - **启动用户检查轮询**: `startUserCheckPolling(true)`
   - **延迟加载域列表**: 500ms 后加载 `loadDomainListOnLogin(service)`
   - **延迟加载用户信息**: 500ms 后加载 profile 信息

**关键代码**:
```typescript
if (isLoginSuccess) {
  // 设置 is_logged_in 标记
  syncSettingsToCookie({ ...currentSettings, is_logged_in: true });
  
  // 记录登录时间
  recordLoginTime();
  
  // 启动用户检查轮询
  startUserCheckPolling(true);
  
  // 延迟加载域列表和用户信息
  setTimeout(() => {
    loadDomainListOnLogin(service);
    // ... 加载 profile 信息
  }, 500);
}
```

### 阶段 6: 登录状态设置

**文件**: `apps/main-app/src/pages/login/composables/usePasswordLogin.ts`

1. **显示成功消息**: `BtcMessage.success(t('登录成功'))`
2. **设置登录标记**: (双重保险，响应拦截器已设置，这里再次确保)
   ```typescript
   const { storage } = await import('@btc/shared-core/utils/storage');
   const { syncSettingsToCookie } = await import('@btc/shared-core/utils/storage/cross-domain');
   const updatedSettings = { ...currentSettings, is_logged_in: true };
   syncSettingsToCookie(updatedSettings);
   ```
3. **记录登录时间**: `recordLoginTime()`

### 阶段 7: 路由导航触发

**文件**: `apps/main-app/src/pages/login/composables/usePasswordLogin.ts`

1. **等待状态稳定**: `await new Promise(resolve => setTimeout(resolve, 500))`
   - 确保 Cookie 和 Storage 中的 `is_logged_in` 标记都已设置
   - 确保认证状态可以被 `isAuthenticated()` 正确读取

2. **触发路由导航**: `router.replace({ path: route.path, query: route.query })`
   - 使用 `router.replace` 而不是 `router.push`，避免在历史记录中留下登录页
   - 保持当前路由（仍然是 `/login`），但触发导航守卫检查

**关键代码**:
```typescript
// 等待状态稳定
await new Promise(resolve => setTimeout(resolve, 500));

// 触发路由导航，让 loginRedirectGuard 检测已登录状态
await router.replace({
  path: route.path,
  query: route.query,
});
```

### 阶段 8: 路由守卫处理

**文件**: `apps/main-app/src/router/guards/beforeEach.ts`

**守卫执行顺序**:

#### 8.1 退出登录守卫 (logoutGuard)

**优先级**: 最高

**功能**: 检查是否有 `logout=1` 参数或退出标记

#### 8.2 登录页重定向守卫 (loginRedirectGuard)

**文件**: `packages/shared-router/src/guards/loginRedirectGuard.ts`

**执行流程**:

1. **检查路径**: 只处理 `/login` 路径

2. **检查认证状态**: `config.isAuthenticated()`
   - 如果未认证: 允许访问登录页，`next()`
   - 如果已认证: 继续处理重定向逻辑

3. **提取回调参数**: 
   ```typescript
   const oauthCallback = to.query.oauth_callback as string | undefined;
   const clearRedirectCookieParam = to.query.clearRedirectCookie;
   ```

4. **处理 clearRedirectCookie**: 如果参数为 `'1'`，清除重定向 Cookie

5. **验证并规范化重定向路径**:
   ```typescript
   if (oauthCallback) {
     redirectPath = validateAndNormalizeRedirectPath(oauthCallback, defaultPath);
   } else {
     // 尝试从 localStorage 获取保存的退出前路径
     const savedPath = getAndClearLogoutRedirectPath();
     redirectPath = validateAndNormalizeRedirectPath(savedPath, defaultPath);
   }
   ```

6. **防止循环重定向**: 确保重定向路径不是 `/login`

7. **判断是否跨应用跳转**:
   ```typescript
   const { getCurrentAppInfo, getTargetAppInfo, isCrossAppRedirect } = await import('@btc/shared-core/utils/redirect');
   const currentApp = await getCurrentAppInfo();
   const targetApp = await getTargetAppInfo(redirectPath);
   const isCross = isCrossAppRedirect(currentApp, targetApp);
   ```

8. **执行重定向**:
   - **同应用内跳转**: 使用 `next(redirectPath)` 或 `router.push(redirectPath)`
   - **跨应用跳转**: 
     - 开发环境: 返回 `false`，让 Vue Router 在主应用内处理
     - 生产环境: 使用 `handleCrossAppRedirect(redirectPath)` → `window.location.href`

**关键代码**:
```typescript
if (isCross) {
  // 跨应用跳转
  const fullUrl = convertPathToFullUrl(redirectPath);
  const handled = await handleCrossAppRedirect(fullUrl);
  if (!handled && router) {
    // 回退到 router 处理
    next(redirectPath);
  }
} else {
  // 同应用内跳转
  next(redirectPath);
}
```

#### 8.3 认证守卫 (authGuard)

**功能**: 检查非公开页面是否需要认证

**当前配置**: 已禁用自动重定向到登录页

### 阶段 9: 最终跳转

**执行方式**:

1. **同应用内跳转**: 
   - 使用 Vue Router 的 `next(redirectPath)`
   - 无页面刷新，保留 Vue 状态

2. **跨应用跳转** (生产环境):
   - 使用 `window.location.href = targetUrl`
   - 会刷新页面，重新加载目标应用

## 关键时间点

| 时间点 | 操作 | 文件/函数 |
|--------|------|-----------|
| T+0ms | 表单提交 | `password-form/index.vue` → `handleSubmit()` |
| T+0ms | API 请求发送 | `usePasswordLogin.submit()` → `authApi.login()` |
| T+~100-500ms | 后端响应 | HTTP 请求完成 |
| T+~100-500ms | 响应拦截器处理 | `http.ts` → `onFulfilled()` |
| T+~100-500ms | 设置登录标记 | `syncSettingsToCookie()` |
| T+~100-500ms | 启动用户检查轮询 | `startUserCheckPolling(true)` |
| T+~600-1000ms | 延迟加载域列表 | `loadDomainListOnLogin()` |
| T+~600-1000ms | 延迟加载用户信息 | Profile API 调用 |
| T+~500ms | 触发路由导航 | `router.replace()` |
| T+~500-600ms | 路由守卫检查 | `loginRedirectGuard` |
| T+~500-600ms | 执行重定向 | `next(redirectPath)` |

## 关键标记和状态

### 登录状态标记

- **Storage**: `storage.get('settings').is_logged_in = true`
- **Cookie**: `btc_settings` Cookie 中包含 `is_logged_in: true`
- **检查函数**: `isAuthenticated()` 读取上述标记

### SessionStorage 标记

- `logout_timestamp`: 退出登录时间戳
- `user_check_status`: 用户检查状态
- `__btc_user_check_polling_state`: 用户检查轮询状态

## 错误处理

### 登录失败

1. **API 响应 code !== 200**: 响应拦截器抛出错误
2. **错误捕获**: `usePasswordLogin.submit()` 的 `catch` 块
3. **错误提示**: `BtcMessage.error(error.message || t('登录失败'))`
4. **保持登录页**: 不进行任何跳转

### 重定向失败

1. **路径无效**: `validateAndNormalizeRedirectPath()` 返回默认首页
2. **路由不存在**: `router.resolve()` 无法匹配，使用配置的主应用路由
3. **循环重定向**: 检测到目标路径是 `/login`，强制使用默认首页

## 调试信息

在开发环境下，各个阶段都会输出详细的调试日志：

- `[usePasswordLogin]`: 登录请求相关日志
- `[requestAdapter]`: HTTP 请求适配器日志
- `[http]`: HTTP 响应拦截器日志
- `[loginRedirectGuard]`: 登录页重定向守卫日志

可以通过浏览器控制台查看完整的流程日志。

## 注意事项

1. **避免重复跳转**: 登录成功后不再手动调用 `router.push`，统一由 `loginRedirectGuard` 处理
2. **状态同步**: 使用 `syncSettingsToCookie()` 确保 Cookie 和 Storage 中的标记同步
3. **延迟处理**: 等待 500ms 确保认证状态稳定后再触发路由导航
4. **防止刷新**: 使用 `router.replace` 而不是 `window.location.href` 进行同应用内跳转
5. **跨应用跳转**: 生产环境下才使用 `window.location.href` 进行跨应用跳转
