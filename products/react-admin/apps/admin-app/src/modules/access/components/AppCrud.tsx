/**
 * AppCrud - Main CRUD Wrapper Component
 * React Admin - Access Control Module
 *
 * Manages CRUD state including data loading, pagination, search, and modal operations.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { FormInstance } from 'antd/es/form';
import { message } from 'antd';
import { AppTable } from '@enterprise-workspace/frontend/shared/data-display';
import type { AppTableRef } from '@enterprise-workspace/frontend/shared/data-display/Table/types';
import { AppPagination } from './AppPagination';
import { AppRefreshButton } from './AppRefreshButton';
import { AppAddButton } from './AppAddButton';
import { AppMultiDeleteButton } from './AppMultiDeleteButton';
import { AppCrudFlex1 } from './AppCrudFlex1';
import { AppCrudSearchKey } from './AppCrudSearchKey';
import { AppUpsert } from './AppUpsert';
import styles from './AppCrud.module.css';

// ============================================================================
// Types
// ============================================================================

/** Column configuration for AppCrud */
export interface CrudColumn<T = Record<string, unknown>> {
  title?: React.ReactNode;
  dataIndex?: string | string[];
  width?: string | number;
  minWidth?: number;
  fixed?: 'left' | 'right' | boolean;
  align?: 'left' | 'center' | 'right';
  sorter?: boolean | ((a: T, b: T) => number);
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  key?: string;
}

/** Form field configuration */
export interface CrudFormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'date' | 'switch' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string | number }[];
}

/** Pagination configuration */
export interface CrudPagination {
  current?: number;
  pageSize?: number;
  total?: number;
  onChange?: (page: number, pageSize: number) => void;
}

/** Service interface for CRUD operations */
export interface CrudService<T = Record<string, unknown>> {
  list: (params?: Record<string, unknown>) => Promise<{ list: T[]; total: number }>;
  info: (id: string | number) => Promise<T>;
  add: (data: T) => Promise<T>;
  update: (id: string | number, data: T) => Promise<T>;
  delete: (ids: string | number | (string | number)[]) => Promise<void>;
  deleteMany: (ids: (string | number)[]) => Promise<void>;
}

/** AppCrud Props */
export interface AppCrudProps<T = Record<string, unknown>> {
  /** CRUD service instance */
  service: CrudService<T>;
  /** Column configurations */
  columns: CrudColumn<T>[];
  /** Form field configurations for add/edit */
  formItems?: CrudFormField[];
  /** Primary key field name */
  primaryKey?: string;
  /** Default page size */
  pageSize?: number;
  /** Initial search key */
  searchKey?: string;
  /** Initial search value */
  searchValue?: string;
  /** Modal width */
  modalWidth?: number | 'small' | 'middle' | 'large' | 'full';
  /** Custom row key getter */
  rowKey?: string | ((record: T) => string | number);
  /** Show refresh button */
  showRefresh?: boolean;
  /** Show add button */
  showAdd?: boolean;
  /** Show multi-delete button */
  showMultiDelete?: boolean;
  /** Show search key selector */
  showSearchKey?: boolean;
  /** Custom add button text */
  addButtonText?: string;
  /** Custom multi-delete button text */
  multiDeleteButtonText?: string;
  /** Success message config */
  successMessage?: {
    add?: string;
    update?: string;
    delete?: string;
  };
  /** Callback when data loads */
  onDataLoad?: (data: T[], total: number) => void;
  /** Callback when selection changes */
  onSelectionChange?: (selectedRows: T[]) => void;
  /** Callback when row clicks */
  onRowClick?: (record: T) => void;
  /** Custom load function */
  load?: () => Promise<void>;
}

// ============================================================================
// AppCrud Component
// ============================================================================

export const AppCrud: React.FC<AppCrudProps> & {
  displayName: string;
} = <T extends Record<string, unknown>>({
  service,
  columns,
  formItems = [],
  primaryKey = 'id',
  pageSize = 10,
  searchKey = 'keyword',
  searchValue: initialSearchValue = '',
  modalWidth = 800,
  rowKey = 'id',
  showRefresh = true,
  showAdd = true,
  showMultiDelete = true,
  showSearchKey = true,
  addButtonText = '新增',
  multiDeleteButtonText = '批量删除',
  successMessage = {
    add: '新增成功',
    update: '更新成功',
    delete: '删除成功',
  },
  onDataLoad,
  onSelectionChange,
  onRowClick,
}) => {
  const tableRef = useRef<AppTableRef>(null);
  const [form] = Form.useForm();
  const upsertFormRef = useRef<FormInstance>(null);

  // State
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(pageSize);
  const [searchKeyValue, setSearchKeyValue] = useState(searchKey);
  const [searchText, setSearchText] = useState(initialSearchValue as string);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingRecord, setEditingRecord] = useState<T | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);

  // Transform columns to AppTable format
  const tableColumns = React.useMemo(() => {
    return columns.map((col) => ({
      ...col,
      key: col.key || String(col.dataIndex),
    }));
  }, [columns]);

  // Load data
  const loadData = useCallback(async () => {
    if (!service?.list) return;

    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        current,
        pageSize,
      };

      if (searchText) {
        params[searchKeyValue] = searchText;
      }

      const response = await service.list(params);
      setDataSource(response.list || []);
      setTotal(response.total || 0);
      onDataLoad?.(response.list || [], response.total || 0);
    } catch (error) {
      message.error('获取数据失败');
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  }, [service, current, pageSize, searchKeyValue, searchText, onDataLoad]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh
  const handleRefresh = useCallback(() => {
    setCurrent(1);
    loadData();
  }, [loadData]);

  // Search
  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    setCurrent(1);
    loadData();
  }, [loadData]);

  // Reset search
  const handleReset = useCallback(() => {
    setSearchText('');
    setCurrent(1);
    loadData();
  }, [loadData]);

  // Pagination change
  const handlePaginationChange = useCallback((page: number, size: number) => {
    setCurrent(page);
    setPageSize(size);
    loadData();
  }, [loadData]);

  // Add
  const handleAdd = useCallback(() => {
    setModalMode('add');
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  }, [form]);

  // Edit
  const handleEdit = useCallback(async (record: T) => {
    setModalMode('edit');
    setEditingRecord(record);

    // Load detail data
    const id = (record as Record<string, unknown>)[primaryKey];
    if (id) {
      try {
        const detail = await service.info(id);
        form.setFieldsValue(detail);
        setModalVisible(true);
      } catch {
        message.error('获取详情失败');
      }
    } else {
      form.setFieldsValue(record);
      setModalVisible(true);
    }
  }, [service, primaryKey, form]);

  // Delete single
  const handleDelete = useCallback(async (record: T) => {
    const id = (record as Record<string, unknown>)[primaryKey];
    if (!id) return;

    try {
      await service.delete(id);
      message.success(successMessage.delete);
      loadData();
    } catch {
      message.error('删除失败');
    }
  }, [service, primaryKey, successMessage, loadData]);

  // Multi delete
  const handleMultiDelete = useCallback(async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的数据');
      return;
    }

    try {
      await service.deleteMany(selectedRowKeys);
      message.success(successMessage.delete);
      setSelectedRowKeys([]);
      loadData();
    } catch {
      message.error('批量删除失败');
    }
  }, [service, selectedRowKeys, successMessage, loadData]);

  // Modal ok
  const handleModalOk = useCallback(async () => {
    try {
      const values = await form.validateFields();

      if (modalMode === 'add') {
        await service.add(values);
        message.success(successMessage.add);
      } else {
        const id = editingRecord?.[primaryKey];
        await service.update(id, values);
        message.success(successMessage.update);
      }

      setModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      console.error('Form validation or API error:', error);
    }
  }, [modalMode, editingRecord, form, service, primaryKey, successMessage, loadData]);

  // Modal cancel
  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
    form.resetFields();
  }, [form]);

  // Selection change
  const handleSelectionChange = useCallback((keys: (string | number)[]) => {
    setSelectedRowKeys(keys);
    const selectedRows = dataSource.filter((row) =>
      keys.includes((row as Record<string, unknown>)[primaryKey] as string | number)
    );
    onSelectionChange?.(selectedRows as T[]);
  }, [dataSource, primaryKey, onSelectionChange]);

  // Row click
  const handleRowClick = useCallback((record: T) => {
    onRowClick?.(record);
  }, [onRowClick]);

  // Row actions
  const rowActions = React.useMemo(() => {
    return [
      {
        key: 'edit',
        label: '编辑',
        onClick: handleEdit,
      },
      {
        key: 'delete',
        label: '删除',
        danger: true,
        onClick: handleDelete,
      },
    ];
  }, [handleEdit, handleDelete]);

  return (
    <div className={styles.crud}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          {showRefresh && <AppRefreshButton onClick={handleRefresh} />}
          {showAdd && <AppAddButton onClick={handleAdd}>{addButtonText}</AppAddButton>}
          {showMultiDelete && (
            <AppMultiDeleteButton
              disabled={selectedRowKeys.length === 0}
              onClick={handleMultiDelete}
            >
              {multiDeleteButtonText} ({selectedRowKeys.length})
            </AppMultiDeleteButton>
          )}
        </div>
        <AppCrudFlex1 />
        {showSearchKey && (
          <AppCrudSearchKey
            value={searchKeyValue}
            onChange={setSearchKeyValue}
            onSearch={handleSearch}
          />
        )}
      </div>

      {/* Table */}
      <AppTable
        ref={tableRef}
        dataSource={dataSource}
        columns={tableColumns}
        loading={loading}
        rowKey={rowKey}
        rowClassName={styles.tableRow}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
        pagination={{
          current,
          pageSize,
          total,
          onChange: handlePaginationChange,
        }}
        rowSelection={
          showMultiDelete
            ? {
                selectedRowKeys,
                onChange: handleSelectionChange,
              }
            : undefined
        }
      />

      {/* Upsert Modal */}
      <AppUpsert
        form={form}
        open={modalVisible}
        mode={modalMode}
        title={modalMode === 'add' ? addButtonText : '编辑'}
        fields={formItems}
        width={modalWidth}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

AppCrud.displayName = 'AppCrud';

export default AppCrud;
