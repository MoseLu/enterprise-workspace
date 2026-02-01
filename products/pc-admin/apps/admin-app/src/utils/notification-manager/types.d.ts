/**
 * 通知管理器类型定义
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export interface NotificationQueueConfig {
    maxConcurrent: number;
    dedupeWindow: number;
    errorQueuePriority: boolean;
    enableBadge: boolean;
    maxBadgeCount: number;
}
export interface QueuedNotification {
    id: string;
    type: NotificationType;
    content: string;
    title?: string;
    count: number;
    priority: number;
    duration: number;
    timestamp: number;
    retryCount: number;
    notificationInstance?: any;
}
export interface NotificationDisplayHandler {
    success: (message: string, title?: string, duration?: number, badgeCount?: number) => any;
    error: (message: string, title?: string, duration?: number, badgeCount?: number) => any;
    warning: (message: string, title?: string, duration?: number, badgeCount?: number) => any;
    info: (message: string, title?: string, duration?: number, badgeCount?: number) => any;
    updateBadge?: (notificationInstance: any, badgeCount: number) => void;
}
export interface NotificationHistoryItem {
    id: string;
    type: NotificationType;
    content: string;
    title?: string;
    count: number;
    timestamp: number;
    duration: number;
}
