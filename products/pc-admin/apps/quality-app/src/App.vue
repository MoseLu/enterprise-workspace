<template>
  <!-- 独立运行时：直接渲染 router-view，让 AppLayout 占据整个容器 -->
  <!-- qiankun 模式：使用包装层，因为子应用需要被主应用的布局包裹 -->
  <div v-if="!isStandalone" :class="['quality-app']">
    <router-view v-slot="{ Component, route }">
      <transition :name="pageTransition" mode="out-in">
        <keep-alive :key="viewKey" :include="keepAliveList" :max="10">
          <component
            v-if="Component"
            :is="Component"
            :key="route.fullPath"
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
          :key="route.fullPath"
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
  name: 'QualityApp',
});

// 关键：在应用启动时立即初始化通信桥和登出监听
useLogout();

const viewKey = ref(1);
const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
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
.quality-app {
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

