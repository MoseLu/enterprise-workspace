/**
 * 消息管理器配置
 */

import type { MessageQueueConfig } from './types';

// 默认配置
export const DEFAULT_CONFIG: MessageQueueConfig = {
  maxConcurrent: 3,
  dedupeWindow: 0, // 不再使用时间窗口，改为基于生命周期的管理
  errorQueuePriority: true,
  enableBadge: true,
  maxBadgeCount: 99
};

// 消息优先级配置
export const MESSAGE_PRIORITIES = {
  error: 100,
  warning: 50,
  info: 0,
  success: 0
} as const;

// 消息类型配置
export const MESSAGE_TYPE_CONFIG = {
  success: { icon: 'success', color: '#67c23a' },
  error: { icon: 'error', color: '#f56c6c' },
  warning: { icon: 'warning', color: '#e6a23c' },
  info: { icon: 'info', color: '#909399' }
} as const;
