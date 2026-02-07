/**
 * Strategy Execution History Component
 *
 * Displays execution history for a strategy with:
 * - Filterable table of execution records
 * - Execution detail dialog
 * - Timeline view of execution steps
 * - Pagination support
 *
 * Migrated from Vue3 to React + TypeScript
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Table,
  Tag,
  Button,
  Select,
  Space,
  Modal,
  Popover,
  Timeline,
  Card,
  message,
  Typography,
} from 'antd';
import {
  ReloadOutlined,
  EyeOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import {
  Button as AppButton,
  Pagination,
  Input,
  Spin,
} from '@enterprise-workspace/frontend/shared';
import styles from './StrategyExecutionHistory.module.css';

// ============================================================================
// Types
// ============================================================================

/** 策略效果 */
export type StrategyEffect = 'ALLOW' | 'DENY' | 'CONDITIONAL';

/** 执行步骤 */
export interface ExecutionStep {
  nodeId: string;
  nodeName: string;
  executed: boolean;
  result?: unknown;
  error?: string;
  duration: number;
}

/** 执行结果 */
export interface StrategyExecutionResult {
  executionId: string;
  strategyId: string;
  effect: StrategyEffect;
  success: boolean;
  output: Record<string, unknown>;
  executionTime: number;
  steps: ExecutionStep[];
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata: {
    startTime: number;
    endTime: number;
    version: string;
  };
}

/** 分页结果 */
export interface PaginatedResult<T> {
  list: T[];
  total: number;
}

// ============================================================================
// Props
// ============================================================================

interface StrategyExecutionHistoryProps {
  strategyId: string;
}

// Translation helper
const t = (key: string): string => {
  const translations: Record<string, string> = {
    'common.strategy.monitor.execution_history': '执行历史',
    'common.strategy.monitor.execution_history_desc': '查看策略的详细执行历史和结果分析',
    'common.strategy.monitor.status_filter': '状态筛选',
    'common.strategy.monitor.status_all': '全部',
    'common.strategy.monitor.status_success': '成功',
    'common.strategy.monitor.status_failed': '失败',
    'common.strategy.monitor.refresh': '刷新',
    'common.strategy.monitor.view_input': '查看输入',
    'common.strategy.monitor.view_output': '查看输出',
    'common.strategy.monitor.detail': '详情',
    'common.strategy.monitor.replay': '重放',
    'common.strategy.monitor.execution_id': '执行ID',
    'common.strategy.monitor.strategy_effect': '策略效果',
    'common.strategy.monitor.execution_status': '执行状态',
    'common.strategy.monitor.execution_time': '执行时间',
    'common.strategy.monitor.execution_steps': '执行步骤',
    'common.strategy.monitor.start_time': '开始时间',
    'common.strategy.monitor.input_data': '输入数据',
    'common.strategy.monitor.output_result': '输出结果',
    'common.strategy.monitor.operation': '操作',
    'common.strategy.monitor.load_failed': '加载执行历史失败',
    'common.strategy.monitor.replay_started': '执行重放已开始',
    'common.strategy.monitor.replay_failed': '执行重放失败',
  };
  return translations[key] || key;
};

// ============================================================================
// Mock Service (Replace with actual API)
// ============================================================================

const mockExecutionService = {
  getExecutionHistory: async (
    strategyId: string,
    params: { page: number; size: number }
  ): Promise<PaginatedResult<StrategyExecutionResult>> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const allResults: StrategyExecutionResult[] = Array.from(
      { length: 50 },
      (_, i) => ({
        executionId: `exec-${strategyId}-${i + 1}`,
        strategyId,
        effect: ['ALLOW', 'DENY', 'CONDITIONAL'][
          i % 3
        ] as StrategyEffect,
        success: i % 4 !== 0,
        output: { result: i % 4 === 0 ? 'allowed' : 'denied' },
        executionTime: 50 + Math.floor(Math.random() * 200),
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
        metadata: {
          startTime: Date.now() - i * 3600000,
          endTime: Date.now() - i * 3600000 + 150,
          version: '1.0.0',
        },
      })
    );

    const start = (params.page - 1) * params.size;
    return {
      list: allResults.slice(start, start + params.size),
      total: allResults.length,
    };
  },

  replayExecution: async (executionId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Replay execution:', executionId);
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

const getEffectTagType = (
  effect: StrategyEffect
): 'success' | 'error' | 'warning' | 'default' => {
  const effectMap: Record<StrategyEffect, 'success' | 'error' | 'warning' | 'default'> = {
    ALLOW: 'success',
    DENY: 'error',
    CONDITIONAL: 'warning',
  };
  return effectMap[effect] || 'default';
};

const getEffectLabel = (effect: StrategyEffect): string => {
  const labelMap: Record<StrategyEffect, string> = {
    ALLOW: '允许',
    DENY: '拒绝',
    CONDITIONAL: '条件性',
  };
  return labelMap[effect] || effect;
};

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN');
};

const getInputData = (execution: StrategyExecutionResult): Record<string, unknown> => {
  return execution.output || {};
};

// ============================================================================
// Main Component
// ============================================================================

export const StrategyExecutionHistory: React.FC<StrategyExecutionHistoryProps> = ({
  strategyId,
}) => {
  // State
  const [loading, setLoading] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<
    StrategyExecutionResult[]
  >([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);

  // Dialog state
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<
    StrategyExecutionResult | null
  >(null);

  // Service
  const executionService = mockExecutionService;

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await executionService.getExecutionHistory(strategyId, {
        page: currentPage,
        size: pageSize,
      });
      setExecutionHistory(result.list);
      setTotalRecords(result.total);
    } catch (error) {
      console.error('Failed to load execution history:', error);
      message.error(t('common.strategy.monitor.load_failed'));
    } finally {
      setLoading(false);
    }
  }, [strategyId, currentPage, pageSize, executionService]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh
  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    loadData();
  }, [loadData]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback(
    (value: string) => {
      setStatusFilter(value);
      setCurrentPage(1);
      loadData();
    },
    [loadData]
  );

  // Handle pagination change
  const handlePageChange = useCallback(
    (page: number, size: number) => {
      setCurrentPage(page);
      setPageSize(size);
      loadData();
    },
    [loadData]
  );

  // View execution detail
  const handleViewDetail = useCallback(
    (execution: StrategyExecutionResult) => {
      setSelectedExecution(execution);
      setDetailVisible(true);
    },
    []
  );

  // Replay execution
  const handleReplay = useCallback(
    async (execution: StrategyExecutionResult) => {
      try {
        await executionService.replayExecution(execution.executionId);
        message.success(t('common.strategy.monitor.replay_started'));
      } catch (error) {
        console.error('Replay failed:', error);
        message.error(t('common.strategy.monitor.replay_failed'));
      }
    },
    [executionService]
  );

  // Filtered data
  const filteredData = useMemo(() => {
    if (!statusFilter) return executionHistory;

    return executionHistory.filter((execution) => {
      if (statusFilter === 'success') return execution.success;
      if (statusFilter === 'failed') return !execution.success;
      return true;
    });
  }, [executionHistory, statusFilter]);

  // Status options
  const statusOptions = [
    { value: '', label: t('common.strategy.monitor.status_all') },
    { value: 'success', label: t('common.strategy.monitor.status_success') },
    { value: 'failed', label: t('common.strategy.monitor.status_failed') },
  ];

  // Table columns
  const columns = useMemo(
    () => [
      {
        title: t('common.strategy.monitor.execution_id'),
        dataIndex: 'executionId',
        key: 'executionId',
        width: 180,
        render: (text: string) => (
          <Typography.Link onClick={() => {
            const exec = executionHistory.find(e => e.executionId === text);
            if (exec) handleViewDetail(exec);
          }}>
            {text}
          </Typography.Link>
        ),
      },
      {
        title: t('common.strategy.monitor.strategy_effect'),
        dataIndex: 'effect',
        key: 'effect',
        width: 100,
        render: (effect: StrategyEffect) => (
          <Tag color={getEffectTagType(effect)}>
            {getEffectLabel(effect)}
          </Tag>
        ),
      },
      {
        title: t('common.strategy.monitor.execution_status'),
        dataIndex: 'success',
        key: 'success',
        width: 100,
        render: (success: boolean) => (
          <Tag color={success ? 'success' : 'error'}>
            {success
              ? t('common.strategy.monitor.status_success')
              : t('common.strategy.monitor.status_failed')}
          </Tag>
        ),
      },
      {
        title: t('common.strategy.monitor.execution_time'),
        dataIndex: 'executionTime',
        key: 'executionTime',
        width: 100,
        render: (time: number) => `${time}ms`,
      },
      {
        title: t('common.strategy.monitor.execution_steps'),
        dataIndex: 'steps',
        key: 'steps',
        width: 100,
        render: (steps: ExecutionStep[]) => `${steps.length} 步`,
      },
      {
        title: t('common.strategy.monitor.start_time'),
        dataIndex: ['metadata', 'startTime'],
        key: 'startTime',
        width: 180,
        render: (time: number) => formatTime(time),
      },
      {
        title: t('common.strategy.monitor.input_data'),
        dataIndex: 'input',
        key: 'input',
        minWidth: 200,
        render: (_: unknown, record: StrategyExecutionResult) => (
          <Popover
            content={
              <pre className={styles.jsonPreview}>
                {JSON.stringify(getInputData(record), null, 2)}
              </pre>
            }
            title={t('common.strategy.monitor.input_data')}
            trigger="hover"
          >
            <Button type="link" size="small">
              {t('common.strategy.monitor.view_input')}
            </Button>
          </Popover>
        ),
      },
      {
        title: t('common.strategy.monitor.output_result'),
        dataIndex: 'output',
        key: 'output',
        minWidth: 200,
        render: (_: unknown, record: StrategyExecutionResult) => (
          <Popover
            content={
              <pre className={styles.jsonPreview}>
                {JSON.stringify(record.output, null, 2)}
              </pre>
            }
            title={t('common.strategy.monitor.output_result')}
            trigger="hover"
          >
            <Button type="link" size="small">
              {t('common.strategy.monitor.view_output')}
            </Button>
          </Popover>
        ),
      },
      {
        title: t('common.strategy.monitor.operation'),
        key: 'action',
        width: 160,
        fixed: 'right',
        render: (_: unknown, record: StrategyExecutionResult) => (
          <Space size="small">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            >
              {t('common.strategy.monitor.detail')}
            </Button>
            <Button
              size="small"
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleReplay(record)}
            >
              {t('common.strategy.monitor.replay')}
            </Button>
          </Space>
        ),
      },
    ],
    [executionHistory, handleViewDetail, handleReplay]
  );

  // Render execution detail content
  const renderDetailContent = useMemo(() => {
    if (!selectedExecution) return null;

    const steps = selectedExecution.steps.map((step, index) => ({
      key: index,
      color: step.executed ? 'green' : 'gray',
      children: (
        <div className={styles.stepItem}>
          <div className={styles.stepHeader}>
            <span className={styles.stepName}>{step.nodeName}</span>
            <span className={styles.stepDuration}>{step.duration}ms</span>
          </div>
          {step.result && (
            <div className={styles.stepResult}>
              <span>结果: </span>
              <pre>{JSON.stringify(step.result, null, 2)}</pre>
            </div>
          )}
          {step.error && (
            <div className={styles.stepError}>错误: {step.error}</div>
          )}
        </div>
      ),
    }));

    return (
      <div className={styles.detailContent}>
        <div className={styles.detailRow}>
          <div className={styles.detailItem}>
            <div className={styles.detailLabel}>
              {t('common.strategy.monitor.execution_id')}
            </div>
            <div className={styles.detailValue}>
              {selectedExecution.executionId}
            </div>
          </div>
          <div className={styles.detailItem}>
            <div className={styles.detailLabel}>
              {t('common.strategy.monitor.execution_status')}
            </div>
            <div className={styles.detailValue}>
              <Tag color={selectedExecution.success ? 'success' : 'error'}>
                {selectedExecution.success
                  ? t('common.strategy.monitor.status_success')
                  : t('common.strategy.monitor.status_failed')}
              </Tag>
            </div>
          </div>
          <div className={styles.detailItem}>
            <div className={styles.detailLabel}>
              {t('common.strategy.monitor.execution_time')}
            </div>
            <div className={styles.detailValue}>
              {selectedExecution.executionTime}ms
            </div>
          </div>
        </div>

        <div className={styles.detailSection}>
          <h4>执行步骤</h4>
          <Timeline mode="left" items={steps} />
        </div>
      </div>
    );
  }, [selectedExecution]);

  return (
    <div className={styles.history}>
      {/* Header */}
      <div className={styles.historyHeader}>
        <div className={styles.headerInfo}>
          <h3>{t('common.strategy.monitor.execution_history')}</h3>
          <p>{t('common.strategy.monitor.execution_history_desc')}</p>
        </div>
        <div className={styles.headerControls}>
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            options={statusOptions}
            className={styles.statusSelect}
            placeholder={t('common.strategy.monitor.status_filter')}
            allowClear
          />
          <AppButton
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            {t('common.strategy.monitor.refresh')}
          </AppButton>
        </div>
      </div>

      {/* Table */}
      <Table
        dataSource={filteredData}
        columns={columns}
        loading={loading}
        rowKey="executionId"
        pagination={false}
        scroll={{ x: 1400 }}
      />

      {/* Pagination */}
      <div className={styles.tablePagination}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalRecords}
          onChange={handlePageChange}
          showSizeChanger
          showTotal={(total) => `共 ${total} 条`}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        title={t('common.strategy.monitor.detail')}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={900}
      >
        {renderDetailContent}
      </Modal>
    </div>
  );
};

StrategyExecutionHistory.displayName = 'StrategyExecutionHistory';

export default StrategyExecutionHistory;
