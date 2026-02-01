/**
 * 用户信息接口
 */
export interface UserInfo {
    id: string | number;
    name?: string;
    username: string;
    email?: string;
    avatar?: string;
    [key: string]: any;
}
/**
 * 用户相关的composable
 */
export declare function useUser(): {
    userInfo: globalThis.ComputedRef<{
        [x: string]: any;
        id: string | number;
        name?: string;
        username: string;
        email?: string;
        avatar?: string;
    }>;
    getUserInfo: () => UserInfo | null;
    setUserInfo: (user: UserInfo) => void;
    clearUserInfo: () => void;
    getUserId: () => string | number | undefined;
    getUserName: () => string | undefined;
    isLoggedIn: globalThis.ComputedRef<boolean>;
};
