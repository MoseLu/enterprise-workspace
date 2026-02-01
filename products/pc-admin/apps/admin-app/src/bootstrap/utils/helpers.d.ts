/**
 * 辅助函数模块
 * 提供启动过程中的各种辅助函数
 */
/**
 * 延迟执行函数
 */
export declare const delay: (ms: number) => Promise<void>;
/**
 * 安全执行函数，捕获错误
 */
export declare const safeExecute: <T>(fn: () => Promise<T>, errorMessage?: string) => Promise<T | null>;
