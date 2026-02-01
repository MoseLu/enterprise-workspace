<template>
  <div class="main-app">
    <BtcDevTools />
    <router-view v-slot="{ Component, route }">
      <component
        v-if="Component"
        :is="Component"
        :key="route.meta?.noLayout ? route.fullPath : undefined"
        :class="getPageClass(route)"
      />
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { BtcDevTools } from '@btc/shared-components';
import { isPageRoute, getPageClass as getPageClassName } from '@btc/shared-router';
import { useLogout } from './composables/useLogout';

// 关键：初始化 useLogout，确保 bridge 订阅尽早设置，以便接收其他标签页的退出消息
useLogout();

// 获取页面容器类名
function getPageClass(currentRoute: any): string {
  if (!isPageRoute(currentRoute)) {
    return ''; // 非页面级路由不添加 .page 类
  }
  return getPageClassName(currentRoute);
}
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

.main-app {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  box-sizing: border-box;
}

.main-app > router-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>

