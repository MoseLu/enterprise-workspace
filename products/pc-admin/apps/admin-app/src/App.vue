<template>
  <!-- 独立运行时：直接渲染 router-view，让 AppLayout 占据整个容器 -->
  <!-- qiankun 模式：使用包装层，因为子应用需要被主应用的布局包裹 -->
  <div v-if="!isStandalone" :class="['admin-app']">
    <router-view v-slot="{ Component, route }">
      <transition :name="pageTransition" mode="out-in">
        <keep-alive :key="viewKey" :include="keepAliveList" :max="10">
          <component
            v-if="Component"
            :is="Component"
            :class="getPageClass(route)"
          />
        </keep-alive>
      </transition>
    </router-view>
  </div>
  <router-view v-else v-slot="{ Component, route }">
    <transition :name="pageTransition" mode="out-in">
      <keep-alive :key="viewKey" :include="keepAliveList">
        <component
          v-if="Component"
          :is="Component"
          :class="getPageClass(route)"
        />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { usePageTransition } from '@btc/shared-utils';
import { useLogout } from '@/composables/useLogout';
import { useProcessStore } from '@/store/process';
import { isPageRoute, getPageClass as getPageClassName } from '@btc/shared-router';

defineOptions({
  name: 'AdminApp',
});

// 关键：在应用启动时立即初始化通信桥和登出监听
// 这样确保即使没有组件使用 useLogout，也能接收到跨标签页的登出消息
useLogout();

const viewKey = ref(1);
// 关键：在 layout-app 环境下，isStandalone 应该是 false
// 这样会使用包装层（.admin-app），确保样式正确应用
const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;
const emitter = (window as any).__APP_EMITTER__;
const { pageTransition } = usePageTransition();
const processStore = useProcessStore();

// 获取需要缓存的组件名称列表
// keep-alive 使用组件名称（name）来匹配，使用路由的 name 字段
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

// 刷新视图（只在手动刷新时调用，通过事件触发）
// 参考 cool-admin：key 只在手动刷新时才更新，而不是每次路由变化都更新
// 这样可以避免不必要的 keep-alive 实例重新创建，减少卡顿和闪烁
function refreshView() {
  viewKey.value += 1;
}

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
.admin-app {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  box-sizing: border-box;
}
</style>
