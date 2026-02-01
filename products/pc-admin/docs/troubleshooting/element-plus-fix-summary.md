# Element Plus 样式引擎内存泄漏修复总结

## 修复完成 ✅

已按照完整解决方案实施所有修复，解决了 Element Plus 重复安装、样式重复导入、配置不一致、卸载不清理四个核心问题。

## 一、统一 Element Plus 全局实例 ✅

### 1. 创建共享初始化模块
- **文件**: `packages/shared-core/src/btc/utils/element-plus/index.ts`
- **功能**: 
  - `initGlobalElementPlus()` - 全局统一初始化（仅执行一次）
  - `updateElementPlusLocale()` - 更新语言（无需重新实例化）
  - `getGlobalElementPlus()` - 获取全局实例
  - `isElementPlusInstalled()` - 检查是否已安装

### 2. 所有子应用已改造
已修改以下应用的 `setupElementPlus` 函数：
- ✅ main-app
- ✅ system-app
- ✅ admin-app
- ✅ finance-app
- ✅ logistics-app
- ✅ quality-app
- ✅ production-app
- ✅ engineering-app
- ✅ dashboard-app
- ✅ personnel-app
- ✅ operations-app
- ✅ layout-app

**改造方式**：
```typescript
// 之前（每个应用都创建实例）
app.use(ElementPlus, { locale });

// 现在（复用全局实例）
initGlobalElementPlus(app, currentLocale);
```

## 二、消除样式重复导入 ✅

### 1. 主应用保留全局样式导入
- **文件**: `apps/main-app/src/main.ts`
- **保留**: Element Plus 样式在主应用中全局导入一次

### 2. 子应用移除样式导入
已从以下位置移除重复的 Element Plus 样式导入：
- ✅ `apps/system-app/src/main.ts` - 已注释
- ✅ `apps/operations-app/src/main.ts` - 已移除
- ✅ 所有 `bootstrap/core/ui.ts` 文件 - 已移除

**注意**: layout-app 作为独立应用，可以保留样式导入（因为它可能独立运行）。

## 三、统一样式隔离配置 ✅

### 1. 创建统一配置模块
- **文件**: `packages/shared-core/src/configs/qiankun-sandbox-config.ts`
- **配置**:
  ```typescript
  {
    strictStyleIsolation: false,
    experimentalStyleIsolation: true, // 统一开启
    loose: false,
  }
  ```

### 2. 所有应用使用统一配置
已修改以下应用的 qiankun 配置：
- ✅ main-app (`useQiankunSetup.ts`)
- ✅ system-app (`micro/index.ts`)
- ✅ admin-app (`micro/index.ts`)
- ✅ logistics-app (`micro/index.ts`)
- ✅ quality-app (`micro/index.ts`)
- ✅ layout-app (`runtime/main.ts`)

**改造方式**：
```typescript
// 之前（手动配置，不一致）
sandbox: {
  strictStyleIsolation: false,
  experimentalStyleIsolation: false, // 不一致
  loose: false,
}

// 现在（统一配置）
const { getQiankunSandboxConfig } = await import('@btc/shared-core');
const sandboxConfig = getQiankunSandboxConfig();
sandbox: sandboxConfig,
```

## 四、完善卸载清理逻辑 ✅

### 1. 创建清理函数
- **文件**: `packages/shared-core/src/btc/utils/element-plus/cleanup.ts`
- **功能**: `cleanupElementPlus(appId?)` - 清理 Element Plus 样式资源和引擎实例

### 2. 集成到卸载流程
- **文件**: `packages/shared-core/src/composables/subapp-lifecycle/useSubAppLifecycle.ts`
- **位置**: `unmountSubApp()` 函数中
- **功能**: 
  - 清理应用特定的 `<style>` 标签
  - 清理 qiankun 注入的样式隔离标签
  - 清理应用容器内的样式标签
  - 调用全局清理函数

## 预期效果

修复后应该看到：
1. ✅ **Element Plus 实例数量**: 从多个减少到 1 个
2. ✅ **样式引擎数量**: 显著减少（因为只有一个实例）
3. ✅ **`<link>` 标签数量**: 减少（移除重复导入）
4. ✅ **`<style>` 标签数量**: 在应用卸载时被清理
5. ✅ **`StyleSheetCollection` 数量**: 减少
6. ✅ **`StylePropertyMap` 数量**: 减少

## 验证方法

### 1. 内存快照对比
1. 修复前拍摄基准快照
2. 修复后拍摄对比快照
3. 检查以下指标：
   - `StyleEngine` 数量
   - `StyleSheetCollection` 数量
   - `StylePropertyMap` 数量
   - `<link>` 标签数量
   - `<style>` 标签数量

### 2. 功能验证
- ✅ 所有应用正常启动
- ✅ Element Plus 组件正常工作
- ✅ 国际化切换正常
- ✅ 应用切换时样式正确
- ✅ 应用卸载时样式被清理

## 注意事项

1. **layout-app**: 作为独立应用，保留了 Element Plus 样式导入，这是合理的
2. **docs-app**: 文档应用可能也需要保留样式导入（如果独立运行）
3. **主应用**: 必须保留样式导入，作为全局样式入口

## 后续优化建议

如果内存问题仍然存在，可以考虑：

1. **按需导入**: 使用 `unplugin-vue-components` 实现按需导入，减少样式体积
2. **样式清理**: 使用 `purgecss` 清理未使用的样式
3. **版本锁定**: 在根目录 `package.json` 中锁定 Element Plus 版本
4. **ESLint 规则**: 禁止子应用直接导入 `element-plus` 并调用 `app.use`

## 相关文件

- Element Plus 初始化: `packages/shared-core/src/btc/utils/element-plus/index.ts`
- Element Plus 清理: `packages/shared-core/src/btc/utils/element-plus/cleanup.ts`
- 沙箱配置: `packages/shared-core/src/configs/qiankun-sandbox-config.ts`
- 卸载逻辑: `packages/shared-core/src/composables/subapp-lifecycle/useSubAppLifecycle.ts`
