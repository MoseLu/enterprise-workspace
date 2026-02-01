;
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import 'virtual:svg-icons';
// 暗色主题覆盖样式（必须在 Element Plus dark 样式之后加载，使用 CSS 确保在微前端环境下生效）
import '@btc/shared-components/styles/dark-theme.css';
import type { QiankunProps } from '@btc/shared-core';
import {
  createDashboardApp,
  mountDashboardApp,
  unmountDashboardApp,
  updateDashboardApp,
} from './bootstrap';
import type { DashboardAppContext } from './bootstrap';
import { loadSharedResourcesFromLayoutApp } from '@btc/shared-utils/cdn/load-shared-resources';
import { removeLoadingElement, clearNavigationFlag, logger } from '@btc/shared-core';

let context: DashboardAppContext | null = null;

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
        appLoadingService.show('图表模块');
      }
    } catch (error) {
      // 静默失败，继续执行
      if (import.meta.env.DEV) {
        console.warn('[dashboard-app] 无法显示应用级 loading:', error);
      }
    }
  }
  
  try {
    // 先卸载前一个实例（如果存在）
    if (context) {
      try {
        await unmountDashboardApp(context);
      } catch (_error) {
        // 卸载失败不影响后续流程，但记录错误
        if (import.meta.env.DEV) {
          // 卸载前一个实例失败
        }
      } finally {
        context = null;
      }
    }

    // 创建新实例
    context = await createDashboardApp(props);
    await mountDashboardApp(context, props);

    // 关键：应用挂载完成后，移除 Loading 并清理 sessionStorage 标记
    if (isStandalone && appLoadingService) {
      // 隐藏应用级 loading
      try {
        appLoadingService.hide('图表模块');
      } catch (error) {
        // 静默失败
      }
    }
    removeLoadingElement();
    clearNavigationFlag();
  } catch (error) {
    logger.error('渲染失败:', error);
    // 即使挂载失败，也要移除 Loading 并清理 context
    if (isStandalone && appLoadingService) {
      // 隐藏应用级 loading
      try {
        appLoadingService.hide('图表模块');
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
  if (import.meta.env.PROD && !(window as any).__IS_LAYOUT_APP__) {
    try {
      await loadSharedResourcesFromLayoutApp({
        onProgress: (_loaded: number, _total: number) => {
          if (import.meta.env.DEV) {
            // 加载共享资源进度
          }
        },
      });
    } catch (_error) {
      // 加载共享资源失败，继续使用本地资源
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
      await unmountDashboardApp(context, props);
    } catch (_error) {
      // 卸载失败不影响后续流程
      if (import.meta.env.DEV) {
        // 卸载失败
      }
    } finally {
      context = null;
    }
  }
}

async function update(props: QiankunProps) {
  if (context) {
    updateDashboardApp(context, props);
  }
}

// 使用 vite-plugin-qiankun 的 renderWithQiankun（保持兼容性）
// 关键：只在 qiankun 环境下注册生命周期。
// renderWithQiankun 在非 qiankun 环境会自动调用 mount，导致"子应用独立先挂载一次 + 加载 layout-app 后又手动挂载一次"的双挂载，
// 进而引发内容区空白以及 single-spa #41/#1 等问题。
if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  renderWithQiankun({
    bootstrap,
    mount,
    update,
    unmount,
  });
}

// 导出 timeouts 配置，供 single-spa 使用
// 关键：增加生产环境的超时时间，避免网络延迟和资源加载导致的超时
// 注意：使用 import.meta.env.PROD 明确判定生产环境，避免构建产物环境判断异常导致 warningMillis=4000
const isProd = import.meta.env.PROD;
export const timeouts = {
  bootstrap: {
    millis: isProd ? 20000 : 8000, // 生产环境 20 秒，开发环境 8 秒（考虑网络延迟和资源加载）
    dieOnTimeout: false, // 超时后不终止应用，只警告（避免因网络问题导致应用无法加载）
    warningMillis: isProd ? 15000 : 4000, // 警告时间：生产环境 15 秒，开发环境 4 秒（避免过早警告）
  },
  mount: {
    millis: isProd ? 15000 : 8000, // 生产环境 15 秒，开发环境 8 秒
    dieOnTimeout: false, // 超时后不终止应用，只警告
    warningMillis: isProd ? 12000 : 4000, // 警告时间：生产环境 12 秒，开发环境 4 秒
  },
  unmount: {
    millis: 5000, // 增加到 5 秒，确保卸载完成
    dieOnTimeout: false,
    warningMillis: 4000,
  },
};

// 标准 ES 模块导出（qiankun 需要）
// 关键：将 timeouts 也添加到 default 导出中，确保 single-spa 能够读取
export default { bootstrap, mount, unmount, timeouts };

// 独立运行（非 qiankun 环境）
// 注意：与 admin-app 和 logistics-app 保持一致
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
            // 而不是等待 layout-app 通过 qiankun 加载（避免二次加载导致 DOM 操作冲突）
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
                }).catch((_error) => {
                  // 挂载到 layout-app 失败
                });
              } else {
                // 等待 #subapp-viewport 超时，尝试独立渲染
                render().catch((_error) => {
                  // 独立运行失败
                });
              }
            });
          } else {
            // layout-app 加载失败或不需要加载，独立渲染
            render().catch((_error) => {
              // 独立运行失败
            });
          }
        })
        .catch((_error) => {
      // 初始化 layout-app 失败
          // layout-app 加载失败，独立渲染
          render().catch((_error) => {
            // 独立运行失败
          });
        });
    }).catch((_error) => {
      // 导入 init-layout-app 失败
      // 导入失败，直接渲染
      render().catch((_error) => {
        // 独立运行失败
    });
  });
  } else {
    // 不需要加载 layout-app（非生产环境），直接渲染
  render().catch((_error) => {
    // 独立运行失败
  });
  }
}
