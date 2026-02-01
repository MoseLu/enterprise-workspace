/**
 * Tab 元数据注册表（主应用主导，命名空间化）
 */
export interface TabMeta {
    key: string;
    title: string;
    path: string;
    i18nKey?: string;
}
/**
 * 当前激活应用（根据路径前缀判断）
 */
export declare function getActiveApp(pathname: string): string;
/**
 * 解析 Tab 元数据
 */
export declare function resolveTabMeta(pathname: string): TabMeta | null;
/**
 * 注册子应用的 Tab 定义
 */
export declare function registerTabs(app: string, tabs: TabMeta[]): void;
/**
 * 清理子应用的 Tab 定义
 */
export declare function clearTabs(app: string): void;
/**
 * 清理除指定应用外的所有 Tab 定义
 */
export declare function clearTabsExcept(app: string): void;
/**
 * 获取指定命名空间的所有 Tab 元数据
 */
export declare function getTabsForNamespace(app: string): TabMeta[];
