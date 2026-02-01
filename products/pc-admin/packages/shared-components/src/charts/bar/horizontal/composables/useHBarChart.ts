import { type Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { HBarChartProps } from '../../../types/bar';
import { createHorizontalGradient } from '../../../utils/gradient';
import { getColorByIndex } from '../../../utils/color';
import type { ChartStyleHelpers } from '../../../composables/useChartComponent';

/**
 * 横向柱状图 composable
 */
export function useHBarChart(
  props: HBarChartProps,
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
          formatter: props.xAxisFormatter ? `{value}${props.xAxisFormatter}` : '{value}'
        }
      },
      yAxis: {
        type: 'category',
        data: props.yAxisData,
        axisLabel: styleHelpers.getAxisLabelStyle(true),
        ...styleHelpers.getAxisLineStyle(true)
      },
      series: props.data.map((item, index) => {
        const baseColor = item.color || getColorByIndex(index);
        
        const seriesConfig: any = {
          name: item.name,
          type: 'bar',
          data: item.data,
          barWidth: item.barWidth || '60%',
          stack: item.stack, // 支持堆叠
          label: {
            show: props.showLabel ?? false,
            position: 'right',
            // 使用固定的灰色值，在浅色和深色主题下都能看到（参考 art-design-pro）
            color: '#999',
            fontSize: 12
          }
        };

        // ??????
        if (props.useGradient) {
          seriesConfig.itemStyle = {
            color: createHorizontalGradient(baseColor, 0.8, 0.2)
          };
        } else {
          seriesConfig.itemStyle = {
            color: baseColor
          };
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

