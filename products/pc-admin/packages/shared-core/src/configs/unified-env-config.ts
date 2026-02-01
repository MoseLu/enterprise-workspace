/**
 * 统一的环境配置系统
 * 支持通过 .env 切换配置方案，但内部规则不变
 */

// 注意：这里不能直接导入 logger，因为存在循环依赖：
// logger -> env-info -> unified-env-config -> logger
// 在模块加载的早期阶段，logger 可能还未初始化，所以直接使用 console
// console 是全局对象，在模块加载时就已经存在，不会受到循环依赖的影响

import { getAllApps, getAppById } from './app-scanner';
import { getAllDevPorts, getAllPrePorts, getAppConfig, getAppConfigByPrePort, getAppConfigByTestHost, getAppConfigByPocHost, getAppConfigBySitHost, getAppConfigByUatHost, isSpecialAppById, MAIN_APP_CONFIG } from './app-env.config';

// 安全的 logger 访问函数，避免循环依赖问题
// 在模块加载早期，直接使用 console，因为 logger 可能还未初始化
function safeLoggerWarn(message: string, ...args: any[]) {
  // 直接使用 console.warn，避免循环依赖
  // console 是全局对象，在模块加载时就已经存在，不会受到循环依赖的影响
  console.warn(`[unified-env-config] ${message}`, ...args);
}

export type Environment = 'development' | 'preview' | 'poc' | 'sit' | 'uat' | 'test' | 'production';
export type ConfigScheme = 'default' | 'custom'; // 可以通过 .env 切换

export interface EnvironmentConfig {
  // API 配置
  api: {
    baseURL: string;
    timeout: number;
    backendTarget?: string;
  };

  // 微前端配置
  microApp: {
    baseURL: string;
    entryPrefix: string;
  };

  // 文档配置
  docs: {
    url: string;
    port: string;
  };

  // WebSocket 配置
  ws: {
    url: string;
  };

  // 上传配置
  upload: {
    url: string;
  };

  // CDN 配置
  cdn: {
    staticAssetsUrl: string;
  };
}

// 配置方案：类似 Element Plus 主题
const configSchemes: Record<ConfigScheme, Record<Environment, EnvironmentConfig>> = {
  default: {
    development: {
      api: {
        baseURL: '/api',
        timeout: 30000,
        backendTarget: 'http://10.80.9.76:8115',
      },
      microApp: {
        baseURL: `//${MAIN_APP_CONFIG.devHost}`,
        entryPrefix: '',
      },
      docs: {
        url: 'http://localhost:8092',
        port: '8092',
      },
      ws: {
        url: 'ws://10.80.9.76:8115',
      },
      upload: {
        url: '/api/upload',
      },
      cdn: {
        staticAssetsUrl: '',
      },
    },
    preview: {
      api: {
        baseURL: '/api',
        timeout: 30000,
      },
      microApp: {
        baseURL: 'http://localhost',
        entryPrefix: '/index.html',
      },
      docs: {
        url: 'http://localhost:4173',
        port: '4173',
      },
      ws: {
        url: 'ws://localhost:8115',
      },
      upload: {
        url: '/api/upload',
      },
      cdn: {
        staticAssetsUrl: '',
      },
    },
    poc: {
      api: {
        baseURL: '/api',
        timeout: 30000,
        backendTarget: 'http://poc-api.bellis.com.cn',
      },
      microApp: {
        baseURL: 'https://poc.bellis.com.cn',
        entryPrefix: '',
      },
      docs: {
        url: 'https://docs.poc.bellis.com.cn',
        port: '',
      },
      ws: {
        url: 'wss://api.poc.bellis.com.cn',
      },
      upload: {
        url: '/api/upload',
      },
      cdn: {
        staticAssetsUrl: 'https://all.bellis.com.cn',
      },
    },
    sit: {
      api: {
        baseURL: '/api',
        timeout: 30000,
        backendTarget: 'http://sit-api.bellis.com.cn',
      },
      microApp: {
        baseURL: 'https://sit.bellis.com.cn',
        entryPrefix: '',
      },
      docs: {
        url: 'https://docs.sit.bellis.com.cn',
        port: '',
      },
      ws: {
        url: 'wss://api.sit.bellis.com.cn',
      },
      upload: {
        url: '/api/upload',
      },
      cdn: {
        staticAssetsUrl: 'https://all.bellis.com.cn',
      },
    },
    uat: {
      api: {
        baseURL: '/api',
        timeout: 30000,
        backendTarget: 'http://uat-api.bellis.com.cn',
      },
      microApp: {
        baseURL: 'https://uat.bellis.com.cn',
        entryPrefix: '',
      },
      docs: {
        url: 'https://docs.uat.bellis.com.cn',
        port: '',
      },
      ws: {
        url: 'wss://api.uat.bellis.com.cn',
      },
      upload: {
        url: '/api/upload',
      },
      cdn: {
        staticAssetsUrl: 'https://all.bellis.com.cn',
      },
    },
    test: {
      api: {
        baseURL: '/api',
        timeout: 30000,
      },
      microApp: {
        baseURL: 'https://test.bellis.com.cn',
        entryPrefix: '', // 构建产物直接部署到子域名根目录（与生产环境一致）
      },
      docs: {
        url: 'https://docs.test.bellis.com.cn',
        port: '',
      },
      ws: {
        url: 'wss://api.test.bellis.com.cn',
      },
      upload: {
        url: '/api/upload',
      },
      cdn: {
        staticAssetsUrl: 'https://all.bellis.com.cn',
      },
    },
    production: {
      api: {
        baseURL: '/api',
        timeout: 30000,
      },
      microApp: {
        baseURL: 'https://bellis.com.cn',
        entryPrefix: '', // 构建产物直接部署到子域名根目录
      },
      docs: {
        url: 'https://docs.bellis.com.cn',
        port: '',
      },
      ws: {
        url: 'wss://api.bellis.com.cn',
      },
      upload: {
        url: '/api/upload',
      },
      cdn: {
        staticAssetsUrl: 'https://all.bellis.com.cn',
      },
    },
  },
  custom: {
    // 可以通过 .env 定义自定义配置方案
    // 这里可以扩展其他配置方案
    development: {
      api: {
        baseURL: '/api',
        timeout: 30000,
        backendTarget: 'http://10.80.9.76:8115',
      },
      microApp: {
        baseURL: `//${MAIN_APP_CONFIG.devHost}`,
        entryPrefix: '',
      },
      docs: {
        url: 'http://localhost:8092',
        port: '8092',
      },
      ws: {
        url: 'ws://10.80.9.76:8115',
      },
      upload: {
        url: '/api/upload',
      },
      cdn: {
        staticAssetsUrl: '',
      },
    },
    preview: {
      api: {
        baseURL: '/api',
        timeout: 30000,
      },
      microApp: {
        baseURL: 'http://localhost',
        entryPrefix: '/index.html',
      },
      docs: {
        url: 'http://localhost:4173',
        port: '4173',
      },
      ws: {
        url: 'ws://localhost:8115',
      },
      upload: {
        url: '/api/upload',
      },
      cdn: {
        staticAssetsUrl: '',
      },
    },
    poc: {
      api: {
        baseURL: '/api',
        timeout: 30000,
        backendTarget: 'http://poc-api.bellis.com.cn',
      },
      microApp: {
        baseURL: 'https://poc.bellis.com.cn',
        entryPrefix: '',
      },
      docs: {
        url: 'https://docs.poc.bellis.com.cn',
        port: '',
      },
      ws: {
        url: 'wss://api.poc.bellis.com.cn',
      },
      upload: {
        url: '/api/upload',
      },
      cdn: {
        staticAssetsUrl: 'https://all.bellis.com.cn',
      },
    },
    sit: {
      api: {
        baseURL: '/api',
        timeout: 30000,
        backendTarget: 'http://sit-api.bellis.com.cn',
      },
      microApp: {
        baseURL: 'https://sit.bellis.com.cn',
        entryPrefix: '',
      },
      docs: {
        url: 'https://docs.sit.bellis.com.cn',
        port: '',
      },
      ws: {
        url: 'wss://api.sit.bellis.com.cn',
      },
      upload: {
        url: '/api/upload',
      },
      cdn: {
        staticAssetsUrl: 'https://all.bellis.com.cn',
      },
    },
    uat: {
      api: {
        baseURL: '/api',
        timeout: 30000,
        backendTarget: 'http://uat-api.bellis.com.cn',
      },
      microApp: {
        baseURL: 'https://uat.bellis.com.cn',
        entryPrefix: '',
      },
      docs: {
        url: 'https://docs.uat.bellis.com.cn',
        port: '',
      },
      ws: {
        url: 'wss://api.uat.bellis.com.cn',
      },
      upload: {
        url: '/api/upload',
      },
      cdn: {
        staticAssetsUrl: 'https://all.bellis.com.cn',
      },
    },
    test: {
      api: {
        baseURL: '/api',
        timeout: 30000,
      },
      microApp: {
        baseURL: 'https://test.bellis.com.cn',
        entryPrefix: '', // 构建产物直接部署到子域名根目录（与生产环境一致）
      },
      docs: {
        url: 'https://docs.test.bellis.com.cn',
        port: '',
      },
      ws: {
        url: 'wss://api.test.bellis.com.cn',
      },
      upload: {
        url: '/api/upload',
      },
      cdn: {
        staticAssetsUrl: 'https://all.bellis.com.cn',
      },
    },
    production: {
      api: {
        baseURL: '/api',
        timeout: 30000,
      },
      microApp: {
        baseURL: 'https://bellis.com.cn',
        entryPrefix: '', // 构建产物直接部署到子域名根目录
      },
      docs: {
        url: 'https://docs.bellis.com.cn',
        port: '',
      },
      ws: {
        url: 'wss://api.bellis.com.cn',
      },
      upload: {
        url: '/api/upload',
      },
      cdn: {
        staticAssetsUrl: 'https://all.bellis.com.cn',
      },
    },
  },
};

/**
 * 获取当前配置方案（从 .env 读取，默认 default）
 */
function getConfigScheme(): ConfigScheme {
  // 防御性检查：在 Node.js 环境中，import.meta.env 可能未定义
  if (typeof import.meta === 'undefined' || !import.meta.env) {
    return 'default';
  }
  return (import.meta.env.VITE_CONFIG_SCHEME as ConfigScheme) || 'default';
}

/**
 * 检测当前环境
 */
export function getEnvironment(): Environment {
  if (typeof window === 'undefined') {
    // 在 Node.js 环境中（如 Vite 配置文件），import.meta.env 可能未定义
    // 使用防御性检查，提供后备方案
    
    // 优先检查显式的环境变量（VITE_ENV 或 APP_ENV）
    // 这样可以支持 poc、sit、uat 等新环境
    const explicitEnv = 
      (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ENV) ||
      (typeof process !== 'undefined' && process.env?.VITE_ENV) ||
      (typeof process !== 'undefined' && process.env?.APP_ENV);
    
    if (explicitEnv) {
      const env = explicitEnv.toLowerCase();
      // 验证是否为有效的环境类型
      const validEnvs: Environment[] = ['development', 'preview', 'poc', 'sit', 'uat', 'test', 'production'];
      if (validEnvs.includes(env as Environment)) {
        return env as Environment;
      }
    }
    
    // 如果没有显式指定，则根据 NODE_ENV 或 import.meta.env.PROD 判断
    const prodFlag =
      (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD) ??
      (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production');
    return prodFlag ? 'production' : 'development';
  }

  const hostname = window.location.hostname;
  const port = window.location.port || '';

  // POC 环境：hostname 为 poc.bellis.com.cn 或以 poc- 开头且以 .bellis.com.cn 结尾
  // 例如：poc.bellis.com.cn, poc-xxx.bellis.com.cn, admin.poc.bellis.com.cn
  if (hostname === 'poc.bellis.com.cn' || hostname.endsWith('.poc.bellis.com.cn') || 
      (hostname.startsWith('poc-') && hostname.endsWith('.bellis.com.cn'))) {
    return 'poc';
  }

  // SIT 环境：hostname 为 sit.bellis.com.cn 或以 .sit.bellis.com.cn 结尾
  // 例如：sit.bellis.com.cn, admin.sit.bellis.com.cn
  if (hostname === 'sit.bellis.com.cn' || hostname.endsWith('.sit.bellis.com.cn')) {
    return 'sit';
  }

  // UAT 环境：hostname 为 uat.bellis.com.cn 或以 .uat.bellis.com.cn 结尾
  // 例如：uat.bellis.com.cn, admin.uat.bellis.com.cn
  if (hostname === 'uat.bellis.com.cn' || hostname.endsWith('.uat.bellis.com.cn')) {
    return 'uat';
  }

  // 测试环境：hostname 为 test.bellis.com.cn 或以 .test.bellis.com.cn 结尾（向后兼容，作为 UAT 的别名）
  // 例如：test.bellis.com.cn, admin.test.bellis.com.cn
  if (hostname === 'test.bellis.com.cn' || hostname.endsWith('.test.bellis.com.cn')) {
    return 'test';
  }

  // 生产环境：hostname 为 bellis.com.cn 或以 .bellis.com.cn 结尾，但不包含 .test.bellis.com.cn、.poc.bellis.com.cn、.sit.bellis.com.cn、.uat.bellis.com.cn
  // 注意：只检查 hostname，避免路径中的 /test/ 被误判
  if (
    (hostname === 'bellis.com.cn' || hostname.endsWith('.bellis.com.cn')) &&
    !hostname.includes('.test.bellis.com.cn') &&
    !hostname.includes('.poc.bellis.com.cn') &&
    !hostname.includes('.sit.bellis.com.cn') &&
    !hostname.includes('.uat.bellis.com.cn')
  ) {
    return 'production';
  }

  // 防御性检查：确保 getAllPrePorts 和 getAllDevPorts 可以安全调用
  // 如果 APP_ENV_CONFIGS 还没有初始化，使用 try-catch 捕获错误
  try {
    const prePorts = getAllPrePorts();
    if (prePorts.includes(port)) {
      return 'preview';
    }

    const devPorts = getAllDevPorts();
    if (devPorts.includes(port)) {
      return 'development';
    }
  } catch (error) {
    // 如果 getAllPrePorts 或 getAllDevPorts 抛出错误（如 APP_ENV_CONFIGS 未初始化）
    // 记录警告并继续使用其他方法判断环境
    if (import.meta.env.DEV) {
      safeLoggerWarn('[unified-env-config] getAllPrePorts/getAllDevPorts 调用失败，使用备用方法判断环境:', error);
    }
  }

  // 浏览器环境：防御性地访问 import.meta.env
  const prodFlag =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD) ??
    false;
  return prodFlag ? 'production' : 'development';
}

/**
 * 获取当前环境的配置
 */
export function getEnvConfig(): EnvironmentConfig {
  const scheme = getConfigScheme();
  const env = getEnvironment();
  const config = configSchemes[scheme][env];

  // 支持通过环境变量覆盖 CDN URL
  // 在浏览器环境中，可以通过 VITE_CDN_STATIC_ASSETS_URL 覆盖
  // 在 Node.js 环境中（如 Vite 配置），可以通过 CDN_STATIC_ASSETS_URL 覆盖
  if (config.cdn?.staticAssetsUrl) {
    let envCdnUrl: string | undefined;

    if (typeof window !== 'undefined') {
      // 浏览器环境：从 import.meta.env 读取
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        envCdnUrl = import.meta.env.VITE_CDN_STATIC_ASSETS_URL;
      }
    } else {
      // Node.js 环境：从 process.env 读取
      envCdnUrl = (typeof process !== 'undefined' && process.env?.CDN_STATIC_ASSETS_URL) || (typeof process !== 'undefined' && process.env?.VITE_CDN_STATIC_ASSETS_URL);
    }

    if (envCdnUrl) {
      // 返回新对象，覆盖 CDN URL
      return {
        ...config,
        cdn: {
          staticAssetsUrl: envCdnUrl,
        },
      };
    }
  }

  return config;
}

/**
 * 判断是否为主应用（统一规则，基于应用身份配置）
 */
export function isMainApp(
  routePath?: string,
  locationPath?: string,
  isStandalone?: boolean
): boolean {
  // 独立运行时
  if (isStandalone === undefined) {
    // 防御性检查：在 Node.js 环境中，window 未定义
    if (typeof window === 'undefined') {
      // 在 Node.js 环境中（如 Vite 配置文件），默认返回 true（主应用）
      return true;
    }
    const qiankunWindow = (window as any).__POWERED_BY_QIANKUN__;
    isStandalone = !qiankunWindow;
  }

  const env = getEnvironment();
  // 优先使用 locationPath（完整路径），如果没有则使用 routePath，最后使用 window.location.pathname
  const path = locationPath || routePath || (typeof window !== 'undefined' ? window.location.pathname : '');

  // 关键：在开发环境中，即使 isStandalone 为 true，也要检查路径是否匹配子应用
  // 因为开发环境所有应用都使用同一个端口（8080），需要通过路径前缀判断
  if (isStandalone && env === 'development') {
    // 先检查是否是登录等公开页面
    if (path === '/login' || path === '/forget-password' || path === '/register') {
      return false;
    }

    // 检查路径是否匹配任何子应用的 pathPrefix
    // 关键：排除公开应用（如 home），它们虽然 pathPrefix 是 '/'，但不应该影响主应用路由的判断
    const apps = getAllApps();
    const mainApp = apps.find(app => app.type === 'main');
    const mainAppRoutes = mainApp?.routes?.mainAppRoutes || [];

    for (const app of apps) {
      // 跳过主应用、特殊应用（如 home, docs, layout, mobile）和公开应用
      // 特殊应用在 SPECIAL_APP_CONFIGS 中定义，不应该影响主应用路由的判断
      if (app.type === 'main' || isSpecialAppById(app.id) || (app.type === 'sub' && app.metadata?.public === true)) {
        continue;
      }

      if (app.type === 'sub' && app.enabled) {
        const normalizedPathPrefix = app.pathPrefix.endsWith('/')
          ? app.pathPrefix.slice(0, -1)
          : app.pathPrefix;
        const normalizedPath = path.endsWith('/') && path !== '/'
          ? path.slice(0, -1)
          : path;

        // 精确匹配或路径前缀匹配
        if (normalizedPath === normalizedPathPrefix || normalizedPath.startsWith(normalizedPathPrefix + '/')) {
          // 匹配到子应用，不是主应用
          return false;
        }
      }
    }

    // 关键：如果路径匹配主应用的路由配置，优先判断为主应用
    // 这样可以避免 home 应用的 pathPrefix '/' 影响主应用路由的判断
    if (mainAppRoutes.length > 0) {
      const normalizedPath = path.endsWith('/') && path !== '/'
        ? path.slice(0, -1)
        : path;
      if (mainAppRoutes.some(route => {
        const normalizedRoute = route.endsWith('/') && route !== '/'
          ? route.slice(0, -1)
          : route;
        return normalizedPath === normalizedRoute || normalizedPath.startsWith(normalizedRoute + '/');
      })) {
        return true;
      }
    }

    // 如果没有匹配到子应用，判断为主应用
    return true;
  }

  // 非开发环境的独立运行模式（如预览/生产环境的独立运行）
  if (isStandalone) {
    if (path === '/login' || path === '/forget-password' || path === '/register') {
      return false;
    }
    return true;
  }

  // qiankun 模式下的判断（非独立运行）
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  if (path === '/login' || path === '/forget-password' || path === '/register') {
    return false;
  }

  // POC 环境：通过子域名判断（类似生产环境）
  if (env === 'poc' && hostname) {
    const appConfig = getAppConfigByPocHost(hostname);
    if (appConfig) {
      // 通过 POC 域名找到对应的应用配置，然后通过应用名称找到应用身份
      const appName = appConfig.appName.replace('-app', '');
      const app = getAllApps().find(a => a.id === appName);
      if (app && app.type === 'sub') {
        return false;
      }
    }
    // POC 环境主域名（poc.bellis.com.cn）或其他未匹配的域名，判断为主应用
    return true;
  }

  // SIT 环境：通过子域名判断（类似生产环境）
  if (env === 'sit' && hostname) {
    const appConfig = getAppConfigBySitHost(hostname);
    if (appConfig) {
      // 通过 SIT 域名找到对应的应用配置，然后通过应用名称找到应用身份
      const appName = appConfig.appName.replace('-app', '');
      const app = getAllApps().find(a => a.id === appName);
      if (app && app.type === 'sub') {
        return false;
      }
    }
    // SIT 环境主域名（sit.bellis.com.cn）或其他未匹配的域名，判断为主应用
    return true;
  }

  // UAT 环境：通过子域名判断（类似生产环境）
  if (env === 'uat' && hostname) {
    const appConfig = getAppConfigByUatHost(hostname);
    if (appConfig) {
      // 通过 UAT 域名找到对应的应用配置，然后通过应用名称找到应用身份
      const appName = appConfig.appName.replace('-app', '');
      const app = getAllApps().find(a => a.id === appName);
      if (app && app.type === 'sub') {
        return false;
      }
    }
    // UAT 环境主域名（uat.bellis.com.cn）或其他未匹配的域名，判断为主应用
    return true;
  }

  // 测试环境：通过子域名判断（类似生产环境，作为 UAT 的别名）
  if (env === 'test' && hostname) {
    const appConfig = getAppConfigByTestHost(hostname);
    if (appConfig) {
      // 通过测试域名找到对应的应用配置，然后通过应用名称找到应用身份
      const appName = appConfig.appName.replace('-app', '');
      const app = getAllApps().find(a => a.id === appName);
      if (app && app.type === 'sub') {
        return false;
      }
    }
    // 测试环境主域名（test.bellis.com.cn）或其他未匹配的域名，判断为主应用
    return true;
  }

  // 生产环境：通过子域名判断（基于应用身份配置）
  if (env === 'production') {
    const app = getAllApps().find(a => a.subdomain === hostname);
    if (app && app.type === 'sub') {
      return false;
    }
    return true;
  }

  // 预览环境：通过端口判断（类似生产环境通过子域名判断）
  // 预览环境中，每个应用都有独立的端口（如 admin-app 在 4181），访问该端口时应该识别为对应的子应用
  if (env === 'preview') {
    const port = typeof window !== 'undefined' ? window.location.port || '' : '';
    if (port) {
      const appConfig = getAppConfigByPrePort(port);
      if (appConfig) {
        // 通过端口找到对应的应用配置，然后通过应用名称找到应用身份
        const appName = appConfig.appName.replace('-app', '');
        const app = getAllApps().find(a => a.id === appName);
        if (app && app.type === 'sub') {
          return false;
        }
      }
    }
    // 预览环境主应用端口（4180）或其他未匹配的端口，判断为主应用
    return true;
  }

  // 开发环境：通过路径判断（基于应用身份配置）
  // 关键：在开发环境中，所有应用都使用同一个端口（8080），所以只能通过路径前缀判断
  // 主应用路径：/data/...、/profile 等
  // 子应用路径：/logistics/...、/admin/... 等
  const apps = getAllApps();
  const mainApp = apps.find(app => app.type === 'main');
  const mainAppRoutes = mainApp?.routes?.mainAppRoutes || [];

  // 关键：如果路径匹配主应用的路由配置，优先判断为主应用
  // 这样可以避免 home 应用的 pathPrefix '/' 影响主应用路由的判断
  if (mainAppRoutes.length > 0) {
    const normalizedPath = path.endsWith('/') && path !== '/'
      ? path.slice(0, -1)
      : path;
    if (mainAppRoutes.some(route => {
      const normalizedRoute = route.endsWith('/') && route !== '/'
        ? route.slice(0, -1)
        : route;
      return normalizedPath === normalizedRoute || normalizedPath.startsWith(normalizedRoute + '/');
    })) {
      return true;
    }
  }

  // 先检查是否是子应用路径（子应用的 pathPrefix 优先级更高）
  // 关键：排除公开应用（如 home），它们虽然 pathPrefix 是 '/'，但不应该影响主应用路由的判断
    for (const app of apps) {
      // 跳过主应用、特殊应用（如 home, docs, layout, mobile）和公开应用
      // 特殊应用在 SPECIAL_APP_CONFIGS 中定义，不应该影响主应用路由的判断
      if (app.type === 'main' || isSpecialAppById(app.id) || (app.type === 'sub' && app.metadata?.public === true)) {
        continue;
      }

    if (app.type === 'sub' && app.enabled) {
      // 支持 pathPrefix 带或不带尾部斜杠
      const normalizedPathPrefix = app.pathPrefix.endsWith('/')
        ? app.pathPrefix.slice(0, -1)
        : app.pathPrefix;
      const normalizedPath = path.endsWith('/') && path !== '/'
        ? path.slice(0, -1)
        : path;

      // 精确匹配或路径前缀匹配
      // 例如：/logistics 或 /logistics/warehouse/inventory/info 都匹配物流应用
      const isMatch = normalizedPath === normalizedPathPrefix || normalizedPath.startsWith(normalizedPathPrefix + '/');

      if (isMatch) {
        // 匹配到子应用，不是主应用
        return false;
      }
    }
  }

  // 关键：在 layout-app 环境下，如果路径是根路径 '/'，但实际 locationPath 是子应用路径，
  // 需要再次检查 locationPath（因为 route.path 可能是 '/'，但 window.location.pathname 是子应用路径）
  if (path === '/' && locationPath && locationPath !== '/') {
    // 先检查 locationPath 是否匹配主应用路由
    if (mainAppRoutes.length > 0) {
      const normalizedLocationPath = locationPath.endsWith('/') && locationPath !== '/'
        ? locationPath.slice(0, -1)
        : locationPath;
      if (mainAppRoutes.some(route => {
        const normalizedRoute = route.endsWith('/') && route !== '/'
          ? route.slice(0, -1)
          : route;
        return normalizedLocationPath === normalizedRoute || normalizedLocationPath.startsWith(normalizedRoute + '/');
      })) {
        return true;
      }
    }

    // 使用 locationPath 重新检查
    const normalizedLocationPath = locationPath.endsWith('/') && locationPath !== '/'
      ? locationPath.slice(0, -1)
      : locationPath;

    for (const app of apps) {
      // 跳过主应用、特殊应用（如 home, docs, layout, mobile）和公开应用
      // 特殊应用在 SPECIAL_APP_CONFIGS 中定义，不应该影响主应用路由的判断
      if (app.type === 'main' || isSpecialAppById(app.id) || (app.type === 'sub' && app.metadata?.public === true)) {
        continue;
      }

      if (app.type === 'sub' && app.enabled) {
        const normalizedPathPrefix = app.pathPrefix.endsWith('/')
          ? app.pathPrefix.slice(0, -1)
          : app.pathPrefix;

        const isMatch = normalizedLocationPath === normalizedPathPrefix || normalizedLocationPath.startsWith(normalizedPathPrefix + '/');

        if (isMatch) {
          // 匹配到子应用，不是主应用
          return false;
        }
      }
    }
  }

  // 如果没有匹配到子应用，判断为主应用
  // 主应用的 pathPrefix 是 '/'，所以所有不匹配子应用的路径都是主应用路径
  return true;
}

/**
 * 获取当前激活的子应用
 */
export function getCurrentSubApp(): string | null {
  const env = getEnvironment();
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const port = typeof window !== 'undefined' ? window.location.port || '' : '';

  // POC 环境：通过子域名判断（类似生产环境）
  if (env === 'poc' && hostname) {
    const appConfig = getAppConfigByPocHost(hostname);
    if (appConfig) {
      // 通过 POC 域名找到对应的应用配置，然后通过应用名称找到应用身份
      const appName = appConfig.appName.replace('-app', '');
      const app = getAllApps().find(a => a.id === appName);
      if (app && app.type === 'sub' && app.enabled) {
        return app.id;
      }
    }
    // POC 环境主域名（poc.bellis.com.cn）或其他未匹配的域名，返回 null
    return null;
  }

  // SIT 环境：通过子域名判断（类似生产环境）
  if (env === 'sit' && hostname) {
    const appConfig = getAppConfigBySitHost(hostname);
    if (appConfig) {
      // 通过 SIT 域名找到对应的应用配置，然后通过应用名称找到应用身份
      const appName = appConfig.appName.replace('-app', '');
      const app = getAllApps().find(a => a.id === appName);
      if (app && app.type === 'sub' && app.enabled) {
        return app.id;
      }
    }
    // SIT 环境主域名（sit.bellis.com.cn）或其他未匹配的域名，返回 null
    return null;
  }

  // UAT 环境：通过子域名判断（类似生产环境）
  if (env === 'uat' && hostname) {
    const appConfig = getAppConfigByUatHost(hostname);
    if (appConfig) {
      // 通过 UAT 域名找到对应的应用配置，然后通过应用名称找到应用身份
      const appName = appConfig.appName.replace('-app', '');
      const app = getAllApps().find(a => a.id === appName);
      if (app && app.type === 'sub' && app.enabled) {
        return app.id;
      }
    }
    // UAT 环境主域名（uat.bellis.com.cn）或其他未匹配的域名，返回 null
    return null;
  }

  // 测试环境：通过子域名判断（类似生产环境，作为 UAT 的别名）
  if (env === 'test' && hostname) {
    const appConfig = getAppConfigByTestHost(hostname);
    if (appConfig) {
      // 通过测试域名找到对应的应用配置，然后通过应用名称找到应用身份
      const appName = appConfig.appName.replace('-app', '');
      const app = getAllApps().find(a => a.id === appName);
      if (app && app.type === 'sub' && app.enabled) {
        return app.id;
      }
    }
    // 测试环境主域名（test.bellis.com.cn）或其他未匹配的域名，返回 null
    return null;
  }

  // 生产环境：通过子域名判断（优先级最高）
  if (env === 'production' && hostname) {
    const app = getAllApps().find(a => a.subdomain === hostname);
    if (app && app.type === 'sub' && app.enabled) {
      return app.id;
    }
    // 生产环境如果不是子域名，则不是子应用
    return null;
  }

  // 预览环境：通过端口判断（类似生产环境通过子域名判断）
  // 预览环境中，每个应用都有独立的端口（如 admin-app 在 4181），访问该端口时应该识别为对应的子应用
  if (env === 'preview' && port) {
    const appConfig = getAppConfigByPrePort(port);
    if (appConfig) {
      // 通过端口找到对应的应用配置，然后通过应用名称找到应用身份
      const appName = appConfig.appName.replace('-app', '');
      const app = getAllApps().find(a => a.id === appName);
      if (app && app.type === 'sub' && app.enabled) {
        return app.id;
      }
    }
    // 预览环境主应用端口（4180）或其他未匹配的端口，返回 null
    return null;
  }

  // 开发环境：通过路径判断（与 isMainApp 使用相同的匹配逻辑）
  const apps = getAllApps();
  const mainApp = apps.find(app => app.type === 'main');
  const mainAppRoutes = mainApp?.routes?.mainAppRoutes || [];

  // 关键：如果路径匹配主应用的路由配置，优先判断为主应用，返回 null
  // 这样可以避免 home 应用的 pathPrefix '/' 影响主应用路由的判断
  if (mainAppRoutes.length > 0) {
    const normalizedPath = path.endsWith('/') && path !== '/'
      ? path.slice(0, -1)
      : path;
    if (mainAppRoutes.some(route => {
      const normalizedRoute = route.endsWith('/') && route !== '/'
        ? route.slice(0, -1)
        : route;
      return normalizedPath === normalizedRoute || normalizedPath.startsWith(normalizedRoute + '/');
    })) {
      return null; // 主应用路由，返回 null
    }
  }

  for (const app of apps) {
    // 跳过主应用和公开应用（如 home），它们不应该被识别为子应用
    if (app.type === 'main' || (app.type === 'sub' && app.metadata?.public === true)) {
      continue;
    }

    if (app.type === 'sub' && app.enabled) {
      // 支持 pathPrefix 带或不带尾部斜杠（与 isMainApp 使用相同的匹配逻辑）
      const normalizedPathPrefix = app.pathPrefix.endsWith('/')
        ? app.pathPrefix.slice(0, -1)
        : app.pathPrefix;
      const normalizedPath = path.endsWith('/') && path !== '/'
        ? path.slice(0, -1)
        : path;

      // 精确匹配或路径前缀匹配
      if (normalizedPath === normalizedPathPrefix || normalizedPath.startsWith(normalizedPathPrefix + '/')) {
        return app.id;
      }
    }
  }

  // 如果没有匹配到任何子应用，返回 null
  // 注意：不再先调用 isMainApp() 来判断，因为 isMainApp() 的逻辑可能在不同环境下有差异
  // 直接通过路径匹配来判断更可靠
  return null;
}

/**
 * 获取子应用的入口地址（基于应用身份配置）
 */
export function getSubAppEntry(appId: string): string {
  const app = getAppById(appId);
  if (!app) {
    safeLoggerWarn(`[unified-env-config] 未找到应用: ${appId}`);
    return `/${appId}/`;
  }

  const env = getEnvironment();
  const envConfig = getEnvConfig();
  const appEnvConfig = getAppConfig(`${appId}-app`);

  if (!appEnvConfig) {
    safeLoggerWarn(`[unified-env-config] 未找到应用环境配置: ${appId}-app`);
    return `/${appId}/`;
  }

  switch (env) {
    case 'poc':
      // POC 环境：直接使用 POC 子域名根路径，构建产物直接部署到子域名根目录
      if (appEnvConfig.pocHost) {
        const protocol = typeof window !== 'undefined' && window.location.protocol
          ? window.location.protocol
          : 'https:';
        return `${protocol}//${appEnvConfig.pocHost}/`;
      }
      return `/${appId}/`;

    case 'sit':
      // SIT 环境：直接使用 SIT 子域名根路径，构建产物直接部署到子域名根目录
      if (appEnvConfig.sitHost) {
        const protocol = typeof window !== 'undefined' && window.location.protocol
          ? window.location.protocol
          : 'https:';
        return `${protocol}//${appEnvConfig.sitHost}/`;
      }
      return `/${appId}/`;

    case 'uat':
      // UAT 环境：直接使用 UAT 子域名根路径，构建产物直接部署到子域名根目录
      if (appEnvConfig.uatHost) {
        const protocol = typeof window !== 'undefined' && window.location.protocol
          ? window.location.protocol
          : 'https:';
        return `${protocol}//${appEnvConfig.uatHost}/`;
      }
      return `/${appId}/`;

    case 'test':
      // 测试环境：直接使用测试子域名根路径，构建产物直接部署到子域名根目录（与生产环境一致，作为 UAT 的别名）
      if (appEnvConfig.testHost) {
        const protocol = typeof window !== 'undefined' && window.location.protocol
          ? window.location.protocol
          : 'https:';
        return `${protocol}//${appEnvConfig.testHost}/`;
      }
      return `/${appId}/`;

    case 'production':
      // 生产环境：直接使用子域名根路径，构建产物直接部署到子域名根目录
      if (app.subdomain && appEnvConfig.prodHost) {
        const protocol = typeof window !== 'undefined' && window.location.protocol
          ? window.location.protocol
          : 'https:';
        return `${protocol}//${appEnvConfig.prodHost}/`;
      }
      return `/${appId}/`;

    case 'preview':
      return `http://${appEnvConfig.preHost}:${appEnvConfig.prePort}${envConfig.microApp.entryPrefix}`;

    case 'development':
    default:
      return `${envConfig.microApp.baseURL}:${appEnvConfig.devPort}`;
  }
}

/**
 * 生成 qiankun activeRule（基于应用身份配置）
 */
export function getSubAppActiveRule(appId: string): string | ((location: Location) => boolean) {
  const app = getAppById(appId);
  if (!app) {
    safeLoggerWarn(`[unified-env-config] 未找到应用: ${appId}`);
    return `/${appId}`;
  }

  const env = getEnvironment();
  const appEnvConfig = getAppConfig(`${appId}-app`);

  // POC、SIT、UAT、测试和生产环境：通过子域名判断
  if ((env === 'poc' || env === 'sit' || env === 'uat' || env === 'test' || env === 'production') && appEnvConfig) {
    return (location: Location) => {
      // POC 环境：检查是否为 POC 子域名
      if (env === 'poc' && appEnvConfig.pocHost) {
        if (location.hostname === appEnvConfig.pocHost) {
          return true;
        }
      }
      // SIT 环境：检查是否为 SIT 子域名
      if (env === 'sit' && appEnvConfig.sitHost) {
        if (location.hostname === appEnvConfig.sitHost) {
          return true;
        }
      }
      // UAT 环境：检查是否为 UAT 子域名
      if (env === 'uat' && appEnvConfig.uatHost) {
        if (location.hostname === appEnvConfig.uatHost) {
          return true;
        }
      }
      // 测试环境：检查是否为测试子域名（作为 UAT 的别名）
      if (env === 'test' && appEnvConfig.testHost) {
        if (location.hostname === appEnvConfig.testHost) {
          return true;
        }
      }
      // 生产环境：检查是否为生产子域名
      if (env === 'production' && app.subdomain && location.hostname === app.subdomain) {
        return true;
      }
      // 路径匹配（作为兜底）
      if (location.pathname.startsWith(app.pathPrefix)) {
        return true;
      }
      return false;
    };
  }

  return (location: Location) => {
    return location.pathname.startsWith(app.pathPrefix);
  };
}

// 导出单例（延迟初始化，避免循环依赖问题）
// 注意：不要在模块顶层直接调用 getEnvironment()，因为它依赖 APP_ENV_CONFIGS
// 如果 unified-env-config.ts 在 app-env.config.ts 之前加载，会导致初始化顺序问题
// 使用 getter 函数延迟初始化，只在首次访问时计算
let _currentEnvironment: Environment | null = null;
let _envConfig: EnvironmentConfig | null = null;

export function getCurrentEnvironment(): Environment {
  if (_currentEnvironment === null) {
    _currentEnvironment = getEnvironment();
  }
  return _currentEnvironment;
}

export function getCurrentEnvConfig(): EnvironmentConfig {
  if (_envConfig === null) {
    _envConfig = getEnvConfig();
  }
  return _envConfig;
}

// 为了向后兼容，保留导出
// 注意：不再使用 Proxy，因为 Proxy 在 Vue 响应式系统中会导致无限递归和内存溢出
// 直接使用函数调用获取值，避免 Proxy 导致的无限递归
// 注意：这会在模块首次被导入时计算，但由于 logger 已经改为延迟初始化，
// 且所有配置文件中的 logger 调用都改为了 console，所以不会触发循环依赖
// 建议：优先使用 getCurrentEnvironment() 和 getCurrentEnvConfig() 函数代替这些常量
export const currentEnvironment: Environment = getCurrentEnvironment();
export const envConfig: EnvironmentConfig = getCurrentEnvConfig();

// 注意：移除了 currentSubApp 和 isMainAppNow 的顶层导出
// 因为它们会在模块加载时调用 getCurrentSubApp() 和 isMainApp()
// 这些函数依赖 getAllApps()，可能导致初始化顺序问题
// 请使用 getCurrentSubApp() 和 isMainApp() 函数来获取当前值

// 从 app-env.config 重新导出，以便从 unified-env-config 统一导入
export { getAppConfig, getAppConfigByTestHost, getAppConfigByPocHost, getAppConfigBySitHost, getAppConfigByUatHost, getAppConfigByPrePort, getAppConfigByDevPort, isSpecialAppById, isSpecialApp, isBusinessApp } from './app-env.config';
export type { AppEnvConfig } from './app-env.config';
