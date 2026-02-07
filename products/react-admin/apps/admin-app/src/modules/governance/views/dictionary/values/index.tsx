/**
 * Dictionary Values Page - Governance Module
 * React Admin - Admin Application
 *
 * Manages dictionary values with CRUD operations.
 * Values are linked to dictionary fields.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tag, Space, message } from 'antd';
import {
  AppCrud,
  AppCrudRow,
  AppRefreshButton,
  AppAddButton,
  AppMultiDeleteButton,
  AppCrudFlex1,
  AppCrudSearchKey,
  AppCrudActions,
} from '../../components';
import type { CrudColumn, CrudFormField, CrudService } from '../../components';
import styles from './index.module.css';

// ============================================================================
// Types
// ============================================================================

interface DictionaryValueRecord {
  id?: string | number;
  dictTypeCode?: string;
  dictValue?: string;
  dictLabel?: string;
  sortOrder?: number;
  isEnabled?: boolean;
  description?: string;
  createdAt?: string;
}

// ============================================================================
// Mock Services (Replace with actual API)
// ============================================================================

const mockDictionaryValueService: CrudService<DictionaryValueRecord> & {
  import?: (data: DictionaryValueRecord[]) => Promise<void>;
} = {
  list: async (params?: Record<string, unknown>) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const { current = 1, pageSize = 10, keyword } = params || {};

    const allValues: DictionaryValueRecord[] = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      dictTypeCode: `dict:${(i % 5) + 1}`,
      dictValue: `value_${i + 1}`,
      dictLabel: `标签${i + 1}`,
      sortOrder: i + 1,
      isEnabled: i % 4 !== 0,
      description: `这是第 ${i + 1} 个字典值的描述`,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    }));

    // Filter by keyword
    const filteredValues = keyword
      ? allValues.filter(
          (item) =>
            item.dictLabel?.includes(keyword as string) ||
            item.dictValue?.includes(keyword as string)
        )
      : allValues;

    const start = ((current as number) - 1) * (pageSize as number);
    const end = start + (pageSize as number);

    return {
      list: filteredValues.slice(start, end),
      total: filteredValues.length,
    };
  },

  info: async (id: string | number) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      id,
      dictTypeCode: `dict:1`,
      dictValue: `value_${id}`,
      dictLabel: `标签${id}`,
      sortOrder: id as number,
      isEnabled: true,
      description: '字典值描述信息',
      createdAt: new Date().toISOString(),
    };
  },

  add: async (data: DictionaryValueRecord) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id: Date.now() };
  },

  update: async (id: string | number, data: DictionaryValueRecord) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id };
  },

  delete: async (id: string | number) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Deleted value:', id);
  },

  deleteMany: async (ids: (string | number)[]) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Deleted values:', ids);
  },

  import: async (data: DictionaryValueRecord[]) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Imported values:', data.length);
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

// ============================================================================
// Dictionary Values Page Component
// ============================================================================

export const DictionaryValuesPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Get field info from URL params
  const fieldId = searchParams.get('fieldId');
  const fieldName = searchParams.get('fieldName');
  const dictCode = searchParams.get('dictCode');

  // Service
  const service: CrudService<DictionaryValueRecord> = mockDictionaryValueService;

  // State for import handling
  const [importLoading, setImportLoading] = useState(false);

  // Table columns configuration
  const columns: CrudColumn<DictionaryValueRecord>[] = useMemo(
    () => [
      {
        title: '序号',
        dataIndex: 'id',
        width: 80,
        align: 'center',
        render: (_, __, index) => index + 1,
      },
      {
        title: '字典值',
        dataIndex: 'dictValue',
        width: 150,
        render: (value) => <code>{value}</code>,
      },
      {
        title: '字典标签',
        dataIndex: 'dictLabel',
        width: 150,
      },
      {
        title: '排序',
        dataIndex: 'sortOrder',
        width: 80,
        align: 'center',
      },
      {
        title: '状态',
        dataIndex: 'isEnabled',
        width: 80,
        align: 'center',
        render: (value) =>
          value ? <Tag color="success">启用</Tag> : <Tag color="default">禁用</Tag>,
      },
      {
        title: '描述',
        dataIndex: 'description',
        minWidth: 150,
        render: (value) => value || '-',
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: 180,
        render: (_, record) => formatDate(record.createdAt),
      },
    ],
    []
  );

  // Form items configuration
  const formItems: CrudFormField[] = useMemo(
    () => [
      {
        key: 'dictTypeCode',
        label: '字典编码',
        type: 'text',
        required: true,
        placeholder: '请输入字典编码',
        disabled: !!dictCode,
      },
      {
        key: 'dictValue',
        label: '字典值',
        type: 'text',
        required: true,
        placeholder: '请输入字典值',
      },
      {
        key: 'dictLabel',
        label: '字典标签',
        type: 'text',
        required: true,
        placeholder: '请输入字典标签',
      },
      {
        key: 'sortOrder',
        label: '排序',
        type: 'number',
        required: true,
        placeholder: '请输入排序序号',
      },
      {
        key: 'isEnabled',
        label: '状态',
        type: 'switch',
        required: true,
      },
      {
        key: 'description',
        label: '描述',
        type: 'textarea',
        placeholder: '请输入字典值描述',
      },
    ],
    [dictCode]
  );

  // Search key options
  const searchKeyOptions = useMemo(
    () => [
      { label: '字典标签', value: 'dictLabel' },
      { label: '字典值', value: 'dictValue' },
      { label: '关键词', value: 'keyword' },
    ],
    []
  );

  // Custom actions for table rows
  const rowActions = useMemo(
    () => [
      {
        key: 'edit',
        label: '编辑',
        onClick: () => {
          // Edit is handled by AppCrud internally
        },
      },
      {
        key: 'delete',
        label: '删除',
        danger: true,
        confirm: true,
        confirmTitle: '确认删除',
        onClick: () => {
          // Delete is handled by AppCrud internally
        },
      },
    ],
    []
  );

  // Handle import
  const handleImport = useCallback(
    async (data: any) => {
      try {
        const rows = (data?.list || data?.rows || []).map((row: Record<string, unknown>) => {
          const { _index, ...rest } = row || {};
          return rest;
        });

        if (!rows.length) {
          message.warning(data?.filename ? '导入文件中没有数据或字段映射' : '请先选择要导入的文件');
          return;
        }

        // Transform data to match columns
        const payload = rows.map((row: Record<string, unknown>) => ({
          dictTypeCode: row.dictTypeCode || dictCode,
          dictValue: row.dictValue,
          dictLabel: row.dictLabel,
        }));

        await mockDictionaryValueService.import?.(payload);
        message.success('导入成功');
      } catch (error) {
        console.error('Import failed:', error);
        message.error('导入失败');
      }
    },
    [dictCode]
  );

  // Get header title
  const getTitle = useMemo(() => {
    if (fieldName) {
      return `字典值管理 - ${fieldName}`;
    }
    return '字典值管理';
  }, [fieldName]);

  return (
    <div className={styles.page}>
      <AppCrud<DictionaryValueRecord>
        service={service}
        columns={columns}
        formItems={formItems}
        primaryKey="id"
        pageSize={10}
        searchKey="keyword"
        modalWidth={800}
        showRefresh
        showAdd
        showMultiDelete
        showSearchKey
        addButtonText="新增字典值"
        successMessage={{
          add: '新增成功',
          update: '更新成功',
          delete: '删除成功',
        }}
        onDataLoad={(data, total) => {
          console.log('Data loaded:', data.length, 'total:', total);
        }}
      />
    </div>
  );
};

DictionaryValuesPage.displayName = 'DictionaryValuesPage';

export default DictionaryValuesPage;
