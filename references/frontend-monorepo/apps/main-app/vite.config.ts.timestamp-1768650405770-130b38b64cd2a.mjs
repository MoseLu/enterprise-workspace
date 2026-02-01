var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// vite.config.ts
import { defineConfig } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@24.10.1_sass@1.94.2/node_modules/vite/dist/node/index.js";
import { fileURLToPath as fileURLToPath5 } from "node:url";

// ../../configs/vite/factories/mainapp.config.ts
import { resolve as resolve10 } from "path";
import vue from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue@5.0.0_vite@5.4.21_vue@3.5.26/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.2.0_vite@5.4.21_vue@3.5.26/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
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

// ../../configs/vite/factories/mainapp.config.ts
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";

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

// ../../configs/vite/factories/mainapp.config.ts
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

// ../../configs/vite/plugins/public-images.ts
import { resolve as resolve6, join, extname, basename } from "path";
import { existsSync as existsSync5, readFileSync as readFileSync3, readdirSync, statSync, writeFileSync as writeFileSync2, mkdirSync } from "node:fs";
function publicImagesToAssetsPlugin(appDir2) {
  const imageMap = /* @__PURE__ */ new Map();
  const emittedFiles = /* @__PURE__ */ new Map();
  const publicImageFiles = /* @__PURE__ */ new Map();
  let isProductionBuild = false;
  const rootImageFiles = ["logo.png", "login_cut_dark.png", "login_cut_light.png"];
  const isVirtualModuleId = (id) => {
    return id.includes("\0") || id.includes("public-image:");
  };
  const extractOriginalPath = (id) => {
    if (!isVirtualModuleId(id)) {
      return null;
    }
    const originalPath = id.replace(/\0public-image:/g, "").replace(/\0/g, "");
    if (originalPath.includes("\0")) {
      return null;
    }
    return originalPath;
  };
  return {
    name: "public-images-to-assets",
    configResolved(config) {
      isProductionBuild = !!config.isProduction;
    },
    buildStart() {
      if (!isProductionBuild) {
        return;
      }
      const publicDir = resolve6(appDir2, "public");
      if (!existsSync5(publicDir)) {
        return;
      }
      const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico"];
      const excludedFiles = ["favicon.ico"];
      const files = readdirSync(publicDir);
      for (const file of files) {
        if (excludedFiles.includes(file)) {
          console.info(`[public-images-to-assets] \u23ED\uFE0F  \u8DF3\u8FC7 ${file}\uFF08\u7EDF\u4E00\u4F7F\u7528 logo.png \u4F5C\u4E3A favicon\uFF09`);
          continue;
        }
        const ext = extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
          if (rootImageFiles.includes(file)) {
            console.info(`[public-images-to-assets] \u{1F4E6} \u5904\u7406 ${file}\uFF0C\u5C06\u590D\u5236\u5230\u6839\u76EE\u5F55\uFF08\u65E0\u54C8\u5E0C\u503C\uFF09`);
            publicImageFiles.set(file, join(publicDir, file));
            continue;
          }
          const filePath = join(publicDir, file);
          const stats = statSync(filePath);
          if (stats.isFile()) {
            publicImageFiles.set(`/${file}`, filePath);
            publicImageFiles.set(file, filePath);
            const fileContent = readFileSync3(filePath);
            const referenceId = this.emitFile({
              type: "asset",
              name: file,
              // 文件名（不含路径），Rollup 会自动添加哈希值并放在 assetsDir
              source: fileContent
            });
            emittedFiles.set(file, referenceId);
            console.info(`[public-images-to-assets] \u{1F4E6} \u5C06 ${file} \u6253\u5305 (referenceId: ${referenceId})`);
          }
        }
      }
    },
    resolveId(id, _importer) {
      if (isVirtualModuleId(id)) {
        if (id.startsWith("\0public-image:") || id.includes("\0public-image:")) {
          return id;
        }
        return null;
      }
      if (id === "/logo.png" || id === "logo.png") {
        const logoPath = publicImageFiles.get("logo.png");
        if (logoPath && existsSync5(logoPath)) {
          return logoPath;
        }
        return `\0public-image:/logo.png`;
      }
      if (id.startsWith("/") && publicImageFiles.has(id)) {
        return `\0public-image:${id}`;
      }
      return null;
    },
    load(id) {
      for (const rootFile of rootImageFiles) {
        if (id.endsWith(rootFile) && existsSync5(id)) {
          return `export default "/${rootFile}";`;
        }
      }
      if (!isVirtualModuleId(id)) {
        return null;
      }
      const originalPath = extractOriginalPath(id);
      if (!originalPath) {
        for (const rootFile of rootImageFiles) {
          if (id.includes(rootFile)) {
            return `export default "/${rootFile}";`;
          }
        }
        console.warn(`[public-images-to-assets] \u26A0\uFE0F  \u65E0\u6CD5\u63D0\u53D6\u539F\u59CB\u8DEF\u5F84\uFF0C\u8DF3\u8FC7: ${id}`);
        return null;
      }
      const fileName = basename(originalPath);
      if (rootImageFiles.includes(fileName)) {
        return `export default "/${fileName}";`;
      }
      const referenceId = emittedFiles.get(fileName);
      if (referenceId) {
        return `export default "/${fileName}";`;
      }
      return null;
    },
    generateBundle(_options, bundle) {
      const bundleAssets = Object.entries(bundle).filter(([_, chunk]) => chunk.type === "asset");
      console.info(`[public-images-to-assets] \u{1F4CB} bundle \u4E2D\u7684\u8D44\u6E90\u6587\u4EF6\u6570\u91CF: ${bundleAssets.length}`);
      console.info(`[public-images-to-assets] \u{1F50D} \u5F00\u59CB\u5904\u7406 ${emittedFiles.size} \u4E2A\u5DF2\u53D1\u51FA\u7684\u6587\u4EF6`);
      for (const [originalFile, referenceId] of emittedFiles.entries()) {
        try {
          const actualFileName = this.getFileName(referenceId);
          if (!actualFileName) {
            console.warn(`[public-images-to-assets] \u26A0\uFE0F  \u65E0\u6CD5\u83B7\u53D6 ${originalFile} \u7684\u6587\u4EF6\u540D (referenceId: ${referenceId})`);
            continue;
          }
          const assetChunk = bundle[actualFileName];
          if (!assetChunk || assetChunk.type !== "asset") {
            console.warn(`[public-images-to-assets] \u26A0\uFE0F  \u5728 bundle \u4E2D\u672A\u627E\u5230 ${actualFileName} (\u539F\u59CB\u6587\u4EF6: ${originalFile})`);
            continue;
          }
          const fileNameWithPath = actualFileName;
          imageMap.set(originalFile, fileNameWithPath);
          console.info(`[public-images-to-assets] \u2705 ${originalFile} -> ${fileNameWithPath} (Rollup \u751F\u6210\u7684\u6587\u4EF6\u540D)`);
        } catch (error) {
          console.warn(`[public-images-to-assets] \u26A0\uFE0F  \u5904\u7406 ${originalFile} \u65F6\u51FA\u9519:`, error);
        }
      }
      if (imageMap.size === 0) {
        console.warn(`[public-images-to-assets] \u26A0\uFE0F  imageMap \u4E3A\u7A7A\uFF0C\u53EF\u80FD emitFile \u6CA1\u6709\u6210\u529F\u6267\u884C`);
      } else {
        console.info(`[public-images-to-assets] \u{1F4DD} imageMap \u5185\u5BB9:`, Array.from(imageMap.entries()).map(([k, v]) => `${k} -> ${v}`).join(", "));
      }
      for (const [fileName, chunk] of Object.entries(bundle)) {
        const c = chunk;
        if (c.type === "chunk" && c.code) {
          let modified = false;
          let newCode = c.code;
          for (const [originalFile, hashedFile] of imageMap.entries()) {
            const originalPath = `/${originalFile}`;
            const newPath = hashedFile.startsWith("assets/") ? `/${hashedFile}` : `/${hashedFile}`;
            const escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const stringPattern = new RegExp(`(["'\`])${escapedPath}(["'\`])`, "g");
            if (newCode.includes(originalPath)) {
              newCode = newCode.replace(stringPattern, `$1${newPath}$2`);
              modified = true;
            }
          }
          if (modified) {
            c.code = newCode;
            console.info(`[public-images-to-assets] \u{1F504} \u66F4\u65B0 ${fileName} \u4E2D\u7684\u56FE\u7247\u5F15\u7528`);
          }
        } else if (c.type === "asset" && fileName.endsWith(".css") && c.source) {
          let modified = false;
          let newSource = typeof c.source === "string" ? c.source : Buffer.from(c.source).toString("utf-8");
          for (const rootFile of rootImageFiles) {
            const rootPath = `/${rootFile}`;
            const fileNameWithoutExt = rootFile.replace(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i, "");
            const fileExt = rootFile.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)?.[0] || ".png";
            const escapedFileName = fileNameWithoutExt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const assetsPattern = new RegExp(`/assets/${escapedFileName}-[A-Za-z0-9]{4,}${fileExt.replace(".", "\\.")}`, "g");
            if (assetsPattern.test(newSource)) {
              newSource = newSource.replace(assetsPattern, rootPath);
              modified = true;
              console.info(`[public-images-to-assets] \u{1F504} \u66F4\u65B0 CSS ${fileName} \u4E2D\u7684\u6839\u76EE\u5F55\u56FE\u7247\u5F15\u7528: /assets/${rootFile} -> ${rootPath}`);
            }
            const rootPattern = new RegExp(`url\\(["']?${rootPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\?[^"')]*)?["']?\\)`, "g");
            if (rootPattern.test(newSource)) {
            }
          }
          for (const [originalFile, hashedFile] of imageMap.entries()) {
            if (rootImageFiles.includes(originalFile)) {
              continue;
            }
            const originalPath = `/${originalFile}`;
            const newPath = hashedFile.startsWith("assets/") ? `/${hashedFile}` : `/${hashedFile}`;
            const escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const urlPatterns = [
              new RegExp(`url\\(${escapedPath}(\\?[^)]*)?\\)`, "g"),
              new RegExp(`url\\(["']${escapedPath}(\\?[^"']*)?["']\\)`, "g")
            ];
            for (const pattern of urlPatterns) {
              if (pattern.test(newSource)) {
                newSource = newSource.replace(pattern, (match) => {
                  const queryMatch = match.match(/(\?[^)]*)/);
                  const query = queryMatch ? queryMatch[1] : "";
                  return match.replace(originalPath, newPath).replace(/\?[^)]*/, query ? query : "");
                });
                modified = true;
                console.info(`[public-images-to-assets] \u{1F504} \u66F4\u65B0 CSS ${fileName} \u4E2D\u7684\u5F15\u7528: ${originalPath} -> ${newPath}`);
              }
            }
          }
          if (modified) {
            c.source = newSource;
          }
        }
      }
    },
    writeBundle(options) {
      const outputDir = options.dir || resolve6(appDir2, "dist");
      for (const rootFile of rootImageFiles) {
        const filePath = publicImageFiles.get(rootFile);
        if (filePath && existsSync5(filePath)) {
          const fileDest = join(outputDir, rootFile);
          try {
            const fileContent = readFileSync3(filePath);
            writeFileSync2(fileDest, fileContent);
            console.info(`[public-images-to-assets] \u2705 \u5DF2\u590D\u5236 ${rootFile} \u5230\u6839\u76EE\u5F55: ${fileDest}`);
          } catch (error) {
            console.warn(`[public-images-to-assets] \u26A0\uFE0F  \u590D\u5236 ${rootFile} \u5931\u8D25:`, error);
          }
        }
      }
      const publicDir = resolve6(appDir2, "public");
      const bridgeHtmlPath = join(publicDir, "bridge.html");
      if (existsSync5(bridgeHtmlPath)) {
        const bridgeHtmlDest = join(outputDir, "bridge.html");
        try {
          const fileContent = readFileSync3(bridgeHtmlPath);
          writeFileSync2(bridgeHtmlDest, fileContent);
          console.info(`[public-images-to-assets] \u2705 \u5DF2\u590D\u5236 bridge.html \u5230\u6839\u76EE\u5F55: ${bridgeHtmlDest}`);
        } catch (error) {
          console.error(`[public-images-to-assets] \u274C \u590D\u5236 bridge.html \u5931\u8D25:`, error);
          throw error;
        }
      } else {
        const appName = appDir2.split(/[/\\]/).pop() || "";
        if (appName === "main-app") {
          console.warn(`[public-images-to-assets] \u26A0\uFE0F  \u8B66\u544A: main-app \u7684 public/bridge.html \u4E0D\u5B58\u5728\uFF01`);
          console.warn(`[public-images-to-assets] \u26A0\uFE0F  \u8FD9\u4F1A\u5BFC\u81F4\u8DE8\u5B50\u57DF\u901A\u4FE1\u5931\u8D25\u3002\u8BF7\u786E\u4FDD bridge.html \u5B58\u5728\u4E8E public \u76EE\u5F55\u3002`);
        }
      }
      if (imageMap.size === 0) {
        return;
      }
      const assetsDirPath = join(outputDir, "assets");
      if (!existsSync5(assetsDirPath)) {
        mkdirSync(assetsDirPath, { recursive: true });
      }
      const indexHtmlPath = join(outputDir, "index.html");
      if (existsSync5(indexHtmlPath)) {
        let html = readFileSync3(indexHtmlPath, "utf-8");
        let modified = false;
        for (const [originalFile, hashedFile] of imageMap.entries()) {
          if (rootImageFiles.includes(originalFile)) {
            continue;
          }
          const originalPath = `/${originalFile}`;
          const newPath = `/${hashedFile}`;
          if (html.includes(originalPath)) {
            html = html.replace(new RegExp(originalPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), newPath);
            modified = true;
            console.info(`[public-images-to-assets] \u{1F504} \u66F4\u65B0 HTML \u4E2D\u7684\u5F15\u7528: ${originalPath} -> ${newPath}`);
          }
        }
        if (modified) {
          writeFileSync2(indexHtmlPath, html, "utf-8");
        }
      }
      const assetsDir = join(outputDir, "assets");
      if (existsSync5(assetsDir)) {
        const jsFiles = readdirSync(assetsDir).filter((f) => f.endsWith(".js") || f.endsWith(".mjs"));
        const cssFiles = readdirSync(assetsDir).filter((f) => f.endsWith(".css"));
        for (const file of [...jsFiles, ...cssFiles]) {
          const filePath = join(assetsDir, file);
          let content = readFileSync3(filePath, "utf-8");
          let modified = false;
          for (const rootFile of rootImageFiles) {
            const rootPath = `/${rootFile}`;
            const fileNameWithoutExt = rootFile.replace(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i, "");
            const fileExt = rootFile.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)?.[0] || ".png";
            const escapedFileName = fileNameWithoutExt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const assetsPattern = new RegExp(`/assets/${escapedFileName}-[A-Za-z0-9]{4,}${fileExt.replace(".", "\\.")}`, "g");
            if (assetsPattern.test(content)) {
              content = content.replace(assetsPattern, rootPath);
              modified = true;
              console.info(`[public-images-to-assets] \u{1F504} \u66F4\u65B0 ${file} \u4E2D\u7684\u6839\u76EE\u5F55\u56FE\u7247\u5F15\u7528: /assets/${rootFile} -> ${rootPath}`);
            }
          }
          for (const [originalFile, hashedFile] of imageMap.entries()) {
            if (rootImageFiles.includes(originalFile)) {
              continue;
            }
            const originalPath = `/${originalFile}`;
            const newPath = hashedFile.startsWith("assets/") ? `/${hashedFile}` : `/${hashedFile}`;
            const escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const backtick = "`";
            const quotePattern = `["'` + backtick + "]";
            const negatedQuotePattern = `[^"'` + backtick + "]";
            const patterns = [
              new RegExp("(" + quotePattern + ")" + escapedPath + "(\\?" + negatedQuotePattern + "*)?(" + quotePattern + ")", "g"),
              new RegExp(`url\\(${escapedPath}(\\?[^)]*)?\\)`, "g"),
              new RegExp(`url\\(['"]${escapedPath}(\\?[^"']*)?['"]\\)`, "g")
            ];
            for (const pattern of patterns) {
              if (pattern.test(content)) {
                if (pattern.source.includes("url")) {
                  content = content.replace(pattern, (match) => {
                    const queryMatch = match.match(/(\?[^)]*)/);
                    const query = queryMatch ? queryMatch[1] : "";
                    return match.replace(originalPath, newPath).replace(/\?[^)]*/, query ? query : "");
                  });
                } else {
                  content = content.replace(pattern, (_match, quote1, _path, query, quote2) => {
                    return `${quote1}${newPath}${query || ""}${quote2}`;
                  });
                }
                modified = true;
                console.info(`[public-images-to-assets] \u{1F504} \u66F4\u65B0 ${file} \u4E2D\u7684\u5F15\u7528: ${originalPath} -> ${newPath}`);
              }
            }
          }
          if (modified) {
            writeFileSync2(filePath, content, "utf-8");
          }
        }
      }
    },
    closeBundle() {
      if (imageMap.size === 0) {
        return;
      }
      const outputDir = resolve6(appDir2, "dist");
      for (const [originalFile, hashedFile] of imageMap.entries()) {
        const expectedPath = join(outputDir, hashedFile);
        if (existsSync5(expectedPath)) {
          console.info(`[public-images-to-assets] \u2705 \u6587\u4EF6\u5DF2\u6B63\u786E\u751F\u6210: ${hashedFile}`);
        } else {
          const rootPath = hashedFile.startsWith("assets/") ? join(outputDir, hashedFile.replace("assets/", "")) : join(outputDir, hashedFile);
          if (existsSync5(rootPath)) {
            console.info(`[public-images-to-assets] \u2705 \u6587\u4EF6\u5728\u6839\u76EE\u5F55: ${hashedFile.replace("assets/", "")}`);
          } else {
            console.warn(`[public-images-to-assets] \u26A0\uFE0F  \u6587\u4EF6\u4E0D\u5B58\u5728: ${hashedFile} (\u539F\u59CB\u6587\u4EF6: ${originalFile})`);
            console.warn(`[public-images-to-assets]   \u68C0\u67E5\u8DEF\u5F84: ${expectedPath}`);
            console.warn(`[public-images-to-assets]   \u68C0\u67E5\u8DEF\u5F84: ${rootPath}`);
          }
        }
      }
    }
  };
}

// ../../configs/vite/plugins/resource-preload.ts
function resourcePreloadPlugin() {
  const criticalResources = [];
  return {
    name: "resource-preload",
    generateBundle(_options, bundle) {
      const jsChunks = Object.keys(bundle).filter((file) => file.endsWith(".js") || file.endsWith(".mjs"));
      const cssChunks = Object.keys(bundle).filter((file) => file.endsWith(".css"));
      const getResourceHref = (chunkName) => {
        if (chunkName.startsWith("assets/")) {
          return `/${chunkName}`;
        } else {
          return `/assets/${chunkName}`;
        }
      };
      const indexChunk = jsChunks.find((jsChunk) => jsChunk.includes("index-"));
      if (indexChunk) {
        criticalResources.push({
          href: getResourceHref(indexChunk),
          rel: "modulepreload"
        });
      }
      const firstCssChunk = cssChunks[0];
      if (firstCssChunk) {
        criticalResources.push({
          href: getResourceHref(firstCssChunk),
          rel: "preload",
          as: "style"
        });
      }
    },
    transformIndexHtml(html) {
      if (criticalResources.length === 0) {
        return html;
      }
      const preloadLinks = criticalResources.map((resource) => {
        if (resource.rel === "modulepreload") {
          return `    <link rel="modulepreload" href="${resource.href}" />`;
        } else {
          return `    <link rel="preload" href="${resource.href}" as="${resource.as || "script"}" />`;
        }
      }).join("\n");
      if (html.includes("</head>")) {
        return html.replace("</head>", `${preloadLinks}
</head>`);
      }
      return html;
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
import { readFileSync as readFileSync4, existsSync as existsSync6, readdirSync as readdirSync2, statSync as statSync2, copyFileSync, mkdirSync as mkdirSync2, writeFileSync as writeFileSync3 } from "fs";
import { join as join2, resolve as resolve8, extname as extname2 } from "path";
function dutyStaticPlugin(appDir2) {
  let viteConfig = null;
  const dutyMiddleware = (req, res, next) => {
    if (!req.url || !req.url.startsWith("/duty/")) {
      next();
      return;
    }
    const fileName = req.url.replace("/duty/", "");
    const publicDir = resolve8(appDir2, "public");
    const filePath = join2(publicDir, fileName);
    if (!existsSync6(filePath)) {
      next();
      return;
    }
    try {
      const fileContent = readFileSync4(filePath, "utf-8");
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
      const files = readdirSync2(publicDir);
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
          copyFileSync(jquerySourcePath, jqueryDestPath);
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
        const ext = extname2(file).toLowerCase();
        if (dutyFileExtensions.includes(ext)) {
          const sourcePath = resolve8(publicDir, file);
          const destPath = resolve8(dutyDir, file);
          try {
            const stats = statSync2(sourcePath);
            if (stats.isFile()) {
              if (ext === ".html") {
                let content = readFileSync4(sourcePath, "utf-8");
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
                writeFileSync3(destPath, content, "utf-8");
              } else {
                copyFileSync(sourcePath, destPath);
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
  function ensureFileExtension2(filePath) {
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
    const { withPackages: withPackages2 } = createPathHelpers(appDir2);
    if (id === "@btc-components" || id.startsWith("@btc-components/")) {
      const subPath = id.replace("@btc-components/", "");
      const basePath = withPackages2(`shared-components/src/components/${subPath}`);
      return ensureFileExtension2(basePath);
    }
    if (id === "@btc-common" || id.startsWith("@btc-common/")) {
      const subPath = id.replace("@btc-common/", "");
      const basePath = withPackages2(`shared-components/src/common/${subPath}`);
      return ensureFileExtension2(basePath);
    }
    if (id === "@btc-crud" || id.startsWith("@btc-crud/")) {
      const subPath = id.replace("@btc-crud/", "");
      const basePath = withPackages2(`shared-components/src/crud/${subPath}`);
      return ensureFileExtension2(basePath);
    }
    if (id === "@btc-styles" || id.startsWith("@btc-styles/")) {
      const subPath = id.replace("@btc-styles/", "");
      const basePath = withPackages2(`shared-components/src/styles/${subPath}`);
      return ensureFileExtension2(basePath);
    }
    if (id === "@btc-locales" || id.startsWith("@btc-locales/")) {
      const subPath = id.replace("@btc-locales/", "");
      const basePath = withPackages2(`shared-components/src/locales/${subPath}`);
      return ensureFileExtension2(basePath);
    }
    if (id === "@btc-assets" || id.startsWith("@btc-assets/")) {
      const subPath = id.replace("@btc-assets/", "");
      const basePath = withPackages2(`shared-components/src/assets/${subPath}`);
      return ensureFileExtension2(basePath);
    }
    if (id === "@assets" || id.startsWith("@assets/")) {
      const subPath = id.replace("@assets/", "");
      const basePath = withPackages2(`shared-components/src/assets/${subPath}`);
      return ensureFileExtension2(basePath);
    }
    if (id === "@btc-utils" || id.startsWith("@btc-utils/")) {
      const subPath = id.replace("@btc-utils/", "");
      const basePath = withPackages2(`shared-components/src/utils/${subPath}`);
      return ensureFileExtension2(basePath);
    }
    if (id === "@plugins" || id.startsWith("@plugins/")) {
      const subPath = id.replace("@plugins/", "");
      const basePath = withPackages2(`shared-components/src/plugins/${subPath}`);
      return ensureFileExtension2(basePath);
    }
    if (id === "@charts-utils/css-var" || id.startsWith("@charts-utils/css-var/")) {
      const subPath = id.replace("@charts-utils/css-var", "").replace(/^\//, "");
      const basePath = withPackages2(`shared-components/src/charts/utils/css-var${subPath ? "/" + subPath : ""}`);
      return ensureFileExtension2(basePath);
    }
    if (id === "@charts-utils/color" || id.startsWith("@charts-utils/color/")) {
      const subPath = id.replace("@charts-utils/color", "").replace(/^\//, "");
      const basePath = withPackages2(`shared-components/src/charts/utils/color${subPath ? "/" + subPath : ""}`);
      return ensureFileExtension2(basePath);
    }
    if (id === "@charts-utils/gradient" || id.startsWith("@charts-utils/gradient/")) {
      const subPath = id.replace("@charts-utils/gradient", "").replace(/^\//, "");
      const basePath = withPackages2(`shared-components/src/charts/utils/gradient${subPath ? "/" + subPath : ""}`);
      return ensureFileExtension2(basePath);
    }
    if (id === "@charts-composables/useChartComponent" || id.startsWith("@charts-composables/useChartComponent/")) {
      const subPath = id.replace("@charts-composables/useChartComponent", "").replace(/^\//, "");
      const basePath = withPackages2(`shared-components/src/charts/composables/useChartComponent${subPath ? "/" + subPath : ""}`);
      return ensureFileExtension2(basePath);
    }
    if (id === "@charts-types" || id.startsWith("@charts-types/")) {
      const subPath = id.replace("@charts-types/", "");
      const basePath = withPackages2(`shared-components/src/charts/types/${subPath}`);
      return ensureFileExtension2(basePath);
    }
    if (id === "@charts-utils" || id.startsWith("@charts-utils/")) {
      const subPath = id.replace("@charts-utils/", "");
      const basePath = withPackages2(`shared-components/src/charts/utils/${subPath}`);
      return ensureFileExtension2(basePath);
    }
    if (id === "@charts-composables" || id.startsWith("@charts-composables/")) {
      const subPath = id.replace("@charts-composables/", "");
      const basePath = withPackages2(`shared-components/src/charts/composables/${subPath}`);
      return ensureFileExtension2(basePath);
    }
    if (id === "@charts" || id.startsWith("@charts/")) {
      const subPath = id.replace("@charts/", "");
      const basePath = withPackages2(`shared-components/src/charts/${subPath}`);
      return ensureFileExtension2(basePath);
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
        const finalPath = ensureFileExtension2(sourcePath);
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
        return ensureFileExtension2(sourcePath);
      }
      if (id === "@btc/i18n" || id.startsWith("@btc/i18n/")) {
        const sourcePath = id === "@btc/i18n" ? withPackages("i18n/src/index.ts") : withPackages(`i18n/src/${id.replace("@btc/i18n/", "")}`);
        console.info(`[resolve-btc-imports] \u89E3\u6790 ${id} (\u6765\u81EA\u5DF2\u6784\u5EFA\u5305 ${importer?.split("/").slice(-2).join("/") || "unknown"}) -> ${sourcePath.split("/").slice(-3).join("/")}`);
        return ensureFileExtension2(sourcePath);
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

// ../../configs/vite/plugins/resolve-auth-aliases.ts
import { existsSync as existsSync8 } from "node:fs";
function ensureFileExtension(filePath) {
  if (/\.(ts|tsx|js|jsx|vue|json|css|scss|sass|less|png|jpg|jpeg|gif|svg|webp)$/i.test(filePath)) {
    return filePath;
  }
  const extensions = [".ts", ".tsx", ".js", ".jsx", ".vue"];
  for (const ext of extensions) {
    const pathWithExt = `${filePath}${ext}`;
    if (existsSync8(pathWithExt)) {
      return pathWithExt;
    }
  }
  return filePath;
}
function resolveAuthAliasesPlugin(options) {
  const { appDir: appDir2, enabled = true } = options;
  if (!enabled) {
    return {
      name: "resolve-auth-aliases"
    };
  }
  const { withSrc } = createPathHelpers(appDir2);
  return {
    name: "resolve-auth-aliases",
    enforce: "pre",
    // 在其他解析插件之前执行
    resolveId(id, importer) {
      if (!importer || !id.startsWith("@/")) {
        return null;
      }
      const isFromAuth = importer.includes("/auth/") || importer.includes("\\auth\\");
      if (!isFromAuth) {
        return null;
      }
      const pathWithoutAlias = id.replace(/^@\//, "");
      const resolvedPath = withSrc(`src/${pathWithoutAlias}`);
      const finalPath = ensureFileExtension(resolvedPath);
      return finalPath;
    }
  };
}

// ../../configs/vite/factories/mainapp.config.ts
function createMainAppViteConfig(options) {
  const {
    appName,
    appDir: appDir2,
    customPlugins = [],
    customBuild,
    customServer,
    customPreview,
    customOptimizeDeps,
    customCss,
    proxy: proxy2 = {},
    btcOptions = {},
    vueI18nOptions,
    publicImagesToAssets = true,
    enableResourcePreload = true
  } = options;
  const appConfig = getViteAppConfig(appName);
  const { withRoot } = createPathHelpers(appDir2);
  const isPreviewBuild = process.env.VITE_PREVIEW === "true";
  const baseUrl = "/";
  const publicDir = getPublicDir(appName, appDir2);
  const mainAppConfig = getViteAppConfig("main-app");
  const mainAppPort = mainAppConfig.prePort.toString();
  const epsOutputDir = resolve10(appDir2, "src", "build", "eps");
  const plugins = [
    // 1. 清理插件
    cleanDistPlugin(appDir2),
    // 2. CORS 插件
    corsPlugin(),
    // 3. 解析 auth 目录下的 @ 别名插件（必须在 resolveBtcImportsPlugin 之前）
    resolveAuthAliasesPlugin({ appDir: appDir2 }),
    // 4. 解析 @btc/* 包导入插件（确保能够解析从已构建包中导入的 @btc/* 模块）
    resolveBtcImportsPlugin({ appDir: appDir2 }),
    // 4. Public 图片资源处理插件（如果启用）
    ...publicImagesToAssets && !isPreviewBuild ? [publicImagesToAssetsPlugin(appDir2)] : [],
    // 5. 资源预加载插件（如果启用）
    ...enableResourcePreload !== false ? [resourcePreloadPlugin()] : [],
    // 6. 自定义插件（在核心插件之前）
    ...customPlugins,
    // 6. Vue 插件
    vue({
      script: {
        fs: {
          fileExists: existsSync9,
          readFile: (file) => readFileSync5(file, "utf-8")
        }
      }
    }),
    // 6.5. Vue JSX 插件（支持 TSX 文件中的 JSX 语法）
    // 关键：与 cool-admin 保持一致，使用默认配置，让插件自动处理所有 JSX/TSX 文件
    vueJsx(),
    // 7. 自动导入插件
    createAutoImportConfig(),
    // 8. 组件自动注册插件
    createComponentsConfig({ includeShared: true }),
    // 9. UnoCSS 插件
    UnoCSS({
      configFile: withRoot("uno.config.ts")
    }),
    // 10. BTC 业务插件
    btc({
      type: "admin",
      proxy: proxy2,
      eps: {
        enable: true,
        dict: btcOptions.eps?.dict ?? true,
        // 默认启用字典功能
        dictApi: btcOptions.eps?.dictApi || "/api/system/auth/dict",
        // 默认字典接口
        dist: epsOutputDir,
        ...btcOptions.eps
      },
      svg: {
        skipNames: ["base", "icons"],
        ...btcOptions.svg
      },
      ...btcOptions
    }),
    // 11. VueI18n 插件
    VueI18nPlugin({
      include: vueI18nOptions?.include || [
        resolve10(appDir2, "src/locales/**"),
        resolve10(appDir2, "src/{modules,plugins}/**/locales/**")
      ],
      runtimeOnly: vueI18nOptions?.runtimeOnly ?? true
    }),
    // 12. CSS 验证插件
    ensureCssPlugin(),
    // 13. 修复 chunk 引用插件
    fixChunkReferencesPlugin(),
    // 16. 确保 base URL 插件（主应用也需要，因为可能有子应用资源引用）
    ensureBaseUrlPlugin(baseUrl, appConfig.devHost, appConfig.prePort, mainAppPort),
    // 17. 添加版本号插件（为 HTML 资源引用添加时间戳版本号）
    addVersionPlugin(),
    // 17.5. CDN 资源加速插件（在版本号插件之后，确保版本号参数被保留）
    // 处理 HTML 中的资源 URL（<script>、<link>、<img> 等）
    cdnAssetsPlugin({
      appName,
      enabled: !isPreviewBuild && process.env.ENABLE_CDN_ACCELERATION !== "false"
    }),
    // 17.6. CDN 动态导入转换插件（转换代码中的 import() 调用）
    // 将相对路径转换为 CDN URL，与 cdnAssetsPlugin 配合实现完整的 CDN 加速
    cdnImportPlugin({
      appName,
      enabled: !isPreviewBuild && process.env.ENABLE_CDN_ACCELERATION !== "false"
    }),
    // 17.7. 替换图标路径为 CDN URL（生产环境）
    replaceIconsWithCdnPlugin(),
    // 18. 优化 chunks 插件
    optimizeChunksPlugin(),
    // 19. Chunk 验证插件
    chunkVerifyPlugin(),
    // 20. CDN 上传插件（仅在生产构建且启用时）
    ...process.env.ENABLE_CDN_UPLOAD === "true" && !isPreviewBuild ? [uploadCdnPlugin(appName, appDir2)] : []
  ];
  const buildConfig = {
    target: "es2020",
    sourcemap: false,
    cssCodeSplit: false,
    cssMinify: true,
    // 关键：禁用代码压缩，避免 Terser 压缩导致的对象属性分隔符丢失问题
    minify: false,
    // terserOptions 已禁用，保留配置以备将来使用
    /* terserOptions: {
          compress: {
            // 只移除 console.log，保留 console.error 和 console.warn，便于生产环境调试
            drop_console: ['log'],
            drop_debugger: true,
            reduce_vars: false,
            reduce_funcs: false,
            passes: 1,
            collapse_vars: false,
            dead_code: false,
            // 关键：禁用可能导致对象属性分隔符丢失的优化
            sequences: false, // 禁用序列优化，避免语句被错误合并
            join_vars: false, // 禁用变量连接，避免变量声明被错误合并
            // 关键：禁用不安全的优化，避免数字字面量和字符串被错误处理
            unsafe: false,
            unsafe_comps: false,
            unsafe_math: false,
            unsafe_methods: false,
            unsafe_proto: false,
            unsafe_regexp: false,
            unsafe_undefined: false,
            // 关键：禁用可能导致对象属性分隔符丢失的优化
            keep_infinity: true, // 保留 Infinity，避免数字被错误处理
            // 关键：禁用对象属性优化，确保对象属性之间有正确的逗号分隔符
            properties: false, // 禁用对象属性优化，防止属性被错误合并
            // 关键：禁用表达式优化，确保字符串和数字不会被错误连接
            evaluate: false, // 禁用表达式求值，防止字符串和数字被错误处理
            // 关键：禁用纯函数优化，防止对象字面量被错误处理
            pure_funcs: [], // 不将任何函数视为纯函数，防止对象字面量被错误优化
            // 关键：禁用副作用优化，确保对象字面量格式正确
            side_effects: false, // 不禁用副作用，确保对象字面量格式正确
          },
          // 关键：保留函数名和类名，但禁用变量名混淆
          // 这样可以防止导出名称被混淆，同时允许基本的压缩优化
          mangle: {
            keep_fnames: true,
            keep_classnames: true,
          },
    
          format: {
            comments: false,
            // 关键：确保代码格式正确，避免数字字面量被错误处理
            preserve_annotations: false,
            // 确保数字字面量格式正确
            ascii_only: false, // 允许非 ASCII 字符，避免数字被错误编码
            beautify: false, // 不美化代码，保持压缩后的格式
            // 关键：确保对象属性之间有正确的分隔符
            semicolons: true, // 使用分号，确保语句正确分隔
            // 关键：确保对象字面量格式正确
            wrap_iife: false, // 不包装立即执行函数
            wrap_func_args: false, // 不包装函数参数
          },
        }, */
    assetsInlineLimit: 10 * 1024,
    outDir: process.env.BUILD_OUT_DIR || "dist",
    assetsDir: "assets",
    emptyOutDir: false,
    // 关键：main-app 作为主应用，也需要打包 single-spa 和 qiankun
    // 不将它们标记为 external，确保它们被打包到构建产物中
    // 关键：主应用也需要打包 @btc 包，避免浏览器无法解析路径别名
    // 关键：主应用也需要打包 @configs 包，避免浏览器无法解析路径别名
    rollupOptions: {
      ...createRollupConfig(appName, {
        externalSingleSpa: false,
        // 主应用需要打包 single-spa 和 qiankun
        externalBtcPackages: false,
        // 主应用需要打包 @btc 包，避免浏览器无法解析路径别名
        externalConfigsPackages: false
        // 主应用需要打包 @configs 包，避免浏览器无法解析路径别名
      })
    },
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
    // 禁用 page reload 日志输出
    watch: {
      ignored: ["**/locales/**/*.json"]
    },
    ...restCustomServer
  };
  const rootDistDir = resolve10(appDir2, "../../dist");
  const previewRoot = resolve10(rootDistDir, appConfig.prodHost);
  const previewConfig = {
    port: appConfig.prePort,
    strictPort: true,
    open: false,
    host: "0.0.0.0",
    // 关键：设置预览服务器的根目录为 dist/{prodHost}
    root: previewRoot,
    proxy: proxy2,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    ...customPreview
  };
  const appCacheDir = resolve10(appDir2, "node_modules/.vite");
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
      // system-app 和部分子应用使用了 echarts
      "echarts/core",
      "echarts",
      "vue-echarts"
      // 注意：lunr 和 file-saver 不是所有应用都安装，不应该在 include 中强制声明
      // 如果应用安装了这些依赖，Vite 会在扫描 entries 时自动发现并优化
      // 'lunr', // 只在 shared-components 中使用，不是所有应用都安装
      // 'file-saver', // 只在部分应用中使用，不是所有应用都安装
    ],
    exclude: [
      // 关键：@btc/shared-core/configs/layout-bridge 是本地别名路径，不是 npm 包，不应该被优化
      // 注意：exclude 只支持字符串模式，不支持正则表达式
      "@btc/shared-core/configs/layout-bridge",
      // 关键：排除 @btc/shared-components，因为它是本地包，包含 TSX 文件
      // 在开发环境中，应该直接从源码导入，而不是预构建
      // 这样可以避免 JSX 解析问题
      "@btc/shared-components"
    ],
    force: false,
    // 关键：指定需要扫描的入口文件，确保扫描到 @btc/shared-components 内部的依赖
    // 注意：不再包含 shared-components/src/index.ts，因为它包含 TSX 文件，应该在运行时直接处理
    entries: [
      resolve10(appDir2, "src/main.ts")
      // 注意：不再直接引用 shared-core/src/index.ts，避免在配置加载时解析 @configs/layout-bridge
      // shared-core 的依赖会在运行时通过应用的入口文件自动发现和优化
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
  const finalPublicDir = publicDir;
  const config = {
    base: baseUrl,
    publicDir: finalPublicDir,
    // 关键：每个应用使用独立的缓存目录，避免不同应用的配置差异导致缓存冲突
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
    build: buildConfig,
    // 开发环境日志配置：减少冗余输出
    clearScreen: false,
    // 不清理屏幕，保留之前的输出
    logLevel: process.env.VITE_LOG_LEVEL || "warn"
    // 只显示警告和错误，隐藏 info 和 debug
  };
  const resolveValue = createBaseResolve(appDir2, appName);
  if (resolveValue !== void 0) {
    config.resolve = resolveValue;
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
    configure: (proxy2) => {
      proxy2.on("proxyRes", (proxyRes, req, res) => {
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
      proxy2.on("error", (err, req, res) => {
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

// vite.config.ts
var __vite_injected_original_import_meta_url5 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/apps/main-app/vite.config.ts";
var appDir = fileURLToPath5(new URL(".", __vite_injected_original_import_meta_url5));
var vite_config_default = defineConfig(({ command, mode }) => {
  const baseConfig = createMainAppViteConfig({
    appName: "main-app",
    appDir,
    // 启用 public 图片资源处理插件（构建时自动启用）
    publicImagesToAssets: true,
    // 启用资源预加载插件（默认启用）
    enableResourcePreload: true,
    customPlugins: [
      // 添加 duty 静态文件插件，在开发服务器层面处理 /duty/ 路径
      dutyStaticPlugin(appDir),
      // 注入静态兜底标题
      injectFallbackTitle({ packageName: "main-app" })
    ],
    customServer: { proxy },
    proxy
  });
  if (command === "serve") {
    return baseConfig;
  } else {
    const isPreviewBuild = process.env.VITE_PREVIEW === "true";
    if (!isPreviewBuild) {
      return {
        ...baseConfig,
        publicDir: false
        // 构建时禁用 publicDir，由插件处理
      };
    }
    return baseConfig;
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL2ZhY3Rvcmllcy9tYWluYXBwLmNvbmZpZy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvdXRpbHMvcGF0aC1oZWxwZXJzLnRzIiwgIi4uLy4uL2NvbmZpZ3MvYXV0by1pbXBvcnQuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS1hcHAtY29uZmlnLnRzIiwgIi4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9jb25maWdzL2FwcC1lbnYuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9iYXNlLmNvbmZpZy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9tYW51YWwtY2h1bmtzLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3JvbGx1cC1jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY2xlYW4udHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY2h1bmsudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvdXJsLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2NvcnMudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY3NzLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3ZlcnNpb24udHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvcHVibGljLWltYWdlcy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9yZXNvdXJjZS1wcmVsb2FkLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VwbG9hZC1pY29ucy10by1vc3MudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvcmVwbGFjZS1pY29ucy13aXRoLWNkbi50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9kdXR5LXN0YXRpYy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy91cGxvYWQtY2RuLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2Nkbi1hc3NldHMudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY2RuLWltcG9ydC50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9yZXNvbHZlLWJ0Yy1pbXBvcnRzLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3Jlc29sdmUtYXV0aC1hbGlhc2VzLnRzIiwgInNyYy9jb25maWcvcHJveHkudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcbWFpbi1hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxtYWluLWFwcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9hcHBzL21haW4tYXBwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCB0eXBlIENvbmZpZ0VudiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcbmltcG9ydCB7IGNyZWF0ZU1haW5BcHBWaXRlQ29uZmlnIH0gZnJvbSAnLi4vLi4vY29uZmlncy92aXRlL2ZhY3Rvcmllcy9tYWluYXBwLmNvbmZpZyc7XG5pbXBvcnQgeyBkdXR5U3RhdGljUGx1Z2luIH0gZnJvbSAnLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMnO1xuaW1wb3J0IHsgaW5qZWN0RmFsbGJhY2tUaXRsZSB9IGZyb20gJ0BidGMvdml0ZS1wbHVnaW4nO1xuaW1wb3J0IHsgcHJveHkgfSBmcm9tICcuL3NyYy9jb25maWcvcHJveHknO1xuXG5jb25zdCBhcHBEaXIgPSBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4nLCBpbXBvcnQubWV0YS51cmwpKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfTogQ29uZmlnRW52KSA9PiB7XG4gIGNvbnN0IGJhc2VDb25maWcgPSBjcmVhdGVNYWluQXBwVml0ZUNvbmZpZyh7XG4gICAgYXBwTmFtZTogJ21haW4tYXBwJyxcbiAgICBhcHBEaXIsXG4gICAgLy8gXHU1NDJGXHU3NTI4IHB1YmxpYyBcdTU2RkVcdTcyNDdcdThENDRcdTZFOTBcdTU5MDRcdTc0MDZcdTYzRDJcdTRFRjZcdUZGMDhcdTY3ODRcdTVFRkFcdTY1RjZcdTgxRUFcdTUyQThcdTU0MkZcdTc1MjhcdUZGMDlcbiAgICBwdWJsaWNJbWFnZXNUb0Fzc2V0czogdHJ1ZSxcbiAgICAvLyBcdTU0MkZcdTc1MjhcdThENDRcdTZFOTBcdTk4ODRcdTUyQTBcdThGN0RcdTYzRDJcdTRFRjZcdUZGMDhcdTlFRDhcdThCQTRcdTU0MkZcdTc1MjhcdUZGMDlcbiAgICBlbmFibGVSZXNvdXJjZVByZWxvYWQ6IHRydWUsXG4gICAgY3VzdG9tUGx1Z2luczogW1xuICAgICAgLy8gXHU2REZCXHU1MkEwIGR1dHkgXHU5NzU5XHU2MDAxXHU2NTg3XHU0RUY2XHU2M0QyXHU0RUY2XHVGRjBDXHU1NzI4XHU1RjAwXHU1M0QxXHU2NzBEXHU1MkExXHU1NjY4XHU1QzQyXHU5NzYyXHU1OTA0XHU3NDA2IC9kdXR5LyBcdThERUZcdTVGODRcbiAgICAgIGR1dHlTdGF0aWNQbHVnaW4oYXBwRGlyKSxcbiAgICAgIC8vIFx1NkNFOFx1NTE2NVx1OTc1OVx1NjAwMVx1NTE1Q1x1NUU5NVx1NjgwN1x1OTg5OFxuICAgICAgaW5qZWN0RmFsbGJhY2tUaXRsZSh7IHBhY2thZ2VOYW1lOiAnbWFpbi1hcHAnIH0pLFxuICAgIF0sXG4gICAgY3VzdG9tU2VydmVyOiB7IHByb3h5IH0sXG4gICAgcHJveHksXG4gIH0pO1xuXG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NjgzOVx1NjM2RSBjb21tYW5kIFx1NTJBOFx1NjAwMVx1OTE0RFx1N0Y2RSBwdWJsaWNEaXJcbiAgLy8gLSBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdUZGMDhzZXJ2ZVx1RkYwOVx1RkYxQVx1NTQyRlx1NzUyOCBwdWJsaWNEaXJcdUZGMENcdThCQTkgVml0ZSBcdTZCNjNcdTVFMzhcdTY3MERcdTUyQTEgcHVibGljIFx1NzZFRVx1NUY1NVx1NzY4NFx1NjU4N1x1NEVGNlxuICAvLyAtIFx1Njc4NFx1NUVGQVx1NzNBRlx1NTg4M1x1RkYwOGJ1aWxkXHVGRjA5XHVGRjFBXHU3OTgxXHU3NTI4IHB1YmxpY0Rpclx1RkYwQ1x1NzUzMSBwdWJsaWNJbWFnZXNUb0Fzc2V0c1BsdWdpbiBcdTYzRDJcdTRFRjZcdTU5MDRcdTc0MDZcdTY1ODdcdTRFRjZcbiAgaWYgKGNvbW1hbmQgPT09ICdzZXJ2ZScpIHtcbiAgICAvLyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdUZGMUFcdTU0MkZcdTc1MjggcHVibGljRGlyXG4gICAgcmV0dXJuIGJhc2VDb25maWc7XG4gIH0gZWxzZSB7XG4gICAgLy8gXHU2Nzg0XHU1RUZBXHU3M0FGXHU1ODgzXHVGRjFBXHU1OTgyXHU2NzlDXHU1NDJGXHU3NTI4XHU0RTg2IHB1YmxpY0ltYWdlc1RvQXNzZXRzIFx1NjNEMlx1NEVGNlx1RkYwQ1x1Nzk4MVx1NzUyOCBwdWJsaWNEaXJcbiAgICBjb25zdCBpc1ByZXZpZXdCdWlsZCA9IHByb2Nlc3MuZW52LlZJVEVfUFJFVklFVyA9PT0gJ3RydWUnO1xuICAgIGlmICghaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmJhc2VDb25maWcsXG4gICAgICAgIHB1YmxpY0RpcjogZmFsc2UsIC8vIFx1Njc4NFx1NUVGQVx1NjVGNlx1Nzk4MVx1NzUyOCBwdWJsaWNEaXJcdUZGMENcdTc1MzFcdTYzRDJcdTRFRjZcdTU5MDRcdTc0MDZcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBiYXNlQ29uZmlnO1xuICB9XG59KTtcblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxmYWN0b3JpZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXGZhY3Rvcmllc1xcXFxtYWluYXBwLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvZmFjdG9yaWVzL21haW5hcHAuY29uZmlnLnRzXCI7LyoqXG4gKiBcdTRFM0JcdTVFOTRcdTc1MjggVml0ZSBcdTkxNERcdTdGNkVcdTVERTVcdTUzODJcbiAqIFx1NzUxRlx1NjIxMFx1NEUzQlx1NUU5NFx1NzUyOFx1NzY4NFx1NUI4Q1x1NjU3NCBWaXRlIFx1OTE0RFx1N0Y2RVx1RkYwOG1haW4tYXBwXHVGRjA5XG4gKi9cblxuaW1wb3J0IHR5cGUgeyBVc2VyQ29uZmlnLCBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGNyZWF0ZVJlcXVpcmUgfSBmcm9tICdtb2R1bGUnO1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xuaW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4JztcbmltcG9ydCBVbm9DU1MgZnJvbSAndW5vY3NzL3ZpdGUnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyBjcmVhdGVQYXRoSGVscGVycyB9IGZyb20gJy4uL3V0aWxzL3BhdGgtaGVscGVycyc7XG5cbi8vIFx1NEY3Rlx1NzUyOCBFU00gXHU1QkZDXHU1MTY1IFZ1ZUkxOG5QbHVnaW5cdUZGMDhWaXRlIFx1OTE0RFx1N0Y2RVx1NjU4N1x1NEVGNlx1NjUyRlx1NjMwMSBFU01cdUZGMDlcbmltcG9ydCBWdWVJMThuUGx1Z2luIGZyb20gJ0BpbnRsaWZ5L3VucGx1Z2luLXZ1ZS1pMThuL3ZpdGUnO1xuaW1wb3J0IHsgY3JlYXRlQXV0b0ltcG9ydENvbmZpZywgY3JlYXRlQ29tcG9uZW50c0NvbmZpZyB9IGZyb20gJy4uLy4uL2F1dG8taW1wb3J0LmNvbmZpZyc7XG5pbXBvcnQgeyBidGMsIGZpeENodW5rUmVmZXJlbmNlc1BsdWdpbiB9IGZyb20gJ0BidGMvdml0ZS1wbHVnaW4nO1xuaW1wb3J0IHsgZ2V0Vml0ZUFwcENvbmZpZywgZ2V0UHVibGljRGlyIH0gZnJvbSAnLi4vLi4vdml0ZS1hcHAtY29uZmlnJztcbmltcG9ydCB7IGNyZWF0ZUJhc2VSZXNvbHZlIH0gZnJvbSAnLi4vYmFzZS5jb25maWcnO1xuaW1wb3J0IHsgY3JlYXRlUm9sbHVwQ29uZmlnIH0gZnJvbSAnLi4vcGx1Z2lucy9yb2xsdXAtY29uZmlnJztcbmltcG9ydCB7XG4gIGNsZWFuRGlzdFBsdWdpbixcbiAgY2h1bmtWZXJpZnlQbHVnaW4sXG4gIG9wdGltaXplQ2h1bmtzUGx1Z2luLFxuICBlbnN1cmVCYXNlVXJsUGx1Z2luLFxuICBjb3JzUGx1Z2luLFxuICBlbnN1cmVDc3NQbHVnaW4sXG4gIGFkZFZlcnNpb25QbHVnaW4sXG4gIHJlcGxhY2VJY29uc1dpdGhDZG5QbHVnaW4sXG4gIHB1YmxpY0ltYWdlc1RvQXNzZXRzUGx1Z2luLFxuICByZXNvdXJjZVByZWxvYWRQbHVnaW4sXG4gIHVwbG9hZENkblBsdWdpbixcbiAgY2RuQXNzZXRzUGx1Z2luLFxuICBjZG5JbXBvcnRQbHVnaW4sXG4gIHJlc29sdmVCdGNJbXBvcnRzUGx1Z2luLFxuICByZXNvbHZlQXV0aEFsaWFzZXNQbHVnaW4sXG59IGZyb20gJy4uL3BsdWdpbnMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1haW5BcHBWaXRlQ29uZmlnT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcdUZGMDhcdTU5ODIgJ3N5c3RlbS1hcHAnXHVGRjA5XG4gICAqL1xuICBhcHBOYW1lOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBcdTVFOTRcdTc1MjhcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAgICovXG4gIGFwcERpcjogc3RyaW5nO1xuICAvKipcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5XHU2M0QyXHU0RUY2XHU1MjE3XHU4ODY4XG4gICAqL1xuICBjdXN0b21QbHVnaW5zPzogUGx1Z2luW107XG4gIC8qKlxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTY3ODRcdTVFRkFcdTkxNERcdTdGNkVcbiAgICovXG4gIGN1c3RvbUJ1aWxkPzogUGFydGlhbDxVc2VyQ29uZmlnWydidWlsZCddPjtcbiAgLyoqXG4gICAqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NjcwRFx1NTJBMVx1NTY2OFx1OTE0RFx1N0Y2RVxuICAgKi9cbiAgY3VzdG9tU2VydmVyPzogUGFydGlhbDxVc2VyQ29uZmlnWydzZXJ2ZXInXT47XG4gIC8qKlxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTk4ODRcdTg5QzhcdTY3MERcdTUyQTFcdTU2NjhcdTkxNERcdTdGNkVcbiAgICovXG4gIGN1c3RvbVByZXZpZXc/OiBQYXJ0aWFsPFVzZXJDb25maWdbJ3ByZXZpZXcnXT47XG4gIC8qKlxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTRGMThcdTUzMTZcdTRGOURcdThENTZcdTkxNERcdTdGNkVcbiAgICovXG4gIGN1c3RvbU9wdGltaXplRGVwcz86IFBhcnRpYWw8VXNlckNvbmZpZ1snb3B0aW1pemVEZXBzJ10+O1xuICAvKipcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5IENTUyBcdTkxNERcdTdGNkVcbiAgICovXG4gIGN1c3RvbUNzcz86IFBhcnRpYWw8VXNlckNvbmZpZ1snY3NzJ10+O1xuICAvKipcbiAgICogXHU0RUUzXHU3NDA2XHU5MTREXHU3RjZFXG4gICAqL1xuICBwcm94eT86IFJlY29yZDxzdHJpbmcsIGFueT47XG4gIC8qKlxuICAgKiBCVEMgXHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFXG4gICAqL1xuICBidGNPcHRpb25zPzoge1xuICAgIHR5cGU/OiAnYWRtaW4nO1xuICAgIHByb3h5PzogUmVjb3JkPHN0cmluZywgYW55PjtcbiAgICBlcHM/OiB7XG4gICAgICBlbmFibGU/OiBib29sZWFuO1xuICAgICAgZGljdD86IGJvb2xlYW47XG4gICAgICBkaWN0QXBpPzogc3RyaW5nO1xuICAgICAgZGlzdD86IHN0cmluZztcbiAgICB9O1xuICAgIHN2Zz86IHtcbiAgICAgIHNraXBOYW1lcz86IHN0cmluZ1tdO1xuICAgIH07XG4gIH07XG4gIC8qKlxuICAgKiBWdWVJMThuIFx1NjNEMlx1NEVGNlx1OTE0RFx1N0Y2RVxuICAgKi9cbiAgdnVlSTE4bk9wdGlvbnM/OiB7XG4gICAgaW5jbHVkZT86IHN0cmluZ1tdO1xuICAgIHJ1bnRpbWVPbmx5PzogYm9vbGVhbjtcbiAgfTtcbiAgLyoqXG4gICAqIHB1YmxpY0ltYWdlc1RvQXNzZXRzUGx1Z2luIFx1OTE0RFx1N0Y2RVx1RkYwOFx1NEUzQlx1NUU5NFx1NzUyOFx1NzI3OVx1NjcwOVx1RkYwOVxuICAgKi9cbiAgcHVibGljSW1hZ2VzVG9Bc3NldHM/OiBib29sZWFuO1xuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4XHU4RDQ0XHU2RTkwXHU5ODg0XHU1MkEwXHU4RjdEXHU2M0QyXHU0RUY2XG4gICAqL1xuICBlbmFibGVSZXNvdXJjZVByZWxvYWQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQVx1NEUzQlx1NUU5NFx1NzUyOCBWaXRlIFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWFpbkFwcFZpdGVDb25maWcob3B0aW9uczogTWFpbkFwcFZpdGVDb25maWdPcHRpb25zKTogVXNlckNvbmZpZyB7XG4gIGNvbnN0IHtcbiAgICBhcHBOYW1lLFxuICAgIGFwcERpcixcbiAgICBjdXN0b21QbHVnaW5zID0gW10sXG4gICAgY3VzdG9tQnVpbGQsXG4gICAgY3VzdG9tU2VydmVyLFxuICAgIGN1c3RvbVByZXZpZXcsXG4gICAgY3VzdG9tT3B0aW1pemVEZXBzLFxuICAgIGN1c3RvbUNzcyxcbiAgICBwcm94eSA9IHt9LFxuICAgIGJ0Y09wdGlvbnMgPSB7fSxcbiAgICB2dWVJMThuT3B0aW9ucyxcbiAgICBwdWJsaWNJbWFnZXNUb0Fzc2V0cyA9IHRydWUsXG4gICAgZW5hYmxlUmVzb3VyY2VQcmVsb2FkID0gdHJ1ZSxcbiAgfSA9IG9wdGlvbnM7XG5cbiAgLy8gXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXG4gIGNvbnN0IGFwcENvbmZpZyA9IGdldFZpdGVBcHBDb25maWcoYXBwTmFtZSk7XG4gIC8vIFx1NEY3Rlx1NzUyOFx1NUJGQ1x1NTE2NVx1NzY4NCBjcmVhdGVQYXRoSGVscGVyc1xuICBjb25zdCB7IHdpdGhSb290IH0gPSBjcmVhdGVQYXRoSGVscGVycyhhcHBEaXIpO1xuXG4gIC8vIFx1NTIyNFx1NjVBRFx1NjYyRlx1NTQyNlx1NEUzQVx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVxuICBjb25zdCBpc1ByZXZpZXdCdWlsZCA9IHByb2Nlc3MuZW52LlZJVEVfUFJFVklFVyA9PT0gJ3RydWUnO1xuICBjb25zdCBiYXNlVXJsID0gJy8nOyAvLyBcdTRFM0JcdTVFOTRcdTc1MjhcdTU2RkFcdTVCOUFcdTRGN0ZcdTc1MjhcdTY4MzlcdThERUZcdTVGODRcbiAgY29uc3QgcHVibGljRGlyID0gZ2V0UHVibGljRGlyKGFwcE5hbWUsIGFwcERpcik7XG5cbiAgLy8gXHU4M0I3XHU1M0Q2XHU0RTNCXHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHVGRjA4XHU3NTI4XHU0RThFIGVuc3VyZUJhc2VVcmxQbHVnaW5cdUZGMDlcbiAgY29uc3QgbWFpbkFwcENvbmZpZyA9IGdldFZpdGVBcHBDb25maWcoJ21haW4tYXBwJyk7XG4gIGNvbnN0IG1haW5BcHBQb3J0ID0gbWFpbkFwcENvbmZpZy5wcmVQb3J0LnRvU3RyaW5nKCk7XG5cbiAgLy8gXHU1MTczXHU5NTJFXHVGRjFBRVBTIFx1NzY4NCBvdXRwdXREaXIgXHU1RkM1XHU5ODdCXHU0RjdGXHU3NTI4XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU1N0ZBXHU0RThFIGFwcERpciBcdTg5RTNcdTY3OTBcbiAgLy8gXHU0RTNCXHU1RTk0XHU3NTI4XHU0RjdGXHU3NTI4IHNyYy9idWlsZC9lcHMgXHU3NkVFXHU1RjU1XHVGRjBDXHU3ODZFXHU0RkREIEVQUyBcdTY1NzBcdTYzNkVcdTU3MjhcdTZFOTBcdTc4MDFcdTc2RUVcdTVGNTVcdTRFMkRcdUZGMENcdTRGQkZcdTRFOEVcdTcyNDhcdTY3MkNcdTYzQTdcdTUyMzZcdTU0OENcdTVGMDBcdTUzRDFcbiAgY29uc3QgZXBzT3V0cHV0RGlyID0gcmVzb2x2ZShhcHBEaXIsICdzcmMnLCAnYnVpbGQnLCAnZXBzJyk7XG5cbiAgLy8gXHU2Nzg0XHU1RUZBXHU2M0QyXHU0RUY2XHU1MjE3XHU4ODY4XG4gIGNvbnN0IHBsdWdpbnM6IChQbHVnaW4gfCBQbHVnaW5bXSlbXSA9IFtcbiAgICAvLyAxLiBcdTZFMDVcdTc0MDZcdTYzRDJcdTRFRjZcbiAgICBjbGVhbkRpc3RQbHVnaW4oYXBwRGlyKSxcbiAgICAvLyAyLiBDT1JTIFx1NjNEMlx1NEVGNlxuICAgIGNvcnNQbHVnaW4oKSxcbiAgICAvLyAzLiBcdTg5RTNcdTY3OTAgYXV0aCBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODQgQCBcdTUyMkJcdTU0MERcdTYzRDJcdTRFRjZcdUZGMDhcdTVGQzVcdTk4N0JcdTU3MjggcmVzb2x2ZUJ0Y0ltcG9ydHNQbHVnaW4gXHU0RTRCXHU1MjREXHVGRjA5XG4gICAgcmVzb2x2ZUF1dGhBbGlhc2VzUGx1Z2luKHsgYXBwRGlyIH0pLFxuICAgIC8vIDQuIFx1ODlFM1x1Njc5MCBAYnRjLyogXHU1MzA1XHU1QkZDXHU1MTY1XHU2M0QyXHU0RUY2XHVGRjA4XHU3ODZFXHU0RkREXHU4MEZEXHU1OTFGXHU4OUUzXHU2NzkwXHU0RUNFXHU1REYyXHU2Nzg0XHU1RUZBXHU1MzA1XHU0RTJEXHU1QkZDXHU1MTY1XHU3Njg0IEBidGMvKiBcdTZBMjFcdTU3NTdcdUZGMDlcbiAgICByZXNvbHZlQnRjSW1wb3J0c1BsdWdpbih7IGFwcERpciB9KSxcbiAgICAvLyA0LiBQdWJsaWMgXHU1NkZFXHU3MjQ3XHU4RDQ0XHU2RTkwXHU1OTA0XHU3NDA2XHU2M0QyXHU0RUY2XHVGRjA4XHU1OTgyXHU2NzlDXHU1NDJGXHU3NTI4XHVGRjA5XG4gICAgLi4uKHB1YmxpY0ltYWdlc1RvQXNzZXRzICYmICFpc1ByZXZpZXdCdWlsZCA/IFtwdWJsaWNJbWFnZXNUb0Fzc2V0c1BsdWdpbihhcHBEaXIpXSA6IFtdKSxcbiAgICAvLyA1LiBcdThENDRcdTZFOTBcdTk4ODRcdTUyQTBcdThGN0RcdTYzRDJcdTRFRjZcdUZGMDhcdTU5ODJcdTY3OUNcdTU0MkZcdTc1MjhcdUZGMDlcbiAgICAuLi4oZW5hYmxlUmVzb3VyY2VQcmVsb2FkICE9PSBmYWxzZSA/IFtyZXNvdXJjZVByZWxvYWRQbHVnaW4oKV0gOiBbXSksXG4gICAgLy8gNi4gXHU4MUVBXHU1QjlBXHU0RTQ5XHU2M0QyXHU0RUY2XHVGRjA4XHU1NzI4XHU2ODM4XHU1RkMzXHU2M0QyXHU0RUY2XHU0RTRCXHU1MjREXHVGRjA5XG4gICAgLi4uY3VzdG9tUGx1Z2lucyxcbiAgICAvLyA2LiBWdWUgXHU2M0QyXHU0RUY2XG4gICAgdnVlKHtcbiAgICAgIHNjcmlwdDoge1xuICAgICAgICBmczoge1xuICAgICAgICAgIGZpbGVFeGlzdHM6IGV4aXN0c1N5bmMsXG4gICAgICAgICAgcmVhZEZpbGU6IChmaWxlOiBzdHJpbmcpID0+IHJlYWRGaWxlU3luYyhmaWxlLCAndXRmLTgnKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgLy8gNi41LiBWdWUgSlNYIFx1NjNEMlx1NEVGNlx1RkYwOFx1NjUyRlx1NjMwMSBUU1ggXHU2NTg3XHU0RUY2XHU0RTJEXHU3Njg0IEpTWCBcdThCRURcdTZDRDVcdUZGMDlcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRFMEUgY29vbC1hZG1pbiBcdTRGRERcdTYzMDFcdTRFMDBcdTgxRjRcdUZGMENcdTRGN0ZcdTc1MjhcdTlFRDhcdThCQTRcdTkxNERcdTdGNkVcdUZGMENcdThCQTlcdTYzRDJcdTRFRjZcdTgxRUFcdTUyQThcdTU5MDRcdTc0MDZcdTYyNDBcdTY3MDkgSlNYL1RTWCBcdTY1ODdcdTRFRjZcbiAgICB2dWVKc3goKSxcbiAgICAvLyA3LiBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTYzRDJcdTRFRjZcbiAgICBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnKCksXG4gICAgLy8gOC4gXHU3RUM0XHU0RUY2XHU4MUVBXHU1MkE4XHU2Q0U4XHU1MThDXHU2M0QyXHU0RUY2XG4gICAgY3JlYXRlQ29tcG9uZW50c0NvbmZpZyh7IGluY2x1ZGVTaGFyZWQ6IHRydWUgfSksXG4gICAgLy8gOS4gVW5vQ1NTIFx1NjNEMlx1NEVGNlxuICAgIFVub0NTUyh7XG4gICAgICBjb25maWdGaWxlOiB3aXRoUm9vdCgndW5vLmNvbmZpZy50cycpLFxuICAgIH0pLFxuICAgIC8vIDEwLiBCVEMgXHU0RTFBXHU1MkExXHU2M0QyXHU0RUY2XG4gICAgYnRjKHtcbiAgICAgIHR5cGU6ICdhZG1pbicgYXMgYW55LFxuICAgICAgcHJveHksXG4gICAgICBlcHM6IHtcbiAgICAgICAgZW5hYmxlOiB0cnVlLFxuICAgICAgICBkaWN0OiBidGNPcHRpb25zLmVwcz8uZGljdCA/PyB0cnVlLCAvLyBcdTlFRDhcdThCQTRcdTU0MkZcdTc1MjhcdTVCNTdcdTUxNzhcdTUyOUZcdTgwRkRcbiAgICAgICAgZGljdEFwaTogYnRjT3B0aW9ucy5lcHM/LmRpY3RBcGkgfHwgJy9hcGkvc3lzdGVtL2F1dGgvZGljdCcsIC8vIFx1OUVEOFx1OEJBNFx1NUI1N1x1NTE3OFx1NjNBNVx1NTNFM1xuICAgICAgICBkaXN0OiBlcHNPdXRwdXREaXIsXG4gICAgICAgIC4uLmJ0Y09wdGlvbnMuZXBzLFxuICAgICAgfSxcbiAgICAgIHN2Zzoge1xuICAgICAgICBza2lwTmFtZXM6IFsnYmFzZScsICdpY29ucyddLFxuICAgICAgICAuLi5idGNPcHRpb25zLnN2ZyxcbiAgICAgIH0sXG4gICAgICAuLi5idGNPcHRpb25zLFxuICAgIH0pLFxuICAgIC8vIDExLiBWdWVJMThuIFx1NjNEMlx1NEVGNlxuICAgIFZ1ZUkxOG5QbHVnaW4oe1xuICAgICAgaW5jbHVkZTogdnVlSTE4bk9wdGlvbnM/LmluY2x1ZGUgfHwgW1xuICAgICAgICByZXNvbHZlKGFwcERpciwgJ3NyYy9sb2NhbGVzLyoqJyksXG4gICAgICAgIHJlc29sdmUoYXBwRGlyLCAnc3JjL3ttb2R1bGVzLHBsdWdpbnN9LyoqL2xvY2FsZXMvKionKSxcbiAgICAgIF0sXG4gICAgICBydW50aW1lT25seTogdnVlSTE4bk9wdGlvbnM/LnJ1bnRpbWVPbmx5ID8/IHRydWUsXG4gICAgfSksXG4gICAgLy8gMTIuIENTUyBcdTlBOENcdThCQzFcdTYzRDJcdTRFRjZcbiAgICBlbnN1cmVDc3NQbHVnaW4oKSxcbiAgICAvLyAxMy4gXHU0RkVFXHU1OTBEIGNodW5rIFx1NUYxNVx1NzUyOFx1NjNEMlx1NEVGNlxuICAgIGZpeENodW5rUmVmZXJlbmNlc1BsdWdpbigpLFxuICAgIC8vIDE2LiBcdTc4NkVcdTRGREQgYmFzZSBVUkwgXHU2M0QyXHU0RUY2XHVGRjA4XHU0RTNCXHU1RTk0XHU3NTI4XHU0RTVGXHU5NzAwXHU4OTgxXHVGRjBDXHU1NkUwXHU0RTNBXHU1M0VGXHU4MEZEXHU2NzA5XHU1QjUwXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHVGRjA5XG4gICAgZW5zdXJlQmFzZVVybFBsdWdpbihiYXNlVXJsLCBhcHBDb25maWcuZGV2SG9zdCwgYXBwQ29uZmlnLnByZVBvcnQsIG1haW5BcHBQb3J0KSxcbiAgICAvLyAxNy4gXHU2REZCXHU1MkEwXHU3MjQ4XHU2NzJDXHU1M0Y3XHU2M0QyXHU0RUY2XHVGRjA4XHU0RTNBIEhUTUwgXHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU2REZCXHU1MkEwXHU2NUY2XHU5NUY0XHU2MjMzXHU3MjQ4XHU2NzJDXHU1M0Y3XHVGRjA5XG4gICAgYWRkVmVyc2lvblBsdWdpbigpLFxuICAgIC8vIDE3LjUuIENETiBcdThENDRcdTZFOTBcdTUyQTBcdTkwMUZcdTYzRDJcdTRFRjZcdUZGMDhcdTU3MjhcdTcyNDhcdTY3MkNcdTUzRjdcdTYzRDJcdTRFRjZcdTRFNEJcdTU0MEVcdUZGMENcdTc4NkVcdTRGRERcdTcyNDhcdTY3MkNcdTUzRjdcdTUzQzJcdTY1NzBcdTg4QUJcdTRGRERcdTc1NTlcdUZGMDlcbiAgICAvLyBcdTU5MDRcdTc0MDYgSFRNTCBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTAgVVJMXHVGRjA4PHNjcmlwdD5cdTMwMDE8bGluaz5cdTMwMDE8aW1nPiBcdTdCNDlcdUZGMDlcbiAgICBjZG5Bc3NldHNQbHVnaW4oe1xuICAgICAgYXBwTmFtZSxcbiAgICAgIGVuYWJsZWQ6ICFpc1ByZXZpZXdCdWlsZCAmJiBwcm9jZXNzLmVudi5FTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiAhPT0gJ2ZhbHNlJyxcbiAgICB9KSxcbiAgICAvLyAxNy42LiBDRE4gXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU4RjZDXHU2MzYyXHU2M0QyXHU0RUY2XHVGRjA4XHU4RjZDXHU2MzYyXHU0RUUzXHU3ODAxXHU0RTJEXHU3Njg0IGltcG9ydCgpIFx1OEMwM1x1NzUyOFx1RkYwOVxuICAgIC8vIFx1NUMwNlx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1OEY2Q1x1NjM2Mlx1NEUzQSBDRE4gVVJMXHVGRjBDXHU0RTBFIGNkbkFzc2V0c1BsdWdpbiBcdTkxNERcdTU0MDhcdTVCOUVcdTczQjBcdTVCOENcdTY1NzRcdTc2ODQgQ0ROIFx1NTJBMFx1OTAxRlxuICAgIGNkbkltcG9ydFBsdWdpbih7XG4gICAgICBhcHBOYW1lLFxuICAgICAgZW5hYmxlZDogIWlzUHJldmlld0J1aWxkICYmIHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OICE9PSAnZmFsc2UnLFxuICAgIH0pLFxuICAgIC8vIDE3LjcuIFx1NjZGRlx1NjM2Mlx1NTZGRVx1NjgwN1x1OERFRlx1NUY4NFx1NEUzQSBDRE4gVVJMXHVGRjA4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjA5XG4gICAgcmVwbGFjZUljb25zV2l0aENkblBsdWdpbigpLFxuICAgIC8vIDE4LiBcdTRGMThcdTUzMTYgY2h1bmtzIFx1NjNEMlx1NEVGNlxuICAgIG9wdGltaXplQ2h1bmtzUGx1Z2luKCksXG4gICAgLy8gMTkuIENodW5rIFx1OUE4Q1x1OEJDMVx1NjNEMlx1NEVGNlxuICAgIGNodW5rVmVyaWZ5UGx1Z2luKCksXG4gICAgLy8gMjAuIENETiBcdTRFMEFcdTRGMjBcdTYzRDJcdTRFRjZcdUZGMDhcdTRFQzVcdTU3MjhcdTc1MUZcdTRFQTdcdTY3ODRcdTVFRkFcdTRFMTRcdTU0MkZcdTc1MjhcdTY1RjZcdUZGMDlcbiAgICAuLi4ocHJvY2Vzcy5lbnYuRU5BQkxFX0NETl9VUExPQUQgPT09ICd0cnVlJyAmJiAhaXNQcmV2aWV3QnVpbGRcbiAgICAgID8gW3VwbG9hZENkblBsdWdpbihhcHBOYW1lLCBhcHBEaXIpXVxuICAgICAgOiBbXSksXG4gIF07XG5cbiAgLy8gXHU2Nzg0XHU1RUZBXHU5MTREXHU3RjZFXG4gIGNvbnN0IGJ1aWxkQ29uZmlnOiBVc2VyQ29uZmlnWydidWlsZCddID0ge1xuICAgIHRhcmdldDogJ2VzMjAyMCcsXG4gICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICBjc3NDb2RlU3BsaXQ6IGZhbHNlLFxuICAgIGNzc01pbmlmeTogdHJ1ZSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc5ODFcdTc1MjhcdTRFRTNcdTc4MDFcdTUzOEJcdTdGMjlcdUZGMENcdTkwN0ZcdTUxNEQgVGVyc2VyIFx1NTM4Qlx1N0YyOVx1NUJGQ1x1ODFGNFx1NzY4NFx1NUJGOVx1OEM2MVx1NUM1RVx1NjAyN1x1NTIwNlx1OTY5NFx1N0IyNlx1NEUyMlx1NTkzMVx1OTVFRVx1OTg5OFxuICAgIG1pbmlmeTogZmFsc2UsXG4gICAgLy8gdGVyc2VyT3B0aW9ucyBcdTVERjJcdTc5ODFcdTc1MjhcdUZGMENcdTRGRERcdTc1NTlcdTkxNERcdTdGNkVcdTRFRTVcdTU5MDdcdTVDMDZcdTY3NjVcdTRGN0ZcdTc1MjhcbiAgICAvKiB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICBjb21wcmVzczoge1xuICAgICAgICAvLyBcdTUzRUFcdTc5RkJcdTk2NjQgY29uc29sZS5sb2dcdUZGMENcdTRGRERcdTc1NTkgY29uc29sZS5lcnJvciBcdTU0OEMgY29uc29sZS53YXJuXHVGRjBDXHU0RkJGXHU0RThFXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU4QzAzXHU4QkQ1XG4gICAgICAgIGRyb3BfY29uc29sZTogWydsb2cnXSxcbiAgICAgICAgZHJvcF9kZWJ1Z2dlcjogdHJ1ZSxcbiAgICAgICAgcmVkdWNlX3ZhcnM6IGZhbHNlLFxuICAgICAgICByZWR1Y2VfZnVuY3M6IGZhbHNlLFxuICAgICAgICBwYXNzZXM6IDEsXG4gICAgICAgIGNvbGxhcHNlX3ZhcnM6IGZhbHNlLFxuICAgICAgICBkZWFkX2NvZGU6IGZhbHNlLFxuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc5ODFcdTc1MjhcdTUzRUZcdTgwRkRcdTVCRkNcdTgxRjRcdTVCRjlcdThDNjFcdTVDNUVcdTYwMjdcdTUyMDZcdTk2OTRcdTdCMjZcdTRFMjJcdTU5MzFcdTc2ODRcdTRGMThcdTUzMTZcbiAgICAgICAgc2VxdWVuY2VzOiBmYWxzZSwgLy8gXHU3OTgxXHU3NTI4XHU1RThGXHU1MjE3XHU0RjE4XHU1MzE2XHVGRjBDXHU5MDdGXHU1MTREXHU4QkVEXHU1M0U1XHU4OEFCXHU5NTE5XHU4QkVGXHU1NDA4XHU1RTc2XG4gICAgICAgIGpvaW5fdmFyczogZmFsc2UsIC8vIFx1Nzk4MVx1NzUyOFx1NTNEOFx1OTFDRlx1OEZERVx1NjNBNVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NTNEOFx1OTFDRlx1NThGMFx1NjYwRVx1ODhBQlx1OTUxOVx1OEJFRlx1NTQwOFx1NUU3NlxuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc5ODFcdTc1MjhcdTRFMERcdTVCODlcdTUxNjhcdTc2ODRcdTRGMThcdTUzMTZcdUZGMENcdTkwN0ZcdTUxNERcdTY1NzBcdTVCNTdcdTVCNTdcdTk3NjJcdTkxQ0ZcdTU0OENcdTVCNTdcdTdCMjZcdTRFMzJcdTg4QUJcdTk1MTlcdThCRUZcdTU5MDRcdTc0MDZcbiAgICAgICAgdW5zYWZlOiBmYWxzZSxcbiAgICAgICAgdW5zYWZlX2NvbXBzOiBmYWxzZSxcbiAgICAgICAgdW5zYWZlX21hdGg6IGZhbHNlLFxuICAgICAgICB1bnNhZmVfbWV0aG9kczogZmFsc2UsXG4gICAgICAgIHVuc2FmZV9wcm90bzogZmFsc2UsXG4gICAgICAgIHVuc2FmZV9yZWdleHA6IGZhbHNlLFxuICAgICAgICB1bnNhZmVfdW5kZWZpbmVkOiBmYWxzZSxcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3OTgxXHU3NTI4XHU1M0VGXHU4MEZEXHU1QkZDXHU4MUY0XHU1QkY5XHU4QzYxXHU1QzVFXHU2MDI3XHU1MjA2XHU5Njk0XHU3QjI2XHU0RTIyXHU1OTMxXHU3Njg0XHU0RjE4XHU1MzE2XG4gICAgICAgIGtlZXBfaW5maW5pdHk6IHRydWUsIC8vIFx1NEZERFx1NzU1OSBJbmZpbml0eVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NjU3MFx1NUI1N1x1ODhBQlx1OTUxOVx1OEJFRlx1NTkwNFx1NzQwNlxuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc5ODFcdTc1MjhcdTVCRjlcdThDNjFcdTVDNUVcdTYwMjdcdTRGMThcdTUzMTZcdUZGMENcdTc4NkVcdTRGRERcdTVCRjlcdThDNjFcdTVDNUVcdTYwMjdcdTRFNEJcdTk1RjRcdTY3MDlcdTZCNjNcdTc4NkVcdTc2ODRcdTkwMTdcdTUzRjdcdTUyMDZcdTk2OTRcdTdCMjZcbiAgICAgICAgcHJvcGVydGllczogZmFsc2UsIC8vIFx1Nzk4MVx1NzUyOFx1NUJGOVx1OEM2MVx1NUM1RVx1NjAyN1x1NEYxOFx1NTMxNlx1RkYwQ1x1OTYzMlx1NkI2Mlx1NUM1RVx1NjAyN1x1ODhBQlx1OTUxOVx1OEJFRlx1NTQwOFx1NUU3NlxuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc5ODFcdTc1MjhcdTg4NjhcdThGQkVcdTVGMEZcdTRGMThcdTUzMTZcdUZGMENcdTc4NkVcdTRGRERcdTVCNTdcdTdCMjZcdTRFMzJcdTU0OENcdTY1NzBcdTVCNTdcdTRFMERcdTRGMUFcdTg4QUJcdTk1MTlcdThCRUZcdThGREVcdTYzQTVcbiAgICAgICAgZXZhbHVhdGU6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTg4NjhcdThGQkVcdTVGMEZcdTZDNDJcdTUwM0NcdUZGMENcdTk2MzJcdTZCNjJcdTVCNTdcdTdCMjZcdTRFMzJcdTU0OENcdTY1NzBcdTVCNTdcdTg4QUJcdTk1MTlcdThCRUZcdTU5MDRcdTc0MDZcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3OTgxXHU3NTI4XHU3RUFGXHU1MUZEXHU2NTcwXHU0RjE4XHU1MzE2XHVGRjBDXHU5NjMyXHU2QjYyXHU1QkY5XHU4QzYxXHU1QjU3XHU5NzYyXHU5MUNGXHU4OEFCXHU5NTE5XHU4QkVGXHU1OTA0XHU3NDA2XG4gICAgICAgIHB1cmVfZnVuY3M6IFtdLCAvLyBcdTRFMERcdTVDMDZcdTRFRkJcdTRGNTVcdTUxRkRcdTY1NzBcdTg5QzZcdTRFM0FcdTdFQUZcdTUxRkRcdTY1NzBcdUZGMENcdTk2MzJcdTZCNjJcdTVCRjlcdThDNjFcdTVCNTdcdTk3NjJcdTkxQ0ZcdTg4QUJcdTk1MTlcdThCRUZcdTRGMThcdTUzMTZcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3OTgxXHU3NTI4XHU1MjZGXHU0RjVDXHU3NTI4XHU0RjE4XHU1MzE2XHVGRjBDXHU3ODZFXHU0RkREXHU1QkY5XHU4QzYxXHU1QjU3XHU5NzYyXHU5MUNGXHU2ODNDXHU1RjBGXHU2QjYzXHU3ODZFXG4gICAgICAgIHNpZGVfZWZmZWN0czogZmFsc2UsIC8vIFx1NEUwRFx1Nzk4MVx1NzUyOFx1NTI2Rlx1NEY1Q1x1NzUyOFx1RkYwQ1x1Nzg2RVx1NEZERFx1NUJGOVx1OEM2MVx1NUI1N1x1OTc2Mlx1OTFDRlx1NjgzQ1x1NUYwRlx1NkI2M1x1Nzg2RVxuICAgICAgfSxcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZERFx1NzU1OVx1NTFGRFx1NjU3MFx1NTQwRFx1NTQ4Q1x1N0M3Qlx1NTQwRFx1RkYwQ1x1NEY0Nlx1Nzk4MVx1NzUyOFx1NTNEOFx1OTFDRlx1NTQwRFx1NkRGN1x1NkRDNlxuICAgICAgLy8gXHU4RkQ5XHU2ODM3XHU1M0VGXHU0RUU1XHU5NjMyXHU2QjYyXHU1QkZDXHU1MUZBXHU1NDBEXHU3OUYwXHU4OEFCXHU2REY3XHU2REM2XHVGRjBDXHU1NDBDXHU2NUY2XHU1MTQxXHU4QkI4XHU1N0ZBXHU2NzJDXHU3Njg0XHU1MzhCXHU3RjI5XHU0RjE4XHU1MzE2XG4gICAgICBtYW5nbGU6IHtcbiAgICAgICAga2VlcF9mbmFtZXM6IHRydWUsXG4gICAgICAgIGtlZXBfY2xhc3NuYW1lczogdHJ1ZSxcbiAgICAgIH0sXG5cbiAgICAgIGZvcm1hdDoge1xuICAgICAgICBjb21tZW50czogZmFsc2UsXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzg2RVx1NEZERFx1NEVFM1x1NzgwMVx1NjgzQ1x1NUYwRlx1NkI2M1x1Nzg2RVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NjU3MFx1NUI1N1x1NUI1N1x1OTc2Mlx1OTFDRlx1ODhBQlx1OTUxOVx1OEJFRlx1NTkwNFx1NzQwNlxuICAgICAgICBwcmVzZXJ2ZV9hbm5vdGF0aW9uczogZmFsc2UsXG4gICAgICAgIC8vIFx1Nzg2RVx1NEZERFx1NjU3MFx1NUI1N1x1NUI1N1x1OTc2Mlx1OTFDRlx1NjgzQ1x1NUYwRlx1NkI2M1x1Nzg2RVxuICAgICAgICBhc2NpaV9vbmx5OiBmYWxzZSwgLy8gXHU1MTQxXHU4QkI4XHU5NzVFIEFTQ0lJIFx1NUI1N1x1N0IyNlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NjU3MFx1NUI1N1x1ODhBQlx1OTUxOVx1OEJFRlx1N0YxNlx1NzgwMVxuICAgICAgICBiZWF1dGlmeTogZmFsc2UsIC8vIFx1NEUwRFx1N0Y4RVx1NTMxNlx1NEVFM1x1NzgwMVx1RkYwQ1x1NEZERFx1NjMwMVx1NTM4Qlx1N0YyOVx1NTQwRVx1NzY4NFx1NjgzQ1x1NUYwRlxuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc4NkVcdTRGRERcdTVCRjlcdThDNjFcdTVDNUVcdTYwMjdcdTRFNEJcdTk1RjRcdTY3MDlcdTZCNjNcdTc4NkVcdTc2ODRcdTUyMDZcdTk2OTRcdTdCMjZcbiAgICAgICAgc2VtaWNvbG9uczogdHJ1ZSwgLy8gXHU0RjdGXHU3NTI4XHU1MjA2XHU1M0Y3XHVGRjBDXHU3ODZFXHU0RkREXHU4QkVEXHU1M0U1XHU2QjYzXHU3ODZFXHU1MjA2XHU5Njk0XG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzg2RVx1NEZERFx1NUJGOVx1OEM2MVx1NUI1N1x1OTc2Mlx1OTFDRlx1NjgzQ1x1NUYwRlx1NkI2M1x1Nzg2RVxuICAgICAgICB3cmFwX2lpZmU6IGZhbHNlLCAvLyBcdTRFMERcdTUzMDVcdTg4QzVcdTdBQ0JcdTUzNzNcdTYyNjdcdTg4NENcdTUxRkRcdTY1NzBcbiAgICAgICAgd3JhcF9mdW5jX2FyZ3M6IGZhbHNlLCAvLyBcdTRFMERcdTUzMDVcdTg4QzVcdTUxRkRcdTY1NzBcdTUzQzJcdTY1NzBcbiAgICAgIH0sXG4gICAgfSwgKi9cbiAgICBhc3NldHNJbmxpbmVMaW1pdDogMTAgKiAxMDI0LFxuICAgIG91dERpcjogcHJvY2Vzcy5lbnYuQlVJTERfT1VUX0RJUiB8fCAnZGlzdCcsXG4gICAgYXNzZXRzRGlyOiAnYXNzZXRzJyxcbiAgICBlbXB0eU91dERpcjogZmFsc2UsXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBbWFpbi1hcHAgXHU0RjVDXHU0RTNBXHU0RTNCXHU1RTk0XHU3NTI4XHVGRjBDXHU0RTVGXHU5NzAwXHU4OTgxXHU2MjUzXHU1MzA1IHNpbmdsZS1zcGEgXHU1NDhDIHFpYW5rdW5cbiAgICAvLyBcdTRFMERcdTVDMDZcdTVCODNcdTRFRUNcdTY4MDdcdThCQjBcdTRFM0EgZXh0ZXJuYWxcdUZGMENcdTc4NkVcdTRGRERcdTVCODNcdTRFRUNcdTg4QUJcdTYyNTNcdTUzMDVcdTUyMzBcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTRFMkRcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRFM0JcdTVFOTRcdTc1MjhcdTRFNUZcdTk3MDBcdTg5ODFcdTYyNTNcdTUzMDUgQGJ0YyBcdTUzMDVcdUZGMENcdTkwN0ZcdTUxNERcdTZENEZcdTg5QzhcdTU2NjhcdTY1RTBcdTZDRDVcdTg5RTNcdTY3OTBcdThERUZcdTVGODRcdTUyMkJcdTU0MERcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRFM0JcdTVFOTRcdTc1MjhcdTRFNUZcdTk3MDBcdTg5ODFcdTYyNTNcdTUzMDUgQGNvbmZpZ3MgXHU1MzA1XHVGRjBDXHU5MDdGXHU1MTREXHU2RDRGXHU4OUM4XHU1NjY4XHU2NUUwXHU2Q0Q1XHU4OUUzXHU2NzkwXHU4REVGXHU1Rjg0XHU1MjJCXHU1NDBEXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgLi4uY3JlYXRlUm9sbHVwQ29uZmlnKGFwcE5hbWUsIHtcbiAgICAgICAgZXh0ZXJuYWxTaW5nbGVTcGE6IGZhbHNlLCAvLyBcdTRFM0JcdTVFOTRcdTc1MjhcdTk3MDBcdTg5ODFcdTYyNTNcdTUzMDUgc2luZ2xlLXNwYSBcdTU0OEMgcWlhbmt1blxuICAgICAgICBleHRlcm5hbEJ0Y1BhY2thZ2VzOiBmYWxzZSwgLy8gXHU0RTNCXHU1RTk0XHU3NTI4XHU5NzAwXHU4OTgxXHU2MjUzXHU1MzA1IEBidGMgXHU1MzA1XHVGRjBDXHU5MDdGXHU1MTREXHU2RDRGXHU4OUM4XHU1NjY4XHU2NUUwXHU2Q0Q1XHU4OUUzXHU2NzkwXHU4REVGXHU1Rjg0XHU1MjJCXHU1NDBEXG4gICAgICAgIGV4dGVybmFsQ29uZmlnc1BhY2thZ2VzOiBmYWxzZSwgLy8gXHU0RTNCXHU1RTk0XHU3NTI4XHU5NzAwXHU4OTgxXHU2MjUzXHU1MzA1IEBjb25maWdzIFx1NTMwNVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NjVFMFx1NkNENVx1ODlFM1x1Njc5MFx1OERFRlx1NUY4NFx1NTIyQlx1NTQwRFxuICAgICAgfSksXG4gICAgfSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gICAgLi4uY3VzdG9tQnVpbGQsXG4gIH07XG5cbiAgLy8gXHU2NzBEXHU1MkExXHU1NjY4XHU5MTREXHU3RjZFXG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEYxOFx1NTE0OFx1NEY3Rlx1NzUyOCBjdXN0b21TZXJ2ZXIucHJveHlcdUZGMENcdTU5ODJcdTY3OUNcdTRFMERcdTVCNThcdTU3MjhcdTUyMTlcdTRGN0ZcdTc1MjggcHJveHkgXHU1M0MyXHU2NTcwXG4gIC8vIFx1NkNFOFx1NjEwRlx1RkYxQWN1c3RvbVNlcnZlciBcdTRGMUFcdTU3MjhcdTY3MDBcdTU0MEVcdTVDNTVcdTVGMDBcdUZGMENcdTU5ODJcdTY3OUNcdTUzMDVcdTU0MkIgcHJveHkgXHU0RjFBXHU4OTg2XHU3NkQ2XHU4RkQ5XHU5MUNDXHU3Njg0XHU4QkJFXHU3RjZFXG4gIGNvbnN0IGZpbmFsUHJveHkgPSBjdXN0b21TZXJ2ZXI/LnByb3h5ICE9PSB1bmRlZmluZWQgPyBjdXN0b21TZXJ2ZXIucHJveHkgOiBwcm94eTtcbiAgY29uc3QgeyBwcm94eTogX2N1c3RvbVByb3h5LCAuLi5yZXN0Q3VzdG9tU2VydmVyIH0gPSBjdXN0b21TZXJ2ZXIgfHwge307XG4gIFxuICAvLyBcdTZERkJcdTUyQTBcdTc2RDFcdTYzQTdcdTY3MERcdTUyQTFcdTRFRTNcdTc0MDZcdUZGMENcdTkwN0ZcdTUxNERcdTc5QzFcdTY3MDlcdTdGNTFcdTdFRENcdThCRjdcdTZDNDJcdThCNjZcdTU0NEFcbiAgLy8gXHU1QzA2IC9fX21vbml0b3JfXyBcdTRFRTNcdTc0MDZcdTUyMzBcdTc2RDFcdTYzQTdcdTY3MERcdTUyQTFcdUZGMDhodHRwOi8vbG9jYWxob3N0OjMwMDFcdUZGMDlcbiAgY29uc3QgbW9uaXRvclByb3h5ID0ge1xuICAgICcvX19tb25pdG9yX18nOiB7XG4gICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDEnLFxuICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvX19tb25pdG9yX18vLCAnJyksXG4gICAgICB3czogdHJ1ZSwgLy8gXHU2NTJGXHU2MzAxIFdlYlNvY2tldFx1RkYwOFNTRSBcdTRGN0ZcdTc1MjhcdUZGMDlcbiAgICB9LFxuICB9O1xuICBcbiAgLy8gXHU1NDA4XHU1RTc2XHU0RUUzXHU3NDA2XHU5MTREXHU3RjZFXHVGRjFBXHU3NkQxXHU2M0E3XHU2NzBEXHU1MkExXHU0RUUzXHU3NDA2XHU0RjE4XHU1MTQ4XHVGRjBDXHU3MTM2XHU1NDBFXHU2NjJGXHU0RTFBXHU1MkExXHU0RUUzXHU3NDA2XG4gIGNvbnN0IG1lcmdlZFByb3h5ID0ge1xuICAgIC4uLm1vbml0b3JQcm94eSxcbiAgICAuLi5maW5hbFByb3h5LFxuICB9O1xuICBcbiAgY29uc3Qgc2VydmVyQ29uZmlnOiBVc2VyQ29uZmlnWydzZXJ2ZXInXSA9IHtcbiAgICBwb3J0OiBhcHBDb25maWcuZGV2UG9ydCxcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICBjb3JzOiB0cnVlLFxuICAgIG9yaWdpbjogYGh0dHA6Ly8ke2FwcENvbmZpZy5kZXZIb3N0fToke2FwcENvbmZpZy5kZXZQb3J0fWAsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCcsXG4gICAgfSxcbiAgICBobXI6IHtcbiAgICAgIGhvc3Q6IGFwcENvbmZpZy5kZXZIb3N0LFxuICAgICAgcG9ydDogYXBwQ29uZmlnLmRldlBvcnQsXG4gICAgICBvdmVybGF5OiBmYWxzZSxcbiAgICB9LFxuICAgIHByb3h5OiBtZXJnZWRQcm94eSxcbiAgICBmczoge1xuICAgICAgc3RyaWN0OiBmYWxzZSxcbiAgICAgIGFsbG93OiBbXG4gICAgICAgIHdpdGhSb290KCcuJyksXG4gICAgICBdLFxuICAgICAgY2FjaGVkQ2hlY2tzOiB0cnVlLFxuICAgIH0sXG4gICAgLy8gXHU3OTgxXHU3NTI4IHBhZ2UgcmVsb2FkIFx1NjVFNVx1NUZEN1x1OEY5M1x1NTFGQVxuICAgIHdhdGNoOiB7XG4gICAgICBpZ25vcmVkOiBbJyoqL2xvY2FsZXMvKiovKi5qc29uJ10sXG4gICAgfSxcbiAgICAuLi5yZXN0Q3VzdG9tU2VydmVyLFxuICB9O1xuXG4gIC8vIFx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1OTE0RFx1N0Y2RVxuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTk4ODRcdTg5QzhcdTY3MERcdTUyQTFcdTU2NjhcdTRFQ0VcdTY4MzlcdTc2RUVcdTVGNTVcdTc2ODQgZGlzdC97cHJvZEhvc3R9IFx1OEJGQlx1NTNENlx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1RkYwQ1x1ODAwQ1x1NEUwRFx1NjYyRlx1NEVDRSBhcHBzL3thcHBOYW1lfS9kaXN0IFx1OEJGQlx1NTNENlxuICBjb25zdCByb290RGlzdERpciA9IHJlc29sdmUoYXBwRGlyLCAnLi4vLi4vZGlzdCcpO1xuICBjb25zdCBwcmV2aWV3Um9vdCA9IHJlc29sdmUocm9vdERpc3REaXIsIGFwcENvbmZpZy5wcm9kSG9zdCk7XG4gIFxuICBjb25zdCBwcmV2aWV3Q29uZmlnOiBVc2VyQ29uZmlnWydwcmV2aWV3J10gPSB7XG4gICAgcG9ydDogYXBwQ29uZmlnLnByZVBvcnQsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICBvcGVuOiBmYWxzZSxcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU4QkJFXHU3RjZFXHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHU3Njg0XHU2ODM5XHU3NkVFXHU1RjU1XHU0RTNBIGRpc3Qve3Byb2RIb3N0fVxuICAgIHJvb3Q6IHByZXZpZXdSb290LFxuICAgIHByb3h5LFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsT1BUSU9OUycsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnOiAndHJ1ZScsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUnLFxuICAgIH0sXG4gICAgLi4uY3VzdG9tUHJldmlldyxcbiAgfTtcblxuICAvLyBcdTRGMThcdTUzMTZcdTRGOURcdThENTZcdTkxNERcdTdGNkVcbiAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU5ODg0XHU1MTQ4XHU1MzA1XHU1NDJCXHU2MjQwXHU2NzA5XHU1QjUwXHU1RTk0XHU3NTI4XHU1M0VGXHU4MEZEXHU3NTI4XHU1MjMwXHU3Njg0XHU0RjlEXHU4RDU2XHVGRjBDXHU5MDdGXHU1MTREXHU1MjA3XHU2MzYyXHU1RTk0XHU3NTI4XHU2NUY2XHU4OUU2XHU1M0QxXHU5MUNEXHU2NUIwXHU1MkEwXHU4RjdEXG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NkJDRlx1NEUyQVx1NUU5NFx1NzUyOFx1NEY3Rlx1NzUyOFx1NzJFQ1x1N0FDQlx1NzY4NFx1N0YxM1x1NUI1OFx1NzZFRVx1NUY1NVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NEUwRFx1NTQwQ1x1NUU5NFx1NzUyOFx1NzY4NFx1OTE0RFx1N0Y2RVx1NURFRVx1NUYwMlx1NUJGQ1x1ODFGNFx1N0YxM1x1NUI1OFx1NTFCMlx1N0E4MVxuICBjb25zdCBhcHBDYWNoZURpciA9IHJlc29sdmUoYXBwRGlyLCAnbm9kZV9tb2R1bGVzLy52aXRlJyk7XG5cbiAgY29uc3Qgb3B0aW1pemVEZXBzQ29uZmlnOiBVc2VyQ29uZmlnWydvcHRpbWl6ZURlcHMnXSA9IHtcbiAgICBpbmNsdWRlOiBbXG4gICAgICAvLyBcdTY4MzhcdTVGQzNcdTRGOURcdThENTZcdUZGMUFcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTVCODlcdTg4QzVcdTc2ODRcdTRGOURcdThENTZcbiAgICAgICd2dWUnLFxuICAgICAgJ3Z1ZS1yb3V0ZXInLFxuICAgICAgJ3BpbmlhJyxcbiAgICAgICdlbGVtZW50LXBsdXMnLFxuICAgICAgLy8gV2luc3RvbiBcdTk3MDBcdTg5ODFcdTc2ODQgTm9kZS5qcyBcdTZBMjFcdTU3NTcgcG9seWZpbGxcbiAgICAgICd1dGlsJyxcbiAgICAgICdlbGVtZW50LXBsdXMvZXMnLFxuICAgICAgJ2VsZW1lbnQtcGx1cy9lcy9sb2NhbGUvbGFuZy96aC1jbicsXG4gICAgICAnZWxlbWVudC1wbHVzL2VzL2xvY2FsZS9sYW5nL2VuJyxcbiAgICAgICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9jYXNjYWRlci9zdHlsZS9jc3MnLFxuICAgICAgJ0BlbGVtZW50LXBsdXMvaWNvbnMtdnVlJyxcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlJyxcbiAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQUBidGMvc2hhcmVkLWNvbXBvbmVudHMgXHU1REYyXHU0RUNFIGluY2x1ZGUgXHU0RTJEXHU3OUZCXHU5NjY0XHVGRjBDXHU1NkUwXHU0RTNBXHU1QjgzXHU1MzA1XHU1NDJCIFRTWCBcdTY1ODdcdTRFRjZcbiAgICAgIC8vIFx1NTcyOFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NEUyRFx1RkYwQ1x1NUU5NFx1OEJFNVx1NzZGNFx1NjNBNVx1NEVDRVx1NkU5MFx1NzgwMVx1NUJGQ1x1NTE2NVx1RkYwQ1x1ODAwQ1x1NEUwRFx1NjYyRlx1OTg4NFx1Njc4NFx1NUVGQVxuICAgICAgLy8gJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnLFxuICAgICAgJ0BidGMvc2hhcmVkLXV0aWxzJyxcbiAgICAgICd2aXRlLXBsdWdpbi1xaWFua3VuL2Rpc3QvaGVscGVyJyxcbiAgICAgICdxaWFua3VuJyxcbiAgICAgICdAdnVldXNlL2NvcmUnLFxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU4RkQ5XHU0RTlCXHU0RjlEXHU4RDU2XHU3M0IwXHU1NzI4XHU1REYyXHU3RUNGXHU1NzI4XHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU3Njg0IHBhY2thZ2UuanNvbiBcdTRFMkRcdTU4RjBcdTY2MEVcbiAgICAgIC8vIFx1OTAxQVx1OEZDNyBAYnRjL3NoYXJlZC1jb21wb25lbnRzIFx1OTVGNFx1NjNBNVx1NEY3Rlx1NzUyOFx1RkYwQ1x1NEY0Nlx1OTcwMFx1ODk4MVx1NTcyOFx1NUU5NFx1NzUyOFx1NEUyRFx1NjYzRVx1NUYwRlx1NThGMFx1NjYwRVx1NEVFNVx1NEZCRiBWaXRlIFx1NkI2M1x1Nzg2RVx1ODlFM1x1Njc5MFxuICAgICAgJ2xvZGFzaC1lcycsXG4gICAgICAnY2hhcmRldCcsXG4gICAgICAneGxzeCcsXG4gICAgICAndnVlLWkxOG4nLFxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBZWNoYXJ0cyBcdTc2RjhcdTUxNzNcdTRGOURcdThENTZcdTk3MDBcdTg5ODFcdTg4QUJcdTk4ODRcdTY3ODRcdTVFRkFcbiAgICAgIC8vIHN5c3RlbS1hcHAgXHU1NDhDXHU5MEU4XHU1MjA2XHU1QjUwXHU1RTk0XHU3NTI4XHU0RjdGXHU3NTI4XHU0RTg2IGVjaGFydHNcbiAgICAgICdlY2hhcnRzL2NvcmUnLFxuICAgICAgJ2VjaGFydHMnLFxuICAgICAgJ3Z1ZS1lY2hhcnRzJyxcbiAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQWx1bnIgXHU1NDhDIGZpbGUtc2F2ZXIgXHU0RTBEXHU2NjJGXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU1Qjg5XHU4OEM1XHVGRjBDXHU0RTBEXHU1RTk0XHU4QkU1XHU1NzI4IGluY2x1ZGUgXHU0RTJEXHU1RjNBXHU1MjM2XHU1OEYwXHU2NjBFXG4gICAgICAvLyBcdTU5ODJcdTY3OUNcdTVFOTRcdTc1MjhcdTVCODlcdTg4QzVcdTRFODZcdThGRDlcdTRFOUJcdTRGOURcdThENTZcdUZGMENWaXRlIFx1NEYxQVx1NTcyOFx1NjI2Qlx1NjNDRiBlbnRyaWVzIFx1NjVGNlx1ODFFQVx1NTJBOFx1NTNEMVx1NzNCMFx1NUU3Nlx1NEYxOFx1NTMxNlxuICAgICAgLy8gJ2x1bnInLCAvLyBcdTUzRUFcdTU3Mjggc2hhcmVkLWNvbXBvbmVudHMgXHU0RTJEXHU0RjdGXHU3NTI4XHVGRjBDXHU0RTBEXHU2NjJGXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU1Qjg5XHU4OEM1XG4gICAgICAvLyAnZmlsZS1zYXZlcicsIC8vIFx1NTNFQVx1NTcyOFx1OTBFOFx1NTIwNlx1NUU5NFx1NzUyOFx1NEUyRFx1NEY3Rlx1NzUyOFx1RkYwQ1x1NEUwRFx1NjYyRlx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NUI4OVx1ODhDNVxuICAgIF0sXG4gICAgZXhjbHVkZTogW1xuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBQGJ0Yy9zaGFyZWQtY29yZS9jb25maWdzL2xheW91dC1icmlkZ2UgXHU2NjJGXHU2NzJDXHU1NzMwXHU1MjJCXHU1NDBEXHU4REVGXHU1Rjg0XHVGRjBDXHU0RTBEXHU2NjJGIG5wbSBcdTUzMDVcdUZGMENcdTRFMERcdTVFOTRcdThCRTVcdTg4QUJcdTRGMThcdTUzMTZcbiAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQWV4Y2x1ZGUgXHU1M0VBXHU2NTJGXHU2MzAxXHU1QjU3XHU3QjI2XHU0RTMyXHU2QTIxXHU1RjBGXHVGRjBDXHU0RTBEXHU2NTJGXHU2MzAxXHU2QjYzXHU1MjE5XHU4ODY4XHU4RkJFXHU1RjBGXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29yZS9jb25maWdzL2xheW91dC1icmlkZ2UnLFxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU2MzkyXHU5NjY0IEBidGMvc2hhcmVkLWNvbXBvbmVudHNcdUZGMENcdTU2RTBcdTRFM0FcdTVCODNcdTY2MkZcdTY3MkNcdTU3MzBcdTUzMDVcdUZGMENcdTUzMDVcdTU0MkIgVFNYIFx1NjU4N1x1NEVGNlxuICAgICAgLy8gXHU1NzI4XHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU0RTJEXHVGRjBDXHU1RTk0XHU4QkU1XHU3NkY0XHU2M0E1XHU0RUNFXHU2RTkwXHU3ODAxXHU1QkZDXHU1MTY1XHVGRjBDXHU4MDBDXHU0RTBEXHU2NjJGXHU5ODg0XHU2Nzg0XHU1RUZBXG4gICAgICAvLyBcdThGRDlcdTY4MzdcdTUzRUZcdTRFRTVcdTkwN0ZcdTUxNEQgSlNYIFx1ODlFM1x1Njc5MFx1OTVFRVx1OTg5OFxuICAgICAgJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnLFxuICAgIF0sXG4gICAgZm9yY2U6IGZhbHNlLFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NjMwN1x1NUI5QVx1OTcwMFx1ODk4MVx1NjI2Qlx1NjNDRlx1NzY4NFx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlx1RkYwQ1x1Nzg2RVx1NEZERFx1NjI2Qlx1NjNDRlx1NTIzMCBAYnRjL3NoYXJlZC1jb21wb25lbnRzIFx1NTE4NVx1OTBFOFx1NzY4NFx1NEY5RFx1OEQ1NlxuICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NEUwRFx1NTE4RFx1NTMwNVx1NTQyQiBzaGFyZWQtY29tcG9uZW50cy9zcmMvaW5kZXgudHNcdUZGMENcdTU2RTBcdTRFM0FcdTVCODNcdTUzMDVcdTU0MkIgVFNYIFx1NjU4N1x1NEVGNlx1RkYwQ1x1NUU5NFx1OEJFNVx1NTcyOFx1OEZEMFx1ODg0Q1x1NjVGNlx1NzZGNFx1NjNBNVx1NTkwNFx1NzQwNlxuICAgIGVudHJpZXM6IFtcbiAgICAgIHJlc29sdmUoYXBwRGlyLCAnc3JjL21haW4udHMnKSxcbiAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NEUwRFx1NTE4RFx1NzZGNFx1NjNBNVx1NUYxNVx1NzUyOCBzaGFyZWQtY29yZS9zcmMvaW5kZXgudHNcdUZGMENcdTkwN0ZcdTUxNERcdTU3MjhcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdTg5RTNcdTY3OTAgQGNvbmZpZ3MvbGF5b3V0LWJyaWRnZVxuICAgICAgLy8gc2hhcmVkLWNvcmUgXHU3Njg0XHU0RjlEXHU4RDU2XHU0RjFBXHU1NzI4XHU4RkQwXHU4ODRDXHU2NUY2XHU5MDFBXHU4RkM3XHU1RTk0XHU3NTI4XHU3Njg0XHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XHU4MUVBXHU1MkE4XHU1M0QxXHU3M0IwXHU1NDhDXHU0RjE4XHU1MzE2XG4gICAgXSxcbiAgICBlc2J1aWxkT3B0aW9uczoge1xuICAgICAgcGx1Z2luczogW10sXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc4NkVcdTRGRERcdTRGOURcdThENTZcdTk4ODRcdTY3ODRcdTVFRkFcdTY1RjZcdTRFNUZcdTRGN0ZcdTc1MjggVnVlIFx1NzY4NCBKU1ggXHU4RjZDXHU2MzYyXHU2NUI5XHU1RjBGXG4gICAgICBqc3g6ICdwcmVzZXJ2ZScsIC8vIFx1NEZERFx1NzU1OSBKU1hcdUZGMENcdThCQTkgdnVlSnN4IFx1NjNEMlx1NEVGNlx1NTkwNFx1NzQwNlxuICAgICAganN4RmFjdG9yeTogJ2gnLCAvLyBcdTRGN0ZcdTc1MjggVnVlIFx1NzY4NCBoIFx1NTFGRFx1NjU3MFx1NEY1Q1x1NEUzQSBKU1ggXHU1REU1XHU1MzgyXHU1MUZEXHU2NTcwXG4gICAgICBqc3hGcmFnbWVudDogJ0ZyYWdtZW50JywgLy8gXHU0RjdGXHU3NTI4IFZ1ZSBcdTc2ODQgRnJhZ21lbnRcbiAgICB9LFxuICAgIC4uLmN1c3RvbU9wdGltaXplRGVwcyxcbiAgfTtcblxuICAvLyBDU1MgXHU5MTREXHU3RjZFXG4gIGNvbnN0IGNzc0NvbmZpZzogVXNlckNvbmZpZ1snY3NzJ10gPSB7XG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgc2Nzczoge1xuICAgICAgICBhcGk6ICdtb2Rlcm4tY29tcGlsZXInLFxuICAgICAgICBzaWxlbmNlRGVwcmVjYXRpb25zOiBbJ2xlZ2FjeS1qcy1hcGknLCAnaW1wb3J0J10sXG4gICAgICB9LFxuICAgIH0sXG4gICAgZGV2U291cmNlbWFwOiBmYWxzZSxcbiAgICAuLi5jdXN0b21Dc3MsXG4gIH07XG5cbiAgLy8gXHU4RkQ0XHU1NkRFXHU1QjhDXHU2NTc0XHU5MTREXHU3RjZFXG4gIC8vIFx1NkNFOFx1NjEwRlx1RkYxQXB1YmxpY0RpciBcdTc2ODRcdTkxNERcdTdGNkVcdTk3MDBcdTg5ODFcdTU3Mjggdml0ZS5jb25maWcudHMgXHU0RTJEXHU2ODM5XHU2MzZFIGNvbW1hbmQgXHU1MkE4XHU2MDAxXHU4QkJFXHU3RjZFXG4gIC8vIFx1OEZEOVx1OTFDQ1x1NTlDQlx1N0VDOFx1NTQyRlx1NzUyOCBwdWJsaWNEaXJcdUZGMENcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTc2RjRcdTYzQTVcdTRGN0ZcdTc1MjhcdUZGMENcdTY3ODRcdTVFRkFcdTczQUZcdTU4ODNcdTRGMUFcdTU3Mjggdml0ZS5jb25maWcudHMgXHU0RTJEXHU4OEFCXHU4OTg2XHU3NkQ2XG4gIGNvbnN0IGZpbmFsUHVibGljRGlyID0gcHVibGljRGlyO1xuXG4gIGNvbnN0IGNvbmZpZzogYW55ID0ge1xuICAgIGJhc2U6IGJhc2VVcmwsXG4gICAgcHVibGljRGlyOiBmaW5hbFB1YmxpY0RpcixcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTZCQ0ZcdTRFMkFcdTVFOTRcdTc1MjhcdTRGN0ZcdTc1MjhcdTcyRUNcdTdBQ0JcdTc2ODRcdTdGMTNcdTVCNThcdTc2RUVcdTVGNTVcdUZGMENcdTkwN0ZcdTUxNERcdTRFMERcdTU0MENcdTVFOTRcdTc1MjhcdTc2ODRcdTkxNERcdTdGNkVcdTVERUVcdTVGMDJcdTVCRkNcdTgxRjRcdTdGMTNcdTVCNThcdTUxQjJcdTdBODFcbiAgICBjYWNoZURpcjogYXBwQ2FjaGVEaXIsXG4gICAgZGVmaW5lOiB7XG4gICAgICAvLyBcdTRFM0FcdTZENEZcdTg5QzhcdTU2NjhcdTczQUZcdTU4ODNcdTYzRDBcdTRGOUIgcHJvY2VzcyBcdTVCRjlcdThDNjFcdUZGMENXaW5zdG9uIFx1OTcwMFx1ODk4MVx1NUI4M1xuICAgICAgJ3Byb2Nlc3MuZW52JzogJ3t9JyxcbiAgICAgICdwcm9jZXNzLnBsYXRmb3JtJzogSlNPTi5zdHJpbmdpZnkoJ2Jyb3dzZXInKSxcbiAgICAgICdwcm9jZXNzLnZlcnNpb24nOiBKU09OLnN0cmluZ2lmeSgnJyksXG4gICAgfSxcbiAgICBwbHVnaW5zLFxuICAgIGVzYnVpbGQ6IHtcbiAgICAgIGNoYXJzZXQ6ICd1dGY4JyxcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzg2RVx1NEZERCBlc2J1aWxkIFx1NkI2M1x1Nzg2RVx1NTkwNFx1NzQwNiBKU1hcdUZGMENcdTRGN0ZcdTc1MjggVnVlIFx1NzY4NCBoIFx1NTFGRFx1NjU3MFx1ODAwQ1x1NEUwRFx1NjYyRiBSZWFjdC5jcmVhdGVFbGVtZW50XG4gICAgICAvLyBcdThGRDlcdTY4MzdcdTUzNzNcdTRGN0YgZXNidWlsZCBcdTU5MDRcdTc0MDZcdTY3RDBcdTRFOUIgSlNYIFx1NjU4N1x1NEVGNlx1RkYwQ1x1NEU1Rlx1NEYxQVx1NEY3Rlx1NzUyOFx1NkI2M1x1Nzg2RVx1NzY4NFx1OEY2Q1x1NjM2Mlx1NjVCOVx1NUYwRlxuICAgICAganN4OiAncHJlc2VydmUnLCAvLyBcdTRGRERcdTc1NTkgSlNYXHVGRjBDXHU4QkE5IHZ1ZUpzeCBcdTYzRDJcdTRFRjZcdTU5MDRcdTc0MDZcbiAgICAgIGpzeEZhY3Rvcnk6ICdoJywgLy8gXHU0RjdGXHU3NTI4IFZ1ZSBcdTc2ODQgaCBcdTUxRkRcdTY1NzBcdTRGNUNcdTRFM0EgSlNYIFx1NURFNVx1NTM4Mlx1NTFGRFx1NjU3MFxuICAgICAganN4RnJhZ21lbnQ6ICdGcmFnbWVudCcsIC8vIFx1NEY3Rlx1NzUyOCBWdWUgXHU3Njg0IEZyYWdtZW50XG4gICAgfSxcbiAgICBzZXJ2ZXI6IHNlcnZlckNvbmZpZyxcbiAgICBwcmV2aWV3OiBwcmV2aWV3Q29uZmlnLFxuICAgIG9wdGltaXplRGVwczogb3B0aW1pemVEZXBzQ29uZmlnLFxuICAgIGNzczogY3NzQ29uZmlnLFxuICAgIGJ1aWxkOiBidWlsZENvbmZpZyxcbiAgICAvLyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTY1RTVcdTVGRDdcdTkxNERcdTdGNkVcdUZGMUFcdTUxQ0ZcdTVDMTFcdTUxOTdcdTRGNTlcdThGOTNcdTUxRkFcbiAgICBjbGVhclNjcmVlbjogZmFsc2UsIC8vIFx1NEUwRFx1NkUwNVx1NzQwNlx1NUM0Rlx1NUU1NVx1RkYwQ1x1NEZERFx1NzU1OVx1NEU0Qlx1NTI0RFx1NzY4NFx1OEY5M1x1NTFGQVxuICAgIGxvZ0xldmVsOiBwcm9jZXNzLmVudi5WSVRFX0xPR19MRVZFTCB8fCAnd2FybicsIC8vIFx1NTNFQVx1NjYzRVx1NzkzQVx1OEI2Nlx1NTQ0QVx1NTQ4Q1x1OTUxOVx1OEJFRlx1RkYwQ1x1OTY5MFx1ODVDRiBpbmZvIFx1NTQ4QyBkZWJ1Z1xuICB9O1xuXG4gIC8vIFx1NjYwRVx1Nzg2RVx1NTkwNFx1NzQwNlx1NTNFRlx1OTAwOVx1NUM1RVx1NjAyN1x1NzY4NCB1bmRlZmluZWRcdUZGMDhleGFjdE9wdGlvbmFsUHJvcGVydHlUeXBlc1x1RkYwOVxuICAvLyBcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTRGN0ZcdTc1MjhcdTUyMkJcdTU0MERcdTYzMDdcdTU0MTFcdTZFOTBcdTc4MDFcdUZGMDhcdTU2RTBcdTRFM0FcdTkwRkRcdTYyNTNcdTUzMDUgQGJ0Yy8qIFx1NTMwNVx1RkYwOVxuICBjb25zdCByZXNvbHZlVmFsdWUgPSBjcmVhdGVCYXNlUmVzb2x2ZShhcHBEaXIsIGFwcE5hbWUpO1xuICBpZiAocmVzb2x2ZVZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICBjb25maWcucmVzb2x2ZSA9IHJlc29sdmVWYWx1ZTtcbiAgfVxuXG4gIHJldHVybiBjb25maWc7XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcdXRpbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHV0aWxzXFxcXHBhdGgtaGVscGVycy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvdXRpbHMvcGF0aC1oZWxwZXJzLnRzXCI7LyoqXG4gKiBcdThERUZcdTVGODRcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcbiAqIFx1NjNEMFx1NEY5Qlx1N0VERlx1NEUwMFx1NzY4NFx1OERFRlx1NUY4NFx1ODlFM1x1Njc5MFx1NTFGRFx1NjU3MFx1RkYwQ1x1NzUyOFx1NEU4RSBWaXRlIFx1OTE0RFx1N0Y2RVx1NEUyRFx1NzY4NFx1NTIyQlx1NTQwRFx1NTQ4Q1x1OERFRlx1NUY4NFx1ODlFM1x1Njc5MFxuICovXG5cbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcblxuLyoqXG4gKiBcdTUyMUJcdTVFRkFcdThERUZcdTVGODRcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcbiAqIEBwYXJhbSBhcHBEaXIgXHU1RTk0XHU3NTI4XHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XG4gKiBAcmV0dXJucyBcdThERUZcdTVGODRcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcdTVCRjlcdThDNjFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBhdGhIZWxwZXJzKGFwcERpcjogc3RyaW5nKSB7XG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTBcdTVFOTRcdTc1Mjggc3JjIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFxuICAgKi9cbiAgY29uc3Qgd2l0aFNyYyA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZykgPT4gcmVzb2x2ZShhcHBEaXIsIHJlbGF0aXZlUGF0aCk7XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MCBwYWNrYWdlcyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcbiAgICovXG4gIGNvbnN0IHdpdGhQYWNrYWdlcyA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZykgPT4gXG4gICAgcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9wYWNrYWdlcycsIHJlbGF0aXZlUGF0aCk7XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MFx1OTg3OVx1NzZFRVx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFxuICAgKi9cbiAgY29uc3Qgd2l0aFJvb3QgPSAocmVsYXRpdmVQYXRoOiBzdHJpbmcpID0+IFxuICAgIHJlc29sdmUoYXBwRGlyLCAnLi4vLi4nLCByZWxhdGl2ZVBhdGgpO1xuXG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTAgY29uZmlncyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcbiAgICovXG4gIGNvbnN0IHdpdGhDb25maWdzID0gKHJlbGF0aXZlUGF0aDogc3RyaW5nKSA9PiBcbiAgICByZXNvbHZlKGFwcERpciwgJy4uLy4uL2NvbmZpZ3MnLCByZWxhdGl2ZVBhdGgpO1xuXG4gIHJldHVybiB7IHdpdGhTcmMsIHdpdGhQYWNrYWdlcywgd2l0aFJvb3QsIHdpdGhDb25maWdzIH07XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcYXV0by1pbXBvcnQuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3MvYXV0by1pbXBvcnQuY29uZmlnLnRzXCI7XHVGRUZGLyoqXG4gKiBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTkxNERcdTdGNkVcdTZBMjFcdTY3N0ZcbiAqIFx1NEY5Qlx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1RkYwOGFkbWluLWFwcCwgbG9naXN0aWNzLWFwcCBcdTdCNDlcdUZGMDlcdTRGN0ZcdTc1MjhcbiAqL1xuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSc7XG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJztcbmltcG9ydCB7IEVsZW1lbnRQbHVzUmVzb2x2ZXIgfSBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnMnO1xuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBBdXRvIEltcG9ydCBcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUF1dG9JbXBvcnRDb25maWcoKSB7XG4gIHJldHVybiBBdXRvSW1wb3J0KHtcbiAgICBpbXBvcnRzOiBbXG4gICAgICAndnVlJyxcbiAgICAgICd2dWUtcm91dGVyJyxcbiAgICAgICdwaW5pYScsXG4gICAgICB7XG4gICAgICAgICdAYnRjL3NoYXJlZC1jb3JlJzogW1xuICAgICAgICAgICd1c2VDcnVkJyxcbiAgICAgICAgICAndXNlRGljdCcsXG4gICAgICAgICAgJ3VzZVBlcm1pc3Npb24nLFxuICAgICAgICAgICd1c2VSZXF1ZXN0JyxcbiAgICAgICAgICAnY3JlYXRlSTE4blBsdWdpbicsXG4gICAgICAgICAgJ3VzZUkxOG4nLFxuICAgICAgICBdLFxuICAgICAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnOiBbXG4gICAgICAgICAgJ2Zvcm1hdERhdGUnLFxuICAgICAgICAgICdmb3JtYXREYXRlVGltZScsXG4gICAgICAgICAgJ2Zvcm1hdE1vbmV5JyxcbiAgICAgICAgICAnZm9ybWF0TnVtYmVyJyxcbiAgICAgICAgICAnaXNFbWFpbCcsXG4gICAgICAgICAgJ2lzUGhvbmUnLFxuICAgICAgICAgICdzdG9yYWdlJyxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgXSxcblxuICAgIHJlc29sdmVyczogW1xuICAgICAgRWxlbWVudFBsdXNSZXNvbHZlcih7XG4gICAgICAgIGltcG9ydFN0eWxlOiBmYWxzZSwgLy8gXHU3OTgxXHU3NTI4XHU2MzA5XHU5NzAwXHU2ODM3XHU1RjBGXHU1QkZDXHU1MTY1XG4gICAgICB9KSxcbiAgICBdLFxuXG4gICAgZHRzOiAnc3JjL2F1dG8taW1wb3J0cy5kLnRzJyxcblxuICAgIGVzbGludHJjOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZmlsZXBhdGg6ICcuLy5lc2xpbnRyYy1hdXRvLWltcG9ydC5qc29uJyxcbiAgICB9LFxuXG4gICAgdnVlVGVtcGxhdGU6IHRydWUsXG4gIH0pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudHNDb25maWdPcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1OTg5RFx1NTkxNlx1NzY4NFx1N0VDNFx1NEVGNlx1NzZFRVx1NUY1NVx1RkYwOFx1NzUyOFx1NEU4RVx1NTdERlx1N0VBN1x1N0VDNFx1NEVGNlx1RkYwOVxuICAgKi9cbiAgZXh0cmFEaXJzPzogc3RyaW5nW107XG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdTVCRkNcdTUxNjVcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdTVFOTNcbiAgICovXG4gIGluY2x1ZGVTaGFyZWQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBDb21wb25lbnRzIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1OTE0RFx1N0Y2RVxuICogQHBhcmFtIG9wdGlvbnMgXHU5MTREXHU3RjZFXHU5MDA5XHU5ODc5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRzQ29uZmlnKG9wdGlvbnM6IENvbXBvbmVudHNDb25maWdPcHRpb25zID0ge30pIHtcbiAgY29uc3QgeyBleHRyYURpcnMgPSBbXSwgaW5jbHVkZVNoYXJlZCA9IHRydWUgfSA9IG9wdGlvbnM7XG5cbiAgY29uc3QgZGlycyA9IFtcbiAgICAnc3JjL2NvbXBvbmVudHMnLCAvLyBcdTVFOTRcdTc1MjhcdTdFQTdcdTdFQzRcdTRFRjZcbiAgICAuLi5leHRyYURpcnMsIC8vIFx1OTg5RFx1NTkxNlx1NzY4NFx1NTdERlx1N0VBN1x1N0VDNFx1NEVGNlx1NzZFRVx1NUY1NVxuICBdO1xuXG4gIC8vIFx1NTk4Mlx1Njc5Q1x1NTMwNVx1NTQyQlx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1RkYwQ1x1NkRGQlx1NTJBMFx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NTIwNlx1N0VDNFx1NzZFRVx1NUY1NVxuICBpZiAoaW5jbHVkZVNoYXJlZCkge1xuICAgIC8vIFx1NkRGQlx1NTJBMFx1NTIwNlx1N0VDNFx1NzZFRVx1NUY1NVx1RkYwQ1x1NjUyRlx1NjMwMVx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVxuICAgIGRpcnMucHVzaChcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9iYXNpYycsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvbGF5b3V0JyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9uYXZpZ2F0aW9uJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9mb3JtJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9kYXRhJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9mZWVkYmFjaycsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvb3RoZXJzJ1xuICAgICk7XG4gIH1cblxuICByZXR1cm4gQ29tcG9uZW50cyh7XG4gICAgcmVzb2x2ZXJzOiBbXG4gICAgICBFbGVtZW50UGx1c1Jlc29sdmVyKHtcbiAgICAgICAgaW1wb3J0U3R5bGU6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTYzMDlcdTk3MDBcdTY4MzdcdTVGMEZcdTVCRkNcdTUxNjVcdUZGMENcdTkwN0ZcdTUxNEQgVml0ZSByZWxvYWRpbmdcbiAgICAgIH0pLFxuICAgICAgLy8gXHU4MUVBXHU1QjlBXHU0RTQ5XHU4OUUzXHU2NzkwXHU1NjY4XHVGRjFBQGJ0Yy9zaGFyZWQtY29tcG9uZW50c1xuICAgICAgKGNvbXBvbmVudE5hbWUpID0+IHtcbiAgICAgICAgLy8gXHU1QzA2IGtlYmFiLWNhc2UgXHU4RjZDXHU2MzYyXHU0RTNBIFBhc2NhbENhc2VcbiAgICAgICAgLy8gXHU0RjhCXHU1OTgyOiBidGMtc3ZnIC0+IEJ0Y1N2Z1xuICAgICAgICBjb25zdCBjb252ZXJ0VG9QYXNjYWxDYXNlID0gKG5hbWU6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgnQnRjJykpIHtcbiAgICAgICAgICAgIHJldHVybiBuYW1lOyAvLyBcdTVERjJcdTdFQ0ZcdTY2MkYgUGFzY2FsQ2FzZVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCdidGMtJykpIHtcbiAgICAgICAgICAgIC8vIGJ0Yy1zdmcgLT4gQnRjU3ZnXG4gICAgICAgICAgICByZXR1cm4gbmFtZVxuICAgICAgICAgICAgICAuc3BsaXQoJy0nKVxuICAgICAgICAgICAgICAubWFwKHBhcnQgPT4gcGFydC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHBhcnQuc2xpY2UoMSkpXG4gICAgICAgICAgICAgIC5qb2luKCcnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGNvbXBvbmVudE5hbWUuc3RhcnRzV2l0aCgnQnRjJykgfHwgY29tcG9uZW50TmFtZS5zdGFydHNXaXRoKCdidGMtJykpIHtcbiAgICAgICAgICBjb25zdCBwYXNjYWxOYW1lID0gY29udmVydFRvUGFzY2FsQ2FzZShjb21wb25lbnROYW1lKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogcGFzY2FsTmFtZSxcbiAgICAgICAgICAgIGZyb206ICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJyxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIF0sXG4gICAgZHRzOiAnc3JjL2NvbXBvbmVudHMuZC50cycsXG4gICAgZGlycyxcbiAgICBleHRlbnNpb25zOiBbJ3Z1ZScsICd0c3gnXSwgLy8gXHU2NTJGXHU2MzAxIC52dWUgXHU1NDhDIC50c3ggXHU2NTg3XHU0RUY2XG4gICAgLy8gXHU1RjNBXHU1MjM2XHU5MUNEXHU2NUIwXHU2MjZCXHU2M0NGXHU3RUM0XHU0RUY2XG4gICAgZGVlcDogdHJ1ZSxcbiAgICAvLyBcdTUzMDVcdTU0MkJcdTYyNDBcdTY3MDkgQnRjIFx1NUYwMFx1NTkzNFx1NzY4NFx1N0VDNFx1NEVGNlxuICAgIGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC50c3gkLywgL0J0Y1tBLVpdLywgL2J0Yy1bYS16XS9dLFxuICB9KTtcbn1cbi8vIFVURi04IGVuY29kaW5nIGZpeFxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlLWFwcC1jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlLWFwcC1jb25maWcudHNcIjsvKipcbiAqIFZpdGUgXHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHU4Rjg1XHU1MkE5XHU1MUZEXHU2NTcwXG4gKiBcdTc1MjhcdTRFOEVcdTRFQ0VcdTdFREZcdTRFMDBcdTkxNERcdTdGNkVcdTRFMkRcdTgzQjdcdTUzRDZcdTVFOTRcdTc1MjhcdTc2ODRcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcbiAqL1xuXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBnZXRBcHBDb25maWcgfSBmcm9tICcuLi9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMvY29uZmlncy9hcHAtZW52LmNvbmZpZyc7XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHVGRjA4XHU3NTI4XHU0RThFIHZpdGUuY29uZmlnLnRzXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRWaXRlQXBwQ29uZmlnKGFwcE5hbWU6IHN0cmluZyk6IHtcbiAgZGV2UG9ydDogbnVtYmVyO1xuICBkZXZIb3N0OiBzdHJpbmc7XG4gIHByZVBvcnQ6IG51bWJlcjtcbiAgcHJlSG9zdDogc3RyaW5nO1xuICBwcm9kSG9zdDogc3RyaW5nO1xuICBtYWluQXBwT3JpZ2luOiBzdHJpbmc7XG59IHtcbiAgY29uc3QgYXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnKGFwcE5hbWUpO1xuICBpZiAoIWFwcENvbmZpZykge1xuICAgIHRocm93IG5ldyBFcnJvcihgXHU2NzJBXHU2MjdFXHU1MjMwICR7YXBwTmFtZX0gXHU3Njg0XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFYCk7XG4gIH1cblxuICBjb25zdCBtYWluQXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnKCdtYWluLWFwcCcpO1xuICBjb25zdCBtYWluQXBwT3JpZ2luID0gbWFpbkFwcENvbmZpZ1xuICAgID8gYGh0dHA6Ly8ke21haW5BcHBDb25maWcucHJlSG9zdH06JHttYWluQXBwQ29uZmlnLnByZVBvcnR9YFxuICAgIDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NDE4MCc7XG5cbiAgcmV0dXJuIHtcbiAgICBkZXZQb3J0OiBwYXJzZUludChhcHBDb25maWcuZGV2UG9ydCwgMTApLFxuICAgIGRldkhvc3Q6IGFwcENvbmZpZy5kZXZIb3N0LFxuICAgIHByZVBvcnQ6IHBhcnNlSW50KGFwcENvbmZpZy5wcmVQb3J0LCAxMCksXG4gICAgcHJlSG9zdDogYXBwQ29uZmlnLnByZUhvc3QsXG4gICAgcHJvZEhvc3Q6IGFwcENvbmZpZy5wcm9kSG9zdCxcbiAgICBtYWluQXBwT3JpZ2luLFxuICB9O1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1N0M3Qlx1NTc4QlxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXG4gKiBAcmV0dXJucyBcdTVFOTRcdTc1MjhcdTdDN0JcdTU3OEJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcFR5cGUoYXBwTmFtZTogc3RyaW5nKTogJ21haW4nIHwgJ3N1YicgfCAnbGF5b3V0JyB8ICdtb2JpbGUnIHtcbiAgaWYgKGFwcE5hbWUgPT09ICdtYWluLWFwcCcpIHJldHVybiAnbWFpbic7XG4gIGlmIChhcHBOYW1lID09PSAnbGF5b3V0LWFwcCcpIHJldHVybiAnbGF5b3V0JztcbiAgaWYgKGFwcE5hbWUgPT09ICdtb2JpbGUtYXBwJykgcmV0dXJuICdtb2JpbGUnO1xuICByZXR1cm4gJ3N1Yic7IC8vIFx1NTE3Nlx1NEVENlx1OTBGRFx1NjYyRlx1NUI1MFx1NUU5NFx1NzUyOFxufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENiBiYXNlIFVSTFxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXG4gKiBAcGFyYW0gaXNQcmV2aWV3QnVpbGQgXHU2NjJGXHU1NDI2XHU0RTNBXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXG4gKiBAcmV0dXJucyBiYXNlIFVSTFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmFzZVVybChhcHBOYW1lOiBzdHJpbmcsIGlzUHJldmlld0J1aWxkOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcge1xuICBjb25zdCBhcHBDb25maWcgPSBnZXRBcHBDb25maWcoYXBwTmFtZSk7XG4gIGlmICghYXBwQ29uZmlnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBcdTY3MkFcdTYyN0VcdTUyMzAgJHthcHBOYW1lfSBcdTc2ODRcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVgKTtcbiAgfVxuICBcbiAgLy8gXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XG4gIGlmIChpc1ByZXZpZXdCdWlsZCkge1xuICAgIHJldHVybiBgaHR0cDovLyR7YXBwQ29uZmlnLnByZUhvc3R9OiR7YXBwQ29uZmlnLnByZVBvcnR9L2A7XG4gIH1cbiAgXG4gIC8vIFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1RkYxQVx1NEY3Rlx1NzUyOFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOFx1OEJBOVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NjgzOVx1NjM2RVx1NTdERlx1NTQwRFx1ODFFQVx1NTJBOFx1ODlFM1x1Njc5MFx1RkYwOVxuICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTVCNTBcdTVFOTRcdTc1MjhcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTc2RjRcdTYzQTVcdTkwRThcdTdGNzJcdTUyMzBcdTVCNTBcdTU3REZcdTU0MERcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMDhcdTU5ODIgcHJvZHVjdGlvbi5iZWxsaXMuY29tLmNuXHVGRjA5XG4gIHJldHVybiAnLyc7XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2IHB1YmxpY0RpciBcdThERUZcdTVGODRcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAqIEByZXR1cm5zIHB1YmxpY0RpciBcdThERUZcdTVGODRcdTYyMTYgZmFsc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFB1YmxpY0RpcihhcHBOYW1lOiBzdHJpbmcsIGFwcERpcjogc3RyaW5nKTogc3RyaW5nIHwgZmFsc2Uge1xuICAvLyBtYWluLWFwcFx1MzAwMWFkbWluLWFwcFx1MzAwMW1vYmlsZS1hcHAgXHU1NDhDIHN5c3RlbS1hcHAgXHU0RjdGXHU3NTI4XHU4MUVBXHU1REYxXHU3Njg0IHB1YmxpYyBcdTc2RUVcdTVGNTVcbiAgaWYgKGFwcE5hbWUgPT09ICdtYWluLWFwcCcgfHwgYXBwTmFtZSA9PT0gJ2FkbWluLWFwcCcgfHwgYXBwTmFtZSA9PT0gJ21vYmlsZS1hcHAnIHx8IGFwcE5hbWUgPT09ICdzeXN0ZW0tYXBwJykge1xuICAgIHJldHVybiByZXNvbHZlKGFwcERpciwgJ3B1YmxpYycpO1xuICB9XG4gIFxuICAvLyBcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdTRGN0ZcdTc1MjhcdTUxNzFcdTRFQUJcdTc2ODQgcHVibGljIFx1NzZFRVx1NUY1NVxuICByZXR1cm4gcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9wdWJsaWMnKTtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHNyY1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHNyY1xcXFxjb25maWdzXFxcXGFwcC1lbnYuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9jb25maWdzL2FwcC1lbnYuY29uZmlnLnRzXCI7Ly8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU4RkQ5XHU5MUNDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IGxvZ2dlclx1RkYwQ1x1NTZFMFx1NEUzQVx1NUI1OFx1NTcyOFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1RkYxQVxuLy8gbG9nZ2VyIC0+IGVudi1pbmZvIC0+IHVuaWZpZWQtZW52LWNvbmZpZyAtPiBhcHAtZW52LmNvbmZpZyAtPiBsb2dnZXJcbi8vIFx1NTcyOFx1NkEyMVx1NTc1N1x1NTJBMFx1OEY3RFx1NzY4NFx1NjVFOVx1NjcxRlx1OTYzNlx1NkJCNVx1RkYwQ2xvZ2dlciBcdTUzRUZcdTgwRkRcdThGRDhcdTY3MkFcdTUyMURcdTU5Q0JcdTUzMTZcdUZGMENcdTYyNDBcdTRFRTVcdTc2RjRcdTYzQTVcdTRGN0ZcdTc1MjggY29uc29sZVxuLy8gY29uc29sZSBcdTY2MkZcdTUxNjhcdTVDNDBcdTVCRjlcdThDNjFcdUZGMENcdTU3MjhcdTZBMjFcdTU3NTdcdTUyQTBcdThGN0RcdTY1RjZcdTVDMzFcdTVERjJcdTdFQ0ZcdTVCNThcdTU3MjhcdUZGMENcdTRFMERcdTRGMUFcdTUzRDdcdTUyMzBcdTVGQUFcdTczQUZcdTRGOURcdThENTZcdTc2ODRcdTVGNzFcdTU0Q0Rcbi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwidml0ZS9jbGllbnRcIiAvPlxuXG4vKipcbiAqIFx1N0VERlx1NEUwMFx1NzY4NFx1NUU5NFx1NzUyOFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVxuICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU3Njg0XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU5MEZEXHU0RUNFXHU4RkQ5XHU5MUNDXHU4QkZCXHU1M0Q2XHVGRjBDXHU5MDdGXHU1MTREXHU0RThDXHU0RTQ5XHU2MDI3XG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBBcHBFbnZDb25maWcge1xuICBhcHBOYW1lOiBzdHJpbmc7XG4gIGRldkhvc3Q6IHN0cmluZztcbiAgZGV2UG9ydDogc3RyaW5nO1xuICBwcmVIb3N0OiBzdHJpbmc7XG4gIHByZVBvcnQ6IHN0cmluZztcbiAgdGVzdEhvc3Q/OiBzdHJpbmc7IC8vIFx1NkQ0Qlx1OEJENVx1NzNBRlx1NTg4M1x1NEY3Rlx1NzUyOFx1NUI1MFx1NTdERlx1NTQwRFx1RkYwOFx1NTk4MiBhZG1pbi50ZXN0LmJlbGxpcy5jb20uY25cdUZGMDlcdUZGMENcdTRFMERcdTRGN0ZcdTc1MjhcdTdBRUZcdTUzRTNcbiAgcHJvZEhvc3Q6IHN0cmluZztcbn1cblxuLyoqXG4gKiBcdTRFM0JcdTVFOTRcdTc1MjhcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcbiAqL1xuY29uc3QgTUFJTl9BUFBfQ09ORklHOiBBcHBFbnZDb25maWcgPSB7XG4gIGFwcE5hbWU6ICdtYWluLWFwcCcsXG4gIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gIGRldlBvcnQ6ICc4MDgwJyxcbiAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gIHByZVBvcnQ6ICc0MTgwJyxcbiAgdGVzdEhvc3Q6ICd0ZXN0LmJlbGxpcy5jb20uY24nLFxuICBwcm9kSG9zdDogJ2JlbGxpcy5jb20uY24nLFxufTtcblxuLyoqXG4gKiBcdTRFMUFcdTUyQTFcdTVCNTBcdTVFOTRcdTc1MjhcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcdUZGMDhcdTYzMDlcdTVCNTdcdTZCQ0RcdTk4N0FcdTVFOEZcdUZGMDlcbiAqL1xuY29uc3QgQlVTSU5FU1NfQVBQX0NPTkZJR1M6IEFwcEVudkNvbmZpZ1tdID0gW1xuICB7XG4gICAgYXBwTmFtZTogJ2FkbWluLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MScsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODEnLFxuICAgIHRlc3RIb3N0OiAnYWRtaW4udGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ2FkbWluLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2Rhc2hib2FyZC1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODInLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTgyJyxcbiAgICB0ZXN0SG9zdDogJ2Rhc2hib2FyZC50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnZGFzaGJvYXJkLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2VuZ2luZWVyaW5nLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MycsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODMnLFxuICAgIHRlc3RIb3N0OiAnZW5naW5lZXJpbmcudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ2VuZ2luZWVyaW5nLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2ZpbmFuY2UtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg0JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NCcsXG4gICAgdGVzdEhvc3Q6ICdmaW5hbmNlLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdmaW5hbmNlLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2xvZ2lzdGljcy1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODYnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg2JyxcbiAgICB0ZXN0SG9zdDogJ2xvZ2lzdGljcy50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnbG9naXN0aWNzLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ29wZXJhdGlvbnMtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg4JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4OCcsXG4gICAgdGVzdEhvc3Q6ICdvcGVyYXRpb25zLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdvcGVyYXRpb25zLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ3BlcnNvbm5lbC1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODknLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg5JyxcbiAgICB0ZXN0SG9zdDogJ3BlcnNvbm5lbC50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAncGVyc29ubmVsLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ3Byb2R1Y3Rpb24tYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDk2JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5MCcsXG4gICAgdGVzdEhvc3Q6ICdwcm9kdWN0aW9uLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdwcm9kdWN0aW9uLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ3F1YWxpdHktYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDkxJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5MScsXG4gICAgdGVzdEhvc3Q6ICdxdWFsaXR5LnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdxdWFsaXR5LmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ3N5c3RlbS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwOTInLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTkyJyxcbiAgICB0ZXN0SG9zdDogJ3N5c3RlbS50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnc3lzdGVtLmJlbGxpcy5jb20uY24nLFxuICB9LFxuXTtcblxuLyoqXG4gKiBcdTcyNzlcdTZCOEFcdTVFOTRcdTc1MjhcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcdUZGMDhcdTYzMDlcdTVCNTdcdTZCQ0RcdTk4N0FcdTVFOEZcdUZGMDlcbiAqL1xuY29uc3QgU1BFQ0lBTF9BUFBfQ09ORklHUzogQXBwRW52Q29uZmlnW10gPSBbXG4gIHtcbiAgICBhcHBOYW1lOiAnZG9jcy1hcHAnLFxuICAgIGRldkhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIGRldlBvcnQ6ICc4MDkzJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5MycsXG4gICAgdGVzdEhvc3Q6ICdkb2NzLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdkb2NzLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2hvbWUtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg1JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NScsXG4gICAgdGVzdEhvc3Q6ICd3d3cudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ3d3dy5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdsYXlvdXQtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDk0JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5NCcsXG4gICAgdGVzdEhvc3Q6ICdsYXlvdXQudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ2xheW91dC5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdtb2JpbGUtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg3JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NycsXG4gICAgdGVzdEhvc3Q6ICdtb2JpbGUudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ21vYmlsZS5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbl07XG5cbi8qKlxuICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU3Njg0XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFXG4gKiBcdTU0MDhcdTVFNzZcdTRFM0JcdTVFOTRcdTc1MjhcdTMwMDFcdTRFMUFcdTUyQTFcdTVFOTRcdTc1MjhcdTU0OENcdTcyNzlcdTZCOEFcdTVFOTRcdTc1MjhcbiAqL1xuZXhwb3J0IGNvbnN0IEFQUF9FTlZfQ09ORklHUzogQXBwRW52Q29uZmlnW10gPSBbXG4gIE1BSU5fQVBQX0NPTkZJRyxcbiAgLi4uQlVTSU5FU1NfQVBQX0NPTkZJR1MsXG4gIC4uLlNQRUNJQUxfQVBQX0NPTkZJR1MsXG5dO1xuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1ODNCN1x1NTNENlx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnKGFwcE5hbWU6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcuYXBwTmFtZSA9PT0gYXBwTmFtZSk7XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU1RjAwXHU1M0QxXHU3QUVGXHU1M0UzXHU1MjE3XHU4ODY4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGxEZXZQb3J0cygpOiBzdHJpbmdbXSB7XG4gIC8vIFx1OTYzMlx1NUZBMVx1NjAyN1x1NjhDMFx1NjdFNVx1RkYxQVx1NEY3Rlx1NzUyOCB0cnktY2F0Y2ggXHU2MzU1XHU4M0I3XHU1M0VGXHU4MEZEXHU3Njg0IFREWiAoVGVtcG9yYWwgRGVhZCBab25lKSBcdTk1MTlcdThCRUZcbiAgLy8gXHU1OTgyXHU2NzlDIEFQUF9FTlZfQ09ORklHUyBcdThGRDhcdTZDQTFcdTY3MDlcdTUyMURcdTU5Q0JcdTUzMTZcdUZGMDhcdTc1MzFcdTRFOEVcdTVGQUFcdTczQUZcdTRGOURcdThENTZcdTYyMTZcdTZBMjFcdTU3NTdcdTUyQTBcdThGN0RcdTk4N0FcdTVFOEZcdUZGMDlcdUZGMENcdThGRDRcdTU2REVcdTdBN0FcdTY1NzBcdTdFQzRcbiAgdHJ5IHtcbiAgICByZXR1cm4gQVBQX0VOVl9DT05GSUdTLm1hcCgoY29uZmlnKSA9PiBjb25maWcuZGV2UG9ydCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgUmVmZXJlbmNlRXJyb3IgJiYgZXJyb3IubWVzc2FnZS5pbmNsdWRlcygnYmVmb3JlIGluaXRpYWxpemF0aW9uJykpIHtcbiAgICAgIGlmICh0eXBlb2YgaW1wb3J0Lm1ldGEgIT09ICd1bmRlZmluZWQnICYmIGltcG9ydC5tZXRhLmVudiAmJiBpbXBvcnQubWV0YS5lbnYuREVWKSB7XG4gICAgICAgIC8vIFx1NzZGNFx1NjNBNVx1NEY3Rlx1NzUyOCBjb25zb2xlLndhcm5cdUZGMENcdTkwN0ZcdTUxNERcdTVGQUFcdTczQUZcdTRGOURcdThENTZcbiAgICAgICAgY29uc29sZS53YXJuKCdbYXBwLWVudi5jb25maWddIEFQUF9FTlZfQ09ORklHUyBcdTY3MkFcdTUyMURcdTU5Q0JcdTUzMTZcdUZGMDhcdTUzRUZcdTgwRkRcdTY2MkZcdTVGQUFcdTczQUZcdTRGOURcdThENTZcdUZGMDlcdUZGMENcdThGRDRcdTU2REVcdTdBN0FcdTY1NzBcdTdFQzQnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgLy8gXHU1MTc2XHU0RUQ2XHU5NTE5XHU4QkVGXHU5MUNEXHU2NUIwXHU2MjlCXHU1MUZBXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTk4ODRcdTg5QzhcdTdBRUZcdTUzRTNcdTUyMTdcdTg4NjhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbFByZVBvcnRzKCk6IHN0cmluZ1tdIHtcbiAgLy8gXHU5NjMyXHU1RkExXHU2MDI3XHU2OEMwXHU2N0U1XHVGRjFBXHU0RjdGXHU3NTI4IHRyeS1jYXRjaCBcdTYzNTVcdTgzQjdcdTUzRUZcdTgwRkRcdTc2ODQgVERaIChUZW1wb3JhbCBEZWFkIFpvbmUpIFx1OTUxOVx1OEJFRlxuICAvLyBcdTU5ODJcdTY3OUMgQVBQX0VOVl9DT05GSUdTIFx1OEZEOFx1NkNBMVx1NjcwOVx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwOFx1NzUzMVx1NEU4RVx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1NjIxNlx1NkEyMVx1NTc1N1x1NTJBMFx1OEY3RFx1OTg3QVx1NUU4Rlx1RkYwOVx1RkYwQ1x1OEZENFx1NTZERVx1N0E3QVx1NjU3MFx1N0VDNFxuICB0cnkge1xuICAgIHJldHVybiBBUFBfRU5WX0NPTkZJR1MubWFwKChjb25maWcpID0+IGNvbmZpZy5wcmVQb3J0KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBSZWZlcmVuY2VFcnJvciAmJiBlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCdiZWZvcmUgaW5pdGlhbGl6YXRpb24nKSkge1xuICAgICAgaWYgKHR5cGVvZiBpbXBvcnQubWV0YSAhPT0gJ3VuZGVmaW5lZCcgJiYgaW1wb3J0Lm1ldGEuZW52ICYmIGltcG9ydC5tZXRhLmVudi5ERVYpIHtcbiAgICAgICAgLy8gXHU3NkY0XHU2M0E1XHU0RjdGXHU3NTI4IGNvbnNvbGUud2Fyblx1RkYwQ1x1OTA3Rlx1NTE0RFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1NlxuICAgICAgICBjb25zb2xlLndhcm4oJ1thcHAtZW52LmNvbmZpZ10gQVBQX0VOVl9DT05GSUdTIFx1NjcyQVx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwOFx1NTNFRlx1ODBGRFx1NjYyRlx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1RkYwOVx1RkYwQ1x1OEZENFx1NTZERVx1N0E3QVx1NjU3MFx1N0VDNCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICAvLyBcdTUxNzZcdTRFRDZcdTk1MTlcdThCRUZcdTkxQ0RcdTY1QjBcdTYyOUJcdTUxRkFcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1N0FFRlx1NTNFM1x1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnQnlEZXZQb3J0KHBvcnQ6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcuZGV2UG9ydCA9PT0gcG9ydCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWdCeVByZVBvcnQocG9ydDogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5wcmVQb3J0ID09PSBwb3J0KTtcbn1cblxuLyoqXG4gKiBcdTY4MzlcdTYzNkVcdTZENEJcdThCRDVcdTczQUZcdTU4ODNcdTVCNTBcdTU3REZcdTU0MERcdTgzQjdcdTUzRDZcdTVFOTRcdTc1MjhcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcENvbmZpZ0J5VGVzdEhvc3QodGVzdEhvc3Q6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcudGVzdEhvc3QgPT09IHRlc3RIb3N0KTtcbn1cblxuLyoqXG4gKiBcdTUyMjRcdTY1QURcdTVFOTRcdTc1MjhcdTY2MkZcdTU0MjZcdTRFM0FcdTcyNzlcdTZCOEFcdTVFOTRcdTc1MjhcdUZGMDhcdTU3MjggU1BFQ0lBTF9BUFBfQ09ORklHUyBcdTRFMkRcdUZGMDlcbiAqIFx1NzI3OVx1NkI4QVx1NUU5NFx1NzUyOFx1NTMwNVx1NjJFQ1x1RkYxQWRvY3MtYXBwLCBob21lLWFwcCwgbGF5b3V0LWFwcCwgbW9iaWxlLWFwcFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTcGVjaWFsQXBwKGFwcE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gU1BFQ0lBTF9BUFBfQ09ORklHUy5zb21lKChjb25maWcpID0+IGNvbmZpZy5hcHBOYW1lID09PSBhcHBOYW1lKTtcbn1cblxuLyoqXG4gKiBcdTUyMjRcdTY1QURcdTVFOTRcdTc1MjhcdTY2MkZcdTU0MjZcdTRFM0FcdTRFMUFcdTUyQTFcdTVFOTRcdTc1MjhcdUZGMDhcdTU3MjggQlVTSU5FU1NfQVBQX0NPTkZJR1MgXHU0RTJEXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0J1c2luZXNzQXBwKGFwcE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gQlVTSU5FU1NfQVBQX0NPTkZJR1Muc29tZSgoY29uZmlnKSA9PiBjb25maWcuYXBwTmFtZSA9PT0gYXBwTmFtZSk7XG59XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFXHU1RTk0XHU3NTI4IElEIFx1NTIyNFx1NjVBRFx1NjYyRlx1NTQyNlx1NEUzQVx1NzI3OVx1NkI4QVx1NUU5NFx1NzUyOFxuICogXHU1RTk0XHU3NTI4IElEIFx1NjYyRiBhcHBOYW1lIFx1NTNCQlx1NjM4OSAnLWFwcCcgXHU1NDBFXHU3RjAwXHU1NDBFXHU3Njg0XHU1MDNDXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1NwZWNpYWxBcHBCeUlkKGFwcElkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgYXBwTmFtZSA9IGAke2FwcElkfS1hcHBgO1xuICByZXR1cm4gaXNTcGVjaWFsQXBwKGFwcE5hbWUpO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcYmFzZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL2Jhc2UuY29uZmlnLnRzXCI7LyoqXG4gKiBcdTU3RkFcdTc4NDBcdTkxNERcdTdGNkVcdTZBMjFcdTU3NTdcbiAqIFx1NjNEMFx1NEY5Qlx1NTE2Q1x1NTE3MVx1NzY4NFx1NTIyQlx1NTQwRFx1NTQ4QyByZXNvbHZlIFx1OTE0RFx1N0Y2RVxuICovXG5cbmltcG9ydCB0eXBlIHsgVXNlckNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhpc3RzU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IGNyZWF0ZVBhdGhIZWxwZXJzIH0gZnJvbSAnLi91dGlscy9wYXRoLWhlbHBlcnMnO1xuXG4vKipcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1Nzg0MFx1NTIyQlx1NTQwRFx1OTE0RFx1N0Y2RVxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFxuICogQHJldHVybnMgXHU1MjJCXHU1NDBEXHU5MTREXHU3RjZFXHU1QkY5XHU4QzYxXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCYXNlQWxpYXNlcyhcbiAgYXBwRGlyOiBzdHJpbmcsIFxuICBfYXBwTmFtZTogc3RyaW5nXG4pOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcbiAgY29uc3QgeyB3aXRoU3JjLCB3aXRoUm9vdCwgd2l0aENvbmZpZ3MsIHdpdGhQYWNrYWdlcyB9ID0gY3JlYXRlUGF0aEhlbHBlcnMoYXBwRGlyKTtcblxuICBjb25zdCBhbGlhc2VzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICdAJzogd2l0aFNyYygnc3JjJyksXG4gICAgJ0Btb2R1bGVzJzogd2l0aFNyYygnc3JjL21vZHVsZXMnKSxcbiAgICAnQHNlcnZpY2VzJzogd2l0aFNyYygnc3JjL3NlcnZpY2VzJyksXG4gICAgJ0Bjb21wb25lbnRzJzogd2l0aFNyYygnc3JjL2NvbXBvbmVudHMnKSxcbiAgICAnQHV0aWxzJzogd2l0aFNyYygnc3JjL3V0aWxzJyksXG4gICAgJ0BhdXRoJzogd2l0aFJvb3QoJ2F1dGgnKSxcbiAgICAnQGNvbmZpZ3MnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYy9jb25maWdzJyksXG4gICAgJ0BidGMvYXV0aC1zaGFyZWQnOiB3aXRoUm9vdCgnYXV0aC9zaGFyZWQnKSxcbiAgICAvLyBAYnRjLyogXHU1MzA1XHU1MjJCXHU1NDBEXHVGRjFBXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU2MjUzXHU1MzA1XHU4RkQ5XHU0RTlCXHU1MzA1XHVGRjBDXHU2MjQwXHU0RUU1XHU1OUNCXHU3RUM4XHU0RjdGXHU3NTI4XHU1MjJCXHU1NDBEXHU2MzA3XHU1NDExXHU2RTkwXHU3ODAxXG4gICAgJ0BidGMvc2hhcmVkLWNvcmUnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYycpLFxuICAgICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMnKSxcbiAgICAnQGJ0Yy9zaGFyZWQtcm91dGVyJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtcm91dGVyL3NyYycpLFxuICAgIC8vIFx1NTQxMVx1NTQwRVx1NTE3Q1x1NUJCOVx1RkYxQVx1NUU5Rlx1NUYwM1x1NTMwNVx1NzY4NFx1NTIyQlx1NTQwRFx1NjMwN1x1NTQxMVx1NUY1Mlx1NUU3Nlx1NTQwRVx1NzY4NFx1NEY0RFx1N0Y2RVxuICAgICdAYnRjL3NoYXJlZC11dGlscyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvcmUvc3JjL3V0aWxzJyksXG4gICAgJ0BidGMvc2hhcmVkLXBsdWdpbnMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9wbHVnaW5zJyksXG4gICAgJ0BidGMvaTE4bic6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2kxOG4nKSxcbiAgICAnQGJ0Yy9zdWJhcHAtbWFuaWZlc3RzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMvbWFuaWZlc3QnKSxcbiAgICAnQGJ0Yy9lbnYnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYy9lbnYnKSxcbiAgICBcbiAgICAvLyBzaGFyZWQtY29tcG9uZW50cyBcdTUxODVcdTkwRThcdTRGN0ZcdTc1MjhcdTc2ODRcdTUyMkJcdTU0MERcdUZGMDhcdTc1MjhcdTRFOEVcdTg5RTNcdTY3OTAgc2hhcmVkLWNvbXBvbmVudHMgXHU1MTg1XHU5MEU4XHU3Njg0XHU1QkZDXHU1MTY1XHVGRjA5XG4gICAgJ0BidGMtY29tbW9uJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY29tbW9uJyksXG4gICAgJ0BidGMtY29tcG9uZW50cyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMnKSxcbiAgICAnQGJ0Yy1jcnVkJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY3J1ZCcpLFxuICAgICdAYnRjLXN0eWxlcyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL3N0eWxlcycpLFxuICAgICdAYnRjLWxvY2FsZXMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9sb2NhbGVzJyksXG4gICAgJ0BidGMtYXNzZXRzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvYXNzZXRzJyksXG4gICAgJ0Bhc3NldHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9hc3NldHMnKSwgLy8gQGFzc2V0cyBcdTUyMkJcdTU0MERcdUZGMENcdTc1MjhcdTRFOEVcdTU2RkVcdTcyNDdcdThENDRcdTZFOTBcdTVCRkNcdTUxNjVcbiAgICAnQGJ0Yy11dGlscyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL3V0aWxzJyksXG4gICAgJ0BwbHVnaW5zJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvcGx1Z2lucycpLFxuICAgIFxuICAgIC8vIFx1NTZGRVx1ODg2OFx1NzZGOFx1NTE3M1x1NTIyQlx1NTQwRFxuICAgICdAY2hhcnRzLXV0aWxzL2Nzcy12YXInOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvY3NzLXZhcicpLFxuICAgICdAY2hhcnRzLXV0aWxzL2NvbG9yJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzL2NvbG9yJyksXG4gICAgJ0BjaGFydHMtdXRpbHMvZ3JhZGllbnQnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvZ3JhZGllbnQnKSxcbiAgICAnQGNoYXJ0cy1jb21wb3NhYmxlcy91c2VDaGFydENvbXBvbmVudCc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy9jb21wb3NhYmxlcy91c2VDaGFydENvbXBvbmVudCcpLFxuICAgICdAY2hhcnRzLXR5cGVzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3R5cGVzJyksXG4gICAgJ0BjaGFydHMtdXRpbHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMnKSxcbiAgICAnQGNoYXJ0cy1jb21wb3NhYmxlcyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy9jb21wb3NhYmxlcycpLFxuXG4gICAgLy8gRWxlbWVudCBQbHVzIFx1NTIyQlx1NTQwRFx1RkYwOFx1NTlDQlx1N0VDOFx1NEY3Rlx1NzUyOFx1RkYwOVxuICAgICdlbGVtZW50LXBsdXMvZXMnOiAnZWxlbWVudC1wbHVzL2VzJyxcbiAgICAnZWxlbWVudC1wbHVzL2Rpc3QnOiAnZWxlbWVudC1wbHVzL2Rpc3QnLFxuICB9O1xuXG4gIHJldHVybiBhbGlhc2VzO1xufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1Nzg0MCByZXNvbHZlIFx1OTE0RFx1N0Y2RVxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFxuICogQHJldHVybnMgcmVzb2x2ZSBcdTkxNERcdTdGNkVcdTVCRjlcdThDNjFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJhc2VSZXNvbHZlKFxuICBhcHBEaXI6IHN0cmluZywgXG4gIGFwcE5hbWU6IHN0cmluZ1xuKTogVXNlckNvbmZpZ1sncmVzb2x2ZSddIHtcbiAgY29uc3QgeyB3aXRoUGFja2FnZXMgfSA9IGNyZWF0ZVBhdGhIZWxwZXJzKGFwcERpcik7XG4gIGNvbnN0IGFsaWFzZXMgPSBjcmVhdGVCYXNlQWxpYXNlcyhhcHBEaXIsIGFwcE5hbWUpO1xuICBcbiAgLy8gXHU0RjdGXHU3NTI4XHU2NTcwXHU3RUM0XHU1RjYyXHU1RjBGXHU3Njg0XHU1MjJCXHU1NDBEXHVGRjBDXHU3ODZFXHU0RkREXHU2NkY0XHU1MTc3XHU0RjUzXHU3Njg0XHU1MjJCXHU1NDBEXHU0RjE4XHU1MTQ4XHU1MzM5XHU5MTREXG4gIC8vIFZpdGUgXHU0RjFBXHU2MzA5XHU2NTcwXHU3RUM0XHU5ODdBXHU1RThGXHU1MzM5XHU5MTREXHVGRjBDXHU3QjJDXHU0RTAwXHU0RTJBXHU1MzM5XHU5MTREXHU3Njg0XHU1MjJCXHU1NDBEXHU0RjFBXHU4OEFCXHU0RjdGXHU3NTI4XG4gIGNvbnN0IGFsaWFzQXJyYXk6IEFycmF5PHsgZmluZDogc3RyaW5nIHwgUmVnRXhwOyByZXBsYWNlbWVudDogc3RyaW5nIH0+ID0gW1xuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NUMwNiB1dGlsIFx1NjYyMFx1NUMwNFx1NTIzMCBucG0gXHU1MzA1XHVGRjBDXHU5NjMyXHU2QjYyIFZpdGUgXHU1QzA2XHU1MTc2XHU4OUM2XHU0RTNBIE5vZGUuanMgXHU1MTg1XHU3RjZFXHU2QTIxXHU1NzU3XHU1RTc2XHU1OTE2XHU5MEU4XHU1MzE2XG4gICAgLy8gXHU5NzAwXHU4OTgxXHU2N0U1XHU2MjdFIG5vZGVfbW9kdWxlcy91dGlsIFx1NzY4NFx1NUI5RVx1OTY0NVx1OERFRlx1NUY4NFx1RkYwOFx1NTNFRlx1ODBGRFx1NTcyOFx1NjgzOVx1NzZFRVx1NUY1NVx1NjIxNlx1NUU5NFx1NzUyOFx1NzZFRVx1NUY1NVx1RkYwOVxuICAgIHtcbiAgICAgIGZpbmQ6IC9edXRpbCQvLFxuICAgICAgcmVwbGFjZW1lbnQ6ICgoKSA9PiB7XG4gICAgICAgIC8vIFx1NUMxRFx1OEJENVx1NEVDRVx1NUU5NFx1NzUyOFx1NzZFRVx1NUY1NVx1NjdFNVx1NjI3RVxuICAgICAgICBjb25zdCBhcHBVdGlsUGF0aCA9IHJlc29sdmUoYXBwRGlyLCAnbm9kZV9tb2R1bGVzL3V0aWwnKTtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoYXBwVXRpbFBhdGgpKSB7XG4gICAgICAgICAgcmV0dXJuIGFwcFV0aWxQYXRoO1xuICAgICAgICB9XG4gICAgICAgIC8vIFx1NUMxRFx1OEJENVx1NEVDRVx1NjgzOVx1NzZFRVx1NUY1NVx1NjdFNVx1NjI3RVxuICAgICAgICBjb25zdCByb290VXRpbFBhdGggPSByZXNvbHZlKGFwcERpciwgJy4uLy4uL25vZGVfbW9kdWxlcy91dGlsJyk7XG4gICAgICAgIGlmIChleGlzdHNTeW5jKHJvb3RVdGlsUGF0aCkpIHtcbiAgICAgICAgICByZXR1cm4gcm9vdFV0aWxQYXRoO1xuICAgICAgICB9XG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjI3RVx1NEUwRFx1NTIzMFx1RkYwQ1x1OEZENFx1NTZERVx1NTMwNVx1NTQwRFx1OEJBOSBWaXRlIFx1ODFFQVx1NTJBOFx1ODlFM1x1Njc5MFx1RkYwOFx1NUU5NFx1OEJFNVx1NTcyOCBvcHRpbWl6ZURlcHMuaW5jbHVkZSBcdTRFMkRcdUZGMDlcbiAgICAgICAgcmV0dXJuICd1dGlsJztcbiAgICAgIH0pKCksXG4gICAgfSxcbiAgICAvLyBsb2NhbGVzIFx1NUI1MFx1OERFRlx1NUY4NFx1NTIyQlx1NTQwRFx1RkYwOFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NEY3Rlx1NzUyOFx1NTIyQlx1NTQwRFx1NjMwN1x1NTQxMVx1NkU5MFx1NzgwMVx1RkYwOVxuICAgIHtcbiAgICAgIGZpbmQ6ICdAYnRjL3NoYXJlZC1jb3JlL2xvY2FsZXMvemgtQ04nLFxuICAgICAgcmVwbGFjZW1lbnQ6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvcmUvc3JjL2J0Yy9wbHVnaW5zL2kxOG4vbG9jYWxlcy96aC1DTicpLFxuICAgIH0sXG4gICAge1xuICAgICAgZmluZDogJ0BidGMvc2hhcmVkLWNvcmUvbG9jYWxlcy9lbi1VUycsXG4gICAgICByZXBsYWNlbWVudDogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMvYnRjL3BsdWdpbnMvaTE4bi9sb2NhbGVzL2VuLVVTJyksXG4gICAgfSxcbiAgICB7XG4gICAgICBmaW5kOiAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cy9sb2NhbGVzL3poLUNOLmpzb24nLFxuICAgICAgcmVwbGFjZW1lbnQ6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2xvY2FsZXMvemgtQ04uanNvbicpLFxuICAgIH0sXG4gICAge1xuICAgICAgZmluZDogJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMvbG9jYWxlcy9lbi1VUy5qc29uJyxcbiAgICAgIHJlcGxhY2VtZW50OiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9sb2NhbGVzL2VuLVVTLmpzb24nKSxcbiAgICB9LFxuICAgIC8vIFx1NTE3Nlx1NEVENlx1NTIyQlx1NTQwRFx1RkYwOFx1NEVDRVx1NUJGOVx1OEM2MVx1OEY2Q1x1NjM2Mlx1NEUzQVx1NjU3MFx1N0VDNFx1NUY2Mlx1NUYwRlx1RkYwOVxuICAgIC4uLk9iamVjdC5lbnRyaWVzKGFsaWFzZXMpLm1hcCgoW2ZpbmQsIHJlcGxhY2VtZW50XSkgPT4gKHtcbiAgICAgIGZpbmQsXG4gICAgICByZXBsYWNlbWVudCxcbiAgICB9KSksXG4gIF07XG4gIFxuICByZXR1cm4ge1xuICAgIGFsaWFzOiBhbGlhc0FycmF5LFxuICAgIGRlZHVwZTogWyd2dWUnLCAndnVlLXJvdXRlcicsICdwaW5pYScsICdlbGVtZW50LXBsdXMnLCAnQGVsZW1lbnQtcGx1cy9pY29ucy12dWUnXSxcbiAgICBleHRlbnNpb25zOiBbJy5tanMnLCAnLmpzJywgJy5tdHMnLCAnLnRzJywgJy5qc3gnLCAnLnRzeCcsICcuanNvbicsICcudnVlJ10sXG4gICAgLy8gXHU3ODZFXHU0RkREIFZpdGUgXHU0RjE4XHU1MTQ4XHU0RjdGXHU3NTI4IHBhY2thZ2UuanNvbiBcdTc2ODQgZXhwb3J0cyBcdTkxNERcdTdGNkVcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTZERkJcdTUyQTAgJ2RldmVsb3BtZW50JyBcdTY3NjFcdTRFRjZcdUZGMENcdTc4NkVcdTRGRERcdTU3MjhcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFMkRcdTRGN0ZcdTc1MjhcdTZFOTBcdTc4MDFcbiAgICBjb25kaXRpb25zOiBbJ2RldmVsb3BtZW50JywgJ2ltcG9ydCcsICdtb2R1bGUnLCAnYnJvd3NlcicsICdkZWZhdWx0J10sXG4gIH07XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxtYW51YWwtY2h1bmtzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL21hbnVhbC1jaHVua3MudHNcIjsvKipcbiAqIG1hbnVhbENodW5rcyBcdTdCNTZcdTc1NjVcdTkxNERcdTdGNkVcbiAqIFx1NUI5QVx1NEU0OVx1NEVFM1x1NzgwMVx1NTIwNlx1NTI3Mlx1N0I1Nlx1NzU2NVx1RkYwQ1x1NUMwNlx1NEUwRFx1NTQwQ1x1N0M3Qlx1NTc4Qlx1NzY4NFx1NEVFM1x1NzgwMVx1NjI1M1x1NTMwNVx1NTIzMFx1NEUwRFx1NTQwQ1x1NzY4NCBjaHVua1xuICovXG5cbi8qKlxuICogXHU1RTk0XHU3NTI4XHU0RjdGXHU3NTI4XHU2MEM1XHU1MUI1XHU5MTREXHU3RjZFXG4gKiBcdTVCOUFcdTRFNDlcdTU0RUFcdTRFOUJcdTVFOTRcdTc1MjhcdTRGN0ZcdTc1MjhcdTU0RUFcdTRFOUJcdTVFOTNcdUZGMENcdTc1MjhcdTRFOEVcdTY3NjFcdTRFRjZcdTYyNTNcdTUzMDVcbiAqL1xuY29uc3QgQVBQX1VTQUdFOiBSZWNvcmQ8c3RyaW5nLCB7IGVjaGFydHM6IGJvb2xlYW47IG1vbmFjbzogYm9vbGVhbjsgdGhyZWU6IGJvb2xlYW4gfT4gPSB7XG4gICdsYXlvdXQtYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbiAgJ3N5c3RlbS1hcHAnOiB7IGVjaGFydHM6IHRydWUsIG1vbmFjbzogZmFsc2UsIHRocmVlOiBmYWxzZSB9LFxuICAnYWRtaW4tYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbiAgJ2ZpbmFuY2UtYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbiAgJ2xvZ2lzdGljcy1hcHAnOiB7IGVjaGFydHM6IHRydWUsIG1vbmFjbzogZmFsc2UsIHRocmVlOiBmYWxzZSB9LFxuICAncXVhbGl0eS1hcHAnOiB7IGVjaGFydHM6IHRydWUsIG1vbmFjbzogZmFsc2UsIHRocmVlOiBmYWxzZSB9LFxuICAncHJvZHVjdGlvbi1hcHAnOiB7IGVjaGFydHM6IHRydWUsIG1vbmFjbzogZmFsc2UsIHRocmVlOiBmYWxzZSB9LFxuICAnZW5naW5lZXJpbmctYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbiAgJ21vbml0b3ItYXBwJzogeyBlY2hhcnRzOiB0cnVlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbiAgJ21vYmlsZS1hcHAnOiB7IGVjaGFydHM6IGZhbHNlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfSxcbn07XG5cbi8qKlxuICogXHU1MjI0XHU2NUFEXHU2NjJGXHU1NDI2XHU0RTNBXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXG4gKi9cbmNvbnN0IGlzUHJvZHVjdGlvbiA9IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbic7XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBIG1hbnVhbENodW5rcyBcdTdCNTZcdTc1NjVcdTUxRkRcdTY1NzBcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NzUyOFx1NEU4RVx1OEZDN1x1NkVFNFx1NzI3OVx1NUI5QVx1NUU5NFx1NzUyOFx1NzY4NCBtYW5pZmVzdFx1RkYwOVxuICogQHJldHVybnMgbWFudWFsQ2h1bmtzIFx1NTFGRFx1NjU3MFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWFudWFsQ2h1bmtzU3RyYXRlZ3koYXBwTmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IGlzTGF5b3V0QXBwID0gYXBwTmFtZSA9PT0gJ2xheW91dC1hcHAnO1xuICBjb25zdCBpc01haW5BcHAgPSBhcHBOYW1lID09PSAnbWFpbi1hcHAnO1xuICBjb25zdCBhcHBVc2FnZSA9IEFQUF9VU0FHRVthcHBOYW1lXSB8fCB7IGVjaGFydHM6IGZhbHNlLCBtb25hY286IGZhbHNlLCB0aHJlZTogZmFsc2UgfTtcbiAgLy8gXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU0RTE0XHU5NzVFIGxheW91dC1hcHAgXHU2NUY2XHVGRjBDXHU1MTcxXHU0RUFCXHU4RDQ0XHU2RTkwXHU0RTBEXHU2MjUzXHU1MzA1XHVGRjA4XHU0RUNFIGxheW91dC1hcHAgXHU1MkEwXHU4RjdEXHVGRjA5XG4gIC8vIFx1NEY0NiBtYWluLWFwcCBcdTRGNUNcdTRFM0FcdTRFM0JcdTVFOTRcdTc1MjhcdUZGMENcdTk3MDBcdTg5ODFcdTc1MUZcdTYyMTBcdTgxRUFcdTVERjFcdTc2ODQgRVBTIFx1NjcwRFx1NTJBMVxuICBjb25zdCBza2lwU2hhcmVkUmVzb3VyY2VzID0gaXNQcm9kdWN0aW9uICYmICFpc0xheW91dEFwcCAmJiAhaXNNYWluQXBwO1xuXG4gIHJldHVybiAoaWQ6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCA9PiB7XG4gICAgLy8gMC4gRVBTIFx1NjcwRFx1NTJBMVx1NTM1NVx1NzJFQ1x1NjI1M1x1NTMwNVx1RkYwOFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NTE3MVx1NEVBQlx1RkYwQ1x1NUZDNVx1OTg3Qlx1NTcyOFx1NjcwMFx1NTI0RFx1OTc2Mlx1RkYwOVxuICAgIGlmIChpZC5pbmNsdWRlcygndmlydHVhbDplcHMnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnXFxcXDB2aXJ0dWFsOmVwcycpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdzZXJ2aWNlcy9lcHMnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnc2VydmljZXNcXFxcZXBzJykpIHtcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NzY4NFx1NUI1MFx1NUU5NFx1NzUyOFx1NEUwRFx1NUU5NFx1OEJFNVx1NTE4RFx1NTM1NVx1NzJFQ1x1NjJDNlx1NTFGQSBlcHMtc2VydmljZSBjaHVua1xuICAgICAgLy8gXHU1NDI2XHU1MjE5XHU1QjUwXHU1RTk0XHU3NTI4XHU1MTY1XHU1M0UzXHU0RjFBXHU0RUE3XHU3NTFGXHU1QkY5XHU4MUVBXHU4RUFCIC9hc3NldHMvZXBzLXNlcnZpY2UteHh4LmpzIFx1NzY4NFx1NUYxNVx1NzUyOFx1RkYwQ1x1NUJGQ1x1ODFGNFwiXHU1MTcxXHU0RUFCXHU2NzJBXHU3NTFGXHU2NTQ4ICsgNDA0XCJcdTk4Q0VcdTk2NjlcdTMwMDJcbiAgICAgIC8vIGxheW91dC1hcHAgXHU4RDFGXHU4RDIzXHU2M0QwXHU0RjlCXHU1MTcxXHU0RUFCIGVwcy1zZXJ2aWNlXHVGRjBDXHU1RTc2XHU1QzA2XHU2NzBEXHU1MkExXHU2MzAyXHU1MjMwIHdpbmRvdy5fX0FQUF9FUFNfU0VSVklDRV9fXHUzMDAyXG4gICAgICAvLyBtYWluLWFwcCBcdTRGNUNcdTRFM0FcdTRFM0JcdTVFOTRcdTc1MjhcdUZGMENcdTk3MDBcdTg5ODFcdTc1MUZcdTYyMTBcdTgxRUFcdTVERjFcdTc2ODQgRVBTIFx1NjcwRFx1NTJBMVx1RkYwOFx1NzJFQ1x1N0FDQlx1OEZEMFx1ODg0Q1x1NjVGNlx1NEUwRFx1NEY5RFx1OEQ1NiBsYXlvdXQtYXBwXHVGRjA5XG4gICAgICBpZiAoc2tpcFNoYXJlZFJlc291cmNlcykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgcmV0dXJuICdlcHMtc2VydmljZSc7XG4gICAgfVxuXG4gICAgLy8gMC4zLiBBdXRoIEFQSSBcdTUzNTVcdTcyRUNcdTYyNTNcdTUzMDVcdUZGMDhcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTUxNzFcdTRFQUJcdUZGMENcdTc1MzEgc3lzdGVtLWFwcCBcdTYzRDBcdTRGOUJcdUZGMDlcbiAgICBpZiAoaWQuaW5jbHVkZXMoJ21vZHVsZXMvYXBpLXNlcnZpY2VzL2F1dGgnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbW9kdWxlc1xcXFxhcGktc2VydmljZXNcXFxcYXV0aCcpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdhcGktc2VydmljZXMvYXV0aCcpKSB7XG4gICAgICByZXR1cm4gJ2F1dGgtYXBpJztcbiAgICB9XG5cbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFtZW51UmVnaXN0cnkgXHU0RjlEXHU4RDU2IFZ1ZVx1RkYwQ1x1NUZDNVx1OTg3Qlx1NTQ4QyB2ZW5kb3IgXHU0RTAwXHU4RDc3XHU2MjUzXHU1MzA1XHVGRjBDXHU0RTBEXHU4MEZEXHU1MzU1XHU3MkVDXHU2MjUzXHU1MzA1XHU1MjMwIG1lbnUtcmVnaXN0cnlcbiAgICAvLyBcdThGRDlcdTY4MzdcdTc4NkVcdTRGREQgVnVlIFx1NzY4NCByZWYgXHU1NzI4IG1lbnVSZWdpc3RyeSBcdTRGN0ZcdTc1MjhcdTRFNEJcdTUyNERcdTVERjJcdTdFQ0ZcdTUyMURcdTU5Q0JcdTUzMTZcbiAgICAvLyBcdTVGQzVcdTk4N0JcdTU3MjhcdTY4QzBcdTY3RTUgbGF5b3V0LWJyaWRnZSBcdTRFNEJcdTUyNERcdTY4QzBcdTY3RTVcdUZGMENcdTU2RTBcdTRFM0EgbGF5b3V0LWJyaWRnZSBcdTRGMUFcdTVCRkNcdTUxNjUgbWVudVJlZ2lzdHJ5XG4gICAgaWYgKGlkLmluY2x1ZGVzKCdwYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvc3RvcmUvbWVudVJlZ2lzdHJ5JykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMvc3RvcmUvbWVudVJlZ2lzdHJ5JykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ3NoYXJlZC1jb21wb25lbnRzL3N0b3JlL21lbnVSZWdpc3RyeScpKSB7XG4gICAgICAvLyBMYXlvdXQtQXBwXHVGRjFBXHU1QzA2IG1lbnVSZWdpc3RyeSBcdTYyNTNcdTUzMDVcdTUyMzAgdmVuZG9yXG4gICAgICAvLyBcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdUZGMDhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMDlcdUZGMUFcdTRFMERcdTYyNTNcdTUzMDVcdUZGMENcdTRFQ0UgbGF5b3V0LWFwcCBcdTUyQTBcdThGN0RcbiAgICAgIGlmIChza2lwU2hhcmVkUmVzb3VyY2VzKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ3ZlbmRvcic7XG4gICAgfVxuICAgIFxuICAgIC8vIDAuNS4gXHU4M0RDXHU1MzU1XHU3NkY4XHU1MTczXHU0RUUzXHU3ODAxXHU1MzU1XHU3MkVDXHU2MjUzXHU1MzA1XG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1QzA2XHU4M0RDXHU1MzU1XHU3NkY4XHU1MTczXHU3Njg0XHU0RUUzXHU3ODAxXHU2MjUzXHU1MzA1XHU1MjMwIG1lbnUtcmVnaXN0cnkgY2h1bmtcdUZGMENcdTRGNDYgbWVudVJlZ2lzdHJ5IFx1NjcyQ1x1OEVBQlx1NEY5RFx1OEQ1NiBWdWVcdUZGMENcdTk3MDBcdTg5ODFcdTY1M0VcdTU3MjggdmVuZG9yIFx1NEU0Qlx1NTQwRVxuICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQW1lbnVSZWdpc3RyeSBcdTRGN0ZcdTc1MjggVnVlIFx1NzY4NCByZWZcdUZGMENcdTYyNDBcdTRFRTVcdTRFMERcdTgwRkRcdTUzNTVcdTcyRUNcdTYyNTNcdTUzMDVcdUZGMENcdTVFOTRcdThCRTVcdTU0OEMgdmVuZG9yIFx1NEUwMFx1OEQ3N1xuICAgIC8vIFx1NTNFQVx1NUMwNiBtYW5pZmVzdCBcdTY1NzBcdTYzNkVcdTU0OEMgbGF5b3V0LWJyaWRnZSBcdTYyNTNcdTUzMDVcdTUyMzAgbWVudS1yZWdpc3RyeVxuICAgIC8vIFx1NEY0NiBsYXlvdXQtYnJpZGdlIFx1NEYxQVx1NUJGQ1x1NTE2NSBtZW51UmVnaXN0cnlcdUZGMENcdTYyNDBcdTRFRTUgbGF5b3V0LWJyaWRnZSBcdTRFNUZcdTVFOTRcdThCRTVcdTYyNTNcdTUzMDVcdTUyMzAgdmVuZG9yXG4gICAgaWYgKGlkLmluY2x1ZGVzKCdjb25maWdzL2xheW91dC1icmlkZ2UnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnQGJ0Yy9zaGFyZWQtY29yZS9jb25maWdzL2xheW91dC1icmlkZ2UnKSkge1xuICAgICAgLy8gTGF5b3V0LUFwcFx1RkYxQWxheW91dC1icmlkZ2UgXHU1QkZDXHU1MTY1IG1lbnVSZWdpc3RyeVx1RkYwQ1x1NjI0MFx1NEVFNVx1NEU1Rlx1NUU5NFx1OEJFNVx1NjI1M1x1NTMwNVx1NTIzMCB2ZW5kb3JcbiAgICAgIC8vIFx1NTE3Nlx1NEVENlx1NUU5NFx1NzUyOFx1RkYwOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1RkYwOVx1RkYxQVx1NEUwRFx1NjI1M1x1NTMwNVx1RkYwQ1x1NEVDRSBsYXlvdXQtYXBwIFx1NTJBMFx1OEY3RFxuICAgICAgaWYgKHNraXBTaGFyZWRSZXNvdXJjZXMpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAndmVuZG9yJztcbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IHN1YmFwcC1tYW5pZmVzdHNcdUZGMUFcdTUzRUFcdTUzMDVcdTU0MkJcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTc2ODQgbWFuaWZlc3RcbiAgICBpZiAoaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3N1YmFwcC1tYW5pZmVzdHMnKSB8fCBpZC5pbmNsdWRlcygnQGJ0Yy9zdWJhcHAtbWFuaWZlc3RzJykpIHtcbiAgICAgIC8vIFx1NjM5Mlx1OTY2NFx1NTE3Nlx1NEVENlx1NUU5NFx1NzUyOFx1NzY4NCBtYW5pZmVzdCBKU09OIFx1NjU4N1x1NEVGNlxuICAgICAgY29uc3Qgb3RoZXJBcHBzID0gWydmaW5hbmNlJywgJ2xvZ2lzdGljcycsICdzeXN0ZW0nLCAncXVhbGl0eScsICdlbmdpbmVlcmluZycsICdwcm9kdWN0aW9uJywgJ21vbml0b3InLCAnYWRtaW4nXTtcbiAgICAgIGNvbnN0IGN1cnJlbnRBcHBOYW1lID0gYXBwTmFtZS5yZXBsYWNlKCctYXBwJywgJycpO1xuICAgICAgY29uc3Qgc2hvdWxkRXhjbHVkZSA9IG90aGVyQXBwc1xuICAgICAgICAuZmlsdGVyKGFwcCA9PiBhcHAgIT09IGN1cnJlbnRBcHBOYW1lKVxuICAgICAgICAuc29tZShhcHAgPT4gaWQuaW5jbHVkZXMoYG1hbmlmZXN0cy8ke2FwcH0uanNvbmApKTtcbiAgICAgIFxuICAgICAgaWYgKHNob3VsZEV4Y2x1ZGUpIHtcbiAgICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU1RTk0XHU3NTI4XHU3Njg0IG1hbmlmZXN0XHVGRjBDXHU0RTBEXHU2MjUzXHU1MzA1XHU1MjMwIG1lbnUtcmVnaXN0cnlcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIC8vIExheW91dC1BcHBcdUZGMUFcdTUzRUFcdTYyNTNcdTUzMDVcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTc2ODQgbWFuaWZlc3QgXHU1NDhDXHU1MTcxXHU0RUFCXHU0RUUzXHU3ODAxXG4gICAgICAvLyBcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdUZGMDhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMDlcdUZGMUFcdTRFMERcdTYyNTNcdTUzMDVcdUZGMENcdTRFQ0UgbGF5b3V0LWFwcCBcdTUyQTBcdThGN0RcbiAgICAgIGlmIChza2lwU2hhcmVkUmVzb3VyY2VzKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ21lbnUtcmVnaXN0cnknO1xuICAgIH1cblxuICAgIC8vIDEuIFx1NzJFQ1x1N0FDQlx1NTkyN1x1NUU5M1x1RkYxQUVDaGFydHNcdUZGMDhcdTdFQUYgZWNoYXJ0cyBcdTU0OEMgenJlbmRlclx1RkYwQ1x1NEUwRFx1NTMwNVx1NTQyQiB2dWUtZWNoYXJ0c1x1RkYwOVxuICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2VjaGFydHMnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3pyZW5kZXInKSkge1xuICAgICAgLy8gTGF5b3V0LUFwcFx1RkYxQVx1NkI2M1x1NUUzOFx1NjI1M1x1NTMwNVxuICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU1RTk0XHU3NTI4XHVGRjFBXHU1OTgyXHU2NzlDXHU0RjdGXHU3NTI4IGVjaGFydHNcdUZGMENcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTRFMERcdTYyNTNcdTUzMDVcdUZGMDhcdTRFQ0UgbGF5b3V0LWFwcCBcdTUyQTBcdThGN0RcdUZGMDlcdUZGMENcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTZCNjNcdTVFMzhcdTYyNTNcdTUzMDVcbiAgICAgIGlmIChza2lwU2hhcmVkUmVzb3VyY2VzICYmIGFwcFVzYWdlLmVjaGFydHMpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NUU5NFx1NzUyOFx1NEUwRFx1NEY3Rlx1NzUyOCBlY2hhcnRzXHVGRjBDXHU0RTBEXHU2MjUzXHU1MzA1XG4gICAgICBpZiAoIWFwcFVzYWdlLmVjaGFydHMpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAnZWNoYXJ0cy12ZW5kb3InO1xuICAgIH1cblxuICAgIC8vIDIuIFx1NTE3Nlx1NEVENlx1NzJFQ1x1N0FDQlx1NTkyN1x1NUU5M1x1RkYwOFx1NUI4Q1x1NTE2OFx1NzJFQ1x1N0FDQlx1RkYwOS0gXHU2NzYxXHU0RUY2XHU2MjUzXHU1MzA1XG4gICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvbW9uYWNvLWVkaXRvcicpKSB7XG4gICAgICAvLyBcdTUzRUFcdTY3MDlcdTRGN0ZcdTc1MjhcdTc2ODRcdTVFOTRcdTc1MjhcdTYyNERcdTYyNTNcdTUzMDVcbiAgICAgIGlmICghYXBwVXNhZ2UubW9uYWNvKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ2xpYi1tb25hY28nO1xuICAgIH1cbiAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy90aHJlZScpKSB7XG4gICAgICAvLyBcdTUzRUFcdTY3MDlcdTRGN0ZcdTc1MjhcdTc2ODRcdTVFOTRcdTc1MjhcdTYyNERcdTYyNTNcdTUzMDVcbiAgICAgIGlmICghYXBwVXNhZ2UudGhyZWUpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAnbGliLXRocmVlJztcbiAgICB9XG5cbiAgICAvLyAzLiBWdWUgXHU3NTFGXHU2MDAxXHU1RTkzICsgXHU2MjQwXHU2NzA5XHU0RjlEXHU4RDU2IFZ1ZSBcdTc2ODRcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTMgKyBcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdTVFOTNcbiAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy92dWUnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3Z1ZS1yb3V0ZXInKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2VsZW1lbnQtcGx1cycpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvcGluaWEnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0B2dWV1c2UnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0BlbGVtZW50LXBsdXMnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3Z1ZS1lY2hhcnRzJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9kYXlqcycpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvbG9kYXNoJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AdnVlJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3NoYXJlZC1jb3JlJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3NoYXJlZC11dGlscycpKSB7XG4gICAgICAvLyBMYXlvdXQtQXBwXHVGRjFBXHU2QjYzXHU1RTM4XHU2MjUzXHU1MzA1XHU1MjMwIHZlbmRvclxuICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU1RTk0XHU3NTI4XHVGRjA4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjA5XHVGRjFBXHU0RTBEXHU2MjUzXHU1MzA1XHVGRjBDXHU0RUNFIGxheW91dC1hcHAgXHU1MkEwXHU4RjdEXG4gICAgICBpZiAoc2tpcFNoYXJlZFJlc291cmNlcykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgcmV0dXJuICd2ZW5kb3InO1xuICAgIH1cblxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzg2RVx1NEZERCB2aXRlLXBsdWdpbiBcdTc2RjhcdTUxNzNcdTRFRTNcdTc4MDFcdTRFNUZcdTg4QUJcdTYyNTNcdTUzMDVcdTUyMzAgdmVuZG9yXG4gICAgaWYgKGlkLmluY2x1ZGVzKCdwYWNrYWdlcy92aXRlLXBsdWdpbicpIHx8IGlkLmluY2x1ZGVzKCdAYnRjL3ZpdGUtcGx1Z2luJykpIHtcbiAgICAgIHJldHVybiAndmVuZG9yJztcbiAgICB9XG5cbiAgICAvLyA0LiBcdTYyNDBcdTY3MDlcdTUxNzZcdTRFRDZcdTRFMUFcdTUyQTFcdTRFRTNcdTc4MDFcdTU0MDhcdTVFNzZcdTUyMzBcdTRFM0JcdTY1ODdcdTRFRjZcbiAgICByZXR1cm4gdW5kZWZpbmVkOyAvLyBcdThGRDRcdTU2REUgdW5kZWZpbmVkIFx1ODg2OFx1NzkzQVx1NTQwOFx1NUU3Nlx1NTIzMFx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlxuICB9O1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxccm9sbHVwLWNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9yb2xsdXAtY29uZmlnLnRzXCI7LyoqXG4gKiBSb2xsdXAgXHU5MTREXHU3RjZFXHU2QTIxXHU1NzU3XG4gKiBcdTYzRDBcdTRGOUJcdTUxNkNcdTUxNzFcdTc2ODQgUm9sbHVwIFx1OTE0RFx1N0Y2RVxuICovXG5cbmltcG9ydCB0eXBlIHsgUm9sbHVwT3B0aW9ucywgV2FybmluZ0hhbmRsZXJXaXRoRGVmYXVsdCwgT3V0cHV0QXNzZXQsIFdhcm5pbmcgfSBmcm9tICdyb2xsdXAnO1xuaW1wb3J0IHsgY3JlYXRlTWFudWFsQ2h1bmtzU3RyYXRlZ3kgfSBmcm9tICcuL21hbnVhbC1jaHVua3MnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJvbGx1cENvbmZpZ09wdGlvbnMge1xuICAvKipcbiAgICogXHU4RDQ0XHU2RTkwXHU2NTg3XHU0RUY2XHU3NkVFXHU1RjU1XHVGRjA4XHU5RUQ4XHU4QkE0OiAnYXNzZXRzJ1x1RkYwOVxuICAgKi9cbiAgYXNzZXREaXI/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBjaHVuayBcdTY1ODdcdTRFRjZcdTc2RUVcdTVGNTVcdUZGMDhcdTlFRDhcdThCQTQ6IFx1NEUwRSBhc3NldERpciBcdTc2RjhcdTU0MENcdUZGMDlcbiAgICovXG4gIGNodW5rRGlyPzogc3RyaW5nO1xuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1QzA2IHNpbmdsZS1zcGEgXHU1NDhDIHFpYW5rdW4gXHU2ODA3XHU4QkIwXHU0RTNBXHU1OTE2XHU5MEU4XHU1RTkzXHVGRjA4XHU5RUQ4XHU4QkE0OiB0cnVlXHVGRjA5XG4gICAqIFx1NEUzQlx1NUU5NFx1NzUyOFx1RkYwOGxheW91dC1hcHBcdUZGMDlcdTVFOTRcdThCRTVcdThCQkVcdTdGNkVcdTRFM0EgZmFsc2VcdUZGMENcdTRFRTVcdTRGQkZcdTYyNTNcdTUzMDVcdThGRDlcdTRFOUJcdTVFOTNcbiAgICogXHU1QjUwXHU1RTk0XHU3NTI4XHU1RTk0XHU4QkU1XHU4QkJFXHU3RjZFXHU0RTNBIHRydWVcdUZGMENcdTkwN0ZcdTUxNERcdTkxQ0RcdTU5MERcdTYyNTNcdTUzMDVcbiAgICovXG4gIGV4dGVybmFsU2luZ2xlU3BhPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFx1NjYyRlx1NTQyNlx1NUMwNiBAYnRjIFx1NTMwNVx1NjgwN1x1OEJCMFx1NEUzQVx1NTkxNlx1OTBFOFx1NUU5M1x1RkYwOFx1OUVEOFx1OEJBNDogZmFsc2VcdUZGMDlcbiAgICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU2MjUzXHU1MzA1XHU4RkQ5XHU0RTlCXHU1RTkzXHVGRjBDXHU5MDdGXHU1MTREXHU4RkQwXHU4ODRDXHU2NUY2XHU2QTIxXHU1NzU3XHU4OUUzXHU2NzkwXHU5NUVFXHU5ODk4XG4gICAqL1xuICBleHRlcm5hbEJ0Y1BhY2thZ2VzPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFx1NjYyRlx1NTQyNlx1NUMwNiBAY29uZmlncyBcdTUzMDVcdTY4MDdcdThCQjBcdTRFM0FcdTU5MTZcdTkwRThcdTVFOTNcdUZGMDhcdTlFRDhcdThCQTQ6IHRydWVcdUZGMDlcbiAgICogXHU0RTNCXHU1RTk0XHU3NTI4XHVGRjA4bWFpbi1hcHBcdUZGMDlcdTVFOTRcdThCRTVcdThCQkVcdTdGNkVcdTRFM0EgZmFsc2VcdUZGMENcdTRFRTVcdTRGQkZcdTYyNTNcdTUzMDVcdThGRDlcdTRFOUJcdTVFOTNcbiAgICogXHU1QjUwXHU1RTk0XHU3NTI4XHU1RTk0XHU4QkU1XHU4QkJFXHU3RjZFXHU0RTNBIHRydWVcdUZGMENcdTRFQ0UgbGF5b3V0LWFwcCBcdTUyQTBcdThGN0RcdTUxNzFcdTRFQUJcdThENDRcdTZFOTBcbiAgICovXG4gIGV4dGVybmFsQ29uZmlnc1BhY2thZ2VzPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBcdTUyMUJcdTVFRkEgUm9sbHVwIFx1OTE0RFx1N0Y2RVxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXG4gKiBAcGFyYW0gb3B0aW9ucyBcdTkxNERcdTdGNkVcdTkwMDlcdTk4NzlcbiAqIEByZXR1cm5zIFJvbGx1cCBcdTkxNERcdTdGNkVcdTVCRjlcdThDNjFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJvbGx1cENvbmZpZyhhcHBOYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBSb2xsdXBDb25maWdPcHRpb25zKTogUm9sbHVwT3B0aW9ucyB7XG4gIGNvbnN0IG1hbnVhbENodW5rcyA9IGNyZWF0ZU1hbnVhbENodW5rc1N0cmF0ZWd5KGFwcE5hbWUpO1xuICBjb25zdCBhc3NldERpciA9IG9wdGlvbnM/LmFzc2V0RGlyIHx8ICdhc3NldHMnO1xuICBjb25zdCBjaHVua0RpciA9IG9wdGlvbnM/LmNodW5rRGlyIHx8IGFzc2V0RGlyO1xuICAvLyBcdTlFRDhcdThCQTRcdTVDMDYgc2luZ2xlLXNwYSBcdTU0OEMgcWlhbmt1biBcdTY4MDdcdThCQjBcdTRFM0EgZXh0ZXJuYWxcdUZGMDhcdTVCNTBcdTVFOTRcdTc1MjhcdUZGMDlcbiAgLy8gXHU0RTNCXHU1RTk0XHU3NTI4XHVGRjA4bGF5b3V0LWFwcFx1RkYwOVx1OTcwMFx1ODk4MVx1NjYzRVx1NUYwRlx1OEJCRVx1N0Y2RSBleHRlcm5hbFNpbmdsZVNwYTogZmFsc2VcbiAgLy8gQHRzLWlnbm9yZTogXHU1M0VGXHU4MEZEXHU1NzI4XHU2NzJBXHU2NzY1XHU0RjdGXHU3NTI4XG4gIGNvbnN0IF9leHRlcm5hbFNpbmdsZVNwYSA9IG9wdGlvbnM/LmV4dGVybmFsU2luZ2xlU3BhICE9PSBmYWxzZTtcbiAgLy8gXHU5RUQ4XHU4QkE0XHU1QzA2IEBidGMgXHU1MzA1XHU2MjUzXHU1MzA1XHU1MjMwXHU1RTk0XHU3NTI4XHU0RTJEXHVGRjA4XHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU2MjUzXHU1MzA1XHVGRjBDXHU5MDdGXHU1MTREXHU4RkQwXHU4ODRDXHU2NUY2XHU2QTIxXHU1NzU3XHU4OUUzXHU2NzkwXHU5NUVFXHU5ODk4XHVGRjA5XG4gIC8vIFx1NTk4Mlx1Njc5Q1x1OEJCRVx1N0Y2RVx1NEUzQSB0cnVlXHVGRjBDXHU1MjE5XHU2ODA3XHU4QkIwXHU0RTNBIGV4dGVybmFsXHVGRjA4XHU0RTBEXHU2M0E4XHU4MzUwXHVGRjA5XG4gIGNvbnN0IGV4dGVybmFsQnRjUGFja2FnZXMgPSBvcHRpb25zPy5leHRlcm5hbEJ0Y1BhY2thZ2VzID09PSB0cnVlO1xuICAvLyBcdTlFRDhcdThCQTRcdTVDMDYgQGNvbmZpZ3MgXHU1MzA1XHU2ODA3XHU4QkIwXHU0RTNBIGV4dGVybmFsXHVGRjA4XHU1QjUwXHU1RTk0XHU3NTI4XHU0RUNFIGxheW91dC1hcHAgXHU1MkEwXHU4RjdEXHVGRjA5XG4gIC8vIFx1NEUzQlx1NUU5NFx1NzUyOFx1RkYwOG1haW4tYXBwXHVGRjA5XHU5NzAwXHU4OTgxXHU2NjNFXHU1RjBGXHU4QkJFXHU3RjZFIGV4dGVybmFsQ29uZmlnc1BhY2thZ2VzOiBmYWxzZVx1RkYwQ1x1NEVFNVx1NEZCRlx1NjI1M1x1NTMwNVx1OEZEOVx1NEU5Qlx1NUU5M1xuICBjb25zdCBleHRlcm5hbENvbmZpZ3NQYWNrYWdlcyA9IG9wdGlvbnM/LmV4dGVybmFsQ29uZmlnc1BhY2thZ2VzICE9PSBmYWxzZTtcblxuICAvLyBcdTY3ODRcdTVFRkEgZXh0ZXJuYWwgXHU2NTcwXHU3RUM0XG4gIC8vIFJvbGx1cCBcdTc2ODQgZXh0ZXJuYWwgXHU2NTJGXHU2MzAxXHU1QjU3XHU3QjI2XHU0RTMyXHUzMDAxXHU2QjYzXHU1MjE5XHU4ODY4XHU4RkJFXHU1RjBGXHU2MjE2XHU1MUZEXHU2NTcwXG4gIGNvbnN0IGV4dGVybmFsOiAoc3RyaW5nIHwgUmVnRXhwIHwgKChpZDogc3RyaW5nKSA9PiBib29sZWFuKSlbXSA9IFtcbiAgICAvLyB2aXRlLXBsdWdpbiBcdTY2MkZcdTY3ODRcdTVFRkFcdTY1RjZcdTYzRDJcdTRFRjZcdUZGMENcdTRFMERcdTVFOTRcdThCRTVcdTg4QUJcdTYyNTNcdTUzMDVcdTUyMzBcdThGRDBcdTg4NENcdTY1RjZcdTRFRTNcdTc4MDFcdTRFMkRcbiAgICAnQGJ0Yy92aXRlLXBsdWdpbicsXG4gICAgL15AYnRjXFwvdml0ZS1wbHVnaW4vLFxuICAgIC8vIEBidGMgXHU1MzA1XHVGRjFBXHU2ODM5XHU2MzZFXHU5MTREXHU3RjZFXHU1MUIzXHU1QjlBXHU2NjJGXHU1NDI2XHU2ODA3XHU4QkIwXHU0RTNBIGV4dGVybmFsXG4gICAgLy8gXHU5RUQ4XHU4QkE0XHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU2MjUzXHU1MzA1XHU4RkQ5XHU0RTlCXHU1RTkzXHVGRjBDXHU5MDdGXHU1MTREXHU4RkQwXHU4ODRDXHU2NUY2XHU2QTIxXHU1NzU3XHU4OUUzXHU2NzkwXHU5NUVFXHU5ODk4XG4gICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBQ1NTIFx1NjU4N1x1NEVGNlx1NEUwRFx1NUU5NFx1OEJFNVx1ODhBQlx1NjgwN1x1OEJCMFx1NEUzQSBleHRlcm5hbFx1RkYwQ1x1NUU5NFx1OEJFNVx1ODhBQiBWaXRlIFx1NTkwNFx1NzQwNlx1NUU3Nlx1NjI1M1x1NTMwNVxuICAgIC4uLihleHRlcm5hbEJ0Y1BhY2thZ2VzID8gW1xuICAgICAgJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnLFxuICAgICAgLy8gXHU1MzM5XHU5MTREIEphdmFTY3JpcHQvVHlwZVNjcmlwdCBcdTZBMjFcdTU3NTdcdUZGMENcdTRGNDZcdTRFMERcdTUzMzlcdTkxNEQgQ1NTIFx1NjU4N1x1NEVGNlxuICAgICAgKGlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKGlkLnN0YXJ0c1dpdGgoJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMvJykpIHtcbiAgICAgICAgICAvLyBcdTYzOTJcdTk2NjQgQ1NTIFx1NjU4N1x1NEVGNlx1RkYwOC5jc3MsIC5zY3NzLCAuc2FzcywgLmxlc3MgXHU3QjQ5XHVGRjA5XG4gICAgICAgICAgcmV0dXJuICEvXFwuKGNzc3xzY3NzfHNhc3N8bGVzc3xzdHlsKSQvaS50ZXN0KGlkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUnLFxuICAgICAgLy8gXHU1MzM5XHU5MTREIEphdmFTY3JpcHQvVHlwZVNjcmlwdCBcdTZBMjFcdTU3NTdcdUZGMENcdTRGNDZcdTRFMERcdTUzMzlcdTkxNEQgQ1NTIFx1NjU4N1x1NEVGNlxuICAgICAgKGlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKGlkLnN0YXJ0c1dpdGgoJ0BidGMvc2hhcmVkLWNvcmUvJykpIHtcbiAgICAgICAgICByZXR1cm4gIS9cXC4oY3NzfHNjc3N8c2Fzc3xsZXNzfHN0eWwpJC9pLnRlc3QoaWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sXG4gICAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnLFxuICAgICAgLy8gXHU1MzM5XHU5MTREIEphdmFTY3JpcHQvVHlwZVNjcmlwdCBcdTZBMjFcdTU3NTdcdUZGMENcdTRGNDZcdTRFMERcdTUzMzlcdTkxNEQgQ1NTIFx1NjU4N1x1NEVGNlxuICAgICAgKGlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKGlkLnN0YXJ0c1dpdGgoJ0BidGMvc2hhcmVkLXV0aWxzLycpKSB7XG4gICAgICAgICAgcmV0dXJuICEvXFwuKGNzc3xzY3NzfHNhc3N8bGVzc3xzdHlsKSQvaS50ZXN0KGlkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgIF0gOiBbXSksXG4gICAgLy8gQGJ0Yy9zaGFyZWQtY29yZS9jb25maWdzIFx1NTMwNVx1RkYxQVx1NjgzOVx1NjM2RVx1OTE0RFx1N0Y2RVx1NTFCM1x1NUI5QVx1NjYyRlx1NTQyNlx1NjgwN1x1OEJCMFx1NEUzQSBleHRlcm5hbFxuICAgIC8vIFx1NEUzQlx1NUU5NFx1NzUyOFx1RkYwOG1haW4tYXBwXHVGRjA5XHU1RTk0XHU4QkU1XHU2MjUzXHU1MzA1XHU4RkQ5XHU0RTlCXHU1RTkzXHVGRjBDXHU1QjUwXHU1RTk0XHU3NTI4XHU0RUNFIGxheW91dC1hcHAgXHU1MkEwXHU4RjdEXG4gICAgLi4uKGV4dGVybmFsQ29uZmlnc1BhY2thZ2VzID8gW1xuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUvY29uZmlncy9sYXlvdXQtYnJpZGdlJyxcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MvdW5pZmllZC1lbnYtY29uZmlnJyxcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MvYXBwLXNjYW5uZXInLFxuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUvY29uZmlncy9hcHAtZW52LmNvbmZpZycsXG4gICAgICAvXkBidGNcXC9zaGFyZWQtY29yZVxcL2NvbmZpZ3NcXC8uKi8sXG4gICAgXSA6IFtdKSxcbiAgXTtcblxuICByZXR1cm4ge1xuICAgIHByZXNlcnZlRW50cnlTaWduYXR1cmVzOiAnc3RyaWN0JyxcbiAgICBvbndhcm4od2FybmluZzogV2FybmluZywgd2FybjogV2FybmluZ0hhbmRsZXJXaXRoRGVmYXVsdCkge1xuICAgICAgLy8gXHU4RkM3XHU2RUU0XHU1REYyXHU3N0U1XHU4QjY2XHU1NDRBXG4gICAgICBpZiAod2FybmluZy5jb2RlID09PSAnTU9EVUxFX0xFVkVMX0RJUkVDVElWRScgfHxcbiAgICAgICAgICAod2FybmluZy5tZXNzYWdlICYmIHR5cGVvZiB3YXJuaW5nLm1lc3NhZ2UgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgIHdhcm5pbmcubWVzc2FnZS5pbmNsdWRlcygnZHluYW1pY2FsbHkgaW1wb3J0ZWQnKSAmJlxuICAgICAgICAgICB3YXJuaW5nLm1lc3NhZ2UuaW5jbHVkZXMoJ3N0YXRpY2FsbHkgaW1wb3J0ZWQnKSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHdhcm5pbmcubWVzc2FnZSAmJiB0eXBlb2Ygd2FybmluZy5tZXNzYWdlID09PSAnc3RyaW5nJyAmJiB3YXJuaW5nLm1lc3NhZ2UuaW5jbHVkZXMoJ0dlbmVyYXRlZCBhbiBlbXB0eSBjaHVuaycpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NEUwRFx1NTE4RFx1OEZDN1x1NkVFNCBAYnRjIFx1NTMwNVx1NzY4NFx1OEI2Nlx1NTQ0QVx1RkYwQ1x1NTZFMFx1NEUzQVx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NjI1M1x1NTMwNVx1OEZEOVx1NEU5Qlx1NTMwNVx1RkYwQ1x1NEUwRFx1NUU5NFx1OEJFNVx1NjcwOSB1bnJlc29sdmVkIGltcG9ydCBcdThCNjZcdTU0NEFcbiAgICAgIHdhcm4od2FybmluZyk7XG4gICAgfSxcbiAgICBvdXRwdXQ6IHtcbiAgICAgIGZvcm1hdDogJ2VzbScsXG4gICAgICBpbmxpbmVEeW5hbWljSW1wb3J0czogZmFsc2UsXG4gICAgICBtYW51YWxDaHVua3MsXG4gICAgICBwcmVzZXJ2ZU1vZHVsZXM6IGZhbHNlLFxuICAgICAgZ2VuZXJhdGVkQ29kZToge1xuICAgICAgICBjb25zdEJpbmRpbmdzOiBmYWxzZSwgLy8gXHU0RTBEXHU0RjdGXHU3NTI4IGNvbnN0XHVGRjBDXHU5MDdGXHU1MTREIFREWiBcdTk1RUVcdTk4OThcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkREXHU3NTU5XHU1QkZDXHU1MUZBXHU1NDBEXHU3OUYwXHVGRjBDXHU5MDdGXHU1MTREXHU4OEFCXHU1MzhCXHU3RjI5XHU2MjEwXHU1MzU1XHU1QjU3XHU2QkNEXG4gICAgICAgIC8vIFx1OEZEOVx1NTNFRlx1NEVFNVx1OTYzMlx1NkI2MiBcImRvZXMgbm90IHByb3ZpZGUgYW4gZXhwb3J0IG5hbWVkICdjJ1wiIFx1OTUxOVx1OEJFRlxuICAgICAgICBwcmVzZXJ2ZU1vZHVsZXNSb290OiB1bmRlZmluZWQsXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzg2RVx1NEZERFx1NUJGOVx1OEM2MVx1NUM1RVx1NjAyN1x1NEU0Qlx1OTVGNFx1NjcwOVx1NkI2M1x1Nzg2RVx1NzY4NFx1NTIwNlx1OTY5NFx1N0IyNlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NUI1N1x1N0IyNlx1NEUzMlx1NTQ4Q1x1NjU3MFx1NUI1N1x1OEZERVx1NjNBNVxuICAgICAgICBvYmplY3RTaG9ydGhhbmQ6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTVCRjlcdThDNjFcdTdCODBcdTUxOTlcdUZGMENcdTc4NkVcdTRGRERcdTVDNUVcdTYwMjdcdTU0MERcdTU0OENcdTUwM0NcdTkwRkRcdTVCOENcdTY1NzRcbiAgICAgICAgYXJyb3dGdW5jdGlvbnM6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTdCQURcdTU5MzRcdTUxRkRcdTY1NzBcdUZGMENcdTRGN0ZcdTc1MjhcdTY2NkVcdTkwMUFcdTUxRkRcdTY1NzBcdUZGMENcdTY2RjRcdTVCODlcdTUxNjhcbiAgICAgIH0sXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc4NkVcdTRGRERcdTVCRkNcdTUxRkFcdTU0MERcdTc5RjBcdTRFMERcdTg4QUJcdTUzOEJcdTdGMjlcbiAgICAgIC8vIFx1ODY3RFx1NzEzNiB0ZXJzZXIgXHU3Njg0IG1hbmdsZSBcdTVERjJcdTc5ODFcdTc1MjhcdUZGMENcdTRGNDYgUm9sbHVwIFx1NzY4NFx1NEVFM1x1NzgwMVx1NzUxRlx1NjIxMFx1NEU1Rlx1NTNFRlx1ODBGRFx1NTM4Qlx1N0YyOVx1NUJGQ1x1NTFGQVx1NTQwRFx1NzlGMFxuICAgICAgY2h1bmtGaWxlTmFtZXM6IGAke2NodW5rRGlyfS9bbmFtZV0tW2hhc2hdLmpzYCxcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlx1NEY3Rlx1NzUyOFx1N0EzM1x1NUI5QVx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NEUwRFx1NUUyNiBoYXNoXHVGRjA5XHVGRjBDXHU5NjREXHU0RjRFXHU5MEU4XHU3RjcyL1x1N0YxM1x1NUI1OFx1NUJGQ1x1ODFGNFx1NzY4NCBpbmRleC14eHguanMgNDA0IFx1OThDRVx1OTY2OVxuICAgICAgLy8gTmdpbnggXHU1QkY5XHU4QkU1XHU2NTg3XHU0RUY2XHU1RTk0XHU5MTREXHU3RjZFIG5vLWNhY2hlXHVGRjFCXHU1MTc2XHU0RUQ2IGNodW5rIFx1NEVDRFx1NEZERFx1NjMwMSBoYXNoICsgaW1tdXRhYmxlXG4gICAgICBlbnRyeUZpbGVOYW1lczogYCR7Y2h1bmtEaXJ9L1tuYW1lXS5qc2AsXG4gICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbzogT3V0cHV0QXNzZXQpID0+IHtcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBZmF2aWNvbi5pY28gXHU1NDhDIGljb25zIFx1NzZFRVx1NUY1NVx1NzY4NFx1NjU4N1x1NEVGNlx1NEUwRFx1NUU5NFx1OEJFNVx1NkRGQlx1NTJBMCBoYXNoXHVGRjBDXHU1RTk0XHU4QkU1XHU0RkREXHU2MzAxXHU1NzI4XHU1MzlGXHU0RjREXHU3RjZFXG4gICAgICAgIC8vIFx1OEZEOVx1NEU5Qlx1NjU4N1x1NEVGNlx1NEYxQVx1ODhBQiBwdWJsaWNEaXIgXHU2MjE2IGNvcHlJY29uc1BsdWdpbiBcdTU5MERcdTUyMzZcdTUyMzBcdTZCNjNcdTc4NkVcdTc2ODRcdTRGNERcdTdGNkVcbiAgICAgICAgaWYgKGFzc2V0SW5mby5uYW1lPy5pbmNsdWRlcygnZmF2aWNvbicpIHx8IGFzc2V0SW5mby5uYW1lPy5pbmNsdWRlcygnaWNvbnMvJykpIHtcbiAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTY1ODdcdTRFRjZcdTU0MERcdTUzMDVcdTU0MkIgZmF2aWNvbiBcdTYyMTYgaWNvbnNcdUZGMENcdTRGRERcdTYzMDFcdTUzOUZcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTRFMERcdTU0MkIgaGFzaFx1RkYwOVxuICAgICAgICAgIC8vIFx1NEY0Nlx1OEZEOVx1NzlDRFx1NjBDNVx1NTFCNVx1NUU5NFx1OEJFNVx1NUY4OFx1NUMxMVx1RkYwQ1x1NTZFMFx1NEUzQSBwdWJsaWNEaXIgXHU0RjFBXHU3NkY0XHU2M0E1XHU1OTBEXHU1MjM2XHU4RkQ5XHU0RTlCXHU2NTg3XHU0RUY2XG4gICAgICAgICAgcmV0dXJuIGFzc2V0SW5mby5uYW1lIHx8IGAke2Fzc2V0RGlyfS9bbmFtZV0uW2V4dF1gO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhc3NldEluZm8ubmFtZT8uZW5kc1dpdGgoJy5jc3MnKSkge1xuICAgICAgICAgIHJldHVybiBgJHthc3NldERpcn0vW25hbWVdLVtoYXNoXS5jc3NgO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBgJHthc3NldERpcn0vW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICB9LFxuICAgIH0sXG4gICAgZXh0ZXJuYWwsXG4gIH07XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxjbGVhbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9jbGVhbi50c1wiOy8qKlxuICogXHU2RTA1XHU3NDA2XHU2Nzg0XHU1RUZBXHU3NkVFXHU1RjU1XHU2M0QyXHU0RUY2XG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1tjbGVhbl0nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW2NsZWFuXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW2NsZWFuXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbY2xlYW5dJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcm1TeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5cbi8qKlxuICogXHU1Qjg5XHU1MTY4XHU4RjkzXHU1MUZBXHU2NUU1XHU1RkQ3XHVGRjA4XHU5MDdGXHU1MTREIFdpbmRvd3MgXHU2M0E3XHU1MjM2XHU1M0YwXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XG4gKi9cbmZ1bmN0aW9uIHNhZmVMb2cobWVzc2FnZTogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgY29uc29sZS5pbmZvKG1lc3NhZ2UpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIFx1NTk4Mlx1Njc5Q1x1OEY5M1x1NTFGQVx1NTkzMVx1OEQyNVx1RkYwOFx1NTNFRlx1ODBGRFx1NjYyRlx1N0YxNlx1NzgwMVx1OTVFRVx1OTg5OFx1RkYwOVx1RkYwQ1x1NEY3Rlx1NzUyOFx1N0VBRlx1NjU4N1x1NjcyQ1x1OEY5M1x1NTFGQVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb250cm9sLXJlZ2V4XG4gICAgY29uc29sZS5pbmZvKG1lc3NhZ2UucmVwbGFjZSgvW15cXHgwMC1cXHg3Rl0vZywgJycpKTtcbiAgfVxufVxuXG4vKipcbiAqIFx1NUI4OVx1NTE2OFx1OEY5M1x1NTFGQVx1OEI2Nlx1NTQ0QVx1RkYwOFx1OTA3Rlx1NTE0RCBXaW5kb3dzIFx1NjNBN1x1NTIzNlx1NTNGMFx1N0YxNlx1NzgwMVx1OTVFRVx1OTg5OFx1RkYwOVxuICovXG5mdW5jdGlvbiBzYWZlV2FybihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gXHU1OTgyXHU2NzlDXHU4RjkzXHU1MUZBXHU1OTMxXHU4RDI1XHVGRjA4XHU1M0VGXHU4MEZEXHU2NjJGXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XHVGRjBDXHU0RjdGXHU3NTI4XHU3RUFGXHU2NTg3XHU2NzJDXHU4RjkzXHU1MUZBXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnRyb2wtcmVnZXhcbiAgICBjb25zb2xlLndhcm4obWVzc2FnZS5yZXBsYWNlKC9bXlxceDAwLVxceDdGXS9nLCAnJykpO1xuICB9XG59XG5cbi8qKlxuICogXHU2RTA1XHU3NDA2IGRpc3QgXHU3NkVFXHU1RjU1XHU2M0QyXHU0RUY2XG4gKiBcdTZERkJcdTUyQTBcdTkxQ0RcdThCRDVcdTY3M0FcdTUyMzZcdTRFRTVcdTU5MDRcdTc0MDYgV2luZG93cyBcdTRFMEFcdTc2ODRcdTY1ODdcdTRFRjZcdTk1MDFcdTVCOUFcdTk1RUVcdTk4OThcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuRGlzdFBsdWdpbihhcHBEaXI6IHN0cmluZyk6IFBsdWdpbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2NsZWFuLWRpc3QtcGx1Z2luJyxcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgY29uc3QgZGlzdERpciA9IHJlc29sdmUoYXBwRGlyLCAnZGlzdCcpO1xuICAgICAgaWYgKGV4aXN0c1N5bmMoZGlzdERpcikpIHtcbiAgICAgICAgc2FmZUxvZygnW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTZFMDVcdTc0MDZcdTY1RTdcdTc2ODQgZGlzdCBcdTc2RUVcdTVGNTUuLi4nKTtcblxuICAgICAgICAvLyBcdTZERkJcdTUyQTBcdTkxQ0RcdThCRDVcdTY3M0FcdTUyMzZcdUZGMENcdTU5MDRcdTc0MDYgV2luZG93cyBcdTRFMEFcdTc2ODRcdTY1ODdcdTRFRjZcdTk1MDFcdTVCOUFcdTk1RUVcdTk4OThcbiAgICAgICAgbGV0IHJldHJpZXMgPSA1OyAvLyBcdTU4OUVcdTUyQTBcdTkxQ0RcdThCRDVcdTZCMjFcdTY1NzBcbiAgICAgICAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcblxuICAgICAgICB3aGlsZSAocmV0cmllcyA+IDAgJiYgIXN1Y2Nlc3MpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcm1TeW5jKGRpc3REaXIsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICAgICAgc2FmZUxvZygnW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTI3MDUgZGlzdCBcdTc2RUVcdTVGNTVcdTVERjJcdTZFMDVcdTc0MDYnKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICByZXRyaWVzLS07XG4gICAgICAgICAgICBpZiAoZXJyb3IuY29kZSA9PT0gJ0VCVVNZJyB8fCBlcnJvci5jb2RlID09PSAnRU5PVEVNUFRZJykge1xuICAgICAgICAgICAgICBpZiAocmV0cmllcyA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCB3YWl0VGltZSA9ICg2IC0gcmV0cmllcykgKiAyMDA7IC8vIFx1OTAxMlx1NTg5RVx1N0I0OVx1NUY4NVx1NjVGNlx1OTVGNFx1RkYxQTIwMG1zLCA0MDBtcywgNjAwbXMsIDgwMG1zLCAxMDAwbXNcbiAgICAgICAgICAgICAgICBzYWZlV2FybihgW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTI2QTBcdUZFMEYgIFx1NzZFRVx1NUY1NVx1ODhBQlx1NTM2MFx1NzUyOFx1RkYwQ1x1N0I0OVx1NUY4NSAke3dhaXRUaW1lfW1zIFx1NTQwRVx1OTFDRFx1OEJENS4uLiAoXHU1MjY5XHU0RjU5ICR7cmV0cmllc30gXHU2QjIxKWApO1xuICAgICAgICAgICAgICAgIC8vIFx1NTQwQ1x1NkI2NVx1N0I0OVx1NUY4NVxuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICB3aGlsZSAoRGF0ZS5ub3coKSAtIHN0YXJ0IDwgd2FpdFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFx1NUZEOVx1N0I0OVx1NUY4NVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzYWZlV2FybignW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTI3NEMgXHU2NUUwXHU2Q0Q1XHU2RTA1XHU3NDA2IGRpc3QgXHU3NkVFXHU1RjU1XHVGRjA4XHU1M0VGXHU4MEZEXHU4OEFCXHU1MTc2XHU0RUQ2XHU3QTBCXHU1RThGXHU1MzYwXHU3NTI4XHVGRjA5Jyk7XG4gICAgICAgICAgICAgICAgc2FmZVdhcm4oJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHU2M0QwXHU3OTNBXHVGRjFBXHU4QkY3XHU1MTczXHU5NUVEXHU1M0VGXHU4MEZEXHU1MzYwXHU3NTI4XHU2NTg3XHU0RUY2XHU3Njg0XHU3QTBCXHU1RThGXHVGRjA4XHU1OTgyXHU2NTg3XHU0RUY2XHU4RDQ0XHU2RTkwXHU3QkExXHU3NDA2XHU1NjY4XHUzMDAxXHU3RjE2XHU4RjkxXHU1NjY4XHU3QjQ5XHVGRjA5Jyk7XG4gICAgICAgICAgICAgICAgc2FmZVdhcm4oJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHU2MjE2XHU4MDA1XHU2MjRCXHU1MkE4XHU1MjIwXHU5NjY0IGRpc3QgXHU3NkVFXHU1RjU1XHU1NDBFXHU5MUNEXHU2NUIwXHU2Nzg0XHU1RUZBJyk7XG4gICAgICAgICAgICAgICAgc2FmZVdhcm4oJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHU2Nzg0XHU1RUZBXHU1QzA2XHU3RUU3XHU3RUVEXHVGRjBDXHU0RjQ2XHU2NUU3XHU3Njg0XHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU0RTBEXHU0RjFBXHU4OEFCXHU2RTA1XHU3NDA2XHVGRjBDXHU1M0VGXHU4MEZEXHU1QkZDXHU4MUY0XHU5MUNEXHU1OTBEXHU2NTg3XHU0RUY2Jyk7XG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7IC8vIFx1N0VFN1x1N0VFRFx1Njc4NFx1NUVGQVx1RkYwQ1x1NEUwRFx1OTYzQlx1NTg1RVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgICAgICAgIC8vIFx1NzZFRVx1NUY1NVx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1NEUwRFx1OTcwMFx1ODk4MVx1NkUwNVx1NzQwNlxuICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFx1NTE3Nlx1NEVENlx1OTUxOVx1OEJFRlx1RkYwQ1x1NzZGNFx1NjNBNVx1NjI5Qlx1NTFGQVxuICAgICAgICAgICAgICBzYWZlV2FybignW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTZFMDVcdTc0MDYgZGlzdCBcdTc2RUVcdTVGNTVcdTU5MzFcdThEMjU6ICcgKyBlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgc2FmZVdhcm4oJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHU2Nzg0XHU1RUZBXHU1QzA2XHU3RUU3XHU3RUVEXHVGRjBDXHU0RjQ2XHU2NUU3XHU3Njg0XHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU0RTBEXHU0RjFBXHU4OEFCXHU2RTA1XHU3NDA2Jyk7XG4gICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlOyAvLyBcdTdFRTdcdTdFRURcdTY3ODRcdTVFRkFcdUZGMENcdTRFMERcdTk2M0JcdTU4NUVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNhZmVMb2coJ1tjbGVhbi1kaXN0LXBsdWdpbl0gZGlzdCBcdTc2RUVcdTVGNTVcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTY1RTBcdTk3MDBcdTZFMDVcdTc0MDYnKTtcbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGNodW5rLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2NodW5rLnRzXCI7LyoqXG4gKiBDaHVuayBcdTc2RjhcdTUxNzNcdTYzRDJcdTRFRjZcbiAqIFx1NTMwNVx1NjJFQyBjaHVuayBcdTlBOENcdThCQzFcdTU0OENcdTRGMThcdTUzMTZcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW2NodW5rXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbY2h1bmtdJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbY2h1bmtdJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1tjaHVua10nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdHlwZSB7IE91dHB1dE9wdGlvbnMsIE91dHB1dEJ1bmRsZSB9IGZyb20gJ3JvbGx1cCc7XG5cbi8qKlxuICogXHU5QThDXHU4QkMxXHU2MjQwXHU2NzA5IGNodW5rIFx1NzUxRlx1NjIxMFx1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2h1bmtWZXJpZnlQbHVnaW4oKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY2h1bmstdmVyaWZ5LXBsdWdpbicsXG4gICAgd3JpdGVCdW5kbGUoX29wdGlvbnM6IE91dHB1dE9wdGlvbnMsIGJ1bmRsZTogT3V0cHV0QnVuZGxlKSB7XG4gICAgICBjb25zb2xlLmluZm8oJ1xcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTI3MDUgXHU3NTFGXHU2MjEwXHU3Njg0XHU2MjQwXHU2NzA5IGNodW5rIFx1NjU4N1x1NEVGNlx1RkYxQScpO1xuICAgICAgY29uc3QganNDaHVua3MgPSBPYmplY3Qua2V5cyhidW5kbGUpLmZpbHRlcihmaWxlID0+IGZpbGUuZW5kc1dpdGgoJy5qcycpKTtcbiAgICAgIGNvbnN0IGNzc0NodW5rcyA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuZmlsdGVyKGZpbGUgPT4gZmlsZS5lbmRzV2l0aCgnLmNzcycpKTtcblxuICAgICAgY29uc29sZS5pbmZvKGBcXG5KUyBjaHVua1x1RkYwOFx1NTE3MSAke2pzQ2h1bmtzLmxlbmd0aH0gXHU0RTJBXHVGRjA5XHVGRjFBYCk7XG4gICAgICBqc0NodW5rcy5mb3JFYWNoKGNodW5rID0+IGNvbnNvbGUuaW5mbyhgICAtICR7Y2h1bmt9YCkpO1xuXG4gICAgICBjb25zb2xlLmluZm8oYFxcbkNTUyBjaHVua1x1RkYwOFx1NTE3MSAke2Nzc0NodW5rcy5sZW5ndGh9IFx1NEUyQVx1RkYwOVx1RkYxQWApO1xuICAgICAgY3NzQ2h1bmtzLmZvckVhY2goY2h1bmsgPT4gY29uc29sZS5pbmZvKGAgIC0gJHtjaHVua31gKSk7XG5cbiAgICAgIGNvbnN0IGluZGV4Q2h1bmsgPSBqc0NodW5rcy5maW5kKGpzQ2h1bmsgPT4ganNDaHVuay5pbmNsdWRlcygnaW5kZXgtJykpO1xuICAgICAgY29uc3QgaW5kZXhTaXplID0gaW5kZXhDaHVuayA/IChidW5kbGVbaW5kZXhDaHVua10gYXMgYW55KT8uY29kZT8ubGVuZ3RoIHx8IDAgOiAwO1xuICAgICAgY29uc3QgaW5kZXhTaXplS0IgPSBpbmRleFNpemUgLyAxMDI0O1xuICAgICAgY29uc3QgaW5kZXhTaXplTUIgPSBpbmRleFNpemVLQiAvIDEwMjQ7XG5cbiAgICAgIGNvbnN0IG1pc3NpbmdSZXF1aXJlZENodW5rczogc3RyaW5nW10gPSBbXTtcbiAgICAgIGlmICghaW5kZXhDaHVuaykge1xuICAgICAgICBtaXNzaW5nUmVxdWlyZWRDaHVua3MucHVzaCgnaW5kZXgnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaGFzRXBzU2VydmljZSA9IGpzQ2h1bmtzLnNvbWUoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKCdlcHMtc2VydmljZScpKTtcbiAgICAgIGNvbnN0IGhhc0F1dGhBcGkgPSBqc0NodW5rcy5zb21lKGpzQ2h1bmsgPT4ganNDaHVuay5pbmNsdWRlcygnYXV0aC1hcGknKSk7XG4gICAgICBjb25zdCBoYXNFY2hhcnRzVmVuZG9yID0ganNDaHVua3Muc29tZShqc0NodW5rID0+IGpzQ2h1bmsuaW5jbHVkZXMoJ2VjaGFydHMtdmVuZG9yJykpO1xuICAgICAgY29uc3QgaGFzTGliTW9uYWNvID0ganNDaHVua3Muc29tZShqc0NodW5rID0+IGpzQ2h1bmsuaW5jbHVkZXMoJ2xpYi1tb25hY28nKSk7XG4gICAgICBjb25zdCBoYXNMaWJUaHJlZSA9IGpzQ2h1bmtzLnNvbWUoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKCdsaWItdGhyZWUnKSk7XG5cbiAgICAgIGNvbnNvbGUuaW5mbyhgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1RDgzRFx1RENFNiBcdTY3ODRcdTVFRkFcdTYwQzVcdTUxQjVcdUZGMDhcdTVFNzNcdTg4NjFcdTYyQzZcdTUyMDZcdTdCNTZcdTc1NjVcdUZGMDlcdUZGMUFgKTtcbiAgICAgIGlmIChpbmRleENodW5rKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgICBcdTI3MDUgaW5kZXg6IFx1NEUzQlx1NjU4N1x1NEVGNlx1RkYwOFZ1ZVx1NzUxRlx1NjAwMSArIEVsZW1lbnQgUGx1cyArIFx1NEUxQVx1NTJBMVx1NEVFM1x1NzgwMVx1RkYwQ1x1NEY1M1x1NzlFRn4ke2luZGV4U2l6ZU1CLnRvRml4ZWQoMil9TUIgXHU2NzJBXHU1MzhCXHU3RjI5XHVGRjBDZ3ppcFx1NTQwRX4keyhpbmRleFNpemVNQiAqIDAuMykudG9GaXhlZCgyKX1NQlx1RkYwOWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGAgIFx1Mjc0QyBcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhgKTtcbiAgICAgIH1cbiAgICAgIGlmIChoYXNFcHNTZXJ2aWNlKSBjb25zb2xlLmluZm8oYCAgXHUyNzA1IGVwcy1zZXJ2aWNlOiBFUFMgXHU2NzBEXHU1MkExXHVGRjA4XHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU1MTcxXHU0RUFCXHVGRjBDXHU1MzU1XHU3MkVDXHU2MjUzXHU1MzA1XHVGRjA5YCk7XG4gICAgICBpZiAoaGFzQXV0aEFwaSkgY29uc29sZS5pbmZvKGAgIFx1MjcwNSBhdXRoLWFwaTogQXV0aCBBUElcdUZGMDhcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTUxNzFcdTRFQUJcdUZGMENcdTUzNTVcdTcyRUNcdTYyNTNcdTUzMDVcdUZGMENcdTc1MzEgc3lzdGVtLWFwcCBcdTYzRDBcdTRGOUJcdUZGMDlgKTtcbiAgICAgIGlmIChoYXNFY2hhcnRzVmVuZG9yKSBjb25zb2xlLmluZm8oYCAgXHUyNzA1IGVjaGFydHMtdmVuZG9yOiBFQ2hhcnRzICsgenJlbmRlclx1RkYwOFx1NzJFQ1x1N0FDQlx1NTkyN1x1NUU5M1x1RkYwQ1x1NjVFMFx1NEY5RFx1OEQ1Nlx1OTVFRVx1OTg5OFx1RkYwOWApO1xuICAgICAgaWYgKGhhc0xpYk1vbmFjbykgY29uc29sZS5pbmZvKGAgIFx1MjcwNSBsaWItbW9uYWNvOiBNb25hY28gRWRpdG9yXHVGRjA4XHU3MkVDXHU3QUNCXHU1OTI3XHU1RTkzXHVGRjA5YCk7XG4gICAgICBpZiAoaGFzTGliVGhyZWUpIGNvbnNvbGUuaW5mbyhgICBcdTI3MDUgbGliLXRocmVlOiBUaHJlZS5qc1x1RkYwOFx1NzJFQ1x1N0FDQlx1NTkyN1x1NUU5M1x1RkYwOWApO1xuICAgICAgY29uc29sZS5pbmZvKGAgIFx1MjEzOVx1RkUwRiAgXHU0RTFBXHU1MkExXHU0RUUzXHU3ODAxXHU1NDhDIFZ1ZSBcdTc1MUZcdTYwMDFcdTU0MDhcdTVFNzZcdTUyMzBcdTRFM0JcdTY1ODdcdTRFRjZcdUZGMENcdTkwN0ZcdTUxNERcdTUyMURcdTU5Q0JcdTUzMTZcdTk4N0FcdTVFOEZcdTk1RUVcdTk4OThgKTtcblxuICAgICAgaWYgKG1pc3NpbmdSZXF1aXJlZENodW5rcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFxcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTI3NEMgXHU3RjNBXHU1OTMxXHU2ODM4XHU1RkMzIGNodW5rXHVGRjFBYCwgbWlzc2luZ1JlcXVpcmVkQ2h1bmtzKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBcdTY4MzhcdTVGQzMgY2h1bmsgXHU3RjNBXHU1OTMxXHVGRjBDXHU2Nzg0XHU1RUZBXHU1OTMxXHU4RDI1XHVGRjAxYCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmluZm8oYFxcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTI3MDUgXHU2ODM4XHU1RkMzIGNodW5rIFx1NTE2OFx1OTBFOFx1NUI1OFx1NTcyOGApO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTlBOENcdThCQzFcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTRFMDBcdTgxRjRcdTYwMjdcbiAgICAgIGNvbnNvbGUuaW5mbygnXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1RDgzRFx1REQwRCBcdTlBOENcdThCQzFcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTRFMDBcdTgxRjRcdTYwMjcuLi4nKTtcbiAgICAgIGNvbnN0IGFsbENodW5rRmlsZXMgPSBuZXcgU2V0KFsuLi5qc0NodW5rcywgLi4uY3NzQ2h1bmtzXSk7XG4gICAgICBjb25zdCByZWZlcmVuY2VkRmlsZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gICAgICBjb25zdCBtaXNzaW5nRmlsZXM6IEFycmF5PHsgZmlsZTogc3RyaW5nOyByZWZlcmVuY2VkQnk6IHN0cmluZ1tdOyBwb3NzaWJsZU1hdGNoZXM6IHN0cmluZ1tdIH0+ID0gW107XG5cbiAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICBjb25zdCBjaHVua0FueSA9IGNodW5rIGFzIGFueTtcbiAgICAgICAgaWYgKGNodW5rQW55LnR5cGUgPT09ICdjaHVuaycgJiYgY2h1bmtBbnkuY29kZSkge1xuICAgICAgICAgIGNvbnN0IGNvZGVXaXRob3V0Q29tbWVudHMgPSBjaHVua0FueS5jb2RlXG4gICAgICAgICAgICAucmVwbGFjZSgvXFwvXFwvLiokL2dtLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXC9cXCpbXFxzXFxTXSo/XFwqXFwvL2csICcnKTtcblxuICAgICAgICAgIGNvbnN0IGltcG9ydFBhdHRlcm4gPSAvaW1wb3J0XFxzKlxcKFxccypbXCInXShcXC8/YXNzZXRzXFwvW15cIidgXFxzXStcXC4oanN8bWpzfGNzcykpW1wiJ11cXHMqXFwpL2c7XG4gICAgICAgICAgbGV0IG1hdGNoO1xuICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSBpbXBvcnRQYXR0ZXJuLmV4ZWMoY29kZVdpdGhvdXRDb21tZW50cykpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCByZXNvdXJjZVBhdGggPSBtYXRjaFsxXTtcbiAgICAgICAgICAgIGlmICghcmVzb3VyY2VQYXRoKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlRmlsZSA9IHJlc291cmNlUGF0aC5yZXBsYWNlKC9eXFwvP2Fzc2V0c1xcLy8sICdhc3NldHMvJyk7XG4gICAgICAgICAgICBpZiAoIXJlZmVyZW5jZWRGaWxlcy5oYXMocmVzb3VyY2VGaWxlKSkge1xuICAgICAgICAgICAgICByZWZlcmVuY2VkRmlsZXMuc2V0KHJlc291cmNlRmlsZSwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVmZXJlbmNlZEZpbGVzLmdldChyZXNvdXJjZUZpbGUpIS5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB1cmxQYXR0ZXJuID0gL25ld1xccytVUkxcXHMqXFwoXFxzKltcIiddKFxcLz9hc3NldHNcXC9bXlwiJ2BcXHNdK1xcLihqc3xtanN8Y3NzKSlbXCInXS9nO1xuICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSB1cmxQYXR0ZXJuLmV4ZWMoY29kZVdpdGhvdXRDb21tZW50cykpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCByZXNvdXJjZVBhdGggPSBtYXRjaFsxXTtcbiAgICAgICAgICAgIGlmICghcmVzb3VyY2VQYXRoKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlRmlsZSA9IHJlc291cmNlUGF0aC5yZXBsYWNlKC9eXFwvP2Fzc2V0c1xcLy8sICdhc3NldHMvJyk7XG4gICAgICAgICAgICBpZiAoIXJlZmVyZW5jZWRGaWxlcy5oYXMocmVzb3VyY2VGaWxlKSkge1xuICAgICAgICAgICAgICByZWZlcmVuY2VkRmlsZXMuc2V0KHJlc291cmNlRmlsZSwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVmZXJlbmNlZEZpbGVzLmdldChyZXNvdXJjZUZpbGUpIS5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBbcmVmZXJlbmNlZEZpbGUsIHJlZmVyZW5jZWRCeV0gb2YgcmVmZXJlbmNlZEZpbGVzLmVudHJpZXMoKSkge1xuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHJlZmVyZW5jZWRGaWxlLnJlcGxhY2UoL15hc3NldHNcXC8vLCAnJyk7XG4gICAgICAgIGxldCBleGlzdHMgPSBhbGxDaHVua0ZpbGVzLmhhcyhmaWxlTmFtZSk7XG4gICAgICAgIGxldCBwb3NzaWJsZU1hdGNoZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgICBjb25zdCBtYXRjaCA9IGZpbGVOYW1lLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi0oW2EtekEtWjAtOV17OCx9KSk/XFwuKGpzfG1qc3xjc3MpJC8pO1xuICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgY29uc3QgWywgbmFtZVByZWZpeCwgLCBleHRdID0gbWF0Y2g7XG4gICAgICAgICAgICBwb3NzaWJsZU1hdGNoZXMgPSBBcnJheS5mcm9tKGFsbENodW5rRmlsZXMpLmZpbHRlcihjaHVua0ZpbGUgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBjaHVua01hdGNoID0gY2h1bmtGaWxlLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KSg/Oi0oW2EtekEtWjAtOV17OCx9KSk/XFwuKGpzfG1qc3xjc3MpJC8pO1xuICAgICAgICAgICAgICBpZiAoY2h1bmtNYXRjaCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IFssIGNodW5rTmFtZVByZWZpeCwgLCBjaHVua0V4dF0gPSBjaHVua01hdGNoO1xuICAgICAgICAgICAgICAgIHJldHVybiBjaHVua05hbWVQcmVmaXggPT09IG5hbWVQcmVmaXggJiYgY2h1bmtFeHQgPT09IGV4dDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGV4aXN0cyA9IHBvc3NpYmxlTWF0Y2hlcy5sZW5ndGggPiAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgICAgbWlzc2luZ0ZpbGVzLnB1c2goeyBmaWxlOiByZWZlcmVuY2VkRmlsZSwgcmVmZXJlbmNlZEJ5LCBwb3NzaWJsZU1hdGNoZXMgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1pc3NpbmdGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFxcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTI3NEMgXHU1M0QxXHU3M0IwICR7bWlzc2luZ0ZpbGVzLmxlbmd0aH0gXHU0RTJBXHU1RjE1XHU3NTI4XHU3Njg0XHU4RDQ0XHU2RTkwXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjFBYCk7XG4gICAgICAgIGlmIChtaXNzaW5nRmlsZXMubGVuZ3RoIDw9IDUpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oYFxcbltjaHVuay12ZXJpZnktcGx1Z2luXSBcdTI2QTBcdUZFMEYgIFx1OEI2Nlx1NTQ0QVx1RkYxQVx1NTNEMVx1NzNCMCAke21pc3NpbmdGaWxlcy5sZW5ndGh9IFx1NEUyQVx1NUYxNVx1NzUyOFx1NzY4NFx1OEQ0NFx1NkU5MFx1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1NEY0Nlx1N0VFN1x1N0VFRFx1Njc4NFx1NUVGQWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgXHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU0RTBEXHU0RTAwXHU4MUY0XHVGRjBDXHU2Nzg0XHU1RUZBXHU1OTMxXHU4RDI1XHVGRjAxXHU2NzA5ICR7bWlzc2luZ0ZpbGVzLmxlbmd0aH0gXHU0RTJBXHU1RjE1XHU3NTI4XHU3Njg0XHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4YCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1MjcwNSBcdTYyNDBcdTY3MDlcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTkwRkRcdTZCNjNcdTc4NkVcdUZGMDhcdTUxNzFcdTlBOENcdThCQzEgJHtyZWZlcmVuY2VkRmlsZXMuc2l6ZX0gXHU0RTJBXHU1RjE1XHU3NTI4XHVGRjA5YCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbi8qKlxuICogXHU0RjE4XHU1MzE2XHU0RUUzXHU3ODAxXHU1MjA2XHU1MjcyXHU2M0QyXHU0RUY2XHVGRjFBXHU1OTA0XHU3NDA2XHU3QTdBIGNodW5rXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHRpbWl6ZUNodW5rc1BsdWdpbigpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdvcHRpbWl6ZS1jaHVua3MnLFxuICAgIGdlbmVyYXRlQnVuZGxlKF9vcHRpb25zOiBPdXRwdXRPcHRpb25zLCBidW5kbGU6IE91dHB1dEJ1bmRsZSkge1xuICAgICAgY29uc3QgZW1wdHlDaHVua3M6IHN0cmluZ1tdID0gW107XG4gICAgICBjb25zdCBjaHVua1JlZmVyZW5jZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG5cbiAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICBjb25zdCBjaHVua0FueSA9IGNodW5rIGFzIGFueTtcbiAgICAgICAgaWYgKGNodW5rQW55LnR5cGUgPT09ICdjaHVuaycgJiYgY2h1bmtBbnkuY29kZSAmJiBjaHVua0FueS5jb2RlLnRyaW0oKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBlbXB0eUNodW5rcy5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2h1bmtBbnkudHlwZSA9PT0gJ2NodW5rJyAmJiBjaHVua0FueS5pbXBvcnRzKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBpbXBvcnRlZCBvZiBjaHVua0FueS5pbXBvcnRzKSB7XG4gICAgICAgICAgICBpZiAoIWNodW5rUmVmZXJlbmNlcy5oYXMoaW1wb3J0ZWQpKSB7XG4gICAgICAgICAgICAgIGNodW5rUmVmZXJlbmNlcy5zZXQoaW1wb3J0ZWQsIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNodW5rUmVmZXJlbmNlcy5nZXQoaW1wb3J0ZWQpIS5wdXNoKGZpbGVOYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGVtcHR5Q2h1bmtzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNodW5rc1RvUmVtb3ZlOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgY29uc3QgY2h1bmtzVG9LZWVwOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICBmb3IgKGNvbnN0IGVtcHR5Q2h1bmsgb2YgZW1wdHlDaHVua3MpIHtcbiAgICAgICAgY29uc3QgcmVmZXJlbmNlZEJ5ID0gY2h1bmtSZWZlcmVuY2VzLmdldChlbXB0eUNodW5rKSB8fCBbXTtcbiAgICAgICAgaWYgKHJlZmVyZW5jZWRCeS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uc3QgY2h1bmsgPSBidW5kbGVbZW1wdHlDaHVua107XG4gICAgICAgICAgaWYgKGNodW5rICYmIChjaHVuayBhcyBhbnkpLnR5cGUgPT09ICdjaHVuaycpIHtcbiAgICAgICAgICAgIChjaHVuayBhcyBhbnkpLmNvZGUgPSAnZXhwb3J0IHt9JztcbiAgICAgICAgICAgIGNodW5rc1RvS2VlcC5wdXNoKGVtcHR5Q2h1bmspO1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbb3B0aW1pemUtY2h1bmtzXSBcdTRGRERcdTc1NTlcdTg4QUJcdTVGMTVcdTc1MjhcdTc2ODRcdTdBN0EgY2h1bms6ICR7ZW1wdHlDaHVua30gKFx1ODhBQiAke3JlZmVyZW5jZWRCeS5sZW5ndGh9IFx1NEUyQSBjaHVuayBcdTVGMTVcdTc1MjhcdUZGMENcdTVERjJcdTZERkJcdTUyQTBcdTUzNjBcdTRGNERcdTdCMjYpYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNodW5rc1RvUmVtb3ZlLnB1c2goZW1wdHlDaHVuayk7XG4gICAgICAgICAgZGVsZXRlIGJ1bmRsZVtlbXB0eUNodW5rXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoY2h1bmtzVG9SZW1vdmUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtvcHRpbWl6ZS1jaHVua3NdIFx1NzlGQlx1OTY2NFx1NEU4NiAke2NodW5rc1RvUmVtb3ZlLmxlbmd0aH0gXHU0RTJBXHU2NzJBXHU4OEFCXHU1RjE1XHU3NTI4XHU3Njg0XHU3QTdBIGNodW5rOmAsIGNodW5rc1RvUmVtb3ZlKTtcbiAgICAgIH1cbiAgICAgIGlmIChjaHVua3NUb0tlZXAubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtvcHRpbWl6ZS1jaHVua3NdIFx1NEZERFx1NzU1OVx1NEU4NiAke2NodW5rc1RvS2VlcC5sZW5ndGh9IFx1NEUyQVx1ODhBQlx1NUYxNVx1NzUyOFx1NzY4NFx1N0E3QSBjaHVua1x1RkYwOFx1NURGMlx1NkRGQlx1NTJBMFx1NTM2MFx1NEY0RFx1N0IyNlx1RkYwOTpgLCBjaHVua3NUb0tlZXApO1xuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcdXJsLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VybC50c1wiOy8qKlxuICogVVJMIFx1NzZGOFx1NTE3M1x1NjNEMlx1NEVGNlxuICogXHU3ODZFXHU0RkREIGJhc2UgVVJMIFx1NkI2M1x1Nzg2RVxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbdXJsXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbdXJsXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW3VybF0nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW3VybF0nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdHlwZSB7IENodW5rSW5mbywgT3V0cHV0T3B0aW9ucywgT3V0cHV0QnVuZGxlIH0gZnJvbSAncm9sbHVwJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHsgcmVzb2x2ZSBhcyByZXNvbHZlUGF0aCwgZGlybmFtZSB9IGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xuY29uc3QgX19kaXJuYW1lID0gZGlybmFtZShfX2ZpbGVuYW1lKTtcblxuZnVuY3Rpb24gZ2V0QnVpbGRUaW1lc3RhbXBGb3JRdWVyeSgpOiBzdHJpbmcge1xuICAvLyBcdTRGMThcdTUxNDhcdTRGN0ZcdTc1MjhcdTUxNjhcdTkxQ0ZcdTY3ODRcdTVFRkFcdTgxMUFcdTY3MkNcdTZDRThcdTUxNjVcdTc2ODRcdTY1RjZcdTk1RjRcdTYyMzNcdUZGMDhcdTRFMEUgYWRkVmVyc2lvblBsdWdpbiBcdTRGRERcdTYzMDFcdTRFMDBcdTgxRjRcdUZGMDlcbiAgaWYgKHByb2Nlc3MuZW52LkJUQ19CVUlMRF9USU1FU1RBTVApIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnYuQlRDX0JVSUxEX1RJTUVTVEFNUDtcbiAgfVxuICAvLyBcdTUxNzZcdTZCMjFcdThCRkJcdTUzRDYgLmJ1aWxkLXRpbWVzdGFtcFx1RkYwOFx1NEUwRSBhZGRWZXJzaW9uUGx1Z2luIFx1NzY4NFx1NUI5RVx1NzNCMFx1NEUwMFx1ODFGNFx1RkYwOVxuICBjb25zdCB0aW1lc3RhbXBGaWxlID0gcmVzb2x2ZVBhdGgoX19kaXJuYW1lLCAnLi4vLi4vLi4vLmJ1aWxkLXRpbWVzdGFtcCcpO1xuICBpZiAoZXhpc3RzU3luYyh0aW1lc3RhbXBGaWxlKSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB0cyA9IHJlYWRGaWxlU3luYyh0aW1lc3RhbXBGaWxlLCAndXRmLTgnKS50cmltKCk7XG4gICAgICBpZiAodHMpIHJldHVybiB0cztcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIGlnbm9yZVxuICAgIH1cbiAgfVxuICAvLyBcdTY3MDBcdTU0MEVcdTUxNUNcdTVFOTVcdUZGMUFcdTc1MUZcdTYyMTBcdTRFMDBcdTRFMkFcdUZGMDhcdTRFMERcdTUxOTlcdTU2REVcdTY1ODdcdTRFRjZcdUZGMENcdTkwN0ZcdTUxNERcdTUyNkZcdTRGNUNcdTc1MjhcdUZGMDlcbiAgcmV0dXJuIERhdGUubm93KCkudG9TdHJpbmcoMzYpO1xufVxuXG4vKipcbiAqIFx1Nzg2RVx1NEZERCBiYXNlIFVSTCBcdTYzRDJcdTRFRjZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZUJhc2VVcmxQbHVnaW4oYmFzZVVybDogc3RyaW5nLCBhcHBIb3N0OiBzdHJpbmcsIGFwcFBvcnQ6IG51bWJlciwgbWFpbkFwcFBvcnQ6IHN0cmluZyk6IFBsdWdpbiB7XG4gIGNvbnN0IGlzUHJldmlld0J1aWxkID0gYmFzZVVybC5zdGFydHNXaXRoKCdodHRwJyk7XG4gIGNvbnN0IHFpYW5rdW5JbmRleEltcG9ydFJlZ2V4ID0gL2ltcG9ydFxcKChbJ1wiXSlcXC9hc3NldHNcXC8oaW5kZXh8bWFpbiktKFteJ1wiXSspXFwxXFwpL2c7XG4gIGNvbnN0IGJ1aWxkVGltZXN0YW1wID0gZ2V0QnVpbGRUaW1lc3RhbXBGb3JRdWVyeSgpO1xuICBjb25zdCBxaWFua3VuSW5kZXhJbXBvcnRJbkh0bWxSZWdleCA9IC9pbXBvcnRcXChcXHMqKFsnXCJdKShcXC9hc3NldHNcXC8oaW5kZXh8bWFpbiktW14nXCJdKylcXDFcXHMqXFwpL2c7XG5cbiAgLyoqXG4gICAqIFx1NEZFRVx1NTkwRCB2aXRlLXBsdWdpbi1xaWFua3VuIFx1NzUxRlx1NjIxMFx1NzY4NFx1NTMwNVx1ODhDNVx1NTY2OFx1OTFDQ1x1NEY3Rlx1NzUyOFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NCBpbXBvcnQoJy9hc3NldHMvaW5kZXgteHh4LmpzJykgXHU3Njg0XHU5NUVFXHU5ODk4XHVGRjFBXG4gICAqIC0gXHU1NzI4IHFpYW5rdW4gXHU2Qzk5XHU3QkIxXHU5MUNDXHVGRjBDXHU4RkQ5XHU0RjFBXHU2MzA5XHUyMDFDXHU1QkJGXHU0RTNCIG9yaWdpblx1MjAxRFx1ODlFM1x1Njc5MFx1RkYwQ1x1NUJGQ1x1ODFGNFx1NUI1MFx1NUU5NFx1NzUyOFx1NTE2NVx1NTNFMyBjaHVuayBcdTg4QUJcdTk1MTlcdThCRUZcdThCRjdcdTZDNDJcdTUyMzAgbGF5b3V0IFx1NTdERlx1NTQwRFxuICAgKiAtIFx1OEZEOVx1OTFDQ1x1NjUzOVx1NEUzQVx1RkYxQVx1NEYxOFx1NTE0OFx1NEY3Rlx1NzUyOCBxaWFua3VuIFx1NkNFOFx1NTE2NVx1NzY4NCBfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fX1x1RkYwOFx1OTAxQVx1NUUzOFx1NEUzQVx1NUI1MFx1NUU5NFx1NzUyOCBvcmlnaW5cdUZGMDlcdUZGMENcdTU0MjZcdTUyMTlcdTU2REVcdTkwMDBcdTUyMzAgd2luZG93LmxvY2F0aW9uLm9yaWdpblxuICAgKi9cbiAgZnVuY3Rpb24gcGF0Y2hRaWFua3VuSW5kZXhJbXBvcnRzKGNvZGU6IHN0cmluZyk6IHsgY29kZTogc3RyaW5nOyBtb2RpZmllZDogYm9vbGVhbiB9IHtcbiAgICBpZiAoIXFpYW5rdW5JbmRleEltcG9ydFJlZ2V4LnRlc3QoY29kZSkpIHtcbiAgICAgIHJldHVybiB7IGNvZGUsIG1vZGlmaWVkOiBmYWxzZSB9O1xuICAgIH1cbiAgICBxaWFua3VuSW5kZXhJbXBvcnRSZWdleC5sYXN0SW5kZXggPSAwO1xuXG4gICAgY29uc3QgaGVscGVyTmFtZSA9ICdfX2J0Y1FpYW5rdW5Bc3NldE9yaWdpbic7XG4gICAgY29uc3QgdHNOYW1lID0gJ19fYnRjQnVpbGRWJztcbiAgICBjb25zdCBoZWxwZXJEZWNsID1cbiAgICAgIGBjb25zdCAke2hlbHBlck5hbWV9PSgoKT0+e3RyeXtjb25zdCBwPXdpbmRvdyYmd2luZG93Ll9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fO2AgK1xuICAgICAgYGlmKHAmJnR5cGVvZiBwPT09J3N0cmluZycpe2NvbnN0IHM9cC5yZXBsYWNlKC9cXFxcLyQvLCcnKTtgICtcbiAgICAgIGBpZihzLnN0YXJ0c1dpdGgoJ2h0dHAnKXx8cy5zdGFydHNXaXRoKCcvLycpKXJldHVybiBzO2AgK1xuICAgICAgYHJldHVybiAod2luZG93LmxvY2F0aW9uJiZ3aW5kb3cubG9jYXRpb24ub3JpZ2luP3dpbmRvdy5sb2NhdGlvbi5vcmlnaW46JycpK3M7fWAgK1xuICAgICAgYH1jYXRjaHt9cmV0dXJuICh3aW5kb3cubG9jYXRpb24mJndpbmRvdy5sb2NhdGlvbi5vcmlnaW4pP3dpbmRvdy5sb2NhdGlvbi5vcmlnaW46Jyc7fSkoKTtgO1xuICAgIGNvbnN0IHRzRGVjbCA9IGBjb25zdCAke3RzTmFtZX09JyR7YnVpbGRUaW1lc3RhbXB9JztgO1xuXG4gICAgbGV0IG5ld0NvZGUgPSBjb2RlLnJlcGxhY2UocWlhbmt1bkluZGV4SW1wb3J0UmVnZXgsIChfbSwgX3EsIF9raW5kLCByZXN0KSA9PiB7XG4gICAgICAvLyByZXN0OiBcInh4eHguanNcIiBcdTkxQ0NcdTc2ODRcdTRGNTlcdTRFMEJcdTkwRThcdTUyMDZcdUZGMDhoYXNoICsgLmpzXHVGRjA5XG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdThGRkRcdTUyQTAgP3Y9IFx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1RkYwQ1x1OTA3Rlx1NTE0RFx1NUJCRlx1NEUzQi9cdTZENEZcdTg5QzhcdTU2NjgvQ0ROIFx1NTkwRFx1NzUyOFx1NjVFN1x1NTE2NVx1NTNFM1x1ODExQVx1NjcyQ1x1NUJGQ1x1ODFGNFx1NjMwMVx1N0VFRFx1OEJGN1x1NkM0Mlx1NjVFNyBjaHVua1xuICAgICAgcmV0dXJuIGBpbXBvcnQoLyogQHZpdGUtaWdub3JlICovICgke2hlbHBlck5hbWV9ICsgJy9hc3NldHMvJHtfa2luZH0tJHtyZXN0fScgKyAnP3Y9JyArICR7dHNOYW1lfSkpYDtcbiAgICB9KTtcblxuICAgIGlmICghbmV3Q29kZS5pbmNsdWRlcyhoZWxwZXJEZWNsKSkge1xuICAgICAgLy8gXHU1QzNEXHU5MUNGXHU1QzExXHU0RkI1XHU1MTY1XHVGRjFBXHU1M0VBXHU1NzI4XHU5NzAwXHU4OTgxXHU2NUY2XHU2M0QyXHU1MTY1IGhlbHBlclx1RkYwQ1x1NEUwMFx1NkIyMVx1NTM3M1x1NTNFRlxuICAgICAgbmV3Q29kZSA9IGAke3RzRGVjbH1cXG4ke2hlbHBlckRlY2x9XFxuJHtuZXdDb2RlfWA7XG4gICAgfVxuICAgIHJldHVybiB7IGNvZGU6IG5ld0NvZGUsIG1vZGlmaWVkOiB0cnVlIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdlbnN1cmUtYmFzZS11cmwnLFxuICAgIHJlbmRlckNodW5rKGNvZGU6IHN0cmluZywgY2h1bms6IENodW5rSW5mbywgX29wdGlvbnM6IGFueSkge1xuICAgICAgLy8gXHU0RTBEXHU1MThEXHU4REYzXHU4RkM3IHZlbmRvciBcdTdCNDlcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTNcdUZGMENcdTc4NkVcdTRGRERcdTYyNDBcdTY3MDlcdThENDRcdTZFOTBcdThERUZcdTVGODRcdTkwRkRcdTZCNjNcdTc4NkVcbiAgICAgIC8vIFx1NTZFMFx1NEUzQSB2ZW5kb3IgXHU3QjQ5XHU1RTkzXHU0RTJEXHU0RTVGXHU1M0VGXHU4MEZEXHU1MzA1XHU1NDJCXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XG5cbiAgICAgIGxldCBuZXdDb2RlID0gY29kZTtcbiAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MEQgcWlhbmt1biBcdTUzMDVcdTg4QzVcdTU2NjhcdTc2ODRcdTdFRERcdTVCRjkgL2Fzc2V0cy9pbmRleC14eHguanMgXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHVGRjA4XHU4REU4XHU1N0RGXHU1QkJGXHU0RTNCXHU0RjFBIDQwNFx1RkYwOVxuICAgICAge1xuICAgICAgICBjb25zdCBwYXRjaGVkID0gcGF0Y2hRaWFua3VuSW5kZXhJbXBvcnRzKG5ld0NvZGUpO1xuICAgICAgICBpZiAocGF0Y2hlZC5tb2RpZmllZCkge1xuICAgICAgICAgIG5ld0NvZGUgPSBwYXRjaGVkLmNvZGU7XG4gICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChpc1ByZXZpZXdCdWlsZCkge1xuICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGhSZWdleCA9IC8oW1wiJ2BdKShcXC9hc3NldHNcXC9bXlwiJ2BcXHNdKykoXFw/W15cIidgXFxzXSopPy9nO1xuICAgICAgICBpZiAocmVsYXRpdmVQYXRoUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2UocmVsYXRpdmVQYXRoUmVnZXgsIChfbWF0Y2gsIHF1b3RlLCBwYXRoLCBxdWVyeSA9ICcnKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYCR7cXVvdGV9JHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkVFXHU1OTBEXHU5NTE5XHU4QkVGXHU3Njg0XHU3QUVGXHU1M0UzXHVGRjA4XHU0RTNCXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzIC0+IFx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFM1x1RkYwOVxuICAgICAgLy8gXHU1MzM5XHU5MTREIGh0dHA6Ly9sb2NhbGhvc3Q6NDE4MC9hc3NldHMveHh4IFx1NjIxNiBodHRwOi8vMTAuODAuOC4xOTk6NDE4MC9hc3NldHMveHh4XG4gICAgICBjb25zdCB3cm9uZ1BvcnRIdHRwUmVnZXggPSBuZXcgUmVnRXhwKGBodHRwOi8vKCR7YXBwSG9zdH18bG9jYWxob3N0KToke21haW5BcHBQb3J0fSgvYXNzZXRzL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyk7XG4gICAgICBpZiAod3JvbmdQb3J0SHR0cFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZSh3cm9uZ1BvcnRIdHRwUmVnZXgsIChfbWF0Y2gsIGhvc3QsIHBhdGgsIHF1ZXJ5ID0gJycpID0+IHtcbiAgICAgICAgICAvLyBcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjggYmFzZVVybFx1RkYwOFx1NTMwNVx1NTQyQlx1NUI4Q1x1NjU3NCBVUkxcdUZGMDlcbiAgICAgICAgICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBgJHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gXHU1RjAwXHU1M0QxXHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzXG4gICAgICAgICAgcmV0dXJuIGBodHRwOi8vJHtob3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgfSk7XG4gICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1MzM5XHU5MTREIC8vbG9jYWxob3N0OjQxODAvYXNzZXRzL3h4eCBcdTYyMTYgLy8xMC44MC44LjE5OTo0MTgwL2Fzc2V0cy94eHhcbiAgICAgIGNvbnN0IHdyb25nUG9ydFByb3RvY29sUmVnZXggPSBuZXcgUmVnRXhwKGAvLygke2FwcEhvc3R9fGxvY2FsaG9zdCk6JHttYWluQXBwUG9ydH0oL2Fzc2V0cy9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpO1xuICAgICAgaWYgKHdyb25nUG9ydFByb3RvY29sUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHdyb25nUG9ydFByb3RvY29sUmVnZXgsIChfbWF0Y2gsIGhvc3QsIHBhdGgsIHF1ZXJ5ID0gJycpID0+IHtcbiAgICAgICAgICAvLyBcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjggYmFzZVVybFx1RkYwOFx1NTMwNVx1NTQyQlx1NUI4Q1x1NjU3NCBVUkxcdUZGMDlcbiAgICAgICAgICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBgJHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gXHU1RjAwXHU1M0QxXHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzXG4gICAgICAgICAgcmV0dXJuIGAvLyR7aG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgIH0pO1xuICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhdHRlcm5zID0gW1xuICAgICAgICB7XG4gICAgICAgICAgcmVnZXg6IG5ldyBSZWdFeHAoYChodHRwOi8vKShsb2NhbGhvc3R8JHthcHBIb3N0fSk6JHttYWluQXBwUG9ydH0oL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyksXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IChfbWF0Y2g6IHN0cmluZywgcHJvdG9jb2w6IHN0cmluZywgX2hvc3Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgJHtwcm90b2NvbH0ke2FwcEhvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZWdleDogbmV3IFJlZ0V4cChgKC8vKShsb2NhbGhvc3R8JHthcHBIb3N0fSk6JHttYWluQXBwUG9ydH0oL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyksXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IChfbWF0Y2g6IHN0cmluZywgcHJvdG9jb2w6IHN0cmluZywgX2hvc3Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgJHtwcm90b2NvbH0ke2FwcEhvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZWdleDogbmV3IFJlZ0V4cChgKFtcIidcXGBdKShodHRwOi8vKShsb2NhbGhvc3R8JHthcHBIb3N0fSk6JHttYWluQXBwUG9ydH0oL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyksXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IChfbWF0Y2g6IHN0cmluZywgcXVvdGU6IHN0cmluZywgcHJvdG9jb2w6IHN0cmluZywgX2hvc3Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgJHtxdW90ZX0ke3Byb3RvY29sfSR7YXBwSG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKGAoW1wiJ1xcYF0pKC8vKShsb2NhbGhvc3R8JHthcHBIb3N0fSk6JHttYWluQXBwUG9ydH0oL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyksXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IChfbWF0Y2g6IHN0cmluZywgcXVvdGU6IHN0cmluZywgcHJvdG9jb2w6IHN0cmluZywgX2hvc3Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgJHtxdW90ZX0ke3Byb3RvY29sfSR7YXBwSG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF07XG5cbiAgICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiBwYXR0ZXJucykge1xuICAgICAgICBpZiAocGF0dGVybi5yZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShwYXR0ZXJuLnJlZ2V4LCBwYXR0ZXJuLnJlcGxhY2VtZW50IGFzIGFueSk7XG4gICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtYmFzZS11cmxdIFx1NEZFRVx1NTkwRFx1NEU4NiAke2NodW5rLmZpbGVOYW1lfSBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdThERUZcdTVGODQgKCR7bWFpbkFwcFBvcnR9IC0+ICR7YXBwUG9ydH0pYCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY29kZTogbmV3Q29kZSxcbiAgICAgICAgICBtYXA6IG51bGwsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgZ2VuZXJhdGVCdW5kbGUoX29wdGlvbnM6IE91dHB1dE9wdGlvbnMsIGJ1bmRsZTogT3V0cHV0QnVuZGxlKSB7XG4gICAgICBmb3IgKGNvbnN0IFtmaWxlTmFtZSwgY2h1bmtdIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmRsZSkpIHtcbiAgICAgICAgY29uc3QgYzogYW55ID0gY2h1bms7XG4gICAgICAgIGlmIChjLnR5cGUgPT09ICdjaHVuaycgJiYgYy5jb2RlKSB7XG4gICAgICAgICAgLy8gXHU0RTBEXHU1MThEXHU4REYzXHU4RkM3IHZlbmRvciBcdTdCNDlcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTNcdUZGMENcdTc4NkVcdTRGRERcdTYyNDBcdTY3MDlcdThENDRcdTZFOTBcdThERUZcdTVGODRcdTkwRkRcdTZCNjNcdTc4NkVcbiAgICAgICAgICBsZXQgbmV3Q29kZSA9IGMuY29kZTtcbiAgICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRCBxaWFua3VuIFx1NTMwNVx1ODhDNVx1NTY2OFx1NzY4NFx1N0VERFx1NUJGOSAvYXNzZXRzL2luZGV4LXh4eC5qcyBcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdUZGMDhcdThERThcdTU3REZcdTVCQkZcdTRFM0JcdTRGMUEgNDA0XHVGRjA5XG4gICAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgcGF0Y2hlZCA9IHBhdGNoUWlhbmt1bkluZGV4SW1wb3J0cyhuZXdDb2RlKTtcbiAgICAgICAgICAgIGlmIChwYXRjaGVkLm1vZGlmaWVkKSB7XG4gICAgICAgICAgICAgIG5ld0NvZGUgPSBwYXRjaGVkLmNvZGU7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aFJlZ2V4ID0gLyhbXCInYF0pKFxcL2Fzc2V0c1xcL1teXCInYFxcc10rKShcXD9bXlwiJ2BcXHNdKik/L2c7XG4gICAgICAgICAgICBpZiAocmVsYXRpdmVQYXRoUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHJlbGF0aXZlUGF0aFJlZ2V4LCAoX21hdGNoOiBzdHJpbmcsIHF1b3RlOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3F1b3RlfSR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkVFXHU1OTBEXHU5NTE5XHU4QkVGXHU3Njg0XHU3QUVGXHU1M0UzXHVGRjA4XHU0RTNCXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzIC0+IFx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFM1x1RkYwOVxuICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RCBodHRwOi8vbG9jYWxob3N0OjQxODAvYXNzZXRzL3h4eCBcdTYyMTYgaHR0cDovLzEwLjgwLjguMTk5OjQxODAvYXNzZXRzL3h4eFxuICAgICAgICAgIGNvbnN0IHdyb25nUG9ydEh0dHBSZWdleCA9IG5ldyBSZWdFeHAoYGh0dHA6Ly8oJHthcHBIb3N0fXxsb2NhbGhvc3QpOiR7bWFpbkFwcFBvcnR9KC9hc3NldHMvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKTtcbiAgICAgICAgICBpZiAod3JvbmdQb3J0SHR0cFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uod3JvbmdQb3J0SHR0cFJlZ2V4LCAoX21hdGNoOiBzdHJpbmcsIGhvc3Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgICAgLy8gXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4IGJhc2VVcmxcdUZGMDhcdTUzMDVcdTU0MkJcdTVCOENcdTY1NzQgVVJMXHVGRjA5XG4gICAgICAgICAgICAgIGlmIChpc1ByZXZpZXdCdWlsZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBcdTVGMDBcdTUzRDFcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjhcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcbiAgICAgICAgICAgICAgcmV0dXJuIGBodHRwOi8vJHtob3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RCAvL2xvY2FsaG9zdDo0MTgwL2Fzc2V0cy94eHggXHU2MjE2IC8vMTAuODAuOC4xOTk6NDE4MC9hc3NldHMveHh4XG4gICAgICAgICAgY29uc3Qgd3JvbmdQb3J0UHJvdG9jb2xSZWdleCA9IG5ldyBSZWdFeHAoYC8vKCR7YXBwSG9zdH18bG9jYWxob3N0KToke21haW5BcHBQb3J0fSgvYXNzZXRzL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyk7XG4gICAgICAgICAgaWYgKHdyb25nUG9ydFByb3RvY29sUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZSh3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4LCAoX21hdGNoOiBzdHJpbmcsIGhvc3Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgICAgLy8gXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4IGJhc2VVcmxcdUZGMDhcdTUzMDVcdTU0MkJcdTVCOENcdTY1NzQgVVJMXHVGRjA5XG4gICAgICAgICAgICAgIGlmIChpc1ByZXZpZXdCdWlsZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBcdTVGMDBcdTUzRDFcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjhcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcbiAgICAgICAgICAgICAgcmV0dXJuIGAvLyR7aG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgICAgIChjaHVuayBhcyBhbnkpLmNvZGUgPSBuZXdDb2RlO1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTU3MjggZ2VuZXJhdGVCdW5kbGUgXHU0RTJEXHU0RkVFXHU1OTBEXHU0RTg2ICR7ZmlsZU5hbWV9IFx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NGApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChjLnR5cGUgPT09ICdhc3NldCcgJiYgZmlsZU5hbWUgPT09ICdpbmRleC5odG1sJykge1xuICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNiBIVE1MIFx1NjU4N1x1NEVGNlx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFxuICAgICAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTk4Mlx1Njc5QyBWaXRlIFx1OTE0RFx1N0Y2RVx1NkI2M1x1Nzg2RVx1RkYwOGJhc2U6ICcvJywgYXNzZXRzRGlyOiAnYXNzZXRzJywgcm9sbHVwT3B0aW9ucy5vdXRwdXQuY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcydcdUZGMDlcdUZGMENcbiAgICAgICAgICAvLyBWaXRlIFx1NUU5NFx1OEJFNVx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMFx1NkI2M1x1Nzg2RVx1NzY4NFx1OERFRlx1NUY4NFx1RkYwQ1x1NEUwRFx1OTcwMFx1ODk4MVx1NEZFRVx1NTkwRFx1MzAwMlxuICAgICAgICAgIC8vIFx1OEZEOVx1OTFDQ1x1NTNFQVx1NTkwNFx1NzQwNlx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1NjVGNlx1NzY4NFx1N0FFRlx1NTNFM1x1NEZFRVx1NTkwRFx1RkYwQ1x1NEVFNVx1NTNDQVx1NEZFRVx1NTkwRFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1MzAwMlxuICAgICAgICAgIGxldCBodG1sQ29udGVudCA9ICgoYyBhcyBhbnkpLnNvdXJjZSkgYXMgc3RyaW5nO1xuICAgICAgICAgIGxldCBodG1sTW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAgIC8vIFx1NEZFRVx1NTkwRFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NCAuL2Fzc2V0cy8gXHU0RTNBXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0IC9hc3NldHMvXHVGRjA4XHU1OTgyXHU2NzlDXHU1MUZBXHU3M0IwXHVGRjA5XG4gICAgICAgICAgY29uc3QgcmVsYXRpdmVBc3NldFJlZ2V4ID0gLyhocmVmfHNyYyk9W1wiJ10oXFwuXFwvYXNzZXRzXFwvW15cIiddKykoXFw/W15cIiddKik/W1wiJ10vZztcbiAgICAgICAgICBpZiAocmVsYXRpdmVBc3NldFJlZ2V4LnRlc3QoaHRtbENvbnRlbnQpKSB7XG4gICAgICAgICAgICBodG1sQ29udGVudCA9IGh0bWxDb250ZW50LnJlcGxhY2UocmVsYXRpdmVBc3NldFJlZ2V4LCAoX21hdGNoLCBhdHRyLCBwYXRoLCBxdWVyeSA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1NUMwNlx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1OEY2Q1x1NjM2Mlx1NEUzQVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFxuICAgICAgICAgICAgICBjb25zdCBhYnNvbHV0ZVBhdGggPSBwYXRoLnJlcGxhY2UoL15cXC4vLCAnJyk7XG4gICAgICAgICAgICAgIGh0bWxNb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0OiAke3BhdGh9IC0+ICR7YWJzb2x1dGVQYXRofWApO1xuICAgICAgICAgICAgICByZXR1cm4gYCR7YXR0cn09XCIke2Fic29sdXRlUGF0aH0ke3F1ZXJ5fVwiYDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRCB2aXRlLXBsdWdpbi1xaWFua3VuIFx1NkNFOFx1NTE2NVx1NTIzMCBpbmRleC5odG1sIFx1NTE4NVx1ODA1NFx1ODExQVx1NjcyQ1x1NEUyRFx1NzY4NCBpbXBvcnQoJy9hc3NldHMvaW5kZXgteHh4LmpzJylcbiAgICAgICAgICAvLyBcdThCRjRcdTY2MEVcdUZGMUFxaWFua3VuIFx1NEYxQVx1NjI4QVx1OEJFNVx1NTE4NVx1ODA1NFx1ODExQVx1NjcyQyBldmFsIFx1NjIxMCBWTSBcdTYyNjdcdTg4NENcdUZGMUJcdTU5ODJcdTY3OUNcdTRFQ0RcdTY2MkYgL2Fzc2V0cy8gXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XHVGRjBDXHU1QzMxXHU0RjFBXHU2MzA5XHU1QkJGXHU0RTNCXHU1N0RGXHU1NDBEXHU4OUUzXHU2NzkwXHVGRjA4XHU1QkZDXHU4MUY0IGxheW91dCBcdTU3REZcdTU0MEQgNDA0XHVGRjA5XHUzMDAyXG4gICAgICAgICAgLy8gXHU4RkQ5XHU5MUNDXHU2NTM5XHU0RTNBXHVGRjFBXHU0RjE4XHU1MTQ4XHU3NTI4IF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fXHVGRjA4XHU1QjUwXHU1RTk0XHU3NTI4IHB1YmxpY1BhdGgvb3JpZ2luXHVGRjA5XHVGRjBDXHU1RTc2XHU4RkZEXHU1MkEwID92PSBcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdUZGMENcdTkwN0ZcdTUxNERcdTdGMTNcdTVCNThcdTY1RTdcdTUxNjVcdTUzRTNcdTMwMDJcbiAgICAgICAgICBpZiAocWlhbmt1bkluZGV4SW1wb3J0SW5IdG1sUmVnZXgudGVzdChodG1sQ29udGVudCkpIHtcbiAgICAgICAgICAgIHFpYW5rdW5JbmRleEltcG9ydEluSHRtbFJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICBjb25zdCBvcmlnaW5FeHByID1cbiAgICAgICAgICAgICAgYCgodHlwZW9mIF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fIT09J3VuZGVmaW5lZCcmJl9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fKWAgK1xuICAgICAgICAgICAgICBgP25ldyBVUkwoX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18sKHR5cGVvZiBsb2NhdGlvbiE9PSd1bmRlZmluZWQnJiZsb2NhdGlvbi5vcmlnaW4pfHwnJykub3JpZ2luYCArXG4gICAgICAgICAgICAgIGA6KCh0eXBlb2YgbG9jYXRpb24hPT0ndW5kZWZpbmVkJyYmbG9jYXRpb24ub3JpZ2luKXx8JycpKWA7XG4gICAgICAgICAgICBodG1sQ29udGVudCA9IGh0bWxDb250ZW50LnJlcGxhY2UocWlhbmt1bkluZGV4SW1wb3J0SW5IdG1sUmVnZXgsIChfbSwgX3EsIGFic1BhdGgpID0+IHtcbiAgICAgICAgICAgICAgaHRtbE1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmV0dXJuIGBpbXBvcnQoLyogQHZpdGUtaWdub3JlICovICgke29yaWdpbkV4cHJ9ICsgJyR7YWJzUGF0aH0nICsgJz92PSR7YnVpbGRUaW1lc3RhbXB9JykpYDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTRGRUVcdTU5MEQgaW5kZXguaHRtbCBcdTUxODVcdTgwNTQgaW1wb3J0KC9hc3NldHMvaW5kZXgtKi5qcykgXHU1RTc2XHU4RkZEXHU1MkEwIHY9JHtidWlsZFRpbWVzdGFtcH1gKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTUxRkFcdTczQjBcdTY4MzlcdTc2RUVcdTVGNTVcdTc2ODRcdThENDRcdTZFOTBcdThERUZcdTVGODRcdUZGMDhcdTU5ODIgL2luZGV4LmpzXHVGRjA5XHVGRjBDXHU4QkY0XHU2NjBFXHU5MTREXHU3RjZFXHU2NzA5XHU5NUVFXHU5ODk4XHVGRjBDXHU4QkIwXHU1RjU1XHU4QjY2XHU1NDRBXG4gICAgICAgICAgLy8gXHU2QjYzXHU1RTM4XHU2MEM1XHU1MUI1XHU0RTBCXHVGRjBDVml0ZSBcdTVFOTRcdThCRTVcdTc1MUZcdTYyMTAgL2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzIFx1OEZEOVx1NjgzN1x1NzY4NFx1OERFRlx1NUY4NFxuICAgICAgICAgIGNvbnN0IHJvb3RKc1JlZ2V4ID0gLyhocmVmfHNyYyk9W1wiJ10oXFwvKFteL10rXFwuKGpzfG1qcykpKShcXD9bXlwiJ10qKT9bXCInXS9nO1xuICAgICAgICAgIGlmIChyb290SnNSZWdleC50ZXN0KGh0bWxDb250ZW50KSkge1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGh0bWxDb250ZW50Lm1hdGNoKHJvb3RKc1JlZ2V4KTtcbiAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW2Vuc3VyZS1iYXNlLXVybF0gXHUyNkEwXHVGRTBGICBcdTY4QzBcdTZENEJcdTUyMzBcdTY4MzlcdTc2RUVcdTVGNTVcdThENDRcdTZFOTBcdThERUZcdTVGODRcdUZGMENcdThGRDlcdTkwMUFcdTVFMzhcdTRFMERcdTVFOTRcdThCRTVcdTUxRkFcdTczQjBcdTMwMDJcdThCRjdcdTY4QzBcdTY3RTUgVml0ZSBcdTkxNERcdTdGNkVcdUZGMDhiYXNlLCBhc3NldHNEaXIsIHJvbGx1cE9wdGlvbnMub3V0cHV0LmNodW5rRmlsZU5hbWVzXHVGRjA5OmAsIG1hdGNoZXMpO1xuICAgICAgICAgICAgICAvLyBcdTRGRUVcdTU5MERcdThGRDlcdTRFOUJcdThERUZcdTVGODRcdUZGMDhcdTRGNUNcdTRFM0FcdTUxNUNcdTVFOTVcdTY1QjlcdTY4NDhcdUZGMDlcbiAgICAgICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKHJvb3RKc1JlZ2V4LCAoX21hdGNoLCBhdHRyLCBwYXRoLCBmaWxlTmFtZSwgX2V4dCwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGF0aC5zdGFydHNXaXRoKCcvYXNzZXRzLycpICYmICFwYXRoLnN0YXJ0c1dpdGgoJy9mYXZpY29uJykgJiYgIXBhdGguc3RhcnRzV2l0aCgnL2xvZ28nKSAmJiAhcGF0aC5tYXRjaCgvXFwuKHBuZ3xqcGd8anBlZ3xnaWZ8c3ZnfGljb3xqc29uKSQvKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGAvYXNzZXRzLyR7ZmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgIGh0bWxNb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtYmFzZS11cmxdIFx1NEZFRVx1NTkwRFx1NjgzOVx1NzZFRVx1NUY1NVx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1RkYwOFx1NTE1Q1x1NUU5NVx1RkYwOTogJHtwYXRofSAtPiAke25ld1BhdGh9YCk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYCR7YXR0cn09XCIke25ld1BhdGh9JHtxdWVyeX1cImA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBfbWF0Y2g7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHJvb3RDc3NSZWdleCA9IC8oaHJlZnxzcmMpPVtcIiddKFxcLyhbXi9dK1xcLmNzcykpKFxcP1teXCInXSopP1tcIiddL2c7XG4gICAgICAgICAgaWYgKHJvb3RDc3NSZWdleC50ZXN0KGh0bWxDb250ZW50KSkge1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGh0bWxDb250ZW50Lm1hdGNoKHJvb3RDc3NSZWdleCk7XG4gICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtlbnN1cmUtYmFzZS11cmxdIFx1MjZBMFx1RkUwRiAgXHU2OEMwXHU2RDRCXHU1MjMwXHU2ODM5XHU3NkVFXHU1RjU1IENTUyBcdThERUZcdTVGODRcdUZGMENcdThGRDlcdTkwMUFcdTVFMzhcdTRFMERcdTVFOTRcdThCRTVcdTUxRkFcdTczQjBcdTMwMDJcdThCRjdcdTY4QzBcdTY3RTUgVml0ZSBcdTkxNERcdTdGNkU6YCwgbWF0Y2hlcyk7XG4gICAgICAgICAgICAgIC8vIFx1NEZFRVx1NTkwRFx1OEZEOVx1NEU5Qlx1OERFRlx1NUY4NFx1RkYwOFx1NEY1Q1x1NEUzQVx1NTE1Q1x1NUU5NVx1NjVCOVx1Njg0OFx1RkYwOVxuICAgICAgICAgICAgICBodG1sQ29udGVudCA9IGh0bWxDb250ZW50LnJlcGxhY2Uocm9vdENzc1JlZ2V4LCAoX21hdGNoLCBhdHRyLCBwYXRoLCBmaWxlTmFtZSwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGF0aC5zdGFydHNXaXRoKCcvYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBuZXdQYXRoID0gYC9hc3NldHMvJHtmaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgaHRtbE1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEXHU2ODM5XHU3NkVFXHU1RjU1IENTUyBcdThERUZcdTVGODRcdUZGMDhcdTUxNUNcdTVFOTVcdUZGMDk6ICR7cGF0aH0gLT4gJHtuZXdQYXRofWApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJ9PVwiJHtuZXdQYXRofSR7cXVlcnl9XCJgO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gX21hdGNoO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaHRtbE1vZGlmaWVkKSB7XG4gICAgICAgICAgICAoY2h1bmsgYXMgYW55KS5zb3VyY2UgPSBodG1sQ29udGVudDtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEXHU0RTg2IGluZGV4Lmh0bWwgXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxjb3JzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2NvcnMudHNcIjsvKipcbiAqIENPUlMgXHU2M0QyXHU0RUY2XG4gKiBcdTY1MkZcdTYzMDEgY3JlZGVudGlhbHMgXHU3Njg0IENPUlMgXHU0RTJEXHU5NUY0XHU0RUY2XG4gKi9cblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFZpdGVEZXZTZXJ2ZXIgfSBmcm9tICd2aXRlJztcblxuLyoqXG4gKiBDT1JTIFx1NjNEMlx1NEVGNlx1RkYwOFx1NjUyRlx1NjMwMSBjcmVkZW50aWFsc1x1RkYwOVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29yc1BsdWdpbigpOiBQbHVnaW4ge1xuICBjb25zdCBjb3JzRGV2TWlkZGxld2FyZSA9IChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xuICAgIGNvbnN0IG9yaWdpbiA9IHJlcS5oZWFkZXJzLm9yaWdpbjtcblxuICAgIGlmIChvcmlnaW4pIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1Qcml2YXRlLU5ldHdvcmsnLCAndHJ1ZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctUHJpdmF0ZS1OZXR3b3JrJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLU1heC1BZ2UnLCAnODY0MDAnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtTGVuZ3RoJywgJzAnKTtcbiAgICAgIHJlcy5lbmQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBuZXh0KCk7XG4gIH07XG5cbiAgY29uc3QgY29yc1ByZXZpZXdNaWRkbGV3YXJlID0gKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSA9PiB7XG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgICAgY29uc3Qgb3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luO1xuXG4gICAgICBpZiAob3JpZ2luKSB7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICAgIH1cblxuICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1NYXgtQWdlJywgJzg2NDAwJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcsICcwJyk7XG4gICAgICByZXMuZW5kKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgb3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luO1xuICAgIGlmIChvcmlnaW4pIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIG9yaWdpbik7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgfVxuXG4gICAgbmV4dCgpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2NvcnMtd2l0aC1jcmVkZW50aWFscycsXG4gICAgZW5mb3JjZTogJ3ByZScsXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcjogVml0ZURldlNlcnZlcikge1xuICAgICAgY29uc3Qgc3RhY2sgPSAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2s7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShzdGFjaykpIHtcbiAgICAgICAgY29uc3QgZmlsdGVyZWRTdGFjayA9IHN0YWNrLmZpbHRlcigoaXRlbTogYW55KSA9PlxuICAgICAgICAgIGl0ZW0uaGFuZGxlICE9PSBjb3JzRGV2TWlkZGxld2FyZSAmJiBpdGVtLmhhbmRsZSAhPT0gY29yc1ByZXZpZXdNaWRkbGV3YXJlXG4gICAgICAgICk7XG4gICAgICAgIChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjayA9IFtcbiAgICAgICAgICB7IHJvdXRlOiAnJywgaGFuZGxlOiBjb3JzRGV2TWlkZGxld2FyZSB9LFxuICAgICAgICAgIC4uLmZpbHRlcmVkU3RhY2ssXG4gICAgICAgIF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGNvcnNEZXZNaWRkbGV3YXJlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbmZpZ3VyZVByZXZpZXdTZXJ2ZXIoc2VydmVyOiBWaXRlRGV2U2VydmVyKSB7XG4gICAgICBjb25zdCBzdGFjayA9IChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjaztcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHN0YWNrKSkge1xuICAgICAgICBjb25zdCBmaWx0ZXJlZFN0YWNrID0gc3RhY2suZmlsdGVyKChpdGVtOiBhbnkpID0+XG4gICAgICAgICAgaXRlbS5oYW5kbGUgIT09IGNvcnNEZXZNaWRkbGV3YXJlICYmIGl0ZW0uaGFuZGxlICE9PSBjb3JzUHJldmlld01pZGRsZXdhcmVcbiAgICAgICAgKTtcbiAgICAgICAgKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrID0gW1xuICAgICAgICAgIHsgcm91dGU6ICcnLCBoYW5kbGU6IGNvcnNQcmV2aWV3TWlkZGxld2FyZSB9LFxuICAgICAgICAgIC4uLmZpbHRlcmVkU3RhY2ssXG4gICAgICAgIF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGNvcnNQcmV2aWV3TWlkZGxld2FyZSk7XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxjc3MudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvY3NzLnRzXCI7LyoqXG4gKiBDU1MgXHU3NkY4XHU1MTczXHU2M0QyXHU0RUY2XG4gKiBcdTc4NkVcdTRGREQgQ1NTIFx1NjU4N1x1NEVGNlx1ODhBQlx1NkI2M1x1Nzg2RVx1NjI1M1x1NTMwNVxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbZW5zdXJlLWNzc10nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW2Vuc3VyZS1jc3NdJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbZW5zdXJlLWNzc10nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW2Vuc3VyZS1jc3NdJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHR5cGUgeyBPdXRwdXRPcHRpb25zLCBPdXRwdXRCdW5kbGUgfSBmcm9tICdyb2xsdXAnO1xuXG4vKipcbiAqIFx1Nzg2RVx1NEZERCBDU1MgXHU2NTg3XHU0RUY2XHU4OEFCXHU2QjYzXHU3ODZFXHU2MjUzXHU1MzA1XHU3Njg0XHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVDc3NQbHVnaW4oKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnZW5zdXJlLWNzcy1wbHVnaW4nLFxuICAgIGdlbmVyYXRlQnVuZGxlKF9vcHRpb25zOiBPdXRwdXRPcHRpb25zLCBidW5kbGU6IE91dHB1dEJ1bmRsZSkge1xuICAgICAgY29uc3QganNGaWxlcyA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuZmlsdGVyKGZpbGUgPT4gZmlsZS5lbmRzV2l0aCgnLmpzJykpO1xuICAgICAgbGV0IGhhc0lubGluZUNzcyA9IGZhbHNlO1xuICAgICAgY29uc3Qgc3VzcGljaW91c0ZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICBqc0ZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgIGNvbnN0IGNodW5rID0gYnVuZGxlW2ZpbGVdIGFzIGFueTtcbiAgICAgICAgaWYgKGNodW5rICYmIGNodW5rLmNvZGUgJiYgdHlwZW9mIGNodW5rLmNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgY29uc3QgY29kZSA9IGNodW5rLmNvZGU7XG5cbiAgICAgICAgICBjb25zdCBpc01vZHVsZVByZWxvYWQgPSBjb2RlLmluY2x1ZGVzKCdtb2R1bGVwcmVsb2FkJykgfHwgY29kZS5pbmNsdWRlcygncmVsTGlzdCcpO1xuICAgICAgICAgIGlmIChpc01vZHVsZVByZWxvYWQpIHJldHVybjtcblxuICAgICAgICAgIGNvbnN0IGlzS25vd25MaWJyYXJ5ID0gZmlsZS5pbmNsdWRlcygndnVlLWNvcmUnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygnZWxlbWVudC1wbHVzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ3ZlbmRvcicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCd2dWUtaTE4bicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCd2dWUtcm91dGVyJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ2xpYi1lY2hhcnRzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ21vZHVsZS0nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygnYXBwLWNvbXBvc2FibGVzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ2FwcC1wYWdlcycpO1xuICAgICAgICAgIGlmIChpc0tub3duTGlicmFyeSkgcmV0dXJuO1xuXG4gICAgICAgICAgY29uc3QgaGFzU3R5bGVFbGVtZW50Q3JlYXRpb24gPSAvZG9jdW1lbnRcXC5jcmVhdGVFbGVtZW50XFwoWydcIl1zdHlsZVsnXCJdXFwpLy50ZXN0KGNvZGUpICYmXG4gICAgICAgICAgICAvXFwuKHRleHRDb250ZW50fGlubmVySFRNTClcXHMqPS8udGVzdChjb2RlKSAmJlxuICAgICAgICAgICAgL1xce1tefV17MTAsfVxcfS8udGVzdChjb2RlKTtcblxuICAgICAgICAgIGNvbnN0IGhhc0luc2VydFN0eWxlV2l0aENzcyA9IC9pbnNlcnRTdHlsZVxccypcXCgvLnRlc3QoY29kZSkgJiZcbiAgICAgICAgICAgIC90ZXh0XFwvY3NzLy50ZXN0KGNvZGUpICYmXG4gICAgICAgICAgICAvXFx7W159XXsyMCx9XFx9Ly50ZXN0KGNvZGUpO1xuXG4gICAgICAgICAgY29uc3Qgc3R5bGVUYWdNYXRjaCA9IGNvZGUubWF0Y2goLzxzdHlsZVtePl0qPi8pO1xuICAgICAgICAgIGNvbnN0IGhhc1N0eWxlVGFnV2l0aENvbnRlbnQgPSBzdHlsZVRhZ01hdGNoICYmXG4gICAgICAgICAgICAhc3R5bGVUYWdNYXRjaFswXS5pbmNsdWRlcyhcIidcIikgJiZcbiAgICAgICAgICAgICFzdHlsZVRhZ01hdGNoWzBdLmluY2x1ZGVzKCdcIicpICYmXG4gICAgICAgICAgICAvXFx7W159XXsyMCx9XFx9Ly50ZXN0KGNvZGUpO1xuXG4gICAgICAgICAgY29uc3QgaGFzSW5saW5lQ3NzU3RyaW5nID0gL1snXCJgXVteJ1wiYF17NTAsfTpcXHMqW14nXCJgXXsxMCx9O1xccypbXidcImBdezEwLH1bJ1wiYF0vLnRlc3QoY29kZSkgJiZcbiAgICAgICAgICAgIC8oY29sb3J8YmFja2dyb3VuZHx3aWR0aHxoZWlnaHR8bWFyZ2lufHBhZGRpbmd8Ym9yZGVyfGRpc3BsYXl8cG9zaXRpb258ZmxleHxncmlkKS8udGVzdChjb2RlKTtcblxuICAgICAgICAgIGlmIChoYXNTdHlsZUVsZW1lbnRDcmVhdGlvbiB8fCBoYXNJbnNlcnRTdHlsZVdpdGhDc3MgfHwgaGFzU3R5bGVUYWdXaXRoQ29udGVudCB8fCBoYXNJbmxpbmVDc3NTdHJpbmcpIHtcbiAgICAgICAgICAgIGhhc0lubGluZUNzcyA9IHRydWU7XG4gICAgICAgICAgICBzdXNwaWNpb3VzRmlsZXMucHVzaChmaWxlKTtcbiAgICAgICAgICAgIGNvbnN0IHBhdHRlcm5zOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgaWYgKGhhc1N0eWxlRWxlbWVudENyZWF0aW9uKSBwYXR0ZXJucy5wdXNoKCdcdTUyQThcdTYwMDFcdTUyMUJcdTVFRkEgc3R5bGUgXHU1MTQzXHU3RDIwJyk7XG4gICAgICAgICAgICBpZiAoaGFzSW5zZXJ0U3R5bGVXaXRoQ3NzKSBwYXR0ZXJucy5wdXNoKCdpbnNlcnRTdHlsZSBcdTUxRkRcdTY1NzAnKTtcbiAgICAgICAgICAgIGlmIChoYXNTdHlsZVRhZ1dpdGhDb250ZW50KSBwYXR0ZXJucy5wdXNoKCc8c3R5bGU+IFx1NjgwN1x1N0I3RScpO1xuICAgICAgICAgICAgaWYgKGhhc0lubGluZUNzc1N0cmluZykgcGF0dGVybnMucHVzaCgnXHU1MTg1XHU4MDU0IENTUyBcdTVCNTdcdTdCMjZcdTRFMzInKTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdTI2QTBcdUZFMEYgXHU4QjY2XHU1NDRBXHVGRjFBXHU1NzI4ICR7ZmlsZX0gXHU0RTJEXHU2OEMwXHU2RDRCXHU1MjMwXHU1M0VGXHU4MEZEXHU3Njg0XHU1MTg1XHU4MDU0IENTU1x1RkYwOFx1NkEyMVx1NUYwRlx1RkYxQSR7cGF0dGVybnMuam9pbignLCAnKX1cdUZGMDlgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAoaGFzSW5saW5lQ3NzKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdTI2QTBcdUZFMEYgXHU4QjY2XHU1NDRBXHVGRjFBXHU2OEMwXHU2RDRCXHU1MjMwIENTUyBcdTUzRUZcdTgwRkRcdTg4QUJcdTUxODVcdTgwNTRcdTUyMzAgSlMgXHU0RTJEXHVGRjBDXHU4RkQ5XHU0RjFBXHU1QkZDXHU4MUY0IHFpYW5rdW4gXHU2NUUwXHU2Q0Q1XHU2QjYzXHU3ODZFXHU1MkEwXHU4RjdEXHU2ODM3XHU1RjBGJyk7XG4gICAgICAgIGNvbnNvbGUud2FybihgW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdTUzRUZcdTc1OTFcdTY1ODdcdTRFRjZcdUZGMUEke3N1c3BpY2lvdXNGaWxlcy5qb2luKCcsICcpfWApO1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tlbnN1cmUtY3NzLXBsdWdpbl0gXHU4QkY3XHU2OEMwXHU2N0U1IHZpdGUtcGx1Z2luLXFpYW5rdW4gXHU5MTREXHU3RjZFXHU1NDhDIGJ1aWxkLmFzc2V0c0lubGluZUxpbWl0IFx1OEJCRVx1N0Y2RScpO1xuICAgICAgfVxuICAgIH0sXG4gICAgd3JpdGVCdW5kbGUoX29wdGlvbnM6IE91dHB1dE9wdGlvbnMsIGJ1bmRsZTogT3V0cHV0QnVuZGxlKSB7XG4gICAgICBjb25zdCBjc3NGaWxlcyA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuZmlsdGVyKGZpbGUgPT4gZmlsZS5lbmRzV2l0aCgnLmNzcycpKTtcbiAgICAgIGlmIChjc3NGaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdTI3NEMgXHU5NTE5XHU4QkVGXHVGRjFBXHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU0RTJEXHU2NUUwIENTUyBcdTY1ODdcdTRFRjZcdUZGMDEnKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdThCRjdcdTY4QzBcdTY3RTVcdUZGMUEnKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignMS4gXHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XHU2NjJGXHU1NDI2XHU5NzU5XHU2MDAxXHU1QkZDXHU1MTY1XHU1MTY4XHU1QzQwXHU2ODM3XHU1RjBGXHVGRjA4aW5kZXguY3NzL3Vuby5jc3MvZWxlbWVudC1wbHVzLmNzc1x1RkYwOScpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCcyLiBcdTY2MkZcdTU0MjZcdTY3MDkgVnVlIFx1N0VDNFx1NEVGNlx1NEUyRFx1NEY3Rlx1NzUyOCA8c3R5bGU+IFx1NjgwN1x1N0I3RScpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCczLiBVbm9DU1MgXHU5MTREXHU3RjZFXHU2NjJGXHU1NDI2XHU2QjYzXHU3ODZFXHVGRjBDXHU2NjJGXHU1NDI2XHU1QkZDXHU1MTY1IEB1bm9jc3MgYWxsJyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJzQuIHZpdGUtcGx1Z2luLXFpYW5rdW4gXHU3Njg0IHVzZURldk1vZGUgXHU2NjJGXHU1NDI2XHU1NzI4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU2QjYzXHU3ODZFXHU1MTczXHU5NUVEJyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJzUuIGJ1aWxkLmFzc2V0c0lubGluZUxpbWl0IFx1NjYyRlx1NTQyNlx1OEJCRVx1N0Y2RVx1NEUzQSAwXHVGRjA4XHU3OTgxXHU2QjYyXHU1MTg1XHU4MDU0XHVGRjA5Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtY3NzLXBsdWdpbl0gXHUyNzA1IFx1NjIxMFx1NTI5Rlx1NjI1M1x1NTMwNSAke2Nzc0ZpbGVzLmxlbmd0aH0gXHU0RTJBIENTUyBcdTY1ODdcdTRFRjZcdUZGMUFgLCBjc3NGaWxlcyk7XG4gICAgICAgIGNzc0ZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgICAgY29uc3QgYXNzZXQgPSBidW5kbGVbZmlsZV0gYXMgYW55O1xuICAgICAgICAgIGlmIChhc3NldCAmJiBhc3NldC5zb3VyY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNpemVLQiA9IChhc3NldC5zb3VyY2UubGVuZ3RoIC8gMTAyNCkudG9GaXhlZCgyKTtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgICAtICR7ZmlsZX06ICR7c2l6ZUtCfUtCYCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChhc3NldCAmJiBhc3NldC5maWxlTmFtZSkge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGAgIC0gJHthc3NldC5maWxlTmFtZSB8fCBmaWxlfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFx2ZXJzaW9uLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3ZlcnNpb24udHNcIjsvKipcbiAqIFx1NzI0OFx1NjcyQ1x1NTNGN1x1NjNEMlx1NEVGNlxuICogXHU0RTNBIEhUTUwgXHU2NTg3XHU0RUY2XHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU2REZCXHU1MkEwXHU1MTY4XHU1QzQwXHU3RURGXHU0RTAwXHU3Njg0XHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHU3MjQ4XHU2NzJDXHU1M0Y3XG4gKiBcdTc1MjhcdTRFOEVcdTZENEZcdTg5QzhcdTU2NjhcdTdGMTNcdTVCNThcdTYzQTdcdTUyMzZcdUZGMENcdTZCQ0ZcdTZCMjFcdTY3ODRcdTVFRkFcdTkwRkRcdTRGMUFcdTc1MUZcdTYyMTBcdTY1QjBcdTc2ODRcdTY1RjZcdTk1RjRcdTYyMzNcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW3ZlcnNpb25dJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1t2ZXJzaW9uXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW3ZlcnNpb25dJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1t2ZXJzaW9uXScsIC4uLmFyZ3MpLFxufTtcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHsgcmVzb2x2ZSwgZGlybmFtZSB9IGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xuY29uc3QgX19kaXJuYW1lID0gZGlybmFtZShfX2ZpbGVuYW1lKTtcblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTYyMTZcdTc1MUZcdTYyMTBcdTUxNjhcdTVDNDBcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdTcyNDhcdTY3MkNcdTUzRjdcbiAqIFx1NEYxOFx1NTE0OFx1NEVDRVx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1OEJGQlx1NTNENlx1RkYwQ1x1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOVx1NTIxOVx1NEVDRVx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1NjU4N1x1NEVGNlx1OEJGQlx1NTNENlx1RkYwQ1x1OTBGRFx1NkNBMVx1NjcwOVx1NTIxOVx1NzUxRlx1NjIxMFx1NjVCMFx1NzY4NFxuICovXG5mdW5jdGlvbiBnZXRCdWlsZFRpbWVzdGFtcCgpOiBzdHJpbmcge1xuICAvLyAxLiBcdTRGMThcdTUxNDhcdTRFQ0VcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdThCRkJcdTUzRDZcdUZGMDhcdTc1MzFcdTY3ODRcdTVFRkFcdTgxMUFcdTY3MkNcdThCQkVcdTdGNkVcdUZGMDlcbiAgaWYgKHByb2Nlc3MuZW52LkJUQ19CVUlMRF9USU1FU1RBTVApIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnYuQlRDX0JVSUxEX1RJTUVTVEFNUDtcbiAgfVxuXG4gIC8vIDIuIFx1NEVDRVx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1NjU4N1x1NEVGNlx1OEJGQlx1NTNENlx1RkYwOFx1NTk4Mlx1Njc5Q1x1NUI1OFx1NTcyOFx1RkYwOVxuICBjb25zdCB0aW1lc3RhbXBGaWxlID0gcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi8uLi8uYnVpbGQtdGltZXN0YW1wJyk7XG4gIGlmIChleGlzdHNTeW5jKHRpbWVzdGFtcEZpbGUpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IHJlYWRGaWxlU3luYyh0aW1lc3RhbXBGaWxlLCAndXRmLTgnKS50cmltKCk7XG4gICAgICBpZiAodGltZXN0YW1wKSB7XG4gICAgICAgIHJldHVybiB0aW1lc3RhbXA7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIFx1NUZGRFx1NzU2NVx1OEJGQlx1NTNENlx1OTUxOVx1OEJFRlxuICAgIH1cbiAgfVxuXG4gIC8vIDMuIFx1NzUxRlx1NjIxMFx1NjVCMFx1NzY4NFx1NjVGNlx1OTVGNFx1NjIzM1x1NUU3Nlx1NEZERFx1NUI1OFx1NTIzMFx1NjU4N1x1NEVGNlx1RkYwOFx1Nzg2RVx1NEZERFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NEY3Rlx1NzUyOFx1NTQwQ1x1NEUwMFx1NEUyQVx1RkYwOVxuICAvLyBcdTRGN0ZcdTc1MjgzNlx1OEZEQlx1NTIzNlx1N0YxNlx1NzgwMVx1RkYwQ1x1NzUxRlx1NjIxMFx1NjZGNFx1NzdFRFx1NzY4NFx1NzI0OFx1NjcyQ1x1NTNGN1x1RkYwOFx1NTMwNVx1NTQyQlx1NUI1N1x1NkJDRFx1NTQ4Q1x1NjU3MFx1NUI1N1x1RkYwQ1x1NTk4MiBsM2syajFoXHVGRjA5XG4gIGNvbnN0IHRpbWVzdGFtcCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpO1xuICB0cnkge1xuICAgIHdyaXRlRmlsZVN5bmModGltZXN0YW1wRmlsZSwgdGltZXN0YW1wLCAndXRmLTgnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBcdTVGRkRcdTc1NjVcdTUxOTlcdTUxNjVcdTk1MTlcdThCRUZcbiAgfVxuICByZXR1cm4gdGltZXN0YW1wO1xufVxuXG4vKipcbiAqIFx1NEUzQSBIVE1MIFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1NkRGQlx1NTJBMFx1NzI0OFx1NjcyQ1x1NTNGN1x1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkVmVyc2lvblBsdWdpbigpOiBQbHVnaW4ge1xuICBjb25zdCBidWlsZFRpbWVzdGFtcCA9IGdldEJ1aWxkVGltZXN0YW1wKCk7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnYWRkLXZlcnNpb24nLFxuICAgIGFwcGx5OiAnYnVpbGQnLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBjb25zb2xlLmluZm8oYFthZGQtdmVyc2lvbl0gXHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHU3MjQ4XHU2NzJDXHU1M0Y3OiAke2J1aWxkVGltZXN0YW1wfWApO1xuICAgIH0sXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RjdGXHU3NTI4IHRyYW5zZm9ybUluZGV4SHRtbFx1RkYwOFZpdGUgXHU1MTg1XHU5MEU4XHU2NjJGXHU1NzI4XHU1NDBFXHU3RjZFXHU5NjM2XHU2QkI1XHU3NTFGXHU2MjEwL1x1NTE5OVx1NTE2NSBpbmRleC5odG1sXHVGRjBDZ2VuZXJhdGVCdW5kbGUgXHU1Rjg4XHU1QkI5XHU2NjEzXHU2MkZGXHU0RTBEXHU1MjMwXHU2NzAwXHU3RUM4IEhUTUxcdUZGMDlcbiAgICB0cmFuc2Zvcm1JbmRleEh0bWw6IHtcbiAgICAgIG9yZGVyOiAncG9zdCcsXG4gICAgICBoYW5kbGVyKGh0bWwpIHtcbiAgICAgICAgbGV0IG5ld0h0bWwgPSBodG1sO1xuICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAvLyAwKSBcdTc5RkJcdTk2NjRcdTdBN0FcdTc2ODQgPHN0eWxlPjwvc3R5bGU+IFx1NjgwN1x1N0I3RVxuICAgICAgICAvLyBcdThCRjRcdTY2MEVcdUZGMUFcdTU3MjhcdTVGQUVcdTUyNERcdTdBRUZcdTY3QjZcdTY3ODRcdTRFMEJcdUZGMENcdTVCNTBcdTVFOTRcdTc1MjhcdTU3MjhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTg4QUIgcWlhbmt1biBcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFM0JcdTVFOTRcdTc1MjhcdTVERjJcdTdFQ0ZcdTYzRDBcdTRGOUJcdTRFODYgbG9hZGluZ1x1RkYwQ1xuICAgICAgICAvLyBcdTVCNTBcdTVFOTRcdTc1MjhcdTc2ODQgc3R5bGUgXHU2ODA3XHU3QjdFXHU1M0VGXHU4MEZEXHU4OEFCXHU1OTA0XHU3NDA2XHU2MjEwXHU3QTdBXHU3Njg0XHUzMDAyXHU3OUZCXHU5NjY0XHU3QTdBXHU2ODA3XHU3QjdFXHU1M0VGXHU0RUU1XHU3QjgwXHU1MzE2IEhUTUwgXHU3RUQzXHU2Nzg0XHUzMDAyXG4gICAgICAgIC8vIFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NEUwQlx1RkYwQ1x1NUI1MFx1NUU5NFx1NzUyOFx1NzJFQ1x1N0FDQlx1OEZEMFx1ODg0Q1x1RkYwQ3N0eWxlIFx1NjgwN1x1N0I3RVx1NjcwOVx1NTE4NVx1NUJCOVx1RkYwOGxvYWRpbmcgXHU2ODM3XHU1RjBGXHVGRjA5XHVGRjBDXHU0RTBEXHU0RjFBXHU4OEFCXHU3OUZCXHU5NjY0XHUzMDAyXG4gICAgICAgIGNvbnN0IGVtcHR5U3R5bGVSZWdleCA9IC88c3R5bGU+XFxzKjxcXC9zdHlsZT4vZ2k7XG4gICAgICAgIGlmIChlbXB0eVN0eWxlUmVnZXgudGVzdChuZXdIdG1sKSkge1xuICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoZW1wdHlTdHlsZVJlZ2V4LCAnJyk7XG4gICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gMSkgXHU0RTNBIDxzY3JpcHQgc3JjPiBcdTZERkJcdTUyQTAvXHU2NkY0XHU2NUIwIHZcbiAgICAgICAgLy9cbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RTBEXHU4OTgxXHU3RUQ5IEVTTSBtb2R1bGUgc2NyaXB0XHVGRjA4dHlwZT1cIm1vZHVsZVwiXHVGRjA5XHU4RkZEXHU1MkEwID92XG4gICAgICAgIC8vIFx1NTQyNlx1NTIxOVx1NTQwQ1x1NEUwMFx1NEUyQVx1NkEyMVx1NTc1N1x1NEYxQVx1NTQwQ1x1NjVGNlx1NEVFNVx1MzAwQ1x1NUUyNiB2XHUzMDBEXHU1NDhDXHUzMDBDXHU0RTBEXHU1RTI2IHZcdTMwMERcdUZGMDhcdTk3NTlcdTYwMDEgaW1wb3J0IFx1NzUxRlx1NjIxMFx1NzY4NCBVUkxcdUZGMDlcdTRFMjRcdTU5NTcgVVJMIFx1ODhBQlx1NTJBMFx1OEY3RFx1RkYwQ1xuICAgICAgICAvLyBcdTU3MjhcdTVGQUVcdTUyNERcdTdBRUYvXHU5MUNEXHU1OTBEXHU1MkEwXHU4RjdEXHU1MTY1XHU1M0UzXHU4MTFBXHU2NzJDXHU1NzNBXHU2NjZGXHU0RTBCXHU0RjFBXHU1QkZDXHU4MUY0XHU2QTIxXHU1NzU3XHU2MjY3XHU4ODRDXHU0RTI0XHU2QjIxXHVGRjBDXHU0RUNFXHU4MDBDXHU4OUU2XHU1M0QxXHU3QzdCXHU0RjNDIEVDaGFydHMgXHU3Njg0XHU5MUNEXHU1OTBEXHU2Q0U4XHU1MThDXHU2NUFEXHU4QTAwXHUzMDAyXG4gICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgLyg8c2NyaXB0W14+XSpcXHMrc3JjPVtcIiddKShbXlwiJ10rKShbXCInXVtePl0qPikvZyxcbiAgICAgICAgICAobWF0Y2g6IHN0cmluZywgcHJlZml4OiBzdHJpbmcsIHNyYzogc3RyaW5nLCBzdWZmaXg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaXNNb2R1bGVTY3JpcHQgPSAvdHlwZVxccyo9XFxzKltcIiddbW9kdWxlW1wiJ10vaS50ZXN0KG1hdGNoKTtcbiAgICAgICAgICAgIGNvbnN0IGlzQXNzZXRzID0gc3JjLnN0YXJ0c1dpdGgoJy9hc3NldHMvJykgfHwgc3JjLnN0YXJ0c1dpdGgoJy4vYXNzZXRzLycpO1xuXG4gICAgICAgICAgICAvLyBcdTVCRjkgbW9kdWxlIHNjcmlwdFx1RkYxQVx1NUYzQVx1NTIzNlx1NzlGQlx1OTY2NCB2XHVGRjBDXHU0RkREXHU4QkMxIFVSTCBcdTRFMEVcdTYyNTNcdTUzMDVcdTRFQTdcdTcyNjlcdTUxODVcdTkwRTggaW1wb3J0IFx1NEZERFx1NjMwMVx1NEUwMFx1ODFGNFxuICAgICAgICAgICAgaWYgKGlzTW9kdWxlU2NyaXB0ICYmIGlzQXNzZXRzKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNsZWFuZWQgPSBzcmMucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovZywgJycpLnJlcGxhY2UoL1xcPyYvLCAnPycpLnJlcGxhY2UoL1s/Jl0kLywgJycpO1xuICAgICAgICAgICAgICBpZiAoY2xlYW5lZCAhPT0gc3JjKSB7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjbGVhbmVkfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc3JjLmluY2x1ZGVzKCc/dj0nKSB8fCBzcmMuaW5jbHVkZXMoJyZ2PScpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWQgPSBzcmMucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovZywgYD92PSR7YnVpbGRUaW1lc3RhbXB9YCk7XG4gICAgICAgICAgICAgIGlmICh1cGRhdGVkICE9PSBzcmMpIHtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke3VwZGF0ZWR9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNBc3NldHMpIHtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBjb25zdCBzZXAgPSBzcmMuaW5jbHVkZXMoJz8nKSA/ICcmJyA6ICc/JztcbiAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke3NyY30ke3NlcH12PSR7YnVpbGRUaW1lc3RhbXB9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIDIpIFx1NEUzQSA8bGluayBocmVmPiBcdTZERkJcdTUyQTAvXHU2NkY0XHU2NUIwIHZcbiAgICAgICAgLy9cbiAgICAgICAgLy8gXHU1NDBDXHU0RTBBXHVGRjFBbW9kdWxlcHJlbG9hZCBcdTVDNUVcdTRFOEUgRVNNIFx1NEY5RFx1OEQ1Nlx1NTZGRVx1NzY4NFx1NEUwMFx1OTBFOFx1NTIwNlx1RkYwQ1x1OEZGRFx1NTJBMCA/diBcdTRGMUFcdThCQTlcdTk4ODRcdTUyQTBcdThGN0QgVVJMIFx1NEUwRSBpbXBvcnQgVVJMIFx1NEUwRFx1NEUwMFx1ODFGNFx1RkYwQ1xuICAgICAgICAvLyBcdTkwMjBcdTYyMTBcdTkxQ0RcdTU5MERcdThCRjdcdTZDNDJcdTc1MUFcdTgxRjNcdTkxQ0RcdTU5MERcdTYyNjdcdTg4NENcdUZGMDhcdTU3MjhcdTY3RDBcdTRFOUIgbG9hZGVyIFx1NTczQVx1NjY2Rlx1NEUwQlx1RkYwOVx1MzAwMlxuICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgIC8oPGxpbmtbXj5dKlxccytocmVmPVtcIiddKShbXlwiJ10rKShbXCInXVtePl0qPikvZyxcbiAgICAgICAgICAobWF0Y2g6IHN0cmluZywgcHJlZml4OiBzdHJpbmcsIGhyZWY6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlzTW9kdWxlUHJlbG9hZCA9IC9cXHNyZWxcXHMqPVxccypbXCInXW1vZHVsZXByZWxvYWRbXCInXS9pLnRlc3QobWF0Y2gpO1xuICAgICAgICAgICAgY29uc3QgaXNBc3NldHMgPSBocmVmLnN0YXJ0c1dpdGgoJy9hc3NldHMvJykgfHwgaHJlZi5zdGFydHNXaXRoKCcuL2Fzc2V0cy8nKTtcblxuICAgICAgICAgICAgaWYgKGlzTW9kdWxlUHJlbG9hZCAmJiBpc0Fzc2V0cykge1xuICAgICAgICAgICAgICBjb25zdCBjbGVhbmVkID0gaHJlZi5yZXBsYWNlKC9bPyZddj1bXiYnXCJdKi9nLCAnJykucmVwbGFjZSgvXFw/Ji8sICc/JykucmVwbGFjZSgvWz8mXSQvLCAnJyk7XG4gICAgICAgICAgICAgIGlmIChjbGVhbmVkICE9PSBocmVmKSB7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjbGVhbmVkfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaHJlZi5pbmNsdWRlcygnP3Y9JykgfHwgaHJlZi5pbmNsdWRlcygnJnY9JykpIHtcbiAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZCA9IGhyZWYucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovZywgYD92PSR7YnVpbGRUaW1lc3RhbXB9YCk7XG4gICAgICAgICAgICAgIGlmICh1cGRhdGVkICE9PSBocmVmKSB7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHt1cGRhdGVkfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzQXNzZXRzKSB7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgY29uc3Qgc2VwID0gaHJlZi5pbmNsdWRlcygnPycpID8gJyYnIDogJz8nO1xuICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7aHJlZn0ke3NlcH12PSR7YnVpbGRUaW1lc3RhbXB9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIDMpIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRCBxaWFua3VuIFx1NkNFOFx1NTE2NVx1NzY4NFx1NTE4NVx1ODA1NCBpbXBvcnQoJy9hc3NldHMvaW5kZXgteHh4LmpzJylcdUZGMENcdTkwN0ZcdTUxNERcdTg4QUJcdTVCQkZcdTRFM0JcdTU3REZcdTU0MERcdTg5RTNcdTY3OTBcbiAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU4RkQ5XHU5MUNDXHU0RTVGXHU0RTBEXHU4OTgxXHU4RkZEXHU1MkEwID92XHVGRjBDXHU5MDdGXHU1MTREXHU1RjYyXHU2MjEwXHUzMDBDXHU1RTI2IHYgLyBcdTRFMERcdTVFMjYgdlx1MzAwRFx1NEUyNFx1NTk1N1x1NTE2NVx1NTNFMyBVUkxcdUZGMENcdTVCRkNcdTgxRjRcdTUxNjVcdTUzRTNcdTZBMjFcdTU3NTdcdTg4QUJcdTkxQ0RcdTU5MERcdTYyNjdcdTg4NENcdTMwMDJcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1NzI4IHFpYW5rdW4gc2FuZGJveCBcdTRFMkRcdTY2RjRcdTUzRUZcdTk3NjBcdTc2ODRcdTUxOTlcdTZDRDVcdTY2MkZcdTc2RjRcdTYzQTVcdThCRkJcdTUxNjhcdTVDNDBcdTUzRDhcdTkxQ0YgX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX19cbiAgICAgICAgLy8gXHU4MDBDXHU0RTBEXHU2NjJGIHdpbmRvdy5fX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fX1x1RkYwOHdpbmRvdyBcdTUzRUZcdTgwRkRcdTg4QUIgcHJveHkgXHU5MUNEXHU1MTk5L1x1NEUwRFx1NTMwNVx1NTQyQiBsb2NhdGlvblx1RkYwOVx1MzAwMlxuICAgICAgICBjb25zdCBvcmlnaW5FeHByID1cbiAgICAgICAgICBgKCh0eXBlb2YgX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18hPT0ndW5kZWZpbmVkJyYmX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18pYCArXG4gICAgICAgICAgYD9uZXcgVVJMKF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fLCh0eXBlb2YgbG9jYXRpb24hPT0ndW5kZWZpbmVkJyYmbG9jYXRpb24ub3JpZ2luKXx8JycpLm9yaWdpbmAgK1xuICAgICAgICAgIGA6KCh0eXBlb2YgbG9jYXRpb24hPT0ndW5kZWZpbmVkJyYmbG9jYXRpb24ub3JpZ2luKXx8JycpKWA7XG4gICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgL2ltcG9ydFxcKFxccyooWydcIl0pKFxcL2Fzc2V0c1xcLyhpbmRleHxtYWluKS1bXidcIl0rKVxcMVxccypcXCkvZyxcbiAgICAgICAgICAoX206IHN0cmluZywgX3E6IHN0cmluZywgYWJzUGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gYGltcG9ydCgvKiBAdml0ZS1pZ25vcmUgKi8gKCR7b3JpZ2luRXhwcn0gKyAnJHthYnNQYXRofScpKWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgICBjb25zb2xlLmluZm8oYFthZGQtdmVyc2lvbl0gXHU1REYyXHU0RTNBIGluZGV4Lmh0bWwgXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU2REZCXHU1MkEwXHU3MjQ4XHU2NzJDXHU1M0Y3OiB2PSR7YnVpbGRUaW1lc3RhbXB9YCk7XG4gICAgICAgICAgcmV0dXJuIG5ld0h0bWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICB9LFxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxccHVibGljLWltYWdlcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9wdWJsaWMtaW1hZ2VzLnRzXCI7LyoqXG4gKiBQdWJsaWMgXHU1NkZFXHU3MjQ3XHU4RDQ0XHU2RTkwXHU1OTA0XHU3NDA2XHU2M0QyXHU0RUY2XG4gKiBcdTVDMDYgcHVibGljIFx1NzZFRVx1NUY1NVx1NEUyRFx1NzY4NFx1NTZGRVx1NzI0N1x1NjU4N1x1NEVGNlx1NjI1M1x1NTMwNVx1NTIzMCBhc3NldHMgXHU3NkVFXHU1RjU1XHU1RTc2XHU2REZCXHU1MkEwXHU1NEM4XHU1RTBDXHU1MDNDXG4gKiBcdTcyNzlcdTZCOEFcdTU5MDRcdTc0MDYgbG9nby5wbmdcdUZGMUFcdTRGRERcdTYzMDFcdTU3MjhcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMENcdTY1ODdcdTRFRjZcdTU0MERcdTRFMERcdTUzRDhcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW3B1YmxpYy1pbWFnZXNdJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1twdWJsaWMtaW1hZ2VzXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW3B1YmxpYy1pbWFnZXNdJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1twdWJsaWMtaW1hZ2VzXScsIC4uLmFyZ3MpLFxufTtcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFJlc29sdmVkQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdHlwZSB7IE91dHB1dE9wdGlvbnMsIE91dHB1dEJ1bmRsZSB9IGZyb20gJ3JvbGx1cCc7XG5pbXBvcnQgeyByZXNvbHZlLCBqb2luLCBleHRuYW1lLCBiYXNlbmFtZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jLCByZWFkZGlyU3luYywgc3RhdFN5bmMsIHdyaXRlRmlsZVN5bmMsIG1rZGlyU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuXG5leHBvcnQgZnVuY3Rpb24gcHVibGljSW1hZ2VzVG9Bc3NldHNQbHVnaW4oYXBwRGlyOiBzdHJpbmcpOiBQbHVnaW4ge1xuICBjb25zdCBpbWFnZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIGNvbnN0IGVtaXR0ZWRGaWxlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIGNvbnN0IHB1YmxpY0ltYWdlRmlsZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICBsZXQgaXNQcm9kdWN0aW9uQnVpbGQgPSBmYWxzZTtcbiAgXG4gIC8vIFx1OTcwMFx1ODk4MVx1NzI3OVx1NkI4QVx1NTkwNFx1NzQwNlx1NzY4NFx1NjU4N1x1NEVGNlx1NTIxN1x1ODg2OFx1RkYxQVx1NjUzRVx1NTcyOFx1NjgzOVx1NzZFRVx1NUY1NVx1RkYwQ1x1NEUwRFx1NEY3Rlx1NzUyOCBoYXNoXHVGRjA4XHU0RUM1XHU3NTI4XHU0RThFIENTUyBcdThERUZcdTVGODRcdTY2RkZcdTYzNjJcdUZGMDlcbiAgY29uc3Qgcm9vdEltYWdlRmlsZXMgPSBbJ2xvZ28ucG5nJywgJ2xvZ2luX2N1dF9kYXJrLnBuZycsICdsb2dpbl9jdXRfbGlnaHQucG5nJ107XG5cbiAgY29uc3QgaXNWaXJ0dWFsTW9kdWxlSWQgPSAoaWQ6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICAgIHJldHVybiBpZC5pbmNsdWRlcygnXFwwJykgfHwgaWQuaW5jbHVkZXMoJ3B1YmxpYy1pbWFnZTonKTtcbiAgfTtcblxuICBjb25zdCBleHRyYWN0T3JpZ2luYWxQYXRoID0gKGlkOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsID0+IHtcbiAgICBpZiAoIWlzVmlydHVhbE1vZHVsZUlkKGlkKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IG9yaWdpbmFsUGF0aCA9IGlkLnJlcGxhY2UoL1xcMHB1YmxpYy1pbWFnZTovZywgJycpLnJlcGxhY2UoL1xcMC9nLCAnJyk7XG4gICAgaWYgKG9yaWdpbmFsUGF0aC5pbmNsdWRlcygnXFwwJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gb3JpZ2luYWxQYXRoO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzJyxcbiAgICBjb25maWdSZXNvbHZlZChjb25maWc6IFJlc29sdmVkQ29uZmlnKSB7XG4gICAgICAvLyBWaXRlIFx1NzY4NCBpc1Byb2R1Y3Rpb24gXHU2NjJGXHU2NzAwXHU1M0VGXHU5NzYwXHU3Njg0XHU1MjI0XHU2NUFEXHVGRjA4XHU5MDdGXHU1MTREIE5PREVfRU5WIC8gREVWIFx1N0I0OVx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1NTcyOCBDSSBcdTRFMkRcdTRFMERcdTRFMDBcdTgxRjRcdUZGMDlcbiAgICAgIGlzUHJvZHVjdGlvbkJ1aWxkID0gISFjb25maWcuaXNQcm9kdWN0aW9uO1xuICAgIH0sXG4gICAgYnVpbGRTdGFydCgpIHtcbiAgICAgIC8vIFx1NTcyOFx1NUYwMFx1NTNEMVx1NkEyMVx1NUYwRlx1NEUwQlx1RkYwQ1ZpdGUgXHU0RjFBXHU3NkY0XHU2M0E1XHU2NzBEXHU1MkExIHB1YmxpYyBcdTc2RUVcdTVGNTVcdTc2ODRcdTY1ODdcdTRFRjZcdUZGMENcdTRFMERcdTk3MDBcdTg5ODFcdTU5MDRcdTc0MDZcbiAgICAgIC8vIFx1NTNFQVx1NTcyOFx1Njc4NFx1NUVGQVx1NkEyMVx1NUYwRlx1NEUwQlx1NjI0RFx1OTcwMFx1ODk4MVx1NTkwNFx1NzQwNlx1NTZGRVx1NzI0N1xuICAgICAgaWYgKCFpc1Byb2R1Y3Rpb25CdWlsZCkge1xuICAgICAgICAvLyBcdTVGMDBcdTUzRDFcdTZBMjFcdTVGMEZcdUZGMENcdTk3NTlcdTlFRDhcdThERjNcdThGQzdcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwdWJsaWNEaXIgPSByZXNvbHZlKGFwcERpciwgJ3B1YmxpYycpO1xuICAgICAgaWYgKCFleGlzdHNTeW5jKHB1YmxpY0RpcikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpbWFnZUV4dGVuc2lvbnMgPSBbJy5wbmcnLCAnLmpwZycsICcuanBlZycsICcuZ2lmJywgJy53ZWJwJywgJy5zdmcnLCAnLmljbyddO1xuICAgICAgLy8gXHU2MzkyXHU5NjY0IGZhdmljb24uaWNvXHVGRjBDXHU3RURGXHU0RTAwXHU0RjdGXHU3NTI4IGxvZ28ucG5nIFx1NEY1Q1x1NEUzQSBmYXZpY29uXG4gICAgICBjb25zdCBleGNsdWRlZEZpbGVzID0gWydmYXZpY29uLmljbyddO1xuICAgICAgY29uc3QgZmlsZXMgPSByZWFkZGlyU3luYyhwdWJsaWNEaXIpO1xuXG4gICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgLy8gXHU4REYzXHU4RkM3XHU2MzkyXHU5NjY0XHU3Njg0XHU2NTg3XHU0RUY2XG4gICAgICAgIGlmIChleGNsdWRlZEZpbGVzLmluY2x1ZGVzKGZpbGUpKSB7XG4gICAgICAgICAgLy8gXHU2Nzg0XHU1RUZBXHU2QTIxXHU1RjBGXHU0RTBCXHU2MjREXHU4RjkzXHU1MUZBXHU2NUU1XHU1RkQ3XG4gICAgICAgICAgY29uc29sZS5pbmZvKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1MjNFRFx1RkUwRiAgXHU4REYzXHU4RkM3ICR7ZmlsZX1cdUZGMDhcdTdFREZcdTRFMDBcdTRGN0ZcdTc1MjggbG9nby5wbmcgXHU0RjVDXHU0RTNBIGZhdmljb25cdUZGMDlgKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgZXh0ID0gZXh0bmFtZShmaWxlKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAoaW1hZ2VFeHRlbnNpb25zLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgICAvLyBcdTY4MzlcdTc2RUVcdTVGNTVcdTU2RkVcdTcyNDdcdTk3MDBcdTg5ODFcdTcyNzlcdTZCOEFcdTU5MDRcdTc0MDZcdUZGMUFcdTRGRERcdTYzMDFcdTU3MjhcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMENcdTY1ODdcdTRFRjZcdTU0MERcdTRFMERcdTUzRDhcdUZGMENcdTRFMERcdTRGN0ZcdTc1MjhcdTU0QzhcdTVFMENcdTUwM0NcbiAgICAgICAgICBpZiAocm9vdEltYWdlRmlsZXMuaW5jbHVkZXMoZmlsZSkpIHtcbiAgICAgICAgICAgIC8vIFx1Njc4NFx1NUVGQVx1NkEyMVx1NUYwRlx1NEUwQlx1NjI0RFx1OEY5M1x1NTFGQVx1NjVFNVx1NUZEN1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1RDgzRFx1RENFNiBcdTU5MDRcdTc0MDYgJHtmaWxlfVx1RkYwQ1x1NUMwNlx1NTkwRFx1NTIzNlx1NTIzMFx1NjgzOVx1NzZFRVx1NUY1NVx1RkYwOFx1NjVFMFx1NTRDOFx1NUUwQ1x1NTAzQ1x1RkYwOWApO1xuICAgICAgICAgICAgLy8gXHU4QkIwXHU1RjU1XHU2NTg3XHU0RUY2XHU3Njg0XHU4REVGXHU1Rjg0XHVGRjBDXHU1NzI4IHdyaXRlQnVuZGxlIFx1OTYzNlx1NkJCNVx1NTkwRFx1NTIzNlx1NTIzMFx1NjgzOVx1NzZFRVx1NUY1NVxuICAgICAgICAgICAgcHVibGljSW1hZ2VGaWxlcy5zZXQoZmlsZSwgam9pbihwdWJsaWNEaXIsIGZpbGUpKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gam9pbihwdWJsaWNEaXIsIGZpbGUpO1xuICAgICAgICAgIGNvbnN0IHN0YXRzID0gc3RhdFN5bmMoZmlsZVBhdGgpO1xuICAgICAgICAgIGlmIChzdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgcHVibGljSW1hZ2VGaWxlcy5zZXQoYC8ke2ZpbGV9YCwgZmlsZVBhdGgpO1xuICAgICAgICAgICAgcHVibGljSW1hZ2VGaWxlcy5zZXQoZmlsZSwgZmlsZVBhdGgpO1xuXG4gICAgICAgICAgICBjb25zdCBmaWxlQ29udGVudCA9IHJlYWRGaWxlU3luYyhmaWxlUGF0aCk7XG4gICAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFSb2xsdXAgXHU3Njg0IGVtaXRGaWxlIFx1NEYxQVx1NUMwNlx1NjU4N1x1NEVGNlx1NjUzRVx1NTcyOCBhc3NldHNEaXJcdUZGMDhcdTlFRDhcdThCQTRcdTY2MkYgJ2Fzc2V0cydcdUZGMDlcbiAgICAgICAgICAgIC8vIFx1NjIxMVx1NEVFQ1x1NEUwRFx1NTcyOCBlbWl0RmlsZSBcdTY1RjZcdTYzMDdcdTVCOUEgZmlsZU5hbWVcdUZGMENcdThCQTkgUm9sbHVwIFx1ODFFQVx1NTJBOFx1NTkwNFx1NzQwNlx1RkYwQ1x1NzEzNlx1NTQwRVx1NTcyOCBnZW5lcmF0ZUJ1bmRsZSBcdTRFMkRcdTgzQjdcdTUzRDZcdTVCOUVcdTk2NDVcdThERUZcdTVGODRcbiAgICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZUlkID0gKHRoaXMgYXMgYW55KS5lbWl0RmlsZSh7XG4gICAgICAgICAgICAgIHR5cGU6ICdhc3NldCcsXG4gICAgICAgICAgICAgIG5hbWU6IGZpbGUsIC8vIFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NEUwRFx1NTQyQlx1OERFRlx1NUY4NFx1RkYwOVx1RkYwQ1JvbGx1cCBcdTRGMUFcdTgxRUFcdTUyQThcdTZERkJcdTUyQTBcdTU0QzhcdTVFMENcdTUwM0NcdTVFNzZcdTY1M0VcdTU3MjggYXNzZXRzRGlyXG4gICAgICAgICAgICAgIHNvdXJjZTogZmlsZUNvbnRlbnQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVtaXR0ZWRGaWxlcy5zZXQoZmlsZSwgcmVmZXJlbmNlSWQpO1xuICAgICAgICAgICAgLy8gXHU2Nzg0XHU1RUZBXHU2QTIxXHU1RjBGXHU0RTBCXHU2MjREXHU4RjkzXHU1MUZBXHU2NUU1XHU1RkQ3XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gXHVEODNEXHVEQ0U2IFx1NUMwNiAke2ZpbGV9IFx1NjI1M1x1NTMwNSAocmVmZXJlbmNlSWQ6ICR7cmVmZXJlbmNlSWR9KWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVzb2x2ZUlkKGlkOiBzdHJpbmcsIF9pbXBvcnRlcjogc3RyaW5nIHwgdW5kZWZpbmVkKTogc3RyaW5nIHwgbnVsbCB8IHsgaWQ6IHN0cmluZzsgZXh0ZXJuYWw/OiBib29sZWFuIH0ge1xuICAgICAgaWYgKGlzVmlydHVhbE1vZHVsZUlkKGlkKSkge1xuICAgICAgICBpZiAoaWQuc3RhcnRzV2l0aCgnXFwwcHVibGljLWltYWdlOicpIHx8IGlkLmluY2x1ZGVzKCdcXDBwdWJsaWMtaW1hZ2U6JykpIHtcbiAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTkwNFx1NzQwNiAvbG9nby5wbmcgXHU3Njg0XHU4OUUzXHU2NzkwXHVGRjBDXHU4QkE5IFJvbGx1cCBcdTgwRkRcdTU5MUZcdTYyN0VcdTUyMzBcdTVCODNcbiAgICAgIC8vIFx1NTM3M1x1NEY3RiBwdWJsaWNEaXIgXHU4OEFCXHU3OTgxXHU3NTI4XHVGRjBDXHU2MjExXHU0RUVDXHU0RUNEXHU3MTM2XHU5NzAwXHU4OTgxXHU4QkE5XHU2Nzg0XHU1RUZBXHU2NUY2XHU4MEZEXHU1OTFGXHU4OUUzXHU2NzkwXHU4RkQ5XHU0RTJBXHU4REVGXHU1Rjg0XG4gICAgICBpZiAoaWQgPT09ICcvbG9nby5wbmcnIHx8IGlkID09PSAnbG9nby5wbmcnKSB7XG4gICAgICAgIGNvbnN0IGxvZ29QYXRoID0gcHVibGljSW1hZ2VGaWxlcy5nZXQoJ2xvZ28ucG5nJyk7XG4gICAgICAgIGlmIChsb2dvUGF0aCAmJiBleGlzdHNTeW5jKGxvZ29QYXRoKSkge1xuICAgICAgICAgIC8vIFx1OEZENFx1NTZERVx1NUI5RVx1OTY0NVx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1RkYwQ1x1OEJBOSBSb2xsdXAgXHU4MEZEXHU1OTFGXHU1OTA0XHU3NDA2XG4gICAgICAgICAgcmV0dXJuIGxvZ29QYXRoO1xuICAgICAgICB9XG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1OEZENFx1NTZERVx1ODY1QVx1NjJERlx1NkEyMVx1NTc1NyBJRFxuICAgICAgICByZXR1cm4gYFxcMHB1YmxpYy1pbWFnZTovbG9nby5wbmdgO1xuICAgICAgfVxuXG4gICAgICBpZiAoaWQuc3RhcnRzV2l0aCgnLycpICYmIHB1YmxpY0ltYWdlRmlsZXMuaGFzKGlkKSkge1xuICAgICAgICByZXR1cm4gYFxcMHB1YmxpYy1pbWFnZToke2lkfWA7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIGxvYWQoaWQ6IHN0cmluZykge1xuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1OTA0XHU3NDA2XHU2ODM5XHU3NkVFXHU1RjU1XHU1NkZFXHU3MjQ3XHU3Njg0XHU1MkEwXHU4RjdEXG4gICAgICAvLyBcdTU5ODJcdTY3OUMgaWQgXHU2NjJGXHU1QjlFXHU5NjQ1XHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHVGRjA4XHU0RTBEXHU2NjJGXHU4NjVBXHU2MkRGXHU2QTIxXHU1NzU3XHVGRjA5XHVGRjBDXHU3NkY0XHU2M0E1XHU4RkQ0XHU1NkRFXHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XG4gICAgICBmb3IgKGNvbnN0IHJvb3RGaWxlIG9mIHJvb3RJbWFnZUZpbGVzKSB7XG4gICAgICAgIGlmIChpZC5lbmRzV2l0aChyb290RmlsZSkgJiYgZXhpc3RzU3luYyhpZCkpIHtcbiAgICAgICAgICAvLyBcdTVCRjlcdTRFOEVcdTY4MzlcdTc2RUVcdTVGNTVcdTU2RkVcdTcyNDdcdUZGMENcdThGRDRcdTU2REVcdTRFMDBcdTRFMkFcdTVCRkNcdTUxRkFcdThERUZcdTVGODRcdTc2ODRcdTZBMjFcdTU3NTdcbiAgICAgICAgICAvLyBcdTU3MjhcdThGRDBcdTg4NENcdTY1RjZcdUZGMENcdTU2RkVcdTcyNDdcdTRGMUFcdTU3MjhcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMENcdTYyNDBcdTRFRTVcdThGRDRcdTU2REUgXCIvXHU2NTg3XHU0RUY2XHU1NDBEXCJcbiAgICAgICAgICByZXR1cm4gYGV4cG9ydCBkZWZhdWx0IFwiLyR7cm9vdEZpbGV9XCI7YDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIWlzVmlydHVhbE1vZHVsZUlkKGlkKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3JpZ2luYWxQYXRoID0gZXh0cmFjdE9yaWdpbmFsUGF0aChpZCk7XG4gICAgICBpZiAoIW9yaWdpbmFsUGF0aCkge1xuICAgICAgICAvLyBcdTcyNzlcdTZCOEFcdTU5MDRcdTc0MDZcdTY4MzlcdTc2RUVcdTVGNTVcdTU2RkVcdTcyNDdcbiAgICAgICAgZm9yIChjb25zdCByb290RmlsZSBvZiByb290SW1hZ2VGaWxlcykge1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhyb290RmlsZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBgZXhwb3J0IGRlZmF1bHQgXCIvJHtyb290RmlsZX1cIjtgO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLndhcm4oYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gXHUyNkEwXHVGRTBGICBcdTY1RTBcdTZDRDVcdTYzRDBcdTUzRDZcdTUzOUZcdTU5Q0JcdThERUZcdTVGODRcdUZGMENcdThERjNcdThGQzc6ICR7aWR9YCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBmaWxlTmFtZSA9IGJhc2VuYW1lKG9yaWdpbmFsUGF0aCk7XG5cbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjYyRlx1NjgzOVx1NzZFRVx1NUY1NVx1NTZGRVx1NzI0N1x1RkYwQ1x1NzZGNFx1NjNBNVx1OEZENFx1NTZERVx1OERFRlx1NUY4NFxuICAgICAgaWYgKHJvb3RJbWFnZUZpbGVzLmluY2x1ZGVzKGZpbGVOYW1lKSkge1xuICAgICAgICByZXR1cm4gYGV4cG9ydCBkZWZhdWx0IFwiLyR7ZmlsZU5hbWV9XCI7YDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVmZXJlbmNlSWQgPSBlbWl0dGVkRmlsZXMuZ2V0KGZpbGVOYW1lKTtcbiAgICAgIGlmIChyZWZlcmVuY2VJZCkge1xuICAgICAgICByZXR1cm4gYGV4cG9ydCBkZWZhdWx0IFwiLyR7ZmlsZU5hbWV9XCI7YDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBnZW5lcmF0ZUJ1bmRsZShfb3B0aW9uczogT3V0cHV0T3B0aW9ucywgYnVuZGxlOiBPdXRwdXRCdW5kbGUpIHtcbiAgICAgIGNvbnN0IGJ1bmRsZUFzc2V0cyA9IE9iamVjdC5lbnRyaWVzKGJ1bmRsZSkuZmlsdGVyKChbXywgY2h1bmtdKSA9PiAoY2h1bmsgYXMgYW55KS50eXBlID09PSAnYXNzZXQnKTtcbiAgICAgIGNvbnNvbGUuaW5mbyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdUQ4M0RcdURDQ0IgYnVuZGxlIFx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1NjU4N1x1NEVGNlx1NjU3MFx1OTFDRjogJHtidW5kbGVBc3NldHMubGVuZ3RofWApO1xuXG4gICAgICBjb25zb2xlLmluZm8oYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gXHVEODNEXHVERDBEIFx1NUYwMFx1NTlDQlx1NTkwNFx1NzQwNiAke2VtaXR0ZWRGaWxlcy5zaXplfSBcdTRFMkFcdTVERjJcdTUzRDFcdTUxRkFcdTc2ODRcdTY1ODdcdTRFRjZgKTtcbiAgICAgIGZvciAoY29uc3QgW29yaWdpbmFsRmlsZSwgcmVmZXJlbmNlSWRdIG9mIGVtaXR0ZWRGaWxlcy5lbnRyaWVzKCkpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBhY3R1YWxGaWxlTmFtZSA9ICh0aGlzIGFzIGFueSkuZ2V0RmlsZU5hbWUocmVmZXJlbmNlSWQpO1xuXG4gICAgICAgICAgaWYgKCFhY3R1YWxGaWxlTmFtZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1MjZBMFx1RkUwRiAgXHU2NUUwXHU2Q0Q1XHU4M0I3XHU1M0Q2ICR7b3JpZ2luYWxGaWxlfSBcdTc2ODRcdTY1ODdcdTRFRjZcdTU0MEQgKHJlZmVyZW5jZUlkOiAke3JlZmVyZW5jZUlkfSlgKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGFzc2V0Q2h1bmsgPSBidW5kbGVbYWN0dWFsRmlsZU5hbWVdO1xuICAgICAgICAgIGlmICghYXNzZXRDaHVuayB8fCBhc3NldENodW5rLnR5cGUgIT09ICdhc3NldCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdTI2QTBcdUZFMEYgIFx1NTcyOCBidW5kbGUgXHU0RTJEXHU2NzJBXHU2MjdFXHU1MjMwICR7YWN0dWFsRmlsZU5hbWV9IChcdTUzOUZcdTU5Q0JcdTY1ODdcdTRFRjY6ICR7b3JpZ2luYWxGaWxlfSlgKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZERFx1NjMwMVx1NUI4Q1x1NjU3NFx1NzY4NFx1OERFRlx1NUY4NFx1RkYwQ1x1NTMwNVx1NjJFQyBhc3NldHMvIFx1NTI0RFx1N0YwMFx1RkYwOFx1NTk4Mlx1Njc5Q1x1NUI1OFx1NTcyOFx1RkYwOVxuICAgICAgICAgIC8vIFJvbGx1cCBcdTRGMUFcdTVDMDZcdTY1ODdcdTRFRjZcdTY1M0VcdTU3MjggYXNzZXRzIFx1NzZFRVx1NUY1NVx1RkYwQ1x1NjI0MFx1NEVFNVx1OERFRlx1NUY4NFx1NUU5NFx1OEJFNVx1NjYyRiBhc3NldHMvZmlsZW5hbWVcbiAgICAgICAgICBjb25zdCBmaWxlTmFtZVdpdGhQYXRoID0gYWN0dWFsRmlsZU5hbWU7IC8vIFx1NEZERFx1NjMwMVx1NTM5Rlx1NTlDQlx1OERFRlx1NUY4NFx1RkYwQ1x1NTMwNVx1NjJFQyBhc3NldHMvIFx1NTI0RFx1N0YwMFxuICAgICAgICAgIGltYWdlTWFwLnNldChvcmlnaW5hbEZpbGUsIGZpbGVOYW1lV2l0aFBhdGgpO1xuICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdTI3MDUgJHtvcmlnaW5hbEZpbGV9IC0+ICR7ZmlsZU5hbWVXaXRoUGF0aH0gKFJvbGx1cCBcdTc1MUZcdTYyMTBcdTc2ODRcdTY1ODdcdTRFRjZcdTU0MEQpYCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1MjZBMFx1RkUwRiAgXHU1OTA0XHU3NDA2ICR7b3JpZ2luYWxGaWxlfSBcdTY1RjZcdTUxRkFcdTk1MTk6YCwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChpbWFnZU1hcC5zaXplID09PSAwKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdTI2QTBcdUZFMEYgIGltYWdlTWFwIFx1NEUzQVx1N0E3QVx1RkYwQ1x1NTNFRlx1ODBGRCBlbWl0RmlsZSBcdTZDQTFcdTY3MDlcdTYyMTBcdTUyOUZcdTYyNjdcdTg4NENgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdUQ4M0RcdURDREQgaW1hZ2VNYXAgXHU1MTg1XHU1QkI5OmAsIEFycmF5LmZyb20oaW1hZ2VNYXAuZW50cmllcygpKS5tYXAoKFtrLCB2XSkgPT4gYCR7a30gLT4gJHt2fWApLmpvaW4oJywgJykpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IFtmaWxlTmFtZSwgY2h1bmtdIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmRsZSkpIHtcbiAgICAgICAgY29uc3QgYzogYW55ID0gY2h1bms7XG4gICAgICAgIGlmIChjLnR5cGUgPT09ICdjaHVuaycgJiYgYy5jb2RlKSB7XG4gICAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG4gICAgICAgICAgbGV0IG5ld0NvZGUgPSBjLmNvZGU7XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IFtvcmlnaW5hbEZpbGUsIGhhc2hlZEZpbGVdIG9mIGltYWdlTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxQYXRoID0gYC8ke29yaWdpbmFsRmlsZX1gO1xuICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBaGFzaGVkRmlsZSBcdTUzRUZcdTgwRkRcdTVERjJcdTdFQ0ZcdTUzMDVcdTU0MkIgYXNzZXRzLyBcdTUyNERcdTdGMDBcdUZGMENcdTk3MDBcdTg5ODFcdTc4NkVcdTRGRERcdThERUZcdTVGODRcdTZCNjNcdTc4NkVcbiAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBoYXNoZWRGaWxlLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSA/IGAvJHtoYXNoZWRGaWxlfWAgOiBgLyR7aGFzaGVkRmlsZX1gO1xuICAgICAgICAgICAgY29uc3QgZXNjYXBlZFBhdGggPSBvcmlnaW5hbFBhdGgucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcblxuICAgICAgICAgICAgY29uc3Qgc3RyaW5nUGF0dGVybiA9IG5ldyBSZWdFeHAoYChbXCInXFxgXSkke2VzY2FwZWRQYXRofShbXCInXFxgXSlgLCAnZycpO1xuICAgICAgICAgICAgaWYgKG5ld0NvZGUuaW5jbHVkZXMob3JpZ2luYWxQYXRoKSkge1xuICAgICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHN0cmluZ1BhdHRlcm4sIGAkMSR7bmV3UGF0aH0kMmApO1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgICBjLmNvZGUgPSBuZXdDb2RlO1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1RDgzRFx1REQwNCBcdTY2RjRcdTY1QjAgJHtmaWxlTmFtZX0gXHU0RTJEXHU3Njg0XHU1NkZFXHU3MjQ3XHU1RjE1XHU3NTI4YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGMudHlwZSA9PT0gJ2Fzc2V0JyAmJiBmaWxlTmFtZS5lbmRzV2l0aCgnLmNzcycpICYmIChjIGFzIGFueSkuc291cmNlKSB7XG4gICAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG4gICAgICAgICAgbGV0IG5ld1NvdXJjZSA9IHR5cGVvZiAoYyBhcyBhbnkpLnNvdXJjZSA9PT0gJ3N0cmluZycgPyAoYyBhcyBhbnkpLnNvdXJjZSA6IEJ1ZmZlci5mcm9tKChjIGFzIGFueSkuc291cmNlKS50b1N0cmluZygndXRmLTgnKTtcblxuICAgICAgICAgIC8vIFx1OTk5Nlx1NTE0OFx1NTkwNFx1NzQwNlx1NjgzOVx1NzZFRVx1NUY1NVx1NTZGRVx1NzI0N1x1RkYxQVx1NjZGRlx1NjM2Mlx1NEUzQVx1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICAgICAgICAgIGZvciAoY29uc3Qgcm9vdEZpbGUgb2Ygcm9vdEltYWdlRmlsZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvb3RQYXRoID0gYC8ke3Jvb3RGaWxlfWA7XG4gICAgICAgICAgICAvLyBcdTUzMzlcdTkxNEQgYXNzZXRzIFx1NzZFRVx1NUY1NVx1NEUyRFx1NzY4NFx1NUYxNVx1NzUyOFx1RkYwOFZpdGUgXHU1M0VGXHU4MEZEXHU1REYyXHU3RUNGXHU1OTA0XHU3NDA2XHU4RkM3XHVGRjBDXHU2REZCXHU1MkEwXHU0RTg2IGhhc2hcdUZGMDlcbiAgICAgICAgICAgIC8vIFx1NjgzQ1x1NUYwRlx1NTNFRlx1ODBGRFx1NjYyRlx1RkYxQS9hc3NldHMvbG9naW5fY3V0X2RhcmstQ2hLRDVVcG8ucG5nIFx1NjIxNiB1cmwoL2Fzc2V0cy9sb2dpbl9jdXRfZGFyay1DaEtENVVwby5wbmcpXG4gICAgICAgICAgICAvLyBcdTk3MDBcdTg5ODFcdTUzMzlcdTkxNERcdTY1ODdcdTRFRjZcdTU0MERcdTkwRThcdTUyMDZcdUZGMDhcdTRFMERcdTU0MkJcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDkrIGhhc2ggKyBcdTYyNjlcdTVDNTVcdTU0MERcbiAgICAgICAgICAgIGNvbnN0IGZpbGVOYW1lV2l0aG91dEV4dCA9IHJvb3RGaWxlLnJlcGxhY2UoL1xcLihwbmd8anBnfGpwZWd8Z2lmfHdlYnB8c3ZnfGljbykkL2ksICcnKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVFeHQgPSByb290RmlsZS5tYXRjaCgvXFwuKHBuZ3xqcGd8anBlZ3xnaWZ8d2VicHxzdmd8aWNvKSQvaSk/LlswXSB8fCAnLnBuZyc7XG4gICAgICAgICAgICAvLyBcdThGNkNcdTRFNDlcdTcyNzlcdTZCOEFcdTVCNTdcdTdCMjZcdUZGMENcdTRGNDZcdTRGRERcdTc1NTlcdTRFMEJcdTUyMTJcdTdFQkZcbiAgICAgICAgICAgIGNvbnN0IGVzY2FwZWRGaWxlTmFtZSA9IGZpbGVOYW1lV2l0aG91dEV4dC5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpO1xuICAgICAgICAgICAgLy8gXHU1MzM5XHU5MTREIC9hc3NldHMvXHU2NTg3XHU0RUY2XHU1NDBELWhhc2guXHU2MjY5XHU1QzU1XHU1NDBEIFx1NjgzQ1x1NUYwRlx1RkYwOFx1NTcyOCB1cmwoKSBcdTRFMkRcdTYyMTZcdTc2RjRcdTYzQTVcdTVGMTVcdTc1MjhcdUZGMDlcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0c1BhdHRlcm4gPSBuZXcgUmVnRXhwKGAvYXNzZXRzLyR7ZXNjYXBlZEZpbGVOYW1lfS1bQS1aYS16MC05XXs0LH0ke2ZpbGVFeHQucmVwbGFjZSgnLicsICdcXFxcLicpfWAsICdnJyk7XG4gICAgICAgICAgICBpZiAoYXNzZXRzUGF0dGVybi50ZXN0KG5ld1NvdXJjZSkpIHtcbiAgICAgICAgICAgICAgbmV3U291cmNlID0gbmV3U291cmNlLnJlcGxhY2UoYXNzZXRzUGF0dGVybiwgcm9vdFBhdGgpO1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdUQ4M0RcdUREMDQgXHU2NkY0XHU2NUIwIENTUyAke2ZpbGVOYW1lfSBcdTRFMkRcdTc2ODRcdTY4MzlcdTc2RUVcdTVGNTVcdTU2RkVcdTcyNDdcdTVGMTVcdTc1Mjg6IC9hc3NldHMvJHtyb290RmlsZX0gLT4gJHtyb290UGF0aH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NEU1Rlx1NTMzOVx1OTE0RFx1NzZGNFx1NjNBNVx1NzY4NFx1NjgzOVx1OERFRlx1NUY4NFx1NUYxNVx1NzUyOFx1RkYwOFx1NURGMlx1N0VDRlx1NjYyRlx1NjgzOVx1OERFRlx1NUY4NFx1RkYwQ1x1NEUwRFx1OTcwMFx1ODk4MVx1NEZFRVx1NjUzOVx1RkYwOVxuICAgICAgICAgICAgY29uc3Qgcm9vdFBhdHRlcm4gPSBuZXcgUmVnRXhwKGB1cmxcXFxcKFtcIiddPyR7cm9vdFBhdGgucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKX0oXFxcXD9bXlwiJyldKik/W1wiJ10/XFxcXClgLCAnZycpO1xuICAgICAgICAgICAgaWYgKHJvb3RQYXR0ZXJuLnRlc3QobmV3U291cmNlKSkge1xuICAgICAgICAgICAgICAvLyBcdTVERjJcdTdFQ0ZcdTY2MkZcdTY4MzlcdThERUZcdTVGODRcdUZGMENcdTRFMERcdTk3MDBcdTg5ODFcdTRGRUVcdTY1MzlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTcxMzZcdTU0MEVcdTU5MDRcdTc0MDZcdTUxNzZcdTRFRDZcdTU2RkVcdTcyNDdcdUZGMDhcdTVFMjYgaGFzaCBcdTc2ODRcdUZGMDlcbiAgICAgICAgICBmb3IgKGNvbnN0IFtvcmlnaW5hbEZpbGUsIGhhc2hlZEZpbGVdIG9mIGltYWdlTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgLy8gXHU4REYzXHU4RkM3XHU2ODM5XHU3NkVFXHU1RjU1XHU1NkZFXHU3MjQ3XHVGRjBDXHU1REYyXHU3RUNGXHU1OTA0XHU3NDA2XHU4RkM3XHU0RTg2XG4gICAgICAgICAgICBpZiAocm9vdEltYWdlRmlsZXMuaW5jbHVkZXMob3JpZ2luYWxGaWxlKSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxQYXRoID0gYC8ke29yaWdpbmFsRmlsZX1gO1xuICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBaGFzaGVkRmlsZSBcdTUzRUZcdTgwRkRcdTVERjJcdTdFQ0ZcdTUzMDVcdTU0MkIgYXNzZXRzLyBcdTUyNERcdTdGMDBcdUZGMENcdTk3MDBcdTg5ODFcdTc4NkVcdTRGRERcdThERUZcdTVGODRcdTZCNjNcdTc4NkVcbiAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBoYXNoZWRGaWxlLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSA/IGAvJHtoYXNoZWRGaWxlfWAgOiBgLyR7aGFzaGVkRmlsZX1gO1xuICAgICAgICAgICAgY29uc3QgZXNjYXBlZFBhdGggPSBvcmlnaW5hbFBhdGgucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcblxuICAgICAgICAgICAgLy8gXHU1MzM5XHU5MTREXHU1OTFBXHU3OUNEIFVSTCBcdTY4M0NcdTVGMEZcdUZGMUFcbiAgICAgICAgICAgIC8vIDEuIHVybCgvcGF0aCkgLSBcdTY1RTBcdTVGMTVcdTUzRjdcbiAgICAgICAgICAgIC8vIDIuIHVybChcIi9wYXRoXCIpIC0gXHU1M0NDXHU1RjE1XHU1M0Y3XG4gICAgICAgICAgICAvLyAzLiB1cmwoJy9wYXRoJykgLSBcdTUzNTVcdTVGMTVcdTUzRjdcbiAgICAgICAgICAgIC8vIDQuIHVybCgvcGF0aD9xdWVyeSkgLSBcdTVFMjZcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcbiAgICAgICAgICAgIGNvbnN0IHVybFBhdHRlcm5zID0gW1xuICAgICAgICAgICAgICBuZXcgUmVnRXhwKGB1cmxcXFxcKCR7ZXNjYXBlZFBhdGh9KFxcXFw/W14pXSopP1xcXFwpYCwgJ2cnKSxcbiAgICAgICAgICAgICAgbmV3IFJlZ0V4cChgdXJsXFxcXChbXCInXSR7ZXNjYXBlZFBhdGh9KFxcXFw/W15cIiddKik/W1wiJ11cXFxcKWAsICdnJyksXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgdXJsUGF0dGVybnMpIHtcbiAgICAgICAgICAgICAgaWYgKHBhdHRlcm4udGVzdChuZXdTb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgbmV3U291cmNlID0gbmV3U291cmNlLnJlcGxhY2UocGF0dGVybiwgKG1hdGNoOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgIC8vIFx1NEZERFx1NzU1OVx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1RkYwOFx1NTk4Mlx1Njc5Q1x1NjcwOVx1RkYwOVxuICAgICAgICAgICAgICAgICAgY29uc3QgcXVlcnlNYXRjaCA9IG1hdGNoLm1hdGNoKC8oXFw/W14pXSopLyk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBxdWVyeSA9IHF1ZXJ5TWF0Y2ggPyBxdWVyeU1hdGNoWzFdIDogJyc7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2gucmVwbGFjZShvcmlnaW5hbFBhdGgsIG5ld1BhdGgpLnJlcGxhY2UoL1xcP1teKV0qLywgcXVlcnkgPyBxdWVyeSA6ICcnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1RDgzRFx1REQwNCBcdTY2RjRcdTY1QjAgQ1NTICR7ZmlsZU5hbWV9IFx1NEUyRFx1NzY4NFx1NUYxNVx1NzUyODogJHtvcmlnaW5hbFBhdGh9IC0+ICR7bmV3UGF0aH1gKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgICAgKGMgYXMgYW55KS5zb3VyY2UgPSBuZXdTb3VyY2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB3cml0ZUJ1bmRsZShvcHRpb25zOiBPdXRwdXRPcHRpb25zKSB7XG4gICAgICBjb25zdCBvdXRwdXREaXIgPSBvcHRpb25zLmRpciB8fCByZXNvbHZlKGFwcERpciwgJ2Rpc3QnKTtcblxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1OTBEXHU1MjM2XHU2ODM5XHU3NkVFXHU1RjU1XHU1NkZFXHU3MjQ3XHU1MjMwXHU2ODM5XHU3NkVFXHU1RjU1XHVGRjA4XHU0RTBEXHU0RjdGXHU3NTI4XHU1NEM4XHU1RTBDXHU1MDNDXHVGRjBDXHU0RkREXHU2MzAxXHU1MzlGXHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA5XG4gICAgICBmb3IgKGNvbnN0IHJvb3RGaWxlIG9mIHJvb3RJbWFnZUZpbGVzKSB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcHVibGljSW1hZ2VGaWxlcy5nZXQocm9vdEZpbGUpO1xuICAgICAgICBpZiAoZmlsZVBhdGggJiYgZXhpc3RzU3luYyhmaWxlUGF0aCkpIHtcbiAgICAgICAgICBjb25zdCBmaWxlRGVzdCA9IGpvaW4ob3V0cHV0RGlyLCByb290RmlsZSk7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVDb250ZW50ID0gcmVhZEZpbGVTeW5jKGZpbGVQYXRoKTtcbiAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMoZmlsZURlc3QsIGZpbGVDb250ZW50KTtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdTI3MDUgXHU1REYyXHU1OTBEXHU1MjM2ICR7cm9vdEZpbGV9IFx1NTIzMFx1NjgzOVx1NzZFRVx1NUY1NTogJHtmaWxlRGVzdH1gKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1MjZBMFx1RkUwRiAgXHU1OTBEXHU1MjM2ICR7cm9vdEZpbGV9IFx1NTkzMVx1OEQyNTpgLCBlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTkwRFx1NTIzNiBicmlkZ2UuaHRtbCBcdTUyMzBcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMDhcdTc1MjhcdTRFOEVcdThERThcdTVCNTBcdTU3REZcdTkwMUFcdTRGRTFcdUZGMDlcbiAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQWJyaWRnZS5odG1sIFx1NUU5NFx1OEJFNVx1NTNFQVx1NTcyOCBtYWluLWFwcCBcdTRFMkRcdTVCNThcdTU3MjhcdUZGMENcdTU2RTBcdTRFM0FcdTYyNDBcdTY3MDlcdTVCNTBcdTVFOTRcdTc1MjhcdTkwRkRcdThCQkZcdTk1RUVcdTRFM0JcdTU3REZcdTc2ODQgYnJpZGdlLmh0bWxcbiAgICAgIGNvbnN0IHB1YmxpY0RpciA9IHJlc29sdmUoYXBwRGlyLCAncHVibGljJyk7XG4gICAgICBjb25zdCBicmlkZ2VIdG1sUGF0aCA9IGpvaW4ocHVibGljRGlyLCAnYnJpZGdlLmh0bWwnKTtcbiAgICAgIGlmIChleGlzdHNTeW5jKGJyaWRnZUh0bWxQYXRoKSkge1xuICAgICAgICBjb25zdCBicmlkZ2VIdG1sRGVzdCA9IGpvaW4ob3V0cHV0RGlyLCAnYnJpZGdlLmh0bWwnKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBmaWxlQ29udGVudCA9IHJlYWRGaWxlU3luYyhicmlkZ2VIdG1sUGF0aCk7XG4gICAgICAgICAgd3JpdGVGaWxlU3luYyhicmlkZ2VIdG1sRGVzdCwgZmlsZUNvbnRlbnQpO1xuICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdTI3MDUgXHU1REYyXHU1OTBEXHU1MjM2IGJyaWRnZS5odG1sIFx1NTIzMFx1NjgzOVx1NzZFRVx1NUY1NTogJHticmlkZ2VIdG1sRGVzdH1gKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1Mjc0QyBcdTU5MERcdTUyMzYgYnJpZGdlLmh0bWwgXHU1OTMxXHU4RDI1OmAsIGVycm9yKTtcbiAgICAgICAgICB0aHJvdyBlcnJvcjsgLy8gXHU2MjlCXHU1MUZBXHU5NTE5XHU4QkVGXHVGRjBDXHU3ODZFXHU0RkREXHU2Nzg0XHU1RUZBXHU1OTMxXHU4RDI1XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGJyaWRnZS5odG1sIFx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NjYyRiBtYWluLWFwcFx1RkYwOFx1NUU5NFx1OEJFNVx1NUI1OFx1NTcyOFx1RkYwOVxuICAgICAgICBjb25zdCBhcHBOYW1lID0gYXBwRGlyLnNwbGl0KC9bL1xcXFxdLykucG9wKCkgfHwgJyc7XG4gICAgICAgIGlmIChhcHBOYW1lID09PSAnbWFpbi1hcHAnKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1MjZBMFx1RkUwRiAgXHU4QjY2XHU1NDRBOiBtYWluLWFwcCBcdTc2ODQgcHVibGljL2JyaWRnZS5odG1sIFx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwMWApO1xuICAgICAgICAgIGNvbnNvbGUud2FybihgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdTI2QTBcdUZFMEYgIFx1OEZEOVx1NEYxQVx1NUJGQ1x1ODFGNFx1OERFOFx1NUI1MFx1NTdERlx1OTAxQVx1NEZFMVx1NTkzMVx1OEQyNVx1MzAwMlx1OEJGN1x1Nzg2RVx1NEZERCBicmlkZ2UuaHRtbCBcdTVCNThcdTU3MjhcdTRFOEUgcHVibGljIFx1NzZFRVx1NUY1NVx1MzAwMmApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFx1NTE3Nlx1NEVENlx1NUU5NFx1NzUyOFx1NEUwRFx1OTcwMFx1ODk4MSBicmlkZ2UuaHRtbFx1RkYwOFx1NUI4M1x1NEVFQ1x1OEJCRlx1OTVFRVx1NEUzQlx1NTdERlx1NzY4NCBicmlkZ2UuaHRtbFx1RkYwOVxuICAgICAgfVxuXG4gICAgICBpZiAoaW1hZ2VNYXAuc2l6ZSA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFzc2V0c0RpclBhdGggPSBqb2luKG91dHB1dERpciwgJ2Fzc2V0cycpO1xuXG4gICAgICBpZiAoIWV4aXN0c1N5bmMoYXNzZXRzRGlyUGF0aCkpIHtcbiAgICAgICAgbWtkaXJTeW5jKGFzc2V0c0RpclBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpbmRleEh0bWxQYXRoID0gam9pbihvdXRwdXREaXIsICdpbmRleC5odG1sJyk7XG5cbiAgICAgIGlmIChleGlzdHNTeW5jKGluZGV4SHRtbFBhdGgpKSB7XG4gICAgICAgIGxldCBodG1sID0gcmVhZEZpbGVTeW5jKGluZGV4SHRtbFBhdGgsICd1dGYtOCcpO1xuICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKGNvbnN0IFtvcmlnaW5hbEZpbGUsIGhhc2hlZEZpbGVdIG9mIGltYWdlTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgIC8vIFx1OERGM1x1OEZDN1x1NjgzOVx1NzZFRVx1NUY1NVx1NTZGRVx1NzI0N1x1RkYwQ1x1NEZERFx1NjMwMVx1NTM5Rlx1NjU4N1x1NEVGNlx1NTQwRFxuICAgICAgICAgIGlmIChyb290SW1hZ2VGaWxlcy5pbmNsdWRlcyhvcmlnaW5hbEZpbGUpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBvcmlnaW5hbFBhdGggPSBgLyR7b3JpZ2luYWxGaWxlfWA7XG4gICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGAvJHtoYXNoZWRGaWxlfWA7XG5cbiAgICAgICAgICBpZiAoaHRtbC5pbmNsdWRlcyhvcmlnaW5hbFBhdGgpKSB7XG4gICAgICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKG5ldyBSZWdFeHAob3JpZ2luYWxQYXRoLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJyksICdnJyksIG5ld1BhdGgpO1xuICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1RDgzRFx1REQwNCBcdTY2RjRcdTY1QjAgSFRNTCBcdTRFMkRcdTc2ODRcdTVGMTVcdTc1Mjg6ICR7b3JpZ2luYWxQYXRofSAtPiAke25ld1BhdGh9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgd3JpdGVGaWxlU3luYyhpbmRleEh0bWxQYXRoLCBodG1sLCAndXRmLTgnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBhc3NldHNEaXIgPSBqb2luKG91dHB1dERpciwgJ2Fzc2V0cycpO1xuICAgICAgaWYgKGV4aXN0c1N5bmMoYXNzZXRzRGlyKSkge1xuICAgICAgICBjb25zdCBqc0ZpbGVzID0gcmVhZGRpclN5bmMoYXNzZXRzRGlyKS5maWx0ZXIoZiA9PiBmLmVuZHNXaXRoKCcuanMnKSB8fCBmLmVuZHNXaXRoKCcubWpzJykpO1xuICAgICAgICBjb25zdCBjc3NGaWxlcyA9IHJlYWRkaXJTeW5jKGFzc2V0c0RpcikuZmlsdGVyKGYgPT4gZi5lbmRzV2l0aCgnLmNzcycpKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgWy4uLmpzRmlsZXMsIC4uLmNzc0ZpbGVzXSkge1xuICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gam9pbihhc3NldHNEaXIsIGZpbGUpO1xuICAgICAgICAgIGxldCBjb250ZW50ID0gcmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAgIC8vIFx1OTk5Nlx1NTE0OFx1NTkwNFx1NzQwNlx1NjgzOVx1NzZFRVx1NUY1NVx1NTZGRVx1NzI0N1x1RkYxQVx1NjZGRlx1NjM2Mlx1NEUzQVx1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICAgICAgICAgIGZvciAoY29uc3Qgcm9vdEZpbGUgb2Ygcm9vdEltYWdlRmlsZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvb3RQYXRoID0gYC8ke3Jvb3RGaWxlfWA7XG4gICAgICAgICAgICAvLyBcdTUzMzlcdTkxNEQgYXNzZXRzIFx1NzZFRVx1NUY1NVx1NEUyRFx1NzY4NFx1NUYxNVx1NzUyOFx1RkYwOFZpdGUgXHU1M0VGXHU4MEZEXHU1REYyXHU3RUNGXHU1OTA0XHU3NDA2XHU4RkM3XHVGRjBDXHU2REZCXHU1MkEwXHU0RTg2IGhhc2hcdUZGMDlcbiAgICAgICAgICAgIC8vIFx1NjgzQ1x1NUYwRlx1NTNFRlx1ODBGRFx1NjYyRlx1RkYxQS9hc3NldHMvbG9naW5fY3V0X2RhcmstQ2hLRDVVcG8ucG5nXG4gICAgICAgICAgICAvLyBcdTk3MDBcdTg5ODFcdTUzMzlcdTkxNERcdTY1ODdcdTRFRjZcdTU0MERcdTkwRThcdTUyMDZcdUZGMDhcdTRFMERcdTU0MkJcdTYyNjlcdTVDNTVcdTU0MERcdUZGMDkrIGhhc2ggKyBcdTYyNjlcdTVDNTVcdTU0MERcbiAgICAgICAgICAgIGNvbnN0IGZpbGVOYW1lV2l0aG91dEV4dCA9IHJvb3RGaWxlLnJlcGxhY2UoL1xcLihwbmd8anBnfGpwZWd8Z2lmfHdlYnB8c3ZnfGljbykkL2ksICcnKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVFeHQgPSByb290RmlsZS5tYXRjaCgvXFwuKHBuZ3xqcGd8anBlZ3xnaWZ8d2VicHxzdmd8aWNvKSQvaSk/LlswXSB8fCAnLnBuZyc7XG4gICAgICAgICAgICAvLyBcdThGNkNcdTRFNDlcdTcyNzlcdTZCOEFcdTVCNTdcdTdCMjZcdUZGMENcdTRGNDZcdTRGRERcdTc1NTlcdTRFMEJcdTUyMTJcdTdFQkZcbiAgICAgICAgICAgIGNvbnN0IGVzY2FwZWRGaWxlTmFtZSA9IGZpbGVOYW1lV2l0aG91dEV4dC5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpO1xuICAgICAgICAgICAgLy8gXHU1MzM5XHU5MTREIC9hc3NldHMvXHU2NTg3XHU0RUY2XHU1NDBELWhhc2guXHU2MjY5XHU1QzU1XHU1NDBEIFx1NjgzQ1x1NUYwRlxuICAgICAgICAgICAgY29uc3QgYXNzZXRzUGF0dGVybiA9IG5ldyBSZWdFeHAoYC9hc3NldHMvJHtlc2NhcGVkRmlsZU5hbWV9LVtBLVphLXowLTldezQsfSR7ZmlsZUV4dC5yZXBsYWNlKCcuJywgJ1xcXFwuJyl9YCwgJ2cnKTtcbiAgICAgICAgICAgIGlmIChhc3NldHNQYXR0ZXJuLnRlc3QoY29udGVudCkpIHtcbiAgICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZShhc3NldHNQYXR0ZXJuLCByb290UGF0aCk7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1RDgzRFx1REQwNCBcdTY2RjRcdTY1QjAgJHtmaWxlfSBcdTRFMkRcdTc2ODRcdTY4MzlcdTc2RUVcdTVGNTVcdTU2RkVcdTcyNDdcdTVGMTVcdTc1Mjg6IC9hc3NldHMvJHtyb290RmlsZX0gLT4gJHtyb290UGF0aH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTcxMzZcdTU0MEVcdTU5MDRcdTc0MDZcdTUxNzZcdTRFRDZcdTU2RkVcdTcyNDdcdUZGMDhcdTVFMjYgaGFzaCBcdTc2ODRcdUZGMDlcbiAgICAgICAgICBmb3IgKGNvbnN0IFtvcmlnaW5hbEZpbGUsIGhhc2hlZEZpbGVdIG9mIGltYWdlTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgLy8gXHU4REYzXHU4RkM3XHU2ODM5XHU3NkVFXHU1RjU1XHU1NkZFXHU3MjQ3XHVGRjBDXHU1REYyXHU3RUNGXHU1OTA0XHU3NDA2XHU4RkM3XHU0RTg2XG4gICAgICAgICAgICBpZiAocm9vdEltYWdlRmlsZXMuaW5jbHVkZXMob3JpZ2luYWxGaWxlKSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxQYXRoID0gYC8ke29yaWdpbmFsRmlsZX1gO1xuICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBaGFzaGVkRmlsZSBcdTUzMDVcdTU0MkJcdTVCOENcdTY1NzRcdThERUZcdTVGODRcdUZGMDhcdTU5ODIgYXNzZXRzL2xvZ2luX2N1dF9kYXJrLUNoS0Q1VXBvLnBuZ1x1RkYwOVxuICAgICAgICAgICAgLy8gXHU5NzAwXHU4OTgxXHU3ODZFXHU0RkREXHU4REVGXHU1Rjg0XHU0RUU1IC8gXHU1RjAwXHU1OTM0XG4gICAgICAgICAgICBjb25zdCBuZXdQYXRoID0gaGFzaGVkRmlsZS5zdGFydHNXaXRoKCdhc3NldHMvJykgPyBgLyR7aGFzaGVkRmlsZX1gIDogYC8ke2hhc2hlZEZpbGV9YDtcblxuICAgICAgICAgICAgY29uc3QgZXNjYXBlZFBhdGggPSBvcmlnaW5hbFBhdGgucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcbiAgICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RFx1NTkxQVx1NzlDRFx1NjgzQ1x1NUYwRlx1RkYwQ1x1NTMwNVx1NjJFQ1x1NUUyNlx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1NzY4NFxuICAgICAgICAgICAgLy8gXHU0RjdGXHU3NTI4XHU1QjU3XHU3QjI2XHU0RTMyXHU2MkZDXHU2M0E1XHU5MDdGXHU1MTREXHU2QTIxXHU2NzdGXHU1QjU3XHU3QjI2XHU0RTMyXHU0RTJEXHU3Njg0XHU1M0NEXHU1RjE1XHU1M0Y3XHU4RjZDXHU0RTQ5XHU5NUVFXHU5ODk4XG4gICAgICAgICAgICBjb25zdCBiYWNrdGljayA9ICdgJztcbiAgICAgICAgICAgIGNvbnN0IHF1b3RlUGF0dGVybiA9ICdbXCJcXCcnICsgYmFja3RpY2sgKyAnXSc7XG4gICAgICAgICAgICBjb25zdCBuZWdhdGVkUXVvdGVQYXR0ZXJuID0gJ1teXCInICsgXCInXCIgKyBiYWNrdGljayArICddJztcbiAgICAgICAgICAgIGNvbnN0IHBhdHRlcm5zID0gW1xuICAgICAgICAgICAgICBuZXcgUmVnRXhwKCcoJyArIHF1b3RlUGF0dGVybiArICcpJyArIGVzY2FwZWRQYXRoICsgJyhcXFxcPycgKyBuZWdhdGVkUXVvdGVQYXR0ZXJuICsgJyopPygnICsgcXVvdGVQYXR0ZXJuICsgJyknLCAnZycpLFxuICAgICAgICAgICAgICBuZXcgUmVnRXhwKGB1cmxcXFxcKCR7ZXNjYXBlZFBhdGh9KFxcXFw/W14pXSopP1xcXFwpYCwgJ2cnKSxcbiAgICAgICAgICAgICAgbmV3IFJlZ0V4cChgdXJsXFxcXChbJ1wiXSR7ZXNjYXBlZFBhdGh9KFxcXFw/W15cIiddKik/WydcIl1cXFxcKWAsICdnJyksXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgcGF0dGVybnMpIHtcbiAgICAgICAgICAgICAgaWYgKHBhdHRlcm4udGVzdChjb250ZW50KSkge1xuICAgICAgICAgICAgICAgIGlmIChwYXR0ZXJuLnNvdXJjZS5pbmNsdWRlcygndXJsJykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UocGF0dGVybiwgKG1hdGNoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFx1NEZERFx1NzU1OVx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1RkYwOFx1NTk4Mlx1Njc5Q1x1NjcwOVx1RkYwOVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBxdWVyeU1hdGNoID0gbWF0Y2gubWF0Y2goLyhcXD9bXildKikvKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcXVlcnkgPSBxdWVyeU1hdGNoID8gcXVlcnlNYXRjaFsxXSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2gucmVwbGFjZShvcmlnaW5hbFBhdGgsIG5ld1BhdGgpLnJlcGxhY2UoL1xcP1teKV0qLywgcXVlcnkgPyBxdWVyeSA6ICcnKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAvLyBcdTVCRjlcdTRFOEVcdTVCNTdcdTdCMjZcdTRFMzJcdTVGMTVcdTc1MjhcdUZGMENcdTRFNUZcdTRGRERcdTc1NTlcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UocGF0dGVybiwgKF9tYXRjaDogc3RyaW5nLCBxdW90ZTE6IHN0cmluZywgX3BhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZywgcXVvdGUyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3F1b3RlMX0ke25ld1BhdGh9JHtxdWVyeSB8fCAnJ30ke3F1b3RlMn1gO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gXHVEODNEXHVERDA0IFx1NjZGNFx1NjVCMCAke2ZpbGV9IFx1NEUyRFx1NzY4NFx1NUYxNVx1NzUyODogJHtvcmlnaW5hbFBhdGh9IC0+ICR7bmV3UGF0aH1gKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgICAgd3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgY29udGVudCwgJ3V0Zi04Jyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgIGlmIChpbWFnZU1hcC5zaXplID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3V0cHV0RGlyID0gcmVzb2x2ZShhcHBEaXIsICdkaXN0Jyk7XG5cbiAgICAgIGZvciAoY29uc3QgW29yaWdpbmFsRmlsZSwgaGFzaGVkRmlsZV0gb2YgaW1hZ2VNYXAuZW50cmllcygpKSB7XG4gICAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjU4N1x1NEVGNlx1NjYyRlx1NTQyNlx1NTcyOCBhc3NldHMgXHU3NkVFXHU1RjU1XHU2MjE2XHU2ODM5XHU3NkVFXHU1RjU1XG4gICAgICAgIGNvbnN0IGV4cGVjdGVkUGF0aCA9IGpvaW4ob3V0cHV0RGlyLCBoYXNoZWRGaWxlKTtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoZXhwZWN0ZWRQYXRoKSkge1xuICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdTI3MDUgXHU2NTg3XHU0RUY2XHU1REYyXHU2QjYzXHU3ODZFXHU3NTFGXHU2MjEwOiAke2hhc2hlZEZpbGV9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gXHU1QzFEXHU4QkQ1XHU1NzI4XHU2ODM5XHU3NkVFXHU1RjU1XHU2N0U1XHU2MjdFXHVGRjA4XHU1OTgyXHU2NzlDIGhhc2hlZEZpbGUgXHU0RTBEXHU1MzA1XHU1NDJCIGFzc2V0cy9cdUZGMDlcbiAgICAgICAgICBjb25zdCByb290UGF0aCA9IGhhc2hlZEZpbGUuc3RhcnRzV2l0aCgnYXNzZXRzLycpXG4gICAgICAgICAgICA/IGpvaW4ob3V0cHV0RGlyLCBoYXNoZWRGaWxlLnJlcGxhY2UoJ2Fzc2V0cy8nLCAnJykpXG4gICAgICAgICAgICA6IGpvaW4ob3V0cHV0RGlyLCBoYXNoZWRGaWxlKTtcbiAgICAgICAgICBpZiAoZXhpc3RzU3luYyhyb290UGF0aCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSBcdTI3MDUgXHU2NTg3XHU0RUY2XHU1NzI4XHU2ODM5XHU3NkVFXHU1RjU1OiAke2hhc2hlZEZpbGUucmVwbGFjZSgnYXNzZXRzLycsICcnKX1gKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbcHVibGljLWltYWdlcy10by1hc3NldHNdIFx1MjZBMFx1RkUwRiAgXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4OiAke2hhc2hlZEZpbGV9IChcdTUzOUZcdTU5Q0JcdTY1ODdcdTRFRjY6ICR7b3JpZ2luYWxGaWxlfSlgKTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3B1YmxpYy1pbWFnZXMtdG8tYXNzZXRzXSAgIFx1NjhDMFx1NjdFNVx1OERFRlx1NUY4NDogJHtleHBlY3RlZFBhdGh9YCk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtwdWJsaWMtaW1hZ2VzLXRvLWFzc2V0c10gICBcdTY4QzBcdTY3RTVcdThERUZcdTVGODQ6ICR7cm9vdFBhdGh9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxyZXNvdXJjZS1wcmVsb2FkLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3Jlc291cmNlLXByZWxvYWQudHNcIjsvKipcbiAqIFx1OEQ0NFx1NkU5MFx1OTg4NFx1NTJBMFx1OEY3RFx1NjNEMlx1NEVGNlxuICogXHU0RTNBXHU1MTczXHU5NTJFXHU4RDQ0XHU2RTkwXHVGRjA4aW5kZXguanNcdTMwMDFlcHMtc2VydmljZS5qc1x1MzAwMUNTU1x1RkYwOVx1NkRGQlx1NTJBMCBwcmVsb2FkL21vZHVsZXByZWxvYWQgXHU5NEZFXHU2M0E1XG4gKi9cblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB0eXBlIHsgT3V0cHV0T3B0aW9ucywgT3V0cHV0QnVuZGxlIH0gZnJvbSAncm9sbHVwJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlc291cmNlUHJlbG9hZFBsdWdpbigpOiBQbHVnaW4ge1xuICBjb25zdCBjcml0aWNhbFJlc291cmNlczogQXJyYXk8eyBocmVmOiBzdHJpbmc7IGFzPzogc3RyaW5nOyByZWw6IHN0cmluZyB9PiA9IFtdO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3Jlc291cmNlLXByZWxvYWQnLFxuICAgIGdlbmVyYXRlQnVuZGxlKF9vcHRpb25zOiBPdXRwdXRPcHRpb25zLCBidW5kbGU6IE91dHB1dEJ1bmRsZSkge1xuICAgICAgY29uc3QganNDaHVua3MgPSBPYmplY3Qua2V5cyhidW5kbGUpLmZpbHRlcihmaWxlID0+IGZpbGUuZW5kc1dpdGgoJy5qcycpIHx8IGZpbGUuZW5kc1dpdGgoJy5tanMnKSk7XG4gICAgICBjb25zdCBjc3NDaHVua3MgPSBPYmplY3Qua2V5cyhidW5kbGUpLmZpbHRlcihmaWxlID0+IGZpbGUuZW5kc1dpdGgoJy5jc3MnKSk7XG5cbiAgICAgIGNvbnN0IGdldFJlc291cmNlSHJlZiA9IChjaHVua05hbWU6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICAgIGlmIChjaHVua05hbWUuc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgcmV0dXJuIGAvJHtjaHVua05hbWV9YDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gYC9hc3NldHMvJHtjaHVua05hbWV9YDtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gXHU1M0VBXHU5ODg0XHU1MkEwXHU4RjdEXHU2NzAwXHU1MTczXHU5NTJFXHU3Njg0XHU4RDQ0XHU2RTkwXHVGRjBDXHU5MDdGXHU1MTREXHU5NjNCXHU1ODVFIEhUTUwgXHU4OUUzXHU2NzkwXG4gICAgICAvLyAxLiBcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdUZGMDhcdTVGQzVcdTk4N0JcdTk4ODRcdTUyQTBcdThGN0RcdUZGMDlcbiAgICAgIGNvbnN0IGluZGV4Q2h1bmsgPSBqc0NodW5rcy5maW5kKGpzQ2h1bmsgPT4ganNDaHVuay5pbmNsdWRlcygnaW5kZXgtJykpO1xuICAgICAgaWYgKGluZGV4Q2h1bmspIHtcbiAgICAgICAgY3JpdGljYWxSZXNvdXJjZXMucHVzaCh7XG4gICAgICAgICAgaHJlZjogZ2V0UmVzb3VyY2VIcmVmKGluZGV4Q2h1bmspLFxuICAgICAgICAgIHJlbDogJ21vZHVsZXByZWxvYWQnLFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gMi4gRVBTIFx1NjcwRFx1NTJBMVx1RkYwOFx1NTE3M1x1OTUyRVx1NEY5RFx1OEQ1Nlx1RkYwQ1x1NEY0Nlx1NTNFRlx1NEVFNVx1NUVGNlx1OEZERlx1NTJBMFx1OEY3RFx1RkYwOVxuICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBRVBTIFx1NjcwRFx1NTJBMVx1NEUwRFx1NjYyRlx1OTYzQlx1NTg1RVx1NjAyN1x1NzY4NFx1RkYwQ1x1NTNFRlx1NEVFNVx1NUVGNlx1OEZERlx1NTJBMFx1OEY3RFx1RkYwQ1x1NjI0MFx1NEVFNVx1NEUwRFx1OTg4NFx1NTJBMFx1OEY3RFxuICAgICAgLy8gXHU1OTgyXHU2NzlDIEVQUyBcdTY3MERcdTUyQTFcdTVGODhcdTU5MjdcdUZGMENcdTk4ODRcdTUyQTBcdThGN0RcdTUzRUZcdTgwRkRcdTRGMUFcdTk2M0JcdTU4NUVcdTUxNzZcdTRFRDZcdThENDRcdTZFOTBcbiAgICAgIC8vIGNvbnN0IGVwc1NlcnZpY2VDaHVuayA9IGpzQ2h1bmtzLmZpbmQoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKCdlcHMtc2VydmljZS0nKSk7XG4gICAgICAvLyBpZiAoZXBzU2VydmljZUNodW5rKSB7XG4gICAgICAvLyAgIGNyaXRpY2FsUmVzb3VyY2VzLnB1c2goe1xuICAgICAgLy8gICAgIGhyZWY6IGdldFJlc291cmNlSHJlZihlcHNTZXJ2aWNlQ2h1bmspLFxuICAgICAgLy8gICAgIHJlbDogJ21vZHVsZXByZWxvYWQnLFxuICAgICAgLy8gICB9KTtcbiAgICAgIC8vIH1cblxuICAgICAgLy8gMy4gQ1NTIFx1NjU4N1x1NEVGNlx1RkYwOFx1NUZDNVx1OTg3Qlx1OTg4NFx1NTJBMFx1OEY3RFx1RkYwQ1x1NEY0Nlx1NTNFQVx1OTg4NFx1NTJBMFx1OEY3RFx1N0IyQ1x1NEUwMFx1NEUyQVx1RkYwQ1x1OTA3Rlx1NTE0RFx1OTYzQlx1NTg1RVx1RkYwOVxuICAgICAgLy8gXHU1M0VBXHU5ODg0XHU1MkEwXHU4RjdEXHU3QjJDXHU0RTAwXHU0RTJBIENTUyBcdTY1ODdcdTRFRjZcdUZGMENcdTUxNzZcdTRFRDYgQ1NTIFx1NjU4N1x1NEVGNlx1NTNFRlx1NEVFNVx1NUVGNlx1OEZERlx1NTJBMFx1OEY3RFxuICAgICAgY29uc3QgZmlyc3RDc3NDaHVuayA9IGNzc0NodW5rc1swXTtcbiAgICAgIGlmIChmaXJzdENzc0NodW5rKSB7XG4gICAgICAgIGNyaXRpY2FsUmVzb3VyY2VzLnB1c2goe1xuICAgICAgICAgIGhyZWY6IGdldFJlc291cmNlSHJlZihmaXJzdENzc0NodW5rKSxcbiAgICAgICAgICByZWw6ICdwcmVsb2FkJyxcbiAgICAgICAgICBhczogJ3N0eWxlJyxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0cmFuc2Zvcm1JbmRleEh0bWwoaHRtbCkge1xuICAgICAgaWYgKGNyaXRpY2FsUmVzb3VyY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcHJlbG9hZExpbmtzID0gY3JpdGljYWxSZXNvdXJjZXNcbiAgICAgICAgLm1hcChyZXNvdXJjZSA9PiB7XG4gICAgICAgICAgaWYgKHJlc291cmNlLnJlbCA9PT0gJ21vZHVsZXByZWxvYWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gYCAgICA8bGluayByZWw9XCJtb2R1bGVwcmVsb2FkXCIgaHJlZj1cIiR7cmVzb3VyY2UuaHJlZn1cIiAvPmA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBgICAgIDxsaW5rIHJlbD1cInByZWxvYWRcIiBocmVmPVwiJHtyZXNvdXJjZS5ocmVmfVwiIGFzPVwiJHtyZXNvdXJjZS5hcyB8fCAnc2NyaXB0J31cIiAvPmA7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuam9pbignXFxuJyk7XG5cbiAgICAgIGlmIChodG1sLmluY2x1ZGVzKCc8L2hlYWQ+JykpIHtcbiAgICAgICAgcmV0dXJuIGh0bWwucmVwbGFjZSgnPC9oZWFkPicsIGAke3ByZWxvYWRMaW5rc31cXG48L2hlYWQ+YCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBodG1sO1xuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcdXBsb2FkLWljb25zLXRvLW9zcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy91cGxvYWQtaWNvbnMtdG8tb3NzLnRzXCI7LyoqXG4gKiBcdTRFMEFcdTRGMjBcdTU2RkVcdTY4MDdcdTY1ODdcdTRFRjZcdTUyMzAgT1NTIFx1NzY4NCBWaXRlIFx1NjNEMlx1NEVGNlxuICogXHU1NzI4XHU3NTFGXHU0RUE3XHU2Nzg0XHU1RUZBXHU1QjhDXHU2MjEwXHU1NDBFXHVGRjBDXHU4MUVBXHU1MkE4XHU0RTBBXHU0RjIwXHU1NkZFXHU2ODA3XHU2NTg3XHU0RUY2XHU1MjMwIE9TU1x1RkYwOFx1NTdGQVx1NEU4RVx1NjU4N1x1NEVGNlx1NjMwN1x1N0VCOVx1NzY4NFx1NTg5RVx1OTFDRlx1NEUwQVx1NEYyMFx1RkYwOVxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbdXBsb2FkLWljb25zLXRvLW9zc10nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW3VwbG9hZC1pY29ucy10by1vc3NdJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbdXBsb2FkLWljb25zLXRvLW9zc10nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW3VwbG9hZC1pY29ucy10by1vc3NdJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgUmVzb2x2ZWRDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHNwYXduIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSByZXNvbHZlKF9fZmlsZW5hbWUsICcuLicpO1xuY29uc3QgcHJvamVjdFJvb3QgPSByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uLy4uJyk7XG5cbmZ1bmN0aW9uIHRyeUxvYWRPc3NDcmVkc0Zyb21XaW5kb3dzQ3JlZGVudGlhbE1hbmFnZXIoKTogdm9pZCB7XG4gIC8vIFx1NTNFQVx1NTcyOCBXaW5kb3dzIFx1NEUxNFx1N0YzQVx1NUMxMVx1NTFFRFx1OEJDMVx1NjVGNlx1NUMxRFx1OEJENVxuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ3dpbjMyJykgcmV0dXJuO1xuICBpZiAocHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQgJiYgcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUKSByZXR1cm47XG5cbiAgdHJ5IHtcbiAgICAvLyBcdTkwMUFcdThGQzcgUG93ZXJTaGVsbCArIENyZWRlbnRpYWxNYW5hZ2VyIFx1OEJGQlx1NTNENlx1RkYwOFx1NEUwRFx1OEY5M1x1NTFGQVx1NjYwRVx1NjU4N1x1NTIzMFx1NjVFNVx1NUZEN1x1RkYwOVxuICAgIGNvbnN0IHBzID0gW1xuICAgICAgYCRFcnJvckFjdGlvblByZWZlcmVuY2U9J1N0b3AnYCxcbiAgICAgIGBJbXBvcnQtTW9kdWxlIENyZWRlbnRpYWxNYW5hZ2VyYCxcbiAgICAgIGAkaWQ9KEdldC1TdG9yZWRDcmVkZW50aWFsIC1UYXJnZXQgJ0FsaWJhYmFDbG91ZCcgLUVycm9yQWN0aW9uIFNpbGVudGx5Q29udGludWUpLkdldE5ldHdvcmtDcmVkZW50aWFsKCkuUGFzc3dvcmRgLFxuICAgICAgYCRzZWM9KEdldC1TdG9yZWRDcmVkZW50aWFsIC1UYXJnZXQgJ0FsaWJhYmFDbG91ZFNlY3JldCcgLUVycm9yQWN0aW9uIFNpbGVudGx5Q29udGludWUpLkdldE5ldHdvcmtDcmVkZW50aWFsKCkuUGFzc3dvcmRgLFxuICAgICAgYCRvdXQ9W3BzY3VzdG9tb2JqZWN0XUB7IGlkPSRpZDsgc2VjcmV0PSRzZWMgfSB8IENvbnZlcnRUby1Kc29uIC1Db21wcmVzc2AsXG4gICAgICBgV3JpdGUtT3V0cHV0ICRvdXRgLFxuICAgIF0uam9pbignOyAnKTtcblxuICAgIGNvbnN0IHJhdyA9IGV4ZWNTeW5jKGBwb3dlcnNoZWxsIC1Ob1Byb2ZpbGUgLU5vbkludGVyYWN0aXZlIC1Db21tYW5kIFwiJHtwcy5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyl9XCJgLCB7XG4gICAgICBzdGRpbzogWydpZ25vcmUnLCAncGlwZScsICdpZ25vcmUnXSxcbiAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgfSk7XG5cbiAgICBjb25zdCBqc29uVGV4dCA9IChyYXcgfHwgJycpLnRyaW0oKTtcbiAgICBpZiAoIWpzb25UZXh0KSByZXR1cm47XG5cbiAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGpzb25UZXh0KSBhcyB7IGlkPzogc3RyaW5nOyBzZWNyZXQ/OiBzdHJpbmcgfTtcbiAgICBpZiAocGFyc2VkPy5pZCAmJiAhcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQpIHByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX0lEID0gcGFyc2VkLmlkO1xuICAgIGlmIChwYXJzZWQ/LnNlY3JldCAmJiAhcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUKSBwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQgPSBwYXJzZWQuc2VjcmV0O1xuICB9IGNhdGNoIHtcbiAgICAvLyBcdTk3NTlcdTlFRDhcdTU5MzFcdThEMjVcdUZGMUFcdTRFMERcdTk2M0JcdTU4NUVcdTY3ODRcdTVFRkFcdTZENDFcdTdBMEJcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBsb2FkSWNvbnNUb09zc1BsdWdpbigpOiBQbHVnaW4ge1xuICBsZXQgaXNQcm9kdWN0aW9uQnVpbGQgPSBmYWxzZTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICd1cGxvYWQtaWNvbnMtdG8tb3NzJyxcbiAgICBhcHBseTogJ2J1aWxkJywgLy8gXHU1M0VBXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU2MjY3XHU4ODRDXG5cbiAgICBjb25maWdSZXNvbHZlZChjb25maWc6IFJlc29sdmVkQ29uZmlnKSB7XG4gICAgICAvLyBWaXRlIFx1NzY4NCBpc1Byb2R1Y3Rpb24gXHU2NjJGXHU2NzAwXHU1M0VGXHU5NzYwXHU3Njg0XHU1MjI0XHU2NUFEXHVGRjA4XHU5MDdGXHU1MTREIE5PREVfRU5WIC8gREVWIFx1N0I0OVx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1NTcyOCBDSSBcdTRFMkRcdTRFMERcdTRFMDBcdTgxRjRcdUZGMDlcbiAgICAgIGlzUHJvZHVjdGlvbkJ1aWxkID0gISFjb25maWcuaXNQcm9kdWN0aW9uO1xuICAgIH0sXG5cbiAgICBhc3luYyBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgIC8vIFx1NTNFQVx1NTcyOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1Njc4NFx1NUVGQVx1NjVGNlx1NEUwQVx1NEYyMFxuICAgICAgaWYgKCFpc1Byb2R1Y3Rpb25CdWlsZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFdpbmRvd3MgXHU2NzJDXHU1NzMwXHU2Nzg0XHU1RUZBXHVGRjFBXHU1OTgyXHU2NzlDXHU2NzJBXHU2NjNFXHU1RjBGXHU4QkJFXHU3RjZFIGVudi8uZW52Lm9zc1x1RkYwQ1x1NUMxRFx1OEJENVx1NEVDRVx1NTFFRFx1OEJDMVx1N0JBMVx1NzQwNlx1NTY2OFx1OEJGQlx1NTNENlxuICAgICAgdHJ5TG9hZE9zc0NyZWRzRnJvbVdpbmRvd3NDcmVkZW50aWFsTWFuYWdlcigpO1xuXG4gICAgICAvLyBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTY3MDkgT1NTIFx1OTE0RFx1N0Y2RVxuICAgICAgaWYgKCFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9JRCB8fCAhcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUKSB7XG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOVx1NEUwQVx1NEYyMFx1RkYwQ2FsbC5iZWxsaXMuY29tLmNuIFx1NEVFM1x1NzQwNlx1NTIzMCBPU1MgXHU1QzA2XHU4RkQ0XHU1NkRFIE5vU3VjaEtleVx1RkYwOGxvZ28ucG5nIC8gaWNvbnMvKlx1RkYwOVxuICAgICAgICBjb25zb2xlLndhcm4oJ1t1cGxvYWQtaWNvbnMtdG8tb3NzXSBcdTI2QTBcdUZFMEYgIFx1OERGM1x1OEZDN1x1NEUwQVx1NEYyMFx1RkYwOFx1NjcyQVx1OTE0RFx1N0Y2RSBPU1MgXHU1MUVEXHU4QkMxXHVGRjA5XHUzMDAyXHU4RkQ5XHU0RjFBXHU1QkZDXHU4MUY0IGh0dHBzOi8vYWxsLmJlbGxpcy5jb20uY24vbG9nby5wbmcgXHU4RkQ0XHU1NkRFIE5vU3VjaEtleScpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTcyOCBDSSBcdTRFMkRcdTVGQzVcdTk4N0JcdTdCNDlcdTVGODVcdTRFMEFcdTRGMjBcdTVCOENcdTYyMTBcdUZGMENcdTU0MjZcdTUyMTlcdTY3ODRcdTVFRkFcdThGREJcdTdBMEJcdTkwMDBcdTUxRkFcdTRGMUFcdTc2RjRcdTYzQTVcdTdFQzhcdTZCNjJcdTVCNTBcdThGREJcdTdBMEJcdUZGMENcdTVCRkNcdTgxRjRcdTY1ODdcdTRFRjZcdTY3MkFcdTRFMEFcdTRGMjBcbiAgICAgIGNvbnN0IHVwbG9hZFNjcmlwdCA9IHJlc29sdmUocHJvamVjdFJvb3QsICdzY3JpcHRzL3VwbG9hZC1pY29ucy10by1vc3MubWpzJyk7XG4gICAgICBjb25zb2xlLmluZm8oJ1t1cGxvYWQtaWNvbnMtdG8tb3NzXSBcdUQ4M0RcdURFODAgXHU1RjAwXHU1OUNCXHU0RTBBXHU0RjIwXHU1NkZFXHU2ODA3XHU2NTg3XHU0RUY2XHU1MjMwIE9TUy4uLicpO1xuXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZVByb21pc2UsIHJlamVjdFByb21pc2UpID0+IHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBzcGF3bignbm9kZScsIFt1cGxvYWRTY3JpcHRdLCB7XG4gICAgICAgICAgc3RkaW86ICdpbmhlcml0JyxcbiAgICAgICAgICBzaGVsbDogdHJ1ZSxcbiAgICAgICAgICBlbnY6IHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNoaWxkLm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgICAgIHJlamVjdFByb21pc2UoZXJyb3IpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjaGlsZC5vbignZXhpdCcsIChjb2RlKSA9PiB7XG4gICAgICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnW3VwbG9hZC1pY29ucy10by1vc3NdIFx1MjcwNSBcdTU2RkVcdTY4MDdcdTY1ODdcdTRFRjZcdTRFMEFcdTRGMjBcdTVCOENcdTYyMTAnKTtcbiAgICAgICAgICAgIHJlc29sdmVQcm9taXNlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFx1OUVEOFx1OEJBNFx1NEUwRFx1OTYzQlx1NTg1RVx1Njc4NFx1NUVGQVx1RkYxQWxheW91dC1hcHAgZGlzdCBcdTkxQ0NcdTRFQ0RcdTY3MDkgaWNvbnMvbG9nbyBcdTRGNUNcdTRFM0FcdTY3MkNcdTU3MzBcdTU0MEVcdTU5MDdcdUZGMENcdTkwN0ZcdTUxNEQgNDA0XG4gICAgICAgICAgICAvLyBcdTU5ODJcdTk3MDBcdTRFMjVcdTY4M0NcdTU5MzFcdThEMjVcdUZGMDhDSSBcdTVGM0FcdTUyMzZcdTRFMEFcdTRGMjBcdTYyMTBcdTUyOUZcdUZGMDlcdUZGMENcdThCQkVcdTdGNkUgT1NTX1VQTE9BRF9TVFJJQ1Q9dHJ1ZVxuICAgICAgICAgICAgY29uc3Qgc3RyaWN0ID0gcHJvY2Vzcy5lbnYuT1NTX1VQTE9BRF9TVFJJQ1QgPT09ICd0cnVlJztcbiAgICAgICAgICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcihgW3VwbG9hZC1pY29ucy10by1vc3NdIFx1NEUwQVx1NEYyMFx1ODExQVx1NjcyQ1x1OTAwMFx1NTFGQVx1RkYwQ1x1NEVFM1x1NzgwMTogJHtjb2RlID8/ICd1bmtub3duJ31gKTtcbiAgICAgICAgICAgIGlmIChzdHJpY3QpIHtcbiAgICAgICAgICAgICAgcmVqZWN0UHJvbWlzZShlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZVByb21pc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxyZXBsYWNlLWljb25zLXdpdGgtY2RuLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3JlcGxhY2UtaWNvbnMtd2l0aC1jZG4udHNcIjsvKipcbiAqIFx1NUMwNiBpbmRleC5odG1sIFx1NEUyRFx1NzY4NFx1NTZGRVx1NjgwN1x1OERFRlx1NUY4NFx1NjZGRlx1NjM2Mlx1NEUzQSBDRE4gVVJMIFx1NzY4NCBWaXRlIFx1NjNEMlx1NEVGNlxuICogXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU0RjdGXHU3NTI4IENETlx1RkYwQ1x1NUYwMFx1NTNEMS9cdTk4ODRcdTg5QzhcdTczQUZcdTU4ODNcdTRGRERcdTYzMDFcdTY3MkNcdTU3MzBcdThERUZcdTVGODRcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW3JlcGxhY2UtaWNvbnMtd2l0aC1jZG5dJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1tyZXBsYWNlLWljb25zLXdpdGgtY2RuXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW3JlcGxhY2UtaWNvbnMtd2l0aC1jZG5dJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1tyZXBsYWNlLWljb25zLXdpdGgtY2RuXScsIC4uLmFyZ3MpLFxufTtcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFJlc29sdmVkQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZXBsYWNlSWNvbnNXaXRoQ2RuUGx1Z2luKCk6IFBsdWdpbiB7XG4gIGxldCBpc1Byb2R1Y3Rpb25CdWlsZCA9IGZhbHNlO1xuICBsZXQgY2FjaGVkTG9nb0Nkbk9rOiBib29sZWFuIHwgbnVsbCA9IG51bGw7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAncmVwbGFjZS1pY29ucy13aXRoLWNkbicsXG4gICAgYXBwbHk6ICdidWlsZCcsIC8vIFx1NTNFQVx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NjI2N1x1ODg0Q1xuXG4gICAgY29uZmlnUmVzb2x2ZWQoY29uZmlnOiBSZXNvbHZlZENvbmZpZykge1xuICAgICAgaXNQcm9kdWN0aW9uQnVpbGQgPSAhIWNvbmZpZy5pc1Byb2R1Y3Rpb247XG4gICAgfSxcblxuICAgIGFzeW5jIHRyYW5zZm9ybUluZGV4SHRtbChodG1sKSB7XG4gICAgICAvLyBcdTUzRUFcdTU3MjhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTY3ODRcdTVFRkFcdTY1RjZcdTY2RkZcdTYzNjJcdUZGMDhcdTRGN0ZcdTc1MjggVml0ZSBcdTc2ODQgaXNQcm9kdWN0aW9uXHVGRjBDXHU5MDdGXHU1MTREIENJIFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1NEUwRFx1NEUwMFx1ODFGNFx1RkYwOVxuICAgICAgaWYgKCFpc1Byb2R1Y3Rpb25CdWlsZCkge1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gXHU1RUY2XHU4RkRGXHU1QkZDXHU1MTY1XHVGRjBDXHU5MDdGXHU1MTREXHU1NzI4IHZpdGUuY29uZmlnLnRzIFx1NTJBMFx1OEY3RFx1NjVGNlx1ODlFM1x1Njc5MFx1NTkzMVx1OEQyNVxuICAgICAgICBjb25zdCB7IGdldEVudkNvbmZpZyB9ID0gYXdhaXQgaW1wb3J0KCdAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MvdW5pZmllZC1lbnYtY29uZmlnJyk7XG4gICAgICAgIC8vIFx1ODNCN1x1NTNENlx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVxuICAgICAgICBjb25zdCBlbnZDb25maWcgPSBnZXRFbnZDb25maWcoKTtcbiAgICAgICAgY29uc3QgY2RuVXJsID0gZW52Q29uZmlnLmNkbj8uc3RhdGljQXNzZXRzVXJsO1xuXG4gICAgICAgIGlmICghY2RuVXJsKSB7XG4gICAgICAgICAgLy8gXHU2NzJBXHU5MTREXHU3RjZFIENETlx1RkYwQ1x1NEZERFx1NjMwMVx1NTM5Rlx1NjgzN1xuICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2RuQmFzZSA9IGNkblVybC5yZXBsYWNlKC9cXC8kLywgJycpO1xuXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEVDNVx1NUY1MyBDRE4gXHU0RTBBXHU3ODZFXHU1QjlFXHU1QjU4XHU1NzI4IGxvZ28ucG5nIFx1NjVGNlx1NjI0RFx1NjZGRlx1NjM2MlxuICAgICAgICAvLyBcdTU0MjZcdTUyMTlcdTRGRERcdTc1NTlcdTY3MkNcdTU3MzAgL2xvZ28ucG5nXHVGRjBDXHU1RTc2XHU0RjlEXHU4RDU2XHU1QjUwXHU1RTk0XHU3NTI4IGRpc3QvbG9nby5wbmcgXHU0RjVDXHU0RTNBXHU1NDBFXHU1OTA3XHVGRjBDXHU5MDdGXHU1MTREIDQwNFxuICAgICAgICBpZiAoY2FjaGVkTG9nb0Nkbk9rID09PSBudWxsKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke2NkbkJhc2V9L2xvZ28ucG5nYCwgeyBtZXRob2Q6ICdIRUFEJywgcmVkaXJlY3Q6ICdmb2xsb3cnIH0pO1xuICAgICAgICAgICAgY2FjaGVkTG9nb0Nkbk9rID0gISFyZXMub2s7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICBjYWNoZWRMb2dvQ2RuT2sgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTY2RkZcdTYzNjJcdTU2RkVcdTY4MDdcdThERUZcdTVGODRcbiAgICAgICAgbGV0IG5ld0h0bWwgPSBodG1sO1xuXG4gICAgICAgIC8vIFx1NjZGRlx1NjM2MiAvbG9nby5wbmdcbiAgICAgICAgaWYgKGNhY2hlZExvZ29DZG5Paykge1xuICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgICAvaHJlZj1bXCInXVxcL2xvZ29cXC5wbmdbXCInXS9nLFxuICAgICAgICAgICAgYGhyZWY9XCIke2NkbkJhc2V9L2xvZ28ucG5nXCJgXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1NjZGRlx1NjM2MiAvaWNvbnMvIFx1OERFRlx1NUY4NFxuICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgIC9ocmVmPVtcIiddXFwvaWNvbnNcXC8oW15cIiddKylbXCInXS9nLFxuICAgICAgICAgIChtYXRjaCwgaWNvbkZpbGUpID0+IHtcbiAgICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQXNpdGUud2VibWFuaWZlc3QgXHU1RkM1XHU5ODdCXHU0RkREXHU2MzAxXHU1NDBDXHU2RTkwXHVGRjA4XHU3NTMxXHU1NDA0XHU1QjUwXHU1RTk0XHU3NTI4XHU4MUVBXHU4RUFCXHU2M0QwXHU0RjlCXHVGRjA5XHVGRjBDXHU1NDI2XHU1MjE5XHVGRjFBXG4gICAgICAgICAgICAvLyAtIFx1NEYxQVx1ODlFNlx1NTNEMVx1OERFOFx1NTdERi9DT1JTXG4gICAgICAgICAgICAvLyAtIFBXQSBzdGFydF91cmwgXHU0RjFBXHU0RUU1IENETiBcdTU3REZcdTU0MERcdTRFM0FcdTU3RkFcdTUxQzZcdUZGMENcdTVCRkNcdTgxRjRcdTVCODlcdTg4QzUvXHU1NDJGXHU1MkE4XHU4ODRDXHU0RTNBXHU5NTE5XHU4QkVGXG4gICAgICAgICAgICBpZiAoaWNvbkZpbGUgPT09ICdzaXRlLndlYm1hbmlmZXN0Jykge1xuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYGhyZWY9XCIke2NkbkJhc2V9L2ljb25zLyR7aWNvbkZpbGV9XCJgO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gbmV3SHRtbDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1ODNCN1x1NTNENlx1OTE0RFx1N0Y2RVx1NTkzMVx1OEQyNVx1RkYwQ1x1NEZERFx1NjMwMVx1NTM5Rlx1NjgzN1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tyZXBsYWNlLWljb25zLXdpdGgtY2RuXSBcdTgzQjdcdTUzRDZcdTkxNERcdTdGNkVcdTU5MzFcdThEMjVcdUZGMENcdTRGRERcdTYzMDFcdTUzOUZcdTU2RkVcdTY4MDdcdThERUZcdTVGODQ6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGR1dHktc3RhdGljLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2R1dHktc3RhdGljLnRzXCI7LyoqXG4gKiBEdXR5IFx1OTc1OVx1NjAwMVx1NjU4N1x1NEVGNlx1NjNEMlx1NEVGNlxuICogXHU1NzI4XHU1RjAwXHU1M0QxXHU2NzBEXHU1MkExXHU1NjY4XHU1QzQyXHU5NzYyXHU2MkU2XHU2MjJBIC9kdXR5LyBcdThERUZcdTVGODRcdUZGMENcdTc2RjRcdTYzQTVcdThGRDRcdTU2REUgcHVibGljIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1OTc1OVx1NjAwMSBIVE1MIFx1NjU4N1x1NEVGNlxuICogXHU5MDdGXHU1MTREXHU4RkQ5XHU0RTlCXHU2NTg3XHU0RUY2XHU4OEFCIFZ1ZSBSb3V0ZXIgXHU1OTA0XHU3NDA2XG4gKiBcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdUZGMENcdTVDMDYgcHVibGljIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NCBIVE1MXHUzMDAxQ1NTXHUzMDAxSlMgXHU2NTg3XHU0RUY2XHU1OTBEXHU1MjM2XHU1MjMwIGRpc3QvZHV0eS8gXHU3NkVFXHU1RjU1XG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1tkdXR5LXN0YXRpY10nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW2R1dHktc3RhdGljXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW2R1dHktc3RhdGljXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbZHV0eS1zdGF0aWNdJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgVml0ZURldlNlcnZlciB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHR5cGUgeyBSZXNvbHZlZENvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jLCBleGlzdHNTeW5jLCByZWFkZGlyU3luYywgc3RhdFN5bmMsIGNvcHlGaWxlU3luYywgbWtkaXJTeW5jLCB3cml0ZUZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgam9pbiwgcmVzb2x2ZSwgZXh0bmFtZSB9IGZyb20gJ3BhdGgnO1xuXG4vKipcbiAqIER1dHkgXHU5NzU5XHU2MDAxXHU2NTg3XHU0RUY2XHU2M0QyXHU0RUY2XG4gKiBAcGFyYW0gYXBwRGlyIFx1NUU5NFx1NzUyOFx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICovXG5leHBvcnQgZnVuY3Rpb24gZHV0eVN0YXRpY1BsdWdpbihhcHBEaXI6IHN0cmluZyk6IFBsdWdpbiB7XG4gIGxldCB2aXRlQ29uZmlnOiBSZXNvbHZlZENvbmZpZyB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0IGR1dHlNaWRkbGV3YXJlID0gKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSA9PiB7XG4gICAgLy8gXHU1M0VBXHU1OTA0XHU3NDA2IC9kdXR5LyBcdThERUZcdTVGODRcdTc2ODRcdThCRjdcdTZDNDJcbiAgICBpZiAoIXJlcS51cmwgfHwgIXJlcS51cmwuc3RhcnRzV2l0aCgnL2R1dHkvJykpIHtcbiAgICAgIG5leHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTYzRDBcdTUzRDZcdTY1ODdcdTRFRjZcdTU0MERcdUZGMENcdTRGOEJcdTU5ODIgL2R1dHkvYWdyZWVtZW50Lmh0bWwgLT4gYWdyZWVtZW50Lmh0bWxcbiAgICBjb25zdCBmaWxlTmFtZSA9IHJlcS51cmwucmVwbGFjZSgnL2R1dHkvJywgJycpO1xuXG4gICAgLy8gXHU2Nzg0XHU1RUZBXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHVGRjFBcHVibGljIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NjU4N1x1NEVGNlxuICAgIGNvbnN0IHB1YmxpY0RpciA9IHJlc29sdmUoYXBwRGlyLCAncHVibGljJyk7XG4gICAgY29uc3QgZmlsZVBhdGggPSBqb2luKHB1YmxpY0RpciwgZmlsZU5hbWUpO1xuXG4gICAgLy8gXHU2OEMwXHU2N0U1XHU2NTg3XHU0RUY2XHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XG4gICAgaWYgKCFleGlzdHNTeW5jKGZpbGVQYXRoKSkge1xuICAgICAgLy8gXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU3RUU3XHU3RUVEXHU0RTBCXHU0RTAwXHU0RTJBXHU0RTJEXHU5NUY0XHU0RUY2XHVGRjA4XHU1M0VGXHU4MEZEXHU0RjFBXHU4OEFCIFZ1ZSBSb3V0ZXIgXHU1OTA0XHU3NDA2XHU2MjE2XHU4RkQ0XHU1NkRFIDQwNFx1RkYwOVxuICAgICAgbmV4dCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1OEJGQlx1NTNENlx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBmaWxlQ29udGVudCA9IHJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04Jyk7XG5cbiAgICAgIC8vIFx1OEJCRVx1N0Y2RVx1NkI2M1x1Nzg2RVx1NzY4NCBDb250ZW50LVR5cGVcbiAgICAgIGlmIChmaWxlTmFtZS5lbmRzV2l0aCgnLmh0bWwnKSkge1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sOyBjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICB9IGVsc2UgaWYgKGZpbGVOYW1lLmVuZHNXaXRoKCcuY3NzJykpIHtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvY3NzOyBjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICB9IGVsc2UgaWYgKGZpbGVOYW1lLmVuZHNXaXRoKCcuanMnKSkge1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vamF2YXNjcmlwdDsgY2hhcnNldD11dGYtOCcpO1xuICAgICAgfVxuXG4gICAgICAvLyBcdThGRDRcdTU2REVcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcbiAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xuICAgICAgcmVzLmVuZChmaWxlQ29udGVudCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIFx1OEJGQlx1NTNENlx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNVx1RkYwQ1x1N0VFN1x1N0VFRFx1NEUwQlx1NEUwMFx1NEUyQVx1NEUyRFx1OTVGNFx1NEVGNlxuICAgICAgY29uc29sZS5lcnJvcignW2R1dHktc3RhdGljXSBcdThCRkJcdTUzRDZcdTY1ODdcdTRFRjZcdTU5MzFcdThEMjU6JywgZmlsZVBhdGgsIGVycm9yKTtcbiAgICAgIG5leHQoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnZHV0eS1zdGF0aWMnLFxuICAgIGVuZm9yY2U6ICdwcmUnLCAvLyBcdTU3MjhcdTUxNzZcdTRFRDZcdTYzRDJcdTRFRjZcdTRFNEJcdTUyNERcdTYyNjdcdTg4NENcdUZGMENcdTc4NkVcdTRGRERcdTU3MjggVnVlIFJvdXRlciBcdTRFNEJcdTUyNERcdTU5MDRcdTc0MDZcbiAgICBjb25maWdSZXNvbHZlZChjb25maWc6IFJlc29sdmVkQ29uZmlnKSB7XG4gICAgICB2aXRlQ29uZmlnID0gY29uZmlnO1xuICAgIH0sXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcjogVml0ZURldlNlcnZlcikge1xuICAgICAgLy8gXHU0RjdGXHU3NTI4IHVzZSBcdTZERkJcdTUyQTBcdTRFMkRcdTk1RjRcdTRFRjZcdUZGMENcdTc1MzFcdTRFOEUgZW5mb3JjZTogJ3ByZSdcdUZGMENcdThGRDlcdTRGMUFcdTU3MjggVnVlIFx1NjNEMlx1NEVGNlx1NEU0Qlx1NTI0RFx1NjI2N1x1ODg0Q1xuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShkdXR5TWlkZGxld2FyZSk7XG4gICAgfSxcbiAgICBjb25maWd1cmVQcmV2aWV3U2VydmVyKHNlcnZlcjogVml0ZURldlNlcnZlcikge1xuICAgICAgLy8gXHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHU0RTVGXHU0RjdGXHU3NTI4XHU3NkY4XHU1NDBDXHU3Njg0XHU5MDNCXHU4RjkxXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGR1dHlNaWRkbGV3YXJlKTtcbiAgICB9LFxuICAgIHdyaXRlQnVuZGxlKCkge1xuICAgICAgLy8gXHU2Nzg0XHU1RUZBXHU2NUY2XHVGRjBDXHU1QzA2IHB1YmxpYyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODQgSFRNTFx1MzAwMUNTU1x1MzAwMUpTIFx1NjU4N1x1NEVGNlx1NTkwRFx1NTIzNlx1NTIzMCBkaXN0L2R1dHkvIFx1NzZFRVx1NUY1NVxuICAgICAgaWYgKCF2aXRlQ29uZmlnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcHVibGljRGlyID0gcmVzb2x2ZShhcHBEaXIsICdwdWJsaWMnKTtcbiAgICAgIGlmICghZXhpc3RzU3luYyhwdWJsaWNEaXIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3V0RGlyID0gdml0ZUNvbmZpZy5idWlsZC5vdXREaXIgfHwgJ2Rpc3QnO1xuICAgICAgY29uc3QgZGlzdERpciA9IHJlc29sdmUoYXBwRGlyLCBvdXREaXIpO1xuICAgICAgaWYgKCFleGlzdHNTeW5jKGRpc3REaXIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZHV0eURpciA9IHJlc29sdmUoZGlzdERpciwgJ2R1dHknKTtcbiAgICAgIGlmICghZXhpc3RzU3luYyhkdXR5RGlyKSkge1xuICAgICAgICBta2RpclN5bmMoZHV0eURpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1OTcwMFx1ODk4MVx1NTkwRFx1NTIzNlx1NzY4NFx1NjU4N1x1NEVGNlx1N0M3Qlx1NTc4Qlx1RkYwOFx1NjM5Mlx1OTY2NFx1NTZGRVx1NzI0N1x1RkYwQ1x1NTZGRVx1NzI0N1x1NzUzMSBwdWJsaWNJbWFnZXNUb0Fzc2V0c1BsdWdpbiBcdTU5MDRcdTc0MDZcdUZGMDlcbiAgICAgIGNvbnN0IGR1dHlGaWxlRXh0ZW5zaW9ucyA9IFsnLmh0bWwnLCAnLmNzcycsICcuanMnXTtcbiAgICAgIC8vIFx1NjM5Mlx1OTY2NFx1NzY4NFx1NjU4N1x1NEVGNlx1NTIxN1x1ODg2OFx1RkYwOFx1NTZGRVx1NzI0N1x1NjU4N1x1NEVGNlx1NzUzMVx1NTE3Nlx1NEVENlx1NjNEMlx1NEVGNlx1NTkwNFx1NzQwNlx1RkYwOVxuICAgICAgY29uc3QgZXhjbHVkZWRGaWxlcyA9IFsnbG9nby5wbmcnLCAnbG9naW5fY3V0X2RhcmsucG5nJywgJ2xvZ2luX2N1dF9saWdodC5wbmcnLCAnc2Nhbi5wbmcnLCAnZmF2aWNvbi5pY28nXTtcblxuICAgICAgLy8gXHU4MUVBXHU1MkE4XHU2OEMwXHU2RDRCIHB1YmxpYyBcdTc2RUVcdTVGNTVcdTRFMkRcdTc2ODQgalF1ZXJ5IFx1NjU4N1x1NEVGNlx1RkYwOFx1NEYxOFx1NTE0OFx1NEY3Rlx1NzUyOCAzLnggXHU3QTMzXHU1QjlBXHU3MjQ4XHU2NzJDXHVGRjA5XG4gICAgICBjb25zdCBmaWxlcyA9IHJlYWRkaXJTeW5jKHB1YmxpY0Rpcik7XG4gICAgICBsZXQganF1ZXJ5RmlsZTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gICAgICBjb25zdCBqcXVlcnlGaWxlczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgLy8gXHU2NTM2XHU5NkM2XHU2MjQwXHU2NzA5IGpRdWVyeSBcdTY1ODdcdTRFRjZcbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgICBpZiAoZmlsZS5zdGFydHNXaXRoKCdqcXVlcnknKSAmJiBmaWxlLmVuZHNXaXRoKCcubWluLmpzJykpIHtcbiAgICAgICAgICBqcXVlcnlGaWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NEYxOFx1NTE0OFx1OTAwOVx1NjJFOSAzLnggXHU3MjQ4XHU2NzJDXHVGRjA4XHU3QTMzXHU1QjlBXHU3MjQ4XHVGRjA5XHVGRjBDXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5XHU1MjE5XHU5MDA5XHU2MkU5XHU3QjJDXHU0RTAwXHU0RTJBXG4gICAgICBpZiAoanF1ZXJ5RmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBzdGFibGVWZXJzaW9uID0ganF1ZXJ5RmlsZXMuZmluZChmID0+IGYuaW5jbHVkZXMoJ2pxdWVyeS0zLicpKTtcbiAgICAgICAganF1ZXJ5RmlsZSA9IChzdGFibGVWZXJzaW9uIHx8IGpxdWVyeUZpbGVzWzBdKSA/PyBudWxsO1xuICAgICAgICBpZiAoanF1ZXJ5RmlsZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2R1dHktc3RhdGljXSBcdUQ4M0RcdURDQ0IgXHU2MjdFXHU1MjMwXHU1OTFBXHU0RTJBIGpRdWVyeSBcdTY1ODdcdTRFRjY6ICR7anF1ZXJ5RmlsZXMuam9pbignLCAnKX1gKTtcbiAgICAgICAgICBjb25zb2xlLmluZm8oYFtkdXR5LXN0YXRpY10gXHVEODNEXHVEQ0NDIFx1NEY3Rlx1NzUyODogJHtqcXVlcnlGaWxlfWApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTkwRFx1NTIzNiBqUXVlcnkgXHU2NTg3XHU0RUY2XHVGRjA4XHU1OTgyXHU2NzlDXHU1QjU4XHU1NzI4XHVGRjA5XG4gICAgICBpZiAoanF1ZXJ5RmlsZSkge1xuICAgICAgICBjb25zdCBqcXVlcnlTb3VyY2VQYXRoID0gcmVzb2x2ZShwdWJsaWNEaXIsIGpxdWVyeUZpbGUpO1xuICAgICAgICBjb25zdCBqcXVlcnlEZXN0UGF0aCA9IHJlc29sdmUoZHV0eURpciwganF1ZXJ5RmlsZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29weUZpbGVTeW5jKGpxdWVyeVNvdXJjZVBhdGgsIGpxdWVyeURlc3RQYXRoKTtcbiAgICAgICAgICBjb25zb2xlLmluZm8oYFtkdXR5LXN0YXRpY10gXHVEODNEXHVEQ0U2IFx1NURGMlx1NTkwRFx1NTIzNiAke2pxdWVyeUZpbGV9IFx1NTIzMCBkaXN0L2R1dHkvYCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgW2R1dHktc3RhdGljXSBcdTI2QTBcdUZFMEYgIFx1NTkwRFx1NTIzNiBqUXVlcnkgXHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1OmAsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBbZHV0eS1zdGF0aWNdIFx1MjZBMFx1RkUwRiAgXHU4QjY2XHU1NDRBOiBcdTY3MkFcdTYyN0VcdTUyMzAgalF1ZXJ5IFx1NjU4N1x1NEVGNlx1RkYwOGpxdWVyeSoubWluLmpzXHVGRjA5XHU1NzI4IHB1YmxpYyBcdTc2RUVcdTVGNTVgKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGNvcGllZENvdW50ID0gMDtcblxuICAgICAgLy8gXHU1MThEXHU2QjIxXHU4QkZCXHU1M0Q2XHU2NTg3XHU0RUY2XHU1MjE3XHU4ODY4XHVGRjBDXHU3NTI4XHU0RThFXHU1OTBEXHU1MjM2XHU1MTc2XHU0RUQ2XHU2NTg3XHU0RUY2XHVGRjA4XHU0RTBEXHU1MzA1XHU2MkVDalF1ZXJ5XHVGRjBDXHU1NkUwXHU0RTNBXHU1REYyXHU3RUNGXHU1OTBEXHU1MjM2XHU4RkM3XHU0RTg2XHVGRjA5XG4gICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgLy8gXHU4REYzXHU4RkM3XHU2MzkyXHU5NjY0XHU3Njg0XHU2NTg3XHU0RUY2XG4gICAgICAgIGlmIChleGNsdWRlZEZpbGVzLmluY2x1ZGVzKGZpbGUpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdThERjNcdThGQzcgalF1ZXJ5IFx1NjU4N1x1NEVGNlx1RkYwOFx1NURGMlx1N0VDRlx1NTcyOFx1NEUwQVx1OTc2Mlx1NTM1NVx1NzJFQ1x1NTkwNFx1NzQwNlx1NEU4Nlx1RkYwOVxuICAgICAgICBpZiAoanF1ZXJ5RmlsZSAmJiBmaWxlID09PSBqcXVlcnlGaWxlKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBleHQgPSBleHRuYW1lKGZpbGUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChkdXR5RmlsZUV4dGVuc2lvbnMuaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICAgIGNvbnN0IHNvdXJjZVBhdGggPSByZXNvbHZlKHB1YmxpY0RpciwgZmlsZSk7XG4gICAgICAgICAgY29uc3QgZGVzdFBhdGggPSByZXNvbHZlKGR1dHlEaXIsIGZpbGUpO1xuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gc3RhdFN5bmMoc291cmNlUGF0aCk7XG4gICAgICAgICAgICBpZiAoc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgICAgLy8gXHU1QkY5XHU0RThFSFRNTFx1NjU4N1x1NEVGNlx1RkYwQ1x1OTcwMFx1ODk4MVx1NjZGRlx1NjM2Mlx1NTE3Nlx1NEUyRFx1NzY4NENTU1x1NTQ4Q0pTXHU4REVGXHU1Rjg0XG4gICAgICAgICAgICAgIGlmIChleHQgPT09ICcuaHRtbCcpIHtcbiAgICAgICAgICAgICAgICBsZXQgY29udGVudCA9IHJlYWRGaWxlU3luYyhzb3VyY2VQYXRoLCAndXRmLTgnKTtcbiAgICAgICAgICAgICAgICAvLyBcdTY2RkZcdTYzNjIgalF1ZXJ5IENETiBcdThERUZcdTVGODRcdTRFM0FcdTY3MkNcdTU3MzBcdThERUZcdTVGODRcdUZGMDhcdTY1MkZcdTYzMDFcdTRFRkJcdTYxMEZcdTcyNDhcdTY3MkNcdTc2ODRqUXVlcnkgQ0ROXHU5NEZFXHU2M0E1XHVGRjA5XG4gICAgICAgICAgICAgICAgaWYgKGpxdWVyeUZpbGUpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFx1NjZGRlx1NjM2Mlx1NTQwNFx1NzlDRFx1NTNFRlx1ODBGRFx1NzY4NCBqUXVlcnkgQ0ROIFx1OTRGRVx1NjNBNVx1NjgzQ1x1NUYwRlxuICAgICAgICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgL2h0dHBzOlxcL1xcL2NvZGVcXC5qcXVlcnlcXC5jb21cXC9qcXVlcnktW15cIidcXHNdK1xcLm1pblxcLmpzL2csXG4gICAgICAgICAgICAgICAgICAgIGAvZHV0eS8ke2pxdWVyeUZpbGV9YFxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIC8vIFx1NEU1Rlx1NjZGRlx1NjM2Mlx1NTE3Nlx1NEVENlx1NTNFRlx1ODBGRFx1NzY4NCBDRE4gXHU5NEZFXHU2M0E1XHU2ODNDXHU1RjBGXG4gICAgICAgICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAvaHR0cHM/OlxcL1xcL1teXCInXFxzXSpqcXVlcnlbXlwiJ1xcc10qXFwubWluXFwuanMvZyxcbiAgICAgICAgICAgICAgICAgICAgYC9kdXR5LyR7anF1ZXJ5RmlsZX1gXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBcdTY2RkZcdTYzNjIgQ1NTIFx1OERFRlx1NUY4NFx1RkYxQS9pbmRleC5jc3MgLT4gL2R1dHkvaW5kZXguY3NzXG4gICAgICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvaHJlZj1bXCInXVxcL2luZGV4XFwuY3NzW1wiJ10vZywgJ2hyZWY9XCIvZHV0eS9pbmRleC5jc3NcIicpO1xuICAgICAgICAgICAgICAgIC8vIFx1NjZGRlx1NjM2MiBKUyBcdThERUZcdTVGODRcdUZGMUEvaW5kZXguanMgLT4gL2R1dHkvaW5kZXguanNcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC9zcmM9W1wiJ11cXC9pbmRleFxcLmpzW1wiJ10vZywgJ3NyYz1cIi9kdXR5L2luZGV4LmpzXCInKTtcbiAgICAgICAgICAgICAgICAvLyBcdTY2RkZcdTYzNjIgbG9nbyBcdThERUZcdTVGODRcdUZGMUEvbG9nby5wbmcgLT4gL2xvZ28ucG5nIChcdTRGRERcdTYzMDFcdTY4MzlcdThERUZcdTVGODRcdUZGMENcdTU2RTBcdTRFM0Fsb2dvXHU1NzI4XHU2ODM5XHU3NkVFXHU1RjU1KVxuICAgICAgICAgICAgICAgIC8vIGxvZ28ucG5nIFx1NzUzMSBwdWJsaWNJbWFnZXNUb0Fzc2V0c1BsdWdpbiBcdTU5MDRcdTc0MDZcdUZGMENcdTRGRERcdTYzMDFcdTU3MjhcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMENcdTYyNDBcdTRFRTVcdTRFMERcdTk3MDBcdTg5ODFcdTRGRUVcdTY1MzlcbiAgICAgICAgICAgICAgICB3cml0ZUZpbGVTeW5jKGRlc3RQYXRoLCBjb250ZW50LCAndXRmLTgnKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBDU1MgXHU1NDhDIEpTIFx1NjU4N1x1NEVGNlx1NzZGNFx1NjNBNVx1NTkwRFx1NTIzNlxuICAgICAgICAgICAgICAgIGNvcHlGaWxlU3luYyhzb3VyY2VQYXRoLCBkZXN0UGF0aCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29waWVkQ291bnQrKztcbiAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbZHV0eS1zdGF0aWNdIFx1RDgzRFx1RENFNiBcdTVERjJcdTU5MERcdTUyMzYgJHtmaWxlfSBcdTUyMzAgZGlzdC9kdXR5L2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbZHV0eS1zdGF0aWNdIFx1MjZBMFx1RkUwRiAgXHU1OTBEXHU1MjM2XHU2NTg3XHU0RUY2XHU1OTMxXHU4RDI1ICR7ZmlsZX06YCwgZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoY29waWVkQ291bnQgPiAwKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW2R1dHktc3RhdGljXSBcdTI3MDUgXHU2Nzg0XHU1RUZBXHU1QjhDXHU2MjEwXHVGRjFBXHU1REYyXHU1OTBEXHU1MjM2ICR7Y29waWVkQ291bnR9IFx1NEUyQVx1NjU4N1x1NEVGNlx1NTIzMCBkaXN0L2R1dHkvYCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcdXBsb2FkLWNkbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy91cGxvYWQtY2RuLnRzXCI7LyoqXG4gKiBcdTRFMEFcdTRGMjBcdTVFOTRcdTc1MjhcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTUyMzAgQ0ROIFx1NzY4NCBWaXRlIFx1NjNEMlx1NEVGNlxuICogXHU1NzI4XHU3NTFGXHU0RUE3XHU2Nzg0XHU1RUZBXHU1QjhDXHU2MjEwXHU1NDBFXHVGRjBDXHU4MUVBXHU1MkE4XHU0RTBBXHU0RjIwXHU1RTk0XHU3NTI4XHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU1MjMwIE9TUy9DRE5cdUZGMDhcdTU3RkFcdTRFOEVcdTY1ODdcdTRFRjZcdTYzMDdcdTdFQjlcdTc2ODRcdTU4OUVcdTkxQ0ZcdTRFMEFcdTRGMjBcdUZGMDlcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW3VwbG9hZC1jZG5dJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1t1cGxvYWQtY2RuXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW3VwbG9hZC1jZG5dJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1t1cGxvYWQtY2RuXScsIC4uLmFyZ3MpLFxufTtcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFJlc29sdmVkQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ3VybCc7XG5pbXBvcnQgeyBleGVjU3luYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xuY29uc3QgX19kaXJuYW1lID0gcmVzb2x2ZShfX2ZpbGVuYW1lLCAnLi4nKTtcbmNvbnN0IHByb2plY3RSb290ID0gcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi8uLicpO1xuXG5mdW5jdGlvbiB0cnlMb2FkT3NzQ3JlZHNGcm9tV2luZG93c0NyZWRlbnRpYWxNYW5hZ2VyKCk6IHZvaWQge1xuICAvLyBcdTUzRUFcdTU3MjggV2luZG93cyBcdTRFMTRcdTdGM0FcdTVDMTFcdTUxRURcdThCQzFcdTY1RjZcdTVDMURcdThCRDVcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gIT09ICd3aW4zMicpIHJldHVybjtcbiAgaWYgKHByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX0lEICYmIHByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX1NFQ1JFVCkgcmV0dXJuO1xuXG4gIHRyeSB7XG4gICAgLy8gXHU5MDFBXHU4RkM3IFBvd2VyU2hlbGwgKyBDcmVkZW50aWFsTWFuYWdlciBcdThCRkJcdTUzRDZcdUZGMDhcdTRFMERcdThGOTNcdTUxRkFcdTY2MEVcdTY1ODdcdTUyMzBcdTY1RTVcdTVGRDdcdUZGMDlcbiAgICBjb25zdCBwcyA9IFtcbiAgICAgIGAkRXJyb3JBY3Rpb25QcmVmZXJlbmNlPSdTdG9wJ2AsXG4gICAgICBgSW1wb3J0LU1vZHVsZSBDcmVkZW50aWFsTWFuYWdlcmAsXG4gICAgICBgJGlkPShHZXQtU3RvcmVkQ3JlZGVudGlhbCAtVGFyZ2V0ICdBbGliYWJhQ2xvdWQnIC1FcnJvckFjdGlvbiBTaWxlbnRseUNvbnRpbnVlKS5HZXROZXR3b3JrQ3JlZGVudGlhbCgpLlBhc3N3b3JkYCxcbiAgICAgIGAkc2VjPShHZXQtU3RvcmVkQ3JlZGVudGlhbCAtVGFyZ2V0ICdBbGliYWJhQ2xvdWRTZWNyZXQnIC1FcnJvckFjdGlvbiBTaWxlbnRseUNvbnRpbnVlKS5HZXROZXR3b3JrQ3JlZGVudGlhbCgpLlBhc3N3b3JkYCxcbiAgICAgIGAkb3V0PVtwc2N1c3RvbW9iamVjdF1AeyBpZD0kaWQ7IHNlY3JldD0kc2VjIH0gfCBDb252ZXJ0VG8tSnNvbiAtQ29tcHJlc3NgLFxuICAgICAgYFdyaXRlLU91dHB1dCAkb3V0YCxcbiAgICBdLmpvaW4oJzsgJyk7XG5cbiAgICBjb25zdCByYXcgPSBleGVjU3luYyhgcG93ZXJzaGVsbCAtTm9Qcm9maWxlIC1Ob25JbnRlcmFjdGl2ZSAtQ29tbWFuZCBcIiR7cHMucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpfVwiYCwge1xuICAgICAgc3RkaW86IFsnaWdub3JlJywgJ3BpcGUnLCAnaWdub3JlJ10sXG4gICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgIH0pO1xuXG4gICAgY29uc3QganNvblRleHQgPSAocmF3IHx8ICcnKS50cmltKCk7XG4gICAgaWYgKCFqc29uVGV4dCkgcmV0dXJuO1xuXG4gICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShqc29uVGV4dCkgYXMgeyBpZD86IHN0cmluZzsgc2VjcmV0Pzogc3RyaW5nIH07XG4gICAgaWYgKHBhcnNlZD8uaWQgJiYgIXByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX0lEKSBwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9JRCA9IHBhcnNlZC5pZDtcbiAgICBpZiAocGFyc2VkPy5zZWNyZXQgJiYgIXByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX1NFQ1JFVCkgcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUID0gcGFyc2VkLnNlY3JldDtcbiAgfSBjYXRjaCB7XG4gICAgLy8gXHU5NzU5XHU5RUQ4XHU1OTMxXHU4RDI1XHVGRjFBXHU0RTBEXHU5NjNCXHU1ODVFXHU2Nzg0XHU1RUZBXHU2RDQxXHU3QTBCXG4gIH1cbn1cblxuLyoqXG4gKiBcdTUyMUJcdTVFRkEgQ0ROIFx1NEUwQVx1NEYyMFx1NjNEMlx1NEVGNlxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHVGRjA4XHU1OTgyICdzeXN0ZW0tYXBwJ1x1RkYwOVxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTc2RUVcdTVGNTVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwbG9hZENkblBsdWdpbihhcHBOYW1lOiBzdHJpbmcsIF9hcHBEaXI6IHN0cmluZyk6IFBsdWdpbiB7XG4gIGxldCBpc1Byb2R1Y3Rpb25CdWlsZCA9IGZhbHNlO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3VwbG9hZC1jZG4nLFxuICAgIGFwcGx5OiAnYnVpbGQnLCAvLyBcdTUzRUFcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTYyNjdcdTg4NENcblxuICAgIGNvbmZpZ1Jlc29sdmVkKGNvbmZpZzogUmVzb2x2ZWRDb25maWcpIHtcbiAgICAgIC8vIFZpdGUgXHU3Njg0IGlzUHJvZHVjdGlvbiBcdTY2MkZcdTY3MDBcdTUzRUZcdTk3NjBcdTc2ODRcdTUyMjRcdTY1QURcdUZGMDhcdTkwN0ZcdTUxNEQgTk9ERV9FTlYgLyBERVYgXHU3QjQ5XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU1NzI4IENJIFx1NEUyRFx1NEUwRFx1NEUwMFx1ODFGNFx1RkYwOVxuICAgICAgaXNQcm9kdWN0aW9uQnVpbGQgPSAhIWNvbmZpZy5pc1Byb2R1Y3Rpb247XG4gICAgfSxcblxuICAgIGFzeW5jIGNsb3NlQnVuZGxlKCkge1xuICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4IENETiBcdTRFMEFcdTRGMjBcbiAgICAgIGlmIChwcm9jZXNzLmVudi5FTkFCTEVfQ0ROX1VQTE9BRCAhPT0gJ3RydWUnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU4REYzXHU4RkM3XHU0RTBBXHU0RjIwXG4gICAgICBpZiAocHJvY2Vzcy5lbnYuU0tJUF9DRE5fVVBMT0FEID09PSAndHJ1ZScpIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGBbdXBsb2FkLWNkbl0gXHUyM0VEXHVGRTBGICBcdThERjNcdThGQzcgJHthcHBOYW1lfSBcdTc2ODQgQ0ROIFx1NEUwQVx1NEYyMFx1RkYwOFNLSVBfQ0ROX1VQTE9BRD10cnVlXHVGRjA5YCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1M0VBXHU1NzI4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU2Nzg0XHU1RUZBXHU2NUY2XHU0RTBBXHU0RjIwXG4gICAgICBpZiAoIWlzUHJvZHVjdGlvbkJ1aWxkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gV2luZG93cyBcdTY3MkNcdTU3MzBcdTY3ODRcdTVFRkFcdUZGMUFcdTU5ODJcdTY3OUNcdTY3MkFcdTY2M0VcdTVGMEZcdThCQkVcdTdGNkUgZW52Ly5lbnYub3NzXHVGRjBDXHU1QzFEXHU4QkQ1XHU0RUNFXHU1MUVEXHU4QkMxXHU3QkExXHU3NDA2XHU1NjY4XHU4QkZCXHU1M0Q2XG4gICAgICB0cnlMb2FkT3NzQ3JlZHNGcm9tV2luZG93c0NyZWRlbnRpYWxNYW5hZ2VyKCk7XG5cbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NjcwOSBPU1MgXHU5MTREXHU3RjZFXG4gICAgICBpZiAoIXByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX0lEIHx8ICFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBbdXBsb2FkLWNkbl0gXHUyNkEwXHVGRTBGICBcdThERjNcdThGQzcgJHthcHBOYW1lfSBcdTc2ODQgQ0ROIFx1NEUwQVx1NEYyMFx1RkYwOFx1NjcyQVx1OTE0RFx1N0Y2RSBPU1MgXHU1MUVEXHU4QkMxXHVGRjA5YCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1NzI4IENJIFx1NEUyRFx1NUZDNVx1OTg3Qlx1N0I0OVx1NUY4NVx1NEUwQVx1NEYyMFx1NUI4Q1x1NjIxMFx1RkYwQ1x1NTQyNlx1NTIxOVx1Njc4NFx1NUVGQVx1OEZEQlx1N0EwQlx1OTAwMFx1NTFGQVx1NEYxQVx1NzZGNFx1NjNBNVx1N0VDOFx1NkI2Mlx1NUI1MFx1OEZEQlx1N0EwQlx1RkYwQ1x1NUJGQ1x1ODFGNFx1NjU4N1x1NEVGNlx1NjcyQVx1NEUwQVx1NEYyMFxuICAgICAgY29uc3QgdXBsb2FkU2NyaXB0ID0gcmVzb2x2ZShwcm9qZWN0Um9vdCwgJ3NjcmlwdHMvdXBsb2FkLWFwcC10by1jZG4ubWpzJyk7XG4gICAgICBjb25zb2xlLmluZm8oYFt1cGxvYWQtY2RuXSBcdUQ4M0RcdURFODAgXHU1RjAwXHU1OUNCXHU0RTBBXHU0RjIwICR7YXBwTmFtZX0gXHU1MjMwIENETi4uLmApO1xuXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZVByb21pc2UsIHJlamVjdFByb21pc2UpID0+IHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBzcGF3bignbm9kZScsIFt1cGxvYWRTY3JpcHQsIGFwcE5hbWVdLCB7XG4gICAgICAgICAgc3RkaW86ICdpbmhlcml0JyxcbiAgICAgICAgICBzaGVsbDogdHJ1ZSxcbiAgICAgICAgICBlbnY6IHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNoaWxkLm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgICAgIHJlamVjdFByb21pc2UoZXJyb3IpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjaGlsZC5vbignZXhpdCcsIChjb2RlKSA9PiB7XG4gICAgICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW3VwbG9hZC1jZG5dIFx1MjcwNSAke2FwcE5hbWV9IFx1NEUwQVx1NEYyMFx1NUI4Q1x1NjIxMGApO1xuICAgICAgICAgICAgcmVzb2x2ZVByb21pc2UoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gXHU5RUQ4XHU4QkE0XHU0RTBEXHU5NjNCXHU1ODVFXHU2Nzg0XHU1RUZBXHVGRjFBXHU1OTgyXHU5NzAwXHU0RTI1XHU2ODNDXHU1OTMxXHU4RDI1XHVGRjA4Q0kgXHU1RjNBXHU1MjM2XHU0RTBBXHU0RjIwXHU2MjEwXHU1MjlGXHVGRjA5XHVGRjBDXHU4QkJFXHU3RjZFIE9TU19VUExPQURfU1RSSUNUPXRydWVcbiAgICAgICAgICAgIGNvbnN0IHN0cmljdCA9IHByb2Nlc3MuZW52Lk9TU19VUExPQURfU1RSSUNUID09PSAndHJ1ZSc7XG4gICAgICAgICAgICBjb25zdCBlcnIgPSBuZXcgRXJyb3IoYFt1cGxvYWQtY2RuXSAke2FwcE5hbWV9IFx1NEUwQVx1NEYyMFx1ODExQVx1NjcyQ1x1OTAwMFx1NTFGQVx1RkYwQ1x1NEVFM1x1NzgwMTogJHtjb2RlID8/ICd1bmtub3duJ31gKTtcbiAgICAgICAgICAgIGlmIChzdHJpY3QpIHtcbiAgICAgICAgICAgICAgcmVqZWN0UHJvbWlzZShlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZVByb21pc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxjZG4tYXNzZXRzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2Nkbi1hc3NldHMudHNcIjsvKipcbiAqIENETiBcdThENDRcdTZFOTBcdTUyQTBcdTkwMUZcdTYzRDJcdTRFRjZcbiAqIFx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NEZFRVx1NjUzOSBIVE1MIFx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MCBVUkxcdUZGMENcdTVDMDZcdTk3NTlcdTYwMDFcdThENDRcdTZFOTBcdThERUZcdTVGODRcdThGNkNcdTYzNjJcdTRFM0EgQ0ROIFVSTFxuICogXHU2NTJGXHU2MzAxXHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwICgvYXNzZXRzLykgXHU1NDhDXHU1RTAzXHU1QzQwXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwICgvYXNzZXRzL2xheW91dC8pXG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1tjZG4tYXNzZXRzXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbY2RuLWFzc2V0c10nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1tjZG4tYXNzZXRzXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbY2RuLWFzc2V0c10nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2RuQXNzZXRzUGx1Z2luT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcdUZGMDhcdTU5ODIgJ2FkbWluLWFwcCdcdUZGMDlcbiAgICovXG4gIGFwcE5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIFx1NjYyRlx1NTQyNlx1NTQyRlx1NzUyOCBDRE4gXHU1MkEwXHU5MDFGXHVGRjA4XHU5RUQ4XHU4QkE0XHVGRjFBXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU1NDJGXHU3NTI4XHVGRjA5XG4gICAqL1xuICBlbmFibGVkPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIENETiBcdTU3REZcdTU0MERcdUZGMDhcdTlFRDhcdThCQTRcdUZGMUFhbGwuYmVsbGlzLmNvbS5jblx1RkYwOVxuICAgKi9cbiAgY2RuRG9tYWluPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIENETiBcdThENDRcdTZFOTBcdTUyQTBcdTkwMUZcdTYzRDJcdTRFRjZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNkbkFzc2V0c1BsdWdpbihvcHRpb25zOiBDZG5Bc3NldHNQbHVnaW5PcHRpb25zKTogUGx1Z2luIHtcbiAgY29uc3Qge1xuICAgIGFwcE5hbWUsXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU5RUQ4XHU4QkE0XHU1NDJGXHU3NTI4XHU2NzYxXHU0RUY2XHU1RkM1XHU5ODdCXHU2NjBFXHU3ODZFXHU2OEMwXHU2N0U1IEVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OIFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlxuICAgIC8vIFx1NTk4Mlx1Njc5QyBFTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiBcdTg4QUJcdThCQkVcdTdGNkVcdTRFM0EgJ2ZhbHNlJ1x1RkYwQ1x1NTIxOVx1Nzk4MVx1NzUyOCBDRE5cbiAgICAvLyBcdTUzRUFcdTY3MDlcdTU3MjhcdTY2MEVcdTc4NkVcdTU0MkZcdTc1MjhcdUZGMDhFTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTj10cnVlXHVGRjA5XHU2MjE2XHU2NzJBXHU4QkJFXHU3RjZFXHU0RTE0XHU2NjJGXHU3NTFGXHU0RUE3XHU2Nzg0XHU1RUZBXHU2NUY2XHVGRjBDXHU2MjREXHU1NDJGXHU3NTI4IENETlxuICAgIGVuYWJsZWQgPSBwcm9jZXNzLmVudi5FTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiA9PT0gJ3RydWUnIHx8IFxuICAgICAgICAgICAgICAocHJvY2Vzcy5lbnYuRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gIT09ICdmYWxzZScgJiYgXG4gICAgICAgICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nICYmIFxuICAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuVklURV9QUkVWSUVXICE9PSAndHJ1ZScpLFxuICAgIGNkbkRvbWFpbiA9ICdodHRwczovL2FsbC5iZWxsaXMuY29tLmNuJyxcbiAgfSA9IG9wdGlvbnM7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY2RuLWFzc2V0cycsXG4gICAgYXBwbHk6ICdidWlsZCcsXG4gICAgYnVpbGRTdGFydCgpIHtcbiAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW2Nkbi1hc3NldHNdIENETiBcdTUyQTBcdTkwMUZcdTVERjJcdTU0MkZcdTc1MjhcdUZGMENcdTVFOTRcdTc1Mjg6ICR7YXBwTmFtZX0sIENETiBcdTU3REZcdTU0MEQ6ICR7Y2RuRG9tYWlufWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGBbY2RuLWFzc2V0c10gQ0ROIFx1NTJBMFx1OTAxRlx1NURGMlx1Nzk4MVx1NzUyOGApO1xuICAgICAgfVxuICAgIH0sXG4gICAgdHJhbnNmb3JtSW5kZXhIdG1sOiB7XG4gICAgICBvcmRlcjogJ3Bvc3QnLCAvLyBcdTU3MjggYWRkVmVyc2lvblBsdWdpbiBcdTRFNEJcdTU0MEVcdTYyNjdcdTg4NENcbiAgICAgIGhhbmRsZXIoaHRtbCkge1xuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTUzNzNcdTRGN0YgQ0ROIFx1NjNEMlx1NEVGNlx1ODhBQlx1Nzk4MVx1NzUyOFx1RkYwQ1x1NTk4Mlx1Njc5Q1x1NjYyRlx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1RkYwQ1x1NEU1Rlx1OTcwMFx1ODk4MVx1NkNFOFx1NTE2NVx1NjVFOVx1NjcxRiBVUkwgXHU4RjZDXHU2MzYyXHU4MTFBXHU2NzJDXG4gICAgICAgIC8vIFx1NTZFMFx1NEUzQVx1OTg4NFx1ODlDOFx1NzNBRlx1NTg4M1x1NTNFRlx1ODBGRFx1NEY3Rlx1NzUyOFx1NEU0Qlx1NTI0RFx1Njc4NFx1NUVGQVx1NzY4NFx1NTMwNVx1NTQyQiBDRE4gVVJMIFx1NzY4NFx1NEVBN1x1NzI2OVxuICAgICAgICBjb25zdCBpc1ByZXZpZXdCdWlsZCA9IHByb2Nlc3MuZW52LlZJVEVfUFJFVklFVyA9PT0gJ3RydWUnO1xuICAgICAgICBjb25zdCBuZWVkc0Vhcmx5Q29udmVydGVyID0gaXNQcmV2aWV3QnVpbGQgJiYgIWVuYWJsZWQ7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWVuYWJsZWQgJiYgIW5lZWRzRWFybHlDb252ZXJ0ZXIpIHtcbiAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBuZXdIdG1sID0gaHRtbDtcbiAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgLy8gMSkgXHU1OTA0XHU3NDA2IDxzY3JpcHQgc3JjPiBcdTY4MDdcdTdCN0VcdUZGMDhcdTRFQzVcdTU3MjggQ0ROIFx1NTQyRlx1NzUyOFx1NjVGNlx1OEY2Q1x1NjM2Mlx1RkYwOVxuICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgICAvKDxzY3JpcHRbXj5dKlxccytzcmM9W1wiJ10pKFteXCInXSspKFtcIiddW14+XSo+KS9nLFxuICAgICAgICAgICAgKG1hdGNoOiBzdHJpbmcsIHByZWZpeDogc3RyaW5nLCBzcmM6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFx1RkYxQS9hc3NldHMveHh4LmpzXG4gICAgICAgICAgICAgIGlmIChzcmMuc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKSAmJiAhc3JjLnN0YXJ0c1dpdGgoJy9hc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS8ke2FwcE5hbWV9JHtzcmN9YDtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcdUZGMUEvYXNzZXRzL2xheW91dC94eHguanNcbiAgICAgICAgICAgICAgaWYgKHNyYy5zdGFydHNXaXRoKCcvYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vbGF5b3V0LWFwcCR7c3JjfWA7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjFBLi9hc3NldHMveHh4LmpzIFx1NjIxNiBhc3NldHMveHh4LmpzXG4gICAgICAgICAgICAgIGlmIChzcmMuc3RhcnRzV2l0aCgnLi9hc3NldHMvJykgfHwgc3JjLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoID0gc3JjLnN0YXJ0c1dpdGgoJy4vJykgPyBzcmMuc3Vic3RyaW5nKDIpIDogc3JjO1xuICAgICAgICAgICAgICAgIGlmIChub3JtYWxpemVkUGF0aC5zdGFydHNXaXRoKCdhc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59L2xheW91dC1hcHAvJHtub3JtYWxpemVkUGF0aH1gO1xuICAgICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobm9ybWFsaXplZFBhdGguc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59LyR7YXBwTmFtZX0vJHtub3JtYWxpemVkUGF0aH1gO1xuICAgICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gMikgXHU1OTA0XHU3NDA2IDxsaW5rIGhyZWY+IFx1NjgwN1x1N0I3RVx1RkYwOENTU1x1MzAwMW1vZHVsZXByZWxvYWQgXHU3QjQ5XHVGRjA5XHVGRjA4XHU0RUM1XHU1NzI4IENETiBcdTU0MkZcdTc1MjhcdTY1RjZcdThGNkNcdTYzNjJcdUZGMDlcbiAgICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgICAgLyg8bGlua1tePl0qXFxzK2hyZWY9W1wiJ10pKFteXCInXSspKFtcIiddW14+XSo+KS9nLFxuICAgICAgICAgICAgKG1hdGNoOiBzdHJpbmcsIHByZWZpeDogc3RyaW5nLCBocmVmOiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFx1RkYxQS9hc3NldHMveHh4LmNzc1xuICAgICAgICAgICAgICBpZiAoaHJlZi5zdGFydHNXaXRoKCcvYXNzZXRzLycpICYmICFocmVmLnN0YXJ0c1dpdGgoJy9hc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS8ke2FwcE5hbWV9JHtocmVmfWA7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU1RTAzXHU1QzQwXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXHVGRjFBL2Fzc2V0cy9sYXlvdXQveHh4LmNzc1xuICAgICAgICAgICAgICBpZiAoaHJlZi5zdGFydHNXaXRoKCcvYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vbGF5b3V0LWFwcCR7aHJlZn1gO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFxuICAgICAgICAgICAgICBpZiAoaHJlZi5zdGFydHNXaXRoKCcuL2Fzc2V0cy8nKSB8fCBocmVmLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoID0gaHJlZi5zdGFydHNXaXRoKCcuLycpID8gaHJlZi5zdWJzdHJpbmcoMikgOiBocmVmO1xuICAgICAgICAgICAgICAgIGlmIChub3JtYWxpemVkUGF0aC5zdGFydHNXaXRoKCdhc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59L2xheW91dC1hcHAvJHtub3JtYWxpemVkUGF0aH1gO1xuICAgICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobm9ybWFsaXplZFBhdGguc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59LyR7YXBwTmFtZX0vJHtub3JtYWxpemVkUGF0aH1gO1xuICAgICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gMykgXHU1OTA0XHU3NDA2IDxpbWcgc3JjPiBcdTY4MDdcdTdCN0VcdUZGMDhcdTRFQzVcdTU3MjggQ0ROIFx1NTQyRlx1NzUyOFx1NjVGNlx1OEY2Q1x1NjM2Mlx1RkYwOVxuICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgICAvKDxpbWdbXj5dKlxccytzcmM9W1wiJ10pKFteXCInXSspKFtcIiddW14+XSo+KS9nLFxuICAgICAgICAgICAgKG1hdGNoOiBzdHJpbmcsIHByZWZpeDogc3RyaW5nLCBzcmM6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXHVGRjFBL2Fzc2V0cy94eHgucG5nXG4gICAgICAgICAgICAgIGlmIChzcmMuc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKSAmJiAhc3JjLnN0YXJ0c1dpdGgoJy9hc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS8ke2FwcE5hbWV9JHtzcmN9YDtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcdUZGMUEvYXNzZXRzL2xheW91dC94eHgucG5nXG4gICAgICAgICAgICAgIGlmIChzcmMuc3RhcnRzV2l0aCgnL2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59L2xheW91dC1hcHAke3NyY31gO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDQpIFx1NTkwNFx1NzQwNlx1NTE4NVx1ODA1NFx1NzY4NCBpbXBvcnQoKSBcdThDMDNcdTc1MjhcdUZGMDhcdTU3MjggSFRNTCBcdTZBMjFcdTY3N0ZcdTRFMkRcdUZGMDlcbiAgICAgICAgLy8gXHU0RkVFXHU1OTBEIHFpYW5rdW4gXHU2Q0U4XHU1MTY1XHU3Njg0XHU1MTg1XHU4MDU0IGltcG9ydCgnL2Fzc2V0cy9pbmRleC14eHguanMnKVxuICAgICAgICBjb25zdCBvcmlnaW5FeHByID1cbiAgICAgICAgICBgKCh0eXBlb2YgX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18hPT0ndW5kZWZpbmVkJyYmX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18pYCArXG4gICAgICAgICAgYD9uZXcgVVJMKF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fLCh0eXBlb2YgbG9jYXRpb24hPT0ndW5kZWZpbmVkJyYmbG9jYXRpb24ub3JpZ2luKXx8JycpLm9yaWdpbmAgK1xuICAgICAgICAgIGA6KCh0eXBlb2YgbG9jYXRpb24hPT0ndW5kZWZpbmVkJyYmbG9jYXRpb24ub3JpZ2luKXx8JycpKWA7XG4gICAgICAgIFxuICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgIC9pbXBvcnRcXChcXHMqKFsnXCJdKShcXC9hc3NldHNcXC8oaW5kZXh8bWFpbiktW14nXCJdKylcXDFcXHMqXFwpL2csXG4gICAgICAgICAgKF9tOiBzdHJpbmcsIF9xOiBzdHJpbmcsIGFic1BhdGg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgLy8gXHU0RkREXHU2MzAxXHU1MzlGXHU2NzA5XHU5MDNCXHU4RjkxXHVGRjBDXHU0RjQ2XHU3ODZFXHU0RkREXHU4REVGXHU1Rjg0XHU2QjYzXHU3ODZFXG4gICAgICAgICAgICByZXR1cm4gYGltcG9ydCgvKiBAdml0ZS1pZ25vcmUgKi8gKCR7b3JpZ2luRXhwcn0gKyAnJHthYnNQYXRofScpKWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyA1KSBcdTZDRThcdTUxNjVcdThENDRcdTZFOTBcdTUyQTBcdThGN0RcdTU2NjhcdTUyMURcdTU5Q0JcdTUzMTZcdTgxMUFcdTY3MkNcdTU0OENcdTY1RTlcdTY3MUYgVVJMIFx1OEY2Q1x1NjM2Mlx1ODExQVx1NjcyQ1xuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTUzNzNcdTRGN0YgQ0ROIFx1NjNEMlx1NEVGNlx1ODhBQlx1Nzk4MVx1NzUyOFx1RkYwQ1x1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1NjVGNlx1NEU1Rlx1OTcwMFx1ODk4MVx1NkNFOFx1NTE2NVx1NjVFOVx1NjcxRiBVUkwgXHU4RjZDXHU2MzYyXHU4MTFBXHU2NzJDXG4gICAgICAgIGlmICghbmV3SHRtbC5pbmNsdWRlcygnX19CVENfUkVTT1VSQ0VfTE9BREVSX18nKSB8fCBuZWVkc0Vhcmx5Q29udmVydGVyKSB7XG4gICAgICAgICAgLy8gXHU2ODM5XHU2MzZFIEVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OIFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1NTFCM1x1NUI5QVx1NjYyRlx1NTQyNlx1NTQyRlx1NzUyOCBDRE5cbiAgICAgICAgICBjb25zdCBjZG5FbmFibGVkID0gcHJvY2Vzcy5lbnYuRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gIT09ICdmYWxzZSc7XG4gICAgICAgICAgY29uc3QgaXNQcmV2aWV3QnVpbGQgPSBwcm9jZXNzLmVudi5WSVRFX1BSRVZJRVcgPT09ICd0cnVlJztcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBcdTY1RTlcdTY3MUYgVVJMIFx1OEY2Q1x1NjM2Mlx1ODExQVx1NjcyQ1x1RkYwOFx1NTcyOFx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1NjVGNlx1NkNFOFx1NTE2NVx1RkYwQ1x1NzUyOFx1NEU4RVx1NTcyOCBIVE1MIFx1ODlFM1x1Njc5MFx1NTI0RFx1OEY2Q1x1NjM2MiBDRE4gVVJMXHVGRjA5XG4gICAgICAgICAgLy8gXHU1MzczXHU0RjdGIENETiBcdTYzRDJcdTRFRjZcdTg4QUJcdTc5ODFcdTc1MjhcdUZGMENcdTk4ODRcdTg5QzhcdTczQUZcdTU4ODNcdTRFNUZcdTUzRUZcdTgwRkRcdTRGN0ZcdTc1MjhcdTUzMDVcdTU0MkIgQ0ROIFVSTCBcdTc2ODRcdTY1RTdcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcbiAgICAgICAgICBjb25zdCBlYXJseVVybENvbnZlcnRlclNjcmlwdCA9IGlzUHJldmlld0J1aWxkID8gYFxuPHNjcmlwdD5cbiAgKGZ1bmN0aW9uKCkge1xuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTcyOCBIVE1MIFx1ODlFM1x1Njc5MFx1NEU0Qlx1NTI0RFx1NUMzMVx1NTkwNFx1NzQwNiBDRE4gVVJMXHVGRjBDXHU5MDdGXHU1MTREXHU2RDRGXHU4OUM4XHU1NjY4XHU4QkY3XHU2QzQyIENETiBcdThENDRcdTZFOTBcbiAgICAvLyBcdThGRDlcdTRFMkFcdTgxMUFcdTY3MkNcdTVGQzVcdTk4N0JcdTU3MjhcdTYyNDBcdTY3MDlcdTUxNzZcdTRFRDYgc2NyaXB0IFx1NTQ4QyBsaW5rIFx1NjgwN1x1N0I3RVx1NEU0Qlx1NTI0RFx1NjI2N1x1ODg0Q1xuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zdCBjb252ZXJ0Q2RuVXJsID0gKHVybCkgPT4ge1xuICAgICAgICBpZiAoIXVybCB8fCAoIXVybC5zdGFydHNXaXRoKCdodHRwOi8vJykgJiYgIXVybC5zdGFydHNXaXRoKCdodHRwczovLycpKSkge1xuICAgICAgICAgIHJldHVybiB1cmw7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB1cmxPYmogPSBuZXcgVVJMKHVybCk7XG4gICAgICAgICAgaWYgKHVybE9iai5ob3N0bmFtZS5pbmNsdWRlcygnYWxsLmJlbGxpcy5jb20uY24nKSB8fCBcbiAgICAgICAgICAgICAgdXJsT2JqLmhvc3RuYW1lLmluY2x1ZGVzKCdiZWxsaXMxLm9zcy1jbi1zaGVuemhlbi5hbGl5dW5jcy5jb20nKSkge1xuICAgICAgICAgICAgLy8gXHU2M0QwXHU1M0Q2XHU4REVGXHU1Rjg0XHU5MEU4XHU1MjA2XHVGRjBDXHU1M0JCXHU2Mzg5XHU1RTk0XHU3NTI4XHU1MjREXHU3RjAwXG4gICAgICAgICAgICBsZXQgcGF0aCA9IHVybE9iai5wYXRobmFtZTtcbiAgICAgICAgICAgIGlmIChwYXRoLmluY2x1ZGVzKCcvYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgIHBhdGggPSBwYXRoLnN1YnN0cmluZyhwYXRoLmluZGV4T2YoJy9hc3NldHMvJykpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwYXRoLmluY2x1ZGVzKCcvYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICBwYXRoID0gcGF0aC5zdWJzdHJpbmcocGF0aC5pbmRleE9mKCcvYXNzZXRzL2xheW91dC8nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBcdTRGRERcdTc1NTlcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcdTU0OENcdTU0QzhcdTVFMENcbiAgICAgICAgICAgIHJldHVybiBwYXRoICsgKHVybE9iai5zZWFyY2ggfHwgJycpICsgKHVybE9iai5oYXNoIHx8ICcnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAvLyBVUkwgXHU4OUUzXHU2NzkwXHU1OTMxXHU4RDI1XHVGRjBDXHU4RkQ0XHU1NkRFXHU1MzlGIFVSTFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgICB9O1xuICAgICAgXG4gICAgICAvLyBcdTYyRTZcdTYyMkEgZG9jdW1lbnQuY3JlYXRlRWxlbWVudFx1RkYwQ1x1NTcyOFx1NTIxQlx1NUVGQSBzY3JpcHQgXHU1NDhDIGxpbmsgXHU2ODA3XHU3QjdFXHU2NUY2XHU4RjZDXHU2MzYyIFVSTFxuICAgICAgY29uc3Qgb3JpZ2luYWxDcmVhdGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudC5iaW5kKGRvY3VtZW50KTtcbiAgICAgIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgPSBmdW5jdGlvbih0YWdOYW1lLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBvcmlnaW5hbENyZWF0ZUVsZW1lbnQodGFnTmFtZSwgb3B0aW9ucyk7XG4gICAgICAgIGlmICh0YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzY3JpcHQnIHx8IHRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2xpbmsnKSB7XG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxTZXRBdHRyaWJ1dGUgPSBlbGVtZW50LnNldEF0dHJpYnV0ZS5iaW5kKGVsZW1lbnQpO1xuICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmICgobmFtZSA9PT0gJ3NyYycgfHwgbmFtZSA9PT0gJ2hyZWYnKSAmJiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRlZFVybCA9IGNvbnZlcnRDZG5VcmwodmFsdWUpO1xuICAgICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxTZXRBdHRyaWJ1dGUobmFtZSwgY29udmVydGVkVXJsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgIH07XG4gICAgICBcbiAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NURGMlx1NUI1OFx1NTcyOFx1NzY4NCBzY3JpcHQgXHU1NDhDIGxpbmsgXHU2ODA3XHU3QjdFXHVGRjA4XHU1OTgyXHU2NzlDIERPTSBcdTVERjJcdTdFQ0ZcdTkwRThcdTUyMDZcdTg5RTNcdTY3OTBcdUZGMDlcbiAgICAgIGNvbnN0IHByb2Nlc3NFeGlzdGluZ1RhZ3MgPSAoKSA9PiB7XG4gICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W3NyY10nKS5mb3JFYWNoKChzY3JpcHQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNyYyA9IHNjcmlwdC5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuICAgICAgICAgICAgaWYgKHNyYykge1xuICAgICAgICAgICAgICBjb25zdCBjb252ZXJ0ZWRVcmwgPSBjb252ZXJ0Q2RuVXJsKHNyYyk7XG4gICAgICAgICAgICAgIGlmIChjb252ZXJ0ZWRVcmwgIT09IHNyYykge1xuICAgICAgICAgICAgICAgIHNjcmlwdC5zZXRBdHRyaWJ1dGUoJ3NyYycsIGNvbnZlcnRlZFVybCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdsaW5rW2hyZWZdJykuZm9yRWFjaCgobGluaykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaHJlZiA9IGxpbmsuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG4gICAgICAgICAgICBpZiAoaHJlZikge1xuICAgICAgICAgICAgICBjb25zdCBjb252ZXJ0ZWRVcmwgPSBjb252ZXJ0Q2RuVXJsKGhyZWYpO1xuICAgICAgICAgICAgICBpZiAoY29udmVydGVkVXJsICE9PSBocmVmKSB7XG4gICAgICAgICAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBjb252ZXJ0ZWRVcmwpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBcbiAgICAgIC8vIFx1N0FDQlx1NTM3M1x1NTkwNFx1NzQwNlx1RkYwOFx1NTk4Mlx1Njc5QyBET00gXHU1REYyXHU3RUNGXHU5MEU4XHU1MjA2XHU4OUUzXHU2NzkwXHVGRjA5XG4gICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2xvYWRpbmcnIHx8IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdpbnRlcmFjdGl2ZScpIHtcbiAgICAgICAgcHJvY2Vzc0V4aXN0aW5nVGFncygpO1xuICAgICAgICAvLyBcdTc2RDFcdTU0MkMgRE9NIFx1NTNEOFx1NTMxNlx1RkYwQ1x1NTkwNFx1NzQwNlx1NTQwRVx1N0VFRFx1NkRGQlx1NTJBMFx1NzY4NFx1NjgwN1x1N0I3RVxuICAgICAgICBpZiAoZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBwcm9jZXNzRXhpc3RpbmdUYWdzKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvY2Vzc0V4aXN0aW5nVGFncygpO1xuICAgICAgfVxuICAgIH1cbiAgfSkoKTtcbjwvc2NyaXB0PmAgOiAnJztcbiAgICAgICAgICBcbiAgICAgICAgICBjb25zdCBsb2FkZXJTY3JpcHQgPSBgXG48c2NyaXB0PlxuICAoZnVuY3Rpb24oKSB7XG4gICAgLy8gXHU4RDQ0XHU2RTkwXHU1MkEwXHU4RjdEXHU1NjY4XHU1QzA2XHU1NzI4XHU4RkQwXHU4ODRDXHU2NUY2XHU2QTIxXHU1NzU3XHU0RTJEXHU1MjFEXHU1OUNCXHU1MzE2XG4gICAgLy8gXHU4RkQ5XHU5MUNDXHU1M0VBXHU4QkJFXHU3RjZFXHU1N0ZBXHU3ODQwXHU5MTREXHU3RjZFXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB3aW5kb3cuX19CVENfQ0ROX0NPTkZJR19fID0ge1xuICAgICAgICBhcHBOYW1lOiAnJHthcHBOYW1lfScsXG4gICAgICAgIGNkbkRvbWFpbjogJyR7Y2RuRG9tYWlufScsXG4gICAgICAgIG9zc0RvbWFpbjogJ2h0dHBzOi8vYmVsbGlzMS5vc3MtY24tc2hlbnpoZW4uYWxpeXVuY3MuY29tJyxcbiAgICAgICAgZW5hYmxlZDogJHtjZG5FbmFibGVkfVxuICAgICAgfTtcbiAgICB9XG4gIH0pKCk7XG48L3NjcmlwdD5gO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFx1NTcyOCA8L2hlYWQ+IFx1NEU0Qlx1NTI0RFx1NkNFOFx1NTE2NVx1RkYwOFx1NjVFOVx1NjcxRiBVUkwgXHU4RjZDXHU2MzYyXHU4MTFBXHU2NzJDXHU1RkM1XHU5ODdCXHU1NzI4XHU2NzAwXHU1MjREXHU5NzYyXHVGRjBDXHU1NzI4XHU2MjQwXHU2NzA5XHU1MTc2XHU0RUQ2IHNjcmlwdCBcdTU0OEMgbGluayBcdTY4MDdcdTdCN0VcdTRFNEJcdTUyNERcdUZGMDlcbiAgICAgICAgICBpZiAobmV3SHRtbC5pbmNsdWRlcygnPC9oZWFkPicpKSB7XG4gICAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTY1RTlcdTY3MUYgVVJMIFx1OEY2Q1x1NjM2Mlx1ODExQVx1NjcyQ1x1NUZDNVx1OTg3Qlx1NTcyOCA8aGVhZD4gXHU3Njg0XHU2NzAwXHU1MjREXHU5NzYyXHVGRjBDXHU1NzI4XHU2MjQwXHU2NzA5XHU1MTc2XHU0RUQ2XHU2ODA3XHU3QjdFXHU0RTRCXHU1MjREXG4gICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTVERjJcdTdFQ0ZcdTY3MDlcdTUxNzZcdTRFRDYgc2NyaXB0IFx1NjgwN1x1N0I3RVx1RkYwQ1x1NTcyOFx1N0IyQ1x1NEUwMFx1NEUyQSBzY3JpcHQgXHU2ODA3XHU3QjdFXHU0RTRCXHU1MjREXHU2M0QyXHU1MTY1XG4gICAgICAgICAgICBpZiAoZWFybHlVcmxDb252ZXJ0ZXJTY3JpcHQgJiYgbmV3SHRtbC5pbmNsdWRlcygnPHNjcmlwdCcpKSB7XG4gICAgICAgICAgICAgIC8vIFx1NTcyOFx1N0IyQ1x1NEUwMFx1NEUyQSA8c2NyaXB0PiBcdTYyMTYgPGxpbms+IFx1NjgwN1x1N0I3RVx1NEU0Qlx1NTI0RFx1NjNEMlx1NTE2NVx1NjVFOVx1NjcxRlx1OEY2Q1x1NjM2Mlx1ODExQVx1NjcyQ1xuICAgICAgICAgICAgICBjb25zdCBmaXJzdFRhZ01hdGNoID0gbmV3SHRtbC5tYXRjaCgvPChzY3JpcHR8bGluaylbXj5dKj4vaSk7XG4gICAgICAgICAgICAgIGlmIChmaXJzdFRhZ01hdGNoICYmIGZpcnN0VGFnTWF0Y2guaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnNsaWNlKDAsIGZpcnN0VGFnTWF0Y2guaW5kZXgpICsgZWFybHlVcmxDb252ZXJ0ZXJTY3JpcHQgKyBuZXdIdG1sLnNsaWNlKGZpcnN0VGFnTWF0Y2guaW5kZXgpO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDlcdTYyN0VcdTUyMzAgc2NyaXB0IFx1NjIxNiBsaW5rIFx1NjgwN1x1N0I3RVx1RkYwQ1x1NTcyOCA8L2hlYWQ+IFx1NEU0Qlx1NTI0RFx1NjNEMlx1NTE2NVxuICAgICAgICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoJzwvaGVhZD4nLCBgJHtlYXJseVVybENvbnZlcnRlclNjcmlwdH1cXG48L2hlYWQ+YCk7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBcdTZDRThcdTUxNjVcdThENDRcdTZFOTBcdTUyQTBcdThGN0RcdTU2NjhcdTkxNERcdTdGNkVcdTgxMUFcdTY3MkNcbiAgICAgICAgICAgIGlmICghbmV3SHRtbC5pbmNsdWRlcygnX19CVENfUkVTT1VSQ0VfTE9BREVSX18nKSkge1xuICAgICAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKCc8L2hlYWQ+JywgYCR7bG9hZGVyU2NyaXB0fVxcbjwvaGVhZD5gKTtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAobmV3SHRtbC5pbmNsdWRlcygnPC9ib2R5PicpKSB7XG4gICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDkgPC9oZWFkPlx1RkYwQ1x1NTcyOCA8L2JvZHk+IFx1NEU0Qlx1NTI0RFx1NkNFOFx1NTE2NVxuICAgICAgICAgICAgaWYgKGVhcmx5VXJsQ29udmVydGVyU2NyaXB0KSB7XG4gICAgICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoJzwvYm9keT4nLCBgJHtlYXJseVVybENvbnZlcnRlclNjcmlwdH1cXG48L2JvZHk+YCk7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghbmV3SHRtbC5pbmNsdWRlcygnX19CVENfUkVTT1VSQ0VfTE9BREVSX18nKSkge1xuICAgICAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKCc8L2JvZHk+JywgYCR7bG9hZGVyU2NyaXB0fVxcbjwvYm9keT5gKTtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2Nkbi1hc3NldHNdIFx1NURGMlx1NEUzQSBpbmRleC5odG1sIFx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1OEY2Q1x1NjM2Mlx1NEUzQSBDRE4gVVJMYCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBuZXdIdG1sO1xuICAgICAgfSxcbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGNkbi1pbXBvcnQudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvY2RuLWltcG9ydC50c1wiOy8qKlxuICogQ0ROIFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1OEY2Q1x1NjM2Mlx1NjNEMlx1NEVGNlxuICogXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU4RjZDXHU2MzYyXHU0RUUzXHU3ODAxXHU0RTJEXHU3Njg0IGltcG9ydCgpIFx1OEMwM1x1NzUyOFx1RkYwQ1x1NUMwNlx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1OEY2Q1x1NjM2Mlx1NEUzQSBDRE4gVVJMXG4gKiBcdTRFMEUgY2RuQXNzZXRzUGx1Z2luIFx1OTE0RFx1NTQwOFx1RkYwQ1x1NUI5RVx1NzNCMFx1NUI4Q1x1NjU3NFx1NzY4NCBDRE4gXHU1MkEwXHU5MDFGXG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1tjZG4taW1wb3J0XScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbY2RuLWltcG9ydF0nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1tjZG4taW1wb3J0XScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbY2RuLWltcG9ydF0nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2RuSW1wb3J0UGx1Z2luT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcdUZGMDhcdTU5ODIgJ2xvZ2lzdGljcy1hcHAnXHVGRjA5XG4gICAqL1xuICBhcHBOYW1lOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdTU0MkZcdTc1MjggQ0ROIFx1NTJBMFx1OTAxRlx1RkYwOFx1OUVEOFx1OEJBNFx1RkYxQVx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NTQyRlx1NzUyOFx1RkYwOVxuICAgKi9cbiAgZW5hYmxlZD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBDRE4gXHU1N0RGXHU1NDBEXHVGRjA4XHU5RUQ4XHU4QkE0XHVGRjFBYWxsLmJlbGxpcy5jb20uY25cdUZGMDlcbiAgICovXG4gIGNkbkRvbWFpbj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBDRE4gXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU4RjZDXHU2MzYyXHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjZG5JbXBvcnRQbHVnaW4ob3B0aW9uczogQ2RuSW1wb3J0UGx1Z2luT3B0aW9ucyk6IFBsdWdpbiB7XG4gIGNvbnN0IHtcbiAgICBhcHBOYW1lLFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OUVEOFx1OEJBNFx1NTQyRlx1NzUyOFx1Njc2MVx1NEVGNlx1NUZDNVx1OTg3Qlx1NjYwRVx1Nzg2RVx1NjhDMFx1NjdFNSBFTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiBcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcbiAgICAvLyBcdTU5ODJcdTY3OUMgRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gXHU4OEFCXHU4QkJFXHU3RjZFXHU0RTNBICdmYWxzZSdcdUZGMENcdTUyMTlcdTc5ODFcdTc1MjggQ0ROXG4gICAgLy8gXHU1M0VBXHU2NzA5XHU1NzI4XHU2NjBFXHU3ODZFXHU1NDJGXHU3NTI4XHVGRjA4RU5BQkxFX0NETl9BQ0NFTEVSQVRJT049dHJ1ZVx1RkYwOVx1NjIxNlx1NjcyQVx1OEJCRVx1N0Y2RVx1NEUxNFx1NjYyRlx1NzUxRlx1NEVBN1x1Njc4NFx1NUVGQVx1NjVGNlx1RkYwQ1x1NjI0RFx1NTQyRlx1NzUyOCBDRE5cbiAgICBlbmFibGVkID0gcHJvY2Vzcy5lbnYuRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gPT09ICd0cnVlJyB8fCBcbiAgICAgICAgICAgICAgKHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OICE9PSAnZmFsc2UnICYmIFxuICAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyAmJiBcbiAgICAgICAgICAgICAgIHByb2Nlc3MuZW52LlZJVEVfUFJFVklFVyAhPT0gJ3RydWUnKSxcbiAgICBjZG5Eb21haW4gPSAnaHR0cHM6Ly9hbGwuYmVsbGlzLmNvbS5jbicsXG4gIH0gPSBvcHRpb25zO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2Nkbi1pbXBvcnQnLFxuICAgIGFwcGx5OiAnYnVpbGQnLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtjZG4taW1wb3J0XSBDRE4gXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU4RjZDXHU2MzYyXHU1REYyXHU1NDJGXHU3NTI4XHVGRjBDXHU1RTk0XHU3NTI4OiAke2FwcE5hbWV9LCBDRE4gXHU1N0RGXHU1NDBEOiAke2NkbkRvbWFpbn1gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW2Nkbi1pbXBvcnRdIENETiBcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdThGNkNcdTYzNjJcdTVERjJcdTc5ODFcdTc1MjhgKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlbmRlckNodW5rKGNvZGU6IHN0cmluZywgY2h1bms6IGFueSkge1xuICAgICAgLy8gXHU1NzI4IHJlbmRlckNodW5rIFx1OTYzNlx1NkJCNVx1NTkwNFx1NzQwNlx1Njc4NFx1NUVGQVx1NTQwRVx1NzY4NFx1NEVFM1x1NzgwMVxuICAgICAgLy8gXHU2QjY0XHU2NUY2IGltcG9ydCgpIFx1OEMwM1x1NzUyOFx1NURGMlx1N0VDRlx1ODhBQiBWaXRlIFx1OEY2Q1x1NjM2Mlx1NEUzQVx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1NzY4NCBjaHVuayBcdTY1ODdcdTRFRjZcdUZGMDhcdTU5ODIgLi9pbmRleC14eHguanNcdUZGMDlcbiAgICAgIGlmICghZW5hYmxlZCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1M0VBXHU1OTA0XHU3NDA2IEpTIGNodW5rIFx1NjU4N1x1NEVGNlxuICAgICAgaWYgKCFjaHVuay5maWxlTmFtZS5lbmRzV2l0aCgnLmpzJykpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1OERGM1x1OEZDN1x1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlx1RkYwOGluZGV4LXh4eC5qc1x1RkYwOVx1RkYwQ1x1NTZFMFx1NEUzQVx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlx1NjYyRlx1OTAxQVx1OEZDNyBzY3JpcHQgXHU2ODA3XHU3QjdFXHU3NkY0XHU2M0E1XHU1MkEwXHU4RjdEXHU3Njg0XHVGRjBDXHU1REYyXHU1NzI4IEhUTUwgXHU0RTJEXHU1OTA0XHU3NDA2XG4gICAgICBpZiAoY2h1bmsuaXNFbnRyeSB8fCBjaHVuay5maWxlTmFtZS5tYXRjaCgvXmluZGV4LVthLXpBLVowLTldK1xcLmpzJC8pKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcbiAgICAgIGxldCBuZXdDb2RlID0gY29kZTtcblxuICAgICAgLy8gXHU1MzM5XHU5MTREIGltcG9ydCgpIFx1OEMwM1x1NzUyOFx1RkYwQ1x1OEJDNlx1NTIyQlx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1NzY4NFx1OEQ0NFx1NkU5MFxuICAgICAgLy8gXHU1MzM5XHU5MTREXHU2QTIxXHU1RjBGXHVGRjFBaW1wb3J0KCcuLi4nKSBcdTYyMTYgaW1wb3J0KFwiLi4uXCIpXG4gICAgICBjb25zdCBpbXBvcnRQYXR0ZXJuID0gL2ltcG9ydFxccypcXChcXHMqKFsnXCJdKShbXidcIl0rKVxcMVxccypcXCkvZztcblxuICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShpbXBvcnRQYXR0ZXJuLCAobWF0Y2g6IHN0cmluZywgcXVvdGU6IHN0cmluZywgc3BlY2lmaWVyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgLy8gXHU1M0VBXHU1OTA0XHU3NDA2XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA4Li94eHguanNcdUZGMDlcdTU0OEMgL2Fzc2V0cy8gXHU4REVGXHU1Rjg0XG4gICAgICAgIC8vIFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOGh0dHA6Ly9cdTMwMDFodHRwczovL1x1RkYwOVx1NTQ4QyBub2RlX21vZHVsZXMgXHU4REVGXHU1Rjg0XHU0RTBEXHU1OTA0XHU3NDA2XG4gICAgICAgIGNvbnN0IGlzUmVsYXRpdmVQYXRoID0gc3BlY2lmaWVyLnN0YXJ0c1dpdGgoJy4vJyk7XG4gICAgICAgIGNvbnN0IGlzQXNzZXRzUGF0aCA9IHNwZWNpZmllci5zdGFydHNXaXRoKCcvYXNzZXRzLycpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFpc1JlbGF0aXZlUGF0aCAmJiAhaXNBc3NldHNQYXRoKSB7XG4gICAgICAgICAgcmV0dXJuIG1hdGNoOyAvLyBcdTk3NUVcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTRFMTRcdTk3NUUgL2Fzc2V0cy8gXHU4REVGXHU1Rjg0XHVGRjBDXHU0RkREXHU2MzAxXHU1MzlGXHU2ODM3XG4gICAgICAgIH1cblxuICAgICAgICBtb2RpZmllZCA9IHRydWU7XG5cbiAgICAgICAgLy8gXHU4OUM0XHU4MzAzXHU1MzE2XHU4REVGXHU1Rjg0XG4gICAgICAgIGxldCBub3JtYWxpemVkUGF0aDogc3RyaW5nO1xuICAgICAgICBpZiAoaXNSZWxhdGl2ZVBhdGgpIHtcbiAgICAgICAgICAvLyBcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMUEuL2luZGV4LXh4eC5qcyAtPiAvYXNzZXRzL2luZGV4LXh4eC5qc1xuICAgICAgICAgIC8vIFx1NjIxNlx1ODAwNVx1RkYxQS4vYXNzZXRzL3h4eC5qcyAtPiAvYXNzZXRzL3h4eC5qc1xuICAgICAgICAgIGlmIChzcGVjaWZpZXIuc3RhcnRzV2l0aCgnLi9hc3NldHMvJykpIHtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRQYXRoID0gJy8nICsgc3BlY2lmaWVyLnN1YnN0cmluZygyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVml0ZSBjaHVuayBcdTY1ODdcdTRFRjZcdUZGMUEuL2luZGV4LXh4eC5qcyAtPiAvYXNzZXRzL2luZGV4LXh4eC5qc1xuICAgICAgICAgICAgbm9ybWFsaXplZFBhdGggPSAnL2Fzc2V0cy8nICsgc3BlY2lmaWVyLnN1YnN0cmluZygyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gXHU1REYyXHU3RUNGXHU2NjJGXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0IC9hc3NldHMveHh4LmpzXG4gICAgICAgICAgbm9ybWFsaXplZFBhdGggPSBzcGVjaWZpZXI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTUyMjRcdTY1QURcdTY2MkZcdTU0MjZcdTY2MkZcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcbiAgICAgICAgY29uc3QgaXNMYXlvdXRSZXNvdXJjZSA9IG5vcm1hbGl6ZWRQYXRoLmluY2x1ZGVzKCcvYXNzZXRzL2xheW91dC8nKTtcblxuICAgICAgICAvLyBcdTc1MUZcdTYyMTAgQ0ROIFVSTFxuICAgICAgICBsZXQgY2RuVXJsOiBzdHJpbmc7XG4gICAgICAgIGlmIChpc0xheW91dFJlc291cmNlKSB7XG4gICAgICAgICAgLy8gXHU1RTAzXHU1QzQwXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXG4gICAgICAgICAgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS9sYXlvdXQtYXBwJHtub3JtYWxpemVkUGF0aH1gO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFxuICAgICAgICAgIGNkblVybCA9IGAke2NkbkRvbWFpbn0vJHthcHBOYW1lfSR7bm9ybWFsaXplZFBhdGh9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1OEY2Q1x1NjM2Mlx1NEUzQSBDRE4gVVJMXG4gICAgICAgIHJldHVybiBgaW1wb3J0KCR7cXVvdGV9JHtjZG5Vcmx9JHtxdW90ZX0pYDtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGBbY2RuLWltcG9ydF0gXHU1REYyXHU4RjZDXHU2MzYyIGNodW5rICR7Y2h1bmsuZmlsZU5hbWV9IFx1NEUyRFx1NzY4NFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1NEUzQSBDRE4gVVJMYCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtb2RpZmllZCA/IHsgY29kZTogbmV3Q29kZSwgbWFwOiBudWxsIH0gOiBudWxsO1xuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxccmVzb2x2ZS1idGMtaW1wb3J0cy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9yZXNvbHZlLWJ0Yy1pbXBvcnRzLnRzXCI7LyoqXG4gKiBcdTg5RTNcdTY3OTAgQGJ0Yy8qIFx1NTMwNVx1NUJGQ1x1NTE2NVx1NjNEMlx1NEVGNlxuICogXHU1OTA0XHU3NDA2XHU0RUNFXHU1REYyXHU2Nzg0XHU1RUZBXHU3Njg0XHU1MzA1XHVGRjA4XHU1OTgyIHNoYXJlZC1jb3JlL2Rpc3QvaW5kZXgubWpzXHVGRjA5XHU0RTJEXHU1QkZDXHU1MTY1XHU3Njg0IEBidGMvKiBcdTZBMjFcdTU3NTdcbiAqIFx1NTQwQ1x1NjVGNlx1NTkwNFx1NzQwNiBzaGFyZWQtY29tcG9uZW50cyBcdTUxODVcdTkwRThcdTRGN0ZcdTc1MjhcdTc2ODRcdTUyMkJcdTU0MERcdUZGMDhcdTU5ODIgQGJ0Yy1jb21wb25lbnRzLCBAYnRjLWNvbW1vbiBcdTdCNDlcdUZGMDlcbiAqIFx1Nzg2RVx1NEZERCBSb2xsdXAgXHU4MEZEXHU1OTFGXHU2QjYzXHU3ODZFXHU4OUUzXHU2NzkwXHU4RkQ5XHU0RTlCXHU1QkZDXHU1MTY1XHVGRjBDXHU1MzczXHU0RjdGXHU1QjgzXHU0RUVDXHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU3Njg0XHU1MzA1XG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NTZFMFx1NEUzQSBlc2J1aWxkIFx1NjVFMFx1NkNENVx1NkI2M1x1Nzg2RVx1ODlFM1x1Njc5MCB3b3Jrc3BhY2UgXHU1MzA1XG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXHVGRjBDXHU5MDdGXHU1MTREXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHU3Njg0XHU4OUUzXHU2NzkwXHU5NUVFXHU5ODk4XG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbcmVzb2x2ZS1idGMtaW1wb3J0c10nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW3Jlc29sdmUtYnRjLWltcG9ydHNdJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbcmVzb2x2ZS1idGMtaW1wb3J0c10nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW3Jlc29sdmUtYnRjLWltcG9ydHNdJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhpc3RzU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHsgY3JlYXRlUGF0aEhlbHBlcnMgfSBmcm9tICcuLi91dGlscy9wYXRoLWhlbHBlcnMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlc29sdmVCdGNJbXBvcnRzT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBcdTVFOTRcdTc1MjhcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAgICovXG4gIGFwcERpcjogc3RyaW5nO1xuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4XHVGRjA4XHU5RUQ4XHU4QkE0XHVGRjFBdHJ1ZVx1RkYwOVxuICAgKi9cbiAgZW5hYmxlZD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogXHU4OUUzXHU2NzkwIEBidGMvKiBcdTUzMDVcdTVCRkNcdTUxNjVcdTYzRDJcdTRFRjZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVCdGNJbXBvcnRzUGx1Z2luKG9wdGlvbnM6IFJlc29sdmVCdGNJbXBvcnRzT3B0aW9ucyk6IFBsdWdpbiB7XG4gIGNvbnN0IHsgYXBwRGlyLCBlbmFibGVkID0gdHJ1ZSB9ID0gb3B0aW9ucztcblxuICBpZiAoIWVuYWJsZWQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3Jlc29sdmUtYnRjLWltcG9ydHMnLFxuICAgICAgYXBwbHk6ICdidWlsZCcsXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IHsgd2l0aFBhY2thZ2VzLCB3aXRoUm9vdCwgd2l0aENvbmZpZ3MgfSA9IGNyZWF0ZVBhdGhIZWxwZXJzKGFwcERpcik7XG5cbiAgLyoqXG4gICAqIFx1NjhDMFx1NjdFNVx1NUJGQ1x1NTE2NVx1NjYyRlx1NTQyNlx1Njc2NVx1ODFFQVx1NURGMlx1Njc4NFx1NUVGQVx1NzY4NFx1NTMwNVx1NjIxNiBzaGFyZWQtY29tcG9uZW50cyBcdTZFOTBcdTc4MDFcbiAgICovXG4gIGZ1bmN0aW9uIGlzRnJvbUJ1aWx0UGFja2FnZU9yU2hhcmVkQ29tcG9uZW50cyhpbXBvcnRlcj86IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICghaW1wb3J0ZXIpIHJldHVybiBmYWxzZTtcbiAgICBcbiAgICAvLyBcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTc2ODRcdTUzMDVcdUZGMDhcdTU5ODIgc2hhcmVkLWNvcmUvZGlzdC9pbmRleC5tanNcdUZGMDlcbiAgICBjb25zdCBpc0Zyb21CdWlsdFBhY2thZ2UgPSAoXG4gICAgICBpbXBvcnRlci5pbmNsdWRlcygnL2Rpc3QvJykgfHxcbiAgICAgIGltcG9ydGVyLmluY2x1ZGVzKCdcXFxcZGlzdFxcXFwnKSB8fFxuICAgICAgKGltcG9ydGVyLmVuZHNXaXRoKCcubWpzJykgJiYgIWltcG9ydGVyLmluY2x1ZGVzKCcvc3JjLycpKSB8fFxuICAgICAgKGltcG9ydGVyLmVuZHNXaXRoKCcuanMnKSAmJiAhaW1wb3J0ZXIuaW5jbHVkZXMoJy9zcmMvJykgJiYgIWltcG9ydGVyLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSlcbiAgICApO1xuICAgIFxuICAgIC8vIFx1Njc2NVx1ODFFQSBzaGFyZWQtY29tcG9uZW50cyBcdTZFOTBcdTc4MDFcdUZGMDhcdTk3MDBcdTg5ODFcdTg5RTNcdTY3OTBcdTUxODVcdTkwRThcdTUyMkJcdTU0MERcdUZGMDlcbiAgICBjb25zdCBpc0Zyb21TaGFyZWRDb21wb25lbnRzID0gaW1wb3J0ZXIuaW5jbHVkZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYycpO1xuICAgIFxuICAgIHJldHVybiBpc0Zyb21CdWlsdFBhY2thZ2UgfHwgaXNGcm9tU2hhcmVkQ29tcG9uZW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTc4NkVcdTRGRERcdThERUZcdTVGODRcdTY3MDlcdTZCNjNcdTc4NkVcdTc2ODRcdTYyNjlcdTVDNTVcdTU0MERcbiAgICogXHU1OTgyXHU2NzlDXHU4REVGXHU1Rjg0XHU2Q0ExXHU2NzA5XHU2MjY5XHU1QzU1XHU1NDBEXHVGRjBDXHU1QzFEXHU4QkQ1XHU2REZCXHU1MkEwXHU1RTM4XHU4OUMxXHU3Njg0XHU2MjY5XHU1QzU1XHU1NDBEXG4gICAqL1xuICBmdW5jdGlvbiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIFx1NTk4Mlx1Njc5Q1x1OERFRlx1NUY4NFx1NURGMlx1N0VDRlx1NjcwOVx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwQ1x1NzZGNFx1NjNBNVx1OEZENFx1NTZERVxuICAgIGlmICgvXFwuKHRzfHRzeHxqc3xqc3h8dnVlfGpzb258Y3NzfHNjc3N8c2Fzc3xsZXNzKSQvaS50ZXN0KGZpbGVQYXRoKSkge1xuICAgICAgcmV0dXJuIGZpbGVQYXRoO1xuICAgIH1cbiAgICBcbiAgICAvLyBcdTYzMDlcdTRGMThcdTUxNDhcdTdFQTdcdTVDMURcdThCRDVcdTZERkJcdTUyQTBcdTYyNjlcdTVDNTVcdTU0MERcdUZGMUEudHN4LCAudHMsIC5qc3gsIC5qc1xuICAgIGNvbnN0IGV4dGVuc2lvbnMgPSBbJy50c3gnLCAnLnRzJywgJy5qc3gnLCAnLmpzJ107XG4gICAgZm9yIChjb25zdCBleHQgb2YgZXh0ZW5zaW9ucykge1xuICAgICAgY29uc3QgcGF0aFdpdGhFeHQgPSBgJHtmaWxlUGF0aH0ke2V4dH1gO1xuICAgICAgaWYgKGV4aXN0c1N5bmMocGF0aFdpdGhFeHQpKSB7XG4gICAgICAgIHJldHVybiBwYXRoV2l0aEV4dDtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTgyXHU2NzlDXHU2MjQwXHU2NzA5XHU2MjY5XHU1QzU1XHU1NDBEXHU5MEZEXHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU4RkQ0XHU1NkRFXHU1MzlGXHU4REVGXHU1Rjg0XHVGRjBDXHU4QkE5IFZpdGUgXHU3Njg0XHU2MjY5XHU1QzU1XHU1NDBEXHU4OUUzXHU2NzkwXHU2NzNBXHU1MjM2XHU1OTA0XHU3NDA2XG4gICAgcmV0dXJuIGZpbGVQYXRoO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MCBzaGFyZWQtY29tcG9uZW50cyBcdTUxODVcdTkwRThcdTUyMkJcdTU0MERcbiAgICovXG4gIGZ1bmN0aW9uIHJlc29sdmVTaGFyZWRDb21wb25lbnRzQWxpYXMoaWQ6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IHsgd2l0aFBhY2thZ2VzIH0gPSBjcmVhdGVQYXRoSGVscGVycyhhcHBEaXIpO1xuICAgIFxuICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjLWNvbXBvbmVudHNcbiAgICBpZiAoaWQgPT09ICdAYnRjLWNvbXBvbmVudHMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMtY29tcG9uZW50cy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BidGMtY29tcG9uZW50cy8nLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBcbiAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy1jb21tb25cbiAgICBpZiAoaWQgPT09ICdAYnRjLWNvbW1vbicgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy1jb21tb24vJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAYnRjLWNvbW1vbi8nLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbW1vbi8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjLWNydWRcbiAgICBpZiAoaWQgPT09ICdAYnRjLWNydWQnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMtY3J1ZC8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BidGMtY3J1ZC8nLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NydWQvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBcbiAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy1zdHlsZXNcbiAgICBpZiAoaWQgPT09ICdAYnRjLXN0eWxlcycgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy1zdHlsZXMvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAYnRjLXN0eWxlcy8nLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL3N0eWxlcy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjLWxvY2FsZXNcbiAgICBpZiAoaWQgPT09ICdAYnRjLWxvY2FsZXMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMtbG9jYWxlcy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BidGMtbG9jYWxlcy8nLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2xvY2FsZXMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBcbiAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy1hc3NldHMgXHU1NDhDIEBhc3NldHNcbiAgICBpZiAoaWQgPT09ICdAYnRjLWFzc2V0cycgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy1hc3NldHMvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAYnRjLWFzc2V0cy8nLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2Fzc2V0cy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gJ0Bhc3NldHMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0Bhc3NldHMvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAYXNzZXRzLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvYXNzZXRzLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IEBidGMtdXRpbHNcbiAgICBpZiAoaWQgPT09ICdAYnRjLXV0aWxzJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjLXV0aWxzLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGJ0Yy11dGlscy8nLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL3V0aWxzLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IEBwbHVnaW5zXG4gICAgaWYgKGlkID09PSAnQHBsdWdpbnMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BwbHVnaW5zLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQHBsdWdpbnMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9wbHVnaW5zLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2XHU1NkZFXHU4ODY4XHU3NkY4XHU1MTczXHU1MjJCXHU1NDBEXHVGRjA4XHU2MzA5XHU0RUNFXHU1MTc3XHU0RjUzXHU1MjMwXHU0RTAwXHU4MjJDXHU3Njg0XHU5ODdBXHU1RThGXHVGRjA5XG4gICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1MTc3XHU0RjUzXHU3Njg0XHU4REVGXHU1Rjg0XHU1MjJCXHU1NDBEXHU1RkM1XHU5ODdCXHU1NzI4XHU5MDFBXHU3NTI4XHU1MjJCXHU1NDBEXHU0RTRCXHU1MjREXHU2OEMwXHU2N0U1XG4gICAgaWYgKGlkID09PSAnQGNoYXJ0cy11dGlscy9jc3MtdmFyJyB8fCBpZC5zdGFydHNXaXRoKCdAY2hhcnRzLXV0aWxzL2Nzcy12YXIvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAY2hhcnRzLXV0aWxzL2Nzcy12YXInLCAnJykucmVwbGFjZSgvXlxcLy8sICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzL2Nzcy12YXIke3N1YlBhdGggPyAnLycgKyBzdWJQYXRoIDogJyd9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gJ0BjaGFydHMtdXRpbHMvY29sb3InIHx8IGlkLnN0YXJ0c1dpdGgoJ0BjaGFydHMtdXRpbHMvY29sb3IvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAY2hhcnRzLXV0aWxzL2NvbG9yJywgJycpLnJlcGxhY2UoL15cXC8vLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9jb2xvciR7c3ViUGF0aCA/ICcvJyArIHN1YlBhdGggOiAnJ31gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgaWYgKGlkID09PSAnQGNoYXJ0cy11dGlscy9ncmFkaWVudCcgfHwgaWQuc3RhcnRzV2l0aCgnQGNoYXJ0cy11dGlscy9ncmFkaWVudC8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BjaGFydHMtdXRpbHMvZ3JhZGllbnQnLCAnJykucmVwbGFjZSgvXlxcLy8sICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzL2dyYWRpZW50JHtzdWJQYXRoID8gJy8nICsgc3ViUGF0aCA6ICcnfWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBpZiAoaWQgPT09ICdAY2hhcnRzLWNvbXBvc2FibGVzL3VzZUNoYXJ0Q29tcG9uZW50JyB8fCBpZC5zdGFydHNXaXRoKCdAY2hhcnRzLWNvbXBvc2FibGVzL3VzZUNoYXJ0Q29tcG9uZW50LycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGNoYXJ0cy1jb21wb3NhYmxlcy91c2VDaGFydENvbXBvbmVudCcsICcnKS5yZXBsYWNlKC9eXFwvLywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQke3N1YlBhdGggPyAnLycgKyBzdWJQYXRoIDogJyd9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gJ0BjaGFydHMtdHlwZXMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BjaGFydHMtdHlwZXMvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAY2hhcnRzLXR5cGVzLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3R5cGVzLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgaWYgKGlkID09PSAnQGNoYXJ0cy11dGlscycgfHwgaWQuc3RhcnRzV2l0aCgnQGNoYXJ0cy11dGlscy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BjaGFydHMtdXRpbHMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBpZiAoaWQgPT09ICdAY2hhcnRzLWNvbXBvc2FibGVzJyB8fCBpZC5zdGFydHNXaXRoKCdAY2hhcnRzLWNvbXBvc2FibGVzLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGNoYXJ0cy1jb21wb3NhYmxlcy8nLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy9jb21wb3NhYmxlcy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gJ0BjaGFydHMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BjaGFydHMvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAY2hhcnRzLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdyZXNvbHZlLWJ0Yy1pbXBvcnRzJyxcbiAgICBhcHBseTogJ2J1aWxkJyxcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgY29uc29sZS5pbmZvKCdbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU1REYyXHU1NDJGXHU3NTI4XHVGRjBDXHU1QzA2XHU4OUUzXHU2NzkwXHU0RUNFXHU1REYyXHU2Nzg0XHU1RUZBXHU1MzA1XHU0RTJEXHU1QkZDXHU1MTY1XHU3Njg0IEBidGMvKiBcdTZBMjFcdTU3NTdcdTU0OEMgc2hhcmVkLWNvbXBvbmVudHMgXHU1MTg1XHU5MEU4XHU1MjJCXHU1NDBEJyk7XG4gICAgfSxcbiAgICByZXNvbHZlSWQoaWQ6IHN0cmluZywgaW1wb3J0ZXI/OiBzdHJpbmcpIHtcbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NUJGQ1x1NTE2NVx1NjYyRlx1NTQyNlx1Njc2NVx1ODFFQVx1NURGMlx1Njc4NFx1NUVGQVx1NzY4NFx1NTMwNVx1NjIxNiBzaGFyZWQtY29tcG9uZW50cyBcdTZFOTBcdTc4MDFcbiAgICAgIGNvbnN0IHNob3VsZFJlc29sdmUgPSBpc0Zyb21CdWlsdFBhY2thZ2VPclNoYXJlZENvbXBvbmVudHMoaW1wb3J0ZXIpO1xuICAgICAgXG4gICAgICBpZiAoIXNob3VsZFJlc29sdmUpIHtcbiAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1QkZDXHU1MTY1XHU0RTBEXHU2NjJGXHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU3Njg0XHU1MzA1XHU2MjE2IHNoYXJlZC1jb21wb25lbnRzIFx1NkU5MFx1NzgwMVx1RkYwQ1x1OEJBOVx1NTE3Nlx1NEVENlx1NjNEMlx1NEVGNlx1RkYwOFx1NTk4Mlx1NTIyQlx1NTQwRFx1OTE0RFx1N0Y2RVx1RkYwOVx1NTkwNFx1NzQwNlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU5OTk2XHU1MTQ4XHU1OTA0XHU3NDA2IHNoYXJlZC1jb21wb25lbnRzIFx1NTE4NVx1OTBFOFx1NTIyQlx1NTQwRFx1RkYwOFx1OEZEOVx1NEU5Qlx1NTIyQlx1NTQwRFx1NTNFRlx1ODBGRFx1NTcyOFx1NEVGQlx1NEY1NVx1NTczMFx1NjVCOVx1NEY3Rlx1NzUyOFx1RkYwOVxuICAgICAgY29uc3Qgc2hhcmVkQ29tcG9uZW50c0FsaWFzID0gcmVzb2x2ZVNoYXJlZENvbXBvbmVudHNBbGlhcyhpZCk7XG4gICAgICBpZiAoc2hhcmVkQ29tcG9uZW50c0FsaWFzKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW3Jlc29sdmUtYnRjLWltcG9ydHNdIFx1ODlFM1x1Njc5MCBzaGFyZWQtY29tcG9uZW50cyBcdTUxODVcdTkwRThcdTUyMkJcdTU0MEQgJHtpZH0gKFx1Njc2NVx1ODFFQSAke2ltcG9ydGVyPy5zcGxpdCgnLycpLnNsaWNlKC0yKS5qb2luKCcvJykgfHwgJ3Vua25vd24nfSkgLT4gJHtzaGFyZWRDb21wb25lbnRzQWxpYXMuc3BsaXQoJy8nKS5zbGljZSgtMykuam9pbignLycpfWApO1xuICAgICAgICByZXR1cm4gc2hhcmVkQ29tcG9uZW50c0FsaWFzO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgQGNvbmZpZ3MgXHU1MzA1XHU3Njg0XHU1QkZDXHU1MTY1XHVGRjA4XHU0RUNFXHU1REYyXHU2Nzg0XHU1RUZBXHU1MzA1XHU0RTJEXHU1QkZDXHU1MTY1XHU2NUY2XHVGRjBDXHU3M0IwXHU1NzI4XHU2MzA3XHU1NDExIHNoYXJlZC1jb3JlL3NyYy9jb25maWdzXHVGRjA5XG4gICAgICBpZiAoaWQuc3RhcnRzV2l0aCgnQGNvbmZpZ3MvJykpIHtcbiAgICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0Bjb25maWdzLycsICcnKTtcbiAgICAgICAgY29uc3Qgc291cmNlUGF0aCA9IHdpdGhDb25maWdzKHN1YlBhdGgpO1xuICAgICAgICBjb25zdCBmaW5hbFBhdGggPSBlbnN1cmVGaWxlRXh0ZW5zaW9uKHNvdXJjZVBhdGgpO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5pbmZvKGBbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU4OUUzXHU2NzkwIEBjb25maWdzIFx1NTMwNSAke2lkfSAoXHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU1MzA1ICR7aW1wb3J0ZXI/LnNwbGl0KCcvJykuc2xpY2UoLTIpLmpvaW4oJy8nKSB8fCAndW5rbm93bid9KSAtPiAke2ZpbmFsUGF0aC5zcGxpdCgnLycpLnNsaWNlKC0zKS5qb2luKCcvJyl9YCk7XG4gICAgICAgIHJldHVybiBmaW5hbFBhdGg7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjLyogXHU1MzA1XHU3Njg0XHU1QkZDXHU1MTY1XG4gICAgICBpZiAoIWlkLnN0YXJ0c1dpdGgoJ0BidGMvJykpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjL3NoYXJlZC1jb21wb25lbnRzXG4gICAgICBpZiAoaWQgPT09ICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjL3NoYXJlZC1jb21wb25lbnRzLycpKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZVBhdGggPSBpZCA9PT0gJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnXG4gICAgICAgICAgPyB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9pbmRleC50cycpXG4gICAgICAgICAgOiB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy8ke2lkLnJlcGxhY2UoJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMvJywgJycpfWApO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5pbmZvKGBbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU4OUUzXHU2NzkwICR7aWR9IChcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDUgJHtpbXBvcnRlcj8uc3BsaXQoJy8nKS5zbGljZSgtMikuam9pbignLycpIHx8ICd1bmtub3duJ30pIC0+ICR7c291cmNlUGF0aC5zcGxpdCgnLycpLnNsaWNlKC0zKS5qb2luKCcvJyl9YCk7XG4gICAgICAgIHJldHVybiBzb3VyY2VQYXRoO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy9zaGFyZWQtY29yZVxuICAgICAgaWYgKGlkID09PSAnQGJ0Yy9zaGFyZWQtY29yZScgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy9zaGFyZWQtY29yZS8nKSkge1xuICAgICAgICBjb25zdCBzb3VyY2VQYXRoID0gaWQgPT09ICdAYnRjL3NoYXJlZC1jb3JlJ1xuICAgICAgICAgID8gd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMvaW5kZXgudHMnKVxuICAgICAgICAgIDogd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29yZS9zcmMvJHtpZC5yZXBsYWNlKCdAYnRjL3NoYXJlZC1jb3JlLycsICcnKX1gKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW3Jlc29sdmUtYnRjLWltcG9ydHNdIFx1ODlFM1x1Njc5MCAke2lkfSAoXHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU1MzA1ICR7aW1wb3J0ZXI/LnNwbGl0KCcvJykuc2xpY2UoLTIpLmpvaW4oJy8nKSB8fCAndW5rbm93bid9KSAtPiAke3NvdXJjZVBhdGguc3BsaXQoJy8nKS5zbGljZSgtMykuam9pbignLycpfWApO1xuICAgICAgICByZXR1cm4gc291cmNlUGF0aDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1OTA0XHU3NDA2IEBidGMvc2hhcmVkLXV0aWxzXG4gICAgICBpZiAoaWQgPT09ICdAYnRjL3NoYXJlZC11dGlscycgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy9zaGFyZWQtdXRpbHMvJykpIHtcbiAgICAgICAgY29uc3Qgc291cmNlUGF0aCA9IGlkID09PSAnQGJ0Yy9zaGFyZWQtdXRpbHMnXG4gICAgICAgICAgPyB3aXRoUGFja2FnZXMoJ3NoYXJlZC11dGlscy9zcmMvaW5kZXgudHMnKVxuICAgICAgICAgIDogd2l0aFBhY2thZ2VzKGBzaGFyZWQtdXRpbHMvc3JjLyR7aWQucmVwbGFjZSgnQGJ0Yy9zaGFyZWQtdXRpbHMvJywgJycpfWApO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5pbmZvKGBbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU4OUUzXHU2NzkwICR7aWR9IChcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDUgJHtpbXBvcnRlcj8uc3BsaXQoJy8nKS5zbGljZSgtMikuam9pbignLycpIHx8ICd1bmtub3duJ30pIC0+ICR7c291cmNlUGF0aC5zcGxpdCgnLycpLnNsaWNlKC0zKS5qb2luKCcvJyl9YCk7XG4gICAgICAgIHJldHVybiBzb3VyY2VQYXRoO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy9zaGFyZWQtcGx1Z2luc1xuICAgICAgaWYgKGlkID09PSAnQGJ0Yy9zaGFyZWQtcGx1Z2lucycgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy9zaGFyZWQtcGx1Z2lucy8nKSkge1xuICAgICAgICBjb25zdCBzb3VyY2VQYXRoID0gaWQgPT09ICdAYnRjL3NoYXJlZC1wbHVnaW5zJ1xuICAgICAgICAgID8gd2l0aFBhY2thZ2VzKCdzaGFyZWQtcGx1Z2lucy9zcmMvaW5kZXgudHMnKVxuICAgICAgICAgIDogd2l0aFBhY2thZ2VzKGBzaGFyZWQtcGx1Z2lucy9zcmMvJHtpZC5yZXBsYWNlKCdAYnRjL3NoYXJlZC1wbHVnaW5zLycsICcnKX1gKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW3Jlc29sdmUtYnRjLWltcG9ydHNdIFx1ODlFM1x1Njc5MCAke2lkfSAoXHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU1MzA1ICR7aW1wb3J0ZXI/LnNwbGl0KCcvJykuc2xpY2UoLTIpLmpvaW4oJy8nKSB8fCAndW5rbm93bid9KSAtPiAke3NvdXJjZVBhdGguc3BsaXQoJy8nKS5zbGljZSgtMykuam9pbignLycpfWApO1xuICAgICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihzb3VyY2VQYXRoKTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1OTA0XHU3NDA2IEBidGMvaTE4blxuICAgICAgaWYgKGlkID09PSAnQGJ0Yy9pMThuJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjL2kxOG4vJykpIHtcbiAgICAgICAgY29uc3Qgc291cmNlUGF0aCA9IGlkID09PSAnQGJ0Yy9pMThuJ1xuICAgICAgICAgID8gd2l0aFBhY2thZ2VzKCdpMThuL3NyYy9pbmRleC50cycpXG4gICAgICAgICAgOiB3aXRoUGFja2FnZXMoYGkxOG4vc3JjLyR7aWQucmVwbGFjZSgnQGJ0Yy9pMThuLycsICcnKX1gKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW3Jlc29sdmUtYnRjLWltcG9ydHNdIFx1ODlFM1x1Njc5MCAke2lkfSAoXHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU1MzA1ICR7aW1wb3J0ZXI/LnNwbGl0KCcvJykuc2xpY2UoLTIpLmpvaW4oJy8nKSB8fCAndW5rbm93bid9KSAtPiAke3NvdXJjZVBhdGguc3BsaXQoJy8nKS5zbGljZSgtMykuam9pbignLycpfWApO1xuICAgICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihzb3VyY2VQYXRoKTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1OTA0XHU3NDA2IEBidGMvYXV0aC1zaGFyZWRcbiAgICAgIGlmIChpZCA9PT0gJ0BidGMvYXV0aC1zaGFyZWQnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMvYXV0aC1zaGFyZWQvJykpIHtcbiAgICAgICAgbGV0IHNvdXJjZVBhdGg6IHN0cmluZztcbiAgICAgICAgaWYgKGlkID09PSAnQGJ0Yy9hdXRoLXNoYXJlZCcpIHtcbiAgICAgICAgICAvLyBAYnRjL2F1dGgtc2hhcmVkIFx1NkNBMVx1NjcwOVx1NjgzOSBpbmRleC50c1x1RkYwQ1x1NEY3Rlx1NzUyOCBjb21wb3NhYmxlcy9pbmRleC50cyBcdTRGNUNcdTRFM0FcdTUxNjVcdTUzRTNcbiAgICAgICAgICBzb3VyY2VQYXRoID0gd2l0aFJvb3QoJ2F1dGgvc2hhcmVkL2NvbXBvc2FibGVzL2luZGV4LnRzJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BidGMvYXV0aC1zaGFyZWQvJywgJycpO1xuICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1OERFRlx1NUY4NFx1NkNBMVx1NjcwOVx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwQ1x1NkRGQlx1NTJBMCAudHMgXHU2MjY5XHU1QzU1XHU1NDBEXG4gICAgICAgICAgc291cmNlUGF0aCA9IHdpdGhSb290KGBhdXRoL3NoYXJlZC8ke3N1YlBhdGh9JHtzdWJQYXRoLmluY2x1ZGVzKCcuJykgPyAnJyA6ICcudHMnfWApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmluZm8oYFtyZXNvbHZlLWJ0Yy1pbXBvcnRzXSBcdTg5RTNcdTY3OTAgJHtpZH0gKFx1Njc2NVx1ODFFQVx1NURGMlx1Njc4NFx1NUVGQVx1NTMwNSAke2ltcG9ydGVyPy5zcGxpdCgnLycpLnNsaWNlKC0yKS5qb2luKCcvJykgfHwgJ3Vua25vd24nfSkgLT4gJHtzb3VyY2VQYXRoLnNwbGl0KCcvJykuc2xpY2UoLTMpLmpvaW4oJy8nKX1gKTtcbiAgICAgICAgcmV0dXJuIHNvdXJjZVBhdGg7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTE3Nlx1NEVENiBAYnRjLyogXHU1MzA1XHVGRjBDXHU4RkQ0XHU1NkRFIG51bGwgXHU4QkE5XHU1MTc2XHU0RUQ2XHU2M0QyXHU0RUY2XHU1OTA0XHU3NDA2XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXHJlc29sdmUtYXV0aC1hbGlhc2VzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3Jlc29sdmUtYXV0aC1hbGlhc2VzLnRzXCI7LyoqXG4gKiBcdTg5RTNcdTY3OTAgYXV0aCBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODQgQCBcdTUyMkJcdTU0MERcdTYzRDJcdTRFRjZcbiAqIFx1NTkwNFx1NzQwNiBhdXRoIFx1NzZFRVx1NUY1NVx1NEUwQlx1NjU4N1x1NEVGNlx1NEY3Rlx1NzUyOFx1NzY4NCBAIFx1NTIyQlx1NTQwRFx1RkYwQ1x1NUMwNlx1NTE3Nlx1ODlFM1x1Njc5MFx1NEUzQVx1NjMwN1x1NTQxMVx1NUU5NFx1NzUyOFx1NzZFRVx1NUY1NVx1NzY4NFx1OERFRlx1NUY4NFxuICovXG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyBjcmVhdGVQYXRoSGVscGVycyB9IGZyb20gJy4uL3V0aWxzL3BhdGgtaGVscGVycyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzb2x2ZUF1dGhBbGlhc2VzT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBcdTVFOTRcdTc1MjhcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAgICovXG4gIGFwcERpcjogc3RyaW5nO1xuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4XHVGRjA4XHU5RUQ4XHU4QkE0XHVGRjFBdHJ1ZVx1RkYwOVxuICAgKi9cbiAgZW5hYmxlZD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogXHU3ODZFXHU0RkREXHU4REVGXHU1Rjg0XHU2NzA5XHU2QjYzXHU3ODZFXHU3Njg0XHU2MjY5XHU1QzU1XHU1NDBEXG4gKi9cbmZ1bmN0aW9uIGVuc3VyZUZpbGVFeHRlbnNpb24oZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIFx1NTk4Mlx1Njc5Q1x1OERFRlx1NUY4NFx1NURGMlx1N0VDRlx1NjcwOVx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwQ1x1NzZGNFx1NjNBNVx1OEZENFx1NTZERVxuICBpZiAoL1xcLih0c3x0c3h8anN8anN4fHZ1ZXxqc29ufGNzc3xzY3NzfHNhc3N8bGVzc3xwbmd8anBnfGpwZWd8Z2lmfHN2Z3x3ZWJwKSQvaS50ZXN0KGZpbGVQYXRoKSkge1xuICAgIHJldHVybiBmaWxlUGF0aDtcbiAgfVxuICBcbiAgLy8gXHU2MzA5XHU0RjE4XHU1MTQ4XHU3RUE3XHU1QzFEXHU4QkQ1XHU2REZCXHU1MkEwXHU2MjY5XHU1QzU1XHU1NDBEXHVGRjFBLnRzLCAudHN4LCAuanMsIC5qc3gsIC52dWVcbiAgY29uc3QgZXh0ZW5zaW9ucyA9IFsnLnRzJywgJy50c3gnLCAnLmpzJywgJy5qc3gnLCAnLnZ1ZSddO1xuICBmb3IgKGNvbnN0IGV4dCBvZiBleHRlbnNpb25zKSB7XG4gICAgY29uc3QgcGF0aFdpdGhFeHQgPSBgJHtmaWxlUGF0aH0ke2V4dH1gO1xuICAgIGlmIChleGlzdHNTeW5jKHBhdGhXaXRoRXh0KSkge1xuICAgICAgcmV0dXJuIHBhdGhXaXRoRXh0O1xuICAgIH1cbiAgfVxuICBcbiAgLy8gXHU1OTgyXHU2NzlDXHU2MjQwXHU2NzA5XHU2MjY5XHU1QzU1XHU1NDBEXHU5MEZEXHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU4RkQ0XHU1NkRFXHU1MzlGXHU4REVGXHU1Rjg0XHVGRjBDXHU4QkE5IFZpdGUgXHU3Njg0XHU2MjY5XHU1QzU1XHU1NDBEXHU4OUUzXHU2NzkwXHU2NzNBXHU1MjM2XHU1OTA0XHU3NDA2XG4gIHJldHVybiBmaWxlUGF0aDtcbn1cblxuLyoqXG4gKiBcdTg5RTNcdTY3OTAgYXV0aCBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODQgQCBcdTUyMkJcdTU0MERcdTYzRDJcdTRFRjZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVBdXRoQWxpYXNlc1BsdWdpbihvcHRpb25zOiBSZXNvbHZlQXV0aEFsaWFzZXNPcHRpb25zKTogUGx1Z2luIHtcbiAgY29uc3QgeyBhcHBEaXIsIGVuYWJsZWQgPSB0cnVlIH0gPSBvcHRpb25zO1xuXG4gIGlmICghZW5hYmxlZCkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAncmVzb2x2ZS1hdXRoLWFsaWFzZXMnLFxuICAgIH07XG4gIH1cblxuICBjb25zdCB7IHdpdGhTcmMgfSA9IGNyZWF0ZVBhdGhIZWxwZXJzKGFwcERpcik7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAncmVzb2x2ZS1hdXRoLWFsaWFzZXMnLFxuICAgIGVuZm9yY2U6ICdwcmUnLCAvLyBcdTU3MjhcdTUxNzZcdTRFRDZcdTg5RTNcdTY3OTBcdTYzRDJcdTRFRjZcdTRFNEJcdTUyNERcdTYyNjdcdTg4NENcbiAgICByZXNvbHZlSWQoaWQ6IHN0cmluZywgaW1wb3J0ZXI/OiBzdHJpbmcpIHtcbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NUJGQ1x1NTE2NVx1NjYyRlx1NTQyNlx1Njc2NVx1ODFFQSBhdXRoIFx1NzZFRVx1NUY1NVxuICAgICAgaWYgKCFpbXBvcnRlciB8fCAhaWQuc3RhcnRzV2l0aCgnQC8nKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaXNGcm9tQXV0aCA9IGltcG9ydGVyLmluY2x1ZGVzKCcvYXV0aC8nKSB8fCBpbXBvcnRlci5pbmNsdWRlcygnXFxcXGF1dGhcXFxcJyk7XG4gICAgICBpZiAoIWlzRnJvbUF1dGgpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NUMwNiBAL3h4eCBcdTg5RTNcdTY3OTBcdTRFM0EgYXBwcy97YXBwfS9zcmMveHh4XG4gICAgICBjb25zdCBwYXRoV2l0aG91dEFsaWFzID0gaWQucmVwbGFjZSgvXkBcXC8vLCAnJyk7XG4gICAgICBjb25zdCByZXNvbHZlZFBhdGggPSB3aXRoU3JjKGBzcmMvJHtwYXRoV2l0aG91dEFsaWFzfWApO1xuICAgICAgY29uc3QgZmluYWxQYXRoID0gZW5zdXJlRmlsZUV4dGVuc2lvbihyZXNvbHZlZFBhdGgpO1xuXG4gICAgICByZXR1cm4gZmluYWxQYXRoO1xuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxtYWluLWFwcFxcXFxzcmNcXFxcY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcbWFpbi1hcHBcXFxcc3JjXFxcXGNvbmZpZ1xcXFxwcm94eS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9hcHBzL21haW4tYXBwL3NyYy9jb25maWcvcHJveHkudHNcIjs7XG5pbXBvcnQgdHlwZSB7IEluY29taW5nTWVzc2FnZSwgU2VydmVyUmVzcG9uc2UgfSBmcm9tICdodHRwJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ0BidGMvc2hhcmVkLWNvcmUnO1xuXG4vLyBWaXRlIFx1NEVFM1x1NzQwNlx1OTE0RFx1N0Y2RVx1N0M3Qlx1NTc4QlxuaW50ZXJmYWNlIFByb3h5T3B0aW9ucyB7XG4gIHRhcmdldDogc3RyaW5nO1xuICBjaGFuZ2VPcmlnaW4/OiBib29sZWFuO1xuICBzZWN1cmU/OiBib29sZWFuO1xuICBzZWxmSGFuZGxlUmVzcG9uc2U/OiBib29sZWFuO1xuICBjb25maWd1cmU/OiAocHJveHk6IGFueSwgb3B0aW9uczogYW55KSA9PiB2b2lkO1xuICByZXdyaXRlPzogKHBhdGg6IHN0cmluZykgPT4gc3RyaW5nO1xufVxuXG4vLyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFRTNcdTc0MDZcdTc2RUVcdTY4MDdcdUZGMUFcdTRFQ0VcdTdFREZcdTRFMDBcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcdTgzQjdcdTUzRDZcbi8vIFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1RkYxQVZpdGUgXHU0RUUzXHU3NDA2IC9hcGkgXHU1MjMwXHU5MTREXHU3RjZFXHU3Njg0XHU1NDBFXHU3QUVGXHU1NzMwXHU1NzQwXG4vLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMUFcdTc1MzEgTmdpbnggXHU0RUUzXHU3NDA2XHVGRjBDXHU0RTBEXHU5NzAwXHU4OTgxIFZpdGUgXHU0RUUzXHU3NDA2XG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTVFRjZcdThGREZcdTVCRkNcdTUxNjUgZW52Q29uZmlnXHVGRjBDXHU5MDdGXHU1MTREXHU1NzI4IHZpdGUuY29uZmlnIFx1NEUyRFx1NUJGQ1x1NTE2NVx1NjVGNlx1NkEyMVx1NTc1N1x1NjcyQVx1Njc4NFx1NUVGQVx1NzY4NFx1OTVFRVx1OTg5OFxuZnVuY3Rpb24gZ2V0QmFja2VuZFRhcmdldCgpOiBzdHJpbmcge1xuICB0cnkge1xuICAgIC8vIFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NTcyOCB2aXRlLmNvbmZpZyBcdTUyQTBcdThGN0RcdTY1RjZcdTZBMjFcdTU3NTdcdTY3MkFcdTY3ODRcdTVFRkFcbiAgICBjb25zdCB7IGVudkNvbmZpZyB9ID0gcmVxdWlyZSgnQGJ0Yy9zaGFyZWQtY29yZS9jb25maWdzL3VuaWZpZWQtZW52LWNvbmZpZycpO1xuICAgIHJldHVybiBlbnZDb25maWc/LmFwaT8uYmFja2VuZFRhcmdldCB8fCAnaHR0cDovLzEwLjgwLjkuNzY6ODExNSc7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gXHU1OTgyXHU2NzlDXHU1QkZDXHU1MTY1XHU1OTMxXHU4RDI1XHVGRjBDXHU0RjdGXHU3NTI4XHU5RUQ4XHU4QkE0XHU1MDNDXG4gICAgcmV0dXJuICdodHRwOi8vMTAuODAuOS43Njo4MTE1JztcbiAgfVxufVxuXG5jb25zdCBiYWNrZW5kVGFyZ2V0ID0gZ2V0QmFja2VuZFRhcmdldCgpO1xuXG5jb25zdCBwcm94eTogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgUHJveHlPcHRpb25zPiA9IHtcbiAgJy9hcGknOiB7XG4gICAgdGFyZ2V0OiBiYWNrZW5kVGFyZ2V0LFxuICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICBzZWN1cmU6IGZhbHNlLFxuICAgIC8vIFx1NEUwRFx1NTE4RFx1NjZGRlx1NjM2Mlx1OERFRlx1NUY4NFx1RkYwQ1x1NzZGNFx1NjNBNVx1OEY2Q1x1NTNEMSAvYXBpIFx1NTIzMFx1NTQwRVx1N0FFRlx1RkYwOFx1NTQwRVx1N0FFRlx1NURGMlx1NjUzOVx1NEUzQVx1NEY3Rlx1NzUyOCAvYXBpXHVGRjA5XG4gICAgLy8gcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJy9hZG1pbicpIC8vIFx1NURGMlx1NzlGQlx1OTY2NFx1RkYxQVx1NTQwRVx1N0FFRlx1NURGMlx1NjUzOVx1NEUzQVx1NEY3Rlx1NzUyOCAvYXBpXG4gICAgLy8gXHU1NDJGXHU3NTI4XHU2MjRCXHU1MkE4XHU1OTA0XHU3NDA2XHU1NENEXHU1RTk0XHVGRjBDXHU0RUU1XHU0RkJGXHU0RkVFXHU2NTM5XHU1NENEXHU1RTk0XHU0RjUzXG4gICAgc2VsZkhhbmRsZVJlc3BvbnNlOiB0cnVlLFxuICAgIC8vIFx1NTkwNFx1NzQwNlx1NTRDRFx1NUU5NFx1NTkzNFx1RkYwQ1x1NkRGQlx1NTJBMCBDT1JTIFx1NTkzNFxuICAgIGNvbmZpZ3VyZTogKHByb3h5OiBhbnkpID0+IHtcbiAgICAgIHByb3h5Lm9uKCdwcm94eVJlcycsIChwcm94eVJlczogSW5jb21pbmdNZXNzYWdlLCByZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW4gfHwgJyonO1xuICAgICAgICBjb25zdCBpc0xvZ2luUmVxdWVzdCA9IHJlcS51cmw/LmluY2x1ZGVzKCcvbG9naW4nKTtcbiAgICAgICAgbGV0IGV4dHJhY3RlZFRva2VuOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBpZiAocHJveHlSZXMuaGVhZGVycykge1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiddID0gb3JpZ2luIGFzIHN0cmluZztcbiAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscyddID0gJ3RydWUnO1xuICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnXSA9ICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUyc7XG4gICAgICAgICAgY29uc3QgcmVxdWVzdEhlYWRlcnMgPSByZXEuaGVhZGVyc1snYWNjZXNzLWNvbnRyb2wtcmVxdWVzdC1oZWFkZXJzJ10gfHwgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJztcbiAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJ10gPSByZXF1ZXN0SGVhZGVycyBhcyBzdHJpbmc7XG5cbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MEQgU2V0LUNvb2tpZSBcdTU0Q0RcdTVFOTRcdTU5MzRcdUZGMENcdTc4NkVcdTRGRERcdThERThcdTU3REZcdThCRjdcdTZDNDJcdTY1RjYgY29va2llIFx1ODBGRFx1NTkxRlx1NkI2M1x1Nzg2RVx1OEJCRVx1N0Y2RVxuICAgICAgICAgIC8vIFx1NTcyOFx1OTg4NFx1ODlDOFx1NkEyMVx1NUYwRlx1NEUwQlx1RkYwOFx1NEUwRFx1NTQwQ1x1N0FFRlx1NTNFM1x1RkYwOVx1RkYwQ1x1OTcwMFx1ODk4MVx1OEJCRVx1N0Y2RSBTYW1lU2l0ZT1Ob25lOyBTZWN1cmVcbiAgICAgICAgICBjb25zdCBzZXRDb29raWVIZWFkZXIgPSBwcm94eVJlcy5oZWFkZXJzWydzZXQtY29va2llJ107XG5cbiAgICAgICAgICBpZiAoc2V0Q29va2llSGVhZGVyKSB7XG4gICAgICAgICAgICBjb25zdCBjb29raWVzID0gQXJyYXkuaXNBcnJheShzZXRDb29raWVIZWFkZXIpID8gc2V0Q29va2llSGVhZGVyIDogW3NldENvb2tpZUhlYWRlcl07XG5cbiAgICAgICAgICAgIGNvbnN0IGZpeGVkQ29va2llcyA9IGNvb2tpZXMubWFwKChjb29raWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAvLyBcdTYzRDBcdTUzRDYgYWNjZXNzX3Rva2VuIFx1NzY4NFx1NTAzQ1x1RkYwOFx1NzUyOFx1NEU4RVx1NkRGQlx1NTJBMFx1NTIzMFx1NTRDRFx1NUU5NFx1NEY1M1x1RkYwOVxuICAgICAgICAgICAgICBpZiAoY29va2llLmluY2x1ZGVzKCdhY2Nlc3NfdG9rZW49JykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b2tlbk1hdGNoID0gY29va2llLm1hdGNoKC9hY2Nlc3NfdG9rZW49KFteO10rKS8pO1xuICAgICAgICAgICAgICAgIGlmICh0b2tlbk1hdGNoICYmIHRva2VuTWF0Y2hbMV0pIHtcbiAgICAgICAgICAgICAgICAgIGV4dHJhY3RlZFRva2VuID0gdG9rZW5NYXRjaFsxXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBsZXQgZml4ZWRDb29raWUgPSBjb29raWU7XG5cbiAgICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3OUZCXHU5NjY0IERvbWFpbiBcdThCQkVcdTdGNkVcdUZGMENcdTdBMERcdTU0MEVcdTRGMUFcdTY4MzlcdTYzNkVcdTczQUZcdTU4ODNcdTkxQ0RcdTY1QjBcdThCQkVcdTdGNkVcbiAgICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1NDBFXHU3QUVGXHU4QkJFXHU3RjZFXHU0RTg2IERvbWFpbj0xMC44MC44LjE5OSBcdTYyMTZcdTUxNzZcdTRFRDZcdTUwM0NcdUZGMENcdTRGMUFcdTVCRkNcdTgxRjQgSmF2YVNjcmlwdCBcdTY1RTBcdTZDRDVcdThCRkJcdTUzRDZcbiAgICAgICAgICAgICAgZml4ZWRDb29raWUgPSBmaXhlZENvb2tpZS5yZXBsYWNlKC87XFxzKkRvbWFpbj1bXjtdKy9naSwgJycpO1xuXG4gICAgICAgICAgICAgIC8vIFx1Nzg2RVx1NEZERCBQYXRoPS9cdUZGMENcdThCQTkgY29va2llIFx1NTcyOFx1NjU3NFx1NEUyQVx1NTdERlx1NTQwRFx1NEUwQlx1NTNFRlx1NzUyOFxuICAgICAgICAgICAgICBpZiAoIWZpeGVkQ29va2llLmluY2x1ZGVzKCdQYXRoPScpKSB7XG4gICAgICAgICAgICAgICAgZml4ZWRDb29raWUgKz0gJzsgUGF0aD0vJztcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTVERjJcdTY3MDkgUGF0aFx1RkYwQ1x1Nzg2RVx1NEZERFx1NjYyRiAvXG4gICAgICAgICAgICAgICAgZml4ZWRDb29raWUgPSBmaXhlZENvb2tpZS5yZXBsYWNlKC87XFxzKlBhdGg9W147XSsvZ2ksICc7IFBhdGg9LycpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gXHU0RkVFXHU1OTBEIFNhbWVTaXRlIFx1OEJCRVx1N0Y2RVxuICAgICAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdTUzM0FcdTUyMkJcdUZGMUFcbiAgICAgICAgICAgICAgLy8gLSBsb2NhbGhvc3Q6IFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NUMwNlx1NEUwRFx1NTQwQ1x1N0FFRlx1NTNFM1x1ODlDNlx1NEUzQVx1NTQwQ1x1NEUwMFx1N0FEOVx1NzBCOVx1RkYwQ1NhbWVTaXRlPUxheCBcdTUzRUZcdTgwRkRcdTUxNDFcdThCQjhcdThERThcdTdBRUZcdTUzRTMgY29va2llXG4gICAgICAgICAgICAgIC8vIC0gSVAgXHU1NzMwXHU1NzQwXHVGRjA4XHU1OTgyIDEwLjgwLjguMTk5XHVGRjA5OiBcdTZENEZcdTg5QzhcdTU2NjhcdTVDMDZcdTRFMERcdTU0MENcdTdBRUZcdTUzRTNcdTg5QzZcdTRFM0FcdTRFMERcdTU0MENcdTdBRDlcdTcwQjlcdUZGMENTYW1lU2l0ZT1MYXggXHU0RTBEXHU1MTQxXHU4QkI4XHU4REU4XHU3QUQ5XHU3MEI5IGNvb2tpZVxuICAgICAgICAgICAgICAvLyBcdTYyNDBcdTRFRTVcdTU3MjggSVAgXHU1NzMwXHU1NzQwXHU3M0FGXHU1ODgzXHU0RTBCXHVGRjBDXHU1MzczXHU0RjdGXHU0RjdGXHU3NTI4IFNhbWVTaXRlPUxheFx1RkYwQ1x1OERFOFx1N0FFRlx1NTNFMyBjb29raWUgXHU0RTVGXHU1M0VGXHU4MEZEXHU1OTMxXHU4RDI1XG4gICAgICAgICAgICAgIGNvbnN0IGZvcndhcmRlZFByb3RvID0gcmVxLmhlYWRlcnNbJ3gtZm9yd2FyZGVkLXByb3RvJ107XG4gICAgICAgICAgICAgIGNvbnN0IGlzSHR0cHMgPSBmb3J3YXJkZWRQcm90byA9PT0gJ2h0dHBzJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocmVxIGFzIGFueSkuc29ja2V0Py5lbmNyeXB0ZWQgPT09IHRydWUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHJlcSBhcyBhbnkpLmNvbm5lY3Rpb24/LmVuY3J5cHRlZCA9PT0gdHJ1ZTtcblxuICAgICAgICAgICAgICAvLyBcdTY4QzBcdTZENEJcdTY2MkZcdTU0MjZcdTY2MkYgbG9jYWxob3N0XHVGRjA4XHU1RjAwXHU1M0QxXHU2NzBEXHU1MkExXHU1NjY4XHVGRjA5XHU4RkQ4XHU2NjJGIElQIFx1NTczMFx1NTc0MFx1RkYwOFx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1RkYwOVxuICAgICAgICAgICAgICBjb25zdCBob3N0ID0gcmVxLmhlYWRlcnMuaG9zdCB8fCAnJztcbiAgICAgICAgICAgICAgY29uc3QgaXNMb2NhbGhvc3QgPSBob3N0LmluY2x1ZGVzKCdsb2NhbGhvc3QnKSB8fCBob3N0LmluY2x1ZGVzKCcxMjcuMC4wLjEnKTtcbiAgICAgICAgICAgICAgY29uc3QgaG9zdFBhcnQgPSBob3N0LnNwbGl0KCc6JylbMF07XG4gICAgICAgICAgICAgIGNvbnN0IGlzSXBBZGRyZXNzID0gaG9zdFBhcnQgPyAvXlxcZCtcXC5cXGQrXFwuXFxkK1xcLlxcZCsvLnRlc3QoaG9zdFBhcnQpIDogZmFsc2U7XG5cbiAgICAgICAgICAgICAgLy8gXHU2OEMwXHU2RDRCXHU2NjJGXHU1NDI2XHU2NjJGXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjA4YmVsbGlzLmNvbS5jbiBcdTU3REZcdTU0MERcdUZGMDlcbiAgICAgICAgICAgICAgY29uc3QgaXNQcm9kdWN0aW9uID0gaG9zdC5pbmNsdWRlcygnYmVsbGlzLmNvbS5jbicpO1xuXG4gICAgICAgICAgICAgIC8vIFx1NzlGQlx1OTY2NFx1NzNCMFx1NjcwOVx1NzY4NCBTYW1lU2l0ZSBcdThCQkVcdTdGNkVcbiAgICAgICAgICAgICAgZml4ZWRDb29raWUgPSBmaXhlZENvb2tpZS5yZXBsYWNlKC87XFxzKlNhbWVTaXRlPShTdHJpY3R8TGF4fE5vbmUpL2dpLCAnJyk7XG5cbiAgICAgICAgICAgICAgaWYgKGlzSHR0cHMpIHtcbiAgICAgICAgICAgICAgICAvLyBIVFRQUyBcdTczQUZcdTU4ODNcdTRFMEJcdUZGMUFcdTRGN0ZcdTc1MjggU2FtZVNpdGU9Tm9uZTsgU2VjdXJlXHVGRjA4XHU2NTJGXHU2MzAxXHU4REU4XHU1N0RGXHVGRjA5XG4gICAgICAgICAgICAgICAgZml4ZWRDb29raWUgKz0gJzsgU2FtZVNpdGU9Tm9uZTsgU2VjdXJlJztcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc0xvY2FsaG9zdCkge1xuICAgICAgICAgICAgICAgIC8vIGxvY2FsaG9zdCArIEhUVFBcdUZGMUFcdTRFMERcdThCQkVcdTdGNkUgU2FtZVNpdGVcdUZGMDhcdThCQTlcdTZENEZcdTg5QzhcdTU2NjhcdTRGN0ZcdTc1MjhcdTlFRDhcdThCQTRcdTUwM0NcdUZGMENcdTkwMUFcdTVFMzhcdTY2MkYgTGF4XHVGRjA5XG4gICAgICAgICAgICAgICAgLy8gbG9jYWxob3N0IFx1NEUwQVx1RkYwQ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NUJGOVx1OERFOFx1N0FFRlx1NTNFMyBjb29raWUgXHU2NkY0XHU1QkJEXHU2NzdFXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNJcEFkZHJlc3MpIHtcbiAgICAgICAgICAgICAgICAvLyBJUCBcdTU3MzBcdTU3NDAgKyBIVFRQXHVGRjFBXHU0RTBEXHU4QkJFXHU3RjZFIFNhbWVTaXRlXHVGRjBDXHU4QkE5XHU2RDRGXHU4OUM4XHU1NjY4XHU0RjdGXHU3NTI4XHU5RUQ4XHU4QkE0XHU1MDNDXHVGRjA4XHU0RTBFXHU1RjAwXHU1M0QxXHU2NzBEXHU1MkExXHU1NjY4XHU0RTAwXHU4MUY0XHVGRjA5XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU2MEM1XHU1MUI1XHVGRjFBXHU0RTBEXHU4QkJFXHU3RjZFIFNhbWVTaXRlXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBcdTc4NkVcdTRGREQgSHR0cE9ubHkgXHU4OEFCXHU3OUZCXHU5NjY0XHVGRjA4XHU1OTgyXHU2NzlDXHU1NDBFXHU3QUVGXHU4QkJFXHU3RjZFXHU0RTg2IEh0dHBPbmx5PWZhbHNlXHVGRjBDXHU0RjQ2XHU1M0VGXHU4MEZEXHU4RkQ4XHU2NzA5XHU1MTc2XHU0RUQ2XHU4QkJFXHU3RjZFXHVGRjA5XG4gICAgICAgICAgICAgIGlmIChmaXhlZENvb2tpZS5pbmNsdWRlcygnSHR0cE9ubHknKSAmJiAhY29va2llLmluY2x1ZGVzKCdIdHRwT25seT1mYWxzZScpKSB7XG4gICAgICAgICAgICAgICAgZml4ZWRDb29raWUgPSBmaXhlZENvb2tpZS5yZXBsYWNlKC87XFxzKkh0dHBPbmx5L2dpLCAnJyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBcdTc4NkVcdTRGREQgU2VjdXJlIFx1ODhBQlx1NzlGQlx1OTY2NFx1RkYwOFx1NTcyOCBIVFRQIFx1NzNBRlx1NTg4M1x1NEUwQlx1RkYwOVxuICAgICAgICAgICAgICBpZiAoIWlzSHR0cHMgJiYgZml4ZWRDb29raWUuaW5jbHVkZXMoJ1NlY3VyZScpKSB7XG4gICAgICAgICAgICAgICAgZml4ZWRDb29raWUgPSBmaXhlZENvb2tpZS5yZXBsYWNlKC87XFxzKlNlY3VyZS9naSwgJycpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjFBXHU4QkJFXHU3RjZFIGRvbWFpbiBcdTRFM0EgLmJlbGxpcy5jb20uY24gXHU0RUU1XHU2NTJGXHU2MzAxXHU4REU4XHU1QjUwXHU1N0RGXHU1NDBEXHU1MTcxXHU0RUFCXG4gICAgICAgICAgICAgIGlmIChpc1Byb2R1Y3Rpb24pIHtcbiAgICAgICAgICAgICAgICBmaXhlZENvb2tpZSArPSAnOyBEb21haW49LmJlbGxpcy5jb20uY24nO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIFx1NTE3Nlx1NEVENlx1NzNBRlx1NTg4M1x1RkYxQVx1NEUwRFx1OEJCRVx1N0Y2RSBkb21haW5cdUZGMENjb29raWUgXHU1M0VBXHU1NzI4XHU1RjUzXHU1MjREXHU1N0RGXHU1NDBEXHU0RTBCXHU2NzA5XHU2NTQ4XG5cbiAgICAgICAgICAgICAgcmV0dXJuIGZpeGVkQ29va2llO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydzZXQtY29va2llJ10gPSBmaXhlZENvb2tpZXM7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1OTgyXHU2NzlDXHU2NjJGXHU3NjdCXHU1RjU1XHU2M0E1XHU1M0UzXHU3Njg0XHU1NENEXHU1RTk0XHVGRjBDXHU0RTE0XHU1NENEXHU1RTk0XHU0RjUzXHU0RTJEXHU2Q0ExXHU2NzA5IHRva2VuXHVGRjBDXHU1MjE5XHU0RUNFIFNldC1Db29raWUgXHU0RTJEXHU2M0QwXHU1M0Q2XHU1RTc2XHU2REZCXHU1MkEwXHU1MjMwXHU1NENEXHU1RTk0XHU0RjUzXG4gICAgICAgICAgLy8gXHU4RkQ5XHU2ODM3XHU1MjREXHU3QUVGXHU1QzMxXHU1M0VGXHU0RUU1XHU0RUNFXHU1NENEXHU1RTk0XHU0RjUzXHU0RTJEXHU4M0I3XHU1M0Q2IHRva2VuXHVGRjBDXHU1MzczXHU0RjdGIGNvb2tpZSBcdTY2MkYgSHR0cE9ubHkgXHU3Njg0XG4gICAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU0RjdGXHU3NTI4IHNlbGZIYW5kbGVSZXNwb25zZTogdHJ1ZSBcdTY1RjZcdUZGMENcdTk3MDBcdTg5ODFcdTYyNEJcdTUyQThcdTU5MDRcdTc0MDZcdTYyNDBcdTY3MDlcdTU0Q0RcdTVFOTRcbiAgICAgICAgICBjb25zdCBjaHVua3M6IEJ1ZmZlcltdID0gW107XG5cbiAgICAgICAgICBwcm94eVJlcy5vbignZGF0YScsIChjaHVuazogQnVmZmVyKSA9PiB7XG4gICAgICAgICAgICBjaHVua3MucHVzaChjaHVuayk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBwcm94eVJlcy5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzTG9naW5SZXF1ZXN0ICYmIGV4dHJhY3RlZFRva2VuKSB7XG4gICAgICAgICAgICAgIC8vIFx1NEZERFx1NUI1OFx1NTM5Rlx1NTlDQlx1NTRDRFx1NUU5NFx1NTkzNFxuICAgICAgICAgICAgICBjb25zdCBvcmlnaW5hbEhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkPiA9IHt9O1xuICAgICAgICAgICAgICBPYmplY3Qua2V5cyhwcm94eVJlcy5oZWFkZXJzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG93ZXJLZXkgPSBrZXkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBpZiAobG93ZXJLZXkgIT09ICdjb250ZW50LWxlbmd0aCcpIHtcbiAgICAgICAgICAgICAgICAgIG9yaWdpbmFsSGVhZGVyc1trZXldID0gcHJveHlSZXMuaGVhZGVyc1trZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBib2R5ID0gQnVmZmVyLmNvbmNhdChjaHVua3MpLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3BvbnNlRGF0YTogYW55O1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIHJlc3BvbnNlRGF0YSA9IEpTT04ucGFyc2UoYm9keSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTRFMERcdTY2MkYgSlNPTlx1RkYwQ1x1NzZGNFx1NjNBNVx1OEZENFx1NTZERVx1NTM5Rlx1NTlDQlx1NTRDRFx1NUU5NFxuICAgICAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZChwcm94eVJlcy5zdGF0dXNDb2RlIHx8IDIwMCwgb3JpZ2luYWxIZWFkZXJzKTtcbiAgICAgICAgICAgICAgICAgIHJlcy5lbmQoYm9keSk7XG4gICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1NENEXHU1RTk0XHU0RjUzXHU0RTJEXHU2Q0ExXHU2NzA5IHRva2VuXHVGRjBDXHU2REZCXHU1MkEwXHU0RUNFIGNvb2tpZSBcdTRFMkRcdTYzRDBcdTUzRDZcdTc2ODQgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlRGF0YS50b2tlbiAmJiAhcmVzcG9uc2VEYXRhLmFjY2Vzc1Rva2VuICYmIGV4dHJhY3RlZFRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZURhdGEudG9rZW4gPSBleHRyYWN0ZWRUb2tlbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlRGF0YS5hY2Nlc3NUb2tlbiA9IGV4dHJhY3RlZFRva2VuO1xuICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFx1OTFDRFx1NjVCMFx1OEJCRVx1N0Y2RSBDb250ZW50LUxlbmd0aFxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0JvZHkgPSBKU09OLnN0cmluZ2lmeShyZXNwb25zZURhdGEpO1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsSGVhZGVyc1snY29udGVudC1sZW5ndGgnXSA9IEJ1ZmZlci5ieXRlTGVuZ3RoKG5ld0JvZHkpLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBcdTUzRDFcdTkwMDFcdTRGRUVcdTY1MzlcdTU0MEVcdTc2ODRcdTU0Q0RcdTVFOTRcbiAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKHByb3h5UmVzLnN0YXR1c0NvZGUgfHwgMjAwLCBvcmlnaW5hbEhlYWRlcnMpO1xuICAgICAgICAgICAgICAgIHJlcy5lbmQobmV3Qm9keSk7XG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdbUHJveHldIFx1MjcxNyBcdTU5MDRcdTc0MDZcdTc2N0JcdTVGNTVcdTU0Q0RcdTVFOTRcdTY1RjZcdTUxRkFcdTk1MTk6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQocHJveHlSZXMuc3RhdHVzQ29kZSB8fCAyMDAsIHByb3h5UmVzLmhlYWRlcnMpO1xuICAgICAgICAgICAgICAgIHJlcy5lbmQoQnVmZmVyLmNvbmNhdChjaHVua3MpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gXHU5NzVFXHU3NjdCXHU1RjU1XHU4QkY3XHU2QzQyXHU2MjE2XHU2Q0ExXHU2NzA5IHRva2VuIFx1NjVGNlx1RkYwQ1x1NkI2M1x1NUUzOFx1OEY2Q1x1NTNEMVx1NTRDRFx1NUU5NFxuICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKHByb3h5UmVzLnN0YXR1c0NvZGUgfHwgMjAwLCBwcm94eVJlcy5oZWFkZXJzKTtcbiAgICAgICAgICAgICAgcmVzLmVuZChCdWZmZXIuY29uY2F0KGNodW5rcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcHJveHlSZXMub24oJ2Vycm9yJywgKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignW1Byb3h5XSBcdTI3MTcgXHU4QkZCXHU1M0Q2XHU1NENEXHU1RTk0XHU2RDQxXHU2NUY2XHU1MUZBXHU5NTE5OicsIGVycik7XG4gICAgICAgICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMCwge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IG9yaWdpbiBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdcdTRFRTNcdTc0MDZcdTU5MDRcdTc0MDZcdTU0Q0RcdTVFOTRcdTY1RjZcdTUxRkFcdTk1MTknIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIFx1NTkwNFx1NzQwNlx1OTUxOVx1OEJFRlxuICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVycjogRXJyb3IsIHJlcTogSW5jb21pbmdNZXNzYWdlLCByZXM6IFNlcnZlclJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGxvZ2dlci5lcnJvcignW1Byb3h5XSBFcnJvcjonLCBlcnIubWVzc2FnZSk7XG4gICAgICAgIGxvZ2dlci5lcnJvcignW1Byb3h5XSBSZXF1ZXN0IFVSTDonLCByZXEudXJsKTtcbiAgICAgICAgbG9nZ2VyLmVycm9yKCdbUHJveHldIFRhcmdldDonLCBiYWNrZW5kVGFyZ2V0KTtcbiAgICAgICAgaWYgKHJlcyAmJiAhcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDAsIHtcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogcmVxLmhlYWRlcnMub3JpZ2luIHx8ICcqJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIGNvZGU6IDUwMCxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGBcdTRFRTNcdTc0MDZcdTk1MTlcdThCRUZcdUZGMUFcdTY1RTBcdTZDRDVcdThGREVcdTYzQTVcdTUyMzBcdTU0MEVcdTdBRUZcdTY3MERcdTUyQTFcdTU2NjggJHtiYWNrZW5kVGFyZ2V0fWAsXG4gICAgICAgICAgICBlcnJvcjogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICB9LFxuICAvLyBcdTRFRTNcdTc0MDYgaG9tZS1hcHAgXHU1MjMwXHU1RjAwXHU1M0QxXHU2NzBEXHU1MkExXHU1NjY4XHVGRjA4VnVlIFNQQVx1RkYwOVxuICAnL2hvbWUnOiB7XG4gICAgdGFyZ2V0OiAnaHR0cDovLzEwLjgwLjguMTk5OjgwOTUnLFxuICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICBzZWN1cmU6IGZhbHNlLFxuICAgIHJld3JpdGU6IChwYXRoOiBzdHJpbmcpID0+IHBhdGgucmVwbGFjZSgvXlxcL2hvbWUvLCAnJyksXG4gIH0sXG59O1xuXG5leHBvcnQgeyBwcm94eSB9O1xuXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7OztBQUFp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QSxJQUNULFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsRUFDWjtBQUNGO0FBS0EsSUFBTSxzQkFBc0M7QUFBQSxFQUMxQztBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEs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QUEsRUFDRixDQUFDO0FBS0QsTUFBSSxZQUFZLFNBQVM7QUFFdkIsV0FBTztBQUFBLEVBQ1QsT0FBTztBQUVMLFVBQU0saUJBQWlCLFFBQVEsSUFBSSxpQkFBaUI7QUFDcEQsUUFBSSxDQUFDLGdCQUFnQjtBQUNuQixhQUFPO0FBQUEsUUFDTCxHQUFHO0FBQUEsUUFDSCxXQUFXO0FBQUE7QUFBQSxNQUNiO0FBQUEsSUFDRjtBQUNBLFdBQU87QUFBQSxFQUNUO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsiZmlsZVVSTFRvUGF0aCIsICJyZXNvbHZlIiwgImV4aXN0c1N5bmMiLCAicmVhZEZpbGVTeW5jIiwgImFwcERpciIsICJyZXNvbHZlIiwgImFwcERpciIsICJyZXNvbHZlIiwgInJlc29sdmUiLCAiYXBwRGlyIiwgInJlc29sdmUiLCAicmVzb2x2ZSIsICJleGlzdHNTeW5jIiwgImFwcERpciIsICJyZXNvbHZlIiwgImV4aXN0c1N5bmMiLCAiZXhpc3RzU3luYyIsICJleGlzdHNTeW5jIiwgImZpbGVOYW1lIiwgIm9yaWdpbiIsICJleGlzdHNTeW5jIiwgInJlYWRGaWxlU3luYyIsICJyZXNvbHZlIiwgImRpcm5hbWUiLCAiZmlsZVVSTFRvUGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgIl9fZmlsZW5hbWUiLCAiZmlsZVVSTFRvUGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgIl9fZGlybmFtZSIsICJkaXJuYW1lIiwgInJlc29sdmUiLCAiZXhpc3RzU3luYyIsICJ0aW1lc3RhbXAiLCAicmVhZEZpbGVTeW5jIiwgInJlc29sdmUiLCAiZXhpc3RzU3luYyIsICJyZWFkRmlsZVN5bmMiLCAid3JpdGVGaWxlU3luYyIsICJhcHBEaXIiLCAicmVzb2x2ZSIsICJleGlzdHNTeW5jIiwgInJlYWRGaWxlU3luYyIsICJ3cml0ZUZpbGVTeW5jIiwgInJlc29sdmUiLCAiZmlsZVVSTFRvUGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgIl9fZmlsZW5hbWUiLCAiZmlsZVVSTFRvUGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgIl9fZGlybmFtZSIsICJyZXNvbHZlIiwgInJlYWRGaWxlU3luYyIsICJleGlzdHNTeW5jIiwgInJlYWRkaXJTeW5jIiwgInN0YXRTeW5jIiwgIm1rZGlyU3luYyIsICJ3cml0ZUZpbGVTeW5jIiwgImpvaW4iLCAicmVzb2x2ZSIsICJleHRuYW1lIiwgImFwcERpciIsICJyZXNvbHZlIiwgImpvaW4iLCAiZXhpc3RzU3luYyIsICJyZWFkRmlsZVN5bmMiLCAibWtkaXJTeW5jIiwgInJlYWRkaXJTeW5jIiwgImV4dG5hbWUiLCAic3RhdFN5bmMiLCAid3JpdGVGaWxlU3luYyIsICJyZXNvbHZlIiwgImZpbGVVUkxUb1BhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCIsICJfX2ZpbGVuYW1lIiwgImZpbGVVUkxUb1BhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCIsICJfX2Rpcm5hbWUiLCAicmVzb2x2ZSIsICJwcm9qZWN0Um9vdCIsICJpc1ByZXZpZXdCdWlsZCIsICJleGlzdHNTeW5jIiwgImFwcERpciIsICJlbnN1cmVGaWxlRXh0ZW5zaW9uIiwgImV4aXN0c1N5bmMiLCAid2l0aFBhY2thZ2VzIiwgImV4aXN0c1N5bmMiLCAiZXhpc3RzU3luYyIsICJhcHBEaXIiLCAiYXBwRGlyIiwgInByb3h5IiwgInJlc29sdmUiLCAiZXhpc3RzU3luYyIsICJyZWFkRmlsZVN5bmMiLCAicHJveHkiLCAiaXNQcm9kdWN0aW9uIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiZmlsZVVSTFRvUGF0aCJdCn0K
