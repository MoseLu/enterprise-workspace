<template>
  <BtcIconButton :config="messageConfig" />
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcMessageIcon',
});

import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useI18n, onGlobalStateChange } from '@btc/shared-core';
import { BtcIconButton } from '@btc/shared-components';
import BtcMessagePanel from './message-panel.vue';

const { t } = useI18n();

// 未读消息数量（从插件API获取）
const unreadCount = ref(0);

// 监听全局消息状态变化
const updateUnreadCount = () => {
  const pluginAPI = (window as any).__PLUGIN_API__;
  if (pluginAPI?.messageCenter) {
    try {
      const messages = pluginAPI.messageCenter.getMessages?.() || [];
      unreadCount.value = messages.filter((msg: any) => !msg.read).length;
    } catch (error) {
      // 如果API未就绪，使用默认值
      unreadCount.value = 0;
    }
  }
};

const hasUnread = computed(() => unreadCount.value > 0);

const messageConfig = computed(() => ({
  icon: 'msg',
  tooltip: t('common.tooltip.message'),
  class: hasUnread ? 'btc-icon-button--breath btc-icon-button--breath--success' : '',
  iconAnimation: 'grow' as const,
  iconAnimationTrigger: 'hover' as const,
  popover: {
    component: BtcMessagePanel,
    width: 360,
    placement: 'bottom-end',
    popperClass: 'btc-message-popover',
  },
}));

let unsubscribe: (() => void) | null = null;

onMounted(() => {
  // 初始加载
  updateUnreadCount();

  // 监听全局状态变化（通过统一中间层）
  unsubscribe = onGlobalStateChange(
    (state: any) => {
      if (state.messageList !== undefined) {
        updateUnreadCount();
      }
    },
    true, // 立即触发一次
    'message-icon-listener' // 固定监听器 key
  );

  // 监听自定义事件（插件API可能通过事件通知）
  window.addEventListener('message-center-updated', updateUnreadCount);
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  window.removeEventListener('message-center-updated', updateUnreadCount);
});
</script>

<style lang="scss" scoped>
</style>

