export interface BtcFormConfig {
    title?: string;
    height?: string;
    width?: string;
    props?: Record<string, any>;
    on?: Record<string, any>;
    op?: {
        hidden?: boolean;
        saveButtonText?: string;
        closeButtonText?: string;
        justify?: string;
        buttons?: any[];
    };
    dialog?: Record<string, any>;
    items: any[];
    form?: Record<string, any>;
    _data?: Record<string, any>;
}
export declare function useBtcForm(): {
    Form: import("vue").Ref<any, any>;
    config: {
        title?: string;
        height?: string;
        width?: string;
        props?: Record<string, any>;
        on?: Record<string, any>;
        op?: {
            hidden?: boolean;
            saveButtonText?: string;
            closeButtonText?: string;
            justify?: string;
            buttons?: any[];
        };
        dialog?: Record<string, any>;
        items: any[];
        form?: Record<string, any>;
        _data?: Record<string, any>;
    };
    form: Record<string, any>;
    visible: import("vue").Ref<boolean, boolean>;
    saving: import("vue").Ref<boolean, boolean>;
    loading: import("vue").Ref<boolean, boolean>;
    disabled: import("vue").Ref<boolean, boolean>;
};
//# sourceMappingURL=useBtcForm.d.ts.map