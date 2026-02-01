import { type Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { DualBarCompareChartProps } from '../../../types/bar';
import { getColorByIndex } from '../../../utils/color';
import type { ChartStyleHelpers } from '../../../composables/useChartComponent';

/**
 * 双柱对比图 composable
 */
export function useDualBarCompareChart(
  props: DualBarCompareChartProps,
  _isDark: Ref<boolean>,
  _themeColors: ReturnType<typeof import('../../../utils/css-var').getThemeColors>,
  styleHelpers: ChartStyleHelpers
) {
  const buildOption = (): EChartsOption => {
    const option: any = {
      title: {
        text: props.title || '',
        ...styleHelpers.getTitleStyle()
      },
      tooltip: props.showTooltip ?? true ? {
        ...styleHelpers.getTooltipStyle('axis'),
        axisPointer: {
          type: 'shadow'
        },
        confine: true,
        appendToBody: true
      } : undefined,
      legend: props.showLegend ?? true ? {
        ...styleHelpers.getLegendStyle('top'),
        data: [props.label1 || '数据1', props.label2 || '数据2']
      } : undefined,
      toolbox: {
        show: props.showToolbar ?? false,
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
        // iconStyle.borderColor 由 ECharts 主题处理
      },
      grid: props.grid || {
        left: '3%',
        right: '4%',
        top: '10%',
        bottom: '3%'
      },
      xAxis: {
        type: 'category',
        data: props.xAxisData,
        axisLabel: styleHelpers.getAxisLabelStyle(true),
        ...styleHelpers.getAxisLineStyle(true)
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        ...styleHelpers.getSplitLineStyle(true),
        axisLabel: {
          ...styleHelpers.getAxisLabelStyle(true),
          formatter: props.yAxisFormatter ? `{value}${props.yAxisFormatter}` : '{value}'
        }
      },
      series: [
        ...props.data1.map((item) => ({
          name: props.label1 || '数据1',
          type: 'bar' as const,
          data: item.data,
          barWidth: item.barWidth || '30%',
          itemStyle: {
            color: item.color || getColorByIndex(0)
          },
          label: {
            show: props.showLabel ?? false,
            position: 'top' as const,
            // 使用固定的灰色值，在浅色和深色主题下都能看到（参考 art-design-pro）
            color: '#999',
            fontSize: 12
          }
        })),
        ...props.data2.map((item) => ({
          name: props.label2 || '数据2',
          type: 'bar' as const,
          data: item.data,
          barWidth: item.barWidth || '30%',
          itemStyle: {
            color: item.color || getColorByIndex(1)
          },
          label: {
            show: props.showLabel ?? false,
            position: 'top' as const,
            // 使用固定的灰色值，在浅色和深色主题下都能看到（参考 art-design-pro）
            color: '#999',
            fontSize: 12
          }
        }))
      ] as any
    };

    return option as EChartsOption;
  };

  return {
    buildOption
  };
}
