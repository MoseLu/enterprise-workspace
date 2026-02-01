import type { Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { PieChartProps } from '../../../types/pie';
import { getColorByIndex } from '../../../utils/color';
import { getThemeColors } from '../../../utils/css-var';
import type { ChartStyleHelpers } from '../../../composables/useChartComponent';

/**
 * 饼图 composable
 */
export function usePieChart(
  props: PieChartProps,
  isDark: Ref<boolean>,
  themeColors: ReturnType<typeof import('../../../utils/css-var').getThemeColors>,
  styleHelpers: ChartStyleHelpers
) {
  const buildOption = (): EChartsOption => {
    // 每次构建时重新获取主题颜色，用于需要动态计算的颜色（如饼图边框）
    const currentThemeColors = typeof window !== 'undefined' 
      ? getThemeColors()
      : themeColors;
    const bgColor = isDark.value ? currentThemeColors.dark.bgColor : currentThemeColors.bgColor;

    const option: any = {
      title: {
        text: props.title || '',
        ...styleHelpers.getTitleStyle()
      },
      tooltip: props.showTooltip ?? true ? {
        ...styleHelpers.getTooltipStyle('item'),
        formatter: '{a} <br/>{b}: {c} ({d}%)',
        confine: true,
        appendToBody: true
      } : undefined,
      legend: props.showLegend ?? true ? styleHelpers.getLegendStyle(props.legendPosition || 'top') : undefined,
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
      series: [
        {
          name: '??',
          type: 'pie',
          // ??????????????????????????????
          radius: Array.isArray(props.radius) ? props.radius : (props.radius || '60%'),
          center: props.center || ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: bgColor,
            borderWidth: 2
          },
          label: {
            show: props.showLabel ?? false,
            position: props.labelPosition || 'outside',
            // 使用固定的灰色值，在浅色和深色主题下都能看到（参考 art-design-pro）
            color: '#999',
            fontSize: 12
          },
          labelLine: {
            show: props.showLabelLine ?? true,
            lineStyle: {
              // 使用固定的灰色值，在浅色和深色主题下都能看到
              color: '#999'
            }
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
              // 使用固定的灰色值，在浅色和深色主题下都能看到
              color: '#999'
            }
          },
          data: props.data.map((item, index) => ({
            name: item.name,
            value: item.value,
            itemStyle: {
              color: item.color || getColorByIndex(index)
            }
          }))
        }
      ]
    };

    return option as EChartsOption;
  };

  return {
    buildOption
  };
}
