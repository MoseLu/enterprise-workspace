/**
 * 用户检查接口调用
 */
export interface UserCheckData {
    status: 'valid' | 'expired' | 'soon_expire' | 'unauthorized';
    serverCurrentTime: string;
    credentialExpireTime: string;
    remainingTime: number;
    details: string;
}
export interface UserCheckResult {
    isValid: boolean;
    data?: UserCheckData;
    remainingTime?: number;
}
/**
 * 调用用户检查接口
 * @returns 用户检查结果
 */
export declare function checkUser(): Promise<UserCheckResult | null>;
//# sourceMappingURL=useUserCheck.d.ts.map