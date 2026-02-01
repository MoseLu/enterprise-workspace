/**
 * 确保路径以 / 开头
 */
export declare function ensureLeadingSlash(value: string): string;
/**
 * 获取当前主机路径（包含 pathname、search、hash）
 */
export declare function getCurrentHostPath(): string;
/**
 * 规范化到主机路径（添加应用前缀）
 * @param relativeFullPath 相对路径
 * @param basePath 应用基础路径（如 /finance）
 */
export declare function normalizeToHostPath(relativeFullPath: string, basePath: string): string;
/**
 * 推导初始子路由（支持子域名和路径前缀）
 * @param appId 应用 ID（如 'finance'）
 * @param basePath 应用基础路径（如 '/finance'）
 */
export declare function deriveInitialSubRoute(appId: string, basePath: string): string;
/**
 * 从主机路径提取子路由
 * @param appId 应用 ID（如 'finance'）
 * @param basePath 应用基础路径（如 '/finance'）
 */
export declare function extractHostSubRoute(appId: string, basePath: string): string;
/**
 * 移除 Loading 元素
 */
export declare function removeLoadingElement(): void;
/**
 * 清理导航标记
 */
export declare function clearNavigationFlag(): void;
//# sourceMappingURL=utils.d.ts.map