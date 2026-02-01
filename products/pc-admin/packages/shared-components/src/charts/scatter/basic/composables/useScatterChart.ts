import { type Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { ScatterChartProps } from '../../../types/scatter';
import { getColorByIndex } from '../../../utils/color';
import type { ChartStyleHelpers } from '../../../composables/useChartComponent';

/**
 * 散点图 composable
 */
export function useScatterChart(
  props: ScatterChartProps,
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
        ...styleHelpers.getTooltipStyle('item'),
        formatter: (params: any) => {
          const data = params.data;
          if (Array.isArray(data.value)) {
            return `${params.seriesName}<br/>${props.xAxisName || 'X'}: ${data.value[0]}<br/>${props.yAxisName || 'Y'}: ${data.value[1]}`;
          }
          return `${params.seriesName}<br/>${params.name || ''}`;
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
        name: props.xAxisName,
        nameTextStyle: {
          ...styleHelpers.getAxisLabelStyle(true)
        },
        axisLabel: styleHelpers.getAxisLabelStyle(true),
        ...styleHelpers.getAxisLineStyle(true),
        ...styleHelpers.getSplitLineStyle(true)
      },
      yAxis: {
        type: 'value',
        name: props.yAxisName,
        nameTextStyle: {
          ...styleHelpers.getAxisLabelStyle(true)
        },
        axisLabel: styleHelpers.getAxisLabelStyle(true),
        ...styleHelpers.getAxisLineStyle(true),
        ...styleHelpers.getSplitLineStyle(true)
      },
      series: (props.data || []).map((item, index) => {
        const baseColor = item.color || getColorByIndex(index);
        const symbolSize = item.symbolSize || 10;

        return {
          name: item.name,
          type: 'scatter' as const,
          data: (item.data || []).map(point => {
            // ?? value ????? [x, y]
            const value = Array.isArray(point.value) ? point.value : [point.value, 0];
            const pointSymbolSize = point.symbolSize || symbolSize;
            return {
              value: value,
              name: point.name,
              symbolSize: typeof pointSymbolSize === 'function' ? pointSymbolSize : (typeof pointSymbolSize === 'number' ? pointSymbolSize : 10),
              itemStyle: {
                color: point.color || baseColor
              }
            };
          }),
          symbol: item.symbol || 'circle',
          symbolSize: typeof symbolSize === 'function' ? symbolSize : (typeof symbolSize === 'number' ? symbolSize : 10),
          itemStyle: {
            color: baseColor
          },
          label: {
            show: props.showLabel ?? false,
            // 使用固定的灰色值，在浅色和深色主题下都能看到（参考 art-design-pro）
            color: '#999',
            fontSize: 12
          }
        };
      }) as any
    };

    return option as EChartsOption;
  };

  return {
    buildOption
  };
}
