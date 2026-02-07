# 当前 OOM 问题分析报告

## 内存快照数据分析

根据最新的内存快照数据，发现以下严重的内存泄漏问题：

### 1. `{enabled, labelKey}×152` - 增长 30400% ⚠️ 最严重

**问题**：有 152 个包含 `enabled` 和 `labelKey` 属性的对象累积

**可能原因**：
- 菜单项配置对象未清理
- 路由配置对象未清理
- 表格列配置对象未清理
- 表单字段配置对象未清理

**排查方法**：
1. 在 Chrome DevTools Memory Profiler 中：
   - 选择 `{enabled, labelKey}×152` 对象
   - 查看 "Retainers" 视图
   - 找出哪些对象持有这些配置对象

2. 检查代码：
   ```bash
   # 搜索 labelKey 的使用
   grep -r "labelKey" apps/*/src packages/*/src
   # 搜索 enabled 属性的使用
   grep -r "enabled.*:" apps/*/src packages/*/src
   ```

**修复建议**：
- 检查菜单注册逻辑，确保应用卸载时清理菜单配置
- 检查路由配置，确保路由对象在卸载时清理
- 检查表格组件，确保列配置在组件卸载时清理

### 2. `{n}×169` - 增长 27040% ⚠️ 严重

**问题**：有 169 个包含 `n` 属性的对象累积

**可能原因**：
- 计数器对象未清理
- 索引对象未清理
- 国际化消息对象（`n` 可能是 `name` 的缩写）

**排查方法**：
1. 在 Chrome DevTools Memory Profiler 中：
   - 选择 `{n}×169` 对象
   - 查看对象详情，确认 `n` 属性的值
   - 查看 "Retainers" 视图，找出引用链

**修复建议**：
- 根据 `n` 属性的实际值确定对象类型
- 在应用卸载时清理这些对象

### 3. `V8EventListener×45` - 增长 18000% ⚠️ 严重

**问题**：有 45 个事件监听器未清理

**可能原因**：
- 组件中的事件监听器在卸载时未移除
- 全局事件监听器未清理
- 第三方库添加的监听器未清理

**已修复**：
- ✅ 已添加应用卸载时的监听器清理
- ✅ 已修复部分组件的监听器清理

**需要进一步检查**：
- 检查所有组件的 `onUnmounted` 钩子
- 检查全局事件监听器的清理
- 检查第三方库（如 Element Plus、ECharts）的监听器

### 4. `Dep×18` - 增长 8640% ⚠️

**问题**：Vue 的依赖追踪对象累积

**可能原因**：
- Vue 组件的响应式依赖未清理
- 全局状态管理器的依赖未清理
- watch 监听器未停止

**修复建议**：
- 确保所有 `watch` 在组件卸载时调用停止函数
- 确保全局状态监听器在应用卸载时清理
- 检查是否有循环引用导致无法 GC

### 5. `Promise×19` - 增长 7240% ⚠️

**问题**：有 19 个 Promise 对象未清理

**可能原因**：
- 异步操作（API 请求、路由导航）的 Promise 未取消
- `setTimeout`/`setInterval` 创建的 Promise 未清理
- 动态导入的 Promise 未清理

**已修复**：
- ✅ 已添加 Promise 取消机制
- ✅ 在应用卸载时取消所有 pending Promise

**需要进一步检查**：
- 检查 API 请求的取消机制
- 检查路由导航的 Promise 清理
- 检查动态导入的清理

### 6. `{url, resolve, hot, env}×11` - 增长 29920% ⚠️ 严重

**问题**：有 11 个包含 `url`、`resolve`、`hot`、`env` 属性的对象累积

**可能原因**：
- Vite 的模块加载对象未清理
- HMR (Hot Module Replacement) 相关对象未清理
- 动态导入的模块对象未清理

**排查方法**：
1. 在 Chrome DevTools Memory Profiler 中：
   - 选择 `{url, resolve, hot, env}×11` 对象
   - 查看对象详情，确认这些属性的值
   - 查看 "Retainers" 视图

**修复建议**：
- 检查 Vite 的模块缓存清理
- 检查 HMR 相关资源的清理
- 检查动态导入的模块引用清理

## 立即行动项

### 优先级 1：立即修复

1. **清理菜单/路由配置对象** (`{enabled, labelKey}×152`)
   - 检查 `registerMainAppMenus` 函数
   - 检查路由注册逻辑
   - 在应用卸载时清理所有配置对象

2. **清理 Vite 模块对象** (`{url, resolve, hot, env}×11`)
   - 检查动态导入的清理
   - 检查模块缓存的清理

### 优先级 2：进一步调查

1. **确定 `{n}×169` 对象的类型**
   - 在内存快照中查看对象详情
   - 根据 `n` 属性的值确定对象类型
   - 添加相应的清理逻辑

2. **检查所有组件的监听器清理**
   - 审查所有组件的 `onUnmounted` 钩子
   - 确保所有事件监听器都被清理

### 优先级 3：长期优化

1. **Element Plus 样式引擎清理**
   - 实施样式表清理逻辑
   - 考虑共享 Element Plus 实例

2. **Vue 依赖追踪优化**
   - 检查循环引用
   - 优化全局状态管理

## 修复代码示例

### 清理菜单配置对象

```typescript
// 在 unmountSubApp 中添加
export async function unmountSubApp(
  context: SubAppContext,
  props: QiankunProps = {}
): Promise<void> {
  // ... 现有清理逻辑 ...

  // 清理菜单配置对象
  try {
    const { cleanupMenuConfigs } = await import('./useMenuCleanup');
    cleanupMenuConfigs(context.appId);
  } catch (error) {
    // 静默失败
  }

  // 清理路由配置对象
  try {
    const router = context.app?.config?.globalProperties?.$router;
    if (router) {
      // 清理路由配置
      router.getRoutes().forEach(route => {
        // 清理路由元数据中的配置对象
        if (route.meta?.config) {
          delete route.meta.config;
        }
      });
    }
  } catch (error) {
    // 静默失败
  }
}
```

### 清理 Vite 模块对象

```typescript
// 在应用卸载时清理模块缓存
export async function cleanupModuleCache(appId: string) {
  if (typeof window === 'undefined') return;
  
  // 清理 Vite 的模块缓存（如果可访问）
  if ((window as any).__VITE_MODULE_CACHE__) {
    const cache = (window as any).__VITE_MODULE_CACHE__;
    // 清理应用相关的模块
    for (const [key, value] of Object.entries(cache)) {
      if (key.includes(appId)) {
        delete cache[key];
      }
    }
  }
  
  // 清理动态导入的模块引用
  if ((window as any).__DYNAMIC_IMPORTS__) {
    const imports = (window as any).__DYNAMIC_IMPORTS__;
    imports.forEach((module: any) => {
      if (module.appId === appId) {
        // 清理模块引用
        module.cleanup?.();
      }
    });
  }
}
```

## 监控指标

修复后需要监控：
1. `{enabled, labelKey}` 对象数量
2. `{n}` 对象数量
3. `V8EventListener` 数量
4. `Dep` 数量
5. `Promise` 数量
6. `{url, resolve, hot, env}` 对象数量

## 已实施的修复

### ✅ 菜单和路由配置清理（已修复）

已在 `unmountSubApp` 函数中添加了菜单和路由配置的清理逻辑：

```typescript
// 清理菜单注册表（避免菜单配置对象累积）
try {
  if (typeof window !== 'undefined' && (window as any).__BTC_MENU_REGISTRY__) {
    const menuRegistry = (window as any).__BTC_MENU_REGISTRY__;
    if (menuRegistry && menuRegistry.value && context.appId) {
      // 清理当前应用的菜单配置
      const appId = context.appId;
      if (menuRegistry.value[appId]) {
        menuRegistry.value[appId] = [];
      }
    }
  }
} catch (error) {
  // 静默失败
}

// 清理路由配置对象（避免路由元数据中的配置对象累积）
try {
  if (context.router) {
    const routes = context.router.getRoutes();
    routes.forEach(route => {
      // 清理路由元数据中的配置对象
      if (route.meta) {
        // 清理可能包含 enabled 和 labelKey 的配置对象
        if (route.meta.config) {
          delete route.meta.config;
        }
        // 清理菜单相关配置
        if (route.meta.menuConfig) {
          delete route.meta.menuConfig;
        }
      }
    });
  }
} catch (error) {
  // 静默失败
}
```

**预期效果**：
- `{enabled, labelKey}×152` 对象数量应该减少
- 菜单配置对象在应用卸载时被清理

## 下一步

1. ✅ **菜单/路由配置清理** - 已实施
2. ⏳ **实施 Vite 模块对象清理** - 需要进一步调查
3. ⏳ **在内存快照中确认 `{n}` 对象的类型** - 需要查看内存快照详情
4. ⏳ **全面审查组件的事件监听器清理** - 需要逐个检查组件
5. ⏳ **定期拍摄内存快照，监控修复效果** - 需要持续监控
