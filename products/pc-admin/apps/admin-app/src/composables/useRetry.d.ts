/**
 * 指数退避重试机制
 */
export interface RetryConfig {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    jitter?: boolean;
}
export interface RetryState {
    retryCount: number;
    isRetrying: boolean;
    lastError: Error | null;
    nextRetryDelay: number;
}
/**
 * 指数退避重试Hook
 */
export declare function useRetry(config?: RetryConfig): {
    state: Readonly<globalThis.Ref<{
        readonly retryCount: number;
        readonly isRetrying: boolean;
        readonly lastError: Error | null;
        readonly nextRetryDelay: number;
    }, {
        readonly retryCount: number;
        readonly isRetrying: boolean;
        readonly lastError: Error | null;
        readonly nextRetryDelay: number;
    }>>;
    executeWithRetry: <T>(operation: () => Promise<T>, customConfig?: Partial<RetryConfig>) => Promise<T>;
    reset: () => void;
    getStatus: () => {
        config: {
            maxRetries: number;
            baseDelay: number;
            maxDelay: number;
            backoffFactor: number;
            jitter: boolean;
        };
        retryCount: number;
        isRetrying: boolean;
        lastError: Error | null;
        nextRetryDelay: number;
    };
};
/**
 * 创建HTTP请求重试器
 */
export declare function createHttpRetry(config?: RetryConfig): {
    retryRequest: <T>(requestFn: () => Promise<T>, customConfig?: Partial<RetryConfig>) => Promise<T>;
    state: Readonly<globalThis.Ref<{
        readonly retryCount: number;
        readonly isRetrying: boolean;
        readonly lastError: Error | null;
        readonly nextRetryDelay: number;
    }, {
        readonly retryCount: number;
        readonly isRetrying: boolean;
        readonly lastError: Error | null;
        readonly nextRetryDelay: number;
    }>>;
    reset: () => void;
    getStatus: () => {
        config: {
            maxRetries: number;
            baseDelay: number;
            maxDelay: number;
            backoffFactor: number;
            jitter: boolean;
        };
        retryCount: number;
        isRetrying: boolean;
        lastError: Error | null;
        nextRetryDelay: number;
    };
};
/**
 * 全局重试配置
 */
export declare const RETRY_CONFIGS: {
    readonly fast: {
        readonly maxRetries: 2;
        readonly baseDelay: 500;
        readonly maxDelay: 2000;
        readonly backoffFactor: 2;
        readonly jitter: true;
    };
    readonly standard: {
        readonly maxRetries: 3;
        readonly baseDelay: 1000;
        readonly maxDelay: 10000;
        readonly backoffFactor: 2;
        readonly jitter: true;
    };
    readonly slow: {
        readonly maxRetries: 5;
        readonly baseDelay: 2000;
        readonly maxDelay: 30000;
        readonly backoffFactor: 2;
        readonly jitter: true;
    };
    readonly log: {
        readonly maxRetries: 3;
        readonly baseDelay: 1000;
        readonly maxDelay: 5000;
        readonly backoffFactor: 1.5;
        readonly jitter: true;
    };
};
