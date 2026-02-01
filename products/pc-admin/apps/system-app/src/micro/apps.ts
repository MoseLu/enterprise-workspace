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
 * 获取应用入口地址
 */
const getAppEntry = (appName: string): string => {
  const env = getEnvironment();
  // docs-app 的特殊处理：appName 是 'docs'，但配置名称是 'docs-app'
  const configAppName = appName === 'docs' ? 'docs-app' : `${appName}-app`;
  const appConfig = getAppConfig(configAppName);

  if (!appConfig) {
    console.warn(`[apps.ts] 未找到应用配置: ${configAppName}`);
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
    // 生产环境：直接使用子域名根路径，构建产物直接部署到子域名根目录
    if (appConfig.prodHost) {
      const protocol =
        typeof window !== 'undefined' && window.location.protocol
          ? window.location.protocol
          : 'https:';
      return `${protocol}//${appConfig.prodHost}/`;
    }
    // 如果没有配置 prodHost，使用相对路径
    return `/${appName}/`;
  }

  if (envStr === 'preview') {
    // 预览环境：使用统一配置中的预览主机和端口
    // 关键：使用完整的 URL（包含 /index.html），确保 qiankun 能正确加载构建产物
    return `http://${appConfig.preHost}:${appConfig.prePort}/index.html`;
  }

  // 开发环境或默认情况
  return `//${appConfig.devHost}:${appConfig.devPort}`;
};

/**
 * 子域名到应用名称的映射
 */
const hostnameToAppMap: Record<string, string> = {
  'admin.bellis.com.cn': 'admin',
  'logistics.bellis.com.cn': 'logistics',
  'quality.bellis.com.cn': 'quality',
  'production.bellis.com.cn': 'production',
  'engineering.bellis.com.cn': 'engineering',
  'finance.bellis.com.cn': 'finance',
  'dashboard.bellis.com.cn': 'dashboard',
  'personnel.bellis.com.cn': 'personnel',
};

/**
 * 根据 hostname 判断当前应该激活的子应用
 */
const getAppFromHostname = (hostname: string): string | null => {
  return hostnameToAppMap[hostname] || null;
};

export const microApps: MicroAppConfig[] = [
  {
    name: 'admin',
    entry: getAppEntry('admin'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      // 关键：如果当前访问的是子域名，直接激活（子域代理到主应用后，主应用根据 hostname 激活子应用）
      const appFromHostname = getAppFromHostname(location.hostname);
      if (appFromHostname === 'admin') {
        return true;
      }
      // 支持路径匹配：/admin 开头（主域访问时）
      if (location.pathname.startsWith('/admin')) {
        return true;
      }
      return false;
    },
    timeout: import.meta.env.DEV ? 8000 : 15000, // 开发环境 8 秒，生产环境 15 秒（考虑网络延迟和资源加载时间）
  },
  {
    name: 'logistics',
    entry: getAppEntry('logistics'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      // 关键：如果当前访问的是子域名，直接激活
      const appFromHostname = getAppFromHostname(location.hostname);
      if (appFromHostname === 'logistics') {
        return true;
      }
      // 支持路径匹配：/logistics 开头（主域访问时）
      if (location.pathname.startsWith('/logistics')) {
        return true;
      }
      return false;
    },
    timeout: import.meta.env.DEV ? 8000 : 15000, // 开发环境 8 秒，生产环境 15 秒（考虑网络延迟和资源加载时间）
  },
  {
    name: 'engineering',
    entry: getAppEntry('engineering'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      const appFromHostname = getAppFromHostname(location.hostname);
      if (appFromHostname === 'engineering') {
        return true;
      }
      if (location.pathname.startsWith('/engineering')) {
        return true;
      }
      return false;
    },
    timeout: 10000,
  },
  {
    name: 'quality',
    entry: getAppEntry('quality'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      const appFromHostname = getAppFromHostname(location.hostname);
      if (appFromHostname === 'quality') {
        return true;
      }
      if (location.pathname.startsWith('/quality')) {
        return true;
      }
      return false;
    },
    timeout: 10000,
  },
  {
    name: 'production',
    entry: getAppEntry('production'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      const appFromHostname = getAppFromHostname(location.hostname);
      if (appFromHostname === 'production') {
        return true;
      }
      if (location.pathname.startsWith('/production')) {
        return true;
      }
      return false;
    },
    timeout: 10000,
  },
  {
    name: 'finance',
    entry: getAppEntry('finance'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      const appFromHostname = getAppFromHostname(location.hostname);
      if (appFromHostname === 'finance') {
        return true;
      }
      if (location.pathname.startsWith('/finance')) {
        return true;
      }
      return false;
    },
    timeout: 10000,
  },
  {
    name: 'operations',
    entry: getAppEntry('operations'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      // 运维应用通过 /operations 路径访问
      if (location.pathname.startsWith('/operations')) {
        return true;
      }
      return false;
    },
    timeout: 10000,
  },
  {
    name: 'docs',
    entry: getAppEntry('docs'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      // 文档应用通过 /docs 路径访问
      if (location.pathname.startsWith('/docs')) {
        return true;
      }
      return false;
    },
    timeout: 10000,
  },
  {
    name: 'dashboard',
    entry: getAppEntry('dashboard'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      const appFromHostname = getAppFromHostname(location.hostname);
      if (appFromHostname === 'dashboard') {
        return true;
      }
      // 图表应用通过 /dashboard 路径访问
      if (location.pathname.startsWith('/dashboard')) {
        return true;
      }
      return false;
    },
    timeout: 10000,
  },
  {
    name: 'personnel',
    entry: getAppEntry('personnel'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      const appFromHostname = getAppFromHostname(location.hostname);
      if (appFromHostname === 'personnel') {
        return true;
      }
      // 人事应用通过 /personnel 路径访问
      if (location.pathname.startsWith('/personnel')) {
        return true;
      }
      return false;
    },
    timeout: 10000,
  },
];

