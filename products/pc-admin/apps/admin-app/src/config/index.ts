/**
 * 全局配置文件
 * 参考：cool-admin-vue-8.x/src/config/index.ts
 */

import { storage } from '@btc/shared-utils';
import { appConfig } from './app';

// 是否开发模式
export const isDev = (import.meta as any).env.DEV;

// 环境变量
export const env = {
  MODE: (import.meta as any).env.MODE,
  DEV: (import.meta as any).env.DEV,
  PROD: (import.meta as any).env.PROD,
  SSR: (import.meta as any).env.SSR,
};

// 导出配置
export const config = {
  // 应用配置
  app: appConfig,

  // API 配置
  api: {
    // 基础路径：统一使用 /api，通过代理转发到后端
    // 开发环境：Vite 代理 /api 到 http://10.80.9.76:8115
    // 生产环境：Nginx 代理 /api 到 http://10.0.0.168:8115
    baseURL: '/api',
    // 请求超时时间
    timeout: 30000,
  },

  // 国际化配置
  i18n: {
    // 默认语言
    locale: storage.get<string>('locale') || 'zh-CN',
    // 可选语言列表（label 使用国际化 key）
    languages: [
      { labelKey: 'common.system.simplified_chinese', value: 'zh-CN' },
      { labelKey: 'common.system.english', value: 'en-US' },
    ],
  },

  // 主题配置
  theme: {
    // 默认主题模式
    mode: storage.get<string>('theme-mode') || 'light',
    // 主题色
    primaryColor: '#409eff',
  },

  // 忽略规则
  ignore: {
    // 不显示请求进度条的路径
    NProgress: [
      '/user/profile',
      '/menu/list',
    ],
    // 不需要 token 验证的路径
    token: [
      '/login',
      '/401',
      '/403',
      '/404',
      '/500',
    ],
  },

  // 微前端配置
  // 注意：此配置已迁移到 apps/admin-app/src/micro/apps.ts
  // 这里保留是为了向后兼容，但实际使用的是 micro/apps.ts 中的配置
  microApp: {
    // 是否启用
    enabled: true,
    // 子应用列表（已废弃，使用 micro/apps.ts 中的配置）
    apps: [],
  },
};

export default config;

