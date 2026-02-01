import type { BaseChartProps, InteractionProps } from './base';

/**
 * 饼图数据项
 */
export interface PieChartDataItem {
  /** 数据项名称 */
  name: string;
  /** 数据值 */
  value: number;
  /** 颜色 */
  color?: string;
}

/**
 * 饼图属性
 */
export interface PieChartProps extends BaseChartProps, InteractionProps {
  /** 饼图数据 */
  data: PieChartDataItem[];
  /** 半径 [内半径, 外半径] */
  radius?: [string, string] | string | undefined;
  /** 中心位置 [x, y] */
  center?: [string, string] | undefined;
  /** 图例位置 */
  legendPosition?: 'top' | 'bottom' | 'left' | 'right' | undefined;
  /** 是否显示标签线 */
  showLabelLine?: boolean | undefined;
  /** 标签位置 */
  labelPosition?: 'inside' | 'outside' | 'center' | undefined;
}

/**
 * 环形图属性
 */
export interface RingChartProps extends PieChartProps {
  /** 内半径（默认使用 radius[0]） */
  innerRadius?: string | undefined;
  /** 外半径（默认使用 radius[1]） */
  outerRadius?: string | undefined;
}

