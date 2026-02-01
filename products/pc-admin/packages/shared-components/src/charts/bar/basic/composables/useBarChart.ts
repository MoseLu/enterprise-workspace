import type { Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { BarChartProps } from '../../../types/bar';
import { createVerticalGradient, createHorizontalGradient } from '../../../utils/gradient';
import { getColorByIndex } from '../../../utils/color';
import type { ChartStyleHelpers } from '../../../composables/useChartComponent';

/**
 * 柱状图 composable
 */
export function useBarChart(
  props: BarChartProps,
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
        confine: true,
        appendToBody: true
      } : undefined,
      legend: props.showLegend ?? true ? styleHelpers.getLegendStyle('top') : undefined,
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
        ...styleHelpers.getAxisLineStyle(true),
        axisLabel: styleHelpers.getAxisLabelStyle(true)
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
      series: props.data.map((item, index) => {
        const baseColor = item.color || getColorByIndex(index);
        
        const seriesConfig: any = {
          name: item.name,
          type: 'bar',
          data: item.data,
          barWidth: item.barWidth || '60%',
          label: {
            show: props.showLabel ?? false,
            position: 'top',
            // 使用固定的灰色值，在浅色和深色主题下都能看到（参考 art-design-pro）
            color: '#999',
            fontSize: 12
          }
        };

        // ??????
        if (props.useGradient) {
          const gradient = props.gradientDirection === 'horizontal'
            ? createHorizontalGradient(baseColor, 0.8, 0.2)
            : createVerticalGradient(baseColor, 0.8, 0.2);
          seriesConfig.itemStyle = {
            color: gradient
          };
        } else {
          seriesConfig.itemStyle = {
            color: baseColor
          };
        }

        // ????? stack?????
        if (item.stack) {
          seriesConfig.stack = item.stack;
        }

        return seriesConfig;
      })
    };

    return option as EChartsOption;
  };

  return {
    buildOption
  };
}

