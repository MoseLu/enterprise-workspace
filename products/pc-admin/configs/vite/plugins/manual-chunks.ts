/**
 * manualChunks 策略配置
 * 定义代码分割策略，将不同类型的代码打包到不同的 chunk
 */

/**
 * 应用使用情况配置
 * 定义哪些应用使用哪些库，用于条件打包
 */
const APP_USAGE: Record<string, { echarts: boolean; monaco: boolean; three: boolean }> = {
  'layout-app': { echarts: true, monaco: false, three: false },
  'system-app': { echarts: true, monaco: false, three: false },
  'admin-app': { echarts: true, monaco: false, three: false },
  'finance-app': { echarts: true, monaco: false, three: false },
  'logistics-app': { echarts: true, monaco: false, three: false },
  'quality-app': { echarts: true, monaco: false, three: false },
  'production-app': { echarts: true, monaco: false, three: false },
  'engineering-app': { echarts: true, monaco: false, three: false },
  'monitor-app': { echarts: true, monaco: false, three: false },
};

/**
 * 判断是否为生产环境
 */
const isProduction = process.env.NODE_ENV === 'production';

/**
 * 创建 manualChunks 策略函数
 * @param appName 应用名称（用于过滤特定应用的 manifest）
 * @returns manualChunks 函数
 */
export function createManualChunksStrategy(appName: string) {
  const isLayoutApp = appName === 'layout-app';
  const isMainApp = appName === 'main-app';
  const appUsage = APP_USAGE[appName] || { echarts: false, monaco: false, three: false };
  // 生产环境且非 layout-app 时，共享资源不打包（从 layout-app 加载）
  // 但 main-app 作为主应用，需要生成自己的 EPS 服务
  const skipSharedResources = isProduction && !isLayoutApp && !isMainApp;

  return (id: string): string | undefined => {
    // 0. EPS 服务单独打包（所有应用共享，必须在最前面）
    if (id.includes('virtual:eps') ||
        id.includes('\\0virtual:eps') ||
        id.includes('services/eps') ||
        id.includes('services\\eps')) {
      // 关键：生产环境的子应用不应该再单独拆出 eps-service chunk
      // 否则子应用入口会产生对自身 /assets/eps-service-xxx.js 的引用，导致"共享未生效 + 404"风险。
      // layout-app 负责提供共享 eps-service，并将服务挂到 window.__APP_EPS_SERVICE__。
      // main-app 作为主应用，需要生成自己的 EPS 服务（独立运行时不依赖 layout-app）
      if (skipSharedResources) {
        return undefined;
      }
      return 'eps-service';
    }

    // 0.3. Auth API 单独打包（所有应用共享，由 system-app 提供）
    if (id.includes('modules/api-services/auth') ||
        id.includes('modules\\api-services\\auth') ||
        id.includes('api-services/auth')) {
      return 'auth-api';
    }

    // 关键：menuRegistry 依赖 Vue，必须和 vendor 一起打包，不能单独打包到 menu-registry
    // 这样确保 Vue 的 ref 在 menuRegistry 使用之前已经初始化
    // 必须在检查 layout-bridge 之前检查，因为 layout-bridge 会导入 menuRegistry
    if (id.includes('packages/shared-components/src/store/menuRegistry') ||
        id.includes('@btc/shared-components/store/menuRegistry') ||
        id.includes('shared-components/store/menuRegistry')) {
      // Layout-App：将 menuRegistry 打包到 vendor
      // 其他应用（生产环境）：不打包，从 layout-app 加载
      if (skipSharedResources) {
        return undefined;
      }
      return 'vendor';
    }
    
    // 0.5. 菜单相关代码单独打包
    // 关键：将菜单相关的代码打包到 menu-registry chunk，但 menuRegistry 本身依赖 Vue，需要放在 vendor 之后
    // 注意：menuRegistry 使用 Vue 的 ref，所以不能单独打包，应该和 vendor 一起
    // 只将 manifest 数据和 layout-bridge 打包到 menu-registry
    // 但 layout-bridge 会导入 menuRegistry，所以 layout-bridge 也应该打包到 vendor
    if (id.includes('configs/layout-bridge') ||
        id.includes('@btc/shared-core/configs/layout-bridge')) {
      // Layout-App：layout-bridge 导入 menuRegistry，所以也应该打包到 vendor
      // 其他应用（生产环境）：不打包，从 layout-app 加载
      if (skipSharedResources) {
        return undefined;
      }
      return 'vendor';
    }
    
    // 处理 subapp-manifests：只包含当前应用的 manifest
    if (id.includes('packages/subapp-manifests') || id.includes('@btc/subapp-manifests')) {
      // 排除其他应用的 manifest JSON 文件
      const otherApps = ['finance', 'logistics', 'system', 'quality', 'engineering', 'production', 'monitor', 'admin'];
      const currentAppName = appName.replace('-app', '');
      const shouldExclude = otherApps
        .filter(app => app !== currentAppName)
        .some(app => id.includes(`manifests/${app}.json`));
      
      if (shouldExclude) {
        // 其他应用的 manifest，不打包到 menu-registry
        return undefined;
      }
      // Layout-App：只打包当前应用的 manifest 和共享代码
      // 其他应用（生产环境）：不打包，从 layout-app 加载
      if (skipSharedResources) {
        return undefined;
      }
      return 'menu-registry';
    }

    // 1. 独立大库：ECharts（纯 echarts 和 zrender，不包含 vue-echarts）
    if (id.includes('node_modules/echarts') ||
        id.includes('node_modules/zrender')) {
      // Layout-App：正常打包
      // 其他应用：如果使用 echarts，生产环境不打包（从 layout-app 加载），开发环境正常打包
      if (skipSharedResources && appUsage.echarts) {
        return undefined;
      }
      // 如果应用不使用 echarts，不打包
      if (!appUsage.echarts) {
        return undefined;
      }
      return 'echarts-vendor';
    }

    // 2. 其他独立大库（完全独立）- 条件打包
    if (id.includes('node_modules/monaco-editor')) {
      // 只有使用的应用才打包
      if (!appUsage.monaco) {
        return undefined;
      }
      return 'lib-monaco';
    }
    if (id.includes('node_modules/three')) {
      // 只有使用的应用才打包
      if (!appUsage.three) {
        return undefined;
      }
      return 'lib-three';
    }

    // 3. Vue 生态库 + 所有依赖 Vue 的第三方库 + 共享组件库
    if (id.includes('node_modules/vue') ||
        id.includes('node_modules/vue-router') ||
        id.includes('node_modules/element-plus') ||
        id.includes('node_modules/pinia') ||
        id.includes('node_modules/@vueuse') ||
        id.includes('node_modules/@element-plus') ||
        id.includes('node_modules/vue-echarts') ||
        id.includes('node_modules/dayjs') ||
        id.includes('node_modules/lodash') ||
        id.includes('node_modules/@vue') ||
        id.includes('packages/shared-components') ||
        id.includes('packages/shared-core') ||
        id.includes('packages/shared-utils')) {
      // Layout-App：正常打包到 vendor
      // 其他应用（生产环境）：不打包，从 layout-app 加载
      if (skipSharedResources) {
        return undefined;
      }
      return 'vendor';
    }

    // 关键：确保 vite-plugin 相关代码也被打包到 vendor
    if (id.includes('packages/vite-plugin') || id.includes('@btc/vite-plugin')) {
      return 'vendor';
    }

    // 4. 所有其他业务代码合并到主文件
    return undefined; // 返回 undefined 表示合并到入口文件
  };
}

