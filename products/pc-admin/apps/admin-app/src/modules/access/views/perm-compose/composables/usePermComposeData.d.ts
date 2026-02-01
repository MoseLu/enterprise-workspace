/**
 * 权限组合数据管理
 */
export declare function usePermComposeData(): {
    resourceTree: globalThis.Ref<any[], any[]>;
    actions: globalThis.Ref<any[], any[]>;
    composedPermissions: globalThis.Ref<any[], any[]>;
    resourceTreeRef: globalThis.Ref<any, any>;
    resourceFilterText: globalThis.Ref<string, string>;
    applyToChildren: globalThis.Ref<boolean, boolean>;
    treeProps: {
        children: string;
        label: string;
    };
    selectedResources: globalThis.Ref<number[], number[]>;
    selectedActions: globalThis.Ref<number[], number[]>;
    matrixSelections: globalThis.Ref<Set<string> & Omit<Set<string>, keyof Set<any>>, Set<string> | (Set<string> & Omit<Set<string>, keyof Set<any>>)>;
    filterResourceNode: (value: string, data: any) => any;
    loadData: () => Promise<void>;
    handleResourceCheck: (_data: any, _checked: boolean) => void;
};
