/**
 * Strategy Monitor Page
 *
 * Main page for monitoring strategies with:
 * - Strategy list with status filter
 * - Strategy detail dialog
 * - Execution history dialog
 * - Alert configuration dialog
 *
 * Migrated from Vue3 (products/pc-admin/apps/admin-app/src/modules/strategy/views/monitor/index.vue)
 * to React + TypeScript + Ant Design
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  Table,
  Tag,
  Button,
  Select,
  Space,
  Modal,
  message,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  HistoryOutlined,
  BellOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button as AppButton,
  Pagination,
  Input,
  Card,
  Popconfirm,
} from '@enterprise-workspace/frontend/shared';
import type { AppTableRef } from '@enterprise-workspace/frontend/shared/data-display/Table/types';
import styles from './index.module.css';

// Sub-components
import { StrategyDetailPanel } from './components/StrategyDetailPanel';
import { StrategyExecutionHistory } from './components/StrategyExecutionHistory';
import { StrategyAlertConfig } from './components/StrategyAlertConfig';

// ============================================================================
// Types
// ============================================================================

/** 策略状态 */
export type StrategyStatus =
  | 'DRAFT'
  | 'TESTING'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ARCHIVED';

/** 策略类型 */
export type StrategyType =
  | 'PERMISSION'
  | 'BUSINESS'
  | 'DATA'
  | 'WORKFLOW';

/** 策略基础信息 */
export interface Strategy {
  id: string;
  name: string;
  description?: string;
  type: StrategyType;
  status: StrategyStatus;
  version: string;
  priority: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

/** 策略监控统计 */
export interface StrategyMonitorStats {
  strategyId: string;
  period: {
    start: string;
    end: string;
  };
  execution: {
    total: number;
    success: number;
    failed: number;
    avgDuration: number;
    maxDuration: number;
    minDuration: number;
  };
  effects: {
    allow: number;
    deny: number;
    conditional: number;
  };
  performance: {
    throughput: number;
    errorRate: number;
    p95Duration: number;
    p99Duration: number;
  };
}

/** 分页结果 */
export interface PaginatedResult<T> {
  list: T[];
  total: number;
}

// ============================================================================
// Mock Service (Replace with actual API)
// ============================================================================

const mockStrategyService = {
  list: async (
    params?: Record<string, unknown>
  ): Promise<PaginatedResult<Strategy>> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const { current = 1, pageSize = 10, keyword, status } = params || {};

    const allStrategies: Strategy[] = Array.from({ length: 50 }, (_, i) => ({
      id: `strategy-${i + 1}`,
      name: `策略 ${i + 1}`,
      description: `这是第 ${i + 1} 个策略的描述信息`,
      type: ['PERMISSION', 'BUSINESS', 'DATA', 'WORKFLOW'][
        i % 4
      ] as StrategyType,
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

  getStrategyStats: async (
    strategyId: string
  ): Promise<StrategyMonitorStats> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      strategyId,
      period: {
        start: new Date(Date.now() - 86400000).toISOString(),
        end: new Date().toISOString(),
      },
      execution: {
        total: 1000 + Math.floor(Math.random() * 5000),
        success: 900 + Math.floor(Math.random() * 400),
        failed: 10 + Math.floor(Math.random() * 50),
        avgDuration: 50 + Math.floor(Math.random() * 100),
        maxDuration: 200 + Math.floor(Math.random() * 300),
        minDuration: 10 + Math.floor(Math.random() * 20),
      },
      effects: {
        allow: 600 + Math.floor(Math.random() * 200),
        deny: 200 + Math.floor(Math.random() * 100),
        conditional: 100 + Math.floor(Math.random() * 50),
      },
      performance: {
        throughput: 50 + Math.random() * 100,
        errorRate: 0.01 + Math.random() * 0.05,
        p95Duration: 100 + Math.floor(Math.random() * 100),
        p99Duration: 200 + Math.floor(Math.random() * 200),
      },
    };
  },

  deleteStrategy: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Delete strategy:', id);
  },

  deleteStrategies: async (ids: string[]): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Delete strategies:', ids);
  },
};

// ============================================================================
// Translation Helper
// ============================================================================

const t = (key: string): string => {
  const translations: Record<string, string> = {
    'common.strategy.monitor.strategy_monitor': '策略监控',
    'common.strategy.monitor.strategy_list': '策略列表',
    'common.strategy.monitor.status_filter': '状态筛选',
    'common.strategy.monitor.status_all': '全部',
    'common.strategy.monitor.status_active': '激活',
    'common.strategy.monitor.status_inactive': '停用',
    'common.strategy.monitor.status_testing': '测试中',
    'common.strategy.monitor.search': '搜索策略',
    'common.strategy.monitor.view_detail': '查看详情',
    'common.strategy.monitor.execution_history': '执行历史',
    'common.strategy.monitor.alert_config': '告警配置',
    'common.strategy.monitor.strategy_name': '策略名称',
    'common.strategy.monitor.strategy_type': '策略类型',
    'common.strategy.monitor.status': '状态',
    'common.strategy.monitor.priority': '优先级',
    'common.strategy.monitor.version': '版本',
    'common.strategy.monitor.updated_at': '更新时间',
    'common.strategy.monitor.tags': '标签',
    'common.strategy.monitor.operation': '操作',
    'common.strategy.monitor.load_failed': '加载策略列表失败',
    'common.strategy.monitor.delete_success': '删除成功',
    'common.strategy.monitor.delete_failed': '删除失败',
    'common.strategy.monitor.alert_save_success': '告警保存成功',
    'common.button.confirm': '确认',
    'common.button.cancel': '取消',
    'crud.message.delete_confirm': '确定要删除该策略吗？',
    'crud.message.delete_success': '删除成功',
    'common.strategy.status.draft': '草稿',
    'common.strategy.status.testing': '测试中',
    'common.strategy.status.active': '已激活',
    'common.strategy.status.inactive': '已停用',
    'common.strategy.status.archived': '已归档',
  };
  return translations[key] || key;
};

// ============================================================================
// Helper Functions
// ============================================================================

const getStatusTagType = (
  status: StrategyStatus
): 'success' | 'error' | 'warning' | 'info' | 'default' => {
  const statusMap: Record<
    StrategyStatus,
    'success' | 'error' | 'warning' | 'info' | 'default'
  > = {
    DRAFT: 'info',
    TESTING: 'warning',
    ACTIVE: 'success',
    INACTIVE: 'error',
    ARCHIVED: 'default',
  };
  return statusMap[status] || 'default';
};

const getStatusLabel = (status: StrategyStatus): string => {
  const labelMap: Record<StrategyStatus, string> = {
    DRAFT: t('common.strategy.status.draft'),
    TESTING: t('common.strategy.status.testing'),
    ACTIVE: t('common.strategy.status.active'),
    INACTIVE: t('common.strategy.status.inactive'),
    ARCHIVED: t('common.strategy.status.archived'),
  };
  return labelMap[status] || status;
};

const getTypeLabel = (type: StrategyType): string => {
  const labelMap: Record<StrategyType, string> = {
    PERMISSION: '权限策略',
    BUSINESS: '业务策略',
    DATA: '数据策略',
    WORKFLOW: '工作流策略',
  };
  return labelMap[type] || type;
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

// ============================================================================
// Main Component
// ============================================================================

export const StrategyMonitor: React.FC = () => {
  // Table ref
  const tableRef = useRef<AppTableRef>(null);

  // State
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Strategy[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<StrategyStatus | ''>('');

  // Dialog state
  const [detailVisible, setDetailVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [alertsVisible, setAlertsVisible] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(
    null
  );
  const [selectedStats, setSelectedStats] = useState<StrategyMonitorStats | null>(
    null
  );

  // Service
  const strategyService = mockStrategyService;

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await strategyService.list({
        current,
        pageSize,
        keyword: searchKeyword || undefined,
        status: statusFilter || undefined,
      });
      setDataSource(response.list);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load strategies:', error);
      message.error(t('common.strategy.monitor.load_failed'));
    } finally {
      setLoading(false);
    }
  }, [current, pageSize, searchKeyword, statusFilter, strategyService]);

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

  // View strategy detail
  const handleViewDetail = useCallback(
    async (strategy: Strategy) => {
      setSelectedStrategy(strategy);
      try {
        const stats = await strategyService.getStrategyStats(strategy.id);
        setSelectedStats(stats);
      } catch (error) {
        console.error('Failed to load strategy stats:', error);
      }
      setDetailVisible(true);
    },
    [strategyService]
  );

  // View execution history
  const handleViewHistory = useCallback((strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setHistoryVisible(true);
  }, []);

  // Configure alerts
  const handleConfigureAlerts = useCallback((strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setAlertsVisible(true);
  }, []);

  // Delete strategy
  const handleDelete = useCallback(
    async (strategy: Strategy) => {
      try {
        await Modal.confirm({
          title: t('common.button.confirm'),
          content: t('crud.message.delete_confirm'),
          okText: t('common.button.confirm'),
          cancelText: t('common.button.cancel'),
        });

        await strategyService.deleteStrategy(strategy.id);
        message.success(t('crud.message.delete_success'));
        loadData();
      } catch (error) {
        console.error('Delete failed:', error);
        message.error(t('common.strategy.monitor.delete_failed'));
      }
    },
    [strategyService, loadData]
  );

  // Status options
  const statusOptions = useMemo(
    () => [
      { value: '', label: t('common.strategy.monitor.status_all') },
      { value: 'ACTIVE', label: t('common.strategy.monitor.status_active') },
      { value: 'INACTIVE', label: t('common.strategy.monitor.status_inactive') },
      { value: 'TESTING', label: t('common.strategy.monitor.status_testing') },
    ],
    []
  );

  // Table columns
  const columns = useMemo(
    () => [
      {
        title: t('common.strategy.monitor.strategy_name'),
        dataIndex: 'name',
        key: 'name',
        width: 150,
        render: (name: string) => (
          <Typography.Link>{name}</Typography.Link>
        ),
      },
      {
        title: t('common.strategy.monitor.strategy_type'),
        dataIndex: 'type',
        key: 'type',
        width: 120,
        render: (type: StrategyType) => (
          <Tag color="blue">{getTypeLabel(type)}</Tag>
        ),
      },
      {
        title: t('common.strategy.monitor.status'),
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: StrategyStatus) => (
          <Tag color={getStatusTagType(status)}>
            {getStatusLabel(status)}
          </Tag>
        ),
      },
      {
        title: t('common.strategy.monitor.priority'),
        dataIndex: 'priority',
        key: 'priority',
        width: 80,
        align: 'center' as const,
      },
      {
        title: t('common.strategy.monitor.version'),
        dataIndex: 'version',
        key: 'version',
        width: 100,
      },
      {
        title: t('common.strategy.monitor.tags'),
        dataIndex: 'tags',
        key: 'tags',
        width: 150,
        render: (tags: string[]) => (
          <Space wrap size={4}>
            {tags.slice(0, 3).map((tag) => (
              <Tag key={tag} size="small" variant="plain">
                {tag}
              </Tag>
            ))}
            {tags.length > 3 && <Tag size="small">+{tags.length - 3}</Tag>}
          </Space>
        ),
      },
      {
        title: t('common.strategy.monitor.updated_at'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 180,
        render: (date: string) => formatDate(date),
      },
      {
        title: t('common.strategy.monitor.operation'),
        key: 'action',
        width: 280,
        fixed: 'right' as const,
        render: (_: unknown, record: Strategy) => (
          <Space size="small">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            >
              {t('common.strategy.monitor.view_detail')}
            </Button>
            <Button
              type="link"
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistory(record)}
            >
              {t('common.strategy.monitor.execution_history')}
            </Button>
            <Button
              type="link"
              size="small"
              icon={<BellOutlined />}
              onClick={() => handleConfigureAlerts(record)}
            >
              {t('common.strategy.monitor.alert_config')}
            </Button>
            <Popconfirm
              title={t('common.button.confirm')}
              description={t('crud.message.delete_confirm')}
              onConfirm={() => handleDelete(record)}
              okText={t('common.button.confirm')}
              cancelText={t('common.button.cancel')}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleViewDetail, handleViewHistory, handleConfigureAlerts, handleDelete]
  );

  return (
    <div className={styles.monitor}>
      <div className={styles.monitorContent}>
        {/* Toolbar */}
        <div className={styles.tableToolbar}>
          <div className={styles.toolbarLeft}>
            <AppButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                console.log('Add strategy');
              }}
            >
              新增策略
            </AppButton>
            <AppButton
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              刷新
            </AppButton>
          </div>

          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            options={statusOptions}
            className={styles.statusSelect}
            placeholder={t('common.strategy.monitor.status_filter')}
            allowClear
          />

          <AppSpace style={{ flex: 1 }} />

          <Input.Search
            className={styles.searchInput}
            placeholder={t('common.strategy.monitor.search')}
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={handleSearch}
            allowClear
          />
        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          <Table
            dataSource={dataSource}
            columns={columns}
            loading={loading}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1400 }}
          />
        </div>

        {/* Pagination */}
        <div className={styles.paginationWrapper}>
          <Pagination
            current={current}
            pageSize={pageSize}
            total={total}
            onChange={handlePaginationChange}
            showSizeChanger
            showTotal={(total) => `共 ${total} 条`}
          />
        </div>
      </div>

      {/* Strategy Detail Dialog */}
      <Modal
        title={t('common.strategy.monitor.view_detail')}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={1200}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      >
        {selectedStrategy && (
          <StrategyDetailPanel
            strategy={selectedStrategy}
            stats={selectedStats}
          />
        )}
      </Modal>

      {/* Execution History Dialog */}
      <Modal
        title={t('common.strategy.monitor.execution_history')}
        open={historyVisible}
        onCancel={() => setHistoryVisible(false)}
        footer={null}
        width={1400}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      >
        {selectedStrategy && (
          <StrategyExecutionHistory
            strategyId={selectedStrategy.id}
          />
        )}
      </Modal>

      {/* Alert Config Dialog */}
      <Modal
        title={t('common.strategy.monitor.alert_config')}
        open={alertsVisible}
        onCancel={() => setAlertsVisible(false)}
        footer={null}
        width={900}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      >
        {selectedStrategy && (
          <StrategyAlertConfig strategy={selectedStrategy} />
        )}
      </Modal>
    </div>
  );
};

StrategyMonitor.displayName = 'StrategyMonitor';

export default StrategyMonitor;
