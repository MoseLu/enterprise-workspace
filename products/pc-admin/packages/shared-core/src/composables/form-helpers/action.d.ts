import type { BtcFormConfig } from '../useBtcForm';
export declare function useAction({ config, form }: {
    config: BtcFormConfig;
    form: any;
    Form?: any;
}): {
    setForm: (prop: string, value: any) => void;
    getForm: (prop?: string) => any;
    setOptions: (prop: string, options: any[]) => void;
    setProps: (prop: string, props: Record<string, any>) => void;
    showItem: (...props: string[]) => void;
    hideItem: (...props: string[]) => void;
    toggleItem: (prop: string, visible?: boolean) => void;
};
//# sourceMappingURL=action.d.ts.map