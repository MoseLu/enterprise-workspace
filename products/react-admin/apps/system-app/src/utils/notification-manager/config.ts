/**
 * 通知管理器配置
 */

import type { NotificationQueueConfig } from './types';

// 默认配置
export const DEFAULT_CONFIG: NotificationQueueConfig = {
  maxConcurrent: 3,
  dedupeWindow: 10000,
  errorQueuePriority: true,
  enableBadge: true,
  maxBadgeCount: 99
};

// 通知类型优先级
export const NOTIFICATION_PRIORITIES = {
  error: 100,
  warning: 75,
  success: 50,
  info: 25
};

// 通知类型配置
export const NOTIFICATION_TYPE_CONFIG = {
  success: { duration: 3000, icon: 'success' },
  error: { duration: 0, icon: 'error' },  // 错误消息不自动关闭
  warning: { duration: 5000, icon: 'warning' },
  info: { duration: 3000, icon: 'info' }
};
