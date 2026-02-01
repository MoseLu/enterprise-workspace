/**
 * 登录页重定向守卫工厂
 * 处理已认证用户访问登录页时的重定向逻辑
 */

import type { NavigationGuardNext, RouteLocationNormalized, Router } from 'vue-router';
import { sessionStorage } from '@btc/shared-core/utils/storage/session';

export interface LoginRedirectGuardConfig {
  /**
   * 应用名称（用于日志）
   */
  appName: string;
  /**
   * 首页路由（已认证用户访问登录页时重定向到此）
   */
  homeRoute: string;
  /**
   * 获取主应用首页路由的函数（可选，用于跨应用场景）
   */
  getMainAppHomeRoute?: () => string;
  /**
   * 检查用户是否已认证的函数
   */
  isAuthenticated: () => boolean;
  /**
   * Vue Router 实例（可选，用于同应用内跳转）
   */
  router?: Router;
}

/**
 * 检测是否有退出登录参数
 */
function hasLogoutParam(to: RouteLocationNormalized): boolean {
  const logoutValue = Array.isArray(to.query.logout) ? to.query.logout[0] : to.query.logout;
  return (
    logoutValue === '1' ||
    logoutValue === 'true' ||
    String(logoutValue) === '1'
  );
}

/**
 * 检测是否有退出登录的 sessionStorage 标记
 */
function hasLogoutTimestamp(): boolean {
  try {
    const logoutTimestamp = sessionStorage.get<number>('logout_timestamp');
    if (logoutTimestamp === null || logoutTimestamp === undefined) {
      return false;
    }

    const logoutTime = typeof logoutTimestamp === 'number' ? logoutTimestamp : parseInt(String(logoutTimestamp), 10);
    const now = Date.now();
    const timeDiff = now - logoutTime;

    // 5秒内有效
    if (timeDiff < 5000) {
      return true;
    } else {
      // 超过5秒，清除标记
      sessionStorage.remove('logout_timestamp');
      return false;
    }
  } catch (e) {
    return false;
  }
}

/**
 * 创建登录页重定向守卫
 * @param config - 守卫配置
 * @returns 路由守卫函数
 */
export function createLoginRedirectGuard(config: LoginRedirectGuardConfig) {
  return async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    // 只在访问登录页时执行
    if (to.path !== '/login') {
      next();
      return;
    }

    // 关键：检查是否是 Vue Router 的初始导航
    // Vue Router 在初始化时，_from 通常是 { name: undefined, path: '/', matched: [] }
    // 或者 _from.path === '/' 且 matched.length === 0
    const isInitialNavigation = (
      _from.name === undefined && 
      _from.matched.length === 0 && 
      (_from.path === '/' || _from.path === '' || _from.path === to.path)
    );
    
    if (isInitialNavigation) {
      if (import.meta.env.DEV) {
        console.log('[loginRedirectGuard] ✅ 检测到初始导航到登录页，允许访问（避免重定向）', {
          toPath: to.path,
          fromPath: _from.path,
          fromName: _from.name,
          fromMatched: _from.matched.length,
        });
      }
      next();
      return;
    }

    // 防止循环重定向：允许从登录页跳转到登录页（例如页面刷新）
    if (_from.path === '/login' && to.path === '/login') {
      if (import.meta.env.DEV) {
        console.log('[loginRedirectGuard] ✅ 检测到从登录页到登录页，允许访问');
      }
      next();
      return;
    }

    // 检查认证状态
    const isAuthenticatedUser = config.isAuthenticated();
    
    // 如果未认证，允许访问登录页
    if (!isAuthenticatedUser) {
      if (import.meta.env.DEV) {
        console.log('[loginRedirectGuard] ❌ 未认证，允许访问登录页');
      }
      next();
      return;
    }
    
    // 已认证用户访问登录页，需要检查是否有退出参数
    const hasLogout = hasLogoutParam(to) || hasLogoutTimestamp();

    // 如果有退出参数或标记，允许访问登录页（退出流程中）
    if (hasLogout) {
      // 清除 sessionStorage 标记（如果存在）
      try {
        sessionStorage.remove('logout_timestamp');
      } catch (e) {
        // 静默失败
      }
      if (import.meta.env.DEV) {
        console.log('[loginRedirectGuard] 检测到退出参数，允许访问登录页（退出流程）');
      }
      next();
      return;
    }

    // 检查 from=duty 参数（特殊场景）
    if (to.query.from === 'duty') {
      if (import.meta.env.DEV) {
        console.log('[loginRedirectGuard] 检测到 from=duty 参数，允许访问登录页');
      }
      next();
      return;
    }

    // 已认证用户访问登录页，重定向到首页
    // 关键：使用 next() 配合重定向路径，而不是直接调用 router.replace
    // 这样可以避免在路由守卫中触发额外的导航，导致页面刷新
    if (import.meta.env.DEV) {
      console.log('[loginRedirectGuard] ✅ 已认证用户访问登录页，重定向到首页');
    }
    
    const homeRoute = config.homeRoute || '/workbench/overview';
    
    // 使用 next() 配合重定向路径，这是 Vue Router 推荐的方式
    // 这样可以避免在守卫中直接调用 router.replace，导致可能的冲突
    next({
      path: homeRoute,
      replace: true, // 使用 replace 避免在历史记录中留下登录页
    });
    return;
  };
}

