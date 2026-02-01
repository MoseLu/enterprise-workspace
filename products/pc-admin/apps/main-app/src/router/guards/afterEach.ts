import type { Router, RouteLocationNormalized } from 'vue-router';
import { isMainAppRoute, getMainAppHomeRoute, getMainAppId, logger } from '@btc/shared-core';
import { routes } from '../routes';
import { APP_ROOTS, PUBLIC_PAGES } from '../constants';
import { isAuthenticated } from '../utils/auth';
// 标题设置已移至 shared-router 的 titleGuard，这里不再需要 updateDocumentTitle

/**
 * 处理路由匹配调试
 */
async function handleRouteMatching(to: RouteLocationNormalized, router: Router) {
  if (!import.meta.env.PROD || to.matched.length > 0) {
    return;
  }

  // 对于根路径 `/`，检查是否是 Layout 组件加载问题
  if (to.path === '/') {
    const matchedRoutes = router.resolve('/');
    const rootRoute = routes.find(r => r.path === '/');
    // 根路径 `/` 不应该重定向到登录页，这是系统应用首页
    return;
  }

  // 如果路由未匹配，尝试重定向到登录页（避免一直 loading）
  const isPublicPage = (
    to.meta?.public === true ||
    to.path === '/login' ||
    to.path === '/forget-password' ||
    to.path === '/register' ||
    to.path.startsWith('/duty/')
  );

  if (!isPublicPage && to.path !== '/login') {
    const isAuth = isAuthenticated();

    if (!isAuth) {
      // 未认证，不再重定向到登录页（已禁用）
      if (import.meta.env.DEV) {
        console.log('[handleRouteMatching] ❌ 未认证，但已禁用重定向到登录页:', {
          targetPath: to.fullPath,
        });
      }
    }
    
    // 无论是否认证，都隐藏 loading
    const loadingEl = document.getElementById('Loading');
    if (loadingEl) {
      loadingEl.style.setProperty('display', 'none', 'important');
    }
  }
}

/**
 * 处理 ECharts 清理
 */
function handleEChartsCleanup() {
  try {
    import('@btc/shared-components').then(({ cleanupAllECharts }: any) => {
      cleanupAllECharts();
    }).catch(() => {
      // 如果导入失败，使用备用清理逻辑
      try {
        const tooltipElements = document.querySelectorAll('.echarts-tooltip');
        tooltipElements.forEach(el => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
        const toolboxElements = document.querySelectorAll('.echarts-toolbox, .echarts-data-view');
        toolboxElements.forEach(el => {
          if (el.parentNode && el.parentNode === document.body) {
            el.parentNode.removeChild(el);
          }
        });
      } catch (fallbackError) {
        // 忽略错误
      }
    });
  } catch (error) {
    // 忽略错误
  }
}

/**
 * 处理标签页管理
 */
function handleTabManagement(to: RouteLocationNormalized) {
  // 如果是首页（isHome=true），将所有标签设为未激活
  if (to.meta?.isHome === true) {
    import('../../store/process').then(({ useProcessStore }) => {
      const process = useProcessStore();
      process.list.forEach((tab) => {
        tab.active = false;
      });
    }).catch(() => {
      // 忽略错误
    });
    return;
  }

  // 直接跳过标记为子应用的路由
  if (to.meta?.isSubApp === true) {
    return;
  }

  // 规范化路径（移除末尾斜杠）
  const normalizedPath = to.path.replace(/\/$/, '');

  // 跳过子应用的根路径（但不跳过主应用首页，因为需要添加标签页）
  const homeRoute = getMainAppHomeRoute();
  if (APP_ROOTS.includes(normalizedPath)) {
    return;
  }

  // 主应用是首页，只处理主应用的路由
  const subAppPrefixes = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance', '/system'];
  const isHomeRoute = to.path === homeRoute;
  const isSubAppRoute = !isHomeRoute && subAppPrefixes.some((prefix) =>
    to.path.startsWith(prefix)
  );

  // 跳过子应用路由，但不跳过主应用首页（需要添加标签页）
  if (isSubAppRoute) {
    return;
  }

  // 只添加有效的系统域路由（必须有 name）
  if (!to.name) {
    return;
  }

  // 使用 store 添加路由到标签页（动态导入避免循环依赖）
  import('../../store/process').then(({ useProcessStore, getCurrentAppFromPath }) => {
    const process = useProcessStore();
    const currentApp = getCurrentAppFromPath(to.path);

    // 添加主应用和系统域的路由（不是子应用）
    if (currentApp === 'main' || currentApp === 'system') {
      // 主应用或系统域路由，添加到标签页
      // 将路由的 titleKey 转换为 labelKey，以便 tabbar 正确显示
      const meta = { ...to.meta } as any;
      if (meta.titleKey && !meta.labelKey) {
        meta.labelKey = meta.titleKey;
      }
      process.add({
        path: to.path,
        fullPath: to.fullPath,
        name: to.name as string,
        meta,
      });
    }
    // 其他子应用路由，不添加到标签页
  }).catch(() => {
    // 忽略错误
  });
}

/**
 * 处理最近访问记录
 */
function handleRecentAccess(to: RouteLocationNormalized) {
  const isPublicPage = (
    to.meta?.public === true ||
    to.path === '/login' ||
    to.path === '/forget-password' ||
    to.path === '/register' ||
    to.path.startsWith('/duty/')
  );
  const isHomePage = to.path === getMainAppHomeRoute();

  if (!isPublicPage && !isHomePage && to.matched.length > 0) {
    // 动态导入避免循环依赖
    import('../../store/recentAccess').then(({ useRecentAccessStore }) => {
      import('../../store/process').then(({ getCurrentAppFromPath }) => {
        const recentAccessStore = useRecentAccessStore();
        const appId = getCurrentAppFromPath(to.path);

        // 如果无法确定应用，跳过
        if (!appId || appId === getMainAppId()) {
          return;
        }

        // 尝试从 manifest 获取路由信息
        import('@btc/subapp-manifests').then(({ getManifestRoute, getManifest }) => {
          const manifest = getManifest(appId);
          if (!manifest) {
            return;
          }

          const route = getManifestRoute(appId, to.path);
          if (route) {
            // 获取应用显示名称
            import('../../modules/overview/utils/appData').then(({ getAppDisplayName }) => {
              const appData = {
                appId,
                appName: manifest.app.id,
                basePath: manifest.app.basePath || `/${appId}`,
                ...(manifest.app.nameKey ? { nameKey: manifest.app.nameKey } : {}),
                menus: [],
              };

              const appName = getAppDisplayName(appData);
              // 使用 tSync 翻译 labelKey，如果没有 labelKey 则使用 label 或 path
              import('../../i18n/getters').then(({ tSync }) => {
                const label = route.labelKey 
                  ? tSync(route.labelKey) 
                  : (route.label || to.path);
                const lastBreadcrumbIcon = route.breadcrumbs?.[route.breadcrumbs.length - 1]?.icon;

                recentAccessStore.addAccess({
                  appId,
                  appName,
                  path: to.path,
                  label: label || route.label || to.path,
                  ...(route.labelKey ? { labelKey: route.labelKey } : {}),
                  ...(lastBreadcrumbIcon ? { icon: lastBreadcrumbIcon } : {}),
                });
              }).catch(() => {
                // 如果导入失败，使用默认值
                const label = route.label || to.path;
                recentAccessStore.addAccess({
                  appId,
                  appName,
                  path: to.path,
                  label,
                });
              });
            }).catch(() => {
              // 如果获取应用名称失败，使用默认值
              recentAccessStore.addAccess({
                appId,
                appName: appId,
                path: to.path,
                label: to.path,
              });
            });
          } else {
            // 如果无法找到路由信息，使用默认值记录
            recentAccessStore.addAccess({
              appId,
              appName: appId,
              path: to.path,
              label: to.path,
            });
          }
        }).catch(() => {
          // 如果导入失败，跳过记录
        });
      }).catch(() => {
        // 如果导入失败，跳过记录
      });
    }).catch(() => {
      // 如果导入失败，跳过记录
    });
  }
}

/**
 * 处理主应用路由的全局状态更新
 */
function handleMainAppRouteUpdate(to: RouteLocationNormalized) {
  const isMainAppRouteCheck = isMainAppRoute(to.path);

  // 如果是主应用路由，更新全局状态（Tabbar 和面包屑）
  if (isMainAppRouteCheck) {
    // 动态导入全局状态管理工具
    import('../../utils/globalTabBreadcrumb').then(({ updateMainAppTabBreadcrumb }) => {
      // 获取子路由的 meta（如果有子路由，优先使用子路由的 meta）
      const matchedRoute = to.matched[to.matched.length - 1];
      const routeMeta = matchedRoute?.meta || to.meta;

      // 构建包含子路由 meta 的路由对象
      // 将 titleKey 转换为 labelKey，以便 tabbar 正确显示（与 process.add 逻辑保持一致）
      const meta = { ...to.meta, ...routeMeta } as any;
      if (meta.titleKey && !meta.labelKey) {
        meta.labelKey = meta.titleKey;
      }

      const routeWithMeta = {
        ...to,
        meta: {
          ...meta,
          // 合并 breadcrumb 和 breadcrumbs
          breadcrumb: routeMeta?.breadcrumb || routeMeta?.breadcrumbs || to.meta?.breadcrumb || to.meta?.breadcrumbs || [],
          breadcrumbs: routeMeta?.breadcrumbs || routeMeta?.breadcrumb || to.meta?.breadcrumbs || to.meta?.breadcrumb || [],
        },
      };

      updateMainAppTabBreadcrumb(routeWithMeta).catch(() => {
        // 忽略错误
      });
    }).catch(() => {
      // 忽略错误
    });
  }

  // 如果是主应用路由，注册主应用菜单
  if (isMainAppRouteCheck) {
    // 动态导入避免循环依赖
    import('../../micro/index').then(({ registerManifestTabsForApp, registerManifestMenusForApp }) => {
      registerManifestTabsForApp('main').catch((err) => logger.error('注册主应用标签页失败', err));
      registerManifestMenusForApp('main').catch((err) => logger.error('注册主应用菜单失败', err));
    }).catch(() => {
      // 忽略错误
    });
  }

  // 检查是否是系统域路径（/system 和 /data/* 路径）
  const isSystemPath = to.path.startsWith('/system') || to.path.startsWith('/data');

  // 如果是系统域路径，确保菜单已注册
  if (isSystemPath) {
    // 动态导入避免循环依赖
    import('../../micro/index').then(({ registerManifestTabsForApp, registerManifestMenusForApp }) => {
      registerManifestTabsForApp('system').catch((err) => logger.error('注册系统应用标签页失败', err));
      registerManifestMenusForApp('system').catch((err) => logger.error('注册系统应用菜单失败', err));
    }).catch(() => {
      // 忽略错误
    });
  }
}

/**
 * 设置路由后置守卫
 */
export function setupAfterEachGuard(router: Router) {
  // 第一个 afterEach：处理路由匹配调试
  router.afterEach(async (to) => {
    await handleRouteMatching(to, router);
  });

  // 第二个 afterEach：处理标签页、面包屑、最近访问等
  router.afterEach(async (to, from) => {
    // 监控系统：路由导航结束
    const { trackRouteNavigationEnd } = await import('@btc/shared-core/utils/monitor');
    trackRouteNavigationEnd(
      from.path,
      to.path,
      to.name as string | undefined,
      to.params as Record<string, any> | undefined,
      to.query as Record<string, any> | undefined
    );

    // 清理所有 ECharts 实例
    handleEChartsCleanup();

    // 标题设置已移至 shared-router 的 titleGuard（在 beforeEach 中处理）

    // 处理主应用路由的全局状态更新
    handleMainAppRouteUpdate(to);

    // 处理标签页管理
    handleTabManagement(to);

    // 处理最近访问记录
    handleRecentAccess(to);
  });
}

