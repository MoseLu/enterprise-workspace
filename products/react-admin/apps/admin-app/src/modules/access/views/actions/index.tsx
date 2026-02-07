/**
 * Actions Page - Access Control Module
 * React Admin - Admin Application
 *
 * Manages access actions with simple table CRUD.
 * Action types: READ, WRITE, DELETE, EXECUTE
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Tag, Button, Space, Form, message } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { AppCrud } from '../../components';
import type { CrudColumn, CrudFormField, CrudService } from '../../components';
import styles from './index.module.css';

// ============================================================================
// Types
// ============================================================================

interface ActionRecord {
  id?: string | number;
  actionNameCn?: string;
  actionCode?: string;
  actionType?: 'READ' | 'WRITE' | 'DELETE' | 'EXECUTE';
  httpMethod?: string;
  description?: string;
  createdAt?: string;
}

// ============================================================================
// Mock Services (Replace with actual API)
// ============================================================================

const mockActionService: CrudService<ActionRecord> = {
  list: async (params?: Record<string, unknown>) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const { current = 1, pageSize = 10, keyword } = params || {};

    const allActions: ActionRecord[] = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      actionNameCn: `操作 ${i + 1}`,
      actionCode: `action:${i + 1}`,
      actionType: ['READ', 'WRITE', 'DELETE', 'EXECUTE'][i % 4] as ActionRecord['actionType'],
      httpMethod: ['GET', 'POST', 'PUT', 'DELETE'][i % 4],
      description: `这是第 ${i + 1} 个操作的描述信息`,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    }));

    // Filter by keyword
    const filteredActions = keyword
      ? allActions.filter(
          (action) =>
            action.actionNameCn?.includes(keyword as string) ||
            action.actionCode?.includes(keyword as string)
        )
      : allActions;

    const start = ((current as number) - 1) * (pageSize as number);
    const end = start + (pageSize as number);

    return {
      list: filteredActions.slice(start, end),
      total: filteredActions.length,
    };
  },

  info: async (id: string | number) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      id,
      actionNameCn: `操作 ${id}`,
      actionCode: `action:${id}`,
      actionType: 'READ',
      httpMethod: 'GET',
      description: '操作描述信息',
      createdAt: new Date().toISOString(),
    };
  },

  add: async (data: ActionRecord) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id: Date.now() };
  },

  update: async (id: string | number, data: ActionRecord) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id };
  },

  delete: async (id: string | number) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Deleted action:', id);
  },

  deleteMany: async (ids: (string | number)[]) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Deleted actions:', ids);
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

const getActionTypeTag = (
  type?: string
): { color: string; text: string } => {
  const typeMap: Record<string, { color: string; text: string }> = {
    READ: { color: 'blue', text: '读取' },
    WRITE: { color: 'green', text: '写入' },
    DELETE: { color: 'red', text: '删除' },
    EXECUTE: { color: 'orange', text: '执行' },
  };
  return typeMap[type || ''] || { color: 'default', text: type || '未知' };
};

const getHttpMethodTag = (method?: string): { color: string; text: string } => {
  const methodMap: Record<string, { color: string; text: string }> = {
    GET: { color: 'green', text: 'GET' },
    POST: { color: 'blue', text: 'POST' },
    PUT: { color: 'orange', text: 'PUT' },
    DELETE: { color: 'red', text: 'DELETE' },
    PATCH: { color: 'purple', text: 'PATCH' },
  };
  return methodMap[method || ''] || { color: 'default', text: method || '-' };
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

// ============================================================================
// Actions Page Component
// ============================================================================

export const ActionsPage: React.FC = () => {
  // Service
  const actionService = mockActionService;

  // State
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<ActionRecord[]>([]);
  const [total, setTotal] = useState(0);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingRecord, setEditingRecord] = useState<ActionRecord | null>(null);
  const [form] = Form.useForm();

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await actionService.list();
      setDataSource(response.list || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Failed to load actions:', error);
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [actionService]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh
  const handleRefresh = useCallback(() => {
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
  const handleEdit = useCallback(
    async (record: ActionRecord) => {
      setModalMode('edit');
      setEditingRecord(record);

      try {
        const detail = await actionService.info(record.id!);
        form.setFieldsValue(detail);
        setModalVisible(true);
      } catch {
        message.error('获取详情失败');
      }
    },
    [actionService, form]
  );

  // Delete
  const handleDelete = useCallback(
    async (record: ActionRecord) => {
      try {
        await actionService.delete(record.id!);
        message.success('删除成功');
        loadData();
      } catch {
        message.error('删除失败');
      }
    },
    [actionService, loadData]
  );

  // Modal ok
  const handleModalOk = useCallback(async () => {
    try {
      const values = await form.validateFields();

      if (modalMode === 'add') {
        await actionService.add(values);
        message.success('新增成功');
      } else {
        await actionService.update(editingRecord?.id!, values);
        message.success('更新成功');
      }

      setModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      console.error('Save error:', error);
    }
  }, [modalMode, editingRecord, form, actionService, loadData]);

  // Modal cancel
  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
    form.resetFields();
  }, [form]);

  // Form items
  const formItems: CrudFormField[] = useMemo(
    () => [
      {
        key: 'actionNameCn',
        label: '行为名称',
        type: 'text',
        required: true,
        placeholder: '请输入行为名称',
      },
      {
        key: 'actionCode',
        label: '行为编码',
        type: 'text',
        required: true,
        placeholder: '请输入行为编码',
      },
      {
        key: 'actionType',
        label: '类型',
        type: 'select',
        required: true,
        options: [
          { label: '读取', value: 'READ' },
          { label: '写入', value: 'WRITE' },
          { label: '删除', value: 'DELETE' },
          { label: '执行', value: 'EXECUTE' },
        ],
      },
      {
        key: 'httpMethod',
        label: 'HTTP方法',
        type: 'select',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
          { label: 'PATCH', value: 'PATCH' },
        ],
      },
      {
        key: 'description',
        label: '描述',
        type: 'textarea',
        placeholder: '请输入行为描述',
      },
    ],
    []
  );

  // Table columns
  const columns: CrudColumn<ActionRecord>[] = useMemo(
    () => [
      {
        title: '序号',
        key: 'index',
        width: 60,
        fixed: 'left',
        render: (_, __, index) => index + 1,
      },
      {
        title: '行为名称',
        dataIndex: 'actionNameCn',
        key: 'actionNameCn',
        width: 150,
      },
      {
        title: '行为编码',
        dataIndex: 'actionCode',
        key: 'actionCode',
        width: 180,
        render: (value) => <code>{value}</code>,
      },
      {
        title: '类型',
        dataIndex: 'actionType',
        key: 'actionType',
        width: 100,
        align: 'center',
        render: (_, record) => {
          const { color, text } = getActionTypeTag(record.actionType);
          return <Tag color={color}>{text}</Tag>;
        },
      },
      {
        title: 'HTTP方法',
        dataIndex: 'httpMethod',
        key: 'httpMethod',
        width: 100,
        align: 'center',
        render: (_, record) => {
          const { color, text } = getHttpMethodTag(record.httpMethod);
          return <Tag color={color}>{text}</Tag>;
        },
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        minWidth: 200,
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
          <h2 className={styles.title}>行为列表</h2>
          <Tag color="blue">共 {total} 条</Tag>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增行为
          </Button>
        </Space>
      </div>

      <div className={styles.content}>
        <AppCrud
          service={actionService}
          columns={columns}
          formItems={formItems}
          showRefresh={false}
          showAdd={false}
          showMultiDelete={true}
          showSearchKey={true}
          modalWidth="large"
          addButtonText="新增行为"
          successMessage={{
            add: '新增成功',
            update: '更新成功',
            delete: '删除成功',
          }}
          open={modalVisible}
          mode={modalMode}
          title={modalMode === 'add' ? '新增行为' : '编辑行为'}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
        />
      </div>
    </div>
  );
};

ActionsPage.displayName = 'ActionsPage';

export default ActionsPage;
