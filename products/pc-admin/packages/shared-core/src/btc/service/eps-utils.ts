/**
 * EPS 服务工具函数
 * 提供 EPS 服务的标准化处理，包括参数标准化、响应格式标准化和 CrudService 包装
 */

import { normalizeKeywordIds } from '@btc/shared-core/utils/array';
;
import type { CrudService } from '../crud/types';

type AnyRecord = Record<string, any>;

/**
 * 标准化 keyword 对象
 * 将 keyword 统一为对象格式
 */
export function normalizeKeywordObject(input: any): AnyRecord {
  // 将 keyword 统一为对象
  if (input === null || input === undefined) return {};
  if (typeof input === 'object' && !Array.isArray(input)) return { ...input };
  // 非对象（字符串/数字/数组等）不做推断，按约定收敛为空对象
  return {};
}

/**
 * 标准化分页参数
 * 统一处理 page、size、keyword 等参数
 */
export function normalizePageParams(
  params: AnyRecord | undefined | null,
  serviceNode?: any
): AnyRecord {
  const p: AnyRecord = params && typeof params === 'object' ? { ...params } : {};
  // 统一 page/size 类型为 number
  if (p.page != null) p.page = Number(p.page) || 1;
  else p.page = 1;
  if (p.size != null) p.size = Number(p.size) || 20;
  else p.size = 20;

  // 收敛 keyword
  const keywordObj = normalizeKeywordObject(p.keyword);

  // 如果 serviceNode 有 search 配置，补充缺失的字段
  if (serviceNode && serviceNode.search) {
    const searchConfig = serviceNode.search;

    // 处理 fieldEq：确保所有配置的字段都在 keyword 对象中
    if (Array.isArray(searchConfig.fieldEq) && searchConfig.fieldEq.length > 0) {
      searchConfig.fieldEq.forEach((field: any) => {
        const fieldName =
          typeof field === 'string'
            ? field
            : field?.propertyName || field?.field || field?.name;
        if (fieldName && keywordObj[fieldName] === undefined) {
          // 如果字段不存在，补充为空字符串
          keywordObj[fieldName] = '';
        }
      });
    }

    // 处理 fieldLike：确保所有配置的字段都在 keyword 对象中
    if (Array.isArray(searchConfig.fieldLike) && searchConfig.fieldLike.length > 0) {
      searchConfig.fieldLike.forEach((field: any) => {
        const fieldName =
          typeof field === 'string'
            ? field
            : field?.propertyName || field?.field || field?.name;
        if (fieldName && keywordObj[fieldName] === undefined) {
          // 如果字段不存在，补充为空字符串
          keywordObj[fieldName] = '';
        }
      });
    }
  }

  // 统一处理 keyword 对象中的 ids 字段为数组格式
  // 使用 normalizeKeywordIds 确保空字符串、null、undefined 都转换为空数组
  p.keyword = normalizeKeywordIds(keywordObj);

  return p;
}

/**
 * 包装服务树
 * 自动为所有 page 和 list 方法添加参数标准化处理
 */
export function wrapServiceTree<T extends AnyRecord>(svc: T): T {
  const cache = new WeakMap<object, any>();

  function wrapNode(node: any, _parentNode?: any): any {
    if (node === null || typeof node !== 'object') return node;
    if (cache.has(node)) return cache.get(node);
    const wrapped: AnyRecord = Array.isArray(node) ? [] : {};
    cache.set(node, wrapped);
    for (const key of Object.keys(node)) {
      const val = (node as AnyRecord)[key];
      if (typeof val === 'function' && (key === 'page' || key === 'list')) {
        const original = val;
        // 传递当前节点作为 serviceNode，以便 normalizePageParams 可以访问 search 配置
        (wrapped as AnyRecord)[key] = async (params?: AnyRecord) => {
          const np = normalizePageParams(params, node);
          return await original(np);
        };
      } else if (val && typeof val === 'object') {
        (wrapped as AnyRecord)[key] = wrapNode(val, node);
      } else {
        (wrapped as AnyRecord)[key] = val;
      }
    }
    return wrapped;
  }

  return wrapNode(svc);
}

/**
 * 标准化分页响应格式
 * 将各种不同的响应格式统一为 { list, total, pagination } 格式
 */
export function normalizePageResponse(
  response: any,
  page: number,
  size: number
): {
  list: any[];
  total: number;
  pagination: { page: number; size: number; total: number };
} {
  if (!response) {
    return { list: [], total: 0, pagination: { page, size, total: 0 } };
  }

  if (Array.isArray(response.list) && response.pagination) {
    const { pagination } = response;
    const total = Number(pagination.total ?? response.total ?? 0);
    return {
      list: response.list,
      total,
      pagination: {
        page: Number(pagination.page ?? page),
        size: Number(pagination.size ?? size),
        total,
      },
    };
  }

  if (Array.isArray(response.records)) {
    const total = Number(response.total ?? 0);
    return {
      list: response.records,
      total,
      pagination: {
        page: Number(response.current ?? page),
        size: Number(response.size ?? size),
        total,
      },
    };
  }

  if (Array.isArray(response.list) && typeof response.total !== 'undefined') {
    const total = Number(response.total ?? 0);
    return {
      list: response.list,
      total,
      pagination: { page, size, total },
    };
  }

  if (Array.isArray(response)) {
    return {
      list: response,
      total: response.length,
      pagination: { page, size, total: response.length },
    };
  }

  return { list: [], total: 0, pagination: { page, size, total: 0 } };
}

/**
 * 从 EPS 服务创建 CrudService
 * @param servicePath EPS 服务路径，例如 'logistics.base.position' 或 ['logistics', 'base', 'position']
 * @param serviceRoot EPS 服务根对象
 * @returns CrudService 实例
 */
export function createCrudServiceFromEps(
  servicePath: string | string[],
  serviceRoot: any
): CrudService<any> {
  // 解析服务路径
  const pathArray = Array.isArray(servicePath) ? servicePath : servicePath.split('.');

  // 获取服务节点
  let serviceNode: any = serviceRoot;
  let missingKey: string | null = null;
  for (const key of pathArray) {
    if (!serviceNode || typeof serviceNode !== 'object') {
      missingKey = key;
      break;
    }
    serviceNode = serviceNode[key];
  }

  // 优雅处理：如果服务路径不存在，返回一个空的服务对象
  if (missingKey || !serviceNode || typeof serviceNode !== 'object') {
    const servicePathStr = Array.isArray(servicePath) ? servicePath.join('.') : servicePath;
    if (import.meta.env.DEV) {
      console.warn(
        `[createCrudServiceFromEps] EPS 服务路径 ${servicePathStr} 不存在${missingKey ? `，无法找到 ${missingKey}` : ''}，返回空服务对象`
      );
    }

    // 返回一个空的服务对象，所有方法都返回空结果
    const emptyService: CrudService<any> = {
      async page() {
        return { list: [], total: 0 };
      },
      async add() {
        // 静默处理，不执行任何操作
      },
      async update() {
        // 静默处理，不执行任何操作
      },
      async delete() {
        // 静默处理，不执行任何操作
      },
      async deleteBatch() {
        // 静默处理，不执行任何操作
      },
    };
    return emptyService;
  }

  // 确保方法存在（如果不存在，返回一个空函数）
  const ensureMethod = (method: string) => {
    const fn = serviceNode[method];
    if (typeof fn !== 'function') {
      const servicePathStr = Array.isArray(servicePath) ? servicePath.join('.') : servicePath;
      if (import.meta.env.DEV) {
        console.warn(
          `[createCrudServiceFromEps] EPS 服务 ${servicePathStr}.${method} 未定义，返回空函数`
        );
      }
      // 返回一个空函数，不抛出错误
      return async () => {
        // 静默处理，不执行任何操作
      };
    }
    return fn as (...args: any[]) => Promise<any>;
  };

  interface PageParams {
    page?: number;
    size?: number;
    keyword?: string | Record<string, any>;
    [key: string]: any;
  }

  return {
    async page(params: PageParams = {}) {
      const page = Number(params.page ?? 1);
      const size = Number(params.size ?? 20);
      const payload: Record<string, any> = { page, size };
      if (params.keyword !== undefined) {
        payload.keyword = params.keyword;
      }

      const pageFn = ensureMethod('page');
      const response = await pageFn(payload);
      const normalized = normalizePageResponse(response, page, size);
      return {
        list: normalized.list,
        total: normalized.total,
      };
    },
    async add(data: any) {
      const addFn = ensureMethod('add');
      await addFn(data);
    },
    async update(data: any) {
      const updateFn = ensureMethod('update');
      await updateFn(data);
    },
    async delete(id: string | number) {
      const deleteFn = ensureMethod('delete');
      await deleteFn(id);
    },
    async deleteBatch(ids: (string | number)[]) {
      // 优先使用 deleteBatch 方法（如果存在）
      if (typeof serviceNode.deleteBatch === 'function') {
        await serviceNode.deleteBatch(ids);
      } else {
        // 回退到多次调用 delete 方法
        const deleteFn = ensureMethod('delete');
        await Promise.all(ids.map((id) => deleteFn(id)));
      }
    },
  };
}

