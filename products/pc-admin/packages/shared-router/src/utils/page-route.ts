import type { RouteLocationNormalized } from 'vue-router';
import type { PageRouteConfig } from '../types';

/**
 * 判断路由是否为页面级路由
 * 判断逻辑（优先级从高到低）：
 * 1. meta.isPage 显式指定
 * 2. 路径包含 /pages/
 * 3. 路由配置中有 isPage 标记
 */
export function isPageRoute(route: RouteLocationNormalized | PageRouteConfig): boolean {
  // 1. meta 中显式指定
  if (route.meta?.isPage !== undefined) {
    return route.meta.isPage as boolean;
  }
  
  // 2. 路径包含 /pages/ 或 /views/
  if (route.path.includes('/pages/') || route.path.includes('/views/')) {
    return true;
  }
  
  // 3. 路由配置标记
  if ('isPage' in route && route.isPage) {
    return true;
  }
  
  return false;
}

/**
 * 获取页面容器类型
 */
export function getPageType(route: RouteLocationNormalized): string {
  if (route.meta?.pageType) {
    return String(route.meta.pageType);
  }
  
  // 根据路径自动判断
  if (route.path.includes('/login')) {
    return 'login';
  }
  
  if (route.path.includes('/404') || route.path.includes('/error')) {
    return 'error';
  }
  
  return 'default';
}

/**
 * 获取页面容器类名
 */
export function getPageClass(route: RouteLocationNormalized): string {
  const pageType = getPageType(route);
  
  switch (pageType) {
    case 'login':
      return 'page-login';
    case 'error':
      return 'page-error';
    case 'fullscreen':
      return 'page page-fullscreen';
    case 'custom':
      return ''; // 自定义容器不添加 .page
    default:
      return 'page';
  }
}
