export interface ProcessItem {
    path: string;
    fullPath: string;
    name?: string;
    meta: {
        label?: string;
        keepAlive?: boolean;
        isHome?: boolean;
        process?: boolean;
    };
    active?: boolean;
    app?: string;
}
/**
 * 获取当前应用名称（使用统一的 tabRegistry）
 */
export declare function getCurrentAppFromPath(path: string): string;
/**
 * 页面标签（Process）Store
 */
export declare const useProcessStore: import("pinia").StoreDefinition<"process", Pick<{
    list: globalThis.Ref<{
        path: string;
        fullPath: string;
        name?: string;
        meta: {
            label?: string;
            keepAlive?: boolean;
            isHome?: boolean;
            process?: boolean;
        };
        active?: boolean;
        app?: string;
    }[], ProcessItem[] | {
        path: string;
        fullPath: string;
        name?: string;
        meta: {
            label?: string;
            keepAlive?: boolean;
            isHome?: boolean;
            process?: boolean;
        };
        active?: boolean;
        app?: string;
    }[]>;
    add: (data: ProcessItem) => void;
    remove: (index: number) => void;
    close: () => void;
    set: (data: ProcessItem[]) => void;
    clear: () => void;
    clearCurrentApp: (app: string) => void;
    getAppTabs: (app: string) => {
        path: string;
        fullPath: string;
        name?: string;
        meta: {
            label?: string;
            keepAlive?: boolean;
            isHome?: boolean;
            process?: boolean;
        };
        active?: boolean;
        app?: string;
    }[];
    setTitle: (title: string) => void;
}, "list">, Pick<{
    list: globalThis.Ref<{
        path: string;
        fullPath: string;
        name?: string;
        meta: {
            label?: string;
            keepAlive?: boolean;
            isHome?: boolean;
            process?: boolean;
        };
        active?: boolean;
        app?: string;
    }[], ProcessItem[] | {
        path: string;
        fullPath: string;
        name?: string;
        meta: {
            label?: string;
            keepAlive?: boolean;
            isHome?: boolean;
            process?: boolean;
        };
        active?: boolean;
        app?: string;
    }[]>;
    add: (data: ProcessItem) => void;
    remove: (index: number) => void;
    close: () => void;
    set: (data: ProcessItem[]) => void;
    clear: () => void;
    clearCurrentApp: (app: string) => void;
    getAppTabs: (app: string) => {
        path: string;
        fullPath: string;
        name?: string;
        meta: {
            label?: string;
            keepAlive?: boolean;
            isHome?: boolean;
            process?: boolean;
        };
        active?: boolean;
        app?: string;
    }[];
    setTitle: (title: string) => void;
}, never>, Pick<{
    list: globalThis.Ref<{
        path: string;
        fullPath: string;
        name?: string;
        meta: {
            label?: string;
            keepAlive?: boolean;
            isHome?: boolean;
            process?: boolean;
        };
        active?: boolean;
        app?: string;
    }[], ProcessItem[] | {
        path: string;
        fullPath: string;
        name?: string;
        meta: {
            label?: string;
            keepAlive?: boolean;
            isHome?: boolean;
            process?: boolean;
        };
        active?: boolean;
        app?: string;
    }[]>;
    add: (data: ProcessItem) => void;
    remove: (index: number) => void;
    close: () => void;
    set: (data: ProcessItem[]) => void;
    clear: () => void;
    clearCurrentApp: (app: string) => void;
    getAppTabs: (app: string) => {
        path: string;
        fullPath: string;
        name?: string;
        meta: {
            label?: string;
            keepAlive?: boolean;
            isHome?: boolean;
            process?: boolean;
        };
        active?: boolean;
        app?: string;
    }[];
    setTitle: (title: string) => void;
}, "clear" | "set" | "add" | "close" | "remove" | "clearCurrentApp" | "getAppTabs" | "setTitle">>;
