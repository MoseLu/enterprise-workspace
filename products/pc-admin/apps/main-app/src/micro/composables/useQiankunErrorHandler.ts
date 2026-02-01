/**
 * Qiankun 错误处理 Composable
 * 处理子应用加载错误和资源加载错误
 */

import { getAppConfig } from '@btc/shared-core/configs/app-env.config';
;
import { microApps } from '../apps';

// 获取主应用配置（用于判断当前是否在主应用预览端口）
const MAIN_APP_CONFIG = getAppConfig('main-app');
const MAIN_APP_PREVIEW_PORT = MAIN_APP_CONFIG?.prePort || '4180';

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

// 创建 entry 映射，用于在拦截器中查找应用的入口地址
let globalEntryMap: Map<string, string> | null = null;

/**
 * 获取或初始化全局 entry 映射
 * 延迟初始化，避免构建时的循环依赖问题
 */
function getGlobalEntryMap(): Map<string, string> {
  if (!globalEntryMap) {
    globalEntryMap = new Map<string, string>();
    // 延迟访问 microApps，确保在运行时才执行
    const apps = microApps;
    apps.forEach(app => {
      globalEntryMap!.set(app.name, app.entry);
    });
  }
  return globalEntryMap;
}

/**
 * 根据路径获取应用名称
 */
function getAppNameFromPath(path: string): string | null {
  if (path.startsWith('/admin')) {
    return 'admin';
  } else if (path.startsWith('/logistics')) {
    return 'logistics';
  } else if (path.startsWith('/engineering')) {
    return 'engineering';
  } else if (path.startsWith('/quality')) {
    return 'quality';
  } else if (path.startsWith('/production')) {
    return 'production';
  } else if (path.startsWith('/finance')) {
    return 'finance';
  }
  return null;
}

/**
 * 设置全局错误监听器
 */
export function setupQiankunErrorHandler(): void {
  // 监听全局错误
  window.addEventListener('error', async (event) => {
    if (event.message?.includes('application')) {
      const appMatch = event.message.match(/'(\w+)'/);
      const appName = appMatch && appMatch[1] ? appNameMap[appMatch[1]] || appMatch[1] : '应用';

      // 隐藏应用级 Loading
      try {
        const { appLoadingService } = await import('@btc/shared-core');
        appLoadingService.hide(appName);
      } catch (error) {
        console.warn('[qiankun] 无法加载 AppLoadingService，尝试强制关闭loading', error);
        // 兜底方案：直接通过 DOM 关闭所有 .app-loading 元素
        const loadingEls = document.querySelectorAll('.app-loading');
        loadingEls.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
            el.style.setProperty('opacity', '0', 'important');
            el.style.setProperty('pointer-events', 'none', 'important');
            setTimeout(() => {
              if (el.parentNode) {
                el.parentNode.removeChild(el);
              }
            }, 100);
          }
        });
      }

      // 动态导入避免循环依赖
      const { loadingError } = await import('../../utils/loadingManager');
      loadingError(appName, event.error);
    }

    // 处理资源加载错误（404），尝试修复路径
    if (event.target && (event.target instanceof HTMLScriptElement || event.target instanceof HTMLLinkElement)) {
      const target = event.target as HTMLScriptElement | HTMLLinkElement;
      const src = (event.target instanceof HTMLScriptElement ? event.target.src : null) ||
                  (event.target instanceof HTMLLinkElement ? event.target.href : null);

      // 处理资源加载错误（404），包括开发环境和生产环境
      if (!src) {
        return;
      }

      // 检查是否是源文件路径错误（包含 /src/ 或 /packages/）
      const isSourcePathError = src.includes('/packages/') || src.includes('/src/');

      // 如果是源文件路径错误，直接忽略（这些文件应该在构建时被打包）
      // 包括所有 /packages/ 和 /src/ 路径，这些都不应该在生产环境出现
      if (isSourcePathError) {
        console.warn(`[错误处理] 忽略源文件路径错误: ${src} (此文件应在构建时被打包)`);
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // 检查是否是开发环境的资源加载错误
      const isDevError = window.location.port === '4180' &&
        (src.includes('/assets/') || src.endsWith('.js') || src.endsWith('.css') || src.endsWith('.mjs'));

      if (isDevError) {
        // 根据当前路径判断是哪个应用
        const currentPath = window.location.pathname;
        const targetAppName = getAppNameFromPath(currentPath);

        if (targetAppName) {
          const appEntry = getGlobalEntryMap().get(targetAppName);
          if (appEntry) {
            // 解析 entry（可能是完整 URL 或协议相对路径）
            let entryUrl: URL | null = null;
            try {
              if (appEntry.startsWith('http://') || appEntry.startsWith('https://')) {
                entryUrl = new URL(appEntry);
              } else if (appEntry.startsWith('//')) {
                entryUrl = new URL(`${window.location.protocol}${appEntry}`);
              } else if (appEntry.startsWith('/')) {
                entryUrl = new URL(appEntry, window.location.origin);
              }
            } catch (e) {
              console.warn('[错误处理] 解析 appEntry URL 失败:', appEntry, e);
            }

            if (entryUrl) {
              const port = entryUrl.port || '';
              const protocol = window.location.protocol;
              const host = window.location.hostname;

              if (port && port !== MAIN_APP_PREVIEW_PORT) {
                // 修复 URL
                let fixedUrl = src;

                if (src.includes(`:${window.location.port}`)) {
                  fixedUrl = src.replace(new RegExp(`:${window.location.port}(?=/|$)`, 'g'), `:${port}`);
                } else if (src.startsWith('/')) {
                  fixedUrl = `${protocol}//${host}:${port}${src}`;
                } else if (src.startsWith('//') && !src.includes(':')) {
                  // 协议相对路径，添加端口
                  fixedUrl = `//${host}:${port}${src.slice(`//${host}`.length)}`;
                }

                // 重新加载资源
                if (fixedUrl !== src) {
                  console.info(`[错误处理] 修复资源路径: ${src} -> ${fixedUrl}`);
                  if (target instanceof HTMLScriptElement) {
                    const newScript = document.createElement('script');
                    newScript.src = fixedUrl;
                    newScript.type = 'module';
                    target.parentNode?.replaceChild(newScript, target);
                  } else if (target instanceof HTMLLinkElement) {
                    // 对于 CSS 文件，直接更新 href 可能不够，需要重新创建 link 标签
                    const newLink = document.createElement('link');
                    newLink.rel = target.rel || 'stylesheet';
                    newLink.href = fixedUrl;
                    if (target.type) {
                      newLink.type = target.type;
                    }
                    target.parentNode?.replaceChild(newLink, target);
                  }

                  // 阻止默认错误处理
                  event.preventDefault();
                }
              }
            }
          }
        }
      }
    }
  });
}

