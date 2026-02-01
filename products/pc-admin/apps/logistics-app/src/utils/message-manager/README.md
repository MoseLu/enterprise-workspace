# Message Manager

智能消息弹窗中间件，基于 BtcMessage 封装，提供消息队列管理、重复消息合并、优先级处理和徽标显示功能。

## 文件结构

```
message-manager/
├── index.ts          # 主入口文件，导出 MessageManager 类
├── types.ts          # 类型定义
├── config.ts         # 配置相关
├── queue.ts          # 队列管理逻辑
├── badge.ts          # 徽章管理逻辑
├── lifecycle.ts      # 生命周期管理
└── README.md         # 文档
```

## 核心功能

### 1. 消息队列管理

- 支持普通消息队列和错误消息优先队列
- 自动去重和合并重复消息
- 智能计算消息显示时长

### 2. 徽章显示

- 重复消息显示数字徽章
- 支持递增和递减动画
- 徽章与消息弹窗同步显示和消失

### 3. 生命周期管理

- 完整的消息显示生命周期
- 自动递减动画
- 智能清理机制

## 使用方法

```typescript
import { messageManager } from '@/utils/message-manager';

// 设置显示处理器
messageManager.setDisplayHandler({
  success: (message, duration, badgeCount) => {
    // 显示成功消息
  },
  error: (message, duration, badgeCount) => {
    // 显示错误消息
  },
  warning: (message, duration, badgeCount) => {
    // 显示警告消息
  },
  info: (message, duration, badgeCount) => {
    // 显示信息消息
  },
  updateBadge: (messageInstance, badgeCount) => {
    // 更新徽章
  },
});

// 发送消息
messageManager.enqueue('success', '操作成功！');
messageManager.enqueue('error', '操作失败！');
```

## 配置选项

```typescript
interface MessageQueueConfig {
  maxConcurrent: number; // 最多同时显示的消息数量
  dedupeWindow: number; // 去重时间窗口（毫秒）
  errorQueuePriority: boolean; // 错误消息优先队列
  enableBadge: boolean; // 启用徽标显示
  maxBadgeCount: number; // 徽标最大显示数量
}
```

## 徽章生命周期设计

### 设计思想

消息徽章系统遵循完整的生命周期管理，确保用户获得一致且直观的反馈体验。系统支持四种不同的消息场景，每种场景都有其独特的生命周期流程。

### 四种消息场景

#### 1. 单条消息（无重复）

- **流程**：显示弹窗 → 3秒后自动消失
- **特点**：不显示徽章，使用Element Plus默认行为

#### 2. 重复1次（count=2）

- **流程**：显示弹窗 + 徽章(2) → 等待2秒 → 徽章消失 → 消息框消失
- **特点**：徽章直接显示2，无递增过程

#### 3. 重复多次（count>2）

- **流程**：递增阶段 → 等待阶段 → 递减阶段 → 徽章消失 → 消息框消失
- **详细步骤**：
  1. **递增阶段**：每次新消息到达时，立即更新徽章显示，重新启动2秒等待定时器
  2. **等待阶段**：用户停止操作2秒后，进入递减阶段
  3. **递减阶段**：从最大值递减到2，每400ms递减1
  4. **清理阶段**：徽章消失，消息框消失

#### 4. 递减期中断（特殊场景）

- **场景**：在递减过程中收到新的重复消息
- **处理**：停止当前递减 → 当前显示值+1作为新最大值 → 重新启动等待期 → 继续递减流程

### 时间轴图示

```
单条消息：
[消息显示] ──────────────────→ [消失]
          0ms              3000ms

重复1次：
[消息+徽章(2)] ──────────→ [徽章消失] → [消息消失]
           0ms           2000ms      2400ms   2800ms

重复多次：
[递增] → [等待] → [递减] → [清理]
  ↑       ↑       ↓       ↓
 即时更新  2秒    400ms   400ms
```

### 关键设计点

#### 递增阶段（重置等待机制）

- **策略**：选项b - 重置等待时间
- **行为**：每次新重复消息到达时：
  1. 清除现有的等待定时器
  2. 立即更新徽章显示（count++）
  3. 重新启动2秒等待定时器
- **优势**：用户还在操作时不会突然开始递减，体验更流畅

#### 递减阶段（中断恢复机制）

- **触发条件**：递减期间收到新的重复消息
- **处理流程**：
  1. 停止当前递减动画
  2. 将当前显示值+1作为新的最大值
  3. 重新启动等待期（2秒）
  4. 2秒后从新最大值开始递减
- **示例**：递减到5时收到新消息 → 显示6 → 等待2秒 → 从6开始递减

#### 状态管理

```typescript
interface MessageLifecycleState {
  phase: 'increment' | 'waiting' | 'countdown' | 'cleanup';
  incrementTimer?: NodeJS.Timeout;
  countdownTimer?: NodeJS.Timeout;
  maxCount: number;
  currentCount: number;
  lastUpdateTime: number;
}
```

### 并发控制

- **最大并发**：同时最多显示3个不同类型的消息弹窗
- **去重策略**：相同内容的消息会被合并，增加徽章计数
- **队列优先级**：错误消息具有更高的显示优先级

### 性能优化

- **内存管理**：自动清理过期的消息和定时器
- **事件防抖**：避免频繁的DOM操作
- **智能计算**：根据消息长度和重复次数动态调整显示时长

## 特性

- ✅ 消息去重和合并
- ✅ 优先级队列处理
- ✅ 完整的徽章生命周期管理
- ✅ 递增-递减动画效果
- ✅ 中断恢复机制
- ✅ 智能时长计算
- ✅ 自动清理机制
- ✅ TypeScript 类型支持
