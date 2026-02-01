;
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import 'virtual:svg-icons';
import 'virtual:uno.css';
// 注意：Element Plus 样式已在主应用中全局导入，子应用不再重复导入，避免重复创建样式引擎
// 暗色主题覆盖样式（必须在 Element Plus dark 样式之后加载，使用 CSS 确保在微前端环境下生效）
import '@btc/shared-components/styles/dark-theme.css';
// 应用全局样式
import './styles/global.scss';
import './styles/theme.scss';
import './styles/nprogress.scss';
import './styles/menu-themes.scss';
import type { QiankunProps } from '@btc/shared-core';
import {
  createMonitorApp,
  mountMonitorApp,
  unmountMonitorApp,
  updateMonitorApp,
} from './bootstrap';
import type { MonitorAppContext as OperationsAppContext } from './bootstrap';
import { loadSharedResourcesFromLayoutApp } from '@btc/shared-utils/cdn/load-shared-resources';
import { removeLoadingElement, clearNavigationFlag, logger } from '@btc/shared-core';
import { isMainApp } from '@btc/shared-core/configs/unified-env-config';

// 注入 isMainApp 函数到 shared-components（异步导入，避免构建时错误）
import('@btc/shared-components').then((utils: any) => {
  if (utils.setIsMainAppFn) {
    utils.setIsMainAppFn(isMainApp);
  }
}).catch(() => {
  // 静默处理导入失败，不影响应用启动
  if (import.meta.env.DEV) {
    console.warn('[operations-app] 无法导入 setIsMainAppFn，跳过设置');
  }
});

let context: OperationsAppContext | null = null;

const shouldRunStandalone = () => {
  // 关键：如果 hostname 匹配生产环境域名，即使 __USE_LAYOUT_APP__ 还未设置，也不应该立即独立运行
  // 应该等待 initLayoutApp 完成后再决定
  const isProductionDomain = /\.bellis\.com\.cn$/i.test(window.location.hostname);
  if (isProductionDomain) {
    // 生产环境域名：如果 __USE_LAYOUT_APP__ 已设置，说明 layout-app 已加载，不应该独立运行
    // 如果还未设置，也不应该立即独立运行，应该等待 initLayoutApp
    return !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;
  }
  // 非生产环境：正常判断
  return !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;
};

let isRendering = false; // 防止并发渲染

const render = async (props: QiankunProps = {}) => {
  // 防止并发渲染导致的竞态条件
  if (isRendering) {
    // 如果正在渲染，等待当前渲染完成
    while (isRendering) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    // 如果渲染完成后 context 已存在，说明已经有其他渲染完成了，直接返回
    if (context) {
      return;
    }
  }

  isRendering = true;

  // 关键：在独立运行模式下，隐藏 index.html 中的 #Loading（显示"拜里斯科技"的那个）
  // 并使用 appLoadingService 显示应用级 loading
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;
  let appLoadingService: any = null;

  if (isStandalone) {
    // 隐藏 index.html 中的 #Loading（显示"拜里斯科技"的那个）
    const loadingEl = document.getElementById('Loading');
    if (loadingEl) {
      loadingEl.style.setProperty('display', 'none', 'important');
      loadingEl.style.setProperty('visibility', 'hidden', 'important');
      loadingEl.style.setProperty('opacity', '0', 'important');
      loadingEl.style.setProperty('pointer-events', 'none', 'important');
      loadingEl.style.setProperty('z-index', '-1', 'important');
      loadingEl.classList.add('is-hide');
    }

    // 显示应用级 loading
    try {
      const sharedCore = await import('@btc/shared-core');
      appLoadingService = sharedCore.appLoadingService;
      if (appLoadingService) {
        appLoadingService.show('运维模块');
      }
    } catch (error) {
      // 静默失败，继续执行
      if (import.meta.env.DEV) {
        console.warn('[operations-app] 无法显示应用级 loading:', error);
      }
    }
  }

  try {
    // 先卸载前一个实例（如果存在）
    if (context) {
      try {
        await unmountMonitorApp(context);
      } catch (error) {
        // 卸载失败不影响后续流程，但记录错误
        if (import.meta.env.DEV) {
          console.warn('[operations-app] 卸载前一个实例失败:', error);
        }
      } finally {
        context = null;
      }
    }

    // 创建新实例
    context = await createMonitorApp(props);
    await mountMonitorApp(context, props);

    // 关键：应用挂载完成后，移除 Loading 并清理 sessionStorage 标记
    if (isStandalone && appLoadingService) {
      // 隐藏应用级 loading
      try {
        appLoadingService.hide('运维模块');
      } catch (error) {
        // 静默失败
      }
    }
    removeLoadingElement();
    clearNavigationFlag();
  } catch (error) {
    logger.error('[operations-app] 渲染失败:', error);
    // 即使挂载失败，也要移除 Loading 并清理 context
    if (isStandalone && appLoadingService) {
      // 隐藏应用级 loading
      try {
        appLoadingService.hide('运维模块');
      } catch (error) {
        // 静默失败
      }
    }
    removeLoadingElement();
    clearNavigationFlag();
    context = null;
    throw error;
  } finally {
    isRendering = false;
  }
};

// qiankun 生命周期钩子（标准 ES 模块导出格式）
function bootstrap() {
  // bootstrap 阶段不需要做任何初始化工作，所有初始化都在 mount 阶段完成
  // 直接返回已 resolve 的 Promise，避免超时警告
  return Promise.resolve(undefined);
}

async function mount(props: QiankunProps) {
  // 生产环境且非 layout-app：先加载共享资源
  // 注意：loadSharedResourcesFromLayoutApp 内部已经检查了 __USE_LAYOUT_APP__，如果使用了 layout-app 会直接返回
  if (import.meta.env.PROD && !(window as any).__IS_LAYOUT_APP__) {
    try {
      await loadSharedResourcesFromLayoutApp({
        onProgress: (loaded: number, total: number) => {
          if (import.meta.env.DEV) {
            console.info(`[operations-app] 加载共享资源进度: ${loaded}/${total}`);
          }
        },
      });
    } catch (error) {
      console.warn('[operations-app] 加载共享资源失败，继续使用本地资源:', error);
      // 继续执行，使用本地打包的资源作为降级方案
    }
  }

  await render(props);
}

async function unmount(props: QiankunProps = {}) {
  // 等待当前渲染完成（如果正在渲染）
  while (isRendering) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  if (context) {
    try {
      await unmountMonitorApp(context, props);
    } catch (error) {
      // 卸载失败不影响后续流程
      if (import.meta.env.DEV) {
        console.warn('[operations-app] 卸载失败:', error);
      }
    } finally {
      context = null;
    }
  }
}

async function update(props: QiankunProps) {
  if (context) {
    updateMonitorApp(context, props);
  }
}

// 使用 vite-plugin-qiankun 的 renderWithQiankun（保持兼容性）
// 关键：只在 qiankun 环境下注册生命周期。
if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  renderWithQiankun({
    bootstrap,
    mount,
    update,
    unmount,
  });
}

// 导出 timeouts 配置，供 single-spa 使用
const isProd = import.meta.env.PROD;
export const timeouts = {
  bootstrap: {
    millis: isProd ? 20000 : 8000,
    dieOnTimeout: false,
    warningMillis: isProd ? 15000 : 4000,
  },
  mount: {
    millis: isProd ? 15000 : 8000,
    dieOnTimeout: false,
    warningMillis: isProd ? 12000 : 4000,
  },
  unmount: {
    millis: 5000,
    dieOnTimeout: false,
    warningMillis: 4000,
  },
};

// 标准 ES 模块导出（qiankun 需要）
export default { bootstrap, mount, unmount, timeouts };

// 独立运行（非 qiankun 环境）
if (shouldRunStandalone()) {
  // 检查是否需要加载 layout-app
  const shouldLoadLayout = /\.bellis\.com\.cn$/i.test(window.location.hostname);

  if (shouldLoadLayout) {
    // 需要加载 layout-app，先初始化，等待完成后再决定是否渲染
    import('./utils/init-layout-app').then(({ initLayoutApp }) => {
      initLayoutApp()
        .then(() => {
          // layout-app 加载成功，检查是否需要独立渲染
          if ((window as any).__USE_LAYOUT_APP__) {
            // 关键：layout-app 已加载，子应用应该主动挂载到 layout-app 的 #subapp-viewport
            const waitForViewport = (retries = 40): Promise<HTMLElement | null> => {
              return new Promise((resolve) => {
                const viewport = document.querySelector('#subapp-viewport') as HTMLElement | null;
                if (viewport) {
                  resolve(viewport);
                } else if (retries > 0) {
                  setTimeout(() => resolve(waitForViewport(retries - 1)), 50);
                } else {
                  resolve(null);
                }
              });
            };

            waitForViewport().then((viewport) => {
              if (viewport) {
                // 挂载到 layout-app 的 #subapp-viewport
                render({ container: viewport } as any).then(() => {
                }).catch((error) => {
                  logger.error('[operations-app] 挂载到 layout-app 失败:', error);
                });
              } else {
                logger.error('[operations-app] 等待 #subapp-viewport 超时，尝试独立渲染');
                render().catch((error) => {
                  logger.error('[operations-app] 独立运行失败:', error);
                });
              }
            });
          } else {
            // layout-app 加载失败或不需要加载，独立渲染
            render().catch((error) => {
              logger.error('[operations-app] 独立运行失败:', error);
            });
          }
        })
        .catch((error) => {
          logger.error('[operations-app] 初始化 layout-app 失败:', error);
          // layout-app 加载失败，独立渲染
          render().catch((error) => {
            logger.error('[operations-app] 独立运行失败:', error);
          });
        });
    }).catch((error) => {
      logger.error('[operations-app] 导入 init-layout-app 失败:', error);
      // 导入失败，直接渲染
      render().catch((error) => {
        logger.error('[operations-app] 独立运行失败:', error);
      });
    });
  } else {
    // 不需要加载 layout-app（非生产环境），直接渲染
    render().catch((error) => {
      logger.error('[operations-app] 独立运行失败:', error);
    });
  }
}
