# design-tokens 包内存分析报告

## 检查结果：✅ 无内存泄漏风险

经过全面检查，`@btc/design-tokens` 包**不会导致 OOM 问题**。

## 包结构分析

### 1. 包内容
- **JSON 配置文件**：`tokens/` 目录下的设计令牌定义
- **编译输出**：`dist/` 目录下的 CSS、SCSS、TS 文件
- **入口文件**：`src/index.ts` 只导出路径和类型定义

### 2. 使用方式
```scss
// packages/shared-components/src/styles/_tokens.scss
@use '@btc/design-tokens/scss' as *;
```

这是**编译时导入**，不是运行时导入。SCSS 编译器会在构建时处理这些导入，生成最终的 CSS 文件。

### 3. 运行时行为
- ✅ **无运行时逻辑**：包中没有 JavaScript 代码在运行时执行
- ✅ **无事件监听器**：没有 `addEventListener`、`watch` 等
- ✅ **无定时器**：没有 `setInterval`、`setTimeout`
- ✅ **无全局变量累积**：不创建或修改全局变量
- ✅ **无 Promise 累积**：没有异步操作

### 4. 开发脚本（watch.mjs）
```javascript
// packages/design-tokens/scripts/watch.mjs
const watcher = watch(tokensDir, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  ignoreInitial: true,
});

// 处理退出
process.on('SIGINT', () => {
  watcher.close(); // ✅ 正确清理
  process.exit(0);
});
```

**说明**：
- 这是**开发环境脚本**，只在运行 `pnpm dev` 时使用
- **不会在生产环境运行**
- 有正确的清理逻辑（`watcher.close()`）

## 为什么不会导致 OOM

### 1. 编译时处理
`design-tokens` 包的内容在**构建时**就被处理：
- SCSS 变量被编译成 CSS 变量
- 最终打包到静态 CSS 文件中
- 运行时只是读取 CSS 变量，不执行任何逻辑

### 2. 静态资源
- 编译后的文件是**静态的 CSS/SCSS 文件**
- 不包含可执行的 JavaScript 代码
- 不会创建对象、闭包或引用

### 3. 单次导入
- 每个应用只导入一次（通过 `_tokens.scss`）
- SCSS 的 `@use` 指令确保只导入一次
- 不会重复加载或累积

### 4. 无状态
- 包本身不维护任何状态
- 不持有任何引用
- 不创建任何对象

## 与 StyleEngine 的关系

**重要发现**：`StyleEngine` 的内存泄漏问题**不是**由 `design-tokens` 包引起的。

### StyleEngine 的真正原因
`StyleEngine` 是浏览器内部的样式引擎，用于：
- 解析 CSS 规则
- 计算样式
- 管理样式表

**可能的原因**：
1. **Element Plus 样式引擎**：每个应用都安装了 Element Plus，可能创建了独立的样式引擎实例
2. **样式隔离**：微前端框架（qiankun）的样式隔离机制可能导致每个应用都有独立的样式引擎
3. **样式表累积**：如果样式表在应用卸载时未清理，会导致样式引擎累积

### design-tokens 的影响
`design-tokens` 包只是提供了**CSS 变量定义**，这些变量：
- 在构建时被编译到 CSS 文件中
- 运行时只是被浏览器读取，不创建额外的样式引擎实例
- 不会导致样式引擎累积

## 建议

### 1. 继续使用 design-tokens
✅ **可以放心使用**，不会导致内存泄漏。

### 2. 关注 StyleEngine 问题
需要进一步调查 `StyleEngine` 的内存泄漏：
1. 检查 Element Plus 的安装方式
2. 检查样式隔离配置
3. 检查应用卸载时的样式清理

### 3. 监控内存使用
定期拍摄内存快照，关注：
- `StyleEngine` 的数量变化
- `CSSStyleSheet` 的数量
- `StyleSheetList` 的数量

## 结论

**`@btc/design-tokens` 包不会导致 OOM 问题**。

它是一个纯静态资源包，在编译时处理，运行时无任何逻辑，不会创建对象、监听器或定时器。

如果仍然遇到 OOM 问题，应该关注：
1. ✅ Promise 累积（已修复）
2. ✅ i18n 实例清理（已修复）
3. ✅ 事件监听器清理（已修复）
4. ⚠️ StyleEngine 泄漏（需要进一步调查，与 design-tokens 无关）
