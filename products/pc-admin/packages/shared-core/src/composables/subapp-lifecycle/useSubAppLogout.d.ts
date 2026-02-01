import type { SubAppContext } from './types';
/**
 * 创建退出登录函数（标准化模板）
 * @param context - 子应用上下文
 * @param _appId - 应用 ID
 * @param getAuthApi - 可选的获取 authApi 的函数，如果不提供，则使用全局 __APP_AUTH_API__
 */
export declare function createLogoutFunction(context: SubAppContext, _appId: string, getAuthApi?: () => Promise<{
    logout: () => Promise<void>;
} | undefined>): () => Promise<void>;
//# sourceMappingURL=useSubAppLogout.d.ts.map