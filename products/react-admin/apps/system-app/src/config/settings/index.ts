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
export const systemSettingConfig = {
  ...themeConfig,
  ...menuConfig,
  ...layoutConfig,
  ...uiConfig,
};

// 导出子配置（便于单独使用）
export { themeConfig, menuConfig, layoutConfig, uiConfig };

