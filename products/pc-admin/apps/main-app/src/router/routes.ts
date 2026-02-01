import type { RouteRecordRaw } from 'vue-router';
import { BtcAppLayout as Layout } from '@btc/shared-components';
import { getMainAppHomeRoute, getMainAppRoutes } from '@btc/shared-core';
import { isAuthenticated } from './utils/auth';

/**
 * 路由配置
 */
export const routes: RouteRecordRaw[] = [
  // 登录页面（不在 Layout 中）- 使用主应用 pages 目录
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/index.vue'),
    meta: {
      public: true, // 公开页面，不需要认证
      noLayout: true, // 不使用 Layout 布局
      titleKey: 'auth.login',
      isPage: true,
      pageType: 'login'
    }
  },
  // 忘记密码页面（不在 Layout 中）- 使用主应用 pages 目录
  {
    path: '/forget-password',
    name: 'ForgetPassword',
    component: () => import('@/pages/forget-password/index.vue'),
    meta: {
      public: true, // 公开页面，不需要认证
      noLayout: true, // 不使用 Layout 布局
      titleKey: 'auth.login.password.forgot',
      isPage: true
    }
  },
  // 注册页面（不在 Layout 中）- 使用主应用 pages 目录
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/register/index.vue'),
    meta: {
      public: true, // 公开页面，不需要认证
      noLayout: true, // 不使用 Layout 布局
      titleKey: 'auth.register',
      isPage: true
    }
  },
  // 根路径重定向到首页（从配置读取）
  {
    path: '/',
    redirect: getMainAppHomeRoute(),
  },
  // 兼容旧路径：/overview 重定向到 /workbench/overview
  {
    path: '/overview',
    redirect: '/workbench/overview',
  },
  // 概览页面（首页，不显示面包屑和 tabbar 标签）
  {
    path: '/workbench/overview',
    component: Layout,
    children: [
      {
        path: '',
        component: () => import('@/modules/overview/views/index.vue'),
        meta: {
          titleKey: 'menu.overview',
          labelKey: 'menu.overview',
          isHome: true,
          isSubApp: false,
          isPage: true,
          process: false, // 不添加到 tabbar
        },
      },
    ],
  },
  // 个人中心页面
  {
    path: '/workbench/profile',
    component: Layout,
    children: [
      {
        path: '',
        component: () => import('@/pages/profile/index.vue'),
        meta: {
          titleKey: 'common.profile',
          labelKey: 'menu.profile',
          isHome: false,
          isSubApp: false,
          isPage: true,
          breadcrumbs: [
            { path: '/workbench/overview', i18nKey: 'menu.dashboard', label: '工作台', icon: 'svg:Lock' },
            { path: '/workbench/profile', i18nKey: 'menu.profile', label: '个人中心', icon: 'svg:user' },
          ],
        },
      },
    ],
  },
  // 我的待办页面
  {
    path: '/workbench/todo',
    component: Layout,
    children: [
      {
        path: '',
        component: () => import('@/modules/todo/views/index.vue'),
        meta: {
          titleKey: 'menu.todo',
          labelKey: 'menu.todo',
          isHome: false,
          isSubApp: false,
          isPage: true,
          breadcrumbs: [
            { path: '/workbench/overview', i18nKey: 'menu.dashboard', label: '工作台' },
            { path: '/workbench/todo', i18nKey: 'menu.todo', label: '我的待办' },
          ],
        },
      },
    ],
  },
  // 子应用路由占位（qiankun会接管，这里只需要Layout）
  {
    path: '/system',
    component: Layout,
    meta: { title: 'System App', isHome: true, isSubApp: true },
  },
  {
    path: '/system/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'System App', isSubApp: true },
  },
  {
    path: '/admin',
    component: Layout,
    meta: { title: 'Admin App', isHome: true, isSubApp: true },
  },
  {
    path: '/admin/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Admin App', isSubApp: true },
  },
  {
    path: '/logistics',
    component: Layout,
    meta: { title: 'Logistics App', isHome: true, isSubApp: true },
  },
  {
    path: '/logistics/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Logistics App', isSubApp: true },
  },
  {
    path: '/engineering',
    component: Layout,
    meta: { title: 'Engineering App', isHome: true, isSubApp: true },
  },
  {
    path: '/engineering/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Engineering App', isSubApp: true },
  },
  {
    path: '/quality',
    component: Layout,
    meta: { title: 'Quality App', isHome: true, isSubApp: true },
  },
  {
    path: '/quality/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Quality App', isSubApp: true },
  },
  {
    path: '/production',
    component: Layout,
    meta: { title: 'Production App', isHome: true, isSubApp: true },
  },
  {
    path: '/production/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Production App', isSubApp: true },
  },
  {
    path: '/finance',
    component: Layout,
    meta: { title: 'Finance App', isHome: true, isSubApp: true },
  },
  {
    path: '/finance/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Finance App', isSubApp: true },
  },
  {
    path: '/operations',
    component: Layout,
    meta: { title: 'Operations App', isHome: true, isSubApp: true },
  },
  {
    path: '/operations/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Operations App', isSubApp: true },
  },
  {
    path: '/docs',
    component: Layout,
    meta: { title: 'Docs App', isHome: true, isSubApp: true },
  },
  {
    path: '/docs/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Docs App', isSubApp: true },
  },
  {
    path: '/dashboard',
    component: Layout,
    meta: { title: 'Dashboard App', isHome: true, isSubApp: true },
  },
  {
    path: '/dashboard/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Dashboard App', isSubApp: true },
  },
  {
    path: '/personnel',
    component: Layout,
    meta: { title: 'Personnel App', isHome: true, isSubApp: true },
  },
  {
    path: '/personnel/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Personnel App', isSubApp: true },
  },
  {
    path: '/mobile',
    component: Layout,
    meta: { title: 'Mobile App', isHome: true, isSubApp: true },
  },
  {
    path: '/mobile/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Mobile App', isSubApp: true },
  },
  // 注意：/home 路径不在这里配置路由，由代理处理（proxy.ts）
  // 404 页面（必须在最后，作为 catchAll 路由）
  {
    path: '/404',
    name: 'NotFound404',
    component: Layout,
    meta: {
      titleKey: 'common.page_not_found',
      public: true, // 404 页面是公开的，不需要认证
      breadcrumbs: [
        { labelKey: 'common.page_not_found', icon: 'svg:404' },
      ],
    },
    children: [
      {
        path: '',
        name: 'NotFound404Page',
        component: () => import('@btc/shared-components').then(m => m.BtcError404),
        meta: {
          titleKey: 'common.page_not_found',
          isPage: true,
          pageType: 'error',
          breadcrumbs: [
            { labelKey: 'common.page_not_found', icon: 'svg:404' },
          ],
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: Layout, // 需要 component 以满足类型要求，但 beforeEnter 会处理重定向
    beforeEnter: (to, _from, next) => {
      // 最优先：检查是否是静态 HTML 文件（duty 下的页面）
      // 这些页面应该由服务器直接提供，完全绕过 Vue Router
      if (to.path.startsWith('/duty/')) {
        // 使用 next(false) 取消 Vue Router 的导航，让浏览器直接请求静态文件
        next(false);
        return;
      }

      // 检查是否是 home-app 的页面（由代理处理，完全绕过 Vue Router）
      // 在 beforeEnter 中，直接取消导航，让代理处理
      if (to.path.startsWith('/home')) {
        // 使用 next(false) 取消 Vue Router 的导航，让代理处理请求
        next(false);
        return;
      }

      // 关键：检查是否是主应用路由（需要排除，因为主应用路由不应该被 catch-all 路由拦截）
      const mainAppRoutes = getMainAppRoutes();
      const isMainAppRoute = mainAppRoutes.mainAppRoutes?.some(route => {
        const normalizedRoute = route.replace(/\/+$/, '') || '/';
        const normalizedPath = to.path.replace(/\/+$/, '') || '/';
        return normalizedPath === normalizedRoute || normalizedPath.startsWith(normalizedRoute + '/');
      }) || false;

      if (isMainAppRoute) {
        // 主应用路由，允许继续（不应该被 catch-all 路由拦截）
        next();
        return;
      }

      // 检查是否已登录
      const isAuthenticatedUser = isAuthenticated();

      // 如果未登录，不再重定向到登录页（已禁用）
      if (!isAuthenticatedUser) {
        if (import.meta.env.DEV) {
          console.log('[catch-all route] ❌ 未认证，但已禁用重定向到登录页:', {
            targetPath: to.fullPath,
          });
        }
        // 未登录但路由未匹配，重定向到 404 页面
        next('/404');
        return;
      }

      // 已登录但路由未匹配，重定向到 404 页面
      next('/404');
    },
  },
];

