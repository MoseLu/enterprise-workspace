/**
 * 配置验证 Zod Schemas
 * 用于验证应用配置、菜单配置、清单配置等
 */

// 注意：这里不能直接导入 logger，因为可能在初始化阶段被调用（如 app-scanner 在模块加载时调用 validateConfig）
// 在初始化阶段使用 console，运行时可以使用 logger（如果需要的话）
// console 是全局对象，在模块加载时就已经存在，不会受到循环依赖的影响

import { z } from 'zod';

/**
 * 菜单配置项 Schema
 */
export const MenuConfigItemSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    title: z.string().optional(),
    labelKey: z.string().optional(),
    icon: z.string().optional(),
    sort: z.number().optional(),
    showInOverview: z.boolean().optional(),
    permission: z.string().optional(),
    description: z.string().optional(),
    hot: z.boolean().optional(),
    mountTo: z.string().optional(),
    children: z.array(MenuConfigItemSchema).optional(),
    path: z.string().optional(),
  })
);

/**
 * 菜单配置 Schema
 */
export const MenuConfigSchema = z.object({
  global: z.array(MenuConfigItemSchema).optional(),
  mountPoints: z.array(MenuConfigItemSchema).optional(),
  module: z.array(MenuConfigItemSchema).optional(),
});

/**
 * 子应用清单路由 Schema
 */
export const SubAppManifestRouteSchema = z.object({
  path: z.string(),
  name: z.string().optional(),
  component: z.string().optional(),
  labelKey: z.string().optional(),
  tabLabelKey: z.string().optional(),
  breadcrumbs: z
    .array(
      z.object({
        labelKey: z.string().optional(),
        label: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .optional(),
});

/**
 * 子应用清单 Schema
 */
export const SubAppManifestSchema = z.object({
  app: z.object({
    id: z.string(),
    basePath: z.string().optional(),
    nameKey: z.string().optional(),
    'app-name': z.string().optional(),
  }),
  routes: z.array(SubAppManifestRouteSchema),
  menus: z
    .array(
      z.object({
        index: z.string(),
        labelKey: z.string().optional(),
        label: z.string().optional(),
        icon: z.string().optional(),
        children: z.array(z.any()).optional(),
      })
    )
    .optional(),
  menuConfig: MenuConfigSchema.optional(),
  raw: z.any().optional(),
});

/**
 * 应用身份 Schema
 */
export const AppIdentitySchema = z.object({
  id: z.string().min(1, '应用ID不能为空'),
  name: z.string().min(1, '应用名称不能为空'),
  description: z.string().optional(),
  pathPrefix: z.string().min(1, '路径前缀不能为空'),
  subdomain: z.string().optional(),
  type: z.enum(['main', 'sub', 'layout', 'docs']),
  enabled: z.boolean(),
  icon: z.string().optional(),
  version: z.string().optional(),
  routes: z
    .object({
      mainAppRoutes: z.array(z.string()).optional(),
      nonClosableRoutes: z.array(z.string()).optional(),
      homeRoute: z.string().optional(),
      skipTabbarRoutes: z.array(z.string()).optional(),
    })
    .optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * 预处理函数：将 Vue I18n 编译后的函数转换为字符串
 */
function preprocessI18nValue(val: any): any {
  if (typeof val === 'function') {
    try {
      const result = val({ normalize: (arr: any[]) => arr[0] });
      if (typeof result === 'string') {
        return result;
      }
      // 尝试从函数对象中提取 source
      const source = (val as any).loc?.source || (val as any).source;
      if (typeof source === 'string') {
        return source;
      }
    } catch {
      // 如果提取失败，返回原始值
    }
  }
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    // 递归处理对象
    const processed: any = {};
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        processed[key] = preprocessI18nValue(val[key]);
      }
    }
    return processed;
  }
  return val;
}

/**
 * 子应用配置 Schema
 * 注意：name 可能是字符串或 Vue I18n 编译后的函数格式
 */
export const SubAppLevelConfigSchema = z.preprocess(
  (val) => {
    if (val && typeof val === 'object' && 'name' in val) {
      return { ...val, name: preprocessI18nValue(val.name) };
    }
    return val;
  },
  z.object({
    name: z.union([z.string(), z.any()]), // 允许字符串或任何类型（生产环境静默失败）
  })
);

/**
 * 应用级配置 Schema
 */
export const AppLevelConfigSchema = z.record(z.union([z.string(), z.record(z.string())]));

/**
 * 菜单级配置 Schema（支持多层嵌套）
 */
export const MenuLevelConfigSchema: z.ZodType<any> = z.lazy(() =>
  z.record(
    z.union([
      z.string(),
      MenuLevelConfigSchema,
      z.object({
        _: z.string().optional(),
      }).passthrough(),
    ])
  )
);

/**
 * 页面级配置 Schema
 */
export const PageLevelConfigSchema = z.record(
  z.record(z.record(z.string()))
);

/**
 * 通用配置 Schema
 * 支持多层嵌套的对象结构，值可以是字符串或嵌套对象
 * 注意：函数类型会在验证前通过预处理函数转换
 */
export const CommonLevelConfigSchema: z.ZodType<any> = z.lazy(() =>
  z.record(
    z.union([
      z.string(),
      z.function(), // 允许 Vue I18n 编译后的函数格式（会在验证前预处理）
      CommonLevelConfigSchema,
      z.any(), // 允许任何类型（生产环境静默失败）
    ])
  )
);

/**
 * 单语言配置 Schema
 */
export const LocaleConfigSingleSchema = z.object({
  app: AppLevelConfigSchema.optional(),
  subapp: SubAppLevelConfigSchema.optional(),
  menu: MenuLevelConfigSchema.optional(),
  page: PageLevelConfigSchema.optional(),
  common: CommonLevelConfigSchema.optional(),
});

/**
 * 多语言配置 Schema
 */
export const LocaleConfigSchema = z.object({
  'zh-CN': LocaleConfigSingleSchema,
  'en-US': LocaleConfigSingleSchema,
});

/**
 * 验证配置
 * @param schema Zod schema
 * @param config 配置对象
 * @param configName 配置名称（用于错误消息）
 * @returns 验证后的配置
 * @throws ZodError 如果验证失败（仅在开发环境）
 */
export function validateConfig<T>(
  schema: z.ZodType<T>,
  config: unknown,
  configName: string = '配置'
): T {
  // 预处理配置：将 Vue I18n 编译后的函数转换为字符串
  const preprocessedConfig = preprocessI18nValue(config);
  
  if (import.meta.env.DEV) {
    // 开发环境：强制验证，失败时抛出错误
    try {
      return schema.parse(preprocessedConfig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // 在初始化阶段使用 console，避免循环依赖
        console.error(`[配置验证] ${configName}验证失败:`, error.errors);
        throw new Error(
          `${configName}验证失败: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`
        );
      }
      throw error;
    }
  } else {
    // 生产环境：启用验证但静默失败
    const result = schema.safeParse(preprocessedConfig);
    if (result.success) {
      return result.data;
    } else {
      // 生产环境静默失败，返回原始配置，并上报
      // 在初始化阶段使用 console，避免循环依赖
      console.warn(`[配置验证] ${configName}验证失败，使用原始配置`);
      // 上报验证失败（异步，不阻塞）
      import('../utils/zod/reporting').then(({ reportValidationError }) => {
        reportValidationError(
          'config',
          configName,
          result.error,
          { configPath: configName }
        );
      }).catch(() => {
        // 如果导入失败，静默跳过
      });
      return config as T;
    }
  }
}
