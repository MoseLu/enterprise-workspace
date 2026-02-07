# NotificationManager 模块

## 概述

`NotificationManager` 是一个智能通知弹窗中间件，基于 Element Plus 的 `ElNotification` 组件封装，提供通知队列管理、重复通知合并、优先级处理和徽标显示功能。

## 特性

- **队列管理**: 支持普通队列和错误队列，错误通知具有更高优先级
- **重复合并**: 相同内容的通知会自动合并，显示重复次数
- **徽章显示**: 重复通知显示数字徽章，支持递增递减动画
- **生命周期管理**: 完整的通知生命周期，包括显示、递减、消失
- **历史记录**: 记录所有通知的历史，支持查询和清空
- **并发控制**: 限制同时显示的通知数量

## 架构

```
NotificationManager
├── types.ts          # 类型定义
├── config.ts         # 配置管理
├── queue.ts          # 队列管理
├── badge.ts          # 徽章管理
├── lifecycle.ts      # 生命周期管理
├── history.ts        # 历史记录管理
└── index.ts          # 主入口
```

## 使用方法

### 基本使用

```typescript
import { notificationManager } from './utils/notification-manager';

// 发送通知
notificationManager.enqueue('success', '操作成功！', '成功');
notificationManager.enqueue('error', '操作失败！', '错误');
notificationManager.enqueue('warning', '请注意！', '警告');
notificationManager.enqueue('info', '提示信息', '信息');
```

### 设置显示处理器

```typescript
import { ElNotification } from 'element-plus';

const displayHandler = {
  success: (message: string, title?: string, duration?: number, badgeCount?: number) => {
    return ElNotification.success({
      title: title || '成功',
      message,
      duration: duration || 3000,
    });
  },
  error: (message: string, title?: string, duration?: number, badgeCount?: number) => {
    return ElNotification.error({
      title: title || '错误',
      message,
      duration: duration || 0,
    });
  },
  warning: (message: string, title?: string, duration?: number, badgeCount?: number) => {
    return ElNotification.warning({
      title: title || '警告',
      message,
      duration: duration || 5000,
    });
  },
  info: (message: string, title?: string, duration?: number, badgeCount?: number) => {
    return ElNotification.info({
      title: title || '信息',
      message,
      duration: duration || 3000,
    });
  },
  updateBadge: (notificationInstance: any, badgeCount: number) => {
    // 更新徽章逻辑
  },
};

notificationManager.setDisplayHandler(displayHandler);
```

### 历史记录管理

```typescript
// 获取历史记录
const history = notificationManager.getNotificationHistory();

// 清空历史记录
notificationManager.clearHistory();

// 获取状态信息
const status = notificationManager.getStatus();
```

## 配置选项

```typescript
interface NotificationQueueConfig {
  maxConcurrent: number; // 最大并发显示数量，默认 3
  dedupeWindow: number; // 去重时间窗口（毫秒），默认 10000
  errorQueuePriority: boolean; // 错误队列优先级，默认 true
  enableBadge: boolean; // 启用徽章功能，默认 true
  maxBadgeCount: number; // 最大徽章数字，默认 99
}
```

## 通知类型

- `success`: 成功通知，绿色图标
- `error`: 错误通知，红色图标，不自动关闭
- `warning`: 警告通知，橙色图标
- `info`: 信息通知，蓝色图标

## 徽章功能

- 只有重复通知（count > 1）才显示徽章
- 支持递增动画：2, 3, 4, 5...
- 支持递减动画：5, 4, 3, 2, 消失
- 徽章中心与通知弹窗左上角顶点重合
- 完全独立的渲染层，不影响通知布局

## 生命周期

1. **显示阶段**: 通知弹出，重复通知显示徽章
2. **递增阶段**: 重复通知时徽章数字递增
3. **等待阶段**: 停止重复后等待一段时间
4. **递减阶段**: 徽章数字递减：5→4→3→2
5. **消失阶段**: 徽章消失，通知框消失

## 与 MessageManager 的区别

1. **基础组件**: 基于 `ElNotification` 而不是 `BtcMessage`
2. **定位方式**: 徽章中心与左上角顶点重合，而不是右上角
3. **标题支持**: 支持可选的标题参数
4. **显示位置**: 通常在页面右上角显示
5. **完全独立**: 与 MessageManager 完全独立运行
