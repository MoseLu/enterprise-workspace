;
import { readFile, writeFile } from '../utils';
import type { EpsState } from './state';
import type { EpsColumn, EpsEntity } from '../types';
import { fetchDictData } from './fetch-data';

export function getEpsPath(outputDir: string, filename?: string): string {
  return `${outputDir}/${filename || ''}`;
}

/**
 * 从 columns 和 pageColumns 中查找匹配的字段
 * @param sources 字段名数组（可能是字符串数组或对象数组）
 * @param item eps 实体
 * @returns {EpsColumn[]} 字段数组
 */
function findColumns(sources: string[] | Array<{ field: string; value?: any }> | undefined, item: EpsEntity): EpsColumn[] {
  if (!sources || sources.length === 0) {
    return [];
  }

  // 合并 columns 和 pageColumns
  const allColumns = [...(item.columns || []), ...(item.pageColumns || [])];

  // 提取字段名数组（处理字符串数组和对象数组两种情况）
  const fieldNames = sources.map((source) => {
    if (typeof source === 'string') {
      return source;
    }
    // 对象数组，提取 field 属性
    if (source && typeof source === 'object' && 'field' in source) {
      return source.field;
    }
    return null;
  }).filter((name): name is string => name !== null && name !== ''); // 过滤掉空字符串

  // 根据 propertyName 或 source 字段匹配（不区分大小写）
  // 优先通过 propertyName 匹配，其次通过 source 匹配
  return fieldNames
    .map((fieldName) => {
      const lowerFieldName = fieldName.toLowerCase();
      // 优先通过 propertyName 匹配
      let matched = allColumns.find((col) => {
        const colPropertyName = (col.propertyName || '').toLowerCase();
        return colPropertyName === lowerFieldName;
      });
      // 如果 propertyName 没有匹配到，且 source 不为空，尝试通过 source 匹配
      if (!matched) {
        matched = allColumns.find((col) => {
          const colSource = (col.source || '').toLowerCase();
          return colSource && colSource === lowerFieldName;
        });
      }
      return matched;
    })
    .filter((col): col is EpsColumn => col !== undefined);
}

export async function getData(
  epsUrl: string,
  _reqUrl: string,
  outputDir: string,
  state: EpsState,
  cachedData?: any,
  sharedEpsDir?: string,
  dictApi?: string
) {
  // 如果提供了缓存数据且数据不为空，使用缓存数据
  if (cachedData && cachedData.list && Array.isArray(cachedData.list) && cachedData.list.length > 0) {
    state.epsList = cachedData.list;
  } else {
    // 优先从共享目录读取 EPS 数据（如果指定）
    let epsJsonPath = getEpsPath(outputDir, 'eps.json');
    if (sharedEpsDir) {
      const sharedEpsJsonPath = getEpsPath(sharedEpsDir, 'eps.json');
      const sharedData = await readFile(sharedEpsJsonPath, true);
      if (sharedData) {
        // 如果共享数据存在，使用共享数据
        epsJsonPath = sharedEpsJsonPath;
      }
    }
    
    // 尝试从本地文件读取
    const localData = await readFile(epsJsonPath, true);

    if (localData) {
      if (Array.isArray(localData)) {
        state.epsList = localData;
      } else if (localData.data) {
        const entities: any[] = [];
        Object.entries(localData.data).forEach(([moduleKey, entitiesList]: [string, any]) => {
          if (Array.isArray(entitiesList)) {
            entitiesList.forEach((entity: any) => {
              entities.push({
                ...entity,
                moduleKey
              });
            });
          }
        });
        state.epsList = entities;
      } else {
        console.warn('[eps] 本地文件格式不正确，数据为空');
        state.epsList = [];
      }
    } else {
      console.warn(`[eps] 本地文件不存在或为空: ${epsJsonPath}`);
      state.epsList = [];
    }

    if (!epsUrl) {
      return;
    }
  }

  state.epsList.forEach((e) => {
    if (!e.namespace) {
      e.namespace = e.prefix || '';
    }
    if (!e.api) e.api = [];
    if (!e.columns) e.columns = [];
    if (!e.pageColumns) e.pageColumns = [];
    
    // 检查 search 是否为空（所有数组都为空或不存在）
    const isSearchEmpty = !e.search || 
      (!e.search.fieldEq || e.search.fieldEq.length === 0) &&
      (!e.search.fieldLike || e.search.fieldLike.length === 0) &&
      (!e.search.keyWordLikeFields || e.search.keyWordLikeFields.length === 0);
    
    // 如果 search 为空且存在 pageQueryOp，则将其转换为 search 对象
    if (isSearchEmpty && e.pageQueryOp) {
      const convertedFieldEq = findColumns(e.pageQueryOp.fieldEq, e);
      const convertedFieldLike = findColumns(e.pageQueryOp.fieldLike, e);
      const convertedKeyWordLikeFields = findColumns(e.pageQueryOp.keyWordLikeFields, e);
      
      // 只要有任何字段被找到，就创建 search 对象
      if (convertedFieldEq.length > 0 || convertedFieldLike.length > 0 || convertedKeyWordLikeFields.length > 0) {
        e.search = {
          fieldEq: convertedFieldEq,
          fieldLike: convertedFieldLike,
          keyWordLikeFields: convertedKeyWordLikeFields,
        };
      }
    }
    
    // 如果 search 仍然为空，初始化为空对象
    if (!e.search) {
      e.search = {
        fieldEq: [],
        fieldLike: [],
        keyWordLikeFields: [],
      };
    }
  });

  // 如果配置了字典接口，获取字典数据并映射到 columns
  if (dictApi) {
    try {
      const dictData = await fetchDictData(dictApi, _reqUrl);
      
      // 遍历所有实体，映射字典数据
      state.epsList.forEach((entity) => {
        // 通过 resource 字段在字典数据中查找
        if (entity.resource && dictData[entity.resource]) {
          const resourceDict = dictData[entity.resource];
          
          // 遍历 columns，找到 dict: true 的字段
          if (entity.columns && Array.isArray(entity.columns) && resourceDict) {
            entity.columns.forEach((column: any) => {
              // 如果字段标记为字典字段（dict === true）
              if (column.dict === true && column.propertyName) {
                // 通过 propertyName 在字典数据中查找对应的字典选项数组
                const dictOptions = resourceDict[column.propertyName];
                if (Array.isArray(dictOptions) && dictOptions.length > 0) {
                  // 将字典选项数组赋值给字段的 dict 属性
                  column.dict = dictOptions;
                }
              }
            });
          }
        }
      });
    } catch (err) {
      // 字典数据获取失败不影响 EPS 数据加载
      // 静默失败，不输出日志
    }
  }
}

export async function createJson(outputDir: string, state: EpsState): Promise<boolean> {
  const content = JSON.stringify(state.epsList, null, '\t');
  const localContent = await readFile(getEpsPath(outputDir, 'eps.json'));

  const isUpdate = content !== localContent;

  if (isUpdate) {
    writeFile(getEpsPath(outputDir, 'eps.json'), content);
  }

  return isUpdate;
}
