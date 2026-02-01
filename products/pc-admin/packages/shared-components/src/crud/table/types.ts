import type { Component } from 'vue';

/**
 * 表格列配置（对齐 cool-admin）
 */
export interface TableColumn {
  // 列类型
  type?: 'selection' | 'index' | 'expand' | 'op' | string;

  // 基础属性
  prop?: string;
  label?: string;
  width?: string | number;
  minWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  fixed?: boolean | 'left' | 'right';
  sortable?: boolean | 'custom';
  showOverflowTooltip?: boolean;
  resizable?: boolean;
  hidden?: boolean; // 是否隐藏列
  toggleable?: boolean; // 是否允许通过工具栏切换显示
  alwaysVisible?: boolean; // 兼容旧字段，true 时与 toggleable: false 相同

  // 渲染
  formatter?: (row: any, column: any, cellValue: any, index: number) => string;
  component?: {
    name: string | Component;
    props?: Record<string, any>;
  };

  // 字典匹配（对齐 cool-admin）
  dict?: Array<{
    label: string;
    value: any;
    type?: 'success' | 'warning' | 'danger' | 'info' | 'primary';
    [key: string]: any;
  }>;
  dictColor?: boolean; // 是否使用彩色标签
  dictAllLevels?: boolean; // 显示所有层级（树形字典）

  // 操作列配置
  buttons?: OpButton[] | ((options: { scope: any }) => OpButton[]);

  // 多级表头
  children?: TableColumn[];

  // 其他属性
  [key: string]: any;
}

/**
 * 操作按钮配置
 */
export type OpButton =
  | 'edit'       // 编辑
  | 'delete'     // 删除
  | 'info'       // 查看
  | 'detail'     // 详情
  | `slot-${string}`  // 插槽
  | {
      label: string;
      type?: string;
      icon?: string;
      onClick?: (options: { scope: any }) => void;
    };

/**
 * 操作列配置
 */
export interface OpConfig {
  buttons?: OpButton[];
}

export type TableSize = 'small' | 'default' | 'large';
export type TableToolbarItem = 'size' | 'columns' | 'style';

export interface TableToolbarOptions {
  visible?: boolean;
  layout?: TableToolbarItem[];
  storageKey?: string;
}

/**
 * Props 配置
 */
export interface TableProps {
  columns?: TableColumn[];

  // 高度控制（对齐 cool-admin）
  autoHeight?: boolean; // 是否自动计算高度
  height?: string | number; // 固定高度
  maxHeight?: string | number; // 最大高度

  // 表格样式
  border?: boolean; // 是否显示边框，默认 true
  stripe?: boolean;
  headerBackground?: boolean;
  size?: TableSize;
  headerCellStyle?: Record<string, any> | ((data: any) => Record<string, any>);

  // 其他配置
  rowKey?: string; // 行唯一键，默认 'id'
  emptyText?: string; // 空数据文案
  defaultSort?: {
    prop: string;
    order: 'ascending' | 'descending';
  }; // 默认排序
  sortRefresh?: boolean; // 排序后是否刷新，默认 true
  contextMenu?: Array<string | any> | boolean; // 右键菜单配置

  // 操作列配置
  op?: OpConfig; // 操作列配置

  // 自动列配置
  disableAutoCreatedAt?: boolean; // 禁止自动追加创建时间列

  // 工具栏与偏好
  toolbar?: boolean | TableToolbarOptions;
  storageKey?: string;
}

