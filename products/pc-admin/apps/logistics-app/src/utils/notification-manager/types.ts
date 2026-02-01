/**
 * 通知管理器类型定义
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// 通知队列配置
export interface NotificationQueueConfig {
  maxConcurrent: number;        // 最大并发显示数量
  dedupeWindow: number;         // 去重时间窗口（毫秒）
  errorQueuePriority: boolean;  // 错误队列优先级
  enableBadge: boolean;         // 启用徽章功能
  maxBadgeCount: number;        // 最大徽章数字
}

// 队列中的通知项
export interface QueuedNotification {
  id: string;
  type: NotificationType;
  content: string;
  title?: string;               // notification 特有的标题
  count: number;                // 重复次数
  priority: number;             // 优先级
  duration: number;             // 显示时长
  timestamp: number;            // 时间戳
  retryCount: number;           // 重试次数
  notificationInstance?: any;   // ElNotification 实例引用
}

// 通知显示回调接口
export interface NotificationDisplayHandler {
  success: (message: string, title?: string, duration?: number, badgeCount?: number) => any;
  error: (message: string, title?: string, duration?: number, badgeCount?: number) => any;
  warning: (message: string, title?: string, duration?: number, badgeCount?: number) => any;
  info: (message: string, title?: string, duration?: number, badgeCount?: number) => any;
  updateBadge?: (notificationInstance: any, badgeCount: number) => void; // 新增徽章更新方法
}

// 通知历史记录项
export interface NotificationHistoryItem {
  id: string;
  type: NotificationType;
  content: string;
  title?: string;
  count: number;
  timestamp: number;
  duration: number;
}
