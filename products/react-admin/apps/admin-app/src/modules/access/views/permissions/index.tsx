/**
 * Permissions Page - Access Control Module
 * React Admin - Admin Application
 *
 * Lists permissions with CRUD operations.
 */

import React, { useCallback, useState, useMemo } from 'react';
import { Tag, Space } from 'antd';
import { AppCrud, AppCrudRow, AppRefreshButton, AppAddButton, AppMultiDeleteButton, AppCrudFlex1, AppCrudSearchKey, AppCrudActions } from '../../components';
import type { CrudColumn, CrudFormField, CrudService } from '../../components';
import styles from './index.module.css';

// ============================================================================
// Types
// ============================================================================

interface PermissionRecord {
  id?: string | number;
  permName?: string;
  permCode?: string;
  permType?: string;
  permCategory?: string;
  moduleId?: string;
  pluginId?: string;
  description?: string;
  createdAt?: string;
}

interface PermissionService extends CrudService<PermissionRecord> {
  list: (params?: Record<string, unknown>) => Promise<{ list: PermissionRecord[]; total: number }>;
  info: (id: string | number) => Promise<PermissionRecord>;
  add: (data: PermissionRecord) => Promise<PermissionRecord>;
  update: (id: string | number, data: PermissionRecord) => Promise<PermissionRecord>;
  delete: (id: string | number) => Promise<void>;
  deleteMany: (ids: (string | number)[]) => Promise<void>;
}

// ============================================================================
// Mock Service (Replace with actual API)
// ============================================================================

const mockPermissionService: PermissionService = {
  list: async (params) => {
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { current = 1, pageSize = 10, keyword = '' } = params || {};

    // Mock data
    const allData: PermissionRecord[] = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      permName: `权限名称 ${i + 1}`,
      permCode: `permission:${i + 1}`,
      permType: ['MENU', 'BUTTON', 'API'][i % 3],
      permCategory: ['系统管理', '业务管理', '数据管理'][i % 3],
      moduleId: `module-${(i % 5) + 1}`,
      pluginId: `plugin-${(i % 3) + 1}`,
      description: `这是第 ${i + 1} 个权限的描述信息`,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    }));

    // Filter by keyword
    const filteredData = keyword
      ? allData.filter(
          (item) =>
            item.permName?.includes(keyword as string) ||
            item.permCode?.includes(keyword as string)
        )
      : allData;

    const start = ((current as number) - 1) * (pageSize as number);
    const end = start + (pageSize as number);

    return {
      list: filteredData.slice(start, end),
      total: filteredData.length,
    };
  },

  info: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      id,
      permName: `权限名称 ${id}`,
      permCode: `permission:${id}`,
      permType: 'MENU',
      permCategory: '系统管理',
      moduleId: 'module-1',
      pluginId: 'plugin-1',
      description: '权限描述信息',
      createdAt: new Date().toISOString(),
    };
  },

  add: async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id: Date.now() };
  },

  update: async (id, data) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id };
  },

  delete: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Deleted permission:', id);
  },

  deleteMany: async (ids) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Deleted permissions:', ids);
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

const getPermTypeTag = (type: string): { color: string; text: string } => {
  const typeMap: Record<string, { color: string; text: string }> = {
    MENU: { color: 'blue', text: '菜单' },
    BUTTON: { color: 'green', text: '按钮' },
    API: { color: 'orange', text: 'API' },
  };
  return typeMap[type] || { color: 'default', text: type };
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

// ============================================================================
// Permissions Page Component
// ============================================================================

export const PermissionsPage: React.FC = () => {
  // Service (replace with actual service in production)
  const service: PermissionService = mockPermissionService;

  // Table columns configuration
  const columns: CrudColumn<PermissionRecord>[] = useMemo(
    () => [
      {
        title: '序号',
        dataIndex: 'id',
        width: 80,
        align: 'center',
      },
      {
        title: '权限名称',
        dataIndex: 'permName',
        width: 150,
      },
      {
        title: '权限编码',
        dataIndex: 'permCode',
        width: 180,
        render: (value) => <code>{value}</code>,
      },
      {
        title: '权限类型',
        dataIndex: 'permType',
        width: 100,
        align: 'center',
        render: (_, record) => {
          const { color, text } = getPermTypeTag(record.permType || '');
          return <Tag color={color}>{text}</Tag>;
        },
      },
      {
        title: '权限分类',
        dataIndex: 'permCategory',
        width: 120,
        align: 'center',
      },
      {
        title: '模块ID',
        dataIndex: 'moduleId',
        width: 100,
        align: 'center',
      },
      {
        title: '插件ID',
        dataIndex: 'pluginId',
        width: 100,
        align: 'center',
      },
      {
        title: '描述',
        dataIndex: 'description',
        minWidth: 150,
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
        key: 'permName',
        label: '权限名称',
        type: 'text',
        required: true,
        placeholder: '请输入权限名称',
      },
      {
        key: 'permCode',
        label: '权限编码',
        type: 'text',
        required: true,
        placeholder: '请输入权限编码',
      },
      {
        key: 'permType',
        label: '权限类型',
        type: 'select',
        required: true,
        options: [
          { label: '菜单', value: 'MENU' },
          { label: '按钮', value: 'BUTTON' },
          { label: 'API', value: 'API' },
        ],
      },
      {
        key: 'permCategory',
        label: '权限分类',
        type: 'select',
        options: [
          { label: '系统管理', value: '系统管理' },
          { label: '业务管理', value: '业务管理' },
          { label: '数据管理', value: '数据管理' },
        ],
      },
      {
        key: 'moduleId',
        label: '模块ID',
        type: 'text',
        placeholder: '请输入模块ID',
      },
      {
        key: 'pluginId',
        label: '插件ID',
        type: 'text',
        placeholder: '请输入插件ID',
      },
      {
        key: 'description',
        label: '描述',
        type: 'textarea',
        placeholder: '请输入权限描述',
      },
    ],
    []
  );

  // Search key options
  const searchKeyOptions = useMemo(
    () => [
      { label: '权限名称', value: 'permName' },
      { label: '权限编码', value: 'permCode' },
      { label: '关键词', value: 'keyword' },
    ],
    []
  );

  // Callbacks
  const handleDataLoad = useCallback((data: PermissionRecord[], total: number) => {
    console.log('Data loaded:', data.length, 'total:', total);
  }, []);

  const handleRowClick = useCallback((record: PermissionRecord) => {
    console.log('Row clicked:', record);
  }, []);

  return (
    <div className={styles.page}>
      <AppCrud<PermissionRecord>
        service={service}
        columns={columns}
        formItems={formItems}
        primaryKey="id"
        pageSize={10}
        searchKey="keyword"
        modalWidth="large"
        showRefresh
        showAdd
        showMultiDelete
        showSearchKey
        addButtonText="新增权限"
        onDataLoad={handleDataLoad}
        onRowClick={handleRowClick}
      />
    </div>
  );
};

PermissionsPage.displayName = 'PermissionsPage';

export default PermissionsPage;
