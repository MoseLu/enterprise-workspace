/**
 * BtcMasterTableGroup 类型定义
 */

// 右侧操作栏搜索字段配置项
export interface RightOpField {
  type: 'input' | 'select'; // 字段类型：输入框或选择框
  prop: string; // 字段名（用于绑定值和传递给后端）
  placeholder?: string; // 占位符
  width?: string; // 宽度，输入框默认 '150px'，选择框默认 '100px'
  options?: Array<{ label: string; value: any }>; // 选择框选项（仅当 type 为 'select' 时使用）
  loading?: boolean; // 选择框加载状态（仅当 type 为 'select' 时使用）
  onSearch?: () => void; // 搜索触发回调（可选，如果不提供则使用默认的搜索逻辑）
}

export interface MasterTableGroupProps {
  // 左侧服务（Master List）
  leftService: any;
  // 左侧服务名（用于推断 code 字段名，如 'domain', 'dept', 'module' 等）
  // 如果指定了此属性，将优先使用它来推断 code 字段；否则尝试从 leftService 对象推断
  leftServiceName?: string;
  leftTitle?: string;

  // 右侧服务（CRUD）
  rightService: any;
  rightTitle?: string;

  // 表格配置
  tableColumns?: any[];
  formItems?: any[];

  // 操作列配置
  op?: { buttons?: any[] };

  // 字段配置
  idField?: string;
  labelField?: string;
  parentField?: string;

  // 时间列配置
  showCreateTime?: boolean; // 是否显示创建时间列，默认 true
  showUpdateTime?: boolean; // 是否显示更新时间列，默认 false

  // 功能配置
  enableDrag?: boolean;
  enableKeySearch?: boolean;
  showUnassigned?: boolean;
  unassignedLabel?: string;
  showAddBtn?: boolean; // 是否显示新增按钮，默认 true
  showMultiDeleteBtn?: boolean; // 是否显示批量删除按钮，默认 true
  showSearchKey?: boolean; // 是否显示搜索框，默认 true
  showToolbar?: boolean; // 是否显示右侧工具栏按钮，默认 true

  // 样式配置
  leftWidth?: string;
  leftSize?: 'default' | 'small' | 'middle'; // 左侧宽度类型：default（300px）、small（150px）或 middle（225px）
  upsertWidth?: string | number;
  searchPlaceholder?: string;

  // 右侧操作栏搜索字段配置（最多3个，硬性限制）
  rightOpFields?:
    | [RightOpField]
    | [RightOpField, RightOpField]
    | [RightOpField, RightOpField, RightOpField]
    | undefined;
  // 右侧操作栏搜索字段的值（v-model）
  rightOpFieldsValue?: Record<string, any>;
}

export interface MasterTableGroupEmits {
  (event: 'select', item: any, keyword?: any): void;
  (event: 'update:selected', item: any): void;
  (event: 'refresh', params?: any): void;
  (event: 'form-submit', data: any, formEvent: { close: () => void; done: () => void; next: (data: any) => Promise<any>; defaultPrevented: boolean }): void;
  (event: 'load', data: any[]): void;
  (event: 'update:rightOpFieldsValue', value: Record<string, any>): void;
  (event: 'right-op-search', field: any): void;
}

export interface MasterTableGroupExpose {
  viewGroupRef: any;
  crudRef: any;
  refresh: (params?: any) => Promise<void>;
}

// 插槽类型定义
export interface MasterTableGroupSlots {
  actions?: (props: { selected?: any; keyword?: any; leftData?: any[]; rightData?: any }) => any;
  'add-btn'?: () => any;
  'multi-delete-btn'?: () => any;
  'after-refresh-btn'?: () => any;
  search?: () => any;
}
