import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import type { SubAppContext } from './types';
import { ensureLeadingSlash, normalizeToHostPath, getCurrentHostPath, extractHostSubRoute } from './utils';

let syncingFromSubApp = false;
let syncingFromHost = false;

/**
 * 同步子路由到主机（标准化模板）
 */
export function syncHostWithSubRoute(fullPath: string, basePath: string, context?: SubAppContext): void {
  // 如果应用已卸载，不再同步路由
  if (context?.isUnmounted) {
    return;
  }

  // 关键：在 layout-app 模式下，不需要修改 URL（因为子域名模式下 URL 已经是正确的）
  // 但我们需要标记正在从子应用同步，避免循环
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  if (isUsingLayoutApp) {
    // layout-app 模式下，URL 已经是正确的（子域名模式），不需要修改
    // 但需要标记正在同步，避免触发 setupHostLocationBridge 的循环
    syncingFromSubApp = true;
    // 立即重置标志，因为 layout-app 模式下不需要等待 URL 更新
    setTimeout(() => {
      syncingFromSubApp = false;
    }, 0);
    return;
  }

  // qiankun 模式下的原有逻辑
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ || syncingFromHost) {
    return;
  }

  // 确保 fullPath 是有效的路径，如果已经是完整路径则直接使用
  let targetUrl = fullPath || basePath;

  // 如果 fullPath 已经是完整路径（以 basePath 开头），直接使用
  // 否则确保它以 basePath 开头
  if (!targetUrl.startsWith(basePath)) {
    // 如果 fullPath 是相对路径，拼接 base path
    if (targetUrl === '/' || targetUrl === '') {
      targetUrl = basePath;
    } else {
      targetUrl = `${basePath}${targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`}`;
    }
  }

  const currentUrl = getCurrentHostPath();

  if (currentUrl === targetUrl) {
    return;
  }

  syncingFromSubApp = true;
  window.history.pushState(window.history.state, '', targetUrl);
}

/**
 * 同步主机路由到子应用（标准化模板）
 */
export function syncSubRouteWithHost(context: SubAppContext, appId: string, basePath: string): void {
  // 如果应用已卸载，不再同步路由
  if (context.isUnmounted) {
    return;
  }
  // 关键：在 layout-app 环境下也需要同步路由
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ && !isUsingLayoutApp) {
    return;
  }

  const targetRoute = extractHostSubRoute(appId, basePath);
  const normalizedTarget = ensureLeadingSlash(targetRoute);
  const currentRoute = ensureLeadingSlash(
    context.router.currentRoute.value.fullPath || context.router.currentRoute.value.path || '/',
  );

  // 比较路径（去掉 query 和 hash 进行比较）
  const currentPath = currentRoute.split('?')[0]?.split('#')[0] || '';
  const targetPath = normalizedTarget.split('?')[0]?.split('#')[0] || '';

  if (targetPath === currentPath) {
    // 路径相同，不需要更新（query 和 hash 的变化会由路由本身处理）
    return;
  }

  // 关键修复：在 layout-app 模式下，确保路由同步后能触发事件
  syncingFromHost = true;

  // 关键修复：在 layout-app 模式下，使用 push 而不是 replace，确保路由变化能被 Vue Router 正确检测
  // 这样可以确保组件能够响应式更新（菜单激活状态、tabbar 激活状态、内容区域）
  // 但是，我们需要在同步完成后立即使用 replaceState 替换历史记录，避免在浏览器历史中添加条目
  if (isUsingLayoutApp) {
    // 关键修复：检查当前路由是否已经是目标路由，如果是则不需要同步
    // 这样可以避免不必要的路由同步，确保组件能够正确更新
    const currentRoute = context.router.currentRoute.value;
    const currentRoutePath = ensureLeadingSlash(
      currentRoute.fullPath || currentRoute.path || '/',
    );
    const currentPath = currentRoutePath.split('?')[0]?.split('#')[0] || '';
    
    if (currentPath === targetPath) {
      // 路径相同，不需要同步，但需要重置标志
      syncingFromHost = false;
      return;
    }
    
    context.router.push(normalizedTarget).then(() => {
      // 路由同步成功，立即使用 replaceState 替换历史记录，避免在浏览器历史中添加条目
      // 这样既保证了 Vue Router 的响应式更新，又不会污染浏览器历史记录
      window.history.replaceState(window.history.state, '', window.location.href);

      // 使用 nextTick 确保 router.afterEach 已经执行
      import('vue').then(({ nextTick }) => {
        nextTick(() => {
          syncingFromHost = false;
        });
      }).catch(() => {
        syncingFromHost = false;
      });
    }).catch(() => {
      // 路由同步失败，直接重置
      syncingFromHost = false;
    });
  } else {
    // qiankun 模式下，使用 replace
    context.router.replace(normalizedTarget).then(() => {
      // 路由同步成功，使用 nextTick 确保 router.afterEach 已经执行
      import('vue').then(({ nextTick }) => {
        nextTick(() => {
          syncingFromHost = false;
        });
      }).catch(() => {
        syncingFromHost = false;
      });
    }).catch(() => {
      // 路由同步失败，直接重置
      syncingFromHost = false;
    });
  }
}

/**
 * 触发路由变化事件（提取为独立函数，便于复用）
 */
function triggerRouteChangeEvent(
  to: any,
  context: SubAppContext,
  basePath: string
): void {
  // 如果应用已卸载，不再同步路由
  if (context.isUnmounted) {
    return;
  }

  const relativeFullPath = ensureLeadingSlash(to.fullPath || to.path || '');
  const fullPath = normalizeToHostPath(relativeFullPath, basePath);

  // 关键：如果是首页（meta.isHome === true），不触发路由变化事件，避免添加 tab
  if (to.meta?.isHome === true) {
    return;
  }

  // 从 basePath 提取应用 ID（例如 '/logistics' -> 'logistics'）
  const appId = basePath.replace(/^\//, '').replace(/\/$/, '') || basePath.replace(/^\//, '');

  // 优先使用 tabLabelKey，如果没有则使用 titleKey（admin-app 使用 titleKey）
  let tabLabelKey = (to.meta?.tabLabelKey ?? to.meta?.titleKey) as string | undefined;
  
  const tabLabel =
    tabLabelKey ??
    (to.meta?.tabLabel as string | undefined) ??
    (to.meta?.title as string | undefined) ??
    (to.name as string | undefined) ??
    fullPath;

  const label = tabLabelKey ? context.translate(tabLabelKey) : tabLabel;

  const metaPayload = {
    ...to.meta,
    label,
  } as Record<string, any>;

  // 如果 meta 中没有 labelKey，尝试从 tabLabelKey 获取
  if (
    typeof metaPayload.labelKey !== 'string' ||
    metaPayload.labelKey.length === 0
  ) {
    if (typeof to.meta?.labelKey === 'string' && to.meta.labelKey.length > 0) {
      metaPayload.labelKey = to.meta.labelKey;
    } else if (typeof tabLabelKey === 'string' && tabLabelKey.length > 0) {
      // 如果 tabLabelKey 看起来像 i18n key（包含点号，如 'menu.xxx'），则使用它作为 labelKey
      // 这样可以支持所有应用的 i18n key（menu.*, logistics.*, finance.* 等）
      metaPayload.labelKey = tabLabelKey;
    }
  }

  // 立即触发事件，确保 tab 能够及时创建
  window.dispatchEvent(
    new CustomEvent('subapp:route-change', {
      detail: {
        path: fullPath,
        fullPath,
        name: to.name,
        meta: metaPayload,
      },
    }),
  );

  // 异步从 manifest 获取路由信息并更新（补充 labelKey 等 meta 信息）
  // 这样可以确保从概览页面跳转时，即使路由 meta 不完整，也能从 manifest 获取正确的 labelKey
  // 使用相对路径导入，避免构建时的解析问题
  import('../../manifest/index').then(({ getManifestRoute }) => {
    const route = getManifestRoute(appId, fullPath);
    if (route) {
      // 从 manifest 获取 labelKey
      const manifestLabelKey = route.tab?.labelKey ?? route.labelKey;
      
      // 如果 manifest 中有 labelKey，且当前 meta 中没有或使用的是临时的 labelKey，则更新
      if (manifestLabelKey && typeof manifestLabelKey === 'string' && manifestLabelKey.length > 0) {
        // 检查是否需要更新（如果当前 labelKey 不存在或与 tabLabelKey 相同，说明是从 titleKey 转换的临时值）
        const needsUpdate = 
          !metaPayload.labelKey || 
          metaPayload.labelKey.length === 0 ||
          (tabLabelKey && metaPayload.labelKey === tabLabelKey && manifestLabelKey !== tabLabelKey);
        
        if (needsUpdate) {
          // 更新 meta 中的 labelKey
          metaPayload.labelKey = manifestLabelKey;
          
          // 更新 label（使用新的 labelKey 翻译）
          const newLabel = context.translate(manifestLabelKey);
          if (newLabel && newLabel !== manifestLabelKey) {
            metaPayload.label = newLabel;
          }
          
          // 如果 manifest 中有 breadcrumbs，也更新
          if (route.breadcrumbs && Array.isArray(route.breadcrumbs) && route.breadcrumbs.length > 0) {
            metaPayload.breadcrumbs = route.breadcrumbs;
          }
          
          // 重新触发事件，更新 tab 的 meta 信息
          window.dispatchEvent(
            new CustomEvent('subapp:route-change', {
              detail: {
                path: fullPath,
                fullPath,
                name: to.name,
                meta: metaPayload,
              },
            }),
          );
        }
      }
    }
  }).catch(() => {
    // 如果导入失败，静默处理（不影响基本功能）
  });
}

/**
 * 设置路由同步监听（标准化模板）
 */
export function setupRouteSync(context: SubAppContext, _appId: string, basePath: string): void {
  // 关键：在 layout-app 环境下也需要设置路由同步
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  // 关键：在独立运行模式下，直接返回，不设置路由同步
  // 因为子应用的路由守卫已经处理了所有逻辑（包括 ECharts 清理等）
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ && !isUsingLayoutApp) {
    return;
  }

  // 在 layout-app 模式下，保存 isUsingLayoutApp 标志，供 routerAfterEach 使用
  const layoutAppMode = isUsingLayoutApp;

  context.cleanup.routerAfterEach = context.router.afterEach(async (to: any, from: any) => {
    // 如果应用已卸载，不再同步路由
    if (context.isUnmounted) {
      return;
    }

    // 监控系统：路由导航结束
    try {
      const { trackRouteNavigationEnd } = await import('../../utils/monitor');
      trackRouteNavigationEnd(
        from?.path || '/',
        to.path || '/',
        to.name,
        to.params,
        to.query
      );
    } catch (error) {
      // 静默失败，不影响路由同步
    }

    // 清理所有 ECharts 实例和相关的 DOM 元素（tooltip、toolbox 等），防止页面切换时残留
    // 这是全局逻辑，因为多个应用都使用 ECharts
    try {
      import('@btc/shared-components').then((sharedComponents: any) => {
        const cleanupAllECharts = (sharedComponents as any).cleanupAllECharts;
        if (cleanupAllECharts) {
          cleanupAllECharts();
        }
      }).catch(() => {
        // 如果导入失败，使用备用清理逻辑
        try {
          const tooltipElements = document.querySelectorAll('.echarts-tooltip');
          tooltipElements.forEach(el => {
            if (el.parentNode === document.body) {
              el.parentNode.removeChild(el);
            }
          });
          const toolboxElements = document.querySelectorAll('.echarts-toolbox, .echarts-data-view');
          toolboxElements.forEach(el => {
            if (el.parentNode === document.body) {
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

    const relativeFullPath = ensureLeadingSlash(to.fullPath || to.path || '');
    const fullPath = normalizeToHostPath(relativeFullPath, basePath);

    // 只在非同步状态下同步到主机（避免循环）
    if (!syncingFromHost) {
      syncHostWithSubRoute(fullPath, basePath, context);
    }

    // 关键修复：确保路由变化事件总是被触发，即使是从主机同步过来的路由
    // 这确保了 tabbar、面包屑和内容区域能够正确响应路由变化
    // 关键：即使 syncingFromHost 为 true，也要触发事件，因为这是子应用路由的真实变化
    // 使用 nextTick 确保在路由完全更新后再触发事件
    // 关键：只在 qiankun 或 layout-app 模式下触发事件（独立运行模式下已在路由守卫中处理）
    import('vue').then(({ nextTick }) => {
      nextTick(() => {
        // 关键：在 layout-app 模式下，即使 syncingFromHost 为 true，也要触发事件
        // 因为这是子应用路由的真实变化，需要通知 layout-app 更新菜单和 tabbar
        triggerRouteChangeEvent(to, context, basePath);
      });
    }).catch(() => {
      // 如果导入失败，直接触发事件（兜底处理）
      triggerRouteChangeEvent(to, context, basePath);
    });

    // 关键修复：在 layout-app 模式下，子应用路由变化时，主动触发路由同步检查
    // 因为 layout-app 模式下，syncHostWithSubRoute 不会修改 URL，所以 setupHostLocationBridge 不会被触发
    // 但是，如果 layout-app 的路由变化了（比如用户点击了 layout-app 的菜单），需要同步到子应用
    // 这里我们通过触发 popstate 事件来触发 setupHostLocationBridge 的路由同步
    if (layoutAppMode && !syncingFromHost) {
      // 在 layout-app 模式下，子应用路由变化时，触发 popstate 事件
      // 这样 setupHostLocationBridge 会检查 layout-app 的路由，并同步到子应用（如果需要）
      import('vue').then(({ nextTick }) => {
        nextTick(() => {
          window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
        });
      });
    }

  });

  // 关键：页面刷新时，主动触发一次当前路由的路由变化事件，确保标签页能够恢复
  // 等待路由就绪后再触发，确保路由信息完整
  context.router.isReady().then(() => {
    // 使用 nextTick 确保路由已经完全初始化
    import('vue').then(({ nextTick }) => {
      nextTick(() => {
        const currentRoute = context.router.currentRoute.value;
        // 只有当路由已匹配时才触发事件（避免在路由未匹配时触发）
        if (currentRoute.matched.length > 0) {
          triggerRouteChangeEvent(currentRoute, context, basePath);
    }
      });
    });
  }).catch(() => {
    // 如果路由就绪失败，静默处理
  });
}

/**
 * 设置主机位置桥接（标准化模板）
 */
export function setupHostLocationBridge(context: SubAppContext, appId: string, basePath: string): void {
  // 关键：在 layout-app 环境下也需要设置路由同步
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ && !isUsingLayoutApp) {
    return;
  }

  let lastPath = window.location.pathname;
  // 防抖定时器（用于 layout-app 模式）
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const handleRoutingEvent = () => {
    // 关键修复：在 layout-app 模式下，syncingFromSubApp 不应该阻止路由同步
    // 因为 layout-app 模式下，子应用路由变化不会修改 URL（URL 已经是正确的）
    // 所以 syncingFromSubApp 标志不应该影响从 layout-app 到子应用的路由同步
    if (syncingFromSubApp && !isUsingLayoutApp) {
      syncingFromSubApp = false;
      return;
    }

    // 在 layout-app 模式下，如果 syncingFromSubApp 为 true，重置它但不返回
    // 这样可以确保 layout-app 的路由变化能够同步到子应用
    if (syncingFromSubApp && isUsingLayoutApp) {
      syncingFromSubApp = false;
    }

    // 关键修复：检查路由是否已经匹配且路径正确，如果是则跳过同步
    // 这样可以避免在初始导航完成后立即触发路由同步，导致组件内容被清空
    const currentRoute = context.router.currentRoute.value;
    if (currentRoute.matched.length > 0) {
      // 路由已匹配，检查路径是否正确
      const targetRoute = extractHostSubRoute(appId, basePath);
      const normalizedTarget = ensureLeadingSlash(targetRoute);
      const currentRoutePath = ensureLeadingSlash(
        currentRoute.fullPath || currentRoute.path || '/',
      );
      
      // 比较路径（去掉 query 和 hash 进行比较）
      const currentPath = currentRoutePath.split('?')[0]?.split('#')[0] || '';
      const targetPath = normalizedTarget.split('?')[0]?.split('#')[0] || '';
      
      // 如果路由已匹配且路径正确，跳过同步
      if (currentPath === targetPath) {
        // 更新 lastPath，避免下次触发
        lastPath = window.location.pathname;
        return;
      }
    }

    // 检查路径是否真的变化了
    const currentPath = window.location.pathname;

    // 关键修复：在 layout-app 模式下，使用防抖避免重复调用
    // 因为 pushState 的 patch 和 popstate 事件可能都会触发，导致重复同步
    if (isUsingLayoutApp) {
      // 清除之前的定时器
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      // 使用 nextTick 确保路由完全更新后再同步
      import('vue').then(({ nextTick }) => {
        nextTick(() => {
          // 再次检查路径，确保真的需要同步
          const finalPath = window.location.pathname;
          if (finalPath !== lastPath) {
            syncSubRouteWithHost(context, appId, basePath);
            lastPath = finalPath;
          }
        });
      }).catch(() => {
        // 如果导入失败，使用 setTimeout 作为兜底
        debounceTimer = setTimeout(() => {
          const finalPath = window.location.pathname;
          if (finalPath !== lastPath) {
            syncSubRouteWithHost(context, appId, basePath);
            lastPath = finalPath;
          }
          debounceTimer = null;
        }, 10);
      });
      return;
    }

    // qiankun 模式下的原有逻辑：只有路径变化时才同步
    if (currentPath === lastPath) {
      return;
    }
    lastPath = currentPath;

    syncSubRouteWithHost(context, appId, basePath);
  };

  // qiankun 环境下监听 single-spa 事件
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    window.addEventListener('single-spa:routing-event', handleRoutingEvent);
    context.cleanup.listeners.push(['single-spa:routing-event', handleRoutingEvent]);
  }

  // layout-app 和 qiankun 环境下都需要监听 popstate 事件
  // layout-app 的 router.afterEach 会触发 popstate 事件
  window.addEventListener('popstate', handleRoutingEvent);
  context.cleanup.listeners.push(['popstate', handleRoutingEvent]);

  // 关键修复：在 qiankun 模式和 layout-app 模式下，都需要监听 pushState 和 replaceState 的变化
  // 因为：
  // 1. qiankun 模式：主应用使用 router.push() 时，会调用 pushState，但不会触发 popstate
  // 2. layout-app 模式：layout-app 使用 router.push() 时，会调用 pushState，但不会触发 popstate
  //    需要监听这些变化，确保 layout-app 的路由变化能同步到子应用
  if (qiankunWindow.__POWERED_BY_QIANKUN__ || isUsingLayoutApp) {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const patchedPushState = function(state: any, title: string, url?: string | URL | null) {
      originalPushState.call(history, state, title, url);
      // 关键修复：在 layout-app 模式下，使用 nextTick 确保路由完全更新后再同步
      // 这样可以确保子应用路由能够正确同步，并触发 subapp:route-change 事件
      if (isUsingLayoutApp) {
        import('vue').then(({ nextTick }) => {
          nextTick(() => {
            handleRoutingEvent();
          });
        }).catch(() => {
          // 如果导入失败，使用 setTimeout 作为兜底
          setTimeout(handleRoutingEvent, 0);
        });
      } else {
        // qiankun 模式下，使用 setTimeout 延迟执行
        setTimeout(handleRoutingEvent, 0);
      }
    };

    const patchedReplaceState = function(state: any, title: string, url?: string | URL | null) {
      originalReplaceState.call(history, state, title, url);
      // 关键修复：在 layout-app 模式下，使用 nextTick 确保路由完全更新后再同步
      if (isUsingLayoutApp) {
        import('vue').then(({ nextTick }) => {
          nextTick(() => {
            handleRoutingEvent();
          });
        }).catch(() => {
          // 如果导入失败，使用 setTimeout 作为兜底
          setTimeout(handleRoutingEvent, 0);
        });
      } else {
        // qiankun 模式下，使用 setTimeout 延迟执行
        setTimeout(handleRoutingEvent, 0);
      }
    };

    // 只在当前应用激活时重写 history API
    history.pushState = patchedPushState;
    history.replaceState = patchedReplaceState;

    context.cleanup.historyPatches = () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }

  // 关键修复：延迟调用 handleRoutingEvent，等待路由准备好后再同步
  // 这样可以避免在初始挂载时立即触发路由同步，导致内容被覆盖
  // 使用 router.isReady() 确保路由已经完全初始化
  context.router.isReady().then(() => {
    // 使用 nextTick 确保路由已经完全初始化，并且初始路由导航已经完成
    import('vue').then(({ nextTick }) => {
      nextTick(() => {
        // 检查路由是否已经匹配，如果已经匹配且路径正确，就不需要同步
        const currentRoute = context.router.currentRoute.value;
        const targetRoute = extractHostSubRoute(appId, basePath);
        const normalizedTarget = ensureLeadingSlash(targetRoute);
        const currentRoutePath = ensureLeadingSlash(
          currentRoute.fullPath || currentRoute.path || '/',
        );
        
        // 比较路径（去掉 query 和 hash 进行比较）
        const currentPath = currentRoutePath.split('?')[0]?.split('#')[0] || '';
        const targetPath = normalizedTarget.split('?')[0]?.split('#')[0] || '';
        
        // 如果路由已经匹配且路径正确，就不需要同步
        if (currentRoute.matched.length > 0 && currentPath === targetPath) {
          // 路由已经正确匹配，更新 lastPath 但不触发同步
          lastPath = window.location.pathname;
          return;
        }
        
        // 路由未匹配或路径不正确，需要同步
        // 再次延迟，确保 mountSubApp 中的路由导航已经完成
        setTimeout(() => {
          handleRoutingEvent();
        }, 100);
      });
    }).catch(() => {
      // 如果导入失败，使用 setTimeout 作为兜底
      setTimeout(() => {
        handleRoutingEvent();
      }, 200);
    });
  }).catch(() => {
    // 如果路由就绪失败，延迟调用（兼容性处理）
    setTimeout(() => {
      handleRoutingEvent();
    }, 300);
  });
}

/**
 * 确保 URL 干净（标准化模板）
 */
export function ensureCleanUrl(context: SubAppContext): void {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return;
  }

  context.router.isReady().then(() => {
    const currentPath = window.location.pathname;
    if (currentPath.endsWith('/') && currentPath !== '/') {
      window.history.replaceState(window.history.state, '', currentPath.slice(0, -1) + window.location.search + window.location.hash);
    }
  });
}
