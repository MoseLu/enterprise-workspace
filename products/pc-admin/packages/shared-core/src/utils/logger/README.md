# 统一日志模块

基于 [Pino](https://getpino.io/) 的高性能日志系统，提供统一的日志接口，并自动集成到现有的日志上报机制。

## 特性

- ✅ **高性能**：异步日志，不阻塞 UI 线程
- ✅ **结构化日志**：JSON 格式，便于分析和上报
- ✅ **环境自适应**：开发环境格式化输出，生产环境结构化 JSON
- ✅ **自动上报**：集成现有的 request-logger，自动批量上报到后端
- ✅ **上下文支持**：支持自动注入用户信息、请求ID等上下文
- ✅ **类型安全**：完整的 TypeScript 类型定义

## 快速开始

### 基本使用

```typescript
import { logger } from '@btc/shared-core';

// 基本日志
logger.debug('调试信息');
logger.info('用户登录成功');
logger.warn('警告信息');
logger.error('错误信息', error);

// 带上下文的日志
logger.info('用户操作', { userId: 123, action: 'login' });
```

### 在 Vue 组件中使用

```vue
<script setup lang="ts">
import { logger } from '@btc/shared-core';

const handleSubmit = async () => {
  try {
    logger.info('开始提交表单', { formId: 'user-form' });
    await submitForm();
    logger.info('表单提交成功');
  } catch (error) {
    logger.error('表单提交失败', error);
  }
};
</script>
```

## API 参考

### logger.debug(message, ...args)

记录调试级别的日志。仅在开发环境输出。

```typescript
logger.debug('调试信息', { data: someData });
```

### logger.info(message, ...args)

记录信息级别的日志。

```typescript
logger.info('用户登录', { userId: 123, username: 'john' });
```

### logger.warn(message, ...args)

记录警告级别的日志。

```typescript
logger.warn('API 响应异常', { status: 500, url: '/api/users' });
```

### logger.error(message, error?, ...args)

记录错误级别的日志。支持传入 Error 对象。

```typescript
// 方式1：传入 Error 对象
try {
  await someOperation();
} catch (error) {
  logger.error('操作失败', error);
}

// 方式2：传入错误信息对象
logger.error('操作失败', { code: 'E001', message: '操作超时' });

// 方式3：仅传入消息
logger.error('操作失败');
```

### logger.fatal(message, error?, ...args)

记录致命错误级别的日志。

```typescript
logger.fatal('系统崩溃', error);
```

### logger.child(context)

创建带上下文的子 logger。所有通过子 logger 记录的日志都会自动包含上下文信息。

```typescript
const userLogger = logger.child({ userId: 123, username: 'john' });
userLogger.info('用户操作'); // 自动包含 userId 和 username
```

### setLogContext(context)

设置全局日志上下文。所有后续的日志都会自动包含这些上下文信息。

```typescript
import { setLogContext } from '@btc/shared-core';

// 在用户登录后设置
setLogContext({
  userId: 123,
  username: 'john',
  appId: 'admin-app',
});

// 后续所有日志都会自动包含这些信息
logger.info('操作完成'); // 自动包含 userId, username, appId
```

### getLogContext()

获取当前的全局日志上下文。

```typescript
import { getLogContext } from '@btc/shared-core';

const context = getLogContext();
console.log(context); // { userId: 123, username: 'john', appId: 'admin-app' }
```

### clearLogContext()

清除全局日志上下文。

```typescript
import { clearLogContext } from '@btc/shared-core';

// 在用户登出时清除
clearLogContext();
```

## 日志级别

日志级别从低到高：

- `debug`：调试信息，仅在开发环境输出
- `info`：一般信息，正常业务流程
- `warn`：警告信息，需要注意但不影响运行
- `error`：错误信息，需要处理
- `fatal`：致命错误，系统可能无法继续运行

### 环境配置

- **开发环境**：默认级别 `debug`，输出格式化的日志到控制台
- **生产环境**：默认级别 `warn`，输出结构化 JSON，并自动上报到后端

## 日志上报

日志会自动通过现有的 `request-logger` 机制批量上报到后端。

### 上报规则

- 仅 `info` 级别及以上的日志会上报到后端
- 自动过滤敏感接口（登录、注册等）
- 批量发送，减少网络请求
- 支持重试机制和 QPS 限制

### 日志格式

上报到后端的日志格式：

```typescript
{
  userId?: number;
  username?: string;
  requestUrl: string;
  params: string; // JSON 字符串
  ip?: string;
  duration: number;
  status: 'success' | 'failed';
  createdAt: string; // ISO 8601 格式
}
```

## 最佳实践

### 1. 替换 console 调用

**不推荐：**
```typescript
console.log('用户登录');
console.error('登录失败', error);
```

**推荐：**
```typescript
logger.info('用户登录');
logger.error('登录失败', error);
```

### 2. 使用上下文

**不推荐：**
```typescript
logger.info(`用户 ${userId} 执行了操作 ${action}`);
```

**推荐：**
```typescript
logger.info('用户执行操作', { userId, action });
```

### 3. 错误处理

**不推荐：**
```typescript
catch (error) {
  logger.error('操作失败');
}
```

**推荐：**
```typescript
catch (error) {
  logger.error('操作失败', error, { operation: 'submit-form' });
}
```

### 4. 敏感信息过滤

日志系统会自动过滤敏感参数（password、token、secret 等），但建议在记录日志时避免包含敏感信息。

**不推荐：**
```typescript
logger.info('用户登录', { password: '123456' }); // 敏感信息会被过滤，但不应记录
```

**推荐：**
```typescript
logger.info('用户登录', { userId: 123, username: 'john' });
```

## 迁移指南

### 从 console 迁移到 logger

1. **替换导入**
   ```typescript
   // 旧代码
   console.log('信息');
   
   // 新代码
   import { logger } from '@btc/shared-core';
   logger.info('信息');
   ```

2. **替换方法**
   - `console.log` → `logger.info` 或 `logger.debug`
   - `console.info` → `logger.info`
   - `console.warn` → `logger.warn`
   - `console.error` → `logger.error`
   - `console.debug` → `logger.debug`

3. **处理错误对象**
   ```typescript
   // 旧代码
   console.error('错误', error);
   
   // 新代码
   logger.error('错误', error);
   ```

### 批量迁移

可以使用 ESLint 规则自动检测和修复：

```bash
# 检查 console 使用
pnpm lint

# 自动修复（部分）
pnpm lint:fix
```

## 故障排查

### 日志没有输出

1. 检查日志级别：生产环境默认只输出 `warn` 及以上级别
2. 检查环境变量：确保 `import.meta.env.DEV` 正确设置

### 日志没有上报

1. 检查服务是否初始化：确保 `window.__BTC_SERVICE__` 已设置
2. 检查日志级别：仅 `info` 及以上级别会上报
3. 检查网络：查看浏览器控制台是否有错误

### 性能问题

Pino 是异步的，性能影响很小。如果遇到性能问题：

1. 检查日志级别：生产环境使用 `warn` 级别
2. 减少日志量：避免在高频操作中记录过多日志
3. 使用采样：对于高频日志，可以添加采样逻辑

## 相关资源

- [Pino 官方文档](https://getpino.io/)
- [项目日志分析文档](../../../../LOGGING_LIBRARY_ANALYSIS.md)
