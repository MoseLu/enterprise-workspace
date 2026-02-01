/**
 * 跨子域名共享存储工具
 * 使用 Cookie 实现跨子域名共享用户偏好设置
 */
/**
 * 获取跨子域名共享的 cookie domain
 * 在生产环境下返回 .bellis.com.cn，开发环境也尝试设置 domain 以便测试
 */
export declare function getCookieDomain(): string | undefined;
/**
 * 从 Cookie 同步用户偏好设置（不再写入 localStorage，偏好设置完全使用 Cookie）
 * 在子应用启动时调用，确保能够读取根域保存的偏好设置
 * 注意：此函数现在只用于触发 Cookie 读取，不再写入 localStorage
 */
export declare function syncSettingsFromCookie(): void;
/**
 * 将用户偏好设置同步到 Cookie（跨子域名共享）
 * 在根域修改用户偏好设置时调用
 */
export declare function syncSettingsToCookie(settings: Record<string, any>): void;
/**
 * 将用户信息同步到 Cookie（跨子域名共享）
 * 在根域修改用户信息时调用
 */
export declare function syncUserToCookie(user: Record<string, any>): void;
/**
 * 清除跨子域名共享的 Cookie
 */
export declare function clearCrossDomainCookies(): void;
//# sourceMappingURL=cross-domain.d.ts.map