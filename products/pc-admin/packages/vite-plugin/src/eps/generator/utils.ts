import * as _ from 'lodash-es';

export function normalizePrefix(prefix: string): string {
  if (!prefix) return '';
  const normalized = prefix.replace(/^\/+/, '').replace(/\/+$/, '');
  if (normalized.startsWith('admin/')) {
    return normalized.replace(/^admin\//, '');
  }
  if (normalized.startsWith('api/')) {
    return normalized.replace(/^api\//, '');
  }
  return normalized;
}

export function mergeArrayBy<T extends Record<string, any>>(targetArr: T[] | undefined, newArr: T[], key: string): T[] {
  const result: T[] = Array.isArray(targetArr) ? _.cloneDeep(targetArr) : [];
  newArr.forEach((item) => {
    if (!item) return;
    const matchIndex = result.findIndex((existing) => existing && existing[key] === item[key]);
    if (matchIndex === -1) {
      result.push(_.cloneDeep(item));
    } else {
      result[matchIndex] = {
        ...item,
        ...result[matchIndex]
      };
    }
  });
  return result;
}

export function checkName(name: string): boolean {
  return Boolean(name && !['{', '}', ':'].some((e) => name.includes(e)));
}

export function formatName(name: string): string {
  return (name || '').replace(/[:,\s,/,-]/g, '');
}

export function toCamel(str: string | undefined): string {
  if (!str) return '';
  return str.replace(/-([a-z])/g, (g) => g[1]?.toUpperCase() || '');
}

export function firstUpperCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
