/**
 * 消息历史记录管理
 */

import type { MessageHistoryItem, MessageType } from './types';

export class HistoryManager {
  private history: MessageHistoryItem[] = [];
  private maxHistorySize = 100; // 最大历史记录数量

  /**
   * 添加消息到历史记录
   */
  addToHistory(
    id: string,
    type: MessageType,
    content: string,
    count: number,
    duration: number
  ): void {
    const historyItem: MessageHistoryItem = {
      id,
      type,
      content,
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
   * 获取消息历史记录
   */
  getMessageHistory(): MessageHistoryItem[] {
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
  getHistoryByType(type: MessageType): MessageHistoryItem[] {
    return this.history.filter(item => item.type === type);
  }

  /**
   * 获取最近的消息
   */
  getRecentMessages(count: number = 10): MessageHistoryItem[] {
    return this.history.slice(0, count);
  }
}
