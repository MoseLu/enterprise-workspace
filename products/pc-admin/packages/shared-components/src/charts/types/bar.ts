import type { BaseChartProps, InteractionProps, GridConfig } from './base';

/**
 * 柱状图数据项
 */
export interface BarChartDataItem {
  /** 数据系列名称 */
  name: string;
  /** 数据值数组 */
  data: number[];
  /** 柱状图颜色 */
  color?: string;
  /** 柱状图宽度 */
  barWidth?: number | string;
  /** 是否堆叠 */
  stack?: string;
}

/**
 * 柱状图属性
 */
export interface BarChartProps extends BaseChartProps, InteractionProps {
  /** 柱状图数据 */
  data: BarChartDataItem[];
  /** X轴数据 */
  xAxisData: string[];
  /** 网格配置 */
  grid?: GridConfig | undefined;
  /** Y轴格式化 */
  yAxisFormatter?: string | undefined;
  /** 是否使用渐变 */
  useGradient?: boolean | undefined;
  /** 渐变方向 */
  gradientDirection?: 'vertical' | 'horizontal' | undefined;
}

/**
 * 横向柱状图属性
 */
export interface HBarChartProps extends BaseChartProps, InteractionProps {
  /** 横向柱状图数据 */
  data: BarChartDataItem[];
  /** Y轴数据（类别） */
  yAxisData: string[];
  /** 网格配置 */
  grid?: GridConfig | undefined;
  /** X轴格式化 */
  xAxisFormatter?: string | undefined;
  /** 是否使用渐变 */
  useGradient?: boolean | undefined;
}

/**
 * 双柱对比图属性
 */
export interface DualBarCompareChartProps extends BaseChartProps, InteractionProps {
  /** 第一组数据 */
  data1: BarChartDataItem[];
  /** 第二组数据 */
  data2: BarChartDataItem[];
  /** X轴数据 */
  xAxisData: string[];
  /** 第一组数据标签 */
  label1?: string | undefined;
  /** 第二组数据标签 */
  label2?: string | undefined;
  /** 网格配置 */
  grid?: GridConfig | undefined;
  /** Y轴格式化 */
  yAxisFormatter?: string | undefined;
}

