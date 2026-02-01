# 严重 OOM 问题分析报告

## 内存快照数据分析

根据最新的内存快照，发现了**极其严重**的内存泄漏问题：

### 🔴 最严重的问题

#### 1. `(compiled code)×10073` - 增长 **56,173,612%** ⚠️⚠️⚠️

**问题**：有 10,073 个编译后的代码块累积，增长超过 5600 万倍！

**可能原因**：
- **动态导入的模块未清理**：每次应用加载时动态导入的模块代码都保留在内存中
- **Vite HMR 模块累积**：开发环境下的热更新模块未清理
- **代码分割的 chunk 未清理**：路由懒加载的代码块在应用卸载后未清理
- **第三方库的代码块累积**：Element Plus、ECharts 等库的代码块未清理

**影响**：
- 这是导致 OOM 的主要原因
- 每个应用加载都会累积大量编译后的代码
- 应用卸载后代码块仍然保留在内存中

**修复建议**：
1. 清理动态导入的模块缓存
2. 清理 Vite 的模块映射（ModuleMap）
3. 清理代码分割的 chunk 引用
4. 检查是否有循环引用阻止代码块被 GC

#### 2. `(string)×6878` - 增长 **278,095,659%** ⚠️⚠️⚠️

**问题**：有 6,878 个字符串对象累积，增长超过 2.7 亿倍！

**可能原因**：
- **国际化消息字符串未清理**：i18n 消息在应用卸载后未清理
- **路由配置字符串累积**：路由路径、名称等字符串未清理
- **菜单配置字符串累积**：菜单标题、labelKey 等字符串未清理
- **错误消息字符串累积**：错误监控收集的错误消息未清理
- **日志字符串累积**：开发环境的日志字符串未清理

**修复建议**：
1. 清理 i18n 消息缓存
2. 清理路由配置字符串
3. 清理菜单配置字符串
4. 清理错误监控的字符串缓存
5. 限制日志字符串的数量

#### 3. `Function×5662` - 增长 **1,787,524%** ⚠️⚠️

**问题**：有 5,662 个函数对象累积，增长超过 178 万倍！

**可能原因**：
- **事件处理器函数未清理**：组件卸载时事件处理器函数未移除
- **闭包函数累积**：闭包持有大量数据，导致函数无法被 GC
- **Vue 响应式函数累积**：watch、computed 等响应式函数未清理
- **Promise 回调函数累积**：异步操作的回调函数未清理

**修复建议**：
1. 确保所有事件监听器在组件卸载时移除
2. 确保所有 watch 在组件卸载时停止
3. 清理闭包中的大对象引用
4. 取消未完成的 Promise

#### 4. `(object shape)×4133` - 增长 **2,693,806%** ⚠️⚠️

**问题**：有 4,133 个对象形状累积，增长超过 269 万倍！

**可能原因**：
- **对象结构定义累积**：每个应用创建的对象结构定义未清理
- **Vue 组件定义累积**：组件定义对象未清理
- **配置对象结构累积**：各种配置对象的结构定义未清理

**修复建议**：
1. 清理组件定义缓存
2. 清理配置对象结构定义
3. 检查是否有对象结构定义的循环引用

#### 5. `ModuleMap::Entry×263` - 增长 **168,320%** ⚠️

**问题**：有 263 个模块映射条目累积，增长超过 16 万倍！

**可能原因**：
- **Vite 模块映射未清理**：动态导入的模块映射在应用卸载后未清理
- **代码分割的模块映射未清理**：路由懒加载的模块映射未清理

**修复建议**：
1. 清理 Vite 的模块映射缓存
2. 清理动态导入的模块映射
3. 检查 `import.meta.hot` 相关的模块映射

### 🟡 次要问题

#### 6. `(array)×246` - 增长 **2,051,724%**

**问题**：数组对象累积

**可能原因**：
- 菜单数组、路由数组等未清理
- 配置数组未清理

#### 7. `Window×20` - 增长 **1,091,922%**

**问题**：Window 对象累积

**可能原因**：
- 可能是 iframe 或新窗口未关闭
- 全局变量引用 Window 对象

#### 8. `(system)×5875` - 增长 **3,130,087%**

**问题**：系统对象累积

**可能原因**：
- 浏览器内部对象
- 可能是其他对象累积的副作用

## 根本原因分析

### 1. 动态导入模块未清理 ⚠️⚠️⚠️

**问题**：应用卸载时，动态导入的模块代码块和映射未清理

**位置**：
- `import()` 动态导入
- 路由懒加载
- 组件异步加载

**修复**：
```typescript
// 在 unmountSubApp 中添加
export async function unmountSubApp(
  context: SubAppContext,
  props: QiankunProps = {}
): Promise<void> {
  // ... 现有清理逻辑 ...

  // 清理动态导入的模块缓存
  try {
    // 清理 Vite 的模块映射
    if (typeof import.meta !== 'undefined' && (import.meta as any).hot) {
      // 清理 HMR 相关的模块映射
      const hot = (import.meta as any).hot;
      if (hot && typeof hot.dispose === 'function') {
        hot.dispose(() => {
          // 清理模块相关的资源
        });
      }
    }

    // 清理全局模块缓存（如果存在）
    if (typeof window !== 'undefined') {
      // 清理 Vite 的模块缓存
      const viteCache = (window as any).__VITE_MODULE_CACHE__;
      if (viteCache && typeof viteCache.clear === 'function') {
        viteCache.clear();
      }

      // 清理动态导入的模块引用
      const dynamicImports = (window as any).__DYNAMIC_IMPORTS__;
      if (dynamicImports && Array.isArray(dynamicImports)) {
        dynamicImports.length = 0;
      }
    }
  } catch (error) {
    // 静默失败
  }
}
```

### 2. 国际化消息字符串未清理 ⚠️⚠️

**问题**：i18n 消息在应用卸载后未清理

**修复**：
```typescript
// 在 unmountSubApp 中增强 i18n 清理
try {
  if (context.i18n && context.i18n.i18n && context.i18n.i18n.global) {
    const i18nGlobal = context.i18n.i18n.global as any;
    
    // 清理所有语言的消息（包括字符串）
    if (i18nGlobal.messages) {
      // 深度清理消息对象，释放字符串引用
      Object.keys(i18nGlobal.messages).forEach(locale => {
        if (i18nGlobal.messages[locale]) {
          // 递归清理消息对象
          const clearMessages = (obj: any) => {
            if (typeof obj === 'object' && obj !== null) {
              Object.keys(obj).forEach(key => {
                delete obj[key];
              });
            }
          };
          clearMessages(i18nGlobal.messages[locale]);
          delete i18nGlobal.messages[locale];
        }
      });
      i18nGlobal.messages = {};
    }

    // 清理日期格式化器缓存（可能包含字符串）
    if (i18nGlobal.__datetimeFormatters) {
      i18nGlobal.__datetimeFormatters.clear?.();
    }
    if (i18nGlobal.__numberFormatters) {
      i18nGlobal.__numberFormatters.clear?.();
    }
  }
} catch (error) {
  // 静默失败
}
```

### 3. 路由配置字符串未清理 ⚠️

**问题**：路由配置中的字符串（路径、名称等）未清理

**修复**：
```typescript
// 在 unmountSubApp 中增强路由清理
try {
  if (context.router) {
    const routes = context.router.getRoutes();
    routes.forEach(route => {
      // 清理路由路径字符串
      if (route.path) {
        // 路径字符串会被 GC，但我们可以清理路由对象
      }
      
      // 清理路由名称字符串
      if (route.name) {
        // 名称字符串会被 GC
      }
      
      // 清理路由元数据中的所有字符串
      if (route.meta) {
        Object.keys(route.meta).forEach(key => {
          if (typeof route.meta![key] === 'string') {
            delete route.meta![key];
          }
        });
      }
    });
  }
} catch (error) {
  // 静默失败
}
```

## 立即行动项

### 优先级 1：立即修复（最严重）

1. **清理动态导入的模块代码块** ⚠️⚠️⚠️
   - 清理 Vite 模块映射
   - 清理代码分割的 chunk 引用
   - 清理 HMR 模块映射

2. **清理国际化消息字符串** ⚠️⚠️
   - 深度清理 i18n 消息对象
   - 清理格式化器缓存

3. **清理函数对象** ⚠️
   - 确保所有事件监听器移除
   - 确保所有 watch 停止
   - 清理闭包引用

### 优先级 2：进一步调查

1. **确认对象形状累积的原因**
   - 检查组件定义缓存
   - 检查配置对象结构定义

2. **检查系统对象累积**
   - 可能是其他对象累积的副作用
   - 修复其他问题后可能自动解决

## 监控指标

修复后需要监控：
1. `(compiled code)` 对象数量 - **最关键**
2. `(string)` 对象数量 - **最关键**
3. `Function` 对象数量
4. `(object shape)` 对象数量
5. `ModuleMap::Entry` 对象数量
6. `(array)` 对象数量

## 预期效果

实施修复后：
- `(compiled code)` 数量应该大幅减少
- `(string)` 数量应该大幅减少
- `Function` 数量应该减少
- 内存使用应该稳定
- OOM 问题应该得到缓解

## 注意事项

1. **编译后的代码块清理**：
   - Vite 的模块缓存可能无法直接清理
   - 需要检查是否有循环引用阻止 GC
   - 可能需要强制触发 GC（`window.gc()` 在 Chrome DevTools 中可用）

2. **字符串清理**：
   - JavaScript 的字符串是不可变的
   - 删除引用后，字符串会被 GC 自动回收
   - 关键是删除所有对字符串的引用

3. **函数清理**：
   - 函数对象本身很小，但闭包可能持有大量数据
   - 关键是清理闭包中的大对象引用

## 测试方法

1. **拍摄基准快照**：在应用启动后立即拍摄
2. **执行操作**：切换应用、路由等操作
3. **拍摄对比快照**：操作后拍摄
4. **对比数据**：查看 `(compiled code)` 和 `(string)` 的数量变化
5. **强制 GC**：在 Chrome DevTools 中执行 `window.gc()`，再次拍摄快照
6. **验证修复**：确认对象数量减少
