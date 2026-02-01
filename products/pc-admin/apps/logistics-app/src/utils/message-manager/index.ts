/**
 * 智能消息弹窗中间件
 * 基于 BtcMessage 封装，提供消息队列管理、重复消息合并、优先级处理和徽章显示功能
 */
;

import type {
  MessageType,
  MessageQueueConfig,
  MessageDisplayHandler,
  MessageHistoryItem,
} from './types';
import { DEFAULT_CONFIG } from './config';
import { MessageQueue } from './queue';
import { BadgeManager } from './badge';
import { LifecycleManager } from './lifecycle';
import { HistoryManager } from './history';

export class MessageManager {
  private config: MessageQueueConfig;
  private normalQueue: MessageQueue;
  private errorQueue: MessageQueue;
  private displayingMessages = new Set<string>();
  private displayHandler: MessageDisplayHandler | null = null;
  private badgeManager: BadgeManager;
  private lifecycleManager: LifecycleManager | null = null;
  private historyManager: HistoryManager;
  private cleanupInterval: any = null;
  private processingMessages = new Set<string>(); // 防止并发处理同一消息

  constructor(config: Partial<MessageQueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.normalQueue = new MessageQueue(this.config);
    this.errorQueue = new MessageQueue(this.config);
    this.badgeManager = new BadgeManager();
    this.historyManager = new HistoryManager();
    this.startCleanupInterval();
  }

  /**
   * 设置消息显示处理器
   */
  setDisplayHandler(handler: MessageDisplayHandler): void {
    this.displayHandler = handler;
    this.lifecycleManager = new LifecycleManager(handler);

    // 设置生命周期完成回调
    this.lifecycleManager.setOnMessageCompleted((messageId: string) => {
      this.handleMessageCompleted(messageId);
    });
  }

  /**
   * 入队消息
   */
  enqueue(type: MessageType, content: string): void {
    const message = this.normalQueue.enqueue(type, content);


    // 如果是重复消息，直接更新现有消息的徽章
    if (message.count > 1) {
      // 检查消息是否已经在显示中
      if (this.displayingMessages.has(message.id)) {
        this.updateExistingMessageBadge(message);
      } else {
        // 如果是重复消息但消息已经不在显示中，需要重新显示
        // 这种情况发生在消息被生命周期管理器关闭后，用户再次点击相同消息
        this.displayMessage(message);
      }
    } else {
      // 防止并发处理新消息
      if (this.processingMessages.has(message.id)) {
        return;
      }

      this.processingMessages.add(message.id);

      try {
        this.processQueue();
      } finally {
        // 使用 setTimeout 确保消息处理完成后再移除锁
        setTimeout(() => {
          this.processingMessages.delete(message.id);
        }, 100);
      }
    }
  }

  /**
   * 从队列中移除消息
   */
  // @ts-expect-error: 私有方法，可能在未来使用
  private removeMessageFromQueue(_messageId: string): void {
    // 从普通队列中移除
    this.normalQueue.removeMessage(_messageId);
    // 从错误队列中移除
    this.errorQueue.removeMessage(_messageId);
  }

  /**
   * 更新现有消息的徽章
   */
  private updateExistingMessageBadge(message: any): void {
    if (!this.displayHandler || !this.displayHandler.updateBadge) {
      return;
    }

    const existingMessage = this.normalQueue.getMessageById(message.id);
    if (!existingMessage || !existingMessage.messageInstance) {
      return;
    }

    // 直接更新徽章，不经过 lifecycleManager
    try {
      this.displayHandler.updateBadge(existingMessage.messageInstance, message.count);

      // 更新消息计数
      existingMessage.count = message.count;
      existingMessage.timestamp = message.timestamp;
      existingMessage.duration = message.duration;

      // 通知生命周期管理器更新（但不触发重新创建）
      if (this.lifecycleManager) {
        this.lifecycleManager.handleMessageUpdate(existingMessage);
      }
    } catch (error) {
      console.warn('[MessageManager] Failed to update badge:', error);
    }
  }

  /**
   * 重新创建消息
   */
  // @ts-expect-error: 私有方法，可能在未来使用
  private recreateMessage(_message: any): void {
    // 从显示中的消息集合移除
    this.displayingMessages.delete(_message.id);

    // 清理生命周期状态
    if (this.lifecycleManager) {
      this.lifecycleManager.cleanup(_message.id);
    }

    // 重新显示消息
    this.displayMessage(_message);
  }

  /**
   * 重新显示消息
   */
  // @ts-expect-error: 私有方法，可能在未来使用
  private reDisplayMessage(_message: any): void {
    // 从显示中的消息集合移除
    this.displayingMessages.delete(_message.id);

    // 重新显示消息
    this.displayMessage(_message);
  }

  /**
   * 处理消息完成（生命周期结束）
   */
  private handleMessageCompleted(messageId: string): void {
    // 从显示中的消息集合移除
    this.displayingMessages.delete(messageId);

    // 从队列中移除
    this.normalQueue.cleanupCompletedMessage(messageId);
    this.errorQueue.cleanupCompletedMessage(messageId);

    // 触发下一个消息处理
    setTimeout(() => {
      this.processQueue();
    }, 100);
  }

  /**
   * 处理消息队列
   */
  private processQueue(): void {
    if (!this.displayHandler || !this.canDisplayNewMessage()) {
      return;
    }

    const message = this.getNextMessage();
    if (!message) {
      return;
    }

    this.displayMessage(message);
  }

  /**
   * 显示消息
   */
  private displayMessage(message: any): void {
    if (!this.displayHandler) {
      return;
    }

    // 检查消息是否已经在显示中
    if (this.displayingMessages.has(message.id)) {
      return;
    }

    const messageInstance = (this.displayHandler as any)[message.type](
      message.content,
      message.duration,
      message.count
    );

    message.messageInstance = messageInstance;
    this.displayingMessages.add(message.id);

    // 添加到历史记录
    this.historyManager.addToHistory(
      message.id,
      message.type,
      message.content,
      message.count,
      message.duration
    );

    // 设置消息生命周期
    if (this.lifecycleManager) {
      this.lifecycleManager.setupMessageLifecycle(message);
    }

    // 继续处理队列
    setTimeout(() => {
      this.processQueue();
    }, 100);
  }

  /**
   * 获取下一个要显示的消息
   */
  private getNextMessage(): any | null {
    // 优先处理错误队列
    if (this.config.errorQueuePriority && this.errorQueue.getDisplayingCount() > 0) {
      return this.errorQueue.getNextMessage();
    }

    // 处理普通队列
    return this.normalQueue.getNextMessage();
  }

  /**
   * 检查是否可以显示新消息
   */
  private canDisplayNewMessage(): boolean {
    return this.displayingMessages.size < this.config.maxConcurrent;
  }

  /**
   * 清理消息（已废弃，现在由生命周期管理器处理）
   */
  // @ts-expect-error: 私有方法，可能在未来使用
  private cleanupMessage(_messageId: string): void {
    // 这个方法现在主要用于紧急清理
    this.displayingMessages.delete(_messageId);
    this.badgeManager.stopCountdownAnimation(_messageId);

    // 清理生命周期状态
    if (this.lifecycleManager) {
      this.lifecycleManager.cleanup(_messageId);
    }
  }

  /**
   * 开始清理定时器
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.normalQueue.cleanupExpiredMessages();
      this.errorQueue.cleanupExpiredMessages();
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

    // 清理生命周期状态
    if (this.lifecycleManager) {
      this.lifecycleManager.cleanupAll();
    }

    this.displayingMessages.clear();
  }

  /**
   * 获取消息历史记录
   */
  getMessageHistory(): MessageHistoryItem[] {
    return this.historyManager.getMessageHistory();
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
      displayingCount: this.displayingMessages.size,
      totalMessages: this.normalQueue.getQueueStatus().totalMessages,
      historyCount: this.historyManager.getHistoryCount(),
    };
  }
}

// 导出类型
export type {
  MessageType,
  MessageQueueConfig,
  MessageDisplayHandler,
  QueuedMessage,
  MessageHistoryItem,
} from './types';

// 导出配置
export { DEFAULT_CONFIG, MESSAGE_PRIORITIES, MESSAGE_TYPE_CONFIG } from './config';

// 创建默认实例
export const messageManager = new MessageManager();
