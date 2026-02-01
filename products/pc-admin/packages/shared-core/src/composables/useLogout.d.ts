/**
 * 通用退出登录 composable
 * 可以在所有应用中使用，支持退出后保存当前路径以便登录后返回
 */
export interface UseLogoutOptions {
    /**
     * 自定义 authApi（可选）
     * 如果不提供，会尝试从全局 __APP_AUTH_API__ 获取
     */
    authApi?: {
        logout: () => Promise<void>;
        [key: string]: any;
    };
    /**
     * 自定义清理用户信息的函数（可选）
     */
    clearUserInfo?: () => void;
    /**
     * 自定义获取 processStore 的函数（可选）
     */
    getProcessStore?: () => Promise<any>;
    /**
     * 自定义清除 cookie 的函数（可选）
     */
    deleteCookie?: (name: string, options?: any) => void;
    /**
     * 自定义获取 appStorage 的函数（可选）
     */
    getAppStorage?: () => any;
}
/**
 * 通用退出登录 composable
 *
 * @param options - 可选配置项
 * @returns logout 函数
 */
export declare function useLogout(options?: UseLogoutOptions): {
    logout: () => Promise<void>;
};
//# sourceMappingURL=useLogout.d.ts.map