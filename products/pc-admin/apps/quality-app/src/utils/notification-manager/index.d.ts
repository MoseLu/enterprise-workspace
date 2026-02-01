/**
 * 智能通知弹窗中间件
 * 基于 ElNotification 封装，提供通知队列管理、重复通知合并、优先级处理和徽标显示功能
 */
import type { NotificationType, NotificationQueueConfig, NotificationDisplayHandler, NotificationHistoryItem } from './types';
export declare class NotificationManager {
    private config;
    private normalQueue;
    private errorQueue;
    private displayingNotifications;
    private notificationMap;
    private displayHandler;
    private badgeManager;
    private lifecycleManager;
    private historyManager;
    private cleanupInterval;
    constructor(config?: Partial<NotificationQueueConfig>);
    /**
     * 设置通知显示处理器
     */
    setDisplayHandler(handler: NotificationDisplayHandler): void;
    /**
     * 入队通知
     */
    enqueue(type: NotificationType, content: string, title?: string): void;
    /**
     * 处理通知队列
     */
    private processQueue;
    /**
     * 显示通知
     */
    private displayNotification;
    /**
     * 获取下一个要显示的通知
     */
    private getNextNotification;
    /**
     * 检查是否可以显示新通知
     */
    private canDisplayNewNotification;
    /**
     * 清理通知
     */
    private cleanupNotification;
    /**
     * 开始清理定时器
     */
    private startCleanupInterval;
    /**
     * 销毁管理器
     */
    destroy(): void;
    /**
     * 获取通知历史记录
     */
    getNotificationHistory(): NotificationHistoryItem[];
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
        totalNotifications: number;
        historyCount: any;
    };
}
export type { NotificationType, NotificationQueueConfig, NotificationDisplayHandler, QueuedNotification, NotificationHistoryItem } from './types';
export { DEFAULT_CONFIG, NOTIFICATION_PRIORITIES, NOTIFICATION_TYPE_CONFIG } from './config';
export declare const notificationManager: NotificationManager;
