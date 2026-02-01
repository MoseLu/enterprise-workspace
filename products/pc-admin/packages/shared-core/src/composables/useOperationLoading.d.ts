/**
 * 操作级 Loading Composable
 * 管理针对单个业务操作（按钮点击、表单提交、接口请求）的 loading
 */
/**
 * 操作 Loading 选项
 */
export interface OperationLoadingOptions {
    /** 目标元素（可选，不指定则显示全屏loading） */
    target?: HTMLElement | string;
    /** 提示文字 */
    text?: string;
    /** 是否锁定屏幕（全屏loading时） */
    lock?: boolean;
}
/**
 * 使用操作级 Loading
 */
export declare function useOperationLoading(): {
    show: (options?: OperationLoadingOptions) => void;
    hide: () => void;
    isVisible: () => boolean;
};
//# sourceMappingURL=useOperationLoading.d.ts.map