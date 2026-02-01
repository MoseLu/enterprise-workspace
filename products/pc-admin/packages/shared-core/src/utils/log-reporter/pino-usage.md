# Pino Logger 使用指南

## 概述

项目已集成 pino 日志库，专门用于日志上报。pino logger 会自动将日志上报到日志中心，无需手动调用上报接口。

## Node.js 脚本中使用

### 基本使用

```javascript
import { getPinoLogger } from '../../../utils/pino-logger.mjs';

// 创建 logger 实例
const logger = getPinoLogger({
  name: 'my-script',
  appName: 'agent-skill',
  enableReport: true,
  reportMinLevel: 'info', // 只上报 info 级别及以上的日志
});

// 使用 logger
logger.info('脚本开始执行', { userId: 123 });
logger.warn('警告信息', { data: 'some data' });
logger.error('错误信息', new Error('Something went wrong'));
```

### 在技能执行追踪中使用

技能执行追踪模块已经集成了 pino logger，直接使用即可：

```javascript
import { logger } from './utils/logger.mjs';

logger.info('执行开始', { skillName: 'dev-workflow' });
logger.error('执行失败', error, { executionId: 'exec_123' });
```

## 前端应用中使用

### 基本使用

```typescript
import { createPinoLogger } from '@btc/shared-core/utils/log-reporter/pino-integration';

// 创建 logger 实例
const logger = createPinoLogger({
  name: 'my-component',
  appName: 'admin-app', // 会自动从环境获取
  enableReport: true,
  reportMinLevel: 'info',
});

// 使用 logger
logger.info({ userId: 123 }, '用户登录');
logger.warn({ data: 'some data' }, '警告信息');
logger.error({ err: error }, '错误信息');
```

### 与现有 logger 集成

前端应用已经有统一的 logger，如果需要使用 pino，可以这样集成：

```typescript
import { createPinoLogger } from '@btc/shared-core/utils/log-reporter/pino-integration';
import { getLogReporter } from '@btc/shared-core/utils/log-reporter';

// 初始化 pino logger，使用现有的 LogReporter
const logger = createPinoLogger({
  name: 'app',
  reporter: getLogReporter(),
  enableReport: true,
});
```

## 日志级别

pino 支持的日志级别（从低到高）：
- `trace` (10)
- `debug` (20)
- `info` (30) - 默认上报级别
- `warn` (40)
- `error` (50)
- `fatal` (60)

## 自动上报规则

1. **上报级别**：默认只上报 `info` 级别及以上的日志
2. **批量上报**：日志会自动批量上报，减少网络请求
3. **异步上报**：上报不会阻塞主线程
4. **错误处理**：上报失败不会影响主程序运行

## 配置选项

### Node.js 环境

```javascript
const logger = getPinoLogger({
  name: 'logger-name',        // logger 名称
  level: 'info',              // 日志级别（控制台输出）
  appName: 'agent-skill',     // 应用名称（用于上报）
  enableReport: true,         // 是否启用上报
  reportMinLevel: 'info',     // 上报的最小日志级别
});
```

### 前端环境

```typescript
const logger = createPinoLogger({
  name: 'logger-name',
  level: 'info',
  appName: 'admin-app',
  reporter: logReporter,       // 可选的 LogReporter 实例
  reporterOptions: {},         // LogReporter 配置选项
  enableReport: true,
  reportMinLevel: 'info',
});
```

## 最佳实践

1. **使用结构化日志**：传递对象而不是字符串拼接
   ```javascript
   // 推荐
   logger.info({ userId: 123, action: 'login' }, '用户登录');
   
   // 不推荐
   logger.info(`用户 ${userId} 登录`);
   ```

2. **错误日志**：使用 `err` 或 `error` 字段传递错误对象
   ```javascript
   logger.error({ err: error }, '操作失败');
   ```

3. **上下文信息**：使用对象传递上下文
   ```javascript
   logger.info({ 
     executionId: 'exec_123',
     skillName: 'dev-workflow',
     duration: 1000
   }, '执行完成');
   ```

4. **敏感信息**：避免在日志中包含敏感信息（密码、token 等）

## 注意事项

1. **Node.js 环境**：在 Node.js 脚本中，日志上报通过 HTTP 请求发送，如果开发服务器未运行，上报会失败（但不会影响主程序）
2. **前端环境**：前端应用中的日志上报使用现有的 LogReporter，会自动批量上报
3. **性能**：日志上报是异步的，不会阻塞主线程
4. **错误处理**：上报失败会静默处理，不会抛出异常
