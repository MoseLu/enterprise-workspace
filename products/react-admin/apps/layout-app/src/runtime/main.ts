;
import { createApp, type App as VueApp } from 'vue';
import App from './App.vue';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { registerMicroApps, start } from 'qiankun';
import { getAppConfig, logger } from '@btc/shared-core/configs/app-env.config';
import { registerAppEnvAccessors } from '@btc/shared-core/configs/layout-bridge';
import { setIsMainAppFn } from '@btc/shared-components';
// 关键：延迟导入菜单注册表相关函数，避免循环依赖或导入错误导致白屏
// import { getMenuRegistry } from '@btc/shared-components';
// 使用相对路径导入，避免 TypeScript 路径解析问题
import { getAppBySubdomain } from '@btc/shared-core/configs/app-scanner';
// layout-app 使用最小化配置，不加载 system-app 的路由（避免加载业务逻辑）
import router from './router';
import { isMainApp as unifiedIsMainApp, getEnvironment } from '@btc/shared-core/configs/unified-env-config';
import { setupStore, setupUI, setupI18n, setupEps } from '@system/bootstrap/core';
import { initSettingsConfig } from '@system/plugins/user-setting/composables/useSettingsState';
import { appStorage } from '@system/utils/app-storage';
// 导入 layout-app 的通用插件注册函数
import { registerLayoutPlugins } from './plugins';
import { storage } from '@btc/shared-core/utils';
import { MenuThemeEnum, SystemThemeEnum } from '@system/plugins/user-setting/config/enums';
// 导入 layout-app 自己的 EPS service 和域列表工具函数
import { service } from './services/eps';
// 使用包的 exports 路径导入 mitt
import { mitt } from '@btc/shared-components';
import 'virtual:svg-icons';
// 注意：Element Plus 样式已在主应用中全局导入，layout-app 作为独立应用可以保留导入
// 但如果 layout-app 是通过主应用加载的，应该移除这里的导入以避免重复
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
// 关键：shared-components/styles/index.scss 中已经包含了 menu-themes.scss
// 不再需要单独引入 @system/styles/menu-themes.scss，避免跨应用引用导致的打包问题
import '@btc/shared-components/styles/index.scss';
import { tSync } from './i18n/getters';

registerAppEnvAccessors();

// layout-app 作为 UI 容器：不在这里写 document.title，也不在这里主动注册任何子应用菜单/Tab。

// 关键：设置 layout-app 自己的标识，让 AppLayout 知道这是 layout-app 自己运行
// 这样 AppLayout 就不会隐藏 Topbar 和 MenuDrawer
(window as any).__IS_LAYOUT_APP__ = true;

// 关键：注入 isMainApp 函数到 shared-components，确保在子域名直达时 #subapp-viewport 可见
// 注意：这里必须使用"静态导入 + 同步注入"，避免嵌入到子应用域名时动态 chunk 路径解析失败导致注入不生效。
const layoutIsMainApp = (
  routePath?: string,
  locationPath?: string,
  isStandalone?: boolean,
): boolean => {
  // 关键：如果 hostname 匹配某个子应用的 subdomain，强制返回 false（生产环境和预览环境都需要检查）
  // 在生产环境中，通过子域名访问时路径是 /，必须通过子域名识别
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const appBySubdomain = getAppBySubdomain(hostname);
    if (appBySubdomain && appBySubdomain.type === 'sub') {
      // 是子应用的子域名，返回 false（不是主应用）
      return false;
    }
  }

  // 其他情况使用统一的 isMainApp 判断逻辑
  const result = unifiedIsMainApp(routePath, locationPath, isStandalone);
  if (import.meta.env.DEV || (typeof window !== 'undefined' && !(window as any).__LAYOUT_IS_MAIN_APP_DEBUG_LOGGED__)) {
    console.info(`[layout-app] ${tSync('common.error.using_unified_logic')}`, {
      routePath,
      locationPath,
      isStandalone,
      result
    });
    if (typeof window !== 'undefined') {
      (window as any).__LAYOUT_IS_MAIN_APP_DEBUG_LOGGED__ = true;
    }
  }
  return result;
};
setIsMainAppFn(layoutIsMainApp);

/**
 * 判断 layout-app 是否被子应用嵌入（而非独立运行）
 * 嵌入模式的特征：
 * 1. __LAYOUT_APP_MOUNT_TARGET__ 设置为 '#app'（由 loadLayoutApp 设置）
 * 2. hostname 不是 layout-app 自己的域名（layout.bellis.com.cn 或 localhost:4188/4192）
 * 3. hostname 匹配某个子应用的 subdomain（如 finance.bellis.com.cn）
 */
function isEmbeddedBySubApp(): boolean {
  // 最高优先级：子应用显式声明嵌入模式（由各子应用的 initLayoutApp 设置）
  if (typeof window !== 'undefined' && (window as any).__BTC_LAYOUT_APP_EMBEDDED_BY_SUBAPP__) {
    return true;
  }

  const mountTarget = (window as any).__LAYOUT_APP_MOUNT_TARGET__;

  // 如果没有设置 mountTarget，说明是独立运行模式
  if (mountTarget !== '#app') {
    return false;
  }

  // 检查 hostname 是否是 layout-app 自己的域名
  const env = getEnvironment();
  const hostname = window.location.hostname;
  const port = window.location.port || '';

  const isLayoutAppDomain =
    (env === 'production' && hostname === 'layout.bellis.com.cn') ||
    (env === 'test' && hostname === 'layout.test.bellis.com.cn') ||
    (env === 'preview' && port === '4192') ||
    (env === 'development' && port === '4188');

  // 如果是 layout-app 自己的域名，不是嵌入模式
  if (isLayoutAppDomain) {
    return false;
  }

  // 检查 hostname 是否匹配某个子应用的 subdomain（生产环境）
  if (import.meta.env.PROD) {
    const appBySubdomain = getAppBySubdomain(hostname);
    if (appBySubdomain && appBySubdomain.type === 'sub') {
      return true; // 是子应用的子域名，且 mountTarget 是 #app，说明是嵌入模式
    }
  }

  // 其他情况：如果 mountTarget 是 #app 但不在生产环境，也可能是嵌入模式（开发/预览环境）
  // 这里保守判断：只要 mountTarget 是 #app 且不是 layout-app 域名，就认为是嵌入模式
  return true;
}

/**
 * 获取应用入口地址
 */
const getAppEntry = (appName: string): string => {
  const fullAppName = `${appName}-app`;
  const appConfig = getAppConfig(fullAppName);

  if (!appConfig) {
    const fallbackUrl = `/${appName}/`;
    return fallbackUrl;
  }

  // 生产环境：直接使用子域名根路径，构建产物直接部署到子域名根目录
  if (import.meta.env.PROD) {
    if (appConfig.prodHost) {
      const protocol = typeof window !== 'undefined' && window.location.protocol
        ? window.location.protocol
        : 'https:';
      const entryUrl = `${protocol}//${appConfig.prodHost}/`;
      return entryUrl;
    }
    const fallbackUrl = `/${appName}/`;
    return fallbackUrl;
  }

  // 开发/预览环境：使用配置的开发端口或预览端口
  // 关键：根据当前环境判断使用开发端口还是预览端口
  // 优先使用 import.meta.env.DEV 判断（最准确），然后根据端口判断
  const isDevMode = import.meta.env.DEV;
  const currentPort = typeof window !== 'undefined' ? window.location.port || '' : '';
  const isPreview = !isDevMode && currentPort.startsWith('41');
  const isDev = isDevMode || currentPort.startsWith('80');

  if (isPreview) {
    // 预览环境：使用预览端口
    const entryUrl = `http://${appConfig.preHost}:${appConfig.prePort}`;
    return entryUrl;
  } else {
    // 开发环境：使用开发端口
    const entryUrl = `//${appConfig.devHost}:${appConfig.devPort}`;
    return entryUrl;
  }
};

let settingsInitialized = false;

function ensureDefaultSettings() {
  const settings = (storage.get('settings') as Record<string, any> | null) ?? {};
  let changed = false;
  if (!settings.menuThemeType) {
    settings.menuThemeType = MenuThemeEnum.DARK;
    changed = true;
  }
  if (!settings.systemThemeType) {
    settings.systemThemeType = SystemThemeEnum.DARK;
    changed = true;
  }
  if (!settings.systemThemeMode) {
    settings.systemThemeMode = SystemThemeEnum.DARK;
    changed = true;
  }
  if (changed) {
    storage.set('settings', settings);
  }
}

const initLayoutEnvironment = async (appInstance: VueApp) => {
  if (import.meta.env.DEV) {
    console.info(`[layout-app] ${tSync('common.error.init_environment_started')}`);
  }

  // 关键：在初始化开始时就设置全局依赖，确保在 Vue 应用创建之前这些依赖就已存在
  // layout-app 作为容器：不提供实际业务行为（logout/logo 等由子应用提供）
  // 仅提供空兜底，避免 shared-components 调用时报错
  if (!(window as any).__APP_LOGOUT__) {
    (window as any).__APP_LOGOUT__ = async () => {};
  }
  if (!(window as any).__APP_GET_LOGO_URL__) {
    (window as any).__APP_GET_LOGO_URL__ = () => '';
  }

  // 关键：在初始化开始时就创建并设置事件总线，确保在 Vue 应用创建之前事件总线就已存在
  // 这样子应用的 UserInfo 组件就能立即访问到事件总线
  if (!(window as any).__APP_EMITTER__) {
    const emitter = mitt();
    (window as any).__APP_EMITTER__ = emitter;

    // 关键：添加全局 window 事件监听器作为兜底方案，确保即使事件总线未正确初始化也能工作
    // 监听 'open-preferences-drawer' 事件，直接触发 layout-app 的偏好设置抽屉
    window.addEventListener('open-preferences-drawer', () => {
      // 通过事件总线触发（如果存在）
      if ((window as any).__APP_EMITTER__) {
        (window as any).__APP_EMITTER__.emit('open-preferences-drawer');
      }
    });

    // 关键：监听子应用的路由变化事件，更新标题/Tab/面包屑
    // 子应用通过 window.dispatchEvent(new CustomEvent('subapp:route-change', {detail: {...}})) 上报路由 meta
    window.addEventListener('subapp:route-change', ((event: CustomEvent) => {
      const detail = event.detail;
      if (!detail || typeof detail !== 'object') {
        return;
      }

      // 更新 document.title（如果子应用提供了 meta.labelKey）
      if (detail.meta?.labelKey && typeof detail.meta.labelKey === 'string') {
        // 使用全局 i18n 实例更新标题（如果存在）
        try {
          const i18n = (window as any).__APP_I18N__;
          if (i18n && typeof i18n.global?.t === 'function') {
            const title = i18n.global.t(detail.meta.labelKey);
            if (title && title !== detail.meta.labelKey) {
              document.title = title;
            }
          }
        } catch (error) {
          // 静默失败
        }
      }

      // 关键：更新 Tab 和面包屑（通过 Process Store）
      // 动态导入避免循环依赖
      (async () => {
        try {
          const { useProcessStore, getCurrentAppFromPath } = await import('@btc/shared-components');
          const process = useProcessStore();
          const app = getCurrentAppFromPath(detail.path);

          // 如果是子应用首页，将该应用的所有标签设为未激活
          if (detail.meta?.isHome === true) {
            process.list.forEach((tab: any) => {
              if (tab.app === app) {
                tab.active = false;
              }
            });
            return;
          }

          // 排除无效应用（main）和文档域（docs）
          if (app === 'main' || app === 'docs') {
            return;
          }

          // 添加标签到 Process Store
          process.add({
            path: detail.path,
            fullPath: detail.fullPath,
            name: detail.name,
            meta: detail.meta,
          });
        } catch (error) {
          // 静默失败，避免影响其他功能
          if (import.meta.env.DEV) {
            console.warn(`[layout-app] ${tSync('common.error.subapp_route_change_failed')}:`, error);
          }
        }
      })();

      if (import.meta.env.DEV) {
        console.info(`[layout-app] ${tSync('common.error.subapp_route_change_received')}:`, detail);
      }
    }) as EventListener);
  }

  if (!settingsInitialized) {
    appStorage.init();
    ensureDefaultSettings();
    initSettingsConfig();
    settingsInitialized = true;

    // 将必要的对象暴露到全局，供 shared-components 使用
    (window as any).__APP_STORAGE__ = appStorage;
    (window as any).appStorage = appStorage;

    // 提供 EPS service / finishLoading 的兜底实现，避免布局应用缺少全局依赖
    if (!(window as any).__APP_EPS_SERVICE__) {
      (window as any).__APP_EPS_SERVICE__ = null;
    }
    if (!(window as any).__APP_FINISH_LOADING__) {
      (window as any).__APP_FINISH_LOADING__ = () => {};
    }

    // 关键：在 layout-app 初始化时同步创建菜单注册表，确保菜单注册表在组件渲染前已存在
    // 这样后续的菜单注册就能正确工作
    // 关键：layout-app 不应提前注册任何子应用菜单/Tab。
    // 菜单、Tab、面包屑等都由子应用在自身 bootstrap 时注册/派发事件提供。
    // 这里仅确保菜单注册表存在，必须在组件渲染前完成初始化
    await import('@btc/shared-components').then(async (module) => {
      try {
        if (module.getMenuRegistry) {
          // 关键：优先使用已存在的全局注册表，确保与子应用使用同一个实例
          let registry: any;
          if (typeof window !== 'undefined' && (window as any).__BTC_MENU_REGISTRY__) {
            // 使用已存在的全局注册表（可能由其他模块创建）
            registry = (window as any).__BTC_MENU_REGISTRY__;
            if (import.meta.env.DEV) {
              console.info(`[layout-app] ${tSync('common.error.menu_registry_using_existing')}`);
            }
          } else {
            // 如果全局不存在，创建新的并挂载到全局对象
            registry = module.getMenuRegistry();
            if (typeof window !== 'undefined') {
              (window as any).__BTC_MENU_REGISTRY__ = registry;
            }
            if (import.meta.env.DEV) {
              console.info(`[layout-app] ${tSync('common.error.menu_registry_creating_new')}`);
            }
          }

          // 确保注册表已正确初始化
          if (registry && registry.value) {
            // 验证注册表结构
            const keys = Object.keys(registry.value);
            if (import.meta.env.DEV) {
              console.info(`[layout-app] ${tSync('common.error.menu_registry_initialized')}:`, keys);
            }
          }
        }
      } catch (error) {
        logger.error(`[layout-app] ${tSync('common.error.menu_registry_init_failed')}:`, error);
      }
    }).catch((error) => {
      logger.error('[layout-app] 菜单注册表初始化失败:', error);
    });
  }
  setupEps(appInstance);
  setupStore(appInstance);
  // 使用 layout-app 自己的最小化路由，不使用 system-app 的 setupRouter
  appInstance.use(router);
  setupUI(appInstance);
  setupI18n(appInstance);

  // EPS service 已经在 ./services/eps.ts 中导入时就暴露到全局了
  // 这里再次确认一下，确保服务已经暴露
  if (!(window as any).__APP_EPS_SERVICE__ || Object.keys((window as any).__APP_EPS_SERVICE__ || {}).length === 0) {
    (window as any).__APP_EPS_SERVICE__ = service;
    (window as any).service = service;
    (window as any).__BTC_SERVICE__ = service;
  }

  // 注意：不再需要将 @btc/shared-core 暴露到全局变量
  // 因为所有应用（包括子应用）都单独打包 @btc/* 包，不再需要从全局变量访问

  // layout-app 作为容器：不提供域列表/应用配置等业务数据（由子应用提供）。
  // 仅提供空兜底，避免 shared-components 调用时报错。
  if (!(window as any).__APP_GET_DOMAIN_LIST__) {
    (window as any).__APP_GET_DOMAIN_LIST__ = async () => [];
  }
  if (!(window as any).__APP_GET_APP_CONFIG__) {
    (window as any).__APP_GET_APP_CONFIG__ = () => null;
  }

  // 等待插件注册完成（必须在应用挂载之前完成）
  await registerLayoutPlugins(appInstance).catch(() => {
    // 静默失败
  });

  // 注意：user-check 轮询由主应用（main-app）统一管理，layout-app 不需要启动

  // 注意：DevTools 现在直接在 App.vue 中使用，不再需要在这里挂载
  // 这样可以确保 DevTools 在路由切换时不会卸载
};

let app: ReturnType<typeof createApp> | null = null;
let microAppsRegistered = false;
let qiankunStarted = false;

/**
 * 注册所有子应用（不包括 main-app）
 *
 * layout-app 只服务于子应用的独立访问
 * main-app 是主应用，有自己的布局，不需要 layout-app
 */
const ensureMicroAppsRegistered = async () => {
  if (microAppsRegistered) {
    return;
  }

  // 获取当前域名，判断应该加载哪个子应用（使用应用扫描器，顶层已导入）
  const hostname = window.location.hostname;

  // 优先从 URL 参数获取要加载的应用（用于预览环境测试）
  const urlParams = new URLSearchParams(window.location.search);
  const appFromUrl = urlParams.get('app');

  // 从域名映射获取，如果不在生产环境域名中，则使用路径前缀判断（和汉堡菜单一样）
  const appBySubdomain = getAppBySubdomain(hostname);
  let targetApp = appBySubdomain?.id;

  if (!targetApp) {
    // 优先从 URL 参数获取要加载的应用（用于预览环境测试）
    if (appFromUrl) {
      targetApp = appFromUrl;
    } else {
      // 开发/预览环境：根据路径前缀判断应该加载哪个子应用（和汉堡菜单一样）
      const pathname = window.location.pathname;
      if (pathname.startsWith('/admin')) {
        targetApp = 'admin';
      } else if (pathname.startsWith('/logistics')) {
        targetApp = 'logistics';
      } else if (pathname.startsWith('/engineering')) {
        targetApp = 'engineering';
      } else if (pathname.startsWith('/quality')) {
        targetApp = 'quality';
      } else if (pathname.startsWith('/production')) {
        targetApp = 'production';
      } else if (pathname.startsWith('/finance')) {
        targetApp = 'finance';
      } else if (pathname.startsWith('/monitor')) {
        targetApp = 'monitor';
      } else {
        // 默认加载 logistics-app（用于预览环境测试）
        targetApp = 'logistics';
      }
    }
  }

  // 加载超时定时器
  let loadingTimeout: ReturnType<typeof setTimeout> | null = null;

  const clearLoadingState = () => {
    const viewport = document.querySelector('#subapp-viewport');
    if (viewport) {
      viewport.removeAttribute('data-qiankun-loading');
    }
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }
  };

  // 根据环境设置超时时间：生产环境3秒，开发环境10秒（缩短超时时间，快速清除loading）
  const isDev = import.meta.env.DEV;
  const LOADING_TIMEOUT = isDev ? 10000 : 3000;

  // 确保容器在注册前就可见（提前设置，避免 qiankun 查找时容器被隐藏）
  // 使用双重 requestAnimationFrame 确保 Vue 的响应式更新完成
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const viewport = document.querySelector('#subapp-viewport') as HTMLElement;
        if (viewport) {
          viewport.setAttribute('data-qiankun-loading', 'true');
          viewport.style.setProperty('display', 'flex', 'important');
          viewport.style.setProperty('visibility', 'visible', 'important');
          viewport.style.setProperty('opacity', '1', 'important');
          // 触发自定义事件，通知 Layout 组件立即更新状态
          window.dispatchEvent(new CustomEvent('qiankun:before-load', {
            detail: { appName: `${targetApp}-app` }
          }));
        }
        resolve();
      });
    });
  });

  // 注册子应用
  // 生产环境：只注册当前域名对应的子应用
  // 开发/预览环境：注册所有子应用，使用动态 activeRule 根据路径判断应该激活哪个应用
  const subApps: any[] = [];

  if (targetApp && (import.meta.env.PROD || appBySubdomain)) {
    // 生产环境或子域名环境：只注册当前域名对应的子应用
    // 关键：根据环境设置合理的超时时间，避免生产环境因网络延迟导致超时
    const isDev = import.meta.env.DEV;
    const defaultTimeout = isDev ? 8000 : 15000; // 开发环境 8 秒，生产环境 15 秒

    subApps.push({
      name: `${targetApp}-app`,
      entry: getAppEntry(targetApp),
      container: '#subapp-viewport',
      activeRule: () => true, // 当前域名只加载对应的子应用，永远激活
      // 配置生命周期超时时间（single-spa 格式）
      // 关键：设置合理的超时时间，避免过早警告和超时
      timeouts: {
        bootstrap: {
          millis: defaultTimeout * 2, // bootstrap 阶段需要更多时间（包括模块加载）
          dieOnTimeout: false, // 超时后不终止应用，只警告（避免因网络问题导致应用无法加载）
          warningMillis: Math.floor(defaultTimeout * 1.5), // 警告时间：避免过早警告（ES 模块加载阶段也会计入时间）
        },
        mount: {
          millis: defaultTimeout,
          dieOnTimeout: false,
          warningMillis: Math.floor(defaultTimeout * 0.8),
        },
        unmount: {
          millis: 5000, // 增加到 5 秒，确保卸载完成
          dieOnTimeout: false,
          warningMillis: 4000,
        },
      },
      props: {
        onReady: () => {
          clearLoadingState();
          setTimeout(() => {
            const viewport = document.querySelector('#subapp-viewport');
            if (viewport && viewport.hasAttribute('data-qiankun-loading')) {
              viewport.removeAttribute('data-qiankun-loading');
            }
          }, 50);
        },
      },
    });
  } else {
    // 开发/预览环境：注册所有子应用，使用动态 activeRule
    // 关键：根据环境设置合理的超时时间，避免生产环境因网络延迟导致超时
    const isDev = import.meta.env.DEV;
    const defaultTimeout = isDev ? 8000 : 15000; // 开发环境 8 秒，生产环境 15 秒

    // 注册子应用（不包括 system-app，因为 system-app 是基座应用，由它自己注册其他子应用）
    const allApps = ['admin', 'logistics', 'engineering', 'quality', 'production', 'finance', 'monitor', 'operations', 'dashboard', 'personnel'];
    allApps.forEach((appName) => {
      subApps.push({
        name: `${appName}-app`,
        entry: getAppEntry(appName),
        container: '#subapp-viewport',
        activeRule: () => {
          // 关键：使用 window.location.pathname 确保获取最新的路径
          // 这样即使在同一应用内路由切换时，activeRule 也能正确返回 true
          const pathname = window.location.pathname;
          if (appName === 'admin' && pathname.startsWith('/admin')) return true;
          if (appName === 'logistics' && pathname.startsWith('/logistics')) return true;
          if (appName === 'engineering' && pathname.startsWith('/engineering')) return true;
          if (appName === 'quality' && pathname.startsWith('/quality')) return true;
          if (appName === 'production' && pathname.startsWith('/production')) return true;
          if (appName === 'finance' && pathname.startsWith('/finance')) return true;
          if (appName === 'monitor' && pathname.startsWith('/monitor')) return true;
          if (appName === 'operations' && pathname.startsWith('/operations')) return true;
          if (appName === 'dashboard' && pathname.startsWith('/dashboard')) return true;
          if (appName === 'personnel' && pathname.startsWith('/personnel')) return true;
          return false;
        },
        // 配置生命周期超时时间（single-spa 格式）
        // 关键：设置合理的超时时间，避免过早警告和超时
        timeouts: {
          bootstrap: {
            millis: defaultTimeout * 2, // bootstrap 阶段需要更多时间（包括模块加载）
            dieOnTimeout: false, // 超时后不终止应用，只警告（避免因网络问题导致应用无法加载）
            warningMillis: Math.floor(defaultTimeout * 1.5), // 警告时间：避免过早警告（ES 模块加载阶段也会计入时间）
          },
          mount: {
            millis: defaultTimeout,
            dieOnTimeout: false,
            warningMillis: Math.floor(defaultTimeout * 0.8),
          },
          unmount: {
            millis: 5000, // 增加到 5 秒，确保卸载完成
            dieOnTimeout: false,
            warningMillis: 4000,
          },
        },
        props: {
          onReady: () => {
            clearLoadingState();
            setTimeout(() => {
              const viewport = document.querySelector('#subapp-viewport');
              if (viewport && viewport.hasAttribute('data-qiankun-loading')) {
                viewport.removeAttribute('data-qiankun-loading');
              }
            }, 50);
          },
        },
      });
    });
  }

  registerMicroApps(
    subApps,
    {
      beforeLoad: [async (_app: any) => {
        // 关键：确保应用级别loading已显示，然后再显示容器
        // 检查应用级别loading是否已显示
        const appLoadingEl = document.querySelector('.app-loading') as HTMLElement;
        const isAppLoadingVisible = appLoadingEl && window.getComputedStyle(appLoadingEl).display !== 'none';

        // 如果应用级别loading未显示，先隐藏容器，等待loading显示
        const viewport = document.querySelector('#subapp-viewport');
        if (viewport) {
          viewport.setAttribute('data-qiankun-loading', 'true');
          if (!isAppLoadingVisible) {
            // 应用级别loading未显示，先隐藏容器
            (viewport as HTMLElement).style.setProperty('display', 'none', 'important');
            (viewport as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
            (viewport as HTMLElement).style.setProperty('opacity', '0', 'important');
          } else {
            // 应用级别loading已显示，可以显示容器
            (viewport as HTMLElement).style.setProperty('display', 'flex', 'important');
            (viewport as HTMLElement).style.setProperty('visibility', 'visible', 'important');
            (viewport as HTMLElement).style.setProperty('opacity', '1', 'important');
          }
        }

        // 设置超时保护：生产环境15秒，开发环境30秒后自动清除 loading 状态
        loadingTimeout = setTimeout(() => {
          clearLoadingState();
        }, LOADING_TIMEOUT);

        // layout-app 作为容器：不在这里提前注册子应用菜单/Tab（由子应用自行提供）。
      }],
      beforeMount: [async (_app: any) => {
        // 子应用准备挂载
      }],
      afterMount: [async (_app: any) => {
        // 关键：确保 CSS 变量能够传递到子应用容器
        // 在 qiankun 环境下，CSS 变量需要从父元素显式传递
        const viewport = document.querySelector('#subapp-viewport');
        if (viewport) {
          const htmlElement = document.documentElement;
          const computedStyle = getComputedStyle(htmlElement);

          // 获取主应用的 CSS 变量值
          const bgColorPage = computedStyle.getPropertyValue('--el-bg-color-page') || computedStyle.getPropertyValue('--el-bg-color') || '#0a0a0a';
          const bgColor = computedStyle.getPropertyValue('--el-bg-color') || '#0a0a0a';

          // 设置到子应用容器，确保子应用能够继承
          (viewport as HTMLElement).style.setProperty('--el-bg-color-page', bgColorPage);
          (viewport as HTMLElement).style.setProperty('--el-bg-color', bgColor);
        }

        // 关键：强制清除 loading 状态（兜底机制，即使 onReady 未被调用）
        // 使用 setTimeout 确保在下一个事件循环中清除，给子应用一些时间完成初始化
        setTimeout(() => {
          clearLoadingState();
        }, 100);

        // layout-app 作为容器：不在 afterMount 中注册/重试注册子应用菜单与 Tab（由子应用自行提供）。
      }],
      // 关键：添加错误处理钩子，处理子应用加载失败的情况
      // 注意：qiankun 的类型定义可能不完整，使用类型断言
      onError: [
        async (error: any, app: any) => {
          // 子应用加载失败：立即清除 loading 状态
          clearLoadingState();
          logger.error(`[layout-app] ${tSync('common.error.subapp_load_failed')} ${app?.name}:`, error);

          // 设置全局状态，标记加载失败
          (window as any).__LAYOUT_APP_QIANKUN_LOAD_FAILED__ = true;

          // 延迟检查，如果3秒后子应用仍未加载成功，显示404
          setTimeout(() => {
            const viewport = document.querySelector('#subapp-viewport');
            const hasContent = viewport && viewport.children.length > 0;
            const currentPath = window.location.pathname;

            // 检查是否是子应用路由
            const knownSubAppPrefixes = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance', '/monitor', '/docs'];
            const isSubAppRoute = knownSubAppPrefixes.some(prefix => currentPath.startsWith(prefix));

            if (isSubAppRoute && !hasContent && currentPath !== '/404') {
              // 重定向到404页面
              router.push('/404');
            }
          }, 3000);
        },
      ],
    } as any, // 类型断言：qiankun 实际支持 onError，但类型定义可能不完整
  );

  microAppsRegistered = true;

  if (!qiankunStarted) {
    // 使用统一的沙箱配置，避免样式隔离不一致导致的样式引擎累积
    const { getQiankunSandboxConfig } = await import('@btc/shared-core');
    const sandboxConfig = getQiankunSandboxConfig();

    start({
      sandbox: sandboxConfig,
      singular: true, // 同一时间只运行一个子应用
      prefetch: false, // 禁用预加载，避免不必要的资源加载
      // 注意：子应用的超时时间通过各应用导出的 timeouts 配置来设置
      // single-spa 会自动读取子应用 default 导出中的 timeouts 配置
      // 关键：配置 importEntryOpts，确保正确处理子应用的 HTML 模板和资源路径
      // @ts-expect-error - importEntryOpts 在 qiankun 2.10.16 的类型定义中不存在，但实际可用
      importEntryOpts: {
        scriptType: 'module', // 强制使用 module 类型
        // 自定义 fetch：确保脚本以正确的方式加载
        fetch: (url: string, options?: RequestInit) => {
          return fetch(url, {
            ...options,
            mode: 'cors',
            credentials: 'same-origin',
          });
        },
        // 自定义 getTemplate：处理子应用的 HTML 模板，修复资源路径
        getTemplate: (tpl: string, entry?: string) => {
          let processedTpl = tpl;

          // 如果提供了 entry，计算 base URL
          if (entry) {
            try {
              const entryUrl = new URL(entry, window.location.href);
              const entryOrigin = entryUrl.origin;
              // base URL 应该是 entry 的目录路径
              const baseHref = entryUrl.pathname.endsWith('/')
                ? entryUrl.pathname
                : entryUrl.pathname + '/';

              // 移除旧的 base 标签
              processedTpl = processedTpl.replace(/<base[^>]*>/gi, '');

              // 在 <head> 标签内添加新的 <base> 标签
              if (processedTpl.includes('<head')) {
                processedTpl = processedTpl.replace(
                  /(<head[^>]*>)/i,
                  `$1\n    <base href="${baseHref}">`
                );
              } else if (processedTpl.includes('<html')) {
                processedTpl = processedTpl.replace(
                  /(<html[^>]*>)/i,
                  `$1\n  <base href="${baseHref}">`
                );
              }

              // 关键：修复所有 link 标签中的 href 路径（CSS 文件、modulepreload 等）
              // 1) 子应用的 /assets/* 必须带上 entry 的 origin，否则会被宿主（layout）解析到 layout 域名，导致 404
              // 2) 其他相对路径仍转换为绝对路径（以 / 开头），避免在子路由下资源路径被错误解析
              processedTpl = processedTpl.replace(
                /<link([^>]*?)\s+href\s*=\s*["']([^"']+)["']([^>]*)>/gi,
                (match, before, href, after) => {
                  // 如果 href 已经是完整 URL，直接返回
                  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
                    return match;
                  }

                  // 子应用静态资源（绝对/相对）：/assets/*、assets/*、./assets/*、../assets/* 都必须拼接 entry origin
                  if (href.startsWith('/assets/')) {
                    return `<link${before} href="${entryOrigin}${href}"${after}>`;
                  }
                  if (/^(\.\/|\.\.\/)?assets\//.test(href)) {
                    try {
                      const resolved = new URL(href, `${entryOrigin}${baseHref}`).toString();
                      return `<link${before} href="${resolved}"${after}>`;
                    } catch {
                      const fixedHref = '/' + href.replace(/^(\.\/|\.\.\/)+/, '');
                      return `<link${before} href="${entryOrigin}${fixedHref}"${after}>`;
                    }
                  }

                  // 如果 href 已经是绝对路径（以 / 开头），保持原样（非 assets 的绝对路径交给宿主处理）
                  if (href.startsWith('/')) {
                    return match;
                  }

                  // 如果 href 是相对路径（不以 / 开头），转换为绝对路径
                  // 关键：确保所有资源路径都是绝对路径，避免在子路由下被错误解析
                  const fixedHref = '/' + href;
                  return `<link${before} href="${fixedHref}"${after}>`;
                }
              );

              // 关键：修复所有 script 标签中的 src 路径
              // 1) 子应用的 /assets/* 必须带上 entry 的 origin，否则会被宿主（layout）解析到 layout 域名，导致 404
              // 2) 其他相对路径仍转换为绝对路径（以 / 开头），避免在子路由下资源路径被错误解析
              processedTpl = processedTpl.replace(
                /<script([^>]*?)\s+src\s*=\s*["']([^"']+)["']([^>]*)>/gi,
                (match, before, src, after) => {
                  // 如果 src 已经是完整 URL，直接返回
                  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
                    return match;
                  }

                  // 子应用静态资源（绝对/相对）：/assets/*、assets/*、./assets/*、../assets/* 都必须拼接 entry origin
                  if (src.startsWith('/assets/')) {
                    return `<script${before} src="${entryOrigin}${src}"${after}>`;
                  }
                  if (/^(\.\/|\.\.\/)?assets\//.test(src)) {
                    try {
                      const resolved = new URL(src, `${entryOrigin}${baseHref}`).toString();
                      return `<script${before} src="${resolved}"${after}>`;
                    } catch {
                      const fixedSrc = '/' + src.replace(/^(\.\/|\.\.\/)+/, '');
                      return `<script${before} src="${entryOrigin}${fixedSrc}"${after}>`;
                    }
                  }

                  // 如果 src 已经是绝对路径（以 / 开头），保持原样（非 assets 的绝对路径交给宿主处理）
                  if (src.startsWith('/')) {
                    return match;
                  }

                  // 如果 src 是相对路径（不以 / 开头），转换为绝对路径
                  // 关键：确保所有资源路径都是绝对路径，避免在子路由下被错误解析
                  const fixedSrc = '/' + src;
                  return `<script${before} src="${fixedSrc}"${after}>`;
                }
              );

              // 关键：修复内联 module 脚本中的 import('/assets/xxx.js')
              // 说明：qiankun/import-html-entry 会把内联脚本包装成 VM 执行；如果这里仍是绝对路径 /assets/，
              // 就会被宿主（layout 域名）解析，导致 layout 去请求子应用的 chunk（404）。
              // 这里强制把 /assets/* 改成 ${entryOrigin}/assets/*，确保永远从子应用域名取资源。
              processedTpl = processedTpl.replace(
                /import\(\s*(['"])(\/assets\/[^'"]+)\1\s*\)/g,
                (_match, quote, path) => {
                  return `import(${quote}${entryOrigin}${path}${quote})`;
                }
              );

            } catch (error) {
              // 静默失败
            }
          }

          // 确保所有 script 标签都有 type="module"
          processedTpl = processedTpl.replace(
            /<script(\s+[^>]*)?>/gi,
            (match, attrs = '') => {
              // 跳过内联脚本（没有 src 属性）
              if (!match.includes('src=')) {
                return match;
              }
              // 如果已经有 type 属性，替换为 module
              if (attrs && attrs.includes('type=')) {
                return match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"');
              }
              // 如果没有 type 属性，添加 type="module"
              return `<script type="module"${attrs}>`;
            }
          );

          return processedTpl;
        },
      },
    });
    qiankunStarted = true;

    // 关键：不要在 registerMicroApps + start() 后再手动 loadMicroApp，否则会导致同一子应用重复 bootstrap/mount，
    // 进而出现菜单/汉堡按钮重复加载、single-spa 超时（#31/#41）以及 Vue patch 空节点错误。
    // 这里仅触发一次 reroute，让 qiankun 按 activeRule 正常挂载对应子应用即可。
    import('vue').then(({ nextTick }) => {
      nextTick(() => {
        window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
      });
    });
  }
};

function bootstrap() {
  return Promise.resolve();
}

async function mount(props: any) {
  // 关键：qiankun 会通过 props.container 传递容器元素
  // 当 layout-app 被其他应用通过 qiankun 加载时，容器应该是 #app
  // 如果 props.container 不存在，尝试查找 #app 容器
  let container = props?.container as HTMLElement;

  if (!container) {
    // 尝试查找 #app 容器（子应用的根容器）
    container = document.querySelector('#app') as HTMLElement;
  }

  // 如果还是找不到，尝试查找 #layout-container（独立运行时的容器）
  if (!container) {
    container = document.querySelector('#layout-container') as HTMLElement;
  }

  if (!container) {
    throw new Error(`[layout-app] ${tSync('common.error.layout_container_not_found')}`);
  }

  // 验证容器 ID，确保挂载位置正确
  if (container.id !== 'app' && container.id !== 'layout-container') {
    // 如果容器 ID 不正确，尝试查找正确的容器
    const correctContainer = document.querySelector('#app') as HTMLElement;
    if (correctContainer && document.body.contains(correctContainer)) {
      container = correctContainer;
    } else {
      throw new Error(`布局容器 ID 不正确: 期望 #app 或 #layout-container，实际为 #${container.id || 'unknown'}`);
    }
  }

  if (!app) {
    app = createApp(App);

    // 关键：添加全局错误处理，捕获所有子应用的 DOM 操作错误
    // 这些错误通常发生在组件更新时 DOM 节点已被移除的情况（如子应用卸载时）
    app.config.errorHandler = (err, _instance, info) => {
      // 检查是否是 DOM 操作相关的错误
      const errMessage = err instanceof Error ? err.message : String(err);
      if (errMessage.includes('insertBefore') ||
          errMessage.includes('processCommentNode') ||
          errMessage.includes('patch') ||
          errMessage.includes('__vnode') ||
          errMessage.includes('Cannot read properties of null') ||
          errMessage.includes('Cannot set properties of null') ||
          errMessage.includes('reading \'insertBefore\'') ||
          errMessage.includes('reading \'emitsOptions\'') ||
          (errMessage.includes('TypeError') && errMessage.includes('null'))) {
        // DOM 操作错误，可能是容器在更新时被移除或组件正在卸载
        // 静默处理，避免影响用户体验
        // 这些错误通常在子应用切换或卸载时发生，属于正常现象
        return;
      }

      // 其他错误正常处理（可以记录日志或上报）
      if (import.meta.env.DEV) {
        logger.error(`[layout-app] ${tSync('common.error.vue_error')}:`, err, info);
      }
    };

    // 等待初始化完成（包括插件注册）
    await initLayoutEnvironment(app);
    app.mount(container);
  }

  // 如果 layout-app 是被其他应用通过 qiankun 加载的，不应该再注册子应用
  // 因为子应用已经在运行了（它加载了 layout-app），子应用应该直接挂载到 layout-app 的 #subapp-viewport 中
  // 子应用的挂载由子应用自己处理（通过 props.container 获取 #subapp-viewport）
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    // 当 layout-app 作为 qiankun 子应用被加载时，不需要注册子应用
    // 子应用会通过自己的 mount 函数直接挂载到 layout-app 的 #subapp-viewport 中
    return;
  }

  // 关键：如果 layout-app 被子应用嵌入（通过 loadLayoutApp 加载到子应用的 #app），
  // 不应该再用 qiankun 二次加载子应用，避免双加载导致 DOM 操作冲突
  const embedded = isEmbeddedBySubApp();
  if (embedded) {
    // 嵌入模式：子应用会自己挂载到 #subapp-viewport，不需要通过 qiankun 加载
    if (import.meta.env.DEV) {
      console.info(`[layout-app] ${tSync('common.error.embedded_mode_detected')}`);
    }
    return;
  }

  // 只有在独立运行时才启动 qiankun 并注册所有业务子应用
  ensureMicroAppsRegistered();

  // 关键：添加全局错误监听，捕获子应用加载失败和 DOM 操作错误
  // 这作为最后的兜底机制，确保即使其他错误处理机制失效，loading 也能被清除
  const handleGlobalError = (event: ErrorEvent) => {
    // 检查是否是子应用相关的错误
    const errorMessage = event.message || '';
    const errorSource = event.filename || '';
    const errorStack = event.error?.stack || '';

    // 关键：捕获 DOM 操作相关的错误（这些错误通常发生在 Vue patch 过程中）
    if (
      errorMessage.includes('insertBefore') ||
      errorMessage.includes('processCommentNode') ||
      errorMessage.includes('patch') ||
      errorMessage.includes('Cannot read properties of null') ||
      errorMessage.includes('Cannot set properties of null') ||
      errorMessage.includes('reading \'insertBefore\'') ||
      errorMessage.includes('reading \'emitsOptions\'') ||
      errorStack.includes('insertBefore') ||
      errorStack.includes('processCommentNode') ||
      errorStack.includes('patch')
    ) {
      // DOM 操作错误，静默处理，避免影响用户体验
      event.preventDefault();
      event.stopPropagation();
      if (import.meta.env.DEV) {
        console.warn(`[layout-app] ${tSync('common.error.dom_operation_error')}:`, errorMessage);
      }
      return true; // 阻止默认错误处理
    }

    // 如果错误信息包含应用相关关键词，可能是子应用加载失败
    if (
      errorMessage.includes('application') ||
      errorMessage.includes('micro-app') ||
      errorMessage.includes('subapp') ||
      errorSource.includes('micro-apps')
    ) {
      // 清除 loading 状态
      const viewport = document.querySelector('#subapp-viewport');
      if (viewport && viewport.hasAttribute('data-qiankun-loading')) {
        viewport.removeAttribute('data-qiankun-loading');
      }
    }

    return false; // 其他错误继续正常处理
  };

  // 监听全局错误事件（使用捕获阶段，确保能捕获所有错误）
  window.addEventListener('error', handleGlobalError, true);

  // 监听未处理的 Promise 拒绝
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const errorMessage = reason?.message || String(reason);

      // 检查是否是子应用加载相关的 Promise 拒绝
      if (
        errorMessage.includes('application') ||
        errorMessage.includes('micro-app') ||
        errorMessage.includes('subapp') ||
        (reason?.stack && reason.stack.includes('micro-apps'))
      ) {
        // 清除 loading 状态
        const viewport = document.querySelector('#subapp-viewport');
        if (viewport && viewport.hasAttribute('data-qiankun-loading')) {
          viewport.removeAttribute('data-qiankun-loading');
        }
      }
  };

  window.addEventListener('unhandledrejection', handleUnhandledRejection);
}

async function unmount(_props: any) {
  if (app) {
    app.unmount();
    app = null;
  }
}

async function update(_props: any) {
  // layout-app 的 update 方法：当主应用更新 props 时调用
  // 目前 layout-app 不需要特殊的更新逻辑，保持空实现
  // 如果需要，可以在这里处理 props 更新（例如更新菜单、主题等）
}

// 使用 vite-plugin-qiankun 的 renderWithQiankun
renderWithQiankun({
  bootstrap,
  mount,
  update,
  unmount,
});

// 标准 ES 模块导出
export default { bootstrap, mount, unmount };

// 独立运行（非 qiankun 环境）
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  (async () => {
    // 检查是否设置了挂载目标（子应用环境）
    const mountTarget = (window as any).__LAYOUT_APP_MOUNT_TARGET__;
    let container: HTMLElement | null = null;

    if (mountTarget) {
      // 子应用环境：挂载到指定的容器（通常是 #app）
      // 关键：必须严格使用 mountTarget，不能回退到 #layout-container
      // 如果 mountTarget 是 '#app'，必须挂载到 #app，即使 #layout-container 存在
      container = document.querySelector(mountTarget) as HTMLElement;
      if (!container) {
        // 如果指定的容器不存在，尝试查找 #app（兜底）
        container = document.querySelector('#app') as HTMLElement;
        if (container && import.meta.env.DEV) {
          console.warn(`[layout-app] ${tSync('common.error.mount_target_not_found')} ${mountTarget}`);
        }
      }
      // 关键：验证容器 ID，确保挂载位置正确
      if (container && mountTarget === '#app' && container.id !== 'app') {
        // 如果 mountTarget 是 '#app' 但找到的容器不是 #app，这是错误的
        const correctContainer = document.querySelector('#app') as HTMLElement;
        if (correctContainer && document.body.contains(correctContainer)) {
          container = correctContainer;
          if (import.meta.env.DEV) {
            console.warn(`[layout-app] ${tSync('common.error.mount_container_corrected')}`);
          }
        } else {
          throw new Error(`[layout-app] 挂载目标 ${mountTarget} 不存在，且无法找到 #app 容器`);
        }
      }
    } else {
      // 独立运行环境：挂载到 #layout-container
      container = document.querySelector('#layout-container') as HTMLElement;
    }

    if (container) {
      app = createApp(App);
      // 等待初始化完成（包括插件注册）
      await initLayoutEnvironment(app);
      app.mount(container);

      // 关键：如果 layout-app 被子应用嵌入（通过 loadLayoutApp 加载到子应用的 #app），
      // 不应该再用 qiankun 二次加载子应用，避免双加载导致 DOM 操作冲突
      const embedded = isEmbeddedBySubApp();
      if (!embedded) {
        // 只有在非嵌入模式下才启动 qiankun 来加载子应用
        ensureMicroAppsRegistered();
      } else if (import.meta.env.DEV) {
        console.info(`[layout-app] ${tSync('common.error.embedded_mode_detected_standalone')}`);
      }
    } else {
      throw new Error(`[layout-app] ${tSync('common.error.mount_container_not_found')}`);
    }
  })();
}

