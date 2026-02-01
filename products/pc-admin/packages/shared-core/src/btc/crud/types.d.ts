/**
 * CRUD 相关类型定义
 */
import type { Ref } from 'vue';
/**
 * CRUD 服务接口
 */
export interface CrudService<T = Record<string, unknown>> {
    page: (params: Record<string, unknown>) => Promise<{
        list: T[];
        total: number;
    }>;
    add: (data: Partial<T>) => Promise<void>;
    update: (data: Partial<T>) => Promise<void>;
    delete: (id: string | number) => Promise<void>;
    deleteBatch: (ids: (string | number)[]) => Promise<void>;
}
/**
 * CRUD 选项配置
 */
export interface CrudOptions<T = Record<string, unknown>> {
    service: CrudService<T>;
    onLoad?: () => void;
    onSuccess?: (message: string) => void;
    onError?: (error: unknown) => void;
    onBeforeRefresh?: (params: Record<string, unknown>) => Record<string, unknown> | void;
    onAfterRefresh?: (data: {
        list: T[];
        total: number;
    }) => void;
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
    options?: Array<{
        label: string;
        value: any;
        disabled?: boolean;
    }>;
    rules?: Array<{
        required?: boolean;
        message?: string;
        trigger?: string;
        validator?: (rule: any, value: any, callback: any) => void;
    }>;
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
    data: Ref<T[]>;
    tableData: Ref<T[]>;
    loading: Ref<boolean>;
    total: Ref<number>;
    page: Ref<number>;
    size: Ref<number>;
    pagination: {
        page: number;
        size: number;
        total: number;
    };
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
    upsertVisible: Ref<boolean>;
    upsertLoading: Ref<boolean>;
    upsertData: Ref<Partial<T>>;
    isEdit: Ref<boolean>;
    selectedRows: Ref<T[]>;
    selection: Ref<T[]>;
    searchKeyword: Ref<string>;
    currentRow: Ref<T | null>;
    upsertMode: Ref<'add' | 'update' | 'info'>;
    viewVisible: Ref<boolean>;
    viewRow: Ref<T | null>;
    service: any;
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
//# sourceMappingURL=types.d.ts.map