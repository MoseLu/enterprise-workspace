/**
 * 路由级 Loading 服务
 * 管理覆盖单个页面/路由视图区域的 loading，自动在路由切换时显示
 */
/**
 * 路由级 Loading 服务
 * 单例模式，管理路由级别的 loading
 */
declare class RouteLoadingService {
    private instance;
    /**
     * 查找路由视图容器
     */
    private findContainer;
    /**
     * 创建 Loading 元素
     */
    private createLoadingElement;
    /**
     * 查找骨架屏元素
     */
    private findSkeleton;
    /**
     * 检查是否有应用级别loading正在显示
     */
    private isAppLoadingVisible;
    /**
     * 显示路由 Loading
     */
    show(): void;
    /**
     * 在指定容器中显示 Loading
     */
    private showLoadingInContainer;
    /**
     * 隐藏路由 Loading
     */
    hide(): void;
    /**
     * 检查是否正在显示
     */
    isVisible(): boolean;
}
export declare const routeLoadingService: RouteLoadingService;
export {};
//# sourceMappingURL=route-loading.service.d.ts.map