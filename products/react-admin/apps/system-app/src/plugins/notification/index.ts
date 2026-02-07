import type { Plugin } from '@btc/shared-core';
import { definePluginConfig } from '@btc/shared-core';

/**
 * 通知插件
 */
export const notificationPlugin: Plugin = {
  name: 'notification',
  version: '1.0.0',
  description: 'Notification management plugin',
  order: 15,

  // 插件配置元数据
  config: definePluginConfig({
    label: '通知管理',
    description: '提供系统通知、消息提醒功能',
    author: 'BTC Team',
    version: '1.0.0',
    updateTime: '2024-01-15',
    category: 'core',
    tags: ['notification', 'alert', 'toolbar'],
    recommended: true,
  }),

  // 工具栏配置
  toolbar: {
    order: 3, // 在国际化之后
    pc: true,
    h5: false, // 移动端隐藏
    component: () => import('@btc/shared-components/components/layout/app-layout/notification-icon/index.vue')
  }
};

// 注意：BtcNotificationPanel 组件位于 @btc/shared-components/components/layout/app-layout/notification-icon/notification-panel.vue
// 如需使用，请直接从 @btc/shared-components 导入（如果已导出）或使用完整路径
// 这里不再导出，因为该组件不在本地

