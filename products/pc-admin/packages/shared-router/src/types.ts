import type { RouteRecordRaw } from 'vue-router';

export interface PageRouteConfig extends RouteRecordRaw {
  /**
   * 是否为页面级路由（自动应用 .page 容器）
   * - true: 页面级路由，直接挂载到根路由
   * - false/undefined: 视图级路由，挂载到布局路由下
   */
  isPage?: boolean;
  
  /**
   * 页面容器类型
   * - 'default': 默认 .page 容器
   * - 'login': 登录页容器（.page-login）
   * - 'error': 错误页容器（.page-error）
   * - 'fullscreen': 全屏页面（.page-fullscreen）
   * - 'custom': 自定义容器（不自动应用 .page）
   */
  pageType?: 'default' | 'login' | 'error' | 'fullscreen' | 'custom';
}
