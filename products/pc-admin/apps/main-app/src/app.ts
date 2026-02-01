import type { AppIdentity } from '@btc/shared-core/configs/app-identity.types';

/**
 * 主应用身份配置
 */
const mainAppIdentity: AppIdentity = {
  id: 'main',
  name: '主应用',
  description: 'BTC车间管理系统 - 主应用基座',
  pathPrefix: '/',
  subdomain: 'bellis.com.cn',
  type: 'main',
  enabled: true,
  version: '1.0.0',
    routes: {
      mainAppRoutes: ['/workbench/overview', '/workbench/todo', '/workbench/profile'], // 主应用路由列表
    nonClosableRoutes: ['/workbench/overview'],     // 不可关闭的路由
    homeRoute: '/workbench/overview',                // 首页路由
    skipTabbarRoutes: ['/login', '/register', '/forget-password', '/404', '/workbench/overview'], // 跳过 Tabbar 的路由
  },
};

export default mainAppIdentity;

