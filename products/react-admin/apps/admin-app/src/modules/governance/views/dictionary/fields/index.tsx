/**
 * Dictionary Fields Page - Governance Module
 * React Admin - Admin Application
 *
 * Manages dictionary fields with master-detail layout (resource list + field list).
 * Fields are linked to resources and can navigate to dictionary values.
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tag, Button, Space, Empty, Spin, message } from 'antd';
import {
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { AppTable } from '@enterprise-workspace/frontend/shared/data-display';
import type { AppTableRef } from '@enterprise-workspace/frontend/shared/data-display/Table/types';
import type { TableColumnsType } from 'antd/es/table';
import type { CrudService } from '../../components';
import styles from './index.module.css';

// ============================================================================
// Types
// ============================================================================

interface ResourceRecord {
  id?: string | number;
  resourceNameCn?: string;
  resourceCode?: string;
  description?: string;
}

interface DictionaryFieldRecord {
  id?: string | number;
  fieldName?: string;
  dictName?: string;
  dictCode?: string;
  fieldType?: string;
  fieldLength?: number;
  required?: boolean;
  validationRules?: string;
  domainId?: string | number;
  entityClass?: string;
  createdAt?: string;
}

// ============================================================================
// Mock Services (Replace with actual API)
// ============================================================================

const mockResourceService = {
  list: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      list: [
        { id: 1, resourceNameCn: '用户管理', resourceCode: 'user', description: '用户相关配置' },
        { id: 2, resourceNameCn: '订单管理', resourceCode: 'order', description: '订单相关配置' },
        { id: 3, resourceNameCn: '产品管理', resourceCode: 'product', description: '产品相关配置' },
        { id: 4, resourceNameCn: '系统配置', resourceCode: 'system', description: '系统配置' },
      ],
      total: 4,
    };
  },
};

const mockFieldService: CrudService<DictionaryFieldRecord> & {
  page?: (params: Record<string, unknown>) => Promise<{ list: DictionaryFieldRecord[]; total: number }>;
} = {
  list: async (params?: Record<string, unknown>) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const { current = 1, pageSize = 10, keyword } = params || {};

    const allFields: DictionaryFieldRecord[] = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      fieldName: `字段${i + 1}`,
      dictName: `字典名称${i + 1}`,
      dictCode: `dict:${i + 1}`,
      fieldType: ['STRING', 'NUMBER', 'DATE', 'BOOLEAN'][i % 4],
      fieldLength: [50, 100, 200, 10][i % 4],
      required: i % 3 === 0,
      validationRules: i % 2 === 0 ? 'required' : '',
      domainId: (i % 4) + 1,
      entityClass: ['user', 'order', 'product', 'system'][i % 4],
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    }));

    // Filter by entityClass from keyword
    const filteredFields = keyword && (keyword as Record<string, unknown>).entityClass
      ? allFields.filter(f => f.entityClass === (keyword as Record<string, unknown>).entityClass)
      : allFields;

    const start = ((current as number) - 1) * (pageSize as number);
    const end = start + (pageSize as number);

    return {
      list: filteredFields.slice(start, end),
      total: filteredFields.length,
    };
  },

  info: async (id: string | number) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      id,
      fieldName: `字段${id}`,
      dictName: `字典名称${id}`,
      dictCode: `dict:${id}`,
      fieldType: 'STRING',
      fieldLength: 100,
      required: true,
      validationRules: 'required',
      domainId: 1,
      entityClass: 'user',
      createdAt: new Date().toISOString(),
    };
  },

  add: async (data: DictionaryFieldRecord) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id: Date.now() };
  },

  update: async (id: string | number, data: DictionaryFieldRecord) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id };
  },

  delete: async (id: string | number) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Deleted field:', id);
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

const getFieldTypeTag = (type?: string): { color: string; text: string } => {
  const typeMap: Record<string, { color: string; text: string }> = {
    STRING: { color: 'blue', text: '字符串' },
    NUMBER: { color: 'green', text: '数字' },
    DATE: { color: 'orange', text: '日期' },
    BOOLEAN: { color: 'purple', text: '布尔值' },
  };
  return typeMap[type || ''] || { color: 'default', text: type || '未知' };
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

// ============================================================================
// Dictionary Fields Page Component
// ============================================================================

export const DictionaryFieldsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Services
  const resourceService = mockResourceService;
  const fieldService = mockFieldService;

  // State
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [fields, setFields] = useState<DictionaryFieldRecord[]>([]);
  const [selectedResource, setSelectedResource] = useState<ResourceRecord | null>(null);
  const [fieldTotal, setFieldTotal] = useState(0);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [fieldLoading, setFieldLoading] = useState(false);

  // Refs
  const fieldTableRef = useRef<AppTableRef>(null);

  // Load resources
  const loadResources = useCallback(async () => {
    setResourceLoading(true);
    try {
      const response = await resourceService.list();
      setResources(response.list);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setResourceLoading(false);
    }
  }, [resourceService]);

  // Load fields
  const loadFields = useCallback(async (resource?: ResourceRecord | null) => {
    setFieldLoading(true);
    try {
      const params: Record<string, unknown> = {
        current: 1,
        pageSize: 10,
      };

      // If resource selected, filter by entityClass
      if (resource?.resourceCode) {
        params.keyword = { entityClass: resource.resourceCode };
      }

      const response = await fieldService.list(params);
      setFields(response.list);
      setFieldTotal(response.total);
    } catch (error) {
      console.error('Failed to load fields:', error);
    } finally {
      setFieldLoading(false);
    }
  }, [fieldService]);

  // Initial load
  useEffect(() => {
    loadResources();
    loadFields(null);
  }, [loadResources, loadFields]);

  // Handle resource selection
  const handleResourceSelect = useCallback((resource: ResourceRecord) => {
    setSelectedResource(resource);
    loadFields(resource);
  }, [loadFields]);

  // Handle resource reload
  const handleResourceReload = useCallback(() => {
    loadResources();
  }, [loadResources]);

  // Handle field reload
  const handleFieldReload = useCallback(() => {
    loadFields(selectedResource);
  }, [loadFields, selectedResource]);

  // Navigate to dictionary values
  const handleViewValues = useCallback((record: DictionaryFieldRecord) => {
    if (!record || !record.id) {
      message.warning('请先保存字段');
      return;
    }

    navigate({
      pathname: '/governance/dictionary/values',
      search: `?fieldId=${record.id}&fieldName=${record.fieldName || record.dictName}&dictCode=${record.dictCode}`,
    });
  }, [navigate]);

  // Resource columns
  const resourceColumns: TableColumnsType<ResourceRecord> = useMemo(
    () => [
      {
        title: '资源名称',
        dataIndex: 'resourceNameCn',
        key: 'resourceNameCn',
        render: (text, record) => (
          <Space>
            <span>{text}</span>
            <Tag color="blue">{record.resourceCode}</Tag>
          </Space>
        ),
      },
    ],
    []
  );

  // Field columns
  const fieldColumns: TableColumnsType<DictionaryFieldRecord> = useMemo(
    () => [
      {
        title: '序号',
        key: 'index',
        width: 60,
        fixed: 'left',
        render: (_, __, index) => index + 1,
      },
      {
        title: '字段名称',
        dataIndex: 'fieldName',
        key: 'fieldName',
        width: 120,
      },
      {
        title: '字典名称',
        dataIndex: 'dictName',
        key: 'dictName',
        width: 120,
      },
      {
        title: '字典编码',
        dataIndex: 'dictCode',
        key: 'dictCode',
        width: 140,
        render: (value) => <code>{value}</code>,
      },
      {
        title: '字段类型',
        dataIndex: 'fieldType',
        key: 'fieldType',
        width: 100,
        align: 'center',
        render: (_, record) => {
          const { color, text } = getFieldTypeTag(record.fieldType);
          return <Tag color={color}>{text}</Tag>;
        },
      },
      {
        title: '长度',
        dataIndex: 'fieldLength',
        key: 'fieldLength',
        width: 80,
        align: 'center',
      },
      {
        title: '必填',
        dataIndex: 'required',
        key: 'required',
        width: 70,
        align: 'center',
        render: (value) => (value ? <Tag color="red">是</Tag> : <Tag>否</Tag>),
      },
      {
        title: '验证规则',
        dataIndex: 'validationRules',
        key: 'validationRules',
        width: 100,
        render: (value) => value || '-',
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
        width: 100,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewValues(record)}
            >
              详情
            </Button>
          </Space>
        ),
      },
    ],
    [handleViewValues]
  );

  return (
    <div className={styles.page}>
      <div className={styles.masterDetail}>
        {/* Resource List (Left Panel) */}
        <div className={styles.leftPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>资源列表</span>
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={handleResourceReload}
              loading={resourceLoading}
            />
          </div>
          <div className={styles.panelContent}>
            <Spin spinning={resourceLoading}>
              {resources.length > 0 ? (
                <div className={styles.resourceList}>
                  {resources.map((resource) => (
                    <div
                      key={resource.id}
                      className={`${styles.resourceItem} ${selectedResource?.id === resource.id ? styles.selected : ''}`}
                      onClick={() => handleResourceSelect(resource)}
                    >
                      <span className={styles.resourceName}>{resource.resourceNameCn}</span>
                      <Tag color="blue" className={styles.resourceCode}>
                        {resource.resourceCode}
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

        {/* Field List (Right Panel) */}
        <div className={styles.rightPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.rightHeaderLeft}>
              <span className={styles.panelTitle}>字典字段列表</span>
              {selectedResource && (
                <Tag color="processing">
                  {selectedResource.resourceNameCn}
                </Tag>
              )}
            </div>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleFieldReload} loading={fieldLoading}>
                刷新
              </Button>
            </Space>
          </div>
          <div className={styles.panelContent}>
            <AppTable
              ref={fieldTableRef}
              dataSource={fields}
              columns={fieldColumns}
              loading={fieldLoading}
              rowKey="id"
              pagination={{
                current: 1,
                pageSize: 10,
                total: fieldTotal,
              }}
              scroll={{ x: 1200 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

DictionaryFieldsPage.displayName = 'DictionaryFieldsPage';

export default DictionaryFieldsPage;
