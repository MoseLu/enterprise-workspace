import type { Plugin } from '@btc/shared-core';
import { definePluginConfig } from '@btc/shared-core';

/**
 * 消息插件
 */
export const messagePlugin: Plugin = {
  name: 'message',
  version: '1.0.0',
  description: 'Message center plugin',
  order: 20,

  // 插件配置元数据
  config: definePluginConfig({
    label: 'Message Center',
    description: 'Provides private messages and system message functionality',
    author: 'BTC Team',
    version: '1.0.0',
    updateTime: '2024-01-15',
    category: 'core',
    tags: ['message', 'chat', 'toolbar'],
    recommended: true,
  }),

  // 工具栏配置
  toolbar: {
    order: 4, // 在通知之后
    pc: true,
    h5: false, // 移动端隐藏
    component: () => import('@btc/shared-components/components/layout/app-layout/message-icon/index.vue')
  }
};
