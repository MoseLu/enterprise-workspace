;
import { createApp } from 'vue';
import type { App as VueApp } from 'vue';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { resetPluginManager, usePluginManager } from '../../btc/plugins/manager';
import { createSharedUserSettingPlugin } from '../../configs/layout-bridge';
import { logger } from '../../utils/logger';
import type { QiankunProps } from '../../types/qiankun';
import type { SubAppContext, SubAppOptions } from './types';
import { deriveInitialSubRoute } from './utils';

const sharedUserSettingPlugin = createSharedUserSettingPlugin();

/**
 * 创建 translate 函数
 */
function createTranslate(context: SubAppContext) {
  return (key?: string | null) => {
    if (!key) {
      return '';
    }

    try {
      return (context.i18n?.i18n?.global?.t as any)?.(key) ?? key;
    } catch (_err) {
      return key;
    }
  };
}

/**
 * 设置全局错误处理器（标准化模板）
 */
function setupErrorHandlers(app: VueApp, appId: string): void {
  // 关键：添加全局错误处理，捕获 DOM 操作错误
  // 这些错误通常发生在组件更新时 DOM 节点已被移除的情况（如子应用卸载时）
  app.config.errorHandler = (err, instance, info) => {
    // 检查是否是 DOM 操作相关的错误
    if (err instanceof Error && (
      err.message.includes('insertBefore') ||
      err.message.includes('processCommentNode') ||
      err.message.includes('patch') ||
      err.message.includes('__vnode') ||
      err.message.includes('Cannot read properties of null') ||
      err.message.includes('Cannot set properties of null') ||
      err.message.includes('reading \'insertBefore\'') ||
      err.message.includes('reading \'emitsOptions\'')
    )) {
      // DOM 操作错误，可能是容器在更新时被移除
      // 静默处理，避免影响用户体验
      if (import.meta.env.DEV) {
        console.warn(`[${appId}-app] DOM 操作错误已捕获（应用可能正在卸载）:`, err.message);
      }
      return;
    }

    // 关键：CRUD 组件相关的错误不应该被静默处理
    // 这些错误通常表示组件配置问题，需要立即修复
    if (err instanceof Error && (
      err.message.includes('Must be used inside') ||
      err.message.includes('BtcAddBtn') ||
      err.message.includes('BtcMultiDeleteBtn') ||
      err.message.includes('BtcRefreshBtn') ||
      err.message.includes('BtcUpsert') ||
      err.message.includes('BtcTable') ||
      err.message.includes('BtcPagination') ||
      err.message.includes('BtcCrud')
    )) {
      // CRUD 组件错误，必须输出，帮助排查问题
      logger.error(`[${appId}-app] CRUD 组件错误（必须修复）:`, err.message, { info, instance });
      // 继续执行，不阻止错误传播
    }

    // 其他错误必须输出，否则会导致"页面空白但无报错"难以排查
    try {
      (window as any).__BTC_SUBAPP_LAST_ERROR__ = { err, info, time: Date.now() };
    } catch (e) {
      // 静默失败
    }
    logger.error(`[${appId}-app] Vue errorHandler 捕获到错误:`, err, { info, instance });
  };

  // 同理：warn 也至少在控制台可见（生产环境默认可能被忽略）
  app.config.warnHandler = (msg, instance, trace) => {
    try {
      (window as any).__BTC_SUBAPP_LAST_WARN__ = { msg, trace, time: Date.now() };
    } catch (e) {
      // 静默失败
    }
    console.warn(`[${appId}-app] Vue warn:`, msg, { trace, instance });
  };
}

/**
 * 设置独立运行时的插件（标准化模板）
 */
async function setupStandalonePlugins(app: VueApp, router: any): Promise<void> {
  resetPluginManager();
  const pluginManager = usePluginManager({ debug: false });
  pluginManager.setApp(app);
  pluginManager.setRouter(router);
  pluginManager.register(sharedUserSettingPlugin);
  await pluginManager.install(sharedUserSettingPlugin.name);
}

/**
 * 创建子应用实例（标准化模板）
 * 以财务应用为标准，所有子应用使用相同的逻辑
 */
export async function createSubApp(
  options: SubAppOptions,
  props: QiankunProps = {}
): Promise<SubAppContext> {
  const { AppComponent, createRouter, setupRouter, setupStore, setupI18n, setupUI, setupPlugins } = options;
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;

  // 初始化监控系统（必须在最前面）
  const { initMonitor, trackBootstrapStart, trackBootstrapEnd } = await import('../../utils/monitor');
  
  // 先初始化监控配置，再开始跟踪
  initMonitor({
    appName: options.appId,
    enableAPM: true,
    enableErrorTracking: true,
    enableUserBehavior: true,
    enablePerformance: true,
    enableResourceMonitoring: true,
    enableBusinessTracking: true,
    enableSystemMonitoring: false,
    sampleRate: 1.0,
  });
  
  trackBootstrapStart();
  
  try {

    // 创建 Vue 应用实例
    const app = createApp(AppComponent);

    // 设置全局错误处理器
    setupErrorHandlers(app, options.appId);

  // 先初始化 i18n，确保国际化文件已加载
  const i18n = setupI18n(app, props.locale || 'zh-CN');
  const router = createRouter();
  setupRouter(app, router);
  const pinia = setupStore(app);
  const theme = setupUI(app);

  // 独立运行时设置插件
  if (isStandalone && setupPlugins) {
    await setupPlugins(app, router);
  }

  // 关键优化：不在 createSubApp 中立即触发路由导航
  // 路由导航应该在应用挂载后立即触发，确保路由能够立即开始工作
  // 这样路由组件可以立即开始加载，与其他区域同步出现

  const context: SubAppContext = {
    app,
    router,
    pinia,
    i18n,
    theme,
    cleanup: {
      listeners: [],
      pendingPromises: [],
    },
    props,
    translate: () => '',
    appId: options.appId, // 保存 appId 用于清理
  };

  context.translate = createTranslate(context);

    // 监控系统：标记启动完成
    trackBootstrapEnd();
    
    return context;
  } catch (error) {
    trackBootstrapEnd();
    throw error;
  }
}

/**
 * 等待容器元素就绪（支持字符串选择器或 HTMLElement）
 */
async function waitForContainer(
  container: HTMLElement | string | null | undefined,
  maxRetries: number = 40,
  retryDelay: number = 50,
  parentElement?: HTMLElement
): Promise<HTMLElement | null> {
  // 如果已经是 HTMLElement 且已连接，检查可见性并返回
  if (container && container instanceof HTMLElement && container.isConnected) {
    // 确保容器可见
    const computedStyle = window.getComputedStyle(container);
    if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
      container.style.setProperty('display', 'flex', 'important');
      container.style.setProperty('flex-direction', 'column', 'important');
      container.style.setProperty('visibility', 'visible', 'important');
      container.style.setProperty('opacity', '1', 'important');
    }
    return container;
  }

  // 如果是字符串选择器，尝试查找
  if (typeof container === 'string') {
    // 如果指定了父元素，在父元素内查找
    const element = parentElement
      ? (parentElement.querySelector(container) as HTMLElement)
      : (document.querySelector(container) as HTMLElement);
    if (element && element.isConnected) {
      // 确保容器可见
      const computedStyle = window.getComputedStyle(element);
      if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
        element.style.setProperty('display', 'flex', 'important');
        element.style.setProperty('flex-direction', 'column', 'important');
        element.style.setProperty('visibility', 'visible', 'important');
        element.style.setProperty('opacity', '1', 'important');
      }
      return element;
    }
  }

  // 如果容器不存在或未连接，尝试等待
  const selector = typeof container === 'string' ? container : '#subapp-viewport';

  let cancelTimer: ReturnType<typeof setTimeout> | null = null;
  let isCancelled = false;

  const promise = new Promise<HTMLElement | null>((resolve) => {
    let retryCount = 0;

    const checkContainer = async () => {
      // 如果已取消，直接返回 null
      if (isCancelled) {
        resolve(null);
        return;
      }

      // 如果指定了父元素，在父元素内查找
      const element = parentElement
        ? (parentElement.querySelector(selector) as HTMLElement)
        : (document.querySelector(selector) as HTMLElement);
      if (element && element.isConnected) {
        // 关键：确保容器可见，如果被隐藏则强制显示
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
          // 强制显示容器（与 app-layout 的样式定义一致）
          element.style.setProperty('display', 'flex', 'important');
          element.style.setProperty('flex-direction', 'column', 'important');
          element.style.setProperty('visibility', 'visible', 'important');
          element.style.setProperty('opacity', '1', 'important');
        }

        // 关键：如果是 #subapp-viewport，确保 layout-app 的 Vue 应用已经渲染完成
        // 通过等待多个 requestAnimationFrame 来确保 Vue 的响应式更新完成
        if (selector === '#subapp-viewport' || (typeof container === 'string' && container === '#subapp-viewport')) {
          // 等待 Vue 应用完全渲染
          await new Promise<void>((resolveRAF) => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  resolveRAF();
                });
              });
            });
          });

          // 再次检查容器是否可见（Vue 渲染后可能会改变样式）
          const finalComputedStyle = window.getComputedStyle(element);
          if (finalComputedStyle.display === 'none' || finalComputedStyle.visibility === 'hidden' || finalComputedStyle.opacity === '0') {
            // 再次强制显示
            element.style.setProperty('display', 'flex', 'important');
            element.style.setProperty('flex-direction', 'column', 'important');
            element.style.setProperty('visibility', 'visible', 'important');
            element.style.setProperty('opacity', '1', 'important');
          }

          // 生产环境下输出诊断信息
          if (import.meta.env.PROD && typeof window !== 'undefined') {
            const isUsingLayoutApp = !!(window as any).__USE_LAYOUT_APP__;
            const isLayoutApp = !!(window as any).__IS_LAYOUT_APP__;
            console.warn('[waitForContainer] 容器准备就绪', {
              selector,
              isUsingLayoutApp,
              isLayoutApp,
              display: finalComputedStyle.display,
              visibility: finalComputedStyle.visibility,
              opacity: finalComputedStyle.opacity,
              hasChildren: element.children.length,
            });
          }
        }

        resolve(element);
      } else if (retryCount < maxRetries) {
        retryCount++;
        // 检查是否已取消
        if (isCancelled) {
          resolve(null);
          return;
        }
        cancelTimer = setTimeout(checkContainer, retryDelay);
      } else {
        // 超时后输出诊断信息
        if (import.meta.env.PROD && typeof window !== 'undefined') {
          console.warn('[waitForContainer] 容器查找超时', {
            selector,
            retryCount,
            maxRetries,
            isUsingLayoutApp: !!(window as any).__USE_LAYOUT_APP__,
            isLayoutApp: !!(window as any).__IS_LAYOUT_APP__,
            elementExists: !!document.querySelector(selector),
          });
        }
        resolve(null);
      }
    };

    checkContainer();
  });

  // 添加取消方法到 Promise（用于清理）
  (promise as any).cancel = () => {
    isCancelled = true;
    if (cancelTimer) {
      clearTimeout(cancelTimer);
      cancelTimer = null;
    }
  };

  return promise;
}

/**
 * 挂载子应用（标准化模板）
 */
export async function mountSubApp(
  context: SubAppContext,
  options: SubAppOptions,
  props: QiankunProps = {}
): Promise<void> {
  // 监控系统：标记挂载开始
  const { trackMountStart, trackMountEnd } = await import('../../utils/monitor');
  trackMountStart();

  try {
    context.props = props;

    // 查找挂载点：
  // - 优先使用 props.container（无论是否 qiankun，只要提供了 container 就使用）
  // - 否则：如果 __USE_LAYOUT_APP__ 为 true，尝试查找 #subapp-viewport
  // - 否则：使用 #app（独立运行模式）
  let mountPoint: HTMLElement | null = null;

  // 关键：优先使用 props.container（无论是 qiankun 模式还是嵌入 layout-app 模式）
  // 支持 HTMLElement 或字符串选择器
  // 重要：确保子应用挂载到 #subapp-viewport 容器下，而不是其他位置
  if (props.container) {
    if (props.container instanceof HTMLElement) {
      // 关键：验证容器是否是 #subapp-viewport 元素
      // 如果 qiankun 传递的不是 #subapp-viewport，需要查找正确的容器
      const isSubappViewport = props.container.id === 'subapp-viewport';

      if (isSubappViewport) {
        // 容器就是 #subapp-viewport，检查是否已连接到 DOM 且可见
        if (props.container.isConnected) {
          // 关键：在生产环境独立运行模式下，即使容器已连接，也要确保容器已准备好
          // 使用 requestAnimationFrame 确保 Vue 渲染完成
          await new Promise(resolve => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                resolve(undefined);
              });
            });
          });
          mountPoint = props.container;
        } else {
          // 容器存在但未连接，等待它连接
          mountPoint = await waitForContainer(props.container, 80, 50);
        }
      } else {
        // 容器不是 #subapp-viewport，可能是 qiankun 包装器
        // 关键：在 qiankun 模式下，如果传递的是包装器，应该查找包装器内部的 #app 元素
        if (qiankunWindow.__POWERED_BY_QIANKUN__) {
          // qiankun 模式：查找包装器内部的 #app 元素
          const appElement = props.container.querySelector('#app') as HTMLElement;
          if (appElement) {
            mountPoint = appElement;
          } else {
            // 如果包装器内没有 #app，等待它出现（qiankun 可能还在加载 HTML）
            mountPoint = await waitForContainer('#app', 80, 50, props.container);
            if (!mountPoint) {
              // 如果还是找不到，回退到使用传递的容器
              if (props.container.isConnected) {
                await new Promise(resolve => {
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      resolve(undefined);
                    });
                  });
                });
                mountPoint = props.container;
              } else {
                mountPoint = await waitForContainer(props.container, 80, 50);
              }
            }
          }
        } else {
          // 非 qiankun 模式：查找 #subapp-viewport 元素
          const viewport = await waitForContainer('#subapp-viewport', 80, 50);
          if (viewport) {
            mountPoint = viewport;
          } else {
            // 如果找不到 #subapp-viewport，回退到使用传递的容器（兼容性处理）
            if (props.container.isConnected) {
              await new Promise(resolve => {
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    resolve(undefined);
                  });
                });
              });
              mountPoint = props.container;
            } else {
              mountPoint = await waitForContainer(props.container, 80, 50);
            }
          }
        }
      }
    } else if (typeof props.container === 'string') {
      // qiankun 可能传递字符串选择器，需要查找
      // 如果是 '#subapp-viewport'，直接使用；否则查找 #subapp-viewport
      if (props.container === '#subapp-viewport') {
        mountPoint = await waitForContainer('#subapp-viewport', 80, 50);
      } else {
        // 传递的选择器不是 #subapp-viewport，优先查找 #subapp-viewport
        const viewport = await waitForContainer('#subapp-viewport', 80, 50);
        if (viewport) {
          mountPoint = viewport;
        } else {
          // 如果找不到 #subapp-viewport，使用传递的选择器（兼容性处理）
          mountPoint = await waitForContainer(props.container, 80, 50);
        }
      }
    }
  }

  // 如果 props.container 不存在或查找失败，尝试其他方式
  if (!mountPoint) {
    // 关键：只有当 __USE_LAYOUT_APP__ 为 true 时，才查找 #subapp-viewport
    // 如果 __USE_LAYOUT_APP__ 为 false，说明 layout-app 加载失败，应该使用独立渲染模式（#app）
    const isUsingLayoutApp = !!(window as any).__USE_LAYOUT_APP__;

    if (isUsingLayoutApp) {
      // 使用 layout-app：尝试查找 #subapp-viewport
      mountPoint = await waitForContainer('#subapp-viewport', 80, 50); // 增加重试次数和延迟
      if (!mountPoint) {
        const errorMsg = `[${options.appId}-app] 使用 layout-app 但未找到 #subapp-viewport 元素`;
        logger.error(errorMsg, {
          __USE_LAYOUT_APP__: (window as any).__USE_LAYOUT_APP__,
          hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
          documentBody: typeof document !== 'undefined' ? document.body : null,
          appElement: typeof document !== 'undefined' ? document.querySelector('#app') : null,
          viewportElement: typeof document !== 'undefined' ? document.querySelector('#subapp-viewport') : null,
        });
        throw new Error(errorMsg);
      }
    } else if (qiankunWindow.__POWERED_BY_QIANKUN__) {
      // qiankun 模式但未提供 container：尝试查找 #subapp-viewport
      mountPoint = await waitForContainer('#subapp-viewport', 80, 50);
      if (!mountPoint) {
        throw new Error(`[${options.appId}-app] qiankun 模式下未提供容器元素且未找到 #subapp-viewport`);
      }
    } else {
      // 独立运行模式：使用 #app
      mountPoint = await waitForContainer('#app');
      if (!mountPoint) {
        throw new Error(`[${options.appId}-app] 独立运行模式下未找到 #app 元素`);
      }
    }
  }

  if (!mountPoint) {
    throw new Error(`[${options.appId}-app] 无法找到挂载节点`);
  }

  // 关键：判断是否使用 layout-app（提前定义，避免重复）
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  // 关键：再次确认容器已连接到 DOM 且已准备好
  if (!mountPoint.isConnected) {
    const containerPromise = waitForContainer(mountPoint, 80, 50);
    // 将 Promise 添加到 cleanup，以便在卸载时取消
    if (context.cleanup.pendingPromises && (containerPromise as any).cancel) {
      context.cleanup.pendingPromises.push({ cancel: (containerPromise as any).cancel });
    }
    mountPoint = await containerPromise;
    if (!mountPoint || !mountPoint.isConnected) {
      throw new Error(`[${options.appId}-app] 挂载容器未连接到 DOM`);
    }
  }

  // 关键：确保容器已准备好（使用 requestAnimationFrame 确保 Vue 渲染完成）
  await new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve(undefined);
      });
    });
  });

  // 关键：检查是否应该挂载（避免重复挂载）
  // 在 layout-app 嵌入模式下，如果 qiankun 已经挂载了子应用，不应该再次挂载
  const isEmbeddedMode = typeof window !== 'undefined' && !!(window as any).__BTC_LAYOUT_APP_EMBEDDED_BY_SUBAPP__;
  if (isEmbeddedMode && qiankunWindow.__POWERED_BY_QIANKUN__) {
    // 嵌入模式 + qiankun：检查容器中是否已经有内容（qiankun 可能已经挂载）
    // 如果已经有 #app 元素且已挂载，不应该再次挂载
    const existingApp = mountPoint.querySelector('#app');
    if (existingApp && existingApp.children.length > 0) {
      // qiankun 已经挂载了子应用，不应该再次挂载
      if (import.meta.env.DEV) {
        console.warn(`[${options.appId}-app] 检测到 qiankun 已挂载，跳过重复挂载`);
      }
      return; // 直接返回，不执行挂载
    }
  }

  // 关键：清理容器中的旧内容，避免多个 #app 元素和多余的 iframe 容器
  // 在 qiankun 模式下，qiankun 会注入子应用的 HTML（包括 #app 元素）
  // 但在 layout-app 模式下，子应用直接挂载到 #subapp-viewport，需要清理旧内容
  // 关键：在所有模式下都进行清理，确保 DOM 结构干净

  // 1. 特别清理可能存在的 iframe 容器（docs-iframe）
  // 先清理 iframe，避免它们占据高度
  const iframeWrappers = mountPoint.querySelectorAll('.docs-iframe-wrapper, iframe');
  iframeWrappers.forEach((iframe) => {
    try {
      iframe.remove();
    } catch (error) {
      // 静默失败
    }
  });

  // 2. 清理可能存在的多个 body 元素（qiankun 可能注入的）
  // 注意：body 元素不应该出现在挂载点内，如果出现，需要清理
  const bodyElements = mountPoint.querySelectorAll('body');
  bodyElements.forEach((body) => {
    try {
      // 将 body 内的内容移到挂载点，然后移除 body
      while (body.firstChild) {
        mountPoint.appendChild(body.firstChild);
      }
      body.remove();
    } catch (error) {
      // 静默失败
    }
  });

  // 3. 清理可能存在的多个 #app 元素
  // 注意：在 layout-app 模式下，子应用会直接挂载到 #subapp-viewport
  // 如果容器中已经有 #app 元素，可能是之前挂载留下的，需要清理
  const appElements = mountPoint.querySelectorAll('#app');
  if (appElements.length > 0) {
    // 在 layout-app 模式下，应该清空所有 #app 元素，让 Vue 重新创建
    // 在独立运行模式下，如果只有一个 #app，保留它；如果有多个，只保留第一个
    if (isUsingLayoutApp) {
      // layout-app 模式：清空所有 #app 元素
      appElements.forEach((app) => {
        try {
          app.remove();
        } catch (error) {
          // 静默失败
        }
      });
    } else if (appElements.length > 1) {
      // 独立运行模式：保留第一个，移除其他的
      for (let i = 1; i < appElements.length; i++) {
        try {
          appElements[i].remove();
        } catch (error) {
          // 静默失败
        }
      }
    }
  }

  // 4. 清理 qiankun 包装器内的多余内容（如果存在）
  // qiankun 可能会注入多个包装器，需要清理旧的
  const qiankunWrappers = mountPoint.querySelectorAll('[data-qiankun], [id^="__qiankun_microapp_wrapper"]');
  if (qiankunWrappers.length > 1) {
    // 如果存在多个 qiankun 包装器，只保留最后一个，移除其他的
    for (let i = 0; i < qiankunWrappers.length - 1; i++) {
      try {
        qiankunWrappers[i].remove();
      } catch (error) {
        // 静默失败
      }
    }
  }

  // 5. 最后清理容器中的所有其他子元素（包括 qiankun 包装器等）
  // 注意：在 layout-app 模式下，需要清空容器，让 Vue 重新挂载
  // 在独立运行模式下，如果容器是 #app，不应该清空（因为 Vue 需要挂载到它）
  if (isUsingLayoutApp) {
    // layout-app 模式：清空容器中的所有子元素，让 Vue 重新挂载
    while (mountPoint.firstChild) {
      mountPoint.removeChild(mountPoint.firstChild);
    }
  } else if (!qiankunWindow.__POWERED_BY_QIANKUN__ && mountPoint.id !== 'app') {
    // 独立运行模式且容器不是 #app：清空容器中的所有子元素
    while (mountPoint.firstChild) {
      mountPoint.removeChild(mountPoint.firstChild);
    }
  }

  // 关键：确保容器可见（如果容器被 v-show 隐藏，强制显示）
  // 因为 qiankun 需要容器可见才能正确挂载
  const computedStyle = window.getComputedStyle(mountPoint);
  if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
    // 临时强制显示容器，确保 qiankun 能够正确挂载
    mountPoint.style.setProperty('display', 'flex', 'important');
    mountPoint.style.setProperty('visibility', 'visible', 'important');
  }

  // 关键优化：立即挂载应用，不等待任何异步操作
  // 这样应用可以立即显示，提升用户体验

  context.app.mount(mountPoint);

  // 关键：在 layout-app 模式下，应用挂载后立即调用 finishLoading 隐藏 loading
  // 不需要等到路由准备好，因为应用已经挂载，loading 应该立即隐藏
  if (isUsingLayoutApp) {
    // 调用 finishLoading 隐藏 loading
    const finishLoading = (window as any).__APP_FINISH_LOADING__;
    if (typeof finishLoading === 'function') {
      try {
        finishLoading();
      } catch (error) {
        // 静默失败
      }
    }

    // 同时隐藏应用级 loading（如果存在）
    import('../../btc/utils/loading').then(({ appLoadingService }) => {
      if (appLoadingService) {
        // 获取应用显示名称
        const appNameMap: Record<string, string> = {
          logistics: '物流模块',
          admin: '管理模块',
          finance: '财务模块',
          engineering: '工程模块',
          quality: '质量模块',
          production: '生产模块',
          operations: '运维模块',
          dashboard: '图表模块',
          personnel: '人事模块',
        };
        const appDisplayName = appNameMap[options.appId] || options.appId;
        try {
          appLoadingService.hide(appDisplayName);
        } catch (error) {
          // 静默失败
        }
      }
    }).catch(() => {
      // 静默失败
    });
  }

  // 关键修复：在 qiankun 或 layout-app 环境下，需要等待路由准备好后再进行导航
  // 这样可以确保路由已经完全初始化，组件可以正确加载
  // 注意：独立运行模式下，Vue Router 会自动根据当前 URL 匹配路由，无需手动触发
  if (qiankunWindow.__POWERED_BY_QIANKUN__ || isUsingLayoutApp) {
    const initialRoute = deriveInitialSubRoute(options.appId, options.basePath);

    // 关键修复：在应用挂载前就设置初始路由，避免路由初始化时先匹配到根路径
    // 这样可以避免刷新浏览器时 URL 短暂变成 /system 再恢复的问题
    if (initialRoute !== '/') {
      // 关键：在应用挂载前就设置初始路由，使用 replace 避免在历史记录中留下中间状态
      // 这样可以避免 Vue Router 在初始化时先匹配到根路径
      try {
        // 使用 router.replace 立即设置路由状态，避免先匹配到根路径
        await context.router.replace(initialRoute);
      } catch (error: unknown) {
        // 如果立即导航失败（可能路由还未准备好），等待路由准备好后再导航
        Promise.race([
          context.router.isReady(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('路由就绪超时')), 3000))
        ]).then(async () => {
          try {
            await context.router.replace(initialRoute);
          } catch (navError: unknown) {
            logger.error(`[${options.appId}-app] 路由导航失败:`, navError, {
              initialRoute,
              currentPath: window.location.pathname,
            });
          }
        }).catch((readyError: unknown) => {
          console.warn(`[${options.appId}-app] 路由就绪检查失败:`, readyError);
        });
      }
    } else {
      // 如果初始路由是首页，等待路由准备好后再进行导航（保持原有逻辑）
      Promise.race([
        context.router.isReady(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('路由就绪超时')), 3000))
      ]).then(async () => {
        // 路由已准备好，进行导航
        try {
          await context.router.replace(initialRoute);

          // 关键修复：等待路由导航完成，并确保组件已加载
          // 使用 nextTick 确保 Vue 已经完成组件渲染
          await import('vue').then(({ nextTick }) => {
            return new Promise<void>((resolve) => {
              nextTick(() => {
                // 检查路由是否已匹配，确保组件已加载
                const currentRoute = context.router.currentRoute.value;
                if (currentRoute.matched.length > 0) {
                  // 路由已匹配，组件应该已经加载，再等待一个 nextTick 确保渲染完成
                  nextTick(() => {
                    resolve();
                  });
                } else {
                  // 如果路由未匹配，等待一段时间后继续（兼容性处理）
                  setTimeout(() => {
                    resolve();
                  }, 200);
                }
              });
            });
          });
        } catch (error: unknown) {
          // 路由导航失败时输出错误信息
          logger.error(`[${options.appId}-app] 路由导航失败:`, error, {
            initialRoute,
            currentPath: window.location.pathname,
            routerReady: 'ready',
          });
        }
      }).catch(async (error: unknown) => {
        // 路由就绪超时或失败，仍然尝试导航（兼容性处理）
        console.warn(`[${options.appId}-app] 路由就绪检查失败，尝试直接导航:`, error);
        try {
          await context.router.replace(initialRoute);

          // 即使路由就绪检查失败，也等待导航完成
          await import('vue').then(({ nextTick }) => {
            return new Promise<void>((resolve) => {
              nextTick(() => {
                setTimeout(() => {
                  resolve();
                }, 200);
              });
            });
          });
        } catch (navError: unknown) {
          logger.error(`[${options.appId}-app] 路由导航失败:`, navError, {
            initialRoute,
            currentPath: window.location.pathname,
            routerReady: 'timeout',
          });
        }
      });
    }
  }

  // 关键优化：将后续操作改为后台异步执行，不阻塞应用挂载和路由导航
  // 应用已经挂载，路由已经开始导航，这些操作可以在后台完成
  (async () => {
    try {
      // 在应用挂载后再次注册菜单，确保菜单注册表已经初始化并且菜单已经注册
      // 这解决了生产环境子域名下独立运行时菜单为空的问题
      try {
        const { registerManifestMenusForApp } = await import('../../configs/layout-bridge');
        registerManifestMenusForApp(options.appId);
      } catch (error) {
        // 静默失败
      }

      // 注意：user-check 轮询由主应用（main-app）统一管理，子应用不需要启动

      // 在路由准备好后调用 onReady 回调（但不阻塞路由导航）
      // 路由导航已经在应用挂载后立即触发，这里只需要等待路由准备好后调用回调
      context.router.isReady().then(() => {
        if (props.onReady) {
          props.onReady();
        }

        if (qiankunWindow.__POWERED_BY_QIANKUN__) {
          window.dispatchEvent(new CustomEvent('subapp:ready', { detail: { name: options.appId } }));
        }
      }).catch(() => {
        // 静默失败
      });
    } catch (error) {
      // 静默失败，不影响应用运行
    }
  })();

    // 监控系统：标记挂载完成
    trackMountEnd();
  } catch (error) {
    trackMountEnd();
    throw error;
  }
}

/**
 * 更新子应用配置（标准化模板）
 */
export function updateSubApp(
  context: SubAppContext,
  props: QiankunProps
): void {
  // 监控系统：标记应用更新
  import('../../utils/monitor').then(({ trackUpdate }) => {
    trackUpdate();
  }).catch(() => {
    // 静默失败
  });

  context.props = {
    ...context.props,
    ...props,
  };

  if (props.locale && context.i18n?.i18n?.global) {
    const locale = context.i18n.i18n.global.locale;
    if (locale && typeof locale === 'object' && 'value' in locale) {
      (locale as { value: string }).value = props.locale as 'zh-CN' | 'en-US';
    }
  }
}

/**
 * 卸载子应用（标准化模板）
 */
export async function unmountSubApp(
  context: SubAppContext,
  props: QiankunProps = {}
): Promise<void> {
  // 监控系统：标记卸载开始
  const { trackUnmountStart, trackUnmountEnd } = await import('../../utils/monitor');
  trackUnmountStart();

  try {
    // 标记应用已卸载，阻止路由同步和响应式更新
    context.isUnmounted = true;

  // 先清理事件监听器和路由钩子，阻止后续的响应式更新
  if (context.cleanup.routerAfterEach) {
    context.cleanup.routerAfterEach();
    delete context.cleanup.routerAfterEach;
  }

  context.cleanup.listeners.forEach(([event, handler]) => {
    window.removeEventListener(event, handler);
  });
  context.cleanup.listeners = [];

  // 清理 history API 的补丁
  if (context.cleanup.historyPatches) {
    context.cleanup.historyPatches();
    delete context.cleanup.historyPatches;
  }

  // 取消所有 pending 的 Promise（避免内存泄漏）
  if (context.cleanup.pendingPromises) {
    context.cleanup.pendingPromises.forEach((promise) => {
      try {
        if (promise.cancel && typeof promise.cancel === 'function') {
          promise.cancel();
        }
      } catch (error) {
        // 忽略取消错误
      }
    });
    context.cleanup.pendingPromises = [];
  }

  const clearTabs = props.clearTabs ?? context.props?.clearTabs;
  if (clearTabs) {
    clearTabs();
  }

  // 清理菜单注册表（避免菜单配置对象累积）
  try {
    if (typeof window !== 'undefined' && (window as any).__BTC_MENU_REGISTRY__) {
      const menuRegistry = (window as any).__BTC_MENU_REGISTRY__;
      if (menuRegistry && menuRegistry.value && context.appId) {
        // 清理当前应用的菜单配置
        const appId = context.appId;
        if (menuRegistry.value[appId]) {
          menuRegistry.value[appId] = [];
        }
      }
    }
  } catch (error) {
    // 静默失败
  }

  // 清理路由配置对象（避免路由元数据中的配置对象和字符串累积）
  try {
    if (context.router) {
      const routes = context.router.getRoutes();
      routes.forEach(route => {
        // 清理路由元数据中的所有配置对象和字符串
        if (route.meta) {
          // 清理可能包含 enabled 和 labelKey 的配置对象
          if (route.meta.config) {
            delete route.meta.config;
          }
          // 清理菜单相关配置
          if (route.meta.menuConfig) {
            delete route.meta.menuConfig;
          }
          // 清理所有字符串属性（路径、名称等会在路由对象本身中，这里清理元数据中的字符串）
          Object.keys(route.meta).forEach(key => {
            if (typeof route.meta![key] === 'string') {
              delete route.meta![key];
            } else if (typeof route.meta![key] === 'object' && route.meta![key] !== null) {
              // 递归清理对象中的字符串
              const clearStrings = (obj: any) => {
                if (typeof obj === 'object' && obj !== null) {
                  Object.keys(obj).forEach(k => {
                    if (typeof obj[k] === 'string') {
                      delete obj[k];
                    } else if (typeof obj[k] === 'object' && obj[k] !== null) {
                      clearStrings(obj[k]);
                    }
                  });
                }
              };
              clearStrings(route.meta![key]);
            }
          });
        }
      });
    }
  } catch (error) {
    // 静默失败
  }

  // 清理动态导入的模块缓存（避免编译后的代码块累积）
  try {
    // 清理 Vite 的模块映射（ModuleMap）
    if (typeof window !== 'undefined') {
      // 清理全局模块缓存（如果存在）
      const viteCache = (window as any).__VITE_MODULE_CACHE__;
      if (viteCache) {
        if (typeof viteCache.clear === 'function') {
          viteCache.clear();
        } else if (typeof viteCache === 'object') {
          // 清理应用相关的模块
          Object.keys(viteCache).forEach(key => {
            if (key.includes(context.appId || '')) {
              delete viteCache[key];
            }
          });
        }
      }

      // 清理动态导入的模块引用
      const dynamicImports = (window as any).__DYNAMIC_IMPORTS__;
      if (dynamicImports && Array.isArray(dynamicImports)) {
        // 清理当前应用的模块引用
        const filtered = dynamicImports.filter((imp: any) => {
          return imp.appId !== context.appId;
        });
        dynamicImports.length = 0;
        dynamicImports.push(...filtered);
      }
    }

    // 清理 HMR 相关的模块映射（如果可访问）
    if (typeof import.meta !== 'undefined' && (import.meta as any).hot) {
      const hot = (import.meta as any).hot;
      if (hot && typeof hot.dispose === 'function') {
        // HMR dispose 会在模块更新时调用，这里只是确保清理
        try {
          hot.dispose(() => {
            // 清理模块相关的资源
          });
        } catch (error) {
          // 忽略错误
        }
      }
    }
  } catch (error) {
    // 静默失败
  }

  // 关键：使用 nextTick 确保所有待处理的响应式更新完成，避免在卸载过程中触发更新
  const { nextTick } = await import('vue');
  await nextTick();

  // 清理 app-loading 服务实例（避免内存泄漏）
  try {
    const { appLoadingService } = await import('../../btc/utils/loading');
    if (appLoadingService && typeof (appLoadingService as any).cleanupAll === 'function') {
      (appLoadingService as any).cleanupAll();
    }
  } catch (error) {
    // 静默失败
  }

  // 清理主题插件资源（避免内存泄漏）
  try {
    const { cleanupThemePlugin } = await import('../../btc/plugins/theme');
    if (cleanupThemePlugin) {
      cleanupThemePlugin();
    }
  } catch (error) {
    // 静默失败
  }

  // 清理错误监控定时器（避免内存泄漏）
  if (typeof window !== 'undefined' && window.__BTC_ERROR_MONITOR_CLEANUP_TIMER__) {
    clearTimeout(window.__BTC_ERROR_MONITOR_CLEANUP_TIMER__);
    window.__BTC_ERROR_MONITOR_CLEANUP_TIMER__ = undefined;
  }

  // 清理样式表（避免内存泄漏）
  // 使用全局 Element Plus 清理函数，统一处理样式资源清理
  try {
    const { cleanupElementPlus } = await import('../../btc/utils/element-plus/cleanup');
    if (cleanupElementPlus && typeof cleanupElementPlus === 'function') {
      // 只清理当前应用的样式，保留全局共享的 Element Plus 样式
      cleanupElementPlus(context.appId);
    }
  } catch (error) {
    // 静默失败
  }

  // 额外清理应用特定的样式标签（补充清理）
  try {
    if (typeof document !== 'undefined' && context.appId) {
      const appId = context.appId;

      // 清理应用特定的 <style> 标签（通过 data-app 属性标识）
      const appStyles = document.querySelectorAll(`style[data-app="${appId}"]`);
      appStyles.forEach((style) => {
        try {
          if (style.parentNode) {
            style.parentNode.removeChild(style);
          }
        } catch (error) {
          // 忽略清理错误
        }
      });

      // 清理 qiankun 注入的样式隔离 <style> 标签
      // qiankun 的 experimentalStyleIsolation 会为每个应用创建独立的样式作用域
      const qiankunStyles = document.querySelectorAll(
        `style[data-qiankun="${appId}"], style[data-qiankun-style]`
      );
      qiankunStyles.forEach((style) => {
        try {
          // 检查样式内容是否包含应用相关的标识
          const styleText = style.textContent || '';
          if (styleText.includes(appId) || styleText.includes(`[data-qiankun="${appId}"]`)) {
            if (style.parentNode) {
              style.parentNode.removeChild(style);
            }
          }
        } catch (error) {
          // 忽略清理错误
        }
      });

      // 清理应用容器内的 <style> 标签
      if (props.container) {
        const container = typeof props.container === 'string'
          ? document.querySelector(props.container)
          : props.container;
        if (container) {
          const containerStyles = container.querySelectorAll('style');
          containerStyles.forEach((style) => {
            try {
              if (style.parentNode) {
                style.parentNode.removeChild(style);
              }
            } catch (error) {
              // 忽略清理错误
            }
          });
        }
      }
    }
  } catch (error) {
    // 静默失败
  }

  // 清理 i18n 实例（避免内存泄漏）
  // vue-i18n 实例可能持有大量国际化消息和 Intl 对象
  try {
    if (context.i18n && context.i18n.i18n && context.i18n.i18n.global) {
      // 清理 vue-i18n 实例的消息缓存
      const i18nGlobal = context.i18n.i18n.global as any;

      // 深度清理所有语言的消息（包括字符串引用）
      if (i18nGlobal.messages) {
        // 递归清理消息对象，释放字符串引用
        const clearMessages = (obj: any) => {
          if (typeof obj === 'object' && obj !== null) {
            if (Array.isArray(obj)) {
              obj.length = 0;
            } else {
              Object.keys(obj).forEach(key => {
                const value = obj[key];
                if (typeof value === 'object' && value !== null) {
                  clearMessages(value);
                }
                delete obj[key];
              });
            }
          }
        };

        Object.keys(i18nGlobal.messages).forEach(locale => {
          if (i18nGlobal.messages[locale]) {
            clearMessages(i18nGlobal.messages[locale]);
            delete i18nGlobal.messages[locale];
          }
        });
        i18nGlobal.messages = {};
      }

      // 清理日期格式化器缓存（可能包含字符串）
      if (i18nGlobal.__datetimeFormatters) {
        if (typeof i18nGlobal.__datetimeFormatters.clear === 'function') {
          i18nGlobal.__datetimeFormatters.clear();
        } else {
          i18nGlobal.__datetimeFormatters = {};
        }
      }
      if (i18nGlobal.__numberFormatters) {
        if (typeof i18nGlobal.__numberFormatters.clear === 'function') {
          i18nGlobal.__numberFormatters.clear();
        } else {
          i18nGlobal.__numberFormatters = {};
        }
      }

      // 清理 locale 相关的响应式引用
      if (i18nGlobal.locale && typeof i18nGlobal.locale === 'object' && 'value' in i18nGlobal.locale) {
        i18nGlobal.locale.value = 'zh-CN';
      }
    }
  } catch (error) {
    // 静默失败
  }

  // 清理全局的 tSync 创建的 i18n 实例缓存（通过清理 __SUBAPP_I18N_GETTERS__）
  // 注意：createTSync 中创建的 i18nInstance 是闭包变量，无法直接清理
  // 但可以通过清理全局注册表来减少引用
  try {
    if (typeof window !== 'undefined' && (window as any).__SUBAPP_I18N_GETTERS__) {
      const getters = (window as any).__SUBAPP_I18N_GETTERS__;
      if (getters instanceof Map) {
        // 只清理当前应用的 getter，保留其他应用的
        // 注意：这里无法清理闭包中的 i18nInstance，但可以减少全局引用
      }
    }
  } catch (error) {
    // 静默失败
  }

  // 安全卸载：不直接操作 DOM，只卸载 Vue 应用
  // qiankun 会自己管理容器的清理，我们不需要检查 DOM 状态
  try {
    context.app.unmount();
  } catch (error) {
    // 卸载失败，静默处理
    // 这通常发生在容器已经被移除的情况下，属于正常情况
  }

    // 清理 context 中的所有引用
    context.i18n = null as any;
    context.router = null as any;
    context.pinia = null as any;
    context.theme = null as any;

    // 监控系统：标记卸载完成
    trackUnmountEnd();
  } catch (error) {
    trackUnmountEnd();
    throw error;
  }
}

// 导出 setupStandalonePlugins 供外部使用
export { setupStandalonePlugins };
