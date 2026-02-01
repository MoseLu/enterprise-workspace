/**
 * 通知历史记录管理
 */
import type { NotificationHistoryItem, NotificationType } from './types';
export declare class HistoryManager {
    private history;
    private maxHistorySize;
    /**
     * 添加通知到历史记录
     */
    addToHistory(id: string, type: NotificationType, content: string, title: string | undefined, count: number, duration: number): void;
    /**
     * 获取通知历史记录
     */
    getNotificationHistory(): NotificationHistoryItem[];
    /**
     * 清空历史记录
     */
    clearHistory(): void;
    /**
     * 获取历史记录数量
     */
    getHistoryCount(): number;
    /**
     * 根据类型过滤历史记录
     */
    getHistoryByType(type: NotificationType): NotificationHistoryItem[];
    /**
     * 获取最近的通知
     */
    getRecentNotifications(count?: number): NotificationHistoryItem[];
}
