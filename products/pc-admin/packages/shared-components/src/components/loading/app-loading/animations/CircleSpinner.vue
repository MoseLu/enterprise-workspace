<template>
  <div class="btc-app-loading-spinner-container">
    <svg
      class="btc-app-loading-spinner"
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcCircleSpinner',
});
</script>

<style lang="scss">
// 样式已移至全局样式文件 @btc/shared-components/styles/index.scss
// 此处为空，避免样式冲突
</style>

