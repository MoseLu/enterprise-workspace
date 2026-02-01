import { MenuThemeEnum, SystemThemeEnum } from '@/plugins/user-setting/config/enums';

export const config = {
  app: {
    systemSetting: {
      defaultMenuWidth: 255,
      defaultSystemThemeType: SystemThemeEnum.AUTO,
      defaultMenuTheme: MenuThemeEnum.DESIGN,
      defaultSystemThemeColor: '#3F8CFF',
      defaultShowCrumbs: true,
      defaultShowWorkTab: true,
      defaultShowGlobalSearch: true,
      defaultColorWeak: false,
      defaultBoxBorderMode: false,
      defaultUniqueOpened: true,
      defaultTabStyle: 'card',
      defaultPageTransition: 'slide-left',
      defaultCustomRadius: '0.5',
    },
  },
  // API 配置
  api: {
    // 基础路径：统一使用 /api，通过代理转发到后端
    baseURL: '/api',
    // 请求超时时间
    timeout: 30000,
  },
};

export type AppConfig = typeof config;


