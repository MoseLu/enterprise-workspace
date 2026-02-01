/**
 * 系统设置配置统一导出
 */
import { themeConfig } from './theme';
import { menuConfig } from './menu';
import { layoutConfig } from './layout';
import { uiConfig } from './ui';
/**
 * 系统设置配置
 * 整合所有子配置
 */
export declare const systemSettingConfig: {
    defaultTabStyle: "tab-default";
    defaultPageTransition: "slide-left";
    defaultShowWorkTab: boolean;
    defaultUniqueOpened: boolean;
    defaultShowGlobalSearch: boolean;
    defaultShowCrumbs: boolean;
    defaultColorWeak: boolean;
    defaultContainerWidth: "full";
    defaultBoxBorderMode: boolean;
    defaultCustomRadius: string;
    defaultMenuType: "left";
    defaultMenuWidth: number;
    defaultSystemThemeType: "auto";
    defaultSystemThemeColor: string;
    defaultMenuTheme: import("../../plugins/user-setting/config/enums").MenuThemeEnum;
};
export { themeConfig, menuConfig, layoutConfig, uiConfig };
