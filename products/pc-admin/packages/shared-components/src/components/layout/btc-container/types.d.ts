/**
 * 容器组件类型定义
 */
export interface BtcContainerProps {
    /**
     * 子组件数量（自动计算，通常不需要手动设置）
     */
    childCount?: number;
    /**
     * 是否启用响应式布局
     */
    responsive?: boolean;
    /**
     * 响应式断点（px）
     */
    breakpoint?: number;
    /**
     * 组件间距（px）
     */
    gap?: number;
    /**
     * 自定义样式类
     */
    class?: string;
    /**
     * 自定义样式
     */
    style?: string | Record<string, any>;
}
