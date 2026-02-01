;
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import 'virtual:svg-icons';
// 暗色主题覆盖样式（必须在 Element Plus dark 样式之后加载，使用 CSS 确保在微前端环境下生效）
import '@btc/shared-components/styles/dark-theme.css';
// 应用全局样式（已在 bootstrap/index.ts 中导入，这里不再重复导入）
// import './styles/global.scss';
// import './styles/theme.scss';

// 关键：在模块加载时就导入 getters.ts，确保 __SUBAPP_I18N_GETTERS__ 在 beforeMount 之前就注册
// 这样主应用在 beforeMount 时就能获取到动态生成的国际化消息
import './i18n/getters';

import type { QiankunProps } from '@btc/shared-core';
import {
  createAdminApp,
  mountAdminApp,
  unmountAdminApp,
  updateAdminApp,
} from './bootstrap';
import type { AdminAppContext } from './bootstrap';
import { setupSubAppErrorCapture } from '@btc/shared-utils/error-monitor';
import { loadSharedResourcesFromLayoutApp } from '@btc/shared-utils/cdn/load-shared-resources';
import { removeLoadingElement, clearNavigationFlag, logger } from '@btc/shared-core';
import { tSync } from './i18n/getters';
// 注意：不再暴露 configImages 到全局，让共享组件直接使用默认配置
// 共享组件的默认配置会从 @btc-assets 导入图片，这些图片在 layout-app 的构建产物中
// 共享组件的 fixImagePath 函数会自动修复路径，确保在子应用中也能正确加载

// 关键：在应用启动时立即设置全局错误监听器，捕获 Vue patch 过程中的 DOM 操作错误
// 这些错误通常发生在组件更新时 DOM 节点已被移除的情况（如子应用卸载时）
// 注意：使用单例模式，避免重复添加监听器导致内存泄漏
let globalErrorHandler: ((event: ErrorEvent) => boolean | void) | null = null;

if (typeof window !== 'undefined' && !globalErrorHandler) {
  // 使用捕获阶段监听，确保能捕获所有错误（包括 Vue 内部的错误）
  globalErrorHandler = (event: ErrorEvent) => {
    const errorMessage = event.message || '';
    const errorStack = event.error?.stack || '';

    // 关键：CRUD 组件相关的错误不应该被静默处理
    // 这些错误通常表示组件配置问题，需要立即修复
    if (
      errorMessage.includes('Must be used inside') ||
      errorMessage.includes('BtcAddBtn') ||
      errorMessage.includes('BtcMultiDeleteBtn') ||
      errorMessage.includes('BtcRefreshBtn') ||
      errorMessage.includes('BtcUpsert') ||
      errorMessage.includes('BtcTable') ||
      errorMessage.includes('BtcPagination') ||
      errorMessage.includes('BtcCrud') ||
      errorStack.includes('BtcAddBtn') ||
      errorStack.includes('BtcMultiDeleteBtn') ||
      errorStack.includes('BtcRefreshBtn') ||
      errorStack.includes('BtcUpsert') ||
      errorStack.includes('BtcTable') ||
      errorStack.includes('BtcPagination') ||
      errorStack.includes('BtcCrud')
    ) {
      // CRUD 组件错误，必须输出，帮助排查问题
      logger.error('CRUD component error (must fix):', errorMessage, {
        error: event.error,
        stack: errorStack,
      });
      // 不阻止错误传播，让错误正常显示
      return false;
    }

    // 检查是否是 DOM 操作相关的错误
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
      return true; // 阻止默认错误处理
    }
    return false; // 其他错误继续正常处理
  };

  window.addEventListener('error', globalErrorHandler, true); // 使用捕获阶段
}

let context: AdminAppContext | null = null;
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
        appLoadingService.show(tSync('common.system.admin_module'));
      }
    } catch (error) {
      // 静默失败，继续执行
      if (import.meta.env.DEV) {
        console.warn('[admin-app] Cannot display app-level loading:', error);
      }
    }
  }

  try {
    // 先卸载前一个实例（如果存在）
    if (context) {
      try {
        await unmountAdminApp(context);
      } catch (error) {
        // 卸载失败不影响后续流程
      } finally {
        context = null;
      }
    }

    // 创建新实例
    context = await createAdminApp(props);
    await mountAdminApp(context, props);

    // 关键：应用挂载完成后，移除 Loading 并清理 sessionStorage 标记
    if (isStandalone && appLoadingService) {
      // 隐藏应用级 loading
      try {
        appLoadingService.hide(tSync('common.system.admin_module'));
      } catch (error) {
        // 静默失败
      }
    }
    removeLoadingElement();
    clearNavigationFlag();

    // 关键：确保 NProgress 和 AppSkeleton 也被关闭（避免双重 loading）
    // 在独立运行时，不应该显示 NProgress 或 AppSkeleton
    try {
      // 关闭 NProgress（如果正在运行）
      const NProgress = (await import('nprogress')).default;
      if (NProgress && typeof NProgress.done === 'function') {
        NProgress.done();
      }

      // 隐藏 AppSkeleton（如果存在）
      const skeleton = document.getElementById('app-skeleton');
      if (skeleton) {
        skeleton.style.setProperty('display', 'none', 'important');
        skeleton.style.setProperty('visibility', 'hidden', 'important');
        skeleton.style.setProperty('opacity', '0', 'important');
      }
    } catch (e) {
      // 静默失败
    }
  } catch (error) {
    logger.error('Render failed:', error);
    // 即使挂载失败，也要移除 Loading 并清理 context
    if (isStandalone && appLoadingService) {
      // 隐藏应用级 loading
      try {
        appLoadingService.hide(tSync('common.system.admin_module'));
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
// bootstrap 必须是轻量级的，直接返回 resolved Promise，确保最快速度
// 关键：bootstrap 阶段不做任何初始化工作，所有初始化都在 mount 阶段完成
// 这样可以避免在应用切换时出现竞态条件
function bootstrap() {
  // 确保 context 状态被重置（防止应用切换时的状态残留）
  // 注意：这里不清理 context，因为可能还在使用，真正的清理在 unmount 中完成
  return Promise.resolve();
}

async function mount(props: QiankunProps) {
  // 关键优化：将共享资源加载改为后台异步执行，不阻塞应用挂载
  // 应用可以立即挂载，共享资源在后台加载，如果加载失败会使用本地资源作为降级方案
  if (import.meta.env.PROD && !(window as any).__IS_LAYOUT_APP__) {
    // 不 await，让它在后台执行
    loadSharedResourcesFromLayoutApp({
      onProgress: (loaded, total) => {
        // 加载进度回调
      },
    }).catch((error) => {
      // 加载共享资源失败，继续使用本地资源
      // 静默失败，不影响应用运行
    });
  }

  // 设置子应用错误捕获（如果主应用传递了错误上报方法）
  // 关键：使用 try-catch 确保错误捕获设置失败不会阻塞应用挂载
  try {
    if (props.appName && typeof props.appName === 'string') {
      setupSubAppErrorCapture({
        updateErrorList: typeof props.updateErrorList === 'function'
          ? (props.updateErrorList as (errorInfo: any) => void | Promise<void>)
          : undefined,
        appName: props.appName,
      });
    }
  } catch (error) {
    // 错误捕获设置失败不影响应用运行
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
      await unmountAdminApp(context, props);
    } catch (error) {
      // 卸载失败不影响后续流程
    } finally {
      context = null;
    }
  }

  // 清理全局错误监听器（避免内存泄漏）
  if (globalErrorHandler && typeof window !== 'undefined') {
    window.removeEventListener('error', globalErrorHandler, true);
    globalErrorHandler = null;
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
  async update(props: QiankunProps) {
    if (context) {
      updateAdminApp(context, props);
    }
  },
  unmount,
});
}

// 导出 timeouts 配置，供 single-spa 使用
// 注意：qiankun 封装后，优先读取主应用 start 中的 lifeCycles 配置
// 这里的配置作为 fallback，主应用配置为准
// 关键：增加生产环境的超时时间，避免网络延迟和资源加载导致的超时
// 注意：使用 import.meta.env.PROD 而不是 !import.meta.env.DEV，确保生产环境构建时正确识别
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
                render({ container: viewport } as any).catch(() => {
                  // 挂载失败
                });
              } else {
                render().catch(() => {
                  // 独立运行失败
                });
              }
            });
          } else {
            // layout-app 加载失败或不需要加载，独立渲染
            render().catch(() => {
              // 独立运行失败
            });
          }
        })
        .catch(() => {
          // layout-app 加载失败，独立渲染
          render().catch(() => {
            // 独立运行失败
          });
        });
    }).catch(() => {
      // 导入失败，直接渲染
      render().catch(() => {
        // 独立运行失败
      });
    });
  } else {
    // 不需要加载 layout-app（非生产环境），直接渲染
    render().catch(() => {
      // 独立运行失败
    });
  }
}
