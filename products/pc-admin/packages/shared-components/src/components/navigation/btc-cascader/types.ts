/**
 * BtcCascader 组件类型定义
 */

export interface BtcCascaderOption {
  value?: string | number;
  label?: string;
  id?: string | number;
  name?: string;
  children?: BtcCascaderOption[];
}

export interface BtcCascaderProps {
  modelValue?: any;
  options?: BtcCascaderOption[];
  placeholder?: string;
  clearable?: boolean;
  filterable?: boolean;
  showAllLevels?: boolean;
  checkStrictly?: boolean;
  emitPath?: boolean;
  checkOnClickNode?: boolean;
  multiple?: boolean; // 是否多选
  collapseTags?: boolean; // 多选时是否折叠标签
  collapseTagsTooltip?: boolean; // 折叠标签是否显示提示
  maxCollapseTags?: number; // 最大折叠标签数量
  style?: Record<string, any>;
  showCount?: boolean; // 是否显示子节点数量
}
