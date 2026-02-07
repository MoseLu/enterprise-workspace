/**
 * 全局配置文件
 * 参考：cool-admin-vue-8.x/src/config/index.ts
 */

import { storage } from '@btc/shared-utils';
import { appConfig } from './app';
import { envConfig, currentEnvironment } from '@btc/shared-core/configs/unified-env-config';
import { getAllSubAppConfigs } from '@btc/shared-core/configs/qiankun-config-center';

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
// 注意：使用 Object.freeze 防止 Vue 响应式系统深度处理配置对象，避免内存溢出
// config 对象包含从 envConfig 读取的嵌套对象，如果被 Vue 响应式系统处理，会导致深度遍历和内存问题
export const config = Object.freeze({
  // 应用配置
  app: appConfig,

  // API 配置（从统一环境配置读取）
  // 注意：直接读取值，而不是引用整个对象，避免 Vue 响应式系统处理嵌套对象
  api: {
    baseURL: envConfig.api.baseURL,
    timeout: envConfig.api.timeout,
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

  // 微前端配置（从配置中心获取）
  microApp: {
    // 是否启用
    enabled: true,
    // 子应用列表（从配置中心动态获取，使用 getter 实现懒加载，避免初始化顺序问题）
    get apps() {
      return getAllSubAppConfigs().map(app => ({
        name: app.id,
        pathPrefix: app.pathPrefix,
        subdomain: app.subdomain,
      }));
    },
  },
  
  // 文档配置
  // 注意：直接读取值，而不是引用整个对象，避免 Vue 响应式系统处理嵌套对象
  docs: {
    url: envConfig.docs.url,
    port: envConfig.docs.port,
  },
  
  // WebSocket 配置
  // 注意：直接读取值，而不是引用整个对象，避免 Vue 响应式系统处理嵌套对象
  ws: {
    url: envConfig.ws.url,
  },
  
  // 上传配置
  // 注意：直接读取值，而不是引用整个对象，避免 Vue 响应式系统处理嵌套对象
  upload: {
    url: envConfig.upload.url,
  },
  
  // 环境信息（字符串类型，不需要冻结）
  environment: currentEnvironment,
});

export default config;

