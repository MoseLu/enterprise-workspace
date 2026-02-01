/**
 * EPS 服务模块
 * 提供统一的 EPS 服务加载和共享功能
 * 
 * 此模块用于所有应用共享 EPS 服务代码，避免每个应用都独立打包
 */
;

import { wrapServiceTree } from '../btc/service';

function deepMergeObjects<T extends Record<string, any>>(base: T, patch: T): T {
  if (!base) return patch;
  if (!patch) return base;
  const out: any = Array.isArray(base) ? [...base] : { ...base };
  for (const k of Object.keys(patch)) {
    const bv = (base as any)[k];
    const pv = (patch as any)[k];
    out[k] =
      pv && typeof pv === 'object' && !Array.isArray(pv) && bv && typeof bv === 'object' && !Array.isArray(bv)
        ? deepMergeObjects(bv, pv)
        : (bv ?? pv);
  }
  return out as T;
}

/**
 * EPS 服务数据接口
 */
export interface EpsServiceData {
  service: any;
  list: any[];
  isUpdate?: boolean;
}

/**
 * 获取全局共享的 EPS 服务
 * 优先从 window.__APP_EPS_SERVICE__ 获取（由 system-app、layout-app 或其他应用提供）
 */
export function getGlobalEpsService(): any {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const globalService = (window as any).__APP_EPS_SERVICE__ || (window as any).service || (window as any).__BTC_SERVICE__;
  
  if (globalService && typeof globalService === 'object') {
    // 检查服务是否有有效的内容（不是空对象或 null）
    const keys = Object.keys(globalService);
    if (keys.length > 0) {
      return globalService;
    }
  }
  
  return null;
}

/**
 * 创建 EPS 服务
 * 从 virtual:eps 模块加载 EPS 数据，并包装为服务对象
 * 
 * @param epsModule - 从 virtual:eps 导入的模块
 * @returns EPS 服务对象和列表
 */
export function createEpsService(epsModule: any): { service: any; list: any[] } {
  const rawService = epsModule?.service;
  const rawList = epsModule?.list || [];
  
  const raw = rawService ?? (epsModule as any)?.service ?? epsModule ?? {};
  const service = wrapServiceTree(raw);
  const list = rawList ?? (epsModule as any)?.list ?? [];
  
  return { service, list };
}

/**
 * 包装 profile.info 方法，添加调用拦截和日志
 */
function wrapProfileInfo(originalInfo: any): any {
  if (!originalInfo || typeof originalInfo !== 'function') {
    return originalInfo;
  }
  
  return function(...args: any[]) {
    // 继续执行原始调用
    return originalInfo.apply(this, args);
  };
}

/**
 * 递归包装 service 对象，拦截 profile.info 调用
 */
function wrapServiceWithProfileInterceptor(service: any): any {
  if (!service || typeof service !== 'object') {
    return service;
  }
  
  // 如果存在 admin.base.profile.info，包装它
  if (service.admin?.base?.profile?.info) {
    const wrapped = { ...service };
    wrapped.admin = { ...service.admin };
    wrapped.admin.base = { ...service.admin.base };
    wrapped.admin.base.profile = {
      ...service.admin.base.profile,
      info: wrapProfileInfo(service.admin.base.profile.info)
    };
    return wrapped;
  }
  
  return service;
}

/**
 * 加载 EPS 服务
 * 优先使用全局共享的服务，如果没有则从 virtual:eps 加载本地服务
 * 
 * @param epsModule - 从 virtual:eps 导入的模块（可选）
 * @returns EPS 服务对象和列表
 */
export function loadEpsService(epsModule?: any): { service: any; list: any[] } {
  // 优先使用全局共享的 EPS 服务（由 system-app 或 layout-app 提供）
  let globalService = getGlobalEpsService();
  
  // 关键：在生产环境子域名下，如果本地 epsModule 是空 stub 且全局服务不存在，
  // 需要等待全局服务（最多等待 2 秒，使用同步轮询）
  if (typeof window !== 'undefined' && import.meta.env.PROD && epsModule) {
    const hostname = window.location.hostname;
    const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';
    
    // 检查是否是空 stub
    const isEmptyStub = !epsModule.service || Object.keys(epsModule.service || {}).length === 0;
    
    if (isProductionSubdomain && isEmptyStub && !globalService) {
      // 同步等待全局服务（最多等待 2 秒）
      const maxWait = 2000;
      const interval = 50;
      const startTime = Date.now();
      
      while (Date.now() - startTime < maxWait) {
        globalService = getGlobalEpsService();
        if (globalService) {
          break;
        }
        
        // 同步等待（阻塞，但时间很短）
        const endTime = Date.now() + interval;
        while (Date.now() < endTime) {
          // 空循环等待
        }
      }
    }
  }
  
  // 如果存在全局服务，但同时也有本地 epsModule，则做"补全合并"
  // 目的：layout-app 提供的全局 EPS 可能不包含某些子应用模块（如 finance.base.financeResult），
  // 这会导致子应用页面在 setup 阶段直接 throw 并空白。
  if (globalService && epsModule) {
    const local = createEpsService(epsModule);
    // 如果本地是空 stub，直接使用全局服务
    if (!local.service || Object.keys(local.service).length === 0) {
      return {
        service: globalService,
        list: [], // 全局服务可能没有 list，保持兼容性
      };
    }
    
    const mergedService = deepMergeObjects(globalService, local.service);
    const wrappedService = wrapServiceWithProfileInterceptor(mergedService);
    if (typeof window !== 'undefined') {
      // 回写到全局，供后续模块/组件复用（不覆盖已有节点，仅补全缺失）
      (window as any).__APP_EPS_SERVICE__ = wrappedService;
      (window as any).service = wrappedService;
      (window as any).__BTC_SERVICE__ = wrappedService;
    }
    return { service: wrappedService, list: local.list };
  }

  if (globalService) {
    const wrappedService = wrapServiceWithProfileInterceptor(globalService);
    return {
      service: wrappedService,
      list: [], // 全局服务可能没有 list，保持兼容性
    };
  }
  
  // 如果没有全局服务，使用本地构建的服务
  if (epsModule) {
    const { service, list } = createEpsService(epsModule);
    const wrappedService = wrapServiceWithProfileInterceptor(service);
    
    // 如果子应用独立运行，也将本地服务暴露到全局，供其他组件使用
    if (typeof window !== 'undefined') {
      (window as any).__APP_EPS_SERVICE__ = wrappedService;
    }
    
    return { service: wrappedService, list };
  }
  
  // 如果既没有全局服务，也没有本地模块，返回空服务
  return {
    service: {},
    list: [],
  };
}

/**
 * 导出 EPS 服务到全局
 * 确保其他模块也能访问
 * 
 * @param service - EPS 服务对象
 */
export function exportEpsServiceToGlobal(service: any): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // 如果已经有全局服务，不要覆盖它（避免覆盖 layout-app 提供的全局服务）
  if (!(window as any).__APP_EPS_SERVICE__) {
    const wrappedService = wrapServiceWithProfileInterceptor(service);
    (window as any).__APP_EPS_SERVICE__ = wrappedService;
    (window as any).service = wrappedService; // 也设置到 window.service，保持兼容性
    (window as any).__BTC_SERVICE__ = wrappedService; // 也设置到 __BTC_SERVICE__，保持兼容性
  }
}

/**
 * 从 EPS 数据中提取字典数据并初始化 dict-manager
 * 在应用启动时调用，确保字典数据可用
 * 
 * @param epsList - EPS 实体列表
 */
export function initDictDataFromEps(epsList: any[]): void {
  if (!epsList || !Array.isArray(epsList)) {
    return;
  }

  // 动态导入 dict-manager 以避免循环依赖
  import('../btc/service/dict-manager').then(({ batchUpdateDictData }) => {
    // 构建字典数据映射
    const dictMap: Record<string, Record<string, Array<{label: string, value: any}>>> = {};

    // 遍历所有 EPS 实体
    epsList.forEach((entity) => {
      if (!entity.resource || !entity.columns || !Array.isArray(entity.columns)) {
        return;
      }

      const resource = entity.resource;
      
      // 遍历 columns，提取字典数据
      entity.columns.forEach((column: any) => {
        // 如果字段有 dict 属性且是数组（说明已经加载了字典数据）
        if (column.dict && Array.isArray(column.dict) && column.dict.length > 0) {
          const fieldName = column.propertyName;
          if (fieldName) {
            // 初始化 resource 对象
            if (!dictMap[resource]) {
              dictMap[resource] = {};
            }
            // 将字典数据添加到映射中
            dictMap[resource][fieldName] = column.dict;
          }
        }
      });
    });

    // 批量更新字典数据到 dict-manager
    if (Object.keys(dictMap).length > 0) {
      batchUpdateDictData(dictMap);
    }
  }).catch((err) => {
    // 静默失败，不影响应用运行
    if (import.meta.env.DEV) {
      console.warn('[eps] 初始化字典数据失败:', err);
    }
  });
}
