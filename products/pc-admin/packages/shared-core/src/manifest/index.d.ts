export interface SubAppManifestRoute {
    path: string;
    labelKey?: string;
    label?: string;
    tab?: {
        enabled?: boolean;
        labelKey?: string;
        label?: string;
        icon?: string;
    };
    breadcrumbs?: Array<{
        labelKey?: string;
        label?: string;
        icon?: string;
    }>;
}
export interface SubAppManifest<M = unknown> {
    app: {
        id: string;
        basePath?: string;
        nameKey?: string;
        'app-name'?: string;
    };
    routes: SubAppManifestRoute[];
    menus?: Array<{
        index: string;
        labelKey?: string;
        label?: string;
        icon?: string;
    }>;
    raw: M;
}
export declare function registerManifest(app: string, manifest: SubAppManifest): void;
export declare function getManifest(app: string): SubAppManifest | undefined;
/**
 * 设置 getAppBySubdomain 函数（由应用在运行时注入）
 * 应用应该在初始化时调用此函数来注入 getAppBySubdomain
 */
export declare function setAppBySubdomainFn(fn: (hostname: string) => any): void;
export declare function getManifestRoute(app: string, fullPath: string): SubAppManifestRoute | undefined;
export declare function getManifestTabs(app: string): Array<{
    key: string;
    path: string;
    labelKey?: string;
    label?: string;
}>;
export declare function getManifestMenus(app: string): Array<{
    index: string;
    labelKey?: string;
    label?: string;
    icon?: string;
    children?: any[];
}>;
export declare function getAllManifests(): {
    [x: string]: SubAppManifest<unknown>;
};
