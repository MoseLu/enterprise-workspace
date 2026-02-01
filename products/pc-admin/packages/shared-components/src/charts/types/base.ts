/**
 * 基础图表类型定义
 */

/**
 * 基础图表属性
 */
export interface BaseChartProps {
  /** 图表标题 */
  title?: string | undefined;
  /** 数据（通用类型，具体图表会定义具体结构） */
  data?: any;
  /** 高度 */
  height?: string | undefined;
  /** 宽度 */
  width?: string | undefined;
  /** 是否自动调整大小 */
  autoresize?: boolean | undefined;
  /** 是否显示加载状态 */
  loading?: boolean | undefined;
  /** 是否显示空状态 */
  showEmpty?: boolean | undefined;
}

/**
 * 坐标轴显示属性
 */
export interface AxisDisplayProps {
  /** 是否显示坐标轴 */
  show?: boolean | undefined;
  /** 坐标轴标签颜色 */
  labelColor?: string | undefined;
  /** 坐标轴线颜色 */
  lineColor?: string | undefined;
  /** 坐标轴分割线颜色 */
  splitLineColor?: string | undefined;
  /** 坐标轴标签格式化函数 */
  formatter?: string | ((value: any) => string) | undefined;
}

/**
 * 交互属性
 */
export interface InteractionProps {
  /** 是否显示提示框 */
  showTooltip?: boolean | undefined;
  /** 是否显示图例 */
  showLegend?: boolean | undefined;
  /** 是否显示工具栏 */
  showToolbar?: boolean | undefined;
  /** 是否显示标签 */
  showLabel?: boolean | undefined;
}

/**
 * 网格配置
 */
export interface GridConfig {
  left?: string | number | undefined;
  right?: string | number | undefined;
  top?: string | number | undefined;
  bottom?: string | number | undefined;
}

/**
 * 图表主题配置
 */
export interface ChartThemeConfig {
  /** 字体大小 */
  fontSize?: number | undefined;
  /** 字体颜色 */
  fontColor?: string | undefined;
  /** 主题颜色 */
  themeColor?: string | undefined;
  /** 颜色组 */
  colors?: string[] | undefined;
}

