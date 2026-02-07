/**
 * 消息管理器配置
 */
import type { MessageQueueConfig } from './types';
export declare const DEFAULT_CONFIG: MessageQueueConfig;
export declare const MESSAGE_PRIORITIES: {
    readonly error: 100;
    readonly warning: 50;
    readonly info: 0;
    readonly success: 0;
};
export declare const MESSAGE_TYPE_CONFIG: {
    readonly success: {
        readonly icon: "success";
        readonly color: "#67c23a";
    };
    readonly error: {
        readonly icon: "error";
        readonly color: "#f56c6c";
    };
    readonly warning: {
        readonly icon: "warning";
        readonly color: "#e6a23c";
    };
    readonly info: {
        readonly icon: "info";
        readonly color: "#909399";
    };
};
