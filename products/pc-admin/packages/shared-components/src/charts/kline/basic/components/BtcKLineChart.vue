<template>
  <div ref="chartContainerRef" class="btc-kline-chart" :style="chartStyle">
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
import { useKLineChart } from '../composables/useKLineChart';
import type { KLineChartProps } from '../../../types/kline';

const props = withDefaults(defineProps<KLineChartProps>(), {
  height: '300px',
  width: '100%',
  autoresize: true,
  grid: () => ({
    left: '10%',
    right: '8%',
    top: '15%',
    bottom: '10%'
  }),
  showLegend: true,
  showTooltip: true,
  showToolbar: false,
  showVolume: false,
  showDataZoom: true,
  dataZoomStart: 0,
  dataZoomEnd: 100,
  upColor: '#ec0000',
  downColor: '#00da3c'
});

const chartContainerRef = ref<HTMLElement | null>(null);

const chart = useChartComponent(
  chartContainerRef,
  props,
  (isDark, themeColors, styleHelpers) => {
    const { buildOption } = useKLineChart(props, isDark, themeColors, styleHelpers);
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

