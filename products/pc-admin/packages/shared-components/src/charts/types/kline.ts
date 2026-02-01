import type { BaseChartProps, InteractionProps, GridConfig } from './base';

/**
 * K线图数据点 [开盘, 收盘, 最低, 最高]
 */
export type KLineDataPoint = [number, number, number, number];

/**
 * K线图数据项
 */
export interface KLineChartDataItem {
  /** 日期/时间 */
  date: string;
  /** K线数据 [开盘, 收盘, 最低, 最高] */
  value: KLineDataPoint;
  /** 成交量（可选） */
  volume?: number;
}

/**
 * K线图属性
 */
export interface KLineChartProps extends BaseChartProps, InteractionProps {
  /** K线图数据 */
  data: KLineChartDataItem[];
  /** 网格配置 */
  grid?: GridConfig | undefined;
  /** 是否显示成交量 */
  showVolume?: boolean | undefined;
  /** 是否显示数据缩放控件 */
  showDataZoom?: boolean | undefined;
  /** 数据缩放初始开始位置 */
  dataZoomStart?: number | undefined;
  /** 数据缩放初始结束位置 */
  dataZoomEnd?: number | undefined;
  /** 上涨颜色 */
  upColor?: string | undefined;
  /** 下跌颜色 */
  downColor?: string | undefined;
}

