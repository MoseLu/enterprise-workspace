<template>
  <BtcIconButton :config="notificationConfig" />
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcNotificationIcon',
});

import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useI18n, onGlobalStateChange } from '@btc/shared-core';
import { BtcIconButton } from '@btc/shared-components';
import BtcNotificationPanel from './notification-panel.vue';

const { t } = useI18n();

// 未读通知数量（从插件API获取）
const unreadCount = ref(0);

// 监听全局通知状态变化
const updateUnreadCount = () => {
  const pluginAPI = (window as any).__PLUGIN_API__;
  if (pluginAPI?.notificationCenter) {
    try {
      const notifications = pluginAPI.notificationCenter.getNotifications?.() || [];
      unreadCount.value = notifications.filter((notif: any) => !notif.read).length;
    } catch (error) {
      // 如果API未就绪，使用默认值
      unreadCount.value = 0;
    }
  }
};

const hasUnread = computed(() => unreadCount.value > 0);

const notificationConfig = computed(() => ({
  icon: 'notice',
  tooltip: t('common.tooltip.notification'),
  class: hasUnread ? 'btc-icon-button--breath btc-icon-button--breath--warning' : '',
  iconAnimation: 'grow' as const,
  iconAnimationTrigger: 'hover' as const,
  popover: {
    component: BtcNotificationPanel,
    width: 360,
    placement: 'bottom-end',
    popperClass: 'btc-notification-popover',
  },
}));

let unsubscribe: (() => void) | null = null;

onMounted(() => {
  // 初始加载
  updateUnreadCount();

  // 监听全局状态变化（通过统一中间层）
  unsubscribe = onGlobalStateChange(
    (state: any) => {
      if (state.notificationList !== undefined) {
        updateUnreadCount();
      }
    },
    true, // 立即触发一次
    'notification-icon-listener' // 固定监听器 key
  );

  // 监听自定义事件（插件API可能通过事件通知）
  window.addEventListener('notification-center-updated', updateUnreadCount);
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  window.removeEventListener('notification-center-updated', updateUnreadCount);
});
</script>

<style lang="scss" scoped>
</style>

