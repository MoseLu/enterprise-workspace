import { logger } from '../../utils/logger/index';
;
/**
 * 字典数据管理模块
 * 提供字典数据的缓存、获取和更新功能
 */

/**
 * 字典更新事件
 */
export interface DictUpdateEvent {
  resource?: string;
  fieldName?: string;
  data?: any;
}

type DictUpdateCallback = (event: DictUpdateEvent) => void;

/**
 * 字典数据缓存
 * 格式：{resource: {fieldName: [{label, value}]}}
 */
let dictCache: Record<string, Record<string, Array<{label: string, value: any}>>> = {};

/**
 * 字典更新事件订阅者列表
 */
const dictUpdateCallbacks: DictUpdateCallback[] = [];

/**
 * 字典接口 URL（默认值）
 */
let defaultDictApi: string = '/api/system/auth/dict';

/**
 * 设置默认字典接口 URL
 */
export function setDefaultDictApi(api: string): void {
  defaultDictApi = api;
}

/**
 * 获取字典接口 URL
 */
export function getDefaultDictApi(): string {
  return defaultDictApi;
}

/**
 * 获取字典数据
 * @param resource 资源名称，例如 'admin_role'
 * @param fieldName 字段名称，例如 'domainId'
 * @returns 字典选项数组，如果不存在则返回空数组
 */
export function getDictData(
  resource: string,
  fieldName: string
): Array<{label: string, value: any}> {
  if (!dictCache[resource]) {
    return [];
  }
  const data = dictCache[resource][fieldName] || [];
  return data;
}

/**
 * 检查字典缓存是否为空
 */
export function isDictCacheEmpty(): boolean {
  return Object.keys(dictCache).length === 0;
}

/**
 * 获取所有字典数据
 * @returns 完整的字典数据映射
 */
export function getAllDictData(): Record<string, Record<string, Array<{label: string, value: any}>>> {
  return { ...dictCache };
}

/**
 * 更新单个字典字段的数据
 * @param resource 资源名称
 * @param fieldName 字段名称
 * @param options 字典选项数组
 */
export function updateDictData(
  resource: string,
  fieldName: string,
  options: Array<{label: string, value: any}>
): void {
  if (!dictCache[resource]) {
    dictCache[resource] = {};
  }
  dictCache[resource][fieldName] = options;
  
  // 触发更新事件
  notifyDictUpdate({
    resource,
    fieldName,
    data: options,
  });
}

/**
 * 批量更新字典数据
 * @param data 字典数据映射，格式：{resource: {fieldName: [{label, value}]}}
 */
export function batchUpdateDictData(
  data: Record<string, Record<string, Array<{label: string, value: any}>>>
): void {
  // 合并到缓存
  Object.entries(data).forEach(([resource, fields]) => {
    if (!dictCache[resource]) {
      dictCache[resource] = {};
    }
    Object.entries(fields).forEach(([fieldName, options]) => {
      dictCache[resource][fieldName] = options;
    });
  });
  
  // 触发更新事件
  notifyDictUpdate({
    data,
  });
}

/**
 * 刷新字典数据
 * @param dictApi 字典接口 URL，如果不提供则使用默认值
 * @param reqUrl 请求基础 URL
 * @returns Promise<void>
 */
export async function refreshDictData(
  dictApi?: string,
  reqUrl: string = ''
): Promise<void> {
  const api = dictApi || defaultDictApi;
  let finalUrl: string;

  if (!reqUrl || reqUrl.startsWith('/')) {
    finalUrl = api;
  } else {
    finalUrl = reqUrl + api;
  }

  try {
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`字典接口请求失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const { code, data } = result;

    if (code === 200 && data && typeof data === 'object') {
      // 构建字典数据映射
      const dictMap: Record<string, Record<string, Array<{label: string, value: any}>>> = {};

      // 遍历 data 对象的所有键
      Object.entries(data).forEach(([key, value]) => {
        // 键的格式为 {resource}-{fieldName}，如 "admin_role-domainId"
        const parts = key.split('-');
        if (parts.length === 2) {
          const [resource, fieldName] = parts;
          
          // 确保 resource 和 fieldName 都存在
          if (resource && fieldName) {
            // 初始化 resource 对象
            if (!dictMap[resource]) {
              dictMap[resource] = {};
            }
            
            // 确保 value 是数组格式
            if (Array.isArray(value)) {
              dictMap[resource][fieldName] = value;
            }
          }
        }
      });

      // 批量更新字典数据
      batchUpdateDictData(dictMap);
    } else {
      throw new Error(`字典接口返回格式错误: ${JSON.stringify(result)}`);
    }
  } catch (err) {
    logger.error('[dict-manager] 刷新字典数据失败:', err);
    throw err;
  }
}

/**
 * 订阅字典更新事件
 * @param callback 回调函数
 */
export function onDictUpdate(callback: DictUpdateCallback): void {
  if (!dictUpdateCallbacks.includes(callback)) {
    dictUpdateCallbacks.push(callback);
  }
}

/**
 * 取消订阅字典更新事件
 * @param callback 回调函数
 */
export function offDictUpdate(callback: DictUpdateCallback): void {
  const index = dictUpdateCallbacks.indexOf(callback);
  if (index > -1) {
    dictUpdateCallbacks.splice(index, 1);
  }
}

/**
 * 通知所有订阅者字典数据已更新
 */
function notifyDictUpdate(event: DictUpdateEvent): void {
  dictUpdateCallbacks.forEach((callback) => {
    try {
      callback(event);
    } catch (err) {
      logger.error('[dict-manager] 字典更新回调执行失败:', err);
    }
  });
}

/**
 * 清空字典数据缓存
 */
export function clearDictCache(): void {
  dictCache = {};
}

/**
 * 初始化 SSE 集成
 * 当收到 dict-update 事件时，自动刷新字典数据
 * 注意：此函数需要在应用启动时调用，并且需要先导入 sse-manager
 */
let sseInitialized = false;

export function initSSEIntegration(): void {
  if (sseInitialized) {
    return;
  }

  // 动态导入 sse-manager 以避免循环依赖
  import('./sse-manager').then(({ on: sseOn }) => {
    // 监听 dict-update 事件
    sseOn('dict-update', async (event: DictUpdateEvent) => {
      try {
        // 如果事件中包含具体的 resource 和 fieldName，只更新对应的字典数据（部分更新）
        if (event.resource && event.fieldName && event.data) {
          updateDictData(event.resource, event.fieldName, event.data);
        } else {
          // 否则刷新所有字典数据（全量更新）
          await refreshDictData();
        }
      } catch (err) {
        logger.error('[dict-manager] SSE 事件处理失败:', err);
      }
    });
  }).catch((err) => {
    logger.error('[dict-manager] 初始化 SSE 集成失败:', err);
  });

  sseInitialized = true;
}

/**
 * 清理 SSE 集成
 */
export function cleanupSSEIntegration(): void {
  if (!sseInitialized) {
    return;
  }

  // 动态导入 sse-manager 以避免循环依赖
  import('./sse-manager').then(({ off: sseOff }) => {
    // 移除事件监听（需要保存回调函数的引用）
    // 注意：由于我们使用了动态导入，无法直接移除之前注册的回调
    // 这里只是标记为未初始化，实际清理需要在应用层面处理
  }).catch((err) => {
    logger.error('[dict-manager] 清理 SSE 集成失败:', err);
  });

  sseInitialized = false;
}
