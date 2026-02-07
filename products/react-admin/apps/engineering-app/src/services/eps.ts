/**
 * EPS (Entry Point System) 服务
 * 用于应用入口点发现和注册
 */

// 应用名称
export const APP_NAME = 'engineering';

// 应用路径
export const APP_PATH = '/engineering';

/**
 * 获取应用配置
 */
export function getAppConfig() {
  return {
    name: APP_NAME,
    path: APP_PATH,
    title: '工程应用',
    icon: 'engineering',
  };
}

// 导出应用配置工厂
export const __EPS_APP_CONFIG__ = getAppConfig();
