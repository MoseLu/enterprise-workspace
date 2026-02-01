/**
 * 数据模型 Zod Schemas
 * 用于验证通用数据模型
 */

import { z } from 'zod';

/**
 * 字典项 Schema
 */
export const DictItemSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  type: z.string().optional(),
  color: z.string().optional(),
});

/**
 * 分页参数 Schema
 */
export const PageParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  size: z.number().int().positive().default(10),
}).passthrough(); // 允许其他字段

/**
 * 分页响应 Schema
 */
export const PageResponseSchema = z.object({
  list: z.array(z.any()),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  size: z.number().int().positive(),
});

/**
 * 基础响应 Schema
 */
export function createBaseResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    code: z.number(),
    message: z.string(),
    data: dataSchema,
  });
}

/**
 * 导出类型（从 schema 推断）
 */
export type DictItem = z.infer<typeof DictItemSchema>;
export type PageParams = z.infer<typeof PageParamsSchema>;
export type PageResponse<T = any> = z.infer<typeof PageResponseSchema> & {
  list: T[];
};
