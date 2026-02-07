/**
 * Departments Page - Org Module
 * React Admin - Admin Application
 *
 * Department tree management with CRUD operations.
 *
 * Migrated from Vue3 (products/pc-admin/apps/admin-app/src/modules/org/views/departments/index.vue)
 * to React + TypeScript + Ant Design
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Tag, Button, Space, Empty, Tooltip, message } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOutlined,
  FileOutlined,
  ExportOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import {
  AppTable,
  Empty as SharedEmpty,
} from '@enterprise-workspace/frontend/shared';
import type { AppTableRef } from '@enterprise-workspace/frontend/shared/data-display/Table/types';
import type { TableColumnsType } from 'antd/es/table';
import { AppUpsert } from '../../../access/components';
import type { CrudFormField } from '../../../access/components';
import styles from './index.module.css';

// ============================================================================
// Types
// ============================================================================

interface DepartmentRecord {
  id?: string | number;
  name?: string;
  parentId?: string | number;
  parentName?: string;
  sort?: number;
  code?: string;
  status?: 'active' | 'inactive';
  description?: string;
  leader?: string;
  phone?: string;
  children?: DepartmentRecord[];
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Mock Services (Replace with actual API)
// ============================================================================

const mockDepartmentService = {
  list: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    return {
      list: [
        {
          id: '1',
          name: '总公司',
          parentId: '0',
          sort: 1,
          code: 'ROOT',
          status: 'active',
          description: '总公司',
          leader: '张三',
          phone: '13800138000',
          children: [
            {
              id: '2',
              name: '技术部',
              parentId: '1',
              sort: 1,
              code: 'TECH',
              status: 'active',
              description: '技术研发部门',
              leader: '李四',
              phone: '13800138001',
              children: [
                {
                  id: '4',
                  name: '前端开发组',
                  parentId: '2',
                  sort: 1,
                  code: 'TECH-FE',
                  status: 'active',
                  description: '前端开发',
                  leader: '王五',
                  phone: '13800138002',
                },
                {
                  id: '5',
                  name: '后端开发组',
                  parentId: '2',
                  sort: 2,
                  code: 'TECH-BE',
                  status: 'active',
                  description: '后端开发',
                  leader: '赵六',
                  phone: '13800138003',
                },
              ],
            },
            {
              id: '3',
              name: '市场部',
              parentId: '1',
              sort: 2,
              code: 'SALES',
              status: 'active',
              description: '市场营销部门',
              leader: '钱七',
              phone: '13800138004',
            },
          ],
        },
        {
          id: '6',
          name: '分公司A',
          parentId: '0',
          sort: 2,
          code: 'BRANCH-A',
          status: 'active',
          description: '分公司A',
          leader: '孙八',
          phone: '13800138005',
        },
      ],
      total: 6,
    };
  },

  info: async (id: string | number) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      id,
      name: `部门${id}`,
      parentId: '0',
      sort: 1,
      code: `DEPT-${id}`,
      status: 'active',
      description: '部门描述',
      leader: '负责人',
      phone: '13800138000',
      createdAt: new Date().toISOString(),
    };
  },

  add: async (data: DepartmentRecord) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id: Date.now().toString() };
  },

  update: async (id: string | number, data: DepartmentRecord) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id };
  },

  delete: async (id: string | number) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Deleted department:', id);
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

const getStatusTag = (status?: string): { color: string; text: string } => {
  const statusMap: Record<string, { color: string; text: string }> = {
    active: { color: 'success', text: '正常' },
    inactive: { color: 'error', text: '停用' },
  };
  return statusMap[status || ''] || { color: 'default', text: '未知' };
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

// Flatten department tree to list
const flattenDepartments = (
  depts: DepartmentRecord[],
  depth = 0
): DepartmentRecord[] => {
  const result: DepartmentRecord[] = [];
  const traverse = (nodes: DepartmentRecord[], level: number) => {
    for (const node of nodes) {
      result.push({ ...node, sort: level });
      if (node.children && node.children.length > 0) {
        traverse(node.children, level + 1);
      }
    }
  };
  traverse(depts, depth);
  return result;
};

// Build parent options for select
const buildParentOptions = (
  depts: DepartmentRecord[],
  excludeId?: string | number
): { label: string; value: string }[] => {
  const options: { label: string; value: string }[] = [{ label: '无（顶级部门）', value: '0' }];

  const traverse = (nodes: DepartmentRecord[], prefix = '') => {
    for (const node of nodes) {
      if (node.id !== excludeId) {
        options.push({
          label: `${prefix}${node.name}`,
          value: String(node.id),
        });
        if (node.children && node.children.length > 0) {
          traverse(node.children, `${prefix}　└ `);
        }
      }
    }
  };

  traverse(depts);
  return options;
};

// ============================================================================
// Departments Page Component
// ============================================================================

export const DepartmentsPage: React.FC = () => {
  // Service
  const departmentService = mockDepartmentService;

  // State
  const [departmentTree, setDepartmentTree] = useState<DepartmentRecord[]>([]);
  const [departmentList, setDepartmentList] = useState<DepartmentRecord[]>([]);
  const [parentOptions, setParentOptions] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingDept, setEditingDept] = useState<DepartmentRecord | null>(null);
  const [form] = React.useRef(null).current;

  // Refs
  const tableRef = useRef<AppTableRef>(null);

  // Load departments
  const loadDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await departmentService.list();
      const tree = (response.list as DepartmentRecord[]) || [];
      setDepartmentTree(tree);
      setDepartmentList(flattenDepartments(tree));
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoading(false);
    }
  }, [departmentService]);

  // Load departments for table
  const loadTableData = useCallback(async () => {
    setTableLoading(true);
    try {
      const response = await departmentService.list();
      const tree = (response.list as DepartmentRecord[]) || [];
      setDepartmentTree(tree);
      setDepartmentList(flattenDepartments(tree));
      setParentOptions(buildParentOptions(tree));
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setTableLoading(false);
    }
  }, [departmentService]);

  // Initial load
  useEffect(() => {
    loadDepartments();
    loadTableData();
  }, [loadDepartments, loadTableData]);

  // Refresh
  const handleRefresh = useCallback(() => {
    loadTableData();
  }, [loadTableData]);

  // Add department
  const handleAddDept = useCallback(() => {
    setModalMode('add');
    setEditingDept(null);
    if (form) {
      form.resetFields();
      form.setFieldsValue({ parentId: '0', sort: 1, status: 'active' });
    }
    setModalVisible(true);
  }, [form]);

  // Edit department
  const handleEditDept = useCallback(async (record: DepartmentRecord) => {
    setModalMode('edit');
    setEditingDept(record);

    try {
      const detail = await departmentService.info(record.id!);
      if (form) {
        form.setFieldsValue(detail);
      }
      setParentOptions(buildParentOptions(departmentTree, record.id));
      setModalVisible(true);
    } catch (error) {
      console.error('Failed to load department detail:', error);
    }
  }, [departmentService, form, departmentTree]);

  // Delete department
  const handleDeleteDept = useCallback(
    async (record: DepartmentRecord) => {
      try {
        await departmentService.delete(record.id!);
        message.success('删除成功');
        loadTableData();
      } catch (error) {
        console.error('Failed to delete department:', error);
        message.error('删除失败');
      }
    },
    [departmentService, loadTableData]
  );

  // Modal ok
  const handleModalOk = useCallback(async () => {
    if (!form) return;

    try {
      const values = await form.validateFields();

      if (modalMode === 'add') {
        await departmentService.add(values);
        message.success('新增成功');
      } else {
        await departmentService.update(editingDept?.id!, values);
        message.success('更新成功');
      }

      setModalVisible(false);
      form.resetFields();
      loadTableData();
    } catch (error) {
      console.error('Save department error:', error);
    }
  }, [modalMode, editingDept, form, departmentService, loadTableData]);

  // Modal cancel
  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
    if (form) {
      form.resetFields();
    }
  }, [form]);

  // Table columns
  const columns: TableColumnsType<DepartmentRecord> = useMemo(
    () => [
      {
        title: '部门名称',
        dataIndex: 'name',
        width: 200,
        render: (_, record) => (
          <Space>
            {record.children && record.children.length > 0 ? (
              <FolderOutlined style={{ color: '#faad14' }} />
            ) : (
              <FileOutlined style={{ color: '#8c8c8c' }} />
            )}
            <span style={{ fontWeight: 500 }}>{record.name}</span>
          </Space>
        ),
      },
      {
        title: '部门编码',
        dataIndex: 'code',
        width: 120,
        render: (value) => <code>{value}</code>,
      },
      {
        title: '上级部门',
        dataIndex: 'parentName',
        width: 150,
        render: (value, record) =>
          record.parentId === '0' || !record.parentId ? '-' : value || '-',
      },
      {
        title: '负责人',
        dataIndex: 'leader',
        width: 100,
      },
      {
        title: '联系电话',
        dataIndex: 'phone',
        width: 140,
      },
      {
        title: '排序',
        dataIndex: 'sort',
        width: 80,
        align: 'center',
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 80,
        align: 'center',
        render: (_, record) => {
          const { color, text } = getStatusTag(record.status);
          return <Tag color={color}>{text}</Tag>;
        },
      },
      {
        title: '描述',
        dataIndex: 'description',
        minWidth: 150,
        ellipsis: true,
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: 180,
        render: (_, record) => formatDate(record.createdAt),
      },
      {
        title: '操作',
        key: 'action',
        width: 140,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditDept(record)}
            >
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteDept(record)}
            >
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [handleEditDept, handleDeleteDept]
  );

  // Form items
  const formItems: CrudFormField[] = useMemo(
    () => [
      {
        key: 'name',
        label: '部门名称',
        type: 'text',
        required: true,
        placeholder: '请输入部门名称',
      },
      {
        key: 'code',
        label: '部门编码',
        type: 'text',
        required: true,
        placeholder: '请输入部门编码',
      },
      {
        key: 'parentId',
        label: '上级部门',
        type: 'select',
        required: true,
        options: parentOptions,
      },
      {
        key: 'leader',
        label: '负责人',
        type: 'text',
        placeholder: '请输入负责人姓名',
      },
      {
        key: 'phone',
        label: '联系电话',
        type: 'text',
        placeholder: '请输入联系电话',
      },
      {
        key: 'sort',
        label: '排序',
        type: 'number',
        required: true,
        placeholder: '请输入排序序号',
      },
      {
        key: 'status',
        label: '状态',
        type: 'select',
        required: true,
        options: [
          { label: '正常', value: 'active' },
          { label: '停用', value: 'inactive' },
        ],
      },
      {
        key: 'description',
        label: '描述',
        type: 'textarea',
        placeholder: '请输入部门描述',
      },
    ],
    [parentOptions]
  );

  return (
    <div className={styles.page}>
      <div className={styles.crud}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDept}>
              新增部门
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              刷新
            </Button>
          </div>
          <Space>
            <span className={styles.importTips}>
              支持导入 Excel 文件
            </span>
            <Button icon={<ExportOutlined />}>导出</Button>
          </Space>
        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          {departmentList.length > 0 ? (
            <AppTable
              ref={tableRef}
              dataSource={departmentList}
              columns={columns}
              loading={tableLoading}
              rowKey="id"
              rowClassName={styles.tableRow}
              pagination={{
                current: 1,
                pageSize: 10,
                total: departmentList.length,
              }}
              scroll={{ x: 1400 }}
            />
          ) : (
            <SharedEmpty description="暂无数据" />
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AppUpsert
        form={form}
        open={modalVisible}
        mode={modalMode}
        title={modalMode === 'add' ? '新增部门' : '编辑部门'}
        fields={formItems}
        width={800}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

DepartmentsPage.displayName = 'DepartmentsPage';

export default DepartmentsPage;
