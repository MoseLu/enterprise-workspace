/**
 * 系统设置配置
 */

import { MenuThemeEnum } from '../../plugins/user-setting/config/enums';

export const systemSettingConfig = {
  // 默认设置
  default: {
    // 主题模式
    themeMode: 'light',
    // 语言
    locale: 'zh-CN',
    // 菜单设置
    defaultMenuWidth: 240,
    defaultMenuTheme: MenuThemeEnum.DESIGN,
    // 主题设置
    defaultSystemThemeType: 'auto' as const,
    defaultSystemThemeColor: '#409eff',
    // 界面显示设置
    defaultShowCrumbs: true,
    defaultShowWorkTab: true,
    defaultShowGlobalSearch: true,
    defaultColorWeak: false,
    // 布局设置
    defaultBoxBorderMode: false,
    defaultUniqueOpened: false,
    defaultTabStyle: 'tab-default' as const,
    defaultPageTransition: 'slide-left' as const,
    defaultCustomRadius: '0.25',
  },
};

