import type { ComputedRef } from 'vue';
import type { CrudService } from '@btc/shared-core';

export type TransferKey = string | number;

export interface TransferPanelColumn<T = any> {
  prop: string;
  label: string;
  width?: string | number;
  minWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  formatter?: (row: T, column: TransferPanelColumn<T>, index: number) => any;
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
  autoLoad?: boolean;
  onBeforeRefresh?: (params: Record<string, unknown>) => Record<string, unknown>;
  onAfterRefresh?: (data: { list: any[]; total: number }) => void;
  pagination?: {
    pageSizes?: number[];
    defaultPageSize?: number;
  };
}

export interface TransferPanelProps<T = any> {
  title?: string;
  sourceTitle?: string;
  targetTitle?: string;
  data?: T[];
  service?: CrudService<T> | {
    page?: (params: Record<string, any>) => Promise<{ list: T[]; total: number }>;
    list?: (params: Record<string, any>) => Promise<{ list: T[]; total: number } | T[]>;
    add?: (data: T) => Promise<any>;
    update?: (data: T) => Promise<any>;
    delete?: (id: any) => Promise<any>;
    deleteBatch?: (ids: any[]) => Promise<any>;
  };
  options?: TransferPanelOptions;
  columns: TransferPanelColumn<T>[];
  rowKey?: string | ((row: T) => TransferKey);
  modelValue: TransferKey[];
  loading?: boolean;
  autoLoad?: boolean;
  height?: string | number;
  collapsible?: boolean;
  displayProp?: string;
  descriptionProp?: string;
  selectedFormatter?: (item: T | undefined, key: TransferKey) => SelectedItemDisplay | string | null | undefined;
  selectedMap?: Record<string, T>;
  targetEmptyText?: string;
  collapseText?: {
    expand?: string;
    collapse?: string;
  };
  pagination?: TransferPanelPagination;
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
