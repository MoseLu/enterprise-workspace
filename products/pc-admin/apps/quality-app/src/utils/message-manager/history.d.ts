/**
 * 消息历史记录管理
 */
import type { MessageHistoryItem, MessageType } from './types';
export declare class HistoryManager {
    private history;
    private maxHistorySize;
    /**
     * 添加消息到历史记录
     */
    addToHistory(id: string, type: MessageType, content: string, count: number, duration: number): void;
    /**
     * 获取消息历史记录
     */
    getMessageHistory(): MessageHistoryItem[];
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
    getHistoryByType(type: MessageType): MessageHistoryItem[];
    /**
     * 获取最近的消息
     */
    getRecentMessages(count?: number): MessageHistoryItem[];
}
