/**
 * 用户设置 Composables
 * 封装用户设置相关的逻辑
 */
import { type ThemeConfig } from '@btc/shared-core';
/**
 * 用户设置组合式函数
 */
export declare function useUserSetting(): {
    readonly drawerVisible: globalThis.Ref<boolean, boolean>;
    readonly customColor: any;
    readonly customColorDisplay: globalThis.ComputedRef<any>;
    readonly allThemes: globalThis.ComputedRef<any[]>;
    readonly isCurrentTheme: (themeConfig: ThemeConfig) => boolean;
    readonly openDrawer: () => void;
    readonly handleCustomThemeClick: () => void;
    readonly handleThemeClick: (themeConfig: ThemeConfig) => void;
    readonly handleColorChange: (color: string | null) => void;
    readonly handleClearColor: () => void;
    readonly handleConfirmColor: (color: string | null) => void;
    readonly handleActiveColorChange: (color: string | null) => void;
    readonly handleColorPickerHide: () => void;
    readonly handleDarkToggle: (event?: MouseEvent) => void;
    readonly theme: any;
};
