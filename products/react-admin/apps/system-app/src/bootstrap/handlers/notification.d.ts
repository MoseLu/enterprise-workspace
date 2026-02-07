/**
 * 通知处理器模块
 * 负责管理 ElNotification 的显示、徽章创建和生命周期管理
 */
export interface ExtendedNotificationInstance {
    notificationContainer?: HTMLElement | null;
    badgeApp?: any | null;
    badgeElement?: HTMLElement | null;
    badgeResizeObserver?: ResizeObserver | null;
    badgeMutationObserver?: MutationObserver | null;
    badgePositionObserver?: MutationObserver | null;
    badgePositionInterval?: number | null;
    badgeBodyMutationObserver?: MutationObserver | null;
    notificationId?: string;
}
/**
 * 初始化全局通知观察器
 */
export declare const initGlobalNotificationObserver: () => void;
/**
 * 为通知创建徽章
 */
export declare const createBadgeForNotification: (notificationInstance: any, badgeCount: number, notificationElement: HTMLElement) => void;
/**
 * 设置通知徽章位置观察器
 */
export declare const setupNotificationBadgePositionObserver: (extendedInstance: ExtendedNotificationInstance, notificationElement: HTMLElement) => void;
/**
 * 更新通知徽章位置
 */
export declare const updateNotificationBadgePosition: (extendedInstance: ExtendedNotificationInstance, _notificationElement: HTMLElement) => void;
/**
 * 处理通知显示
 */
export declare const handleNotification: (type: "success" | "error" | "warning" | "info", title: string, message: string, _duration?: number, badgeCount?: number) => import("element-plus").NotificationHandle;
/**
 * 更新通知徽章数字
 */
export declare const updateNotificationBadge: (notificationInstance: any, badgeCount: number) => void;
/**
 * 清理通知徽章
 */
export declare const cleanupNotificationBadge: (notificationInstance: any) => void;
/**
 * 创建通知处理器
 */
export declare const createNotificationHandler: () => {
    success: (title: string, message: string, _duration?: number, badgeCount?: number) => import("element-plus").NotificationHandle;
    error: (title: string, message: string, _duration?: number, badgeCount?: number) => import("element-plus").NotificationHandle;
    warning: (title: string, message: string, _duration?: number, badgeCount?: number) => import("element-plus").NotificationHandle;
    info: (title: string, message: string, _duration?: number, badgeCount?: number) => import("element-plus").NotificationHandle;
    updateBadge: (notificationInstance: any, badgeCount: number) => void;
    cleanupBadge: (notificationInstance: any) => void;
};
/**
 * 初始化通知管理器
 */
export declare const initNotificationManager: (notificationHandler: any) => void;
