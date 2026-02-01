/**
 * 用户检查数据存储
 */
import type { UserCheckData } from './useUserCheck';
/**
 * 存储用户检查数据
 * @param data 用户检查数据
 */
export declare function storeUserCheckData(data: UserCheckData): void;
/**
 * 从 cookie 获取 credentialExpireTime
 */
export declare function getCredentialExpireTime(): string | null;
/**
 * 从 sessionStorage 获取用户检查数据
 */
export declare function getUserCheckDataFromStorage(): Partial<UserCheckData> | null;
/**
 * 清除用户检查数据
 */
export declare function clearUserCheckData(): void;
//# sourceMappingURL=useUserCheckStorage.d.ts.map