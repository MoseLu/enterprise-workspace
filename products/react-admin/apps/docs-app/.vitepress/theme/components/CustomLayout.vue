<template>
  <div class="Layout">
    <!-- 使用VitePress默认布局的内容，让VitePress自己管理主题 -->
    <component :is="defaultLayout" />
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';

// 使用VitePress默认主题的布局组件
const defaultLayout = () => h(DefaultTheme.Layout);

// 让VitePress自己管理主题，不再强制控制
</script>

<style scoped>
/* 使用VitePress原生的CSS变量和类名 */
.Layout {
  min-height: 100vh;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

/* 确保主题类正确应用 */
.Layout.dark {
  color-scheme: dark;
}

.Layout:not(.dark) {
  color-scheme: light;
}
</style>
