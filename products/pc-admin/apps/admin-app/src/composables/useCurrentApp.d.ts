/**
 * 获取当前应用名称
 */
export declare function useCurrentApp(): {
    currentApp: globalThis.Ref<string, string>;
    detectCurrentApp: () => void;
};
