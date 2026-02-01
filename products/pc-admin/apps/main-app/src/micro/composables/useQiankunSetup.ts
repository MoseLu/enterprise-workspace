/**
 * Qiankun 设置 Composable
 * 组装所有配置并初始化 qiankun
 */
;

import { registerMicroApps, start, initGlobalState } from 'qiankun';
import { microApps } from '../apps';
import { getLocaleFromStorage } from '@btc/shared-components/i18n';
import { getMainAppId, initGlobalStateManager, getGlobalState, onGlobalStateChange, logger } from '@btc/shared-core';
import type { MicroAppStateActions } from '@btc/shared-core/composables/useGlobalState';
import { initErrorMonitor, setupGlobalErrorCapture } from '../../utils/errorMonitor';
import { setupQiankunLogFilter } from './useQiankunLogFilter';
import { getGlobalEntryMap, setupGlobalResourceInterceptor } from './useResourceInterceptor';
import { createAppConfigs } from './useQiankunAppConfig';
import { createLifecycleHooks } from './useQiankunLifecycle';
import { createComplexGetTemplate } from './useQiankunTemplate';
import { createFetchHandler } from './useQiankunFetch';
import { setupQiankunErrorHandler } from './useQiankunErrorHandler';
import { registerMainAppMenus } from './useMainAppMenuRegistry';

/**
 * 初始化 qiankun 微前端
 * @returns globalState qiankun全局状态
 */
export function setupQiankun() {
  // 防止重复注册：如果已经初始化过，直接返回
  if ((window as any).__qiankun_setup__) {
    if (import.meta.env.DEV) {
      console.warn('[qiankun] setupQiankun 已经被调用过，跳过重复注册');
    }
    return getGlobalState();
  }
  (window as any).__qiankun_setup__ = true;

  // 初始化错误监控全局状态
  initErrorMonitor();
  // 设置主应用全局错误捕获
  setupGlobalErrorCapture();

  // 过滤 qiankun 日志（已在模块级别设置，这里作为兜底）
  setupQiankunLogFilter();

  // 检查拦截器是否已被设置（模块级别已设置）
  if (!(window as any).__btc_resource_interceptor_set__) {
    // 如果模块级别的拦截器没有被设置，在这里设置
    setupGlobalResourceInterceptor();
  } else {
    // 确保 globalEntryMap 已初始化
    getGlobalEntryMap();
  }

  // 获取当前语言（使用新的工具函数）
  const currentLocale = getLocaleFromStorage();

  // 初始化 qiankun 全局状态（用于同步语言、Tabbar 和面包屑）
  const globalState = initGlobalState({
    locale: currentLocale,
    // Tabbar 和面包屑统一管理
    breadcrumbList: [], // 统一面包屑列表（主/微应用共用）
    tabbarList: [],     // 统一 Tab 列表（主/微应用共用）
    activeTabKey: '',   // 当前激活的 Tab 键
    currentApp: getMainAppId(), // 当前激活的应用标识（从配置动态获取）
    // 方案2：子应用国际化消息（通过 globalState 传递）
    subAppI18nMessages: {} as Record<string, Record<string, Record<string, any>>>,
  });

  // 通过统一管理器初始化全局状态（防止重复注册和未初始化问题）
  // 将 qiankun 的 globalState 转换为我们的 MicroAppStateActions 类型
  initGlobalStateManager(globalState as unknown as MicroAppStateActions);

  // 方案2：使用统一的全局状态监听器监听子应用通过 globalState 发送的国际化消息
  // 关键：只在子应用通过 globalState 发送国际化消息时合并，避免与 beforeMount 阶段的加载冲突
  onGlobalStateChange(async (state, prev) => {
    // 检查是否有子应用发送了国际化消息
    if (state.subAppI18nMessages && state.subAppI18nMessages !== prev?.subAppI18nMessages) {
      // 获取主应用的 i18n 实例
      if (typeof window !== 'undefined' && (window as any).__MAIN_APP_I18N__) {
        const i18n = (window as any).__MAIN_APP_I18N__;
        const { deepMerge } = await import('../../i18n/subapp-i18n-manager');
        const { registerManifestMenusForApp, registerManifestTabsForApp } = await import('./useQiankunMenuRegistry');

        // 遍历所有子应用的国际化消息
        for (const [appId, messages] of Object.entries(state.subAppI18nMessages)) {
          if (messages && typeof messages === 'object' && messages !== null) {
            // 获取当前语言
            const localeValue = i18n.global.locale;
            const currentLocale = (typeof localeValue === 'string' ? localeValue : localeValue.value) as 'zh-CN' | 'en-US';

            // 如果该子应用有当前语言的国际化消息，则合并
            const localeMessages = (messages as Record<string, any>)[currentLocale];
            if (localeMessages && typeof localeMessages === 'object' && localeMessages !== null) {
              try {
                // 直接合并到主应用 i18n 实例
                // 关键：使用 deepMerge，但确保子应用的消息优先覆盖主应用的消息（包括 shared-components 的值）
                // 合并顺序：先合并主应用消息，再合并子应用消息，确保子应用的值覆盖主应用的值
                const currentMessages = i18n.global.getLocaleMessage(currentLocale);
                // 关键：先合并子应用消息到空对象，再合并主应用消息，确保子应用的值优先
                // 但这样会导致主应用的其他消息丢失，所以还是使用 deepMerge(currentMessages, localeMessages)
                // 但需要确保子应用的消息能覆盖主应用的消息
                const mergedMessages = deepMerge(currentMessages, localeMessages);
                // 关键：对于子应用发送的消息，直接覆盖主应用的值（包括 shared-components 的值）
                // 因为子应用的消息是权威来源，应该优先于 shared-components 的默认值
                // 对于顶级键，如果是对象，需要递归合并；如果是字符串，直接覆盖
                for (const key in localeMessages) {
                  if (localeMessages.hasOwnProperty(key)) {
                    if (typeof localeMessages[key] === 'string') {
                      mergedMessages[key] = localeMessages[key];
                    } else if (typeof localeMessages[key] === 'object' && localeMessages[key] !== null) {
                      // 对于对象（如 subapp、menu），确保子应用的值完全覆盖主应用的值
                      // 使用 deepMerge 确保子应用的所有属性都被保留
                      mergedMessages[key] = deepMerge(mergedMessages[key] || {}, localeMessages[key]);
                    }
                  }
                }

                // 特别处理 subapp 对象，确保所有属性都被保留（包括 name）
                // 注意：subapp 对象可能不存在于主应用的消息中，需要直接设置
                if (localeMessages.subapp && typeof localeMessages.subapp === 'object') {
                  mergedMessages.subapp = { ...localeMessages.subapp }; // 直接复制，确保所有属性都被保留
                }

                i18n.global.setLocaleMessage(currentLocale, mergedMessages);

                // 关键：合并国际化消息后，重新注册菜单和标签页，确保使用最新的国际化消息
                // 这样菜单、Tabbar、面包屑都能正确显示翻译后的文本
                // 使用 nextTick 确保在下一个事件循环中注册，避免与 beforeMount 阶段的注册冲突
                await new Promise(resolve => setTimeout(resolve, 0));
                await registerManifestMenusForApp(appId).catch((err) => logger.error(`注册应用${appId}菜单失败`, err));
                await registerManifestTabsForApp(appId).catch((err) => logger.error(`注册应用${appId}标签页失败`, err));
              } catch (error) {
                console.warn(`[QiankunSetup] 合并 ${appId} 的国际化消息失败:`, error);
              }
            }
          }
        }
      }
    }
  }, false, 'subAppI18nMessages'); // 使用统一的监听器，指定唯一标识

  // 创建 entry 映射，用于在 getTemplate 中查找应用的入口地址
  const entryMap = new Map<string, string>();
  microApps.forEach(app => {
    entryMap.set(app.name, app.entry);
  });

  // 获取主应用的i18n实例（从全局变量获取，避免循环依赖）
  let mainAppI18n: any = null;
  if (typeof window !== 'undefined' && (window as any).__MAIN_APP_I18N__) {
    mainAppI18n = (window as any).__MAIN_APP_I18N__;
  }

  // 创建应用配置
  const appsWithProps = createAppConfigs(microApps, currentLocale, globalState, mainAppI18n);

  // 创建生命周期钩子
  const lifecycleHooks = createLifecycleHooks();

  // 注册子应用
  registerMicroApps(
    appsWithProps,
    {
      // 关键：配置资源过滤函数，允许加载 CDN 上的 CSS 文件
      // @ts-expect-error - excludeAssetFilter 是 qiankun 的有效配置，但类型定义中缺失
      excludeAssetFilter: (assetUrl: string) => {
        // 允许加载 CDN 上的资源（CSS、JS 等）
        if (assetUrl.includes('all.bellis.com.cn') || assetUrl.includes('bellis1.oss-cn-shenzhen.aliyuncs.com')) {
          return true; // 返回 true 表示不过滤，允许加载
        }
        return false;
      },
      ...lifecycleHooks,
    }
  );

  // 关键：在启动 qiankun 之前，确保容器 #subapp-viewport 存在
  // 这样可以避免 qiankun 在 render 阶段找不到容器而报错
  const ensureContainerBeforeStart = async (): Promise<void> => {
    // 检查当前路由是否需要 Layout（登录页、注册页等不需要 Layout，也不需要容器）
    const currentPath = window.location.pathname;
    const noLayoutPages = ['/login', '/register', '/forget-password'];
    const needsLayout = !noLayoutPages.some(page => currentPath === page || currentPath.startsWith(page + '?'));

    // 如果当前路由不需要 Layout，直接 resolve，不检查容器
    if (!needsLayout) {
      return;
    }

    const maxRetries = 20; // 增加重试次数，最多等待 1 秒
    const retryDelay = 50;
    let retryCount = 0;

    const waitForContainer = (): Promise<void> => {
      return new Promise((resolve) => {
        const checkContainer = () => {
          // 再次检查路由（可能在等待过程中路由发生了变化）
          const currentPathNow = window.location.pathname;
          const needsLayoutNow = !noLayoutPages.some(page => currentPathNow === page || currentPathNow.startsWith(page + '?'));

          // 如果路由已经变为不需要 Layout 的页面，直接 resolve
          if (!needsLayoutNow) {
            resolve();
            return;
          }

          const container = document.querySelector('#subapp-viewport') as HTMLElement;

          if (container && container.isConnected) {
            // 容器存在且已连接到 DOM，可以启动 qiankun
            resolve();
          } else if (retryCount < maxRetries) {
            // 容器不存在，触发事件让 Layout 组件创建容器
            window.dispatchEvent(new CustomEvent('qiankun:before-load', {
              detail: { appName: 'main' }
            }));

            retryCount++;
            setTimeout(() => {
              // 等待 Vue 更新完成
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  checkContainer();
                });
              });
            }, retryDelay);
          } else {
            // 超过最大重试次数，仍然找不到容器
            // 记录警告但继续启动（beforeLoad 钩子会处理）
            if (import.meta.env.DEV) {
              console.warn('[qiankun] 启动前未找到 #subapp-viewport 容器，将在 beforeLoad 中重试');
            }
            resolve(); // 仍然 resolve，让 qiankun 启动，beforeLoad 钩子会处理
          }
        };

        checkContainer();
      });
    };

    await waitForContainer();
  };

  // 等待容器存在后再启动 qiankun
  ensureContainerBeforeStart().then(async () => {
    // 启动 qiankun
    // 使用统一的沙箱配置，避免样式隔离不一致导致的样式引擎累积
    const { getQiankunSandboxConfig } = await import('@btc/shared-core');
    const sandboxConfig = getQiankunSandboxConfig();

    start({
      prefetch: false,
      sandbox: sandboxConfig,
      singular: false, // 关闭单例模式：支持跨子域部署，允许主应用同时管理多个子应用
      // 关键：在 importEntryOpts 中配置 getTemplate 和 fetch，修复资源路径
      // @ts-expect-error - importEntryOpts 在 qiankun 2.10.16 的类型定义中不存在，但实际可用
      importEntryOpts: {
        scriptType: 'module', // 全局强制 module 类型，双重保险
        // 自定义 fetch：拦截所有请求，包括 HTML 和资源文件
        fetch: createFetchHandler(entryMap),
        // 自定义 getTemplate：修复资源路径，确保从正确的端口加载
        getTemplate: createComplexGetTemplate(entryMap),
      },
    });

    // 初始加载时，根据当前路径注册对应应用的菜单和 tabs
    // 关键：延迟注册菜单，给子应用时间挂载并发送 globalState 消息
    // 对于使用动态国际化的应用，registerMainAppMenus 内部会等待 globalState 消息
    // 同时等待子应用的 i18n 获取器注册完成（registerSubAppI18n 在模块加载时调用）
    setTimeout(() => {
      registerMainAppMenus();
    }, 300); // 延迟 300ms，确保子应用的 i18n 获取器已经注册（registerSubAppI18n 在模块加载时调用）

    // 设置错误处理器
    setupQiankunErrorHandler();
  }).catch((error) => {
    // 如果等待容器失败，仍然启动 qiankun（beforeLoad 钩子会处理）
    if (import.meta.env.DEV) {
      console.warn('[qiankun] 等待容器时出错，仍然启动 qiankun:', error);
    }

    start({
      prefetch: false,
      sandbox: {
        strictStyleIsolation: false,
        experimentalStyleIsolation: true,
        loose: false,
      },
      singular: false,
      // @ts-expect-error - importEntryOpts 在 qiankun 2.10.16 的类型定义中不存在，但实际可用
      importEntryOpts: {
        scriptType: 'module',
        fetch: createFetchHandler(entryMap),
        getTemplate: createComplexGetTemplate(entryMap),
      },
    });

    // 延迟注册菜单（与上面的逻辑保持一致）
    setTimeout(() => {
      registerMainAppMenus();
    }, 300); // 延迟 300ms，确保子应用的 i18n 获取器已经注册
    setupQiankunErrorHandler();
  });

  // 返回 globalState，供插件系统使用
  return globalState;
}

