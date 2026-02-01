/**
 * 颜色混合工具函数
 */
export declare function mixColor(color1: string, color2: string, weight: number): string;
export interface ThemeConfig {
    name: string;
    label: string;
    color: string;
}
/**
 * 预设主题列表
 * 注意：label 字段存储国际化键值，需要在模板中使用 t() 函数进行翻译
 */
export declare const THEME_PRESETS: ThemeConfig[];
/**
 * 主题管理 Hook
 */
export declare function useTheme(): {
    isDark: import("vue").Ref<boolean, boolean>;
    currentTheme: import("vue").Ref<{
        name: string;
        label: string;
        color: string;
    }, ThemeConfig | {
        name: string;
        label: string;
        color: string;
    }>;
    themes: ThemeConfig[];
    changeTheme: (theme: ThemeConfig) => void;
    toggleDark: (event?: MouseEvent) => void;
    setThemeColor: (color: string, dark?: boolean) => void;
};
//# sourceMappingURL=useTheme.d.ts.map