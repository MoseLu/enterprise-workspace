/**
 * 通知管理器配置
 */
import type { NotificationQueueConfig } from './types';
export declare const DEFAULT_CONFIG: NotificationQueueConfig;
export declare const NOTIFICATION_PRIORITIES: {
    error: number;
    warning: number;
    success: number;
    info: number;
};
export declare const NOTIFICATION_TYPE_CONFIG: {
    success: {
        duration: number;
        icon: string;
    };
    error: {
        duration: number;
        icon: string;
    };
    warning: {
        duration: number;
        icon: string;
    };
    info: {
        duration: number;
        icon: string;
    };
};
