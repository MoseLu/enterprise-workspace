/**
 * 用户行为监控
 * 通过事件委托监听关键操作，提供手动埋点 API
 */

import type { UserActionInfo, RouteInfo } from './types';
import { getCollector } from './collector';
import { getConfig } from './config';

/**
 * 是否已初始化
 */
let initialized = false;

/**
 * 滚动深度记录
 */
let maxScrollDepth = 0;

/**
 * 获取当前路由路径
 */
function getCurrentRoutePath(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.location.pathname;
}

/**
 * 上报用户行为事件
 */
function reportUserAction(
  userAction: UserActionInfo,
  route?: RouteInfo
): void {
  const config = getConfig();
  if (!config.enableUserBehavior) {
    return;
  }

  const collector = getCollector();
  collector.collect({
    eventType: 'user:action',
    data: {
      userAction,
      route,
    },
  });
}

/**
 * 初始化用户行为监控
 */
export function initUserBehaviorMonitor(): void {
  if (initialized) {
    return;
  }

  const config = getConfig();
  if (!config.enableUserBehavior) {
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  // 事件委托：监听关键操作
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (!target) {
      return;
    }

    // 检查是否有 data-track 属性
    const trackAttr = target.getAttribute('data-track');
    if (trackAttr) {
      const userAction: UserActionInfo = {
        actionType: 'click',
        elementType: target.tagName.toLowerCase(),
        elementId: target.id || undefined,
        elementClass: target.className || undefined,
        elementText: target.textContent?.substring(0, 50) || undefined,
      };

      const route: RouteInfo = {
        routePath: getCurrentRoutePath(),
      };

      reportUserAction(userAction, route);
      return;
    }

    // 自动识别关键元素
    const isKeyElement =
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'submit') ||
      target.closest('button') ||
      target.closest('a[href]');

    if (isKeyElement) {
      const userAction: UserActionInfo = {
        actionType: 'click',
        elementType: target.tagName.toLowerCase(),
        elementId: target.id || undefined,
        elementClass: target.className || undefined,
        elementText: target.textContent?.substring(0, 50) || undefined,
      };

      const route: RouteInfo = {
        routePath: getCurrentRoutePath(),
      };

      reportUserAction(userAction, route);
    }
  }, true);

  // 监听表单提交
  document.addEventListener('submit', (event) => {
    const target = event.target as HTMLFormElement;
    if (!target) {
      return;
    }

    const userAction: UserActionInfo = {
      actionType: 'submit',
      elementType: 'form',
      elementId: target.id || undefined,
      elementClass: target.className || undefined,
    };

    const route: RouteInfo = {
      routePath: getCurrentRoutePath(),
    };

    reportUserAction(userAction, route);
  }, true);

  // 监听滚动行为
  let scrollTimer: ReturnType<typeof setTimeout> | null = null;
  window.addEventListener('scroll', () => {
    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }

    scrollTimer = setTimeout(() => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      const scrollDepth = Math.round(((scrollTop + clientHeight) / scrollHeight) * 100);

      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;

        const userAction: UserActionInfo = {
          actionType: 'scroll',
          scrollDepth,
        };

        const route: RouteInfo = {
          routePath: getCurrentRoutePath(),
        };

        reportUserAction(userAction, route);
      }
    }, 100);
  });

  initialized = true;
}

/**
 * 手动埋点：用户点击
 */
export function trackUserClick(
  elementType: string,
  elementId?: string,
  elementClass?: string,
  elementText?: string
): void {
  const userAction: UserActionInfo = {
    actionType: 'click',
    elementType,
    elementId,
    elementClass,
    elementText,
  };

  const route: RouteInfo = {
    routePath: getCurrentRoutePath(),
  };

  reportUserAction(userAction, route);
}

/**
 * 手动埋点：表单提交
 */
export function trackFormSubmit(
  formId?: string,
  formClass?: string
): void {
  const userAction: UserActionInfo = {
    actionType: 'submit',
    elementType: 'form',
    elementId: formId,
    elementClass: formClass,
  };

  const route: RouteInfo = {
    routePath: getCurrentRoutePath(),
  };

  reportUserAction(userAction, route);
}

/**
 * 手动埋点：自定义用户行为
 */
export function trackUserAction(userAction: UserActionInfo, route?: RouteInfo): void {
  reportUserAction(userAction, route || { routePath: getCurrentRoutePath() });
}

/**
 * 销毁用户行为监控
 */
export function destroyUserBehaviorMonitor(): void {
  // 注意：由于使用了事件委托，这里不需要移除监听器
  // 如果需要移除，需要保存监听器引用
  initialized = false;
  maxScrollDepth = 0;
}
