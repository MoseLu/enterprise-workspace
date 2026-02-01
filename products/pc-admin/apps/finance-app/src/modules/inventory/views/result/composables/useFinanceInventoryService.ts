import type { CrudService } from '@btc/shared-core';
import { createCrudServiceFromEps } from '@btc/shared-core';
import { service } from '@/services/eps';

/**
 * 获取EPS服务节点
 */
export function getEpsServiceNode(servicePath: string | string[]) {
  const pathArray = Array.isArray(servicePath) ? servicePath : servicePath.split('.');
  let serviceNode: any = service;
  for (const key of pathArray) {
    if (!serviceNode || typeof serviceNode !== 'object') {
      throw new Error(`EPS服务路径 ${servicePath} 不存在，无法找到 ${key}`);
    }
    serviceNode = serviceNode[key];
  }
  return serviceNode;
}

/**
 * 创建财务盘点结果服务
 */
export function useFinanceInventoryService() {
  const baseFinanceService = createCrudServiceFromEps('finance.base.financeResult', service);

  // 包装服务以正确处理参数传递
  const financeInventoryService: CrudService<any> = {
    ...baseFinanceService,
    async page(params: any) {
      // 参考管理域的模式，确保keyword对象包含所有必需字段
      const finalParams = { ...params };

      // 确保keyword是一个对象，并包含EPS配置中的所有fieldEq字段
      if (!finalParams.keyword || typeof finalParams.keyword !== 'object' || Array.isArray(finalParams.keyword)) {
        finalParams.keyword = {};
      }

      // 根据EPS配置的fieldEq，添加必需的字段
      if (finalParams.keyword.materialCode === undefined) {
        finalParams.keyword.materialCode = '';
      }
      if (finalParams.keyword.position === undefined) {
        finalParams.keyword.position = '';
      }

      return await baseFinanceService.page(finalParams);
    }
  };

  return {
    financeInventoryService,
    getEpsServiceNode,
  };
}

