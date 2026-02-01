/**
 * 路由级 Loading Composable
 * 管理覆盖单个页面/路由视图区域的 loading
 */
/**
 * 使用路由级 Loading
 * @param containerSelector 路由视图容器的选择器（可选，默认查找 router-view）
 */
export declare function useRouteLoading(containerSelector?: string): {
    show: () => void;
    hide: () => void;
    isVisible: () => boolean;
};
//# sourceMappingURL=useRouteLoading.d.ts.map