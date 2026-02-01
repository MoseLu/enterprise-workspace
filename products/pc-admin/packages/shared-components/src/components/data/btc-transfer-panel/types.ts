import type { ComputedRef } from 'vue';
import type { CrudService } from '@btc/shared-core';

export type TransferKey = string | number;

export interface TransferPanelColumn<T = any> {
  type?: 'selection' | 'index' | 'expand' | 'op' | string;
  prop?: string;
  label?: string;
  width?: string | number;
  minWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  /**
   * 自定义格式化函数，仅在未使用插槽时生效
   */
  formatter?: (row: T, column: TransferPanelColumn<T>, index: number) => any;
  /**
   * 指定使用的插槽名称（等价于 column-${prop}）
   */
  slot?: string;
}

export interface SelectedItemDisplay {
  title: string;
  description?: string;
  tag?: string;
}

export interface TransferPanelPagination {
  page: number;
  size: number;
  total: number;
  pageSizes?: number[];
}

export interface TransferPanelOptions {
  /**
   * 是否自动加载数据
   */
  autoLoad?: boolean;
  /**
   * 刷新前钩子，可以修改请求参数
   */
  onBeforeRefresh?: (params: Record<string, unknown>) => Record<string, unknown>;
  /**
   * 刷新后钩子
   */
  onAfterRefresh?: (data: { list: any[]; total: number }) => void;
  /**
   * 分页配置
   */
  pagination?: {
    pageSizes?: number[];
    defaultPageSize?: number;
  };
}

export interface TransferPanelProps<T = any> {
  /**
   * 面板标题（可选）
   */
  title?: string;
  /**
   * 左侧数据面板标题
   */
  sourceTitle?: string;
  /**
   * 右侧已选面板标题
   */
  targetTitle?: string;
  /**
   * 静态数据源（与 service 二选一）
   */
  data?: T[];
  /**
   * CRUD 服务（与 data 二选一）
   */
  service?: CrudService<T> | {
    page?: (params: Record<string, any>) => Promise<{ list: T[]; total: number }>;
    list?: (params: Record<string, any>) => Promise<{ list: T[]; total: number } | T[]>;
    add?: (data: T) => Promise<any>;
    update?: (data: T) => Promise<any>;
    delete?: (id: any) => Promise<any>;
    deleteBatch?: (ids: any[]) => Promise<any>;
  };
  /**
   * CRUD 选项
   */
  options?: TransferPanelOptions;
  /**
   * 表格列定义
   */
  columns: TransferPanelColumn<T>[];
  /**
   * 行主键字段或函数
   */
  rowKey?: string | ((row: T) => TransferKey);
  /**
   * 选中项主键集合
   */
  modelValue: TransferKey[];
  /**
   * 是否显示加载状态
   */
  loading?: boolean;
  /**
   * 是否自动加载数据
   */
  autoLoad?: boolean;
  /**
   * 组件整体高度
   */
  height?: string | number;
  /**
   * 是否允许折叠右侧面板
   */
  collapsible?: boolean;
  /**
   * 默认在已选项中展示的字段名
   */
  displayProp?: string;
  /**
   * 默认在已选项中展示的描述字段名
   */
  descriptionProp?: string;
  /**
   * 自定义已选项展示
   */
  selectedFormatter?: (item: T | undefined, key: TransferKey) => SelectedItemDisplay | string | null | undefined;
  /**
   * 额外的已选数据映射（用于分页或懒加载场景）
   */
  selectedMap?: Record<string, T>;
  /**
   * 已选面板为空时的文案
   */
  targetEmptyText?: string;
  /**
   * 折叠按钮文案
   */
  collapseText?: {
    expand?: string;
    collapse?: string;
  };
  /**
   * 分页配置，存在时在底部显示分页器
   */
  pagination?: TransferPanelPagination;
  /**
   * 表格是否自动计算高度
   */
  autoHeight?: boolean;
  /**
   * 表格最大高度
   */
  maxHeight?: string | number;
}

export interface TransferPanelChangePayload<T = any> {
  keys: TransferKey[];
  items: T[];
}

export interface TransferPanelRemovePayload<T = any> {
  key: TransferKey;
  item: T | undefined;
}

export interface TransferPanelEmits<T = any> {
  (event: 'update:modelValue', value: TransferKey[]): void;
  (event: 'change', payload: TransferPanelChangePayload<T>): void;
  (event: 'remove', payload: TransferPanelRemovePayload<T>): void;
  (event: 'clear'): void;
  (event: 'page-change', page: number, size: number): void;
}

export interface TransferPanelExpose<T = any> {
  clear: () => void;
  toggleCollapse: (value?: boolean) => void;
  selectedItems: ComputedRef<T[]>;
  refresh: (params?: Record<string, unknown>) => void;
}


