# RetryStatusIndicator 重试状态指示器

## 概述

`RetryStatusIndicator` 是一个全局的网络重试状态指示器组件，用于实时显示HTTP请求的重试状态，帮助用户了解网络连接情况和系统的自动恢复过程。

## 功能特性

### 🎯 智能显示
- **按需显示**：只有在网络重试或出现问题时才显示，正常情况下保持界面简洁
- **实时监控**：每2秒检查一次重试状态，及时反映网络变化
- **自动隐藏**：网络恢复正常后自动隐藏指示器

### 🎨 视觉设计
- **徽章样式**：小巧的圆点设计，不干扰主要内容
- **状态颜色**：
  - 🟡 **黄色**：有重试历史，需要关注
  - 🔵 **蓝色**：正在重试中
- **动画效果**：脉冲动画提供视觉反馈
- **高可见性**：白色边框和阴影确保在各种背景下都清晰可见

### 📍 位置设计
- **固定位置**：用户头像右上角
- **不遮挡内容**：精心设计的位置不影响其他UI元素
- **高层级**：z-index: 10001，确保始终可见

## 使用方法

### 基本使用

```vue
<template>
  <div>
    <!-- 其他应用内容 -->
    <RetryStatusIndicator />
  </div>
</template>

<script setup>
import RetryStatusIndicator from '@/components/RetryStatusIndicator.vue';
</script>
```

### 在主应用中集成

组件已经在 `App.vue` 中全局引入：

```vue
<!-- App.vue -->
<template>
  <router-view />
  <RetryStatusIndicator />
</template>
```

## 状态说明

### 显示状态

| 状态 | 颜色 | 动画 | 说明 |
|------|------|------|------|
| 隐藏 | - | - | 网络正常，无重试历史 |
| 警告 | 🟡 黄色 | 慢脉冲 | 有重试失败历史，需要关注 |
| 重试中 | 🔵 蓝色 | 快脉冲 | 正在进行网络重试 |

### 悬停提示

鼠标悬停在指示器上会显示详细信息：
- 重试次数
- 重试延迟时间
- 网络状态描述

## 技术实现

### 核心依赖

```typescript
import { getRetryStatus } from '@/utils/requestAdapter';
```

### 状态检查逻辑

```typescript
function checkRetryStatus() {
  const status = getRetryStatus();
  retryStatus.value = status;
  
  // 只有在重试中或有重试历史时才显示指示器
  showIndicator.value = status.isRetrying || status.retryCount > 0;
}
```

### 监控机制

- **检查频率**：每2秒检查一次
- **生命周期**：组件挂载时启动，卸载时清理
- **性能优化**：使用 `readonly` 包装状态，避免不必要的响应式更新

## 样式定制

### CSS 变量

组件使用以下CSS变量，可以通过主题系统进行定制：

```scss
.retry-status-indicator {
  // 位置
  --indicator-top: 8px;
  --indicator-right: 8px;
  
  // 尺寸
  --dot-size: 10px;
  --border-width: 2px;
  
  // 颜色
  --warning-color: #e6a23c;
  --retrying-color: #409eff;
  --border-color: #fff;
}
```

### 动画配置

```scss
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

// 警告状态：1秒脉冲
.warning { animation: pulse 1s infinite; }

// 重试状态：0.5秒快速脉冲
.retrying { animation: pulse 0.5s infinite; }
```

## 集成的重试系统

### 指数退避算法

组件配合 `useRetry` composable 使用，支持：

- **指数退避**：延迟时间按指数增长
- **随机抖动**：避免雷群效应
- **智能重试**：根据错误类型决定是否重试
- **QPS限制**：避免对后端造成压力

### 重试配置

```typescript
// 预定义的重试配置
export const RETRY_CONFIGS = {
  fast: { maxRetries: 2, baseDelay: 500, maxDelay: 2000 },
  standard: { maxRetries: 3, baseDelay: 1000, maxDelay: 10000 },
  slow: { maxRetries: 5, baseDelay: 2000, maxDelay: 30000 },
  log: { maxRetries: 3, baseDelay: 1000, maxDelay: 5000 }
};
```

## 最佳实践

### 1. 监控网络状态

```typescript
// 获取当前重试状态
const retryStatus = http.getRetryStatus();
console.log('重试次数:', retryStatus.retryCount);
console.log('是否重试中:', retryStatus.isRetrying);
```

### 2. 手动重置状态

```typescript
// 重置重试状态（在特殊情况下使用）
http.resetRetry();
```

### 3. 自定义错误处理

```typescript
// 在特定组件中监听重试状态
watch(() => retryStatus.value.retryCount, (count) => {
  if (count > 2) {
    // 重试次数过多时的自定义处理
    BtcMessage.warning('网络连接不稳定，请检查网络设置');
  }
});
```

## 故障排除

### 常见问题

1. **指示器不显示**
   - 检查是否有网络请求失败
   - 确认组件已正确引入到 App.vue
   - 查看浏览器控制台是否有错误

2. **位置不正确**
   - 检查CSS的 z-index 是否被覆盖
   - 确认顶部栏的高度没有变化
   - 验证 position: fixed 是否生效

3. **状态不更新**
   - 检查定时器是否正常运行
   - 确认 http.getRetryStatus() 返回正确数据
   - 查看组件的生命周期是否正常

### 调试方法

```typescript
// 在浏览器控制台中调试
console.log('重试状态:', http.getRetryStatus());

// 检查指示器元素
document.querySelector('.retry-status-indicator');

// 手动触发状态检查
checkRetryStatus();
```

## 更新日志

### v1.0.0
- ✨ 初始版本发布
- 🎯 支持智能显示逻辑
- 🎨 徽章样式设计
- 📍 用户头像右上角定位
- 🔄 集成指数退避重试系统

## 相关文档

- [useRetry Composable](../composables/useRetry.md)
- [HTTP 拦截器](../utils/http.md)
- [请求日志系统](../utils/request-logger.md)
