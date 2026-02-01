/**
 * 消息处理器模块
 * 负责管理 BtcMessage 的显示、徽章创建和生命周期管理
 */
import type { MessageHandler } from 'element-plus';
export type ExtendedMessageInstance = MessageHandler & {
    messageContainer?: HTMLElement | null;
    badgeApp?: any | null;
    badgeElement?: HTMLElement | null;
    badgeResizeObserver?: ResizeObserver | null;
    badgeMutationObserver?: MutationObserver | null;
    badgePositionObserver?: MutationObserver | null;
    badgePositionInterval?: number | null;
    badgeBodyMutationObserver?: MutationObserver | null;
    messageId?: string;
};
/**
 * 初始化全局消息观察器
 */
export declare const initGlobalMessageObserver: () => void;
/**
 * 为消息创建徽章
 */
export declare const createBadgeForMessage: (messageInstance: any, badgeCount: number, messageElement: HTMLElement) => void;
/**
 * 设置徽章位置观察器
 */
export declare const setupBadgePositionObserver: (extendedInstance: ExtendedMessageInstance, messageElement: HTMLElement) => void;
/**
 * 更新徽章位置
 */
export declare const updateBadgePosition: (extendedInstance: ExtendedMessageInstance, _messageElement: HTMLElement) => void;
/**
 * 处理消息显示
 */
export declare const handleMessage: (type: "success" | "error" | "warning" | "info", message: string, _duration?: number, badgeCount?: number) => any;
/**
 * 更新徽章数字
 */
export declare const updateBadge: (messageInstance: any, badgeCount: number) => void;
/**
 * 清理徽章
 */
export declare const cleanupBadge: (messageInstance: any) => void;
/**
 * 创建消息处理器
 */
export declare const createMessageHandler: () => {
    success: (message: string, _duration?: number, badgeCount?: number) => any;
    error: (message: string, _duration?: number, badgeCount?: number) => any;
    warning: (message: string, _duration?: number, badgeCount?: number) => any;
    info: (message: string, _duration?: number, badgeCount?: number) => any;
    updateBadge: (messageInstance: any, badgeCount: number) => void;
    cleanupBadge: (messageInstance: any) => void;
};
/**
 * 初始化消息管理器
 */
export declare const initMessageManager: (messageHandler: any) => void;
