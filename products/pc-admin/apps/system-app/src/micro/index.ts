// 关键：qiankun 使用动态导入，避免在作为子应用时加载 qiankun 模块
// 静态导入会导致 qiankun 的 effects 模块被执行，触发定时器创建，导致警告
// import { registerMicroApps, start } from 'qiankun';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { storage } from '@btc/shared-utils';
import { sessionStorage } from '@btc/shared-core/utils/storage/session';
import { microApps } from './apps';
import { getAppConfig } from '@btc/shared-core/configs/app-env.config';
import { getAppBySubdomain, getAppByPathPrefix } from '@btc/shared-core/configs/app-scanner';
import { initErrorMonitor, updateErrorList, setupGlobalErrorCapture } from '../utils/errorMonitor';
;

// 获取 system-app 配置（用于判断当前是否在 system-app 预览端口）
const SYSTEM_APP_CONFIG = getAppConfig('system-app');
const SYSTEM_APP_PREVIEW_PORT = SYSTEM_APP_CONFIG?.prePort || '4181';
// 使用动态导入避免循环依赖导致的打包错误
// import { startLoading, finishLoading, loadingError } from '../utils/loadingManager';

/**
 * 清除所有 #Loading 元素（可能来自子应用的 index.html）
 * 这个元素会导致页面一直显示 loading 状态
 */
function clearLoadingElement() {
  // 查找所有可能的#Loading元素（可能有多个，来自不同子应用）
  const loadingEls = document.querySelectorAll('#Loading');
  loadingEls.forEach((loadingEl) => {
    if (loadingEl instanceof HTMLElement) {
      // 立即隐藏，使用important确保优先级
      loadingEl.style.setProperty('display', 'none', 'important');
      loadingEl.style.setProperty('visibility', 'hidden', 'important');
      loadingEl.style.setProperty('opacity', '0', 'important');
      loadingEl.style.setProperty('pointer-events', 'none', 'important');
      loadingEl.style.setProperty('z-index', '-1', 'important');
      loadingEl.classList.add('is-hide');
      // 延迟移除，确保动画完成
      setTimeout(() => {
        if (loadingEl.parentNode) {
          loadingEl.parentNode.removeChild(loadingEl);
        }
      }, 100);
    }
  });
}

import { getManifestTabs, getManifestMenus } from '@btc/shared-core/manifest';
import { assignIconsToMenuTree } from '@btc/shared-core';

// 关键：在模块加载时立即设置日志过滤，确保能拦截所有警告
// 这必须在任何其他代码执行之前完成
if (typeof window !== 'undefined') {
  // 立即执行过滤逻辑（使用 IIFE 确保立即执行）
  (function() {
    // 防止重复设置
    if ((window as any).__qiankun_logs_filtered__) {
      return;
    }
    (window as any).__qiankun_logs_filtered__ = true;

    // 保存原始方法（如果还没有保存的话）
    // 注意：setupGlobalErrorCapture() 可能已经替换了 console.warn，所以优先使用已保存的原始方法
    if (!(console as any).__originalLog) {
      (console as any).__originalLog = console.log;
    }
    if (!(console as any).__originalInfo) {
      (console as any).__originalInfo = console.info;
    }
    if (!(console as any).__originalWarn) {
      (console as any).__originalWarn = console.warn;
    }
    if (!(console as any).__originalError) {
      (console as any).__originalError = console.error;
    }

    // 使用已保存的原始方法，如果没有则使用当前的（可能是被其他代码替换过的）
    const originalLog = ((console as any).__originalLog || console.log).bind(console);
    const originalInfo = ((console as any).__originalInfo || console.info).bind(console);
    const originalWarn = ((console as any).__originalWarn || console.warn).bind(console);
    const originalError = ((console as any).__originalError || console.error).bind(console);

    // 检查是否应该过滤日志的辅助函数
    const shouldFilter = (...args: any[]): boolean => {
      // 检查所有参数中是否包含 qiankun sandbox 相关日志
      for (const arg of args) {
        if (typeof arg === 'string') {
          if (arg.includes('[qiankun:sandbox]') ||
              arg.includes('modified global properties') ||
              arg.includes('restore...')) {
            return true;
          }
        }
      }
      return false;
    };

    // 过滤 console.log
    console.log = (...args: any[]) => {
      if (shouldFilter(...args)) {
        return;
      }
      // 使用 logger 统一输出，支持日志上报和格式统一
      const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
      console.info(message, ...args);
    };

    // 过滤 console.info
    console.info = (...args: any[]) => {
      if (shouldFilter(...args)) {
        return;
      }
      // 使用 logger 统一输出，支持日志上报和格式统一
      const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
      console.info(message, ...args);
    };

  // 过滤 console.warn
  console.warn = (...args: any[]) => {
    // 过滤 qiankun sandbox 警告
    if (shouldFilter(...args)) {
      return;
    }
    // 过滤 single-spa 的 warningMillis 警告（这是正常的，不是错误）
    // 检查多种可能的警告格式
    const firstArg = args[0];
    if (typeof firstArg === 'string') {
      if (firstArg.includes('single-spa minified message #31') ||
          firstArg.includes('single-spa.js.org/error/?code=31') ||
          (firstArg.includes('code=31') && firstArg.includes('bootstrap'))) {
        return;
      }
    }
    // 检查所有参数中是否包含 single-spa 警告
    for (const arg of args) {
      if (typeof arg === 'string' && (
        arg.includes('single-spa minified message #31') ||
        arg.includes('single-spa.js.org/error/?code=31') ||
        (arg.includes('code=31') && arg.includes('bootstrap'))
      )) {
        return;
      }
    }
    // 使用 logger 统一输出，支持日志上报和格式统一
    const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
    console.warn(message, ...args);
  };

  // 过滤 console.error（single-spa 错误代码 31 通过 error 输出）
  console.error = (...args: any[]) => {
    // 过滤 qiankun sandbox 错误
    if (shouldFilter(...args)) {
      return;
    }
    // 过滤 single-spa 的错误代码 31（bootstrap 相关错误）
    const firstArg = args[0];
    if (typeof firstArg === 'string') {
      if (firstArg.includes('single-spa minified message #31') ||
          firstArg.includes('single-spa.js.org/error/?code=31') ||
          (firstArg.includes('code=31') && firstArg.includes('bootstrap'))) {
        return;
      }
    }
    // 检查所有参数中是否包含 single-spa 错误
    for (const arg of args) {
      if (typeof arg === 'string' && (
        arg.includes('single-spa minified message #31') ||
        arg.includes('single-spa.js.org/error/?code=31') ||
        (arg.includes('code=31') && arg.includes('bootstrap'))
      )) {
        return;
      }
    }
    // 使用 console 统一输出，支持日志上报和格式统一
    const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
    const errorArg = args.find(arg => arg instanceof Error) || args[1];
    console.error(message, errorArg, ...args);
  };
})();
}

// 定义类型，避免直接导入（在函数内部动态导入）
type TabMeta = {
  key: string;
  title: string;
  path: string;
  i18nKey?: string;
};

type MenuItem = {
  index: string;
  title: string;
  icon?: string;
  children?: MenuItem[];
  // 外链跳转：指向子应用的子域名完整地址（如 https://admin.bellis.com.cn）
  // 如果设置了 externalUrl，点击菜单项时会跳转到该地址，同时保留主应用的布局
  externalUrl?: string;
};


// 应用名称映射（用于显示友好的中文名称，使用 domain.type 的值）
const appNameMap: Record<string, string> = {
  system: '主模块',
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

export async function registerManifestTabsForApp(appName: string): Promise<void> {
  const tabs = getManifestTabs(appName);
  if (!tabs.length) {
    return Promise.resolve();
  }

  // 动态导入避免循环依赖
  const { registerTabs } = await import('../store/tabRegistry');

  const normalizedTabs: TabMeta[] = tabs.map((tab: any) => {
    const result: TabMeta = {
      key: tab.key,
      title: tab.labelKey ?? tab.label ?? tab.path,
      path: tab.path,
    };
    // 明确处理可选属性的 undefined（exactOptionalPropertyTypes）
    if (tab.labelKey !== undefined) {
      result.i18nKey = tab.labelKey;
    }
    return result;
  });

  registerTabs(appName, normalizedTabs);
  return Promise.resolve();
}

/**
 * 规范化菜单路径：在开发环境下自动添加应用前缀，生产子域环境下移除应用前缀
 * manifest 中的菜单路径已经移除了应用前缀，所以：
 * - 开发环境（qiankun模式）：需要添加前缀 `/admin/xxx`
 * - 生产子域环境：移除应用前缀，保持原路径 `/xxx`
 */
function normalizeMenuPath(path: string, appName: string): string {
  if (!path || !appName) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // 检测是否在生产环境的子域名下
  if (typeof window === 'undefined') {
    // SSR 环境，保持原路径
    return normalizedPath;
  }

  const hostname = window.location.hostname;
  const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

  if (isProductionSubdomain) {
    // 生产环境子域名：使用应用扫描器获取子域名应用
    const appBySubdomain = getAppBySubdomain(hostname);
    const currentSubdomainApp = appBySubdomain?.id;

    // 如果在子域名环境下，且路径以应用前缀开头，移除前缀
    if (currentSubdomainApp && currentSubdomainApp === appName) {
      const appPrefix = `/${appName}`;
      if (normalizedPath === appPrefix) {
        // 如果是应用根路径，返回 /
        return '/';
      } else if (normalizedPath.startsWith(`${appPrefix}/`)) {
        // 移除应用前缀
        return normalizedPath.substring(appPrefix.length);
      }
    }

    // 生产环境子域名：保持原路径（manifest 中已经没有前缀了）
    return normalizedPath;
  }

  // 开发环境（qiankun模式）：需要添加应用前缀
  // 系统域是主应用，不需要添加前缀
  if (appName === 'system') {
    return normalizedPath;
  }

  // 如果路径已经是根路径，直接返回应用前缀
  if (normalizedPath === '/') {
    return `/${appName}`;
  }

  // 如果路径已经包含应用前缀，不需要重复添加
  if (normalizedPath.startsWith(`/${appName}/`) || normalizedPath === `/${appName}`) {
    return normalizedPath;
  }

  // 添加应用前缀
  return `/${appName}${normalizedPath}`;
}

// 递归转换菜单项（支持任意深度）
// 使用智能图标分配，确保同一域内图标不重复且语义匹配
function normalizeMenuItems(items: any[], appName: string, usedIcons?: Set<string>): MenuItem[] {
  // 创建已使用图标集合（用于域内去重），如果已存在则复用
  const iconSet = usedIcons || new Set<string>();

  // 将 title 字段映射到 labelKey 字段，以便图标分配工具使用
  const itemsWithLabelKey = items.map(item => ({
    ...item,
    labelKey: item.labelKey || item.title || item.label,
  }));

  // 使用智能图标分配工具（会递归处理所有子菜单）
  const itemsWithIcons = assignIconsToMenuTree(itemsWithLabelKey, iconSet);

  // 递归转换函数，将 assignIconsToMenuTree 返回的结构转换为 MenuItem 格式
  // 在生产环境子域名下，自动移除应用前缀
  const convertToMenuItem = (item: any): MenuItem => {
    const normalizedIndex = normalizeMenuPath(item.index, appName);
    const labelKey = item.labelKey || item.title || item.label;
    return {
      index: normalizedIndex,
      title: labelKey ?? normalizedIndex,
      labelKey: labelKey, // 关键：保存 labelKey 用于面包屑翻译
      icon: item.icon,
      children: item.children && item.children.length > 0
        ? item.children.map(convertToMenuItem)
        : undefined,
    };
  };

  // 转换为 MenuItem 格式（不需要再次调用 assignIconsToMenuTree，因为已经处理了所有层级）
  return itemsWithIcons.map(convertToMenuItem);
}

// 深度比较两个菜单数组是否相同
function menusEqual(menus1: MenuItem[], menus2: MenuItem[]): boolean {
  if (menus1.length !== menus2.length) {
    return false;
  }

  for (let i = 0; i < menus1.length; i++) {
    const item1 = menus1[i];
    const item2 = menus2[i];

    // 如果任一项目为 undefined，不相等
    if (!item1 || !item2) {
      return false;
    }

    // 比较所有字段，包括 externalUrl
    if (item1.index !== item2.index ||
        item1.title !== item2.title ||
        item1.icon !== item2.icon ||
        item1.externalUrl !== item2.externalUrl) {
      return false;
    }

    // 递归比较子菜单
    if (item1.children && item2.children) {
      if (!menusEqual(item1.children, item2.children)) {
        return false;
      }
    } else if (item1.children || item2.children) {
      return false;
    }
  }

  return true;
}

export async function registerManifestMenusForApp(appName: string) {
  const menus = getManifestMenus(appName);

  // 动态导入避免循环依赖
  const { getMenusForApp, registerMenus } = await import('../store/menuRegistry');

  if (!menus.length) {
    // 如果菜单为空，且当前应用已经有菜单，则保留现有菜单，避免清空
    // 这对于系统域特别重要，因为系统域是默认应用，不应该被清空
    const existingMenus = getMenusForApp(appName);
    if (existingMenus.length > 0) {
      // 保留现有菜单，不进行清空操作
      return Promise.resolve();
    }
    // 如果既没有新菜单，也没有现有菜单，则清空（正常情况）
    return Promise.resolve();
  }

  // 将 manifest 菜单格式转换为 MenuItem 格式（递归处理任意深度）
  // 传递 appName 用于域内图标去重
  const normalizedMenus: MenuItem[] = normalizeMenuItems(menus, appName);

  // 获取现有菜单
  const existingMenus = getMenusForApp(appName);

  // 如果菜单内容相同且不为空，则跳过更新，避免触发不必要的响应式更新
  // 这样可以避免菜单在路由切换时不必要的刷新
  if (existingMenus.length > 0 && menusEqual(existingMenus, normalizedMenus)) {
    return Promise.resolve();
  }

  // 菜单内容不同或为空，需要重新注册
  // 注意：即使菜单内容相同，如果现有菜单为空，也需要重新注册（可能被 clearMenusExcept 清空了）
  registerMenus(appName, normalizedMenus);
  return Promise.resolve();
}

/**
 * 获取当前语言
 */
function getCurrentLocale(): string {
  // 从统一存储读取，或返回默认值
  return storage.get<string>('locale') || 'zh-CN';
}

/**
 * 过滤 qiankun 沙箱日志
 * 注意：这个函数现在主要用于确保过滤逻辑已设置（模块级别已设置）
 * 如果模块级别的过滤没有生效，这里作为兜底
 */
function filterQiankunLogs() {
  // 如果模块级别的过滤已经设置，这里不需要重复设置
  if ((window as any).__qiankun_logs_filtered__) {
    return;
  }

  // 如果模块级别的过滤没有生效，这里作为兜底
  // 这种情况不应该发生，但为了安全起见保留这个函数
  (window as any).__qiankun_logs_filtered__ = true;

  // 保存原始方法（保存到全局，供其他地方使用）
  // 注意：setupGlobalErrorCapture() 可能已经替换了 console.warn，所以优先使用已保存的原始方法
  if (!(console as any).__originalLog) {
    (console as any).__originalLog = console.log;
  }
  if (!(console as any).__originalInfo) {
    (console as any).__originalInfo = console.info;
  }
  if (!(console as any).__originalWarn) {
    (console as any).__originalWarn = console.warn;
  }
  if (!(console as any).__originalError) {
    (console as any).__originalError = console.error;
  }

  // 使用已保存的原始方法，如果没有则使用当前的（可能是被其他代码替换过的）
  const originalLog = ((console as any).__originalLog || console.log).bind(console);
  const originalInfo = ((console as any).__originalInfo || console.info).bind(console);
  const originalWarn = ((console as any).__originalWarn || console.warn).bind(console);

  // 检查是否应该过滤日志的辅助函数
  const shouldFilter = (...args: any[]): boolean => {
    // 检查所有参数中是否包含 qiankun sandbox 相关日志
    for (const arg of args) {
      if (typeof arg === 'string') {
        if (arg.includes('[qiankun:sandbox]') ||
            arg.includes('modified global properties') ||
            arg.includes('restore...')) {
          return true;
        }
      }
    }
    return false;
  };

  // 过滤 console.log
  console.log = (...args: any[]) => {
    if (shouldFilter(...args)) {
      return;
    }
    // 使用 logger 统一输出，支持日志上报和格式统一
    const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
    console.info(message, ...args);
  };

  // 过滤 console.info
  console.info = (...args: any[]) => {
    if (shouldFilter(...args)) {
      return;
    }
    // 使用 logger 统一输出，支持日志上报和格式统一
    const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
    console.info(message, ...args);
  };

  // 过滤 console.warn
  console.warn = (...args: any[]) => {
    // 过滤 qiankun sandbox 警告
    if (shouldFilter(...args)) {
      return;
    }
    // 过滤 single-spa 的 warningMillis 警告（这是正常的，不是错误）
    // 检查多种可能的警告格式
    const firstArg = args[0];
    if (typeof firstArg === 'string') {
      if (firstArg.includes('single-spa minified message #31') ||
          firstArg.includes('single-spa.js.org/error/?code=31') ||
          (firstArg.includes('code=31') && firstArg.includes('bootstrap'))) {
        return;
      }
    }
    // 检查所有参数中是否包含 single-spa 警告
    for (const arg of args) {
      if (typeof arg === 'string' && (
        arg.includes('single-spa minified message #31') ||
        arg.includes('single-spa.js.org/error/?code=31') ||
        (arg.includes('code=31') && arg.includes('bootstrap'))
      )) {
        return;
      }
    }
    // 使用 logger 统一输出，支持日志上报和格式统一
    const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
    console.warn(message, ...args);
  };
}

// 创建 entry 映射，用于在拦截器中查找应用的入口地址
// 注意：这个映射需要在 setupQiankun 外部定义，以便拦截器可以访问
// 使用懒加载模式，避免构建时的循环依赖问题
let globalEntryMap: Map<string, string> | null = null;

// 关键：在模块级别尽早设置全局资源拦截器
// 这确保拦截器在页面加载时就能拦截所有资源请求，包括动态 import
// 使用立即执行函数（IIFE）来避免在构建时执行代码
if (typeof window !== 'undefined') {
  // 在浏览器环境中，立即设置拦截器
  (function() {
    // 全局拦截 fetch 请求，修复从错误端口加载的资源
    const originalFetch = window.fetch;
    // 标记拦截器已设置，防止被覆盖
    (window as any).__btc_resource_interceptor_set__ = true;
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      let url: string;
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof URL) {
        url = input.href;
      } else {
        url = input.url;
      }

      // 关键：API 请求（包含 /api/ 路径）直接放行，不进行任何拦截处理
      // 这确保 EPS 请求和其他 API 请求不会被影响
      // 检查多种形式的 API URL：
      // - /api/... (相对路径)
      // - http://host/api/... (完整 URL)
      // - https://host/api/... (完整 URL)
      if (url.includes('/api/') || url.endsWith('/api') || url.match(/\/api(\?|$|#)/)) {
        return originalFetch.call(this, input as any, init);
      }

      // 判断是否是资源文件
      const isAssetFile = url.includes('/assets/') || url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.mjs');

      // 如果当前在 system-app 预览端口且是资源文件，检查是否需要修复
      const currentPort = window.location.port;
      if (currentPort === SYSTEM_APP_PREVIEW_PORT && isAssetFile) {
        // 如果当前在子应用路径下，检查 URL 是否需要修复
        const currentPath = window.location.pathname;
        let targetAppName: string | null = null;

        if (currentPath.startsWith('/admin')) {
          targetAppName = 'admin';
        } else if (currentPath.startsWith('/logistics')) {
          targetAppName = 'logistics';
        } else if (currentPath.startsWith('/engineering')) {
          targetAppName = 'engineering';
        } else if (currentPath.startsWith('/quality')) {
          targetAppName = 'quality';
        } else if (currentPath.startsWith('/production')) {
          targetAppName = 'production';
        } else if (currentPath.startsWith('/finance')) {
          targetAppName = 'finance';
        }

        // 如果当前在子应用路径下，尝试修复 URL
        if (targetAppName) {
          try {
            // 延迟获取 entryMap，避免构建时的循环依赖
            const entryMap = getGlobalEntryMap();
            const appEntry = entryMap.get(targetAppName);
            if (appEntry && !appEntry.startsWith('/')) {
              const entryMatch = appEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
              if (entryMatch) {
                const targetPort = entryMatch[4] || '';
                if (targetPort && targetPort !== SYSTEM_APP_PREVIEW_PORT) {
                  const currentHost = window.location.hostname;
                  const protocol = window.location.protocol;
                  let needsFix = false;
                  let fixedUrl = url;

                  // 情况1：URL 包含错误的端口（主应用预览端口）- 这是最常见的情况
                  // 检查 URL 中是否包含主应用预览端口或当前端口
                  const portRegex = new RegExp(`:${currentPort}(?=/|$|\\s)`, 'g');
                  if (portRegex.test(url)) {
                    fixedUrl = url.replace(portRegex, `:${targetPort}`);
                    needsFix = true;
                  }
                  // 情况2：相对路径的资源文件（以 / 开头）
                  else if (url.startsWith('/') && !url.startsWith('//')) {
                    fixedUrl = `${protocol}//${currentHost}:${targetPort}${url}`;
                    needsFix = true;
                  }
                  // 情况3：协议相对路径（//host/），但没有端口或端口错误
                  else if (url.startsWith('//')) {
                    // 检查是否是当前 hostname 或 localhost
                    const hostMatch = url.match(/^\/\/([^:/]+)(?::(\d+))?/);
                    if (hostMatch) {
                      const urlHost = hostMatch[1];
                      const urlPort = hostMatch[2];
                      // 如果是当前 hostname 或 localhost，且端口是主应用预览端口或没有端口
                      if ((urlHost === currentHost || urlHost === 'localhost') && (!urlPort || urlPort === SYSTEM_APP_PREVIEW_PORT)) {
                        fixedUrl = url.replace(/^\/\/[^/]+/, `//${currentHost}:${targetPort}`);
                        needsFix = true;
                      }
                    }
                  }
                  // 情况4：相对路径但包含 /assets/（可能以 ./ 或 ../ 开头）
                  else if (url.includes('/assets/') && !url.includes('://') && !url.startsWith('/') && !url.startsWith('data:') && !url.startsWith('blob:')) {
                    fixedUrl = `${protocol}//${currentHost}:${targetPort}/${url.replace(/^\.\/?/, '')}`;
                    needsFix = true;
                  }

                  if (needsFix && fixedUrl !== url) {
                    console.info(`[Resource Interceptor] 修复资源路径: ${url} -> ${fixedUrl}`);
                    // 使用修复后的 URL 调用原始 fetch
                    if (typeof input === 'string') {
                      return originalFetch.call(this, fixedUrl, init);
                    } else if (input instanceof URL) {
                      return originalFetch.call(this, new URL(fixedUrl), init);
                    } else {
                      return originalFetch.call(this, new Request(fixedUrl, input), init);
                    }
                  }
                }
              }
            }
          } catch (error) {
            // 如果获取 entryMap 失败，继续使用原始 URL
            console.error('[资源拦截器] 获取 entryMap 失败:', error);
          }
        }
      }

      // 默认行为：先执行原始请求
      // 注意：对于非资源文件的请求（如 API 请求），应该已经在上面的检查中被放行了
      return originalFetch.call(this, input as any, init).then(async (response) => {
        // 如果响应是 HTML（说明可能是 404 页面），且请求的是 JavaScript 文件，尝试修复并重试
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html') && isAssetFile && url.includes('/assets/')) {
          const currentPath = window.location.pathname;
          let targetAppName: string | null = null;

          if (currentPath.startsWith('/admin')) {
            targetAppName = 'admin';
          } else if (currentPath.startsWith('/logistics')) {
            targetAppName = 'logistics';
          } else if (currentPath.startsWith('/engineering')) {
            targetAppName = 'engineering';
          } else if (currentPath.startsWith('/quality')) {
            targetAppName = 'quality';
          } else if (currentPath.startsWith('/production')) {
            targetAppName = 'production';
          } else if (currentPath.startsWith('/finance')) {
            targetAppName = 'finance';
          }

          if (targetAppName && currentPort === SYSTEM_APP_PREVIEW_PORT) {
            try {
              const entryMap = getGlobalEntryMap();
              const appEntry = entryMap.get(targetAppName);
              if (appEntry && !appEntry.startsWith('/')) {
                const entryMatch = appEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
                if (entryMatch) {
                  const targetPort = entryMatch[4] || '';
                  if (targetPort && targetPort !== SYSTEM_APP_PREVIEW_PORT) {
                    const currentHost = window.location.hostname;
                    const protocol = window.location.protocol;

                    // 提取文件名
                    const fileName = url.split('/').pop() || '';
                    // 尝试从正确的端口加载
                    const fixedUrl = `${protocol}//${currentHost}:${targetPort}/assets/${fileName}`;

                    console.info(`[Resource Interceptor] 检测到 404，尝试修复路径: ${url} -> ${fixedUrl}`);
                    const retryResponse = await originalFetch.call(this, fixedUrl, init);
                    const retryContentType = retryResponse.headers.get('content-type');

                    // 如果返回的是 JavaScript，使用修复后的响应
                    if (retryContentType && (retryContentType.includes('application/javascript') ||
                        retryContentType.includes('text/javascript') ||
                        retryContentType.includes('application/x-javascript'))) {
                      return retryResponse;
                    }
                  }
                }
              }
            } catch (error) {
              console.error('[资源拦截器] 重试失败:', error);
            }
          }
        }

        return response;
      });
    };
  })();
}

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
 * 初始化全局资源拦截器
 * 必须在页面加载时尽早设置，确保能拦截所有资源请求
 */
function setupGlobalResourceInterceptor() {
  // 确保 globalEntryMap 已初始化
  getGlobalEntryMap();

  // 全局拦截 fetch 请求，修复从错误端口加载的资源
  // 这是最后的兜底方案，确保所有资源请求都能被正确修复
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let url: string;
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.href;
    } else {
      url = input.url;
    }

    // 关键：API 请求（包含 /api/ 路径）直接放行，不进行任何拦截处理
    // 这确保 EPS 请求和其他 API 请求不会被影响
    // 检查多种形式的 API URL：
    // - /api/... (相对路径)
    // - http://host/api/... (完整 URL)
    // - https://host/api/... (完整 URL)
    if (url.includes('/api/') || url.endsWith('/api') || url.match(/\/api(\?|$|#)/)) {
      return originalFetch.call(this, input as any, init);
    }

    // 关键：在主应用预览端口下，检查所有资源请求
    // 包括：/assets/ 路径、.js 文件、相对路径等
    // 判断是否是资源文件
    const isAssetFile = url.includes('/assets/') || url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.mjs');

    // 如果当前在主应用预览端口且是资源文件，检查是否需要修复
    const currentPort = window.location.port;
    if (currentPort === SYSTEM_APP_PREVIEW_PORT && isAssetFile) {
      // 如果当前在子应用路径下，检查 URL 是否需要修复
      const currentPath = window.location.pathname;
      let targetAppName: string | null = null;

      if (currentPath.startsWith('/admin')) {
        targetAppName = 'admin';
      } else if (currentPath.startsWith('/logistics')) {
        targetAppName = 'logistics';
      } else if (currentPath.startsWith('/engineering')) {
        targetAppName = 'engineering';
      } else if (currentPath.startsWith('/quality')) {
        targetAppName = 'quality';
      } else if (currentPath.startsWith('/production')) {
        targetAppName = 'production';
      } else if (currentPath.startsWith('/finance')) {
        targetAppName = 'finance';
      }

      // 如果当前在子应用路径下，尝试修复 URL
      if (targetAppName) {
        const appEntry = getGlobalEntryMap().get(targetAppName);
        if (appEntry && !appEntry.startsWith('/')) {
          const entryMatch = appEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
          if (entryMatch) {
            const targetPort = entryMatch[4] || '';
            if (targetPort && targetPort !== SYSTEM_APP_PREVIEW_PORT) {
              const currentHost = window.location.hostname;
              const protocol = window.location.protocol;
              let needsFix = false;
              let fixedUrl = url;

              // 情况1：URL 包含错误的端口（主应用预览端口）- 这是最常见的情况
              // 检查 URL 中是否包含主应用预览端口或当前端口
              const portRegex = new RegExp(`:${currentPort}(?=/|$|\\s)`, 'g');
              const mainPortRegex = new RegExp(`:${SYSTEM_APP_PREVIEW_PORT}(?=/|$|\\s)`, 'g');
              if (portRegex.test(url) || mainPortRegex.test(url)) {
                fixedUrl = url.replace(portRegex, `:${targetPort}`).replace(mainPortRegex, `:${targetPort}`);
                needsFix = true;
              }
              // 情况2：相对路径的资源文件（以 / 开头）
              else if (url.startsWith('/') && !url.startsWith('//')) {
                fixedUrl = `${protocol}//${currentHost}:${targetPort}${url}`;
                needsFix = true;
              }
              // 情况3：协议相对路径（//host/），但没有端口或端口错误
              else if (url.startsWith('//')) {
                // 检查是否是当前 hostname 或 localhost
                const hostMatch = url.match(/^\/\/([^:/]+)(?::(\d+))?/);
                if (hostMatch) {
                  const urlHost = hostMatch[1];
                  const urlPort = hostMatch[2];
                  // 如果是当前 hostname 或 localhost，且端口是主应用预览端口或没有端口
                  if ((urlHost === currentHost || urlHost === 'localhost') && (!urlPort || urlPort === SYSTEM_APP_PREVIEW_PORT)) {
                    fixedUrl = url.replace(/^\/\/[^/]+/, `//${currentHost}:${targetPort}`);
                    needsFix = true;
                  }
                }
              }
              // 情况4：相对路径但包含 /assets/（可能以 ./ 或 ../ 开头）
              else if (url.includes('/assets/') && !url.includes('://') && !url.startsWith('/') && !url.startsWith('data:') && !url.startsWith('blob:')) {
                fixedUrl = `${protocol}//${currentHost}:${targetPort}/${url.replace(/^\.\/?/, '')}`;
                needsFix = true;
              }

              if (needsFix && fixedUrl !== url) {
                console.info(`[Resource Interceptor] 修复资源路径: ${url} -> ${fixedUrl}`);
                // 使用修复后的 URL 调用原始 fetch
                if (typeof input === 'string') {
                  return originalFetch.call(this, fixedUrl, init);
                } else if (input instanceof URL) {
                  return originalFetch.call(this, new URL(fixedUrl), init);
                } else {
                  return originalFetch.call(this, new Request(fixedUrl, input), init);
                }
              }
            }
          }
        }
      }
    }

    // 默认行为
    return originalFetch.call(this, input as any, init);
  };


  // 同时拦截 XMLHttpRequest（qiankun 可能使用它）
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
    let urlStr = typeof url === 'string' ? url : url.href;

    // 强制验证：在 HTTPS 页面下，绝对不允许 HTTP URL
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      if (urlStr.startsWith('http://')) {
        console.error('[HTTP] Micro 拦截：检测到 HTTPS 页面，阻止 HTTP 请求:', urlStr);
        // 尝试提取路径部分
        try {
          const urlObj = new URL(urlStr);
          urlStr = urlObj.pathname + urlObj.search;
        } catch (e) {
          // 如果 URL 解析失败，直接移除协议和域名
          urlStr = urlStr.replace(/^https?:\/\/[^/]+/, '');
        }
      }
    }

    // 检查是否是资源请求且从错误的端口加载
    if ((urlStr.includes('/assets/') || urlStr.endsWith('.js') || urlStr.endsWith('.css')) && urlStr.includes(`:${window.location.port}`) && window.location.port === SYSTEM_APP_PREVIEW_PORT) {
      // 根据当前路径判断是哪个应用
      const currentPath = window.location.pathname;
      let targetAppName: string | null = null;

      if (currentPath.startsWith('/admin')) {
        targetAppName = 'admin';
      } else if (currentPath.startsWith('/logistics')) {
        targetAppName = 'logistics';
      } else if (currentPath.startsWith('/engineering')) {
        targetAppName = 'engineering';
      } else if (currentPath.startsWith('/quality')) {
        targetAppName = 'quality';
      } else if (currentPath.startsWith('/production')) {
        targetAppName = 'production';
      } else if (currentPath.startsWith('/finance')) {
        targetAppName = 'finance';
      }

      if (targetAppName) {
        const appEntry = getGlobalEntryMap().get(targetAppName);
        if (appEntry && !appEntry.startsWith('/')) {
          const entryMatch = appEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
          if (entryMatch) {
            const port = entryMatch[4] || '';
            if (port && port !== SYSTEM_APP_PREVIEW_PORT) {
              urlStr = urlStr.replace(`:${window.location.port}`, `:${port}`);
            }
          }
        }
      }
    }

    return originalXHROpen.call(this, method, urlStr, async ?? true, username ?? null, password ?? null);
  };
}

// 存储当前激活的应用名称（用于判断是否是真正的应用切换）
let currentActiveApp: string | null = null;

/**
 * 初始化qiankun微前端
 */
export async function setupQiankun() {
  // 关键：如果 system-app 作为 qiankun 子应用运行，不应该启动 qiankun
  // 只有主应用才应该调用 start()
  // 双重检查：检查 qiankunWindow 和 window.__POWERED_BY_QIANKUN__
  if (qiankunWindow.__POWERED_BY_QIANKUN__ || (window as any).__POWERED_BY_QIANKUN__) {
    return;
  }

  // 关键：动态导入 qiankun，避免在作为子应用时加载 qiankun 模块
  // 这样可以防止 qiankun 的 effects 模块被执行，避免定时器警告
  const { registerMicroApps, start } = await import('qiankun');

  // 初始化错误监控全局状态
  initErrorMonitor();
  // 设置主应用全局错误捕获
  setupGlobalErrorCapture();

  // 过滤 qiankun 日志
  filterQiankunLogs();

  // 检查拦截器是否已被设置（模块级别已设置）
  if (!(window as any).__btc_resource_interceptor_set__) {
    // 如果模块级别的拦截器没有被设置，在这里设置
    setupGlobalResourceInterceptor();
  } else {
    // 确保 globalEntryMap 已初始化
    getGlobalEntryMap();
  }

  // 获取当前语言
  const currentLocale = getCurrentLocale();

  // 创建 entry 映射，用于在 getTemplate 中查找应用的入口地址
  const entryMap = new Map<string, string>();
  microApps.forEach(app => {
    entryMap.set(app.name, app.entry);
  });

  // 注册子应用，传递当前语言和 Tab 管理回调
  const appsWithProps = microApps.map(app => {
    // 根据环境设置合理的超时时间
    const isDev = import.meta.env.DEV;
    // 生产环境增加到 15 秒，考虑网络延迟和资源加载时间（chunk 文件可能较大）
    const defaultTimeout = isDev ? 8000 : 15000; // 开发环境 8 秒，生产环境 15 秒
    const timeout = app.timeout || defaultTimeout;

    // qiankun 2.10+ 支持 single-spa 原生格式的 timeouts 配置
    // 必须包含 millis、dieOnTimeout、warningMillis 字段，qiankun 会直接透传给 single-spa
    // 注意：warningMillis 应该设置得更大，因为 ES 模块加载阶段也会计入 bootstrap 时间
    // 如果 warningMillis 太小，在模块加载阶段就会触发警告（这是正常的，但会产生噪音）
    // 关键：增加 bootstrap 超时时间，避免在容器检查和 DOM 操作时超时
    const timeoutsConfig = {
      bootstrap: {
        millis: timeout * 2, // 增加超时时间，确保容器检查和 DOM 操作有足够时间
        dieOnTimeout: false, // 超时后不终止应用，只警告（避免应用切换时的竞态条件导致应用无法加载）
        warningMillis: Math.floor(timeout * 1.5), // 警告时间也相应增加
      },
      mount: {
        millis: timeout,
        dieOnTimeout: !isDev,
        warningMillis: Math.floor(timeout * 0.8),
      },
      unmount: {
        millis: 3000,
        dieOnTimeout: true,
        warningMillis: 2500, // unmount 阶段警告时间也适当延长
      },
    };

    // 开发环境：打印应用配置，便于调试
    // if (import.meta.env.DEV) {
    //   // 调试信息已移除
    // }


    return {
    ...app,
    props: {
      locale: currentLocale,
      onReady: () => {
        // 子应用加载完成
          // console.log(`[qiankun] 子应用 ${app.name} onReady 回调被调用`);

          // 清除超时保护
          const timeoutKey = `__qiankun_timeout_${app.name}__`;
          const timeoutId = (window as any)[timeoutKey];
          if (timeoutId) {
            clearTimeout(timeoutId);
            delete (window as any)[timeoutKey];
            // console.log(`[qiankun] 子应用 ${app.name} onReady 清除超时保护`);
          }

          // 注意：不要在 onReady 中调用 finishLoading
          // 因为 onReady 可能在 afterMount 之前被调用，导致 loading 状态被过早清除
          // finishLoading 应该在 afterMount 中统一调用
          // console.log(`[qiankun] 子应用 ${app.name} onReady 完成，等待 afterMount 清除 loading 状态`);
      },
      // Tab 管理 API（使用动态导入避免循环依赖）
      registerTabs: async (tabs: TabMeta[]) => {
        const { registerTabs: registerTabsFn } = await import('../store/tabRegistry');
        registerTabsFn(app.name, tabs);
      },
      clearTabs: async () => {
        const { clearTabs: clearTabsFn } = await import('../store/tabRegistry');
        clearTabsFn(app.name);
      },
      setActiveTab: (_tabKey: string) => {
        // console.log('[Main] Sub-app set active tab:', app.name, tabKey);
      },
      // 错误上报方法（传递给子应用）
      updateErrorList,
      appName: app.name, // 子应用名称（用于标识错误来源）
    },
    // 核心配置：指定脚本类型为 module，让 qiankun 以 ES 模块方式加载子应用脚本
    // 这是解决 Vite 子应用 ES 模块加载问题的关键配置
    scriptType: 'module' as const,
      // 自定义 getTemplate：确保所有 script 标签都有 type="module"，并修复资源路径
      getTemplate: (tpl: string) => {
      // 获取子应用的入口地址（用于修复相对路径的资源）
      const entryUrl = app.entry;
      let processedTpl = tpl;

      // 修复相对路径的资源（script src、link href）
      // 将相对路径转换为绝对路径，使用子应用的入口地址作为基础
      if (entryUrl && !entryUrl.startsWith('/')) {
        // 解析入口地址，获取协议、主机和端口
        const entryMatch = entryUrl.match(/^(\/\/)([^:]+)(:(\d+))?/);
        if (entryMatch) {
          const protocol = window.location.protocol;
          // 关键：使用当前页面的 hostname，而不是 entry 中的 hostname
          // 这样可以支持通过 IP 地址访问（使用当前页面的 hostname，支持 devHost）
          const currentHost = window.location.hostname;
          const port = entryMatch[4] || '';
          const baseUrl = `${protocol}//${currentHost}${port ? `:${port}` : ''}`;

          // 修复所有 script src 中的相对路径（包括已经包含端口的错误路径）
          processedTpl = processedTpl.replace(
            /<script([^>]*?)\s+src\s*=\s*["']([^"']+)["']([^>]*)>/gi,
            (match, before, src, after) => {
              // 如果 src 已经是完整 URL 且端口正确，直接返回
              // 检查是否匹配当前 hostname 和正确的端口
              if ((src.includes(`://${currentHost}:${port}/`) || src.includes(`//${currentHost}:${port}/`)) ||
                  (src.includes(`://localhost:${port}/`) || src.includes(`//localhost:${port}/`))) {
                return match;
              }

              // 如果 src 是相对路径（以 / 开头），转换为完整的 URL
              if (src.startsWith('/')) {
                const fullUrl = `${baseUrl}${src}`;
                return `<script${before} src="${fullUrl}"${after}>`;
              }
              // 如果 src 是相对路径（不以 / 开头，如 assets/file.js），也转换为完整的 URL
              if (!src.includes('://') && !src.startsWith('//') && !src.startsWith('data:') && !src.startsWith('blob:')) {
                // 确保以 / 开头
                const normalizedSrc = src.startsWith('/') ? src : `/${src}`;
                const fullUrl = `${baseUrl}${normalizedSrc}`;
                return `<script${before} src="${fullUrl}"${after}>`;
              }
              // 如果 src 是绝对路径但包含错误的端口（主应用预览端口或其他主应用端口），修复它
              const currentPort = window.location.port;
              // 检查是否包含错误的端口（当前页面的端口），且 hostname 匹配
              const isWrongPort = (src.includes(`://${currentHost}:${currentPort}/`) ||
                                   src.includes(`//${currentHost}:${currentPort}/`) ||
                                   src.includes(`://localhost:${currentPort}/`) ||
                                   src.includes(`//localhost:${currentPort}/`));
              if (isWrongPort && currentPort !== port) {
                // 替换所有出现的错误端口和 hostname
                let fixedUrl = src.replace(new RegExp(`://${currentHost}:${currentPort}(?=/|"|'|$)`, 'g'), `://${currentHost}:${port}`);
                fixedUrl = fixedUrl.replace(new RegExp(`//${currentHost}:${currentPort}(?=/|"|'|$)`, 'g'), `//${currentHost}:${port}`);
                fixedUrl = fixedUrl.replace(new RegExp(`://localhost:${currentPort}(?=/|"|'|$)`, 'g'), `://${currentHost}:${port}`);
                fixedUrl = fixedUrl.replace(new RegExp(`//localhost:${currentPort}(?=/|"|'|$)`, 'g'), `//${currentHost}:${port}`);
                return `<script${before} src="${fixedUrl}"${after}>`;
              }
              // 如果 src 是协议相对路径（//host/），添加正确的端口
              // 匹配当前 hostname 或 localhost（因为配置中可能使用 localhost）
              if ((src.startsWith(`//${currentHost}/`) || src.startsWith(`//localhost/`)) && !src.includes(':')) {
                const fixedUrl = port ? src.replace(/^\/\/[^/]+\//, `//${currentHost}:${port}/`) : src.replace(/^\/\/[^/]+\//, `//${currentHost}/`);
                return `<script${before} src="${fixedUrl}"${after}>`;
              }
              return match;
            }
          );

          // 修复 link href 中的相对路径
          processedTpl = processedTpl.replace(
            /<link([^>]*?)\s+href\s*=\s*["']([^"']+)["']([^>]*)>/gi,
            (match, before, href, after) => {
              // 如果 href 已经是完整 URL 且端口正确，直接返回
              if ((href.includes(`://${currentHost}:${port}/`) || href.includes(`//${currentHost}:${port}/`)) ||
                  (href.includes(`://localhost:${port}/`) || href.includes(`//localhost:${port}/`))) {
                return match;
              }

              // 如果 href 是相对路径（以 / 开头），转换为完整的 URL
              if (href.startsWith('/')) {
                const fullUrl = `${baseUrl}${href}`;
                return `<link${before} href="${fullUrl}"${after}>`;
              }
              // 如果 href 是绝对路径但包含错误的端口（主应用端口），修复它
              const currentPort = window.location.port;
              // 检查是否包含错误的端口（当前页面的端口），且 hostname 匹配
              const isWrongPort = (href.includes(`://${currentHost}:${currentPort}/`) ||
                                   href.includes(`//${currentHost}:${currentPort}/`) ||
                                   href.includes(`://localhost:${currentPort}/`) ||
                                   href.includes(`//localhost:${currentPort}/`));
              if (isWrongPort && currentPort !== port) {
                // 替换所有出现的错误端口和 hostname
                let fixedUrl = href.replace(new RegExp(`://${currentHost}:${currentPort}(?=/|"|'|$)`, 'g'), `://${currentHost}:${port}`);
                fixedUrl = fixedUrl.replace(new RegExp(`//${currentHost}:${currentPort}(?=/|"|'|$)`, 'g'), `//${currentHost}:${port}`);
                fixedUrl = fixedUrl.replace(new RegExp(`://localhost:${currentPort}(?=/|"|'|$)`, 'g'), `://${currentHost}:${port}`);
                fixedUrl = fixedUrl.replace(new RegExp(`//localhost:${currentPort}(?=/|"|'|$)`, 'g'), `//${currentHost}:${port}`);
                return `<link${before} href="${fixedUrl}"${after}>`;
              }
              // 如果 href 是协议相对路径（//host/），添加正确的端口
              // 匹配当前 hostname 或 localhost（因为配置中可能使用 localhost）
              if ((href.startsWith(`//${currentHost}/`) || href.startsWith(`//localhost/`)) && !href.includes(':')) {
                const fixedUrl = port ? href.replace(/^\/\/[^/]+\//, `//${currentHost}:${port}/`) : href.replace(/^\/\/[^/]+\//, `//${currentHost}/`);
                return `<link${before} href="${fixedUrl}"${after}>`;
              }
              return match;
            }
          );

          // 关键：添加或更新 <base> 标签，确保所有相对路径都基于正确的端口
          // 这会影响动态导入的模块路径解析
          // 使用当前页面的 hostname 和正确的端口构建 base URL
          const baseHref = `${protocol}//${currentHost}${port ? `:${port}` : ''}/`;
          // 先移除现有的 <base> 标签（如果有），确保使用正确的 base URL
          processedTpl = processedTpl.replace(/<base[^>]*>/gi, '');
          // 在 <head> 标签内添加新的 <base> 标签
          if (processedTpl.includes('<head')) {
            processedTpl = processedTpl.replace(
              /(<head[^>]*>)/i,
              `$1<base href="${baseHref}">`
            );
          } else {
            // 如果没有 <head> 标签，在 <html> 标签后添加
            processedTpl = processedTpl.replace(
              /(<html[^>]*>)/i,
              `$1<base href="${baseHref}">`
            );
          }
        }
      }

      // 确保所有 script 标签都有 type="module"
      const finalTpl = processedTpl.replace(
        /<script(\s+[^>]*)?>/gi,
          (match, attrs = '') => {
            if (attrs.includes('type=')) {
              return match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"');
            }
            return `<script type="module"${attrs}>`;
          }
      );

      return finalTpl;
    },
    // 配置生命周期超时时间（single-spa 格式）
      // qiankun 会将 timeouts 配置传递给 single-spa
      // 注意：bootstrap 超时可能发生在模块加载阶段，而不仅仅是函数执行阶段
      // 关键：必须在这里明确设置超时，确保 single-spa 正确读取
      timeouts: timeoutsConfig,
    };
  });

  registerMicroApps(
    appsWithProps,
    {
      // 关键：配置资源过滤函数，允许加载 CDN 上的 CSS 文件
      // qiankun 默认会过滤外部资源，需要明确允许 CDN 资源
      // @ts-expect-error - excludeAssetFilter 是 qiankun 的有效配置，但类型定义中缺失
      excludeAssetFilter: (assetUrl: string) => {
        // 允许加载 CDN 上的资源（CSS、JS 等）
        // all.bellis.com.cn 是 CDN 域名
        if (assetUrl.includes('all.bellis.com.cn') || assetUrl.includes('bellis1.oss-cn-shenzhen.aliyuncs.com')) {
          return true; // 返回 true 表示不过滤，允许加载
        }
        // 默认行为：同源资源不过滤，外部资源过滤
        // 这里返回 false 让 qiankun 使用默认过滤逻辑
        return false;
      },
      // 应用加载前（每次应用加载时都会调用，包括重复加载）
      beforeLoad: [async (app) => {
        // 关键：从appNameMap获取应用显示名称，如果不在映射中，使用app.name
        // app-loading.service.ts已经禁止显示"应用"loading，所以这里不需要特殊处理
        const appDisplayName = appNameMap[app.name] || app.name;

        // console.log(`[qiankun] 子应用 ${app.name} beforeLoad 开始`);

        // 关键：在加载子应用前，先清除可能存在的 #Loading 元素
        // 包括system-app自己的#Loading（"拜里斯科技"），因为它只应该在 system-app 路由时显示
        // 避免上一个子应用的 Loading 元素残留
        // 必须在显示新的loading之前清除，确保不会覆盖新的loading
        clearLoadingElement();

        // 关键：确保system-app的#Loading也被隐藏（访问子应用时不应该显示"拜里斯科技"）
        // system-app的#Loading应该只在访问 system-app 路由（如 /system/...）时显示
        const systemLoadingEl = document.getElementById('Loading');
        if (systemLoadingEl && systemLoadingEl.textContent?.includes('拜里斯科技')) {
          systemLoadingEl.style.setProperty('display', 'none', 'important');
          systemLoadingEl.style.setProperty('visibility', 'hidden', 'important');
          systemLoadingEl.style.setProperty('opacity', '0', 'important');
          systemLoadingEl.style.setProperty('pointer-events', 'none', 'important');
          systemLoadingEl.style.setProperty('z-index', '-1', 'important');
          systemLoadingEl.classList.add('is-hide');
        }

        // 额外检查：确保子应用的#Loading元素被清除（可能在clearLoadingElement之后又被添加）
        // 使用setTimeout确保在DOM更新后再次清除
        setTimeout(() => {
          clearLoadingElement();
          // 再次确保system-app的#Loading被隐藏
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

        // 判断是否是真正的应用切换（不是刷新页面）
        // 如果当前激活的应用与要加载的应用不同，说明是真正的应用切换
        // 或者如果当前没有激活的应用（首次加载），也应该显示loading
        const isAppSwitch = currentActiveApp === null || (currentActiveApp !== null && currentActiveApp !== app.name);

        // 在切换应用时显示应用级 Loading（包括首次加载）
        // 关键：确保容器隐藏，loading已显示（可能在路由守卫中已显示）
        // 关键：如果正在进行路径规范化，跳过loading处理，避免重复显示
        const isNormalizing = sessionStorage.get<string>('__BTC_ROUTE_NORMALIZING__') === '1';
        if (isAppSwitch && !isNormalizing) {
          // 先隐藏路由loading（如果正在显示），避免蓝色loading闪烁
          try {
            const { routeLoadingService } = await import('@btc/shared-core');
            routeLoadingService.hide();
          } catch (error) {
            // 静默失败
          }

          // 强制隐藏容器，避免布局先显示出来
          const existingContainer = document.querySelector('#subapp-viewport') as HTMLElement;
          if (existingContainer) {
            existingContainer.style.setProperty('display', 'none', 'important');
            existingContainer.style.setProperty('visibility', 'hidden', 'important');
            existingContainer.style.setProperty('opacity', '0', 'important');
          }

          // 关键：确保应用级别loading已显示（这是唯一负责显示应用级别loading的地方）
          // 使用标记避免重复显示，防止多次加载
          const loadingKey = `__app_loading_${app.name}__`;
          if (!(window as any)[loadingKey]) {
            try {
              const { appLoadingService } = await import('@btc/shared-core');
              // 关键：在显示新loading之前，先隐藏"拜里斯科技"loading
              // 确保#Loading元素被隐藏
              const systemLoadingEl = document.getElementById('Loading');
              if (systemLoadingEl) {
                systemLoadingEl.style.setProperty('display', 'none', 'important');
                systemLoadingEl.style.setProperty('visibility', 'hidden', 'important');
                systemLoadingEl.style.setProperty('opacity', '0', 'important');
                systemLoadingEl.style.setProperty('pointer-events', 'none', 'important');
                systemLoadingEl.style.setProperty('z-index', '-1', 'important');
                systemLoadingEl.classList.add('is-hide');
              }

              // 检查应用级别loading是否已显示
              const appLoadingEl = document.querySelector('.app-loading') as HTMLElement;
              if (!appLoadingEl || window.getComputedStyle(appLoadingEl).display === 'none') {
                // 如果未显示，则显示
                // 关键：在显示loading之前，确保容器隐藏
                const container = document.querySelector('#subapp-viewport') as HTMLElement;
                if (container) {
                  container.style.setProperty('display', 'none', 'important');
                  container.style.setProperty('visibility', 'hidden', 'important');
                  container.style.setProperty('opacity', '0', 'important');
                }
                // 立即显示，不等待容器（因为使用fixed定位，可以直接添加到body）
                // app-loading.service.ts已经禁止显示"应用"loading，所以这里不需要特殊处理
                appLoadingService.show(appDisplayName, container);
                // 设置标记，避免重复显示
                (window as any)[loadingKey] = true;

                // 关键：在显示loading后，等待一个微任务，然后显示容器
                // 这样可以确保loading已经渲染，避免布局闪烁
                await new Promise(resolve => setTimeout(resolve, 0));
                if (container) {
                  container.style.setProperty('display', 'flex', 'important');
                  container.style.setProperty('visibility', 'visible', 'important');
                  container.style.setProperty('opacity', '1', 'important');
                }
              } else {
                // 如果应用级别 loading 已显示，设置标记并显示容器
                (window as any)[loadingKey] = true;
                const container = document.querySelector('#subapp-viewport') as HTMLElement;
                if (container) {
                  container.style.setProperty('display', 'flex', 'important');
                  container.style.setProperty('visibility', 'visible', 'important');
                  container.style.setProperty('opacity', '1', 'important');
                }
              }
            } catch (error) {
              console.warn('[qiankun] 无法加载 AppLoadingService，跳过应用级loading', error);
            }
          }
        }

        return new Promise<void>((resolve, reject) => {
          let retryCount = 0;
          const maxRetries = 20; // 增加重试次数到 20 次（约 1000ms），确保容器有足够时间被创建
          const retryDelay = 50; // 每次重试间隔 50ms

          const ensureContainer = async () => {
            let container = document.querySelector('#subapp-viewport') as HTMLElement;

            // 如果容器不存在，先触发事件让 Layout 组件创建容器
            if (!container || !container.isConnected) {
              // 关键：在触发事件之前，先等待一个微任务，确保 loading 已经显示
              // 这样可以避免容器先显示出来，然后 loading 才显示
              await new Promise(resolve => setTimeout(resolve, 0));

              // 关键：触发事件，让 Layout 组件先更新状态，创建容器
              window.dispatchEvent(new CustomEvent('qiankun:before-load', {
                detail: { appName: app.name }
              }));

              // 等待 Vue 更新完成，容器被创建
              await new Promise(resolve => {
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    resolve(undefined);
                  });
                });
              });

              // 重新查找容器
              container = document.querySelector('#subapp-viewport') as HTMLElement;

              // 关键：如果容器被创建了，先隐藏它，等 loading 显示后再显示
              if (container && container.isConnected) {
                container.style.setProperty('display', 'none', 'important');
                container.style.setProperty('visibility', 'hidden', 'important');
                container.style.setProperty('opacity', '0', 'important');
                // 再等待一个微任务，确保 loading 已经显示
                await new Promise(resolve => setTimeout(resolve, 0));
              }
            }

            if (container && container.isConnected) {
              // 容器存在且已挂载，立即处理
              // 关键：只有在 loading 已经显示后才显示容器，避免布局闪烁
              // 检查应用级别loading是否已显示
              const appLoadingEl = document.querySelector('.app-loading') as HTMLElement;
              const isAppLoadingVisible = appLoadingEl && window.getComputedStyle(appLoadingEl).display !== 'none';

              container.setAttribute('data-qiankun-loading', 'true');
              if (isAppLoadingVisible) {
                // 应用级别loading已显示，可以显示容器
                container.style.setProperty('display', 'flex', 'important');
                container.style.setProperty('visibility', 'visible', 'important');
                container.style.setProperty('opacity', '1', 'important');
              } else {
                // 应用级别loading未显示，继续隐藏容器
                container.style.setProperty('display', 'none', 'important');
                container.style.setProperty('visibility', 'hidden', 'important');
                container.style.setProperty('opacity', '0', 'important');
              }

              // 清理其他应用的 tabs/menus（快速操作，无阻塞）
              // 动态导入避免循环依赖
              const { clearTabsExcept } = await import('../store/tabRegistry');
              const { clearMenusExcept } = await import('../store/menuRegistry');
              clearTabsExcept(app.name);
              clearMenusExcept(app.name);
              // 关键：先注册菜单，再注册 tabs，确保菜单在切换应用时不会丢失
              // 即使菜单内容相同，也要重新注册，因为可能被 clearMenusExcept 清空了
              await registerManifestMenusForApp(app.name);
              await registerManifestTabsForApp(app.name);

              // 等待 Vue 渲染完成后再 resolve，确保骨架屏已经渲染到 DOM 中
              // 使用 requestAnimationFrame 确保 DOM 更新完成
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  // startLoading(appName); // 注释掉 loading
                    resolve();
                });
              });
            } else if (retryCount < maxRetries) {
              // 容器不存在，轻量重试
                  retryCount++;
                    setTimeout(() => ensureContainer(), retryDelay);
                  } else {
                    // 超过最大重试次数，报错
              // logger.error(`[qiankun] 容器 #subapp-viewport 在 ${maxRetries * retryDelay}ms 内未找到`);
              reject(new Error(`容器缺失，无法加载应用 ${app.name}`));
                }
          };

          // 开始检查
          ensureContainer();
        });
      }],

      // 应用挂载前（在 mount 之前调用，作为 beforeLoad 的兜底）
      // 如果 beforeLoad 被跳过（应用已加载过），这里确保 loading 状态被正确设置
      beforeMount: [async (_app) => {
        // const appName = appNameMap[_app.name] || _app.name; // 未使用
        // console.log(`[qiankun] 子应用 ${_app.name} beforeMount 钩子被触发`);

        // 检查容器是否有 data-qiankun-loading 属性
        // 如果没有，说明 beforeLoad 被跳过了，需要手动设置 loading 状态
        const container = document.querySelector('#subapp-viewport') as HTMLElement;
        if (container && !container.hasAttribute('data-qiankun-loading')) {
          // console.log(`[qiankun] 子应用 ${_app.name} beforeLoad 被跳过，在 beforeMount 中设置 loading 状态`);

          // 先触发 before-load 事件，确保 Layout 组件的状态被更新
          // 这样 shouldShowSubAppViewport 会返回 true，容器会显示，骨架屏会显示（v-show）
          window.dispatchEvent(new CustomEvent('qiankun:before-load', {
            detail: { appName: _app.name }
          }));

          // 设置容器状态
          container.style.setProperty('display', 'flex', 'important');
          container.style.setProperty('visibility', 'visible', 'important');
          container.style.setProperty('opacity', '1', 'important');
          container.setAttribute('data-qiankun-loading', 'true');

          // 设置超时保护
          // const timeoutKey = `__qiankun_timeout_${_app.name}__`;
          // const timeoutId = setTimeout(() => {
          //   console.warn(`[qiankun] 子应用 ${_app.name} 加载超时（12秒），强制清除 loading 状态`);
          //   finishLoading();
          //   delete (window as any)[timeoutKey];
          // }, 12000);
          // (window as any)[timeoutKey] = timeoutId;

          // 关键修复：清理其他应用的 tabs/menus，并重新注册当前应用的菜单
          // 这是修复物流域菜单消失的关键：即使 beforeLoad 被跳过，也要确保菜单被注册
          // 动态导入避免循环依赖
          const { clearTabsExcept } = await import('../store/tabRegistry');
          const { clearMenusExcept } = await import('../store/menuRegistry');
          clearTabsExcept(_app.name);
          clearMenusExcept(_app.name);
          // 关键：先注册菜单，再注册 tabs，确保菜单在切换应用时不会丢失
          await registerManifestMenusForApp(_app.name);
          await registerManifestTabsForApp(_app.name);

          // 由于骨架屏使用 v-show，它始终在 DOM 中
          // 但需要等待一个微任务，确保 Vue 的响应式更新完成（isQiankunLoading 已更新，骨架屏已显示）
          // 使用同步的微任务，确保在子应用 mount 之前执行
          // queueMicrotask(() => {
          //   startLoading(appName); // 注释掉 loading
          // });
        }

        return Promise.resolve();
      }],

      // 应用挂载后
      afterMount: [async (_app) => {
        const appDisplayName = appNameMap[_app.name] || _app.name;

        // 更新当前激活的应用名称
        currentActiveApp = _app.name;

        // 关键优化：立即同步关闭应用级 Loading，不等待异步导入
        // 这样可以避免 loading 显示时间过长（10秒超时）
        // 先通过 DOM 直接关闭所有 .app-loading 元素（同步操作，立即生效）
        const loadingEls = document.querySelectorAll('.app-loading');
        loadingEls.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
            el.style.setProperty('opacity', '0', 'important');
            el.style.setProperty('pointer-events', 'none', 'important');
            // 立即移除 DOM 元素，不等待异步操作
            try {
              if (el.parentNode) {
                el.parentNode.removeChild(el);
              }
            } catch (e) {
              // 如果移除失败，延迟移除
              setTimeout(() => {
                if (el.parentNode) {
                  try {
                    el.parentNode.removeChild(el);
                  } catch (err) {
                    // 忽略移除错误
                  }
                }
              }, 100);
            }
          }
        });

        // 然后异步调用 appLoadingService.hide() 进行清理（确保状态一致）
        try {
          const { appLoadingService } = await import('@btc/shared-core');
          // 隐藏当前应用的loading（即使已经通过 DOM 关闭，也要更新服务状态）
          appLoadingService.hide(appDisplayName);
          // 清除标记，允许下次重新显示
          const loadingKey = `__app_loading_${_app.name}__`;
          delete (window as any)[loadingKey];
        } catch (error) {
          // 静默失败，因为已经通过 DOM 关闭了 loading
        }


        // 关键：清除可能存在的 #Loading 元素（来自子应用的 index.html）
        // 这个元素会导致页面一直显示 loading 状态
        clearLoadingElement();

        // 清除超时保护
        const timeoutKey = `__qiankun_timeout_${_app.name}__`;
        const timeoutId = (window as any)[timeoutKey];
        if (timeoutId) {
          clearTimeout(timeoutId);
          delete (window as any)[timeoutKey];
          // console.log(`[qiankun] 子应用 ${_app.name} 清除超时保护`);
        }

        // 清理加载标记和隐藏样式（子应用已挂载，应该显示容器）
        const container = document.querySelector('#subapp-viewport') as HTMLElement;
        if (container) {
          container.removeAttribute('data-qiankun-loading');

          // 移除之前设置的隐藏样式，让容器的显示由 Vue 的 v-if 和 CSS 控制
          // 使用 requestAnimationFrame 确保在 DOM 更新后执行
          requestAnimationFrame(() => {
            if (!container) return;

            // 移除隐藏样式属性（包括带 !important 的，通过 removeProperty 移除）
            container.style.removeProperty('display');
            container.style.removeProperty('visibility');
            container.style.removeProperty('opacity');

            // 如果 style 属性中还有内联的隐藏样式，手动清理
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

            // 移除隐藏类
            container.classList.remove('content-mount--hidden');
          });
        }

        // 关键：立即调用 finishLoading，不延迟
        // 子应用的 onReady 也会调用 finishLoading，但这里作为兜底确保 loading 状态被清除
        // console.log(`[qiankun] 子应用 ${_app.name} 调用 finishLoading`);
        // finishLoading(); // 注释掉 loading

        // 触发自定义事件，通知 Layout 组件更新状态（在 finishLoading 之后，确保状态已清除）
        // 使用 nextTick 确保 DOM 更新完成后再触发事件，让 Layout 组件能正确读取容器状态
        Promise.resolve().then(() => {
          window.dispatchEvent(new CustomEvent('qiankun:after-mount', {
            detail: { appName: _app.name }
          }));
        });

        // 关键：应用切换时重新初始化 user-check
        // 确保切换应用后立即获取最新的 user-check 数据并更新存储
        try {
          const { reinitializeUserCheckOnAppSwitch } = await import('@btc/shared-core/composables/user-check');
          reinitializeUserCheckOnAppSwitch().catch((error) => {
            // 静默失败，不影响应用切换
            if (import.meta.env.DEV) {
              console.warn('[qiankun:afterMount] Failed to reinitialize user check:', error);
            }
          });
        } catch (error) {
          // 静默失败，不影响应用切换
          if (import.meta.env.DEV) {
            console.warn('[qiankun:afterMount] Failed to import reinitializeUserCheckOnAppSwitch:', error);
          }
        }

        return Promise.resolve();
      }],

      // 应用卸载后
      afterUnmount: [async (app) => {
        // console.log(`[qiankun] 子应用 ${app.name} afterUnmount 钩子被触发`);

        // 如果卸载的是当前激活的应用，清除当前激活应用标记
        if (currentActiveApp === app.name) {
          currentActiveApp = null;
        }

        // 离开子应用，清理其映射（使用动态导入避免循环依赖）
        const { clearTabs: clearTabsFn } = await import('../store/tabRegistry');
        const { clearMenus: clearMenusFn } = await import('../store/menuRegistry');
        clearTabsFn(app.name);
        clearMenusFn(app.name);

        // 关键：清除可能存在的 #Loading 元素（来自子应用的 index.html）
        // 这个元素会导致页面一直显示 loading 状态
        clearLoadingElement();

        // 清除可能残留的 loading 状态
        // finishLoading(); // 注释掉 loading

        return Promise.resolve();
      }],
    }
  );

  // 启动qiankun
  // 关键：再次检查是否在 qiankun 环境下（防止在 start 调用时状态已改变）
  // 关键：timeouts 配置已在 registerMicroApps 时通过 timeouts 属性传递
  // qiankun 会将 timeouts 配置传递给 single-spa，确保超时设置正确生效
  // 双重检查：检查 qiankunWindow 和 window.__POWERED_BY_QIANKUN__
  if (qiankunWindow.__POWERED_BY_QIANKUN__ || (window as any).__POWERED_BY_QIANKUN__) {
    return;
  }
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
      // 这是修复资源路径的关键：在获取 HTML 时就修复其中的资源路径
      fetch: async (url: string, options?: RequestInit, ..._args: any[]) => {

        // 关键：在发送请求前，先检查 URL 是否需要修复
        // 这可以避免请求错误的端口，导致服务器返回 HTML（404 页面）
        const currentPath = window.location.pathname;
        let targetAppName: string | null = null;

        // 根据当前路径或子域名判断是哪个应用（使用应用扫描器）
        const hostname = window.location.hostname;

        // 首先尝试从子域名判断
        const appBySubdomain = getAppBySubdomain(hostname);
        if (appBySubdomain) {
          targetAppName = appBySubdomain.id;
        }
        // 如果子域名没有匹配，尝试从路径判断
        else {
          const pathPrefix = currentPath.split('/')[1] ? `/${currentPath.split('/')[1]}` : '/';
          const appByPath = getAppByPathPrefix(pathPrefix);
          if (appByPath) {
            targetAppName = appByPath.id;
          }
        }

        // 如果当前在子应用路径下，且请求的 URL 包含错误的端口（主应用预览端口），需要修复
        if (targetAppName && window.location.port === SYSTEM_APP_PREVIEW_PORT) {
          const appEntry = entryMap.get(targetAppName);
          if (appEntry && !appEntry.startsWith('/')) {
            const entryMatch = appEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
            if (entryMatch) {
              const port = entryMatch[4] || '';
              const currentHost = window.location.hostname;
              const protocol = window.location.protocol;
              const currentPort = window.location.port;

              // 判断是否是资源文件或 API 请求
              const isAssetFile = url.includes('/assets/') || url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.mjs');

              // 跳过 API 请求（以 /api/ 开头）
              if (!url.includes('/api/')) {
                let needsFix = false;
                let fixedUrl = url;

                // 检查多种情况：
                // 1. URL 包含错误的端口（主应用端口）且是资源文件
                if (isAssetFile && url.includes(`:${currentPort}`)) {
                  fixedUrl = url.replace(new RegExp(`:${currentPort}(?=/|$)`, 'g'), port ? `:${port}` : '');
                  needsFix = true;
                }
                // 2. URL 是相对路径（以 / 开头）且是资源文件
                else if (isAssetFile && url.startsWith('/')) {
                  fixedUrl = `${protocol}//${currentHost}:${port}${url}`;
                  needsFix = true;
                }
                // 3. URL 是协议相对路径（//host/）且指向当前主机
                else if (isAssetFile && url.startsWith(`//${currentHost}/`) && !url.includes(':')) {
                  fixedUrl = `${protocol}//${currentHost}:${port}${url.slice(`//${currentHost}`.length)}`;
                  needsFix = true;
                }

                if (needsFix && fixedUrl !== url) {
                  url = fixedUrl;
                }
              }
            }
          }
        }

        // 执行请求（可能已经修复了 URL）
        // 添加超时控制，缩短超时时间以确保loading能及时显示
        const timeout = import.meta.env.DEV ? 10000 : 8000; // 开发环境 10 秒，生产环境 15 秒（缩短超时时间，确保loading能及时显示）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        let response: Response;
        try {
          response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
        } catch (error: any) {
          clearTimeout(timeoutId);
          // 如果是超时错误，尝试重试一次
          if (error.name === 'AbortError' && !options?.signal?.aborted) {
            console.warn(`[qiankun] 资源加载超时，尝试重试: ${url}`);
            const retryController = new AbortController();
            const retryTimeoutId = setTimeout(() => retryController.abort(), timeout);
            try {
              response = await fetch(url, {
                ...options,
                signal: retryController.signal,
              });
              clearTimeout(retryTimeoutId);
            } catch (retryError: any) {
              clearTimeout(retryTimeoutId);
              console.error(`[qiankun] 资源加载重试失败: ${url}`, retryError);
              throw retryError;
            }
          } else {
            throw error;
          }
        }

        // 如果是 HTML 请求（text/html），需要修复其中的资源路径
        const contentType = response.headers.get('content-type');

        // 关键：如果请求的是 JavaScript 文件，但返回的是 HTML（404 页面），说明路径错误
        // 需要尝试修复路径并重新请求
        if (targetAppName && contentType && contentType.includes('text/html') &&
            (url.endsWith('.js') || url.endsWith('.mjs') || url.includes('/assets/'))) {
          const appEntry = entryMap.get(targetAppName);
          if (appEntry && !appEntry.startsWith('/')) {
            const entryMatch = appEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
            if (entryMatch) {
              const port = entryMatch[4] || '';
              const currentHost = window.location.hostname;
              const protocol = window.location.protocol;
              const currentPort = window.location.port;

              if (port && port !== currentPort) {
                // 尝试修复 URL：替换端口
                let fixedUrl = url;

                // 如果 URL 包含错误的端口，替换它
                if (url.includes(`:${currentPort}`)) {
                  fixedUrl = url.replace(new RegExp(`:${currentPort}(?=/|$)`, 'g'), `:${port}`);
                }
                // 如果 URL 是相对路径，转换为绝对路径
                else if (url.startsWith('/')) {
                  fixedUrl = `${protocol}//${currentHost}:${port}${url}`;
                }
                // 如果 URL 只包含文件名，尝试从 /assets/ 路径加载
                else if (!url.includes('://') && !url.includes('/')) {
                  fixedUrl = `${protocol}//${currentHost}:${port}/assets/${url}`;
                }

                // 如果 URL 被修复了，重新请求
                if (fixedUrl !== url) {
                  const retryResponse = await fetch(fixedUrl, options);
                  const retryContentType = retryResponse.headers.get('content-type');

                  // 如果返回的是 JavaScript，使用修复后的响应
                  if (retryContentType && (retryContentType.includes('application/javascript') ||
                      retryContentType.includes('text/javascript') ||
                      retryContentType.includes('application/x-javascript'))) {
                    return retryResponse;
                  }
                }
              }
            }
          }
        }

        // 关键：如果请求的是 JavaScript 文件（.js），但返回的是 HTML，说明路径错误
        // 需要修复 URL 并重新请求
        if (contentType && contentType.includes('text/html') && url.endsWith('.js')) {

          // 尝试修复 URL
          if (targetAppName) {
            const appEntry = entryMap.get(targetAppName);
            if (appEntry && !appEntry.startsWith('/')) {
              const entryMatch = appEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
              if (entryMatch) {
                const port = entryMatch[4] || '';
                const currentHost = window.location.hostname;
                const protocol = window.location.protocol;

                // 提取文件名
                const fileName = url.split('/').pop() || '';

                // 尝试从 /assets/ 路径加载
                const fixedUrl = `${protocol}//${currentHost}:${port}/assets/${fileName}`;

                // 重新请求
                const retryResponse = await fetch(fixedUrl, options);
                const retryContentType = retryResponse.headers.get('content-type');

                if (retryContentType && retryContentType.includes('application/javascript')) {
                  return retryResponse;
                }
              }
            }
          }
        }

        if (contentType && contentType.includes('text/html')) {

          // 克隆响应以便读取内容
          const clonedResponse = response.clone();
          const html = await clonedResponse.text();

          // 修复 HTML 中的资源路径
          let fixedHtml = html;

          // 从 URL 推断应用的入口地址
          // URL 格式可能是：http://{devHost}:4182/ 或 //{devHost}:4182/（使用配置中的 devHost）
          // 需要匹配子应用的入口地址
          let matchedAppEntry: string | null = null;
          let matchedAppName: string | null = null;

          for (const [appName, appEntry] of entryMap.entries()) {
            if (appEntry && !appEntry.startsWith('/')) {
              // 解析入口地址
              const entryMatch = appEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
              if (entryMatch) {
                const entryHost = entryMatch[2];
                const entryPort = entryMatch[4] || '';

                // 检查 URL 是否匹配这个入口地址
                // URL 可能是完整 URL 或协议相对 URL
                const urlMatch = url.match(/^(https?:\/\/|\/\/)([^:]+)(:(\d+))?/);
                if (urlMatch) {
                  const urlHost = urlMatch[2];
                  const urlPort = urlMatch[4] || '';

                  // 匹配主机和端口
                  if (urlHost === entryHost && urlPort === entryPort) {
                    matchedAppEntry = appEntry;
                    matchedAppName = appName;
                    break;
                  }
                }
              }
            }
          }

          // 如果找到了匹配的应用，修复 HTML 中的资源路径
          if (matchedAppEntry && matchedAppName) {
            const entryMatch = matchedAppEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
            if (entryMatch) {
              const protocol = window.location.protocol;
              const host = entryMatch[2];
              const port = entryMatch[4] || '';
              const baseUrl = `${protocol}//${host}${port ? `:${port}` : ''}`;

              // 修复 script src 中的相对路径和错误的绝对路径
              fixedHtml = fixedHtml.replace(
                /<script([^>]*?)\s+src\s*=\s*["']([^"']+)["']([^>]*)>/gi,
                (match, before, src, after) => {
                  // 如果 src 是相对路径（以 / 开头），转换为完整的 URL
                  if (src.startsWith('/')) {
                    const fullUrl = `${baseUrl}${src}`;
                    return `<script${before} src="${fullUrl}"${after}>`;
                  }
                  // 如果 src 是绝对路径但包含错误的端口（当前页面的端口），修复它
                  if ((src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//'))
                      && window.location.port === SYSTEM_APP_PREVIEW_PORT && src.includes(`:${window.location.port}`)) {
                    const fixedUrl = src.replace(`:${window.location.port}`, `:${port}`);
                    return `<script${before} src="${fixedUrl}"${after}>`;
                  }
                  return match;
                }
              );

              // 修复 link href 中的相对路径和错误的绝对路径
              fixedHtml = fixedHtml.replace(
                /<link([^>]*?)\s+href\s*=\s*["']([^"']+)["']([^>]*)>/gi,
                (match, before, href, after) => {
                  // 如果 href 是相对路径（以 / 开头），转换为完整的 URL
                  if (href.startsWith('/')) {
                    const fullUrl = `${baseUrl}${href}`;
                    return `<link${before} href="${fullUrl}"${after}>`;
                  }
                  // 如果 href 是绝对路径但包含错误的端口（当前页面的端口），修复它
                  if ((href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//'))
                      && window.location.port === SYSTEM_APP_PREVIEW_PORT && href.includes(`:${window.location.port}`)) {
                    const fixedUrl = href.replace(new RegExp(`:${window.location.port}(?=/|$)`, 'g'), `:${port}`);
                    return `<link${before} href="${fixedUrl}"${after}>`;
                  }
                  return match;
                }
              );

              // 关键：添加或更新 <base> 标签，确保所有相对路径都基于正确的端口
              // 这会影响动态导入的模块路径解析
              // 先移除现有的 <base> 标签（如果有），确保使用正确的 base URL
              fixedHtml = fixedHtml.replace(/<base[^>]*>/gi, '');
              // 在 <head> 标签内添加新的 <base> 标签
              if (fixedHtml.includes('<head')) {
                fixedHtml = fixedHtml.replace(
                  /(<head[^>]*>)/i,
                  `$1<base href="${baseUrl}/">`
                );
              } else {
                // 如果没有 <head> 标签，在 <html> 标签后添加
                fixedHtml = fixedHtml.replace(
                  /(<html[^>]*>)/i,
                  `$1<base href="${baseUrl}/">`
                );
              }
            }
          }

          // 返回修复后的 HTML
          return new Response(fixedHtml, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        }

        // 如果是资源文件请求且包含错误的端口，修复它（在响应处理之后，作为最后的兜底）
        // 关键：检查 URL 是否包含当前页面的端口（主应用预览端口），如果是，说明需要修复
        const isAssetFile = url.includes('/assets/') || url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.mjs');
        if (isAssetFile && window.location.port === SYSTEM_APP_PREVIEW_PORT) {
          // 根据当前路径判断是哪个应用
          const currentPath = window.location.pathname;
          let targetAppName: string | null = null;

          if (currentPath.startsWith('/admin')) {
            targetAppName = 'admin';
          } else if (currentPath.startsWith('/logistics')) {
            targetAppName = 'logistics';
          } else if (currentPath.startsWith('/engineering')) {
            targetAppName = 'engineering';
          } else if (currentPath.startsWith('/quality')) {
            targetAppName = 'quality';
          } else if (currentPath.startsWith('/production')) {
            targetAppName = 'production';
          } else if (currentPath.startsWith('/finance')) {
            targetAppName = 'finance';
          }

          if (targetAppName) {
            const appEntry = entryMap.get(targetAppName);
            if (appEntry && !appEntry.startsWith('/')) {
              const entryMatch = appEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
              if (entryMatch) {
                const port = entryMatch[4] || '';
                const protocol = window.location.protocol;
                const host = window.location.hostname;

                if (port && port !== SYSTEM_APP_PREVIEW_PORT) {
                  // 修复 URL，将端口替换为正确的端口
                  let fixedUrl = url;

                  // 如果 URL 包含错误的端口（主应用预览端口），直接替换
                  if (url.includes(`:${window.location.port}`)) {
                    fixedUrl = url.replace(new RegExp(`:${window.location.port}(?=/|$)`, 'g'), `:${port}`);
                  }
                  // 如果 URL 是相对路径（以 / 开头），转换为完整的 URL
                  else if (url.startsWith('/')) {
                    fixedUrl = `${protocol}//${host}:${port}${url}`;
                  }
                  // 如果 URL 是绝对路径但指向当前主机，修复端口
                  else if (url.startsWith(`${protocol}//${host}:`) || url.startsWith(`//${host}:`)) {
                    fixedUrl = url.replace(new RegExp(`:${window.location.port}(?=/|$)`, 'g'), `:${port}`);
                  }
                  // 如果 URL 是协议相对路径（以 // 开头），添加协议并修复端口
                  else if (url.startsWith('//')) {
                    const urlHostMatch = url.match(/^\/\/([^:]+)(:(\d+))?(.+)$/);
                    if (urlHostMatch && urlHostMatch[1] === host) {
                      fixedUrl = `${protocol}//${host}:${port}${urlHostMatch[4] || ''}`;
                    }
                  }

                  if (fixedUrl !== url) {
                    return fetch(fixedUrl, options);
                  }
                }
              }
            }
          }
        }

        // 默认返回原始响应
        return response;
      },
      // 自定义 getTemplate：修复资源路径，确保从正确的端口加载
      // 注意：qiankun 的 getTemplate 可能接收 entry 作为第二个参数，也可能不接收
      // 我们通过检查 HTML 中的资源路径来推断应用的入口地址
      getTemplate: (tpl: string, entry?: string) => {

        let processedTpl = tpl;

        // 关键：先清理所有旧 chunk 引用（在修复路径之前）
        // 这些是旧的 chunk hash，如果检测到这些引用，说明需要删除
        const OLD_REF_PATTERN = /B2xaJ9jT|CQjIfk82|Ct0QBumG|B9_7Pxt3|C3806ap7|D-vcpc3r|COBg3Fmo|C-4vWSys|u6iSJWLT|Bob15k_M|DXiZfgDR|CK3kLuZf|B6Y4X6Zv|vga9bYFB|C5YyqyGj|5K5tXpWB|element-plus-CQjIfk82|vue-core-Ct0QBumG|vendor-B2xaJ9jT|vue-router-B9_7Pxt3|app-src-C3806ap7|app-src-COBg3Fmo|app-src-vga9bYFB|index-D-vcpc3r|index-C-4vWSys|index-u6iSJWLT|index-C5YyqyGj|index-5K5tXpWB/g;

        // 检查是否包含旧引用
        if (OLD_REF_PATTERN.test(processedTpl)) {
          OLD_REF_PATTERN.lastIndex = 0; // 重置正则表达式
          const oldRefMatches = processedTpl.match(OLD_REF_PATTERN);
          if (oldRefMatches && oldRefMatches.length > 0) {
            console.warn(`[getTemplate] 检测到 ${oldRefMatches.length} 个旧 chunk 引用，将强制删除:`, oldRefMatches.slice(0, 5).join(', '));

            // 删除包含旧引用的 script 标签（更宽泛的匹配，包括所有可能的格式）
            const oldHashList = OLD_REF_PATTERN.source.replace(/^\/|\/[gimuy]*$/g, '').split('|');
            // 匹配所有包含旧 hash 的 script 标签，无论路径格式如何
            const oldScriptPattern = new RegExp(`<script[^>]*src=["'][^"']*(${oldHashList.join('|')})[^"']*["'][^>]*>`, 'gi');
            processedTpl = processedTpl.replace(oldScriptPattern, '');

            // 删除包含旧引用的 link 标签（modulepreload 和 stylesheet）
            // 匹配所有包含旧 hash 的 link 标签，无论路径格式如何
            const oldLinkPattern = new RegExp(`<link[^>]*(?:href|src)=["'][^"']*(${oldHashList.join('|')})[^"']*["'][^>]*>`, 'gi');
            processedTpl = processedTpl.replace(oldLinkPattern, '');

            // 删除包含旧引用的 import() 动态导入（在 HTML 中）
            const oldImportPattern = new RegExp(`import\\s*\\(\\s*["'][^"']*(${oldHashList.join('|')})[^"']*["']\\s*\\)`, 'gi');
            processedTpl = processedTpl.replace(oldImportPattern, 'Promise.resolve()');

            // 额外清理：删除内联脚本中的旧引用（如果 HTML 中包含内联脚本）
            // 匹配内联脚本中的动态导入：import('/assets/app-src-vga9bYFB.js')
            const inlineScriptPattern = new RegExp(`(<script[^>]*>)([\\s\\S]*?)(import\\s*\\(\\s*["'][^"']*(${oldHashList.join('|')})[^"']*["']\\s*\\)[\\s\\S]*?)(</script>)`, 'gi');
            processedTpl = processedTpl.replace(inlineScriptPattern, (_match, openTag, before, importStmt, _oldHash, closeTag) => {
              // 只删除包含旧引用的 import() 语句，保留其他代码
              const cleanedImport = importStmt.replace(new RegExp(`import\\s*\\(\\s*["'][^"']*(${oldHashList.join('|')})[^"']*["']\\s*\\)`, 'gi'), 'Promise.resolve()');
              return openTag + before + cleanedImport + closeTag;
            });

            console.info(`[getTemplate] ✅ 已清理所有旧 chunk 引用`);
          }
        }

        // 尝试从 entry 参数获取，如果没有则从 entryMap 中查找匹配的应用
        let baseUrl = '';
        let matchedAppName: string | null = null;
        const currentHost = window.location.hostname;
        const protocol = window.location.protocol;
        const currentPort = window.location.port;

        // 首先尝试从 entry 参数获取
        if (entry) {
          // 解析入口地址（可能是完整 URL 或协议相对路径）
          let entryUrl: URL | null = null;
          try {
            // 如果是完整 URL（http:// 或 https://），直接解析
            if (entry.startsWith('http://') || entry.startsWith('https://')) {
              entryUrl = new URL(entry);
            }
            // 如果是协议相对路径（//host:port），转换为完整 URL
            else if (entry.startsWith('//')) {
              entryUrl = new URL(`${protocol}${entry}`);
            }
            // 如果是相对路径（/path），使用当前页面的 origin
            else if (entry.startsWith('/')) {
              entryUrl = new URL(entry, window.location.origin);
            }
          } catch (e) {
            console.warn('[getTemplate] 解析 entry URL 失败:', entry, e);
          }

          if (entryUrl) {
            // 关键：如果 entry 是完整 URL（包含子域名），使用 entry 中的 hostname
            // 否则使用当前页面的 hostname（支持通过 IP 地址访问，使用配置中的 devHost）
            const port = entryUrl.port || '';
            let finalHost = entryUrl.hostname;

            // 如果 entry 是相对路径（/path），使用当前页面的 hostname
            if (entry.startsWith('/')) {
              finalHost = currentHost;
            }
            // 如果 entry 是完整 URL，检查是否是子域名
            else if (entry.startsWith('http://') || entry.startsWith('https://')) {
              // 使用 entry 中的 hostname（可能是子域名）
              finalHost = entryUrl.hostname;
            }
            // 如果 entry 是协议相对路径（//host:port），也使用 entry 中的 hostname
            else if (entry.startsWith('//')) {
              finalHost = entryUrl.hostname;
            }

            baseUrl = `${entryUrl.protocol}//${finalHost}${port ? `:${port}` : ''}`;

            // 从 entryMap 中查找匹配的应用名称
            for (const [appName, appEntry] of entryMap.entries()) {
              if (appEntry === entry) {
                matchedAppName = appName;
                break;
              }
            }
            console.info('[getTemplate] 从 entry 参数获取:', { baseUrl, matchedAppName, port, entry, finalHost, entryHostname: entryUrl.hostname });
          }
        }

        // 如果没有从 entry 参数获取到，尝试从当前路径或子域名判断是哪个应用
        if (!baseUrl) {
          const currentPath = window.location.pathname;
          const hostname = window.location.hostname;
          let matchedAppName: string | null = null;

          // 使用应用扫描器获取子域名和应用映射（顶层已导入）
          // 首先尝试从子域名判断
          const appBySubdomain = getAppBySubdomain(hostname);
          if (appBySubdomain) {
            matchedAppName = appBySubdomain.id;
          }
          // 如果子域名没有匹配，尝试从路径判断
          else {
            const appByPath = getAppByPathPrefix(currentPath.split('/')[1] ? `/${currentPath.split('/')[1]}` : '/');
            if (appByPath) {
              matchedAppName = appByPath.id;
            }
          }

          if (matchedAppName) {
            const appEntry = entryMap.get(matchedAppName);
            if (appEntry) {
              // 解析 entry（可能是完整 URL 或协议相对路径）
              let entryUrl: URL | null = null;
              try {
                if (appEntry.startsWith('http://') || appEntry.startsWith('https://')) {
                  entryUrl = new URL(appEntry);
                } else if (appEntry.startsWith('//')) {
                  entryUrl = new URL(`${protocol}${appEntry}`);
                } else if (appEntry.startsWith('/')) {
                  entryUrl = new URL(appEntry, window.location.origin);
                }
              } catch (e) {
                console.warn('[getTemplate] 解析 appEntry URL 失败:', appEntry, e);
              }

              if (entryUrl) {
                // 关键：优先使用 appEntry 中的 hostname（可能是子域名），而不是当前页面的 hostname
                // 这样当从主域名访问时（如 bellis.com.cn/production），baseUrl 会指向子域名（production.bellis.com.cn）
                const port = entryUrl.port || '';
                let finalHost = entryUrl.hostname; // 优先使用 entry 中的 hostname

                // 如果 entry 是相对路径（/path），使用当前 hostname
                if (appEntry.startsWith('/')) {
                  // 如果是子域名访问，使用子域名作为 host
                  const appBySubdomain = getAppBySubdomain(hostname);
                  if (appBySubdomain && appBySubdomain.id === matchedAppName) {
                    finalHost = hostname;
                  } else {
                    finalHost = currentHost;
                  }
                }
                // 如果 entry 是完整 URL 或协议相对路径，且 hostname 与当前 hostname 不同，说明是跨域加载
                // 这种情况下，应该使用 entry 中的 hostname（子域名）
                else if (entryUrl.hostname !== currentHost) {
                  // 使用 entry 中的 hostname（子域名）
                  finalHost = entryUrl.hostname;
                }

                baseUrl = `${protocol}//${finalHost}${port ? `:${port}` : ''}`;
                console.info('[getTemplate] 从路径/子域名判断获取:', { matchedAppName, baseUrl, port, appEntry, hostname, finalHost, entryHostname: entryUrl.hostname, currentHost });
              }
            }
          }
        }

        // 如果还是没有找到，尝试从 HTML 中的资源路径推断
        if (!baseUrl) {
          const resourceMatch = tpl.match(/(?:src|href)=["']([^"']+)/);
          if (resourceMatch && resourceMatch[1]) {
            const resourceUrl = resourceMatch[1];
            // 如果是绝对路径，提取基础 URL
            if (resourceUrl.startsWith('http://') || resourceUrl.startsWith('https://')) {
              const url = new URL(resourceUrl);
              baseUrl = `${url.protocol}//${url.host}`;
            }
          }
        }

        // 如果找到了 baseUrl，修复资源路径
        if (baseUrl) {
          const baseUrlObj = new URL(baseUrl);
          const targetPort = baseUrlObj.port;
          const targetHost = baseUrlObj.hostname; // 使用 baseUrl 中的 hostname（可能是子域名）
          console.info('[getTemplate] 开始修复资源路径', { baseUrl, targetPort, targetHost, currentPort, currentHost });

          // 修复所有 script src 中的相对路径和包含错误端口的绝对路径
          processedTpl = processedTpl.replace(
            /<script([^>]*?)\s+src\s*=\s*["']([^"']+)["']([^>]*)>/gi,
            (match, before, src, after) => {
              // 如果 src 已经是完整 URL 且匹配目标 hostname 和端口，直接返回
              // 检查是否匹配目标 hostname（可能是子域名）和正确的端口
              if ((src.includes(`://${targetHost}:${targetPort}/`) || src.includes(`//${targetHost}:${targetPort}/`)) ||
                  (targetPort && (src.includes(`://${targetHost}/`) || src.includes(`//${targetHost}/`))) ||
                  (src.includes(`://localhost:${targetPort}/`) || src.includes(`//localhost:${targetPort}/`))) {
                return match;
              }

              let fixedSrc = src;

              // 关键：如果 src 包含 localhost，但当前页面是通过 IP 访问的，需要替换 hostname
              // 因为子应用的 base 可能设置为 http://localhost:${APP_PORT}/，但用户通过 IP 访问
              if (src.includes('localhost') && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
                fixedSrc = src.replace(/localhost/g, currentHost);
                console.info(`[getTemplate] 替换 localhost 为当前 hostname script: ${src} -> ${fixedSrc}`);
              }

              // 情况1：如果 src 是相对路径（以 / 开头），转换为完整的 URL（绝对路径）
              // 这是关键：入口脚本必须是绝对路径，这样 import.meta.url 才会是正确的端口
              // 使用 targetHost（可能是子域名）而不是 currentHost
              if (fixedSrc.startsWith('/')) {
                fixedSrc = `${baseUrl.replace(/localhost/g, targetHost)}${fixedSrc}`;
                console.info(`[getTemplate] 修复相对路径 script: ${src} -> ${fixedSrc}`);
              }
              // 情况2：如果 src 是相对路径（不以 / 开头，如 assets/file.js），也转换为完整的 URL
              else if (!fixedSrc.includes('://') && !fixedSrc.startsWith('//') && !fixedSrc.startsWith('data:') && !fixedSrc.startsWith('blob:')) {
                // 确保以 / 开头
                const normalizedSrc = fixedSrc.startsWith('/') ? fixedSrc : `/${fixedSrc}`;
                fixedSrc = `${baseUrl.replace(/localhost/g, targetHost)}${normalizedSrc}`;
                console.info(`[getTemplate] 修复非绝对路径 script: ${src} -> ${fixedSrc}`);
              }
              // 情况3：如果 src 包含错误的端口（当前页面的端口），修复它
              else if (currentPort && currentPort !== targetPort && (
                fixedSrc.includes(`:${currentPort}`) ||
                fixedSrc.includes(`://${currentHost}:${currentPort}`) ||
                fixedSrc.includes(`//${currentHost}:${currentPort}`) ||
                fixedSrc.includes(`://localhost:${currentPort}`) ||
                fixedSrc.includes(`//localhost:${currentPort}`)
              )) {
                // 替换所有出现的错误端口，并使用 targetHost（可能是子域名）
                fixedSrc = fixedSrc.replace(new RegExp(`:${currentPort}(?=/|$|"|'|\\s)`, 'g'), targetPort ? `:${targetPort}` : '');
                // 同时替换 localhost 和 currentHost 为 targetHost（可能是子域名）
                fixedSrc = fixedSrc.replace(/localhost/g, targetHost);
                if (currentHost !== targetHost) {
                  fixedSrc = fixedSrc.replace(new RegExp(currentHost.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), targetHost);
                }
                console.info(`[getTemplate] 修复错误端口 script: ${src} -> ${fixedSrc}`);
              }
              // 情况4：如果 src 是协议相对路径（//host/），添加正确的端口
              else if (fixedSrc.startsWith('//') && !fixedSrc.includes(':')) {
                // 检查是否是当前 hostname 或 localhost
                const hostMatch = fixedSrc.match(/^\/\/([^/]+)(.*)$/);
                if (hostMatch) {
                  const urlHost = hostMatch[1];
                  const urlPath = hostMatch[2];
                  if (urlHost === currentHost || urlHost === 'localhost' || urlHost === targetHost) {
                    fixedSrc = targetPort ? `//${targetHost}:${targetPort}${urlPath}` : `//${targetHost}${urlPath}`;
                    console.info(`[getTemplate] 修复协议相对路径 script: ${src} -> ${fixedSrc}`);
                  }
                }
              }
              // 情况5：如果 src 是完整 URL 但包含 localhost 或错误的 hostname，替换为 targetHost
              else if ((fixedSrc.startsWith('http://localhost') || fixedSrc.startsWith('https://localhost')) && targetHost !== 'localhost') {
                fixedSrc = fixedSrc.replace(/localhost/g, targetHost);
                console.info(`[getTemplate] 替换完整 URL 中的 localhost script: ${src} -> ${fixedSrc}`);
              }
              // 情况6：如果 src 包含错误的 hostname（当前页面的 hostname），但应该是子域名
              else if (currentHost !== targetHost && fixedSrc.includes(`://${currentHost}`)) {
                fixedSrc = fixedSrc.replace(new RegExp(currentHost.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), targetHost);
                console.info(`[getTemplate] 替换错误的 hostname script: ${src} -> ${fixedSrc}`);
              }

              if (fixedSrc !== src) {
                return `<script${before} src="${fixedSrc}"${after}>`;
              }
              return match;
            }
          );

          // 修复所有 link href 中的相对路径和包含错误端口的绝对路径
          // 这是关键：确保 CSS 文件路径正确，否则样式无法加载
          processedTpl = processedTpl.replace(
            /<link([^>]*?)\s+href\s*=\s*["']([^"']+)["']([^>]*)>/gi,
            (match, before, href, after) => {
              // 如果 href 已经是完整 URL 且匹配目标 hostname 和端口，直接返回
              // 检查是否匹配目标 hostname（可能是子域名）和正确的端口
              if ((href.includes(`://${targetHost}:${targetPort}/`) || href.includes(`//${targetHost}:${targetPort}/`)) ||
                  (targetPort && (href.includes(`://${targetHost}/`) || href.includes(`//${targetHost}/`))) ||
                  (href.includes(`://localhost:${targetPort}/`) || href.includes(`//localhost:${targetPort}/`))) {
                return match;
              }

              let fixedHref = href;

              // 关键：如果 href 包含 localhost，但当前页面是通过 IP 访问的，需要替换 hostname
              // 因为子应用的 base 可能设置为 http://localhost:${APP_PORT}/，但用户通过 IP 访问
              // 使用 targetHost（可能是子域名）而不是 currentHost
              if (href.includes('localhost') && targetHost !== 'localhost' && targetHost !== '127.0.0.1') {
                fixedHref = href.replace(/localhost/g, targetHost);
                console.info(`[getTemplate] 替换 localhost 为 targetHost link: ${href} -> ${fixedHref}`);
              }

              // 情况1：如果 href 是相对路径（以 / 开头），转换为完整的 URL
              // 使用 targetHost（可能是子域名）而不是 currentHost
              if (fixedHref.startsWith('/')) {
                fixedHref = `${baseUrl.replace(/localhost/g, targetHost)}${fixedHref}`;
                console.info(`[getTemplate] 修复相对路径 link: ${href} -> ${fixedHref}`);
              }
              // 情况2：如果 href 是相对路径（不以 / 开头），也转换为完整的 URL
              else if (!fixedHref.includes('://') && !fixedHref.startsWith('//') && !fixedHref.startsWith('data:') && !fixedHref.startsWith('blob:')) {
                const normalizedHref = fixedHref.startsWith('/') ? fixedHref : `/${fixedHref}`;
                fixedHref = `${baseUrl.replace(/localhost/g, targetHost)}${normalizedHref}`;
                console.info(`[getTemplate] 修复非绝对路径 link: ${href} -> ${fixedHref}`);
              }
              // 情况3：如果 href 包含错误的端口（当前页面的端口），修复它
              else if (currentPort && currentPort !== targetPort && (
                fixedHref.includes(`:${currentPort}`) ||
                fixedHref.includes(`://${currentHost}:${currentPort}`) ||
                fixedHref.includes(`//${currentHost}:${currentPort}`) ||
                fixedHref.includes(`://localhost:${currentPort}`) ||
                fixedHref.includes(`//localhost:${currentPort}`)
              )) {
                // 替换所有出现的错误端口，并使用 targetHost（可能是子域名）
                fixedHref = fixedHref.replace(new RegExp(`:${currentPort}(?=/|$|"|'|\\s)`, 'g'), targetPort ? `:${targetPort}` : '');
                // 同时替换 localhost 和 currentHost 为 targetHost（可能是子域名）
                fixedHref = fixedHref.replace(/localhost/g, targetHost);
                if (currentHost !== targetHost) {
                  fixedHref = fixedHref.replace(new RegExp(currentHost.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), targetHost);
                }
                console.info(`[getTemplate] 修复错误端口 link: ${href} -> ${fixedHref}`);
              }
              // 情况4：如果 href 是协议相对路径（//host/），添加正确的端口
              else if (fixedHref.startsWith('//') && !fixedHref.includes(':')) {
                const hostMatch = fixedHref.match(/^\/\/([^/]+)(.*)$/);
                if (hostMatch) {
                  const urlHost = hostMatch[1];
                  const urlPath = hostMatch[2];
                  if (urlHost === currentHost || urlHost === 'localhost' || urlHost === targetHost) {
                    fixedHref = targetPort ? `//${targetHost}:${targetPort}${urlPath}` : `//${targetHost}${urlPath}`;
                    console.info(`[getTemplate] 修复协议相对路径 link: ${href} -> ${fixedHref}`);
                  }
                }
              }
              // 情况5：如果 href 是完整 URL 但包含 localhost 或错误的 hostname，替换为 targetHost
              else if ((fixedHref.startsWith('http://localhost') || fixedHref.startsWith('https://localhost')) && targetHost !== 'localhost') {
                fixedHref = fixedHref.replace(/localhost/g, targetHost);
                console.info(`[getTemplate] 替换完整 URL 中的 localhost link: ${href} -> ${fixedHref}`);
              }
              // 情况6：如果 href 包含错误的 hostname（当前页面的 hostname），但应该是子域名
              else if (currentHost !== targetHost && fixedHref.includes(`://${currentHost}`)) {
                fixedHref = fixedHref.replace(new RegExp(currentHost.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), targetHost);
                console.info(`[getTemplate] 替换错误的 hostname link: ${href} -> ${fixedHref}`);
              }

              if (fixedHref !== href) {
                return `<link${before} href="${fixedHref}"${after}>`;
              }
              return match;
            }
          );

          // 关键：添加或更新 <base> 标签，确保所有相对路径都基于正确的路径
          // 这会影响动态导入的模块路径解析
          // 如果入口是子域名 URL，使用子域名作为 base URL；否则使用当前 hostname
          const hostname = window.location.hostname;

          // 构建产物直接部署到子域名根目录，base 路径始终是 /
          const basePath = '/';

          // 关键：优先使用 targetHost（从 baseUrl 中提取的子域名），而不是当前页面的 hostname
          // 这样当从主域名访问时（如 bellis.com.cn/production），base 会指向子域名（production.bellis.com.cn）
          // targetHost 已经从 baseUrl 中提取，如果 baseUrl 是子域名，targetHost 就是子域名
          let baseHost = targetHost || currentHost;

          // 双重保险：如果 entry 是完整 URL，再次确认使用 entry 中的 hostname
          // 这样可以处理 entry 参数传递但 baseUrl 未正确设置的情况
          if (entry) {
            try {
              let entryUrl: URL | null = null;
              if (entry.startsWith('http://') || entry.startsWith('https://')) {
                entryUrl = new URL(entry);
              } else if (entry.startsWith('//')) {
                entryUrl = new URL(`${protocol}${entry}`);
              }

              if (entryUrl) {
                // 如果 entry 中的 hostname 与当前 hostname 不同，说明是跨域加载，使用 entry 的 hostname
                if (entryUrl.hostname !== currentHost) {
                  baseHost = entryUrl.hostname;
                  console.info('[getTemplate] 从 entry 中提取 baseHost:', baseHost, 'entry:', entry);
                }
              }
            } catch (e) {
              // 解析失败，使用 targetHost
              console.warn('[getTemplate] 解析 entry 失败，使用 targetHost:', targetHost, e);
            }
          }

          // 构建产物直接部署到子域名根目录，base 路径始终是 /
          const baseHref = `${protocol}//${baseHost}${targetPort ? `:${targetPort}` : ''}${basePath}`;
          console.info('[getTemplate] 设置 base URL:', baseHref, { hostname, baseHost, targetHost, currentHost, matchedAppName, basePath, entry });

          // 先移除现有的 <base> 标签（如果有），确保使用正确的 base URL
          processedTpl = processedTpl.replace(/<base[^>]*>/gi, '');

          // 在 <head> 标签内添加新的 <base> 标签，放在最前面（在所有其他标签之前）
          // 这是关键：<base> 标签必须在所有其他资源标签之前，才能影响所有后续的资源加载
          if (processedTpl.includes('<head')) {
            // 匹配 <head> 标签，在它后面立即插入 <base> 标签
            processedTpl = processedTpl.replace(
              /(<head[^>]*>)/i,
              `$1\n    <base href="${baseHref}">`
            );
          } else {
            // 如果没有 <head> 标签，在 <html> 标签后添加
            processedTpl = processedTpl.replace(
              /(<html[^>]*>)/i,
              `$1\n  <base href="${baseHref}">`
            );
          }

          console.info('[getTemplate] 处理后的 HTML 模板前 1000 字符:', processedTpl.substring(0, 1000));
        } else {
          console.warn('[getTemplate] 未找到 baseUrl，无法修复资源路径');
        }

        // 确保所有 script 标签都有 type="module"
        const finalTpl = processedTpl.replace(
          /<script(\s+[^>]*)?>/gi,
          (match, attrs = '') => attrs.includes('type=')
            ? match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"')
            : `<script type="module"${attrs}>`
        );

        console.info('[getTemplate] 最终处理后的 HTML 包含的 script 标签:', finalTpl.match(/<script[^>]*>/gi)?.slice(0, 5));

        return finalTpl;
      },
    },
  });

  // 初始加载时，根据当前路径注册对应应用的菜单和 tabs
  const currentPath = window.location.pathname;
  const isSystemPath = !currentPath.startsWith('/admin') &&
                       !currentPath.startsWith('/logistics') &&
                       !currentPath.startsWith('/engineering') &&
                       !currentPath.startsWith('/quality') &&
                       !currentPath.startsWith('/production') &&
                       !currentPath.startsWith('/finance') &&
                       !currentPath.startsWith('/docs');
  const isAdminPath = currentPath.startsWith('/admin');

  if (isSystemPath) {
    // 动态导入避免循环依赖（这些函数已经是异步的）
    registerManifestTabsForApp('system').catch((err) => console.error('注册系统应用标签页失败', err));
    registerManifestMenusForApp('system').catch((err) => console.error('注册系统应用菜单失败', err));
  } else if (isAdminPath) {
    registerManifestTabsForApp('admin').catch((err) => console.error('注册管理应用标签页失败', err));
    registerManifestMenusForApp('admin').catch((err) => console.error('注册管理应用菜单失败', err));
  }

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
      const { loadingError } = await import('../utils/loadingManager');
      loadingError(appName, event.error);
    }

    // 处理资源加载错误（404），尝试修复路径
    if (event.target && (event.target instanceof HTMLScriptElement || event.target instanceof HTMLLinkElement)) {
      const target = event.target as HTMLScriptElement | HTMLLinkElement;
      const src = (event.target instanceof HTMLScriptElement ? event.target.src : null) ||
                  (event.target instanceof HTMLLinkElement ? event.target.href : null);

      // 处理资源加载错误（404），包括开发环境和生产环境
      // 检查是否是源文件路径错误（包含 /src/ 或 /packages/）
      const isSourcePathError = src && (src.includes('/packages/') || src.includes('/src/'));
      const isDevError = src &&
        window.location.port === '4180' &&
        (src.includes('/assets/') || src.endsWith('.js') || src.endsWith('.css') || src.endsWith('.mjs'));

      if (isSourcePathError || isDevError) {
        // 如果是源文件路径错误，直接忽略（这些文件应该在构建时被打包）
        // 包括所有 /packages/ 和 /src/ 路径，这些都不应该在生产环境出现
        if (isSourcePathError) {
          console.warn(`[错误处理] 忽略源文件路径错误: ${src} (此文件应在构建时被打包)`);
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        // 根据当前路径判断是哪个应用
        const currentPath = window.location.pathname;
        let targetAppName: string | null = null;

        if (currentPath.startsWith('/admin')) {
          targetAppName = 'admin';
        } else if (currentPath.startsWith('/logistics')) {
          targetAppName = 'logistics';
        } else if (currentPath.startsWith('/engineering')) {
          targetAppName = 'engineering';
        } else if (currentPath.startsWith('/quality')) {
          targetAppName = 'quality';
        } else if (currentPath.startsWith('/production')) {
          targetAppName = 'production';
        } else if (currentPath.startsWith('/finance')) {
          targetAppName = 'finance';
        }

        if (targetAppName) {
          const appEntry = entryMap.get(targetAppName);
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

              if (port && port !== SYSTEM_APP_PREVIEW_PORT) {
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

/**
 * 监听子应用就绪事件
 */
export function listenSubAppReady() {
  window.addEventListener('subapp:ready', async (event: any) => {
    const appName = event.detail?.name;
    // console.log(`[qiankun] 子应用 ${appName} subapp:ready 事件触发`);

    // 动态导入避免循环依赖
    // const { finishLoading } = await import('../utils/loadingManager');
    // finishLoading(); // 注释掉 loading

    // 关键：清除 loading 属性，确保 Layout 组件能正确更新状态
    const container = document.querySelector('#subapp-viewport') as HTMLElement;
    if (container && container.hasAttribute('data-qiankun-loading')) {
      container.removeAttribute('data-qiankun-loading');
      // console.log(`[qiankun] 子应用 ${appName} subapp:ready 清除 loading 属性`);
    }

    // 触发 after-mount 事件，确保 Layout 组件更新状态
    window.dispatchEvent(new CustomEvent('qiankun:after-mount', {
      detail: { appName }
    }));
  });
}

/**
 * 监听子应用路由变化事件
 */
export function listenSubAppRouteChange() {
  window.addEventListener('subapp:route-change', (event: Event) => {
    const customEvent = event as CustomEvent;
    const { path, fullPath, name, meta } = customEvent.detail;

    // 动态导入避免循环依赖
    (async () => {
      const { useProcessStore, getCurrentAppFromPath } = await import('../store/process');
      const process = useProcessStore();
      const app = getCurrentAppFromPath(path);

      // ? 如果是子应用首页，将该应用的所有标签设为未激活
      if (meta?.isHome === true) {
        process.list.forEach(tab => {
          if (tab.app === app) {
            tab.active = false;
          }
        });
        return;
      }

    // 排除无效应用（main）
    // 所有其他应用（system, admin, logistics, engineering, quality, production, finance, monitor 等）都应该处理
    if (app === 'main') {
      return;
    }

    // 排除文档域（docs）
    if (app === 'docs') {
      return;
    }

      process.add({
        path,
        fullPath,
        name,
        meta,
      });
    })();
  });
}


