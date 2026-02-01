import { type Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { RadarChartProps } from '../../../types/radar';
import { getColorByIndex } from '../../../utils/color';
import { getThemeColors } from '../../../utils/css-var';
import type { ChartStyleHelpers } from '../../../composables/useChartComponent';

/**
 * 雷达图 composable
 */
export function useRadarChart(
  props: RadarChartProps,
  isDark: Ref<boolean>,
  themeColors: ReturnType<typeof import('../../../utils/css-var').getThemeColors>,
  styleHelpers: ChartStyleHelpers
) {
  const buildOption = (): EChartsOption => {
    // 每次构建时重新获取主题颜色，用于需要动态计算的颜色（如雷达图分割区域）
    const currentThemeColors = typeof window !== 'undefined' 
      ? getThemeColors()
      : themeColors;
    const borderColor = isDark.value ? currentThemeColors.dark.borderColor : currentThemeColors.borderColorLight;

    const option: any = {
      title: {
        text: props.title || '',
        ...styleHelpers.getTitleStyle()
      },
      tooltip: props.showTooltip ?? true ? {
        ...styleHelpers.getTooltipStyle('item'),
        confine: true,
        appendToBody: true
      } : undefined,
      legend: props.showLegend ?? true ? {
        ...styleHelpers.getLegendStyle('top'),
        data: (props.data || []).map(item => item.name)
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
      radar: {
        center: props.center || ['50%', '55%'],
        radius: props.radius || '75%',
        splitNumber: props.splitNumber || 5,
        indicator: props.indicators.map(indicator => ({
          name: indicator.name,
          max: indicator.max,
          min: indicator.min ?? 0,
          // 使用样式函数设置指标名称颜色
          nameTextStyle: {
            ...styleHelpers.getAxisLabelStyle(true)
          }
        })),
        splitArea: {
          areaStyle: {
            color: [borderColor + '20', borderColor + '10']
          }
        },
        splitLine: {
          ...styleHelpers.getSplitLineStyle(true)
        },
        axisLine: {
          ...styleHelpers.getAxisLineStyle(true)
        }
      },
      series: (props.data || []).map((item, index) => {
        const baseColor = item.color || getColorByIndex(index);
        
        return {
          name: item.name,
          type: 'radar',
          data: [
            {
              value: item.data || [],
              itemStyle: {
                color: baseColor
              },
              areaStyle: item.areaStyle ? {
                color: baseColor + '40'
              } : undefined,
              lineStyle: {
                color: baseColor,
                width: 2
              }
            }
          ]
        };
      })
    };

    return option as EChartsOption;
  };

  return {
    buildOption
  };
}

