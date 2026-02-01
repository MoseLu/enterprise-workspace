/**
 * 消息管理器类型定义
 */

// 消息类型
export type MessageType = 'success' | 'error' | 'warning' | 'info';

// 消息队列配置
export interface MessageQueueConfig {
  maxConcurrent: number;        // 最多同时显示的消息数量
  dedupeWindow: number;         // 去重时间窗口（毫秒）
  errorQueuePriority: boolean;  // 错误消息优先队列
  enableBadge: boolean;         // 启用徽标显示
  maxBadgeCount: number;        // 徽标最大显示数量
}

// 消息队列项
export interface QueuedMessage {
  id: string;
  type: MessageType;
  content: string;
  count: number;                // 合并计数
  priority: number;             // 优先级（error: 100, warning: 50, info/success: 0）
  duration: number;             // 智能计算的显示时长
  timestamp: number;
  retryCount: number;
  messageInstance?: any;        // BtcMessage 实例引用
}

// 消息显示回调接口
export interface MessageDisplayHandler {
  success: (message: string, duration?: number, badgeCount?: number) => any;
  error: (message: string, duration?: number, badgeCount?: number) => any;
  warning: (message: string, duration?: number, badgeCount?: number) => any;
  info: (message: string, duration?: number, badgeCount?: number) => any;
  updateBadge?: (messageInstance: any, badgeCount: number) => void; // 新增徽章更新方法
}

// 消息历史记录项
export interface MessageHistoryItem {
  id: string;
  type: MessageType;
  content: string;
  count: number;
  timestamp: number;
  duration: number;
}
