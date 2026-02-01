;
import adminManifestJson from "./manifests/admin.json" with { type: "json" };
import logisticsManifestJson from "./manifests/logistics.json" with { type: "json" };
import systemManifestJson from "./manifests/system.json" with { type: "json" };
import qualityManifestJson from "./manifests/quality.json" with { type: "json" };
import engineeringManifestJson from "./manifests/engineering.json" with { type: "json" };
import productionManifestJson from "./manifests/production.json" with { type: "json" };
import financeManifestJson from "./manifests/finance.json" with { type: "json" };
import operationsManifestJson from "./manifests/operations.json" with { type: "json" };
import docsManifestJson from "./manifests/docs.json" with { type: "json" };
import dashboardManifestJson from "./manifests/dashboard.json" with { type: "json" };
import personnelManifestJson from "./manifests/personnel.json" with { type: "json" };
import mainManifestJson from "./manifests/main.json" with { type: "json" };
import overviewI18nJson from "./manifests/overview.json" with { type: "json" };
import { getCurrentEnvironment, getCurrentSubApp } from '../configs/unified-env-config';
import { SubAppManifestSchema, validateConfig } from '../configs/schemas';

/**
 * 子应用清单路由
 * 注意：类型定义保留以保持向后兼容，实际类型可以从 Zod schema 推断
 * @see packages/shared-core/src/configs/schemas.ts
 */
export interface SubAppManifestRoute {
  path: string;
  labelKey?: string;
  label?: string;
  tab?: { enabled?: boolean; labelKey?: string; label?: string; icon?: string };
  breadcrumbs?: Array<{ labelKey?: string; label?: string; icon?: string }>;
}

/**
 * 菜单配置项
 * 注意：类型定义保留以保持向后兼容，实际类型可以从 Zod schema 推断
 * @see packages/shared-core/src/configs/schemas.ts
 */
export interface MenuConfigItem {
  id: string;
  title?: string;
  labelKey?: string;
  icon?: string;
  sort?: number;
  showInOverview?: boolean;
  permission?: string;
  description?: string;
  hot?: boolean;
  mountTo?: string; // 子应用菜单挂载到主应用的哪个挂载点
  children?: MenuConfigItem[];
  path?: string; // 菜单项对应的路径
}

/**
 * 菜单配置
 * 注意：类型定义保留以保持向后兼容，实际类型可以从 Zod schema 推断
 * @see packages/shared-core/src/configs/schemas.ts
 */
export interface MenuConfig {
  global?: MenuConfigItem[]; // 主应用自有概览级菜单
  mountPoints?: MenuConfigItem[]; // 子应用菜单挂载点
  module?: MenuConfigItem[]; // 子应用业务菜单（用于挂载）
}

/**
 * 子应用清单
 * 注意：类型定义保留以保持向后兼容，实际类型可以从 Zod schema 推断
 * @see packages/shared-core/src/configs/schemas.ts
 */
export interface SubAppManifest<M = unknown> {
  app: { id: string; basePath?: string; nameKey?: string; 'app-name'?: string };
  routes: SubAppManifestRoute[];
  menus?: Array<{ index: string; labelKey?: string; label?: string; icon?: string; children?: any[] }>;
  menuConfig?: MenuConfig; // 阿里云控制台风格的菜单配置
  raw: M;
}

const manifestRegistry: Record<string, SubAppManifest> = {};

export function registerManifest(app: string, manifest: SubAppManifest) {
  // 开发和生产环境：验证 manifest 结构
  try {
    validateConfig(SubAppManifestSchema, manifest, `应用 ${app} 的清单配置`);
  } catch (error) {
    // 开发环境：抛出错误（帮助发现配置问题）
    if (import.meta.env.DEV) {
      throw error;
    }
    // 生产环境：记录警告并上报，但继续注册
    console.warn(`[registerManifest] 应用 ${app} 的清单配置验证失败:`, error);
    // 上报验证失败（异步，不阻塞）
    if (error instanceof Error && 'errors' in error) {
      import('../utils/zod/reporting').then(({ reportValidationError }) => {
        reportValidationError(
          'config',
          `应用 ${app} 的清单配置`,
          error as any,
          { configPath: `manifest:${app}` }
        );
      }).catch(() => {
        // 如果导入失败，静默跳过
      });
    }
  }
  
  manifestRegistry[app] = manifest;
}

export function getManifest(app: string): SubAppManifest | undefined {
  return manifestRegistry[app];
}

// 懒加载 getAppBySubdomain，避免构建时依赖
// 使用全局变量存储，在运行时由应用注入
let getAppBySubdomainFn: ((hostname: string) => any) | null = null;

/**
 * 设置 getAppBySubdomain 函数（由应用在运行时注入）
 * 应用应该在初始化时调用此函数来注入 getAppBySubdomain
 */
export function setAppBySubdomainFn(fn: (hostname: string) => any) {
  getAppBySubdomainFn = fn;
}

function getAppBySubdomain(hostname: string): any {
  if (typeof window === 'undefined') {
    return undefined;
  }

  // 如果函数已注入，使用它
  if (getAppBySubdomainFn) {
    return getAppBySubdomainFn(hostname);
  }

  // 否则返回 undefined（应用需要调用 setAppBySubdomainFn 来注入函数）
  return undefined;
}

export function getManifestRoute(app: string, fullPath: string): SubAppManifestRoute | undefined {
  const manifest = getManifest(app);
  if (!manifest) return undefined;

  // 使用统一的环境检测函数
  const env = getCurrentEnvironment();
  const isProductionOrTestSubdomain = env === 'production' || env === 'test';
  
  // 使用统一的应用检测函数获取当前应用
  const currentSubdomainApp = getCurrentSubApp();

  // 如果在生产环境或测试环境子域名下，且当前应用匹配子域名，路径应该是 / 或 /xxx（没有应用前缀）
  if (isProductionOrTestSubdomain && currentSubdomainApp === app) {
    // 在生产环境或测试环境子域名下，路径直接匹配（不需要 basePath 前缀）
    const normalized = fullPath === '/' ? '/' : (fullPath.startsWith('/') ? fullPath : `/${fullPath}`);
    return manifest.routes.find((route) => route.path === normalized);
  }

  // 开发环境或主域名访问：使用 basePath 匹配
  const basePath = manifest.app.basePath ?? `/${app}`;
  if (!fullPath.startsWith(basePath)) {
    return undefined;
  }

  const suffix = fullPath.slice(basePath.length) || "/";
  const normalized = suffix.startsWith("/") ? suffix : `/${suffix}`;
  return manifest.routes.find((route) => route.path === normalized);
}

export function getManifestTabs(
  app: string,
): Array<{ key: string; path: string; labelKey?: string; label?: string }> {
  const manifest = getManifest(app);
  if (!manifest) return [];

  const basePath = manifest.app.basePath ?? `/${app}`;

  return manifest.routes
    .filter((route) => route.tab?.enabled !== false)
    .map((route) => {
      const fullPath = `${basePath}${route.path === "/" ? "" : route.path}`;
      const key = route.path.replace(/^\//, "") || "home";

      const labelKey = route.tab?.labelKey ?? route.labelKey;
      const label = route.tab?.label ?? route.label;

      return {
        key,
        path: fullPath,
        ...(labelKey != null ? { labelKey } : {}),
        ...(label != null ? { label } : {}),
      };
    });
}

export function getManifestMenus(app: string): Array<{ index: string; labelKey?: string; label?: string; icon?: string; children?: any[] }> {
  const manifest = getManifest(app);
  if (!manifest) return [];
  return manifest.menus ?? [];
}

export function getAllManifests() {
  return { ...manifestRegistry };
}

/**
 * 获取概览页面的国际化配置
 * 从构建时生成的 overview.json 文件中读取所有应用的菜单国际化配置
 * 这个文件在构建 shared-core 时自动生成，包含所有有菜单的应用的模块级 config.ts 中的菜单国际化配置
 */
export function getOverviewI18n(): {
  'zh-CN': Record<string, string>;
  'en-US': Record<string, string>;
} | null {
  if (overviewI18nJson?.i18n) {
    // 检查是否是占位符（首次构建时可能是空对象）
    const zhCNKeys = Object.keys(overviewI18nJson.i18n['zh-CN'] || {});
    const enUSKeys = Object.keys(overviewI18nJson.i18n['en-US'] || {});
    
    // 如果有实际的菜单 key，返回数据
    if (zhCNKeys.length > 0 || enUSKeys.length > 0) {
      return overviewI18nJson.i18n;
    }
  }
  
  return null;
}

registerManifest("admin", {
  app: {
    id: adminManifestJson.app?.id ?? "admin",
    basePath: adminManifestJson.app?.basePath ?? "/admin",
    nameKey: adminManifestJson.app?.nameKey,
    'app-name': adminManifestJson.app?.['app-name'],
  },
  routes: adminManifestJson.routes ?? [],
  menus: adminManifestJson.menus ?? [],
  raw: adminManifestJson,
});

registerManifest("logistics", {
  app: {
    id: logisticsManifestJson.app?.id ?? "logistics",
    basePath: logisticsManifestJson.app?.basePath ?? "/logistics",
    nameKey: logisticsManifestJson.app?.nameKey,
    'app-name': logisticsManifestJson.app?.['app-name'],
  },
  routes: logisticsManifestJson.routes ?? [],
  menus: logisticsManifestJson.menus ?? [],
  raw: logisticsManifestJson,
});

registerManifest("system", {
  app: {
    id: systemManifestJson.app?.id ?? "system",
    basePath: systemManifestJson.app?.basePath ?? "/",
    nameKey: systemManifestJson.app?.nameKey,
    'app-name': systemManifestJson.app?.['app-name'],
  },
  routes: systemManifestJson.routes ?? [],
  menus: systemManifestJson.menus ?? [],
  raw: systemManifestJson,
});

registerManifest("quality", {
  app: {
    id: qualityManifestJson.app?.id ?? "quality",
    basePath: qualityManifestJson.app?.basePath ?? "/quality",
    nameKey: qualityManifestJson.app?.nameKey,
    'app-name': qualityManifestJson.app?.['app-name'],
  },
  routes: qualityManifestJson.routes ?? [],
  menus: qualityManifestJson.menus ?? [],
  raw: qualityManifestJson,
});

registerManifest("engineering", {
  app: {
    id: engineeringManifestJson.app?.id ?? "engineering",
    basePath: engineeringManifestJson.app?.basePath ?? "/engineering",
    nameKey: engineeringManifestJson.app?.nameKey,
    'app-name': engineeringManifestJson.app?.['app-name'],
  },
  routes: engineeringManifestJson.routes ?? [],
  menus: engineeringManifestJson.menus ?? [],
  raw: engineeringManifestJson,
});

registerManifest("production", {
  app: {
    id: productionManifestJson.app?.id ?? "production",
    basePath: productionManifestJson.app?.basePath ?? "/production",
    nameKey: productionManifestJson.app?.nameKey,
    'app-name': productionManifestJson.app?.['app-name'],
  },
  routes: productionManifestJson.routes ?? [],
  menus: productionManifestJson.menus ?? [],
  raw: productionManifestJson,
});

registerManifest("finance", {
  app: {
    id: financeManifestJson.app?.id ?? "finance",
    basePath: financeManifestJson.app?.basePath ?? "/finance",
    nameKey: financeManifestJson.app?.nameKey,
    'app-name': financeManifestJson.app?.['app-name'],
  },
  routes: financeManifestJson.routes ?? [],
  menus: financeManifestJson.menus ?? [],
  raw: financeManifestJson,
});

registerManifest("operations", {
  app: {
    id: operationsManifestJson.app?.id ?? "operations",
    basePath: operationsManifestJson.app?.basePath ?? "/operations",
    nameKey: operationsManifestJson.app?.nameKey,
    'app-name': operationsManifestJson.app?.['app-name'],
  },
  routes: operationsManifestJson.routes ?? [],
  menus: operationsManifestJson.menus ?? [],
  raw: operationsManifestJson,
});

registerManifest("docs", {
  app: {
    id: docsManifestJson.app?.id ?? "docs",
    basePath: docsManifestJson.app?.basePath ?? "/docs",
    nameKey: docsManifestJson.app?.nameKey,
    'app-name': docsManifestJson.app?.['app-name'],
  },
  routes: docsManifestJson.routes ?? [],
  menus: docsManifestJson.menus ?? [],
  raw: docsManifestJson,
});

registerManifest("dashboard", {
  app: {
    id: dashboardManifestJson.app?.id ?? "dashboard",
    basePath: dashboardManifestJson.app?.basePath ?? "/dashboard",
    nameKey: dashboardManifestJson.app?.nameKey,
    'app-name': dashboardManifestJson.app?.['app-name'],
  },
  routes: dashboardManifestJson.routes ?? [],
  menus: dashboardManifestJson.menus ?? [],
  raw: dashboardManifestJson,
});

registerManifest("personnel", {
  app: {
    id: personnelManifestJson.app?.id ?? "personnel",
    basePath: personnelManifestJson.app?.basePath ?? "/personnel",
    nameKey: personnelManifestJson.app?.nameKey,
    'app-name': personnelManifestJson.app?.['app-name'],
  },
  routes: personnelManifestJson.routes ?? [],
  menus: personnelManifestJson.menus ?? [],
  raw: personnelManifestJson,
});

registerManifest("main", {
  app: {
    id: mainManifestJson.app?.id ?? "main",
    basePath: mainManifestJson.app?.basePath ?? "/",
    nameKey: mainManifestJson.app?.nameKey,
    'app-name': mainManifestJson.app?.['app-name'],
  },
  routes: mainManifestJson.routes ?? [],
  menus: mainManifestJson.menus ?? [],
  menuConfig: mainManifestJson.menuConfig, // 传递 menuConfig 用于概览页面
  raw: mainManifestJson,
});
