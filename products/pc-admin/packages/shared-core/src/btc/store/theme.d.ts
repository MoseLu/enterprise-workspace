import { type ThemeConfig } from '../composables/useTheme';
/**
 * 主题 Store
 */
export declare const useThemeStore: import("pinia").StoreDefinition<"theme", Pick<{
    currentTheme: import("vue").Ref<{
        name: string;
        label: string;
        color: string;
    }, ThemeConfig | {
        name: string;
        label: string;
        color: string;
    }>;
    isDark: import("vue").WritableComputedRef<boolean, boolean>;
    color: import("vue").ComputedRef<string>;
    THEME_PRESETS: ThemeConfig[];
    switchTheme: (theme: ThemeConfig) => void;
    toggleDark: (event?: MouseEvent) => void;
    setThemeColor: (color: string, dark: boolean) => void;
    updateThemeColor: (color: string) => void;
}, "currentTheme" | "THEME_PRESETS">, Pick<{
    currentTheme: import("vue").Ref<{
        name: string;
        label: string;
        color: string;
    }, ThemeConfig | {
        name: string;
        label: string;
        color: string;
    }>;
    isDark: import("vue").WritableComputedRef<boolean, boolean>;
    color: import("vue").ComputedRef<string>;
    THEME_PRESETS: ThemeConfig[];
    switchTheme: (theme: ThemeConfig) => void;
    toggleDark: (event?: MouseEvent) => void;
    setThemeColor: (color: string, dark: boolean) => void;
    updateThemeColor: (color: string) => void;
}, "isDark" | "color">, Pick<{
    currentTheme: import("vue").Ref<{
        name: string;
        label: string;
        color: string;
    }, ThemeConfig | {
        name: string;
        label: string;
        color: string;
    }>;
    isDark: import("vue").WritableComputedRef<boolean, boolean>;
    color: import("vue").ComputedRef<string>;
    THEME_PRESETS: ThemeConfig[];
    switchTheme: (theme: ThemeConfig) => void;
    toggleDark: (event?: MouseEvent) => void;
    setThemeColor: (color: string, dark: boolean) => void;
    updateThemeColor: (color: string) => void;
}, "switchTheme" | "toggleDark" | "setThemeColor" | "updateThemeColor">>;
//# sourceMappingURL=theme.d.ts.map