/**
 * Form Hook 工具
 * 用于表单数据的绑定和提交转换
 * 完整实现 cool-admin 的 form-hook，包含所有8种内置转换器
 */
export interface HookContext {
    method: 'bind' | 'submit';
    form: Record<string, any>;
    prop?: string;
}
export type HookFn = (value: any, ctx: HookContext) => any;
export declare const format: {
    [key: string]: HookFn;
};
declare const formHookDefault: {
    bind(data: any): void;
    submit(data: any): void;
};
export declare function registerFormHook(name: string, fn: HookFn): void;
export default formHookDefault;
export declare const formHook: {
    bind(data: any): void;
    submit(data: any): void;
};
//# sourceMappingURL=index.d.ts.map