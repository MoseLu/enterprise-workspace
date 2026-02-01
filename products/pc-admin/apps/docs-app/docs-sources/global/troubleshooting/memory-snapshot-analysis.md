# 内存快照分析指南

## 如何分析内存快照数据

当你看到类似这样的内存快照统计时：

```
wPromise×4        1920 %    9360 %
StyleEngine       7600 %    8880 %
Intl.Collator×4   1120 %    9120 %
V8EventListener×11 4400 %    4400 %
```

### 关键指标说明

1. **对象名称**：表示对象类型
2. **×N**：表示有 N 个实例
3. **第一个百分比**：相对于基准快照的增长百分比
4. **第二个百分比**：总增长百分比

### 判断标准

- **增长百分比 > 1000%**：严重可疑，很可能存在内存泄漏
- **×4 或更多**：说明有多个实例累积，需要检查是否有清理机制
- **持续增长**：如果多次快照对比，对象数量持续增长，肯定存在泄漏

## 当前发现的问题

### 1. wPromise×4 (1920% 增长) - 最严重

**问题**：有 4 个 Promise 对象累积，增长 1920%

**可能原因**：
- `waitForContainer` 函数创建的 Promise 在应用卸载时未取消
- 异步操作（如路由导航、API 请求）的 Promise 未完成
- `setTimeout`/`setInterval` 创建的 Promise 未清理

**修复**：
- ✅ 已添加 Promise 取消机制到 `waitForContainer`
- ✅ 在应用卸载时取消所有 pending Promise

### 2. StyleEngine (7600% 增长) - 最严重

**问题**：样式引擎增长 7600%，可能是 Element Plus 的样式引擎

**可能原因**：
- Element Plus 在每个应用中创建了样式引擎实例
- 样式引擎在应用卸载时未清理
- 样式隔离导致每个应用都创建独立的样式引擎

**排查方法**：
1. 在 Chrome DevTools Memory Profiler 中：
   - 选择 "StyleEngine" 对象
   - 切换到 "Retainers" 视图
   - 查看引用链，找出谁在引用它
   - 重点关注：全局变量、Vue 应用实例、Element Plus 插件

2. 检查代码：
   ```bash
   # 搜索 Element Plus 的安装位置
   grep -r "ElementPlus" apps/*/src
   grep -r "element-plus" apps/*/src
   ```

**修复建议**：
- Element Plus 的样式引擎通常是全局的，不应该每个应用都创建
- 检查是否有重复安装 Element Plus 插件
- 考虑使用共享的样式引擎（如果可能）

### 3. Intl.Collator×4 (1120% 增长)

**问题**：有 4 个国际化排序对象，每个应用都创建了

**可能原因**：
- vue-i18n 在创建 i18n 实例时创建了 Intl 对象
- `createTSync` 中创建的 i18n 实例未清理
- 国际化消息缓存未清理

**修复**：
- ✅ 已添加 i18n 实例清理逻辑
- ✅ 清理国际化消息缓存

### 4. V8EventListener×11 (4400% 增长)

**问题**：有 11 个事件监听器未清理

**可能原因**：
- 全局事件监听器未移除
- 组件中的事件监听器在卸载时未清理
- 第三方库添加的监听器未清理

**排查方法**：
1. 在 Chrome DevTools Memory Profiler 中：
   - 选择 "V8EventListener" 对象
   - 查看 "Retainers" 视图
   - 找出哪些对象持有这些监听器

2. 检查代码：
   ```bash
   # 搜索未清理的事件监听器
   grep -r "addEventListener" apps/*/src | grep -v "removeEventListener"
   ```

**修复**：
- ✅ 已修复 admin-app 的全局错误监听器
- ✅ 已添加应用卸载时的监听器清理
- 需要检查组件中的监听器清理

## 分析步骤

### 步骤 1：拍摄基准快照

1. 打开 Chrome DevTools
2. 切换到 "Memory" 标签
3. 选择 "Heap snapshot"
4. 点击 "Take snapshot"
5. 等待快照完成

### 步骤 2：执行操作

1. 打开管理应用
2. 切换几个路由
3. 打开其他应用
4. 重复几次操作

### 步骤 3：拍摄对比快照

1. 再次点击 "Take snapshot"
2. 选择 "Comparison" 视图
3. 对比两个快照

### 步骤 4：分析可疑对象

1. 按 "Size Delta" 排序，找出增长最多的对象
2. 点击可疑对象，查看详情
3. 切换到 "Retainers" 视图，查看引用链
4. 找出阻止 GC 回收的原因

### 步骤 5：修复问题

根据引用链，修复代码：
- 如果是全局变量引用，在卸载时清理
- 如果是事件监听器，在卸载时移除
- 如果是定时器，在卸载时清除
- 如果是 Promise，在卸载时取消

## 常见内存泄漏模式

### 模式 1：全局变量累积

```javascript
// 错误
window.cache = window.cache || [];
window.cache.push(data); // 无限累积

// 正确
window.cache = window.cache || [];
window.cache.push(data);
if (window.cache.length > 100) {
  window.cache.shift(); // 限制大小
}
```

### 模式 2：闭包持有大量数据

```javascript
// 错误
function createHandler() {
  const largeData = new Array(1000000).fill(0);
  return () => console.log('handler');
}

// 正确
function createHandler() {
  return () => console.log('handler');
}
```

### 模式 3：Promise 未取消

```javascript
// 错误
const promise = new Promise(resolve => {
  setTimeout(resolve, 10000);
});

// 正确
let cancelTimer;
const promise = new Promise(resolve => {
  cancelTimer = setTimeout(resolve, 10000);
});
promise.cancel = () => clearTimeout(cancelTimer);
```

## 下一步行动

1. **立即修复**：
   - ✅ Promise 取消机制
   - ✅ i18n 实例清理
   - ✅ 事件监听器清理

2. **需要进一步调查**：
   - StyleEngine 泄漏（可能是 Element Plus 的问题）
   - 检查组件中的事件监听器清理
   - 检查第三方库的内存泄漏

3. **监控**：
   - 定期拍摄内存快照
   - 对比快照，找出新的泄漏点
   - 使用 Chrome DevTools Performance 监控内存趋势
