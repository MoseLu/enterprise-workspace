/**
 * 消息队列管理
 */
import type { QueuedMessage, MessageType, MessageQueueConfig } from './types';
export declare class MessageQueue {
    private config;
    private normalQueue;
    private errorQueue;
    private displayingMessages;
    private messageMap;
    constructor(config: MessageQueueConfig);
    /**
     * 添加消息到队列
     */
    enqueue(type: MessageType, content: string): QueuedMessage;
    /**
     * 合并重复消息
     */
    private mergeMessage;
    /**
     * 计算消息显示时长
     */
    private calculateDuration;
    /**
     * 获取下一个要显示的消息
     */
    getNextMessage(): QueuedMessage | null;
    /**
     * 标记消息为显示中
     */
    markAsDisplaying(messageId: string): void;
    /**
     * 标记消息为已完成
     */
    markAsCompleted(messageId: string): void;
    /**
     * 从队列中移除消息
     */
    removeMessage(messageId: string): void;
    /**
     * 检查是否可以显示新消息
     */
    canDisplayNewMessage(): boolean;
    /**
     * 获取显示中的消息数量
     */
    getDisplayingCount(): number;
    /**
     * 清理完成的消息（基于生命周期的清理）
     */
    cleanupCompletedMessage(messageId: string): void;
    /**
     * 清理过期消息（基于生命周期的清理）
     * 只有生命周期结束的消息才会被清理
     */
    cleanupExpiredMessages(): void;
    /**
     * 根据ID获取消息
     */
    getMessageById(messageId: string): QueuedMessage | undefined;
    /**
     * 获取队列状态
     */
    getQueueStatus(): {
        normalQueueLength: number;
        errorQueueLength: number;
        displayingCount: number;
        totalMessages: number;
    };
}
