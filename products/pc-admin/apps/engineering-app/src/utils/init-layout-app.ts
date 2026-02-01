/**
 * 初始化 layout-app 加载
 * 仅在独立运行且需要加载 layout-app 时调用
 *
 * 关键设计：
 * 1. 只在成功加载 layout-app 后才设置 __USE_LAYOUT_APP__ 标志
 * 2. 任何失败（网络错误、超时、挂载失败等）都会清除标志，允许子应用独立渲染
 * 3. 提供详细的错误日志，便于排查问题
 */
;

import { tSync } from '../i18n/getters';
import { sessionStorage } from '@btc/shared-core/utils/storage/session';

/**
 * 显示 Loading（如果尚未显示）
 */
function showLoading() {
  // 检查是否有导航标记或需要显示 Loading
  try {
    const shouldShowLoading = sessionStorage.get<string>('__BTC_NAV_LOADING__') === '1' || true;
    if (shouldShowLoading) {
      const loadingEl = document.getElementById('Loading');
      if (loadingEl) {
        loadingEl.style.setProperty('display', 'flex', 'important');
        loadingEl.style.setProperty('visibility', 'visible', 'important');
        loadingEl.style.setProperty('opacity', '1', 'important');
        loadingEl.classList.remove('is-hide');
      }
    }
  } catch (e) {
    // 静默失败
  }
}

/**
 * 移除 Loading 元素
 */
function removeLoadingElement() {
  const loadingEl = document.getElementById('Loading');
  if (loadingEl) {
    // 立即隐藏（使用内联样式确保优先级）
    loadingEl.style.setProperty('display', 'none', 'important');
    loadingEl.style.setProperty('visibility', 'hidden', 'important');
    loadingEl.style.setProperty('opacity', '0', 'important');
    loadingEl.style.setProperty('pointer-events', 'none', 'important');

    // 添加淡出类（如果 CSS 中有定义）
    loadingEl.classList.add('is-hide');

    // 延迟移除，确保动画完成（300ms 过渡时间 + 50ms 缓冲）
    setTimeout(() => {
      try {
        if (loadingEl.parentNode) {
          loadingEl.parentNode.removeChild(loadingEl);
        } else if (loadingEl.isConnected) {
          // 如果 parentNode 为 null 但元素仍在 DOM 中，直接移除
          loadingEl.remove();
        }
      } catch (error) {
        // 如果移除失败，至少确保元素被隐藏
        loadingEl.style.setProperty('display', 'none', 'important');
      }
    }, 350);
  }
}

/**
 * 清理导航标记
 */
function clearNavigationFlag() {
  try {
    sessionStorage.remove('__BTC_NAV_LOADING__');
  } catch (e) {
    // 静默失败（某些浏览器可能禁用 sessionStorage）
  }
}

/**
 * 获取当前子应用的 appId
 */
function getCurrentAppId(): string {
  const hostname = window.location.hostname;

  // 从子域名映射获取
  const subdomainMap: Record<string, string> = {
    'admin.bellis.com.cn': 'admin',
    'logistics.bellis.com.cn': 'logistics',
    'engineering.bellis.com.cn': 'engineering',
    'quality.bellis.com.cn': 'quality',
    'production.bellis.com.cn': 'production',
    'finance.bellis.com.cn': 'finance',
    'monitor.bellis.com.cn': 'monitor',
  };

  if (subdomainMap[hostname]) {
    return subdomainMap[hostname];
  }

  // 从路径前缀获取
  const pathname = window.location.pathname;
  if (pathname.startsWith('/admin')) {
    return 'admin';
  } else if (pathname.startsWith('/logistics')) {
    return 'logistics';
  } else if (pathname.startsWith('/engineering')) {
    return 'engineering';
  } else if (pathname.startsWith('/quality')) {
    return 'quality';
  } else if (pathname.startsWith('/production')) {
    return 'production';
  } else if (pathname.startsWith('/finance')) {
    return 'finance';
  } else if (pathname.startsWith('/monitor')) {
    return 'monitor';
  }

  // 默认返回 engineering（用于当前文件所在的 engineering-app）
  return 'engineering';
}

/**
 * 在加载 layout-app 之前，从 manifest 注入当前子应用的配置
 */
async function injectAppConfigFromManifest(appId: string) {
  try {
    // 动态导入必要的模块
    const [
      layoutBridgeModule,
      { getMenuRegistry },
      { getManifest }
    ] = await Promise.all([
      import('@btc/shared-core/configs/layout-bridge'),
      import('@btc/shared-components'),
      import('@btc/subapp-manifests')
    ]);

    // 从 layoutBridge 中解构出需要的函数（使用类型断言）
    const layoutBridge = layoutBridgeModule as unknown as {
      registerManifestMenusForApp: (appId: string) => void;
      resolveAppLogoUrl: () => string | undefined;
      registerAppEnvAccessors: (target?: Window) => void;
    };
    const { registerManifestMenusForApp, resolveAppLogoUrl, registerAppEnvAccessors } = layoutBridge;

    // 1. 确保菜单注册表已初始化
    let registry = getMenuRegistry();
    if (typeof window !== 'undefined' && !(window as any).__BTC_MENU_REGISTRY__) {
      (window as any).__BTC_MENU_REGISTRY__ = registry;
    } else if (typeof window !== 'undefined' && (window as any).__BTC_MENU_REGISTRY__) {
      registry = (window as any).__BTC_MENU_REGISTRY__;
    }

    // 2. 注册应用环境访问器
    registerAppEnvAccessors();

    // 3. 设置菜单注册函数（供 layout-app 使用）
    (window as any).__REGISTER_MENUS_FOR_APP__ = registerManifestMenusForApp;

    // 4. 从 manifest 注册当前应用的菜单（在 layout-app 加载前就注册好）
    registerManifestMenusForApp(appId);

    // 5. 设置 Logo URL 获取函数（使用 resolveAppLogoUrl）
    (window as any).__APP_GET_LOGO_URL__ = resolveAppLogoUrl;

    // 6. 设置应用配置获取函数（如果需要）
    const manifest = getManifest(appId);
    if (manifest && manifest.app?.nameKey) {
      // 可以设置其他配置，比如应用名称等
      (window as any).__CURRENT_APP_MANIFEST__ = manifest;
    }

    if (import.meta.env.DEV) {
      console.info(`[initLayoutApp] ${tSync('common.error.manifest_injected')}: ${appId}`, {
        hasMenus: registry?.value?.[appId]?.length > 0,
        hasLogoUrl: !!(window as any).__APP_GET_LOGO_URL__
      });
    }
  } catch (error) {
    console.warn(`[initLayoutApp] ${tSync('common.error.manifest_inject_failed')}:`, error);
    // 继续执行，使用默认配置
  }
}

export async function initLayoutApp() {
  if (window.__POWERED_BY_QIANKUN__) {
    return;
  }

  const shouldLoadLayout = /\.bellis\.com\.cn$/i.test(window.location.hostname);
  if (!shouldLoadLayout) {
    return;
  }

  const LOADER_FLAG = '__layout_app_loader__';
  if ((window as any)[LOADER_FLAG]) {
    return;
  }
  (window as any)[LOADER_FLAG] = true;

  // 关键：在加载 layout-app 之前，显式显示 Loading
  showLoading();

  // 关键：在加载 layout-app 之前，先从 manifest 注入当前子应用的配置
  const currentAppId = getCurrentAppId();
  await injectAppConfigFromManifest(currentAppId);

  // 关键：先不设置 __USE_LAYOUT_APP__ 标志，只在成功加载后再设置
  // 这样如果加载失败，子应用可以立即回退到独立渲染模式

  try {
    const [qiankun, { loadLayoutApp }] = await Promise.all([
      import('qiankun'),
      import('@btc/shared-utils/qiankun/load-layout-app')
    ]);

    // 关键：必须在加载 layout-app 脚本之前就声明"嵌入模式"
    // 否则 layout-app 入口脚本执行时读不到该标志，会继续 register/start qiankun，从而二次加载并挂载当前子应用（single-spa #41/#1、内容区空白）。
    (window as any).__BTC_LAYOUT_APP_EMBEDDED_BY_SUBAPP__ = true;
    (window as any).__BTC_EMBEDDED_SUBAPP_ID__ = currentAppId;

    await loadLayoutApp({
      registerMicroApps: qiankun.registerMicroApps,
      start: qiankun.start
    });

    // 关键：确保在 loadLayoutApp 成功后设置标志
    // loadLayoutApp 内部也会设置，但这里再次确保设置
    (window as any).__USE_LAYOUT_APP__ = true;

    // 加载成功后，Loading 会在子应用挂载时由子应用清理，这里不清理
    // 但清理导航标记（如果存在）
    clearNavigationFlag();
  } catch (error) {
    // 任何错误都要清除标志，确保子应用可以独立渲染
    (window as any).__USE_LAYOUT_APP__ = false;

    // 加载失败时，移除 Loading 并清理标记
    removeLoadingElement();
    clearNavigationFlag();

    // 清理可能残留的 layout-app 相关标志和 DOM 内容
    // 移除可能添加的 script 标签（layout-app 的入口文件）
    const scripts = document.querySelectorAll('script[data-layout-app], script[src*="layout.bellis.com.cn"], script[src*="localhost:4188"]');
    scripts.forEach(script => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });

    // 清理可能添加的 base 标签（如果是为了 layout-app 添加的）
    const baseTags = document.querySelectorAll('base[data-layout-app-base], base');
    baseTags.forEach(base => {
      // 如果 base 标签有 data-layout-app-base 属性，或者指向 layout-app 的域名，移除它
      const baseElement = base as HTMLBaseElement;
      if (baseElement.hasAttribute('data-layout-app-base') ||
          (baseElement.href && (baseElement.href.includes('layout.bellis.com.cn') || baseElement.href.includes('localhost:4188')))) {
        if (baseElement.parentNode) {
          baseElement.parentNode.removeChild(baseElement);
        }
      }
    });

    // 清理 #app 容器中可能残留的内容（如果 layout-app 部分加载但挂载失败）
    const appContainer = document.querySelector('#app');
    if (appContainer) {
      const hasLayoutContent = appContainer.querySelector('#subapp-viewport') ||
                               appContainer.querySelector('#layout-app') ||
                               appContainer.querySelector('[data-layout-app]');
      if (hasLayoutContent || appContainer.children.length > 0) {
        // 清空容器，让子应用可以重新挂载
        appContainer.innerHTML = '';
      }
    }

    // 关键：抛出错误，让调用者知道加载失败，触发回退逻辑
    throw error;
  }
}
