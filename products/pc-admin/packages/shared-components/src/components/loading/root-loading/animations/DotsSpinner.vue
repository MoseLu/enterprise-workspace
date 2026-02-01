<template>
  <div class="preload__loading loading-style-dots">
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <g class="spinner">
        <circle class="dot dot-1" cx="20" cy="8" r="4" />
        <circle class="dot dot-2" cx="32" cy="20" r="4" />
        <circle class="dot dot-3" cx="20" cy="32" r="4" />
        <circle class="dot dot-4" cx="8" cy="20" r="4" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcRootDotsSpinner',
});
</script>

<style lang="scss">
// 样式已移至全局样式文件 @btc/shared-components/public/assets/layout/loading.css
// 此处为空，避免样式冲突
</style>

