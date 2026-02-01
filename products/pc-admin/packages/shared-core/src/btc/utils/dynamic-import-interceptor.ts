/**
 * 动态导入拦截器
 * 拦截 import() 调用，识别 /assets/ 和 /assets/layout/ 路径的资源
 * 使用资源加载器加载资源，然后执行模块代码
 */
;

import { loadResource, type ResourceLoaderOptions } from './resource-loader';
import { logger } from '../../utils/logger/index';

/**
 * 模块缓存
 * key: 模块 URL
 * value: 模块导出对象
 */
const moduleCache = new Map<string, any>();

/**
 * 正在加载的模块 Promise
 * key: 模块 URL
 * value: 加载 Promise
 */
const loadingModules = new Map<string, Promise<any>>();

/**
 * 获取当前应用名称
 */
function getCurrentAppName(): string {
  if (typeof window === 'undefined') {
    return 'unknown-app';
  }
  
  // 从全局配置读取
  const config = (window as any).__BTC_CDN_CONFIG__;
  if (config?.appName) {
    return config.appName;
  }
  
  // 从 URL 推断（备用方案）
  const hostname = window.location.hostname;
  if (hostname.includes('admin.')) {
    return 'admin-app';
  } else if (hostname.includes('system.')) {
    return 'system-app';
  } else if (hostname.includes('layout.')) {
    return 'layout-app';
  } else if (hostname.includes('logistics.')) {
    return 'logistics-app';
  } else if (hostname.includes('finance.')) {
    return 'finance-app';
  } else if (hostname.includes('engineering.')) {
    return 'engineering-app';
  } else if (hostname.includes('quality.')) {
    return 'quality-app';
  } else if (hostname.includes('production.')) {
    return 'production-app';
  } else if (hostname.includes('operations.')) {
    return 'operations-app';
  } else if (hostname.includes('dashboard.')) {
    return 'dashboard-app';
  } else if (hostname.includes('personnel.')) {
    return 'personnel-app';
  }
  
  return 'unknown-app';
}

/**
 * 判断是否是静态资源路径
 */
function isStaticAssetPath(specifier: string): boolean {
  return (
    specifier.includes('/assets/') ||
    specifier.includes('/assets/layout/') ||
    specifier.startsWith('./assets/') ||
    specifier.startsWith('assets/')
  );
}

/**
 * 执行模块代码
 */
async function executeModule(code: string, url: string): Promise<any> {
  // 创建模块执行上下文
  const moduleExports: any = {};
  const moduleModule = { exports: moduleExports };
  
  // 创建模块函数
  const moduleFunction = new Function(
    'exports',
    'module',
    'require',
    '__filename',
    '__dirname',
    code,
  );
  
  try {
    // 执行模块代码
    moduleFunction(
      moduleExports,
      moduleModule,
      () => {
        throw new Error('require is not supported in ES modules');
      },
      url,
      new URL(url).pathname,
    );
    
    // 返回模块导出
    return moduleModule.exports.default || moduleModule.exports;
  } catch (error) {
    logger.error(`[dynamic-import-interceptor] 执行模块失败: ${url}`, error);
    throw error;
  }
}

/**
 * 使用资源加载器加载并执行模块
 */
async function loadModuleWithResourceLoader(
  specifier: string,
  options: ResourceLoaderOptions,
): Promise<any> {
  // 检查缓存
  if (moduleCache.has(specifier)) {
    return moduleCache.get(specifier);
  }
  
  // 检查是否正在加载
  if (loadingModules.has(specifier)) {
    return loadingModules.get(specifier);
  }
  
  // 开始加载
  const loadPromise = (async () => {
    try {
      // 规范化 URL（处理相对路径）
      let normalizedUrl = specifier;
      if (!specifier.startsWith('http://') && !specifier.startsWith('https://') && !specifier.startsWith('/')) {
        // 相对路径，转换为绝对路径
        normalizedUrl = new URL(specifier, window.location.origin).pathname;
      } else if (specifier.startsWith('/')) {
        // 绝对路径，保持原样
        normalizedUrl = specifier;
      }
      
      // 使用资源加载器加载资源
      const response = await loadResource(normalizedUrl, options);
      const code = await response.text();
      
      // 执行模块代码
      const moduleExports = await executeModule(code, normalizedUrl);
      
      // 缓存模块
      moduleCache.set(specifier, moduleExports);
      
      return moduleExports;
    } catch (error) {
      logger.error(`[dynamic-import-interceptor] 加载模块失败: ${specifier}`, error);
      throw error;
    } finally {
      // 清除加载中的标记
      loadingModules.delete(specifier);
    }
  })();
  
  // 记录正在加载
  loadingModules.set(specifier, loadPromise);
  
  return loadPromise;
}

/**
 * 初始化动态导入拦截器
 */
export function initDynamicImportInterceptor() {
  if (typeof window === 'undefined') {
    return;
  }
  
  // 注意：import() 是操作符，不能直接覆盖或拦截
  // 由于无法直接拦截 import() 操作符，我们需要在构建时或运行时通过其他方式处理
  // 这里提供一个工具函数 loadModule，供应用代码使用
  
}

/**
 * 加载模块（替代 import()）
 * 应用代码可以使用此函数替代 import() 来加载静态资源模块
 */
export async function loadModule(
  specifier: string,
  options?: Partial<ResourceLoaderOptions>,
): Promise<any> {
  if (!isStaticAssetPath(specifier)) {
    // 非静态资源路径，使用原生 import()
    return import(specifier);
  }
  
  const appName = options?.appName || getCurrentAppName();
  const loaderOptions: ResourceLoaderOptions = {
    appName,
  };
  if (options?.timeout !== undefined) {
    loaderOptions.timeout = options.timeout;
  }
  if (options?.cdnDomain !== undefined) {
    loaderOptions.cdnDomain = options.cdnDomain;
  }
  if (options?.ossDomain !== undefined) {
    loaderOptions.ossDomain = options.ossDomain;
  }
  
  return loadModuleWithResourceLoader(specifier, loaderOptions);
}

/**
 * 清除模块缓存
 */
export function clearModuleCache() {
  moduleCache.clear();
  loadingModules.clear();
}

/**
 * 获取模块缓存信息
 */
export function getModuleCacheInfo() {
  return {
    cachedModules: Array.from(moduleCache.keys()),
    loadingModules: Array.from(loadingModules.keys()),
  };
}

