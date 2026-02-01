/**
 * EPS 工具函数
 * 参考 cool-admin 的工具函数实现
 */
;

import type { EpsColumn, EpsEntity, TypeMapping } from './types';
// logger 已移除，使用 console 替代

/**
 * 默认类型映射配置
 */
export const TYPE_MAPPING: TypeMapping[] = [
  { test: ['bigint', 'int', 'integer', 'long'], type: 'number' },
  { test: ['varchar', 'text', 'char', 'string'], type: 'string' },
  { test: ['datetime', 'date', 'timestamp'], type: 'string' },
  { test: ['boolean', 'bool', 'tinyint'], type: 'boolean' },
  { test: ['json', 'object'], type: 'any' },
  { test: ['array'], type: 'any[]' },
];

/**
 * 格式化方法名，去除特殊字符
 * @param name 原始方法名
 * @returns 格式化后的方法名
 */
export function formatName(name: string): string {
  return (name || '').replace(/[:,\s,/,-]/g, '');
}

/**
 * 检查方法名是否合法（不包含特殊字符）
 * @param name 方法名
 * @returns 是否合法
 */
export function checkName(name: string): boolean {
  return Boolean(name && !['{', '}', ':'].some((e) => name.includes(e)));
}

/**
 * 转驼峰命名
 * @param str 字符串
 * @returns 驼峰命名字符串
 */
export function toCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
}

/**
 * 首字母大写
 * @param str 字符串
 * @returns 首字母大写的字符串
 */
export function firstUpperCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 获取字段类型
 * @param column 字段信息
 * @param mapping 类型映射配置
 * @returns TypeScript 类型
 */
export function getType(
  column: { propertyName: string; type: string },
  mapping: TypeMapping[] = TYPE_MAPPING
): string {
  for (const map of mapping) {
    if (map.custom) {
      const resType = map.custom({ propertyName: column.propertyName, type: column.type });
      if (resType) return resType;
    }
    if (map.test) {
      if (map.test.includes(column.type)) return map.type;
    }
  }
  return column.type;
}

/**
 * 查找字段
 * @param sources 字段 source 数组
 * @param entity EPS 实体
 * @returns 字段数组
 */
export function findColumns(sources: string[], entity: EpsEntity): EpsColumn[] {
  const columns = [entity.columns, entity.pageColumns].flat().filter(Boolean) as EpsColumn[];
  return (sources || [])
    .map((e) => columns.find((c) => c.source === e))
    .filter((c): c is EpsColumn => Boolean(c));
}

/**
 * 使用 prettier 格式化 TypeScript 代码
 * @param text 代码文本
 * @returns 格式化后的代码
 */
export async function formatCode(text: string): Promise<string | null> {
  try {
    const prettier = await import('prettier');
    return await prettier.format(text, {
      parser: 'typescript',
      useTabs: true,
      tabWidth: 4,
      endOfLine: 'lf',
      semi: true,
      singleQuote: false,
      printWidth: 100,
      trailingComma: 'none',
    });
  } catch (err) {
    console.error('[btc:eps] 代码格式化失败:', err);
    return text;
  }
}

/**
 * 获取对象方法名（排除 namespace、permission 字段）
 * @param obj 对象
 * @returns 方法名数组
 */
export function getNames(obj: any): string[] {
  return Object.keys(obj).filter(
    (e) => !['namespace', 'permission', 'search', 'request'].includes(e)
  );
}

/**
 * 检查是否为空或未定义
 * @param value 值
 * @returns 是否为空
 */
export function isEmpty(value: any): boolean {
  return (
    value == null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
}

/**
 * 数组去重（基于指定属性）
 * @param array 数组
 * @param key 去重键
 * @returns 去重后的数组
 */
export function uniqBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * 获取数组的最后一个元素
 * @param array 数组
 * @returns 最后一个元素
 */
export function last<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

/**
 * 压缩数组（移除 falsy 值）
 * @param array 数组
 * @returns 压缩后的数组
 */
export function compact<T>(array: (T | null | undefined | false)[]): T[] {
  return array.filter((item): item is T => Boolean(item));
}

/**
 * 获取对象的所有值
 * @param obj 对象
 * @returns 值数组
 */
export function values<T>(obj: Record<string, T>): T[] {
  return Object.values(obj);
}

/**
 * 创建目录（递归）
 * @param dirPath 目录路径
 * @param recursive 是否递归创建
 */
export async function createDir(dirPath: string, recursive = false): Promise<void> {
  try {
    const fs = await import('fs');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive });
    }
  } catch (_error) {
    console.error(`[btc:eps] 创建目录失败: ${dirPath}`, _error);
  }
}

/**
 * 读取文件内容
 * @param filePath 文件路径
 * @param parseJson 是否解析为 JSON
 * @returns 文件内容
 */
export async function readFile(filePath: string, parseJson = false): Promise<string | any> {
  try {
    const fs = await import('fs');
    if (!fs.existsSync(filePath)) {
      return parseJson ? null : '';
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseJson ? JSON.parse(content) : content;
  } catch (_error) {
    console.error(`[btc:eps] 读取文件失败: ${filePath}`, _error);
    return parseJson ? null : '';
  }
}

/**
 * 写入文件内容
 * @param filePath 文件路径
 * @param content 内容
 * @returns 是否成功
 */
export async function writeFile(filePath: string, content: string): Promise<boolean> {
  try {
    const fs = await import('fs');
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (_error) {
    console.error(`[btc:eps] 写入文件失败: ${filePath}`, _error);
    return false;
  }
}

/**
 * 错误日志输出
 * @param message 错误消息
 */
export function error(message: string): void {
  console.error(`[btc:eps] ${message}`);
}

/**
 * 信息日志输出
 * @param message 信息消息
 */
export function info(message: string): void {
  console.info(`[btc:eps] ${message}`);
}
