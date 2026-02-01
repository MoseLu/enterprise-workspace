/**
 * 消息队列管理
 */

import type { QueuedMessage, MessageType, MessageQueueConfig } from './types';
import { MESSAGE_PRIORITIES } from './config';

export class MessageQueue {
  private normalQueue: QueuedMessage[] = [];
  private errorQueue: QueuedMessage[] = [];
  private displayingMessages = new Set<string>();
  private messageMap = new Map<string, QueuedMessage>();

  constructor(private config: MessageQueueConfig) {}

  /**
   * 添加消息到队列
   */
  enqueue(type: MessageType, content: string): QueuedMessage {
    const messageId = `${type}:${content}`;
    const existingMessage = this.messageMap.get(messageId);

    if (existingMessage) {
      return this.mergeMessage(existingMessage);
    }

    const newMessage: QueuedMessage = {
      id: messageId,
      type,
      content,
      count: 1,
      priority: MESSAGE_PRIORITIES[type],
      duration: this.calculateDuration(content, 1),
      timestamp: Date.now(),
      retryCount: 0
    };

    this.messageMap.set(messageId, newMessage);

    if (type === 'error' && this.config.errorQueuePriority) {
      this.errorQueue.push(newMessage);
    } else {
      this.normalQueue.push(newMessage);
    }

    return newMessage;
  }

  /**
   * 合并重复消息
   */
  private mergeMessage(existingMessage: QueuedMessage): QueuedMessage {
    existingMessage.count++;
    // 限制最大计数为99
    if (existingMessage.count > 99) {
      existingMessage.count = 99;
    }
    existingMessage.duration = this.calculateDuration(existingMessage.content, existingMessage.count);
    existingMessage.timestamp = Date.now();

    return existingMessage;
  }

  /**
   * 计算消息显示时长
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
   * 获取下一个要显示的消息
   */
  getNextMessage(): QueuedMessage | null {
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
   * 标记消息为显示中
   */
  markAsDisplaying(messageId: string): void {
    this.displayingMessages.add(messageId);
  }

  /**
   * 标记消息为已完成
   */
  markAsCompleted(messageId: string): void {
    this.displayingMessages.delete(messageId);
    this.messageMap.delete(messageId);
  }

  /**
   * 从队列中移除消息
   */
  removeMessage(messageId: string): void {
    // 从普通队列中移除
    const normalIndex = this.normalQueue.findIndex(msg => msg.id === messageId);
    if (normalIndex !== -1) {
      this.normalQueue.splice(normalIndex, 1);
    }

    // 从错误队列中移除
    const errorIndex = this.errorQueue.findIndex(msg => msg.id === messageId);
    if (errorIndex !== -1) {
      this.errorQueue.splice(errorIndex, 1);
    }
  }

  /**
   * 检查是否可以显示新消息
   */
  canDisplayNewMessage(): boolean {
    return this.displayingMessages.size < this.config.maxConcurrent;
  }

  /**
   * 获取显示中的消息数量
   */
  getDisplayingCount(): number {
    return this.displayingMessages.size;
  }

  /**
   * 清理完成的消息（基于生命周期的清理）
   */
  cleanupCompletedMessage(messageId: string): void {
    // 从队列中移除已完成的消息
    this.normalQueue = this.normalQueue.filter(msg => msg.id !== messageId);
    this.errorQueue = this.errorQueue.filter(msg => msg.id !== messageId);

    // 从消息映射中移除
    this.messageMap.delete(messageId);

    // 从显示中的消息集合移除
    this.displayingMessages.delete(messageId);
  }

  /**
   * 清理过期消息（基于生命周期的清理）
   * 只有生命周期结束的消息才会被清理
   */
  cleanupExpiredMessages(): void {
    // 不再使用时间窗口清理，改为基于生命周期的清理
    // 消息只有在生命周期结束后才会被清理
    // 这个方法现在主要用于清理队列中的残留消息
    const orphanedMessages: string[] = [];

    for (const [messageId, _message] of this.messageMap.entries()) {
      // 只清理不在显示中且不在队列中的消息
      if (!this.displayingMessages.has(messageId) &&
          !this.normalQueue.some(msg => msg.id === messageId) &&
          !this.errorQueue.some(msg => msg.id === messageId)) {
        orphanedMessages.push(messageId);
      }
    }

    orphanedMessages.forEach(messageId => {
      this.messageMap.delete(messageId);
    });
  }

  /**
   * 根据ID获取消息
   */
  getMessageById(messageId: string): QueuedMessage | undefined {
    return this.messageMap.get(messageId);
  }

  /**
   * 获取队列状态
   */
  getQueueStatus() {
    return {
      normalQueueLength: this.normalQueue.length,
      errorQueueLength: this.errorQueue.length,
      displayingCount: this.displayingMessages.size,
      totalMessages: this.messageMap.size
    };
  }
}
