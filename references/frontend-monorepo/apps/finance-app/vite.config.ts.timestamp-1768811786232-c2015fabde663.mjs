// vite.config.ts
import { defineConfig } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@24.10.1_sass@1.94.2/node_modules/vite/dist/node/index.js";
import { fileURLToPath as fileURLToPath6 } from "node:url";

// ../../configs/vite/factories/subapp.config.ts
import { resolve as resolve10, dirname as dirname4 } from "path";
import { fileURLToPath as fileURLToPath5 } from "node:url";
import { createRequire } from "module";
import vue from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue@5.0.0_vite@5.4.21_vue@3.5.26/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.2.0_vite@5.4.21_vue@3.5.26/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import qiankun from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite-plugin-qiankun@1.0.15_typescript@5.9.3_vite@5.4.21/node_modules/vite-plugin-qiankun/dist/index.js";
import UnoCSS from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unocss@66.5.9_postcss@8.5.6_vite@5.4.21/node_modules/unocss/dist/vite.mjs";
import { existsSync as existsSync8, readFileSync as readFileSync4 } from "node:fs";

// ../../configs/vite/utils/path-helpers.ts
import { resolve } from "path";
function createPathHelpers(appDir) {
  const withSrc = (relativePath) => resolve(appDir, relativePath);
  const withPackages = (relativePath) => resolve(appDir, "../../packages", relativePath);
  const withRoot = (relativePath) => resolve(appDir, "../..", relativePath);
  const withConfigs = (relativePath) => resolve(appDir, "../../configs", relativePath);
  return { withSrc, withPackages, withRoot, withConfigs };
}

// ../../configs/vite/factories/subapp.config.ts
import { pathToFileURL } from "node:url";

// ../../configs/auto-import.config.ts
import AutoImport from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unplugin-auto-import@20.3.0/node_modules/unplugin-auto-import/dist/vite.mjs";
import Components from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unplugin-vue-components@29.2.0_vue@3.5.26/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unplugin-vue-components@29.2.0_vue@3.5.26/node_modules/unplugin-vue-components/dist/resolvers.js";
function createAutoImportConfig() {
  return AutoImport({
    imports: [
      "vue",
      "vue-router",
      "pinia",
      {
        "@btc/shared-core": [
          "useCrud",
          "useDict",
          "usePermission",
          "useRequest",
          "createI18nPlugin",
          "useI18n"
        ],
        "@btc/shared-utils": [
          "formatDate",
          "formatDateTime",
          "formatMoney",
          "formatNumber",
          "isEmail",
          "isPhone",
          "storage"
        ]
      }
    ],
    resolvers: [
      ElementPlusResolver({
        importStyle: false
        // 禁用按需样式导入
      })
    ],
    dts: "src/auto-imports.d.ts",
    eslintrc: {
      enabled: true,
      filepath: "./.eslintrc-auto-import.json"
    },
    vueTemplate: true
  });
}
function createComponentsConfig(options = {}) {
  const { extraDirs = [], includeShared = true } = options;
  const dirs = [
    "src/components",
    // 应用级组件
    ...extraDirs
    // 额外的域级组件目录
  ];
  if (includeShared) {
    dirs.push(
      "../../packages/shared-components/src/components/basic",
      "../../packages/shared-components/src/components/layout",
      "../../packages/shared-components/src/components/navigation",
      "../../packages/shared-components/src/components/form",
      "../../packages/shared-components/src/components/data",
      "../../packages/shared-components/src/components/feedback",
      "../../packages/shared-components/src/components/others"
    );
  }
  return Components({
    resolvers: [
      ElementPlusResolver({
        importStyle: false
        // 禁用按需样式导入，避免 Vite reloading
      }),
      // 自定义解析器：@btc/shared-components
      (componentName) => {
        const convertToPascalCase = (name) => {
          if (name.startsWith("Btc")) {
            return name;
          }
          if (name.startsWith("btc-")) {
            return name.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
          }
          return name;
        };
        if (componentName.startsWith("Btc") || componentName.startsWith("btc-")) {
          const pascalName = convertToPascalCase(componentName);
          return {
            name: pascalName,
            from: "@btc/shared-components"
          };
        }
      }
    ],
    dts: "src/components.d.ts",
    dirs,
    extensions: ["vue", "tsx"],
    // 支持 .vue 和 .tsx 文件
    // 强制重新扫描组件
    deep: true,
    // 包含所有 Btc 开头的组件
    include: [/\.vue$/, /\.tsx$/, /Btc[A-Z]/, /btc-[a-z]/]
  });
}

// ../../configs/vite/factories/subapp.config.ts
import { btc, fixChunkReferencesPlugin } from "@btc/vite-plugin";

// ../../configs/vite-app-config.ts
import { resolve as resolve2 } from "path";

// ../../packages/shared-core/src/configs/app-env.config.ts
var MAIN_APP_CONFIG = {
  appName: "main-app",
  devHost: "10.80.8.199",
  devPort: "8080",
  preHost: "localhost",
  prePort: "4180",
  testHost: "test.bellis.com.cn",
  prodHost: "bellis.com.cn"
};
var BUSINESS_APP_CONFIGS = [
  {
    appName: "admin-app",
    devHost: "10.80.8.199",
    devPort: "8081",
    preHost: "localhost",
    prePort: "4181",
    testHost: "admin.test.bellis.com.cn",
    prodHost: "admin.bellis.com.cn"
  },
  {
    appName: "dashboard-app",
    devHost: "10.80.8.199",
    devPort: "8082",
    preHost: "localhost",
    prePort: "4182",
    testHost: "dashboard.test.bellis.com.cn",
    prodHost: "dashboard.bellis.com.cn"
  },
  {
    appName: "engineering-app",
    devHost: "10.80.8.199",
    devPort: "8083",
    preHost: "localhost",
    prePort: "4183",
    testHost: "engineering.test.bellis.com.cn",
    prodHost: "engineering.bellis.com.cn"
  },
  {
    appName: "finance-app",
    devHost: "10.80.8.199",
    devPort: "8084",
    preHost: "localhost",
    prePort: "4184",
    testHost: "finance.test.bellis.com.cn",
    prodHost: "finance.bellis.com.cn"
  },
  {
    appName: "logistics-app",
    devHost: "10.80.8.199",
    devPort: "8086",
    preHost: "localhost",
    prePort: "4186",
    testHost: "logistics.test.bellis.com.cn",
    prodHost: "logistics.bellis.com.cn"
  },
  {
    appName: "operations-app",
    devHost: "10.80.8.199",
    devPort: "8088",
    preHost: "localhost",
    prePort: "4188",
    testHost: "operations.test.bellis.com.cn",
    prodHost: "operations.bellis.com.cn"
  },
  {
    appName: "personnel-app",
    devHost: "10.80.8.199",
    devPort: "8089",
    preHost: "localhost",
    prePort: "4189",
    testHost: "personnel.test.bellis.com.cn",
    prodHost: "personnel.bellis.com.cn"
  },
  {
    appName: "production-app",
    devHost: "10.80.8.199",
    devPort: "8096",
    preHost: "localhost",
    prePort: "4190",
    testHost: "production.test.bellis.com.cn",
    prodHost: "production.bellis.com.cn"
  },
  {
    appName: "quality-app",
    devHost: "10.80.8.199",
    devPort: "8091",
    preHost: "localhost",
    prePort: "4191",
    testHost: "quality.test.bellis.com.cn",
    prodHost: "quality.bellis.com.cn"
  },
  {
    appName: "system-app",
    devHost: "10.80.8.199",
    devPort: "8092",
    preHost: "localhost",
    prePort: "4192",
    testHost: "system.test.bellis.com.cn",
    prodHost: "system.bellis.com.cn"
  }
];
var SPECIAL_APP_CONFIGS = [
  {
    appName: "docs-app",
    devHost: "localhost",
    devPort: "8093",
    preHost: "localhost",
    prePort: "4193",
    testHost: "docs.test.bellis.com.cn",
    prodHost: "docs.bellis.com.cn"
  },
  {
    appName: "home-app",
    devHost: "10.80.8.199",
    devPort: "8085",
    preHost: "localhost",
    prePort: "4185",
    testHost: "www.test.bellis.com.cn",
    prodHost: "www.bellis.com.cn"
  },
  {
    appName: "layout-app",
    devHost: "10.80.8.199",
    devPort: "8094",
    preHost: "localhost",
    prePort: "4194",
    testHost: "layout.test.bellis.com.cn",
    prodHost: "layout.bellis.com.cn"
  }
];
var APP_ENV_CONFIGS = [
  MAIN_APP_CONFIG,
  ...BUSINESS_APP_CONFIGS,
  ...SPECIAL_APP_CONFIGS
];
function getAppConfig(appName) {
  return APP_ENV_CONFIGS.find((config) => config.appName === appName);
}

// ../../configs/vite-app-config.ts
function getViteAppConfig(appName) {
  const appConfig = getAppConfig(appName);
  if (!appConfig) {
    throw new Error(`\u672A\u627E\u5230 ${appName} \u7684\u73AF\u5883\u914D\u7F6E`);
  }
  const mainAppConfig = getAppConfig("main-app");
  const mainAppOrigin = mainAppConfig ? `http://${mainAppConfig.preHost}:${mainAppConfig.prePort}` : "http://localhost:4180";
  return {
    devPort: parseInt(appConfig.devPort, 10),
    devHost: appConfig.devHost,
    prePort: parseInt(appConfig.prePort, 10),
    preHost: appConfig.preHost,
    prodHost: appConfig.prodHost,
    mainAppOrigin
  };
}
function getBaseUrl(appName, isPreviewBuild = false) {
  const appConfig = getAppConfig(appName);
  if (!appConfig) {
    throw new Error(`\u672A\u627E\u5230 ${appName} \u7684\u73AF\u5883\u914D\u7F6E`);
  }
  if (isPreviewBuild) {
    return `http://${appConfig.preHost}:${appConfig.prePort}/`;
  }
  return "/";
}
function getPublicDir(appName, appDir) {
  if (appName === "main-app" || appName === "admin-app" || appName === "system-app") {
    return resolve2(appDir, "public");
  }
  return resolve2(appDir, "../../packages/shared-components/public");
}

// ../../configs/vite/base.config.ts
import { resolve as resolve3 } from "path";
import { existsSync } from "fs";
function createBaseAliases(appDir, _appName) {
  const { withSrc, withRoot, withConfigs, withPackages } = createPathHelpers(appDir);
  const aliases = {
    "@": withSrc("src"),
    "@modules": withSrc("src/modules"),
    "@services": withSrc("src/services"),
    "@components": withSrc("src/components"),
    "@utils": withSrc("src/utils"),
    "@auth": withRoot("auth"),
    "@configs": withPackages("shared-core/src/configs"),
    "@btc/auth-shared": withRoot("auth/shared"),
    // @btc/* 包别名：所有应用都打包这些包，所以始终使用别名指向源码
    "@btc/shared-core": withPackages("shared-core/src"),
    "@btc/shared-components": withPackages("shared-components/src"),
    "@btc/shared-router": withPackages("shared-router/src"),
    // 向后兼容：废弃包的别名指向归并后的位置
    "@btc/shared-utils": withPackages("shared-core/src/utils"),
    "@btc/shared-plugins": withPackages("shared-components/src/plugins"),
    "@btc/i18n": withPackages("shared-components/src/i18n"),
    "@btc/subapp-manifests": withPackages("shared-core/src/manifest"),
    "@btc/env": withPackages("shared-core/src/env"),
    // shared-components 内部使用的别名（用于解析 shared-components 内部的导入）
    "@btc-common": withPackages("shared-components/src/common"),
    "@btc-components": withPackages("shared-components/src/components"),
    "@btc-crud": withPackages("shared-components/src/crud"),
    "@btc-styles": withPackages("shared-components/src/styles"),
    "@btc-locales": withPackages("shared-components/src/locales"),
    "@btc-assets": withPackages("shared-components/src/assets"),
    "@assets": withPackages("shared-components/src/assets"),
    // @assets 别名，用于图片资源导入
    "@btc-utils": withPackages("shared-components/src/utils"),
    "@plugins": withPackages("shared-components/src/plugins"),
    // 图表相关别名
    "@charts-utils/css-var": withPackages("shared-components/src/charts/utils/css-var"),
    "@charts-utils/color": withPackages("shared-components/src/charts/utils/color"),
    "@charts-utils/gradient": withPackages("shared-components/src/charts/utils/gradient"),
    "@charts-composables/useChartComponent": withPackages("shared-components/src/charts/composables/useChartComponent"),
    "@charts-types": withPackages("shared-components/src/charts/types"),
    "@charts-utils": withPackages("shared-components/src/charts/utils"),
    "@charts-composables": withPackages("shared-components/src/charts/composables"),
    // Element Plus 别名（始终使用）
    "element-plus/es": "element-plus/es",
    "element-plus/dist": "element-plus/dist"
  };
  return aliases;
}
function createBaseResolve(appDir, appName) {
  const { withPackages } = createPathHelpers(appDir);
  const aliases = createBaseAliases(appDir, appName);
  const aliasArray = [
    // 关键：将 util 映射到 npm 包，防止 Vite 将其视为 Node.js 内置模块并外部化
    // 需要查找 node_modules/util 的实际路径（可能在根目录或应用目录）
    {
      find: /^util$/,
      replacement: (() => {
        const appUtilPath = resolve3(appDir, "node_modules/util");
        if (existsSync(appUtilPath)) {
          return appUtilPath;
        }
        const rootUtilPath = resolve3(appDir, "../../node_modules/util");
        if (existsSync(rootUtilPath)) {
          return rootUtilPath;
        }
        return "util";
      })()
    },
    // locales 子路径别名（所有应用都使用别名指向源码）
    {
      find: "@btc/shared-core/locales/zh-CN",
      replacement: withPackages("shared-core/src/btc/plugins/i18n/locales/zh-CN")
    },
    {
      find: "@btc/shared-core/locales/en-US",
      replacement: withPackages("shared-core/src/btc/plugins/i18n/locales/en-US")
    },
    {
      find: "@btc/shared-components/locales/zh-CN.json",
      replacement: withPackages("shared-components/src/locales/zh-CN.json")
    },
    {
      find: "@btc/shared-components/locales/en-US.json",
      replacement: withPackages("shared-components/src/locales/en-US.json")
    },
    // 其他别名（从对象转换为数组形式）
    ...Object.entries(aliases).map(([find, replacement]) => ({
      find,
      replacement
    }))
  ];
  return {
    alias: aliasArray,
    dedupe: ["vue", "vue-router", "pinia", "element-plus", "@element-plus/icons-vue"],
    extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    // 确保 Vite 优先使用 package.json 的 exports 配置
    // 关键：添加 'development' 条件，确保在开发环境中使用源码
    conditions: ["development", "import", "module", "browser", "default"]
  };
}

// ../../configs/vite/plugins/manual-chunks.ts
var APP_USAGE = {
  "layout-app": { echarts: true, monaco: false, three: false },
  "system-app": { echarts: true, monaco: false, three: false },
  "admin-app": { echarts: true, monaco: false, three: false },
  "finance-app": { echarts: true, monaco: false, three: false },
  "logistics-app": { echarts: true, monaco: false, three: false },
  "quality-app": { echarts: true, monaco: false, three: false },
  "production-app": { echarts: true, monaco: false, three: false },
  "engineering-app": { echarts: true, monaco: false, three: false },
  "monitor-app": { echarts: true, monaco: false, three: false }
};
var isProduction = process.env.NODE_ENV === "production";
function createManualChunksStrategy(appName) {
  const isLayoutApp = appName === "layout-app";
  const isMainApp = appName === "main-app";
  const appUsage = APP_USAGE[appName] || { echarts: false, monaco: false, three: false };
  const skipSharedResources = isProduction && !isLayoutApp && !isMainApp;
  return (id) => {
    if (id.includes("virtual:eps") || id.includes("\\0virtual:eps") || id.includes("services/eps") || id.includes("services\\eps")) {
      if (skipSharedResources) {
        return void 0;
      }
      return "eps-service";
    }
    if (id.includes("modules/api-services/auth") || id.includes("modules\\api-services\\auth") || id.includes("api-services/auth")) {
      return "auth-api";
    }
    if (id.includes("packages/shared-components/src/store/menuRegistry") || id.includes("@btc/shared-components/store/menuRegistry") || id.includes("shared-components/store/menuRegistry")) {
      if (skipSharedResources) {
        return void 0;
      }
      return "vendor";
    }
    if (id.includes("configs/layout-bridge") || id.includes("@btc/shared-core/configs/layout-bridge")) {
      if (skipSharedResources) {
        return void 0;
      }
      return "vendor";
    }
    if (id.includes("packages/subapp-manifests") || id.includes("@btc/subapp-manifests")) {
      const otherApps = ["finance", "logistics", "system", "quality", "engineering", "production", "monitor", "admin"];
      const currentAppName = appName.replace("-app", "");
      const shouldExclude = otherApps.filter((app) => app !== currentAppName).some((app) => id.includes(`manifests/${app}.json`));
      if (shouldExclude) {
        return void 0;
      }
      if (skipSharedResources) {
        return void 0;
      }
      return "menu-registry";
    }
    if (id.includes("node_modules/echarts") || id.includes("node_modules/zrender")) {
      if (skipSharedResources && appUsage.echarts) {
        return void 0;
      }
      if (!appUsage.echarts) {
        return void 0;
      }
      return "echarts-vendor";
    }
    if (id.includes("node_modules/monaco-editor")) {
      if (!appUsage.monaco) {
        return void 0;
      }
      return "lib-monaco";
    }
    if (id.includes("node_modules/three")) {
      if (!appUsage.three) {
        return void 0;
      }
      return "lib-three";
    }
    if (id.includes("node_modules/vue") || id.includes("node_modules/vue-router") || id.includes("node_modules/element-plus") || id.includes("node_modules/pinia") || id.includes("node_modules/@vueuse") || id.includes("node_modules/@element-plus") || id.includes("node_modules/vue-echarts") || id.includes("node_modules/dayjs") || id.includes("node_modules/lodash") || id.includes("node_modules/@vue") || id.includes("packages/shared-components") || id.includes("packages/shared-core") || id.includes("packages/shared-utils")) {
      if (skipSharedResources) {
        return void 0;
      }
      return "vendor";
    }
    if (id.includes("packages/vite-plugin") || id.includes("@btc/vite-plugin")) {
      return "vendor";
    }
    return void 0;
  };
}

// ../../configs/vite/plugins/rollup-config.ts
function createRollupConfig(appName, options) {
  const manualChunks = createManualChunksStrategy(appName);
  const assetDir = options?.assetDir || "assets";
  const chunkDir = options?.chunkDir || assetDir;
  const _externalSingleSpa = options?.externalSingleSpa !== false;
  const externalBtcPackages = options?.externalBtcPackages === true;
  const externalConfigsPackages = options?.externalConfigsPackages !== false;
  const external = [
    // vite-plugin 是构建时插件，不应该被打包到运行时代码中
    "@btc/vite-plugin",
    /^@btc\/vite-plugin/,
    // @btc 包：根据配置决定是否标记为 external
    // 默认所有应用都打包这些库，避免运行时模块解析问题
    // 注意：CSS 文件不应该被标记为 external，应该被 Vite 处理并打包
    ...externalBtcPackages ? [
      "@btc/shared-components",
      // 匹配 JavaScript/TypeScript 模块，但不匹配 CSS 文件
      (id) => {
        if (id.startsWith("@btc/shared-components/")) {
          return !/\.(css|scss|sass|less|styl)$/i.test(id);
        }
        return false;
      },
      "@btc/shared-core",
      // 匹配 JavaScript/TypeScript 模块，但不匹配 CSS 文件
      (id) => {
        if (id.startsWith("@btc/shared-core/")) {
          return !/\.(css|scss|sass|less|styl)$/i.test(id);
        }
        return false;
      },
      "@btc/shared-utils",
      // 匹配 JavaScript/TypeScript 模块，但不匹配 CSS 文件
      (id) => {
        if (id.startsWith("@btc/shared-utils/")) {
          return !/\.(css|scss|sass|less|styl)$/i.test(id);
        }
        return false;
      }
    ] : [],
    // @btc/shared-core/configs 包：根据配置决定是否标记为 external
    // 主应用（main-app）应该打包这些库，子应用从 layout-app 加载
    ...externalConfigsPackages ? [
      "@btc/shared-core/configs/layout-bridge",
      "@btc/shared-core/configs/unified-env-config",
      "@btc/shared-core/configs/app-scanner",
      "@btc/shared-core/configs/app-env.config",
      /^@btc\/shared-core\/configs\/.*/
    ] : []
  ];
  return {
    preserveEntrySignatures: "strict",
    onwarn(warning, warn) {
      if (warning.code === "MODULE_LEVEL_DIRECTIVE" || warning.message && typeof warning.message === "string" && warning.message.includes("dynamically imported") && warning.message.includes("statically imported")) {
        return;
      }
      if (warning.message && typeof warning.message === "string" && warning.message.includes("Generated an empty chunk")) {
        return;
      }
      if (warning.code === "CIRCULAR_DEPENDENCY" || warning.message && typeof warning.message === "string" && (warning.message.includes("was reexported through module") || warning.message.includes("will end up in different chunks") || warning.message.includes("circular dependency"))) {
        return;
      }
      warn(warning);
    },
    output: {
      format: "esm",
      inlineDynamicImports: false,
      manualChunks,
      preserveModules: false,
      generatedCode: {
        constBindings: false,
        // 不使用 const，避免 TDZ 问题
        // 关键：保留导出名称，避免被压缩成单字母
        // 这可以防止 "does not provide an export named 'c'" 错误
        preserveModulesRoot: void 0,
        // 关键：确保对象属性之间有正确的分隔符，避免字符串和数字连接
        objectShorthand: false,
        // 禁用对象简写，确保属性名和值都完整
        arrowFunctions: false
        // 禁用箭头函数，使用普通函数，更安全
      },
      // 关键：确保导出名称不被压缩
      // 虽然 terser 的 mangle 已禁用，但 Rollup 的代码生成也可能压缩导出名称
      chunkFileNames: `${chunkDir}/[name]-[hash].js`,
      // 关键：入口文件使用稳定文件名（不带 hash），降低部署/缓存导致的 index-xxx.js 404 风险
      // Nginx 对该文件应配置 no-cache；其他 chunk 仍保持 hash + immutable
      entryFileNames: `${chunkDir}/[name].js`,
      assetFileNames: (assetInfo) => {
        if (assetInfo.name?.includes("favicon") || assetInfo.name?.includes("icons/")) {
          return assetInfo.name || `${assetDir}/[name].[ext]`;
        }
        if (assetInfo.name?.endsWith(".css")) {
          return `${assetDir}/[name]-[hash].css`;
        }
        return `${assetDir}/[name]-[hash].[ext]`;
      }
    },
    external
  };
}

// ../../configs/vite/plugins/clean.ts
import { resolve as resolve4 } from "path";
import { existsSync as existsSync2, rmSync } from "node:fs";
function safeLog(message) {
  try {
    console.info(message);
  } catch (error) {
    console.info(message.replace(/[^\x00-\x7F]/g, ""));
  }
}
function safeWarn(message) {
  try {
    console.warn(message);
  } catch (error) {
    console.warn(message.replace(/[^\x00-\x7F]/g, ""));
  }
}
function cleanDistPlugin(appDir) {
  return {
    name: "clean-dist-plugin",
    buildStart() {
      const distDir = resolve4(appDir, "dist");
      if (existsSync2(distDir)) {
        safeLog("[clean-dist-plugin] \u6E05\u7406\u65E7\u7684 dist \u76EE\u5F55...");
        let retries = 5;
        let success = false;
        while (retries > 0 && !success) {
          try {
            rmSync(distDir, { recursive: true, force: true });
            success = true;
            safeLog("[clean-dist-plugin] \u2705 dist \u76EE\u5F55\u5DF2\u6E05\u7406");
          } catch (error) {
            retries--;
            if (error.code === "EBUSY" || error.code === "ENOTEMPTY") {
              if (retries > 0) {
                const waitTime = (6 - retries) * 200;
                safeWarn(`[clean-dist-plugin] \u26A0\uFE0F  \u76EE\u5F55\u88AB\u5360\u7528\uFF0C\u7B49\u5F85 ${waitTime}ms \u540E\u91CD\u8BD5... (\u5269\u4F59 ${retries} \u6B21)`);
                const start = Date.now();
                while (Date.now() - start < waitTime) {
                }
              } else {
                safeWarn("[clean-dist-plugin] \u274C \u65E0\u6CD5\u6E05\u7406 dist \u76EE\u5F55\uFF08\u53EF\u80FD\u88AB\u5176\u4ED6\u7A0B\u5E8F\u5360\u7528\uFF09");
                safeWarn("[clean-dist-plugin] \u63D0\u793A\uFF1A\u8BF7\u5173\u95ED\u53EF\u80FD\u5360\u7528\u6587\u4EF6\u7684\u7A0B\u5E8F\uFF08\u5982\u6587\u4EF6\u8D44\u6E90\u7BA1\u7406\u5668\u3001\u7F16\u8F91\u5668\u7B49\uFF09");
                safeWarn("[clean-dist-plugin] \u6216\u8005\u624B\u52A8\u5220\u9664 dist \u76EE\u5F55\u540E\u91CD\u65B0\u6784\u5EFA");
                safeWarn("[clean-dist-plugin] \u6784\u5EFA\u5C06\u7EE7\u7EED\uFF0C\u4F46\u65E7\u7684\u6784\u5EFA\u4EA7\u7269\u4E0D\u4F1A\u88AB\u6E05\u7406\uFF0C\u53EF\u80FD\u5BFC\u81F4\u91CD\u590D\u6587\u4EF6");
                success = true;
              }
            } else if (error.code === "ENOENT") {
              success = true;
            } else {
              safeWarn("[clean-dist-plugin] \u6E05\u7406 dist \u76EE\u5F55\u5931\u8D25: " + error.message);
              safeWarn("[clean-dist-plugin] \u6784\u5EFA\u5C06\u7EE7\u7EED\uFF0C\u4F46\u65E7\u7684\u6784\u5EFA\u4EA7\u7269\u4E0D\u4F1A\u88AB\u6E05\u7406");
              success = true;
            }
          }
        }
      } else {
        safeLog("[clean-dist-plugin] dist \u76EE\u5F55\u4E0D\u5B58\u5728\uFF0C\u65E0\u9700\u6E05\u7406");
      }
    }
  };
}

// ../../configs/vite/plugins/chunk.ts
function chunkVerifyPlugin() {
  return {
    name: "chunk-verify-plugin",
    writeBundle(_options, bundle) {
      console.info("\n[chunk-verify-plugin] \u2705 \u751F\u6210\u7684\u6240\u6709 chunk \u6587\u4EF6\uFF1A");
      const jsChunks = Object.keys(bundle).filter((file) => file.endsWith(".js"));
      const cssChunks = Object.keys(bundle).filter((file) => file.endsWith(".css"));
      console.info(`
JS chunk\uFF08\u5171 ${jsChunks.length} \u4E2A\uFF09\uFF1A`);
      jsChunks.forEach((chunk) => console.info(`  - ${chunk}`));
      console.info(`
CSS chunk\uFF08\u5171 ${cssChunks.length} \u4E2A\uFF09\uFF1A`);
      cssChunks.forEach((chunk) => console.info(`  - ${chunk}`));
      const indexChunk = jsChunks.find((jsChunk) => jsChunk.includes("index-"));
      const indexSize = indexChunk ? bundle[indexChunk]?.code?.length || 0 : 0;
      const indexSizeKB = indexSize / 1024;
      const indexSizeMB = indexSizeKB / 1024;
      const missingRequiredChunks = [];
      if (!indexChunk) {
        missingRequiredChunks.push("index");
      }
      const hasEpsService = jsChunks.some((jsChunk) => jsChunk.includes("eps-service"));
      const hasAuthApi = jsChunks.some((jsChunk) => jsChunk.includes("auth-api"));
      const hasEchartsVendor = jsChunks.some((jsChunk) => jsChunk.includes("echarts-vendor"));
      const hasLibMonaco = jsChunks.some((jsChunk) => jsChunk.includes("lib-monaco"));
      const hasLibThree = jsChunks.some((jsChunk) => jsChunk.includes("lib-three"));
      console.info(`
[chunk-verify-plugin] \u{1F4E6} \u6784\u5EFA\u60C5\u51B5\uFF08\u5E73\u8861\u62C6\u5206\u7B56\u7565\uFF09\uFF1A`);
      if (indexChunk) {
        console.info(`  \u2705 index: \u4E3B\u6587\u4EF6\uFF08Vue\u751F\u6001 + Element Plus + \u4E1A\u52A1\u4EE3\u7801\uFF0C\u4F53\u79EF~${indexSizeMB.toFixed(2)}MB \u672A\u538B\u7F29\uFF0Cgzip\u540E~${(indexSizeMB * 0.3).toFixed(2)}MB\uFF09`);
      } else {
        console.info(`  \u274C \u5165\u53E3\u6587\u4EF6\u4E0D\u5B58\u5728`);
      }
      if (hasEpsService) console.info(`  \u2705 eps-service: EPS \u670D\u52A1\uFF08\u6240\u6709\u5E94\u7528\u5171\u4EAB\uFF0C\u5355\u72EC\u6253\u5305\uFF09`);
      if (hasAuthApi) console.info(`  \u2705 auth-api: Auth API\uFF08\u6240\u6709\u5E94\u7528\u5171\u4EAB\uFF0C\u5355\u72EC\u6253\u5305\uFF0C\u7531 system-app \u63D0\u4F9B\uFF09`);
      if (hasEchartsVendor) console.info(`  \u2705 echarts-vendor: ECharts + zrender\uFF08\u72EC\u7ACB\u5927\u5E93\uFF0C\u65E0\u4F9D\u8D56\u95EE\u9898\uFF09`);
      if (hasLibMonaco) console.info(`  \u2705 lib-monaco: Monaco Editor\uFF08\u72EC\u7ACB\u5927\u5E93\uFF09`);
      if (hasLibThree) console.info(`  \u2705 lib-three: Three.js\uFF08\u72EC\u7ACB\u5927\u5E93\uFF09`);
      console.info(`  \u2139\uFE0F  \u4E1A\u52A1\u4EE3\u7801\u548C Vue \u751F\u6001\u5408\u5E76\u5230\u4E3B\u6587\u4EF6\uFF0C\u907F\u514D\u521D\u59CB\u5316\u987A\u5E8F\u95EE\u9898`);
      if (missingRequiredChunks.length > 0) {
        console.error(`
[chunk-verify-plugin] \u274C \u7F3A\u5931\u6838\u5FC3 chunk\uFF1A`, missingRequiredChunks);
        throw new Error(`\u6838\u5FC3 chunk \u7F3A\u5931\uFF0C\u6784\u5EFA\u5931\u8D25\uFF01`);
      } else {
        console.info(`
[chunk-verify-plugin] \u2705 \u6838\u5FC3 chunk \u5168\u90E8\u5B58\u5728`);
      }
      console.info("\n[chunk-verify-plugin] \u{1F50D} \u9A8C\u8BC1\u8D44\u6E90\u5F15\u7528\u4E00\u81F4\u6027...");
      const allChunkFiles = /* @__PURE__ */ new Set([...jsChunks, ...cssChunks]);
      const referencedFiles = /* @__PURE__ */ new Map();
      const missingFiles = [];
      for (const [fileName, chunk] of Object.entries(bundle)) {
        const chunkAny = chunk;
        if (chunkAny.type === "chunk" && chunkAny.code) {
          const codeWithoutComments = chunkAny.code.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
          const importPattern = /import\s*\(\s*["'](\/?assets\/[^"'`\s]+\.(js|mjs|css))["']\s*\)/g;
          let match;
          while ((match = importPattern.exec(codeWithoutComments)) !== null) {
            const resourcePath = match[1];
            if (!resourcePath) continue;
            const resourceFile = resourcePath.replace(/^\/?assets\//, "assets/");
            if (!referencedFiles.has(resourceFile)) {
              referencedFiles.set(resourceFile, []);
            }
            referencedFiles.get(resourceFile).push(fileName);
          }
          const urlPattern = /new\s+URL\s*\(\s*["'](\/?assets\/[^"'`\s]+\.(js|mjs|css))["']/g;
          while ((match = urlPattern.exec(codeWithoutComments)) !== null) {
            const resourcePath = match[1];
            if (!resourcePath) continue;
            const resourceFile = resourcePath.replace(/^\/?assets\//, "assets/");
            if (!referencedFiles.has(resourceFile)) {
              referencedFiles.set(resourceFile, []);
            }
            referencedFiles.get(resourceFile).push(fileName);
          }
        }
      }
      for (const [referencedFile, referencedBy] of referencedFiles.entries()) {
        const fileName = referencedFile.replace(/^assets\//, "");
        let exists = allChunkFiles.has(fileName);
        let possibleMatches = [];
        if (!exists) {
          const match = fileName.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
          if (match) {
            const [, namePrefix, , ext] = match;
            possibleMatches = Array.from(allChunkFiles).filter((chunkFile) => {
              const chunkMatch = chunkFile.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
              if (chunkMatch) {
                const [, chunkNamePrefix, , chunkExt] = chunkMatch;
                return chunkNamePrefix === namePrefix && chunkExt === ext;
              }
              return false;
            });
            exists = possibleMatches.length > 0;
          }
        }
        if (!exists) {
          missingFiles.push({ file: referencedFile, referencedBy, possibleMatches });
        }
      }
      if (missingFiles.length > 0) {
        console.error(`
[chunk-verify-plugin] \u274C \u53D1\u73B0 ${missingFiles.length} \u4E2A\u5F15\u7528\u7684\u8D44\u6E90\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A`);
        if (missingFiles.length <= 5) {
          console.warn(`
[chunk-verify-plugin] \u26A0\uFE0F  \u8B66\u544A\uFF1A\u53D1\u73B0 ${missingFiles.length} \u4E2A\u5F15\u7528\u7684\u8D44\u6E90\u6587\u4EF6\u4E0D\u5B58\u5728\uFF0C\u4F46\u7EE7\u7EED\u6784\u5EFA`);
        } else {
          throw new Error(`\u8D44\u6E90\u5F15\u7528\u4E0D\u4E00\u81F4\uFF0C\u6784\u5EFA\u5931\u8D25\uFF01\u6709 ${missingFiles.length} \u4E2A\u5F15\u7528\u7684\u6587\u4EF6\u4E0D\u5B58\u5728`);
        }
      } else {
        console.info(`
[chunk-verify-plugin] \u2705 \u6240\u6709\u8D44\u6E90\u5F15\u7528\u90FD\u6B63\u786E\uFF08\u5171\u9A8C\u8BC1 ${referencedFiles.size} \u4E2A\u5F15\u7528\uFF09`);
      }
    }
  };
}
function optimizeChunksPlugin() {
  return {
    name: "optimize-chunks",
    generateBundle(_options, bundle) {
      const emptyChunks = [];
      const chunkReferences = /* @__PURE__ */ new Map();
      for (const [fileName, chunk] of Object.entries(bundle)) {
        const chunkAny = chunk;
        if (chunkAny.type === "chunk" && chunkAny.code && chunkAny.code.trim().length === 0) {
          emptyChunks.push(fileName);
        }
        if (chunkAny.type === "chunk" && chunkAny.imports) {
          for (const imported of chunkAny.imports) {
            if (!chunkReferences.has(imported)) {
              chunkReferences.set(imported, []);
            }
            chunkReferences.get(imported).push(fileName);
          }
        }
      }
      if (emptyChunks.length === 0) {
        return;
      }
      const chunksToRemove = [];
      const chunksToKeep = [];
      for (const emptyChunk of emptyChunks) {
        const referencedBy = chunkReferences.get(emptyChunk) || [];
        if (referencedBy.length > 0) {
          const chunk = bundle[emptyChunk];
          if (chunk && chunk.type === "chunk") {
            chunk.code = "export {}";
            chunksToKeep.push(emptyChunk);
            console.info(`[optimize-chunks] \u4FDD\u7559\u88AB\u5F15\u7528\u7684\u7A7A chunk: ${emptyChunk} (\u88AB ${referencedBy.length} \u4E2A chunk \u5F15\u7528\uFF0C\u5DF2\u6DFB\u52A0\u5360\u4F4D\u7B26)`);
          }
        } else {
          chunksToRemove.push(emptyChunk);
          delete bundle[emptyChunk];
        }
      }
      if (chunksToRemove.length > 0) {
        console.info(`[optimize-chunks] \u79FB\u9664\u4E86 ${chunksToRemove.length} \u4E2A\u672A\u88AB\u5F15\u7528\u7684\u7A7A chunk:`, chunksToRemove);
      }
      if (chunksToKeep.length > 0) {
        console.info(`[optimize-chunks] \u4FDD\u7559\u4E86 ${chunksToKeep.length} \u4E2A\u88AB\u5F15\u7528\u7684\u7A7A chunk\uFF08\u5DF2\u6DFB\u52A0\u5360\u4F4D\u7B26\uFF09:`, chunksToKeep);
      }
    }
  };
}

// ../../configs/vite/plugins/url.ts
import { existsSync as existsSync3, readFileSync } from "node:fs";
import { resolve as resolvePath, dirname } from "node:path";
import { fileURLToPath } from "node:url";
var __vite_injected_original_import_meta_url = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/plugins/url.ts";
var __filename = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname = dirname(__filename);
function getBuildTimestampForQuery() {
  if (process.env.BTC_BUILD_TIMESTAMP) {
    return process.env.BTC_BUILD_TIMESTAMP;
  }
  const timestampFile = resolvePath(__dirname, "../../../.build-timestamp");
  if (existsSync3(timestampFile)) {
    try {
      const ts = readFileSync(timestampFile, "utf-8").trim();
      if (ts) return ts;
    } catch {
    }
  }
  return Date.now().toString(36);
}
function ensureBaseUrlPlugin(baseUrl, appHost, appPort, mainAppPort) {
  const isPreviewBuild = baseUrl.startsWith("http");
  const qiankunIndexImportRegex = /import\((['"])\/assets\/(index|main)-([^'"]+)\1\)/g;
  const buildTimestamp = getBuildTimestampForQuery();
  const qiankunIndexImportInHtmlRegex = /import\(\s*(['"])(\/assets\/(index|main)-[^'"]+)\1\s*\)/g;
  function patchQiankunIndexImports(code) {
    if (!qiankunIndexImportRegex.test(code)) {
      return { code, modified: false };
    }
    qiankunIndexImportRegex.lastIndex = 0;
    const helperName = "__btcQiankunAssetOrigin";
    const tsName = "__btcBuildV";
    const helperDecl = `const ${helperName}=(()=>{try{const p=window&&window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;if(p&&typeof p==='string'){const s=p.replace(/\\/$/,'');if(s.startsWith('http')||s.startsWith('//'))return s;return (window.location&&window.location.origin?window.location.origin:'')+s;}}catch{}return (window.location&&window.location.origin)?window.location.origin:'';})();`;
    const tsDecl = `const ${tsName}='${buildTimestamp}';`;
    let newCode = code.replace(qiankunIndexImportRegex, (_m, _q, _kind, rest) => {
      return `import(/* @vite-ignore */ (${helperName} + '/assets/${_kind}-${rest}' + '?v=' + ${tsName}))`;
    });
    if (!newCode.includes(helperDecl)) {
      newCode = `${tsDecl}
${helperDecl}
${newCode}`;
    }
    return { code: newCode, modified: true };
  }
  return {
    name: "ensure-base-url",
    renderChunk(code, chunk, _options) {
      let newCode = code;
      let modified = false;
      {
        const patched = patchQiankunIndexImports(newCode);
        if (patched.modified) {
          newCode = patched.code;
          modified = true;
        }
      }
      if (isPreviewBuild) {
        const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)(\?[^"'`\s]*)?/g;
        if (relativePathRegex.test(newCode)) {
          newCode = newCode.replace(relativePathRegex, (_match, quote, path, query = "") => {
            return `${quote}${baseUrl.replace(/\/$/, "")}${path}${query}`;
          });
          modified = true;
        }
      }
      const wrongPortHttpRegex = new RegExp(`http://(${appHost}|localhost):${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g");
      if (wrongPortHttpRegex.test(newCode)) {
        newCode = newCode.replace(wrongPortHttpRegex, (_match, host, path, query = "") => {
          if (isPreviewBuild) {
            return `${baseUrl.replace(/\/$/, "")}${path}${query}`;
          }
          return `http://${host}:${appPort}${path}${query}`;
        });
        modified = true;
      }
      const wrongPortProtocolRegex = new RegExp(`//(${appHost}|localhost):${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g");
      if (wrongPortProtocolRegex.test(newCode)) {
        newCode = newCode.replace(wrongPortProtocolRegex, (_match, host, path, query = "") => {
          if (isPreviewBuild) {
            return `${baseUrl.replace(/\/$/, "")}${path}${query}`;
          }
          return `//${host}:${appPort}${path}${query}`;
        });
        modified = true;
      }
      const patterns = [
        {
          regex: new RegExp(`(http://)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g"),
          replacement: (_match, protocol, _host, path, query = "") => {
            return `${protocol}${appHost}:${appPort}${path}${query}`;
          }
        },
        {
          regex: new RegExp(`(//)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g"),
          replacement: (_match, protocol, _host, path, query = "") => {
            return `${protocol}${appHost}:${appPort}${path}${query}`;
          }
        },
        {
          regex: new RegExp(`(["'\`])(http://)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g"),
          replacement: (_match, quote, protocol, _host, path, query = "") => {
            return `${quote}${protocol}${appHost}:${appPort}${path}${query}`;
          }
        },
        {
          regex: new RegExp(`(["'\`])(//)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g"),
          replacement: (_match, quote, protocol, _host, path, query = "") => {
            return `${quote}${protocol}${appHost}:${appPort}${path}${query}`;
          }
        }
      ];
      for (const pattern of patterns) {
        if (pattern.regex.test(newCode)) {
          newCode = newCode.replace(pattern.regex, pattern.replacement);
          modified = true;
        }
      }
      if (modified) {
        console.info(`[ensure-base-url] \u4FEE\u590D\u4E86 ${chunk.fileName} \u4E2D\u7684\u8D44\u6E90\u8DEF\u5F84 (${mainAppPort} -> ${appPort})`);
        return {
          code: newCode,
          map: null
        };
      }
      return null;
    },
    generateBundle(_options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        const c = chunk;
        if (c.type === "chunk" && c.code) {
          let newCode = c.code;
          let modified = false;
          {
            const patched = patchQiankunIndexImports(newCode);
            if (patched.modified) {
              newCode = patched.code;
              modified = true;
            }
          }
          if (isPreviewBuild) {
            const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)(\?[^"'`\s]*)?/g;
            if (relativePathRegex.test(newCode)) {
              newCode = newCode.replace(relativePathRegex, (_match, quote, path, query = "") => {
                return `${quote}${baseUrl.replace(/\/$/, "")}${path}${query}`;
              });
              modified = true;
            }
          }
          const wrongPortHttpRegex = new RegExp(`http://(${appHost}|localhost):${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g");
          if (wrongPortHttpRegex.test(newCode)) {
            newCode = newCode.replace(wrongPortHttpRegex, (_match, host, path, query = "") => {
              if (isPreviewBuild) {
                return `${baseUrl.replace(/\/$/, "")}${path}${query}`;
              }
              return `http://${host}:${appPort}${path}${query}`;
            });
            modified = true;
          }
          const wrongPortProtocolRegex = new RegExp(`//(${appHost}|localhost):${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, "g");
          if (wrongPortProtocolRegex.test(newCode)) {
            newCode = newCode.replace(wrongPortProtocolRegex, (_match, host, path, query = "") => {
              if (isPreviewBuild) {
                return `${baseUrl.replace(/\/$/, "")}${path}${query}`;
              }
              return `//${host}:${appPort}${path}${query}`;
            });
            modified = true;
          }
          if (modified) {
            chunk.code = newCode;
            console.info(`[ensure-base-url] \u5728 generateBundle \u4E2D\u4FEE\u590D\u4E86 ${fileName} \u4E2D\u7684\u8D44\u6E90\u8DEF\u5F84`);
          }
        } else if (c.type === "asset" && fileName === "index.html") {
          let htmlContent = c.source;
          let htmlModified = false;
          const relativeAssetRegex = /(href|src)=["'](\.\/assets\/[^"']+)(\?[^"']*)?["']/g;
          if (relativeAssetRegex.test(htmlContent)) {
            htmlContent = htmlContent.replace(relativeAssetRegex, (_match, attr, path, query = "") => {
              const absolutePath = path.replace(/^\./, "");
              htmlModified = true;
              console.info(`[ensure-base-url] \u4FEE\u590D\u76F8\u5BF9\u8DEF\u5F84: ${path} -> ${absolutePath}`);
              return `${attr}="${absolutePath}${query}"`;
            });
          }
          if (qiankunIndexImportInHtmlRegex.test(htmlContent)) {
            qiankunIndexImportInHtmlRegex.lastIndex = 0;
            const originExpr = `((typeof __INJECTED_PUBLIC_PATH_BY_QIANKUN__!=='undefined'&&__INJECTED_PUBLIC_PATH_BY_QIANKUN__)?new URL(__INJECTED_PUBLIC_PATH_BY_QIANKUN__,(typeof location!=='undefined'&&location.origin)||'').origin:((typeof location!=='undefined'&&location.origin)||''))`;
            htmlContent = htmlContent.replace(qiankunIndexImportInHtmlRegex, (_m, _q, absPath) => {
              htmlModified = true;
              return `import(/* @vite-ignore */ (${originExpr} + '${absPath}' + '?v=${buildTimestamp}'))`;
            });
            console.info(`[ensure-base-url] \u4FEE\u590D index.html \u5185\u8054 import(/assets/index-*.js) \u5E76\u8FFD\u52A0 v=${buildTimestamp}`);
          }
          const rootJsRegex = /(href|src)=["'](\/([^/]+\.(js|mjs)))(\?[^"']*)?["']/g;
          if (rootJsRegex.test(htmlContent)) {
            const matches = htmlContent.match(rootJsRegex);
            if (matches) {
              console.warn(`[ensure-base-url] \u26A0\uFE0F  \u68C0\u6D4B\u5230\u6839\u76EE\u5F55\u8D44\u6E90\u8DEF\u5F84\uFF0C\u8FD9\u901A\u5E38\u4E0D\u5E94\u8BE5\u51FA\u73B0\u3002\u8BF7\u68C0\u67E5 Vite \u914D\u7F6E\uFF08base, assetsDir, rollupOptions.output.chunkFileNames\uFF09:`, matches);
              htmlContent = htmlContent.replace(rootJsRegex, (_match, attr, path, fileName2, _ext, query = "") => {
                if (!path.startsWith("/assets/") && !path.startsWith("/favicon") && !path.startsWith("/logo") && !path.match(/\.(png|jpg|jpeg|gif|svg|ico|json)$/)) {
                  const newPath = `/assets/${fileName2}`;
                  htmlModified = true;
                  console.info(`[ensure-base-url] \u4FEE\u590D\u6839\u76EE\u5F55\u8D44\u6E90\u8DEF\u5F84\uFF08\u515C\u5E95\uFF09: ${path} -> ${newPath}`);
                  return `${attr}="${newPath}${query}"`;
                }
                return _match;
              });
            }
          }
          const rootCssRegex = /(href|src)=["'](\/([^/]+\.css))(\?[^"']*)?["']/g;
          if (rootCssRegex.test(htmlContent)) {
            const matches = htmlContent.match(rootCssRegex);
            if (matches) {
              console.warn(`[ensure-base-url] \u26A0\uFE0F  \u68C0\u6D4B\u5230\u6839\u76EE\u5F55 CSS \u8DEF\u5F84\uFF0C\u8FD9\u901A\u5E38\u4E0D\u5E94\u8BE5\u51FA\u73B0\u3002\u8BF7\u68C0\u67E5 Vite \u914D\u7F6E:`, matches);
              htmlContent = htmlContent.replace(rootCssRegex, (_match, attr, path, fileName2, query = "") => {
                if (!path.startsWith("/assets/")) {
                  const newPath = `/assets/${fileName2}`;
                  htmlModified = true;
                  console.info(`[ensure-base-url] \u4FEE\u590D\u6839\u76EE\u5F55 CSS \u8DEF\u5F84\uFF08\u515C\u5E95\uFF09: ${path} -> ${newPath}`);
                  return `${attr}="${newPath}${query}"`;
                }
                return _match;
              });
            }
          }
          if (htmlModified) {
            chunk.source = htmlContent;
            console.info(`[ensure-base-url] \u4FEE\u590D\u4E86 index.html \u4E2D\u7684\u8D44\u6E90\u8DEF\u5F84`);
          }
        }
      }
    }
  };
}

// ../../configs/vite/plugins/cors.ts
function corsPlugin() {
  const corsDevMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id");
      res.setHeader("Access-Control-Allow-Private-Network", "true");
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id");
      res.setHeader("Access-Control-Allow-Private-Network", "true");
    }
    if (req.method === "OPTIONS") {
      res.statusCode = 200;
      res.setHeader("Access-Control-Max-Age", "86400");
      res.setHeader("Content-Length", "0");
      res.end();
      return;
    }
    next();
  };
  const corsPreviewMiddleware = (req, res, next) => {
    if (req.method === "OPTIONS") {
      const origin2 = req.headers.origin;
      if (origin2) {
        res.setHeader("Access-Control-Allow-Origin", origin2);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id");
      } else {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id");
      }
      res.statusCode = 200;
      res.setHeader("Access-Control-Max-Age", "86400");
      res.setHeader("Content-Length", "0");
      res.end();
      return;
    }
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id");
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id");
    }
    next();
  };
  return {
    name: "cors-with-credentials",
    enforce: "pre",
    configureServer(server) {
      const stack = server.middlewares.stack;
      if (Array.isArray(stack)) {
        const filteredStack = stack.filter(
          (item) => item.handle !== corsDevMiddleware && item.handle !== corsPreviewMiddleware
        );
        server.middlewares.stack = [
          { route: "", handle: corsDevMiddleware },
          ...filteredStack
        ];
      } else {
        server.middlewares.use(corsDevMiddleware);
      }
    },
    configurePreviewServer(server) {
      const stack = server.middlewares.stack;
      if (Array.isArray(stack)) {
        const filteredStack = stack.filter(
          (item) => item.handle !== corsDevMiddleware && item.handle !== corsPreviewMiddleware
        );
        server.middlewares.stack = [
          { route: "", handle: corsPreviewMiddleware },
          ...filteredStack
        ];
      } else {
        server.middlewares.use(corsPreviewMiddleware);
      }
    }
  };
}

// ../../configs/vite/plugins/css.ts
function ensureCssPlugin() {
  return {
    name: "ensure-css-plugin",
    generateBundle(_options, bundle) {
      const jsFiles = Object.keys(bundle).filter((file) => file.endsWith(".js"));
      let hasInlineCss = false;
      const suspiciousFiles = [];
      jsFiles.forEach((file) => {
        const chunk = bundle[file];
        if (chunk && chunk.code && typeof chunk.code === "string") {
          const code = chunk.code;
          const isModulePreload = code.includes("modulepreload") || code.includes("relList");
          if (isModulePreload) return;
          const isKnownLibrary = file.includes("vue-core") || file.includes("element-plus") || file.includes("vendor") || file.includes("vue-i18n") || file.includes("vue-router") || file.includes("lib-echarts") || file.includes("module-") || file.includes("app-composables") || file.includes("app-pages");
          if (isKnownLibrary) return;
          const hasStyleElementCreation = /document\.createElement\(['"]style['"]\)/.test(code) && /\.(textContent|innerHTML)\s*=/.test(code) && /\{[^}]{10,}\}/.test(code);
          const hasInsertStyleWithCss = /insertStyle\s*\(/.test(code) && /text\/css/.test(code) && /\{[^}]{20,}\}/.test(code);
          const styleTagMatch = code.match(/<style[^>]*>/);
          const hasStyleTagWithContent = styleTagMatch && !styleTagMatch[0].includes("'") && !styleTagMatch[0].includes('"') && /\{[^}]{20,}\}/.test(code);
          const hasInlineCssString = /['"`][^'"`]{50,}:\s*[^'"`]{10,};\s*[^'"`]{10,}['"`]/.test(code) && /(color|background|width|height|margin|padding|border|display|position|flex|grid)/.test(code);
          if (hasStyleElementCreation || hasInsertStyleWithCss || hasStyleTagWithContent || hasInlineCssString) {
            hasInlineCss = true;
            suspiciousFiles.push(file);
            const patterns = [];
            if (hasStyleElementCreation) patterns.push("\u52A8\u6001\u521B\u5EFA style \u5143\u7D20");
            if (hasInsertStyleWithCss) patterns.push("insertStyle \u51FD\u6570");
            if (hasStyleTagWithContent) patterns.push("<style> \u6807\u7B7E");
            if (hasInlineCssString) patterns.push("\u5185\u8054 CSS \u5B57\u7B26\u4E32");
            console.warn(`[ensure-css-plugin] \u26A0\uFE0F \u8B66\u544A\uFF1A\u5728 ${file} \u4E2D\u68C0\u6D4B\u5230\u53EF\u80FD\u7684\u5185\u8054 CSS\uFF08\u6A21\u5F0F\uFF1A${patterns.join(", ")}\uFF09`);
          }
        }
      });
      if (hasInlineCss) {
        console.warn("[ensure-css-plugin] \u26A0\uFE0F \u8B66\u544A\uFF1A\u68C0\u6D4B\u5230 CSS \u53EF\u80FD\u88AB\u5185\u8054\u5230 JS \u4E2D\uFF0C\u8FD9\u4F1A\u5BFC\u81F4 qiankun \u65E0\u6CD5\u6B63\u786E\u52A0\u8F7D\u6837\u5F0F");
        console.warn(`[ensure-css-plugin] \u53EF\u7591\u6587\u4EF6\uFF1A${suspiciousFiles.join(", ")}`);
        console.warn("[ensure-css-plugin] \u8BF7\u68C0\u67E5 vite-plugin-qiankun \u914D\u7F6E\u548C build.assetsInlineLimit \u8BBE\u7F6E");
      }
    },
    writeBundle(_options, bundle) {
      const cssFiles = Object.keys(bundle).filter((file) => file.endsWith(".css"));
      if (cssFiles.length === 0) {
        console.error("[ensure-css-plugin] \u274C \u9519\u8BEF\uFF1A\u6784\u5EFA\u4EA7\u7269\u4E2D\u65E0 CSS \u6587\u4EF6\uFF01");
        console.error("[ensure-css-plugin] \u8BF7\u68C0\u67E5\uFF1A");
        console.error("1. \u5165\u53E3\u6587\u4EF6\u662F\u5426\u9759\u6001\u5BFC\u5165\u5168\u5C40\u6837\u5F0F\uFF08index.css/uno.css/element-plus.css\uFF09");
        console.error("2. \u662F\u5426\u6709 Vue \u7EC4\u4EF6\u4E2D\u4F7F\u7528 <style> \u6807\u7B7E");
        console.error("3. UnoCSS \u914D\u7F6E\u662F\u5426\u6B63\u786E\uFF0C\u662F\u5426\u5BFC\u5165 @unocss all");
        console.error("4. vite-plugin-qiankun \u7684 useDevMode \u662F\u5426\u5728\u751F\u4EA7\u73AF\u5883\u6B63\u786E\u5173\u95ED");
        console.error("5. build.assetsInlineLimit \u662F\u5426\u8BBE\u7F6E\u4E3A 0\uFF08\u7981\u6B62\u5185\u8054\uFF09");
      } else {
        console.info(`[ensure-css-plugin] \u2705 \u6210\u529F\u6253\u5305 ${cssFiles.length} \u4E2A CSS \u6587\u4EF6\uFF1A`, cssFiles);
        cssFiles.forEach((file) => {
          const asset = bundle[file];
          if (asset && asset.source) {
            const sizeKB = (asset.source.length / 1024).toFixed(2);
            console.info(`  - ${file}: ${sizeKB}KB`);
          } else if (asset && asset.fileName) {
            console.info(`  - ${asset.fileName || file}`);
          }
        });
      }
    }
  };
}

// ../../configs/vite/plugins/version.ts
import { existsSync as existsSync4, readFileSync as readFileSync2, writeFileSync } from "node:fs";
import { resolve as resolve5, dirname as dirname2 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
var __vite_injected_original_import_meta_url2 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/plugins/version.ts";
var __filename2 = fileURLToPath2(__vite_injected_original_import_meta_url2);
var __dirname2 = dirname2(__filename2);
function getBuildTimestamp() {
  if (process.env.BTC_BUILD_TIMESTAMP) {
    return process.env.BTC_BUILD_TIMESTAMP;
  }
  const timestampFile = resolve5(__dirname2, "../../../.build-timestamp");
  if (existsSync4(timestampFile)) {
    try {
      const timestamp2 = readFileSync2(timestampFile, "utf-8").trim();
      if (timestamp2) {
        return timestamp2;
      }
    } catch (error) {
    }
  }
  const timestamp = Date.now().toString(36);
  try {
    writeFileSync(timestampFile, timestamp, "utf-8");
  } catch (error) {
  }
  return timestamp;
}
function addVersionPlugin() {
  const buildTimestamp = getBuildTimestamp();
  return {
    name: "add-version",
    apply: "build",
    buildStart() {
      console.info(`[add-version] \u6784\u5EFA\u65F6\u95F4\u6233\u7248\u672C\u53F7: ${buildTimestamp}`);
    },
    // 关键：使用 transformIndexHtml（Vite 内部是在后置阶段生成/写入 index.html，generateBundle 很容易拿不到最终 HTML）
    transformIndexHtml: {
      order: "post",
      handler(html) {
        let newHtml = html;
        let modified = false;
        const emptyStyleRegex = /<style>\s*<\/style>/gi;
        if (emptyStyleRegex.test(newHtml)) {
          newHtml = newHtml.replace(emptyStyleRegex, "");
          modified = true;
        }
        newHtml = newHtml.replace(
          /(<script[^>]*\s+src=["'])([^"']+)(["'][^>]*>)/g,
          (match, prefix, src, suffix) => {
            const isModuleScript = /type\s*=\s*["']module["']/i.test(match);
            const isAssets = src.startsWith("/assets/") || src.startsWith("./assets/");
            if (isModuleScript && isAssets) {
              const cleaned = src.replace(/[?&]v=[^&'"]*/g, "").replace(/\?&/, "?").replace(/[?&]$/, "");
              if (cleaned !== src) {
                modified = true;
                return `${prefix}${cleaned}${suffix}`;
              }
              return match;
            }
            if (src.includes("?v=") || src.includes("&v=")) {
              const updated = src.replace(/[?&]v=[^&'"]*/g, `?v=${buildTimestamp}`);
              if (updated !== src) {
                modified = true;
                return `${prefix}${updated}${suffix}`;
              }
              return match;
            }
            if (isAssets) {
              modified = true;
              const sep = src.includes("?") ? "&" : "?";
              return `${prefix}${src}${sep}v=${buildTimestamp}${suffix}`;
            }
            return match;
          }
        );
        newHtml = newHtml.replace(
          /(<link[^>]*\s+href=["'])([^"']+)(["'][^>]*>)/g,
          (match, prefix, href, suffix) => {
            const isModulePreload = /\srel\s*=\s*["']modulepreload["']/i.test(match);
            const isAssets = href.startsWith("/assets/") || href.startsWith("./assets/");
            if (isModulePreload && isAssets) {
              const cleaned = href.replace(/[?&]v=[^&'"]*/g, "").replace(/\?&/, "?").replace(/[?&]$/, "");
              if (cleaned !== href) {
                modified = true;
                return `${prefix}${cleaned}${suffix}`;
              }
              return match;
            }
            if (href.includes("?v=") || href.includes("&v=")) {
              const updated = href.replace(/[?&]v=[^&'"]*/g, `?v=${buildTimestamp}`);
              if (updated !== href) {
                modified = true;
                return `${prefix}${updated}${suffix}`;
              }
              return match;
            }
            if (isAssets) {
              modified = true;
              const sep = href.includes("?") ? "&" : "?";
              return `${prefix}${href}${sep}v=${buildTimestamp}${suffix}`;
            }
            return match;
          }
        );
        const originExpr = `((typeof __INJECTED_PUBLIC_PATH_BY_QIANKUN__!=='undefined'&&__INJECTED_PUBLIC_PATH_BY_QIANKUN__)?new URL(__INJECTED_PUBLIC_PATH_BY_QIANKUN__,(typeof location!=='undefined'&&location.origin)||'').origin:((typeof location!=='undefined'&&location.origin)||''))`;
        newHtml = newHtml.replace(
          /import\(\s*(['"])(\/assets\/(index|main)-[^'"]+)\1\s*\)/g,
          (_m, _q, absPath) => {
            modified = true;
            return `import(/* @vite-ignore */ (${originExpr} + '${absPath}'))`;
          }
        );
        if (modified) {
          console.info(`[add-version] \u5DF2\u4E3A index.html \u4E2D\u7684\u8D44\u6E90\u5F15\u7528\u6DFB\u52A0\u7248\u672C\u53F7: v=${buildTimestamp}`);
          return newHtml;
        }
        return html;
      }
    }
  };
}

// ../../configs/vite/plugins/resolve-logo.ts
import { resolve as resolve6, dirname as dirname3 } from "path";
import { existsSync as existsSync5, copyFileSync, mkdirSync } from "node:fs";
function resolveLogoPlugin(appDir) {
  let viteConfig = null;
  return {
    name: "resolve-logo",
    apply: "build",
    // 只在构建时执行
    configResolved(config) {
      viteConfig = config;
    },
    resolveId(id) {
      if (id === "/logo.png" || id === "logo.png") {
        const sharedLogoPath = resolve6(appDir, "../../packages/shared-components/public/logo.png");
        if (existsSync5(sharedLogoPath)) {
          return sharedLogoPath;
        }
        const appLogoPath = resolve6(appDir, "public/logo.png");
        if (existsSync5(appLogoPath)) {
          return appLogoPath;
        }
        return `\0logo.png`;
      }
      return null;
    },
    load(id) {
      if (id === "\0logo.png") {
        return "";
      }
      return null;
    },
    closeBundle() {
      try {
        if (!viteConfig) {
          return;
        }
        const root = viteConfig.root || appDir;
        const sharedLogoPath = resolve6(root, "../../packages/shared-components/public/logo.png");
        let logoSourcePath = null;
        if (existsSync5(sharedLogoPath)) {
          logoSourcePath = sharedLogoPath;
        } else {
          const appLogoPath = resolve6(root, "public/logo.png");
          if (existsSync5(appLogoPath)) {
            logoSourcePath = appLogoPath;
          }
        }
        if (!logoSourcePath) {
          return;
        }
        const outDir = viteConfig.build.outDir || "dist";
        const distDir = resolve6(root, outDir);
        if (!existsSync5(distDir)) {
          return;
        }
        const logoDestPath = resolve6(distDir, "logo.png");
        const destDir = dirname3(logoDestPath);
        if (!existsSync5(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }
        copyFileSync(logoSourcePath, logoDestPath);
      } catch (error) {
      }
    }
  };
}

// ../../configs/vite/plugins/upload-icons-to-oss.ts
import { resolve as resolve7 } from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
var __vite_injected_original_import_meta_url3 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/plugins/upload-icons-to-oss.ts";
var __filename3 = fileURLToPath3(__vite_injected_original_import_meta_url3);
var __dirname3 = resolve7(__filename3, "..");
var projectRoot = resolve7(__dirname3, "../../..");

// ../../configs/vite/plugins/replace-icons-with-cdn.ts
function replaceIconsWithCdnPlugin() {
  let isProductionBuild = false;
  let cachedLogoCdnOk = null;
  return {
    name: "replace-icons-with-cdn",
    apply: "build",
    // 只在构建时执行
    configResolved(config) {
      isProductionBuild = !!config.isProduction;
    },
    async transformIndexHtml(html) {
      if (!isProductionBuild) {
        return html;
      }
      try {
        const { getEnvConfig } = await import("file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/configs/unified-env-config.mjs");
        const envConfig = getEnvConfig();
        const cdnUrl = envConfig.cdn?.staticAssetsUrl;
        if (!cdnUrl) {
          return html;
        }
        const cdnBase = cdnUrl.replace(/\/$/, "");
        if (cachedLogoCdnOk === null) {
          try {
            const res = await fetch(`${cdnBase}/logo.png`, { method: "HEAD", redirect: "follow" });
            cachedLogoCdnOk = !!res.ok;
          } catch {
            cachedLogoCdnOk = false;
          }
        }
        let newHtml = html;
        if (cachedLogoCdnOk) {
          newHtml = newHtml.replace(
            /href=["']\/logo\.png["']/g,
            `href="${cdnBase}/logo.png"`
          );
        }
        newHtml = newHtml.replace(
          /href=["']\/icons\/([^"']+)["']/g,
          (match, iconFile) => {
            if (iconFile === "site.webmanifest") {
              return match;
            }
            return `href="${cdnBase}/icons/${iconFile}"`;
          }
        );
        return newHtml;
      } catch (error) {
        console.warn("[replace-icons-with-cdn] \u83B7\u53D6\u914D\u7F6E\u5931\u8D25\uFF0C\u4FDD\u6301\u539F\u56FE\u6807\u8DEF\u5F84:", error);
        return html;
      }
    }
  };
}

// ../../configs/vite/plugins/locales-static.ts
import { readFileSync as readFileSync3, existsSync as existsSync6 } from "fs";
import { resolve as resolve8 } from "path";
function localesStaticPlugin(appDir) {
  let viteConfig = null;
  const localesMiddleware = (req, res, next) => {
    if (req.method === "OPTIONS" && req.url?.match(/^\/src\/locales\/[^/]+\.json$/)) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.statusCode = 200;
      res.end();
      return;
    }
    if (req.method !== "GET" || !req.url || !req.url.match(/^\/src\/locales\/[^/]+\.json$/)) {
      next();
      return;
    }
    const filePath = req.url.replace(/^\//, "");
    const fullPath = resolve8(appDir, filePath);
    if (!existsSync6(fullPath)) {
      console.warn(`[locales-static] File not found: ${fullPath} (requested: ${req.url})`);
      next();
      return;
    }
    try {
      const content = readFileSync3(fullPath, "utf-8");
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.statusCode = 200;
      res.end(content);
    } catch (error) {
      console.warn(`[locales-static] Failed to read file: ${fullPath}`, error);
      next();
    }
  };
  return {
    name: "vite-plugin-locales-static",
    configResolved(config) {
      viteConfig = config;
    },
    configureServer(server) {
      server.middlewares.use(localesMiddleware);
    }
  };
}

// ../../configs/vite/plugins/upload-cdn.ts
import { spawn } from "child_process";
import { resolve as resolve9 } from "path";
import { fileURLToPath as fileURLToPath4 } from "url";
import { execSync } from "child_process";
var __vite_injected_original_import_meta_url4 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/plugins/upload-cdn.ts";
var __filename4 = fileURLToPath4(__vite_injected_original_import_meta_url4);
var __dirname4 = resolve9(__filename4, "..");
var projectRoot2 = resolve9(__dirname4, "../../..");
function tryLoadOssCredsFromWindowsCredentialManager() {
  if (process.platform !== "win32") return;
  if (process.env.OSS_ACCESS_KEY_ID && process.env.OSS_ACCESS_KEY_SECRET) return;
  try {
    const ps = [
      `$ErrorActionPreference='Stop'`,
      `Import-Module CredentialManager`,
      `$id=(Get-StoredCredential -Target 'AlibabaCloud' -ErrorAction SilentlyContinue).GetNetworkCredential().Password`,
      `$sec=(Get-StoredCredential -Target 'AlibabaCloudSecret' -ErrorAction SilentlyContinue).GetNetworkCredential().Password`,
      `$out=[pscustomobject]@{ id=$id; secret=$sec } | ConvertTo-Json -Compress`,
      `Write-Output $out`
    ].join("; ");
    const raw = execSync(`powershell -NoProfile -NonInteractive -Command "${ps.replace(/"/g, '\\"')}"`, {
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8"
    });
    const jsonText = (raw || "").trim();
    if (!jsonText) return;
    const parsed = JSON.parse(jsonText);
    if (parsed?.id && !process.env.OSS_ACCESS_KEY_ID) process.env.OSS_ACCESS_KEY_ID = parsed.id;
    if (parsed?.secret && !process.env.OSS_ACCESS_KEY_SECRET) process.env.OSS_ACCESS_KEY_SECRET = parsed.secret;
  } catch {
  }
}
function uploadCdnPlugin(appName, _appDir) {
  let isProductionBuild = false;
  return {
    name: "upload-cdn",
    apply: "build",
    // 只在构建时执行
    configResolved(config) {
      isProductionBuild = !!config.isProduction;
    },
    async closeBundle() {
      if (process.env.ENABLE_CDN_UPLOAD !== "true") {
        return;
      }
      if (process.env.SKIP_CDN_UPLOAD === "true") {
        console.info(`[upload-cdn] \u23ED\uFE0F  \u8DF3\u8FC7 ${appName} \u7684 CDN \u4E0A\u4F20\uFF08SKIP_CDN_UPLOAD=true\uFF09`);
        return;
      }
      if (!isProductionBuild) {
        return;
      }
      tryLoadOssCredsFromWindowsCredentialManager();
      if (!process.env.OSS_ACCESS_KEY_ID || !process.env.OSS_ACCESS_KEY_SECRET) {
        console.warn(`[upload-cdn] \u26A0\uFE0F  \u8DF3\u8FC7 ${appName} \u7684 CDN \u4E0A\u4F20\uFF08\u672A\u914D\u7F6E OSS \u51ED\u8BC1\uFF09`);
        return;
      }
      const uploadScript = resolve9(projectRoot2, "scripts/upload-app-to-cdn.mjs");
      console.info(`[upload-cdn] \u{1F680} \u5F00\u59CB\u4E0A\u4F20 ${appName} \u5230 CDN...`);
      await new Promise((resolvePromise, rejectPromise) => {
        const child = spawn("node", [uploadScript, appName], {
          stdio: "inherit",
          shell: true,
          env: {
            ...process.env
          }
        });
        child.on("error", (error) => {
          rejectPromise(error);
        });
        child.on("exit", (code) => {
          if (code === 0) {
            console.info(`[upload-cdn] \u2705 ${appName} \u4E0A\u4F20\u5B8C\u6210`);
            resolvePromise();
          } else {
            const strict = process.env.OSS_UPLOAD_STRICT === "true";
            const err = new Error(`[upload-cdn] ${appName} \u4E0A\u4F20\u811A\u672C\u9000\u51FA\uFF0C\u4EE3\u7801: ${code ?? "unknown"}`);
            if (strict) {
              rejectPromise(err);
            } else {
              console.warn(err.message);
              resolvePromise();
            }
          }
        });
      });
    }
  };
}

// ../../configs/vite/plugins/cdn-assets.ts
function cdnAssetsPlugin(options) {
  const {
    appName,
    // 关键：默认启用条件必须明确检查 ENABLE_CDN_ACCELERATION 环境变量
    // 如果 ENABLE_CDN_ACCELERATION 被设置为 'false'，则禁用 CDN
    // 只有在明确启用（ENABLE_CDN_ACCELERATION=true）或未设置且是生产构建时，才启用 CDN
    enabled = process.env.ENABLE_CDN_ACCELERATION === "true" || process.env.ENABLE_CDN_ACCELERATION !== "false" && process.env.NODE_ENV === "production" && process.env.VITE_PREVIEW !== "true",
    cdnDomain = "https://all.bellis.com.cn"
  } = options;
  return {
    name: "cdn-assets",
    apply: "build",
    buildStart() {
      if (enabled) {
        console.info(`[cdn-assets] CDN \u52A0\u901F\u5DF2\u542F\u7528\uFF0C\u5E94\u7528: ${appName}, CDN \u57DF\u540D: ${cdnDomain}`);
      } else {
        console.info(`[cdn-assets] CDN \u52A0\u901F\u5DF2\u7981\u7528`);
      }
    },
    transformIndexHtml: {
      order: "post",
      // 在 addVersionPlugin 之后执行
      handler(html) {
        const isPreviewBuild = process.env.VITE_PREVIEW === "true";
        const needsEarlyConverter = isPreviewBuild && !enabled;
        if (!enabled && !needsEarlyConverter) {
          return html;
        }
        let newHtml = html;
        let modified = false;
        if (enabled) {
          newHtml = newHtml.replace(
            /(<script[^>]*\s+src=["'])([^"']+)(["'][^>]*>)/g,
            (match, prefix, src, suffix) => {
              if (src.startsWith("/assets/") && !src.startsWith("/assets/layout/")) {
                const cdnUrl = `${cdnDomain}/${appName}${src}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
              if (src.startsWith("/assets/layout/")) {
                const cdnUrl = `${cdnDomain}/layout-app${src}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
              if (src.startsWith("./assets/") || src.startsWith("assets/")) {
                const normalizedPath = src.startsWith("./") ? src.substring(2) : src;
                if (normalizedPath.startsWith("assets/layout/")) {
                  const cdnUrl = `${cdnDomain}/layout-app/${normalizedPath}`;
                  modified = true;
                  return `${prefix}${cdnUrl}${suffix}`;
                } else if (normalizedPath.startsWith("assets/")) {
                  const cdnUrl = `${cdnDomain}/${appName}/${normalizedPath}`;
                  modified = true;
                  return `${prefix}${cdnUrl}${suffix}`;
                }
              }
              return match;
            }
          );
        }
        if (enabled) {
          newHtml = newHtml.replace(
            /(<link[^>]*\s+href=["'])([^"']+)(["'][^>]*>)/g,
            (match, prefix, href, suffix) => {
              if (href.startsWith("/assets/") && !href.startsWith("/assets/layout/")) {
                const cdnUrl = `${cdnDomain}/${appName}${href}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
              if (href.startsWith("/assets/layout/")) {
                const cdnUrl = `${cdnDomain}/layout-app${href}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
              if (href.startsWith("./assets/") || href.startsWith("assets/")) {
                const normalizedPath = href.startsWith("./") ? href.substring(2) : href;
                if (normalizedPath.startsWith("assets/layout/")) {
                  const cdnUrl = `${cdnDomain}/layout-app/${normalizedPath}`;
                  modified = true;
                  return `${prefix}${cdnUrl}${suffix}`;
                } else if (normalizedPath.startsWith("assets/")) {
                  const cdnUrl = `${cdnDomain}/${appName}/${normalizedPath}`;
                  modified = true;
                  return `${prefix}${cdnUrl}${suffix}`;
                }
              }
              return match;
            }
          );
        }
        if (enabled) {
          newHtml = newHtml.replace(
            /(<img[^>]*\s+src=["'])([^"']+)(["'][^>]*>)/g,
            (match, prefix, src, suffix) => {
              if (src.startsWith("/assets/") && !src.startsWith("/assets/layout/")) {
                const cdnUrl = `${cdnDomain}/${appName}${src}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
              if (src.startsWith("/assets/layout/")) {
                const cdnUrl = `${cdnDomain}/layout-app${src}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
              return match;
            }
          );
        }
        const originExpr = `((typeof __INJECTED_PUBLIC_PATH_BY_QIANKUN__!=='undefined'&&__INJECTED_PUBLIC_PATH_BY_QIANKUN__)?new URL(__INJECTED_PUBLIC_PATH_BY_QIANKUN__,(typeof location!=='undefined'&&location.origin)||'').origin:((typeof location!=='undefined'&&location.origin)||''))`;
        newHtml = newHtml.replace(
          /import\(\s*(['"])(\/assets\/(index|main)-[^'"]+)\1\s*\)/g,
          (_m, _q, absPath) => {
            modified = true;
            return `import(/* @vite-ignore */ (${originExpr} + '${absPath}'))`;
          }
        );
        if (!newHtml.includes("__BTC_RESOURCE_LOADER__") || needsEarlyConverter) {
          const cdnEnabled = process.env.ENABLE_CDN_ACCELERATION !== "false";
          const isPreviewBuild2 = process.env.VITE_PREVIEW === "true";
          const earlyUrlConverterScript = isPreviewBuild2 ? `
<script>
  (function() {
    // \u5173\u952E\uFF1A\u5728 HTML \u89E3\u6790\u4E4B\u524D\u5C31\u5904\u7406 CDN URL\uFF0C\u907F\u514D\u6D4F\u89C8\u5668\u8BF7\u6C42 CDN \u8D44\u6E90
    // \u8FD9\u4E2A\u811A\u672C\u5FC5\u987B\u5728\u6240\u6709\u5176\u4ED6 script \u548C link \u6807\u7B7E\u4E4B\u524D\u6267\u884C
    if (typeof document !== 'undefined') {
      const convertCdnUrl = (url) => {
        if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
          return url;
        }
        try {
          const urlObj = new URL(url);
          if (urlObj.hostname.includes('all.bellis.com.cn') || 
              urlObj.hostname.includes('bellis1.oss-cn-shenzhen.aliyuncs.com')) {
            // \u63D0\u53D6\u8DEF\u5F84\u90E8\u5206\uFF0C\u53BB\u6389\u5E94\u7528\u524D\u7F00
            let path = urlObj.pathname;
            if (path.includes('/assets/')) {
              path = path.substring(path.indexOf('/assets/'));
            } else if (path.includes('/assets/layout/')) {
              path = path.substring(path.indexOf('/assets/layout/'));
            }
            // \u4FDD\u7559\u67E5\u8BE2\u53C2\u6570\u548C\u54C8\u5E0C
            return path + (urlObj.search || '') + (urlObj.hash || '');
          }
        } catch (e) {
          // URL \u89E3\u6790\u5931\u8D25\uFF0C\u8FD4\u56DE\u539F URL
        }
        return url;
      };
      
      // \u62E6\u622A document.createElement\uFF0C\u5728\u521B\u5EFA script \u548C link \u6807\u7B7E\u65F6\u8F6C\u6362 URL
      const originalCreateElement = document.createElement.bind(document);
      document.createElement = function(tagName, options) {
        const element = originalCreateElement(tagName, options);
        if (tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'link') {
          const originalSetAttribute = element.setAttribute.bind(element);
          element.setAttribute = function(name, value) {
            if ((name === 'src' || name === 'href') && typeof value === 'string') {
              const convertedUrl = convertCdnUrl(value);
              return originalSetAttribute(name, convertedUrl);
            }
            return originalSetAttribute(name, value);
          };
        }
        return element;
      };
      
      // \u5904\u7406\u5DF2\u5B58\u5728\u7684 script \u548C link \u6807\u7B7E\uFF08\u5982\u679C DOM \u5DF2\u7ECF\u90E8\u5206\u89E3\u6790\uFF09
      const processExistingTags = () => {
        if (document.querySelectorAll) {
          document.querySelectorAll('script[src]').forEach((script) => {
            const src = script.getAttribute('src');
            if (src) {
              const convertedUrl = convertCdnUrl(src);
              if (convertedUrl !== src) {
                script.setAttribute('src', convertedUrl);
              }
            }
          });
          document.querySelectorAll('link[href]').forEach((link) => {
            const href = link.getAttribute('href');
            if (href) {
              const convertedUrl = convertCdnUrl(href);
              if (convertedUrl !== href) {
                link.setAttribute('href', convertedUrl);
              }
            }
          });
        }
      };
      
      // \u7ACB\u5373\u5904\u7406\uFF08\u5982\u679C DOM \u5DF2\u7ECF\u90E8\u5206\u89E3\u6790\uFF09
      if (document.readyState === 'loading' || document.readyState === 'interactive') {
        processExistingTags();
        // \u76D1\u542C DOM \u53D8\u5316\uFF0C\u5904\u7406\u540E\u7EED\u6DFB\u52A0\u7684\u6807\u7B7E
        if (document.addEventListener) {
          document.addEventListener('DOMContentLoaded', processExistingTags);
        }
      } else {
        processExistingTags();
      }
    }
  })();
</script>` : "";
          const loaderScript = `
<script>
  (function() {
    // \u8D44\u6E90\u52A0\u8F7D\u5668\u5C06\u5728\u8FD0\u884C\u65F6\u6A21\u5757\u4E2D\u521D\u59CB\u5316
    // \u8FD9\u91CC\u53EA\u8BBE\u7F6E\u57FA\u7840\u914D\u7F6E
    if (typeof window !== 'undefined') {
      window.__BTC_CDN_CONFIG__ = {
        appName: '${appName}',
        cdnDomain: '${cdnDomain}',
        ossDomain: 'https://bellis1.oss-cn-shenzhen.aliyuncs.com',
        enabled: ${cdnEnabled}
      };
    }
  })();
</script>`;
          if (newHtml.includes("</head>")) {
            if (earlyUrlConverterScript && newHtml.includes("<script")) {
              const firstTagMatch = newHtml.match(/<(script|link)[^>]*>/i);
              if (firstTagMatch && firstTagMatch.index !== void 0) {
                newHtml = newHtml.slice(0, firstTagMatch.index) + earlyUrlConverterScript + newHtml.slice(firstTagMatch.index);
                modified = true;
              } else {
                newHtml = newHtml.replace("</head>", `${earlyUrlConverterScript}
</head>`);
                modified = true;
              }
            }
            if (!newHtml.includes("__BTC_RESOURCE_LOADER__")) {
              newHtml = newHtml.replace("</head>", `${loaderScript}
</head>`);
              modified = true;
            }
          } else if (newHtml.includes("</body>")) {
            if (earlyUrlConverterScript) {
              newHtml = newHtml.replace("</body>", `${earlyUrlConverterScript}
</body>`);
              modified = true;
            }
            if (!newHtml.includes("__BTC_RESOURCE_LOADER__")) {
              newHtml = newHtml.replace("</body>", `${loaderScript}
</body>`);
              modified = true;
            }
          }
        }
        if (modified) {
          console.info(`[cdn-assets] \u5DF2\u4E3A index.html \u4E2D\u7684\u8D44\u6E90\u5F15\u7528\u8F6C\u6362\u4E3A CDN URL`);
        }
        return newHtml;
      }
    }
  };
}

// ../../configs/vite/plugins/cdn-import.ts
function cdnImportPlugin(options) {
  const {
    appName,
    // 关键：默认启用条件必须明确检查 ENABLE_CDN_ACCELERATION 环境变量
    // 如果 ENABLE_CDN_ACCELERATION 被设置为 'false'，则禁用 CDN
    // 只有在明确启用（ENABLE_CDN_ACCELERATION=true）或未设置且是生产构建时，才启用 CDN
    enabled = process.env.ENABLE_CDN_ACCELERATION === "true" || process.env.ENABLE_CDN_ACCELERATION !== "false" && process.env.NODE_ENV === "production" && process.env.VITE_PREVIEW !== "true",
    cdnDomain = "https://all.bellis.com.cn"
  } = options;
  return {
    name: "cdn-import",
    apply: "build",
    buildStart() {
      if (enabled) {
        console.info(`[cdn-import] CDN \u52A8\u6001\u5BFC\u5165\u8F6C\u6362\u5DF2\u542F\u7528\uFF0C\u5E94\u7528: ${appName}, CDN \u57DF\u540D: ${cdnDomain}`);
      } else {
        console.info(`[cdn-import] CDN \u52A8\u6001\u5BFC\u5165\u8F6C\u6362\u5DF2\u7981\u7528`);
      }
    },
    renderChunk(code, chunk) {
      if (!enabled) {
        return null;
      }
      if (!chunk.fileName.endsWith(".js")) {
        return null;
      }
      if (chunk.isEntry || chunk.fileName.match(/^index-[a-zA-Z0-9]+\.js$/)) {
        return null;
      }
      let modified = false;
      let newCode = code;
      const importPattern = /import\s*\(\s*(['"])([^'"]+)\1\s*\)/g;
      newCode = newCode.replace(importPattern, (match, quote, specifier) => {
        const isRelativePath = specifier.startsWith("./");
        const isAssetsPath = specifier.startsWith("/assets/");
        if (!isRelativePath && !isAssetsPath) {
          return match;
        }
        modified = true;
        let normalizedPath;
        if (isRelativePath) {
          if (specifier.startsWith("./assets/")) {
            normalizedPath = "/" + specifier.substring(2);
          } else {
            normalizedPath = "/assets/" + specifier.substring(2);
          }
        } else {
          normalizedPath = specifier;
        }
        const isLayoutResource = normalizedPath.includes("/assets/layout/");
        let cdnUrl;
        if (isLayoutResource) {
          cdnUrl = `${cdnDomain}/layout-app${normalizedPath}`;
        } else {
          cdnUrl = `${cdnDomain}/${appName}${normalizedPath}`;
        }
        return `import(${quote}${cdnUrl}${quote})`;
      });
      if (modified) {
        console.info(`[cdn-import] \u5DF2\u8F6C\u6362 chunk ${chunk.fileName} \u4E2D\u7684\u52A8\u6001\u5BFC\u5165\u4E3A CDN URL`);
      }
      return modified ? { code: newCode, map: null } : null;
    }
  };
}

// ../../configs/vite/plugins/resolve-btc-imports.ts
import { existsSync as existsSync7 } from "node:fs";
function resolveBtcImportsPlugin(options) {
  const { appDir, enabled = true } = options;
  if (!enabled) {
    return {
      name: "resolve-btc-imports",
      apply: "build"
    };
  }
  const { withPackages, withRoot, withConfigs } = createPathHelpers(appDir);
  function isFromBuiltPackageOrSharedComponents(importer) {
    if (!importer) return false;
    const isFromBuiltPackage = importer.includes("/dist/") || importer.includes("\\dist\\") || importer.endsWith(".mjs") && !importer.includes("/src/") || importer.endsWith(".js") && !importer.includes("/src/") && !importer.includes("node_modules");
    const isFromSharedComponents = importer.includes("shared-components/src");
    return isFromBuiltPackage || isFromSharedComponents;
  }
  function ensureFileExtension(filePath) {
    if (/\.(ts|tsx|js|jsx|vue|json|css|scss|sass|less)$/i.test(filePath)) {
      return filePath;
    }
    const extensions = [".tsx", ".ts", ".jsx", ".js"];
    for (const ext of extensions) {
      const pathWithExt = `${filePath}${ext}`;
      if (existsSync7(pathWithExt)) {
        return pathWithExt;
      }
    }
    return filePath;
  }
  function resolveSharedComponentsAlias(id) {
    const { withPackages: withPackages2 } = createPathHelpers(appDir);
    if (id === "@btc-components" || id.startsWith("@btc-components/")) {
      const subPath = id.replace("@btc-components/", "");
      const basePath = withPackages2(`shared-components/src/components/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@btc-common" || id.startsWith("@btc-common/")) {
      const subPath = id.replace("@btc-common/", "");
      const basePath = withPackages2(`shared-components/src/common/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@btc-crud" || id.startsWith("@btc-crud/")) {
      const subPath = id.replace("@btc-crud/", "");
      const basePath = withPackages2(`shared-components/src/crud/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@btc-styles" || id.startsWith("@btc-styles/")) {
      const subPath = id.replace("@btc-styles/", "");
      const basePath = withPackages2(`shared-components/src/styles/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@btc-locales" || id.startsWith("@btc-locales/")) {
      const subPath = id.replace("@btc-locales/", "");
      const basePath = withPackages2(`shared-components/src/locales/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@btc-assets" || id.startsWith("@btc-assets/")) {
      const subPath = id.replace("@btc-assets/", "");
      const basePath = withPackages2(`shared-components/src/assets/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@assets" || id.startsWith("@assets/")) {
      const subPath = id.replace("@assets/", "");
      const basePath = withPackages2(`shared-components/src/assets/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@btc-utils" || id.startsWith("@btc-utils/")) {
      const subPath = id.replace("@btc-utils/", "");
      const basePath = withPackages2(`shared-components/src/utils/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@plugins" || id.startsWith("@plugins/")) {
      const subPath = id.replace("@plugins/", "");
      const basePath = withPackages2(`shared-components/src/plugins/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@charts-utils/css-var" || id.startsWith("@charts-utils/css-var/")) {
      const subPath = id.replace("@charts-utils/css-var", "").replace(/^\//, "");
      const basePath = withPackages2(`shared-components/src/charts/utils/css-var${subPath ? "/" + subPath : ""}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@charts-utils/color" || id.startsWith("@charts-utils/color/")) {
      const subPath = id.replace("@charts-utils/color", "").replace(/^\//, "");
      const basePath = withPackages2(`shared-components/src/charts/utils/color${subPath ? "/" + subPath : ""}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@charts-utils/gradient" || id.startsWith("@charts-utils/gradient/")) {
      const subPath = id.replace("@charts-utils/gradient", "").replace(/^\//, "");
      const basePath = withPackages2(`shared-components/src/charts/utils/gradient${subPath ? "/" + subPath : ""}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@charts-composables/useChartComponent" || id.startsWith("@charts-composables/useChartComponent/")) {
      const subPath = id.replace("@charts-composables/useChartComponent", "").replace(/^\//, "");
      const basePath = withPackages2(`shared-components/src/charts/composables/useChartComponent${subPath ? "/" + subPath : ""}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@charts-types" || id.startsWith("@charts-types/")) {
      const subPath = id.replace("@charts-types/", "");
      const basePath = withPackages2(`shared-components/src/charts/types/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@charts-utils" || id.startsWith("@charts-utils/")) {
      const subPath = id.replace("@charts-utils/", "");
      const basePath = withPackages2(`shared-components/src/charts/utils/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@charts-composables" || id.startsWith("@charts-composables/")) {
      const subPath = id.replace("@charts-composables/", "");
      const basePath = withPackages2(`shared-components/src/charts/composables/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === "@charts" || id.startsWith("@charts/")) {
      const subPath = id.replace("@charts/", "");
      const basePath = withPackages2(`shared-components/src/charts/${subPath}`);
      return ensureFileExtension(basePath);
    }
    return null;
  }
  return {
    name: "resolve-btc-imports",
    apply: "build",
    buildStart() {
      console.info("[resolve-btc-imports] \u5DF2\u542F\u7528\uFF0C\u5C06\u89E3\u6790\u4ECE\u5DF2\u6784\u5EFA\u5305\u4E2D\u5BFC\u5165\u7684 @btc/* \u6A21\u5757\u548C shared-components \u5185\u90E8\u522B\u540D");
    },
    resolveId(id, importer) {
      const shouldResolve = isFromBuiltPackageOrSharedComponents(importer);
      if (!shouldResolve) {
        return null;
      }
      const sharedComponentsAlias = resolveSharedComponentsAlias(id);
      if (sharedComponentsAlias) {
        console.info(`[resolve-btc-imports] \u89E3\u6790 shared-components \u5185\u90E8\u522B\u540D ${id} (\u6765\u81EA ${importer?.split("/").slice(-2).join("/") || "unknown"}) -> ${sharedComponentsAlias.split("/").slice(-3).join("/")}`);
        return sharedComponentsAlias;
      }
      if (id.startsWith("@configs/")) {
        const subPath = id.replace("@configs/", "");
        const sourcePath = withConfigs(subPath);
        const finalPath = ensureFileExtension(sourcePath);
        console.info(`[resolve-btc-imports] \u89E3\u6790 @configs \u5305 ${id} (\u6765\u81EA\u5DF2\u6784\u5EFA\u5305 ${importer?.split("/").slice(-2).join("/") || "unknown"}) -> ${finalPath.split("/").slice(-3).join("/")}`);
        return finalPath;
      }
      if (!id.startsWith("@btc/")) {
        return null;
      }
      if (id === "@btc/shared-components" || id.startsWith("@btc/shared-components/")) {
        const sourcePath = id === "@btc/shared-components" ? withPackages("shared-components/src/index.ts") : withPackages(`shared-components/src/${id.replace("@btc/shared-components/", "")}`);
        console.info(`[resolve-btc-imports] \u89E3\u6790 ${id} (\u6765\u81EA\u5DF2\u6784\u5EFA\u5305 ${importer?.split("/").slice(-2).join("/") || "unknown"}) -> ${sourcePath.split("/").slice(-3).join("/")}`);
        return sourcePath;
      }
      if (id === "@btc/shared-core" || id.startsWith("@btc/shared-core/")) {
        const sourcePath = id === "@btc/shared-core" ? withPackages("shared-core/src/index.ts") : withPackages(`shared-core/src/${id.replace("@btc/shared-core/", "")}`);
        console.info(`[resolve-btc-imports] \u89E3\u6790 ${id} (\u6765\u81EA\u5DF2\u6784\u5EFA\u5305 ${importer?.split("/").slice(-2).join("/") || "unknown"}) -> ${sourcePath.split("/").slice(-3).join("/")}`);
        return sourcePath;
      }
      if (id === "@btc/shared-utils" || id.startsWith("@btc/shared-utils/")) {
        const sourcePath = id === "@btc/shared-utils" ? withPackages("shared-utils/src/index.ts") : withPackages(`shared-utils/src/${id.replace("@btc/shared-utils/", "")}`);
        console.info(`[resolve-btc-imports] \u89E3\u6790 ${id} (\u6765\u81EA\u5DF2\u6784\u5EFA\u5305 ${importer?.split("/").slice(-2).join("/") || "unknown"}) -> ${sourcePath.split("/").slice(-3).join("/")}`);
        return sourcePath;
      }
      if (id === "@btc/shared-plugins" || id.startsWith("@btc/shared-plugins/")) {
        const sourcePath = id === "@btc/shared-plugins" ? withPackages("shared-plugins/src/index.ts") : withPackages(`shared-plugins/src/${id.replace("@btc/shared-plugins/", "")}`);
        console.info(`[resolve-btc-imports] \u89E3\u6790 ${id} (\u6765\u81EA\u5DF2\u6784\u5EFA\u5305 ${importer?.split("/").slice(-2).join("/") || "unknown"}) -> ${sourcePath.split("/").slice(-3).join("/")}`);
        return ensureFileExtension(sourcePath);
      }
      if (id === "@btc/i18n" || id.startsWith("@btc/i18n/")) {
        const sourcePath = id === "@btc/i18n" ? withPackages("i18n/src/index.ts") : withPackages(`i18n/src/${id.replace("@btc/i18n/", "")}`);
        console.info(`[resolve-btc-imports] \u89E3\u6790 ${id} (\u6765\u81EA\u5DF2\u6784\u5EFA\u5305 ${importer?.split("/").slice(-2).join("/") || "unknown"}) -> ${sourcePath.split("/").slice(-3).join("/")}`);
        return ensureFileExtension(sourcePath);
      }
      if (id === "@btc/auth-shared" || id.startsWith("@btc/auth-shared/")) {
        let sourcePath;
        if (id === "@btc/auth-shared") {
          sourcePath = withRoot("auth/shared/composables/index.ts");
        } else {
          const subPath = id.replace("@btc/auth-shared/", "");
          sourcePath = withRoot(`auth/shared/${subPath}${subPath.includes(".") ? "" : ".ts"}`);
        }
        console.info(`[resolve-btc-imports] \u89E3\u6790 ${id} (\u6765\u81EA\u5DF2\u6784\u5EFA\u5305 ${importer?.split("/").slice(-2).join("/") || "unknown"}) -> ${sourcePath.split("/").slice(-3).join("/")}`);
        return sourcePath;
      }
      return null;
    }
  };
}

// ../../configs/vite/factories/subapp.config.ts
var __vite_injected_original_import_meta_url5 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/factories/subapp.config.ts";
var __filename5 = fileURLToPath5(__vite_injected_original_import_meta_url5);
var __dirname5 = dirname4(__filename5);
function getVueI18nPlugin(appDir) {
  const appDirUrl = pathToFileURL(resolve10(appDir, "package.json")).href;
  const require2 = createRequire(appDirUrl);
  const plugin = require2("@intlify/unplugin-vue-i18n/vite");
  return plugin.default || plugin;
}
function createSubAppViteConfig(options) {
  const {
    appName,
    appDir,
    qiankunName,
    customPlugins = [],
    customBuild,
    customServer,
    customPreview,
    customOptimizeDeps,
    customCss,
    proxy: proxy2 = {},
    btcOptions = {},
    vueI18nOptions,
    qiankunOptions = { useDevMode: true }
  } = options;
  const appConfig = getViteAppConfig(appName);
  const { withRoot } = createPathHelpers(appDir);
  const isPreviewBuild = process.env.VITE_PREVIEW === "true";
  const baseUrl = getBaseUrl(appName, isPreviewBuild);
  const publicDir = isPreviewBuild ? getPublicDir(appName, appDir) : false;
  const mainAppConfig = getViteAppConfig("main-app");
  const mainAppPort = mainAppConfig.prePort.toString();
  const epsOutputDir = resolve10(appDir, "build", "eps");
  const sharedEpsDir = resolve10(appDir, "../../apps/main-app/build/eps");
  const epsEnable = btcOptions.eps?.enable ?? true;
  const epsConfig = {
    enable: epsEnable,
    dict: btcOptions.eps?.dict ?? true,
    // 默认启用字典功能
    dictApi: btcOptions.eps?.dictApi || "/api/system/auth/dict",
    // 默认字典接口
    dist: epsOutputDir,
    sharedEpsDir
  };
  const plugins = [
    // 1. 清理插件
    cleanDistPlugin(appDir),
    // 2. CORS 插件
    corsPlugin(),
    // 3. 解析 @btc/* 包导入插件（在 Logo 插件之前，确保能够解析从已构建包中导入的 @btc/* 模块）
    resolveBtcImportsPlugin({ appDir }),
    // 4. Logo 路径解析插件（在自定义插件之前，确保 /logo.png 能被正确解析）
    resolveLogoPlugin(appDir),
    // 4.5. Locales 静态文件插件（提供 src/locales/*.json 文件，供主应用通过 fetch 加载）
    localesStaticPlugin(appDir),
    // 5. 自定义插件（在核心插件之前）
    ...customPlugins,
    // 4. Vue 插件
    vue({
      script: {
        fs: {
          fileExists: existsSync8,
          readFile: (file) => readFileSync4(file, "utf-8")
        }
      }
    }),
    // 4.5. Vue JSX 插件（支持 TSX 文件中的 JSX 语法）
    vueJsx(),
    // 5. 自动导入插件
    createAutoImportConfig(),
    // 6. 组件自动注册插件
    createComponentsConfig({ includeShared: true }),
    // 7. UnoCSS 插件
    UnoCSS({
      configFile: withRoot("uno.config.ts")
    }),
    // 8. BTC 业务插件
    btc({
      type: "subapp",
      proxy: proxy2,
      eps: epsConfig,
      // 类型断言：确保 enable 始终为 boolean
      svg: {
        skipNames: ["base", "icons"],
        ...btcOptions.svg
      },
      ...btcOptions
    }),
    // 9. VueI18n 插件
    getVueI18nPlugin(appDir)({
      include: vueI18nOptions?.include || [
        resolve10(appDir, "src/locales/**")
      ],
      runtimeOnly: vueI18nOptions?.runtimeOnly ?? true
    }),
    // 10. CSS 验证插件
    ensureCssPlugin(),
    // 11. Qiankun 插件
    qiankun(qiankunName, qiankunOptions),
    // 12. 修复 chunk 引用插件
    fixChunkReferencesPlugin(),
    // 15. 确保 base URL 插件
    ensureBaseUrlPlugin(baseUrl, appConfig.devHost, appConfig.prePort, mainAppPort),
    // 16. 添加版本号插件（为 HTML 资源引用添加时间戳版本号）
    addVersionPlugin(),
    // 16.5. CDN 资源加速插件（在版本号插件之后，确保版本号参数被保留）
    // 处理 HTML 中的资源 URL（<script>、<link>、<img> 等）
    cdnAssetsPlugin({
      appName,
      enabled: !isPreviewBuild && process.env.ENABLE_CDN_ACCELERATION !== "false"
    }),
    // 16.6. CDN 动态导入转换插件（转换代码中的 import() 调用）
    // 将相对路径转换为 CDN URL，与 cdnAssetsPlugin 配合实现完整的 CDN 加速
    cdnImportPlugin({
      appName,
      enabled: !isPreviewBuild && process.env.ENABLE_CDN_ACCELERATION !== "false"
    }),
    // 16.7. 替换图标路径为 CDN URL（生产环境）
    replaceIconsWithCdnPlugin(),
    // 注意：不再需要 resolveExternalImportsPlugin，因为所有应用都打包 @btc/* 包
    // 17. 优化 chunks 插件
    optimizeChunksPlugin(),
    // 18. Chunk 验证插件
    chunkVerifyPlugin(),
    // 19. CDN 上传插件（仅在生产构建且启用时）
    ...process.env.ENABLE_CDN_UPLOAD === "true" && !isPreviewBuild ? [uploadCdnPlugin(appName, appDir)] : []
  ];
  const buildConfig = {
    target: "es2020",
    sourcemap: false,
    cssCodeSplit: false,
    cssMinify: true,
    // 关键：禁用代码压缩，避免 Terser 压缩导致的对象属性分隔符丢失问题
    minify: false,
    // 关键：禁止资源内联，确保 CSS 被提取到独立文件中（qiankun 要求）
    // 与 layout-app 保持一致，避免内联 CSS 导致样式丢失
    assetsInlineLimit: 0,
    outDir: process.env.BUILD_OUT_DIR || "dist",
    assetsDir: "assets",
    // 关键：禁用 Vite 的自动清理，因为我们已经有 cleanDistPlugin 在构建前清理
    // 这样可以避免 Windows 上的文件锁定问题（EBUSY）
    // cleanDistPlugin 已经有重试机制（5次，递增等待时间），如果清理失败会继续构建
    // 注意：如果清理失败，旧的构建产物不会被删除，可能导致重复文件
    emptyOutDir: false,
    // 所有应用都打包 @btc/* 包和 @configs 包，避免运行时模块解析问题
    rollupOptions: createRollupConfig(appName, {
      externalBtcPackages: false,
      // 显式设置为 false，打包 @btc/* 包
      externalConfigsPackages: false
      // 显式设置为 false，打包 @configs 包
    }),
    chunkSizeWarningLimit: 1e3,
    ...customBuild
  };
  const finalProxy = customServer?.proxy !== void 0 ? customServer.proxy : proxy2;
  const { proxy: _customProxy, ...restCustomServer } = customServer || {};
  const monitorProxy = {
    "/__monitor__": {
      target: "http://localhost:3001",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/__monitor__/, ""),
      ws: true
      // 支持 WebSocket（SSE 使用）
    }
  };
  const mergedProxy = {
    ...monitorProxy,
    ...finalProxy
  };
  const serverConfig = {
    port: appConfig.devPort,
    host: "0.0.0.0",
    strictPort: true,
    cors: true,
    origin: `http://${appConfig.devHost}:${appConfig.devPort}`,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
    },
    hmr: {
      host: appConfig.devHost,
      port: appConfig.devPort,
      overlay: false
    },
    proxy: mergedProxy,
    fs: {
      strict: false,
      allow: [
        withRoot(".")
      ],
      cachedChecks: true
    },
    ...restCustomServer
  };
  const rootDistDir = resolve10(appDir, "../../dist");
  const previewRoot = resolve10(rootDistDir, appConfig.prodHost);
  const previewConfig = {
    port: appConfig.prePort,
    strictPort: true,
    open: false,
    host: "0.0.0.0",
    proxy: proxy2,
    headers: {
      "Access-Control-Allow-Origin": appConfig.mainAppOrigin,
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    ...customPreview
  };
  previewConfig.root = previewRoot;
  const appCacheDir = resolve10(appDir, "node_modules/.vite");
  const optimizeDepsConfig = {
    include: [
      // 核心依赖：所有应用都安装的依赖
      "vue",
      "vue-router",
      "pinia",
      "element-plus",
      // Winston 需要的 Node.js 模块 polyfill
      "util",
      "element-plus/es",
      "element-plus/es/locale/lang/zh-cn",
      "element-plus/es/locale/lang/en",
      "element-plus/es/components/cascader/style/css",
      "@element-plus/icons-vue",
      "@btc/shared-core",
      // 注意：@btc/shared-components 已从 include 中移除，因为它包含 TSX 文件
      // 在开发环境中，应该直接从源码导入，而不是预构建
      // '@btc/shared-components',
      "@btc/shared-utils",
      "@btc/subapp-manifests",
      "vite-plugin-qiankun/dist/helper",
      "qiankun",
      "@vueuse/core",
      // 关键：这些依赖现在已经在所有应用的 package.json 中声明
      // 通过 @btc/shared-components 间接使用，但需要在应用中显式声明以便 Vite 正确解析
      "lodash-es",
      "chardet",
      "xlsx",
      "vue-i18n",
      // 关键：echarts 相关依赖需要被预构建
      // 虽然只在部分应用中使用，但添加到 include 中可以避免运行时优化
      // 如果应用未安装这些依赖，Vite 会忽略它们（不会报错）
      "echarts/core",
      "echarts",
      "vue-echarts"
    ],
    // 排除不应该被优化的依赖
    // 注意：exclude 使用包名或文件路径模式
    exclude: [
      // 关键：@btc/shared-core/configs/layout-bridge 是本地别名路径，不是 npm 包，不应该被优化
      // 注意：exclude 只支持字符串模式，不支持正则表达式
      "@btc/shared-core/configs/layout-bridge",
      // 关键：排除 @btc/shared-components，因为它是本地包，包含 TSX 文件
      // 在开发环境中，应该直接从源码导入，而不是预构建
      // 这样可以避免 JSX 解析问题
      "@btc/shared-components"
    ],
    // 关键：设置为 true，强制重新构建所有依赖，确保所有依赖都被预构建
    // 这会在首次启动时构建所有依赖，之后就不会再触发了
    force: false,
    // 关键：参考 cool-admin 的做法
    // 注意：不再包含 shared-components/src/index.ts，因为它包含 TSX 文件，应该在运行时直接处理
    // shared-components 中的依赖（如 lunr, chardet 等）会在运行时被自动发现和优化
    entries: [
      // 应用的入口文件
      resolve10(appDir, "src/main.ts")
    ],
    esbuildOptions: {
      plugins: [],
      // 关键：确保依赖预构建时也使用 Vue 的 JSX 转换方式
      jsx: "preserve",
      // 保留 JSX，让 vueJsx 插件处理
      jsxFactory: "h",
      // 使用 Vue 的 h 函数作为 JSX 工厂函数
      jsxFragment: "Fragment"
      // 使用 Vue 的 Fragment
    },
    ...customOptimizeDeps
  };
  const cssConfig = {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        silenceDeprecations: ["legacy-js-api", "import"]
      }
    },
    devSourcemap: false,
    ...customCss
  };
  const baseResolve = createBaseResolve(appDir, appName);
  const shouldUseSharedEps = process.env.NODE_ENV === "production" || isPreviewBuild;
  const sharedEpsStub = resolve10(appDir, "../../configs/vite/stubs/virtual-eps-empty.ts");
  const finalResolve = shouldUseSharedEps ? {
    ...baseResolve,
    // 关键：保持别名数组形式，添加 virtual:eps 别名
    alias: Array.isArray(baseResolve?.alias) ? [
      ...baseResolve.alias,
      {
        find: "virtual:eps",
        replacement: sharedEpsStub
      }
    ] : {
      ...baseResolve?.alias || {},
      "virtual:eps": sharedEpsStub
    }
  } : baseResolve;
  const config = {
    base: baseUrl,
    publicDir,
    // 关键：每个应用使用独立的缓存目录，避免不同应用的配置差异导致缓存冲突
    // 虽然这会增加一些存储空间，但可以确保每个应用的缓存状态一致，避免频繁重新构建
    cacheDir: appCacheDir,
    define: {
      // 为浏览器环境提供 process 对象，Winston 需要它
      "process.env": "{}",
      "process.platform": JSON.stringify("browser"),
      "process.version": JSON.stringify("")
    },
    plugins,
    esbuild: {
      charset: "utf8",
      // 关键：确保 esbuild 正确处理 JSX，使用 Vue 的 h 函数而不是 React.createElement
      // 这样即使 esbuild 处理某些 JSX 文件，也会使用正确的转换方式
      jsx: "preserve",
      // 保留 JSX，让 vueJsx 插件处理
      jsxFactory: "h",
      // 使用 Vue 的 h 函数作为 JSX 工厂函数
      jsxFragment: "Fragment"
      // 使用 Vue 的 Fragment
    },
    server: serverConfig,
    preview: previewConfig,
    optimizeDeps: optimizeDepsConfig,
    css: cssConfig,
    build: buildConfig
  };
  if (finalResolve !== void 0) {
    config.resolve = finalResolve;
  }
  return config;
}

// ../admin-app/src/config/proxy.ts
import { logger } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";
var proxy = {
  "/api": {
    target: "http://10.80.9.76:8115",
    changeOrigin: true,
    secure: false,
    // 不再替换路径，直接转发 /api 到后端（后端已改为使用 /api）
    // rewrite: (path: string) => path.replace(/^\/api/, '/admin') // 已移除：后端已改为使用 /api
    // 处理响应头，添加 CORS 头
    configure: (proxy2, options) => {
      proxy2.on("proxyRes", (proxyRes, req, res) => {
        const origin = req.headers.origin || "*";
        if (proxyRes.headers) {
          proxyRes.headers["Access-Control-Allow-Origin"] = origin;
          proxyRes.headers["Access-Control-Allow-Credentials"] = "true";
          proxyRes.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS";
          const requestHeaders = req.headers["access-control-request-headers"] || "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id";
          proxyRes.headers["Access-Control-Allow-Headers"] = requestHeaders;
          const setCookieHeader = proxyRes.headers["set-cookie"];
          if (setCookieHeader) {
            const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
            const fixedCookies = cookies.map((cookie) => {
              if (!cookie.includes("SameSite=None")) {
                let fixedCookie = cookie.replace(/;\s*SameSite=(Strict|Lax|None)/gi, "");
                fixedCookie += "; SameSite=None; Secure";
                return fixedCookie;
              }
              return cookie;
            });
            proxyRes.headers["set-cookie"] = fixedCookies;
          }
        }
        if (proxyRes.statusCode && proxyRes.statusCode >= 500) {
          logger.error(`[Proxy] Backend returned ${proxyRes.statusCode} for ${req.method} ${req.url}`);
        }
      });
      proxy2.on("error", (err, req, res) => {
        logger.error("[Proxy] Error:", err.message);
        logger.error("[Proxy] Request URL:", req.url);
        logger.error("[Proxy] Target:", "http://10.80.9.76:8115");
        if (res && !res.headersSent) {
          res.writeHead(500, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": req.headers.origin || "*"
          });
          res.end(JSON.stringify({
            code: 500,
            message: "Proxy error: Unable to connect to backend server http://10.80.9.76:8115",
            error: err.message
          }));
        }
      });
      proxy2.on("proxyReq", (proxyReq, req, res) => {
        console.info(`[Proxy] ${req.method} ${req.url} -> http://10.80.9.76:8115${req.url}`);
      });
    }
  }
};

// vite.config.ts
var __vite_injected_original_import_meta_url6 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/apps/finance-app/vite.config.ts";
var vite_config_default = defineConfig(
  createSubAppViteConfig({
    appName: "finance-app",
    appDir: fileURLToPath6(new URL(".", __vite_injected_original_import_meta_url6)),
    qiankunName: "finance",
    customServer: { proxy },
    proxy
  })
);
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL2ZhY3Rvcmllcy9zdWJhcHAuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS91dGlscy9wYXRoLWhlbHBlcnMudHMiLCAiLi4vLi4vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlLWFwcC1jb25maWcudHMiLCAiLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvcmUvc3JjL2NvbmZpZ3MvYXBwLWVudi5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL2Jhc2UuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL21hbnVhbC1jaHVua3MudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvcm9sbHVwLWNvbmZpZy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jbGVhbi50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jaHVuay50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy91cmwudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY29ycy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jc3MudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvdmVyc2lvbi50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9yZXNvbHZlLWxvZ28udHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvdXBsb2FkLWljb25zLXRvLW9zcy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9yZXBsYWNlLWljb25zLXdpdGgtY2RuLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2xvY2FsZXMtc3RhdGljLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VwbG9hZC1jZG4udHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY2RuLWFzc2V0cy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jZG4taW1wb3J0LnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3Jlc29sdmUtYnRjLWltcG9ydHMudHMiLCAiLi4vYWRtaW4tYXBwL3NyYy9jb25maWcvcHJveHkudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcZmluYW5jZS1hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxmaW5hbmNlLWFwcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9hcHBzL2ZpbmFuY2UtYXBwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHsgY3JlYXRlU3ViQXBwVml0ZUNvbmZpZyB9IGZyb20gJy4uLy4uL2NvbmZpZ3Mvdml0ZS9mYWN0b3JpZXMvc3ViYXBwLmNvbmZpZyc7XG5pbXBvcnQgeyBwcm94eSBhcyBtYWluUHJveHkgfSBmcm9tICcuLi9hZG1pbi1hcHAvc3JjL2NvbmZpZy9wcm94eSc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhcbiAgY3JlYXRlU3ViQXBwVml0ZUNvbmZpZyh7XG4gICAgYXBwTmFtZTogJ2ZpbmFuY2UtYXBwJyxcbiAgICBhcHBEaXI6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLicsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgIHFpYW5rdW5OYW1lOiAnZmluYW5jZScsXG4gICAgY3VzdG9tU2VydmVyOiB7IHByb3h5OiBtYWluUHJveHkgfSxcbiAgICBwcm94eTogbWFpblByb3h5LFxuICB9KVxuKTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcZmFjdG9yaWVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxmYWN0b3JpZXNcXFxcc3ViYXBwLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvZmFjdG9yaWVzL3N1YmFwcC5jb25maWcudHNcIjsvKipcbiAqIFx1NUI1MFx1NUU5NFx1NzUyOCBWaXRlIFx1OTE0RFx1N0Y2RVx1NURFNVx1NTM4MlxuICogXHU3NTFGXHU2MjEwXHU1QjUwXHU1RTk0XHU3NTI4XHU3Njg0XHU1QjhDXHU2NTc0IFZpdGUgXHU5MTREXHU3RjZFXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBVc2VyQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyByZXNvbHZlLCBkaXJuYW1lIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHsgY3JlYXRlUmVxdWlyZSB9IGZyb20gJ21vZHVsZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgdnVlSnN4IGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZS1qc3gnO1xuaW1wb3J0IHFpYW5rdW4gZnJvbSAndml0ZS1wbHVnaW4tcWlhbmt1bic7XG5pbXBvcnQgVW5vQ1NTIGZyb20gJ3Vub2Nzcy92aXRlJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHsgY3JlYXRlUGF0aEhlbHBlcnMgfSBmcm9tICcuLi91dGlscy9wYXRoLWhlbHBlcnMnO1xuXG4vLyBcdTgzQjdcdTUzRDZcdTVGNTNcdTUyNERcdTY1ODdcdTRFRjZcdTc2ODRcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcdUZGMDhFU00gXHU2NUI5XHU1RjBGXHVGRjA5XG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xuY29uc3QgX19kaXJuYW1lID0gZGlybmFtZShfX2ZpbGVuYW1lKTtcblxuLy8gXHU1RUY2XHU4RkRGXHU1MkEwXHU4RjdEIFZ1ZUkxOG5QbHVnaW5cdUZGMENcdTRFQ0VcdTVFOTRcdTc1MjhcdTc2RUVcdTVGNTVcdTg5RTNcdTY3OTBcbi8vIFx1NEY3Rlx1NzUyOFx1NTFGRFx1NjU3MFx1NTE4NVx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1RkYwQ1x1Nzg2RVx1NEZERFx1NEVDRVx1OEMwM1x1NzUyOFx1ODAwNVx1NzY4NCBub2RlX21vZHVsZXMgXHU4OUUzXHU2NzkwXG5pbXBvcnQgeyBwYXRoVG9GaWxlVVJMIH0gZnJvbSAnbm9kZTp1cmwnO1xuZnVuY3Rpb24gZ2V0VnVlSTE4blBsdWdpbihhcHBEaXI6IHN0cmluZykge1xuICAvLyBcdTRGN0ZcdTc1MjggY3JlYXRlUmVxdWlyZSBcdTRFQ0VcdTVFOTRcdTc1MjhcdTc2RUVcdTVGNTVcdTg5RTNcdTY3OTBcdTUzMDVcbiAgLy8gXHU5MDFBXHU4RkM3IGZpbGU6Ly8gVVJMIFx1NTIxQlx1NUVGQVx1NkI2M1x1Nzg2RVx1NzY4NCByZXF1aXJlIFx1NEUwQVx1NEUwQlx1NjU4N1xuICBjb25zdCBhcHBEaXJVcmwgPSBwYXRoVG9GaWxlVVJMKHJlc29sdmUoYXBwRGlyLCAncGFja2FnZS5qc29uJykpLmhyZWY7XG4gIGNvbnN0IHJlcXVpcmUgPSBjcmVhdGVSZXF1aXJlKGFwcERpclVybCk7XG4gIGNvbnN0IHBsdWdpbiA9IHJlcXVpcmUoJ0BpbnRsaWZ5L3VucGx1Z2luLXZ1ZS1pMThuL3ZpdGUnKTtcbiAgcmV0dXJuIHBsdWdpbi5kZWZhdWx0IHx8IHBsdWdpbjtcbn1cbmltcG9ydCB7IGNyZWF0ZUF1dG9JbXBvcnRDb25maWcsIGNyZWF0ZUNvbXBvbmVudHNDb25maWcgfSBmcm9tICcuLi8uLi9hdXRvLWltcG9ydC5jb25maWcnO1xuaW1wb3J0IHsgYnRjLCBmaXhDaHVua1JlZmVyZW5jZXNQbHVnaW4gfSBmcm9tICdAYnRjL3ZpdGUtcGx1Z2luJztcbmltcG9ydCB7IGdldFZpdGVBcHBDb25maWcsIGdldEJhc2VVcmwsIGdldFB1YmxpY0RpciB9IGZyb20gJy4uLy4uL3ZpdGUtYXBwLWNvbmZpZyc7XG5pbXBvcnQgeyBjcmVhdGVCYXNlUmVzb2x2ZSB9IGZyb20gJy4uL2Jhc2UuY29uZmlnJztcbmltcG9ydCB7IGNyZWF0ZVJvbGx1cENvbmZpZyB9IGZyb20gJy4uL3BsdWdpbnMvcm9sbHVwLWNvbmZpZyc7XG5pbXBvcnQge1xuICBjbGVhbkRpc3RQbHVnaW4sXG4gIGNodW5rVmVyaWZ5UGx1Z2luLFxuICBvcHRpbWl6ZUNodW5rc1BsdWdpbixcbiAgZW5zdXJlQmFzZVVybFBsdWdpbixcbiAgY29yc1BsdWdpbixcbiAgZW5zdXJlQ3NzUGx1Z2luLFxuICBhZGRWZXJzaW9uUGx1Z2luLFxuICByZXBsYWNlSWNvbnNXaXRoQ2RuUGx1Z2luLFxuICByZXNvbHZlTG9nb1BsdWdpbixcbiAgdXBsb2FkQ2RuUGx1Z2luLFxuICBjZG5Bc3NldHNQbHVnaW4sXG4gIGNkbkltcG9ydFBsdWdpbixcbiAgcmVzb2x2ZUJ0Y0ltcG9ydHNQbHVnaW4sXG4gIGxvY2FsZXNTdGF0aWNQbHVnaW4sXG59IGZyb20gJy4uL3BsdWdpbnMnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuZXhwb3J0IGludGVyZmFjZSBTdWJBcHBWaXRlQ29uZmlnT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcdUZGMDhcdTU5ODIgJ2FkbWluLWFwcCdcdUZGMDlcbiAgICovXG4gIGFwcE5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICAgKi9cbiAgYXBwRGlyOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBRaWFua3VuIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NTk4MiAnYWRtaW4nXHVGRjA5XG4gICAqL1xuICBxaWFua3VuTmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5XHU2M0QyXHU0RUY2XHU1MjE3XHU4ODY4XG4gICAqL1xuICBjdXN0b21QbHVnaW5zPzogUGx1Z2luW107XG4gIC8qKlxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTY3ODRcdTVFRkFcdTkxNERcdTdGNkVcbiAgICovXG4gIGN1c3RvbUJ1aWxkPzogUGFydGlhbDxVc2VyQ29uZmlnWydidWlsZCddPjtcbiAgLyoqXG4gICAqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NjcwRFx1NTJBMVx1NTY2OFx1OTE0RFx1N0Y2RVxuICAgKi9cbiAgY3VzdG9tU2VydmVyPzogUGFydGlhbDxVc2VyQ29uZmlnWydzZXJ2ZXInXT47XG4gIC8qKlxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTk4ODRcdTg5QzhcdTY3MERcdTUyQTFcdTU2NjhcdTkxNERcdTdGNkVcbiAgICovXG4gIGN1c3RvbVByZXZpZXc/OiBQYXJ0aWFsPFVzZXJDb25maWdbJ3ByZXZpZXcnXT47XG4gIC8qKlxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTRGMThcdTUzMTZcdTRGOURcdThENTZcdTkxNERcdTdGNkVcbiAgICovXG4gIGN1c3RvbU9wdGltaXplRGVwcz86IFBhcnRpYWw8VXNlckNvbmZpZ1snb3B0aW1pemVEZXBzJ10+O1xuICAvKipcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5IENTUyBcdTkxNERcdTdGNkVcbiAgICovXG4gIGN1c3RvbUNzcz86IFBhcnRpYWw8VXNlckNvbmZpZ1snY3NzJ10+O1xuICAvKipcbiAgICogXHU0RUUzXHU3NDA2XHU5MTREXHU3RjZFXG4gICAqL1xuICBwcm94eT86IFJlY29yZDxzdHJpbmcsIGFueT47XG4gIC8qKlxuICAgKiBCVEMgXHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFXG4gICAqL1xuICBidGNPcHRpb25zPzoge1xuICAgIHR5cGU/OiAnc3ViYXBwJztcbiAgICBwcm94eT86IFJlY29yZDxzdHJpbmcsIGFueT47XG4gICAgZXBzPzoge1xuICAgICAgZW5hYmxlPzogYm9vbGVhbjtcbiAgICAgIGRpY3Q/OiBib29sZWFuO1xuICAgICAgZGlzdD86IHN0cmluZztcbiAgICB9O1xuICAgIHN2Zz86IHtcbiAgICAgIHNraXBOYW1lcz86IHN0cmluZ1tdO1xuICAgIH07XG4gIH07XG4gIC8qKlxuICAgKiBWdWVJMThuIFx1NjNEMlx1NEVGNlx1OTE0RFx1N0Y2RVxuICAgKi9cbiAgdnVlSTE4bk9wdGlvbnM/OiB7XG4gICAgaW5jbHVkZT86IHN0cmluZ1tdO1xuICAgIHJ1bnRpbWVPbmx5PzogYm9vbGVhbjtcbiAgfTtcbiAgLyoqXG4gICAqIFFpYW5rdW4gXHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFXG4gICAqL1xuICBxaWFua3VuT3B0aW9ucz86IHtcbiAgICB1c2VEZXZNb2RlPzogYm9vbGVhbjtcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTUyMUJcdTVFRkFcdTVCNTBcdTVFOTRcdTc1MjggVml0ZSBcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN1YkFwcFZpdGVDb25maWcob3B0aW9uczogU3ViQXBwVml0ZUNvbmZpZ09wdGlvbnMpOiBVc2VyQ29uZmlnIHtcbiAgY29uc3Qge1xuICAgIGFwcE5hbWUsXG4gICAgYXBwRGlyLFxuICAgIHFpYW5rdW5OYW1lLFxuICAgIGN1c3RvbVBsdWdpbnMgPSBbXSxcbiAgICBjdXN0b21CdWlsZCxcbiAgICBjdXN0b21TZXJ2ZXIsXG4gICAgY3VzdG9tUHJldmlldyxcbiAgICBjdXN0b21PcHRpbWl6ZURlcHMsXG4gICAgY3VzdG9tQ3NzLFxuICAgIHByb3h5ID0ge30sXG4gICAgYnRjT3B0aW9ucyA9IHt9LFxuICAgIHZ1ZUkxOG5PcHRpb25zLFxuICAgIHFpYW5rdW5PcHRpb25zID0geyB1c2VEZXZNb2RlOiB0cnVlIH0sXG4gIH0gPSBvcHRpb25zO1xuXG4gIC8vIFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxuICBjb25zdCBhcHBDb25maWcgPSBnZXRWaXRlQXBwQ29uZmlnKGFwcE5hbWUpO1xuICAvLyBcdTRGN0ZcdTc1MjhcdTVCRkNcdTUxNjVcdTc2ODQgY3JlYXRlUGF0aEhlbHBlcnNcbiAgY29uc3QgeyB3aXRoUm9vdCB9ID0gY3JlYXRlUGF0aEhlbHBlcnMoYXBwRGlyKTtcblxuICAvLyBcdTUyMjRcdTY1QURcdTY2MkZcdTU0MjZcdTRFM0FcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcbiAgY29uc3QgaXNQcmV2aWV3QnVpbGQgPSBwcm9jZXNzLmVudi5WSVRFX1BSRVZJRVcgPT09ICd0cnVlJztcbiAgY29uc3QgYmFzZVVybCA9IGdldEJhc2VVcmwoYXBwTmFtZSwgaXNQcmV2aWV3QnVpbGQpO1xuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTVCNTBcdTVFOTRcdTc1MjhcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTc5ODFcdTc1MjggcHVibGljRGlyXHVGRjBDXHU5MDdGXHU1MTREXHU2MjUzXHU1MzA1XHU1NkZFXHU2ODA3XHU3QjQ5XHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXG4gIC8vIFx1NTZGRVx1NjgwN1x1N0I0OVx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1NUU5NFx1OEJFNVx1NzUzMSBsYXlvdXQtYXBwIFx1N0VERlx1NEUwMFx1N0JBMVx1NzQwNlxuICAvLyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFQ0RcdTcxMzZcdTk3MDBcdTg5ODEgcHVibGljRGlyIFx1Njc2NVx1NjcwRFx1NTJBMVx1OTc1OVx1NjAwMVx1NjU4N1x1NEVGNlxuICBjb25zdCBwdWJsaWNEaXIgPSBpc1ByZXZpZXdCdWlsZCA/IGdldFB1YmxpY0RpcihhcHBOYW1lLCBhcHBEaXIpIDogZmFsc2U7XG5cbiAgLy8gXHU4M0I3XHU1M0Q2XHU0RTNCXHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXG4gIGNvbnN0IG1haW5BcHBDb25maWcgPSBnZXRWaXRlQXBwQ29uZmlnKCdtYWluLWFwcCcpO1xuICBjb25zdCBtYWluQXBwUG9ydCA9IG1haW5BcHBDb25maWcucHJlUG9ydC50b1N0cmluZygpO1xuXG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQUVQUyBcdTc2ODQgb3V0cHV0RGlyIFx1NUZDNVx1OTg3Qlx1NEY3Rlx1NzUyOFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NTdGQVx1NEU4RSBhcHBEaXIgXHU4OUUzXHU2NzkwXG4gIC8vIFx1OTA3Rlx1NTE0RFx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NTZFMFx1NEUzQVx1NURFNVx1NEY1Q1x1NzZFRVx1NUY1NVx1NTNEOFx1NTMxNlx1ODAwQ1x1NTcyOCBkaXN0IFx1NzZFRVx1NUY1NVx1NEUwQlx1NTIxQlx1NUVGQSBidWlsZCBcdTc2RUVcdTVGNTVcbiAgY29uc3QgZXBzT3V0cHV0RGlyID0gcmVzb2x2ZShhcHBEaXIsICdidWlsZCcsICdlcHMnKTtcblxuICAvLyBcdTUxNzFcdTRFQUJcdTc2ODQgRVBTIFx1NjU3MFx1NjM2RVx1NkU5MFx1NzZFRVx1NUY1NVx1RkYwOFx1NEVDRSBtYWluLWFwcCBcdThCRkJcdTUzRDZcdUZGMDlcbiAgLy8gXHU1QjUwXHU1RTk0XHU3NTI4XHU0RjE4XHU1MTQ4XHU0RUNFIG1haW4tYXBwIFx1NzY4NCBidWlsZC9lcHMgXHU4QkZCXHU1M0Q2IEVQUyBcdTY1NzBcdTYzNkVcdUZGMENcdTVCOUVcdTczQjBcdTc3MUZcdTZCNjNcdTc2ODRcdTUxNzFcdTRFQUJcbiAgY29uc3Qgc2hhcmVkRXBzRGlyID0gcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9hcHBzL21haW4tYXBwL2J1aWxkL2VwcycpO1xuXG4gIC8vIFx1Nzg2RVx1NEZERCBlcHMgZW5hYmxlIFx1NTlDQlx1N0VDOFx1NEUzQSBib29sZWFuIFx1N0M3Qlx1NTc4QlxuICBjb25zdCBlcHNFbmFibGU6IGJvb2xlYW4gPSBidGNPcHRpb25zLmVwcz8uZW5hYmxlID8/IHRydWU7XG5cbiAgLy8gXHU2Nzg0XHU1RUZBIGVwcyBcdTkxNERcdTdGNkVcdUZGMENcdTc4NkVcdTRGREQgZW5hYmxlIFx1NTlDQlx1N0VDOFx1NEUzQSBib29sZWFuXG4gIGNvbnN0IGVwc0NvbmZpZzoge1xuICAgIGVuYWJsZTogYm9vbGVhbjtcbiAgICBkaWN0OiBib29sZWFuO1xuICAgIGRpY3RBcGk/OiBzdHJpbmc7XG4gICAgZGlzdDogc3RyaW5nO1xuICAgIHNoYXJlZEVwc0Rpcjogc3RyaW5nO1xuICB9ID0ge1xuICAgIGVuYWJsZTogZXBzRW5hYmxlLFxuICAgIGRpY3Q6IGJ0Y09wdGlvbnMuZXBzPy5kaWN0ID8/IHRydWUsIC8vIFx1OUVEOFx1OEJBNFx1NTQyRlx1NzUyOFx1NUI1N1x1NTE3OFx1NTI5Rlx1ODBGRFxuICAgIGRpY3RBcGk6IGJ0Y09wdGlvbnMuZXBzPy5kaWN0QXBpIHx8ICcvYXBpL3N5c3RlbS9hdXRoL2RpY3QnLCAvLyBcdTlFRDhcdThCQTRcdTVCNTdcdTUxNzhcdTYzQTVcdTUzRTNcbiAgICBkaXN0OiBlcHNPdXRwdXREaXIsXG4gICAgc2hhcmVkRXBzRGlyOiBzaGFyZWRFcHNEaXIsXG4gIH07XG5cbiAgLy8gXHU2Nzg0XHU1RUZBXHU2M0QyXHU0RUY2XHU1MjE3XHU4ODY4XG4gIGNvbnN0IHBsdWdpbnM6IFBsdWdpbltdID0gW1xuICAgIC8vIDEuIFx1NkUwNVx1NzQwNlx1NjNEMlx1NEVGNlxuICAgIGNsZWFuRGlzdFBsdWdpbihhcHBEaXIpLFxuICAgIC8vIDIuIENPUlMgXHU2M0QyXHU0RUY2XG4gICAgY29yc1BsdWdpbigpLFxuICAgIC8vIDMuIFx1ODlFM1x1Njc5MCBAYnRjLyogXHU1MzA1XHU1QkZDXHU1MTY1XHU2M0QyXHU0RUY2XHVGRjA4XHU1NzI4IExvZ28gXHU2M0QyXHU0RUY2XHU0RTRCXHU1MjREXHVGRjBDXHU3ODZFXHU0RkREXHU4MEZEXHU1OTFGXHU4OUUzXHU2NzkwXHU0RUNFXHU1REYyXHU2Nzg0XHU1RUZBXHU1MzA1XHU0RTJEXHU1QkZDXHU1MTY1XHU3Njg0IEBidGMvKiBcdTZBMjFcdTU3NTdcdUZGMDlcbiAgICByZXNvbHZlQnRjSW1wb3J0c1BsdWdpbih7IGFwcERpciB9KSxcbiAgICAvLyA0LiBMb2dvIFx1OERFRlx1NUY4NFx1ODlFM1x1Njc5MFx1NjNEMlx1NEVGNlx1RkYwOFx1NTcyOFx1ODFFQVx1NUI5QVx1NEU0OVx1NjNEMlx1NEVGNlx1NEU0Qlx1NTI0RFx1RkYwQ1x1Nzg2RVx1NEZERCAvbG9nby5wbmcgXHU4MEZEXHU4OEFCXHU2QjYzXHU3ODZFXHU4OUUzXHU2NzkwXHVGRjA5XG4gICAgcmVzb2x2ZUxvZ29QbHVnaW4oYXBwRGlyKSxcbiAgICAvLyA0LjUuIExvY2FsZXMgXHU5NzU5XHU2MDAxXHU2NTg3XHU0RUY2XHU2M0QyXHU0RUY2XHVGRjA4XHU2M0QwXHU0RjlCIHNyYy9sb2NhbGVzLyouanNvbiBcdTY1ODdcdTRFRjZcdUZGMENcdTRGOUJcdTRFM0JcdTVFOTRcdTc1MjhcdTkwMUFcdThGQzcgZmV0Y2ggXHU1MkEwXHU4RjdEXHVGRjA5XG4gICAgbG9jYWxlc1N0YXRpY1BsdWdpbihhcHBEaXIpLFxuICAgIC8vIDUuIFx1ODFFQVx1NUI5QVx1NEU0OVx1NjNEMlx1NEVGNlx1RkYwOFx1NTcyOFx1NjgzOFx1NUZDM1x1NjNEMlx1NEVGNlx1NEU0Qlx1NTI0RFx1RkYwOVxuICAgIC4uLmN1c3RvbVBsdWdpbnMsXG4gICAgLy8gNC4gVnVlIFx1NjNEMlx1NEVGNlxuICAgIHZ1ZSh7XG4gICAgICBzY3JpcHQ6IHtcbiAgICAgICAgZnM6IHtcbiAgICAgICAgICBmaWxlRXhpc3RzOiBleGlzdHNTeW5jLFxuICAgICAgICAgIHJlYWRGaWxlOiAoZmlsZTogc3RyaW5nKSA9PiByZWFkRmlsZVN5bmMoZmlsZSwgJ3V0Zi04JyksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pLFxuICAgIC8vIDQuNS4gVnVlIEpTWCBcdTYzRDJcdTRFRjZcdUZGMDhcdTY1MkZcdTYzMDEgVFNYIFx1NjU4N1x1NEVGNlx1NEUyRFx1NzY4NCBKU1ggXHU4QkVEXHU2Q0Q1XHVGRjA5XG4gICAgdnVlSnN4KCksXG4gICAgLy8gNS4gXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU2M0QyXHU0RUY2XG4gICAgY3JlYXRlQXV0b0ltcG9ydENvbmZpZygpLFxuICAgIC8vIDYuIFx1N0VDNFx1NEVGNlx1ODFFQVx1NTJBOFx1NkNFOFx1NTE4Q1x1NjNEMlx1NEVGNlxuICAgIGNyZWF0ZUNvbXBvbmVudHNDb25maWcoeyBpbmNsdWRlU2hhcmVkOiB0cnVlIH0pLFxuICAgIC8vIDcuIFVub0NTUyBcdTYzRDJcdTRFRjZcbiAgICBVbm9DU1Moe1xuICAgICAgY29uZmlnRmlsZTogd2l0aFJvb3QoJ3Vuby5jb25maWcudHMnKSxcbiAgICB9KSxcbiAgICAvLyA4LiBCVEMgXHU0RTFBXHU1MkExXHU2M0QyXHU0RUY2XG4gICAgYnRjKHtcbiAgICAgIHR5cGU6ICdzdWJhcHAnIGFzIGFueSxcbiAgICAgIHByb3h5LFxuICAgICAgZXBzOiBlcHNDb25maWcgYXMgYW55LCAvLyBcdTdDN0JcdTU3OEJcdTY1QURcdThBMDBcdUZGMUFcdTc4NkVcdTRGREQgZW5hYmxlIFx1NTlDQlx1N0VDOFx1NEUzQSBib29sZWFuXG4gICAgICBzdmc6IHtcbiAgICAgICAgc2tpcE5hbWVzOiBbJ2Jhc2UnLCAnaWNvbnMnXSxcbiAgICAgICAgLi4uYnRjT3B0aW9ucy5zdmcsXG4gICAgICB9LFxuICAgICAgLi4uYnRjT3B0aW9ucyxcbiAgICB9KSxcbiAgICAvLyA5LiBWdWVJMThuIFx1NjNEMlx1NEVGNlxuICAgIGdldFZ1ZUkxOG5QbHVnaW4oYXBwRGlyKSh7XG4gICAgICBpbmNsdWRlOiB2dWVJMThuT3B0aW9ucz8uaW5jbHVkZSB8fCBbXG4gICAgICAgIHJlc29sdmUoYXBwRGlyLCAnc3JjL2xvY2FsZXMvKionKVxuICAgICAgXSxcbiAgICAgIHJ1bnRpbWVPbmx5OiB2dWVJMThuT3B0aW9ucz8ucnVudGltZU9ubHkgPz8gdHJ1ZSxcbiAgICB9KSxcbiAgICAvLyAxMC4gQ1NTIFx1OUE4Q1x1OEJDMVx1NjNEMlx1NEVGNlxuICAgIGVuc3VyZUNzc1BsdWdpbigpLFxuICAgIC8vIDExLiBRaWFua3VuIFx1NjNEMlx1NEVGNlxuICAgIHFpYW5rdW4ocWlhbmt1bk5hbWUsIHFpYW5rdW5PcHRpb25zKSxcbiAgICAvLyAxMi4gXHU0RkVFXHU1OTBEIGNodW5rIFx1NUYxNVx1NzUyOFx1NjNEMlx1NEVGNlxuICAgIGZpeENodW5rUmVmZXJlbmNlc1BsdWdpbigpLFxuICAgIC8vIDE1LiBcdTc4NkVcdTRGREQgYmFzZSBVUkwgXHU2M0QyXHU0RUY2XG4gICAgZW5zdXJlQmFzZVVybFBsdWdpbihiYXNlVXJsLCBhcHBDb25maWcuZGV2SG9zdCwgYXBwQ29uZmlnLnByZVBvcnQsIG1haW5BcHBQb3J0KSxcbiAgICAvLyAxNi4gXHU2REZCXHU1MkEwXHU3MjQ4XHU2NzJDXHU1M0Y3XHU2M0QyXHU0RUY2XHVGRjA4XHU0RTNBIEhUTUwgXHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU2REZCXHU1MkEwXHU2NUY2XHU5NUY0XHU2MjMzXHU3MjQ4XHU2NzJDXHU1M0Y3XHVGRjA5XG4gICAgYWRkVmVyc2lvblBsdWdpbigpLFxuICAgIC8vIDE2LjUuIENETiBcdThENDRcdTZFOTBcdTUyQTBcdTkwMUZcdTYzRDJcdTRFRjZcdUZGMDhcdTU3MjhcdTcyNDhcdTY3MkNcdTUzRjdcdTYzRDJcdTRFRjZcdTRFNEJcdTU0MEVcdUZGMENcdTc4NkVcdTRGRERcdTcyNDhcdTY3MkNcdTUzRjdcdTUzQzJcdTY1NzBcdTg4QUJcdTRGRERcdTc1NTlcdUZGMDlcbiAgICAvLyBcdTU5MDRcdTc0MDYgSFRNTCBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTAgVVJMXHVGRjA4PHNjcmlwdD5cdTMwMDE8bGluaz5cdTMwMDE8aW1nPiBcdTdCNDlcdUZGMDlcbiAgICBjZG5Bc3NldHNQbHVnaW4oe1xuICAgICAgYXBwTmFtZSxcbiAgICAgIGVuYWJsZWQ6ICFpc1ByZXZpZXdCdWlsZCAmJiBwcm9jZXNzLmVudi5FTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiAhPT0gJ2ZhbHNlJyxcbiAgICB9KSxcbiAgICAvLyAxNi42LiBDRE4gXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU4RjZDXHU2MzYyXHU2M0QyXHU0RUY2XHVGRjA4XHU4RjZDXHU2MzYyXHU0RUUzXHU3ODAxXHU0RTJEXHU3Njg0IGltcG9ydCgpIFx1OEMwM1x1NzUyOFx1RkYwOVxuICAgIC8vIFx1NUMwNlx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1OEY2Q1x1NjM2Mlx1NEUzQSBDRE4gVVJMXHVGRjBDXHU0RTBFIGNkbkFzc2V0c1BsdWdpbiBcdTkxNERcdTU0MDhcdTVCOUVcdTczQjBcdTVCOENcdTY1NzRcdTc2ODQgQ0ROIFx1NTJBMFx1OTAxRlxuICAgIGNkbkltcG9ydFBsdWdpbih7XG4gICAgICBhcHBOYW1lLFxuICAgICAgZW5hYmxlZDogIWlzUHJldmlld0J1aWxkICYmIHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OICE9PSAnZmFsc2UnLFxuICAgIH0pLFxuICAgIC8vIDE2LjcuIFx1NjZGRlx1NjM2Mlx1NTZGRVx1NjgwN1x1OERFRlx1NUY4NFx1NEUzQSBDRE4gVVJMXHVGRjA4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjA5XG4gICAgcmVwbGFjZUljb25zV2l0aENkblBsdWdpbigpLFxuICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NEUwRFx1NTE4RFx1OTcwMFx1ODk4MSByZXNvbHZlRXh0ZXJuYWxJbXBvcnRzUGx1Z2luXHVGRjBDXHU1NkUwXHU0RTNBXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU2MjUzXHU1MzA1IEBidGMvKiBcdTUzMDVcbiAgICAvLyAxNy4gXHU0RjE4XHU1MzE2IGNodW5rcyBcdTYzRDJcdTRFRjZcbiAgICBvcHRpbWl6ZUNodW5rc1BsdWdpbigpLFxuICAgIC8vIDE4LiBDaHVuayBcdTlBOENcdThCQzFcdTYzRDJcdTRFRjZcbiAgICBjaHVua1ZlcmlmeVBsdWdpbigpLFxuICAgIC8vIDE5LiBDRE4gXHU0RTBBXHU0RjIwXHU2M0QyXHU0RUY2XHVGRjA4XHU0RUM1XHU1NzI4XHU3NTFGXHU0RUE3XHU2Nzg0XHU1RUZBXHU0RTE0XHU1NDJGXHU3NTI4XHU2NUY2XHVGRjA5XG4gICAgLi4uKHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fVVBMT0FEID09PSAndHJ1ZScgJiYgIWlzUHJldmlld0J1aWxkXG4gICAgICA/IFt1cGxvYWRDZG5QbHVnaW4oYXBwTmFtZSwgYXBwRGlyKV1cbiAgICAgIDogW10pLFxuICBdO1xuXG4gIC8vIFx1Njc4NFx1NUVGQVx1OTE0RFx1N0Y2RVxuICBjb25zdCBidWlsZENvbmZpZzogVXNlckNvbmZpZ1snYnVpbGQnXSA9IHtcbiAgICB0YXJnZXQ6ICdlczIwMjAnLFxuICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgY3NzQ29kZVNwbGl0OiBmYWxzZSxcbiAgICBjc3NNaW5pZnk6IHRydWUsXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3OTgxXHU3NTI4XHU0RUUzXHU3ODAxXHU1MzhCXHU3RjI5XHVGRjBDXHU5MDdGXHU1MTREIFRlcnNlciBcdTUzOEJcdTdGMjlcdTVCRkNcdTgxRjRcdTc2ODRcdTVCRjlcdThDNjFcdTVDNUVcdTYwMjdcdTUyMDZcdTk2OTRcdTdCMjZcdTRFMjJcdTU5MzFcdTk1RUVcdTk4OThcbiAgICBtaW5pZnk6IGZhbHNlLFxuXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3OTgxXHU2QjYyXHU4RDQ0XHU2RTkwXHU1MTg1XHU4MDU0XHVGRjBDXHU3ODZFXHU0RkREIENTUyBcdTg4QUJcdTYzRDBcdTUzRDZcdTUyMzBcdTcyRUNcdTdBQ0JcdTY1ODdcdTRFRjZcdTRFMkRcdUZGMDhxaWFua3VuIFx1ODk4MVx1NkM0Mlx1RkYwOVxuICAgIC8vIFx1NEUwRSBsYXlvdXQtYXBwIFx1NEZERFx1NjMwMVx1NEUwMFx1ODFGNFx1RkYwQ1x1OTA3Rlx1NTE0RFx1NTE4NVx1ODA1NCBDU1MgXHU1QkZDXHU4MUY0XHU2ODM3XHU1RjBGXHU0RTIyXHU1OTMxXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDAsXG4gICAgb3V0RGlyOiBwcm9jZXNzLmVudi5CVUlMRF9PVVRfRElSIHx8ICdkaXN0JyxcbiAgICBhc3NldHNEaXI6ICdhc3NldHMnLFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzk4MVx1NzUyOCBWaXRlIFx1NzY4NFx1ODFFQVx1NTJBOFx1NkUwNVx1NzQwNlx1RkYwQ1x1NTZFMFx1NEUzQVx1NjIxMVx1NEVFQ1x1NURGMlx1N0VDRlx1NjcwOSBjbGVhbkRpc3RQbHVnaW4gXHU1NzI4XHU2Nzg0XHU1RUZBXHU1MjREXHU2RTA1XHU3NDA2XG4gICAgLy8gXHU4RkQ5XHU2ODM3XHU1M0VGXHU0RUU1XHU5MDdGXHU1MTREIFdpbmRvd3MgXHU0RTBBXHU3Njg0XHU2NTg3XHU0RUY2XHU5NTAxXHU1QjlBXHU5NUVFXHU5ODk4XHVGRjA4RUJVU1lcdUZGMDlcbiAgICAvLyBjbGVhbkRpc3RQbHVnaW4gXHU1REYyXHU3RUNGXHU2NzA5XHU5MUNEXHU4QkQ1XHU2NzNBXHU1MjM2XHVGRjA4NVx1NkIyMVx1RkYwQ1x1OTAxMlx1NTg5RVx1N0I0OVx1NUY4NVx1NjVGNlx1OTVGNFx1RkYwOVx1RkYwQ1x1NTk4Mlx1Njc5Q1x1NkUwNVx1NzQwNlx1NTkzMVx1OEQyNVx1NEYxQVx1N0VFN1x1N0VFRFx1Njc4NFx1NUVGQVxuICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTk4Mlx1Njc5Q1x1NkUwNVx1NzQwNlx1NTkzMVx1OEQyNVx1RkYwQ1x1NjVFN1x1NzY4NFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NEUwRFx1NEYxQVx1ODhBQlx1NTIyMFx1OTY2NFx1RkYwQ1x1NTNFRlx1ODBGRFx1NUJGQ1x1ODFGNFx1OTFDRFx1NTkwRFx1NjU4N1x1NEVGNlxuICAgIGVtcHR5T3V0RGlyOiBmYWxzZSxcbiAgICAvLyBcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTYyNTNcdTUzMDUgQGJ0Yy8qIFx1NTMwNVx1NTQ4QyBAY29uZmlncyBcdTUzMDVcdUZGMENcdTkwN0ZcdTUxNERcdThGRDBcdTg4NENcdTY1RjZcdTZBMjFcdTU3NTdcdTg5RTNcdTY3OTBcdTk1RUVcdTk4OThcbiAgICByb2xsdXBPcHRpb25zOiBjcmVhdGVSb2xsdXBDb25maWcoYXBwTmFtZSwge1xuICAgICAgZXh0ZXJuYWxCdGNQYWNrYWdlczogZmFsc2UsIC8vIFx1NjYzRVx1NUYwRlx1OEJCRVx1N0Y2RVx1NEUzQSBmYWxzZVx1RkYwQ1x1NjI1M1x1NTMwNSBAYnRjLyogXHU1MzA1XG4gICAgICBleHRlcm5hbENvbmZpZ3NQYWNrYWdlczogZmFsc2UsIC8vIFx1NjYzRVx1NUYwRlx1OEJCRVx1N0Y2RVx1NEUzQSBmYWxzZVx1RkYwQ1x1NjI1M1x1NTMwNSBAY29uZmlncyBcdTUzMDVcbiAgICB9KSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gICAgLi4uY3VzdG9tQnVpbGQsXG4gIH07XG5cbiAgLy8gXHU2NzBEXHU1MkExXHU1NjY4XHU5MTREXHU3RjZFXG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEYxOFx1NTE0OFx1NEY3Rlx1NzUyOCBjdXN0b21TZXJ2ZXIucHJveHlcdUZGMENcdTU5ODJcdTY3OUNcdTRFMERcdTVCNThcdTU3MjhcdTUyMTlcdTRGN0ZcdTc1MjggcHJveHkgXHU1M0MyXHU2NTcwXG4gIC8vIFx1NkNFOFx1NjEwRlx1RkYxQWN1c3RvbVNlcnZlciBcdTRGMUFcdTU3MjhcdTY3MDBcdTU0MEVcdTVDNTVcdTVGMDBcdUZGMENcdTU5ODJcdTY3OUNcdTUzMDVcdTU0MkIgcHJveHkgXHU0RjFBXHU4OTg2XHU3NkQ2XHU4RkQ5XHU5MUNDXHU3Njg0XHU4QkJFXHU3RjZFXG4gIGNvbnN0IGZpbmFsUHJveHkgPSBjdXN0b21TZXJ2ZXI/LnByb3h5ICE9PSB1bmRlZmluZWQgPyBjdXN0b21TZXJ2ZXIucHJveHkgOiBwcm94eTtcbiAgY29uc3QgeyBwcm94eTogX2N1c3RvbVByb3h5LCAuLi5yZXN0Q3VzdG9tU2VydmVyIH0gPSBjdXN0b21TZXJ2ZXIgfHwge307XG4gIC8vIFx1NkRGQlx1NTJBMFx1NzZEMVx1NjNBN1x1NjcwRFx1NTJBMVx1NEVFM1x1NzQwNlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NzlDMVx1NjcwOVx1N0Y1MVx1N0VEQ1x1OEJGN1x1NkM0Mlx1OEI2Nlx1NTQ0QVxuICAvLyBcdTVDMDYgL19fbW9uaXRvcl9fIFx1NEVFM1x1NzQwNlx1NTIzMFx1NzZEMVx1NjNBN1x1NjcwRFx1NTJBMVx1RkYwOGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMVx1RkYwOVxuICBjb25zdCBtb25pdG9yUHJveHkgPSB7XG4gICAgJy9fX21vbml0b3JfXyc6IHtcbiAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMScsXG4gICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICByZXdyaXRlOiAocGF0aDogc3RyaW5nKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9fX21vbml0b3JfXy8sICcnKSxcbiAgICAgIHdzOiB0cnVlLCAvLyBcdTY1MkZcdTYzMDEgV2ViU29ja2V0XHVGRjA4U1NFIFx1NEY3Rlx1NzUyOFx1RkYwOVxuICAgIH0sXG4gIH07XG4gIFxuICAvLyBcdTU0MDhcdTVFNzZcdTRFRTNcdTc0MDZcdTkxNERcdTdGNkVcdUZGMUFcdTc2RDFcdTYzQTdcdTY3MERcdTUyQTFcdTRFRTNcdTc0MDZcdTRGMThcdTUxNDhcdUZGMENcdTcxMzZcdTU0MEVcdTY2MkZcdTRFMUFcdTUyQTFcdTRFRTNcdTc0MDZcbiAgY29uc3QgbWVyZ2VkUHJveHkgPSB7XG4gICAgLi4ubW9uaXRvclByb3h5LFxuICAgIC4uLmZpbmFsUHJveHksXG4gIH07XG4gIFxuICBjb25zdCBzZXJ2ZXJDb25maWc6IFVzZXJDb25maWdbJ3NlcnZlciddID0ge1xuICAgIHBvcnQ6IGFwcENvbmZpZy5kZXZQb3J0LFxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIGNvcnM6IHRydWUsXG4gICAgb3JpZ2luOiBgaHR0cDovLyR7YXBwQ29uZmlnLmRldkhvc3R9OiR7YXBwQ29uZmlnLmRldlBvcnR9YCxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoJyxcbiAgICB9LFxuICAgIGhtcjoge1xuICAgICAgaG9zdDogYXBwQ29uZmlnLmRldkhvc3QsXG4gICAgICBwb3J0OiBhcHBDb25maWcuZGV2UG9ydCxcbiAgICAgIG92ZXJsYXk6IGZhbHNlLFxuICAgIH0sXG4gICAgcHJveHk6IG1lcmdlZFByb3h5LFxuICAgIGZzOiB7XG4gICAgICBzdHJpY3Q6IGZhbHNlLFxuICAgICAgYWxsb3c6IFtcbiAgICAgICAgd2l0aFJvb3QoJy4nKSxcbiAgICAgIF0sXG4gICAgICBjYWNoZWRDaGVja3M6IHRydWUsXG4gICAgfSxcbiAgICAuLi5yZXN0Q3VzdG9tU2VydmVyLFxuICB9O1xuXG4gIC8vIFx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1OTE0RFx1N0Y2RVxuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTk4ODRcdTg5QzhcdTY3MERcdTUyQTFcdTU2NjhcdTRFQ0VcdTY4MzlcdTc2RUVcdTVGNTVcdTc2ODQgZGlzdC97cHJvZEhvc3R9IFx1OEJGQlx1NTNENlx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1RkYwQ1x1ODAwQ1x1NEUwRFx1NjYyRlx1NEVDRSBhcHBzL3thcHBOYW1lfS9kaXN0IFx1OEJGQlx1NTNENlxuICBjb25zdCByb290RGlzdERpciA9IHJlc29sdmUoYXBwRGlyLCAnLi4vLi4vZGlzdCcpO1xuICBjb25zdCBwcmV2aWV3Um9vdCA9IHJlc29sdmUocm9vdERpc3REaXIsIGFwcENvbmZpZy5wcm9kSG9zdCk7XG5cbiAgY29uc3QgcHJldmlld0NvbmZpZzogVXNlckNvbmZpZ1sncHJldmlldyddID0ge1xuICAgIHBvcnQ6IGFwcENvbmZpZy5wcmVQb3J0LFxuICAgIHN0cmljdFBvcnQ6IHRydWUsXG4gICAgb3BlbjogZmFsc2UsXG4gICAgaG9zdDogJzAuMC4wLjAnLFxuICAgIHByb3h5LFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiBhcHBDb25maWcubWFpbkFwcE9yaWdpbixcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCxPUFRJT05TJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscyc6ICd0cnVlJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZScsXG4gICAgfSxcbiAgICAuLi5jdXN0b21QcmV2aWV3LFxuICB9IGFzIGFueTtcblxuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdThCQkVcdTdGNkVcdTk4ODRcdTg5QzhcdTY3MERcdTUyQTFcdTU2NjhcdTc2ODRcdTY4MzlcdTc2RUVcdTVGNTVcdTRFM0EgZGlzdC97cHJvZEhvc3R9XG4gIC8vIFx1NkNFOFx1NjEwRlx1RkYxQXJvb3QgXHU1QzVFXHU2MDI3XHU1NzI4XHU2NUIwXHU3MjQ4XHU2NzJDXHU3Njg0IFZpdGUgXHU3QzdCXHU1NzhCXHU0RTJEXHU1M0VGXHU4MEZEXHU2NzJBXHU1QjlBXHU0RTQ5XHVGRjBDXHU0RjQ2XHU4RkQwXHU4ODRDXHU2NUY2XHU0RUNEXHU2NTJGXHU2MzAxXG4gIChwcmV2aWV3Q29uZmlnIGFzIGFueSkucm9vdCA9IHByZXZpZXdSb290O1xuXG4gIGNvbnN0IGFwcENhY2hlRGlyID0gcmVzb2x2ZShhcHBEaXIsICdub2RlX21vZHVsZXMvLnZpdGUnKTtcblxuICBjb25zdCBvcHRpbWl6ZURlcHNDb25maWc6IFVzZXJDb25maWdbJ29wdGltaXplRGVwcyddID0ge1xuICAgIGluY2x1ZGU6IFtcbiAgICAgIC8vIFx1NjgzOFx1NUZDM1x1NEY5RFx1OEQ1Nlx1RkYxQVx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NUI4OVx1ODhDNVx1NzY4NFx1NEY5RFx1OEQ1NlxuICAgICAgJ3Z1ZScsXG4gICAgICAndnVlLXJvdXRlcicsXG4gICAgICAncGluaWEnLFxuICAgICAgJ2VsZW1lbnQtcGx1cycsXG4gICAgICAvLyBXaW5zdG9uIFx1OTcwMFx1ODk4MVx1NzY4NCBOb2RlLmpzIFx1NkEyMVx1NTc1NyBwb2x5ZmlsbFxuICAgICAgJ3V0aWwnLFxuICAgICAgJ2VsZW1lbnQtcGx1cy9lcycsXG4gICAgICAnZWxlbWVudC1wbHVzL2VzL2xvY2FsZS9sYW5nL3poLWNuJyxcbiAgICAgICdlbGVtZW50LXBsdXMvZXMvbG9jYWxlL2xhbmcvZW4nLFxuICAgICAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2Nhc2NhZGVyL3N0eWxlL2NzcycsXG4gICAgICAnQGVsZW1lbnQtcGx1cy9pY29ucy12dWUnLFxuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUnLFxuICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBQGJ0Yy9zaGFyZWQtY29tcG9uZW50cyBcdTVERjJcdTRFQ0UgaW5jbHVkZSBcdTRFMkRcdTc5RkJcdTk2NjRcdUZGMENcdTU2RTBcdTRFM0FcdTVCODNcdTUzMDVcdTU0MkIgVFNYIFx1NjU4N1x1NEVGNlxuICAgICAgLy8gXHU1NzI4XHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU0RTJEXHVGRjBDXHU1RTk0XHU4QkU1XHU3NkY0XHU2M0E1XHU0RUNFXHU2RTkwXHU3ODAxXHU1QkZDXHU1MTY1XHVGRjBDXHU4MDBDXHU0RTBEXHU2NjJGXHU5ODg0XHU2Nzg0XHU1RUZBXG4gICAgICAvLyAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cycsXG4gICAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnLFxuICAgICAgJ0BidGMvc3ViYXBwLW1hbmlmZXN0cycsXG4gICAgICAndml0ZS1wbHVnaW4tcWlhbmt1bi9kaXN0L2hlbHBlcicsXG4gICAgICAncWlhbmt1bicsXG4gICAgICAnQHZ1ZXVzZS9jb3JlJyxcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OEZEOVx1NEU5Qlx1NEY5RFx1OEQ1Nlx1NzNCMFx1NTcyOFx1NURGMlx1N0VDRlx1NTcyOFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NzY4NCBwYWNrYWdlLmpzb24gXHU0RTJEXHU1OEYwXHU2NjBFXG4gICAgICAvLyBcdTkwMUFcdThGQzcgQGJ0Yy9zaGFyZWQtY29tcG9uZW50cyBcdTk1RjRcdTYzQTVcdTRGN0ZcdTc1MjhcdUZGMENcdTRGNDZcdTk3MDBcdTg5ODFcdTU3MjhcdTVFOTRcdTc1MjhcdTRFMkRcdTY2M0VcdTVGMEZcdTU4RjBcdTY2MEVcdTRFRTVcdTRGQkYgVml0ZSBcdTZCNjNcdTc4NkVcdTg5RTNcdTY3OTBcbiAgICAgICdsb2Rhc2gtZXMnLFxuICAgICAgJ2NoYXJkZXQnLFxuICAgICAgJ3hsc3gnLFxuICAgICAgJ3Z1ZS1pMThuJyxcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQWVjaGFydHMgXHU3NkY4XHU1MTczXHU0RjlEXHU4RDU2XHU5NzAwXHU4OTgxXHU4OEFCXHU5ODg0XHU2Nzg0XHU1RUZBXG4gICAgICAvLyBcdTg2N0RcdTcxMzZcdTUzRUFcdTU3MjhcdTkwRThcdTUyMDZcdTVFOTRcdTc1MjhcdTRFMkRcdTRGN0ZcdTc1MjhcdUZGMENcdTRGNDZcdTZERkJcdTUyQTBcdTUyMzAgaW5jbHVkZSBcdTRFMkRcdTUzRUZcdTRFRTVcdTkwN0ZcdTUxNERcdThGRDBcdTg4NENcdTY1RjZcdTRGMThcdTUzMTZcbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NUU5NFx1NzUyOFx1NjcyQVx1NUI4OVx1ODhDNVx1OEZEOVx1NEU5Qlx1NEY5RFx1OEQ1Nlx1RkYwQ1ZpdGUgXHU0RjFBXHU1RkZEXHU3NTY1XHU1QjgzXHU0RUVDXHVGRjA4XHU0RTBEXHU0RjFBXHU2MkE1XHU5NTE5XHVGRjA5XG4gICAgICAnZWNoYXJ0cy9jb3JlJyxcbiAgICAgICdlY2hhcnRzJyxcbiAgICAgICd2dWUtZWNoYXJ0cycsXG4gICAgXSxcbiAgICAvLyBcdTYzOTJcdTk2NjRcdTRFMERcdTVFOTRcdThCRTVcdTg4QUJcdTRGMThcdTUzMTZcdTc2ODRcdTRGOURcdThENTZcbiAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFleGNsdWRlIFx1NEY3Rlx1NzUyOFx1NTMwNVx1NTQwRFx1NjIxNlx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1NkEyMVx1NUYwRlxuICAgIGV4Y2x1ZGU6IFtcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQUBidGMvc2hhcmVkLWNvcmUvY29uZmlncy9sYXlvdXQtYnJpZGdlIFx1NjYyRlx1NjcyQ1x1NTczMFx1NTIyQlx1NTQwRFx1OERFRlx1NUY4NFx1RkYwQ1x1NEUwRFx1NjYyRiBucG0gXHU1MzA1XHVGRjBDXHU0RTBEXHU1RTk0XHU4QkU1XHU4OEFCXHU0RjE4XHU1MzE2XG4gICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFleGNsdWRlIFx1NTNFQVx1NjUyRlx1NjMwMVx1NUI1N1x1N0IyNlx1NEUzMlx1NkEyMVx1NUYwRlx1RkYwQ1x1NEUwRFx1NjUyRlx1NjMwMVx1NkI2M1x1NTIxOVx1ODg2OFx1OEZCRVx1NUYwRlxuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUvY29uZmlncy9sYXlvdXQtYnJpZGdlJyxcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NjM5Mlx1OTY2NCBAYnRjL3NoYXJlZC1jb21wb25lbnRzXHVGRjBDXHU1NkUwXHU0RTNBXHU1QjgzXHU2NjJGXHU2NzJDXHU1NzMwXHU1MzA1XHVGRjBDXHU1MzA1XHU1NDJCIFRTWCBcdTY1ODdcdTRFRjZcbiAgICAgIC8vIFx1NTcyOFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NEUyRFx1RkYwQ1x1NUU5NFx1OEJFNVx1NzZGNFx1NjNBNVx1NEVDRVx1NkU5MFx1NzgwMVx1NUJGQ1x1NTE2NVx1RkYwQ1x1ODAwQ1x1NEUwRFx1NjYyRlx1OTg4NFx1Njc4NFx1NUVGQVxuICAgICAgLy8gXHU4RkQ5XHU2ODM3XHU1M0VGXHU0RUU1XHU5MDdGXHU1MTREIEpTWCBcdTg5RTNcdTY3OTBcdTk1RUVcdTk4OThcbiAgICAgICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJyxcbiAgICBdLFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OEJCRVx1N0Y2RVx1NEUzQSB0cnVlXHVGRjBDXHU1RjNBXHU1MjM2XHU5MUNEXHU2NUIwXHU2Nzg0XHU1RUZBXHU2MjQwXHU2NzA5XHU0RjlEXHU4RDU2XHVGRjBDXHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5XHU0RjlEXHU4RDU2XHU5MEZEXHU4OEFCXHU5ODg0XHU2Nzg0XHU1RUZBXG4gICAgLy8gXHU4RkQ5XHU0RjFBXHU1NzI4XHU5OTk2XHU2QjIxXHU1NDJGXHU1MkE4XHU2NUY2XHU2Nzg0XHU1RUZBXHU2MjQwXHU2NzA5XHU0RjlEXHU4RDU2XHVGRjBDXHU0RTRCXHU1NDBFXHU1QzMxXHU0RTBEXHU0RjFBXHU1MThEXHU4OUU2XHU1M0QxXHU0RTg2XG4gICAgZm9yY2U6IGZhbHNlLFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTNDMlx1ODAwMyBjb29sLWFkbWluIFx1NzY4NFx1NTA1QVx1NkNENVxuICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NEUwRFx1NTE4RFx1NTMwNVx1NTQyQiBzaGFyZWQtY29tcG9uZW50cy9zcmMvaW5kZXgudHNcdUZGMENcdTU2RTBcdTRFM0FcdTVCODNcdTUzMDVcdTU0MkIgVFNYIFx1NjU4N1x1NEVGNlx1RkYwQ1x1NUU5NFx1OEJFNVx1NTcyOFx1OEZEMFx1ODg0Q1x1NjVGNlx1NzZGNFx1NjNBNVx1NTkwNFx1NzQwNlxuICAgIC8vIHNoYXJlZC1jb21wb25lbnRzIFx1NEUyRFx1NzY4NFx1NEY5RFx1OEQ1Nlx1RkYwOFx1NTk4MiBsdW5yLCBjaGFyZGV0IFx1N0I0OVx1RkYwOVx1NEYxQVx1NTcyOFx1OEZEMFx1ODg0Q1x1NjVGNlx1ODhBQlx1ODFFQVx1NTJBOFx1NTNEMVx1NzNCMFx1NTQ4Q1x1NEYxOFx1NTMxNlxuICAgIGVudHJpZXM6IFtcbiAgICAgIC8vIFx1NUU5NFx1NzUyOFx1NzY4NFx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlxuICAgICAgcmVzb2x2ZShhcHBEaXIsICdzcmMvbWFpbi50cycpLFxuICAgIF0sXG4gICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgIHBsdWdpbnM6IFtdLFxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3ODZFXHU0RkREXHU0RjlEXHU4RDU2XHU5ODg0XHU2Nzg0XHU1RUZBXHU2NUY2XHU0RTVGXHU0RjdGXHU3NTI4IFZ1ZSBcdTc2ODQgSlNYIFx1OEY2Q1x1NjM2Mlx1NjVCOVx1NUYwRlxuICAgICAganN4OiAncHJlc2VydmUnLCAvLyBcdTRGRERcdTc1NTkgSlNYXHVGRjBDXHU4QkE5IHZ1ZUpzeCBcdTYzRDJcdTRFRjZcdTU5MDRcdTc0MDZcbiAgICAgIGpzeEZhY3Rvcnk6ICdoJywgLy8gXHU0RjdGXHU3NTI4IFZ1ZSBcdTc2ODQgaCBcdTUxRkRcdTY1NzBcdTRGNUNcdTRFM0EgSlNYIFx1NURFNVx1NTM4Mlx1NTFGRFx1NjU3MFxuICAgICAganN4RnJhZ21lbnQ6ICdGcmFnbWVudCcsIC8vIFx1NEY3Rlx1NzUyOCBWdWUgXHU3Njg0IEZyYWdtZW50XG4gICAgfSxcbiAgICAuLi5jdXN0b21PcHRpbWl6ZURlcHMsXG4gIH07XG5cbiAgLy8gQ1NTIFx1OTE0RFx1N0Y2RVxuICBjb25zdCBjc3NDb25maWc6IFVzZXJDb25maWdbJ2NzcyddID0ge1xuICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgIHNjc3M6IHtcbiAgICAgICAgYXBpOiAnbW9kZXJuLWNvbXBpbGVyJyxcbiAgICAgICAgc2lsZW5jZURlcHJlY2F0aW9uczogWydsZWdhY3ktanMtYXBpJywgJ2ltcG9ydCddLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGRldlNvdXJjZW1hcDogZmFsc2UsXG4gICAgLi4uY3VzdG9tQ3NzLFxuICB9O1xuXG4gIC8vIFx1OEZENFx1NTZERVx1NUI4Q1x1NjU3NFx1OTE0RFx1N0Y2RVxuICAvLyBcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTRGN0ZcdTc1MjhcdTUyMkJcdTU0MERcdTYzMDdcdTU0MTFcdTZFOTBcdTc4MDFcdUZGMDhcdTU2RTBcdTRFM0FcdTkwRkRcdTYyNTNcdTUzMDUgQGJ0Yy8qIFx1NTMwNVx1RkYwOVxuICBjb25zdCBiYXNlUmVzb2x2ZSA9IGNyZWF0ZUJhc2VSZXNvbHZlKGFwcERpciwgYXBwTmFtZSk7XG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NzUxRlx1NEVBNy9cdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdTY1RjZcdUZGMENcdTVCNTBcdTVFOTRcdTc1MjhcdTRFMERcdTUxOERcdTRGN0ZcdTc1MjhcdTY3MkNcdTU3MzAgdmlydHVhbDplcHNcdUZGMDhcdTc1MzEgbGF5b3V0LWFwcCBcdTYzRDBcdTRGOUJcdTUxNzFcdTRFQUIgRVBTIFx1NjcwRFx1NTJBMVx1RkYwOVxuICAvLyBcdThGRDlcdTY4MzdcdTUzRUZcdTRFRTVcdTkwN0ZcdTUxNERcdTVCNTBcdTVFOTRcdTc1MjhcdTUxNjVcdTUzRTNcdTRFQTdcdTc1MUZcdTVCRjlcdTgxRUFcdThFQUIgZXBzLXNlcnZpY2UteHh4LmpzIFx1NzY4NFx1NUYxNVx1NzUyOFx1RkYwQ1x1NUJGQ1x1ODFGNFx1NTE3MVx1NEVBQlx1NEUwRFx1NzUxRlx1NjU0OFx1NjIxNiA0MDRcdTMwMDJcbiAgY29uc3Qgc2hvdWxkVXNlU2hhcmVkRXBzID0gKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHx8IGlzUHJldmlld0J1aWxkO1xuICBjb25zdCBzaGFyZWRFcHNTdHViID0gcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9jb25maWdzL3ZpdGUvc3R1YnMvdmlydHVhbC1lcHMtZW1wdHkudHMnKTtcbiAgY29uc3QgZmluYWxSZXNvbHZlID0gc2hvdWxkVXNlU2hhcmVkRXBzXG4gICAgPyB7XG4gICAgICAgIC4uLmJhc2VSZXNvbHZlLFxuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRERcdTYzMDFcdTUyMkJcdTU0MERcdTY1NzBcdTdFQzRcdTVGNjJcdTVGMEZcdUZGMENcdTZERkJcdTUyQTAgdmlydHVhbDplcHMgXHU1MjJCXHU1NDBEXG4gICAgICAgIGFsaWFzOiBBcnJheS5pc0FycmF5KGJhc2VSZXNvbHZlPy5hbGlhcylcbiAgICAgICAgICA/IFtcbiAgICAgICAgICAgICAgLi4uYmFzZVJlc29sdmUuYWxpYXMsXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaW5kOiAndmlydHVhbDplcHMnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50OiBzaGFyZWRFcHNTdHViLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXVxuICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAuLi4oYmFzZVJlc29sdmU/LmFsaWFzIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz4gfHwge30pLFxuICAgICAgICAgICAgICAndmlydHVhbDplcHMnOiBzaGFyZWRFcHNTdHViLFxuICAgICAgICAgICAgfSxcbiAgICAgIH1cbiAgICA6IGJhc2VSZXNvbHZlO1xuXG4gIGNvbnN0IGNvbmZpZzogYW55ID0ge1xuICAgIGJhc2U6IGJhc2VVcmwsXG4gICAgcHVibGljRGlyLFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NkJDRlx1NEUyQVx1NUU5NFx1NzUyOFx1NEY3Rlx1NzUyOFx1NzJFQ1x1N0FDQlx1NzY4NFx1N0YxM1x1NUI1OFx1NzZFRVx1NUY1NVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NEUwRFx1NTQwQ1x1NUU5NFx1NzUyOFx1NzY4NFx1OTE0RFx1N0Y2RVx1NURFRVx1NUYwMlx1NUJGQ1x1ODFGNFx1N0YxM1x1NUI1OFx1NTFCMlx1N0E4MVxuICAgIC8vIFx1ODY3RFx1NzEzNlx1OEZEOVx1NEYxQVx1NTg5RVx1NTJBMFx1NEUwMFx1NEU5Qlx1NUI1OFx1NTBBOFx1N0E3QVx1OTVGNFx1RkYwQ1x1NEY0Nlx1NTNFRlx1NEVFNVx1Nzg2RVx1NEZERFx1NkJDRlx1NEUyQVx1NUU5NFx1NzUyOFx1NzY4NFx1N0YxM1x1NUI1OFx1NzJCNlx1NjAwMVx1NEUwMFx1ODFGNFx1RkYwQ1x1OTA3Rlx1NTE0RFx1OTg5MVx1N0U0MVx1OTFDRFx1NjVCMFx1Njc4NFx1NUVGQVxuICAgIGNhY2hlRGlyOiBhcHBDYWNoZURpcixcbiAgICBkZWZpbmU6IHtcbiAgICAgIC8vIFx1NEUzQVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NzNBRlx1NTg4M1x1NjNEMFx1NEY5QiBwcm9jZXNzIFx1NUJGOVx1OEM2MVx1RkYwQ1dpbnN0b24gXHU5NzAwXHU4OTgxXHU1QjgzXG4gICAgICAncHJvY2Vzcy5lbnYnOiAne30nLFxuICAgICAgJ3Byb2Nlc3MucGxhdGZvcm0nOiBKU09OLnN0cmluZ2lmeSgnYnJvd3NlcicpLFxuICAgICAgJ3Byb2Nlc3MudmVyc2lvbic6IEpTT04uc3RyaW5naWZ5KCcnKSxcbiAgICB9LFxuICAgIHBsdWdpbnMsXG4gICAgZXNidWlsZDoge1xuICAgICAgY2hhcnNldDogJ3V0ZjgnLFxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3ODZFXHU0RkREIGVzYnVpbGQgXHU2QjYzXHU3ODZFXHU1OTA0XHU3NDA2IEpTWFx1RkYwQ1x1NEY3Rlx1NzUyOCBWdWUgXHU3Njg0IGggXHU1MUZEXHU2NTcwXHU4MDBDXHU0RTBEXHU2NjJGIFJlYWN0LmNyZWF0ZUVsZW1lbnRcbiAgICAgIC8vIFx1OEZEOVx1NjgzN1x1NTM3M1x1NEY3RiBlc2J1aWxkIFx1NTkwNFx1NzQwNlx1NjdEMFx1NEU5QiBKU1ggXHU2NTg3XHU0RUY2XHVGRjBDXHU0RTVGXHU0RjFBXHU0RjdGXHU3NTI4XHU2QjYzXHU3ODZFXHU3Njg0XHU4RjZDXHU2MzYyXHU2NUI5XHU1RjBGXG4gICAgICBqc3g6ICdwcmVzZXJ2ZScsIC8vIFx1NEZERFx1NzU1OSBKU1hcdUZGMENcdThCQTkgdnVlSnN4IFx1NjNEMlx1NEVGNlx1NTkwNFx1NzQwNlxuICAgICAganN4RmFjdG9yeTogJ2gnLCAvLyBcdTRGN0ZcdTc1MjggVnVlIFx1NzY4NCBoIFx1NTFGRFx1NjU3MFx1NEY1Q1x1NEUzQSBKU1ggXHU1REU1XHU1MzgyXHU1MUZEXHU2NTcwXG4gICAgICBqc3hGcmFnbWVudDogJ0ZyYWdtZW50JywgLy8gXHU0RjdGXHU3NTI4IFZ1ZSBcdTc2ODQgRnJhZ21lbnRcbiAgICB9LFxuICAgIHNlcnZlcjogc2VydmVyQ29uZmlnLFxuICAgIHByZXZpZXc6IHByZXZpZXdDb25maWcsXG4gICAgb3B0aW1pemVEZXBzOiBvcHRpbWl6ZURlcHNDb25maWcsXG4gICAgY3NzOiBjc3NDb25maWcsXG4gICAgYnVpbGQ6IGJ1aWxkQ29uZmlnLFxuICB9O1xuXG4gIC8vIFx1NjYwRVx1Nzg2RVx1NTkwNFx1NzQwNlx1NTNFRlx1OTAwOVx1NUM1RVx1NjAyN1x1NzY4NCB1bmRlZmluZWRcdUZGMDhleGFjdE9wdGlvbmFsUHJvcGVydHlUeXBlc1x1RkYwOVxuICBpZiAoZmluYWxSZXNvbHZlICE9PSB1bmRlZmluZWQpIHtcbiAgICBjb25maWcucmVzb2x2ZSA9IGZpbmFsUmVzb2x2ZTtcbiAgfVxuXG4gIHJldHVybiBjb25maWc7XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcdXRpbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHV0aWxzXFxcXHBhdGgtaGVscGVycy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvdXRpbHMvcGF0aC1oZWxwZXJzLnRzXCI7LyoqXG4gKiBcdThERUZcdTVGODRcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcbiAqIFx1NjNEMFx1NEY5Qlx1N0VERlx1NEUwMFx1NzY4NFx1OERFRlx1NUY4NFx1ODlFM1x1Njc5MFx1NTFGRFx1NjU3MFx1RkYwQ1x1NzUyOFx1NEU4RSBWaXRlIFx1OTE0RFx1N0Y2RVx1NEUyRFx1NzY4NFx1NTIyQlx1NTQwRFx1NTQ4Q1x1OERFRlx1NUY4NFx1ODlFM1x1Njc5MFxuICovXG5cbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcblxuLyoqXG4gKiBcdTUyMUJcdTVFRkFcdThERUZcdTVGODRcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcbiAqIEBwYXJhbSBhcHBEaXIgXHU1RTk0XHU3NTI4XHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XG4gKiBAcmV0dXJucyBcdThERUZcdTVGODRcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcdTVCRjlcdThDNjFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBhdGhIZWxwZXJzKGFwcERpcjogc3RyaW5nKSB7XG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTBcdTVFOTRcdTc1Mjggc3JjIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFxuICAgKi9cbiAgY29uc3Qgd2l0aFNyYyA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZykgPT4gcmVzb2x2ZShhcHBEaXIsIHJlbGF0aXZlUGF0aCk7XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MCBwYWNrYWdlcyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcbiAgICovXG4gIGNvbnN0IHdpdGhQYWNrYWdlcyA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZykgPT4gXG4gICAgcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9wYWNrYWdlcycsIHJlbGF0aXZlUGF0aCk7XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MFx1OTg3OVx1NzZFRVx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFxuICAgKi9cbiAgY29uc3Qgd2l0aFJvb3QgPSAocmVsYXRpdmVQYXRoOiBzdHJpbmcpID0+IFxuICAgIHJlc29sdmUoYXBwRGlyLCAnLi4vLi4nLCByZWxhdGl2ZVBhdGgpO1xuXG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTAgY29uZmlncyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcbiAgICovXG4gIGNvbnN0IHdpdGhDb25maWdzID0gKHJlbGF0aXZlUGF0aDogc3RyaW5nKSA9PiBcbiAgICByZXNvbHZlKGFwcERpciwgJy4uLy4uL2NvbmZpZ3MnLCByZWxhdGl2ZVBhdGgpO1xuXG4gIHJldHVybiB7IHdpdGhTcmMsIHdpdGhQYWNrYWdlcywgd2l0aFJvb3QsIHdpdGhDb25maWdzIH07XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcYXV0by1pbXBvcnQuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3MvYXV0by1pbXBvcnQuY29uZmlnLnRzXCI7XHVGRUZGLyoqXG4gKiBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTkxNERcdTdGNkVcdTZBMjFcdTY3N0ZcbiAqIFx1NEY5Qlx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1RkYwOGFkbWluLWFwcCwgbG9naXN0aWNzLWFwcCBcdTdCNDlcdUZGMDlcdTRGN0ZcdTc1MjhcbiAqL1xuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSc7XG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJztcbmltcG9ydCB7IEVsZW1lbnRQbHVzUmVzb2x2ZXIgfSBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnMnO1xuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBBdXRvIEltcG9ydCBcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUF1dG9JbXBvcnRDb25maWcoKSB7XG4gIHJldHVybiBBdXRvSW1wb3J0KHtcbiAgICBpbXBvcnRzOiBbXG4gICAgICAndnVlJyxcbiAgICAgICd2dWUtcm91dGVyJyxcbiAgICAgICdwaW5pYScsXG4gICAgICB7XG4gICAgICAgICdAYnRjL3NoYXJlZC1jb3JlJzogW1xuICAgICAgICAgICd1c2VDcnVkJyxcbiAgICAgICAgICAndXNlRGljdCcsXG4gICAgICAgICAgJ3VzZVBlcm1pc3Npb24nLFxuICAgICAgICAgICd1c2VSZXF1ZXN0JyxcbiAgICAgICAgICAnY3JlYXRlSTE4blBsdWdpbicsXG4gICAgICAgICAgJ3VzZUkxOG4nLFxuICAgICAgICBdLFxuICAgICAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnOiBbXG4gICAgICAgICAgJ2Zvcm1hdERhdGUnLFxuICAgICAgICAgICdmb3JtYXREYXRlVGltZScsXG4gICAgICAgICAgJ2Zvcm1hdE1vbmV5JyxcbiAgICAgICAgICAnZm9ybWF0TnVtYmVyJyxcbiAgICAgICAgICAnaXNFbWFpbCcsXG4gICAgICAgICAgJ2lzUGhvbmUnLFxuICAgICAgICAgICdzdG9yYWdlJyxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgXSxcblxuICAgIHJlc29sdmVyczogW1xuICAgICAgRWxlbWVudFBsdXNSZXNvbHZlcih7XG4gICAgICAgIGltcG9ydFN0eWxlOiBmYWxzZSwgLy8gXHU3OTgxXHU3NTI4XHU2MzA5XHU5NzAwXHU2ODM3XHU1RjBGXHU1QkZDXHU1MTY1XG4gICAgICB9KSxcbiAgICBdLFxuXG4gICAgZHRzOiAnc3JjL2F1dG8taW1wb3J0cy5kLnRzJyxcblxuICAgIGVzbGludHJjOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZmlsZXBhdGg6ICcuLy5lc2xpbnRyYy1hdXRvLWltcG9ydC5qc29uJyxcbiAgICB9LFxuXG4gICAgdnVlVGVtcGxhdGU6IHRydWUsXG4gIH0pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudHNDb25maWdPcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1OTg5RFx1NTkxNlx1NzY4NFx1N0VDNFx1NEVGNlx1NzZFRVx1NUY1NVx1RkYwOFx1NzUyOFx1NEU4RVx1NTdERlx1N0VBN1x1N0VDNFx1NEVGNlx1RkYwOVxuICAgKi9cbiAgZXh0cmFEaXJzPzogc3RyaW5nW107XG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdTVCRkNcdTUxNjVcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdTVFOTNcbiAgICovXG4gIGluY2x1ZGVTaGFyZWQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBDb21wb25lbnRzIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1OTE0RFx1N0Y2RVxuICogQHBhcmFtIG9wdGlvbnMgXHU5MTREXHU3RjZFXHU5MDA5XHU5ODc5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRzQ29uZmlnKG9wdGlvbnM6IENvbXBvbmVudHNDb25maWdPcHRpb25zID0ge30pIHtcbiAgY29uc3QgeyBleHRyYURpcnMgPSBbXSwgaW5jbHVkZVNoYXJlZCA9IHRydWUgfSA9IG9wdGlvbnM7XG5cbiAgY29uc3QgZGlycyA9IFtcbiAgICAnc3JjL2NvbXBvbmVudHMnLCAvLyBcdTVFOTRcdTc1MjhcdTdFQTdcdTdFQzRcdTRFRjZcbiAgICAuLi5leHRyYURpcnMsIC8vIFx1OTg5RFx1NTkxNlx1NzY4NFx1NTdERlx1N0VBN1x1N0VDNFx1NEVGNlx1NzZFRVx1NUY1NVxuICBdO1xuXG4gIC8vIFx1NTk4Mlx1Njc5Q1x1NTMwNVx1NTQyQlx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1RkYwQ1x1NkRGQlx1NTJBMFx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NTIwNlx1N0VDNFx1NzZFRVx1NUY1NVxuICBpZiAoaW5jbHVkZVNoYXJlZCkge1xuICAgIC8vIFx1NkRGQlx1NTJBMFx1NTIwNlx1N0VDNFx1NzZFRVx1NUY1NVx1RkYwQ1x1NjUyRlx1NjMwMVx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVxuICAgIGRpcnMucHVzaChcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9iYXNpYycsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvbGF5b3V0JyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9uYXZpZ2F0aW9uJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9mb3JtJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9kYXRhJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9mZWVkYmFjaycsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvb3RoZXJzJ1xuICAgICk7XG4gIH1cblxuICByZXR1cm4gQ29tcG9uZW50cyh7XG4gICAgcmVzb2x2ZXJzOiBbXG4gICAgICBFbGVtZW50UGx1c1Jlc29sdmVyKHtcbiAgICAgICAgaW1wb3J0U3R5bGU6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTYzMDlcdTk3MDBcdTY4MzdcdTVGMEZcdTVCRkNcdTUxNjVcdUZGMENcdTkwN0ZcdTUxNEQgVml0ZSByZWxvYWRpbmdcbiAgICAgIH0pLFxuICAgICAgLy8gXHU4MUVBXHU1QjlBXHU0RTQ5XHU4OUUzXHU2NzkwXHU1NjY4XHVGRjFBQGJ0Yy9zaGFyZWQtY29tcG9uZW50c1xuICAgICAgKGNvbXBvbmVudE5hbWUpID0+IHtcbiAgICAgICAgLy8gXHU1QzA2IGtlYmFiLWNhc2UgXHU4RjZDXHU2MzYyXHU0RTNBIFBhc2NhbENhc2VcbiAgICAgICAgLy8gXHU0RjhCXHU1OTgyOiBidGMtc3ZnIC0+IEJ0Y1N2Z1xuICAgICAgICBjb25zdCBjb252ZXJ0VG9QYXNjYWxDYXNlID0gKG5hbWU6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgnQnRjJykpIHtcbiAgICAgICAgICAgIHJldHVybiBuYW1lOyAvLyBcdTVERjJcdTdFQ0ZcdTY2MkYgUGFzY2FsQ2FzZVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCdidGMtJykpIHtcbiAgICAgICAgICAgIC8vIGJ0Yy1zdmcgLT4gQnRjU3ZnXG4gICAgICAgICAgICByZXR1cm4gbmFtZVxuICAgICAgICAgICAgICAuc3BsaXQoJy0nKVxuICAgICAgICAgICAgICAubWFwKHBhcnQgPT4gcGFydC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHBhcnQuc2xpY2UoMSkpXG4gICAgICAgICAgICAgIC5qb2luKCcnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGNvbXBvbmVudE5hbWUuc3RhcnRzV2l0aCgnQnRjJykgfHwgY29tcG9uZW50TmFtZS5zdGFydHNXaXRoKCdidGMtJykpIHtcbiAgICAgICAgICBjb25zdCBwYXNjYWxOYW1lID0gY29udmVydFRvUGFzY2FsQ2FzZShjb21wb25lbnROYW1lKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogcGFzY2FsTmFtZSxcbiAgICAgICAgICAgIGZyb206ICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJyxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIF0sXG4gICAgZHRzOiAnc3JjL2NvbXBvbmVudHMuZC50cycsXG4gICAgZGlycyxcbiAgICBleHRlbnNpb25zOiBbJ3Z1ZScsICd0c3gnXSwgLy8gXHU2NTJGXHU2MzAxIC52dWUgXHU1NDhDIC50c3ggXHU2NTg3XHU0RUY2XG4gICAgLy8gXHU1RjNBXHU1MjM2XHU5MUNEXHU2NUIwXHU2MjZCXHU2M0NGXHU3RUM0XHU0RUY2XG4gICAgZGVlcDogdHJ1ZSxcbiAgICAvLyBcdTUzMDVcdTU0MkJcdTYyNDBcdTY3MDkgQnRjIFx1NUYwMFx1NTkzNFx1NzY4NFx1N0VDNFx1NEVGNlxuICAgIGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC50c3gkLywgL0J0Y1tBLVpdLywgL2J0Yy1bYS16XS9dLFxuICB9KTtcbn1cbi8vIFVURi04IGVuY29kaW5nIGZpeFxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlLWFwcC1jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlLWFwcC1jb25maWcudHNcIjsvKipcbiAqIFZpdGUgXHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHU4Rjg1XHU1MkE5XHU1MUZEXHU2NTcwXG4gKiBcdTc1MjhcdTRFOEVcdTRFQ0VcdTdFREZcdTRFMDBcdTkxNERcdTdGNkVcdTRFMkRcdTgzQjdcdTUzRDZcdTVFOTRcdTc1MjhcdTc2ODRcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcbiAqL1xuXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBnZXRBcHBDb25maWcgfSBmcm9tICcuLi9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMvY29uZmlncy9hcHAtZW52LmNvbmZpZyc7XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHVGRjA4XHU3NTI4XHU0RThFIHZpdGUuY29uZmlnLnRzXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRWaXRlQXBwQ29uZmlnKGFwcE5hbWU6IHN0cmluZyk6IHtcbiAgZGV2UG9ydDogbnVtYmVyO1xuICBkZXZIb3N0OiBzdHJpbmc7XG4gIHByZVBvcnQ6IG51bWJlcjtcbiAgcHJlSG9zdDogc3RyaW5nO1xuICBwcm9kSG9zdDogc3RyaW5nO1xuICBtYWluQXBwT3JpZ2luOiBzdHJpbmc7XG59IHtcbiAgY29uc3QgYXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnKGFwcE5hbWUpO1xuICBpZiAoIWFwcENvbmZpZykge1xuICAgIHRocm93IG5ldyBFcnJvcihgXHU2NzJBXHU2MjdFXHU1MjMwICR7YXBwTmFtZX0gXHU3Njg0XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFYCk7XG4gIH1cblxuICBjb25zdCBtYWluQXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnKCdtYWluLWFwcCcpO1xuICBjb25zdCBtYWluQXBwT3JpZ2luID0gbWFpbkFwcENvbmZpZ1xuICAgID8gYGh0dHA6Ly8ke21haW5BcHBDb25maWcucHJlSG9zdH06JHttYWluQXBwQ29uZmlnLnByZVBvcnR9YFxuICAgIDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NDE4MCc7XG5cbiAgcmV0dXJuIHtcbiAgICBkZXZQb3J0OiBwYXJzZUludChhcHBDb25maWcuZGV2UG9ydCwgMTApLFxuICAgIGRldkhvc3Q6IGFwcENvbmZpZy5kZXZIb3N0LFxuICAgIHByZVBvcnQ6IHBhcnNlSW50KGFwcENvbmZpZy5wcmVQb3J0LCAxMCksXG4gICAgcHJlSG9zdDogYXBwQ29uZmlnLnByZUhvc3QsXG4gICAgcHJvZEhvc3Q6IGFwcENvbmZpZy5wcm9kSG9zdCxcbiAgICBtYWluQXBwT3JpZ2luLFxuICB9O1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1N0M3Qlx1NTc4QlxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXG4gKiBAcmV0dXJucyBcdTVFOTRcdTc1MjhcdTdDN0JcdTU3OEJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcFR5cGUoYXBwTmFtZTogc3RyaW5nKTogJ21haW4nIHwgJ3N1YicgfCAnbGF5b3V0JyB7XG4gIGlmIChhcHBOYW1lID09PSAnbWFpbi1hcHAnKSByZXR1cm4gJ21haW4nO1xuICBpZiAoYXBwTmFtZSA9PT0gJ2xheW91dC1hcHAnKSByZXR1cm4gJ2xheW91dCc7XG4gIHJldHVybiAnc3ViJzsgLy8gXHU1MTc2XHU0RUQ2XHU5MEZEXHU2NjJGXHU1QjUwXHU1RTk0XHU3NTI4XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2IGJhc2UgVVJMXG4gKiBAcGFyYW0gYXBwTmFtZSBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcbiAqIEBwYXJhbSBpc1ByZXZpZXdCdWlsZCBcdTY2MkZcdTU0MjZcdTRFM0FcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcbiAqIEByZXR1cm5zIGJhc2UgVVJMXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRCYXNlVXJsKGFwcE5hbWU6IHN0cmluZywgaXNQcmV2aWV3QnVpbGQ6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG4gIGNvbnN0IGFwcENvbmZpZyA9IGdldEFwcENvbmZpZyhhcHBOYW1lKTtcbiAgaWYgKCFhcHBDb25maWcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFx1NjcyQVx1NjI3RVx1NTIzMCAke2FwcE5hbWV9IFx1NzY4NFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RWApO1xuICB9XG4gIFxuICAvLyBcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjhcdTdFRERcdTVCRjlcdThERUZcdTVGODRcbiAgaWYgKGlzUHJldmlld0J1aWxkKSB7XG4gICAgcmV0dXJuIGBodHRwOi8vJHthcHBDb25maWcucHJlSG9zdH06JHthcHBDb25maWcucHJlUG9ydH0vYDtcbiAgfVxuICBcbiAgLy8gXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjFBXHU0RjdGXHU3NTI4XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA4XHU4QkE5XHU2RDRGXHU4OUM4XHU1NjY4XHU2ODM5XHU2MzZFXHU1N0RGXHU1NDBEXHU4MUVBXHU1MkE4XHU4OUUzXHU2NzkwXHVGRjA5XG4gIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NUI1MFx1NUU5NFx1NzUyOFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NzZGNFx1NjNBNVx1OTBFOFx1N0Y3Mlx1NTIzMFx1NUI1MFx1NTdERlx1NTQwRFx1NjgzOVx1NzZFRVx1NUY1NVx1RkYwOFx1NTk4MiBwcm9kdWN0aW9uLmJlbGxpcy5jb20uY25cdUZGMDlcbiAgcmV0dXJuICcvJztcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDYgcHVibGljRGlyIFx1OERFRlx1NUY4NFxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXG4gKiBAcGFyYW0gYXBwRGlyIFx1NUU5NFx1NzUyOFx1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICogQHJldHVybnMgcHVibGljRGlyIFx1OERFRlx1NUY4NFx1NjIxNiBmYWxzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHVibGljRGlyKGFwcE5hbWU6IHN0cmluZywgYXBwRGlyOiBzdHJpbmcpOiBzdHJpbmcgfCBmYWxzZSB7XG4gIC8vIG1haW4tYXBwXHUzMDAxYWRtaW4tYXBwIFx1NTQ4QyBzeXN0ZW0tYXBwIFx1NEY3Rlx1NzUyOFx1ODFFQVx1NURGMVx1NzY4NCBwdWJsaWMgXHU3NkVFXHU1RjU1XG4gIGlmIChhcHBOYW1lID09PSAnbWFpbi1hcHAnIHx8IGFwcE5hbWUgPT09ICdhZG1pbi1hcHAnIHx8IGFwcE5hbWUgPT09ICdzeXN0ZW0tYXBwJykge1xuICAgIHJldHVybiByZXNvbHZlKGFwcERpciwgJ3B1YmxpYycpO1xuICB9XG4gIFxuICAvLyBcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdTRGN0ZcdTc1MjhcdTUxNzFcdTRFQUJcdTc2ODQgcHVibGljIFx1NzZFRVx1NUY1NVxuICByZXR1cm4gcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9wdWJsaWMnKTtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHNyY1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHNyY1xcXFxjb25maWdzXFxcXGFwcC1lbnYuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9jb25maWdzL2FwcC1lbnYuY29uZmlnLnRzXCI7Ly8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU4RkQ5XHU5MUNDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IGxvZ2dlclx1RkYwQ1x1NTZFMFx1NEUzQVx1NUI1OFx1NTcyOFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1RkYxQVxuLy8gbG9nZ2VyIC0+IGVudi1pbmZvIC0+IHVuaWZpZWQtZW52LWNvbmZpZyAtPiBhcHAtZW52LmNvbmZpZyAtPiBsb2dnZXJcbi8vIFx1NTcyOFx1NkEyMVx1NTc1N1x1NTJBMFx1OEY3RFx1NzY4NFx1NjVFOVx1NjcxRlx1OTYzNlx1NkJCNVx1RkYwQ2xvZ2dlciBcdTUzRUZcdTgwRkRcdThGRDhcdTY3MkFcdTUyMURcdTU5Q0JcdTUzMTZcdUZGMENcdTYyNDBcdTRFRTVcdTc2RjRcdTYzQTVcdTRGN0ZcdTc1MjggY29uc29sZVxuLy8gY29uc29sZSBcdTY2MkZcdTUxNjhcdTVDNDBcdTVCRjlcdThDNjFcdUZGMENcdTU3MjhcdTZBMjFcdTU3NTdcdTUyQTBcdThGN0RcdTY1RjZcdTVDMzFcdTVERjJcdTdFQ0ZcdTVCNThcdTU3MjhcdUZGMENcdTRFMERcdTRGMUFcdTUzRDdcdTUyMzBcdTVGQUFcdTczQUZcdTRGOURcdThENTZcdTc2ODRcdTVGNzFcdTU0Q0Rcbi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwidml0ZS9jbGllbnRcIiAvPlxuXG4vKipcbiAqIFx1N0VERlx1NEUwMFx1NzY4NFx1NUU5NFx1NzUyOFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVxuICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU3Njg0XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU5MEZEXHU0RUNFXHU4RkQ5XHU5MUNDXHU4QkZCXHU1M0Q2XHVGRjBDXHU5MDdGXHU1MTREXHU0RThDXHU0RTQ5XHU2MDI3XG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBBcHBFbnZDb25maWcge1xuICBhcHBOYW1lOiBzdHJpbmc7XG4gIGRldkhvc3Q6IHN0cmluZztcbiAgZGV2UG9ydDogc3RyaW5nO1xuICBwcmVIb3N0OiBzdHJpbmc7XG4gIHByZVBvcnQ6IHN0cmluZztcbiAgdGVzdEhvc3Q/OiBzdHJpbmc7IC8vIFx1NkQ0Qlx1OEJENVx1NzNBRlx1NTg4M1x1NEY3Rlx1NzUyOFx1NUI1MFx1NTdERlx1NTQwRFx1RkYwOFx1NTk4MiBhZG1pbi50ZXN0LmJlbGxpcy5jb20uY25cdUZGMDlcdUZGMENcdTRFMERcdTRGN0ZcdTc1MjhcdTdBRUZcdTUzRTNcbiAgcHJvZEhvc3Q6IHN0cmluZztcbn1cblxuLyoqXG4gKiBcdTRFM0JcdTVFOTRcdTc1MjhcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcbiAqL1xuY29uc3QgTUFJTl9BUFBfQ09ORklHOiBBcHBFbnZDb25maWcgPSB7XG4gIGFwcE5hbWU6ICdtYWluLWFwcCcsXG4gIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gIGRldlBvcnQ6ICc4MDgwJyxcbiAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gIHByZVBvcnQ6ICc0MTgwJyxcbiAgdGVzdEhvc3Q6ICd0ZXN0LmJlbGxpcy5jb20uY24nLFxuICBwcm9kSG9zdDogJ2JlbGxpcy5jb20uY24nLFxufTtcblxuLyoqXG4gKiBcdTRFMUFcdTUyQTFcdTVCNTBcdTVFOTRcdTc1MjhcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcdUZGMDhcdTYzMDlcdTVCNTdcdTZCQ0RcdTk4N0FcdTVFOEZcdUZGMDlcbiAqL1xuY29uc3QgQlVTSU5FU1NfQVBQX0NPTkZJR1M6IEFwcEVudkNvbmZpZ1tdID0gW1xuICB7XG4gICAgYXBwTmFtZTogJ2FkbWluLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MScsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODEnLFxuICAgIHRlc3RIb3N0OiAnYWRtaW4udGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ2FkbWluLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2Rhc2hib2FyZC1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODInLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTgyJyxcbiAgICB0ZXN0SG9zdDogJ2Rhc2hib2FyZC50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnZGFzaGJvYXJkLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2VuZ2luZWVyaW5nLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MycsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODMnLFxuICAgIHRlc3RIb3N0OiAnZW5naW5lZXJpbmcudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ2VuZ2luZWVyaW5nLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2ZpbmFuY2UtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg0JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NCcsXG4gICAgdGVzdEhvc3Q6ICdmaW5hbmNlLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdmaW5hbmNlLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2xvZ2lzdGljcy1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODYnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg2JyxcbiAgICB0ZXN0SG9zdDogJ2xvZ2lzdGljcy50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnbG9naXN0aWNzLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ29wZXJhdGlvbnMtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg4JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4OCcsXG4gICAgdGVzdEhvc3Q6ICdvcGVyYXRpb25zLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdvcGVyYXRpb25zLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ3BlcnNvbm5lbC1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODknLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg5JyxcbiAgICB0ZXN0SG9zdDogJ3BlcnNvbm5lbC50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAncGVyc29ubmVsLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ3Byb2R1Y3Rpb24tYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDk2JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5MCcsXG4gICAgdGVzdEhvc3Q6ICdwcm9kdWN0aW9uLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdwcm9kdWN0aW9uLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ3F1YWxpdHktYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDkxJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5MScsXG4gICAgdGVzdEhvc3Q6ICdxdWFsaXR5LnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdxdWFsaXR5LmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ3N5c3RlbS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwOTInLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTkyJyxcbiAgICB0ZXN0SG9zdDogJ3N5c3RlbS50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnc3lzdGVtLmJlbGxpcy5jb20uY24nLFxuICB9LFxuXTtcblxuLyoqXG4gKiBcdTcyNzlcdTZCOEFcdTVFOTRcdTc1MjhcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcdUZGMDhcdTYzMDlcdTVCNTdcdTZCQ0RcdTk4N0FcdTVFOEZcdUZGMDlcbiAqL1xuY29uc3QgU1BFQ0lBTF9BUFBfQ09ORklHUzogQXBwRW52Q29uZmlnW10gPSBbXG4gIHtcbiAgICBhcHBOYW1lOiAnZG9jcy1hcHAnLFxuICAgIGRldkhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIGRldlBvcnQ6ICc4MDkzJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5MycsXG4gICAgdGVzdEhvc3Q6ICdkb2NzLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdkb2NzLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2hvbWUtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg1JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NScsXG4gICAgdGVzdEhvc3Q6ICd3d3cudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ3d3dy5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdsYXlvdXQtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDk0JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5NCcsXG4gICAgdGVzdEhvc3Q6ICdsYXlvdXQudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ2xheW91dC5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbl07XG5cbi8qKlxuICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU3Njg0XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFXG4gKiBcdTU0MDhcdTVFNzZcdTRFM0JcdTVFOTRcdTc1MjhcdTMwMDFcdTRFMUFcdTUyQTFcdTVFOTRcdTc1MjhcdTU0OENcdTcyNzlcdTZCOEFcdTVFOTRcdTc1MjhcbiAqL1xuZXhwb3J0IGNvbnN0IEFQUF9FTlZfQ09ORklHUzogQXBwRW52Q29uZmlnW10gPSBbXG4gIE1BSU5fQVBQX0NPTkZJRyxcbiAgLi4uQlVTSU5FU1NfQVBQX0NPTkZJR1MsXG4gIC4uLlNQRUNJQUxfQVBQX0NPTkZJR1MsXG5dO1xuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1ODNCN1x1NTNENlx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnKGFwcE5hbWU6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcuYXBwTmFtZSA9PT0gYXBwTmFtZSk7XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU1RjAwXHU1M0QxXHU3QUVGXHU1M0UzXHU1MjE3XHU4ODY4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGxEZXZQb3J0cygpOiBzdHJpbmdbXSB7XG4gIC8vIFx1OTYzMlx1NUZBMVx1NjAyN1x1NjhDMFx1NjdFNVx1RkYxQVx1NEY3Rlx1NzUyOCB0cnktY2F0Y2ggXHU2MzU1XHU4M0I3XHU1M0VGXHU4MEZEXHU3Njg0IFREWiAoVGVtcG9yYWwgRGVhZCBab25lKSBcdTk1MTlcdThCRUZcbiAgLy8gXHU1OTgyXHU2NzlDIEFQUF9FTlZfQ09ORklHUyBcdThGRDhcdTZDQTFcdTY3MDlcdTUyMURcdTU5Q0JcdTUzMTZcdUZGMDhcdTc1MzFcdTRFOEVcdTVGQUFcdTczQUZcdTRGOURcdThENTZcdTYyMTZcdTZBMjFcdTU3NTdcdTUyQTBcdThGN0RcdTk4N0FcdTVFOEZcdUZGMDlcdUZGMENcdThGRDRcdTU2REVcdTdBN0FcdTY1NzBcdTdFQzRcbiAgdHJ5IHtcbiAgICByZXR1cm4gQVBQX0VOVl9DT05GSUdTLm1hcCgoY29uZmlnKSA9PiBjb25maWcuZGV2UG9ydCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgUmVmZXJlbmNlRXJyb3IgJiYgZXJyb3IubWVzc2FnZS5pbmNsdWRlcygnYmVmb3JlIGluaXRpYWxpemF0aW9uJykpIHtcbiAgICAgIGlmICh0eXBlb2YgaW1wb3J0Lm1ldGEgIT09ICd1bmRlZmluZWQnICYmIGltcG9ydC5tZXRhLmVudiAmJiBpbXBvcnQubWV0YS5lbnYuREVWKSB7XG4gICAgICAgIC8vIFx1NzZGNFx1NjNBNVx1NEY3Rlx1NzUyOCBjb25zb2xlLndhcm5cdUZGMENcdTkwN0ZcdTUxNERcdTVGQUFcdTczQUZcdTRGOURcdThENTZcbiAgICAgICAgY29uc29sZS53YXJuKCdbYXBwLWVudi5jb25maWddIEFQUF9FTlZfQ09ORklHUyBcdTY3MkFcdTUyMURcdTU5Q0JcdTUzMTZcdUZGMDhcdTUzRUZcdTgwRkRcdTY2MkZcdTVGQUFcdTczQUZcdTRGOURcdThENTZcdUZGMDlcdUZGMENcdThGRDRcdTU2REVcdTdBN0FcdTY1NzBcdTdFQzQnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgLy8gXHU1MTc2XHU0RUQ2XHU5NTE5XHU4QkVGXHU5MUNEXHU2NUIwXHU2MjlCXHU1MUZBXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTk4ODRcdTg5QzhcdTdBRUZcdTUzRTNcdTUyMTdcdTg4NjhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbFByZVBvcnRzKCk6IHN0cmluZ1tdIHtcbiAgLy8gXHU5NjMyXHU1RkExXHU2MDI3XHU2OEMwXHU2N0U1XHVGRjFBXHU0RjdGXHU3NTI4IHRyeS1jYXRjaCBcdTYzNTVcdTgzQjdcdTUzRUZcdTgwRkRcdTc2ODQgVERaIChUZW1wb3JhbCBEZWFkIFpvbmUpIFx1OTUxOVx1OEJFRlxuICAvLyBcdTU5ODJcdTY3OUMgQVBQX0VOVl9DT05GSUdTIFx1OEZEOFx1NkNBMVx1NjcwOVx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwOFx1NzUzMVx1NEU4RVx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1NjIxNlx1NkEyMVx1NTc1N1x1NTJBMFx1OEY3RFx1OTg3QVx1NUU4Rlx1RkYwOVx1RkYwQ1x1OEZENFx1NTZERVx1N0E3QVx1NjU3MFx1N0VDNFxuICB0cnkge1xuICAgIHJldHVybiBBUFBfRU5WX0NPTkZJR1MubWFwKChjb25maWcpID0+IGNvbmZpZy5wcmVQb3J0KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBSZWZlcmVuY2VFcnJvciAmJiBlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCdiZWZvcmUgaW5pdGlhbGl6YXRpb24nKSkge1xuICAgICAgaWYgKHR5cGVvZiBpbXBvcnQubWV0YSAhPT0gJ3VuZGVmaW5lZCcgJiYgaW1wb3J0Lm1ldGEuZW52ICYmIGltcG9ydC5tZXRhLmVudi5ERVYpIHtcbiAgICAgICAgLy8gXHU3NkY0XHU2M0E1XHU0RjdGXHU3NTI4IGNvbnNvbGUud2Fyblx1RkYwQ1x1OTA3Rlx1NTE0RFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1NlxuICAgICAgICBjb25zb2xlLndhcm4oJ1thcHAtZW52LmNvbmZpZ10gQVBQX0VOVl9DT05GSUdTIFx1NjcyQVx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwOFx1NTNFRlx1ODBGRFx1NjYyRlx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1RkYwOVx1RkYwQ1x1OEZENFx1NTZERVx1N0E3QVx1NjU3MFx1N0VDNCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICAvLyBcdTUxNzZcdTRFRDZcdTk1MTlcdThCRUZcdTkxQ0RcdTY1QjBcdTYyOUJcdTUxRkFcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1N0FFRlx1NTNFM1x1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnQnlEZXZQb3J0KHBvcnQ6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcuZGV2UG9ydCA9PT0gcG9ydCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWdCeVByZVBvcnQocG9ydDogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5wcmVQb3J0ID09PSBwb3J0KTtcbn1cblxuLyoqXG4gKiBcdTY4MzlcdTYzNkVcdTZENEJcdThCRDVcdTczQUZcdTU4ODNcdTVCNTBcdTU3REZcdTU0MERcdTgzQjdcdTUzRDZcdTVFOTRcdTc1MjhcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcENvbmZpZ0J5VGVzdEhvc3QodGVzdEhvc3Q6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcudGVzdEhvc3QgPT09IHRlc3RIb3N0KTtcbn1cblxuLyoqXG4gKiBcdTUyMjRcdTY1QURcdTVFOTRcdTc1MjhcdTY2MkZcdTU0MjZcdTRFM0FcdTcyNzlcdTZCOEFcdTVFOTRcdTc1MjhcdUZGMDhcdTU3MjggU1BFQ0lBTF9BUFBfQ09ORklHUyBcdTRFMkRcdUZGMDlcbiAqIFx1NzI3OVx1NkI4QVx1NUU5NFx1NzUyOFx1NTMwNVx1NjJFQ1x1RkYxQWRvY3MtYXBwLCBob21lLWFwcCwgbGF5b3V0LWFwcFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTcGVjaWFsQXBwKGFwcE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gU1BFQ0lBTF9BUFBfQ09ORklHUy5zb21lKChjb25maWcpID0+IGNvbmZpZy5hcHBOYW1lID09PSBhcHBOYW1lKTtcbn1cblxuLyoqXG4gKiBcdTUyMjRcdTY1QURcdTVFOTRcdTc1MjhcdTY2MkZcdTU0MjZcdTRFM0FcdTRFMUFcdTUyQTFcdTVFOTRcdTc1MjhcdUZGMDhcdTU3MjggQlVTSU5FU1NfQVBQX0NPTkZJR1MgXHU0RTJEXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0J1c2luZXNzQXBwKGFwcE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gQlVTSU5FU1NfQVBQX0NPTkZJR1Muc29tZSgoY29uZmlnKSA9PiBjb25maWcuYXBwTmFtZSA9PT0gYXBwTmFtZSk7XG59XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFXHU1RTk0XHU3NTI4IElEIFx1NTIyNFx1NjVBRFx1NjYyRlx1NTQyNlx1NEUzQVx1NzI3OVx1NkI4QVx1NUU5NFx1NzUyOFxuICogXHU1RTk0XHU3NTI4IElEIFx1NjYyRiBhcHBOYW1lIFx1NTNCQlx1NjM4OSAnLWFwcCcgXHU1NDBFXHU3RjAwXHU1NDBFXHU3Njg0XHU1MDNDXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1NwZWNpYWxBcHBCeUlkKGFwcElkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgYXBwTmFtZSA9IGAke2FwcElkfS1hcHBgO1xuICByZXR1cm4gaXNTcGVjaWFsQXBwKGFwcE5hbWUpO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcYmFzZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL2Jhc2UuY29uZmlnLnRzXCI7LyoqXG4gKiBcdTU3RkFcdTc4NDBcdTkxNERcdTdGNkVcdTZBMjFcdTU3NTdcbiAqIFx1NjNEMFx1NEY5Qlx1NTE2Q1x1NTE3MVx1NzY4NFx1NTIyQlx1NTQwRFx1NTQ4QyByZXNvbHZlIFx1OTE0RFx1N0Y2RVxuICovXG5cbmltcG9ydCB0eXBlIHsgVXNlckNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhpc3RzU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IGNyZWF0ZVBhdGhIZWxwZXJzIH0gZnJvbSAnLi91dGlscy9wYXRoLWhlbHBlcnMnO1xuXG4vKipcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1Nzg0MFx1NTIyQlx1NTQwRFx1OTE0RFx1N0Y2RVxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFxuICogQHJldHVybnMgXHU1MjJCXHU1NDBEXHU5MTREXHU3RjZFXHU1QkY5XHU4QzYxXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCYXNlQWxpYXNlcyhcbiAgYXBwRGlyOiBzdHJpbmcsIFxuICBfYXBwTmFtZTogc3RyaW5nXG4pOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcbiAgY29uc3QgeyB3aXRoU3JjLCB3aXRoUm9vdCwgd2l0aENvbmZpZ3MsIHdpdGhQYWNrYWdlcyB9ID0gY3JlYXRlUGF0aEhlbHBlcnMoYXBwRGlyKTtcblxuICBjb25zdCBhbGlhc2VzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICdAJzogd2l0aFNyYygnc3JjJyksXG4gICAgJ0Btb2R1bGVzJzogd2l0aFNyYygnc3JjL21vZHVsZXMnKSxcbiAgICAnQHNlcnZpY2VzJzogd2l0aFNyYygnc3JjL3NlcnZpY2VzJyksXG4gICAgJ0Bjb21wb25lbnRzJzogd2l0aFNyYygnc3JjL2NvbXBvbmVudHMnKSxcbiAgICAnQHV0aWxzJzogd2l0aFNyYygnc3JjL3V0aWxzJyksXG4gICAgJ0BhdXRoJzogd2l0aFJvb3QoJ2F1dGgnKSxcbiAgICAnQGNvbmZpZ3MnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYy9jb25maWdzJyksXG4gICAgJ0BidGMvYXV0aC1zaGFyZWQnOiB3aXRoUm9vdCgnYXV0aC9zaGFyZWQnKSxcbiAgICAvLyBAYnRjLyogXHU1MzA1XHU1MjJCXHU1NDBEXHVGRjFBXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU2MjUzXHU1MzA1XHU4RkQ5XHU0RTlCXHU1MzA1XHVGRjBDXHU2MjQwXHU0RUU1XHU1OUNCXHU3RUM4XHU0RjdGXHU3NTI4XHU1MjJCXHU1NDBEXHU2MzA3XHU1NDExXHU2RTkwXHU3ODAxXG4gICAgJ0BidGMvc2hhcmVkLWNvcmUnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYycpLFxuICAgICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMnKSxcbiAgICAnQGJ0Yy9zaGFyZWQtcm91dGVyJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtcm91dGVyL3NyYycpLFxuICAgIC8vIFx1NTQxMVx1NTQwRVx1NTE3Q1x1NUJCOVx1RkYxQVx1NUU5Rlx1NUYwM1x1NTMwNVx1NzY4NFx1NTIyQlx1NTQwRFx1NjMwN1x1NTQxMVx1NUY1Mlx1NUU3Nlx1NTQwRVx1NzY4NFx1NEY0RFx1N0Y2RVxuICAgICdAYnRjL3NoYXJlZC11dGlscyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvcmUvc3JjL3V0aWxzJyksXG4gICAgJ0BidGMvc2hhcmVkLXBsdWdpbnMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9wbHVnaW5zJyksXG4gICAgJ0BidGMvaTE4bic6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2kxOG4nKSxcbiAgICAnQGJ0Yy9zdWJhcHAtbWFuaWZlc3RzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMvbWFuaWZlc3QnKSxcbiAgICAnQGJ0Yy9lbnYnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYy9lbnYnKSxcbiAgICBcbiAgICAvLyBzaGFyZWQtY29tcG9uZW50cyBcdTUxODVcdTkwRThcdTRGN0ZcdTc1MjhcdTc2ODRcdTUyMkJcdTU0MERcdUZGMDhcdTc1MjhcdTRFOEVcdTg5RTNcdTY3OTAgc2hhcmVkLWNvbXBvbmVudHMgXHU1MTg1XHU5MEU4XHU3Njg0XHU1QkZDXHU1MTY1XHVGRjA5XG4gICAgJ0BidGMtY29tbW9uJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY29tbW9uJyksXG4gICAgJ0BidGMtY29tcG9uZW50cyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMnKSxcbiAgICAnQGJ0Yy1jcnVkJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY3J1ZCcpLFxuICAgICdAYnRjLXN0eWxlcyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL3N0eWxlcycpLFxuICAgICdAYnRjLWxvY2FsZXMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9sb2NhbGVzJyksXG4gICAgJ0BidGMtYXNzZXRzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvYXNzZXRzJyksXG4gICAgJ0Bhc3NldHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9hc3NldHMnKSwgLy8gQGFzc2V0cyBcdTUyMkJcdTU0MERcdUZGMENcdTc1MjhcdTRFOEVcdTU2RkVcdTcyNDdcdThENDRcdTZFOTBcdTVCRkNcdTUxNjVcbiAgICAnQGJ0Yy11dGlscyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL3V0aWxzJyksXG4gICAgJ0BwbHVnaW5zJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvcGx1Z2lucycpLFxuICAgIFxuICAgIC8vIFx1NTZGRVx1ODg2OFx1NzZGOFx1NTE3M1x1NTIyQlx1NTQwRFxuICAgICdAY2hhcnRzLXV0aWxzL2Nzcy12YXInOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvY3NzLXZhcicpLFxuICAgICdAY2hhcnRzLXV0aWxzL2NvbG9yJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzL2NvbG9yJyksXG4gICAgJ0BjaGFydHMtdXRpbHMvZ3JhZGllbnQnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvZ3JhZGllbnQnKSxcbiAgICAnQGNoYXJ0cy1jb21wb3NhYmxlcy91c2VDaGFydENvbXBvbmVudCc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy9jb21wb3NhYmxlcy91c2VDaGFydENvbXBvbmVudCcpLFxuICAgICdAY2hhcnRzLXR5cGVzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3R5cGVzJyksXG4gICAgJ0BjaGFydHMtdXRpbHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMnKSxcbiAgICAnQGNoYXJ0cy1jb21wb3NhYmxlcyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy9jb21wb3NhYmxlcycpLFxuXG4gICAgLy8gRWxlbWVudCBQbHVzIFx1NTIyQlx1NTQwRFx1RkYwOFx1NTlDQlx1N0VDOFx1NEY3Rlx1NzUyOFx1RkYwOVxuICAgICdlbGVtZW50LXBsdXMvZXMnOiAnZWxlbWVudC1wbHVzL2VzJyxcbiAgICAnZWxlbWVudC1wbHVzL2Rpc3QnOiAnZWxlbWVudC1wbHVzL2Rpc3QnLFxuICB9O1xuXG4gIHJldHVybiBhbGlhc2VzO1xufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1Nzg0MCByZXNvbHZlIFx1OTE0RFx1N0Y2RVxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFxuICogQHJldHVybnMgcmVzb2x2ZSBcdTkxNERcdTdGNkVcdTVCRjlcdThDNjFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJhc2VSZXNvbHZlKFxuICBhcHBEaXI6IHN0cmluZywgXG4gIGFwcE5hbWU6IHN0cmluZ1xuKTogVXNlckNvbmZpZ1sncmVzb2x2ZSddIHtcbiAgY29uc3QgeyB3aXRoUGFja2FnZXMgfSA9IGNyZWF0ZVBhdGhIZWxwZXJzKGFwcERpcik7XG4gIGNvbnN0IGFsaWFzZXMgPSBjcmVhdGVCYXNlQWxpYXNlcyhhcHBEaXIsIGFwcE5hbWUpO1xuICBcbiAgLy8gXHU0RjdGXHU3NTI4XHU2NTcwXHU3RUM0XHU1RjYyXHU1RjBGXHU3Njg0XHU1MjJCXHU1NDBEXHVGRjBDXHU3ODZFXHU0RkREXHU2NkY0XHU1MTc3XHU0RjUzXHU3Njg0XHU1MjJCXHU1NDBEXHU0RjE4XHU1MTQ4XHU1MzM5XHU5MTREXG4gIC8vIFZpdGUgXHU0RjFBXHU2MzA5XHU2NTcwXHU3RUM0XHU5ODdBXHU1RThGXHU1MzM5XHU5MTREXHVGRjBDXHU3QjJDXHU0RTAwXHU0RTJBXHU1MzM5XHU5MTREXHU3Njg0XHU1MjJCXHU1NDBEXHU0RjFBXHU4OEFCXHU0RjdGXHU3NTI4XG4gIGNvbnN0IGFsaWFzQXJyYXk6IEFycmF5PHsgZmluZDogc3RyaW5nIHwgUmVnRXhwOyByZXBsYWNlbWVudDogc3RyaW5nIH0+ID0gW1xuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NUMwNiB1dGlsIFx1NjYyMFx1NUMwNFx1NTIzMCBucG0gXHU1MzA1XHVGRjBDXHU5NjMyXHU2QjYyIFZpdGUgXHU1QzA2XHU1MTc2XHU4OUM2XHU0RTNBIE5vZGUuanMgXHU1MTg1XHU3RjZFXHU2QTIxXHU1NzU3XHU1RTc2XHU1OTE2XHU5MEU4XHU1MzE2XG4gICAgLy8gXHU5NzAwXHU4OTgxXHU2N0U1XHU2MjdFIG5vZGVfbW9kdWxlcy91dGlsIFx1NzY4NFx1NUI5RVx1OTY0NVx1OERFRlx1NUY4NFx1RkYwOFx1NTNFRlx1ODBGRFx1NTcyOFx1NjgzOVx1NzZFRVx1NUY1NVx1NjIxNlx1NUU5NFx1NzUyOFx1NzZFRVx1NUY1NVx1RkYwOVxuICAgIHtcbiAgICAgIGZpbmQ6IC9edXRpbCQvLFxuICAgICAgcmVwbGFjZW1lbnQ6ICgoKSA9PiB7XG4gICAgICAgIC8vIFx1NUMxRFx1OEJENVx1NEVDRVx1NUU5NFx1NzUyOFx1NzZFRVx1NUY1NVx1NjdFNVx1NjI3RVxuICAgICAgICBjb25zdCBhcHBVdGlsUGF0aCA9IHJlc29sdmUoYXBwRGlyLCAnbm9kZV9tb2R1bGVzL3V0aWwnKTtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoYXBwVXRpbFBhdGgpKSB7XG4gICAgICAgICAgcmV0dXJuIGFwcFV0aWxQYXRoO1xuICAgICAgICB9XG4gICAgICAgIC8vIFx1NUMxRFx1OEJENVx1NEVDRVx1NjgzOVx1NzZFRVx1NUY1NVx1NjdFNVx1NjI3RVxuICAgICAgICBjb25zdCByb290VXRpbFBhdGggPSByZXNvbHZlKGFwcERpciwgJy4uLy4uL25vZGVfbW9kdWxlcy91dGlsJyk7XG4gICAgICAgIGlmIChleGlzdHNTeW5jKHJvb3RVdGlsUGF0aCkpIHtcbiAgICAgICAgICByZXR1cm4gcm9vdFV0aWxQYXRoO1xuICAgICAgICB9XG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjI3RVx1NEUwRFx1NTIzMFx1RkYwQ1x1OEZENFx1NTZERVx1NTMwNVx1NTQwRFx1OEJBOSBWaXRlIFx1ODFFQVx1NTJBOFx1ODlFM1x1Njc5MFx1RkYwOFx1NUU5NFx1OEJFNVx1NTcyOCBvcHRpbWl6ZURlcHMuaW5jbHVkZSBcdTRFMkRcdUZGMDlcbiAgICAgICAgcmV0dXJuICd1dGlsJztcbiAgICAgIH0pKCksXG4gICAgfSxcbiAgICAvLyBsb2NhbGVzIFx1NUI1MFx1OERFRlx1NUY4NFx1NTIyQlx1NTQwRFx1RkYwOFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NEY3Rlx1NzUyOFx1NTIyQlx1NTQwRFx1NjMwN1x1NTQxMVx1NkU5MFx1NzgwMVx1RkYwOVxuICAgIHtcbiAgICAgIGZpbmQ6ICdAYnRjL3NoYXJlZC1jb3JlL2xvY2FsZXMvemgtQ04nLFxuICAgICAgcmVwbGFjZW1lbnQ6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvcmUvc3JjL2J0Yy9wbHVnaW5zL2kxOG4vbG9jYWxlcy96aC1DTicpLFxuICAgIH0sXG4gICAge1xuICAgICAgZmluZDogJ0BidGMvc2hhcmVkLWNvcmUvbG9jYWxlcy9lbi1VUycsXG4gICAgICByZXBsYWNlbWVudDogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMvYnRjL3BsdWdpbnMvaTE4bi9sb2NhbGVzL2VuLVVTJyksXG4gICAgfSxcbiAgICB7XG4gICAgICBmaW5kOiAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cy9sb2NhbGVzL3poLUNOLmpzb24nLFxuICAgICAgcmVwbGFjZW1lbnQ6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2xvY2FsZXMvemgtQ04uanNvbicpLFxuICAgIH0sXG4gICAge1xuICAgICAgZmluZDogJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMvbG9jYWxlcy9lbi1VUy5qc29uJyxcbiAgICAgIHJlcGxhY2VtZW50OiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9sb2NhbGVzL2VuLVVTLmpzb24nKSxcbiAgICB9LFxuICAgIC8vIFx1NTE3Nlx1NEVENlx1NTIyQlx1NTQwRFx1RkYwOFx1NEVDRVx1NUJGOVx1OEM2MVx1OEY2Q1x1NjM2Mlx1NEUzQVx1NjU3MFx1N0VDNFx1NUY2Mlx1NUYwRlx1RkYwOVxuICAgIC4uLk9iamVjdC5lbnRyaWVzKGFsaWFzZXMpLm1hcCgoW2ZpbmQsIHJlcGxhY2VtZW50XSkgPT4gKHtcbiAgICAgIGZpbmQsXG4gICAgICByZXBsYWNlbWVudCxcbiAgICB9KSksXG4gIF07XG4gIFxuICByZXR1cm4ge1xuICAgIGFsaWFzOiBhbGlhc0FycmF5LFxuICAgIGRlZHVwZTogWyd2dWUnLCAndnVlLXJvdXRlcicsICdwaW5pYScsICdlbGVtZW50LXBsdXMnLCAnQGVsZW1lbnQtcGx1cy9pY29ucy12dWUnXSxcbiAgICBleHRlbnNpb25zOiBbJy5tanMnLCAnLmpzJywgJy5tdHMnLCAnLnRzJywgJy5qc3gnLCAnLnRzeCcsICcuanNvbicsICcudnVlJ10sXG4gICAgLy8gXHU3ODZFXHU0RkREIFZpdGUgXHU0RjE4XHU1MTQ4XHU0RjdGXHU3NTI4IHBhY2thZ2UuanNvbiBcdTc2ODQgZXhwb3J0cyBcdTkxNERcdTdGNkVcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTZERkJcdTUyQTAgJ2RldmVsb3BtZW50JyBcdTY3NjFcdTRFRjZcdUZGMENcdTc4NkVcdTRGRERcdTU3MjhcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFMkRcdTRGN0ZcdTc1MjhcdTZFOTBcdTc4MDFcbiAgICBjb25kaXRpb25zOiBbJ2RldmVsb3BtZW50JywgJ2ltcG9ydCcsICdtb2R1bGUnLCAnYnJvd3NlcicsICdkZWZhdWx0J10sXG4gIH07XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxtYW51YWwtY2h1bmtzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL21hbnVhbC1jaHVua3MudHNcIjsvKipcbiAqIG1hbnVhbENodW5rcyBcdTdCNTZcdTc1NjVcdTkxNERcdTdGNkVcbiAqIFx1NUI5QVx1NEU0OVx1NEVFM1x1NzgwMVx1NTIwNlx1NTI3Mlx1N0I1Nlx1NzU2NVx1RkYwQ1x1NUMwNlx1NEUwRFx1NTQwQ1x1N0M3Qlx1NTc4Qlx1NzY4NFx1NEVFM1x1NzgwMVx1NjI1M1x1NTMwNVx1NTIzMFx1NEUwRFx1NTQwQ1x1NzY4NCBjaHVua1xuICovXG5cbi8qKlxuICogXHU1RTk0XHU3NTI4XHU0RjdGXHU3NTI4XHU2MEM1XHU1MUI1XHU5MTREXHU3RjZFXG4gKiBcdTVCOUFcdTRFNDlcdTU0RUFcdTRFOUJcdTVFOTRcdTc1MjhcdTRGN0ZcdTc1MjhcdTU0RUFcdTRFOUJcdTVFOTNcdUZGMENcdTc1MjhcdTRFOEVcdTY3NjFcdTRFRjZcdTYyNTNcdTUzMDVcbiAqL1xuY29uc3QgQVBQX1VTQUdFOiBSZWNvcmQ8c3RyaW5nLCB7IGVjaGFydHM6IGJvb2xlYW47IG1vbmFjbzogYm9vbGVhbjsgdGhyZWU6IGJvb2xlYW4gfT4gPSB7XG4gICdsYXlvdXQtYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbiAgJ3N5c3RlbS1hcHAnOiB7IGVjaGFydHM6IHRydWUsIG1vbmFjbzogZmFsc2UsIHRocmVlOiBmYWxzZSB9LFxuICAnYWRtaW4tYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbiAgJ2ZpbmFuY2UtYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbiAgJ2xvZ2lzdGljcy1hcHAnOiB7IGVjaGFydHM6IHRydWUsIG1vbmFjbzogZmFsc2UsIHRocmVlOiBmYWxzZSB9LFxuICAncXVhbGl0eS1hcHAnOiB7IGVjaGFydHM6IHRydWUsIG1vbmFjbzogZmFsc2UsIHRocmVlOiBmYWxzZSB9LFxuICAncHJvZHVjdGlvbi1hcHAnOiB7IGVjaGFydHM6IHRydWUsIG1vbmFjbzogZmFsc2UsIHRocmVlOiBmYWxzZSB9LFxuICAnZW5naW5lZXJpbmctYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbiAgJ21vbml0b3ItYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbn07XG5cbi8qKlxuICogXHU1MjI0XHU2NUFEXHU2NjJGXHU1NDI2XHU0RTNBXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXG4gKi9cbmNvbnN0IGlzUHJvZHVjdGlvbiA9IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbic7XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBIG1hbnVhbENodW5rcyBcdTdCNTZcdTc1NjVcdTUxRkRcdTY1NzBcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NzUyOFx1NEU4RVx1OEZDN1x1NkVFNFx1NzI3OVx1NUI5QVx1NUU5NFx1NzUyOFx1NzY4NCBtYW5pZmVzdFx1RkYwOVxuICogQHJldHVybnMgbWFudWFsQ2h1bmtzIFx1NTFGRFx1NjU3MFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWFudWFsQ2h1bmtzU3RyYXRlZ3koYXBwTmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IGlzTGF5b3V0QXBwID0gYXBwTmFtZSA9PT0gJ2xheW91dC1hcHAnO1xuICBjb25zdCBpc01haW5BcHAgPSBhcHBOYW1lID09PSAnbWFpbi1hcHAnO1xuICBjb25zdCBhcHBVc2FnZSA9IEFQUF9VU0FHRVthcHBOYW1lXSB8fCB7IGVjaGFydHM6IGZhbHNlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfTtcbiAgLy8gXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU0RTE0XHU5NzVFIGxheW91dC1hcHAgXHU2NUY2XHVGRjBDXHU1MTcxXHU0RUFCXHU4RDQ0XHU2RTkwXHU0RTBEXHU2MjUzXHU1MzA1XHVGRjA4XHU0RUNFIGxheW91dC1hcHAgXHU1MkEwXHU4RjdEXHVGRjA5XG4gIC8vIFx1NEY0NiBtYWluLWFwcCBcdTRGNUNcdTRFM0FcdTRFM0JcdTVFOTRcdTc1MjhcdUZGMENcdTk3MDBcdTg5ODFcdTc1MUZcdTYyMTBcdTgxRUFcdTVERjFcdTc2ODQgRVBTIFx1NjcwRFx1NTJBMVxuICBjb25zdCBza2lwU2hhcmVkUmVzb3VyY2VzID0gaXNQcm9kdWN0aW9uICYmICFpc0xheW91dEFwcCAmJiAhaXNNYWluQXBwO1xuXG4gIHJldHVybiAoaWQ6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCA9PiB7XG4gICAgLy8gMC4gRVBTIFx1NjcwRFx1NTJBMVx1NTM1NVx1NzJFQ1x1NjI1M1x1NTMwNVx1RkYwOFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NTE3MVx1NEVBQlx1RkYwQ1x1NUZDNVx1OTg3Qlx1NTcyOFx1NjcwMFx1NTI0RFx1OTc2Mlx1RkYwOVxuICAgIGlmIChpZC5pbmNsdWRlcygndmlydHVhbDplcHMnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnXFxcXDB2aXJ0dWFsOmVwcycpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdzZXJ2aWNlcy9lcHMnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnc2VydmljZXNcXFxcZXBzJykpIHtcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NzY4NFx1NUI1MFx1NUU5NFx1NzUyOFx1NEUwRFx1NUU5NFx1OEJFNVx1NTE4RFx1NTM1NVx1NzJFQ1x1NjJDNlx1NTFGQSBlcHMtc2VydmljZSBjaHVua1xuICAgICAgLy8gXHU1NDI2XHU1MjE5XHU1QjUwXHU1RTk0XHU3NTI4XHU1MTY1XHU1M0UzXHU0RjFBXHU0RUE3XHU3NTFGXHU1QkY5XHU4MUVBXHU4RUFCIC9hc3NldHMvZXBzLXNlcnZpY2UteHh4LmpzIFx1NzY4NFx1NUYxNVx1NzUyOFx1RkYwQ1x1NUJGQ1x1ODFGNFwiXHU1MTcxXHU0RUFCXHU2NzJBXHU3NTFGXHU2NTQ4ICsgNDA0XCJcdTk4Q0VcdTk2NjlcdTMwMDJcbiAgICAgIC8vIGxheW91dC1hcHAgXHU4RDFGXHU4RDIzXHU2M0QwXHU0RjlCXHU1MTcxXHU0RUFCIGVwcy1zZXJ2aWNlXHVGRjBDXHU1RTc2XHU1QzA2XHU2NzBEXHU1MkExXHU2MzAyXHU1MjMwIHdpbmRvdy5fX0FQUF9FUFNfU0VSVklDRV9fXHUzMDAyXG4gICAgICAvLyBtYWluLWFwcCBcdTRGNUNcdTRFM0FcdTRFM0JcdTVFOTRcdTc1MjhcdUZGMENcdTk3MDBcdTg5ODFcdTc1MUZcdTYyMTBcdTgxRUFcdTVERjFcdTc2ODQgRVBTIFx1NjcwRFx1NTJBMVx1RkYwOFx1NzJFQ1x1N0FDQlx1OEZEMFx1ODg0Q1x1NjVGNlx1NEUwRFx1NEY5RFx1OEQ1NiBsYXlvdXQtYXBwXHVGRjA5XG4gICAgICBpZiAoc2tpcFNoYXJlZFJlc291cmNlcykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgcmV0dXJuICdlcHMtc2VydmljZSc7XG4gICAgfVxuXG4gICAgLy8gMC4zLiBBdXRoIEFQSSBcdTUzNTVcdTcyRUNcdTYyNTNcdTUzMDVcdUZGMDhcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTUxNzFcdTRFQUJcdUZGMENcdTc1MzEgc3lzdGVtLWFwcCBcdTYzRDBcdTRGOUJcdUZGMDlcbiAgICBpZiAoaWQuaW5jbHVkZXMoJ21vZHVsZXMvYXBpLXNlcnZpY2VzL2F1dGgnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbW9kdWxlc1xcXFxhcGktc2VydmljZXNcXFxcYXV0aCcpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdhcGktc2VydmljZXMvYXV0aCcpKSB7XG4gICAgICByZXR1cm4gJ2F1dGgtYXBpJztcbiAgICB9XG5cbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFtZW51UmVnaXN0cnkgXHU0RjlEXHU4RDU2IFZ1ZVx1RkYwQ1x1NUZDNVx1OTg3Qlx1NTQ4QyB2ZW5kb3IgXHU0RTAwXHU4RDc3XHU2MjUzXHU1MzA1XHVGRjBDXHU0RTBEXHU4MEZEXHU1MzU1XHU3MkVDXHU2MjUzXHU1MzA1XHU1MjMwIG1lbnUtcmVnaXN0cnlcbiAgICAvLyBcdThGRDlcdTY4MzdcdTc4NkVcdTRGREQgVnVlIFx1NzY4NCByZWYgXHU1NzI4IG1lbnVSZWdpc3RyeSBcdTRGN0ZcdTc1MjhcdTRFNEJcdTUyNERcdTVERjJcdTdFQ0ZcdTUyMURcdTU5Q0JcdTUzMTZcbiAgICAvLyBcdTVGQzVcdTk4N0JcdTU3MjhcdTY4QzBcdTY3RTUgbGF5b3V0LWJyaWRnZSBcdTRFNEJcdTUyNERcdTY4QzBcdTY3RTVcdUZGMENcdTU2RTBcdTRFM0EgbGF5b3V0LWJyaWRnZSBcdTRGMUFcdTVCRkNcdTUxNjUgbWVudVJlZ2lzdHJ5XG4gICAgaWYgKGlkLmluY2x1ZGVzKCdwYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvc3RvcmUvbWVudVJlZ2lzdHJ5JykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMvc3RvcmUvbWVudVJlZ2lzdHJ5JykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ3NoYXJlZC1jb21wb25lbnRzL3N0b3JlL21lbnVSZWdpc3RyeScpKSB7XG4gICAgICAvLyBMYXlvdXQtQXBwXHVGRjFBXHU1QzA2IG1lbnVSZWdpc3RyeSBcdTYyNTNcdTUzMDVcdTUyMzAgdmVuZG9yXG4gICAgICAvLyBcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdUZGMDhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMDlcdUZGMUFcdTRFMERcdTYyNTNcdTUzMDVcdUZGMENcdTRFQ0UgbGF5b3V0LWFwcCBcdTUyQTBcdThGN0RcbiAgICAgIGlmIChza2lwU2hhcmVkUmVzb3VyY2VzKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ3ZlbmRvcic7XG4gICAgfVxuICAgIFxuICAgIC8vIDAuNS4gXHU4M0RDXHU1MzU1XHU3NkY4XHU1MTczXHU0RUUzXHU3ODAxXHU1MzU1XHU3MkVDXHU2MjUzXHU1MzA1XG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1QzA2XHU4M0RDXHU1MzU1XHU3NkY4XHU1MTczXHU3Njg0XHU0RUUzXHU3ODAxXHU2MjUzXHU1MzA1XHU1MjMwIG1lbnUtcmVnaXN0cnkgY2h1bmtcdUZGMENcdTRGNDYgbWVudVJlZ2lzdHJ5IFx1NjcyQ1x1OEVBQlx1NEY5RFx1OEQ1NiBWdWVcdUZGMENcdTk3MDBcdTg5ODFcdTY1M0VcdTU3MjggdmVuZG9yIFx1NEU0Qlx1NTQwRVxuICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQW1lbnVSZWdpc3RyeSBcdTRGN0ZcdTc1MjggVnVlIFx1NzY4NCByZWZcdUZGMENcdTYyNDBcdTRFRTVcdTRFMERcdTgwRkRcdTUzNTVcdTcyRUNcdTYyNTNcdTUzMDVcdUZGMENcdTVFOTRcdThCRTVcdTU0OEMgdmVuZG9yIFx1NEUwMFx1OEQ3N1xuICAgIC8vIFx1NTNFQVx1NUMwNiBtYW5pZmVzdCBcdTY1NzBcdTYzNkVcdTU0OEMgbGF5b3V0LWJyaWRnZSBcdTYyNTNcdTUzMDVcdTUyMzAgbWVudS1yZWdpc3RyeVxuICAgIC8vIFx1NEY0NiBsYXlvdXQtYnJpZGdlIFx1NEYxQVx1NUJGQ1x1NTE2NSBtZW51UmVnaXN0cnlcdUZGMENcdTYyNDBcdTRFRTUgbGF5b3V0LWJyaWRnZSBcdTRFNUZcdTVFOTRcdThCRTVcdTYyNTNcdTUzMDVcdTUyMzAgdmVuZG9yXG4gICAgaWYgKGlkLmluY2x1ZGVzKCdjb25maWdzL2xheW91dC1icmlkZ2UnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnQGJ0Yy9zaGFyZWQtY29yZS9jb25maWdzL2xheW91dC1icmlkZ2UnKSkge1xuICAgICAgLy8gTGF5b3V0LUFwcFx1RkYxQWxheW91dC1icmlkZ2UgXHU1QkZDXHU1MTY1IG1lbnVSZWdpc3RyeVx1RkYwQ1x1NjI0MFx1NEVFNVx1NEU1Rlx1NUU5NFx1OEJFNVx1NjI1M1x1NTMwNVx1NTIzMCB2ZW5kb3JcbiAgICAgIC8vIFx1NTE3Nlx1NEVENlx1NUU5NFx1NzUyOFx1RkYwOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1RkYwOVx1RkYxQVx1NEUwRFx1NjI1M1x1NTMwNVx1RkYwQ1x1NEVDRSBsYXlvdXQtYXBwIFx1NTJBMFx1OEY3RFxuICAgICAgaWYgKHNraXBTaGFyZWRSZXNvdXJjZXMpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAndmVuZG9yJztcbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IHN1YmFwcC1tYW5pZmVzdHNcdUZGMUFcdTUzRUFcdTUzMDVcdTU0MkJcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTc2ODQgbWFuaWZlc3RcbiAgICBpZiAoaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3N1YmFwcC1tYW5pZmVzdHMnKSB8fCBpZC5pbmNsdWRlcygnQGJ0Yy9zdWJhcHAtbWFuaWZlc3RzJykpIHtcbiAgICAgIC8vIFx1NjM5Mlx1OTY2NFx1NTE3Nlx1NEVENlx1NUU5NFx1NzUyOFx1NzY4NCBtYW5pZmVzdCBKU09OIFx1NjU4N1x1NEVGNlxuICAgICAgY29uc3Qgb3RoZXJBcHBzID0gWydmaW5hbmNlJywgJ2xvZ2lzdGljcycsICdzeXN0ZW0nLCAncXVhbGl0eScsICdlbmdpbmVlcmluZycsICdwcm9kdWN0aW9uJywgJ21vbml0b3InLCAnYWRtaW4nXTtcbiAgICAgIGNvbnN0IGN1cnJlbnRBcHBOYW1lID0gYXBwTmFtZS5yZXBsYWNlKCctYXBwJywgJycpO1xuICAgICAgY29uc3Qgc2hvdWxkRXhjbHVkZSA9IG90aGVyQXBwc1xuICAgICAgICAuZmlsdGVyKGFwcCA9PiBhcHAgIT09IGN1cnJlbnRBcHBOYW1lKVxuICAgICAgICAuc29tZShhcHAgPT4gaWQuaW5jbHVkZXMoYG1hbmlmZXN0cy8ke2FwcH0uanNvbmApKTtcbiAgICAgIFxuICAgICAgaWYgKHNob3VsZEV4Y2x1ZGUpIHtcbiAgICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU1RTk0XHU3NTI4XHU3Njg0IG1hbmlmZXN0XHVGRjBDXHU0RTBEXHU2MjUzXHU1MzA1XHU1MjMwIG1lbnUtcmVnaXN0cnlcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIC8vIExheW91dC1BcHBcdUZGMUFcdTUzRUFcdTYyNTNcdTUzMDVcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTc2ODQgbWFuaWZlc3QgXHU1NDhDXHU1MTcxXHU0RUFCXHU0RUUzXHU3ODAxXG4gICAgICAvLyBcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdUZGMDhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMDlcdUZGMUFcdTRFMERcdTYyNTNcdTUzMDVcdUZGMENcdTRFQ0UgbGF5b3V0LWFwcCBcdTUyQTBcdThGN0RcbiAgICAgIGlmIChza2lwU2hhcmVkUmVzb3VyY2VzKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ21lbnUtcmVnaXN0cnknO1xuICAgIH1cblxuICAgIC8vIDEuIFx1NzJFQ1x1N0FDQlx1NTkyN1x1NUU5M1x1RkYxQUVDaGFydHNcdUZGMDhcdTdFQUYgZWNoYXJ0cyBcdTU0OEMgenJlbmRlclx1RkYwQ1x1NEUwRFx1NTMwNVx1NTQyQiB2dWUtZWNoYXJ0c1x1RkYwOVxuICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2VjaGFydHMnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3pyZW5kZXInKSkge1xuICAgICAgLy8gTGF5b3V0LUFwcFx1RkYxQVx1NkI2M1x1NUUzOFx1NjI1M1x1NTMwNVxuICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU1RTk0XHU3NTI4XHVGRjFBXHU1OTgyXHU2NzlDXHU0RjdGXHU3NTI4IGVjaGFydHNcdUZGMENcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTRFMERcdTYyNTNcdTUzMDVcdUZGMDhcdTRFQ0UgbGF5b3V0LWFwcCBcdTUyQTBcdThGN0RcdUZGMDlcdUZGMENcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTZCNjNcdTVFMzhcdTYyNTNcdTUzMDVcbiAgICAgIGlmIChza2lwU2hhcmVkUmVzb3VyY2VzICYmIGFwcFVzYWdlLmVjaGFydHMpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NUU5NFx1NzUyOFx1NEUwRFx1NEY3Rlx1NzUyOCBlY2hhcnRzXHVGRjBDXHU0RTBEXHU2MjUzXHU1MzA1XG4gICAgICBpZiAoIWFwcFVzYWdlLmVjaGFydHMpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAnZWNoYXJ0cy12ZW5kb3InO1xuICAgIH1cblxuICAgIC8vIDIuIFx1NTE3Nlx1NEVENlx1NzJFQ1x1N0FDQlx1NTkyN1x1NUU5M1x1RkYwOFx1NUI4Q1x1NTE2OFx1NzJFQ1x1N0FDQlx1RkYwOS0gXHU2NzYxXHU0RUY2XHU2MjUzXHU1MzA1XG4gICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvbW9uYWNvLWVkaXRvcicpKSB7XG4gICAgICAvLyBcdTUzRUFcdTY3MDlcdTRGN0ZcdTc1MjhcdTc2ODRcdTVFOTRcdTc1MjhcdTYyNERcdTYyNTNcdTUzMDVcbiAgICAgIGlmICghYXBwVXNhZ2UubW9uYWNvKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ2xpYi1tb25hY28nO1xuICAgIH1cbiAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy90aHJlZScpKSB7XG4gICAgICAvLyBcdTUzRUFcdTY3MDlcdTRGN0ZcdTc1MjhcdTc2ODRcdTVFOTRcdTc1MjhcdTYyNERcdTYyNTNcdTUzMDVcbiAgICAgIGlmICghYXBwVXNhZ2UudGhyZWUpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAnbGliLXRocmVlJztcbiAgICB9XG5cbiAgICAvLyAzLiBWdWUgXHU3NTFGXHU2MDAxXHU1RTkzICsgXHU2MjQwXHU2NzA5XHU0RjlEXHU4RDU2IFZ1ZSBcdTc2ODRcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTMgKyBcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdTVFOTNcbiAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy92dWUnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3Z1ZS1yb3V0ZXInKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2VsZW1lbnQtcGx1cycpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvcGluaWEnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0B2dWV1c2UnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0BlbGVtZW50LXBsdXMnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3Z1ZS1lY2hhcnRzJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9kYXlqcycpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvbG9kYXNoJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AdnVlJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3NoYXJlZC1jb3JlJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3NoYXJlZC11dGlscycpKSB7XG4gICAgICAvLyBMYXlvdXQtQXBwXHVGRjFBXHU2QjYzXHU1RTM4XHU2MjUzXHU1MzA1XHU1MjMwIHZlbmRvclxuICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU1RTk0XHU3NTI4XHVGRjA4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjA5XHVGRjFBXHU0RTBEXHU2MjUzXHU1MzA1XHVGRjBDXHU0RUNFIGxheW91dC1hcHAgXHU1MkEwXHU4RjdEXG4gICAgICBpZiAoc2tpcFNoYXJlZFJlc291cmNlcykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgcmV0dXJuICd2ZW5kb3InO1xuICAgIH1cblxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzg2RVx1NEZERCB2aXRlLXBsdWdpbiBcdTc2RjhcdTUxNzNcdTRFRTNcdTc4MDFcdTRFNUZcdTg4QUJcdTYyNTNcdTUzMDVcdTUyMzAgdmVuZG9yXG4gICAgaWYgKGlkLmluY2x1ZGVzKCdwYWNrYWdlcy92aXRlLXBsdWdpbicpIHx8IGlkLmluY2x1ZGVzKCdAYnRjL3ZpdGUtcGx1Z2luJykpIHtcbiAgICAgIHJldHVybiAndmVuZG9yJztcbiAgICB9XG5cbiAgICAvLyA0LiBcdTYyNDBcdTY3MDlcdTUxNzZcdTRFRDZcdTRFMUFcdTUyQTFcdTRFRTNcdTc4MDFcdTU0MDhcdTVFNzZcdTUyMzBcdTRFM0JcdTY1ODdcdTRFRjZcbiAgICByZXR1cm4gdW5kZWZpbmVkOyAvLyBcdThGRDRcdTU2REUgdW5kZWZpbmVkIFx1ODg2OFx1NzkzQVx1NTQwOFx1NUU3Nlx1NTIzMFx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlxuICB9O1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxccm9sbHVwLWNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9yb2xsdXAtY29uZmlnLnRzXCI7LyoqXG4gKiBSb2xsdXAgXHU5MTREXHU3RjZFXHU2QTIxXHU1NzU3XG4gKiBcdTYzRDBcdTRGOUJcdTUxNkNcdTUxNzFcdTc2ODQgUm9sbHVwIFx1OTE0RFx1N0Y2RVxuICovXG5cbmltcG9ydCB0eXBlIHsgUm9sbHVwT3B0aW9ucywgV2FybmluZ0hhbmRsZXJXaXRoRGVmYXVsdCwgT3V0cHV0QXNzZXQsIFdhcm5pbmcgfSBmcm9tICdyb2xsdXAnO1xuaW1wb3J0IHsgY3JlYXRlTWFudWFsQ2h1bmtzU3RyYXRlZ3kgfSBmcm9tICcuL21hbnVhbC1jaHVua3MnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJvbGx1cENvbmZpZ09wdGlvbnMge1xuICAvKipcbiAgICogXHU4RDQ0XHU2RTkwXHU2NTg3XHU0RUY2XHU3NkVFXHU1RjU1XHVGRjA4XHU5RUQ4XHU4QkE0OiAnYXNzZXRzJ1x1RkYwOVxuICAgKi9cbiAgYXNzZXREaXI/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBjaHVuayBcdTY1ODdcdTRFRjZcdTc2RUVcdTVGNTVcdUZGMDhcdTlFRDhcdThCQTQ6IFx1NEUwRSBhc3NldERpciBcdTc2RjhcdTU0MENcdUZGMDlcbiAgICovXG4gIGNodW5rRGlyPzogc3RyaW5nO1xuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1QzA2IHNpbmdsZS1zcGEgXHU1NDhDIHFpYW5rdW4gXHU2ODA3XHU4QkIwXHU0RTNBXHU1OTE2XHU5MEU4XHU1RTkzXHVGRjA4XHU5RUQ4XHU4QkE0OiB0cnVlXHVGRjA5XG4gICAqIFx1NEUzQlx1NUU5NFx1NzUyOFx1RkYwOGxheW91dC1hcHBcdUZGMDlcdTVFOTRcdThCRTVcdThCQkVcdTdGNkVcdTRFM0EgZmFsc2VcdUZGMENcdTRFRTVcdTRGQkZcdTYyNTNcdTUzMDVcdThGRDlcdTRFOUJcdTVFOTNcbiAgICogXHU1QjUwXHU1RTk0XHU3NTI4XHU1RTk0XHU4QkU1XHU4QkJFXHU3RjZFXHU0RTNBIHRydWVcdUZGMENcdTkwN0ZcdTUxNERcdTkxQ0RcdTU5MERcdTYyNTNcdTUzMDVcbiAgICovXG4gIGV4dGVybmFsU2luZ2xlU3BhPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFx1NjYyRlx1NTQyNlx1NUMwNiBAYnRjIFx1NTMwNVx1NjgwN1x1OEJCMFx1NEUzQVx1NTkxNlx1OTBFOFx1NUU5M1x1RkYwOFx1OUVEOFx1OEJBNDogZmFsc2VcdUZGMDlcbiAgICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU2MjUzXHU1MzA1XHU4RkQ5XHU0RTlCXHU1RTkzXHVGRjBDXHU5MDdGXHU1MTREXHU4RkQwXHU4ODRDXHU2NUY2XHU2QTIxXHU1NzU3XHU4OUUzXHU2NzkwXHU5NUVFXHU5ODk4XG4gICAqL1xuICBleHRlcm5hbEJ0Y1BhY2thZ2VzPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFx1NjYyRlx1NTQyNlx1NUMwNiBAY29uZmlncyBcdTUzMDVcdTY4MDdcdThCQjBcdTRFM0FcdTU5MTZcdTkwRThcdTVFOTNcdUZGMDhcdTlFRDhcdThCQTQ6IHRydWVcdUZGMDlcbiAgICogXHU0RTNCXHU1RTk0XHU3NTI4XHVGRjA4bWFpbi1hcHBcdUZGMDlcdTVFOTRcdThCRTVcdThCQkVcdTdGNkVcdTRFM0EgZmFsc2VcdUZGMENcdTRFRTVcdTRGQkZcdTYyNTNcdTUzMDVcdThGRDlcdTRFOUJcdTVFOTNcbiAgICogXHU1QjUwXHU1RTk0XHU3NTI4XHU1RTk0XHU4QkU1XHU4QkJFXHU3RjZFXHU0RTNBIHRydWVcdUZGMENcdTRFQ0UgbGF5b3V0LWFwcCBcdTUyQTBcdThGN0RcdTUxNzFcdTRFQUJcdThENDRcdTZFOTBcbiAgICovXG4gIGV4dGVybmFsQ29uZmlnc1BhY2thZ2VzPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBcdTUyMUJcdTVFRkEgUm9sbHVwIFx1OTE0RFx1N0Y2RVxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXG4gKiBAcGFyYW0gb3B0aW9ucyBcdTkxNERcdTdGNkVcdTkwMDlcdTk4NzlcbiAqIEByZXR1cm5zIFJvbGx1cCBcdTkxNERcdTdGNkVcdTVCRjlcdThDNjFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJvbGx1cENvbmZpZyhhcHBOYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBSb2xsdXBDb25maWdPcHRpb25zKTogUm9sbHVwT3B0aW9ucyB7XG4gIGNvbnN0IG1hbnVhbENodW5rcyA9IGNyZWF0ZU1hbnVhbENodW5rc1N0cmF0ZWd5KGFwcE5hbWUpO1xuICBjb25zdCBhc3NldERpciA9IG9wdGlvbnM/LmFzc2V0RGlyIHx8ICdhc3NldHMnO1xuICBjb25zdCBjaHVua0RpciA9IG9wdGlvbnM/LmNodW5rRGlyIHx8IGFzc2V0RGlyO1xuICAvLyBcdTlFRDhcdThCQTRcdTVDMDYgc2luZ2xlLXNwYSBcdTU0OEMgcWlhbmt1biBcdTY4MDdcdThCQjBcdTRFM0EgZXh0ZXJuYWxcdUZGMDhcdTVCNTBcdTVFOTRcdTc1MjhcdUZGMDlcbiAgLy8gXHU0RTNCXHU1RTk0XHU3NTI4XHVGRjA4bGF5b3V0LWFwcFx1RkYwOVx1OTcwMFx1ODk4MVx1NjYzRVx1NUYwRlx1OEJCRVx1N0Y2RSBleHRlcm5hbFNpbmdsZVNwYTogZmFsc2VcbiAgLy8gQHRzLWlnbm9yZTogXHU1M0VGXHU4MEZEXHU1NzI4XHU2NzJBXHU2NzY1XHU0RjdGXHU3NTI4XG4gIGNvbnN0IF9leHRlcm5hbFNpbmdsZVNwYSA9IG9wdGlvbnM/LmV4dGVybmFsU2luZ2xlU3BhICE9PSBmYWxzZTtcbiAgLy8gXHU5RUQ4XHU4QkE0XHU1QzA2IEBidGMgXHU1MzA1XHU2MjUzXHU1MzA1XHU1MjMwXHU1RTk0XHU3NTI4XHU0RTJEXHVGRjA4XHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU2MjUzXHU1MzA1XHVGRjBDXHU5MDdGXHU1MTREXHU4RkQwXHU4ODRDXHU2NUY2XHU2QTIxXHU1NzU3XHU4OUUzXHU2NzkwXHU5NUVFXHU5ODk4XHVGRjA5XG4gIC8vIFx1NTk4Mlx1Njc5Q1x1OEJCRVx1N0Y2RVx1NEUzQSB0cnVlXHVGRjBDXHU1MjE5XHU2ODA3XHU4QkIwXHU0RTNBIGV4dGVybmFsXHVGRjA4XHU0RTBEXHU2M0E4XHU4MzUwXHVGRjA5XG4gIGNvbnN0IGV4dGVybmFsQnRjUGFja2FnZXMgPSBvcHRpb25zPy5leHRlcm5hbEJ0Y1BhY2thZ2VzID09PSB0cnVlO1xuICAvLyBcdTlFRDhcdThCQTRcdTVDMDYgQGNvbmZpZ3MgXHU1MzA1XHU2ODA3XHU4QkIwXHU0RTNBIGV4dGVybmFsXHVGRjA4XHU1QjUwXHU1RTk0XHU3NTI4XHU0RUNFIGxheW91dC1hcHAgXHU1MkEwXHU4RjdEXHVGRjA5XG4gIC8vIFx1NEUzQlx1NUU5NFx1NzUyOFx1RkYwOG1haW4tYXBwXHVGRjA5XHU5NzAwXHU4OTgxXHU2NjNFXHU1RjBGXHU4QkJFXHU3RjZFIGV4dGVybmFsQ29uZmlnc1BhY2thZ2VzOiBmYWxzZVx1RkYwQ1x1NEVFNVx1NEZCRlx1NjI1M1x1NTMwNVx1OEZEOVx1NEU5Qlx1NUU5M1xuICBjb25zdCBleHRlcm5hbENvbmZpZ3NQYWNrYWdlcyA9IG9wdGlvbnM/LmV4dGVybmFsQ29uZmlnc1BhY2thZ2VzICE9PSBmYWxzZTtcblxuICAvLyBcdTY3ODRcdTVFRkEgZXh0ZXJuYWwgXHU2NTcwXHU3RUM0XG4gIC8vIFJvbGx1cCBcdTc2ODQgZXh0ZXJuYWwgXHU2NTJGXHU2MzAxXHU1QjU3XHU3QjI2XHU0RTMyXHUzMDAxXHU2QjYzXHU1MjE5XHU4ODY4XHU4RkJFXHU1RjBGXHU2MjE2XHU1MUZEXHU2NTcwXG4gIGNvbnN0IGV4dGVybmFsOiAoc3RyaW5nIHwgUmVnRXhwIHwgKChpZDogc3RyaW5nKSA9PiBib29sZWFuKSlbXSA9IFtcbiAgICAvLyB2aXRlLXBsdWdpbiBcdTY2MkZcdTY3ODRcdTVFRkFcdTY1RjZcdTYzRDJcdTRFRjZcdUZGMENcdTRFMERcdTVFOTRcdThCRTVcdTg4QUJcdTYyNTNcdTUzMDVcdTUyMzBcdThGRDBcdTg4NENcdTY1RjZcdTRFRTNcdTc4MDFcdTRFMkRcbiAgICAnQGJ0Yy92aXRlLXBsdWdpbicsXG4gICAgL15AYnRjXFwvdml0ZS1wbHVnaW4vLFxuICAgIC8vIEBidGMgXHU1MzA1XHVGRjFBXHU2ODM5XHU2MzZFXHU5MTREXHU3RjZFXHU1MUIzXHU1QjlBXHU2NjJGXHU1NDI2XHU2ODA3XHU4QkIwXHU0RTNBIGV4dGVybmFsXG4gICAgLy8gXHU5RUQ4XHU4QkE0XHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU2MjUzXHU1MzA1XHU4RkQ5XHU0RTlCXHU1RTkzXHVGRjBDXHU5MDdGXHU1MTREXHU4RkQwXHU4ODRDXHU2NUY2XHU2QTIxXHU1NzU3XHU4OUUzXHU2NzkwXHU5NUVFXHU5ODk4XG4gICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBQ1NTIFx1NjU4N1x1NEVGNlx1NEUwRFx1NUU5NFx1OEJFNVx1ODhBQlx1NjgwN1x1OEJCMFx1NEUzQSBleHRlcm5hbFx1RkYwQ1x1NUU5NFx1OEJFNVx1ODhBQiBWaXRlIFx1NTkwNFx1NzQwNlx1NUU3Nlx1NjI1M1x1NTMwNVxuICAgIC4uLihleHRlcm5hbEJ0Y1BhY2thZ2VzID8gW1xuICAgICAgJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnLFxuICAgICAgLy8gXHU1MzM5XHU5MTREIEphdmFTY3JpcHQvVHlwZVNjcmlwdCBcdTZBMjFcdTU3NTdcdUZGMENcdTRGNDZcdTRFMERcdTUzMzlcdTkxNEQgQ1NTIFx1NjU4N1x1NEVGNlxuICAgICAgKGlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKGlkLnN0YXJ0c1dpdGgoJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMvJykpIHtcbiAgICAgICAgICAvLyBcdTYzOTJcdTk2NjQgQ1NTIFx1NjU4N1x1NEVGNlx1RkYwOC5jc3MsIC5zY3NzLCAuc2FzcywgLmxlc3MgXHU3QjQ5XHVGRjA5XG4gICAgICAgICAgcmV0dXJuICEvXFwuKGNzc3xzY3NzfHNhc3N8bGVzc3xzdHlsKSQvaS50ZXN0KGlkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUnLFxuICAgICAgLy8gXHU1MzM5XHU5MTREIEphdmFTY3JpcHQvVHlwZVNjcmlwdCBcdTZBMjFcdTU3NTdcdUZGMENcdTRGNDZcdTRFMERcdTUzMzlcdTkxNEQgQ1NTIFx1NjU4N1x1NEVGNlxuICAgICAgKGlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKGlkLnN0YXJ0c1dpdGgoJ0BidGMvc2hhcmVkLWNvcmUvJykpIHtcbiAgICAgICAgICByZXR1cm4gIS9cXC4oY3NzfHNjc3N8c2Fzc3xsZXNzfHN0eWwpJC9pLnRlc3QoaWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sXG4gICAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnLFxuICAgICAgLy8gXHU1MzM5XHU5MTREIEphdmFTY3JpcHQvVHlwZVNjcmlwdCBcdTZBMjFcdTU3NTdcdUZGMENcdTRGNDZcdTRFMERcdTUzMzlcdTkxNEQgQ1NTIFx1NjU4N1x1NEVGNlxuICAgICAgKGlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKGlkLnN0YXJ0c1dpdGgoJ0BidGMvc2hhcmVkLXV0aWxzLycpKSB7XG4gICAgICAgICAgcmV0dXJuICEvXFwuKGNzc3xzY3NzfHNhc3N8bGVzc3xzdHlsKSQvaS50ZXN0KGlkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgIF0gOiBbXSksXG4gICAgLy8gQGJ0Yy9zaGFyZWQtY29yZS9jb25maWdzIFx1NTMwNVx1RkYxQVx1NjgzOVx1NjM2RVx1OTE0RFx1N0Y2RVx1NTFCM1x1NUI5QVx1NjYyRlx1NTQyNlx1NjgwN1x1OEJCMFx1NEUzQSBleHRlcm5hbFxuICAgIC8vIFx1NEUzQlx1NUU5NFx1NzUyOFx1RkYwOG1haW4tYXBwXHVGRjA5XHU1RTk0XHU4QkU1XHU2MjUzXHU1MzA1XHU4RkQ5XHU0RTlCXHU1RTkzXHVGRjBDXHU1QjUwXHU1RTk0XHU3NTI4XHU0RUNFIGxheW91dC1hcHAgXHU1MkEwXHU4RjdEXG4gICAgLi4uKGV4dGVybmFsQ29uZmlnc1BhY2thZ2VzID8gW1xuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUvY29uZmlncy9sYXlvdXQtYnJpZGdlJyxcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MvdW5pZmllZC1lbnYtY29uZmlnJyxcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MvYXBwLXNjYW5uZXInLFxuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUvY29uZmlncy9hcHAtZW52LmNvbmZpZycsXG4gICAgICAvXkBidGNcXC9zaGFyZWQtY29yZVxcL2NvbmZpZ3NcXC8uKi8sXG4gICAgXSA6IFtdKSxcbiAgXTtcblxuICByZXR1cm4ge1xuICAgIHByZXNlcnZlRW50cnlTaWduYXR1cmVzOiAnc3RyaWN0JyxcbiAgICBvbndhcm4od2FybmluZzogV2FybmluZywgd2FybjogV2FybmluZ0hhbmRsZXJXaXRoRGVmYXVsdCkge1xuICAgICAgLy8gXHU4RkM3XHU2RUU0XHU1REYyXHU3N0U1XHU4QjY2XHU1NDRBXG4gICAgICBpZiAod2FybmluZy5jb2RlID09PSAnTU9EVUxFX0xFVkVMX0RJUkVDVElWRScgfHxcbiAgICAgICAgICAod2FybmluZy5tZXNzYWdlICYmIHR5cGVvZiB3YXJuaW5nLm1lc3NhZ2UgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgIHdhcm5pbmcubWVzc2FnZS5pbmNsdWRlcygnZHluYW1pY2FsbHkgaW1wb3J0ZWQnKSAmJlxuICAgICAgICAgICB3YXJuaW5nLm1lc3NhZ2UuaW5jbHVkZXMoJ3N0YXRpY2FsbHkgaW1wb3J0ZWQnKSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHdhcm5pbmcubWVzc2FnZSAmJiB0eXBlb2Ygd2FybmluZy5tZXNzYWdlID09PSAnc3RyaW5nJyAmJiB3YXJuaW5nLm1lc3NhZ2UuaW5jbHVkZXMoJ0dlbmVyYXRlZCBhbiBlbXB0eSBjaHVuaycpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFx1OEZDN1x1NkVFNFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1OEI2Nlx1NTQ0QVx1RkYwOFx1NURGMlx1NzdFNVx1NzY4NFx1NUI4OVx1NTE2OFx1OEI2Nlx1NTQ0QVx1RkYwOVxuICAgICAgLy8gXHU1RjUzIHNoYXJlZC1jb21wb25lbnRzIFx1OTAxQVx1OEZDNyByZWV4cG9ydCBcdTVCRkNcdTUxRkFcdTdFQzRcdTRFRjZcdUZGMENcdTRFMTRcdTdFQzRcdTRFRjZcdTU0OENcdTRFMUFcdTUyQTFcdTRFRTNcdTc4MDFcdTU3MjhcdTRFMERcdTU0MEMgY2h1bmsgXHU2NUY2XHU0RjFBXHU0RUE3XHU3NTFGXHU2QjY0XHU4QjY2XHU1NDRBXG4gICAgICAvLyBcdThGRDlcdTY2MkZcdTk4ODRcdTY3MUZcdTc2ODRcdTYyQzZcdTUyMDZcdTdCNTZcdTc1NjVcdUZGMENcdTRFMERcdTRGMUFcdTVGNzFcdTU0Q0RcdTUyOUZcdTgwRkRcdUZGMENcdTU2RTBcdTRFM0EgY2h1bmsgXHU1MkEwXHU4RjdEXHU5ODdBXHU1RThGXHU1REYyXHU3RUNGXHU2QjYzXHU3ODZFXHU5MTREXHU3RjZFXG4gICAgICBpZiAod2FybmluZy5jb2RlID09PSAnQ0lSQ1VMQVJfREVQRU5ERU5DWScgfHxcbiAgICAgICAgICAod2FybmluZy5tZXNzYWdlICYmIHR5cGVvZiB3YXJuaW5nLm1lc3NhZ2UgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICh3YXJuaW5nLm1lc3NhZ2UuaW5jbHVkZXMoJ3dhcyByZWV4cG9ydGVkIHRocm91Z2ggbW9kdWxlJykgfHxcbiAgICAgICAgICAgIHdhcm5pbmcubWVzc2FnZS5pbmNsdWRlcygnd2lsbCBlbmQgdXAgaW4gZGlmZmVyZW50IGNodW5rcycpIHx8XG4gICAgICAgICAgICB3YXJuaW5nLm1lc3NhZ2UuaW5jbHVkZXMoJ2NpcmN1bGFyIGRlcGVuZGVuY3knKSkpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NEUwRFx1NTE4RFx1OEZDN1x1NkVFNCBAYnRjIFx1NTMwNVx1NzY4NFx1OEI2Nlx1NTQ0QVx1RkYwQ1x1NTZFMFx1NEUzQVx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NjI1M1x1NTMwNVx1OEZEOVx1NEU5Qlx1NTMwNVx1RkYwQ1x1NEUwRFx1NUU5NFx1OEJFNVx1NjcwOSB1bnJlc29sdmVkIGltcG9ydCBcdThCNjZcdTU0NEFcbiAgICAgIHdhcm4od2FybmluZyk7XG4gICAgfSxcbiAgICBvdXRwdXQ6IHtcbiAgICAgIGZvcm1hdDogJ2VzbScsXG4gICAgICBpbmxpbmVEeW5hbWljSW1wb3J0czogZmFsc2UsXG4gICAgICBtYW51YWxDaHVua3MsXG4gICAgICBwcmVzZXJ2ZU1vZHVsZXM6IGZhbHNlLFxuICAgICAgZ2VuZXJhdGVkQ29kZToge1xuICAgICAgICBjb25zdEJpbmRpbmdzOiBmYWxzZSwgLy8gXHU0RTBEXHU0RjdGXHU3NTI4IGNvbnN0XHVGRjBDXHU5MDdGXHU1MTREIFREWiBcdTk1RUVcdTk4OThcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkREXHU3NTU5XHU1QkZDXHU1MUZBXHU1NDBEXHU3OUYwXHVGRjBDXHU5MDdGXHU1MTREXHU4OEFCXHU1MzhCXHU3RjI5XHU2MjEwXHU1MzU1XHU1QjU3XHU2QkNEXG4gICAgICAgIC8vIFx1OEZEOVx1NTNFRlx1NEVFNVx1OTYzMlx1NkI2MiBcImRvZXMgbm90IHByb3ZpZGUgYW4gZXhwb3J0IG5hbWVkICdjJ1wiIFx1OTUxOVx1OEJFRlxuICAgICAgICBwcmVzZXJ2ZU1vZHVsZXNSb290OiB1bmRlZmluZWQsXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzg2RVx1NEZERFx1NUJGOVx1OEM2MVx1NUM1RVx1NjAyN1x1NEU0Qlx1OTVGNFx1NjcwOVx1NkI2M1x1Nzg2RVx1NzY4NFx1NTIwNlx1OTY5NFx1N0IyNlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NUI1N1x1N0IyNlx1NEUzMlx1NTQ4Q1x1NjU3MFx1NUI1N1x1OEZERVx1NjNBNVxuICAgICAgICBvYmplY3RTaG9ydGhhbmQ6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTVCRjlcdThDNjFcdTdCODBcdTUxOTlcdUZGMENcdTc4NkVcdTRGRERcdTVDNUVcdTYwMjdcdTU0MERcdTU0OENcdTUwM0NcdTkwRkRcdTVCOENcdTY1NzRcbiAgICAgICAgYXJyb3dGdW5jdGlvbnM6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTdCQURcdTU5MzRcdTUxRkRcdTY1NzBcdUZGMENcdTRGN0ZcdTc1MjhcdTY2NkVcdTkwMUFcdTUxRkRcdTY1NzBcdUZGMENcdTY2RjRcdTVCODlcdTUxNjhcbiAgICAgIH0sXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc4NkVcdTRGRERcdTVCRkNcdTUxRkFcdTU0MERcdTc5RjBcdTRFMERcdTg4QUJcdTUzOEJcdTdGMjlcbiAgICAgIC8vIFx1ODY3RFx1NzEzNiB0ZXJzZXIgXHU3Njg0IG1hbmdsZSBcdTVERjJcdTc5ODFcdTc1MjhcdUZGMENcdTRGNDYgUm9sbHVwIFx1NzY4NFx1NEVFM1x1NzgwMVx1NzUxRlx1NjIxMFx1NEU1Rlx1NTNFRlx1ODBGRFx1NTM4Qlx1N0YyOVx1NUJGQ1x1NTFGQVx1NTQwRFx1NzlGMFxuICAgICAgY2h1bmtGaWxlTmFtZXM6IGAke2NodW5rRGlyfS9bbmFtZV0tW2hhc2hdLmpzYCxcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlx1NEY3Rlx1NzUyOFx1N0EzM1x1NUI5QVx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NEUwRFx1NUUyNiBoYXNoXHVGRjA5XHVGRjBDXHU5NjREXHU0RjRFXHU5MEU4XHU3RjcyL1x1N0YxM1x1NUI1OFx1NUJGQ1x1ODFGNFx1NzY4NCBpbmRleC14eHguanMgNDA0IFx1OThDRVx1OTY2OVxuICAgICAgLy8gTmdpbnggXHU1QkY5XHU4QkU1XHU2NTg3XHU0RUY2XHU1RTk0XHU5MTREXHU3RjZFIG5vLWNhY2hlXHVGRjFCXHU1MTc2XHU0RUQ2IGNodW5rIFx1NEVDRFx1NEZERFx1NjMwMSBoYXNoICsgaW1tdXRhYmxlXG4gICAgICBlbnRyeUZpbGVOYW1lczogYCR7Y2h1bmtEaXJ9L1tuYW1lXS5qc2AsXG4gICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbzogT3V0cHV0QXNzZXQpID0+IHtcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBZmF2aWNvbi5pY28gXHU1NDhDIGljb25zIFx1NzZFRVx1NUY1NVx1NzY4NFx1NjU4N1x1NEVGNlx1NEUwRFx1NUU5NFx1OEJFNVx1NkRGQlx1NTJBMCBoYXNoXHVGRjBDXHU1RTk0XHU4QkU1XHU0RkREXHU2MzAxXHU1NzI4XHU1MzlGXHU0RjREXHU3RjZFXG4gICAgICAgIC8vIFx1OEZEOVx1NEU5Qlx1NjU4N1x1NEVGNlx1NEYxQVx1ODhBQiBwdWJsaWNEaXIgXHU2MjE2IGNvcHlJY29uc1BsdWdpbiBcdTU5MERcdTUyMzZcdTUyMzBcdTZCNjNcdTc4NkVcdTc2ODRcdTRGNERcdTdGNkVcbiAgICAgICAgaWYgKGFzc2V0SW5mby5uYW1lPy5pbmNsdWRlcygnZmF2aWNvbicpIHx8IGFzc2V0SW5mby5uYW1lPy5pbmNsdWRlcygnaWNvbnMvJykpIHtcbiAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTY1ODdcdTRFRjZcdTU0MERcdTUzMDVcdTU0MkIgZmF2aWNvbiBcdTYyMTYgaWNvbnNcdUZGMENcdTRGRERcdTYzMDFcdTUzOUZcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTRFMERcdTU0MkIgaGFzaFx1RkYwOVxuICAgICAgICAgIC8vIFx1NEY0Nlx1OEZEOVx1NzlDRFx1NjBDNVx1NTFCNVx1NUU5NFx1OEJFNVx1NUY4OFx1NUMxMVx1RkYwQ1x1NTZFMFx1NEUzQSBwdWJsaWNEaXIgXHU0RjFBXHU3NkY0XHU2M0E1XHU1OTBEXHU1MjM2XHU4RkQ5XHU0RTlCXHU2NTg3XHU0RUY2XG4gICAgICAgICAgcmV0dXJuIGFzc2V0SW5mby5uYW1lIHx8IGAke2Fzc2V0RGlyfS9bbmFtZV0uW2V4dF1gO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhc3NldEluZm8ubmFtZT8uZW5kc1dpdGgoJy5jc3MnKSkge1xuICAgICAgICAgIHJldHVybiBgJHthc3NldERpcn0vW25hbWVdLVtoYXNoXS5jc3NgO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBgJHthc3NldERpcn0vW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICB9LFxuICAgIH0sXG4gICAgZXh0ZXJuYWwsXG4gIH07XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxjbGVhbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9jbGVhbi50c1wiOy8qKlxuICogXHU2RTA1XHU3NDA2XHU2Nzg0XHU1RUZBXHU3NkVFXHU1RjU1XHU2M0QyXHU0RUY2XG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1tjbGVhbl0nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW2NsZWFuXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW2NsZWFuXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbY2xlYW5dJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcm1TeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5cbi8qKlxuICogXHU1Qjg5XHU1MTY4XHU4RjkzXHU1MUZBXHU2NUU1XHU1RkQ3XHVGRjA4XHU5MDdGXHU1MTREIFdpbmRvd3MgXHU2M0E3XHU1MjM2XHU1M0YwXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XG4gKi9cbmZ1bmN0aW9uIHNhZmVMb2cobWVzc2FnZTogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgY29uc29sZS5pbmZvKG1lc3NhZ2UpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIFx1NTk4Mlx1Njc5Q1x1OEY5M1x1NTFGQVx1NTkzMVx1OEQyNVx1RkYwOFx1NTNFRlx1ODBGRFx1NjYyRlx1N0YxNlx1NzgwMVx1OTVFRVx1OTg5OFx1RkYwOVx1RkYwQ1x1NEY3Rlx1NzUyOFx1N0VBRlx1NjU4N1x1NjcyQ1x1OEY5M1x1NTFGQVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb250cm9sLXJlZ2V4XG4gICAgY29uc29sZS5pbmZvKG1lc3NhZ2UucmVwbGFjZSgvW15cXHgwMC1cXHg3Rl0vZywgJycpKTtcbiAgfVxufVxuXG4vKipcbiAqIFx1NUI4OVx1NTE2OFx1OEY5M1x1NTFGQVx1OEI2Nlx1NTQ0QVx1RkYwOFx1OTA3Rlx1NTE0RCBXaW5kb3dzIFx1NjNBN1x1NTIzNlx1NTNGMFx1N0YxNlx1NzgwMVx1OTVFRVx1OTg5OFx1RkYwOVxuICovXG5mdW5jdGlvbiBzYWZlV2FybihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gXHU1OTgyXHU2NzlDXHU4RjkzXHU1MUZBXHU1OTMxXHU4RDI1XHVGRjA4XHU1M0VGXHU4MEZEXHU2NjJGXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XHVGRjBDXHU0RjdGXHU3NTI4XHU3RUFGXHU2NTg3XHU2NzJDXHU4RjkzXHU1MUZBXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnRyb2wtcmVnZXhcbiAgICBjb25zb2xlLndhcm4obWVzc2FnZS5yZXBsYWNlKC9bXlxceDAwLVxceDdGXS9nLCAnJykpO1xuICB9XG59XG5cbi8qKlxuICogXHU2RTA1XHU3NDA2IGRpc3QgXHU3NkVFXHU1RjU1XHU2M0QyXHU0RUY2XG4gKiBcdTZERkJcdTUyQTBcdTkxQ0RcdThCRDVcdTY3M0FcdTUyMzZcdTRFRTVcdTU5MDRcdTc0MDYgV2luZG93cyBcdTRFMEFcdTc2ODRcdTY1ODdcdTRFRjZcdTk1MDFcdTVCOUFcdTk1RUVcdTk4OThcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuRGlzdFBsdWdpbihhcHBEaXI6IHN0cmluZyk6IFBsdWdpbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2NsZWFuLWRpc3QtcGx1Z2luJyxcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgY29uc3QgZGlzdERpciA9IHJlc29sdmUoYXBwRGlyLCAnZGlzdCcpO1xuICAgICAgaWYgKGV4aXN0c1N5bmMoZGlzdERpcikpIHtcbiAgICAgICAgc2FmZUxvZygnW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTZFMDVcdTc0MDZcdTY1RTdcdTc2ODQgZGlzdCBcdTc2RUVcdTVGNTUuLi4nKTtcblxuICAgICAgICAvLyBcdTZERkJcdTUyQTBcdTkxQ0RcdThCRDVcdTY3M0FcdTUyMzZcdUZGMENcdTU5MDRcdTc0MDYgV2luZG93cyBcdTRFMEFcdTc2ODRcdTY1ODdcdTRFRjZcdTk1MDFcdTVCOUFcdTk1RUVcdTk4OThcbiAgICAgICAgbGV0IHJldHJpZXMgPSA1OyAvLyBcdTU4OUVcdTUyQTBcdTkxQ0RcdThCRDVcdTZCMjFcdTY1NzBcbiAgICAgICAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcblxuICAgICAgICB3aGlsZSAocmV0cmllcyA+IDAgJiYgIXN1Y2Nlc3MpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcm1TeW5jKGRpc3REaXIsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICAgICAgc2FmZUxvZygnW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTI3MDUgZGlzdCBcdTc2RUVcdTVGNTVcdTVERjJcdTZFMDVcdTc0MDYnKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICByZXRyaWVzLS07XG4gICAgICAgICAgICBpZiAoZXJyb3IuY29kZSA9PT0gJ0VCVVNZJyB8fCBlcnJvci5jb2RlID09PSAnRU5PVEVNUFRZJykge1xuICAgICAgICAgICAgICBpZiAocmV0cmllcyA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCB3YWl0VGltZSA9ICg2IC0gcmV0cmllcykgKiAyMDA7IC8vIFx1OTAxMlx1NTg5RVx1N0I0OVx1NUY4NVx1NjVGNlx1OTVGNFx1RkYxQTIwMG1zLCA0MDBtcywgNjAwbXMsIDgwMG1zLCAxMDAwbXNcbiAgICAgICAgICAgICAgICBzYWZlV2FybihgW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTI2QTBcdUZFMEYgIFx1NzZFRVx1NUY1NVx1ODhBQlx1NTM2MFx1NzUyOFx1RkYwQ1x1N0I0OVx1NUY4NSAke3dhaXRUaW1lfW1zIFx1NTQwRVx1OTFDRFx1OEJENS4uLiAoXHU1MjY5XHU0RjU5ICR7cmV0cmllc30gXHU2QjIxKWApO1xuICAgICAgICAgICAgICAgIC8vIFx1NTQwQ1x1NkI2NVx1N0I0OVx1NUY4NVxuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICB3aGlsZSAoRGF0ZS5ub3coKSAtIHN0YXJ0IDwgd2FpdFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFx1NUZEOVx1N0I0OVx1NUY4NVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzYWZlV2FybignW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTI3NEMgXHU2NUUwXHU2Q0Q1XHU2RTA1XHU3NDA2IGRpc3QgXHU3NkVFXHU1RjU1XHVGRjA4XHU1M0VGXHU4MEZEXHU4OEFCXHU1MTc2XHU0RUQ2XHU3QTBCXHU1RThGXHU1MzYwXHU3NTI4XHVGRjA5Jyk7XG4gICAgICAgICAgICAgICAgc2FmZVdhcm4oJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHU2M0QwXHU3OTNBXHVGRjFBXHU4QkY3XHU1MTczXHU5NUVEXHU1M0VGXHU4MEZEXHU1MzYwXHU3NTI4XHU2NTg3XHU0RUY2XHU3Njg0XHU3QTBCXHU1RThGXHVGRjA4XHU1OTgyXHU2NTg3XHU0RUY2XHU4RDQ0XHU2RTkwXHU3QkExXHU3NDA2XHU1NjY4XHUzMDAxXHU3RjE2XHU4RjkxXHU1NjY4XHU3QjQ5XHVGRjA5Jyk7XG4gICAgICAgICAgICAgICAgc2FmZVdhcm4oJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHU2MjE2XHU4MDA1XHU2MjRCXHU1MkE4XHU1MjIwXHU5NjY0IGRpc3QgXHU3NkVFXHU1RjU1XHU1NDBFXHU5MUNEXHU2NUIwXHU2Nzg0XHU1RUZBJyk7XG4gICAgICAgICAgICAgICAgc2FmZVdhcm4oJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHU2Nzg0XHU1RUZBXHU1QzA2XHU3RUU3XHU3RUVEXHVGRjBDXHU0RjQ2XHU2NUU3XHU3Njg0XHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU0RTBEXHU0RjFBXHU4OEFCXHU2RTA1XHU3NDA2XHVGRjBDXHU1M0VGXHU4MEZEXHU1QkZDXHU4MUY0XHU5MUNEXHU1OTBEXHU2NTg3XHU0RUY2Jyk7XG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7IC8vIFx1N0VFN1x1N0VFRFx1Njc4NFx1NUVGQVx1RkYwQ1x1NEUwRFx1OTYzQlx1NTg1RVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgICAgICAgIC8vIFx1NzZFRVx1NUY1NVx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1NEUwRFx1OTcwMFx1ODk4MVx1NkUwNVx1NzQwNlxuICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFx1NTE3Nlx1NEVENlx1OTUxOVx1OEJFRlx1RkYwQ1x1NzZGNFx1NjNBNVx1NjI5Qlx1NTFGQVxuICAgICAgICAgICAgICBzYWZlV2FybignW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTZFMDVcdTc0MDYgZGlzdCBcdTc2RUVcdTVGNTVcdTU5MzFcdThEMjU6ICcgKyBlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgc2FmZVdhcm4oJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHU2Nzg0XHU1RUZBXHU1QzA2XHU3RUU3XHU3RUVEXHVGRjBDXHU0RjQ2XHU2NUU3XHU3Njg0XHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU0RTBEXHU0RjFBXHU4OEFCXHU2RTA1XHU3NDA2Jyk7XG4gICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlOyAvLyBcdTdFRTdcdTdFRURcdTY3ODRcdTVFRkFcdUZGMENcdTRFMERcdTk2M0JcdTU4NUVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNhZmVMb2coJ1tjbGVhbi1kaXN0LXBsdWdpbl0gZGlzdCBcdTc2RUVcdTVGNTVcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTY1RTBcdTk3MDBcdTZFMDVcdTc0MDYnKTtcbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGNodW5rLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2NodW5rLnRzXCI7LyoqXG4gKiBDaHVuayBcdTc2RjhcdTUxNzNcdTYzRDJcdTRFRjZcbiAqIFx1NTMwNVx1NjJFQyBjaHVuayBcdTlBOENcdThCQzFcdTU0OENcdTRGMThcdTUzMTZcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW2NodW5rXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbY2h1bmtdJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbY2h1bmtdJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1tjaHVua10nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdHlwZSB7IE91dHB1dE9wdGlvbnMsIE91dHB1dEJ1bmRsZSB9IGZyb20gJ3JvbGx1cCc7XG5cbi8qKlxuICogXHU5QThDXHU4QkMxXHU2MjQwXHU2NzA5IGNodW5rIFx1NzUxRlx1NjIxMFx1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2h1bmtWZXJpZnlQbHVnaW4oKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY2h1bmstdmVyaWZ5LXBsdWdpbicsXG4gICAgd3JpdGVCdW5kbGUoX29wdGlvbnM6IE91dHB1dE9wdGlvbnMsIGJ1bmRsZTogT3V0cHV0QnVuZGxlKSB7XG4gICAgICBjb25zb2xlLmluZm8oJ1xcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTI3MDUgXHU3NTFGXHU2MjEwXHU3Njg0XHU2MjQwXHU2NzA5IGNodW5rIFx1NjU4N1x1NEVGNlx1RkYxQScpO1xuICAgICAgY29uc3QganNDaHVua3MgPSBPYmplY3Qua2V5cyhidW5kbGUpLmZpbHRlcihmaWxlID0+IGZpbGUuZW5kc1dpdGgoJy5qcycpKTtcbiAgICAgIGNvbnN0IGNzc0NodW5rcyA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuZmlsdGVyKGZpbGUgPT4gZmlsZS5lbmRzV2l0aCgnLmNzcycpKTtcblxuICAgICAgY29uc29sZS5pbmZvKGBcXG5KUyBjaHVua1x1RkYwOFx1NTE3MSAke2pzQ2h1bmtzLmxlbmd0aH0gXHU0RTJBXHVGRjA5XHVGRjFBYCk7XG4gICAgICBqc0NodW5rcy5mb3JFYWNoKGNodW5rID0+IGNvbnNvbGUuaW5mbyhgICAtICR7Y2h1bmt9YCkpO1xuXG4gICAgICBjb25zb2xlLmluZm8oYFxcbkNTUyBjaHVua1x1RkYwOFx1NTE3MSAke2Nzc0NodW5rcy5sZW5ndGh9IFx1NEUyQVx1RkYwOVx1RkYxQWApO1xuICAgICAgY3NzQ2h1bmtzLmZvckVhY2goY2h1bmsgPT4gY29uc29sZS5pbmZvKGAgIC0gJHtjaHVua31gKSk7XG5cbiAgICAgIGNvbnN0IGluZGV4Q2h1bmsgPSBqc0NodW5rcy5maW5kKGpzQ2h1bmsgPT4ganNDaHVuay5pbmNsdWRlcygnaW5kZXgtJykpO1xuICAgICAgY29uc3QgaW5kZXhTaXplID0gaW5kZXhDaHVuayA/IChidW5kbGVbaW5kZXhDaHVua10gYXMgYW55KT8uY29kZT8ubGVuZ3RoIHx8IDAgOiAwO1xuICAgICAgY29uc3QgaW5kZXhTaXplS0IgPSBpbmRleFNpemUgLyAxMDI0O1xuICAgICAgY29uc3QgaW5kZXhTaXplTUIgPSBpbmRleFNpemVLQiAvIDEwMjQ7XG5cbiAgICAgIGNvbnN0IG1pc3NpbmdSZXF1aXJlZENodW5rczogc3RyaW5nW10gPSBbXTtcbiAgICAgIGlmICghaW5kZXhDaHVuaykge1xuICAgICAgICBtaXNzaW5nUmVxdWlyZWRDaHVua3MucHVzaCgnaW5kZXgnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaGFzRXBzU2VydmljZSA9IGpzQ2h1bmtzLnNvbWUoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKCdlcHMtc2VydmljZScpKTtcbiAgICAgIGNvbnN0IGhhc0F1dGhBcGkgPSBqc0NodW5rcy5zb21lKGpzQ2h1bmsgPT4ganNDaHVuay5pbmNsdWRlcygnYXV0aC1hcGknKSk7XG4gICAgICBjb25zdCBoYXNFY2hhcnRzVmVuZG9yID0ganNDaHVua3Muc29tZShqc0NodW5rID0+IGpzQ2h1bmsuaW5jbHVkZXMoJ2VjaGFydHMtdmVuZG9yJykpO1xuICAgICAgY29uc3QgaGFzTGliTW9uYWNvID0ganNDaHVua3Muc29tZShqc0NodW5rID0+IGpzQ2h1bmsuaW5jbHVkZXMoJ2xpYi1tb25hY28nKSk7XG4gICAgICBjb25zdCBoYXNMaWJUaHJlZSA9IGpzQ2h1bmtzLnNvbWUoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKCdsaWItdGhyZWUnKSk7XG5cbiAgICAgIGNvbnNvbGUuaW5mbyhgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1RDgzRFx1RENFNiBcdTY3ODRcdTVFRkFcdTYwQzVcdTUxQjVcdUZGMDhcdTVFNzNcdTg4NjFcdTYyQzZcdTUyMDZcdTdCNTZcdTc1NjVcdUZGMDlcdUZGMUFgKTtcbiAgICAgIGlmIChpbmRleENodW5rKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgICBcdTI3MDUgaW5kZXg6IFx1NEUzQlx1NjU4N1x1NEVGNlx1RkYwOFZ1ZVx1NzUxRlx1NjAwMSArIEVsZW1lbnQgUGx1cyArIFx1NEUxQVx1NTJBMVx1NEVFM1x1NzgwMVx1RkYwQ1x1NEY1M1x1NzlFRn4ke2luZGV4U2l6ZU1CLnRvRml4ZWQoMil9TUIgXHU2NzJBXHU1MzhCXHU3RjI5XHVGRjBDZ3ppcFx1NTQwRX4keyhpbmRleFNpemVNQiAqIDAuMykudG9GaXhlZCgyKX1NQlx1RkYwOWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGAgIFx1Mjc0QyBcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhgKTtcbiAgICAgIH1cbiAgICAgIGlmIChoYXNFcHNTZXJ2aWNlKSBjb25zb2xlLmluZm8oYCAgXHUyNzA1IGVwcy1zZXJ2aWNlOiBFUFMgXHU2NzBEXHU1MkExXHVGRjA4XHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU1MTcxXHU0RUFCXHVGRjBDXHU1MzU1XHU3MkVDXHU2MjUzXHU1MzA1XHVGRjA5YCk7XG4gICAgICBpZiAoaGFzQXV0aEFwaSkgY29uc29sZS5pbmZvKGAgIFx1MjcwNSBhdXRoLWFwaTogQXV0aCBBUElcdUZGMDhcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTUxNzFcdTRFQUJcdUZGMENcdTUzNTVcdTcyRUNcdTYyNTNcdTUzMDVcdUZGMENcdTc1MzEgc3lzdGVtLWFwcCBcdTYzRDBcdTRGOUJcdUZGMDlgKTtcbiAgICAgIGlmIChoYXNFY2hhcnRzVmVuZG9yKSBjb25zb2xlLmluZm8oYCAgXHUyNzA1IGVjaGFydHMtdmVuZG9yOiBFQ2hhcnRzICsgenJlbmRlclx1RkYwOFx1NzJFQ1x1N0FDQlx1NTkyN1x1NUU5M1x1RkYwQ1x1NjVFMFx1NEY5RFx1OEQ1Nlx1OTVFRVx1OTg5OFx1RkYwOWApO1xuICAgICAgaWYgKGhhc0xpYk1vbmFjbykgY29uc29sZS5pbmZvKGAgIFx1MjcwNSBsaWItbW9uYWNvOiBNb25hY28gRWRpdG9yXHVGRjA4XHU3MkVDXHU3QUNCXHU1OTI3XHU1RTkzXHVGRjA5YCk7XG4gICAgICBpZiAoaGFzTGliVGhyZWUpIGNvbnNvbGUuaW5mbyhgICBcdTI3MDUgbGliLXRocmVlOiBUaHJlZS5qc1x1RkYwOFx1NzJFQ1x1N0FDQlx1NTkyN1x1NUU5M1x1RkYwOWApO1xuICAgICAgY29uc29sZS5pbmZvKGAgIFx1MjEzOVx1RkUwRiAgXHU0RTFBXHU1MkExXHU0RUUzXHU3ODAxXHU1NDhDIFZ1ZSBcdTc1MUZcdTYwMDFcdTU0MDhcdTVFNzZcdTUyMzBcdTRFM0JcdTY1ODdcdTRFRjZcdUZGMENcdTkwN0ZcdTUxNERcdTUyMURcdTU5Q0JcdTUzMTZcdTk4N0FcdTVFOEZcdTk1RUVcdTk4OThgKTtcblxuICAgICAgaWYgKG1pc3NpbmdSZXF1aXJlZENodW5rcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFxcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTI3NEMgXHU3RjNBXHU1OTMxXHU2ODM4XHU1RkMzIGNodW5rXHVGRjFBYCwgbWlzc2luZ1JlcXVpcmVkQ2h1bmtzKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBcdTY4MzhcdTVGQzMgY2h1bmsgXHU3RjNBXHU1OTMxXHVGRjBDXHU2Nzg0XHU1RUZBXHU1OTMxXHU4RDI1XHVGRjAxYCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmluZm8oYFxcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTI3MDUgXHU2ODM4XHU1RkMzIGNodW5rIFx1NTE2OFx1OTBFOFx1NUI1OFx1NTcyOGApO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTlBOENcdThCQzFcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTRFMDBcdTgxRjRcdTYwMjdcbiAgICAgIGNvbnNvbGUuaW5mbygnXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1RDgzRFx1REQwRCBcdTlBOENcdThCQzFcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTRFMDBcdTgxRjRcdTYwMjcuLi4nKTtcbiAgICAgIGNvbnN0IGFsbENodW5rRmlsZXMgPSBuZXcgU2V0KFsuLi5qc0NodW5rcywgLi4uY3NzQ2h1bmtzXSk7XG4gICAgICBjb25zdCByZWZlcmVuY2VkRmlsZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gICAgICBjb25zdCBtaXNzaW5nRmlsZXM6IEFycmF5PHsgZmlsZTogc3RyaW5nOyByZWZlcmVuY2VkQnk6IHN0cmluZ1tdOyBwb3NzaWJsZU1hdGNoZXM6IHN0cmluZ1tdIH0+ID0gW107XG5cbiAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICBjb25zdCBjaHVua0FueSA9IGNodW5rIGFzIGFueTtcbiAgICAgICAgaWYgKGNodW5rQW55LnR5cGUgPT09ICdjaHVuaycgJiYgY2h1bmtBbnkuY29kZSkge1xuICAgICAgICAgIGNvbnN0IGNvZGVXaXRob3V0Q29tbWVudHMgPSBjaHVua0FueS5jb2RlXG4gICAgICAgICAgICAucmVwbGFjZSgvXFwvXFwvLiokL2dtLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXC9cXCpbXFxzXFxTXSo/XFwqXFwvL2csICcnKTtcblxuICAgICAgICAgIGNvbnN0IGltcG9ydFBhdHRlcm4gPSAvaW1wb3J0XFxzKlxcKFxccypbXCInXShcXC8/YXNzZXRzXFwvW15cIidgXFxzXStcXC4oanN8bWpzfGNzcykpW1wiJ11cXHMqXFwpL2c7XG4gICAgICAgICAgbGV0IG1hdGNoO1xuICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSBpbXBvcnRQYXR0ZXJuLmV4ZWMoY29kZVdpdGhvdXRDb21tZW50cykpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCByZXNvdXJjZVBhdGggPSBtYXRjaFsxXTtcbiAgICAgICAgICAgIGlmICghcmVzb3VyY2VQYXRoKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlRmlsZSA9IHJlc291cmNlUGF0aC5yZXBsYWNlKC9eXFwvP2Fzc2V0c1xcLy8sICdhc3NldHMvJyk7XG4gICAgICAgICAgICBpZiAoIXJlZmVyZW5jZWRGaWxlcy5oYXMocmVzb3VyY2VGaWxlKSkge1xuICAgICAgICAgICAgICByZWZlcmVuY2VkRmlsZXMuc2V0KHJlc291cmNlRmlsZSwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVmZXJlbmNlZEZpbGVzLmdldChyZXNvdXJjZUZpbGUpIS5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB1cmxQYXR0ZXJuID0gL25ld1xccytVUkxcXHMqXFwoXFxzKltcIiddKFxcLz9hc3NldHNcXC9bXlwiJ2BcXHNdK1xcLihqc3xtanN8Y3NzKSlbXCInXS9nO1xuICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSB1cmxQYXR0ZXJuLmV4ZWMoY29kZVdpdGhvdXRDb21tZW50cykpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCByZXNvdXJjZVBhdGggPSBtYXRjaFsxXTtcbiAgICAgICAgICAgIGlmICghcmVzb3VyY2VQYXRoKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlRmlsZSA9IHJlc291cmNlUGF0aC5yZXBsYWNlKC9eXFwvP2Fzc2V0c1xcLy8sICdhc3NldHMvJyk7XG4gICAgICAgICAgICBpZiAoIXJlZmVyZW5jZWRGaWxlcy5oYXMocmVzb3VyY2VGaWxlKSkge1xuICAgICAgICAgICAgICByZWZlcmVuY2VkRmlsZXMuc2V0KHJlc291cmNlRmlsZSwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVmZXJlbmNlZEZpbGVzLmdldChyZXNvdXJjZUZpbGUpIS5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBbcmVmZXJlbmNlZEZpbGUsIHJlZmVyZW5jZWRCeV0gb2YgcmVmZXJlbmNlZEZpbGVzLmVudHJpZXMoKSkge1xuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHJlZmVyZW5jZWRGaWxlLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJyk7XG4gICAgICAgIGxldCBleGlzdHMgPSBhbGxDaHVua0ZpbGVzLmhhcyhmaWxlTmFtZSk7XG4gICAgICAgIGxldCBwb3NzaWJsZU1hdGNoZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgICBjb25zdCBtYXRjaCA9IGZpbGVOYW1lLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi0oW2EtekEtWjAtOV17OCx9KSk/XFwuKGpzfG1qc3xjc3MpJC8pO1xuICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgY29uc3QgWywgbmFtZVByZWZpeCwgLCBleHRdID0gbWF0Y2g7XG4gICAgICAgICAgICBwb3NzaWJsZU1hdGNoZXMgPSBBcnJheS5mcm9tKGFsbENodW5rRmlsZXMpLmZpbHRlcihjaHVua0ZpbGUgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBjaHVua01hdGNoID0gY2h1bmtGaWxlLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi0oW2EtekEtWjAtOV17OCx9KSk/XFwuKGpzfG1qc3xjc3MpJC8pO1xuICAgICAgICAgICAgICBpZiAoY2h1bmtNYXRjaCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IFssIGNodW5rTmFtZVByZWZpeCwgLCBjaHVua0V4dF0gPSBjaHVua01hdGNoO1xuICAgICAgICAgICAgICAgIHJldHVybiBjaHVua05hbWVQcmVmaXggPT09IG5hbWVQcmVmaXggJiYgY2h1bmtFeHQgPT09IGV4dDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGV4aXN0cyA9IHBvc3NpYmxlTWF0Y2hlcy5sZW5ndGggPiAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgICAgbWlzc2luZ0ZpbGVzLnB1c2goeyBmaWxlOiByZWZlcmVuY2VkRmlsZSwgcmVmZXJlbmNlZEJ5LCBwb3NzaWJsZU1hdGNoZXMgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1pc3NpbmdGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFxcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTI3NEMgXHU1M0QxXHU3M0IwICR7bWlzc2luZ0ZpbGVzLmxlbmd0aH0gXHU0RTJBXHU1RjE1XHU3NTI4XHU3Njg0XHU4RDQ0XHU2RTkwXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjFBYCk7XG4gICAgICAgIGlmIChtaXNzaW5nRmlsZXMubGVuZ3RoIDw9IDUpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oYFxcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTI2QTBcdUZFMEYgIFx1OEI2Nlx1NTQ0QVx1RkYxQVx1NTNEMVx1NzNCMCAke21pc3NpbmdGaWxlcy5sZW5ndGh9IFx1NEUyQVx1NUYxNVx1NzUyOFx1NzY4NFx1OEQ0NFx1NkU5MFx1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1NEY0Nlx1N0VFN1x1N0VFRFx1Njc4NFx1NUVGQWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgXHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU0RTBEXHU0RTAwXHU4MUY0XHVGRjBDXHU2Nzg0XHU1RUZBXHU1OTMxXHU4RDI1XHVGRjAxXHU2NzA5ICR7bWlzc2luZ0ZpbGVzLmxlbmd0aH0gXHU0RTJBXHU1RjE1XHU3NTI4XHU3Njg0XHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4YCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1MjcwNSBcdTYyNDBcdTY3MDlcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTkwRkRcdTZCNjNcdTc4NkVcdUZGMDhcdTUxNzFcdTlBOENcdThCQzEgJHtyZWZlcmVuY2VkRmlsZXMuc2l6ZX0gXHU0RTJBXHU1RjE1XHU3NTI4XHVGRjA5YCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbi8qKlxuICogXHU0RjE4XHU1MzE2XHU0RUUzXHU3ODAxXHU1MjA2XHU1MjcyXHU2M0QyXHU0RUY2XHVGRjFBXHU1OTA0XHU3NDA2XHU3QTdBIGNodW5rXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHRpbWl6ZUNodW5rc1BsdWdpbigpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdvcHRpbWl6ZS1jaHVua3MnLFxuICAgIGdlbmVyYXRlQnVuZGxlKF9vcHRpb25zOiBPdXRwdXRPcHRpb25zLCBidW5kbGU6IE91dHB1dEJ1bmRsZSkge1xuICAgICAgY29uc3QgZW1wdHlDaHVua3M6IHN0cmluZ1tdID0gW107XG4gICAgICBjb25zdCBjaHVua1JlZmVyZW5jZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG5cbiAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICBjb25zdCBjaHVua0FueSA9IGNodW5rIGFzIGFueTtcbiAgICAgICAgaWYgKGNodW5rQW55LnR5cGUgPT09ICdjaHVuaycgJiYgY2h1bmtBbnkuY29kZSAmJiBjaHVua0FueS5jb2RlLnRyaW0oKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBlbXB0eUNodW5rcy5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2h1bmtBbnkudHlwZSA9PT0gJ2NodW5rJyAmJiBjaHVua0FueS5pbXBvcnRzKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBpbXBvcnRlZCBvZiBjaHVua0FueS5pbXBvcnRzKSB7XG4gICAgICAgICAgICBpZiAoIWNodW5rUmVmZXJlbmNlcy5oYXMoaW1wb3J0ZWQpKSB7XG4gICAgICAgICAgICAgIGNodW5rUmVmZXJlbmNlcy5zZXQoaW1wb3J0ZWQsIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNodW5rUmVmZXJlbmNlcy5nZXQoaW1wb3J0ZWQpIS5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGVtcHR5Q2h1bmtzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNodW5rc1RvUmVtb3ZlOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgY29uc3QgY2h1bmtzVG9LZWVwOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICBmb3IgKGNvbnN0IGVtcHR5Q2h1bmsgb2YgZW1wdHlDaHVua3MpIHtcbiAgICAgICAgY29uc3QgcmVmZXJlbmNlZEJ5ID0gY2h1bmtSZWZlcmVuY2VzLmdldChlbXB0eUNodW5rKSB8fCBbXTtcbiAgICAgICAgaWYgKHJlZmVyZW5jZWRCeS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uc3QgY2h1bmsgPSBidW5kbGVbZW1wdHlDaHVua107XG4gICAgICAgICAgaWYgKGNodW5rICYmIChjaHVuayBhcyBhbnkpLnR5cGUgPT09ICdjaHVuaycpIHtcbiAgICAgICAgICAgIChjaHVuayBhcyBhbnkpLmNvZGUgPSAnZXhwb3J0IHt9JztcbiAgICAgICAgICAgIGNodW5rc1RvS2VlcC5wdXNoKGVtcHR5Q2h1bmspO1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbb3B0aW1pemUtY2h1bmtzXSBcdTRGRERcdTc1NTlcdTg4QUJcdTVGMTVcdTc1MjhcdTc2ODRcdTdBN0EgY2h1bms6ICR7ZW1wdHlDaHVua30gKFx1ODhBQiAke3JlZmVyZW5jZWRCeS5sZW5ndGh9IFx1NEUyQSBjaHVuayBcdTVGMTVcdTc1MjhcdUZGMENcdTVERjJcdTZERkJcdTUyQTBcdTUzNjBcdTRGNERcdTdCMjYpYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNodW5rc1RvUmVtb3ZlLnB1c2goZW1wdHlDaHVuayk7XG4gICAgICAgICAgZGVsZXRlIGJ1bmRsZVtlbXB0eUNodW5rXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoY2h1bmtzVG9SZW1vdmUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtvcHRpbWl6ZS1jaHVua3NdIFx1NzlGQlx1OTY2NFx1NEU4NiAke2NodW5rc1RvUmVtb3ZlLmxlbmd0aH0gXHU0RTJBXHU2NzJBXHU4OEFCXHU1RjE1XHU3NTI4XHU3Njg0XHU3QTdBIGNodW5rOmAsIGNodW5rc1RvUmVtb3ZlKTtcbiAgICAgIH1cbiAgICAgIGlmIChjaHVua3NUb0tlZXAubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtvcHRpbWl6ZS1jaHVua3NdIFx1NEZERFx1NzU1OVx1NEU4NiAke2NodW5rc1RvS2VlcC5sZW5ndGh9IFx1NEUyQVx1ODhBQlx1NUYxNVx1NzUyOFx1NzY4NFx1N0E3QSBjaHVua1x1RkYwOFx1NURGMlx1NkRGQlx1NTJBMFx1NTM2MFx1NEY0RFx1N0IyNlx1RkYwOTpgLCBjaHVua3NUb0tlZXApO1xuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcdXJsLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VybC50c1wiOy8qKlxuICogVVJMIFx1NzZGOFx1NTE3M1x1NjNEMlx1NEVGNlxuICogXHU3ODZFXHU0RkREIGJhc2UgVVJMIFx1NkI2M1x1Nzg2RVxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbdXJsXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbdXJsXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW3VybF0nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW3VybF0nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdHlwZSB7IENodW5rSW5mbywgT3V0cHV0T3B0aW9ucywgT3V0cHV0QnVuZGxlIH0gZnJvbSAncm9sbHVwJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHsgcmVzb2x2ZSBhcyByZXNvbHZlUGF0aCwgZGlybmFtZSB9IGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xuY29uc3QgX19kaXJuYW1lID0gZGlybmFtZShfX2ZpbGVuYW1lKTtcblxuZnVuY3Rpb24gZ2V0QnVpbGRUaW1lc3RhbXBGb3JRdWVyeSgpOiBzdHJpbmcge1xuICAvLyBcdTRGMThcdTUxNDhcdTRGN0ZcdTc1MjhcdTUxNjhcdTkxQ0ZcdTY3ODRcdTVFRkFcdTgxMUFcdTY3MkNcdTZDRThcdTUxNjVcdTc2ODRcdTY1RjZcdTk1RjRcdTYyMzNcdUZGMDhcdTRFMEUgYWRkVmVyc2lvblBsdWdpbiBcdTRGRERcdTYzMDFcdTRFMDBcdTgxRjRcdUZGMDlcbiAgaWYgKHByb2Nlc3MuZW52LkJUQ19CVUlMRF9USU1FU1RBTVApIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnYuQlRDX0JVSUxEX1RJTUVTVEFNUDtcbiAgfVxuICAvLyBcdTUxNzZcdTZCMjFcdThCRkJcdTUzRDYgLmJ1aWxkLXRpbWVzdGFtcFx1RkYwOFx1NEUwRSBhZGRWZXJzaW9uUGx1Z2luIFx1NzY4NFx1NUI5RVx1NzNCMFx1NEUwMFx1ODFGNFx1RkYwOVxuICBjb25zdCB0aW1lc3RhbXBGaWxlID0gcmVzb2x2ZVBhdGgoX19kaXJuYW1lLCAnLi4vLi4vLi4vLmJ1aWxkLXRpbWVzdGFtcCcpO1xuICBpZiAoZXhpc3RzU3luYyh0aW1lc3RhbXBGaWxlKSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB0cyA9IHJlYWRGaWxlU3luYyh0aW1lc3RhbXBGaWxlLCAndXRmLTgnKS50cmltKCk7XG4gICAgICBpZiAodHMpIHJldHVybiB0cztcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIGlnbm9yZVxuICAgIH1cbiAgfVxuICAvLyBcdTY3MDBcdTU0MEVcdTUxNUNcdTVFOTVcdUZGMUFcdTc1MUZcdTYyMTBcdTRFMDBcdTRFMkFcdUZGMDhcdTRFMERcdTUxOTlcdTU2REVcdTY1ODdcdTRFRjZcdUZGMENcdTkwN0ZcdTUxNERcdTUyNkZcdTRGNUNcdTc1MjhcdUZGMDlcbiAgcmV0dXJuIERhdGUubm93KCkudG9TdHJpbmcoMzYpO1xufVxuXG4vKipcbiAqIFx1Nzg2RVx1NEZERCBiYXNlIFVSTCBcdTYzRDJcdTRFRjZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZUJhc2VVcmxQbHVnaW4oYmFzZVVybDogc3RyaW5nLCBhcHBIb3N0OiBzdHJpbmcsIGFwcFBvcnQ6IG51bWJlciwgbWFpbkFwcFBvcnQ6IHN0cmluZyk6IFBsdWdpbiB7XG4gIGNvbnN0IGlzUHJldmlld0J1aWxkID0gYmFzZVVybC5zdGFydHNXaXRoKCdodHRwJyk7XG4gIGNvbnN0IHFpYW5rdW5JbmRleEltcG9ydFJlZ2V4ID0gL2ltcG9ydFxcKChbJ1wiXSlcXC9hc3NldHNcXC8oaW5kZXh8bWFpbiktKFteJ1wiXSspXFwxXFwpL2c7XG4gIGNvbnN0IGJ1aWxkVGltZXN0YW1wID0gZ2V0QnVpbGRUaW1lc3RhbXBGb3JRdWVyeSgpO1xuICBjb25zdCBxaWFua3VuSW5kZXhJbXBvcnRJbkh0bWxSZWdleCA9IC9pbXBvcnRcXChcXHMqKFsnXCJdKShcXC9hc3NldHNcXC8oaW5kZXh8bWFpbiktW14nXCJdKylcXDFcXHMqXFwpL2c7XG5cbiAgLyoqXG4gICAqIFx1NEZFRVx1NTkwRCB2aXRlLXBsdWdpbi1xaWFua3VuIFx1NzUxRlx1NjIxMFx1NzY4NFx1NTMwNVx1ODhDNVx1NTY2OFx1OTFDQ1x1NEY3Rlx1NzUyOFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NCBpbXBvcnQoJy9hc3NldHMvaW5kZXgteHh4LmpzJykgXHU3Njg0XHU5NUVFXHU5ODk4XHVGRjFBXG4gICAqIC0gXHU1NzI4IHFpYW5rdW4gXHU2Qzk5XHU3QkIxXHU5MUNDXHVGRjBDXHU4RkQ5XHU0RjFBXHU2MzA5XHUyMDFDXHU1QkJGXHU0RTNCIG9yaWdpblx1MjAxRFx1ODlFM1x1Njc5MFx1RkYwQ1x1NUJGQ1x1ODFGNFx1NUI1MFx1NUU5NFx1NzUyOFx1NTE2NVx1NTNFMyBjaHVuayBcdTg4QUJcdTk1MTlcdThCRUZcdThCRjdcdTZDNDJcdTUyMzAgbGF5b3V0IFx1NTdERlx1NTQwRFxuICAgKiAtIFx1OEZEOVx1OTFDQ1x1NjUzOVx1NEUzQVx1RkYxQVx1NEYxOFx1NTE0OFx1NEY3Rlx1NzUyOCBxaWFua3VuIFx1NkNFOFx1NTE2NVx1NzY4NCBfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fX1x1RkYwOFx1OTAxQVx1NUUzOFx1NEUzQVx1NUI1MFx1NUU5NFx1NzUyOCBvcmlnaW5cdUZGMDlcdUZGMENcdTU0MjZcdTUyMTlcdTU2REVcdTkwMDBcdTUyMzAgd2luZG93LmxvY2F0aW9uLm9yaWdpblxuICAgKi9cbiAgZnVuY3Rpb24gcGF0Y2hRaWFua3VuSW5kZXhJbXBvcnRzKGNvZGU6IHN0cmluZyk6IHsgY29kZTogc3RyaW5nOyBtb2RpZmllZDogYm9vbGVhbiB9IHtcbiAgICBpZiAoIXFpYW5rdW5JbmRleEltcG9ydFJlZ2V4LnRlc3QoY29kZSkpIHtcbiAgICAgIHJldHVybiB7IGNvZGUsIG1vZGlmaWVkOiBmYWxzZSB9O1xuICAgIH1cbiAgICBxaWFua3VuSW5kZXhJbXBvcnRSZWdleC5sYXN0SW5kZXggPSAwO1xuXG4gICAgY29uc3QgaGVscGVyTmFtZSA9ICdfX2J0Y1FpYW5rdW5Bc3NldE9yaWdpbic7XG4gICAgY29uc3QgdHNOYW1lID0gJ19fYnRjQnVpbGRWJztcbiAgICBjb25zdCBoZWxwZXJEZWNsID1cbiAgICAgIGBjb25zdCAke2hlbHBlck5hbWV9PSgoKT0+e3RyeXtjb25zdCBwPXdpbmRvdyYmd2luZG93Ll9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fO2AgK1xuICAgICAgYGlmKHAmJnR5cGVvZiBwPT09J3N0cmluZycpe2NvbnN0IHM9cC5yZXBsYWNlKC9cXFxcLyQvLCcnKTtgICtcbiAgICAgIGBpZihzLnN0YXJ0c1dpdGgoJ2h0dHAnKXx8cy5zdGFydHNXaXRoKCcvLycpKXJldHVybiBzO2AgK1xuICAgICAgYHJldHVybiAod2luZG93LmxvY2F0aW9uJiZ3aW5kb3cubG9jYXRpb24ub3JpZ2luP3dpbmRvdy5sb2NhdGlvbi5vcmlnaW46JycpK3M7fWAgK1xuICAgICAgYH1jYXRjaHt9cmV0dXJuICh3aW5kb3cubG9jYXRpb24mJndpbmRvdy5sb2NhdGlvbi5vcmlnaW4pP3dpbmRvdy5sb2NhdGlvbi5vcmlnaW46Jyc7fSkoKTtgO1xuICAgIGNvbnN0IHRzRGVjbCA9IGBjb25zdCAke3RzTmFtZX09JyR7YnVpbGRUaW1lc3RhbXB9JztgO1xuXG4gICAgbGV0IG5ld0NvZGUgPSBjb2RlLnJlcGxhY2UocWlhbmt1bkluZGV4SW1wb3J0UmVnZXgsIChfbSwgX3EsIF9raW5kLCByZXN0KSA9PiB7XG4gICAgICAvLyByZXN0OiBcInh4eHguanNcIiBcdTkxQ0NcdTc2ODRcdTRGNTlcdTRFMEJcdTkwRThcdTUyMDZcdUZGMDhoYXNoICsgLmpzXHVGRjA5XG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdThGRkRcdTUyQTAgP3Y9IFx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1RkYwQ1x1OTA3Rlx1NTE0RFx1NUJCRlx1NEUzQi9cdTZENEZcdTg5QzhcdTU2NjgvQ0ROIFx1NTkwRFx1NzUyOFx1NjVFN1x1NTE2NVx1NTNFM1x1ODExQVx1NjcyQ1x1NUJGQ1x1ODFGNFx1NjMwMVx1N0VFRFx1OEJGN1x1NkM0Mlx1NjVFNyBjaHVua1xuICAgICAgcmV0dXJuIGBpbXBvcnQoLyogQHZpdGUtaWdub3JlICovICgke2hlbHBlck5hbWV9ICsgJy9hc3NldHMvJHtfa2luZH0tJHtyZXN0fScgKyAnP3Y9JyArICR7dHNOYW1lfSkpYDtcbiAgICB9KTtcblxuICAgIGlmICghbmV3Q29kZS5pbmNsdWRlcyhoZWxwZXJEZWNsKSkge1xuICAgICAgLy8gXHU1QzNEXHU5MUNGXHU1QzExXHU0RkI1XHU1MTY1XHVGRjFBXHU1M0VBXHU1NzI4XHU5NzAwXHU4OTgxXHU2NUY2XHU2M0QyXHU1MTY1IGhlbHBlclx1RkYwQ1x1NEUwMFx1NkIyMVx1NTM3M1x1NTNFRlxuICAgICAgbmV3Q29kZSA9IGAke3RzRGVjbH1cXG4ke2hlbHBlckRlY2x9XFxuJHtuZXdDb2RlfWA7XG4gICAgfVxuICAgIHJldHVybiB7IGNvZGU6IG5ld0NvZGUsIG1vZGlmaWVkOiB0cnVlIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdlbnN1cmUtYmFzZS11cmwnLFxuICAgIHJlbmRlckNodW5rKGNvZGU6IHN0cmluZywgY2h1bms6IENodW5rSW5mbywgX29wdGlvbnM6IGFueSkge1xuICAgICAgLy8gXHU0RTBEXHU1MThEXHU4REYzXHU4RkM3IHZlbmRvciBcdTdCNDlcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTNcdUZGMENcdTc4NkVcdTRGRERcdTYyNDBcdTY3MDlcdThENDRcdTZFOTBcdThERUZcdTVGODRcdTkwRkRcdTZCNjNcdTc4NkVcbiAgICAgIC8vIFx1NTZFMFx1NEUzQSB2ZW5kb3IgXHU3QjQ5XHU1RTkzXHU0RTJEXHU0RTVGXHU1M0VGXHU4MEZEXHU1MzA1XHU1NDJCXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XG5cbiAgICAgIGxldCBuZXdDb2RlID0gY29kZTtcbiAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MEQgcWlhbmt1biBcdTUzMDVcdTg4QzVcdTU2NjhcdTc2ODRcdTdFRERcdTVCRjkgL2Fzc2V0cy9pbmRleC14eHguanMgXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHVGRjA4XHU4REU4XHU1N0RGXHU1QkJGXHU0RTNCXHU0RjFBIDQwNFx1RkYwOVxuICAgICAge1xuICAgICAgICBjb25zdCBwYXRjaGVkID0gcGF0Y2hRaWFua3VuSW5kZXhJbXBvcnRzKG5ld0NvZGUpO1xuICAgICAgICBpZiAocGF0Y2hlZC5tb2RpZmllZCkge1xuICAgICAgICAgIG5ld0NvZGUgPSBwYXRjaGVkLmNvZGU7XG4gICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChpc1ByZXZpZXdCdWlsZCkge1xuICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGhSZWdleCA9IC8oW1wiJ2BdKShcXC9hc3NldHNcXC9bXlwiJ2BcXHNdKykoXFw/W15cIidgXFxzXSopPy9nO1xuICAgICAgICBpZiAocmVsYXRpdmVQYXRoUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2UocmVsYXRpdmVQYXRoUmVnZXgsIChfbWF0Y2gsIHF1b3RlLCBwYXRoLCBxdWVyeSA9ICcnKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYCR7cXVvdGV9JHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkVFXHU1OTBEXHU5NTE5XHU4QkVGXHU3Njg0XHU3QUVGXHU1M0UzXHVGRjA4XHU0RTNCXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzIC0+IFx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFM1x1RkYwOVxuICAgICAgLy8gXHU1MzM5XHU5MTREIGh0dHA6Ly9sb2NhbGhvc3Q6NDE4MC9hc3NldHMveHh4IFx1NjIxNiBodHRwOi8vMTAuODAuOC4xOTk6NDE4MC9hc3NldHMveHh4XG4gICAgICBjb25zdCB3cm9uZ1BvcnRIdHRwUmVnZXggPSBuZXcgUmVnRXhwKGBodHRwOi8vKCR7YXBwSG9zdH18bG9jYWxob3N0KToke21haW5BcHBQb3J0fSgvYXNzZXRzL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyk7XG4gICAgICBpZiAod3JvbmdQb3J0SHR0cFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZSh3cm9uZ1BvcnRIdHRwUmVnZXgsIChfbWF0Y2gsIGhvc3QsIHBhdGgsIHF1ZXJ5ID0gJycpID0+IHtcbiAgICAgICAgICAvLyBcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjggYmFzZVVybFx1RkYwOFx1NTMwNVx1NTQyQlx1NUI4Q1x1NjU3NCBVUkxcdUZGMDlcbiAgICAgICAgICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBgJHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gXHU1RjAwXHU1M0QxXHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzXG4gICAgICAgICAgcmV0dXJuIGBodHRwOi8vJHtob3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgfSk7XG4gICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1MzM5XHU5MTREIC8vbG9jYWxob3N0OjQxODAvYXNzZXRzL3h4eCBcdTYyMTYgLy8xMC44MC44LjE5OTo0MTgwL2Fzc2V0cy94eHhcbiAgICAgIGNvbnN0IHdyb25nUG9ydFByb3RvY29sUmVnZXggPSBuZXcgUmVnRXhwKGAvLygke2FwcEhvc3R9fGxvY2FsaG9zdCk6JHttYWluQXBwUG9ydH0oL2Fzc2V0cy9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpO1xuICAgICAgaWYgKHdyb25nUG9ydFByb3RvY29sUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHdyb25nUG9ydFByb3RvY29sUmVnZXgsIChfbWF0Y2gsIGhvc3QsIHBhdGgsIHF1ZXJ5ID0gJycpID0+IHtcbiAgICAgICAgICAvLyBcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjggYmFzZVVybFx1RkYwOFx1NTMwNVx1NTQyQlx1NUI4Q1x1NjU3NCBVUkxcdUZGMDlcbiAgICAgICAgICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBgJHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gXHU1RjAwXHU1M0QxXHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzXG4gICAgICAgICAgcmV0dXJuIGAvLyR7aG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgIH0pO1xuICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhdHRlcm5zID0gW1xuICAgICAgICB7XG4gICAgICAgICAgcmVnZXg6IG5ldyBSZWdFeHAoYChodHRwOi8vKShsb2NhbGhvc3R8JHthcHBIb3N0fSk6JHttYWluQXBwUG9ydH0oL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyksXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IChfbWF0Y2g6IHN0cmluZywgcHJvdG9jb2w6IHN0cmluZywgX2hvc3Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgJHtwcm90b2NvbH0ke2FwcEhvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZWdleDogbmV3IFJlZ0V4cChgKC8vKShsb2NhbGhvc3R8JHthcHBIb3N0fSk6JHttYWluQXBwUG9ydH0oL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyksXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IChfbWF0Y2g6IHN0cmluZywgcHJvdG9jb2w6IHN0cmluZywgX2hvc3Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgJHtwcm90b2NvbH0ke2FwcEhvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZWdleDogbmV3IFJlZ0V4cChgKFtcIidcXGBdKShodHRwOi8vKShsb2NhbGhvc3R8JHthcHBIb3N0fSk6JHttYWluQXBwUG9ydH0oL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyksXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IChfbWF0Y2g6IHN0cmluZywgcXVvdGU6IHN0cmluZywgcHJvdG9jb2w6IHN0cmluZywgX2hvc3Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgJHtxdW90ZX0ke3Byb3RvY29sfSR7YXBwSG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKGAoW1wiJ1xcYF0pKC8vKShsb2NhbGhvc3R8JHthcHBIb3N0fSk6JHttYWluQXBwUG9ydH0oL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyksXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IChfbWF0Y2g6IHN0cmluZywgcXVvdGU6IHN0cmluZywgcHJvdG9jb2w6IHN0cmluZywgX2hvc3Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgJHtxdW90ZX0ke3Byb3RvY29sfSR7YXBwSG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF07XG5cbiAgICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiBwYXR0ZXJucykge1xuICAgICAgICBpZiAocGF0dGVybi5yZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShwYXR0ZXJuLnJlZ2V4LCBwYXR0ZXJuLnJlcGxhY2VtZW50IGFzIGFueSk7XG4gICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtYmFzZS11cmxdIFx1NEZFRVx1NTkwRFx1NEU4NiAke2NodW5rLmZpbGVOYW1lfSBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdThERUZcdTVGODQgKCR7bWFpbkFwcFBvcnR9IC0+ICR7YXBwUG9ydH0pYCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY29kZTogbmV3Q29kZSxcbiAgICAgICAgICBtYXA6IG51bGwsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgZ2VuZXJhdGVCdW5kbGUoX29wdGlvbnM6IE91dHB1dE9wdGlvbnMsIGJ1bmRsZTogT3V0cHV0QnVuZGxlKSB7XG4gICAgICBmb3IgKGNvbnN0IFtmaWxlTmFtZSwgY2h1bmtdIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmRsZSkpIHtcbiAgICAgICAgY29uc3QgYzogYW55ID0gY2h1bms7XG4gICAgICAgIGlmIChjLnR5cGUgPT09ICdjaHVuaycgJiYgYy5jb2RlKSB7XG4gICAgICAgICAgLy8gXHU0RTBEXHU1MThEXHU4REYzXHU4RkM3IHZlbmRvciBcdTdCNDlcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTNcdUZGMENcdTc4NkVcdTRGRERcdTYyNDBcdTY3MDlcdThENDRcdTZFOTBcdThERUZcdTVGODRcdTkwRkRcdTZCNjNcdTc4NkVcbiAgICAgICAgICBsZXQgbmV3Q29kZSA9IGMuY29kZTtcbiAgICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRCBxaWFua3VuIFx1NTMwNVx1ODhDNVx1NTY2OFx1NzY4NFx1N0VERFx1NUJGOSAvYXNzZXRzL2luZGV4LXh4eC5qcyBcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdUZGMDhcdThERThcdTU3REZcdTVCQkZcdTRFM0JcdTRGMUEgNDA0XHVGRjA5XG4gICAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgcGF0Y2hlZCA9IHBhdGNoUWlhbmt1bkluZGV4SW1wb3J0cyhuZXdDb2RlKTtcbiAgICAgICAgICAgIGlmIChwYXRjaGVkLm1vZGlmaWVkKSB7XG4gICAgICAgICAgICAgIG5ld0NvZGUgPSBwYXRjaGVkLmNvZGU7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aFJlZ2V4ID0gLyhbXCInYF0pKFxcL2Fzc2V0c1xcL1teXCInYFxcc10rKShcXD9bXlwiJ2BcXHNdKik/L2c7XG4gICAgICAgICAgICBpZiAocmVsYXRpdmVQYXRoUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHJlbGF0aXZlUGF0aFJlZ2V4LCAoX21hdGNoOiBzdHJpbmcsIHF1b3RlOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3F1b3RlfSR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkVFXHU1OTBEXHU5NTE5XHU4QkVGXHU3Njg0XHU3QUVGXHU1M0UzXHVGRjA4XHU0RTNCXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzIC0+IFx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFM1x1RkYwOVxuICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RCBodHRwOi8vbG9jYWxob3N0OjQxODAvYXNzZXRzL3h4eCBcdTYyMTYgaHR0cDovLzEwLjgwLjguMTk5OjQxODAvYXNzZXRzL3h4eFxuICAgICAgICAgIGNvbnN0IHdyb25nUG9ydEh0dHBSZWdleCA9IG5ldyBSZWdFeHAoYGh0dHA6Ly8oJHthcHBIb3N0fXxsb2NhbGhvc3QpOiR7bWFpbkFwcFBvcnR9KC9hc3NldHMvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKTtcbiAgICAgICAgICBpZiAod3JvbmdQb3J0SHR0cFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uod3JvbmdQb3J0SHR0cFJlZ2V4LCAoX21hdGNoOiBzdHJpbmcsIGhvc3Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgICAgLy8gXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4IGJhc2VVcmxcdUZGMDhcdTUzMDVcdTU0MkJcdTVCOENcdTY1NzQgVVJMXHVGRjA5XG4gICAgICAgICAgICAgIGlmIChpc1ByZXZpZXdCdWlsZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBcdTVGMDBcdTUzRDFcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjhcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcbiAgICAgICAgICAgICAgcmV0dXJuIGBodHRwOi8vJHtob3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RCAvL2xvY2FsaG9zdDo0MTgwL2Fzc2V0cy94eHggXHU2MjE2IC8vMTAuODAuOC4xOTk6NDE4MC9hc3NldHMveHh4XG4gICAgICAgICAgY29uc3Qgd3JvbmdQb3J0UHJvdG9jb2xSZWdleCA9IG5ldyBSZWdFeHAoYC8vKCR7YXBwSG9zdH18bG9jYWxob3N0KToke21haW5BcHBQb3J0fSgvYXNzZXRzL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyk7XG4gICAgICAgICAgaWYgKHdyb25nUG9ydFByb3RvY29sUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZSh3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4LCAoX21hdGNoOiBzdHJpbmcsIGhvc3Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgICAgLy8gXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4IGJhc2VVcmxcdUZGMDhcdTUzMDVcdTU0MkJcdTVCOENcdTY1NzQgVVJMXHVGRjA5XG4gICAgICAgICAgICAgIGlmIChpc1ByZXZpZXdCdWlsZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBcdTVGMDBcdTUzRDFcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjhcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcbiAgICAgICAgICAgICAgcmV0dXJuIGAvLyR7aG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgICAgIChjaHVuayBhcyBhbnkpLmNvZGUgPSBuZXdDb2RlO1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTU3MjggZ2VuZXJhdGVCdW5kbGUgXHU0RTJEXHU0RkVFXHU1OTBEXHU0RTg2ICR7ZmlsZU5hbWV9IFx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NGApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChjLnR5cGUgPT09ICdhc3NldCcgJiYgZmlsZU5hbWUgPT09ICdpbmRleC5odG1sJykge1xuICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNiBIVE1MIFx1NjU4N1x1NEVGNlx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFxuICAgICAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTk4Mlx1Njc5QyBWaXRlIFx1OTE0RFx1N0Y2RVx1NkI2M1x1Nzg2RVx1RkYwOGJhc2U6ICcvJywgYXNzZXRzRGlyOiAnYXNzZXRzJywgcm9sbHVwT3B0aW9ucy5vdXRwdXQuY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcydcdUZGMDlcdUZGMENcbiAgICAgICAgICAvLyBWaXRlIFx1NUU5NFx1OEJFNVx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMFx1NkI2M1x1Nzg2RVx1NzY4NFx1OERFRlx1NUY4NFx1RkYwQ1x1NEUwRFx1OTcwMFx1ODk4MVx1NEZFRVx1NTkwRFx1MzAwMlxuICAgICAgICAgIC8vIFx1OEZEOVx1OTFDQ1x1NTNFQVx1NTkwNFx1NzQwNlx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1NjVGNlx1NzY4NFx1N0FFRlx1NTNFM1x1NEZFRVx1NTkwRFx1RkYwQ1x1NEVFNVx1NTNDQVx1NEZFRVx1NTkwRFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1MzAwMlxuICAgICAgICAgIGxldCBodG1sQ29udGVudCA9ICgoYyBhcyBhbnkpLnNvdXJjZSkgYXMgc3RyaW5nO1xuICAgICAgICAgIGxldCBodG1sTW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAgIC8vIFx1NEZFRVx1NTkwRFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NCAuL2Fzc2V0cy8gXHU0RTNBXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0IC9hc3NldHMvXHVGRjA4XHU1OTgyXHU2NzlDXHU1MUZBXHU3M0IwXHVGRjA5XG4gICAgICAgICAgY29uc3QgcmVsYXRpdmVBc3NldFJlZ2V4ID0gLyhocmVmfHNyYyk9W1wiJ10oXFwuXFwvYXNzZXRzXFwvW15cIiddKykoXFw/W15cIiddKik/W1wiJ10vZztcbiAgICAgICAgICBpZiAocmVsYXRpdmVBc3NldFJlZ2V4LnRlc3QoaHRtbENvbnRlbnQpKSB7XG4gICAgICAgICAgICBodG1sQ29udGVudCA9IGh0bWxDb250ZW50LnJlcGxhY2UocmVsYXRpdmVBc3NldFJlZ2V4LCAoX21hdGNoLCBhdHRyLCBwYXRoLCBxdWVyeSA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1NUMwNlx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1OEY2Q1x1NjM2Mlx1NEUzQVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFxuICAgICAgICAgICAgICBjb25zdCBhYnNvbHV0ZVBhdGggPSBwYXRoLnJlcGxhY2UoL15cXC4vLCAnJyk7XG4gICAgICAgICAgICAgIGh0bWxNb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0OiAke3BhdGh9IC0+ICR7YWJzb2x1dGVQYXRofWApO1xuICAgICAgICAgICAgICByZXR1cm4gYCR7YXR0cn09XCIke2Fic29sdXRlUGF0aH0ke3F1ZXJ5fVwiYDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRCB2aXRlLXBsdWdpbi1xaWFua3VuIFx1NkNFOFx1NTE2NVx1NTIzMCBpbmRleC5odG1sIFx1NTE4NVx1ODA1NFx1ODExQVx1NjcyQ1x1NEUyRFx1NzY4NCBpbXBvcnQoJy9hc3NldHMvaW5kZXgteHh4LmpzJylcbiAgICAgICAgICAvLyBcdThCRjRcdTY2MEVcdUZGMUFxaWFua3VuIFx1NEYxQVx1NjI4QVx1OEJFNVx1NTE4NVx1ODA1NFx1ODExQVx1NjcyQyBldmFsIFx1NjIxMCBWTSBcdTYyNjdcdTg4NENcdUZGMUJcdTU5ODJcdTY3OUNcdTRFQ0RcdTY2MkYgL2Fzc2V0cy8gXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU1QzMxXHU0RjFBXHU2MzA5XHU1QkJGXHU0RTNCXHU1N0RGXHU1NDBEXHU4OUUzXHU2NzkwXHVGRjA4XHU1QkZDXHU4MUY0IGxheW91dCBcdTU3REZcdTU0MEQgNDA0XHVGRjA5XHUzMDAyXG4gICAgICAgICAgLy8gXHU4RkQ5XHU5MUNDXHU2NTM5XHU0RTNBXHVGRjFBXHU0RjE4XHU1MTQ4XHU3NTI4IF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fXHVGRjA4XHU1QjUwXHU1RTk0XHU3NTI4IHB1YmxpY1BhdGgvb3JpZ2luXHVGRjA5XHVGRjBDXHU1RTc2XHU4RkZEXHU1MkEwID92PSBcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdUZGMENcdTkwN0ZcdTUxNERcdTdGMTNcdTVCNThcdTY1RTdcdTUxNjVcdTUzRTNcdTMwMDJcbiAgICAgICAgICBpZiAocWlhbmt1bkluZGV4SW1wb3J0SW5IdG1sUmVnZXgudGVzdChodG1sQ29udGVudCkpIHtcbiAgICAgICAgICAgIHFpYW5rdW5JbmRleEltcG9ydEluSHRtbFJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICBjb25zdCBvcmlnaW5FeHByID1cbiAgICAgICAgICAgICAgYCgodHlwZW9mIF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fIT09J3VuZGVmaW5lZCcmJl9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fKWAgK1xuICAgICAgICAgICAgICBgP25ldyBVUkwoX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18sKHR5cGVvZiBsb2NhdGlvbiE9PSd1bmRlZmluZWQnJiZsb2NhdGlvbi5vcmlnaW4pfHwnJykub3JpZ2luYCArXG4gICAgICAgICAgICAgIGA6KCh0eXBlb2YgbG9jYXRpb24hPT0ndW5kZWZpbmVkJyYmbG9jYXRpb24ub3JpZ2luKXx8JycpKWA7XG4gICAgICAgICAgICBodG1sQ29udGVudCA9IGh0bWxDb250ZW50LnJlcGxhY2UocWlhbmt1bkluZGV4SW1wb3J0SW5IdG1sUmVnZXgsIChfbSwgX3EsIGFic1BhdGgpID0+IHtcbiAgICAgICAgICAgICAgaHRtbE1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmV0dXJuIGBpbXBvcnQoLyogQHZpdGUtaWdub3JlICovICgke29yaWdpbkV4cHJ9ICsgJyR7YWJzUGF0aH0nICsgJz92PSR7YnVpbGRUaW1lc3RhbXB9JykpYDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTRGRUVcdTU5MEQgaW5kZXguaHRtbCBcdTUxODVcdTgwNTQgaW1wb3J0KC9hc3NldHMvaW5kZXgtKi5qcykgXHU1RTc2XHU4RkZEXHU1MkEwIHY9JHtidWlsZFRpbWVzdGFtcH1gKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTUxRkFcdTczQjBcdTY4MzlcdTc2RUVcdTVGNTVcdTc2ODRcdThENDRcdTZFOTBcdThERUZcdTVGODRcdUZGMDhcdTU5ODIgL2luZGV4LmpzXHVGRjA5XHVGRjBDXHU4QkY0XHU2NjBFXHU5MTREXHU3RjZFXHU2NzA5XHU5NUVFXHU5ODk4XHVGRjBDXHU4QkIwXHU1RjU1XHU4QjY2XHU1NDRBXG4gICAgICAgICAgLy8gXHU2QjYzXHU1RTM4XHU2MEM1XHU1MUI1XHU0RTBCXHVGRjBDVml0ZSBcdTVFOTRcdThCRTVcdTc1MUZcdTYyMTAgL2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzIFx1OEZEOVx1NjgzN1x1NzY4NFx1OERFRlx1NUY4NFxuICAgICAgICAgIGNvbnN0IHJvb3RKc1JlZ2V4ID0gLyhocmVmfHNyYyk9W1wiJ10oXFwvKFteL10rXFwuKGpzfG1qcykpKShcXD9bXlwiJ10qKT9bXCInXS9nO1xuICAgICAgICAgIGlmIChyb290SnNSZWdleC50ZXN0KGh0bWxDb250ZW50KSkge1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGh0bWxDb250ZW50Lm1hdGNoKHJvb3RKc1JlZ2V4KTtcbiAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW2Vuc3VyZS1iYXNlLXVybF0gXHUyNkEwXHVGRTBGICBcdTY4QzBcdTZENEJcdTUyMzBcdTY4MzlcdTc2RUVcdTVGNTVcdThENDRcdTZFOTBcdThERUZcdTVGODRcdUZGMENcdThGRDlcdTkwMUFcdTVFMzhcdTRFMERcdTVFOTRcdThCRTVcdTUxRkFcdTczQjBcdTMwMDJcdThCRjdcdTY4QzBcdTY3RTUgVml0ZSBcdTkxNERcdTdGNkVcdUZGMDhiYXNlLCBhc3NldHNEaXIsIHJvbGx1cE9wdGlvbnMub3V0cHV0LmNodW5rRmlsZU5hbWVzXHVGRjA5OmAsIG1hdGNoZXMpO1xuICAgICAgICAgICAgICAvLyBcdTRGRUVcdTU5MERcdThGRDlcdTRFOUJcdThERUZcdTVGODRcdUZGMDhcdTRGNUNcdTRFM0FcdTUxNUNcdTVFOTVcdTY1QjlcdTY4NDhcdUZGMDlcbiAgICAgICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKHJvb3RKc1JlZ2V4LCAoX21hdGNoLCBhdHRyLCBwYXRoLCBmaWxlTmFtZSwgX2V4dCwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGF0aC5zdGFydHNXaXRoKCcvYXNzZXRzLycpICYmICFwYXRoLnN0YXJ0c1dpdGgoJy9mYXZpY29uJykgJiYgIXBhdGguc3RhcnRzV2l0aCgnL2xvZ28nKSAmJiAhcGF0aC5tYXRjaCgvXFwuKHBuZ3xqcGd8anBlZ3xnaWZ8c3ZnfGljb3xqc29uKSQvKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGAvYXNzZXRzLyR7ZmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgIGh0bWxNb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtYmFzZS11cmxdIFx1NEZFRVx1NTkwRFx1NjgzOVx1NzZFRVx1NUY1NVx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1RkYwOFx1NTE1Q1x1NUU5NVx1RkYwOTogJHtwYXRofSAtPiAke25ld1BhdGh9YCk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYCR7YXR0cn09XCIke25ld1BhdGh9JHtxdWVyeX1cImA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBfbWF0Y2g7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHJvb3RDc3NSZWdleCA9IC8oaHJlZnxzcmMpPVtcIiddKFxcLyhbXi9dK1xcLmNzcykpKFxcP1teXCInXSopP1tcIiddL2c7XG4gICAgICAgICAgaWYgKHJvb3RDc3NSZWdleC50ZXN0KGh0bWxDb250ZW50KSkge1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGh0bWxDb250ZW50Lm1hdGNoKHJvb3RDc3NSZWdleCk7XG4gICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtlbnN1cmUtYmFzZS11cmxdIFx1MjZBMFx1RkUwRiAgXHU2OEMwXHU2RDRCXHU1MjMwXHU2ODM5XHU3NkVFXHU1RjU1IENTUyBcdThERUZcdTVGODRcdUZGMENcdThGRDlcdTkwMUFcdTVFMzhcdTRFMERcdTVFOTRcdThCRTVcdTUxRkFcdTczQjBcdTMwMDJcdThCRjdcdTY4QzBcdTY3RTUgVml0ZSBcdTkxNERcdTdGNkU6YCwgbWF0Y2hlcyk7XG4gICAgICAgICAgICAgIC8vIFx1NEZFRVx1NTkwRFx1OEZEOVx1NEU5Qlx1OERFRlx1NUY4NFx1RkYwOFx1NEY1Q1x1NEUzQVx1NTE1Q1x1NUU5NVx1NjVCOVx1Njg0OFx1RkYwOVxuICAgICAgICAgICAgICBodG1sQ29udGVudCA9IGh0bWxDb250ZW50LnJlcGxhY2Uocm9vdENzc1JlZ2V4LCAoX21hdGNoLCBhdHRyLCBwYXRoLCBmaWxlTmFtZSwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGF0aC5zdGFydHNXaXRoKCcvYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBuZXdQYXRoID0gYC9hc3NldHMvJHtmaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgaHRtbE1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEXHU2ODM5XHU3NkVFXHU1RjU1IENTUyBcdThERUZcdTVGODRcdUZGMDhcdTUxNUNcdTVFOTVcdUZGMDk6ICR7cGF0aH0gLT4gJHtuZXdQYXRofWApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJ9PVwiJHtuZXdQYXRofSR7cXVlcnl9XCJgO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gX21hdGNoO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaHRtbE1vZGlmaWVkKSB7XG4gICAgICAgICAgICAoY2h1bmsgYXMgYW55KS5zb3VyY2UgPSBodG1sQ29udGVudDtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEXHU0RTg2IGluZGV4Lmh0bWwgXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxjb3JzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2NvcnMudHNcIjsvKipcbiAqIENPUlMgXHU2M0QyXHU0RUY2XG4gKiBcdTY1MkZcdTYzMDEgY3JlZGVudGlhbHMgXHU3Njg0IENPUlMgXHU0RTJEXHU5NUY0XHU0RUY2XG4gKi9cblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFZpdGVEZXZTZXJ2ZXIgfSBmcm9tICd2aXRlJztcblxuLyoqXG4gKiBDT1JTIFx1NjNEMlx1NEVGNlx1RkYwOFx1NjUyRlx1NjMwMSBjcmVkZW50aWFsc1x1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29yc1BsdWdpbigpOiBQbHVnaW4ge1xuICBjb25zdCBjb3JzRGV2TWlkZGxld2FyZSA9IChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xuICAgIGNvbnN0IG9yaWdpbiA9IHJlcS5oZWFkZXJzLm9yaWdpbjtcblxuICAgIGlmIChvcmlnaW4pIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1Qcml2YXRlLU5ldHdvcmsnLCAndHJ1ZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctUHJpdmF0ZS1OZXR3b3JrJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLU1heC1BZ2UnLCAnODY0MDAnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtTGVuZ3RoJywgJzAnKTtcbiAgICAgIHJlcy5lbmQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBuZXh0KCk7XG4gIH07XG5cbiAgY29uc3QgY29yc1ByZXZpZXdNaWRkbGV3YXJlID0gKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSA9PiB7XG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgICAgY29uc3Qgb3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luO1xuXG4gICAgICBpZiAob3JpZ2luKSB7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICAgIH1cblxuICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1NYXgtQWdlJywgJzg2NDAwJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcsICcwJyk7XG4gICAgICByZXMuZW5kKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgb3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luO1xuICAgIGlmIChvcmlnaW4pIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgfVxuXG4gICAgbmV4dCgpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2NvcnMtd2l0aC1jcmVkZW50aWFscycsXG4gICAgZW5mb3JjZTogJ3ByZScsXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcjogVml0ZURldlNlcnZlcikge1xuICAgICAgY29uc3Qgc3RhY2sgPSAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2s7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShzdGFjaykpIHtcbiAgICAgICAgY29uc3QgZmlsdGVyZWRTdGFjayA9IHN0YWNrLmZpbHRlcigoaXRlbTogYW55KSA9PlxuICAgICAgICAgIGl0ZW0uaGFuZGxlICE9PSBjb3JzRGV2TWlkZGxld2FyZSAmJiBpdGVtLmhhbmRsZSAhPT0gY29yc1ByZXZpZXdNaWRkbGV3YXJlXG4gICAgICAgICk7XG4gICAgICAgIChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjayA9IFtcbiAgICAgICAgICB7IHJvdXRlOiAnJywgaGFuZGxlOiBjb3JzRGV2TWlkZGxld2FyZSB9LFxuICAgICAgICAgIC4uLmZpbHRlcmVkU3RhY2ssXG4gICAgICAgIF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGNvcnNEZXZNaWRkbGV3YXJlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbmZpZ3VyZVByZXZpZXdTZXJ2ZXIoc2VydmVyOiBWaXRlRGV2U2VydmVyKSB7XG4gICAgICBjb25zdCBzdGFjayA9IChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjaztcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHN0YWNrKSkge1xuICAgICAgICBjb25zdCBmaWx0ZXJlZFN0YWNrID0gc3RhY2suZmlsdGVyKChpdGVtOiBhbnkpID0+XG4gICAgICAgICAgaXRlbS5oYW5kbGUgIT09IGNvcnNEZXZNaWRkbGV3YXJlICYmIGl0ZW0uaGFuZGxlICE9PSBjb3JzUHJldmlld01pZGRsZXdhcmVcbiAgICAgICAgKTtcbiAgICAgICAgKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrID0gW1xuICAgICAgICAgIHsgcm91dGU6ICcnLCBoYW5kbGU6IGNvcnNQcmV2aWV3TWlkZGxld2FyZSB9LFxuICAgICAgICAgIC4uLmZpbHRlcmVkU3RhY2ssXG4gICAgICAgIF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGNvcnNQcmV2aWV3TWlkZGxld2FyZSk7XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxjc3MudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvY3NzLnRzXCI7LyoqXG4gKiBDU1MgXHU3NkY4XHU1MTczXHU2M0QyXHU0RUY2XG4gKiBcdTc4NkVcdTRGREQgQ1NTIFx1NjU4N1x1NEVGNlx1ODhBQlx1NkI2M1x1Nzg2RVx1NjI1M1x1NTMwNVxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbZW5zdXJlLWNzc10nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW2Vuc3VyZS1jc3NdJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbZW5zdXJlLWNzc10nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW2Vuc3VyZS1jc3NdJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHR5cGUgeyBPdXRwdXRPcHRpb25zLCBPdXRwdXRCdW5kbGUgfSBmcm9tICdyb2xsdXAnO1xuXG4vKipcbiAqIFx1Nzg2RVx1NEZERCBDU1MgXHU2NTg3XHU0RUY2XHU4OEFCXHU2QjYzXHU3ODZFXHU2MjUzXHU1MzA1XHU3Njg0XHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVDc3NQbHVnaW4oKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnZW5zdXJlLWNzcy1wbHVnaW4nLFxuICAgIGdlbmVyYXRlQnVuZGxlKF9vcHRpb25zOiBPdXRwdXRPcHRpb25zLCBidW5kbGU6IE91dHB1dEJ1bmRsZSkge1xuICAgICAgY29uc3QganNGaWxlcyA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuZmlsdGVyKGZpbGUgPT4gZmlsZS5lbmRzV2l0aCgnLmpzJykpO1xuICAgICAgbGV0IGhhc0lubGluZUNzcyA9IGZhbHNlO1xuICAgICAgY29uc3Qgc3VzcGljaW91c0ZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICBqc0ZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgIGNvbnN0IGNodW5rID0gYnVuZGxlW2ZpbGVdIGFzIGFueTtcbiAgICAgICAgaWYgKGNodW5rICYmIGNodW5rLmNvZGUgJiYgdHlwZW9mIGNodW5rLmNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgY29uc3QgY29kZSA9IGNodW5rLmNvZGU7XG5cbiAgICAgICAgICBjb25zdCBpc01vZHVsZVByZWxvYWQgPSBjb2RlLmluY2x1ZGVzKCdtb2R1bGVwcmVsb2FkJykgfHwgY29kZS5pbmNsdWRlcygncmVsTGlzdCcpO1xuICAgICAgICAgIGlmIChpc01vZHVsZVByZWxvYWQpIHJldHVybjtcblxuICAgICAgICAgIGNvbnN0IGlzS25vd25MaWJyYXJ5ID0gZmlsZS5pbmNsdWRlcygndnVlLWNvcmUnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygnZWxlbWVudC1wbHVzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ3ZlbmRvcicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCd2dWUtaTE4bicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCd2dWUtcm91dGVyJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ2xpYi1lY2hhcnRzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ21vZHVsZS0nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygnYXBwLWNvbXBvc2FibGVzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ2FwcC1wYWdlcycpO1xuICAgICAgICAgIGlmIChpc0tub3duTGlicmFyeSkgcmV0dXJuO1xuXG4gICAgICAgICAgY29uc3QgaGFzU3R5bGVFbGVtZW50Q3JlYXRpb24gPSAvZG9jdW1lbnRcXC5jcmVhdGVFbGVtZW50XFwoWydcIl1zdHlsZVsnXCJdXFwpLy50ZXN0KGNvZGUpICYmXG4gICAgICAgICAgICAvXFwuKHRleHRDb250ZW50fGlubmVySFRNTClcXHMqPS8udGVzdChjb2RlKSAmJlxuICAgICAgICAgICAgL1xce1tefV17MTAsfVxcfS8udGVzdChjb2RlKTtcblxuICAgICAgICAgIGNvbnN0IGhhc0luc2VydFN0eWxlV2l0aENzcyA9IC9pbnNlcnRTdHlsZVxccypcXCgvLnRlc3QoY29kZSkgJiZcbiAgICAgICAgICAgIC90ZXh0XFwvY3NzLy50ZXN0KGNvZGUpICYmXG4gICAgICAgICAgICAvXFx7W159XXsyMCx9XFx9Ly50ZXN0KGNvZGUpO1xuXG4gICAgICAgICAgY29uc3Qgc3R5bGVUYWdNYXRjaCA9IGNvZGUubWF0Y2goLzxzdHlsZVtePl0qPi8pO1xuICAgICAgICAgIGNvbnN0IGhhc1N0eWxlVGFnV2l0aENvbnRlbnQgPSBzdHlsZVRhZ01hdGNoICYmXG4gICAgICAgICAgICAhc3R5bGVUYWdNYXRjaFswXS5pbmNsdWRlcyhcIidcIikgJiZcbiAgICAgICAgICAgICFzdHlsZVRhZ01hdGNoWzBdLmluY2x1ZGVzKCdcIicpICYmXG4gICAgICAgICAgICAvXFx7W159XXsyMCx9XFx9Ly50ZXN0KGNvZGUpO1xuXG4gICAgICAgICAgY29uc3QgaGFzSW5saW5lQ3NzU3RyaW5nID0gL1snXCJgXVteJ1wiYF17NTAsfTpcXHMqW14nXCJgXXsxMCx9O1xccypbXidcImBdezEwLH1bJ1wiYF0vLnRlc3QoY29kZSkgJiZcbiAgICAgICAgICAgIC8oY29sb3J8YmFja2dyb3VuZHx3aWR0aHxoZWlnaHR8bWFyZ2lufHBhZGRpbmd8Ym9yZGVyfGRpc3BsYXl8cG9zaXRpb258ZmxleHxncmlkKS8udGVzdChjb2RlKTtcblxuICAgICAgICAgIGlmIChoYXNTdHlsZUVsZW1lbnRDcmVhdGlvbiB8fCBoYXNJbnNlcnRTdHlsZVdpdGhDc3MgfHwgaGFzU3R5bGVUYWdXaXRoQ29udGVudCB8fCBoYXNJbmxpbmVDc3NTdHJpbmcpIHtcbiAgICAgICAgICAgIGhhc0lubGluZUNzcyA9IHRydWU7XG4gICAgICAgICAgICBzdXNwaWNpb3VzRmlsZXMucHVzaChmaWxlKTtcbiAgICAgICAgICAgIGNvbnN0IHBhdHRlcm5zOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgaWYgKGhhc1N0eWxlRWxlbWVudENyZWF0aW9uKSBwYXR0ZXJucy5wdXNoKCdcdTUyQThcdTYwMDFcdTUyMUJcdTVFRkEgc3R5bGUgXHU1MTQzXHU3RDIwJyk7XG4gICAgICAgICAgICBpZiAoaGFzSW5zZXJ0U3R5bGVXaXRoQ3NzKSBwYXR0ZXJucy5wdXNoKCdpbnNlcnRTdHlsZSBcdTUxRkRcdTY1NzAnKTtcbiAgICAgICAgICAgIGlmIChoYXNTdHlsZVRhZ1dpdGhDb250ZW50KSBwYXR0ZXJucy5wdXNoKCc8c3R5bGU+IFx1NjgwN1x1N0I3RScpO1xuICAgICAgICAgICAgaWYgKGhhc0lubGluZUNzc1N0cmluZykgcGF0dGVybnMucHVzaCgnXHU1MTg1XHU4MDU0IENTUyBcdTVCNTdcdTdCMjZcdTRFMzInKTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdTI2QTBcdUZFMEYgXHU4QjY2XHU1NDRBXHVGRjFBXHU1NzI4ICR7ZmlsZX0gXHU0RTJEXHU2OEMwXHU2RDRCXHU1MjMwXHU1M0VGXHU4MEZEXHU3Njg0XHU1MTg1XHU4MDU0IENTU1x1RkYwOFx1NkEyMVx1NUYwRlx1RkYxQSR7cGF0dGVybnMuam9pbignLCAnKX1cdUZGMDlgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAoaGFzSW5saW5lQ3NzKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdTI2QTBcdUZFMEYgXHU4QjY2XHU1NDRBXHVGRjFBXHU2OEMwXHU2RDRCXHU1MjMwIENTUyBcdTUzRUZcdTgwRkRcdTg4QUJcdTUxODVcdTgwNTRcdTUyMzAgSlMgXHU0RTJEXHVGRjBDXHU4RkQ5XHU0RjFBXHU1QkZDXHU4MUY0IHFpYW5rdW4gXHU2NUUwXHU2Q0Q1XHU2QjYzXHU3ODZFXHU1MkEwXHU4RjdEXHU2ODM3XHU1RjBGJyk7XG4gICAgICAgIGNvbnNvbGUud2FybihgW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdTUzRUZcdTc1OTFcdTY1ODdcdTRFRjZcdUZGMUEke3N1c3BpY2lvdXNGaWxlcy5qb2luKCcsICcpfWApO1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tlbnN1cmUtY3NzLXBsdWdpbl0gXHU4QkY3XHU2OEMwXHU2N0U1IHZpdGUtcGx1Z2luLXFpYW5rdW4gXHU5MTREXHU3RjZFXHU1NDhDIGJ1aWxkLmFzc2V0c0lubGluZUxpbWl0IFx1OEJCRVx1N0Y2RScpO1xuICAgICAgfVxuICAgIH0sXG4gICAgd3JpdGVCdW5kbGUoX29wdGlvbnM6IE91dHB1dE9wdGlvbnMsIGJ1bmRsZTogT3V0cHV0QnVuZGxlKSB7XG4gICAgICBjb25zdCBjc3NGaWxlcyA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuZmlsdGVyKGZpbGUgPT4gZmlsZS5lbmRzV2l0aCgnLmNzcycpKTtcbiAgICAgIGlmIChjc3NGaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdTI3NEMgXHU5NTE5XHU4QkVGXHVGRjFBXHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU0RTJEXHU2NUUwIENTUyBcdTY1ODdcdTRFRjZcdUZGMDEnKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdThCRjdcdTY4QzBcdTY3RTVcdUZGMUEnKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignMS4gXHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XHU2NjJGXHU1NDI2XHU5NzU5XHU2MDAxXHU1QkZDXHU1MTY1XHU1MTY4XHU1QzQwXHU2ODM3XHU1RjBGXHVGRjA4aW5kZXguY3NzL3Vuby5jc3MvZWxlbWVudC1wbHVzLmNzc1x1RkYwOScpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCcyLiBcdTY2MkZcdTU0MjZcdTY3MDkgVnVlIFx1N0VDNFx1NEVGNlx1NEUyRFx1NEY3Rlx1NzUyOCA8c3R5bGU+IFx1NjgwN1x1N0I3RScpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCczLiBVbm9DU1MgXHU5MTREXHU3RjZFXHU2NjJGXHU1NDI2XHU2QjYzXHU3ODZFXHVGRjBDXHU2NjJGXHU1NDI2XHU1QkZDXHU1MTY1IEB1bm9jc3MgYWxsJyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJzQuIHZpdGUtcGx1Z2luLXFpYW5rdW4gXHU3Njg0IHVzZURldk1vZGUgXHU2NjJGXHU1NDI2XHU1NzI4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU2QjYzXHU3ODZFXHU1MTczXHU5NUVEJyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJzUuIGJ1aWxkLmFzc2V0c0lubGluZUxpbWl0IFx1NjYyRlx1NTQyNlx1OEJCRVx1N0Y2RVx1NEUzQSAwXHVGRjA4XHU3OTgxXHU2QjYyXHU1MTg1XHU4MDU0XHVGRjA5Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtY3NzLXBsdWdpbl0gXHUyNzA1IFx1NjIxMFx1NTI5Rlx1NjI1M1x1NTMwNSAke2Nzc0ZpbGVzLmxlbmd0aH0gXHU0RTJBIENTUyBcdTY1ODdcdTRFRjZcdUZGMUFgLCBjc3NGaWxlcyk7XG4gICAgICAgIGNzc0ZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgICAgY29uc3QgYXNzZXQgPSBidW5kbGVbZmlsZV0gYXMgYW55O1xuICAgICAgICAgIGlmIChhc3NldCAmJiBhc3NldC5zb3VyY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNpemVLQiA9IChhc3NldC5zb3VyY2UubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgyKTtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgICAtICR7ZmlsZX06ICR7c2l6ZUtCfUtCYCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChhc3NldCAmJiBhc3NldC5maWxlTmFtZSkge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGAgIC0gJHthc3NldC5maWxlTmFtZSB8fCBmaWxlfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFx2ZXJzaW9uLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3ZlcnNpb24udHNcIjsvKipcbiAqIFx1NzI0OFx1NjcyQ1x1NTNGN1x1NjNEMlx1NEVGNlxuICogXHU0RTNBIEhUTUwgXHU2NTg3XHU0RUY2XHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU2REZCXHU1MkEwXHU1MTY4XHU1QzQwXHU3RURGXHU0RTAwXHU3Njg0XHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHU3MjQ4XHU2NzJDXHU1M0Y3XG4gKiBcdTc1MjhcdTRFOEVcdTZENEZcdTg5QzhcdTU2NjhcdTdGMTNcdTVCNThcdTYzQTdcdTUyMzZcdUZGMENcdTZCQ0ZcdTZCMjFcdTY3ODRcdTVFRkFcdTkwRkRcdTRGMUFcdTc1MUZcdTYyMTBcdTY1QjBcdTc2ODRcdTY1RjZcdTk1RjRcdTYyMzNcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW3ZlcnNpb25dJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1t2ZXJzaW9uXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW3ZlcnNpb25dJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1t2ZXJzaW9uXScsIC4uLmFyZ3MpLFxufTtcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHsgcmVzb2x2ZSwgZGlybmFtZSB9IGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xuY29uc3QgX19kaXJuYW1lID0gZGlybmFtZShfX2ZpbGVuYW1lKTtcblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTYyMTZcdTc1MUZcdTYyMTBcdTUxNjhcdTVDNDBcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdTcyNDhcdTY3MkNcdTUzRjdcbiAqIFx1NEYxOFx1NTE0OFx1NEVDRVx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1OEJGQlx1NTNENlx1RkYwQ1x1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOVx1NTIxOVx1NEVDRVx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1NjU4N1x1NEVGNlx1OEJGQlx1NTNENlx1RkYwQ1x1OTBGRFx1NkNBMVx1NjcwOVx1NTIxOVx1NzUxRlx1NjIxMFx1NjVCMFx1NzY4NFxuICovXG5mdW5jdGlvbiBnZXRCdWlsZFRpbWVzdGFtcCgpOiBzdHJpbmcge1xuICAvLyAxLiBcdTRGMThcdTUxNDhcdTRFQ0VcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdThCRkJcdTUzRDZcdUZGMDhcdTc1MzFcdTY3ODRcdTVFRkFcdTgxMUFcdTY3MkNcdThCQkVcdTdGNkVcdUZGMDlcbiAgaWYgKHByb2Nlc3MuZW52LkJUQ19CVUlMRF9USU1FU1RBTVApIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnYuQlRDX0JVSUxEX1RJTUVTVEFNUDtcbiAgfVxuXG4gIC8vIDIuIFx1NEVDRVx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1NjU4N1x1NEVGNlx1OEJGQlx1NTNENlx1RkYwOFx1NTk4Mlx1Njc5Q1x1NUI1OFx1NTcyOFx1RkYwOVxuICBjb25zdCB0aW1lc3RhbXBGaWxlID0gcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi8uLi8uYnVpbGQtdGltZXN0YW1wJyk7XG4gIGlmIChleGlzdHNTeW5jKHRpbWVzdGFtcEZpbGUpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IHJlYWRGaWxlU3luYyh0aW1lc3RhbXBGaWxlLCAndXRmLTgnKS50cmltKCk7XG4gICAgICBpZiAodGltZXN0YW1wKSB7XG4gICAgICAgIHJldHVybiB0aW1lc3RhbXA7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIFx1NUZGRFx1NzU2NVx1OEJGQlx1NTNENlx1OTUxOVx1OEJFRlxuICAgIH1cbiAgfVxuXG4gIC8vIDMuIFx1NzUxRlx1NjIxMFx1NjVCMFx1NzY4NFx1NjVGNlx1OTVGNFx1NjIzM1x1NUU3Nlx1NEZERFx1NUI1OFx1NTIzMFx1NjU4N1x1NEVGNlx1RkYwOFx1Nzg2RVx1NEZERFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NEY3Rlx1NzUyOFx1NTQwQ1x1NEUwMFx1NEUyQVx1RkYwOVxuICAvLyBcdTRGN0ZcdTc1MjgzNlx1OEZEQlx1NTIzNlx1N0YxNlx1NzgwMVx1RkYwQ1x1NzUxRlx1NjIxMFx1NjZGNFx1NzdFRFx1NzY4NFx1NzI0OFx1NjcyQ1x1NTNGN1x1RkYwOFx1NTMwNVx1NTQyQlx1NUI1N1x1NkJDRFx1NTQ4Q1x1NjU3MFx1NUI1N1x1RkYwQ1x1NTk4MiBsM2syajFoXHVGRjA5XG4gIGNvbnN0IHRpbWVzdGFtcCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpO1xuICB0cnkge1xuICAgIHdyaXRlRmlsZVN5bmModGltZXN0YW1wRmlsZSwgdGltZXN0YW1wLCAndXRmLTgnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBcdTVGRkRcdTc1NjVcdTUxOTlcdTUxNjVcdTk1MTlcdThCRUZcbiAgfVxuICByZXR1cm4gdGltZXN0YW1wO1xufVxuXG4vKipcbiAqIFx1NEUzQSBIVE1MIFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1NkRGQlx1NTJBMFx1NzI0OFx1NjcyQ1x1NTNGN1x1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkVmVyc2lvblBsdWdpbigpOiBQbHVnaW4ge1xuICBjb25zdCBidWlsZFRpbWVzdGFtcCA9IGdldEJ1aWxkVGltZXN0YW1wKCk7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnYWRkLXZlcnNpb24nLFxuICAgIGFwcGx5OiAnYnVpbGQnLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBjb25zb2xlLmluZm8oYFthZGQtdmVyc2lvbl0gXHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHU3MjQ4XHU2NzJDXHU1M0Y3OiAke2J1aWxkVGltZXN0YW1wfWApO1xuICAgIH0sXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RjdGXHU3NTI4IHRyYW5zZm9ybUluZGV4SHRtbFx1RkYwOFZpdGUgXHU1MTg1XHU5MEU4XHU2NjJGXHU1NzI4XHU1NDBFXHU3RjZFXHU5NjM2XHU2QkI1XHU3NTFGXHU2MjEwL1x1NTE5OVx1NTE2NSBpbmRleC5odG1sXHVGRjBDZ2VuZXJhdGVCdW5kbGUgXHU1Rjg4XHU1QkI5XHU2NjEzXHU2MkZGXHU0RTBEXHU1MjMwXHU2NzAwXHU3RUM4IEhUTUxcdUZGMDlcbiAgICB0cmFuc2Zvcm1JbmRleEh0bWw6IHtcbiAgICAgIG9yZGVyOiAncG9zdCcsXG4gICAgICBoYW5kbGVyKGh0bWwpIHtcbiAgICAgICAgbGV0IG5ld0h0bWwgPSBodG1sO1xuICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAvLyAwKSBcdTc5RkJcdTk2NjRcdTdBN0FcdTc2ODQgPHN0eWxlPjwvc3R5bGU+IFx1NjgwN1x1N0I3RVxuICAgICAgICAvLyBcdThCRjRcdTY2MEVcdUZGMUFcdTU3MjhcdTVGQUVcdTUyNERcdTdBRUZcdTY3QjZcdTY3ODRcdTRFMEJcdUZGMENcdTVCNTBcdTVFOTRcdTc1MjhcdTU3MjhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTg4QUIgcWlhbmt1biBcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFM0JcdTVFOTRcdTc1MjhcdTVERjJcdTdFQ0ZcdTYzRDBcdTRGOUJcdTRFODYgbG9hZGluZ1x1RkYwQ1xuICAgICAgICAvLyBcdTVCNTBcdTVFOTRcdTc1MjhcdTc2ODQgc3R5bGUgXHU2ODA3XHU3QjdFXHU1M0VGXHU4MEZEXHU4OEFCXHU1OTA0XHU3NDA2XHU2MjEwXHU3QTdBXHU3Njg0XHUzMDAyXHU3OUZCXHU5NjY0XHU3QTdBXHU2ODA3XHU3QjdFXHU1M0VGXHU0RUU1XHU3QjgwXHU1MzE2IEhUTUwgXHU3RUQzXHU2Nzg0XHUzMDAyXG4gICAgICAgIC8vIFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NEUwQlx1RkYwQ1x1NUI1MFx1NUU5NFx1NzUyOFx1NzJFQ1x1N0FDQlx1OEZEMFx1ODg0Q1x1RkYwQ3N0eWxlIFx1NjgwN1x1N0I3RVx1NjcwOVx1NTE4NVx1NUJCOVx1RkYwOGxvYWRpbmcgXHU2ODM3XHU1RjBGXHVGRjA5XHVGRjBDXHU0RTBEXHU0RjFBXHU4OEFCXHU3OUZCXHU5NjY0XHUzMDAyXG4gICAgICAgIGNvbnN0IGVtcHR5U3R5bGVSZWdleCA9IC88c3R5bGU+XFxzKjxcXC9zdHlsZT4vZ2k7XG4gICAgICAgIGlmIChlbXB0eVN0eWxlUmVnZXgudGVzdChuZXdIdG1sKSkge1xuICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoZW1wdHlTdHlsZVJlZ2V4LCAnJyk7XG4gICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gMSkgXHU0RTNBIDxzY3JpcHQgc3JjPiBcdTZERkJcdTUyQTAvXHU2NkY0XHU2NUIwIHZcbiAgICAgICAgLy9cbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RTBEXHU4OTgxXHU3RUQ5IEVTTSBtb2R1bGUgc2NyaXB0XHVGRjA4dHlwZT1cIm1vZHVsZVwiXHVGRjA5XHU4RkZEXHU1MkEwID92XG4gICAgICAgIC8vIFx1NTQyNlx1NTIxOVx1NTQwQ1x1NEUwMFx1NEUyQVx1NkEyMVx1NTc1N1x1NEYxQVx1NTQwQ1x1NjVGNlx1NEVFNVx1MzAwQ1x1NUUyNiB2XHUzMDBEXHU1NDhDXHUzMDBDXHU0RTBEXHU1RTI2IHZcdTMwMERcdUZGMDhcdTk3NTlcdTYwMDEgaW1wb3J0IFx1NzUxRlx1NjIxMFx1NzY4NCBVUkxcdUZGMDlcdTRFMjRcdTU5NTcgVVJMIFx1ODhBQlx1NTJBMFx1OEY3RFx1RkYwQ1xuICAgICAgICAvLyBcdTU3MjhcdTVGQUVcdTUyNERcdTdBRUYvXHU5MUNEXHU1OTBEXHU1MkEwXHU4RjdEXHU1MTY1XHU1M0UzXHU4MTFBXHU2NzJDXHU1NzNBXHU2NjZGXHU0RTBCXHU0RjFBXHU1QkZDXHU4MUY0XHU2QTIxXHU1NzU3XHU2MjY3XHU4ODRDXHU0RTI0XHU2QjIxXHVGRjBDXHU0RUNFXHU4MDBDXHU4OUU2XHU1M0QxXHU3QzdCXHU0RjNDIEVDaGFydHMgXHU3Njg0XHU5MUNEXHU1OTBEXHU2Q0U4XHU1MThDXHU2NUFEXHU4QTAwXHUzMDAyXG4gICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgLyg8c2NyaXB0W14+XSpcXHMrc3JjPVtcIiddKShbXlwiJ10rKShbXCInXVtePl0qPikvZyxcbiAgICAgICAgICAobWF0Y2g6IHN0cmluZywgcHJlZml4OiBzdHJpbmcsIHNyYzogc3RyaW5nLCBzdWZmaXg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaXNNb2R1bGVTY3JpcHQgPSAvdHlwZVxccyo9XFxzKltcIiddbW9kdWxlW1wiJ10vaS50ZXN0KG1hdGNoKTtcbiAgICAgICAgICAgIGNvbnN0IGlzQXNzZXRzID0gc3JjLnN0YXJ0c1dpdGgoJy9hc3NldHMvJykgfHwgc3JjLnN0YXJ0c1dpdGgoJy4vYXNzZXRzLycpO1xuXG4gICAgICAgICAgICAvLyBcdTVCRjkgbW9kdWxlIHNjcmlwdFx1RkYxQVx1NUYzQVx1NTIzNlx1NzlGQlx1OTY2NCB2XHVGRjBDXHU0RkREXHU4QkMxIFVSTCBcdTRFMEVcdTYyNTNcdTUzMDVcdTRFQTdcdTcyNjlcdTUxODVcdTkwRTggaW1wb3J0IFx1NEZERFx1NjMwMVx1NEUwMFx1ODFGNFxuICAgICAgICAgICAgaWYgKGlzTW9kdWxlU2NyaXB0ICYmIGlzQXNzZXRzKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNsZWFuZWQgPSBzcmMucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovZywgJycpLnJlcGxhY2UoL1xcPyYvLCAnPycpLnJlcGxhY2UoL1s/Jl0kLywgJycpO1xuICAgICAgICAgICAgICBpZiAoY2xlYW5lZCAhPT0gc3JjKSB7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjbGVhbmVkfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc3JjLmluY2x1ZGVzKCc/dj0nKSB8fCBzcmMuaW5jbHVkZXMoJyZ2PScpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWQgPSBzcmMucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovZywgYD92PSR7YnVpbGRUaW1lc3RhbXB9YCk7XG4gICAgICAgICAgICAgIGlmICh1cGRhdGVkICE9PSBzcmMpIHtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke3VwZGF0ZWR9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNBc3NldHMpIHtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBjb25zdCBzZXAgPSBzcmMuaW5jbHVkZXMoJz8nKSA/ICcmJyA6ICc/JztcbiAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke3NyY30ke3NlcH12PSR7YnVpbGRUaW1lc3RhbXB9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIDIpIFx1NEUzQSA8bGluayBocmVmPiBcdTZERkJcdTUyQTAvXHU2NkY0XHU2NUIwIHZcbiAgICAgICAgLy9cbiAgICAgICAgLy8gXHU1NDBDXHU0RTBBXHVGRjFBbW9kdWxlcHJlbG9hZCBcdTVDNUVcdTRFOEUgRVNNIFx1NEY5RFx1OEQ1Nlx1NTZGRVx1NzY4NFx1NEUwMFx1OTBFOFx1NTIwNlx1RkYwQ1x1OEZGRFx1NTJBMCA/diBcdTRGMUFcdThCQTlcdTk4ODRcdTUyQTBcdThGN0QgVVJMIFx1NEUwRSBpbXBvcnQgVVJMIFx1NEUwRFx1NEUwMFx1ODFGNFx1RkYwQ1xuICAgICAgICAvLyBcdTkwMjBcdTYyMTBcdTkxQ0RcdTU5MERcdThCRjdcdTZDNDJcdTc1MUFcdTgxRjNcdTkxQ0RcdTU5MERcdTYyNjdcdTg4NENcdUZGMDhcdTU3MjhcdTY3RDBcdTRFOUIgbG9hZGVyIFx1NTczQVx1NjY2Rlx1NEUwQlx1RkYwOVx1MzAwMlxuICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgIC8oPGxpbmtbXj5dKlxccytocmVmPVtcIiddKShbXlwiJ10rKShbXCInXVtePl0qPikvZyxcbiAgICAgICAgICAobWF0Y2g6IHN0cmluZywgcHJlZml4OiBzdHJpbmcsIGhyZWY6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlzTW9kdWxlUHJlbG9hZCA9IC9cXHNyZWxcXHMqPVxccypbXCInXW1vZHVsZXByZWxvYWRbXCInXS9pLnRlc3QobWF0Y2gpO1xuICAgICAgICAgICAgY29uc3QgaXNBc3NldHMgPSBocmVmLnN0YXJ0c1dpdGgoJy9hc3NldHMvJykgfHwgaHJlZi5zdGFydHNXaXRoKCcuL2Fzc2V0cy8nKTtcblxuICAgICAgICAgICAgaWYgKGlzTW9kdWxlUHJlbG9hZCAmJiBpc0Fzc2V0cykge1xuICAgICAgICAgICAgICBjb25zdCBjbGVhbmVkID0gaHJlZi5yZXBsYWNlKC9bPyZddj1bXiYnXCJdKi9nLCAnJykucmVwbGFjZSgvXFw/Ji8sICc/JykucmVwbGFjZSgvWz8mXSQvLCAnJyk7XG4gICAgICAgICAgICAgIGlmIChjbGVhbmVkICE9PSBocmVmKSB7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjbGVhbmVkfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaHJlZi5pbmNsdWRlcygnP3Y9JykgfHwgaHJlZi5pbmNsdWRlcygnJnY9JykpIHtcbiAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZCA9IGhyZWYucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovZywgYD92PSR7YnVpbGRUaW1lc3RhbXB9YCk7XG4gICAgICAgICAgICAgIGlmICh1cGRhdGVkICE9PSBocmVmKSB7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHt1cGRhdGVkfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzQXNzZXRzKSB7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgY29uc3Qgc2VwID0gaHJlZi5pbmNsdWRlcygnPycpID8gJyYnIDogJz8nO1xuICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7aHJlZn0ke3NlcH12PSR7YnVpbGRUaW1lc3RhbXB9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIDMpIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRCBxaWFua3VuIFx1NkNFOFx1NTE2NVx1NzY4NFx1NTE4NVx1ODA1NCBpbXBvcnQoJy9hc3NldHMvaW5kZXgteHh4LmpzJylcdUZGMENcdTkwN0ZcdTUxNERcdTg4QUJcdTVCQkZcdTRFM0JcdTU3REZcdTU0MERcdTg5RTNcdTY3OTBcbiAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU4RkQ5XHU5MUNDXHU0RTVGXHU0RTBEXHU4OTgxXHU4RkZEXHU1MkEwID92XHVGRjBDXHU5MDdGXHU1MTREXHU1RjYyXHU2MjEwXHUzMDBDXHU1RTI2IHYgLyBcdTRFMERcdTVFMjYgdlx1MzAwRFx1NEUyNFx1NTk1N1x1NTE2NVx1NTNFMyBVUkxcdUZGMENcdTVCRkNcdTgxRjRcdTUxNjVcdTUzRTNcdTZBMjFcdTU3NTdcdTg4QUJcdTkxQ0RcdTU5MERcdTYyNjdcdTg4NENcdTMwMDJcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1NzI4IHFpYW5rdW4gc2FuZGJveCBcdTRFMkRcdTY2RjRcdTUzRUZcdTk3NjBcdTc2ODRcdTUxOTlcdTZDRDVcdTY2MkZcdTc2RjRcdTYzQTVcdThCRkJcdTUxNjhcdTVDNDBcdTUzRDhcdTkxQ0YgX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX19cbiAgICAgICAgLy8gXHU4MDBDXHU0RTBEXHU2NjJGIHdpbmRvdy5fX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fX1x1RkYwOHdpbmRvdyBcdTUzRUZcdTgwRkRcdTg4QUIgcHJveHkgXHU5MUNEXHU1MTk5L1x1NEUwRFx1NTMwNVx1NTQyQiBsb2NhdGlvblx1RkYwOVx1MzAwMlxuICAgICAgICBjb25zdCBvcmlnaW5FeHByID1cbiAgICAgICAgICBgKCh0eXBlb2YgX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18hPT0ndW5kZWZpbmVkJyYmX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18pYCArXG4gICAgICAgICAgYD9uZXcgVVJMKF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fLCh0eXBlb2YgbG9jYXRpb24hPT0ndW5kZWZpbmVkJyYmbG9jYXRpb24ub3JpZ2luKXx8JycpLm9yaWdpbmAgK1xuICAgICAgICAgIGA6KCh0eXBlb2YgbG9jYXRpb24hPT0ndW5kZWZpbmVkJyYmbG9jYXRpb24ub3JpZ2luKXx8JycpKWA7XG4gICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgL2ltcG9ydFxcKFxccyooWydcIl0pKFxcL2Fzc2V0c1xcLyhpbmRleHxtYWluKS1bXidcIl0rKVxcMVxccypcXCkvZyxcbiAgICAgICAgICAoX206IHN0cmluZywgX3E6IHN0cmluZywgYWJzUGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gYGltcG9ydCgvKiBAdml0ZS1pZ25vcmUgKi8gKCR7b3JpZ2luRXhwcn0gKyAnJHthYnNQYXRofScpKWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgICBjb25zb2xlLmluZm8oYFthZGQtdmVyc2lvbl0gXHU1REYyXHU0RTNBIGluZGV4Lmh0bWwgXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU2REZCXHU1MkEwXHU3MjQ4XHU2NzJDXHU1M0Y3OiB2PSR7YnVpbGRUaW1lc3RhbXB9YCk7XG4gICAgICAgICAgcmV0dXJuIG5ld0h0bWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICB9LFxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxccmVzb2x2ZS1sb2dvLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3Jlc29sdmUtbG9nby50c1wiOy8qKlxuICogTG9nbyBcdThERUZcdTVGODRcdTg5RTNcdTY3OTBcdTYzRDJcdTRFRjZcbiAqIFx1NzUyOFx1NEU4RVx1NTcyOFx1NUI1MFx1NUU5NFx1NzUyOFx1Njc4NFx1NUVGQVx1NjVGNlx1ODlFM1x1Njc5MCAvbG9nby5wbmcgXHU4REVGXHU1Rjg0XG4gKiBcdTVGNTMgcHVibGljRGlyIFx1ODhBQlx1Nzk4MVx1NzUyOFx1NjVGNlx1RkYwQ1x1OTcwMFx1ODk4MVx1NjI0Qlx1NTJBOFx1ODlFM1x1Njc5MCBsb2dvLnBuZyBcdTc2ODRcdThERUZcdTVGODRcdTVFNzZcdTU5MERcdTUyMzZcdTY1ODdcdTRFRjZcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgUmVzb2x2ZWRDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlc29sdmUsIGRpcm5hbWUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIGNvcHlGaWxlU3luYywgbWtkaXJTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlTG9nb1BsdWdpbihhcHBEaXI6IHN0cmluZyk6IFBsdWdpbiB7XG4gIGxldCB2aXRlQ29uZmlnOiBSZXNvbHZlZENvbmZpZyB8IG51bGwgPSBudWxsO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3Jlc29sdmUtbG9nbycsXG4gICAgYXBwbHk6ICdidWlsZCcsIC8vIFx1NTNFQVx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NjI2N1x1ODg0Q1xuXG4gICAgY29uZmlnUmVzb2x2ZWQoY29uZmlnOiBSZXNvbHZlZENvbmZpZykge1xuICAgICAgdml0ZUNvbmZpZyA9IGNvbmZpZztcbiAgICB9LFxuXG4gICAgcmVzb2x2ZUlkKGlkOiBzdHJpbmcpIHtcbiAgICAgIC8vIFx1NTkwNFx1NzQwNiAvbG9nby5wbmcgXHU2MjE2IGxvZ28ucG5nIFx1NzY4NFx1ODlFM1x1Njc5MFxuICAgICAgaWYgKGlkID09PSAnL2xvZ28ucG5nJyB8fCBpZCA9PT0gJ2xvZ28ucG5nJykge1xuICAgICAgICAvLyBcdTVDMURcdThCRDVcdTRFQ0VcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdTVFOTNcdTgzQjdcdTUzRDYgbG9nby5wbmdcbiAgICAgICAgY29uc3Qgc2hhcmVkTG9nb1BhdGggPSByZXNvbHZlKGFwcERpciwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3B1YmxpYy9sb2dvLnBuZycpO1xuICAgICAgICBpZiAoZXhpc3RzU3luYyhzaGFyZWRMb2dvUGF0aCkpIHtcbiAgICAgICAgICByZXR1cm4gc2hhcmVkTG9nb1BhdGg7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTVDMURcdThCRDVcdTRFQ0VcdTVFOTRcdTc1MjhcdTgxRUFcdTVERjFcdTc2ODQgcHVibGljIFx1NzZFRVx1NUY1NVx1ODNCN1x1NTNENlx1RkYwOFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NTNFRlx1ODBGRFx1OEZEOFx1NjcwOVx1RkYwOVxuICAgICAgICBjb25zdCBhcHBMb2dvUGF0aCA9IHJlc29sdmUoYXBwRGlyLCAncHVibGljL2xvZ28ucG5nJyk7XG4gICAgICAgIGlmIChleGlzdHNTeW5jKGFwcExvZ29QYXRoKSkge1xuICAgICAgICAgIHJldHVybiBhcHBMb2dvUGF0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1OTBGRFx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1OEZENFx1NTZERVx1ODY1QVx1NjJERlx1NkEyMVx1NTc1NyBJRFxuICAgICAgICByZXR1cm4gYFxcMGxvZ28ucG5nYDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICBsb2FkKGlkOiBzdHJpbmcpIHtcbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjYyRlx1ODY1QVx1NjJERlx1NkEyMVx1NTc1N1x1RkYwQ1x1OEZENFx1NTZERVx1N0E3QVx1NTE4NVx1NUJCOVx1RkYwOFx1NUI5RVx1OTY0NVx1NjU4N1x1NEVGNlx1NEYxQVx1NTcyOCBjbG9zZUJ1bmRsZSBcdTY1RjZcdTU5MERcdTUyMzZcdUZGMDlcbiAgICAgIGlmIChpZCA9PT0gJ1xcMGxvZ28ucG5nJykge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG4gICAgY2xvc2VCdW5kbGUoKSB7XG4gICAgICAvLyBcdTU3MjhcdTY3ODRcdTVFRkFcdTVCOENcdTYyMTBcdTU0MEVcdTU5MERcdTUyMzYgbG9nby5wbmcgXHU1MjMwIGRpc3QgXHU3NkVFXHU1RjU1XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXZpdGVDb25maWcpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByb290ID0gdml0ZUNvbmZpZy5yb290IHx8IGFwcERpcjtcblxuICAgICAgICAvLyBcdTRGMThcdTUxNDhcdTRFQ0VcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdTVFOTNcdTgzQjdcdTUzRDYgbG9nby5wbmdcbiAgICAgICAgY29uc3Qgc2hhcmVkTG9nb1BhdGggPSByZXNvbHZlKHJvb3QsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9wdWJsaWMvbG9nby5wbmcnKTtcbiAgICAgICAgbGV0IGxvZ29Tb3VyY2VQYXRoOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBpZiAoZXhpc3RzU3luYyhzaGFyZWRMb2dvUGF0aCkpIHtcbiAgICAgICAgICBsb2dvU291cmNlUGF0aCA9IHNoYXJlZExvZ29QYXRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFx1NUMxRFx1OEJENVx1NEVDRVx1NUU5NFx1NzUyOFx1ODFFQVx1NURGMVx1NzY4NCBwdWJsaWMgXHU3NkVFXHU1RjU1XHU4M0I3XHU1M0Q2XG4gICAgICAgICAgY29uc3QgYXBwTG9nb1BhdGggPSByZXNvbHZlKHJvb3QsICdwdWJsaWMvbG9nby5wbmcnKTtcbiAgICAgICAgICBpZiAoZXhpc3RzU3luYyhhcHBMb2dvUGF0aCkpIHtcbiAgICAgICAgICAgIGxvZ29Tb3VyY2VQYXRoID0gYXBwTG9nb1BhdGg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFsb2dvU291cmNlUGF0aCkge1xuICAgICAgICAgIHJldHVybjsgLy8gXHU1OTgyXHU2NzlDXHU2RTkwXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU5NzU5XHU5RUQ4XHU4REYzXHU4RkM3XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTgzQjdcdTUzRDZcdTY3ODRcdTVFRkFcdThGOTNcdTUxRkFcdTc2RUVcdTVGNTVcbiAgICAgICAgY29uc3Qgb3V0RGlyID0gdml0ZUNvbmZpZy5idWlsZC5vdXREaXIgfHwgJ2Rpc3QnO1xuICAgICAgICBjb25zdCBkaXN0RGlyID0gcmVzb2x2ZShyb290LCBvdXREaXIpO1xuXG4gICAgICAgIGlmICghZXhpc3RzU3luYyhkaXN0RGlyKSkge1xuICAgICAgICAgIHJldHVybjsgLy8gXHU1OTgyXHU2NzlDXHU4RjkzXHU1MUZBXHU3NkVFXHU1RjU1XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU4REYzXHU4RkM3XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsb2dvRGVzdFBhdGggPSByZXNvbHZlKGRpc3REaXIsICdsb2dvLnBuZycpO1xuXG4gICAgICAgIC8vIFx1Nzg2RVx1NEZERFx1NzZFRVx1NjgwN1x1NzZFRVx1NUY1NVx1NUI1OFx1NTcyOFxuICAgICAgICBjb25zdCBkZXN0RGlyID0gZGlybmFtZShsb2dvRGVzdFBhdGgpO1xuICAgICAgICBpZiAoIWV4aXN0c1N5bmMoZGVzdERpcikpIHtcbiAgICAgICAgICBta2RpclN5bmMoZGVzdERpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTU5MERcdTUyMzZcdTY1ODdcdTRFRjZcbiAgICAgICAgY29weUZpbGVTeW5jKGxvZ29Tb3VyY2VQYXRoLCBsb2dvRGVzdFBhdGgpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gXHU5NzU5XHU5RUQ4XHU1OTMxXHU4RDI1XHVGRjBDXHU5MDdGXHU1MTREXHU5NjNCXHU1ODVFXHU2Nzg0XHU1RUZBXG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFx1cGxvYWQtaWNvbnMtdG8tb3NzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VwbG9hZC1pY29ucy10by1vc3MudHNcIjsvKipcbiAqIFx1NEUwQVx1NEYyMFx1NTZGRVx1NjgwN1x1NjU4N1x1NEVGNlx1NTIzMCBPU1MgXHU3Njg0IFZpdGUgXHU2M0QyXHU0RUY2XG4gKiBcdTU3MjhcdTc1MUZcdTRFQTdcdTY3ODRcdTVFRkFcdTVCOENcdTYyMTBcdTU0MEVcdUZGMENcdTgxRUFcdTUyQThcdTRFMEFcdTRGMjBcdTU2RkVcdTY4MDdcdTY1ODdcdTRFRjZcdTUyMzAgT1NTXHVGRjA4XHU1N0ZBXHU0RThFXHU2NTg3XHU0RUY2XHU2MzA3XHU3RUI5XHU3Njg0XHU1ODlFXHU5MUNGXHU0RTBBXHU0RjIwXHVGRjA5XG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1t1cGxvYWQtaWNvbnMtdG8tb3NzXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbdXBsb2FkLWljb25zLXRvLW9zc10nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1t1cGxvYWQtaWNvbnMtdG8tb3NzXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbdXBsb2FkLWljb25zLXRvLW9zc10nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luLCBSZXNvbHZlZENvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnO1xuaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcbmNvbnN0IF9fZGlybmFtZSA9IHJlc29sdmUoX19maWxlbmFtZSwgJy4uJyk7XG5jb25zdCBwcm9qZWN0Um9vdCA9IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vLi4nKTtcblxuZnVuY3Rpb24gdHJ5TG9hZE9zc0NyZWRzRnJvbVdpbmRvd3NDcmVkZW50aWFsTWFuYWdlcigpOiB2b2lkIHtcbiAgLy8gXHU1M0VBXHU1NzI4IFdpbmRvd3MgXHU0RTE0XHU3RjNBXHU1QzExXHU1MUVEXHU4QkMxXHU2NUY2XHU1QzFEXHU4QkQ1XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnd2luMzInKSByZXR1cm47XG4gIGlmIChwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9JRCAmJiBwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQpIHJldHVybjtcblxuICB0cnkge1xuICAgIC8vIFx1OTAxQVx1OEZDNyBQb3dlclNoZWxsICsgQ3JlZGVudGlhbE1hbmFnZXIgXHU4QkZCXHU1M0Q2XHVGRjA4XHU0RTBEXHU4RjkzXHU1MUZBXHU2NjBFXHU2NTg3XHU1MjMwXHU2NUU1XHU1RkQ3XHVGRjA5XG4gICAgY29uc3QgcHMgPSBbXG4gICAgICBgJEVycm9yQWN0aW9uUHJlZmVyZW5jZT0nU3RvcCdgLFxuICAgICAgYEltcG9ydC1Nb2R1bGUgQ3JlZGVudGlhbE1hbmFnZXJgLFxuICAgICAgYCRpZD0oR2V0LVN0b3JlZENyZWRlbnRpYWwgLVRhcmdldCAnQWxpYmFiYUNsb3VkJyAtRXJyb3JBY3Rpb24gU2lsZW50bHlDb250aW51ZSkuR2V0TmV0d29ya0NyZWRlbnRpYWwoKS5QYXNzd29yZGAsXG4gICAgICBgJHNlYz0oR2V0LVN0b3JlZENyZWRlbnRpYWwgLVRhcmdldCAnQWxpYmFiYUNsb3VkU2VjcmV0JyAtRXJyb3JBY3Rpb24gU2lsZW50bHlDb250aW51ZSkuR2V0TmV0d29ya0NyZWRlbnRpYWwoKS5QYXNzd29yZGAsXG4gICAgICBgJG91dD1bcHNjdXN0b21vYmplY3RdQHsgaWQ9JGlkOyBzZWNyZXQ9JHNlYyB9IHwgQ29udmVydFRvLUpzb24gLUNvbXByZXNzYCxcbiAgICAgIGBXcml0ZS1PdXRwdXQgJG91dGAsXG4gICAgXS5qb2luKCc7ICcpO1xuXG4gICAgY29uc3QgcmF3ID0gZXhlY1N5bmMoYHBvd2Vyc2hlbGwgLU5vUHJvZmlsZSAtTm9uSW50ZXJhY3RpdmUgLUNvbW1hbmQgXCIke3BzLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKX1cImAsIHtcbiAgICAgIHN0ZGlvOiBbJ2lnbm9yZScsICdwaXBlJywgJ2lnbm9yZSddLFxuICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGpzb25UZXh0ID0gKHJhdyB8fCAnJykudHJpbSgpO1xuICAgIGlmICghanNvblRleHQpIHJldHVybjtcblxuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoanNvblRleHQpIGFzIHsgaWQ/OiBzdHJpbmc7IHNlY3JldD86IHN0cmluZyB9O1xuICAgIGlmIChwYXJzZWQ/LmlkICYmICFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9JRCkgcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQgPSBwYXJzZWQuaWQ7XG4gICAgaWYgKHBhcnNlZD8uc2VjcmV0ICYmICFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQpIHByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX1NFQ1JFVCA9IHBhcnNlZC5zZWNyZXQ7XG4gIH0gY2F0Y2gge1xuICAgIC8vIFx1OTc1OVx1OUVEOFx1NTkzMVx1OEQyNVx1RkYxQVx1NEUwRFx1OTYzQlx1NTg1RVx1Njc4NFx1NUVGQVx1NkQ0MVx1N0EwQlxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGxvYWRJY29uc1RvT3NzUGx1Z2luKCk6IFBsdWdpbiB7XG4gIGxldCBpc1Byb2R1Y3Rpb25CdWlsZCA9IGZhbHNlO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3VwbG9hZC1pY29ucy10by1vc3MnLFxuICAgIGFwcGx5OiAnYnVpbGQnLCAvLyBcdTUzRUFcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTYyNjdcdTg4NENcblxuICAgIGNvbmZpZ1Jlc29sdmVkKGNvbmZpZzogUmVzb2x2ZWRDb25maWcpIHtcbiAgICAgIC8vIFZpdGUgXHU3Njg0IGlzUHJvZHVjdGlvbiBcdTY2MkZcdTY3MDBcdTUzRUZcdTk3NjBcdTc2ODRcdTUyMjRcdTY1QURcdUZGMDhcdTkwN0ZcdTUxNEQgTk9ERV9FTlYgLyBERVYgXHU3QjQ5XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU1NzI4IENJIFx1NEUyRFx1NEUwRFx1NEUwMFx1ODFGNFx1RkYwOVxuICAgICAgaXNQcm9kdWN0aW9uQnVpbGQgPSAhIWNvbmZpZy5pc1Byb2R1Y3Rpb247XG4gICAgfSxcblxuICAgIGFzeW5jIGNsb3NlQnVuZGxlKCkge1xuICAgICAgLy8gXHU1M0VBXHU1NzI4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU2Nzg0XHU1RUZBXHU2NUY2XHU0RTBBXHU0RjIwXG4gICAgICBpZiAoIWlzUHJvZHVjdGlvbkJ1aWxkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gV2luZG93cyBcdTY3MkNcdTU3MzBcdTY3ODRcdTVFRkFcdUZGMUFcdTU5ODJcdTY3OUNcdTY3MkFcdTY2M0VcdTVGMEZcdThCQkVcdTdGNkUgZW52Ly5lbnYub3NzXHVGRjBDXHU1QzFEXHU4QkQ1XHU0RUNFXHU1MUVEXHU4QkMxXHU3QkExXHU3NDA2XHU1NjY4XHU4QkZCXHU1M0Q2XG4gICAgICB0cnlMb2FkT3NzQ3JlZHNGcm9tV2luZG93c0NyZWRlbnRpYWxNYW5hZ2VyKCk7XG5cbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NjcwOSBPU1MgXHU5MTREXHU3RjZFXG4gICAgICBpZiAoIXByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX0lEIHx8ICFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQpIHtcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5XHU0RTBBXHU0RjIwXHVGRjBDYWxsLmJlbGxpcy5jb20uY24gXHU0RUUzXHU3NDA2XHU1MjMwIE9TUyBcdTVDMDZcdThGRDRcdTU2REUgTm9TdWNoS2V5XHVGRjA4bG9nby5wbmcgLyBpY29ucy8qXHVGRjA5XG4gICAgICAgIGNvbnNvbGUud2FybignW3VwbG9hZC1pY29ucy10by1vc3NdIFx1MjZBMFx1RkUwRiAgXHU4REYzXHU4RkM3XHU0RTBBXHU0RjIwXHVGRjA4XHU2NzJBXHU5MTREXHU3RjZFIE9TUyBcdTUxRURcdThCQzFcdUZGMDlcdTMwMDJcdThGRDlcdTRGMUFcdTVCRkNcdTgxRjQgaHR0cHM6Ly9hbGwuYmVsbGlzLmNvbS5jbi9sb2dvLnBuZyBcdThGRDRcdTU2REUgTm9TdWNoS2V5Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1NzI4IENJIFx1NEUyRFx1NUZDNVx1OTg3Qlx1N0I0OVx1NUY4NVx1NEUwQVx1NEYyMFx1NUI4Q1x1NjIxMFx1RkYwQ1x1NTQyNlx1NTIxOVx1Njc4NFx1NUVGQVx1OEZEQlx1N0EwQlx1OTAwMFx1NTFGQVx1NEYxQVx1NzZGNFx1NjNBNVx1N0VDOFx1NkI2Mlx1NUI1MFx1OEZEQlx1N0EwQlx1RkYwQ1x1NUJGQ1x1ODFGNFx1NjU4N1x1NEVGNlx1NjcyQVx1NEUwQVx1NEYyMFxuICAgICAgY29uc3QgdXBsb2FkU2NyaXB0ID0gcmVzb2x2ZShwcm9qZWN0Um9vdCwgJ3NjcmlwdHMvdXBsb2FkLWljb25zLXRvLW9zcy5tanMnKTtcbiAgICAgIGNvbnNvbGUuaW5mbygnW3VwbG9hZC1pY29ucy10by1vc3NdIFx1RDgzRFx1REU4MCBcdTVGMDBcdTU5Q0JcdTRFMEFcdTRGMjBcdTU2RkVcdTY4MDdcdTY1ODdcdTRFRjZcdTUyMzAgT1NTLi4uJyk7XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlUHJvbWlzZSwgcmVqZWN0UHJvbWlzZSkgPT4ge1xuICAgICAgICBjb25zdCBjaGlsZCA9IHNwYXduKCdub2RlJywgW3VwbG9hZFNjcmlwdF0sIHtcbiAgICAgICAgICBzdGRpbzogJ2luaGVyaXQnLFxuICAgICAgICAgIHNoZWxsOiB0cnVlLFxuICAgICAgICAgIGVudjoge1xuICAgICAgICAgICAgLi4ucHJvY2Vzcy5lbnYsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2hpbGQub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICAgICAgcmVqZWN0UHJvbWlzZShlcnJvcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNoaWxkLm9uKCdleGl0JywgKGNvZGUpID0+IHtcbiAgICAgICAgICBpZiAoY29kZSA9PT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdbdXBsb2FkLWljb25zLXRvLW9zc10gXHUyNzA1IFx1NTZGRVx1NjgwN1x1NjU4N1x1NEVGNlx1NEUwQVx1NEYyMFx1NUI4Q1x1NjIxMCcpO1xuICAgICAgICAgICAgcmVzb2x2ZVByb21pc2UoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gXHU5RUQ4XHU4QkE0XHU0RTBEXHU5NjNCXHU1ODVFXHU2Nzg0XHU1RUZBXHVGRjFBbGF5b3V0LWFwcCBkaXN0IFx1OTFDQ1x1NEVDRFx1NjcwOSBpY29ucy9sb2dvIFx1NEY1Q1x1NEUzQVx1NjcyQ1x1NTczMFx1NTQwRVx1NTkwN1x1RkYwQ1x1OTA3Rlx1NTE0RCA0MDRcbiAgICAgICAgICAgIC8vIFx1NTk4Mlx1OTcwMFx1NEUyNVx1NjgzQ1x1NTkzMVx1OEQyNVx1RkYwOENJIFx1NUYzQVx1NTIzNlx1NEUwQVx1NEYyMFx1NjIxMFx1NTI5Rlx1RkYwOVx1RkYwQ1x1OEJCRVx1N0Y2RSBPU1NfVVBMT0FEX1NUUklDVD10cnVlXG4gICAgICAgICAgICBjb25zdCBzdHJpY3QgPSBwcm9jZXNzLmVudi5PU1NfVVBMT0FEX1NUUklDVCA9PT0gJ3RydWUnO1xuICAgICAgICAgICAgY29uc3QgZXJyID0gbmV3IEVycm9yKGBbdXBsb2FkLWljb25zLXRvLW9zc10gXHU0RTBBXHU0RjIwXHU4MTFBXHU2NzJDXHU5MDAwXHU1MUZBXHVGRjBDXHU0RUUzXHU3ODAxOiAke2NvZGUgPz8gJ3Vua25vd24nfWApO1xuICAgICAgICAgICAgaWYgKHN0cmljdCkge1xuICAgICAgICAgICAgICByZWplY3RQcm9taXNlKGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICByZXNvbHZlUHJvbWlzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXHJlcGxhY2UtaWNvbnMtd2l0aC1jZG4udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvcmVwbGFjZS1pY29ucy13aXRoLWNkbi50c1wiOy8qKlxuICogXHU1QzA2IGluZGV4Lmh0bWwgXHU0RTJEXHU3Njg0XHU1NkZFXHU2ODA3XHU4REVGXHU1Rjg0XHU2NkZGXHU2MzYyXHU0RTNBIENETiBVUkwgXHU3Njg0IFZpdGUgXHU2M0QyXHU0RUY2XG4gKiBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTRGN0ZcdTc1MjggQ0ROXHVGRjBDXHU1RjAwXHU1M0QxL1x1OTg4NFx1ODlDOFx1NzNBRlx1NTg4M1x1NEZERFx1NjMwMVx1NjcyQ1x1NTczMFx1OERFRlx1NUY4NFxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbcmVwbGFjZS1pY29ucy13aXRoLWNkbl0nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW3JlcGxhY2UtaWNvbnMtd2l0aC1jZG5dJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbcmVwbGFjZS1pY29ucy13aXRoLWNkbl0nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW3JlcGxhY2UtaWNvbnMtd2l0aC1jZG5dJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgUmVzb2x2ZWRDb25maWcgfSBmcm9tICd2aXRlJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlcGxhY2VJY29uc1dpdGhDZG5QbHVnaW4oKTogUGx1Z2luIHtcbiAgbGV0IGlzUHJvZHVjdGlvbkJ1aWxkID0gZmFsc2U7XG4gIGxldCBjYWNoZWRMb2dvQ2RuT2s6IGJvb2xlYW4gfCBudWxsID0gbnVsbDtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdyZXBsYWNlLWljb25zLXdpdGgtY2RuJyxcbiAgICBhcHBseTogJ2J1aWxkJywgLy8gXHU1M0VBXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU2MjY3XHU4ODRDXG5cbiAgICBjb25maWdSZXNvbHZlZChjb25maWc6IFJlc29sdmVkQ29uZmlnKSB7XG4gICAgICBpc1Byb2R1Y3Rpb25CdWlsZCA9ICEhY29uZmlnLmlzUHJvZHVjdGlvbjtcbiAgICB9LFxuXG4gICAgYXN5bmMgdHJhbnNmb3JtSW5kZXhIdG1sKGh0bWwpIHtcbiAgICAgIC8vIFx1NTNFQVx1NTcyOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1Njc4NFx1NUVGQVx1NjVGNlx1NjZGRlx1NjM2Mlx1RkYwOFx1NEY3Rlx1NzUyOCBWaXRlIFx1NzY4NCBpc1Byb2R1Y3Rpb25cdUZGMENcdTkwN0ZcdTUxNEQgQ0kgXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU0RTBEXHU0RTAwXHU4MUY0XHVGRjA5XG4gICAgICBpZiAoIWlzUHJvZHVjdGlvbkJ1aWxkKSB7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICAvLyBcdTVFRjZcdThGREZcdTVCRkNcdTUxNjVcdUZGMENcdTkwN0ZcdTUxNERcdTU3Mjggdml0ZS5jb25maWcudHMgXHU1MkEwXHU4RjdEXHU2NUY2XHU4OUUzXHU2NzkwXHU1OTMxXHU4RDI1XG4gICAgICAgIGNvbnN0IHsgZ2V0RW52Q29uZmlnIH0gPSBhd2FpdCBpbXBvcnQoJ0BidGMvc2hhcmVkLWNvcmUvY29uZmlncy91bmlmaWVkLWVudi1jb25maWcnKTtcbiAgICAgICAgLy8gXHU4M0I3XHU1M0Q2XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFXG4gICAgICAgIGNvbnN0IGVudkNvbmZpZyA9IGdldEVudkNvbmZpZygpO1xuICAgICAgICBjb25zdCBjZG5VcmwgPSBlbnZDb25maWcuY2RuPy5zdGF0aWNBc3NldHNVcmw7XG5cbiAgICAgICAgaWYgKCFjZG5VcmwpIHtcbiAgICAgICAgICAvLyBcdTY3MkFcdTkxNERcdTdGNkUgQ0ROXHVGRjBDXHU0RkREXHU2MzAxXHU1MzlGXHU2ODM3XG4gICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjZG5CYXNlID0gY2RuVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyk7XG5cbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RUM1XHU1RjUzIENETiBcdTRFMEFcdTc4NkVcdTVCOUVcdTVCNThcdTU3MjggbG9nby5wbmcgXHU2NUY2XHU2MjREXHU2NkZGXHU2MzYyXG4gICAgICAgIC8vIFx1NTQyNlx1NTIxOVx1NEZERFx1NzU1OVx1NjcyQ1x1NTczMCAvbG9nby5wbmdcdUZGMENcdTVFNzZcdTRGOURcdThENTZcdTVCNTBcdTVFOTRcdTc1MjggZGlzdC9sb2dvLnBuZyBcdTRGNUNcdTRFM0FcdTU0MEVcdTU5MDdcdUZGMENcdTkwN0ZcdTUxNEQgNDA0XG4gICAgICAgIGlmIChjYWNoZWRMb2dvQ2RuT2sgPT09IG51bGwpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7Y2RuQmFzZX0vbG9nby5wbmdgLCB7IG1ldGhvZDogJ0hFQUQnLCByZWRpcmVjdDogJ2ZvbGxvdycgfSk7XG4gICAgICAgICAgICBjYWNoZWRMb2dvQ2RuT2sgPSAhIXJlcy5vaztcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIGNhY2hlZExvZ29DZG5PayA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1NjZGRlx1NjM2Mlx1NTZGRVx1NjgwN1x1OERFRlx1NUY4NFxuICAgICAgICBsZXQgbmV3SHRtbCA9IGh0bWw7XG5cbiAgICAgICAgLy8gXHU2NkZGXHU2MzYyIC9sb2dvLnBuZ1xuICAgICAgICBpZiAoY2FjaGVkTG9nb0Nkbk9rKSB7XG4gICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShcbiAgICAgICAgICAgIC9ocmVmPVtcIiddXFwvbG9nb1xcLnBuZ1tcIiddL2csXG4gICAgICAgICAgICBgaHJlZj1cIiR7Y2RuQmFzZX0vbG9nby5wbmdcImBcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU2NkZGXHU2MzYyIC9pY29ucy8gXHU4REVGXHU1Rjg0XG4gICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgL2hyZWY9W1wiJ11cXC9pY29uc1xcLyhbXlwiJ10rKVtcIiddL2csXG4gICAgICAgICAgKG1hdGNoLCBpY29uRmlsZSkgPT4ge1xuICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBc2l0ZS53ZWJtYW5pZmVzdCBcdTVGQzVcdTk4N0JcdTRGRERcdTYzMDFcdTU0MENcdTZFOTBcdUZGMDhcdTc1MzFcdTU0MDRcdTVCNTBcdTVFOTRcdTc1MjhcdTgxRUFcdThFQUJcdTYzRDBcdTRGOUJcdUZGMDlcdUZGMENcdTU0MjZcdTUyMTlcdUZGMUFcbiAgICAgICAgICAgIC8vIC0gXHU0RjFBXHU4OUU2XHU1M0QxXHU4REU4XHU1N0RGL0NPUlNcbiAgICAgICAgICAgIC8vIC0gUFdBIHN0YXJ0X3VybCBcdTRGMUFcdTRFRTUgQ0ROIFx1NTdERlx1NTQwRFx1NEUzQVx1NTdGQVx1NTFDNlx1RkYwQ1x1NUJGQ1x1ODFGNFx1NUI4OVx1ODhDNS9cdTU0MkZcdTUyQThcdTg4NENcdTRFM0FcdTk1MTlcdThCRUZcbiAgICAgICAgICAgIGlmIChpY29uRmlsZSA9PT0gJ3NpdGUud2VibWFuaWZlc3QnKSB7XG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBgaHJlZj1cIiR7Y2RuQmFzZX0vaWNvbnMvJHtpY29uRmlsZX1cImA7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBuZXdIdG1sO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU4M0I3XHU1M0Q2XHU5MTREXHU3RjZFXHU1OTMxXHU4RDI1XHVGRjBDXHU0RkREXHU2MzAxXHU1MzlGXHU2ODM3XG4gICAgICAgIGNvbnNvbGUud2FybignW3JlcGxhY2UtaWNvbnMtd2l0aC1jZG5dIFx1ODNCN1x1NTNENlx1OTE0RFx1N0Y2RVx1NTkzMVx1OEQyNVx1RkYwQ1x1NEZERFx1NjMwMVx1NTM5Rlx1NTZGRVx1NjgwN1x1OERFRlx1NUY4NDonLCBlcnJvcik7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcbG9jYWxlcy1zdGF0aWMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvbG9jYWxlcy1zdGF0aWMudHNcIjsvKipcbiAqIExvY2FsZXMgXHU5NzU5XHU2MDAxXHU2NTg3XHU0RUY2XHU2M0QyXHU0RUY2XG4gKiBcdTU3MjhcdTVGMDBcdTUzRDFcdTY3MERcdTUyQTFcdTU2NjhcdTVDNDJcdTk3NjJcdTYzRDBcdTRGOUIgc3JjL2xvY2FsZXMvKi5qc29uIFx1NjU4N1x1NEVGNlx1RkYwQ1x1NEY5Qlx1NEUzQlx1NUU5NFx1NzUyOFx1OTAxQVx1OEZDNyBmZXRjaCBcdTUyQTBcdThGN0RcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU1NkUwXHU0RTNBIGVzYnVpbGQgXHU2NUUwXHU2Q0Q1XHU2QjYzXHU3ODZFXHU4OUUzXHU2NzkwIHdvcmtzcGFjZSBcdTUzMDVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcdUZGMENcdTkwN0ZcdTUxNERcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdTc2ODRcdTg5RTNcdTY3OTBcdTk1RUVcdTk4OThcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFZpdGVEZXZTZXJ2ZXIgfSBmcm9tICd2aXRlJztcbmltcG9ydCB0eXBlIHsgUmVzb2x2ZWRDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlYWRGaWxlU3luYywgZXhpc3RzU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IGpvaW4sIHJlc29sdmUgfSBmcm9tICdwYXRoJztcblxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU0RjVDXHU0RTNBIGxvZ2dlclx1RkYwQ1x1OTA3Rlx1NTE0RFx1NTcyOFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1ODlFM1x1Njc5MCBAYnRjL3NoYXJlZC1jb3JlXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbbG9jYWxlcy1zdGF0aWNdJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1tsb2NhbGVzLXN0YXRpY10nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1tsb2NhbGVzLXN0YXRpY10nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW2xvY2FsZXMtc3RhdGljXScsIC4uLmFyZ3MpLFxufTtcblxuLyoqXG4gKiBMb2NhbGVzIFx1OTc1OVx1NjAwMVx1NjU4N1x1NEVGNlx1NjNEMlx1NEVGNlxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvY2FsZXNTdGF0aWNQbHVnaW4oYXBwRGlyOiBzdHJpbmcpOiBQbHVnaW4ge1xuICBsZXQgdml0ZUNvbmZpZzogUmVzb2x2ZWRDb25maWcgfCBudWxsID0gbnVsbDtcblxuICBjb25zdCBsb2NhbGVzTWlkZGxld2FyZSA9IChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xuICAgIC8vIFx1NTkwNFx1NzQwNiBPUFRJT05TIFx1OTg4NFx1NjhDMFx1OEJGN1x1NkM0MlxuICAgIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycgJiYgcmVxLnVybD8ubWF0Y2goL15cXC9zcmNcXC9sb2NhbGVzXFwvW14vXStcXC5qc29uJC8pKSB7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlJyk7XG4gICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgIHJlcy5lbmQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTUzRUFcdTU5MDRcdTc0MDYgR0VUIFx1OEJGN1x1NkM0Mlx1NTQ4QyAvc3JjL2xvY2FsZXMvKi5qc29uIFx1OERFRlx1NUY4NFxuICAgIGlmIChyZXEubWV0aG9kICE9PSAnR0VUJyB8fCAhcmVxLnVybCB8fCAhcmVxLnVybC5tYXRjaCgvXlxcL3NyY1xcL2xvY2FsZXNcXC9bXi9dK1xcLmpzb24kLykpIHtcbiAgICAgIG5leHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTYzRDBcdTUzRDZcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcdUZGMENcdTRGOEJcdTU5ODIgL3NyYy9sb2NhbGVzL3poLUNOLmpzb24gLT4gc3JjL2xvY2FsZXMvemgtQ04uanNvblxuICAgIGNvbnN0IGZpbGVQYXRoID0gcmVxLnVybC5yZXBsYWNlKC9eXFwvLywgJycpO1xuXG4gICAgLy8gXHU2Nzg0XHU1RUZBXHU1QjhDXHU2NTc0XHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XG4gICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlKGFwcERpciwgZmlsZVBhdGgpO1xuXG4gICAgLy8gXHU2OEMwXHU2N0U1XHU2NTg3XHU0RUY2XHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XG4gICAgaWYgKCFleGlzdHNTeW5jKGZ1bGxQYXRoKSkge1xuICAgICAgLy8gXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU4QkIwXHU1RjU1XHU4QjY2XHU1NDRBXHU1RTc2XHU3RUU3XHU3RUVEXHU0RTBCXHU0RTAwXHU0RTJBXHU0RTJEXHU5NUY0XHU0RUY2XG4gICAgICBjb25zb2xlLndhcm4oYFtsb2NhbGVzLXN0YXRpY10gRmlsZSBub3QgZm91bmQ6ICR7ZnVsbFBhdGh9IChyZXF1ZXN0ZWQ6ICR7cmVxLnVybH0pYCk7XG4gICAgICBuZXh0KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QkZCXHU1M0Q2XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGYtOCcpO1xuXG4gICAgICAvLyBcdThCQkVcdTdGNkVcdTU0Q0RcdTVFOTRcdTU5MzRcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlJyk7XG5cbiAgICAgIC8vIFx1OEZENFx1NTZERVx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVxuICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICByZXMuZW5kKGNvbnRlbnQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBcdThCRkJcdTUzRDZcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjVcdUZGMENcdTdFRTdcdTdFRURcdTRFMEJcdTRFMDBcdTRFMkFcdTRFMkRcdTk1RjRcdTRFRjZcbiAgICAgIGNvbnNvbGUud2FybihgW2xvY2FsZXMtc3RhdGljXSBGYWlsZWQgdG8gcmVhZCBmaWxlOiAke2Z1bGxQYXRofWAsIGVycm9yKTtcbiAgICAgIG5leHQoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAndml0ZS1wbHVnaW4tbG9jYWxlcy1zdGF0aWMnLFxuXG4gICAgY29uZmlnUmVzb2x2ZWQoY29uZmlnKSB7XG4gICAgICB2aXRlQ29uZmlnID0gY29uZmlnO1xuICAgIH0sXG5cbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyOiBWaXRlRGV2U2VydmVyKSB7XG4gICAgICAvLyBcdTU3MjggVml0ZSBcdTUxODVcdTkwRThcdTRFMkRcdTk1RjRcdTRFRjZcdTRFNEJcdTUyNERcdTYyRTZcdTYyMkFcdThCRjdcdTZDNDJcdUZGMENcdTYzRDBcdTRGOUIgbG9jYWxlcyBcdTY1ODdcdTRFRjZcbiAgICAgIC8vIFx1NEY3Rlx1NzUyOCB1c2UgXHU1QzA2XHU0RTJEXHU5NUY0XHU0RUY2XHU2REZCXHU1MkEwXHU1MjMwXHU0RTJEXHU5NUY0XHU0RUY2XHU2ODA4XHVGRjBDVml0ZSBcdTRGMUFcdTYzMDlcdTcxNjdcdTZDRThcdTUxOENcdTk4N0FcdTVFOEZcdTYyNjdcdTg4NENcbiAgICAgIC8vIFx1NjIxMVx1NEVFQ1x1OTcwMFx1ODk4MVx1NTcyOCBTUEEgZmFsbGJhY2sgXHU0RTRCXHU1MjREXHU1OTA0XHU3NDA2XHVGRjBDXHU2MjQwXHU0RUU1XHU3NkY0XHU2M0E1XHU0RjdGXHU3NTI4IHVzZVxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShsb2NhbGVzTWlkZGxld2FyZSk7XG4gICAgfSxcbiAgfTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFx1cGxvYWQtY2RuLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VwbG9hZC1jZG4udHNcIjsvKipcbiAqIFx1NEUwQVx1NEYyMFx1NUU5NFx1NzUyOFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NTIzMCBDRE4gXHU3Njg0IFZpdGUgXHU2M0QyXHU0RUY2XG4gKiBcdTU3MjhcdTc1MUZcdTRFQTdcdTY3ODRcdTVFRkFcdTVCOENcdTYyMTBcdTU0MEVcdUZGMENcdTgxRUFcdTUyQThcdTRFMEFcdTRGMjBcdTVFOTRcdTc1MjhcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTUyMzAgT1NTL0NETlx1RkYwOFx1NTdGQVx1NEU4RVx1NjU4N1x1NEVGNlx1NjMwN1x1N0VCOVx1NzY4NFx1NTg5RVx1OTFDRlx1NEUwQVx1NEYyMFx1RkYwOVxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbdXBsb2FkLWNkbl0nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW3VwbG9hZC1jZG5dJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbdXBsb2FkLWNkbl0nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW3VwbG9hZC1jZG5dJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgUmVzb2x2ZWRDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHNwYXduIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSByZXNvbHZlKF9fZmlsZW5hbWUsICcuLicpO1xuY29uc3QgcHJvamVjdFJvb3QgPSByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uLy4uJyk7XG5cbmZ1bmN0aW9uIHRyeUxvYWRPc3NDcmVkc0Zyb21XaW5kb3dzQ3JlZGVudGlhbE1hbmFnZXIoKTogdm9pZCB7XG4gIC8vIFx1NTNFQVx1NTcyOCBXaW5kb3dzIFx1NEUxNFx1N0YzQVx1NUMxMVx1NTFFRFx1OEJDMVx1NjVGNlx1NUMxRFx1OEJENVxuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ3dpbjMyJykgcmV0dXJuO1xuICBpZiAocHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQgJiYgcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUKSByZXR1cm47XG5cbiAgdHJ5IHtcbiAgICAvLyBcdTkwMUFcdThGQzcgUG93ZXJTaGVsbCArIENyZWRlbnRpYWxNYW5hZ2VyIFx1OEJGQlx1NTNENlx1RkYwOFx1NEUwRFx1OEY5M1x1NTFGQVx1NjYwRVx1NjU4N1x1NTIzMFx1NjVFNVx1NUZEN1x1RkYwOVxuICAgIGNvbnN0IHBzID0gW1xuICAgICAgYCRFcnJvckFjdGlvblByZWZlcmVuY2U9J1N0b3AnYCxcbiAgICAgIGBJbXBvcnQtTW9kdWxlIENyZWRlbnRpYWxNYW5hZ2VyYCxcbiAgICAgIGAkaWQ9KEdldC1TdG9yZWRDcmVkZW50aWFsIC1UYXJnZXQgJ0FsaWJhYmFDbG91ZCcgLUVycm9yQWN0aW9uIFNpbGVudGx5Q29udGludWUpLkdldE5ldHdvcmtDcmVkZW50aWFsKCkuUGFzc3dvcmRgLFxuICAgICAgYCRzZWM9KEdldC1TdG9yZWRDcmVkZW50aWFsIC1UYXJnZXQgJ0FsaWJhYmFDbG91ZFNlY3JldCcgLUVycm9yQWN0aW9uIFNpbGVudGx5Q29udGludWUpLkdldE5ldHdvcmtDcmVkZW50aWFsKCkuUGFzc3dvcmRgLFxuICAgICAgYCRvdXQ9W3BzY3VzdG9tb2JqZWN0XUB7IGlkPSRpZDsgc2VjcmV0PSRzZWMgfSB8IENvbnZlcnRUby1Kc29uIC1Db21wcmVzc2AsXG4gICAgICBgV3JpdGUtT3V0cHV0ICRvdXRgLFxuICAgIF0uam9pbignOyAnKTtcblxuICAgIGNvbnN0IHJhdyA9IGV4ZWNTeW5jKGBwb3dlcnNoZWxsIC1Ob1Byb2ZpbGUgLU5vbkludGVyYWN0aXZlIC1Db21tYW5kIFwiJHtwcy5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyl9XCJgLCB7XG4gICAgICBzdGRpbzogWydpZ25vcmUnLCAncGlwZScsICdpZ25vcmUnXSxcbiAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgfSk7XG5cbiAgICBjb25zdCBqc29uVGV4dCA9IChyYXcgfHwgJycpLnRyaW0oKTtcbiAgICBpZiAoIWpzb25UZXh0KSByZXR1cm47XG5cbiAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGpzb25UZXh0KSBhcyB7IGlkPzogc3RyaW5nOyBzZWNyZXQ/OiBzdHJpbmcgfTtcbiAgICBpZiAocGFyc2VkPy5pZCAmJiAhcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQpIHByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX0lEID0gcGFyc2VkLmlkO1xuICAgIGlmIChwYXJzZWQ/LnNlY3JldCAmJiAhcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUKSBwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQgPSBwYXJzZWQuc2VjcmV0O1xuICB9IGNhdGNoIHtcbiAgICAvLyBcdTk3NTlcdTlFRDhcdTU5MzFcdThEMjVcdUZGMUFcdTRFMERcdTk2M0JcdTU4NUVcdTY3ODRcdTVFRkFcdTZENDFcdTdBMEJcbiAgfVxufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBDRE4gXHU0RTBBXHU0RjIwXHU2M0QyXHU0RUY2XG4gKiBAcGFyYW0gYXBwTmFtZSBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcdUZGMDhcdTU5ODIgJ3N5c3RlbS1hcHAnXHVGRjA5XG4gKiBAcGFyYW0gYXBwRGlyIFx1NUU5NFx1NzUyOFx1NzZFRVx1NUY1NVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBsb2FkQ2RuUGx1Z2luKGFwcE5hbWU6IHN0cmluZywgX2FwcERpcjogc3RyaW5nKTogUGx1Z2luIHtcbiAgbGV0IGlzUHJvZHVjdGlvbkJ1aWxkID0gZmFsc2U7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAndXBsb2FkLWNkbicsXG4gICAgYXBwbHk6ICdidWlsZCcsIC8vIFx1NTNFQVx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NjI2N1x1ODg0Q1xuXG4gICAgY29uZmlnUmVzb2x2ZWQoY29uZmlnOiBSZXNvbHZlZENvbmZpZykge1xuICAgICAgLy8gVml0ZSBcdTc2ODQgaXNQcm9kdWN0aW9uIFx1NjYyRlx1NjcwMFx1NTNFRlx1OTc2MFx1NzY4NFx1NTIyNFx1NjVBRFx1RkYwOFx1OTA3Rlx1NTE0RCBOT0RFX0VOViAvIERFViBcdTdCNDlcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdTU3MjggQ0kgXHU0RTJEXHU0RTBEXHU0RTAwXHU4MUY0XHVGRjA5XG4gICAgICBpc1Byb2R1Y3Rpb25CdWlsZCA9ICEhY29uZmlnLmlzUHJvZHVjdGlvbjtcbiAgICB9LFxuXG4gICAgYXN5bmMgY2xvc2VCdW5kbGUoKSB7XG4gICAgICAvLyBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTU0MkZcdTc1MjggQ0ROIFx1NEUwQVx1NEYyMFxuICAgICAgaWYgKHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fVVBMT0FEICE9PSAndHJ1ZScpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdThERjNcdThGQzdcdTRFMEFcdTRGMjBcbiAgICAgIGlmIChwcm9jZXNzLmVudi5TS0lQX0NETl9VUExPQUQgPT09ICd0cnVlJykge1xuICAgICAgICBjb25zb2xlLmluZm8oYFt1cGxvYWQtY2RuXSBcdTIzRURcdUZFMEYgIFx1OERGM1x1OEZDNyAke2FwcE5hbWV9IFx1NzY4NCBDRE4gXHU0RTBBXHU0RjIwXHVGRjA4U0tJUF9DRE5fVVBMT0FEPXRydWVcdUZGMDlgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTUzRUFcdTU3MjhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTY3ODRcdTVFRkFcdTY1RjZcdTRFMEFcdTRGMjBcbiAgICAgIGlmICghaXNQcm9kdWN0aW9uQnVpbGQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBXaW5kb3dzIFx1NjcyQ1x1NTczMFx1Njc4NFx1NUVGQVx1RkYxQVx1NTk4Mlx1Njc5Q1x1NjcyQVx1NjYzRVx1NUYwRlx1OEJCRVx1N0Y2RSBlbnYvLmVudi5vc3NcdUZGMENcdTVDMURcdThCRDVcdTRFQ0VcdTUxRURcdThCQzFcdTdCQTFcdTc0MDZcdTU2NjhcdThCRkJcdTUzRDZcbiAgICAgIHRyeUxvYWRPc3NDcmVkc0Zyb21XaW5kb3dzQ3JlZGVudGlhbE1hbmFnZXIoKTtcblxuICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU2NzA5IE9TUyBcdTkxNERcdTdGNkVcbiAgICAgIGlmICghcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQgfHwgIXByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX1NFQ1JFVCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYFt1cGxvYWQtY2RuXSBcdTI2QTBcdUZFMEYgIFx1OERGM1x1OEZDNyAke2FwcE5hbWV9IFx1NzY4NCBDRE4gXHU0RTBBXHU0RjIwXHVGRjA4XHU2NzJBXHU5MTREXHU3RjZFIE9TUyBcdTUxRURcdThCQzFcdUZGMDlgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU3MjggQ0kgXHU0RTJEXHU1RkM1XHU5ODdCXHU3QjQ5XHU1Rjg1XHU0RTBBXHU0RjIwXHU1QjhDXHU2MjEwXHVGRjBDXHU1NDI2XHU1MjE5XHU2Nzg0XHU1RUZBXHU4RkRCXHU3QTBCXHU5MDAwXHU1MUZBXHU0RjFBXHU3NkY0XHU2M0E1XHU3RUM4XHU2QjYyXHU1QjUwXHU4RkRCXHU3QTBCXHVGRjBDXHU1QkZDXHU4MUY0XHU2NTg3XHU0RUY2XHU2NzJBXHU0RTBBXHU0RjIwXG4gICAgICBjb25zdCB1cGxvYWRTY3JpcHQgPSByZXNvbHZlKHByb2plY3RSb290LCAnc2NyaXB0cy91cGxvYWQtYXBwLXRvLWNkbi5tanMnKTtcbiAgICAgIGNvbnNvbGUuaW5mbyhgW3VwbG9hZC1jZG5dIFx1RDgzRFx1REU4MCBcdTVGMDBcdTU5Q0JcdTRFMEFcdTRGMjAgJHthcHBOYW1lfSBcdTUyMzAgQ0ROLi4uYCk7XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlUHJvbWlzZSwgcmVqZWN0UHJvbWlzZSkgPT4ge1xuICAgICAgICBjb25zdCBjaGlsZCA9IHNwYXduKCdub2RlJywgW3VwbG9hZFNjcmlwdCwgYXBwTmFtZV0sIHtcbiAgICAgICAgICBzdGRpbzogJ2luaGVyaXQnLFxuICAgICAgICAgIHNoZWxsOiB0cnVlLFxuICAgICAgICAgIGVudjoge1xuICAgICAgICAgICAgLi4ucHJvY2Vzcy5lbnYsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2hpbGQub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICAgICAgcmVqZWN0UHJvbWlzZShlcnJvcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNoaWxkLm9uKCdleGl0JywgKGNvZGUpID0+IHtcbiAgICAgICAgICBpZiAoY29kZSA9PT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbdXBsb2FkLWNkbl0gXHUyNzA1ICR7YXBwTmFtZX0gXHU0RTBBXHU0RjIwXHU1QjhDXHU2MjEwYCk7XG4gICAgICAgICAgICByZXNvbHZlUHJvbWlzZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBcdTlFRDhcdThCQTRcdTRFMERcdTk2M0JcdTU4NUVcdTY3ODRcdTVFRkFcdUZGMUFcdTU5ODJcdTk3MDBcdTRFMjVcdTY4M0NcdTU5MzFcdThEMjVcdUZGMDhDSSBcdTVGM0FcdTUyMzZcdTRFMEFcdTRGMjBcdTYyMTBcdTUyOUZcdUZGMDlcdUZGMENcdThCQkVcdTdGNkUgT1NTX1VQTE9BRF9TVFJJQ1Q9dHJ1ZVxuICAgICAgICAgICAgY29uc3Qgc3RyaWN0ID0gcHJvY2Vzcy5lbnYuT1NTX1VQTE9BRF9TVFJJQ1QgPT09ICd0cnVlJztcbiAgICAgICAgICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcihgW3VwbG9hZC1jZG5dICR7YXBwTmFtZX0gXHU0RTBBXHU0RjIwXHU4MTFBXHU2NzJDXHU5MDAwXHU1MUZBXHVGRjBDXHU0RUUzXHU3ODAxOiAke2NvZGUgPz8gJ3Vua25vd24nfWApO1xuICAgICAgICAgICAgaWYgKHN0cmljdCkge1xuICAgICAgICAgICAgICByZWplY3RQcm9taXNlKGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICByZXNvbHZlUHJvbWlzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGNkbi1hc3NldHMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvY2RuLWFzc2V0cy50c1wiOy8qKlxuICogQ0ROIFx1OEQ0NFx1NkU5MFx1NTJBMFx1OTAxRlx1NjNEMlx1NEVGNlxuICogXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU0RkVFXHU2NTM5IEhUTUwgXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwIFVSTFx1RkYwQ1x1NUMwNlx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1OEY2Q1x1NjM2Mlx1NEUzQSBDRE4gVVJMXG4gKiBcdTY1MkZcdTYzMDFcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdThENDRcdTZFOTAgKC9hc3NldHMvKSBcdTU0OENcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjhcdThENDRcdTZFOTAgKC9hc3NldHMvbGF5b3V0LylcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW2Nkbi1hc3NldHNdJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1tjZG4tYXNzZXRzXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW2Nkbi1hc3NldHNdJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1tjZG4tYXNzZXRzXScsIC4uLmFyZ3MpLFxufTtcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuZXhwb3J0IGludGVyZmFjZSBDZG5Bc3NldHNQbHVnaW5PcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NTk4MiAnYWRtaW4tYXBwJ1x1RkYwOVxuICAgKi9cbiAgYXBwTmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4IENETiBcdTUyQTBcdTkwMUZcdUZGMDhcdTlFRDhcdThCQTRcdUZGMUFcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTU0MkZcdTc1MjhcdUZGMDlcbiAgICovXG4gIGVuYWJsZWQ/OiBib29sZWFuO1xuICAvKipcbiAgICogQ0ROIFx1NTdERlx1NTQwRFx1RkYwOFx1OUVEOFx1OEJBNFx1RkYxQWFsbC5iZWxsaXMuY29tLmNuXHVGRjA5XG4gICAqL1xuICBjZG5Eb21haW4/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQ0ROIFx1OEQ0NFx1NkU5MFx1NTJBMFx1OTAxRlx1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2RuQXNzZXRzUGx1Z2luKG9wdGlvbnM6IENkbkFzc2V0c1BsdWdpbk9wdGlvbnMpOiBQbHVnaW4ge1xuICBjb25zdCB7XG4gICAgYXBwTmFtZSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTlFRDhcdThCQTRcdTU0MkZcdTc1MjhcdTY3NjFcdTRFRjZcdTVGQzVcdTk4N0JcdTY2MEVcdTc4NkVcdTY4QzBcdTY3RTUgRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXG4gICAgLy8gXHU1OTgyXHU2NzlDIEVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OIFx1ODhBQlx1OEJCRVx1N0Y2RVx1NEUzQSAnZmFsc2UnXHVGRjBDXHU1MjE5XHU3OTgxXHU3NTI4IENETlxuICAgIC8vIFx1NTNFQVx1NjcwOVx1NTcyOFx1NjYwRVx1Nzg2RVx1NTQyRlx1NzUyOFx1RkYwOEVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OPXRydWVcdUZGMDlcdTYyMTZcdTY3MkFcdThCQkVcdTdGNkVcdTRFMTRcdTY2MkZcdTc1MUZcdTRFQTdcdTY3ODRcdTVFRkFcdTY1RjZcdUZGMENcdTYyNERcdTU0MkZcdTc1MjggQ0ROXG4gICAgZW5hYmxlZCA9IHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OID09PSAndHJ1ZScgfHwgXG4gICAgICAgICAgICAgIChwcm9jZXNzLmVudi5FTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiAhPT0gJ2ZhbHNlJyAmJiBcbiAgICAgICAgICAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgJiYgXG4gICAgICAgICAgICAgICBwcm9jZXNzLmVudi5WSVRFX1BSRVZJRVcgIT09ICd0cnVlJyksXG4gICAgY2RuRG9tYWluID0gJ2h0dHBzOi8vYWxsLmJlbGxpcy5jb20uY24nLFxuICB9ID0gb3B0aW9ucztcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjZG4tYXNzZXRzJyxcbiAgICBhcHBseTogJ2J1aWxkJyxcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGBbY2RuLWFzc2V0c10gQ0ROIFx1NTJBMFx1OTAxRlx1NURGMlx1NTQyRlx1NzUyOFx1RkYwQ1x1NUU5NFx1NzUyODogJHthcHBOYW1lfSwgQ0ROIFx1NTdERlx1NTQwRDogJHtjZG5Eb21haW59YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtjZG4tYXNzZXRzXSBDRE4gXHU1MkEwXHU5MDFGXHU1REYyXHU3OTgxXHU3NTI4YCk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0cmFuc2Zvcm1JbmRleEh0bWw6IHtcbiAgICAgIG9yZGVyOiAncG9zdCcsIC8vIFx1NTcyOCBhZGRWZXJzaW9uUGx1Z2luIFx1NEU0Qlx1NTQwRVx1NjI2N1x1ODg0Q1xuICAgICAgaGFuZGxlcihodG1sKSB7XG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTM3M1x1NEY3RiBDRE4gXHU2M0QyXHU0RUY2XHU4OEFCXHU3OTgxXHU3NTI4XHVGRjBDXHU1OTgyXHU2NzlDXHU2NjJGXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHVGRjBDXHU0RTVGXHU5NzAwXHU4OTgxXHU2Q0U4XHU1MTY1XHU2NUU5XHU2NzFGIFVSTCBcdThGNkNcdTYzNjJcdTgxMUFcdTY3MkNcbiAgICAgICAgLy8gXHU1NkUwXHU0RTNBXHU5ODg0XHU4OUM4XHU3M0FGXHU1ODgzXHU1M0VGXHU4MEZEXHU0RjdGXHU3NTI4XHU0RTRCXHU1MjREXHU2Nzg0XHU1RUZBXHU3Njg0XHU1MzA1XHU1NDJCIENETiBVUkwgXHU3Njg0XHU0RUE3XHU3MjY5XG4gICAgICAgIGNvbnN0IGlzUHJldmlld0J1aWxkID0gcHJvY2Vzcy5lbnYuVklURV9QUkVWSUVXID09PSAndHJ1ZSc7XG4gICAgICAgIGNvbnN0IG5lZWRzRWFybHlDb252ZXJ0ZXIgPSBpc1ByZXZpZXdCdWlsZCAmJiAhZW5hYmxlZDtcbiAgICAgICAgXG4gICAgICAgIGlmICghZW5hYmxlZCAmJiAhbmVlZHNFYXJseUNvbnZlcnRlcikge1xuICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG5ld0h0bWwgPSBodG1sO1xuICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAvLyAxKSBcdTU5MDRcdTc0MDYgPHNjcmlwdCBzcmM+IFx1NjgwN1x1N0I3RVx1RkYwOFx1NEVDNVx1NTcyOCBDRE4gXHU1NDJGXHU3NTI4XHU2NUY2XHU4RjZDXHU2MzYyXHVGRjA5XG4gICAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShcbiAgICAgICAgICAgIC8oPHNjcmlwdFtePl0qXFxzK3NyYz1bXCInXSkoW15cIiddKykoW1wiJ11bXj5dKj4pL2csXG4gICAgICAgICAgICAobWF0Y2g6IHN0cmluZywgcHJlZml4OiBzdHJpbmcsIHNyYzogc3RyaW5nLCBzdWZmaXg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXHVGRjFBL2Fzc2V0cy94eHguanNcbiAgICAgICAgICAgICAgaWYgKHNyYy5zdGFydHNXaXRoKCcvYXNzZXRzLycpICYmICFzcmMuc3RhcnRzV2l0aCgnL2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59LyR7YXBwTmFtZX0ke3NyY31gO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NUUwM1x1NUM0MFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFx1RkYxQS9hc3NldHMvbGF5b3V0L3h4eC5qc1xuICAgICAgICAgICAgICBpZiAoc3JjLnN0YXJ0c1dpdGgoJy9hc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS9sYXlvdXQtYXBwJHtzcmN9YDtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMUEuL2Fzc2V0cy94eHguanMgXHU2MjE2IGFzc2V0cy94eHguanNcbiAgICAgICAgICAgICAgaWYgKHNyYy5zdGFydHNXaXRoKCcuL2Fzc2V0cy8nKSB8fCBzcmMuc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBzcmMuc3RhcnRzV2l0aCgnLi8nKSA/IHNyYy5zdWJzdHJpbmcoMikgOiBzcmM7XG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRQYXRoLnN0YXJ0c1dpdGgoJ2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vbGF5b3V0LWFwcC8ke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChub3JtYWxpemVkUGF0aC5zdGFydHNXaXRoKCdhc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vJHthcHBOYW1lfS8ke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAyKSBcdTU5MDRcdTc0MDYgPGxpbmsgaHJlZj4gXHU2ODA3XHU3QjdFXHVGRjA4Q1NTXHUzMDAxbW9kdWxlcHJlbG9hZCBcdTdCNDlcdUZGMDlcdUZGMDhcdTRFQzVcdTU3MjggQ0ROIFx1NTQyRlx1NzUyOFx1NjVGNlx1OEY2Q1x1NjM2Mlx1RkYwOVxuICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgICAvKDxsaW5rW14+XSpcXHMraHJlZj1bXCInXSkoW15cIiddKykoW1wiJ11bXj5dKj4pL2csXG4gICAgICAgICAgICAobWF0Y2g6IHN0cmluZywgcHJlZml4OiBzdHJpbmcsIGhyZWY6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXHVGRjFBL2Fzc2V0cy94eHguY3NzXG4gICAgICAgICAgICAgIGlmIChocmVmLnN0YXJ0c1dpdGgoJy9hc3NldHMvJykgJiYgIWhyZWYuc3RhcnRzV2l0aCgnL2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59LyR7YXBwTmFtZX0ke2hyZWZ9YDtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcdUZGMUEvYXNzZXRzL2xheW91dC94eHguY3NzXG4gICAgICAgICAgICAgIGlmIChocmVmLnN0YXJ0c1dpdGgoJy9hc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS9sYXlvdXQtYXBwJHtocmVmfWA7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XG4gICAgICAgICAgICAgIGlmIChocmVmLnN0YXJ0c1dpdGgoJy4vYXNzZXRzLycpIHx8IGhyZWYuc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBocmVmLnN0YXJ0c1dpdGgoJy4vJykgPyBocmVmLnN1YnN0cmluZygyKSA6IGhyZWY7XG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRQYXRoLnN0YXJ0c1dpdGgoJ2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vbGF5b3V0LWFwcC8ke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChub3JtYWxpemVkUGF0aC5zdGFydHNXaXRoKCdhc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vJHthcHBOYW1lfS8ke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAzKSBcdTU5MDRcdTc0MDYgPGltZyBzcmM+IFx1NjgwN1x1N0I3RVx1RkYwOFx1NEVDNVx1NTcyOCBDRE4gXHU1NDJGXHU3NTI4XHU2NUY2XHU4RjZDXHU2MzYyXHVGRjA5XG4gICAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShcbiAgICAgICAgICAgIC8oPGltZ1tePl0qXFxzK3NyYz1bXCInXSkoW15cIiddKykoW1wiJ11bXj5dKj4pL2csXG4gICAgICAgICAgICAobWF0Y2g6IHN0cmluZywgcHJlZml4OiBzdHJpbmcsIHNyYzogc3RyaW5nLCBzdWZmaXg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcdUZGMUEvYXNzZXRzL3h4eC5wbmdcbiAgICAgICAgICAgICAgaWYgKHNyYy5zdGFydHNXaXRoKCcvYXNzZXRzLycpICYmICFzcmMuc3RhcnRzV2l0aCgnL2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59LyR7YXBwTmFtZX0ke3NyY31gO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NUUwM1x1NUM0MFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFx1RkYxQS9hc3NldHMvbGF5b3V0L3h4eC5wbmdcbiAgICAgICAgICAgICAgaWYgKHNyYy5zdGFydHNXaXRoKCcvYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vbGF5b3V0LWFwcCR7c3JjfWA7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gNCkgXHU1OTA0XHU3NDA2XHU1MTg1XHU4MDU0XHU3Njg0IGltcG9ydCgpIFx1OEMwM1x1NzUyOFx1RkYwOFx1NTcyOCBIVE1MIFx1NkEyMVx1Njc3Rlx1NEUyRFx1RkYwOVxuICAgICAgICAvLyBcdTRGRUVcdTU5MEQgcWlhbmt1biBcdTZDRThcdTUxNjVcdTc2ODRcdTUxODVcdTgwNTQgaW1wb3J0KCcvYXNzZXRzL2luZGV4LXh4eC5qcycpXG4gICAgICAgIGNvbnN0IG9yaWdpbkV4cHIgPVxuICAgICAgICAgIGAoKHR5cGVvZiBfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXyE9PSd1bmRlZmluZWQnJiZfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXylgICtcbiAgICAgICAgICBgP25ldyBVUkwoX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18sKHR5cGVvZiBsb2NhdGlvbiE9PSd1bmRlZmluZWQnJiZsb2NhdGlvbi5vcmlnaW4pfHwnJykub3JpZ2luYCArXG4gICAgICAgICAgYDooKHR5cGVvZiBsb2NhdGlvbiE9PSd1bmRlZmluZWQnJiZsb2NhdGlvbi5vcmlnaW4pfHwnJykpYDtcbiAgICAgICAgXG4gICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgL2ltcG9ydFxcKFxccyooWydcIl0pKFxcL2Fzc2V0c1xcLyhpbmRleHxtYWluKS1bXidcIl0rKVxcMVxccypcXCkvZyxcbiAgICAgICAgICAoX206IHN0cmluZywgX3E6IHN0cmluZywgYWJzUGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAvLyBcdTRGRERcdTYzMDFcdTUzOUZcdTY3MDlcdTkwM0JcdThGOTFcdUZGMENcdTRGNDZcdTc4NkVcdTRGRERcdThERUZcdTVGODRcdTZCNjNcdTc4NkVcbiAgICAgICAgICAgIHJldHVybiBgaW1wb3J0KC8qIEB2aXRlLWlnbm9yZSAqLyAoJHtvcmlnaW5FeHByfSArICcke2Fic1BhdGh9JykpYDtcbiAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIDUpIFx1NkNFOFx1NTE2NVx1OEQ0NFx1NkU5MFx1NTJBMFx1OEY3RFx1NTY2OFx1NTIxRFx1NTlDQlx1NTMxNlx1ODExQVx1NjcyQ1x1NTQ4Q1x1NjVFOVx1NjcxRiBVUkwgXHU4RjZDXHU2MzYyXHU4MTFBXHU2NzJDXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTM3M1x1NEY3RiBDRE4gXHU2M0QyXHU0RUY2XHU4OEFCXHU3OTgxXHU3NTI4XHVGRjBDXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHU2NUY2XHU0RTVGXHU5NzAwXHU4OTgxXHU2Q0U4XHU1MTY1XHU2NUU5XHU2NzFGIFVSTCBcdThGNkNcdTYzNjJcdTgxMUFcdTY3MkNcbiAgICAgICAgaWYgKCFuZXdIdG1sLmluY2x1ZGVzKCdfX0JUQ19SRVNPVVJDRV9MT0FERVJfXycpIHx8IG5lZWRzRWFybHlDb252ZXJ0ZXIpIHtcbiAgICAgICAgICAvLyBcdTY4MzlcdTYzNkUgRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU1MUIzXHU1QjlBXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4IENETlxuICAgICAgICAgIGNvbnN0IGNkbkVuYWJsZWQgPSBwcm9jZXNzLmVudi5FTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiAhPT0gJ2ZhbHNlJztcbiAgICAgICAgICBjb25zdCBpc1ByZXZpZXdCdWlsZCA9IHByb2Nlc3MuZW52LlZJVEVfUFJFVklFVyA9PT0gJ3RydWUnO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFx1NjVFOVx1NjcxRiBVUkwgXHU4RjZDXHU2MzYyXHU4MTFBXHU2NzJDXHVGRjA4XHU1NzI4XHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHU2NUY2XHU2Q0U4XHU1MTY1XHVGRjBDXHU3NTI4XHU0RThFXHU1NzI4IEhUTUwgXHU4OUUzXHU2NzkwXHU1MjREXHU4RjZDXHU2MzYyIENETiBVUkxcdUZGMDlcbiAgICAgICAgICAvLyBcdTUzNzNcdTRGN0YgQ0ROIFx1NjNEMlx1NEVGNlx1ODhBQlx1Nzk4MVx1NzUyOFx1RkYwQ1x1OTg4NFx1ODlDOFx1NzNBRlx1NTg4M1x1NEU1Rlx1NTNFRlx1ODBGRFx1NEY3Rlx1NzUyOFx1NTMwNVx1NTQyQiBDRE4gVVJMIFx1NzY4NFx1NjVFN1x1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVxuICAgICAgICAgIGNvbnN0IGVhcmx5VXJsQ29udmVydGVyU2NyaXB0ID0gaXNQcmV2aWV3QnVpbGQgPyBgXG48c2NyaXB0PlxuICAoZnVuY3Rpb24oKSB7XG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1NzI4IEhUTUwgXHU4OUUzXHU2NzkwXHU0RTRCXHU1MjREXHU1QzMxXHU1OTA0XHU3NDA2IENETiBVUkxcdUZGMENcdTkwN0ZcdTUxNERcdTZENEZcdTg5QzhcdTU2NjhcdThCRjdcdTZDNDIgQ0ROIFx1OEQ0NFx1NkU5MFxuICAgIC8vIFx1OEZEOVx1NEUyQVx1ODExQVx1NjcyQ1x1NUZDNVx1OTg3Qlx1NTcyOFx1NjI0MFx1NjcwOVx1NTE3Nlx1NEVENiBzY3JpcHQgXHU1NDhDIGxpbmsgXHU2ODA3XHU3QjdFXHU0RTRCXHU1MjREXHU2MjY3XHU4ODRDXG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnN0IGNvbnZlcnRDZG5VcmwgPSAodXJsKSA9PiB7XG4gICAgICAgIGlmICghdXJsIHx8ICghdXJsLnN0YXJ0c1dpdGgoJ2h0dHA6Ly8nKSAmJiAhdXJsLnN0YXJ0c1dpdGgoJ2h0dHBzOi8vJykpKSB7XG4gICAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHVybE9iaiA9IG5ldyBVUkwodXJsKTtcbiAgICAgICAgICBpZiAodXJsT2JqLmhvc3RuYW1lLmluY2x1ZGVzKCdhbGwuYmVsbGlzLmNvbS5jbicpIHx8IFxuICAgICAgICAgICAgICB1cmxPYmouaG9zdG5hbWUuaW5jbHVkZXMoJ2JlbGxpczEub3NzLWNuLXNoZW56aGVuLmFsaXl1bmNzLmNvbScpKSB7XG4gICAgICAgICAgICAvLyBcdTYzRDBcdTUzRDZcdThERUZcdTVGODRcdTkwRThcdTUyMDZcdUZGMENcdTUzQkJcdTYzODlcdTVFOTRcdTc1MjhcdTUyNERcdTdGMDBcbiAgICAgICAgICAgIGxldCBwYXRoID0gdXJsT2JqLnBhdGhuYW1lO1xuICAgICAgICAgICAgaWYgKHBhdGguaW5jbHVkZXMoJy9hc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgcGF0aCA9IHBhdGguc3Vic3RyaW5nKHBhdGguaW5kZXhPZignL2Fzc2V0cy8nKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhdGguaW5jbHVkZXMoJy9hc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgIHBhdGggPSBwYXRoLnN1YnN0cmluZyhwYXRoLmluZGV4T2YoJy9hc3NldHMvbGF5b3V0LycpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NEZERFx1NzU1OVx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1NTQ4Q1x1NTRDOFx1NUUwQ1xuICAgICAgICAgICAgcmV0dXJuIHBhdGggKyAodXJsT2JqLnNlYXJjaCB8fCAnJykgKyAodXJsT2JqLmhhc2ggfHwgJycpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIFVSTCBcdTg5RTNcdTY3OTBcdTU5MzFcdThEMjVcdUZGMENcdThGRDRcdTU2REVcdTUzOUYgVVJMXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgIH07XG4gICAgICBcbiAgICAgIC8vIFx1NjJFNlx1NjIyQSBkb2N1bWVudC5jcmVhdGVFbGVtZW50XHVGRjBDXHU1NzI4XHU1MjFCXHU1RUZBIHNjcmlwdCBcdTU0OEMgbGluayBcdTY4MDdcdTdCN0VcdTY1RjZcdThGNkNcdTYzNjIgVVJMXG4gICAgICBjb25zdCBvcmlnaW5hbENyZWF0ZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50LmJpbmQoZG9jdW1lbnQpO1xuICAgICAgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCA9IGZ1bmN0aW9uKHRhZ05hbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IG9yaWdpbmFsQ3JlYXRlRWxlbWVudCh0YWdOYW1lLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKHRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3NjcmlwdCcgfHwgdGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnbGluaycpIHtcbiAgICAgICAgICBjb25zdCBvcmlnaW5hbFNldEF0dHJpYnV0ZSA9IGVsZW1lbnQuc2V0QXR0cmlidXRlLmJpbmQoZWxlbWVudCk7XG4gICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKChuYW1lID09PSAnc3JjJyB8fCBuYW1lID09PSAnaHJlZicpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgY29uc3QgY29udmVydGVkVXJsID0gY29udmVydENkblVybCh2YWx1ZSk7XG4gICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFNldEF0dHJpYnV0ZShuYW1lLCBjb252ZXJ0ZWRVcmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsU2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgICAgfTtcbiAgICAgIFxuICAgICAgLy8gXHU1OTA0XHU3NDA2XHU1REYyXHU1QjU4XHU1NzI4XHU3Njg0IHNjcmlwdCBcdTU0OEMgbGluayBcdTY4MDdcdTdCN0VcdUZGMDhcdTU5ODJcdTY3OUMgRE9NIFx1NURGMlx1N0VDRlx1OTBFOFx1NTIwNlx1ODlFM1x1Njc5MFx1RkYwOVxuICAgICAgY29uc3QgcHJvY2Vzc0V4aXN0aW5nVGFncyA9ICgpID0+IHtcbiAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwpIHtcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbc3JjXScpLmZvckVhY2goKHNjcmlwdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3JjID0gc2NyaXB0LmdldEF0dHJpYnV0ZSgnc3JjJyk7XG4gICAgICAgICAgICBpZiAoc3JjKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRlZFVybCA9IGNvbnZlcnRDZG5Vcmwoc3JjKTtcbiAgICAgICAgICAgICAgaWYgKGNvbnZlcnRlZFVybCAhPT0gc3JjKSB7XG4gICAgICAgICAgICAgICAgc2NyaXB0LnNldEF0dHJpYnV0ZSgnc3JjJywgY29udmVydGVkVXJsKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpbmtbaHJlZl0nKS5mb3JFYWNoKChsaW5rKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBocmVmID0gbGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICAgICAgICAgIGlmIChocmVmKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRlZFVybCA9IGNvbnZlcnRDZG5VcmwoaHJlZik7XG4gICAgICAgICAgICAgIGlmIChjb252ZXJ0ZWRVcmwgIT09IGhyZWYpIHtcbiAgICAgICAgICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZSgnaHJlZicsIGNvbnZlcnRlZFVybCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgLy8gXHU3QUNCXHU1MzczXHU1OTA0XHU3NDA2XHVGRjA4XHU1OTgyXHU2NzlDIERPTSBcdTVERjJcdTdFQ0ZcdTkwRThcdTUyMDZcdTg5RTNcdTY3OTBcdUZGMDlcbiAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2ludGVyYWN0aXZlJykge1xuICAgICAgICBwcm9jZXNzRXhpc3RpbmdUYWdzKCk7XG4gICAgICAgIC8vIFx1NzZEMVx1NTQyQyBET00gXHU1M0Q4XHU1MzE2XHVGRjBDXHU1OTA0XHU3NDA2XHU1NDBFXHU3RUVEXHU2REZCXHU1MkEwXHU3Njg0XHU2ODA3XHU3QjdFXG4gICAgICAgIGlmIChkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHByb2Nlc3NFeGlzdGluZ1RhZ3MpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9jZXNzRXhpc3RpbmdUYWdzKCk7XG4gICAgICB9XG4gICAgfVxuICB9KSgpO1xuPC9zY3JpcHQ+YCA6ICcnO1xuICAgICAgICAgIFxuICAgICAgICAgIGNvbnN0IGxvYWRlclNjcmlwdCA9IGBcbjxzY3JpcHQ+XG4gIChmdW5jdGlvbigpIHtcbiAgICAvLyBcdThENDRcdTZFOTBcdTUyQTBcdThGN0RcdTU2NjhcdTVDMDZcdTU3MjhcdThGRDBcdTg4NENcdTY1RjZcdTZBMjFcdTU3NTdcdTRFMkRcdTUyMURcdTU5Q0JcdTUzMTZcbiAgICAvLyBcdThGRDlcdTkxQ0NcdTUzRUFcdThCQkVcdTdGNkVcdTU3RkFcdTc4NDBcdTkxNERcdTdGNkVcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHdpbmRvdy5fX0JUQ19DRE5fQ09ORklHX18gPSB7XG4gICAgICAgIGFwcE5hbWU6ICcke2FwcE5hbWV9JyxcbiAgICAgICAgY2RuRG9tYWluOiAnJHtjZG5Eb21haW59JyxcbiAgICAgICAgb3NzRG9tYWluOiAnaHR0cHM6Ly9iZWxsaXMxLm9zcy1jbi1zaGVuemhlbi5hbGl5dW5jcy5jb20nLFxuICAgICAgICBlbmFibGVkOiAke2NkbkVuYWJsZWR9XG4gICAgICB9O1xuICAgIH1cbiAgfSkoKTtcbjwvc2NyaXB0PmA7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gXHU1NzI4IDwvaGVhZD4gXHU0RTRCXHU1MjREXHU2Q0U4XHU1MTY1XHVGRjA4XHU2NUU5XHU2NzFGIFVSTCBcdThGNkNcdTYzNjJcdTgxMUFcdTY3MkNcdTVGQzVcdTk4N0JcdTU3MjhcdTY3MDBcdTUyNERcdTk3NjJcdUZGMENcdTU3MjhcdTYyNDBcdTY3MDlcdTUxNzZcdTRFRDYgc2NyaXB0IFx1NTQ4QyBsaW5rIFx1NjgwN1x1N0I3RVx1NEU0Qlx1NTI0RFx1RkYwOVxuICAgICAgICAgIGlmIChuZXdIdG1sLmluY2x1ZGVzKCc8L2hlYWQ+JykpIHtcbiAgICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NjVFOVx1NjcxRiBVUkwgXHU4RjZDXHU2MzYyXHU4MTFBXHU2NzJDXHU1RkM1XHU5ODdCXHU1NzI4IDxoZWFkPiBcdTc2ODRcdTY3MDBcdTUyNERcdTk3NjJcdUZGMENcdTU3MjhcdTYyNDBcdTY3MDlcdTUxNzZcdTRFRDZcdTY4MDdcdTdCN0VcdTRFNEJcdTUyNERcbiAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NURGMlx1N0VDRlx1NjcwOVx1NTE3Nlx1NEVENiBzY3JpcHQgXHU2ODA3XHU3QjdFXHVGRjBDXHU1NzI4XHU3QjJDXHU0RTAwXHU0RTJBIHNjcmlwdCBcdTY4MDdcdTdCN0VcdTRFNEJcdTUyNERcdTYzRDJcdTUxNjVcbiAgICAgICAgICAgIGlmIChlYXJseVVybENvbnZlcnRlclNjcmlwdCAmJiBuZXdIdG1sLmluY2x1ZGVzKCc8c2NyaXB0JykpIHtcbiAgICAgICAgICAgICAgLy8gXHU1NzI4XHU3QjJDXHU0RTAwXHU0RTJBIDxzY3JpcHQ+IFx1NjIxNiA8bGluaz4gXHU2ODA3XHU3QjdFXHU0RTRCXHU1MjREXHU2M0QyXHU1MTY1XHU2NUU5XHU2NzFGXHU4RjZDXHU2MzYyXHU4MTFBXHU2NzJDXG4gICAgICAgICAgICAgIGNvbnN0IGZpcnN0VGFnTWF0Y2ggPSBuZXdIdG1sLm1hdGNoKC88KHNjcmlwdHxsaW5rKVtePl0qPi9pKTtcbiAgICAgICAgICAgICAgaWYgKGZpcnN0VGFnTWF0Y2ggJiYgZmlyc3RUYWdNYXRjaC5pbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwuc2xpY2UoMCwgZmlyc3RUYWdNYXRjaC5pbmRleCkgKyBlYXJseVVybENvbnZlcnRlclNjcmlwdCArIG5ld0h0bWwuc2xpY2UoZmlyc3RUYWdNYXRjaC5pbmRleCk7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOVx1NjI3RVx1NTIzMCBzY3JpcHQgXHU2MjE2IGxpbmsgXHU2ODA3XHU3QjdFXHVGRjBDXHU1NzI4IDwvaGVhZD4gXHU0RTRCXHU1MjREXHU2M0QyXHU1MTY1XG4gICAgICAgICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZSgnPC9oZWFkPicsIGAke2Vhcmx5VXJsQ29udmVydGVyU2NyaXB0fVxcbjwvaGVhZD5gKTtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NkNFOFx1NTE2NVx1OEQ0NFx1NkU5MFx1NTJBMFx1OEY3RFx1NTY2OFx1OTE0RFx1N0Y2RVx1ODExQVx1NjcyQ1xuICAgICAgICAgICAgaWYgKCFuZXdIdG1sLmluY2x1ZGVzKCdfX0JUQ19SRVNPVVJDRV9MT0FERVJfXycpKSB7XG4gICAgICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoJzwvaGVhZD4nLCBgJHtsb2FkZXJTY3JpcHR9XFxuPC9oZWFkPmApO1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChuZXdIdG1sLmluY2x1ZGVzKCc8L2JvZHk+JykpIHtcbiAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOSA8L2hlYWQ+XHVGRjBDXHU1NzI4IDwvYm9keT4gXHU0RTRCXHU1MjREXHU2Q0U4XHU1MTY1XG4gICAgICAgICAgICBpZiAoZWFybHlVcmxDb252ZXJ0ZXJTY3JpcHQpIHtcbiAgICAgICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZSgnPC9ib2R5PicsIGAke2Vhcmx5VXJsQ29udmVydGVyU2NyaXB0fVxcbjwvYm9keT5gKTtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFuZXdIdG1sLmluY2x1ZGVzKCdfX0JUQ19SRVNPVVJDRV9MT0FERVJfXycpKSB7XG4gICAgICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoJzwvYm9keT4nLCBgJHtsb2FkZXJTY3JpcHR9XFxuPC9ib2R5PmApO1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgY29uc29sZS5pbmZvKGBbY2RuLWFzc2V0c10gXHU1REYyXHU0RTNBIGluZGV4Lmh0bWwgXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU4RjZDXHU2MzYyXHU0RTNBIENETiBVUkxgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG5ld0h0bWw7XG4gICAgICB9LFxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcY2RuLWltcG9ydC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9jZG4taW1wb3J0LnRzXCI7LyoqXG4gKiBDRE4gXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU4RjZDXHU2MzYyXHU2M0QyXHU0RUY2XG4gKiBcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdThGNkNcdTYzNjJcdTRFRTNcdTc4MDFcdTRFMkRcdTc2ODQgaW1wb3J0KCkgXHU4QzAzXHU3NTI4XHVGRjBDXHU1QzA2XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHU4RjZDXHU2MzYyXHU0RTNBIENETiBVUkxcbiAqIFx1NEUwRSBjZG5Bc3NldHNQbHVnaW4gXHU5MTREXHU1NDA4XHVGRjBDXHU1QjlFXHU3M0IwXHU1QjhDXHU2NTc0XHU3Njg0IENETiBcdTUyQTBcdTkwMUZcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW2Nkbi1pbXBvcnRdJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1tjZG4taW1wb3J0XScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW2Nkbi1pbXBvcnRdJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1tjZG4taW1wb3J0XScsIC4uLmFyZ3MpLFxufTtcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuZXhwb3J0IGludGVyZmFjZSBDZG5JbXBvcnRQbHVnaW5PcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NTk4MiAnbG9naXN0aWNzLWFwcCdcdUZGMDlcbiAgICovXG4gIGFwcE5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIFx1NjYyRlx1NTQyNlx1NTQyRlx1NzUyOCBDRE4gXHU1MkEwXHU5MDFGXHVGRjA4XHU5RUQ4XHU4QkE0XHVGRjFBXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU1NDJGXHU3NTI4XHVGRjA5XG4gICAqL1xuICBlbmFibGVkPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIENETiBcdTU3REZcdTU0MERcdUZGMDhcdTlFRDhcdThCQTRcdUZGMUFhbGwuYmVsbGlzLmNvbS5jblx1RkYwOVxuICAgKi9cbiAgY2RuRG9tYWluPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIENETiBcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdThGNkNcdTYzNjJcdTYzRDJcdTRFRjZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNkbkltcG9ydFBsdWdpbihvcHRpb25zOiBDZG5JbXBvcnRQbHVnaW5PcHRpb25zKTogUGx1Z2luIHtcbiAgY29uc3Qge1xuICAgIGFwcE5hbWUsXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU5RUQ4XHU4QkE0XHU1NDJGXHU3NTI4XHU2NzYxXHU0RUY2XHU1RkM1XHU5ODdCXHU2NjBFXHU3ODZFXHU2OEMwXHU2N0U1IEVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OIFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlxuICAgIC8vIFx1NTk4Mlx1Njc5QyBFTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiBcdTg4QUJcdThCQkVcdTdGNkVcdTRFM0EgJ2ZhbHNlJ1x1RkYwQ1x1NTIxOVx1Nzk4MVx1NzUyOCBDRE5cbiAgICAvLyBcdTUzRUFcdTY3MDlcdTU3MjhcdTY2MEVcdTc4NkVcdTU0MkZcdTc1MjhcdUZGMDhFTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTj10cnVlXHVGRjA5XHU2MjE2XHU2NzJBXHU4QkJFXHU3RjZFXHU0RTE0XHU2NjJGXHU3NTFGXHU0RUE3XHU2Nzg0XHU1RUZBXHU2NUY2XHVGRjBDXHU2MjREXHU1NDJGXHU3NTI4IENETlxuICAgIGVuYWJsZWQgPSBwcm9jZXNzLmVudi5FTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiA9PT0gJ3RydWUnIHx8IFxuICAgICAgICAgICAgICAocHJvY2Vzcy5lbnYuRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gIT09ICdmYWxzZScgJiYgXG4gICAgICAgICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nICYmIFxuICAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuVklURV9QUkVWSUVXICE9PSAndHJ1ZScpLFxuICAgIGNkbkRvbWFpbiA9ICdodHRwczovL2FsbC5iZWxsaXMuY29tLmNuJyxcbiAgfSA9IG9wdGlvbnM7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY2RuLWltcG9ydCcsXG4gICAgYXBwbHk6ICdidWlsZCcsXG4gICAgYnVpbGRTdGFydCgpIHtcbiAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW2Nkbi1pbXBvcnRdIENETiBcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdThGNkNcdTYzNjJcdTVERjJcdTU0MkZcdTc1MjhcdUZGMENcdTVFOTRcdTc1Mjg6ICR7YXBwTmFtZX0sIENETiBcdTU3REZcdTU0MEQ6ICR7Y2RuRG9tYWlufWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGBbY2RuLWltcG9ydF0gQ0ROIFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1OEY2Q1x1NjM2Mlx1NURGMlx1Nzk4MVx1NzUyOGApO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVuZGVyQ2h1bmsoY29kZTogc3RyaW5nLCBjaHVuazogYW55KSB7XG4gICAgICAvLyBcdTU3MjggcmVuZGVyQ2h1bmsgXHU5NjM2XHU2QkI1XHU1OTA0XHU3NDA2XHU2Nzg0XHU1RUZBXHU1NDBFXHU3Njg0XHU0RUUzXHU3ODAxXG4gICAgICAvLyBcdTZCNjRcdTY1RjYgaW1wb3J0KCkgXHU4QzAzXHU3NTI4XHU1REYyXHU3RUNGXHU4OEFCIFZpdGUgXHU4RjZDXHU2MzYyXHU0RTNBXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHU3Njg0IGNodW5rIFx1NjU4N1x1NEVGNlx1RkYwOFx1NTk4MiAuL2luZGV4LXh4eC5qc1x1RkYwOVxuICAgICAgaWYgKCFlbmFibGVkKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTUzRUFcdTU5MDRcdTc0MDYgSlMgY2h1bmsgXHU2NTg3XHU0RUY2XG4gICAgICBpZiAoIWNodW5rLmZpbGVOYW1lLmVuZHNXaXRoKCcuanMnKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU4REYzXHU4RkM3XHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XHVGRjA4aW5kZXgteHh4LmpzXHVGRjA5XHVGRjBDXHU1NkUwXHU0RTNBXHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XHU2NjJGXHU5MDFBXHU4RkM3IHNjcmlwdCBcdTY4MDdcdTdCN0VcdTc2RjRcdTYzQTVcdTUyQTBcdThGN0RcdTc2ODRcdUZGMENcdTVERjJcdTU3MjggSFRNTCBcdTRFMkRcdTU5MDRcdTc0MDZcbiAgICAgIGlmIChjaHVuay5pc0VudHJ5IHx8IGNodW5rLmZpbGVOYW1lLm1hdGNoKC9eaW5kZXgtW2EtekEtWjAtOV0rXFwuanMkLykpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuICAgICAgbGV0IG5ld0NvZGUgPSBjb2RlO1xuXG4gICAgICAvLyBcdTUzMzlcdTkxNEQgaW1wb3J0KCkgXHU4QzAzXHU3NTI4XHVGRjBDXHU4QkM2XHU1MjJCXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHU3Njg0XHU4RDQ0XHU2RTkwXG4gICAgICAvLyBcdTUzMzlcdTkxNERcdTZBMjFcdTVGMEZcdUZGMUFpbXBvcnQoJy4uLicpIFx1NjIxNiBpbXBvcnQoXCIuLi5cIilcbiAgICAgIGNvbnN0IGltcG9ydFBhdHRlcm4gPSAvaW1wb3J0XFxzKlxcKFxccyooWydcIl0pKFteJ1wiXSspXFwxXFxzKlxcKS9nO1xuXG4gICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKGltcG9ydFBhdHRlcm4sIChtYXRjaDogc3RyaW5nLCBxdW90ZTogc3RyaW5nLCBzcGVjaWZpZXI6IHN0cmluZykgPT4ge1xuICAgICAgICAvLyBcdTUzRUFcdTU5MDRcdTc0MDZcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMDguL3h4eC5qc1x1RkYwOVx1NTQ4QyAvYXNzZXRzLyBcdThERUZcdTVGODRcbiAgICAgICAgLy8gXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA4aHR0cDovL1x1MzAwMWh0dHBzOi8vXHVGRjA5XHU1NDhDIG5vZGVfbW9kdWxlcyBcdThERUZcdTVGODRcdTRFMERcdTU5MDRcdTc0MDZcbiAgICAgICAgY29uc3QgaXNSZWxhdGl2ZVBhdGggPSBzcGVjaWZpZXIuc3RhcnRzV2l0aCgnLi8nKTtcbiAgICAgICAgY29uc3QgaXNBc3NldHNQYXRoID0gc3BlY2lmaWVyLnN0YXJ0c1dpdGgoJy9hc3NldHMvJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWlzUmVsYXRpdmVQYXRoICYmICFpc0Fzc2V0c1BhdGgpIHtcbiAgICAgICAgICByZXR1cm4gbWF0Y2g7IC8vIFx1OTc1RVx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1NEUxNFx1OTc1RSAvYXNzZXRzLyBcdThERUZcdTVGODRcdUZGMENcdTRGRERcdTYzMDFcdTUzOUZcdTY4MzdcbiAgICAgICAgfVxuXG4gICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcblxuICAgICAgICAvLyBcdTg5QzRcdTgzMDNcdTUzMTZcdThERUZcdTVGODRcbiAgICAgICAgbGV0IG5vcm1hbGl6ZWRQYXRoOiBzdHJpbmc7XG4gICAgICAgIGlmIChpc1JlbGF0aXZlUGF0aCkge1xuICAgICAgICAgIC8vIFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYxQS4vaW5kZXgteHh4LmpzIC0+IC9hc3NldHMvaW5kZXgteHh4LmpzXG4gICAgICAgICAgLy8gXHU2MjE2XHU4MDA1XHVGRjFBLi9hc3NldHMveHh4LmpzIC0+IC9hc3NldHMveHh4LmpzXG4gICAgICAgICAgaWYgKHNwZWNpZmllci5zdGFydHNXaXRoKCcuL2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgbm9ybWFsaXplZFBhdGggPSAnLycgKyBzcGVjaWZpZXIuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBWaXRlIGNodW5rIFx1NjU4N1x1NEVGNlx1RkYxQS4vaW5kZXgteHh4LmpzIC0+IC9hc3NldHMvaW5kZXgteHh4LmpzXG4gICAgICAgICAgICBub3JtYWxpemVkUGF0aCA9ICcvYXNzZXRzLycgKyBzcGVjaWZpZXIuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBcdTVERjJcdTdFQ0ZcdTY2MkZcdTdFRERcdTVCRjlcdThERUZcdTVGODQgL2Fzc2V0cy94eHguanNcbiAgICAgICAgICBub3JtYWxpemVkUGF0aCA9IHNwZWNpZmllcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1NTIyNFx1NjVBRFx1NjYyRlx1NTQyNlx1NjYyRlx1NUUwM1x1NUM0MFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFxuICAgICAgICBjb25zdCBpc0xheW91dFJlc291cmNlID0gbm9ybWFsaXplZFBhdGguaW5jbHVkZXMoJy9hc3NldHMvbGF5b3V0LycpO1xuXG4gICAgICAgIC8vIFx1NzUxRlx1NjIxMCBDRE4gVVJMXG4gICAgICAgIGxldCBjZG5Vcmw6IHN0cmluZztcbiAgICAgICAgaWYgKGlzTGF5b3V0UmVzb3VyY2UpIHtcbiAgICAgICAgICAvLyBcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcbiAgICAgICAgICBjZG5VcmwgPSBgJHtjZG5Eb21haW59L2xheW91dC1hcHAke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gXHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXG4gICAgICAgICAgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS8ke2FwcE5hbWV9JHtub3JtYWxpemVkUGF0aH1gO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU4RjZDXHU2MzYyXHU0RTNBIENETiBVUkxcbiAgICAgICAgcmV0dXJuIGBpbXBvcnQoJHtxdW90ZX0ke2NkblVybH0ke3F1b3RlfSlgO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtjZG4taW1wb3J0XSBcdTVERjJcdThGNkNcdTYzNjIgY2h1bmsgJHtjaHVuay5maWxlTmFtZX0gXHU0RTJEXHU3Njg0XHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU0RTNBIENETiBVUkxgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1vZGlmaWVkID8geyBjb2RlOiBuZXdDb2RlLCBtYXA6IG51bGwgfSA6IG51bGw7XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxyZXNvbHZlLWJ0Yy1pbXBvcnRzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3Jlc29sdmUtYnRjLWltcG9ydHMudHNcIjsvKipcbiAqIFx1ODlFM1x1Njc5MCBAYnRjLyogXHU1MzA1XHU1QkZDXHU1MTY1XHU2M0QyXHU0RUY2XG4gKiBcdTU5MDRcdTc0MDZcdTRFQ0VcdTVERjJcdTY3ODRcdTVFRkFcdTc2ODRcdTUzMDVcdUZGMDhcdTU5ODIgc2hhcmVkLWNvcmUvZGlzdC9pbmRleC5tanNcdUZGMDlcdTRFMkRcdTVCRkNcdTUxNjVcdTc2ODQgQGJ0Yy8qIFx1NkEyMVx1NTc1N1xuICogXHU1NDBDXHU2NUY2XHU1OTA0XHU3NDA2IHNoYXJlZC1jb21wb25lbnRzIFx1NTE4NVx1OTBFOFx1NEY3Rlx1NzUyOFx1NzY4NFx1NTIyQlx1NTQwRFx1RkYwOFx1NTk4MiBAYnRjLWNvbXBvbmVudHMsIEBidGMtY29tbW9uIFx1N0I0OVx1RkYwOVxuICogXHU3ODZFXHU0RkREIFJvbGx1cCBcdTgwRkRcdTU5MUZcdTZCNjNcdTc4NkVcdTg5RTNcdTY3OTBcdThGRDlcdTRFOUJcdTVCRkNcdTUxNjVcdUZGMENcdTUzNzNcdTRGN0ZcdTVCODNcdTRFRUNcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTc2ODRcdTUzMDVcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU1NkUwXHU0RTNBIGVzYnVpbGQgXHU2NUUwXHU2Q0Q1XHU2QjYzXHU3ODZFXHU4OUUzXHU2NzkwIHdvcmtzcGFjZSBcdTUzMDVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcdUZGMENcdTkwN0ZcdTUxNERcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdTc2ODRcdTg5RTNcdTY3OTBcdTk1RUVcdTk4OThcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1tyZXNvbHZlLWJ0Yy1pbXBvcnRzXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbcmVzb2x2ZS1idGMtaW1wb3J0c10nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1tyZXNvbHZlLWJ0Yy1pbXBvcnRzXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbcmVzb2x2ZS1idGMtaW1wb3J0c10nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyBjcmVhdGVQYXRoSGVscGVycyB9IGZyb20gJy4uL3V0aWxzL3BhdGgtaGVscGVycyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzb2x2ZUJ0Y0ltcG9ydHNPcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICAgKi9cbiAgYXBwRGlyOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdTU0MkZcdTc1MjhcdUZGMDhcdTlFRDhcdThCQTRcdUZGMUF0cnVlXHVGRjA5XG4gICAqL1xuICBlbmFibGVkPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBcdTg5RTNcdTY3OTAgQGJ0Yy8qIFx1NTMwNVx1NUJGQ1x1NTE2NVx1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUJ0Y0ltcG9ydHNQbHVnaW4ob3B0aW9uczogUmVzb2x2ZUJ0Y0ltcG9ydHNPcHRpb25zKTogUGx1Z2luIHtcbiAgY29uc3QgeyBhcHBEaXIsIGVuYWJsZWQgPSB0cnVlIH0gPSBvcHRpb25zO1xuXG4gIGlmICghZW5hYmxlZCkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAncmVzb2x2ZS1idGMtaW1wb3J0cycsXG4gICAgICBhcHBseTogJ2J1aWxkJyxcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgeyB3aXRoUGFja2FnZXMsIHdpdGhSb290LCB3aXRoQ29uZmlncyB9ID0gY3JlYXRlUGF0aEhlbHBlcnMoYXBwRGlyKTtcblxuICAvKipcbiAgICogXHU2OEMwXHU2N0U1XHU1QkZDXHU1MTY1XHU2NjJGXHU1NDI2XHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU3Njg0XHU1MzA1XHU2MjE2IHNoYXJlZC1jb21wb25lbnRzIFx1NkU5MFx1NzgwMVxuICAgKi9cbiAgZnVuY3Rpb24gaXNGcm9tQnVpbHRQYWNrYWdlT3JTaGFyZWRDb21wb25lbnRzKGltcG9ydGVyPzogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCFpbXBvcnRlcikgcmV0dXJuIGZhbHNlO1xuICAgIFxuICAgIC8vIFx1Njc2NVx1ODFFQVx1NURGMlx1Njc4NFx1NUVGQVx1NzY4NFx1NTMwNVx1RkYwOFx1NTk4MiBzaGFyZWQtY29yZS9kaXN0L2luZGV4Lm1qc1x1RkYwOVxuICAgIGNvbnN0IGlzRnJvbUJ1aWx0UGFja2FnZSA9IChcbiAgICAgIGltcG9ydGVyLmluY2x1ZGVzKCcvZGlzdC8nKSB8fFxuICAgICAgaW1wb3J0ZXIuaW5jbHVkZXMoJ1xcXFxkaXN0XFxcXCcpIHx8XG4gICAgICAoaW1wb3J0ZXIuZW5kc1dpdGgoJy5tanMnKSAmJiAhaW1wb3J0ZXIuaW5jbHVkZXMoJy9zcmMvJykpIHx8XG4gICAgICAoaW1wb3J0ZXIuZW5kc1dpdGgoJy5qcycpICYmICFpbXBvcnRlci5pbmNsdWRlcygnL3NyYy8nKSAmJiAhaW1wb3J0ZXIuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKVxuICAgICk7XG4gICAgXG4gICAgLy8gXHU2NzY1XHU4MUVBIHNoYXJlZC1jb21wb25lbnRzIFx1NkU5MFx1NzgwMVx1RkYwOFx1OTcwMFx1ODk4MVx1ODlFM1x1Njc5MFx1NTE4NVx1OTBFOFx1NTIyQlx1NTQwRFx1RkYwOVxuICAgIGNvbnN0IGlzRnJvbVNoYXJlZENvbXBvbmVudHMgPSBpbXBvcnRlci5pbmNsdWRlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjJyk7XG4gICAgXG4gICAgcmV0dXJuIGlzRnJvbUJ1aWx0UGFja2FnZSB8fCBpc0Zyb21TaGFyZWRDb21wb25lbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1Nzg2RVx1NEZERFx1OERFRlx1NUY4NFx1NjcwOVx1NkI2M1x1Nzg2RVx1NzY4NFx1NjI2OVx1NUM1NVx1NTQwRFxuICAgKiBcdTU5ODJcdTY3OUNcdThERUZcdTVGODRcdTZDQTFcdTY3MDlcdTYyNjlcdTVDNTVcdTU0MERcdUZGMENcdTVDMURcdThCRDVcdTZERkJcdTUyQTBcdTVFMzhcdTg5QzFcdTc2ODRcdTYyNjlcdTVDNTVcdTU0MERcbiAgICovXG4gIGZ1bmN0aW9uIGVuc3VyZUZpbGVFeHRlbnNpb24oZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gXHU1OTgyXHU2NzlDXHU4REVGXHU1Rjg0XHU1REYyXHU3RUNGXHU2NzA5XHU2MjY5XHU1QzU1XHU1NDBEXHVGRjBDXHU3NkY0XHU2M0E1XHU4RkQ0XHU1NkRFXG4gICAgaWYgKC9cXC4odHN8dHN4fGpzfGpzeHx2dWV8anNvbnxjc3N8c2Nzc3xzYXNzfGxlc3MpJC9pLnRlc3QoZmlsZVBhdGgpKSB7XG4gICAgICByZXR1cm4gZmlsZVBhdGg7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NjMwOVx1NEYxOFx1NTE0OFx1N0VBN1x1NUMxRFx1OEJENVx1NkRGQlx1NTJBMFx1NjI2OVx1NUM1NVx1NTQwRFx1RkYxQS50c3gsIC50cywgLmpzeCwgLmpzXG4gICAgY29uc3QgZXh0ZW5zaW9ucyA9IFsnLnRzeCcsICcudHMnLCAnLmpzeCcsICcuanMnXTtcbiAgICBmb3IgKGNvbnN0IGV4dCBvZiBleHRlbnNpb25zKSB7XG4gICAgICBjb25zdCBwYXRoV2l0aEV4dCA9IGAke2ZpbGVQYXRofSR7ZXh0fWA7XG4gICAgICBpZiAoZXhpc3RzU3luYyhwYXRoV2l0aEV4dCkpIHtcbiAgICAgICAgcmV0dXJuIHBhdGhXaXRoRXh0O1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBcdTU5ODJcdTY3OUNcdTYyNDBcdTY3MDlcdTYyNjlcdTVDNTVcdTU0MERcdTkwRkRcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdThGRDRcdTU2REVcdTUzOUZcdThERUZcdTVGODRcdUZGMENcdThCQTkgVml0ZSBcdTc2ODRcdTYyNjlcdTVDNTVcdTU0MERcdTg5RTNcdTY3OTBcdTY3M0FcdTUyMzZcdTU5MDRcdTc0MDZcbiAgICByZXR1cm4gZmlsZVBhdGg7XG4gIH1cblxuICAvKipcbiAgICogXHU4OUUzXHU2NzkwIHNoYXJlZC1jb21wb25lbnRzIFx1NTE4NVx1OTBFOFx1NTIyQlx1NTQwRFxuICAgKi9cbiAgZnVuY3Rpb24gcmVzb2x2ZVNoYXJlZENvbXBvbmVudHNBbGlhcyhpZDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3QgeyB3aXRoUGFja2FnZXMgfSA9IGNyZWF0ZVBhdGhIZWxwZXJzKGFwcERpcik7XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IEBidGMtY29tcG9uZW50c1xuICAgIGlmIChpZCA9PT0gJ0BidGMtY29tcG9uZW50cycgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy1jb21wb25lbnRzLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGJ0Yy1jb21wb25lbnRzLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjLWNvbW1vblxuICAgIGlmIChpZCA9PT0gJ0BidGMtY29tbW9uJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjLWNvbW1vbi8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BidGMtY29tbW9uLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvY29tbW9uLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IEBidGMtY3J1ZFxuICAgIGlmIChpZCA9PT0gJ0BidGMtY3J1ZCcgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy1jcnVkLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGJ0Yy1jcnVkLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvY3J1ZC8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjLXN0eWxlc1xuICAgIGlmIChpZCA9PT0gJ0BidGMtc3R5bGVzJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjLXN0eWxlcy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BidGMtc3R5bGVzLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvc3R5bGVzLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IEBidGMtbG9jYWxlc1xuICAgIGlmIChpZCA9PT0gJ0BidGMtbG9jYWxlcycgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy1sb2NhbGVzLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGJ0Yy1sb2NhbGVzLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvbG9jYWxlcy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjLWFzc2V0cyBcdTU0OEMgQGFzc2V0c1xuICAgIGlmIChpZCA9PT0gJ0BidGMtYXNzZXRzJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjLWFzc2V0cy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BidGMtYXNzZXRzLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvYXNzZXRzLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgaWYgKGlkID09PSAnQGFzc2V0cycgfHwgaWQuc3RhcnRzV2l0aCgnQGFzc2V0cy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0Bhc3NldHMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9hc3NldHMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBcbiAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy11dGlsc1xuICAgIGlmIChpZCA9PT0gJ0BidGMtdXRpbHMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMtdXRpbHMvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAYnRjLXV0aWxzLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvdXRpbHMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBcbiAgICAvLyBcdTU5MDRcdTc0MDYgQHBsdWdpbnNcbiAgICBpZiAoaWQgPT09ICdAcGx1Z2lucycgfHwgaWQuc3RhcnRzV2l0aCgnQHBsdWdpbnMvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAcGx1Z2lucy8nLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL3BsdWdpbnMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBcbiAgICAvLyBcdTU5MDRcdTc0MDZcdTU2RkVcdTg4NjhcdTc2RjhcdTUxNzNcdTUyMkJcdTU0MERcdUZGMDhcdTYzMDlcdTRFQ0VcdTUxNzdcdTRGNTNcdTUyMzBcdTRFMDBcdTgyMkNcdTc2ODRcdTk4N0FcdTVFOEZcdUZGMDlcbiAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTUxNzdcdTRGNTNcdTc2ODRcdThERUZcdTVGODRcdTUyMkJcdTU0MERcdTVGQzVcdTk4N0JcdTU3MjhcdTkwMUFcdTc1MjhcdTUyMkJcdTU0MERcdTRFNEJcdTUyNERcdTY4QzBcdTY3RTVcbiAgICBpZiAoaWQgPT09ICdAY2hhcnRzLXV0aWxzL2Nzcy12YXInIHx8IGlkLnN0YXJ0c1dpdGgoJ0BjaGFydHMtdXRpbHMvY3NzLXZhci8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BjaGFydHMtdXRpbHMvY3NzLXZhcicsICcnKS5yZXBsYWNlKC9eXFwvLywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvY3NzLXZhciR7c3ViUGF0aCA/ICcvJyArIHN1YlBhdGggOiAnJ31gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgaWYgKGlkID09PSAnQGNoYXJ0cy11dGlscy9jb2xvcicgfHwgaWQuc3RhcnRzV2l0aCgnQGNoYXJ0cy11dGlscy9jb2xvci8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BjaGFydHMtdXRpbHMvY29sb3InLCAnJykucmVwbGFjZSgvXlxcLy8sICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzL2NvbG9yJHtzdWJQYXRoID8gJy8nICsgc3ViUGF0aCA6ICcnfWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBpZiAoaWQgPT09ICdAY2hhcnRzLXV0aWxzL2dyYWRpZW50JyB8fCBpZC5zdGFydHNXaXRoKCdAY2hhcnRzLXV0aWxzL2dyYWRpZW50LycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGNoYXJ0cy11dGlscy9ncmFkaWVudCcsICcnKS5yZXBsYWNlKC9eXFwvLywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvZ3JhZGllbnQke3N1YlBhdGggPyAnLycgKyBzdWJQYXRoIDogJyd9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gJ0BjaGFydHMtY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BjaGFydHMtY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAY2hhcnRzLWNvbXBvc2FibGVzL3VzZUNoYXJ0Q29tcG9uZW50JywgJycpLnJlcGxhY2UoL15cXC8vLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy9jb21wb3NhYmxlcy91c2VDaGFydENvbXBvbmVudCR7c3ViUGF0aCA/ICcvJyArIHN1YlBhdGggOiAnJ31gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgaWYgKGlkID09PSAnQGNoYXJ0cy10eXBlcycgfHwgaWQuc3RhcnRzV2l0aCgnQGNoYXJ0cy10eXBlcy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BjaGFydHMtdHlwZXMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdHlwZXMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBpZiAoaWQgPT09ICdAY2hhcnRzLXV0aWxzJyB8fCBpZC5zdGFydHNXaXRoKCdAY2hhcnRzLXV0aWxzLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGNoYXJ0cy11dGlscy8nLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gJ0BjaGFydHMtY29tcG9zYWJsZXMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BjaGFydHMtY29tcG9zYWJsZXMvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAY2hhcnRzLWNvbXBvc2FibGVzLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL2NvbXBvc2FibGVzLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgaWYgKGlkID09PSAnQGNoYXJ0cycgfHwgaWQuc3RhcnRzV2l0aCgnQGNoYXJ0cy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BjaGFydHMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3Jlc29sdmUtYnRjLWltcG9ydHMnLFxuICAgIGFwcGx5OiAnYnVpbGQnLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBjb25zb2xlLmluZm8oJ1tyZXNvbHZlLWJ0Yy1pbXBvcnRzXSBcdTVERjJcdTU0MkZcdTc1MjhcdUZGMENcdTVDMDZcdTg5RTNcdTY3OTBcdTRFQ0VcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDVcdTRFMkRcdTVCRkNcdTUxNjVcdTc2ODQgQGJ0Yy8qIFx1NkEyMVx1NTc1N1x1NTQ4QyBzaGFyZWQtY29tcG9uZW50cyBcdTUxODVcdTkwRThcdTUyMkJcdTU0MEQnKTtcbiAgICB9LFxuICAgIHJlc29sdmVJZChpZDogc3RyaW5nLCBpbXBvcnRlcj86IHN0cmluZykge1xuICAgICAgLy8gXHU2OEMwXHU2N0U1XHU1QkZDXHU1MTY1XHU2NjJGXHU1NDI2XHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU3Njg0XHU1MzA1XHU2MjE2IHNoYXJlZC1jb21wb25lbnRzIFx1NkU5MFx1NzgwMVxuICAgICAgY29uc3Qgc2hvdWxkUmVzb2x2ZSA9IGlzRnJvbUJ1aWx0UGFja2FnZU9yU2hhcmVkQ29tcG9uZW50cyhpbXBvcnRlcik7XG4gICAgICBcbiAgICAgIGlmICghc2hvdWxkUmVzb2x2ZSkge1xuICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTVCRkNcdTUxNjVcdTRFMERcdTY2MkZcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTc2ODRcdTUzMDVcdTYyMTYgc2hhcmVkLWNvbXBvbmVudHMgXHU2RTkwXHU3ODAxXHVGRjBDXHU4QkE5XHU1MTc2XHU0RUQ2XHU2M0QyXHU0RUY2XHVGRjA4XHU1OTgyXHU1MjJCXHU1NDBEXHU5MTREXHU3RjZFXHVGRjA5XHU1OTA0XHU3NDA2XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTk5OTZcdTUxNDhcdTU5MDRcdTc0MDYgc2hhcmVkLWNvbXBvbmVudHMgXHU1MTg1XHU5MEU4XHU1MjJCXHU1NDBEXHVGRjA4XHU4RkQ5XHU0RTlCXHU1MjJCXHU1NDBEXHU1M0VGXHU4MEZEXHU1NzI4XHU0RUZCXHU0RjU1XHU1NzMwXHU2NUI5XHU0RjdGXHU3NTI4XHVGRjA5XG4gICAgICBjb25zdCBzaGFyZWRDb21wb25lbnRzQWxpYXMgPSByZXNvbHZlU2hhcmVkQ29tcG9uZW50c0FsaWFzKGlkKTtcbiAgICAgIGlmIChzaGFyZWRDb21wb25lbnRzQWxpYXMpIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGBbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU4OUUzXHU2NzkwIHNoYXJlZC1jb21wb25lbnRzIFx1NTE4NVx1OTBFOFx1NTIyQlx1NTQwRCAke2lkfSAoXHU2NzY1XHU4MUVBICR7aW1wb3J0ZXI/LnNwbGl0KCcvJykuc2xpY2UoLTIpLmpvaW4oJy8nKSB8fCAndW5rbm93bid9KSAtPiAke3NoYXJlZENvbXBvbmVudHNBbGlhcy5zcGxpdCgnLycpLnNsaWNlKC0zKS5qb2luKCcvJyl9YCk7XG4gICAgICAgIHJldHVybiBzaGFyZWRDb21wb25lbnRzQWxpYXM7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTkwNFx1NzQwNiBAY29uZmlncyBcdTUzMDVcdTc2ODRcdTVCRkNcdTUxNjVcdUZGMDhcdTRFQ0VcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDVcdTRFMkRcdTVCRkNcdTUxNjVcdTY1RjZcdUZGMENcdTczQjBcdTU3MjhcdTYzMDdcdTU0MTEgc2hhcmVkLWNvcmUvc3JjL2NvbmZpZ3NcdUZGMDlcbiAgICAgIGlmIChpZC5zdGFydHNXaXRoKCdAY29uZmlncy8nKSkge1xuICAgICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGNvbmZpZ3MvJywgJycpO1xuICAgICAgICBjb25zdCBzb3VyY2VQYXRoID0gd2l0aENvbmZpZ3Moc3ViUGF0aCk7XG4gICAgICAgIGNvbnN0IGZpbmFsUGF0aCA9IGVuc3VyZUZpbGVFeHRlbnNpb24oc291cmNlUGF0aCk7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmluZm8oYFtyZXNvbHZlLWJ0Yy1pbXBvcnRzXSBcdTg5RTNcdTY3OTAgQGNvbmZpZ3MgXHU1MzA1ICR7aWR9IChcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDUgJHtpbXBvcnRlcj8uc3BsaXQoJy8nKS5zbGljZSgtMikuam9pbignLycpIHx8ICd1bmtub3duJ30pIC0+ICR7ZmluYWxQYXRoLnNwbGl0KCcvJykuc2xpY2UoLTMpLmpvaW4oJy8nKX1gKTtcbiAgICAgICAgcmV0dXJuIGZpbmFsUGF0aDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1OTA0XHU3NDA2IEBidGMvKiBcdTUzMDVcdTc2ODRcdTVCRkNcdTUxNjVcbiAgICAgIGlmICghaWQuc3RhcnRzV2l0aCgnQGJ0Yy8nKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1OTA0XHU3NDA2IEBidGMvc2hhcmVkLWNvbXBvbmVudHNcbiAgICAgIGlmIChpZCA9PT0gJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMvJykpIHtcbiAgICAgICAgY29uc3Qgc291cmNlUGF0aCA9IGlkID09PSAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cydcbiAgICAgICAgICA/IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2luZGV4LnRzJylcbiAgICAgICAgICA6IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjLyR7aWQucmVwbGFjZSgnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cy8nLCAnJyl9YCk7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmluZm8oYFtyZXNvbHZlLWJ0Yy1pbXBvcnRzXSBcdTg5RTNcdTY3OTAgJHtpZH0gKFx1Njc2NVx1ODFFQVx1NURGMlx1Njc4NFx1NUVGQVx1NTMwNSAke2ltcG9ydGVyPy5zcGxpdCgnLycpLnNsaWNlKC0yKS5qb2luKCcvJykgfHwgJ3Vua25vd24nfSkgLT4gJHtzb3VyY2VQYXRoLnNwbGl0KCcvJykuc2xpY2UoLTMpLmpvaW4oJy8nKX1gKTtcbiAgICAgICAgcmV0dXJuIHNvdXJjZVBhdGg7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjL3NoYXJlZC1jb3JlXG4gICAgICBpZiAoaWQgPT09ICdAYnRjL3NoYXJlZC1jb3JlJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjL3NoYXJlZC1jb3JlLycpKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZVBhdGggPSBpZCA9PT0gJ0BidGMvc2hhcmVkLWNvcmUnXG4gICAgICAgICAgPyB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYy9pbmRleC50cycpXG4gICAgICAgICAgOiB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb3JlL3NyYy8ke2lkLnJlcGxhY2UoJ0BidGMvc2hhcmVkLWNvcmUvJywgJycpfWApO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5pbmZvKGBbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU4OUUzXHU2NzkwICR7aWR9IChcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDUgJHtpbXBvcnRlcj8uc3BsaXQoJy8nKS5zbGljZSgtMikuam9pbignLycpIHx8ICd1bmtub3duJ30pIC0+ICR7c291cmNlUGF0aC5zcGxpdCgnLycpLnNsaWNlKC0zKS5qb2luKCcvJyl9YCk7XG4gICAgICAgIHJldHVybiBzb3VyY2VQYXRoO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy9zaGFyZWQtdXRpbHNcbiAgICAgIGlmIChpZCA9PT0gJ0BidGMvc2hhcmVkLXV0aWxzJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjL3NoYXJlZC11dGlscy8nKSkge1xuICAgICAgICBjb25zdCBzb3VyY2VQYXRoID0gaWQgPT09ICdAYnRjL3NoYXJlZC11dGlscydcbiAgICAgICAgICA/IHdpdGhQYWNrYWdlcygnc2hhcmVkLXV0aWxzL3NyYy9pbmRleC50cycpXG4gICAgICAgICAgOiB3aXRoUGFja2FnZXMoYHNoYXJlZC11dGlscy9zcmMvJHtpZC5yZXBsYWNlKCdAYnRjL3NoYXJlZC11dGlscy8nLCAnJyl9YCk7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmluZm8oYFtyZXNvbHZlLWJ0Yy1pbXBvcnRzXSBcdTg5RTNcdTY3OTAgJHtpZH0gKFx1Njc2NVx1ODFFQVx1NURGMlx1Njc4NFx1NUVGQVx1NTMwNSAke2ltcG9ydGVyPy5zcGxpdCgnLycpLnNsaWNlKC0yKS5qb2luKCcvJykgfHwgJ3Vua25vd24nfSkgLT4gJHtzb3VyY2VQYXRoLnNwbGl0KCcvJykuc2xpY2UoLTMpLmpvaW4oJy8nKX1gKTtcbiAgICAgICAgcmV0dXJuIHNvdXJjZVBhdGg7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjL3NoYXJlZC1wbHVnaW5zXG4gICAgICBpZiAoaWQgPT09ICdAYnRjL3NoYXJlZC1wbHVnaW5zJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjL3NoYXJlZC1wbHVnaW5zLycpKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZVBhdGggPSBpZCA9PT0gJ0BidGMvc2hhcmVkLXBsdWdpbnMnXG4gICAgICAgICAgPyB3aXRoUGFja2FnZXMoJ3NoYXJlZC1wbHVnaW5zL3NyYy9pbmRleC50cycpXG4gICAgICAgICAgOiB3aXRoUGFja2FnZXMoYHNoYXJlZC1wbHVnaW5zL3NyYy8ke2lkLnJlcGxhY2UoJ0BidGMvc2hhcmVkLXBsdWdpbnMvJywgJycpfWApO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5pbmZvKGBbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU4OUUzXHU2NzkwICR7aWR9IChcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDUgJHtpbXBvcnRlcj8uc3BsaXQoJy8nKS5zbGljZSgtMikuam9pbignLycpIHx8ICd1bmtub3duJ30pIC0+ICR7c291cmNlUGF0aC5zcGxpdCgnLycpLnNsaWNlKC0zKS5qb2luKCcvJyl9YCk7XG4gICAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKHNvdXJjZVBhdGgpO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy9pMThuXG4gICAgICBpZiAoaWQgPT09ICdAYnRjL2kxOG4nIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMvaTE4bi8nKSkge1xuICAgICAgICBjb25zdCBzb3VyY2VQYXRoID0gaWQgPT09ICdAYnRjL2kxOG4nXG4gICAgICAgICAgPyB3aXRoUGFja2FnZXMoJ2kxOG4vc3JjL2luZGV4LnRzJylcbiAgICAgICAgICA6IHdpdGhQYWNrYWdlcyhgaTE4bi9zcmMvJHtpZC5yZXBsYWNlKCdAYnRjL2kxOG4vJywgJycpfWApO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5pbmZvKGBbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU4OUUzXHU2NzkwICR7aWR9IChcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDUgJHtpbXBvcnRlcj8uc3BsaXQoJy8nKS5zbGljZSgtMikuam9pbignLycpIHx8ICd1bmtub3duJ30pIC0+ICR7c291cmNlUGF0aC5zcGxpdCgnLycpLnNsaWNlKC0zKS5qb2luKCcvJyl9YCk7XG4gICAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKHNvdXJjZVBhdGgpO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy9hdXRoLXNoYXJlZFxuICAgICAgaWYgKGlkID09PSAnQGJ0Yy9hdXRoLXNoYXJlZCcgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy9hdXRoLXNoYXJlZC8nKSkge1xuICAgICAgICBsZXQgc291cmNlUGF0aDogc3RyaW5nO1xuICAgICAgICBpZiAoaWQgPT09ICdAYnRjL2F1dGgtc2hhcmVkJykge1xuICAgICAgICAgIC8vIEBidGMvYXV0aC1zaGFyZWQgXHU2Q0ExXHU2NzA5XHU2ODM5IGluZGV4LnRzXHVGRjBDXHU0RjdGXHU3NTI4IGNvbXBvc2FibGVzL2luZGV4LnRzIFx1NEY1Q1x1NEUzQVx1NTE2NVx1NTNFM1xuICAgICAgICAgIHNvdXJjZVBhdGggPSB3aXRoUm9vdCgnYXV0aC9zaGFyZWQvY29tcG9zYWJsZXMvaW5kZXgudHMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGJ0Yy9hdXRoLXNoYXJlZC8nLCAnJyk7XG4gICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU4REVGXHU1Rjg0XHU2Q0ExXHU2NzA5XHU2MjY5XHU1QzU1XHU1NDBEXHVGRjBDXHU2REZCXHU1MkEwIC50cyBcdTYyNjlcdTVDNTVcdTU0MERcbiAgICAgICAgICBzb3VyY2VQYXRoID0gd2l0aFJvb3QoYGF1dGgvc2hhcmVkLyR7c3ViUGF0aH0ke3N1YlBhdGguaW5jbHVkZXMoJy4nKSA/ICcnIDogJy50cyd9YCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW3Jlc29sdmUtYnRjLWltcG9ydHNdIFx1ODlFM1x1Njc5MCAke2lkfSAoXHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU1MzA1ICR7aW1wb3J0ZXI/LnNwbGl0KCcvJykuc2xpY2UoLTIpLmpvaW4oJy8nKSB8fCAndW5rbm93bid9KSAtPiAke3NvdXJjZVBhdGguc3BsaXQoJy8nKS5zbGljZSgtMykuam9pbignLycpfWApO1xuICAgICAgICByZXR1cm4gc291cmNlUGF0aDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1MTc2XHU0RUQ2IEBidGMvKiBcdTUzMDVcdUZGMENcdThGRDRcdTU2REUgbnVsbCBcdThCQTlcdTUxNzZcdTRFRDZcdTYzRDJcdTRFRjZcdTU5MDRcdTc0MDZcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxhZG1pbi1hcHBcXFxcc3JjXFxcXGNvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxhcHBzXFxcXGFkbWluLWFwcFxcXFxzcmNcXFxcY29uZmlnXFxcXHByb3h5LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2FwcHMvYWRtaW4tYXBwL3NyYy9jb25maWcvcHJveHkudHNcIjs7XG5pbXBvcnQgdHlwZSB7IEluY29taW5nTWVzc2FnZSwgU2VydmVyUmVzcG9uc2UgfSBmcm9tICdodHRwJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ0BidGMvc2hhcmVkLWNvcmUnO1xuXG4vLyBWaXRlIFx1NEVFM1x1NzQwNlx1OTE0RFx1N0Y2RVx1N0M3Qlx1NTc4QlxuaW50ZXJmYWNlIFByb3h5T3B0aW9ucyB7XG4gIHRhcmdldDogc3RyaW5nO1xuICBjaGFuZ2VPcmlnaW4/OiBib29sZWFuO1xuICBzZWN1cmU/OiBib29sZWFuO1xuICBjb25maWd1cmU/OiAocHJveHk6IGFueSwgb3B0aW9uczogYW55KSA9PiB2b2lkO1xufVxuXG5jb25zdCBwcm94eTogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgUHJveHlPcHRpb25zPiA9IHtcbiAgJy9hcGknOiB7XG4gICAgdGFyZ2V0OiAnaHR0cDovLzEwLjgwLjkuNzY6ODExNScsXG4gICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgIHNlY3VyZTogZmFsc2UsXG4gICAgLy8gXHU0RTBEXHU1MThEXHU2NkZGXHU2MzYyXHU4REVGXHU1Rjg0XHVGRjBDXHU3NkY0XHU2M0E1XHU4RjZDXHU1M0QxIC9hcGkgXHU1MjMwXHU1NDBFXHU3QUVGXHVGRjA4XHU1NDBFXHU3QUVGXHU1REYyXHU2NTM5XHU0RTNBXHU0RjdGXHU3NTI4IC9hcGlcdUZGMDlcbiAgICAvLyByZXdyaXRlOiAocGF0aDogc3RyaW5nKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnL2FkbWluJykgLy8gXHU1REYyXHU3OUZCXHU5NjY0XHVGRjFBXHU1NDBFXHU3QUVGXHU1REYyXHU2NTM5XHU0RTNBXHU0RjdGXHU3NTI4IC9hcGlcbiAgICAvLyBcdTU5MDRcdTc0MDZcdTU0Q0RcdTVFOTRcdTU5MzRcdUZGMENcdTZERkJcdTUyQTAgQ09SUyBcdTU5MzRcbiAgICBjb25maWd1cmU6IChwcm94eTogYW55LCBvcHRpb25zOiBhbnkpID0+IHtcbiAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NEVFM1x1NzQwNlx1NTRDRFx1NUU5NFxuICAgICAgcHJveHkub24oJ3Byb3h5UmVzJywgKHByb3h5UmVzOiBJbmNvbWluZ01lc3NhZ2UsIHJlcTogSW5jb21pbmdNZXNzYWdlLCByZXM6IFNlcnZlclJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IHJlcS5oZWFkZXJzLm9yaWdpbiB8fCAnKic7XG4gICAgICAgIGlmIChwcm94eVJlcy5oZWFkZXJzKSB7XG4gICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJ10gPSBvcmlnaW4gYXMgc3RyaW5nO1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJ10gPSAndHJ1ZSc7XG4gICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyddID0gJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJztcbiAgICAgICAgICBjb25zdCByZXF1ZXN0SGVhZGVycyA9IHJlcS5oZWFkZXJzWydhY2Nlc3MtY29udHJvbC1yZXF1ZXN0LWhlYWRlcnMnXSB8fCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnO1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnXSA9IHJlcXVlc3RIZWFkZXJzIGFzIHN0cmluZztcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MEQgU2V0LUNvb2tpZSBcdTU0Q0RcdTVFOTRcdTU5MzRcdUZGMENcdTc4NkVcdTRGRERcdThERThcdTU3REZcdThCRjdcdTZDNDJcdTY1RjYgY29va2llIFx1ODBGRFx1NTkxRlx1NkI2M1x1Nzg2RVx1OEJCRVx1N0Y2RVxuICAgICAgICAgIC8vIFx1NTcyOFx1OTg4NFx1ODlDOFx1NkEyMVx1NUYwRlx1NEUwQlx1RkYwOFx1NEUwRFx1NTQwQ1x1N0FFRlx1NTNFM1x1RkYwOVx1RkYwQ1x1OTcwMFx1ODk4MVx1OEJCRVx1N0Y2RSBTYW1lU2l0ZT1Ob25lOyBTZWN1cmVcbiAgICAgICAgICBjb25zdCBzZXRDb29raWVIZWFkZXIgPSBwcm94eVJlcy5oZWFkZXJzWydzZXQtY29va2llJ107XG4gICAgICAgICAgaWYgKHNldENvb2tpZUhlYWRlcikge1xuICAgICAgICAgICAgY29uc3QgY29va2llcyA9IEFycmF5LmlzQXJyYXkoc2V0Q29va2llSGVhZGVyKSA/IHNldENvb2tpZUhlYWRlciA6IFtzZXRDb29raWVIZWFkZXJdO1xuICAgICAgICAgICAgY29uc3QgZml4ZWRDb29raWVzID0gY29va2llcy5tYXAoKGNvb2tpZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5QyBjb29raWUgXHU0RTBEXHU1MzA1XHU1NDJCIFNhbWVTaXRlXHVGRjBDXHU2MjE2XHU4MDA1IFNhbWVTaXRlIFx1NEUwRFx1NjYyRiBOb25lXHVGRjBDXHU5NzAwXHU4OTgxXHU0RkVFXHU1OTBEXG4gICAgICAgICAgICAgIGlmICghY29va2llLmluY2x1ZGVzKCdTYW1lU2l0ZT1Ob25lJykpIHtcbiAgICAgICAgICAgICAgICAvLyBcdTc5RkJcdTk2NjRcdTczQjBcdTY3MDlcdTc2ODQgU2FtZVNpdGUgXHU4QkJFXHU3RjZFXHVGRjA4XHU1OTgyXHU2NzlDXHU2NzA5XHVGRjA5XG4gICAgICAgICAgICAgICAgbGV0IGZpeGVkQ29va2llID0gY29va2llLnJlcGxhY2UoLztcXHMqU2FtZVNpdGU9KFN0cmljdHxMYXh8Tm9uZSkvZ2ksICcnKTtcbiAgICAgICAgICAgICAgICAvLyBcdTZERkJcdTUyQTAgU2FtZVNpdGU9Tm9uZTsgU2VjdXJlXHVGRjA4XHU1QkY5XHU0RThFXHU4REU4XHU1N0RGXHU4QkY3XHU2QzQyXHVGRjA5XG4gICAgICAgICAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBU2VjdXJlIFx1OTcwMFx1ODk4MSBIVFRQU1x1RkYwQ1x1NEY0Nlx1NTcyOFx1NUYwMFx1NTNEMS9cdTk4ODRcdTg5QzhcdTczQUZcdTU4ODNcdTRFMkRcdUZGMENcdTYyMTFcdTRFRUNcdTRFQ0RcdTcxMzZcdTZERkJcdTUyQTBcdTVCODNcbiAgICAgICAgICAgICAgICAvLyBcdTZENEZcdTg5QzhcdTU2NjhcdTRGMUFcdTVGRkRcdTc1NjUgU2VjdXJlXHVGRjA4XHU1OTgyXHU2NzlDXHU1MzRGXHU4QkFFXHU2NjJGIEhUVFBcdUZGMDlcbiAgICAgICAgICAgICAgICBmaXhlZENvb2tpZSArPSAnOyBTYW1lU2l0ZT1Ob25lOyBTZWN1cmUnO1xuICAgICAgICAgICAgICAgIHJldHVybiBmaXhlZENvb2tpZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gY29va2llO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydzZXQtY29va2llJ10gPSBmaXhlZENvb2tpZXM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFx1OEJCMFx1NUY1NVx1NTQwRVx1N0FFRlx1NTRDRFx1NUU5NFx1NzJCNlx1NjAwMVxuICAgICAgICBpZiAocHJveHlSZXMuc3RhdHVzQ29kZSAmJiBwcm94eVJlcy5zdGF0dXNDb2RlID49IDUwMCkge1xuICAgICAgICAgIGxvZ2dlci5lcnJvcihgW1Byb3h5XSBCYWNrZW5kIHJldHVybmVkICR7cHJveHlSZXMuc3RhdHVzQ29kZX0gZm9yICR7cmVxLm1ldGhvZH0gJHtyZXEudXJsfWApO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gXHU1OTA0XHU3NDA2XHU0RUUzXHU3NDA2XHU5NTE5XHU4QkVGXG4gICAgICBwcm94eS5vbignZXJyb3InLCAoZXJyOiBFcnJvciwgcmVxOiBJbmNvbWluZ01lc3NhZ2UsIHJlczogU2VydmVyUmVzcG9uc2UpID0+IHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKCdbUHJveHldIEVycm9yOicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgbG9nZ2VyLmVycm9yKCdbUHJveHldIFJlcXVlc3QgVVJMOicsIHJlcS51cmwpO1xuICAgICAgICBsb2dnZXIuZXJyb3IoJ1tQcm94eV0gVGFyZ2V0OicsICdodHRwOi8vMTAuODAuOS43Njo4MTE1Jyk7XG4gICAgICAgIGlmIChyZXMgJiYgIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwLCB7XG4gICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IHJlcS5oZWFkZXJzLm9yaWdpbiB8fCAnKicsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU4RkQ5XHU5MUNDXHU1NzI4XHU0RUUzXHU3NDA2XHU5MTREXHU3RjZFXHU0RTJEXHVGRjBDXHU2NUUwXHU2Q0Q1XHU0RjdGXHU3NTI4IGkxOG5cdUZGMENcdTYyNDBcdTRFRTVcdTRGRERcdTc1NTlcdTUzOUZcdTU5Q0JcdTk1MTlcdThCRUZcdTZEODhcdTYwNkZcbiAgICAgICAgICAvLyBcdTVCOUVcdTk2NDVcdTk1MTlcdThCRUZcdTZEODhcdTYwNkZcdTVFOTRcdThCRTVcdTU3MjhcdTU0MEVcdTdBRUZcdTYyMTZcdTUyNERcdTdBRUZcdTk1MTlcdThCRUZcdTU5MDRcdTc0MDZcdTRFMkRcdTRGN0ZcdTc1MjggaTE4blxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgY29kZTogNTAwLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1Byb3h5IGVycm9yOiBVbmFibGUgdG8gY29ubmVjdCB0byBiYWNrZW5kIHNlcnZlciBodHRwOi8vMTAuODAuOS43Njo4MTE1JyxcbiAgICAgICAgICAgIGVycm9yOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBcdTc2RDFcdTU0MkNcdTRFRTNcdTc0MDZcdThCRjdcdTZDNDJcdUZGMDhcdTc1MjhcdTRFOEVcdThDMDNcdThCRDVcdUZGMDlcbiAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcTogYW55LCByZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtQcm94eV0gJHtyZXEubWV0aG9kfSAke3JlcS51cmx9IC0+IGh0dHA6Ly8xMC44MC45Ljc2OjgxMTUke3JlcS51cmx9YCk7XG4gICAgICB9KTtcbiAgICB9LFxuICB9XG59O1xuXG5leHBvcnQgeyBwcm94eSB9O1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwWixTQUFTLG9CQUFvQjtBQUN2YixTQUFTLGlCQUFBQSxzQkFBcUI7OztBQ0s5QixTQUFTLFdBQUFDLFdBQVMsV0FBQUMsZ0JBQWU7QUFDakMsU0FBUyxpQkFBQUMsc0JBQXFCO0FBQzlCLFNBQVMscUJBQXFCO0FBQzlCLE9BQU8sU0FBUztBQUNoQixPQUFPLFlBQVk7QUFDbkIsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sWUFBWTtBQUNuQixTQUFTLGNBQUFDLGFBQVksZ0JBQUFDLHFCQUFvQjs7O0FDUnpDLFNBQVMsZUFBZTtBQU9qQixTQUFTLGtCQUFrQixRQUFnQjtBQUloRCxRQUFNLFVBQVUsQ0FBQyxpQkFBeUIsUUFBUSxRQUFRLFlBQVk7QUFLdEUsUUFBTSxlQUFlLENBQUMsaUJBQ3BCLFFBQVEsUUFBUSxrQkFBa0IsWUFBWTtBQUtoRCxRQUFNLFdBQVcsQ0FBQyxpQkFDaEIsUUFBUSxRQUFRLFNBQVMsWUFBWTtBQUt2QyxRQUFNLGNBQWMsQ0FBQyxpQkFDbkIsUUFBUSxRQUFRLGlCQUFpQixZQUFZO0FBRS9DLFNBQU8sRUFBRSxTQUFTLGNBQWMsVUFBVSxZQUFZO0FBQ3hEOzs7QURmQSxTQUFTLHFCQUFxQjs7O0FFbEI5QixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGdCQUFnQjtBQUN2QixTQUFTLDJCQUEyQjtBQUs3QixTQUFTLHlCQUF5QjtBQUN2QyxTQUFPLFdBQVc7QUFBQSxJQUNoQixTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLFFB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UztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFD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QVU7QUFBQSxZQUNyQixNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsWUFDVCxPQUFPLElBQUk7QUFBQSxVQUNiLENBQUMsQ0FBQztBQUFBLFFBQ0o7QUFBQSxNQUNGLENBQUM7QUFHRCxNQUFBQSxPQUFNLEdBQUcsWUFBWSxDQUFDLFVBQWUsS0FBc0IsUUFBd0I7QUFDakYsZ0JBQVEsS0FBSyxXQUFXLElBQUksTUFBTSxJQUFJLElBQUksR0FBRyw2QkFBNkIsSUFBSSxHQUFHLEVBQUU7QUFBQSxNQUNyRixDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFDRjs7O0F2QnBGdVEsSUFBTUMsNENBQTJDO0FBS3hULElBQU8sc0JBQVE7QUFBQSxFQUNiLHVCQUF1QjtBQUFBLElBQ3JCLFNBQVM7QUFBQSxJQUNULFFBQVFDLGVBQWMsSUFBSSxJQUFJLEtBQUtELHlDQUFlLENBQUM7QUFBQSxJQUNuRCxhQUFhO0FBQUEsSUFDYixjQUFjLEVBQUUsTUFBaUI7QUFBQSxJQUNqQztBQUFBLEVBQ0YsQ0FBQztBQUNIOyIsCiAgIm5hbWVzIjogWyJmaWxlVVJMVG9QYXRoIiwgInJlc29sdmUiLCAiZGlybmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgImV4aXN0c1N5bmMiLCAicmVhZEZpbGVTeW5jIiwgInJlc29sdmUiLCAicmVzb2x2ZSIsICJyZXNvbHZlIiwgInJlc29sdmUiLCAicmVzb2x2ZSIsICJleGlzdHNTeW5jIiwgInJlc29sdmUiLCAiZXhpc3RzU3luYyIsICJleGlzdHNTeW5jIiwgImV4aXN0c1N5bmMiLCAiZmlsZU5hbWUiLCAib3JpZ2luIiwgImV4aXN0c1N5bmMiLCAicmVhZEZpbGVTeW5jIiwgInJlc29sdmUiLCAiZGlybmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19maWxlbmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19kaXJuYW1lIiwgImRpcm5hbWUiLCAicmVzb2x2ZSIsICJleGlzdHNTeW5jIiwgInRpbWVzdGFtcCIsICJyZWFkRmlsZVN5bmMiLCAicmVzb2x2ZSIsICJkaXJuYW1lIiwgImV4aXN0c1N5bmMiLCAicmVzb2x2ZSIsICJleGlzdHNTeW5jIiwgImRpcm5hbWUiLCAicmVzb2x2ZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19maWxlbmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19kaXJuYW1lIiwgInJlc29sdmUiLCAicmVhZEZpbGVTeW5jIiwgImV4aXN0c1N5bmMiLCAicmVzb2x2ZSIsICJyZXNvbHZlIiwgImV4aXN0c1N5bmMiLCAicmVhZEZpbGVTeW5jIiwgInJlc29sdmUiLCAiZmlsZVVSTFRvUGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgIl9fZmlsZW5hbWUiLCAiZmlsZVVSTFRvUGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgIl9fZGlybmFtZSIsICJyZXNvbHZlIiwgInByb2plY3RSb290IiwgImlzUHJldmlld0J1aWxkIiwgImV4aXN0c1N5bmMiLCAiZXhpc3RzU3luYyIsICJ3aXRoUGFja2FnZXMiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCIsICJfX2ZpbGVuYW1lIiwgImZpbGVVUkxUb1BhdGgiLCAiX19kaXJuYW1lIiwgImRpcm5hbWUiLCAicmVzb2x2ZSIsICJyZXF1aXJlIiwgInByb3h5IiwgImV4aXN0c1N5bmMiLCAicmVhZEZpbGVTeW5jIiwgInByb3h5IiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiZmlsZVVSTFRvUGF0aCJdCn0K
