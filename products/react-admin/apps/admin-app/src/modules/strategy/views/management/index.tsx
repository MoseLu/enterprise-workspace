/**
 * Strategy Management Page
 *
 * Strategy CRUD management page with:
 * - Strategy list with status filter
 * - Version history dialog
 * - Strategy test dialog with execution result
 * - Clone strategy functionality
 * - Export strategy functionality
 * - Custom table columns for tags, version links
 * - Action buttons: edit, delete, test, clone, export
 *
 * Migrated from Vue3 (products/pc-admin/apps/admin-app/src/modules/strategy/views/management/index.vue)
 * to React + TypeScript + Ant Design
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Button,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Table,
  Typography,
  Divider,
  Timeline,
  Collapse,
  Popover,
  message,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  CloudDownloadOutlined,
  CopyOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { Form as AntForm } from 'antd';
import {
  AppTable,
  Tag as AppTag,
  Modal as AppModal,
  Form as AppForm,
  Pagination,
  Space as AppSpace,
  Typography as AppTypography,
  Divider as AppDivider,
  Timeline as AppTimeline,
  Collapse as AppCollapse,
} from '@enterprise-workspace/frontend/shared';
import type { AppTableRef } from '@enterprise-workspace/frontend/shared/data-display/Table/types';
import styles from './index.module.css';

// ============================================================================
// Types
// ============================================================================

/** 策略状态 */
type StrategyStatus =
  | 'DRAFT'
  | 'TESTING'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ARCHIVED';

/** 策略效果 */
type StrategyEffect = 'ALLOW' | 'DENY' | 'CONDITIONAL';

/** 策略基础信息 */
interface Strategy {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: StrategyStatus;
  version: string;
  priority: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

/** 策略执行上下文 */
interface StrategyExecutionContext {
  strategyId: string;
  executionId: string;
  input: Record<string, unknown>;
  variables: Record<string, unknown>;
  environment: {
    timestamp: number;
    source: string;
  };
}

/** 策略执行结果 */
interface StrategyExecutionResult {
  executionId: string;
  strategyId: string;
  effect: StrategyEffect;
  success: boolean;
  output: Record<string, unknown>;
  executionTime: number;
  steps: {
    nodeId: string;
    nodeName: string;
    executed: boolean;
    result?: unknown;
    error?: string;
    duration: number;
  }[];
}

/** 版本历史项 */
interface VersionHistoryItem {
  version: string;
  status: StrategyStatus;
  updatedAt: string;
  updatedBy: string;
}

// ============================================================================
// Mock Services (Replace with actual API)
// ============================================================================

const mockStrategyService = {
  list: async (params?: Record<string, unknown>) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const { current = 1, pageSize = 10, keyword, status } = params || {};

    const allStrategies: Strategy[] = Array.from({ length: 50 }, (_, i) => ({
      id: `strategy-${i + 1}`,
      name: `策略 ${i + 1}`,
      description: `这是第 ${i + 1} 个策略的描述信息`,
      type: ['PERMISSION', 'BUSINESS', 'DATA', 'WORKFLOW'][i % 4],
      status: ['DRAFT', 'TESTING', 'ACTIVE', 'INACTIVE', 'ARCHIVED'][
        i % 5
      ] as StrategyStatus,
      version: `1.${i}.0`,
      priority: i + 1,
      tags: ['标签A', '标签B', '标签C', '标签D', '标签E'].slice(0, (i % 5) + 1),
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - i * 43200000).toISOString(),
      createdBy: `user${(i % 10) + 1}`,
      updatedBy: `user${(i % 10) + 1}`,
    }));

    // Filter by keyword
    let filtered = keyword
      ? allStrategies.filter(
          (s) =>
            s.name.includes(keyword as string) ||
            s.description?.includes(keyword as string)
        )
      : allStrategies;

    // Filter by status
    if (status) {
      filtered = filtered.filter((s) => s.status === status);
    }

    const start = ((current as number) - 1) * (pageSize as number);
    const end = start + (pageSize as number);

    return {
      list: filtered.slice(start, end),
      total: filtered.length,
    };
  },

  info: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      id,
      name: `策略 ${id}`,
      description: '策略描述',
      type: 'PERMISSION',
      status: 'ACTIVE',
      version: '1.0.0',
      priority: 1,
      tags: ['标签A', '标签B'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user1',
      updatedBy: 'user1',
    };
  },

  add: async (data: Strategy) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id: `strategy-${Date.now()}` };
  },

  update: async (id: string, data: Strategy) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id };
  },

  delete: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Deleted strategy:', id);
  },

  deleteMany: async (ids: string[]) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Deleted strategies:', ids);
  },

  getStrategyVersions: async (strategyId: string): Promise<VersionHistoryItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      {
        version: '1.2.0',
        status: 'ACTIVE',
        updatedAt: new Date().toISOString(),
        updatedBy: 'user1',
      },
      {
        version: '1.1.0',
        status: 'ARCHIVED',
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        updatedBy: 'user1',
      },
      {
        version: '1.0.0',
        status: 'ARCHIVED',
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        updatedBy: 'user1',
      },
    ];
  },

  activateStrategyVersion: async (strategyId: string, version: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Activated version:', strategyId, version);
  },

  testStrategy: async (
    strategyId: string,
    context: StrategyExecutionContext
  ): Promise<StrategyExecutionResult> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      executionId: context.executionId,
      strategyId,
      effect: 'ALLOW',
      success: true,
      output: { result: 'allowed' },
      executionTime: 150,
      steps: [
        {
          nodeId: 'node-1',
          nodeName: '开始节点',
          executed: true,
          result: { status: 'ok' },
          duration: 10,
        },
        {
          nodeId: 'node-2',
          nodeName: '条件判断',
          executed: true,
          result: { condition: true },
          duration: 30,
        },
        {
          nodeId: 'node-3',
          nodeName: '动作执行',
          executed: true,
          result: { action: 'permit' },
          duration: 80,
        },
        {
          nodeId: 'node-4',
          nodeName: '结束节点',
          executed: true,
          result: { final: true },
          duration: 20,
        },
      ],
    };
  },

  createStrategy: async (data: Strategy) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id: `strategy-${Date.now()}` };
  },

  exportStrategy: async (strategyId: string): Promise<Blob> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const data = { id: strategyId, exported: true, timestamp: Date.now() };
    return new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

const getStatusTagType = (status: StrategyStatus): 'success' | 'error' | 'warning' | 'info' | 'default' => {
  const statusMap: Record<StrategyStatus, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
    DRAFT: 'info',
    TESTING: 'warning',
    ACTIVE: 'success',
    INACTIVE: 'error',
    ARCHIVED: 'default',
  };
  return statusMap[status] || 'default';
};

const getStatusLabel = (status: StrategyStatus, t: (key: string) => string): string => {
  const labelMap: Record<StrategyStatus, string> = {
    DRAFT: t('common.strategy.management.status.draft'),
    TESTING: t('common.strategy.management.status.testing'),
    ACTIVE: t('common.strategy.management.status.active'),
    INACTIVE: t('common.strategy.management.status.inactive'),
    ARCHIVED: t('common.strategy.management.status.archived'),
  };
  return labelMap[status] || status;
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

// ============================================================================
// Strategy Management Page Component
// ============================================================================

export const StrategyManagement: React.FC = () => {
  // i18n placeholder - in real app, use useTranslation hook
  const t = useCallback((key: string) => {
    const translations: Record<string, string> = {
      'common.strategy.management.status_filter': '状态筛选',
      'common.strategy.management.version_history': '版本历史',
      'common.strategy.management.version': '版本',
      'common.strategy.management.status': '状态',
      'common.strategy.management.updated_at': '更新时间',
      'common.strategy.management.updated_by': '更新人',
      'common.strategy.management.activate': '激活',
      'common.strategy.management.compare': '对比',
      'common.strategy.management.test': '策略测试',
      'common.strategy.management.test_context': '测试上下文',
      'common.strategy.management.test_context_placeholder': '请输入JSON格式的测试上下文',
      'common.strategy.management.test_result': '测试结果',
      'common.strategy.management.execution_result': '执行结果',
      'common.strategy.management.success': '成功',
      'common.strategy.management.failed': '失败',
      'common.strategy.management.strategy_effect': '策略效果',
      'common.strategy.management.execution_time': '执行时间',
      'common.strategy.management.execution_steps': '执行步骤数',
      'common.strategy.management.execution_steps_detail': '执行步骤详情',
      'common.strategy.management.result': '结果',
      'common.strategy.management.error': '错误',
      'common.button.close': '关闭',
      'common.strategy.management.execute_test': '执行测试',
      'common.strategy.management.get_version_history_failed': '获取版本历史失败',
      'common.strategy.management.version_activate_success': '版本激活成功',
      'common.strategy.management.version_activate_failed': '版本激活失败',
      'common.strategy.management.version_compare_coming_soon': '版本对比功能即将推出',
      'common.strategy.management.test_complete': '测试完成',
      'common.strategy.management.test_failed': '测试失败',
      'common.strategy.management.copy_suffix': '副本',
      'common.strategy.management.clone_success': '克隆成功',
      'common.strategy.management.clone_failed': '克隆失败',
      'common.strategy.management.export_success': '导出成功',
      'common.strategy.management.export_failed': '导出失败',
      'common.button.confirm': '确认',
      'crud.message.delete_confirm': '确定要删除该策略吗？',
      'crud.message.delete_success': '删除成功',
      'crud.table.operation': '操作',
      'common.description': '描述',
      'common.strategy.management.status.draft': '草稿',
      'common.strategy.management.status.testing': '测试中',
      'common.strategy.management.status.active': '已激活',
      'common.strategy.management.status.inactive': '已停用',
      'common.strategy.management.status.archived': '已归档',
      'common.strategy.management.status.inactive_default': '停用',
      'common.strategy.management.status.archived_default': '归档',
    };
    return translations[key] || key;
  }, []);

  // Service
  const strategyService = mockStrategyService;

  // Refs
  const tableRef = useRef<AppTableRef>(null);

  // State
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Strategy[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchKey, setSearchKey] = useState('keyword');
  const [statusFilter, setStatusFilter] = useState<StrategyStatus | ''>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [testingStrategies, setTestingStrategies] = useState<Set<string>>(new Set());

  // Dialog state
  const [versionDialogVisible, setVersionDialogVisible] = useState(false);
  const [testDialogVisible, setTestDialogVisible] = useState(false);
  const [versionHistory, setVersionHistory] = useState<VersionHistoryItem[]>([]);
  const [testResult, setTestResult] = useState<StrategyExecutionResult | null>(
    null
  );
  const [currentTestStrategy, setCurrentTestStrategy] = useState<Strategy | null>(
    null
  );
  const [testing, setTesting] = useState(false);

  // Form
  const [testForm] = Form.useForm();

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await strategyService.list({
        current,
        pageSize,
        [searchKey]: searchKeyword || undefined,
        status: statusFilter || undefined,
      });
      setDataSource(response.list);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load strategies:', error);
      message.error('获取策略列表失败');
    } finally {
      setLoading(false);
    }
  }, [current, pageSize, searchKeyword, searchKey, statusFilter, strategyService]);

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
  const handleSearch = useCallback(
    (value: string) => {
      setSearchKeyword(value);
      setCurrent(1);
      loadData();
    },
    [loadData]
  );

  // Status filter change
  const handleStatusFilterChange = useCallback(
    (value: StrategyStatus | '') => {
      setStatusFilter(value);
      setCurrent(1);
      loadData();
    },
    [loadData]
  );

  // Pagination change
  const handlePaginationChange = useCallback(
    (page: number, size: number) => {
      setCurrent(page);
      setPageSize(size);
      loadData();
    },
    [loadData]
  );

  // Selection change
  const handleSelectionChange = useCallback((keys: string[]) => {
    setSelectedRowKeys(keys);
  }, []);

  // Show version history
  const showVersionHistory = useCallback(
    async (strategy: Strategy) => {
      try {
        const history = await strategyService.getStrategyVersions(strategy.id);
        setVersionHistory(history);
        setVersionDialogVisible(true);
      } catch (error) {
        console.error('Failed to get version history:', error);
        message.error(t('common.strategy.management.get_version_history_failed'));
      }
    },
    [strategyService, t]
  );

  // Activate version
  const handleActivateVersion = useCallback(
    async (version: VersionHistoryItem) => {
      try {
        await strategyService.activateStrategyVersion(
          currentTestStrategy?.id || '',
          version.version
        );
        message.success(t('common.strategy.management.version_activate_success'));
        setVersionDialogVisible(false);
        loadData();
      } catch (error) {
        console.error('Failed to activate version:', error);
        message.error(t('common.strategy.management.version_activate_failed'));
      }
    },
    [currentTestStrategy, strategyService, t, loadData]
  );

  // Compare version
  const handleCompareVersion = useCallback(
    (version: VersionHistoryItem) => {
      message.info(t('common.strategy.management.version_compare_coming_soon'));
    },
    [t]
  );

  // Test strategy
  const handleTestStrategy = useCallback((strategy: Strategy) => {
    setCurrentTestStrategy(strategy);
    setTestResult(null);
    testForm.setFieldsValue({
      context: JSON.stringify(
        {
          user: {
            id: '123',
            roles: ['user'],
            permissions: ['read'],
          },
          resource: {
            type: 'document',
            id: 'doc-001',
          },
        },
        null,
        2
      ),
    });
    setTestDialogVisible(true);
  }, [testForm]);

  // Run test
  const handleRunTest = useCallback(async () => {
    if (!currentTestStrategy) return;

    try {
      const values = await testForm.validateFields();
      setTesting(true);
      setTestingStrategies((prev) => new Set(prev).add(currentTestStrategy.id));

      const context: StrategyExecutionContext = {
        strategyId: currentTestStrategy.id,
        executionId: Date.now().toString(),
        input: JSON.parse(values.context),
        variables: {},
        environment: {
          timestamp: Date.now(),
          source: 'test',
        },
      };

      const result = await strategyService.testStrategy(
        currentTestStrategy.id,
        context
      );
      setTestResult(result);
      message.success(t('common.strategy.management.test_complete'));
    } catch (error) {
      console.error('Test failed:', error);
      message.error(t('common.strategy.management.test_failed'));
    } finally {
      setTesting(false);
      setTestingStrategies((prev) => {
        const next = new Set(prev);
        next.delete(currentTestStrategy?.id || '');
        return next;
      });
    }
  }, [currentTestStrategy, testForm, strategyService, t]);

  // Clone strategy
  const handleCloneStrategy = useCallback(
    async (strategy: Strategy) => {
      try {
        await strategyService.createStrategy({
          ...strategy,
          name: `${strategy.name} ${t('common.strategy.management.copy_suffix')}`,
          status: 'DRAFT' as StrategyStatus,
          version: '1.0.0',
        });
        message.success(t('common.strategy.management.clone_success'));
        loadData();
      } catch (error) {
        console.error('Clone failed:', error);
        message.error(t('common.strategy.management.clone_failed'));
      }
    },
    [strategyService, t, loadData]
  );

  // Export strategy
  const handleExportStrategy = useCallback(
    async (strategy: Strategy) => {
      try {
        const blob = await strategyService.exportStrategy(strategy.id);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `strategy-${strategy.name}-${strategy.version}.json`;
        a.click();
        URL.revokeObjectURL(url);
        message.success(t('common.strategy.management.export_success'));
      } catch (error) {
        console.error('Export failed:', error);
        message.error(t('common.strategy.management.export_failed'));
      }
    },
    [strategyService, t]
  );

  // Delete strategy
  const handleDeleteStrategy = useCallback(
    async (strategy: Strategy) => {
      try {
        await Modal.confirm({
          title: t('common.button.confirm'),
          content: t('crud.message.delete_confirm'),
          okText: t('common.button.confirm'),
          cancelText: '取消',
          onOk: async () => {
            await strategyService.delete(strategy.id);
            message.success(t('crud.message.delete_success'));
            loadData();
          },
        });
      } catch (error) {
        console.error('Delete failed:', error);
      }
    },
    [strategyService, t, loadData]
  );

  // Multi delete
  const handleMultiDelete = useCallback(async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的策略');
      return;
    }

    try {
      await Modal.confirm({
        title: '确认删除',
        content: `确定要删除选中的 ${selectedRowKeys.length} 个策略吗？`,
        onOk: async () => {
          await strategyService.deleteMany(selectedRowKeys);
          message.success(t('crud.message.delete_success'));
          setSelectedRowKeys([]);
          loadData();
        },
      });
    } catch (error) {
      console.error('Multi delete failed:', error);
    }
  }, [selectedRowKeys, strategyService, t, loadData]);

  // Table columns
  const columns: TableColumnsType<Strategy> = useMemo(
    () => [
      {
        title: '序号',
        key: 'index',
        width: 60,
        fixed: 'left',
        render: (_, __, index) => (current - 1) * pageSize + index + 1,
      },
      {
        title: '策略名称',
        dataIndex: 'name',
        key: 'name',
        width: 150,
        fixed: 'left',
      },
      {
        title: '版本',
        key: 'version',
        width: 100,
        render: (_, record) => (
          <Typography.Link
            onClick={() => showVersionHistory(record)}
          >
            {record.version}
          </Typography.Link>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (_, record) => (
          <Tag color={getStatusTagType(record.status)}>
            {getStatusLabel(record.status, t)}
          </Tag>
        ),
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        width: 120,
        render: (type) => {
          const typeMap: Record<string, { color: string; text: string }> = {
            PERMISSION: { color: 'blue', text: '权限策略' },
            BUSINESS: { color: 'green', text: '业务策略' },
            DATA: { color: 'orange', text: '数据策略' },
            WORKFLOW: { color: 'purple', text: '工作流策略' },
          };
          const config = typeMap[type] || { color: 'default', text: type };
          return <Tag color={config.color}>{config.text}</Tag>;
        },
      },
      {
        title: '标签',
        key: 'tags',
        width: 180,
        render: (_, record) => (
          <div className={styles.strategyTags}>
            {record.tags.slice(0, 2).map((tag) => (
              <Tag key={tag} size="small" variant="plain">
                {tag}
              </Tag>
            ))}
            {record.tags.length > 2 && (
              <Popover
                content={record.tags.slice(2).join(', ')}
                trigger="hover"
              >
                <Tag size="small" color="default">
                  +{record.tags.length - 2}
                </Tag>
              </Popover>
            )}
          </div>
        ),
      },
      {
        title: '优先级',
        dataIndex: 'priority',
        key: 'priority',
        width: 80,
        align: 'center',
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 180,
        render: (_, record) => formatDate(record.updatedAt),
      },
      {
        title: '操作',
        key: 'action',
        width: 280,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                // Edit handler - in real app, open edit modal
                console.log('Edit:', record);
              }}
            >
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteStrategy(record)}
            >
              删除
            </Button>
            <Button
              type="link"
              size="small"
              icon={<ExperimentOutlined />}
              loading={testingStrategies.has(record.id)}
              onClick={() => handleTestStrategy(record)}
            >
              测试
            </Button>
            <Button
              type="link"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCloneStrategy(record)}
            >
              克隆
            </Button>
            <Button
              type="link"
              size="small"
              icon={<CloudDownloadOutlined />}
              onClick={() => handleExportStrategy(record)}
            >
              导出
            </Button>
          </Space>
        ),
      },
    ],
    [
      current,
      pageSize,
      t,
      showVersionHistory,
      testingStrategies,
      handleTestStrategy,
      handleCloneStrategy,
      handleExportStrategy,
      handleDeleteStrategy,
    ]
  );

  // Version history columns
  const versionColumns: TableColumnsType<VersionHistoryItem> = useMemo(
    () => [
      {
        title: t('common.strategy.management.version'),
        dataIndex: 'version',
        key: 'version',
        width: 100,
      },
      {
        title: t('common.strategy.management.status'),
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (_, record) => (
          <Tag color={getStatusTagType(record.status)}>
            {getStatusLabel(record.status, t)}
          </Tag>
        ),
      },
      {
        title: t('common.strategy.management.updated_at'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 180,
        render: (_, record) => formatDate(record.updatedAt),
      },
      {
        title: t('common.strategy.management.updated_by'),
        dataIndex: 'updatedBy',
        key: 'updatedBy',
        width: 120,
      },
      {
        title: t('crud.table.operation'),
        key: 'action',
        width: 200,
        render: (_, record) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setCurrentTestStrategy((prev) =>
                  prev ? { ...prev, version: record.version } : null
                );
                handleActivateVersion(record);
              }}
            >
              {t('common.strategy.management.activate')}
            </Button>
            <Button
              size="small"
              onClick={() => handleCompareVersion(record)}
            >
              {t('common.strategy.management.compare')}
            </Button>
          </Space>
        ),
      },
    ],
    [t, handleActivateVersion, handleCompareVersion]
  );

  // Status options
  const statusOptions = useMemo(
    () => [
      { value: '', label: '全部' },
      { value: 'DRAFT', label: t('common.strategy.management.status.draft') },
      { value: 'TESTING', label: t('common.strategy.management.status.testing') },
      { value: 'ACTIVE', label: t('common.strategy.management.status.active') },
      { value: 'INACTIVE', label: t('common.strategy.management.status.inactive') },
      { value: 'ARCHIVED', label: t('common.strategy.management.status.archived') },
    ],
    [t]
  );

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              // Add handler - in real app, open add modal
              console.log('Add strategy');
            }}
          >
            新增策略
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            刷新
          </Button>
          {selectedRowKeys.length > 0 && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleMultiDelete}
            >
              批量删除 ({selectedRowKeys.length})
            </Button>
          )}
        </div>

        <Select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          options={statusOptions}
          style={{ width: 140, marginLeft: 8 }}
          placeholder="状态筛选"
          allowClear
        />

        <AppSpace style={{ flex: 1 }} />

        <Space.Compact>
          <Select
            value={searchKey}
            onChange={setSearchKey}
            options={[
              { value: 'name', label: '名称' },
              { value: 'keyword', label: '关键词' },
              { value: 'code', label: '编码' },
            ]}
            style={{ width: 100 }}
          />
          <Input
            placeholder="搜索策略..."
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={() => handleSearch(searchKeyword)}
            style={{ width: 240 }}
            allowClear
          />
        </Space.Compact>
      </div>

      <div className={styles.tableContainer}>
        <Table
          ref={tableRef as React.RefObject<HTMLDivElement>}
          dataSource={dataSource}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{
            current,
            pageSize,
            total,
            onChange: handlePaginationChange,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 1400 }}
          rowSelection={
            selectedRowKeys.length > 0
              ? {
                  selectedRowKeys,
                  onChange: handleSelectionChange,
                }
              : undefined
          }
        />
      </div>

      {/* Version History Dialog */}
      <Modal
        title={t('common.strategy.management.version_history')}
        open={versionDialogVisible}
        onCancel={() => setVersionDialogVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          dataSource={versionHistory}
          columns={versionColumns}
          rowKey="version"
          pagination={false}
        />
      </Modal>

      {/* Test Strategy Dialog */}
      <Modal
        title={t('common.strategy.management.test')}
        open={testDialogVisible}
        onCancel={() => setTestDialogVisible(false)}
        footer={null}
        width={800}
      >
        <div className={styles.testForm}>
          <Form form={testForm} layout="vertical">
            <Form.Item
              name="context"
              label={t('common.strategy.management.test_context')}
            >
              <Input.TextArea
                rows={8}
                placeholder={t(
                  'common.strategy.management.test_context_placeholder'
                )}
              />
            </Form.Item>
          </Form>
        </div>

        {testResult && (
          <div className={styles.testResult}>
            <AppDivider>{t('common.strategy.management.test_result')}</AppDivider>

            <div className={styles.resultDescriptions}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>
                  {t('common.strategy.management.execution_result')}
                </span>
                <Tag color={testResult.success ? 'success' : 'error'}>
                  {testResult.success
                    ? t('common.strategy.management.success')
                    : t('common.strategy.management.failed')}
                </Tag>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>
                  {t('common.strategy.management.strategy_effect')}
                </span>
                <Tag color={testResult.effect === 'ALLOW' ? 'success' : 'error'}>
                  {testResult.effect}
                </Tag>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>
                  {t('common.strategy.management.execution_time')}
                </span>
                <span>{testResult.executionTime}ms</span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>
                  {t('common.strategy.management.execution_steps')}
                </span>
                <span>{testResult.steps?.length || 0}</span>
              </div>
            </div>

            {testResult.steps && testResult.steps.length > 0 && (
              <Collapse
                defaultActiveKey={['steps']}
                style={{ marginTop: 16 }}
                items={[
                  {
                    key: 'steps',
                    label: t('common.strategy.management.execution_steps_detail'),
                    children: (
                      <Timeline
                        mode="left"
                        items={testResult.steps.map((step) => ({
                          color: step.executed ? 'green' : 'gray',
                          children: (
                            <div className={styles.stepInfo}>
                              <div className={styles.stepName}>{step.nodeName}</div>
                              <div className={styles.stepDuration}>
                                {step.duration}ms
                              </div>
                              {step.result && (
                                <div className={styles.stepResult}>
                                  {t('common.strategy.management.result')}:{' '}
                                  {JSON.stringify(step.result)}
                                </div>
                              )}
                              {step.error && (
                                <div className={styles.stepError}>
                                  {t('common.strategy.management.error')}:{' '}
                                  {step.error}
                                </div>
                              )}
                            </div>
                          ),
                        }))}
                      />
                    ),
                  },
                ]}
              />
            )}
          </div>
        )}

        <div className={styles.dialogFooter}>
          <Space>
            <Button onClick={() => setTestDialogVisible(false)}>
              {t('common.button.close')}
            </Button>
            <Button
              type="primary"
              onClick={handleRunTest}
              loading={testing}
              icon={<ExperimentOutlined />}
            >
              {t('common.strategy.management.execute_test')}
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

StrategyManagement.displayName = 'StrategyManagement';

export default StrategyManagement;
