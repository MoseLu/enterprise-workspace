/**
 * Strategy Monitor Module
 *
 * Strategy monitoring page with:
 * - Strategy list with status filter
 * - Strategy detail view
 * - Execution history view
 * - Alert configuration
 *
 * Migrated from Vue3 (products/pc-admin/apps/admin-app/src/modules/strategy/views/monitor/index.vue)
 * to React + TypeScript
 */

export { StrategyMonitor, default } from './index';
export { StrategyDetailPanel, default as StrategyDetailPanelDefault } from './components/StrategyDetailPanel';
export { StrategyExecutionHistory, default as StrategyExecutionHistoryDefault } from './components/StrategyExecutionHistory';
export { StrategyAlertConfig, default as StrategyAlertConfigDefault } from './components/StrategyAlertConfig';

// Types
export type {
  Strategy,
  StrategyStatus,
  StrategyType,
  StrategyMonitorStats,
} from './index';

export type {
  StrategyDetailPanelProps,
  Strategy,
  StrategyMonitorStats,
  StrategyType,
  StrategyStatus,
  StrategyEffect,
  StrategyRule,
  StrategyCondition,
  StrategyAction,
  StrategyExecution,
} from './components/StrategyDetailPanel';

export type {
  StrategyExecutionHistoryProps,
  StrategyExecutionResult,
  ExecutionStep,
} from './components/StrategyExecutionHistory';

export type {
  StrategyAlertConfigProps,
  StrategyAlert,
  AlertType,
  AlertCondition,
  AlertAction,
  AlertActionType,
} from './components/StrategyAlertConfig';
