import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes';
import { setupErrorHandler } from './guards/errorHandler';
import { setupBeforeResolveGuard } from './guards/beforeResolve';
import { setupBeforeEachGuard } from './guards/beforeEach';
import { setupAfterEachGuard } from './guards/afterEach';
import { createTitleGuard } from '@btc/shared-router';
import { tSync } from '../i18n/getters';

/**
 * 创建 router 实例
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
  strict: true,
  // 注意：Vue Router 会自动执行初始导航，但我们已经在路由守卫中处理了这种情况
  // 在 loginRedirectGuard 中会检查是否是初始导航，如果是则直接允许访问
});

// 注册守卫
setupErrorHandler(router);
setupBeforeResolveGuard(router);
setupBeforeEachGuard(router);
setupAfterEachGuard(router);

// 注册标题守卫（使用国际化翻译函数）
createTitleGuard(router, {
  translate: tSync,
  preloadConfig: true,
});

export default router;

// 导出工具函数供外部使用
export { isAuthenticated, setupI18nTitleWatcher } from './utils';
