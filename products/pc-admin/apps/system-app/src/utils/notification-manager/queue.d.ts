/**
 * 通知队列管理
 */
import type { QueuedNotification, NotificationType, NotificationQueueConfig } from './types';
export declare class NotificationQueue {
    private config;
    private normalQueue;
    private errorQueue;
    private displayingNotifications;
    private notificationMap;
    constructor(config: NotificationQueueConfig);
    /**
     * 添加通知到队列
     */
    enqueue(type: NotificationType, content: string, title?: string): QueuedNotification;
    /**
     * 合并重复通知
     */
    private mergeNotification;
    /**
     * 计算通知显示时长
     */
    private calculateDuration;
    /**
     * 获取下一个要显示的通知
     */
    getNextNotification(): QueuedNotification | null;
    /**
     * 标记通知为显示中
     */
    markAsDisplaying(notificationId: string): void;
    /**
     * 标记通知为已完成
     */
    markAsCompleted(notificationId: string): void;
    /**
     * 检查是否可以显示新通知
     */
    canDisplayNewNotification(): boolean;
    /**
     * 获取显示中的通知数量
     */
    getDisplayingCount(): number;
    /**
     * 清理过期通知
     */
    cleanupExpiredNotifications(): void;
    /**
     * 获取队列状态
     */
    getQueueStatus(): {
        normalQueueLength: number;
        errorQueueLength: number;
        displayingCount: number;
        totalNotifications: number;
    };
}
