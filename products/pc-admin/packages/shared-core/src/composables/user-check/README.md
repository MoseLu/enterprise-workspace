# User Check 用户检查轮询系统

## 概述

用户检查轮询系统用于定期检查用户登录状态和凭证过期时间，确保用户会话的有效性。系统采用智能的时间计算机制，基于后端 UTC 时间差进行精确计算，并支持页面刷新后的状态恢复。

## 核心特性

- ✅ **智能时间计算**：基于后端 UTC 时间差（`credentialExpireTime - serverCurrentTime`）计算实际剩余时间
- ✅ **时间验证机制**：使用后端返回的 `remainingTime` 进行验证（允许 10% 误差）
- ✅ **最长间隔限制**：单次轮询间隔最长不超过 1 小时
- ✅ **刷新优化**：页面刷新时使用存储的 UTC 时间重新计算，不立即调用接口
- ✅ **应用切换检测**：仅在应用切换时立即调用 user-check，刷新浏览器时使用存储时间
- ✅ **自动退出机制**：剩余时间不足 30 秒时自动进入退出流程

## 文件结构

```
user-check/
├── index.ts                    # 统一接口入口
├── useUserCheck.ts             # API 调用
├── useUserCheckPolling.ts      # 轮询机制核心
├── useUserCheckStorage.ts      # 数据存储管理
├── useUserCheckCountdown.ts    # 倒计时功能
└── README.md                   # 本文档
```

## 核心机制

### 1. 时间计算逻辑

#### 主要依据：UTC 时间差计算

系统使用后端返回的 UTC 时间戳计算实际剩余时间：

```typescript
function calculateActualRemainingTime(
  credentialExpireTime: string,  // 凭证过期时间（ISO 8601）
  serverCurrentTime: string       // 服务器当前时间（ISO 8601）
): number {
  const expireTime = new Date(credentialExpireTime).getTime();
  const currentTime = new Date(serverCurrentTime).getTime();
  const actualRemainingTime = Math.max(0, Math.floor((expireTime - currentTime) / 1000));
  return actualRemainingTime; // 返回秒数
}
```

#### 验证机制：使用后端 remainingTime 佐证

系统会使用后端返回的 `remainingTime` 验证计算结果的合理性：

```typescript
const diff = Math.abs(actualRemainingTime - remainingTime);
const maxDiff = Math.max(actualRemainingTime * 0.1, 10); // 允许10%误差或至少10秒
if (diff > maxDiff) {
  // 差异过大，记录警告但继续使用计算值
}
```

### 2. 轮询机制

#### 使用 setTimeout 递归调用

系统使用 `setTimeout` 递归调用，而非 `setInterval`，这样可以动态调整每次调用的间隔时间：

```typescript
// 计算下一次调用时间：actualRemainingTime - 30秒（留30秒缓冲）
const nextCallTime = actualRemainingTime - 30;

// 设置最大间隔（1小时），避免间隔过长
const maxInterval = 60 * 60 * 1000; // 1小时
const interval = Math.min(nextCallTime * 1000, maxInterval);

// 使用 setTimeout 递归调用
pollingTimer = setTimeout(() => {
  performCheck();
}, interval);
```

#### 关键参数

- **缓冲时间**：30 秒（`nextCallTime = actualRemainingTime - 30`）
- **最长间隔**：1 小时（`maxInterval = 60 * 60 * 1000`）
- **默认间隔**：5 分钟（异常情况下的兜底值）

### 3. 刷新恢复机制

当页面刷新时（`forceImmediate = false`），系统会：

1. 从 sessionStorage 读取存储的数据（`credentialExpireTime`, `serverCurrentTime`, `remainingTime`）
2. 使用存储的 UTC 时间重新计算实际剩余时间
3. 如果剩余时间有效，计算下次调用时间（不超过 1 小时）
4. 延迟执行第一次检查，**不立即调用接口**

```typescript
// 计算实际剩余时间（使用存储的 UTC 时间）
const actualRemainingTime = calculateActualRemainingTime(
  storedCredentialExpireTime,
  storedServerCurrentTime
);

// 如果还有时间，延迟执行第一次检查
if (nextCallTime > 0) {
  const maxInterval = 60 * 60 * 1000; // 1小时
  const interval = Math.min(nextCallTime * 1000, maxInterval);
  
  if (interval > 0) {
    pollingTimer = setTimeout(() => {
      performCheck();
    }, interval);
    return; // 不立即调用
  }
}
```

### 4. 应用切换检测

系统会检测是否是应用切换（而非页面刷新）：

- **应用切换**：立即调用 user-check 并更新会话存储
- **页面刷新**：使用存储的剩余时间，不立即调用（最长间隔 1 小时）

检测机制通过比较当前应用 ID 和 sessionStorage 中存储的上一次应用 ID 来判断。

## API 使用

### 启动轮询

#### 登录后立即启动（强制立即检查）

```typescript
import { startUserCheckPolling } from '@btc/shared-core/composables/user-check';

// 登录成功后，强制立即检查，获取最新的剩余时间
startUserCheckPolling(true);
```

#### 应用启动时检查（使用存储时间）

```typescript
import { startUserCheckPollingIfLoggedIn } from '@btc/shared-core/composables/user-check';

// 应用启动时调用，如果已登录则启动轮询
// 会检查 sessionStorage，如果有存储数据则使用存储时间，不立即调用
startUserCheckPollingIfLoggedIn();
```

### 停止轮询

```typescript
import { stopUserCheckPolling } from '@btc/shared-core/composables/user-check';

// 退出登录时调用
stopUserCheckPolling();
```

### 应用切换时重新初始化

```typescript
import { reinitializeUserCheckOnAppSwitch } from '@btc/shared-core/composables/user-check';

// 应用切换时调用，立即检查并更新会话存储
await reinitializeUserCheckOnAppSwitch();
```

### 获取当前数据

```typescript
import { getUserCheckData } from '@btc/shared-core/composables/user-check';

const { credentialExpireTime, sessionData } = getUserCheckData();
```

## 数据存储

### SessionStorage

存储以下字段（标签页级别，不共享）：

- `user_check_status`: 用户状态（valid | expired | soon_expire | unauthorized）
- `user_check_serverTime`: 服务器当前时间（ISO 8601）
- `user_check_credentialExpireTime`: 凭证过期时间（ISO 8601）
- `user_check_remainingTime`: 剩余时间（秒）
- `user_check_details`: 详细信息
- `__last_app_id__`: 上一次应用 ID（用于检测应用切换）

### Cookie

存储到 `btc_user` cookie 中（跨标签页共享）：

- `credentialExpireTime`: 凭证过期时间（ISO 8601）

## 工作流程

### 1. 登录后启动

```
登录成功 
  → startUserCheckPolling(true) 
  → 立即调用 checkUser() 
  → 获取 credentialExpireTime 和 serverCurrentTime 
  → 计算 actualRemainingTime 
  → 存储到 sessionStorage 和 cookie 
  → 计算下次调用时间（不超过1小时） 
  → setTimeout 安排下次检查
```

### 2. 页面刷新

```
页面刷新 
  → startUserCheckPollingIfLoggedIn() 
  → 检查 sessionStorage 是否有数据 
  → 使用存储的 UTC 时间重新计算 actualRemainingTime 
  → 计算下次调用时间（不超过1小时） 
  → setTimeout 延迟执行，不立即调用
```

### 3. 应用切换

```
应用切换 
  → checkIfAppSwitch() 返回 true 
  → startUserCheckPolling(true) 
  → 立即调用 checkUser() 
  → 更新会话存储 
  → 重新计算下次调用时间
```

### 4. 轮询检查

```
setTimeout 触发 
  → performCheck() 
  → 调用 checkUser() 
  → 获取最新数据 
  → 使用 UTC 时间差计算 actualRemainingTime 
  → 使用 remainingTime 验证（允许10%误差） 
  → 更新存储 
  → 判断状态：
     - expired/unauthorized → 立即退出
     - soon_expire 且 < 30秒 → 进入退出流程
     - 否则 → 计算下次调用时间（不超过1小时） → setTimeout
```

## 关键特性详解

### 1. 时间计算优先级

1. **主要依据**：UTC 时间差计算（`credentialExpireTime - serverCurrentTime`）
2. **验证依据**：后端返回的 `remainingTime`（允许 10% 误差）
3. **兜底方案**：如果计算异常，使用默认间隔（5 分钟）

### 2. 最长间隔限制

无论剩余时间多长，单次轮询间隔最长不超过 1 小时：

```typescript
const maxInterval = 60 * 60 * 1000; // 1小时
const interval = Math.min(nextCallTime * 1000, maxInterval);
```

### 3. 刷新优化

页面刷新时不会立即调用 user-check 接口，而是：

1. 从 sessionStorage 读取存储的 UTC 时间
2. 重新计算实际剩余时间
3. 如果剩余时间很长（> 1 小时），延迟 1 小时后才调用
4. 如果剩余时间较短，按实际剩余时间延迟调用

这样可以避免频繁刷新页面时产生大量不必要的 API 调用。

### 4. 应用切换检测

系统通过比较当前应用 ID 和 sessionStorage 中存储的上一次应用 ID 来判断是否是应用切换：

- **应用切换**：应用 ID 不同 → 立即调用 user-check
- **页面刷新**：应用 ID 相同 → 使用存储时间，不立即调用

### 5. 自动退出机制

当检测到以下情况时，系统会自动进入退出流程：

- 用户状态为 `expired` 或 `unauthorized`
- 用户状态为 `soon_expire` 且实际剩余时间 < 30 秒
- 计算出的剩余时间 <= 30 秒

退出流程：

1. 停止轮询
2. 显示警告消息（5 秒）
3. 5 秒后执行退出逻辑

## 注意事项

### 1. 标签页隔离

- SessionStorage 是标签页级别的，不同标签页不共享
- Cookie 是跨标签页共享的，但主要用于存储 `credentialExpireTime`

### 2. 时间同步

- 系统依赖后端返回的 UTC 时间戳，确保时间同步准确
- 如果客户端时间与服务器时间差异过大，可能会影响计算准确性

### 3. 网络异常处理

- 如果 API 调用失败，系统会使用默认间隔（5 分钟）重新尝试
- 不会因为单次失败而停止轮询

### 4. 并发控制

- `startUserCheckPollingIfLoggedIn` 使用锁机制防止并发调用
- 如果已经在轮询，不会重复启动

## 最佳实践

### 1. 登录后

```typescript
// 登录成功后，立即启动轮询（强制立即检查）
startUserCheckPolling(true);
```

### 2. 应用启动时

```typescript
// 在应用启动时调用，会自动判断是否已登录
// 如果已登录，会使用存储时间，不立即调用
startUserCheckPollingIfLoggedIn();
```

### 3. 应用切换时

```typescript
// 在应用切换时调用，立即检查并更新会话存储
await reinitializeUserCheckOnAppSwitch();
```

### 4. 退出登录时

```typescript
// 退出登录时，停止轮询并清除数据
stopUserCheckPolling();
```

## 调试

### 开发环境日志

在开发环境下，系统会输出详细的日志信息：

- 时间差计算与 remainingTime 的差异
- 实际剩余时间异常警告
- 用户状态变化
- 退出流程触发

### 检查轮询状态

```typescript
import { isPollingActive, getUserCheckData } from '@btc/shared-core/composables/user-check';

// 检查是否正在轮询
const isActive = isPollingActive();

// 获取当前数据
const { credentialExpireTime, sessionData } = getUserCheckData();
```

## 相关文件

- `packages/shared-core/src/composables/user-check/index.ts` - 统一接口入口
- `packages/shared-core/src/composables/user-check/useUserCheck.ts` - API 调用
- `packages/shared-core/src/composables/user-check/useUserCheckPolling.ts` - 轮询机制核心
- `packages/shared-core/src/composables/user-check/useUserCheckStorage.ts` - 数据存储管理
- `packages/shared-core/src/composables/user-check/useUserCheckCountdown.ts` - 倒计时功能
