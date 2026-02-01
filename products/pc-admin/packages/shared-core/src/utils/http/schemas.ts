/**
 * API 响应 Zod Schemas
 * 用于验证 API 响应数据的结构
 */

import { z } from 'zod';

/**
 * 基础响应 Schema
 * 通用格式：{ code: number, message: string, data: T }
 */
export function createBaseResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    code: z.number(),
    message: z.string(),
    data: dataSchema,
  });
}

/**
 * 分页响应 Schema
 * 格式：{ list: T[], total: number, page: number, size: number }
 */
export function createPageResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    list: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    size: z.number().int().positive(),
  });
}

/**
 * API 响应 Schema（项目标准格式）
 * 格式：{ code: number, msg: string, data: T, total?: number, token?: string }
 */
export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    code: z.number(),
    msg: z.string(),
    data: dataSchema,
    total: z.number().int().nonnegative().optional(),
    token: z.string().optional(),
  });
}

/**
 * 空数据 Schema（用于无返回值的接口）
 */
export const emptyDataSchema = z.any().optional();

/**
 * API 响应 data 字段的类型
 * 根据接口语义约定 data 的类型，同一个接口的 data 类型必须固定
 */
export type ApiDataType = 'list' | 'detail' | 'boolean' | 'number' | 'string';

/**
 * 基础响应骨架 Schema（项目标准格式）
 * 格式：{ code: string, msg: string, data: T }
 * 注意：code 可能是字符串或数字，根据实际后端返回调整
 */
const baseApiResponseSchema = z.object({
  code: z.union([z.string(), z.number()]), // 支持字符串或数字
  msg: z.string(),
});

/**
 * 列表接口响应 Schema
 * data 必须是数组（允许空数组）
 */
export const listApiResponseSchema = baseApiResponseSchema.extend({
  data: z.array(z.unknown()).default([]),
});

/**
 * 详情接口响应 Schema
 * data 必须是对象（允许空对象）
 */
export const detailApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({}).catchall(z.unknown()).default({}),
});

/**
 * 布尔接口响应 Schema
 * data 必须是布尔值
 */
export const booleanApiResponseSchema = baseApiResponseSchema.extend({
  data: z.boolean().default(false),
});

/**
 * 数值接口响应 Schema
 * data 必须是数值
 */
export const numberApiResponseSchema = baseApiResponseSchema.extend({
  data: z.number().default(0),
});

/**
 * 字符串接口响应 Schema
 * data 必须是字符串
 */
export const stringApiResponseSchema = baseApiResponseSchema.extend({
  data: z.string().default(''),
});

/**
 * API 类型到 Schema 的映射
 */
const apiTypeSchemaMap = {
  list: listApiResponseSchema,
  detail: detailApiResponseSchema,
  boolean: booleanApiResponseSchema,
  number: numberApiResponseSchema,
  string: stringApiResponseSchema,
} as const;

/**
 * 按 API 类型验证响应数据
 * @param rawResponse 原始响应数据
 * @param apiType API 类型（list/detail/boolean/number/string）
 * @param context 上下文信息（用于上报）
 * @returns 验证结果对象 { success: boolean, data?: T, error?: ZodError }
 */
export function validateApiResponseByType<T extends ApiDataType>(
  rawResponse: unknown,
  apiType: T,
  context?: { url?: string; apiName?: string }
): { success: true; data: z.infer<typeof apiTypeSchemaMap[T]> } | { success: false; error: z.ZodError; data: any } {
  const schema = apiTypeSchemaMap[apiType];
  const result = schema.safeParse(rawResponse);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // 验证失败：返回默认值（按接口类型兜底）
  const defaultDataMap = {
    list: [],
    detail: {},
    boolean: false,
    number: 0,
    string: '',
  } as const;

  const defaultData = defaultDataMap[apiType];

  // 尝试从原始响应中提取 code 和 msg，如果不存在则使用默认值
  const fallbackResponse = {
    code: (rawResponse as any)?.code ?? '',
    msg: (rawResponse as any)?.msg ?? '数据格式异常',
    data: defaultData,
  };

  // 上报验证失败（异步，不阻塞）
  import('../zod/reporting').then(({ reportValidationError }) => {
    // 构建上下文对象，只在属性存在时才添加（避免 undefined，符合 exactOptionalPropertyTypes）
    const errorContext: {
      url?: string;
      schemaName?: string;
    } = {};
    if (context?.url) {
      errorContext.url = context.url;
    }
    if (context?.apiName) {
      errorContext.schemaName = context.apiName;
    }

    reportValidationError(
      'api-response',
      context?.apiName || `ApiResponse[${apiType}]`,
      result.error,
      errorContext
    );
  }).catch(() => {
    // 如果导入失败，静默跳过
  });

  return {
    success: false,
    error: result.error,
    data: fallbackResponse,
  };
}

/**
 * 推断 API 响应的 data 类型（用于调试和日志）
 * @param data 响应数据中的 data 字段
 * @returns 推断的类型名称
 */
export function inferApiDataType(data: unknown): ApiDataType | 'unknown' {
  if (Array.isArray(data)) {
    return 'list';
  }
  if (typeof data === 'boolean') {
    return 'boolean';
  }
  if (typeof data === 'number') {
    return 'number';
  }
  if (typeof data === 'string') {
    return 'string';
  }
  if (data !== null && typeof data === 'object') {
    return 'detail';
  }
  return 'unknown';
}

/**
 * 验证 API 响应
 * @param schema Zod schema
 * @param data 响应数据
 * @returns 验证后的数据
 * @throws ZodError 如果验证失败
 */
export function validateResponse<T>(
  schema: z.ZodType<T>,
  data: unknown
): T {
  return schema.parse(data);
}

/**
 * 安全验证 API 响应（不抛出异常）
 * @param schema Zod schema
 * @param data 响应数据
 * @param context 上下文信息（用于上报）
 * @returns 验证结果对象 { success: boolean, data?: T, error?: ZodError }
 */
export function safeValidateResponse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context?: { url?: string; schemaName?: string }
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    // 验证失败时上报（如果启用，异步，不阻塞）
    import('../zod/reporting').then(({ reportValidationError }) => {
      // 构建上下文对象，只在属性存在时才添加（避免 undefined，符合 exactOptionalPropertyTypes）
      const errorContext: {
        url?: string;
        schemaName?: string;
      } = {};
      if (context?.url) {
        errorContext.url = context.url;
      }
      if (context?.schemaName) {
        errorContext.schemaName = context.schemaName;
      }

      reportValidationError(
        'api-response',
        context?.schemaName || 'ApiResponse',
        result.error,
        errorContext
      );
    }).catch(() => {
      // 如果导入失败，静默跳过
    });
    return { success: false, error: result.error };
  }
}
