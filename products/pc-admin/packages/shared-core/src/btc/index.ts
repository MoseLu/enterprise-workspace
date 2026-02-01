;
import type { App } from 'vue';
import { ServiceBuilder, type DynamicService, type EpsData } from './service/builder';
import { logger } from '../utils/logger/index';

export interface BtcOptions {
  // 后续添加配置
  apiBaseUrl?: string;
  timeout?: number;
}

// 单例服务实例
let serviceInstance: DynamicService | null = null;

/**
 * 核心功能钩子
 * 提供服务对象、CRUD、插件等
 */
export function useCore() {
  // 懒加载服务实例
  if (!serviceInstance) {
    try {
      // 动态导入 virtual:eps
      const epsData = (globalThis as any).__EPS_DATA__ as EpsData;

      if (epsData && Object.keys(epsData).length > 0) {
        const builder = new ServiceBuilder();
        serviceInstance = builder.build(epsData);
      } else {
        console.warn('[useCore] EPS data not available. Service will be empty.');
        serviceInstance = {};
      }
    } catch (error) {
      logger.error('[useCore] Failed to build service:', error);
      serviceInstance = {};
    }
  }

  return {
    service: serviceInstance,
    // 后续添加 crud, plugin
  };
}

/**
 * 初始化 EPS 数据（由应用调用）
 */
export function initEpsData(epsData: EpsData) {
  (globalThis as any).__EPS_DATA__ = epsData;
  // 清除缓存，下次 useCore 时重新构建
  serviceInstance = null;
}

export function installBtc(app: App, options?: BtcOptions) {
  // 后续实现插件安装逻辑
  console.info('BTC Framework installed', options);

  // 全局属性
  app.config.globalProperties.$btc = {
    options,
  };
}
