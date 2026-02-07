/**
 * 消息徽章管理
 */
import type { QueuedMessage } from './types';
export declare class BadgeManager {
    private countdownTimers;
    /**
     * 开始徽章递减动画
     */
    startCountdownAnimation(message: QueuedMessage, updateBadge: (messageInstance: any, badgeCount: number) => void, closeMessageBox: (message: QueuedMessage) => void): void;
    /**
     * 停止徽章递减动画
     */
    stopCountdownAnimation(messageId: string): void;
    /**
     * 清理所有定时器
     */
    cleanup(): void;
}
