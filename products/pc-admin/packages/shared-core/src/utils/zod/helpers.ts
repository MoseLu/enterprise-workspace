/**
 * Zod 辅助函数
 * 提供错误格式化、类型推断等工具函数
 */

import { z } from 'zod';

/**
 * 格式化 Zod 错误为可读的错误消息
 * @param error Zod 错误
 * @returns 格式化的错误消息数组
 */
export function formatZodError(error: z.ZodError): string[] {
  return error.errors.map((err) => {
    const path = err.path.length > 0 ? err.path.join('.') : '根对象';
    return `${path}: ${err.message}`;
  });
}

/**
 * 格式化 Zod 错误为单个错误消息字符串
 * @param error Zod 错误
 * @param separator 分隔符，默认为 '; '
 * @returns 格式化的错误消息字符串
 */
export function formatZodErrorString(
  error: z.ZodError,
  separator: string = '; '
): string {
  return formatZodError(error).join(separator);
}

/**
 * 从 Zod schema 推断 TypeScript 类型
 * @param schema Zod schema
 * @returns TypeScript 类型
 */
export type InferType<T extends z.ZodTypeAny> = z.infer<T>;

/**
 * 创建可选字段的 schema
 * @param schema 原始 schema
 * @returns 可选的 schema
 */
export function optional<T extends z.ZodTypeAny>(schema: T): z.ZodOptional<T> {
  return schema.optional();
}

/**
 * 创建可为 null 的字段的 schema
 * @param schema 原始 schema
 * @returns 可为 null 的 schema
 */
export function nullable<T extends z.ZodTypeAny>(schema: T): z.ZodNullable<T> {
  return schema.nullable();
}

/**
 * 创建可为 null 或 undefined 的字段的 schema
 * @param schema 原始 schema
 * @returns 可为 null 或 undefined 的 schema
 */
export function nullish<T extends z.ZodTypeAny>(schema: T): ReturnType<typeof schema.nullish> {
  return schema.nullish();
}

/**
 * 创建有默认值的字段的 schema
 * @param schema 原始 schema
 * @param defaultValue 默认值
 * @returns 有默认值的 schema
 */
export function withDefault<T extends z.ZodTypeAny>(
  schema: T,
  defaultValue: z.infer<T>
): z.ZodDefault<T> {
  return schema.default(defaultValue);
}

/**
 * 验证并转换数据
 * @param schema Zod schema
 * @param data 原始数据
 * @returns 验证并转换后的数据
 */
export function validateAndTransform<T>(
  schema: z.ZodType<T>,
  data: unknown
): T {
  return schema.parse(data);
}

/**
 * 安全验证数据（不抛出异常）
 * @param schema Zod schema
 * @param data 原始数据
 * @returns 验证结果
 */
export function safeValidate<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * 深度合并多个 schema（用于扩展配置）
 * @param schemas 多个 schema 对象
 * @returns 合并后的 schema
 */
export function mergeSchemas<T extends Record<string, z.ZodTypeAny>>(
  ...schemas: T[]
): z.ZodObject<any> {
  const merged: Record<string, z.ZodTypeAny> = {};
  schemas.forEach((schema) => {
    if (schema instanceof z.ZodObject) {
      Object.assign(merged, schema.shape);
    }
  });
  return z.object(merged as any);
}
