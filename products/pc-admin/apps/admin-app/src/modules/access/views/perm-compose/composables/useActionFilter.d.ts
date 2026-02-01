import { Ref } from 'vue';
/**
 * 操作过滤逻辑
 */
export declare function useActionFilter(actions: Ref<any[]>, selectedResources: Ref<number[]>, resourceTreeRef: Ref<any>, resourceTree: Ref<any[]>): {
    filteredActions: globalThis.ComputedRef<any[]>;
    isActionSupported: (actionId: number) => boolean;
    getActionSupportCount: (actionId: number) => any;
    isActionSupportedByResource: (resourceId: number, actionId: number) => any;
};
