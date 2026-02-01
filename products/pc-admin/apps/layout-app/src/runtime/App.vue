<template>
  <div id="layout-app">
    <!-- 关键：DevTools 放在 AppLayout 外层，确保路由切换时不卸载 -->
    <!-- 开发环境：所有应用都显示（通过 layout-app 显示给子应用） -->
    <!-- 生产环境：也通过 layout-app 显示 -->
    <BtcDevTools />
    <BtcAppLayout />
  </div>
</template>

<script setup lang="ts">
/**
 * layout-app: 子应用的布局容器应用
 *
 * 作用：
 * 1. 当通过子域名直接访问时（如 logistics.bellis.com.cn），提供主应用布局
 * 2. 根据域名判断并加载对应的子应用
 * 3. 不包含任何应用的 manifest 数据（子应用自己注册）
 */
// 直接从组件路径导入，避免通过 index.ts 重新导出导致的循环依赖警告
import { BtcAppLayout } from '@btc/shared-components';
import { BtcDevTools } from '@btc/shared-components';
</script>

<style>
#layout-app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}
</style>

<style>
/**
 * 非 scoped 样式，确保在 qiankun 环境下也能正确应用
 * 当 layout-app 被挂载到子应用的 #app 容器时，需要确保：
 * 1. 子应用的 #app 容器有正确的样式
 * 2. layout-app 的 #layout-app 容器占据整个 #app 容器空间
 */
/* 确保子应用的 #app 容器有正确的样式（当 layout-app 被挂载时） */
#app:has(#layout-app) {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

/* 确保 layout-app 的 #layout-app 容器占据整个 #app 容器空间 */
#layout-app {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  min-width: 0 !important;
  flex: 1 !important;
}

/* 确保在 qiankun 包装容器内部时，#layout-app 也能正确获取高度 */
[id^="__qiankun_microapp_wrapper"] #layout-app {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  min-width: 0 !important;
  flex: 1 !important;
}

/* 隐藏 qiankun 包装器中的 layout-app HTML 模板中的 #layout-container */
/* layout-app 挂载到 #app，而不是 #layout-container，所以 #layout-container 应该被隐藏 */
[id^="__qiankun_microapp_wrapper"] #layout-container {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
  position: absolute !important;
  visibility: hidden !important;
}

/* 隐藏 qiankun 包装器中 HTML 模板里的 #subapp-viewport（真正的 #subapp-viewport 在 layout-app 的 Vue 组件内部） */
[id^="__qiankun_microapp_wrapper"] > #subapp-viewport {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
  position: absolute !important;
  visibility: hidden !important;
}
</style>

