import 'nprogress/nprogress.css';
/**
 * 显示骨架屏
 */
export declare function showSkeleton(): void;
/**
 * 隐藏骨架屏
 */
export declare function hideSkeleton(): void;
/**
 * 延迟显示加载提示
 * @param ms 延迟时间（毫秒）
 * @param appName 应用名称
 */
export declare function delayHint(ms: number, appName: string): void;
/**
 * 清除延迟提示
 */
export declare function clearDelayHint(): void;
/**
 * 开始加载应用
 */
export declare function startLoading(appName: string): void;
/**
 * 加载完成
 */
export declare function finishLoading(): void;
/**
 * 加载失败
 */
export declare function loadingError(appName: string, error?: Error): void;
