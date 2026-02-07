/**
 * 生产模块配置
 */

import { lazy } from 'react';

export interface RouteConfig {
  path: string;
  name: string;
  element: React.LazyExoticComponent<React.ComponentType<object>>;
  meta?: {
    isHome?: boolean;
    keepAlive?: boolean;
  };
}

export interface ModuleConfig {
  name: string;
  label: string;
  order: number;
  views: RouteConfig[];
  locale: Record<string, Record<string, string>>;
  columns: Record<string, unknown>;
  forms: Record<string, unknown>;
  service: Record<string, unknown>;
}

// 使用 React.lazy 实现代码分割
const Home = lazy(() => import('./views/Home'));

const config: ModuleConfig = {
  name: 'production',
  label: 'common.module.production.label',
  order: 80,
  views: [
    {
      path: '/',
      name: 'Home',
      element: Home,
      meta: {
        isHome: true,
      },
    },
  ],
  locale: {
    'zh-CN': {},
    'en-US': {},
  },
  columns: {},
  forms: {},
  service: {},
};

export default config;
