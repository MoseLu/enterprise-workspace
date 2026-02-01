/**
 * 图表组件类型定义
 */
export interface LineChartData {
    name: string;
    value: number;
}
export interface LineChartProps {
    data: LineChartData[];
    title?: string;
    xAxisKey?: string;
    yAxisKey?: string;
    color?: string;
    height?: number;
}
export interface BarChartData {
    name: string;
    value: number;
}
export interface BarChartProps {
    data: BarChartData[];
    title?: string;
    xAxisKey?: string;
    yAxisKey?: string;
    color?: string;
    height?: number;
}
export interface PieChartDataItem {
    name: string;
    value: number;
    color?: string;
}
export interface PieChartProps {
    data: PieChartDataItem[];
    title?: string;
    height?: number;
    showLegend?: boolean;
}
