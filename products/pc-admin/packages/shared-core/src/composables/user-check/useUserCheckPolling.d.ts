/**
 * 用户检查轮询管理器
 */
type PollingCallback = (data: {
    remainingTime: number;
    status: string;
}) => void;
/**
 * 启动用户检查轮询
 * @param callback 每次检查后的回调函数
 * @param forceImmediate 是否强制立即检查（登录后需要立即调用一次）
 */
export declare function startPolling(callback?: PollingCallback, forceImmediate?: boolean): void;
/**
 * 停止用户检查轮询
 */
export declare function stopPolling(): void;
/**
 * 检查是否正在轮询
 */
export declare function isPollingActive(): boolean;
export {};
//# sourceMappingURL=useUserCheckPolling.d.ts.map