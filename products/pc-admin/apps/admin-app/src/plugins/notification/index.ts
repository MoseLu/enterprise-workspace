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
    label: 'Notification Management',
    description: 'Provides system notifications and message reminders',
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
