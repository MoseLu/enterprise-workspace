<template>
  <div ref="chartContainerRef" class="btc-pie-chart" :style="chartStyle">
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
import { usePieChart } from '../composables/usePieChart';
import type { PieChartProps } from '../../../types/pie';

const props = withDefaults(defineProps<PieChartProps>(), {
  height: '300px',
  width: '100%',
  autoresize: true,
  radius: () => '60%', // 饼图默认实心，使用坕个坊径�?
  center: () => ['50%', '50%'],
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
    const { buildOption } = usePieChart(props, isDark, themeColors, styleHelpers);
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

