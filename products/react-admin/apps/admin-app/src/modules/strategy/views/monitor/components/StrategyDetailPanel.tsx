/**
 * Strategy Detail Panel Component
 *
 * Displays detailed information about a strategy including:
 * - Basic information (name, type, status, priority, version, etc.)
 * - Execution statistics
 * - Effect distribution
 * - Performance metrics
 * - Tags and description
 * - Configuration details (rules, conditions, actions, execution)
 *
 * Migrated from Vue3 to React + TypeScript
 */

import React, { useMemo } from 'react';
import { Card, Tag, Tabs } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  QuestionCircleFilled,
} from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  Select,
  Switch,
  Space,
  Divider,
  Empty,
} from '@enterprise-workspace/frontend/shared';
import styles from './StrategyDetailPanel.module.css';

// ============================================================================
// Types
// ============================================================================

/** 策略类型 */
export type StrategyType = 'PERMISSION' | 'BUSINESS' | 'DATA' | 'WORKFLOW';

/** 策略状态 */
export type StrategyStatus =
  | 'DRAFT'
  | 'TESTING'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ARCHIVED';

/** 策略效果 */
export type StrategyEffect = 'ALLOW' | 'DENY' | 'CONDITIONAL';

/** 策略规则 */
export interface StrategyRule {
  id: string;
  expression: string;
  variables: Record<string, unknown>;
  description?: string;
}

/** 策略条件 */
export interface StrategyCondition {
  id: string;
  field: string;
  operator: string;
  value: unknown;
  logicalOperator?: 'AND' | 'OR';
}

/** 策略动作 */
export interface StrategyAction {
  id: string;
  type: string;
  parameters: Record<string, unknown>;
  description?: string;
}

/** 策略执行配置 */
export interface StrategyExecution {
  engine: 'SYNC' | 'ASYNC' | 'EVENT_DRIVEN';
  timeout?: number;
  retryCount?: number;
  cacheEnabled?: boolean;
}

/** 完整策略定义 */
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
  rules?: StrategyRule[];
  conditions?: StrategyCondition[];
  actions?: StrategyAction[];
  execution?: StrategyExecution;
}

/** 执行统计数据 */
export interface ExecutionStats {
  total: number;
  success: number;
  failed: number;
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
}

/** 效果统计 */
export interface EffectStats {
  allow: number;
  deny: number;
  conditional: number;
}

/** 性能指标 */
export interface PerformanceStats {
  throughput: number;
  errorRate: number;
  p95Duration: number;
  p99Duration: number;
}

/** 监控统计 */
export interface StrategyMonitorStats {
  strategyId: string;
  period: {
    start: string;
    end: string;
  };
  execution: ExecutionStats;
  effects: EffectStats;
  performance: PerformanceStats;
}

// ============================================================================
// Props
// ============================================================================

interface StrategyDetailPanelProps {
  strategy: Strategy;
  stats: StrategyMonitorStats | null;
}

// ============================================================================
// Helper Functions
// ============================================================================

const getTypeTagType = (type: StrategyType): 'success' | 'processing' | 'warning' | 'error' | 'default' => {
  const typeMap: Record<StrategyType, 'success' | 'processing' | 'warning' | 'error' | 'default'> = {
    PERMISSION: 'error',
    BUSINESS: 'success',
    DATA: 'warning',
    WORKFLOW: 'processing',
  };
  return typeMap[type] || 'default';
};

const getTypeLabel = (type: StrategyType, t: (key: string) => string): string => {
  const labelMap: Record<StrategyType, string> = {
    PERMISSION: t('common.strategy.types.permission'),
    BUSINESS: t('common.strategy.types.business'),
    DATA: t('common.strategy.types.data'),
    WORKFLOW: t('common.strategy.types.workflow'),
  };
  return labelMap[type] || type;
};

const getStatusTagType = (status: StrategyStatus): 'success' | 'processing' | 'warning' | 'error' | 'default' => {
  const statusMap: Record<StrategyStatus, 'success' | 'processing' | 'warning' | 'error' | 'default'> = {
    DRAFT: 'processing',
    TESTING: 'warning',
    ACTIVE: 'success',
    INACTIVE: 'error',
    ARCHIVED: 'default',
  };
  return statusMap[status] || 'default';
};

const getStatusLabel = (status: StrategyStatus, t: (key: string) => string): string => {
  const labelMap: Record<StrategyStatus, string> = {
    DRAFT: t('common.strategy.status.draft'),
    TESTING: t('common.strategy.status.testing'),
    ACTIVE: t('common.strategy.status.active'),
    INACTIVE: t('common.strategy.status.inactive'),
    ARCHIVED: t('common.strategy.status.archived'),
  };
  return labelMap[status] || status;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN');
};

// Translation helper - in real app, use translation hook
const t = (key: string): string => {
  const translations: Record<string, string> = {
    'common.strategy.types.permission': '权限策略',
    'common.strategy.types.business': '业务策略',
    'common.strategy.types.data': '数据策略',
    'common.strategy.types.workflow': '工作流策略',
    'common.strategy.status.draft': '草稿',
    'common.strategy.status.testing': '测试中',
    'common.strategy.status.active': '已激活',
    'common.strategy.status.inactive': '已停用',
    'common.strategy.status.archived': '已归档',
    'common.tab.rules': '规则配置',
    'common.tab.conditions': '条件配置',
    'common.tab.actions': '动作配置',
    'common.tab.execution': '执行配置',
    'common.strategy.execution.engine': '执行引擎',
    'common.strategy.execution.timeout': '超时时间',
    'common.strategy.execution.retry_count': '重试次数',
    'common.strategy.execution.cache_enabled': '缓存启用',
    'common.strategy.config.yes': '是',
    'common.strategy.config.no': '否',
  };
  return translations[key] || key;
};

// ============================================================================
// Main Component
// ============================================================================

export const StrategyDetailPanel: React.FC<StrategyDetailPanelProps> = ({
  strategy,
  stats,
}) => {
  // Render execution statistics
  const renderExecutionStats = useMemo(() => {
    if (!stats) {
      return <Empty description="暂无统计数据" />;
    }

    return (
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{stats.execution.total}</div>
          <div className={styles.statLabel}>总执行次数</div>
        </div>
        <div className={styles.statItem}>
          <div className={`${styles.statValue} ${styles.statValueSuccess}`}>
            {stats.execution.success}
          </div>
          <div className={styles.statLabel}>成功次数</div>
        </div>
        <div className={styles.statItem}>
          <div className={`${styles.statValue} ${styles.statValueError}`}>
            {stats.execution.failed}
          </div>
          <div className={styles.statLabel}>失败次数</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>
            {Math.round(stats.execution.avgDuration)}ms
          </div>
          <div className={styles.statLabel}>平均执行时间</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>
            {stats.execution.maxDuration}ms
          </div>
          <div className={styles.statLabel}>最大执行时间</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>
            {stats.execution.minDuration}ms
          </div>
          <div className={styles.statLabel}>最小执行时间</div>
        </div>
      </div>
    );
  }, [stats]);

  // Render effect stats
  const renderEffectStats = useMemo(() => {
    if (!stats) return null;

    return (
      <div className={styles.effectStats}>
        <div className={styles.effectItem}>
          <div className={`${styles.effectIcon} ${styles.effectIconAllow}`}>
            <CheckCircleFilled />
          </div>
          <div className={styles.effectInfo}>
            <div className={styles.effectCount}>{stats.effects.allow}</div>
            <div className={styles.effectLabel}>允许</div>
          </div>
        </div>
        <div className={styles.effectItem}>
          <div className={`${styles.effectIcon} ${styles.effectIconDeny}`}>
            <CloseCircleFilled />
          </div>
          <div className={styles.effectInfo}>
            <div className={styles.effectCount}>{stats.effects.deny}</div>
            <div className={styles.effectLabel}>拒绝</div>
          </div>
        </div>
        <div className={styles.effectItem}>
          <div className={`${styles.effectIcon} ${styles.effectIconConditional}`}>
            <QuestionCircleFilled />
          </div>
          <div className={styles.effectInfo}>
            <div className={styles.effectCount}>{stats.effects.conditional}</div>
            <div className={styles.effectLabel}>条件性</div>
          </div>
        </div>
      </div>
    );
  }, [stats]);

  // Render performance stats
  const renderPerformanceStats = useMemo(() => {
    if (!stats) return null;

    return (
      <div className={styles.performanceStats}>
        <div className={styles.perfItem}>
          <div className={styles.perfLabel}>吞吐量</div>
          <div className={styles.perfValue}>
            {stats.performance.throughput.toFixed(2)} /s
          </div>
        </div>
        <div className={styles.perfItem}>
          <div className={styles.perfLabel}>错误率</div>
          <div className={`${styles.perfValue} ${styles.error}`}>
            {(stats.performance.errorRate * 100).toFixed(2)}%
          </div>
        </div>
        <div className={styles.perfItem}>
          <div className={styles.perfLabel}>P95响应时间</div>
          <div className={styles.perfValue}>
            {stats.performance.p95Duration}ms
          </div>
        </div>
        <div className={styles.perfItem}>
          <div className={styles.perfLabel}>P99响应时间</div>
          <div className={styles.perfValue}>
            {stats.performance.p99Duration}ms
          </div>
        </div>
      </div>
    );
  }, [stats]);

  // Render tags
  const renderTags = useMemo(() => {
    if (!strategy.tags || strategy.tags.length === 0) {
      return <div className={styles.noTags}>暂无标签</div>;
    }

    return (
      <div className={styles.tagsContainer}>
        {strategy.tags.map((tag) => (
          <Tag key={tag} size="small" variant="plain" style={{ margin: 4 }}>
            {tag}
          </Tag>
        ))}
      </div>
    );
  }, [strategy.tags]);

  // Render description
  const renderDescription = useMemo(() => {
    if (!strategy.description) {
      return <p className={styles.noDescription}>暂无描述</p>;
    }

    return <p className={styles.descriptionText}>{strategy.description}</p>;
  }, [strategy.description]);

  // Render rules tab
  const renderRulesTab = useMemo(() => {
    if (!strategy.rules || strategy.rules.length === 0) {
      return <Empty description="暂无规则配置" />;
    }

    return (
      <div>
        {strategy.rules.map((rule, index) => (
          <div key={rule.id} className={styles.configItem}>
            <h5>规则 {index + 1}</h5>
            <Form layout="vertical" size="small">
              <Form.Item label="表达式">
                <code className={styles.expressionCode}>{rule.expression}</code>
              </Form.Item>
              <Form.Item label="变量">
                <pre className={styles.variablesJson}>
                  {JSON.stringify(rule.variables, null, 2)}
                </pre>
              </Form.Item>
              {rule.description && (
                <Form.Item label="描述">
                  <span>{rule.description}</span>
                </Form.Item>
              )}
            </Form>
          </div>
        ))}
      </div>
    );
  }, [strategy.rules]);

  // Render conditions tab
  const renderConditionsTab = useMemo(() => {
    if (!strategy.conditions || strategy.conditions.length === 0) {
      return <Empty description="暂无条件配置" />;
    }

    return (
      <div>
        {strategy.conditions.map((condition, index) => (
          <div key={condition.id} className={styles.configItem}>
            <h5>条件 {index + 1}</h5>
            <Form layout="vertical" size="small">
              <Form.Item label="字段">
                <span>{condition.field}</span>
              </Form.Item>
              <Form.Item label="操作符">
                <span>{condition.operator}</span>
              </Form.Item>
              <Form.Item label="值">
                <span>{String(condition.value)}</span>
              </Form.Item>
              {condition.logicalOperator && (
                <Form.Item label="逻辑操作符">
                  <span>{condition.logicalOperator}</span>
                </Form.Item>
              )}
            </Form>
          </div>
        ))}
      </div>
    );
  }, [strategy.conditions]);

  // Render actions tab
  const renderActionsTab = useMemo(() => {
    if (!strategy.actions || strategy.actions.length === 0) {
      return <Empty description="暂无动作配置" />;
    }

    return (
      <div>
        {strategy.actions.map((action, index) => (
          <div key={action.id} className={styles.configItem}>
            <h5>动作 {index + 1}</h5>
            <Form layout="vertical" size="small">
              <Form.Item label="类型">
                <span>{action.type}</span>
              </Form.Item>
              <Form.Item label="参数">
                <pre className={styles.parametersJson}>
                  {JSON.stringify(action.parameters, null, 2)}
                </pre>
              </Form.Item>
              {action.description && (
                <Form.Item label="描述">
                  <span>{action.description}</span>
                </Form.Item>
              )}
            </Form>
          </div>
        ))}
      </div>
    );
  }, [strategy.actions]);

  // Render execution config tab
  const renderExecutionTab = useMemo(() => {
    const execution = strategy.execution || {
      engine: 'SYNC',
      timeout: 5000,
      retryCount: 3,
      cacheEnabled: false,
    };

    return (
      <Form layout="vertical" size="small">
        <Form.Item label={t('common.strategy.execution.engine')}>
          <span>{execution.engine}</span>
        </Form.Item>
        <Form.Item label={t('common.strategy.execution.timeout')}>
          <span>{execution.timeout || 5000}ms</span>
        </Form.Item>
        <Form.Item label={t('common.strategy.execution.retry_count')}>
          <span>{execution.retryCount || 3}</span>
        </Form.Item>
        <Form.Item label={t('common.strategy.execution.cache_enabled')}>
          <span>
            {execution.cacheEnabled
              ? t('common.strategy.config.yes')
              : t('common.strategy.config.no')}
          </span>
        </Form.Item>
      </Form>
    );
  }, [strategy.execution]);

  // Tab items
  const tabItems = [
    {
      key: 'rules',
      label: t('common.tab.rules'),
      children: renderRulesTab,
    },
    {
      key: 'conditions',
      label: t('common.tab.conditions'),
      children: renderConditionsTab,
    },
    {
      key: 'actions',
      label: t('common.tab.actions'),
      children: renderActionsTab,
    },
    {
      key: 'execution',
      label: t('common.tab.execution'),
      children: renderExecutionTab,
    },
  ];

  return (
    <div className={styles.panel}>
      {/* 第一行：基本信息和执行统计 */}
      <div style={{ display: 'flex', gap: 16 }}>
        <Card
          title="基本信息"
          style={{ flex: 1 }}
          size="small"
        >
          <Form layout="vertical" size="small">
            <Form.Item label="策略名称">
              <span>{strategy.name}</span>
            </Form.Item>
            <Form.Item label="策略类型">
              <Tag color={getTypeTagType(strategy.type)} size="small">
                {getTypeLabel(strategy.type, t)}
              </Tag>
            </Form.Item>
            <Form.Item label="当前状态">
              <Tag color={getStatusTagType(strategy.status)} size="small">
                {getStatusLabel(strategy.status, t)}
              </Tag>
            </Form.Item>
            <Form.Item label="优先级">
              <span>{strategy.priority}</span>
            </Form.Item>
            <Form.Item label="版本">
              <span>{strategy.version}</span>
            </Form.Item>
            <Form.Item label="创建时间">
              <span>{formatDate(strategy.createdAt)}</span>
            </Form.Item>
            <Form.Item label="更新时间">
              <span>{formatDate(strategy.updatedAt)}</span>
            </Form.Item>
            <Form.Item label="创建人">
              <span>{strategy.createdBy}</span>
            </Form.Item>
          </Form>
        </Card>

        <Card
          title="执行统计"
          style={{ flex: 1 }}
          size="small"
        >
          {renderExecutionStats}
        </Card>
      </div>

      {/* 第二行：效果分布、性能指标、标签信息 */}
      <div className={styles.rowGap} style={{ display: 'flex', gap: 16 }}>
        <Card
          title="策略效果分布"
          style={{ flex: 1 }}
          size="small"
        >
          {renderEffectStats}
        </Card>

        <Card
          title="性能指标"
          style={{ flex: 1 }}
          size="small"
        >
          {renderPerformanceStats}
        </Card>

        <Card
          title="标签信息"
          style={{ flex: 1 }}
          size="small"
        >
          {renderTags}
          <Divider style={{ margin: '12px 0' }} />
          <div className={styles.descriptionSection}>
            <h4>策略描述</h4>
            {renderDescription}
          </div>
        </Card>
      </div>

      {/* 第三行：策略配置详情 */}
      <div className={styles.rowGap}>
        <Card title="策略配置详情" size="small">
          <Tabs items={tabItems} />
        </Card>
      </div>
    </div>
  );
};

StrategyDetailPanel.displayName = 'StrategyDetailPanel';

export default StrategyDetailPanel;
