/**
 * 路由相关常量定义
 */

/**
 * 已知的子应用路由前缀列表
 */
export const KNOWN_SUB_APP_PREFIXES = [
  '/system',
  '/admin',
  '/logistics',
  '/engineering',
  '/quality',
  '/production',
  '/finance',
  '/operations',
  '/docs',
  '/dashboard',
  '/personnel'
];

/**
 * 应用名称映射（用于显示友好的中文名称，兜底方案）
 */
export const APP_NAME_MAP: Record<string, string> = {
  main: '概览',
  system: '系统模块',
  admin: '管理模块',
  logistics: '物流模块',
  engineering: '工程模块',
  quality: '品质模块',
  production: '生产模块',
  finance: '财务模块',
  operations: '运维模块',
  dashboard: '图表模块',
  personnel: '人事模块',
  docs: '文档模块',
};

/**
 * 子应用列表（用于路径规范化）
 */
export const SUB_APPS = ['admin', 'logistics', 'engineering', 'quality', 'production', 'finance'];

/**
 * 子应用路径前缀（用于路径规范化）
 */
export const SUB_APP_PREFIXES = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance'];

/**
 * 公开页面路径列表（不需要认证）
 */
export const PUBLIC_PAGES = ['/login', '/register', '/forget-password'];

/**
 * 应用根路径列表（跳过标签页添加）
 */
export const APP_ROOTS = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance'];

