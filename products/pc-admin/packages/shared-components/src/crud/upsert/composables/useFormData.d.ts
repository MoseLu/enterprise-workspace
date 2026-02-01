import type { FormInstance } from 'element-plus';
import type { FormItem, UpsertProps, UpsertMode } from '../types';
/**
 * 琛ㄥ崟鏁版嵁绠＄悊
 */
export declare function useFormData(props: UpsertProps): {
    formRef: globalThis.Ref<FormInstance | undefined, FormInstance | undefined>;
    formData: globalThis.Ref<Record<string, any>, Record<string, any>>;
    loadingData: globalThis.Ref<boolean, boolean>;
    mode: globalThis.Ref<UpsertMode, UpsertMode>;
    isDisabled: globalThis.ComputedRef<boolean>;
    computedItems: globalThis.ComputedRef<any[]>;
    formRules: globalThis.ComputedRef<Partial<Record<string, import("element-plus").FormItemRule | import("element-plus").FormItemRule[]>>>;
    width: globalThis.ComputedRef<string | number>;
    dialogPadding: globalThis.ComputedRef<string>;
    labelWidth: globalThis.ComputedRef<string | number>;
    labelPosition: globalThis.ComputedRef<"left" | "right" | "top">;
    gutter: globalThis.ComputedRef<number>;
    cancelText: globalThis.ComputedRef<string>;
    submitText: globalThis.ComputedRef<string>;
    title: globalThis.ComputedRef<string>;
    getComponentProps: (item: FormItem) => Record<string, any>;
};

