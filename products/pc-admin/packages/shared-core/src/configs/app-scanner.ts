/**
 * 应用动态扫描器
 * 参考 cool-admin 的实现，自动扫描 apps 目录下的所有应用
 */

// 注意：这里不能直接导入 logger，因为存在循环依赖：
// logger -> env-info -> unified-env-config -> app-scanner -> logger
// 在模块加载的早期阶段，logger 可能还未初始化，所以直接使用 console
// console 是全局对象，在模块加载时就已经存在，不会受到循环依赖的影响

import type { AppIdentity } from './app-identity.types';
// 导入 Zod 验证工具（可选）
import { AppIdentitySchema, validateConfig } from './schemas';

/**
 * 从构建时生成的应用配置文件导入所有应用配置
 * 这些配置在构建时已经被内联为 JSON，不需要运行时动态导入
 */
import { appConfigsMap } from './app-configs-collected';
import { logger } from '../utils/logger/index';

/**
 * 应用注册表
 * 使用立即执行的初始化，确保在使用前已经初始化
 * 关键：使用函数确保 Map 实例总是存在，避免模块加载顺序问题
 */
function getAppRegistry(): Map<string, AppIdentity> {
  // 使用全局变量存储，确保在整个应用生命周期中都是同一个实例
  // 关键：确保 globalThis 存在，并且总是返回一个有效的 Map 实例
  try {
    if (typeof globalThis === 'undefined') {
      // 如果 globalThis 不存在（极少数情况），使用 window 或空对象
      const globalObj = typeof window !== 'undefined' ? window : {};
      if (typeof (globalObj as any).__BTC_APP_REGISTRY__ === 'undefined' || !((globalObj as any).__BTC_APP_REGISTRY__ instanceof Map)) {
        (globalObj as any).__BTC_APP_REGISTRY__ = new Map<string, AppIdentity>();
      }
      return (globalObj as any).__BTC_APP_REGISTRY__;
    } else {
      if (typeof (globalThis as any).__BTC_APP_REGISTRY__ === 'undefined' || !((globalThis as any).__BTC_APP_REGISTRY__ instanceof Map)) {
        (globalThis as any).__BTC_APP_REGISTRY__ = new Map<string, AppIdentity>();
      }
      return (globalThis as any).__BTC_APP_REGISTRY__;
    }
  } catch (error) {
    // 如果所有尝试都失败，创建一个新的 Map 实例（虽然不应该发生）
    // 直接使用 console.warn，避免循环依赖
    console.warn('[app-scanner] getAppRegistry() 初始化失败，创建新实例', error);
    return new Map<string, AppIdentity>();
  }
}

const appRegistry = getAppRegistry();

/**
 * 初始化标志，确保只初始化一次
 */
let isInitialized = false;

/**
 * 从文件路径提取应用名称
 */
function extractAppName(filePath: string): string {
  // 从路径 apps/admin-app/src/app.ts 提取 admin
  // 从路径 apps/docs-app/src/app.ts 提取 docs
  // 匹配 apps/ 和 -app/ 之间的所有内容（包括连字符）
  const match = filePath.match(/apps\/(.+?)-app\//);
  return match && match[1] ? match[1] : '';
}

/**
 * 验证应用身份配置
 * 使用 Zod schema 进行验证
 */
function validateAppIdentity(identity: any, appName: string): identity is AppIdentity {
  try {
    // 使用 Zod schema 验证
    validateConfig(AppIdentitySchema, identity, `应用 ${appName} 的身份配置`);
    return true;
  } catch (error) {
    // 验证失败，记录警告但返回 false（向后兼容）
    if (import.meta.env.DEV) {
      // 直接使用 console.warn，避免循环依赖
      console.warn(`[app-scanner] 应用 ${appName} 的配置验证失败:`, error);
    }
    return false;
  }
}

/**
 * 扫描并注册所有应用
 * 使用构建时生成的应用配置文件，避免运行时动态导入失败
 */
export function scanAndRegisterApps(): Map<string, AppIdentity> {
  // 关键：每次都重新获取 appRegistry，确保使用的是最新的实例
  const registry = getAppRegistry();

  // 安全调用 clear，确保 registry 已初始化且是有效的 Map 实例
  if (registry && registry instanceof Map && typeof registry.clear === 'function') {
    try {
      registry.clear();
    } catch (error) {
      // 如果 clear 失败，重新初始化 registry
      // 直接使用 console.warn，避免循环依赖
      console.warn('[app-scanner] registry.clear() 失败，重新初始化', error);
      try {
        if (typeof globalThis !== 'undefined') {
          (globalThis as any).__BTC_APP_REGISTRY__ = new Map<string, AppIdentity>();
        } else {
          const globalObj = typeof window !== 'undefined' ? window : {};
          (globalObj as any).__BTC_APP_REGISTRY__ = new Map<string, AppIdentity>();
        }
      } catch (e) {
        // 如果重新初始化也失败，继续使用当前 registry（虽然可能有问题）
        // 直接使用 console.error，避免循环依赖
        logger.error('[app-scanner] 无法重新初始化 registry', e);
      }
    }
  } else {
    // 如果 registry 不存在或不是有效的 Map，重新初始化
    try {
      if (typeof globalThis !== 'undefined') {
        (globalThis as any).__BTC_APP_REGISTRY__ = new Map<string, AppIdentity>();
      } else {
        const globalObj = typeof window !== 'undefined' ? window : {};
        (globalObj as any).__BTC_APP_REGISTRY__ = new Map<string, AppIdentity>();
      }
    } catch (e) {
      // 直接使用 console.error，避免循环依赖
      logger.error('[app-scanner] 无法初始化 registry', e);
    }
  }

  // 重新获取 registry（可能已经被重新创建）
  const finalRegistry = getAppRegistry();

  // 确保 appConfigsMap 存在且是对象（检查 null 和数组）
  // 注意：typeof null === 'object'，所以需要额外检查
  if (!appConfigsMap || typeof appConfigsMap !== 'object' || appConfigsMap === null || Array.isArray(appConfigsMap)) {
    // 只在开发环境或真正有问题时才警告
    if (import.meta.env.DEV) {
      // 直接使用 console.warn，避免循环依赖
      console.warn('[app-scanner] appConfigsMap 不存在或不是对象，跳过扫描', { appConfigsMap });
    }
    return finalRegistry;
  }

  // 防御性检查：确保 appConfigsMap 不是 null 或 undefined
  const appConfigsEntries = Object.entries(appConfigsMap || {});
  for (const [filePath, appConfig] of appConfigsEntries) {
    try {
      const appName = extractAppName(filePath);

      if (!appName) {
        continue;
      }

      if (!validateAppIdentity(appConfig, appName)) {
        continue;
      }

      // 确保 id 与 appName 一致（如果配置中的 id 不同，使用 appName）
      const identity: AppIdentity = {
        ...appConfig,
        id: appConfig.id || appName,
      };

      finalRegistry.set(identity.id, identity);
    } catch (error) {
      // 直接使用 console.error，避免循环依赖
      logger.error(`[app-scanner] ❌ 扫描应用配置失败: ${filePath}`, error);
    }
  }

  return finalRegistry;
}

/**
 * 获取所有已注册的应用
 * 使用初始化标志确保线程安全
 */
export function getAllApps(): AppIdentity[] {
  const registry = getAppRegistry();
  if (!isInitialized || registry.size === 0) {
    scanAndRegisterApps();
    isInitialized = true;
  }
  return Array.from(registry.values());
}

/**
 * 根据 ID 获取应用
 * 使用初始化标志确保线程安全
 */
export function getAppById(id: string): AppIdentity | undefined {
  const registry = getAppRegistry();
  if (!isInitialized || registry.size === 0) {
    scanAndRegisterApps();
    isInitialized = true;
  }
  return registry.get(id);
}

/**
 * 获取所有子应用（排除主应用和布局应用）
 */
export function getSubApps(): AppIdentity[] {
  return getAllApps().filter(app => app.type === 'sub' && app.enabled);
}

/**
 * 获取主应用
 */
export function getMainApp(): AppIdentity | undefined {
  return getAllApps().find(app => app.type === 'main');
}

/**
 * 根据路径前缀查找应用
 */
export function getAppByPathPrefix(pathPrefix: string): AppIdentity | undefined {
  return getAllApps().find(app => app.pathPrefix === pathPrefix);
}

/**
 * 根据子域名查找应用
 */
export function getAppBySubdomain(subdomain: string): AppIdentity | undefined {
  return getAllApps().find(app => app.subdomain === subdomain);
}
