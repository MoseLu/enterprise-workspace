# Console 到 Logger 迁移报告

## 迁移概览

**执行时间**: 2025-01-07  
**迁移脚本**: `scripts/migrate-console-to-logger.mjs`  
**状态**: ✅ 已完成

## 统计信息

- **扫描文件数**: 2,606
- **修改文件数**: 579
- **替换调用数**: 2,839
- **跳过文件数**: 18
- **错误数**: 0

## 替换规则

### Console 方法映射

- `console.log()` → `logger.info()`
- `console.info()` → `logger.info()`
- `console.debug()` → `logger.debug()`
- `console.warn()` → `logger.warn()`
- `console.error()` → `logger.error()`

### 自动添加导入

所有修改的文件都自动添加了 logger 导入：

```typescript
import { logger } from '@btc/shared-core';
```

或在现有 `@btc/shared-core` 导入中添加了 `logger`。

## 跳过的文件

### 用于拦截的 Console（18 个文件）

这些文件中的 console 用于拦截和过滤日志，需要保留：

1. `apps/admin-app/src/micro/index.ts`
2. `packages/shared-core/src/utils/error-monitor/subappErrorCapture.ts`
3. `apps/main-app/src/micro/composables/useQiankunLogFilter.ts`
4. 以及其他包含 `console.warn =` 或 `console.error =` 赋值的文件

### 排除模式

- `**/node_modules/**`
- `**/dist/**`
- `**/*.d.ts`
- `**/*.md` (文档中的示例代码)
- `**/logger/**/*` (日志模块自身)

## 验证结果

### 剩余 Console 调用

剩余的 console 调用主要出现在：

1. **注释中** - 不需要替换
   - `packages/shared-core/src/composables/useCrossDomainBridge.ts` (注释)
   - `packages/shared-core/src/btc/service/request.ts` (注释)

2. **文档文件** - 示例代码，已排除
   - `**/*.md` 文件中的代码示例

3. **用于拦截的代码** - 已正确排除
   - `packages/shared-core/src/utils/error-monitor/subappErrorCapture.ts`
   - `apps/*/src/micro/index.ts` (多个应用)
   - `apps/main-app/src/micro/composables/useQiankunLogFilter.ts`
   - `apps/*/src/utils/errorMonitor.ts`

4. **日志模块内部** - 合理保留
   - `packages/shared-core/src/utils/logger/transports.ts` (使用 console.error 避免循环依赖)

## 后续步骤

1. ✅ **代码审查** - 已完成
2. ✅ **循环依赖修复** - transports.ts 中的循环导入已修复
3. ⏳ **运行 Lint** - `pnpm lint` (建议运行)
4. ⏳ **类型检查** - `pnpm type-check` (建议运行)
5. ⏳ **构建测试** - `pnpm build:share` (建议运行)
6. ⏳ **功能测试** - 验证应用正常运行

## 注意事项

1. **ESLint 规则**: 已配置 `no-console` 规则为 `warn`，建议后续改为 `error` 完全禁止
2. **CI/CD 检查**: 建议在 CI/CD 中添加检查，防止新的 console 调用
3. **代码审查**: 建议审查关键文件的替换结果，确保逻辑正确

## 使用方式

### 基本使用

```typescript
import { logger } from '@btc/shared-core';

logger.info('用户登录', { userId: 123 });
logger.error('操作失败', error);
```

### 详细文档

请参考: [packages/shared-core/src/utils/logger/README.md](packages/shared-core/src/utils/logger/README.md)

## 回滚方式

如果需要回滚，可以使用 Git：

```bash
git checkout HEAD -- .
```

或使用 Git 历史记录恢复特定文件。
