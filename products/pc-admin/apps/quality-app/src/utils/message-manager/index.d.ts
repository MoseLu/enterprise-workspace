/**
 * 智能消息弹窗中间件
 * 基于 BtcMessage 封装，提供消息队列管理、重复消息合并、优先级处理和徽章显示功能
 */
import type { MessageType, MessageQueueConfig, MessageDisplayHandler, MessageHistoryItem } from './types';
export declare class MessageManager {
    private config;
    private normalQueue;
    private errorQueue;
    private displayingMessages;
    private displayHandler;
    private badgeManager;
    private lifecycleManager;
    private historyManager;
    private cleanupInterval;
    private processingMessages;
    constructor(config?: Partial<MessageQueueConfig>);
    /**
     * 设置消息显示处理器
     */
    setDisplayHandler(handler: MessageDisplayHandler): void;
    /**
     * 入队消息
     */
    enqueue(type: MessageType, content: string): void;
    /**
     * 从队列中移除消息
     */
    private removeMessageFromQueue;
    /**
     * 更新现有消息的徽章
     */
    private updateExistingMessageBadge;
    /**
     * 检查消息实例是否有效
     */
    private isMessageInstanceValid;
    /**
     * 重新创建消息
     */
    private recreateMessage;
    /**
     * 重新显示消息
     */
    private reDisplayMessage;
    /**
     * 处理消息完成（生命周期结束）
     */
    private handleMessageCompleted;
    /**
     * 处理消息队列
     */
    private processQueue;
    /**
     * 显示消息
     */
    private displayMessage;
    /**
     * 获取下一个要显示的消息
     */
    private getNextMessage;
    /**
     * 检查是否可以显示新消息
     */
    private canDisplayNewMessage;
    /**
     * 清理消息（已废弃，现在由生命周期管理器处理）
     */
    private cleanupMessage;
    /**
     * 开始清理定时器
     */
    private startCleanupInterval;
    /**
     * 销毁管理器
     */
    destroy(): void;
    /**
     * 获取消息历史记录
     */
    getMessageHistory(): MessageHistoryItem[];
    /**
     * 清空历史记录
     */
    clearHistory(): void;
    /**
     * 获取状态信息
     */
    getStatus(): {
        normalQueue: any;
        errorQueue: any;
        displayingCount: number;
        totalMessages: any;
        historyCount: any;
    };
}
export type { MessageType, MessageQueueConfig, MessageDisplayHandler, QueuedMessage, MessageHistoryItem, } from './types';
export { DEFAULT_CONFIG, MESSAGE_PRIORITIES, MESSAGE_TYPE_CONFIG } from './config';
export declare const messageManager: MessageManager;
