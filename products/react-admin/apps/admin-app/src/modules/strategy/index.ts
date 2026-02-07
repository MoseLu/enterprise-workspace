/**
 * Strategy Module
 *
 * Strategy management module containing:
 * - Strategy management views (CRUD operations)
 * - Strategy designer views (visual editor)
 * - Strategy monitor views (monitoring and alerts)
 */

export { StrategyManagement, default } from './views/management';
export { StrategyMonitor, default as StrategyMonitorDefault } from './views/monitor';
