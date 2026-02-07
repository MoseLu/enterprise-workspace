/**
 * 通知徽章管理
 */
import type { QueuedNotification } from './types';
export declare class BadgeManager {
    private countdownTimers;
    /**
     * 开始徽章递减动画
     */
    startCountdownAnimation(notification: QueuedNotification, updateBadge: (notificationInstance: any, badgeCount: number) => void, closeNotificationBox: (notification: QueuedNotification) => void): void;
    /**
     * 停止徽章递减动画
     */
    stopCountdownAnimation(notificationId: string): void;
    /**
     * 清理所有定时器
     */
    cleanup(): void;
}
