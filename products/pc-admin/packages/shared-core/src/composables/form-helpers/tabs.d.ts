import type { BtcFormConfig } from '../useBtcForm';
export declare function useTabs({ config, Form }: {
    config: BtcFormConfig;
    Form: any;
}): {
    active: import("vue").Ref<string | undefined, string | undefined>;
    list: import("vue").ComputedRef<any>;
    isLoaded: (value: any) => any;
    onLoad: (value: any) => void;
    get: () => any;
    set: (data: any) => void;
    change: (value: any, isValid?: boolean) => Promise<void>;
    clear: () => void;
    mergeProp: (item: any) => void;
    toGroup: (opts: {
        config: BtcFormConfig;
        prop: string;
        refs: any;
    }) => void;
};
//# sourceMappingURL=tabs.d.ts.map