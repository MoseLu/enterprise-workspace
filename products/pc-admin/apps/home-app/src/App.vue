<template>
  <div class="app">
    <Header />
    <main class="main">
      <router-view v-slot="{ Component, route }">
        <component 
          v-if="Component" 
          :is="Component" 
          :class="getPageClass(route)"
        />
      </router-view>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from './components/layout/Header.vue';
import Footer from './components/layout/Footer.vue';
import { isPageRoute, getPageClass as getPageClassName } from '@btc/shared-router';

// 获取页面容器类名
function getPageClass(currentRoute: any): string {
  if (!isPageRoute(currentRoute)) {
    return ''; // 非页面级路由不添加 .page 类
  }
  return getPageClassName(currentRoute);
}
</script>

