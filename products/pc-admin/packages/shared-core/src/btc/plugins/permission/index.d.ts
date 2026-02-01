import type { App } from 'vue';
/**
 * 权限指令插件
 * 用于控制元素的显示/隐藏基于用户权限
 */
export interface PermissionPluginOptions {
    /**
     * 获取用户权限列表的函数
     * @returns 用户权限列表
     */
    getUserPermissions?: () => string[];
    /**
     * 权限检查函数
     * @param permission 权限标识
     * @param userPermissions 用户权限列表
     * @returns 是否有权限
     */
    checkPermission?: (permission: string, userPermissions: string[]) => boolean;
}
/**
 * 创建权限插件
 */
export declare function createPermissionPlugin(options?: PermissionPluginOptions): {
    install(app: App): void;
};
/**
 * 权限检查 composable
 */
export declare function usePermission(): {
    checkPermission: (permission: string) => boolean;
};
export default createPermissionPlugin;
//# sourceMappingURL=index.d.ts.map