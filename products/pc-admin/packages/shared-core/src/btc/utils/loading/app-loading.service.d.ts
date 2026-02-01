/**
 * 应用级 Loading 服务
 * 管理覆盖单个应用容器的 loading，仅遮挡当前应用区域，不影响其他应用
 */
/**
 * 应用级 Loading 服务
 * 单例模式，管理多个应用的 loading 实例
 */
declare class AppLoadingService {
    private instances;
    constructor();
    /**
     * 查找或创建应用的容器元素
     */
    private findContainer;
    /**
     * 更新 Loading spinner 样式
     */
    private updateLoadingSpinner;
    /**
     * 获取 Spinner HTML
     */
    private getSpinnerHTML;
    /**
     * 创建 Loading 元素
     * @param appDisplayName 应用显示名称（如"财务模块"）
     */
    private createLoadingElement;
    /**
     * 查找或创建骨架屏元素
     */
    private findOrCreateSkeleton;
    /**
     * 显示应用级 Loading
     * @param appDisplayName 应用显示名称（如"财务模块"，用于显示在loading中）
     * @param container 应用容器（可选，默认查找 #subapp-viewport，即使不存在也会显示，因为使用fixed定位）
     */
    show(appDisplayName: string, container?: HTMLElement): void;
    /**
     * 隐藏指定应用的 Loading
     * @param appDisplayName 应用显示名称（如"财务模块"）
     */
    hide(appDisplayName: string): void;
    /**
     * 隐藏所有应用的 Loading
     */
    hideAll(): void;
    /**
     * 销毁指定应用的实例
     */
    destroy(appName: string): void;
    /**
     * 销毁所有实例
     */
    destroyAll(): void;
    /**
     * 检查是否有任何应用级别loading正在显示
     * 供其他服务（如RouteLoadingService）检查，确保互斥
     */
    isAnyVisible(): boolean;
}
export declare const appLoadingService: AppLoadingService;
export {};
//# sourceMappingURL=app-loading.service.d.ts.map