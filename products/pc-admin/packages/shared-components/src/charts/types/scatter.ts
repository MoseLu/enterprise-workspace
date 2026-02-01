import type { BaseChartProps, InteractionProps, GridConfig } from './base';

/**
 * 散点图数据点
 */
export interface ScatterDataPoint {
  /** X值 */
  value: [number, number];
  /** 数据项名称（可选） */
  name?: string;
  /** 符号大小 */
  symbolSize?: number;
  /** 颜色 */
  color?: string;
}

/**
 * 散点图数据项
 */
export interface ScatterChartDataItem {
  /** 数据系列名称 */
  name: string;
  /** 数据点数组 */
  data: ScatterDataPoint[];
  /** 颜色 */
  color?: string;
  /** 符号类型 */
  symbol?: 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond' | 'pin' | 'arrow' | 'none';
  /** 符号大小 */
  symbolSize?: number | ((value: any) => number);
}

/**
 * 散点图属性
 */
export interface ScatterChartProps extends BaseChartProps, InteractionProps {
  /** 散点图数据 */
  data: ScatterChartDataItem[];
  /** X轴名称 */
  xAxisName?: string | undefined;
  /** Y轴名称 */
  yAxisName?: string | undefined;
  /** 网格配置 */
  grid?: GridConfig | undefined;
  /** X轴格式化 */
  xAxisFormatter?: string | undefined;
  /** Y轴格式化 */
  yAxisFormatter?: string | undefined;
}

