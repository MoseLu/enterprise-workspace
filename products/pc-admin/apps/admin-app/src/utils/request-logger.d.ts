/**
 * 请求日志项
 */
export interface RequestLogItem {
    userId?: number;
    username?: string;
    requestUrl: string;
    params: string;
    ip?: string;
    duration: number;
    status: 'success' | 'failed';
    createdAt: string;
}
/**
 * 请求日志队列管理器
 */
declare class RequestLogQueue {
    private queue;
    private timer;
    private readonly BATCH_SIZE;
    private readonly BATCH_INTERVAL;
    private readonly MAX_QUEUE_SIZE;
    private isServiceAvailable;
    private isPaused;
    private readonly QPS_LIMIT;
    private lastSendTime;
    private retryManager;
    private readonly FILTERED_PATHS;
    constructor();
    /**
     * 添加日志到队列
     */
    add(log: RequestLogItem): void;
    /**
     * 尝试发送（带QPS限制）
     */
    private tryFlush;
    /**
     * 批量发送日志
     */
    private flush;
    /**
     * 启动定时器
     */
    private startTimer;
    /**
   * 判断是否需要记录日志
   */
    private shouldLog;
    /**
     * 标准化参数格式，确保Java后端能正确反序列化
     */
    private normalizeParams;
    /**
     * 清理数据结构，使其适合Java反序列化
     */
    private sanitizeForJava;
    /**
     * 检查是否是请求日志数组
     */
    private isRequestLogArray;
    /**
     * 检查是否是请求日志对象
     */
    private isRequestLogObject;
    /**
     * 简化日志数组，避免复杂嵌套
     */
    private simplifyLogArray;
    /**
     * 简化日志对象
     */
    private simplifyLogObject;
    /**
     * 从URL中提取HTTP方法
     */
    private extractMethod;
    /**
     * 总结参数信息
     */
    private summarizeParams;
    /**
     * 清理属性名，确保Java兼容
     */
    private sanitizePropertyName;
    /**
     * 过滤敏感参数
     */
    private filterSensitiveParams;
    /**
     * 获取队列状态（用于调试）
     */
    getStatus(): {
        queueLength: number;
        isServiceAvailable: boolean;
        isPaused: boolean;
        lastSendTime: number;
        retryManagerStatus: any;
    };
    /**
     * 销毁实例（页面卸载时调用）
     */
    destroy(): void;
}
export declare const requestLogger: RequestLogQueue;
export {};
