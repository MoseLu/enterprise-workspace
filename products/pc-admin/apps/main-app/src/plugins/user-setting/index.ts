import type { Plugin } from '@btc/shared-core';
import { definePluginConfig } from '@btc/shared-core';
import UserSettingToolbar from './index.vue';

/**
 * 用户设置插件
 */
export const userSettingPlugin: Plugin = {
  name: 'user-setting',
  version: '1.0.0',
  description: 'User settings plugin',
  order: 20,

  // 插件配置元数据
  config: definePluginConfig({
    label: '用户设置',
    description: '提供用户偏好设置和主题配置',
    author: 'BTC Team',
    version: '1.0.0',
    updateTime: '2024-01-15',
    category: 'core',
    tags: ['settings', 'theme', 'user-preference', 'toolbar'],
    recommended: true,
  }),

  // 工具栏配置
  toolbar: {
    order: 5, // 在消息插件之后
    pc: true,
    h5: false, // 移动端隐藏
    // 关键：system-app 生产环境将该核心工具栏静态打包，避免动态 chunk 缓存不一致导致按钮缺失
    component: () => Promise.resolve({ default: UserSettingToolbar } as any),
  }
};
