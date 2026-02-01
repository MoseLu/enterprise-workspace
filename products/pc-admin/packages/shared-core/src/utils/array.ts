/**
 * 数组工具函数
 */

/**
 * 将 ids 统一转换为数组格式
 * @param ids - 可能是字符串、数字、数组或 undefined/null
 * @returns 数组格式的 ids，如果输入为空则返回空数组
 */
export function normalizeIds(ids: string | number | (string | number)[] | undefined | null): (string | number)[] {
  if (ids === undefined || ids === null || ids === '') {
    return [];
  }

  if (Array.isArray(ids)) {
    return ids;
  }

  // 字符串或数字，转换为数组
  return [ids];
}

/**
 * 统一处理 keyword 对象中的 ids 字段为数组格式
 * @param keyword - keyword 对象
 * @returns 处理后的 keyword 对象，ids 字段统一为数组
 */
export function normalizeKeywordIds(keyword: any): any {
  if (!keyword || typeof keyword !== 'object' || Array.isArray(keyword)) {
    return keyword;
  }

  // 如果 keyword 对象中有 ids 字段，统一转换为数组
  if ('ids' in keyword) {
    return {
      ...keyword,
      ids: normalizeIds(keyword.ids)
    };
  }

  return keyword;
}

/**
 * 本地化排序
 * @param list 数组
 * @param selector 选择器函数
 * @returns 排序后的数组
 */
export function sortByLocale<T>(list: T[], selector?: (item: T) => string): T[] {
  const mapper = selector ?? ((item: T) => String(item ?? ''));

  return [...list].sort((a, b) => {
    const left = mapper(a) ?? '';
    const right = mapper(b) ?? '';
    return left.localeCompare(right, undefined, { sensitivity: 'base' });
  });
}

/**
 * 数组去重
 * @param arr 数组
 * @param key 去重键（可选）
 * @returns 去重后的数组
 */
export function unique<T>(arr: T[], key?: keyof T): T[] {
  if (!key) {
    return [...new Set(arr)];
  }
  
  const seen = new Set();
  return arr.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * 数组分组
 * @param arr 数组
 * @param key 分组键或函数
 * @returns 分组后的对象
 */
export function groupBy<T>(
  arr: T[],
  key: keyof T | ((item: T) => string | number)
): Record<string, T[]> {
  return arr.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * 数组分块
 * @param arr 数组
 * @param size 块大小
 * @returns 分块后的数组
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * 数组扁平化
 * @param arr 数组
 * @param depth 深度
 * @returns 扁平化后的数组
 */
export function flatten<T>(arr: any[], depth = 1): T[] {
  return depth > 0
    ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val), [])
    : arr.slice();
}

/**
 * 数组深度扁平化
 * @param arr 数组
 * @returns 扁平化后的数组
 */
export function flattenDeep<T>(arr: any[]): T[] {
  return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flattenDeep(val) : val), []);
}

/**
 * 数组交集
 * @param arr1 数组1
 * @param arr2 数组2
 * @returns 交集数组
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter(item => arr2.includes(item));
}

/**
 * 数组差集
 * @param arr1 数组1
 * @param arr2 数组2
 * @returns 差集数组
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter(item => !arr2.includes(item));
}

/**
 * 数组并集
 * @param arr1 数组1
 * @param arr2 数组2
 * @returns 并集数组
 */
export function union<T>(arr1: T[], arr2: T[]): T[] {
  return unique([...arr1, ...arr2]);
}

/**
 * 随机打乱数组
 * @param arr 数组
 * @returns 打乱后的数组
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    if (temp !== undefined && result[j] !== undefined) {
      result[i] = result[j]!;
      result[j] = temp;
    }
  }
  return result;
}

/**
 * 随机取样
 * @param arr 数组
 * @param count 取样数量
 * @returns 取样后的数组
 */
export function sample<T>(arr: T[], count = 1): T[] {
  const shuffled = shuffle(arr);
  return shuffled.slice(0, count);
}

/**
 * 数组求和
 * @param arr 数组
 * @param key 求和键（可选）
 * @returns 求和结果
 */
export function sum<T>(arr: T[], key?: keyof T): number {
  if (!key) {
    return (arr as unknown as number[]).reduce((acc, val) => acc + val, 0);
  }
  
  return arr.reduce((acc, item) => {
    const value = Number(item[key]);
    return acc + (isNaN(value) ? 0 : value);
  }, 0);
}

/**
 * 数组平均值
 * @param arr 数组
 * @param key 平均值键（可选）
 * @returns 平均值
 */
export function average<T>(arr: T[], key?: keyof T): number {
  if (arr.length === 0) return 0;
  return sum(arr, key) / arr.length;
}

/**
 * 数组最大值
 * @param arr 数组
 * @param key 最大值键（可选）
 * @returns 最大值项
 */
export function maxBy<T>(arr: T[], key?: keyof T): T | undefined {
  if (arr.length === 0) return undefined;
  
  if (!key) {
    return arr.reduce((max, item) => (item > max ? item : max));
  }
  
  return arr.reduce((max, item) => {
    return Number(item[key]) > Number(max[key]) ? item : max;
  });
}

/**
 * 数组最小值
 * @param arr 数组
 * @param key 最小值键（可选）
 * @returns 最小值项
 */
export function minBy<T>(arr: T[], key?: keyof T): T | undefined {
  if (arr.length === 0) return undefined;
  
  if (!key) {
    return arr.reduce((min, item) => (item < min ? item : min));
  }
  
  return arr.reduce((min, item) => {
    return Number(item[key]) < Number(min[key]) ? item : min;
  });
}

