/**
 * Cookie 工具函数（共享版本）
 */
/**
 * 获取跨子域名共享的 cookie domain
 */
export declare function getCookieDomain(): string | undefined;
/**
 * 读取 cookie 值
 */
export declare function getCookie(name: string): string | null;
/**
 * 设置 cookie
 */
export declare function setCookie(name: string, value: string, days?: number, options?: {
    sameSite?: 'Strict' | 'Lax' | 'None';
    secure?: boolean;
    domain?: string;
    path?: string;
}): void;
//# sourceMappingURL=cookie.d.ts.map