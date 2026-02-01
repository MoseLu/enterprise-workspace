<template>
  <div class="system-home">
    <!-- 策略监控图表分析 -->
    <div class="strategy-charts">
      <BtcChartGallery :gap="10" :cols-per-row="2" chart-height="300px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BtcChartGallery } from '@btc/shared-components';

defineOptions({
  name: 'SystemHome',
});
</script>

<style scoped lang="scss">
.system-home {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden;
}

.strategy-charts {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;

  :deep(.btc-chart-gallery) {
    height: 100%;
    min-height: 0;
  }

  :deep(.btc-container) {
    height: 100%;
    min-height: 0;
  }

  :deep(.chart-item) {
    min-height: 300px;
  }
}
</style>
