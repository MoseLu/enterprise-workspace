/**
 * Cookie 工具函数
 */
/**
 * 删除 cookie
 * 注意：如果 cookie 是 HttpOnly 的，前端无法删除，需要后端通过 Set-Cookie header 清除
 * @param name cookie 名称
 * @param options 额外选项（domain 等）
 */
export declare function deleteCookie(name: string, options?: {
    domain?: string;
    path?: string;
}): void;
/**
 * 获取 cookie 值
 * @param name cookie 名称
 * @returns cookie 值，如果不存在则返回 null
 */
export declare function getCookie(name: string): string | null;
/**
 * 设置 cookie
 * @param name cookie 名称
 * @param value cookie 值
 * @param days 过期天数，默认为 7 天
 * @param options 额外选项
 */
export declare function setCookie(name: string, value: string, days?: number, options?: {
    sameSite?: 'Strict' | 'Lax' | 'None';
    secure?: boolean;
    domain?: string;
    path?: string;
}): void;
//# sourceMappingURL=index.d.ts.map