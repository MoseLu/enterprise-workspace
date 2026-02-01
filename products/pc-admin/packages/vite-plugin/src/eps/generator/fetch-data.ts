import axios from 'axios';
import * as _ from 'lodash-es';
import { error } from '../utils';

export function getEpsUrl(epsUrl: string): string {
  return epsUrl || '/api/login/eps/contract';
}

export async function fetchEpsData(epsUrl: string, reqUrl: string) {
  let finalUrl: string;

  if (!reqUrl || reqUrl.startsWith('/')) {
    finalUrl = getEpsUrl(epsUrl);
  } else {
    finalUrl = reqUrl + getEpsUrl(epsUrl);
  }

  try {
    const response = await (axios as any).get(finalUrl, {
      timeout: 5000
    });

    const { code, data, message } = response.data;

    if (code === 1000) {
      if (!_.isEmpty(data)) {
        const entities: any[] = [];
        Object.entries(data).forEach(([moduleKey, entitiesList]: [string, any]) => {
          if (Array.isArray(entitiesList)) {
            entitiesList.forEach((entity: any) => {
              entities.push({
                ...entity,
                moduleKey
              });
            });
          }
        });
        return entities;
      }
    } else {
      error(`${message || 'Failed to fetch data'}`);
    }
  } catch (err) {
    error(`API service is not running → ${finalUrl}`);
  }

  return [];
}

/**
 * 获取字典数据
 * @param dictApi 字典接口 URL，默认：/api/system/auth/dict
 * @param reqUrl 请求基础 URL
 * @returns 格式化的字典数据映射：{resource: {fieldName: [{label, value}]}}
 */
export async function fetchDictData(dictApi: string = '/api/system/auth/dict', reqUrl: string = ''): Promise<Record<string, Record<string, Array<{label: string, value: any}>>>> {
  let finalUrl: string;

  if (!reqUrl || reqUrl.startsWith('/')) {
    finalUrl = dictApi;
  } else {
    finalUrl = reqUrl + dictApi;
  }

  try {
    const response = await (axios as any).get(finalUrl, {
      timeout: 5000
    });

    const { code, data } = response.data;

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

      return dictMap;
    }
  } catch (err) {
    // 字典接口失败时，返回空对象，不影响 EPS 数据加载
    error(`字典接口调用失败 → ${finalUrl}: ${err}`);
  }

  return {};
}
