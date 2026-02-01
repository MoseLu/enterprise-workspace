<template>
  <div ref="chartContainerRef" class="btc-dual-bar-compare-chart" :style="chartStyle">
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
import { useDualBarCompareChart } from '../composables/useDualBarCompareChart';
import type { DualBarCompareChartProps } from '../../../types/bar';

const props = withDefaults(defineProps<DualBarCompareChartProps>(), {
  height: '300px',
  width: '100%',
  autoresize: true,
  grid: () => ({
    left: '3%',
    right: '4%',
    top: '10%',
    bottom: '3%'
  }),
  showLegend: true,
  showTooltip: true,
  showLabel: false,
  showToolbar: false,
  label1: '数据1',
  label2: '数据2'
});

const chartContainerRef = ref<HTMLElement | null>(null);

const chart = useChartComponent(
  chartContainerRef,
  props,
  (isDark, themeColors, styleHelpers) => {
    const { buildOption } = useDualBarCompareChart(props, isDark, themeColors, styleHelpers);
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

