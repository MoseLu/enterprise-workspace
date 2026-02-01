<template>
  <div class="btc-notification-panel">
    <!-- 头部 -->
    <div class="btc-notification-panel__header">
      <span class="btc-notification-panel__title">{{ t('notice.title') }}</span>
      <span v-if="hasUnread" class="btc-notification-panel__btn-read" @click="handleReadAll">
        {{ t('notice.btnRead') }}
      </span>
    </div>

    <!-- Tab 标签栏 -->
    <ul class="btc-notification-panel__bar">
      <li
        v-for="(item, index) in barList"
        :key="index"
        :class="{ active: barActiveIndex === index }"
        @click="changeBar(index)"
      >
        {{ item.name }} ({{ item.num }})
      </li>
    </ul>

    <!-- 内容区域 -->
    <div class="btc-notification-panel__content">
      <div class="btc-notification-panel__scroll">
        <!-- 通知列表 -->
        <ul v-show="barActiveIndex === 0" class="btc-notification-panel__notice-list">
          <li
            v-for="(item, index) in noticeList"
            :key="item.id || index"
            :class="{ unread: !item.read }"
            @click="handleNotificationClick(item)"
          >
            <div
              class="btc-notification-panel__icon"
              :style="{ background: getNoticeStyle(item.type).backgroundColor + '!important' }"
            >
              <i
                class="iconfont-sys"
                :style="{ color: getNoticeStyle(item.type).iconColor + '!important' }"
                v-html="getNoticeStyle(item.type).icon"
              ></i>
            </div>
            <div class="btc-notification-panel__text">
              <h4>{{ item.title }}</h4>
              <p>{{ formatTime(item.time) }}</p>
            </div>
          </li>
        </ul>

        <!-- 空状态 -->
        <div v-show="currentTabIsEmpty" class="btc-notification-panel__empty">
          <i class="iconfont-sys">&#xe8d7;</i>
          <p>{{ t('notice.text[0]') }}{{ barList[barActiveIndex].name }}</p>
        </div>
      </div>

      <!-- 查看全部按钮 -->
      <div v-if="!currentTabIsEmpty" class="btc-notification-panel__btn-wrapper">
        <el-button class="btc-notification-panel__view-all" @click="handleViewAll">
          {{ t('notice.viewAll') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcNotificationPanel',
});

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n, onGlobalStateChange } from '@btc/shared-core';
import { useRouter } from 'vue-router';
import '@btc-assets/icons/system/iconfont.css';

defineEmits<{
  close: [];
}>();

const { t } = useI18n();
const router = useRouter();

// 通知数据接口
interface NotificationItem {
  id: string;
  title: string;
  time: string | number | Date;
  type: 'email' | 'message' | 'collection' | 'user' | 'notice';
  read?: boolean;
  source?: string;
}

interface BarItem {
  name: string;
  num: number;
}

interface NoticeStyle {
  icon: string;
  iconColor: string;
  backgroundColor: string;
}

const barActiveIndex = ref(0);
const noticeList = ref<NotificationItem[]>([]);

// 从插件API获取通知列表
const loadNotifications = () => {
  const pluginAPI = (window as any).__PLUGIN_API__;
  if (pluginAPI?.notificationCenter?.getNotifications) {
    try {
      const notifications = pluginAPI.notificationCenter.getNotifications() || [];
      // 按时间倒序排序，只显示最近的20条
      noticeList.value = notifications
        .sort((a: NotificationItem, b: NotificationItem) => {
          const timeA = new Date(a.time).getTime();
          const timeB = new Date(b.time).getTime();
          return timeB - timeA;
        })
        .slice(0, 20);
    } catch (error) {
      console.warn('[NotificationPanel] 获取通知列表失败:', error);
      noticeList.value = [];
    }
  } else {
    // API未就绪，使用空列表
    noticeList.value = [];
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

  if (minutes < 1) return t('notice.justNow') || '刚刚';
  if (minutes < 60) return `${minutes}${t('notice.minutesAgo') || '分钟前'}`;
  if (hours < 24) return `${hours}${t('notice.hoursAgo') || '小时前'}`;
  if (days < 7) return `${days}${t('notice.daysAgo') || '天前'}`;

  return date.toLocaleDateString();
};

const barList = computed<BarItem[]>(() => [
  {
    name: t('notice.bar[0]') || '通知',
    num: noticeList.value.length,
  },
]);

const hasUnread = computed(() => noticeList.value.some((item) => !item.read));

const currentTabIsEmpty = computed(() => {
  return noticeList.value.length === 0;
});

const getNoticeStyle = (type: NotificationItem['type']): NoticeStyle => {
  const noticeStyleMap: Record<NotificationItem['type'], NoticeStyle> = {
    email: {
      icon: '&#xe72e;',
      iconColor: 'rgb(230, 162, 60)',
      backgroundColor: 'rgba(230, 162, 60, 0.1)',
    },
    message: {
      icon: '&#xe747;',
      iconColor: 'rgb(103, 194, 58)',
      backgroundColor: 'rgba(103, 194, 58, 0.1)',
    },
    collection: {
      icon: '&#xe714;',
      iconColor: 'rgb(245, 108, 108)',
      backgroundColor: 'rgba(245, 108, 108, 0.1)',
    },
    user: {
      icon: '&#xe608;',
      iconColor: 'rgb(144, 147, 153)',
      backgroundColor: 'rgba(144, 147, 153, 0.1)',
    },
    notice: {
      icon: '&#xe6c2;',
      iconColor: 'rgb(64, 158, 255)',
      backgroundColor: 'rgba(64, 158, 255, 0.1)',
    },
  };

  return noticeStyleMap[type] || noticeStyleMap.notice;
};

const changeBar = (index: number) => {
  barActiveIndex.value = index;
};

const handleNotificationClick = (item: NotificationItem) => {
  // 标记为已读（如果有API支持）
  // const pluginAPI = (window as any).__PLUGIN_API__;
  // if (pluginAPI?.notificationCenter?.markAsRead && item.id) {
  //   try {
  //     pluginAPI.notificationCenter.markAsRead(item.id);
  //     loadNotifications();
  //     window.dispatchEvent(new CustomEvent('notification-center-updated'));
  //   } catch (error) {
  //     console.warn('[NotificationPanel] 标记通知已读失败:', error);
  //   }
  // }
};

const handleReadAll = () => {
  // 标记全部已读（如果有API支持）
  // const pluginAPI = (window as any).__PLUGIN_API__;
  // if (pluginAPI?.notificationCenter?.markAllAsRead) {
  //   try {
  //     pluginAPI.notificationCenter.markAllAsRead();
  //     loadNotifications();
  //     window.dispatchEvent(new CustomEvent('notification-center-updated'));
  //   } catch (error) {
  //     console.warn('[NotificationPanel] 标记全部已读失败:', error);
  //   }
  // }
};

const handleViewAll = () => {
  // 可以跳转到通知中心页面
  // router.push('/notification-center');
};

let unsubscribe: (() => void) | null = null;

onMounted(() => {
  // 初始加载
  loadNotifications();

  // 监听全局状态变化（通过统一中间层）
  unsubscribe = onGlobalStateChange(
    (state: any) => {
      if (state.notificationList !== undefined) {
        loadNotifications();
      }
    },
    true, // 立即触发一次
    'notification-panel-listener' // 固定监听器 key
  );

  // 监听自定义事件
  window.addEventListener('notification-center-updated', loadNotifications);
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  window.removeEventListener('notification-center-updated', loadNotifications);
});
</script>

<style lang="scss" scoped>
.btc-notification-panel {
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
    margin-top: 0;
    border-bottom: 1px solid var(--el-border-color-light);

    .btc-notification-panel__title {
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .btc-notification-panel__btn-read {
      font-size: 12px;
      color: var(--el-text-color-regular);
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 6px;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }
  }

  &__bar {
    display: flex;
    width: 100%;
    height: 50px;
    padding: 0 15px;
    line-height: 50px;
    border-bottom: 1px solid var(--el-border-color-light);
    list-style: none;
    margin: 0;

    li {
      height: 48px;
      margin-right: 20px;
      overflow: hidden;
      font-size: 13px;
      color: var(--el-text-color-regular);
      cursor: pointer;
      transition: color 0.3s;
      user-select: none;

      &:last-of-type {
        margin-right: 0;
      }

      &:hover {
        color: var(--el-text-color-primary);
      }

      &.active {
        color: var(--el-color-primary) !important;
        border-bottom: 2px solid var(--el-color-primary);
      }
    }
  }

  &__content {
    width: 100%;
    height: calc(500px - 95px);
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

  &__notice-list {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      box-sizing: border-box;
      display: flex;
      align-items: center;
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

  &__icon {
    width: 36px;
    height: 36px;
    line-height: 36px;
    text-align: center;
    border-radius: 8px;
    flex-shrink: 0;

    i {
      font-size: 18px;
      background: transparent !important;
    }
  }

  &__text {
    width: calc(100% - 45px);
    margin-left: 15px;
    overflow: hidden;

    h4 {
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      color: var(--el-text-color-primary);
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    p {
      margin-top: 5px;
      font-size: 12px;
      color: var(--el-text-color-regular);
      margin: 0;
    }
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

