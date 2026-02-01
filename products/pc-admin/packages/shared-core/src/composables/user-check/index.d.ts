/**
 * 用户检查轮询统一接口
 */
import type { UserCheckData } from './useUserCheck';
/**
 * 启动用户检查轮询
 * @param forceImmediate 是否强制立即检查（登录后需要立即调用一次，获取最新的剩余时间）
 * 在登录成功后立即调用时，应传递 forceImmediate = true
 * 在应用启动时检查到已登录时调用，应传递 forceImmediate = false（使用存储的剩余时间）
 */
export declare function startUserCheckPolling(forceImmediate?: boolean): void;
/**
 * 检查是否已登录，如果已登录则启动轮询
 * 在应用启动时调用
 */
export declare function startUserCheckPollingIfLoggedIn(): void;
/**
 * 停止用户检查轮询
 * 在退出登录时调用
 */
export declare function stopUserCheckPolling(): void;
/**
 * 获取当前用户检查数据
 */
export declare function getUserCheckData(): {
    credentialExpireTime: string | null;
    sessionData: Partial<UserCheckData> | null;
};
//# sourceMappingURL=index.d.ts.map