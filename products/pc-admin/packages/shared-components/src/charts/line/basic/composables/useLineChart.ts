import type { Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { LineChartProps } from '../../../types/line';
import { createVerticalGradient } from '../../../utils/gradient';
import { getColorByIndex } from '../../../utils/color';
import type { ChartStyleHelpers } from '../../../composables/useChartComponent';

/**
 * 折线图 composable
 */
export function useLineChart(
  props: LineChartProps,
  _isDark: Ref<boolean>,
  _themeColors: ReturnType<typeof import('../../../utils/css-var').getThemeColors>,
  styleHelpers: ChartStyleHelpers
) {
  const buildOption = (): EChartsOption => {
    // 使用固定的灰色值，在浅色和深色主题下都能看到（参考 art-design-pro）
    const textColor = '#999';

    const option = {
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
      toolbox: props.showToolbar ?? false ? {
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
        axisLabel: {
          ...styleHelpers.getAxisLabelStyle(true),
          formatter: props.yAxisFormatter ? `{value}${props.yAxisFormatter}` : '{value}'
        },
        ...styleHelpers.getSplitLineStyle(true)
      },
      series: props.data.map((item, index) => {
        const baseColor = item.color || getColorByIndex(index);
        const seriesConfig: any = {
          name: item.name,
          type: 'line',
          data: item.data,
          smooth: item.smooth ?? true,
          itemStyle: {
            color: baseColor
          },
          lineStyle: {
            color: baseColor,
            width: item.lineWidth ?? 2
          },
          symbol: item.showSymbol !== false ? 'circle' : 'none',
          symbolSize: 6,
          label: {
            show: props.showLabel ?? false,
            color: textColor,
            position: 'top',
            fontSize: 12
            // color 由 ECharts 主题处理
          },
          animation: props.animation !== false,
          animationDuration: props.animationDuration ?? 1000
        };

        // 如果设置了 areaStyle，添加面积填充
        if (item.areaStyle) {
          seriesConfig.areaStyle = {
            color: createVerticalGradient(baseColor, 0.5, 0)
          };
        }

        // 如果设置了 stack，添加堆叠
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

