/**
 * Roles Page - Access Control Module
 * React Admin - Admin Application
 *
 * Lists roles with master-detail layout (domain list + role list).
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Tag, Select, Empty, Spin, Space, Button, Form, message } from 'antd';
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { AppTable } from '@enterprise-workspace/frontend/shared/data-display';
import type { AppTableRef } from '@enterprise-workspace/frontend/shared/data-display/Table/types';
import type { TableColumnsType } from 'antd/es/table';
import { AppUpsert } from '../../components';
import type { CrudFormField } from '../../components';
import styles from './index.module.css';

// ============================================================================
// Types
// ============================================================================

interface DomainRecord {
  id?: string | number;
  name?: string;
  code?: string;
  description?: string;
}

interface RoleRecord {
  id?: string | number;
  roleName?: string;
  roleCode?: string;
  roleType?: string;
  parentId?: string | number;
  domainId?: string | number;
  description?: string;
  createdAt?: string;
}

// ============================================================================
// Mock Services (Replace with actual API)
// ============================================================================

const mockDomainService = {
  list: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      list: [
        { id: 1, name: '系统域', code: 'SYSTEM', description: '系统管理域' },
        { id: 2, name: '业务域', code: 'BUSINESS', description: '业务管理域' },
        { id: 3, name: '数据域', code: 'DATA', description: '数据管理域' },
      ],
      total: 3,
    };
  },
};

const mockRoleService = {
  list: async (params?: Record<string, unknown>) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const { current = 1, pageSize = 10, domainId } = params || {};

    const allRoles: RoleRecord[] = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      roleName: `角色 ${i + 1}`,
      roleCode: `role:${i + 1}`,
      roleType: ['ADMIN', 'BUSINESS', 'GUEST'][i % 3] as string,
      parentId: i === 0 ? '0' : String((i % 10) + 1),
      domainId: (i % 3) + 1,
      description: `这是第 ${i + 1} 个角色的描述信息`,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    }));

    // Filter by domain
    const filteredRoles = domainId
      ? allRoles.filter((role) => role.domainId === domainId)
      : allRoles;

    const start = ((current as number) - 1) * (pageSize as number);
    const end = start + (pageSize as number);

    return {
      list: filteredRoles.slice(start, end),
      total: filteredRoles.length,
    };
  },

  info: async (id: string | number) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      id,
      roleName: `角色 ${id}`,
      roleCode: `role:${id}`,
      roleType: 'ADMIN',
      parentId: '0',
      domainId: 1,
      description: '角色描述信息',
      createdAt: new Date().toISOString(),
    };
  },

  add: async (data: RoleRecord) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id: Date.now() };
  },

  update: async (id: string | number, data: RoleRecord) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id };
  },

  delete: async (id: string | number) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Deleted role:', id);
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

const getRoleTypeTag = (type: string): { color: string; text: string } => {
  const typeMap: Record<string, { color: string; text: string }> = {
    ADMIN: { color: 'red', text: '管理员' },
    BUSINESS: { color: 'green', text: '业务员' },
    GUEST: { color: 'blue', text: '访客' },
  };
  return typeMap[type] || { color: 'default', text: type };
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

// ============================================================================
// Roles Page Component
// ============================================================================

export const RolesPage: React.FC = () => {
  // Services
  const domainService = mockDomainService;
  const roleService = mockRoleService;

  // State
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleRecord[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<string | number | undefined>();
  const [roleTotal, setRoleTotal] = useState(0);
  const [roleLoading, setRoleLoading] = useState(false);
  const [domainLoading, setDomainLoading] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);
  const [form] = Form.useForm();

  // Refs
  const roleTableRef = useRef<AppTableRef>(null);

  // Load domains
  const loadDomains = useCallback(async () => {
    setDomainLoading(true);
    try {
      const response = await domainService.list();
      setDomains(response.list);
    } catch (error) {
      console.error('Failed to load domains:', error);
    } finally {
      setDomainLoading(false);
    }
  }, [domainService]);

  // Load roles
  const loadRoles = useCallback(async (domainId?: string | number) => {
    setRoleLoading(true);
    try {
      const response = await roleService.list({ domainId });
      setRoles(response.list);
      setRoleTotal(response.total);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setRoleLoading(false);
    }
  }, [roleService]);

  // Load role options for parentId select
  const loadRoleOptions = useCallback(async () => {
    try {
      const response = await roleService.list({ pageSize: 100 });
      setRoleOptions(response.list);
    } catch (error) {
      console.error('Failed to load role options:', error);
    }
  }, [roleService]);

  // Initial load
  useEffect(() => {
    loadDomains();
    loadRoles();
    loadRoleOptions();
  }, [loadDomains, loadRoles, loadRoleOptions]);

  // Handle domain selection
  const handleDomainSelect = useCallback(
    (value: string | number) => {
      setSelectedDomainId(value);
      loadRoles(value);
    },
    [loadRoles]
  );

  // Handle domain reload
  const handleDomainReload = useCallback(() => {
    loadDomains();
  }, [loadDomains]);

  // Handle role reload
  const handleRoleReload = useCallback(() => {
    loadRoles(selectedDomainId);
  }, [loadRoles, selectedDomainId]);

  // Add role
  const handleAddRole = useCallback(() => {
    setModalMode('add');
    setEditingRole(null);
    form.resetFields();
    // Set default domain
    if (selectedDomainId) {
      form.setFieldsValue({ domainId: selectedDomainId });
    }
    setModalVisible(true);
  }, [form, selectedDomainId]);

  // Edit role
  const handleEditRole = useCallback(
    async (record: RoleRecord) => {
      setModalMode('edit');
      setEditingRole(record);

      // Load role detail
      try {
        const detail = await roleService.info(record.id!);
        form.setFieldsValue(detail);
        setModalVisible(true);
      } catch (error) {
        console.error('Failed to load role detail:', error);
      }
    },
    [roleService, form]
  );

  // Delete role
  const handleDeleteRole = useCallback(
    async (record: RoleRecord) => {
      try {
        await roleService.delete(record.id!);
        message.success('删除成功');
        loadRoles(selectedDomainId);
      } catch (error) {
        console.error('Failed to delete role:', error);
        message.error('删除失败');
      }
    },
    [roleService, loadRoles, selectedDomainId]
  );

  // Modal ok
  const handleModalOk = useCallback(async () => {
    try {
      const values = await form.validateFields();

      if (modalMode === 'add') {
        await roleService.add(values);
        message.success('新增成功');
      } else {
        await roleService.update(editingRole?.id!, values);
        message.success('更新成功');
      }

      setModalVisible(false);
      form.resetFields();
      loadRoles(selectedDomainId);
    } catch (error) {
      console.error('Save role error:', error);
    }
  }, [modalMode, editingRole, form, roleService, loadRoles, selectedDomainId]);

  // Modal cancel
  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
    form.resetFields();
  }, [form]);

  // Domain columns
  const domainColumns: TableColumnsType<DomainRecord> = useMemo(
    () => [
      {
        title: '域名',
        dataIndex: 'name',
        key: 'name',
        render: (_, record) => (
          <Space>
            <span>{record.name}</span>
            <Tag color="blue">{record.code}</Tag>
          </Space>
        ),
      },
    ],
    []
  );

  // Role columns
  const roleColumns: TableColumnsType<RoleRecord> = useMemo(
    () => [
      {
        title: '序号',
        key: 'index',
        width: 60,
        fixed: 'left',
        render: (_, __, index) => index + 1,
      },
      {
        title: '角色名称',
        dataIndex: 'roleName',
        key: 'roleName',
        width: 120,
      },
      {
        title: '角色编码',
        dataIndex: 'roleCode',
        key: 'roleCode',
        width: 140,
        render: (value) => <code>{value}</code>,
      },
      {
        title: '角色类型',
        dataIndex: 'roleType',
        key: 'roleType',
        width: 100,
        align: 'center',
        render: (_, record) => {
          const { color, text } = getRoleTypeTag(record.roleType || '');
          return <Tag color={color}>{text}</Tag>;
        },
      },
      {
        title: '父级角色',
        dataIndex: 'parentId',
        key: 'parentId',
        width: 120,
        render: (_, record) => {
          if (!record.parentId || record.parentId === '0') return '无';
          const parent = roleOptions.find((r) => r.id === record.parentId);
          return parent?.roleName || record.parentId;
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
            <Button type="link" size="small" onClick={() => handleEditRole(record)}>
              编辑
            </Button>
            <Button type="link" size="small" danger onClick={() => handleDeleteRole(record)}>
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [roleOptions, handleEditRole, handleDeleteRole]
  );

  // Form items
  const formItems: CrudFormField[] = useMemo(
    () => [
      {
        key: 'roleName',
        label: '角色名称',
        type: 'text',
        required: true,
        placeholder: '请输入角色名称',
      },
      {
        key: 'roleCode',
        label: '角色编码',
        type: 'text',
        required: true,
        placeholder: '请输入角色编码',
      },
      {
        key: 'roleType',
        label: '角色类型',
        type: 'select',
        required: true,
        options: [
          { label: '管理员', value: 'ADMIN' },
          { label: '业务员', value: 'BUSINESS' },
          { label: '访客', value: 'GUEST' },
        ],
      },
      {
        key: 'parentId',
        label: '父级角色',
        type: 'select',
        options: roleOptions.map((r) => ({ label: r.roleName || '', value: r.id || '' })),
      },
      {
        key: 'domainId',
        label: '所属域',
        type: 'select',
        required: true,
        options: domains.map((d) => ({ label: d.name || '', value: d.id || '' })),
      },
      {
        key: 'description',
        label: '描述',
        type: 'textarea',
        placeholder: '请输入角色描述',
      },
    ],
    [domains, roleOptions]
  );

  return (
    <div className={styles.page}>
      <div className={styles.masterDetail}>
        {/* Domain List (Left Panel) */}
        <div className={styles.leftPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>域列表</span>
            <Button type="text" icon={<ReloadOutlined />} onClick={handleDomainReload} loading={domainLoading} />
          </div>
          <div className={styles.panelContent}>
            <Spin spinning={domainLoading}>
              {domains.length > 0 ? (
                <div className={styles.domainList}>
                  {domains.map((domain) => (
                    <div
                      key={domain.id}
                      className={`${styles.domainItem} ${selectedDomainId === domain.id ? styles.selected : ''}`}
                      onClick={() => handleDomainSelect(domain.id!)}
                    >
                      <span className={styles.domainName}>{domain.name}</span>
                      <Tag color="blue" className={styles.domainCode}>
                        {domain.code}
                      </Tag>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="暂无数据" />
              )}
            </Spin>
          </div>
        </div>

        {/* Role List (Right Panel) */}
        <div className={styles.rightPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.rightHeaderLeft}>
              <span className={styles.panelTitle}>角色列表</span>
              {selectedDomainId && (
                <Tag color="processing">
                  {domains.find((d) => d.id === selectedDomainId)?.name}
                </Tag>
              )}
            </div>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRole}>
                新增角色
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleRoleReload} loading={roleLoading}>
                刷新
              </Button>
            </Space>
          </div>
          <div className={styles.panelContent}>
            <AppTable
              ref={roleTableRef}
              dataSource={roles}
              columns={roleColumns}
              loading={roleLoading}
              rowKey="id"
              pagination={{
                current: 1,
                pageSize: 10,
                total: roleTotal,
              }}
              scroll={{ x: 1000 }}
            />
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AppUpsert
        form={form}
        open={modalVisible}
        mode={modalMode}
        title={modalMode === 'add' ? '新增角色' : '编辑角色'}
        fields={formItems}
        width="large"
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

RolesPage.displayName = 'RolesPage';

export default RolesPage;
