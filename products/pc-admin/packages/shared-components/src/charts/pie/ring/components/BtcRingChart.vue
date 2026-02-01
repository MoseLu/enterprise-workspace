<template>
  <div ref="chartContainerRef" class="btc-ring-chart" :style="chartStyle">
    <v-chart
      v-if="isContainerReady"
      :key="chartThemeKey"
      :option="chartOption"
      :autoresize="autoresize"
      :style="{ width: '100%', height: '100%' }"
      @ready="handleChartReady"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useChartComponent } from '../../../composables/useChartComponent';
import { useRingChart } from '../composables/useRingChart';
import type { RingChartProps } from '../../../types/pie';

const props = withDefaults(defineProps<RingChartProps>(), {
  height: '300px',
  width: '100%',
  autoresize: true,
  radius: () => ['40%', '70%'],
  // center 不设置默认值，让 useRingChart 根据图例位置动态计算
  showLegend: true,
  showTooltip: true,
  showToolbar: false,
  legendPosition: 'top',
  showLabel: false,
  showLabelLine: true,
  labelPosition: 'outside'
});

const chartContainerRef = ref<HTMLElement | null>(null);

const chart = useChartComponent(
  chartContainerRef,
  props,
  (isDark, themeColors, styleHelpers) => {
    const { buildOption } = useRingChart(props, isDark, themeColors, styleHelpers);
    return buildOption();
  }
);

const { chartOption, chartStyle, updateChartInstance, isContainerReady, chartThemeKey } = chart;

const handleChartReady = () => {
  updateChartInstance();
};
</script>

<style lang="scss" scoped>
@use '../styles/index.scss';
</style>

