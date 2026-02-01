/**
 * 容器组件类型定义
 */

export interface BtcContainerProps {
  /**
   * 子组件之间的间距，默认 10px
   */
  gap?: number | string;

  /**
   * 每行列数，不指定时根据子组件数量自动计算
   */
  colsPerRow?: number;

  /**
   * 每行最大列数（已废弃，使用 colsPerRow）
   */
  maxColsPerRow?: number;
}
