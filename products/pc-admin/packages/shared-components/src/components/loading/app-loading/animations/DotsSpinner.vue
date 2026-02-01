<template>
  <div class="btc-app-loading-spinner-container">
    <svg
      class="btc-app-loading-dots-svg"
      width="44"
      height="44"
      viewBox="0 0 44 44"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g class="btc-app-loading-dots-spinner">
        <circle class="btc-app-loading-dot btc-app-loading-dot-1" cx="22" cy="8" r="5" />
        <circle class="btc-app-loading-dot btc-app-loading-dot-2" cx="36" cy="22" r="5" />
        <circle class="btc-app-loading-dot btc-app-loading-dot-3" cx="22" cy="36" r="5" />
        <circle class="btc-app-loading-dot btc-app-loading-dot-4" cx="8" cy="22" r="5" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcDotsSpinner',
});
</script>

<style lang="scss">
// 样式已移至全局样式文件 @btc/shared-components/styles/index.scss
// 此处为空，避免样式冲突
</style>

