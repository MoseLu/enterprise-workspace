<template>
  <div class="btc-app-loading-spinner-container">
    <div class="btc-app-loading-progress-container">
      <div class="btc-app-loading-progress-track">
        <div class="btc-app-loading-progress-fill" :style="{ width: `${progress}%` }">
          <div class="btc-app-loading-progress-shine"></div>
        </div>
      </div>
      <div class="btc-app-loading-progress-percentage">{{ progressText }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcAppProgressSpinner',
});

import { ref, computed, onMounted, onUnmounted } from 'vue';

const progress = ref(0);
let progressInterval: number | null = null;

// 格式化百分比显示
const progressText = computed(() => Math.round(progress.value));

// 模拟进度更新
const updateProgress = () => {
  if (progress.value < 95) {
    // 前 95% 使用随机增量，模拟真实加载
    const increment = Math.random() * 3 + 0.5;
    progress.value = Math.min(95, progress.value + increment);
  } else if (progress.value < 100) {
    // 最后 5% 缓慢增长
    progress.value = Math.min(100, progress.value + 0.2);
  }
};

onMounted(() => {
  progress.value = 0;
  progressInterval = window.setInterval(updateProgress, 100);
});

onUnmounted(() => {
  if (progressInterval !== null) {
    clearInterval(progressInterval);
  }
});
</script>

<style lang="scss">
// 样式已移至全局样式文件 @btc/shared-components/styles/index.scss
// 此处为空，避免样式冲突
</style>
