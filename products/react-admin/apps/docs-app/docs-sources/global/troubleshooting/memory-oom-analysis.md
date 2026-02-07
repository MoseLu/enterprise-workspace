# Node.js OOM 内存溢出排查指南

## 概述

本文档提供完整的 Node.js OOM（内存溢出）问题排查指南，包括如何使用堆快照分析工具、识别内存泄漏对象、以及常见泄漏场景的解决方案。

## 一、自动诊断工具

项目已配置自动堆快照捕获和内存监控，OOM 发生时会自动生成堆快照文件。

### 1.1 查看内存诊断报告

```bash
# 查看内存使用情况和堆快照统计
pnpm diagnose:memory

# 详细分析堆快照
pnpm diagnose:heap
```

### 1.2 扫描代码中的潜在泄漏点

```bash
# 扫描代码库查找常见内存泄漏模式
pnpm diagnose:leak
```

## 二、堆快照分析步骤

### 2.1 打开 Chrome DevTools

1. 打开 Chrome 浏览器
2. 访问 `chrome://inspect`
3. 点击 "Open dedicated DevTools for Node"
4. 切换到 "Memory" 标签

### 2.2 导入堆快照文件

1. 点击 "Load" 按钮
2. 选择 `.heap-snapshots` 目录中的 `.heapsnapshot` 文件
3. 快照文件位置：项目根目录下的 `.heap-snapshots/` 目录

### 2.3 分析堆快照

#### Summary 视图（摘要视图）

- **用途**：快速查看各类型对象的内存占用
- **操作**：
  1. 按 "Shallow Size" 或 "Retained Size" 排序
  2. 查找占用内存最多的对象类型（如 Array、Object、String 等）
  3. 重点关注自定义业务对象的大量实例

**关键指标**：
- **Shallow Size**：对象本身占用的内存
- **Retained Size**：对象及其所有引用对象占用的总内存（更关键）

#### Comparison 视图（对比视图）

- **用途**：对比多个快照，找出持续增长的对象
- **操作**：
  1. 导入两个不同时间点的快照
  2. 切换到 "Comparison" 视图
  3. 查看 "Size Delta" 列，找出新增或增长的对象
  4. 重点关注 "New" 列中数量持续增长的对象类型

**判断标准**：
- 如果某个对象类型的数量持续增长，且 GC 后不回落，很可能存在内存泄漏

#### Retainers 视图（引用链视图）

- **用途**：查看对象的引用链，找出阻止 GC 回收的原因
- **操作**：
  1. 在 Summary 或 Comparison 视图中选中可疑对象
  2. 切换到 "Retainers" 视图
  3. 查看引用链，找出谁在引用该对象
  4. 重点关注：
     - 全局变量（global、window）
     - 未清除的定时器（Timer）
     - 未移除的事件监听器（EventEmitter）
     - 闭包引用

## 三、常见内存泄漏场景及解决方案

### 3.1 未清除的定时器

**症状**：堆快照中看到大量 `Timer` 对象

**排查**：
```javascript
// 错误示例
setInterval(() => {
  // 某些操作
}, 1000);
// 没有对应的 clearInterval

// 正确示例
const intervalId = setInterval(() => {
  // 某些操作
}, 1000);

// 在组件卸载或函数退出时清理
clearInterval(intervalId);
```

**修复建议**：
- 确保所有 `setInterval` 都有对应的 `clearInterval`
- 在 Vue 组件的 `onUnmounted` 钩子中清理定时器
- 使用 `pnpm diagnose:leak` 扫描代码查找未清理的定时器

### 3.2 未移除的事件监听器

**症状**：堆快照中看到大量 `EventEmitter` 或监听器函数

**排查**：
```javascript
// 错误示例
emitter.on('event', handler);
// 没有对应的 emitter.off('event', handler)

// 正确示例
emitter.on('event', handler);

// 在组件卸载时清理
emitter.off('event', handler);
// 或
emitter.removeAllListeners('event');
```

**修复建议**：
- 确保所有 `.on()` 都有对应的 `.off()` 或 `.removeListener()`
- 在 Vue 组件的 `onUnmounted` 钩子中移除监听器
- 使用 `pnpm diagnose:leak` 扫描代码查找未移除的监听器

### 3.3 全局变量无限累积

**症状**：堆快照中看到全局对象（global、window）持有大量数据

**排查**：
```javascript
// 错误示例
global.cache = global.cache || [];
global.cache.push(data); // 无限累积，没有清理机制

// 正确示例
global.cache = global.cache || [];
global.cache.push(data);

// 限制缓存大小
if (global.cache.length > 1000) {
  global.cache.shift(); // 删除最旧的数据
}
```

**修复建议**：
- 为全局缓存添加容量限制
- 实现 LRU（最近最少使用）缓存策略
- 定期清理过期数据

### 3.4 闭包持有大量引用

**症状**：堆快照中看到闭包函数持有大量外部对象

**排查**：
```javascript
// 错误示例
function createHandler() {
  const largeData = new Array(1000000).fill(0); // 大量数据
  return function handler() {
    // 闭包持有 largeData 的引用，即使不使用也会阻止 GC
    console.log('handler');
  };
}

// 正确示例
function createHandler() {
  return function handler() {
    // 不持有大量数据的引用
    console.log('handler');
  };
}
```

**修复建议**：
- 避免在闭包中持有大量数据的引用
- 如果必须使用，确保闭包本身能被正确释放
- 使用弱引用（WeakMap、WeakSet）如果适用

### 3.5 大批量数据处理未分片

**症状**：一次性处理大量数据导致堆内存暴涨

**排查**：
```javascript
// 错误示例
const allData = await fetchAllData(); // 一次性获取所有数据
processData(allData); // 可能导致内存暴涨

// 正确示例
async function processDataInChunks() {
  const chunkSize = 1000;
  let offset = 0;
  while (true) {
    const chunk = await fetchDataChunk(offset, chunkSize);
    if (chunk.length === 0) break;
    processData(chunk);
    offset += chunkSize;
  }
}
```

**修复建议**：
- 使用流式处理（Stream）处理大文件
- 分批处理数据库查询结果
- 使用分页加载大量数据

## 四、实时内存监控

### 4.1 查看实时内存使用

开发服务器启动时，会自动启动内存监控，每 5 秒输出一次内存使用情况：

```
[MemoryMonitor] 主进程: RSS=512.34 MB, Heap=256.78/512.00 MB, External=45.67 MB, Usage=62.5%
```

### 4.2 内存告警

- **警告阈值**：内存使用超过 80% 时发出警告
- **严重警告**：内存使用超过 90% 时发出严重警告

### 4.3 内存趋势分析

监控工具会自动检测内存趋势：
- `growing_fast`：内存快速增长（>1MB/秒）
- `growing`：内存持续增长
- `stable`：内存稳定
- `decreasing`：内存下降

如果检测到 `growing_fast` 或 `growing`，可能存在内存泄漏。

## 五、应急处理

### 5.1 临时增加内存限制

如果 OOM 频繁发生，可以临时增加内存限制：

```bash
# 在启动脚本中已配置 --max-old-space-size=4096（4GB）
# 如需更大，可以修改 scripts/bin/dev.js 中的参数
```

**注意**：这只是临时方案，不能解决根本问题。

### 5.2 减少并发数

如果同时运行多个 Vite 开发服务器导致内存不足：

```bash
# 修改 scripts/commands/dev/dev-all.mjs
# 将 --concurrency=30 降低到 --concurrency=10
```

### 5.3 清理堆快照文件

堆快照文件会自动清理（保留最近 50 个，或 7 天内的文件），也可以手动清理：

```bash
# 删除 .heap-snapshots 目录中的所有文件
rm -rf .heap-snapshots/*
```

## 六、最佳实践

1. **定期运行诊断工具**：
   ```bash
   pnpm diagnose:memory  # 查看内存使用情况
   pnpm diagnose:leak     # 扫描代码中的泄漏点
   ```

2. **代码审查时关注**：
   - 所有定时器是否有清理
   - 所有事件监听器是否有移除
   - 全局变量是否有容量限制
   - 闭包是否持有不必要的引用

3. **监控内存趋势**：
   - 关注开发过程中的内存使用趋势
   - 如果内存持续增长不回落，及时排查

4. **分析堆快照**：
   - OOM 发生后，立即分析生成的堆快照
   - 使用 Comparison 视图对比多个快照
   - 使用 Retainers 视图查找引用链

## 七、相关资源

- [Node.js 内存管理文档](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Chrome DevTools Memory Profiling](https://developer.chrome.com/docs/devtools/memory-problems/)
- [V8 堆快照格式](https://github.com/v8/v8/blob/main/src/profiler/heap-snapshot-generator.cc)

## 八、故障排查流程

1. **OOM 发生时**：
   - 检查 `.heap-snapshots/` 目录是否有新生成的快照文件
   - 运行 `pnpm diagnose:memory` 查看统计信息

2. **分析堆快照**：
   - 使用 Chrome DevTools 导入最新的快照
   - 在 Summary 视图中查找占用内存最多的对象
   - 在 Comparison 视图中对比多个快照，找出持续增长的对象

3. **定位泄漏点**：
   - 使用 Retainers 视图查看对象的引用链
   - 运行 `pnpm diagnose:leak` 扫描代码中的潜在泄漏点
   - 检查相关代码，确认是否存在未清理的资源

4. **修复和验证**：
   - 修复代码中的泄漏点
   - 重新运行应用，观察内存使用趋势
   - 如果内存稳定或下降，说明修复成功
