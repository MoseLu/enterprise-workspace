/**
 * 通知生命周期管理
 */
import type { QueuedNotification, NotificationDisplayHandler } from './types';
export declare class LifecycleManager {
    private displayHandler;
    constructor(displayHandler: NotificationDisplayHandler);
    /**
     * 设置通知生命周期
     */
    setupNotificationLifecycle(notification: QueuedNotification): void;
    /**
     * 开始递减动画
     */
    private startCountdownAnimation;
    /**
     * 关闭通知框
     */
    private closeNotificationBox;
}
