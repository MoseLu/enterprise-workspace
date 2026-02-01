/**
 * 鏈嶅姟鏋勫缓鍣? * 浠?EPS 鏁版嵁鍔ㄦ€佺敓鎴?service 瀵硅薄
 */

import { BaseService } from './base';

export interface ApiMethod {
  name: string;
  method: string;
  path: string;
  summary?: string;
}

export interface ServiceModule {
  api: ApiMethod[];
}

export type EpsData = Record<string, ServiceModule>;

/**
 * 鍔ㄦ€佹湇鍔＄被鍨? */
export type DynamicService = Record<string, Record<string, (data?: any) => Promise<any>>>;

export class ServiceBuilder {
  /**
   * 浠?EPS 鏁版嵁鏋勫缓鏈嶅姟瀵硅薄
   * @param epsData - virtual:eps 鎻愪緵鐨勬暟鎹?   */
  build(epsData: EpsData): DynamicService {
    const service: DynamicService = {};

    // 閬嶅巻姣忎釜妯″潡
    for (const [moduleName, moduleData] of Object.entries(epsData)) {
      service[moduleName] = {};

      // 閬嶅巻姣忎釜 API
      const apis = moduleData.api || [];
      for (const api of apis) {
        // 涓烘瘡涓?API 鍒涘缓鏂规硶
        service[moduleName][api.name] = (data?: any) => {
          return BaseService.request({
            url: api.path,
            method: api.method,
            // GET 璇锋眰浣跨敤 params锛屽叾浠栦娇鐢?data
            ...(api.method.toLowerCase() === 'get'
              ? { params: data }
              : { data }),
          });
        };
      }
    }

    return service;
  }
}



