/**
 * 设置状态管理
 * 使用 localStorage 持久化设置状态
 */
import { MenuTypeEnum, SystemThemeEnum, MenuThemeEnum, ContainerWidthEnum, BoxStyleType } from '../config/enums';
/**
 * 设置状态管理组合式函数（单例模式）
 * 确保所有组件使用同一个状态实例
 */
export declare function useSettingsState(): {
    menuType: any;
    menuOpenWidth: globalThis.Ref<number, number>;
    menuOpen: globalThis.Ref<boolean, boolean>;
    systemThemeType: any;
    systemThemeMode: any;
    menuThemeType: any;
    systemThemeColor: globalThis.Ref<string, string>;
    showMenuButton: globalThis.Ref<boolean, boolean>;
    showFastEnter: globalThis.Ref<boolean, boolean>;
    showRefreshButton: globalThis.Ref<boolean, boolean>;
    showCrumbs: globalThis.Ref<boolean, boolean>;
    showWorkTab: globalThis.Ref<boolean, boolean>;
    showGlobalSearch: globalThis.Ref<boolean, boolean>;
    showLanguage: globalThis.Ref<boolean, boolean>;
    showNprogress: globalThis.Ref<boolean, boolean>;
    colorWeak: globalThis.Ref<boolean, boolean>;
    watermarkVisible: globalThis.Ref<boolean, boolean>;
    containerWidth: any;
    boxBorderMode: globalThis.Ref<boolean, boolean>;
    uniqueOpened: globalThis.Ref<boolean, boolean>;
    tabStyle: globalThis.Ref<string, string>;
    pageTransition: globalThis.Ref<string, string>;
    customRadius: globalThis.Ref<string, string>;
    isDark: globalThis.ComputedRef<boolean>;
    switchMenuLayouts: (type: MenuTypeEnum) => void;
    switchMenuStyles: (theme: MenuThemeEnum) => void;
    switchThemeStyles: (theme: SystemThemeEnum) => void;
    setSystemThemeColor: (color: string) => void;
    setContainerWidth: (width: ContainerWidthEnum) => void;
    setBoxMode: (type: BoxStyleType) => void;
    toggleWorkTab: () => void;
    toggleMenuButton: () => void;
    toggleFastEnter: () => void;
    toggleRefreshButton: () => void;
    toggleCrumbs: () => void;
    toggleLanguage: () => void;
    toggleUniqueOpened: () => void;
    toggleNprogress: () => void;
    toggleColorWeak: () => void;
    toggleWatermark: () => void;
    setTabStyle: (style: string) => void;
    setPageTransition: (transition: string) => void;
    setCustomRadius: (radius: string) => void;
    setMenuOpenWidth: (width: number) => void;
    toggleGlobalSearch: () => void;
    setWorkTab: (value: boolean) => void;
    setUniqueOpened: (value: boolean) => void;
    setGlobalSearch: (value: boolean) => void;
    setCrumbs: (value: boolean) => void;
    setColorWeak: (value: boolean) => void;
};
