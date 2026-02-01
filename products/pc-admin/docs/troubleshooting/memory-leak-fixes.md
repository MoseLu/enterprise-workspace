# 内存泄漏修复记录

## 已修复的问题

### 1. 主题插件未清理的 setInterval（严重）

**文件**: `packages/shared-core/src/btc/plugins/theme/index.ts`

**问题**: 第 313 行有一个 `setInterval` 没有保存引用，也没有清理机制，导致定时器在整个应用生命周期中一直运行。

**修复**:
- 保存 `setInterval` 和 `MutationObserver` 的引用到全局变量
- 在重新创建插件时清理之前的定时器和观察器
- 提供 `cleanupThemePlugin()` 函数用于手动清理

**影响**: 这是一个严重的内存泄漏问题，会导致内存持续增长。修复后，定时器可以被正确清理。

## 需要关注的问题

根据 `pnpm diagnose:leak` 的扫描结果，以下问题需要根据实际情况处理：

### 1. 未移除的事件监听器（警告级别）

以下文件中有未移除的事件监听器，需要根据实际情况判断是否需要清理：

#### 应用配置文件
- `admin-app/src/config/proxy.ts` - 3 个监听器
- `main-app/src/config/config/proxy.ts` - 5 个监听器
- `system-app/src/config/proxy.ts` - 5 个监听器

**建议**: 这些通常是 HTTP 代理配置中的错误处理监听器，如果是在应用生命周期中一直需要的，可以不清理。但如果是在特定场景下使用的，应该在使用完毕后清理。

#### 构建脚本和工具
- `scripts/bin/dev.js` - 2 个监听器（进程事件，通常不需要清理）
- `scripts/bin/monitor.js` - 2 个监听器（进程事件，通常不需要清理）
- `scripts/utils/turbo-helper.mjs` - 2 个监听器（进程事件，通常不需要清理）
- `scripts/utils/shell-helper.mjs` - 6 个监听器（进程事件，通常不需要清理）

**建议**: 这些是进程管理相关的监听器，通常在进程退出时会自动清理。但如果进程长期运行，应该考虑在适当的时候清理。

#### Vite 插件
- `packages/vite-plugin/src/utils/index.ts` - 2 个监听器

**建议**: 检查这些监听器是否在插件卸载时需要清理。

### 2. 潜在的 setTimeout 循环（信息级别）

以下文件中有 `setTimeout(..., 0)` 模式，需要确认是否用于循环调用：

- `main-app/src/micro/composables/useQiankunLifecycle.ts` - 2 处
- `main-app/src/micro/composables/useQiankunSetup.ts` - 1 处
- `shared-core/src/composables/subapp-lifecycle/useSubAppRouteSync.ts` - 5 处
- `shared-components/src/components/layout/app-layout/index.vue` - 1 处

**建议**: 检查这些 `setTimeout(..., 0)` 是否用于循环调用。如果是，确保有退出条件和清理机制。

### 3. 第三方库问题（信息级别）

- `mobile-app/public/js/numberAuth-web-sdk.js` - 17 个 setTimeout，14 处闭包
- `mobile-app/public/libs/number-auth/numberAuth-web-sdk.js` - 17 个 setTimeout，14 处闭包

**建议**: 这些是第三方库，如果可能，考虑更新到最新版本或寻找替代方案。

## 修复优先级

1. **高优先级**（已修复）:
   - ✅ 主题插件未清理的 setInterval

2. **中优先级**（需要评估）:
   - 应用配置文件中的事件监听器（proxy.ts）
   - Vite 插件中的事件监听器

3. **低优先级**（信息级别）:
   - setTimeout(..., 0) 模式（需要确认是否真的是循环调用）
   - 第三方库的问题

## 如何验证修复

1. 运行内存诊断工具：
   ```bash
   pnpm diagnose:memory
   pnpm diagnose:leak
   ```

2. 监控内存使用：
   - 启动开发服务器后，观察内存使用趋势
   - 如果内存持续增长不回落，可能存在其他泄漏点

3. 分析堆快照：
   - 如果发生 OOM，分析生成的堆快照
   - 使用 Chrome DevTools 查看内存占用最多的对象

## 最佳实践

1. **定时器管理**:
   - 所有 `setInterval` 都必须保存引用
   - 在组件卸载或函数退出时调用 `clearInterval`
   - 在 Vue 组件的 `onUnmounted` 钩子中清理定时器

2. **事件监听器管理**:
   - 所有 `.on()` 都应该有对应的 `.off()` 或 `.removeListener()`
   - 在组件卸载时移除监听器
   - 使用 `onUnmounted` 钩子确保清理

3. **全局变量管理**:
   - 避免在全局对象上无限累积数据
   - 为全局缓存添加容量限制
   - 实现 LRU 缓存策略

4. **闭包管理**:
   - 避免在闭包中持有大量数据的引用
   - 确保闭包本身能被正确释放

## 相关文档

- [Node.js OOM 内存溢出排查指南](./memory-oom-analysis.md)
- [内存诊断工具使用说明](../development/scripts-usage.md)
