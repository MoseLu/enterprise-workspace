<template>
  <div class="btc-message-panel">
    <!-- 头部 -->
    <div class="btc-message-panel__header">
      <span class="btc-message-panel__title">{{ t('message.title') }}</span>
    </div>

    <!-- 内容区域 -->
    <div class="btc-message-panel__content">
      <div class="btc-message-panel__scroll">
        <!-- 消息列表 -->
        <ul v-if="messageList.length > 0" class="btc-message-panel__message-list">
          <li
            v-for="(item, index) in messageList"
            :key="item.id || index"
            :class="{ unread: !item.read }"
            @click="handleMessageClick(item)"
          >
            <div class="btc-message-panel__avatar">
              <img :src="item.avatar || '/logo.png'" :alt="item.name || ''" />
            </div>
            <div class="btc-message-panel__content-text">
              <div class="btc-message-panel__content-header">
                <h4>{{ item.name || item.title || '系统消息' }}</h4>
                <span class="btc-message-panel__time">{{ formatTime(item.time) }}</span>
              </div>
              <p class="btc-message-panel__preview">{{ item.preview || item.content || '' }}</p>
            </div>
          </li>
        </ul>

        <!-- 空状态 -->
        <div v-else class="btc-message-panel__empty">
          <i class="iconfont-sys">&#xe8d7;</i>
          <p>{{ t('message.empty') }}</p>
        </div>
      </div>

      <!-- 查看全部按钮 -->
      <div v-if="messageList.length > 0" class="btc-message-panel__btn-wrapper">
        <el-button class="btc-message-panel__view-all" @click="handleViewAll">
          {{ t('message.viewAll') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcMessagePanel',
});

import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n, onGlobalStateChange } from '@btc/shared-core';
import { useRouter } from 'vue-router';
import '@btc-assets/icons/system/iconfont.css';

defineEmits<{
  close: [];
}>();

const { t } = useI18n();
const router = useRouter();

// 消息数据接口
interface MessageItem {
  id: string;
  name?: string;
  title?: string;
  avatar?: string;
  preview?: string;
  content?: string;
  time: string | number | Date;
  read?: boolean;
  source?: string;
}

const messageList = ref<MessageItem[]>([]);

// 从插件API获取消息列表
const loadMessages = () => {
  const pluginAPI = (window as any).__PLUGIN_API__;
  if (pluginAPI?.messageCenter?.getMessages) {
    try {
      const messages = pluginAPI.messageCenter.getMessages() || [];
      // 按时间倒序排序，只显示最近的20条
      messageList.value = messages
        .sort((a: MessageItem, b: MessageItem) => {
          const timeA = new Date(a.time).getTime();
          const timeB = new Date(b.time).getTime();
          return timeB - timeA;
        })
        .slice(0, 20);
    } catch (error) {
      console.warn('[MessagePanel] 获取消息列表失败:', error);
      messageList.value = [];
    }
  } else {
    // API未就绪，使用空列表
    messageList.value = [];
  }
};

// 格式化时间
const formatTime = (time: string | number | Date): string => {
  if (!time) return '';
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t('message.justNow') || '刚刚';
  if (minutes < 60) return `${minutes}${t('message.minutesAgo') || '分钟前'}`;
  if (hours < 24) return `${hours}${t('message.hoursAgo') || '小时前'}`;
  if (days < 7) return `${days}${t('message.daysAgo') || '天前'}`;

  return date.toLocaleDateString();
};

const handleMessageClick = (item: MessageItem) => {
  // 标记为已读
  const pluginAPI = (window as any).__PLUGIN_API__;
  if (pluginAPI?.messageCenter?.markAsRead && item.id) {
    try {
      pluginAPI.messageCenter.markAsRead(item.id);
      // 重新加载消息列表
      loadMessages();
      // 触发更新事件
      window.dispatchEvent(new CustomEvent('message-center-updated'));
    } catch (error) {
      console.warn('[MessagePanel] 标记消息已读失败:', error);
    }
  }

  // 可以跳转到消息详情页
  // if (item.link) {
  //   router.push(item.link);
  // }
};

const handleViewAll = () => {
  // 可以跳转到消息中心页面
  // router.push('/message-center');
};

let unsubscribe: (() => void) | null = null;

onMounted(() => {
  // 初始加载
  loadMessages();

  // 监听全局状态变化（通过统一中间层）
  unsubscribe = onGlobalStateChange(
    (state: any) => {
      if (state.messageList !== undefined) {
        loadMessages();
      }
    },
    true, // 立即触发一次
    'message-panel-listener' // 固定监听器 key
  );

  // 监听自定义事件
  window.addEventListener('message-center-updated', loadMessages);
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  window.removeEventListener('message-center-updated', loadMessages);
});
</script>

<style lang="scss" scoped>
.btc-message-panel {
  width: 100%;
  max-height: 500px;
  overflow: hidden;
  background: var(--el-bg-color);
  border-radius: 8px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  &__title {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  &__content {
    width: 100%;
    height: calc(500px - 61px);
    display: flex;
    flex-direction: column;
  }

  &__scroll {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 5px !important;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--el-border-color);
      border-radius: 5px;
    }
  }

  &__message-list {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      box-sizing: border-box;
      display: flex;
      align-items: flex-start;
      padding: 15px;
      cursor: pointer;
      transition: background-color 0.2s;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:hover {
        background-color: var(--el-fill-color-lighter);
      }

      &:last-of-type {
        border-bottom: 0;
      }

      &.unread {
        background-color: var(--el-fill-color-light);
      }
    }
  }

  &__avatar {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    margin-right: 12px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__content-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  &__content-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;

    h4 {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    .btc-message-panel__time {
      font-size: 12px;
      color: var(--el-text-color-regular);
      margin-left: 8px;
      flex-shrink: 0;
    }
  }

  &__preview {
    font-size: 13px;
    color: var(--el-text-color-regular);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.5;
  }

  &__empty {
    position: relative;
    top: 100px;
    height: 100%;
    color: var(--el-text-color-placeholder);
    text-align: center;
    background: transparent !important;

    i {
      font-size: 60px;
    }

    p {
      margin-top: 15px;
      font-size: 12px;
      background: transparent !important;
      margin: 0;
    }
  }

  &__btn-wrapper {
    box-sizing: border-box;
    width: 100%;
    padding: 15px;
    border-top: 1px solid var(--el-border-color-light);
  }

  &__view-all {
    width: 100%;
  }
}
</style>

