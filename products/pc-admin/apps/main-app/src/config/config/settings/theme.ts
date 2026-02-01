/**
 * 主题相关配置
 */
import { MenuThemeEnum } from '../../../plugins/user-setting/config/enums';

export const themeConfig = {
  // 系统主题类型
  defaultSystemThemeType: 'auto' as const,
  // 系统主题颜色
  defaultSystemThemeColor: '#409eff',
  // 菜单主题
  defaultMenuTheme: MenuThemeEnum.DESIGN,
};

