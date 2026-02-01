import { ElMessageBox } from 'element-plus';
export type BtcMessageBoxConfirmArgs = Parameters<typeof ElMessageBox.confirm>;
export type BtcMessageBoxAlertArgs = Parameters<typeof ElMessageBox.alert>;
export type BtcMessageBoxPromptArgs = Parameters<typeof ElMessageBox.prompt>;
export declare const BtcMessageBox: {
    confirm: (message: string | globalThis.VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }> | (() => VNode) | undefined, title: string | import("element-plus").ElMessageBoxOptions | undefined, options?: import("element-plus").ElMessageBoxOptions | undefined, appContext?: import("vue").AppContext | null | undefined) => Promise<import("element-plus").MessageBoxData>;
    alert: (message: string | globalThis.VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }> | (() => VNode) | undefined, title: string | import("element-plus").ElMessageBoxOptions | undefined, options?: import("element-plus").ElMessageBoxOptions | undefined, appContext?: import("vue").AppContext | null | undefined) => Promise<import("element-plus").MessageBoxData>;
    prompt: (message: string | globalThis.VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }> | (() => VNode) | undefined, title: string | import("element-plus").ElMessageBoxOptions | undefined, options?: import("element-plus").ElMessageBoxOptions | undefined, appContext?: import("vue").AppContext | null | undefined) => Promise<import("element-plus").MessageBoxData>;
};
export declare const BtcConfirm: (...args: BtcMessageBoxConfirmArgs) => Promise<import("element-plus").MessageBoxData>;
export declare const BtcAlert: (...args: BtcMessageBoxAlertArgs) => Promise<import("element-plus").MessageBoxData>;
export declare const BtcPrompt: (...args: BtcMessageBoxPromptArgs) => Promise<import("element-plus").MessageBoxData>;
export type BtcMessageBoxReturn = ReturnType<typeof ElMessageBox.confirm>;
