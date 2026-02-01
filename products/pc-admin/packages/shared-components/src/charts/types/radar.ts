import type { BaseChartProps, InteractionProps } from './base';

/**
 * 雷达图指标项
 */
export interface RadarIndicator {
  /** 指标名称 */
  name: string;
  /** 最大值 */
  max: number;
  /** 最小值（可选） */
  min?: number;
}

/**
 * 雷达图数据项
 */
export interface RadarChartDataItem {
  /** 数据系列名称 */
  name: string;
  /** 数据值数组（对应指标顺序） */
  data: number[];
  /** 颜色 */
  color?: string;
  /** 是否填充区域 */
  areaStyle?: boolean;
}

/**
 * 雷达图属性
 */
export interface RadarChartProps extends BaseChartProps, InteractionProps {
  /** 雷达图指标配置 */
  indicators: RadarIndicator[];
  /** 雷达图数据 */
  data: RadarChartDataItem[];
  /** 雷达图中心位置 */
  center?: [string, string] | undefined;
  /** 雷达图半径 */
  radius?: string | undefined;
  /** 分割数 */
  splitNumber?: number | undefined;
}

