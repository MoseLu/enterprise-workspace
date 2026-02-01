/**
 * 退出登录路由守卫工厂
 * 检测 logout=1 参数或 sessionStorage 标记，调用 logoutCore 执行清理
 */
;

import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { logoutCore, type LogoutCoreOptions } from '@btc/shared-core';

export interface LogoutGuardConfig {
  /**
   * 应用名称（用于日志和区分不同应用）
   */
  appName: string;
  /**
   * 退出登录核心逻辑的配置选项
   */
  logoutCoreOptions?: LogoutCoreOptions;
}

/**
 * 检测是否有退出登录参数
 */
function hasLogoutParam(to: RouteLocationNormalized): boolean {
  if (to.path !== '/login') {
    return false;
  }

  const logoutValue = Array.isArray(to.query.logout) ? to.query.logout[0] : to.query.logout;
  return (
    logoutValue === '1' ||
    logoutValue === 1 ||
    logoutValue === 'true' ||
    String(logoutValue) === '1'
  );
}

import { sessionStorage } from '@btc/shared-core/utils/storage/session';

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
 * 创建退出登录路由守卫
 * @param config - 守卫配置
 * @returns 路由守卫函数
 */
export function createLogoutGuard(config: LogoutGuardConfig) {
  return async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    // 只在访问登录页时检查
    if (to.path !== '/login') {
      next();
      return;
    }

    // 检测退出登录参数或 sessionStorage 标记
    const hasLogout = hasLogoutParam(to) || hasLogoutTimestamp();

    if (hasLogout) {
      // 如果检测到退出参数，调用 logoutCore 执行清理
      // 注意：这里只执行清理，不处理重定向（重定向由 useLogout 处理）
      // 如果路由守卫检测到 logout 参数，说明已经执行过 logoutCore，这里只需要放行
      // 但如果 sessionStorage 标记存在，可能需要再次清理（防止遗漏）
      if (hasLogoutTimestamp()) {
        // 如果只有 sessionStorage 标记，说明可能是从其他标签页触发的退出
        // 这里可以选择执行清理或直接放行
        // 为了安全，我们执行一次清理（但不会调用 API，因为可能是远程退出）
        try {
          await logoutCore({
            ...config.logoutCoreOptions,
            isRemoteLogout: true, // 标记为远程退出，不调用 API
          });
        } catch (error) {
          console.warn('[logoutGuard] Failed to cleanup on logout timestamp:', error);
        }
      }

      // 清除 sessionStorage 标记（如果存在）
      try {
        sessionStorage.remove('logout_timestamp');
      } catch (e) {
        // 静默失败
      }

      // 放行，允许访问登录页
      next();
      return;
    }

    // 没有退出参数，继续下一个守卫
    next();
  };
}

