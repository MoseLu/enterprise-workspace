/**
 * 跨应用重定向工具
 * 用于处理登录后跳转到子应用的逻辑
 */
/**
 * 清除重定向相关的缓存（localStorage 和 cookie）
 * 用于清除之前保存的重定向路径和相关cookie
 */
export declare function clearRedirectCache(): void;
/**
 * 清除重定向 Cookie
 * 用于处理 clearRedirectCookie=1 参数，清理重定向相关的 Cookie 缓存
 * 支持跨子域名清理（使用 getCookieDomain()）
 */
export declare function clearRedirectCookie(): void;
/**
 * 获取当前完整路径（转换为统一的路径格式）
 * 例如：
 * - 在 admin.bellis.com.cn/user/list 或 localhost:8081/user/list -> /admin/user/list
 * - 在 bellis.com.cn/admin/user/list -> /admin/user/list
 * - 在 bellis.com.cn/ -> /
 *
 * @returns 统一的路径格式，例如 '/admin/user/list' 或 '/'
 */
export declare function getCurrentUnifiedPath(): Promise<string>;
/**
 * 同步版本的 getCurrentUnifiedPath（向后兼容）
 * 使用同步方式，但可能在某些环境下不够准确
 */
export declare function getCurrentUnifiedPathSync(): string;
/**
 * 保存退出前的路径
 * 应该在退出登录时调用，保存当前路径以便登录后返回
 */
export declare function saveLogoutRedirectPath(): Promise<void>;
/**
 * 获取并清除保存的退出前路径
 * 应该在登录成功后调用，获取保存的路径并清除
 *
 * @returns 保存的路径，如果没有则返回 null
 */
export declare function getAndClearLogoutRedirectPath(): string | null;
/**
 * 验证并标准化重定向路径
 * 对 oauth_callback 参数进行解码、合法性校验和安全防护
 *
 * @param rawPath - 原始路径（可能是 URL 编码的）
 * @param defaultPath - 默认路径（如果验证失败或为空时使用）
 * @returns 标准化后的相对路径
 */
export declare function validateAndNormalizeRedirectPath(rawPath: string | null | undefined, defaultPath?: string): string;
/**
 * 获取目标应用信息
 * 解析回调路径所属的微应用（主应用或子应用）
 *
 * @param path - 回调路径，例如 '/workbench/todo' 或 '/logistics/inventory/info'
 * @returns 应用信息对象，包含应用类型、路由前缀和应用地址
 */
export declare function getTargetAppInfo(path: string): Promise<{
    appType: 'main' | 'sub';
    appRoute: string;
    appOrigin?: string;
}>;
/**
 * 获取当前应用信息
 * 根据当前路径或子域名判断当前所在的应用（主应用或子应用）
 *
 * @returns 当前应用信息对象，包含应用类型、路由前缀和应用地址
 */
export declare function getCurrentAppInfo(): Promise<{
    appType: 'main' | 'sub';
    appRoute: string;
    appOrigin?: string;
}>;
/**
 * 判断是否为跨应用跳转
 * qiankun 的「跨应用」不仅是跨域名，还包括「主应用↔子应用、子应用↔子应用」
 *
 * @param targetPath - 目标路径，例如 '/workbench/todo' 或 '/logistics/inventory/info'
 * @returns 如果是跨应用跳转，返回 true；否则返回 false
 */
export declare function isCrossAppRedirect(targetPath: string): Promise<boolean>;
/**
 * 构建退出登录的 URL，包含当前路径作为 oauth_callback 参数
 * 用于在退出登录时跳转到登录页，并传递当前路径以便登录后返回
 * 支持多参数URL，保留原有的查询参数
 *
 * @param baseLoginUrl - 登录页的基础 URL，例如 '/login' 或 'https://bellis.com.cn/login'
 * @returns 包含 oauth_callback 参数的登录页 URL
 */
export declare function buildLogoutUrl(baseLoginUrl?: string): Promise<string>;
/**
 * 构建退出登录的 URL，使用完整URL作为 oauth_callback 参数
 * 用于跨子域名场景，确保登录后能精确跳转到对应子域名和页面
 * 根据当前环境（development/preview/test/production）构建正确的完整URL
 * 支持多参数URL，保留原有的查询参数
 *
 * @param baseLoginUrl - 登录页的基础 URL，例如 '/login' 或 'https://bellis.com.cn/login'
 * @returns 包含完整URL作为oauth_callback参数的登录页 URL
 */
export declare function buildLogoutUrlWithFullUrl(baseLoginUrl?: string): Promise<string>;
/**
 * 处理跨应用重定向
 * 支持完整URL和路径格式两种redirect参数
 * - 如果redirect是完整URL（以http://或https://开头），直接跳转
 * - 如果redirect是路径格式（以/开头），使用现有的跨应用重定向逻辑
 *
 * @param redirectPath - 重定向路径或完整URL，例如 '/admin/xxx'、'/' 或 'https://admin.bellis.com.cn/user/list?page=1'
 * @param router - Vue Router实例（可选，保留参数以保持兼容性，但当前未使用）
 * @returns 如果需要跨应用跳转，返回true；否则返回false
 */
export declare function handleCrossAppRedirect(redirectPath: string, _router?: any): Promise<boolean>;
