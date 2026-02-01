/**
 * 应用身份配置接口
 * 每个子应用必须实现此接口，定义自己的身份信息
 * 注意：类型定义保留以保持向后兼容，实际类型可以从 Zod schema 推断
 * @see packages/shared-core/src/configs/schemas.ts
 */

export interface AppIdentity {
  // 应用 ID（必须唯一，通常与目录名去掉 -app 后缀一致）
  id: string;
  
  // 应用名称（显示名称）
  name: string;
  
  // 应用描述
  description?: string;
  
  // 路径前缀（开发/预览环境使用）
  pathPrefix: string;
  
  // 子域名（生产环境使用，可选）
  subdomain?: string;
  
  // 应用类型
  type: 'main' | 'sub' | 'layout' | 'docs';
  
  // 是否启用
  enabled: boolean;
  
  // 应用图标（可选）
  icon?: string;
  
  // 应用版本
  version?: string;
  
  // 路由配置（仅主应用需要）
  routes?: {
    // 主应用的路由列表（用于判断哪些路由属于主应用）
    mainAppRoutes?: string[];
    // 不可关闭的路由列表（如概览页）
    nonClosableRoutes?: string[];
    // 首页路由（用于重定向）
    homeRoute?: string;
    // 需要跳过 Tabbar 的路由列表（如登录页、个人信息页）
    skipTabbarRoutes?: string[];
  };
  
  // 其他元数据
  metadata?: Record<string, any>;
}
