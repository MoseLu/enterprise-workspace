import { type Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { RingChartProps } from '../../../types/pie';
import { getColorByIndex } from '../../../utils/color';
import { getThemeColors } from '../../../utils/css-var';
import type { ChartStyleHelpers } from '../../../composables/useChartComponent';

/**
 * 环形图 composable
 */
export function useRingChart(
  props: RingChartProps,
  isDark: Ref<boolean>,
  themeColors: ReturnType<typeof import('../../../utils/css-var').getThemeColors>,
  styleHelpers: ChartStyleHelpers
) {
  const buildOption = (): EChartsOption => {
    // 每次构建时重新获取主题颜色，用于需要动态计算的颜色（如环形图边框）
    const currentThemeColors = typeof window !== 'undefined'
      ? getThemeColors()
      : themeColors;
    const bgColor = isDark.value ? currentThemeColors.dark.bgColor : currentThemeColors.bgColor;

    const innerRadius = props.innerRadius || (Array.isArray(props.radius) ? props.radius[0] : '40%');
    const outerRadius = props.outerRadius || (Array.isArray(props.radius) ? props.radius[1] : '70%');

    // 根据图例位置动态调整圆心位置，避免遮住图例
    const getCenterPosition = (): [string, string] => {
      // 如果用户手动指定了 center，则使用用户指定的值
      if (props.center && Array.isArray(props.center) && props.center.length === 2) {
        return props.center;
      }

      // 如果没有显示图例，使用默认居中位置
      if (!(props.showLegend ?? true)) {
        return ['50%', '50%'];
      }

      // 根据图例位置调整圆心
      const legendPosition = props.legendPosition || 'top';
      switch (legendPosition) {
        case 'bottom':
          // 图例在底部，圆心向上移动更多，避免遮住图例
          return ['50%', '40%'];
        case 'top':
          // 图例在顶部，圆心向下移动
          return ['50%', '60%'];
        case 'left':
          // 图例在左侧，圆心向右移动
          return ['60%', '50%'];
        case 'right':
          // 图例在右侧，圆心向左移动
          return ['40%', '50%'];
        default:
          return ['50%', '50%'];
      }
    };

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
          name: props.title || '',
          type: 'pie',
          radius: [innerRadius, outerRadius],
          center: getCenterPosition(),
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

