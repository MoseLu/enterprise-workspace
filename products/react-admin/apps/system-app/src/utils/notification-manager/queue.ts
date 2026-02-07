/**
 * 通知队列管理
 */

import type { QueuedNotification, NotificationType, NotificationQueueConfig } from './types';
import { NOTIFICATION_PRIORITIES } from './config';

export class NotificationQueue {
  private normalQueue: QueuedNotification[] = [];
  private errorQueue: QueuedNotification[] = [];
  private displayingNotifications = new Set<string>();
  private notificationMap = new Map<string, QueuedNotification>();

  constructor(private config: NotificationQueueConfig) {}

  /**
   * 添加通知到队列
   */
  enqueue(type: NotificationType, content: string, title?: string): QueuedNotification {
    const notificationId = `${type}:${content}`;
    const existingNotification = this.notificationMap.get(notificationId);

    if (existingNotification) {
      return this.mergeNotification(existingNotification);
    }

    const newNotification: QueuedNotification = {
      id: notificationId,
      type,
      content,
      ...(title !== undefined && { title }),
      count: 1,
      priority: NOTIFICATION_PRIORITIES[type],
      duration: this.calculateDuration(content, 1),
      timestamp: Date.now(),
      retryCount: 0
    };

    this.notificationMap.set(notificationId, newNotification);

    if (type === 'error' && this.config.errorQueuePriority) {
      this.errorQueue.push(newNotification);
    } else {
      this.normalQueue.push(newNotification);
    }

    return newNotification;
  }

  /**
   * 合并重复通知
   */
  private mergeNotification(existingNotification: QueuedNotification): QueuedNotification {
    existingNotification.count++;
    existingNotification.duration = this.calculateDuration(existingNotification.content, existingNotification.count);
    existingNotification.timestamp = Date.now();

    return existingNotification;
  }

  /**
   * 计算通知显示时长
   */
  private calculateDuration(_content: string, count: number): number {
    const baseDuration = 3000; // 基础3秒
    const repeatBonus = (count - 1) * 1000; // 每次重复增加1秒
    const waitingPeriod = 500; // 等待期
    const countdownTime = (count - 1) * 400; // 递减时间
    const finalDelay = 400; // 最终延迟
    const bufferTime = 2000; // 缓冲时间

    return baseDuration + repeatBonus + waitingPeriod + countdownTime + finalDelay + bufferTime;
  }

  /**
   * 获取下一个要显示的通知
   */
  getNextNotification(): QueuedNotification | null {
    // 优先处理错误队列
    if (this.config.errorQueuePriority && this.errorQueue.length > 0) {
      return this.errorQueue.shift() || null;
    }

    // 处理普通队列
    if (this.normalQueue.length > 0) {
      return this.normalQueue.shift() || null;
    }

    return null;
  }

  /**
   * 标记通知为显示中
   */
  markAsDisplaying(notificationId: string): void {
    this.displayingNotifications.add(notificationId);
  }

  /**
   * 标记通知为已完成
   */
  markAsCompleted(notificationId: string): void {
    this.displayingNotifications.delete(notificationId);
    this.notificationMap.delete(notificationId);
  }

  /**
   * 检查是否可以显示新通知
   */
  canDisplayNewNotification(): boolean {
    return this.displayingNotifications.size < this.config.maxConcurrent;
  }

  /**
   * 获取显示中的通知数量
   */
  getDisplayingCount(): number {
    return this.displayingNotifications.size;
  }

  /**
   * 清理过期通知
   */
  cleanupExpiredNotifications(): void {
    const now = Date.now();
    const expiredNotifications: string[] = [];

    for (const [notificationId, notification] of this.notificationMap.entries()) {
      if (now - notification.timestamp > this.config.dedupeWindow) {
        expiredNotifications.push(notificationId);
      }
    }

    expiredNotifications.forEach(notificationId => {
      this.notificationMap.delete(notificationId);
      this.normalQueue = this.normalQueue.filter(notif => notif.id !== notificationId);
      this.errorQueue = this.errorQueue.filter(notif => notif.id !== notificationId);
      this.displayingNotifications.delete(notificationId);
    });
  }

  /**
   * 获取队列状态
   */
  getQueueStatus() {
    return {
      normalQueueLength: this.normalQueue.length,
      errorQueueLength: this.errorQueue.length,
      displayingCount: this.displayingNotifications.size,
      totalNotifications: this.notificationMap.size
    };
  }
}
