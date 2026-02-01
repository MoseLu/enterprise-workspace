import { storage } from '@btc/shared-utils';
import { registerMicroApps, start } from 'qiankun';
import { microApps } from './apps';
// 延迟导入 loadingManager 以避免循环依赖
// import { startLoading, finishLoading, loadingError } from '../utils/loadingManager';
import { registerTabs, clearTabs, clearTabsExcept, type TabMeta } from '../store/tabRegistry';
import { registerMenus, clearMenus, clearMenusExcept, getMenusForApp, type MenuItem } from '../store/menuRegistry';
import { getManifestTabs, getManifestMenus, logger } from '@btc/shared-core/manifest';
import { useProcessStore, getCurrentAppFromPath } from '../store/process';
import { assignIconsToMenuTree } from '@btc/shared-core';

// 应用名称映射（用于显示友好的中文名称）
const appNameMap: Record<string, string> = {
  logistics: '物流应用',
  engineering: '工程应用',
  quality: '品质应用',
  production: '生产应用',
};

export function registerManifestTabsForApp(appName: string): Promise<void> {
  const tabs = getManifestTabs(appName);
  if (!tabs.length) {
    return Promise.resolve();
  }

  const normalizedTabs: TabMeta[] = tabs.map((tab) => {
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
 * 规范化菜单路径：在开发环境下自动添加应用前缀，生产子域环境下保持原路径
 * manifest 中的菜单路径已经移除了应用前缀，所以：
 * - 开发环境（qiankun模式）：需要添加前缀 `/quality/xxx`
 * - 生产子域环境：保持原路径 `/xxx`
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
    // 生产环境子域名：保持原路径（manifest 中已经没有前缀了）
    return normalizedPath;
  }

  // 开发环境（qiankun模式）：需要添加应用前缀
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

    if (item1.index !== item2.index ||
        item1.title !== item2.title ||
        item1.icon !== item2.icon) {
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

export function registerManifestMenusForApp(appName: string): Promise<void> {
  const menus = getManifestMenus(appName);
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

  // 获取现有菜单，如果内容相同则不更新，避免触发不必要的响应式更新
  const existingMenus = getMenusForApp(appName);
  if (existingMenus.length > 0 && menusEqual(existingMenus, normalizedMenus)) {
    // 菜单内容相同，不需要更新，避免触发重新渲染
    return Promise.resolve();
  }

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
 */
function filterQiankunLogs() {
  // 保存原始方法（保存到全局，供其他地方使用）
  (console as any).__originalLog = console.log;
  (console as any).__originalInfo = console.info;
  (console as any).__originalWarn = console.warn;
  (console as any).__originalError = console.error;

  const originalInfo = console.info.bind(console);
  const originalWarn = console.warn.bind(console);

  console.info = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('[qiankun:sandbox]')) {
      return;
    }
    // 使用 logger 统一输出，支持日志上报和格式统一
    const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
    console.info(message, ...args);
  };

  console.warn = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('[qiankun:sandbox]')) {
      return;
    }
    // 使用 logger 统一输出，支持日志上报和格式统一
    const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
    console.warn(message, ...args);
  };
}

/**
 * 初始化qiankun微前端
 */
export function setupQiankun() {
  // 过滤 qiankun 日志
  filterQiankunLogs();

  // 获取当前语言
  const currentLocale = getCurrentLocale();

  // 注册子应用，传递当前语言和 Tab 管理回调
  const appsWithProps = microApps.map(app => ({
    ...app,
    props: {
      locale: currentLocale,
      onReady: async () => {
        // 子应用加载完成（延迟导入以避免循环依赖）
        const { finishLoading } = await import('../utils/loadingManager');
        finishLoading();
      },
      // Tab 管理 API
      registerTabs: (tabs: TabMeta[]) => registerTabs(app.name, tabs),
      clearTabs: () => clearTabs(app.name),
      setActiveTab: (tabKey: string) => {
        console.info('[Main] Sub-app set active tab:', app.name, tabKey);
      },
    },
    // 核心配置：指定脚本类型为 module，让 qiankun 以 ES 模块方式加载子应用脚本
    // 这是解决 Vite 子应用 ES 模块加载问题的关键配置
    scriptType: 'module' as const,
    // 自定义 getTemplate：修改 HTML 模板，确保所有 script 标签都有 type="module"
    getTemplate: (tpl: string) => {
      // 使用正则表达式匹配所有 script 标签，确保它们都有 type="module"
      return tpl.replace(
        /<script(\s+[^>]*)?>/gi,
        (match, attrs = '') => {
          // 如果已经有 type 属性，替换为 module
          if (attrs.includes('type=')) {
            return match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"');
          }
          // 如果没有 type 属性，添加 type="module"
          return `<script type="module"${attrs}>`;
        }
      );
    },
    // 配置生命周期超时时间（single-spa 格式）
    // 关键：根据环境设置合理的超时时间，避免生产环境因网络延迟导致超时
    get timeouts() {
      const isDev = import.meta.env.DEV;
      const defaultTimeout = isDev ? 8000 : 15000; // 开发环境 8 秒，生产环境 15 秒
      const timeout = app.timeout || defaultTimeout;

      return {
      bootstrap: {
        millis: timeout * 2, // bootstrap 阶段需要更多时间（包括模块加载）
        dieOnTimeout: false, // 超时后不终止应用，只警告（避免因网络问题导致应用无法加载）
        warningMillis: Math.floor(timeout * 1.5), // 警告时间：避免过早警告（ES 模块加载阶段也会计入时间）
      },
      mount: {
        millis: timeout,
        dieOnTimeout: false,
        warningMillis: Math.floor(timeout * 0.8),
      },
      unmount: {
        millis: 5000, // 增加到 5 秒，确保卸载完成
        dieOnTimeout: false,
        warningMillis: 4000,
      },
      };
    },
  }));

  registerMicroApps(
    appsWithProps,
    {
      // 应用加载前
      beforeLoad: [async (app) => {
        const appName = appNameMap[app.name] || app.name;
        // 延迟导入以避免循环依赖
        const { startLoading } = await import('../utils/loadingManager');
        startLoading(appName);

        // 确保容器存在且可见（qiankun 需要容器可见才能加载）
        return new Promise<void>((resolve, reject) => {
          let retryCount = 0;
          const maxRetries = 50; // 增加重试次数到 50 次（约 2.5 秒）
          const retryDelay = 50; // 每次重试间隔 50ms

          const ensureContainer = () => {
            // 使用双重 requestAnimationFrame 确保 Vue 的响应式更新完成
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                const container = document.querySelector('#subapp-viewport') as HTMLElement;

                if (container) {
                  // 检查容器是否在 DOM 中（不仅仅是存在，还要在文档中）
                  if (!container.isConnected) {
                    retryCount++;
                    if (retryCount < maxRetries) {
                      setTimeout(ensureContainer, retryDelay);
                      return;
                    } else {
                      logger.error(`[qiankun] 容器 #subapp-viewport 不在 DOM 中`);
                      reject(new Error(`容器 #subapp-viewport 不在 DOM 中，无法加载应用 ${app.name}`));
                      return;
                    }
                  }

                  // 强制显示容器（使用 !important 确保优先级）
                  container.style.setProperty('display', 'flex', 'important');
                  container.style.setProperty('visibility', 'visible', 'important');
                  container.style.setProperty('opacity', '1', 'important');
                  // 添加标记，防止 Vue 的 v-show 覆盖
                  container.setAttribute('data-qiankun-loading', 'true');

                  // 触发自定义事件，通知 Layout 组件更新状态
                  window.dispatchEvent(new CustomEvent('qiankun:before-load', {
                    detail: { appName: app.name }
                  }));

                  // 再次确认容器可见（等待一个 tick 后检查）
                  setTimeout(() => {
                    const computedStyle = window.getComputedStyle(container);
                    const isVisible = computedStyle.display !== 'none' &&
                                    computedStyle.visibility !== 'hidden' &&
                                    computedStyle.opacity !== '0';

                    if (!isVisible) {
                      console.warn(`[qiankun] 容器 #subapp-viewport 仍然不可见，强制显示`);
                      container.style.setProperty('display', 'flex', 'important');
                      container.style.setProperty('visibility', 'visible', 'important');
                      container.style.setProperty('opacity', '1', 'important');
                    }

                    // 切入子应用前，清理其他子应用的映射，防串味
                    clearTabsExcept(app.name);
                    clearMenusExcept(app.name);

                    registerManifestTabsForApp(app.name);
                    registerManifestMenusForApp(app.name);

                    resolve();
                  }, 10);
                } else {
                  // 容器不存在，重试
                  retryCount++;
                  if (retryCount < maxRetries) {
                    setTimeout(ensureContainer, retryDelay);
                  } else {
                    // 超过最大重试次数，报错
                    logger.error(`[qiankun] 容器 #subapp-viewport 在 ${maxRetries * retryDelay}ms 内未找到`);
                    reject(new Error(`容器 #subapp-viewport 不存在，无法加载应用 ${app.name}`));
                  }
                }
              });
            });
          };

          // 开始检查
          ensureContainer();
        });
      }],

      // 应用挂载后
      afterMount: [(_app) => {
        // 触发自定义事件，通知 Layout 组件更新状态
        window.dispatchEvent(new CustomEvent('qiankun:after-mount', {
          detail: { appName: _app.name }
        }));

        // 清理加载标记
        const container = document.querySelector('#subapp-viewport') as HTMLElement;
        if (container) {
          container.removeAttribute('data-qiankun-loading');
          // 移除强制样式，让 Vue 的 v-show 正常控制
          container.style.removeProperty('display');
          container.style.removeProperty('visibility');
          container.style.removeProperty('opacity');
        }

        // 兜底机制：如果子应用没有主动调用 onReady，这里确保 loading 被清除
        // 使用较短的延迟，确保在 onReady 之后执行（如果 onReady 被调用的话）
        // 如果 onReady 没有被调用，这里会清除 loading
        setTimeout(async () => {
          const { finishLoading } = await import('../utils/loadingManager');
          finishLoading();
        }, 200);
        return Promise.resolve();
      }],

      // 应用卸载后
      afterUnmount: [(app) => {
        // 离开子应用，清理其映射
        clearTabs(app.name);
        clearMenus(app.name);

        return Promise.resolve();
      }],
    }
  );

  // 启动qiankun
  // 使用统一的沙箱配置，避免样式隔离不一致导致的样式引擎累积
  const { getQiankunSandboxConfig } = await import('@btc/shared-core');
  const sandboxConfig = getQiankunSandboxConfig();

  start({
    prefetch: false,
    sandbox: sandboxConfig,
    singular: true, // 单例模式：同时只能运行一个子应用（子应用之间不会同时存在，因此不需要额外隔离）
    // 关键：允许加载跨域模块脚本，强制以 module 类型加载
    // @ts-expect-error - importEntryOpts 在 qiankun 2.10.16 的类型定义中不存在，但实际可用
    importEntryOpts: {
      scriptType: 'module', // 再次强调 module 类型
      // 自定义 fetch：确保脚本以正确的方式加载
      fetch: (url: string, options?: RequestInit) => {
        return fetch(url, {
          ...options,
          mode: 'cors',
          credentials: 'same-origin',
        });
      },
      // 自定义 getTemplate：确保所有 script 标签都有 type="module"
      getTemplate: (tpl: string) => {
        return tpl.replace(
          /<script(\s+[^>]*)?>/gi,
          (match, attrs = '') => {
            if (attrs.includes('type=')) {
              return match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"');
            }
            return `<script type="module"${attrs}>`;
          }
        );
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
    registerManifestTabsForApp('system');
    registerManifestMenusForApp('system');
  } else if (isAdminPath) {
    registerManifestTabsForApp('admin');
    registerManifestMenusForApp('admin');
  }

  // 监听全局错误（延迟导入以避免循环依赖）
  window.addEventListener('error', async (event) => {
    if (event.message?.includes('application')) {
      const appMatch = event.message.match(/'(\w+)'/);
      const appName = appMatch && appMatch[1] ? appNameMap[appMatch[1]] || appMatch[1] : '应用';
      const { loadingError } = await import('../utils/loadingManager');
      loadingError(appName, event.error);
    }
  });
}

/**
 * 监听子应用就绪事件
 */
export function listenSubAppReady() {
  window.addEventListener('subapp:ready', async () => {
    // 延迟导入以避免循环依赖
    const { finishLoading } = await import('../utils/loadingManager');
    finishLoading();
  });
}

/**
 * 监听子应用路由变化事件
 */
export function listenSubAppRouteChange() {
  window.addEventListener('subapp:route-change', (event: Event) => {
    const customEvent = event as CustomEvent;
    const { path, fullPath, name, meta } = customEvent.detail;

    // ? 如果是子应用首页，将该应用的所有标签设为未激活
    if (meta?.isHome === true) {
      const process = useProcessStore();
      const app = getCurrentAppFromPath(path);
      process.list.forEach(tab => {
        if (tab.app === app) {
          tab.active = false;
        }
      });
      return;
    }

    // 使用统一的 getCurrentAppFromPath 来判断应用类型，更通用
    const process = useProcessStore();
    const app = getCurrentAppFromPath(path);

    // 排除管理域（admin）和无效应用（main）
    // 所有其他应用（system, logistics, engineering, quality, production, finance 等）都应该处理
    if (app === 'admin' || app === 'main') {
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
  });
}

