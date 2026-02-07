/**
 * Users Page - Org Module
 * React Admin - Admin Application
 *
 * User management with department tree selector.
 *
 * Migrated from Vue3 (products/pc-admin/apps/admin-app/src/modules/org/views/users/index.vue)
 * to React + TypeScript + Ant Design
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Tag, Space, Button, Empty, Spin, Tooltip } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  UserOutlined,
  TeamOutlined,
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
  sort?: number;
  children?: DepartmentRecord[];
}

interface UserRecord {
  id?: string | number;
  username?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  deptId?: string | number;
  deptName?: string;
  status?: 'active' | 'inactive' | 'locked';
  role?: string;
  createdAt?: string;
}

// ============================================================================
// Mock Services (Replace with actual API)
// ============================================================================

const mockDepartmentService = {
  list: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      list: [
        {
          id: 1,
          name: '总公司',
          parentId: '0',
          sort: 1,
          children: [
            { id: 2, name: '技术部', parentId: 1, sort: 1 },
            { id: 3, name: '市场部', parentId: 1, sort: 2 },
            { id: 4, name: '人力资源部', parentId: 1, sort: 3 },
          ],
        },
        {
          id: 5,
          name: '分公司A',
          parentId: '0',
          sort: 2,
          children: [
            { id: 6, name: '销售部', parentId: 5, sort: 1 },
            { id: 7, name: '客服部', parentId: 5, sort: 2 },
          ],
        },
      ],
      total: 7,
    };
  },
};

const mockUserService = {
  list: async (params?: Record<string, unknown>) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const { current = 1, pageSize = 10, keyword = '', deptId } = params || {};

    const allUsers: UserRecord[] = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      username: `user${i + 1}`,
      nickname: `用户${i + 1}`,
      email: `user${i + 1}@example.com`,
      phone: `13800138${String(i).padStart(4, '0')}`,
      deptId: (i % 5) + 1,
      deptName: ['技术部', '市场部', '人力资源部', '销售部', '客服部'][i % 5],
      status: ['active', 'inactive', 'locked'][i % 3] as UserRecord['status'],
      role: ['admin', 'user', 'editor'][i % 3],
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    }));

    let filteredUsers = allUsers;
    if (keyword) {
      const lowerKeyword = (keyword as string).toLowerCase();
      filteredUsers = allUsers.filter(
        (user) =>
          user.username?.toLowerCase().includes(lowerKeyword) ||
          user.nickname?.toLowerCase().includes(lowerKeyword) ||
          user.email?.toLowerCase().includes(lowerKeyword)
      );
    }

    if (deptId) {
      filteredUsers = filteredUsers.filter((user) => user.deptId === deptId);
    }

    const start = ((current as number) - 1) * (pageSize as number);
    const end = start + (pageSize as number);

    return {
      list: filteredUsers.slice(start, end),
      total: filteredUsers.length,
    };
  },

  info: async (id: string | number) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      id,
      username: `user${id}`,
      nickname: `用户${id}`,
      email: `user${id}@example.com`,
      phone: `13800138000`,
      deptId: 1,
      deptName: '技术部',
      status: 'active',
      role: 'user',
      createdAt: new Date().toISOString(),
    };
  },

  add: async (data: UserRecord) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id: Date.now() };
  },

  update: async (id: string | number, data: UserRecord) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id };
  },

  delete: async (id: string | number) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Deleted user:', id);
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

const getStatusTag = (status?: string): { color: string; text: string; className: string } => {
  const statusMap: Record<string, { color: string; text: string; className: string }> = {
    active: { color: 'success', text: '正常', className: styles.statusActive },
    inactive: { color: 'error', text: '停用', className: styles.statusInactive },
    locked: { color: 'warning', text: '锁定', className: styles.statusLocked },
  };
  return statusMap[status || ''] || { color: 'default', text: '未知', className: '' };
};

const getRoleTag = (role?: string): { color: string; text: string } => {
  const roleMap: Record<string, { color: string; text: string }> = {
    admin: { color: 'red', text: '管理员' },
    user: { color: 'blue', text: '用户' },
    editor: { color: 'green', text: '编辑' },
  };
  return roleMap[role || ''] || { color: 'default', text: role || '-' };
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

// Flatten department tree for options
const flattenDepartments = (depts: DepartmentRecord[]): DepartmentRecord[] => {
  const result: DepartmentRecord[] = [];
  const traverse = (nodes: DepartmentRecord[]) => {
    for (const node of nodes) {
      result.push(node);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  };
  traverse(depts);
  return result;
};

// ============================================================================
// Users Page Component
// ============================================================================

export const UsersPage: React.FC = () => {
  // Services
  const departmentService = mockDepartmentService;
  const userService = mockUserService;

  // State
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [flatDepartments, setFlatDepartments] = useState<DepartmentRecord[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string | number | undefined>();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deptLoading, setDeptLoading] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [form] = React.useRef(null).current;

  // Refs
  const tableRef = useRef<AppTableRef>(null);

  // Load departments
  const loadDepartments = useCallback(async () => {
    setDeptLoading(true);
    try {
      const response = await departmentService.list();
      const deptList = (response.list as DepartmentRecord[]) || [];
      setDepartments(deptList);
      setFlatDepartments(flattenDepartments(deptList));
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setDeptLoading(false);
    }
  }, [departmentService]);

  // Load users
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.list({
        deptId: selectedDeptId,
      });
      setUsers(response.list);
      setUserTotal(response.total);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }, [userService, selectedDeptId]);

  // Initial load
  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle department selection
  const handleSelectDepartment = useCallback((deptId: string | number | undefined) => {
    setSelectedDeptId(deptId);
  }, []);

  // Handle department reload
  const handleDepartmentReload = useCallback(() => {
    loadDepartments();
  }, [loadDepartments]);

  // Handle user reload
  const handleUserReload = useCallback(() => {
    loadUsers();
  }, [loadUsers]);

  // Add user
  const handleAddUser = useCallback(() => {
    setModalMode('add');
    setEditingUser(null);
    if (form) {
      form.resetFields();
      if (selectedDeptId) {
        form.setFieldsValue({ deptId: selectedDeptId });
      }
    }
    setModalVisible(true);
  }, [form, selectedDeptId]);

  // Edit user
  const handleEditUser = useCallback(async (record: UserRecord) => {
    setModalMode('edit');
    setEditingUser(record);

    try {
      const detail = await userService.info(record.id!);
      if (form) {
        form.setFieldsValue(detail);
      }
      setModalVisible(true);
    } catch (error) {
      console.error('Failed to load user detail:', error);
    }
  }, [userService, form]);

  // Delete user
  const handleDeleteUser = useCallback(
    async (record: UserRecord) => {
      try {
        await userService.delete(record.id!);
        loadUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    },
    [userService, loadUsers]
  );

  // Modal ok
  const handleModalOk = useCallback(async () => {
    if (!form) return;

    try {
      const values = await form.validateFields();

      if (modalMode === 'add') {
        await userService.add(values);
      } else {
        await userService.update(editingUser?.id!, values);
      }

      setModalVisible(false);
      form.resetFields();
      loadUsers();
    } catch (error) {
      console.error('Save user error:', error);
    }
  }, [modalMode, editingUser, form, userService, loadUsers]);

  // Modal cancel
  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
    if (form) {
      form.resetFields();
    }
  }, [form]);

  // User columns
  const userColumns: TableColumnsType<UserRecord> = useMemo(
    () => [
      {
        title: '用户名',
        dataIndex: 'username',
        width: 120,
        render: (value) => (
          <Space>
            <UserOutlined />
            <span style={{ fontWeight: 500 }}>{value}</span>
          </Space>
        ),
      },
      {
        title: '昵称',
        dataIndex: 'nickname',
        width: 120,
      },
      {
        title: '所属部门',
        dataIndex: 'deptName',
        width: 120,
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        width: 180,
        ellipsis: true,
      },
      {
        title: '手机号',
        dataIndex: 'phone',
        width: 140,
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        align: 'center',
        render: (_, record) => {
          const { color, text, className } = getStatusTag(record.status);
          return (
            <Tag color={color}>
              <span className={className} style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginRight: 6 }} />
              {text}
            </Tag>
          );
        },
      },
      {
        title: '角色',
        dataIndex: 'role',
        width: 100,
        align: 'center',
        render: (_, record) => {
          const { color, text } = getRoleTag(record.role);
          return <Tag color={color}>{text}</Tag>;
        },
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
        width: 150,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Button type="link" size="small" onClick={() => handleEditUser(record)}>
              编辑
            </Button>
            <Button type="link" size="small" danger onClick={() => handleDeleteUser(record)}>
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [handleEditUser, handleDeleteUser]
  );

  // Form items
  const formItems: CrudFormField[] = useMemo(
    () => [
      {
        key: 'username',
        label: '用户名',
        type: 'text',
        required: true,
        placeholder: '请输入用户名',
      },
      {
        key: 'nickname',
        label: '昵称',
        type: 'text',
        required: true,
        placeholder: '请输入昵称',
      },
      {
        key: 'email',
        label: '邮箱',
        type: 'text',
        required: true,
        placeholder: '请输入邮箱',
      },
      {
        key: 'phone',
        label: '手机号',
        type: 'text',
        placeholder: '请输入手机号',
      },
      {
        key: 'deptId',
        label: '所属部门',
        type: 'select',
        required: true,
        options: flatDepartments.map((dept) => ({
          label: dept.name || '',
          value: dept.id || '',
        })),
      },
      {
        key: 'status',
        label: '状态',
        type: 'select',
        required: true,
        options: [
          { label: '正常', value: 'active' },
          { label: '停用', value: 'inactive' },
          { label: '锁定', value: 'locked' },
        ],
      },
      {
        key: 'role',
        label: '角色',
        type: 'select',
        required: true,
        options: [
          { label: '管理员', value: 'admin' },
          { label: '用户', value: 'user' },
          { label: '编辑', value: 'editor' },
        ],
      },
    ],
    [flatDepartments]
  );

  // Render department item
  const renderDepartment = (dept: DepartmentRecord, level = 0): React.ReactNode => {
    const isSelected = selectedDeptId === dept.id;
    const hasChildren = dept.children && dept.children.length > 0;

    return (
      <React.Fragment key={dept.id}>
        <div
          className={`${styles.departmentItem} ${isSelected ? styles.departmentItemSelected : ''}`}
          onClick={() => handleSelectDepartment(dept.id)}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          <TeamOutlined className={styles.departmentIcon} />
          <span className={styles.departmentName}>{dept.name}</span>
        </div>
        {hasChildren &&
          dept.children!.map((child) => renderDepartment(child, level + 1))}
      </React.Fragment>
    );
  };

  // Get selected department name
  const selectedDeptName = useMemo(() => {
    if (!selectedDeptId) return '全部';
    const dept = flatDepartments.find((d) => d.id === selectedDeptId);
    return dept?.name || '全部';
  }, [selectedDeptId, flatDepartments]);

  return (
    <div className={styles.page}>
      <div className={styles.masterDetail}>
        {/* Left Panel - Department Tree */}
        <div className={styles.leftPanel}>
          <div className={styles.leftPanelHeader}>
            <span className={styles.leftPanelTitle}>部门列表</span>
            <Tooltip title="刷新">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={handleDepartmentReload}
                loading={deptLoading}
                size="small"
              />
            </Tooltip>
          </div>
          <div className={styles.leftPanelContent}>
            <Spin spinning={deptLoading}>
              {departments.length > 0 ? (
                <div className={styles.departmentList}>
                  <div
                    className={`${styles.departmentItem} ${!selectedDeptId ? styles.departmentItemSelected : ''}`}
                    onClick={() => handleSelectDepartment(undefined)}
                    style={{ paddingLeft: 12 }}
                  >
                    <UserOutlined className={styles.departmentIcon} />
                    <span className={styles.departmentName}>全部</span>
                  </div>
                  {departments.map((dept) => renderDepartment(dept))}
                </div>
              ) : (
                <SharedEmpty description="暂无数据" />
              )}
            </Spin>
          </div>
        </div>

        {/* Right Panel - User List */}
        <div className={styles.rightPanel}>
          <div className={styles.rightPanelHeader}>
            <div className={styles.rightHeaderLeft}>
              <span className={styles.rightPanelTitle}>用户列表</span>
              {selectedDeptId && (
                <Tag color="processing">{selectedDeptName}</Tag>
              )}
            </div>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
                新增用户
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleUserReload} loading={loading}>
                刷新
              </Button>
            </Space>
          </div>
          <div className={styles.rightPanelContent}>
            <div className={styles.tableContainer}>
              <AppTable
                ref={tableRef}
                dataSource={users}
                columns={userColumns}
                loading={loading}
                rowKey="id"
                rowClassName={styles.tableRow}
                pagination={{
                  current: 1,
                  pageSize: 10,
                  total: userTotal,
                }}
                scroll={{ x: 1200 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AppUpsert
        form={form}
        open={modalVisible}
        mode={modalMode}
        title={modalMode === 'add' ? '新增用户' : '编辑用户'}
        fields={formItems}
        width="large"
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

UsersPage.displayName = 'UsersPage';

export default UsersPage;
