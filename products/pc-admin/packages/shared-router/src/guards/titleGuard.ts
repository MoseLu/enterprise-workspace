/**
 * 路由标题守卫
 * 职责：解析路由元信息，自动设置标题
 *
 * 标题格式规则：
 * - 标准应用（在 apps.config.json 中）：
 *   1. 默认：{页面标题}
 *   2. 首页：{页面标题} - {应用名}
 *   3. 兜底：{应用名}
 * - 非标准应用（不在 apps.config.json 中）：
 *   1. 默认：{应用名} - 拜里斯科技
 *   2. 兜底：拜里斯科技
 */
;

import type { RouteLocationNormalized, Router } from 'vue-router';
import {
  setPageTitle,
  getAppIdFromPath,
} from '@btc/shared-core';

/**
 * 标题守卫配置
 */
export interface TitleGuardConfig {
  /**
   * 获取应用 ID 的函数
   * 如果不提供，默认使用 getAppIdFromPath 从路径推断
   */
  getAppId?: (to: RouteLocationNormalized) => string | Promise<string>;

  /**
   * 国际化翻译函数（可选）
   * 如果提供，会用于翻译 meta.titleKey
   */
  translate?: (key: string) => string;

  /**
   * 是否预加载应用配置（默认 true）
   */
  preloadConfig?: boolean;
}

/**
 * 默认的获取应用 ID 函数
 */
function defaultGetAppId(to: RouteLocationNormalized): string {
  return getAppIdFromPath(to.path);
}

/**
 * 判断是否为首页
 */
function isHomePage(to: RouteLocationNormalized): boolean {
  // 检查 meta.isHome
  if (to.meta?.isHome === true) {
    return true;
  }

  // 检查路径是否为根路径
  if (to.path === '/' || to.path === '') {
    return true;
  }

  return false;
}

/**
 * 获取页面标题
 * 优先使用 meta.titleKey（如果提供了翻译函数），否则使用 meta.title
 */
function getPageTitle(
  to: RouteLocationNormalized,
  translate?: (key: string) => string
): string | null {
  const meta = to.meta || {};

  // 1. 如果有 titleKey，尝试翻译
  if (meta.titleKey && typeof meta.titleKey === 'string') {
    if (translate) {
      const translated = translate(meta.titleKey);
      // 如果翻译成功（返回值不等于 key），使用翻译结果
      if (translated !== meta.titleKey) {
        return translated;
      }
    }
    // 如果翻译失败或没有提供翻译函数，继续检查其他选项
  }

  // 2. 如果有 title，直接使用
  if (meta.title && typeof meta.title === 'string') {
    return meta.title;
  }

  // 3. 如果 titleKey 存在但没有翻译函数，返回 null（让 buildTitle 使用兜底逻辑）
  if (meta.titleKey && typeof meta.titleKey === 'string') {
    return null;
  }

  // 4. 都没有，返回 null
  return null;
}

/**
 * 创建路由标题守卫
 * @param router Vue Router 实例
 * @param config 配置选项
 */
export function createTitleGuard(
  router: Router,
  config: TitleGuardConfig = {}
): void {
  const {
    getAppId = defaultGetAppId,
    translate,
    preloadConfig = true,
  } = config;

  // 预加载应用配置（可选）
  if (preloadConfig) {
    import('@btc/shared-core').then(({ preloadAppsConfig }) => {
      preloadAppsConfig().catch(() => {
        // 预加载失败不影响功能，继续执行
      });
    });
  }

  router.beforeEach(async (to, _from, next) => {
    try {
      // 关键：正确识别主应用和子应用的路由对象
      //
      // 主应用路由特征：
      //   - 路径没有应用前缀：/overview, /todo, /profile, /login, /404 等
      //   - 主应用路由对象：meta.isSubApp === true 且 name === undefined 且没有 titleKey（这是主应用为子应用创建的路由占位）
      //
      // 子应用路由特征：
      //   - 路径有应用前缀：/admin/xxx, /logistics/xxx 等（在开发环境下）
      //   - 或者路径没有应用前缀但在 qiankun 环境下（子应用使用 MemoryHistory）
      //   - 子应用路由对象：有 name 或 titleKey

      const hasRouteName = !!to.name;
      const hasTitleKey = !!(to.meta?.titleKey && typeof to.meta.titleKey === 'string');
      const isSubAppRouteMeta = to.meta?.isSubApp === true;

      // 判断是否是主应用的路由对象（主应用为子应用创建的路由占位）
      // 特征：meta.isSubApp === true 且 name === undefined 且没有 titleKey
      const isMainAppRoutePlaceholder = isSubAppRouteMeta && !hasRouteName && !hasTitleKey;

      // 判断是否是主应用自己的路由（概览、待办、个人中心等）
      // 主应用路由路径：/overview, /todo, /profile, /login, /register, /forget-password, /404
      const mainAppRoutes = ['/overview', '/todo', '/profile', '/login', '/register', '/forget-password', '/404'];
      const isMainAppOwnRoute = mainAppRoutes.some(route => to.path === route || to.path.startsWith(route + '/'));

      // 如果这是主应用的路由占位对象（为子应用创建的路由占位），跳过处理
      if (isMainAppRoutePlaceholder) {
        next();
        return;
      }

      // 如果这是主应用自己的路由（概览、待办、个人中心等），跳过处理（主应用有自己的 titleGuard）
      if (isMainAppOwnRoute) {
        next();
        return;
      }

      // 判断是否是子应用的路由对象
      // 子应用路由对象：有 name 或 titleKey
      const isSubAppRouteObject = hasRouteName || hasTitleKey;

      // 如果既不是主应用路由，也不是子应用路由对象，跳过处理
      if (!isSubAppRouteObject) {
        next();
        return;
      }

      // 获取应用 ID
      const appId = typeof getAppId === 'function'
        ? await (getAppId(to) as any)
        : defaultGetAppId(to);

      // 判断是否为首页
      const isHome = isHomePage(to);

      // 获取页面标题
      const pageTitle = getPageTitle(to, translate);

      // 设置标题（传递翻译函数以支持应用名称国际化）
      const options: any = {
        isHome,
        sync: false
      };
      if (translate) {
        options.translate = translate;
      }
      await setPageTitle(appId, pageTitle, options);
    } catch (error) {
      // 标题设置失败不影响路由导航
      console.warn('[titleGuard] 设置标题失败:', error);
    }

    // 继续路由导航
    next();
  });
}

/**
 * 创建简单的标题守卫（使用默认配置）
 * @param router Vue Router 实例
 * @param translate 国际化翻译函数（可选）
 */
export function createSimpleTitleGuard(
  router: Router,
  translate?: (key: string) => string
): void {
  const config: any = {};
  if (translate) {
    config.translate = translate;
  }
  createTitleGuard(router, config);
}
