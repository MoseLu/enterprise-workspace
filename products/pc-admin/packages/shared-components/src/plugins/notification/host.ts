/**
 * 通知中心插件 - 主应用基座（Host）
 */
import { ref } from 'vue';
import type { QiankunActions, NotificationItem } from '../types';
import { setGlobalState } from '@btc/shared-core';

export interface NotificationPluginHostOptions {
  globalState?: QiankunActions;
}

const notificationList = ref<NotificationItem[]>([]);
const notificationSources = new Set<string>();

let notificationInstance: any = null;

/**
 * 创建通知中心插件（主应用）
 */
export function createNotificationPluginHost(options: NotificationPluginHostOptions = {}) {
  if (notificationInstance) {
    return notificationInstance;
  }

  const { globalState } = options;

  const registerSource = (appName: string) => {
    notificationSources.add(appName);
  };

  const unregisterSource = (appName: string) => {
    notificationSources.delete(appName);
    // 移除该应用的所有通知
    notificationList.value = notificationList.value.filter((notif) => notif.source !== appName);
    
    // 同步到全局状态（通过统一中间层）
    setGlobalState({ notifications: notificationList.value }, false).catch(() => {
      // 忽略错误（可能在初始化中）
    });
  };

  const push = (notification: NotificationItem) => {
    notificationList.value.push({
      ...notification,
      time: notification.time || Date.now(),
    });

    // 同步到全局状态（通过统一中间层）
    setGlobalState({ notifications: notificationList.value }, false).catch(() => {
      // 忽略错误（可能在初始化中）
    });
  };

  const getNotifications = () => {
    return notificationList.value;
  };

  notificationInstance = {
    registerSource,
    unregisterSource,
    push,
    getNotifications,
    notificationList,
  };

  return notificationInstance;
}

