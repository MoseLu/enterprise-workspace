/**
 * 全局配置文件
 * 参考：cool-admin-vue-8.x/src/config/index.ts
 */

import { storage } from '@btc/shared-utils';
import { appConfig } from './app';
import { envConfig, currentEnvironment } from '@btc/shared-core/configs/unified-env-config';
import { getAllSubAppConfigs } from '@btc/shared-core/configs/qiankun-config-center';

// 注意：不能在模块顶层使用 Vue 的 markRaw，因为 Vue 可能还未加载
// 但我们可以使用 Object.preventExtensions 来标记对象，或者在使用时标记

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
// 注意：config 对象包含 getter，不能使用 Object.freeze，因为会阻止 getter 访问
// 但我们需要确保 config 对象不会被 Vue 响应式系统处理
// 解决方案：在需要使用 config 的地方，使用 toRaw 或 markRaw 来防止响应式处理
export const config = {
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
    // 可选语言列表
    languages: [
      { label: '简体中文', value: 'zh-CN' },
      { label: 'English', value: 'en-US' },
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
    // 注意：getter 每次访问都返回新数组
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
};

// 使用 Object.preventExtensions 标记 config 对象，防止扩展
// 注意：这不能完全防止 Vue 响应式系统处理，但可以在使用处使用 markRaw
// 关键：确保在使用 config 的地方（如 useSettingsState）使用 markRaw 标记
Object.preventExtensions(config);

export default config;

