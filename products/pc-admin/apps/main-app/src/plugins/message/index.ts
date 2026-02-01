import type { Plugin } from '@btc/shared-core';
import { definePluginConfig } from '@btc/shared-core';

/**
 * 消息中心插件
 * 全局能力扩展型插件：主应用做基座，子应用注册扩展能力
 */
export const messagePlugin: Plugin = {
  name: 'message',
  version: '1.0.0',
  description: 'Message center plugin',
  order: 20,

  // 插件配置元数据
  config: definePluginConfig({
    label: '消息中心',
    description: '提供私信、系统消息功能',
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
    component: () => import('@btc/shared-components/components/layout/app-layout/message-icon/index.vue'),
  },
};

// 导出插件定义（供 module-scanner 扫描）
export default messagePlugin;

