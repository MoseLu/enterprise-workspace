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
    component: () => import('@btc/shared-components/components/layout/app-layout/message-icon/index.vue')
  }
};

// 注意：BtcMessagePanel 组件位于 @btc/shared-components/components/layout/app-layout/message-icon/message-panel.vue
// 如需使用，请直接从 @btc/shared-components 导入（如果已导出）或使用完整路径
// 这里不再导出，因为该组件不在本地

