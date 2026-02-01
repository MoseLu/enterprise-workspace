import { Ref } from 'vue';
/**
 * 矩阵模式逻辑
 */
export declare function useMatrixMode(resourceTree: Ref<any[]>, actions: Ref<any[]>, selectedResources: Ref<number[]>, matrixSelections: Ref<Set<string>>, composedPermissions: Ref<any[]>, resourceTreeRef: Ref<any>): {
    matrixData: globalThis.ComputedRef<any>;
    isPermissionChecked: (resourceId: number, actionId: number) => boolean;
    handleMatrixToggle: (resourceId: number, actionId: number, checked: boolean | string | number) => void;
};
