/**
 * Qiankun 生命周期钩子 Composable
 * 处理 qiankun 应用的生命周期事件
 */

import { sessionStorage } from '@btc/shared-core/utils/storage/session';
;
import { clearLoadingElement } from './useQiankunUtils';
import { registerManifestTabsForApp, registerManifestMenusForApp } from './useQiankunMenuRegistry';
import { showLoading, hideLoading, markLoadingFail } from '../../composables/useAppLoading';
import { getGlobalState } from '@btc/shared-core';
import { microApps } from '../apps';

// 应用名称映射（用于显示友好的中文名称）
const appNameMap: Record<string, string> = {
  system: '系统模块',
  admin: '管理模块',
  logistics: '物流模块',
  engineering: '工程模块',
  quality: '品质模块',
  production: '生产模块',
  finance: '财务模块',
  operations: '运维模块',
  dashboard: '图表模块',
  personnel: '人事模块',
  docs: '文档模块',
};

// 存储当前激活的应用名称（用于判断是否是真正的应用切换）
let currentActiveApp: string | null = null;

/**
 * 创建 beforeLoad 生命周期钩子
 */
export function createBeforeLoadHook() {
  return async (app: any) => {
    const appDisplayName = appNameMap[app.name] || app.name;

    // 清除可能存在的 #Loading 元素
    clearLoadingElement();

    // 确保 system-app 的 #Loading 也被隐藏
    const systemLoadingEl = document.getElementById('Loading');
    if (systemLoadingEl && systemLoadingEl.textContent?.includes('拜里斯科技')) {
      systemLoadingEl.style.setProperty('display', 'none', 'important');
      systemLoadingEl.style.setProperty('visibility', 'hidden', 'important');
      systemLoadingEl.style.setProperty('opacity', '0', 'important');
      systemLoadingEl.style.setProperty('pointer-events', 'none', 'important');
      systemLoadingEl.style.setProperty('z-index', '-1', 'important');
      systemLoadingEl.classList.add('is-hide');
    }

    // 额外检查：确保子应用的 #Loading 元素被清除
    setTimeout(() => {
      clearLoadingElement();
      const systemLoadingEl2 = document.getElementById('Loading');
      if (systemLoadingEl2 && systemLoadingEl2.textContent?.includes('拜里斯科技')) {
        systemLoadingEl2.style.setProperty('display', 'none', 'important');
        systemLoadingEl2.style.setProperty('visibility', 'hidden', 'important');
        systemLoadingEl2.style.setProperty('opacity', '0', 'important');
        systemLoadingEl2.style.setProperty('pointer-events', 'none', 'important');
        systemLoadingEl2.style.setProperty('z-index', '-1', 'important');
        systemLoadingEl2.classList.add('is-hide');
      }
    }, 0);

    // 判断是否是真正的应用切换
    const isAppSwitch = currentActiveApp === null || (currentActiveApp !== null && currentActiveApp !== app.name);
    const isNormalizing = sessionStorage.get<string>('__BTC_ROUTE_NORMALIZING__') === '1';

    if (isAppSwitch && !isNormalizing) {
      // 先隐藏路由 loading
      try {
        const { routeLoadingService } = await import('@btc/shared-core');
        routeLoadingService.hide();
      } catch (error) {
        // 静默失败
      }

      // 强制隐藏容器
      const existingContainer = document.querySelector('#subapp-viewport') as HTMLElement;
      if (existingContainer) {
        existingContainer.style.setProperty('display', 'none', 'important');
        existingContainer.style.setProperty('visibility', 'hidden', 'important');
        existingContainer.style.setProperty('opacity', '0', 'important');
      }

      // 显示新的 Loading（使用应用配置）
      const targetApp = microApps.find(item => item.name === app.name);
      if (targetApp) {
        showLoading(targetApp);
        
        // 关键：设置超时保护，确保 loading 在超时后自动隐藏
        // 开发环境 15 秒，生产环境 20 秒
        const timeoutMs = import.meta.env.DEV ? 15000 : 20000;
        const timeoutKey = `__qiankun_loading_timeout_${app.name}__`;
        
        // 清除之前的超时定时器（如果存在）
        const existingTimeout = (window as any)[timeoutKey];
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }
        
        // 设置新的超时定时器
        const timeoutId = setTimeout(() => {
          if (import.meta.env.DEV) {
            console.warn(`[QiankunLifecycle] ⚠️ 子应用 ${app.name} 加载超时（${timeoutMs}ms），强制隐藏 loading`);
          }
          
          // 强制隐藏 loading
          hideLoading();
          
          // 清除容器上的 loading 标记
          const container = document.querySelector('#subapp-viewport') as HTMLElement;
          if (container) {
            container.removeAttribute('data-qiankun-loading');
            container.style.removeProperty('display');
            container.style.removeProperty('visibility');
            container.style.removeProperty('opacity');
          }
          
          // 清除超时定时器引用
          delete (window as any)[timeoutKey];
        }, timeoutMs);
        
        // 保存超时定时器引用，以便在 afterMount 时清除
        (window as any)[timeoutKey] = timeoutId;
      }
    }

    return new Promise<void>((resolve, reject) => {
      let retryCount = 0;
      const maxRetries = 20; // 增加重试次数，最多等待 1 秒（20 * 50ms）
      const retryDelay = 50;

      const ensureContainer = async () => {
        let container = document.querySelector('#subapp-viewport') as HTMLElement;

        if (!container || !container.isConnected) {
          await new Promise(resolve => setTimeout(resolve, 0));

          window.dispatchEvent(new CustomEvent('qiankun:before-load', {
            detail: { appName: app.name }
          }));

          await new Promise(resolve => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                resolve(undefined);
              });
            });
          });

          container = document.querySelector('#subapp-viewport') as HTMLElement;

          if (container && container.isConnected) {
            container.style.setProperty('display', 'none', 'important');
            container.style.setProperty('visibility', 'hidden', 'important');
            container.style.setProperty('opacity', '0', 'important');
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        }

        if (container && container.isConnected) {
          container.setAttribute('data-qiankun-loading', 'true');
          // 容器保持隐藏状态，等待应用加载完成后显示
          container.style.setProperty('display', 'none', 'important');
          container.style.setProperty('visibility', 'hidden', 'important');
          container.style.setProperty('opacity', '0', 'important');

          // 在 beforeLoad 阶段预加载语言包（如果可能）
          // 关键：等待子应用的入口文件加载并执行，确保 __SUBAPP_I18N_GETTERS__ 在 beforeMount 之前就注册
          // 注意：此时子应用的开发服务器可能还未启动，所以这里只尝试加载，不阻塞
          try {
            // 等待子应用的入口文件加载并执行（最多等待 200ms）
            // qiankun 会在 beforeLoad 阶段加载入口文件，我们需要等待它执行完成
            let waitCount = 0;
            const maxWaitCount = 4; // 最多等待 4 次，每次 50ms，总共 200ms
            while (waitCount < maxWaitCount) {
              if (typeof window !== 'undefined') {
                const subAppI18nGetters = (window as any).__SUBAPP_I18N_GETTERS__;
                if (subAppI18nGetters && subAppI18nGetters instanceof Map && subAppI18nGetters.has(app.name)) {
                  // 已经注册，可以提前加载国际化消息
                  break;
                }
              }
              // 等待一段时间后重试
              if (waitCount < maxWaitCount - 1) {
                await new Promise(resolve => setTimeout(resolve, 50));
              }
              waitCount++;
            }

            // 尝试加载国际化消息（无论是否注册成功）
            const { loadAndMergeSubAppI18n } = await import('../../i18n/subapp-i18n-manager');
            const { i18n } = await import('../../i18n');
            // 不等待，异步加载，避免阻塞应用加载
            loadAndMergeSubAppI18n(i18n, app.name).catch(err => {
              // 静默失败，beforeMount 时会重试
              if (import.meta.env.DEV) {
                console.warn(`[QiankunLifecycle] Pre-load i18n failed in beforeLoad for ${app.name}:`, err);
              }
            });
          } catch (error) {
            // 静默失败，beforeMount 时会重试
          }

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(() => ensureContainer(), retryDelay);
        } else {
          reject(new Error(`容器缺失，无法加载应用 ${app.name}`));
        }
      };

      ensureContainer();
    });
  };
}

/**
 * 创建 beforeMount 生命周期钩子
 */
export function createBeforeMountHook() {
  return async (_app: any) => {
    const container = document.querySelector('#subapp-viewport') as HTMLElement;
    if (container && !container.hasAttribute('data-qiankun-loading')) {
      window.dispatchEvent(new CustomEvent('qiankun:before-load', {
        detail: { appName: _app.name }
      }));

      container.style.setProperty('display', 'flex', 'important');
      container.style.setProperty('visibility', 'visible', 'important');
      container.style.setProperty('opacity', '1', 'important');
      container.setAttribute('data-qiankun-loading', 'true');

      // 加载子应用的国际化数据（在tabbar和面包屑渲染前完成）
      try {
        const { loadAndMergeSubAppI18n } = await import('../../i18n/subapp-i18n-manager');
        const { i18n } = await import('../../i18n');

        // 等待子应用有机会注册 __SUBAPP_I18N_GETTERS__（最多等待1000ms）
        // 这样可以确保使用动态生成的国际化消息（从 config.ts）
        // 关键：子应用的入口文件在 beforeLoad 阶段开始加载，但执行可能在 beforeMount 阶段
        let retryCount = 0;
        const maxRetries = 10; // 增加到 10 次，总共最多等待 1000ms
        const retryDelay = 100;

        while (retryCount < maxRetries) {
          // 检查是否已经注册
          if (typeof window !== 'undefined') {
            const subAppI18nGetters = (window as any).__SUBAPP_I18N_GETTERS__;
            if (subAppI18nGetters && subAppI18nGetters instanceof Map && subAppI18nGetters.has(_app.name)) {
              // 已经注册，直接加载
              await loadAndMergeSubAppI18n(i18n, _app.name);
              break;
            }
          }

          // 如果还没有注册，先等待一段时间
          if (retryCount < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }

          // 尝试加载（可能从 JSON 文件加载，或者如果已经注册则从动态获取器加载）
          await loadAndMergeSubAppI18n(i18n, _app.name);

          // 再次检查是否已经注册（可能在加载过程中注册了）
          if (typeof window !== 'undefined') {
            const subAppI18nGetters = (window as any).__SUBAPP_I18N_GETTERS__;
            if (subAppI18nGetters && subAppI18nGetters instanceof Map && subAppI18nGetters.has(_app.name)) {
              // 已经注册，重新加载以使用动态生成的消息
              await loadAndMergeSubAppI18n(i18n, _app.name);
              break;
            }
          }

          retryCount++;
        }


        // 验证国际化消息是否已正确合并（开发环境）
        if (import.meta.env.DEV) {
          const currentLocale = i18n.global.locale.value as 'zh-CN' | 'en-US';
          const messages = i18n.global.getLocaleMessage(currentLocale);
          const testKeys = [
            'menu.platform',
            'menu.org',
            'menu.access',
            'menu.data.files',
            'menu.data.files.templates',
            'menu.test_features.components',
            'menu.test_features.api_test_center',
            'menu.test_features.inventory_ticket_print',
          ];
          const foundKeys = testKeys.filter(key => key in messages);
          const missingKeys = testKeys.filter(key => !foundKeys.includes(key));

          if (missingKeys.length > 0) {
            console.warn(`[QiankunLifecycle] ⚠️ Missing keys after merge for ${_app.name}:`, missingKeys);
            const sampleKeys = Object.keys(messages).filter(k =>
              k.includes('menu.data') || k.includes('menu.test_features') || k.startsWith('menu.')
            );
            console.info(`[QiankunLifecycle] 🔍 Available menu keys:`, sampleKeys.slice(0, 20));
          }
        }
      } catch (error) {
        console.warn(`[QiankunLifecycle] Failed to load i18n for ${_app.name}:`, error);
        // 不阻塞应用挂载
      }

      // 清理其他应用的 tabs/menus，并重新注册当前应用的菜单
      // 此时国际化消息应该已经加载并合并到主应用的 i18n 实例中
      // 关键：等待一小段时间，确保子应用有机会通过 globalState 发送国际化消息
      // 这样可以避免在 beforeMount 阶段注册菜单/标签页后，又被 globalState 监听器重新注册
      // 如果子应用通过 globalState 发送了国际化消息，globalState 监听器会重新注册菜单/标签页
      // 这里只作为兜底，如果 globalState 监听器没有触发，则在这里注册
      await new Promise(resolve => setTimeout(resolve, 200)); // 等待 200ms，给子应用时间发送 globalState

      const { clearTabsExcept } = await import('../../store/tabRegistry');
      const { clearMenusExcept } = await import('../../store/menuRegistry');
      clearTabsExcept(_app.name);
      clearMenusExcept(_app.name);

      // 检查是否已经通过 globalState 发送了国际化消息
      // 如果已经发送，globalState 监听器会处理菜单/标签页注册，这里不需要重复注册
      const globalState = getGlobalState();
      if (globalState && typeof globalState.getGlobalState === 'function') {
        const currentState = globalState.getGlobalState();
        const hasI18nMessages = currentState?.subAppI18nMessages?.[_app.name];

        if (hasI18nMessages) {
          // 已经通过 globalState 发送了国际化消息，globalState 监听器会处理注册
          // 这里不需要重复注册，避免时序冲突
          return Promise.resolve();
        }
      }

      // 如果没有通过 globalState 发送国际化消息，则在这里注册菜单/标签页
      await registerManifestMenusForApp(_app.name);
      await registerManifestTabsForApp(_app.name);
    }

    return Promise.resolve();
  };
}

/**
 * 创建 afterMount 生命周期钩子
 */
export function createAfterMountHook() {
  return async (_app: any) => {
    // 更新当前激活的应用名称
    currentActiveApp = _app.name;

    // 关键：对于使用动态国际化的应用，子应用已经在 mountAdminApp 中发送了国际化消息
    // 不需要等待检测消息，只需要等待应用挂载完成（内容区域渲染）即可
    // onGlobalStateChange 监听器会异步处理合并，菜单、tabbar、面包屑都是响应式的，会在i18n更新后自动更新
    const { getAppsUsingDynamicI18n } = await import('../apps');
    const appsUsingDynamicI18n = getAppsUsingDynamicI18n();
    const isUsingDynamicI18n = appsUsingDynamicI18n.includes(_app.name);

    if (isUsingDynamicI18n) {
      // 等待应用挂载完成（内容区域渲染）
      // 通过监听 #subapp-viewport 容器是否有内容来判断应用是否已挂载完成
      const maxWaitTime = 5000; // 最多等待5秒
      const checkInterval = 50; // 每50ms检查一次
      let contentReady = false;
      let waitedTime = 0;
      const startTime = Date.now();

      // 轮询检查容器是否有内容
      while (waitedTime < maxWaitTime && !contentReady) {
        const container = document.querySelector('#subapp-viewport') as HTMLElement;

        if (container) {
          // 检查容器是否有子元素（说明应用已挂载）
          const hasChildren = container.children.length > 0;

          // 检查容器是否可见（不是 display: none）
          const computedStyle = window.getComputedStyle(container);
          const isVisible = computedStyle.display !== 'none' &&
                           computedStyle.visibility !== 'hidden' &&
                           computedStyle.opacity !== '0';

          // 检查容器内是否有 #app 元素（子应用的根元素）
          const hasAppElement = container.querySelector('#app') !== null;

          if (hasChildren && (isVisible || hasAppElement)) {
            // 等待几个渲染周期，确保 Vue 应用完全渲染
            await new Promise(resolve => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    resolve(undefined);
                  });
                });
              });
            });

            contentReady = true;
            break;
          }
        }

        // 等待一段时间后再次检查
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        waitedTime = Date.now() - startTime;
      }
    }

    // 隐藏 Loading（国际化消息已到达或不是使用动态国际化的应用）
    hideLoading();

    // 清除可能存在的 #Loading 元素
    clearLoadingElement();

    // 清除超时保护（清除两种可能的超时定时器）
    // 1. 旧的超时定时器（如果存在）
    const timeoutKey = `__qiankun_timeout_${_app.name}__`;
    const timeoutId = (window as any)[timeoutKey];
    if (timeoutId) {
      clearTimeout(timeoutId);
      delete (window as any)[timeoutKey];
    }
    
    // 2. 新的 loading 超时定时器（在 beforeLoad 中设置的）
    const loadingTimeoutKey = `__qiankun_loading_timeout_${_app.name}__`;
    const loadingTimeoutId = (window as any)[loadingTimeoutKey];
    if (loadingTimeoutId) {
      clearTimeout(loadingTimeoutId);
      delete (window as any)[loadingTimeoutKey];
    }

    // 清理加载标记和隐藏样式
    const container = document.querySelector('#subapp-viewport') as HTMLElement;
    if (container) {
      container.removeAttribute('data-qiankun-loading');

      requestAnimationFrame(() => {
        if (!container) return;

        container.style.removeProperty('display');
        container.style.removeProperty('visibility');
        container.style.removeProperty('opacity');

        const styleAttr = container.getAttribute('style') || '';
        if (styleAttr) {
          const cleanedStyle = styleAttr
            .replace(/display\s*:\s*none\s*!important;?/gi, '')
            .replace(/visibility\s*:\s*hidden\s*!important;?/gi, '')
            .replace(/opacity\s*:\s*0\s*!important;?/gi, '')
            .replace(/display\s*:\s*none;?/gi, '')
            .replace(/visibility\s*:\s*hidden;?/gi, '')
            .replace(/opacity\s*:\s*0;?/gi, '')
            .replace(/;\s*;/g, ';')
            .replace(/^\s*;\s*|\s*;\s*$/g, '')
            .trim();

          if (cleanedStyle) {
            container.setAttribute('style', cleanedStyle);
          } else {
            container.removeAttribute('style');
          }
        }

        container.classList.remove('content-mount--hidden');
      });
    }

    // 触发自定义事件
    Promise.resolve().then(() => {
      window.dispatchEvent(new CustomEvent('qiankun:after-mount', {
        detail: { appName: _app.name }
      }));
    });

    // 关键：仅在应用切换时重新初始化 user-check
    // 刷新浏览器时不应该调用，应该使用存储的剩余时间
    try {
      // 检测是否是应用切换（通过比较当前应用 ID 和 sessionStorage 中存储的上一次应用 ID）
      const { getAppIdFromPath } = await import('@btc/shared-core');
      const { sessionStorage } = await import('@btc/shared-core/utils/storage/session');
      
      const currentPath = window.location.pathname;
      const currentAppId = getAppIdFromPath(currentPath);
      const lastAppId = sessionStorage.get('__last_app_id__') as string | undefined;
      
      // 只有在应用切换时才调用（应用 ID 不同，且不是首次访问）
      const isAppSwitch = lastAppId && currentAppId !== lastAppId;
      
      if (isAppSwitch) {
        // 更新当前应用 ID
        sessionStorage.set('__last_app_id__', currentAppId);
        
        // 应用切换：立即检查并更新会话存储
        const { reinitializeUserCheckOnAppSwitch } = await import('@btc/shared-core/composables/user-check');
        reinitializeUserCheckOnAppSwitch().catch((error) => {
          // 静默失败，不影响应用切换
          if (import.meta.env.DEV) {
            console.warn('[qiankun:afterMount] Failed to reinitialize user check:', error);
          }
        });
      } else {
        // 页面刷新或首次访问：更新应用 ID，但不调用 user-check
        // user-check 由主应用的 bootstrap 统一管理
        if (currentAppId) {
          sessionStorage.set('__last_app_id__', currentAppId);
        }
      }
    } catch (error) {
      // 静默失败，不影响应用挂载
      if (import.meta.env.DEV) {
        console.warn('[qiankun:afterMount] Failed to check app switch:', error);
      }
    }

    return Promise.resolve();
  };
}

/**
 * 创建 afterUnmount 生命周期钩子
 */
export function createAfterUnmountHook() {
  return async (app: any) => {
    // 如果卸载的是当前激活的应用，清除当前激活应用标记
    if (currentActiveApp === app.name) {
      currentActiveApp = null;
    }

    // 离开子应用，清理其映射
    const { clearTabs: clearTabsFn } = await import('../../store/tabRegistry');
    const { clearMenus: clearMenusFn } = await import('../../store/menuRegistry');
    clearTabsFn(app.name);
    clearMenusFn(app.name);

    // 清除可能存在的 #Loading 元素
    clearLoadingElement();

    return Promise.resolve();
  };
}

/**
 * 创建 error 生命周期钩子
 */
export function createErrorHook() {
  return async (app: any, err: Error) => {
    const targetApp = microApps.find(item => item.name === app.name);
    if (targetApp) {
      markLoadingFail(`【${targetApp.title || targetApp.name}】加载失败：${err.message}`);
    }
    console.error('[qiankun] 微应用加载失败：', app.name, err);
    return Promise.resolve();
  };
}

/**
 * 创建生命周期钩子配置
 */
export function createLifecycleHooks() {
  return {
    beforeLoad: [createBeforeLoadHook()],
    beforeMount: [createBeforeMountHook()],
    afterMount: [createAfterMountHook()],
    afterUnmount: [createAfterUnmountHook()],
    error: [createErrorHook()], // 新增错误处理
  };
}

