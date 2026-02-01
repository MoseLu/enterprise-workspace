import type { Plugin } from '@btc/shared-core';
import { definePluginConfig } from '@btc/shared-core';

/**
 * 通知中心插件
 * 全局能力扩展型插件：主应用做基座，子应用注册扩展能力
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
    component: () => import('@btc/shared-components/components/layout/app-layout/notification-icon/index.vue'),
  },
};

// 导出插件定义（供 module-scanner 扫描）
export default notificationPlugin;

