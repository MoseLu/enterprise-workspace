/**
 * Loading 统一导出
 * 导出所有loading服务和composables
 */

// 导出配置
export * from '../loading.config';

// 导出服务
export { rootLoadingService } from './root-loading.service';
export { appLoadingService } from './app-loading.service';
export { routeLoadingService } from './route-loading.service';

// 导出 composables
export { useRouteLoading } from '../../../composables/useRouteLoading';
export { useOperationLoading } from '../../../composables/useOperationLoading';
export type { OperationLoadingOptions } from '../../../composables/useOperationLoading';

