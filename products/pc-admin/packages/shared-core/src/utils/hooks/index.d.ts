/**
 * 消息管理组合式函数
 * 提供统一的消息发送接口
 */
/**
 * 使用消息管理器
 * @returns 消息发送方法
 */
export declare function useMessage(): {
    /**
     * 显示成功消息
     */
    success: (message: string) => void;
    /**
     * 显示错误消息
     */
    error: (message: string) => void;
    /**
     * 显示警告消息
     */
    warning: (message: string) => void;
    /**
     * 显示信息消息
     */
    info: (message: string) => void;
};
//# sourceMappingURL=index.d.ts.map