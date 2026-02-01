/**
 * BtcNotification 通知管理器
 * 基于 Element Plus 的 ElNotification 封装，支持重复消息徽标计数功能
 */
export declare const BtcNotification: {
    success: (message: string, options?: any) => void;
    warning: (message: string, options?: any) => void;
    info: (message: string, options?: any) => void;
    error: (message: string, options?: any) => void;
    closeAll: () => void;
};
