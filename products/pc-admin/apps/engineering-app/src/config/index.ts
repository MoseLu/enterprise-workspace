import { MenuThemeEnum, SystemThemeEnum } from '@btc/shared-components';

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
};

export type AppConfig = typeof config;


