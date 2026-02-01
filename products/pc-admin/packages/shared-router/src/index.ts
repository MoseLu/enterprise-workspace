// @btc/shared-router 入口文件

export * from './guards/logoutGuard';
export * from './guards/loginRedirectGuard';
export * from './guards/authGuard';
export * from './guards/titleGuard';

// 页面路由工具函数
export * from './utils/page-route';
export type { PageRouteConfig } from './types';

