# Element Plus 样式引擎内存泄漏分析报告

## 问题发现

根据内存快照数据，发现了以下可疑对象：
- `StylePropertyMap×7`: 2800% 增长
- `StyleSheetCollection×2`: 2560% 增长
- `<link>×6`: 2160% 增长
- `<style>`: 1520% 增长
- `DOMTimer`: 1920% 增长

这些都与样式引擎相关，说明存在样式资源未清理的问题。

## 根本原因分析

### 1. Element Plus 重复安装 ⚠️

**问题**：每个应用都在 `setupElementPlus` 中调用 `app.use(ElementPlus)`，导致每个应用都创建独立的 Element Plus 实例。

**位置**：
- `apps/main-app/src/bootstrap/core/ui.ts:54`
- `apps/system-app/src/bootstrap/core/ui.ts:55`
- `apps/admin-app/src/bootstrap/core/ui.ts:55`
- 其他所有子应用

**代码**：
```typescript
export const setupElementPlus = (app: App) => {
  const currentLocale = getCurrentLocale();
  const locale = elementLocale[currentLocale as keyof typeof elementLocale] || zhCn;
  app.use(ElementPlus, { locale } as any); // ⚠️ 每个应用都创建新实例
};
```

**影响**：
- Element Plus 内部会创建样式引擎实例
- 每个应用都有独立的样式引擎
- 应用卸载时样式引擎未清理

### 2. 样式文件重复导入 ⚠️

**问题**：Element Plus 样式在多个地方重复导入。

**位置**：
1. `main.ts` 中导入：
   ```typescript
   import 'element-plus/dist/index.css';
   import 'element-plus/theme-chalk/dark/css-vars.css';
   ```

2. `bootstrap/core/ui.ts` 中又导入：
   ```typescript
   import 'element-plus/dist/index.css';
   import 'element-plus/theme-chalk/dark/css-vars.css';
   ```

**影响**：
- 样式表被重复加载
- 浏览器创建多个 `<link>` 标签
- 每个样式表都有独立的样式引擎实例

### 3. 样式隔离配置不一致 ⚠️

**问题**：不同应用的样式隔离配置不一致。

**配置对比**：

| 应用 | strictStyleIsolation | experimentalStyleIsolation |
|------|---------------------|---------------------------|
| main-app | false | **true** |
| system-app | false | **true** |
| admin-app | false | **false** |
| logistics-app | false | **false** |
| quality-app | false | **false** |

**影响**：
- `experimentalStyleIsolation: true` 会为每个应用创建独立的样式作用域
- 每个作用域都有独立的样式引擎
- 应用卸载时样式作用域未清理

### 4. 样式表未清理 ⚠️

**问题**：应用卸载时没有清理 Element Plus 的样式表。

**缺失的清理逻辑**：
- 没有移除 `<link>` 标签
- 没有移除 `<style>` 标签
- 没有清理 `document.styleSheets`
- 没有清理样式引擎实例

## 修复方案

### 方案 1：共享 Element Plus 实例（推荐）

**思路**：在主应用中创建 Element Plus 实例，子应用复用。

**实现**：
1. 在主应用中创建全局 Element Plus 实例
2. 子应用不安装 Element Plus，直接使用主应用的实例
3. 通过全局变量共享实例

**优点**：
- 只有一个样式引擎实例
- 减少内存占用
- 样式统一管理

**缺点**：
- 需要修改所有应用的安装逻辑
- 可能影响样式隔离

### 方案 2：清理样式表（立即实施）

**思路**：在应用卸载时清理所有样式相关资源。

**实现**：
1. 清理 Element Plus 相关的 `<link>` 标签
2. 清理应用特定的 `<style>` 标签
3. 清理样式引擎引用

**优点**：
- 立即生效
- 不影响现有架构
- 风险低

**缺点**：
- 不能完全解决样式引擎累积问题
- 需要仔细识别哪些样式可以清理

### 方案 3：统一样式隔离配置

**思路**：所有应用使用相同的样式隔离配置。

**实现**：
1. 统一设置为 `experimentalStyleIsolation: false`
2. 或统一设置为 `experimentalStyleIsolation: true` 并实现清理逻辑

**优点**：
- 行为一致
- 便于调试

**缺点**：
- 可能影响样式隔离效果
- 需要测试所有应用

## 推荐修复步骤

### 第一步：立即修复样式清理（方案 2）

在 `unmountSubApp` 中添加样式清理逻辑：

```typescript
// 清理 Element Plus 样式表
const cleanupElementPlusStyles = () => {
  if (typeof document === 'undefined') return;
  
  // 清理 <link> 标签（Element Plus 样式）
  const elementPlusLinks = document.querySelectorAll(
    'link[href*="element-plus"], link[href*="theme-chalk"]'
  );
  elementPlusLinks.forEach(link => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  });
  
  // 清理应用特定的 <style> 标签
  const appStyles = document.querySelectorAll(
    `style[data-app="${appId}"]`
  );
  appStyles.forEach(style => {
    if (style.parentNode) {
      style.parentNode.removeChild(style);
    }
  });
};
```

### 第二步：移除重复的样式导入

**修改**：只在 `main.ts` 中导入样式，移除 `bootstrap/core/ui.ts` 中的重复导入。

### 第三步：考虑共享 Element Plus 实例（长期优化）

如果内存问题仍然存在，考虑实施方案 1。

## 预期效果

实施修复后：
- `<link>` 标签数量减少
- `StyleSheetCollection` 数量减少
- `StylePropertyMap` 数量减少
- 内存使用稳定

## 监控指标

修复后需要监控：
1. `<link>` 标签数量
2. `StyleSheetCollection` 数量
3. `StylePropertyMap` 数量
4. `StyleEngine` 数量（如果可观测）
