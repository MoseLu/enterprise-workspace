/**
 * Resources Page - Access Control Module
 * React Admin - Admin Application
 *
 * Manages access resources with hierarchical tree view.
 * Resource types: MENU, BUTTON, API
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Tag, Button, Space, Form, message, Empty, Spin, Tree } from 'antd';
import {
  ReloadOutlined,
  PlusOutlined,
  SyncOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FileOutlined,
  ApiOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import type { TreeProps } from 'antd/es/tree';
import { AppCrud } from '../../components';
import type { CrudColumn, CrudFormField, CrudService } from '../../components';
import styles from './index.module.css';

// ============================================================================
// Types
// ============================================================================

interface ResourceRecord {
  id?: string | number;
  resourceNameCn?: string;
  resourceCode?: string;
  resourceType?: 'MENU' | 'BUTTON' | 'API' | 'FILE' | 'TABLE';
  parentId?: string | number;
  description?: string;
  children?: ResourceRecord[];
  createdAt?: string;
}

// ============================================================================
// Mock Services (Replace with actual API)
// ============================================================================

const mockResourceService: CrudService<ResourceRecord> & {
  pull?: () => Promise<void>;
} = {
  list: async (params?: Record<string, unknown>) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const { current = 1, pageSize = 10, keyword, parentId } = params || {};

    // Build hierarchical data
    const buildTree = (
      items: ResourceRecord[],
      parentIdVal?: string | number
    ): ResourceRecord[] => {
      return items
        .filter((item) => {
          const matchesParent = parentIdVal
            ? item.parentId === parentIdVal
            : !item.parentId || item.parentId === '0' || item.parentId === 0;
          const matchesKeyword = keyword
            ? (item.resourceNameCn?.includes(keyword as string) ||
                item.resourceCode?.includes(keyword as string))
            : true;
          return matchesParent && matchesKeyword;
        })
        .map((item) => ({
          ...item,
          children: buildTree(items, item.id),
        }));
    };

    const allResources: ResourceRecord[] = [
      {
        id: 1,
        resourceNameCn: '系统管理',
        resourceCode: 'system',
        resourceType: 'MENU',
        parentId: 0,
        description: '系统管理模块',
        children: [
          {
            id: 11,
            resourceNameCn: '用户管理',
            resourceCode: 'system:user',
            resourceType: 'MENU',
            parentId: 1,
            description: '用户管理菜单',
            children: [
              {
                id: 111,
                resourceNameCn: '查询用户',
                resourceCode: 'system:user:query',
                resourceType: 'API',
                parentId: 11,
                description: '查询用户列表',
              },
              {
                id: 112,
                resourceNameCn: '新增用户',
                resourceCode: 'system:user:add',
                resourceType: 'BUTTON',
                parentId: 11,
                description: '新增用户按钮',
              },
              {
                id: 113,
                resourceNameCn: '编辑用户',
                resourceCode: 'system:user:edit',
                resourceType: 'BUTTON',
                parentId: 11,
                description: '编辑用户按钮',
              },
              {
                id: 114,
                resourceNameCn: '删除用户',
                resourceCode: 'system:user:delete',
                resourceType: 'BUTTON',
                parentId: 11,
                description: '删除用户按钮',
              },
            ],
          },
          {
            id: 12,
            resourceNameCn: '角色管理',
            resourceCode: 'system:role',
            resourceType: 'MENU',
            parentId: 1,
            description: '角色管理菜单',
            children: [
              {
                id: 121,
                resourceNameCn: '查询角色',
                resourceCode: 'system:role:query',
                resourceType: 'API',
                parentId: 12,
                description: '查询角色列表',
              },
              {
                id: 122,
                resourceNameCn: '新增角色',
                resourceCode: 'system:role:add',
                resourceType: 'BUTTON',
                parentId: 12,
                description: '新增角色按钮',
              },
            ],
          },
        ],
      },
      {
        id: 2,
        resourceNameCn: '业务管理',
        resourceCode: 'business',
        resourceType: 'MENU',
        parentId: 0,
        description: '业务管理模块',
        children: [
          {
            id: 21,
            resourceNameCn: '订单管理',
            resourceCode: 'business:order',
            resourceType: 'MENU',
            parentId: 2,
            description: '订单管理菜单',
            children: [
              {
                id: 211,
                resourceNameCn: '查询订单',
                resourceCode: 'business:order:query',
                resourceType: 'API',
                parentId: 21,
                description: '查询订单列表',
              },
              {
                id: 212,
                resourceNameCn: '导出订单',
                resourceCode: 'business:order:export',
                resourceType: 'BUTTON',
                parentId: 21,
                description: '导出订单按钮',
              },
            ],
          },
        ],
      },
      {
        id: 3,
        resourceNameCn: '数据报表',
        resourceCode: 'report',
        resourceType: 'MENU',
        parentId: 0,
        description: '数据报表模块',
      },
      {
        id: 4,
        resourceNameCn: '文件上传接口',
        resourceCode: 'file:upload',
        resourceType: 'API',
        parentId: 0,
        description: '文件上传API',
      },
      {
        id: 5,
        resourceNameCn: '用户数据表',
        resourceCode: 'table:user',
        resourceType: 'TABLE',
        parentId: 0,
        description: '用户数据表',
      },
    ];

    // For flat list view (when expanded), use different logic
    const flatList = allResources.flatMap((r) => [
      r,
      ...(r.children?.flatMap((c) => [c, ...(c.children || [])]) || []),
    ]);

    const start = ((current as number) - 1) * (pageSize as number);
    const end = start + (pageSize as number);

    return {
      list: flatList.slice(start, end),
      total: flatList.length,
    };
  },

  info: async (id: string | number) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      id,
      resourceNameCn: `资源 ${id}`,
      resourceCode: `resource:${id}`,
      resourceType: 'API',
      parentId: 0,
      description: '资源描述信息',
      createdAt: new Date().toISOString(),
    };
  },

  add: async (data: ResourceRecord) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id: Date.now() };
  },

  update: async (id: string | number, data: ResourceRecord) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id };
  },

  delete: async (id: string | number) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Deleted resource:', id);
  },

  pull: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Synced resources from source');
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

const getResourceTypeTag = (
  type?: string
): { color: string; text: string; icon: React.ReactNode } => {
  const typeMap: Record<
    string,
    { color: string; text: string; icon: React.ReactNode }
  > = {
    MENU: { color: 'blue', text: '菜单', icon: <MenuOutlined /> },
    BUTTON: { color: 'green', text: '按钮', icon: <FileOutlined /> },
    API: { color: 'orange', text: 'API', icon: <ApiOutlined /> },
    FILE: { color: 'purple', text: '文件', icon: <FolderOutlined /> },
    TABLE: { color: 'cyan', text: '数据表', icon: <FolderOutlined /> },
  };
  return (
    typeMap[type || ''] || { color: 'default', text: type || '未知', icon: null }
  );
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

// ============================================================================
// Resources Page Component
// ============================================================================

export const ResourcesPage: React.FC = () => {
  // Service
  const resourceService = mockResourceService;

  // State
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [dataSource, setDataSource] = useState<ResourceRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingRecord, setEditingRecord] = useState<ResourceRecord | null>(null);
  const [form] = Form.useForm();

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await resourceService.list();
      setDataSource(response.list || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Failed to load resources:', error);
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [resourceService]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Data sync
  const handleSync = useCallback(async () => {
    if (syncLoading) return;

    try {
      setSyncLoading(true);
      await resourceService.pull?.();
      message.success('数据同步成功');
      loadData();
    } catch {
      message.error('数据同步失败');
    } finally {
      setSyncLoading(false);
    }
  }, [syncLoading, resourceService, loadData]);

  // Refresh
  const handleRefresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // Expand/Collapse
  const handleExpand: TreeProps['onExpand'] = useCallback((keys) => {
    setExpandedKeys(keys);
  }, []);

  // Add
  const handleAdd = useCallback(() => {
    setModalMode('add');
    setEditingRecord(null);
    form.resetFields();
    // Set default parent if editing a node
    setModalVisible(true);
  }, [form]);

  // Edit
  const handleEdit = useCallback(
    async (record: ResourceRecord) => {
      setModalMode('edit');
      setEditingRecord(record);

      try {
        const detail = await resourceService.info(record.id!);
        form.setFieldsValue(detail);
        setModalVisible(true);
      } catch {
        message.error('获取详情失败');
      }
    },
    [resourceService, form]
  );

  // Delete
  const handleDelete = useCallback(
    async (record: ResourceRecord) => {
      try {
        await resourceService.delete(record.id!);
        message.success('删除成功');
        loadData();
      } catch {
        message.error('删除失败');
      }
    },
    [resourceService, loadData]
  );

  // Modal ok
  const handleModalOk = useCallback(async () => {
    try {
      const values = await form.validateFields();

      if (modalMode === 'add') {
        await resourceService.add(values);
        message.success('新增成功');
      } else {
        await resourceService.update(editingRecord?.id!, values);
        message.success('更新成功');
      }

      setModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      console.error('Save error:', error);
    }
  }, [modalMode, editingRecord, form, resourceService, loadData]);

  // Modal cancel
  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
    form.resetFields();
  }, [form]);

  // Tree node title render
  const renderTreeNodeTitle = (record: ResourceRecord): React.ReactNode => {
    const { color, text, icon } = getResourceTypeTag(record.resourceType);
    return (
      <Space>
        <span>{record.resourceNameCn}</span>
        <Tag color={color} icon={icon}>
          {text}
        </Tag>
        <code className={styles.resourceCode}>{record.resourceCode}</code>
      </Space>
    );
  };

  // Transform to tree nodes
  const treeData = useMemo((): TreeProps['treeData'] => {
    return dataSource.map((record) => ({
      key: record.id,
      title: renderTreeNodeTitle(record),
      icon: record.children?.length ? <FolderOutlined /> : <FileOutlined />,
      children: record.children?.map((child) => ({
        key: child.id,
        title: renderTreeNodeTitle(child),
        icon: child.children?.length ? <FolderOutlined /> : <FileOutlined />,
        children: child.children?.map((grandChild) => ({
          key: grandChild.id,
          title: renderTreeNodeTitle(grandChild),
          icon: <FileOutlined />,
        })),
      })),
    }));
  }, [dataSource]);

  // Form items
  const formItems: CrudFormField[] = useMemo(
    () => [
      {
        key: 'resourceNameCn',
        label: '资源名称',
        type: 'text',
        required: true,
        placeholder: '请输入资源名称',
      },
      {
        key: 'resourceCode',
        label: '资源编码',
        type: 'text',
        required: true,
        placeholder: '请输入资源编码',
      },
      {
        key: 'resourceType',
        label: '资源类型',
        type: 'select',
        required: true,
        options: [
          { label: '菜单', value: 'MENU' },
          { label: '按钮', value: 'BUTTON' },
          { label: 'API', value: 'API' },
          { label: '文件', value: 'FILE' },
          { label: '数据表', value: 'TABLE' },
        ],
      },
      {
        key: 'parentId',
        label: '父级资源',
        type: 'select',
        options: dataSource
          .filter((r) => r.resourceType === 'MENU')
          .map((r) => ({
            label: r.resourceNameCn || '',
            value: r.id || '',
          })),
      },
      {
        key: 'description',
        label: '描述',
        type: 'textarea',
        placeholder: '请输入资源描述',
      },
    ],
    [dataSource]
  );

  // Table columns
  const columns: CrudColumn<ResourceRecord>[] = useMemo(
    () => [
      {
        title: '序号',
        key: 'index',
        width: 60,
        fixed: 'left',
        render: (_, __, index) => index + 1,
      },
      {
        title: '资源名称',
        dataIndex: 'resourceNameCn',
        key: 'resourceNameCn',
        width: 180,
        render: (_, record) => record.resourceNameCn,
      },
      {
        title: '资源编码',
        dataIndex: 'resourceCode',
        key: 'resourceCode',
        width: 200,
        render: (value) => <code>{value}</code>,
      },
      {
        title: '类型',
        dataIndex: 'resourceType',
        key: 'resourceType',
        width: 100,
        align: 'center',
        render: (_, record) => {
          const { color, text, icon } = getResourceTypeTag(record.resourceType);
          return (
            <Tag color={color} icon={icon}>
              {text}
            </Tag>
          );
        },
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        minWidth: 150,
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
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
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            >
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [handleEdit, handleDelete]
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>资源列表</h2>
          <Tag color="blue">共 {total} 条</Tag>
        </div>
        <Space>
          <Button
            icon={<SyncOutlined spin={syncLoading} />}
            loading={syncLoading}
            onClick={handleSync}
          >
            数据同步
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增资源
          </Button>
        </Space>
      </div>

      <div className={styles.content}>
        {dataSource.length > 0 ? (
          <Tree
            treeData={treeData}
            expandedKeys={expandedKeys}
            onExpand={handleExpand}
            showIcon
            defaultExpandAll
            blockNode
            className={styles.resourceTree}
          />
        ) : (
          <Empty description="暂无数据" />
        )}
      </div>

      {/* Add/Edit Modal */}
      <AppCrud
        service={resourceService}
        columns={columns}
        formItems={formItems}
        showRefresh={false}
        showAdd={false}
        showMultiDelete={false}
        showSearchKey={false}
        modalWidth="large"
        addButtonText="新增资源"
        successMessage={{
          add: '新增成功',
          update: '更新成功',
          delete: '删除成功',
        }}
        open={modalVisible}
        mode={modalMode}
        title={modalMode === 'add' ? '新增资源' : '编辑资源'}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

ResourcesPage.displayName = 'ResourcesPage';

export default ResourcesPage;
