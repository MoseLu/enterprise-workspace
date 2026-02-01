<template>
  <div ref="chartContainerRef" class="btc-pie-chart" :style="{ height: height, width: width }">
    <v-chart
      v-if="isContainerReady"
      :key="chartThemeKey"
      :option="chartOption"
      :autoresize="autoresize"
      :style="{ width: '100%', height: '100%' }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useDark } from '@vueuse/core';
import { getInstanceByDom } from 'echarts/core';
import { useChart } from './composables/useChart';
import type { BaseChartProps } from './types/base';
import { logger } from '@btc/shared-core';
;


export interface PieChartDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  title?: string;
  data: PieChartDataItem[];
  height?: string;
  width?: string;
  autoresize?: boolean;
  radius?: [string, string];
  center?: [string, string];
  showLegend?: boolean;
  showTooltip?: boolean;
  showToolbar?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
}

const props = withDefaults(defineProps<PieChartProps>(), {
  height: '300px',
  width: '100%',
  autoresize: true,
  radius: () => ['40%', '70%'],
  center: () => ['50%', '50%'],
  showLegend: true,
  showTooltip: true,
  showToolbar: false,
  legendPosition: 'top'
});

// 创建一个 useChart 实例来获取样式函数
const chartContainerRefForStyles = ref<HTMLElement | null>(null);
const chartForStyles = useChart(
  chartContainerRefForStyles,
  {} as BaseChartProps,
  () => ({}) // 临时 buildOption，我们只需要样式函数
);
const {
  getTooltipStyle,
  getLegendStyle,
  getTitleStyle
} = chartForStyles;

const isDark = useDark();
// 添加 key 确保主题变化时强制重新渲染（保留用于初始化）
const chartThemeKey = ref(0);

// 默认颜色配置
const defaultColors = [
  '#409eff', '#67c23a', '#e6a23c', '#f56c6c',
  '#909399', '#c71585', '#ff6347', '#40e0d0'
];

function getDefaultColor(index: number): string {
  const color = defaultColors[index % defaultColors.length];
  return color || defaultColors[0] || '#409eff';
}

// 使用 computed 让 chartOption 响应式，当 isDark 变化时会自动重新计算
const chartOption = computed(() => {
  // 使用固定的灰色值，在浅色和深色主题下都能看到（参考 art-design-pro）
  const textColor = '#999';
  const bgColor = isDark.value ? '#1d1e1f' : '#ffffff';

  return {
  title: {
      text: props.title || '',
      ...getTitleStyle()
  },
    tooltip: props.showTooltip ? {
      ...getTooltipStyle('item'),
    formatter: '{a} <br/>{b}: {c} ({d}%)',
    confine: true,
    appendToBody: true
    } : undefined,
    legend: props.showLegend ? getLegendStyle(props.legendPosition) : undefined,
    toolbox: props.showToolbar ? {
      show: true,
    right: '10px',
    top: '10px',
    feature: {
      saveAsImage: {
        show: true,
        title: '保存为图片',
        type: 'png',
        pixelRatio: 2
      },
      dataView: {
        show: true,
        title: '数据视图',
        readOnly: false
      },
      restore: {
        show: true,
        title: '还原'
      }
    }
    } : undefined,
  series: [
    {
      name: '数据',
      type: 'pie',
      radius: props.radius,
      center: props.center,
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
          borderColor: bgColor,
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center',
          color: textColor
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
            fontWeight: 'bold',
            color: textColor
        }
      },
      labelLine: {
          show: false,
          lineStyle: {
            color: textColor
          }
      },
        data: props.data.map((item, index) => ({
    name: item.name,
    value: item.value,
    itemStyle: {
      color: item.color || getDefaultColor(index)
    }
        }))
      }
    ]
  };
});

// 监听主题变化，更新图表（参考 art-design-pro 的实现方式）
watch(
  () => isDark.value,
  () => {
    if (chartContainerRef.value) {
      // 使用 requestAnimationFrame 优化主题更新
      requestAnimationFrame(() => {
              if (chartContainerRef.value) {
                try {
                  const chartInstance = getInstanceByDom(chartContainerRef.value);
                  if (chartInstance) {
              // 获取最新的图表选项（computed 会自动重新计算）
              const newOption = chartOption.value;
              // 使用 notMerge: true 完全替换选项，确保颜色配置被正确应用
              chartInstance.setOption(newOption, {
                notMerge: true,
                lazyUpdate: false
              });
                  }
                } catch (error) {
            logger.error('[BtcPieChart] 更新图表失败:', error);
          }
        }
          });
    }
  }
);

// 图表容器引用
const chartContainerRef = ref<HTMLElement | null>(null);
const isContainerReady = ref(false);

// 检查容器尺寸
const checkContainerSize = (): boolean => {
  if (!chartContainerRef.value) {
    return false;
  }
  const rect = chartContainerRef.value.getBoundingClientRect();
  const hasSize = rect.width > 0 && rect.height > 0;
  if (hasSize && !isContainerReady.value) {
    isContainerReady.value = true;
  }
  return hasSize;
};

// 组件挂载后检查容器尺寸
onMounted(() => {
  nextTick(() => {
    checkContainerSize();
    if (!isContainerReady.value) {
      const checkInterval = setInterval(() => {
        if (checkContainerSize()) {
          clearInterval(checkInterval);
        }
      }, 50);
      // 最多等待 5 秒
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 5000);
    }
  });
});

// 组件卸载时清理 tooltip、toolbox 和 ECharts 实例
onBeforeUnmount(() => {
  if (chartContainerRef.value) {
    try {
      const chartInstance = getInstanceByDom(chartContainerRef.value);
      if (chartInstance) {
        // 隐藏 tooltip
        chartInstance.dispatchAction({
          type: 'hideTip'
        });
        // 销毁 ECharts 实例，这会自动清理所有相关的 DOM 元素（包括 toolbox）
        chartInstance.dispose();
      }
    } catch (error) {
      // 忽略错误，可能图表已经销毁
    }
  }

  // 清理 body 中残留的 tooltip DOM
  const tooltipElements = document.querySelectorAll('.echarts-tooltip');
  tooltipElements.forEach(el => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });

  // 清理 body 中残留的 toolbox 相关 DOM（数据视图弹窗等）
  const toolboxElements = document.querySelectorAll('.echarts-toolbox, .echarts-data-view');
  toolboxElements.forEach(el => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
});
</script>

<style lang="scss" scoped>
.btc-pie-chart {
  width: 100%;
  height: 100%;
}
</style>
