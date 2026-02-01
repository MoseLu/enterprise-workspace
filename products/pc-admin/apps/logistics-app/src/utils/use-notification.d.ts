/**
 * 通知管理器辅助函数
 * 提供统一的通知发送接口
 */
export declare function useNotification(): {
    /**
     * 显示成功通知
     */
    success: (message: string, title?: string) => void;
    /**
     * 显示错误通知
     */
    error: (message: string, title?: string) => void;
    /**
     * 显示警告通知
     */
    warning: (message: string, title?: string) => void;
    /**
     * 显示信息通知
     */
    info: (message: string, title?: string) => void;
};
