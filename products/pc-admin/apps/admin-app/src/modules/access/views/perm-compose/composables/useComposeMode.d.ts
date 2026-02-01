import { Ref } from 'vue';
/**
 * 组合模式逻辑
 */
export declare function useComposeMode(actions: Ref<any[]>, selectedResources: Ref<number[]>, selectedActions: Ref<number[]>, resourceTreeRef: Ref<any>, composedPermissions: Ref<any[]>): {
    composeCount: globalThis.ComputedRef<number>;
    canCompose: globalThis.ComputedRef<boolean>;
    handleCompose: (composing: Ref<boolean>) => Promise<void>;
};
