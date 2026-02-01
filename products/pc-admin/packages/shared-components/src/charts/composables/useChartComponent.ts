import { computed, type Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { BaseChartProps } from '../types/base';
import { useChart } from './useChart';
import { getThemeColors } from '../utils/css-var';

/**
 * 样式辅助函数类型
 */
export type ChartStyleHelpers = {
  getAxisLabelStyle: (show?: boolean, fontSize?: number) => any;
  getAxisLineStyle: (show?: boolean) => any;
  getSplitLineStyle: (show?: boolean) => any;
  getTooltipStyle: (trigger?: 'item' | 'axis', customOptions?: any) => any;
  getLegendStyle: (position?: 'bottom' | 'top' | 'left' | 'right', customOptions?: any) => any;
  getTitleStyle: (customOptions?: any) => any;
};

/**
 * 组件抽象 composable
 * 简化图表组件的开发
 */
export function useChartComponent<T extends BaseChartProps = BaseChartProps>(
  containerRef: Ref<HTMLElement | null>,
  props: T,
  buildOption: (
    isDark: Ref<boolean>,
    themeColors: ReturnType<typeof getThemeColors>,
    styleHelpers: ChartStyleHelpers
  ) => EChartsOption | Ref<EChartsOption> | (() => EChartsOption)
) {
  // useChart 现在会将样式函数作为第二个参数传递给 buildOption
  // 我们需要创建一个包装函数来适配新的签名
  // 使用类型断言来适配 exactOptionalPropertyTypes 的兼容性
  const chart = useChart(containerRef, props as BaseChartProps, (isDark, styleHelpers) => {
    const themeColors = getThemeColors();
    // buildOption 需要接收 styleHelpers，但 useChartComponent 的 buildOption 签名不同
    // 我们需要创建一个适配器
    const option = buildOption(isDark, themeColors, styleHelpers!);
    if (typeof option === 'function') {
      return option();
    }
    return option;
  });

  // 计算样式
  // 在 flex 布局中，需要同时设置 height 和 min-height 以确保高度正确计算
  const chartStyle = computed(() => {
    const height = props.height || '300px';
    return {
      height: height,
      minHeight: height, // 在 flex 布局中，min-height 可以确保高度不被压缩
      width: props.width || '100%'
    };
  });

  return {
    ...chart,
    chartStyle
  };
}

