# 国际化体系加载顺序分析

## 当前加载顺序

### 1. 主应用（main-app）初始化阶段

#### 1.1 主应用 i18n 初始化
**文件**: `apps/main-app/src/i18n/index.ts`

```typescript
// 初始化顺序：
export const i18n = createAppI18n(defaultLocale, {
  'zh-CN': { 
    ...(sharedLocalesZhCN as Record<string, any>),  // 来自 shared-components
    ...transformedOverviewZhCN                      // overview 模块词条
  },
  'en-US': { 
    ...(sharedLocalesEnUS as Record<string, any>),  // 来自 shared-components
    ...transformedOverviewEnUS                      // overview 模块词条
  },
});
```

**实际合并顺序**（在 `createAppI18n` 内部）：
1. `globalMessages`（来自 `packages/shared-components/src/i18n/locales/index.ts`）
2. `sharedLocalesZhCN` / `sharedLocalesEnUS`（来自 `packages/shared-components/src/locales/*.json`）
3. `overview` 模块的语言包

**注意**：`createAppI18n` 函数内部会先合并 `globalMessages`，然后再合并传入的 `appMessages`。

### 2. 子应用语言包动态加载阶段

#### 2.1 主应用在子应用 beforeMount 时加载
**文件**: `apps/main-app/src/micro/composables/useQiankunLifecycle.ts`

```typescript
// 在子应用 beforeMount 阶段
await loadAndMergeSubAppI18n(i18n, _app.name);
```

**加载方式**：
- **开发环境**：通过 `fetch` 从子应用的开发服务器加载（如 `http://localhost:8082/src/locales/zh-CN.json`）
- **生产环境**：通过 `fetch` 从 CDN 加载

**支持多文件合并**：
- manifest 中的 `locales` 配置支持字符串（单个文件）或数组（多个文件）
- 多个文件会并行加载，然后使用 `deepMerge` 合并（后面的文件会覆盖前面的同名键）
- 示例配置：
```json
{
  "locales": {
    "zh-CN": [
      "src/locales/zh-CN.json",
      "src/modules/base/locales/zh-CN.json"
    ],
    "en-US": [
      "src/locales/en-US.json",
      "src/modules/base/locales/en-US.json"
    ]
  }
}
```

**合并方式**：使用 `deepMerge` 将子应用语言包合并到主应用的 i18n 实例中。

### 3. 子应用初始化阶段（微前端模式）

#### 3.1 子应用复用基座 i18n 实例
**文件**: `apps/system-app/src/i18n/index.ts`、`apps/admin-app/src/i18n/index.ts` 等

```typescript
// 微前端模式：复用基座 i18n，扩展业务词条
if (props?.i18n && qiankunWindow.__POWERED_BY_QIANKUN__) {
  const { i18n, locale, globalState } = props;
  
  // 合并全局+业务词条（包括 shared-components 的语言包）
  i18n.global.setLocaleMessage('zh-CN', {
    ...i18n.global.getLocaleMessage('zh-CN'),  // 基座已有的消息（已包含 shared-components）
    ...(sharedLocalesZhCN as Record<string, any>),  // ⚠️ 再次合并 shared-components（冗余）
    ...systemMessages['zh-CN'],                      // 子应用自己的语言包
  });
}
```

## 问题分析

### 问题 1：子应用语言包是否需要加入到共享语言包？

**答案：不需要，也不应该。**

**原因**：
1. **子应用语言包是独立的**：每个子应用有自己的语言包文件（如 `apps/system-app/src/locales/*.json`）
2. **动态加载机制**：主应用在子应用 `beforeMount` 时通过 `loadAndMergeSubAppI18n` 动态加载并合并
3. **按需加载**：只有当前激活的子应用的语言包会被加载，避免不必要的资源浪费

**如果加入到共享语言包的问题**：
- 所有子应用的语言包都会被打包到主应用，增加主应用体积
- 无法按需加载，即使不使用某个子应用也会加载其语言包
- 违背了微前端的按需加载原则

### 问题 2：子应用在微前端模式下重复合并 shared-components 语言包

**当前问题**：
在子应用的 `initXXXI18n` 函数中，会再次合并 `sharedLocalesZhCN` 和 `sharedLocalesEnUS`，但实际上：
- 基座的 i18n 实例已经包含了 `shared-components` 的语言包
- 主应用在 `beforeMount` 时已经将子应用的语言包合并到基座 i18n 实例
- 子应用再次合并 `shared-components` 是冗余的

**建议优化**：
子应用在微前端模式下，只需要合并自己的业务词条，不需要再次合并 `shared-components`：

```typescript
// 优化后的代码
i18n.global.setLocaleMessage('zh-CN', {
  ...i18n.global.getLocaleMessage('zh-CN'),  // 基座已有的消息（已包含所有共享语言包）
  ...systemMessages['zh-CN'],                // 只需要合并子应用自己的语言包
});
```

## 完整的加载顺序总结

### 主应用启动时：
1. ✅ `globalMessages`（来自 `shared-components/src/i18n/locales`）
2. ✅ `sharedLocalesZhCN/EnUS`（来自 `shared-components/src/locales/*.json`）
3. ✅ `overview` 模块的语言包

### 子应用 beforeMount 时：
4. ✅ 主应用通过 `loadAndMergeSubAppI18n` 动态加载子应用语言包并合并到基座 i18n

### 子应用初始化时（微前端模式）：
5. ⚠️ 子应用再次合并 `sharedLocalesZhCN/EnUS`（**冗余，可以移除**）
6. ✅ 子应用合并自己的业务词条（`systemMessages`、`adminMessages` 等）

## 实际问题分析

### 问题 1：`common.index` 和 `common.button.detail` 无法翻译

**原因**：
- 这些词条在管理应用的语言包中（`apps/admin-app/src/locales/zh-CN.json`）
- 主应用在 `beforeMount` 时通过 `loadAndMergeSubAppI18n` 加载子应用语言包
- 但是子应用在初始化时（`initAdminI18n`）也会合并自己的语言包到基座 i18n
- **关键问题**：子应用初始化是在 `mount` 阶段，而菜单注册和组件渲染可能在 `beforeMount` 或更早阶段
- 如果子应用语言包加载失败或时序不对，这些词条就无法翻译

**解决方案**：
1. **临时方案**：将这些通用词条加入到共享语言包（`shared-components/src/locales/*.json`）
2. **根本方案**：确保子应用语言包在主应用 `beforeMount` 时正确加载并合并，并且子应用初始化时不再重复合并

### 问题 2：菜单显示 key 而不是翻译文本

**原因**：
- 菜单是在主应用中渲染的（`menu-renderer`），使用的是主应用的 i18n 实例
- 菜单注册在 `beforeMount` 时进行，此时子应用语言包应该已经加载
- 但是菜单注册时使用的 `tSync` 来自主应用的 `getters.ts`，它优先使用 `window.__MAIN_APP_I18N__`
- **关键问题**：
  1. 菜单注册时，子应用语言包可能还没有加载完成（异步加载）
  2. 菜单的 `labelKey`（如 `menu.platform`、`menu.org`）在子应用的语言包中
  3. 如果子应用语言包没有正确合并到主应用 i18n 实例，菜单就会显示 key

**解决方案**：
1. **确保语言包加载完成**：在菜单注册前，确保子应用语言包已经加载并合并
2. **使用响应式翻译**：菜单注册时如果翻译失败，保存原始的 key，在渲染时通过 `labelKey` 进行响应式翻译（已实现）
3. **检查语言包合并**：确保 `loadAndMergeSubAppI18n` 正确合并了子应用的语言包

## 建议

1. **移除子应用中的冗余合并**：子应用在微前端模式下不需要再次合并 `shared-components` 的语言包
2. **保持子应用语言包独立**：不要将子应用的语言包加入到共享语言包中（除非是真正通用的词条）
3. **优化加载顺序**：确保子应用语言包在子应用初始化前完成加载（当前已在 `beforeMount` 阶段完成）
4. **修复语言包加载**：检查 `loadAndMergeSubAppI18n` 是否正确加载和合并了子应用的语言包
5. **统一使用主应用 i18n**：确保菜单注册和渲染都使用主应用的 i18n 实例，并且子应用语言包已正确合并
