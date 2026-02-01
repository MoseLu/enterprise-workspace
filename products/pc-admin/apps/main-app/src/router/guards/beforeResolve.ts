;
import type { Router } from 'vue-router';
import { KNOWN_SUB_APP_PREFIXES } from '../constants';

/**
 * 动态导入 @btc/shared-core
 */
async function importSharedCore() {
  return await import('@btc/shared-core');
}

let loadingClosed = false;

/**
 * 设置路由解析前守卫
 * 在路由解析完成后立即关闭全局根级 Loading
 */
export function setupBeforeResolveGuard(router: Router) {
  router.beforeResolve(async (to) => {
    // 关键：如果是子应用路由或登录页，不应该关闭"拜里斯科技"loading（因为它应该已经被隐藏了）
    const isSubAppRoute = KNOWN_SUB_APP_PREFIXES.some(prefix => to.path.startsWith(prefix));
    const isLoginPage = to.path === '/login' || to.path.startsWith('/login?');

    // 子应用路由和登录页的loading由各自管理，不应该在这里处理
    if (isSubAppRoute || isLoginPage) {
      return;
    }

    if (!loadingClosed) {
      try {
        const loadingModule = await importSharedCore();
        const rootLoadingService = loadingModule?.rootLoadingService;
        if (rootLoadingService && typeof rootLoadingService.hide === 'function') {
          rootLoadingService.hide();
          loadingClosed = true;
        } else {
          throw new Error('rootLoadingService 未定义或方法不存在');
        }
      } catch (error) {
        console.warn('[system-app router] 无法加载 RootLoadingService，使用备用方案', error);
        // 备用方案：直接操作 DOM（向后兼容）
        const loadingEl = document.getElementById('Loading');
        if (loadingEl) {
          loadingEl.style.setProperty('display', 'none', 'important');
          loadingEl.style.setProperty('visibility', 'hidden', 'important');
          loadingEl.style.setProperty('opacity', '0', 'important');
          loadingEl.style.setProperty('pointer-events', 'none', 'important');
          loadingEl.classList.add('is-hide');
          loadingClosed = true;
        }
      }
    }
  });
}

