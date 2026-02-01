export interface FormPlugin {
    name: string;
    value?: any;
    created?: (options: any, ctx: any) => void;
    onOpen?: (options: any, ctx: any) => void | Promise<void>;
    onSubmit?: (data: any, ctx: any) => any | Promise<any>;
    onClose?: (done: () => void, ctx: any) => void;
}
export declare function usePlugins(enablePlugin: boolean | undefined, { visible }: {
    visible: any;
}): {
    plugins: import("vue").Ref<{
        name: string;
        value?: any;
        created?: (options: any, ctx: any) => void;
        onOpen?: (options: any, ctx: any) => void | Promise<void>;
        onSubmit?: (data: any, ctx: any) => any | Promise<any>;
        onClose?: (done: () => void, ctx: any) => void;
    }[], FormPlugin[] | {
        name: string;
        value?: any;
        created?: (options: any, ctx: any) => void;
        onOpen?: (options: any, ctx: any) => void | Promise<void>;
        onSubmit?: (data: any, ctx: any) => any | Promise<any>;
        onClose?: (done: () => void, ctx: any) => void;
    }[]>;
    use: (plugin: FormPlugin) => void;
    clear: () => void;
    submit: (data: any) => Promise<any>;
};
//# sourceMappingURL=plugins.d.ts.map