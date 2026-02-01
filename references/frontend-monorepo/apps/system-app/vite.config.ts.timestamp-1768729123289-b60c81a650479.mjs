var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// vite.config.ts
import { defineConfig } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@24.10.1_sass@1.94.2/node_modules/vite/dist/node/index.js";
import { fileURLToPath as fileURLToPath6 } from "node:url";

// ../../configs/vite/factories/subapp.config.ts
import { resolve as resolve11, dirname as dirname4 } from "path";
import { fileURLToPath as fileURLToPath5 } from "node:url";
import { createRequire } from "module";
import vue from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue@5.0.0_vite@5.4.21_vue@3.5.26/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.2.0_vite@5.4.21_vue@3.5.26/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import qiankun from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite-plugin-qiankun@1.0.15_typescript@5.9.3_vite@5.4.21/node_modules/vite-plugin-qiankun/dist/index.js";
import UnoCSS from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unocss@66.5.9_postcss@8.5.6_vite@5.4.21/node_modules/unocss/dist/vite.mjs";
import { existsSync as existsSync9, readFileSync as readFileSync5 } from "node:fs";

// ../../configs/vite/utils/path-helpers.ts
import { resolve } from "path";
function createPathHelpers(appDir2) {
  const withSrc = (relativePath) => resolve(appDir2, relativePath);
  const withPackages = (relativePath) => resolve(appDir2, "../../packages", relativePath);
  const withRoot = (relativePath) => resolve(appDir2, "../..", relativePath);
  const withConfigs = (relativePath) => resolve(appDir2, "../../configs", relativePath);
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
  },
  {
    appName: "mobile-app",
    devHost: "10.80.8.199",
    devPort: "8087",
    preHost: "localhost",
    prePort: "4187",
    testHost: "mobile.test.bellis.com.cn",
    prodHost: "mobile.bellis.com.cn"
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
function getPublicDir(appName, appDir2) {
  if (appName === "main-app" || appName === "admin-app" || appName === "mobile-app" || appName === "system-app") {
    return resolve2(appDir2, "public");
  }
  return resolve2(appDir2, "../../packages/shared-components/public");
}

// ../../configs/vite/base.config.ts
import { resolve as resolve3 } from "path";
import { existsSync } from "fs";
function createBaseAliases(appDir2, _appName) {
  const { withSrc, withRoot, withConfigs, withPackages } = createPathHelpers(appDir2);
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
function createBaseResolve(appDir2, appName) {
  const { withPackages } = createPathHelpers(appDir2);
  const aliases = createBaseAliases(appDir2, appName);
  const aliasArray = [
    // 关键：将 util 映射到 npm 包，防止 Vite 将其视为 Node.js 内置模块并外部化
    // 需要查找 node_modules/util 的实际路径（可能在根目录或应用目录）
    {
      find: /^util$/,
      replacement: (() => {
        const appUtilPath = resolve3(appDir2, "node_modules/util");
        if (existsSync(appUtilPath)) {
          return appUtilPath;
        }
        const rootUtilPath = resolve3(appDir2, "../../node_modules/util");
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
  "monitor-app": { echarts: true, monaco: false, three: false },
  "mobile-app": { echarts: false, monaco: false, three: false }
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
function cleanDistPlugin(appDir2) {
  return {
    name: "clean-dist-plugin",
    buildStart() {
      const distDir = resolve4(appDir2, "dist");
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
function resolveLogoPlugin(appDir2) {
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
        const sharedLogoPath = resolve6(appDir2, "../../packages/shared-components/public/logo.png");
        if (existsSync5(sharedLogoPath)) {
          return sharedLogoPath;
        }
        const appLogoPath = resolve6(appDir2, "public/logo.png");
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
        const root = viteConfig.root || appDir2;
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

// ../../configs/vite/plugins/duty-static.ts
import { readFileSync as readFileSync3, existsSync as existsSync6, readdirSync, statSync, copyFileSync as copyFileSync2, mkdirSync as mkdirSync2, writeFileSync as writeFileSync2 } from "fs";
import { join, resolve as resolve8, extname } from "path";
function dutyStaticPlugin(appDir2) {
  let viteConfig = null;
  const dutyMiddleware = (req, res, next) => {
    if (!req.url || !req.url.startsWith("/duty/")) {
      next();
      return;
    }
    const fileName = req.url.replace("/duty/", "");
    const publicDir = resolve8(appDir2, "public");
    const filePath = join(publicDir, fileName);
    if (!existsSync6(filePath)) {
      next();
      return;
    }
    try {
      const fileContent = readFileSync3(filePath, "utf-8");
      if (fileName.endsWith(".html")) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
      } else if (fileName.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css; charset=utf-8");
      } else if (fileName.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      }
      res.statusCode = 200;
      res.end(fileContent);
    } catch (error) {
      console.error("[duty-static] \u8BFB\u53D6\u6587\u4EF6\u5931\u8D25:", filePath, error);
      next();
    }
  };
  return {
    name: "duty-static",
    enforce: "pre",
    // 在其他插件之前执行，确保在 Vue Router 之前处理
    configResolved(config) {
      viteConfig = config;
    },
    configureServer(server) {
      server.middlewares.use(dutyMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(dutyMiddleware);
    },
    writeBundle() {
      if (!viteConfig) {
        return;
      }
      const publicDir = resolve8(appDir2, "public");
      if (!existsSync6(publicDir)) {
        return;
      }
      const outDir = viteConfig.build.outDir || "dist";
      const distDir = resolve8(appDir2, outDir);
      if (!existsSync6(distDir)) {
        return;
      }
      const dutyDir = resolve8(distDir, "duty");
      if (!existsSync6(dutyDir)) {
        mkdirSync2(dutyDir, { recursive: true });
      }
      const dutyFileExtensions = [".html", ".css", ".js"];
      const excludedFiles = ["logo.png", "login_cut_dark.png", "login_cut_light.png", "scan.png", "favicon.ico"];
      const files = readdirSync(publicDir);
      let jqueryFile = null;
      const jqueryFiles = [];
      for (const file of files) {
        if (file.startsWith("jquery") && file.endsWith(".min.js")) {
          jqueryFiles.push(file);
        }
      }
      if (jqueryFiles.length > 0) {
        const stableVersion = jqueryFiles.find((f) => f.includes("jquery-3."));
        jqueryFile = (stableVersion || jqueryFiles[0]) ?? null;
        if (jqueryFiles.length > 1) {
          console.info(`[duty-static] \u{1F4CB} \u627E\u5230\u591A\u4E2A jQuery \u6587\u4EF6: ${jqueryFiles.join(", ")}`);
          console.info(`[duty-static] \u{1F4CC} \u4F7F\u7528: ${jqueryFile}`);
        }
      }
      if (jqueryFile) {
        const jquerySourcePath = resolve8(publicDir, jqueryFile);
        const jqueryDestPath = resolve8(dutyDir, jqueryFile);
        try {
          copyFileSync2(jquerySourcePath, jqueryDestPath);
          console.info(`[duty-static] \u{1F4E6} \u5DF2\u590D\u5236 ${jqueryFile} \u5230 dist/duty/`);
        } catch (error) {
          console.error(`[duty-static] \u26A0\uFE0F  \u590D\u5236 jQuery \u6587\u4EF6\u5931\u8D25:`, error);
        }
      } else {
        console.warn(`[duty-static] \u26A0\uFE0F  \u8B66\u544A: \u672A\u627E\u5230 jQuery \u6587\u4EF6\uFF08jquery*.min.js\uFF09\u5728 public \u76EE\u5F55`);
      }
      let copiedCount = 0;
      for (const file of files) {
        if (excludedFiles.includes(file)) {
          continue;
        }
        if (jqueryFile && file === jqueryFile) {
          continue;
        }
        const ext = extname(file).toLowerCase();
        if (dutyFileExtensions.includes(ext)) {
          const sourcePath = resolve8(publicDir, file);
          const destPath = resolve8(dutyDir, file);
          try {
            const stats = statSync(sourcePath);
            if (stats.isFile()) {
              if (ext === ".html") {
                let content = readFileSync3(sourcePath, "utf-8");
                if (jqueryFile) {
                  content = content.replace(
                    /https:\/\/code\.jquery\.com\/jquery-[^"'\s]+\.min\.js/g,
                    `/duty/${jqueryFile}`
                  );
                  content = content.replace(
                    /https?:\/\/[^"'\s]*jquery[^"'\s]*\.min\.js/g,
                    `/duty/${jqueryFile}`
                  );
                }
                content = content.replace(/href=["']\/index\.css["']/g, 'href="/duty/index.css"');
                content = content.replace(/src=["']\/index\.js["']/g, 'src="/duty/index.js"');
                writeFileSync2(destPath, content, "utf-8");
              } else {
                copyFileSync2(sourcePath, destPath);
              }
              copiedCount++;
              console.info(`[duty-static] \u{1F4E6} \u5DF2\u590D\u5236 ${file} \u5230 dist/duty/`);
            }
          } catch (error) {
            console.error(`[duty-static] \u26A0\uFE0F  \u590D\u5236\u6587\u4EF6\u5931\u8D25 ${file}:`, error);
          }
        }
      }
      if (copiedCount > 0) {
        console.info(`[duty-static] \u2705 \u6784\u5EFA\u5B8C\u6210\uFF1A\u5DF2\u590D\u5236 ${copiedCount} \u4E2A\u6587\u4EF6\u5230 dist/duty/`);
      }
    }
  };
}

// ../../configs/vite/plugins/locales-static.ts
import { readFileSync as readFileSync4, existsSync as existsSync7 } from "fs";
import { resolve as resolve9 } from "path";
function localesStaticPlugin(appDir2) {
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
    const fullPath = resolve9(appDir2, filePath);
    if (!existsSync7(fullPath)) {
      console.warn(`[locales-static] File not found: ${fullPath} (requested: ${req.url})`);
      next();
      return;
    }
    try {
      const content = readFileSync4(fullPath, "utf-8");
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
import { resolve as resolve10 } from "path";
import { fileURLToPath as fileURLToPath4 } from "url";
import { execSync } from "child_process";
var __vite_injected_original_import_meta_url4 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/plugins/upload-cdn.ts";
var __filename4 = fileURLToPath4(__vite_injected_original_import_meta_url4);
var __dirname4 = resolve10(__filename4, "..");
var projectRoot2 = resolve10(__dirname4, "../../..");
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
      const uploadScript = resolve10(projectRoot2, "scripts/upload-app-to-cdn.mjs");
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
import { existsSync as existsSync8 } from "node:fs";
function resolveBtcImportsPlugin(options) {
  const { appDir: appDir2, enabled = true } = options;
  if (!enabled) {
    return {
      name: "resolve-btc-imports",
      apply: "build"
    };
  }
  const { withPackages, withRoot, withConfigs } = createPathHelpers(appDir2);
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
      if (existsSync8(pathWithExt)) {
        return pathWithExt;
      }
    }
    return filePath;
  }
  function resolveSharedComponentsAlias(id) {
    const { withPackages: withPackages2 } = createPathHelpers(appDir2);
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
function getVueI18nPlugin(appDir2) {
  const appDirUrl = pathToFileURL(resolve11(appDir2, "package.json")).href;
  const require2 = createRequire(appDirUrl);
  const plugin = require2("@intlify/unplugin-vue-i18n/vite");
  return plugin.default || plugin;
}
function createSubAppViteConfig(options) {
  const {
    appName,
    appDir: appDir2,
    qiankunName,
    customPlugins = [],
    customBuild,
    customServer,
    customPreview,
    customOptimizeDeps,
    customCss,
    proxy: proxy3 = {},
    btcOptions = {},
    vueI18nOptions,
    qiankunOptions = { useDevMode: true }
  } = options;
  const appConfig = getViteAppConfig(appName);
  const { withRoot } = createPathHelpers(appDir2);
  const isPreviewBuild = process.env.VITE_PREVIEW === "true";
  const baseUrl = getBaseUrl(appName, isPreviewBuild);
  const publicDir = isPreviewBuild ? getPublicDir(appName, appDir2) : false;
  const mainAppConfig = getViteAppConfig("main-app");
  const mainAppPort = mainAppConfig.prePort.toString();
  const epsOutputDir = resolve11(appDir2, "build", "eps");
  const sharedEpsDir = resolve11(appDir2, "../../apps/main-app/build/eps");
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
    cleanDistPlugin(appDir2),
    // 2. CORS 插件
    corsPlugin(),
    // 3. 解析 @btc/* 包导入插件（在 Logo 插件之前，确保能够解析从已构建包中导入的 @btc/* 模块）
    resolveBtcImportsPlugin({ appDir: appDir2 }),
    // 4. Logo 路径解析插件（在自定义插件之前，确保 /logo.png 能被正确解析）
    resolveLogoPlugin(appDir2),
    // 4.5. Locales 静态文件插件（提供 src/locales/*.json 文件，供主应用通过 fetch 加载）
    localesStaticPlugin(appDir2),
    // 5. 自定义插件（在核心插件之前）
    ...customPlugins,
    // 4. Vue 插件
    vue({
      script: {
        fs: {
          fileExists: existsSync9,
          readFile: (file) => readFileSync5(file, "utf-8")
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
      proxy: proxy3,
      eps: epsConfig,
      // 类型断言：确保 enable 始终为 boolean
      svg: {
        skipNames: ["base", "icons"],
        ...btcOptions.svg
      },
      ...btcOptions
    }),
    // 9. VueI18n 插件
    getVueI18nPlugin(appDir2)({
      include: vueI18nOptions?.include || [
        resolve11(appDir2, "src/locales/**")
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
    ...process.env.ENABLE_CDN_UPLOAD === "true" && !isPreviewBuild ? [uploadCdnPlugin(appName, appDir2)] : []
  ];
  const buildConfig = {
    target: "es2020",
    sourcemap: false,
    cssCodeSplit: false,
    cssMinify: true,
    // 关键：禁用代码压缩，避免 Terser 压缩导致的对象属性分隔符丢失问题
    minify: false,
    assetsInlineLimit: 10 * 1024,
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
  const finalProxy = customServer?.proxy !== void 0 ? customServer.proxy : proxy3;
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
  const rootDistDir = resolve11(appDir2, "../../dist");
  const previewRoot = resolve11(rootDistDir, appConfig.prodHost);
  const previewConfig = {
    port: appConfig.prePort,
    strictPort: true,
    open: false,
    host: "0.0.0.0",
    proxy: proxy3,
    headers: {
      "Access-Control-Allow-Origin": appConfig.mainAppOrigin,
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    ...customPreview
  };
  previewConfig.root = previewRoot;
  const appCacheDir = resolve11(appDir2, "node_modules/.vite");
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
      resolve11(appDir2, "src/main.ts")
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
  const baseResolve = createBaseResolve(appDir2, appName);
  const shouldUseSharedEps = process.env.NODE_ENV === "production" || isPreviewBuild;
  const sharedEpsStub = resolve11(appDir2, "../../configs/vite/stubs/virtual-eps-empty.ts");
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

// vite.config.ts
import { injectFallbackTitle } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/vite-plugin/dist/index.mjs";

// src/config/proxy.ts
import { logger } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/index.mjs";
function getBackendTarget() {
  try {
    const { envConfig } = __require("file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/packages/shared-core/dist/configs/unified-env-config.mjs");
    return envConfig?.api?.backendTarget || "http://10.80.9.76:8115";
  } catch (error) {
    return "http://10.80.9.76:8115";
  }
}
var backendTarget = getBackendTarget();
var proxy = {
  "/api": {
    target: backendTarget,
    changeOrigin: true,
    secure: false,
    // 不再替换路径，直接转发 /api 到后端（后端已改为使用 /api）
    // rewrite: (path: string) => path.replace(/^\/api/, '/admin') // 已移除：后端已改为使用 /api
    // 启用手动处理响应，以便修改响应体
    selfHandleResponse: true,
    // 处理响应头，添加 CORS 头
    configure: (proxy3) => {
      proxy3.on("proxyRes", (proxyRes, req, res) => {
        const origin = req.headers.origin || "*";
        const isLoginRequest = req.url?.includes("/login");
        let extractedToken = null;
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
              if (cookie.includes("access_token=")) {
                const tokenMatch = cookie.match(/access_token=([^;]+)/);
                if (tokenMatch && tokenMatch[1]) {
                  extractedToken = tokenMatch[1];
                }
              }
              let fixedCookie = cookie;
              fixedCookie = fixedCookie.replace(/;\s*Domain=[^;]+/gi, "");
              if (!fixedCookie.includes("Path=")) {
                fixedCookie += "; Path=/";
              } else {
                fixedCookie = fixedCookie.replace(/;\s*Path=[^;]+/gi, "; Path=/");
              }
              const forwardedProto = req.headers["x-forwarded-proto"];
              const isHttps = forwardedProto === "https" || req.socket?.encrypted === true || req.connection?.encrypted === true;
              const host = req.headers.host || "";
              const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
              const hostPart = host.split(":")[0];
              const isIpAddress = hostPart ? /^\d+\.\d+\.\d+\.\d+/.test(hostPart) : false;
              const isProduction2 = host.includes("bellis.com.cn");
              fixedCookie = fixedCookie.replace(/;\s*SameSite=(Strict|Lax|None)/gi, "");
              if (isHttps) {
                fixedCookie += "; SameSite=None; Secure";
              } else if (isLocalhost) {
              } else if (isIpAddress) {
              } else {
              }
              if (fixedCookie.includes("HttpOnly") && !cookie.includes("HttpOnly=false")) {
                fixedCookie = fixedCookie.replace(/;\s*HttpOnly/gi, "");
              }
              if (!isHttps && fixedCookie.includes("Secure")) {
                fixedCookie = fixedCookie.replace(/;\s*Secure/gi, "");
              }
              if (isProduction2) {
                fixedCookie += "; Domain=.bellis.com.cn";
              }
              return fixedCookie;
            });
            proxyRes.headers["set-cookie"] = fixedCookies;
          }
          const chunks = [];
          proxyRes.on("data", (chunk) => {
            chunks.push(chunk);
          });
          proxyRes.on("end", () => {
            if (isLoginRequest && extractedToken) {
              const originalHeaders = {};
              Object.keys(proxyRes.headers).forEach((key) => {
                const lowerKey = key.toLowerCase();
                if (lowerKey !== "content-length") {
                  originalHeaders[key] = proxyRes.headers[key];
                }
              });
              try {
                const body = Buffer.concat(chunks).toString("utf8");
                let responseData;
                try {
                  responseData = JSON.parse(body);
                } catch {
                  res.writeHead(proxyRes.statusCode || 200, originalHeaders);
                  res.end(body);
                  return;
                }
                if (!responseData.token && !responseData.accessToken && extractedToken) {
                  responseData.token = extractedToken;
                  responseData.accessToken = extractedToken;
                }
                const newBody = JSON.stringify(responseData);
                originalHeaders["content-length"] = Buffer.byteLength(newBody).toString();
                res.writeHead(proxyRes.statusCode || 200, originalHeaders);
                res.end(newBody);
              } catch (error) {
                logger.error("[Proxy] \u2717 \u5904\u7406\u767B\u5F55\u54CD\u5E94\u65F6\u51FA\u9519:", error);
                res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
                res.end(Buffer.concat(chunks));
              }
            } else {
              res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
              res.end(Buffer.concat(chunks));
            }
          });
          proxyRes.on("error", (err) => {
            logger.error("[Proxy] \u2717 \u8BFB\u53D6\u54CD\u5E94\u6D41\u65F6\u51FA\u9519:", err);
            if (!res.headersSent) {
              res.writeHead(500, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": origin
              });
              res.end(JSON.stringify({ error: "\u4EE3\u7406\u5904\u7406\u54CD\u5E94\u65F6\u51FA\u9519" }));
            }
          });
        }
      });
      proxy3.on("error", (err, req, res) => {
        logger.error("[Proxy] Error:", err.message);
        logger.error("[Proxy] Request URL:", req.url);
        logger.error("[Proxy] Target:", backendTarget);
        if (res && !res.headersSent) {
          res.writeHead(500, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": req.headers.origin || "*"
          });
          res.end(JSON.stringify({
            code: 500,
            message: `\u4EE3\u7406\u9519\u8BEF\uFF1A\u65E0\u6CD5\u8FDE\u63A5\u5230\u540E\u7AEF\u670D\u52A1\u5668 ${backendTarget}`,
            error: err.message
          }));
        }
      });
    }
  },
  // 代理 home-app 到开发服务器（Vue SPA）
  "/home": {
    target: "http://10.80.8.199:8095",
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path.replace(/^\/home/, "")
  }
};
function getProxyConfig() {
  return proxy;
}

// vite-plugins/svg-hmr.ts
import { readFileSync as readFileSync6, readdirSync as readdirSync2, existsSync as existsSync10 } from "fs";
import { basename, extname as extname2, join as join3 } from "path";
function svgHmrPlugin(appDir2) {
  const iconsDir = join3(appDir2, "src", "assets", "icons");
  let svgSpriteHtml = "";
  let viteDevServer = null;
  function generateSvgSprite() {
    if (!existsSync10(iconsDir)) {
      return "";
    }
    const svgSymbols = [];
    try {
      const files = readdirSync2(iconsDir, { withFileTypes: true });
      for (const file of files) {
        if (file.isFile() && extname2(file.name) === ".svg") {
          const filePath = join3(iconsDir, file.name);
          const iconName = basename(file.name, ".svg");
          try {
            let svgContent = readFileSync6(filePath, "utf-8");
            svgContent = svgContent.replace(/<\?xml[^>]*\?>/g, "").replace(/<!DOCTYPE[^>]*>/g, "");
            const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
            const widthMatch = svgContent.match(/width=["']([^"']+)["']/);
            const heightMatch = svgContent.match(/height=["']([^"']+)["']/);
            let viewBox = "";
            if (viewBoxMatch) {
              viewBox = `viewBox="${viewBoxMatch[1]}"`;
            } else if (widthMatch && heightMatch) {
              viewBox = `viewBox="0 0 ${widthMatch[1]} ${heightMatch[1]}"`;
            }
            const innerContent = svgContent.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "").replace(/(\r\n|\n|\r)/gm, "");
            const symbol = `<symbol id="icon-${iconName}" ${viewBox}>${innerContent}</symbol>`;
            svgSymbols.push(symbol);
          } catch (err) {
            console.warn(`[svg-hmr] \u8BFB\u53D6 SVG \u6587\u4EF6\u5931\u8D25: ${filePath}`, err);
          }
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[svg-hmr] \u626B\u63CF\u56FE\u6807\u76EE\u5F55\u5931\u8D25: ${iconsDir}`, err);
      }
    }
    return svgSymbols.join("");
  }
  function updateSvgSprite() {
    const newHtml = generateSvgSprite();
    const changed = newHtml !== svgSpriteHtml;
    svgSpriteHtml = newHtml;
    if (changed && viteDevServer) {
      viteDevServer.ws.send({
        type: "custom",
        event: "svg-hmr-update",
        data: { svgHtml: svgSpriteHtml }
      });
    }
  }
  return {
    name: "svg-hmr",
    enforce: "pre",
    resolveId(id) {
      if (id === "virtual:svg-hmr") {
        return id;
      }
      return null;
    },
    load(id) {
      if (id === "virtual:svg-hmr") {
        return `
// SVG HMR \u5BA2\u6237\u7AEF\u6A21\u5757
export const svgSpriteHtml = ${JSON.stringify(svgSpriteHtml)};
export function updateSvgSprite(newHtml) {
  const sprite = document.getElementById('svg-hmr-sprite');
  if (sprite) {
    sprite.innerHTML = newHtml;
  }
}

// \u5982\u679C\u652F\u6301 HMR\uFF0C\u76D1\u542C\u66F4\u65B0
if (import.meta.hot) {
  import.meta.hot.on('svg-hmr-update', (data) => {
    if (data && data.svgHtml) {
      updateSvgSprite(data.svgHtml);
    }
  });
}
`;
      }
      return null;
    },
    configureServer(server) {
      viteDevServer = server;
      updateSvgSprite();
    },
    buildStart() {
      updateSvgSprite();
    },
    handleHotUpdate(ctx) {
      const filePath = ctx.file.replace(/\\/g, "/");
      const iconsDirPath = iconsDir.replace(/\\/g, "/");
      if (filePath.includes(iconsDirPath) && filePath.endsWith(".svg")) {
        updateSvgSprite();
        const module = ctx.server.moduleGraph.getModuleById("virtual:svg-hmr");
        if (module) {
          ctx.server.moduleGraph.invalidateModule(module);
        }
        if (viteDevServer) {
          viteDevServer.ws.send({
            type: "custom",
            event: "svg-hmr-update",
            data: { svgHtml: svgSpriteHtml }
          });
        }
        return [module].filter(Boolean);
      }
      return void 0;
    },
    transformIndexHtml(html) {
      if (!svgSpriteHtml) {
        updateSvgSprite();
      }
      if (!svgSpriteHtml) {
        return html;
      }
      if (html.includes("svg-hmr-sprite")) {
        return html;
      }
      const escapedHtml = JSON.stringify(svgSpriteHtml);
      const script = `
<script>
(function() {
  var svgSpriteId = 'svg-hmr-sprite';
  var updateAttempts = 0;
  var maxAttempts = 100;
  var currentHtml = ${escapedHtml};
  var isLoaded = false;
  var isLoading = false;
  
      // \u68C0\u67E5\u56FE\u6807\u662F\u5426\u5DF2\u5B58\u5728
      function hasIcons(sprite) {
        if (!sprite) return false;
        var windmill = sprite.querySelector('#icon-windmill');
        var star = sprite.querySelector('#icon-star');
        return !!(windmill || star);
      }
      
      // \u9A8C\u8BC1\u56FE\u6807\u662F\u5426\u771F\u7684\u5B58\u5728
      function verifyIcons() {
        var btcSprite = document.getElementById('btc-svg-sprite');
        if (btcSprite) {
          var windmill = btcSprite.querySelector('#icon-windmill');
          var star = btcSprite.querySelector('#icon-star');
          if (windmill && star) {
            return true;
          } else {
            console.warn('[svg-hmr] \u26A0\uFE0F \u56FE\u6807\u9A8C\u8BC1\u5931\u8D25\uFF1A', {
              windmill: !!windmill,
              star: !!star,
              star: !!star
            });
          }
        }
        return false;
      }
      
      function loadSvgSprite() {
        // \u9632\u6B62\u91CD\u590D\u6267\u884C
        if (isLoading || isLoaded) {
          return;
        }
        
        updateAttempts++;
        if (updateAttempts > maxAttempts) {
          console.warn('[svg-hmr] \u65E0\u6CD5\u52A0\u8F7D SVG sprite\uFF0C\u5DF2\u8FBE\u5230\u6700\u5927\u5C1D\u8BD5\u6B21\u6570');
          isLoading = false;
          return;
        }
        
        if (!document.body) {
          isLoading = true;
          setTimeout(function() {
            isLoading = false;
            loadSvgSprite();
          }, 50);
          return;
        }
        
        try {
          // \u68C0\u67E5\u662F\u5426\u5DF2\u5B58\u5728\u5171\u4EAB\u5305\u7684 SVG sprite
          var existingBtcSprite = document.getElementById('btc-svg-sprite');
          
          // \u5982\u679C\u5B58\u5728\u5171\u4EAB\u5305\u7684 sprite\uFF0C\u5C06\u6211\u4EEC\u7684\u56FE\u6807\u6DFB\u52A0\u5230\u5176\u4E2D
          if (existingBtcSprite) {
            // \u68C0\u67E5\u56FE\u6807\u662F\u5426\u5DF2\u7ECF\u6DFB\u52A0\u8FC7
            if (!hasIcons(existingBtcSprite) && currentHtml) {
              // \u786E\u4FDD sprite \u5DF2\u7ECF\u6709\u5185\u5BB9\uFF08\u7B49\u5F85\u5171\u4EAB\u5305\u63D2\u4EF6\u5B8C\u6210\u521D\u59CB\u5316\uFF09
              if (existingBtcSprite.innerHTML.trim().length > 0) {
                existingBtcSprite.innerHTML = existingBtcSprite.innerHTML + currentHtml;
                isLoaded = true;
                
                // \u9A8C\u8BC1\u56FE\u6807\u662F\u5426\u771F\u7684\u6DFB\u52A0\u6210\u529F
                setTimeout(function() {
                  verifyIcons();
                }, 100);
              } else {
                // sprite \u8FD8\u6CA1\u6709\u5185\u5BB9\uFF0C\u7B49\u5F85\u4E00\u4E0B\u518D\u8BD5
                isLoading = true;
                setTimeout(function() {
                  isLoading = false;
                  loadSvgSprite();
                }, 100);
                return;
              }
            } else if (hasIcons(existingBtcSprite)) {
              // \u56FE\u6807\u5DF2\u7ECF\u5B58\u5728\uFF0C\u6807\u8BB0\u4E3A\u5DF2\u52A0\u8F7D
              isLoaded = true;
              verifyIcons();
            }
            return;
          }
      
      // \u68C0\u67E5\u662F\u5426\u5DF2\u5B58\u5728\u81EA\u5DF1\u7684 sprite
      var existingSprite = document.getElementById(svgSpriteId);
      if (existingSprite) {
        isLoaded = true;
        return;
      }
      
      // \u5426\u5219\u521B\u5EFA\u65B0\u7684 sprite
      var svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgDom.id = svgSpriteId;
      svgDom.style.position = 'absolute';
      svgDom.style.width = '0';
      svgDom.style.height = '0';
      svgDom.style.overflow = 'hidden';
      svgDom.style.visibility = 'hidden';
      svgDom.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgDom.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      svgDom.innerHTML = currentHtml;
      document.body.insertBefore(svgDom, document.body.firstChild);
      
      isLoaded = true;
    } catch (e) {
      console.error('[svg-hmr] \u52A0\u8F7D SVG sprite \u5931\u8D25:', e);
      isLoading = false;
      setTimeout(function() {
        loadSvgSprite();
      }, 100);
    }
  }
  
  function updateSvgSprite(newHtml) {
    if (!newHtml) return;
    
    // \u4F18\u5148\u66F4\u65B0\u5171\u4EAB\u5305\u7684 sprite\uFF08\u5982\u679C\u5B58\u5728\uFF09
    var btcSprite = document.getElementById('btc-svg-sprite');
    if (btcSprite) {
      // \u79FB\u9664\u65E7\u7684\u5E94\u7528\u5185\u56FE\u6807\uFF0C\u6DFB\u52A0\u65B0\u7684
      var oldSymbols = btcSprite.querySelectorAll('symbol[id="icon-windmill"], symbol[id="icon-star"]');
      oldSymbols.forEach(function(symbol) {
        symbol.remove();
      });
      
      // \u6DFB\u52A0\u65B0\u56FE\u6807
      if (newHtml) {
        btcSprite.innerHTML = btcSprite.innerHTML + newHtml;
      }
      
      currentHtml = newHtml;
      return;
    }
    
    // \u5426\u5219\u66F4\u65B0\u81EA\u5DF1\u7684 sprite
    var sprite = document.getElementById(svgSpriteId);
    if (sprite) {
      sprite.innerHTML = newHtml;
      currentHtml = newHtml;
    } else {
      currentHtml = newHtml;
      isLoaded = false;
      loadSvgSprite();
    }
  }
  
  // \u76D1\u542C Vite HMR WebSocket \u6D88\u606F
  // \u6CE8\u610F\uFF1A\u5728 qiankun \u73AF\u5883\u4E2D\uFF0C\u4E0D\u80FD\u4F7F\u7528 import.meta.hot\uFF0C\u6240\u4EE5\u4F7F\u7528 WebSocket \u76D1\u542C
  if (typeof window !== 'undefined') {
    // \u76D1\u542C Vite WebSocket \u6D88\u606F
    // Vite \u7684 WebSocket \u6D88\u606F\u683C\u5F0F: {"type":"custom","event":"svg-hmr-update","data":{...}}
    var checkInterval = setInterval(function() {
      // \u5C1D\u8BD5\u901A\u8FC7\u591A\u79CD\u65B9\u5F0F\u8BBF\u95EE Vite \u7684 WebSocket
      var viteWs = null;
      
      // \u65B9\u5F0F1: \u901A\u8FC7\u5168\u5C40\u53D8\u91CF
      if (window.__VITE_WS__) {
        viteWs = window.__VITE_WS__;
      } else if (window.__VITE_HMR_WS__) {
        viteWs = window.__VITE_HMR_WS__;
      }
      
      // \u65B9\u5F0F2: \u901A\u8FC7 Vite \u5BA2\u6237\u7AEF\u5B9E\u4F8B
      if (!viteWs && window.__VITE_HMR_RUNTIME__) {
        var runtime = window.__VITE_HMR_RUNTIME__;
        if (runtime.ws) {
          viteWs = runtime.ws;
        }
      }
      
      if (viteWs) {
        // \u68C0\u67E5\u662F\u5426\u5DF2\u7ECF\u6DFB\u52A0\u4E86\u76D1\u542C\u5668
        if (!viteWs._svgHmrListenerAdded) {
          viteWs.addEventListener('message', function(event) {
            try {
              var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
              if (data && data.type === 'custom' && data.event === 'svg-hmr-update' && data.data && data.data.svgHtml) {
                updateSvgSprite(data.data.svgHtml);
              }
            } catch (e) {
              // \u5FFD\u7565\u89E3\u6790\u9519\u8BEF
            }
          });
          viteWs._svgHmrListenerAdded = true;
          clearInterval(checkInterval);
        }
      }
    }, 100);
    
    // 10\u79D2\u540E\u505C\u6B62\u68C0\u67E5
    setTimeout(function() {
      clearInterval(checkInterval);
    }, 10000);
  }
  
  // \u4F7F\u7528 MutationObserver \u76D1\u542C DOM \u53D8\u5316\uFF08\u9002\u914D qiankun\uFF09
  // \u53EA\u5728 btc-svg-sprite \u51FA\u73B0\u65F6\u6DFB\u52A0\u56FE\u6807
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function(mutations) {
      if (document.body) {
        var btcSprite = document.getElementById('btc-svg-sprite');
        if (btcSprite && !hasIcons(btcSprite) && !isLoaded) {
          loadSvgSprite();
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
  
  // \u5EF6\u8FDF\u52A0\u8F7D\uFF0C\u786E\u4FDD\u5171\u4EAB\u5305\u7684 sprite \u5148\u52A0\u8F7D
  function tryLoad() {
    var btcSprite = document.getElementById('btc-svg-sprite');
    if (btcSprite) {
      // \u5982\u679C\u5171\u4EAB\u5305\u7684 sprite \u5DF2\u5B58\u5728\uFF0C\u68C0\u67E5\u662F\u5426\u6709\u5185\u5BB9
      // \u7B49\u5F85\u5171\u4EAB\u5305\u63D2\u4EF6\u5B8C\u6210\u521D\u59CB\u5316\uFF08\u901A\u5E38\u9700\u8981\u4E00\u70B9\u65F6\u95F4\uFF09
      var checkContent = setInterval(function() {
        if (btcSprite.innerHTML.trim().length > 0) {
          clearInterval(checkContent);
          loadSvgSprite();
        }
      }, 50);
      
      // \u6700\u591A\u7B49\u5F85 2 \u79D2
      setTimeout(function() {
        clearInterval(checkContent);
        if (!isLoaded) {
          loadSvgSprite();
        }
      }, 2000);
    } else if (document.body) {
      // \u5982\u679C body \u5B58\u5728\u4F46 sprite \u4E0D\u5B58\u5728\uFF0C\u7B49\u5F85\u4E00\u4E0B\u518D\u8BD5
      setTimeout(function() {
        if (!isLoaded) {
          tryLoad();
        }
      }, 200);
    }
  }
  
  // \u7ACB\u5373\u5C1D\u8BD5\u52A0\u8F7D
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryLoad);
  } else {
    // \u5EF6\u8FDF\u4E00\u70B9\u65F6\u95F4\uFF0C\u786E\u4FDD\u5171\u4EAB\u5305\u7684\u63D2\u4EF6\u5148\u6267\u884C
    setTimeout(tryLoad, 100);
  }
})();
</script>`;
      if (html.includes("</head>")) {
        return html.replace("</head>", `${script}
</head>`);
      } else if (html.includes("</body>")) {
        return html.replace("</body>", `${script}
</body>`);
      } else {
        return html + script;
      }
    }
  };
}

// vite.config.ts
var __vite_injected_original_import_meta_url6 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/apps/system-app/vite.config.ts";
var appDir = fileURLToPath6(new URL(".", __vite_injected_original_import_meta_url6));
var proxy2 = getProxyConfig();
var vite_config_default = defineConfig(
  createSubAppViteConfig({
    appName: "system-app",
    appDir,
    qiankunName: "system",
    customPlugins: [
      // 添加 duty 静态文件插件，在开发服务器层面处理 /duty/ 路径
      dutyStaticPlugin(appDir),
      // 注入静态兜底标题
      injectFallbackTitle({ packageName: "system-app" }),
      // 应用级别的 SVG HMR 插件（支持热更新，无需重新构建共享包）
      svgHmrPlugin(appDir)
    ],
    customServer: { proxy: proxy2 },
    proxy: proxy2,
    btcOptions: {
      svg: {
        allowAppIcons: true
        // 启用应用内图标（src/assets/icons）
      }
    }
  })
);
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL2ZhY3Rvcmllcy9zdWJhcHAuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS91dGlscy9wYXRoLWhlbHBlcnMudHMiLCAiLi4vLi4vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlLWFwcC1jb25maWcudHMiLCAiLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvcmUvc3JjL2NvbmZpZ3MvYXBwLWVudi5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL2Jhc2UuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL21hbnVhbC1jaHVua3MudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvcm9sbHVwLWNvbmZpZy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jbGVhbi50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jaHVuay50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy91cmwudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY29ycy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jc3MudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvdmVyc2lvbi50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9yZXNvbHZlLWxvZ28udHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvdXBsb2FkLWljb25zLXRvLW9zcy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9yZXBsYWNlLWljb25zLXdpdGgtY2RuLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2R1dHktc3RhdGljLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2xvY2FsZXMtc3RhdGljLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VwbG9hZC1jZG4udHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY2RuLWFzc2V0cy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jZG4taW1wb3J0LnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3Jlc29sdmUtYnRjLWltcG9ydHMudHMiLCAic3JjL2NvbmZpZy9wcm94eS50cyIsICJ2aXRlLXBsdWdpbnMvc3ZnLWhtci50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxzeXN0ZW0tYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcc3lzdGVtLWFwcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9hcHBzL3N5c3RlbS1hcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5pbXBvcnQgeyBjcmVhdGVTdWJBcHBWaXRlQ29uZmlnIH0gZnJvbSAnLi4vLi4vY29uZmlncy92aXRlL2ZhY3Rvcmllcy9zdWJhcHAuY29uZmlnJztcbmltcG9ydCB7IGR1dHlTdGF0aWNQbHVnaW4gfSBmcm9tICcuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucyc7XG5pbXBvcnQgeyBpbmplY3RGYWxsYmFja1RpdGxlIH0gZnJvbSAnQGJ0Yy92aXRlLXBsdWdpbic7XG5pbXBvcnQgeyBnZXRQcm94eUNvbmZpZyB9IGZyb20gJy4vc3JjL2NvbmZpZy9wcm94eSc7XG5pbXBvcnQgeyBzdmdIbXJQbHVnaW4gfSBmcm9tICcuL3ZpdGUtcGx1Z2lucy9zdmctaG1yJztcblxuY29uc3QgYXBwRGlyID0gZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuJywgaW1wb3J0Lm1ldGEudXJsKSk7XG5cbi8vIFx1ODNCN1x1NTNENiBwcm94eSBcdTkxNERcdTdGNkVcdUZGMDhcdTRGN0ZcdTc1MjhcdTUxRkRcdTY1NzBcdUZGMENcdTkwN0ZcdTUxNERcdTU3MjhcdTZBMjFcdTU3NTdcdTUyQTBcdThGN0RcdTY1RjZcdTg5RTNcdTY3OTAgQGJ0Yy9zaGFyZWQtY29yZVx1RkYwOVxuY29uc3QgcHJveHkgPSBnZXRQcm94eUNvbmZpZygpO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoXG4gIGNyZWF0ZVN1YkFwcFZpdGVDb25maWcoe1xuICAgIGFwcE5hbWU6ICdzeXN0ZW0tYXBwJyxcbiAgICBhcHBEaXIsXG4gICAgcWlhbmt1bk5hbWU6ICdzeXN0ZW0nLFxuICAgIGN1c3RvbVBsdWdpbnM6IFtcbiAgICAgIC8vIFx1NkRGQlx1NTJBMCBkdXR5IFx1OTc1OVx1NjAwMVx1NjU4N1x1NEVGNlx1NjNEMlx1NEVGNlx1RkYwQ1x1NTcyOFx1NUYwMFx1NTNEMVx1NjcwRFx1NTJBMVx1NTY2OFx1NUM0Mlx1OTc2Mlx1NTkwNFx1NzQwNiAvZHV0eS8gXHU4REVGXHU1Rjg0XG4gICAgICBkdXR5U3RhdGljUGx1Z2luKGFwcERpciksXG4gICAgICAvLyBcdTZDRThcdTUxNjVcdTk3NTlcdTYwMDFcdTUxNUNcdTVFOTVcdTY4MDdcdTk4OThcbiAgICAgIGluamVjdEZhbGxiYWNrVGl0bGUoeyBwYWNrYWdlTmFtZTogJ3N5c3RlbS1hcHAnIH0pLFxuICAgICAgLy8gXHU1RTk0XHU3NTI4XHU3RUE3XHU1MjJCXHU3Njg0IFNWRyBITVIgXHU2M0QyXHU0RUY2XHVGRjA4XHU2NTJGXHU2MzAxXHU3MEVEXHU2NkY0XHU2NUIwXHVGRjBDXHU2NUUwXHU5NzAwXHU5MUNEXHU2NUIwXHU2Nzg0XHU1RUZBXHU1MTcxXHU0RUFCXHU1MzA1XHVGRjA5XG4gICAgICBzdmdIbXJQbHVnaW4oYXBwRGlyKSxcbiAgICBdLFxuICAgIGN1c3RvbVNlcnZlcjogeyBwcm94eSB9LFxuICAgIHByb3h5LFxuICAgIGJ0Y09wdGlvbnM6IHtcbiAgICAgIHN2Zzoge1xuICAgICAgICBhbGxvd0FwcEljb25zOiB0cnVlLCAvLyBcdTU0MkZcdTc1MjhcdTVFOTRcdTc1MjhcdTUxODVcdTU2RkVcdTY4MDdcdUZGMDhzcmMvYXNzZXRzL2ljb25zXHVGRjA5XG4gICAgICB9LFxuICAgIH0sXG4gIH0pXG4pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxmYWN0b3JpZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXGZhY3Rvcmllc1xcXFxzdWJhcHAuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9mYWN0b3JpZXMvc3ViYXBwLmNvbmZpZy50c1wiOy8qKlxuICogXHU1QjUwXHU1RTk0XHU3NTI4IFZpdGUgXHU5MTREXHU3RjZFXHU1REU1XHU1MzgyXG4gKiBcdTc1MUZcdTYyMTBcdTVCNTBcdTVFOTRcdTc1MjhcdTc2ODRcdTVCOENcdTY1NzQgVml0ZSBcdTkxNERcdTdGNkVcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFVzZXJDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlc29sdmUsIGRpcm5hbWUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5pbXBvcnQgeyBjcmVhdGVSZXF1aXJlIH0gZnJvbSAnbW9kdWxlJztcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcbmltcG9ydCB2dWVKc3ggZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlLWpzeCc7XG5pbXBvcnQgcWlhbmt1biBmcm9tICd2aXRlLXBsdWdpbi1xaWFua3VuJztcbmltcG9ydCBVbm9DU1MgZnJvbSAndW5vY3NzL3ZpdGUnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyBjcmVhdGVQYXRoSGVscGVycyB9IGZyb20gJy4uL3V0aWxzL3BhdGgtaGVscGVycyc7XG5cbi8vIFx1ODNCN1x1NTNENlx1NUY1M1x1NTI0RFx1NjU4N1x1NEVGNlx1NzY4NFx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFx1RkYwOEVTTSBcdTY1QjlcdTVGMEZcdUZGMDlcbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSBkaXJuYW1lKF9fZmlsZW5hbWUpO1xuXG4vLyBcdTVFRjZcdThGREZcdTUyQTBcdThGN0QgVnVlSTE4blBsdWdpblx1RkYwQ1x1NEVDRVx1NUU5NFx1NzUyOFx1NzZFRVx1NUY1NVx1ODlFM1x1Njc5MFxuLy8gXHU0RjdGXHU3NTI4XHU1MUZEXHU2NTcwXHU1MTg1XHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHVGRjBDXHU3ODZFXHU0RkREXHU0RUNFXHU4QzAzXHU3NTI4XHU4MDA1XHU3Njg0IG5vZGVfbW9kdWxlcyBcdTg5RTNcdTY3OTBcbmltcG9ydCB7IHBhdGhUb0ZpbGVVUkwgfSBmcm9tICdub2RlOnVybCc7XG5mdW5jdGlvbiBnZXRWdWVJMThuUGx1Z2luKGFwcERpcjogc3RyaW5nKSB7XG4gIC8vIFx1NEY3Rlx1NzUyOCBjcmVhdGVSZXF1aXJlIFx1NEVDRVx1NUU5NFx1NzUyOFx1NzZFRVx1NUY1NVx1ODlFM1x1Njc5MFx1NTMwNVxuICAvLyBcdTkwMUFcdThGQzcgZmlsZTovLyBVUkwgXHU1MjFCXHU1RUZBXHU2QjYzXHU3ODZFXHU3Njg0IHJlcXVpcmUgXHU0RTBBXHU0RTBCXHU2NTg3XG4gIGNvbnN0IGFwcERpclVybCA9IHBhdGhUb0ZpbGVVUkwocmVzb2x2ZShhcHBEaXIsICdwYWNrYWdlLmpzb24nKSkuaHJlZjtcbiAgY29uc3QgcmVxdWlyZSA9IGNyZWF0ZVJlcXVpcmUoYXBwRGlyVXJsKTtcbiAgY29uc3QgcGx1Z2luID0gcmVxdWlyZSgnQGludGxpZnkvdW5wbHVnaW4tdnVlLWkxOG4vdml0ZScpO1xuICByZXR1cm4gcGx1Z2luLmRlZmF1bHQgfHwgcGx1Z2luO1xufVxuaW1wb3J0IHsgY3JlYXRlQXV0b0ltcG9ydENvbmZpZywgY3JlYXRlQ29tcG9uZW50c0NvbmZpZyB9IGZyb20gJy4uLy4uL2F1dG8taW1wb3J0LmNvbmZpZyc7XG5pbXBvcnQgeyBidGMsIGZpeENodW5rUmVmZXJlbmNlc1BsdWdpbiB9IGZyb20gJ0BidGMvdml0ZS1wbHVnaW4nO1xuaW1wb3J0IHsgZ2V0Vml0ZUFwcENvbmZpZywgZ2V0QmFzZVVybCwgZ2V0UHVibGljRGlyIH0gZnJvbSAnLi4vLi4vdml0ZS1hcHAtY29uZmlnJztcbmltcG9ydCB7IGNyZWF0ZUJhc2VSZXNvbHZlIH0gZnJvbSAnLi4vYmFzZS5jb25maWcnO1xuaW1wb3J0IHsgY3JlYXRlUm9sbHVwQ29uZmlnIH0gZnJvbSAnLi4vcGx1Z2lucy9yb2xsdXAtY29uZmlnJztcbmltcG9ydCB7XG4gIGNsZWFuRGlzdFBsdWdpbixcbiAgY2h1bmtWZXJpZnlQbHVnaW4sXG4gIG9wdGltaXplQ2h1bmtzUGx1Z2luLFxuICBlbnN1cmVCYXNlVXJsUGx1Z2luLFxuICBjb3JzUGx1Z2luLFxuICBlbnN1cmVDc3NQbHVnaW4sXG4gIGFkZFZlcnNpb25QbHVnaW4sXG4gIHJlcGxhY2VJY29uc1dpdGhDZG5QbHVnaW4sXG4gIHJlc29sdmVMb2dvUGx1Z2luLFxuICB1cGxvYWRDZG5QbHVnaW4sXG4gIGNkbkFzc2V0c1BsdWdpbixcbiAgY2RuSW1wb3J0UGx1Z2luLFxuICByZXNvbHZlQnRjSW1wb3J0c1BsdWdpbixcbiAgbG9jYWxlc1N0YXRpY1BsdWdpbixcbn0gZnJvbSAnLi4vcGx1Z2lucyc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN1YkFwcFZpdGVDb25maWdPcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NTk4MiAnYWRtaW4tYXBwJ1x1RkYwOVxuICAgKi9cbiAgYXBwTmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogXHU1RTk0XHU3NTI4XHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XG4gICAqL1xuICBhcHBEaXI6IHN0cmluZztcbiAgLyoqXG4gICAqIFFpYW5rdW4gXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHVGRjA4XHU1OTgyICdhZG1pbidcdUZGMDlcbiAgICovXG4gIHFpYW5rdW5OYW1lOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTYzRDJcdTRFRjZcdTUyMTdcdTg4NjhcbiAgICovXG4gIGN1c3RvbVBsdWdpbnM/OiBQbHVnaW5bXTtcbiAgLyoqXG4gICAqIFx1ODFFQVx1NUI5QVx1NEU0OVx1Njc4NFx1NUVGQVx1OTE0RFx1N0Y2RVxuICAgKi9cbiAgY3VzdG9tQnVpbGQ/OiBQYXJ0aWFsPFVzZXJDb25maWdbJ2J1aWxkJ10+O1xuICAvKipcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5XHU2NzBEXHU1MkExXHU1NjY4XHU5MTREXHU3RjZFXG4gICAqL1xuICBjdXN0b21TZXJ2ZXI/OiBQYXJ0aWFsPFVzZXJDb25maWdbJ3NlcnZlciddPjtcbiAgLyoqXG4gICAqIFx1ODFFQVx1NUI5QVx1NEU0OVx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1OTE0RFx1N0Y2RVxuICAgKi9cbiAgY3VzdG9tUHJldmlldz86IFBhcnRpYWw8VXNlckNvbmZpZ1sncHJldmlldyddPjtcbiAgLyoqXG4gICAqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NEYxOFx1NTMxNlx1NEY5RFx1OEQ1Nlx1OTE0RFx1N0Y2RVxuICAgKi9cbiAgY3VzdG9tT3B0aW1pemVEZXBzPzogUGFydGlhbDxVc2VyQ29uZmlnWydvcHRpbWl6ZURlcHMnXT47XG4gIC8qKlxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDkgQ1NTIFx1OTE0RFx1N0Y2RVxuICAgKi9cbiAgY3VzdG9tQ3NzPzogUGFydGlhbDxVc2VyQ29uZmlnWydjc3MnXT47XG4gIC8qKlxuICAgKiBcdTRFRTNcdTc0MDZcdTkxNERcdTdGNkVcbiAgICovXG4gIHByb3h5PzogUmVjb3JkPHN0cmluZywgYW55PjtcbiAgLyoqXG4gICAqIEJUQyBcdTYzRDJcdTRFRjZcdTkxNERcdTdGNkVcbiAgICovXG4gIGJ0Y09wdGlvbnM/OiB7XG4gICAgdHlwZT86ICdzdWJhcHAnO1xuICAgIHByb3h5PzogUmVjb3JkPHN0cmluZywgYW55PjtcbiAgICBlcHM/OiB7XG4gICAgICBlbmFibGU/OiBib29sZWFuO1xuICAgICAgZGljdD86IGJvb2xlYW47XG4gICAgICBkaXN0Pzogc3RyaW5nO1xuICAgIH07XG4gICAgc3ZnPzoge1xuICAgICAgc2tpcE5hbWVzPzogc3RyaW5nW107XG4gICAgfTtcbiAgfTtcbiAgLyoqXG4gICAqIFZ1ZUkxOG4gXHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFXG4gICAqL1xuICB2dWVJMThuT3B0aW9ucz86IHtcbiAgICBpbmNsdWRlPzogc3RyaW5nW107XG4gICAgcnVudGltZU9ubHk/OiBib29sZWFuO1xuICB9O1xuICAvKipcbiAgICogUWlhbmt1biBcdTYzRDJcdTRFRjZcdTkxNERcdTdGNkVcbiAgICovXG4gIHFpYW5rdW5PcHRpb25zPzoge1xuICAgIHVzZURldk1vZGU/OiBib29sZWFuO1xuICB9O1xufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQVx1NUI1MFx1NUU5NFx1NzUyOCBWaXRlIFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ViQXBwVml0ZUNvbmZpZyhvcHRpb25zOiBTdWJBcHBWaXRlQ29uZmlnT3B0aW9ucyk6IFVzZXJDb25maWcge1xuICBjb25zdCB7XG4gICAgYXBwTmFtZSxcbiAgICBhcHBEaXIsXG4gICAgcWlhbmt1bk5hbWUsXG4gICAgY3VzdG9tUGx1Z2lucyA9IFtdLFxuICAgIGN1c3RvbUJ1aWxkLFxuICAgIGN1c3RvbVNlcnZlcixcbiAgICBjdXN0b21QcmV2aWV3LFxuICAgIGN1c3RvbU9wdGltaXplRGVwcyxcbiAgICBjdXN0b21Dc3MsXG4gICAgcHJveHkgPSB7fSxcbiAgICBidGNPcHRpb25zID0ge30sXG4gICAgdnVlSTE4bk9wdGlvbnMsXG4gICAgcWlhbmt1bk9wdGlvbnMgPSB7IHVzZURldk1vZGU6IHRydWUgfSxcbiAgfSA9IG9wdGlvbnM7XG5cbiAgLy8gXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXG4gIGNvbnN0IGFwcENvbmZpZyA9IGdldFZpdGVBcHBDb25maWcoYXBwTmFtZSk7XG4gIC8vIFx1NEY3Rlx1NzUyOFx1NUJGQ1x1NTE2NVx1NzY4NCBjcmVhdGVQYXRoSGVscGVyc1xuICBjb25zdCB7IHdpdGhSb290IH0gPSBjcmVhdGVQYXRoSGVscGVycyhhcHBEaXIpO1xuXG4gIC8vIFx1NTIyNFx1NjVBRFx1NjYyRlx1NTQyNlx1NEUzQVx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVxuICBjb25zdCBpc1ByZXZpZXdCdWlsZCA9IHByb2Nlc3MuZW52LlZJVEVfUFJFVklFVyA9PT0gJ3RydWUnO1xuICBjb25zdCBiYXNlVXJsID0gZ2V0QmFzZVVybChhcHBOYW1lLCBpc1ByZXZpZXdCdWlsZCk7XG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NUI1MFx1NUU5NFx1NzUyOFx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1Nzk4MVx1NzUyOCBwdWJsaWNEaXJcdUZGMENcdTkwN0ZcdTUxNERcdTYyNTNcdTUzMDVcdTU2RkVcdTY4MDdcdTdCNDlcdTk3NTlcdTYwMDFcdThENDRcdTZFOTBcbiAgLy8gXHU1NkZFXHU2ODA3XHU3QjQ5XHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU1RTk0XHU4QkU1XHU3NTMxIGxheW91dC1hcHAgXHU3RURGXHU0RTAwXHU3QkExXHU3NDA2XG4gIC8vIFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NEVDRFx1NzEzNlx1OTcwMFx1ODk4MSBwdWJsaWNEaXIgXHU2NzY1XHU2NzBEXHU1MkExXHU5NzU5XHU2MDAxXHU2NTg3XHU0RUY2XG4gIGNvbnN0IHB1YmxpY0RpciA9IGlzUHJldmlld0J1aWxkID8gZ2V0UHVibGljRGlyKGFwcE5hbWUsIGFwcERpcikgOiBmYWxzZTtcblxuICAvLyBcdTgzQjdcdTUzRDZcdTRFM0JcdTVFOTRcdTc1MjhcdTkxNERcdTdGNkVcbiAgY29uc3QgbWFpbkFwcENvbmZpZyA9IGdldFZpdGVBcHBDb25maWcoJ21haW4tYXBwJyk7XG4gIGNvbnN0IG1haW5BcHBQb3J0ID0gbWFpbkFwcENvbmZpZy5wcmVQb3J0LnRvU3RyaW5nKCk7XG5cbiAgLy8gXHU1MTczXHU5NTJFXHVGRjFBRVBTIFx1NzY4NCBvdXRwdXREaXIgXHU1RkM1XHU5ODdCXHU0RjdGXHU3NTI4XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU1N0ZBXHU0RThFIGFwcERpciBcdTg5RTNcdTY3OTBcbiAgLy8gXHU5MDdGXHU1MTREXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU1NkUwXHU0RTNBXHU1REU1XHU0RjVDXHU3NkVFXHU1RjU1XHU1M0Q4XHU1MzE2XHU4MDBDXHU1NzI4IGRpc3QgXHU3NkVFXHU1RjU1XHU0RTBCXHU1MjFCXHU1RUZBIGJ1aWxkIFx1NzZFRVx1NUY1NVxuICBjb25zdCBlcHNPdXRwdXREaXIgPSByZXNvbHZlKGFwcERpciwgJ2J1aWxkJywgJ2VwcycpO1xuXG4gIC8vIFx1NTE3MVx1NEVBQlx1NzY4NCBFUFMgXHU2NTcwXHU2MzZFXHU2RTkwXHU3NkVFXHU1RjU1XHVGRjA4XHU0RUNFIG1haW4tYXBwIFx1OEJGQlx1NTNENlx1RkYwOVxuICAvLyBcdTVCNTBcdTVFOTRcdTc1MjhcdTRGMThcdTUxNDhcdTRFQ0UgbWFpbi1hcHAgXHU3Njg0IGJ1aWxkL2VwcyBcdThCRkJcdTUzRDYgRVBTIFx1NjU3MFx1NjM2RVx1RkYwQ1x1NUI5RVx1NzNCMFx1NzcxRlx1NkI2M1x1NzY4NFx1NTE3MVx1NEVBQlxuICBjb25zdCBzaGFyZWRFcHNEaXIgPSByZXNvbHZlKGFwcERpciwgJy4uLy4uL2FwcHMvbWFpbi1hcHAvYnVpbGQvZXBzJyk7XG5cbiAgLy8gXHU3ODZFXHU0RkREIGVwcyBlbmFibGUgXHU1OUNCXHU3RUM4XHU0RTNBIGJvb2xlYW4gXHU3QzdCXHU1NzhCXG4gIGNvbnN0IGVwc0VuYWJsZTogYm9vbGVhbiA9IGJ0Y09wdGlvbnMuZXBzPy5lbmFibGUgPz8gdHJ1ZTtcblxuICAvLyBcdTY3ODRcdTVFRkEgZXBzIFx1OTE0RFx1N0Y2RVx1RkYwQ1x1Nzg2RVx1NEZERCBlbmFibGUgXHU1OUNCXHU3RUM4XHU0RTNBIGJvb2xlYW5cbiAgY29uc3QgZXBzQ29uZmlnOiB7XG4gICAgZW5hYmxlOiBib29sZWFuO1xuICAgIGRpY3Q6IGJvb2xlYW47XG4gICAgZGljdEFwaT86IHN0cmluZztcbiAgICBkaXN0OiBzdHJpbmc7XG4gICAgc2hhcmVkRXBzRGlyOiBzdHJpbmc7XG4gIH0gPSB7XG4gICAgZW5hYmxlOiBlcHNFbmFibGUsXG4gICAgZGljdDogYnRjT3B0aW9ucy5lcHM/LmRpY3QgPz8gdHJ1ZSwgLy8gXHU5RUQ4XHU4QkE0XHU1NDJGXHU3NTI4XHU1QjU3XHU1MTc4XHU1MjlGXHU4MEZEXG4gICAgZGljdEFwaTogYnRjT3B0aW9ucy5lcHM/LmRpY3RBcGkgfHwgJy9hcGkvc3lzdGVtL2F1dGgvZGljdCcsIC8vIFx1OUVEOFx1OEJBNFx1NUI1N1x1NTE3OFx1NjNBNVx1NTNFM1xuICAgIGRpc3Q6IGVwc091dHB1dERpcixcbiAgICBzaGFyZWRFcHNEaXI6IHNoYXJlZEVwc0RpcixcbiAgfTtcblxuICAvLyBcdTY3ODRcdTVFRkFcdTYzRDJcdTRFRjZcdTUyMTdcdTg4NjhcbiAgY29uc3QgcGx1Z2luczogUGx1Z2luW10gPSBbXG4gICAgLy8gMS4gXHU2RTA1XHU3NDA2XHU2M0QyXHU0RUY2XG4gICAgY2xlYW5EaXN0UGx1Z2luKGFwcERpciksXG4gICAgLy8gMi4gQ09SUyBcdTYzRDJcdTRFRjZcbiAgICBjb3JzUGx1Z2luKCksXG4gICAgLy8gMy4gXHU4OUUzXHU2NzkwIEBidGMvKiBcdTUzMDVcdTVCRkNcdTUxNjVcdTYzRDJcdTRFRjZcdUZGMDhcdTU3MjggTG9nbyBcdTYzRDJcdTRFRjZcdTRFNEJcdTUyNERcdUZGMENcdTc4NkVcdTRGRERcdTgwRkRcdTU5MUZcdTg5RTNcdTY3OTBcdTRFQ0VcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDVcdTRFMkRcdTVCRkNcdTUxNjVcdTc2ODQgQGJ0Yy8qIFx1NkEyMVx1NTc1N1x1RkYwOVxuICAgIHJlc29sdmVCdGNJbXBvcnRzUGx1Z2luKHsgYXBwRGlyIH0pLFxuICAgIC8vIDQuIExvZ28gXHU4REVGXHU1Rjg0XHU4OUUzXHU2NzkwXHU2M0QyXHU0RUY2XHVGRjA4XHU1NzI4XHU4MUVBXHU1QjlBXHU0RTQ5XHU2M0QyXHU0RUY2XHU0RTRCXHU1MjREXHVGRjBDXHU3ODZFXHU0RkREIC9sb2dvLnBuZyBcdTgwRkRcdTg4QUJcdTZCNjNcdTc4NkVcdTg5RTNcdTY3OTBcdUZGMDlcbiAgICByZXNvbHZlTG9nb1BsdWdpbihhcHBEaXIpLFxuICAgIC8vIDQuNS4gTG9jYWxlcyBcdTk3NTlcdTYwMDFcdTY1ODdcdTRFRjZcdTYzRDJcdTRFRjZcdUZGMDhcdTYzRDBcdTRGOUIgc3JjL2xvY2FsZXMvKi5qc29uIFx1NjU4N1x1NEVGNlx1RkYwQ1x1NEY5Qlx1NEUzQlx1NUU5NFx1NzUyOFx1OTAxQVx1OEZDNyBmZXRjaCBcdTUyQTBcdThGN0RcdUZGMDlcbiAgICBsb2NhbGVzU3RhdGljUGx1Z2luKGFwcERpciksXG4gICAgLy8gNS4gXHU4MUVBXHU1QjlBXHU0RTQ5XHU2M0QyXHU0RUY2XHVGRjA4XHU1NzI4XHU2ODM4XHU1RkMzXHU2M0QyXHU0RUY2XHU0RTRCXHU1MjREXHVGRjA5XG4gICAgLi4uY3VzdG9tUGx1Z2lucyxcbiAgICAvLyA0LiBWdWUgXHU2M0QyXHU0RUY2XG4gICAgdnVlKHtcbiAgICAgIHNjcmlwdDoge1xuICAgICAgICBmczoge1xuICAgICAgICAgIGZpbGVFeGlzdHM6IGV4aXN0c1N5bmMsXG4gICAgICAgICAgcmVhZEZpbGU6IChmaWxlOiBzdHJpbmcpID0+IHJlYWRGaWxlU3luYyhmaWxlLCAndXRmLTgnKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgLy8gNC41LiBWdWUgSlNYIFx1NjNEMlx1NEVGNlx1RkYwOFx1NjUyRlx1NjMwMSBUU1ggXHU2NTg3XHU0RUY2XHU0RTJEXHU3Njg0IEpTWCBcdThCRURcdTZDRDVcdUZGMDlcbiAgICB2dWVKc3goKSxcbiAgICAvLyA1LiBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTYzRDJcdTRFRjZcbiAgICBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnKCksXG4gICAgLy8gNi4gXHU3RUM0XHU0RUY2XHU4MUVBXHU1MkE4XHU2Q0U4XHU1MThDXHU2M0QyXHU0RUY2XG4gICAgY3JlYXRlQ29tcG9uZW50c0NvbmZpZyh7IGluY2x1ZGVTaGFyZWQ6IHRydWUgfSksXG4gICAgLy8gNy4gVW5vQ1NTIFx1NjNEMlx1NEVGNlxuICAgIFVub0NTUyh7XG4gICAgICBjb25maWdGaWxlOiB3aXRoUm9vdCgndW5vLmNvbmZpZy50cycpLFxuICAgIH0pLFxuICAgIC8vIDguIEJUQyBcdTRFMUFcdTUyQTFcdTYzRDJcdTRFRjZcbiAgICBidGMoe1xuICAgICAgdHlwZTogJ3N1YmFwcCcgYXMgYW55LFxuICAgICAgcHJveHksXG4gICAgICBlcHM6IGVwc0NvbmZpZyBhcyBhbnksIC8vIFx1N0M3Qlx1NTc4Qlx1NjVBRFx1OEEwMFx1RkYxQVx1Nzg2RVx1NEZERCBlbmFibGUgXHU1OUNCXHU3RUM4XHU0RTNBIGJvb2xlYW5cbiAgICAgIHN2Zzoge1xuICAgICAgICBza2lwTmFtZXM6IFsnYmFzZScsICdpY29ucyddLFxuICAgICAgICAuLi5idGNPcHRpb25zLnN2ZyxcbiAgICAgIH0sXG4gICAgICAuLi5idGNPcHRpb25zLFxuICAgIH0pLFxuICAgIC8vIDkuIFZ1ZUkxOG4gXHU2M0QyXHU0RUY2XG4gICAgZ2V0VnVlSTE4blBsdWdpbihhcHBEaXIpKHtcbiAgICAgIGluY2x1ZGU6IHZ1ZUkxOG5PcHRpb25zPy5pbmNsdWRlIHx8IFtcbiAgICAgICAgcmVzb2x2ZShhcHBEaXIsICdzcmMvbG9jYWxlcy8qKicpXG4gICAgICBdLFxuICAgICAgcnVudGltZU9ubHk6IHZ1ZUkxOG5PcHRpb25zPy5ydW50aW1lT25seSA/PyB0cnVlLFxuICAgIH0pLFxuICAgIC8vIDEwLiBDU1MgXHU5QThDXHU4QkMxXHU2M0QyXHU0RUY2XG4gICAgZW5zdXJlQ3NzUGx1Z2luKCksXG4gICAgLy8gMTEuIFFpYW5rdW4gXHU2M0QyXHU0RUY2XG4gICAgcWlhbmt1bihxaWFua3VuTmFtZSwgcWlhbmt1bk9wdGlvbnMpLFxuICAgIC8vIDEyLiBcdTRGRUVcdTU5MEQgY2h1bmsgXHU1RjE1XHU3NTI4XHU2M0QyXHU0RUY2XG4gICAgZml4Q2h1bmtSZWZlcmVuY2VzUGx1Z2luKCksXG4gICAgLy8gMTUuIFx1Nzg2RVx1NEZERCBiYXNlIFVSTCBcdTYzRDJcdTRFRjZcbiAgICBlbnN1cmVCYXNlVXJsUGx1Z2luKGJhc2VVcmwsIGFwcENvbmZpZy5kZXZIb3N0LCBhcHBDb25maWcucHJlUG9ydCwgbWFpbkFwcFBvcnQpLFxuICAgIC8vIDE2LiBcdTZERkJcdTUyQTBcdTcyNDhcdTY3MkNcdTUzRjdcdTYzRDJcdTRFRjZcdUZGMDhcdTRFM0EgSFRNTCBcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTZERkJcdTUyQTBcdTY1RjZcdTk1RjRcdTYyMzNcdTcyNDhcdTY3MkNcdTUzRjdcdUZGMDlcbiAgICBhZGRWZXJzaW9uUGx1Z2luKCksXG4gICAgLy8gMTYuNS4gQ0ROIFx1OEQ0NFx1NkU5MFx1NTJBMFx1OTAxRlx1NjNEMlx1NEVGNlx1RkYwOFx1NTcyOFx1NzI0OFx1NjcyQ1x1NTNGN1x1NjNEMlx1NEVGNlx1NEU0Qlx1NTQwRVx1RkYwQ1x1Nzg2RVx1NEZERFx1NzI0OFx1NjcyQ1x1NTNGN1x1NTNDMlx1NjU3MFx1ODhBQlx1NEZERFx1NzU1OVx1RkYwOVxuICAgIC8vIFx1NTkwNFx1NzQwNiBIVE1MIFx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MCBVUkxcdUZGMDg8c2NyaXB0Plx1MzAwMTxsaW5rPlx1MzAwMTxpbWc+IFx1N0I0OVx1RkYwOVxuICAgIGNkbkFzc2V0c1BsdWdpbih7XG4gICAgICBhcHBOYW1lLFxuICAgICAgZW5hYmxlZDogIWlzUHJldmlld0J1aWxkICYmIHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OICE9PSAnZmFsc2UnLFxuICAgIH0pLFxuICAgIC8vIDE2LjYuIENETiBcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdThGNkNcdTYzNjJcdTYzRDJcdTRFRjZcdUZGMDhcdThGNkNcdTYzNjJcdTRFRTNcdTc4MDFcdTRFMkRcdTc2ODQgaW1wb3J0KCkgXHU4QzAzXHU3NTI4XHVGRjA5XG4gICAgLy8gXHU1QzA2XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHU4RjZDXHU2MzYyXHU0RTNBIENETiBVUkxcdUZGMENcdTRFMEUgY2RuQXNzZXRzUGx1Z2luIFx1OTE0RFx1NTQwOFx1NUI5RVx1NzNCMFx1NUI4Q1x1NjU3NFx1NzY4NCBDRE4gXHU1MkEwXHU5MDFGXG4gICAgY2RuSW1wb3J0UGx1Z2luKHtcbiAgICAgIGFwcE5hbWUsXG4gICAgICBlbmFibGVkOiAhaXNQcmV2aWV3QnVpbGQgJiYgcHJvY2Vzcy5lbnYuRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gIT09ICdmYWxzZScsXG4gICAgfSksXG4gICAgLy8gMTYuNy4gXHU2NkZGXHU2MzYyXHU1NkZFXHU2ODA3XHU4REVGXHU1Rjg0XHU0RTNBIENETiBVUkxcdUZGMDhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMDlcbiAgICByZXBsYWNlSWNvbnNXaXRoQ2RuUGx1Z2luKCksXG4gICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU0RTBEXHU1MThEXHU5NzAwXHU4OTgxIHJlc29sdmVFeHRlcm5hbEltcG9ydHNQbHVnaW5cdUZGMENcdTU2RTBcdTRFM0FcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTYyNTNcdTUzMDUgQGJ0Yy8qIFx1NTMwNVxuICAgIC8vIDE3LiBcdTRGMThcdTUzMTYgY2h1bmtzIFx1NjNEMlx1NEVGNlxuICAgIG9wdGltaXplQ2h1bmtzUGx1Z2luKCksXG4gICAgLy8gMTguIENodW5rIFx1OUE4Q1x1OEJDMVx1NjNEMlx1NEVGNlxuICAgIGNodW5rVmVyaWZ5UGx1Z2luKCksXG4gICAgLy8gMTkuIENETiBcdTRFMEFcdTRGMjBcdTYzRDJcdTRFRjZcdUZGMDhcdTRFQzVcdTU3MjhcdTc1MUZcdTRFQTdcdTY3ODRcdTVFRkFcdTRFMTRcdTU0MkZcdTc1MjhcdTY1RjZcdUZGMDlcbiAgICAuLi4ocHJvY2Vzcy5lbnYuRU5BQkxFX0NETl9VUExPQUQgPT09ICd0cnVlJyAmJiAhaXNQcmV2aWV3QnVpbGRcbiAgICAgID8gW3VwbG9hZENkblBsdWdpbihhcHBOYW1lLCBhcHBEaXIpXVxuICAgICAgOiBbXSksXG4gIF07XG5cbiAgLy8gXHU2Nzg0XHU1RUZBXHU5MTREXHU3RjZFXG4gIGNvbnN0IGJ1aWxkQ29uZmlnOiBVc2VyQ29uZmlnWydidWlsZCddID0ge1xuICAgIHRhcmdldDogJ2VzMjAyMCcsXG4gICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICBjc3NDb2RlU3BsaXQ6IGZhbHNlLFxuICAgIGNzc01pbmlmeTogdHJ1ZSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc5ODFcdTc1MjhcdTRFRTNcdTc4MDFcdTUzOEJcdTdGMjlcdUZGMENcdTkwN0ZcdTUxNEQgVGVyc2VyIFx1NTM4Qlx1N0YyOVx1NUJGQ1x1ODFGNFx1NzY4NFx1NUJGOVx1OEM2MVx1NUM1RVx1NjAyN1x1NTIwNlx1OTY5NFx1N0IyNlx1NEUyMlx1NTkzMVx1OTVFRVx1OTg5OFxuICAgIG1pbmlmeTogZmFsc2UsXG5cbiAgICBhc3NldHNJbmxpbmVMaW1pdDogMTAgKiAxMDI0LFxuICAgIG91dERpcjogcHJvY2Vzcy5lbnYuQlVJTERfT1VUX0RJUiB8fCAnZGlzdCcsXG4gICAgYXNzZXRzRGlyOiAnYXNzZXRzJyxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc5ODFcdTc1MjggVml0ZSBcdTc2ODRcdTgxRUFcdTUyQThcdTZFMDVcdTc0MDZcdUZGMENcdTU2RTBcdTRFM0FcdTYyMTFcdTRFRUNcdTVERjJcdTdFQ0ZcdTY3MDkgY2xlYW5EaXN0UGx1Z2luIFx1NTcyOFx1Njc4NFx1NUVGQVx1NTI0RFx1NkUwNVx1NzQwNlxuICAgIC8vIFx1OEZEOVx1NjgzN1x1NTNFRlx1NEVFNVx1OTA3Rlx1NTE0RCBXaW5kb3dzIFx1NEUwQVx1NzY4NFx1NjU4N1x1NEVGNlx1OTUwMVx1NUI5QVx1OTVFRVx1OTg5OFx1RkYwOEVCVVNZXHVGRjA5XG4gICAgLy8gY2xlYW5EaXN0UGx1Z2luIFx1NURGMlx1N0VDRlx1NjcwOVx1OTFDRFx1OEJENVx1NjczQVx1NTIzNlx1RkYwODVcdTZCMjFcdUZGMENcdTkwMTJcdTU4OUVcdTdCNDlcdTVGODVcdTY1RjZcdTk1RjRcdUZGMDlcdUZGMENcdTU5ODJcdTY3OUNcdTZFMDVcdTc0MDZcdTU5MzFcdThEMjVcdTRGMUFcdTdFRTdcdTdFRURcdTY3ODRcdTVFRkFcbiAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU5ODJcdTY3OUNcdTZFMDVcdTc0MDZcdTU5MzFcdThEMjVcdUZGMENcdTY1RTdcdTc2ODRcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTRFMERcdTRGMUFcdTg4QUJcdTUyMjBcdTk2NjRcdUZGMENcdTUzRUZcdTgwRkRcdTVCRkNcdTgxRjRcdTkxQ0RcdTU5MERcdTY1ODdcdTRFRjZcbiAgICBlbXB0eU91dERpcjogZmFsc2UsXG4gICAgLy8gXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU2MjUzXHU1MzA1IEBidGMvKiBcdTUzMDVcdTU0OEMgQGNvbmZpZ3MgXHU1MzA1XHVGRjBDXHU5MDdGXHU1MTREXHU4RkQwXHU4ODRDXHU2NUY2XHU2QTIxXHU1NzU3XHU4OUUzXHU2NzkwXHU5NUVFXHU5ODk4XG4gICAgcm9sbHVwT3B0aW9uczogY3JlYXRlUm9sbHVwQ29uZmlnKGFwcE5hbWUsIHtcbiAgICAgIGV4dGVybmFsQnRjUGFja2FnZXM6IGZhbHNlLCAvLyBcdTY2M0VcdTVGMEZcdThCQkVcdTdGNkVcdTRFM0EgZmFsc2VcdUZGMENcdTYyNTNcdTUzMDUgQGJ0Yy8qIFx1NTMwNVxuICAgICAgZXh0ZXJuYWxDb25maWdzUGFja2FnZXM6IGZhbHNlLCAvLyBcdTY2M0VcdTVGMEZcdThCQkVcdTdGNkVcdTRFM0EgZmFsc2VcdUZGMENcdTYyNTNcdTUzMDUgQGNvbmZpZ3MgXHU1MzA1XG4gICAgfSksXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxuICAgIC4uLmN1c3RvbUJ1aWxkLFxuICB9O1xuXG4gIC8vIFx1NjcwRFx1NTJBMVx1NTY2OFx1OTE0RFx1N0Y2RVxuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGMThcdTUxNDhcdTRGN0ZcdTc1MjggY3VzdG9tU2VydmVyLnByb3h5XHVGRjBDXHU1OTgyXHU2NzlDXHU0RTBEXHU1QjU4XHU1NzI4XHU1MjE5XHU0RjdGXHU3NTI4IHByb3h5IFx1NTNDMlx1NjU3MFxuICAvLyBcdTZDRThcdTYxMEZcdUZGMUFjdXN0b21TZXJ2ZXIgXHU0RjFBXHU1NzI4XHU2NzAwXHU1NDBFXHU1QzU1XHU1RjAwXHVGRjBDXHU1OTgyXHU2NzlDXHU1MzA1XHU1NDJCIHByb3h5IFx1NEYxQVx1ODk4Nlx1NzZENlx1OEZEOVx1OTFDQ1x1NzY4NFx1OEJCRVx1N0Y2RVxuICBjb25zdCBmaW5hbFByb3h5ID0gY3VzdG9tU2VydmVyPy5wcm94eSAhPT0gdW5kZWZpbmVkID8gY3VzdG9tU2VydmVyLnByb3h5IDogcHJveHk7XG4gIGNvbnN0IHsgcHJveHk6IF9jdXN0b21Qcm94eSwgLi4ucmVzdEN1c3RvbVNlcnZlciB9ID0gY3VzdG9tU2VydmVyIHx8IHt9O1xuICAvLyBcdTZERkJcdTUyQTBcdTc2RDFcdTYzQTdcdTY3MERcdTUyQTFcdTRFRTNcdTc0MDZcdUZGMENcdTkwN0ZcdTUxNERcdTc5QzFcdTY3MDlcdTdGNTFcdTdFRENcdThCRjdcdTZDNDJcdThCNjZcdTU0NEFcbiAgLy8gXHU1QzA2IC9fX21vbml0b3JfXyBcdTRFRTNcdTc0MDZcdTUyMzBcdTc2RDFcdTYzQTdcdTY3MERcdTUyQTFcdUZGMDhodHRwOi8vbG9jYWxob3N0OjMwMDFcdUZGMDlcbiAgY29uc3QgbW9uaXRvclByb3h5ID0ge1xuICAgICcvX19tb25pdG9yX18nOiB7XG4gICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDEnLFxuICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvX19tb25pdG9yX18vLCAnJyksXG4gICAgICB3czogdHJ1ZSwgLy8gXHU2NTJGXHU2MzAxIFdlYlNvY2tldFx1RkYwOFNTRSBcdTRGN0ZcdTc1MjhcdUZGMDlcbiAgICB9LFxuICB9O1xuICBcbiAgLy8gXHU1NDA4XHU1RTc2XHU0RUUzXHU3NDA2XHU5MTREXHU3RjZFXHVGRjFBXHU3NkQxXHU2M0E3XHU2NzBEXHU1MkExXHU0RUUzXHU3NDA2XHU0RjE4XHU1MTQ4XHVGRjBDXHU3MTM2XHU1NDBFXHU2NjJGXHU0RTFBXHU1MkExXHU0RUUzXHU3NDA2XG4gIGNvbnN0IG1lcmdlZFByb3h5ID0ge1xuICAgIC4uLm1vbml0b3JQcm94eSxcbiAgICAuLi5maW5hbFByb3h5LFxuICB9O1xuICBcbiAgY29uc3Qgc2VydmVyQ29uZmlnOiBVc2VyQ29uZmlnWydzZXJ2ZXInXSA9IHtcbiAgICBwb3J0OiBhcHBDb25maWcuZGV2UG9ydCxcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICBjb3JzOiB0cnVlLFxuICAgIG9yaWdpbjogYGh0dHA6Ly8ke2FwcENvbmZpZy5kZXZIb3N0fToke2FwcENvbmZpZy5kZXZQb3J0fWAsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCcsXG4gICAgfSxcbiAgICBobXI6IHtcbiAgICAgIGhvc3Q6IGFwcENvbmZpZy5kZXZIb3N0LFxuICAgICAgcG9ydDogYXBwQ29uZmlnLmRldlBvcnQsXG4gICAgICBvdmVybGF5OiBmYWxzZSxcbiAgICB9LFxuICAgIHByb3h5OiBtZXJnZWRQcm94eSxcbiAgICBmczoge1xuICAgICAgc3RyaWN0OiBmYWxzZSxcbiAgICAgIGFsbG93OiBbXG4gICAgICAgIHdpdGhSb290KCcuJyksXG4gICAgICBdLFxuICAgICAgY2FjaGVkQ2hlY2tzOiB0cnVlLFxuICAgIH0sXG4gICAgLi4ucmVzdEN1c3RvbVNlcnZlcixcbiAgfTtcblxuICAvLyBcdTk4ODRcdTg5QzhcdTY3MERcdTUyQTFcdTU2NjhcdTkxNERcdTdGNkVcbiAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHU0RUNFXHU2ODM5XHU3NkVFXHU1RjU1XHU3Njg0IGRpc3Qve3Byb2RIb3N0fSBcdThCRkJcdTUzRDZcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdUZGMENcdTgwMENcdTRFMERcdTY2MkZcdTRFQ0UgYXBwcy97YXBwTmFtZX0vZGlzdCBcdThCRkJcdTUzRDZcbiAgY29uc3Qgcm9vdERpc3REaXIgPSByZXNvbHZlKGFwcERpciwgJy4uLy4uL2Rpc3QnKTtcbiAgY29uc3QgcHJldmlld1Jvb3QgPSByZXNvbHZlKHJvb3REaXN0RGlyLCBhcHBDb25maWcucHJvZEhvc3QpO1xuXG4gIGNvbnN0IHByZXZpZXdDb25maWc6IFVzZXJDb25maWdbJ3ByZXZpZXcnXSA9IHtcbiAgICBwb3J0OiBhcHBDb25maWcucHJlUG9ydCxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIG9wZW46IGZhbHNlLFxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICBwcm94eSxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogYXBwQ29uZmlnLm1haW5BcHBPcmlnaW4sXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsT1BUSU9OUycsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnOiAndHJ1ZScsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUnLFxuICAgIH0sXG4gICAgLi4uY3VzdG9tUHJldmlldyxcbiAgfSBhcyBhbnk7XG5cbiAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU4QkJFXHU3RjZFXHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHU3Njg0XHU2ODM5XHU3NkVFXHU1RjU1XHU0RTNBIGRpc3Qve3Byb2RIb3N0fVxuICAvLyBcdTZDRThcdTYxMEZcdUZGMUFyb290IFx1NUM1RVx1NjAyN1x1NTcyOFx1NjVCMFx1NzI0OFx1NjcyQ1x1NzY4NCBWaXRlIFx1N0M3Qlx1NTc4Qlx1NEUyRFx1NTNFRlx1ODBGRFx1NjcyQVx1NUI5QVx1NEU0OVx1RkYwQ1x1NEY0Nlx1OEZEMFx1ODg0Q1x1NjVGNlx1NEVDRFx1NjUyRlx1NjMwMVxuICAocHJldmlld0NvbmZpZyBhcyBhbnkpLnJvb3QgPSBwcmV2aWV3Um9vdDtcblxuICBjb25zdCBhcHBDYWNoZURpciA9IHJlc29sdmUoYXBwRGlyLCAnbm9kZV9tb2R1bGVzLy52aXRlJyk7XG5cbiAgY29uc3Qgb3B0aW1pemVEZXBzQ29uZmlnOiBVc2VyQ29uZmlnWydvcHRpbWl6ZURlcHMnXSA9IHtcbiAgICBpbmNsdWRlOiBbXG4gICAgICAvLyBcdTY4MzhcdTVGQzNcdTRGOURcdThENTZcdUZGMUFcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTVCODlcdTg4QzVcdTc2ODRcdTRGOURcdThENTZcbiAgICAgICd2dWUnLFxuICAgICAgJ3Z1ZS1yb3V0ZXInLFxuICAgICAgJ3BpbmlhJyxcbiAgICAgICdlbGVtZW50LXBsdXMnLFxuICAgICAgLy8gV2luc3RvbiBcdTk3MDBcdTg5ODFcdTc2ODQgTm9kZS5qcyBcdTZBMjFcdTU3NTcgcG9seWZpbGxcbiAgICAgICd1dGlsJyxcbiAgICAgICdlbGVtZW50LXBsdXMvZXMnLFxuICAgICAgJ2VsZW1lbnQtcGx1cy9lcy9sb2NhbGUvbGFuZy96aC1jbicsXG4gICAgICAnZWxlbWVudC1wbHVzL2VzL2xvY2FsZS9sYW5nL2VuJyxcbiAgICAgICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9jYXNjYWRlci9zdHlsZS9jc3MnLFxuICAgICAgJ0BlbGVtZW50LXBsdXMvaWNvbnMtdnVlJyxcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlJyxcbiAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQUBidGMvc2hhcmVkLWNvbXBvbmVudHMgXHU1REYyXHU0RUNFIGluY2x1ZGUgXHU0RTJEXHU3OUZCXHU5NjY0XHVGRjBDXHU1NkUwXHU0RTNBXHU1QjgzXHU1MzA1XHU1NDJCIFRTWCBcdTY1ODdcdTRFRjZcbiAgICAgIC8vIFx1NTcyOFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NEUyRFx1RkYwQ1x1NUU5NFx1OEJFNVx1NzZGNFx1NjNBNVx1NEVDRVx1NkU5MFx1NzgwMVx1NUJGQ1x1NTE2NVx1RkYwQ1x1ODAwQ1x1NEUwRFx1NjYyRlx1OTg4NFx1Njc4NFx1NUVGQVxuICAgICAgLy8gJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnLFxuICAgICAgJ0BidGMvc2hhcmVkLXV0aWxzJyxcbiAgICAgICdAYnRjL3N1YmFwcC1tYW5pZmVzdHMnLFxuICAgICAgJ3ZpdGUtcGx1Z2luLXFpYW5rdW4vZGlzdC9oZWxwZXInLFxuICAgICAgJ3FpYW5rdW4nLFxuICAgICAgJ0B2dWV1c2UvY29yZScsXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdThGRDlcdTRFOUJcdTRGOURcdThENTZcdTczQjBcdTU3MjhcdTVERjJcdTdFQ0ZcdTU3MjhcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTc2ODQgcGFja2FnZS5qc29uIFx1NEUyRFx1NThGMFx1NjYwRVxuICAgICAgLy8gXHU5MDFBXHU4RkM3IEBidGMvc2hhcmVkLWNvbXBvbmVudHMgXHU5NUY0XHU2M0E1XHU0RjdGXHU3NTI4XHVGRjBDXHU0RjQ2XHU5NzAwXHU4OTgxXHU1NzI4XHU1RTk0XHU3NTI4XHU0RTJEXHU2NjNFXHU1RjBGXHU1OEYwXHU2NjBFXHU0RUU1XHU0RkJGIFZpdGUgXHU2QjYzXHU3ODZFXHU4OUUzXHU2NzkwXG4gICAgICAnbG9kYXNoLWVzJyxcbiAgICAgICdjaGFyZGV0JyxcbiAgICAgICd4bHN4JyxcbiAgICAgICd2dWUtaTE4bicsXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFlY2hhcnRzIFx1NzZGOFx1NTE3M1x1NEY5RFx1OEQ1Nlx1OTcwMFx1ODk4MVx1ODhBQlx1OTg4NFx1Njc4NFx1NUVGQVxuICAgICAgLy8gXHU4NjdEXHU3MTM2XHU1M0VBXHU1NzI4XHU5MEU4XHU1MjA2XHU1RTk0XHU3NTI4XHU0RTJEXHU0RjdGXHU3NTI4XHVGRjBDXHU0RjQ2XHU2REZCXHU1MkEwXHU1MjMwIGluY2x1ZGUgXHU0RTJEXHU1M0VGXHU0RUU1XHU5MDdGXHU1MTREXHU4RkQwXHU4ODRDXHU2NUY2XHU0RjE4XHU1MzE2XG4gICAgICAvLyBcdTU5ODJcdTY3OUNcdTVFOTRcdTc1MjhcdTY3MkFcdTVCODlcdTg4QzVcdThGRDlcdTRFOUJcdTRGOURcdThENTZcdUZGMENWaXRlIFx1NEYxQVx1NUZGRFx1NzU2NVx1NUI4M1x1NEVFQ1x1RkYwOFx1NEUwRFx1NEYxQVx1NjJBNVx1OTUxOVx1RkYwOVxuICAgICAgJ2VjaGFydHMvY29yZScsXG4gICAgICAnZWNoYXJ0cycsXG4gICAgICAndnVlLWVjaGFydHMnLFxuICAgIF0sXG4gICAgLy8gXHU2MzkyXHU5NjY0XHU0RTBEXHU1RTk0XHU4QkU1XHU4OEFCXHU0RjE4XHU1MzE2XHU3Njg0XHU0RjlEXHU4RDU2XG4gICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBZXhjbHVkZSBcdTRGN0ZcdTc1MjhcdTUzMDVcdTU0MERcdTYyMTZcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcdTZBMjFcdTVGMEZcbiAgICBleGNsdWRlOiBbXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MvbGF5b3V0LWJyaWRnZSBcdTY2MkZcdTY3MkNcdTU3MzBcdTUyMkJcdTU0MERcdThERUZcdTVGODRcdUZGMENcdTRFMERcdTY2MkYgbnBtIFx1NTMwNVx1RkYwQ1x1NEUwRFx1NUU5NFx1OEJFNVx1ODhBQlx1NEYxOFx1NTMxNlxuICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBZXhjbHVkZSBcdTUzRUFcdTY1MkZcdTYzMDFcdTVCNTdcdTdCMjZcdTRFMzJcdTZBMjFcdTVGMEZcdUZGMENcdTRFMERcdTY1MkZcdTYzMDFcdTZCNjNcdTUyMTlcdTg4NjhcdThGQkVcdTVGMEZcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MvbGF5b3V0LWJyaWRnZScsXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTYzOTJcdTk2NjQgQGJ0Yy9zaGFyZWQtY29tcG9uZW50c1x1RkYwQ1x1NTZFMFx1NEUzQVx1NUI4M1x1NjYyRlx1NjcyQ1x1NTczMFx1NTMwNVx1RkYwQ1x1NTMwNVx1NTQyQiBUU1ggXHU2NTg3XHU0RUY2XG4gICAgICAvLyBcdTU3MjhcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFMkRcdUZGMENcdTVFOTRcdThCRTVcdTc2RjRcdTYzQTVcdTRFQ0VcdTZFOTBcdTc4MDFcdTVCRkNcdTUxNjVcdUZGMENcdTgwMENcdTRFMERcdTY2MkZcdTk4ODRcdTY3ODRcdTVFRkFcbiAgICAgIC8vIFx1OEZEOVx1NjgzN1x1NTNFRlx1NEVFNVx1OTA3Rlx1NTE0RCBKU1ggXHU4OUUzXHU2NzkwXHU5NUVFXHU5ODk4XG4gICAgICAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cycsXG4gICAgXSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdThCQkVcdTdGNkVcdTRFM0EgdHJ1ZVx1RkYwQ1x1NUYzQVx1NTIzNlx1OTFDRFx1NjVCMFx1Njc4NFx1NUVGQVx1NjI0MFx1NjcwOVx1NEY5RFx1OEQ1Nlx1RkYwQ1x1Nzg2RVx1NEZERFx1NjI0MFx1NjcwOVx1NEY5RFx1OEQ1Nlx1OTBGRFx1ODhBQlx1OTg4NFx1Njc4NFx1NUVGQVxuICAgIC8vIFx1OEZEOVx1NEYxQVx1NTcyOFx1OTk5Nlx1NkIyMVx1NTQyRlx1NTJBOFx1NjVGNlx1Njc4NFx1NUVGQVx1NjI0MFx1NjcwOVx1NEY5RFx1OEQ1Nlx1RkYwQ1x1NEU0Qlx1NTQwRVx1NUMzMVx1NEUwRFx1NEYxQVx1NTE4RFx1ODlFNlx1NTNEMVx1NEU4NlxuICAgIGZvcmNlOiBmYWxzZSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTUzQzJcdTgwMDMgY29vbC1hZG1pbiBcdTc2ODRcdTUwNUFcdTZDRDVcbiAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTRFMERcdTUxOERcdTUzMDVcdTU0MkIgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2luZGV4LnRzXHVGRjBDXHU1NkUwXHU0RTNBXHU1QjgzXHU1MzA1XHU1NDJCIFRTWCBcdTY1ODdcdTRFRjZcdUZGMENcdTVFOTRcdThCRTVcdTU3MjhcdThGRDBcdTg4NENcdTY1RjZcdTc2RjRcdTYzQTVcdTU5MDRcdTc0MDZcbiAgICAvLyBzaGFyZWQtY29tcG9uZW50cyBcdTRFMkRcdTc2ODRcdTRGOURcdThENTZcdUZGMDhcdTU5ODIgbHVuciwgY2hhcmRldCBcdTdCNDlcdUZGMDlcdTRGMUFcdTU3MjhcdThGRDBcdTg4NENcdTY1RjZcdTg4QUJcdTgxRUFcdTUyQThcdTUzRDFcdTczQjBcdTU0OENcdTRGMThcdTUzMTZcbiAgICBlbnRyaWVzOiBbXG4gICAgICAvLyBcdTVFOTRcdTc1MjhcdTc2ODRcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcbiAgICAgIHJlc29sdmUoYXBwRGlyLCAnc3JjL21haW4udHMnKSxcbiAgICBdLFxuICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICBwbHVnaW5zOiBbXSxcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzg2RVx1NEZERFx1NEY5RFx1OEQ1Nlx1OTg4NFx1Njc4NFx1NUVGQVx1NjVGNlx1NEU1Rlx1NEY3Rlx1NzUyOCBWdWUgXHU3Njg0IEpTWCBcdThGNkNcdTYzNjJcdTY1QjlcdTVGMEZcbiAgICAgIGpzeDogJ3ByZXNlcnZlJywgLy8gXHU0RkREXHU3NTU5IEpTWFx1RkYwQ1x1OEJBOSB2dWVKc3ggXHU2M0QyXHU0RUY2XHU1OTA0XHU3NDA2XG4gICAgICBqc3hGYWN0b3J5OiAnaCcsIC8vIFx1NEY3Rlx1NzUyOCBWdWUgXHU3Njg0IGggXHU1MUZEXHU2NTcwXHU0RjVDXHU0RTNBIEpTWCBcdTVERTVcdTUzODJcdTUxRkRcdTY1NzBcbiAgICAgIGpzeEZyYWdtZW50OiAnRnJhZ21lbnQnLCAvLyBcdTRGN0ZcdTc1MjggVnVlIFx1NzY4NCBGcmFnbWVudFxuICAgIH0sXG4gICAgLi4uY3VzdG9tT3B0aW1pemVEZXBzLFxuICB9O1xuXG4gIC8vIENTUyBcdTkxNERcdTdGNkVcbiAgY29uc3QgY3NzQ29uZmlnOiBVc2VyQ29uZmlnWydjc3MnXSA9IHtcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICBzY3NzOiB7XG4gICAgICAgIGFwaTogJ21vZGVybi1jb21waWxlcicsXG4gICAgICAgIHNpbGVuY2VEZXByZWNhdGlvbnM6IFsnbGVnYWN5LWpzLWFwaScsICdpbXBvcnQnXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBkZXZTb3VyY2VtYXA6IGZhbHNlLFxuICAgIC4uLmN1c3RvbUNzcyxcbiAgfTtcblxuICAvLyBcdThGRDRcdTU2REVcdTVCOENcdTY1NzRcdTkxNERcdTdGNkVcbiAgLy8gXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU0RjdGXHU3NTI4XHU1MjJCXHU1NDBEXHU2MzA3XHU1NDExXHU2RTkwXHU3ODAxXHVGRjA4XHU1NkUwXHU0RTNBXHU5MEZEXHU2MjUzXHU1MzA1IEBidGMvKiBcdTUzMDVcdUZGMDlcbiAgY29uc3QgYmFzZVJlc29sdmUgPSBjcmVhdGVCYXNlUmVzb2x2ZShhcHBEaXIsIGFwcE5hbWUpO1xuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc1MUZcdTRFQTcvXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHU2NUY2XHVGRjBDXHU1QjUwXHU1RTk0XHU3NTI4XHU0RTBEXHU1MThEXHU0RjdGXHU3NTI4XHU2NzJDXHU1NzMwIHZpcnR1YWw6ZXBzXHVGRjA4XHU3NTMxIGxheW91dC1hcHAgXHU2M0QwXHU0RjlCXHU1MTcxXHU0RUFCIEVQUyBcdTY3MERcdTUyQTFcdUZGMDlcbiAgLy8gXHU4RkQ5XHU2ODM3XHU1M0VGXHU0RUU1XHU5MDdGXHU1MTREXHU1QjUwXHU1RTk0XHU3NTI4XHU1MTY1XHU1M0UzXHU0RUE3XHU3NTFGXHU1QkY5XHU4MUVBXHU4RUFCIGVwcy1zZXJ2aWNlLXh4eC5qcyBcdTc2ODRcdTVGMTVcdTc1MjhcdUZGMENcdTVCRkNcdTgxRjRcdTUxNzFcdTRFQUJcdTRFMERcdTc1MUZcdTY1NDhcdTYyMTYgNDA0XHUzMDAyXG4gIGNvbnN0IHNob3VsZFVzZVNoYXJlZEVwcyA9IChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSB8fCBpc1ByZXZpZXdCdWlsZDtcbiAgY29uc3Qgc2hhcmVkRXBzU3R1YiA9IHJlc29sdmUoYXBwRGlyLCAnLi4vLi4vY29uZmlncy92aXRlL3N0dWJzL3ZpcnR1YWwtZXBzLWVtcHR5LnRzJyk7XG4gIGNvbnN0IGZpbmFsUmVzb2x2ZSA9IHNob3VsZFVzZVNoYXJlZEVwc1xuICAgID8ge1xuICAgICAgICAuLi5iYXNlUmVzb2x2ZSxcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkREXHU2MzAxXHU1MjJCXHU1NDBEXHU2NTcwXHU3RUM0XHU1RjYyXHU1RjBGXHVGRjBDXHU2REZCXHU1MkEwIHZpcnR1YWw6ZXBzIFx1NTIyQlx1NTQwRFxuICAgICAgICBhbGlhczogQXJyYXkuaXNBcnJheShiYXNlUmVzb2x2ZT8uYWxpYXMpXG4gICAgICAgICAgPyBbXG4gICAgICAgICAgICAgIC4uLmJhc2VSZXNvbHZlLmFsaWFzLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmluZDogJ3ZpcnR1YWw6ZXBzJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlbWVudDogc2hhcmVkRXBzU3R1YixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF1cbiAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgLi4uKGJhc2VSZXNvbHZlPy5hbGlhcyBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHx8IHt9KSxcbiAgICAgICAgICAgICAgJ3ZpcnR1YWw6ZXBzJzogc2hhcmVkRXBzU3R1YixcbiAgICAgICAgICAgIH0sXG4gICAgICB9XG4gICAgOiBiYXNlUmVzb2x2ZTtcblxuICBjb25zdCBjb25maWc6IGFueSA9IHtcbiAgICBiYXNlOiBiYXNlVXJsLFxuICAgIHB1YmxpY0RpcixcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTZCQ0ZcdTRFMkFcdTVFOTRcdTc1MjhcdTRGN0ZcdTc1MjhcdTcyRUNcdTdBQ0JcdTc2ODRcdTdGMTNcdTVCNThcdTc2RUVcdTVGNTVcdUZGMENcdTkwN0ZcdTUxNERcdTRFMERcdTU0MENcdTVFOTRcdTc1MjhcdTc2ODRcdTkxNERcdTdGNkVcdTVERUVcdTVGMDJcdTVCRkNcdTgxRjRcdTdGMTNcdTVCNThcdTUxQjJcdTdBODFcbiAgICAvLyBcdTg2N0RcdTcxMzZcdThGRDlcdTRGMUFcdTU4OUVcdTUyQTBcdTRFMDBcdTRFOUJcdTVCNThcdTUwQThcdTdBN0FcdTk1RjRcdUZGMENcdTRGNDZcdTUzRUZcdTRFRTVcdTc4NkVcdTRGRERcdTZCQ0ZcdTRFMkFcdTVFOTRcdTc1MjhcdTc2ODRcdTdGMTNcdTVCNThcdTcyQjZcdTYwMDFcdTRFMDBcdTgxRjRcdUZGMENcdTkwN0ZcdTUxNERcdTk4OTFcdTdFNDFcdTkxQ0RcdTY1QjBcdTY3ODRcdTVFRkFcbiAgICBjYWNoZURpcjogYXBwQ2FjaGVEaXIsXG4gICAgZGVmaW5lOiB7XG4gICAgICAvLyBcdTRFM0FcdTZENEZcdTg5QzhcdTU2NjhcdTczQUZcdTU4ODNcdTYzRDBcdTRGOUIgcHJvY2VzcyBcdTVCRjlcdThDNjFcdUZGMENXaW5zdG9uIFx1OTcwMFx1ODk4MVx1NUI4M1xuICAgICAgJ3Byb2Nlc3MuZW52JzogJ3t9JyxcbiAgICAgICdwcm9jZXNzLnBsYXRmb3JtJzogSlNPTi5zdHJpbmdpZnkoJ2Jyb3dzZXInKSxcbiAgICAgICdwcm9jZXNzLnZlcnNpb24nOiBKU09OLnN0cmluZ2lmeSgnJyksXG4gICAgfSxcbiAgICBwbHVnaW5zLFxuICAgIGVzYnVpbGQ6IHtcbiAgICAgIGNoYXJzZXQ6ICd1dGY4JyxcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzg2RVx1NEZERCBlc2J1aWxkIFx1NkI2M1x1Nzg2RVx1NTkwNFx1NzQwNiBKU1hcdUZGMENcdTRGN0ZcdTc1MjggVnVlIFx1NzY4NCBoIFx1NTFGRFx1NjU3MFx1ODAwQ1x1NEUwRFx1NjYyRiBSZWFjdC5jcmVhdGVFbGVtZW50XG4gICAgICAvLyBcdThGRDlcdTY4MzdcdTUzNzNcdTRGN0YgZXNidWlsZCBcdTU5MDRcdTc0MDZcdTY3RDBcdTRFOUIgSlNYIFx1NjU4N1x1NEVGNlx1RkYwQ1x1NEU1Rlx1NEYxQVx1NEY3Rlx1NzUyOFx1NkI2M1x1Nzg2RVx1NzY4NFx1OEY2Q1x1NjM2Mlx1NjVCOVx1NUYwRlxuICAgICAganN4OiAncHJlc2VydmUnLCAvLyBcdTRGRERcdTc1NTkgSlNYXHVGRjBDXHU4QkE5IHZ1ZUpzeCBcdTYzRDJcdTRFRjZcdTU5MDRcdTc0MDZcbiAgICAgIGpzeEZhY3Rvcnk6ICdoJywgLy8gXHU0RjdGXHU3NTI4IFZ1ZSBcdTc2ODQgaCBcdTUxRkRcdTY1NzBcdTRGNUNcdTRFM0EgSlNYIFx1NURFNVx1NTM4Mlx1NTFGRFx1NjU3MFxuICAgICAganN4RnJhZ21lbnQ6ICdGcmFnbWVudCcsIC8vIFx1NEY3Rlx1NzUyOCBWdWUgXHU3Njg0IEZyYWdtZW50XG4gICAgfSxcbiAgICBzZXJ2ZXI6IHNlcnZlckNvbmZpZyxcbiAgICBwcmV2aWV3OiBwcmV2aWV3Q29uZmlnLFxuICAgIG9wdGltaXplRGVwczogb3B0aW1pemVEZXBzQ29uZmlnLFxuICAgIGNzczogY3NzQ29uZmlnLFxuICAgIGJ1aWxkOiBidWlsZENvbmZpZyxcbiAgfTtcblxuICAvLyBcdTY2MEVcdTc4NkVcdTU5MDRcdTc0MDZcdTUzRUZcdTkwMDlcdTVDNUVcdTYwMjdcdTc2ODQgdW5kZWZpbmVkXHVGRjA4ZXhhY3RPcHRpb25hbFByb3BlcnR5VHlwZXNcdUZGMDlcbiAgaWYgKGZpbmFsUmVzb2x2ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uZmlnLnJlc29sdmUgPSBmaW5hbFJlc29sdmU7XG4gIH1cblxuICByZXR1cm4gY29uZmlnO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHV0aWxzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFx1dGlsc1xcXFxwYXRoLWhlbHBlcnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3V0aWxzL3BhdGgtaGVscGVycy50c1wiOy8qKlxuICogXHU4REVGXHU1Rjg0XHU4Rjg1XHU1MkE5XHU1MUZEXHU2NTcwXG4gKiBcdTYzRDBcdTRGOUJcdTdFREZcdTRFMDBcdTc2ODRcdThERUZcdTVGODRcdTg5RTNcdTY3OTBcdTUxRkRcdTY1NzBcdUZGMENcdTc1MjhcdTRFOEUgVml0ZSBcdTkxNERcdTdGNkVcdTRFMkRcdTc2ODRcdTUyMkJcdTU0MERcdTU0OENcdThERUZcdTVGODRcdTg5RTNcdTY3OTBcbiAqL1xuXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBXHU4REVGXHU1Rjg0XHU4Rjg1XHU1MkE5XHU1MUZEXHU2NTcwXG4gKiBAcGFyYW0gYXBwRGlyIFx1NUU5NFx1NzUyOFx1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICogQHJldHVybnMgXHU4REVGXHU1Rjg0XHU4Rjg1XHU1MkE5XHU1MUZEXHU2NTcwXHU1QkY5XHU4QzYxXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQYXRoSGVscGVycyhhcHBEaXI6IHN0cmluZykge1xuICAvKipcbiAgICogXHU4OUUzXHU2NzkwXHU1RTk0XHU3NTI4IHNyYyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcbiAgICovXG4gIGNvbnN0IHdpdGhTcmMgPSAocmVsYXRpdmVQYXRoOiBzdHJpbmcpID0+IHJlc29sdmUoYXBwRGlyLCByZWxhdGl2ZVBhdGgpO1xuXG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTAgcGFja2FnZXMgXHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XG4gICAqL1xuICBjb25zdCB3aXRoUGFja2FnZXMgPSAocmVsYXRpdmVQYXRoOiBzdHJpbmcpID0+IFxuICAgIHJlc29sdmUoYXBwRGlyLCAnLi4vLi4vcGFja2FnZXMnLCByZWxhdGl2ZVBhdGgpO1xuXG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTBcdTk4NzlcdTc2RUVcdTY4MzlcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcbiAgICovXG4gIGNvbnN0IHdpdGhSb290ID0gKHJlbGF0aXZlUGF0aDogc3RyaW5nKSA9PiBcbiAgICByZXNvbHZlKGFwcERpciwgJy4uLy4uJywgcmVsYXRpdmVQYXRoKTtcblxuICAvKipcbiAgICogXHU4OUUzXHU2NzkwIGNvbmZpZ3MgXHU3NkVFXHU1RjU1XHU0RTBCXHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XG4gICAqL1xuICBjb25zdCB3aXRoQ29uZmlncyA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZykgPT4gXG4gICAgcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9jb25maWdzJywgcmVsYXRpdmVQYXRoKTtcblxuICByZXR1cm4geyB3aXRoU3JjLCB3aXRoUGFja2FnZXMsIHdpdGhSb290LCB3aXRoQ29uZmlncyB9O1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXGF1dG8taW1wb3J0LmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL2F1dG8taW1wb3J0LmNvbmZpZy50c1wiO1x1RkVGRi8qKlxuICogXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU5MTREXHU3RjZFXHU2QTIxXHU2NzdGXG4gKiBcdTRGOUJcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdUZGMDhhZG1pbi1hcHAsIGxvZ2lzdGljcy1hcHAgXHU3QjQ5XHVGRjA5XHU0RjdGXHU3NTI4XG4gKi9cbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnO1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSc7XG5pbXBvcnQgeyBFbGVtZW50UGx1c1Jlc29sdmVyIH0gZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvcmVzb2x2ZXJzJztcblxuLyoqXG4gKiBcdTUyMUJcdTVFRkEgQXV0byBJbXBvcnQgXHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnKCkge1xuICByZXR1cm4gQXV0b0ltcG9ydCh7XG4gICAgaW1wb3J0czogW1xuICAgICAgJ3Z1ZScsXG4gICAgICAndnVlLXJvdXRlcicsXG4gICAgICAncGluaWEnLFxuICAgICAge1xuICAgICAgICAnQGJ0Yy9zaGFyZWQtY29yZSc6IFtcbiAgICAgICAgICAndXNlQ3J1ZCcsXG4gICAgICAgICAgJ3VzZURpY3QnLFxuICAgICAgICAgICd1c2VQZXJtaXNzaW9uJyxcbiAgICAgICAgICAndXNlUmVxdWVzdCcsXG4gICAgICAgICAgJ2NyZWF0ZUkxOG5QbHVnaW4nLFxuICAgICAgICAgICd1c2VJMThuJyxcbiAgICAgICAgXSxcbiAgICAgICAgJ0BidGMvc2hhcmVkLXV0aWxzJzogW1xuICAgICAgICAgICdmb3JtYXREYXRlJyxcbiAgICAgICAgICAnZm9ybWF0RGF0ZVRpbWUnLFxuICAgICAgICAgICdmb3JtYXRNb25leScsXG4gICAgICAgICAgJ2Zvcm1hdE51bWJlcicsXG4gICAgICAgICAgJ2lzRW1haWwnLFxuICAgICAgICAgICdpc1Bob25lJyxcbiAgICAgICAgICAnc3RvcmFnZScsXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIF0sXG5cbiAgICByZXNvbHZlcnM6IFtcbiAgICAgIEVsZW1lbnRQbHVzUmVzb2x2ZXIoe1xuICAgICAgICBpbXBvcnRTdHlsZTogZmFsc2UsIC8vIFx1Nzk4MVx1NzUyOFx1NjMwOVx1OTcwMFx1NjgzN1x1NUYwRlx1NUJGQ1x1NTE2NVxuICAgICAgfSksXG4gICAgXSxcblxuICAgIGR0czogJ3NyYy9hdXRvLWltcG9ydHMuZC50cycsXG5cbiAgICBlc2xpbnRyYzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGZpbGVwYXRoOiAnLi8uZXNsaW50cmMtYXV0by1pbXBvcnQuanNvbicsXG4gICAgfSxcblxuICAgIHZ1ZVRlbXBsYXRlOiB0cnVlLFxuICB9KTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRzQ29uZmlnT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBcdTk4OURcdTU5MTZcdTc2ODRcdTdFQzRcdTRFRjZcdTc2RUVcdTVGNTVcdUZGMDhcdTc1MjhcdTRFOEVcdTU3REZcdTdFQTdcdTdFQzRcdTRFRjZcdUZGMDlcbiAgICovXG4gIGV4dHJhRGlycz86IHN0cmluZ1tdO1xuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1QkZDXHU1MTY1XHU1MTcxXHU0RUFCXHU3RUM0XHU0RUY2XHU1RTkzXG4gICAqL1xuICBpbmNsdWRlU2hhcmVkPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBcdTUyMUJcdTVFRkEgQ29tcG9uZW50cyBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTkxNERcdTdGNkVcbiAqIEBwYXJhbSBvcHRpb25zIFx1OTE0RFx1N0Y2RVx1OTAwOVx1OTg3OVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50c0NvbmZpZyhvcHRpb25zOiBDb21wb25lbnRzQ29uZmlnT3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IHsgZXh0cmFEaXJzID0gW10sIGluY2x1ZGVTaGFyZWQgPSB0cnVlIH0gPSBvcHRpb25zO1xuXG4gIGNvbnN0IGRpcnMgPSBbXG4gICAgJ3NyYy9jb21wb25lbnRzJywgLy8gXHU1RTk0XHU3NTI4XHU3RUE3XHU3RUM0XHU0RUY2XG4gICAgLi4uZXh0cmFEaXJzLCAvLyBcdTk4OURcdTU5MTZcdTc2ODRcdTU3REZcdTdFQTdcdTdFQzRcdTRFRjZcdTc2RUVcdTVGNTVcbiAgXTtcblxuICAvLyBcdTU5ODJcdTY3OUNcdTUzMDVcdTU0MkJcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdUZGMENcdTZERkJcdTUyQTBcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdTUyMDZcdTdFQzRcdTc2RUVcdTVGNTVcbiAgaWYgKGluY2x1ZGVTaGFyZWQpIHtcbiAgICAvLyBcdTZERkJcdTUyQTBcdTUyMDZcdTdFQzRcdTc2RUVcdTVGNTVcdUZGMENcdTY1MkZcdTYzMDFcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcbiAgICBkaXJzLnB1c2goXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvYmFzaWMnLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL2xheW91dCcsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvbmF2aWdhdGlvbicsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvZm9ybScsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvZGF0YScsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvZmVlZGJhY2snLFxuICAgICAgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzL290aGVycydcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIENvbXBvbmVudHMoe1xuICAgIHJlc29sdmVyczogW1xuICAgICAgRWxlbWVudFBsdXNSZXNvbHZlcih7XG4gICAgICAgIGltcG9ydFN0eWxlOiBmYWxzZSwgLy8gXHU3OTgxXHU3NTI4XHU2MzA5XHU5NzAwXHU2ODM3XHU1RjBGXHU1QkZDXHU1MTY1XHVGRjBDXHU5MDdGXHU1MTREIFZpdGUgcmVsb2FkaW5nXG4gICAgICB9KSxcbiAgICAgIC8vIFx1ODFFQVx1NUI5QVx1NEU0OVx1ODlFM1x1Njc5MFx1NTY2OFx1RkYxQUBidGMvc2hhcmVkLWNvbXBvbmVudHNcbiAgICAgIChjb21wb25lbnROYW1lKSA9PiB7XG4gICAgICAgIC8vIFx1NUMwNiBrZWJhYi1jYXNlIFx1OEY2Q1x1NjM2Mlx1NEUzQSBQYXNjYWxDYXNlXG4gICAgICAgIC8vIFx1NEY4Qlx1NTk4MjogYnRjLXN2ZyAtPiBCdGNTdmdcbiAgICAgICAgY29uc3QgY29udmVydFRvUGFzY2FsQ2FzZSA9IChuYW1lOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ0J0YycpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmFtZTsgLy8gXHU1REYyXHU3RUNGXHU2NjJGIFBhc2NhbENhc2VcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgnYnRjLScpKSB7XG4gICAgICAgICAgICAvLyBidGMtc3ZnIC0+IEJ0Y1N2Z1xuICAgICAgICAgICAgcmV0dXJuIG5hbWVcbiAgICAgICAgICAgICAgLnNwbGl0KCctJylcbiAgICAgICAgICAgICAgLm1hcChwYXJ0ID0+IHBhcnQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwYXJ0LnNsaWNlKDEpKVxuICAgICAgICAgICAgICAuam9pbignJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBuYW1lO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChjb21wb25lbnROYW1lLnN0YXJ0c1dpdGgoJ0J0YycpIHx8IGNvbXBvbmVudE5hbWUuc3RhcnRzV2l0aCgnYnRjLScpKSB7XG4gICAgICAgICAgY29uc3QgcGFzY2FsTmFtZSA9IGNvbnZlcnRUb1Bhc2NhbENhc2UoY29tcG9uZW50TmFtZSk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWU6IHBhc2NhbE5hbWUsXG4gICAgICAgICAgICBmcm9tOiAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cycsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICBdLFxuICAgIGR0czogJ3NyYy9jb21wb25lbnRzLmQudHMnLFxuICAgIGRpcnMsXG4gICAgZXh0ZW5zaW9uczogWyd2dWUnLCAndHN4J10sIC8vIFx1NjUyRlx1NjMwMSAudnVlIFx1NTQ4QyAudHN4IFx1NjU4N1x1NEVGNlxuICAgIC8vIFx1NUYzQVx1NTIzNlx1OTFDRFx1NjVCMFx1NjI2Qlx1NjNDRlx1N0VDNFx1NEVGNlxuICAgIGRlZXA6IHRydWUsXG4gICAgLy8gXHU1MzA1XHU1NDJCXHU2MjQwXHU2NzA5IEJ0YyBcdTVGMDBcdTU5MzRcdTc2ODRcdTdFQzRcdTRFRjZcbiAgICBpbmNsdWRlOiBbL1xcLnZ1ZSQvLCAvXFwudHN4JC8sIC9CdGNbQS1aXS8sIC9idGMtW2Etel0vXSxcbiAgfSk7XG59XG4vLyBVVEYtOCBlbmNvZGluZyBmaXhcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZS1hcHAtY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS1hcHAtY29uZmlnLnRzXCI7LyoqXG4gKiBWaXRlIFx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVx1OEY4NVx1NTJBOVx1NTFGRFx1NjU3MFxuICogXHU3NTI4XHU0RThFXHU0RUNFXHU3RURGXHU0RTAwXHU5MTREXHU3RjZFXHU0RTJEXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU3Njg0XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXG4gKi9cblxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZ2V0QXBwQ29uZmlnIH0gZnJvbSAnLi4vcGFja2FnZXMvc2hhcmVkLWNvcmUvc3JjL2NvbmZpZ3MvYXBwLWVudi5jb25maWcnO1xuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVx1RkYwOFx1NzUyOFx1NEU4RSB2aXRlLmNvbmZpZy50c1x1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Vml0ZUFwcENvbmZpZyhhcHBOYW1lOiBzdHJpbmcpOiB7XG4gIGRldlBvcnQ6IG51bWJlcjtcbiAgZGV2SG9zdDogc3RyaW5nO1xuICBwcmVQb3J0OiBudW1iZXI7XG4gIHByZUhvc3Q6IHN0cmluZztcbiAgcHJvZEhvc3Q6IHN0cmluZztcbiAgbWFpbkFwcE9yaWdpbjogc3RyaW5nO1xufSB7XG4gIGNvbnN0IGFwcENvbmZpZyA9IGdldEFwcENvbmZpZyhhcHBOYW1lKTtcbiAgaWYgKCFhcHBDb25maWcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFx1NjcyQVx1NjI3RVx1NTIzMCAke2FwcE5hbWV9IFx1NzY4NFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RWApO1xuICB9XG5cbiAgY29uc3QgbWFpbkFwcENvbmZpZyA9IGdldEFwcENvbmZpZygnbWFpbi1hcHAnKTtcbiAgY29uc3QgbWFpbkFwcE9yaWdpbiA9IG1haW5BcHBDb25maWdcbiAgICA/IGBodHRwOi8vJHttYWluQXBwQ29uZmlnLnByZUhvc3R9OiR7bWFpbkFwcENvbmZpZy5wcmVQb3J0fWBcbiAgICA6ICdodHRwOi8vbG9jYWxob3N0OjQxODAnO1xuXG4gIHJldHVybiB7XG4gICAgZGV2UG9ydDogcGFyc2VJbnQoYXBwQ29uZmlnLmRldlBvcnQsIDEwKSxcbiAgICBkZXZIb3N0OiBhcHBDb25maWcuZGV2SG9zdCxcbiAgICBwcmVQb3J0OiBwYXJzZUludChhcHBDb25maWcucHJlUG9ydCwgMTApLFxuICAgIHByZUhvc3Q6IGFwcENvbmZpZy5wcmVIb3N0LFxuICAgIHByb2RIb3N0OiBhcHBDb25maWcucHJvZEhvc3QsXG4gICAgbWFpbkFwcE9yaWdpbixcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTVFOTRcdTc1MjhcdTdDN0JcdTU3OEJcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFxuICogQHJldHVybnMgXHU1RTk0XHU3NTI4XHU3QzdCXHU1NzhCXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBUeXBlKGFwcE5hbWU6IHN0cmluZyk6ICdtYWluJyB8ICdzdWInIHwgJ2xheW91dCcgfCAnbW9iaWxlJyB7XG4gIGlmIChhcHBOYW1lID09PSAnbWFpbi1hcHAnKSByZXR1cm4gJ21haW4nO1xuICBpZiAoYXBwTmFtZSA9PT0gJ2xheW91dC1hcHAnKSByZXR1cm4gJ2xheW91dCc7XG4gIGlmIChhcHBOYW1lID09PSAnbW9iaWxlLWFwcCcpIHJldHVybiAnbW9iaWxlJztcbiAgcmV0dXJuICdzdWInOyAvLyBcdTUxNzZcdTRFRDZcdTkwRkRcdTY2MkZcdTVCNTBcdTVFOTRcdTc1Mjhcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDYgYmFzZSBVUkxcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFxuICogQHBhcmFtIGlzUHJldmlld0J1aWxkIFx1NjYyRlx1NTQyNlx1NEUzQVx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVxuICogQHJldHVybnMgYmFzZSBVUkxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEJhc2VVcmwoYXBwTmFtZTogc3RyaW5nLCBpc1ByZXZpZXdCdWlsZDogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nIHtcbiAgY29uc3QgYXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnKGFwcE5hbWUpO1xuICBpZiAoIWFwcENvbmZpZykge1xuICAgIHRocm93IG5ldyBFcnJvcihgXHU2NzJBXHU2MjdFXHU1MjMwICR7YXBwTmFtZX0gXHU3Njg0XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFYCk7XG4gIH1cbiAgXG4gIC8vIFx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFxuICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICByZXR1cm4gYGh0dHA6Ly8ke2FwcENvbmZpZy5wcmVIb3N0fToke2FwcENvbmZpZy5wcmVQb3J0fS9gO1xuICB9XG4gIFxuICAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMUFcdTRGN0ZcdTc1MjhcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMDhcdThCQTlcdTZENEZcdTg5QzhcdTU2NjhcdTY4MzlcdTYzNkVcdTU3REZcdTU0MERcdTgxRUFcdTUyQThcdTg5RTNcdTY3OTBcdUZGMDlcbiAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1QjUwXHU1RTk0XHU3NTI4XHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU3NkY0XHU2M0E1XHU5MEU4XHU3RjcyXHU1MjMwXHU1QjUwXHU1N0RGXHU1NDBEXHU2ODM5XHU3NkVFXHU1RjU1XHVGRjA4XHU1OTgyIHByb2R1Y3Rpb24uYmVsbGlzLmNvbS5jblx1RkYwOVxuICByZXR1cm4gJy8nO1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENiBwdWJsaWNEaXIgXHU4REVGXHU1Rjg0XG4gKiBAcGFyYW0gYXBwTmFtZSBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcbiAqIEBwYXJhbSBhcHBEaXIgXHU1RTk0XHU3NTI4XHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XG4gKiBAcmV0dXJucyBwdWJsaWNEaXIgXHU4REVGXHU1Rjg0XHU2MjE2IGZhbHNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQdWJsaWNEaXIoYXBwTmFtZTogc3RyaW5nLCBhcHBEaXI6IHN0cmluZyk6IHN0cmluZyB8IGZhbHNlIHtcbiAgLy8gbWFpbi1hcHBcdTMwMDFhZG1pbi1hcHBcdTMwMDFtb2JpbGUtYXBwIFx1NTQ4QyBzeXN0ZW0tYXBwIFx1NEY3Rlx1NzUyOFx1ODFFQVx1NURGMVx1NzY4NCBwdWJsaWMgXHU3NkVFXHU1RjU1XG4gIGlmIChhcHBOYW1lID09PSAnbWFpbi1hcHAnIHx8IGFwcE5hbWUgPT09ICdhZG1pbi1hcHAnIHx8IGFwcE5hbWUgPT09ICdtb2JpbGUtYXBwJyB8fCBhcHBOYW1lID09PSAnc3lzdGVtLWFwcCcpIHtcbiAgICByZXR1cm4gcmVzb2x2ZShhcHBEaXIsICdwdWJsaWMnKTtcbiAgfVxuICBcbiAgLy8gXHU1MTc2XHU0RUQ2XHU1RTk0XHU3NTI4XHU0RjdGXHU3NTI4XHU1MTcxXHU0RUFCXHU3Njg0IHB1YmxpYyBcdTc2RUVcdTVGNTVcbiAgcmV0dXJuIHJlc29sdmUoYXBwRGlyLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvcHVibGljJyk7XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxwYWNrYWdlc1xcXFxzaGFyZWQtY29yZVxcXFxzcmNcXFxcY29uZmlnc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxwYWNrYWdlc1xcXFxzaGFyZWQtY29yZVxcXFxzcmNcXFxcY29uZmlnc1xcXFxhcHAtZW52LmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMvY29uZmlncy9hcHAtZW52LmNvbmZpZy50c1wiOy8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1OEZEOVx1OTFDQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBsb2dnZXJcdUZGMENcdTU2RTBcdTRFM0FcdTVCNThcdTU3MjhcdTVGQUFcdTczQUZcdTRGOURcdThENTZcdUZGMUFcbi8vIGxvZ2dlciAtPiBlbnYtaW5mbyAtPiB1bmlmaWVkLWVudi1jb25maWcgLT4gYXBwLWVudi5jb25maWcgLT4gbG9nZ2VyXG4vLyBcdTU3MjhcdTZBMjFcdTU3NTdcdTUyQTBcdThGN0RcdTc2ODRcdTY1RTlcdTY3MUZcdTk2MzZcdTZCQjVcdUZGMENsb2dnZXIgXHU1M0VGXHU4MEZEXHU4RkQ4XHU2NzJBXHU1MjFEXHU1OUNCXHU1MzE2XHVGRjBDXHU2MjQwXHU0RUU1XHU3NkY0XHU2M0E1XHU0RjdGXHU3NTI4IGNvbnNvbGVcbi8vIGNvbnNvbGUgXHU2NjJGXHU1MTY4XHU1QzQwXHU1QkY5XHU4QzYxXHVGRjBDXHU1NzI4XHU2QTIxXHU1NzU3XHU1MkEwXHU4RjdEXHU2NUY2XHU1QzMxXHU1REYyXHU3RUNGXHU1QjU4XHU1NzI4XHVGRjBDXHU0RTBEXHU0RjFBXHU1M0Q3XHU1MjMwXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XHU3Njg0XHU1RjcxXHU1NENEXG4vLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGUvY2xpZW50XCIgLz5cblxuLyoqXG4gKiBcdTdFREZcdTRFMDBcdTc2ODRcdTVFOTRcdTc1MjhcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcbiAqIFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NzY4NFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1OTBGRFx1NEVDRVx1OEZEOVx1OTFDQ1x1OEJGQlx1NTNENlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NEU4Q1x1NEU0OVx1NjAyN1xuICovXG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBwRW52Q29uZmlnIHtcbiAgYXBwTmFtZTogc3RyaW5nO1xuICBkZXZIb3N0OiBzdHJpbmc7XG4gIGRldlBvcnQ6IHN0cmluZztcbiAgcHJlSG9zdDogc3RyaW5nO1xuICBwcmVQb3J0OiBzdHJpbmc7XG4gIHRlc3RIb3N0Pzogc3RyaW5nOyAvLyBcdTZENEJcdThCRDVcdTczQUZcdTU4ODNcdTRGN0ZcdTc1MjhcdTVCNTBcdTU3REZcdTU0MERcdUZGMDhcdTU5ODIgYWRtaW4udGVzdC5iZWxsaXMuY29tLmNuXHVGRjA5XHVGRjBDXHU0RTBEXHU0RjdGXHU3NTI4XHU3QUVGXHU1M0UzXG4gIHByb2RIb3N0OiBzdHJpbmc7XG59XG5cbi8qKlxuICogXHU0RTNCXHU1RTk0XHU3NTI4XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFXG4gKi9cbmNvbnN0IE1BSU5fQVBQX0NPTkZJRzogQXBwRW52Q29uZmlnID0ge1xuICBhcHBOYW1lOiAnbWFpbi1hcHAnLFxuICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICBkZXZQb3J0OiAnODA4MCcsXG4gIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICBwcmVQb3J0OiAnNDE4MCcsXG4gIHRlc3RIb3N0OiAndGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgcHJvZEhvc3Q6ICdiZWxsaXMuY29tLmNuJyxcbn07XG5cbi8qKlxuICogXHU0RTFBXHU1MkExXHU1QjUwXHU1RTk0XHU3NTI4XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFXHVGRjA4XHU2MzA5XHU1QjU3XHU2QkNEXHU5ODdBXHU1RThGXHVGRjA5XG4gKi9cbmNvbnN0IEJVU0lORVNTX0FQUF9DT05GSUdTOiBBcHBFbnZDb25maWdbXSA9IFtcbiAge1xuICAgIGFwcE5hbWU6ICdhZG1pbi1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODEnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTgxJyxcbiAgICB0ZXN0SG9zdDogJ2FkbWluLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdhZG1pbi5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdkYXNoYm9hcmQtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDgyJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4MicsXG4gICAgdGVzdEhvc3Q6ICdkYXNoYm9hcmQudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ2Rhc2hib2FyZC5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdlbmdpbmVlcmluZy1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODMnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTgzJyxcbiAgICB0ZXN0SG9zdDogJ2VuZ2luZWVyaW5nLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdlbmdpbmVlcmluZy5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdmaW5hbmNlLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4NCcsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODQnLFxuICAgIHRlc3RIb3N0OiAnZmluYW5jZS50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnZmluYW5jZS5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdsb2dpc3RpY3MtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg2JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NicsXG4gICAgdGVzdEhvc3Q6ICdsb2dpc3RpY3MudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ2xvZ2lzdGljcy5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdvcGVyYXRpb25zLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4OCcsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODgnLFxuICAgIHRlc3RIb3N0OiAnb3BlcmF0aW9ucy50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnb3BlcmF0aW9ucy5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdwZXJzb25uZWwtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg5JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4OScsXG4gICAgdGVzdEhvc3Q6ICdwZXJzb25uZWwudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ3BlcnNvbm5lbC5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdwcm9kdWN0aW9uLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA5NicsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxOTAnLFxuICAgIHRlc3RIb3N0OiAncHJvZHVjdGlvbi50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAncHJvZHVjdGlvbi5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdxdWFsaXR5LWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA5MScsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxOTEnLFxuICAgIHRlc3RIb3N0OiAncXVhbGl0eS50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAncXVhbGl0eS5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdzeXN0ZW0tYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDkyJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5MicsXG4gICAgdGVzdEhvc3Q6ICdzeXN0ZW0udGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ3N5c3RlbS5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbl07XG5cbi8qKlxuICogXHU3Mjc5XHU2QjhBXHU1RTk0XHU3NTI4XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFXHVGRjA4XHU2MzA5XHU1QjU3XHU2QkNEXHU5ODdBXHU1RThGXHVGRjA5XG4gKi9cbmNvbnN0IFNQRUNJQUxfQVBQX0NPTkZJR1M6IEFwcEVudkNvbmZpZ1tdID0gW1xuICB7XG4gICAgYXBwTmFtZTogJ2RvY3MtYXBwJyxcbiAgICBkZXZIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBkZXZQb3J0OiAnODA5MycsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxOTMnLFxuICAgIHRlc3RIb3N0OiAnZG9jcy50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnZG9jcy5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdob21lLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4NScsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODUnLFxuICAgIHRlc3RIb3N0OiAnd3d3LnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICd3d3cuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnbGF5b3V0LWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA5NCcsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxOTQnLFxuICAgIHRlc3RIb3N0OiAnbGF5b3V0LnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdsYXlvdXQuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnbW9iaWxlLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4NycsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODcnLFxuICAgIHRlc3RIb3N0OiAnbW9iaWxlLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdtb2JpbGUuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG5dO1xuXG4vKipcbiAqIFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NzY4NFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVxuICogXHU1NDA4XHU1RTc2XHU0RTNCXHU1RTk0XHU3NTI4XHUzMDAxXHU0RTFBXHU1MkExXHU1RTk0XHU3NTI4XHU1NDhDXHU3Mjc5XHU2QjhBXHU1RTk0XHU3NTI4XG4gKi9cbmV4cG9ydCBjb25zdCBBUFBfRU5WX0NPTkZJR1M6IEFwcEVudkNvbmZpZ1tdID0gW1xuICBNQUlOX0FQUF9DT05GSUcsXG4gIC4uLkJVU0lORVNTX0FQUF9DT05GSUdTLFxuICAuLi5TUEVDSUFMX0FQUF9DT05GSUdTLFxuXTtcblxuLyoqXG4gKiBcdTY4MzlcdTYzNkVcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcdTgzQjdcdTUzRDZcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcENvbmZpZyhhcHBOYW1lOiBzdHJpbmcpOiBBcHBFbnZDb25maWcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gQVBQX0VOVl9DT05GSUdTLmZpbmQoKGNvbmZpZykgPT4gY29uZmlnLmFwcE5hbWUgPT09IGFwcE5hbWUpO1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NjI0MFx1NjcwOVx1NUYwMFx1NTNEMVx1N0FFRlx1NTNFM1x1NTIxN1x1ODg2OFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsRGV2UG9ydHMoKTogc3RyaW5nW10ge1xuICAvLyBcdTk2MzJcdTVGQTFcdTYwMjdcdTY4QzBcdTY3RTVcdUZGMUFcdTRGN0ZcdTc1MjggdHJ5LWNhdGNoIFx1NjM1NVx1ODNCN1x1NTNFRlx1ODBGRFx1NzY4NCBURFogKFRlbXBvcmFsIERlYWQgWm9uZSkgXHU5NTE5XHU4QkVGXG4gIC8vIFx1NTk4Mlx1Njc5QyBBUFBfRU5WX0NPTkZJR1MgXHU4RkQ4XHU2Q0ExXHU2NzA5XHU1MjFEXHU1OUNCXHU1MzE2XHVGRjA4XHU3NTMxXHU0RThFXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XHU2MjE2XHU2QTIxXHU1NzU3XHU1MkEwXHU4RjdEXHU5ODdBXHU1RThGXHVGRjA5XHVGRjBDXHU4RkQ0XHU1NkRFXHU3QTdBXHU2NTcwXHU3RUM0XG4gIHRyeSB7XG4gICAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5tYXAoKGNvbmZpZykgPT4gY29uZmlnLmRldlBvcnQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFJlZmVyZW5jZUVycm9yICYmIGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ2JlZm9yZSBpbml0aWFsaXphdGlvbicpKSB7XG4gICAgICBpZiAodHlwZW9mIGltcG9ydC5tZXRhICE9PSAndW5kZWZpbmVkJyAmJiBpbXBvcnQubWV0YS5lbnYgJiYgaW1wb3J0Lm1ldGEuZW52LkRFVikge1xuICAgICAgICAvLyBcdTc2RjRcdTYzQTVcdTRGN0ZcdTc1MjggY29uc29sZS53YXJuXHVGRjBDXHU5MDdGXHU1MTREXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XG4gICAgICAgIGNvbnNvbGUud2FybignW2FwcC1lbnYuY29uZmlnXSBBUFBfRU5WX0NPTkZJR1MgXHU2NzJBXHU1MjFEXHU1OUNCXHU1MzE2XHVGRjA4XHU1M0VGXHU4MEZEXHU2NjJGXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XHVGRjA5XHVGRjBDXHU4RkQ0XHU1NkRFXHU3QTdBXHU2NTcwXHU3RUM0Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIC8vIFx1NTE3Nlx1NEVENlx1OTUxOVx1OEJFRlx1OTFDRFx1NjVCMFx1NjI5Qlx1NTFGQVxuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU5ODg0XHU4OUM4XHU3QUVGXHU1M0UzXHU1MjE3XHU4ODY4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGxQcmVQb3J0cygpOiBzdHJpbmdbXSB7XG4gIC8vIFx1OTYzMlx1NUZBMVx1NjAyN1x1NjhDMFx1NjdFNVx1RkYxQVx1NEY3Rlx1NzUyOCB0cnktY2F0Y2ggXHU2MzU1XHU4M0I3XHU1M0VGXHU4MEZEXHU3Njg0IFREWiAoVGVtcG9yYWwgRGVhZCBab25lKSBcdTk1MTlcdThCRUZcbiAgLy8gXHU1OTgyXHU2NzlDIEFQUF9FTlZfQ09ORklHUyBcdThGRDhcdTZDQTFcdTY3MDlcdTUyMURcdTU5Q0JcdTUzMTZcdUZGMDhcdTc1MzFcdTRFOEVcdTVGQUFcdTczQUZcdTRGOURcdThENTZcdTYyMTZcdTZBMjFcdTU3NTdcdTUyQTBcdThGN0RcdTk4N0FcdTVFOEZcdUZGMDlcdUZGMENcdThGRDRcdTU2REVcdTdBN0FcdTY1NzBcdTdFQzRcbiAgdHJ5IHtcbiAgICByZXR1cm4gQVBQX0VOVl9DT05GSUdTLm1hcCgoY29uZmlnKSA9PiBjb25maWcucHJlUG9ydCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgUmVmZXJlbmNlRXJyb3IgJiYgZXJyb3IubWVzc2FnZS5pbmNsdWRlcygnYmVmb3JlIGluaXRpYWxpemF0aW9uJykpIHtcbiAgICAgIGlmICh0eXBlb2YgaW1wb3J0Lm1ldGEgIT09ICd1bmRlZmluZWQnICYmIGltcG9ydC5tZXRhLmVudiAmJiBpbXBvcnQubWV0YS5lbnYuREVWKSB7XG4gICAgICAgIC8vIFx1NzZGNFx1NjNBNVx1NEY3Rlx1NzUyOCBjb25zb2xlLndhcm5cdUZGMENcdTkwN0ZcdTUxNERcdTVGQUFcdTczQUZcdTRGOURcdThENTZcbiAgICAgICAgY29uc29sZS53YXJuKCdbYXBwLWVudi5jb25maWddIEFQUF9FTlZfQ09ORklHUyBcdTY3MkFcdTUyMURcdTU5Q0JcdTUzMTZcdUZGMDhcdTUzRUZcdTgwRkRcdTY2MkZcdTVGQUFcdTczQUZcdTRGOURcdThENTZcdUZGMDlcdUZGMENcdThGRDRcdTU2REVcdTdBN0FcdTY1NzBcdTdFQzQnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgLy8gXHU1MTc2XHU0RUQ2XHU5NTE5XHU4QkVGXHU5MUNEXHU2NUIwXHU2MjlCXHU1MUZBXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTY4MzlcdTYzNkVcdTdBRUZcdTUzRTNcdTgzQjdcdTUzRDZcdTVFOTRcdTc1MjhcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcENvbmZpZ0J5RGV2UG9ydChwb3J0OiBzdHJpbmcpOiBBcHBFbnZDb25maWcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gQVBQX0VOVl9DT05GSUdTLmZpbmQoKGNvbmZpZykgPT4gY29uZmlnLmRldlBvcnQgPT09IHBvcnQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnQnlQcmVQb3J0KHBvcnQ6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcucHJlUG9ydCA9PT0gcG9ydCk7XG59XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFXHU2RDRCXHU4QkQ1XHU3M0FGXHU1ODgzXHU1QjUwXHU1N0RGXHU1NDBEXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWdCeVRlc3RIb3N0KHRlc3RIb3N0OiBzdHJpbmcpOiBBcHBFbnZDb25maWcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gQVBQX0VOVl9DT05GSUdTLmZpbmQoKGNvbmZpZykgPT4gY29uZmlnLnRlc3RIb3N0ID09PSB0ZXN0SG9zdCk7XG59XG5cbi8qKlxuICogXHU1MjI0XHU2NUFEXHU1RTk0XHU3NTI4XHU2NjJGXHU1NDI2XHU0RTNBXHU3Mjc5XHU2QjhBXHU1RTk0XHU3NTI4XHVGRjA4XHU1NzI4IFNQRUNJQUxfQVBQX0NPTkZJR1MgXHU0RTJEXHVGRjA5XG4gKiBcdTcyNzlcdTZCOEFcdTVFOTRcdTc1MjhcdTUzMDVcdTYyRUNcdUZGMUFkb2NzLWFwcCwgaG9tZS1hcHAsIGxheW91dC1hcHAsIG1vYmlsZS1hcHBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU3BlY2lhbEFwcChhcHBOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIFNQRUNJQUxfQVBQX0NPTkZJR1Muc29tZSgoY29uZmlnKSA9PiBjb25maWcuYXBwTmFtZSA9PT0gYXBwTmFtZSk7XG59XG5cbi8qKlxuICogXHU1MjI0XHU2NUFEXHU1RTk0XHU3NTI4XHU2NjJGXHU1NDI2XHU0RTNBXHU0RTFBXHU1MkExXHU1RTk0XHU3NTI4XHVGRjA4XHU1NzI4IEJVU0lORVNTX0FQUF9DT05GSUdTIFx1NEUyRFx1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNCdXNpbmVzc0FwcChhcHBOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIEJVU0lORVNTX0FQUF9DT05GSUdTLnNvbWUoKGNvbmZpZykgPT4gY29uZmlnLmFwcE5hbWUgPT09IGFwcE5hbWUpO1xufVxuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1NUU5NFx1NzUyOCBJRCBcdTUyMjRcdTY1QURcdTY2MkZcdTU0MjZcdTRFM0FcdTcyNzlcdTZCOEFcdTVFOTRcdTc1MjhcbiAqIFx1NUU5NFx1NzUyOCBJRCBcdTY2MkYgYXBwTmFtZSBcdTUzQkJcdTYzODkgJy1hcHAnIFx1NTQwRVx1N0YwMFx1NTQwRVx1NzY4NFx1NTAzQ1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTcGVjaWFsQXBwQnlJZChhcHBJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IGFwcE5hbWUgPSBgJHthcHBJZH0tYXBwYDtcbiAgcmV0dXJuIGlzU3BlY2lhbEFwcChhcHBOYW1lKTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXGJhc2UuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9iYXNlLmNvbmZpZy50c1wiOy8qKlxuICogXHU1N0ZBXHU3ODQwXHU5MTREXHU3RjZFXHU2QTIxXHU1NzU3XG4gKiBcdTYzRDBcdTRGOUJcdTUxNkNcdTUxNzFcdTc2ODRcdTUyMkJcdTU0MERcdTU0OEMgcmVzb2x2ZSBcdTkxNERcdTdGNkVcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFVzZXJDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyBjcmVhdGVQYXRoSGVscGVycyB9IGZyb20gJy4vdXRpbHMvcGF0aC1oZWxwZXJzJztcblxuLyoqXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTc4NDBcdTUyMkJcdTU0MERcdTkxNERcdTdGNkVcbiAqIEBwYXJhbSBhcHBEaXIgXHU1RTk0XHU3NTI4XHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XG4gKiBAcGFyYW0gYXBwTmFtZSBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcbiAqIEByZXR1cm5zIFx1NTIyQlx1NTQwRFx1OTE0RFx1N0Y2RVx1NUJGOVx1OEM2MVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQmFzZUFsaWFzZXMoXG4gIGFwcERpcjogc3RyaW5nLCBcbiAgX2FwcE5hbWU6IHN0cmluZ1xuKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gIGNvbnN0IHsgd2l0aFNyYywgd2l0aFJvb3QsIHdpdGhDb25maWdzLCB3aXRoUGFja2FnZXMgfSA9IGNyZWF0ZVBhdGhIZWxwZXJzKGFwcERpcik7XG5cbiAgY29uc3QgYWxpYXNlczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAnQCc6IHdpdGhTcmMoJ3NyYycpLFxuICAgICdAbW9kdWxlcyc6IHdpdGhTcmMoJ3NyYy9tb2R1bGVzJyksXG4gICAgJ0BzZXJ2aWNlcyc6IHdpdGhTcmMoJ3NyYy9zZXJ2aWNlcycpLFxuICAgICdAY29tcG9uZW50cyc6IHdpdGhTcmMoJ3NyYy9jb21wb25lbnRzJyksXG4gICAgJ0B1dGlscyc6IHdpdGhTcmMoJ3NyYy91dGlscycpLFxuICAgICdAYXV0aCc6IHdpdGhSb290KCdhdXRoJyksXG4gICAgJ0Bjb25maWdzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMvY29uZmlncycpLFxuICAgICdAYnRjL2F1dGgtc2hhcmVkJzogd2l0aFJvb3QoJ2F1dGgvc2hhcmVkJyksXG4gICAgLy8gQGJ0Yy8qIFx1NTMwNVx1NTIyQlx1NTQwRFx1RkYxQVx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NjI1M1x1NTMwNVx1OEZEOVx1NEU5Qlx1NTMwNVx1RkYwQ1x1NjI0MFx1NEVFNVx1NTlDQlx1N0VDOFx1NEY3Rlx1NzUyOFx1NTIyQlx1NTQwRFx1NjMwN1x1NTQxMVx1NkU5MFx1NzgwMVxuICAgICdAYnRjL3NoYXJlZC1jb3JlJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMnKSxcbiAgICAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjJyksXG4gICAgJ0BidGMvc2hhcmVkLXJvdXRlcic6IHdpdGhQYWNrYWdlcygnc2hhcmVkLXJvdXRlci9zcmMnKSxcbiAgICAvLyBcdTU0MTFcdTU0MEVcdTUxN0NcdTVCQjlcdUZGMUFcdTVFOUZcdTVGMDNcdTUzMDVcdTc2ODRcdTUyMkJcdTU0MERcdTYzMDdcdTU0MTFcdTVGNTJcdTVFNzZcdTU0MEVcdTc2ODRcdTRGNERcdTdGNkVcbiAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYy91dGlscycpLFxuICAgICdAYnRjL3NoYXJlZC1wbHVnaW5zJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvcGx1Z2lucycpLFxuICAgICdAYnRjL2kxOG4nOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9pMThuJyksXG4gICAgJ0BidGMvc3ViYXBwLW1hbmlmZXN0cyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvcmUvc3JjL21hbmlmZXN0JyksXG4gICAgJ0BidGMvZW52Jzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMvZW52JyksXG4gICAgXG4gICAgLy8gc2hhcmVkLWNvbXBvbmVudHMgXHU1MTg1XHU5MEU4XHU0RjdGXHU3NTI4XHU3Njg0XHU1MjJCXHU1NDBEXHVGRjA4XHU3NTI4XHU0RThFXHU4OUUzXHU2NzkwIHNoYXJlZC1jb21wb25lbnRzIFx1NTE4NVx1OTBFOFx1NzY4NFx1NUJGQ1x1NTE2NVx1RkYwOVxuICAgICdAYnRjLWNvbW1vbic6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbW1vbicpLFxuICAgICdAYnRjLWNvbXBvbmVudHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzJyksXG4gICAgJ0BidGMtY3J1ZCc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NydWQnKSxcbiAgICAnQGJ0Yy1zdHlsZXMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9zdHlsZXMnKSxcbiAgICAnQGJ0Yy1sb2NhbGVzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvbG9jYWxlcycpLFxuICAgICdAYnRjLWFzc2V0cyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2Fzc2V0cycpLFxuICAgICdAYXNzZXRzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvYXNzZXRzJyksIC8vIEBhc3NldHMgXHU1MjJCXHU1NDBEXHVGRjBDXHU3NTI4XHU0RThFXHU1NkZFXHU3MjQ3XHU4RDQ0XHU2RTkwXHU1QkZDXHU1MTY1XG4gICAgJ0BidGMtdXRpbHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy91dGlscycpLFxuICAgICdAcGx1Z2lucyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL3BsdWdpbnMnKSxcbiAgICBcbiAgICAvLyBcdTU2RkVcdTg4NjhcdTc2RjhcdTUxNzNcdTUyMkJcdTU0MERcbiAgICAnQGNoYXJ0cy11dGlscy9jc3MtdmFyJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzL2Nzcy12YXInKSxcbiAgICAnQGNoYXJ0cy11dGlscy9jb2xvcic6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9jb2xvcicpLFxuICAgICdAY2hhcnRzLXV0aWxzL2dyYWRpZW50Jzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzL2dyYWRpZW50JyksXG4gICAgJ0BjaGFydHMtY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQnKSxcbiAgICAnQGNoYXJ0cy10eXBlcyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy90eXBlcycpLFxuICAgICdAY2hhcnRzLXV0aWxzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzJyksXG4gICAgJ0BjaGFydHMtY29tcG9zYWJsZXMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvY29tcG9zYWJsZXMnKSxcblxuICAgIC8vIEVsZW1lbnQgUGx1cyBcdTUyMkJcdTU0MERcdUZGMDhcdTU5Q0JcdTdFQzhcdTRGN0ZcdTc1MjhcdUZGMDlcbiAgICAnZWxlbWVudC1wbHVzL2VzJzogJ2VsZW1lbnQtcGx1cy9lcycsXG4gICAgJ2VsZW1lbnQtcGx1cy9kaXN0JzogJ2VsZW1lbnQtcGx1cy9kaXN0JyxcbiAgfTtcblxuICByZXR1cm4gYWxpYXNlcztcbn1cblxuLyoqXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTc4NDAgcmVzb2x2ZSBcdTkxNERcdTdGNkVcbiAqIEBwYXJhbSBhcHBEaXIgXHU1RTk0XHU3NTI4XHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XG4gKiBAcGFyYW0gYXBwTmFtZSBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcbiAqIEByZXR1cm5zIHJlc29sdmUgXHU5MTREXHU3RjZFXHU1QkY5XHU4QzYxXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCYXNlUmVzb2x2ZShcbiAgYXBwRGlyOiBzdHJpbmcsIFxuICBhcHBOYW1lOiBzdHJpbmdcbik6IFVzZXJDb25maWdbJ3Jlc29sdmUnXSB7XG4gIGNvbnN0IHsgd2l0aFBhY2thZ2VzIH0gPSBjcmVhdGVQYXRoSGVscGVycyhhcHBEaXIpO1xuICBjb25zdCBhbGlhc2VzID0gY3JlYXRlQmFzZUFsaWFzZXMoYXBwRGlyLCBhcHBOYW1lKTtcbiAgXG4gIC8vIFx1NEY3Rlx1NzUyOFx1NjU3MFx1N0VDNFx1NUY2Mlx1NUYwRlx1NzY4NFx1NTIyQlx1NTQwRFx1RkYwQ1x1Nzg2RVx1NEZERFx1NjZGNFx1NTE3N1x1NEY1M1x1NzY4NFx1NTIyQlx1NTQwRFx1NEYxOFx1NTE0OFx1NTMzOVx1OTE0RFxuICAvLyBWaXRlIFx1NEYxQVx1NjMwOVx1NjU3MFx1N0VDNFx1OTg3QVx1NUU4Rlx1NTMzOVx1OTE0RFx1RkYwQ1x1N0IyQ1x1NEUwMFx1NEUyQVx1NTMzOVx1OTE0RFx1NzY4NFx1NTIyQlx1NTQwRFx1NEYxQVx1ODhBQlx1NEY3Rlx1NzUyOFxuICBjb25zdCBhbGlhc0FycmF5OiBBcnJheTx7IGZpbmQ6IHN0cmluZyB8IFJlZ0V4cDsgcmVwbGFjZW1lbnQ6IHN0cmluZyB9PiA9IFtcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTVDMDYgdXRpbCBcdTY2MjBcdTVDMDRcdTUyMzAgbnBtIFx1NTMwNVx1RkYwQ1x1OTYzMlx1NkI2MiBWaXRlIFx1NUMwNlx1NTE3Nlx1ODlDNlx1NEUzQSBOb2RlLmpzIFx1NTE4NVx1N0Y2RVx1NkEyMVx1NTc1N1x1NUU3Nlx1NTkxNlx1OTBFOFx1NTMxNlxuICAgIC8vIFx1OTcwMFx1ODk4MVx1NjdFNVx1NjI3RSBub2RlX21vZHVsZXMvdXRpbCBcdTc2ODRcdTVCOUVcdTk2NDVcdThERUZcdTVGODRcdUZGMDhcdTUzRUZcdTgwRkRcdTU3MjhcdTY4MzlcdTc2RUVcdTVGNTVcdTYyMTZcdTVFOTRcdTc1MjhcdTc2RUVcdTVGNTVcdUZGMDlcbiAgICB7XG4gICAgICBmaW5kOiAvXnV0aWwkLyxcbiAgICAgIHJlcGxhY2VtZW50OiAoKCkgPT4ge1xuICAgICAgICAvLyBcdTVDMURcdThCRDVcdTRFQ0VcdTVFOTRcdTc1MjhcdTc2RUVcdTVGNTVcdTY3RTVcdTYyN0VcbiAgICAgICAgY29uc3QgYXBwVXRpbFBhdGggPSByZXNvbHZlKGFwcERpciwgJ25vZGVfbW9kdWxlcy91dGlsJyk7XG4gICAgICAgIGlmIChleGlzdHNTeW5jKGFwcFV0aWxQYXRoKSkge1xuICAgICAgICAgIHJldHVybiBhcHBVdGlsUGF0aDtcbiAgICAgICAgfVxuICAgICAgICAvLyBcdTVDMURcdThCRDVcdTRFQ0VcdTY4MzlcdTc2RUVcdTVGNTVcdTY3RTVcdTYyN0VcbiAgICAgICAgY29uc3Qgcm9vdFV0aWxQYXRoID0gcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9ub2RlX21vZHVsZXMvdXRpbCcpO1xuICAgICAgICBpZiAoZXhpc3RzU3luYyhyb290VXRpbFBhdGgpKSB7XG4gICAgICAgICAgcmV0dXJuIHJvb3RVdGlsUGF0aDtcbiAgICAgICAgfVxuICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTYyN0VcdTRFMERcdTUyMzBcdUZGMENcdThGRDRcdTU2REVcdTUzMDVcdTU0MERcdThCQTkgVml0ZSBcdTgxRUFcdTUyQThcdTg5RTNcdTY3OTBcdUZGMDhcdTVFOTRcdThCRTVcdTU3Mjggb3B0aW1pemVEZXBzLmluY2x1ZGUgXHU0RTJEXHVGRjA5XG4gICAgICAgIHJldHVybiAndXRpbCc7XG4gICAgICB9KSgpLFxuICAgIH0sXG4gICAgLy8gbG9jYWxlcyBcdTVCNTBcdThERUZcdTVGODRcdTUyMkJcdTU0MERcdUZGMDhcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTRGN0ZcdTc1MjhcdTUyMkJcdTU0MERcdTYzMDdcdTU0MTFcdTZFOTBcdTc4MDFcdUZGMDlcbiAgICB7XG4gICAgICBmaW5kOiAnQGJ0Yy9zaGFyZWQtY29yZS9sb2NhbGVzL3poLUNOJyxcbiAgICAgIHJlcGxhY2VtZW50OiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYy9idGMvcGx1Z2lucy9pMThuL2xvY2FsZXMvemgtQ04nKSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGZpbmQ6ICdAYnRjL3NoYXJlZC1jb3JlL2xvY2FsZXMvZW4tVVMnLFxuICAgICAgcmVwbGFjZW1lbnQ6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvcmUvc3JjL2J0Yy9wbHVnaW5zL2kxOG4vbG9jYWxlcy9lbi1VUycpLFxuICAgIH0sXG4gICAge1xuICAgICAgZmluZDogJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMvbG9jYWxlcy96aC1DTi5qc29uJyxcbiAgICAgIHJlcGxhY2VtZW50OiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9sb2NhbGVzL3poLUNOLmpzb24nKSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGZpbmQ6ICdAYnRjL3NoYXJlZC1jb21wb25lbnRzL2xvY2FsZXMvZW4tVVMuanNvbicsXG4gICAgICByZXBsYWNlbWVudDogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvbG9jYWxlcy9lbi1VUy5qc29uJyksXG4gICAgfSxcbiAgICAvLyBcdTUxNzZcdTRFRDZcdTUyMkJcdTU0MERcdUZGMDhcdTRFQ0VcdTVCRjlcdThDNjFcdThGNkNcdTYzNjJcdTRFM0FcdTY1NzBcdTdFQzRcdTVGNjJcdTVGMEZcdUZGMDlcbiAgICAuLi5PYmplY3QuZW50cmllcyhhbGlhc2VzKS5tYXAoKFtmaW5kLCByZXBsYWNlbWVudF0pID0+ICh7XG4gICAgICBmaW5kLFxuICAgICAgcmVwbGFjZW1lbnQsXG4gICAgfSkpLFxuICBdO1xuICBcbiAgcmV0dXJuIHtcbiAgICBhbGlhczogYWxpYXNBcnJheSxcbiAgICBkZWR1cGU6IFsndnVlJywgJ3Z1ZS1yb3V0ZXInLCAncGluaWEnLCAnZWxlbWVudC1wbHVzJywgJ0BlbGVtZW50LXBsdXMvaWNvbnMtdnVlJ10sXG4gICAgZXh0ZW5zaW9uczogWycubWpzJywgJy5qcycsICcubXRzJywgJy50cycsICcuanN4JywgJy50c3gnLCAnLmpzb24nLCAnLnZ1ZSddLFxuICAgIC8vIFx1Nzg2RVx1NEZERCBWaXRlIFx1NEYxOFx1NTE0OFx1NEY3Rlx1NzUyOCBwYWNrYWdlLmpzb24gXHU3Njg0IGV4cG9ydHMgXHU5MTREXHU3RjZFXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU2REZCXHU1MkEwICdkZXZlbG9wbWVudCcgXHU2NzYxXHU0RUY2XHVGRjBDXHU3ODZFXHU0RkREXHU1NzI4XHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU0RTJEXHU0RjdGXHU3NTI4XHU2RTkwXHU3ODAxXG4gICAgY29uZGl0aW9uczogWydkZXZlbG9wbWVudCcsICdpbXBvcnQnLCAnbW9kdWxlJywgJ2Jyb3dzZXInLCAnZGVmYXVsdCddLFxuICB9O1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcbWFudWFsLWNodW5rcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9tYW51YWwtY2h1bmtzLnRzXCI7LyoqXG4gKiBtYW51YWxDaHVua3MgXHU3QjU2XHU3NTY1XHU5MTREXHU3RjZFXG4gKiBcdTVCOUFcdTRFNDlcdTRFRTNcdTc4MDFcdTUyMDZcdTUyNzJcdTdCNTZcdTc1NjVcdUZGMENcdTVDMDZcdTRFMERcdTU0MENcdTdDN0JcdTU3OEJcdTc2ODRcdTRFRTNcdTc4MDFcdTYyNTNcdTUzMDVcdTUyMzBcdTRFMERcdTU0MENcdTc2ODQgY2h1bmtcbiAqL1xuXG4vKipcbiAqIFx1NUU5NFx1NzUyOFx1NEY3Rlx1NzUyOFx1NjBDNVx1NTFCNVx1OTE0RFx1N0Y2RVxuICogXHU1QjlBXHU0RTQ5XHU1NEVBXHU0RTlCXHU1RTk0XHU3NTI4XHU0RjdGXHU3NTI4XHU1NEVBXHU0RTlCXHU1RTkzXHVGRjBDXHU3NTI4XHU0RThFXHU2NzYxXHU0RUY2XHU2MjUzXHU1MzA1XG4gKi9cbmNvbnN0IEFQUF9VU0FHRTogUmVjb3JkPHN0cmluZywgeyBlY2hhcnRzOiBib29sZWFuOyBtb25hY286IGJvb2xlYW47IHRocmVlOiBib29sZWFuIH0+ID0ge1xuICAnbGF5b3V0LWFwcCc6IHsgZWNoYXJ0czogdHJ1ZSwgbW9uYWNvOiBmYWxzZSwgdGhyZWU6IGZhbHNlIH0sXG4gICdzeXN0ZW0tYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbiAgJ2FkbWluLWFwcCc6IHsgZWNoYXJ0czogdHJ1ZSwgbW9uYWNvOiBmYWxzZSwgdGhyZWU6IGZhbHNlIH0sXG4gICdmaW5hbmNlLWFwcCc6IHsgZWNoYXJ0czogdHJ1ZSwgbW9uYWNvOiBmYWxzZSwgdGhyZWU6IGZhbHNlIH0sXG4gICdsb2dpc3RpY3MtYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbiAgJ3F1YWxpdHktYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbiAgJ3Byb2R1Y3Rpb24tYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbiAgJ2VuZ2luZWVyaW5nLWFwcCc6IHsgZWNoYXJ0czogdHJ1ZSwgbW9uYWNvOiBmYWxzZSwgdGhyZWU6IGZhbHNlIH0sXG4gICdtb25pdG9yLWFwcCc6IHsgZWNoYXJ0czogdHJ1ZSwgbW9uYWNvOiBmYWxzZSwgdGhyZWU6IGZhbHNlIH0sXG4gICdtb2JpbGUtYXBwJzogeyBlY2hhcnRzOiBmYWxzZSwgbW9uYWNvOiBmYWxzZSwgdGhyZWU6IGZhbHNlIH0sXG59O1xuXG4vKipcbiAqIFx1NTIyNFx1NjVBRFx1NjYyRlx1NTQyNlx1NEUzQVx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1xuICovXG5jb25zdCBpc1Byb2R1Y3Rpb24gPSBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nO1xuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBtYW51YWxDaHVua3MgXHU3QjU2XHU3NTY1XHU1MUZEXHU2NTcwXG4gKiBAcGFyYW0gYXBwTmFtZSBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcdUZGMDhcdTc1MjhcdTRFOEVcdThGQzdcdTZFRTRcdTcyNzlcdTVCOUFcdTVFOTRcdTc1MjhcdTc2ODQgbWFuaWZlc3RcdUZGMDlcbiAqIEByZXR1cm5zIG1hbnVhbENodW5rcyBcdTUxRkRcdTY1NzBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1hbnVhbENodW5rc1N0cmF0ZWd5KGFwcE5hbWU6IHN0cmluZykge1xuICBjb25zdCBpc0xheW91dEFwcCA9IGFwcE5hbWUgPT09ICdsYXlvdXQtYXBwJztcbiAgY29uc3QgaXNNYWluQXBwID0gYXBwTmFtZSA9PT0gJ21haW4tYXBwJztcbiAgY29uc3QgYXBwVXNhZ2UgPSBBUFBfVVNBR0VbYXBwTmFtZV0gfHwgeyBlY2hhcnRzOiBmYWxzZSwgbW9uYWNvOiBmYWxzZSwgdGhyZWU6IGZhbHNlIH07XG4gIC8vIFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NEUxNFx1OTc1RSBsYXlvdXQtYXBwIFx1NjVGNlx1RkYwQ1x1NTE3MVx1NEVBQlx1OEQ0NFx1NkU5MFx1NEUwRFx1NjI1M1x1NTMwNVx1RkYwOFx1NEVDRSBsYXlvdXQtYXBwIFx1NTJBMFx1OEY3RFx1RkYwOVxuICAvLyBcdTRGNDYgbWFpbi1hcHAgXHU0RjVDXHU0RTNBXHU0RTNCXHU1RTk0XHU3NTI4XHVGRjBDXHU5NzAwXHU4OTgxXHU3NTFGXHU2MjEwXHU4MUVBXHU1REYxXHU3Njg0IEVQUyBcdTY3MERcdTUyQTFcbiAgY29uc3Qgc2tpcFNoYXJlZFJlc291cmNlcyA9IGlzUHJvZHVjdGlvbiAmJiAhaXNMYXlvdXRBcHAgJiYgIWlzTWFpbkFwcDtcblxuICByZXR1cm4gKGlkOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xuICAgIC8vIDAuIEVQUyBcdTY3MERcdTUyQTFcdTUzNTVcdTcyRUNcdTYyNTNcdTUzMDVcdUZGMDhcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTUxNzFcdTRFQUJcdUZGMENcdTVGQzVcdTk4N0JcdTU3MjhcdTY3MDBcdTUyNERcdTk3NjJcdUZGMDlcbiAgICBpZiAoaWQuaW5jbHVkZXMoJ3ZpcnR1YWw6ZXBzJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ1xcXFwwdmlydHVhbDplcHMnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnc2VydmljZXMvZXBzJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ3NlcnZpY2VzXFxcXGVwcycpKSB7XG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTc2ODRcdTVCNTBcdTVFOTRcdTc1MjhcdTRFMERcdTVFOTRcdThCRTVcdTUxOERcdTUzNTVcdTcyRUNcdTYyQzZcdTUxRkEgZXBzLXNlcnZpY2UgY2h1bmtcbiAgICAgIC8vIFx1NTQyNlx1NTIxOVx1NUI1MFx1NUU5NFx1NzUyOFx1NTE2NVx1NTNFM1x1NEYxQVx1NEVBN1x1NzUxRlx1NUJGOVx1ODFFQVx1OEVBQiAvYXNzZXRzL2Vwcy1zZXJ2aWNlLXh4eC5qcyBcdTc2ODRcdTVGMTVcdTc1MjhcdUZGMENcdTVCRkNcdTgxRjRcIlx1NTE3MVx1NEVBQlx1NjcyQVx1NzUxRlx1NjU0OCArIDQwNFwiXHU5OENFXHU5NjY5XHUzMDAyXG4gICAgICAvLyBsYXlvdXQtYXBwIFx1OEQxRlx1OEQyM1x1NjNEMFx1NEY5Qlx1NTE3MVx1NEVBQiBlcHMtc2VydmljZVx1RkYwQ1x1NUU3Nlx1NUMwNlx1NjcwRFx1NTJBMVx1NjMwMlx1NTIzMCB3aW5kb3cuX19BUFBfRVBTX1NFUlZJQ0VfX1x1MzAwMlxuICAgICAgLy8gbWFpbi1hcHAgXHU0RjVDXHU0RTNBXHU0RTNCXHU1RTk0XHU3NTI4XHVGRjBDXHU5NzAwXHU4OTgxXHU3NTFGXHU2MjEwXHU4MUVBXHU1REYxXHU3Njg0IEVQUyBcdTY3MERcdTUyQTFcdUZGMDhcdTcyRUNcdTdBQ0JcdThGRDBcdTg4NENcdTY1RjZcdTRFMERcdTRGOURcdThENTYgbGF5b3V0LWFwcFx1RkYwOVxuICAgICAgaWYgKHNraXBTaGFyZWRSZXNvdXJjZXMpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAnZXBzLXNlcnZpY2UnO1xuICAgIH1cblxuICAgIC8vIDAuMy4gQXV0aCBBUEkgXHU1MzU1XHU3MkVDXHU2MjUzXHU1MzA1XHVGRjA4XHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU1MTcxXHU0RUFCXHVGRjBDXHU3NTMxIHN5c3RlbS1hcHAgXHU2M0QwXHU0RjlCXHVGRjA5XG4gICAgaWYgKGlkLmluY2x1ZGVzKCdtb2R1bGVzL2FwaS1zZXJ2aWNlcy9hdXRoJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ21vZHVsZXNcXFxcYXBpLXNlcnZpY2VzXFxcXGF1dGgnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnYXBpLXNlcnZpY2VzL2F1dGgnKSkge1xuICAgICAgcmV0dXJuICdhdXRoLWFwaSc7XG4gICAgfVxuXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBbWVudVJlZ2lzdHJ5IFx1NEY5RFx1OEQ1NiBWdWVcdUZGMENcdTVGQzVcdTk4N0JcdTU0OEMgdmVuZG9yIFx1NEUwMFx1OEQ3N1x1NjI1M1x1NTMwNVx1RkYwQ1x1NEUwRFx1ODBGRFx1NTM1NVx1NzJFQ1x1NjI1M1x1NTMwNVx1NTIzMCBtZW51LXJlZ2lzdHJ5XG4gICAgLy8gXHU4RkQ5XHU2ODM3XHU3ODZFXHU0RkREIFZ1ZSBcdTc2ODQgcmVmIFx1NTcyOCBtZW51UmVnaXN0cnkgXHU0RjdGXHU3NTI4XHU0RTRCXHU1MjREXHU1REYyXHU3RUNGXHU1MjFEXHU1OUNCXHU1MzE2XG4gICAgLy8gXHU1RkM1XHU5ODdCXHU1NzI4XHU2OEMwXHU2N0U1IGxheW91dC1icmlkZ2UgXHU0RTRCXHU1MjREXHU2OEMwXHU2N0U1XHVGRjBDXHU1NkUwXHU0RTNBIGxheW91dC1icmlkZ2UgXHU0RjFBXHU1QkZDXHU1MTY1IG1lbnVSZWdpc3RyeVxuICAgIGlmIChpZC5pbmNsdWRlcygncGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL3N0b3JlL21lbnVSZWdpc3RyeScpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdAYnRjL3NoYXJlZC1jb21wb25lbnRzL3N0b3JlL21lbnVSZWdpc3RyeScpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdzaGFyZWQtY29tcG9uZW50cy9zdG9yZS9tZW51UmVnaXN0cnknKSkge1xuICAgICAgLy8gTGF5b3V0LUFwcFx1RkYxQVx1NUMwNiBtZW51UmVnaXN0cnkgXHU2MjUzXHU1MzA1XHU1MjMwIHZlbmRvclxuICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU1RTk0XHU3NTI4XHVGRjA4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjA5XHVGRjFBXHU0RTBEXHU2MjUzXHU1MzA1XHVGRjBDXHU0RUNFIGxheW91dC1hcHAgXHU1MkEwXHU4RjdEXG4gICAgICBpZiAoc2tpcFNoYXJlZFJlc291cmNlcykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgcmV0dXJuICd2ZW5kb3InO1xuICAgIH1cbiAgICBcbiAgICAvLyAwLjUuIFx1ODNEQ1x1NTM1NVx1NzZGOFx1NTE3M1x1NEVFM1x1NzgwMVx1NTM1NVx1NzJFQ1x1NjI1M1x1NTMwNVxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NUMwNlx1ODNEQ1x1NTM1NVx1NzZGOFx1NTE3M1x1NzY4NFx1NEVFM1x1NzgwMVx1NjI1M1x1NTMwNVx1NTIzMCBtZW51LXJlZ2lzdHJ5IGNodW5rXHVGRjBDXHU0RjQ2IG1lbnVSZWdpc3RyeSBcdTY3MkNcdThFQUJcdTRGOURcdThENTYgVnVlXHVGRjBDXHU5NzAwXHU4OTgxXHU2NTNFXHU1NzI4IHZlbmRvciBcdTRFNEJcdTU0MEVcbiAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFtZW51UmVnaXN0cnkgXHU0RjdGXHU3NTI4IFZ1ZSBcdTc2ODQgcmVmXHVGRjBDXHU2MjQwXHU0RUU1XHU0RTBEXHU4MEZEXHU1MzU1XHU3MkVDXHU2MjUzXHU1MzA1XHVGRjBDXHU1RTk0XHU4QkU1XHU1NDhDIHZlbmRvciBcdTRFMDBcdThENzdcbiAgICAvLyBcdTUzRUFcdTVDMDYgbWFuaWZlc3QgXHU2NTcwXHU2MzZFXHU1NDhDIGxheW91dC1icmlkZ2UgXHU2MjUzXHU1MzA1XHU1MjMwIG1lbnUtcmVnaXN0cnlcbiAgICAvLyBcdTRGNDYgbGF5b3V0LWJyaWRnZSBcdTRGMUFcdTVCRkNcdTUxNjUgbWVudVJlZ2lzdHJ5XHVGRjBDXHU2MjQwXHU0RUU1IGxheW91dC1icmlkZ2UgXHU0RTVGXHU1RTk0XHU4QkU1XHU2MjUzXHU1MzA1XHU1MjMwIHZlbmRvclxuICAgIGlmIChpZC5pbmNsdWRlcygnY29uZmlncy9sYXlvdXQtYnJpZGdlJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ0BidGMvc2hhcmVkLWNvcmUvY29uZmlncy9sYXlvdXQtYnJpZGdlJykpIHtcbiAgICAgIC8vIExheW91dC1BcHBcdUZGMUFsYXlvdXQtYnJpZGdlIFx1NUJGQ1x1NTE2NSBtZW51UmVnaXN0cnlcdUZGMENcdTYyNDBcdTRFRTVcdTRFNUZcdTVFOTRcdThCRTVcdTYyNTNcdTUzMDVcdTUyMzAgdmVuZG9yXG4gICAgICAvLyBcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdUZGMDhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMDlcdUZGMUFcdTRFMERcdTYyNTNcdTUzMDVcdUZGMENcdTRFQ0UgbGF5b3V0LWFwcCBcdTUyQTBcdThGN0RcbiAgICAgIGlmIChza2lwU2hhcmVkUmVzb3VyY2VzKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ3ZlbmRvcic7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTkwNFx1NzQwNiBzdWJhcHAtbWFuaWZlc3RzXHVGRjFBXHU1M0VBXHU1MzA1XHU1NDJCXHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3Njg0IG1hbmlmZXN0XG4gICAgaWYgKGlkLmluY2x1ZGVzKCdwYWNrYWdlcy9zdWJhcHAtbWFuaWZlc3RzJykgfHwgaWQuaW5jbHVkZXMoJ0BidGMvc3ViYXBwLW1hbmlmZXN0cycpKSB7XG4gICAgICAvLyBcdTYzOTJcdTk2NjRcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdTc2ODQgbWFuaWZlc3QgSlNPTiBcdTY1ODdcdTRFRjZcbiAgICAgIGNvbnN0IG90aGVyQXBwcyA9IFsnZmluYW5jZScsICdsb2dpc3RpY3MnLCAnc3lzdGVtJywgJ3F1YWxpdHknLCAnZW5naW5lZXJpbmcnLCAncHJvZHVjdGlvbicsICdtb25pdG9yJywgJ2FkbWluJ107XG4gICAgICBjb25zdCBjdXJyZW50QXBwTmFtZSA9IGFwcE5hbWUucmVwbGFjZSgnLWFwcCcsICcnKTtcbiAgICAgIGNvbnN0IHNob3VsZEV4Y2x1ZGUgPSBvdGhlckFwcHNcbiAgICAgICAgLmZpbHRlcihhcHAgPT4gYXBwICE9PSBjdXJyZW50QXBwTmFtZSlcbiAgICAgICAgLnNvbWUoYXBwID0+IGlkLmluY2x1ZGVzKGBtYW5pZmVzdHMvJHthcHB9Lmpzb25gKSk7XG4gICAgICBcbiAgICAgIGlmIChzaG91bGRFeGNsdWRlKSB7XG4gICAgICAgIC8vIFx1NTE3Nlx1NEVENlx1NUU5NFx1NzUyOFx1NzY4NCBtYW5pZmVzdFx1RkYwQ1x1NEUwRFx1NjI1M1x1NTMwNVx1NTIzMCBtZW51LXJlZ2lzdHJ5XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICAvLyBMYXlvdXQtQXBwXHVGRjFBXHU1M0VBXHU2MjUzXHU1MzA1XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3Njg0IG1hbmlmZXN0IFx1NTQ4Q1x1NTE3MVx1NEVBQlx1NEVFM1x1NzgwMVxuICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU1RTk0XHU3NTI4XHVGRjA4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjA5XHVGRjFBXHU0RTBEXHU2MjUzXHU1MzA1XHVGRjBDXHU0RUNFIGxheW91dC1hcHAgXHU1MkEwXHU4RjdEXG4gICAgICBpZiAoc2tpcFNoYXJlZFJlc291cmNlcykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgcmV0dXJuICdtZW51LXJlZ2lzdHJ5JztcbiAgICB9XG5cbiAgICAvLyAxLiBcdTcyRUNcdTdBQ0JcdTU5MjdcdTVFOTNcdUZGMUFFQ2hhcnRzXHVGRjA4XHU3RUFGIGVjaGFydHMgXHU1NDhDIHpyZW5kZXJcdUZGMENcdTRFMERcdTUzMDVcdTU0MkIgdnVlLWVjaGFydHNcdUZGMDlcbiAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9lY2hhcnRzJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy96cmVuZGVyJykpIHtcbiAgICAgIC8vIExheW91dC1BcHBcdUZGMUFcdTZCNjNcdTVFMzhcdTYyNTNcdTUzMDVcbiAgICAgIC8vIFx1NTE3Nlx1NEVENlx1NUU5NFx1NzUyOFx1RkYxQVx1NTk4Mlx1Njc5Q1x1NEY3Rlx1NzUyOCBlY2hhcnRzXHVGRjBDXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU0RTBEXHU2MjUzXHU1MzA1XHVGRjA4XHU0RUNFIGxheW91dC1hcHAgXHU1MkEwXHU4RjdEXHVGRjA5XHVGRjBDXHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU2QjYzXHU1RTM4XHU2MjUzXHU1MzA1XG4gICAgICBpZiAoc2tpcFNoYXJlZFJlc291cmNlcyAmJiBhcHBVc2FnZS5lY2hhcnRzKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICAvLyBcdTU5ODJcdTY3OUNcdTVFOTRcdTc1MjhcdTRFMERcdTRGN0ZcdTc1MjggZWNoYXJ0c1x1RkYwQ1x1NEUwRFx1NjI1M1x1NTMwNVxuICAgICAgaWYgKCFhcHBVc2FnZS5lY2hhcnRzKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ2VjaGFydHMtdmVuZG9yJztcbiAgICB9XG5cbiAgICAvLyAyLiBcdTUxNzZcdTRFRDZcdTcyRUNcdTdBQ0JcdTU5MjdcdTVFOTNcdUZGMDhcdTVCOENcdTUxNjhcdTcyRUNcdTdBQ0JcdUZGMDktIFx1Njc2MVx1NEVGNlx1NjI1M1x1NTMwNVxuICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL21vbmFjby1lZGl0b3InKSkge1xuICAgICAgLy8gXHU1M0VBXHU2NzA5XHU0RjdGXHU3NTI4XHU3Njg0XHU1RTk0XHU3NTI4XHU2MjREXHU2MjUzXHU1MzA1XG4gICAgICBpZiAoIWFwcFVzYWdlLm1vbmFjbykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgcmV0dXJuICdsaWItbW9uYWNvJztcbiAgICB9XG4gICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvdGhyZWUnKSkge1xuICAgICAgLy8gXHU1M0VBXHU2NzA5XHU0RjdGXHU3NTI4XHU3Njg0XHU1RTk0XHU3NTI4XHU2MjREXHU2MjUzXHU1MzA1XG4gICAgICBpZiAoIWFwcFVzYWdlLnRocmVlKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ2xpYi10aHJlZSc7XG4gICAgfVxuXG4gICAgLy8gMy4gVnVlIFx1NzUxRlx1NjAwMVx1NUU5MyArIFx1NjI0MFx1NjcwOVx1NEY5RFx1OEQ1NiBWdWUgXHU3Njg0XHU3QjJDXHU0RTA5XHU2NUI5XHU1RTkzICsgXHU1MTcxXHU0RUFCXHU3RUM0XHU0RUY2XHU1RTkzXG4gICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvdnVlJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy92dWUtcm91dGVyJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9lbGVtZW50LXBsdXMnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3BpbmlhJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AdnVldXNlJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AZWxlbWVudC1wbHVzJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy92dWUtZWNoYXJ0cycpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZGF5anMnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2xvZGFzaCcpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQHZ1ZScpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdwYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cycpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdwYWNrYWdlcy9zaGFyZWQtY29yZScpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdwYWNrYWdlcy9zaGFyZWQtdXRpbHMnKSkge1xuICAgICAgLy8gTGF5b3V0LUFwcFx1RkYxQVx1NkI2M1x1NUUzOFx1NjI1M1x1NTMwNVx1NTIzMCB2ZW5kb3JcbiAgICAgIC8vIFx1NTE3Nlx1NEVENlx1NUU5NFx1NzUyOFx1RkYwOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1RkYwOVx1RkYxQVx1NEUwRFx1NjI1M1x1NTMwNVx1RkYwQ1x1NEVDRSBsYXlvdXQtYXBwIFx1NTJBMFx1OEY3RFxuICAgICAgaWYgKHNraXBTaGFyZWRSZXNvdXJjZXMpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAndmVuZG9yJztcbiAgICB9XG5cbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc4NkVcdTRGREQgdml0ZS1wbHVnaW4gXHU3NkY4XHU1MTczXHU0RUUzXHU3ODAxXHU0RTVGXHU4OEFCXHU2MjUzXHU1MzA1XHU1MjMwIHZlbmRvclxuICAgIGlmIChpZC5pbmNsdWRlcygncGFja2FnZXMvdml0ZS1wbHVnaW4nKSB8fCBpZC5pbmNsdWRlcygnQGJ0Yy92aXRlLXBsdWdpbicpKSB7XG4gICAgICByZXR1cm4gJ3ZlbmRvcic7XG4gICAgfVxuXG4gICAgLy8gNC4gXHU2MjQwXHU2NzA5XHU1MTc2XHU0RUQ2XHU0RTFBXHU1MkExXHU0RUUzXHU3ODAxXHU1NDA4XHU1RTc2XHU1MjMwXHU0RTNCXHU2NTg3XHU0RUY2XG4gICAgcmV0dXJuIHVuZGVmaW5lZDsgLy8gXHU4RkQ0XHU1NkRFIHVuZGVmaW5lZCBcdTg4NjhcdTc5M0FcdTU0MDhcdTVFNzZcdTUyMzBcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcbiAgfTtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXHJvbGx1cC1jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvcm9sbHVwLWNvbmZpZy50c1wiOy8qKlxuICogUm9sbHVwIFx1OTE0RFx1N0Y2RVx1NkEyMVx1NTc1N1xuICogXHU2M0QwXHU0RjlCXHU1MTZDXHU1MTcxXHU3Njg0IFJvbGx1cCBcdTkxNERcdTdGNkVcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFJvbGx1cE9wdGlvbnMsIFdhcm5pbmdIYW5kbGVyV2l0aERlZmF1bHQsIE91dHB1dEFzc2V0LCBXYXJuaW5nIH0gZnJvbSAncm9sbHVwJztcbmltcG9ydCB7IGNyZWF0ZU1hbnVhbENodW5rc1N0cmF0ZWd5IH0gZnJvbSAnLi9tYW51YWwtY2h1bmtzJztcblxuZXhwb3J0IGludGVyZmFjZSBSb2xsdXBDb25maWdPcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1OEQ0NFx1NkU5MFx1NjU4N1x1NEVGNlx1NzZFRVx1NUY1NVx1RkYwOFx1OUVEOFx1OEJBNDogJ2Fzc2V0cydcdUZGMDlcbiAgICovXG4gIGFzc2V0RGlyPzogc3RyaW5nO1xuICAvKipcbiAgICogY2h1bmsgXHU2NTg3XHU0RUY2XHU3NkVFXHU1RjU1XHVGRjA4XHU5RUQ4XHU4QkE0OiBcdTRFMEUgYXNzZXREaXIgXHU3NkY4XHU1NDBDXHVGRjA5XG4gICAqL1xuICBjaHVua0Rpcj86IHN0cmluZztcbiAgLyoqXG4gICAqIFx1NjYyRlx1NTQyNlx1NUMwNiBzaW5nbGUtc3BhIFx1NTQ4QyBxaWFua3VuIFx1NjgwN1x1OEJCMFx1NEUzQVx1NTkxNlx1OTBFOFx1NUU5M1x1RkYwOFx1OUVEOFx1OEJBNDogdHJ1ZVx1RkYwOVxuICAgKiBcdTRFM0JcdTVFOTRcdTc1MjhcdUZGMDhsYXlvdXQtYXBwXHVGRjA5XHU1RTk0XHU4QkU1XHU4QkJFXHU3RjZFXHU0RTNBIGZhbHNlXHVGRjBDXHU0RUU1XHU0RkJGXHU2MjUzXHU1MzA1XHU4RkQ5XHU0RTlCXHU1RTkzXG4gICAqIFx1NUI1MFx1NUU5NFx1NzUyOFx1NUU5NFx1OEJFNVx1OEJCRVx1N0Y2RVx1NEUzQSB0cnVlXHVGRjBDXHU5MDdGXHU1MTREXHU5MUNEXHU1OTBEXHU2MjUzXHU1MzA1XG4gICAqL1xuICBleHRlcm5hbFNpbmdsZVNwYT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdTVDMDYgQGJ0YyBcdTUzMDVcdTY4MDdcdThCQjBcdTRFM0FcdTU5MTZcdTkwRThcdTVFOTNcdUZGMDhcdTlFRDhcdThCQTQ6IGZhbHNlXHVGRjA5XG4gICAqIFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NjI1M1x1NTMwNVx1OEZEOVx1NEU5Qlx1NUU5M1x1RkYwQ1x1OTA3Rlx1NTE0RFx1OEZEMFx1ODg0Q1x1NjVGNlx1NkEyMVx1NTc1N1x1ODlFM1x1Njc5MFx1OTVFRVx1OTg5OFxuICAgKi9cbiAgZXh0ZXJuYWxCdGNQYWNrYWdlcz86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdTVDMDYgQGNvbmZpZ3MgXHU1MzA1XHU2ODA3XHU4QkIwXHU0RTNBXHU1OTE2XHU5MEU4XHU1RTkzXHVGRjA4XHU5RUQ4XHU4QkE0OiB0cnVlXHVGRjA5XG4gICAqIFx1NEUzQlx1NUU5NFx1NzUyOFx1RkYwOG1haW4tYXBwXHVGRjA5XHU1RTk0XHU4QkU1XHU4QkJFXHU3RjZFXHU0RTNBIGZhbHNlXHVGRjBDXHU0RUU1XHU0RkJGXHU2MjUzXHU1MzA1XHU4RkQ5XHU0RTlCXHU1RTkzXG4gICAqIFx1NUI1MFx1NUU5NFx1NzUyOFx1NUU5NFx1OEJFNVx1OEJCRVx1N0Y2RVx1NEUzQSB0cnVlXHVGRjBDXHU0RUNFIGxheW91dC1hcHAgXHU1MkEwXHU4RjdEXHU1MTcxXHU0RUFCXHU4RDQ0XHU2RTkwXG4gICAqL1xuICBleHRlcm5hbENvbmZpZ3NQYWNrYWdlcz86IGJvb2xlYW47XG59XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBIFJvbGx1cCBcdTkxNERcdTdGNkVcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFxuICogQHBhcmFtIG9wdGlvbnMgXHU5MTREXHU3RjZFXHU5MDA5XHU5ODc5XG4gKiBAcmV0dXJucyBSb2xsdXAgXHU5MTREXHU3RjZFXHU1QkY5XHU4QzYxXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSb2xsdXBDb25maWcoYXBwTmFtZTogc3RyaW5nLCBvcHRpb25zPzogUm9sbHVwQ29uZmlnT3B0aW9ucyk6IFJvbGx1cE9wdGlvbnMge1xuICBjb25zdCBtYW51YWxDaHVua3MgPSBjcmVhdGVNYW51YWxDaHVua3NTdHJhdGVneShhcHBOYW1lKTtcbiAgY29uc3QgYXNzZXREaXIgPSBvcHRpb25zPy5hc3NldERpciB8fCAnYXNzZXRzJztcbiAgY29uc3QgY2h1bmtEaXIgPSBvcHRpb25zPy5jaHVua0RpciB8fCBhc3NldERpcjtcbiAgLy8gXHU5RUQ4XHU4QkE0XHU1QzA2IHNpbmdsZS1zcGEgXHU1NDhDIHFpYW5rdW4gXHU2ODA3XHU4QkIwXHU0RTNBIGV4dGVybmFsXHVGRjA4XHU1QjUwXHU1RTk0XHU3NTI4XHVGRjA5XG4gIC8vIFx1NEUzQlx1NUU5NFx1NzUyOFx1RkYwOGxheW91dC1hcHBcdUZGMDlcdTk3MDBcdTg5ODFcdTY2M0VcdTVGMEZcdThCQkVcdTdGNkUgZXh0ZXJuYWxTaW5nbGVTcGE6IGZhbHNlXG4gIC8vIEB0cy1pZ25vcmU6IFx1NTNFRlx1ODBGRFx1NTcyOFx1NjcyQVx1Njc2NVx1NEY3Rlx1NzUyOFxuICBjb25zdCBfZXh0ZXJuYWxTaW5nbGVTcGEgPSBvcHRpb25zPy5leHRlcm5hbFNpbmdsZVNwYSAhPT0gZmFsc2U7XG4gIC8vIFx1OUVEOFx1OEJBNFx1NUMwNiBAYnRjIFx1NTMwNVx1NjI1M1x1NTMwNVx1NTIzMFx1NUU5NFx1NzUyOFx1NEUyRFx1RkYwOFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NjI1M1x1NTMwNVx1RkYwQ1x1OTA3Rlx1NTE0RFx1OEZEMFx1ODg0Q1x1NjVGNlx1NkEyMVx1NTc1N1x1ODlFM1x1Njc5MFx1OTVFRVx1OTg5OFx1RkYwOVxuICAvLyBcdTU5ODJcdTY3OUNcdThCQkVcdTdGNkVcdTRFM0EgdHJ1ZVx1RkYwQ1x1NTIxOVx1NjgwN1x1OEJCMFx1NEUzQSBleHRlcm5hbFx1RkYwOFx1NEUwRFx1NjNBOFx1ODM1MFx1RkYwOVxuICBjb25zdCBleHRlcm5hbEJ0Y1BhY2thZ2VzID0gb3B0aW9ucz8uZXh0ZXJuYWxCdGNQYWNrYWdlcyA9PT0gdHJ1ZTtcbiAgLy8gXHU5RUQ4XHU4QkE0XHU1QzA2IEBjb25maWdzIFx1NTMwNVx1NjgwN1x1OEJCMFx1NEUzQSBleHRlcm5hbFx1RkYwOFx1NUI1MFx1NUU5NFx1NzUyOFx1NEVDRSBsYXlvdXQtYXBwIFx1NTJBMFx1OEY3RFx1RkYwOVxuICAvLyBcdTRFM0JcdTVFOTRcdTc1MjhcdUZGMDhtYWluLWFwcFx1RkYwOVx1OTcwMFx1ODk4MVx1NjYzRVx1NUYwRlx1OEJCRVx1N0Y2RSBleHRlcm5hbENvbmZpZ3NQYWNrYWdlczogZmFsc2VcdUZGMENcdTRFRTVcdTRGQkZcdTYyNTNcdTUzMDVcdThGRDlcdTRFOUJcdTVFOTNcbiAgY29uc3QgZXh0ZXJuYWxDb25maWdzUGFja2FnZXMgPSBvcHRpb25zPy5leHRlcm5hbENvbmZpZ3NQYWNrYWdlcyAhPT0gZmFsc2U7XG5cbiAgLy8gXHU2Nzg0XHU1RUZBIGV4dGVybmFsIFx1NjU3MFx1N0VDNFxuICAvLyBSb2xsdXAgXHU3Njg0IGV4dGVybmFsIFx1NjUyRlx1NjMwMVx1NUI1N1x1N0IyNlx1NEUzMlx1MzAwMVx1NkI2M1x1NTIxOVx1ODg2OFx1OEZCRVx1NUYwRlx1NjIxNlx1NTFGRFx1NjU3MFxuICBjb25zdCBleHRlcm5hbDogKHN0cmluZyB8IFJlZ0V4cCB8ICgoaWQ6IHN0cmluZykgPT4gYm9vbGVhbikpW10gPSBbXG4gICAgLy8gdml0ZS1wbHVnaW4gXHU2NjJGXHU2Nzg0XHU1RUZBXHU2NUY2XHU2M0QyXHU0RUY2XHVGRjBDXHU0RTBEXHU1RTk0XHU4QkU1XHU4OEFCXHU2MjUzXHU1MzA1XHU1MjMwXHU4RkQwXHU4ODRDXHU2NUY2XHU0RUUzXHU3ODAxXHU0RTJEXG4gICAgJ0BidGMvdml0ZS1wbHVnaW4nLFxuICAgIC9eQGJ0Y1xcL3ZpdGUtcGx1Z2luLyxcbiAgICAvLyBAYnRjIFx1NTMwNVx1RkYxQVx1NjgzOVx1NjM2RVx1OTE0RFx1N0Y2RVx1NTFCM1x1NUI5QVx1NjYyRlx1NTQyNlx1NjgwN1x1OEJCMFx1NEUzQSBleHRlcm5hbFxuICAgIC8vIFx1OUVEOFx1OEJBNFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NjI1M1x1NTMwNVx1OEZEOVx1NEU5Qlx1NUU5M1x1RkYwQ1x1OTA3Rlx1NTE0RFx1OEZEMFx1ODg0Q1x1NjVGNlx1NkEyMVx1NTc1N1x1ODlFM1x1Njc5MFx1OTVFRVx1OTg5OFxuICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQUNTUyBcdTY1ODdcdTRFRjZcdTRFMERcdTVFOTRcdThCRTVcdTg4QUJcdTY4MDdcdThCQjBcdTRFM0EgZXh0ZXJuYWxcdUZGMENcdTVFOTRcdThCRTVcdTg4QUIgVml0ZSBcdTU5MDRcdTc0MDZcdTVFNzZcdTYyNTNcdTUzMDVcbiAgICAuLi4oZXh0ZXJuYWxCdGNQYWNrYWdlcyA/IFtcbiAgICAgICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJyxcbiAgICAgIC8vIFx1NTMzOVx1OTE0RCBKYXZhU2NyaXB0L1R5cGVTY3JpcHQgXHU2QTIxXHU1NzU3XHVGRjBDXHU0RjQ2XHU0RTBEXHU1MzM5XHU5MTREIENTUyBcdTY1ODdcdTRFRjZcbiAgICAgIChpZDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChpZC5zdGFydHNXaXRoKCdAYnRjL3NoYXJlZC1jb21wb25lbnRzLycpKSB7XG4gICAgICAgICAgLy8gXHU2MzkyXHU5NjY0IENTUyBcdTY1ODdcdTRFRjZcdUZGMDguY3NzLCAuc2NzcywgLnNhc3MsIC5sZXNzIFx1N0I0OVx1RkYwOVxuICAgICAgICAgIHJldHVybiAhL1xcLihjc3N8c2Nzc3xzYXNzfGxlc3N8c3R5bCkkL2kudGVzdChpZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSxcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlJyxcbiAgICAgIC8vIFx1NTMzOVx1OTE0RCBKYXZhU2NyaXB0L1R5cGVTY3JpcHQgXHU2QTIxXHU1NzU3XHVGRjBDXHU0RjQ2XHU0RTBEXHU1MzM5XHU5MTREIENTUyBcdTY1ODdcdTRFRjZcbiAgICAgIChpZDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChpZC5zdGFydHNXaXRoKCdAYnRjL3NoYXJlZC1jb3JlLycpKSB7XG4gICAgICAgICAgcmV0dXJuICEvXFwuKGNzc3xzY3NzfHNhc3N8bGVzc3xzdHlsKSQvaS50ZXN0KGlkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgJ0BidGMvc2hhcmVkLXV0aWxzJyxcbiAgICAgIC8vIFx1NTMzOVx1OTE0RCBKYXZhU2NyaXB0L1R5cGVTY3JpcHQgXHU2QTIxXHU1NzU3XHVGRjBDXHU0RjQ2XHU0RTBEXHU1MzM5XHU5MTREIENTUyBcdTY1ODdcdTRFRjZcbiAgICAgIChpZDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChpZC5zdGFydHNXaXRoKCdAYnRjL3NoYXJlZC11dGlscy8nKSkge1xuICAgICAgICAgIHJldHVybiAhL1xcLihjc3N8c2Nzc3xzYXNzfGxlc3N8c3R5bCkkL2kudGVzdChpZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSxcbiAgICBdIDogW10pLFxuICAgIC8vIEBidGMvc2hhcmVkLWNvcmUvY29uZmlncyBcdTUzMDVcdUZGMUFcdTY4MzlcdTYzNkVcdTkxNERcdTdGNkVcdTUxQjNcdTVCOUFcdTY2MkZcdTU0MjZcdTY4MDdcdThCQjBcdTRFM0EgZXh0ZXJuYWxcbiAgICAvLyBcdTRFM0JcdTVFOTRcdTc1MjhcdUZGMDhtYWluLWFwcFx1RkYwOVx1NUU5NFx1OEJFNVx1NjI1M1x1NTMwNVx1OEZEOVx1NEU5Qlx1NUU5M1x1RkYwQ1x1NUI1MFx1NUU5NFx1NzUyOFx1NEVDRSBsYXlvdXQtYXBwIFx1NTJBMFx1OEY3RFxuICAgIC4uLihleHRlcm5hbENvbmZpZ3NQYWNrYWdlcyA/IFtcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MvbGF5b3V0LWJyaWRnZScsXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29yZS9jb25maWdzL3VuaWZpZWQtZW52LWNvbmZpZycsXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29yZS9jb25maWdzL2FwcC1zY2FubmVyJyxcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MvYXBwLWVudi5jb25maWcnLFxuICAgICAgL15AYnRjXFwvc2hhcmVkLWNvcmVcXC9jb25maWdzXFwvLiovLFxuICAgIF0gOiBbXSksXG4gIF07XG5cbiAgcmV0dXJuIHtcbiAgICBwcmVzZXJ2ZUVudHJ5U2lnbmF0dXJlczogJ3N0cmljdCcsXG4gICAgb253YXJuKHdhcm5pbmc6IFdhcm5pbmcsIHdhcm46IFdhcm5pbmdIYW5kbGVyV2l0aERlZmF1bHQpIHtcbiAgICAgIC8vIFx1OEZDN1x1NkVFNFx1NURGMlx1NzdFNVx1OEI2Nlx1NTQ0QVxuICAgICAgaWYgKHdhcm5pbmcuY29kZSA9PT0gJ01PRFVMRV9MRVZFTF9ESVJFQ1RJVkUnIHx8XG4gICAgICAgICAgKHdhcm5pbmcubWVzc2FnZSAmJiB0eXBlb2Ygd2FybmluZy5tZXNzYWdlID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICB3YXJuaW5nLm1lc3NhZ2UuaW5jbHVkZXMoJ2R5bmFtaWNhbGx5IGltcG9ydGVkJykgJiZcbiAgICAgICAgICAgd2FybmluZy5tZXNzYWdlLmluY2x1ZGVzKCdzdGF0aWNhbGx5IGltcG9ydGVkJykpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh3YXJuaW5nLm1lc3NhZ2UgJiYgdHlwZW9mIHdhcm5pbmcubWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgd2FybmluZy5tZXNzYWdlLmluY2x1ZGVzKCdHZW5lcmF0ZWQgYW4gZW1wdHkgY2h1bmsnKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTRFMERcdTUxOERcdThGQzdcdTZFRTQgQGJ0YyBcdTUzMDVcdTc2ODRcdThCNjZcdTU0NEFcdUZGMENcdTU2RTBcdTRFM0FcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTYyNTNcdTUzMDVcdThGRDlcdTRFOUJcdTUzMDVcdUZGMENcdTRFMERcdTVFOTRcdThCRTVcdTY3MDkgdW5yZXNvbHZlZCBpbXBvcnQgXHU4QjY2XHU1NDRBXG4gICAgICB3YXJuKHdhcm5pbmcpO1xuICAgIH0sXG4gICAgb3V0cHV0OiB7XG4gICAgICBmb3JtYXQ6ICdlc20nLFxuICAgICAgaW5saW5lRHluYW1pY0ltcG9ydHM6IGZhbHNlLFxuICAgICAgbWFudWFsQ2h1bmtzLFxuICAgICAgcHJlc2VydmVNb2R1bGVzOiBmYWxzZSxcbiAgICAgIGdlbmVyYXRlZENvZGU6IHtcbiAgICAgICAgY29uc3RCaW5kaW5nczogZmFsc2UsIC8vIFx1NEUwRFx1NEY3Rlx1NzUyOCBjb25zdFx1RkYwQ1x1OTA3Rlx1NTE0RCBURFogXHU5NUVFXHU5ODk4XG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZERFx1NzU1OVx1NUJGQ1x1NTFGQVx1NTQwRFx1NzlGMFx1RkYwQ1x1OTA3Rlx1NTE0RFx1ODhBQlx1NTM4Qlx1N0YyOVx1NjIxMFx1NTM1NVx1NUI1N1x1NkJDRFxuICAgICAgICAvLyBcdThGRDlcdTUzRUZcdTRFRTVcdTk2MzJcdTZCNjIgXCJkb2VzIG5vdCBwcm92aWRlIGFuIGV4cG9ydCBuYW1lZCAnYydcIiBcdTk1MTlcdThCRUZcbiAgICAgICAgcHJlc2VydmVNb2R1bGVzUm9vdDogdW5kZWZpbmVkLFxuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc4NkVcdTRGRERcdTVCRjlcdThDNjFcdTVDNUVcdTYwMjdcdTRFNEJcdTk1RjRcdTY3MDlcdTZCNjNcdTc4NkVcdTc2ODRcdTUyMDZcdTk2OTRcdTdCMjZcdUZGMENcdTkwN0ZcdTUxNERcdTVCNTdcdTdCMjZcdTRFMzJcdTU0OENcdTY1NzBcdTVCNTdcdThGREVcdTYzQTVcbiAgICAgICAgb2JqZWN0U2hvcnRoYW5kOiBmYWxzZSwgLy8gXHU3OTgxXHU3NTI4XHU1QkY5XHU4QzYxXHU3QjgwXHU1MTk5XHVGRjBDXHU3ODZFXHU0RkREXHU1QzVFXHU2MDI3XHU1NDBEXHU1NDhDXHU1MDNDXHU5MEZEXHU1QjhDXHU2NTc0XG4gICAgICAgIGFycm93RnVuY3Rpb25zOiBmYWxzZSwgLy8gXHU3OTgxXHU3NTI4XHU3QkFEXHU1OTM0XHU1MUZEXHU2NTcwXHVGRjBDXHU0RjdGXHU3NTI4XHU2NjZFXHU5MDFBXHU1MUZEXHU2NTcwXHVGRjBDXHU2NkY0XHU1Qjg5XHU1MTY4XG4gICAgICB9LFxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3ODZFXHU0RkREXHU1QkZDXHU1MUZBXHU1NDBEXHU3OUYwXHU0RTBEXHU4OEFCXHU1MzhCXHU3RjI5XG4gICAgICAvLyBcdTg2N0RcdTcxMzYgdGVyc2VyIFx1NzY4NCBtYW5nbGUgXHU1REYyXHU3OTgxXHU3NTI4XHVGRjBDXHU0RjQ2IFJvbGx1cCBcdTc2ODRcdTRFRTNcdTc4MDFcdTc1MUZcdTYyMTBcdTRFNUZcdTUzRUZcdTgwRkRcdTUzOEJcdTdGMjlcdTVCRkNcdTUxRkFcdTU0MERcdTc5RjBcbiAgICAgIGNodW5rRmlsZU5hbWVzOiBgJHtjaHVua0Rpcn0vW25hbWVdLVtoYXNoXS5qc2AsXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdTRGN0ZcdTc1MjhcdTdBMzNcdTVCOUFcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTRFMERcdTVFMjYgaGFzaFx1RkYwOVx1RkYwQ1x1OTY0RFx1NEY0RVx1OTBFOFx1N0Y3Mi9cdTdGMTNcdTVCNThcdTVCRkNcdTgxRjRcdTc2ODQgaW5kZXgteHh4LmpzIDQwNCBcdTk4Q0VcdTk2NjlcbiAgICAgIC8vIE5naW54IFx1NUJGOVx1OEJFNVx1NjU4N1x1NEVGNlx1NUU5NFx1OTE0RFx1N0Y2RSBuby1jYWNoZVx1RkYxQlx1NTE3Nlx1NEVENiBjaHVuayBcdTRFQ0RcdTRGRERcdTYzMDEgaGFzaCArIGltbXV0YWJsZVxuICAgICAgZW50cnlGaWxlTmFtZXM6IGAke2NodW5rRGlyfS9bbmFtZV0uanNgLFxuICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm86IE91dHB1dEFzc2V0KSA9PiB7XG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQWZhdmljb24uaWNvIFx1NTQ4QyBpY29ucyBcdTc2RUVcdTVGNTVcdTc2ODRcdTY1ODdcdTRFRjZcdTRFMERcdTVFOTRcdThCRTVcdTZERkJcdTUyQTAgaGFzaFx1RkYwQ1x1NUU5NFx1OEJFNVx1NEZERFx1NjMwMVx1NTcyOFx1NTM5Rlx1NEY0RFx1N0Y2RVxuICAgICAgICAvLyBcdThGRDlcdTRFOUJcdTY1ODdcdTRFRjZcdTRGMUFcdTg4QUIgcHVibGljRGlyIFx1NjIxNiBjb3B5SWNvbnNQbHVnaW4gXHU1OTBEXHU1MjM2XHU1MjMwXHU2QjYzXHU3ODZFXHU3Njg0XHU0RjREXHU3RjZFXG4gICAgICAgIGlmIChhc3NldEluZm8ubmFtZT8uaW5jbHVkZXMoJ2Zhdmljb24nKSB8fCBhc3NldEluZm8ubmFtZT8uaW5jbHVkZXMoJ2ljb25zLycpKSB7XG4gICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2NTg3XHU0RUY2XHU1NDBEXHU1MzA1XHU1NDJCIGZhdmljb24gXHU2MjE2IGljb25zXHVGRjBDXHU0RkREXHU2MzAxXHU1MzlGXHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU0RTBEXHU1NDJCIGhhc2hcdUZGMDlcbiAgICAgICAgICAvLyBcdTRGNDZcdThGRDlcdTc5Q0RcdTYwQzVcdTUxQjVcdTVFOTRcdThCRTVcdTVGODhcdTVDMTFcdUZGMENcdTU2RTBcdTRFM0EgcHVibGljRGlyIFx1NEYxQVx1NzZGNFx1NjNBNVx1NTkwRFx1NTIzNlx1OEZEOVx1NEU5Qlx1NjU4N1x1NEVGNlxuICAgICAgICAgIHJldHVybiBhc3NldEluZm8ubmFtZSB8fCBgJHthc3NldERpcn0vW25hbWVdLltleHRdYDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXNzZXRJbmZvLm5hbWU/LmVuZHNXaXRoKCcuY3NzJykpIHtcbiAgICAgICAgICByZXR1cm4gYCR7YXNzZXREaXJ9L1tuYW1lXS1baGFzaF0uY3NzYDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYCR7YXNzZXREaXJ9L1tuYW1lXS1baGFzaF0uW2V4dF1gO1xuICAgICAgfSxcbiAgICB9LFxuICAgIGV4dGVybmFsLFxuICB9O1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcY2xlYW4udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvY2xlYW4udHNcIjsvKipcbiAqIFx1NkUwNVx1NzQwNlx1Njc4NFx1NUVGQVx1NzZFRVx1NUY1NVx1NjNEMlx1NEVGNlxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbY2xlYW5dJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1tjbGVhbl0nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1tjbGVhbl0nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW2NsZWFuXScsIC4uLmFyZ3MpLFxufTtcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJtU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuXG4vKipcbiAqIFx1NUI4OVx1NTE2OFx1OEY5M1x1NTFGQVx1NjVFNVx1NUZEN1x1RkYwOFx1OTA3Rlx1NTE0RCBXaW5kb3dzIFx1NjNBN1x1NTIzNlx1NTNGMFx1N0YxNlx1NzgwMVx1OTVFRVx1OTg5OFx1RkYwOVxuICovXG5mdW5jdGlvbiBzYWZlTG9nKG1lc3NhZ2U6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnNvbGUuaW5mbyhtZXNzYWdlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBcdTU5ODJcdTY3OUNcdThGOTNcdTUxRkFcdTU5MzFcdThEMjVcdUZGMDhcdTUzRUZcdTgwRkRcdTY2MkZcdTdGMTZcdTc4MDFcdTk1RUVcdTk4OThcdUZGMDlcdUZGMENcdTRGN0ZcdTc1MjhcdTdFQUZcdTY1ODdcdTY3MkNcdThGOTNcdTUxRkFcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29udHJvbC1yZWdleFxuICAgIGNvbnNvbGUuaW5mbyhtZXNzYWdlLnJlcGxhY2UoL1teXFx4MDAtXFx4N0ZdL2csICcnKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTVCODlcdTUxNjhcdThGOTNcdTUxRkFcdThCNjZcdTU0NEFcdUZGMDhcdTkwN0ZcdTUxNEQgV2luZG93cyBcdTYzQTdcdTUyMzZcdTUzRjBcdTdGMTZcdTc4MDFcdTk1RUVcdTk4OThcdUZGMDlcbiAqL1xuZnVuY3Rpb24gc2FmZVdhcm4obWVzc2FnZTogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIFx1NTk4Mlx1Njc5Q1x1OEY5M1x1NTFGQVx1NTkzMVx1OEQyNVx1RkYwOFx1NTNFRlx1ODBGRFx1NjYyRlx1N0YxNlx1NzgwMVx1OTVFRVx1OTg5OFx1RkYwOVx1RkYwQ1x1NEY3Rlx1NzUyOFx1N0VBRlx1NjU4N1x1NjcyQ1x1OEY5M1x1NTFGQVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb250cm9sLXJlZ2V4XG4gICAgY29uc29sZS53YXJuKG1lc3NhZ2UucmVwbGFjZSgvW15cXHgwMC1cXHg3Rl0vZywgJycpKTtcbiAgfVxufVxuXG4vKipcbiAqIFx1NkUwNVx1NzQwNiBkaXN0IFx1NzZFRVx1NUY1NVx1NjNEMlx1NEVGNlxuICogXHU2REZCXHU1MkEwXHU5MUNEXHU4QkQ1XHU2NzNBXHU1MjM2XHU0RUU1XHU1OTA0XHU3NDA2IFdpbmRvd3MgXHU0RTBBXHU3Njg0XHU2NTg3XHU0RUY2XHU5NTAxXHU1QjlBXHU5NUVFXHU5ODk4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbkRpc3RQbHVnaW4oYXBwRGlyOiBzdHJpbmcpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjbGVhbi1kaXN0LXBsdWdpbicsXG4gICAgYnVpbGRTdGFydCgpIHtcbiAgICAgIGNvbnN0IGRpc3REaXIgPSByZXNvbHZlKGFwcERpciwgJ2Rpc3QnKTtcbiAgICAgIGlmIChleGlzdHNTeW5jKGRpc3REaXIpKSB7XG4gICAgICAgIHNhZmVMb2coJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHU2RTA1XHU3NDA2XHU2NUU3XHU3Njg0IGRpc3QgXHU3NkVFXHU1RjU1Li4uJyk7XG5cbiAgICAgICAgLy8gXHU2REZCXHU1MkEwXHU5MUNEXHU4QkQ1XHU2NzNBXHU1MjM2XHVGRjBDXHU1OTA0XHU3NDA2IFdpbmRvd3MgXHU0RTBBXHU3Njg0XHU2NTg3XHU0RUY2XHU5NTAxXHU1QjlBXHU5NUVFXHU5ODk4XG4gICAgICAgIGxldCByZXRyaWVzID0gNTsgLy8gXHU1ODlFXHU1MkEwXHU5MUNEXHU4QkQ1XHU2QjIxXHU2NTcwXG4gICAgICAgIGxldCBzdWNjZXNzID0gZmFsc2U7XG5cbiAgICAgICAgd2hpbGUgKHJldHJpZXMgPiAwICYmICFzdWNjZXNzKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJtU3luYyhkaXN0RGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSwgZm9yY2U6IHRydWUgfSk7XG4gICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICAgICAgICAgIHNhZmVMb2coJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHUyNzA1IGRpc3QgXHU3NkVFXHU1RjU1XHU1REYyXHU2RTA1XHU3NDA2Jyk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgcmV0cmllcy0tO1xuICAgICAgICAgICAgaWYgKGVycm9yLmNvZGUgPT09ICdFQlVTWScgfHwgZXJyb3IuY29kZSA9PT0gJ0VOT1RFTVBUWScpIHtcbiAgICAgICAgICAgICAgaWYgKHJldHJpZXMgPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgd2FpdFRpbWUgPSAoNiAtIHJldHJpZXMpICogMjAwOyAvLyBcdTkwMTJcdTU4OUVcdTdCNDlcdTVGODVcdTY1RjZcdTk1RjRcdUZGMUEyMDBtcywgNDAwbXMsIDYwMG1zLCA4MDBtcywgMTAwMG1zXG4gICAgICAgICAgICAgICAgc2FmZVdhcm4oYFtjbGVhbi1kaXN0LXBsdWdpbl0gXHUyNkEwXHVGRTBGICBcdTc2RUVcdTVGNTVcdTg4QUJcdTUzNjBcdTc1MjhcdUZGMENcdTdCNDlcdTVGODUgJHt3YWl0VGltZX1tcyBcdTU0MEVcdTkxQ0RcdThCRDUuLi4gKFx1NTI2OVx1NEY1OSAke3JldHJpZXN9IFx1NkIyMSlgKTtcbiAgICAgICAgICAgICAgICAvLyBcdTU0MENcdTZCNjVcdTdCNDlcdTVGODVcbiAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgd2hpbGUgKERhdGUubm93KCkgLSBzdGFydCA8IHdhaXRUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAvLyBcdTVGRDlcdTdCNDlcdTVGODVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2FmZVdhcm4oJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHUyNzRDIFx1NjVFMFx1NkNENVx1NkUwNVx1NzQwNiBkaXN0IFx1NzZFRVx1NUY1NVx1RkYwOFx1NTNFRlx1ODBGRFx1ODhBQlx1NTE3Nlx1NEVENlx1N0EwQlx1NUU4Rlx1NTM2MFx1NzUyOFx1RkYwOScpO1xuICAgICAgICAgICAgICAgIHNhZmVXYXJuKCdbY2xlYW4tZGlzdC1wbHVnaW5dIFx1NjNEMFx1NzkzQVx1RkYxQVx1OEJGN1x1NTE3M1x1OTVFRFx1NTNFRlx1ODBGRFx1NTM2MFx1NzUyOFx1NjU4N1x1NEVGNlx1NzY4NFx1N0EwQlx1NUU4Rlx1RkYwOFx1NTk4Mlx1NjU4N1x1NEVGNlx1OEQ0NFx1NkU5MFx1N0JBMVx1NzQwNlx1NTY2OFx1MzAwMVx1N0YxNlx1OEY5MVx1NTY2OFx1N0I0OVx1RkYwOScpO1xuICAgICAgICAgICAgICAgIHNhZmVXYXJuKCdbY2xlYW4tZGlzdC1wbHVnaW5dIFx1NjIxNlx1ODAwNVx1NjI0Qlx1NTJBOFx1NTIyMFx1OTY2NCBkaXN0IFx1NzZFRVx1NUY1NVx1NTQwRVx1OTFDRFx1NjVCMFx1Njc4NFx1NUVGQScpO1xuICAgICAgICAgICAgICAgIHNhZmVXYXJuKCdbY2xlYW4tZGlzdC1wbHVnaW5dIFx1Njc4NFx1NUVGQVx1NUMwNlx1N0VFN1x1N0VFRFx1RkYwQ1x1NEY0Nlx1NjVFN1x1NzY4NFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NEUwRFx1NEYxQVx1ODhBQlx1NkUwNVx1NzQwNlx1RkYwQ1x1NTNFRlx1ODBGRFx1NUJGQ1x1ODFGNFx1OTFDRFx1NTkwRFx1NjU4N1x1NEVGNicpO1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlOyAvLyBcdTdFRTdcdTdFRURcdTY3ODRcdTVFRkFcdUZGMENcdTRFMERcdTk2M0JcdTU4NUVcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5jb2RlID09PSAnRU5PRU5UJykge1xuICAgICAgICAgICAgICAvLyBcdTc2RUVcdTVGNTVcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTRFMERcdTk3MDBcdTg5ODFcdTZFMDVcdTc0MDZcbiAgICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBcdTUxNzZcdTRFRDZcdTk1MTlcdThCRUZcdUZGMENcdTc2RjRcdTYzQTVcdTYyOUJcdTUxRkFcbiAgICAgICAgICAgICAgc2FmZVdhcm4oJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHU2RTA1XHU3NDA2IGRpc3QgXHU3NkVFXHU1RjU1XHU1OTMxXHU4RDI1OiAnICsgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgIHNhZmVXYXJuKCdbY2xlYW4tZGlzdC1wbHVnaW5dIFx1Njc4NFx1NUVGQVx1NUMwNlx1N0VFN1x1N0VFRFx1RkYwQ1x1NEY0Nlx1NjVFN1x1NzY4NFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NEUwRFx1NEYxQVx1ODhBQlx1NkUwNVx1NzQwNicpO1xuICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTsgLy8gXHU3RUU3XHU3RUVEXHU2Nzg0XHU1RUZBXHVGRjBDXHU0RTBEXHU5NjNCXHU1ODVFXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzYWZlTG9nKCdbY2xlYW4tZGlzdC1wbHVnaW5dIGRpc3QgXHU3NkVFXHU1RjU1XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU2NUUwXHU5NzAwXHU2RTA1XHU3NDA2Jyk7XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxjaHVuay50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9jaHVuay50c1wiOy8qKlxuICogQ2h1bmsgXHU3NkY4XHU1MTczXHU2M0QyXHU0RUY2XG4gKiBcdTUzMDVcdTYyRUMgY2h1bmsgXHU5QThDXHU4QkMxXHU1NDhDXHU0RjE4XHU1MzE2XG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1tjaHVua10nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW2NodW5rXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW2NodW5rXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbY2h1bmtdJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHR5cGUgeyBPdXRwdXRPcHRpb25zLCBPdXRwdXRCdW5kbGUgfSBmcm9tICdyb2xsdXAnO1xuXG4vKipcbiAqIFx1OUE4Q1x1OEJDMVx1NjI0MFx1NjcwOSBjaHVuayBcdTc1MUZcdTYyMTBcdTYzRDJcdTRFRjZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNodW5rVmVyaWZ5UGx1Z2luKCk6IFBsdWdpbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2NodW5rLXZlcmlmeS1wbHVnaW4nLFxuICAgIHdyaXRlQnVuZGxlKF9vcHRpb25zOiBPdXRwdXRPcHRpb25zLCBidW5kbGU6IE91dHB1dEJ1bmRsZSkge1xuICAgICAgY29uc29sZS5pbmZvKCdcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHUyNzA1IFx1NzUxRlx1NjIxMFx1NzY4NFx1NjI0MFx1NjcwOSBjaHVuayBcdTY1ODdcdTRFRjZcdUZGMUEnKTtcbiAgICAgIGNvbnN0IGpzQ2h1bmtzID0gT2JqZWN0LmtleXMoYnVuZGxlKS5maWx0ZXIoZmlsZSA9PiBmaWxlLmVuZHNXaXRoKCcuanMnKSk7XG4gICAgICBjb25zdCBjc3NDaHVua3MgPSBPYmplY3Qua2V5cyhidW5kbGUpLmZpbHRlcihmaWxlID0+IGZpbGUuZW5kc1dpdGgoJy5jc3MnKSk7XG5cbiAgICAgIGNvbnNvbGUuaW5mbyhgXFxuSlMgY2h1bmtcdUZGMDhcdTUxNzEgJHtqc0NodW5rcy5sZW5ndGh9IFx1NEUyQVx1RkYwOVx1RkYxQWApO1xuICAgICAganNDaHVua3MuZm9yRWFjaChjaHVuayA9PiBjb25zb2xlLmluZm8oYCAgLSAke2NodW5rfWApKTtcblxuICAgICAgY29uc29sZS5pbmZvKGBcXG5DU1MgY2h1bmtcdUZGMDhcdTUxNzEgJHtjc3NDaHVua3MubGVuZ3RofSBcdTRFMkFcdUZGMDlcdUZGMUFgKTtcbiAgICAgIGNzc0NodW5rcy5mb3JFYWNoKGNodW5rID0+IGNvbnNvbGUuaW5mbyhgICAtICR7Y2h1bmt9YCkpO1xuXG4gICAgICBjb25zdCBpbmRleENodW5rID0ganNDaHVua3MuZmluZChqc0NodW5rID0+IGpzQ2h1bmsuaW5jbHVkZXMoJ2luZGV4LScpKTtcbiAgICAgIGNvbnN0IGluZGV4U2l6ZSA9IGluZGV4Q2h1bmsgPyAoYnVuZGxlW2luZGV4Q2h1bmtdIGFzIGFueSk/LmNvZGU/Lmxlbmd0aCB8fCAwIDogMDtcbiAgICAgIGNvbnN0IGluZGV4U2l6ZUtCID0gaW5kZXhTaXplIC8gMTAyNDtcbiAgICAgIGNvbnN0IGluZGV4U2l6ZU1CID0gaW5kZXhTaXplS0IgLyAxMDI0O1xuXG4gICAgICBjb25zdCBtaXNzaW5nUmVxdWlyZWRDaHVua3M6IHN0cmluZ1tdID0gW107XG4gICAgICBpZiAoIWluZGV4Q2h1bmspIHtcbiAgICAgICAgbWlzc2luZ1JlcXVpcmVkQ2h1bmtzLnB1c2goJ2luZGV4Jyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGhhc0Vwc1NlcnZpY2UgPSBqc0NodW5rcy5zb21lKGpzQ2h1bmsgPT4ganNDaHVuay5pbmNsdWRlcygnZXBzLXNlcnZpY2UnKSk7XG4gICAgICBjb25zdCBoYXNBdXRoQXBpID0ganNDaHVua3Muc29tZShqc0NodW5rID0+IGpzQ2h1bmsuaW5jbHVkZXMoJ2F1dGgtYXBpJykpO1xuICAgICAgY29uc3QgaGFzRWNoYXJ0c1ZlbmRvciA9IGpzQ2h1bmtzLnNvbWUoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKCdlY2hhcnRzLXZlbmRvcicpKTtcbiAgICAgIGNvbnN0IGhhc0xpYk1vbmFjbyA9IGpzQ2h1bmtzLnNvbWUoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKCdsaWItbW9uYWNvJykpO1xuICAgICAgY29uc3QgaGFzTGliVGhyZWUgPSBqc0NodW5rcy5zb21lKGpzQ2h1bmsgPT4ganNDaHVuay5pbmNsdWRlcygnbGliLXRocmVlJykpO1xuXG4gICAgICBjb25zb2xlLmluZm8oYFxcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdUQ4M0RcdURDRTYgXHU2Nzg0XHU1RUZBXHU2MEM1XHU1MUI1XHVGRjA4XHU1RTczXHU4ODYxXHU2MkM2XHU1MjA2XHU3QjU2XHU3NTY1XHVGRjA5XHVGRjFBYCk7XG4gICAgICBpZiAoaW5kZXhDaHVuaykge1xuICAgICAgICBjb25zb2xlLmluZm8oYCAgXHUyNzA1IGluZGV4OiBcdTRFM0JcdTY1ODdcdTRFRjZcdUZGMDhWdWVcdTc1MUZcdTYwMDEgKyBFbGVtZW50IFBsdXMgKyBcdTRFMUFcdTUyQTFcdTRFRTNcdTc4MDFcdUZGMENcdTRGNTNcdTc5RUZ+JHtpbmRleFNpemVNQi50b0ZpeGVkKDIpfU1CIFx1NjcyQVx1NTM4Qlx1N0YyOVx1RkYwQ2d6aXBcdTU0MEV+JHsoaW5kZXhTaXplTUIgKiAwLjMpLnRvRml4ZWQoMil9TUJcdUZGMDlgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgICBcdTI3NEMgXHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4YCk7XG4gICAgICB9XG4gICAgICBpZiAoaGFzRXBzU2VydmljZSkgY29uc29sZS5pbmZvKGAgIFx1MjcwNSBlcHMtc2VydmljZTogRVBTIFx1NjcwRFx1NTJBMVx1RkYwOFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NTE3MVx1NEVBQlx1RkYwQ1x1NTM1NVx1NzJFQ1x1NjI1M1x1NTMwNVx1RkYwOWApO1xuICAgICAgaWYgKGhhc0F1dGhBcGkpIGNvbnNvbGUuaW5mbyhgICBcdTI3MDUgYXV0aC1hcGk6IEF1dGggQVBJXHVGRjA4XHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU1MTcxXHU0RUFCXHVGRjBDXHU1MzU1XHU3MkVDXHU2MjUzXHU1MzA1XHVGRjBDXHU3NTMxIHN5c3RlbS1hcHAgXHU2M0QwXHU0RjlCXHVGRjA5YCk7XG4gICAgICBpZiAoaGFzRWNoYXJ0c1ZlbmRvcikgY29uc29sZS5pbmZvKGAgIFx1MjcwNSBlY2hhcnRzLXZlbmRvcjogRUNoYXJ0cyArIHpyZW5kZXJcdUZGMDhcdTcyRUNcdTdBQ0JcdTU5MjdcdTVFOTNcdUZGMENcdTY1RTBcdTRGOURcdThENTZcdTk1RUVcdTk4OThcdUZGMDlgKTtcbiAgICAgIGlmIChoYXNMaWJNb25hY28pIGNvbnNvbGUuaW5mbyhgICBcdTI3MDUgbGliLW1vbmFjbzogTW9uYWNvIEVkaXRvclx1RkYwOFx1NzJFQ1x1N0FDQlx1NTkyN1x1NUU5M1x1RkYwOWApO1xuICAgICAgaWYgKGhhc0xpYlRocmVlKSBjb25zb2xlLmluZm8oYCAgXHUyNzA1IGxpYi10aHJlZTogVGhyZWUuanNcdUZGMDhcdTcyRUNcdTdBQ0JcdTU5MjdcdTVFOTNcdUZGMDlgKTtcbiAgICAgIGNvbnNvbGUuaW5mbyhgICBcdTIxMzlcdUZFMEYgIFx1NEUxQVx1NTJBMVx1NEVFM1x1NzgwMVx1NTQ4QyBWdWUgXHU3NTFGXHU2MDAxXHU1NDA4XHU1RTc2XHU1MjMwXHU0RTNCXHU2NTg3XHU0RUY2XHVGRjBDXHU5MDdGXHU1MTREXHU1MjFEXHU1OUNCXHU1MzE2XHU5ODdBXHU1RThGXHU5NUVFXHU5ODk4YCk7XG5cbiAgICAgIGlmIChtaXNzaW5nUmVxdWlyZWRDaHVua3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHUyNzRDIFx1N0YzQVx1NTkzMVx1NjgzOFx1NUZDMyBjaHVua1x1RkYxQWAsIG1pc3NpbmdSZXF1aXJlZENodW5rcyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgXHU2ODM4XHU1RkMzIGNodW5rIFx1N0YzQVx1NTkzMVx1RkYwQ1x1Njc4NFx1NUVGQVx1NTkzMVx1OEQyNVx1RkYwMWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGBcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHUyNzA1IFx1NjgzOFx1NUZDMyBjaHVuayBcdTUxNjhcdTkwRThcdTVCNThcdTU3MjhgKTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU5QThDXHU4QkMxXHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU0RTAwXHU4MUY0XHU2MDI3XG4gICAgICBjb25zb2xlLmluZm8oJ1xcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdUQ4M0RcdUREMEQgXHU5QThDXHU4QkMxXHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU0RTAwXHU4MUY0XHU2MDI3Li4uJyk7XG4gICAgICBjb25zdCBhbGxDaHVua0ZpbGVzID0gbmV3IFNldChbLi4uanNDaHVua3MsIC4uLmNzc0NodW5rc10pO1xuICAgICAgY29uc3QgcmVmZXJlbmNlZEZpbGVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpO1xuICAgICAgY29uc3QgbWlzc2luZ0ZpbGVzOiBBcnJheTx7IGZpbGU6IHN0cmluZzsgcmVmZXJlbmNlZEJ5OiBzdHJpbmdbXTsgcG9zc2libGVNYXRjaGVzOiBzdHJpbmdbXSB9PiA9IFtdO1xuXG4gICAgICBmb3IgKGNvbnN0IFtmaWxlTmFtZSwgY2h1bmtdIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmRsZSkpIHtcbiAgICAgICAgY29uc3QgY2h1bmtBbnkgPSBjaHVuayBhcyBhbnk7XG4gICAgICAgIGlmIChjaHVua0FueS50eXBlID09PSAnY2h1bmsnICYmIGNodW5rQW55LmNvZGUpIHtcbiAgICAgICAgICBjb25zdCBjb2RlV2l0aG91dENvbW1lbnRzID0gY2h1bmtBbnkuY29kZVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcL1xcLy4qJC9nbSwgJycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFwvXFwqW1xcc1xcU10qP1xcKlxcLy9nLCAnJyk7XG5cbiAgICAgICAgICBjb25zdCBpbXBvcnRQYXR0ZXJuID0gL2ltcG9ydFxccypcXChcXHMqW1wiJ10oXFwvP2Fzc2V0c1xcL1teXCInYFxcc10rXFwuKGpzfG1qc3xjc3MpKVtcIiddXFxzKlxcKS9nO1xuICAgICAgICAgIGxldCBtYXRjaDtcbiAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gaW1wb3J0UGF0dGVybi5leGVjKGNvZGVXaXRob3V0Q29tbWVudHMpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgcmVzb3VyY2VQYXRoID0gbWF0Y2hbMV07XG4gICAgICAgICAgICBpZiAoIXJlc291cmNlUGF0aCkgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCByZXNvdXJjZUZpbGUgPSByZXNvdXJjZVBhdGgucmVwbGFjZSgvXlxcLz9hc3NldHNcXC8vLCAnYXNzZXRzLycpO1xuICAgICAgICAgICAgaWYgKCFyZWZlcmVuY2VkRmlsZXMuaGFzKHJlc291cmNlRmlsZSkpIHtcbiAgICAgICAgICAgICAgcmVmZXJlbmNlZEZpbGVzLnNldChyZXNvdXJjZUZpbGUsIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlZmVyZW5jZWRGaWxlcy5nZXQocmVzb3VyY2VGaWxlKSEucHVzaChmaWxlTmFtZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgdXJsUGF0dGVybiA9IC9uZXdcXHMrVVJMXFxzKlxcKFxccypbXCInXShcXC8/YXNzZXRzXFwvW15cIidgXFxzXStcXC4oanN8bWpzfGNzcykpW1wiJ10vZztcbiAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gdXJsUGF0dGVybi5leGVjKGNvZGVXaXRob3V0Q29tbWVudHMpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgcmVzb3VyY2VQYXRoID0gbWF0Y2hbMV07XG4gICAgICAgICAgICBpZiAoIXJlc291cmNlUGF0aCkgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCByZXNvdXJjZUZpbGUgPSByZXNvdXJjZVBhdGgucmVwbGFjZSgvXlxcLz9hc3NldHNcXC8vLCAnYXNzZXRzLycpO1xuICAgICAgICAgICAgaWYgKCFyZWZlcmVuY2VkRmlsZXMuaGFzKHJlc291cmNlRmlsZSkpIHtcbiAgICAgICAgICAgICAgcmVmZXJlbmNlZEZpbGVzLnNldChyZXNvdXJjZUZpbGUsIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlZmVyZW5jZWRGaWxlcy5nZXQocmVzb3VyY2VGaWxlKSEucHVzaChmaWxlTmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgW3JlZmVyZW5jZWRGaWxlLCByZWZlcmVuY2VkQnldIG9mIHJlZmVyZW5jZWRGaWxlcy5lbnRyaWVzKCkpIHtcbiAgICAgICAgY29uc3QgZmlsZU5hbWUgPSByZWZlcmVuY2VkRmlsZS5yZXBsYWNlKC9eYXNzZXRzXFwvLywgJycpO1xuICAgICAgICBsZXQgZXhpc3RzID0gYWxsQ2h1bmtGaWxlcy5oYXMoZmlsZU5hbWUpO1xuICAgICAgICBsZXQgcG9zc2libGVNYXRjaGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgICAgY29uc3QgbWF0Y2ggPSBmaWxlTmFtZS5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPykoPzotKFthLXpBLVowLTldezgsfSkpP1xcLihqc3xtanN8Y3NzKSQvKTtcbiAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgIGNvbnN0IFssIG5hbWVQcmVmaXgsICwgZXh0XSA9IG1hdGNoO1xuICAgICAgICAgICAgcG9zc2libGVNYXRjaGVzID0gQXJyYXkuZnJvbShhbGxDaHVua0ZpbGVzKS5maWx0ZXIoY2h1bmtGaWxlID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgY2h1bmtNYXRjaCA9IGNodW5rRmlsZS5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPykoPzotKFthLXpBLVowLTldezgsfSkpP1xcLihqc3xtanN8Y3NzKSQvKTtcbiAgICAgICAgICAgICAgaWYgKGNodW5rTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBbLCBjaHVua05hbWVQcmVmaXgsICwgY2h1bmtFeHRdID0gY2h1bmtNYXRjaDtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2h1bmtOYW1lUHJlZml4ID09PSBuYW1lUHJlZml4ICYmIGNodW5rRXh0ID09PSBleHQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBleGlzdHMgPSBwb3NzaWJsZU1hdGNoZXMubGVuZ3RoID4gMDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWV4aXN0cykge1xuICAgICAgICAgIG1pc3NpbmdGaWxlcy5wdXNoKHsgZmlsZTogcmVmZXJlbmNlZEZpbGUsIHJlZmVyZW5jZWRCeSwgcG9zc2libGVNYXRjaGVzIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtaXNzaW5nRmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHUyNzRDIFx1NTNEMVx1NzNCMCAke21pc3NpbmdGaWxlcy5sZW5ndGh9IFx1NEUyQVx1NUYxNVx1NzUyOFx1NzY4NFx1OEQ0NFx1NkU5MFx1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYxQWApO1xuICAgICAgICBpZiAobWlzc2luZ0ZpbGVzLmxlbmd0aCA8PSA1KSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKGBcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHUyNkEwXHVGRTBGICBcdThCNjZcdTU0NEFcdUZGMUFcdTUzRDFcdTczQjAgJHttaXNzaW5nRmlsZXMubGVuZ3RofSBcdTRFMkFcdTVGMTVcdTc1MjhcdTc2ODRcdThENDRcdTZFOTBcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTRGNDZcdTdFRTdcdTdFRURcdTY3ODRcdTVFRkFgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1NEUwRFx1NEUwMFx1ODFGNFx1RkYwQ1x1Njc4NFx1NUVGQVx1NTkzMVx1OEQyNVx1RkYwMVx1NjcwOSAke21pc3NpbmdGaWxlcy5sZW5ndGh9IFx1NEUyQVx1NUYxNVx1NzUyOFx1NzY4NFx1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOGApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmluZm8oYFxcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTI3MDUgXHU2MjQwXHU2NzA5XHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU5MEZEXHU2QjYzXHU3ODZFXHVGRjA4XHU1MTcxXHU5QThDXHU4QkMxICR7cmVmZXJlbmNlZEZpbGVzLnNpemV9IFx1NEUyQVx1NUYxNVx1NzUyOFx1RkYwOWApO1xuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4vKipcbiAqIFx1NEYxOFx1NTMxNlx1NEVFM1x1NzgwMVx1NTIwNlx1NTI3Mlx1NjNEMlx1NEVGNlx1RkYxQVx1NTkwNFx1NzQwNlx1N0E3QSBjaHVua1xuICovXG5leHBvcnQgZnVuY3Rpb24gb3B0aW1pemVDaHVua3NQbHVnaW4oKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnb3B0aW1pemUtY2h1bmtzJyxcbiAgICBnZW5lcmF0ZUJ1bmRsZShfb3B0aW9uczogT3V0cHV0T3B0aW9ucywgYnVuZGxlOiBPdXRwdXRCdW5kbGUpIHtcbiAgICAgIGNvbnN0IGVtcHR5Q2h1bmtzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgY29uc3QgY2h1bmtSZWZlcmVuY2VzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpO1xuXG4gICAgICBmb3IgKGNvbnN0IFtmaWxlTmFtZSwgY2h1bmtdIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmRsZSkpIHtcbiAgICAgICAgY29uc3QgY2h1bmtBbnkgPSBjaHVuayBhcyBhbnk7XG4gICAgICAgIGlmIChjaHVua0FueS50eXBlID09PSAnY2h1bmsnICYmIGNodW5rQW55LmNvZGUgJiYgY2h1bmtBbnkuY29kZS50cmltKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgZW1wdHlDaHVua3MucHVzaChmaWxlTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNodW5rQW55LnR5cGUgPT09ICdjaHVuaycgJiYgY2h1bmtBbnkuaW1wb3J0cykge1xuICAgICAgICAgIGZvciAoY29uc3QgaW1wb3J0ZWQgb2YgY2h1bmtBbnkuaW1wb3J0cykge1xuICAgICAgICAgICAgaWYgKCFjaHVua1JlZmVyZW5jZXMuaGFzKGltcG9ydGVkKSkge1xuICAgICAgICAgICAgICBjaHVua1JlZmVyZW5jZXMuc2V0KGltcG9ydGVkLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaHVua1JlZmVyZW5jZXMuZ2V0KGltcG9ydGVkKSEucHVzaChmaWxlTmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChlbXB0eUNodW5rcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjaHVua3NUb1JlbW92ZTogc3RyaW5nW10gPSBbXTtcbiAgICAgIGNvbnN0IGNodW5rc1RvS2VlcDogc3RyaW5nW10gPSBbXTtcblxuICAgICAgZm9yIChjb25zdCBlbXB0eUNodW5rIG9mIGVtcHR5Q2h1bmtzKSB7XG4gICAgICAgIGNvbnN0IHJlZmVyZW5jZWRCeSA9IGNodW5rUmVmZXJlbmNlcy5nZXQoZW1wdHlDaHVuaykgfHwgW107XG4gICAgICAgIGlmIChyZWZlcmVuY2VkQnkubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGNvbnN0IGNodW5rID0gYnVuZGxlW2VtcHR5Q2h1bmtdO1xuICAgICAgICAgIGlmIChjaHVuayAmJiAoY2h1bmsgYXMgYW55KS50eXBlID09PSAnY2h1bmsnKSB7XG4gICAgICAgICAgICAoY2h1bmsgYXMgYW55KS5jb2RlID0gJ2V4cG9ydCB7fSc7XG4gICAgICAgICAgICBjaHVua3NUb0tlZXAucHVzaChlbXB0eUNodW5rKTtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW29wdGltaXplLWNodW5rc10gXHU0RkREXHU3NTU5XHU4OEFCXHU1RjE1XHU3NTI4XHU3Njg0XHU3QTdBIGNodW5rOiAke2VtcHR5Q2h1bmt9IChcdTg4QUIgJHtyZWZlcmVuY2VkQnkubGVuZ3RofSBcdTRFMkEgY2h1bmsgXHU1RjE1XHU3NTI4XHVGRjBDXHU1REYyXHU2REZCXHU1MkEwXHU1MzYwXHU0RjREXHU3QjI2KWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjaHVua3NUb1JlbW92ZS5wdXNoKGVtcHR5Q2h1bmspO1xuICAgICAgICAgIGRlbGV0ZSBidW5kbGVbZW1wdHlDaHVua107XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGNodW5rc1RvUmVtb3ZlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGBbb3B0aW1pemUtY2h1bmtzXSBcdTc5RkJcdTk2NjRcdTRFODYgJHtjaHVua3NUb1JlbW92ZS5sZW5ndGh9IFx1NEUyQVx1NjcyQVx1ODhBQlx1NUYxNVx1NzUyOFx1NzY4NFx1N0E3QSBjaHVuazpgLCBjaHVua3NUb1JlbW92ZSk7XG4gICAgICB9XG4gICAgICBpZiAoY2h1bmtzVG9LZWVwLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGBbb3B0aW1pemUtY2h1bmtzXSBcdTRGRERcdTc1NTlcdTRFODYgJHtjaHVua3NUb0tlZXAubGVuZ3RofSBcdTRFMkFcdTg4QUJcdTVGMTVcdTc1MjhcdTc2ODRcdTdBN0EgY2h1bmtcdUZGMDhcdTVERjJcdTZERkJcdTUyQTBcdTUzNjBcdTRGNERcdTdCMjZcdUZGMDk6YCwgY2h1bmtzVG9LZWVwKTtcbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXHVybC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy91cmwudHNcIjsvKipcbiAqIFVSTCBcdTc2RjhcdTUxNzNcdTYzRDJcdTRFRjZcbiAqIFx1Nzg2RVx1NEZERCBiYXNlIFVSTCBcdTZCNjNcdTc4NkVcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW3VybF0nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW3VybF0nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1t1cmxdJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1t1cmxdJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHR5cGUgeyBDaHVua0luZm8sIE91dHB1dE9wdGlvbnMsIE91dHB1dEJ1bmRsZSB9IGZyb20gJ3JvbGx1cCc7XG5pbXBvcnQgeyBleGlzdHNTeW5jLCByZWFkRmlsZVN5bmMgfSBmcm9tICdub2RlOmZzJztcbmltcG9ydCB7IHJlc29sdmUgYXMgcmVzb2x2ZVBhdGgsIGRpcm5hbWUgfSBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcblxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcbmNvbnN0IF9fZGlybmFtZSA9IGRpcm5hbWUoX19maWxlbmFtZSk7XG5cbmZ1bmN0aW9uIGdldEJ1aWxkVGltZXN0YW1wRm9yUXVlcnkoKTogc3RyaW5nIHtcbiAgLy8gXHU0RjE4XHU1MTQ4XHU0RjdGXHU3NTI4XHU1MTY4XHU5MUNGXHU2Nzg0XHU1RUZBXHU4MTFBXHU2NzJDXHU2Q0U4XHU1MTY1XHU3Njg0XHU2NUY2XHU5NUY0XHU2MjMzXHVGRjA4XHU0RTBFIGFkZFZlcnNpb25QbHVnaW4gXHU0RkREXHU2MzAxXHU0RTAwXHU4MUY0XHVGRjA5XG4gIGlmIChwcm9jZXNzLmVudi5CVENfQlVJTERfVElNRVNUQU1QKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52LkJUQ19CVUlMRF9USU1FU1RBTVA7XG4gIH1cbiAgLy8gXHU1MTc2XHU2QjIxXHU4QkZCXHU1M0Q2IC5idWlsZC10aW1lc3RhbXBcdUZGMDhcdTRFMEUgYWRkVmVyc2lvblBsdWdpbiBcdTc2ODRcdTVCOUVcdTczQjBcdTRFMDBcdTgxRjRcdUZGMDlcbiAgY29uc3QgdGltZXN0YW1wRmlsZSA9IHJlc29sdmVQYXRoKF9fZGlybmFtZSwgJy4uLy4uLy4uLy5idWlsZC10aW1lc3RhbXAnKTtcbiAgaWYgKGV4aXN0c1N5bmModGltZXN0YW1wRmlsZSkpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdHMgPSByZWFkRmlsZVN5bmModGltZXN0YW1wRmlsZSwgJ3V0Zi04JykudHJpbSgpO1xuICAgICAgaWYgKHRzKSByZXR1cm4gdHM7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBpZ25vcmVcbiAgICB9XG4gIH1cbiAgLy8gXHU2NzAwXHU1NDBFXHU1MTVDXHU1RTk1XHVGRjFBXHU3NTFGXHU2MjEwXHU0RTAwXHU0RTJBXHVGRjA4XHU0RTBEXHU1MTk5XHU1NkRFXHU2NTg3XHU0RUY2XHVGRjBDXHU5MDdGXHU1MTREXHU1MjZGXHU0RjVDXHU3NTI4XHVGRjA5XG4gIHJldHVybiBEYXRlLm5vdygpLnRvU3RyaW5nKDM2KTtcbn1cblxuLyoqXG4gKiBcdTc4NkVcdTRGREQgYmFzZSBVUkwgXHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVCYXNlVXJsUGx1Z2luKGJhc2VVcmw6IHN0cmluZywgYXBwSG9zdDogc3RyaW5nLCBhcHBQb3J0OiBudW1iZXIsIG1haW5BcHBQb3J0OiBzdHJpbmcpOiBQbHVnaW4ge1xuICBjb25zdCBpc1ByZXZpZXdCdWlsZCA9IGJhc2VVcmwuc3RhcnRzV2l0aCgnaHR0cCcpO1xuICBjb25zdCBxaWFua3VuSW5kZXhJbXBvcnRSZWdleCA9IC9pbXBvcnRcXCgoWydcIl0pXFwvYXNzZXRzXFwvKGluZGV4fG1haW4pLShbXidcIl0rKVxcMVxcKS9nO1xuICBjb25zdCBidWlsZFRpbWVzdGFtcCA9IGdldEJ1aWxkVGltZXN0YW1wRm9yUXVlcnkoKTtcbiAgY29uc3QgcWlhbmt1bkluZGV4SW1wb3J0SW5IdG1sUmVnZXggPSAvaW1wb3J0XFwoXFxzKihbJ1wiXSkoXFwvYXNzZXRzXFwvKGluZGV4fG1haW4pLVteJ1wiXSspXFwxXFxzKlxcKS9nO1xuXG4gIC8qKlxuICAgKiBcdTRGRUVcdTU5MEQgdml0ZS1wbHVnaW4tcWlhbmt1biBcdTc1MUZcdTYyMTBcdTc2ODRcdTUzMDVcdTg4QzVcdTU2NjhcdTkxQ0NcdTRGN0ZcdTc1MjhcdTdFRERcdTVCRjlcdThERUZcdTVGODQgaW1wb3J0KCcvYXNzZXRzL2luZGV4LXh4eC5qcycpIFx1NzY4NFx1OTVFRVx1OTg5OFx1RkYxQVxuICAgKiAtIFx1NTcyOCBxaWFua3VuIFx1NkM5OVx1N0JCMVx1OTFDQ1x1RkYwQ1x1OEZEOVx1NEYxQVx1NjMwOVx1MjAxQ1x1NUJCRlx1NEUzQiBvcmlnaW5cdTIwMURcdTg5RTNcdTY3OTBcdUZGMENcdTVCRkNcdTgxRjRcdTVCNTBcdTVFOTRcdTc1MjhcdTUxNjVcdTUzRTMgY2h1bmsgXHU4OEFCXHU5NTE5XHU4QkVGXHU4QkY3XHU2QzQyXHU1MjMwIGxheW91dCBcdTU3REZcdTU0MERcbiAgICogLSBcdThGRDlcdTkxQ0NcdTY1MzlcdTRFM0FcdUZGMUFcdTRGMThcdTUxNDhcdTRGN0ZcdTc1MjggcWlhbmt1biBcdTZDRThcdTUxNjVcdTc2ODQgX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX19cdUZGMDhcdTkwMUFcdTVFMzhcdTRFM0FcdTVCNTBcdTVFOTRcdTc1Mjggb3JpZ2luXHVGRjA5XHVGRjBDXHU1NDI2XHU1MjE5XHU1NkRFXHU5MDAwXHU1MjMwIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW5cbiAgICovXG4gIGZ1bmN0aW9uIHBhdGNoUWlhbmt1bkluZGV4SW1wb3J0cyhjb2RlOiBzdHJpbmcpOiB7IGNvZGU6IHN0cmluZzsgbW9kaWZpZWQ6IGJvb2xlYW4gfSB7XG4gICAgaWYgKCFxaWFua3VuSW5kZXhJbXBvcnRSZWdleC50ZXN0KGNvZGUpKSB7XG4gICAgICByZXR1cm4geyBjb2RlLCBtb2RpZmllZDogZmFsc2UgfTtcbiAgICB9XG4gICAgcWlhbmt1bkluZGV4SW1wb3J0UmVnZXgubGFzdEluZGV4ID0gMDtcblxuICAgIGNvbnN0IGhlbHBlck5hbWUgPSAnX19idGNRaWFua3VuQXNzZXRPcmlnaW4nO1xuICAgIGNvbnN0IHRzTmFtZSA9ICdfX2J0Y0J1aWxkVic7XG4gICAgY29uc3QgaGVscGVyRGVjbCA9XG4gICAgICBgY29uc3QgJHtoZWxwZXJOYW1lfT0oKCk9Pnt0cnl7Y29uc3QgcD13aW5kb3cmJndpbmRvdy5fX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXztgICtcbiAgICAgIGBpZihwJiZ0eXBlb2YgcD09PSdzdHJpbmcnKXtjb25zdCBzPXAucmVwbGFjZSgvXFxcXC8kLywnJyk7YCArXG4gICAgICBgaWYocy5zdGFydHNXaXRoKCdodHRwJyl8fHMuc3RhcnRzV2l0aCgnLy8nKSlyZXR1cm4gcztgICtcbiAgICAgIGByZXR1cm4gKHdpbmRvdy5sb2NhdGlvbiYmd2luZG93LmxvY2F0aW9uLm9yaWdpbj93aW5kb3cubG9jYXRpb24ub3JpZ2luOicnKStzO31gICtcbiAgICAgIGB9Y2F0Y2h7fXJldHVybiAod2luZG93LmxvY2F0aW9uJiZ3aW5kb3cubG9jYXRpb24ub3JpZ2luKT93aW5kb3cubG9jYXRpb24ub3JpZ2luOicnO30pKCk7YDtcbiAgICBjb25zdCB0c0RlY2wgPSBgY29uc3QgJHt0c05hbWV9PScke2J1aWxkVGltZXN0YW1wfSc7YDtcblxuICAgIGxldCBuZXdDb2RlID0gY29kZS5yZXBsYWNlKHFpYW5rdW5JbmRleEltcG9ydFJlZ2V4LCAoX20sIF9xLCBfa2luZCwgcmVzdCkgPT4ge1xuICAgICAgLy8gcmVzdDogXCJ4eHh4LmpzXCIgXHU5MUNDXHU3Njg0XHU0RjU5XHU0RTBCXHU5MEU4XHU1MjA2XHVGRjA4aGFzaCArIC5qc1x1RkYwOVxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU4RkZEXHU1MkEwID92PSBcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdUZGMENcdTkwN0ZcdTUxNERcdTVCQkZcdTRFM0IvXHU2RDRGXHU4OUM4XHU1NjY4L0NETiBcdTU5MERcdTc1MjhcdTY1RTdcdTUxNjVcdTUzRTNcdTgxMUFcdTY3MkNcdTVCRkNcdTgxRjRcdTYzMDFcdTdFRURcdThCRjdcdTZDNDJcdTY1RTcgY2h1bmtcbiAgICAgIHJldHVybiBgaW1wb3J0KC8qIEB2aXRlLWlnbm9yZSAqLyAoJHtoZWxwZXJOYW1lfSArICcvYXNzZXRzLyR7X2tpbmR9LSR7cmVzdH0nICsgJz92PScgKyAke3RzTmFtZX0pKWA7XG4gICAgfSk7XG5cbiAgICBpZiAoIW5ld0NvZGUuaW5jbHVkZXMoaGVscGVyRGVjbCkpIHtcbiAgICAgIC8vIFx1NUMzRFx1OTFDRlx1NUMxMVx1NEZCNVx1NTE2NVx1RkYxQVx1NTNFQVx1NTcyOFx1OTcwMFx1ODk4MVx1NjVGNlx1NjNEMlx1NTE2NSBoZWxwZXJcdUZGMENcdTRFMDBcdTZCMjFcdTUzNzNcdTUzRUZcbiAgICAgIG5ld0NvZGUgPSBgJHt0c0RlY2x9XFxuJHtoZWxwZXJEZWNsfVxcbiR7bmV3Q29kZX1gO1xuICAgIH1cbiAgICByZXR1cm4geyBjb2RlOiBuZXdDb2RlLCBtb2RpZmllZDogdHJ1ZSB9O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnZW5zdXJlLWJhc2UtdXJsJyxcbiAgICByZW5kZXJDaHVuayhjb2RlOiBzdHJpbmcsIGNodW5rOiBDaHVua0luZm8sIF9vcHRpb25zOiBhbnkpIHtcbiAgICAgIC8vIFx1NEUwRFx1NTE4RFx1OERGM1x1OEZDNyB2ZW5kb3IgXHU3QjQ5XHU3QjJDXHU0RTA5XHU2NUI5XHU1RTkzXHVGRjBDXHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHU5MEZEXHU2QjYzXHU3ODZFXG4gICAgICAvLyBcdTU2RTBcdTRFM0EgdmVuZG9yIFx1N0I0OVx1NUU5M1x1NEUyRFx1NEU1Rlx1NTNFRlx1ODBGRFx1NTMwNVx1NTQyQlx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1NzY4NFx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFxuXG4gICAgICBsZXQgbmV3Q29kZSA9IGNvZGU7XG4gICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkVFXHU1OTBEIHFpYW5rdW4gXHU1MzA1XHU4OEM1XHU1NjY4XHU3Njg0XHU3RUREXHU1QkY5IC9hc3NldHMvaW5kZXgteHh4LmpzIFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1RkYwOFx1OERFOFx1NTdERlx1NUJCRlx1NEUzQlx1NEYxQSA0MDRcdUZGMDlcbiAgICAgIHtcbiAgICAgICAgY29uc3QgcGF0Y2hlZCA9IHBhdGNoUWlhbmt1bkluZGV4SW1wb3J0cyhuZXdDb2RlKTtcbiAgICAgICAgaWYgKHBhdGNoZWQubW9kaWZpZWQpIHtcbiAgICAgICAgICBuZXdDb2RlID0gcGF0Y2hlZC5jb2RlO1xuICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgICAgY29uc3QgcmVsYXRpdmVQYXRoUmVnZXggPSAvKFtcIidgXSkoXFwvYXNzZXRzXFwvW15cIidgXFxzXSspKFxcP1teXCInYFxcc10qKT8vZztcbiAgICAgICAgaWYgKHJlbGF0aXZlUGF0aFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHJlbGF0aXZlUGF0aFJlZ2V4LCAoX21hdGNoLCBxdW90ZSwgcGF0aCwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGAke3F1b3RlfSR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRFx1OTUxOVx1OEJFRlx1NzY4NFx1N0FFRlx1NTNFM1x1RkYwOFx1NEUzQlx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFMyAtPiBcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcdUZGMDlcbiAgICAgIC8vIFx1NTMzOVx1OTE0RCBodHRwOi8vbG9jYWxob3N0OjQxODAvYXNzZXRzL3h4eCBcdTYyMTYgaHR0cDovLzEwLjgwLjguMTk5OjQxODAvYXNzZXRzL3h4eFxuICAgICAgY29uc3Qgd3JvbmdQb3J0SHR0cFJlZ2V4ID0gbmV3IFJlZ0V4cChgaHR0cDovLygke2FwcEhvc3R9fGxvY2FsaG9zdCk6JHttYWluQXBwUG9ydH0oL2Fzc2V0cy9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpO1xuICAgICAgaWYgKHdyb25nUG9ydEh0dHBSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uod3JvbmdQb3J0SHR0cFJlZ2V4LCAoX21hdGNoLCBob3N0LCBwYXRoLCBxdWVyeSA9ICcnKSA9PiB7XG4gICAgICAgICAgLy8gXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4IGJhc2VVcmxcdUZGMDhcdTUzMDVcdTU0MkJcdTVCOENcdTY1NzQgVVJMXHVGRjA5XG4gICAgICAgICAgaWYgKGlzUHJldmlld0J1aWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gYCR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFx1NUYwMFx1NTNEMVx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOFx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFM1xuICAgICAgICAgIHJldHVybiBgaHR0cDovLyR7aG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgIH0pO1xuICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTMzOVx1OTE0RCAvL2xvY2FsaG9zdDo0MTgwL2Fzc2V0cy94eHggXHU2MjE2IC8vMTAuODAuOC4xOTk6NDE4MC9hc3NldHMveHh4XG4gICAgICBjb25zdCB3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4ID0gbmV3IFJlZ0V4cChgLy8oJHthcHBIb3N0fXxsb2NhbGhvc3QpOiR7bWFpbkFwcFBvcnR9KC9hc3NldHMvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKTtcbiAgICAgIGlmICh3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZSh3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4LCAoX21hdGNoLCBob3N0LCBwYXRoLCBxdWVyeSA9ICcnKSA9PiB7XG4gICAgICAgICAgLy8gXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4IGJhc2VVcmxcdUZGMDhcdTUzMDVcdTU0MkJcdTVCOENcdTY1NzQgVVJMXHVGRjA5XG4gICAgICAgICAgaWYgKGlzUHJldmlld0J1aWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gYCR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFx1NUYwMFx1NTNEMVx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOFx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFM1xuICAgICAgICAgIHJldHVybiBgLy8ke2hvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICB9KTtcbiAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwYXR0ZXJucyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKGAoaHR0cDovLykobG9jYWxob3N0fCR7YXBwSG9zdH0pOiR7bWFpbkFwcFBvcnR9KC9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpLFxuICAgICAgICAgIHJlcGxhY2VtZW50OiAoX21hdGNoOiBzdHJpbmcsIHByb3RvY29sOiBzdHJpbmcsIF9ob3N0OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYCR7cHJvdG9jb2x9JHthcHBIb3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVnZXg6IG5ldyBSZWdFeHAoYCgvLykobG9jYWxob3N0fCR7YXBwSG9zdH0pOiR7bWFpbkFwcFBvcnR9KC9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpLFxuICAgICAgICAgIHJlcGxhY2VtZW50OiAoX21hdGNoOiBzdHJpbmcsIHByb3RvY29sOiBzdHJpbmcsIF9ob3N0OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYCR7cHJvdG9jb2x9JHthcHBIb3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVnZXg6IG5ldyBSZWdFeHAoYChbXCInXFxgXSkoaHR0cDovLykobG9jYWxob3N0fCR7YXBwSG9zdH0pOiR7bWFpbkFwcFBvcnR9KC9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpLFxuICAgICAgICAgIHJlcGxhY2VtZW50OiAoX21hdGNoOiBzdHJpbmcsIHF1b3RlOiBzdHJpbmcsIHByb3RvY29sOiBzdHJpbmcsIF9ob3N0OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYCR7cXVvdGV9JHtwcm90b2NvbH0ke2FwcEhvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZWdleDogbmV3IFJlZ0V4cChgKFtcIidcXGBdKSgvLykobG9jYWxob3N0fCR7YXBwSG9zdH0pOiR7bWFpbkFwcFBvcnR9KC9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpLFxuICAgICAgICAgIHJlcGxhY2VtZW50OiAoX21hdGNoOiBzdHJpbmcsIHF1b3RlOiBzdHJpbmcsIHByb3RvY29sOiBzdHJpbmcsIF9ob3N0OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYCR7cXVvdGV9JHtwcm90b2NvbH0ke2FwcEhvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdO1xuXG4gICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgcGF0dGVybnMpIHtcbiAgICAgICAgaWYgKHBhdHRlcm4ucmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2UocGF0dGVybi5yZWdleCwgcGF0dGVybi5yZXBsYWNlbWVudCBhcyBhbnkpO1xuICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTRGRUVcdTU5MERcdTRFODYgJHtjaHVuay5maWxlTmFtZX0gXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0ICgke21haW5BcHBQb3J0fSAtPiAke2FwcFBvcnR9KWApO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGNvZGU6IG5ld0NvZGUsXG4gICAgICAgICAgbWFwOiBudWxsLFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIGdlbmVyYXRlQnVuZGxlKF9vcHRpb25zOiBPdXRwdXRPcHRpb25zLCBidW5kbGU6IE91dHB1dEJ1bmRsZSkge1xuICAgICAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNodW5rXSBvZiBPYmplY3QuZW50cmllcyhidW5kbGUpKSB7XG4gICAgICAgIGNvbnN0IGM6IGFueSA9IGNodW5rO1xuICAgICAgICBpZiAoYy50eXBlID09PSAnY2h1bmsnICYmIGMuY29kZSkge1xuICAgICAgICAgIC8vIFx1NEUwRFx1NTE4RFx1OERGM1x1OEZDNyB2ZW5kb3IgXHU3QjQ5XHU3QjJDXHU0RTA5XHU2NUI5XHU1RTkzXHVGRjBDXHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHU5MEZEXHU2QjYzXHU3ODZFXG4gICAgICAgICAgbGV0IG5ld0NvZGUgPSBjLmNvZGU7XG4gICAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MEQgcWlhbmt1biBcdTUzMDVcdTg4QzVcdTU2NjhcdTc2ODRcdTdFRERcdTVCRjkgL2Fzc2V0cy9pbmRleC14eHguanMgXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHVGRjA4XHU4REU4XHU1N0RGXHU1QkJGXHU0RTNCXHU0RjFBIDQwNFx1RkYwOVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IHBhdGNoZWQgPSBwYXRjaFFpYW5rdW5JbmRleEltcG9ydHMobmV3Q29kZSk7XG4gICAgICAgICAgICBpZiAocGF0Y2hlZC5tb2RpZmllZCkge1xuICAgICAgICAgICAgICBuZXdDb2RlID0gcGF0Y2hlZC5jb2RlO1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGlzUHJldmlld0J1aWxkKSB7XG4gICAgICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGhSZWdleCA9IC8oW1wiJ2BdKShcXC9hc3NldHNcXC9bXlwiJ2BcXHNdKykoXFw/W15cIidgXFxzXSopPy9nO1xuICAgICAgICAgICAgaWYgKHJlbGF0aXZlUGF0aFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShyZWxhdGl2ZVBhdGhSZWdleCwgKF9tYXRjaDogc3RyaW5nLCBxdW90ZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtxdW90ZX0ke2Jhc2VVcmwucmVwbGFjZSgvXFwvJC8sICcnKX0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRFx1OTUxOVx1OEJFRlx1NzY4NFx1N0FFRlx1NTNFM1x1RkYwOFx1NEUzQlx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFMyAtPiBcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcdUZGMDlcbiAgICAgICAgICAvLyBcdTUzMzlcdTkxNEQgaHR0cDovL2xvY2FsaG9zdDo0MTgwL2Fzc2V0cy94eHggXHU2MjE2IGh0dHA6Ly8xMC44MC44LjE5OTo0MTgwL2Fzc2V0cy94eHhcbiAgICAgICAgICBjb25zdCB3cm9uZ1BvcnRIdHRwUmVnZXggPSBuZXcgUmVnRXhwKGBodHRwOi8vKCR7YXBwSG9zdH18bG9jYWxob3N0KToke21haW5BcHBQb3J0fSgvYXNzZXRzL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyk7XG4gICAgICAgICAgaWYgKHdyb25nUG9ydEh0dHBSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHdyb25nUG9ydEh0dHBSZWdleCwgKF9tYXRjaDogc3RyaW5nLCBob3N0OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOCBiYXNlVXJsXHVGRjA4XHU1MzA1XHU1NDJCXHU1QjhDXHU2NTc0IFVSTFx1RkYwOVxuICAgICAgICAgICAgICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gXHU1RjAwXHU1M0QxXHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzXG4gICAgICAgICAgICAgIHJldHVybiBgaHR0cDovLyR7aG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTUzMzlcdTkxNEQgLy9sb2NhbGhvc3Q6NDE4MC9hc3NldHMveHh4IFx1NjIxNiAvLzEwLjgwLjguMTk5OjQxODAvYXNzZXRzL3h4eFxuICAgICAgICAgIGNvbnN0IHdyb25nUG9ydFByb3RvY29sUmVnZXggPSBuZXcgUmVnRXhwKGAvLygke2FwcEhvc3R9fGxvY2FsaG9zdCk6JHttYWluQXBwUG9ydH0oL2Fzc2V0cy9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpO1xuICAgICAgICAgIGlmICh3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uod3JvbmdQb3J0UHJvdG9jb2xSZWdleCwgKF9tYXRjaDogc3RyaW5nLCBob3N0OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOCBiYXNlVXJsXHVGRjA4XHU1MzA1XHU1NDJCXHU1QjhDXHU2NTc0IFVSTFx1RkYwOVxuICAgICAgICAgICAgICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gXHU1RjAwXHU1M0QxXHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzXG4gICAgICAgICAgICAgIHJldHVybiBgLy8ke2hvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgICAoY2h1bmsgYXMgYW55KS5jb2RlID0gbmV3Q29kZTtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU1NzI4IGdlbmVyYXRlQnVuZGxlIFx1NEUyRFx1NEZFRVx1NTkwRFx1NEU4NiAke2ZpbGVOYW1lfSBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdThERUZcdTVGODRgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoYy50eXBlID09PSAnYXNzZXQnICYmIGZpbGVOYW1lID09PSAnaW5kZXguaHRtbCcpIHtcbiAgICAgICAgICAvLyBcdTU5MDRcdTc0MDYgSFRNTCBcdTY1ODdcdTRFRjZcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcbiAgICAgICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU5ODJcdTY3OUMgVml0ZSBcdTkxNERcdTdGNkVcdTZCNjNcdTc4NkVcdUZGMDhiYXNlOiAnLycsIGFzc2V0c0RpcjogJ2Fzc2V0cycsIHJvbGx1cE9wdGlvbnMub3V0cHV0LmNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnXHVGRjA5XHVGRjBDXG4gICAgICAgICAgLy8gVml0ZSBcdTVFOTRcdThCRTVcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTBcdTZCNjNcdTc4NkVcdTc2ODRcdThERUZcdTVGODRcdUZGMENcdTRFMERcdTk3MDBcdTg5ODFcdTRGRUVcdTU5MERcdTMwMDJcbiAgICAgICAgICAvLyBcdThGRDlcdTkxQ0NcdTUzRUFcdTU5MDRcdTc0MDZcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdTY1RjZcdTc2ODRcdTdBRUZcdTUzRTNcdTRGRUVcdTU5MERcdUZGMENcdTRFRTVcdTUzQ0FcdTRGRUVcdTU5MERcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTMwMDJcbiAgICAgICAgICBsZXQgaHRtbENvbnRlbnQgPSAoKGMgYXMgYW55KS5zb3VyY2UpIGFzIHN0cmluZztcbiAgICAgICAgICBsZXQgaHRtbE1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgICAvLyBcdTRGRUVcdTU5MERcdTc2RjhcdTVCRjlcdThERUZcdTVGODQgLi9hc3NldHMvIFx1NEUzQVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NCAvYXNzZXRzL1x1RkYwOFx1NTk4Mlx1Njc5Q1x1NTFGQVx1NzNCMFx1RkYwOVxuICAgICAgICAgIGNvbnN0IHJlbGF0aXZlQXNzZXRSZWdleCA9IC8oaHJlZnxzcmMpPVtcIiddKFxcLlxcL2Fzc2V0c1xcL1teXCInXSspKFxcP1teXCInXSopP1tcIiddL2c7XG4gICAgICAgICAgaWYgKHJlbGF0aXZlQXNzZXRSZWdleC50ZXN0KGh0bWxDb250ZW50KSkge1xuICAgICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKHJlbGF0aXZlQXNzZXRSZWdleCwgKF9tYXRjaCwgYXR0ciwgcGF0aCwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgICAgICAvLyBcdTVDMDZcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdThGNkNcdTYzNjJcdTRFM0FcdTdFRERcdTVCRjlcdThERUZcdTVGODRcbiAgICAgICAgICAgICAgY29uc3QgYWJzb2x1dGVQYXRoID0gcGF0aC5yZXBsYWNlKC9eXFwuLywgJycpO1xuICAgICAgICAgICAgICBodG1sTW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtYmFzZS11cmxdIFx1NEZFRVx1NTkwRFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NDogJHtwYXRofSAtPiAke2Fic29sdXRlUGF0aH1gKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJ9PVwiJHthYnNvbHV0ZVBhdGh9JHtxdWVyeX1cImA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MEQgdml0ZS1wbHVnaW4tcWlhbmt1biBcdTZDRThcdTUxNjVcdTUyMzAgaW5kZXguaHRtbCBcdTUxODVcdTgwNTRcdTgxMUFcdTY3MkNcdTRFMkRcdTc2ODQgaW1wb3J0KCcvYXNzZXRzL2luZGV4LXh4eC5qcycpXG4gICAgICAgICAgLy8gXHU4QkY0XHU2NjBFXHVGRjFBcWlhbmt1biBcdTRGMUFcdTYyOEFcdThCRTVcdTUxODVcdTgwNTRcdTgxMUFcdTY3MkMgZXZhbCBcdTYyMTAgVk0gXHU2MjY3XHU4ODRDXHVGRjFCXHU1OTgyXHU2NzlDXHU0RUNEXHU2NjJGIC9hc3NldHMvIFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NUMzMVx1NEYxQVx1NjMwOVx1NUJCRlx1NEUzQlx1NTdERlx1NTQwRFx1ODlFM1x1Njc5MFx1RkYwOFx1NUJGQ1x1ODFGNCBsYXlvdXQgXHU1N0RGXHU1NDBEIDQwNFx1RkYwOVx1MzAwMlxuICAgICAgICAgIC8vIFx1OEZEOVx1OTFDQ1x1NjUzOVx1NEUzQVx1RkYxQVx1NEYxOFx1NTE0OFx1NzUyOCBfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fX1x1RkYwOFx1NUI1MFx1NUU5NFx1NzUyOCBwdWJsaWNQYXRoL29yaWdpblx1RkYwOVx1RkYwQ1x1NUU3Nlx1OEZGRFx1NTJBMCA/dj0gXHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHVGRjBDXHU5MDdGXHU1MTREXHU3RjEzXHU1QjU4XHU2NUU3XHU1MTY1XHU1M0UzXHUzMDAyXG4gICAgICAgICAgaWYgKHFpYW5rdW5JbmRleEltcG9ydEluSHRtbFJlZ2V4LnRlc3QoaHRtbENvbnRlbnQpKSB7XG4gICAgICAgICAgICBxaWFua3VuSW5kZXhJbXBvcnRJbkh0bWxSZWdleC5sYXN0SW5kZXggPSAwO1xuICAgICAgICAgICAgY29uc3Qgb3JpZ2luRXhwciA9XG4gICAgICAgICAgICAgIGAoKHR5cGVvZiBfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXyE9PSd1bmRlZmluZWQnJiZfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXylgICtcbiAgICAgICAgICAgICAgYD9uZXcgVVJMKF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fLCh0eXBlb2YgbG9jYXRpb24hPT0ndW5kZWZpbmVkJyYmbG9jYXRpb24ub3JpZ2luKXx8JycpLm9yaWdpbmAgK1xuICAgICAgICAgICAgICBgOigodHlwZW9mIGxvY2F0aW9uIT09J3VuZGVmaW5lZCcmJmxvY2F0aW9uLm9yaWdpbil8fCcnKSlgO1xuICAgICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKHFpYW5rdW5JbmRleEltcG9ydEluSHRtbFJlZ2V4LCAoX20sIF9xLCBhYnNQYXRoKSA9PiB7XG4gICAgICAgICAgICAgIGh0bWxNb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIHJldHVybiBgaW1wb3J0KC8qIEB2aXRlLWlnbm9yZSAqLyAoJHtvcmlnaW5FeHByfSArICcke2Fic1BhdGh9JyArICc/dj0ke2J1aWxkVGltZXN0YW1wfScpKWA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEIGluZGV4Lmh0bWwgXHU1MTg1XHU4MDU0IGltcG9ydCgvYXNzZXRzL2luZGV4LSouanMpIFx1NUU3Nlx1OEZGRFx1NTJBMCB2PSR7YnVpbGRUaW1lc3RhbXB9YCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1MUZBXHU3M0IwXHU2ODM5XHU3NkVFXHU1RjU1XHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHVGRjA4XHU1OTgyIC9pbmRleC5qc1x1RkYwOVx1RkYwQ1x1OEJGNFx1NjYwRVx1OTE0RFx1N0Y2RVx1NjcwOVx1OTVFRVx1OTg5OFx1RkYwQ1x1OEJCMFx1NUY1NVx1OEI2Nlx1NTQ0QVxuICAgICAgICAgIC8vIFx1NkI2M1x1NUUzOFx1NjBDNVx1NTFCNVx1NEUwQlx1RkYwQ1ZpdGUgXHU1RTk0XHU4QkU1XHU3NTFGXHU2MjEwIC9hc3NldHMvW25hbWVdLVtoYXNoXS5qcyBcdThGRDlcdTY4MzdcdTc2ODRcdThERUZcdTVGODRcbiAgICAgICAgICBjb25zdCByb290SnNSZWdleCA9IC8oaHJlZnxzcmMpPVtcIiddKFxcLyhbXi9dK1xcLihqc3xtanMpKSkoXFw/W15cIiddKik/W1wiJ10vZztcbiAgICAgICAgICBpZiAocm9vdEpzUmVnZXgudGVzdChodG1sQ29udGVudCkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBodG1sQ29udGVudC5tYXRjaChyb290SnNSZWdleCk7XG4gICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtlbnN1cmUtYmFzZS11cmxdIFx1MjZBMFx1RkUwRiAgXHU2OEMwXHU2RDRCXHU1MjMwXHU2ODM5XHU3NkVFXHU1RjU1XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHVGRjBDXHU4RkQ5XHU5MDFBXHU1RTM4XHU0RTBEXHU1RTk0XHU4QkU1XHU1MUZBXHU3M0IwXHUzMDAyXHU4QkY3XHU2OEMwXHU2N0U1IFZpdGUgXHU5MTREXHU3RjZFXHVGRjA4YmFzZSwgYXNzZXRzRGlyLCByb2xsdXBPcHRpb25zLm91dHB1dC5jaHVua0ZpbGVOYW1lc1x1RkYwOTpgLCBtYXRjaGVzKTtcbiAgICAgICAgICAgICAgLy8gXHU0RkVFXHU1OTBEXHU4RkQ5XHU0RTlCXHU4REVGXHU1Rjg0XHVGRjA4XHU0RjVDXHU0RTNBXHU1MTVDXHU1RTk1XHU2NUI5XHU2ODQ4XHVGRjA5XG4gICAgICAgICAgICAgIGh0bWxDb250ZW50ID0gaHRtbENvbnRlbnQucmVwbGFjZShyb290SnNSZWdleCwgKF9tYXRjaCwgYXR0ciwgcGF0aCwgZmlsZU5hbWUsIF9leHQsIHF1ZXJ5ID0gJycpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXBhdGguc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKSAmJiAhcGF0aC5zdGFydHNXaXRoKCcvZmF2aWNvbicpICYmICFwYXRoLnN0YXJ0c1dpdGgoJy9sb2dvJykgJiYgIXBhdGgubWF0Y2goL1xcLihwbmd8anBnfGpwZWd8Z2lmfHN2Z3xpY298anNvbikkLykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBgL2Fzc2V0cy8ke2ZpbGVOYW1lfWA7XG4gICAgICAgICAgICAgICAgICBodG1sTW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTRGRUVcdTU5MERcdTY4MzlcdTc2RUVcdTVGNTVcdThENDRcdTZFOTBcdThERUZcdTVGODRcdUZGMDhcdTUxNUNcdTVFOTVcdUZGMDk6ICR7cGF0aH0gLT4gJHtuZXdQYXRofWApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJ9PVwiJHtuZXdQYXRofSR7cXVlcnl9XCJgO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gX21hdGNoO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCByb290Q3NzUmVnZXggPSAvKGhyZWZ8c3JjKT1bXCInXShcXC8oW14vXStcXC5jc3MpKShcXD9bXlwiJ10qKT9bXCInXS9nO1xuICAgICAgICAgIGlmIChyb290Q3NzUmVnZXgudGVzdChodG1sQ29udGVudCkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBodG1sQ29udGVudC5tYXRjaChyb290Q3NzUmVnZXgpO1xuICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTI2QTBcdUZFMEYgIFx1NjhDMFx1NkQ0Qlx1NTIzMFx1NjgzOVx1NzZFRVx1NUY1NSBDU1MgXHU4REVGXHU1Rjg0XHVGRjBDXHU4RkQ5XHU5MDFBXHU1RTM4XHU0RTBEXHU1RTk0XHU4QkU1XHU1MUZBXHU3M0IwXHUzMDAyXHU4QkY3XHU2OEMwXHU2N0U1IFZpdGUgXHU5MTREXHU3RjZFOmAsIG1hdGNoZXMpO1xuICAgICAgICAgICAgICAvLyBcdTRGRUVcdTU5MERcdThGRDlcdTRFOUJcdThERUZcdTVGODRcdUZGMDhcdTRGNUNcdTRFM0FcdTUxNUNcdTVFOTVcdTY1QjlcdTY4NDhcdUZGMDlcbiAgICAgICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKHJvb3RDc3NSZWdleCwgKF9tYXRjaCwgYXR0ciwgcGF0aCwgZmlsZU5hbWUsIHF1ZXJ5ID0gJycpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXBhdGguc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGAvYXNzZXRzLyR7ZmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgIGh0bWxNb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtYmFzZS11cmxdIFx1NEZFRVx1NTkwRFx1NjgzOVx1NzZFRVx1NUY1NSBDU1MgXHU4REVGXHU1Rjg0XHVGRjA4XHU1MTVDXHU1RTk1XHVGRjA5OiAke3BhdGh9IC0+ICR7bmV3UGF0aH1gKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthdHRyfT1cIiR7bmV3UGF0aH0ke3F1ZXJ5fVwiYDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9tYXRjaDtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGh0bWxNb2RpZmllZCkge1xuICAgICAgICAgICAgKGNodW5rIGFzIGFueSkuc291cmNlID0gaHRtbENvbnRlbnQ7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtYmFzZS11cmxdIFx1NEZFRVx1NTkwRFx1NEU4NiBpbmRleC5odG1sIFx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NGApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcY29ycy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9jb3JzLnRzXCI7LyoqXG4gKiBDT1JTIFx1NjNEMlx1NEVGNlxuICogXHU2NTJGXHU2MzAxIGNyZWRlbnRpYWxzIFx1NzY4NCBDT1JTIFx1NEUyRFx1OTVGNFx1NEVGNlxuICovXG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luLCBWaXRlRGV2U2VydmVyIH0gZnJvbSAndml0ZSc7XG5cbi8qKlxuICogQ09SUyBcdTYzRDJcdTRFRjZcdUZGMDhcdTY1MkZcdTYzMDEgY3JlZGVudGlhbHNcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcnNQbHVnaW4oKTogUGx1Z2luIHtcbiAgY29uc3QgY29yc0Rldk1pZGRsZXdhcmUgPSAocmVxOiBhbnksIHJlczogYW55LCBuZXh0OiBhbnkpID0+IHtcbiAgICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW47XG5cbiAgICBpZiAob3JpZ2luKSB7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCBvcmlnaW4pO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnLCAndHJ1ZScpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctUHJpdmF0ZS1OZXR3b3JrJywgJ3RydWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LVByaXZhdGUtTmV0d29yaycsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1NYXgtQWdlJywgJzg2NDAwJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcsICcwJyk7XG4gICAgICByZXMuZW5kKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbmV4dCgpO1xuICB9O1xuXG4gIGNvbnN0IGNvcnNQcmV2aWV3TWlkZGxld2FyZSA9IChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xuICAgIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICAgIGNvbnN0IG9yaWdpbiA9IHJlcS5oZWFkZXJzLm9yaWdpbjtcblxuICAgICAgaWYgKG9yaWdpbikge1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCBvcmlnaW4pO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJyk7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgICB9XG5cbiAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtTWF4LUFnZScsICc4NjQwMCcpO1xuICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1MZW5ndGgnLCAnMCcpO1xuICAgICAgcmVzLmVuZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG9yaWdpbiA9IHJlcS5oZWFkZXJzLm9yaWdpbjtcbiAgICBpZiAob3JpZ2luKSB7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCBvcmlnaW4pO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnLCAndHJ1ZScpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgIH1cblxuICAgIG5leHQoKTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjb3JzLXdpdGgtY3JlZGVudGlhbHMnLFxuICAgIGVuZm9yY2U6ICdwcmUnLFxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpIHtcbiAgICAgIGNvbnN0IHN0YWNrID0gKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc3RhY2spKSB7XG4gICAgICAgIGNvbnN0IGZpbHRlcmVkU3RhY2sgPSBzdGFjay5maWx0ZXIoKGl0ZW06IGFueSkgPT5cbiAgICAgICAgICBpdGVtLmhhbmRsZSAhPT0gY29yc0Rldk1pZGRsZXdhcmUgJiYgaXRlbS5oYW5kbGUgIT09IGNvcnNQcmV2aWV3TWlkZGxld2FyZVxuICAgICAgICApO1xuICAgICAgICAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2sgPSBbXG4gICAgICAgICAgeyByb3V0ZTogJycsIGhhbmRsZTogY29yc0Rldk1pZGRsZXdhcmUgfSxcbiAgICAgICAgICAuLi5maWx0ZXJlZFN0YWNrLFxuICAgICAgICBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShjb3JzRGV2TWlkZGxld2FyZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBjb25maWd1cmVQcmV2aWV3U2VydmVyKHNlcnZlcjogVml0ZURldlNlcnZlcikge1xuICAgICAgY29uc3Qgc3RhY2sgPSAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2s7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShzdGFjaykpIHtcbiAgICAgICAgY29uc3QgZmlsdGVyZWRTdGFjayA9IHN0YWNrLmZpbHRlcigoaXRlbTogYW55KSA9PlxuICAgICAgICAgIGl0ZW0uaGFuZGxlICE9PSBjb3JzRGV2TWlkZGxld2FyZSAmJiBpdGVtLmhhbmRsZSAhPT0gY29yc1ByZXZpZXdNaWRkbGV3YXJlXG4gICAgICAgICk7XG4gICAgICAgIChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjayA9IFtcbiAgICAgICAgICB7IHJvdXRlOiAnJywgaGFuZGxlOiBjb3JzUHJldmlld01pZGRsZXdhcmUgfSxcbiAgICAgICAgICAuLi5maWx0ZXJlZFN0YWNrLFxuICAgICAgICBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShjb3JzUHJldmlld01pZGRsZXdhcmUpO1xuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcY3NzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2Nzcy50c1wiOy8qKlxuICogQ1NTIFx1NzZGOFx1NTE3M1x1NjNEMlx1NEVGNlxuICogXHU3ODZFXHU0RkREIENTUyBcdTY1ODdcdTRFRjZcdTg4QUJcdTZCNjNcdTc4NkVcdTYyNTNcdTUzMDVcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW2Vuc3VyZS1jc3NdJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1tlbnN1cmUtY3NzXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW2Vuc3VyZS1jc3NdJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1tlbnN1cmUtY3NzXScsIC4uLmFyZ3MpLFxufTtcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB0eXBlIHsgT3V0cHV0T3B0aW9ucywgT3V0cHV0QnVuZGxlIH0gZnJvbSAncm9sbHVwJztcblxuLyoqXG4gKiBcdTc4NkVcdTRGREQgQ1NTIFx1NjU4N1x1NEVGNlx1ODhBQlx1NkI2M1x1Nzg2RVx1NjI1M1x1NTMwNVx1NzY4NFx1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlQ3NzUGx1Z2luKCk6IFBsdWdpbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2Vuc3VyZS1jc3MtcGx1Z2luJyxcbiAgICBnZW5lcmF0ZUJ1bmRsZShfb3B0aW9uczogT3V0cHV0T3B0aW9ucywgYnVuZGxlOiBPdXRwdXRCdW5kbGUpIHtcbiAgICAgIGNvbnN0IGpzRmlsZXMgPSBPYmplY3Qua2V5cyhidW5kbGUpLmZpbHRlcihmaWxlID0+IGZpbGUuZW5kc1dpdGgoJy5qcycpKTtcbiAgICAgIGxldCBoYXNJbmxpbmVDc3MgPSBmYWxzZTtcbiAgICAgIGNvbnN0IHN1c3BpY2lvdXNGaWxlczogc3RyaW5nW10gPSBbXTtcblxuICAgICAganNGaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgICBjb25zdCBjaHVuayA9IGJ1bmRsZVtmaWxlXSBhcyBhbnk7XG4gICAgICAgIGlmIChjaHVuayAmJiBjaHVuay5jb2RlICYmIHR5cGVvZiBjaHVuay5jb2RlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGNvbnN0IGNvZGUgPSBjaHVuay5jb2RlO1xuXG4gICAgICAgICAgY29uc3QgaXNNb2R1bGVQcmVsb2FkID0gY29kZS5pbmNsdWRlcygnbW9kdWxlcHJlbG9hZCcpIHx8IGNvZGUuaW5jbHVkZXMoJ3JlbExpc3QnKTtcbiAgICAgICAgICBpZiAoaXNNb2R1bGVQcmVsb2FkKSByZXR1cm47XG5cbiAgICAgICAgICBjb25zdCBpc0tub3duTGlicmFyeSA9IGZpbGUuaW5jbHVkZXMoJ3Z1ZS1jb3JlJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ2VsZW1lbnQtcGx1cycpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCd2ZW5kb3InKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygndnVlLWkxOG4nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygndnVlLXJvdXRlcicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCdsaWItZWNoYXJ0cycpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCdtb2R1bGUtJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ2FwcC1jb21wb3NhYmxlcycpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCdhcHAtcGFnZXMnKTtcbiAgICAgICAgICBpZiAoaXNLbm93bkxpYnJhcnkpIHJldHVybjtcblxuICAgICAgICAgIGNvbnN0IGhhc1N0eWxlRWxlbWVudENyZWF0aW9uID0gL2RvY3VtZW50XFwuY3JlYXRlRWxlbWVudFxcKFsnXCJdc3R5bGVbJ1wiXVxcKS8udGVzdChjb2RlKSAmJlxuICAgICAgICAgICAgL1xcLih0ZXh0Q29udGVudHxpbm5lckhUTUwpXFxzKj0vLnRlc3QoY29kZSkgJiZcbiAgICAgICAgICAgIC9cXHtbXn1dezEwLH1cXH0vLnRlc3QoY29kZSk7XG5cbiAgICAgICAgICBjb25zdCBoYXNJbnNlcnRTdHlsZVdpdGhDc3MgPSAvaW5zZXJ0U3R5bGVcXHMqXFwoLy50ZXN0KGNvZGUpICYmXG4gICAgICAgICAgICAvdGV4dFxcL2Nzcy8udGVzdChjb2RlKSAmJlxuICAgICAgICAgICAgL1xce1tefV17MjAsfVxcfS8udGVzdChjb2RlKTtcblxuICAgICAgICAgIGNvbnN0IHN0eWxlVGFnTWF0Y2ggPSBjb2RlLm1hdGNoKC88c3R5bGVbXj5dKj4vKTtcbiAgICAgICAgICBjb25zdCBoYXNTdHlsZVRhZ1dpdGhDb250ZW50ID0gc3R5bGVUYWdNYXRjaCAmJlxuICAgICAgICAgICAgIXN0eWxlVGFnTWF0Y2hbMF0uaW5jbHVkZXMoXCInXCIpICYmXG4gICAgICAgICAgICAhc3R5bGVUYWdNYXRjaFswXS5pbmNsdWRlcygnXCInKSAmJlxuICAgICAgICAgICAgL1xce1tefV17MjAsfVxcfS8udGVzdChjb2RlKTtcblxuICAgICAgICAgIGNvbnN0IGhhc0lubGluZUNzc1N0cmluZyA9IC9bJ1wiYF1bXidcImBdezUwLH06XFxzKlteJ1wiYF17MTAsfTtcXHMqW14nXCJgXXsxMCx9WydcImBdLy50ZXN0KGNvZGUpICYmXG4gICAgICAgICAgICAvKGNvbG9yfGJhY2tncm91bmR8d2lkdGh8aGVpZ2h0fG1hcmdpbnxwYWRkaW5nfGJvcmRlcnxkaXNwbGF5fHBvc2l0aW9ufGZsZXh8Z3JpZCkvLnRlc3QoY29kZSk7XG5cbiAgICAgICAgICBpZiAoaGFzU3R5bGVFbGVtZW50Q3JlYXRpb24gfHwgaGFzSW5zZXJ0U3R5bGVXaXRoQ3NzIHx8IGhhc1N0eWxlVGFnV2l0aENvbnRlbnQgfHwgaGFzSW5saW5lQ3NzU3RyaW5nKSB7XG4gICAgICAgICAgICBoYXNJbmxpbmVDc3MgPSB0cnVlO1xuICAgICAgICAgICAgc3VzcGljaW91c0ZpbGVzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICBjb25zdCBwYXR0ZXJuczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGlmIChoYXNTdHlsZUVsZW1lbnRDcmVhdGlvbikgcGF0dGVybnMucHVzaCgnXHU1MkE4XHU2MDAxXHU1MjFCXHU1RUZBIHN0eWxlIFx1NTE0M1x1N0QyMCcpO1xuICAgICAgICAgICAgaWYgKGhhc0luc2VydFN0eWxlV2l0aENzcykgcGF0dGVybnMucHVzaCgnaW5zZXJ0U3R5bGUgXHU1MUZEXHU2NTcwJyk7XG4gICAgICAgICAgICBpZiAoaGFzU3R5bGVUYWdXaXRoQ29udGVudCkgcGF0dGVybnMucHVzaCgnPHN0eWxlPiBcdTY4MDdcdTdCN0UnKTtcbiAgICAgICAgICAgIGlmIChoYXNJbmxpbmVDc3NTdHJpbmcpIHBhdHRlcm5zLnB1c2goJ1x1NTE4NVx1ODA1NCBDU1MgXHU1QjU3XHU3QjI2XHU0RTMyJyk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtlbnN1cmUtY3NzLXBsdWdpbl0gXHUyNkEwXHVGRTBGIFx1OEI2Nlx1NTQ0QVx1RkYxQVx1NTcyOCAke2ZpbGV9IFx1NEUyRFx1NjhDMFx1NkQ0Qlx1NTIzMFx1NTNFRlx1ODBGRFx1NzY4NFx1NTE4NVx1ODA1NCBDU1NcdUZGMDhcdTZBMjFcdTVGMEZcdUZGMUEke3BhdHRlcm5zLmpvaW4oJywgJyl9XHVGRjA5YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKGhhc0lubGluZUNzcykge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tlbnN1cmUtY3NzLXBsdWdpbl0gXHUyNkEwXHVGRTBGIFx1OEI2Nlx1NTQ0QVx1RkYxQVx1NjhDMFx1NkQ0Qlx1NTIzMCBDU1MgXHU1M0VGXHU4MEZEXHU4OEFCXHU1MTg1XHU4MDU0XHU1MjMwIEpTIFx1NEUyRFx1RkYwQ1x1OEZEOVx1NEYxQVx1NUJGQ1x1ODFGNCBxaWFua3VuIFx1NjVFMFx1NkNENVx1NkI2M1x1Nzg2RVx1NTJBMFx1OEY3RFx1NjgzN1x1NUYwRicpO1xuICAgICAgICBjb25zb2xlLndhcm4oYFtlbnN1cmUtY3NzLXBsdWdpbl0gXHU1M0VGXHU3NTkxXHU2NTg3XHU0RUY2XHVGRjFBJHtzdXNwaWNpb3VzRmlsZXMuam9pbignLCAnKX1gKTtcbiAgICAgICAgY29uc29sZS53YXJuKCdbZW5zdXJlLWNzcy1wbHVnaW5dIFx1OEJGN1x1NjhDMFx1NjdFNSB2aXRlLXBsdWdpbi1xaWFua3VuIFx1OTE0RFx1N0Y2RVx1NTQ4QyBidWlsZC5hc3NldHNJbmxpbmVMaW1pdCBcdThCQkVcdTdGNkUnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHdyaXRlQnVuZGxlKF9vcHRpb25zOiBPdXRwdXRPcHRpb25zLCBidW5kbGU6IE91dHB1dEJ1bmRsZSkge1xuICAgICAgY29uc3QgY3NzRmlsZXMgPSBPYmplY3Qua2V5cyhidW5kbGUpLmZpbHRlcihmaWxlID0+IGZpbGUuZW5kc1dpdGgoJy5jc3MnKSk7XG4gICAgICBpZiAoY3NzRmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tlbnN1cmUtY3NzLXBsdWdpbl0gXHUyNzRDIFx1OTUxOVx1OEJFRlx1RkYxQVx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NEUyRFx1NjVFMCBDU1MgXHU2NTg3XHU0RUY2XHVGRjAxJyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tlbnN1cmUtY3NzLXBsdWdpbl0gXHU4QkY3XHU2OEMwXHU2N0U1XHVGRjFBJyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJzEuIFx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlx1NjYyRlx1NTQyNlx1OTc1OVx1NjAwMVx1NUJGQ1x1NTE2NVx1NTE2OFx1NUM0MFx1NjgzN1x1NUYwRlx1RkYwOGluZGV4LmNzcy91bm8uY3NzL2VsZW1lbnQtcGx1cy5jc3NcdUZGMDknKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignMi4gXHU2NjJGXHU1NDI2XHU2NzA5IFZ1ZSBcdTdFQzRcdTRFRjZcdTRFMkRcdTRGN0ZcdTc1MjggPHN0eWxlPiBcdTY4MDdcdTdCN0UnKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignMy4gVW5vQ1NTIFx1OTE0RFx1N0Y2RVx1NjYyRlx1NTQyNlx1NkI2M1x1Nzg2RVx1RkYwQ1x1NjYyRlx1NTQyNlx1NUJGQ1x1NTE2NSBAdW5vY3NzIGFsbCcpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCc0LiB2aXRlLXBsdWdpbi1xaWFua3VuIFx1NzY4NCB1c2VEZXZNb2RlIFx1NjYyRlx1NTQyNlx1NTcyOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NkI2M1x1Nzg2RVx1NTE3M1x1OTVFRCcpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCc1LiBidWlsZC5hc3NldHNJbmxpbmVMaW1pdCBcdTY2MkZcdTU0MjZcdThCQkVcdTdGNkVcdTRFM0EgMFx1RkYwOFx1Nzk4MVx1NkI2Mlx1NTE4NVx1ODA1NFx1RkYwOScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGBbZW5zdXJlLWNzcy1wbHVnaW5dIFx1MjcwNSBcdTYyMTBcdTUyOUZcdTYyNTNcdTUzMDUgJHtjc3NGaWxlcy5sZW5ndGh9IFx1NEUyQSBDU1MgXHU2NTg3XHU0RUY2XHVGRjFBYCwgY3NzRmlsZXMpO1xuICAgICAgICBjc3NGaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgICAgIGNvbnN0IGFzc2V0ID0gYnVuZGxlW2ZpbGVdIGFzIGFueTtcbiAgICAgICAgICBpZiAoYXNzZXQgJiYgYXNzZXQuc291cmNlKSB7XG4gICAgICAgICAgICBjb25zdCBzaXplS0IgPSAoYXNzZXQuc291cmNlLmxlbmd0aCAvIDEwMjQpLnRvRml4ZWQoMik7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oYCAgLSAke2ZpbGV9OiAke3NpemVLQn1LQmApO1xuICAgICAgICAgIH0gZWxzZSBpZiAoYXNzZXQgJiYgYXNzZXQuZmlsZU5hbWUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgICAtICR7YXNzZXQuZmlsZU5hbWUgfHwgZmlsZX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcdmVyc2lvbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy92ZXJzaW9uLnRzXCI7LyoqXG4gKiBcdTcyNDhcdTY3MkNcdTUzRjdcdTYzRDJcdTRFRjZcbiAqIFx1NEUzQSBIVE1MIFx1NjU4N1x1NEVGNlx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1NkRGQlx1NTJBMFx1NTE2OFx1NUM0MFx1N0VERlx1NEUwMFx1NzY4NFx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1NzI0OFx1NjcyQ1x1NTNGN1xuICogXHU3NTI4XHU0RThFXHU2RDRGXHU4OUM4XHU1NjY4XHU3RjEzXHU1QjU4XHU2M0E3XHU1MjM2XHVGRjBDXHU2QkNGXHU2QjIxXHU2Nzg0XHU1RUZBXHU5MEZEXHU0RjFBXHU3NTFGXHU2MjEwXHU2NUIwXHU3Njg0XHU2NUY2XHU5NUY0XHU2MjMzXG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1t2ZXJzaW9uXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbdmVyc2lvbl0nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1t2ZXJzaW9uXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbdmVyc2lvbl0nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBleGlzdHNTeW5jLCByZWFkRmlsZVN5bmMsIHdyaXRlRmlsZVN5bmMgfSBmcm9tICdub2RlOmZzJztcbmltcG9ydCB7IHJlc29sdmUsIGRpcm5hbWUgfSBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcblxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcbmNvbnN0IF9fZGlybmFtZSA9IGRpcm5hbWUoX19maWxlbmFtZSk7XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU2MjE2XHU3NTFGXHU2MjEwXHU1MTY4XHU1QzQwXHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHU3MjQ4XHU2NzJDXHU1M0Y3XG4gKiBcdTRGMThcdTUxNDhcdTRFQ0VcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdThCRkJcdTUzRDZcdUZGMENcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDlcdTUyMTlcdTRFQ0VcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdTY1ODdcdTRFRjZcdThCRkJcdTUzRDZcdUZGMENcdTkwRkRcdTZDQTFcdTY3MDlcdTUyMTlcdTc1MUZcdTYyMTBcdTY1QjBcdTc2ODRcbiAqL1xuZnVuY3Rpb24gZ2V0QnVpbGRUaW1lc3RhbXAoKTogc3RyaW5nIHtcbiAgLy8gMS4gXHU0RjE4XHU1MTQ4XHU0RUNFXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU4QkZCXHU1M0Q2XHVGRjA4XHU3NTMxXHU2Nzg0XHU1RUZBXHU4MTFBXHU2NzJDXHU4QkJFXHU3RjZFXHVGRjA5XG4gIGlmIChwcm9jZXNzLmVudi5CVENfQlVJTERfVElNRVNUQU1QKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52LkJUQ19CVUlMRF9USU1FU1RBTVA7XG4gIH1cblxuICAvLyAyLiBcdTRFQ0VcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdTY1ODdcdTRFRjZcdThCRkJcdTUzRDZcdUZGMDhcdTU5ODJcdTY3OUNcdTVCNThcdTU3MjhcdUZGMDlcbiAgY29uc3QgdGltZXN0YW1wRmlsZSA9IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vLi4vLmJ1aWxkLXRpbWVzdGFtcCcpO1xuICBpZiAoZXhpc3RzU3luYyh0aW1lc3RhbXBGaWxlKSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB0aW1lc3RhbXAgPSByZWFkRmlsZVN5bmModGltZXN0YW1wRmlsZSwgJ3V0Zi04JykudHJpbSgpO1xuICAgICAgaWYgKHRpbWVzdGFtcCkge1xuICAgICAgICByZXR1cm4gdGltZXN0YW1wO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBcdTVGRkRcdTc1NjVcdThCRkJcdTUzRDZcdTk1MTlcdThCRUZcbiAgICB9XG4gIH1cblxuICAvLyAzLiBcdTc1MUZcdTYyMTBcdTY1QjBcdTc2ODRcdTY1RjZcdTk1RjRcdTYyMzNcdTVFNzZcdTRGRERcdTVCNThcdTUyMzBcdTY1ODdcdTRFRjZcdUZGMDhcdTc4NkVcdTRGRERcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTRGN0ZcdTc1MjhcdTU0MENcdTRFMDBcdTRFMkFcdUZGMDlcbiAgLy8gXHU0RjdGXHU3NTI4MzZcdThGREJcdTUyMzZcdTdGMTZcdTc4MDFcdUZGMENcdTc1MUZcdTYyMTBcdTY2RjRcdTc3RURcdTc2ODRcdTcyNDhcdTY3MkNcdTUzRjdcdUZGMDhcdTUzMDVcdTU0MkJcdTVCNTdcdTZCQ0RcdTU0OENcdTY1NzBcdTVCNTdcdUZGMENcdTU5ODIgbDNrMmoxaFx1RkYwOVxuICBjb25zdCB0aW1lc3RhbXAgPSBEYXRlLm5vdygpLnRvU3RyaW5nKDM2KTtcbiAgdHJ5IHtcbiAgICB3cml0ZUZpbGVTeW5jKHRpbWVzdGFtcEZpbGUsIHRpbWVzdGFtcCwgJ3V0Zi04Jyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gXHU1RkZEXHU3NTY1XHU1MTk5XHU1MTY1XHU5NTE5XHU4QkVGXG4gIH1cbiAgcmV0dXJuIHRpbWVzdGFtcDtcbn1cblxuLyoqXG4gKiBcdTRFM0EgSFRNTCBcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTZERkJcdTUyQTBcdTcyNDhcdTY3MkNcdTUzRjdcdTYzRDJcdTRFRjZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFZlcnNpb25QbHVnaW4oKTogUGx1Z2luIHtcbiAgY29uc3QgYnVpbGRUaW1lc3RhbXAgPSBnZXRCdWlsZFRpbWVzdGFtcCgpO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2FkZC12ZXJzaW9uJyxcbiAgICBhcHBseTogJ2J1aWxkJyxcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgY29uc29sZS5pbmZvKGBbYWRkLXZlcnNpb25dIFx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1NzI0OFx1NjcyQ1x1NTNGNzogJHtidWlsZFRpbWVzdGFtcH1gKTtcbiAgICB9LFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEY3Rlx1NzUyOCB0cmFuc2Zvcm1JbmRleEh0bWxcdUZGMDhWaXRlIFx1NTE4NVx1OTBFOFx1NjYyRlx1NTcyOFx1NTQwRVx1N0Y2RVx1OTYzNlx1NkJCNVx1NzUxRlx1NjIxMC9cdTUxOTlcdTUxNjUgaW5kZXguaHRtbFx1RkYwQ2dlbmVyYXRlQnVuZGxlIFx1NUY4OFx1NUJCOVx1NjYxM1x1NjJGRlx1NEUwRFx1NTIzMFx1NjcwMFx1N0VDOCBIVE1MXHVGRjA5XG4gICAgdHJhbnNmb3JtSW5kZXhIdG1sOiB7XG4gICAgICBvcmRlcjogJ3Bvc3QnLFxuICAgICAgaGFuZGxlcihodG1sKSB7XG4gICAgICAgIGxldCBuZXdIdG1sID0gaHRtbDtcbiAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgLy8gMCkgXHU3OUZCXHU5NjY0XHU3QTdBXHU3Njg0IDxzdHlsZT48L3N0eWxlPiBcdTY4MDdcdTdCN0VcbiAgICAgICAgLy8gXHU4QkY0XHU2NjBFXHVGRjFBXHU1NzI4XHU1RkFFXHU1MjREXHU3QUVGXHU2N0I2XHU2Nzg0XHU0RTBCXHVGRjBDXHU1QjUwXHU1RTk0XHU3NTI4XHU1NzI4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU4OEFCIHFpYW5rdW4gXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTNCXHU1RTk0XHU3NTI4XHU1REYyXHU3RUNGXHU2M0QwXHU0RjlCXHU0RTg2IGxvYWRpbmdcdUZGMENcbiAgICAgICAgLy8gXHU1QjUwXHU1RTk0XHU3NTI4XHU3Njg0IHN0eWxlIFx1NjgwN1x1N0I3RVx1NTNFRlx1ODBGRFx1ODhBQlx1NTkwNFx1NzQwNlx1NjIxMFx1N0E3QVx1NzY4NFx1MzAwMlx1NzlGQlx1OTY2NFx1N0E3QVx1NjgwN1x1N0I3RVx1NTNFRlx1NEVFNVx1N0I4MFx1NTMxNiBIVE1MIFx1N0VEM1x1Njc4NFx1MzAwMlxuICAgICAgICAvLyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFMEJcdUZGMENcdTVCNTBcdTVFOTRcdTc1MjhcdTcyRUNcdTdBQ0JcdThGRDBcdTg4NENcdUZGMENzdHlsZSBcdTY4MDdcdTdCN0VcdTY3MDlcdTUxODVcdTVCQjlcdUZGMDhsb2FkaW5nIFx1NjgzN1x1NUYwRlx1RkYwOVx1RkYwQ1x1NEUwRFx1NEYxQVx1ODhBQlx1NzlGQlx1OTY2NFx1MzAwMlxuICAgICAgICBjb25zdCBlbXB0eVN0eWxlUmVnZXggPSAvPHN0eWxlPlxccyo8XFwvc3R5bGU+L2dpO1xuICAgICAgICBpZiAoZW1wdHlTdHlsZVJlZ2V4LnRlc3QobmV3SHRtbCkpIHtcbiAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKGVtcHR5U3R5bGVSZWdleCwgJycpO1xuICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDEpIFx1NEUzQSA8c2NyaXB0IHNyYz4gXHU2REZCXHU1MkEwL1x1NjZGNFx1NjVCMCB2XG4gICAgICAgIC8vXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEUwRFx1ODk4MVx1N0VEOSBFU00gbW9kdWxlIHNjcmlwdFx1RkYwOHR5cGU9XCJtb2R1bGVcIlx1RkYwOVx1OEZGRFx1NTJBMCA/dlxuICAgICAgICAvLyBcdTU0MjZcdTUyMTlcdTU0MENcdTRFMDBcdTRFMkFcdTZBMjFcdTU3NTdcdTRGMUFcdTU0MENcdTY1RjZcdTRFRTVcdTMwMENcdTVFMjYgdlx1MzAwRFx1NTQ4Q1x1MzAwQ1x1NEUwRFx1NUUyNiB2XHUzMDBEXHVGRjA4XHU5NzU5XHU2MDAxIGltcG9ydCBcdTc1MUZcdTYyMTBcdTc2ODQgVVJMXHVGRjA5XHU0RTI0XHU1OTU3IFVSTCBcdTg4QUJcdTUyQTBcdThGN0RcdUZGMENcbiAgICAgICAgLy8gXHU1NzI4XHU1RkFFXHU1MjREXHU3QUVGL1x1OTFDRFx1NTkwRFx1NTJBMFx1OEY3RFx1NTE2NVx1NTNFM1x1ODExQVx1NjcyQ1x1NTczQVx1NjY2Rlx1NEUwQlx1NEYxQVx1NUJGQ1x1ODFGNFx1NkEyMVx1NTc1N1x1NjI2N1x1ODg0Q1x1NEUyNFx1NkIyMVx1RkYwQ1x1NEVDRVx1ODAwQ1x1ODlFNlx1NTNEMVx1N0M3Qlx1NEYzQyBFQ2hhcnRzIFx1NzY4NFx1OTFDRFx1NTkwRFx1NkNFOFx1NTE4Q1x1NjVBRFx1OEEwMFx1MzAwMlxuICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgIC8oPHNjcmlwdFtePl0qXFxzK3NyYz1bXCInXSkoW15cIiddKykoW1wiJ11bXj5dKj4pL2csXG4gICAgICAgICAgKG1hdGNoOiBzdHJpbmcsIHByZWZpeDogc3RyaW5nLCBzcmM6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlzTW9kdWxlU2NyaXB0ID0gL3R5cGVcXHMqPVxccypbXCInXW1vZHVsZVtcIiddL2kudGVzdChtYXRjaCk7XG4gICAgICAgICAgICBjb25zdCBpc0Fzc2V0cyA9IHNyYy5zdGFydHNXaXRoKCcvYXNzZXRzLycpIHx8IHNyYy5zdGFydHNXaXRoKCcuL2Fzc2V0cy8nKTtcblxuICAgICAgICAgICAgLy8gXHU1QkY5IG1vZHVsZSBzY3JpcHRcdUZGMUFcdTVGM0FcdTUyMzZcdTc5RkJcdTk2NjQgdlx1RkYwQ1x1NEZERFx1OEJDMSBVUkwgXHU0RTBFXHU2MjUzXHU1MzA1XHU0RUE3XHU3MjY5XHU1MTg1XHU5MEU4IGltcG9ydCBcdTRGRERcdTYzMDFcdTRFMDBcdTgxRjRcbiAgICAgICAgICAgIGlmIChpc01vZHVsZVNjcmlwdCAmJiBpc0Fzc2V0cykge1xuICAgICAgICAgICAgICBjb25zdCBjbGVhbmVkID0gc3JjLnJlcGxhY2UoL1s/Jl12PVteJidcIl0qL2csICcnKS5yZXBsYWNlKC9cXD8mLywgJz8nKS5yZXBsYWNlKC9bPyZdJC8sICcnKTtcbiAgICAgICAgICAgICAgaWYgKGNsZWFuZWQgIT09IHNyYykge1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2xlYW5lZH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNyYy5pbmNsdWRlcygnP3Y9JykgfHwgc3JjLmluY2x1ZGVzKCcmdj0nKSkge1xuICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkID0gc3JjLnJlcGxhY2UoL1s/Jl12PVteJidcIl0qL2csIGA/dj0ke2J1aWxkVGltZXN0YW1wfWApO1xuICAgICAgICAgICAgICBpZiAodXBkYXRlZCAhPT0gc3JjKSB7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHt1cGRhdGVkfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzQXNzZXRzKSB7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgY29uc3Qgc2VwID0gc3JjLmluY2x1ZGVzKCc/JykgPyAnJicgOiAnPyc7XG4gICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtzcmN9JHtzZXB9dj0ke2J1aWxkVGltZXN0YW1wfSR7c3VmZml4fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyAyKSBcdTRFM0EgPGxpbmsgaHJlZj4gXHU2REZCXHU1MkEwL1x1NjZGNFx1NjVCMCB2XG4gICAgICAgIC8vXG4gICAgICAgIC8vIFx1NTQwQ1x1NEUwQVx1RkYxQW1vZHVsZXByZWxvYWQgXHU1QzVFXHU0RThFIEVTTSBcdTRGOURcdThENTZcdTU2RkVcdTc2ODRcdTRFMDBcdTkwRThcdTUyMDZcdUZGMENcdThGRkRcdTUyQTAgP3YgXHU0RjFBXHU4QkE5XHU5ODg0XHU1MkEwXHU4RjdEIFVSTCBcdTRFMEUgaW1wb3J0IFVSTCBcdTRFMERcdTRFMDBcdTgxRjRcdUZGMENcbiAgICAgICAgLy8gXHU5MDIwXHU2MjEwXHU5MUNEXHU1OTBEXHU4QkY3XHU2QzQyXHU3NTFBXHU4MUYzXHU5MUNEXHU1OTBEXHU2MjY3XHU4ODRDXHVGRjA4XHU1NzI4XHU2N0QwXHU0RTlCIGxvYWRlciBcdTU3M0FcdTY2NkZcdTRFMEJcdUZGMDlcdTMwMDJcbiAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShcbiAgICAgICAgICAvKDxsaW5rW14+XSpcXHMraHJlZj1bXCInXSkoW15cIiddKykoW1wiJ11bXj5dKj4pL2csXG4gICAgICAgICAgKG1hdGNoOiBzdHJpbmcsIHByZWZpeDogc3RyaW5nLCBocmVmOiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpc01vZHVsZVByZWxvYWQgPSAvXFxzcmVsXFxzKj1cXHMqW1wiJ11tb2R1bGVwcmVsb2FkW1wiJ10vaS50ZXN0KG1hdGNoKTtcbiAgICAgICAgICAgIGNvbnN0IGlzQXNzZXRzID0gaHJlZi5zdGFydHNXaXRoKCcvYXNzZXRzLycpIHx8IGhyZWYuc3RhcnRzV2l0aCgnLi9hc3NldHMvJyk7XG5cbiAgICAgICAgICAgIGlmIChpc01vZHVsZVByZWxvYWQgJiYgaXNBc3NldHMpIHtcbiAgICAgICAgICAgICAgY29uc3QgY2xlYW5lZCA9IGhyZWYucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovZywgJycpLnJlcGxhY2UoL1xcPyYvLCAnPycpLnJlcGxhY2UoL1s/Jl0kLywgJycpO1xuICAgICAgICAgICAgICBpZiAoY2xlYW5lZCAhPT0gaHJlZikge1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2xlYW5lZH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGhyZWYuaW5jbHVkZXMoJz92PScpIHx8IGhyZWYuaW5jbHVkZXMoJyZ2PScpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWQgPSBocmVmLnJlcGxhY2UoL1s/Jl12PVteJidcIl0qL2csIGA/dj0ke2J1aWxkVGltZXN0YW1wfWApO1xuICAgICAgICAgICAgICBpZiAodXBkYXRlZCAhPT0gaHJlZikge1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7dXBkYXRlZH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0Fzc2V0cykge1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbnN0IHNlcCA9IGhyZWYuaW5jbHVkZXMoJz8nKSA/ICcmJyA6ICc/JztcbiAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2hyZWZ9JHtzZXB9dj0ke2J1aWxkVGltZXN0YW1wfSR7c3VmZml4fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyAzKSBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MEQgcWlhbmt1biBcdTZDRThcdTUxNjVcdTc2ODRcdTUxODVcdTgwNTQgaW1wb3J0KCcvYXNzZXRzL2luZGV4LXh4eC5qcycpXHVGRjBDXHU5MDdGXHU1MTREXHU4OEFCXHU1QkJGXHU0RTNCXHU1N0RGXHU1NDBEXHU4OUUzXHU2NzkwXG4gICAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1OEZEOVx1OTFDQ1x1NEU1Rlx1NEUwRFx1ODk4MVx1OEZGRFx1NTJBMCA/dlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NUY2Mlx1NjIxMFx1MzAwQ1x1NUUyNiB2IC8gXHU0RTBEXHU1RTI2IHZcdTMwMERcdTRFMjRcdTU5NTdcdTUxNjVcdTUzRTMgVVJMXHVGRjBDXHU1QkZDXHU4MUY0XHU1MTY1XHU1M0UzXHU2QTIxXHU1NzU3XHU4OEFCXHU5MUNEXHU1OTBEXHU2MjY3XHU4ODRDXHUzMDAyXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTcyOCBxaWFua3VuIHNhbmRib3ggXHU0RTJEXHU2NkY0XHU1M0VGXHU5NzYwXHU3Njg0XHU1MTk5XHU2Q0Q1XHU2NjJGXHU3NkY0XHU2M0E1XHU4QkZCXHU1MTY4XHU1QzQwXHU1M0Q4XHU5MUNGIF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fXG4gICAgICAgIC8vIFx1ODAwQ1x1NEUwRFx1NjYyRiB3aW5kb3cuX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX19cdUZGMDh3aW5kb3cgXHU1M0VGXHU4MEZEXHU4OEFCIHByb3h5IFx1OTFDRFx1NTE5OS9cdTRFMERcdTUzMDVcdTU0MkIgbG9jYXRpb25cdUZGMDlcdTMwMDJcbiAgICAgICAgY29uc3Qgb3JpZ2luRXhwciA9XG4gICAgICAgICAgYCgodHlwZW9mIF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fIT09J3VuZGVmaW5lZCcmJl9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fKWAgK1xuICAgICAgICAgIGA/bmV3IFVSTChfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXywodHlwZW9mIGxvY2F0aW9uIT09J3VuZGVmaW5lZCcmJmxvY2F0aW9uLm9yaWdpbil8fCcnKS5vcmlnaW5gICtcbiAgICAgICAgICBgOigodHlwZW9mIGxvY2F0aW9uIT09J3VuZGVmaW5lZCcmJmxvY2F0aW9uLm9yaWdpbil8fCcnKSlgO1xuICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgIC9pbXBvcnRcXChcXHMqKFsnXCJdKShcXC9hc3NldHNcXC8oaW5kZXh8bWFpbiktW14nXCJdKylcXDFcXHMqXFwpL2csXG4gICAgICAgICAgKF9tOiBzdHJpbmcsIF9xOiBzdHJpbmcsIGFic1BhdGg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGBpbXBvcnQoLyogQHZpdGUtaWdub3JlICovICgke29yaWdpbkV4cHJ9ICsgJyR7YWJzUGF0aH0nKSlgO1xuICAgICAgICAgIH0sXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgY29uc29sZS5pbmZvKGBbYWRkLXZlcnNpb25dIFx1NURGMlx1NEUzQSBpbmRleC5odG1sIFx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1NkRGQlx1NTJBMFx1NzI0OFx1NjcyQ1x1NTNGNzogdj0ke2J1aWxkVGltZXN0YW1wfWApO1xuICAgICAgICAgIHJldHVybiBuZXdIdG1sO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgICAgfSxcbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXHJlc29sdmUtbG9nby50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9yZXNvbHZlLWxvZ28udHNcIjsvKipcbiAqIExvZ28gXHU4REVGXHU1Rjg0XHU4OUUzXHU2NzkwXHU2M0QyXHU0RUY2XG4gKiBcdTc1MjhcdTRFOEVcdTU3MjhcdTVCNTBcdTVFOTRcdTc1MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTg5RTNcdTY3OTAgL2xvZ28ucG5nIFx1OERFRlx1NUY4NFxuICogXHU1RjUzIHB1YmxpY0RpciBcdTg4QUJcdTc5ODFcdTc1MjhcdTY1RjZcdUZGMENcdTk3MDBcdTg5ODFcdTYyNEJcdTUyQThcdTg5RTNcdTY3OTAgbG9nby5wbmcgXHU3Njg0XHU4REVGXHU1Rjg0XHU1RTc2XHU1OTBEXHU1MjM2XHU2NTg3XHU0RUY2XG4gKi9cblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFJlc29sdmVkQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyByZXNvbHZlLCBkaXJuYW1lIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBleGlzdHNTeW5jLCBjb3B5RmlsZVN5bmMsIG1rZGlyU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUxvZ29QbHVnaW4oYXBwRGlyOiBzdHJpbmcpOiBQbHVnaW4ge1xuICBsZXQgdml0ZUNvbmZpZzogUmVzb2x2ZWRDb25maWcgfCBudWxsID0gbnVsbDtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdyZXNvbHZlLWxvZ28nLFxuICAgIGFwcGx5OiAnYnVpbGQnLCAvLyBcdTUzRUFcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTYyNjdcdTg4NENcblxuICAgIGNvbmZpZ1Jlc29sdmVkKGNvbmZpZzogUmVzb2x2ZWRDb25maWcpIHtcbiAgICAgIHZpdGVDb25maWcgPSBjb25maWc7XG4gICAgfSxcblxuICAgIHJlc29sdmVJZChpZDogc3RyaW5nKSB7XG4gICAgICAvLyBcdTU5MDRcdTc0MDYgL2xvZ28ucG5nIFx1NjIxNiBsb2dvLnBuZyBcdTc2ODRcdTg5RTNcdTY3OTBcbiAgICAgIGlmIChpZCA9PT0gJy9sb2dvLnBuZycgfHwgaWQgPT09ICdsb2dvLnBuZycpIHtcbiAgICAgICAgLy8gXHU1QzFEXHU4QkQ1XHU0RUNFXHU1MTcxXHU0RUFCXHU3RUM0XHU0RUY2XHU1RTkzXHU4M0I3XHU1M0Q2IGxvZ28ucG5nXG4gICAgICAgIGNvbnN0IHNoYXJlZExvZ29QYXRoID0gcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9wdWJsaWMvbG9nby5wbmcnKTtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoc2hhcmVkTG9nb1BhdGgpKSB7XG4gICAgICAgICAgcmV0dXJuIHNoYXJlZExvZ29QYXRoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU1QzFEXHU4QkQ1XHU0RUNFXHU1RTk0XHU3NTI4XHU4MUVBXHU1REYxXHU3Njg0IHB1YmxpYyBcdTc2RUVcdTVGNTVcdTgzQjdcdTUzRDZcdUZGMDhcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTUzRUZcdTgwRkRcdThGRDhcdTY3MDlcdUZGMDlcbiAgICAgICAgY29uc3QgYXBwTG9nb1BhdGggPSByZXNvbHZlKGFwcERpciwgJ3B1YmxpYy9sb2dvLnBuZycpO1xuICAgICAgICBpZiAoZXhpc3RzU3luYyhhcHBMb2dvUGF0aCkpIHtcbiAgICAgICAgICByZXR1cm4gYXBwTG9nb1BhdGg7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTkwRkRcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdThGRDRcdTU2REVcdTg2NUFcdTYyREZcdTZBMjFcdTU3NTcgSURcbiAgICAgICAgcmV0dXJuIGBcXDBsb2dvLnBuZ2A7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG4gICAgbG9hZChpZDogc3RyaW5nKSB7XG4gICAgICAvLyBcdTU5ODJcdTY3OUNcdTY2MkZcdTg2NUFcdTYyREZcdTZBMjFcdTU3NTdcdUZGMENcdThGRDRcdTU2REVcdTdBN0FcdTUxODVcdTVCQjlcdUZGMDhcdTVCOUVcdTk2NDVcdTY1ODdcdTRFRjZcdTRGMUFcdTU3MjggY2xvc2VCdW5kbGUgXHU2NUY2XHU1OTBEXHU1MjM2XHVGRjA5XG4gICAgICBpZiAoaWQgPT09ICdcXDBsb2dvLnBuZycpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIGNsb3NlQnVuZGxlKCkge1xuICAgICAgLy8gXHU1NzI4XHU2Nzg0XHU1RUZBXHU1QjhDXHU2MjEwXHU1NDBFXHU1OTBEXHU1MjM2IGxvZ28ucG5nIFx1NTIzMCBkaXN0IFx1NzZFRVx1NUY1NVxuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2aXRlQ29uZmlnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgcm9vdCA9IHZpdGVDb25maWcucm9vdCB8fCBhcHBEaXI7XG5cbiAgICAgICAgLy8gXHU0RjE4XHU1MTQ4XHU0RUNFXHU1MTcxXHU0RUFCXHU3RUM0XHU0RUY2XHU1RTkzXHU4M0I3XHU1M0Q2IGxvZ28ucG5nXG4gICAgICAgIGNvbnN0IHNoYXJlZExvZ29QYXRoID0gcmVzb2x2ZShyb290LCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvcHVibGljL2xvZ28ucG5nJyk7XG4gICAgICAgIGxldCBsb2dvU291cmNlUGF0aDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoc2hhcmVkTG9nb1BhdGgpKSB7XG4gICAgICAgICAgbG9nb1NvdXJjZVBhdGggPSBzaGFyZWRMb2dvUGF0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBcdTVDMURcdThCRDVcdTRFQ0VcdTVFOTRcdTc1MjhcdTgxRUFcdTVERjFcdTc2ODQgcHVibGljIFx1NzZFRVx1NUY1NVx1ODNCN1x1NTNENlxuICAgICAgICAgIGNvbnN0IGFwcExvZ29QYXRoID0gcmVzb2x2ZShyb290LCAncHVibGljL2xvZ28ucG5nJyk7XG4gICAgICAgICAgaWYgKGV4aXN0c1N5bmMoYXBwTG9nb1BhdGgpKSB7XG4gICAgICAgICAgICBsb2dvU291cmNlUGF0aCA9IGFwcExvZ29QYXRoO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbG9nb1NvdXJjZVBhdGgpIHtcbiAgICAgICAgICByZXR1cm47IC8vIFx1NTk4Mlx1Njc5Q1x1NkU5MFx1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1OTc1OVx1OUVEOFx1OERGM1x1OEZDN1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU4M0I3XHU1M0Q2XHU2Nzg0XHU1RUZBXHU4RjkzXHU1MUZBXHU3NkVFXHU1RjU1XG4gICAgICAgIGNvbnN0IG91dERpciA9IHZpdGVDb25maWcuYnVpbGQub3V0RGlyIHx8ICdkaXN0JztcbiAgICAgICAgY29uc3QgZGlzdERpciA9IHJlc29sdmUocm9vdCwgb3V0RGlyKTtcblxuICAgICAgICBpZiAoIWV4aXN0c1N5bmMoZGlzdERpcikpIHtcbiAgICAgICAgICByZXR1cm47IC8vIFx1NTk4Mlx1Njc5Q1x1OEY5M1x1NTFGQVx1NzZFRVx1NUY1NVx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1OERGM1x1OEZDN1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbG9nb0Rlc3RQYXRoID0gcmVzb2x2ZShkaXN0RGlyLCAnbG9nby5wbmcnKTtcblxuICAgICAgICAvLyBcdTc4NkVcdTRGRERcdTc2RUVcdTY4MDdcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjhcbiAgICAgICAgY29uc3QgZGVzdERpciA9IGRpcm5hbWUobG9nb0Rlc3RQYXRoKTtcbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKGRlc3REaXIpKSB7XG4gICAgICAgICAgbWtkaXJTeW5jKGRlc3REaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU1OTBEXHU1MjM2XHU2NTg3XHU0RUY2XG4gICAgICAgIGNvcHlGaWxlU3luYyhsb2dvU291cmNlUGF0aCwgbG9nb0Rlc3RQYXRoKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIFx1OTc1OVx1OUVEOFx1NTkzMVx1OEQyNVx1RkYwQ1x1OTA3Rlx1NTE0RFx1OTYzQlx1NTg1RVx1Njc4NFx1NUVGQVxuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcdXBsb2FkLWljb25zLXRvLW9zcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy91cGxvYWQtaWNvbnMtdG8tb3NzLnRzXCI7LyoqXG4gKiBcdTRFMEFcdTRGMjBcdTU2RkVcdTY4MDdcdTY1ODdcdTRFRjZcdTUyMzAgT1NTIFx1NzY4NCBWaXRlIFx1NjNEMlx1NEVGNlxuICogXHU1NzI4XHU3NTFGXHU0RUE3XHU2Nzg0XHU1RUZBXHU1QjhDXHU2MjEwXHU1NDBFXHVGRjBDXHU4MUVBXHU1MkE4XHU0RTBBXHU0RjIwXHU1NkZFXHU2ODA3XHU2NTg3XHU0RUY2XHU1MjMwIE9TU1x1RkYwOFx1NTdGQVx1NEU4RVx1NjU4N1x1NEVGNlx1NjMwN1x1N0VCOVx1NzY4NFx1NTg5RVx1OTFDRlx1NEUwQVx1NEYyMFx1RkYwOVxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbdXBsb2FkLWljb25zLXRvLW9zc10nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW3VwbG9hZC1pY29ucy10by1vc3NdJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbdXBsb2FkLWljb25zLXRvLW9zc10nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW3VwbG9hZC1pY29ucy10by1vc3NdJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgUmVzb2x2ZWRDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHNwYXduIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSByZXNvbHZlKF9fZmlsZW5hbWUsICcuLicpO1xuY29uc3QgcHJvamVjdFJvb3QgPSByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uLy4uJyk7XG5cbmZ1bmN0aW9uIHRyeUxvYWRPc3NDcmVkc0Zyb21XaW5kb3dzQ3JlZGVudGlhbE1hbmFnZXIoKTogdm9pZCB7XG4gIC8vIFx1NTNFQVx1NTcyOCBXaW5kb3dzIFx1NEUxNFx1N0YzQVx1NUMxMVx1NTFFRFx1OEJDMVx1NjVGNlx1NUMxRFx1OEJENVxuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ3dpbjMyJykgcmV0dXJuO1xuICBpZiAocHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQgJiYgcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUKSByZXR1cm47XG5cbiAgdHJ5IHtcbiAgICAvLyBcdTkwMUFcdThGQzcgUG93ZXJTaGVsbCArIENyZWRlbnRpYWxNYW5hZ2VyIFx1OEJGQlx1NTNENlx1RkYwOFx1NEUwRFx1OEY5M1x1NTFGQVx1NjYwRVx1NjU4N1x1NTIzMFx1NjVFNVx1NUZEN1x1RkYwOVxuICAgIGNvbnN0IHBzID0gW1xuICAgICAgYCRFcnJvckFjdGlvblByZWZlcmVuY2U9J1N0b3AnYCxcbiAgICAgIGBJbXBvcnQtTW9kdWxlIENyZWRlbnRpYWxNYW5hZ2VyYCxcbiAgICAgIGAkaWQ9KEdldC1TdG9yZWRDcmVkZW50aWFsIC1UYXJnZXQgJ0FsaWJhYmFDbG91ZCcgLUVycm9yQWN0aW9uIFNpbGVudGx5Q29udGludWUpLkdldE5ldHdvcmtDcmVkZW50aWFsKCkuUGFzc3dvcmRgLFxuICAgICAgYCRzZWM9KEdldC1TdG9yZWRDcmVkZW50aWFsIC1UYXJnZXQgJ0FsaWJhYmFDbG91ZFNlY3JldCcgLUVycm9yQWN0aW9uIFNpbGVudGx5Q29udGludWUpLkdldE5ldHdvcmtDcmVkZW50aWFsKCkuUGFzc3dvcmRgLFxuICAgICAgYCRvdXQ9W3BzY3VzdG9tb2JqZWN0XUB7IGlkPSRpZDsgc2VjcmV0PSRzZWMgfSB8IENvbnZlcnRUby1Kc29uIC1Db21wcmVzc2AsXG4gICAgICBgV3JpdGUtT3V0cHV0ICRvdXRgLFxuICAgIF0uam9pbignOyAnKTtcblxuICAgIGNvbnN0IHJhdyA9IGV4ZWNTeW5jKGBwb3dlcnNoZWxsIC1Ob1Byb2ZpbGUgLU5vbkludGVyYWN0aXZlIC1Db21tYW5kIFwiJHtwcy5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyl9XCJgLCB7XG4gICAgICBzdGRpbzogWydpZ25vcmUnLCAncGlwZScsICdpZ25vcmUnXSxcbiAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgfSk7XG5cbiAgICBjb25zdCBqc29uVGV4dCA9IChyYXcgfHwgJycpLnRyaW0oKTtcbiAgICBpZiAoIWpzb25UZXh0KSByZXR1cm47XG5cbiAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGpzb25UZXh0KSBhcyB7IGlkPzogc3RyaW5nOyBzZWNyZXQ/OiBzdHJpbmcgfTtcbiAgICBpZiAocGFyc2VkPy5pZCAmJiAhcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQpIHByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX0lEID0gcGFyc2VkLmlkO1xuICAgIGlmIChwYXJzZWQ/LnNlY3JldCAmJiAhcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUKSBwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQgPSBwYXJzZWQuc2VjcmV0O1xuICB9IGNhdGNoIHtcbiAgICAvLyBcdTk3NTlcdTlFRDhcdTU5MzFcdThEMjVcdUZGMUFcdTRFMERcdTk2M0JcdTU4NUVcdTY3ODRcdTVFRkFcdTZENDFcdTdBMEJcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBsb2FkSWNvbnNUb09zc1BsdWdpbigpOiBQbHVnaW4ge1xuICBsZXQgaXNQcm9kdWN0aW9uQnVpbGQgPSBmYWxzZTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICd1cGxvYWQtaWNvbnMtdG8tb3NzJyxcbiAgICBhcHBseTogJ2J1aWxkJywgLy8gXHU1M0VBXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU2MjY3XHU4ODRDXG5cbiAgICBjb25maWdSZXNvbHZlZChjb25maWc6IFJlc29sdmVkQ29uZmlnKSB7XG4gICAgICAvLyBWaXRlIFx1NzY4NCBpc1Byb2R1Y3Rpb24gXHU2NjJGXHU2NzAwXHU1M0VGXHU5NzYwXHU3Njg0XHU1MjI0XHU2NUFEXHVGRjA4XHU5MDdGXHU1MTREIE5PREVfRU5WIC8gREVWIFx1N0I0OVx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1NTcyOCBDSSBcdTRFMkRcdTRFMERcdTRFMDBcdTgxRjRcdUZGMDlcbiAgICAgIGlzUHJvZHVjdGlvbkJ1aWxkID0gISFjb25maWcuaXNQcm9kdWN0aW9uO1xuICAgIH0sXG5cbiAgICBhc3luYyBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgIC8vIFx1NTNFQVx1NTcyOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1Njc4NFx1NUVGQVx1NjVGNlx1NEUwQVx1NEYyMFxuICAgICAgaWYgKCFpc1Byb2R1Y3Rpb25CdWlsZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFdpbmRvd3MgXHU2NzJDXHU1NzMwXHU2Nzg0XHU1RUZBXHVGRjFBXHU1OTgyXHU2NzlDXHU2NzJBXHU2NjNFXHU1RjBGXHU4QkJFXHU3RjZFIGVudi8uZW52Lm9zc1x1RkYwQ1x1NUMxRFx1OEJENVx1NEVDRVx1NTFFRFx1OEJDMVx1N0JBMVx1NzQwNlx1NTY2OFx1OEJGQlx1NTNENlxuICAgICAgdHJ5TG9hZE9zc0NyZWRzRnJvbVdpbmRvd3NDcmVkZW50aWFsTWFuYWdlcigpO1xuXG4gICAgICAvLyBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTY3MDkgT1NTIFx1OTE0RFx1N0Y2RVxuICAgICAgaWYgKCFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9JRCB8fCAhcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUKSB7XG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOVx1NEUwQVx1NEYyMFx1RkYwQ2FsbC5iZWxsaXMuY29tLmNuIFx1NEVFM1x1NzQwNlx1NTIzMCBPU1MgXHU1QzA2XHU4RkQ0XHU1NkRFIE5vU3VjaEtleVx1RkYwOGxvZ28ucG5nIC8gaWNvbnMvKlx1RkYwOVxuICAgICAgICBjb25zb2xlLndhcm4oJ1t1cGxvYWQtaWNvbnMtdG8tb3NzXSBcdTI2QTBcdUZFMEYgIFx1OERGM1x1OEZDN1x1NEUwQVx1NEYyMFx1RkYwOFx1NjcyQVx1OTE0RFx1N0Y2RSBPU1MgXHU1MUVEXHU4QkMxXHVGRjA5XHUzMDAyXHU4RkQ5XHU0RjFBXHU1QkZDXHU4MUY0IGh0dHBzOi8vYWxsLmJlbGxpcy5jb20uY24vbG9nby5wbmcgXHU4RkQ0XHU1NkRFIE5vU3VjaEtleScpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTcyOCBDSSBcdTRFMkRcdTVGQzVcdTk4N0JcdTdCNDlcdTVGODVcdTRFMEFcdTRGMjBcdTVCOENcdTYyMTBcdUZGMENcdTU0MjZcdTUyMTlcdTY3ODRcdTVFRkFcdThGREJcdTdBMEJcdTkwMDBcdTUxRkFcdTRGMUFcdTc2RjRcdTYzQTVcdTdFQzhcdTZCNjJcdTVCNTBcdThGREJcdTdBMEJcdUZGMENcdTVCRkNcdTgxRjRcdTY1ODdcdTRFRjZcdTY3MkFcdTRFMEFcdTRGMjBcbiAgICAgIGNvbnN0IHVwbG9hZFNjcmlwdCA9IHJlc29sdmUocHJvamVjdFJvb3QsICdzY3JpcHRzL3VwbG9hZC1pY29ucy10by1vc3MubWpzJyk7XG4gICAgICBjb25zb2xlLmluZm8oJ1t1cGxvYWQtaWNvbnMtdG8tb3NzXSBcdUQ4M0RcdURFODAgXHU1RjAwXHU1OUNCXHU0RTBBXHU0RjIwXHU1NkZFXHU2ODA3XHU2NTg3XHU0RUY2XHU1MjMwIE9TUy4uLicpO1xuXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZVByb21pc2UsIHJlamVjdFByb21pc2UpID0+IHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBzcGF3bignbm9kZScsIFt1cGxvYWRTY3JpcHRdLCB7XG4gICAgICAgICAgc3RkaW86ICdpbmhlcml0JyxcbiAgICAgICAgICBzaGVsbDogdHJ1ZSxcbiAgICAgICAgICBlbnY6IHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNoaWxkLm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgICAgIHJlamVjdFByb21pc2UoZXJyb3IpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjaGlsZC5vbignZXhpdCcsIChjb2RlKSA9PiB7XG4gICAgICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnW3VwbG9hZC1pY29ucy10by1vc3NdIFx1MjcwNSBcdTU2RkVcdTY4MDdcdTY1ODdcdTRFRjZcdTRFMEFcdTRGMjBcdTVCOENcdTYyMTAnKTtcbiAgICAgICAgICAgIHJlc29sdmVQcm9taXNlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFx1OUVEOFx1OEJBNFx1NEUwRFx1OTYzQlx1NTg1RVx1Njc4NFx1NUVGQVx1RkYxQWxheW91dC1hcHAgZGlzdCBcdTkxQ0NcdTRFQ0RcdTY3MDkgaWNvbnMvbG9nbyBcdTRGNUNcdTRFM0FcdTY3MkNcdTU3MzBcdTU0MEVcdTU5MDdcdUZGMENcdTkwN0ZcdTUxNEQgNDA0XG4gICAgICAgICAgICAvLyBcdTU5ODJcdTk3MDBcdTRFMjVcdTY4M0NcdTU5MzFcdThEMjVcdUZGMDhDSSBcdTVGM0FcdTUyMzZcdTRFMEFcdTRGMjBcdTYyMTBcdTUyOUZcdUZGMDlcdUZGMENcdThCQkVcdTdGNkUgT1NTX1VQTE9BRF9TVFJJQ1Q9dHJ1ZVxuICAgICAgICAgICAgY29uc3Qgc3RyaWN0ID0gcHJvY2Vzcy5lbnYuT1NTX1VQTE9BRF9TVFJJQ1QgPT09ICd0cnVlJztcbiAgICAgICAgICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcihgW3VwbG9hZC1pY29ucy10by1vc3NdIFx1NEUwQVx1NEYyMFx1ODExQVx1NjcyQ1x1OTAwMFx1NTFGQVx1RkYwQ1x1NEVFM1x1NzgwMTogJHtjb2RlID8/ICd1bmtub3duJ31gKTtcbiAgICAgICAgICAgIGlmIChzdHJpY3QpIHtcbiAgICAgICAgICAgICAgcmVqZWN0UHJvbWlzZShlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZVByb21pc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxyZXBsYWNlLWljb25zLXdpdGgtY2RuLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3JlcGxhY2UtaWNvbnMtd2l0aC1jZG4udHNcIjsvKipcbiAqIFx1NUMwNiBpbmRleC5odG1sIFx1NEUyRFx1NzY4NFx1NTZGRVx1NjgwN1x1OERFRlx1NUY4NFx1NjZGRlx1NjM2Mlx1NEUzQSBDRE4gVVJMIFx1NzY4NCBWaXRlIFx1NjNEMlx1NEVGNlxuICogXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU0RjdGXHU3NTI4IENETlx1RkYwQ1x1NUYwMFx1NTNEMS9cdTk4ODRcdTg5QzhcdTczQUZcdTU4ODNcdTRGRERcdTYzMDFcdTY3MkNcdTU3MzBcdThERUZcdTVGODRcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW3JlcGxhY2UtaWNvbnMtd2l0aC1jZG5dJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1tyZXBsYWNlLWljb25zLXdpdGgtY2RuXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW3JlcGxhY2UtaWNvbnMtd2l0aC1jZG5dJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1tyZXBsYWNlLWljb25zLXdpdGgtY2RuXScsIC4uLmFyZ3MpLFxufTtcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFJlc29sdmVkQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZXBsYWNlSWNvbnNXaXRoQ2RuUGx1Z2luKCk6IFBsdWdpbiB7XG4gIGxldCBpc1Byb2R1Y3Rpb25CdWlsZCA9IGZhbHNlO1xuICBsZXQgY2FjaGVkTG9nb0Nkbk9rOiBib29sZWFuIHwgbnVsbCA9IG51bGw7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAncmVwbGFjZS1pY29ucy13aXRoLWNkbicsXG4gICAgYXBwbHk6ICdidWlsZCcsIC8vIFx1NTNFQVx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NjI2N1x1ODg0Q1xuXG4gICAgY29uZmlnUmVzb2x2ZWQoY29uZmlnOiBSZXNvbHZlZENvbmZpZykge1xuICAgICAgaXNQcm9kdWN0aW9uQnVpbGQgPSAhIWNvbmZpZy5pc1Byb2R1Y3Rpb247XG4gICAgfSxcblxuICAgIGFzeW5jIHRyYW5zZm9ybUluZGV4SHRtbChodG1sKSB7XG4gICAgICAvLyBcdTUzRUFcdTU3MjhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTY3ODRcdTVFRkFcdTY1RjZcdTY2RkZcdTYzNjJcdUZGMDhcdTRGN0ZcdTc1MjggVml0ZSBcdTc2ODQgaXNQcm9kdWN0aW9uXHVGRjBDXHU5MDdGXHU1MTREIENJIFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1NEUwRFx1NEUwMFx1ODFGNFx1RkYwOVxuICAgICAgaWYgKCFpc1Byb2R1Y3Rpb25CdWlsZCkge1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gXHU1RUY2XHU4RkRGXHU1QkZDXHU1MTY1XHVGRjBDXHU5MDdGXHU1MTREXHU1NzI4IHZpdGUuY29uZmlnLnRzIFx1NTJBMFx1OEY3RFx1NjVGNlx1ODlFM1x1Njc5MFx1NTkzMVx1OEQyNVxuICAgICAgICBjb25zdCB7IGdldEVudkNvbmZpZyB9ID0gYXdhaXQgaW1wb3J0KCdAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MvdW5pZmllZC1lbnYtY29uZmlnJyk7XG4gICAgICAgIC8vIFx1ODNCN1x1NTNENlx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVxuICAgICAgICBjb25zdCBlbnZDb25maWcgPSBnZXRFbnZDb25maWcoKTtcbiAgICAgICAgY29uc3QgY2RuVXJsID0gZW52Q29uZmlnLmNkbj8uc3RhdGljQXNzZXRzVXJsO1xuXG4gICAgICAgIGlmICghY2RuVXJsKSB7XG4gICAgICAgICAgLy8gXHU2NzJBXHU5MTREXHU3RjZFIENETlx1RkYwQ1x1NEZERFx1NjMwMVx1NTM5Rlx1NjgzN1xuICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2RuQmFzZSA9IGNkblVybC5yZXBsYWNlKC9cXC8kLywgJycpO1xuXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEVDNVx1NUY1MyBDRE4gXHU0RTBBXHU3ODZFXHU1QjlFXHU1QjU4XHU1NzI4IGxvZ28ucG5nIFx1NjVGNlx1NjI0RFx1NjZGRlx1NjM2MlxuICAgICAgICAvLyBcdTU0MjZcdTUyMTlcdTRGRERcdTc1NTlcdTY3MkNcdTU3MzAgL2xvZ28ucG5nXHVGRjBDXHU1RTc2XHU0RjlEXHU4RDU2XHU1QjUwXHU1RTk0XHU3NTI4IGRpc3QvbG9nby5wbmcgXHU0RjVDXHU0RTNBXHU1NDBFXHU1OTA3XHVGRjBDXHU5MDdGXHU1MTREIDQwNFxuICAgICAgICBpZiAoY2FjaGVkTG9nb0Nkbk9rID09PSBudWxsKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke2NkbkJhc2V9L2xvZ28ucG5nYCwgeyBtZXRob2Q6ICdIRUFEJywgcmVkaXJlY3Q6ICdmb2xsb3cnIH0pO1xuICAgICAgICAgICAgY2FjaGVkTG9nb0Nkbk9rID0gISFyZXMub2s7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICBjYWNoZWRMb2dvQ2RuT2sgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTY2RkZcdTYzNjJcdTU2RkVcdTY4MDdcdThERUZcdTVGODRcbiAgICAgICAgbGV0IG5ld0h0bWwgPSBodG1sO1xuXG4gICAgICAgIC8vIFx1NjZGRlx1NjM2MiAvbG9nby5wbmdcbiAgICAgICAgaWYgKGNhY2hlZExvZ29DZG5Paykge1xuICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgICAvaHJlZj1bXCInXVxcL2xvZ29cXC5wbmdbXCInXS9nLFxuICAgICAgICAgICAgYGhyZWY9XCIke2NkbkJhc2V9L2xvZ28ucG5nXCJgXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1NjZGRlx1NjM2MiAvaWNvbnMvIFx1OERFRlx1NUY4NFxuICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgIC9ocmVmPVtcIiddXFwvaWNvbnNcXC8oW15cIiddKylbXCInXS9nLFxuICAgICAgICAgIChtYXRjaCwgaWNvbkZpbGUpID0+IHtcbiAgICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQXNpdGUud2VibWFuaWZlc3QgXHU1RkM1XHU5ODdCXHU0RkREXHU2MzAxXHU1NDBDXHU2RTkwXHVGRjA4XHU3NTMxXHU1NDA0XHU1QjUwXHU1RTk0XHU3NTI4XHU4MUVBXHU4RUFCXHU2M0QwXHU0RjlCXHVGRjA5XHVGRjBDXHU1NDI2XHU1MjE5XHVGRjFBXG4gICAgICAgICAgICAvLyAtIFx1NEYxQVx1ODlFNlx1NTNEMVx1OERFOFx1NTdERi9DT1JTXG4gICAgICAgICAgICAvLyAtIFBXQSBzdGFydF91cmwgXHU0RjFBXHU0RUU1IENETiBcdTU3REZcdTU0MERcdTRFM0FcdTU3RkFcdTUxQzZcdUZGMENcdTVCRkNcdTgxRjRcdTVCODlcdTg4QzUvXHU1NDJGXHU1MkE4XHU4ODRDXHU0RTNBXHU5NTE5XHU4QkVGXG4gICAgICAgICAgICBpZiAoaWNvbkZpbGUgPT09ICdzaXRlLndlYm1hbmlmZXN0Jykge1xuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYGhyZWY9XCIke2NkbkJhc2V9L2ljb25zLyR7aWNvbkZpbGV9XCJgO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gbmV3SHRtbDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1ODNCN1x1NTNENlx1OTE0RFx1N0Y2RVx1NTkzMVx1OEQyNVx1RkYwQ1x1NEZERFx1NjMwMVx1NTM5Rlx1NjgzN1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tyZXBsYWNlLWljb25zLXdpdGgtY2RuXSBcdTgzQjdcdTUzRDZcdTkxNERcdTdGNkVcdTU5MzFcdThEMjVcdUZGMENcdTRGRERcdTYzMDFcdTUzOUZcdTU2RkVcdTY4MDdcdThERUZcdTVGODQ6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGR1dHktc3RhdGljLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2R1dHktc3RhdGljLnRzXCI7LyoqXG4gKiBEdXR5IFx1OTc1OVx1NjAwMVx1NjU4N1x1NEVGNlx1NjNEMlx1NEVGNlxuICogXHU1NzI4XHU1RjAwXHU1M0QxXHU2NzBEXHU1MkExXHU1NjY4XHU1QzQyXHU5NzYyXHU2MkU2XHU2MjJBIC9kdXR5LyBcdThERUZcdTVGODRcdUZGMENcdTc2RjRcdTYzQTVcdThGRDRcdTU2REUgcHVibGljIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1OTc1OVx1NjAwMSBIVE1MIFx1NjU4N1x1NEVGNlxuICogXHU5MDdGXHU1MTREXHU4RkQ5XHU0RTlCXHU2NTg3XHU0RUY2XHU4OEFCIFZ1ZSBSb3V0ZXIgXHU1OTA0XHU3NDA2XG4gKiBcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdUZGMENcdTVDMDYgcHVibGljIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NCBIVE1MXHUzMDAxQ1NTXHUzMDAxSlMgXHU2NTg3XHU0RUY2XHU1OTBEXHU1MjM2XHU1MjMwIGRpc3QvZHV0eS8gXHU3NkVFXHU1RjU1XG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1tkdXR5LXN0YXRpY10nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW2R1dHktc3RhdGljXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW2R1dHktc3RhdGljXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbZHV0eS1zdGF0aWNdJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgVml0ZURldlNlcnZlciB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHR5cGUgeyBSZXNvbHZlZENvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jLCBleGlzdHNTeW5jLCByZWFkZGlyU3luYywgc3RhdFN5bmMsIGNvcHlGaWxlU3luYywgbWtkaXJTeW5jLCB3cml0ZUZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgam9pbiwgcmVzb2x2ZSwgZXh0bmFtZSB9IGZyb20gJ3BhdGgnO1xuXG4vKipcbiAqIER1dHkgXHU5NzU5XHU2MDAxXHU2NTg3XHU0RUY2XHU2M0QyXHU0RUY2XG4gKiBAcGFyYW0gYXBwRGlyIFx1NUU5NFx1NzUyOFx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICovXG5leHBvcnQgZnVuY3Rpb24gZHV0eVN0YXRpY1BsdWdpbihhcHBEaXI6IHN0cmluZyk6IFBsdWdpbiB7XG4gIGxldCB2aXRlQ29uZmlnOiBSZXNvbHZlZENvbmZpZyB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0IGR1dHlNaWRkbGV3YXJlID0gKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSA9PiB7XG4gICAgLy8gXHU1M0VBXHU1OTA0XHU3NDA2IC9kdXR5LyBcdThERUZcdTVGODRcdTc2ODRcdThCRjdcdTZDNDJcbiAgICBpZiAoIXJlcS51cmwgfHwgIXJlcS51cmwuc3RhcnRzV2l0aCgnL2R1dHkvJykpIHtcbiAgICAgIG5leHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTYzRDBcdTUzRDZcdTY1ODdcdTRFRjZcdTU0MERcdUZGMENcdTRGOEJcdTU5ODIgL2R1dHkvYWdyZWVtZW50Lmh0bWwgLT4gYWdyZWVtZW50Lmh0bWxcbiAgICBjb25zdCBmaWxlTmFtZSA9IHJlcS51cmwucmVwbGFjZSgnL2R1dHkvJywgJycpO1xuXG4gICAgLy8gXHU2Nzg0XHU1RUZBXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHVGRjFBcHVibGljIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NjU4N1x1NEVGNlxuICAgIGNvbnN0IHB1YmxpY0RpciA9IHJlc29sdmUoYXBwRGlyLCAncHVibGljJyk7XG4gICAgY29uc3QgZmlsZVBhdGggPSBqb2luKHB1YmxpY0RpciwgZmlsZU5hbWUpO1xuXG4gICAgLy8gXHU2OEMwXHU2N0U1XHU2NTg3XHU0RUY2XHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XG4gICAgaWYgKCFleGlzdHNTeW5jKGZpbGVQYXRoKSkge1xuICAgICAgLy8gXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU3RUU3XHU3RUVEXHU0RTBCXHU0RTAwXHU0RTJBXHU0RTJEXHU5NUY0XHU0RUY2XHVGRjA4XHU1M0VGXHU4MEZEXHU0RjFBXHU4OEFCIFZ1ZSBSb3V0ZXIgXHU1OTA0XHU3NDA2XHU2MjE2XHU4RkQ0XHU1NkRFIDQwNFx1RkYwOVxuICAgICAgbmV4dCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1OEJGQlx1NTNENlx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBmaWxlQ29udGVudCA9IHJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04Jyk7XG5cbiAgICAgIC8vIFx1OEJCRVx1N0Y2RVx1NkI2M1x1Nzg2RVx1NzY4NCBDb250ZW50LVR5cGVcbiAgICAgIGlmIChmaWxlTmFtZS5lbmRzV2l0aCgnLmh0bWwnKSkge1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sOyBjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICB9IGVsc2UgaWYgKGZpbGVOYW1lLmVuZHNXaXRoKCcuY3NzJykpIHtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvY3NzOyBjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICB9IGVsc2UgaWYgKGZpbGVOYW1lLmVuZHNXaXRoKCcuanMnKSkge1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vamF2YXNjcmlwdDsgY2hhcnNldD11dGYtOCcpO1xuICAgICAgfVxuXG4gICAgICAvLyBcdThGRDRcdTU2REVcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcbiAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xuICAgICAgcmVzLmVuZChmaWxlQ29udGVudCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIFx1OEJGQlx1NTNENlx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNVx1RkYwQ1x1N0VFN1x1N0VFRFx1NEUwQlx1NEUwMFx1NEUyQVx1NEUyRFx1OTVGNFx1NEVGNlxuICAgICAgY29uc29sZS5lcnJvcignW2R1dHktc3RhdGljXSBcdThCRkJcdTUzRDZcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjU6JywgZmlsZVBhdGgsIGVycm9yKTtcbiAgICAgIG5leHQoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnZHV0eS1zdGF0aWMnLFxuICAgIGVuZm9yY2U6ICdwcmUnLCAvLyBcdTU3MjhcdTUxNzZcdTRFRDZcdTYzRDJcdTRFRjZcdTRFNEJcdTUyNERcdTYyNjdcdTg4NENcdUZGMENcdTc4NkVcdTRGRERcdTU3MjggVnVlIFJvdXRlciBcdTRFNEJcdTUyNERcdTU5MDRcdTc0MDZcbiAgICBjb25maWdSZXNvbHZlZChjb25maWc6IFJlc29sdmVkQ29uZmlnKSB7XG4gICAgICB2aXRlQ29uZmlnID0gY29uZmlnO1xuICAgIH0sXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcjogVml0ZURldlNlcnZlcikge1xuICAgICAgLy8gXHU0RjdGXHU3NTI4IHVzZSBcdTZERkJcdTUyQTBcdTRFMkRcdTk1RjRcdTRFRjZcdUZGMENcdTc1MzFcdTRFOEUgZW5mb3JjZTogJ3ByZSdcdUZGMENcdThGRDlcdTRGMUFcdTU3MjggVnVlIFx1NjNEMlx1NEVGNlx1NEU0Qlx1NTI0RFx1NjI2N1x1ODg0Q1xuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShkdXR5TWlkZGxld2FyZSk7XG4gICAgfSxcbiAgICBjb25maWd1cmVQcmV2aWV3U2VydmVyKHNlcnZlcjogVml0ZURldlNlcnZlcikge1xuICAgICAgLy8gXHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHU0RTVGXHU0RjdGXHU3NTI4XHU3NkY4XHU1NDBDXHU3Njg0XHU5MDNCXHU4RjkxXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGR1dHlNaWRkbGV3YXJlKTtcbiAgICB9LFxuICAgIHdyaXRlQnVuZGxlKCkge1xuICAgICAgLy8gXHU2Nzg0XHU1RUZBXHU2NUY2XHVGRjBDXHU1QzA2IHB1YmxpYyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODQgSFRNTFx1MzAwMUNTU1x1MzAwMUpTIFx1NjU4N1x1NEVGNlx1NTkwRFx1NTIzNlx1NTIzMCBkaXN0L2R1dHkvIFx1NzZFRVx1NUY1NVxuICAgICAgaWYgKCF2aXRlQ29uZmlnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcHVibGljRGlyID0gcmVzb2x2ZShhcHBEaXIsICdwdWJsaWMnKTtcbiAgICAgIGlmICghZXhpc3RzU3luYyhwdWJsaWNEaXIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3V0RGlyID0gdml0ZUNvbmZpZy5idWlsZC5vdXREaXIgfHwgJ2Rpc3QnO1xuICAgICAgY29uc3QgZGlzdERpciA9IHJlc29sdmUoYXBwRGlyLCBvdXREaXIpO1xuICAgICAgaWYgKCFleGlzdHNTeW5jKGRpc3REaXIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZHV0eURpciA9IHJlc29sdmUoZGlzdERpciwgJ2R1dHknKTtcbiAgICAgIGlmICghZXhpc3RzU3luYyhkdXR5RGlyKSkge1xuICAgICAgICBta2RpclN5bmMoZHV0eURpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1OTcwMFx1ODk4MVx1NTkwRFx1NTIzNlx1NzY4NFx1NjU4N1x1NEVGNlx1N0M3Qlx1NTc4Qlx1RkYwOFx1NjM5Mlx1OTY2NFx1NTZGRVx1NzI0N1x1RkYwQ1x1NTZGRVx1NzI0N1x1NzUzMSBwdWJsaWNJbWFnZXNUb0Fzc2V0c1BsdWdpbiBcdTU5MDRcdTc0MDZcdUZGMDlcbiAgICAgIGNvbnN0IGR1dHlGaWxlRXh0ZW5zaW9ucyA9IFsnLmh0bWwnLCAnLmNzcycsICcuanMnXTtcbiAgICAgIC8vIFx1NjM5Mlx1OTY2NFx1NzY4NFx1NjU4N1x1NEVGNlx1NTIxN1x1ODg2OFx1RkYwOFx1NTZGRVx1NzI0N1x1NjU4N1x1NEVGNlx1NzUzMVx1NTE3Nlx1NEVENlx1NjNEMlx1NEVGNlx1NTkwNFx1NzQwNlx1RkYwOVxuICAgICAgY29uc3QgZXhjbHVkZWRGaWxlcyA9IFsnbG9nby5wbmcnLCAnbG9naW5fY3V0X2RhcmsucG5nJywgJ2xvZ2luX2N1dF9saWdodC5wbmcnLCAnc2Nhbi5wbmcnLCAnZmF2aWNvbi5pY28nXTtcblxuICAgICAgLy8gXHU4MUVBXHU1MkE4XHU2OEMwXHU2RDRCIHB1YmxpYyBcdTc2RUVcdTVGNTVcdTRFMkRcdTc2ODQgalF1ZXJ5IFx1NjU4N1x1NEVGNlx1RkYwOFx1NEYxOFx1NTE0OFx1NEY3Rlx1NzUyOCAzLnggXHU3QTMzXHU1QjlBXHU3MjQ4XHU2NzJDXHVGRjA5XG4gICAgICBjb25zdCBmaWxlcyA9IHJlYWRkaXJTeW5jKHB1YmxpY0Rpcik7XG4gICAgICBsZXQganF1ZXJ5RmlsZTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gICAgICBjb25zdCBqcXVlcnlGaWxlczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgLy8gXHU2NTM2XHU5NkM2XHU2MjQwXHU2NzA5IGpRdWVyeSBcdTY1ODdcdTRFRjZcbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgICBpZiAoZmlsZS5zdGFydHNXaXRoKCdqcXVlcnknKSAmJiBmaWxlLmVuZHNXaXRoKCcubWluLmpzJykpIHtcbiAgICAgICAgICBqcXVlcnlGaWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NEYxOFx1NTE0OFx1OTAwOVx1NjJFOSAzLnggXHU3MjQ4XHU2NzJDXHVGRjA4XHU3QTMzXHU1QjlBXHU3MjQ4XHVGRjA5XHVGRjBDXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5XHU1MjE5XHU5MDA5XHU2MkU5XHU3QjJDXHU0RTAwXHU0RTJBXG4gICAgICBpZiAoanF1ZXJ5RmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBzdGFibGVWZXJzaW9uID0ganF1ZXJ5RmlsZXMuZmluZChmID0+IGYuaW5jbHVkZXMoJ2pxdWVyeS0zLicpKTtcbiAgICAgICAganF1ZXJ5RmlsZSA9IChzdGFibGVWZXJzaW9uIHx8IGpxdWVyeUZpbGVzWzBdKSA/PyBudWxsO1xuICAgICAgICBpZiAoanF1ZXJ5RmlsZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2R1dHktc3RhdGljXSBcdUQ4M0RcdURDQ0IgXHU2MjdFXHU1MjMwXHU1OTFBXHU0RTJBIGpRdWVyeSBcdTY1ODdcdTRFRjY6ICR7anF1ZXJ5RmlsZXMuam9pbignLCAnKX1gKTtcbiAgICAgICAgICBjb25zb2xlLmluZm8oYFtkdXR5LXN0YXRpY10gXHVEODNEXHVEQ0NDIFx1NEY3Rlx1NzUyODogJHtqcXVlcnlGaWxlfWApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTkwRFx1NTIzNiBqUXVlcnkgXHU2NTg3XHU0RUY2XHVGRjA4XHU1OTgyXHU2NzlDXHU1QjU4XHU1NzI4XHVGRjA5XG4gICAgICBpZiAoanF1ZXJ5RmlsZSkge1xuICAgICAgICBjb25zdCBqcXVlcnlTb3VyY2VQYXRoID0gcmVzb2x2ZShwdWJsaWNEaXIsIGpxdWVyeUZpbGUpO1xuICAgICAgICBjb25zdCBqcXVlcnlEZXN0UGF0aCA9IHJlc29sdmUoZHV0eURpciwganF1ZXJ5RmlsZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29weUZpbGVTeW5jKGpxdWVyeVNvdXJjZVBhdGgsIGpxdWVyeURlc3RQYXRoKTtcbiAgICAgICAgICBjb25zb2xlLmluZm8oYFtkdXR5LXN0YXRpY10gXHVEODNEXHVEQ0U2IFx1NURGMlx1NTkwRFx1NTIzNiAke2pxdWVyeUZpbGV9IFx1NTIzMCBkaXN0L2R1dHkvYCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgW2R1dHktc3RhdGljXSBcdTI2QTBcdUZFMEYgIFx1NTkwRFx1NTIzNiBqUXVlcnkgXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1OmAsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBbZHV0eS1zdGF0aWNdIFx1MjZBMFx1RkUwRiAgXHU4QjY2XHU1NDRBOiBcdTY3MkFcdTYyN0VcdTUyMzAgalF1ZXJ5IFx1NjU4N1x1NEVGNlx1RkYwOGpxdWVyeSoubWluLmpzXHVGRjA5XHU1NzI4IHB1YmxpYyBcdTc2RUVcdTVGNTVgKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGNvcGllZENvdW50ID0gMDtcblxuICAgICAgLy8gXHU1MThEXHU2QjIxXHU4QkZCXHU1M0Q2XHU2NTg3XHU0RUY2XHU1MjE3XHU4ODY4XHVGRjBDXHU3NTI4XHU0RThFXHU1OTBEXHU1MjM2XHU1MTc2XHU0RUQ2XHU2NTg3XHU0RUY2XHVGRjA4XHU0RTBEXHU1MzA1XHU2MkVDalF1ZXJ5XHVGRjBDXHU1NkUwXHU0RTNBXHU1REYyXHU3RUNGXHU1OTBEXHU1MjM2XHU4RkM3XHU0RTg2XHVGRjA5XG4gICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgLy8gXHU4REYzXHU4RkM3XHU2MzkyXHU5NjY0XHU3Njg0XHU2NTg3XHU0RUY2XG4gICAgICAgIGlmIChleGNsdWRlZEZpbGVzLmluY2x1ZGVzKGZpbGUpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdThERjNcdThGQzcgalF1ZXJ5IFx1NjU4N1x1NEVGNlx1RkYwOFx1NURGMlx1N0VDRlx1NTcyOFx1NEUwQVx1OTc2Mlx1NTM1NVx1NzJFQ1x1NTkwNFx1NzQwNlx1NEU4Nlx1RkYwOVxuICAgICAgICBpZiAoanF1ZXJ5RmlsZSAmJiBmaWxlID09PSBqcXVlcnlGaWxlKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBleHQgPSBleHRuYW1lKGZpbGUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChkdXR5RmlsZUV4dGVuc2lvbnMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICAgIGNvbnN0IHNvdXJjZVBhdGggPSByZXNvbHZlKHB1YmxpY0RpciwgZmlsZSk7XG4gICAgICAgICAgY29uc3QgZGVzdFBhdGggPSByZXNvbHZlKGR1dHlEaXIsIGZpbGUpO1xuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gc3RhdFN5bmMoc291cmNlUGF0aCk7XG4gICAgICAgICAgICBpZiAoc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgICAgLy8gXHU1QkY5XHU0RThFSFRNTFx1NjU4N1x1NEVGNlx1RkYwQ1x1OTcwMFx1ODk4MVx1NjZGRlx1NjM2Mlx1NTE3Nlx1NEUyRFx1NzY4NENTU1x1NTQ4Q0pTXHU4REVGXHU1Rjg0XG4gICAgICAgICAgICAgIGlmIChleHQgPT09ICcuaHRtbCcpIHtcbiAgICAgICAgICAgICAgICBsZXQgY29udGVudCA9IHJlYWRGaWxlU3luYyhzb3VyY2VQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgICAgICAgICAvLyBcdTY2RkZcdTYzNjIgalF1ZXJ5IENETiBcdThERUZcdTVGODRcdTRFM0FcdTY3MkNcdTU3MzBcdThERUZcdTVGODRcdUZGMDhcdTY1MkZcdTYzMDFcdTRFRkJcdTYxMEZcdTcyNDhcdTY3MkNcdTc2ODRqUXVlcnkgQ0ROXHU5NEZFXHU2M0E1XHVGRjA5XG4gICAgICAgICAgICAgICAgaWYgKGpxdWVyeUZpbGUpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFx1NjZGRlx1NjM2Mlx1NTQwNFx1NzlDRFx1NTNFRlx1ODBGRFx1NzY4NCBqUXVlcnkgQ0ROIFx1OTRGRVx1NjNBNVx1NjgzQ1x1NUYwRlxuICAgICAgICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgL2h0dHBzOlxcL1xcL2NvZGVcXC5qcXVlcnlcXC5jb21cXC9qcXVlcnktW15cIidcXHNdK1xcLm1pblxcLmpzL2csXG4gICAgICAgICAgICAgICAgICAgIGAvZHV0eS8ke2pxdWVyeUZpbGV9YFxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIC8vIFx1NEU1Rlx1NjZGRlx1NjM2Mlx1NTE3Nlx1NEVENlx1NTNFRlx1ODBGRFx1NzY4NCBDRE4gXHU5NEZFXHU2M0E1XHU2ODNDXHU1RjBGXG4gICAgICAgICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAvaHR0cHM/OlxcL1xcL1teXCInXFxzXSpqcXVlcnlbXlwiJ1xcc10qXFwubWluXFwuanMvZyxcbiAgICAgICAgICAgICAgICAgICAgYC9kdXR5LyR7anF1ZXJ5RmlsZX1gXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBcdTY2RkZcdTYzNjIgQ1NTIFx1OERFRlx1NUY4NFx1RkYxQS9pbmRleC5jc3MgLT4gL2R1dHkvaW5kZXguY3NzXG4gICAgICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvaHJlZj1bXCInXVxcL2luZGV4XFwuY3NzW1wiJ10vZywgJ2hyZWY9XCIvZHV0eS9pbmRleC5jc3NcIicpO1xuICAgICAgICAgICAgICAgIC8vIFx1NjZGRlx1NjM2MiBKUyBcdThERUZcdTVGODRcdUZGMUEvaW5kZXguanMgLT4gL2R1dHkvaW5kZXguanNcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC9zcmM9W1wiJ11cXC9pbmRleFxcLmpzW1wiJ10vZywgJ3NyYz1cIi9kdXR5L2luZGV4LmpzXCInKTtcbiAgICAgICAgICAgICAgICAvLyBcdTY2RkZcdTYzNjIgbG9nbyBcdThERUZcdTVGODRcdUZGMUEvbG9nby5wbmcgLT4gL2xvZ28ucG5nIChcdTRGRERcdTYzMDFcdTY4MzlcdThERUZcdTVGODRcdUZGMENcdTU2RTBcdTRFM0Fsb2dvXHU1NzI4XHU2ODM5XHU3NkVFXHU1RjU1KVxuICAgICAgICAgICAgICAgIC8vIGxvZ28ucG5nIFx1NzUzMSBwdWJsaWNJbWFnZXNUb0Fzc2V0c1BsdWdpbiBcdTU5MDRcdTc0MDZcdUZGMENcdTRGRERcdTYzMDFcdTU3MjhcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMENcdTYyNDBcdTRFRTVcdTRFMERcdTk3MDBcdTg5ODFcdTRGRUVcdTY1MzlcbiAgICAgICAgICAgICAgICB3cml0ZUZpbGVTeW5jKGRlc3RQYXRoLCBjb250ZW50LCAndXRmLTgnKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBDU1MgXHU1NDhDIEpTIFx1NjU4N1x1NEVGNlx1NzZGNFx1NjNBNVx1NTkwRFx1NTIzNlxuICAgICAgICAgICAgICAgIGNvcHlGaWxlU3luYyhzb3VyY2VQYXRoLCBkZXN0UGF0aCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29waWVkQ291bnQrKztcbiAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbZHV0eS1zdGF0aWNdIFx1RDgzRFx1RENFNiBcdTVERjJcdTU5MERcdTUyMzYgJHtmaWxlfSBcdTUyMzAgZGlzdC9kdXR5L2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbZHV0eS1zdGF0aWNdIFx1MjZBMFx1RkUwRiAgXHU1OTBEXHU1MjM2XHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1ICR7ZmlsZX06YCwgZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoY29waWVkQ291bnQgPiAwKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW2R1dHktc3RhdGljXSBcdTI3MDUgXHU2Nzg0XHU1RUZBXHU1QjhDXHU2MjEwXHVGRjFBXHU1REYyXHU1OTBEXHU1MjM2ICR7Y29waWVkQ291bnR9IFx1NEUyQVx1NjU4N1x1NEVGNlx1NTIzMCBkaXN0L2R1dHkvYCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcbG9jYWxlcy1zdGF0aWMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvbG9jYWxlcy1zdGF0aWMudHNcIjsvKipcbiAqIExvY2FsZXMgXHU5NzU5XHU2MDAxXHU2NTg3XHU0RUY2XHU2M0QyXHU0RUY2XG4gKiBcdTU3MjhcdTVGMDBcdTUzRDFcdTY3MERcdTUyQTFcdTU2NjhcdTVDNDJcdTk3NjJcdTYzRDBcdTRGOUIgc3JjL2xvY2FsZXMvKi5qc29uIFx1NjU4N1x1NEVGNlx1RkYwQ1x1NEY5Qlx1NEUzQlx1NUU5NFx1NzUyOFx1OTAxQVx1OEZDNyBmZXRjaCBcdTUyQTBcdThGN0RcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU1NkUwXHU0RTNBIGVzYnVpbGQgXHU2NUUwXHU2Q0Q1XHU2QjYzXHU3ODZFXHU4OUUzXHU2NzkwIHdvcmtzcGFjZSBcdTUzMDVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcdUZGMENcdTkwN0ZcdTUxNERcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdTc2ODRcdTg5RTNcdTY3OTBcdTk1RUVcdTk4OThcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFZpdGVEZXZTZXJ2ZXIgfSBmcm9tICd2aXRlJztcbmltcG9ydCB0eXBlIHsgUmVzb2x2ZWRDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlYWRGaWxlU3luYywgZXhpc3RzU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IGpvaW4sIHJlc29sdmUgfSBmcm9tICdwYXRoJztcblxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU0RjVDXHU0RTNBIGxvZ2dlclx1RkYwQ1x1OTA3Rlx1NTE0RFx1NTcyOFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1ODlFM1x1Njc5MCBAYnRjL3NoYXJlZC1jb3JlXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbbG9jYWxlcy1zdGF0aWNdJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1tsb2NhbGVzLXN0YXRpY10nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1tsb2NhbGVzLXN0YXRpY10nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW2xvY2FsZXMtc3RhdGljXScsIC4uLmFyZ3MpLFxufTtcblxuLyoqXG4gKiBMb2NhbGVzIFx1OTc1OVx1NjAwMVx1NjU4N1x1NEVGNlx1NjNEMlx1NEVGNlxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvY2FsZXNTdGF0aWNQbHVnaW4oYXBwRGlyOiBzdHJpbmcpOiBQbHVnaW4ge1xuICBsZXQgdml0ZUNvbmZpZzogUmVzb2x2ZWRDb25maWcgfCBudWxsID0gbnVsbDtcblxuICBjb25zdCBsb2NhbGVzTWlkZGxld2FyZSA9IChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xuICAgIC8vIFx1NTkwNFx1NzQwNiBPUFRJT05TIFx1OTg4NFx1NjhDMFx1OEJGN1x1NkM0MlxuICAgIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycgJiYgcmVxLnVybD8ubWF0Y2goL15cXC9zcmNcXC9sb2NhbGVzXFwvW14vXStcXC5qc29uJC8pKSB7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlJyk7XG4gICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgIHJlcy5lbmQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTUzRUFcdTU5MDRcdTc0MDYgR0VUIFx1OEJGN1x1NkM0Mlx1NTQ4QyAvc3JjL2xvY2FsZXMvKi5qc29uIFx1OERFRlx1NUY4NFxuICAgIGlmIChyZXEubWV0aG9kICE9PSAnR0VUJyB8fCAhcmVxLnVybCB8fCAhcmVxLnVybC5tYXRjaCgvXlxcL3NyY1xcL2xvY2FsZXNcXC9bXi9dK1xcLmpzb24kLykpIHtcbiAgICAgIG5leHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTYzRDBcdTUzRDZcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcdUZGMENcdTRGOEJcdTU5ODIgL3NyYy9sb2NhbGVzL3poLUNOLmpzb24gLT4gc3JjL2xvY2FsZXMvemgtQ04uanNvblxuICAgIGNvbnN0IGZpbGVQYXRoID0gcmVxLnVybC5yZXBsYWNlKC9eXFwvLywgJycpO1xuXG4gICAgLy8gXHU2Nzg0XHU1RUZBXHU1QjhDXHU2NTc0XHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XG4gICAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlKGFwcERpciwgZmlsZVBhdGgpO1xuXG4gICAgLy8gXHU2OEMwXHU2N0U1XHU2NTg3XHU0RUY2XHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XG4gICAgaWYgKCFleGlzdHNTeW5jKGZ1bGxQYXRoKSkge1xuICAgICAgLy8gXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU4QkIwXHU1RjU1XHU4QjY2XHU1NDRBXHU1RTc2XHU3RUU3XHU3RUVEXHU0RTBCXHU0RTAwXHU0RTJBXHU0RTJEXHU5NUY0XHU0RUY2XG4gICAgICBjb25zb2xlLndhcm4oYFtsb2NhbGVzLXN0YXRpY10gRmlsZSBub3QgZm91bmQ6ICR7ZnVsbFBhdGh9IChyZXF1ZXN0ZWQ6ICR7cmVxLnVybH0pYCk7XG4gICAgICBuZXh0KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU4QkZCXHU1M0Q2XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGYtOCcpO1xuXG4gICAgICAvLyBcdThCQkVcdTdGNkVcdTU0Q0RcdTVFOTRcdTU5MzRcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlJyk7XG5cbiAgICAgIC8vIFx1OEZENFx1NTZERVx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVxuICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICByZXMuZW5kKGNvbnRlbnQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBcdThCRkJcdTUzRDZcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjVcdUZGMENcdTdFRTdcdTdFRURcdTRFMEJcdTRFMDBcdTRFMkFcdTRFMkRcdTk1RjRcdTRFRjZcbiAgICAgIGNvbnNvbGUud2FybihgW2xvY2FsZXMtc3RhdGljXSBGYWlsZWQgdG8gcmVhZCBmaWxlOiAke2Z1bGxQYXRofWAsIGVycm9yKTtcbiAgICAgIG5leHQoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAndml0ZS1wbHVnaW4tbG9jYWxlcy1zdGF0aWMnLFxuXG4gICAgY29uZmlnUmVzb2x2ZWQoY29uZmlnKSB7XG4gICAgICB2aXRlQ29uZmlnID0gY29uZmlnO1xuICAgIH0sXG5cbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyOiBWaXRlRGV2U2VydmVyKSB7XG4gICAgICAvLyBcdTU3MjggVml0ZSBcdTUxODVcdTkwRThcdTRFMkRcdTk1RjRcdTRFRjZcdTRFNEJcdTUyNERcdTYyRTZcdTYyMkFcdThCRjdcdTZDNDJcdUZGMENcdTYzRDBcdTRGOUIgbG9jYWxlcyBcdTY1ODdcdTRFRjZcbiAgICAgIC8vIFx1NEY3Rlx1NzUyOCB1c2UgXHU1QzA2XHU0RTJEXHU5NUY0XHU0RUY2XHU2REZCXHU1MkEwXHU1MjMwXHU0RTJEXHU5NUY0XHU0RUY2XHU2ODA4XHVGRjBDVml0ZSBcdTRGMUFcdTYzMDlcdTcxNjdcdTZDRThcdTUxOENcdTk4N0FcdTVFOEZcdTYyNjdcdTg4NENcbiAgICAgIC8vIFx1NjIxMVx1NEVFQ1x1OTcwMFx1ODk4MVx1NTcyOCBTUEEgZmFsbGJhY2sgXHU0RTRCXHU1MjREXHU1OTA0XHU3NDA2XHVGRjBDXHU2MjQwXHU0RUU1XHU3NkY0XHU2M0E1XHU0RjdGXHU3NTI4IHVzZVxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShsb2NhbGVzTWlkZGxld2FyZSk7XG4gICAgfSxcbiAgfTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFx1cGxvYWQtY2RuLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VwbG9hZC1jZG4udHNcIjsvKipcbiAqIFx1NEUwQVx1NEYyMFx1NUU5NFx1NzUyOFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NTIzMCBDRE4gXHU3Njg0IFZpdGUgXHU2M0QyXHU0RUY2XG4gKiBcdTU3MjhcdTc1MUZcdTRFQTdcdTY3ODRcdTVFRkFcdTVCOENcdTYyMTBcdTU0MEVcdUZGMENcdTgxRUFcdTUyQThcdTRFMEFcdTRGMjBcdTVFOTRcdTc1MjhcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTUyMzAgT1NTL0NETlx1RkYwOFx1NTdGQVx1NEU4RVx1NjU4N1x1NEVGNlx1NjMwN1x1N0VCOVx1NzY4NFx1NTg5RVx1OTFDRlx1NEUwQVx1NEYyMFx1RkYwOVxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbdXBsb2FkLWNkbl0nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW3VwbG9hZC1jZG5dJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbdXBsb2FkLWNkbl0nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW3VwbG9hZC1jZG5dJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgUmVzb2x2ZWRDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHNwYXduIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSByZXNvbHZlKF9fZmlsZW5hbWUsICcuLicpO1xuY29uc3QgcHJvamVjdFJvb3QgPSByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uLy4uJyk7XG5cbmZ1bmN0aW9uIHRyeUxvYWRPc3NDcmVkc0Zyb21XaW5kb3dzQ3JlZGVudGlhbE1hbmFnZXIoKTogdm9pZCB7XG4gIC8vIFx1NTNFQVx1NTcyOCBXaW5kb3dzIFx1NEUxNFx1N0YzQVx1NUMxMVx1NTFFRFx1OEJDMVx1NjVGNlx1NUMxRFx1OEJENVxuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ3dpbjMyJykgcmV0dXJuO1xuICBpZiAocHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQgJiYgcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUKSByZXR1cm47XG5cbiAgdHJ5IHtcbiAgICAvLyBcdTkwMUFcdThGQzcgUG93ZXJTaGVsbCArIENyZWRlbnRpYWxNYW5hZ2VyIFx1OEJGQlx1NTNENlx1RkYwOFx1NEUwRFx1OEY5M1x1NTFGQVx1NjYwRVx1NjU4N1x1NTIzMFx1NjVFNVx1NUZEN1x1RkYwOVxuICAgIGNvbnN0IHBzID0gW1xuICAgICAgYCRFcnJvckFjdGlvblByZWZlcmVuY2U9J1N0b3AnYCxcbiAgICAgIGBJbXBvcnQtTW9kdWxlIENyZWRlbnRpYWxNYW5hZ2VyYCxcbiAgICAgIGAkaWQ9KEdldC1TdG9yZWRDcmVkZW50aWFsIC1UYXJnZXQgJ0FsaWJhYmFDbG91ZCcgLUVycm9yQWN0aW9uIFNpbGVudGx5Q29udGludWUpLkdldE5ldHdvcmtDcmVkZW50aWFsKCkuUGFzc3dvcmRgLFxuICAgICAgYCRzZWM9KEdldC1TdG9yZWRDcmVkZW50aWFsIC1UYXJnZXQgJ0FsaWJhYmFDbG91ZFNlY3JldCcgLUVycm9yQWN0aW9uIFNpbGVudGx5Q29udGludWUpLkdldE5ldHdvcmtDcmVkZW50aWFsKCkuUGFzc3dvcmRgLFxuICAgICAgYCRvdXQ9W3BzY3VzdG9tb2JqZWN0XUB7IGlkPSRpZDsgc2VjcmV0PSRzZWMgfSB8IENvbnZlcnRUby1Kc29uIC1Db21wcmVzc2AsXG4gICAgICBgV3JpdGUtT3V0cHV0ICRvdXRgLFxuICAgIF0uam9pbignOyAnKTtcblxuICAgIGNvbnN0IHJhdyA9IGV4ZWNTeW5jKGBwb3dlcnNoZWxsIC1Ob1Byb2ZpbGUgLU5vbkludGVyYWN0aXZlIC1Db21tYW5kIFwiJHtwcy5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyl9XCJgLCB7XG4gICAgICBzdGRpbzogWydpZ25vcmUnLCAncGlwZScsICdpZ25vcmUnXSxcbiAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgfSk7XG5cbiAgICBjb25zdCBqc29uVGV4dCA9IChyYXcgfHwgJycpLnRyaW0oKTtcbiAgICBpZiAoIWpzb25UZXh0KSByZXR1cm47XG5cbiAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGpzb25UZXh0KSBhcyB7IGlkPzogc3RyaW5nOyBzZWNyZXQ/OiBzdHJpbmcgfTtcbiAgICBpZiAocGFyc2VkPy5pZCAmJiAhcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQpIHByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX0lEID0gcGFyc2VkLmlkO1xuICAgIGlmIChwYXJzZWQ/LnNlY3JldCAmJiAhcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUKSBwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQgPSBwYXJzZWQuc2VjcmV0O1xuICB9IGNhdGNoIHtcbiAgICAvLyBcdTk3NTlcdTlFRDhcdTU5MzFcdThEMjVcdUZGMUFcdTRFMERcdTk2M0JcdTU4NUVcdTY3ODRcdTVFRkFcdTZENDFcdTdBMEJcbiAgfVxufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBDRE4gXHU0RTBBXHU0RjIwXHU2M0QyXHU0RUY2XG4gKiBAcGFyYW0gYXBwTmFtZSBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcdUZGMDhcdTU5ODIgJ3N5c3RlbS1hcHAnXHVGRjA5XG4gKiBAcGFyYW0gYXBwRGlyIFx1NUU5NFx1NzUyOFx1NzZFRVx1NUY1NVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBsb2FkQ2RuUGx1Z2luKGFwcE5hbWU6IHN0cmluZywgX2FwcERpcjogc3RyaW5nKTogUGx1Z2luIHtcbiAgbGV0IGlzUHJvZHVjdGlvbkJ1aWxkID0gZmFsc2U7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAndXBsb2FkLWNkbicsXG4gICAgYXBwbHk6ICdidWlsZCcsIC8vIFx1NTNFQVx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NjI2N1x1ODg0Q1xuXG4gICAgY29uZmlnUmVzb2x2ZWQoY29uZmlnOiBSZXNvbHZlZENvbmZpZykge1xuICAgICAgLy8gVml0ZSBcdTc2ODQgaXNQcm9kdWN0aW9uIFx1NjYyRlx1NjcwMFx1NTNFRlx1OTc2MFx1NzY4NFx1NTIyNFx1NjVBRFx1RkYwOFx1OTA3Rlx1NTE0RCBOT0RFX0VOViAvIERFViBcdTdCNDlcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdTU3MjggQ0kgXHU0RTJEXHU0RTBEXHU0RTAwXHU4MUY0XHVGRjA5XG4gICAgICBpc1Byb2R1Y3Rpb25CdWlsZCA9ICEhY29uZmlnLmlzUHJvZHVjdGlvbjtcbiAgICB9LFxuXG4gICAgYXN5bmMgY2xvc2VCdW5kbGUoKSB7XG4gICAgICAvLyBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTU0MkZcdTc1MjggQ0ROIFx1NEUwQVx1NEYyMFxuICAgICAgaWYgKHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fVVBMT0FEICE9PSAndHJ1ZScpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdThERjNcdThGQzdcdTRFMEFcdTRGMjBcbiAgICAgIGlmIChwcm9jZXNzLmVudi5TS0lQX0NETl9VUExPQUQgPT09ICd0cnVlJykge1xuICAgICAgICBjb25zb2xlLmluZm8oYFt1cGxvYWQtY2RuXSBcdTIzRURcdUZFMEYgIFx1OERGM1x1OEZDNyAke2FwcE5hbWV9IFx1NzY4NCBDRE4gXHU0RTBBXHU0RjIwXHVGRjA4U0tJUF9DRE5fVVBMT0FEPXRydWVcdUZGMDlgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTUzRUFcdTU3MjhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTY3ODRcdTVFRkFcdTY1RjZcdTRFMEFcdTRGMjBcbiAgICAgIGlmICghaXNQcm9kdWN0aW9uQnVpbGQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBXaW5kb3dzIFx1NjcyQ1x1NTczMFx1Njc4NFx1NUVGQVx1RkYxQVx1NTk4Mlx1Njc5Q1x1NjcyQVx1NjYzRVx1NUYwRlx1OEJCRVx1N0Y2RSBlbnYvLmVudi5vc3NcdUZGMENcdTVDMURcdThCRDVcdTRFQ0VcdTUxRURcdThCQzFcdTdCQTFcdTc0MDZcdTU2NjhcdThCRkJcdTUzRDZcbiAgICAgIHRyeUxvYWRPc3NDcmVkc0Zyb21XaW5kb3dzQ3JlZGVudGlhbE1hbmFnZXIoKTtcblxuICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU2NzA5IE9TUyBcdTkxNERcdTdGNkVcbiAgICAgIGlmICghcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQgfHwgIXByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX1NFQ1JFVCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYFt1cGxvYWQtY2RuXSBcdTI2QTBcdUZFMEYgIFx1OERGM1x1OEZDNyAke2FwcE5hbWV9IFx1NzY4NCBDRE4gXHU0RTBBXHU0RjIwXHVGRjA4XHU2NzJBXHU5MTREXHU3RjZFIE9TUyBcdTUxRURcdThCQzFcdUZGMDlgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU3MjggQ0kgXHU0RTJEXHU1RkM1XHU5ODdCXHU3QjQ5XHU1Rjg1XHU0RTBBXHU0RjIwXHU1QjhDXHU2MjEwXHVGRjBDXHU1NDI2XHU1MjE5XHU2Nzg0XHU1RUZBXHU4RkRCXHU3QTBCXHU5MDAwXHU1MUZBXHU0RjFBXHU3NkY0XHU2M0E1XHU3RUM4XHU2QjYyXHU1QjUwXHU4RkRCXHU3QTBCXHVGRjBDXHU1QkZDXHU4MUY0XHU2NTg3XHU0RUY2XHU2NzJBXHU0RTBBXHU0RjIwXG4gICAgICBjb25zdCB1cGxvYWRTY3JpcHQgPSByZXNvbHZlKHByb2plY3RSb290LCAnc2NyaXB0cy91cGxvYWQtYXBwLXRvLWNkbi5tanMnKTtcbiAgICAgIGNvbnNvbGUuaW5mbyhgW3VwbG9hZC1jZG5dIFx1RDgzRFx1REU4MCBcdTVGMDBcdTU5Q0JcdTRFMEFcdTRGMjAgJHthcHBOYW1lfSBcdTUyMzAgQ0ROLi4uYCk7XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlUHJvbWlzZSwgcmVqZWN0UHJvbWlzZSkgPT4ge1xuICAgICAgICBjb25zdCBjaGlsZCA9IHNwYXduKCdub2RlJywgW3VwbG9hZFNjcmlwdCwgYXBwTmFtZV0sIHtcbiAgICAgICAgICBzdGRpbzogJ2luaGVyaXQnLFxuICAgICAgICAgIHNoZWxsOiB0cnVlLFxuICAgICAgICAgIGVudjoge1xuICAgICAgICAgICAgLi4ucHJvY2Vzcy5lbnYsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2hpbGQub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICAgICAgcmVqZWN0UHJvbWlzZShlcnJvcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNoaWxkLm9uKCdleGl0JywgKGNvZGUpID0+IHtcbiAgICAgICAgICBpZiAoY29kZSA9PT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbdXBsb2FkLWNkbl0gXHUyNzA1ICR7YXBwTmFtZX0gXHU0RTBBXHU0RjIwXHU1QjhDXHU2MjEwYCk7XG4gICAgICAgICAgICByZXNvbHZlUHJvbWlzZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBcdTlFRDhcdThCQTRcdTRFMERcdTk2M0JcdTU4NUVcdTY3ODRcdTVFRkFcdUZGMUFcdTU5ODJcdTk3MDBcdTRFMjVcdTY4M0NcdTU5MzFcdThEMjVcdUZGMDhDSSBcdTVGM0FcdTUyMzZcdTRFMEFcdTRGMjBcdTYyMTBcdTUyOUZcdUZGMDlcdUZGMENcdThCQkVcdTdGNkUgT1NTX1VQTE9BRF9TVFJJQ1Q9dHJ1ZVxuICAgICAgICAgICAgY29uc3Qgc3RyaWN0ID0gcHJvY2Vzcy5lbnYuT1NTX1VQTE9BRF9TVFJJQ1QgPT09ICd0cnVlJztcbiAgICAgICAgICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcihgW3VwbG9hZC1jZG5dICR7YXBwTmFtZX0gXHU0RTBBXHU0RjIwXHU4MTFBXHU2NzJDXHU5MDAwXHU1MUZBXHVGRjBDXHU0RUUzXHU3ODAxOiAke2NvZGUgPz8gJ3Vua25vd24nfWApO1xuICAgICAgICAgICAgaWYgKHN0cmljdCkge1xuICAgICAgICAgICAgICByZWplY3RQcm9taXNlKGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICByZXNvbHZlUHJvbWlzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGNkbi1hc3NldHMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvY2RuLWFzc2V0cy50c1wiOy8qKlxuICogQ0ROIFx1OEQ0NFx1NkU5MFx1NTJBMFx1OTAxRlx1NjNEMlx1NEVGNlxuICogXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU0RkVFXHU2NTM5IEhUTUwgXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwIFVSTFx1RkYwQ1x1NUMwNlx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1OEY2Q1x1NjM2Mlx1NEUzQSBDRE4gVVJMXG4gKiBcdTY1MkZcdTYzMDFcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdThENDRcdTZFOTAgKC9hc3NldHMvKSBcdTU0OENcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjhcdThENDRcdTZFOTAgKC9hc3NldHMvbGF5b3V0LylcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW2Nkbi1hc3NldHNdJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1tjZG4tYXNzZXRzXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW2Nkbi1hc3NldHNdJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1tjZG4tYXNzZXRzXScsIC4uLmFyZ3MpLFxufTtcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuZXhwb3J0IGludGVyZmFjZSBDZG5Bc3NldHNQbHVnaW5PcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NTk4MiAnYWRtaW4tYXBwJ1x1RkYwOVxuICAgKi9cbiAgYXBwTmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4IENETiBcdTUyQTBcdTkwMUZcdUZGMDhcdTlFRDhcdThCQTRcdUZGMUFcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTU0MkZcdTc1MjhcdUZGMDlcbiAgICovXG4gIGVuYWJsZWQ/OiBib29sZWFuO1xuICAvKipcbiAgICogQ0ROIFx1NTdERlx1NTQwRFx1RkYwOFx1OUVEOFx1OEJBNFx1RkYxQWFsbC5iZWxsaXMuY29tLmNuXHVGRjA5XG4gICAqL1xuICBjZG5Eb21haW4/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQ0ROIFx1OEQ0NFx1NkU5MFx1NTJBMFx1OTAxRlx1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2RuQXNzZXRzUGx1Z2luKG9wdGlvbnM6IENkbkFzc2V0c1BsdWdpbk9wdGlvbnMpOiBQbHVnaW4ge1xuICBjb25zdCB7XG4gICAgYXBwTmFtZSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTlFRDhcdThCQTRcdTU0MkZcdTc1MjhcdTY3NjFcdTRFRjZcdTVGQzVcdTk4N0JcdTY2MEVcdTc4NkVcdTY4QzBcdTY3RTUgRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXG4gICAgLy8gXHU1OTgyXHU2NzlDIEVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OIFx1ODhBQlx1OEJCRVx1N0Y2RVx1NEUzQSAnZmFsc2UnXHVGRjBDXHU1MjE5XHU3OTgxXHU3NTI4IENETlxuICAgIC8vIFx1NTNFQVx1NjcwOVx1NTcyOFx1NjYwRVx1Nzg2RVx1NTQyRlx1NzUyOFx1RkYwOEVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OPXRydWVcdUZGMDlcdTYyMTZcdTY3MkFcdThCQkVcdTdGNkVcdTRFMTRcdTY2MkZcdTc1MUZcdTRFQTdcdTY3ODRcdTVFRkFcdTY1RjZcdUZGMENcdTYyNERcdTU0MkZcdTc1MjggQ0ROXG4gICAgZW5hYmxlZCA9IHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OID09PSAndHJ1ZScgfHwgXG4gICAgICAgICAgICAgIChwcm9jZXNzLmVudi5FTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiAhPT0gJ2ZhbHNlJyAmJiBcbiAgICAgICAgICAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgJiYgXG4gICAgICAgICAgICAgICBwcm9jZXNzLmVudi5WSVRFX1BSRVZJRVcgIT09ICd0cnVlJyksXG4gICAgY2RuRG9tYWluID0gJ2h0dHBzOi8vYWxsLmJlbGxpcy5jb20uY24nLFxuICB9ID0gb3B0aW9ucztcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjZG4tYXNzZXRzJyxcbiAgICBhcHBseTogJ2J1aWxkJyxcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGBbY2RuLWFzc2V0c10gQ0ROIFx1NTJBMFx1OTAxRlx1NURGMlx1NTQyRlx1NzUyOFx1RkYwQ1x1NUU5NFx1NzUyODogJHthcHBOYW1lfSwgQ0ROIFx1NTdERlx1NTQwRDogJHtjZG5Eb21haW59YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtjZG4tYXNzZXRzXSBDRE4gXHU1MkEwXHU5MDFGXHU1REYyXHU3OTgxXHU3NTI4YCk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0cmFuc2Zvcm1JbmRleEh0bWw6IHtcbiAgICAgIG9yZGVyOiAncG9zdCcsIC8vIFx1NTcyOCBhZGRWZXJzaW9uUGx1Z2luIFx1NEU0Qlx1NTQwRVx1NjI2N1x1ODg0Q1xuICAgICAgaGFuZGxlcihodG1sKSB7XG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTM3M1x1NEY3RiBDRE4gXHU2M0QyXHU0RUY2XHU4OEFCXHU3OTgxXHU3NTI4XHVGRjBDXHU1OTgyXHU2NzlDXHU2NjJGXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHVGRjBDXHU0RTVGXHU5NzAwXHU4OTgxXHU2Q0U4XHU1MTY1XHU2NUU5XHU2NzFGIFVSTCBcdThGNkNcdTYzNjJcdTgxMUFcdTY3MkNcbiAgICAgICAgLy8gXHU1NkUwXHU0RTNBXHU5ODg0XHU4OUM4XHU3M0FGXHU1ODgzXHU1M0VGXHU4MEZEXHU0RjdGXHU3NTI4XHU0RTRCXHU1MjREXHU2Nzg0XHU1RUZBXHU3Njg0XHU1MzA1XHU1NDJCIENETiBVUkwgXHU3Njg0XHU0RUE3XHU3MjY5XG4gICAgICAgIGNvbnN0IGlzUHJldmlld0J1aWxkID0gcHJvY2Vzcy5lbnYuVklURV9QUkVWSUVXID09PSAndHJ1ZSc7XG4gICAgICAgIGNvbnN0IG5lZWRzRWFybHlDb252ZXJ0ZXIgPSBpc1ByZXZpZXdCdWlsZCAmJiAhZW5hYmxlZDtcbiAgICAgICAgXG4gICAgICAgIGlmICghZW5hYmxlZCAmJiAhbmVlZHNFYXJseUNvbnZlcnRlcikge1xuICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG5ld0h0bWwgPSBodG1sO1xuICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAvLyAxKSBcdTU5MDRcdTc0MDYgPHNjcmlwdCBzcmM+IFx1NjgwN1x1N0I3RVx1RkYwOFx1NEVDNVx1NTcyOCBDRE4gXHU1NDJGXHU3NTI4XHU2NUY2XHU4RjZDXHU2MzYyXHVGRjA5XG4gICAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShcbiAgICAgICAgICAgIC8oPHNjcmlwdFtePl0qXFxzK3NyYz1bXCInXSkoW15cIiddKykoW1wiJ11bXj5dKj4pL2csXG4gICAgICAgICAgICAobWF0Y2g6IHN0cmluZywgcHJlZml4OiBzdHJpbmcsIHNyYzogc3RyaW5nLCBzdWZmaXg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXHVGRjFBL2Fzc2V0cy94eHguanNcbiAgICAgICAgICAgICAgaWYgKHNyYy5zdGFydHNXaXRoKCcvYXNzZXRzLycpICYmICFzcmMuc3RhcnRzV2l0aCgnL2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59LyR7YXBwTmFtZX0ke3NyY31gO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NUUwM1x1NUM0MFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFx1RkYxQS9hc3NldHMvbGF5b3V0L3h4eC5qc1xuICAgICAgICAgICAgICBpZiAoc3JjLnN0YXJ0c1dpdGgoJy9hc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS9sYXlvdXQtYXBwJHtzcmN9YDtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMUEuL2Fzc2V0cy94eHguanMgXHU2MjE2IGFzc2V0cy94eHguanNcbiAgICAgICAgICAgICAgaWYgKHNyYy5zdGFydHNXaXRoKCcuL2Fzc2V0cy8nKSB8fCBzcmMuc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBzcmMuc3RhcnRzV2l0aCgnLi8nKSA/IHNyYy5zdWJzdHJpbmcoMikgOiBzcmM7XG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRQYXRoLnN0YXJ0c1dpdGgoJ2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vbGF5b3V0LWFwcC8ke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChub3JtYWxpemVkUGF0aC5zdGFydHNXaXRoKCdhc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vJHthcHBOYW1lfS8ke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAyKSBcdTU5MDRcdTc0MDYgPGxpbmsgaHJlZj4gXHU2ODA3XHU3QjdFXHVGRjA4Q1NTXHUzMDAxbW9kdWxlcHJlbG9hZCBcdTdCNDlcdUZGMDlcdUZGMDhcdTRFQzVcdTU3MjggQ0ROIFx1NTQyRlx1NzUyOFx1NjVGNlx1OEY2Q1x1NjM2Mlx1RkYwOVxuICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgICAvKDxsaW5rW14+XSpcXHMraHJlZj1bXCInXSkoW15cIiddKykoW1wiJ11bXj5dKj4pL2csXG4gICAgICAgICAgICAobWF0Y2g6IHN0cmluZywgcHJlZml4OiBzdHJpbmcsIGhyZWY6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXHVGRjFBL2Fzc2V0cy94eHguY3NzXG4gICAgICAgICAgICAgIGlmIChocmVmLnN0YXJ0c1dpdGgoJy9hc3NldHMvJykgJiYgIWhyZWYuc3RhcnRzV2l0aCgnL2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59LyR7YXBwTmFtZX0ke2hyZWZ9YDtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcdUZGMUEvYXNzZXRzL2xheW91dC94eHguY3NzXG4gICAgICAgICAgICAgIGlmIChocmVmLnN0YXJ0c1dpdGgoJy9hc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS9sYXlvdXQtYXBwJHtocmVmfWA7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XG4gICAgICAgICAgICAgIGlmIChocmVmLnN0YXJ0c1dpdGgoJy4vYXNzZXRzLycpIHx8IGhyZWYuc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBocmVmLnN0YXJ0c1dpdGgoJy4vJykgPyBocmVmLnN1YnN0cmluZygyKSA6IGhyZWY7XG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRQYXRoLnN0YXJ0c1dpdGgoJ2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vbGF5b3V0LWFwcC8ke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChub3JtYWxpemVkUGF0aC5zdGFydHNXaXRoKCdhc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vJHthcHBOYW1lfS8ke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAzKSBcdTU5MDRcdTc0MDYgPGltZyBzcmM+IFx1NjgwN1x1N0I3RVx1RkYwOFx1NEVDNVx1NTcyOCBDRE4gXHU1NDJGXHU3NTI4XHU2NUY2XHU4RjZDXHU2MzYyXHVGRjA5XG4gICAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShcbiAgICAgICAgICAgIC8oPGltZ1tePl0qXFxzK3NyYz1bXCInXSkoW15cIiddKykoW1wiJ11bXj5dKj4pL2csXG4gICAgICAgICAgICAobWF0Y2g6IHN0cmluZywgcHJlZml4OiBzdHJpbmcsIHNyYzogc3RyaW5nLCBzdWZmaXg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcdUZGMUEvYXNzZXRzL3h4eC5wbmdcbiAgICAgICAgICAgICAgaWYgKHNyYy5zdGFydHNXaXRoKCcvYXNzZXRzLycpICYmICFzcmMuc3RhcnRzV2l0aCgnL2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59LyR7YXBwTmFtZX0ke3NyY31gO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NUUwM1x1NUM0MFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFx1RkYxQS9hc3NldHMvbGF5b3V0L3h4eC5wbmdcbiAgICAgICAgICAgICAgaWYgKHNyYy5zdGFydHNXaXRoKCcvYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vbGF5b3V0LWFwcCR7c3JjfWA7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gNCkgXHU1OTA0XHU3NDA2XHU1MTg1XHU4MDU0XHU3Njg0IGltcG9ydCgpIFx1OEMwM1x1NzUyOFx1RkYwOFx1NTcyOCBIVE1MIFx1NkEyMVx1Njc3Rlx1NEUyRFx1RkYwOVxuICAgICAgICAvLyBcdTRGRUVcdTU5MEQgcWlhbmt1biBcdTZDRThcdTUxNjVcdTc2ODRcdTUxODVcdTgwNTQgaW1wb3J0KCcvYXNzZXRzL2luZGV4LXh4eC5qcycpXG4gICAgICAgIGNvbnN0IG9yaWdpbkV4cHIgPVxuICAgICAgICAgIGAoKHR5cGVvZiBfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXyE9PSd1bmRlZmluZWQnJiZfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXylgICtcbiAgICAgICAgICBgP25ldyBVUkwoX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18sKHR5cGVvZiBsb2NhdGlvbiE9PSd1bmRlZmluZWQnJiZsb2NhdGlvbi5vcmlnaW4pfHwnJykub3JpZ2luYCArXG4gICAgICAgICAgYDooKHR5cGVvZiBsb2NhdGlvbiE9PSd1bmRlZmluZWQnJiZsb2NhdGlvbi5vcmlnaW4pfHwnJykpYDtcbiAgICAgICAgXG4gICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgL2ltcG9ydFxcKFxccyooWydcIl0pKFxcL2Fzc2V0c1xcLyhpbmRleHxtYWluKS1bXidcIl0rKVxcMVxccypcXCkvZyxcbiAgICAgICAgICAoX206IHN0cmluZywgX3E6IHN0cmluZywgYWJzUGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAvLyBcdTRGRERcdTYzMDFcdTUzOUZcdTY3MDlcdTkwM0JcdThGOTFcdUZGMENcdTRGNDZcdTc4NkVcdTRGRERcdThERUZcdTVGODRcdTZCNjNcdTc4NkVcbiAgICAgICAgICAgIHJldHVybiBgaW1wb3J0KC8qIEB2aXRlLWlnbm9yZSAqLyAoJHtvcmlnaW5FeHByfSArICcke2Fic1BhdGh9JykpYDtcbiAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIDUpIFx1NkNFOFx1NTE2NVx1OEQ0NFx1NkU5MFx1NTJBMFx1OEY3RFx1NTY2OFx1NTIxRFx1NTlDQlx1NTMxNlx1ODExQVx1NjcyQ1x1NTQ4Q1x1NjVFOVx1NjcxRiBVUkwgXHU4RjZDXHU2MzYyXHU4MTFBXHU2NzJDXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTM3M1x1NEY3RiBDRE4gXHU2M0QyXHU0RUY2XHU4OEFCXHU3OTgxXHU3NTI4XHVGRjBDXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHU2NUY2XHU0RTVGXHU5NzAwXHU4OTgxXHU2Q0U4XHU1MTY1XHU2NUU5XHU2NzFGIFVSTCBcdThGNkNcdTYzNjJcdTgxMUFcdTY3MkNcbiAgICAgICAgaWYgKCFuZXdIdG1sLmluY2x1ZGVzKCdfX0JUQ19SRVNPVVJDRV9MT0FERVJfXycpIHx8IG5lZWRzRWFybHlDb252ZXJ0ZXIpIHtcbiAgICAgICAgICAvLyBcdTY4MzlcdTYzNkUgRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU1MUIzXHU1QjlBXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4IENETlxuICAgICAgICAgIGNvbnN0IGNkbkVuYWJsZWQgPSBwcm9jZXNzLmVudi5FTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiAhPT0gJ2ZhbHNlJztcbiAgICAgICAgICBjb25zdCBpc1ByZXZpZXdCdWlsZCA9IHByb2Nlc3MuZW52LlZJVEVfUFJFVklFVyA9PT0gJ3RydWUnO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFx1NjVFOVx1NjcxRiBVUkwgXHU4RjZDXHU2MzYyXHU4MTFBXHU2NzJDXHVGRjA4XHU1NzI4XHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHU2NUY2XHU2Q0U4XHU1MTY1XHVGRjBDXHU3NTI4XHU0RThFXHU1NzI4IEhUTUwgXHU4OUUzXHU2NzkwXHU1MjREXHU4RjZDXHU2MzYyIENETiBVUkxcdUZGMDlcbiAgICAgICAgICAvLyBcdTUzNzNcdTRGN0YgQ0ROIFx1NjNEMlx1NEVGNlx1ODhBQlx1Nzk4MVx1NzUyOFx1RkYwQ1x1OTg4NFx1ODlDOFx1NzNBRlx1NTg4M1x1NEU1Rlx1NTNFRlx1ODBGRFx1NEY3Rlx1NzUyOFx1NTMwNVx1NTQyQiBDRE4gVVJMIFx1NzY4NFx1NjVFN1x1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVxuICAgICAgICAgIGNvbnN0IGVhcmx5VXJsQ29udmVydGVyU2NyaXB0ID0gaXNQcmV2aWV3QnVpbGQgPyBgXG48c2NyaXB0PlxuICAoZnVuY3Rpb24oKSB7XG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1NzI4IEhUTUwgXHU4OUUzXHU2NzkwXHU0RTRCXHU1MjREXHU1QzMxXHU1OTA0XHU3NDA2IENETiBVUkxcdUZGMENcdTkwN0ZcdTUxNERcdTZENEZcdTg5QzhcdTU2NjhcdThCRjdcdTZDNDIgQ0ROIFx1OEQ0NFx1NkU5MFxuICAgIC8vIFx1OEZEOVx1NEUyQVx1ODExQVx1NjcyQ1x1NUZDNVx1OTg3Qlx1NTcyOFx1NjI0MFx1NjcwOVx1NTE3Nlx1NEVENiBzY3JpcHQgXHU1NDhDIGxpbmsgXHU2ODA3XHU3QjdFXHU0RTRCXHU1MjREXHU2MjY3XHU4ODRDXG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnN0IGNvbnZlcnRDZG5VcmwgPSAodXJsKSA9PiB7XG4gICAgICAgIGlmICghdXJsIHx8ICghdXJsLnN0YXJ0c1dpdGgoJ2h0dHA6Ly8nKSAmJiAhdXJsLnN0YXJ0c1dpdGgoJ2h0dHBzOi8vJykpKSB7XG4gICAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHVybE9iaiA9IG5ldyBVUkwodXJsKTtcbiAgICAgICAgICBpZiAodXJsT2JqLmhvc3RuYW1lLmluY2x1ZGVzKCdhbGwuYmVsbGlzLmNvbS5jbicpIHx8IFxuICAgICAgICAgICAgICB1cmxPYmouaG9zdG5hbWUuaW5jbHVkZXMoJ2JlbGxpczEub3NzLWNuLXNoZW56aGVuLmFsaXl1bmNzLmNvbScpKSB7XG4gICAgICAgICAgICAvLyBcdTYzRDBcdTUzRDZcdThERUZcdTVGODRcdTkwRThcdTUyMDZcdUZGMENcdTUzQkJcdTYzODlcdTVFOTRcdTc1MjhcdTUyNERcdTdGMDBcbiAgICAgICAgICAgIGxldCBwYXRoID0gdXJsT2JqLnBhdGhuYW1lO1xuICAgICAgICAgICAgaWYgKHBhdGguaW5jbHVkZXMoJy9hc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgcGF0aCA9IHBhdGguc3Vic3RyaW5nKHBhdGguaW5kZXhPZignL2Fzc2V0cy8nKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhdGguaW5jbHVkZXMoJy9hc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgIHBhdGggPSBwYXRoLnN1YnN0cmluZyhwYXRoLmluZGV4T2YoJy9hc3NldHMvbGF5b3V0LycpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NEZERFx1NzU1OVx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1NTQ4Q1x1NTRDOFx1NUUwQ1xuICAgICAgICAgICAgcmV0dXJuIHBhdGggKyAodXJsT2JqLnNlYXJjaCB8fCAnJykgKyAodXJsT2JqLmhhc2ggfHwgJycpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIFVSTCBcdTg5RTNcdTY3OTBcdTU5MzFcdThEMjVcdUZGMENcdThGRDRcdTU2REVcdTUzOUYgVVJMXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgIH07XG4gICAgICBcbiAgICAgIC8vIFx1NjJFNlx1NjIyQSBkb2N1bWVudC5jcmVhdGVFbGVtZW50XHVGRjBDXHU1NzI4XHU1MjFCXHU1RUZBIHNjcmlwdCBcdTU0OEMgbGluayBcdTY4MDdcdTdCN0VcdTY1RjZcdThGNkNcdTYzNjIgVVJMXG4gICAgICBjb25zdCBvcmlnaW5hbENyZWF0ZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50LmJpbmQoZG9jdW1lbnQpO1xuICAgICAgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCA9IGZ1bmN0aW9uKHRhZ05hbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IG9yaWdpbmFsQ3JlYXRlRWxlbWVudCh0YWdOYW1lLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKHRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3NjcmlwdCcgfHwgdGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnbGluaycpIHtcbiAgICAgICAgICBjb25zdCBvcmlnaW5hbFNldEF0dHJpYnV0ZSA9IGVsZW1lbnQuc2V0QXR0cmlidXRlLmJpbmQoZWxlbWVudCk7XG4gICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKChuYW1lID09PSAnc3JjJyB8fCBuYW1lID09PSAnaHJlZicpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgY29uc3QgY29udmVydGVkVXJsID0gY29udmVydENkblVybCh2YWx1ZSk7XG4gICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFNldEF0dHJpYnV0ZShuYW1lLCBjb252ZXJ0ZWRVcmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsU2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgICAgfTtcbiAgICAgIFxuICAgICAgLy8gXHU1OTA0XHU3NDA2XHU1REYyXHU1QjU4XHU1NzI4XHU3Njg0IHNjcmlwdCBcdTU0OEMgbGluayBcdTY4MDdcdTdCN0VcdUZGMDhcdTU5ODJcdTY3OUMgRE9NIFx1NURGMlx1N0VDRlx1OTBFOFx1NTIwNlx1ODlFM1x1Njc5MFx1RkYwOVxuICAgICAgY29uc3QgcHJvY2Vzc0V4aXN0aW5nVGFncyA9ICgpID0+IHtcbiAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwpIHtcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbc3JjXScpLmZvckVhY2goKHNjcmlwdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3JjID0gc2NyaXB0LmdldEF0dHJpYnV0ZSgnc3JjJyk7XG4gICAgICAgICAgICBpZiAoc3JjKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRlZFVybCA9IGNvbnZlcnRDZG5Vcmwoc3JjKTtcbiAgICAgICAgICAgICAgaWYgKGNvbnZlcnRlZFVybCAhPT0gc3JjKSB7XG4gICAgICAgICAgICAgICAgc2NyaXB0LnNldEF0dHJpYnV0ZSgnc3JjJywgY29udmVydGVkVXJsKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpbmtbaHJlZl0nKS5mb3JFYWNoKChsaW5rKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBocmVmID0gbGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICAgICAgICAgIGlmIChocmVmKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRlZFVybCA9IGNvbnZlcnRDZG5VcmwoaHJlZik7XG4gICAgICAgICAgICAgIGlmIChjb252ZXJ0ZWRVcmwgIT09IGhyZWYpIHtcbiAgICAgICAgICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZSgnaHJlZicsIGNvbnZlcnRlZFVybCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgLy8gXHU3QUNCXHU1MzczXHU1OTA0XHU3NDA2XHVGRjA4XHU1OTgyXHU2NzlDIERPTSBcdTVERjJcdTdFQ0ZcdTkwRThcdTUyMDZcdTg5RTNcdTY3OTBcdUZGMDlcbiAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2ludGVyYWN0aXZlJykge1xuICAgICAgICBwcm9jZXNzRXhpc3RpbmdUYWdzKCk7XG4gICAgICAgIC8vIFx1NzZEMVx1NTQyQyBET00gXHU1M0Q4XHU1MzE2XHVGRjBDXHU1OTA0XHU3NDA2XHU1NDBFXHU3RUVEXHU2REZCXHU1MkEwXHU3Njg0XHU2ODA3XHU3QjdFXG4gICAgICAgIGlmIChkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHByb2Nlc3NFeGlzdGluZ1RhZ3MpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9jZXNzRXhpc3RpbmdUYWdzKCk7XG4gICAgICB9XG4gICAgfVxuICB9KSgpO1xuPC9zY3JpcHQ+YCA6ICcnO1xuICAgICAgICAgIFxuICAgICAgICAgIGNvbnN0IGxvYWRlclNjcmlwdCA9IGBcbjxzY3JpcHQ+XG4gIChmdW5jdGlvbigpIHtcbiAgICAvLyBcdThENDRcdTZFOTBcdTUyQTBcdThGN0RcdTU2NjhcdTVDMDZcdTU3MjhcdThGRDBcdTg4NENcdTY1RjZcdTZBMjFcdTU3NTdcdTRFMkRcdTUyMURcdTU5Q0JcdTUzMTZcbiAgICAvLyBcdThGRDlcdTkxQ0NcdTUzRUFcdThCQkVcdTdGNkVcdTU3RkFcdTc4NDBcdTkxNERcdTdGNkVcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHdpbmRvdy5fX0JUQ19DRE5fQ09ORklHX18gPSB7XG4gICAgICAgIGFwcE5hbWU6ICcke2FwcE5hbWV9JyxcbiAgICAgICAgY2RuRG9tYWluOiAnJHtjZG5Eb21haW59JyxcbiAgICAgICAgb3NzRG9tYWluOiAnaHR0cHM6Ly9iZWxsaXMxLm9zcy1jbi1zaGVuemhlbi5hbGl5dW5jcy5jb20nLFxuICAgICAgICBlbmFibGVkOiAke2NkbkVuYWJsZWR9XG4gICAgICB9O1xuICAgIH1cbiAgfSkoKTtcbjwvc2NyaXB0PmA7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gXHU1NzI4IDwvaGVhZD4gXHU0RTRCXHU1MjREXHU2Q0U4XHU1MTY1XHVGRjA4XHU2NUU5XHU2NzFGIFVSTCBcdThGNkNcdTYzNjJcdTgxMUFcdTY3MkNcdTVGQzVcdTk4N0JcdTU3MjhcdTY3MDBcdTUyNERcdTk3NjJcdUZGMENcdTU3MjhcdTYyNDBcdTY3MDlcdTUxNzZcdTRFRDYgc2NyaXB0IFx1NTQ4QyBsaW5rIFx1NjgwN1x1N0I3RVx1NEU0Qlx1NTI0RFx1RkYwOVxuICAgICAgICAgIGlmIChuZXdIdG1sLmluY2x1ZGVzKCc8L2hlYWQ+JykpIHtcbiAgICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NjVFOVx1NjcxRiBVUkwgXHU4RjZDXHU2MzYyXHU4MTFBXHU2NzJDXHU1RkM1XHU5ODdCXHU1NzI4IDxoZWFkPiBcdTc2ODRcdTY3MDBcdTUyNERcdTk3NjJcdUZGMENcdTU3MjhcdTYyNDBcdTY3MDlcdTUxNzZcdTRFRDZcdTY4MDdcdTdCN0VcdTRFNEJcdTUyNERcbiAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NURGMlx1N0VDRlx1NjcwOVx1NTE3Nlx1NEVENiBzY3JpcHQgXHU2ODA3XHU3QjdFXHVGRjBDXHU1NzI4XHU3QjJDXHU0RTAwXHU0RTJBIHNjcmlwdCBcdTY4MDdcdTdCN0VcdTRFNEJcdTUyNERcdTYzRDJcdTUxNjVcbiAgICAgICAgICAgIGlmIChlYXJseVVybENvbnZlcnRlclNjcmlwdCAmJiBuZXdIdG1sLmluY2x1ZGVzKCc8c2NyaXB0JykpIHtcbiAgICAgICAgICAgICAgLy8gXHU1NzI4XHU3QjJDXHU0RTAwXHU0RTJBIDxzY3JpcHQ+IFx1NjIxNiA8bGluaz4gXHU2ODA3XHU3QjdFXHU0RTRCXHU1MjREXHU2M0QyXHU1MTY1XHU2NUU5XHU2NzFGXHU4RjZDXHU2MzYyXHU4MTFBXHU2NzJDXG4gICAgICAgICAgICAgIGNvbnN0IGZpcnN0VGFnTWF0Y2ggPSBuZXdIdG1sLm1hdGNoKC88KHNjcmlwdHxsaW5rKVtePl0qPi9pKTtcbiAgICAgICAgICAgICAgaWYgKGZpcnN0VGFnTWF0Y2ggJiYgZmlyc3RUYWdNYXRjaC5pbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwuc2xpY2UoMCwgZmlyc3RUYWdNYXRjaC5pbmRleCkgKyBlYXJseVVybENvbnZlcnRlclNjcmlwdCArIG5ld0h0bWwuc2xpY2UoZmlyc3RUYWdNYXRjaC5pbmRleCk7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOVx1NjI3RVx1NTIzMCBzY3JpcHQgXHU2MjE2IGxpbmsgXHU2ODA3XHU3QjdFXHVGRjBDXHU1NzI4IDwvaGVhZD4gXHU0RTRCXHU1MjREXHU2M0QyXHU1MTY1XG4gICAgICAgICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZSgnPC9oZWFkPicsIGAke2Vhcmx5VXJsQ29udmVydGVyU2NyaXB0fVxcbjwvaGVhZD5gKTtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NkNFOFx1NTE2NVx1OEQ0NFx1NkU5MFx1NTJBMFx1OEY3RFx1NTY2OFx1OTE0RFx1N0Y2RVx1ODExQVx1NjcyQ1xuICAgICAgICAgICAgaWYgKCFuZXdIdG1sLmluY2x1ZGVzKCdfX0JUQ19SRVNPVVJDRV9MT0FERVJfXycpKSB7XG4gICAgICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoJzwvaGVhZD4nLCBgJHtsb2FkZXJTY3JpcHR9XFxuPC9oZWFkPmApO1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChuZXdIdG1sLmluY2x1ZGVzKCc8L2JvZHk+JykpIHtcbiAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOSA8L2hlYWQ+XHVGRjBDXHU1NzI4IDwvYm9keT4gXHU0RTRCXHU1MjREXHU2Q0U4XHU1MTY1XG4gICAgICAgICAgICBpZiAoZWFybHlVcmxDb252ZXJ0ZXJTY3JpcHQpIHtcbiAgICAgICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZSgnPC9ib2R5PicsIGAke2Vhcmx5VXJsQ29udmVydGVyU2NyaXB0fVxcbjwvYm9keT5gKTtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFuZXdIdG1sLmluY2x1ZGVzKCdfX0JUQ19SRVNPVVJDRV9MT0FERVJfXycpKSB7XG4gICAgICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoJzwvYm9keT4nLCBgJHtsb2FkZXJTY3JpcHR9XFxuPC9ib2R5PmApO1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgY29uc29sZS5pbmZvKGBbY2RuLWFzc2V0c10gXHU1REYyXHU0RTNBIGluZGV4Lmh0bWwgXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU4RjZDXHU2MzYyXHU0RTNBIENETiBVUkxgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG5ld0h0bWw7XG4gICAgICB9LFxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcY2RuLWltcG9ydC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9jZG4taW1wb3J0LnRzXCI7LyoqXG4gKiBDRE4gXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU4RjZDXHU2MzYyXHU2M0QyXHU0RUY2XG4gKiBcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdThGNkNcdTYzNjJcdTRFRTNcdTc4MDFcdTRFMkRcdTc2ODQgaW1wb3J0KCkgXHU4QzAzXHU3NTI4XHVGRjBDXHU1QzA2XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHU4RjZDXHU2MzYyXHU0RTNBIENETiBVUkxcbiAqIFx1NEUwRSBjZG5Bc3NldHNQbHVnaW4gXHU5MTREXHU1NDA4XHVGRjBDXHU1QjlFXHU3M0IwXHU1QjhDXHU2NTc0XHU3Njg0IENETiBcdTUyQTBcdTkwMUZcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW2Nkbi1pbXBvcnRdJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1tjZG4taW1wb3J0XScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW2Nkbi1pbXBvcnRdJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1tjZG4taW1wb3J0XScsIC4uLmFyZ3MpLFxufTtcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuZXhwb3J0IGludGVyZmFjZSBDZG5JbXBvcnRQbHVnaW5PcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NTk4MiAnbG9naXN0aWNzLWFwcCdcdUZGMDlcbiAgICovXG4gIGFwcE5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIFx1NjYyRlx1NTQyNlx1NTQyRlx1NzUyOCBDRE4gXHU1MkEwXHU5MDFGXHVGRjA4XHU5RUQ4XHU4QkE0XHVGRjFBXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU1NDJGXHU3NTI4XHVGRjA5XG4gICAqL1xuICBlbmFibGVkPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIENETiBcdTU3REZcdTU0MERcdUZGMDhcdTlFRDhcdThCQTRcdUZGMUFhbGwuYmVsbGlzLmNvbS5jblx1RkYwOVxuICAgKi9cbiAgY2RuRG9tYWluPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIENETiBcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdThGNkNcdTYzNjJcdTYzRDJcdTRFRjZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNkbkltcG9ydFBsdWdpbihvcHRpb25zOiBDZG5JbXBvcnRQbHVnaW5PcHRpb25zKTogUGx1Z2luIHtcbiAgY29uc3Qge1xuICAgIGFwcE5hbWUsXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU5RUQ4XHU4QkE0XHU1NDJGXHU3NTI4XHU2NzYxXHU0RUY2XHU1RkM1XHU5ODdCXHU2NjBFXHU3ODZFXHU2OEMwXHU2N0U1IEVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OIFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlxuICAgIC8vIFx1NTk4Mlx1Njc5QyBFTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiBcdTg4QUJcdThCQkVcdTdGNkVcdTRFM0EgJ2ZhbHNlJ1x1RkYwQ1x1NTIxOVx1Nzk4MVx1NzUyOCBDRE5cbiAgICAvLyBcdTUzRUFcdTY3MDlcdTU3MjhcdTY2MEVcdTc4NkVcdTU0MkZcdTc1MjhcdUZGMDhFTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTj10cnVlXHVGRjA5XHU2MjE2XHU2NzJBXHU4QkJFXHU3RjZFXHU0RTE0XHU2NjJGXHU3NTFGXHU0RUE3XHU2Nzg0XHU1RUZBXHU2NUY2XHVGRjBDXHU2MjREXHU1NDJGXHU3NTI4IENETlxuICAgIGVuYWJsZWQgPSBwcm9jZXNzLmVudi5FTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiA9PT0gJ3RydWUnIHx8IFxuICAgICAgICAgICAgICAocHJvY2Vzcy5lbnYuRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gIT09ICdmYWxzZScgJiYgXG4gICAgICAgICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nICYmIFxuICAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuVklURV9QUkVWSUVXICE9PSAndHJ1ZScpLFxuICAgIGNkbkRvbWFpbiA9ICdodHRwczovL2FsbC5iZWxsaXMuY29tLmNuJyxcbiAgfSA9IG9wdGlvbnM7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY2RuLWltcG9ydCcsXG4gICAgYXBwbHk6ICdidWlsZCcsXG4gICAgYnVpbGRTdGFydCgpIHtcbiAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW2Nkbi1pbXBvcnRdIENETiBcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdThGNkNcdTYzNjJcdTVERjJcdTU0MkZcdTc1MjhcdUZGMENcdTVFOTRcdTc1Mjg6ICR7YXBwTmFtZX0sIENETiBcdTU3REZcdTU0MEQ6ICR7Y2RuRG9tYWlufWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGBbY2RuLWltcG9ydF0gQ0ROIFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1OEY2Q1x1NjM2Mlx1NURGMlx1Nzk4MVx1NzUyOGApO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVuZGVyQ2h1bmsoY29kZTogc3RyaW5nLCBjaHVuazogYW55KSB7XG4gICAgICAvLyBcdTU3MjggcmVuZGVyQ2h1bmsgXHU5NjM2XHU2QkI1XHU1OTA0XHU3NDA2XHU2Nzg0XHU1RUZBXHU1NDBFXHU3Njg0XHU0RUUzXHU3ODAxXG4gICAgICAvLyBcdTZCNjRcdTY1RjYgaW1wb3J0KCkgXHU4QzAzXHU3NTI4XHU1REYyXHU3RUNGXHU4OEFCIFZpdGUgXHU4RjZDXHU2MzYyXHU0RTNBXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHU3Njg0IGNodW5rIFx1NjU4N1x1NEVGNlx1RkYwOFx1NTk4MiAuL2luZGV4LXh4eC5qc1x1RkYwOVxuICAgICAgaWYgKCFlbmFibGVkKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTUzRUFcdTU5MDRcdTc0MDYgSlMgY2h1bmsgXHU2NTg3XHU0RUY2XG4gICAgICBpZiAoIWNodW5rLmZpbGVOYW1lLmVuZHNXaXRoKCcuanMnKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU4REYzXHU4RkM3XHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XHVGRjA4aW5kZXgteHh4LmpzXHVGRjA5XHVGRjBDXHU1NkUwXHU0RTNBXHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XHU2NjJGXHU5MDFBXHU4RkM3IHNjcmlwdCBcdTY4MDdcdTdCN0VcdTc2RjRcdTYzQTVcdTUyQTBcdThGN0RcdTc2ODRcdUZGMENcdTVERjJcdTU3MjggSFRNTCBcdTRFMkRcdTU5MDRcdTc0MDZcbiAgICAgIGlmIChjaHVuay5pc0VudHJ5IHx8IGNodW5rLmZpbGVOYW1lLm1hdGNoKC9eaW5kZXgtW2EtekEtWjAtOV0rXFwuanMkLykpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuICAgICAgbGV0IG5ld0NvZGUgPSBjb2RlO1xuXG4gICAgICAvLyBcdTUzMzlcdTkxNEQgaW1wb3J0KCkgXHU4QzAzXHU3NTI4XHVGRjBDXHU4QkM2XHU1MjJCXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHU3Njg0XHU4RDQ0XHU2RTkwXG4gICAgICAvLyBcdTUzMzlcdTkxNERcdTZBMjFcdTVGMEZcdUZGMUFpbXBvcnQoJy4uLicpIFx1NjIxNiBpbXBvcnQoXCIuLi5cIilcbiAgICAgIGNvbnN0IGltcG9ydFBhdHRlcm4gPSAvaW1wb3J0XFxzKlxcKFxccyooWydcIl0pKFteJ1wiXSspXFwxXFxzKlxcKS9nO1xuXG4gICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKGltcG9ydFBhdHRlcm4sIChtYXRjaDogc3RyaW5nLCBxdW90ZTogc3RyaW5nLCBzcGVjaWZpZXI6IHN0cmluZykgPT4ge1xuICAgICAgICAvLyBcdTUzRUFcdTU5MDRcdTc0MDZcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMDguL3h4eC5qc1x1RkYwOVx1NTQ4QyAvYXNzZXRzLyBcdThERUZcdTVGODRcbiAgICAgICAgLy8gXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA4aHR0cDovL1x1MzAwMWh0dHBzOi8vXHVGRjA5XHU1NDhDIG5vZGVfbW9kdWxlcyBcdThERUZcdTVGODRcdTRFMERcdTU5MDRcdTc0MDZcbiAgICAgICAgY29uc3QgaXNSZWxhdGl2ZVBhdGggPSBzcGVjaWZpZXIuc3RhcnRzV2l0aCgnLi8nKTtcbiAgICAgICAgY29uc3QgaXNBc3NldHNQYXRoID0gc3BlY2lmaWVyLnN0YXJ0c1dpdGgoJy9hc3NldHMvJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWlzUmVsYXRpdmVQYXRoICYmICFpc0Fzc2V0c1BhdGgpIHtcbiAgICAgICAgICByZXR1cm4gbWF0Y2g7IC8vIFx1OTc1RVx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1NEUxNFx1OTc1RSAvYXNzZXRzLyBcdThERUZcdTVGODRcdUZGMENcdTRGRERcdTYzMDFcdTUzOUZcdTY4MzdcbiAgICAgICAgfVxuXG4gICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcblxuICAgICAgICAvLyBcdTg5QzRcdTgzMDNcdTUzMTZcdThERUZcdTVGODRcbiAgICAgICAgbGV0IG5vcm1hbGl6ZWRQYXRoOiBzdHJpbmc7XG4gICAgICAgIGlmIChpc1JlbGF0aXZlUGF0aCkge1xuICAgICAgICAgIC8vIFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYxQS4vaW5kZXgteHh4LmpzIC0+IC9hc3NldHMvaW5kZXgteHh4LmpzXG4gICAgICAgICAgLy8gXHU2MjE2XHU4MDA1XHVGRjFBLi9hc3NldHMveHh4LmpzIC0+IC9hc3NldHMveHh4LmpzXG4gICAgICAgICAgaWYgKHNwZWNpZmllci5zdGFydHNXaXRoKCcuL2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgbm9ybWFsaXplZFBhdGggPSAnLycgKyBzcGVjaWZpZXIuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBWaXRlIGNodW5rIFx1NjU4N1x1NEVGNlx1RkYxQS4vaW5kZXgteHh4LmpzIC0+IC9hc3NldHMvaW5kZXgteHh4LmpzXG4gICAgICAgICAgICBub3JtYWxpemVkUGF0aCA9ICcvYXNzZXRzLycgKyBzcGVjaWZpZXIuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBcdTVERjJcdTdFQ0ZcdTY2MkZcdTdFRERcdTVCRjlcdThERUZcdTVGODQgL2Fzc2V0cy94eHguanNcbiAgICAgICAgICBub3JtYWxpemVkUGF0aCA9IHNwZWNpZmllcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1NTIyNFx1NjVBRFx1NjYyRlx1NTQyNlx1NjYyRlx1NUUwM1x1NUM0MFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFxuICAgICAgICBjb25zdCBpc0xheW91dFJlc291cmNlID0gbm9ybWFsaXplZFBhdGguaW5jbHVkZXMoJy9hc3NldHMvbGF5b3V0LycpO1xuXG4gICAgICAgIC8vIFx1NzUxRlx1NjIxMCBDRE4gVVJMXG4gICAgICAgIGxldCBjZG5Vcmw6IHN0cmluZztcbiAgICAgICAgaWYgKGlzTGF5b3V0UmVzb3VyY2UpIHtcbiAgICAgICAgICAvLyBcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcbiAgICAgICAgICBjZG5VcmwgPSBgJHtjZG5Eb21haW59L2xheW91dC1hcHAke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gXHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXG4gICAgICAgICAgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS8ke2FwcE5hbWV9JHtub3JtYWxpemVkUGF0aH1gO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU4RjZDXHU2MzYyXHU0RTNBIENETiBVUkxcbiAgICAgICAgcmV0dXJuIGBpbXBvcnQoJHtxdW90ZX0ke2NkblVybH0ke3F1b3RlfSlgO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtjZG4taW1wb3J0XSBcdTVERjJcdThGNkNcdTYzNjIgY2h1bmsgJHtjaHVuay5maWxlTmFtZX0gXHU0RTJEXHU3Njg0XHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU0RTNBIENETiBVUkxgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1vZGlmaWVkID8geyBjb2RlOiBuZXdDb2RlLCBtYXA6IG51bGwgfSA6IG51bGw7XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxyZXNvbHZlLWJ0Yy1pbXBvcnRzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3Jlc29sdmUtYnRjLWltcG9ydHMudHNcIjsvKipcbiAqIFx1ODlFM1x1Njc5MCBAYnRjLyogXHU1MzA1XHU1QkZDXHU1MTY1XHU2M0QyXHU0RUY2XG4gKiBcdTU5MDRcdTc0MDZcdTRFQ0VcdTVERjJcdTY3ODRcdTVFRkFcdTc2ODRcdTUzMDVcdUZGMDhcdTU5ODIgc2hhcmVkLWNvcmUvZGlzdC9pbmRleC5tanNcdUZGMDlcdTRFMkRcdTVCRkNcdTUxNjVcdTc2ODQgQGJ0Yy8qIFx1NkEyMVx1NTc1N1xuICogXHU1NDBDXHU2NUY2XHU1OTA0XHU3NDA2IHNoYXJlZC1jb21wb25lbnRzIFx1NTE4NVx1OTBFOFx1NEY3Rlx1NzUyOFx1NzY4NFx1NTIyQlx1NTQwRFx1RkYwOFx1NTk4MiBAYnRjLWNvbXBvbmVudHMsIEBidGMtY29tbW9uIFx1N0I0OVx1RkYwOVxuICogXHU3ODZFXHU0RkREIFJvbGx1cCBcdTgwRkRcdTU5MUZcdTZCNjNcdTc4NkVcdTg5RTNcdTY3OTBcdThGRDlcdTRFOUJcdTVCRkNcdTUxNjVcdUZGMENcdTUzNzNcdTRGN0ZcdTVCODNcdTRFRUNcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTc2ODRcdTUzMDVcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU1NkUwXHU0RTNBIGVzYnVpbGQgXHU2NUUwXHU2Q0Q1XHU2QjYzXHU3ODZFXHU4OUUzXHU2NzkwIHdvcmtzcGFjZSBcdTUzMDVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcdUZGMENcdTkwN0ZcdTUxNERcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdTc2ODRcdTg5RTNcdTY3OTBcdTk1RUVcdTk4OThcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1tyZXNvbHZlLWJ0Yy1pbXBvcnRzXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbcmVzb2x2ZS1idGMtaW1wb3J0c10nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1tyZXNvbHZlLWJ0Yy1pbXBvcnRzXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbcmVzb2x2ZS1idGMtaW1wb3J0c10nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyBjcmVhdGVQYXRoSGVscGVycyB9IGZyb20gJy4uL3V0aWxzL3BhdGgtaGVscGVycyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzb2x2ZUJ0Y0ltcG9ydHNPcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICAgKi9cbiAgYXBwRGlyOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdTU0MkZcdTc1MjhcdUZGMDhcdTlFRDhcdThCQTRcdUZGMUF0cnVlXHVGRjA5XG4gICAqL1xuICBlbmFibGVkPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBcdTg5RTNcdTY3OTAgQGJ0Yy8qIFx1NTMwNVx1NUJGQ1x1NTE2NVx1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUJ0Y0ltcG9ydHNQbHVnaW4ob3B0aW9uczogUmVzb2x2ZUJ0Y0ltcG9ydHNPcHRpb25zKTogUGx1Z2luIHtcbiAgY29uc3QgeyBhcHBEaXIsIGVuYWJsZWQgPSB0cnVlIH0gPSBvcHRpb25zO1xuXG4gIGlmICghZW5hYmxlZCkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAncmVzb2x2ZS1idGMtaW1wb3J0cycsXG4gICAgICBhcHBseTogJ2J1aWxkJyxcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgeyB3aXRoUGFja2FnZXMsIHdpdGhSb290LCB3aXRoQ29uZmlncyB9ID0gY3JlYXRlUGF0aEhlbHBlcnMoYXBwRGlyKTtcblxuICAvKipcbiAgICogXHU2OEMwXHU2N0U1XHU1QkZDXHU1MTY1XHU2NjJGXHU1NDI2XHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU3Njg0XHU1MzA1XHU2MjE2IHNoYXJlZC1jb21wb25lbnRzIFx1NkU5MFx1NzgwMVxuICAgKi9cbiAgZnVuY3Rpb24gaXNGcm9tQnVpbHRQYWNrYWdlT3JTaGFyZWRDb21wb25lbnRzKGltcG9ydGVyPzogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCFpbXBvcnRlcikgcmV0dXJuIGZhbHNlO1xuICAgIFxuICAgIC8vIFx1Njc2NVx1ODFFQVx1NURGMlx1Njc4NFx1NUVGQVx1NzY4NFx1NTMwNVx1RkYwOFx1NTk4MiBzaGFyZWQtY29yZS9kaXN0L2luZGV4Lm1qc1x1RkYwOVxuICAgIGNvbnN0IGlzRnJvbUJ1aWx0UGFja2FnZSA9IChcbiAgICAgIGltcG9ydGVyLmluY2x1ZGVzKCcvZGlzdC8nKSB8fFxuICAgICAgaW1wb3J0ZXIuaW5jbHVkZXMoJ1xcXFxkaXN0XFxcXCcpIHx8XG4gICAgICAoaW1wb3J0ZXIuZW5kc1dpdGgoJy5tanMnKSAmJiAhaW1wb3J0ZXIuaW5jbHVkZXMoJy9zcmMvJykpIHx8XG4gICAgICAoaW1wb3J0ZXIuZW5kc1dpdGgoJy5qcycpICYmICFpbXBvcnRlci5pbmNsdWRlcygnL3NyYy8nKSAmJiAhaW1wb3J0ZXIuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKVxuICAgICk7XG4gICAgXG4gICAgLy8gXHU2NzY1XHU4MUVBIHNoYXJlZC1jb21wb25lbnRzIFx1NkU5MFx1NzgwMVx1RkYwOFx1OTcwMFx1ODk4MVx1ODlFM1x1Njc5MFx1NTE4NVx1OTBFOFx1NTIyQlx1NTQwRFx1RkYwOVxuICAgIGNvbnN0IGlzRnJvbVNoYXJlZENvbXBvbmVudHMgPSBpbXBvcnRlci5pbmNsdWRlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjJyk7XG4gICAgXG4gICAgcmV0dXJuIGlzRnJvbUJ1aWx0UGFja2FnZSB8fCBpc0Zyb21TaGFyZWRDb21wb25lbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1Nzg2RVx1NEZERFx1OERFRlx1NUY4NFx1NjcwOVx1NkI2M1x1Nzg2RVx1NzY4NFx1NjI2OVx1NUM1NVx1NTQwRFxuICAgKiBcdTU5ODJcdTY3OUNcdThERUZcdTVGODRcdTZDQTFcdTY3MDlcdTYyNjlcdTVDNTVcdTU0MERcdUZGMENcdTVDMURcdThCRDVcdTZERkJcdTUyQTBcdTVFMzhcdTg5QzFcdTc2ODRcdTYyNjlcdTVDNTVcdTU0MERcbiAgICovXG4gIGZ1bmN0aW9uIGVuc3VyZUZpbGVFeHRlbnNpb24oZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gXHU1OTgyXHU2NzlDXHU4REVGXHU1Rjg0XHU1REYyXHU3RUNGXHU2NzA5XHU2MjY5XHU1QzU1XHU1NDBEXHVGRjBDXHU3NkY0XHU2M0E1XHU4RkQ0XHU1NkRFXG4gICAgaWYgKC9cXC4odHN8dHN4fGpzfGpzeHx2dWV8anNvbnxjc3N8c2Nzc3xzYXNzfGxlc3MpJC9pLnRlc3QoZmlsZVBhdGgpKSB7XG4gICAgICByZXR1cm4gZmlsZVBhdGg7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NjMwOVx1NEYxOFx1NTE0OFx1N0VBN1x1NUMxRFx1OEJENVx1NkRGQlx1NTJBMFx1NjI2OVx1NUM1NVx1NTQwRFx1RkYxQS50c3gsIC50cywgLmpzeCwgLmpzXG4gICAgY29uc3QgZXh0ZW5zaW9ucyA9IFsnLnRzeCcsICcudHMnLCAnLmpzeCcsICcuanMnXTtcbiAgICBmb3IgKGNvbnN0IGV4dCBvZiBleHRlbnNpb25zKSB7XG4gICAgICBjb25zdCBwYXRoV2l0aEV4dCA9IGAke2ZpbGVQYXRofSR7ZXh0fWA7XG4gICAgICBpZiAoZXhpc3RzU3luYyhwYXRoV2l0aEV4dCkpIHtcbiAgICAgICAgcmV0dXJuIHBhdGhXaXRoRXh0O1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBcdTU5ODJcdTY3OUNcdTYyNDBcdTY3MDlcdTYyNjlcdTVDNTVcdTU0MERcdTkwRkRcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdThGRDRcdTU2REVcdTUzOUZcdThERUZcdTVGODRcdUZGMENcdThCQTkgVml0ZSBcdTc2ODRcdTYyNjlcdTVDNTVcdTU0MERcdTg5RTNcdTY3OTBcdTY3M0FcdTUyMzZcdTU5MDRcdTc0MDZcbiAgICByZXR1cm4gZmlsZVBhdGg7XG4gIH1cblxuICAvKipcbiAgICogXHU4OUUzXHU2NzkwIHNoYXJlZC1jb21wb25lbnRzIFx1NTE4NVx1OTBFOFx1NTIyQlx1NTQwRFxuICAgKi9cbiAgZnVuY3Rpb24gcmVzb2x2ZVNoYXJlZENvbXBvbmVudHNBbGlhcyhpZDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3QgeyB3aXRoUGFja2FnZXMgfSA9IGNyZWF0ZVBhdGhIZWxwZXJzKGFwcERpcik7XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IEBidGMtY29tcG9uZW50c1xuICAgIGlmIChpZCA9PT0gJ0BidGMtY29tcG9uZW50cycgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy1jb21wb25lbnRzLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGJ0Yy1jb21wb25lbnRzLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjLWNvbW1vblxuICAgIGlmIChpZCA9PT0gJ0BidGMtY29tbW9uJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjLWNvbW1vbi8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BidGMtY29tbW9uLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvY29tbW9uLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IEBidGMtY3J1ZFxuICAgIGlmIChpZCA9PT0gJ0BidGMtY3J1ZCcgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy1jcnVkLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGJ0Yy1jcnVkLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvY3J1ZC8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjLXN0eWxlc1xuICAgIGlmIChpZCA9PT0gJ0BidGMtc3R5bGVzJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjLXN0eWxlcy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BidGMtc3R5bGVzLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvc3R5bGVzLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IEBidGMtbG9jYWxlc1xuICAgIGlmIChpZCA9PT0gJ0BidGMtbG9jYWxlcycgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy1sb2NhbGVzLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGJ0Yy1sb2NhbGVzLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvbG9jYWxlcy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjLWFzc2V0cyBcdTU0OEMgQGFzc2V0c1xuICAgIGlmIChpZCA9PT0gJ0BidGMtYXNzZXRzJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjLWFzc2V0cy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BidGMtYXNzZXRzLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvYXNzZXRzLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgaWYgKGlkID09PSAnQGFzc2V0cycgfHwgaWQuc3RhcnRzV2l0aCgnQGFzc2V0cy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0Bhc3NldHMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9hc3NldHMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBcbiAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy11dGlsc1xuICAgIGlmIChpZCA9PT0gJ0BidGMtdXRpbHMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMtdXRpbHMvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAYnRjLXV0aWxzLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvdXRpbHMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBcbiAgICAvLyBcdTU5MDRcdTc0MDYgQHBsdWdpbnNcbiAgICBpZiAoaWQgPT09ICdAcGx1Z2lucycgfHwgaWQuc3RhcnRzV2l0aCgnQHBsdWdpbnMvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAcGx1Z2lucy8nLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL3BsdWdpbnMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBcbiAgICAvLyBcdTU5MDRcdTc0MDZcdTU2RkVcdTg4NjhcdTc2RjhcdTUxNzNcdTUyMkJcdTU0MERcdUZGMDhcdTYzMDlcdTRFQ0VcdTUxNzdcdTRGNTNcdTUyMzBcdTRFMDBcdTgyMkNcdTc2ODRcdTk4N0FcdTVFOEZcdUZGMDlcbiAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTUxNzdcdTRGNTNcdTc2ODRcdThERUZcdTVGODRcdTUyMkJcdTU0MERcdTVGQzVcdTk4N0JcdTU3MjhcdTkwMUFcdTc1MjhcdTUyMkJcdTU0MERcdTRFNEJcdTUyNERcdTY4QzBcdTY3RTVcbiAgICBpZiAoaWQgPT09ICdAY2hhcnRzLXV0aWxzL2Nzcy12YXInIHx8IGlkLnN0YXJ0c1dpdGgoJ0BjaGFydHMtdXRpbHMvY3NzLXZhci8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BjaGFydHMtdXRpbHMvY3NzLXZhcicsICcnKS5yZXBsYWNlKC9eXFwvLywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvY3NzLXZhciR7c3ViUGF0aCA/ICcvJyArIHN1YlBhdGggOiAnJ31gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgaWYgKGlkID09PSAnQGNoYXJ0cy11dGlscy9jb2xvcicgfHwgaWQuc3RhcnRzV2l0aCgnQGNoYXJ0cy11dGlscy9jb2xvci8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BjaGFydHMtdXRpbHMvY29sb3InLCAnJykucmVwbGFjZSgvXlxcLy8sICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzL2NvbG9yJHtzdWJQYXRoID8gJy8nICsgc3ViUGF0aCA6ICcnfWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBpZiAoaWQgPT09ICdAY2hhcnRzLXV0aWxzL2dyYWRpZW50JyB8fCBpZC5zdGFydHNXaXRoKCdAY2hhcnRzLXV0aWxzL2dyYWRpZW50LycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGNoYXJ0cy11dGlscy9ncmFkaWVudCcsICcnKS5yZXBsYWNlKC9eXFwvLywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvZ3JhZGllbnQke3N1YlBhdGggPyAnLycgKyBzdWJQYXRoIDogJyd9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gJ0BjaGFydHMtY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BjaGFydHMtY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAY2hhcnRzLWNvbXBvc2FibGVzL3VzZUNoYXJ0Q29tcG9uZW50JywgJycpLnJlcGxhY2UoL15cXC8vLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy9jb21wb3NhYmxlcy91c2VDaGFydENvbXBvbmVudCR7c3ViUGF0aCA/ICcvJyArIHN1YlBhdGggOiAnJ31gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgaWYgKGlkID09PSAnQGNoYXJ0cy10eXBlcycgfHwgaWQuc3RhcnRzV2l0aCgnQGNoYXJ0cy10eXBlcy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BjaGFydHMtdHlwZXMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdHlwZXMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBpZiAoaWQgPT09ICdAY2hhcnRzLXV0aWxzJyB8fCBpZC5zdGFydHNXaXRoKCdAY2hhcnRzLXV0aWxzLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGNoYXJ0cy11dGlscy8nLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gJ0BjaGFydHMtY29tcG9zYWJsZXMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BjaGFydHMtY29tcG9zYWJsZXMvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAY2hhcnRzLWNvbXBvc2FibGVzLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL2NvbXBvc2FibGVzLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgaWYgKGlkID09PSAnQGNoYXJ0cycgfHwgaWQuc3RhcnRzV2l0aCgnQGNoYXJ0cy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BjaGFydHMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3Jlc29sdmUtYnRjLWltcG9ydHMnLFxuICAgIGFwcGx5OiAnYnVpbGQnLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBjb25zb2xlLmluZm8oJ1tyZXNvbHZlLWJ0Yy1pbXBvcnRzXSBcdTVERjJcdTU0MkZcdTc1MjhcdUZGMENcdTVDMDZcdTg5RTNcdTY3OTBcdTRFQ0VcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDVcdTRFMkRcdTVCRkNcdTUxNjVcdTc2ODQgQGJ0Yy8qIFx1NkEyMVx1NTc1N1x1NTQ4QyBzaGFyZWQtY29tcG9uZW50cyBcdTUxODVcdTkwRThcdTUyMkJcdTU0MEQnKTtcbiAgICB9LFxuICAgIHJlc29sdmVJZChpZDogc3RyaW5nLCBpbXBvcnRlcj86IHN0cmluZykge1xuICAgICAgLy8gXHU2OEMwXHU2N0U1XHU1QkZDXHU1MTY1XHU2NjJGXHU1NDI2XHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU3Njg0XHU1MzA1XHU2MjE2IHNoYXJlZC1jb21wb25lbnRzIFx1NkU5MFx1NzgwMVxuICAgICAgY29uc3Qgc2hvdWxkUmVzb2x2ZSA9IGlzRnJvbUJ1aWx0UGFja2FnZU9yU2hhcmVkQ29tcG9uZW50cyhpbXBvcnRlcik7XG4gICAgICBcbiAgICAgIGlmICghc2hvdWxkUmVzb2x2ZSkge1xuICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTVCRkNcdTUxNjVcdTRFMERcdTY2MkZcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTc2ODRcdTUzMDVcdTYyMTYgc2hhcmVkLWNvbXBvbmVudHMgXHU2RTkwXHU3ODAxXHVGRjBDXHU4QkE5XHU1MTc2XHU0RUQ2XHU2M0QyXHU0RUY2XHVGRjA4XHU1OTgyXHU1MjJCXHU1NDBEXHU5MTREXHU3RjZFXHVGRjA5XHU1OTA0XHU3NDA2XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTk5OTZcdTUxNDhcdTU5MDRcdTc0MDYgc2hhcmVkLWNvbXBvbmVudHMgXHU1MTg1XHU5MEU4XHU1MjJCXHU1NDBEXHVGRjA4XHU4RkQ5XHU0RTlCXHU1MjJCXHU1NDBEXHU1M0VGXHU4MEZEXHU1NzI4XHU0RUZCXHU0RjU1XHU1NzMwXHU2NUI5XHU0RjdGXHU3NTI4XHVGRjA5XG4gICAgICBjb25zdCBzaGFyZWRDb21wb25lbnRzQWxpYXMgPSByZXNvbHZlU2hhcmVkQ29tcG9uZW50c0FsaWFzKGlkKTtcbiAgICAgIGlmIChzaGFyZWRDb21wb25lbnRzQWxpYXMpIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGBbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU4OUUzXHU2NzkwIHNoYXJlZC1jb21wb25lbnRzIFx1NTE4NVx1OTBFOFx1NTIyQlx1NTQwRCAke2lkfSAoXHU2NzY1XHU4MUVBICR7aW1wb3J0ZXI/LnNwbGl0KCcvJykuc2xpY2UoLTIpLmpvaW4oJy8nKSB8fCAndW5rbm93bid9KSAtPiAke3NoYXJlZENvbXBvbmVudHNBbGlhcy5zcGxpdCgnLycpLnNsaWNlKC0zKS5qb2luKCcvJyl9YCk7XG4gICAgICAgIHJldHVybiBzaGFyZWRDb21wb25lbnRzQWxpYXM7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTkwNFx1NzQwNiBAY29uZmlncyBcdTUzMDVcdTc2ODRcdTVCRkNcdTUxNjVcdUZGMDhcdTRFQ0VcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDVcdTRFMkRcdTVCRkNcdTUxNjVcdTY1RjZcdUZGMENcdTczQjBcdTU3MjhcdTYzMDdcdTU0MTEgc2hhcmVkLWNvcmUvc3JjL2NvbmZpZ3NcdUZGMDlcbiAgICAgIGlmIChpZC5zdGFydHNXaXRoKCdAY29uZmlncy8nKSkge1xuICAgICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGNvbmZpZ3MvJywgJycpO1xuICAgICAgICBjb25zdCBzb3VyY2VQYXRoID0gd2l0aENvbmZpZ3Moc3ViUGF0aCk7XG4gICAgICAgIGNvbnN0IGZpbmFsUGF0aCA9IGVuc3VyZUZpbGVFeHRlbnNpb24oc291cmNlUGF0aCk7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmluZm8oYFtyZXNvbHZlLWJ0Yy1pbXBvcnRzXSBcdTg5RTNcdTY3OTAgQGNvbmZpZ3MgXHU1MzA1ICR7aWR9IChcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDUgJHtpbXBvcnRlcj8uc3BsaXQoJy8nKS5zbGljZSgtMikuam9pbignLycpIHx8ICd1bmtub3duJ30pIC0+ICR7ZmluYWxQYXRoLnNwbGl0KCcvJykuc2xpY2UoLTMpLmpvaW4oJy8nKX1gKTtcbiAgICAgICAgcmV0dXJuIGZpbmFsUGF0aDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1OTA0XHU3NDA2IEBidGMvKiBcdTUzMDVcdTc2ODRcdTVCRkNcdTUxNjVcbiAgICAgIGlmICghaWQuc3RhcnRzV2l0aCgnQGJ0Yy8nKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1OTA0XHU3NDA2IEBidGMvc2hhcmVkLWNvbXBvbmVudHNcbiAgICAgIGlmIChpZCA9PT0gJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMvJykpIHtcbiAgICAgICAgY29uc3Qgc291cmNlUGF0aCA9IGlkID09PSAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cydcbiAgICAgICAgICA/IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2luZGV4LnRzJylcbiAgICAgICAgICA6IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjLyR7aWQucmVwbGFjZSgnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cy8nLCAnJyl9YCk7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmluZm8oYFtyZXNvbHZlLWJ0Yy1pbXBvcnRzXSBcdTg5RTNcdTY3OTAgJHtpZH0gKFx1Njc2NVx1ODFFQVx1NURGMlx1Njc4NFx1NUVGQVx1NTMwNSAke2ltcG9ydGVyPy5zcGxpdCgnLycpLnNsaWNlKC0yKS5qb2luKCcvJykgfHwgJ3Vua25vd24nfSkgLT4gJHtzb3VyY2VQYXRoLnNwbGl0KCcvJykuc2xpY2UoLTMpLmpvaW4oJy8nKX1gKTtcbiAgICAgICAgcmV0dXJuIHNvdXJjZVBhdGg7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjL3NoYXJlZC1jb3JlXG4gICAgICBpZiAoaWQgPT09ICdAYnRjL3NoYXJlZC1jb3JlJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjL3NoYXJlZC1jb3JlLycpKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZVBhdGggPSBpZCA9PT0gJ0BidGMvc2hhcmVkLWNvcmUnXG4gICAgICAgICAgPyB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYy9pbmRleC50cycpXG4gICAgICAgICAgOiB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb3JlL3NyYy8ke2lkLnJlcGxhY2UoJ0BidGMvc2hhcmVkLWNvcmUvJywgJycpfWApO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5pbmZvKGBbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU4OUUzXHU2NzkwICR7aWR9IChcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDUgJHtpbXBvcnRlcj8uc3BsaXQoJy8nKS5zbGljZSgtMikuam9pbignLycpIHx8ICd1bmtub3duJ30pIC0+ICR7c291cmNlUGF0aC5zcGxpdCgnLycpLnNsaWNlKC0zKS5qb2luKCcvJyl9YCk7XG4gICAgICAgIHJldHVybiBzb3VyY2VQYXRoO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy9zaGFyZWQtdXRpbHNcbiAgICAgIGlmIChpZCA9PT0gJ0BidGMvc2hhcmVkLXV0aWxzJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjL3NoYXJlZC11dGlscy8nKSkge1xuICAgICAgICBjb25zdCBzb3VyY2VQYXRoID0gaWQgPT09ICdAYnRjL3NoYXJlZC11dGlscydcbiAgICAgICAgICA/IHdpdGhQYWNrYWdlcygnc2hhcmVkLXV0aWxzL3NyYy9pbmRleC50cycpXG4gICAgICAgICAgOiB3aXRoUGFja2FnZXMoYHNoYXJlZC11dGlscy9zcmMvJHtpZC5yZXBsYWNlKCdAYnRjL3NoYXJlZC11dGlscy8nLCAnJyl9YCk7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmluZm8oYFtyZXNvbHZlLWJ0Yy1pbXBvcnRzXSBcdTg5RTNcdTY3OTAgJHtpZH0gKFx1Njc2NVx1ODFFQVx1NURGMlx1Njc4NFx1NUVGQVx1NTMwNSAke2ltcG9ydGVyPy5zcGxpdCgnLycpLnNsaWNlKC0yKS5qb2luKCcvJykgfHwgJ3Vua25vd24nfSkgLT4gJHtzb3VyY2VQYXRoLnNwbGl0KCcvJykuc2xpY2UoLTMpLmpvaW4oJy8nKX1gKTtcbiAgICAgICAgcmV0dXJuIHNvdXJjZVBhdGg7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjL3NoYXJlZC1wbHVnaW5zXG4gICAgICBpZiAoaWQgPT09ICdAYnRjL3NoYXJlZC1wbHVnaW5zJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjL3NoYXJlZC1wbHVnaW5zLycpKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZVBhdGggPSBpZCA9PT0gJ0BidGMvc2hhcmVkLXBsdWdpbnMnXG4gICAgICAgICAgPyB3aXRoUGFja2FnZXMoJ3NoYXJlZC1wbHVnaW5zL3NyYy9pbmRleC50cycpXG4gICAgICAgICAgOiB3aXRoUGFja2FnZXMoYHNoYXJlZC1wbHVnaW5zL3NyYy8ke2lkLnJlcGxhY2UoJ0BidGMvc2hhcmVkLXBsdWdpbnMvJywgJycpfWApO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5pbmZvKGBbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU4OUUzXHU2NzkwICR7aWR9IChcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDUgJHtpbXBvcnRlcj8uc3BsaXQoJy8nKS5zbGljZSgtMikuam9pbignLycpIHx8ICd1bmtub3duJ30pIC0+ICR7c291cmNlUGF0aC5zcGxpdCgnLycpLnNsaWNlKC0zKS5qb2luKCcvJyl9YCk7XG4gICAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKHNvdXJjZVBhdGgpO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy9pMThuXG4gICAgICBpZiAoaWQgPT09ICdAYnRjL2kxOG4nIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMvaTE4bi8nKSkge1xuICAgICAgICBjb25zdCBzb3VyY2VQYXRoID0gaWQgPT09ICdAYnRjL2kxOG4nXG4gICAgICAgICAgPyB3aXRoUGFja2FnZXMoJ2kxOG4vc3JjL2luZGV4LnRzJylcbiAgICAgICAgICA6IHdpdGhQYWNrYWdlcyhgaTE4bi9zcmMvJHtpZC5yZXBsYWNlKCdAYnRjL2kxOG4vJywgJycpfWApO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5pbmZvKGBbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU4OUUzXHU2NzkwICR7aWR9IChcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDUgJHtpbXBvcnRlcj8uc3BsaXQoJy8nKS5zbGljZSgtMikuam9pbignLycpIHx8ICd1bmtub3duJ30pIC0+ICR7c291cmNlUGF0aC5zcGxpdCgnLycpLnNsaWNlKC0zKS5qb2luKCcvJyl9YCk7XG4gICAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKHNvdXJjZVBhdGgpO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy9hdXRoLXNoYXJlZFxuICAgICAgaWYgKGlkID09PSAnQGJ0Yy9hdXRoLXNoYXJlZCcgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy9hdXRoLXNoYXJlZC8nKSkge1xuICAgICAgICBsZXQgc291cmNlUGF0aDogc3RyaW5nO1xuICAgICAgICBpZiAoaWQgPT09ICdAYnRjL2F1dGgtc2hhcmVkJykge1xuICAgICAgICAgIC8vIEBidGMvYXV0aC1zaGFyZWQgXHU2Q0ExXHU2NzA5XHU2ODM5IGluZGV4LnRzXHVGRjBDXHU0RjdGXHU3NTI4IGNvbXBvc2FibGVzL2luZGV4LnRzIFx1NEY1Q1x1NEUzQVx1NTE2NVx1NTNFM1xuICAgICAgICAgIHNvdXJjZVBhdGggPSB3aXRoUm9vdCgnYXV0aC9zaGFyZWQvY29tcG9zYWJsZXMvaW5kZXgudHMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGJ0Yy9hdXRoLXNoYXJlZC8nLCAnJyk7XG4gICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU4REVGXHU1Rjg0XHU2Q0ExXHU2NzA5XHU2MjY5XHU1QzU1XHU1NDBEXHVGRjBDXHU2REZCXHU1MkEwIC50cyBcdTYyNjlcdTVDNTVcdTU0MERcbiAgICAgICAgICBzb3VyY2VQYXRoID0gd2l0aFJvb3QoYGF1dGgvc2hhcmVkLyR7c3ViUGF0aH0ke3N1YlBhdGguaW5jbHVkZXMoJy4nKSA/ICcnIDogJy50cyd9YCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW3Jlc29sdmUtYnRjLWltcG9ydHNdIFx1ODlFM1x1Njc5MCAke2lkfSAoXHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU1MzA1ICR7aW1wb3J0ZXI/LnNwbGl0KCcvJykuc2xpY2UoLTIpLmpvaW4oJy8nKSB8fCAndW5rbm93bid9KSAtPiAke3NvdXJjZVBhdGguc3BsaXQoJy8nKS5zbGljZSgtMykuam9pbignLycpfWApO1xuICAgICAgICByZXR1cm4gc291cmNlUGF0aDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1MTc2XHU0RUQ2IEBidGMvKiBcdTUzMDVcdUZGMENcdThGRDRcdTU2REUgbnVsbCBcdThCQTlcdTUxNzZcdTRFRDZcdTYzRDJcdTRFRjZcdTU5MDRcdTc0MDZcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxzeXN0ZW0tYXBwXFxcXHNyY1xcXFxjb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxzeXN0ZW0tYXBwXFxcXHNyY1xcXFxjb25maWdcXFxccHJveHkudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vYXBwcy9zeXN0ZW0tYXBwL3NyYy9jb25maWcvcHJveHkudHNcIjs7XG5pbXBvcnQgdHlwZSB7IEluY29taW5nTWVzc2FnZSwgU2VydmVyUmVzcG9uc2UgfSBmcm9tICdodHRwJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ0BidGMvc2hhcmVkLWNvcmUnO1xuXG4vLyBWaXRlIFx1NEVFM1x1NzQwNlx1OTE0RFx1N0Y2RVx1N0M3Qlx1NTc4QlxuaW50ZXJmYWNlIFByb3h5T3B0aW9ucyB7XG4gIHRhcmdldDogc3RyaW5nO1xuICBjaGFuZ2VPcmlnaW4/OiBib29sZWFuO1xuICBzZWN1cmU/OiBib29sZWFuO1xuICBzZWxmSGFuZGxlUmVzcG9uc2U/OiBib29sZWFuO1xuICBjb25maWd1cmU/OiAocHJveHk6IGFueSwgb3B0aW9uczogYW55KSA9PiB2b2lkO1xuICByZXdyaXRlPzogKHBhdGg6IHN0cmluZykgPT4gc3RyaW5nO1xufVxuXG4vLyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFRTNcdTc0MDZcdTc2RUVcdTY4MDdcdUZGMUFcdTRFQ0VcdTdFREZcdTRFMDBcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcdTgzQjdcdTUzRDZcbi8vIFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1RkYxQVZpdGUgXHU0RUUzXHU3NDA2IC9hcGkgXHU1MjMwXHU5MTREXHU3RjZFXHU3Njg0XHU1NDBFXHU3QUVGXHU1NzMwXHU1NzQwXG4vLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMUFcdTc1MzEgTmdpbnggXHU0RUUzXHU3NDA2XHVGRjBDXHU0RTBEXHU5NzAwXHU4OTgxIFZpdGUgXHU0RUUzXHU3NDA2XG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTVFRjZcdThGREZcdTVCRkNcdTUxNjUgZW52Q29uZmlnXHVGRjBDXHU5MDdGXHU1MTREXHU1NzI4IHZpdGUuY29uZmlnIFx1NEUyRFx1NUJGQ1x1NTE2NVx1NjVGNlx1NkEyMVx1NTc1N1x1NjcyQVx1Njc4NFx1NUVGQVx1NzY4NFx1OTVFRVx1OTg5OFxuZnVuY3Rpb24gZ2V0QmFja2VuZFRhcmdldCgpOiBzdHJpbmcge1xuICB0cnkge1xuICAgIC8vIFx1NEY3Rlx1NzUyOCByZXF1aXJlIFx1ODAwQ1x1NEUwRFx1NjYyRiBpbXBvcnRcdUZGMENcdTkwN0ZcdTUxNERcdTU3MjggTm9kZS5qcyBcdTczQUZcdTU4ODNcdTRFMkRcdTc2ODQgRVNNIFx1NUJGQ1x1NTE2NVx1OTVFRVx1OTg5OFxuICAgIGNvbnN0IHsgZW52Q29uZmlnIH0gPSByZXF1aXJlKCdAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MvdW5pZmllZC1lbnYtY29uZmlnJyk7XG4gICAgcmV0dXJuIGVudkNvbmZpZz8uYXBpPy5iYWNrZW5kVGFyZ2V0IHx8ICdodHRwOi8vMTAuODAuOS43Njo4MTE1JztcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBcdTU5ODJcdTY3OUNcdTVCRkNcdTUxNjVcdTU5MzFcdThEMjVcdUZGMENcdTRGN0ZcdTc1MjhcdTlFRDhcdThCQTRcdTUwM0NcbiAgICByZXR1cm4gJ2h0dHA6Ly8xMC44MC45Ljc2OjgxMTUnO1xuICB9XG59XG5cbi8vIFx1ODNCN1x1NTNENlx1NTQwRVx1N0FFRlx1NzZFRVx1NjgwN1x1NTczMFx1NTc0MFx1RkYwOFx1NTcyOFx1NkEyMVx1NTc1N1x1NTJBMFx1OEY3RFx1NjVGNlx1OEMwM1x1NzUyOFx1RkYwQ1x1NEY3Rlx1NzUyOCByZXF1aXJlIFx1OTA3Rlx1NTE0RCBFU00gXHU1QkZDXHU1MTY1XHU5NUVFXHU5ODk4XHVGRjA5XG5jb25zdCBiYWNrZW5kVGFyZ2V0ID0gZ2V0QmFja2VuZFRhcmdldCgpO1xuXG4vLyBcdTUyMUJcdTVFRkFcdTRFRTNcdTc0MDZcdTkxNERcdTdGNkVcbmNvbnN0IHByb3h5OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBQcm94eU9wdGlvbnM+ID0ge1xuICAnL2FwaSc6IHtcbiAgICB0YXJnZXQ6IGJhY2tlbmRUYXJnZXQsXG4gICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgIHNlY3VyZTogZmFsc2UsXG4gICAgLy8gXHU0RTBEXHU1MThEXHU2NkZGXHU2MzYyXHU4REVGXHU1Rjg0XHVGRjBDXHU3NkY0XHU2M0E1XHU4RjZDXHU1M0QxIC9hcGkgXHU1MjMwXHU1NDBFXHU3QUVGXHVGRjA4XHU1NDBFXHU3QUVGXHU1REYyXHU2NTM5XHU0RTNBXHU0RjdGXHU3NTI4IC9hcGlcdUZGMDlcbiAgICAvLyByZXdyaXRlOiAocGF0aDogc3RyaW5nKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnL2FkbWluJykgLy8gXHU1REYyXHU3OUZCXHU5NjY0XHVGRjFBXHU1NDBFXHU3QUVGXHU1REYyXHU2NTM5XHU0RTNBXHU0RjdGXHU3NTI4IC9hcGlcbiAgICAvLyBcdTU0MkZcdTc1MjhcdTYyNEJcdTUyQThcdTU5MDRcdTc0MDZcdTU0Q0RcdTVFOTRcdUZGMENcdTRFRTVcdTRGQkZcdTRGRUVcdTY1MzlcdTU0Q0RcdTVFOTRcdTRGNTNcbiAgICBzZWxmSGFuZGxlUmVzcG9uc2U6IHRydWUsXG4gICAgLy8gXHU1OTA0XHU3NDA2XHU1NENEXHU1RTk0XHU1OTM0XHVGRjBDXHU2REZCXHU1MkEwIENPUlMgXHU1OTM0XG4gICAgY29uZmlndXJlOiAocHJveHk6IGFueSkgPT4ge1xuICAgICAgcHJveHkub24oJ3Byb3h5UmVzJywgKHByb3h5UmVzOiBJbmNvbWluZ01lc3NhZ2UsIHJlcTogSW5jb21pbmdNZXNzYWdlLCByZXM6IFNlcnZlclJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IHJlcS5oZWFkZXJzLm9yaWdpbiB8fCAnKic7XG4gICAgICAgIGNvbnN0IGlzTG9naW5SZXF1ZXN0ID0gcmVxLnVybD8uaW5jbHVkZXMoJy9sb2dpbicpO1xuICAgICAgICBsZXQgZXh0cmFjdGVkVG9rZW46IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgIGlmIChwcm94eVJlcy5oZWFkZXJzKSB7XG4gICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJ10gPSBvcmlnaW4gYXMgc3RyaW5nO1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJ10gPSAndHJ1ZSc7XG4gICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyddID0gJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJztcbiAgICAgICAgICBjb25zdCByZXF1ZXN0SGVhZGVycyA9IHJlcS5oZWFkZXJzWydhY2Nlc3MtY29udHJvbC1yZXF1ZXN0LWhlYWRlcnMnXSB8fCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnO1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnXSA9IHJlcXVlc3RIZWFkZXJzIGFzIHN0cmluZztcblxuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRCBTZXQtQ29va2llIFx1NTRDRFx1NUU5NFx1NTkzNFx1RkYwQ1x1Nzg2RVx1NEZERFx1OERFOFx1NTdERlx1OEJGN1x1NkM0Mlx1NjVGNiBjb29raWUgXHU4MEZEXHU1OTFGXHU2QjYzXHU3ODZFXHU4QkJFXHU3RjZFXG4gICAgICAgICAgLy8gXHU1NzI4XHU5ODg0XHU4OUM4XHU2QTIxXHU1RjBGXHU0RTBCXHVGRjA4XHU0RTBEXHU1NDBDXHU3QUVGXHU1M0UzXHVGRjA5XHVGRjBDXHU5NzAwXHU4OTgxXHU4QkJFXHU3RjZFIFNhbWVTaXRlPU5vbmU7IFNlY3VyZVxuICAgICAgICAgIGNvbnN0IHNldENvb2tpZUhlYWRlciA9IHByb3h5UmVzLmhlYWRlcnNbJ3NldC1jb29raWUnXTtcblxuICAgICAgICAgIGlmIChzZXRDb29raWVIZWFkZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvb2tpZXMgPSBBcnJheS5pc0FycmF5KHNldENvb2tpZUhlYWRlcikgPyBzZXRDb29raWVIZWFkZXIgOiBbc2V0Q29va2llSGVhZGVyXTtcblxuICAgICAgICAgICAgY29uc3QgZml4ZWRDb29raWVzID0gY29va2llcy5tYXAoKGNvb2tpZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1NjNEMFx1NTNENiBhY2Nlc3NfdG9rZW4gXHU3Njg0XHU1MDNDXHVGRjA4XHU3NTI4XHU0RThFXHU2REZCXHU1MkEwXHU1MjMwXHU1NENEXHU1RTk0XHU0RjUzXHVGRjA5XG4gICAgICAgICAgICAgIGlmIChjb29raWUuaW5jbHVkZXMoJ2FjY2Vzc190b2tlbj0nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRva2VuTWF0Y2ggPSBjb29raWUubWF0Y2goL2FjY2Vzc190b2tlbj0oW147XSspLyk7XG4gICAgICAgICAgICAgICAgaWYgKHRva2VuTWF0Y2ggJiYgdG9rZW5NYXRjaFsxXSkge1xuICAgICAgICAgICAgICAgICAgZXh0cmFjdGVkVG9rZW4gPSB0b2tlbk1hdGNoWzFdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGxldCBmaXhlZENvb2tpZSA9IGNvb2tpZTtcblxuICAgICAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc5RkJcdTk2NjQgRG9tYWluIFx1OEJCRVx1N0Y2RVx1RkYwQ1x1N0EwRFx1NTQwRVx1NEYxQVx1NjgzOVx1NjM2RVx1NzNBRlx1NTg4M1x1OTFDRFx1NjVCMFx1OEJCRVx1N0Y2RVxuICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTU0MEVcdTdBRUZcdThCQkVcdTdGNkVcdTRFODYgRG9tYWluPTEwLjgwLjguMTk5IFx1NjIxNlx1NTE3Nlx1NEVENlx1NTAzQ1x1RkYwQ1x1NEYxQVx1NUJGQ1x1ODFGNCBKYXZhU2NyaXB0IFx1NjVFMFx1NkNENVx1OEJGQlx1NTNENlxuICAgICAgICAgICAgICBmaXhlZENvb2tpZSA9IGZpeGVkQ29va2llLnJlcGxhY2UoLztcXHMqRG9tYWluPVteO10rL2dpLCAnJyk7XG5cbiAgICAgICAgICAgICAgLy8gXHU3ODZFXHU0RkREIFBhdGg9L1x1RkYwQ1x1OEJBOSBjb29raWUgXHU1NzI4XHU2NTc0XHU0RTJBXHU1N0RGXHU1NDBEXHU0RTBCXHU1M0VGXHU3NTI4XG4gICAgICAgICAgICAgIGlmICghZml4ZWRDb29raWUuaW5jbHVkZXMoJ1BhdGg9JykpIHtcbiAgICAgICAgICAgICAgICBmaXhlZENvb2tpZSArPSAnOyBQYXRoPS8nO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NURGMlx1NjcwOSBQYXRoXHVGRjBDXHU3ODZFXHU0RkREXHU2NjJGIC9cbiAgICAgICAgICAgICAgICBmaXhlZENvb2tpZSA9IGZpeGVkQ29va2llLnJlcGxhY2UoLztcXHMqUGF0aD1bXjtdKy9naSwgJzsgUGF0aD0vJyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBcdTRGRUVcdTU5MEQgU2FtZVNpdGUgXHU4QkJFXHU3RjZFXG4gICAgICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1NTMzQVx1NTIyQlx1RkYxQVxuICAgICAgICAgICAgICAvLyAtIGxvY2FsaG9zdDogXHU2RDRGXHU4OUM4XHU1NjY4XHU1QzA2XHU0RTBEXHU1NDBDXHU3QUVGXHU1M0UzXHU4OUM2XHU0RTNBXHU1NDBDXHU0RTAwXHU3QUQ5XHU3MEI5XHVGRjBDU2FtZVNpdGU9TGF4IFx1NTNFRlx1ODBGRFx1NTE0MVx1OEJCOFx1OERFOFx1N0FFRlx1NTNFMyBjb29raWVcbiAgICAgICAgICAgICAgLy8gLSBJUCBcdTU3MzBcdTU3NDBcdUZGMDhcdTU5ODIgMTAuODAuOC4xOTlcdUZGMDk6IFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NUMwNlx1NEUwRFx1NTQwQ1x1N0FFRlx1NTNFM1x1ODlDNlx1NEUzQVx1NEUwRFx1NTQwQ1x1N0FEOVx1NzBCOVx1RkYwQ1NhbWVTaXRlPUxheCBcdTRFMERcdTUxNDFcdThCQjhcdThERThcdTdBRDlcdTcwQjkgY29va2llXG4gICAgICAgICAgICAgIC8vIFx1NjI0MFx1NEVFNVx1NTcyOCBJUCBcdTU3MzBcdTU3NDBcdTczQUZcdTU4ODNcdTRFMEJcdUZGMENcdTUzNzNcdTRGN0ZcdTRGN0ZcdTc1MjggU2FtZVNpdGU9TGF4XHVGRjBDXHU4REU4XHU3QUVGXHU1M0UzIGNvb2tpZSBcdTRFNUZcdTUzRUZcdTgwRkRcdTU5MzFcdThEMjVcbiAgICAgICAgICAgICAgY29uc3QgZm9yd2FyZGVkUHJvdG8gPSByZXEuaGVhZGVyc1sneC1mb3J3YXJkZWQtcHJvdG8nXTtcbiAgICAgICAgICAgICAgY29uc3QgaXNIdHRwcyA9IGZvcndhcmRlZFByb3RvID09PSAnaHR0cHMnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIChyZXEgYXMgYW55KS5zb2NrZXQ/LmVuY3J5cHRlZCA9PT0gdHJ1ZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocmVxIGFzIGFueSkuY29ubmVjdGlvbj8uZW5jcnlwdGVkID09PSB0cnVlO1xuXG4gICAgICAgICAgICAgIC8vIFx1NjhDMFx1NkQ0Qlx1NjYyRlx1NTQyNlx1NjYyRiBsb2NhbGhvc3RcdUZGMDhcdTVGMDBcdTUzRDFcdTY3MERcdTUyQTFcdTU2NjhcdUZGMDlcdThGRDhcdTY2MkYgSVAgXHU1NzMwXHU1NzQwXHVGRjA4XHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHVGRjA5XG4gICAgICAgICAgICAgIGNvbnN0IGhvc3QgPSByZXEuaGVhZGVycy5ob3N0IHx8ICcnO1xuICAgICAgICAgICAgICBjb25zdCBpc0xvY2FsaG9zdCA9IGhvc3QuaW5jbHVkZXMoJ2xvY2FsaG9zdCcpIHx8IGhvc3QuaW5jbHVkZXMoJzEyNy4wLjAuMScpO1xuICAgICAgICAgICAgICBjb25zdCBob3N0UGFydCA9IGhvc3Quc3BsaXQoJzonKVswXTtcbiAgICAgICAgICAgICAgY29uc3QgaXNJcEFkZHJlc3MgPSBob3N0UGFydCA/IC9eXFxkK1xcLlxcZCtcXC5cXGQrXFwuXFxkKy8udGVzdChob3N0UGFydCkgOiBmYWxzZTtcblxuICAgICAgICAgICAgICAvLyBcdTY4QzBcdTZENEJcdTY2MkZcdTU0MjZcdTY2MkZcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMDhiZWxsaXMuY29tLmNuIFx1NTdERlx1NTQwRFx1RkYwOVxuICAgICAgICAgICAgICBjb25zdCBpc1Byb2R1Y3Rpb24gPSBob3N0LmluY2x1ZGVzKCdiZWxsaXMuY29tLmNuJyk7XG5cbiAgICAgICAgICAgICAgLy8gXHU3OUZCXHU5NjY0XHU3M0IwXHU2NzA5XHU3Njg0IFNhbWVTaXRlIFx1OEJCRVx1N0Y2RVxuICAgICAgICAgICAgICBmaXhlZENvb2tpZSA9IGZpeGVkQ29va2llLnJlcGxhY2UoLztcXHMqU2FtZVNpdGU9KFN0cmljdHxMYXh8Tm9uZSkvZ2ksICcnKTtcblxuICAgICAgICAgICAgICBpZiAoaXNIdHRwcykge1xuICAgICAgICAgICAgICAgIC8vIEhUVFBTIFx1NzNBRlx1NTg4M1x1NEUwQlx1RkYxQVx1NEY3Rlx1NzUyOCBTYW1lU2l0ZT1Ob25lOyBTZWN1cmVcdUZGMDhcdTY1MkZcdTYzMDFcdThERThcdTU3REZcdUZGMDlcbiAgICAgICAgICAgICAgICBmaXhlZENvb2tpZSArPSAnOyBTYW1lU2l0ZT1Ob25lOyBTZWN1cmUnO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzTG9jYWxob3N0KSB7XG4gICAgICAgICAgICAgICAgLy8gbG9jYWxob3N0ICsgSFRUUFx1RkYxQVx1NEUwRFx1OEJCRVx1N0Y2RSBTYW1lU2l0ZVx1RkYwOFx1OEJBOVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NEY3Rlx1NzUyOFx1OUVEOFx1OEJBNFx1NTAzQ1x1RkYwQ1x1OTAxQVx1NUUzOFx1NjYyRiBMYXhcdUZGMDlcbiAgICAgICAgICAgICAgICAvLyBsb2NhbGhvc3QgXHU0RTBBXHVGRjBDXHU2RDRGXHU4OUM4XHU1NjY4XHU1QkY5XHU4REU4XHU3QUVGXHU1M0UzIGNvb2tpZSBcdTY2RjRcdTVCQkRcdTY3N0VcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc0lwQWRkcmVzcykge1xuICAgICAgICAgICAgICAgIC8vIElQIFx1NTczMFx1NTc0MCArIEhUVFBcdUZGMUFcdTRFMERcdThCQkVcdTdGNkUgU2FtZVNpdGVcdUZGMENcdThCQTlcdTZENEZcdTg5QzhcdTU2NjhcdTRGN0ZcdTc1MjhcdTlFRDhcdThCQTRcdTUwM0NcdUZGMDhcdTRFMEVcdTVGMDBcdTUzRDFcdTY3MERcdTUyQTFcdTU2NjhcdTRFMDBcdTgxRjRcdUZGMDlcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBcdTUxNzZcdTRFRDZcdTYwQzVcdTUxQjVcdUZGMUFcdTRFMERcdThCQkVcdTdGNkUgU2FtZVNpdGVcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIFx1Nzg2RVx1NEZERCBIdHRwT25seSBcdTg4QUJcdTc5RkJcdTk2NjRcdUZGMDhcdTU5ODJcdTY3OUNcdTU0MEVcdTdBRUZcdThCQkVcdTdGNkVcdTRFODYgSHR0cE9ubHk9ZmFsc2VcdUZGMENcdTRGNDZcdTUzRUZcdTgwRkRcdThGRDhcdTY3MDlcdTUxNzZcdTRFRDZcdThCQkVcdTdGNkVcdUZGMDlcbiAgICAgICAgICAgICAgaWYgKGZpeGVkQ29va2llLmluY2x1ZGVzKCdIdHRwT25seScpICYmICFjb29raWUuaW5jbHVkZXMoJ0h0dHBPbmx5PWZhbHNlJykpIHtcbiAgICAgICAgICAgICAgICBmaXhlZENvb2tpZSA9IGZpeGVkQ29va2llLnJlcGxhY2UoLztcXHMqSHR0cE9ubHkvZ2ksICcnKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIFx1Nzg2RVx1NEZERCBTZWN1cmUgXHU4OEFCXHU3OUZCXHU5NjY0XHVGRjA4XHU1NzI4IEhUVFAgXHU3M0FGXHU1ODgzXHU0RTBCXHVGRjA5XG4gICAgICAgICAgICAgIGlmICghaXNIdHRwcyAmJiBmaXhlZENvb2tpZS5pbmNsdWRlcygnU2VjdXJlJykpIHtcbiAgICAgICAgICAgICAgICBmaXhlZENvb2tpZSA9IGZpeGVkQ29va2llLnJlcGxhY2UoLztcXHMqU2VjdXJlL2dpLCAnJyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMUFcdThCQkVcdTdGNkUgZG9tYWluIFx1NEUzQSAuYmVsbGlzLmNvbS5jbiBcdTRFRTVcdTY1MkZcdTYzMDFcdThERThcdTVCNTBcdTU3REZcdTU0MERcdTUxNzFcdTRFQUJcbiAgICAgICAgICAgICAgaWYgKGlzUHJvZHVjdGlvbikge1xuICAgICAgICAgICAgICAgIGZpeGVkQ29va2llICs9ICc7IERvbWFpbj0uYmVsbGlzLmNvbS5jbic7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU3M0FGXHU1ODgzXHVGRjFBXHU0RTBEXHU4QkJFXHU3RjZFIGRvbWFpblx1RkYwQ2Nvb2tpZSBcdTUzRUFcdTU3MjhcdTVGNTNcdTUyNERcdTU3REZcdTU0MERcdTRFMEJcdTY3MDlcdTY1NDhcblxuICAgICAgICAgICAgICByZXR1cm4gZml4ZWRDb29raWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ3NldC1jb29raWUnXSA9IGZpeGVkQ29va2llcztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU5ODJcdTY3OUNcdTY2MkZcdTc2N0JcdTVGNTVcdTYzQTVcdTUzRTNcdTc2ODRcdTU0Q0RcdTVFOTRcdUZGMENcdTRFMTRcdTU0Q0RcdTVFOTRcdTRGNTNcdTRFMkRcdTZDQTFcdTY3MDkgdG9rZW5cdUZGMENcdTUyMTlcdTRFQ0UgU2V0LUNvb2tpZSBcdTRFMkRcdTYzRDBcdTUzRDZcdTVFNzZcdTZERkJcdTUyQTBcdTUyMzBcdTU0Q0RcdTVFOTRcdTRGNTNcbiAgICAgICAgICAvLyBcdThGRDlcdTY4MzdcdTUyNERcdTdBRUZcdTVDMzFcdTUzRUZcdTRFRTVcdTRFQ0VcdTU0Q0RcdTVFOTRcdTRGNTNcdTRFMkRcdTgzQjdcdTUzRDYgdG9rZW5cdUZGMENcdTUzNzNcdTRGN0YgY29va2llIFx1NjYyRiBIdHRwT25seSBcdTc2ODRcbiAgICAgICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTRGN0ZcdTc1Mjggc2VsZkhhbmRsZVJlc3BvbnNlOiB0cnVlIFx1NjVGNlx1RkYwQ1x1OTcwMFx1ODk4MVx1NjI0Qlx1NTJBOFx1NTkwNFx1NzQwNlx1NjI0MFx1NjcwOVx1NTRDRFx1NUU5NFxuICAgICAgICAgIGNvbnN0IGNodW5rczogQnVmZmVyW10gPSBbXTtcblxuICAgICAgICAgIHByb3h5UmVzLm9uKCdkYXRhJywgKGNodW5rOiBCdWZmZXIpID0+IHtcbiAgICAgICAgICAgIGNodW5rcy5wdXNoKGNodW5rKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHByb3h5UmVzLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNMb2dpblJlcXVlc3QgJiYgZXh0cmFjdGVkVG9rZW4pIHtcbiAgICAgICAgICAgICAgLy8gXHU0RkREXHU1QjU4XHU1MzlGXHU1OUNCXHU1NENEXHU1RTk0XHU1OTM0XG4gICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsSGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQ+ID0ge307XG4gICAgICAgICAgICAgIE9iamVjdC5rZXlzKHByb3h5UmVzLmhlYWRlcnMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb3dlcktleSA9IGtleS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIGlmIChsb3dlcktleSAhPT0gJ2NvbnRlbnQtbGVuZ3RoJykge1xuICAgICAgICAgICAgICAgICAgb3JpZ2luYWxIZWFkZXJzW2tleV0gPSBwcm94eVJlcy5oZWFkZXJzW2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBCdWZmZXIuY29uY2F0KGNodW5rcykudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgICAgICAgICBsZXQgcmVzcG9uc2VEYXRhOiBhbnk7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgcmVzcG9uc2VEYXRhID0gSlNPTi5wYXJzZShib2R5KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NEUwRFx1NjYyRiBKU09OXHVGRjBDXHU3NkY0XHU2M0E1XHU4RkQ0XHU1NkRFXHU1MzlGXHU1OUNCXHU1NENEXHU1RTk0XG4gICAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKHByb3h5UmVzLnN0YXR1c0NvZGUgfHwgMjAwLCBvcmlnaW5hbEhlYWRlcnMpO1xuICAgICAgICAgICAgICAgICAgcmVzLmVuZChib2R5KTtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTU0Q0RcdTVFOTRcdTRGNTNcdTRFMkRcdTZDQTFcdTY3MDkgdG9rZW5cdUZGMENcdTZERkJcdTUyQTBcdTRFQ0UgY29va2llIFx1NEUyRFx1NjNEMFx1NTNENlx1NzY4NCB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2VEYXRhLnRva2VuICYmICFyZXNwb25zZURhdGEuYWNjZXNzVG9rZW4gJiYgZXh0cmFjdGVkVG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlRGF0YS50b2tlbiA9IGV4dHJhY3RlZFRva2VuO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VEYXRhLmFjY2Vzc1Rva2VuID0gZXh0cmFjdGVkVG9rZW47XG4gICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gXHU5MUNEXHU2NUIwXHU4QkJFXHU3RjZFIENvbnRlbnQtTGVuZ3RoXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3Qm9keSA9IEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlRGF0YSk7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWxIZWFkZXJzWydjb250ZW50LWxlbmd0aCddID0gQnVmZmVyLmJ5dGVMZW5ndGgobmV3Qm9keSkudG9TdHJpbmcoKTtcblxuICAgICAgICAgICAgICAgIC8vIFx1NTNEMVx1OTAwMVx1NEZFRVx1NjUzOVx1NTQwRVx1NzY4NFx1NTRDRFx1NUU5NFxuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQocHJveHlSZXMuc3RhdHVzQ29kZSB8fCAyMDAsIG9yaWdpbmFsSGVhZGVycyk7XG4gICAgICAgICAgICAgICAgcmVzLmVuZChuZXdCb2R5KTtcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaTE4bi9uby1jaGluZXNlLWNoYXJhY3RlclxuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignW1Byb3h5XSBcdTI3MTcgXHU1OTA0XHU3NDA2XHU3NjdCXHU1RjU1XHU1NENEXHU1RTk0XHU2NUY2XHU1MUZBXHU5NTE5OicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKHByb3h5UmVzLnN0YXR1c0NvZGUgfHwgMjAwLCBwcm94eVJlcy5oZWFkZXJzKTtcbiAgICAgICAgICAgICAgICByZXMuZW5kKEJ1ZmZlci5jb25jYXQoY2h1bmtzKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFx1OTc1RVx1NzY3Qlx1NUY1NVx1OEJGN1x1NkM0Mlx1NjIxNlx1NkNBMVx1NjcwOSB0b2tlbiBcdTY1RjZcdUZGMENcdTZCNjNcdTVFMzhcdThGNkNcdTUzRDFcdTU0Q0RcdTVFOTRcbiAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZChwcm94eVJlcy5zdGF0dXNDb2RlIHx8IDIwMCwgcHJveHlSZXMuaGVhZGVycyk7XG4gICAgICAgICAgICAgIHJlcy5lbmQoQnVmZmVyLmNvbmNhdChjaHVua3MpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHByb3h5UmVzLm9uKCdlcnJvcicsIChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaTE4bi9uby1jaGluZXNlLWNoYXJhY3RlclxuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdbUHJveHldIFx1MjcxNyBcdThCRkJcdTUzRDZcdTU0Q0RcdTVFOTRcdTZENDFcdTY1RjZcdTUxRkFcdTk1MTk6JywgZXJyKTtcbiAgICAgICAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwLCB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogb3JpZ2luIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpMThuL25vLWNoaW5lc2UtY2hhcmFjdGVyXG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ1x1NEVFM1x1NzQwNlx1NTkwNFx1NzQwNlx1NTRDRFx1NUU5NFx1NjVGNlx1NTFGQVx1OTUxOScgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gXHU1OTA0XHU3NDA2XHU5NTE5XHU4QkVGXG4gICAgICBwcm94eS5vbignZXJyb3InLCAoZXJyOiBFcnJvciwgcmVxOiBJbmNvbWluZ01lc3NhZ2UsIHJlczogU2VydmVyUmVzcG9uc2UpID0+IHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKCdbUHJveHldIEVycm9yOicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgbG9nZ2VyLmVycm9yKCdbUHJveHldIFJlcXVlc3QgVVJMOicsIHJlcS51cmwpO1xuICAgICAgICBsb2dnZXIuZXJyb3IoJ1tQcm94eV0gVGFyZ2V0OicsIGJhY2tlbmRUYXJnZXQpO1xuICAgICAgICBpZiAocmVzICYmICFyZXMuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMCwge1xuICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiByZXEuaGVhZGVycy5vcmlnaW4gfHwgJyonLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpMThuL25vLWNoaW5lc2UtY2hhcmFjdGVyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICBjb2RlOiA1MDAsXG4gICAgICAgICAgICBtZXNzYWdlOiBgXHU0RUUzXHU3NDA2XHU5NTE5XHU4QkVGXHVGRjFBXHU2NUUwXHU2Q0Q1XHU4RkRFXHU2M0E1XHU1MjMwXHU1NDBFXHU3QUVGXHU2NzBEXHU1MkExXHU1NjY4ICR7YmFja2VuZFRhcmdldH1gLFxuICAgICAgICAgICAgZXJyb3I6IGVyci5tZXNzYWdlLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcbiAgfSxcbiAgLy8gXHU0RUUzXHU3NDA2IGhvbWUtYXBwIFx1NTIzMFx1NUYwMFx1NTNEMVx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwOFZ1ZSBTUEFcdUZGMDlcbiAgJy9ob21lJzoge1xuICAgIHRhcmdldDogJ2h0dHA6Ly8xMC44MC44LjE5OTo4MDk1JyxcbiAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgc2VjdXJlOiBmYWxzZSxcbiAgICByZXdyaXRlOiAocGF0aDogc3RyaW5nKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9ob21lLywgJycpLFxuICB9LFxufTtcblxuLy8gXHU1QkZDXHU1MUZBXHU1MUZEXHU2NTcwXHVGRjBDXHU1RUY2XHU4RkRGXHU1MjFCXHU1RUZBIHByb3h5IFx1OTE0RFx1N0Y2RVxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb3h5Q29uZmlnKCkge1xuICByZXR1cm4gcHJveHk7XG59XG5cbi8vIFx1NEU1Rlx1NUJGQ1x1NTFGQSBwcm94eSBcdTVCRjlcdThDNjFcdUZGMDhcdTc1MjhcdTRFOEVcdTU0MTFcdTU0MEVcdTUxN0NcdTVCQjlcdUZGMDlcbmV4cG9ydCB7IHByb3h5IH07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxzeXN0ZW0tYXBwXFxcXHZpdGUtcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxhcHBzXFxcXHN5c3RlbS1hcHBcXFxcdml0ZS1wbHVnaW5zXFxcXHN2Zy1obXIudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vYXBwcy9zeXN0ZW0tYXBwL3ZpdGUtcGx1Z2lucy9zdmctaG1yLnRzXCI7LyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueSAqL1xyXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgeyByZWFkRmlsZVN5bmMsIHJlYWRkaXJTeW5jLCBleGlzdHNTeW5jIH0gZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBiYXNlbmFtZSwgZXh0bmFtZSwgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xyXG5cclxuLyoqXHJcbiAqIFx1NUU5NFx1NzUyOFx1N0VBN1x1NTIyQlx1NzY4NCBTVkcgSE1SIFx1NjNEMlx1NEVGNlxyXG4gKiBcdTRFMTNcdTk1RThcdTU5MDRcdTc0MDYgYXBwcy9zeXN0ZW0tYXBwL3NyYy9hc3NldHMvaWNvbnMvIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NCBTVkcgXHU2NTg3XHU0RUY2XHJcbiAqIFx1NjUyRlx1NjMwMVx1NzBFRFx1NjZGNFx1NjVCMFx1RkYwQ1x1NjVFMFx1OTcwMFx1OTFDRFx1NjVCMFx1Njc4NFx1NUVGQVx1NTE3MVx1NEVBQlx1NTMwNVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHN2Z0htclBsdWdpbihhcHBEaXI6IHN0cmluZyk6IFBsdWdpbiB7XHJcbiAgY29uc3QgaWNvbnNEaXIgPSBqb2luKGFwcERpciwgJ3NyYycsICdhc3NldHMnLCAnaWNvbnMnKTtcclxuICBsZXQgc3ZnU3ByaXRlSHRtbCA9ICcnO1xyXG4gIGxldCB2aXRlRGV2U2VydmVyOiBhbnkgPSBudWxsO1xyXG5cclxuICAvKipcclxuICAgKiBcdTYyNkJcdTYzQ0ZcdTVFNzZcdTc1MUZcdTYyMTAgU1ZHIHNwcml0ZSBIVE1MXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZ2VuZXJhdGVTdmdTcHJpdGUoKTogc3RyaW5nIHtcclxuICAgIGlmICghZXhpc3RzU3luYyhpY29uc0RpcikpIHtcclxuICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN2Z1N5bWJvbHM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZmlsZXMgPSByZWFkZGlyU3luYyhpY29uc0RpciwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xyXG4gICAgICBcclxuICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XHJcbiAgICAgICAgaWYgKGZpbGUuaXNGaWxlKCkgJiYgZXh0bmFtZShmaWxlLm5hbWUpID09PSAnLnN2ZycpIHtcclxuICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gam9pbihpY29uc0RpciwgZmlsZS5uYW1lKTtcclxuICAgICAgICAgIGNvbnN0IGljb25OYW1lID0gYmFzZW5hbWUoZmlsZS5uYW1lLCAnLnN2ZycpO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsZXQgc3ZnQ29udGVudCA9IHJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBcdTZFMDVcdTc0MDYgWE1MIFx1NThGMFx1NjYwRVx1NTQ4QyBET0NUWVBFXHJcbiAgICAgICAgICAgIHN2Z0NvbnRlbnQgPSBzdmdDb250ZW50XHJcbiAgICAgICAgICAgICAgLnJlcGxhY2UoLzxcXD94bWxbXj5dKlxcPz4vZywgJycpXHJcbiAgICAgICAgICAgICAgLnJlcGxhY2UoLzwhRE9DVFlQRVtePl0qPi9nLCAnJyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBcdTYzRDBcdTUzRDYgdmlld0JveFxyXG4gICAgICAgICAgICBjb25zdCB2aWV3Qm94TWF0Y2ggPSBzdmdDb250ZW50Lm1hdGNoKC92aWV3Qm94PVtcIiddKFteXCInXSspW1wiJ10vKTtcclxuICAgICAgICAgICAgY29uc3Qgd2lkdGhNYXRjaCA9IHN2Z0NvbnRlbnQubWF0Y2goL3dpZHRoPVtcIiddKFteXCInXSspW1wiJ10vKTtcclxuICAgICAgICAgICAgY29uc3QgaGVpZ2h0TWF0Y2ggPSBzdmdDb250ZW50Lm1hdGNoKC9oZWlnaHQ9W1wiJ10oW15cIiddKylbXCInXS8pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHZpZXdCb3ggPSAnJztcclxuICAgICAgICAgICAgaWYgKHZpZXdCb3hNYXRjaCkge1xyXG4gICAgICAgICAgICAgIHZpZXdCb3ggPSBgdmlld0JveD1cIiR7dmlld0JveE1hdGNoWzFdfVwiYDtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh3aWR0aE1hdGNoICYmIGhlaWdodE1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgdmlld0JveCA9IGB2aWV3Qm94PVwiMCAwICR7d2lkdGhNYXRjaFsxXX0gJHtoZWlnaHRNYXRjaFsxXX1cImA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFx1NjNEMFx1NTNENiBTVkcgXHU1MTg1XHU1QkI5XHVGRjA4XHU3OUZCXHU5NjY0XHU1OTE2XHU1QzQyIHN2ZyBcdTY4MDdcdTdCN0VcdUZGMDlcclxuICAgICAgICAgICAgY29uc3QgaW5uZXJDb250ZW50ID0gc3ZnQ29udGVudFxyXG4gICAgICAgICAgICAgIC5yZXBsYWNlKC88c3ZnW14+XSo+LywgJycpXHJcbiAgICAgICAgICAgICAgLnJlcGxhY2UoLzxcXC9zdmc+LywgJycpXHJcbiAgICAgICAgICAgICAgLnJlcGxhY2UoLyhcXHJcXG58XFxufFxccikvZ20sICcnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFx1NzUxRlx1NjIxMCBzeW1ib2xcclxuICAgICAgICAgICAgY29uc3Qgc3ltYm9sID0gYDxzeW1ib2wgaWQ9XCJpY29uLSR7aWNvbk5hbWV9XCIgJHt2aWV3Qm94fT4ke2lubmVyQ29udGVudH08L3N5bWJvbD5gO1xyXG4gICAgICAgICAgICBzdmdTeW1ib2xzLnB1c2goc3ltYm9sKTtcclxuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtzdmctaG1yXSBcdThCRkJcdTUzRDYgU1ZHIFx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNTogJHtmaWxlUGF0aH1gLCBlcnIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKGBbc3ZnLWhtcl0gXHU2MjZCXHU2M0NGXHU1NkZFXHU2ODA3XHU3NkVFXHU1RjU1XHU1OTMxXHU4RDI1OiAke2ljb25zRGlyfWAsIGVycik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc3ZnU3ltYm9scy5qb2luKCcnKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFx1NjZGNFx1NjVCMCBTVkcgc3ByaXRlXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gdXBkYXRlU3ZnU3ByaXRlKCkge1xyXG4gICAgY29uc3QgbmV3SHRtbCA9IGdlbmVyYXRlU3ZnU3ByaXRlKCk7XHJcbiAgICBjb25zdCBjaGFuZ2VkID0gbmV3SHRtbCAhPT0gc3ZnU3ByaXRlSHRtbDtcclxuICAgIHN2Z1Nwcml0ZUh0bWwgPSBuZXdIdG1sO1xyXG4gICAgXHJcbiAgICBpZiAoY2hhbmdlZCAmJiB2aXRlRGV2U2VydmVyKSB7XHJcbiAgICAgIC8vIFx1OTAxQVx1OEZDNyBXZWJTb2NrZXQgXHU1M0QxXHU5MDAxXHU2NkY0XHU2NUIwXHU2RDg4XHU2MDZGXHJcbiAgICAgIHZpdGVEZXZTZXJ2ZXIud3Muc2VuZCh7XHJcbiAgICAgICAgdHlwZTogJ2N1c3RvbScsXHJcbiAgICAgICAgZXZlbnQ6ICdzdmctaG1yLXVwZGF0ZScsXHJcbiAgICAgICAgZGF0YTogeyBzdmdIdG1sOiBzdmdTcHJpdGVIdG1sIH1cclxuICAgICAgfSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBcdTU0MENcdTY1RjZcdTkwMUFcdThGQzcgd2luZG93IFx1NEU4Qlx1NEVGNlx1ODlFNlx1NTNEMVx1RkYwOFx1NTkwN1x1NzUyOFx1NjVCOVx1Njg0OFx1RkYwOVxyXG4gICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdThGRDlcdTk3MDBcdTg5ODFcdTU3MjhcdTVCQTJcdTYyMzdcdTdBRUZcdTRFRTNcdTc4MDFcdTRFMkRcdTc2RDFcdTU0MkMgd2luZG93IFx1NEU4Qlx1NEVGNlxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6ICdzdmctaG1yJyxcclxuICAgIGVuZm9yY2U6ICdwcmUnLFxyXG4gICAgXHJcbiAgICByZXNvbHZlSWQoaWQ6IHN0cmluZykge1xyXG4gICAgICAvLyBcdTUyMUJcdTVFRkFcdTg2NUFcdTYyREZcdTZBMjFcdTU3NTdcclxuICAgICAgaWYgKGlkID09PSAndmlydHVhbDpzdmctaG1yJykge1xyXG4gICAgICAgIHJldHVybiBpZDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIGxvYWQoaWQ6IHN0cmluZykge1xyXG4gICAgICAvLyBcdThGRDRcdTU2REVcdTg2NUFcdTYyREZcdTZBMjFcdTU3NTdcdTUxODVcdTVCQjlcclxuICAgICAgaWYgKGlkID09PSAndmlydHVhbDpzdmctaG1yJykge1xyXG4gICAgICAgIHJldHVybiBgXHJcbi8vIFNWRyBITVIgXHU1QkEyXHU2MjM3XHU3QUVGXHU2QTIxXHU1NzU3XHJcbmV4cG9ydCBjb25zdCBzdmdTcHJpdGVIdG1sID0gJHtKU09OLnN0cmluZ2lmeShzdmdTcHJpdGVIdG1sKX07XHJcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTdmdTcHJpdGUobmV3SHRtbCkge1xyXG4gIGNvbnN0IHNwcml0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmctaG1yLXNwcml0ZScpO1xyXG4gIGlmIChzcHJpdGUpIHtcclxuICAgIHNwcml0ZS5pbm5lckhUTUwgPSBuZXdIdG1sO1xyXG4gIH1cclxufVxyXG5cclxuLy8gXHU1OTgyXHU2NzlDXHU2NTJGXHU2MzAxIEhNUlx1RkYwQ1x1NzZEMVx1NTQyQ1x1NjZGNFx1NjVCMFxyXG5pZiAoaW1wb3J0Lm1ldGEuaG90KSB7XHJcbiAgaW1wb3J0Lm1ldGEuaG90Lm9uKCdzdmctaG1yLXVwZGF0ZScsIChkYXRhKSA9PiB7XHJcbiAgICBpZiAoZGF0YSAmJiBkYXRhLnN2Z0h0bWwpIHtcclxuICAgICAgdXBkYXRlU3ZnU3ByaXRlKGRhdGEuc3ZnSHRtbCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuYDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXI6IGFueSkge1xyXG4gICAgICB2aXRlRGV2U2VydmVyID0gc2VydmVyO1xyXG4gICAgICBcclxuICAgICAgLy8gXHU1MjFEXHU1OUNCXHU1MzE2IFNWRyBzcHJpdGVcclxuICAgICAgdXBkYXRlU3ZnU3ByaXRlKCk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBidWlsZFN0YXJ0KCkge1xyXG4gICAgICAvLyBcdTY3ODRcdTVFRkFcdTY1RjZcdTRFNUZcdTc1MUZcdTYyMTAgU1ZHIHNwcml0ZVxyXG4gICAgICB1cGRhdGVTdmdTcHJpdGUoKTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIGhhbmRsZUhvdFVwZGF0ZShjdHg6IGFueSkge1xyXG4gICAgICBjb25zdCBmaWxlUGF0aCA9IGN0eC5maWxlLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcclxuICAgICAgY29uc3QgaWNvbnNEaXJQYXRoID0gaWNvbnNEaXIucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xyXG4gICAgICBcclxuICAgICAgLy8gXHU2OEMwXHU2RDRCIFNWRyBcdTY1ODdcdTRFRjZcdTUzRDhcdTUzMTZcclxuICAgICAgaWYgKGZpbGVQYXRoLmluY2x1ZGVzKGljb25zRGlyUGF0aCkgJiYgZmlsZVBhdGguZW5kc1dpdGgoJy5zdmcnKSkge1xyXG4gICAgICAgIHVwZGF0ZVN2Z1Nwcml0ZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFx1ODlFNlx1NTNEMVx1ODY1QVx1NjJERlx1NkEyMVx1NTc1N1x1NjZGNFx1NjVCMFxyXG4gICAgICAgIGNvbnN0IG1vZHVsZSA9IGN0eC5zZXJ2ZXIubW9kdWxlR3JhcGguZ2V0TW9kdWxlQnlJZCgndmlydHVhbDpzdmctaG1yJyk7XHJcbiAgICAgICAgaWYgKG1vZHVsZSkge1xyXG4gICAgICAgICAgY3R4LnNlcnZlci5tb2R1bGVHcmFwaC5pbnZhbGlkYXRlTW9kdWxlKG1vZHVsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFx1OTAxQVx1OEZDNyBXZWJTb2NrZXQgXHU1M0QxXHU5MDAxXHU2NkY0XHU2NUIwXHJcbiAgICAgICAgaWYgKHZpdGVEZXZTZXJ2ZXIpIHtcclxuICAgICAgICAgIHZpdGVEZXZTZXJ2ZXIud3Muc2VuZCh7XHJcbiAgICAgICAgICAgIHR5cGU6ICdjdXN0b20nLFxyXG4gICAgICAgICAgICBldmVudDogJ3N2Zy1obXItdXBkYXRlJyxcclxuICAgICAgICAgICAgZGF0YTogeyBzdmdIdG1sOiBzdmdTcHJpdGVIdG1sIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBcdThGRDRcdTU2REVcdTg2NUFcdTYyREZcdTZBMjFcdTU3NTdcdUZGMENcdTg5RTZcdTUzRDEgSE1SXHJcbiAgICAgICAgcmV0dXJuIFttb2R1bGVdLmZpbHRlcihCb29sZWFuKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIHRyYW5zZm9ybUluZGV4SHRtbChodG1sOiBzdHJpbmcpIHtcclxuICAgICAgLy8gXHU1OTgyXHU2NzlDXHU4RkQ4XHU2Q0ExXHU2NzA5XHU3NTFGXHU2MjEwXHVGRjBDXHU1MTQ4XHU3NTFGXHU2MjEwXHU0RTAwXHU2QjIxXHJcbiAgICAgIGlmICghc3ZnU3ByaXRlSHRtbCkge1xyXG4gICAgICAgIHVwZGF0ZVN2Z1Nwcml0ZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBpZiAoIXN2Z1Nwcml0ZUh0bWwpIHtcclxuICAgICAgICByZXR1cm4gaHRtbDtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU1REYyXHU3RUNGXHU2Q0U4XHU1MTY1XHVGRjA4XHU5MDdGXHU1MTREXHU5MUNEXHU1OTBEXHU2Q0U4XHU1MTY1XHVGRjA5XHJcbiAgICAgIGlmIChodG1sLmluY2x1ZGVzKCdzdmctaG1yLXNwcml0ZScpKSB7XHJcbiAgICAgICAgcmV0dXJuIGh0bWw7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8vIFx1NzUxRlx1NjIxMFx1NUJBMlx1NjIzN1x1N0FFRlx1ODExQVx1NjcyQ1xyXG4gICAgICBjb25zdCBlc2NhcGVkSHRtbCA9IEpTT04uc3RyaW5naWZ5KHN2Z1Nwcml0ZUh0bWwpO1xyXG4gICAgICBjb25zdCBzY3JpcHQgPSBgXHJcbjxzY3JpcHQ+XHJcbihmdW5jdGlvbigpIHtcclxuICB2YXIgc3ZnU3ByaXRlSWQgPSAnc3ZnLWhtci1zcHJpdGUnO1xyXG4gIHZhciB1cGRhdGVBdHRlbXB0cyA9IDA7XHJcbiAgdmFyIG1heEF0dGVtcHRzID0gMTAwO1xyXG4gIHZhciBjdXJyZW50SHRtbCA9ICR7ZXNjYXBlZEh0bWx9O1xyXG4gIHZhciBpc0xvYWRlZCA9IGZhbHNlO1xyXG4gIHZhciBpc0xvYWRpbmcgPSBmYWxzZTtcclxuICBcclxuICAgICAgLy8gXHU2OEMwXHU2N0U1XHU1NkZFXHU2ODA3XHU2NjJGXHU1NDI2XHU1REYyXHU1QjU4XHU1NzI4XHJcbiAgICAgIGZ1bmN0aW9uIGhhc0ljb25zKHNwcml0ZSkge1xyXG4gICAgICAgIGlmICghc3ByaXRlKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgdmFyIHdpbmRtaWxsID0gc3ByaXRlLnF1ZXJ5U2VsZWN0b3IoJyNpY29uLXdpbmRtaWxsJyk7XHJcbiAgICAgICAgdmFyIHN0YXIgPSBzcHJpdGUucXVlcnlTZWxlY3RvcignI2ljb24tc3RhcicpO1xyXG4gICAgICAgIHJldHVybiAhISh3aW5kbWlsbCB8fCBzdGFyKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgLy8gXHU5QThDXHU4QkMxXHU1NkZFXHU2ODA3XHU2NjJGXHU1NDI2XHU3NzFGXHU3Njg0XHU1QjU4XHU1NzI4XHJcbiAgICAgIGZ1bmN0aW9uIHZlcmlmeUljb25zKCkge1xyXG4gICAgICAgIHZhciBidGNTcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRjLXN2Zy1zcHJpdGUnKTtcclxuICAgICAgICBpZiAoYnRjU3ByaXRlKSB7XHJcbiAgICAgICAgICB2YXIgd2luZG1pbGwgPSBidGNTcHJpdGUucXVlcnlTZWxlY3RvcignI2ljb24td2luZG1pbGwnKTtcclxuICAgICAgICAgIHZhciBzdGFyID0gYnRjU3ByaXRlLnF1ZXJ5U2VsZWN0b3IoJyNpY29uLXN0YXInKTtcclxuICAgICAgICAgIGlmICh3aW5kbWlsbCAmJiBzdGFyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdbc3ZnLWhtcl0gXHUyNkEwXHVGRTBGIFx1NTZGRVx1NjgwN1x1OUE4Q1x1OEJDMVx1NTkzMVx1OEQyNVx1RkYxQScsIHtcclxuICAgICAgICAgICAgICB3aW5kbWlsbDogISF3aW5kbWlsbCxcclxuICAgICAgICAgICAgICBzdGFyOiAhIXN0YXIsXHJcbiAgICAgICAgICAgICAgc3RhcjogISFzdGFyXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIGZ1bmN0aW9uIGxvYWRTdmdTcHJpdGUoKSB7XHJcbiAgICAgICAgLy8gXHU5NjMyXHU2QjYyXHU5MUNEXHU1OTBEXHU2MjY3XHU4ODRDXHJcbiAgICAgICAgaWYgKGlzTG9hZGluZyB8fCBpc0xvYWRlZCkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB1cGRhdGVBdHRlbXB0cysrO1xyXG4gICAgICAgIGlmICh1cGRhdGVBdHRlbXB0cyA+IG1heEF0dGVtcHRzKSB7XHJcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1tzdmctaG1yXSBcdTY1RTBcdTZDRDVcdTUyQTBcdThGN0QgU1ZHIHNwcml0ZVx1RkYwQ1x1NURGMlx1OEZCRVx1NTIzMFx1NjcwMFx1NTkyN1x1NUMxRFx1OEJENVx1NkIyMVx1NjU3MCcpO1xyXG4gICAgICAgICAgaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICghZG9jdW1lbnQuYm9keSkge1xyXG4gICAgICAgICAgaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBsb2FkU3ZnU3ByaXRlKCk7XHJcbiAgICAgICAgICB9LCA1MCk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAvLyBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTVERjJcdTVCNThcdTU3MjhcdTUxNzFcdTRFQUJcdTUzMDVcdTc2ODQgU1ZHIHNwcml0ZVxyXG4gICAgICAgICAgdmFyIGV4aXN0aW5nQnRjU3ByaXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0Yy1zdmctc3ByaXRlJyk7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NUI1OFx1NTcyOFx1NTE3MVx1NEVBQlx1NTMwNVx1NzY4NCBzcHJpdGVcdUZGMENcdTVDMDZcdTYyMTFcdTRFRUNcdTc2ODRcdTU2RkVcdTY4MDdcdTZERkJcdTUyQTBcdTUyMzBcdTUxNzZcdTRFMkRcclxuICAgICAgICAgIGlmIChleGlzdGluZ0J0Y1Nwcml0ZSkge1xyXG4gICAgICAgICAgICAvLyBcdTY4QzBcdTY3RTVcdTU2RkVcdTY4MDdcdTY2MkZcdTU0MjZcdTVERjJcdTdFQ0ZcdTZERkJcdTUyQTBcdThGQzdcclxuICAgICAgICAgICAgaWYgKCFoYXNJY29ucyhleGlzdGluZ0J0Y1Nwcml0ZSkgJiYgY3VycmVudEh0bWwpIHtcclxuICAgICAgICAgICAgICAvLyBcdTc4NkVcdTRGREQgc3ByaXRlIFx1NURGMlx1N0VDRlx1NjcwOVx1NTE4NVx1NUJCOVx1RkYwOFx1N0I0OVx1NUY4NVx1NTE3MVx1NEVBQlx1NTMwNVx1NjNEMlx1NEVGNlx1NUI4Q1x1NjIxMFx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwOVxyXG4gICAgICAgICAgICAgIGlmIChleGlzdGluZ0J0Y1Nwcml0ZS5pbm5lckhUTUwudHJpbSgpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGV4aXN0aW5nQnRjU3ByaXRlLmlubmVySFRNTCA9IGV4aXN0aW5nQnRjU3ByaXRlLmlubmVySFRNTCArIGN1cnJlbnRIdG1sO1xyXG4gICAgICAgICAgICAgICAgaXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyBcdTlBOENcdThCQzFcdTU2RkVcdTY4MDdcdTY2MkZcdTU0MjZcdTc3MUZcdTc2ODRcdTZERkJcdTUyQTBcdTYyMTBcdTUyOUZcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgIHZlcmlmeUljb25zKCk7XHJcbiAgICAgICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBzcHJpdGUgXHU4RkQ4XHU2Q0ExXHU2NzA5XHU1MTg1XHU1QkI5XHVGRjBDXHU3QjQ5XHU1Rjg1XHU0RTAwXHU0RTBCXHU1MThEXHU4QkQ1XHJcbiAgICAgICAgICAgICAgICBpc0xvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgIGxvYWRTdmdTcHJpdGUoKTtcclxuICAgICAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ljb25zKGV4aXN0aW5nQnRjU3ByaXRlKSkge1xyXG4gICAgICAgICAgICAgIC8vIFx1NTZGRVx1NjgwN1x1NURGMlx1N0VDRlx1NUI1OFx1NTcyOFx1RkYwQ1x1NjgwN1x1OEJCMFx1NEUzQVx1NURGMlx1NTJBMFx1OEY3RFxyXG4gICAgICAgICAgICAgIGlzTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICB2ZXJpZnlJY29ucygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NURGMlx1NUI1OFx1NTcyOFx1ODFFQVx1NURGMVx1NzY4NCBzcHJpdGVcclxuICAgICAgdmFyIGV4aXN0aW5nU3ByaXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3ZnU3ByaXRlSWQpO1xyXG4gICAgICBpZiAoZXhpc3RpbmdTcHJpdGUpIHtcclxuICAgICAgICBpc0xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAvLyBcdTU0MjZcdTUyMTlcdTUyMUJcdTVFRkFcdTY1QjBcdTc2ODQgc3ByaXRlXHJcbiAgICAgIHZhciBzdmdEb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgJ3N2ZycpO1xyXG4gICAgICBzdmdEb20uaWQgPSBzdmdTcHJpdGVJZDtcclxuICAgICAgc3ZnRG9tLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgICAgc3ZnRG9tLnN0eWxlLndpZHRoID0gJzAnO1xyXG4gICAgICBzdmdEb20uc3R5bGUuaGVpZ2h0ID0gJzAnO1xyXG4gICAgICBzdmdEb20uc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcclxuICAgICAgc3ZnRG9tLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcclxuICAgICAgc3ZnRG9tLnNldEF0dHJpYnV0ZSgneG1sbnMnLCAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnKTtcclxuICAgICAgc3ZnRG9tLnNldEF0dHJpYnV0ZSgneG1sbnM6eGxpbmsnLCAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycpO1xyXG4gICAgICBzdmdEb20uaW5uZXJIVE1MID0gY3VycmVudEh0bWw7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKHN2Z0RvbSwgZG9jdW1lbnQuYm9keS5maXJzdENoaWxkKTtcclxuICAgICAgXHJcbiAgICAgIGlzTG9hZGVkID0gdHJ1ZTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignW3N2Zy1obXJdIFx1NTJBMFx1OEY3RCBTVkcgc3ByaXRlIFx1NTkzMVx1OEQyNTonLCBlKTtcclxuICAgICAgaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbG9hZFN2Z1Nwcml0ZSgpO1xyXG4gICAgICB9LCAxMDApO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiB1cGRhdGVTdmdTcHJpdGUobmV3SHRtbCkge1xyXG4gICAgaWYgKCFuZXdIdG1sKSByZXR1cm47XHJcbiAgICBcclxuICAgIC8vIFx1NEYxOFx1NTE0OFx1NjZGNFx1NjVCMFx1NTE3MVx1NEVBQlx1NTMwNVx1NzY4NCBzcHJpdGVcdUZGMDhcdTU5ODJcdTY3OUNcdTVCNThcdTU3MjhcdUZGMDlcclxuICAgIHZhciBidGNTcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRjLXN2Zy1zcHJpdGUnKTtcclxuICAgIGlmIChidGNTcHJpdGUpIHtcclxuICAgICAgLy8gXHU3OUZCXHU5NjY0XHU2NUU3XHU3Njg0XHU1RTk0XHU3NTI4XHU1MTg1XHU1NkZFXHU2ODA3XHVGRjBDXHU2REZCXHU1MkEwXHU2NUIwXHU3Njg0XHJcbiAgICAgIHZhciBvbGRTeW1ib2xzID0gYnRjU3ByaXRlLnF1ZXJ5U2VsZWN0b3JBbGwoJ3N5bWJvbFtpZD1cImljb24td2luZG1pbGxcIl0sIHN5bWJvbFtpZD1cImljb24tc3RhclwiXScpO1xyXG4gICAgICBvbGRTeW1ib2xzLmZvckVhY2goZnVuY3Rpb24oc3ltYm9sKSB7XHJcbiAgICAgICAgc3ltYm9sLnJlbW92ZSgpO1xyXG4gICAgICB9KTtcclxuICAgICAgXHJcbiAgICAgIC8vIFx1NkRGQlx1NTJBMFx1NjVCMFx1NTZGRVx1NjgwN1xyXG4gICAgICBpZiAobmV3SHRtbCkge1xyXG4gICAgICAgIGJ0Y1Nwcml0ZS5pbm5lckhUTUwgPSBidGNTcHJpdGUuaW5uZXJIVE1MICsgbmV3SHRtbDtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgY3VycmVudEh0bWwgPSBuZXdIdG1sO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIFx1NTQyNlx1NTIxOVx1NjZGNFx1NjVCMFx1ODFFQVx1NURGMVx1NzY4NCBzcHJpdGVcclxuICAgIHZhciBzcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzdmdTcHJpdGVJZCk7XHJcbiAgICBpZiAoc3ByaXRlKSB7XHJcbiAgICAgIHNwcml0ZS5pbm5lckhUTUwgPSBuZXdIdG1sO1xyXG4gICAgICBjdXJyZW50SHRtbCA9IG5ld0h0bWw7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjdXJyZW50SHRtbCA9IG5ld0h0bWw7XHJcbiAgICAgIGlzTG9hZGVkID0gZmFsc2U7XHJcbiAgICAgIGxvYWRTdmdTcHJpdGUoKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgLy8gXHU3NkQxXHU1NDJDIFZpdGUgSE1SIFdlYlNvY2tldCBcdTZEODhcdTYwNkZcclxuICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggcWlhbmt1biBcdTczQUZcdTU4ODNcdTRFMkRcdUZGMENcdTRFMERcdTgwRkRcdTRGN0ZcdTc1MjggaW1wb3J0Lm1ldGEuaG90XHVGRjBDXHU2MjQwXHU0RUU1XHU0RjdGXHU3NTI4IFdlYlNvY2tldCBcdTc2RDFcdTU0MkNcclxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIC8vIFx1NzZEMVx1NTQyQyBWaXRlIFdlYlNvY2tldCBcdTZEODhcdTYwNkZcclxuICAgIC8vIFZpdGUgXHU3Njg0IFdlYlNvY2tldCBcdTZEODhcdTYwNkZcdTY4M0NcdTVGMEY6IHtcInR5cGVcIjpcImN1c3RvbVwiLFwiZXZlbnRcIjpcInN2Zy1obXItdXBkYXRlXCIsXCJkYXRhXCI6ey4uLn19XHJcbiAgICB2YXIgY2hlY2tJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAvLyBcdTVDMURcdThCRDVcdTkwMUFcdThGQzdcdTU5MUFcdTc5Q0RcdTY1QjlcdTVGMEZcdThCQkZcdTk1RUUgVml0ZSBcdTc2ODQgV2ViU29ja2V0XHJcbiAgICAgIHZhciB2aXRlV3MgPSBudWxsO1xyXG4gICAgICBcclxuICAgICAgLy8gXHU2NUI5XHU1RjBGMTogXHU5MDFBXHU4RkM3XHU1MTY4XHU1QzQwXHU1M0Q4XHU5MUNGXHJcbiAgICAgIGlmICh3aW5kb3cuX19WSVRFX1dTX18pIHtcclxuICAgICAgICB2aXRlV3MgPSB3aW5kb3cuX19WSVRFX1dTX187XHJcbiAgICAgIH0gZWxzZSBpZiAod2luZG93Ll9fVklURV9ITVJfV1NfXykge1xyXG4gICAgICAgIHZpdGVXcyA9IHdpbmRvdy5fX1ZJVEVfSE1SX1dTX187XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8vIFx1NjVCOVx1NUYwRjI6IFx1OTAxQVx1OEZDNyBWaXRlIFx1NUJBMlx1NjIzN1x1N0FFRlx1NUI5RVx1NEY4QlxyXG4gICAgICBpZiAoIXZpdGVXcyAmJiB3aW5kb3cuX19WSVRFX0hNUl9SVU5USU1FX18pIHtcclxuICAgICAgICB2YXIgcnVudGltZSA9IHdpbmRvdy5fX1ZJVEVfSE1SX1JVTlRJTUVfXztcclxuICAgICAgICBpZiAocnVudGltZS53cykge1xyXG4gICAgICAgICAgdml0ZVdzID0gcnVudGltZS53cztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIGlmICh2aXRlV3MpIHtcclxuICAgICAgICAvLyBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTVERjJcdTdFQ0ZcdTZERkJcdTUyQTBcdTRFODZcdTc2RDFcdTU0MkNcdTU2NjhcclxuICAgICAgICBpZiAoIXZpdGVXcy5fc3ZnSG1yTGlzdGVuZXJBZGRlZCkge1xyXG4gICAgICAgICAgdml0ZVdzLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIHZhciBkYXRhID0gdHlwZW9mIGV2ZW50LmRhdGEgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZShldmVudC5kYXRhKSA6IGV2ZW50LmRhdGE7XHJcbiAgICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS50eXBlID09PSAnY3VzdG9tJyAmJiBkYXRhLmV2ZW50ID09PSAnc3ZnLWhtci11cGRhdGUnICYmIGRhdGEuZGF0YSAmJiBkYXRhLmRhdGEuc3ZnSHRtbCkge1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlU3ZnU3ByaXRlKGRhdGEuZGF0YS5zdmdIdG1sKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAvLyBcdTVGRkRcdTc1NjVcdTg5RTNcdTY3OTBcdTk1MTlcdThCRUZcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB2aXRlV3MuX3N2Z0htckxpc3RlbmVyQWRkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChjaGVja0ludGVydmFsKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIDEwMCk7XHJcbiAgICBcclxuICAgIC8vIDEwXHU3OUQyXHU1NDBFXHU1MDVDXHU2QjYyXHU2OEMwXHU2N0U1XHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICBjbGVhckludGVydmFsKGNoZWNrSW50ZXJ2YWwpO1xyXG4gICAgfSwgMTAwMDApO1xyXG4gIH1cclxuICBcclxuICAvLyBcdTRGN0ZcdTc1MjggTXV0YXRpb25PYnNlcnZlciBcdTc2RDFcdTU0MkMgRE9NIFx1NTNEOFx1NTMxNlx1RkYwOFx1OTAwMlx1OTE0RCBxaWFua3VuXHVGRjA5XHJcbiAgLy8gXHU1M0VBXHU1NzI4IGJ0Yy1zdmctc3ByaXRlIFx1NTFGQVx1NzNCMFx1NjVGNlx1NkRGQlx1NTJBMFx1NTZGRVx1NjgwN1xyXG4gIGlmICh0eXBlb2YgTXV0YXRpb25PYnNlcnZlciAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIHZhciBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKG11dGF0aW9ucykge1xyXG4gICAgICBpZiAoZG9jdW1lbnQuYm9keSkge1xyXG4gICAgICAgIHZhciBidGNTcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRjLXN2Zy1zcHJpdGUnKTtcclxuICAgICAgICBpZiAoYnRjU3ByaXRlICYmICFoYXNJY29ucyhidGNTcHJpdGUpICYmICFpc0xvYWRlZCkge1xyXG4gICAgICAgICAgbG9hZFN2Z1Nwcml0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgeyBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIFx1NUVGNlx1OEZERlx1NTJBMFx1OEY3RFx1RkYwQ1x1Nzg2RVx1NEZERFx1NTE3MVx1NEVBQlx1NTMwNVx1NzY4NCBzcHJpdGUgXHU1MTQ4XHU1MkEwXHU4RjdEXHJcbiAgZnVuY3Rpb24gdHJ5TG9hZCgpIHtcclxuICAgIHZhciBidGNTcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRjLXN2Zy1zcHJpdGUnKTtcclxuICAgIGlmIChidGNTcHJpdGUpIHtcclxuICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1MTcxXHU0RUFCXHU1MzA1XHU3Njg0IHNwcml0ZSBcdTVERjJcdTVCNThcdTU3MjhcdUZGMENcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTY3MDlcdTUxODVcdTVCQjlcclxuICAgICAgLy8gXHU3QjQ5XHU1Rjg1XHU1MTcxXHU0RUFCXHU1MzA1XHU2M0QyXHU0RUY2XHU1QjhDXHU2MjEwXHU1MjFEXHU1OUNCXHU1MzE2XHVGRjA4XHU5MDFBXHU1RTM4XHU5NzAwXHU4OTgxXHU0RTAwXHU3MEI5XHU2NUY2XHU5NUY0XHVGRjA5XHJcbiAgICAgIHZhciBjaGVja0NvbnRlbnQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoYnRjU3ByaXRlLmlubmVySFRNTC50cmltKCkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChjaGVja0NvbnRlbnQpO1xyXG4gICAgICAgICAgbG9hZFN2Z1Nwcml0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSwgNTApO1xyXG4gICAgICBcclxuICAgICAgLy8gXHU2NzAwXHU1OTFBXHU3QjQ5XHU1Rjg1IDIgXHU3OUQyXHJcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbChjaGVja0NvbnRlbnQpO1xyXG4gICAgICAgIGlmICghaXNMb2FkZWQpIHtcclxuICAgICAgICAgIGxvYWRTdmdTcHJpdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sIDIwMDApO1xyXG4gICAgfSBlbHNlIGlmIChkb2N1bWVudC5ib2R5KSB7XHJcbiAgICAgIC8vIFx1NTk4Mlx1Njc5QyBib2R5IFx1NUI1OFx1NTcyOFx1NEY0NiBzcHJpdGUgXHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU3QjQ5XHU1Rjg1XHU0RTAwXHU0RTBCXHU1MThEXHU4QkQ1XHJcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCFpc0xvYWRlZCkge1xyXG4gICAgICAgICAgdHJ5TG9hZCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSwgMjAwKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgLy8gXHU3QUNCXHU1MzczXHU1QzFEXHU4QkQ1XHU1MkEwXHU4RjdEXHJcbiAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJykge1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHRyeUxvYWQpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBcdTVFRjZcdThGREZcdTRFMDBcdTcwQjlcdTY1RjZcdTk1RjRcdUZGMENcdTc4NkVcdTRGRERcdTUxNzFcdTRFQUJcdTUzMDVcdTc2ODRcdTYzRDJcdTRFRjZcdTUxNDhcdTYyNjdcdTg4NENcclxuICAgIHNldFRpbWVvdXQodHJ5TG9hZCwgMTAwKTtcclxuICB9XHJcbn0pKCk7XHJcbjwvc2NyaXB0PmA7XHJcbiAgICAgIFxyXG4gICAgICAvLyBcdTU3MjggPC9oZWFkPiBcdTRFNEJcdTUyNERcdTYzRDJcdTUxNjVcclxuICAgICAgaWYgKGh0bWwuaW5jbHVkZXMoJzwvaGVhZD4nKSkge1xyXG4gICAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoJzwvaGVhZD4nLCBgJHtzY3JpcHR9XFxuPC9oZWFkPmApO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOSA8L2hlYWQ+XHVGRjBDXHU1NzI4IDwvYm9keT4gXHU0RTRCXHU1MjREXHU2M0QyXHU1MTY1XHJcbiAgICAgIGVsc2UgaWYgKGh0bWwuaW5jbHVkZXMoJzwvYm9keT4nKSkge1xyXG4gICAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoJzwvYm9keT4nLCBgJHtzY3JpcHR9XFxuPC9ib2R5PmApO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1OTBGRFx1NkNBMVx1NjcwOVx1RkYwQ1x1NzZGNFx1NjNBNVx1OEZGRFx1NTJBMFxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gaHRtbCArIHNjcmlwdDtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICB9IGFzIHVua25vd24gYXMgUGx1Z2luO1xyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7O0FBQXVaLFNBQVMsb0JBQW9CO0FBQ3BiLFNBQVMsaUJBQUFBLHNCQUFxQjs7O0FDSzlCLFNBQVMsV0FBQUMsV0FBUyxXQUFBQyxnQkFBZTtBQUNqQyxTQUFTLGlCQUFBQyxzQkFBcUI7QUFDOUIsU0FBUyxxQkFBcUI7QUFDOUIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sWUFBWTtBQUNuQixPQUFPLGFBQWE7QUFDcEIsT0FBTyxZQUFZO0FBQ25CLFNBQVMsY0FBQUMsYUFBWSxnQkFBQUMscUJBQW9C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QUFTLFdBQUFDLGdCQUFlOzs7QUNtQnhCLElBQU0sa0JBQWdDO0FBQUEsRUFDcEMsU0FBUztBQUFBLEVBQ1QsU0FBUztBQUFBLEVBQ1QsU0FBUztBQUFBLEVBQ1QsU0FBUztBQUFBLEVBQ1QsU0FBUztBQUFBLEVBQ1QsVUFBVTtBQUFBLEVBQ1YsVUFBVTtBQUNaO0FBS0EsSUFBTSx1QkFBdUM7QUFBQSxFQUMzQztBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLEVBQ1o7QUFDRjtBQUtBLElBQU0sc0JBQXNDO0FBQUEsRUFDMUM7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixV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QTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUE4UDNCLFVBQUksS0FBSyxTQUFTLFNBQVMsR0FBRztBQUM1QixlQUFPLEtBQUssUUFBUSxXQUFXLEdBQUcsTUFBTTtBQUFBLFFBQVc7QUFBQSxNQUNyRCxXQUVTLEtBQUssU0FBUyxTQUFTLEdBQUc7QUFDakMsZUFBTyxLQUFLLFFBQVEsV0FBVyxHQUFHLE1BQU07QUFBQSxRQUFXO0FBQUEsTUFDckQsT0FFSztBQUNILGVBQU8sT0FBTztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjs7O0F6QnBkcVEsSUFBTUMsNENBQTJDO0FBUXRULElBQU0sU0FBU0MsZUFBYyxJQUFJLElBQUksS0FBS0QseUNBQWUsQ0FBQztBQUcxRCxJQUFNRSxTQUFRLGVBQWU7QUFFN0IsSUFBTyxzQkFBUTtBQUFBLEVBQ2IsdUJBQXVCO0FBQUEsSUFDckIsU0FBUztBQUFBLElBQ1Q7QUFBQSxJQUNBLGFBQWE7QUFBQSxJQUNiLGVBQWU7QUFBQTtBQUFBLE1BRWIsaUJBQWlCLE1BQU07QUFBQTtBQUFBLE1BRXZCLG9CQUFvQixFQUFFLGFBQWEsYUFBYSxDQUFDO0FBQUE7QUFBQSxNQUVqRCxhQUFhLE1BQU07QUFBQSxJQUNyQjtBQUFBLElBQ0EsY0FBYyxFQUFFLE9BQUFBLE9BQU07QUFBQSxJQUN0QixPQUFBQTtBQUFBLElBQ0EsWUFBWTtBQUFBLE1BQ1YsS0FBSztBQUFBLFFBQ0gsZUFBZTtBQUFBO0FBQUEsTUFDakI7QUFBQSxJQUNGO0FBQUEsRUFDRixDQUFDO0FBQ0g7IiwKICAibmFtZXMiOiBbImZpbGVVUkxUb1BhdGgiLCAicmVzb2x2ZSIsICJkaXJuYW1lIiwgImZpbGVVUkxUb1BhdGgiLCAiZXhpc3RzU3luYyIsICJyZWFkRmlsZVN5bmMiLCAiYXBwRGlyIiwgInJlc29sdmUiLCAiYXBwRGlyIiwgInJlc29sdmUiLCAicmVzb2x2ZSIsICJhcHBEaXIiLCAicmVzb2x2ZSIsICJyZXNvbHZlIiwgImV4aXN0c1N5bmMiLCAiYXBwRGlyIiwgInJlc29sdmUiLCAiZXhpc3RzU3luYyIsICJleGlzdHNTeW5jIiwgImV4aXN0c1N5bmMiLCAiZmlsZU5hbWUiLCAib3JpZ2luIiwgImV4aXN0c1N5bmMiLCAicmVhZEZpbGVTeW5jIiwgInJlc29sdmUiLCAiZGlybmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19maWxlbmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19kaXJuYW1lIiwgImRpcm5hbWUiLCAicmVzb2x2ZSIsICJleGlzdHNTeW5jIiwgInRpbWVzdGFtcCIsICJyZWFkRmlsZVN5bmMiLCAicmVzb2x2ZSIsICJkaXJuYW1lIiwgImV4aXN0c1N5bmMiLCAiYXBwRGlyIiwgInJlc29sdmUiLCAiZXhpc3RzU3luYyIsICJkaXJuYW1lIiwgInJlc29sdmUiLCAiZmlsZVVSTFRvUGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgIl9fZmlsZW5hbWUiLCAiZmlsZVVSTFRvUGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgIl9fZGlybmFtZSIsICJyZXNvbHZlIiwgInJlYWRGaWxlU3luYyIsICJleGlzdHNTeW5jIiwgImNvcHlGaWxlU3luYyIsICJta2RpclN5bmMiLCAid3JpdGVGaWxlU3luYyIsICJyZXNvbHZlIiwgImFwcERpciIsICJyZXNvbHZlIiwgImV4aXN0c1N5bmMiLCAicmVhZEZpbGVTeW5jIiwgIm1rZGlyU3luYyIsICJjb3B5RmlsZVN5bmMiLCAid3JpdGVGaWxlU3luYyIsICJyZWFkRmlsZVN5bmMiLCAiZXhpc3RzU3luYyIsICJyZXNvbHZlIiwgImFwcERpciIsICJyZXNvbHZlIiwgImV4aXN0c1N5bmMiLCAicmVhZEZpbGVTeW5jIiwgInJlc29sdmUiLCAiZmlsZVVSTFRvUGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgIl9fZmlsZW5hbWUiLCAiZmlsZVVSTFRvUGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgIl9fZGlybmFtZSIsICJyZXNvbHZlIiwgInByb2plY3RSb290IiwgImlzUHJldmlld0J1aWxkIiwgImV4aXN0c1N5bmMiLCAiYXBwRGlyIiwgImV4aXN0c1N5bmMiLCAid2l0aFBhY2thZ2VzIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19maWxlbmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fZGlybmFtZSIsICJkaXJuYW1lIiwgImFwcERpciIsICJyZXNvbHZlIiwgInJlcXVpcmUiLCAicHJveHkiLCAiZXhpc3RzU3luYyIsICJyZWFkRmlsZVN5bmMiLCAicHJveHkiLCAiaXNQcm9kdWN0aW9uIiwgInJlYWRGaWxlU3luYyIsICJyZWFkZGlyU3luYyIsICJleGlzdHNTeW5jIiwgImV4dG5hbWUiLCAiam9pbiIsICJhcHBEaXIiLCAiam9pbiIsICJleGlzdHNTeW5jIiwgInJlYWRkaXJTeW5jIiwgImV4dG5hbWUiLCAicmVhZEZpbGVTeW5jIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiZmlsZVVSTFRvUGF0aCIsICJwcm94eSJdCn0K
