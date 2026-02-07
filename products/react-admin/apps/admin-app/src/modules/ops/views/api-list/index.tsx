/**
 * API List Page - Ops Module
 * React Admin - Admin Application
 *
 * Displays API endpoints with controller grouping.
 *
 * Migrated from Vue3 (products/pc-admin/apps/admin-app/src/modules/ops/views/api-list/index.vue)
 * to React + TypeScript + Ant Design
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Tag, Empty, Spin, Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import {
  AppTable,
  Empty as SharedEmpty,
} from '@enterprise-workspace/frontend/shared';
import type { AppTableRef } from '@enterprise-workspace/frontend/shared/data-display/Table/types';
import type { TableColumnsType } from 'antd/es/table';
import styles from './index.module.css';

// ============================================================================
// Types
// ============================================================================

interface ApiControllerNode {
  id: string;
  label: string;
  name: string;
  className: string;
  simpleName: string;
  tags: string[];
  apis: ApiListRecord[];
}

interface ApiListRecord {
  controller: string;
  className: string;
  tags: string[];
  tagsText: string;
  methodName: string;
  httpMethods: string;
  paths: string;
  description: string;
  notes: string;
  parameters: Array<Record<string, unknown>>;
}

// ============================================================================
// Mock API Service (Replace with actual API)
// ============================================================================

const mockApiDocsService = {
  list: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock API documentation data
    const mockControllers = [
      {
        className: 'com.example.user.UserController',
        simpleName: 'UserController',
        tags: ['用户管理'],
        apis: [
          {
            methodName: 'list',
            httpMethods: 'GET',
            paths: '/api/v1/users',
            description: '获取用户列表',
            notes: '分页查询用户信息',
            parameters: [
              { name: 'page', type: 'integer', required: false },
              { name: 'size', type: 'integer', required: false },
            ],
          },
          {
            methodName: 'getById',
            httpMethods: 'GET',
            paths: '/api/v1/users/{id}',
            description: '根据ID获取用户',
            notes: '查询单个用户详细信息',
            parameters: [
              { name: 'id', type: 'string', required: true },
            ],
          },
          {
            methodName: 'create',
            httpMethods: 'POST',
            paths: '/api/v1/users',
            description: '创建用户',
            notes: '新增用户信息',
            parameters: [],
          },
          {
            methodName: 'update',
            httpMethods: 'PUT',
            paths: '/api/v1/users/{id}',
            description: '更新用户',
            notes: '更新用户信息',
            parameters: [
              { name: 'id', type: 'string', required: true },
            ],
          },
          {
            methodName: 'delete',
            httpMethods: 'DELETE',
            paths: '/api/v1/users/{id}',
            description: '删除用户',
            notes: '删除指定用户',
            parameters: [
              { name: 'id', type: 'string', required: true },
            ],
          },
        ],
      },
      {
        className: 'com.example.order.OrderController',
        simpleName: 'OrderController',
        tags: ['订单管理'],
        apis: [
          {
            methodName: 'list',
            httpMethods: 'GET',
            paths: '/api/v1/orders',
            description: '获取订单列表',
            notes: '分页查询订单',
            parameters: [
              { name: 'page', type: 'integer', required: false },
              { name: 'size', type: 'integer', required: false },
            ],
          },
          {
            methodName: 'getById',
            httpMethods: 'GET',
            paths: '/api/v1/orders/{id}',
            description: '根据ID获取订单',
            notes: '查询单个订单详情',
            parameters: [
              { name: 'id', type: 'string', required: true },
            ],
          },
          {
            methodName: 'create',
            httpMethods: 'POST',
            paths: '/api/v1/orders',
            description: '创建订单',
            notes: '新增订单',
            parameters: [],
          },
          {
            methodName: 'cancel',
            httpMethods: 'POST',
            paths: '/api/v1/orders/{id}/cancel',
            description: '取消订单',
            notes: '取消指定订单',
            parameters: [
              { name: 'id', type: 'string', required: true },
            ],
          },
        ],
      },
      {
        className: 'com.example.product.ProductController',
        simpleName: 'ProductController',
        tags: ['商品管理'],
        apis: [
          {
            methodName: 'list',
            httpMethods: 'GET',
            paths: '/api/v1/products',
            description: '获取商品列表',
            notes: '分页查询商品',
            parameters: [
              { name: 'categoryId', type: 'string', required: false },
            ],
          },
          {
            methodName: 'getById',
            httpMethods: 'GET',
            paths: '/api/v1/products/{id}',
            description: '根据ID获取商品',
            notes: '查询单个商品详情',
            parameters: [],
          },
          {
            methodName: 'create',
            httpMethods: 'POST',
            paths: '/api/v1/products',
            description: '创建商品',
            notes: '新增商品',
            parameters: [],
          },
          {
            methodName: 'update',
            httpMethods: 'PUT',
            paths: '/api/v1/products/{id}',
            description: '更新商品',
            notes: '更新商品信息',
            parameters: [],
          },
          {
            methodName: 'delete',
            httpMethods: 'DELETE',
            paths: '/api/v1/products/{id}',
            description: '删除商品',
            notes: '删除指定商品',
            parameters: [],
          },
        ],
      },
    ];

    return mockControllers;
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

const normalizeValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'string') {
    return value;
  }
  return value ? String(value) : '';
};

const buildControllers = (payload: Record<string, unknown> | unknown[]): ApiControllerNode[] => {
  const controllers = Array.isArray(payload) ? payload : Object.values(payload);

  return (controllers as unknown[]).map((controller: unknown) => {
    const ctrl = controller as Record<string, unknown>;
    const className = (ctrl.className as string) || '';
    const simpleName = (ctrl.simpleName as string) || className.split('.').pop() || className;
    const tags: string[] = Array.isArray(ctrl.tags) ? (ctrl.tags as string[]) : [];
    const tagsText = tags.length > 0 ? tags.join(' / ') : '';
    const apis = Array.isArray(ctrl.apis) ? (ctrl.apis as unknown[]) : [];

    const apiRecords: ApiListRecord[] = (apis as unknown[]).map((api: unknown) => {
      const apiData = api as Record<string, unknown>;
      const description = (apiData.description as Record<string, string>) || {};
      const summary = description.summary || '';
      const descriptionText = description.description || '';
      const fullDescription = summary && descriptionText
        ? `${summary}\n${descriptionText}`
        : (summary || descriptionText || '');

      const method = normalizeValue(apiData.httpMethods).toUpperCase();
      const paths = normalizeValue(apiData.paths);
      const parameters = Array.isArray(apiData.parameters) ? apiData.parameters : [];

      return {
        controller: simpleName,
        className: className || simpleName,
        tags,
        tagsText,
        methodName: (apiData.methodName as string) || '',
        httpMethods: method,
        paths,
        description: fullDescription,
        notes: descriptionText,
        parameters,
      };
    });

    return {
      id: className || simpleName,
      label: tagsText || simpleName,
      name: tagsText || simpleName,
      className: className || simpleName,
      simpleName,
      tags,
      apis: apiRecords,
    };
  });
};

const getMethodTagStyle = (method: string): { color: string; text: string } => {
  const methodMap: Record<string, { color: string; text: string }> = {
    GET: { color: 'success', text: 'GET' },
    POST: { color: 'processing', text: 'POST' },
    PUT: { color: 'warning', text: 'PUT' },
    DELETE: { color: 'error', text: 'DELETE' },
    PATCH: { color: 'default', text: 'PATCH' },
    OPTIONS: { color: 'default', text: 'OPTIONS' },
    HEAD: { color: 'default', text: 'HEAD' },
  };
  return methodMap[method] || { color: 'default', text: method };
};

// ============================================================================
// API List Page Component
// ============================================================================

export const ApiListPage: React.FC = () => {
  // State
  const [controllerList, setControllerList] = useState<ApiControllerNode[]>([]);
  const [filteredControllerList, setFilteredControllerList] = useState<ApiControllerNode[]>([]);
  const [selectedControllerId, setSelectedControllerId] = useState<string | null>(null);
  const [apiList, setApiList] = useState<ApiListRecord[]>([]);
  const [apiTotal, setApiTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [controllerLoading, setControllerLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  // Refs
  const tableRef = useRef<AppTableRef>(null);

  // Load controllers
  const loadControllers = useCallback(async () => {
    setControllerLoading(true);
    try {
      const response = await mockApiDocsService.list();
      const nodes = buildControllers(response);
      setControllerList(nodes);
      setFilteredControllerList(nodes);

      if (nodes.length > 0 && !selectedControllerId) {
        setSelectedControllerId(nodes[0].id);
      }
    } catch (error) {
      console.error('Failed to load controllers:', error);
    } finally {
      setControllerLoading(false);
    }
  }, [selectedControllerId]);

  // Load APIs for selected controller
  const loadApis = useCallback(async () => {
    if (!selectedControllerId) {
      setApiList([]);
      setApiTotal(0);
      return;
    }

    setLoading(true);
    try {
      const controller = controllerList.find((c) => c.id === selectedControllerId);
      if (controller) {
        const records = controller.apis;
        setApiList(records);
        setApiTotal(records.length);
      }
    } catch (error) {
      console.error('Failed to load APIs:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedControllerId, controllerList]);

  // Initial load
  useEffect(() => {
    loadControllers();
  }, [loadControllers]);

  // Load APIs when controller selection changes
  useEffect(() => {
    loadApis();
  }, [loadApis]);

  // Filter controllers by keyword
  useEffect(() => {
    if (!keyword.trim()) {
      setFilteredControllerList(controllerList);
      return;
    }

    const lowerKeyword = keyword.toLowerCase();
    const filtered = controllerList.filter((controller) =>
      controller.label.toLowerCase().includes(lowerKeyword) ||
      controller.className.toLowerCase().includes(lowerKeyword) ||
      controller.tags.some((tag) => tag.toLowerCase().includes(lowerKeyword))
    );
    setFilteredControllerList(filtered);
  }, [keyword, controllerList]);

  // Handle controller selection
  const handleSelectController = useCallback((controllerId: string) => {
    setSelectedControllerId(controllerId);
  }, []);

  // Handle keyword change
  const handleKeywordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  }, []);

  // API Table columns
  const apiColumns: TableColumnsType<ApiListRecord> = useMemo(
    () => [
      {
        title: 'Controller',
        dataIndex: 'controller',
        width: 150,
        align: 'center',
        render: (value) => <span style={{ fontWeight: 500 }}>{value}</span>,
      },
      {
        title: '方法',
        dataIndex: 'httpMethods',
        width: 100,
        align: 'center',
        render: (_, record) => {
          const { color, text } = getMethodTagStyle(record.httpMethods);
          return (
            <Tag color={color} className={styles.httpTag}>
              {text}
            </Tag>
          );
        },
      },
      {
        title: '路径',
        dataIndex: 'paths',
        minWidth: 200,
        render: (_, record) => (
          <code style={{ color: '#1677ff', fontSize: 13 }}>{record.paths}</code>
        ),
      },
      {
        title: '方法名',
        dataIndex: 'methodName',
        width: 150,
        align: 'center',
        render: (value) => <code>{value}</code>,
      },
      {
        title: '描述',
        dataIndex: 'description',
        minWidth: 200,
        ellipsis: true,
      },
      {
        title: '标签',
        dataIndex: 'tagsText',
        width: 120,
        align: 'center',
        render: (value) => value || '-',
      },
      {
        title: '备注',
        dataIndex: 'notes',
        width: 150,
        align: 'center',
        render: (value) => value || '-',
      },
    ],
    []
  );

  // Get selected controller
  const selectedController = useMemo(
    () => controllerList.find((c) => c.id === selectedControllerId),
    [controllerList, selectedControllerId]
  );

  return (
    <div className={styles.page}>
      <div className={styles.masterDetail}>
        {/* Left Panel - Controller List */}
        <div className={styles.leftPanel}>
          <div className={styles.leftPanelHeader}>
            <span className={styles.leftPanelTitle}>Controllers</span>
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>
              {filteredControllerList.length} 个
            </span>
          </div>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
            <Input
              placeholder="搜索 Controller..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={keyword}
              onChange={handleKeywordChange}
              allowClear
              size="small"
            />
          </div>
          <div className={styles.leftPanelContent}>
            <Spin spinning={controllerLoading}>
              {filteredControllerList.length > 0 ? (
                <div className={styles.controllerList}>
                  {filteredControllerList.map((controller) => (
                    <div
                      key={controller.id}
                      className={`${styles.controllerItem} ${
                        selectedControllerId === controller.id ? styles.controllerItemSelected : ''
                      }`}
                      onClick={() => handleSelectController(controller.id)}
                    >
                      <span className={styles.controllerName}>{controller.label}</span>
                      {controller.tags.length > 0 && (
                        <Tag className={styles.controllerTags} color="blue">
                          {controller.apis.length}
                        </Tag>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <SharedEmpty description="暂无数据" />
              )}
            </Spin>
          </div>
        </div>

        {/* Right Panel - API List */}
        <div className={styles.rightPanel}>
          <div className={styles.rightPanelHeader}>
            <div className={styles.rightPanelTitle}>
              <Space>
                <span>API 列表</span>
                {selectedController && (
                  <Tag color="blue">{selectedController.simpleName}</Tag>
                )}
              </Space>
            </div>
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>
              {apiTotal} 个接口
            </span>
          </div>
          <div className={styles.rightPanelContent}>
            <div className={styles.tableContainer}>
              {apiList.length > 0 ? (
                <AppTable
                  ref={tableRef}
                  dataSource={apiList}
                  columns={apiColumns}
                  loading={loading}
                  rowKey="methodName"
                  pagination={{
                    current: 1,
                    pageSize: 20,
                    total: apiTotal,
                  }}
                  scroll={{ x: 1200 }}
                  className={styles.apiTable}
                />
              ) : (
                <div className={styles.emptyContainer}>
                  <SharedEmpty description="请选择 Controller 查看接口" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ApiListPage.displayName = 'ApiListPage';

export default ApiListPage;
