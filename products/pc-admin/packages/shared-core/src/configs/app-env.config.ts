// 注意：这里不能直接导入 logger，因为存在循环依赖：
// logger -> env-info -> unified-env-config -> app-env.config -> logger
// 在模块加载的早期阶段，logger 可能还未初始化，所以直接使用 console
// console 是全局对象，在模块加载时就已经存在，不会受到循环依赖的影响
/// <reference types="vite/client" />

/**
 * 统一的应用环境配置
 * 所有应用的环境变量都从这里读取，避免二义性
 */

export interface AppEnvConfig {
  appName: string;
  devHost: string;
  devPort: string;
  preHost: string;
  prePort: string;
  pocHost?: string; // POC 环境使用子域名（如 admin.poc.bellis.com.cn），可选，按需创建
  sitHost?: string; // SIT 环境使用子域名（如 admin.sit.bellis.com.cn）
  testHost?: string; // 测试环境使用子域名（如 admin.test.bellis.com.cn），保留作为 UAT 的别名
  uatHost?: string; // UAT 环境使用子域名（如 admin.uat.bellis.com.cn）
  prodHost: string;
}

/**
 * 主应用环境配置
 */
export const MAIN_APP_CONFIG: AppEnvConfig = {
  appName: 'main-app',
  devHost: '10.80.8.107',
  devPort: '8080',
  preHost: 'localhost',
  prePort: '4180',
  pocHost: 'poc.bellis.com.cn',
  sitHost: 'sit.bellis.com.cn',
  testHost: 'test.bellis.com.cn',
  uatHost: 'uat.bellis.com.cn',
  prodHost: 'bellis.com.cn',
};

/**
 * 业务子应用环境配置（按字母顺序）
 */
const BUSINESS_APP_CONFIGS: AppEnvConfig[] = [
  {
    appName: 'admin-app',
    devHost: '10.80.8.107',
    devPort: '8081',
    preHost: 'localhost',
    prePort: '4181',
    pocHost: 'admin.poc.bellis.com.cn',
    sitHost: 'admin.sit.bellis.com.cn',
    testHost: 'admin.test.bellis.com.cn',
    uatHost: 'admin.uat.bellis.com.cn',
    prodHost: 'admin.bellis.com.cn',
  },
  {
    appName: 'dashboard-app',
    devHost: '10.80.8.107',
    devPort: '8082',
    preHost: 'localhost',
    prePort: '4182',
    pocHost: 'dashboard.poc.bellis.com.cn',
    sitHost: 'dashboard.sit.bellis.com.cn',
    testHost: 'dashboard.test.bellis.com.cn',
    uatHost: 'dashboard.uat.bellis.com.cn',
    prodHost: 'dashboard.bellis.com.cn',
  },
  {
    appName: 'engineering-app',
    devHost: '10.80.8.107',
    devPort: '8083',
    preHost: 'localhost',
    prePort: '4183',
    pocHost: 'engineering.poc.bellis.com.cn',
    sitHost: 'engineering.sit.bellis.com.cn',
    testHost: 'engineering.test.bellis.com.cn',
    uatHost: 'engineering.uat.bellis.com.cn',
    prodHost: 'engineering.bellis.com.cn',
  },
  {
    appName: 'finance-app',
    devHost: '10.80.8.107',
    devPort: '8084',
    preHost: 'localhost',
    prePort: '4184',
    pocHost: 'finance.poc.bellis.com.cn',
    sitHost: 'finance.sit.bellis.com.cn',
    testHost: 'finance.test.bellis.com.cn',
    uatHost: 'finance.uat.bellis.com.cn',
    prodHost: 'finance.bellis.com.cn',
  },
  {
    appName: 'logistics-app',
    devHost: '10.80.8.107',
    devPort: '8086',
    preHost: 'localhost',
    prePort: '4186',
    pocHost: 'logistics.poc.bellis.com.cn',
    sitHost: 'logistics.sit.bellis.com.cn',
    testHost: 'logistics.test.bellis.com.cn',
    uatHost: 'logistics.uat.bellis.com.cn',
    prodHost: 'logistics.bellis.com.cn',
  },
  {
    appName: 'operations-app',
    devHost: '10.80.8.107',
    devPort: '8088',
    preHost: 'localhost',
    prePort: '4188',
    pocHost: 'operations.poc.bellis.com.cn',
    sitHost: 'operations.sit.bellis.com.cn',
    testHost: 'operations.test.bellis.com.cn',
    uatHost: 'operations.uat.bellis.com.cn',
    prodHost: 'operations.bellis.com.cn',
  },
  {
    appName: 'personnel-app',
    devHost: '10.80.8.107',
    devPort: '8089',
    preHost: 'localhost',
    prePort: '4189',
    pocHost: 'personnel.poc.bellis.com.cn',
    sitHost: 'personnel.sit.bellis.com.cn',
    testHost: 'personnel.test.bellis.com.cn',
    uatHost: 'personnel.uat.bellis.com.cn',
    prodHost: 'personnel.bellis.com.cn',
  },
  {
    appName: 'production-app',
    devHost: '10.80.8.107',
    devPort: '8096',
    preHost: 'localhost',
    prePort: '4190',
    pocHost: 'production.poc.bellis.com.cn',
    sitHost: 'production.sit.bellis.com.cn',
    testHost: 'production.test.bellis.com.cn',
    uatHost: 'production.uat.bellis.com.cn',
    prodHost: 'production.bellis.com.cn',
  },
  {
    appName: 'quality-app',
    devHost: '10.80.8.107',
    devPort: '8091',
    preHost: 'localhost',
    prePort: '4191',
    pocHost: 'quality.poc.bellis.com.cn',
    sitHost: 'quality.sit.bellis.com.cn',
    testHost: 'quality.test.bellis.com.cn',
    uatHost: 'quality.uat.bellis.com.cn',
    prodHost: 'quality.bellis.com.cn',
  },
  {
    appName: 'system-app',
    devHost: '10.80.8.107',
    devPort: '8092',
    preHost: 'localhost',
    prePort: '4192',
    pocHost: 'system.poc.bellis.com.cn',
    sitHost: 'system.sit.bellis.com.cn',
    testHost: 'system.test.bellis.com.cn',
    uatHost: 'system.uat.bellis.com.cn',
    prodHost: 'system.bellis.com.cn',
  },
];

/**
 * 特殊应用环境配置（按字母顺序）
 */
const SPECIAL_APP_CONFIGS: AppEnvConfig[] = [
  {
    appName: 'docs-app',
    devHost: '10.80.8.107',
    devPort: '8093',
    preHost: 'localhost',
    prePort: '4193',
    pocHost: 'docs.poc.bellis.com.cn',
    sitHost: 'docs.sit.bellis.com.cn',
    testHost: 'docs.test.bellis.com.cn',
    uatHost: 'docs.uat.bellis.com.cn',
    prodHost: 'docs.bellis.com.cn',
  },
  {
    appName: 'home-app',
    devHost: '10.80.8.107',
    devPort: '8085',
    preHost: 'localhost',
    prePort: '4185',
    pocHost: 'www.poc.bellis.com.cn',
    sitHost: 'www.sit.bellis.com.cn',
    testHost: 'www.test.bellis.com.cn',
    uatHost: 'www.uat.bellis.com.cn',
    prodHost: 'www.bellis.com.cn',
  },
  {
    appName: 'layout-app',
    devHost: '10.80.8.107',
    devPort: '8094',
    preHost: 'localhost',
    prePort: '4194',
    pocHost: 'layout.poc.bellis.com.cn',
    sitHost: 'layout.sit.bellis.com.cn',
    testHost: 'layout.test.bellis.com.cn',
    uatHost: 'layout.uat.bellis.com.cn',
    prodHost: 'layout.bellis.com.cn',
  },
];

/**
 * 所有应用的环境配置
 * 合并主应用、业务应用和特殊应用
 */
export const APP_ENV_CONFIGS: AppEnvConfig[] = [
  MAIN_APP_CONFIG,
  ...BUSINESS_APP_CONFIGS,
  ...SPECIAL_APP_CONFIGS,
];

/**
 * 根据应用名称获取配置
 */
export function getAppConfig(appName: string): AppEnvConfig | undefined {
  return APP_ENV_CONFIGS.find((config) => config.appName === appName);
}

/**
 * 获取所有开发端口列表
 */
export function getAllDevPorts(): string[] {
  // 防御性检查：使用 try-catch 捕获可能的 TDZ (Temporal Dead Zone) 错误
  // 如果 APP_ENV_CONFIGS 还没有初始化（由于循环依赖或模块加载顺序），返回空数组
  try {
    return APP_ENV_CONFIGS.map((config) => config.devPort);
  } catch (error) {
    if (error instanceof ReferenceError && error.message.includes('before initialization')) {
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
        // 直接使用 console.warn，避免循环依赖
        console.warn('[app-env.config] APP_ENV_CONFIGS 未初始化（可能是循环依赖），返回空数组');
      }
      return [];
    }
    // 其他错误重新抛出
    throw error;
  }
}

/**
 * 获取所有预览端口列表
 */
export function getAllPrePorts(): string[] {
  // 防御性检查：使用 try-catch 捕获可能的 TDZ (Temporal Dead Zone) 错误
  // 如果 APP_ENV_CONFIGS 还没有初始化（由于循环依赖或模块加载顺序），返回空数组
  try {
    return APP_ENV_CONFIGS.map((config) => config.prePort);
  } catch (error) {
    if (error instanceof ReferenceError && error.message.includes('before initialization')) {
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
        // 直接使用 console.warn，避免循环依赖
        console.warn('[app-env.config] APP_ENV_CONFIGS 未初始化（可能是循环依赖），返回空数组');
      }
      return [];
    }
    // 其他错误重新抛出
    throw error;
  }
}

/**
 * 根据端口获取应用配置
 */
export function getAppConfigByDevPort(port: string): AppEnvConfig | undefined {
  return APP_ENV_CONFIGS.find((config) => config.devPort === port);
}

export function getAppConfigByPrePort(port: string): AppEnvConfig | undefined {
  return APP_ENV_CONFIGS.find((config) => config.prePort === port);
}

/**
 * 根据测试环境子域名获取应用配置
 */
export function getAppConfigByTestHost(testHost: string): AppEnvConfig | undefined {
  return APP_ENV_CONFIGS.find((config) => config.testHost === testHost);
}

/**
 * 根据 POC 环境子域名获取应用配置
 */
export function getAppConfigByPocHost(pocHost: string): AppEnvConfig | undefined {
  return APP_ENV_CONFIGS.find((config) => config.pocHost === pocHost);
}

/**
 * 根据 SIT 环境子域名获取应用配置
 */
export function getAppConfigBySitHost(sitHost: string): AppEnvConfig | undefined {
  return APP_ENV_CONFIGS.find((config) => config.sitHost === sitHost);
}

/**
 * 根据 UAT 环境子域名获取应用配置
 */
export function getAppConfigByUatHost(uatHost: string): AppEnvConfig | undefined {
  return APP_ENV_CONFIGS.find((config) => config.uatHost === uatHost);
}

/**
 * 判断应用是否为特殊应用（在 SPECIAL_APP_CONFIGS 中）
 * 特殊应用包括：docs-app, home-app, layout-app
 */
export function isSpecialApp(appName: string): boolean {
  return SPECIAL_APP_CONFIGS.some((config) => config.appName === appName);
}

/**
 * 判断应用是否为业务应用（在 BUSINESS_APP_CONFIGS 中）
 */
export function isBusinessApp(appName: string): boolean {
  return BUSINESS_APP_CONFIGS.some((config) => config.appName === appName);
}

/**
 * 根据应用 ID 判断是否为特殊应用
 * 应用 ID 是 appName 去掉 '-app' 后缀后的值
 */
export function isSpecialAppById(appId: string): boolean {
  const appName = `${appId}-app`;
  return isSpecialApp(appName);
}

/**
 * 重定向 Cookie 名称
 */
export const REDIRECT_COOKIE_NAME = 'redirect_callback_cache';

/**
 * 获取所有允许的主机名列表（用于白名单验证）
 * 包括所有应用的 devHost、preHost、testHost、prodHost 等
 * 
 * @returns 允许的主机名集合
 */
export function getAllowedHosts(): Set<string> {
  const allowedHosts = new Set<string>([
    'bellis.com.cn',
    'localhost',
    '127.0.0.1',
  ]);
  
  // 添加所有应用的所有主机配置
  APP_ENV_CONFIGS.forEach(config => {
    if (config.devHost) allowedHosts.add(config.devHost);
    if (config.preHost) allowedHosts.add(config.preHost);
    if (config.testHost) allowedHosts.add(config.testHost);
    if (config.prodHost) allowedHosts.add(config.prodHost);
    if (config.pocHost) allowedHosts.add(config.pocHost);
    if (config.sitHost) allowedHosts.add(config.sitHost);
    if (config.uatHost) allowedHosts.add(config.uatHost);
  });
  
  return allowedHosts;
}

/**
 * 获取主应用根地址
 * 根据当前环境返回主应用的统一访问入口（qiankun 代理地址）
 * 
 * @returns 主应用根地址，例如 'http://{MAIN_APP_CONFIG.devHost}:8080' 或 'https://bellis.com.cn'
 */
export function getMainAppOrigin(): string {
  // 动态导入以避免循环依赖
  // unified-env-config 导入了 app-env.config，所以这里使用动态导入
  try {
    // 在浏览器环境中，可以通过 window.location 判断环境
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const port = window.location.port || '';
      
      // 生产环境：通过域名判断
      if (hostname === MAIN_APP_CONFIG.prodHost || hostname.endsWith('.bellis.com.cn')) {
        return `https://${MAIN_APP_CONFIG.prodHost}`;
      }
      
      // 测试/UAT 环境：通过子域名判断
      if (hostname === MAIN_APP_CONFIG.testHost || hostname === MAIN_APP_CONFIG.uatHost) {
        return `https://${hostname}`;
      }
      
      // 预览环境：通过端口判断
      if (port === MAIN_APP_CONFIG.prePort) {
        return `http://${MAIN_APP_CONFIG.preHost}:${MAIN_APP_CONFIG.prePort}`;
      }
      
      // 开发环境：默认
      return `http://${MAIN_APP_CONFIG.devHost}:${MAIN_APP_CONFIG.devPort}`;
    }
    
    // 服务端环境：尝试动态导入 getEnvironment
    // 注意：这可能会在模块加载时造成问题，所以优先使用 window.location 判断
    return `http://${MAIN_APP_CONFIG.devHost}:${MAIN_APP_CONFIG.devPort}`;
  } catch (error) {
    // 如果出错，返回开发环境默认值
    return `http://${MAIN_APP_CONFIG.devHost}:${MAIN_APP_CONFIG.devPort}`;
  }
}

/**
 * 获取子应用路由前缀到应用名称的映射表
 * 用于判断路由所属的微应用
 * 
 * @returns 路由前缀到应用名称的映射表，例如 { "/admin": "admin", "/logistics": "logistics", ... }
 */
export function getSubAppRouteMap(): Record<string, string> {
  const map: Record<string, string> = {};
  
  // 遍历所有业务应用配置
  BUSINESS_APP_CONFIGS.forEach(config => {
    // 应用名称格式：'admin-app' -> 'admin'
    const appName = config.appName.replace('-app', '');
    // 路由前缀格式：'/admin'
    map[`/${appName}`] = appName;
  });
  
  return map;
}
