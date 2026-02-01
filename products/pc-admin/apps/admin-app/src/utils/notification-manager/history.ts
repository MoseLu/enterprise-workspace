/**
 * 通知历史记录管理
 */

import type { NotificationHistoryItem, NotificationType } from './types';

export class HistoryManager {
  private history: NotificationHistoryItem[] = [];
  private maxHistorySize = 100; // 最大历史记录数量

  /**
   * 添加通知到历史记录
   */
  addToHistory(
    id: string,
    type: NotificationType,
    content: string,
    title: string | undefined,
    count: number,
    duration: number
  ): void {
    const historyItem: NotificationHistoryItem = {
      id,
      type,
      content,
      title,
      count,
      timestamp: Date.now(),
      duration
    };

    this.history.unshift(historyItem); // 添加到开头

    // 限制历史记录数量
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
  }

  /**
   * 获取通知历史记录
   */
  getNotificationHistory(): NotificationHistoryItem[] {
    return [...this.history]; // 返回副本
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * 获取历史记录数量
   */
  getHistoryCount(): number {
    return this.history.length;
  }

  /**
   * 根据类型过滤历史记录
   */
  getHistoryByType(type: NotificationType): NotificationHistoryItem[] {
    return this.history.filter(item => item.type === type);
  }

  /**
   * 获取最近的通知
   */
  getRecentNotifications(count: number = 10): NotificationHistoryItem[] {
    return this.history.slice(0, count);
  }
}
