/**
 * 通知中心插件 API（供子应用调用）
 */
import type { NotificationItem } from '../types';

/**
 * 通知中心 API 接口
 * 子应用通过 window.__PLUGIN_API__.notificationCenter 访问
 */
export interface NotificationCenterAPI {
  registerSource: (appName: string) => void;
  unregisterSource: (appName: string) => void;
  push: (notification: NotificationItem) => void;
  getNotifications: () => NotificationItem[];
}

