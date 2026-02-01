import { type ComputedRef, type Ref } from 'vue';
/**
 * 内容挂载类型
 */
export type ContentMountType = 'main-app' | 'sub-app';
/**
 * 内容挂载状态
 */
export interface ContentMountState {
    /** 当前挂载类型（一次判断确定） */
    type: ComputedRef<ContentMountType>;
    /** 是否显示主应用路由视图 */
    showMainApp: ComputedRef<boolean>;
    /** 是否显示子应用挂载点 */
    showSubApp: ComputedRef<boolean>;
    /** 子应用挂载点引用（用于设置 ref） */
    subappViewportRef: Ref<HTMLElement | null>;
}
/**
 * 统一的内容挂载状态管理
 *
 * 一次判断确定状态，避免多次判断
 * 统一处理开发环境、生产环境、qiankun 模式、layout-app 模式、独立运行模式
 */
export declare function useContentMount(): ContentMountState;
//# sourceMappingURL=useContentMount.d.ts.map