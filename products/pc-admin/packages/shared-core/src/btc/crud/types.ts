/**
 * CRUD 相关类型定义
 */

import type { Ref } from 'vue';

/**
 * CRUD 服务接口
 */
export interface CrudService<T = Record<string, unknown>> {
  page: (params: Record<string, unknown>) => Promise<{ list: T[]; total: number }>;
  add: (data: Partial<T>) => Promise<void>;
  update: (data: Partial<T>) => Promise<void>;
  delete: (id: string | number) => Promise<void>; // 单个删除
  deleteBatch: (ids: (string | number)[]) => Promise<void>; // 批量删除
}

/**
 * CRUD 选项配置
 */
export interface CrudOptions<T = Record<string, unknown>> {
  service: CrudService<T>;

  // 生命周期钩子
  onLoad?: () => void;
  onSuccess?: (message: string) => void;
  onError?: (error: unknown) => void;

  // 高级钩子（对标 cool-admin 的 onRefresh/onDelete）
  onBeforeRefresh?: (params: Record<string, unknown>) => Record<string, unknown> | void;
  onAfterRefresh?: (data: { list: T[]; total: number }) => void;
  onBeforeDelete?: (rows: T[]) => boolean | Promise<boolean>;
  onAfterDelete?: () => void;
}

/**
 * 分页配置
 */
export interface PaginationConfig {
  page: number;
  size: number;
  total: number;
}

/**
 * 表格列配置
 */
export interface TableColumn {
  prop: string;
  label: string;
  width?: number | string;
  minWidth?: number | string;
  fixed?: boolean | 'left' | 'right';
  sortable?: boolean;
  formatter?: (row: any, column: any, cellValue: any, index: number) => string;
  show?: boolean;
  type?: 'selection' | 'index' | 'expand';
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  className?: string;
  labelClassName?: string;
  resizable?: boolean;
  showOverflowTooltip?: boolean;
  children?: TableColumn[];
}

/**
 * 表单验证规则（兼容 Element Plus 格式）
 */
export interface FormItemRule {
  required?: boolean;
  message?: string;
  trigger?: string | string[];
  validator?: (rule: any, value: any, callback: any) => void;
  // 字符串验证
  min?: number; // 最小长度
  max?: number; // 最大长度
  pattern?: RegExp; // 正则表达式
  // 数字验证
  type?: 'string' | 'number' | 'boolean' | 'method' | 'regexp' | 'integer' | 'float' | 'array' | 'object' | 'enum' | 'date' | 'url' | 'hex' | 'email';
  // 其他验证选项
  len?: number; // 精确长度
  enum?: any[]; // 枚举值
  whitespace?: boolean; // 是否允许空白字符
}

/**
 * 表单项配置
 */
export interface FormItem {
  prop: string;
  label: string;
  type: 'input' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'datetime' | 'number' | 'switch' | 'upload' | 'cascader' | 'tree-select';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  options?: Array<{ label: string; value: any; disabled?: boolean }>;
  rules?: FormItemRule | FormItemRule[]; // 支持单个规则或规则数组
  // Zod schema 支持（可选，用于类型安全的表单验证）
  zodSchema?: import('zod').ZodTypeAny;
  span?: number;
  offset?: number;
  push?: number;
  pull?: number;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  show?: boolean;
  defaultValue?: any;
  component?: string;
  props?: Record<string, any>;
  children?: FormItem[];
}

/**
 * CRUD 返回类型
 */
export interface UseCrudReturn<T = Record<string, unknown>> {
  // 数据
  data: Ref<T[]>;
  tableData: Ref<T[]>; // 兼容旧版本
  loading: Ref<boolean>;
  total: Ref<number>;
  page: Ref<number>;
  size: Ref<number>;
  pagination: { page: number; size: number; total: number };

  // 方法
  refresh: (params?: Record<string, unknown>) => Promise<void>;
  loadData: (params?: Record<string, unknown>) => Promise<void>;
  forceRefresh: () => Promise<void>;
  add: () => void;
  handleAdd: () => void;
  edit: (row: T) => void;
  handleEdit: (row: T) => void;
  delete: (rows: T[]) => Promise<void>;
  handleDelete: (row: T) => Promise<void>;
  handleMultiDelete: (rows: T[]) => Promise<void>;
  search: (keyword: string) => void;
  handleSearch: (params?: Record<string, unknown>) => void;
  reset: () => void;
  handleReset: () => void;
  handleRefresh: () => Promise<void>;

  // 状态
  upsertVisible: Ref<boolean>;
  upsertLoading: Ref<boolean>;
  upsertData: Ref<Partial<T>>;
  isEdit: Ref<boolean>;
  selectedRows: Ref<T[]>;
  selection: Ref<T[]>; // 兼容旧版本
  searchKeyword: Ref<string>;
  currentRow: Ref<T | null>;
  upsertMode: Ref<'add' | 'update' | 'info'>;
  viewVisible: Ref<boolean>;
  viewRow: Ref<T | null>;

  // 服务
  service: any;

  // 其他方法
  handleSelectionChange: (selection: T[]) => void;
  clearSelection: () => void;
  toggleSelection: (row: T) => void;
  handlePageChange: (page: number) => void;
  handleSizeChange: (size: number) => void;
  getParams: () => Record<string, unknown>;
  setParams: (params: Record<string, unknown>) => void;
  closeDialog: () => void;
  handleView: (row: T) => void;
  handleViewClose: () => void;
  toolbarContext?: any;
  setToolbarContext?: (context: any) => void;
}
