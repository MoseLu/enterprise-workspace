/**
 * 资源加载器
 * 实现 CDN -> OSS -> 本地的三级降级策略
 * 支持当前应用资源 (/assets/) 和布局应用资源 (/assets/layout/)
 */
export interface ResourceLoaderOptions {
    /**
     * 应用名称，如 'admin-app'
     */
    appName: string;
    /**
     * 超时时间（毫秒），默认 5000ms
     */
    timeout?: number;
    /**
     * CDN 域名，默认从 window.__BTC_CDN_CONFIG__ 读取
     */
    cdnDomain?: string;
    /**
     * OSS 域名，默认从 window.__BTC_CDN_CONFIG__ 读取
     */
    ossDomain?: string;
}
interface ResourceSource {
    url: string;
    type: 'cdn' | 'oss' | 'local';
}
/**
 * 加载资源（带降级策略）
 */
export declare function loadResource(url: string, options: ResourceLoaderOptions): Promise<Response>;
/**
 * 获取资源加载器配置
 */
export declare function getResourceLoaderConfig(): {
    cacheSize: number;
    cacheEntries: {
        url: string;
        source: ResourceSource;
        timestamp: number;
        failed: boolean;
    }[];
};
/**
 * 清除资源加载器缓存
 */
export declare function clearResourceLoaderCache(): void;
/**
 * 为图片元素设置降级策略
 */
export declare function setupImageFallback(img: HTMLImageElement, originalSrc: string, options: ResourceLoaderOptions): void;
/**
 * 为 CSS 中的 url() 资源设置降级策略
 * 注意：这个方法需要在构建时或运行时通过 CSS 变量或内联样式实现
 * 这里提供一个工具函数，供应用代码使用
 */
export declare function getCssUrlFallback(originalUrl: string, options: ResourceLoaderOptions): string;
/**
 * 初始化资源加载器（在浏览器环境中）
 * 注意：资源加载器只负责降级（CDN -> OSS -> 本地），不负责 URL 转换
 * URL 转换在构建时完成（通过 cdnAssetsPlugin 和 renderChunk 插件）
 */
export declare function initResourceLoader(_options?: Partial<ResourceLoaderOptions>): void;
export {};
//# sourceMappingURL=resource-loader.d.ts.map