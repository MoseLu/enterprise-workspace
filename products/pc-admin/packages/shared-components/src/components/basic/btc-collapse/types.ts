/**
 * BtcCollapse 组件类型定义
 */

export interface BtcCollapseProps {
  /**
   * 当前激活的面板（v-model）
   */
  modelValue?: string | string[];
  
  /**
   * 是否手风琴模式（同时只能展开一个面板）
   */
  accordion?: boolean;
}

export interface BtcCollapseItemProps {
  /**
   * 唯一标识符
   */
  name: string | number;
}
