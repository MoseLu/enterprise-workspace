/**
 * API 中心配置
 * 定义所有 API 分类的基础路径
 */

/**
 * API 分类配置
 * 每个分类包含基础路径（不包含 /api 前缀，由 baseURL 统一处理）
 */
export const API_CATEGORIES = {
  auth: { basePath: '/system/auth' },
  system: { basePath: '/system' },
  log: { basePath: '/system/log' },
  base: { basePath: '/system/base' },
  docs: { basePath: '/system/docs' },
  test: { basePath: '/system/test' },
} as const;

/**
 * API 分类类型
 */
export type ApiCategory = keyof typeof API_CATEGORIES;

/**
 * 获取 API 分类的基础路径
 * @param category API 分类
 * @returns 基础路径
 */
export function getApiBasePath(category: ApiCategory): string {
  return API_CATEGORIES[category].basePath;
}
