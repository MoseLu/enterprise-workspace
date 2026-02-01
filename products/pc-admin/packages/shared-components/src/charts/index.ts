// 导出所有图表组件
export { BtcLineChart } from './line';
export { BtcBarChart } from './bar';
export { BtcHBarChart } from './bar';
export { BtcDualBarCompareChart } from './bar';
export { BtcPieChart } from './pie';
export { BtcRingChart } from './pie';
export { BtcRadarChart } from './radar';
export { BtcScatterChart } from './scatter';
export { BtcKLineChart } from './kline';

// 导出所有类型（从各个类型文件直接导出）
export type {
  BaseChartProps,
  AxisDisplayProps,
  InteractionProps,
  GridConfig,
  ChartThemeConfig
} from './types/base';

export type {
  LineChartProps,
  LineChartDataItem
} from './types/line';

export type {
  BarChartProps,
  BarChartDataItem,
  HBarChartProps,
  DualBarCompareChartProps
} from './types/bar';

export type {
  PieChartProps,
  PieChartDataItem,
  RingChartProps
} from './types/pie';

export type {
  RadarChartProps,
  RadarChartDataItem,
  RadarIndicator
} from './types/radar';

export type {
  ScatterChartProps,
  ScatterChartDataItem,
  ScatterDataPoint
} from './types/scatter';

export type {
  KLineChartProps,
  KLineChartDataItem,
  KLineDataPoint
} from './types/kline';

// 向后兼容：导出旧类型名称作为新类型的别名
export type { LineChartDataItem as LineChartData } from './types/line';
export type { BarChartDataItem as BarChartData } from './types/bar';

// 导出 composables
export { useChart, useChartComponent } from './composables';

// 导出工具函数
export * from './utils';
