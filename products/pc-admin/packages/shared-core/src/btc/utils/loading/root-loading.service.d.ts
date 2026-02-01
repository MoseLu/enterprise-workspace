/**
 * 全局根级 Loading 服务
 * 参考 cool-admin 的简单实现，通过操作 HTML 中的 #Loading 元素来显示/隐藏
 * 支持切换标题和根据偏好设置切换 loading 样式（圆圈或彩色四点）
 */
/**
 * 全局根级 Loading 服务
 * 简化版实现，直接操作 HTML 中的 #Loading 元素
 */
declare class RootLoadingService {
    constructor();
    /**
     * 显示全局根级 Loading
     * @param text 提示文字（可选）
     */
    show(text?: string): void;
    /**
     * 隐藏全局根级 Loading
     */
    hide(): void;
    /**
     * 更新提示文字
     * @param text 新的提示文字
     */
    updateText(text: string): void;
}
export declare const rootLoadingService: RootLoadingService;
export {};
//# sourceMappingURL=root-loading.service.d.ts.map