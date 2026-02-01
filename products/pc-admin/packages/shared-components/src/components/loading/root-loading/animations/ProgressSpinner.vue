<template>
  <div class="preload__loading loading-style-progress">
    <div class="progress-bar-container">
      <div class="progress-bar-track">
        <div class="progress-bar-fill" :style="{ width: `${progress}%` }">
          <div class="progress-bar-shine"></div>
        </div>
      </div>
      <div class="progress-percentage">{{ progressText }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcRootProgressSpinner',
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
// 样式已移至全局样式文件
// 此处为空，避免样式冲突
</style>
