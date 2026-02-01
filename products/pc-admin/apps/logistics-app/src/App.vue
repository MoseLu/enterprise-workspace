<template>
  <!-- 独立运行时：直接渲染 router-view，让 AppLayout 占据整个容器 -->
  <!-- qiankun 模式：使用包装层，因为子应用需要被主应用的布局包裹 -->
  <div v-if="!isStandalone" :class="['logistics-app']">
    <router-view v-slot="{ Component, route: currentRoute }">
      <transition :name="pageTransition" mode="out-in">
        <keep-alive :key="viewKey" :include="keepAliveList" :max="10">
          <component
            v-if="Component"
            :is="Component"
            :key="currentRoute.fullPath"
            :class="getPageClass(currentRoute)"
          />
        </keep-alive>
      </transition>
    </router-view>
  </div>
  <router-view v-else v-slot="{ Component, route: currentRoute }">
    <transition :name="pageTransition" mode="out-in">
      <keep-alive :key="viewKey" :include="keepAliveList">
        <component
          v-if="Component"
          :is="Component"
          :key="currentRoute.fullPath"
          :class="getPageClass(currentRoute)"
        />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { usePageTransition } from '@btc/shared-utils';
import { useLogout } from '@/composables/useLogout';
import { useProcessStore } from '@/store/modules/process';
import { isPageRoute, getPageClass as getPageClassName } from '@btc/shared-router';

defineOptions({
  name: 'LogisticsApp',
});

// 关键：在应用启动时立即初始化通信桥和登出监听
useLogout();

const route = useRoute();
const viewKey = ref(1);
// 关键：在 layout-app 环境下，isStandalone 应该是 false
// 这样会使用包装层（.logistics-app），确保样式正确应用
const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;
const emitter = (window as any).__APP_EMITTER__;
const { pageTransition } = usePageTransition();
const processStore = useProcessStore();

// 获取需要缓存的组件名称列表
const keepAliveList = computed(() => {
  return processStore.list
    .filter((tab) => tab.meta?.keepAlive === true && tab.name)
    .map((tab) => tab.name as string);
});

// 获取页面容器类名
function getPageClass(currentRoute: any): string {
  if (!isPageRoute(currentRoute)) {
    return ''; // 非页面级路由不添加 .page 类
  }
  return getPageClassName(currentRoute);
}

// 刷新视图
function refreshView() {
  viewKey.value += 1;
}

// 关键修复：component 使用 route.fullPath 作为 key，确保路由切换时组件能够正确更新
// 这样当路由变化时，Vue 会识别出这是不同的组件实例，即使组件在 keepAliveList 中也会重新渲染
// viewKey 保留用于外部触发的刷新场景（如 subapp.refresh 事件）

onMounted(() => {
  if (emitter) {
    emitter.on('subapp.refresh', refreshView);
  }
});

onUnmounted(() => {
  if (emitter) {
    emitter.off('subapp.refresh', refreshView);
  }
});
</script>

<style scoped>
/* 只在 qiankun 模式下使用包装层样式 */
.logistics-app {
  flex: 1 !important;
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
}

/* 确保 router-view 正确渲染 */
.logistics-app :deep(> router-view) {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  height: 100% !important;
  width: 100% !important;
}

/* 确保 router-view 渲染的组件正确显示 */
.logistics-app :deep(> router-view > *) {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  height: 100% !important;
  width: 100% !important;
}

/* 确保 transition 组件正确渲染 */
.logistics-app :deep(.transition-group),
.logistics-app :deep(.transition-group > *) {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  height: 100% !important;
  width: 100% !important;
}
</style>

