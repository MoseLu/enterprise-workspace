/**
 * 消息管理器类型定义
 */
export type MessageType = 'success' | 'error' | 'warning' | 'info';
export interface MessageQueueConfig {
    maxConcurrent: number;
    dedupeWindow: number;
    errorQueuePriority: boolean;
    enableBadge: boolean;
    maxBadgeCount: number;
}
export interface QueuedMessage {
    id: string;
    type: MessageType;
    content: string;
    count: number;
    priority: number;
    duration: number;
    timestamp: number;
    retryCount: number;
    messageInstance?: any;
}
export interface MessageDisplayHandler {
    success: (message: string, duration?: number, badgeCount?: number) => any;
    error: (message: string, duration?: number, badgeCount?: number) => any;
    warning: (message: string, duration?: number, badgeCount?: number) => any;
    info: (message: string, duration?: number, badgeCount?: number) => any;
    updateBadge?: (messageInstance: any, badgeCount: number) => void;
}
export interface MessageHistoryItem {
    id: string;
    type: MessageType;
    content: string;
    count: number;
    timestamp: number;
    duration: number;
}
