/**
 * BtcFilterTableGroup 类型定义
 */

import type { ComputedRef, Ref } from 'vue';
import type { FilterCategory, FilterResult } from '../btc-filter-list/types';
import type { TableColumn } from '@btc-crud/table/types';

/**
 * 分类到列的映射配置
 */
export interface CategoryColumnMap {
  [categoryId: string]: string[]; // 分类ID -> 列prop数组
}

/**
 * 基准宽度配置
 */
export interface BaseWidthConfig {
  small: number;
  default: number;
  large: number;
}

/**
 * BtcFilterTableGroup Props
 */
export interface BtcFilterTableGroupProps {
  // 筛选相关（继承自 BtcFilterGroup）
  /**
   * 筛选分类数据（直接传入）
   */
  filterCategory?: FilterCategory[];

  /**
   * 筛选分类服务（EPS 服务）
   */
  filterService?: {
    list: (params?: any) => Promise<FilterCategory[]>;
  };

  /**
   * 是否启用搜索功能
   */
  enableFilterSearch?: boolean;

  /**
   * 默认展开的分类数量
   */
  defaultExpandedCount?: number;

  /**
   * 右侧标题
   */
  rightTitle?: string;

  // 表格相关
  /**
   * 右侧服务（CRUD）
   */
  rightService: any;

  /**
   * 表格列配置
   */
  tableColumns: TableColumn[];

  /**
   * 表单配置项
   */
  formItems?: any[];

  /**
   * 操作列配置
   */
  op?: { buttons?: any[] };

  // 列优先级配置
  /**
   * 列优先级模式：'auto' 自动（基于筛选结果），'manual' 手动（使用原始顺序）
   */
  columnPriority?: 'auto' | 'manual';

  /**
   * 是否允许列重排序（暂未实现）
   */
  enableColumnReorder?: boolean;

  /**
   * 分类ID到列prop的映射
   * 例如：{ 'production': ['productName', 'productCode'], 'status': ['status'] }
   */
  categoryColumnMap?: CategoryColumnMap;

  // 宽度配置
  /**
   * 最小左侧宽度，默认 '200px'
   */
  minLeftWidth?: string;

  /**
   * 最大左侧宽度，默认 '600px'
   */
  maxLeftWidth?: string;

  /**
   * 是否启用自动宽度调整
   */
  enableAutoWidth?: boolean;

  /**
   * 基准宽度配置
   */
  baseWidth?: BaseWidthConfig;

  /**
   * 左侧宽度（当 enableAutoWidth 为 false 时使用）
   */
  leftWidth?: string;

  /**
   * 左侧宽度类型（当 enableAutoWidth 为 false 时使用）
   */
  leftSize?: 'small' | 'default' | 'large';

  // 其他配置（继承自 BtcMasterTableGroup）
  /**
   * 是否显示新增按钮，默认 true
   */
  showAddBtn?: boolean;

  /**
   * 是否显示批量删除按钮，默认 true
   */
  showMultiDeleteBtn?: boolean;

  /**
   * 是否显示搜索框，默认 true
   */
  showSearchKey?: boolean;

  /**
   * 是否显示工具栏，默认 true
   */
  showToolbar?: boolean;

  /**
   * 表单弹窗宽度，默认 800
   */
  upsertWidth?: string | number;

  /**
   * 搜索框占位符
   */
  searchPlaceholder?: string;

  /**
   * 是否默认展开左侧，默认 true
   */
  defaultExpand?: boolean;

  /**
   * 移动端自动收起，默认 true
   */
  autoCollapseOnMobile?: boolean;

  /**
   * 是否自动加载数据，默认 true
   */
  autoLoad?: boolean;

  /**
   * 存储 key，用于区分不同页面的尺寸设置（如果不提供，则不存储）
   */
  storageKey?: string;

  /**
   * 是否显示标签容器，默认 false
   */
  showTagsContainer?: boolean;
}

/**
 * BtcFilterTableGroup Emits
 */
export interface BtcFilterTableGroupEmits {
  /**
   * 筛选结果变化
   */
  'filter-change': [result: FilterResult[]];

  /**
   * 展开/收起状态变化
   */
  'expand-change': [isExpand: boolean];

  /**
   * 列变化事件（列顺序或显示状态变化）
   */
  'column-change': [columns: TableColumn[]];

  /**
   * 宽度变化事件
   */
  'width-change': [width: string];

  /**
   * 刷新事件
   */
  refresh: [params?: any];

  /**
   * 表单提交事件
   */
  'form-submit': [data: any, formEvent: { close: () => void; done: () => void; next: (data: any) => Promise<any>; defaultPrevented: boolean }];

  /**
   * 数据加载完成事件
   */
  load: [data: any[]];
}

/**
 * BtcFilterTableGroup Expose
 */
export interface BtcFilterTableGroupExpose {
  /**
   * 筛选结果
   */
  filterResult: ComputedRef<FilterResult[]>;

  /**
   * CRUD 组件引用
   */
  crudRef: any;

  /**
   * FilterList 组件引用
   */
  filterListRef: any;

  /**
   * 刷新数据
   */
  refresh: (params?: any) => Promise<void>;

  /**
   * 手动更新列（暂未实现）
   */
  updateColumns: (columns: TableColumn[]) => void;
}
