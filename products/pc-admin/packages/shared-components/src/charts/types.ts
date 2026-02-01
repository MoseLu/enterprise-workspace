/**
 * 图表组件类型定义
 */

// 线图数据类型
export interface LineChartData {
  name: string;
  value: number;
}

// 线图属性类型
export interface LineChartProps {
  data: LineChartData[];
  title?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  color?: string;
  height?: number;
}

// 柱状图数据类型
export interface BarChartData {
  name: string;
  value: number;
}

// 柱状图属性类型
export interface BarChartProps {
  data: BarChartData[];
  title?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  color?: string;
  height?: number;
}

// 饼图数据项类型
export interface PieChartDataItem {
  name: string;
  value: number;
  color?: string;
}

// 饼图属性类型
export interface PieChartProps {
  data: PieChartDataItem[];
  title?: string;
  height?: number;
  showLegend?: boolean;
}
