import type { BaseChartProps, InteractionProps, GridConfig } from './base';

/**
 * 折线图数据项
 */
export interface LineChartDataItem {
  /** 数据系列名称 */
  name: string;
  /** 数据值数组 */
  data: number[];
  /** 线条颜色 */
  color?: string;
  /** 是否平滑曲线 */
  smooth?: boolean;
  /** 是否显示面积填充 */
  areaStyle?: boolean;
  /** 线条宽度 */
  lineWidth?: number;
  /** 是否显示标记点 */
  showSymbol?: boolean;
  /** 堆叠组名 */
  stack?: string;
}

/**
 * 折线图属性
 */
export interface LineChartProps extends BaseChartProps, InteractionProps {
  /** 折线图数据 */
  data: LineChartDataItem[];
  /** X轴数据 */
  xAxisData: string[];
  /** 网格配置 */
  grid?: GridConfig | undefined;
  /** Y轴格式化 */
  yAxisFormatter?: string | undefined;
  /** 是否堆叠 */
  stack?: string | undefined;
  /** 动画配置 */
  animation?: boolean | undefined;
  /** 动画时长 */
  animationDuration?: number | undefined;
}

