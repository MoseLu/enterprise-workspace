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
  pocHost: "poc.bellis.com.cn",
  sitHost: "sit.bellis.com.cn",
  testHost: "test.bellis.com.cn",
  uatHost: "uat.bellis.com.cn",
  prodHost: "bellis.com.cn"
};
var BUSINESS_APP_CONFIGS = [
  {
    appName: "admin-app",
    devHost: "10.80.8.199",
    devPort: "8081",
    preHost: "localhost",
    prePort: "4181",
    pocHost: "admin.poc.bellis.com.cn",
    sitHost: "admin.sit.bellis.com.cn",
    testHost: "admin.test.bellis.com.cn",
    uatHost: "admin.uat.bellis.com.cn",
    prodHost: "admin.bellis.com.cn"
  },
  {
    appName: "dashboard-app",
    devHost: "10.80.8.199",
    devPort: "8082",
    preHost: "localhost",
    prePort: "4182",
    pocHost: "dashboard.poc.bellis.com.cn",
    sitHost: "dashboard.sit.bellis.com.cn",
    testHost: "dashboard.test.bellis.com.cn",
    uatHost: "dashboard.uat.bellis.com.cn",
    prodHost: "dashboard.bellis.com.cn"
  },
  {
    appName: "engineering-app",
    devHost: "10.80.8.199",
    devPort: "8083",
    preHost: "localhost",
    prePort: "4183",
    pocHost: "engineering.poc.bellis.com.cn",
    sitHost: "engineering.sit.bellis.com.cn",
    testHost: "engineering.test.bellis.com.cn",
    uatHost: "engineering.uat.bellis.com.cn",
    prodHost: "engineering.bellis.com.cn"
  },
  {
    appName: "finance-app",
    devHost: "10.80.8.199",
    devPort: "8084",
    preHost: "localhost",
    prePort: "4184",
    pocHost: "finance.poc.bellis.com.cn",
    sitHost: "finance.sit.bellis.com.cn",
    testHost: "finance.test.bellis.com.cn",
    uatHost: "finance.uat.bellis.com.cn",
    prodHost: "finance.bellis.com.cn"
  },
  {
    appName: "logistics-app",
    devHost: "10.80.8.199",
    devPort: "8086",
    preHost: "localhost",
    prePort: "4186",
    pocHost: "logistics.poc.bellis.com.cn",
    sitHost: "logistics.sit.bellis.com.cn",
    testHost: "logistics.test.bellis.com.cn",
    uatHost: "logistics.uat.bellis.com.cn",
    prodHost: "logistics.bellis.com.cn"
  },
  {
    appName: "operations-app",
    devHost: "10.80.8.199",
    devPort: "8088",
    preHost: "localhost",
    prePort: "4188",
    pocHost: "operations.poc.bellis.com.cn",
    sitHost: "operations.sit.bellis.com.cn",
    testHost: "operations.test.bellis.com.cn",
    uatHost: "operations.uat.bellis.com.cn",
    prodHost: "operations.bellis.com.cn"
  },
  {
    appName: "personnel-app",
    devHost: "10.80.8.199",
    devPort: "8089",
    preHost: "localhost",
    prePort: "4189",
    pocHost: "personnel.poc.bellis.com.cn",
    sitHost: "personnel.sit.bellis.com.cn",
    testHost: "personnel.test.bellis.com.cn",
    uatHost: "personnel.uat.bellis.com.cn",
    prodHost: "personnel.bellis.com.cn"
  },
  {
    appName: "production-app",
    devHost: "10.80.8.199",
    devPort: "8096",
    preHost: "localhost",
    prePort: "4190",
    pocHost: "production.poc.bellis.com.cn",
    sitHost: "production.sit.bellis.com.cn",
    testHost: "production.test.bellis.com.cn",
    uatHost: "production.uat.bellis.com.cn",
    prodHost: "production.bellis.com.cn"
  },
  {
    appName: "quality-app",
    devHost: "10.80.8.199",
    devPort: "8091",
    preHost: "localhost",
    prePort: "4191",
    pocHost: "quality.poc.bellis.com.cn",
    sitHost: "quality.sit.bellis.com.cn",
    testHost: "quality.test.bellis.com.cn",
    uatHost: "quality.uat.bellis.com.cn",
    prodHost: "quality.bellis.com.cn"
  },
  {
    appName: "system-app",
    devHost: "10.80.8.199",
    devPort: "8092",
    preHost: "localhost",
    prePort: "4192",
    pocHost: "system.poc.bellis.com.cn",
    sitHost: "system.sit.bellis.com.cn",
    testHost: "system.test.bellis.com.cn",
    uatHost: "system.uat.bellis.com.cn",
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
    pocHost: "docs.poc.bellis.com.cn",
    sitHost: "docs.sit.bellis.com.cn",
    testHost: "docs.test.bellis.com.cn",
    uatHost: "docs.uat.bellis.com.cn",
    prodHost: "docs.bellis.com.cn"
  },
  {
    appName: "home-app",
    devHost: "10.80.8.199",
    devPort: "8085",
    preHost: "localhost",
    prePort: "4185",
    pocHost: "www.poc.bellis.com.cn",
    sitHost: "www.sit.bellis.com.cn",
    testHost: "www.test.bellis.com.cn",
    uatHost: "www.uat.bellis.com.cn",
    prodHost: "www.bellis.com.cn"
  },
  {
    appName: "layout-app",
    devHost: "10.80.8.199",
    devPort: "8094",
    preHost: "localhost",
    prePort: "4194",
    pocHost: "layout.poc.bellis.com.cn",
    sitHost: "layout.sit.bellis.com.cn",
    testHost: "layout.test.bellis.com.cn",
    uatHost: "layout.uat.bellis.com.cn",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL2ZhY3Rvcmllcy9zdWJhcHAuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS91dGlscy9wYXRoLWhlbHBlcnMudHMiLCAiLi4vLi4vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlLWFwcC1jb25maWcudHMiLCAiLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvcmUvc3JjL2NvbmZpZ3MvYXBwLWVudi5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL2Jhc2UuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL21hbnVhbC1jaHVua3MudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvcm9sbHVwLWNvbmZpZy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jbGVhbi50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jaHVuay50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy91cmwudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY29ycy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jc3MudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvdmVyc2lvbi50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9yZXNvbHZlLWxvZ28udHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvdXBsb2FkLWljb25zLXRvLW9zcy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9yZXBsYWNlLWljb25zLXdpdGgtY2RuLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2xvY2FsZXMtc3RhdGljLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VwbG9hZC1jZG4udHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY2RuLWFzc2V0cy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jZG4taW1wb3J0LnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3Jlc29sdmUtYnRjLWltcG9ydHMudHMiLCAiLi4vYWRtaW4tYXBwL3NyYy9jb25maWcvcHJveHkudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcZmluYW5jZS1hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxmaW5hbmNlLWFwcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9hcHBzL2ZpbmFuY2UtYXBwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHsgY3JlYXRlU3ViQXBwVml0ZUNvbmZpZyB9IGZyb20gJy4uLy4uL2NvbmZpZ3Mvdml0ZS9mYWN0b3JpZXMvc3ViYXBwLmNvbmZpZyc7XG5pbXBvcnQgeyBwcm94eSBhcyBtYWluUHJveHkgfSBmcm9tICcuLi9hZG1pbi1hcHAvc3JjL2NvbmZpZy9wcm94eSc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhcbiAgY3JlYXRlU3ViQXBwVml0ZUNvbmZpZyh7XG4gICAgYXBwTmFtZTogJ2ZpbmFuY2UtYXBwJyxcbiAgICBhcHBEaXI6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLicsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgIHFpYW5rdW5OYW1lOiAnZmluYW5jZScsXG4gICAgY3VzdG9tU2VydmVyOiB7IHByb3h5OiBtYWluUHJveHkgfSxcbiAgICBwcm94eTogbWFpblByb3h5LFxuICB9KVxuKTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcZmFjdG9yaWVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxmYWN0b3JpZXNcXFxcc3ViYXBwLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvZmFjdG9yaWVzL3N1YmFwcC5jb25maWcudHNcIjsvKipcbiAqIFx1NUI1MFx1NUU5NFx1NzUyOCBWaXRlIFx1OTE0RFx1N0Y2RVx1NURFNVx1NTM4MlxuICogXHU3NTFGXHU2MjEwXHU1QjUwXHU1RTk0XHU3NTI4XHU3Njg0XHU1QjhDXHU2NTc0IFZpdGUgXHU5MTREXHU3RjZFXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBVc2VyQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyByZXNvbHZlLCBkaXJuYW1lIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHsgY3JlYXRlUmVxdWlyZSB9IGZyb20gJ21vZHVsZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgdnVlSnN4IGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZS1qc3gnO1xuaW1wb3J0IHFpYW5rdW4gZnJvbSAndml0ZS1wbHVnaW4tcWlhbmt1bic7XG5pbXBvcnQgVW5vQ1NTIGZyb20gJ3Vub2Nzcy92aXRlJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYyB9IGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHsgY3JlYXRlUGF0aEhlbHBlcnMgfSBmcm9tICcuLi91dGlscy9wYXRoLWhlbHBlcnMnO1xuXG4vLyBcdTgzQjdcdTUzRDZcdTVGNTNcdTUyNERcdTY1ODdcdTRFRjZcdTc2ODRcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcdUZGMDhFU00gXHU2NUI5XHU1RjBGXHVGRjA5XG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xuY29uc3QgX19kaXJuYW1lID0gZGlybmFtZShfX2ZpbGVuYW1lKTtcblxuLy8gXHU1RUY2XHU4RkRGXHU1MkEwXHU4RjdEIFZ1ZUkxOG5QbHVnaW5cdUZGMENcdTRFQ0VcdTVFOTRcdTc1MjhcdTc2RUVcdTVGNTVcdTg5RTNcdTY3OTBcbi8vIFx1NEY3Rlx1NzUyOFx1NTFGRFx1NjU3MFx1NTE4NVx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1RkYwQ1x1Nzg2RVx1NEZERFx1NEVDRVx1OEMwM1x1NzUyOFx1ODAwNVx1NzY4NCBub2RlX21vZHVsZXMgXHU4OUUzXHU2NzkwXG5pbXBvcnQgeyBwYXRoVG9GaWxlVVJMIH0gZnJvbSAnbm9kZTp1cmwnO1xuZnVuY3Rpb24gZ2V0VnVlSTE4blBsdWdpbihhcHBEaXI6IHN0cmluZykge1xuICAvLyBcdTRGN0ZcdTc1MjggY3JlYXRlUmVxdWlyZSBcdTRFQ0VcdTVFOTRcdTc1MjhcdTc2RUVcdTVGNTVcdTg5RTNcdTY3OTBcdTUzMDVcbiAgLy8gXHU5MDFBXHU4RkM3IGZpbGU6Ly8gVVJMIFx1NTIxQlx1NUVGQVx1NkI2M1x1Nzg2RVx1NzY4NCByZXF1aXJlIFx1NEUwQVx1NEUwQlx1NjU4N1xuICBjb25zdCBhcHBEaXJVcmwgPSBwYXRoVG9GaWxlVVJMKHJlc29sdmUoYXBwRGlyLCAncGFja2FnZS5qc29uJykpLmhyZWY7XG4gIGNvbnN0IHJlcXVpcmUgPSBjcmVhdGVSZXF1aXJlKGFwcERpclVybCk7XG4gIGNvbnN0IHBsdWdpbiA9IHJlcXVpcmUoJ0BpbnRsaWZ5L3VucGx1Z2luLXZ1ZS1pMThuL3ZpdGUnKTtcbiAgcmV0dXJuIHBsdWdpbi5kZWZhdWx0IHx8IHBsdWdpbjtcbn1cbmltcG9ydCB7IGNyZWF0ZUF1dG9JbXBvcnRDb25maWcsIGNyZWF0ZUNvbXBvbmVudHNDb25maWcgfSBmcm9tICcuLi8uLi9hdXRvLWltcG9ydC5jb25maWcnO1xuaW1wb3J0IHsgYnRjLCBmaXhDaHVua1JlZmVyZW5jZXNQbHVnaW4gfSBmcm9tICdAYnRjL3ZpdGUtcGx1Z2luJztcbmltcG9ydCB7IGdldFZpdGVBcHBDb25maWcsIGdldEJhc2VVcmwsIGdldFB1YmxpY0RpciB9IGZyb20gJy4uLy4uL3ZpdGUtYXBwLWNvbmZpZyc7XG5pbXBvcnQgeyBjcmVhdGVCYXNlUmVzb2x2ZSB9IGZyb20gJy4uL2Jhc2UuY29uZmlnJztcbmltcG9ydCB7IGNyZWF0ZVJvbGx1cENvbmZpZyB9IGZyb20gJy4uL3BsdWdpbnMvcm9sbHVwLWNvbmZpZyc7XG5pbXBvcnQge1xuICBjbGVhbkRpc3RQbHVnaW4sXG4gIGNodW5rVmVyaWZ5UGx1Z2luLFxuICBvcHRpbWl6ZUNodW5rc1BsdWdpbixcbiAgZW5zdXJlQmFzZVVybFBsdWdpbixcbiAgY29yc1BsdWdpbixcbiAgZW5zdXJlQ3NzUGx1Z2luLFxuICBhZGRWZXJzaW9uUGx1Z2luLFxuICByZXBsYWNlSWNvbnNXaXRoQ2RuUGx1Z2luLFxuICByZXNvbHZlTG9nb1BsdWdpbixcbiAgdXBsb2FkQ2RuUGx1Z2luLFxuICBjZG5Bc3NldHNQbHVnaW4sXG4gIGNkbkltcG9ydFBsdWdpbixcbiAgcmVzb2x2ZUJ0Y0ltcG9ydHNQbHVnaW4sXG4gIGxvY2FsZXNTdGF0aWNQbHVnaW4sXG59IGZyb20gJy4uL3BsdWdpbnMnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuZXhwb3J0IGludGVyZmFjZSBTdWJBcHBWaXRlQ29uZmlnT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcdUZGMDhcdTU5ODIgJ2FkbWluLWFwcCdcdUZGMDlcbiAgICovXG4gIGFwcE5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICAgKi9cbiAgYXBwRGlyOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBRaWFua3VuIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NTk4MiAnYWRtaW4nXHVGRjA5XG4gICAqL1xuICBxaWFua3VuTmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5XHU2M0QyXHU0RUY2XHU1MjE3XHU4ODY4XG4gICAqL1xuICBjdXN0b21QbHVnaW5zPzogUGx1Z2luW107XG4gIC8qKlxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTY3ODRcdTVFRkFcdTkxNERcdTdGNkVcbiAgICovXG4gIGN1c3RvbUJ1aWxkPzogUGFydGlhbDxVc2VyQ29uZmlnWydidWlsZCddPjtcbiAgLyoqXG4gICAqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NjcwRFx1NTJBMVx1NTY2OFx1OTE0RFx1N0Y2RVxuICAgKi9cbiAgY3VzdG9tU2VydmVyPzogUGFydGlhbDxVc2VyQ29uZmlnWydzZXJ2ZXInXT47XG4gIC8qKlxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTk4ODRcdTg5QzhcdTY3MERcdTUyQTFcdTU2NjhcdTkxNERcdTdGNkVcbiAgICovXG4gIGN1c3RvbVByZXZpZXc/OiBQYXJ0aWFsPFVzZXJDb25maWdbJ3ByZXZpZXcnXT47XG4gIC8qKlxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTRGMThcdTUzMTZcdTRGOURcdThENTZcdTkxNERcdTdGNkVcbiAgICovXG4gIGN1c3RvbU9wdGltaXplRGVwcz86IFBhcnRpYWw8VXNlckNvbmZpZ1snb3B0aW1pemVEZXBzJ10+O1xuICAvKipcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5IENTUyBcdTkxNERcdTdGNkVcbiAgICovXG4gIGN1c3RvbUNzcz86IFBhcnRpYWw8VXNlckNvbmZpZ1snY3NzJ10+O1xuICAvKipcbiAgICogXHU0RUUzXHU3NDA2XHU5MTREXHU3RjZFXG4gICAqL1xuICBwcm94eT86IFJlY29yZDxzdHJpbmcsIGFueT47XG4gIC8qKlxuICAgKiBCVEMgXHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFXG4gICAqL1xuICBidGNPcHRpb25zPzoge1xuICAgIHR5cGU/OiAnc3ViYXBwJztcbiAgICBwcm94eT86IFJlY29yZDxzdHJpbmcsIGFueT47XG4gICAgZXBzPzoge1xuICAgICAgZW5hYmxlPzogYm9vbGVhbjtcbiAgICAgIGRpY3Q/OiBib29sZWFuO1xuICAgICAgZGlzdD86IHN0cmluZztcbiAgICB9O1xuICAgIHN2Zz86IHtcbiAgICAgIHNraXBOYW1lcz86IHN0cmluZ1tdO1xuICAgIH07XG4gIH07XG4gIC8qKlxuICAgKiBWdWVJMThuIFx1NjNEMlx1NEVGNlx1OTE0RFx1N0Y2RVxuICAgKi9cbiAgdnVlSTE4bk9wdGlvbnM/OiB7XG4gICAgaW5jbHVkZT86IHN0cmluZ1tdO1xuICAgIHJ1bnRpbWVPbmx5PzogYm9vbGVhbjtcbiAgfTtcbiAgLyoqXG4gICAqIFFpYW5rdW4gXHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFXG4gICAqL1xuICBxaWFua3VuT3B0aW9ucz86IHtcbiAgICB1c2VEZXZNb2RlPzogYm9vbGVhbjtcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTUyMUJcdTVFRkFcdTVCNTBcdTVFOTRcdTc1MjggVml0ZSBcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN1YkFwcFZpdGVDb25maWcob3B0aW9uczogU3ViQXBwVml0ZUNvbmZpZ09wdGlvbnMpOiBVc2VyQ29uZmlnIHtcbiAgY29uc3Qge1xuICAgIGFwcE5hbWUsXG4gICAgYXBwRGlyLFxuICAgIHFpYW5rdW5OYW1lLFxuICAgIGN1c3RvbVBsdWdpbnMgPSBbXSxcbiAgICBjdXN0b21CdWlsZCxcbiAgICBjdXN0b21TZXJ2ZXIsXG4gICAgY3VzdG9tUHJldmlldyxcbiAgICBjdXN0b21PcHRpbWl6ZURlcHMsXG4gICAgY3VzdG9tQ3NzLFxuICAgIHByb3h5ID0ge30sXG4gICAgYnRjT3B0aW9ucyA9IHt9LFxuICAgIHZ1ZUkxOG5PcHRpb25zLFxuICAgIHFpYW5rdW5PcHRpb25zID0geyB1c2VEZXZNb2RlOiB0cnVlIH0sXG4gIH0gPSBvcHRpb25zO1xuXG4gIC8vIFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxuICBjb25zdCBhcHBDb25maWcgPSBnZXRWaXRlQXBwQ29uZmlnKGFwcE5hbWUpO1xuICAvLyBcdTRGN0ZcdTc1MjhcdTVCRkNcdTUxNjVcdTc2ODQgY3JlYXRlUGF0aEhlbHBlcnNcbiAgY29uc3QgeyB3aXRoUm9vdCB9ID0gY3JlYXRlUGF0aEhlbHBlcnMoYXBwRGlyKTtcblxuICAvLyBcdTUyMjRcdTY1QURcdTY2MkZcdTU0MjZcdTRFM0FcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcbiAgY29uc3QgaXNQcmV2aWV3QnVpbGQgPSBwcm9jZXNzLmVudi5WSVRFX1BSRVZJRVcgPT09ICd0cnVlJztcbiAgY29uc3QgYmFzZVVybCA9IGdldEJhc2VVcmwoYXBwTmFtZSwgaXNQcmV2aWV3QnVpbGQpO1xuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTVCNTBcdTVFOTRcdTc1MjhcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTc5ODFcdTc1MjggcHVibGljRGlyXHVGRjBDXHU5MDdGXHU1MTREXHU2MjUzXHU1MzA1XHU1NkZFXHU2ODA3XHU3QjQ5XHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXG4gIC8vIFx1NTZGRVx1NjgwN1x1N0I0OVx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1NUU5NFx1OEJFNVx1NzUzMSBsYXlvdXQtYXBwIFx1N0VERlx1NEUwMFx1N0JBMVx1NzQwNlxuICAvLyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFQ0RcdTcxMzZcdTk3MDBcdTg5ODEgcHVibGljRGlyIFx1Njc2NVx1NjcwRFx1NTJBMVx1OTc1OVx1NjAwMVx1NjU4N1x1NEVGNlxuICBjb25zdCBwdWJsaWNEaXIgPSBpc1ByZXZpZXdCdWlsZCA/IGdldFB1YmxpY0RpcihhcHBOYW1lLCBhcHBEaXIpIDogZmFsc2U7XG5cbiAgLy8gXHU4M0I3XHU1M0Q2XHU0RTNCXHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXG4gIGNvbnN0IG1haW5BcHBDb25maWcgPSBnZXRWaXRlQXBwQ29uZmlnKCdtYWluLWFwcCcpO1xuICBjb25zdCBtYWluQXBwUG9ydCA9IG1haW5BcHBDb25maWcucHJlUG9ydC50b1N0cmluZygpO1xuXG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQUVQUyBcdTc2ODQgb3V0cHV0RGlyIFx1NUZDNVx1OTg3Qlx1NEY3Rlx1NzUyOFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NTdGQVx1NEU4RSBhcHBEaXIgXHU4OUUzXHU2NzkwXG4gIC8vIFx1OTA3Rlx1NTE0RFx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NTZFMFx1NEUzQVx1NURFNVx1NEY1Q1x1NzZFRVx1NUY1NVx1NTNEOFx1NTMxNlx1ODAwQ1x1NTcyOCBkaXN0IFx1NzZFRVx1NUY1NVx1NEUwQlx1NTIxQlx1NUVGQSBidWlsZCBcdTc2RUVcdTVGNTVcbiAgY29uc3QgZXBzT3V0cHV0RGlyID0gcmVzb2x2ZShhcHBEaXIsICdidWlsZCcsICdlcHMnKTtcblxuICAvLyBcdTUxNzFcdTRFQUJcdTc2ODQgRVBTIFx1NjU3MFx1NjM2RVx1NkU5MFx1NzZFRVx1NUY1NVx1RkYwOFx1NEVDRSBtYWluLWFwcCBcdThCRkJcdTUzRDZcdUZGMDlcbiAgLy8gXHU1QjUwXHU1RTk0XHU3NTI4XHU0RjE4XHU1MTQ4XHU0RUNFIG1haW4tYXBwIFx1NzY4NCBidWlsZC9lcHMgXHU4QkZCXHU1M0Q2IEVQUyBcdTY1NzBcdTYzNkVcdUZGMENcdTVCOUVcdTczQjBcdTc3MUZcdTZCNjNcdTc2ODRcdTUxNzFcdTRFQUJcbiAgY29uc3Qgc2hhcmVkRXBzRGlyID0gcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9hcHBzL21haW4tYXBwL2J1aWxkL2VwcycpO1xuXG4gIC8vIFx1Nzg2RVx1NEZERCBlcHMgZW5hYmxlIFx1NTlDQlx1N0VDOFx1NEUzQSBib29sZWFuIFx1N0M3Qlx1NTc4QlxuICBjb25zdCBlcHNFbmFibGU6IGJvb2xlYW4gPSBidGNPcHRpb25zLmVwcz8uZW5hYmxlID8/IHRydWU7XG5cbiAgLy8gXHU2Nzg0XHU1RUZBIGVwcyBcdTkxNERcdTdGNkVcdUZGMENcdTc4NkVcdTRGREQgZW5hYmxlIFx1NTlDQlx1N0VDOFx1NEUzQSBib29sZWFuXG4gIGNvbnN0IGVwc0NvbmZpZzoge1xuICAgIGVuYWJsZTogYm9vbGVhbjtcbiAgICBkaWN0OiBib29sZWFuO1xuICAgIGRpY3RBcGk/OiBzdHJpbmc7XG4gICAgZGlzdDogc3RyaW5nO1xuICAgIHNoYXJlZEVwc0Rpcjogc3RyaW5nO1xuICB9ID0ge1xuICAgIGVuYWJsZTogZXBzRW5hYmxlLFxuICAgIGRpY3Q6IGJ0Y09wdGlvbnMuZXBzPy5kaWN0ID8/IHRydWUsIC8vIFx1OUVEOFx1OEJBNFx1NTQyRlx1NzUyOFx1NUI1N1x1NTE3OFx1NTI5Rlx1ODBGRFxuICAgIGRpY3RBcGk6IGJ0Y09wdGlvbnMuZXBzPy5kaWN0QXBpIHx8ICcvYXBpL3N5c3RlbS9hdXRoL2RpY3QnLCAvLyBcdTlFRDhcdThCQTRcdTVCNTdcdTUxNzhcdTYzQTVcdTUzRTNcbiAgICBkaXN0OiBlcHNPdXRwdXREaXIsXG4gICAgc2hhcmVkRXBzRGlyOiBzaGFyZWRFcHNEaXIsXG4gIH07XG5cbiAgLy8gXHU2Nzg0XHU1RUZBXHU2M0QyXHU0RUY2XHU1MjE3XHU4ODY4XG4gIGNvbnN0IHBsdWdpbnM6IFBsdWdpbltdID0gW1xuICAgIC8vIDEuIFx1NkUwNVx1NzQwNlx1NjNEMlx1NEVGNlxuICAgIGNsZWFuRGlzdFBsdWdpbihhcHBEaXIpLFxuICAgIC8vIDIuIENPUlMgXHU2M0QyXHU0RUY2XG4gICAgY29yc1BsdWdpbigpLFxuICAgIC8vIDMuIFx1ODlFM1x1Njc5MCBAYnRjLyogXHU1MzA1XHU1QkZDXHU1MTY1XHU2M0QyXHU0RUY2XHVGRjA4XHU1NzI4IExvZ28gXHU2M0QyXHU0RUY2XHU0RTRCXHU1MjREXHVGRjBDXHU3ODZFXHU0RkREXHU4MEZEXHU1OTFGXHU4OUUzXHU2NzkwXHU0RUNFXHU1REYyXHU2Nzg0XHU1RUZBXHU1MzA1XHU0RTJEXHU1QkZDXHU1MTY1XHU3Njg0IEBidGMvKiBcdTZBMjFcdTU3NTdcdUZGMDlcbiAgICByZXNvbHZlQnRjSW1wb3J0c1BsdWdpbih7IGFwcERpciB9KSxcbiAgICAvLyA0LiBMb2dvIFx1OERFRlx1NUY4NFx1ODlFM1x1Njc5MFx1NjNEMlx1NEVGNlx1RkYwOFx1NTcyOFx1ODFFQVx1NUI5QVx1NEU0OVx1NjNEMlx1NEVGNlx1NEU0Qlx1NTI0RFx1RkYwQ1x1Nzg2RVx1NEZERCAvbG9nby5wbmcgXHU4MEZEXHU4OEFCXHU2QjYzXHU3ODZFXHU4OUUzXHU2NzkwXHVGRjA5XG4gICAgcmVzb2x2ZUxvZ29QbHVnaW4oYXBwRGlyKSxcbiAgICAvLyA0LjUuIExvY2FsZXMgXHU5NzU5XHU2MDAxXHU2NTg3XHU0RUY2XHU2M0QyXHU0RUY2XHVGRjA4XHU2M0QwXHU0RjlCIHNyYy9sb2NhbGVzLyouanNvbiBcdTY1ODdcdTRFRjZcdUZGMENcdTRGOUJcdTRFM0JcdTVFOTRcdTc1MjhcdTkwMUFcdThGQzcgZmV0Y2ggXHU1MkEwXHU4RjdEXHVGRjA5XG4gICAgbG9jYWxlc1N0YXRpY1BsdWdpbihhcHBEaXIpLFxuICAgIC8vIDUuIFx1ODFFQVx1NUI5QVx1NEU0OVx1NjNEMlx1NEVGNlx1RkYwOFx1NTcyOFx1NjgzOFx1NUZDM1x1NjNEMlx1NEVGNlx1NEU0Qlx1NTI0RFx1RkYwOVxuICAgIC4uLmN1c3RvbVBsdWdpbnMsXG4gICAgLy8gNC4gVnVlIFx1NjNEMlx1NEVGNlxuICAgIHZ1ZSh7XG4gICAgICBzY3JpcHQ6IHtcbiAgICAgICAgZnM6IHtcbiAgICAgICAgICBmaWxlRXhpc3RzOiBleGlzdHNTeW5jLFxuICAgICAgICAgIHJlYWRGaWxlOiAoZmlsZTogc3RyaW5nKSA9PiByZWFkRmlsZVN5bmMoZmlsZSwgJ3V0Zi04JyksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pLFxuICAgIC8vIDQuNS4gVnVlIEpTWCBcdTYzRDJcdTRFRjZcdUZGMDhcdTY1MkZcdTYzMDEgVFNYIFx1NjU4N1x1NEVGNlx1NEUyRFx1NzY4NCBKU1ggXHU4QkVEXHU2Q0Q1XHVGRjA5XG4gICAgdnVlSnN4KCksXG4gICAgLy8gNS4gXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU2M0QyXHU0RUY2XG4gICAgY3JlYXRlQXV0b0ltcG9ydENvbmZpZygpLFxuICAgIC8vIDYuIFx1N0VDNFx1NEVGNlx1ODFFQVx1NTJBOFx1NkNFOFx1NTE4Q1x1NjNEMlx1NEVGNlxuICAgIGNyZWF0ZUNvbXBvbmVudHNDb25maWcoeyBpbmNsdWRlU2hhcmVkOiB0cnVlIH0pLFxuICAgIC8vIDcuIFVub0NTUyBcdTYzRDJcdTRFRjZcbiAgICBVbm9DU1Moe1xuICAgICAgY29uZmlnRmlsZTogd2l0aFJvb3QoJ3Vuby5jb25maWcudHMnKSxcbiAgICB9KSxcbiAgICAvLyA4LiBCVEMgXHU0RTFBXHU1MkExXHU2M0QyXHU0RUY2XG4gICAgYnRjKHtcbiAgICAgIHR5cGU6ICdzdWJhcHAnIGFzIGFueSxcbiAgICAgIHByb3h5LFxuICAgICAgZXBzOiBlcHNDb25maWcgYXMgYW55LCAvLyBcdTdDN0JcdTU3OEJcdTY1QURcdThBMDBcdUZGMUFcdTc4NkVcdTRGREQgZW5hYmxlIFx1NTlDQlx1N0VDOFx1NEUzQSBib29sZWFuXG4gICAgICBzdmc6IHtcbiAgICAgICAgc2tpcE5hbWVzOiBbJ2Jhc2UnLCAnaWNvbnMnXSxcbiAgICAgICAgLi4uYnRjT3B0aW9ucy5zdmcsXG4gICAgICB9LFxuICAgICAgLi4uYnRjT3B0aW9ucyxcbiAgICB9KSxcbiAgICAvLyA5LiBWdWVJMThuIFx1NjNEMlx1NEVGNlxuICAgIGdldFZ1ZUkxOG5QbHVnaW4oYXBwRGlyKSh7XG4gICAgICBpbmNsdWRlOiB2dWVJMThuT3B0aW9ucz8uaW5jbHVkZSB8fCBbXG4gICAgICAgIHJlc29sdmUoYXBwRGlyLCAnc3JjL2xvY2FsZXMvKionKVxuICAgICAgXSxcbiAgICAgIHJ1bnRpbWVPbmx5OiB2dWVJMThuT3B0aW9ucz8ucnVudGltZU9ubHkgPz8gdHJ1ZSxcbiAgICB9KSxcbiAgICAvLyAxMC4gQ1NTIFx1OUE4Q1x1OEJDMVx1NjNEMlx1NEVGNlxuICAgIGVuc3VyZUNzc1BsdWdpbigpLFxuICAgIC8vIDExLiBRaWFua3VuIFx1NjNEMlx1NEVGNlxuICAgIHFpYW5rdW4ocWlhbmt1bk5hbWUsIHFpYW5rdW5PcHRpb25zKSxcbiAgICAvLyAxMi4gXHU0RkVFXHU1OTBEIGNodW5rIFx1NUYxNVx1NzUyOFx1NjNEMlx1NEVGNlxuICAgIGZpeENodW5rUmVmZXJlbmNlc1BsdWdpbigpLFxuICAgIC8vIDE1LiBcdTc4NkVcdTRGREQgYmFzZSBVUkwgXHU2M0QyXHU0RUY2XG4gICAgZW5zdXJlQmFzZVVybFBsdWdpbihiYXNlVXJsLCBhcHBDb25maWcuZGV2SG9zdCwgYXBwQ29uZmlnLnByZVBvcnQsIG1haW5BcHBQb3J0KSxcbiAgICAvLyAxNi4gXHU2REZCXHU1MkEwXHU3MjQ4XHU2NzJDXHU1M0Y3XHU2M0QyXHU0RUY2XHVGRjA4XHU0RTNBIEhUTUwgXHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU2REZCXHU1MkEwXHU2NUY2XHU5NUY0XHU2MjMzXHU3MjQ4XHU2NzJDXHU1M0Y3XHVGRjA5XG4gICAgYWRkVmVyc2lvblBsdWdpbigpLFxuICAgIC8vIDE2LjUuIENETiBcdThENDRcdTZFOTBcdTUyQTBcdTkwMUZcdTYzRDJcdTRFRjZcdUZGMDhcdTU3MjhcdTcyNDhcdTY3MkNcdTUzRjdcdTYzRDJcdTRFRjZcdTRFNEJcdTU0MEVcdUZGMENcdTc4NkVcdTRGRERcdTcyNDhcdTY3MkNcdTUzRjdcdTUzQzJcdTY1NzBcdTg4QUJcdTRGRERcdTc1NTlcdUZGMDlcbiAgICAvLyBcdTU5MDRcdTc0MDYgSFRNTCBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTAgVVJMXHVGRjA4PHNjcmlwdD5cdTMwMDE8bGluaz5cdTMwMDE8aW1nPiBcdTdCNDlcdUZGMDlcbiAgICBjZG5Bc3NldHNQbHVnaW4oe1xuICAgICAgYXBwTmFtZSxcbiAgICAgIGVuYWJsZWQ6ICFpc1ByZXZpZXdCdWlsZCAmJiBwcm9jZXNzLmVudi5FTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiAhPT0gJ2ZhbHNlJyxcbiAgICB9KSxcbiAgICAvLyAxNi42LiBDRE4gXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU4RjZDXHU2MzYyXHU2M0QyXHU0RUY2XHVGRjA4XHU4RjZDXHU2MzYyXHU0RUUzXHU3ODAxXHU0RTJEXHU3Njg0IGltcG9ydCgpIFx1OEMwM1x1NzUyOFx1RkYwOVxuICAgIC8vIFx1NUMwNlx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1OEY2Q1x1NjM2Mlx1NEUzQSBDRE4gVVJMXHVGRjBDXHU0RTBFIGNkbkFzc2V0c1BsdWdpbiBcdTkxNERcdTU0MDhcdTVCOUVcdTczQjBcdTVCOENcdTY1NzRcdTc2ODQgQ0ROIFx1NTJBMFx1OTAxRlxuICAgIGNkbkltcG9ydFBsdWdpbih7XG4gICAgICBhcHBOYW1lLFxuICAgICAgZW5hYmxlZDogIWlzUHJldmlld0J1aWxkICYmIHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OICE9PSAnZmFsc2UnLFxuICAgIH0pLFxuICAgIC8vIDE2LjcuIFx1NjZGRlx1NjM2Mlx1NTZGRVx1NjgwN1x1OERFRlx1NUY4NFx1NEUzQSBDRE4gVVJMXHVGRjA4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjA5XG4gICAgcmVwbGFjZUljb25zV2l0aENkblBsdWdpbigpLFxuICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NEUwRFx1NTE4RFx1OTcwMFx1ODk4MSByZXNvbHZlRXh0ZXJuYWxJbXBvcnRzUGx1Z2luXHVGRjBDXHU1NkUwXHU0RTNBXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU2MjUzXHU1MzA1IEBidGMvKiBcdTUzMDVcbiAgICAvLyAxNy4gXHU0RjE4XHU1MzE2IGNodW5rcyBcdTYzRDJcdTRFRjZcbiAgICBvcHRpbWl6ZUNodW5rc1BsdWdpbigpLFxuICAgIC8vIDE4LiBDaHVuayBcdTlBOENcdThCQzFcdTYzRDJcdTRFRjZcbiAgICBjaHVua1ZlcmlmeVBsdWdpbigpLFxuICAgIC8vIDE5LiBDRE4gXHU0RTBBXHU0RjIwXHU2M0QyXHU0RUY2XHVGRjA4XHU0RUM1XHU1NzI4XHU3NTFGXHU0RUE3XHU2Nzg0XHU1RUZBXHU0RTE0XHU1NDJGXHU3NTI4XHU2NUY2XHVGRjA5XG4gICAgLi4uKHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fVVBMT0FEID09PSAndHJ1ZScgJiYgIWlzUHJldmlld0J1aWxkXG4gICAgICA/IFt1cGxvYWRDZG5QbHVnaW4oYXBwTmFtZSwgYXBwRGlyKV1cbiAgICAgIDogW10pLFxuICBdO1xuXG4gIC8vIFx1Njc4NFx1NUVGQVx1OTE0RFx1N0Y2RVxuICBjb25zdCBidWlsZENvbmZpZzogVXNlckNvbmZpZ1snYnVpbGQnXSA9IHtcbiAgICB0YXJnZXQ6ICdlczIwMjAnLFxuICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgY3NzQ29kZVNwbGl0OiBmYWxzZSxcbiAgICBjc3NNaW5pZnk6IHRydWUsXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3OTgxXHU3NTI4XHU0RUUzXHU3ODAxXHU1MzhCXHU3RjI5XHVGRjBDXHU5MDdGXHU1MTREIFRlcnNlciBcdTUzOEJcdTdGMjlcdTVCRkNcdTgxRjRcdTc2ODRcdTVCRjlcdThDNjFcdTVDNUVcdTYwMjdcdTUyMDZcdTk2OTRcdTdCMjZcdTRFMjJcdTU5MzFcdTk1RUVcdTk4OThcbiAgICBtaW5pZnk6IGZhbHNlLFxuXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3OTgxXHU2QjYyXHU4RDQ0XHU2RTkwXHU1MTg1XHU4MDU0XHVGRjBDXHU3ODZFXHU0RkREIENTUyBcdTg4QUJcdTYzRDBcdTUzRDZcdTUyMzBcdTcyRUNcdTdBQ0JcdTY1ODdcdTRFRjZcdTRFMkRcdUZGMDhxaWFua3VuIFx1ODk4MVx1NkM0Mlx1RkYwOVxuICAgIC8vIFx1NEUwRSBsYXlvdXQtYXBwIFx1NEZERFx1NjMwMVx1NEUwMFx1ODFGNFx1RkYwQ1x1OTA3Rlx1NTE0RFx1NTE4NVx1ODA1NCBDU1MgXHU1QkZDXHU4MUY0XHU2ODM3XHU1RjBGXHU0RTIyXHU1OTMxXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDAsXG4gICAgb3V0RGlyOiBwcm9jZXNzLmVudi5CVUlMRF9PVVRfRElSIHx8ICdkaXN0JyxcbiAgICBhc3NldHNEaXI6ICdhc3NldHMnLFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzk4MVx1NzUyOCBWaXRlIFx1NzY4NFx1ODFFQVx1NTJBOFx1NkUwNVx1NzQwNlx1RkYwQ1x1NTZFMFx1NEUzQVx1NjIxMVx1NEVFQ1x1NURGMlx1N0VDRlx1NjcwOSBjbGVhbkRpc3RQbHVnaW4gXHU1NzI4XHU2Nzg0XHU1RUZBXHU1MjREXHU2RTA1XHU3NDA2XG4gICAgLy8gXHU4RkQ5XHU2ODM3XHU1M0VGXHU0RUU1XHU5MDdGXHU1MTREIFdpbmRvd3MgXHU0RTBBXHU3Njg0XHU2NTg3XHU0RUY2XHU5NTAxXHU1QjlBXHU5NUVFXHU5ODk4XHVGRjA4RUJVU1lcdUZGMDlcbiAgICAvLyBjbGVhbkRpc3RQbHVnaW4gXHU1REYyXHU3RUNGXHU2NzA5XHU5MUNEXHU4QkQ1XHU2NzNBXHU1MjM2XHVGRjA4NVx1NkIyMVx1RkYwQ1x1OTAxMlx1NTg5RVx1N0I0OVx1NUY4NVx1NjVGNlx1OTVGNFx1RkYwOVx1RkYwQ1x1NTk4Mlx1Njc5Q1x1NkUwNVx1NzQwNlx1NTkzMVx1OEQyNVx1NEYxQVx1N0VFN1x1N0VFRFx1Njc4NFx1NUVGQVxuICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTk4Mlx1Njc5Q1x1NkUwNVx1NzQwNlx1NTkzMVx1OEQyNVx1RkYwQ1x1NjVFN1x1NzY4NFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NEUwRFx1NEYxQVx1ODhBQlx1NTIyMFx1OTY2NFx1RkYwQ1x1NTNFRlx1ODBGRFx1NUJGQ1x1ODFGNFx1OTFDRFx1NTkwRFx1NjU4N1x1NEVGNlxuICAgIGVtcHR5T3V0RGlyOiBmYWxzZSxcbiAgICAvLyBcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTYyNTNcdTUzMDUgQGJ0Yy8qIFx1NTMwNVx1NTQ4QyBAY29uZmlncyBcdTUzMDVcdUZGMENcdTkwN0ZcdTUxNERcdThGRDBcdTg4NENcdTY1RjZcdTZBMjFcdTU3NTdcdTg5RTNcdTY3OTBcdTk1RUVcdTk4OThcbiAgICByb2xsdXBPcHRpb25zOiBjcmVhdGVSb2xsdXBDb25maWcoYXBwTmFtZSwge1xuICAgICAgZXh0ZXJuYWxCdGNQYWNrYWdlczogZmFsc2UsIC8vIFx1NjYzRVx1NUYwRlx1OEJCRVx1N0Y2RVx1NEUzQSBmYWxzZVx1RkYwQ1x1NjI1M1x1NTMwNSBAYnRjLyogXHU1MzA1XG4gICAgICBleHRlcm5hbENvbmZpZ3NQYWNrYWdlczogZmFsc2UsIC8vIFx1NjYzRVx1NUYwRlx1OEJCRVx1N0Y2RVx1NEUzQSBmYWxzZVx1RkYwQ1x1NjI1M1x1NTMwNSBAY29uZmlncyBcdTUzMDVcbiAgICB9KSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gICAgLi4uY3VzdG9tQnVpbGQsXG4gIH07XG5cbiAgLy8gXHU2NzBEXHU1MkExXHU1NjY4XHU5MTREXHU3RjZFXG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEYxOFx1NTE0OFx1NEY3Rlx1NzUyOCBjdXN0b21TZXJ2ZXIucHJveHlcdUZGMENcdTU5ODJcdTY3OUNcdTRFMERcdTVCNThcdTU3MjhcdTUyMTlcdTRGN0ZcdTc1MjggcHJveHkgXHU1M0MyXHU2NTcwXG4gIC8vIFx1NkNFOFx1NjEwRlx1RkYxQWN1c3RvbVNlcnZlciBcdTRGMUFcdTU3MjhcdTY3MDBcdTU0MEVcdTVDNTVcdTVGMDBcdUZGMENcdTU5ODJcdTY3OUNcdTUzMDVcdTU0MkIgcHJveHkgXHU0RjFBXHU4OTg2XHU3NkQ2XHU4RkQ5XHU5MUNDXHU3Njg0XHU4QkJFXHU3RjZFXG4gIGNvbnN0IGZpbmFsUHJveHkgPSBjdXN0b21TZXJ2ZXI/LnByb3h5ICE9PSB1bmRlZmluZWQgPyBjdXN0b21TZXJ2ZXIucHJveHkgOiBwcm94eTtcbiAgY29uc3QgeyBwcm94eTogX2N1c3RvbVByb3h5LCAuLi5yZXN0Q3VzdG9tU2VydmVyIH0gPSBjdXN0b21TZXJ2ZXIgfHwge307XG4gIC8vIFx1NkRGQlx1NTJBMFx1NzZEMVx1NjNBN1x1NjcwRFx1NTJBMVx1NEVFM1x1NzQwNlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NzlDMVx1NjcwOVx1N0Y1MVx1N0VEQ1x1OEJGN1x1NkM0Mlx1OEI2Nlx1NTQ0QVxuICAvLyBcdTVDMDYgL19fbW9uaXRvcl9fIFx1NEVFM1x1NzQwNlx1NTIzMFx1NzZEMVx1NjNBN1x1NjcwRFx1NTJBMVx1RkYwOGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMVx1RkYwOVxuICBjb25zdCBtb25pdG9yUHJveHkgPSB7XG4gICAgJy9fX21vbml0b3JfXyc6IHtcbiAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMScsXG4gICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICByZXdyaXRlOiAocGF0aDogc3RyaW5nKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9fX21vbml0b3JfXy8sICcnKSxcbiAgICAgIHdzOiB0cnVlLCAvLyBcdTY1MkZcdTYzMDEgV2ViU29ja2V0XHVGRjA4U1NFIFx1NEY3Rlx1NzUyOFx1RkYwOVxuICAgIH0sXG4gIH07XG4gIFxuICAvLyBcdTU0MDhcdTVFNzZcdTRFRTNcdTc0MDZcdTkxNERcdTdGNkVcdUZGMUFcdTc2RDFcdTYzQTdcdTY3MERcdTUyQTFcdTRFRTNcdTc0MDZcdTRGMThcdTUxNDhcdUZGMENcdTcxMzZcdTU0MEVcdTY2MkZcdTRFMUFcdTUyQTFcdTRFRTNcdTc0MDZcbiAgY29uc3QgbWVyZ2VkUHJveHkgPSB7XG4gICAgLi4ubW9uaXRvclByb3h5LFxuICAgIC4uLmZpbmFsUHJveHksXG4gIH07XG4gIFxuICBjb25zdCBzZXJ2ZXJDb25maWc6IFVzZXJDb25maWdbJ3NlcnZlciddID0ge1xuICAgIHBvcnQ6IGFwcENvbmZpZy5kZXZQb3J0LFxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIGNvcnM6IHRydWUsXG4gICAgb3JpZ2luOiBgaHR0cDovLyR7YXBwQ29uZmlnLmRldkhvc3R9OiR7YXBwQ29uZmlnLmRldlBvcnR9YCxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoJyxcbiAgICB9LFxuICAgIGhtcjoge1xuICAgICAgaG9zdDogYXBwQ29uZmlnLmRldkhvc3QsXG4gICAgICBwb3J0OiBhcHBDb25maWcuZGV2UG9ydCxcbiAgICAgIG92ZXJsYXk6IGZhbHNlLFxuICAgIH0sXG4gICAgcHJveHk6IG1lcmdlZFByb3h5LFxuICAgIGZzOiB7XG4gICAgICBzdHJpY3Q6IGZhbHNlLFxuICAgICAgYWxsb3c6IFtcbiAgICAgICAgd2l0aFJvb3QoJy4nKSxcbiAgICAgIF0sXG4gICAgICBjYWNoZWRDaGVja3M6IHRydWUsXG4gICAgfSxcbiAgICAuLi5yZXN0Q3VzdG9tU2VydmVyLFxuICB9O1xuXG4gIC8vIFx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1OTE0RFx1N0Y2RVxuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTk4ODRcdTg5QzhcdTY3MERcdTUyQTFcdTU2NjhcdTRFQ0VcdTY4MzlcdTc2RUVcdTVGNTVcdTc2ODQgZGlzdC97cHJvZEhvc3R9IFx1OEJGQlx1NTNENlx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1RkYwQ1x1ODAwQ1x1NEUwRFx1NjYyRlx1NEVDRSBhcHBzL3thcHBOYW1lfS9kaXN0IFx1OEJGQlx1NTNENlxuICBjb25zdCByb290RGlzdERpciA9IHJlc29sdmUoYXBwRGlyLCAnLi4vLi4vZGlzdCcpO1xuICBjb25zdCBwcmV2aWV3Um9vdCA9IHJlc29sdmUocm9vdERpc3REaXIsIGFwcENvbmZpZy5wcm9kSG9zdCk7XG5cbiAgY29uc3QgcHJldmlld0NvbmZpZzogVXNlckNvbmZpZ1sncHJldmlldyddID0ge1xuICAgIHBvcnQ6IGFwcENvbmZpZy5wcmVQb3J0LFxuICAgIHN0cmljdFBvcnQ6IHRydWUsXG4gICAgb3BlbjogZmFsc2UsXG4gICAgaG9zdDogJzAuMC4wLjAnLFxuICAgIHByb3h5LFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiBhcHBDb25maWcubWFpbkFwcE9yaWdpbixcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCxPUFRJT05TJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscyc6ICd0cnVlJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZScsXG4gICAgfSxcbiAgICAuLi5jdXN0b21QcmV2aWV3LFxuICB9IGFzIGFueTtcblxuICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdThCQkVcdTdGNkVcdTk4ODRcdTg5QzhcdTY3MERcdTUyQTFcdTU2NjhcdTc2ODRcdTY4MzlcdTc2RUVcdTVGNTVcdTRFM0EgZGlzdC97cHJvZEhvc3R9XG4gIC8vIFx1NkNFOFx1NjEwRlx1RkYxQXJvb3QgXHU1QzVFXHU2MDI3XHU1NzI4XHU2NUIwXHU3MjQ4XHU2NzJDXHU3Njg0IFZpdGUgXHU3QzdCXHU1NzhCXHU0RTJEXHU1M0VGXHU4MEZEXHU2NzJBXHU1QjlBXHU0RTQ5XHVGRjBDXHU0RjQ2XHU4RkQwXHU4ODRDXHU2NUY2XHU0RUNEXHU2NTJGXHU2MzAxXG4gIChwcmV2aWV3Q29uZmlnIGFzIGFueSkucm9vdCA9IHByZXZpZXdSb290O1xuXG4gIGNvbnN0IGFwcENhY2hlRGlyID0gcmVzb2x2ZShhcHBEaXIsICdub2RlX21vZHVsZXMvLnZpdGUnKTtcblxuICBjb25zdCBvcHRpbWl6ZURlcHNDb25maWc6IFVzZXJDb25maWdbJ29wdGltaXplRGVwcyddID0ge1xuICAgIGluY2x1ZGU6IFtcbiAgICAgIC8vIFx1NjgzOFx1NUZDM1x1NEY5RFx1OEQ1Nlx1RkYxQVx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NUI4OVx1ODhDNVx1NzY4NFx1NEY5RFx1OEQ1NlxuICAgICAgJ3Z1ZScsXG4gICAgICAndnVlLXJvdXRlcicsXG4gICAgICAncGluaWEnLFxuICAgICAgJ2VsZW1lbnQtcGx1cycsXG4gICAgICAvLyBXaW5zdG9uIFx1OTcwMFx1ODk4MVx1NzY4NCBOb2RlLmpzIFx1NkEyMVx1NTc1NyBwb2x5ZmlsbFxuICAgICAgJ3V0aWwnLFxuICAgICAgJ2VsZW1lbnQtcGx1cy9lcycsXG4gICAgICAnZWxlbWVudC1wbHVzL2VzL2xvY2FsZS9sYW5nL3poLWNuJyxcbiAgICAgICdlbGVtZW50LXBsdXMvZXMvbG9jYWxlL2xhbmcvZW4nLFxuICAgICAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2Nhc2NhZGVyL3N0eWxlL2NzcycsXG4gICAgICAnQGVsZW1lbnQtcGx1cy9pY29ucy12dWUnLFxuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUnLFxuICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBQGJ0Yy9zaGFyZWQtY29tcG9uZW50cyBcdTVERjJcdTRFQ0UgaW5jbHVkZSBcdTRFMkRcdTc5RkJcdTk2NjRcdUZGMENcdTU2RTBcdTRFM0FcdTVCODNcdTUzMDVcdTU0MkIgVFNYIFx1NjU4N1x1NEVGNlxuICAgICAgLy8gXHU1NzI4XHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU0RTJEXHVGRjBDXHU1RTk0XHU4QkU1XHU3NkY0XHU2M0E1XHU0RUNFXHU2RTkwXHU3ODAxXHU1QkZDXHU1MTY1XHVGRjBDXHU4MDBDXHU0RTBEXHU2NjJGXHU5ODg0XHU2Nzg0XHU1RUZBXG4gICAgICAvLyAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cycsXG4gICAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnLFxuICAgICAgJ0BidGMvc3ViYXBwLW1hbmlmZXN0cycsXG4gICAgICAndml0ZS1wbHVnaW4tcWlhbmt1bi9kaXN0L2hlbHBlcicsXG4gICAgICAncWlhbmt1bicsXG4gICAgICAnQHZ1ZXVzZS9jb3JlJyxcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OEZEOVx1NEU5Qlx1NEY5RFx1OEQ1Nlx1NzNCMFx1NTcyOFx1NURGMlx1N0VDRlx1NTcyOFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NzY4NCBwYWNrYWdlLmpzb24gXHU0RTJEXHU1OEYwXHU2NjBFXG4gICAgICAvLyBcdTkwMUFcdThGQzcgQGJ0Yy9zaGFyZWQtY29tcG9uZW50cyBcdTk1RjRcdTYzQTVcdTRGN0ZcdTc1MjhcdUZGMENcdTRGNDZcdTk3MDBcdTg5ODFcdTU3MjhcdTVFOTRcdTc1MjhcdTRFMkRcdTY2M0VcdTVGMEZcdTU4RjBcdTY2MEVcdTRFRTVcdTRGQkYgVml0ZSBcdTZCNjNcdTc4NkVcdTg5RTNcdTY3OTBcbiAgICAgICdsb2Rhc2gtZXMnLFxuICAgICAgJ2NoYXJkZXQnLFxuICAgICAgJ3hsc3gnLFxuICAgICAgJ3Z1ZS1pMThuJyxcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQWVjaGFydHMgXHU3NkY4XHU1MTczXHU0RjlEXHU4RDU2XHU5NzAwXHU4OTgxXHU4OEFCXHU5ODg0XHU2Nzg0XHU1RUZBXG4gICAgICAvLyBcdTg2N0RcdTcxMzZcdTUzRUFcdTU3MjhcdTkwRThcdTUyMDZcdTVFOTRcdTc1MjhcdTRFMkRcdTRGN0ZcdTc1MjhcdUZGMENcdTRGNDZcdTZERkJcdTUyQTBcdTUyMzAgaW5jbHVkZSBcdTRFMkRcdTUzRUZcdTRFRTVcdTkwN0ZcdTUxNERcdThGRDBcdTg4NENcdTY1RjZcdTRGMThcdTUzMTZcbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NUU5NFx1NzUyOFx1NjcyQVx1NUI4OVx1ODhDNVx1OEZEOVx1NEU5Qlx1NEY5RFx1OEQ1Nlx1RkYwQ1ZpdGUgXHU0RjFBXHU1RkZEXHU3NTY1XHU1QjgzXHU0RUVDXHVGRjA4XHU0RTBEXHU0RjFBXHU2MkE1XHU5NTE5XHVGRjA5XG4gICAgICAnZWNoYXJ0cy9jb3JlJyxcbiAgICAgICdlY2hhcnRzJyxcbiAgICAgICd2dWUtZWNoYXJ0cycsXG4gICAgXSxcbiAgICAvLyBcdTYzOTJcdTk2NjRcdTRFMERcdTVFOTRcdThCRTVcdTg4QUJcdTRGMThcdTUzMTZcdTc2ODRcdTRGOURcdThENTZcbiAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFleGNsdWRlIFx1NEY3Rlx1NzUyOFx1NTMwNVx1NTQwRFx1NjIxNlx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1NkEyMVx1NUYwRlxuICAgIGV4Y2x1ZGU6IFtcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQUBidGMvc2hhcmVkLWNvcmUvY29uZmlncy9sYXlvdXQtYnJpZGdlIFx1NjYyRlx1NjcyQ1x1NTczMFx1NTIyQlx1NTQwRFx1OERFRlx1NUY4NFx1RkYwQ1x1NEUwRFx1NjYyRiBucG0gXHU1MzA1XHVGRjBDXHU0RTBEXHU1RTk0XHU4QkU1XHU4OEFCXHU0RjE4XHU1MzE2XG4gICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFleGNsdWRlIFx1NTNFQVx1NjUyRlx1NjMwMVx1NUI1N1x1N0IyNlx1NEUzMlx1NkEyMVx1NUYwRlx1RkYwQ1x1NEUwRFx1NjUyRlx1NjMwMVx1NkI2M1x1NTIxOVx1ODg2OFx1OEZCRVx1NUYwRlxuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUvY29uZmlncy9sYXlvdXQtYnJpZGdlJyxcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NjM5Mlx1OTY2NCBAYnRjL3NoYXJlZC1jb21wb25lbnRzXHVGRjBDXHU1NkUwXHU0RTNBXHU1QjgzXHU2NjJGXHU2NzJDXHU1NzMwXHU1MzA1XHVGRjBDXHU1MzA1XHU1NDJCIFRTWCBcdTY1ODdcdTRFRjZcbiAgICAgIC8vIFx1NTcyOFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NEUyRFx1RkYwQ1x1NUU5NFx1OEJFNVx1NzZGNFx1NjNBNVx1NEVDRVx1NkU5MFx1NzgwMVx1NUJGQ1x1NTE2NVx1RkYwQ1x1ODAwQ1x1NEUwRFx1NjYyRlx1OTg4NFx1Njc4NFx1NUVGQVxuICAgICAgLy8gXHU4RkQ5XHU2ODM3XHU1M0VGXHU0RUU1XHU5MDdGXHU1MTREIEpTWCBcdTg5RTNcdTY3OTBcdTk1RUVcdTk4OThcbiAgICAgICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJyxcbiAgICBdLFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OEJCRVx1N0Y2RVx1NEUzQSB0cnVlXHVGRjBDXHU1RjNBXHU1MjM2XHU5MUNEXHU2NUIwXHU2Nzg0XHU1RUZBXHU2MjQwXHU2NzA5XHU0RjlEXHU4RDU2XHVGRjBDXHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5XHU0RjlEXHU4RDU2XHU5MEZEXHU4OEFCXHU5ODg0XHU2Nzg0XHU1RUZBXG4gICAgLy8gXHU4RkQ5XHU0RjFBXHU1NzI4XHU5OTk2XHU2QjIxXHU1NDJGXHU1MkE4XHU2NUY2XHU2Nzg0XHU1RUZBXHU2MjQwXHU2NzA5XHU0RjlEXHU4RDU2XHVGRjBDXHU0RTRCXHU1NDBFXHU1QzMxXHU0RTBEXHU0RjFBXHU1MThEXHU4OUU2XHU1M0QxXHU0RTg2XG4gICAgZm9yY2U6IGZhbHNlLFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTNDMlx1ODAwMyBjb29sLWFkbWluIFx1NzY4NFx1NTA1QVx1NkNENVxuICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NEUwRFx1NTE4RFx1NTMwNVx1NTQyQiBzaGFyZWQtY29tcG9uZW50cy9zcmMvaW5kZXgudHNcdUZGMENcdTU2RTBcdTRFM0FcdTVCODNcdTUzMDVcdTU0MkIgVFNYIFx1NjU4N1x1NEVGNlx1RkYwQ1x1NUU5NFx1OEJFNVx1NTcyOFx1OEZEMFx1ODg0Q1x1NjVGNlx1NzZGNFx1NjNBNVx1NTkwNFx1NzQwNlxuICAgIC8vIHNoYXJlZC1jb21wb25lbnRzIFx1NEUyRFx1NzY4NFx1NEY5RFx1OEQ1Nlx1RkYwOFx1NTk4MiBsdW5yLCBjaGFyZGV0IFx1N0I0OVx1RkYwOVx1NEYxQVx1NTcyOFx1OEZEMFx1ODg0Q1x1NjVGNlx1ODhBQlx1ODFFQVx1NTJBOFx1NTNEMVx1NzNCMFx1NTQ4Q1x1NEYxOFx1NTMxNlxuICAgIGVudHJpZXM6IFtcbiAgICAgIC8vIFx1NUU5NFx1NzUyOFx1NzY4NFx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlxuICAgICAgcmVzb2x2ZShhcHBEaXIsICdzcmMvbWFpbi50cycpLFxuICAgIF0sXG4gICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgIHBsdWdpbnM6IFtdLFxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3ODZFXHU0RkREXHU0RjlEXHU4RDU2XHU5ODg0XHU2Nzg0XHU1RUZBXHU2NUY2XHU0RTVGXHU0RjdGXHU3NTI4IFZ1ZSBcdTc2ODQgSlNYIFx1OEY2Q1x1NjM2Mlx1NjVCOVx1NUYwRlxuICAgICAganN4OiAncHJlc2VydmUnLCAvLyBcdTRGRERcdTc1NTkgSlNYXHVGRjBDXHU4QkE5IHZ1ZUpzeCBcdTYzRDJcdTRFRjZcdTU5MDRcdTc0MDZcbiAgICAgIGpzeEZhY3Rvcnk6ICdoJywgLy8gXHU0RjdGXHU3NTI4IFZ1ZSBcdTc2ODQgaCBcdTUxRkRcdTY1NzBcdTRGNUNcdTRFM0EgSlNYIFx1NURFNVx1NTM4Mlx1NTFGRFx1NjU3MFxuICAgICAganN4RnJhZ21lbnQ6ICdGcmFnbWVudCcsIC8vIFx1NEY3Rlx1NzUyOCBWdWUgXHU3Njg0IEZyYWdtZW50XG4gICAgfSxcbiAgICAuLi5jdXN0b21PcHRpbWl6ZURlcHMsXG4gIH07XG5cbiAgLy8gQ1NTIFx1OTE0RFx1N0Y2RVxuICBjb25zdCBjc3NDb25maWc6IFVzZXJDb25maWdbJ2NzcyddID0ge1xuICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgIHNjc3M6IHtcbiAgICAgICAgYXBpOiAnbW9kZXJuLWNvbXBpbGVyJyxcbiAgICAgICAgc2lsZW5jZURlcHJlY2F0aW9uczogWydsZWdhY3ktanMtYXBpJywgJ2ltcG9ydCddLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGRldlNvdXJjZW1hcDogZmFsc2UsXG4gICAgLi4uY3VzdG9tQ3NzLFxuICB9O1xuXG4gIC8vIFx1OEZENFx1NTZERVx1NUI4Q1x1NjU3NFx1OTE0RFx1N0Y2RVxuICAvLyBcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTRGN0ZcdTc1MjhcdTUyMkJcdTU0MERcdTYzMDdcdTU0MTFcdTZFOTBcdTc4MDFcdUZGMDhcdTU2RTBcdTRFM0FcdTkwRkRcdTYyNTNcdTUzMDUgQGJ0Yy8qIFx1NTMwNVx1RkYwOVxuICBjb25zdCBiYXNlUmVzb2x2ZSA9IGNyZWF0ZUJhc2VSZXNvbHZlKGFwcERpciwgYXBwTmFtZSk7XG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NzUxRlx1NEVBNy9cdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdTY1RjZcdUZGMENcdTVCNTBcdTVFOTRcdTc1MjhcdTRFMERcdTUxOERcdTRGN0ZcdTc1MjhcdTY3MkNcdTU3MzAgdmlydHVhbDplcHNcdUZGMDhcdTc1MzEgbGF5b3V0LWFwcCBcdTYzRDBcdTRGOUJcdTUxNzFcdTRFQUIgRVBTIFx1NjcwRFx1NTJBMVx1RkYwOVxuICAvLyBcdThGRDlcdTY4MzdcdTUzRUZcdTRFRTVcdTkwN0ZcdTUxNERcdTVCNTBcdTVFOTRcdTc1MjhcdTUxNjVcdTUzRTNcdTRFQTdcdTc1MUZcdTVCRjlcdTgxRUFcdThFQUIgZXBzLXNlcnZpY2UteHh4LmpzIFx1NzY4NFx1NUYxNVx1NzUyOFx1RkYwQ1x1NUJGQ1x1ODFGNFx1NTE3MVx1NEVBQlx1NEUwRFx1NzUxRlx1NjU0OFx1NjIxNiA0MDRcdTMwMDJcbiAgY29uc3Qgc2hvdWxkVXNlU2hhcmVkRXBzID0gKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHx8IGlzUHJldmlld0J1aWxkO1xuICBjb25zdCBzaGFyZWRFcHNTdHViID0gcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9jb25maWdzL3ZpdGUvc3R1YnMvdmlydHVhbC1lcHMtZW1wdHkudHMnKTtcbiAgY29uc3QgZmluYWxSZXNvbHZlID0gc2hvdWxkVXNlU2hhcmVkRXBzXG4gICAgPyB7XG4gICAgICAgIC4uLmJhc2VSZXNvbHZlLFxuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRERcdTYzMDFcdTUyMkJcdTU0MERcdTY1NzBcdTdFQzRcdTVGNjJcdTVGMEZcdUZGMENcdTZERkJcdTUyQTAgdmlydHVhbDplcHMgXHU1MjJCXHU1NDBEXG4gICAgICAgIGFsaWFzOiBBcnJheS5pc0FycmF5KGJhc2VSZXNvbHZlPy5hbGlhcylcbiAgICAgICAgICA/IFtcbiAgICAgICAgICAgICAgLi4uYmFzZVJlc29sdmUuYWxpYXMsXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaW5kOiAndmlydHVhbDplcHMnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50OiBzaGFyZWRFcHNTdHViLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXVxuICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAuLi4oYmFzZVJlc29sdmU/LmFsaWFzIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz4gfHwge30pLFxuICAgICAgICAgICAgICAndmlydHVhbDplcHMnOiBzaGFyZWRFcHNTdHViLFxuICAgICAgICAgICAgfSxcbiAgICAgIH1cbiAgICA6IGJhc2VSZXNvbHZlO1xuXG4gIGNvbnN0IGNvbmZpZzogYW55ID0ge1xuICAgIGJhc2U6IGJhc2VVcmwsXG4gICAgcHVibGljRGlyLFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NkJDRlx1NEUyQVx1NUU5NFx1NzUyOFx1NEY3Rlx1NzUyOFx1NzJFQ1x1N0FDQlx1NzY4NFx1N0YxM1x1NUI1OFx1NzZFRVx1NUY1NVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NEUwRFx1NTQwQ1x1NUU5NFx1NzUyOFx1NzY4NFx1OTE0RFx1N0Y2RVx1NURFRVx1NUYwMlx1NUJGQ1x1ODFGNFx1N0YxM1x1NUI1OFx1NTFCMlx1N0E4MVxuICAgIC8vIFx1ODY3RFx1NzEzNlx1OEZEOVx1NEYxQVx1NTg5RVx1NTJBMFx1NEUwMFx1NEU5Qlx1NUI1OFx1NTBBOFx1N0E3QVx1OTVGNFx1RkYwQ1x1NEY0Nlx1NTNFRlx1NEVFNVx1Nzg2RVx1NEZERFx1NkJDRlx1NEUyQVx1NUU5NFx1NzUyOFx1NzY4NFx1N0YxM1x1NUI1OFx1NzJCNlx1NjAwMVx1NEUwMFx1ODFGNFx1RkYwQ1x1OTA3Rlx1NTE0RFx1OTg5MVx1N0U0MVx1OTFDRFx1NjVCMFx1Njc4NFx1NUVGQVxuICAgIGNhY2hlRGlyOiBhcHBDYWNoZURpcixcbiAgICBkZWZpbmU6IHtcbiAgICAgIC8vIFx1NEUzQVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NzNBRlx1NTg4M1x1NjNEMFx1NEY5QiBwcm9jZXNzIFx1NUJGOVx1OEM2MVx1RkYwQ1dpbnN0b24gXHU5NzAwXHU4OTgxXHU1QjgzXG4gICAgICAncHJvY2Vzcy5lbnYnOiAne30nLFxuICAgICAgJ3Byb2Nlc3MucGxhdGZvcm0nOiBKU09OLnN0cmluZ2lmeSgnYnJvd3NlcicpLFxuICAgICAgJ3Byb2Nlc3MudmVyc2lvbic6IEpTT04uc3RyaW5naWZ5KCcnKSxcbiAgICB9LFxuICAgIHBsdWdpbnMsXG4gICAgZXNidWlsZDoge1xuICAgICAgY2hhcnNldDogJ3V0ZjgnLFxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3ODZFXHU0RkREIGVzYnVpbGQgXHU2QjYzXHU3ODZFXHU1OTA0XHU3NDA2IEpTWFx1RkYwQ1x1NEY3Rlx1NzUyOCBWdWUgXHU3Njg0IGggXHU1MUZEXHU2NTcwXHU4MDBDXHU0RTBEXHU2NjJGIFJlYWN0LmNyZWF0ZUVsZW1lbnRcbiAgICAgIC8vIFx1OEZEOVx1NjgzN1x1NTM3M1x1NEY3RiBlc2J1aWxkIFx1NTkwNFx1NzQwNlx1NjdEMFx1NEU5QiBKU1ggXHU2NTg3XHU0RUY2XHVGRjBDXHU0RTVGXHU0RjFBXHU0RjdGXHU3NTI4XHU2QjYzXHU3ODZFXHU3Njg0XHU4RjZDXHU2MzYyXHU2NUI5XHU1RjBGXG4gICAgICBqc3g6ICdwcmVzZXJ2ZScsIC8vIFx1NEZERFx1NzU1OSBKU1hcdUZGMENcdThCQTkgdnVlSnN4IFx1NjNEMlx1NEVGNlx1NTkwNFx1NzQwNlxuICAgICAganN4RmFjdG9yeTogJ2gnLCAvLyBcdTRGN0ZcdTc1MjggVnVlIFx1NzY4NCBoIFx1NTFGRFx1NjU3MFx1NEY1Q1x1NEUzQSBKU1ggXHU1REU1XHU1MzgyXHU1MUZEXHU2NTcwXG4gICAgICBqc3hGcmFnbWVudDogJ0ZyYWdtZW50JywgLy8gXHU0RjdGXHU3NTI4IFZ1ZSBcdTc2ODQgRnJhZ21lbnRcbiAgICB9LFxuICAgIHNlcnZlcjogc2VydmVyQ29uZmlnLFxuICAgIHByZXZpZXc6IHByZXZpZXdDb25maWcsXG4gICAgb3B0aW1pemVEZXBzOiBvcHRpbWl6ZURlcHNDb25maWcsXG4gICAgY3NzOiBjc3NDb25maWcsXG4gICAgYnVpbGQ6IGJ1aWxkQ29uZmlnLFxuICB9O1xuXG4gIC8vIFx1NjYwRVx1Nzg2RVx1NTkwNFx1NzQwNlx1NTNFRlx1OTAwOVx1NUM1RVx1NjAyN1x1NzY4NCB1bmRlZmluZWRcdUZGMDhleGFjdE9wdGlvbmFsUHJvcGVydHlUeXBlc1x1RkYwOVxuICBpZiAoZmluYWxSZXNvbHZlICE9PSB1bmRlZmluZWQpIHtcbiAgICBjb25maWcucmVzb2x2ZSA9IGZpbmFsUmVzb2x2ZTtcbiAgfVxuXG4gIHJldHVybiBjb25maWc7XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcdXRpbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHV0aWxzXFxcXHBhdGgtaGVscGVycy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvdXRpbHMvcGF0aC1oZWxwZXJzLnRzXCI7LyoqXG4gKiBcdThERUZcdTVGODRcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcbiAqIFx1NjNEMFx1NEY5Qlx1N0VERlx1NEUwMFx1NzY4NFx1OERFRlx1NUY4NFx1ODlFM1x1Njc5MFx1NTFGRFx1NjU3MFx1RkYwQ1x1NzUyOFx1NEU4RSBWaXRlIFx1OTE0RFx1N0Y2RVx1NEUyRFx1NzY4NFx1NTIyQlx1NTQwRFx1NTQ4Q1x1OERFRlx1NUY4NFx1ODlFM1x1Njc5MFxuICovXG5cbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcblxuLyoqXG4gKiBcdTUyMUJcdTVFRkFcdThERUZcdTVGODRcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcbiAqIEBwYXJhbSBhcHBEaXIgXHU1RTk0XHU3NTI4XHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XG4gKiBAcmV0dXJucyBcdThERUZcdTVGODRcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcdTVCRjlcdThDNjFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBhdGhIZWxwZXJzKGFwcERpcjogc3RyaW5nKSB7XG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTBcdTVFOTRcdTc1Mjggc3JjIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFxuICAgKi9cbiAgY29uc3Qgd2l0aFNyYyA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZykgPT4gcmVzb2x2ZShhcHBEaXIsIHJlbGF0aXZlUGF0aCk7XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MCBwYWNrYWdlcyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcbiAgICovXG4gIGNvbnN0IHdpdGhQYWNrYWdlcyA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZykgPT4gXG4gICAgcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9wYWNrYWdlcycsIHJlbGF0aXZlUGF0aCk7XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MFx1OTg3OVx1NzZFRVx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFxuICAgKi9cbiAgY29uc3Qgd2l0aFJvb3QgPSAocmVsYXRpdmVQYXRoOiBzdHJpbmcpID0+IFxuICAgIHJlc29sdmUoYXBwRGlyLCAnLi4vLi4nLCByZWxhdGl2ZVBhdGgpO1xuXG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTAgY29uZmlncyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcbiAgICovXG4gIGNvbnN0IHdpdGhDb25maWdzID0gKHJlbGF0aXZlUGF0aDogc3RyaW5nKSA9PiBcbiAgICByZXNvbHZlKGFwcERpciwgJy4uLy4uL2NvbmZpZ3MnLCByZWxhdGl2ZVBhdGgpO1xuXG4gIHJldHVybiB7IHdpdGhTcmMsIHdpdGhQYWNrYWdlcywgd2l0aFJvb3QsIHdpdGhDb25maWdzIH07XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcYXV0by1pbXBvcnQuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3MvYXV0by1pbXBvcnQuY29uZmlnLnRzXCI7XHVGRUZGLyoqXG4gKiBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTkxNERcdTdGNkVcdTZBMjFcdTY3N0ZcbiAqIFx1NEY5Qlx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1RkYwOGFkbWluLWFwcCwgbG9naXN0aWNzLWFwcCBcdTdCNDlcdUZGMDlcdTRGN0ZcdTc1MjhcbiAqL1xuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSc7XG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJztcbmltcG9ydCB7IEVsZW1lbnRQbHVzUmVzb2x2ZXIgfSBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnMnO1xuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBBdXRvIEltcG9ydCBcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUF1dG9JbXBvcnRDb25maWcoKSB7XG4gIHJldHVybiBBdXRvSW1wb3J0KHtcbiAgICBpbXBvcnRzOiBbXG4gICAgICAndnVlJyxcbiAgICAgICd2dWUtcm91dGVyJyxcbiAgICAgICdwaW5pYScsXG4gICAgICB7XG4gICAgICAgICdAYnRjL3NoYXJlZC1jb3JlJzogW1xuICAgICAgICAgICd1c2VDcnVkJyxcbiAgICAgICAgICAndXNlRGljdCcsXG4gICAgICAgICAgJ3VzZVBlcm1pc3Npb24nLFxuICAgICAgICAgICd1c2VSZXF1ZXN0JyxcbiAgICAgICAgICAnY3JlYXRlSTE4blBsdWdpbicsXG4gICAgICAgICAgJ3VzZUkxOG4nLFxuICAgICAgICBdLFxuICAgICAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnOiBbXG4gICAgICAgICAgJ2Zvcm1hdERhdGUnLFxuICAgICAgICAgICdmb3JtYXREYXRlVGltZScsXG4gICAgICAgICAgJ2Zvcm1hdE1vbmV5JyxcbiAgICAgICAgICAnZm9ybWF0TnVtYmVyJyxcbiAgICAgICAgICAnaXNFbWFpbCcsXG4gICAgICAgICAgJ2lzUGhvbmUnLFxuICAgICAgICAgICdzdG9yYWdlJyxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgXSxcblxuICAgIHJlc29sdmVyczogW1xuICAgICAgRWxlbWVudFBsdXNSZXNvbHZlcih7XG4gICAgICAgIGltcG9ydFN0eWxlOiBmYWxzZSwgLy8gXHU3OTgxXHU3NTI4XHU2MzA5XHU5NzAwXHU2ODM3XHU1RjBGXHU1QkZDXHU1MTY1XG4gICAgICB9KSxcbiAgICBdLFxuXG4gICAgZHRzOiAnc3JjL2F1dG8taW1wb3J0cy5kLnRzJyxcblxuICAgIGVzbGludHJjOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZmlsZXBhdGg6ICcuLy5lc2xpbnRyYy1hdXRvLWltcG9ydC5qc29uJyxcbiAgICB9LFxuXG4gICAgdnVlVGVtcGxhdGU6IHRydWUsXG4gIH0pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudHNDb25maWdPcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1OTg5RFx1NTkxNlx1NzY4NFx1N0VDNFx1NEVGNlx1NzZFRVx1NUY1NVx1RkYwOFx1NzUyOFx1NEU4RVx1NTdERlx1N0VBN1x1N0VDNFx1NEVGNlx1RkYwOVxuICAgKi9cbiAgZXh0cmFEaXJzPzogc3RyaW5nW107XG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdTVCRkNcdTUxNjVcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdTVFOTNcbiAgICovXG4gIGluY2x1ZGVTaGFyZWQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBDb21wb25lbnRzIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1OTE0RFx1N0Y2RVxuICogQHBhcmFtIG9wdGlvbnMgXHU5MTREXHU3RjZFXHU5MDA5XHU5ODc5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRzQ29uZmlnKG9wdGlvbnM6IENvbXBvbmVudHNDb25maWdPcHRpb25zID0ge30pIHtcbiAgY29uc3QgeyBleHRyYURpcnMgPSBbXSwgaW5jbHVkZVNoYXJlZCA9IHRydWUgfSA9IG9wdGlvbnM7XG5cbiAgY29uc3QgZGlycyA9IFtcbiAgICAnc3JjL2NvbXBvbmVudHMnLCAvLyBcdTVFOTRcdTc1MjhcdTdFQTdcdTdFQzRcdTRFRjZcbiAgICAuLi5leHRyYURpcnMsIC8vIFx1OTg5RFx1NTkxNlx1NzY4NFx1NTdERlx1N0VBN1x1N0VDNFx1NEVGNlx1NzZFRVx1NUY1NVxuICBdO1xuXG4gIC8vIFx1NTk4Mlx1Njc5Q1x1NTMwNVx1NTQyQlx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1RkYwQ1x1NkRGQlx1NTJBMFx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NTIwNlx1N0VDNFx1NzZFRVx1NUY1NVxuICBpZiAoaW5jbHVkZVNoYXJlZCkge1xuICAgIC8vIFx1NkRGQlx1NTJBMFx1NTIwNlx1N0VDNFx1NzZFRVx1NUY1NVx1RkYwQ1x1NjUyRlx1NjMwMVx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVxuICAgIGRpcnMucHVzaChcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9iYXNpYycsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvbGF5b3V0JyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9uYXZpZ2F0aW9uJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9mb3JtJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9kYXRhJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9mZWVkYmFjaycsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvb3RoZXJzJ1xuICAgICk7XG4gIH1cblxuICByZXR1cm4gQ29tcG9uZW50cyh7XG4gICAgcmVzb2x2ZXJzOiBbXG4gICAgICBFbGVtZW50UGx1c1Jlc29sdmVyKHtcbiAgICAgICAgaW1wb3J0U3R5bGU6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTYzMDlcdTk3MDBcdTY4MzdcdTVGMEZcdTVCRkNcdTUxNjVcdUZGMENcdTkwN0ZcdTUxNEQgVml0ZSByZWxvYWRpbmdcbiAgICAgIH0pLFxuICAgICAgLy8gXHU4MUVBXHU1QjlBXHU0RTQ5XHU4OUUzXHU2NzkwXHU1NjY4XHVGRjFBQGJ0Yy9zaGFyZWQtY29tcG9uZW50c1xuICAgICAgKGNvbXBvbmVudE5hbWUpID0+IHtcbiAgICAgICAgLy8gXHU1QzA2IGtlYmFiLWNhc2UgXHU4RjZDXHU2MzYyXHU0RTNBIFBhc2NhbENhc2VcbiAgICAgICAgLy8gXHU0RjhCXHU1OTgyOiBidGMtc3ZnIC0+IEJ0Y1N2Z1xuICAgICAgICBjb25zdCBjb252ZXJ0VG9QYXNjYWxDYXNlID0gKG5hbWU6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgnQnRjJykpIHtcbiAgICAgICAgICAgIHJldHVybiBuYW1lOyAvLyBcdTVERjJcdTdFQ0ZcdTY2MkYgUGFzY2FsQ2FzZVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCdidGMtJykpIHtcbiAgICAgICAgICAgIC8vIGJ0Yy1zdmcgLT4gQnRjU3ZnXG4gICAgICAgICAgICByZXR1cm4gbmFtZVxuICAgICAgICAgICAgICAuc3BsaXQoJy0nKVxuICAgICAgICAgICAgICAubWFwKHBhcnQgPT4gcGFydC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHBhcnQuc2xpY2UoMSkpXG4gICAgICAgICAgICAgIC5qb2luKCcnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGNvbXBvbmVudE5hbWUuc3RhcnRzV2l0aCgnQnRjJykgfHwgY29tcG9uZW50TmFtZS5zdGFydHNXaXRoKCdidGMtJykpIHtcbiAgICAgICAgICBjb25zdCBwYXNjYWxOYW1lID0gY29udmVydFRvUGFzY2FsQ2FzZShjb21wb25lbnROYW1lKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogcGFzY2FsTmFtZSxcbiAgICAgICAgICAgIGZyb206ICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJyxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIF0sXG4gICAgZHRzOiAnc3JjL2NvbXBvbmVudHMuZC50cycsXG4gICAgZGlycyxcbiAgICBleHRlbnNpb25zOiBbJ3Z1ZScsICd0c3gnXSwgLy8gXHU2NTJGXHU2MzAxIC52dWUgXHU1NDhDIC50c3ggXHU2NTg3XHU0RUY2XG4gICAgLy8gXHU1RjNBXHU1MjM2XHU5MUNEXHU2NUIwXHU2MjZCXHU2M0NGXHU3RUM0XHU0RUY2XG4gICAgZGVlcDogdHJ1ZSxcbiAgICAvLyBcdTUzMDVcdTU0MkJcdTYyNDBcdTY3MDkgQnRjIFx1NUYwMFx1NTkzNFx1NzY4NFx1N0VDNFx1NEVGNlxuICAgIGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC50c3gkLywgL0J0Y1tBLVpdLywgL2J0Yy1bYS16XS9dLFxuICB9KTtcbn1cbi8vIFVURi04IGVuY29kaW5nIGZpeFxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlLWFwcC1jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlLWFwcC1jb25maWcudHNcIjsvKipcbiAqIFZpdGUgXHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHU4Rjg1XHU1MkE5XHU1MUZEXHU2NTcwXG4gKiBcdTc1MjhcdTRFOEVcdTRFQ0VcdTdFREZcdTRFMDBcdTkxNERcdTdGNkVcdTRFMkRcdTgzQjdcdTUzRDZcdTVFOTRcdTc1MjhcdTc2ODRcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcbiAqL1xuXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBnZXRBcHBDb25maWcgfSBmcm9tICcuLi9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMvY29uZmlncy9hcHAtZW52LmNvbmZpZyc7XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHVGRjA4XHU3NTI4XHU0RThFIHZpdGUuY29uZmlnLnRzXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRWaXRlQXBwQ29uZmlnKGFwcE5hbWU6IHN0cmluZyk6IHtcbiAgZGV2UG9ydDogbnVtYmVyO1xuICBkZXZIb3N0OiBzdHJpbmc7XG4gIHByZVBvcnQ6IG51bWJlcjtcbiAgcHJlSG9zdDogc3RyaW5nO1xuICBwcm9kSG9zdDogc3RyaW5nO1xuICBtYWluQXBwT3JpZ2luOiBzdHJpbmc7XG59IHtcbiAgY29uc3QgYXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnKGFwcE5hbWUpO1xuICBpZiAoIWFwcENvbmZpZykge1xuICAgIHRocm93IG5ldyBFcnJvcihgXHU2NzJBXHU2MjdFXHU1MjMwICR7YXBwTmFtZX0gXHU3Njg0XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFYCk7XG4gIH1cblxuICBjb25zdCBtYWluQXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnKCdtYWluLWFwcCcpO1xuICBjb25zdCBtYWluQXBwT3JpZ2luID0gbWFpbkFwcENvbmZpZ1xuICAgID8gYGh0dHA6Ly8ke21haW5BcHBDb25maWcucHJlSG9zdH06JHttYWluQXBwQ29uZmlnLnByZVBvcnR9YFxuICAgIDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NDE4MCc7XG5cbiAgcmV0dXJuIHtcbiAgICBkZXZQb3J0OiBwYXJzZUludChhcHBDb25maWcuZGV2UG9ydCwgMTApLFxuICAgIGRldkhvc3Q6IGFwcENvbmZpZy5kZXZIb3N0LFxuICAgIHByZVBvcnQ6IHBhcnNlSW50KGFwcENvbmZpZy5wcmVQb3J0LCAxMCksXG4gICAgcHJlSG9zdDogYXBwQ29uZmlnLnByZUhvc3QsXG4gICAgcHJvZEhvc3Q6IGFwcENvbmZpZy5wcm9kSG9zdCxcbiAgICBtYWluQXBwT3JpZ2luLFxuICB9O1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1N0M3Qlx1NTc4QlxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXG4gKiBAcmV0dXJucyBcdTVFOTRcdTc1MjhcdTdDN0JcdTU3OEJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcFR5cGUoYXBwTmFtZTogc3RyaW5nKTogJ21haW4nIHwgJ3N1YicgfCAnbGF5b3V0JyB7XG4gIGlmIChhcHBOYW1lID09PSAnbWFpbi1hcHAnKSByZXR1cm4gJ21haW4nO1xuICBpZiAoYXBwTmFtZSA9PT0gJ2xheW91dC1hcHAnKSByZXR1cm4gJ2xheW91dCc7XG4gIHJldHVybiAnc3ViJzsgLy8gXHU1MTc2XHU0RUQ2XHU5MEZEXHU2NjJGXHU1QjUwXHU1RTk0XHU3NTI4XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2IGJhc2UgVVJMXG4gKiBAcGFyYW0gYXBwTmFtZSBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcbiAqIEBwYXJhbSBpc1ByZXZpZXdCdWlsZCBcdTY2MkZcdTU0MjZcdTRFM0FcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcbiAqIEByZXR1cm5zIGJhc2UgVVJMXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRCYXNlVXJsKGFwcE5hbWU6IHN0cmluZywgaXNQcmV2aWV3QnVpbGQ6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG4gIGNvbnN0IGFwcENvbmZpZyA9IGdldEFwcENvbmZpZyhhcHBOYW1lKTtcbiAgaWYgKCFhcHBDb25maWcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFx1NjcyQVx1NjI3RVx1NTIzMCAke2FwcE5hbWV9IFx1NzY4NFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RWApO1xuICB9XG4gIFxuICAvLyBcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjhcdTdFRERcdTVCRjlcdThERUZcdTVGODRcbiAgaWYgKGlzUHJldmlld0J1aWxkKSB7XG4gICAgcmV0dXJuIGBodHRwOi8vJHthcHBDb25maWcucHJlSG9zdH06JHthcHBDb25maWcucHJlUG9ydH0vYDtcbiAgfVxuICBcbiAgLy8gXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjFBXHU0RjdGXHU3NTI4XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjA4XHU4QkE5XHU2RDRGXHU4OUM4XHU1NjY4XHU2ODM5XHU2MzZFXHU1N0RGXHU1NDBEXHU4MUVBXHU1MkE4XHU4OUUzXHU2NzkwXHVGRjA5XG4gIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NUI1MFx1NUU5NFx1NzUyOFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NzZGNFx1NjNBNVx1OTBFOFx1N0Y3Mlx1NTIzMFx1NUI1MFx1NTdERlx1NTQwRFx1NjgzOVx1NzZFRVx1NUY1NVx1RkYwOFx1NTk4MiBwcm9kdWN0aW9uLmJlbGxpcy5jb20uY25cdUZGMDlcbiAgcmV0dXJuICcvJztcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDYgcHVibGljRGlyIFx1OERFRlx1NUY4NFxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXG4gKiBAcGFyYW0gYXBwRGlyIFx1NUU5NFx1NzUyOFx1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICogQHJldHVybnMgcHVibGljRGlyIFx1OERFRlx1NUY4NFx1NjIxNiBmYWxzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHVibGljRGlyKGFwcE5hbWU6IHN0cmluZywgYXBwRGlyOiBzdHJpbmcpOiBzdHJpbmcgfCBmYWxzZSB7XG4gIC8vIG1haW4tYXBwXHUzMDAxYWRtaW4tYXBwIFx1NTQ4QyBzeXN0ZW0tYXBwIFx1NEY3Rlx1NzUyOFx1ODFFQVx1NURGMVx1NzY4NCBwdWJsaWMgXHU3NkVFXHU1RjU1XG4gIGlmIChhcHBOYW1lID09PSAnbWFpbi1hcHAnIHx8IGFwcE5hbWUgPT09ICdhZG1pbi1hcHAnIHx8IGFwcE5hbWUgPT09ICdzeXN0ZW0tYXBwJykge1xuICAgIHJldHVybiByZXNvbHZlKGFwcERpciwgJ3B1YmxpYycpO1xuICB9XG4gIFxuICAvLyBcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdTRGN0ZcdTc1MjhcdTUxNzFcdTRFQUJcdTc2ODQgcHVibGljIFx1NzZFRVx1NUY1NVxuICByZXR1cm4gcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9wdWJsaWMnKTtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHNyY1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHNyY1xcXFxjb25maWdzXFxcXGFwcC1lbnYuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9jb25maWdzL2FwcC1lbnYuY29uZmlnLnRzXCI7Ly8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU4RkQ5XHU5MUNDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IGxvZ2dlclx1RkYwQ1x1NTZFMFx1NEUzQVx1NUI1OFx1NTcyOFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1RkYxQVxuLy8gbG9nZ2VyIC0+IGVudi1pbmZvIC0+IHVuaWZpZWQtZW52LWNvbmZpZyAtPiBhcHAtZW52LmNvbmZpZyAtPiBsb2dnZXJcbi8vIFx1NTcyOFx1NkEyMVx1NTc1N1x1NTJBMFx1OEY3RFx1NzY4NFx1NjVFOVx1NjcxRlx1OTYzNlx1NkJCNVx1RkYwQ2xvZ2dlciBcdTUzRUZcdTgwRkRcdThGRDhcdTY3MkFcdTUyMURcdTU5Q0JcdTUzMTZcdUZGMENcdTYyNDBcdTRFRTVcdTc2RjRcdTYzQTVcdTRGN0ZcdTc1MjggY29uc29sZVxuLy8gY29uc29sZSBcdTY2MkZcdTUxNjhcdTVDNDBcdTVCRjlcdThDNjFcdUZGMENcdTU3MjhcdTZBMjFcdTU3NTdcdTUyQTBcdThGN0RcdTY1RjZcdTVDMzFcdTVERjJcdTdFQ0ZcdTVCNThcdTU3MjhcdUZGMENcdTRFMERcdTRGMUFcdTUzRDdcdTUyMzBcdTVGQUFcdTczQUZcdTRGOURcdThENTZcdTc2ODRcdTVGNzFcdTU0Q0Rcbi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwidml0ZS9jbGllbnRcIiAvPlxuXG4vKipcbiAqIFx1N0VERlx1NEUwMFx1NzY4NFx1NUU5NFx1NzUyOFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVxuICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU3Njg0XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU5MEZEXHU0RUNFXHU4RkQ5XHU5MUNDXHU4QkZCXHU1M0Q2XHVGRjBDXHU5MDdGXHU1MTREXHU0RThDXHU0RTQ5XHU2MDI3XG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBBcHBFbnZDb25maWcge1xuICBhcHBOYW1lOiBzdHJpbmc7XG4gIGRldkhvc3Q6IHN0cmluZztcbiAgZGV2UG9ydDogc3RyaW5nO1xuICBwcmVIb3N0OiBzdHJpbmc7XG4gIHByZVBvcnQ6IHN0cmluZztcbiAgcG9jSG9zdD86IHN0cmluZzsgLy8gUE9DIFx1NzNBRlx1NTg4M1x1NEY3Rlx1NzUyOFx1NUI1MFx1NTdERlx1NTQwRFx1RkYwOFx1NTk4MiBhZG1pbi5wb2MuYmVsbGlzLmNvbS5jblx1RkYwOVx1RkYwQ1x1NTNFRlx1OTAwOVx1RkYwQ1x1NjMwOVx1OTcwMFx1NTIxQlx1NUVGQVxuICBzaXRIb3N0Pzogc3RyaW5nOyAvLyBTSVQgXHU3M0FGXHU1ODgzXHU0RjdGXHU3NTI4XHU1QjUwXHU1N0RGXHU1NDBEXHVGRjA4XHU1OTgyIGFkbWluLnNpdC5iZWxsaXMuY29tLmNuXHVGRjA5XG4gIHRlc3RIb3N0Pzogc3RyaW5nOyAvLyBcdTZENEJcdThCRDVcdTczQUZcdTU4ODNcdTRGN0ZcdTc1MjhcdTVCNTBcdTU3REZcdTU0MERcdUZGMDhcdTU5ODIgYWRtaW4udGVzdC5iZWxsaXMuY29tLmNuXHVGRjA5XHVGRjBDXHU0RkREXHU3NTU5XHU0RjVDXHU0RTNBIFVBVCBcdTc2ODRcdTUyMkJcdTU0MERcbiAgdWF0SG9zdD86IHN0cmluZzsgLy8gVUFUIFx1NzNBRlx1NTg4M1x1NEY3Rlx1NzUyOFx1NUI1MFx1NTdERlx1NTQwRFx1RkYwOFx1NTk4MiBhZG1pbi51YXQuYmVsbGlzLmNvbS5jblx1RkYwOVxuICBwcm9kSG9zdDogc3RyaW5nO1xufVxuXG4vKipcbiAqIFx1NEUzQlx1NUU5NFx1NzUyOFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVxuICovXG5jb25zdCBNQUlOX0FQUF9DT05GSUc6IEFwcEVudkNvbmZpZyA9IHtcbiAgYXBwTmFtZTogJ21haW4tYXBwJyxcbiAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgZGV2UG9ydDogJzgwODAnLFxuICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgcHJlUG9ydDogJzQxODAnLFxuICBwb2NIb3N0OiAncG9jLmJlbGxpcy5jb20uY24nLFxuICBzaXRIb3N0OiAnc2l0LmJlbGxpcy5jb20uY24nLFxuICB0ZXN0SG9zdDogJ3Rlc3QuYmVsbGlzLmNvbS5jbicsXG4gIHVhdEhvc3Q6ICd1YXQuYmVsbGlzLmNvbS5jbicsXG4gIHByb2RIb3N0OiAnYmVsbGlzLmNvbS5jbicsXG59O1xuXG4vKipcbiAqIFx1NEUxQVx1NTJBMVx1NUI1MFx1NUU5NFx1NzUyOFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVx1RkYwOFx1NjMwOVx1NUI1N1x1NkJDRFx1OTg3QVx1NUU4Rlx1RkYwOVxuICovXG5jb25zdCBCVVNJTkVTU19BUFBfQ09ORklHUzogQXBwRW52Q29uZmlnW10gPSBbXG4gIHtcbiAgICBhcHBOYW1lOiAnYWRtaW4tYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDgxJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4MScsXG4gICAgcG9jSG9zdDogJ2FkbWluLnBvYy5iZWxsaXMuY29tLmNuJyxcbiAgICBzaXRIb3N0OiAnYWRtaW4uc2l0LmJlbGxpcy5jb20uY24nLFxuICAgIHRlc3RIb3N0OiAnYWRtaW4udGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICB1YXRIb3N0OiAnYWRtaW4udWF0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnYWRtaW4uYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnZGFzaGJvYXJkLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MicsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODInLFxuICAgIHBvY0hvc3Q6ICdkYXNoYm9hcmQucG9jLmJlbGxpcy5jb20uY24nLFxuICAgIHNpdEhvc3Q6ICdkYXNoYm9hcmQuc2l0LmJlbGxpcy5jb20uY24nLFxuICAgIHRlc3RIb3N0OiAnZGFzaGJvYXJkLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgdWF0SG9zdDogJ2Rhc2hib2FyZC51YXQuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdkYXNoYm9hcmQuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnZW5naW5lZXJpbmctYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDgzJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4MycsXG4gICAgcG9jSG9zdDogJ2VuZ2luZWVyaW5nLnBvYy5iZWxsaXMuY29tLmNuJyxcbiAgICBzaXRIb3N0OiAnZW5naW5lZXJpbmcuc2l0LmJlbGxpcy5jb20uY24nLFxuICAgIHRlc3RIb3N0OiAnZW5naW5lZXJpbmcudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICB1YXRIb3N0OiAnZW5naW5lZXJpbmcudWF0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnZW5naW5lZXJpbmcuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnZmluYW5jZS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODQnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg0JyxcbiAgICBwb2NIb3N0OiAnZmluYW5jZS5wb2MuYmVsbGlzLmNvbS5jbicsXG4gICAgc2l0SG9zdDogJ2ZpbmFuY2Uuc2l0LmJlbGxpcy5jb20uY24nLFxuICAgIHRlc3RIb3N0OiAnZmluYW5jZS50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHVhdEhvc3Q6ICdmaW5hbmNlLnVhdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ2ZpbmFuY2UuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnbG9naXN0aWNzLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4NicsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODYnLFxuICAgIHBvY0hvc3Q6ICdsb2dpc3RpY3MucG9jLmJlbGxpcy5jb20uY24nLFxuICAgIHNpdEhvc3Q6ICdsb2dpc3RpY3Muc2l0LmJlbGxpcy5jb20uY24nLFxuICAgIHRlc3RIb3N0OiAnbG9naXN0aWNzLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgdWF0SG9zdDogJ2xvZ2lzdGljcy51YXQuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdsb2dpc3RpY3MuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnb3BlcmF0aW9ucy1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODgnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg4JyxcbiAgICBwb2NIb3N0OiAnb3BlcmF0aW9ucy5wb2MuYmVsbGlzLmNvbS5jbicsXG4gICAgc2l0SG9zdDogJ29wZXJhdGlvbnMuc2l0LmJlbGxpcy5jb20uY24nLFxuICAgIHRlc3RIb3N0OiAnb3BlcmF0aW9ucy50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHVhdEhvc3Q6ICdvcGVyYXRpb25zLnVhdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ29wZXJhdGlvbnMuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAncGVyc29ubmVsLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4OScsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODknLFxuICAgIHBvY0hvc3Q6ICdwZXJzb25uZWwucG9jLmJlbGxpcy5jb20uY24nLFxuICAgIHNpdEhvc3Q6ICdwZXJzb25uZWwuc2l0LmJlbGxpcy5jb20uY24nLFxuICAgIHRlc3RIb3N0OiAncGVyc29ubmVsLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgdWF0SG9zdDogJ3BlcnNvbm5lbC51YXQuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdwZXJzb25uZWwuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAncHJvZHVjdGlvbi1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwOTYnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTkwJyxcbiAgICBwb2NIb3N0OiAncHJvZHVjdGlvbi5wb2MuYmVsbGlzLmNvbS5jbicsXG4gICAgc2l0SG9zdDogJ3Byb2R1Y3Rpb24uc2l0LmJlbGxpcy5jb20uY24nLFxuICAgIHRlc3RIb3N0OiAncHJvZHVjdGlvbi50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHVhdEhvc3Q6ICdwcm9kdWN0aW9uLnVhdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ3Byb2R1Y3Rpb24uYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAncXVhbGl0eS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwOTEnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTkxJyxcbiAgICBwb2NIb3N0OiAncXVhbGl0eS5wb2MuYmVsbGlzLmNvbS5jbicsXG4gICAgc2l0SG9zdDogJ3F1YWxpdHkuc2l0LmJlbGxpcy5jb20uY24nLFxuICAgIHRlc3RIb3N0OiAncXVhbGl0eS50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHVhdEhvc3Q6ICdxdWFsaXR5LnVhdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ3F1YWxpdHkuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnc3lzdGVtLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA5MicsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxOTInLFxuICAgIHBvY0hvc3Q6ICdzeXN0ZW0ucG9jLmJlbGxpcy5jb20uY24nLFxuICAgIHNpdEhvc3Q6ICdzeXN0ZW0uc2l0LmJlbGxpcy5jb20uY24nLFxuICAgIHRlc3RIb3N0OiAnc3lzdGVtLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgdWF0SG9zdDogJ3N5c3RlbS51YXQuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdzeXN0ZW0uYmVsbGlzLmNvbS5jbicsXG4gIH0sXG5dO1xuXG4vKipcbiAqIFx1NzI3OVx1NkI4QVx1NUU5NFx1NzUyOFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVx1RkYwOFx1NjMwOVx1NUI1N1x1NkJDRFx1OTg3QVx1NUU4Rlx1RkYwOVxuICovXG5jb25zdCBTUEVDSUFMX0FQUF9DT05GSUdTOiBBcHBFbnZDb25maWdbXSA9IFtcbiAge1xuICAgIGFwcE5hbWU6ICdkb2NzLWFwcCcsXG4gICAgZGV2SG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgZGV2UG9ydDogJzgwOTMnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTkzJyxcbiAgICBwb2NIb3N0OiAnZG9jcy5wb2MuYmVsbGlzLmNvbS5jbicsXG4gICAgc2l0SG9zdDogJ2RvY3Muc2l0LmJlbGxpcy5jb20uY24nLFxuICAgIHRlc3RIb3N0OiAnZG9jcy50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHVhdEhvc3Q6ICdkb2NzLnVhdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ2RvY3MuYmVsbGlzLmNvbS5jbicsXG4gIH0sXG4gIHtcbiAgICBhcHBOYW1lOiAnaG9tZS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODUnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg1JyxcbiAgICBwb2NIb3N0OiAnd3d3LnBvYy5iZWxsaXMuY29tLmNuJyxcbiAgICBzaXRIb3N0OiAnd3d3LnNpdC5iZWxsaXMuY29tLmNuJyxcbiAgICB0ZXN0SG9zdDogJ3d3dy50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHVhdEhvc3Q6ICd3d3cudWF0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnd3d3LmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2xheW91dC1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwOTQnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTk0JyxcbiAgICBwb2NIb3N0OiAnbGF5b3V0LnBvYy5iZWxsaXMuY29tLmNuJyxcbiAgICBzaXRIb3N0OiAnbGF5b3V0LnNpdC5iZWxsaXMuY29tLmNuJyxcbiAgICB0ZXN0SG9zdDogJ2xheW91dC50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHVhdEhvc3Q6ICdsYXlvdXQudWF0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnbGF5b3V0LmJlbGxpcy5jb20uY24nLFxuICB9LFxuXTtcblxuLyoqXG4gKiBcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTc2ODRcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcbiAqIFx1NTQwOFx1NUU3Nlx1NEUzQlx1NUU5NFx1NzUyOFx1MzAwMVx1NEUxQVx1NTJBMVx1NUU5NFx1NzUyOFx1NTQ4Q1x1NzI3OVx1NkI4QVx1NUU5NFx1NzUyOFxuICovXG5leHBvcnQgY29uc3QgQVBQX0VOVl9DT05GSUdTOiBBcHBFbnZDb25maWdbXSA9IFtcbiAgTUFJTl9BUFBfQ09ORklHLFxuICAuLi5CVVNJTkVTU19BUFBfQ09ORklHUyxcbiAgLi4uU1BFQ0lBTF9BUFBfQ09ORklHUyxcbl07XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHU4M0I3XHU1M0Q2XHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWcoYXBwTmFtZTogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5hcHBOYW1lID09PSBhcHBOYW1lKTtcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTVGMDBcdTUzRDFcdTdBRUZcdTUzRTNcdTUyMTdcdTg4NjhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbERldlBvcnRzKCk6IHN0cmluZ1tdIHtcbiAgLy8gXHU5NjMyXHU1RkExXHU2MDI3XHU2OEMwXHU2N0U1XHVGRjFBXHU0RjdGXHU3NTI4IHRyeS1jYXRjaCBcdTYzNTVcdTgzQjdcdTUzRUZcdTgwRkRcdTc2ODQgVERaIChUZW1wb3JhbCBEZWFkIFpvbmUpIFx1OTUxOVx1OEJFRlxuICAvLyBcdTU5ODJcdTY3OUMgQVBQX0VOVl9DT05GSUdTIFx1OEZEOFx1NkNBMVx1NjcwOVx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwOFx1NzUzMVx1NEU4RVx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1NjIxNlx1NkEyMVx1NTc1N1x1NTJBMFx1OEY3RFx1OTg3QVx1NUU4Rlx1RkYwOVx1RkYwQ1x1OEZENFx1NTZERVx1N0E3QVx1NjU3MFx1N0VDNFxuICB0cnkge1xuICAgIHJldHVybiBBUFBfRU5WX0NPTkZJR1MubWFwKChjb25maWcpID0+IGNvbmZpZy5kZXZQb3J0KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBSZWZlcmVuY2VFcnJvciAmJiBlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCdiZWZvcmUgaW5pdGlhbGl6YXRpb24nKSkge1xuICAgICAgaWYgKHR5cGVvZiBpbXBvcnQubWV0YSAhPT0gJ3VuZGVmaW5lZCcgJiYgaW1wb3J0Lm1ldGEuZW52ICYmIGltcG9ydC5tZXRhLmVudi5ERVYpIHtcbiAgICAgICAgLy8gXHU3NkY0XHU2M0E1XHU0RjdGXHU3NTI4IGNvbnNvbGUud2Fyblx1RkYwQ1x1OTA3Rlx1NTE0RFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1NlxuICAgICAgICBjb25zb2xlLndhcm4oJ1thcHAtZW52LmNvbmZpZ10gQVBQX0VOVl9DT05GSUdTIFx1NjcyQVx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwOFx1NTNFRlx1ODBGRFx1NjYyRlx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1RkYwOVx1RkYwQ1x1OEZENFx1NTZERVx1N0E3QVx1NjU3MFx1N0VDNCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICAvLyBcdTUxNzZcdTRFRDZcdTk1MTlcdThCRUZcdTkxQ0RcdTY1QjBcdTYyOUJcdTUxRkFcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NjI0MFx1NjcwOVx1OTg4NFx1ODlDOFx1N0FFRlx1NTNFM1x1NTIxN1x1ODg2OFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsUHJlUG9ydHMoKTogc3RyaW5nW10ge1xuICAvLyBcdTk2MzJcdTVGQTFcdTYwMjdcdTY4QzBcdTY3RTVcdUZGMUFcdTRGN0ZcdTc1MjggdHJ5LWNhdGNoIFx1NjM1NVx1ODNCN1x1NTNFRlx1ODBGRFx1NzY4NCBURFogKFRlbXBvcmFsIERlYWQgWm9uZSkgXHU5NTE5XHU4QkVGXG4gIC8vIFx1NTk4Mlx1Njc5QyBBUFBfRU5WX0NPTkZJR1MgXHU4RkQ4XHU2Q0ExXHU2NzA5XHU1MjFEXHU1OUNCXHU1MzE2XHVGRjA4XHU3NTMxXHU0RThFXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XHU2MjE2XHU2QTIxXHU1NzU3XHU1MkEwXHU4RjdEXHU5ODdBXHU1RThGXHVGRjA5XHVGRjBDXHU4RkQ0XHU1NkRFXHU3QTdBXHU2NTcwXHU3RUM0XG4gIHRyeSB7XG4gICAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5tYXAoKGNvbmZpZykgPT4gY29uZmlnLnByZVBvcnQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFJlZmVyZW5jZUVycm9yICYmIGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ2JlZm9yZSBpbml0aWFsaXphdGlvbicpKSB7XG4gICAgICBpZiAodHlwZW9mIGltcG9ydC5tZXRhICE9PSAndW5kZWZpbmVkJyAmJiBpbXBvcnQubWV0YS5lbnYgJiYgaW1wb3J0Lm1ldGEuZW52LkRFVikge1xuICAgICAgICAvLyBcdTc2RjRcdTYzQTVcdTRGN0ZcdTc1MjggY29uc29sZS53YXJuXHVGRjBDXHU5MDdGXHU1MTREXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XG4gICAgICAgIGNvbnNvbGUud2FybignW2FwcC1lbnYuY29uZmlnXSBBUFBfRU5WX0NPTkZJR1MgXHU2NzJBXHU1MjFEXHU1OUNCXHU1MzE2XHVGRjA4XHU1M0VGXHU4MEZEXHU2NjJGXHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XHVGRjA5XHVGRjBDXHU4RkQ0XHU1NkRFXHU3QTdBXHU2NTcwXHU3RUM0Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIC8vIFx1NTE3Nlx1NEVENlx1OTUxOVx1OEJFRlx1OTFDRFx1NjVCMFx1NjI5Qlx1NTFGQVxuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFXHU3QUVGXHU1M0UzXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWdCeURldlBvcnQocG9ydDogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5kZXZQb3J0ID09PSBwb3J0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcENvbmZpZ0J5UHJlUG9ydChwb3J0OiBzdHJpbmcpOiBBcHBFbnZDb25maWcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gQVBQX0VOVl9DT05GSUdTLmZpbmQoKGNvbmZpZykgPT4gY29uZmlnLnByZVBvcnQgPT09IHBvcnQpO1xufVxuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1NkQ0Qlx1OEJENVx1NzNBRlx1NTg4M1x1NUI1MFx1NTdERlx1NTQwRFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnQnlUZXN0SG9zdCh0ZXN0SG9zdDogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy50ZXN0SG9zdCA9PT0gdGVzdEhvc3QpO1xufVxuXG4vKipcbiAqIFx1NjgzOVx1NjM2RSBQT0MgXHU3M0FGXHU1ODgzXHU1QjUwXHU1N0RGXHU1NDBEXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWdCeVBvY0hvc3QocG9jSG9zdDogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5wb2NIb3N0ID09PSBwb2NIb3N0KTtcbn1cblxuLyoqXG4gKiBcdTY4MzlcdTYzNkUgU0lUIFx1NzNBRlx1NTg4M1x1NUI1MFx1NTdERlx1NTQwRFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnQnlTaXRIb3N0KHNpdEhvc3Q6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcuc2l0SG9zdCA9PT0gc2l0SG9zdCk7XG59XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFIFVBVCBcdTczQUZcdTU4ODNcdTVCNTBcdTU3REZcdTU0MERcdTgzQjdcdTUzRDZcdTVFOTRcdTc1MjhcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcENvbmZpZ0J5VWF0SG9zdCh1YXRIb3N0OiBzdHJpbmcpOiBBcHBFbnZDb25maWcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gQVBQX0VOVl9DT05GSUdTLmZpbmQoKGNvbmZpZykgPT4gY29uZmlnLnVhdEhvc3QgPT09IHVhdEhvc3QpO1xufVxuXG4vKipcbiAqIFx1NTIyNFx1NjVBRFx1NUU5NFx1NzUyOFx1NjYyRlx1NTQyNlx1NEUzQVx1NzI3OVx1NkI4QVx1NUU5NFx1NzUyOFx1RkYwOFx1NTcyOCBTUEVDSUFMX0FQUF9DT05GSUdTIFx1NEUyRFx1RkYwOVxuICogXHU3Mjc5XHU2QjhBXHU1RTk0XHU3NTI4XHU1MzA1XHU2MkVDXHVGRjFBZG9jcy1hcHAsIGhvbWUtYXBwLCBsYXlvdXQtYXBwXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1NwZWNpYWxBcHAoYXBwTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBTUEVDSUFMX0FQUF9DT05GSUdTLnNvbWUoKGNvbmZpZykgPT4gY29uZmlnLmFwcE5hbWUgPT09IGFwcE5hbWUpO1xufVxuXG4vKipcbiAqIFx1NTIyNFx1NjVBRFx1NUU5NFx1NzUyOFx1NjYyRlx1NTQyNlx1NEUzQVx1NEUxQVx1NTJBMVx1NUU5NFx1NzUyOFx1RkYwOFx1NTcyOCBCVVNJTkVTU19BUFBfQ09ORklHUyBcdTRFMkRcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQnVzaW5lc3NBcHAoYXBwTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBCVVNJTkVTU19BUFBfQ09ORklHUy5zb21lKChjb25maWcpID0+IGNvbmZpZy5hcHBOYW1lID09PSBhcHBOYW1lKTtcbn1cblxuLyoqXG4gKiBcdTY4MzlcdTYzNkVcdTVFOTRcdTc1MjggSUQgXHU1MjI0XHU2NUFEXHU2NjJGXHU1NDI2XHU0RTNBXHU3Mjc5XHU2QjhBXHU1RTk0XHU3NTI4XG4gKiBcdTVFOTRcdTc1MjggSUQgXHU2NjJGIGFwcE5hbWUgXHU1M0JCXHU2Mzg5ICctYXBwJyBcdTU0MEVcdTdGMDBcdTU0MEVcdTc2ODRcdTUwM0NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU3BlY2lhbEFwcEJ5SWQoYXBwSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBhcHBOYW1lID0gYCR7YXBwSWR9LWFwcGA7XG4gIHJldHVybiBpc1NwZWNpYWxBcHAoYXBwTmFtZSk7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxiYXNlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvYmFzZS5jb25maWcudHNcIjsvKipcbiAqIFx1NTdGQVx1Nzg0MFx1OTE0RFx1N0Y2RVx1NkEyMVx1NTc1N1xuICogXHU2M0QwXHU0RjlCXHU1MTZDXHU1MTcxXHU3Njg0XHU1MjJCXHU1NDBEXHU1NDhDIHJlc29sdmUgXHU5MTREXHU3RjZFXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBVc2VyQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgY3JlYXRlUGF0aEhlbHBlcnMgfSBmcm9tICcuL3V0aWxzL3BhdGgtaGVscGVycyc7XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU3ODQwXHU1MjJCXHU1NDBEXHU5MTREXHU3RjZFXG4gKiBAcGFyYW0gYXBwRGlyIFx1NUU5NFx1NzUyOFx1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXG4gKiBAcmV0dXJucyBcdTUyMkJcdTU0MERcdTkxNERcdTdGNkVcdTVCRjlcdThDNjFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJhc2VBbGlhc2VzKFxuICBhcHBEaXI6IHN0cmluZywgXG4gIF9hcHBOYW1lOiBzdHJpbmdcbik6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4ge1xuICBjb25zdCB7IHdpdGhTcmMsIHdpdGhSb290LCB3aXRoQ29uZmlncywgd2l0aFBhY2thZ2VzIH0gPSBjcmVhdGVQYXRoSGVscGVycyhhcHBEaXIpO1xuXG4gIGNvbnN0IGFsaWFzZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgJ0AnOiB3aXRoU3JjKCdzcmMnKSxcbiAgICAnQG1vZHVsZXMnOiB3aXRoU3JjKCdzcmMvbW9kdWxlcycpLFxuICAgICdAc2VydmljZXMnOiB3aXRoU3JjKCdzcmMvc2VydmljZXMnKSxcbiAgICAnQGNvbXBvbmVudHMnOiB3aXRoU3JjKCdzcmMvY29tcG9uZW50cycpLFxuICAgICdAdXRpbHMnOiB3aXRoU3JjKCdzcmMvdXRpbHMnKSxcbiAgICAnQGF1dGgnOiB3aXRoUm9vdCgnYXV0aCcpLFxuICAgICdAY29uZmlncyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvcmUvc3JjL2NvbmZpZ3MnKSxcbiAgICAnQGJ0Yy9hdXRoLXNoYXJlZCc6IHdpdGhSb290KCdhdXRoL3NoYXJlZCcpLFxuICAgIC8vIEBidGMvKiBcdTUzMDVcdTUyMkJcdTU0MERcdUZGMUFcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTYyNTNcdTUzMDVcdThGRDlcdTRFOUJcdTUzMDVcdUZGMENcdTYyNDBcdTRFRTVcdTU5Q0JcdTdFQzhcdTRGN0ZcdTc1MjhcdTUyMkJcdTU0MERcdTYzMDdcdTU0MTFcdTZFOTBcdTc4MDFcbiAgICAnQGJ0Yy9zaGFyZWQtY29yZSc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvcmUvc3JjJyksXG4gICAgJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYycpLFxuICAgICdAYnRjL3NoYXJlZC1yb3V0ZXInOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1yb3V0ZXIvc3JjJyksXG4gICAgLy8gXHU1NDExXHU1NDBFXHU1MTdDXHU1QkI5XHVGRjFBXHU1RTlGXHU1RjAzXHU1MzA1XHU3Njg0XHU1MjJCXHU1NDBEXHU2MzA3XHU1NDExXHU1RjUyXHU1RTc2XHU1NDBFXHU3Njg0XHU0RjREXHU3RjZFXG4gICAgJ0BidGMvc2hhcmVkLXV0aWxzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMvdXRpbHMnKSxcbiAgICAnQGJ0Yy9zaGFyZWQtcGx1Z2lucyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL3BsdWdpbnMnKSxcbiAgICAnQGJ0Yy9pMThuJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvaTE4bicpLFxuICAgICdAYnRjL3N1YmFwcC1tYW5pZmVzdHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYy9tYW5pZmVzdCcpLFxuICAgICdAYnRjL2Vudic6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvcmUvc3JjL2VudicpLFxuICAgIFxuICAgIC8vIHNoYXJlZC1jb21wb25lbnRzIFx1NTE4NVx1OTBFOFx1NEY3Rlx1NzUyOFx1NzY4NFx1NTIyQlx1NTQwRFx1RkYwOFx1NzUyOFx1NEU4RVx1ODlFM1x1Njc5MCBzaGFyZWQtY29tcG9uZW50cyBcdTUxODVcdTkwRThcdTc2ODRcdTVCRkNcdTUxNjVcdUZGMDlcbiAgICAnQGJ0Yy1jb21tb24nOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jb21tb24nKSxcbiAgICAnQGJ0Yy1jb21wb25lbnRzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cycpLFxuICAgICdAYnRjLWNydWQnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jcnVkJyksXG4gICAgJ0BidGMtc3R5bGVzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvc3R5bGVzJyksXG4gICAgJ0BidGMtbG9jYWxlcyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2xvY2FsZXMnKSxcbiAgICAnQGJ0Yy1hc3NldHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9hc3NldHMnKSxcbiAgICAnQGFzc2V0cyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2Fzc2V0cycpLCAvLyBAYXNzZXRzIFx1NTIyQlx1NTQwRFx1RkYwQ1x1NzUyOFx1NEU4RVx1NTZGRVx1NzI0N1x1OEQ0NFx1NkU5MFx1NUJGQ1x1NTE2NVxuICAgICdAYnRjLXV0aWxzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvdXRpbHMnKSxcbiAgICAnQHBsdWdpbnMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9wbHVnaW5zJyksXG4gICAgXG4gICAgLy8gXHU1NkZFXHU4ODY4XHU3NkY4XHU1MTczXHU1MjJCXHU1NDBEXG4gICAgJ0BjaGFydHMtdXRpbHMvY3NzLXZhcic6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9jc3MtdmFyJyksXG4gICAgJ0BjaGFydHMtdXRpbHMvY29sb3InOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvY29sb3InKSxcbiAgICAnQGNoYXJ0cy11dGlscy9ncmFkaWVudCc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9ncmFkaWVudCcpLFxuICAgICdAY2hhcnRzLWNvbXBvc2FibGVzL3VzZUNoYXJ0Q29tcG9uZW50Jzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL2NvbXBvc2FibGVzL3VzZUNoYXJ0Q29tcG9uZW50JyksXG4gICAgJ0BjaGFydHMtdHlwZXMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdHlwZXMnKSxcbiAgICAnQGNoYXJ0cy11dGlscyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscycpLFxuICAgICdAY2hhcnRzLWNvbXBvc2FibGVzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL2NvbXBvc2FibGVzJyksXG5cbiAgICAvLyBFbGVtZW50IFBsdXMgXHU1MjJCXHU1NDBEXHVGRjA4XHU1OUNCXHU3RUM4XHU0RjdGXHU3NTI4XHVGRjA5XG4gICAgJ2VsZW1lbnQtcGx1cy9lcyc6ICdlbGVtZW50LXBsdXMvZXMnLFxuICAgICdlbGVtZW50LXBsdXMvZGlzdCc6ICdlbGVtZW50LXBsdXMvZGlzdCcsXG4gIH07XG5cbiAgcmV0dXJuIGFsaWFzZXM7XG59XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU3ODQwIHJlc29sdmUgXHU5MTREXHU3RjZFXG4gKiBAcGFyYW0gYXBwRGlyIFx1NUU5NFx1NzUyOFx1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXG4gKiBAcmV0dXJucyByZXNvbHZlIFx1OTE0RFx1N0Y2RVx1NUJGOVx1OEM2MVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQmFzZVJlc29sdmUoXG4gIGFwcERpcjogc3RyaW5nLCBcbiAgYXBwTmFtZTogc3RyaW5nXG4pOiBVc2VyQ29uZmlnWydyZXNvbHZlJ10ge1xuICBjb25zdCB7IHdpdGhQYWNrYWdlcyB9ID0gY3JlYXRlUGF0aEhlbHBlcnMoYXBwRGlyKTtcbiAgY29uc3QgYWxpYXNlcyA9IGNyZWF0ZUJhc2VBbGlhc2VzKGFwcERpciwgYXBwTmFtZSk7XG4gIFxuICAvLyBcdTRGN0ZcdTc1MjhcdTY1NzBcdTdFQzRcdTVGNjJcdTVGMEZcdTc2ODRcdTUyMkJcdTU0MERcdUZGMENcdTc4NkVcdTRGRERcdTY2RjRcdTUxNzdcdTRGNTNcdTc2ODRcdTUyMkJcdTU0MERcdTRGMThcdTUxNDhcdTUzMzlcdTkxNERcbiAgLy8gVml0ZSBcdTRGMUFcdTYzMDlcdTY1NzBcdTdFQzRcdTk4N0FcdTVFOEZcdTUzMzlcdTkxNERcdUZGMENcdTdCMkNcdTRFMDBcdTRFMkFcdTUzMzlcdTkxNERcdTc2ODRcdTUyMkJcdTU0MERcdTRGMUFcdTg4QUJcdTRGN0ZcdTc1MjhcbiAgY29uc3QgYWxpYXNBcnJheTogQXJyYXk8eyBmaW5kOiBzdHJpbmcgfCBSZWdFeHA7IHJlcGxhY2VtZW50OiBzdHJpbmcgfT4gPSBbXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1QzA2IHV0aWwgXHU2NjIwXHU1QzA0XHU1MjMwIG5wbSBcdTUzMDVcdUZGMENcdTk2MzJcdTZCNjIgVml0ZSBcdTVDMDZcdTUxNzZcdTg5QzZcdTRFM0EgTm9kZS5qcyBcdTUxODVcdTdGNkVcdTZBMjFcdTU3NTdcdTVFNzZcdTU5MTZcdTkwRThcdTUzMTZcbiAgICAvLyBcdTk3MDBcdTg5ODFcdTY3RTVcdTYyN0Ugbm9kZV9tb2R1bGVzL3V0aWwgXHU3Njg0XHU1QjlFXHU5NjQ1XHU4REVGXHU1Rjg0XHVGRjA4XHU1M0VGXHU4MEZEXHU1NzI4XHU2ODM5XHU3NkVFXHU1RjU1XHU2MjE2XHU1RTk0XHU3NTI4XHU3NkVFXHU1RjU1XHVGRjA5XG4gICAge1xuICAgICAgZmluZDogL151dGlsJC8sXG4gICAgICByZXBsYWNlbWVudDogKCgpID0+IHtcbiAgICAgICAgLy8gXHU1QzFEXHU4QkQ1XHU0RUNFXHU1RTk0XHU3NTI4XHU3NkVFXHU1RjU1XHU2N0U1XHU2MjdFXG4gICAgICAgIGNvbnN0IGFwcFV0aWxQYXRoID0gcmVzb2x2ZShhcHBEaXIsICdub2RlX21vZHVsZXMvdXRpbCcpO1xuICAgICAgICBpZiAoZXhpc3RzU3luYyhhcHBVdGlsUGF0aCkpIHtcbiAgICAgICAgICByZXR1cm4gYXBwVXRpbFBhdGg7XG4gICAgICAgIH1cbiAgICAgICAgLy8gXHU1QzFEXHU4QkQ1XHU0RUNFXHU2ODM5XHU3NkVFXHU1RjU1XHU2N0U1XHU2MjdFXG4gICAgICAgIGNvbnN0IHJvb3RVdGlsUGF0aCA9IHJlc29sdmUoYXBwRGlyLCAnLi4vLi4vbm9kZV9tb2R1bGVzL3V0aWwnKTtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMocm9vdFV0aWxQYXRoKSkge1xuICAgICAgICAgIHJldHVybiByb290VXRpbFBhdGg7XG4gICAgICAgIH1cbiAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2MjdFXHU0RTBEXHU1MjMwXHVGRjBDXHU4RkQ0XHU1NkRFXHU1MzA1XHU1NDBEXHU4QkE5IFZpdGUgXHU4MUVBXHU1MkE4XHU4OUUzXHU2NzkwXHVGRjA4XHU1RTk0XHU4QkU1XHU1NzI4IG9wdGltaXplRGVwcy5pbmNsdWRlIFx1NEUyRFx1RkYwOVxuICAgICAgICByZXR1cm4gJ3V0aWwnO1xuICAgICAgfSkoKSxcbiAgICB9LFxuICAgIC8vIGxvY2FsZXMgXHU1QjUwXHU4REVGXHU1Rjg0XHU1MjJCXHU1NDBEXHVGRjA4XHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU0RjdGXHU3NTI4XHU1MjJCXHU1NDBEXHU2MzA3XHU1NDExXHU2RTkwXHU3ODAxXHVGRjA5XG4gICAge1xuICAgICAgZmluZDogJ0BidGMvc2hhcmVkLWNvcmUvbG9jYWxlcy96aC1DTicsXG4gICAgICByZXBsYWNlbWVudDogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMvYnRjL3BsdWdpbnMvaTE4bi9sb2NhbGVzL3poLUNOJyksXG4gICAgfSxcbiAgICB7XG4gICAgICBmaW5kOiAnQGJ0Yy9zaGFyZWQtY29yZS9sb2NhbGVzL2VuLVVTJyxcbiAgICAgIHJlcGxhY2VtZW50OiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYy9idGMvcGx1Z2lucy9pMThuL2xvY2FsZXMvZW4tVVMnKSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGZpbmQ6ICdAYnRjL3NoYXJlZC1jb21wb25lbnRzL2xvY2FsZXMvemgtQ04uanNvbicsXG4gICAgICByZXBsYWNlbWVudDogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvbG9jYWxlcy96aC1DTi5qc29uJyksXG4gICAgfSxcbiAgICB7XG4gICAgICBmaW5kOiAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cy9sb2NhbGVzL2VuLVVTLmpzb24nLFxuICAgICAgcmVwbGFjZW1lbnQ6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2xvY2FsZXMvZW4tVVMuanNvbicpLFxuICAgIH0sXG4gICAgLy8gXHU1MTc2XHU0RUQ2XHU1MjJCXHU1NDBEXHVGRjA4XHU0RUNFXHU1QkY5XHU4QzYxXHU4RjZDXHU2MzYyXHU0RTNBXHU2NTcwXHU3RUM0XHU1RjYyXHU1RjBGXHVGRjA5XG4gICAgLi4uT2JqZWN0LmVudHJpZXMoYWxpYXNlcykubWFwKChbZmluZCwgcmVwbGFjZW1lbnRdKSA9PiAoe1xuICAgICAgZmluZCxcbiAgICAgIHJlcGxhY2VtZW50LFxuICAgIH0pKSxcbiAgXTtcbiAgXG4gIHJldHVybiB7XG4gICAgYWxpYXM6IGFsaWFzQXJyYXksXG4gICAgZGVkdXBlOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3BpbmlhJywgJ2VsZW1lbnQtcGx1cycsICdAZWxlbWVudC1wbHVzL2ljb25zLXZ1ZSddLFxuICAgIGV4dGVuc2lvbnM6IFsnLm1qcycsICcuanMnLCAnLm10cycsICcudHMnLCAnLmpzeCcsICcudHN4JywgJy5qc29uJywgJy52dWUnXSxcbiAgICAvLyBcdTc4NkVcdTRGREQgVml0ZSBcdTRGMThcdTUxNDhcdTRGN0ZcdTc1MjggcGFja2FnZS5qc29uIFx1NzY4NCBleHBvcnRzIFx1OTE0RFx1N0Y2RVxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NkRGQlx1NTJBMCAnZGV2ZWxvcG1lbnQnIFx1Njc2MVx1NEVGNlx1RkYwQ1x1Nzg2RVx1NEZERFx1NTcyOFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NEUyRFx1NEY3Rlx1NzUyOFx1NkU5MFx1NzgwMVxuICAgIGNvbmRpdGlvbnM6IFsnZGV2ZWxvcG1lbnQnLCAnaW1wb3J0JywgJ21vZHVsZScsICdicm93c2VyJywgJ2RlZmF1bHQnXSxcbiAgfTtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXG1hbnVhbC1jaHVua3MudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvbWFudWFsLWNodW5rcy50c1wiOy8qKlxuICogbWFudWFsQ2h1bmtzIFx1N0I1Nlx1NzU2NVx1OTE0RFx1N0Y2RVxuICogXHU1QjlBXHU0RTQ5XHU0RUUzXHU3ODAxXHU1MjA2XHU1MjcyXHU3QjU2XHU3NTY1XHVGRjBDXHU1QzA2XHU0RTBEXHU1NDBDXHU3QzdCXHU1NzhCXHU3Njg0XHU0RUUzXHU3ODAxXHU2MjUzXHU1MzA1XHU1MjMwXHU0RTBEXHU1NDBDXHU3Njg0IGNodW5rXG4gKi9cblxuLyoqXG4gKiBcdTVFOTRcdTc1MjhcdTRGN0ZcdTc1MjhcdTYwQzVcdTUxQjVcdTkxNERcdTdGNkVcbiAqIFx1NUI5QVx1NEU0OVx1NTRFQVx1NEU5Qlx1NUU5NFx1NzUyOFx1NEY3Rlx1NzUyOFx1NTRFQVx1NEU5Qlx1NUU5M1x1RkYwQ1x1NzUyOFx1NEU4RVx1Njc2MVx1NEVGNlx1NjI1M1x1NTMwNVxuICovXG5jb25zdCBBUFBfVVNBR0U6IFJlY29yZDxzdHJpbmcsIHsgZWNoYXJ0czogYm9vbGVhbjsgbW9uYWNvOiBib29sZWFuOyB0aHJlZTogYm9vbGVhbiB9PiA9IHtcbiAgJ2xheW91dC1hcHAnOiB7IGVjaGFydHM6IHRydWUsIG1vbmFjbzogZmFsc2UsIHRocmVlOiBmYWxzZSB9LFxuICAnc3lzdGVtLWFwcCc6IHsgZWNoYXJ0czogdHJ1ZSwgbW9uYWNvOiBmYWxzZSwgdGhyZWU6IGZhbHNlIH0sXG4gICdhZG1pbi1hcHAnOiB7IGVjaGFydHM6IHRydWUsIG1vbmFjbzogZmFsc2UsIHRocmVlOiBmYWxzZSB9LFxuICAnZmluYW5jZS1hcHAnOiB7IGVjaGFydHM6IHRydWUsIG1vbmFjbzogZmFsc2UsIHRocmVlOiBmYWxzZSB9LFxuICAnbG9naXN0aWNzLWFwcCc6IHsgZWNoYXJ0czogdHJ1ZSwgbW9uYWNvOiBmYWxzZSwgdGhyZWU6IGZhbHNlIH0sXG4gICdxdWFsaXR5LWFwcCc6IHsgZWNoYXJ0czogdHJ1ZSwgbW9uYWNvOiBmYWxzZSwgdGhyZWU6IGZhbHNlIH0sXG4gICdwcm9kdWN0aW9uLWFwcCc6IHsgZWNoYXJ0czogdHJ1ZSwgbW9uYWNvOiBmYWxzZSwgdGhyZWU6IGZhbHNlIH0sXG4gICdlbmdpbmVlcmluZy1hcHAnOiB7IGVjaGFydHM6IHRydWUsIG1vbmFjbzogZmFsc2UsIHRocmVlOiBmYWxzZSB9LFxuICAnbW9uaXRvci1hcHAnOiB7IGVjaGFydHM6IHRydWUsIG1vbmFjbzogZmFsc2UsIHRocmVlOiBmYWxzZSB9LFxufTtcblxuLyoqXG4gKiBcdTUyMjRcdTY1QURcdTY2MkZcdTU0MjZcdTRFM0FcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcbiAqL1xuY29uc3QgaXNQcm9kdWN0aW9uID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJztcblxuLyoqXG4gKiBcdTUyMUJcdTVFRkEgbWFudWFsQ2h1bmtzIFx1N0I1Nlx1NzU2NVx1NTFGRFx1NjU3MFxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHVGRjA4XHU3NTI4XHU0RThFXHU4RkM3XHU2RUU0XHU3Mjc5XHU1QjlBXHU1RTk0XHU3NTI4XHU3Njg0IG1hbmlmZXN0XHVGRjA5XG4gKiBAcmV0dXJucyBtYW51YWxDaHVua3MgXHU1MUZEXHU2NTcwXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNYW51YWxDaHVua3NTdHJhdGVneShhcHBOYW1lOiBzdHJpbmcpIHtcbiAgY29uc3QgaXNMYXlvdXRBcHAgPSBhcHBOYW1lID09PSAnbGF5b3V0LWFwcCc7XG4gIGNvbnN0IGlzTWFpbkFwcCA9IGFwcE5hbWUgPT09ICdtYWluLWFwcCc7XG4gIGNvbnN0IGFwcFVzYWdlID0gQVBQX1VTQUdFW2FwcE5hbWVdIHx8IHsgZWNoYXJ0czogZmFsc2UsIG1vbmFjbzogZmFsc2UsIHRocmVlOiBmYWxzZSB9O1xuICAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTRFMTRcdTk3NUUgbGF5b3V0LWFwcCBcdTY1RjZcdUZGMENcdTUxNzFcdTRFQUJcdThENDRcdTZFOTBcdTRFMERcdTYyNTNcdTUzMDVcdUZGMDhcdTRFQ0UgbGF5b3V0LWFwcCBcdTUyQTBcdThGN0RcdUZGMDlcbiAgLy8gXHU0RjQ2IG1haW4tYXBwIFx1NEY1Q1x1NEUzQVx1NEUzQlx1NUU5NFx1NzUyOFx1RkYwQ1x1OTcwMFx1ODk4MVx1NzUxRlx1NjIxMFx1ODFFQVx1NURGMVx1NzY4NCBFUFMgXHU2NzBEXHU1MkExXG4gIGNvbnN0IHNraXBTaGFyZWRSZXNvdXJjZXMgPSBpc1Byb2R1Y3Rpb24gJiYgIWlzTGF5b3V0QXBwICYmICFpc01haW5BcHA7XG5cbiAgcmV0dXJuIChpZDogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcbiAgICAvLyAwLiBFUFMgXHU2NzBEXHU1MkExXHU1MzU1XHU3MkVDXHU2MjUzXHU1MzA1XHVGRjA4XHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU1MTcxXHU0RUFCXHVGRjBDXHU1RkM1XHU5ODdCXHU1NzI4XHU2NzAwXHU1MjREXHU5NzYyXHVGRjA5XG4gICAgaWYgKGlkLmluY2x1ZGVzKCd2aXJ0dWFsOmVwcycpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdcXFxcMHZpcnR1YWw6ZXBzJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ3NlcnZpY2VzL2VwcycpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdzZXJ2aWNlc1xcXFxlcHMnKSkge1xuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU3Njg0XHU1QjUwXHU1RTk0XHU3NTI4XHU0RTBEXHU1RTk0XHU4QkU1XHU1MThEXHU1MzU1XHU3MkVDXHU2MkM2XHU1MUZBIGVwcy1zZXJ2aWNlIGNodW5rXG4gICAgICAvLyBcdTU0MjZcdTUyMTlcdTVCNTBcdTVFOTRcdTc1MjhcdTUxNjVcdTUzRTNcdTRGMUFcdTRFQTdcdTc1MUZcdTVCRjlcdTgxRUFcdThFQUIgL2Fzc2V0cy9lcHMtc2VydmljZS14eHguanMgXHU3Njg0XHU1RjE1XHU3NTI4XHVGRjBDXHU1QkZDXHU4MUY0XCJcdTUxNzFcdTRFQUJcdTY3MkFcdTc1MUZcdTY1NDggKyA0MDRcIlx1OThDRVx1OTY2OVx1MzAwMlxuICAgICAgLy8gbGF5b3V0LWFwcCBcdThEMUZcdThEMjNcdTYzRDBcdTRGOUJcdTUxNzFcdTRFQUIgZXBzLXNlcnZpY2VcdUZGMENcdTVFNzZcdTVDMDZcdTY3MERcdTUyQTFcdTYzMDJcdTUyMzAgd2luZG93Ll9fQVBQX0VQU19TRVJWSUNFX19cdTMwMDJcbiAgICAgIC8vIG1haW4tYXBwIFx1NEY1Q1x1NEUzQVx1NEUzQlx1NUU5NFx1NzUyOFx1RkYwQ1x1OTcwMFx1ODk4MVx1NzUxRlx1NjIxMFx1ODFFQVx1NURGMVx1NzY4NCBFUFMgXHU2NzBEXHU1MkExXHVGRjA4XHU3MkVDXHU3QUNCXHU4RkQwXHU4ODRDXHU2NUY2XHU0RTBEXHU0RjlEXHU4RDU2IGxheW91dC1hcHBcdUZGMDlcbiAgICAgIGlmIChza2lwU2hhcmVkUmVzb3VyY2VzKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ2Vwcy1zZXJ2aWNlJztcbiAgICB9XG5cbiAgICAvLyAwLjMuIEF1dGggQVBJIFx1NTM1NVx1NzJFQ1x1NjI1M1x1NTMwNVx1RkYwOFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NTE3MVx1NEVBQlx1RkYwQ1x1NzUzMSBzeXN0ZW0tYXBwIFx1NjNEMFx1NEY5Qlx1RkYwOVxuICAgIGlmIChpZC5pbmNsdWRlcygnbW9kdWxlcy9hcGktc2VydmljZXMvYXV0aCcpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdtb2R1bGVzXFxcXGFwaS1zZXJ2aWNlc1xcXFxhdXRoJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ2FwaS1zZXJ2aWNlcy9hdXRoJykpIHtcbiAgICAgIHJldHVybiAnYXV0aC1hcGknO1xuICAgIH1cblxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQW1lbnVSZWdpc3RyeSBcdTRGOURcdThENTYgVnVlXHVGRjBDXHU1RkM1XHU5ODdCXHU1NDhDIHZlbmRvciBcdTRFMDBcdThENzdcdTYyNTNcdTUzMDVcdUZGMENcdTRFMERcdTgwRkRcdTUzNTVcdTcyRUNcdTYyNTNcdTUzMDVcdTUyMzAgbWVudS1yZWdpc3RyeVxuICAgIC8vIFx1OEZEOVx1NjgzN1x1Nzg2RVx1NEZERCBWdWUgXHU3Njg0IHJlZiBcdTU3MjggbWVudVJlZ2lzdHJ5IFx1NEY3Rlx1NzUyOFx1NEU0Qlx1NTI0RFx1NURGMlx1N0VDRlx1NTIxRFx1NTlDQlx1NTMxNlxuICAgIC8vIFx1NUZDNVx1OTg3Qlx1NTcyOFx1NjhDMFx1NjdFNSBsYXlvdXQtYnJpZGdlIFx1NEU0Qlx1NTI0RFx1NjhDMFx1NjdFNVx1RkYwQ1x1NTZFMFx1NEUzQSBsYXlvdXQtYnJpZGdlIFx1NEYxQVx1NUJGQ1x1NTE2NSBtZW51UmVnaXN0cnlcbiAgICBpZiAoaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3NyYy9zdG9yZS9tZW51UmVnaXN0cnknKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cy9zdG9yZS9tZW51UmVnaXN0cnknKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnc2hhcmVkLWNvbXBvbmVudHMvc3RvcmUvbWVudVJlZ2lzdHJ5JykpIHtcbiAgICAgIC8vIExheW91dC1BcHBcdUZGMUFcdTVDMDYgbWVudVJlZ2lzdHJ5IFx1NjI1M1x1NTMwNVx1NTIzMCB2ZW5kb3JcbiAgICAgIC8vIFx1NTE3Nlx1NEVENlx1NUU5NFx1NzUyOFx1RkYwOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1RkYwOVx1RkYxQVx1NEUwRFx1NjI1M1x1NTMwNVx1RkYwQ1x1NEVDRSBsYXlvdXQtYXBwIFx1NTJBMFx1OEY3RFxuICAgICAgaWYgKHNraXBTaGFyZWRSZXNvdXJjZXMpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAndmVuZG9yJztcbiAgICB9XG4gICAgXG4gICAgLy8gMC41LiBcdTgzRENcdTUzNTVcdTc2RjhcdTUxNzNcdTRFRTNcdTc4MDFcdTUzNTVcdTcyRUNcdTYyNTNcdTUzMDVcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTVDMDZcdTgzRENcdTUzNTVcdTc2RjhcdTUxNzNcdTc2ODRcdTRFRTNcdTc4MDFcdTYyNTNcdTUzMDVcdTUyMzAgbWVudS1yZWdpc3RyeSBjaHVua1x1RkYwQ1x1NEY0NiBtZW51UmVnaXN0cnkgXHU2NzJDXHU4RUFCXHU0RjlEXHU4RDU2IFZ1ZVx1RkYwQ1x1OTcwMFx1ODk4MVx1NjUzRVx1NTcyOCB2ZW5kb3IgXHU0RTRCXHU1NDBFXG4gICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBbWVudVJlZ2lzdHJ5IFx1NEY3Rlx1NzUyOCBWdWUgXHU3Njg0IHJlZlx1RkYwQ1x1NjI0MFx1NEVFNVx1NEUwRFx1ODBGRFx1NTM1NVx1NzJFQ1x1NjI1M1x1NTMwNVx1RkYwQ1x1NUU5NFx1OEJFNVx1NTQ4QyB2ZW5kb3IgXHU0RTAwXHU4RDc3XG4gICAgLy8gXHU1M0VBXHU1QzA2IG1hbmlmZXN0IFx1NjU3MFx1NjM2RVx1NTQ4QyBsYXlvdXQtYnJpZGdlIFx1NjI1M1x1NTMwNVx1NTIzMCBtZW51LXJlZ2lzdHJ5XG4gICAgLy8gXHU0RjQ2IGxheW91dC1icmlkZ2UgXHU0RjFBXHU1QkZDXHU1MTY1IG1lbnVSZWdpc3RyeVx1RkYwQ1x1NjI0MFx1NEVFNSBsYXlvdXQtYnJpZGdlIFx1NEU1Rlx1NUU5NFx1OEJFNVx1NjI1M1x1NTMwNVx1NTIzMCB2ZW5kb3JcbiAgICBpZiAoaWQuaW5jbHVkZXMoJ2NvbmZpZ3MvbGF5b3V0LWJyaWRnZScpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MvbGF5b3V0LWJyaWRnZScpKSB7XG4gICAgICAvLyBMYXlvdXQtQXBwXHVGRjFBbGF5b3V0LWJyaWRnZSBcdTVCRkNcdTUxNjUgbWVudVJlZ2lzdHJ5XHVGRjBDXHU2MjQwXHU0RUU1XHU0RTVGXHU1RTk0XHU4QkU1XHU2MjUzXHU1MzA1XHU1MjMwIHZlbmRvclxuICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU1RTk0XHU3NTI4XHVGRjA4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHVGRjA5XHVGRjFBXHU0RTBEXHU2MjUzXHU1MzA1XHVGRjBDXHU0RUNFIGxheW91dC1hcHAgXHU1MkEwXHU4RjdEXG4gICAgICBpZiAoc2tpcFNoYXJlZFJlc291cmNlcykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgcmV0dXJuICd2ZW5kb3InO1xuICAgIH1cbiAgICBcbiAgICAvLyBcdTU5MDRcdTc0MDYgc3ViYXBwLW1hbmlmZXN0c1x1RkYxQVx1NTNFQVx1NTMwNVx1NTQyQlx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1NzY4NCBtYW5pZmVzdFxuICAgIGlmIChpZC5pbmNsdWRlcygncGFja2FnZXMvc3ViYXBwLW1hbmlmZXN0cycpIHx8IGlkLmluY2x1ZGVzKCdAYnRjL3N1YmFwcC1tYW5pZmVzdHMnKSkge1xuICAgICAgLy8gXHU2MzkyXHU5NjY0XHU1MTc2XHU0RUQ2XHU1RTk0XHU3NTI4XHU3Njg0IG1hbmlmZXN0IEpTT04gXHU2NTg3XHU0RUY2XG4gICAgICBjb25zdCBvdGhlckFwcHMgPSBbJ2ZpbmFuY2UnLCAnbG9naXN0aWNzJywgJ3N5c3RlbScsICdxdWFsaXR5JywgJ2VuZ2luZWVyaW5nJywgJ3Byb2R1Y3Rpb24nLCAnbW9uaXRvcicsICdhZG1pbiddO1xuICAgICAgY29uc3QgY3VycmVudEFwcE5hbWUgPSBhcHBOYW1lLnJlcGxhY2UoJy1hcHAnLCAnJyk7XG4gICAgICBjb25zdCBzaG91bGRFeGNsdWRlID0gb3RoZXJBcHBzXG4gICAgICAgIC5maWx0ZXIoYXBwID0+IGFwcCAhPT0gY3VycmVudEFwcE5hbWUpXG4gICAgICAgIC5zb21lKGFwcCA9PiBpZC5pbmNsdWRlcyhgbWFuaWZlc3RzLyR7YXBwfS5qc29uYCkpO1xuICAgICAgXG4gICAgICBpZiAoc2hvdWxkRXhjbHVkZSkge1xuICAgICAgICAvLyBcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdTc2ODQgbWFuaWZlc3RcdUZGMENcdTRFMERcdTYyNTNcdTUzMDVcdTUyMzAgbWVudS1yZWdpc3RyeVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgLy8gTGF5b3V0LUFwcFx1RkYxQVx1NTNFQVx1NjI1M1x1NTMwNVx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1NzY4NCBtYW5pZmVzdCBcdTU0OENcdTUxNzFcdTRFQUJcdTRFRTNcdTc4MDFcbiAgICAgIC8vIFx1NTE3Nlx1NEVENlx1NUU5NFx1NzUyOFx1RkYwOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1RkYwOVx1RkYxQVx1NEUwRFx1NjI1M1x1NTMwNVx1RkYwQ1x1NEVDRSBsYXlvdXQtYXBwIFx1NTJBMFx1OEY3RFxuICAgICAgaWYgKHNraXBTaGFyZWRSZXNvdXJjZXMpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAnbWVudS1yZWdpc3RyeSc7XG4gICAgfVxuXG4gICAgLy8gMS4gXHU3MkVDXHU3QUNCXHU1OTI3XHU1RTkzXHVGRjFBRUNoYXJ0c1x1RkYwOFx1N0VBRiBlY2hhcnRzIFx1NTQ4QyB6cmVuZGVyXHVGRjBDXHU0RTBEXHU1MzA1XHU1NDJCIHZ1ZS1lY2hhcnRzXHVGRjA5XG4gICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZWNoYXJ0cycpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvenJlbmRlcicpKSB7XG4gICAgICAvLyBMYXlvdXQtQXBwXHVGRjFBXHU2QjYzXHU1RTM4XHU2MjUzXHU1MzA1XG4gICAgICAvLyBcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdUZGMUFcdTU5ODJcdTY3OUNcdTRGN0ZcdTc1MjggZWNoYXJ0c1x1RkYwQ1x1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NEUwRFx1NjI1M1x1NTMwNVx1RkYwOFx1NEVDRSBsYXlvdXQtYXBwIFx1NTJBMFx1OEY3RFx1RkYwOVx1RkYwQ1x1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NkI2M1x1NUUzOFx1NjI1M1x1NTMwNVxuICAgICAgaWYgKHNraXBTaGFyZWRSZXNvdXJjZXMgJiYgYXBwVXNhZ2UuZWNoYXJ0cykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1RTk0XHU3NTI4XHU0RTBEXHU0RjdGXHU3NTI4IGVjaGFydHNcdUZGMENcdTRFMERcdTYyNTNcdTUzMDVcbiAgICAgIGlmICghYXBwVXNhZ2UuZWNoYXJ0cykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgcmV0dXJuICdlY2hhcnRzLXZlbmRvcic7XG4gICAgfVxuXG4gICAgLy8gMi4gXHU1MTc2XHU0RUQ2XHU3MkVDXHU3QUNCXHU1OTI3XHU1RTkzXHVGRjA4XHU1QjhDXHU1MTY4XHU3MkVDXHU3QUNCXHVGRjA5LSBcdTY3NjFcdTRFRjZcdTYyNTNcdTUzMDVcbiAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9tb25hY28tZWRpdG9yJykpIHtcbiAgICAgIC8vIFx1NTNFQVx1NjcwOVx1NEY3Rlx1NzUyOFx1NzY4NFx1NUU5NFx1NzUyOFx1NjI0RFx1NjI1M1x1NTMwNVxuICAgICAgaWYgKCFhcHBVc2FnZS5tb25hY28pIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAnbGliLW1vbmFjbyc7XG4gICAgfVxuICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3RocmVlJykpIHtcbiAgICAgIC8vIFx1NTNFQVx1NjcwOVx1NEY3Rlx1NzUyOFx1NzY4NFx1NUU5NFx1NzUyOFx1NjI0RFx1NjI1M1x1NTMwNVxuICAgICAgaWYgKCFhcHBVc2FnZS50aHJlZSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgcmV0dXJuICdsaWItdGhyZWUnO1xuICAgIH1cblxuICAgIC8vIDMuIFZ1ZSBcdTc1MUZcdTYwMDFcdTVFOTMgKyBcdTYyNDBcdTY3MDlcdTRGOURcdThENTYgVnVlIFx1NzY4NFx1N0IyQ1x1NEUwOVx1NjVCOVx1NUU5MyArIFx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NUU5M1xuICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3Z1ZScpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvdnVlLXJvdXRlcicpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZWxlbWVudC1wbHVzJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9waW5pYScpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQHZ1ZXVzZScpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQGVsZW1lbnQtcGx1cycpIHx8XG4gICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvdnVlLWVjaGFydHMnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2RheWpzJykgfHxcbiAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9sb2Rhc2gnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0B2dWUnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygncGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygncGFja2FnZXMvc2hhcmVkLWNvcmUnKSB8fFxuICAgICAgICBpZC5pbmNsdWRlcygncGFja2FnZXMvc2hhcmVkLXV0aWxzJykpIHtcbiAgICAgIC8vIExheW91dC1BcHBcdUZGMUFcdTZCNjNcdTVFMzhcdTYyNTNcdTUzMDVcdTUyMzAgdmVuZG9yXG4gICAgICAvLyBcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdUZGMDhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdUZGMDlcdUZGMUFcdTRFMERcdTYyNTNcdTUzMDVcdUZGMENcdTRFQ0UgbGF5b3V0LWFwcCBcdTUyQTBcdThGN0RcbiAgICAgIGlmIChza2lwU2hhcmVkUmVzb3VyY2VzKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ3ZlbmRvcic7XG4gICAgfVxuXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3ODZFXHU0RkREIHZpdGUtcGx1Z2luIFx1NzZGOFx1NTE3M1x1NEVFM1x1NzgwMVx1NEU1Rlx1ODhBQlx1NjI1M1x1NTMwNVx1NTIzMCB2ZW5kb3JcbiAgICBpZiAoaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3ZpdGUtcGx1Z2luJykgfHwgaWQuaW5jbHVkZXMoJ0BidGMvdml0ZS1wbHVnaW4nKSkge1xuICAgICAgcmV0dXJuICd2ZW5kb3InO1xuICAgIH1cblxuICAgIC8vIDQuIFx1NjI0MFx1NjcwOVx1NTE3Nlx1NEVENlx1NEUxQVx1NTJBMVx1NEVFM1x1NzgwMVx1NTQwOFx1NUU3Nlx1NTIzMFx1NEUzQlx1NjU4N1x1NEVGNlxuICAgIHJldHVybiB1bmRlZmluZWQ7IC8vIFx1OEZENFx1NTZERSB1bmRlZmluZWQgXHU4ODY4XHU3OTNBXHU1NDA4XHU1RTc2XHU1MjMwXHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XG4gIH07XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxyb2xsdXAtY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3JvbGx1cC1jb25maWcudHNcIjsvKipcbiAqIFJvbGx1cCBcdTkxNERcdTdGNkVcdTZBMjFcdTU3NTdcbiAqIFx1NjNEMFx1NEY5Qlx1NTE2Q1x1NTE3MVx1NzY4NCBSb2xsdXAgXHU5MTREXHU3RjZFXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBSb2xsdXBPcHRpb25zLCBXYXJuaW5nSGFuZGxlcldpdGhEZWZhdWx0LCBPdXRwdXRBc3NldCwgV2FybmluZyB9IGZyb20gJ3JvbGx1cCc7XG5pbXBvcnQgeyBjcmVhdGVNYW51YWxDaHVua3NTdHJhdGVneSB9IGZyb20gJy4vbWFudWFsLWNodW5rcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUm9sbHVwQ29uZmlnT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBcdThENDRcdTZFOTBcdTY1ODdcdTRFRjZcdTc2RUVcdTVGNTVcdUZGMDhcdTlFRDhcdThCQTQ6ICdhc3NldHMnXHVGRjA5XG4gICAqL1xuICBhc3NldERpcj86IHN0cmluZztcbiAgLyoqXG4gICAqIGNodW5rIFx1NjU4N1x1NEVGNlx1NzZFRVx1NUY1NVx1RkYwOFx1OUVEOFx1OEJBNDogXHU0RTBFIGFzc2V0RGlyIFx1NzZGOFx1NTQwQ1x1RkYwOVxuICAgKi9cbiAgY2h1bmtEaXI/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdTVDMDYgc2luZ2xlLXNwYSBcdTU0OEMgcWlhbmt1biBcdTY4MDdcdThCQjBcdTRFM0FcdTU5MTZcdTkwRThcdTVFOTNcdUZGMDhcdTlFRDhcdThCQTQ6IHRydWVcdUZGMDlcbiAgICogXHU0RTNCXHU1RTk0XHU3NTI4XHVGRjA4bGF5b3V0LWFwcFx1RkYwOVx1NUU5NFx1OEJFNVx1OEJCRVx1N0Y2RVx1NEUzQSBmYWxzZVx1RkYwQ1x1NEVFNVx1NEZCRlx1NjI1M1x1NTMwNVx1OEZEOVx1NEU5Qlx1NUU5M1xuICAgKiBcdTVCNTBcdTVFOTRcdTc1MjhcdTVFOTRcdThCRTVcdThCQkVcdTdGNkVcdTRFM0EgdHJ1ZVx1RkYwQ1x1OTA3Rlx1NTE0RFx1OTFDRFx1NTkwRFx1NjI1M1x1NTMwNVxuICAgKi9cbiAgZXh0ZXJuYWxTaW5nbGVTcGE/OiBib29sZWFuO1xuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1QzA2IEBidGMgXHU1MzA1XHU2ODA3XHU4QkIwXHU0RTNBXHU1OTE2XHU5MEU4XHU1RTkzXHVGRjA4XHU5RUQ4XHU4QkE0OiBmYWxzZVx1RkYwOVxuICAgKiBcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTYyNTNcdTUzMDVcdThGRDlcdTRFOUJcdTVFOTNcdUZGMENcdTkwN0ZcdTUxNERcdThGRDBcdTg4NENcdTY1RjZcdTZBMjFcdTU3NTdcdTg5RTNcdTY3OTBcdTk1RUVcdTk4OThcbiAgICovXG4gIGV4dGVybmFsQnRjUGFja2FnZXM/OiBib29sZWFuO1xuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1QzA2IEBjb25maWdzIFx1NTMwNVx1NjgwN1x1OEJCMFx1NEUzQVx1NTkxNlx1OTBFOFx1NUU5M1x1RkYwOFx1OUVEOFx1OEJBNDogdHJ1ZVx1RkYwOVxuICAgKiBcdTRFM0JcdTVFOTRcdTc1MjhcdUZGMDhtYWluLWFwcFx1RkYwOVx1NUU5NFx1OEJFNVx1OEJCRVx1N0Y2RVx1NEUzQSBmYWxzZVx1RkYwQ1x1NEVFNVx1NEZCRlx1NjI1M1x1NTMwNVx1OEZEOVx1NEU5Qlx1NUU5M1xuICAgKiBcdTVCNTBcdTVFOTRcdTc1MjhcdTVFOTRcdThCRTVcdThCQkVcdTdGNkVcdTRFM0EgdHJ1ZVx1RkYwQ1x1NEVDRSBsYXlvdXQtYXBwIFx1NTJBMFx1OEY3RFx1NTE3MVx1NEVBQlx1OEQ0NFx1NkU5MFxuICAgKi9cbiAgZXh0ZXJuYWxDb25maWdzUGFja2FnZXM/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBSb2xsdXAgXHU5MTREXHU3RjZFXG4gKiBAcGFyYW0gYXBwTmFtZSBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcbiAqIEBwYXJhbSBvcHRpb25zIFx1OTE0RFx1N0Y2RVx1OTAwOVx1OTg3OVxuICogQHJldHVybnMgUm9sbHVwIFx1OTE0RFx1N0Y2RVx1NUJGOVx1OEM2MVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUm9sbHVwQ29uZmlnKGFwcE5hbWU6IHN0cmluZywgb3B0aW9ucz86IFJvbGx1cENvbmZpZ09wdGlvbnMpOiBSb2xsdXBPcHRpb25zIHtcbiAgY29uc3QgbWFudWFsQ2h1bmtzID0gY3JlYXRlTWFudWFsQ2h1bmtzU3RyYXRlZ3koYXBwTmFtZSk7XG4gIGNvbnN0IGFzc2V0RGlyID0gb3B0aW9ucz8uYXNzZXREaXIgfHwgJ2Fzc2V0cyc7XG4gIGNvbnN0IGNodW5rRGlyID0gb3B0aW9ucz8uY2h1bmtEaXIgfHwgYXNzZXREaXI7XG4gIC8vIFx1OUVEOFx1OEJBNFx1NUMwNiBzaW5nbGUtc3BhIFx1NTQ4QyBxaWFua3VuIFx1NjgwN1x1OEJCMFx1NEUzQSBleHRlcm5hbFx1RkYwOFx1NUI1MFx1NUU5NFx1NzUyOFx1RkYwOVxuICAvLyBcdTRFM0JcdTVFOTRcdTc1MjhcdUZGMDhsYXlvdXQtYXBwXHVGRjA5XHU5NzAwXHU4OTgxXHU2NjNFXHU1RjBGXHU4QkJFXHU3RjZFIGV4dGVybmFsU2luZ2xlU3BhOiBmYWxzZVxuICAvLyBAdHMtaWdub3JlOiBcdTUzRUZcdTgwRkRcdTU3MjhcdTY3MkFcdTY3NjVcdTRGN0ZcdTc1MjhcbiAgY29uc3QgX2V4dGVybmFsU2luZ2xlU3BhID0gb3B0aW9ucz8uZXh0ZXJuYWxTaW5nbGVTcGEgIT09IGZhbHNlO1xuICAvLyBcdTlFRDhcdThCQTRcdTVDMDYgQGJ0YyBcdTUzMDVcdTYyNTNcdTUzMDVcdTUyMzBcdTVFOTRcdTc1MjhcdTRFMkRcdUZGMDhcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTYyNTNcdTUzMDVcdUZGMENcdTkwN0ZcdTUxNERcdThGRDBcdTg4NENcdTY1RjZcdTZBMjFcdTU3NTdcdTg5RTNcdTY3OTBcdTk1RUVcdTk4OThcdUZGMDlcbiAgLy8gXHU1OTgyXHU2NzlDXHU4QkJFXHU3RjZFXHU0RTNBIHRydWVcdUZGMENcdTUyMTlcdTY4MDdcdThCQjBcdTRFM0EgZXh0ZXJuYWxcdUZGMDhcdTRFMERcdTYzQThcdTgzNTBcdUZGMDlcbiAgY29uc3QgZXh0ZXJuYWxCdGNQYWNrYWdlcyA9IG9wdGlvbnM/LmV4dGVybmFsQnRjUGFja2FnZXMgPT09IHRydWU7XG4gIC8vIFx1OUVEOFx1OEJBNFx1NUMwNiBAY29uZmlncyBcdTUzMDVcdTY4MDdcdThCQjBcdTRFM0EgZXh0ZXJuYWxcdUZGMDhcdTVCNTBcdTVFOTRcdTc1MjhcdTRFQ0UgbGF5b3V0LWFwcCBcdTUyQTBcdThGN0RcdUZGMDlcbiAgLy8gXHU0RTNCXHU1RTk0XHU3NTI4XHVGRjA4bWFpbi1hcHBcdUZGMDlcdTk3MDBcdTg5ODFcdTY2M0VcdTVGMEZcdThCQkVcdTdGNkUgZXh0ZXJuYWxDb25maWdzUGFja2FnZXM6IGZhbHNlXHVGRjBDXHU0RUU1XHU0RkJGXHU2MjUzXHU1MzA1XHU4RkQ5XHU0RTlCXHU1RTkzXG4gIGNvbnN0IGV4dGVybmFsQ29uZmlnc1BhY2thZ2VzID0gb3B0aW9ucz8uZXh0ZXJuYWxDb25maWdzUGFja2FnZXMgIT09IGZhbHNlO1xuXG4gIC8vIFx1Njc4NFx1NUVGQSBleHRlcm5hbCBcdTY1NzBcdTdFQzRcbiAgLy8gUm9sbHVwIFx1NzY4NCBleHRlcm5hbCBcdTY1MkZcdTYzMDFcdTVCNTdcdTdCMjZcdTRFMzJcdTMwMDFcdTZCNjNcdTUyMTlcdTg4NjhcdThGQkVcdTVGMEZcdTYyMTZcdTUxRkRcdTY1NzBcbiAgY29uc3QgZXh0ZXJuYWw6IChzdHJpbmcgfCBSZWdFeHAgfCAoKGlkOiBzdHJpbmcpID0+IGJvb2xlYW4pKVtdID0gW1xuICAgIC8vIHZpdGUtcGx1Z2luIFx1NjYyRlx1Njc4NFx1NUVGQVx1NjVGNlx1NjNEMlx1NEVGNlx1RkYwQ1x1NEUwRFx1NUU5NFx1OEJFNVx1ODhBQlx1NjI1M1x1NTMwNVx1NTIzMFx1OEZEMFx1ODg0Q1x1NjVGNlx1NEVFM1x1NzgwMVx1NEUyRFxuICAgICdAYnRjL3ZpdGUtcGx1Z2luJyxcbiAgICAvXkBidGNcXC92aXRlLXBsdWdpbi8sXG4gICAgLy8gQGJ0YyBcdTUzMDVcdUZGMUFcdTY4MzlcdTYzNkVcdTkxNERcdTdGNkVcdTUxQjNcdTVCOUFcdTY2MkZcdTU0MjZcdTY4MDdcdThCQjBcdTRFM0EgZXh0ZXJuYWxcbiAgICAvLyBcdTlFRDhcdThCQTRcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTYyNTNcdTUzMDVcdThGRDlcdTRFOUJcdTVFOTNcdUZGMENcdTkwN0ZcdTUxNERcdThGRDBcdTg4NENcdTY1RjZcdTZBMjFcdTU3NTdcdTg5RTNcdTY3OTBcdTk1RUVcdTk4OThcbiAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFDU1MgXHU2NTg3XHU0RUY2XHU0RTBEXHU1RTk0XHU4QkU1XHU4OEFCXHU2ODA3XHU4QkIwXHU0RTNBIGV4dGVybmFsXHVGRjBDXHU1RTk0XHU4QkU1XHU4OEFCIFZpdGUgXHU1OTA0XHU3NDA2XHU1RTc2XHU2MjUzXHU1MzA1XG4gICAgLi4uKGV4dGVybmFsQnRjUGFja2FnZXMgPyBbXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cycsXG4gICAgICAvLyBcdTUzMzlcdTkxNEQgSmF2YVNjcmlwdC9UeXBlU2NyaXB0IFx1NkEyMVx1NTc1N1x1RkYwQ1x1NEY0Nlx1NEUwRFx1NTMzOVx1OTE0RCBDU1MgXHU2NTg3XHU0RUY2XG4gICAgICAoaWQ6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoaWQuc3RhcnRzV2l0aCgnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cy8nKSkge1xuICAgICAgICAgIC8vIFx1NjM5Mlx1OTY2NCBDU1MgXHU2NTg3XHU0RUY2XHVGRjA4LmNzcywgLnNjc3MsIC5zYXNzLCAubGVzcyBcdTdCNDlcdUZGMDlcbiAgICAgICAgICByZXR1cm4gIS9cXC4oY3NzfHNjc3N8c2Fzc3xsZXNzfHN0eWwpJC9pLnRlc3QoaWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29yZScsXG4gICAgICAvLyBcdTUzMzlcdTkxNEQgSmF2YVNjcmlwdC9UeXBlU2NyaXB0IFx1NkEyMVx1NTc1N1x1RkYwQ1x1NEY0Nlx1NEUwRFx1NTMzOVx1OTE0RCBDU1MgXHU2NTg3XHU0RUY2XG4gICAgICAoaWQ6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoaWQuc3RhcnRzV2l0aCgnQGJ0Yy9zaGFyZWQtY29yZS8nKSkge1xuICAgICAgICAgIHJldHVybiAhL1xcLihjc3N8c2Nzc3xzYXNzfGxlc3N8c3R5bCkkL2kudGVzdChpZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSxcbiAgICAgICdAYnRjL3NoYXJlZC11dGlscycsXG4gICAgICAvLyBcdTUzMzlcdTkxNEQgSmF2YVNjcmlwdC9UeXBlU2NyaXB0IFx1NkEyMVx1NTc1N1x1RkYwQ1x1NEY0Nlx1NEUwRFx1NTMzOVx1OTE0RCBDU1MgXHU2NTg3XHU0RUY2XG4gICAgICAoaWQ6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoaWQuc3RhcnRzV2l0aCgnQGJ0Yy9zaGFyZWQtdXRpbHMvJykpIHtcbiAgICAgICAgICByZXR1cm4gIS9cXC4oY3NzfHNjc3N8c2Fzc3xsZXNzfHN0eWwpJC9pLnRlc3QoaWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sXG4gICAgXSA6IFtdKSxcbiAgICAvLyBAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MgXHU1MzA1XHVGRjFBXHU2ODM5XHU2MzZFXHU5MTREXHU3RjZFXHU1MUIzXHU1QjlBXHU2NjJGXHU1NDI2XHU2ODA3XHU4QkIwXHU0RTNBIGV4dGVybmFsXG4gICAgLy8gXHU0RTNCXHU1RTk0XHU3NTI4XHVGRjA4bWFpbi1hcHBcdUZGMDlcdTVFOTRcdThCRTVcdTYyNTNcdTUzMDVcdThGRDlcdTRFOUJcdTVFOTNcdUZGMENcdTVCNTBcdTVFOTRcdTc1MjhcdTRFQ0UgbGF5b3V0LWFwcCBcdTUyQTBcdThGN0RcbiAgICAuLi4oZXh0ZXJuYWxDb25maWdzUGFja2FnZXMgPyBbXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29yZS9jb25maWdzL2xheW91dC1icmlkZ2UnLFxuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUvY29uZmlncy91bmlmaWVkLWVudi1jb25maWcnLFxuICAgICAgJ0BidGMvc2hhcmVkLWNvcmUvY29uZmlncy9hcHAtc2Nhbm5lcicsXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29yZS9jb25maWdzL2FwcC1lbnYuY29uZmlnJyxcbiAgICAgIC9eQGJ0Y1xcL3NoYXJlZC1jb3JlXFwvY29uZmlnc1xcLy4qLyxcbiAgICBdIDogW10pLFxuICBdO1xuXG4gIHJldHVybiB7XG4gICAgcHJlc2VydmVFbnRyeVNpZ25hdHVyZXM6ICdzdHJpY3QnLFxuICAgIG9ud2Fybih3YXJuaW5nOiBXYXJuaW5nLCB3YXJuOiBXYXJuaW5nSGFuZGxlcldpdGhEZWZhdWx0KSB7XG4gICAgICAvLyBcdThGQzdcdTZFRTRcdTVERjJcdTc3RTVcdThCNjZcdTU0NEFcbiAgICAgIGlmICh3YXJuaW5nLmNvZGUgPT09ICdNT0RVTEVfTEVWRUxfRElSRUNUSVZFJyB8fFxuICAgICAgICAgICh3YXJuaW5nLm1lc3NhZ2UgJiYgdHlwZW9mIHdhcm5pbmcubWVzc2FnZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgd2FybmluZy5tZXNzYWdlLmluY2x1ZGVzKCdkeW5hbWljYWxseSBpbXBvcnRlZCcpICYmXG4gICAgICAgICAgIHdhcm5pbmcubWVzc2FnZS5pbmNsdWRlcygnc3RhdGljYWxseSBpbXBvcnRlZCcpKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAod2FybmluZy5tZXNzYWdlICYmIHR5cGVvZiB3YXJuaW5nLm1lc3NhZ2UgPT09ICdzdHJpbmcnICYmIHdhcm5pbmcubWVzc2FnZS5pbmNsdWRlcygnR2VuZXJhdGVkIGFuIGVtcHR5IGNodW5rJykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gXHU4RkM3XHU2RUU0XHU1RkFBXHU3M0FGXHU0RjlEXHU4RDU2XHU4QjY2XHU1NDRBXHVGRjA4XHU1REYyXHU3N0U1XHU3Njg0XHU1Qjg5XHU1MTY4XHU4QjY2XHU1NDRBXHVGRjA5XG4gICAgICAvLyBcdTVGNTMgc2hhcmVkLWNvbXBvbmVudHMgXHU5MDFBXHU4RkM3IHJlZXhwb3J0IFx1NUJGQ1x1NTFGQVx1N0VDNFx1NEVGNlx1RkYwQ1x1NEUxNFx1N0VDNFx1NEVGNlx1NTQ4Q1x1NEUxQVx1NTJBMVx1NEVFM1x1NzgwMVx1NTcyOFx1NEUwRFx1NTQwQyBjaHVuayBcdTY1RjZcdTRGMUFcdTRFQTdcdTc1MUZcdTZCNjRcdThCNjZcdTU0NEFcbiAgICAgIC8vIFx1OEZEOVx1NjYyRlx1OTg4NFx1NjcxRlx1NzY4NFx1NjJDNlx1NTIwNlx1N0I1Nlx1NzU2NVx1RkYwQ1x1NEUwRFx1NEYxQVx1NUY3MVx1NTRDRFx1NTI5Rlx1ODBGRFx1RkYwQ1x1NTZFMFx1NEUzQSBjaHVuayBcdTUyQTBcdThGN0RcdTk4N0FcdTVFOEZcdTVERjJcdTdFQ0ZcdTZCNjNcdTc4NkVcdTkxNERcdTdGNkVcbiAgICAgIGlmICh3YXJuaW5nLmNvZGUgPT09ICdDSVJDVUxBUl9ERVBFTkRFTkNZJyB8fFxuICAgICAgICAgICh3YXJuaW5nLm1lc3NhZ2UgJiYgdHlwZW9mIHdhcm5pbmcubWVzc2FnZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgKHdhcm5pbmcubWVzc2FnZS5pbmNsdWRlcygnd2FzIHJlZXhwb3J0ZWQgdGhyb3VnaCBtb2R1bGUnKSB8fFxuICAgICAgICAgICAgd2FybmluZy5tZXNzYWdlLmluY2x1ZGVzKCd3aWxsIGVuZCB1cCBpbiBkaWZmZXJlbnQgY2h1bmtzJykgfHxcbiAgICAgICAgICAgIHdhcm5pbmcubWVzc2FnZS5pbmNsdWRlcygnY2lyY3VsYXIgZGVwZW5kZW5jeScpKSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU0RTBEXHU1MThEXHU4RkM3XHU2RUU0IEBidGMgXHU1MzA1XHU3Njg0XHU4QjY2XHU1NDRBXHVGRjBDXHU1NkUwXHU0RTNBXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU2MjUzXHU1MzA1XHU4RkQ5XHU0RTlCXHU1MzA1XHVGRjBDXHU0RTBEXHU1RTk0XHU4QkU1XHU2NzA5IHVucmVzb2x2ZWQgaW1wb3J0IFx1OEI2Nlx1NTQ0QVxuICAgICAgd2Fybih3YXJuaW5nKTtcbiAgICB9LFxuICAgIG91dHB1dDoge1xuICAgICAgZm9ybWF0OiAnZXNtJyxcbiAgICAgIGlubGluZUR5bmFtaWNJbXBvcnRzOiBmYWxzZSxcbiAgICAgIG1hbnVhbENodW5rcyxcbiAgICAgIHByZXNlcnZlTW9kdWxlczogZmFsc2UsXG4gICAgICBnZW5lcmF0ZWRDb2RlOiB7XG4gICAgICAgIGNvbnN0QmluZGluZ3M6IGZhbHNlLCAvLyBcdTRFMERcdTRGN0ZcdTc1MjggY29uc3RcdUZGMENcdTkwN0ZcdTUxNEQgVERaIFx1OTVFRVx1OTg5OFxuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRERcdTc1NTlcdTVCRkNcdTUxRkFcdTU0MERcdTc5RjBcdUZGMENcdTkwN0ZcdTUxNERcdTg4QUJcdTUzOEJcdTdGMjlcdTYyMTBcdTUzNTVcdTVCNTdcdTZCQ0RcbiAgICAgICAgLy8gXHU4RkQ5XHU1M0VGXHU0RUU1XHU5NjMyXHU2QjYyIFwiZG9lcyBub3QgcHJvdmlkZSBhbiBleHBvcnQgbmFtZWQgJ2MnXCIgXHU5NTE5XHU4QkVGXG4gICAgICAgIHByZXNlcnZlTW9kdWxlc1Jvb3Q6IHVuZGVmaW5lZCxcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3ODZFXHU0RkREXHU1QkY5XHU4QzYxXHU1QzVFXHU2MDI3XHU0RTRCXHU5NUY0XHU2NzA5XHU2QjYzXHU3ODZFXHU3Njg0XHU1MjA2XHU5Njk0XHU3QjI2XHVGRjBDXHU5MDdGXHU1MTREXHU1QjU3XHU3QjI2XHU0RTMyXHU1NDhDXHU2NTcwXHU1QjU3XHU4RkRFXHU2M0E1XG4gICAgICAgIG9iamVjdFNob3J0aGFuZDogZmFsc2UsIC8vIFx1Nzk4MVx1NzUyOFx1NUJGOVx1OEM2MVx1N0I4MFx1NTE5OVx1RkYwQ1x1Nzg2RVx1NEZERFx1NUM1RVx1NjAyN1x1NTQwRFx1NTQ4Q1x1NTAzQ1x1OTBGRFx1NUI4Q1x1NjU3NFxuICAgICAgICBhcnJvd0Z1bmN0aW9uczogZmFsc2UsIC8vIFx1Nzk4MVx1NzUyOFx1N0JBRFx1NTkzNFx1NTFGRFx1NjU3MFx1RkYwQ1x1NEY3Rlx1NzUyOFx1NjY2RVx1OTAxQVx1NTFGRFx1NjU3MFx1RkYwQ1x1NjZGNFx1NUI4OVx1NTE2OFxuICAgICAgfSxcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1Nzg2RVx1NEZERFx1NUJGQ1x1NTFGQVx1NTQwRFx1NzlGMFx1NEUwRFx1ODhBQlx1NTM4Qlx1N0YyOVxuICAgICAgLy8gXHU4NjdEXHU3MTM2IHRlcnNlciBcdTc2ODQgbWFuZ2xlIFx1NURGMlx1Nzk4MVx1NzUyOFx1RkYwQ1x1NEY0NiBSb2xsdXAgXHU3Njg0XHU0RUUzXHU3ODAxXHU3NTFGXHU2MjEwXHU0RTVGXHU1M0VGXHU4MEZEXHU1MzhCXHU3RjI5XHU1QkZDXHU1MUZBXHU1NDBEXHU3OUYwXG4gICAgICBjaHVua0ZpbGVOYW1lczogYCR7Y2h1bmtEaXJ9L1tuYW1lXS1baGFzaF0uanNgLFxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XHU0RjdGXHU3NTI4XHU3QTMzXHU1QjlBXHU2NTg3XHU0RUY2XHU1NDBEXHVGRjA4XHU0RTBEXHU1RTI2IGhhc2hcdUZGMDlcdUZGMENcdTk2NERcdTRGNEVcdTkwRThcdTdGNzIvXHU3RjEzXHU1QjU4XHU1QkZDXHU4MUY0XHU3Njg0IGluZGV4LXh4eC5qcyA0MDQgXHU5OENFXHU5NjY5XG4gICAgICAvLyBOZ2lueCBcdTVCRjlcdThCRTVcdTY1ODdcdTRFRjZcdTVFOTRcdTkxNERcdTdGNkUgbm8tY2FjaGVcdUZGMUJcdTUxNzZcdTRFRDYgY2h1bmsgXHU0RUNEXHU0RkREXHU2MzAxIGhhc2ggKyBpbW11dGFibGVcbiAgICAgIGVudHJ5RmlsZU5hbWVzOiBgJHtjaHVua0Rpcn0vW25hbWVdLmpzYCxcbiAgICAgIGFzc2V0RmlsZU5hbWVzOiAoYXNzZXRJbmZvOiBPdXRwdXRBc3NldCkgPT4ge1xuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFmYXZpY29uLmljbyBcdTU0OEMgaWNvbnMgXHU3NkVFXHU1RjU1XHU3Njg0XHU2NTg3XHU0RUY2XHU0RTBEXHU1RTk0XHU4QkU1XHU2REZCXHU1MkEwIGhhc2hcdUZGMENcdTVFOTRcdThCRTVcdTRGRERcdTYzMDFcdTU3MjhcdTUzOUZcdTRGNERcdTdGNkVcbiAgICAgICAgLy8gXHU4RkQ5XHU0RTlCXHU2NTg3XHU0RUY2XHU0RjFBXHU4OEFCIHB1YmxpY0RpciBcdTYyMTYgY29weUljb25zUGx1Z2luIFx1NTkwRFx1NTIzNlx1NTIzMFx1NkI2M1x1Nzg2RVx1NzY4NFx1NEY0RFx1N0Y2RVxuICAgICAgICBpZiAoYXNzZXRJbmZvLm5hbWU/LmluY2x1ZGVzKCdmYXZpY29uJykgfHwgYXNzZXRJbmZvLm5hbWU/LmluY2x1ZGVzKCdpY29ucy8nKSkge1xuICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjU4N1x1NEVGNlx1NTQwRFx1NTMwNVx1NTQyQiBmYXZpY29uIFx1NjIxNiBpY29uc1x1RkYwQ1x1NEZERFx1NjMwMVx1NTM5Rlx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOFx1NEUwRFx1NTQyQiBoYXNoXHVGRjA5XG4gICAgICAgICAgLy8gXHU0RjQ2XHU4RkQ5XHU3OUNEXHU2MEM1XHU1MUI1XHU1RTk0XHU4QkU1XHU1Rjg4XHU1QzExXHVGRjBDXHU1NkUwXHU0RTNBIHB1YmxpY0RpciBcdTRGMUFcdTc2RjRcdTYzQTVcdTU5MERcdTUyMzZcdThGRDlcdTRFOUJcdTY1ODdcdTRFRjZcbiAgICAgICAgICByZXR1cm4gYXNzZXRJbmZvLm5hbWUgfHwgYCR7YXNzZXREaXJ9L1tuYW1lXS5bZXh0XWA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFzc2V0SW5mby5uYW1lPy5lbmRzV2l0aCgnLmNzcycpKSB7XG4gICAgICAgICAgcmV0dXJuIGAke2Fzc2V0RGlyfS9bbmFtZV0tW2hhc2hdLmNzc2A7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGAke2Fzc2V0RGlyfS9bbmFtZV0tW2hhc2hdLltleHRdYDtcbiAgICAgIH0sXG4gICAgfSxcbiAgICBleHRlcm5hbCxcbiAgfTtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGNsZWFuLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2NsZWFuLnRzXCI7LyoqXG4gKiBcdTZFMDVcdTc0MDZcdTY3ODRcdTVFRkFcdTc2RUVcdTVGNTVcdTYzRDJcdTRFRjZcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW2NsZWFuXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbY2xlYW5dJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbY2xlYW5dJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1tjbGVhbl0nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBleGlzdHNTeW5jLCBybVN5bmMgfSBmcm9tICdub2RlOmZzJztcblxuLyoqXG4gKiBcdTVCODlcdTUxNjhcdThGOTNcdTUxRkFcdTY1RTVcdTVGRDdcdUZGMDhcdTkwN0ZcdTUxNEQgV2luZG93cyBcdTYzQTdcdTUyMzZcdTUzRjBcdTdGMTZcdTc4MDFcdTk1RUVcdTk4OThcdUZGMDlcbiAqL1xuZnVuY3Rpb24gc2FmZUxvZyhtZXNzYWdlOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmluZm8obWVzc2FnZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gXHU1OTgyXHU2NzlDXHU4RjkzXHU1MUZBXHU1OTMxXHU4RDI1XHVGRjA4XHU1M0VGXHU4MEZEXHU2NjJGXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XHVGRjBDXHU0RjdGXHU3NTI4XHU3RUFGXHU2NTg3XHU2NzJDXHU4RjkzXHU1MUZBXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnRyb2wtcmVnZXhcbiAgICBjb25zb2xlLmluZm8obWVzc2FnZS5yZXBsYWNlKC9bXlxceDAwLVxceDdGXS9nLCAnJykpO1xuICB9XG59XG5cbi8qKlxuICogXHU1Qjg5XHU1MTY4XHU4RjkzXHU1MUZBXHU4QjY2XHU1NDRBXHVGRjA4XHU5MDdGXHU1MTREIFdpbmRvd3MgXHU2M0E3XHU1MjM2XHU1M0YwXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XG4gKi9cbmZ1bmN0aW9uIHNhZmVXYXJuKG1lc3NhZ2U6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBcdTU5ODJcdTY3OUNcdThGOTNcdTUxRkFcdTU5MzFcdThEMjVcdUZGMDhcdTUzRUZcdTgwRkRcdTY2MkZcdTdGMTZcdTc4MDFcdTk1RUVcdTk4OThcdUZGMDlcdUZGMENcdTRGN0ZcdTc1MjhcdTdFQUZcdTY1ODdcdTY3MkNcdThGOTNcdTUxRkFcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29udHJvbC1yZWdleFxuICAgIGNvbnNvbGUud2FybihtZXNzYWdlLnJlcGxhY2UoL1teXFx4MDAtXFx4N0ZdL2csICcnKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTZFMDVcdTc0MDYgZGlzdCBcdTc2RUVcdTVGNTVcdTYzRDJcdTRFRjZcbiAqIFx1NkRGQlx1NTJBMFx1OTFDRFx1OEJENVx1NjczQVx1NTIzNlx1NEVFNVx1NTkwNFx1NzQwNiBXaW5kb3dzIFx1NEUwQVx1NzY4NFx1NjU4N1x1NEVGNlx1OTUwMVx1NUI5QVx1OTVFRVx1OTg5OFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5EaXN0UGx1Z2luKGFwcERpcjogc3RyaW5nKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY2xlYW4tZGlzdC1wbHVnaW4nLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBjb25zdCBkaXN0RGlyID0gcmVzb2x2ZShhcHBEaXIsICdkaXN0Jyk7XG4gICAgICBpZiAoZXhpc3RzU3luYyhkaXN0RGlyKSkge1xuICAgICAgICBzYWZlTG9nKCdbY2xlYW4tZGlzdC1wbHVnaW5dIFx1NkUwNVx1NzQwNlx1NjVFN1x1NzY4NCBkaXN0IFx1NzZFRVx1NUY1NS4uLicpO1xuXG4gICAgICAgIC8vIFx1NkRGQlx1NTJBMFx1OTFDRFx1OEJENVx1NjczQVx1NTIzNlx1RkYwQ1x1NTkwNFx1NzQwNiBXaW5kb3dzIFx1NEUwQVx1NzY4NFx1NjU4N1x1NEVGNlx1OTUwMVx1NUI5QVx1OTVFRVx1OTg5OFxuICAgICAgICBsZXQgcmV0cmllcyA9IDU7IC8vIFx1NTg5RVx1NTJBMFx1OTFDRFx1OEJENVx1NkIyMVx1NjU3MFxuICAgICAgICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xuXG4gICAgICAgIHdoaWxlIChyZXRyaWVzID4gMCAmJiAhc3VjY2Vzcykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBybVN5bmMoZGlzdERpciwgeyByZWN1cnNpdmU6IHRydWUsIGZvcmNlOiB0cnVlIH0pO1xuICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgICAgICAgICBzYWZlTG9nKCdbY2xlYW4tZGlzdC1wbHVnaW5dIFx1MjcwNSBkaXN0IFx1NzZFRVx1NUY1NVx1NURGMlx1NkUwNVx1NzQwNicpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIHJldHJpZXMtLTtcbiAgICAgICAgICAgIGlmIChlcnJvci5jb2RlID09PSAnRUJVU1knIHx8IGVycm9yLmNvZGUgPT09ICdFTk9URU1QVFknKSB7XG4gICAgICAgICAgICAgIGlmIChyZXRyaWVzID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHdhaXRUaW1lID0gKDYgLSByZXRyaWVzKSAqIDIwMDsgLy8gXHU5MDEyXHU1ODlFXHU3QjQ5XHU1Rjg1XHU2NUY2XHU5NUY0XHVGRjFBMjAwbXMsIDQwMG1zLCA2MDBtcywgODAwbXMsIDEwMDBtc1xuICAgICAgICAgICAgICAgIHNhZmVXYXJuKGBbY2xlYW4tZGlzdC1wbHVnaW5dIFx1MjZBMFx1RkUwRiAgXHU3NkVFXHU1RjU1XHU4OEFCXHU1MzYwXHU3NTI4XHVGRjBDXHU3QjQ5XHU1Rjg1ICR7d2FpdFRpbWV9bXMgXHU1NDBFXHU5MUNEXHU4QkQ1Li4uIChcdTUyNjlcdTRGNTkgJHtyZXRyaWVzfSBcdTZCMjEpYCk7XG4gICAgICAgICAgICAgICAgLy8gXHU1NDBDXHU2QjY1XHU3QjQ5XHU1Rjg1XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIHdoaWxlIChEYXRlLm5vdygpIC0gc3RhcnQgPCB3YWl0VGltZSkge1xuICAgICAgICAgICAgICAgICAgLy8gXHU1RkQ5XHU3QjQ5XHU1Rjg1XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNhZmVXYXJuKCdbY2xlYW4tZGlzdC1wbHVnaW5dIFx1Mjc0QyBcdTY1RTBcdTZDRDVcdTZFMDVcdTc0MDYgZGlzdCBcdTc2RUVcdTVGNTVcdUZGMDhcdTUzRUZcdTgwRkRcdTg4QUJcdTUxNzZcdTRFRDZcdTdBMEJcdTVFOEZcdTUzNjBcdTc1MjhcdUZGMDknKTtcbiAgICAgICAgICAgICAgICBzYWZlV2FybignW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTYzRDBcdTc5M0FcdUZGMUFcdThCRjdcdTUxNzNcdTk1RURcdTUzRUZcdTgwRkRcdTUzNjBcdTc1MjhcdTY1ODdcdTRFRjZcdTc2ODRcdTdBMEJcdTVFOEZcdUZGMDhcdTU5ODJcdTY1ODdcdTRFRjZcdThENDRcdTZFOTBcdTdCQTFcdTc0MDZcdTU2NjhcdTMwMDFcdTdGMTZcdThGOTFcdTU2NjhcdTdCNDlcdUZGMDknKTtcbiAgICAgICAgICAgICAgICBzYWZlV2FybignW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTYyMTZcdTgwMDVcdTYyNEJcdTUyQThcdTUyMjBcdTk2NjQgZGlzdCBcdTc2RUVcdTVGNTVcdTU0MEVcdTkxQ0RcdTY1QjBcdTY3ODRcdTVFRkEnKTtcbiAgICAgICAgICAgICAgICBzYWZlV2FybignW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTY3ODRcdTVFRkFcdTVDMDZcdTdFRTdcdTdFRURcdUZGMENcdTRGNDZcdTY1RTdcdTc2ODRcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTRFMERcdTRGMUFcdTg4QUJcdTZFMDVcdTc0MDZcdUZGMENcdTUzRUZcdTgwRkRcdTVCRkNcdTgxRjRcdTkxQ0RcdTU5MERcdTY1ODdcdTRFRjYnKTtcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTsgLy8gXHU3RUU3XHU3RUVEXHU2Nzg0XHU1RUZBXHVGRjBDXHU0RTBEXHU5NjNCXHU1ODVFXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgICAgICAgLy8gXHU3NkVFXHU1RjU1XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU0RTBEXHU5NzAwXHU4OTgxXHU2RTA1XHU3NDA2XG4gICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gXHU1MTc2XHU0RUQ2XHU5NTE5XHU4QkVGXHVGRjBDXHU3NkY0XHU2M0E1XHU2MjlCXHU1MUZBXG4gICAgICAgICAgICAgIHNhZmVXYXJuKCdbY2xlYW4tZGlzdC1wbHVnaW5dIFx1NkUwNVx1NzQwNiBkaXN0IFx1NzZFRVx1NUY1NVx1NTkzMVx1OEQyNTogJyArIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICBzYWZlV2FybignW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTY3ODRcdTVFRkFcdTVDMDZcdTdFRTdcdTdFRURcdUZGMENcdTRGNDZcdTY1RTdcdTc2ODRcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTRFMERcdTRGMUFcdTg4QUJcdTZFMDVcdTc0MDYnKTtcbiAgICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7IC8vIFx1N0VFN1x1N0VFRFx1Njc4NFx1NUVGQVx1RkYwQ1x1NEUwRFx1OTYzQlx1NTg1RVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2FmZUxvZygnW2NsZWFuLWRpc3QtcGx1Z2luXSBkaXN0IFx1NzZFRVx1NUY1NVx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1NjVFMFx1OTcwMFx1NkUwNVx1NzQwNicpO1xuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcY2h1bmsudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvY2h1bmsudHNcIjsvKipcbiAqIENodW5rIFx1NzZGOFx1NTE3M1x1NjNEMlx1NEVGNlxuICogXHU1MzA1XHU2MkVDIGNodW5rIFx1OUE4Q1x1OEJDMVx1NTQ4Q1x1NEYxOFx1NTMxNlxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbY2h1bmtdJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1tjaHVua10nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1tjaHVua10nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW2NodW5rXScsIC4uLmFyZ3MpLFxufTtcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB0eXBlIHsgT3V0cHV0T3B0aW9ucywgT3V0cHV0QnVuZGxlIH0gZnJvbSAncm9sbHVwJztcblxuLyoqXG4gKiBcdTlBOENcdThCQzFcdTYyNDBcdTY3MDkgY2h1bmsgXHU3NTFGXHU2MjEwXHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaHVua1ZlcmlmeVBsdWdpbigpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjaHVuay12ZXJpZnktcGx1Z2luJyxcbiAgICB3cml0ZUJ1bmRsZShfb3B0aW9uczogT3V0cHV0T3B0aW9ucywgYnVuZGxlOiBPdXRwdXRCdW5kbGUpIHtcbiAgICAgIGNvbnNvbGUuaW5mbygnXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1MjcwNSBcdTc1MUZcdTYyMTBcdTc2ODRcdTYyNDBcdTY3MDkgY2h1bmsgXHU2NTg3XHU0RUY2XHVGRjFBJyk7XG4gICAgICBjb25zdCBqc0NodW5rcyA9IE9iamVjdC5rZXlzKGJ1bmRsZSkuZmlsdGVyKGZpbGUgPT4gZmlsZS5lbmRzV2l0aCgnLmpzJykpO1xuICAgICAgY29uc3QgY3NzQ2h1bmtzID0gT2JqZWN0LmtleXMoYnVuZGxlKS5maWx0ZXIoZmlsZSA9PiBmaWxlLmVuZHNXaXRoKCcuY3NzJykpO1xuXG4gICAgICBjb25zb2xlLmluZm8oYFxcbkpTIGNodW5rXHVGRjA4XHU1MTcxICR7anNDaHVua3MubGVuZ3RofSBcdTRFMkFcdUZGMDlcdUZGMUFgKTtcbiAgICAgIGpzQ2h1bmtzLmZvckVhY2goY2h1bmsgPT4gY29uc29sZS5pbmZvKGAgIC0gJHtjaHVua31gKSk7XG5cbiAgICAgIGNvbnNvbGUuaW5mbyhgXFxuQ1NTIGNodW5rXHVGRjA4XHU1MTcxICR7Y3NzQ2h1bmtzLmxlbmd0aH0gXHU0RTJBXHVGRjA5XHVGRjFBYCk7XG4gICAgICBjc3NDaHVua3MuZm9yRWFjaChjaHVuayA9PiBjb25zb2xlLmluZm8oYCAgLSAke2NodW5rfWApKTtcblxuICAgICAgY29uc3QgaW5kZXhDaHVuayA9IGpzQ2h1bmtzLmZpbmQoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKCdpbmRleC0nKSk7XG4gICAgICBjb25zdCBpbmRleFNpemUgPSBpbmRleENodW5rID8gKGJ1bmRsZVtpbmRleENodW5rXSBhcyBhbnkpPy5jb2RlPy5sZW5ndGggfHwgMCA6IDA7XG4gICAgICBjb25zdCBpbmRleFNpemVLQiA9IGluZGV4U2l6ZSAvIDEwMjQ7XG4gICAgICBjb25zdCBpbmRleFNpemVNQiA9IGluZGV4U2l6ZUtCIC8gMTAyNDtcblxuICAgICAgY29uc3QgbWlzc2luZ1JlcXVpcmVkQ2h1bmtzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgaWYgKCFpbmRleENodW5rKSB7XG4gICAgICAgIG1pc3NpbmdSZXF1aXJlZENodW5rcy5wdXNoKCdpbmRleCcpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBoYXNFcHNTZXJ2aWNlID0ganNDaHVua3Muc29tZShqc0NodW5rID0+IGpzQ2h1bmsuaW5jbHVkZXMoJ2Vwcy1zZXJ2aWNlJykpO1xuICAgICAgY29uc3QgaGFzQXV0aEFwaSA9IGpzQ2h1bmtzLnNvbWUoanNDaHVuayA9PiBqc0NodW5rLmluY2x1ZGVzKCdhdXRoLWFwaScpKTtcbiAgICAgIGNvbnN0IGhhc0VjaGFydHNWZW5kb3IgPSBqc0NodW5rcy5zb21lKGpzQ2h1bmsgPT4ganNDaHVuay5pbmNsdWRlcygnZWNoYXJ0cy12ZW5kb3InKSk7XG4gICAgICBjb25zdCBoYXNMaWJNb25hY28gPSBqc0NodW5rcy5zb21lKGpzQ2h1bmsgPT4ganNDaHVuay5pbmNsdWRlcygnbGliLW1vbmFjbycpKTtcbiAgICAgIGNvbnN0IGhhc0xpYlRocmVlID0ganNDaHVua3Muc29tZShqc0NodW5rID0+IGpzQ2h1bmsuaW5jbHVkZXMoJ2xpYi10aHJlZScpKTtcblxuICAgICAgY29uc29sZS5pbmZvKGBcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHVEODNEXHVEQ0U2IFx1Njc4NFx1NUVGQVx1NjBDNVx1NTFCNVx1RkYwOFx1NUU3M1x1ODg2MVx1NjJDNlx1NTIwNlx1N0I1Nlx1NzU2NVx1RkYwOVx1RkYxQWApO1xuICAgICAgaWYgKGluZGV4Q2h1bmspIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGAgIFx1MjcwNSBpbmRleDogXHU0RTNCXHU2NTg3XHU0RUY2XHVGRjA4VnVlXHU3NTFGXHU2MDAxICsgRWxlbWVudCBQbHVzICsgXHU0RTFBXHU1MkExXHU0RUUzXHU3ODAxXHVGRjBDXHU0RjUzXHU3OUVGfiR7aW5kZXhTaXplTUIudG9GaXhlZCgyKX1NQiBcdTY3MkFcdTUzOEJcdTdGMjlcdUZGMENnemlwXHU1NDBFfiR7KGluZGV4U2l6ZU1CICogMC4zKS50b0ZpeGVkKDIpfU1CXHVGRjA5YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmluZm8oYCAgXHUyNzRDIFx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlx1NEUwRFx1NUI1OFx1NTcyOGApO1xuICAgICAgfVxuICAgICAgaWYgKGhhc0Vwc1NlcnZpY2UpIGNvbnNvbGUuaW5mbyhgICBcdTI3MDUgZXBzLXNlcnZpY2U6IEVQUyBcdTY3MERcdTUyQTFcdUZGMDhcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTUxNzFcdTRFQUJcdUZGMENcdTUzNTVcdTcyRUNcdTYyNTNcdTUzMDVcdUZGMDlgKTtcbiAgICAgIGlmIChoYXNBdXRoQXBpKSBjb25zb2xlLmluZm8oYCAgXHUyNzA1IGF1dGgtYXBpOiBBdXRoIEFQSVx1RkYwOFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1NTE3MVx1NEVBQlx1RkYwQ1x1NTM1NVx1NzJFQ1x1NjI1M1x1NTMwNVx1RkYwQ1x1NzUzMSBzeXN0ZW0tYXBwIFx1NjNEMFx1NEY5Qlx1RkYwOWApO1xuICAgICAgaWYgKGhhc0VjaGFydHNWZW5kb3IpIGNvbnNvbGUuaW5mbyhgICBcdTI3MDUgZWNoYXJ0cy12ZW5kb3I6IEVDaGFydHMgKyB6cmVuZGVyXHVGRjA4XHU3MkVDXHU3QUNCXHU1OTI3XHU1RTkzXHVGRjBDXHU2NUUwXHU0RjlEXHU4RDU2XHU5NUVFXHU5ODk4XHVGRjA5YCk7XG4gICAgICBpZiAoaGFzTGliTW9uYWNvKSBjb25zb2xlLmluZm8oYCAgXHUyNzA1IGxpYi1tb25hY286IE1vbmFjbyBFZGl0b3JcdUZGMDhcdTcyRUNcdTdBQ0JcdTU5MjdcdTVFOTNcdUZGMDlgKTtcbiAgICAgIGlmIChoYXNMaWJUaHJlZSkgY29uc29sZS5pbmZvKGAgIFx1MjcwNSBsaWItdGhyZWU6IFRocmVlLmpzXHVGRjA4XHU3MkVDXHU3QUNCXHU1OTI3XHU1RTkzXHVGRjA5YCk7XG4gICAgICBjb25zb2xlLmluZm8oYCAgXHUyMTM5XHVGRTBGICBcdTRFMUFcdTUyQTFcdTRFRTNcdTc4MDFcdTU0OEMgVnVlIFx1NzUxRlx1NjAwMVx1NTQwOFx1NUU3Nlx1NTIzMFx1NEUzQlx1NjU4N1x1NEVGNlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NTIxRFx1NTlDQlx1NTMxNlx1OTg3QVx1NUU4Rlx1OTVFRVx1OTg5OGApO1xuXG4gICAgICBpZiAobWlzc2luZ1JlcXVpcmVkQ2h1bmtzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1Mjc0QyBcdTdGM0FcdTU5MzFcdTY4MzhcdTVGQzMgY2h1bmtcdUZGMUFgLCBtaXNzaW5nUmVxdWlyZWRDaHVua3MpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFx1NjgzOFx1NUZDMyBjaHVuayBcdTdGM0FcdTU5MzFcdUZGMENcdTY3ODRcdTVFRkFcdTU5MzFcdThEMjVcdUZGMDFgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1MjcwNSBcdTY4MzhcdTVGQzMgY2h1bmsgXHU1MTY4XHU5MEU4XHU1QjU4XHU1NzI4YCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1OUE4Q1x1OEJDMVx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1NEUwMFx1ODFGNFx1NjAyN1xuICAgICAgY29uc29sZS5pbmZvKCdcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHVEODNEXHVERDBEIFx1OUE4Q1x1OEJDMVx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1NEUwMFx1ODFGNFx1NjAyNy4uLicpO1xuICAgICAgY29uc3QgYWxsQ2h1bmtGaWxlcyA9IG5ldyBTZXQoWy4uLmpzQ2h1bmtzLCAuLi5jc3NDaHVua3NdKTtcbiAgICAgIGNvbnN0IHJlZmVyZW5jZWRGaWxlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgICAgIGNvbnN0IG1pc3NpbmdGaWxlczogQXJyYXk8eyBmaWxlOiBzdHJpbmc7IHJlZmVyZW5jZWRCeTogc3RyaW5nW107IHBvc3NpYmxlTWF0Y2hlczogc3RyaW5nW10gfT4gPSBbXTtcblxuICAgICAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNodW5rXSBvZiBPYmplY3QuZW50cmllcyhidW5kbGUpKSB7XG4gICAgICAgIGNvbnN0IGNodW5rQW55ID0gY2h1bmsgYXMgYW55O1xuICAgICAgICBpZiAoY2h1bmtBbnkudHlwZSA9PT0gJ2NodW5rJyAmJiBjaHVua0FueS5jb2RlKSB7XG4gICAgICAgICAgY29uc3QgY29kZVdpdGhvdXRDb21tZW50cyA9IGNodW5rQW55LmNvZGVcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXC9cXC8uKiQvZ20sICcnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcL1xcKltcXHNcXFNdKj9cXCpcXC8vZywgJycpO1xuXG4gICAgICAgICAgY29uc3QgaW1wb3J0UGF0dGVybiA9IC9pbXBvcnRcXHMqXFwoXFxzKltcIiddKFxcLz9hc3NldHNcXC9bXlwiJ2BcXHNdK1xcLihqc3xtanN8Y3NzKSlbXCInXVxccypcXCkvZztcbiAgICAgICAgICBsZXQgbWF0Y2g7XG4gICAgICAgICAgd2hpbGUgKChtYXRjaCA9IGltcG9ydFBhdHRlcm4uZXhlYyhjb2RlV2l0aG91dENvbW1lbnRzKSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlUGF0aCA9IG1hdGNoWzFdO1xuICAgICAgICAgICAgaWYgKCFyZXNvdXJjZVBhdGgpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgcmVzb3VyY2VGaWxlID0gcmVzb3VyY2VQYXRoLnJlcGxhY2UoL15cXC8/YXNzZXRzXFwvLywgJ2Fzc2V0cy8nKTtcbiAgICAgICAgICAgIGlmICghcmVmZXJlbmNlZEZpbGVzLmhhcyhyZXNvdXJjZUZpbGUpKSB7XG4gICAgICAgICAgICAgIHJlZmVyZW5jZWRGaWxlcy5zZXQocmVzb3VyY2VGaWxlLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWZlcmVuY2VkRmlsZXMuZ2V0KHJlc291cmNlRmlsZSkhLnB1c2goZmlsZU5hbWUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHVybFBhdHRlcm4gPSAvbmV3XFxzK1VSTFxccypcXChcXHMqW1wiJ10oXFwvP2Fzc2V0c1xcL1teXCInYFxcc10rXFwuKGpzfG1qc3xjc3MpKVtcIiddL2c7XG4gICAgICAgICAgd2hpbGUgKChtYXRjaCA9IHVybFBhdHRlcm4uZXhlYyhjb2RlV2l0aG91dENvbW1lbnRzKSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlUGF0aCA9IG1hdGNoWzFdO1xuICAgICAgICAgICAgaWYgKCFyZXNvdXJjZVBhdGgpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgcmVzb3VyY2VGaWxlID0gcmVzb3VyY2VQYXRoLnJlcGxhY2UoL15cXC8/YXNzZXRzXFwvLywgJ2Fzc2V0cy8nKTtcbiAgICAgICAgICAgIGlmICghcmVmZXJlbmNlZEZpbGVzLmhhcyhyZXNvdXJjZUZpbGUpKSB7XG4gICAgICAgICAgICAgIHJlZmVyZW5jZWRGaWxlcy5zZXQocmVzb3VyY2VGaWxlLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWZlcmVuY2VkRmlsZXMuZ2V0KHJlc291cmNlRmlsZSkhLnB1c2goZmlsZU5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IFtyZWZlcmVuY2VkRmlsZSwgcmVmZXJlbmNlZEJ5XSBvZiByZWZlcmVuY2VkRmlsZXMuZW50cmllcygpKSB7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gcmVmZXJlbmNlZEZpbGUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKTtcbiAgICAgICAgbGV0IGV4aXN0cyA9IGFsbENodW5rRmlsZXMuaGFzKGZpbGVOYW1lKTtcbiAgICAgICAgbGV0IHBvc3NpYmxlTWF0Y2hlczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICBpZiAoIWV4aXN0cykge1xuICAgICAgICAgIGNvbnN0IG1hdGNoID0gZmlsZU5hbWUubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pKD86LShbYS16QS1aMC05XXs4LH0pKT9cXC4oanN8bWpzfGNzcykkLyk7XG4gICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICBjb25zdCBbLCBuYW1lUHJlZml4LCAsIGV4dF0gPSBtYXRjaDtcbiAgICAgICAgICAgIHBvc3NpYmxlTWF0Y2hlcyA9IEFycmF5LmZyb20oYWxsQ2h1bmtGaWxlcykuZmlsdGVyKGNodW5rRmlsZSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGNodW5rTWF0Y2ggPSBjaHVua0ZpbGUubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pKD86LShbYS16QS1aMC05XXs4LH0pKT9cXC4oanN8bWpzfGNzcykkLyk7XG4gICAgICAgICAgICAgIGlmIChjaHVua01hdGNoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgWywgY2h1bmtOYW1lUHJlZml4LCAsIGNodW5rRXh0XSA9IGNodW5rTWF0Y2g7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNodW5rTmFtZVByZWZpeCA9PT0gbmFtZVByZWZpeCAmJiBjaHVua0V4dCA9PT0gZXh0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZXhpc3RzID0gcG9zc2libGVNYXRjaGVzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgICBtaXNzaW5nRmlsZXMucHVzaCh7IGZpbGU6IHJlZmVyZW5jZWRGaWxlLCByZWZlcmVuY2VkQnksIHBvc3NpYmxlTWF0Y2hlcyB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobWlzc2luZ0ZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1Mjc0QyBcdTUzRDFcdTczQjAgJHttaXNzaW5nRmlsZXMubGVuZ3RofSBcdTRFMkFcdTVGMTVcdTc1MjhcdTc2ODRcdThENDRcdTZFOTBcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUFgKTtcbiAgICAgICAgaWYgKG1pc3NpbmdGaWxlcy5sZW5ndGggPD0gNSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihgXFxuW2NodW5rLXZlcmlmeS1wbHVnaW5dIFx1MjZBMFx1RkUwRiAgXHU4QjY2XHU1NDRBXHVGRjFBXHU1M0QxXHU3M0IwICR7bWlzc2luZ0ZpbGVzLmxlbmd0aH0gXHU0RTJBXHU1RjE1XHU3NTI4XHU3Njg0XHU4RDQ0XHU2RTkwXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU0RjQ2XHU3RUU3XHU3RUVEXHU2Nzg0XHU1RUZBYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTRFMERcdTRFMDBcdTgxRjRcdUZGMENcdTY3ODRcdTVFRkFcdTU5MzFcdThEMjVcdUZGMDFcdTY3MDkgJHttaXNzaW5nRmlsZXMubGVuZ3RofSBcdTRFMkFcdTVGMTVcdTc1MjhcdTc2ODRcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhgKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGBcXG5bY2h1bmstdmVyaWZ5LXBsdWdpbl0gXHUyNzA1IFx1NjI0MFx1NjcwOVx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1OTBGRFx1NkI2M1x1Nzg2RVx1RkYwOFx1NTE3MVx1OUE4Q1x1OEJDMSAke3JlZmVyZW5jZWRGaWxlcy5zaXplfSBcdTRFMkFcdTVGMTVcdTc1MjhcdUZGMDlgKTtcbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuLyoqXG4gKiBcdTRGMThcdTUzMTZcdTRFRTNcdTc4MDFcdTUyMDZcdTUyNzJcdTYzRDJcdTRFRjZcdUZGMUFcdTU5MDRcdTc0MDZcdTdBN0EgY2h1bmtcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wdGltaXplQ2h1bmtzUGx1Z2luKCk6IFBsdWdpbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ29wdGltaXplLWNodW5rcycsXG4gICAgZ2VuZXJhdGVCdW5kbGUoX29wdGlvbnM6IE91dHB1dE9wdGlvbnMsIGJ1bmRsZTogT3V0cHV0QnVuZGxlKSB7XG4gICAgICBjb25zdCBlbXB0eUNodW5rczogc3RyaW5nW10gPSBbXTtcbiAgICAgIGNvbnN0IGNodW5rUmVmZXJlbmNlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcblxuICAgICAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNodW5rXSBvZiBPYmplY3QuZW50cmllcyhidW5kbGUpKSB7XG4gICAgICAgIGNvbnN0IGNodW5rQW55ID0gY2h1bmsgYXMgYW55O1xuICAgICAgICBpZiAoY2h1bmtBbnkudHlwZSA9PT0gJ2NodW5rJyAmJiBjaHVua0FueS5jb2RlICYmIGNodW5rQW55LmNvZGUudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGVtcHR5Q2h1bmtzLnB1c2goZmlsZU5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaHVua0FueS50eXBlID09PSAnY2h1bmsnICYmIGNodW5rQW55LmltcG9ydHMpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGltcG9ydGVkIG9mIGNodW5rQW55LmltcG9ydHMpIHtcbiAgICAgICAgICAgIGlmICghY2h1bmtSZWZlcmVuY2VzLmhhcyhpbXBvcnRlZCkpIHtcbiAgICAgICAgICAgICAgY2h1bmtSZWZlcmVuY2VzLnNldChpbXBvcnRlZCwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2h1bmtSZWZlcmVuY2VzLmdldChpbXBvcnRlZCkhLnB1c2goZmlsZU5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZW1wdHlDaHVua3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2h1bmtzVG9SZW1vdmU6IHN0cmluZ1tdID0gW107XG4gICAgICBjb25zdCBjaHVua3NUb0tlZXA6IHN0cmluZ1tdID0gW107XG5cbiAgICAgIGZvciAoY29uc3QgZW1wdHlDaHVuayBvZiBlbXB0eUNodW5rcykge1xuICAgICAgICBjb25zdCByZWZlcmVuY2VkQnkgPSBjaHVua1JlZmVyZW5jZXMuZ2V0KGVtcHR5Q2h1bmspIHx8IFtdO1xuICAgICAgICBpZiAocmVmZXJlbmNlZEJ5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25zdCBjaHVuayA9IGJ1bmRsZVtlbXB0eUNodW5rXTtcbiAgICAgICAgICBpZiAoY2h1bmsgJiYgKGNodW5rIGFzIGFueSkudHlwZSA9PT0gJ2NodW5rJykge1xuICAgICAgICAgICAgKGNodW5rIGFzIGFueSkuY29kZSA9ICdleHBvcnQge30nO1xuICAgICAgICAgICAgY2h1bmtzVG9LZWVwLnB1c2goZW1wdHlDaHVuayk7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oYFtvcHRpbWl6ZS1jaHVua3NdIFx1NEZERFx1NzU1OVx1ODhBQlx1NUYxNVx1NzUyOFx1NzY4NFx1N0E3QSBjaHVuazogJHtlbXB0eUNodW5rfSAoXHU4OEFCICR7cmVmZXJlbmNlZEJ5Lmxlbmd0aH0gXHU0RTJBIGNodW5rIFx1NUYxNVx1NzUyOFx1RkYwQ1x1NURGMlx1NkRGQlx1NTJBMFx1NTM2MFx1NEY0RFx1N0IyNilgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2h1bmtzVG9SZW1vdmUucHVzaChlbXB0eUNodW5rKTtcbiAgICAgICAgICBkZWxldGUgYnVuZGxlW2VtcHR5Q2h1bmtdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChjaHVua3NUb1JlbW92ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW29wdGltaXplLWNodW5rc10gXHU3OUZCXHU5NjY0XHU0RTg2ICR7Y2h1bmtzVG9SZW1vdmUubGVuZ3RofSBcdTRFMkFcdTY3MkFcdTg4QUJcdTVGMTVcdTc1MjhcdTc2ODRcdTdBN0EgY2h1bms6YCwgY2h1bmtzVG9SZW1vdmUpO1xuICAgICAgfVxuICAgICAgaWYgKGNodW5rc1RvS2VlcC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW29wdGltaXplLWNodW5rc10gXHU0RkREXHU3NTU5XHU0RTg2ICR7Y2h1bmtzVG9LZWVwLmxlbmd0aH0gXHU0RTJBXHU4OEFCXHU1RjE1XHU3NTI4XHU3Njg0XHU3QTdBIGNodW5rXHVGRjA4XHU1REYyXHU2REZCXHU1MkEwXHU1MzYwXHU0RjREXHU3QjI2XHVGRjA5OmAsIGNodW5rc1RvS2VlcCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFx1cmwudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvdXJsLnRzXCI7LyoqXG4gKiBVUkwgXHU3NkY4XHU1MTczXHU2M0QyXHU0RUY2XG4gKiBcdTc4NkVcdTRGREQgYmFzZSBVUkwgXHU2QjYzXHU3ODZFXG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1t1cmxdJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1t1cmxdJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbdXJsXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbdXJsXScsIC4uLmFyZ3MpLFxufTtcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB0eXBlIHsgQ2h1bmtJbmZvLCBPdXRwdXRPcHRpb25zLCBPdXRwdXRCdW5kbGUgfSBmcm9tICdyb2xsdXAnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyByZXNvbHZlIGFzIHJlc29sdmVQYXRoLCBkaXJuYW1lIH0gZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5cbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSBkaXJuYW1lKF9fZmlsZW5hbWUpO1xuXG5mdW5jdGlvbiBnZXRCdWlsZFRpbWVzdGFtcEZvclF1ZXJ5KCk6IHN0cmluZyB7XG4gIC8vIFx1NEYxOFx1NTE0OFx1NEY3Rlx1NzUyOFx1NTE2OFx1OTFDRlx1Njc4NFx1NUVGQVx1ODExQVx1NjcyQ1x1NkNFOFx1NTE2NVx1NzY4NFx1NjVGNlx1OTVGNFx1NjIzM1x1RkYwOFx1NEUwRSBhZGRWZXJzaW9uUGx1Z2luIFx1NEZERFx1NjMwMVx1NEUwMFx1ODFGNFx1RkYwOVxuICBpZiAocHJvY2Vzcy5lbnYuQlRDX0JVSUxEX1RJTUVTVEFNUCkge1xuICAgIHJldHVybiBwcm9jZXNzLmVudi5CVENfQlVJTERfVElNRVNUQU1QO1xuICB9XG4gIC8vIFx1NTE3Nlx1NkIyMVx1OEJGQlx1NTNENiAuYnVpbGQtdGltZXN0YW1wXHVGRjA4XHU0RTBFIGFkZFZlcnNpb25QbHVnaW4gXHU3Njg0XHU1QjlFXHU3M0IwXHU0RTAwXHU4MUY0XHVGRjA5XG4gIGNvbnN0IHRpbWVzdGFtcEZpbGUgPSByZXNvbHZlUGF0aChfX2Rpcm5hbWUsICcuLi8uLi8uLi8uYnVpbGQtdGltZXN0YW1wJyk7XG4gIGlmIChleGlzdHNTeW5jKHRpbWVzdGFtcEZpbGUpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRzID0gcmVhZEZpbGVTeW5jKHRpbWVzdGFtcEZpbGUsICd1dGYtOCcpLnRyaW0oKTtcbiAgICAgIGlmICh0cykgcmV0dXJuIHRzO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gaWdub3JlXG4gICAgfVxuICB9XG4gIC8vIFx1NjcwMFx1NTQwRVx1NTE1Q1x1NUU5NVx1RkYxQVx1NzUxRlx1NjIxMFx1NEUwMFx1NEUyQVx1RkYwOFx1NEUwRFx1NTE5OVx1NTZERVx1NjU4N1x1NEVGNlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NTI2Rlx1NEY1Q1x1NzUyOFx1RkYwOVxuICByZXR1cm4gRGF0ZS5ub3coKS50b1N0cmluZygzNik7XG59XG5cbi8qKlxuICogXHU3ODZFXHU0RkREIGJhc2UgVVJMIFx1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlQmFzZVVybFBsdWdpbihiYXNlVXJsOiBzdHJpbmcsIGFwcEhvc3Q6IHN0cmluZywgYXBwUG9ydDogbnVtYmVyLCBtYWluQXBwUG9ydDogc3RyaW5nKTogUGx1Z2luIHtcbiAgY29uc3QgaXNQcmV2aWV3QnVpbGQgPSBiYXNlVXJsLnN0YXJ0c1dpdGgoJ2h0dHAnKTtcbiAgY29uc3QgcWlhbmt1bkluZGV4SW1wb3J0UmVnZXggPSAvaW1wb3J0XFwoKFsnXCJdKVxcL2Fzc2V0c1xcLyhpbmRleHxtYWluKS0oW14nXCJdKylcXDFcXCkvZztcbiAgY29uc3QgYnVpbGRUaW1lc3RhbXAgPSBnZXRCdWlsZFRpbWVzdGFtcEZvclF1ZXJ5KCk7XG4gIGNvbnN0IHFpYW5rdW5JbmRleEltcG9ydEluSHRtbFJlZ2V4ID0gL2ltcG9ydFxcKFxccyooWydcIl0pKFxcL2Fzc2V0c1xcLyhpbmRleHxtYWluKS1bXidcIl0rKVxcMVxccypcXCkvZztcblxuICAvKipcbiAgICogXHU0RkVFXHU1OTBEIHZpdGUtcGx1Z2luLXFpYW5rdW4gXHU3NTFGXHU2MjEwXHU3Njg0XHU1MzA1XHU4OEM1XHU1NjY4XHU5MUNDXHU0RjdGXHU3NTI4XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0IGltcG9ydCgnL2Fzc2V0cy9pbmRleC14eHguanMnKSBcdTc2ODRcdTk1RUVcdTk4OThcdUZGMUFcbiAgICogLSBcdTU3MjggcWlhbmt1biBcdTZDOTlcdTdCQjFcdTkxQ0NcdUZGMENcdThGRDlcdTRGMUFcdTYzMDlcdTIwMUNcdTVCQkZcdTRFM0Igb3JpZ2luXHUyMDFEXHU4OUUzXHU2NzkwXHVGRjBDXHU1QkZDXHU4MUY0XHU1QjUwXHU1RTk0XHU3NTI4XHU1MTY1XHU1M0UzIGNodW5rIFx1ODhBQlx1OTUxOVx1OEJFRlx1OEJGN1x1NkM0Mlx1NTIzMCBsYXlvdXQgXHU1N0RGXHU1NDBEXG4gICAqIC0gXHU4RkQ5XHU5MUNDXHU2NTM5XHU0RTNBXHVGRjFBXHU0RjE4XHU1MTQ4XHU0RjdGXHU3NTI4IHFpYW5rdW4gXHU2Q0U4XHU1MTY1XHU3Njg0IF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fXHVGRjA4XHU5MDFBXHU1RTM4XHU0RTNBXHU1QjUwXHU1RTk0XHU3NTI4IG9yaWdpblx1RkYwOVx1RkYwQ1x1NTQyNlx1NTIxOVx1NTZERVx1OTAwMFx1NTIzMCB3aW5kb3cubG9jYXRpb24ub3JpZ2luXG4gICAqL1xuICBmdW5jdGlvbiBwYXRjaFFpYW5rdW5JbmRleEltcG9ydHMoY29kZTogc3RyaW5nKTogeyBjb2RlOiBzdHJpbmc7IG1vZGlmaWVkOiBib29sZWFuIH0ge1xuICAgIGlmICghcWlhbmt1bkluZGV4SW1wb3J0UmVnZXgudGVzdChjb2RlKSkge1xuICAgICAgcmV0dXJuIHsgY29kZSwgbW9kaWZpZWQ6IGZhbHNlIH07XG4gICAgfVxuICAgIHFpYW5rdW5JbmRleEltcG9ydFJlZ2V4Lmxhc3RJbmRleCA9IDA7XG5cbiAgICBjb25zdCBoZWxwZXJOYW1lID0gJ19fYnRjUWlhbmt1bkFzc2V0T3JpZ2luJztcbiAgICBjb25zdCB0c05hbWUgPSAnX19idGNCdWlsZFYnO1xuICAgIGNvbnN0IGhlbHBlckRlY2wgPVxuICAgICAgYGNvbnN0ICR7aGVscGVyTmFtZX09KCgpPT57dHJ5e2NvbnN0IHA9d2luZG93JiZ3aW5kb3cuX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX187YCArXG4gICAgICBgaWYocCYmdHlwZW9mIHA9PT0nc3RyaW5nJyl7Y29uc3Qgcz1wLnJlcGxhY2UoL1xcXFwvJC8sJycpO2AgK1xuICAgICAgYGlmKHMuc3RhcnRzV2l0aCgnaHR0cCcpfHxzLnN0YXJ0c1dpdGgoJy8vJykpcmV0dXJuIHM7YCArXG4gICAgICBgcmV0dXJuICh3aW5kb3cubG9jYXRpb24mJndpbmRvdy5sb2NhdGlvbi5vcmlnaW4/d2luZG93LmxvY2F0aW9uLm9yaWdpbjonJykrczt9YCArXG4gICAgICBgfWNhdGNoe31yZXR1cm4gKHdpbmRvdy5sb2NhdGlvbiYmd2luZG93LmxvY2F0aW9uLm9yaWdpbik/d2luZG93LmxvY2F0aW9uLm9yaWdpbjonJzt9KSgpO2A7XG4gICAgY29uc3QgdHNEZWNsID0gYGNvbnN0ICR7dHNOYW1lfT0nJHtidWlsZFRpbWVzdGFtcH0nO2A7XG5cbiAgICBsZXQgbmV3Q29kZSA9IGNvZGUucmVwbGFjZShxaWFua3VuSW5kZXhJbXBvcnRSZWdleCwgKF9tLCBfcSwgX2tpbmQsIHJlc3QpID0+IHtcbiAgICAgIC8vIHJlc3Q6IFwieHh4eC5qc1wiIFx1OTFDQ1x1NzY4NFx1NEY1OVx1NEUwQlx1OTBFOFx1NTIwNlx1RkYwOGhhc2ggKyAuanNcdUZGMDlcbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OEZGRFx1NTJBMCA/dj0gXHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHVGRjBDXHU5MDdGXHU1MTREXHU1QkJGXHU0RTNCL1x1NkQ0Rlx1ODlDOFx1NTY2OC9DRE4gXHU1OTBEXHU3NTI4XHU2NUU3XHU1MTY1XHU1M0UzXHU4MTFBXHU2NzJDXHU1QkZDXHU4MUY0XHU2MzAxXHU3RUVEXHU4QkY3XHU2QzQyXHU2NUU3IGNodW5rXG4gICAgICByZXR1cm4gYGltcG9ydCgvKiBAdml0ZS1pZ25vcmUgKi8gKCR7aGVscGVyTmFtZX0gKyAnL2Fzc2V0cy8ke19raW5kfS0ke3Jlc3R9JyArICc/dj0nICsgJHt0c05hbWV9KSlgO1xuICAgIH0pO1xuXG4gICAgaWYgKCFuZXdDb2RlLmluY2x1ZGVzKGhlbHBlckRlY2wpKSB7XG4gICAgICAvLyBcdTVDM0RcdTkxQ0ZcdTVDMTFcdTRGQjVcdTUxNjVcdUZGMUFcdTUzRUFcdTU3MjhcdTk3MDBcdTg5ODFcdTY1RjZcdTYzRDJcdTUxNjUgaGVscGVyXHVGRjBDXHU0RTAwXHU2QjIxXHU1MzczXHU1M0VGXG4gICAgICBuZXdDb2RlID0gYCR7dHNEZWNsfVxcbiR7aGVscGVyRGVjbH1cXG4ke25ld0NvZGV9YDtcbiAgICB9XG4gICAgcmV0dXJuIHsgY29kZTogbmV3Q29kZSwgbW9kaWZpZWQ6IHRydWUgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2Vuc3VyZS1iYXNlLXVybCcsXG4gICAgcmVuZGVyQ2h1bmsoY29kZTogc3RyaW5nLCBjaHVuazogQ2h1bmtJbmZvLCBfb3B0aW9uczogYW55KSB7XG4gICAgICAvLyBcdTRFMERcdTUxOERcdThERjNcdThGQzcgdmVuZG9yIFx1N0I0OVx1N0IyQ1x1NEUwOVx1NjVCOVx1NUU5M1x1RkYwQ1x1Nzg2RVx1NEZERFx1NjI0MFx1NjcwOVx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1OTBGRFx1NkI2M1x1Nzg2RVxuICAgICAgLy8gXHU1NkUwXHU0RTNBIHZlbmRvciBcdTdCNDlcdTVFOTNcdTRFMkRcdTRFNUZcdTUzRUZcdTgwRkRcdTUzMDVcdTU0MkJcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdTc2ODRcdThENDRcdTZFOTBcdThERUZcdTVGODRcblxuICAgICAgbGV0IG5ld0NvZGUgPSBjb2RlO1xuICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRCBxaWFua3VuIFx1NTMwNVx1ODhDNVx1NTY2OFx1NzY4NFx1N0VERFx1NUJGOSAvYXNzZXRzL2luZGV4LXh4eC5qcyBcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdUZGMDhcdThERThcdTU3REZcdTVCQkZcdTRFM0JcdTRGMUEgNDA0XHVGRjA5XG4gICAgICB7XG4gICAgICAgIGNvbnN0IHBhdGNoZWQgPSBwYXRjaFFpYW5rdW5JbmRleEltcG9ydHMobmV3Q29kZSk7XG4gICAgICAgIGlmIChwYXRjaGVkLm1vZGlmaWVkKSB7XG4gICAgICAgICAgbmV3Q29kZSA9IHBhdGNoZWQuY29kZTtcbiAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGlzUHJldmlld0J1aWxkKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aFJlZ2V4ID0gLyhbXCInYF0pKFxcL2Fzc2V0c1xcL1teXCInYFxcc10rKShcXD9bXlwiJ2BcXHNdKik/L2c7XG4gICAgICAgIGlmIChyZWxhdGl2ZVBhdGhSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShyZWxhdGl2ZVBhdGhSZWdleCwgKF9tYXRjaCwgcXVvdGUsIHBhdGgsIHF1ZXJ5ID0gJycpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgJHtxdW90ZX0ke2Jhc2VVcmwucmVwbGFjZSgvXFwvJC8sICcnKX0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MERcdTk1MTlcdThCRUZcdTc2ODRcdTdBRUZcdTUzRTNcdUZGMDhcdTRFM0JcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTMgLT4gXHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzXHVGRjA5XG4gICAgICAvLyBcdTUzMzlcdTkxNEQgaHR0cDovL2xvY2FsaG9zdDo0MTgwL2Fzc2V0cy94eHggXHU2MjE2IGh0dHA6Ly8xMC44MC44LjE5OTo0MTgwL2Fzc2V0cy94eHhcbiAgICAgIGNvbnN0IHdyb25nUG9ydEh0dHBSZWdleCA9IG5ldyBSZWdFeHAoYGh0dHA6Ly8oJHthcHBIb3N0fXxsb2NhbGhvc3QpOiR7bWFpbkFwcFBvcnR9KC9hc3NldHMvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKTtcbiAgICAgIGlmICh3cm9uZ1BvcnRIdHRwUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHdyb25nUG9ydEh0dHBSZWdleCwgKF9tYXRjaCwgaG9zdCwgcGF0aCwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgIC8vIFx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOCBiYXNlVXJsXHVGRjA4XHU1MzA1XHU1NDJCXHU1QjhDXHU2NTc0IFVSTFx1RkYwOVxuICAgICAgICAgIGlmIChpc1ByZXZpZXdCdWlsZCkge1xuICAgICAgICAgICAgcmV0dXJuIGAke2Jhc2VVcmwucmVwbGFjZSgvXFwvJC8sICcnKX0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBcdTVGMDBcdTUzRDFcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjhcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcbiAgICAgICAgICByZXR1cm4gYGh0dHA6Ly8ke2hvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICB9KTtcbiAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTUzMzlcdTkxNEQgLy9sb2NhbGhvc3Q6NDE4MC9hc3NldHMveHh4IFx1NjIxNiAvLzEwLjgwLjguMTk5OjQxODAvYXNzZXRzL3h4eFxuICAgICAgY29uc3Qgd3JvbmdQb3J0UHJvdG9jb2xSZWdleCA9IG5ldyBSZWdFeHAoYC8vKCR7YXBwSG9zdH18bG9jYWxob3N0KToke21haW5BcHBQb3J0fSgvYXNzZXRzL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyk7XG4gICAgICBpZiAod3JvbmdQb3J0UHJvdG9jb2xSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uod3JvbmdQb3J0UHJvdG9jb2xSZWdleCwgKF9tYXRjaCwgaG9zdCwgcGF0aCwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgIC8vIFx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOCBiYXNlVXJsXHVGRjA4XHU1MzA1XHU1NDJCXHU1QjhDXHU2NTc0IFVSTFx1RkYwOVxuICAgICAgICAgIGlmIChpc1ByZXZpZXdCdWlsZCkge1xuICAgICAgICAgICAgcmV0dXJuIGAke2Jhc2VVcmwucmVwbGFjZSgvXFwvJC8sICcnKX0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBcdTVGMDBcdTUzRDFcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjhcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcbiAgICAgICAgICByZXR1cm4gYC8vJHtob3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgfSk7XG4gICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGF0dGVybnMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICByZWdleDogbmV3IFJlZ0V4cChgKGh0dHA6Ly8pKGxvY2FsaG9zdHwke2FwcEhvc3R9KToke21haW5BcHBQb3J0fSgvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKSxcbiAgICAgICAgICByZXBsYWNlbWVudDogKF9tYXRjaDogc3RyaW5nLCBwcm90b2NvbDogc3RyaW5nLCBfaG9zdDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGAke3Byb3RvY29sfSR7YXBwSG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKGAoLy8pKGxvY2FsaG9zdHwke2FwcEhvc3R9KToke21haW5BcHBQb3J0fSgvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKSxcbiAgICAgICAgICByZXBsYWNlbWVudDogKF9tYXRjaDogc3RyaW5nLCBwcm90b2NvbDogc3RyaW5nLCBfaG9zdDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGAke3Byb3RvY29sfSR7YXBwSG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKGAoW1wiJ1xcYF0pKGh0dHA6Ly8pKGxvY2FsaG9zdHwke2FwcEhvc3R9KToke21haW5BcHBQb3J0fSgvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKSxcbiAgICAgICAgICByZXBsYWNlbWVudDogKF9tYXRjaDogc3RyaW5nLCBxdW90ZTogc3RyaW5nLCBwcm90b2NvbDogc3RyaW5nLCBfaG9zdDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGAke3F1b3RlfSR7cHJvdG9jb2x9JHthcHBIb3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVnZXg6IG5ldyBSZWdFeHAoYChbXCInXFxgXSkoLy8pKGxvY2FsaG9zdHwke2FwcEhvc3R9KToke21haW5BcHBQb3J0fSgvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKSxcbiAgICAgICAgICByZXBsYWNlbWVudDogKF9tYXRjaDogc3RyaW5nLCBxdW90ZTogc3RyaW5nLCBwcm90b2NvbDogc3RyaW5nLCBfaG9zdDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGAke3F1b3RlfSR7cHJvdG9jb2x9JHthcHBIb3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXTtcblxuICAgICAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIHBhdHRlcm5zKSB7XG4gICAgICAgIGlmIChwYXR0ZXJuLnJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHBhdHRlcm4ucmVnZXgsIHBhdHRlcm4ucmVwbGFjZW1lbnQgYXMgYW55KTtcbiAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEXHU0RTg2ICR7Y2h1bmsuZmlsZU5hbWV9IFx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NCAoJHttYWluQXBwUG9ydH0gLT4gJHthcHBQb3J0fSlgKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjb2RlOiBuZXdDb2RlLFxuICAgICAgICAgIG1hcDogbnVsbCxcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBnZW5lcmF0ZUJ1bmRsZShfb3B0aW9uczogT3V0cHV0T3B0aW9ucywgYnVuZGxlOiBPdXRwdXRCdW5kbGUpIHtcbiAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICBjb25zdCBjOiBhbnkgPSBjaHVuaztcbiAgICAgICAgaWYgKGMudHlwZSA9PT0gJ2NodW5rJyAmJiBjLmNvZGUpIHtcbiAgICAgICAgICAvLyBcdTRFMERcdTUxOERcdThERjNcdThGQzcgdmVuZG9yIFx1N0I0OVx1N0IyQ1x1NEUwOVx1NjVCOVx1NUU5M1x1RkYwQ1x1Nzg2RVx1NEZERFx1NjI0MFx1NjcwOVx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1OTBGRFx1NkI2M1x1Nzg2RVxuICAgICAgICAgIGxldCBuZXdDb2RlID0gYy5jb2RlO1xuICAgICAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuXG4gICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkVFXHU1OTBEIHFpYW5rdW4gXHU1MzA1XHU4OEM1XHU1NjY4XHU3Njg0XHU3RUREXHU1QkY5IC9hc3NldHMvaW5kZXgteHh4LmpzIFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1RkYwOFx1OERFOFx1NTdERlx1NUJCRlx1NEUzQlx1NEYxQSA0MDRcdUZGMDlcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb25zdCBwYXRjaGVkID0gcGF0Y2hRaWFua3VuSW5kZXhJbXBvcnRzKG5ld0NvZGUpO1xuICAgICAgICAgICAgaWYgKHBhdGNoZWQubW9kaWZpZWQpIHtcbiAgICAgICAgICAgICAgbmV3Q29kZSA9IHBhdGNoZWQuY29kZTtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChpc1ByZXZpZXdCdWlsZCkge1xuICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVQYXRoUmVnZXggPSAvKFtcIidgXSkoXFwvYXNzZXRzXFwvW15cIidgXFxzXSspKFxcP1teXCInYFxcc10qKT8vZztcbiAgICAgICAgICAgIGlmIChyZWxhdGl2ZVBhdGhSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2UocmVsYXRpdmVQYXRoUmVnZXgsIChfbWF0Y2g6IHN0cmluZywgcXVvdGU6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cXVvdGV9JHtiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MERcdTk1MTlcdThCRUZcdTc2ODRcdTdBRUZcdTUzRTNcdUZGMDhcdTRFM0JcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTMgLT4gXHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzXHVGRjA5XG4gICAgICAgICAgLy8gXHU1MzM5XHU5MTREIGh0dHA6Ly9sb2NhbGhvc3Q6NDE4MC9hc3NldHMveHh4IFx1NjIxNiBodHRwOi8vMTAuODAuOC4xOTk6NDE4MC9hc3NldHMveHh4XG4gICAgICAgICAgY29uc3Qgd3JvbmdQb3J0SHR0cFJlZ2V4ID0gbmV3IFJlZ0V4cChgaHR0cDovLygke2FwcEhvc3R9fGxvY2FsaG9zdCk6JHttYWluQXBwUG9ydH0oL2Fzc2V0cy9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpO1xuICAgICAgICAgIGlmICh3cm9uZ1BvcnRIdHRwUmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZSh3cm9uZ1BvcnRIdHRwUmVnZXgsIChfbWF0Y2g6IHN0cmluZywgaG9zdDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgICAvLyBcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjggYmFzZVVybFx1RkYwOFx1NTMwNVx1NTQyQlx1NUI4Q1x1NjU3NCBVUkxcdUZGMDlcbiAgICAgICAgICAgICAgaWYgKGlzUHJldmlld0J1aWxkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke2Jhc2VVcmwucmVwbGFjZSgvXFwvJC8sICcnKX0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIFx1NUYwMFx1NTNEMVx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOFx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFM1xuICAgICAgICAgICAgICByZXR1cm4gYGh0dHA6Ly8ke2hvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU1MzM5XHU5MTREIC8vbG9jYWxob3N0OjQxODAvYXNzZXRzL3h4eCBcdTYyMTYgLy8xMC44MC44LjE5OTo0MTgwL2Fzc2V0cy94eHhcbiAgICAgICAgICBjb25zdCB3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4ID0gbmV3IFJlZ0V4cChgLy8oJHthcHBIb3N0fXxsb2NhbGhvc3QpOiR7bWFpbkFwcFBvcnR9KC9hc3NldHMvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKTtcbiAgICAgICAgICBpZiAod3JvbmdQb3J0UHJvdG9jb2xSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHdyb25nUG9ydFByb3RvY29sUmVnZXgsIChfbWF0Y2g6IHN0cmluZywgaG9zdDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgICAvLyBcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdUZGMUFcdTRGN0ZcdTc1MjggYmFzZVVybFx1RkYwOFx1NTMwNVx1NTQyQlx1NUI4Q1x1NjU3NCBVUkxcdUZGMDlcbiAgICAgICAgICAgICAgaWYgKGlzUHJldmlld0J1aWxkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke2Jhc2VVcmwucmVwbGFjZSgvXFwvJC8sICcnKX0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIFx1NUYwMFx1NTNEMVx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOFx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFM1xuICAgICAgICAgICAgICByZXR1cm4gYC8vJHtob3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgICAgKGNodW5rIGFzIGFueSkuY29kZSA9IG5ld0NvZGU7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtYmFzZS11cmxdIFx1NTcyOCBnZW5lcmF0ZUJ1bmRsZSBcdTRFMkRcdTRGRUVcdTU5MERcdTRFODYgJHtmaWxlTmFtZX0gXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGMudHlwZSA9PT0gJ2Fzc2V0JyAmJiBmaWxlTmFtZSA9PT0gJ2luZGV4Lmh0bWwnKSB7XG4gICAgICAgICAgLy8gXHU1OTA0XHU3NDA2IEhUTUwgXHU2NTg3XHU0RUY2XHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XG4gICAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1OTgyXHU2NzlDIFZpdGUgXHU5MTREXHU3RjZFXHU2QjYzXHU3ODZFXHVGRjA4YmFzZTogJy8nLCBhc3NldHNEaXI6ICdhc3NldHMnLCByb2xsdXBPcHRpb25zLm91dHB1dC5jaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJ1x1RkYwOVx1RkYwQ1xuICAgICAgICAgIC8vIFZpdGUgXHU1RTk0XHU4QkU1XHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXHU2QjYzXHU3ODZFXHU3Njg0XHU4REVGXHU1Rjg0XHVGRjBDXHU0RTBEXHU5NzAwXHU4OTgxXHU0RkVFXHU1OTBEXHUzMDAyXG4gICAgICAgICAgLy8gXHU4RkQ5XHU5MUNDXHU1M0VBXHU1OTA0XHU3NDA2XHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHU2NUY2XHU3Njg0XHU3QUVGXHU1M0UzXHU0RkVFXHU1OTBEXHVGRjBDXHU0RUU1XHU1M0NBXHU0RkVFXHU1OTBEXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHUzMDAyXG4gICAgICAgICAgbGV0IGh0bWxDb250ZW50ID0gKChjIGFzIGFueSkuc291cmNlKSBhcyBzdHJpbmc7XG4gICAgICAgICAgbGV0IGh0bWxNb2RpZmllZCA9IGZhbHNlO1xuXG4gICAgICAgICAgLy8gXHU0RkVFXHU1OTBEXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0IC4vYXNzZXRzLyBcdTRFM0FcdTdFRERcdTVCRjlcdThERUZcdTVGODQgL2Fzc2V0cy9cdUZGMDhcdTU5ODJcdTY3OUNcdTUxRkFcdTczQjBcdUZGMDlcbiAgICAgICAgICBjb25zdCByZWxhdGl2ZUFzc2V0UmVnZXggPSAvKGhyZWZ8c3JjKT1bXCInXShcXC5cXC9hc3NldHNcXC9bXlwiJ10rKShcXD9bXlwiJ10qKT9bXCInXS9nO1xuICAgICAgICAgIGlmIChyZWxhdGl2ZUFzc2V0UmVnZXgudGVzdChodG1sQ29udGVudCkpIHtcbiAgICAgICAgICAgIGh0bWxDb250ZW50ID0gaHRtbENvbnRlbnQucmVwbGFjZShyZWxhdGl2ZUFzc2V0UmVnZXgsIChfbWF0Y2gsIGF0dHIsIHBhdGgsIHF1ZXJ5ID0gJycpID0+IHtcbiAgICAgICAgICAgICAgLy8gXHU1QzA2XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHU4RjZDXHU2MzYyXHU0RTNBXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XG4gICAgICAgICAgICAgIGNvbnN0IGFic29sdXRlUGF0aCA9IHBhdGgucmVwbGFjZSgvXlxcLi8sICcnKTtcbiAgICAgICAgICAgICAgaHRtbE1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTRGRUVcdTU5MERcdTc2RjhcdTVCRjlcdThERUZcdTVGODQ6ICR7cGF0aH0gLT4gJHthYnNvbHV0ZVBhdGh9YCk7XG4gICAgICAgICAgICAgIHJldHVybiBgJHthdHRyfT1cIiR7YWJzb2x1dGVQYXRofSR7cXVlcnl9XCJgO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkVFXHU1OTBEIHZpdGUtcGx1Z2luLXFpYW5rdW4gXHU2Q0U4XHU1MTY1XHU1MjMwIGluZGV4Lmh0bWwgXHU1MTg1XHU4MDU0XHU4MTFBXHU2NzJDXHU0RTJEXHU3Njg0IGltcG9ydCgnL2Fzc2V0cy9pbmRleC14eHguanMnKVxuICAgICAgICAgIC8vIFx1OEJGNFx1NjYwRVx1RkYxQXFpYW5rdW4gXHU0RjFBXHU2MjhBXHU4QkU1XHU1MTg1XHU4MDU0XHU4MTFBXHU2NzJDIGV2YWwgXHU2MjEwIFZNIFx1NjI2N1x1ODg0Q1x1RkYxQlx1NTk4Mlx1Njc5Q1x1NEVDRFx1NjYyRiAvYXNzZXRzLyBcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdUZGMENcdTVDMzFcdTRGMUFcdTYzMDlcdTVCQkZcdTRFM0JcdTU3REZcdTU0MERcdTg5RTNcdTY3OTBcdUZGMDhcdTVCRkNcdTgxRjQgbGF5b3V0IFx1NTdERlx1NTQwRCA0MDRcdUZGMDlcdTMwMDJcbiAgICAgICAgICAvLyBcdThGRDlcdTkxQ0NcdTY1MzlcdTRFM0FcdUZGMUFcdTRGMThcdTUxNDhcdTc1MjggX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX19cdUZGMDhcdTVCNTBcdTVFOTRcdTc1MjggcHVibGljUGF0aC9vcmlnaW5cdUZGMDlcdUZGMENcdTVFNzZcdThGRkRcdTUyQTAgP3Y9IFx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1RkYwQ1x1OTA3Rlx1NTE0RFx1N0YxM1x1NUI1OFx1NjVFN1x1NTE2NVx1NTNFM1x1MzAwMlxuICAgICAgICAgIGlmIChxaWFua3VuSW5kZXhJbXBvcnRJbkh0bWxSZWdleC50ZXN0KGh0bWxDb250ZW50KSkge1xuICAgICAgICAgICAgcWlhbmt1bkluZGV4SW1wb3J0SW5IdG1sUmVnZXgubGFzdEluZGV4ID0gMDtcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbkV4cHIgPVxuICAgICAgICAgICAgICBgKCh0eXBlb2YgX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18hPT0ndW5kZWZpbmVkJyYmX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18pYCArXG4gICAgICAgICAgICAgIGA/bmV3IFVSTChfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXywodHlwZW9mIGxvY2F0aW9uIT09J3VuZGVmaW5lZCcmJmxvY2F0aW9uLm9yaWdpbil8fCcnKS5vcmlnaW5gICtcbiAgICAgICAgICAgICAgYDooKHR5cGVvZiBsb2NhdGlvbiE9PSd1bmRlZmluZWQnJiZsb2NhdGlvbi5vcmlnaW4pfHwnJykpYDtcbiAgICAgICAgICAgIGh0bWxDb250ZW50ID0gaHRtbENvbnRlbnQucmVwbGFjZShxaWFua3VuSW5kZXhJbXBvcnRJbkh0bWxSZWdleCwgKF9tLCBfcSwgYWJzUGF0aCkgPT4ge1xuICAgICAgICAgICAgICBodG1sTW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICByZXR1cm4gYGltcG9ydCgvKiBAdml0ZS1pZ25vcmUgKi8gKCR7b3JpZ2luRXhwcn0gKyAnJHthYnNQYXRofScgKyAnP3Y9JHtidWlsZFRpbWVzdGFtcH0nKSlgO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtYmFzZS11cmxdIFx1NEZFRVx1NTkwRCBpbmRleC5odG1sIFx1NTE4NVx1ODA1NCBpbXBvcnQoL2Fzc2V0cy9pbmRleC0qLmpzKSBcdTVFNzZcdThGRkRcdTUyQTAgdj0ke2J1aWxkVGltZXN0YW1wfWApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NTFGQVx1NzNCMFx1NjgzOVx1NzZFRVx1NUY1NVx1NzY4NFx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1RkYwOFx1NTk4MiAvaW5kZXguanNcdUZGMDlcdUZGMENcdThCRjRcdTY2MEVcdTkxNERcdTdGNkVcdTY3MDlcdTk1RUVcdTk4OThcdUZGMENcdThCQjBcdTVGNTVcdThCNjZcdTU0NEFcbiAgICAgICAgICAvLyBcdTZCNjNcdTVFMzhcdTYwQzVcdTUxQjVcdTRFMEJcdUZGMENWaXRlIFx1NUU5NFx1OEJFNVx1NzUxRlx1NjIxMCAvYXNzZXRzL1tuYW1lXS1baGFzaF0uanMgXHU4RkQ5XHU2ODM3XHU3Njg0XHU4REVGXHU1Rjg0XG4gICAgICAgICAgY29uc3Qgcm9vdEpzUmVnZXggPSAvKGhyZWZ8c3JjKT1bXCInXShcXC8oW14vXStcXC4oanN8bWpzKSkpKFxcP1teXCInXSopP1tcIiddL2c7XG4gICAgICAgICAgaWYgKHJvb3RKc1JlZ2V4LnRlc3QoaHRtbENvbnRlbnQpKSB7XG4gICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gaHRtbENvbnRlbnQubWF0Y2gocm9vdEpzUmVnZXgpO1xuICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTI2QTBcdUZFMEYgIFx1NjhDMFx1NkQ0Qlx1NTIzMFx1NjgzOVx1NzZFRVx1NUY1NVx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1RkYwQ1x1OEZEOVx1OTAxQVx1NUUzOFx1NEUwRFx1NUU5NFx1OEJFNVx1NTFGQVx1NzNCMFx1MzAwMlx1OEJGN1x1NjhDMFx1NjdFNSBWaXRlIFx1OTE0RFx1N0Y2RVx1RkYwOGJhc2UsIGFzc2V0c0Rpciwgcm9sbHVwT3B0aW9ucy5vdXRwdXQuY2h1bmtGaWxlTmFtZXNcdUZGMDk6YCwgbWF0Y2hlcyk7XG4gICAgICAgICAgICAgIC8vIFx1NEZFRVx1NTkwRFx1OEZEOVx1NEU5Qlx1OERFRlx1NUY4NFx1RkYwOFx1NEY1Q1x1NEUzQVx1NTE1Q1x1NUU5NVx1NjVCOVx1Njg0OFx1RkYwOVxuICAgICAgICAgICAgICBodG1sQ29udGVudCA9IGh0bWxDb250ZW50LnJlcGxhY2Uocm9vdEpzUmVnZXgsIChfbWF0Y2gsIGF0dHIsIHBhdGgsIGZpbGVOYW1lLCBfZXh0LCBxdWVyeSA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXRoLnN0YXJ0c1dpdGgoJy9hc3NldHMvJykgJiYgIXBhdGguc3RhcnRzV2l0aCgnL2Zhdmljb24nKSAmJiAhcGF0aC5zdGFydHNXaXRoKCcvbG9nbycpICYmICFwYXRoLm1hdGNoKC9cXC4ocG5nfGpwZ3xqcGVnfGdpZnxzdmd8aWNvfGpzb24pJC8pKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBuZXdQYXRoID0gYC9hc3NldHMvJHtmaWxlTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgaHRtbE1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEXHU2ODM5XHU3NkVFXHU1RjU1XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHVGRjA4XHU1MTVDXHU1RTk1XHVGRjA5OiAke3BhdGh9IC0+ICR7bmV3UGF0aH1gKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthdHRyfT1cIiR7bmV3UGF0aH0ke3F1ZXJ5fVwiYDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9tYXRjaDtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qgcm9vdENzc1JlZ2V4ID0gLyhocmVmfHNyYyk9W1wiJ10oXFwvKFteL10rXFwuY3NzKSkoXFw/W15cIiddKik/W1wiJ10vZztcbiAgICAgICAgICBpZiAocm9vdENzc1JlZ2V4LnRlc3QoaHRtbENvbnRlbnQpKSB7XG4gICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gaHRtbENvbnRlbnQubWF0Y2gocm9vdENzc1JlZ2V4KTtcbiAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW2Vuc3VyZS1iYXNlLXVybF0gXHUyNkEwXHVGRTBGICBcdTY4QzBcdTZENEJcdTUyMzBcdTY4MzlcdTc2RUVcdTVGNTUgQ1NTIFx1OERFRlx1NUY4NFx1RkYwQ1x1OEZEOVx1OTAxQVx1NUUzOFx1NEUwRFx1NUU5NFx1OEJFNVx1NTFGQVx1NzNCMFx1MzAwMlx1OEJGN1x1NjhDMFx1NjdFNSBWaXRlIFx1OTE0RFx1N0Y2RTpgLCBtYXRjaGVzKTtcbiAgICAgICAgICAgICAgLy8gXHU0RkVFXHU1OTBEXHU4RkQ5XHU0RTlCXHU4REVGXHU1Rjg0XHVGRjA4XHU0RjVDXHU0RTNBXHU1MTVDXHU1RTk1XHU2NUI5XHU2ODQ4XHVGRjA5XG4gICAgICAgICAgICAgIGh0bWxDb250ZW50ID0gaHRtbENvbnRlbnQucmVwbGFjZShyb290Q3NzUmVnZXgsIChfbWF0Y2gsIGF0dHIsIHBhdGgsIGZpbGVOYW1lLCBxdWVyeSA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXRoLnN0YXJ0c1dpdGgoJy9hc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBgL2Fzc2V0cy8ke2ZpbGVOYW1lfWA7XG4gICAgICAgICAgICAgICAgICBodG1sTW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTRGRUVcdTU5MERcdTY4MzlcdTc2RUVcdTVGNTUgQ1NTIFx1OERFRlx1NUY4NFx1RkYwOFx1NTE1Q1x1NUU5NVx1RkYwOTogJHtwYXRofSAtPiAke25ld1BhdGh9YCk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYCR7YXR0cn09XCIke25ld1BhdGh9JHtxdWVyeX1cImA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBfbWF0Y2g7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChodG1sTW9kaWZpZWQpIHtcbiAgICAgICAgICAgIChjaHVuayBhcyBhbnkpLnNvdXJjZSA9IGh0bWxDb250ZW50O1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTRGRUVcdTU5MERcdTRFODYgaW5kZXguaHRtbCBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdThERUZcdTVGODRgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGNvcnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvY29ycy50c1wiOy8qKlxuICogQ09SUyBcdTYzRDJcdTRFRjZcbiAqIFx1NjUyRlx1NjMwMSBjcmVkZW50aWFscyBcdTc2ODQgQ09SUyBcdTRFMkRcdTk1RjRcdTRFRjZcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgVml0ZURldlNlcnZlciB9IGZyb20gJ3ZpdGUnO1xuXG4vKipcbiAqIENPUlMgXHU2M0QyXHU0RUY2XHVGRjA4XHU2NTJGXHU2MzAxIGNyZWRlbnRpYWxzXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3JzUGx1Z2luKCk6IFBsdWdpbiB7XG4gIGNvbnN0IGNvcnNEZXZNaWRkbGV3YXJlID0gKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSA9PiB7XG4gICAgY29uc3Qgb3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luO1xuXG4gICAgaWYgKG9yaWdpbikge1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgb3JpZ2luKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LVByaXZhdGUtTmV0d29yaycsICd0cnVlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1Qcml2YXRlLU5ldHdvcmsnLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtTWF4LUFnZScsICc4NjQwMCcpO1xuICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1MZW5ndGgnLCAnMCcpO1xuICAgICAgcmVzLmVuZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG5leHQoKTtcbiAgfTtcblxuICBjb25zdCBjb3JzUHJldmlld01pZGRsZXdhcmUgPSAocmVxOiBhbnksIHJlczogYW55LCBuZXh0OiBhbnkpID0+IHtcbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW47XG5cbiAgICAgIGlmIChvcmlnaW4pIHtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgb3JpZ2luKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnLCAndHJ1ZScpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyk7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgICAgfVxuXG4gICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLU1heC1BZ2UnLCAnODY0MDAnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtTGVuZ3RoJywgJzAnKTtcbiAgICAgIHJlcy5lbmQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW47XG4gICAgaWYgKG9yaWdpbikge1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgb3JpZ2luKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICB9XG5cbiAgICBuZXh0KCk7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY29ycy13aXRoLWNyZWRlbnRpYWxzJyxcbiAgICBlbmZvcmNlOiAncHJlJyxcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyOiBWaXRlRGV2U2VydmVyKSB7XG4gICAgICBjb25zdCBzdGFjayA9IChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjaztcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHN0YWNrKSkge1xuICAgICAgICBjb25zdCBmaWx0ZXJlZFN0YWNrID0gc3RhY2suZmlsdGVyKChpdGVtOiBhbnkpID0+XG4gICAgICAgICAgaXRlbS5oYW5kbGUgIT09IGNvcnNEZXZNaWRkbGV3YXJlICYmIGl0ZW0uaGFuZGxlICE9PSBjb3JzUHJldmlld01pZGRsZXdhcmVcbiAgICAgICAgKTtcbiAgICAgICAgKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrID0gW1xuICAgICAgICAgIHsgcm91dGU6ICcnLCBoYW5kbGU6IGNvcnNEZXZNaWRkbGV3YXJlIH0sXG4gICAgICAgICAgLi4uZmlsdGVyZWRTdGFjayxcbiAgICAgICAgXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoY29yc0Rldk1pZGRsZXdhcmUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgY29uZmlndXJlUHJldmlld1NlcnZlcihzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpIHtcbiAgICAgIGNvbnN0IHN0YWNrID0gKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc3RhY2spKSB7XG4gICAgICAgIGNvbnN0IGZpbHRlcmVkU3RhY2sgPSBzdGFjay5maWx0ZXIoKGl0ZW06IGFueSkgPT5cbiAgICAgICAgICBpdGVtLmhhbmRsZSAhPT0gY29yc0Rldk1pZGRsZXdhcmUgJiYgaXRlbS5oYW5kbGUgIT09IGNvcnNQcmV2aWV3TWlkZGxld2FyZVxuICAgICAgICApO1xuICAgICAgICAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2sgPSBbXG4gICAgICAgICAgeyByb3V0ZTogJycsIGhhbmRsZTogY29yc1ByZXZpZXdNaWRkbGV3YXJlIH0sXG4gICAgICAgICAgLi4uZmlsdGVyZWRTdGFjayxcbiAgICAgICAgXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoY29yc1ByZXZpZXdNaWRkbGV3YXJlKTtcbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGNzcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9jc3MudHNcIjsvKipcbiAqIENTUyBcdTc2RjhcdTUxNzNcdTYzRDJcdTRFRjZcbiAqIFx1Nzg2RVx1NEZERCBDU1MgXHU2NTg3XHU0RUY2XHU4OEFCXHU2QjYzXHU3ODZFXHU2MjUzXHU1MzA1XG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1tlbnN1cmUtY3NzXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbZW5zdXJlLWNzc10nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1tlbnN1cmUtY3NzXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbZW5zdXJlLWNzc10nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdHlwZSB7IE91dHB1dE9wdGlvbnMsIE91dHB1dEJ1bmRsZSB9IGZyb20gJ3JvbGx1cCc7XG5cbi8qKlxuICogXHU3ODZFXHU0RkREIENTUyBcdTY1ODdcdTRFRjZcdTg4QUJcdTZCNjNcdTc4NkVcdTYyNTNcdTUzMDVcdTc2ODRcdTYzRDJcdTRFRjZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZUNzc1BsdWdpbigpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdlbnN1cmUtY3NzLXBsdWdpbicsXG4gICAgZ2VuZXJhdGVCdW5kbGUoX29wdGlvbnM6IE91dHB1dE9wdGlvbnMsIGJ1bmRsZTogT3V0cHV0QnVuZGxlKSB7XG4gICAgICBjb25zdCBqc0ZpbGVzID0gT2JqZWN0LmtleXMoYnVuZGxlKS5maWx0ZXIoZmlsZSA9PiBmaWxlLmVuZHNXaXRoKCcuanMnKSk7XG4gICAgICBsZXQgaGFzSW5saW5lQ3NzID0gZmFsc2U7XG4gICAgICBjb25zdCBzdXNwaWNpb3VzRmlsZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgIGpzRmlsZXMuZm9yRWFjaChmaWxlID0+IHtcbiAgICAgICAgY29uc3QgY2h1bmsgPSBidW5kbGVbZmlsZV0gYXMgYW55O1xuICAgICAgICBpZiAoY2h1bmsgJiYgY2h1bmsuY29kZSAmJiB0eXBlb2YgY2h1bmsuY29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBjb25zdCBjb2RlID0gY2h1bmsuY29kZTtcblxuICAgICAgICAgIGNvbnN0IGlzTW9kdWxlUHJlbG9hZCA9IGNvZGUuaW5jbHVkZXMoJ21vZHVsZXByZWxvYWQnKSB8fCBjb2RlLmluY2x1ZGVzKCdyZWxMaXN0Jyk7XG4gICAgICAgICAgaWYgKGlzTW9kdWxlUHJlbG9hZCkgcmV0dXJuO1xuXG4gICAgICAgICAgY29uc3QgaXNLbm93bkxpYnJhcnkgPSBmaWxlLmluY2x1ZGVzKCd2dWUtY29yZScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCdlbGVtZW50LXBsdXMnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygndmVuZG9yJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ3Z1ZS1pMThuJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuaW5jbHVkZXMoJ3Z1ZS1yb3V0ZXInKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygnbGliLWVjaGFydHMnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygnbW9kdWxlLScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmluY2x1ZGVzKCdhcHAtY29tcG9zYWJsZXMnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5pbmNsdWRlcygnYXBwLXBhZ2VzJyk7XG4gICAgICAgICAgaWYgKGlzS25vd25MaWJyYXJ5KSByZXR1cm47XG5cbiAgICAgICAgICBjb25zdCBoYXNTdHlsZUVsZW1lbnRDcmVhdGlvbiA9IC9kb2N1bWVudFxcLmNyZWF0ZUVsZW1lbnRcXChbJ1wiXXN0eWxlWydcIl1cXCkvLnRlc3QoY29kZSkgJiZcbiAgICAgICAgICAgIC9cXC4odGV4dENvbnRlbnR8aW5uZXJIVE1MKVxccyo9Ly50ZXN0KGNvZGUpICYmXG4gICAgICAgICAgICAvXFx7W159XXsxMCx9XFx9Ly50ZXN0KGNvZGUpO1xuXG4gICAgICAgICAgY29uc3QgaGFzSW5zZXJ0U3R5bGVXaXRoQ3NzID0gL2luc2VydFN0eWxlXFxzKlxcKC8udGVzdChjb2RlKSAmJlxuICAgICAgICAgICAgL3RleHRcXC9jc3MvLnRlc3QoY29kZSkgJiZcbiAgICAgICAgICAgIC9cXHtbXn1dezIwLH1cXH0vLnRlc3QoY29kZSk7XG5cbiAgICAgICAgICBjb25zdCBzdHlsZVRhZ01hdGNoID0gY29kZS5tYXRjaCgvPHN0eWxlW14+XSo+Lyk7XG4gICAgICAgICAgY29uc3QgaGFzU3R5bGVUYWdXaXRoQ29udGVudCA9IHN0eWxlVGFnTWF0Y2ggJiZcbiAgICAgICAgICAgICFzdHlsZVRhZ01hdGNoWzBdLmluY2x1ZGVzKFwiJ1wiKSAmJlxuICAgICAgICAgICAgIXN0eWxlVGFnTWF0Y2hbMF0uaW5jbHVkZXMoJ1wiJykgJiZcbiAgICAgICAgICAgIC9cXHtbXn1dezIwLH1cXH0vLnRlc3QoY29kZSk7XG5cbiAgICAgICAgICBjb25zdCBoYXNJbmxpbmVDc3NTdHJpbmcgPSAvWydcImBdW14nXCJgXXs1MCx9OlxccypbXidcImBdezEwLH07XFxzKlteJ1wiYF17MTAsfVsnXCJgXS8udGVzdChjb2RlKSAmJlxuICAgICAgICAgICAgLyhjb2xvcnxiYWNrZ3JvdW5kfHdpZHRofGhlaWdodHxtYXJnaW58cGFkZGluZ3xib3JkZXJ8ZGlzcGxheXxwb3NpdGlvbnxmbGV4fGdyaWQpLy50ZXN0KGNvZGUpO1xuXG4gICAgICAgICAgaWYgKGhhc1N0eWxlRWxlbWVudENyZWF0aW9uIHx8IGhhc0luc2VydFN0eWxlV2l0aENzcyB8fCBoYXNTdHlsZVRhZ1dpdGhDb250ZW50IHx8IGhhc0lubGluZUNzc1N0cmluZykge1xuICAgICAgICAgICAgaGFzSW5saW5lQ3NzID0gdHJ1ZTtcbiAgICAgICAgICAgIHN1c3BpY2lvdXNGaWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgY29uc3QgcGF0dGVybnM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICBpZiAoaGFzU3R5bGVFbGVtZW50Q3JlYXRpb24pIHBhdHRlcm5zLnB1c2goJ1x1NTJBOFx1NjAwMVx1NTIxQlx1NUVGQSBzdHlsZSBcdTUxNDNcdTdEMjAnKTtcbiAgICAgICAgICAgIGlmIChoYXNJbnNlcnRTdHlsZVdpdGhDc3MpIHBhdHRlcm5zLnB1c2goJ2luc2VydFN0eWxlIFx1NTFGRFx1NjU3MCcpO1xuICAgICAgICAgICAgaWYgKGhhc1N0eWxlVGFnV2l0aENvbnRlbnQpIHBhdHRlcm5zLnB1c2goJzxzdHlsZT4gXHU2ODA3XHU3QjdFJyk7XG4gICAgICAgICAgICBpZiAoaGFzSW5saW5lQ3NzU3RyaW5nKSBwYXR0ZXJucy5wdXNoKCdcdTUxODVcdTgwNTQgQ1NTIFx1NUI1N1x1N0IyNlx1NEUzMicpO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbZW5zdXJlLWNzcy1wbHVnaW5dIFx1MjZBMFx1RkUwRiBcdThCNjZcdTU0NEFcdUZGMUFcdTU3MjggJHtmaWxlfSBcdTRFMkRcdTY4QzBcdTZENEJcdTUyMzBcdTUzRUZcdTgwRkRcdTc2ODRcdTUxODVcdTgwNTQgQ1NTXHVGRjA4XHU2QTIxXHU1RjBGXHVGRjFBJHtwYXR0ZXJucy5qb2luKCcsICcpfVx1RkYwOWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChoYXNJbmxpbmVDc3MpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdbZW5zdXJlLWNzcy1wbHVnaW5dIFx1MjZBMFx1RkUwRiBcdThCNjZcdTU0NEFcdUZGMUFcdTY4QzBcdTZENEJcdTUyMzAgQ1NTIFx1NTNFRlx1ODBGRFx1ODhBQlx1NTE4NVx1ODA1NFx1NTIzMCBKUyBcdTRFMkRcdUZGMENcdThGRDlcdTRGMUFcdTVCRkNcdTgxRjQgcWlhbmt1biBcdTY1RTBcdTZDRDVcdTZCNjNcdTc4NkVcdTUyQTBcdThGN0RcdTY4MzdcdTVGMEYnKTtcbiAgICAgICAgY29uc29sZS53YXJuKGBbZW5zdXJlLWNzcy1wbHVnaW5dIFx1NTNFRlx1NzU5MVx1NjU4N1x1NEVGNlx1RkYxQSR7c3VzcGljaW91c0ZpbGVzLmpvaW4oJywgJyl9YCk7XG4gICAgICAgIGNvbnNvbGUud2FybignW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdThCRjdcdTY4QzBcdTY3RTUgdml0ZS1wbHVnaW4tcWlhbmt1biBcdTkxNERcdTdGNkVcdTU0OEMgYnVpbGQuYXNzZXRzSW5saW5lTGltaXQgXHU4QkJFXHU3RjZFJyk7XG4gICAgICB9XG4gICAgfSxcbiAgICB3cml0ZUJ1bmRsZShfb3B0aW9uczogT3V0cHV0T3B0aW9ucywgYnVuZGxlOiBPdXRwdXRCdW5kbGUpIHtcbiAgICAgIGNvbnN0IGNzc0ZpbGVzID0gT2JqZWN0LmtleXMoYnVuZGxlKS5maWx0ZXIoZmlsZSA9PiBmaWxlLmVuZHNXaXRoKCcuY3NzJykpO1xuICAgICAgaWYgKGNzc0ZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbZW5zdXJlLWNzcy1wbHVnaW5dIFx1Mjc0QyBcdTk1MTlcdThCRUZcdUZGMUFcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTRFMkRcdTY1RTAgQ1NTIFx1NjU4N1x1NEVGNlx1RkYwMScpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbZW5zdXJlLWNzcy1wbHVnaW5dIFx1OEJGN1x1NjhDMFx1NjdFNVx1RkYxQScpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCcxLiBcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdTY2MkZcdTU0MjZcdTk3NTlcdTYwMDFcdTVCRkNcdTUxNjVcdTUxNjhcdTVDNDBcdTY4MzdcdTVGMEZcdUZGMDhpbmRleC5jc3MvdW5vLmNzcy9lbGVtZW50LXBsdXMuY3NzXHVGRjA5Jyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJzIuIFx1NjYyRlx1NTQyNlx1NjcwOSBWdWUgXHU3RUM0XHU0RUY2XHU0RTJEXHU0RjdGXHU3NTI4IDxzdHlsZT4gXHU2ODA3XHU3QjdFJyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJzMuIFVub0NTUyBcdTkxNERcdTdGNkVcdTY2MkZcdTU0MjZcdTZCNjNcdTc4NkVcdUZGMENcdTY2MkZcdTU0MjZcdTVCRkNcdTUxNjUgQHVub2NzcyBhbGwnKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignNC4gdml0ZS1wbHVnaW4tcWlhbmt1biBcdTc2ODQgdXNlRGV2TW9kZSBcdTY2MkZcdTU0MjZcdTU3MjhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTZCNjNcdTc4NkVcdTUxNzNcdTk1RUQnKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignNS4gYnVpbGQuYXNzZXRzSW5saW5lTGltaXQgXHU2NjJGXHU1NDI2XHU4QkJFXHU3RjZFXHU0RTNBIDBcdUZGMDhcdTc5ODFcdTZCNjJcdTUxODVcdTgwNTRcdUZGMDknKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW2Vuc3VyZS1jc3MtcGx1Z2luXSBcdTI3MDUgXHU2MjEwXHU1MjlGXHU2MjUzXHU1MzA1ICR7Y3NzRmlsZXMubGVuZ3RofSBcdTRFMkEgQ1NTIFx1NjU4N1x1NEVGNlx1RkYxQWAsIGNzc0ZpbGVzKTtcbiAgICAgICAgY3NzRmlsZXMuZm9yRWFjaChmaWxlID0+IHtcbiAgICAgICAgICBjb25zdCBhc3NldCA9IGJ1bmRsZVtmaWxlXSBhcyBhbnk7XG4gICAgICAgICAgaWYgKGFzc2V0ICYmIGFzc2V0LnNvdXJjZSkge1xuICAgICAgICAgICAgY29uc3Qgc2l6ZUtCID0gKGFzc2V0LnNvdXJjZS5sZW5ndGggLyAxMDI0KS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGAgIC0gJHtmaWxlfTogJHtzaXplS0J9S0JgKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGFzc2V0ICYmIGFzc2V0LmZpbGVOYW1lKSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oYCAgLSAke2Fzc2V0LmZpbGVOYW1lIHx8IGZpbGV9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXHZlcnNpb24udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvdmVyc2lvbi50c1wiOy8qKlxuICogXHU3MjQ4XHU2NzJDXHU1M0Y3XHU2M0QyXHU0RUY2XG4gKiBcdTRFM0EgSFRNTCBcdTY1ODdcdTRFRjZcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTZERkJcdTUyQTBcdTUxNjhcdTVDNDBcdTdFREZcdTRFMDBcdTc2ODRcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdTcyNDhcdTY3MkNcdTUzRjdcbiAqIFx1NzUyOFx1NEU4RVx1NkQ0Rlx1ODlDOFx1NTY2OFx1N0YxM1x1NUI1OFx1NjNBN1x1NTIzNlx1RkYwQ1x1NkJDRlx1NkIyMVx1Njc4NFx1NUVGQVx1OTBGRFx1NEYxQVx1NzUxRlx1NjIxMFx1NjVCMFx1NzY4NFx1NjVGNlx1OTVGNFx1NjIzM1xuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbdmVyc2lvbl0nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW3ZlcnNpb25dJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbdmVyc2lvbl0nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW3ZlcnNpb25dJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyByZXNvbHZlLCBkaXJuYW1lIH0gZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5cbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSBkaXJuYW1lKF9fZmlsZW5hbWUpO1xuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NjIxNlx1NzUxRlx1NjIxMFx1NTE2OFx1NUM0MFx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1NzI0OFx1NjcyQ1x1NTNGN1xuICogXHU0RjE4XHU1MTQ4XHU0RUNFXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU4QkZCXHU1M0Q2XHVGRjBDXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5XHU1MjE5XHU0RUNFXHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHU2NTg3XHU0RUY2XHU4QkZCXHU1M0Q2XHVGRjBDXHU5MEZEXHU2Q0ExXHU2NzA5XHU1MjE5XHU3NTFGXHU2MjEwXHU2NUIwXHU3Njg0XG4gKi9cbmZ1bmN0aW9uIGdldEJ1aWxkVGltZXN0YW1wKCk6IHN0cmluZyB7XG4gIC8vIDEuIFx1NEYxOFx1NTE0OFx1NEVDRVx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1OEJGQlx1NTNENlx1RkYwOFx1NzUzMVx1Njc4NFx1NUVGQVx1ODExQVx1NjcyQ1x1OEJCRVx1N0Y2RVx1RkYwOVxuICBpZiAocHJvY2Vzcy5lbnYuQlRDX0JVSUxEX1RJTUVTVEFNUCkge1xuICAgIHJldHVybiBwcm9jZXNzLmVudi5CVENfQlVJTERfVElNRVNUQU1QO1xuICB9XG5cbiAgLy8gMi4gXHU0RUNFXHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHU2NTg3XHU0RUY2XHU4QkZCXHU1M0Q2XHVGRjA4XHU1OTgyXHU2NzlDXHU1QjU4XHU1NzI4XHVGRjA5XG4gIGNvbnN0IHRpbWVzdGFtcEZpbGUgPSByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uLy4uLy5idWlsZC10aW1lc3RhbXAnKTtcbiAgaWYgKGV4aXN0c1N5bmModGltZXN0YW1wRmlsZSkpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdGltZXN0YW1wID0gcmVhZEZpbGVTeW5jKHRpbWVzdGFtcEZpbGUsICd1dGYtOCcpLnRyaW0oKTtcbiAgICAgIGlmICh0aW1lc3RhbXApIHtcbiAgICAgICAgcmV0dXJuIHRpbWVzdGFtcDtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgLy8gXHU1RkZEXHU3NTY1XHU4QkZCXHU1M0Q2XHU5NTE5XHU4QkVGXG4gICAgfVxuICB9XG5cbiAgLy8gMy4gXHU3NTFGXHU2MjEwXHU2NUIwXHU3Njg0XHU2NUY2XHU5NUY0XHU2MjMzXHU1RTc2XHU0RkREXHU1QjU4XHU1MjMwXHU2NTg3XHU0RUY2XHVGRjA4XHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU0RjdGXHU3NTI4XHU1NDBDXHU0RTAwXHU0RTJBXHVGRjA5XG4gIC8vIFx1NEY3Rlx1NzUyODM2XHU4RkRCXHU1MjM2XHU3RjE2XHU3ODAxXHVGRjBDXHU3NTFGXHU2MjEwXHU2NkY0XHU3N0VEXHU3Njg0XHU3MjQ4XHU2NzJDXHU1M0Y3XHVGRjA4XHU1MzA1XHU1NDJCXHU1QjU3XHU2QkNEXHU1NDhDXHU2NTcwXHU1QjU3XHVGRjBDXHU1OTgyIGwzazJqMWhcdUZGMDlcbiAgY29uc3QgdGltZXN0YW1wID0gRGF0ZS5ub3coKS50b1N0cmluZygzNik7XG4gIHRyeSB7XG4gICAgd3JpdGVGaWxlU3luYyh0aW1lc3RhbXBGaWxlLCB0aW1lc3RhbXAsICd1dGYtOCcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIFx1NUZGRFx1NzU2NVx1NTE5OVx1NTE2NVx1OTUxOVx1OEJFRlxuICB9XG4gIHJldHVybiB0aW1lc3RhbXA7XG59XG5cbi8qKlxuICogXHU0RTNBIEhUTUwgXHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU2REZCXHU1MkEwXHU3MjQ4XHU2NzJDXHU1M0Y3XHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRWZXJzaW9uUGx1Z2luKCk6IFBsdWdpbiB7XG4gIGNvbnN0IGJ1aWxkVGltZXN0YW1wID0gZ2V0QnVpbGRUaW1lc3RhbXAoKTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdhZGQtdmVyc2lvbicsXG4gICAgYXBwbHk6ICdidWlsZCcsXG4gICAgYnVpbGRTdGFydCgpIHtcbiAgICAgIGNvbnNvbGUuaW5mbyhgW2FkZC12ZXJzaW9uXSBcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdTcyNDhcdTY3MkNcdTUzRjc6ICR7YnVpbGRUaW1lc3RhbXB9YCk7XG4gICAgfSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGN0ZcdTc1MjggdHJhbnNmb3JtSW5kZXhIdG1sXHVGRjA4Vml0ZSBcdTUxODVcdTkwRThcdTY2MkZcdTU3MjhcdTU0MEVcdTdGNkVcdTk2MzZcdTZCQjVcdTc1MUZcdTYyMTAvXHU1MTk5XHU1MTY1IGluZGV4Lmh0bWxcdUZGMENnZW5lcmF0ZUJ1bmRsZSBcdTVGODhcdTVCQjlcdTY2MTNcdTYyRkZcdTRFMERcdTUyMzBcdTY3MDBcdTdFQzggSFRNTFx1RkYwOVxuICAgIHRyYW5zZm9ybUluZGV4SHRtbDoge1xuICAgICAgb3JkZXI6ICdwb3N0JyxcbiAgICAgIGhhbmRsZXIoaHRtbCkge1xuICAgICAgICBsZXQgbmV3SHRtbCA9IGh0bWw7XG4gICAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIDApIFx1NzlGQlx1OTY2NFx1N0E3QVx1NzY4NCA8c3R5bGU+PC9zdHlsZT4gXHU2ODA3XHU3QjdFXG4gICAgICAgIC8vIFx1OEJGNFx1NjYwRVx1RkYxQVx1NTcyOFx1NUZBRVx1NTI0RFx1N0FFRlx1NjdCNlx1Njc4NFx1NEUwQlx1RkYwQ1x1NUI1MFx1NUU5NFx1NzUyOFx1NTcyOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1ODhBQiBxaWFua3VuIFx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUzQlx1NUU5NFx1NzUyOFx1NURGMlx1N0VDRlx1NjNEMFx1NEY5Qlx1NEU4NiBsb2FkaW5nXHVGRjBDXG4gICAgICAgIC8vIFx1NUI1MFx1NUU5NFx1NzUyOFx1NzY4NCBzdHlsZSBcdTY4MDdcdTdCN0VcdTUzRUZcdTgwRkRcdTg4QUJcdTU5MDRcdTc0MDZcdTYyMTBcdTdBN0FcdTc2ODRcdTMwMDJcdTc5RkJcdTk2NjRcdTdBN0FcdTY4MDdcdTdCN0VcdTUzRUZcdTRFRTVcdTdCODBcdTUzMTYgSFRNTCBcdTdFRDNcdTY3ODRcdTMwMDJcbiAgICAgICAgLy8gXHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU0RTBCXHVGRjBDXHU1QjUwXHU1RTk0XHU3NTI4XHU3MkVDXHU3QUNCXHU4RkQwXHU4ODRDXHVGRjBDc3R5bGUgXHU2ODA3XHU3QjdFXHU2NzA5XHU1MTg1XHU1QkI5XHVGRjA4bG9hZGluZyBcdTY4MzdcdTVGMEZcdUZGMDlcdUZGMENcdTRFMERcdTRGMUFcdTg4QUJcdTc5RkJcdTk2NjRcdTMwMDJcbiAgICAgICAgY29uc3QgZW1wdHlTdHlsZVJlZ2V4ID0gLzxzdHlsZT5cXHMqPFxcL3N0eWxlPi9naTtcbiAgICAgICAgaWYgKGVtcHR5U3R5bGVSZWdleC50ZXN0KG5ld0h0bWwpKSB7XG4gICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShlbXB0eVN0eWxlUmVnZXgsICcnKTtcbiAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAxKSBcdTRFM0EgPHNjcmlwdCBzcmM+IFx1NkRGQlx1NTJBMC9cdTY2RjRcdTY1QjAgdlxuICAgICAgICAvL1xuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRFMERcdTg5ODFcdTdFRDkgRVNNIG1vZHVsZSBzY3JpcHRcdUZGMDh0eXBlPVwibW9kdWxlXCJcdUZGMDlcdThGRkRcdTUyQTAgP3ZcbiAgICAgICAgLy8gXHU1NDI2XHU1MjE5XHU1NDBDXHU0RTAwXHU0RTJBXHU2QTIxXHU1NzU3XHU0RjFBXHU1NDBDXHU2NUY2XHU0RUU1XHUzMDBDXHU1RTI2IHZcdTMwMERcdTU0OENcdTMwMENcdTRFMERcdTVFMjYgdlx1MzAwRFx1RkYwOFx1OTc1OVx1NjAwMSBpbXBvcnQgXHU3NTFGXHU2MjEwXHU3Njg0IFVSTFx1RkYwOVx1NEUyNFx1NTk1NyBVUkwgXHU4OEFCXHU1MkEwXHU4RjdEXHVGRjBDXG4gICAgICAgIC8vIFx1NTcyOFx1NUZBRVx1NTI0RFx1N0FFRi9cdTkxQ0RcdTU5MERcdTUyQTBcdThGN0RcdTUxNjVcdTUzRTNcdTgxMUFcdTY3MkNcdTU3M0FcdTY2NkZcdTRFMEJcdTRGMUFcdTVCRkNcdTgxRjRcdTZBMjFcdTU3NTdcdTYyNjdcdTg4NENcdTRFMjRcdTZCMjFcdUZGMENcdTRFQ0VcdTgwMENcdTg5RTZcdTUzRDFcdTdDN0JcdTRGM0MgRUNoYXJ0cyBcdTc2ODRcdTkxQ0RcdTU5MERcdTZDRThcdTUxOENcdTY1QURcdThBMDBcdTMwMDJcbiAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShcbiAgICAgICAgICAvKDxzY3JpcHRbXj5dKlxccytzcmM9W1wiJ10pKFteXCInXSspKFtcIiddW14+XSo+KS9nLFxuICAgICAgICAgIChtYXRjaDogc3RyaW5nLCBwcmVmaXg6IHN0cmluZywgc3JjOiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpc01vZHVsZVNjcmlwdCA9IC90eXBlXFxzKj1cXHMqW1wiJ11tb2R1bGVbXCInXS9pLnRlc3QobWF0Y2gpO1xuICAgICAgICAgICAgY29uc3QgaXNBc3NldHMgPSBzcmMuc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKSB8fCBzcmMuc3RhcnRzV2l0aCgnLi9hc3NldHMvJyk7XG5cbiAgICAgICAgICAgIC8vIFx1NUJGOSBtb2R1bGUgc2NyaXB0XHVGRjFBXHU1RjNBXHU1MjM2XHU3OUZCXHU5NjY0IHZcdUZGMENcdTRGRERcdThCQzEgVVJMIFx1NEUwRVx1NjI1M1x1NTMwNVx1NEVBN1x1NzI2OVx1NTE4NVx1OTBFOCBpbXBvcnQgXHU0RkREXHU2MzAxXHU0RTAwXHU4MUY0XG4gICAgICAgICAgICBpZiAoaXNNb2R1bGVTY3JpcHQgJiYgaXNBc3NldHMpIHtcbiAgICAgICAgICAgICAgY29uc3QgY2xlYW5lZCA9IHNyYy5yZXBsYWNlKC9bPyZddj1bXiYnXCJdKi9nLCAnJykucmVwbGFjZSgvXFw/Ji8sICc/JykucmVwbGFjZSgvWz8mXSQvLCAnJyk7XG4gICAgICAgICAgICAgIGlmIChjbGVhbmVkICE9PSBzcmMpIHtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NsZWFuZWR9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzcmMuaW5jbHVkZXMoJz92PScpIHx8IHNyYy5pbmNsdWRlcygnJnY9JykpIHtcbiAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZCA9IHNyYy5yZXBsYWNlKC9bPyZddj1bXiYnXCJdKi9nLCBgP3Y9JHtidWlsZFRpbWVzdGFtcH1gKTtcbiAgICAgICAgICAgICAgaWYgKHVwZGF0ZWQgIT09IHNyYykge1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7dXBkYXRlZH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0Fzc2V0cykge1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbnN0IHNlcCA9IHNyYy5pbmNsdWRlcygnPycpID8gJyYnIDogJz8nO1xuICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7c3JjfSR7c2VwfXY9JHtidWlsZFRpbWVzdGFtcH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgIH0sXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gMikgXHU0RTNBIDxsaW5rIGhyZWY+IFx1NkRGQlx1NTJBMC9cdTY2RjRcdTY1QjAgdlxuICAgICAgICAvL1xuICAgICAgICAvLyBcdTU0MENcdTRFMEFcdUZGMUFtb2R1bGVwcmVsb2FkIFx1NUM1RVx1NEU4RSBFU00gXHU0RjlEXHU4RDU2XHU1NkZFXHU3Njg0XHU0RTAwXHU5MEU4XHU1MjA2XHVGRjBDXHU4RkZEXHU1MkEwID92IFx1NEYxQVx1OEJBOVx1OTg4NFx1NTJBMFx1OEY3RCBVUkwgXHU0RTBFIGltcG9ydCBVUkwgXHU0RTBEXHU0RTAwXHU4MUY0XHVGRjBDXG4gICAgICAgIC8vIFx1OTAyMFx1NjIxMFx1OTFDRFx1NTkwRFx1OEJGN1x1NkM0Mlx1NzUxQVx1ODFGM1x1OTFDRFx1NTkwRFx1NjI2N1x1ODg0Q1x1RkYwOFx1NTcyOFx1NjdEMFx1NEU5QiBsb2FkZXIgXHU1NzNBXHU2NjZGXHU0RTBCXHVGRjA5XHUzMDAyXG4gICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgLyg8bGlua1tePl0qXFxzK2hyZWY9W1wiJ10pKFteXCInXSspKFtcIiddW14+XSo+KS9nLFxuICAgICAgICAgIChtYXRjaDogc3RyaW5nLCBwcmVmaXg6IHN0cmluZywgaHJlZjogc3RyaW5nLCBzdWZmaXg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaXNNb2R1bGVQcmVsb2FkID0gL1xcc3JlbFxccyo9XFxzKltcIiddbW9kdWxlcHJlbG9hZFtcIiddL2kudGVzdChtYXRjaCk7XG4gICAgICAgICAgICBjb25zdCBpc0Fzc2V0cyA9IGhyZWYuc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKSB8fCBocmVmLnN0YXJ0c1dpdGgoJy4vYXNzZXRzLycpO1xuXG4gICAgICAgICAgICBpZiAoaXNNb2R1bGVQcmVsb2FkICYmIGlzQXNzZXRzKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNsZWFuZWQgPSBocmVmLnJlcGxhY2UoL1s/Jl12PVteJidcIl0qL2csICcnKS5yZXBsYWNlKC9cXD8mLywgJz8nKS5yZXBsYWNlKC9bPyZdJC8sICcnKTtcbiAgICAgICAgICAgICAgaWYgKGNsZWFuZWQgIT09IGhyZWYpIHtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NsZWFuZWR9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChocmVmLmluY2x1ZGVzKCc/dj0nKSB8fCBocmVmLmluY2x1ZGVzKCcmdj0nKSkge1xuICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkID0gaHJlZi5yZXBsYWNlKC9bPyZddj1bXiYnXCJdKi9nLCBgP3Y9JHtidWlsZFRpbWVzdGFtcH1gKTtcbiAgICAgICAgICAgICAgaWYgKHVwZGF0ZWQgIT09IGhyZWYpIHtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke3VwZGF0ZWR9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNBc3NldHMpIHtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBjb25zdCBzZXAgPSBocmVmLmluY2x1ZGVzKCc/JykgPyAnJicgOiAnPyc7XG4gICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtocmVmfSR7c2VwfXY9JHtidWlsZFRpbWVzdGFtcH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgIH0sXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gMykgXHU1MTczXHU5NTJFXHVGRjFBXHU0RkVFXHU1OTBEIHFpYW5rdW4gXHU2Q0U4XHU1MTY1XHU3Njg0XHU1MTg1XHU4MDU0IGltcG9ydCgnL2Fzc2V0cy9pbmRleC14eHguanMnKVx1RkYwQ1x1OTA3Rlx1NTE0RFx1ODhBQlx1NUJCRlx1NEUzQlx1NTdERlx1NTQwRFx1ODlFM1x1Njc5MFxuICAgICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdThGRDlcdTkxQ0NcdTRFNUZcdTRFMERcdTg5ODFcdThGRkRcdTUyQTAgP3ZcdUZGMENcdTkwN0ZcdTUxNERcdTVGNjJcdTYyMTBcdTMwMENcdTVFMjYgdiAvIFx1NEUwRFx1NUUyNiB2XHUzMDBEXHU0RTI0XHU1OTU3XHU1MTY1XHU1M0UzIFVSTFx1RkYwQ1x1NUJGQ1x1ODFGNFx1NTE2NVx1NTNFM1x1NkEyMVx1NTc1N1x1ODhBQlx1OTFDRFx1NTkwRFx1NjI2N1x1ODg0Q1x1MzAwMlxuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU3MjggcWlhbmt1biBzYW5kYm94IFx1NEUyRFx1NjZGNFx1NTNFRlx1OTc2MFx1NzY4NFx1NTE5OVx1NkNENVx1NjYyRlx1NzZGNFx1NjNBNVx1OEJGQlx1NTE2OFx1NUM0MFx1NTNEOFx1OTFDRiBfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fX1xuICAgICAgICAvLyBcdTgwMENcdTRFMERcdTY2MkYgd2luZG93Ll9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fXHVGRjA4d2luZG93IFx1NTNFRlx1ODBGRFx1ODhBQiBwcm94eSBcdTkxQ0RcdTUxOTkvXHU0RTBEXHU1MzA1XHU1NDJCIGxvY2F0aW9uXHVGRjA5XHUzMDAyXG4gICAgICAgIGNvbnN0IG9yaWdpbkV4cHIgPVxuICAgICAgICAgIGAoKHR5cGVvZiBfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXyE9PSd1bmRlZmluZWQnJiZfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXylgICtcbiAgICAgICAgICBgP25ldyBVUkwoX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18sKHR5cGVvZiBsb2NhdGlvbiE9PSd1bmRlZmluZWQnJiZsb2NhdGlvbi5vcmlnaW4pfHwnJykub3JpZ2luYCArXG4gICAgICAgICAgYDooKHR5cGVvZiBsb2NhdGlvbiE9PSd1bmRlZmluZWQnJiZsb2NhdGlvbi5vcmlnaW4pfHwnJykpYDtcbiAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShcbiAgICAgICAgICAvaW1wb3J0XFwoXFxzKihbJ1wiXSkoXFwvYXNzZXRzXFwvKGluZGV4fG1haW4pLVteJ1wiXSspXFwxXFxzKlxcKS9nLFxuICAgICAgICAgIChfbTogc3RyaW5nLCBfcTogc3RyaW5nLCBhYnNQYXRoOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBgaW1wb3J0KC8qIEB2aXRlLWlnbm9yZSAqLyAoJHtvcmlnaW5FeHByfSArICcke2Fic1BhdGh9JykpYDtcbiAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2FkZC12ZXJzaW9uXSBcdTVERjJcdTRFM0EgaW5kZXguaHRtbCBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTZERkJcdTUyQTBcdTcyNDhcdTY3MkNcdTUzRjc6IHY9JHtidWlsZFRpbWVzdGFtcH1gKTtcbiAgICAgICAgICByZXR1cm4gbmV3SHRtbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgIH0sXG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxyZXNvbHZlLWxvZ28udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvcmVzb2x2ZS1sb2dvLnRzXCI7LyoqXG4gKiBMb2dvIFx1OERFRlx1NUY4NFx1ODlFM1x1Njc5MFx1NjNEMlx1NEVGNlxuICogXHU3NTI4XHU0RThFXHU1NzI4XHU1QjUwXHU1RTk0XHU3NTI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU4OUUzXHU2NzkwIC9sb2dvLnBuZyBcdThERUZcdTVGODRcbiAqIFx1NUY1MyBwdWJsaWNEaXIgXHU4OEFCXHU3OTgxXHU3NTI4XHU2NUY2XHVGRjBDXHU5NzAwXHU4OTgxXHU2MjRCXHU1MkE4XHU4OUUzXHU2NzkwIGxvZ28ucG5nIFx1NzY4NFx1OERFRlx1NUY4NFx1NUU3Nlx1NTkwRFx1NTIzNlx1NjU4N1x1NEVGNlxuICovXG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luLCBSZXNvbHZlZENvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgcmVzb2x2ZSwgZGlybmFtZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgY29weUZpbGVTeW5jLCBta2RpclN5bmMgfSBmcm9tICdub2RlOmZzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVMb2dvUGx1Z2luKGFwcERpcjogc3RyaW5nKTogUGx1Z2luIHtcbiAgbGV0IHZpdGVDb25maWc6IFJlc29sdmVkQ29uZmlnIHwgbnVsbCA9IG51bGw7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAncmVzb2x2ZS1sb2dvJyxcbiAgICBhcHBseTogJ2J1aWxkJywgLy8gXHU1M0VBXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU2MjY3XHU4ODRDXG5cbiAgICBjb25maWdSZXNvbHZlZChjb25maWc6IFJlc29sdmVkQ29uZmlnKSB7XG4gICAgICB2aXRlQ29uZmlnID0gY29uZmlnO1xuICAgIH0sXG5cbiAgICByZXNvbHZlSWQoaWQ6IHN0cmluZykge1xuICAgICAgLy8gXHU1OTA0XHU3NDA2IC9sb2dvLnBuZyBcdTYyMTYgbG9nby5wbmcgXHU3Njg0XHU4OUUzXHU2NzkwXG4gICAgICBpZiAoaWQgPT09ICcvbG9nby5wbmcnIHx8IGlkID09PSAnbG9nby5wbmcnKSB7XG4gICAgICAgIC8vIFx1NUMxRFx1OEJENVx1NEVDRVx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NUU5M1x1ODNCN1x1NTNENiBsb2dvLnBuZ1xuICAgICAgICBjb25zdCBzaGFyZWRMb2dvUGF0aCA9IHJlc29sdmUoYXBwRGlyLCAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvcHVibGljL2xvZ28ucG5nJyk7XG4gICAgICAgIGlmIChleGlzdHNTeW5jKHNoYXJlZExvZ29QYXRoKSkge1xuICAgICAgICAgIHJldHVybiBzaGFyZWRMb2dvUGF0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1NUMxRFx1OEJENVx1NEVDRVx1NUU5NFx1NzUyOFx1ODFFQVx1NURGMVx1NzY4NCBwdWJsaWMgXHU3NkVFXHU1RjU1XHU4M0I3XHU1M0Q2XHVGRjA4XHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU1M0VGXHU4MEZEXHU4RkQ4XHU2NzA5XHVGRjA5XG4gICAgICAgIGNvbnN0IGFwcExvZ29QYXRoID0gcmVzb2x2ZShhcHBEaXIsICdwdWJsaWMvbG9nby5wbmcnKTtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoYXBwTG9nb1BhdGgpKSB7XG4gICAgICAgICAgcmV0dXJuIGFwcExvZ29QYXRoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU5MEZEXHU0RTBEXHU1QjU4XHU1NzI4XHVGRjBDXHU4RkQ0XHU1NkRFXHU4NjVBXHU2MkRGXHU2QTIxXHU1NzU3IElEXG4gICAgICAgIHJldHVybiBgXFwwbG9nby5wbmdgO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIGxvYWQoaWQ6IHN0cmluZykge1xuICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2NjJGXHU4NjVBXHU2MkRGXHU2QTIxXHU1NzU3XHVGRjBDXHU4RkQ0XHU1NkRFXHU3QTdBXHU1MTg1XHU1QkI5XHVGRjA4XHU1QjlFXHU5NjQ1XHU2NTg3XHU0RUY2XHU0RjFBXHU1NzI4IGNsb3NlQnVuZGxlIFx1NjVGNlx1NTkwRFx1NTIzNlx1RkYwOVxuICAgICAgaWYgKGlkID09PSAnXFwwbG9nby5wbmcnKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgIC8vIFx1NTcyOFx1Njc4NFx1NUVGQVx1NUI4Q1x1NjIxMFx1NTQwRVx1NTkwRFx1NTIzNiBsb2dvLnBuZyBcdTUyMzAgZGlzdCBcdTc2RUVcdTVGNTVcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghdml0ZUNvbmZpZykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJvb3QgPSB2aXRlQ29uZmlnLnJvb3QgfHwgYXBwRGlyO1xuXG4gICAgICAgIC8vIFx1NEYxOFx1NTE0OFx1NEVDRVx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NUU5M1x1ODNCN1x1NTNENiBsb2dvLnBuZ1xuICAgICAgICBjb25zdCBzaGFyZWRMb2dvUGF0aCA9IHJlc29sdmUocm9vdCwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC1jb21wb25lbnRzL3B1YmxpYy9sb2dvLnBuZycpO1xuICAgICAgICBsZXQgbG9nb1NvdXJjZVBhdGg6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgIGlmIChleGlzdHNTeW5jKHNoYXJlZExvZ29QYXRoKSkge1xuICAgICAgICAgIGxvZ29Tb3VyY2VQYXRoID0gc2hhcmVkTG9nb1BhdGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gXHU1QzFEXHU4QkQ1XHU0RUNFXHU1RTk0XHU3NTI4XHU4MUVBXHU1REYxXHU3Njg0IHB1YmxpYyBcdTc2RUVcdTVGNTVcdTgzQjdcdTUzRDZcbiAgICAgICAgICBjb25zdCBhcHBMb2dvUGF0aCA9IHJlc29sdmUocm9vdCwgJ3B1YmxpYy9sb2dvLnBuZycpO1xuICAgICAgICAgIGlmIChleGlzdHNTeW5jKGFwcExvZ29QYXRoKSkge1xuICAgICAgICAgICAgbG9nb1NvdXJjZVBhdGggPSBhcHBMb2dvUGF0aDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWxvZ29Tb3VyY2VQYXRoKSB7XG4gICAgICAgICAgcmV0dXJuOyAvLyBcdTU5ODJcdTY3OUNcdTZFOTBcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTk3NTlcdTlFRDhcdThERjNcdThGQzdcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1ODNCN1x1NTNENlx1Njc4NFx1NUVGQVx1OEY5M1x1NTFGQVx1NzZFRVx1NUY1NVxuICAgICAgICBjb25zdCBvdXREaXIgPSB2aXRlQ29uZmlnLmJ1aWxkLm91dERpciB8fCAnZGlzdCc7XG4gICAgICAgIGNvbnN0IGRpc3REaXIgPSByZXNvbHZlKHJvb3QsIG91dERpcik7XG5cbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKGRpc3REaXIpKSB7XG4gICAgICAgICAgcmV0dXJuOyAvLyBcdTU5ODJcdTY3OUNcdThGOTNcdTUxRkFcdTc2RUVcdTVGNTVcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdThERjNcdThGQzdcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxvZ29EZXN0UGF0aCA9IHJlc29sdmUoZGlzdERpciwgJ2xvZ28ucG5nJyk7XG5cbiAgICAgICAgLy8gXHU3ODZFXHU0RkREXHU3NkVFXHU2ODA3XHU3NkVFXHU1RjU1XHU1QjU4XHU1NzI4XG4gICAgICAgIGNvbnN0IGRlc3REaXIgPSBkaXJuYW1lKGxvZ29EZXN0UGF0aCk7XG4gICAgICAgIGlmICghZXhpc3RzU3luYyhkZXN0RGlyKSkge1xuICAgICAgICAgIG1rZGlyU3luYyhkZXN0RGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1NTkwRFx1NTIzNlx1NjU4N1x1NEVGNlxuICAgICAgICBjb3B5RmlsZVN5bmMobG9nb1NvdXJjZVBhdGgsIGxvZ29EZXN0UGF0aCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAvLyBcdTk3NTlcdTlFRDhcdTU5MzFcdThEMjVcdUZGMENcdTkwN0ZcdTUxNERcdTk2M0JcdTU4NUVcdTY3ODRcdTVFRkFcbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXHVwbG9hZC1pY29ucy10by1vc3MudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvdXBsb2FkLWljb25zLXRvLW9zcy50c1wiOy8qKlxuICogXHU0RTBBXHU0RjIwXHU1NkZFXHU2ODA3XHU2NTg3XHU0RUY2XHU1MjMwIE9TUyBcdTc2ODQgVml0ZSBcdTYzRDJcdTRFRjZcbiAqIFx1NTcyOFx1NzUxRlx1NEVBN1x1Njc4NFx1NUVGQVx1NUI4Q1x1NjIxMFx1NTQwRVx1RkYwQ1x1ODFFQVx1NTJBOFx1NEUwQVx1NEYyMFx1NTZGRVx1NjgwN1x1NjU4N1x1NEVGNlx1NTIzMCBPU1NcdUZGMDhcdTU3RkFcdTRFOEVcdTY1ODdcdTRFRjZcdTYzMDdcdTdFQjlcdTc2ODRcdTU4OUVcdTkxQ0ZcdTRFMEFcdTRGMjBcdUZGMDlcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW3VwbG9hZC1pY29ucy10by1vc3NdJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1t1cGxvYWQtaWNvbnMtdG8tb3NzXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW3VwbG9hZC1pY29ucy10by1vc3NdJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1t1cGxvYWQtaWNvbnMtdG8tb3NzXScsIC4uLmFyZ3MpLFxufTtcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFJlc29sdmVkQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBzcGF3biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ3VybCc7XG5pbXBvcnQgeyBleGVjU3luYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xuY29uc3QgX19kaXJuYW1lID0gcmVzb2x2ZShfX2ZpbGVuYW1lLCAnLi4nKTtcbmNvbnN0IHByb2plY3RSb290ID0gcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi8uLicpO1xuXG5mdW5jdGlvbiB0cnlMb2FkT3NzQ3JlZHNGcm9tV2luZG93c0NyZWRlbnRpYWxNYW5hZ2VyKCk6IHZvaWQge1xuICAvLyBcdTUzRUFcdTU3MjggV2luZG93cyBcdTRFMTRcdTdGM0FcdTVDMTFcdTUxRURcdThCQzFcdTY1RjZcdTVDMURcdThCRDVcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gIT09ICd3aW4zMicpIHJldHVybjtcbiAgaWYgKHByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX0lEICYmIHByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX1NFQ1JFVCkgcmV0dXJuO1xuXG4gIHRyeSB7XG4gICAgLy8gXHU5MDFBXHU4RkM3IFBvd2VyU2hlbGwgKyBDcmVkZW50aWFsTWFuYWdlciBcdThCRkJcdTUzRDZcdUZGMDhcdTRFMERcdThGOTNcdTUxRkFcdTY2MEVcdTY1ODdcdTUyMzBcdTY1RTVcdTVGRDdcdUZGMDlcbiAgICBjb25zdCBwcyA9IFtcbiAgICAgIGAkRXJyb3JBY3Rpb25QcmVmZXJlbmNlPSdTdG9wJ2AsXG4gICAgICBgSW1wb3J0LU1vZHVsZSBDcmVkZW50aWFsTWFuYWdlcmAsXG4gICAgICBgJGlkPShHZXQtU3RvcmVkQ3JlZGVudGlhbCAtVGFyZ2V0ICdBbGliYWJhQ2xvdWQnIC1FcnJvckFjdGlvbiBTaWxlbnRseUNvbnRpbnVlKS5HZXROZXR3b3JrQ3JlZGVudGlhbCgpLlBhc3N3b3JkYCxcbiAgICAgIGAkc2VjPShHZXQtU3RvcmVkQ3JlZGVudGlhbCAtVGFyZ2V0ICdBbGliYWJhQ2xvdWRTZWNyZXQnIC1FcnJvckFjdGlvbiBTaWxlbnRseUNvbnRpbnVlKS5HZXROZXR3b3JrQ3JlZGVudGlhbCgpLlBhc3N3b3JkYCxcbiAgICAgIGAkb3V0PVtwc2N1c3RvbW9iamVjdF1AeyBpZD0kaWQ7IHNlY3JldD0kc2VjIH0gfCBDb252ZXJ0VG8tSnNvbiAtQ29tcHJlc3NgLFxuICAgICAgYFdyaXRlLU91dHB1dCAkb3V0YCxcbiAgICBdLmpvaW4oJzsgJyk7XG5cbiAgICBjb25zdCByYXcgPSBleGVjU3luYyhgcG93ZXJzaGVsbCAtTm9Qcm9maWxlIC1Ob25JbnRlcmFjdGl2ZSAtQ29tbWFuZCBcIiR7cHMucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpfVwiYCwge1xuICAgICAgc3RkaW86IFsnaWdub3JlJywgJ3BpcGUnLCAnaWdub3JlJ10sXG4gICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgIH0pO1xuXG4gICAgY29uc3QganNvblRleHQgPSAocmF3IHx8ICcnKS50cmltKCk7XG4gICAgaWYgKCFqc29uVGV4dCkgcmV0dXJuO1xuXG4gICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShqc29uVGV4dCkgYXMgeyBpZD86IHN0cmluZzsgc2VjcmV0Pzogc3RyaW5nIH07XG4gICAgaWYgKHBhcnNlZD8uaWQgJiYgIXByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX0lEKSBwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9JRCA9IHBhcnNlZC5pZDtcbiAgICBpZiAocGFyc2VkPy5zZWNyZXQgJiYgIXByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX1NFQ1JFVCkgcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUID0gcGFyc2VkLnNlY3JldDtcbiAgfSBjYXRjaCB7XG4gICAgLy8gXHU5NzU5XHU5RUQ4XHU1OTMxXHU4RDI1XHVGRjFBXHU0RTBEXHU5NjNCXHU1ODVFXHU2Nzg0XHU1RUZBXHU2RDQxXHU3QTBCXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwbG9hZEljb25zVG9Pc3NQbHVnaW4oKTogUGx1Z2luIHtcbiAgbGV0IGlzUHJvZHVjdGlvbkJ1aWxkID0gZmFsc2U7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAndXBsb2FkLWljb25zLXRvLW9zcycsXG4gICAgYXBwbHk6ICdidWlsZCcsIC8vIFx1NTNFQVx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NjI2N1x1ODg0Q1xuXG4gICAgY29uZmlnUmVzb2x2ZWQoY29uZmlnOiBSZXNvbHZlZENvbmZpZykge1xuICAgICAgLy8gVml0ZSBcdTc2ODQgaXNQcm9kdWN0aW9uIFx1NjYyRlx1NjcwMFx1NTNFRlx1OTc2MFx1NzY4NFx1NTIyNFx1NjVBRFx1RkYwOFx1OTA3Rlx1NTE0RCBOT0RFX0VOViAvIERFViBcdTdCNDlcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdTU3MjggQ0kgXHU0RTJEXHU0RTBEXHU0RTAwXHU4MUY0XHVGRjA5XG4gICAgICBpc1Byb2R1Y3Rpb25CdWlsZCA9ICEhY29uZmlnLmlzUHJvZHVjdGlvbjtcbiAgICB9LFxuXG4gICAgYXN5bmMgY2xvc2VCdW5kbGUoKSB7XG4gICAgICAvLyBcdTUzRUFcdTU3MjhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTY3ODRcdTVFRkFcdTY1RjZcdTRFMEFcdTRGMjBcbiAgICAgIGlmICghaXNQcm9kdWN0aW9uQnVpbGQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBXaW5kb3dzIFx1NjcyQ1x1NTczMFx1Njc4NFx1NUVGQVx1RkYxQVx1NTk4Mlx1Njc5Q1x1NjcyQVx1NjYzRVx1NUYwRlx1OEJCRVx1N0Y2RSBlbnYvLmVudi5vc3NcdUZGMENcdTVDMURcdThCRDVcdTRFQ0VcdTUxRURcdThCQzFcdTdCQTFcdTc0MDZcdTU2NjhcdThCRkJcdTUzRDZcbiAgICAgIHRyeUxvYWRPc3NDcmVkc0Zyb21XaW5kb3dzQ3JlZGVudGlhbE1hbmFnZXIoKTtcblxuICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU2NzA5IE9TUyBcdTkxNERcdTdGNkVcbiAgICAgIGlmICghcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQgfHwgIXByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX1NFQ1JFVCkge1xuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDlcdTRFMEFcdTRGMjBcdUZGMENhbGwuYmVsbGlzLmNvbS5jbiBcdTRFRTNcdTc0MDZcdTUyMzAgT1NTIFx1NUMwNlx1OEZENFx1NTZERSBOb1N1Y2hLZXlcdUZGMDhsb2dvLnBuZyAvIGljb25zLypcdUZGMDlcbiAgICAgICAgY29uc29sZS53YXJuKCdbdXBsb2FkLWljb25zLXRvLW9zc10gXHUyNkEwXHVGRTBGICBcdThERjNcdThGQzdcdTRFMEFcdTRGMjBcdUZGMDhcdTY3MkFcdTkxNERcdTdGNkUgT1NTIFx1NTFFRFx1OEJDMVx1RkYwOVx1MzAwMlx1OEZEOVx1NEYxQVx1NUJGQ1x1ODFGNCBodHRwczovL2FsbC5iZWxsaXMuY29tLmNuL2xvZ28ucG5nIFx1OEZENFx1NTZERSBOb1N1Y2hLZXknKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU3MjggQ0kgXHU0RTJEXHU1RkM1XHU5ODdCXHU3QjQ5XHU1Rjg1XHU0RTBBXHU0RjIwXHU1QjhDXHU2MjEwXHVGRjBDXHU1NDI2XHU1MjE5XHU2Nzg0XHU1RUZBXHU4RkRCXHU3QTBCXHU5MDAwXHU1MUZBXHU0RjFBXHU3NkY0XHU2M0E1XHU3RUM4XHU2QjYyXHU1QjUwXHU4RkRCXHU3QTBCXHVGRjBDXHU1QkZDXHU4MUY0XHU2NTg3XHU0RUY2XHU2NzJBXHU0RTBBXHU0RjIwXG4gICAgICBjb25zdCB1cGxvYWRTY3JpcHQgPSByZXNvbHZlKHByb2plY3RSb290LCAnc2NyaXB0cy91cGxvYWQtaWNvbnMtdG8tb3NzLm1qcycpO1xuICAgICAgY29uc29sZS5pbmZvKCdbdXBsb2FkLWljb25zLXRvLW9zc10gXHVEODNEXHVERTgwIFx1NUYwMFx1NTlDQlx1NEUwQVx1NEYyMFx1NTZGRVx1NjgwN1x1NjU4N1x1NEVGNlx1NTIzMCBPU1MuLi4nKTtcblxuICAgICAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmVQcm9taXNlLCByZWplY3RQcm9taXNlKSA9PiB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gc3Bhd24oJ25vZGUnLCBbdXBsb2FkU2NyaXB0XSwge1xuICAgICAgICAgIHN0ZGlvOiAnaW5oZXJpdCcsXG4gICAgICAgICAgc2hlbGw6IHRydWUsXG4gICAgICAgICAgZW52OiB7XG4gICAgICAgICAgICAuLi5wcm9jZXNzLmVudixcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBjaGlsZC5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgICAgICByZWplY3RQcm9taXNlKGVycm9yKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2hpbGQub24oJ2V4aXQnLCAoY29kZSkgPT4ge1xuICAgICAgICAgIGlmIChjb2RlID09PSAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ1t1cGxvYWQtaWNvbnMtdG8tb3NzXSBcdTI3MDUgXHU1NkZFXHU2ODA3XHU2NTg3XHU0RUY2XHU0RTBBXHU0RjIwXHU1QjhDXHU2MjEwJyk7XG4gICAgICAgICAgICByZXNvbHZlUHJvbWlzZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBcdTlFRDhcdThCQTRcdTRFMERcdTk2M0JcdTU4NUVcdTY3ODRcdTVFRkFcdUZGMUFsYXlvdXQtYXBwIGRpc3QgXHU5MUNDXHU0RUNEXHU2NzA5IGljb25zL2xvZ28gXHU0RjVDXHU0RTNBXHU2NzJDXHU1NzMwXHU1NDBFXHU1OTA3XHVGRjBDXHU5MDdGXHU1MTREIDQwNFxuICAgICAgICAgICAgLy8gXHU1OTgyXHU5NzAwXHU0RTI1XHU2ODNDXHU1OTMxXHU4RDI1XHVGRjA4Q0kgXHU1RjNBXHU1MjM2XHU0RTBBXHU0RjIwXHU2MjEwXHU1MjlGXHVGRjA5XHVGRjBDXHU4QkJFXHU3RjZFIE9TU19VUExPQURfU1RSSUNUPXRydWVcbiAgICAgICAgICAgIGNvbnN0IHN0cmljdCA9IHByb2Nlc3MuZW52Lk9TU19VUExPQURfU1RSSUNUID09PSAndHJ1ZSc7XG4gICAgICAgICAgICBjb25zdCBlcnIgPSBuZXcgRXJyb3IoYFt1cGxvYWQtaWNvbnMtdG8tb3NzXSBcdTRFMEFcdTRGMjBcdTgxMUFcdTY3MkNcdTkwMDBcdTUxRkFcdUZGMENcdTRFRTNcdTc4MDE6ICR7Y29kZSA/PyAndW5rbm93bid9YCk7XG4gICAgICAgICAgICBpZiAoc3RyaWN0KSB7XG4gICAgICAgICAgICAgIHJlamVjdFByb21pc2UoZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgIHJlc29sdmVQcm9taXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxccmVwbGFjZS1pY29ucy13aXRoLWNkbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9yZXBsYWNlLWljb25zLXdpdGgtY2RuLnRzXCI7LyoqXG4gKiBcdTVDMDYgaW5kZXguaHRtbCBcdTRFMkRcdTc2ODRcdTU2RkVcdTY4MDdcdThERUZcdTVGODRcdTY2RkZcdTYzNjJcdTRFM0EgQ0ROIFVSTCBcdTc2ODQgVml0ZSBcdTYzRDJcdTRFRjZcbiAqIFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NEY3Rlx1NzUyOCBDRE5cdUZGMENcdTVGMDBcdTUzRDEvXHU5ODg0XHU4OUM4XHU3M0FGXHU1ODgzXHU0RkREXHU2MzAxXHU2NzJDXHU1NzMwXHU4REVGXHU1Rjg0XG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1tyZXBsYWNlLWljb25zLXdpdGgtY2RuXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbcmVwbGFjZS1pY29ucy13aXRoLWNkbl0nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1tyZXBsYWNlLWljb25zLXdpdGgtY2RuXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbcmVwbGFjZS1pY29ucy13aXRoLWNkbl0nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luLCBSZXNvbHZlZENvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVwbGFjZUljb25zV2l0aENkblBsdWdpbigpOiBQbHVnaW4ge1xuICBsZXQgaXNQcm9kdWN0aW9uQnVpbGQgPSBmYWxzZTtcbiAgbGV0IGNhY2hlZExvZ29DZG5PazogYm9vbGVhbiB8IG51bGwgPSBudWxsO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3JlcGxhY2UtaWNvbnMtd2l0aC1jZG4nLFxuICAgIGFwcGx5OiAnYnVpbGQnLCAvLyBcdTUzRUFcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTYyNjdcdTg4NENcblxuICAgIGNvbmZpZ1Jlc29sdmVkKGNvbmZpZzogUmVzb2x2ZWRDb25maWcpIHtcbiAgICAgIGlzUHJvZHVjdGlvbkJ1aWxkID0gISFjb25maWcuaXNQcm9kdWN0aW9uO1xuICAgIH0sXG5cbiAgICBhc3luYyB0cmFuc2Zvcm1JbmRleEh0bWwoaHRtbCkge1xuICAgICAgLy8gXHU1M0VBXHU1NzI4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU2Nzg0XHU1RUZBXHU2NUY2XHU2NkZGXHU2MzYyXHVGRjA4XHU0RjdGXHU3NTI4IFZpdGUgXHU3Njg0IGlzUHJvZHVjdGlvblx1RkYwQ1x1OTA3Rlx1NTE0RCBDSSBcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdTRFMERcdTRFMDBcdTgxRjRcdUZGMDlcbiAgICAgIGlmICghaXNQcm9kdWN0aW9uQnVpbGQpIHtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFx1NUVGNlx1OEZERlx1NUJGQ1x1NTE2NVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NTcyOCB2aXRlLmNvbmZpZy50cyBcdTUyQTBcdThGN0RcdTY1RjZcdTg5RTNcdTY3OTBcdTU5MzFcdThEMjVcbiAgICAgICAgY29uc3QgeyBnZXRFbnZDb25maWcgfSA9IGF3YWl0IGltcG9ydCgnQGJ0Yy9zaGFyZWQtY29yZS9jb25maWdzL3VuaWZpZWQtZW52LWNvbmZpZycpO1xuICAgICAgICAvLyBcdTgzQjdcdTUzRDZcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcbiAgICAgICAgY29uc3QgZW52Q29uZmlnID0gZ2V0RW52Q29uZmlnKCk7XG4gICAgICAgIGNvbnN0IGNkblVybCA9IGVudkNvbmZpZy5jZG4/LnN0YXRpY0Fzc2V0c1VybDtcblxuICAgICAgICBpZiAoIWNkblVybCkge1xuICAgICAgICAgIC8vIFx1NjcyQVx1OTE0RFx1N0Y2RSBDRE5cdUZGMENcdTRGRERcdTYzMDFcdTUzOUZcdTY4MzdcbiAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNkbkJhc2UgPSBjZG5VcmwucmVwbGFjZSgvXFwvJC8sICcnKTtcblxuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRFQzVcdTVGNTMgQ0ROIFx1NEUwQVx1Nzg2RVx1NUI5RVx1NUI1OFx1NTcyOCBsb2dvLnBuZyBcdTY1RjZcdTYyNERcdTY2RkZcdTYzNjJcbiAgICAgICAgLy8gXHU1NDI2XHU1MjE5XHU0RkREXHU3NTU5XHU2NzJDXHU1NzMwIC9sb2dvLnBuZ1x1RkYwQ1x1NUU3Nlx1NEY5RFx1OEQ1Nlx1NUI1MFx1NUU5NFx1NzUyOCBkaXN0L2xvZ28ucG5nIFx1NEY1Q1x1NEUzQVx1NTQwRVx1NTkwN1x1RkYwQ1x1OTA3Rlx1NTE0RCA0MDRcbiAgICAgICAgaWYgKGNhY2hlZExvZ29DZG5PayA9PT0gbnVsbCkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtjZG5CYXNlfS9sb2dvLnBuZ2AsIHsgbWV0aG9kOiAnSEVBRCcsIHJlZGlyZWN0OiAnZm9sbG93JyB9KTtcbiAgICAgICAgICAgIGNhY2hlZExvZ29DZG5PayA9ICEhcmVzLm9rO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgY2FjaGVkTG9nb0Nkbk9rID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU2NkZGXHU2MzYyXHU1NkZFXHU2ODA3XHU4REVGXHU1Rjg0XG4gICAgICAgIGxldCBuZXdIdG1sID0gaHRtbDtcblxuICAgICAgICAvLyBcdTY2RkZcdTYzNjIgL2xvZ28ucG5nXG4gICAgICAgIGlmIChjYWNoZWRMb2dvQ2RuT2spIHtcbiAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgICAgL2hyZWY9W1wiJ11cXC9sb2dvXFwucG5nW1wiJ10vZyxcbiAgICAgICAgICAgIGBocmVmPVwiJHtjZG5CYXNlfS9sb2dvLnBuZ1wiYFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdTY2RkZcdTYzNjIgL2ljb25zLyBcdThERUZcdTVGODRcbiAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShcbiAgICAgICAgICAvaHJlZj1bXCInXVxcL2ljb25zXFwvKFteXCInXSspW1wiJ10vZyxcbiAgICAgICAgICAobWF0Y2gsIGljb25GaWxlKSA9PiB7XG4gICAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFzaXRlLndlYm1hbmlmZXN0IFx1NUZDNVx1OTg3Qlx1NEZERFx1NjMwMVx1NTQwQ1x1NkU5MFx1RkYwOFx1NzUzMVx1NTQwNFx1NUI1MFx1NUU5NFx1NzUyOFx1ODFFQVx1OEVBQlx1NjNEMFx1NEY5Qlx1RkYwOVx1RkYwQ1x1NTQyNlx1NTIxOVx1RkYxQVxuICAgICAgICAgICAgLy8gLSBcdTRGMUFcdTg5RTZcdTUzRDFcdThERThcdTU3REYvQ09SU1xuICAgICAgICAgICAgLy8gLSBQV0Egc3RhcnRfdXJsIFx1NEYxQVx1NEVFNSBDRE4gXHU1N0RGXHU1NDBEXHU0RTNBXHU1N0ZBXHU1MUM2XHVGRjBDXHU1QkZDXHU4MUY0XHU1Qjg5XHU4OEM1L1x1NTQyRlx1NTJBOFx1ODg0Q1x1NEUzQVx1OTUxOVx1OEJFRlxuICAgICAgICAgICAgaWYgKGljb25GaWxlID09PSAnc2l0ZS53ZWJtYW5pZmVzdCcpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGBocmVmPVwiJHtjZG5CYXNlfS9pY29ucy8ke2ljb25GaWxlfVwiYDtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIG5ld0h0bWw7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTgzQjdcdTUzRDZcdTkxNERcdTdGNkVcdTU5MzFcdThEMjVcdUZGMENcdTRGRERcdTYzMDFcdTUzOUZcdTY4MzdcbiAgICAgICAgY29uc29sZS53YXJuKCdbcmVwbGFjZS1pY29ucy13aXRoLWNkbl0gXHU4M0I3XHU1M0Q2XHU5MTREXHU3RjZFXHU1OTMxXHU4RDI1XHVGRjBDXHU0RkREXHU2MzAxXHU1MzlGXHU1NkZFXHU2ODA3XHU4REVGXHU1Rjg0OicsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICB9XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxsb2NhbGVzLXN0YXRpYy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9sb2NhbGVzLXN0YXRpYy50c1wiOy8qKlxuICogTG9jYWxlcyBcdTk3NTlcdTYwMDFcdTY1ODdcdTRFRjZcdTYzRDJcdTRFRjZcbiAqIFx1NTcyOFx1NUYwMFx1NTNEMVx1NjcwRFx1NTJBMVx1NTY2OFx1NUM0Mlx1OTc2Mlx1NjNEMFx1NEY5QiBzcmMvbG9jYWxlcy8qLmpzb24gXHU2NTg3XHU0RUY2XHVGRjBDXHU0RjlCXHU0RTNCXHU1RTk0XHU3NTI4XHU5MDFBXHU4RkM3IGZldGNoIFx1NTJBMFx1OEY3RFxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTU2RTBcdTRFM0EgZXNidWlsZCBcdTY1RTBcdTZDRDVcdTZCNjNcdTc4NkVcdTg5RTNcdTY3OTAgd29ya3NwYWNlIFx1NTMwNVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclx1RkYwQ1x1OTA3Rlx1NTE0RFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1NzY4NFx1ODlFM1x1Njc5MFx1OTVFRVx1OTg5OFxuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgVml0ZURldlNlcnZlciB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHR5cGUgeyBSZXNvbHZlZENvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jLCBleGlzdHNTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgam9pbiwgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTRGNUNcdTRFM0EgbG9nZ2VyXHVGRjBDXHU5MDdGXHU1MTREXHU1NzI4XHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHU4OUUzXHU2NzkwIEBidGMvc2hhcmVkLWNvcmVcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1tsb2NhbGVzLXN0YXRpY10nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW2xvY2FsZXMtc3RhdGljXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW2xvY2FsZXMtc3RhdGljXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbbG9jYWxlcy1zdGF0aWNdJywgLi4uYXJncyksXG59O1xuXG4vKipcbiAqIExvY2FsZXMgXHU5NzU5XHU2MDAxXHU2NTg3XHU0RUY2XHU2M0QyXHU0RUY2XG4gKiBAcGFyYW0gYXBwRGlyIFx1NUU5NFx1NzUyOFx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9jYWxlc1N0YXRpY1BsdWdpbihhcHBEaXI6IHN0cmluZyk6IFBsdWdpbiB7XG4gIGxldCB2aXRlQ29uZmlnOiBSZXNvbHZlZENvbmZpZyB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0IGxvY2FsZXNNaWRkbGV3YXJlID0gKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSA9PiB7XG4gICAgLy8gXHU1OTA0XHU3NDA2IE9QVElPTlMgXHU5ODg0XHU2OEMwXHU4QkY3XHU2QzQyXG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJyAmJiByZXEudXJsPy5tYXRjaCgvXlxcL3NyY1xcL2xvY2FsZXNcXC9bXi9dK1xcLmpzb24kLykpIHtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgT1BUSU9OUycpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUnKTtcbiAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xuICAgICAgcmVzLmVuZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NTNFQVx1NTkwNFx1NzQwNiBHRVQgXHU4QkY3XHU2QzQyXHU1NDhDIC9zcmMvbG9jYWxlcy8qLmpzb24gXHU4REVGXHU1Rjg0XG4gICAgaWYgKHJlcS5tZXRob2QgIT09ICdHRVQnIHx8ICFyZXEudXJsIHx8ICFyZXEudXJsLm1hdGNoKC9eXFwvc3JjXFwvbG9jYWxlc1xcL1teL10rXFwuanNvbiQvKSkge1xuICAgICAgbmV4dCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1NjNEMFx1NTNENlx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1RkYwQ1x1NEY4Qlx1NTk4MiAvc3JjL2xvY2FsZXMvemgtQ04uanNvbiAtPiBzcmMvbG9jYWxlcy96aC1DTi5qc29uXG4gICAgY29uc3QgZmlsZVBhdGggPSByZXEudXJsLnJlcGxhY2UoL15cXC8vLCAnJyk7XG5cbiAgICAvLyBcdTY3ODRcdTVFRkFcdTVCOENcdTY1NzRcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcbiAgICBjb25zdCBmdWxsUGF0aCA9IHJlc29sdmUoYXBwRGlyLCBmaWxlUGF0aCk7XG5cbiAgICAvLyBcdTY4QzBcdTY3RTVcdTY1ODdcdTRFRjZcdTY2MkZcdTU0MjZcdTVCNThcdTU3MjhcbiAgICBpZiAoIWV4aXN0c1N5bmMoZnVsbFBhdGgpKSB7XG4gICAgICAvLyBcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdThCQjBcdTVGNTVcdThCNjZcdTU0NEFcdTVFNzZcdTdFRTdcdTdFRURcdTRFMEJcdTRFMDBcdTRFMkFcdTRFMkRcdTk1RjRcdTRFRjZcbiAgICAgIGNvbnNvbGUud2FybihgW2xvY2FsZXMtc3RhdGljXSBGaWxlIG5vdCBmb3VuZDogJHtmdWxsUGF0aH0gKHJlcXVlc3RlZDogJHtyZXEudXJsfSlgKTtcbiAgICAgIG5leHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdThCRkJcdTUzRDZcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudCA9IHJlYWRGaWxlU3luYyhmdWxsUGF0aCwgJ3V0Zi04Jyk7XG5cbiAgICAgIC8vIFx1OEJCRVx1N0Y2RVx1NTRDRFx1NUU5NFx1NTkzNFxuICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgT1BUSU9OUycpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUnKTtcblxuICAgICAgLy8gXHU4RkQ0XHU1NkRFXHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XG4gICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgIHJlcy5lbmQoY29udGVudCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIFx1OEJGQlx1NTNENlx1NjU4N1x1NEVGNlx1NTkzMVx1OEQyNVx1RkYwQ1x1N0VFN1x1N0VFRFx1NEUwQlx1NEUwMFx1NEUyQVx1NEUyRFx1OTVGNFx1NEVGNlxuICAgICAgY29uc29sZS53YXJuKGBbbG9jYWxlcy1zdGF0aWNdIEZhaWxlZCB0byByZWFkIGZpbGU6ICR7ZnVsbFBhdGh9YCwgZXJyb3IpO1xuICAgICAgbmV4dCgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICd2aXRlLXBsdWdpbi1sb2NhbGVzLXN0YXRpYycsXG5cbiAgICBjb25maWdSZXNvbHZlZChjb25maWcpIHtcbiAgICAgIHZpdGVDb25maWcgPSBjb25maWc7XG4gICAgfSxcblxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpIHtcbiAgICAgIC8vIFx1NTcyOCBWaXRlIFx1NTE4NVx1OTBFOFx1NEUyRFx1OTVGNFx1NEVGNlx1NEU0Qlx1NTI0RFx1NjJFNlx1NjIyQVx1OEJGN1x1NkM0Mlx1RkYwQ1x1NjNEMFx1NEY5QiBsb2NhbGVzIFx1NjU4N1x1NEVGNlxuICAgICAgLy8gXHU0RjdGXHU3NTI4IHVzZSBcdTVDMDZcdTRFMkRcdTk1RjRcdTRFRjZcdTZERkJcdTUyQTBcdTUyMzBcdTRFMkRcdTk1RjRcdTRFRjZcdTY4MDhcdUZGMENWaXRlIFx1NEYxQVx1NjMwOVx1NzE2N1x1NkNFOFx1NTE4Q1x1OTg3QVx1NUU4Rlx1NjI2N1x1ODg0Q1xuICAgICAgLy8gXHU2MjExXHU0RUVDXHU5NzAwXHU4OTgxXHU1NzI4IFNQQSBmYWxsYmFjayBcdTRFNEJcdTUyNERcdTU5MDRcdTc0MDZcdUZGMENcdTYyNDBcdTRFRTVcdTc2RjRcdTYzQTVcdTRGN0ZcdTc1MjggdXNlXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGxvY2FsZXNNaWRkbGV3YXJlKTtcbiAgICB9LFxuICB9O1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXHVwbG9hZC1jZG4udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvdXBsb2FkLWNkbi50c1wiOy8qKlxuICogXHU0RTBBXHU0RjIwXHU1RTk0XHU3NTI4XHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU1MjMwIENETiBcdTc2ODQgVml0ZSBcdTYzRDJcdTRFRjZcbiAqIFx1NTcyOFx1NzUxRlx1NEVBN1x1Njc4NFx1NUVGQVx1NUI4Q1x1NjIxMFx1NTQwRVx1RkYwQ1x1ODFFQVx1NTJBOFx1NEUwQVx1NEYyMFx1NUU5NFx1NzUyOFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NTIzMCBPU1MvQ0ROXHVGRjA4XHU1N0ZBXHU0RThFXHU2NTg3XHU0RUY2XHU2MzA3XHU3RUI5XHU3Njg0XHU1ODlFXHU5MUNGXHU0RTBBXHU0RjIwXHVGRjA5XG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1t1cGxvYWQtY2RuXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbdXBsb2FkLWNkbl0nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1t1cGxvYWQtY2RuXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbdXBsb2FkLWNkbl0nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luLCBSZXNvbHZlZENvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnO1xuaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcbmNvbnN0IF9fZGlybmFtZSA9IHJlc29sdmUoX19maWxlbmFtZSwgJy4uJyk7XG5jb25zdCBwcm9qZWN0Um9vdCA9IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vLi4nKTtcblxuZnVuY3Rpb24gdHJ5TG9hZE9zc0NyZWRzRnJvbVdpbmRvd3NDcmVkZW50aWFsTWFuYWdlcigpOiB2b2lkIHtcbiAgLy8gXHU1M0VBXHU1NzI4IFdpbmRvd3MgXHU0RTE0XHU3RjNBXHU1QzExXHU1MUVEXHU4QkMxXHU2NUY2XHU1QzFEXHU4QkQ1XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnd2luMzInKSByZXR1cm47XG4gIGlmIChwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9JRCAmJiBwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQpIHJldHVybjtcblxuICB0cnkge1xuICAgIC8vIFx1OTAxQVx1OEZDNyBQb3dlclNoZWxsICsgQ3JlZGVudGlhbE1hbmFnZXIgXHU4QkZCXHU1M0Q2XHVGRjA4XHU0RTBEXHU4RjkzXHU1MUZBXHU2NjBFXHU2NTg3XHU1MjMwXHU2NUU1XHU1RkQ3XHVGRjA5XG4gICAgY29uc3QgcHMgPSBbXG4gICAgICBgJEVycm9yQWN0aW9uUHJlZmVyZW5jZT0nU3RvcCdgLFxuICAgICAgYEltcG9ydC1Nb2R1bGUgQ3JlZGVudGlhbE1hbmFnZXJgLFxuICAgICAgYCRpZD0oR2V0LVN0b3JlZENyZWRlbnRpYWwgLVRhcmdldCAnQWxpYmFiYUNsb3VkJyAtRXJyb3JBY3Rpb24gU2lsZW50bHlDb250aW51ZSkuR2V0TmV0d29ya0NyZWRlbnRpYWwoKS5QYXNzd29yZGAsXG4gICAgICBgJHNlYz0oR2V0LVN0b3JlZENyZWRlbnRpYWwgLVRhcmdldCAnQWxpYmFiYUNsb3VkU2VjcmV0JyAtRXJyb3JBY3Rpb24gU2lsZW50bHlDb250aW51ZSkuR2V0TmV0d29ya0NyZWRlbnRpYWwoKS5QYXNzd29yZGAsXG4gICAgICBgJG91dD1bcHNjdXN0b21vYmplY3RdQHsgaWQ9JGlkOyBzZWNyZXQ9JHNlYyB9IHwgQ29udmVydFRvLUpzb24gLUNvbXByZXNzYCxcbiAgICAgIGBXcml0ZS1PdXRwdXQgJG91dGAsXG4gICAgXS5qb2luKCc7ICcpO1xuXG4gICAgY29uc3QgcmF3ID0gZXhlY1N5bmMoYHBvd2Vyc2hlbGwgLU5vUHJvZmlsZSAtTm9uSW50ZXJhY3RpdmUgLUNvbW1hbmQgXCIke3BzLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKX1cImAsIHtcbiAgICAgIHN0ZGlvOiBbJ2lnbm9yZScsICdwaXBlJywgJ2lnbm9yZSddLFxuICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGpzb25UZXh0ID0gKHJhdyB8fCAnJykudHJpbSgpO1xuICAgIGlmICghanNvblRleHQpIHJldHVybjtcblxuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoanNvblRleHQpIGFzIHsgaWQ/OiBzdHJpbmc7IHNlY3JldD86IHN0cmluZyB9O1xuICAgIGlmIChwYXJzZWQ/LmlkICYmICFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9JRCkgcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQgPSBwYXJzZWQuaWQ7XG4gICAgaWYgKHBhcnNlZD8uc2VjcmV0ICYmICFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQpIHByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX1NFQ1JFVCA9IHBhcnNlZC5zZWNyZXQ7XG4gIH0gY2F0Y2gge1xuICAgIC8vIFx1OTc1OVx1OUVEOFx1NTkzMVx1OEQyNVx1RkYxQVx1NEUwRFx1OTYzQlx1NTg1RVx1Njc4NFx1NUVGQVx1NkQ0MVx1N0EwQlxuICB9XG59XG5cbi8qKlxuICogXHU1MjFCXHU1RUZBIENETiBcdTRFMEFcdTRGMjBcdTYzRDJcdTRFRjZcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NTk4MiAnc3lzdGVtLWFwcCdcdUZGMDlcbiAqIEBwYXJhbSBhcHBEaXIgXHU1RTk0XHU3NTI4XHU3NkVFXHU1RjU1XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGxvYWRDZG5QbHVnaW4oYXBwTmFtZTogc3RyaW5nLCBfYXBwRGlyOiBzdHJpbmcpOiBQbHVnaW4ge1xuICBsZXQgaXNQcm9kdWN0aW9uQnVpbGQgPSBmYWxzZTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICd1cGxvYWQtY2RuJyxcbiAgICBhcHBseTogJ2J1aWxkJywgLy8gXHU1M0VBXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU2MjY3XHU4ODRDXG5cbiAgICBjb25maWdSZXNvbHZlZChjb25maWc6IFJlc29sdmVkQ29uZmlnKSB7XG4gICAgICAvLyBWaXRlIFx1NzY4NCBpc1Byb2R1Y3Rpb24gXHU2NjJGXHU2NzAwXHU1M0VGXHU5NzYwXHU3Njg0XHU1MjI0XHU2NUFEXHVGRjA4XHU5MDdGXHU1MTREIE5PREVfRU5WIC8gREVWIFx1N0I0OVx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1NTcyOCBDSSBcdTRFMkRcdTRFMERcdTRFMDBcdTgxRjRcdUZGMDlcbiAgICAgIGlzUHJvZHVjdGlvbkJ1aWxkID0gISFjb25maWcuaXNQcm9kdWN0aW9uO1xuICAgIH0sXG5cbiAgICBhc3luYyBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NTQyRlx1NzUyOCBDRE4gXHU0RTBBXHU0RjIwXG4gICAgICBpZiAocHJvY2Vzcy5lbnYuRU5BQkxFX0NETl9VUExPQUQgIT09ICd0cnVlJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1OERGM1x1OEZDN1x1NEUwQVx1NEYyMFxuICAgICAgaWYgKHByb2Nlc3MuZW52LlNLSVBfQ0ROX1VQTE9BRCA9PT0gJ3RydWUnKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW3VwbG9hZC1jZG5dIFx1MjNFRFx1RkUwRiAgXHU4REYzXHU4RkM3ICR7YXBwTmFtZX0gXHU3Njg0IENETiBcdTRFMEFcdTRGMjBcdUZGMDhTS0lQX0NETl9VUExPQUQ9dHJ1ZVx1RkYwOWApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTNFQVx1NTcyOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1Njc4NFx1NUVGQVx1NjVGNlx1NEUwQVx1NEYyMFxuICAgICAgaWYgKCFpc1Byb2R1Y3Rpb25CdWlsZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFdpbmRvd3MgXHU2NzJDXHU1NzMwXHU2Nzg0XHU1RUZBXHVGRjFBXHU1OTgyXHU2NzlDXHU2NzJBXHU2NjNFXHU1RjBGXHU4QkJFXHU3RjZFIGVudi8uZW52Lm9zc1x1RkYwQ1x1NUMxRFx1OEJENVx1NEVDRVx1NTFFRFx1OEJDMVx1N0JBMVx1NzQwNlx1NTY2OFx1OEJGQlx1NTNENlxuICAgICAgdHJ5TG9hZE9zc0NyZWRzRnJvbVdpbmRvd3NDcmVkZW50aWFsTWFuYWdlcigpO1xuXG4gICAgICAvLyBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTY3MDkgT1NTIFx1OTE0RFx1N0Y2RVxuICAgICAgaWYgKCFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9JRCB8fCAhcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgW3VwbG9hZC1jZG5dIFx1MjZBMFx1RkUwRiAgXHU4REYzXHU4RkM3ICR7YXBwTmFtZX0gXHU3Njg0IENETiBcdTRFMEFcdTRGMjBcdUZGMDhcdTY3MkFcdTkxNERcdTdGNkUgT1NTIFx1NTFFRFx1OEJDMVx1RkYwOWApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTcyOCBDSSBcdTRFMkRcdTVGQzVcdTk4N0JcdTdCNDlcdTVGODVcdTRFMEFcdTRGMjBcdTVCOENcdTYyMTBcdUZGMENcdTU0MjZcdTUyMTlcdTY3ODRcdTVFRkFcdThGREJcdTdBMEJcdTkwMDBcdTUxRkFcdTRGMUFcdTc2RjRcdTYzQTVcdTdFQzhcdTZCNjJcdTVCNTBcdThGREJcdTdBMEJcdUZGMENcdTVCRkNcdTgxRjRcdTY1ODdcdTRFRjZcdTY3MkFcdTRFMEFcdTRGMjBcbiAgICAgIGNvbnN0IHVwbG9hZFNjcmlwdCA9IHJlc29sdmUocHJvamVjdFJvb3QsICdzY3JpcHRzL3VwbG9hZC1hcHAtdG8tY2RuLm1qcycpO1xuICAgICAgY29uc29sZS5pbmZvKGBbdXBsb2FkLWNkbl0gXHVEODNEXHVERTgwIFx1NUYwMFx1NTlDQlx1NEUwQVx1NEYyMCAke2FwcE5hbWV9IFx1NTIzMCBDRE4uLi5gKTtcblxuICAgICAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmVQcm9taXNlLCByZWplY3RQcm9taXNlKSA9PiB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gc3Bhd24oJ25vZGUnLCBbdXBsb2FkU2NyaXB0LCBhcHBOYW1lXSwge1xuICAgICAgICAgIHN0ZGlvOiAnaW5oZXJpdCcsXG4gICAgICAgICAgc2hlbGw6IHRydWUsXG4gICAgICAgICAgZW52OiB7XG4gICAgICAgICAgICAuLi5wcm9jZXNzLmVudixcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBjaGlsZC5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgICAgICByZWplY3RQcm9taXNlKGVycm9yKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2hpbGQub24oJ2V4aXQnLCAoY29kZSkgPT4ge1xuICAgICAgICAgIGlmIChjb2RlID09PSAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oYFt1cGxvYWQtY2RuXSBcdTI3MDUgJHthcHBOYW1lfSBcdTRFMEFcdTRGMjBcdTVCOENcdTYyMTBgKTtcbiAgICAgICAgICAgIHJlc29sdmVQcm9taXNlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFx1OUVEOFx1OEJBNFx1NEUwRFx1OTYzQlx1NTg1RVx1Njc4NFx1NUVGQVx1RkYxQVx1NTk4Mlx1OTcwMFx1NEUyNVx1NjgzQ1x1NTkzMVx1OEQyNVx1RkYwOENJIFx1NUYzQVx1NTIzNlx1NEUwQVx1NEYyMFx1NjIxMFx1NTI5Rlx1RkYwOVx1RkYwQ1x1OEJCRVx1N0Y2RSBPU1NfVVBMT0FEX1NUUklDVD10cnVlXG4gICAgICAgICAgICBjb25zdCBzdHJpY3QgPSBwcm9jZXNzLmVudi5PU1NfVVBMT0FEX1NUUklDVCA9PT0gJ3RydWUnO1xuICAgICAgICAgICAgY29uc3QgZXJyID0gbmV3IEVycm9yKGBbdXBsb2FkLWNkbl0gJHthcHBOYW1lfSBcdTRFMEFcdTRGMjBcdTgxMUFcdTY3MkNcdTkwMDBcdTUxRkFcdUZGMENcdTRFRTNcdTc4MDE6ICR7Y29kZSA/PyAndW5rbm93bid9YCk7XG4gICAgICAgICAgICBpZiAoc3RyaWN0KSB7XG4gICAgICAgICAgICAgIHJlamVjdFByb21pc2UoZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgIHJlc29sdmVQcm9taXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcY2RuLWFzc2V0cy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9jZG4tYXNzZXRzLnRzXCI7LyoqXG4gKiBDRE4gXHU4RDQ0XHU2RTkwXHU1MkEwXHU5MDFGXHU2M0QyXHU0RUY2XG4gKiBcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTRGRUVcdTY1MzkgSFRNTCBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTAgVVJMXHVGRjBDXHU1QzA2XHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHU4RjZDXHU2MzYyXHU0RTNBIENETiBVUkxcbiAqIFx1NjUyRlx1NjMwMVx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MCAoL2Fzc2V0cy8pIFx1NTQ4Q1x1NUUwM1x1NUM0MFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MCAoL2Fzc2V0cy9sYXlvdXQvKVxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbY2RuLWFzc2V0c10nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW2Nkbi1hc3NldHNdJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbY2RuLWFzc2V0c10nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW2Nkbi1hc3NldHNdJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIENkbkFzc2V0c1BsdWdpbk9wdGlvbnMge1xuICAvKipcbiAgICogXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHVGRjA4XHU1OTgyICdhZG1pbi1hcHAnXHVGRjA5XG4gICAqL1xuICBhcHBOYW1lOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdTU0MkZcdTc1MjggQ0ROIFx1NTJBMFx1OTAxRlx1RkYwOFx1OUVEOFx1OEJBNFx1RkYxQVx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NTQyRlx1NzUyOFx1RkYwOVxuICAgKi9cbiAgZW5hYmxlZD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBDRE4gXHU1N0RGXHU1NDBEXHVGRjA4XHU5RUQ4XHU4QkE0XHVGRjFBYWxsLmJlbGxpcy5jb20uY25cdUZGMDlcbiAgICovXG4gIGNkbkRvbWFpbj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBDRE4gXHU4RDQ0XHU2RTkwXHU1MkEwXHU5MDFGXHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjZG5Bc3NldHNQbHVnaW4ob3B0aW9uczogQ2RuQXNzZXRzUGx1Z2luT3B0aW9ucyk6IFBsdWdpbiB7XG4gIGNvbnN0IHtcbiAgICBhcHBOYW1lLFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OUVEOFx1OEJBNFx1NTQyRlx1NzUyOFx1Njc2MVx1NEVGNlx1NUZDNVx1OTg3Qlx1NjYwRVx1Nzg2RVx1NjhDMFx1NjdFNSBFTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiBcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcbiAgICAvLyBcdTU5ODJcdTY3OUMgRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gXHU4OEFCXHU4QkJFXHU3RjZFXHU0RTNBICdmYWxzZSdcdUZGMENcdTUyMTlcdTc5ODFcdTc1MjggQ0ROXG4gICAgLy8gXHU1M0VBXHU2NzA5XHU1NzI4XHU2NjBFXHU3ODZFXHU1NDJGXHU3NTI4XHVGRjA4RU5BQkxFX0NETl9BQ0NFTEVSQVRJT049dHJ1ZVx1RkYwOVx1NjIxNlx1NjcyQVx1OEJCRVx1N0Y2RVx1NEUxNFx1NjYyRlx1NzUxRlx1NEVBN1x1Njc4NFx1NUVGQVx1NjVGNlx1RkYwQ1x1NjI0RFx1NTQyRlx1NzUyOCBDRE5cbiAgICBlbmFibGVkID0gcHJvY2Vzcy5lbnYuRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gPT09ICd0cnVlJyB8fCBcbiAgICAgICAgICAgICAgKHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OICE9PSAnZmFsc2UnICYmIFxuICAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyAmJiBcbiAgICAgICAgICAgICAgIHByb2Nlc3MuZW52LlZJVEVfUFJFVklFVyAhPT0gJ3RydWUnKSxcbiAgICBjZG5Eb21haW4gPSAnaHR0cHM6Ly9hbGwuYmVsbGlzLmNvbS5jbicsXG4gIH0gPSBvcHRpb25zO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2Nkbi1hc3NldHMnLFxuICAgIGFwcGx5OiAnYnVpbGQnLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtjZG4tYXNzZXRzXSBDRE4gXHU1MkEwXHU5MDFGXHU1REYyXHU1NDJGXHU3NTI4XHVGRjBDXHU1RTk0XHU3NTI4OiAke2FwcE5hbWV9LCBDRE4gXHU1N0RGXHU1NDBEOiAke2NkbkRvbWFpbn1gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW2Nkbi1hc3NldHNdIENETiBcdTUyQTBcdTkwMUZcdTVERjJcdTc5ODFcdTc1MjhgKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRyYW5zZm9ybUluZGV4SHRtbDoge1xuICAgICAgb3JkZXI6ICdwb3N0JywgLy8gXHU1NzI4IGFkZFZlcnNpb25QbHVnaW4gXHU0RTRCXHU1NDBFXHU2MjY3XHU4ODRDXG4gICAgICBoYW5kbGVyKGh0bWwpIHtcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1MzczXHU0RjdGIENETiBcdTYzRDJcdTRFRjZcdTg4QUJcdTc5ODFcdTc1MjhcdUZGMENcdTU5ODJcdTY3OUNcdTY2MkZcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdUZGMENcdTRFNUZcdTk3MDBcdTg5ODFcdTZDRThcdTUxNjVcdTY1RTlcdTY3MUYgVVJMIFx1OEY2Q1x1NjM2Mlx1ODExQVx1NjcyQ1xuICAgICAgICAvLyBcdTU2RTBcdTRFM0FcdTk4ODRcdTg5QzhcdTczQUZcdTU4ODNcdTUzRUZcdTgwRkRcdTRGN0ZcdTc1MjhcdTRFNEJcdTUyNERcdTY3ODRcdTVFRkFcdTc2ODRcdTUzMDVcdTU0MkIgQ0ROIFVSTCBcdTc2ODRcdTRFQTdcdTcyNjlcbiAgICAgICAgY29uc3QgaXNQcmV2aWV3QnVpbGQgPSBwcm9jZXNzLmVudi5WSVRFX1BSRVZJRVcgPT09ICd0cnVlJztcbiAgICAgICAgY29uc3QgbmVlZHNFYXJseUNvbnZlcnRlciA9IGlzUHJldmlld0J1aWxkICYmICFlbmFibGVkO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFlbmFibGVkICYmICFuZWVkc0Vhcmx5Q29udmVydGVyKSB7XG4gICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbmV3SHRtbCA9IGh0bWw7XG4gICAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIDEpIFx1NTkwNFx1NzQwNiA8c2NyaXB0IHNyYz4gXHU2ODA3XHU3QjdFXHVGRjA4XHU0RUM1XHU1NzI4IENETiBcdTU0MkZcdTc1MjhcdTY1RjZcdThGNkNcdTYzNjJcdUZGMDlcbiAgICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgICAgLyg8c2NyaXB0W14+XSpcXHMrc3JjPVtcIiddKShbXlwiJ10rKShbXCInXVtePl0qPikvZyxcbiAgICAgICAgICAgIChtYXRjaDogc3RyaW5nLCBwcmVmaXg6IHN0cmluZywgc3JjOiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcdUZGMUEvYXNzZXRzL3h4eC5qc1xuICAgICAgICAgICAgICBpZiAoc3JjLnN0YXJ0c1dpdGgoJy9hc3NldHMvJykgJiYgIXNyYy5zdGFydHNXaXRoKCcvYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vJHthcHBOYW1lfSR7c3JjfWA7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU1RTAzXHU1QzQwXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXHVGRjFBL2Fzc2V0cy9sYXlvdXQveHh4LmpzXG4gICAgICAgICAgICAgIGlmIChzcmMuc3RhcnRzV2l0aCgnL2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59L2xheW91dC1hcHAke3NyY31gO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYxQS4vYXNzZXRzL3h4eC5qcyBcdTYyMTYgYXNzZXRzL3h4eC5qc1xuICAgICAgICAgICAgICBpZiAoc3JjLnN0YXJ0c1dpdGgoJy4vYXNzZXRzLycpIHx8IHNyYy5zdGFydHNXaXRoKCdhc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub3JtYWxpemVkUGF0aCA9IHNyYy5zdGFydHNXaXRoKCcuLycpID8gc3JjLnN1YnN0cmluZygyKSA6IHNyYztcbiAgICAgICAgICAgICAgICBpZiAobm9ybWFsaXplZFBhdGguc3RhcnRzV2l0aCgnYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS9sYXlvdXQtYXBwLyR7bm9ybWFsaXplZFBhdGh9YDtcbiAgICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5vcm1hbGl6ZWRQYXRoLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS8ke2FwcE5hbWV9LyR7bm9ybWFsaXplZFBhdGh9YDtcbiAgICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDIpIFx1NTkwNFx1NzQwNiA8bGluayBocmVmPiBcdTY4MDdcdTdCN0VcdUZGMDhDU1NcdTMwMDFtb2R1bGVwcmVsb2FkIFx1N0I0OVx1RkYwOVx1RkYwOFx1NEVDNVx1NTcyOCBDRE4gXHU1NDJGXHU3NTI4XHU2NUY2XHU4RjZDXHU2MzYyXHVGRjA5XG4gICAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShcbiAgICAgICAgICAgIC8oPGxpbmtbXj5dKlxccytocmVmPVtcIiddKShbXlwiJ10rKShbXCInXVtePl0qPikvZyxcbiAgICAgICAgICAgIChtYXRjaDogc3RyaW5nLCBwcmVmaXg6IHN0cmluZywgaHJlZjogc3RyaW5nLCBzdWZmaXg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcdUZGMUEvYXNzZXRzL3h4eC5jc3NcbiAgICAgICAgICAgICAgaWYgKGhyZWYuc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKSAmJiAhaHJlZi5zdGFydHNXaXRoKCcvYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vJHthcHBOYW1lfSR7aHJlZn1gO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NUUwM1x1NUM0MFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFx1RkYxQS9hc3NldHMvbGF5b3V0L3h4eC5jc3NcbiAgICAgICAgICAgICAgaWYgKGhyZWYuc3RhcnRzV2l0aCgnL2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59L2xheW91dC1hcHAke2hyZWZ9YDtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcbiAgICAgICAgICAgICAgaWYgKGhyZWYuc3RhcnRzV2l0aCgnLi9hc3NldHMvJykgfHwgaHJlZi5zdGFydHNXaXRoKCdhc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub3JtYWxpemVkUGF0aCA9IGhyZWYuc3RhcnRzV2l0aCgnLi8nKSA/IGhyZWYuc3Vic3RyaW5nKDIpIDogaHJlZjtcbiAgICAgICAgICAgICAgICBpZiAobm9ybWFsaXplZFBhdGguc3RhcnRzV2l0aCgnYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS9sYXlvdXQtYXBwLyR7bm9ybWFsaXplZFBhdGh9YDtcbiAgICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5vcm1hbGl6ZWRQYXRoLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS8ke2FwcE5hbWV9LyR7bm9ybWFsaXplZFBhdGh9YDtcbiAgICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDMpIFx1NTkwNFx1NzQwNiA8aW1nIHNyYz4gXHU2ODA3XHU3QjdFXHVGRjA4XHU0RUM1XHU1NzI4IENETiBcdTU0MkZcdTc1MjhcdTY1RjZcdThGNkNcdTYzNjJcdUZGMDlcbiAgICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgICAgLyg8aW1nW14+XSpcXHMrc3JjPVtcIiddKShbXlwiJ10rKShbXCInXVtePl0qPikvZyxcbiAgICAgICAgICAgIChtYXRjaDogc3RyaW5nLCBwcmVmaXg6IHN0cmluZywgc3JjOiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFx1RkYxQS9hc3NldHMveHh4LnBuZ1xuICAgICAgICAgICAgICBpZiAoc3JjLnN0YXJ0c1dpdGgoJy9hc3NldHMvJykgJiYgIXNyYy5zdGFydHNXaXRoKCcvYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vJHthcHBOYW1lfSR7c3JjfWA7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU1RTAzXHU1QzQwXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXHVGRjFBL2Fzc2V0cy9sYXlvdXQveHh4LnBuZ1xuICAgICAgICAgICAgICBpZiAoc3JjLnN0YXJ0c1dpdGgoJy9hc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS9sYXlvdXQtYXBwJHtzcmN9YDtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyA0KSBcdTU5MDRcdTc0MDZcdTUxODVcdTgwNTRcdTc2ODQgaW1wb3J0KCkgXHU4QzAzXHU3NTI4XHVGRjA4XHU1NzI4IEhUTUwgXHU2QTIxXHU2NzdGXHU0RTJEXHVGRjA5XG4gICAgICAgIC8vIFx1NEZFRVx1NTkwRCBxaWFua3VuIFx1NkNFOFx1NTE2NVx1NzY4NFx1NTE4NVx1ODA1NCBpbXBvcnQoJy9hc3NldHMvaW5kZXgteHh4LmpzJylcbiAgICAgICAgY29uc3Qgb3JpZ2luRXhwciA9XG4gICAgICAgICAgYCgodHlwZW9mIF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fIT09J3VuZGVmaW5lZCcmJl9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fKWAgK1xuICAgICAgICAgIGA/bmV3IFVSTChfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXywodHlwZW9mIGxvY2F0aW9uIT09J3VuZGVmaW5lZCcmJmxvY2F0aW9uLm9yaWdpbil8fCcnKS5vcmlnaW5gICtcbiAgICAgICAgICBgOigodHlwZW9mIGxvY2F0aW9uIT09J3VuZGVmaW5lZCcmJmxvY2F0aW9uLm9yaWdpbil8fCcnKSlgO1xuICAgICAgICBcbiAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShcbiAgICAgICAgICAvaW1wb3J0XFwoXFxzKihbJ1wiXSkoXFwvYXNzZXRzXFwvKGluZGV4fG1haW4pLVteJ1wiXSspXFwxXFxzKlxcKS9nLFxuICAgICAgICAgIChfbTogc3RyaW5nLCBfcTogc3RyaW5nLCBhYnNQYXRoOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIFx1NEZERFx1NjMwMVx1NTM5Rlx1NjcwOVx1OTAzQlx1OEY5MVx1RkYwQ1x1NEY0Nlx1Nzg2RVx1NEZERFx1OERFRlx1NUY4NFx1NkI2M1x1Nzg2RVxuICAgICAgICAgICAgcmV0dXJuIGBpbXBvcnQoLyogQHZpdGUtaWdub3JlICovICgke29yaWdpbkV4cHJ9ICsgJyR7YWJzUGF0aH0nKSlgO1xuICAgICAgICAgIH0sXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gNSkgXHU2Q0U4XHU1MTY1XHU4RDQ0XHU2RTkwXHU1MkEwXHU4RjdEXHU1NjY4XHU1MjFEXHU1OUNCXHU1MzE2XHU4MTFBXHU2NzJDXHU1NDhDXHU2NUU5XHU2NzFGIFVSTCBcdThGNkNcdTYzNjJcdTgxMUFcdTY3MkNcbiAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1MzczXHU0RjdGIENETiBcdTYzRDJcdTRFRjZcdTg4QUJcdTc5ODFcdTc1MjhcdUZGMENcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdTY1RjZcdTRFNUZcdTk3MDBcdTg5ODFcdTZDRThcdTUxNjVcdTY1RTlcdTY3MUYgVVJMIFx1OEY2Q1x1NjM2Mlx1ODExQVx1NjcyQ1xuICAgICAgICBpZiAoIW5ld0h0bWwuaW5jbHVkZXMoJ19fQlRDX1JFU09VUkNFX0xPQURFUl9fJykgfHwgbmVlZHNFYXJseUNvbnZlcnRlcikge1xuICAgICAgICAgIC8vIFx1NjgzOVx1NjM2RSBFTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiBcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdTUxQjNcdTVCOUFcdTY2MkZcdTU0MjZcdTU0MkZcdTc1MjggQ0ROXG4gICAgICAgICAgY29uc3QgY2RuRW5hYmxlZCA9IHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OICE9PSAnZmFsc2UnO1xuICAgICAgICAgIGNvbnN0IGlzUHJldmlld0J1aWxkID0gcHJvY2Vzcy5lbnYuVklURV9QUkVWSUVXID09PSAndHJ1ZSc7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gXHU2NUU5XHU2NzFGIFVSTCBcdThGNkNcdTYzNjJcdTgxMUFcdTY3MkNcdUZGMDhcdTU3MjhcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdTY1RjZcdTZDRThcdTUxNjVcdUZGMENcdTc1MjhcdTRFOEVcdTU3MjggSFRNTCBcdTg5RTNcdTY3OTBcdTUyNERcdThGNkNcdTYzNjIgQ0ROIFVSTFx1RkYwOVxuICAgICAgICAgIC8vIFx1NTM3M1x1NEY3RiBDRE4gXHU2M0QyXHU0RUY2XHU4OEFCXHU3OTgxXHU3NTI4XHVGRjBDXHU5ODg0XHU4OUM4XHU3M0FGXHU1ODgzXHU0RTVGXHU1M0VGXHU4MEZEXHU0RjdGXHU3NTI4XHU1MzA1XHU1NDJCIENETiBVUkwgXHU3Njg0XHU2NUU3XHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XG4gICAgICAgICAgY29uc3QgZWFybHlVcmxDb252ZXJ0ZXJTY3JpcHQgPSBpc1ByZXZpZXdCdWlsZCA/IGBcbjxzY3JpcHQ+XG4gIChmdW5jdGlvbigpIHtcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU3MjggSFRNTCBcdTg5RTNcdTY3OTBcdTRFNEJcdTUyNERcdTVDMzFcdTU5MDRcdTc0MDYgQ0ROIFVSTFx1RkYwQ1x1OTA3Rlx1NTE0RFx1NkQ0Rlx1ODlDOFx1NTY2OFx1OEJGN1x1NkM0MiBDRE4gXHU4RDQ0XHU2RTkwXG4gICAgLy8gXHU4RkQ5XHU0RTJBXHU4MTFBXHU2NzJDXHU1RkM1XHU5ODdCXHU1NzI4XHU2MjQwXHU2NzA5XHU1MTc2XHU0RUQ2IHNjcmlwdCBcdTU0OEMgbGluayBcdTY4MDdcdTdCN0VcdTRFNEJcdTUyNERcdTYyNjdcdTg4NENcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc3QgY29udmVydENkblVybCA9ICh1cmwpID0+IHtcbiAgICAgICAgaWYgKCF1cmwgfHwgKCF1cmwuc3RhcnRzV2l0aCgnaHR0cDovLycpICYmICF1cmwuc3RhcnRzV2l0aCgnaHR0cHM6Ly8nKSkpIHtcbiAgICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgdXJsT2JqID0gbmV3IFVSTCh1cmwpO1xuICAgICAgICAgIGlmICh1cmxPYmouaG9zdG5hbWUuaW5jbHVkZXMoJ2FsbC5iZWxsaXMuY29tLmNuJykgfHwgXG4gICAgICAgICAgICAgIHVybE9iai5ob3N0bmFtZS5pbmNsdWRlcygnYmVsbGlzMS5vc3MtY24tc2hlbnpoZW4uYWxpeXVuY3MuY29tJykpIHtcbiAgICAgICAgICAgIC8vIFx1NjNEMFx1NTNENlx1OERFRlx1NUY4NFx1OTBFOFx1NTIwNlx1RkYwQ1x1NTNCQlx1NjM4OVx1NUU5NFx1NzUyOFx1NTI0RFx1N0YwMFxuICAgICAgICAgICAgbGV0IHBhdGggPSB1cmxPYmoucGF0aG5hbWU7XG4gICAgICAgICAgICBpZiAocGF0aC5pbmNsdWRlcygnL2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICBwYXRoID0gcGF0aC5zdWJzdHJpbmcocGF0aC5pbmRleE9mKCcvYXNzZXRzLycpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGF0aC5pbmNsdWRlcygnL2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgcGF0aCA9IHBhdGguc3Vic3RyaW5nKHBhdGguaW5kZXhPZignL2Fzc2V0cy9sYXlvdXQvJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gXHU0RkREXHU3NTU5XHU2N0U1XHU4QkUyXHU1M0MyXHU2NTcwXHU1NDhDXHU1NEM4XHU1RTBDXG4gICAgICAgICAgICByZXR1cm4gcGF0aCArICh1cmxPYmouc2VhcmNoIHx8ICcnKSArICh1cmxPYmouaGFzaCB8fCAnJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gVVJMIFx1ODlFM1x1Njc5MFx1NTkzMVx1OEQyNVx1RkYwQ1x1OEZENFx1NTZERVx1NTM5RiBVUkxcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgfTtcbiAgICAgIFxuICAgICAgLy8gXHU2MkU2XHU2MjJBIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnRcdUZGMENcdTU3MjhcdTUyMUJcdTVFRkEgc2NyaXB0IFx1NTQ4QyBsaW5rIFx1NjgwN1x1N0I3RVx1NjVGNlx1OEY2Q1x1NjM2MiBVUkxcbiAgICAgIGNvbnN0IG9yaWdpbmFsQ3JlYXRlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQuYmluZChkb2N1bWVudCk7XG4gICAgICBkb2N1bWVudC5jcmVhdGVFbGVtZW50ID0gZnVuY3Rpb24odGFnTmFtZSwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gb3JpZ2luYWxDcmVhdGVFbGVtZW50KHRhZ05hbWUsIG9wdGlvbnMpO1xuICAgICAgICBpZiAodGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc2NyaXB0JyB8fCB0YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdsaW5rJykge1xuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsU2V0QXR0cmlidXRlID0gZWxlbWVudC5zZXRBdHRyaWJ1dGUuYmluZChlbGVtZW50KTtcbiAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoKG5hbWUgPT09ICdzcmMnIHx8IG5hbWUgPT09ICdocmVmJykgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICBjb25zdCBjb252ZXJ0ZWRVcmwgPSBjb252ZXJ0Q2RuVXJsKHZhbHVlKTtcbiAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsU2V0QXR0cmlidXRlKG5hbWUsIGNvbnZlcnRlZFVybCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxTZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICB9O1xuICAgICAgXG4gICAgICAvLyBcdTU5MDRcdTc0MDZcdTVERjJcdTVCNThcdTU3MjhcdTc2ODQgc2NyaXB0IFx1NTQ4QyBsaW5rIFx1NjgwN1x1N0I3RVx1RkYwOFx1NTk4Mlx1Njc5QyBET00gXHU1REYyXHU3RUNGXHU5MEU4XHU1MjA2XHU4OUUzXHU2NzkwXHVGRjA5XG4gICAgICBjb25zdCBwcm9jZXNzRXhpc3RpbmdUYWdzID0gKCkgPT4ge1xuICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCkge1xuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdFtzcmNdJykuZm9yRWFjaCgoc2NyaXB0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzcmMgPSBzY3JpcHQuZ2V0QXR0cmlidXRlKCdzcmMnKTtcbiAgICAgICAgICAgIGlmIChzcmMpIHtcbiAgICAgICAgICAgICAgY29uc3QgY29udmVydGVkVXJsID0gY29udmVydENkblVybChzcmMpO1xuICAgICAgICAgICAgICBpZiAoY29udmVydGVkVXJsICE9PSBzcmMpIHtcbiAgICAgICAgICAgICAgICBzY3JpcHQuc2V0QXR0cmlidXRlKCdzcmMnLCBjb252ZXJ0ZWRVcmwpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbGlua1tocmVmXScpLmZvckVhY2goKGxpbmspID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGhyZWYgPSBsaW5rLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICAgICAgICAgICAgaWYgKGhyZWYpIHtcbiAgICAgICAgICAgICAgY29uc3QgY29udmVydGVkVXJsID0gY29udmVydENkblVybChocmVmKTtcbiAgICAgICAgICAgICAgaWYgKGNvbnZlcnRlZFVybCAhPT0gaHJlZikge1xuICAgICAgICAgICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKCdocmVmJywgY29udmVydGVkVXJsKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgXG4gICAgICAvLyBcdTdBQ0JcdTUzNzNcdTU5MDRcdTc0MDZcdUZGMDhcdTU5ODJcdTY3OUMgRE9NIFx1NURGMlx1N0VDRlx1OTBFOFx1NTIwNlx1ODlFM1x1Njc5MFx1RkYwOVxuICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJyB8fCBkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnaW50ZXJhY3RpdmUnKSB7XG4gICAgICAgIHByb2Nlc3NFeGlzdGluZ1RhZ3MoKTtcbiAgICAgICAgLy8gXHU3NkQxXHU1NDJDIERPTSBcdTUzRDhcdTUzMTZcdUZGMENcdTU5MDRcdTc0MDZcdTU0MEVcdTdFRURcdTZERkJcdTUyQTBcdTc2ODRcdTY4MDdcdTdCN0VcbiAgICAgICAgaWYgKGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgcHJvY2Vzc0V4aXN0aW5nVGFncyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2Nlc3NFeGlzdGluZ1RhZ3MoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pKCk7XG48L3NjcmlwdD5gIDogJyc7XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc3QgbG9hZGVyU2NyaXB0ID0gYFxuPHNjcmlwdD5cbiAgKGZ1bmN0aW9uKCkge1xuICAgIC8vIFx1OEQ0NFx1NkU5MFx1NTJBMFx1OEY3RFx1NTY2OFx1NUMwNlx1NTcyOFx1OEZEMFx1ODg0Q1x1NjVGNlx1NkEyMVx1NTc1N1x1NEUyRFx1NTIxRFx1NTlDQlx1NTMxNlxuICAgIC8vIFx1OEZEOVx1OTFDQ1x1NTNFQVx1OEJCRVx1N0Y2RVx1NTdGQVx1Nzg0MFx1OTE0RFx1N0Y2RVxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgd2luZG93Ll9fQlRDX0NETl9DT05GSUdfXyA9IHtcbiAgICAgICAgYXBwTmFtZTogJyR7YXBwTmFtZX0nLFxuICAgICAgICBjZG5Eb21haW46ICcke2NkbkRvbWFpbn0nLFxuICAgICAgICBvc3NEb21haW46ICdodHRwczovL2JlbGxpczEub3NzLWNuLXNoZW56aGVuLmFsaXl1bmNzLmNvbScsXG4gICAgICAgIGVuYWJsZWQ6ICR7Y2RuRW5hYmxlZH1cbiAgICAgIH07XG4gICAgfVxuICB9KSgpO1xuPC9zY3JpcHQ+YDtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBcdTU3MjggPC9oZWFkPiBcdTRFNEJcdTUyNERcdTZDRThcdTUxNjVcdUZGMDhcdTY1RTlcdTY3MUYgVVJMIFx1OEY2Q1x1NjM2Mlx1ODExQVx1NjcyQ1x1NUZDNVx1OTg3Qlx1NTcyOFx1NjcwMFx1NTI0RFx1OTc2Mlx1RkYwQ1x1NTcyOFx1NjI0MFx1NjcwOVx1NTE3Nlx1NEVENiBzY3JpcHQgXHU1NDhDIGxpbmsgXHU2ODA3XHU3QjdFXHU0RTRCXHU1MjREXHVGRjA5XG4gICAgICAgICAgaWYgKG5ld0h0bWwuaW5jbHVkZXMoJzwvaGVhZD4nKSkge1xuICAgICAgICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU2NUU5XHU2NzFGIFVSTCBcdThGNkNcdTYzNjJcdTgxMUFcdTY3MkNcdTVGQzVcdTk4N0JcdTU3MjggPGhlYWQ+IFx1NzY4NFx1NjcwMFx1NTI0RFx1OTc2Mlx1RkYwQ1x1NTcyOFx1NjI0MFx1NjcwOVx1NTE3Nlx1NEVENlx1NjgwN1x1N0I3RVx1NEU0Qlx1NTI0RFxuICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1REYyXHU3RUNGXHU2NzA5XHU1MTc2XHU0RUQ2IHNjcmlwdCBcdTY4MDdcdTdCN0VcdUZGMENcdTU3MjhcdTdCMkNcdTRFMDBcdTRFMkEgc2NyaXB0IFx1NjgwN1x1N0I3RVx1NEU0Qlx1NTI0RFx1NjNEMlx1NTE2NVxuICAgICAgICAgICAgaWYgKGVhcmx5VXJsQ29udmVydGVyU2NyaXB0ICYmIG5ld0h0bWwuaW5jbHVkZXMoJzxzY3JpcHQnKSkge1xuICAgICAgICAgICAgICAvLyBcdTU3MjhcdTdCMkNcdTRFMDBcdTRFMkEgPHNjcmlwdD4gXHU2MjE2IDxsaW5rPiBcdTY4MDdcdTdCN0VcdTRFNEJcdTUyNERcdTYzRDJcdTUxNjVcdTY1RTlcdTY3MUZcdThGNkNcdTYzNjJcdTgxMUFcdTY3MkNcbiAgICAgICAgICAgICAgY29uc3QgZmlyc3RUYWdNYXRjaCA9IG5ld0h0bWwubWF0Y2goLzwoc2NyaXB0fGxpbmspW14+XSo+L2kpO1xuICAgICAgICAgICAgICBpZiAoZmlyc3RUYWdNYXRjaCAmJiBmaXJzdFRhZ01hdGNoLmluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5zbGljZSgwLCBmaXJzdFRhZ01hdGNoLmluZGV4KSArIGVhcmx5VXJsQ29udmVydGVyU2NyaXB0ICsgbmV3SHRtbC5zbGljZShmaXJzdFRhZ01hdGNoLmluZGV4KTtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5XHU2MjdFXHU1MjMwIHNjcmlwdCBcdTYyMTYgbGluayBcdTY4MDdcdTdCN0VcdUZGMENcdTU3MjggPC9oZWFkPiBcdTRFNEJcdTUyNERcdTYzRDJcdTUxNjVcbiAgICAgICAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKCc8L2hlYWQ+JywgYCR7ZWFybHlVcmxDb252ZXJ0ZXJTY3JpcHR9XFxuPC9oZWFkPmApO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gXHU2Q0U4XHU1MTY1XHU4RDQ0XHU2RTkwXHU1MkEwXHU4RjdEXHU1NjY4XHU5MTREXHU3RjZFXHU4MTFBXHU2NzJDXG4gICAgICAgICAgICBpZiAoIW5ld0h0bWwuaW5jbHVkZXMoJ19fQlRDX1JFU09VUkNFX0xPQURFUl9fJykpIHtcbiAgICAgICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZSgnPC9oZWFkPicsIGAke2xvYWRlclNjcmlwdH1cXG48L2hlYWQ+YCk7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKG5ld0h0bWwuaW5jbHVkZXMoJzwvYm9keT4nKSkge1xuICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5IDwvaGVhZD5cdUZGMENcdTU3MjggPC9ib2R5PiBcdTRFNEJcdTUyNERcdTZDRThcdTUxNjVcbiAgICAgICAgICAgIGlmIChlYXJseVVybENvbnZlcnRlclNjcmlwdCkge1xuICAgICAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKCc8L2JvZHk+JywgYCR7ZWFybHlVcmxDb252ZXJ0ZXJTY3JpcHR9XFxuPC9ib2R5PmApO1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIW5ld0h0bWwuaW5jbHVkZXMoJ19fQlRDX1JFU09VUkNFX0xPQURFUl9fJykpIHtcbiAgICAgICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZSgnPC9ib2R5PicsIGAke2xvYWRlclNjcmlwdH1cXG48L2JvZHk+YCk7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgICBjb25zb2xlLmluZm8oYFtjZG4tYXNzZXRzXSBcdTVERjJcdTRFM0EgaW5kZXguaHRtbCBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdThGNkNcdTYzNjJcdTRFM0EgQ0ROIFVSTGApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbmV3SHRtbDtcbiAgICAgIH0sXG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxjZG4taW1wb3J0LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2Nkbi1pbXBvcnQudHNcIjsvKipcbiAqIENETiBcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdThGNkNcdTYzNjJcdTYzRDJcdTRFRjZcbiAqIFx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1OEY2Q1x1NjM2Mlx1NEVFM1x1NzgwMVx1NEUyRFx1NzY4NCBpbXBvcnQoKSBcdThDMDNcdTc1MjhcdUZGMENcdTVDMDZcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdThGNkNcdTYzNjJcdTRFM0EgQ0ROIFVSTFxuICogXHU0RTBFIGNkbkFzc2V0c1BsdWdpbiBcdTkxNERcdTU0MDhcdUZGMENcdTVCOUVcdTczQjBcdTVCOENcdTY1NzRcdTc2ODQgQ0ROIFx1NTJBMFx1OTAxRlxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbY2RuLWltcG9ydF0nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW2Nkbi1pbXBvcnRdJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbY2RuLWltcG9ydF0nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW2Nkbi1pbXBvcnRdJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIENkbkltcG9ydFBsdWdpbk9wdGlvbnMge1xuICAvKipcbiAgICogXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXHVGRjA4XHU1OTgyICdsb2dpc3RpY3MtYXBwJ1x1RkYwOVxuICAgKi9cbiAgYXBwTmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4IENETiBcdTUyQTBcdTkwMUZcdUZGMDhcdTlFRDhcdThCQTRcdUZGMUFcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTU0MkZcdTc1MjhcdUZGMDlcbiAgICovXG4gIGVuYWJsZWQ/OiBib29sZWFuO1xuICAvKipcbiAgICogQ0ROIFx1NTdERlx1NTQwRFx1RkYwOFx1OUVEOFx1OEJBNFx1RkYxQWFsbC5iZWxsaXMuY29tLmNuXHVGRjA5XG4gICAqL1xuICBjZG5Eb21haW4/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQ0ROIFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1OEY2Q1x1NjM2Mlx1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2RuSW1wb3J0UGx1Z2luKG9wdGlvbnM6IENkbkltcG9ydFBsdWdpbk9wdGlvbnMpOiBQbHVnaW4ge1xuICBjb25zdCB7XG4gICAgYXBwTmFtZSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTlFRDhcdThCQTRcdTU0MkZcdTc1MjhcdTY3NjFcdTRFRjZcdTVGQzVcdTk4N0JcdTY2MEVcdTc4NkVcdTY4QzBcdTY3RTUgRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXG4gICAgLy8gXHU1OTgyXHU2NzlDIEVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OIFx1ODhBQlx1OEJCRVx1N0Y2RVx1NEUzQSAnZmFsc2UnXHVGRjBDXHU1MjE5XHU3OTgxXHU3NTI4IENETlxuICAgIC8vIFx1NTNFQVx1NjcwOVx1NTcyOFx1NjYwRVx1Nzg2RVx1NTQyRlx1NzUyOFx1RkYwOEVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OPXRydWVcdUZGMDlcdTYyMTZcdTY3MkFcdThCQkVcdTdGNkVcdTRFMTRcdTY2MkZcdTc1MUZcdTRFQTdcdTY3ODRcdTVFRkFcdTY1RjZcdUZGMENcdTYyNERcdTU0MkZcdTc1MjggQ0ROXG4gICAgZW5hYmxlZCA9IHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OID09PSAndHJ1ZScgfHwgXG4gICAgICAgICAgICAgIChwcm9jZXNzLmVudi5FTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiAhPT0gJ2ZhbHNlJyAmJiBcbiAgICAgICAgICAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgJiYgXG4gICAgICAgICAgICAgICBwcm9jZXNzLmVudi5WSVRFX1BSRVZJRVcgIT09ICd0cnVlJyksXG4gICAgY2RuRG9tYWluID0gJ2h0dHBzOi8vYWxsLmJlbGxpcy5jb20uY24nLFxuICB9ID0gb3B0aW9ucztcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjZG4taW1wb3J0JyxcbiAgICBhcHBseTogJ2J1aWxkJyxcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGBbY2RuLWltcG9ydF0gQ0ROIFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1OEY2Q1x1NjM2Mlx1NURGMlx1NTQyRlx1NzUyOFx1RkYwQ1x1NUU5NFx1NzUyODogJHthcHBOYW1lfSwgQ0ROIFx1NTdERlx1NTQwRDogJHtjZG5Eb21haW59YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtjZG4taW1wb3J0XSBDRE4gXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU4RjZDXHU2MzYyXHU1REYyXHU3OTgxXHU3NTI4YCk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZW5kZXJDaHVuayhjb2RlOiBzdHJpbmcsIGNodW5rOiBhbnkpIHtcbiAgICAgIC8vIFx1NTcyOCByZW5kZXJDaHVuayBcdTk2MzZcdTZCQjVcdTU5MDRcdTc0MDZcdTY3ODRcdTVFRkFcdTU0MEVcdTc2ODRcdTRFRTNcdTc4MDFcbiAgICAgIC8vIFx1NkI2NFx1NjVGNiBpbXBvcnQoKSBcdThDMDNcdTc1MjhcdTVERjJcdTdFQ0ZcdTg4QUIgVml0ZSBcdThGNkNcdTYzNjJcdTRFM0FcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTc2ODQgY2h1bmsgXHU2NTg3XHU0RUY2XHVGRjA4XHU1OTgyIC4vaW5kZXgteHh4LmpzXHVGRjA5XG4gICAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTNFQVx1NTkwNFx1NzQwNiBKUyBjaHVuayBcdTY1ODdcdTRFRjZcbiAgICAgIGlmICghY2h1bmsuZmlsZU5hbWUuZW5kc1dpdGgoJy5qcycpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBcdThERjNcdThGQzdcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdUZGMDhpbmRleC14eHguanNcdUZGMDlcdUZGMENcdTU2RTBcdTRFM0FcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdTY2MkZcdTkwMUFcdThGQzcgc2NyaXB0IFx1NjgwN1x1N0I3RVx1NzZGNFx1NjNBNVx1NTJBMFx1OEY3RFx1NzY4NFx1RkYwQ1x1NURGMlx1NTcyOCBIVE1MIFx1NEUyRFx1NTkwNFx1NzQwNlxuICAgICAgaWYgKGNodW5rLmlzRW50cnkgfHwgY2h1bmsuZmlsZU5hbWUubWF0Y2goL15pbmRleC1bYS16QS1aMC05XStcXC5qcyQvKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG4gICAgICBsZXQgbmV3Q29kZSA9IGNvZGU7XG5cbiAgICAgIC8vIFx1NTMzOVx1OTE0RCBpbXBvcnQoKSBcdThDMDNcdTc1MjhcdUZGMENcdThCQzZcdTUyMkJcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTc2ODRcdThENDRcdTZFOTBcbiAgICAgIC8vIFx1NTMzOVx1OTE0RFx1NkEyMVx1NUYwRlx1RkYxQWltcG9ydCgnLi4uJykgXHU2MjE2IGltcG9ydChcIi4uLlwiKVxuICAgICAgY29uc3QgaW1wb3J0UGF0dGVybiA9IC9pbXBvcnRcXHMqXFwoXFxzKihbJ1wiXSkoW14nXCJdKylcXDFcXHMqXFwpL2c7XG5cbiAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2UoaW1wb3J0UGF0dGVybiwgKG1hdGNoOiBzdHJpbmcsIHF1b3RlOiBzdHJpbmcsIHNwZWNpZmllcjogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIFx1NTNFQVx1NTkwNFx1NzQwNlx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOC4veHh4LmpzXHVGRjA5XHU1NDhDIC9hc3NldHMvIFx1OERFRlx1NUY4NFxuICAgICAgICAvLyBcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdUZGMDhodHRwOi8vXHUzMDAxaHR0cHM6Ly9cdUZGMDlcdTU0OEMgbm9kZV9tb2R1bGVzIFx1OERFRlx1NUY4NFx1NEUwRFx1NTkwNFx1NzQwNlxuICAgICAgICBjb25zdCBpc1JlbGF0aXZlUGF0aCA9IHNwZWNpZmllci5zdGFydHNXaXRoKCcuLycpO1xuICAgICAgICBjb25zdCBpc0Fzc2V0c1BhdGggPSBzcGVjaWZpZXIuc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKTtcbiAgICAgICAgXG4gICAgICAgIGlmICghaXNSZWxhdGl2ZVBhdGggJiYgIWlzQXNzZXRzUGF0aCkge1xuICAgICAgICAgIHJldHVybiBtYXRjaDsgLy8gXHU5NzVFXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHU0RTE0XHU5NzVFIC9hc3NldHMvIFx1OERFRlx1NUY4NFx1RkYwQ1x1NEZERFx1NjMwMVx1NTM5Rlx1NjgzN1xuICAgICAgICB9XG5cbiAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIFx1ODlDNFx1ODMwM1x1NTMxNlx1OERFRlx1NUY4NFxuICAgICAgICBsZXQgbm9ybWFsaXplZFBhdGg6IHN0cmluZztcbiAgICAgICAgaWYgKGlzUmVsYXRpdmVQYXRoKSB7XG4gICAgICAgICAgLy8gXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XHVGRjFBLi9pbmRleC14eHguanMgLT4gL2Fzc2V0cy9pbmRleC14eHguanNcbiAgICAgICAgICAvLyBcdTYyMTZcdTgwMDVcdUZGMUEuL2Fzc2V0cy94eHguanMgLT4gL2Fzc2V0cy94eHguanNcbiAgICAgICAgICBpZiAoc3BlY2lmaWVyLnN0YXJ0c1dpdGgoJy4vYXNzZXRzLycpKSB7XG4gICAgICAgICAgICBub3JtYWxpemVkUGF0aCA9ICcvJyArIHNwZWNpZmllci5zdWJzdHJpbmcoMik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFZpdGUgY2h1bmsgXHU2NTg3XHU0RUY2XHVGRjFBLi9pbmRleC14eHguanMgLT4gL2Fzc2V0cy9pbmRleC14eHguanNcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRQYXRoID0gJy9hc3NldHMvJyArIHNwZWNpZmllci5zdWJzdHJpbmcoMik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFx1NURGMlx1N0VDRlx1NjYyRlx1N0VERFx1NUJGOVx1OERFRlx1NUY4NCAvYXNzZXRzL3h4eC5qc1xuICAgICAgICAgIG5vcm1hbGl6ZWRQYXRoID0gc3BlY2lmaWVyO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU1MjI0XHU2NUFEXHU2NjJGXHU1NDI2XHU2NjJGXHU1RTAzXHU1QzQwXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXG4gICAgICAgIGNvbnN0IGlzTGF5b3V0UmVzb3VyY2UgPSBub3JtYWxpemVkUGF0aC5pbmNsdWRlcygnL2Fzc2V0cy9sYXlvdXQvJyk7XG5cbiAgICAgICAgLy8gXHU3NTFGXHU2MjEwIENETiBVUkxcbiAgICAgICAgbGV0IGNkblVybDogc3RyaW5nO1xuICAgICAgICBpZiAoaXNMYXlvdXRSZXNvdXJjZSkge1xuICAgICAgICAgIC8vIFx1NUUwM1x1NUM0MFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFxuICAgICAgICAgIGNkblVybCA9IGAke2NkbkRvbWFpbn0vbGF5b3V0LWFwcCR7bm9ybWFsaXplZFBhdGh9YDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcbiAgICAgICAgICBjZG5VcmwgPSBgJHtjZG5Eb21haW59LyR7YXBwTmFtZX0ke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdThGNkNcdTYzNjJcdTRFM0EgQ0ROIFVSTFxuICAgICAgICByZXR1cm4gYGltcG9ydCgke3F1b3RlfSR7Y2RuVXJsfSR7cXVvdGV9KWA7XG4gICAgICB9KTtcblxuICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW2Nkbi1pbXBvcnRdIFx1NURGMlx1OEY2Q1x1NjM2MiBjaHVuayAke2NodW5rLmZpbGVOYW1lfSBcdTRFMkRcdTc2ODRcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdTRFM0EgQ0ROIFVSTGApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbW9kaWZpZWQgPyB7IGNvZGU6IG5ld0NvZGUsIG1hcDogbnVsbCB9IDogbnVsbDtcbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXHJlc29sdmUtYnRjLWltcG9ydHMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvcmVzb2x2ZS1idGMtaW1wb3J0cy50c1wiOy8qKlxuICogXHU4OUUzXHU2NzkwIEBidGMvKiBcdTUzMDVcdTVCRkNcdTUxNjVcdTYzRDJcdTRFRjZcbiAqIFx1NTkwNFx1NzQwNlx1NEVDRVx1NURGMlx1Njc4NFx1NUVGQVx1NzY4NFx1NTMwNVx1RkYwOFx1NTk4MiBzaGFyZWQtY29yZS9kaXN0L2luZGV4Lm1qc1x1RkYwOVx1NEUyRFx1NUJGQ1x1NTE2NVx1NzY4NCBAYnRjLyogXHU2QTIxXHU1NzU3XG4gKiBcdTU0MENcdTY1RjZcdTU5MDRcdTc0MDYgc2hhcmVkLWNvbXBvbmVudHMgXHU1MTg1XHU5MEU4XHU0RjdGXHU3NTI4XHU3Njg0XHU1MjJCXHU1NDBEXHVGRjA4XHU1OTgyIEBidGMtY29tcG9uZW50cywgQGJ0Yy1jb21tb24gXHU3QjQ5XHVGRjA5XG4gKiBcdTc4NkVcdTRGREQgUm9sbHVwIFx1ODBGRFx1NTkxRlx1NkI2M1x1Nzg2RVx1ODlFM1x1Njc5MFx1OEZEOVx1NEU5Qlx1NUJGQ1x1NTE2NVx1RkYwQ1x1NTM3M1x1NEY3Rlx1NUI4M1x1NEVFQ1x1Njc2NVx1ODFFQVx1NURGMlx1Njc4NFx1NUVGQVx1NzY4NFx1NTMwNVxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTU2RTBcdTRFM0EgZXNidWlsZCBcdTY1RTBcdTZDRDVcdTZCNjNcdTc4NkVcdTg5RTNcdTY3OTAgd29ya3NwYWNlIFx1NTMwNVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclx1RkYwQ1x1OTA3Rlx1NTE0RFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1NzY4NFx1ODlFM1x1Njc5MFx1OTVFRVx1OTg5OFxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW3Jlc29sdmUtYnRjLWltcG9ydHNdJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1tyZXNvbHZlLWJ0Yy1pbXBvcnRzXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW3Jlc29sdmUtYnRjLWltcG9ydHNdJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1tyZXNvbHZlLWJ0Yy1pbXBvcnRzXScsIC4uLmFyZ3MpLFxufTtcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tICdub2RlOmZzJztcbmltcG9ydCB7IGNyZWF0ZVBhdGhIZWxwZXJzIH0gZnJvbSAnLi4vdXRpbHMvcGF0aC1oZWxwZXJzJztcblxuZXhwb3J0IGludGVyZmFjZSBSZXNvbHZlQnRjSW1wb3J0c09wdGlvbnMge1xuICAvKipcbiAgICogXHU1RTk0XHU3NTI4XHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XG4gICAqL1xuICBhcHBEaXI6IHN0cmluZztcbiAgLyoqXG4gICAqIFx1NjYyRlx1NTQyNlx1NTQyRlx1NzUyOFx1RkYwOFx1OUVEOFx1OEJBNFx1RkYxQXRydWVcdUZGMDlcbiAgICovXG4gIGVuYWJsZWQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFx1ODlFM1x1Njc5MCBAYnRjLyogXHU1MzA1XHU1QkZDXHU1MTY1XHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlQnRjSW1wb3J0c1BsdWdpbihvcHRpb25zOiBSZXNvbHZlQnRjSW1wb3J0c09wdGlvbnMpOiBQbHVnaW4ge1xuICBjb25zdCB7IGFwcERpciwgZW5hYmxlZCA9IHRydWUgfSA9IG9wdGlvbnM7XG5cbiAgaWYgKCFlbmFibGVkKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdyZXNvbHZlLWJ0Yy1pbXBvcnRzJyxcbiAgICAgIGFwcGx5OiAnYnVpbGQnLFxuICAgIH07XG4gIH1cblxuICBjb25zdCB7IHdpdGhQYWNrYWdlcywgd2l0aFJvb3QsIHdpdGhDb25maWdzIH0gPSBjcmVhdGVQYXRoSGVscGVycyhhcHBEaXIpO1xuXG4gIC8qKlxuICAgKiBcdTY4QzBcdTY3RTVcdTVCRkNcdTUxNjVcdTY2MkZcdTU0MjZcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTc2ODRcdTUzMDVcdTYyMTYgc2hhcmVkLWNvbXBvbmVudHMgXHU2RTkwXHU3ODAxXG4gICAqL1xuICBmdW5jdGlvbiBpc0Zyb21CdWlsdFBhY2thZ2VPclNoYXJlZENvbXBvbmVudHMoaW1wb3J0ZXI/OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoIWltcG9ydGVyKSByZXR1cm4gZmFsc2U7XG4gICAgXG4gICAgLy8gXHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU3Njg0XHU1MzA1XHVGRjA4XHU1OTgyIHNoYXJlZC1jb3JlL2Rpc3QvaW5kZXgubWpzXHVGRjA5XG4gICAgY29uc3QgaXNGcm9tQnVpbHRQYWNrYWdlID0gKFxuICAgICAgaW1wb3J0ZXIuaW5jbHVkZXMoJy9kaXN0LycpIHx8XG4gICAgICBpbXBvcnRlci5pbmNsdWRlcygnXFxcXGRpc3RcXFxcJykgfHxcbiAgICAgIChpbXBvcnRlci5lbmRzV2l0aCgnLm1qcycpICYmICFpbXBvcnRlci5pbmNsdWRlcygnL3NyYy8nKSkgfHxcbiAgICAgIChpbXBvcnRlci5lbmRzV2l0aCgnLmpzJykgJiYgIWltcG9ydGVyLmluY2x1ZGVzKCcvc3JjLycpICYmICFpbXBvcnRlci5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpXG4gICAgKTtcbiAgICBcbiAgICAvLyBcdTY3NjVcdTgxRUEgc2hhcmVkLWNvbXBvbmVudHMgXHU2RTkwXHU3ODAxXHVGRjA4XHU5NzAwXHU4OTgxXHU4OUUzXHU2NzkwXHU1MTg1XHU5MEU4XHU1MjJCXHU1NDBEXHVGRjA5XG4gICAgY29uc3QgaXNGcm9tU2hhcmVkQ29tcG9uZW50cyA9IGltcG9ydGVyLmluY2x1ZGVzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMnKTtcbiAgICBcbiAgICByZXR1cm4gaXNGcm9tQnVpbHRQYWNrYWdlIHx8IGlzRnJvbVNoYXJlZENvbXBvbmVudHM7XG4gIH1cblxuICAvKipcbiAgICogXHU3ODZFXHU0RkREXHU4REVGXHU1Rjg0XHU2NzA5XHU2QjYzXHU3ODZFXHU3Njg0XHU2MjY5XHU1QzU1XHU1NDBEXG4gICAqIFx1NTk4Mlx1Njc5Q1x1OERFRlx1NUY4NFx1NkNBMVx1NjcwOVx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwQ1x1NUMxRFx1OEJENVx1NkRGQlx1NTJBMFx1NUUzOFx1ODlDMVx1NzY4NFx1NjI2OVx1NUM1NVx1NTQwRFxuICAgKi9cbiAgZnVuY3Rpb24gZW5zdXJlRmlsZUV4dGVuc2lvbihmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBcdTU5ODJcdTY3OUNcdThERUZcdTVGODRcdTVERjJcdTdFQ0ZcdTY3MDlcdTYyNjlcdTVDNTVcdTU0MERcdUZGMENcdTc2RjRcdTYzQTVcdThGRDRcdTU2REVcbiAgICBpZiAoL1xcLih0c3x0c3h8anN8anN4fHZ1ZXxqc29ufGNzc3xzY3NzfHNhc3N8bGVzcykkL2kudGVzdChmaWxlUGF0aCkpIHtcbiAgICAgIHJldHVybiBmaWxlUGF0aDtcbiAgICB9XG4gICAgXG4gICAgLy8gXHU2MzA5XHU0RjE4XHU1MTQ4XHU3RUE3XHU1QzFEXHU4QkQ1XHU2REZCXHU1MkEwXHU2MjY5XHU1QzU1XHU1NDBEXHVGRjFBLnRzeCwgLnRzLCAuanN4LCAuanNcbiAgICBjb25zdCBleHRlbnNpb25zID0gWycudHN4JywgJy50cycsICcuanN4JywgJy5qcyddO1xuICAgIGZvciAoY29uc3QgZXh0IG9mIGV4dGVuc2lvbnMpIHtcbiAgICAgIGNvbnN0IHBhdGhXaXRoRXh0ID0gYCR7ZmlsZVBhdGh9JHtleHR9YDtcbiAgICAgIGlmIChleGlzdHNTeW5jKHBhdGhXaXRoRXh0KSkge1xuICAgICAgICByZXR1cm4gcGF0aFdpdGhFeHQ7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjI0MFx1NjcwOVx1NjI2OVx1NUM1NVx1NTQwRFx1OTBGRFx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1OEZENFx1NTZERVx1NTM5Rlx1OERFRlx1NUY4NFx1RkYwQ1x1OEJBOSBWaXRlIFx1NzY4NFx1NjI2OVx1NUM1NVx1NTQwRFx1ODlFM1x1Njc5MFx1NjczQVx1NTIzNlx1NTkwNFx1NzQwNlxuICAgIHJldHVybiBmaWxlUGF0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTAgc2hhcmVkLWNvbXBvbmVudHMgXHU1MTg1XHU5MEU4XHU1MjJCXHU1NDBEXG4gICAqL1xuICBmdW5jdGlvbiByZXNvbHZlU2hhcmVkQ29tcG9uZW50c0FsaWFzKGlkOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCB7IHdpdGhQYWNrYWdlcyB9ID0gY3JlYXRlUGF0aEhlbHBlcnMoYXBwRGlyKTtcbiAgICBcbiAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy1jb21wb25lbnRzXG4gICAgaWYgKGlkID09PSAnQGJ0Yy1jb21wb25lbnRzJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjLWNvbXBvbmVudHMvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAYnRjLWNvbXBvbmVudHMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jb21wb25lbnRzLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IEBidGMtY29tbW9uXG4gICAgaWYgKGlkID09PSAnQGJ0Yy1jb21tb24nIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMtY29tbW9uLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGJ0Yy1jb21tb24vJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jb21tb24vJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBcbiAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy1jcnVkXG4gICAgaWYgKGlkID09PSAnQGJ0Yy1jcnVkJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjLWNydWQvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAYnRjLWNydWQvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jcnVkLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IEBidGMtc3R5bGVzXG4gICAgaWYgKGlkID09PSAnQGJ0Yy1zdHlsZXMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMtc3R5bGVzLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGJ0Yy1zdHlsZXMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9zdHlsZXMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBcbiAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy1sb2NhbGVzXG4gICAgaWYgKGlkID09PSAnQGJ0Yy1sb2NhbGVzJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjLWxvY2FsZXMvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAYnRjLWxvY2FsZXMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9sb2NhbGVzLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgXG4gICAgLy8gXHU1OTA0XHU3NDA2IEBidGMtYXNzZXRzIFx1NTQ4QyBAYXNzZXRzXG4gICAgaWYgKGlkID09PSAnQGJ0Yy1hc3NldHMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMtYXNzZXRzLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGJ0Yy1hc3NldHMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9hc3NldHMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBpZiAoaWQgPT09ICdAYXNzZXRzJyB8fCBpZC5zdGFydHNXaXRoKCdAYXNzZXRzLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGFzc2V0cy8nLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2Fzc2V0cy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjLXV0aWxzXG4gICAgaWYgKGlkID09PSAnQGJ0Yy11dGlscycgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy11dGlscy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BidGMtdXRpbHMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy91dGlscy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTkwNFx1NzQwNiBAcGx1Z2luc1xuICAgIGlmIChpZCA9PT0gJ0BwbHVnaW5zJyB8fCBpZC5zdGFydHNXaXRoKCdAcGx1Z2lucy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BwbHVnaW5zLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvcGx1Z2lucy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFx1NTkwNFx1NzQwNlx1NTZGRVx1ODg2OFx1NzZGOFx1NTE3M1x1NTIyQlx1NTQwRFx1RkYwOFx1NjMwOVx1NEVDRVx1NTE3N1x1NEY1M1x1NTIzMFx1NEUwMFx1ODIyQ1x1NzY4NFx1OTg3QVx1NUU4Rlx1RkYwOVxuICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTE3N1x1NEY1M1x1NzY4NFx1OERFRlx1NUY4NFx1NTIyQlx1NTQwRFx1NUZDNVx1OTg3Qlx1NTcyOFx1OTAxQVx1NzUyOFx1NTIyQlx1NTQwRFx1NEU0Qlx1NTI0RFx1NjhDMFx1NjdFNVxuICAgIGlmIChpZCA9PT0gJ0BjaGFydHMtdXRpbHMvY3NzLXZhcicgfHwgaWQuc3RhcnRzV2l0aCgnQGNoYXJ0cy11dGlscy9jc3MtdmFyLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGNoYXJ0cy11dGlscy9jc3MtdmFyJywgJycpLnJlcGxhY2UoL15cXC8vLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9jc3MtdmFyJHtzdWJQYXRoID8gJy8nICsgc3ViUGF0aCA6ICcnfWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBpZiAoaWQgPT09ICdAY2hhcnRzLXV0aWxzL2NvbG9yJyB8fCBpZC5zdGFydHNXaXRoKCdAY2hhcnRzLXV0aWxzL2NvbG9yLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGNoYXJ0cy11dGlscy9jb2xvcicsICcnKS5yZXBsYWNlKC9eXFwvLywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvY29sb3Ike3N1YlBhdGggPyAnLycgKyBzdWJQYXRoIDogJyd9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gJ0BjaGFydHMtdXRpbHMvZ3JhZGllbnQnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BjaGFydHMtdXRpbHMvZ3JhZGllbnQvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAY2hhcnRzLXV0aWxzL2dyYWRpZW50JywgJycpLnJlcGxhY2UoL15cXC8vLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy91dGlscy9ncmFkaWVudCR7c3ViUGF0aCA/ICcvJyArIHN1YlBhdGggOiAnJ31gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgaWYgKGlkID09PSAnQGNoYXJ0cy1jb21wb3NhYmxlcy91c2VDaGFydENvbXBvbmVudCcgfHwgaWQuc3RhcnRzV2l0aCgnQGNoYXJ0cy1jb21wb3NhYmxlcy91c2VDaGFydENvbXBvbmVudC8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BjaGFydHMtY29tcG9zYWJsZXMvdXNlQ2hhcnRDb21wb25lbnQnLCAnJykucmVwbGFjZSgvXlxcLy8sICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL2NvbXBvc2FibGVzL3VzZUNoYXJ0Q29tcG9uZW50JHtzdWJQYXRoID8gJy8nICsgc3ViUGF0aCA6ICcnfWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBpZiAoaWQgPT09ICdAY2hhcnRzLXR5cGVzJyB8fCBpZC5zdGFydHNXaXRoKCdAY2hhcnRzLXR5cGVzLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGNoYXJ0cy10eXBlcy8nLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy90eXBlcy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gJ0BjaGFydHMtdXRpbHMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BjaGFydHMtdXRpbHMvJykpIHtcbiAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAY2hhcnRzLXV0aWxzLycsICcnKTtcbiAgICAgIGNvbnN0IGJhc2VQYXRoID0gd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzLyR7c3ViUGF0aH1gKTtcbiAgICAgIHJldHVybiBlbnN1cmVGaWxlRXh0ZW5zaW9uKGJhc2VQYXRoKTtcbiAgICB9XG4gICAgaWYgKGlkID09PSAnQGNoYXJ0cy1jb21wb3NhYmxlcycgfHwgaWQuc3RhcnRzV2l0aCgnQGNoYXJ0cy1jb21wb3NhYmxlcy8nKSkge1xuICAgICAgY29uc3Qgc3ViUGF0aCA9IGlkLnJlcGxhY2UoJ0BjaGFydHMtY29tcG9zYWJsZXMvJywgJycpO1xuICAgICAgY29uc3QgYmFzZVBhdGggPSB3aXRoUGFja2FnZXMoYHNoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvY29tcG9zYWJsZXMvJHtzdWJQYXRofWApO1xuICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oYmFzZVBhdGgpO1xuICAgIH1cbiAgICBpZiAoaWQgPT09ICdAY2hhcnRzJyB8fCBpZC5zdGFydHNXaXRoKCdAY2hhcnRzLycpKSB7XG4gICAgICBjb25zdCBzdWJQYXRoID0gaWQucmVwbGFjZSgnQGNoYXJ0cy8nLCAnJyk7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy8ke3N1YlBhdGh9YCk7XG4gICAgICByZXR1cm4gZW5zdXJlRmlsZUV4dGVuc2lvbihiYXNlUGF0aCk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAncmVzb2x2ZS1idGMtaW1wb3J0cycsXG4gICAgYXBwbHk6ICdidWlsZCcsXG4gICAgYnVpbGRTdGFydCgpIHtcbiAgICAgIGNvbnNvbGUuaW5mbygnW3Jlc29sdmUtYnRjLWltcG9ydHNdIFx1NURGMlx1NTQyRlx1NzUyOFx1RkYwQ1x1NUMwNlx1ODlFM1x1Njc5MFx1NEVDRVx1NURGMlx1Njc4NFx1NUVGQVx1NTMwNVx1NEUyRFx1NUJGQ1x1NTE2NVx1NzY4NCBAYnRjLyogXHU2QTIxXHU1NzU3XHU1NDhDIHNoYXJlZC1jb21wb25lbnRzIFx1NTE4NVx1OTBFOFx1NTIyQlx1NTQwRCcpO1xuICAgIH0sXG4gICAgcmVzb2x2ZUlkKGlkOiBzdHJpbmcsIGltcG9ydGVyPzogc3RyaW5nKSB7XG4gICAgICAvLyBcdTY4QzBcdTY3RTVcdTVCRkNcdTUxNjVcdTY2MkZcdTU0MjZcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTc2ODRcdTUzMDVcdTYyMTYgc2hhcmVkLWNvbXBvbmVudHMgXHU2RTkwXHU3ODAxXG4gICAgICBjb25zdCBzaG91bGRSZXNvbHZlID0gaXNGcm9tQnVpbHRQYWNrYWdlT3JTaGFyZWRDb21wb25lbnRzKGltcG9ydGVyKTtcbiAgICAgIFxuICAgICAgaWYgKCFzaG91bGRSZXNvbHZlKSB7XG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NUJGQ1x1NTE2NVx1NEUwRFx1NjYyRlx1Njc2NVx1ODFFQVx1NURGMlx1Njc4NFx1NUVGQVx1NzY4NFx1NTMwNVx1NjIxNiBzaGFyZWQtY29tcG9uZW50cyBcdTZFOTBcdTc4MDFcdUZGMENcdThCQTlcdTUxNzZcdTRFRDZcdTYzRDJcdTRFRjZcdUZGMDhcdTU5ODJcdTUyMkJcdTU0MERcdTkxNERcdTdGNkVcdUZGMDlcdTU5MDRcdTc0MDZcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1OTk5Nlx1NTE0OFx1NTkwNFx1NzQwNiBzaGFyZWQtY29tcG9uZW50cyBcdTUxODVcdTkwRThcdTUyMkJcdTU0MERcdUZGMDhcdThGRDlcdTRFOUJcdTUyMkJcdTU0MERcdTUzRUZcdTgwRkRcdTU3MjhcdTRFRkJcdTRGNTVcdTU3MzBcdTY1QjlcdTRGN0ZcdTc1MjhcdUZGMDlcbiAgICAgIGNvbnN0IHNoYXJlZENvbXBvbmVudHNBbGlhcyA9IHJlc29sdmVTaGFyZWRDb21wb25lbnRzQWxpYXMoaWQpO1xuICAgICAgaWYgKHNoYXJlZENvbXBvbmVudHNBbGlhcykge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtyZXNvbHZlLWJ0Yy1pbXBvcnRzXSBcdTg5RTNcdTY3OTAgc2hhcmVkLWNvbXBvbmVudHMgXHU1MTg1XHU5MEU4XHU1MjJCXHU1NDBEICR7aWR9IChcdTY3NjVcdTgxRUEgJHtpbXBvcnRlcj8uc3BsaXQoJy8nKS5zbGljZSgtMikuam9pbignLycpIHx8ICd1bmtub3duJ30pIC0+ICR7c2hhcmVkQ29tcG9uZW50c0FsaWFzLnNwbGl0KCcvJykuc2xpY2UoLTMpLmpvaW4oJy8nKX1gKTtcbiAgICAgICAgcmV0dXJuIHNoYXJlZENvbXBvbmVudHNBbGlhcztcbiAgICAgIH1cblxuICAgICAgLy8gXHU1OTA0XHU3NDA2IEBjb25maWdzIFx1NTMwNVx1NzY4NFx1NUJGQ1x1NTE2NVx1RkYwOFx1NEVDRVx1NURGMlx1Njc4NFx1NUVGQVx1NTMwNVx1NEUyRFx1NUJGQ1x1NTE2NVx1NjVGNlx1RkYwQ1x1NzNCMFx1NTcyOFx1NjMwN1x1NTQxMSBzaGFyZWQtY29yZS9zcmMvY29uZmlnc1x1RkYwOVxuICAgICAgaWYgKGlkLnN0YXJ0c1dpdGgoJ0Bjb25maWdzLycpKSB7XG4gICAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAY29uZmlncy8nLCAnJyk7XG4gICAgICAgIGNvbnN0IHNvdXJjZVBhdGggPSB3aXRoQ29uZmlncyhzdWJQYXRoKTtcbiAgICAgICAgY29uc3QgZmluYWxQYXRoID0gZW5zdXJlRmlsZUV4dGVuc2lvbihzb3VyY2VQYXRoKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW3Jlc29sdmUtYnRjLWltcG9ydHNdIFx1ODlFM1x1Njc5MCBAY29uZmlncyBcdTUzMDUgJHtpZH0gKFx1Njc2NVx1ODFFQVx1NURGMlx1Njc4NFx1NUVGQVx1NTMwNSAke2ltcG9ydGVyPy5zcGxpdCgnLycpLnNsaWNlKC0yKS5qb2luKCcvJykgfHwgJ3Vua25vd24nfSkgLT4gJHtmaW5hbFBhdGguc3BsaXQoJy8nKS5zbGljZSgtMykuam9pbignLycpfWApO1xuICAgICAgICByZXR1cm4gZmluYWxQYXRoO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy8qIFx1NTMwNVx1NzY4NFx1NUJGQ1x1NTE2NVxuICAgICAgaWYgKCFpZC5zdGFydHNXaXRoKCdAYnRjLycpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTU5MDRcdTc0MDYgQGJ0Yy9zaGFyZWQtY29tcG9uZW50c1xuICAgICAgaWYgKGlkID09PSAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cycgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cy8nKSkge1xuICAgICAgICBjb25zdCBzb3VyY2VQYXRoID0gaWQgPT09ICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJ1xuICAgICAgICAgID8gd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvaW5kZXgudHMnKVxuICAgICAgICAgIDogd2l0aFBhY2thZ2VzKGBzaGFyZWQtY29tcG9uZW50cy9zcmMvJHtpZC5yZXBsYWNlKCdAYnRjL3NoYXJlZC1jb21wb25lbnRzLycsICcnKX1gKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW3Jlc29sdmUtYnRjLWltcG9ydHNdIFx1ODlFM1x1Njc5MCAke2lkfSAoXHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU1MzA1ICR7aW1wb3J0ZXI/LnNwbGl0KCcvJykuc2xpY2UoLTIpLmpvaW4oJy8nKSB8fCAndW5rbm93bid9KSAtPiAke3NvdXJjZVBhdGguc3BsaXQoJy8nKS5zbGljZSgtMykuam9pbignLycpfWApO1xuICAgICAgICByZXR1cm4gc291cmNlUGF0aDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1OTA0XHU3NDA2IEBidGMvc2hhcmVkLWNvcmVcbiAgICAgIGlmIChpZCA9PT0gJ0BidGMvc2hhcmVkLWNvcmUnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMvc2hhcmVkLWNvcmUvJykpIHtcbiAgICAgICAgY29uc3Qgc291cmNlUGF0aCA9IGlkID09PSAnQGJ0Yy9zaGFyZWQtY29yZSdcbiAgICAgICAgICA/IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvcmUvc3JjL2luZGV4LnRzJylcbiAgICAgICAgICA6IHdpdGhQYWNrYWdlcyhgc2hhcmVkLWNvcmUvc3JjLyR7aWQucmVwbGFjZSgnQGJ0Yy9zaGFyZWQtY29yZS8nLCAnJyl9YCk7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmluZm8oYFtyZXNvbHZlLWJ0Yy1pbXBvcnRzXSBcdTg5RTNcdTY3OTAgJHtpZH0gKFx1Njc2NVx1ODFFQVx1NURGMlx1Njc4NFx1NUVGQVx1NTMwNSAke2ltcG9ydGVyPy5zcGxpdCgnLycpLnNsaWNlKC0yKS5qb2luKCcvJykgfHwgJ3Vua25vd24nfSkgLT4gJHtzb3VyY2VQYXRoLnNwbGl0KCcvJykuc2xpY2UoLTMpLmpvaW4oJy8nKX1gKTtcbiAgICAgICAgcmV0dXJuIHNvdXJjZVBhdGg7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjL3NoYXJlZC11dGlsc1xuICAgICAgaWYgKGlkID09PSAnQGJ0Yy9zaGFyZWQtdXRpbHMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMvc2hhcmVkLXV0aWxzLycpKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZVBhdGggPSBpZCA9PT0gJ0BidGMvc2hhcmVkLXV0aWxzJ1xuICAgICAgICAgID8gd2l0aFBhY2thZ2VzKCdzaGFyZWQtdXRpbHMvc3JjL2luZGV4LnRzJylcbiAgICAgICAgICA6IHdpdGhQYWNrYWdlcyhgc2hhcmVkLXV0aWxzL3NyYy8ke2lkLnJlcGxhY2UoJ0BidGMvc2hhcmVkLXV0aWxzLycsICcnKX1gKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW3Jlc29sdmUtYnRjLWltcG9ydHNdIFx1ODlFM1x1Njc5MCAke2lkfSAoXHU2NzY1XHU4MUVBXHU1REYyXHU2Nzg0XHU1RUZBXHU1MzA1ICR7aW1wb3J0ZXI/LnNwbGl0KCcvJykuc2xpY2UoLTIpLmpvaW4oJy8nKSB8fCAndW5rbm93bid9KSAtPiAke3NvdXJjZVBhdGguc3BsaXQoJy8nKS5zbGljZSgtMykuam9pbignLycpfWApO1xuICAgICAgICByZXR1cm4gc291cmNlUGF0aDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1OTA0XHU3NDA2IEBidGMvc2hhcmVkLXBsdWdpbnNcbiAgICAgIGlmIChpZCA9PT0gJ0BidGMvc2hhcmVkLXBsdWdpbnMnIHx8IGlkLnN0YXJ0c1dpdGgoJ0BidGMvc2hhcmVkLXBsdWdpbnMvJykpIHtcbiAgICAgICAgY29uc3Qgc291cmNlUGF0aCA9IGlkID09PSAnQGJ0Yy9zaGFyZWQtcGx1Z2lucydcbiAgICAgICAgICA/IHdpdGhQYWNrYWdlcygnc2hhcmVkLXBsdWdpbnMvc3JjL2luZGV4LnRzJylcbiAgICAgICAgICA6IHdpdGhQYWNrYWdlcyhgc2hhcmVkLXBsdWdpbnMvc3JjLyR7aWQucmVwbGFjZSgnQGJ0Yy9zaGFyZWQtcGx1Z2lucy8nLCAnJyl9YCk7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmluZm8oYFtyZXNvbHZlLWJ0Yy1pbXBvcnRzXSBcdTg5RTNcdTY3OTAgJHtpZH0gKFx1Njc2NVx1ODFFQVx1NURGMlx1Njc4NFx1NUVGQVx1NTMwNSAke2ltcG9ydGVyPy5zcGxpdCgnLycpLnNsaWNlKC0yKS5qb2luKCcvJykgfHwgJ3Vua25vd24nfSkgLT4gJHtzb3VyY2VQYXRoLnNwbGl0KCcvJykuc2xpY2UoLTMpLmpvaW4oJy8nKX1gKTtcbiAgICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oc291cmNlUGF0aCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjL2kxOG5cbiAgICAgIGlmIChpZCA9PT0gJ0BidGMvaTE4bicgfHwgaWQuc3RhcnRzV2l0aCgnQGJ0Yy9pMThuLycpKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZVBhdGggPSBpZCA9PT0gJ0BidGMvaTE4bidcbiAgICAgICAgICA/IHdpdGhQYWNrYWdlcygnaTE4bi9zcmMvaW5kZXgudHMnKVxuICAgICAgICAgIDogd2l0aFBhY2thZ2VzKGBpMThuL3NyYy8ke2lkLnJlcGxhY2UoJ0BidGMvaTE4bi8nLCAnJyl9YCk7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmluZm8oYFtyZXNvbHZlLWJ0Yy1pbXBvcnRzXSBcdTg5RTNcdTY3OTAgJHtpZH0gKFx1Njc2NVx1ODFFQVx1NURGMlx1Njc4NFx1NUVGQVx1NTMwNSAke2ltcG9ydGVyPy5zcGxpdCgnLycpLnNsaWNlKC0yKS5qb2luKCcvJykgfHwgJ3Vua25vd24nfSkgLT4gJHtzb3VyY2VQYXRoLnNwbGl0KCcvJykuc2xpY2UoLTMpLmpvaW4oJy8nKX1gKTtcbiAgICAgICAgcmV0dXJuIGVuc3VyZUZpbGVFeHRlbnNpb24oc291cmNlUGF0aCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTkwNFx1NzQwNiBAYnRjL2F1dGgtc2hhcmVkXG4gICAgICBpZiAoaWQgPT09ICdAYnRjL2F1dGgtc2hhcmVkJyB8fCBpZC5zdGFydHNXaXRoKCdAYnRjL2F1dGgtc2hhcmVkLycpKSB7XG4gICAgICAgIGxldCBzb3VyY2VQYXRoOiBzdHJpbmc7XG4gICAgICAgIGlmIChpZCA9PT0gJ0BidGMvYXV0aC1zaGFyZWQnKSB7XG4gICAgICAgICAgLy8gQGJ0Yy9hdXRoLXNoYXJlZCBcdTZDQTFcdTY3MDlcdTY4MzkgaW5kZXgudHNcdUZGMENcdTRGN0ZcdTc1MjggY29tcG9zYWJsZXMvaW5kZXgudHMgXHU0RjVDXHU0RTNBXHU1MTY1XHU1M0UzXG4gICAgICAgICAgc291cmNlUGF0aCA9IHdpdGhSb290KCdhdXRoL3NoYXJlZC9jb21wb3NhYmxlcy9pbmRleC50cycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHN1YlBhdGggPSBpZC5yZXBsYWNlKCdAYnRjL2F1dGgtc2hhcmVkLycsICcnKTtcbiAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdThERUZcdTVGODRcdTZDQTFcdTY3MDlcdTYyNjlcdTVDNTVcdTU0MERcdUZGMENcdTZERkJcdTUyQTAgLnRzIFx1NjI2OVx1NUM1NVx1NTQwRFxuICAgICAgICAgIHNvdXJjZVBhdGggPSB3aXRoUm9vdChgYXV0aC9zaGFyZWQvJHtzdWJQYXRofSR7c3ViUGF0aC5pbmNsdWRlcygnLicpID8gJycgOiAnLnRzJ31gKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5pbmZvKGBbcmVzb2x2ZS1idGMtaW1wb3J0c10gXHU4OUUzXHU2NzkwICR7aWR9IChcdTY3NjVcdTgxRUFcdTVERjJcdTY3ODRcdTVFRkFcdTUzMDUgJHtpbXBvcnRlcj8uc3BsaXQoJy8nKS5zbGljZSgtMikuam9pbignLycpIHx8ICd1bmtub3duJ30pIC0+ICR7c291cmNlUGF0aC5zcGxpdCgnLycpLnNsaWNlKC0zKS5qb2luKCcvJyl9YCk7XG4gICAgICAgIHJldHVybiBzb3VyY2VQYXRoO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTUxNzZcdTRFRDYgQGJ0Yy8qIFx1NTMwNVx1RkYwQ1x1OEZENFx1NTZERSBudWxsIFx1OEJBOVx1NTE3Nlx1NEVENlx1NjNEMlx1NEVGNlx1NTkwNFx1NzQwNlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxhcHBzXFxcXGFkbWluLWFwcFxcXFxzcmNcXFxcY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcYWRtaW4tYXBwXFxcXHNyY1xcXFxjb25maWdcXFxccHJveHkudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vYXBwcy9hZG1pbi1hcHAvc3JjL2NvbmZpZy9wcm94eS50c1wiOztcbmltcG9ydCB0eXBlIHsgSW5jb21pbmdNZXNzYWdlLCBTZXJ2ZXJSZXNwb25zZSB9IGZyb20gJ2h0dHAnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnQGJ0Yy9zaGFyZWQtY29yZSc7XG5cbi8vIFZpdGUgXHU0RUUzXHU3NDA2XHU5MTREXHU3RjZFXHU3QzdCXHU1NzhCXG5pbnRlcmZhY2UgUHJveHlPcHRpb25zIHtcbiAgdGFyZ2V0OiBzdHJpbmc7XG4gIGNoYW5nZU9yaWdpbj86IGJvb2xlYW47XG4gIHNlY3VyZT86IGJvb2xlYW47XG4gIGNvbmZpZ3VyZT86IChwcm94eTogYW55LCBvcHRpb25zOiBhbnkpID0+IHZvaWQ7XG59XG5cbmNvbnN0IHByb3h5OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBQcm94eU9wdGlvbnM+ID0ge1xuICAnL2FwaSc6IHtcbiAgICB0YXJnZXQ6ICdodHRwOi8vMTAuODAuOS43Njo4MTE1JyxcbiAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgc2VjdXJlOiBmYWxzZSxcbiAgICAvLyBcdTRFMERcdTUxOERcdTY2RkZcdTYzNjJcdThERUZcdTVGODRcdUZGMENcdTc2RjRcdTYzQTVcdThGNkNcdTUzRDEgL2FwaSBcdTUyMzBcdTU0MEVcdTdBRUZcdUZGMDhcdTU0MEVcdTdBRUZcdTVERjJcdTY1MzlcdTRFM0FcdTRGN0ZcdTc1MjggL2FwaVx1RkYwOVxuICAgIC8vIHJld3JpdGU6IChwYXRoOiBzdHJpbmcpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS8sICcvYWRtaW4nKSAvLyBcdTVERjJcdTc5RkJcdTk2NjRcdUZGMUFcdTU0MEVcdTdBRUZcdTVERjJcdTY1MzlcdTRFM0FcdTRGN0ZcdTc1MjggL2FwaVxuICAgIC8vIFx1NTkwNFx1NzQwNlx1NTRDRFx1NUU5NFx1NTkzNFx1RkYwQ1x1NkRGQlx1NTJBMCBDT1JTIFx1NTkzNFxuICAgIGNvbmZpZ3VyZTogKHByb3h5OiBhbnksIG9wdGlvbnM6IGFueSkgPT4ge1xuICAgICAgLy8gXHU1OTA0XHU3NDA2XHU0RUUzXHU3NDA2XHU1NENEXHU1RTk0XG4gICAgICBwcm94eS5vbigncHJveHlSZXMnLCAocHJveHlSZXM6IEluY29taW5nTWVzc2FnZSwgcmVxOiBJbmNvbWluZ01lc3NhZ2UsIHJlczogU2VydmVyUmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc3Qgb3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luIHx8ICcqJztcbiAgICAgICAgaWYgKHByb3h5UmVzLmhlYWRlcnMpIHtcbiAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nXSA9IG9yaWdpbiBhcyBzdHJpbmc7XG4gICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnXSA9ICd0cnVlJztcbiAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJ10gPSAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnO1xuICAgICAgICAgIGNvbnN0IHJlcXVlc3RIZWFkZXJzID0gcmVxLmhlYWRlcnNbJ2FjY2Vzcy1jb250cm9sLXJlcXVlc3QtaGVhZGVycyddIHx8ICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCc7XG4gICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyddID0gcmVxdWVzdEhlYWRlcnMgYXMgc3RyaW5nO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRCBTZXQtQ29va2llIFx1NTRDRFx1NUU5NFx1NTkzNFx1RkYwQ1x1Nzg2RVx1NEZERFx1OERFOFx1NTdERlx1OEJGN1x1NkM0Mlx1NjVGNiBjb29raWUgXHU4MEZEXHU1OTFGXHU2QjYzXHU3ODZFXHU4QkJFXHU3RjZFXG4gICAgICAgICAgLy8gXHU1NzI4XHU5ODg0XHU4OUM4XHU2QTIxXHU1RjBGXHU0RTBCXHVGRjA4XHU0RTBEXHU1NDBDXHU3QUVGXHU1M0UzXHVGRjA5XHVGRjBDXHU5NzAwXHU4OTgxXHU4QkJFXHU3RjZFIFNhbWVTaXRlPU5vbmU7IFNlY3VyZVxuICAgICAgICAgIGNvbnN0IHNldENvb2tpZUhlYWRlciA9IHByb3h5UmVzLmhlYWRlcnNbJ3NldC1jb29raWUnXTtcbiAgICAgICAgICBpZiAoc2V0Q29va2llSGVhZGVyKSB7XG4gICAgICAgICAgICBjb25zdCBjb29raWVzID0gQXJyYXkuaXNBcnJheShzZXRDb29raWVIZWFkZXIpID8gc2V0Q29va2llSGVhZGVyIDogW3NldENvb2tpZUhlYWRlcl07XG4gICAgICAgICAgICBjb25zdCBmaXhlZENvb2tpZXMgPSBjb29raWVzLm1hcCgoY29va2llOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgLy8gXHU1OTgyXHU2NzlDIGNvb2tpZSBcdTRFMERcdTUzMDVcdTU0MkIgU2FtZVNpdGVcdUZGMENcdTYyMTZcdTgwMDUgU2FtZVNpdGUgXHU0RTBEXHU2NjJGIE5vbmVcdUZGMENcdTk3MDBcdTg5ODFcdTRGRUVcdTU5MERcbiAgICAgICAgICAgICAgaWYgKCFjb29raWUuaW5jbHVkZXMoJ1NhbWVTaXRlPU5vbmUnKSkge1xuICAgICAgICAgICAgICAgIC8vIFx1NzlGQlx1OTY2NFx1NzNCMFx1NjcwOVx1NzY4NCBTYW1lU2l0ZSBcdThCQkVcdTdGNkVcdUZGMDhcdTU5ODJcdTY3OUNcdTY3MDlcdUZGMDlcbiAgICAgICAgICAgICAgICBsZXQgZml4ZWRDb29raWUgPSBjb29raWUucmVwbGFjZSgvO1xccypTYW1lU2l0ZT0oU3RyaWN0fExheHxOb25lKS9naSwgJycpO1xuICAgICAgICAgICAgICAgIC8vIFx1NkRGQlx1NTJBMCBTYW1lU2l0ZT1Ob25lOyBTZWN1cmVcdUZGMDhcdTVCRjlcdTRFOEVcdThERThcdTU3REZcdThCRjdcdTZDNDJcdUZGMDlcbiAgICAgICAgICAgICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFTZWN1cmUgXHU5NzAwXHU4OTgxIEhUVFBTXHVGRjBDXHU0RjQ2XHU1NzI4XHU1RjAwXHU1M0QxL1x1OTg4NFx1ODlDOFx1NzNBRlx1NTg4M1x1NEUyRFx1RkYwQ1x1NjIxMVx1NEVFQ1x1NEVDRFx1NzEzNlx1NkRGQlx1NTJBMFx1NUI4M1xuICAgICAgICAgICAgICAgIC8vIFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NEYxQVx1NUZGRFx1NzU2NSBTZWN1cmVcdUZGMDhcdTU5ODJcdTY3OUNcdTUzNEZcdThCQUVcdTY2MkYgSFRUUFx1RkYwOVxuICAgICAgICAgICAgICAgIGZpeGVkQ29va2llICs9ICc7IFNhbWVTaXRlPU5vbmU7IFNlY3VyZSc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpeGVkQ29va2llO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBjb29raWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ3NldC1jb29raWUnXSA9IGZpeGVkQ29va2llcztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gXHU4QkIwXHU1RjU1XHU1NDBFXHU3QUVGXHU1NENEXHU1RTk0XHU3MkI2XHU2MDAxXG4gICAgICAgIGlmIChwcm94eVJlcy5zdGF0dXNDb2RlICYmIHByb3h5UmVzLnN0YXR1c0NvZGUgPj0gNTAwKSB7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKGBbUHJveHldIEJhY2tlbmQgcmV0dXJuZWQgJHtwcm94eVJlcy5zdGF0dXNDb2RlfSBmb3IgJHtyZXEubWV0aG9kfSAke3JlcS51cmx9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBcdTU5MDRcdTc0MDZcdTRFRTNcdTc0MDZcdTk1MTlcdThCRUZcbiAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnI6IEVycm9yLCByZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSkgPT4ge1xuICAgICAgICBsb2dnZXIuZXJyb3IoJ1tQcm94eV0gRXJyb3I6JywgZXJyLm1lc3NhZ2UpO1xuICAgICAgICBsb2dnZXIuZXJyb3IoJ1tQcm94eV0gUmVxdWVzdCBVUkw6JywgcmVxLnVybCk7XG4gICAgICAgIGxvZ2dlci5lcnJvcignW1Byb3h5XSBUYXJnZXQ6JywgJ2h0dHA6Ly8xMC44MC45Ljc2OjgxMTUnKTtcbiAgICAgICAgaWYgKHJlcyAmJiAhcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDAsIHtcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogcmVxLmhlYWRlcnMub3JpZ2luIHx8ICcqJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdThGRDlcdTkxQ0NcdTU3MjhcdTRFRTNcdTc0MDZcdTkxNERcdTdGNkVcdTRFMkRcdUZGMENcdTY1RTBcdTZDRDVcdTRGN0ZcdTc1MjggaTE4blx1RkYwQ1x1NjI0MFx1NEVFNVx1NEZERFx1NzU1OVx1NTM5Rlx1NTlDQlx1OTUxOVx1OEJFRlx1NkQ4OFx1NjA2RlxuICAgICAgICAgIC8vIFx1NUI5RVx1OTY0NVx1OTUxOVx1OEJFRlx1NkQ4OFx1NjA2Rlx1NUU5NFx1OEJFNVx1NTcyOFx1NTQwRVx1N0FFRlx1NjIxNlx1NTI0RFx1N0FFRlx1OTUxOVx1OEJFRlx1NTkwNFx1NzQwNlx1NEUyRFx1NEY3Rlx1NzUyOCBpMThuXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICBjb2RlOiA1MDAsXG4gICAgICAgICAgICBtZXNzYWdlOiAnUHJveHkgZXJyb3I6IFVuYWJsZSB0byBjb25uZWN0IHRvIGJhY2tlbmQgc2VydmVyIGh0dHA6Ly8xMC44MC45Ljc2OjgxMTUnLFxuICAgICAgICAgICAgZXJyb3I6IGVyci5tZXNzYWdlLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIFx1NzZEMVx1NTQyQ1x1NEVFM1x1NzQwNlx1OEJGN1x1NkM0Mlx1RkYwOFx1NzUyOFx1NEU4RVx1OEMwM1x1OEJENVx1RkYwOVxuICAgICAgcHJveHkub24oJ3Byb3h5UmVxJywgKHByb3h5UmVxOiBhbnksIHJlcTogSW5jb21pbmdNZXNzYWdlLCByZXM6IFNlcnZlclJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW1Byb3h5XSAke3JlcS5tZXRob2R9ICR7cmVxLnVybH0gLT4gaHR0cDovLzEwLjgwLjkuNzY6ODExNSR7cmVxLnVybH1gKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gIH1cbn07XG5cbmV4cG9ydCB7IHByb3h5IH07XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBaLFNBQVMsb0JBQW9CO0FBQ3ZiLFNBQVMsaUJBQUFBLHNCQUFxQjs7O0FDSzlCLFNBQVMsV0FBQUMsV0FBUyxXQUFBQyxnQkFBZTtBQUNqQyxTQUFTLGlCQUFBQyxzQkFBcUI7QUFDOUIsU0FBUyxxQkFBcUI7QUFDOUIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sWUFBWTtBQUNuQixPQUFPLGFBQWE7QUFDcEIsT0FBTyxZQUFZO0FBQ25CLFNBQVMsY0FBQUMsYUFBWSxnQkFBQUMscUJBQW9COzs7QUNSekMsU0FBUyxlQUFlO0FBT2pCLFNBQVMsa0JBQWtCLFFBQWdCO0FBSWhELFFBQU0sVUFBVSxDQUFDLGlCQUF5QixRQUFRLFFBQVEsWUFBWTtBQUt0RSxRQUFNLGVBQWUsQ0FBQyxpQkFDcEIsUUFBUSxRQUFRLGtCQUFrQixZQUFZO0FBS2hELFFBQU0sV0FBVyxDQUFDLGlCQUNoQixRQUFRLFFBQVEsU0FB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LFVBQVU7QUFDWjtBQUtBLElBQU0sdUJBQXVDO0FBQUEsRUFDM0M7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxFQUNaO0FBQ0Y7QUFLQSxJQUFNLHNCQUFzQztBQUFBLEVBQzFDO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFD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VUFBVTtBQUFBLFlBQ3JCLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxZQUNULE9BQU8sSUFBSTtBQUFBLFVBQ2IsQ0FBQyxDQUFDO0FBQUEsUUFDSjtBQUFBLE1BQ0YsQ0FBQztBQUdELE1BQUFBLE9BQU0sR0FBRyxZQUFZLENBQUMsVUFBZSxLQUFzQixRQUF3QjtBQUNqRixnQkFBUSxLQUFLLFdBQVcsSUFBSSxNQUFNLElBQUksSUFBSSxHQUFHLDZCQUE2QixJQUFJLEdBQUcsRUFBRTtBQUFBLE1BQ3JGLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUNGOzs7QXZCcEZ1USxJQUFNQyw0Q0FBMkM7QUFLeFQsSUFBTyxzQkFBUTtBQUFBLEVBQ2IsdUJBQXVCO0FBQUEsSUFDckIsU0FBUztBQUFBLElBQ1QsUUFBUUMsZUFBYyxJQUFJLElBQUksS0FBS0QseUNBQWUsQ0FBQztBQUFBLElBQ25ELGFBQWE7QUFBQSxJQUNiLGNBQWMsRUFBRSxNQUFpQjtBQUFBLElBQ2pDO0FBQUEsRUFDRixDQUFDO0FBQ0g7IiwKICAibmFtZXMiOiBbImZpbGVVUkxUb1BhdGgiLCAicmVzb2x2ZSIsICJkaXJuYW1lIiwgImZpbGVVUkxUb1BhdGgiLCAiZXhpc3RzU3luYyIsICJyZWFkRmlsZVN5bmMiLCAicmVzb2x2ZSIsICJyZXNvbHZlIiwgInJlc29sdmUiLCAicmVzb2x2ZSIsICJyZXNvbHZlIiwgImV4aXN0c1N5bmMiLCAicmVzb2x2ZSIsICJleGlzdHNTeW5jIiwgImV4aXN0c1N5bmMiLCAiZXhpc3RzU3luYyIsICJmaWxlTmFtZSIsICJvcmlnaW4iLCAiZXhpc3RzU3luYyIsICJyZWFkRmlsZVN5bmMiLCAicmVzb2x2ZSIsICJkaXJuYW1lIiwgImZpbGVVUkxUb1BhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCIsICJfX2ZpbGVuYW1lIiwgImZpbGVVUkxUb1BhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCIsICJfX2Rpcm5hbWUiLCAiZGlybmFtZSIsICJyZXNvbHZlIiwgImV4aXN0c1N5bmMiLCAidGltZXN0YW1wIiwgInJlYWRGaWxlU3luYyIsICJyZXNvbHZlIiwgImRpcm5hbWUiLCAiZXhpc3RzU3luYyIsICJyZXNvbHZlIiwgImV4aXN0c1N5bmMiLCAiZGlybmFtZSIsICJyZXNvbHZlIiwgImZpbGVVUkxUb1BhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCIsICJfX2ZpbGVuYW1lIiwgImZpbGVVUkxUb1BhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCIsICJfX2Rpcm5hbWUiLCAicmVzb2x2ZSIsICJyZWFkRmlsZVN5bmMiLCAiZXhpc3RzU3luYyIsICJyZXNvbHZlIiwgInJlc29sdmUiLCAiZXhpc3RzU3luYyIsICJyZWFkRmlsZVN5bmMiLCAicmVzb2x2ZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19maWxlbmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19kaXJuYW1lIiwgInJlc29sdmUiLCAicHJvamVjdFJvb3QiLCAiaXNQcmV2aWV3QnVpbGQiLCAiZXhpc3RzU3luYyIsICJleGlzdHNTeW5jIiwgIndpdGhQYWNrYWdlcyIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgIl9fZmlsZW5hbWUiLCAiZmlsZVVSTFRvUGF0aCIsICJfX2Rpcm5hbWUiLCAiZGlybmFtZSIsICJyZXNvbHZlIiwgInJlcXVpcmUiLCAicHJveHkiLCAiZXhpc3RzU3luYyIsICJyZWFkRmlsZVN5bmMiLCAicHJveHkiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCIsICJmaWxlVVJMVG9QYXRoIl0KfQo=
