;
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import 'virtual:svg-icons';
// 暗色主题覆盖样式（必须在 Element Plus dark 样式之后加载，使用 CSS 确保在微前端环境下生效）
import '@btc/shared-components/styles/dark-theme.css';
// 应用全局样式（已在 bootstrap-subapp.ts 中导入，这里不再重复导入）

// 关键：在模块加载时就导入 getters.ts，确保 __SUBAPP_I18N_GETTERS__ 在 beforeMount 之前就注册
// 这样主应用在 beforeMount 时就能获取到动态生成的国际化消息
import './i18n/getters';

import type { QiankunProps } from '@btc/shared-core';
import {
  createSystemApp,
  mountSystemApp,
  unmountSystemApp,
  updateSystemApp,
} from './bootstrap-subapp';
import type { SystemAppContext } from './bootstrap-subapp';
import { setupSubAppErrorCapture } from '@btc/shared-utils/error-monitor';
import { loadSharedResourcesFromLayoutApp } from '@btc/shared-utils/cdn/load-shared-resources';
import { removeLoadingElement, clearNavigationFlag, logger } from '@btc/shared-core';
import { tSync } from './i18n/getters';

let context: SystemAppContext | null = null;
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
        appLoadingService.show(tSync('domain.type.system') || '系统模块');
      }
    } catch (error) {
      // 静默失败，继续执行
      if (import.meta.env.DEV) {
        console.warn('[system-app] 无法显示应用级 loading:', error);
      }
    }
  }
  
  try {
    // 先卸载前一个实例（如果存在）
    if (context) {
      try {
        await unmountSystemApp(context);
      } catch (error) {
        // 卸载失败不影响后续流程
      } finally {
        context = null;
      }
    }

    // 创建新实例
    context = await createSystemApp(props);
    await mountSystemApp(context, props);

    // 关键：应用挂载完成后，移除 Loading 并清理 sessionStorage 标记
    if (isStandalone && appLoadingService) {
      // 隐藏应用级 loading
      try {
        appLoadingService.hide(tSync('domain.type.system') || '系统模块');
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
    logger.error('[system-app] 渲染失败:', error);
    // 即使挂载失败，也要移除 Loading 并清理 context
    if (isStandalone && appLoadingService) {
      // 隐藏应用级 loading
      try {
        appLoadingService.hide(tSync('domain.type.system') || '系统模块');
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
      await unmountSystemApp(context, props);
    } catch (error) {
      // 卸载失败不影响后续流程
    } finally {
      context = null;
    }
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
      updateSystemApp(context, props);
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
// 注意：system-app 作为子应用，独立运行时应该直接渲染（不加载 layout-app）
// 因为 system-app 现在已经是子应用，不再需要 layout-app 的支持
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
  // 直接渲染，不需要加载 layout-app
  render().catch((error) => {
    logger.error('[system-app] 独立运行失败:', error);
  });
}
