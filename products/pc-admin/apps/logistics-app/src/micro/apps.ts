import { getAppConfig } from '@btc/shared-core/configs/app-env.config';
;
import { getEnvironment } from '@btc/shared-core/configs/unified-env-config';

/**
 * 微前端应用配置
 */
export interface MicroAppConfig {
  name: string;
  entry: string;
  container: string;
  activeRule: string | ((location: Location) => boolean);
  // 生命周期超时配置（毫秒）
  timeout?: number;
}


/**
 * 获取主机地址
 */
const getHost = (): string => {
  if (typeof window === 'undefined') {
    return 'localhost';
  }
  const hostname = window.location.hostname;
  return hostname === '0.0.0.0' ? 'localhost' : hostname;
};

/**
 * 获取应用入口地址
 */
const getAppEntry = (appName: string): string => {
  const env = getEnvironment();
  // @ts-expect-error: host 未使用
  const _host = getHost();
  const appConfig = getAppConfig(`${appName}-app`);

  if (!appConfig) {
    console.warn(`[apps.ts]`, 'common.system.app_config_not_found', `${appName}-app`);
    return `/${appName}/`;
  }

  const envStr = env as string;

  if (envStr === 'test') {
    // 测试环境：使用测试环境的子域名
    if (appConfig.testHost) {
      const protocol =
        typeof window !== 'undefined' && window.location.protocol
          ? window.location.protocol
          : 'https:';
      return `${protocol}//${appConfig.testHost}/`;
    }
    return `/${appName}/`;
  }

  if (envStr === 'production') {
    // 生产环境：根据子域名判断使用子域名还是相对路径
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const subdomainMap: Record<string, string> = {
        'bellis.com.cn': 'system',
        'logistics.bellis.com.cn': 'logistics',
        'quality.bellis.com.cn': 'quality',
        'production.bellis.com.cn': 'production',
        'engineering.bellis.com.cn': 'engineering',
        'finance.bellis.com.cn': 'finance',
      };
      
      // 如果当前访问的是对应子应用的子域名，使用子域名作为入口
      if (subdomainMap[hostname] === appName) {
        const protocol = window.location.protocol;
        return `${protocol}//${hostname}/`;
      }
    }
    // 否则使用相对路径，由 Nginx 反向代理
    return `/${appName}/`;
  }

  if (envStr === 'preview') {
    // 预览环境：使用统一配置中的预览主机和端口
    return `http://${appConfig.preHost}:${appConfig.prePort}/index.html`;
  }

  // 开发环境或默认情况
  return `//${appConfig.devHost}:${appConfig.devPort}`;
};

/**
 * 子域名到路径的映射
 */
const subdomainToPathMap: Record<string, string> = {
  'admin.bellis.com.cn': '/admin',
  'logistics.bellis.com.cn': '/logistics',
  'quality.bellis.com.cn': '/quality',
  'production.bellis.com.cn': '/production',
  'engineering.bellis.com.cn': '/engineering',
  'finance.bellis.com.cn': '/finance',
};

/**
 * 从子域名获取路径
 */
export const getPathFromSubdomain = (hostname: string): string | null => {
  return subdomainToPathMap[hostname] || null;
};

/**
 * 从子域名获取应用名称
 */
export const getAppFromSubdomain = (hostname: string): string | null => {
  const path = getPathFromSubdomain(hostname);
  if (!path) return null;
  return path.replace(/^\//, '');
};

export const microApps: MicroAppConfig[] = [
  {
    name: 'system',
    entry: getAppEntry('system'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      const path = location.pathname;
      // 排除不需要 Layout 的页面（这些页面没有 #subapp-viewport 容器）
      if (path === '/login' ||
          path === '/forget-password' ||
          path === '/register') {
        return false;
      }
      // 排除个人信息页面（由主应用自己处理）
      if (path === '/profile') {
        return false;
      }
      // 系统域是默认域，匹配所有非其他已知域的路径
      return !path.startsWith('/admin') &&
             !path.startsWith('/logistics') &&
             !path.startsWith('/engineering') &&
             !path.startsWith('/quality') &&
             !path.startsWith('/production') &&
             !path.startsWith('/finance') &&
             !path.startsWith('/docs') &&
             !path.startsWith('/operations') &&
             !path.startsWith('/dashboard') &&
             !path.startsWith('/personnel');
    },
    // 增加生命周期超时时间到 10 秒，避免警告
    timeout: 10000,
  },
  {
    name: 'logistics',
    entry: getAppEntry('logistics'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      if (location.pathname.startsWith('/logistics')) {
        return true;
      }
      const subdomainPath = getPathFromSubdomain(location.hostname);
      return subdomainPath === '/logistics';
    },
    timeout: 10000,
  },
  {
    name: 'engineering',
    entry: getAppEntry('engineering'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      if (location.pathname.startsWith('/engineering')) {
        return true;
      }
      const subdomainPath = getPathFromSubdomain(location.hostname);
      return subdomainPath === '/engineering';
    },
    timeout: 10000,
  },
  {
    name: 'quality',
    entry: getAppEntry('quality'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      if (location.pathname.startsWith('/quality')) {
        return true;
      }
      const subdomainPath = getPathFromSubdomain(location.hostname);
      return subdomainPath === '/quality';
    },
    timeout: 10000,
  },
  {
    name: 'production',
    entry: getAppEntry('production'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      if (location.pathname.startsWith('/production')) {
        return true;
      }
      const subdomainPath = getPathFromSubdomain(location.hostname);
      return subdomainPath === '/production';
    },
    timeout: 10000,
  },
  {
    name: 'finance',
    entry: getAppEntry('finance'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      if (location.pathname.startsWith('/finance')) {
        return true;
      }
      const subdomainPath = getPathFromSubdomain(location.hostname);
      return subdomainPath === '/finance';
    },
    timeout: 10000,
  },
];

