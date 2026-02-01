/**
 * 智能通知弹窗中间件
 * 基于 ElNotification 封装，提供通知队列管理、重复通知合并、优先级处理和徽标显示功能
 */

import type { NotificationType, NotificationQueueConfig, NotificationDisplayHandler, NotificationHistoryItem } from './types';
import { DEFAULT_CONFIG } from './config';
import { NotificationQueue } from './queue';
import { BadgeManager } from './badge';
import { LifecycleManager } from './lifecycle';
import { HistoryManager } from './history';

export class NotificationManager {
  private config: NotificationQueueConfig;
  private normalQueue: NotificationQueue;
  private errorQueue: NotificationQueue;
  private displayingNotifications = new Set<string>();
  private notificationMap = new Map<string, any>();
  private displayHandler: NotificationDisplayHandler | null = null;
  private badgeManager: BadgeManager;
  private lifecycleManager: LifecycleManager | null = null;
  private historyManager: HistoryManager;
  private cleanupInterval: any = null;

  constructor(config: Partial<NotificationQueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.normalQueue = new NotificationQueue(this.config);
    this.errorQueue = new NotificationQueue(this.config);
    this.badgeManager = new BadgeManager();
    this.historyManager = new HistoryManager();
    this.startCleanupInterval();
  }

  /**
   * 设置通知显示处理器
   */
  setDisplayHandler(handler: NotificationDisplayHandler): void {
    this.displayHandler = handler;
    this.lifecycleManager = new LifecycleManager(handler);
  }

  /**
   * 入队通知
   */
  enqueue(type: NotificationType, content: string, title?: string): void {
    const notification = this.normalQueue.enqueue(type, content, title);
    this.notificationMap.set(notification.id, notification);
    this.processQueue();
  }

  /**
   * 处理通知队列
   */
  private processQueue(): void {
    if (!this.displayHandler || !this.canDisplayNewNotification()) {
      return;
    }

    const notification = this.getNextNotification();
    if (!notification) {
      return;
    }

    this.displayNotification(notification);
  }

  /**
   * 显示通知
   */
  private displayNotification(notification: any): void {
    if (!this.displayHandler) {
      return;
    }

    const notificationInstance = (this.displayHandler as any)[notification.type](
      notification.content,
      notification.title,
      notification.duration,
      notification.count
    );

    notification.notificationInstance = notificationInstance;
    this.displayingNotifications.add(notification.id);

    // 添加到历史记录
    this.historyManager.addToHistory(
      notification.id,
      notification.type,
      notification.content,
      notification.title,
      notification.count,
      notification.duration
    );

    // 设置通知生命周期
    if (this.lifecycleManager) {
      this.lifecycleManager.setupNotificationLifecycle(notification);
    }

    // 继续处理队列
    setTimeout(() => {
      this.processQueue();
    }, 100);
  }

  /**
   * 获取下一个要显示的通知
   */
  private getNextNotification(): any | null {
    // 优先处理错误队列
    if (this.config.errorQueuePriority && this.errorQueue.getDisplayingCount() > 0) {
      return this.errorQueue.getNextNotification();
    }

    // 处理普通队列
    return this.normalQueue.getNextNotification();
  }

  /**
   * 检查是否可以显示新通知
   */
  private canDisplayNewNotification(): boolean {
    return this.displayingNotifications.size < this.config.maxConcurrent;
  }

  /**
   * 清理通知
   */
  // @ts-expect-error: 私有方法，可能在未来使用
  private cleanupNotification(_notificationId: string): void {
    this.displayingNotifications.delete(_notificationId);
    this.notificationMap.delete(_notificationId);
    this.badgeManager.stopCountdownAnimation(_notificationId);
  }

  /**
   * 开始清理定时器
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.normalQueue.cleanupExpiredNotifications();
      this.errorQueue.cleanupExpiredNotifications();
    }, 5000);
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.badgeManager.cleanup();
    this.displayingNotifications.clear();
    this.notificationMap.clear();
  }

  /**
   * 获取通知历史记录
   */
  getNotificationHistory(): NotificationHistoryItem[] {
    return this.historyManager.getNotificationHistory();
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    this.historyManager.clearHistory();
  }

  /**
   * 获取状态信息
   */
  getStatus() {
    return {
      normalQueue: this.normalQueue.getQueueStatus(),
      errorQueue: this.errorQueue.getQueueStatus(),
      displayingCount: this.displayingNotifications.size,
      totalNotifications: this.notificationMap.size,
      historyCount: this.historyManager.getHistoryCount()
    };
  }
}

// 导出类型
export type { NotificationType, NotificationQueueConfig, NotificationDisplayHandler, QueuedNotification, NotificationHistoryItem } from './types';

// 导出配置
export { DEFAULT_CONFIG, NOTIFICATION_PRIORITIES, NOTIFICATION_TYPE_CONFIG } from './config';

// 创建默认实例
export const notificationManager = new NotificationManager();
