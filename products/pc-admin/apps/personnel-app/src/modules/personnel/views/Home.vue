<template>
  <div class="page personnel-home">
    <!-- 人事管理图表分析 -->
    <div class="personnel-charts">
      <BtcChartGallery :gap="10" :cols-per-row="2" chart-height="300px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BtcChartGallery } from '@btc/shared-components';

defineOptions({
  name: 'PersonnelHome',
});
</script>

<style scoped lang="scss">
.personnel-home {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden;
}

.personnel-charts {
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
