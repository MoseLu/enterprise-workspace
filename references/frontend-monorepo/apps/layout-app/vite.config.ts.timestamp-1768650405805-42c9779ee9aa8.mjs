// vite.config.ts
import { defineConfig } from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite@5.4.21_@types+node@24.10.1_sass@1.94.2/node_modules/vite/dist/node/index.js";
import { fileURLToPath as fileURLToPath5 } from "node:url";

// ../../configs/vite/factories/layout.config.ts
import { resolve as resolve9 } from "path";
import { existsSync as existsSync5, readFileSync as readFileSync2, rmSync as rmSync2, writeFileSync as writeFileSync3 } from "node:fs";
import vue from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue@5.0.0_vite@5.4.21_vue@3.5.26/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.2.0_vite@5.4.21_vue@3.5.26/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import qiankun from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/vite-plugin-qiankun@1.0.15_typescript@5.9.3_vite@5.4.21/node_modules/vite-plugin-qiankun/dist/index.js";
import UnoCSS from "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/node_modules/.pnpm/unocss@66.5.9_postcss@8.5.6_vite@5.4.21/node_modules/unocss/dist/vite.mjs";

// ../../configs/vite/utils/path-helpers.ts
import { resolve } from "path";
function createPathHelpers(appDir) {
  const withSrc = (relativePath) => resolve(appDir, relativePath);
  const withPackages = (relativePath) => resolve(appDir, "../../packages", relativePath);
  const withRoot = (relativePath) => resolve(appDir, "../..", relativePath);
  const withConfigs = (relativePath) => resolve(appDir, "../../configs", relativePath);
  return { withSrc, withPackages, withRoot, withConfigs };
}

// ../../configs/vite/factories/layout.config.ts
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

// ../../configs/vite/factories/layout.config.ts
import { btc } from "@btc/vite-plugin";

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
function getPublicDir(appName, appDir) {
  if (appName === "main-app" || appName === "admin-app" || appName === "mobile-app" || appName === "system-app") {
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

// ../../configs/vite/plugins/url.ts
import { resolve as resolvePath, dirname } from "node:path";
import { fileURLToPath } from "node:url";
var __vite_injected_original_import_meta_url = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/plugins/url.ts";
var __filename = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname = dirname(__filename);

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

// ../../configs/vite/plugins/version.ts
import { existsSync as existsSync3, readFileSync, writeFileSync } from "node:fs";
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
  if (existsSync3(timestampFile)) {
    try {
      const timestamp2 = readFileSync(timestampFile, "utf-8").trim();
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

// ../../configs/vite/plugins/copy-icons.ts
import { resolve as resolve6 } from "path";
import { existsSync as existsSync4, copyFileSync, mkdirSync, readdirSync, statSync, writeFileSync as writeFileSync2, unlinkSync } from "node:fs";
function copyIconsPlugin(appDir) {
  let viteConfig = null;
  return {
    name: "copy-icons",
    apply: "build",
    // 只在构建时执行
    configResolved(config) {
      viteConfig = config;
    },
    closeBundle() {
      try {
        if (!viteConfig) {
          return;
        }
        const root = viteConfig.root || appDir;
        const iconsSourceDir = resolve6(root, "public/icons");
        if (!existsSync4(iconsSourceDir)) {
          return;
        }
        const outDir = viteConfig.build.outDir || "dist";
        const distDir = resolve6(root, outDir);
        if (!existsSync4(distDir)) {
          return;
        }
        const iconsDestDir = resolve6(distDir, "icons");
        if (!existsSync4(iconsDestDir)) {
          mkdirSync(iconsDestDir, { recursive: true });
        }
        const files = readdirSync(iconsSourceDir);
        for (const file of files) {
          const sourcePath = resolve6(iconsSourceDir, file);
          const destPath = resolve6(iconsDestDir, file);
          const stats = statSync(sourcePath);
          if (stats.isFile()) {
            copyFileSync(sourcePath, destPath);
          }
        }
        const faviconDest = resolve6(distDir, "favicon.ico");
        if (existsSync4(faviconDest)) {
          try {
            unlinkSync(faviconDest);
            console.info(`[copy-icons] \u5DF2\u5220\u9664\u4E0D\u9700\u8981\u7684 favicon.ico: ${faviconDest}`);
          } catch (error) {
          }
        }
        const manifestSource = resolve6(root, "public/icons/site.webmanifest");
        const manifestDest = resolve6(iconsDestDir, "site.webmanifest");
        if (existsSync4(manifestSource)) {
          copyFileSync(manifestSource, manifestDest);
        } else {
          const manifestSourceRoot = resolve6(root, "public/site.webmanifest");
          if (existsSync4(manifestSourceRoot)) {
            copyFileSync(manifestSourceRoot, manifestDest);
          } else {
            const manifest = {
              name: "BTC ShopFlow Admin",
              short_name: "BTC Admin",
              description: "BTC ShopFlow \u7BA1\u7406\u5E94\u7528",
              start_url: "/",
              display: "standalone",
              background_color: "#ffffff",
              theme_color: "#404040",
              icons: [
                {
                  src: "/icons/android-chrome-192x192.png",
                  sizes: "192x192",
                  type: "image/png"
                },
                {
                  src: "/icons/android-chrome-512x512.png",
                  sizes: "512x512",
                  type: "image/png"
                },
                {
                  src: "/icons/favicon-32x32.png",
                  sizes: "32x32",
                  type: "image/png"
                },
                {
                  src: "/icons/favicon-16x16.png",
                  sizes: "16x16",
                  type: "image/png"
                }
              ]
            };
            writeFileSync2(manifestDest, JSON.stringify(manifest, null, 2), "utf-8");
          }
        }
        console.info(`[copy-icons] \u5DF2\u590D\u5236 icons \u76EE\u5F55\u5230: ${iconsDestDir}`);
      } catch (error) {
        console.warn("[copy-icons] \u590D\u5236 icons \u76EE\u5F55\u5931\u8D25:", error);
      }
    }
  };
}

// ../../configs/vite/plugins/upload-icons-to-oss.ts
import { spawn } from "child_process";
import { resolve as resolve7 } from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
import { execSync } from "child_process";
var __vite_injected_original_import_meta_url3 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/plugins/upload-icons-to-oss.ts";
var __filename3 = fileURLToPath3(__vite_injected_original_import_meta_url3);
var __dirname3 = resolve7(__filename3, "..");
var projectRoot = resolve7(__dirname3, "../../..");
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
function uploadIconsToOssPlugin() {
  let isProductionBuild = false;
  return {
    name: "upload-icons-to-oss",
    apply: "build",
    // 只在构建时执行
    configResolved(config) {
      isProductionBuild = !!config.isProduction;
    },
    async closeBundle() {
      if (!isProductionBuild) {
        return;
      }
      tryLoadOssCredsFromWindowsCredentialManager();
      if (!process.env.OSS_ACCESS_KEY_ID || !process.env.OSS_ACCESS_KEY_SECRET) {
        console.warn("[upload-icons-to-oss] \u26A0\uFE0F  \u8DF3\u8FC7\u4E0A\u4F20\uFF08\u672A\u914D\u7F6E OSS \u51ED\u8BC1\uFF09\u3002\u8FD9\u4F1A\u5BFC\u81F4 https://all.bellis.com.cn/logo.png \u8FD4\u56DE NoSuchKey");
        return;
      }
      const uploadScript = resolve7(projectRoot, "scripts/upload-icons-to-oss.mjs");
      console.info("[upload-icons-to-oss] \u{1F680} \u5F00\u59CB\u4E0A\u4F20\u56FE\u6807\u6587\u4EF6\u5230 OSS...");
      await new Promise((resolvePromise, rejectPromise) => {
        const child = spawn("node", [uploadScript], {
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
            console.info("[upload-icons-to-oss] \u2705 \u56FE\u6807\u6587\u4EF6\u4E0A\u4F20\u5B8C\u6210");
            resolvePromise();
          } else {
            const strict = process.env.OSS_UPLOAD_STRICT === "true";
            const err = new Error(`[upload-icons-to-oss] \u4E0A\u4F20\u811A\u672C\u9000\u51FA\uFF0C\u4EE3\u7801: ${code ?? "unknown"}`);
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

// ../../configs/vite/plugins/upload-cdn.ts
import { spawn as spawn2 } from "child_process";
import { resolve as resolve8 } from "path";
import { fileURLToPath as fileURLToPath4 } from "url";
import { execSync as execSync2 } from "child_process";
var __vite_injected_original_import_meta_url4 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/configs/vite/plugins/upload-cdn.ts";
var __filename4 = fileURLToPath4(__vite_injected_original_import_meta_url4);
var __dirname4 = resolve8(__filename4, "..");
var projectRoot2 = resolve8(__dirname4, "../../..");
function tryLoadOssCredsFromWindowsCredentialManager2() {
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
    const raw = execSync2(`powershell -NoProfile -NonInteractive -Command "${ps.replace(/"/g, '\\"')}"`, {
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
      tryLoadOssCredsFromWindowsCredentialManager2();
      if (!process.env.OSS_ACCESS_KEY_ID || !process.env.OSS_ACCESS_KEY_SECRET) {
        console.warn(`[upload-cdn] \u26A0\uFE0F  \u8DF3\u8FC7 ${appName} \u7684 CDN \u4E0A\u4F20\uFF08\u672A\u914D\u7F6E OSS \u51ED\u8BC1\uFF09`);
        return;
      }
      const uploadScript = resolve8(projectRoot2, "scripts/upload-app-to-cdn.mjs");
      console.info(`[upload-cdn] \u{1F680} \u5F00\u59CB\u4E0A\u4F20 ${appName} \u5230 CDN...`);
      await new Promise((resolvePromise, rejectPromise) => {
        const child = spawn2("node", [uploadScript, appName], {
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

// ../../configs/vite/factories/layout.config.ts
function createLayoutAppViteConfig(options) {
  const {
    appName,
    appDir,
    qiankunName,
    customPlugins = [],
    customBuild,
    customServer,
    customPreview,
    customCss,
    btcOptions = {},
    vueI18nOptions,
    qiankunOptions = { useDevMode: true }
  } = options;
  const appConfig = getViteAppConfig(appName);
  const { withRoot } = createPathHelpers(appDir);
  const baseUrl = "/";
  const publicDir = getPublicDir(appName, appDir);
  const layoutAliases = {
    "@layout": resolve9(appDir, "src"),
    "@system": resolve9(appDir, "../system-app/src"),
    "@": resolve9(appDir, "../system-app/src"),
    "@services": resolve9(appDir, "../system-app/src/services")
  };
  const isPreviewBuild = process.env.VITE_PREVIEW === "true";
  const plugins = [
    // 1. 清理插件（在构建前清理 dist 目录，包括旧的 assets 和 assets/layout 目录）
    cleanDistPlugin(appDir),
    // 2. CORS 插件
    corsPlugin(),
    // 3. 自定义插件
    ...customPlugins,
    // 4. Vue 插件
    vue({
      script: {
        fs: {
          fileExists: existsSync5,
          readFile: (file) => readFileSync2(file, "utf-8")
        }
      }
    }),
    // 4.5. Vue JSX 插件（支持 TSX 文件中的 JSX 语法）
    // 关键：与 cool-admin 保持一致，使用默认配置，让插件自动处理所有 JSX/TSX 文件
    vueJsx(),
    // 5. UnoCSS 插件
    UnoCSS({
      configFile: withRoot("uno.config.ts")
    }),
    // 6. BTC 业务插件
    btc({
      type: "admin",
      svg: {
        skipNames: ["base", "icons"],
        ...btcOptions.svg
      },
      eps: {
        enable: true,
        // 关键：EPS 的 outputDir 必须使用绝对路径，基于 appDir 解析
        // 避免在构建时因为工作目录变化而在 dist 目录下创建 build 目录
        dist: resolve9(appDir, "build", "eps"),
        // 共享的 EPS 数据源目录（从 main-app 读取）
        // layout-app 优先从 main-app 的 build/eps 读取 EPS 数据，实现真正的共享
        sharedEpsDir: resolve9(appDir, "../main-app/build/eps"),
        api: "/api/login/eps/contract",
        ...btcOptions.eps
      },
      ...btcOptions
    }),
    // 7. VueI18n 插件
    VueI18nPlugin({
      include: vueI18nOptions?.include || [
        resolve9(appDir, "../system-app/src/locales/**"),
        resolve9(appDir, "../system-app/src/{modules,plugins}/**/locales/**")
      ],
      runtimeOnly: vueI18nOptions?.runtimeOnly ?? true
    }),
    // 8. 自动导入插件
    createAutoImportConfig(),
    // 9. 组件自动注册插件
    createComponentsConfig({ includeShared: true }),
    // 10. Qiankun 插件
    qiankun(qiankunName, qiankunOptions),
    // 11. 确保 script 标签有 type="module"
    {
      name: "ensure-module-scripts",
      transformIndexHtml(html) {
        return html.replace(
          /<script(\s+[^>]*)?>/gi,
          (match, attrs = "") => {
            if (!match.includes("src=")) {
              return match;
            }
            if (attrs && attrs.includes("type=")) {
              return match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"');
            }
            return `<script type="module"${attrs}>`;
          }
        );
      }
    },
    // 12. 添加版本号插件（为 HTML 资源引用添加时间戳版本号）
    addVersionPlugin(),
    // 12.5. CDN 资源加速插件（在版本号插件之后，确保版本号参数被保留）
    // 关键：开发环境和预览环境必须禁用 CDN
    cdnAssetsPlugin({
      appName,
      enabled: !isPreviewBuild && process.env.ENABLE_CDN_ACCELERATION !== "false"
    }),
    // 15. 构建后清理插件：删除 .vite 目录（Vite 缓存目录不应出现在构建产物中）
    {
      name: "clean-vite-dir-plugin",
      closeBundle() {
        const viteDir = resolve9(appDir, "dist", ".vite");
        if (existsSync5(viteDir)) {
          try {
            rmSync2(viteDir, { recursive: true, force: true });
            console.info("[clean-vite-dir-plugin] \u2705 \u5DF2\u5220\u9664 dist/.vite \u76EE\u5F55");
          } catch (error) {
            console.warn("[clean-vite-dir-plugin] \u26A0\uFE0F  \u65E0\u6CD5\u5220\u9664 dist/.vite \u76EE\u5F55:", error.message);
          }
        }
      }
    },
    // 16. 确保 manifest.json 生成插件（包含所有 chunk，不仅仅是入口文件）
    {
      name: "ensure-manifest-plugin",
      writeBundle(_options, bundle) {
        const manifest = {};
        const allChunks = [];
        const fileNameToKeyMap = /* @__PURE__ */ new Map();
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (chunk.type === "chunk" && fileName.endsWith(".js")) {
            const sourceFile = chunk.facadeModuleId || chunk.moduleIds?.[0] || fileName;
            let relativeSource = fileName.replace(/^assets\/(layout\/)?/, "");
            if (sourceFile && typeof sourceFile === "string") {
              const srcPath = sourceFile.replace(resolve9(appDir, "src"), "src").replace(/\\/g, "/");
              if (srcPath.startsWith("src/")) {
                relativeSource = srcPath;
              } else {
                relativeSource = fileName.replace(/^assets\/(layout\/)?/, "").replace(/\.js$/, "");
              }
            }
            const isEntry = chunk.isEntry === true || fileName.includes("index-") || fileName.includes("main-");
            let priority = 999;
            if (fileName.includes("vendor-") && !fileName.includes("echarts-vendor")) {
              priority = 1;
            } else if (fileName.includes("echarts-vendor")) {
              priority = 2;
            } else if (fileName.includes("menu-registry") || fileName.includes("eps-service") || fileName.includes("auth-api")) {
              priority = 3;
            } else if (isEntry) {
              priority = 4;
            }
            const imports = [];
            const chunkImports = chunk.imports;
            if (chunkImports && Array.isArray(chunkImports)) {
              for (const importFileName of chunkImports) {
                if (importFileName && typeof importFileName === "string" && importFileName.endsWith(".js")) {
                  imports.push(importFileName);
                }
              }
            }
            if (imports.length > 0) {
              console.info(`[ensure-manifest-plugin] ${fileName} \u7684 imports:`, imports);
            }
            fileNameToKeyMap.set(fileName, relativeSource);
            allChunks.push({
              key: relativeSource,
              file: fileName,
              isEntry,
              priority,
              imports
            });
          }
        }
        allChunks.sort((a, b) => a.priority - b.priority);
        allChunks.forEach((chunk) => {
          const importKeys = [];
          if (chunk.imports && chunk.imports.length > 0) {
            for (const importFileName of chunk.imports) {
              let importKey = fileNameToKeyMap.get(importFileName);
              if (!importKey) {
                let baseName = null;
                const specialHashMatch = importFileName.match(/^([^-]+(?:-[^-]+)*?)-([A-Za-z0-9])-([a-zA-Z0-9]{4,})\.js$/);
                if (specialHashMatch && specialHashMatch[1]) {
                  baseName = specialHashMatch[1] ?? null;
                } else {
                  const multiHashMatch = importFileName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.js$/);
                  if (multiHashMatch && multiHashMatch[1]) {
                    baseName = multiHashMatch[1] ?? null;
                  } else {
                    const singleHashMatch = importFileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9]{8,})\.js$/);
                    if (singleHashMatch && singleHashMatch[1]) {
                      baseName = singleHashMatch[1] ?? null;
                    } else {
                      const simpleMatch = importFileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9]+)\.js$/);
                      if (simpleMatch && simpleMatch[1]) {
                        baseName = simpleMatch[1] ?? null;
                      }
                    }
                  }
                }
                if (baseName) {
                  for (const [actualFileName, actualKey] of fileNameToKeyMap.entries()) {
                    let actualBaseName = null;
                    const actualSpecialHashMatch = actualFileName.match(/^([^-]+(?:-[^-]+)*?)-([A-Za-z0-9])-([a-zA-Z0-9]{4,})(?:-[a-zA-Z0-9]+)?\.js$/);
                    if (actualSpecialHashMatch && actualSpecialHashMatch[1]) {
                      actualBaseName = actualSpecialHashMatch[1] ?? null;
                    } else {
                      const actualMultiHashMatch = actualFileName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.js$/);
                      if (actualMultiHashMatch && actualMultiHashMatch[1]) {
                        actualBaseName = actualMultiHashMatch[1] ?? null;
                      } else {
                        const actualSingleHashMatch = actualFileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9]{8,})\.js$/);
                        if (actualSingleHashMatch && actualSingleHashMatch[1]) {
                          actualBaseName = actualSingleHashMatch[1] ?? null;
                        } else {
                          const actualSimpleMatch = actualFileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9]+)(?:-[a-zA-Z0-9]+)?\.js$/);
                          if (actualSimpleMatch && actualSimpleMatch[1]) {
                            actualBaseName = actualSimpleMatch[1] ?? null;
                          }
                        }
                      }
                    }
                    if (actualBaseName && actualBaseName === baseName) {
                      importKey = actualKey;
                      console.info(`[ensure-manifest-plugin] \u901A\u8FC7\u57FA\u7840\u540D\u79F0\u5339\u914D\u627E\u5230 imports: ${importFileName} -> ${actualFileName} (key: ${actualKey})`);
                      break;
                    }
                  }
                  if (!importKey) {
                    console.warn(`[ensure-manifest-plugin] \u26A0\uFE0F  \u65E0\u6CD5\u627E\u5230 imports \u5BF9\u5E94\u7684\u6587\u4EF6: ${importFileName} (\u57FA\u7840\u540D\u79F0: ${baseName})`);
                  }
                } else {
                  console.warn(`[ensure-manifest-plugin] \u26A0\uFE0F  \u65E0\u6CD5\u89E3\u6790\u6587\u4EF6\u540D\u683C\u5F0F: ${importFileName}`);
                }
              }
              if (importKey) {
                importKeys.push(importKey);
              } else {
                console.warn(`[ensure-manifest-plugin] \u26A0\uFE0F  \u65E0\u6CD5\u627E\u5230 imports \u5BF9\u5E94\u7684\u6587\u4EF6: ${importFileName}`);
              }
            }
          }
          manifest[chunk.key] = {
            file: chunk.file,
            src: chunk.key,
            isEntry: chunk.isEntry,
            ...importKeys.length > 0 ? { imports: importKeys } : {}
          };
        });
        if (Object.keys(manifest).length === 0) {
          const firstChunk = Object.entries(bundle).find(([_, chunk]) => chunk.type === "chunk");
          if (firstChunk) {
            manifest["src/main.ts"] = {
              file: firstChunk[0],
              src: "src/main.ts",
              isEntry: true
            };
          }
        }
        const manifestPath = resolve9(appDir, "dist", "manifest.json");
        try {
          writeFileSync3(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
          console.info(`[ensure-manifest-plugin] \u2705 \u5DF2\u751F\u6210 manifest.json\uFF0C\u5305\u542B ${Object.keys(manifest).length} \u4E2A chunk`);
        } catch (error) {
          console.warn("[ensure-manifest-plugin] \u26A0\uFE0F  \u65E0\u6CD5\u5199\u5165 manifest.json:", error.message);
        }
      }
    },
    // 17. CDN 上传插件（仅在生产构建且启用时）
    ...process.env.ENABLE_CDN_UPLOAD === "true" && process.env.VITE_PREVIEW !== "true" ? [uploadCdnPlugin(appName, appDir)] : []
  ];
  const buildConfig = {
    target: "es2020",
    sourcemap: false,
    cssCodeSplit: false,
    cssMinify: true,
    // 关键：禁用代码压缩，避免 Terser 压缩导致的对象属性分隔符丢失问题
    minify: false,
    assetsInlineLimit: 0,
    outDir: process.env.BUILD_OUT_DIR || "dist",
    assetsDir: "assets",
    // 关键：启用 manifest 文件生成，用于动态加载入口文件
    manifest: true,
    // 关键：禁用 Vite 的自动清理，因为我们已经有 cleanDistPlugin 在构建前清理
    // 这样可以避免 Windows 上的文件锁定问题（EBUSY）
    // cleanDistPlugin 已经有重试机制（5次，递增等待时间），如果清理失败会继续构建
    // 注意：如果清理失败，旧的构建产物不会被删除，可能导致重复文件
    emptyOutDir: false,
    rollupOptions: {
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
      // 关键：layout-app 作为主应用，需要打包 single-spa 和 qiankun
      // 不将它们标记为 external，确保它们被打包到构建产物中
      external: [
        // vite-plugin 是构建时插件，不应该被打包到运行时代码中
        "@btc/vite-plugin",
        /^@btc\/vite-plugin/
        // 注意：single-spa 和 qiankun 不在这里，它们会被打包
      ],
      output: {
        format: "esm",
        inlineDynamicImports: false,
        manualChunks(id) {
          if (id.includes("node_modules/vue") || id.includes("node_modules/vue-router") || id.includes("node_modules/element-plus") || id.includes("node_modules/pinia") || id.includes("node_modules/@vueuse") || id.includes("node_modules/@element-plus") || id.includes("node_modules/dayjs") || id.includes("node_modules/lodash") || id.includes("node_modules/@vue") || id.includes("packages/shared-components") || id.includes("packages/shared-core") || id.includes("packages/shared-utils")) {
            return "vendor";
          }
          if (id.includes("node_modules/echarts") || id.includes("node_modules/zrender") || id.includes("node_modules/vue-echarts")) {
            return "echarts-vendor";
          }
          if (id.includes("virtual:eps") || id.includes("\\0virtual:eps") || id.includes("services/eps") || id.includes("services\\eps")) {
            return "eps-service";
          }
          if (id.includes("packages/subapp-manifests") || id.includes("packages/shared-components/src/store/menuRegistry") || id.includes("configs/layout-bridge") || id.includes("@btc/subapp-manifests") || id.includes("@btc/shared-core/configs/layout-bridge")) {
            return "menu-registry";
          }
          if (id.includes("node_modules/monaco-editor")) {
            return "lib-monaco";
          }
          if (id.includes("node_modules/three")) {
            return "lib-three";
          }
          return void 0;
        },
        preserveModules: false,
        generatedCode: {
          constBindings: false
        },
        // 布局应用使用 assets/layout/ 目录，与子应用的 assets/ 目录区分开
        chunkFileNames: "assets/layout/[name]-[hash].js",
        // 关键：layout-app 入口文件使用稳定文件名，避免旧 index.html/旧引用导致的 index-xxx.js 404
        // 配合 Nginx：assets/layout/index.js 设置 no-cache；其余 hash 文件 immutable
        entryFileNames: "assets/layout/[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "assets/layout/[name]-[hash].css";
          }
          return "assets/layout/[name]-[hash].[ext]";
        }
      }
    },
    ...customBuild
  };
  const serverConfig = {
    port: appConfig.devPort,
    host: appConfig.devHost,
    strictPort: true,
    open: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    fs: {
      allow: [
        resolve9(appDir, ".."),
        resolve9(appDir, "../system-app"),
        resolve9(appDir, "../../")
      ]
    },
    ...customServer
  };
  const rootDistDir = resolve9(appDir, "../../dist");
  const previewRoot = resolve9(rootDistDir, appConfig.prodHost);
  const previewConfig = {
    port: appConfig.prePort,
    host: appConfig.preHost,
    strictPort: true,
    open: false,
    // 关键：设置预览服务器的根目录为 dist/{prodHost}
    root: previewRoot,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    ...customPreview
  };
  const cssConfig = {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        silenceDeprecations: ["legacy-js-api", "import"]
      }
    },
    ...customCss
  };
  const appCacheDir = resolve9(appDir, "node_modules/.vite");
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
      // layout-app 实际安装的依赖
      "vue-i18n",
      "axios",
      "echarts",
      "vue-echarts",
      "mitt",
      "nprogress"
      // 注意：lunr 和 file-saver 不是所有应用都安装，不应该在 include 中强制声明
      // 如果应用安装了这些依赖，Vite 会在扫描 entries 时自动发现并优化
      // 'lunr', // 只在 shared-components 中使用，不是所有应用都安装
      // 'file-saver', // 只在部分应用中使用，不是所有应用都安装
      // 注意：以下依赖不是所有应用都直接安装，它们通过 @btc/shared-components 间接使用
      // Vite 会在运行时自动发现并优化这些依赖，不需要在 include 中显式声明
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
    // 注意：不再包含 shared-components/src/index.ts，因为它包含 TSX 文件，应该在运行时直接处理
    entries: [
      resolve9(appDir, "src/main.ts")
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
    }
  };
  const baseResolve = createBaseResolve(appDir, appName);
  return {
    base: baseUrl,
    publicDir,
    // 关键：每个应用使用独立的缓存目录，避免不同应用的配置差异导致缓存冲突
    cacheDir: appCacheDir,
    define: {
      // 为浏览器环境提供 process 对象，Winston 需要它
      "process.env": "{}",
      "process.platform": JSON.stringify("browser"),
      "process.version": JSON.stringify("")
    },
    resolve: {
      ...baseResolve,
      // 合并别名：baseResolve.alias 是数组形式，layoutAliases 是对象形式
      // 关键：layoutAliases 中的别名必须放在数组前面，确保优先匹配（特别是 @ 别名）
      alias: Array.isArray(baseResolve?.alias) ? [
        // layout-app 特有的别名放在前面，优先匹配
        ...Object.entries(layoutAliases).map(([find, replacement]) => ({
          find,
          replacement
        })),
        // 过滤掉 baseResolve.alias 中与 layoutAliases 冲突的别名（如 @）
        ...baseResolve.alias.filter((alias) => {
          if (typeof alias.find === "string") {
            return !(alias.find in layoutAliases);
          }
          return true;
        })
      ] : {
        ...baseResolve?.alias || {},
        ...layoutAliases
      }
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
    css: cssConfig,
    build: buildConfig,
    optimizeDeps: optimizeDepsConfig
  };
}

// vite.config.ts
var __vite_injected_original_import_meta_url5 = "file:///C:/Users/mlu/Desktop/btc-shopflow/btc-shopflow-monorepo/apps/layout-app/vite.config.ts";
var vite_config_default = defineConfig(
  createLayoutAppViteConfig({
    appName: "layout-app",
    appDir: fileURLToPath5(new URL(".", __vite_injected_original_import_meta_url5)),
    qiankunName: "layout",
    customPlugins: [
      // 关键：layout-app 需要复制 icons 目录，因为它是统一管理图标的应用
      copyIconsPlugin(fileURLToPath5(new URL(".", __vite_injected_original_import_meta_url5))),
      // 生产构建完成后，自动上传图标文件到 OSS
      uploadIconsToOssPlugin()
    ]
  })
);
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL2ZhY3Rvcmllcy9sYXlvdXQuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS91dGlscy9wYXRoLWhlbHBlcnMudHMiLCAiLi4vLi4vY29uZmlncy9hdXRvLWltcG9ydC5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlLWFwcC1jb25maWcudHMiLCAiLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvcmUvc3JjL2NvbmZpZ3MvYXBwLWVudi5jb25maWcudHMiLCAiLi4vLi4vY29uZmlncy92aXRlL2Jhc2UuY29uZmlnLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL2NsZWFuLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VybC50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy9jb3JzLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3ZlcnNpb24udHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY29weS1pY29ucy50cyIsICIuLi8uLi9jb25maWdzL3ZpdGUvcGx1Z2lucy91cGxvYWQtaWNvbnMtdG8tb3NzLnRzIiwgIi4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VwbG9hZC1jZG4udHMiLCAiLi4vLi4vY29uZmlncy92aXRlL3BsdWdpbnMvY2RuLWFzc2V0cy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcYXBwc1xcXFxsYXlvdXQtYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGFwcHNcXFxcbGF5b3V0LWFwcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9hcHBzL2xheW91dC1hcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5pbXBvcnQgeyBjcmVhdGVMYXlvdXRBcHBWaXRlQ29uZmlnIH0gZnJvbSAnLi4vLi4vY29uZmlncy92aXRlL2ZhY3Rvcmllcy9sYXlvdXQuY29uZmlnJztcbmltcG9ydCB7IGNvcHlJY29uc1BsdWdpbiwgdXBsb2FkSWNvbnNUb09zc1BsdWdpbiB9IGZyb20gJy4uLy4uL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKFxuICBjcmVhdGVMYXlvdXRBcHBWaXRlQ29uZmlnKHtcbiAgICBhcHBOYW1lOiAnbGF5b3V0LWFwcCcsXG4gICAgYXBwRGlyOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4nLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICBxaWFua3VuTmFtZTogJ2xheW91dCcsXG4gICAgY3VzdG9tUGx1Z2luczogW1xuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBbGF5b3V0LWFwcCBcdTk3MDBcdTg5ODFcdTU5MERcdTUyMzYgaWNvbnMgXHU3NkVFXHU1RjU1XHVGRjBDXHU1NkUwXHU0RTNBXHU1QjgzXHU2NjJGXHU3RURGXHU0RTAwXHU3QkExXHU3NDA2XHU1NkZFXHU2ODA3XHU3Njg0XHU1RTk0XHU3NTI4XG4gICAgICBjb3B5SWNvbnNQbHVnaW4oZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuJywgaW1wb3J0Lm1ldGEudXJsKSkpLFxuICAgICAgLy8gXHU3NTFGXHU0RUE3XHU2Nzg0XHU1RUZBXHU1QjhDXHU2MjEwXHU1NDBFXHVGRjBDXHU4MUVBXHU1MkE4XHU0RTBBXHU0RjIwXHU1NkZFXHU2ODA3XHU2NTg3XHU0RUY2XHU1MjMwIE9TU1xuICAgICAgdXBsb2FkSWNvbnNUb09zc1BsdWdpbigpLFxuICAgIF0sXG4gIH0pXG4pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxmYWN0b3JpZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXGZhY3Rvcmllc1xcXFxsYXlvdXQuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9mYWN0b3JpZXMvbGF5b3V0LmNvbmZpZy50c1wiOy8qKlxuICogXHU1RTAzXHU1QzQwXHU1RTk0XHU3NTI4IFZpdGUgXHU5MTREXHU3RjZFXHU1REU1XHU1MzgyXG4gKiBcdTc1MUZcdTYyMTBcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjhcdTc2ODRcdTVCOENcdTY1NzQgVml0ZSBcdTkxNERcdTdGNkVcdUZGMDhsYXlvdXQtYXBwXHVGRjA5XG4gKi9cbjtcblxuaW1wb3J0IHR5cGUgeyBVc2VyQ29uZmlnLCBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgcm1TeW5jLCB3cml0ZUZpbGVTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgdnVlSnN4IGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZS1qc3gnO1xuaW1wb3J0IHFpYW5rdW4gZnJvbSAndml0ZS1wbHVnaW4tcWlhbmt1bic7XG5pbXBvcnQgVW5vQ1NTIGZyb20gJ3Vub2Nzcy92aXRlJztcbmltcG9ydCB7IGNyZWF0ZVBhdGhIZWxwZXJzIH0gZnJvbSAnLi4vdXRpbHMvcGF0aC1oZWxwZXJzJztcblxuLy8gXHU0RjdGXHU3NTI4IEVTTSBcdTVCRkNcdTUxNjUgVnVlSTE4blBsdWdpblx1RkYwOFZpdGUgXHU5MTREXHU3RjZFXHU2NTg3XHU0RUY2XHU2NTJGXHU2MzAxIEVTTVx1RkYwOVxuaW1wb3J0IFZ1ZUkxOG5QbHVnaW4gZnJvbSAnQGludGxpZnkvdW5wbHVnaW4tdnVlLWkxOG4vdml0ZSc7XG5pbXBvcnQgeyBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnLCBjcmVhdGVDb21wb25lbnRzQ29uZmlnIH0gZnJvbSAnLi4vLi4vYXV0by1pbXBvcnQuY29uZmlnJztcbmltcG9ydCB7IGJ0YyB9IGZyb20gJ0BidGMvdml0ZS1wbHVnaW4nO1xuaW1wb3J0IHsgZ2V0Vml0ZUFwcENvbmZpZywgZ2V0UHVibGljRGlyIH0gZnJvbSAnLi4vLi4vdml0ZS1hcHAtY29uZmlnJztcbmltcG9ydCB7IGNyZWF0ZUJhc2VSZXNvbHZlIH0gZnJvbSAnLi4vYmFzZS5jb25maWcnO1xuaW1wb3J0IHsgY2xlYW5EaXN0UGx1Z2luLCBjb3JzUGx1Z2luLCBhZGRWZXJzaW9uUGx1Z2luLCB1cGxvYWRDZG5QbHVnaW4sIGNkbkFzc2V0c1BsdWdpbiB9IGZyb20gJy4uL3BsdWdpbnMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIExheW91dEFwcFZpdGVDb25maWdPcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NTk4MiAnbGF5b3V0LWFwcCdcdUZGMDlcbiAgICovXG4gIGFwcE5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1NjgzOVx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxuICAgKi9cbiAgYXBwRGlyOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBRaWFua3VuIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NTk4MiAnbGF5b3V0J1x1RkYwOVxuICAgKi9cbiAgcWlhbmt1bk5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NjNEMlx1NEVGNlx1NTIxN1x1ODg2OFxuICAgKi9cbiAgY3VzdG9tUGx1Z2lucz86IFBsdWdpbltdO1xuICAvKipcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5XHU2Nzg0XHU1RUZBXHU5MTREXHU3RjZFXG4gICAqL1xuICBjdXN0b21CdWlsZD86IFBhcnRpYWw8VXNlckNvbmZpZ1snYnVpbGQnXT47XG4gIC8qKlxuICAgKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTY3MERcdTUyQTFcdTU2NjhcdTkxNERcdTdGNkVcbiAgICovXG4gIGN1c3RvbVNlcnZlcj86IFBhcnRpYWw8VXNlckNvbmZpZ1snc2VydmVyJ10+O1xuICAvKipcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5XHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHU5MTREXHU3RjZFXG4gICAqL1xuICBjdXN0b21QcmV2aWV3PzogUGFydGlhbDxVc2VyQ29uZmlnWydwcmV2aWV3J10+O1xuICAvKipcbiAgICogXHU4MUVBXHU1QjlBXHU0RTQ5IENTUyBcdTkxNERcdTdGNkVcbiAgICovXG4gIGN1c3RvbUNzcz86IFBhcnRpYWw8VXNlckNvbmZpZ1snY3NzJ10+O1xuICAvKipcbiAgICogQlRDIFx1NjNEMlx1NEVGNlx1OTE0RFx1N0Y2RVxuICAgKi9cbiAgYnRjT3B0aW9ucz86IHtcbiAgICB0eXBlPzogJ2FkbWluJztcbiAgICBzdmc/OiB7XG4gICAgICBza2lwTmFtZXM/OiBzdHJpbmdbXTtcbiAgICB9O1xuICAgIGVwcz86IHtcbiAgICAgIGVuYWJsZT86IGJvb2xlYW47XG4gICAgICBkaXN0Pzogc3RyaW5nO1xuICAgICAgYXBpPzogc3RyaW5nO1xuICAgIH07XG4gIH07XG4gIC8qKlxuICAgKiBWdWVJMThuIFx1NjNEMlx1NEVGNlx1OTE0RFx1N0Y2RVxuICAgKi9cbiAgdnVlSTE4bk9wdGlvbnM/OiB7XG4gICAgaW5jbHVkZT86IHN0cmluZ1tdO1xuICAgIHJ1bnRpbWVPbmx5PzogYm9vbGVhbjtcbiAgfTtcbiAgLyoqXG4gICAqIFFpYW5rdW4gXHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFXG4gICAqL1xuICBxaWFua3VuT3B0aW9ucz86IHtcbiAgICB1c2VEZXZNb2RlPzogYm9vbGVhbjtcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTUyMUJcdTVFRkFcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjggVml0ZSBcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxheW91dEFwcFZpdGVDb25maWcob3B0aW9uczogTGF5b3V0QXBwVml0ZUNvbmZpZ09wdGlvbnMpOiBVc2VyQ29uZmlnIHtcbiAgY29uc3Qge1xuICAgIGFwcE5hbWUsXG4gICAgYXBwRGlyLFxuICAgIHFpYW5rdW5OYW1lLFxuICAgIGN1c3RvbVBsdWdpbnMgPSBbXSxcbiAgICBjdXN0b21CdWlsZCxcbiAgICBjdXN0b21TZXJ2ZXIsXG4gICAgY3VzdG9tUHJldmlldyxcbiAgICBjdXN0b21Dc3MsXG4gICAgYnRjT3B0aW9ucyA9IHt9LFxuICAgIHZ1ZUkxOG5PcHRpb25zLFxuICAgIHFpYW5rdW5PcHRpb25zID0geyB1c2VEZXZNb2RlOiB0cnVlIH0sXG4gIH0gPSBvcHRpb25zO1xuXG4gIC8vIFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxuICBjb25zdCBhcHBDb25maWcgPSBnZXRWaXRlQXBwQ29uZmlnKGFwcE5hbWUpO1xuICAvLyBcdTRGN0ZcdTc1MjhcdTVCRkNcdTUxNjVcdTc2ODQgY3JlYXRlUGF0aEhlbHBlcnNcbiAgY29uc3QgeyB3aXRoUm9vdCB9ID0gY3JlYXRlUGF0aEhlbHBlcnMoYXBwRGlyKTtcblxuICAvLyBcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjhcdTU2RkFcdTVCOUFcdTRGN0ZcdTc1MjhcdTY4MzlcdThERUZcdTVGODRcbiAgY29uc3QgYmFzZVVybCA9ICcvJztcbiAgY29uc3QgcHVibGljRGlyID0gZ2V0UHVibGljRGlyKGFwcE5hbWUsIGFwcERpcik7XG5cbiAgLy8gXHU2MjY5XHU1QzU1XHU1MjJCXHU1NDBEXHU5MTREXHU3RjZFXHVGRjA4XHU1RTAzXHU1QzQwXHU1RTk0XHU3NTI4XHU3Mjc5XHU2NzA5XHVGRjA5XG4gIC8vIFx1NkNFOFx1NjEwRlx1RkYxQWJhc2VSZXNvbHZlIFx1NTcyOFx1NTQwRVx1OTc2Mlx1NjgzOVx1NjM2RSBtb2RlIFx1NTIxQlx1NUVGQVx1RkYwQ1x1OEZEOVx1OTFDQ1x1NTNFQVx1NUI5QVx1NEU0OSBsYXlvdXQgXHU3Mjc5XHU2NzA5XHU3Njg0XHU1MjJCXHU1NDBEXG4gIGNvbnN0IGxheW91dEFsaWFzZXMgPSB7XG4gICAgJ0BsYXlvdXQnOiByZXNvbHZlKGFwcERpciwgJ3NyYycpLFxuICAgICdAc3lzdGVtJzogcmVzb2x2ZShhcHBEaXIsICcuLi9zeXN0ZW0tYXBwL3NyYycpLFxuICAgICdAJzogcmVzb2x2ZShhcHBEaXIsICcuLi9zeXN0ZW0tYXBwL3NyYycpLFxuICAgICdAc2VydmljZXMnOiByZXNvbHZlKGFwcERpciwgJy4uL3N5c3RlbS1hcHAvc3JjL3NlcnZpY2VzJyksXG4gIH07XG5cbiAgLy8gXHU2Nzg0XHU1RUZBXHU2M0QyXHU0RUY2XHU1MjE3XHU4ODY4XG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NTQ4Q1x1OTg4NFx1ODlDOFx1NzNBRlx1NTg4M1x1NUZDNVx1OTg3Qlx1Nzk4MVx1NzUyOCBDRE5cbiAgY29uc3QgaXNQcmV2aWV3QnVpbGQgPSBwcm9jZXNzLmVudi5WSVRFX1BSRVZJRVcgPT09ICd0cnVlJztcbiAgY29uc3QgcGx1Z2luczogYW55W10gPSBbXG4gICAgLy8gMS4gXHU2RTA1XHU3NDA2XHU2M0QyXHU0RUY2XHVGRjA4XHU1NzI4XHU2Nzg0XHU1RUZBXHU1MjREXHU2RTA1XHU3NDA2IGRpc3QgXHU3NkVFXHU1RjU1XHVGRjBDXHU1MzA1XHU2MkVDXHU2NUU3XHU3Njg0IGFzc2V0cyBcdTU0OEMgYXNzZXRzL2xheW91dCBcdTc2RUVcdTVGNTVcdUZGMDlcbiAgICBjbGVhbkRpc3RQbHVnaW4oYXBwRGlyKSxcbiAgICAvLyAyLiBDT1JTIFx1NjNEMlx1NEVGNlxuICAgIGNvcnNQbHVnaW4oKSxcbiAgICAvLyAzLiBcdTgxRUFcdTVCOUFcdTRFNDlcdTYzRDJcdTRFRjZcbiAgICAuLi5jdXN0b21QbHVnaW5zLFxuICAgIC8vIDQuIFZ1ZSBcdTYzRDJcdTRFRjZcbiAgICB2dWUoe1xuICAgICAgc2NyaXB0OiB7XG4gICAgICAgIGZzOiB7XG4gICAgICAgICAgZmlsZUV4aXN0czogZXhpc3RzU3luYyxcbiAgICAgICAgICByZWFkRmlsZTogKGZpbGU6IHN0cmluZykgPT4gcmVhZEZpbGVTeW5jKGZpbGUsICd1dGYtOCcpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KSxcbiAgICAvLyA0LjUuIFZ1ZSBKU1ggXHU2M0QyXHU0RUY2XHVGRjA4XHU2NTJGXHU2MzAxIFRTWCBcdTY1ODdcdTRFRjZcdTRFMkRcdTc2ODQgSlNYIFx1OEJFRFx1NkNENVx1RkYwOVxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEUwRSBjb29sLWFkbWluIFx1NEZERFx1NjMwMVx1NEUwMFx1ODFGNFx1RkYwQ1x1NEY3Rlx1NzUyOFx1OUVEOFx1OEJBNFx1OTE0RFx1N0Y2RVx1RkYwQ1x1OEJBOVx1NjNEMlx1NEVGNlx1ODFFQVx1NTJBOFx1NTkwNFx1NzQwNlx1NjI0MFx1NjcwOSBKU1gvVFNYIFx1NjU4N1x1NEVGNlxuICAgIHZ1ZUpzeCgpLFxuICAgIC8vIDUuIFVub0NTUyBcdTYzRDJcdTRFRjZcbiAgICBVbm9DU1Moe1xuICAgICAgY29uZmlnRmlsZTogd2l0aFJvb3QoJ3Vuby5jb25maWcudHMnKSxcbiAgICB9KSxcbiAgICAvLyA2LiBCVEMgXHU0RTFBXHU1MkExXHU2M0QyXHU0RUY2XG4gICAgYnRjKHtcbiAgICAgIHR5cGU6ICdhZG1pbicgYXMgYW55LFxuICAgICAgc3ZnOiB7XG4gICAgICAgIHNraXBOYW1lczogWydiYXNlJywgJ2ljb25zJ10sXG4gICAgICAgIC4uLmJ0Y09wdGlvbnMuc3ZnLFxuICAgICAgfSxcbiAgICAgIGVwczoge1xuICAgICAgICBlbmFibGU6IHRydWUsXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQUVQUyBcdTc2ODQgb3V0cHV0RGlyIFx1NUZDNVx1OTg3Qlx1NEY3Rlx1NzUyOFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NTdGQVx1NEU4RSBhcHBEaXIgXHU4OUUzXHU2NzkwXG4gICAgICAgIC8vIFx1OTA3Rlx1NTE0RFx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NTZFMFx1NEUzQVx1NURFNVx1NEY1Q1x1NzZFRVx1NUY1NVx1NTNEOFx1NTMxNlx1ODAwQ1x1NTcyOCBkaXN0IFx1NzZFRVx1NUY1NVx1NEUwQlx1NTIxQlx1NUVGQSBidWlsZCBcdTc2RUVcdTVGNTVcbiAgICAgICAgZGlzdDogcmVzb2x2ZShhcHBEaXIsICdidWlsZCcsICdlcHMnKSxcbiAgICAgICAgLy8gXHU1MTcxXHU0RUFCXHU3Njg0IEVQUyBcdTY1NzBcdTYzNkVcdTZFOTBcdTc2RUVcdTVGNTVcdUZGMDhcdTRFQ0UgbWFpbi1hcHAgXHU4QkZCXHU1M0Q2XHVGRjA5XG4gICAgICAgIC8vIGxheW91dC1hcHAgXHU0RjE4XHU1MTQ4XHU0RUNFIG1haW4tYXBwIFx1NzY4NCBidWlsZC9lcHMgXHU4QkZCXHU1M0Q2IEVQUyBcdTY1NzBcdTYzNkVcdUZGMENcdTVCOUVcdTczQjBcdTc3MUZcdTZCNjNcdTc2ODRcdTUxNzFcdTRFQUJcbiAgICAgICAgc2hhcmVkRXBzRGlyOiByZXNvbHZlKGFwcERpciwgJy4uL21haW4tYXBwL2J1aWxkL2VwcycpLFxuICAgICAgICBhcGk6ICcvYXBpL2xvZ2luL2Vwcy9jb250cmFjdCcsXG4gICAgICAgIC4uLmJ0Y09wdGlvbnMuZXBzLFxuICAgICAgfSxcbiAgICAgIC4uLmJ0Y09wdGlvbnMsXG4gICAgfSksXG4gICAgLy8gNy4gVnVlSTE4biBcdTYzRDJcdTRFRjZcbiAgICBWdWVJMThuUGx1Z2luKHtcbiAgICAgIGluY2x1ZGU6IHZ1ZUkxOG5PcHRpb25zPy5pbmNsdWRlIHx8IFtcbiAgICAgICAgcmVzb2x2ZShhcHBEaXIsICcuLi9zeXN0ZW0tYXBwL3NyYy9sb2NhbGVzLyoqJyksXG4gICAgICAgIHJlc29sdmUoYXBwRGlyLCAnLi4vc3lzdGVtLWFwcC9zcmMve21vZHVsZXMscGx1Z2luc30vKiovbG9jYWxlcy8qKicpLFxuICAgICAgXSxcbiAgICAgIHJ1bnRpbWVPbmx5OiB2dWVJMThuT3B0aW9ucz8ucnVudGltZU9ubHkgPz8gdHJ1ZSxcbiAgICB9KSxcbiAgICAvLyA4LiBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTYzRDJcdTRFRjZcbiAgICBjcmVhdGVBdXRvSW1wb3J0Q29uZmlnKCksXG4gICAgLy8gOS4gXHU3RUM0XHU0RUY2XHU4MUVBXHU1MkE4XHU2Q0U4XHU1MThDXHU2M0QyXHU0RUY2XG4gICAgY3JlYXRlQ29tcG9uZW50c0NvbmZpZyh7IGluY2x1ZGVTaGFyZWQ6IHRydWUgfSksXG4gICAgLy8gMTAuIFFpYW5rdW4gXHU2M0QyXHU0RUY2XG4gICAgcWlhbmt1bihxaWFua3VuTmFtZSwgcWlhbmt1bk9wdGlvbnMpLFxuICAgIC8vIDExLiBcdTc4NkVcdTRGREQgc2NyaXB0IFx1NjgwN1x1N0I3RVx1NjcwOSB0eXBlPVwibW9kdWxlXCJcbiAgICB7XG4gICAgICBuYW1lOiAnZW5zdXJlLW1vZHVsZS1zY3JpcHRzJyxcbiAgICAgIHRyYW5zZm9ybUluZGV4SHRtbChodG1sKSB7XG4gICAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoXG4gICAgICAgICAgLzxzY3JpcHQoXFxzK1tePl0qKT8+L2dpLFxuICAgICAgICAgIChtYXRjaDogc3RyaW5nLCBhdHRyczogc3RyaW5nID0gJycpID0+IHtcbiAgICAgICAgICAgIGlmICghbWF0Y2guaW5jbHVkZXMoJ3NyYz0nKSkge1xuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXR0cnMgJiYgYXR0cnMuaW5jbHVkZXMoJ3R5cGU9JykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoLnJlcGxhY2UoL3R5cGU9W1wiJ10/W15cIidcXHM+XStbXCInXT8vaSwgJ3R5cGU9XCJtb2R1bGVcIicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGA8c2NyaXB0IHR5cGU9XCJtb2R1bGVcIiR7YXR0cnN9PmA7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfSxcbiAgICB9IGFzIFBsdWdpbixcbiAgICAvLyAxMi4gXHU2REZCXHU1MkEwXHU3MjQ4XHU2NzJDXHU1M0Y3XHU2M0QyXHU0RUY2XHVGRjA4XHU0RTNBIEhUTUwgXHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU2REZCXHU1MkEwXHU2NUY2XHU5NUY0XHU2MjMzXHU3MjQ4XHU2NzJDXHU1M0Y3XHVGRjA5XG4gICAgYWRkVmVyc2lvblBsdWdpbigpLFxuICAgIC8vIDEyLjUuIENETiBcdThENDRcdTZFOTBcdTUyQTBcdTkwMUZcdTYzRDJcdTRFRjZcdUZGMDhcdTU3MjhcdTcyNDhcdTY3MkNcdTUzRjdcdTYzRDJcdTRFRjZcdTRFNEJcdTU0MEVcdUZGMENcdTc4NkVcdTRGRERcdTcyNDhcdTY3MkNcdTUzRjdcdTUzQzJcdTY1NzBcdTg4QUJcdTRGRERcdTc1NTlcdUZGMDlcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTU0OENcdTk4ODRcdTg5QzhcdTczQUZcdTU4ODNcdTVGQzVcdTk4N0JcdTc5ODFcdTc1MjggQ0ROXG4gICAgY2RuQXNzZXRzUGx1Z2luKHtcbiAgICAgIGFwcE5hbWUsXG4gICAgICBlbmFibGVkOiAhaXNQcmV2aWV3QnVpbGQgJiYgcHJvY2Vzcy5lbnYuRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gIT09ICdmYWxzZScsXG4gICAgfSksXG4gICAgLy8gMTUuIFx1Njc4NFx1NUVGQVx1NTQwRVx1NkUwNVx1NzQwNlx1NjNEMlx1NEVGNlx1RkYxQVx1NTIyMFx1OTY2NCAudml0ZSBcdTc2RUVcdTVGNTVcdUZGMDhWaXRlIFx1N0YxM1x1NUI1OFx1NzZFRVx1NUY1NVx1NEUwRFx1NUU5NFx1NTFGQVx1NzNCMFx1NTcyOFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NEUyRFx1RkYwOVxuICAgIHtcbiAgICAgIG5hbWU6ICdjbGVhbi12aXRlLWRpci1wbHVnaW4nLFxuICAgICAgY2xvc2VCdW5kbGUoKSB7XG4gICAgICAgIGNvbnN0IHZpdGVEaXIgPSByZXNvbHZlKGFwcERpciwgJ2Rpc3QnLCAnLnZpdGUnKTtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmModml0ZURpcikpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcm1TeW5jKHZpdGVEaXIsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnW2NsZWFuLXZpdGUtZGlyLXBsdWdpbl0gXHUyNzA1IFx1NURGMlx1NTIyMFx1OTY2NCBkaXN0Ly52aXRlIFx1NzZFRVx1NUY1NScpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignW2NsZWFuLXZpdGUtZGlyLXBsdWdpbl0gXHUyNkEwXHVGRTBGICBcdTY1RTBcdTZDRDVcdTUyMjBcdTk2NjQgZGlzdC8udml0ZSBcdTc2RUVcdTVGNTU6JywgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0gYXMgUGx1Z2luLFxuICAgIC8vIDE2LiBcdTc4NkVcdTRGREQgbWFuaWZlc3QuanNvbiBcdTc1MUZcdTYyMTBcdTYzRDJcdTRFRjZcdUZGMDhcdTUzMDVcdTU0MkJcdTYyNDBcdTY3MDkgY2h1bmtcdUZGMENcdTRFMERcdTRFQzVcdTRFQzVcdTY2MkZcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdUZGMDlcbiAgICB7XG4gICAgICBuYW1lOiAnZW5zdXJlLW1hbmlmZXN0LXBsdWdpbicsXG4gICAgICB3cml0ZUJ1bmRsZShfb3B0aW9uczogYW55LCBidW5kbGU6IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcbiAgICAgICAgLy8gXHU0RUNFIGJ1bmRsZSBcdTRFMkRcdTYzRDBcdTUzRDZcdTYyNDBcdTY3MDkgY2h1bmsgXHU0RkUxXHU2MDZGXG4gICAgICAgIGNvbnN0IG1hbmlmZXN0OiBSZWNvcmQ8c3RyaW5nLCB7IGZpbGU6IHN0cmluZzsgc3JjPzogc3RyaW5nOyBpc0VudHJ5PzogYm9vbGVhbjsgaW1wb3J0cz86IHN0cmluZ1tdIH0+ID0ge307XG4gICAgICAgIGNvbnN0IGFsbENodW5rczogQXJyYXk8eyBrZXk6IHN0cmluZzsgZmlsZTogc3RyaW5nOyBpc0VudHJ5OiBib29sZWFuOyBwcmlvcml0eTogbnVtYmVyOyBpbXBvcnRzPzogc3RyaW5nW10gfT4gPSBbXTtcbiAgICAgICAgLy8gXHU1MjFCXHU1RUZBXHU2NTg3XHU0RUY2XHU1NDBEXHU1MjMwIGtleSBcdTc2ODRcdTY2MjBcdTVDMDRcdUZGMENcdTc1MjhcdTRFOEVcdTY3RTVcdTYyN0UgaW1wb3J0c1xuICAgICAgICBjb25zdCBmaWxlTmFtZVRvS2V5TWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICAgICAgICAvLyBcdTdCMkNcdTRFMDBcdTkwNERcdTkwNERcdTUzODZcdUZGMUFcdTY1MzZcdTk2QzZcdTYyNDBcdTY3MDkgY2h1bmsgXHU0RkUxXHU2MDZGXG4gICAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjaHVua10gb2YgT2JqZWN0LmVudHJpZXMoYnVuZGxlKSkge1xuICAgICAgICAgIGlmICgoY2h1bmsgYXMgYW55KS50eXBlID09PSAnY2h1bmsnICYmIGZpbGVOYW1lLmVuZHNXaXRoKCcuanMnKSkge1xuICAgICAgICAgICAgLy8gXHU2N0U1XHU2MjdFXHU1QkY5XHU1RTk0XHU3Njg0XHU2RTkwXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XG4gICAgICAgICAgICBjb25zdCBzb3VyY2VGaWxlID0gKGNodW5rIGFzIGFueSkuZmFjYWRlTW9kdWxlSWQgfHwgKGNodW5rIGFzIGFueSkubW9kdWxlSWRzPy5bMF0gfHwgZmlsZU5hbWU7XG4gICAgICAgICAgICAvLyBcdTY1MkZcdTYzMDEgYXNzZXRzLyBcdTU0OEMgYXNzZXRzL2xheW91dC8gXHU4REVGXHU1Rjg0XG4gICAgICAgICAgICBsZXQgcmVsYXRpdmVTb3VyY2UgPSBmaWxlTmFtZS5yZXBsYWNlKC9eYXNzZXRzXFwvKGxheW91dFxcLyk/LywgJycpOyAvLyBcdTRGN0ZcdTc1MjhcdTY1ODdcdTRFRjZcdTU0MERcdTRGNUNcdTRFM0FcdTlFRDhcdThCQTQga2V5XHVGRjA4XHU1M0JCXHU2Mzg5IGFzc2V0cy8gXHU2MjE2IGFzc2V0cy9sYXlvdXQvIFx1NTI0RFx1N0YwMFx1RkYwOVxuXG4gICAgICAgICAgICBpZiAoc291cmNlRmlsZSAmJiB0eXBlb2Ygc291cmNlRmlsZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgLy8gXHU1QzFEXHU4QkQ1XHU0RUNFXHU2RTkwXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHU0RTJEXHU2M0QwXHU1M0Q2XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XG4gICAgICAgICAgICAgIGNvbnN0IHNyY1BhdGggPSBzb3VyY2VGaWxlLnJlcGxhY2UocmVzb2x2ZShhcHBEaXIsICdzcmMnKSwgJ3NyYycpLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICAgICAgICAgICAgaWYgKHNyY1BhdGguc3RhcnRzV2l0aCgnc3JjLycpKSB7XG4gICAgICAgICAgICAgICAgcmVsYXRpdmVTb3VyY2UgPSBzcmNQYXRoO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjVFMFx1NkNENVx1NjNEMFx1NTNENlx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NEY3Rlx1NzUyOFx1NjU4N1x1NEVGNlx1NTQwRFx1NEY1Q1x1NEUzQSBrZXlcdUZGMDhcdTUzQkJcdTYzODkgYXNzZXRzLyBcdTYyMTYgYXNzZXRzL2xheW91dC8gXHU1MjREXHU3RjAwXHVGRjA5XG4gICAgICAgICAgICAgICAgcmVsYXRpdmVTb3VyY2UgPSBmaWxlTmFtZS5yZXBsYWNlKC9eYXNzZXRzXFwvKGxheW91dFxcLyk/LywgJycpLnJlcGxhY2UoL1xcLmpzJC8sICcnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBcdTc4NkVcdTVCOUFcdTY2MkZcdTU0MjZcdTRFM0FcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcbiAgICAgICAgICAgIGNvbnN0IGlzRW50cnkgPSAoY2h1bmsgYXMgYW55KS5pc0VudHJ5ID09PSB0cnVlIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5pbmNsdWRlcygnaW5kZXgtJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLmluY2x1ZGVzKCdtYWluLScpO1xuXG4gICAgICAgICAgICAvLyBcdTc4NkVcdTVCOUFcdTUyQTBcdThGN0RcdTRGMThcdTUxNDhcdTdFQTdcdUZGMDhcdTc1MjhcdTRFOEVcdTYzOTJcdTVFOEZcdUZGMDlcbiAgICAgICAgICAgIGxldCBwcmlvcml0eSA9IDk5OTtcbiAgICAgICAgICAgIGlmIChmaWxlTmFtZS5pbmNsdWRlcygndmVuZG9yLScpICYmICFmaWxlTmFtZS5pbmNsdWRlcygnZWNoYXJ0cy12ZW5kb3InKSkge1xuICAgICAgICAgICAgICBwcmlvcml0eSA9IDE7IC8vIHZlbmRvciBcdTY3MDBcdTUxNDhcdTUyQTBcdThGN0RcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZmlsZU5hbWUuaW5jbHVkZXMoJ2VjaGFydHMtdmVuZG9yJykpIHtcbiAgICAgICAgICAgICAgcHJpb3JpdHkgPSAyOyAvLyBlY2hhcnRzLXZlbmRvciBcdTUxNzZcdTZCMjFcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZmlsZU5hbWUuaW5jbHVkZXMoJ21lbnUtcmVnaXN0cnknKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5pbmNsdWRlcygnZXBzLXNlcnZpY2UnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5pbmNsdWRlcygnYXV0aC1hcGknKSkge1xuICAgICAgICAgICAgICBwcmlvcml0eSA9IDM7IC8vIFx1NTE3Nlx1NEVENlx1NEY5RFx1OEQ1NlxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc0VudHJ5KSB7XG4gICAgICAgICAgICAgIHByaW9yaXR5ID0gNDsgLy8gXHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XHU2NzAwXHU1NDBFXHU1MkEwXHU4RjdEXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFx1NjNEMFx1NTNENiBpbXBvcnRzXHVGRjA4XHU0RjlEXHU4RDU2XHU3Njg0IGNodW5rIFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOVxuICAgICAgICAgICAgY29uc3QgaW1wb3J0czogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGNodW5rSW1wb3J0cyA9IChjaHVuayBhcyBhbnkpLmltcG9ydHM7XG4gICAgICAgICAgICBpZiAoY2h1bmtJbXBvcnRzICYmIEFycmF5LmlzQXJyYXkoY2h1bmtJbXBvcnRzKSkge1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IGltcG9ydEZpbGVOYW1lIG9mIGNodW5rSW1wb3J0cykge1xuICAgICAgICAgICAgICAgIGlmIChpbXBvcnRGaWxlTmFtZSAmJiB0eXBlb2YgaW1wb3J0RmlsZU5hbWUgPT09ICdzdHJpbmcnICYmIGltcG9ydEZpbGVOYW1lLmVuZHNXaXRoKCcuanMnKSkge1xuICAgICAgICAgICAgICAgICAgaW1wb3J0cy5wdXNoKGltcG9ydEZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1OEMwM1x1OEJENVx1RkYxQVx1OEY5M1x1NTFGQSBpbXBvcnRzIFx1NEZFMVx1NjA2RlxuICAgICAgICAgICAgaWYgKGltcG9ydHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtbWFuaWZlc3QtcGx1Z2luXSAke2ZpbGVOYW1lfSBcdTc2ODQgaW1wb3J0czpgLCBpbXBvcnRzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZmlsZU5hbWVUb0tleU1hcC5zZXQoZmlsZU5hbWUsIHJlbGF0aXZlU291cmNlKTtcbiAgICAgICAgICAgIGFsbENodW5rcy5wdXNoKHtcbiAgICAgICAgICAgICAga2V5OiByZWxhdGl2ZVNvdXJjZSxcbiAgICAgICAgICAgICAgZmlsZTogZmlsZU5hbWUsXG4gICAgICAgICAgICAgIGlzRW50cnksXG4gICAgICAgICAgICAgIHByaW9yaXR5LFxuICAgICAgICAgICAgICBpbXBvcnRzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU2MzA5XHU0RjE4XHU1MTQ4XHU3RUE3XHU2MzkyXHU1RThGXG4gICAgICAgIGFsbENodW5rcy5zb3J0KChhLCBiKSA9PiBhLnByaW9yaXR5IC0gYi5wcmlvcml0eSk7XG5cbiAgICAgICAgLy8gXHU2Nzg0XHU1RUZBXHU2NzAwXHU3RUM4XHU3Njg0IG1hbmlmZXN0IFx1NUJGOVx1OEM2MVx1RkYwQ1x1NUMwNiBpbXBvcnRzIFx1NEUyRFx1NzY4NFx1NjU4N1x1NEVGNlx1NTQwRFx1OEY2Q1x1NjM2Mlx1NEUzQVx1NUJGOVx1NUU5NFx1NzY4NCBrZXlcbiAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBaW1wb3J0cyBcdTRFMkRcdTc2ODRcdTY1ODdcdTRFRjZcdTU0MERcdTUzRUZcdTgwRkRcdTY2MkZcdTY1RTdcdTc2ODRcdUZGMDhcdTU3MjggZ2VuZXJhdGVCdW5kbGUgXHU5NjM2XHU2QkI1XHU3NTFGXHU2MjEwXHU3Njg0XHVGRjA5XHVGRjBDXG4gICAgICAgIC8vIFx1OTcwMFx1ODk4MVx1OTAxQVx1OEZDN1x1NTdGQVx1Nzg0MFx1NTQwRFx1NzlGMFx1NTMzOVx1OTE0RFx1Njc2NVx1NjI3RVx1NTIzMFx1NjVCMFx1NzY4NFx1NjU4N1x1NEVGNlx1NTQwRFxuICAgICAgICBhbGxDaHVua3MuZm9yRWFjaChjaHVuayA9PiB7XG4gICAgICAgICAgY29uc3QgaW1wb3J0S2V5czogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICBpZiAoY2h1bmsuaW1wb3J0cyAmJiBjaHVuay5pbXBvcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaW1wb3J0RmlsZU5hbWUgb2YgY2h1bmsuaW1wb3J0cykge1xuICAgICAgICAgICAgICAvLyBcdTUxNDhcdTVDMURcdThCRDVcdTc2RjRcdTYzQTVcdTUzMzlcdTkxNERcdUZGMDhcdTU5ODJcdTY3OUNcdTY1ODdcdTRFRjZcdTU0MERcdTVERjJcdTdFQ0ZcdTY2MkZcdTY1QjBcdTc2ODRcdUZGMDlcbiAgICAgICAgICAgICAgbGV0IGltcG9ydEtleSA9IGZpbGVOYW1lVG9LZXlNYXAuZ2V0KGltcG9ydEZpbGVOYW1lKTtcblxuICAgICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTc2RjRcdTYzQTVcdTUzMzlcdTkxNERcdTU5MzFcdThEMjVcdUZGMENcdTVDMURcdThCRDVcdTkwMUFcdThGQzdcdTU3RkFcdTc4NDBcdTU0MERcdTc5RjBcdTUzMzlcdTkxNERcdUZGMDhcdTUzQkJcdTYzODkgaGFzaCBcdTU0OEMgYnVpbGRJZFx1RkYwOVxuICAgICAgICAgICAgICBpZiAoIWltcG9ydEtleSkge1xuICAgICAgICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RFx1NTkxQVx1NzlDRFx1NjU4N1x1NEVGNlx1NTQwRFx1NjgzQ1x1NUYwRlx1RkYxQVxuICAgICAgICAgICAgICAgIC8vIDEuIG5hbWUtWC14eHguanMgKFx1NzI3OVx1NkI4QVx1NjgzQ1x1NUYwRlx1RkYwQ1x1NTk4MiBtZW51LXJlZ2lzdHJ5LUItNDgzaHZHLmpzXHVGRjBDXHU0RjE4XHU1MTQ4XHU1MzM5XHU5MTREKVxuICAgICAgICAgICAgICAgIC8vIDIuIG5hbWUtaGFzaC1idWlsZElkLmpzIChcdTU5MUFcdTRFMkEgaGFzaCBcdTZCQjVcdUZGMENoYXNoIFx1ODFGM1x1NUMxMSA4IFx1NEUyQVx1NUI1N1x1N0IyNilcbiAgICAgICAgICAgICAgICAvLyAzLiBuYW1lLWhhc2guanMgKFx1NTM1NVx1NEUyQSBoYXNoIFx1NkJCNVx1RkYwQ2hhc2ggXHU4MUYzXHU1QzExIDggXHU0RTJBXHU1QjU3XHU3QjI2KVxuICAgICAgICAgICAgICAgIC8vIDQuIG5hbWUteHh4LmpzIChcdTdCODBcdTUzNTVcdTY4M0NcdTVGMEZcdUZGMEN4eHggXHU1M0VGXHU4MEZEXHU2NjJGXHU3N0VEIGhhc2gpXG4gICAgICAgICAgICAgICAgbGV0IGJhc2VOYW1lOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIFx1NEYxOFx1NTE0OFx1NUMxRFx1OEJENVx1NTMzOVx1OTE0RFx1NzI3OVx1NkI4QVx1NjgzQ1x1NUYwRlx1RkYwOFx1NTk4MiBtZW51LXJlZ2lzdHJ5LUItNDgzaHZHLmpzXHVGRjA5XG4gICAgICAgICAgICAgICAgLy8gXHU2ODNDXHU1RjBGXHVGRjFBXHU1N0ZBXHU3ODQwXHU1NDBEXHU3OUYwLVx1NTM1NVx1NEUyQVx1NUI1N1x1N0IyNi1cdTU5MUFcdTRFMkFcdTVCNTdcdTdCMjYuanNcbiAgICAgICAgICAgICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUE0ODNodkcgXHU1M0VBXHU2NzA5IDYgXHU0RTJBXHU1QjU3XHU3QjI2XHVGRjBDXHU2MjQwXHU0RUU1XHU0RTBEXHU4MEZEXHU4OTgxXHU2QzQyXHU4MUYzXHU1QzExIDggXHU0RTJBXHU1QjU3XHU3QjI2XG4gICAgICAgICAgICAgICAgY29uc3Qgc3BlY2lhbEhhc2hNYXRjaCA9IGltcG9ydEZpbGVOYW1lLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KS0oW0EtWmEtejAtOV0pLShbYS16QS1aMC05XXs0LH0pXFwuanMkLyk7XG4gICAgICAgICAgICAgICAgaWYgKHNwZWNpYWxIYXNoTWF0Y2ggJiYgc3BlY2lhbEhhc2hNYXRjaFsxXSkge1xuICAgICAgICAgICAgICAgICAgYmFzZU5hbWUgPSBzcGVjaWFsSGFzaE1hdGNoWzFdID8/IG51bGw7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIC8vIFx1NUMxRFx1OEJENVx1NTMzOVx1OTE0RFx1NjgwN1x1NTFDNlx1NjgzQ1x1NUYwRlx1RkYwOFx1NTkxQVx1NEUyQSBoYXNoIFx1NkJCNVx1RkYwOVxuICAgICAgICAgICAgICAgICAgY29uc3QgbXVsdGlIYXNoTWF0Y2ggPSBpbXBvcnRGaWxlTmFtZS5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPykoPzotW2EtekEtWjAtOV17OCx9KSsoPzotW2EtekEtWjAtOV0rKT9cXC5qcyQvKTtcbiAgICAgICAgICAgICAgICAgIGlmIChtdWx0aUhhc2hNYXRjaCAmJiBtdWx0aUhhc2hNYXRjaFsxXSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlTmFtZSA9IG11bHRpSGFzaE1hdGNoWzFdID8/IG51bGw7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBcdTVDMURcdThCRDVcdTUzMzlcdTkxNERcdTUzNTVcdTRFMkEgaGFzaCBcdTZCQjVcdUZGMDhcdTgxRjNcdTVDMTEgOCBcdTRFMkFcdTVCNTdcdTdCMjZcdUZGMDlcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2luZ2xlSGFzaE1hdGNoID0gaW1wb3J0RmlsZU5hbWUubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pLShbYS16QS1aMC05XXs4LH0pXFwuanMkLyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzaW5nbGVIYXNoTWF0Y2ggJiYgc2luZ2xlSGFzaE1hdGNoWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgYmFzZU5hbWUgPSBzaW5nbGVIYXNoTWF0Y2hbMV0gPz8gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBcdTVDMURcdThCRDVcdTUzMzlcdTkxNERcdTdCODBcdTUzNTVcdTY4M0NcdTVGMEZcdUZGMDhcdTYzRDBcdTUzRDZcdTU3RkFcdTc4NDBcdTU0MERcdTc5RjBcdUZGMENcdTUzQkJcdTYzODlcdTY3MDBcdTU0MEVcdTRFMDBcdTRFMkEgaGFzaCBcdTZCQjVcdUZGMDlcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzaW1wbGVNYXRjaCA9IGltcG9ydEZpbGVOYW1lLm1hdGNoKC9eKFteLV0rKD86LVteLV0rKSo/KS0oW2EtekEtWjAtOV0rKVxcLmpzJC8pO1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChzaW1wbGVNYXRjaCAmJiBzaW1wbGVNYXRjaFsxXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZU5hbWUgPSBzaW1wbGVNYXRjaFsxXSA/PyBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChiYXNlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgLy8gXHU1NzI4XHU2MjQwXHU2NzA5IGNodW5rIFx1NEUyRFx1NjdFNVx1NjI3RVx1NTMzOVx1OTE0RFx1NzY4NFx1NTdGQVx1Nzg0MFx1NTQwRFx1NzlGMFxuICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBbYWN0dWFsRmlsZU5hbWUsIGFjdHVhbEtleV0gb2YgZmlsZU5hbWVUb0tleU1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gXHU1MzM5XHU5MTREXHU1QjlFXHU5NjQ1XHU2NTg3XHU0RUY2XHU1NDBEXHU2ODNDXHU1RjBGXHVGRjA4XHU1M0VGXHU4MEZEXHU1MzA1XHU1NDJCXHU2NUY2XHU5NUY0XHU2MjMzXHVGRjA5XG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3R1YWxCYXNlTmFtZTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gXHU1MTQ4XHU1QzFEXHU4QkQ1XHU1MzM5XHU5MTREXHU3Mjc5XHU2QjhBXHU2ODNDXHU1RjBGXHVGRjA4XHU1OTgyIG1lbnUtcmVnaXN0cnktQi00ODNodkctbWoybXR1NDYuanNcdUZGMDlcbiAgICAgICAgICAgICAgICAgICAgLy8gXHU2ODNDXHU1RjBGXHVGRjFBXHU1N0ZBXHU3ODQwXHU1NDBEXHU3OUYwLVx1NTM1NVx1NEUyQVx1NUI1N1x1N0IyNi1cdTU5MUFcdTRFMkFcdTVCNTdcdTdCMjYtXHU2NUY2XHU5NUY0XHU2MjMzLmpzXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFjdHVhbFNwZWNpYWxIYXNoTWF0Y2ggPSBhY3R1YWxGaWxlTmFtZS5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPyktKFtBLVphLXowLTldKS0oW2EtekEtWjAtOV17NCx9KSg/Oi1bYS16QS1aMC05XSspP1xcLmpzJC8pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0dWFsU3BlY2lhbEhhc2hNYXRjaCAmJiBhY3R1YWxTcGVjaWFsSGFzaE1hdGNoWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgYWN0dWFsQmFzZU5hbWUgPSBhY3R1YWxTcGVjaWFsSGFzaE1hdGNoWzFdID8/IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0dWFsTXVsdGlIYXNoTWF0Y2ggPSBhY3R1YWxGaWxlTmFtZS5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPykoPzotW2EtekEtWjAtOV17OCx9KSsoPzotW2EtekEtWjAtOV0rKT9cXC5qcyQvKTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoYWN0dWFsTXVsdGlIYXNoTWF0Y2ggJiYgYWN0dWFsTXVsdGlIYXNoTWF0Y2hbMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbEJhc2VOYW1lID0gYWN0dWFsTXVsdGlIYXNoTWF0Y2hbMV0gPz8gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0dWFsU2luZ2xlSGFzaE1hdGNoID0gYWN0dWFsRmlsZU5hbWUubWF0Y2goL14oW14tXSsoPzotW14tXSspKj8pLShbYS16QS1aMC05XXs4LH0pXFwuanMkLyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWN0dWFsU2luZ2xlSGFzaE1hdGNoICYmIGFjdHVhbFNpbmdsZUhhc2hNYXRjaFsxXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBhY3R1YWxCYXNlTmFtZSA9IGFjdHVhbFNpbmdsZUhhc2hNYXRjaFsxXSA/PyBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0dWFsU2ltcGxlTWF0Y2ggPSBhY3R1YWxGaWxlTmFtZS5tYXRjaCgvXihbXi1dKyg/Oi1bXi1dKykqPyktKFthLXpBLVowLTldKykoPzotW2EtekEtWjAtOV0rKT9cXC5qcyQvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFjdHVhbFNpbXBsZU1hdGNoICYmIGFjdHVhbFNpbXBsZU1hdGNoWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0dWFsQmFzZU5hbWUgPSBhY3R1YWxTaW1wbGVNYXRjaFsxXSA/PyBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdHVhbEJhc2VOYW1lICYmIGFjdHVhbEJhc2VOYW1lID09PSBiYXNlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgIGltcG9ydEtleSA9IGFjdHVhbEtleTtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtbWFuaWZlc3QtcGx1Z2luXSBcdTkwMUFcdThGQzdcdTU3RkFcdTc4NDBcdTU0MERcdTc5RjBcdTUzMzlcdTkxNERcdTYyN0VcdTUyMzAgaW1wb3J0czogJHtpbXBvcnRGaWxlTmFtZX0gLT4gJHthY3R1YWxGaWxlTmFtZX0gKGtleTogJHthY3R1YWxLZXl9KWApO1xuICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NEVDRFx1NzEzNlx1NkNBMVx1NjcwOVx1NjI3RVx1NTIzMFx1RkYwQ1x1OEY5M1x1NTFGQVx1OEMwM1x1OEJENVx1NEZFMVx1NjA2RlxuICAgICAgICAgICAgICAgICAgaWYgKCFpbXBvcnRLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbZW5zdXJlLW1hbmlmZXN0LXBsdWdpbl0gXHUyNkEwXHVGRTBGICBcdTY1RTBcdTZDRDVcdTYyN0VcdTUyMzAgaW1wb3J0cyBcdTVCRjlcdTVFOTRcdTc2ODRcdTY1ODdcdTRFRjY6ICR7aW1wb3J0RmlsZU5hbWV9IChcdTU3RkFcdTc4NDBcdTU0MERcdTc5RjA6ICR7YmFzZU5hbWV9KWApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtlbnN1cmUtbWFuaWZlc3QtcGx1Z2luXSBcdTI2QTBcdUZFMEYgIFx1NjVFMFx1NkNENVx1ODlFM1x1Njc5MFx1NjU4N1x1NEVGNlx1NTQwRFx1NjgzQ1x1NUYwRjogJHtpbXBvcnRGaWxlTmFtZX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoaW1wb3J0S2V5KSB7XG4gICAgICAgICAgICAgICAgaW1wb3J0S2V5cy5wdXNoKGltcG9ydEtleSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbZW5zdXJlLW1hbmlmZXN0LXBsdWdpbl0gXHUyNkEwXHVGRTBGICBcdTY1RTBcdTZDRDVcdTYyN0VcdTUyMzAgaW1wb3J0cyBcdTVCRjlcdTVFOTRcdTc2ODRcdTY1ODdcdTRFRjY6ICR7aW1wb3J0RmlsZU5hbWV9YCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBtYW5pZmVzdFtjaHVuay5rZXldID0ge1xuICAgICAgICAgICAgZmlsZTogY2h1bmsuZmlsZSxcbiAgICAgICAgICAgIHNyYzogY2h1bmsua2V5LFxuICAgICAgICAgICAgaXNFbnRyeTogY2h1bmsuaXNFbnRyeSxcbiAgICAgICAgICAgIC4uLihpbXBvcnRLZXlzLmxlbmd0aCA+IDAgPyB7IGltcG9ydHM6IGltcG9ydEtleXMgfSA6IHt9KSxcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDlcdTYyN0VcdTUyMzBcdTRFRkJcdTRGNTUgY2h1bmtcdUZGMENcdTRGN0ZcdTc1MjhcdTU2REVcdTkwMDBcdTkwM0JcdThGOTFcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKG1hbmlmZXN0KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBjb25zdCBmaXJzdENodW5rID0gT2JqZWN0LmVudHJpZXMoYnVuZGxlKS5maW5kKChbXywgY2h1bmtdKSA9PiAoY2h1bmsgYXMgYW55KS50eXBlID09PSAnY2h1bmsnKTtcbiAgICAgICAgICBpZiAoZmlyc3RDaHVuaykge1xuICAgICAgICAgICAgbWFuaWZlc3RbJ3NyYy9tYWluLnRzJ10gPSB7XG4gICAgICAgICAgICAgIGZpbGU6IGZpcnN0Q2h1bmtbMF0sXG4gICAgICAgICAgICAgIHNyYzogJ3NyYy9tYWluLnRzJyxcbiAgICAgICAgICAgICAgaXNFbnRyeTogdHJ1ZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU1MTk5XHU1MTY1IG1hbmlmZXN0Lmpzb24gXHU2NTg3XHU0RUY2XG4gICAgICAgIGNvbnN0IG1hbmlmZXN0UGF0aCA9IHJlc29sdmUoYXBwRGlyLCAnZGlzdCcsICdtYW5pZmVzdC5qc29uJyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgd3JpdGVGaWxlU3luYyhtYW5pZmVzdFBhdGgsIEpTT04uc3RyaW5naWZ5KG1hbmlmZXN0LCBudWxsLCAyKSwgJ3V0Zi04Jyk7XG4gICAgICAgICAgY29uc29sZS5pbmZvKGBbZW5zdXJlLW1hbmlmZXN0LXBsdWdpbl0gXHUyNzA1IFx1NURGMlx1NzUxRlx1NjIxMCBtYW5pZmVzdC5qc29uXHVGRjBDXHU1MzA1XHU1NDJCICR7T2JqZWN0LmtleXMobWFuaWZlc3QpLmxlbmd0aH0gXHU0RTJBIGNodW5rYCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1tlbnN1cmUtbWFuaWZlc3QtcGx1Z2luXSBcdTI2QTBcdUZFMEYgIFx1NjVFMFx1NkNENVx1NTE5OVx1NTE2NSBtYW5pZmVzdC5qc29uOicsIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0gYXMgUGx1Z2luLFxuICAgIC8vIDE3LiBDRE4gXHU0RTBBXHU0RjIwXHU2M0QyXHU0RUY2XHVGRjA4XHU0RUM1XHU1NzI4XHU3NTFGXHU0RUE3XHU2Nzg0XHU1RUZBXHU0RTE0XHU1NDJGXHU3NTI4XHU2NUY2XHVGRjA5XG4gICAgLi4uKHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fVVBMT0FEID09PSAndHJ1ZScgJiYgcHJvY2Vzcy5lbnYuVklURV9QUkVWSUVXICE9PSAndHJ1ZSdcbiAgICAgID8gW3VwbG9hZENkblBsdWdpbihhcHBOYW1lLCBhcHBEaXIpXVxuICAgICAgOiBbXSksXG4gIF07XG5cbiAgLy8gXHU2Nzg0XHU1RUZBXHU5MTREXHU3RjZFXG4gIGNvbnN0IGJ1aWxkQ29uZmlnOiBVc2VyQ29uZmlnWydidWlsZCddID0ge1xuICAgIHRhcmdldDogJ2VzMjAyMCcsXG4gICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICBjc3NDb2RlU3BsaXQ6IGZhbHNlLFxuICAgIGNzc01pbmlmeTogdHJ1ZSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc5ODFcdTc1MjhcdTRFRTNcdTc4MDFcdTUzOEJcdTdGMjlcdUZGMENcdTkwN0ZcdTUxNEQgVGVyc2VyIFx1NTM4Qlx1N0YyOVx1NUJGQ1x1ODFGNFx1NzY4NFx1NUJGOVx1OEM2MVx1NUM1RVx1NjAyN1x1NTIwNlx1OTY5NFx1N0IyNlx1NEUyMlx1NTkzMVx1OTVFRVx1OTg5OFxuICAgIG1pbmlmeTogZmFsc2UsXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDAsXG4gICAgb3V0RGlyOiBwcm9jZXNzLmVudi5CVUlMRF9PVVRfRElSIHx8ICdkaXN0JyxcbiAgICBhc3NldHNEaXI6ICdhc3NldHMnLFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTQyRlx1NzUyOCBtYW5pZmVzdCBcdTY1ODdcdTRFRjZcdTc1MUZcdTYyMTBcdUZGMENcdTc1MjhcdTRFOEVcdTUyQThcdTYwMDFcdTUyQTBcdThGN0RcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcbiAgICBtYW5pZmVzdDogdHJ1ZSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc5ODFcdTc1MjggVml0ZSBcdTc2ODRcdTgxRUFcdTUyQThcdTZFMDVcdTc0MDZcdUZGMENcdTU2RTBcdTRFM0FcdTYyMTFcdTRFRUNcdTVERjJcdTdFQ0ZcdTY3MDkgY2xlYW5EaXN0UGx1Z2luIFx1NTcyOFx1Njc4NFx1NUVGQVx1NTI0RFx1NkUwNVx1NzQwNlxuICAgIC8vIFx1OEZEOVx1NjgzN1x1NTNFRlx1NEVFNVx1OTA3Rlx1NTE0RCBXaW5kb3dzIFx1NEUwQVx1NzY4NFx1NjU4N1x1NEVGNlx1OTUwMVx1NUI5QVx1OTVFRVx1OTg5OFx1RkYwOEVCVVNZXHVGRjA5XG4gICAgLy8gY2xlYW5EaXN0UGx1Z2luIFx1NURGMlx1N0VDRlx1NjcwOVx1OTFDRFx1OEJENVx1NjczQVx1NTIzNlx1RkYwODVcdTZCMjFcdUZGMENcdTkwMTJcdTU4OUVcdTdCNDlcdTVGODVcdTY1RjZcdTk1RjRcdUZGMDlcdUZGMENcdTU5ODJcdTY3OUNcdTZFMDVcdTc0MDZcdTU5MzFcdThEMjVcdTRGMUFcdTdFRTdcdTdFRURcdTY3ODRcdTVFRkFcbiAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU5ODJcdTY3OUNcdTZFMDVcdTc0MDZcdTU5MzFcdThEMjVcdUZGMENcdTY1RTdcdTc2ODRcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTRFMERcdTRGMUFcdTg4QUJcdTUyMjBcdTk2NjRcdUZGMENcdTUzRUZcdTgwRkRcdTVCRkNcdTgxRjRcdTkxQ0RcdTU5MERcdTY1ODdcdTRFRjZcbiAgICBlbXB0eU91dERpcjogZmFsc2UsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgcHJlc2VydmVFbnRyeVNpZ25hdHVyZXM6ICdzdHJpY3QnLFxuICAgICAgb253YXJuKHdhcm5pbmc6IGFueSwgd2FybjogKHdhcm5pbmc6IGFueSkgPT4gdm9pZCkge1xuICAgICAgICBpZiAod2FybmluZy5jb2RlID09PSAnTU9EVUxFX0xFVkVMX0RJUkVDVElWRScgfHxcbiAgICAgICAgICAgICh3YXJuaW5nLm1lc3NhZ2UgJiYgdHlwZW9mIHdhcm5pbmcubWVzc2FnZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICB3YXJuaW5nLm1lc3NhZ2UuaW5jbHVkZXMoJ2R5bmFtaWNhbGx5IGltcG9ydGVkJykgJiZcbiAgICAgICAgICAgICB3YXJuaW5nLm1lc3NhZ2UuaW5jbHVkZXMoJ3N0YXRpY2FsbHkgaW1wb3J0ZWQnKSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHdhcm5pbmcubWVzc2FnZSAmJiB0eXBlb2Ygd2FybmluZy5tZXNzYWdlID09PSAnc3RyaW5nJyAmJiB3YXJuaW5nLm1lc3NhZ2UuaW5jbHVkZXMoJ0dlbmVyYXRlZCBhbiBlbXB0eSBjaHVuaycpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHdhcm4od2FybmluZyk7XG4gICAgICB9LFxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBbGF5b3V0LWFwcCBcdTRGNUNcdTRFM0FcdTRFM0JcdTVFOTRcdTc1MjhcdUZGMENcdTk3MDBcdTg5ODFcdTYyNTNcdTUzMDUgc2luZ2xlLXNwYSBcdTU0OEMgcWlhbmt1blxuICAgICAgLy8gXHU0RTBEXHU1QzA2XHU1QjgzXHU0RUVDXHU2ODA3XHU4QkIwXHU0RTNBIGV4dGVybmFsXHVGRjBDXHU3ODZFXHU0RkREXHU1QjgzXHU0RUVDXHU4OEFCXHU2MjUzXHU1MzA1XHU1MjMwXHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU0RTJEXG4gICAgICBleHRlcm5hbDogW1xuICAgICAgICAvLyB2aXRlLXBsdWdpbiBcdTY2MkZcdTY3ODRcdTVFRkFcdTY1RjZcdTYzRDJcdTRFRjZcdUZGMENcdTRFMERcdTVFOTRcdThCRTVcdTg4QUJcdTYyNTNcdTUzMDVcdTUyMzBcdThGRDBcdTg4NENcdTY1RjZcdTRFRTNcdTc4MDFcdTRFMkRcbiAgICAgICAgJ0BidGMvdml0ZS1wbHVnaW4nLFxuICAgICAgICAvXkBidGNcXC92aXRlLXBsdWdpbi8sXG4gICAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQXNpbmdsZS1zcGEgXHU1NDhDIHFpYW5rdW4gXHU0RTBEXHU1NzI4XHU4RkQ5XHU5MUNDXHVGRjBDXHU1QjgzXHU0RUVDXHU0RjFBXHU4OEFCXHU2MjUzXHU1MzA1XG4gICAgICBdLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGZvcm1hdDogJ2VzbScsXG4gICAgICAgIGlubGluZUR5bmFtaWNJbXBvcnRzOiBmYWxzZSxcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTUxNDhcdTU5MDRcdTc0MDYgVnVlIFx1NjgzOFx1NUZDM1x1NEY5RFx1OEQ1Nlx1RkYwQ1x1Nzg2RVx1NEZERCB2ZW5kb3IgY2h1bmsgXHU1NzI4IGVjaGFydHMtdmVuZG9yIFx1NEU0Qlx1NTI0RFx1NTJBMFx1OEY3RFxuICAgICAgICAgIC8vIFx1OEZEOVx1NjgzN1x1NTNFRlx1NEVFNVx1OTA3Rlx1NTE0RCBlY2hhcnRzLXZlbmRvciBcdTU3MjggdmVuZG9yIFx1NEU0Qlx1NTI0RFx1NTJBMFx1OEY3RFx1NUJGQ1x1ODFGNFx1NzY4NFx1NkEyMVx1NTc1N1x1NTIxRFx1NTlDQlx1NTMxNlx1OTg3QVx1NUU4Rlx1OTVFRVx1OTg5OFxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3Z1ZScpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvdnVlLXJvdXRlcicpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZWxlbWVudC1wbHVzJykgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9waW5pYScpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQHZ1ZXVzZScpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQGVsZW1lbnQtcGx1cycpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZGF5anMnKSB8fFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2xvZGFzaCcpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQHZ1ZScpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdwYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cycpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdwYWNrYWdlcy9zaGFyZWQtY29yZScpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdwYWNrYWdlcy9zaGFyZWQtdXRpbHMnKSkge1xuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3InO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUF2dWUtZWNoYXJ0cyBcdTRGOURcdThENTZcdTRFOEUgVnVlXHVGRjBDXHU2MjQwXHU0RUU1XHU1RTk0XHU4QkU1XHU2NTNFXHU1NzI4IHZlbmRvciBcdTRFNEJcdTU0MEVcdTU5MDRcdTc0MDZcbiAgICAgICAgICAvLyBcdTRGNDZcdTRFM0FcdTRFODZcdTRGRERcdTYzMDFcdTUyMDZcdTc5QkJcdUZGMENcdTYyMTFcdTRFRUNcdTRFQ0RcdTcxMzZcdTVDMDZcdTUxNzZcdTY1M0VcdTU3MjggZWNoYXJ0cy12ZW5kb3IgXHU0RTJEXG4gICAgICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU4RkQ5XHU4OTgxXHU2QzQyIHZlbmRvciBcdTU3MjggZWNoYXJ0cy12ZW5kb3IgXHU0RTRCXHU1MjREXHU1MkEwXHU4RjdEXHVGRjA4XHU5MDFBXHU4RkM3IEhUTUwgXHU0RTJEXHU3Njg0XHU5ODdBXHU1RThGXHU0RkREXHU4QkMxXHVGRjA5XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZWNoYXJ0cycpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvenJlbmRlcicpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvdnVlLWVjaGFydHMnKSkge1xuICAgICAgICAgICAgcmV0dXJuICdlY2hhcnRzLXZlbmRvcic7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygndmlydHVhbDplcHMnKSB8fFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcygnXFxcXDB2aXJ0dWFsOmVwcycpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdzZXJ2aWNlcy9lcHMnKSB8fFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcygnc2VydmljZXNcXFxcZXBzJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnZXBzLXNlcnZpY2UnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL3N1YmFwcC1tYW5pZmVzdHMnKSB8fFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcygncGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL3N0b3JlL21lbnVSZWdpc3RyeScpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdjb25maWdzL2xheW91dC1icmlkZ2UnKSB8fFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcygnQGJ0Yy9zdWJhcHAtbWFuaWZlc3RzJykgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ0BidGMvc2hhcmVkLWNvcmUvY29uZmlncy9sYXlvdXQtYnJpZGdlJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnbWVudS1yZWdpc3RyeSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL21vbmFjby1lZGl0b3InKSkge1xuICAgICAgICAgICAgcmV0dXJuICdsaWItbW9uYWNvJztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvdGhyZWUnKSkge1xuICAgICAgICAgICAgcmV0dXJuICdsaWItdGhyZWUnO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9LFxuICAgICAgICBwcmVzZXJ2ZU1vZHVsZXM6IGZhbHNlLFxuICAgICAgICBnZW5lcmF0ZWRDb2RlOiB7XG4gICAgICAgICAgY29uc3RCaW5kaW5nczogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIFx1NUUwM1x1NUM0MFx1NUU5NFx1NzUyOFx1NEY3Rlx1NzUyOCBhc3NldHMvbGF5b3V0LyBcdTc2RUVcdTVGNTVcdUZGMENcdTRFMEVcdTVCNTBcdTVFOTRcdTc1MjhcdTc2ODQgYXNzZXRzLyBcdTc2RUVcdTVGNTVcdTUzM0FcdTUyMDZcdTVGMDBcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvbGF5b3V0L1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFsYXlvdXQtYXBwIFx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlx1NEY3Rlx1NzUyOFx1N0EzM1x1NUI5QVx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwQ1x1OTA3Rlx1NTE0RFx1NjVFNyBpbmRleC5odG1sL1x1NjVFN1x1NUYxNVx1NzUyOFx1NUJGQ1x1ODFGNFx1NzY4NCBpbmRleC14eHguanMgNDA0XG4gICAgICAgIC8vIFx1OTE0RFx1NTQwOCBOZ2lueFx1RkYxQWFzc2V0cy9sYXlvdXQvaW5kZXguanMgXHU4QkJFXHU3RjZFIG5vLWNhY2hlXHVGRjFCXHU1MTc2XHU0RjU5IGhhc2ggXHU2NTg3XHU0RUY2IGltbXV0YWJsZVxuICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9sYXlvdXQvW25hbWVdLmpzJyxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm86IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChhc3NldEluZm8ubmFtZT8uZW5kc1dpdGgoJy5jc3MnKSkge1xuICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvbGF5b3V0L1tuYW1lXS1baGFzaF0uY3NzJztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuICdhc3NldHMvbGF5b3V0L1tuYW1lXS1baGFzaF0uW2V4dF0nO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIC4uLmN1c3RvbUJ1aWxkLFxuICB9O1xuXG4gIC8vIFx1NjcwRFx1NTJBMVx1NTY2OFx1OTE0RFx1N0Y2RVxuICBjb25zdCBzZXJ2ZXJDb25maWc6IFVzZXJDb25maWdbJ3NlcnZlciddID0ge1xuICAgIHBvcnQ6IGFwcENvbmZpZy5kZXZQb3J0LFxuICAgIGhvc3Q6IGFwcENvbmZpZy5kZXZIb3N0LFxuICAgIHN0cmljdFBvcnQ6IHRydWUsXG4gICAgb3BlbjogZmFsc2UsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCxPUFRJT05TJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscyc6ICd0cnVlJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZScsXG4gICAgfSxcbiAgICBmczoge1xuICAgICAgYWxsb3c6IFtcbiAgICAgICAgcmVzb2x2ZShhcHBEaXIsICcuLicpLFxuICAgICAgICByZXNvbHZlKGFwcERpciwgJy4uL3N5c3RlbS1hcHAnKSxcbiAgICAgICAgcmVzb2x2ZShhcHBEaXIsICcuLi8uLi8nKSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICAuLi5jdXN0b21TZXJ2ZXIsXG4gIH07XG5cbiAgLy8gXHU5ODg0XHU4OUM4XHU2NzBEXHU1MkExXHU1NjY4XHU5MTREXHU3RjZFXG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1OTg4NFx1ODlDOFx1NjcwRFx1NTJBMVx1NTY2OFx1NEVDRVx1NjgzOVx1NzZFRVx1NUY1NVx1NzY4NCBkaXN0L3twcm9kSG9zdH0gXHU4QkZCXHU1M0Q2XHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHVGRjBDXHU4MDBDXHU0RTBEXHU2NjJGXHU0RUNFIGFwcHMve2FwcE5hbWV9L2Rpc3QgXHU4QkZCXHU1M0Q2XG4gIGNvbnN0IHJvb3REaXN0RGlyID0gcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9kaXN0Jyk7XG4gIGNvbnN0IHByZXZpZXdSb290ID0gcmVzb2x2ZShyb290RGlzdERpciwgYXBwQ29uZmlnLnByb2RIb3N0KTtcblxuICBjb25zdCBwcmV2aWV3Q29uZmlnOiBVc2VyQ29uZmlnWydwcmV2aWV3J10gPSB7XG4gICAgcG9ydDogYXBwQ29uZmlnLnByZVBvcnQsXG4gICAgaG9zdDogYXBwQ29uZmlnLnByZUhvc3QsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICBvcGVuOiBmYWxzZSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdThCQkVcdTdGNkVcdTk4ODRcdTg5QzhcdTY3MERcdTUyQTFcdTU2NjhcdTc2ODRcdTY4MzlcdTc2RUVcdTVGNTVcdTRFM0EgZGlzdC97cHJvZEhvc3R9XG4gICAgcm9vdDogcHJldmlld1Jvb3QsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCxPUFRJT05TJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscyc6ICd0cnVlJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZScsXG4gICAgfSxcbiAgICAuLi5jdXN0b21QcmV2aWV3LFxuICB9O1xuXG4gIC8vIENTUyBcdTkxNERcdTdGNkVcbiAgY29uc3QgY3NzQ29uZmlnOiBVc2VyQ29uZmlnWydjc3MnXSA9IHtcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICBzY3NzOiB7XG4gICAgICAgIGFwaTogJ21vZGVybi1jb21waWxlcicsXG4gICAgICAgIHNpbGVuY2VEZXByZWNhdGlvbnM6IFsnbGVnYWN5LWpzLWFwaScsICdpbXBvcnQnXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICAuLi5jdXN0b21Dc3MsXG4gIH07XG5cbiAgLy8gXHU0RjE4XHU1MzE2XHU0RjlEXHU4RDU2XHU5MTREXHU3RjZFXG4gIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NkJDRlx1NEUyQVx1NUU5NFx1NzUyOFx1NEY3Rlx1NzUyOFx1NzJFQ1x1N0FDQlx1NzY4NFx1N0YxM1x1NUI1OFx1NzZFRVx1NUY1NVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NEUwRFx1NTQwQ1x1NUU5NFx1NzUyOFx1NzY4NFx1OTE0RFx1N0Y2RVx1NURFRVx1NUYwMlx1NUJGQ1x1ODFGNFx1N0YxM1x1NUI1OFx1NTFCMlx1N0E4MVxuICBjb25zdCBhcHBDYWNoZURpciA9IHJlc29sdmUoYXBwRGlyLCAnbm9kZV9tb2R1bGVzLy52aXRlJyk7XG5cbiAgY29uc3Qgb3B0aW1pemVEZXBzQ29uZmlnOiBVc2VyQ29uZmlnWydvcHRpbWl6ZURlcHMnXSA9IHtcbiAgICBpbmNsdWRlOiBbXG4gICAgICAvLyBcdTY4MzhcdTVGQzNcdTRGOURcdThENTZcdUZGMUFcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTVCODlcdTg4QzVcdTc2ODRcdTRGOURcdThENTZcbiAgICAgICd2dWUnLFxuICAgICAgJ3Z1ZS1yb3V0ZXInLFxuICAgICAgJ3BpbmlhJyxcbiAgICAgICdlbGVtZW50LXBsdXMnLFxuICAgICAgLy8gV2luc3RvbiBcdTk3MDBcdTg5ODFcdTc2ODQgTm9kZS5qcyBcdTZBMjFcdTU3NTcgcG9seWZpbGxcbiAgICAgICd1dGlsJyxcbiAgICAgICdlbGVtZW50LXBsdXMvZXMnLFxuICAgICAgJ2VsZW1lbnQtcGx1cy9lcy9sb2NhbGUvbGFuZy96aC1jbicsXG4gICAgICAnZWxlbWVudC1wbHVzL2VzL2xvY2FsZS9sYW5nL2VuJyxcbiAgICAgICdAZWxlbWVudC1wbHVzL2ljb25zLXZ1ZScsXG4gICAgICAnQGJ0Yy9zaGFyZWQtY29yZScsXG4gICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFAYnRjL3NoYXJlZC1jb21wb25lbnRzIFx1NURGMlx1NEVDRSBpbmNsdWRlIFx1NEUyRFx1NzlGQlx1OTY2NFx1RkYwQ1x1NTZFMFx1NEUzQVx1NUI4M1x1NTMwNVx1NTQyQiBUU1ggXHU2NTg3XHU0RUY2XG4gICAgICAvLyBcdTU3MjhcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFMkRcdUZGMENcdTVFOTRcdThCRTVcdTc2RjRcdTYzQTVcdTRFQ0VcdTZFOTBcdTc4MDFcdTVCRkNcdTUxNjVcdUZGMENcdTgwMENcdTRFMERcdTY2MkZcdTk4ODRcdTY3ODRcdTVFRkFcbiAgICAgIC8vICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJyxcbiAgICAgICdAYnRjL3NoYXJlZC11dGlscycsXG4gICAgICAnQGJ0Yy9zdWJhcHAtbWFuaWZlc3RzJyxcbiAgICAgICd2aXRlLXBsdWdpbi1xaWFua3VuL2Rpc3QvaGVscGVyJyxcbiAgICAgICdxaWFua3VuJyxcbiAgICAgICdAdnVldXNlL2NvcmUnLFxuICAgICAgLy8gbGF5b3V0LWFwcCBcdTVCOUVcdTk2NDVcdTVCODlcdTg4QzVcdTc2ODRcdTRGOURcdThENTZcbiAgICAgICd2dWUtaTE4bicsXG4gICAgICAnYXhpb3MnLFxuICAgICAgJ2VjaGFydHMnLFxuICAgICAgJ3Z1ZS1lY2hhcnRzJyxcbiAgICAgICdtaXR0JyxcbiAgICAgICducHJvZ3Jlc3MnLFxuICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBbHVuciBcdTU0OEMgZmlsZS1zYXZlciBcdTRFMERcdTY2MkZcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTVCODlcdTg4QzVcdUZGMENcdTRFMERcdTVFOTRcdThCRTVcdTU3MjggaW5jbHVkZSBcdTRFMkRcdTVGM0FcdTUyMzZcdTU4RjBcdTY2MEVcbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NUU5NFx1NzUyOFx1NUI4OVx1ODhDNVx1NEU4Nlx1OEZEOVx1NEU5Qlx1NEY5RFx1OEQ1Nlx1RkYwQ1ZpdGUgXHU0RjFBXHU1NzI4XHU2MjZCXHU2M0NGIGVudHJpZXMgXHU2NUY2XHU4MUVBXHU1MkE4XHU1M0QxXHU3M0IwXHU1RTc2XHU0RjE4XHU1MzE2XG4gICAgICAvLyAnbHVucicsIC8vIFx1NTNFQVx1NTcyOCBzaGFyZWQtY29tcG9uZW50cyBcdTRFMkRcdTRGN0ZcdTc1MjhcdUZGMENcdTRFMERcdTY2MkZcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTVCODlcdTg4QzVcbiAgICAgIC8vICdmaWxlLXNhdmVyJywgLy8gXHU1M0VBXHU1NzI4XHU5MEU4XHU1MjA2XHU1RTk0XHU3NTI4XHU0RTJEXHU0RjdGXHU3NTI4XHVGRjBDXHU0RTBEXHU2NjJGXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU1Qjg5XHU4OEM1XG4gICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTRFRTVcdTRFMEJcdTRGOURcdThENTZcdTRFMERcdTY2MkZcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTkwRkRcdTc2RjRcdTYzQTVcdTVCODlcdTg4QzVcdUZGMENcdTVCODNcdTRFRUNcdTkwMUFcdThGQzcgQGJ0Yy9zaGFyZWQtY29tcG9uZW50cyBcdTk1RjRcdTYzQTVcdTRGN0ZcdTc1MjhcbiAgICAgIC8vIFZpdGUgXHU0RjFBXHU1NzI4XHU4RkQwXHU4ODRDXHU2NUY2XHU4MUVBXHU1MkE4XHU1M0QxXHU3M0IwXHU1RTc2XHU0RjE4XHU1MzE2XHU4RkQ5XHU0RTlCXHU0RjlEXHU4RDU2XHVGRjBDXHU0RTBEXHU5NzAwXHU4OTgxXHU1NzI4IGluY2x1ZGUgXHU0RTJEXHU2NjNFXHU1RjBGXHU1OEYwXHU2NjBFXG4gICAgXSxcbiAgICBleGNsdWRlOiBbXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MvbGF5b3V0LWJyaWRnZSBcdTY2MkZcdTY3MkNcdTU3MzBcdTUyMkJcdTU0MERcdThERUZcdTVGODRcdUZGMENcdTRFMERcdTY2MkYgbnBtIFx1NTMwNVx1RkYwQ1x1NEUwRFx1NUU5NFx1OEJFNVx1ODhBQlx1NEYxOFx1NTMxNlxuICAgICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBZXhjbHVkZSBcdTUzRUFcdTY1MkZcdTYzMDFcdTVCNTdcdTdCMjZcdTRFMzJcdTZBMjFcdTVGMEZcdUZGMENcdTRFMERcdTY1MkZcdTYzMDFcdTZCNjNcdTUyMTlcdTg4NjhcdThGQkVcdTVGMEZcbiAgICAgICdAYnRjL3NoYXJlZC1jb3JlL2NvbmZpZ3MvbGF5b3V0LWJyaWRnZScsXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTYzOTJcdTk2NjQgQGJ0Yy9zaGFyZWQtY29tcG9uZW50c1x1RkYwQ1x1NTZFMFx1NEUzQVx1NUI4M1x1NjYyRlx1NjcyQ1x1NTczMFx1NTMwNVx1RkYwQ1x1NTMwNVx1NTQyQiBUU1ggXHU2NTg3XHU0RUY2XG4gICAgICAvLyBcdTU3MjhcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFMkRcdUZGMENcdTVFOTRcdThCRTVcdTc2RjRcdTYzQTVcdTRFQ0VcdTZFOTBcdTc4MDFcdTVCRkNcdTUxNjVcdUZGMENcdTgwMENcdTRFMERcdTY2MkZcdTk4ODRcdTY3ODRcdTVFRkFcbiAgICAgIC8vIFx1OEZEOVx1NjgzN1x1NTNFRlx1NEVFNVx1OTA3Rlx1NTE0RCBKU1ggXHU4OUUzXHU2NzkwXHU5NUVFXHU5ODk4XG4gICAgICAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cycsXG4gICAgXSxcbiAgICBmb3JjZTogZmFsc2UsXG4gICAgLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU0RTBEXHU1MThEXHU1MzA1XHU1NDJCIHNoYXJlZC1jb21wb25lbnRzL3NyYy9pbmRleC50c1x1RkYwQ1x1NTZFMFx1NEUzQVx1NUI4M1x1NTMwNVx1NTQyQiBUU1ggXHU2NTg3XHU0RUY2XHVGRjBDXHU1RTk0XHU4QkU1XHU1NzI4XHU4RkQwXHU4ODRDXHU2NUY2XHU3NkY0XHU2M0E1XHU1OTA0XHU3NDA2XG4gICAgZW50cmllczogW1xuICAgICAgcmVzb2x2ZShhcHBEaXIsICdzcmMvbWFpbi50cycpLFxuICAgIF0sXG4gICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgIHBsdWdpbnM6IFtdLFxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU3ODZFXHU0RkREXHU0RjlEXHU4RDU2XHU5ODg0XHU2Nzg0XHU1RUZBXHU2NUY2XHU0RTVGXHU0RjdGXHU3NTI4IFZ1ZSBcdTc2ODQgSlNYIFx1OEY2Q1x1NjM2Mlx1NjVCOVx1NUYwRlxuICAgICAganN4OiAncHJlc2VydmUnLCAvLyBcdTRGRERcdTc1NTkgSlNYXHVGRjBDXHU4QkE5IHZ1ZUpzeCBcdTYzRDJcdTRFRjZcdTU5MDRcdTc0MDZcbiAgICAgIGpzeEZhY3Rvcnk6ICdoJywgLy8gXHU0RjdGXHU3NTI4IFZ1ZSBcdTc2ODQgaCBcdTUxRkRcdTY1NzBcdTRGNUNcdTRFM0EgSlNYIFx1NURFNVx1NTM4Mlx1NTFGRFx1NjU3MFxuICAgICAganN4RnJhZ21lbnQ6ICdGcmFnbWVudCcsIC8vIFx1NEY3Rlx1NzUyOCBWdWUgXHU3Njg0IEZyYWdtZW50XG4gICAgfSxcbiAgfTtcblxuICAvLyBcdThGRDRcdTU2REVcdTVCOENcdTY1NzRcdTkxNERcdTdGNkVcbiAgLy8gXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU0RjdGXHU3NTI4XHU1MjJCXHU1NDBEXHU2MzA3XHU1NDExXHU2RTkwXHU3ODAxXHVGRjA4XHU1NkUwXHU0RTNBXHU5MEZEXHU2MjUzXHU1MzA1IEBidGMvKiBcdTUzMDVcdUZGMDlcbiAgY29uc3QgYmFzZVJlc29sdmUgPSBjcmVhdGVCYXNlUmVzb2x2ZShhcHBEaXIsIGFwcE5hbWUpO1xuXG4gIHJldHVybiB7XG4gICAgYmFzZTogYmFzZVVybCxcbiAgICBwdWJsaWNEaXIsXG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU2QkNGXHU0RTJBXHU1RTk0XHU3NTI4XHU0RjdGXHU3NTI4XHU3MkVDXHU3QUNCXHU3Njg0XHU3RjEzXHU1QjU4XHU3NkVFXHU1RjU1XHVGRjBDXHU5MDdGXHU1MTREXHU0RTBEXHU1NDBDXHU1RTk0XHU3NTI4XHU3Njg0XHU5MTREXHU3RjZFXHU1REVFXHU1RjAyXHU1QkZDXHU4MUY0XHU3RjEzXHU1QjU4XHU1MUIyXHU3QTgxXG4gICAgY2FjaGVEaXI6IGFwcENhY2hlRGlyLFxuICAgIGRlZmluZToge1xuICAgICAgLy8gXHU0RTNBXHU2RDRGXHU4OUM4XHU1NjY4XHU3M0FGXHU1ODgzXHU2M0QwXHU0RjlCIHByb2Nlc3MgXHU1QkY5XHU4QzYxXHVGRjBDV2luc3RvbiBcdTk3MDBcdTg5ODFcdTVCODNcbiAgICAgICdwcm9jZXNzLmVudic6ICd7fScsXG4gICAgICAncHJvY2Vzcy5wbGF0Zm9ybSc6IEpTT04uc3RyaW5naWZ5KCdicm93c2VyJyksXG4gICAgICAncHJvY2Vzcy52ZXJzaW9uJzogSlNPTi5zdHJpbmdpZnkoJycpLFxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgLi4uYmFzZVJlc29sdmUsXG4gICAgICAvLyBcdTU0MDhcdTVFNzZcdTUyMkJcdTU0MERcdUZGMUFiYXNlUmVzb2x2ZS5hbGlhcyBcdTY2MkZcdTY1NzBcdTdFQzRcdTVGNjJcdTVGMEZcdUZGMENsYXlvdXRBbGlhc2VzIFx1NjYyRlx1NUJGOVx1OEM2MVx1NUY2Mlx1NUYwRlxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBbGF5b3V0QWxpYXNlcyBcdTRFMkRcdTc2ODRcdTUyMkJcdTU0MERcdTVGQzVcdTk4N0JcdTY1M0VcdTU3MjhcdTY1NzBcdTdFQzRcdTUyNERcdTk3NjJcdUZGMENcdTc4NkVcdTRGRERcdTRGMThcdTUxNDhcdTUzMzlcdTkxNERcdUZGMDhcdTcyNzlcdTUyMkJcdTY2MkYgQCBcdTUyMkJcdTU0MERcdUZGMDlcbiAgICAgIGFsaWFzOiBBcnJheS5pc0FycmF5KGJhc2VSZXNvbHZlPy5hbGlhcylcbiAgICAgICAgPyBbXG4gICAgICAgICAgICAvLyBsYXlvdXQtYXBwIFx1NzI3OVx1NjcwOVx1NzY4NFx1NTIyQlx1NTQwRFx1NjUzRVx1NTcyOFx1NTI0RFx1OTc2Mlx1RkYwQ1x1NEYxOFx1NTE0OFx1NTMzOVx1OTE0RFxuICAgICAgICAgICAgLi4uT2JqZWN0LmVudHJpZXMobGF5b3V0QWxpYXNlcykubWFwKChbZmluZCwgcmVwbGFjZW1lbnRdKSA9PiAoe1xuICAgICAgICAgICAgICBmaW5kLFxuICAgICAgICAgICAgICByZXBsYWNlbWVudCxcbiAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgIC8vIFx1OEZDN1x1NkVFNFx1NjM4OSBiYXNlUmVzb2x2ZS5hbGlhcyBcdTRFMkRcdTRFMEUgbGF5b3V0QWxpYXNlcyBcdTUxQjJcdTdBODFcdTc2ODRcdTUyMkJcdTU0MERcdUZGMDhcdTU5ODIgQFx1RkYwOVxuICAgICAgICAgICAgLi4uYmFzZVJlc29sdmUuYWxpYXMuZmlsdGVyKChhbGlhcykgPT4ge1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIGFsaWFzLmZpbmQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICEoYWxpYXMuZmluZCBpbiBsYXlvdXRBbGlhc2VzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIF1cbiAgICAgICAgOiB7XG4gICAgICAgICAgICAuLi4oYmFzZVJlc29sdmU/LmFsaWFzIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz4gfHwge30pLFxuICAgICAgICAgICAgLi4ubGF5b3V0QWxpYXNlcyxcbiAgICAgICAgICB9LFxuICAgIH0sXG4gICAgcGx1Z2lucyxcbiAgICBlc2J1aWxkOiB7XG4gICAgICBjaGFyc2V0OiAndXRmOCcsXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTc4NkVcdTRGREQgZXNidWlsZCBcdTZCNjNcdTc4NkVcdTU5MDRcdTc0MDYgSlNYXHVGRjBDXHU0RjdGXHU3NTI4IFZ1ZSBcdTc2ODQgaCBcdTUxRkRcdTY1NzBcdTgwMENcdTRFMERcdTY2MkYgUmVhY3QuY3JlYXRlRWxlbWVudFxuICAgICAgLy8gXHU4RkQ5XHU2ODM3XHU1MzczXHU0RjdGIGVzYnVpbGQgXHU1OTA0XHU3NDA2XHU2N0QwXHU0RTlCIEpTWCBcdTY1ODdcdTRFRjZcdUZGMENcdTRFNUZcdTRGMUFcdTRGN0ZcdTc1MjhcdTZCNjNcdTc4NkVcdTc2ODRcdThGNkNcdTYzNjJcdTY1QjlcdTVGMEZcbiAgICAgIGpzeDogJ3ByZXNlcnZlJywgLy8gXHU0RkREXHU3NTU5IEpTWFx1RkYwQ1x1OEJBOSB2dWVKc3ggXHU2M0QyXHU0RUY2XHU1OTA0XHU3NDA2XG4gICAgICBqc3hGYWN0b3J5OiAnaCcsIC8vIFx1NEY3Rlx1NzUyOCBWdWUgXHU3Njg0IGggXHU1MUZEXHU2NTcwXHU0RjVDXHU0RTNBIEpTWCBcdTVERTVcdTUzODJcdTUxRkRcdTY1NzBcbiAgICAgIGpzeEZyYWdtZW50OiAnRnJhZ21lbnQnLCAvLyBcdTRGN0ZcdTc1MjggVnVlIFx1NzY4NCBGcmFnbWVudFxuICAgIH0sXG4gICAgc2VydmVyOiBzZXJ2ZXJDb25maWcsXG4gICAgcHJldmlldzogcHJldmlld0NvbmZpZyxcbiAgICBjc3M6IGNzc0NvbmZpZyxcbiAgICBidWlsZDogYnVpbGRDb25maWcsXG4gICAgb3B0aW1pemVEZXBzOiBvcHRpbWl6ZURlcHNDb25maWcsXG4gIH07XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcdXRpbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHV0aWxzXFxcXHBhdGgtaGVscGVycy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvdXRpbHMvcGF0aC1oZWxwZXJzLnRzXCI7LyoqXG4gKiBcdThERUZcdTVGODRcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcbiAqIFx1NjNEMFx1NEY5Qlx1N0VERlx1NEUwMFx1NzY4NFx1OERFRlx1NUY4NFx1ODlFM1x1Njc5MFx1NTFGRFx1NjU3MFx1RkYwQ1x1NzUyOFx1NEU4RSBWaXRlIFx1OTE0RFx1N0Y2RVx1NEUyRFx1NzY4NFx1NTIyQlx1NTQwRFx1NTQ4Q1x1OERFRlx1NUY4NFx1ODlFM1x1Njc5MFxuICovXG5cbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcblxuLyoqXG4gKiBcdTUyMUJcdTVFRkFcdThERUZcdTVGODRcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcbiAqIEBwYXJhbSBhcHBEaXIgXHU1RTk0XHU3NTI4XHU2ODM5XHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XG4gKiBAcmV0dXJucyBcdThERUZcdTVGODRcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcdTVCRjlcdThDNjFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBhdGhIZWxwZXJzKGFwcERpcjogc3RyaW5nKSB7XG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTBcdTVFOTRcdTc1Mjggc3JjIFx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFxuICAgKi9cbiAgY29uc3Qgd2l0aFNyYyA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZykgPT4gcmVzb2x2ZShhcHBEaXIsIHJlbGF0aXZlUGF0aCk7XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MCBwYWNrYWdlcyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcbiAgICovXG4gIGNvbnN0IHdpdGhQYWNrYWdlcyA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZykgPT4gXG4gICAgcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9wYWNrYWdlcycsIHJlbGF0aXZlUGF0aCk7XG5cbiAgLyoqXG4gICAqIFx1ODlFM1x1Njc5MFx1OTg3OVx1NzZFRVx1NjgzOVx1NzZFRVx1NUY1NVx1NEUwQlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFxuICAgKi9cbiAgY29uc3Qgd2l0aFJvb3QgPSAocmVsYXRpdmVQYXRoOiBzdHJpbmcpID0+IFxuICAgIHJlc29sdmUoYXBwRGlyLCAnLi4vLi4nLCByZWxhdGl2ZVBhdGgpO1xuXG4gIC8qKlxuICAgKiBcdTg5RTNcdTY3OTAgY29uZmlncyBcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcbiAgICovXG4gIGNvbnN0IHdpdGhDb25maWdzID0gKHJlbGF0aXZlUGF0aDogc3RyaW5nKSA9PiBcbiAgICByZXNvbHZlKGFwcERpciwgJy4uLy4uL2NvbmZpZ3MnLCByZWxhdGl2ZVBhdGgpO1xuXG4gIHJldHVybiB7IHdpdGhTcmMsIHdpdGhQYWNrYWdlcywgd2l0aFJvb3QsIHdpdGhDb25maWdzIH07XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcYXV0by1pbXBvcnQuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3MvYXV0by1pbXBvcnQuY29uZmlnLnRzXCI7XHVGRUZGLyoqXG4gKiBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTkxNERcdTdGNkVcdTZBMjFcdTY3N0ZcbiAqIFx1NEY5Qlx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1RkYwOGFkbWluLWFwcCwgbG9naXN0aWNzLWFwcCBcdTdCNDlcdUZGMDlcdTRGN0ZcdTc1MjhcbiAqL1xuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSc7XG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJztcbmltcG9ydCB7IEVsZW1lbnRQbHVzUmVzb2x2ZXIgfSBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnMnO1xuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBBdXRvIEltcG9ydCBcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUF1dG9JbXBvcnRDb25maWcoKSB7XG4gIHJldHVybiBBdXRvSW1wb3J0KHtcbiAgICBpbXBvcnRzOiBbXG4gICAgICAndnVlJyxcbiAgICAgICd2dWUtcm91dGVyJyxcbiAgICAgICdwaW5pYScsXG4gICAgICB7XG4gICAgICAgICdAYnRjL3NoYXJlZC1jb3JlJzogW1xuICAgICAgICAgICd1c2VDcnVkJyxcbiAgICAgICAgICAndXNlRGljdCcsXG4gICAgICAgICAgJ3VzZVBlcm1pc3Npb24nLFxuICAgICAgICAgICd1c2VSZXF1ZXN0JyxcbiAgICAgICAgICAnY3JlYXRlSTE4blBsdWdpbicsXG4gICAgICAgICAgJ3VzZUkxOG4nLFxuICAgICAgICBdLFxuICAgICAgICAnQGJ0Yy9zaGFyZWQtdXRpbHMnOiBbXG4gICAgICAgICAgJ2Zvcm1hdERhdGUnLFxuICAgICAgICAgICdmb3JtYXREYXRlVGltZScsXG4gICAgICAgICAgJ2Zvcm1hdE1vbmV5JyxcbiAgICAgICAgICAnZm9ybWF0TnVtYmVyJyxcbiAgICAgICAgICAnaXNFbWFpbCcsXG4gICAgICAgICAgJ2lzUGhvbmUnLFxuICAgICAgICAgICdzdG9yYWdlJyxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgXSxcblxuICAgIHJlc29sdmVyczogW1xuICAgICAgRWxlbWVudFBsdXNSZXNvbHZlcih7XG4gICAgICAgIGltcG9ydFN0eWxlOiBmYWxzZSwgLy8gXHU3OTgxXHU3NTI4XHU2MzA5XHU5NzAwXHU2ODM3XHU1RjBGXHU1QkZDXHU1MTY1XG4gICAgICB9KSxcbiAgICBdLFxuXG4gICAgZHRzOiAnc3JjL2F1dG8taW1wb3J0cy5kLnRzJyxcblxuICAgIGVzbGludHJjOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZmlsZXBhdGg6ICcuLy5lc2xpbnRyYy1hdXRvLWltcG9ydC5qc29uJyxcbiAgICB9LFxuXG4gICAgdnVlVGVtcGxhdGU6IHRydWUsXG4gIH0pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudHNDb25maWdPcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1OTg5RFx1NTkxNlx1NzY4NFx1N0VDNFx1NEVGNlx1NzZFRVx1NUY1NVx1RkYwOFx1NzUyOFx1NEU4RVx1NTdERlx1N0VBN1x1N0VDNFx1NEVGNlx1RkYwOVxuICAgKi9cbiAgZXh0cmFEaXJzPzogc3RyaW5nW107XG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdTVCRkNcdTUxNjVcdTUxNzFcdTRFQUJcdTdFQzRcdTRFRjZcdTVFOTNcbiAgICovXG4gIGluY2x1ZGVTaGFyZWQ/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBDb21wb25lbnRzIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1OTE0RFx1N0Y2RVxuICogQHBhcmFtIG9wdGlvbnMgXHU5MTREXHU3RjZFXHU5MDA5XHU5ODc5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRzQ29uZmlnKG9wdGlvbnM6IENvbXBvbmVudHNDb25maWdPcHRpb25zID0ge30pIHtcbiAgY29uc3QgeyBleHRyYURpcnMgPSBbXSwgaW5jbHVkZVNoYXJlZCA9IHRydWUgfSA9IG9wdGlvbnM7XG5cbiAgY29uc3QgZGlycyA9IFtcbiAgICAnc3JjL2NvbXBvbmVudHMnLCAvLyBcdTVFOTRcdTc1MjhcdTdFQTdcdTdFQzRcdTRFRjZcbiAgICAuLi5leHRyYURpcnMsIC8vIFx1OTg5RFx1NTkxNlx1NzY4NFx1NTdERlx1N0VBN1x1N0VDNFx1NEVGNlx1NzZFRVx1NUY1NVxuICBdO1xuXG4gIC8vIFx1NTk4Mlx1Njc5Q1x1NTMwNVx1NTQyQlx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1RkYwQ1x1NkRGQlx1NTJBMFx1NTE3MVx1NEVBQlx1N0VDNFx1NEVGNlx1NTIwNlx1N0VDNFx1NzZFRVx1NUY1NVxuICBpZiAoaW5jbHVkZVNoYXJlZCkge1xuICAgIC8vIFx1NkRGQlx1NTJBMFx1NTIwNlx1N0VDNFx1NzZFRVx1NUY1NVx1RkYwQ1x1NjUyRlx1NjMwMVx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVxuICAgIGRpcnMucHVzaChcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9iYXNpYycsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvbGF5b3V0JyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9uYXZpZ2F0aW9uJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9mb3JtJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9kYXRhJyxcbiAgICAgICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9mZWVkYmFjaycsXG4gICAgICAnLi4vLi4vcGFja2FnZXMvc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvb3RoZXJzJ1xuICAgICk7XG4gIH1cblxuICByZXR1cm4gQ29tcG9uZW50cyh7XG4gICAgcmVzb2x2ZXJzOiBbXG4gICAgICBFbGVtZW50UGx1c1Jlc29sdmVyKHtcbiAgICAgICAgaW1wb3J0U3R5bGU6IGZhbHNlLCAvLyBcdTc5ODFcdTc1MjhcdTYzMDlcdTk3MDBcdTY4MzdcdTVGMEZcdTVCRkNcdTUxNjVcdUZGMENcdTkwN0ZcdTUxNEQgVml0ZSByZWxvYWRpbmdcbiAgICAgIH0pLFxuICAgICAgLy8gXHU4MUVBXHU1QjlBXHU0RTQ5XHU4OUUzXHU2NzkwXHU1NjY4XHVGRjFBQGJ0Yy9zaGFyZWQtY29tcG9uZW50c1xuICAgICAgKGNvbXBvbmVudE5hbWUpID0+IHtcbiAgICAgICAgLy8gXHU1QzA2IGtlYmFiLWNhc2UgXHU4RjZDXHU2MzYyXHU0RTNBIFBhc2NhbENhc2VcbiAgICAgICAgLy8gXHU0RjhCXHU1OTgyOiBidGMtc3ZnIC0+IEJ0Y1N2Z1xuICAgICAgICBjb25zdCBjb252ZXJ0VG9QYXNjYWxDYXNlID0gKG5hbWU6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgnQnRjJykpIHtcbiAgICAgICAgICAgIHJldHVybiBuYW1lOyAvLyBcdTVERjJcdTdFQ0ZcdTY2MkYgUGFzY2FsQ2FzZVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCdidGMtJykpIHtcbiAgICAgICAgICAgIC8vIGJ0Yy1zdmcgLT4gQnRjU3ZnXG4gICAgICAgICAgICByZXR1cm4gbmFtZVxuICAgICAgICAgICAgICAuc3BsaXQoJy0nKVxuICAgICAgICAgICAgICAubWFwKHBhcnQgPT4gcGFydC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHBhcnQuc2xpY2UoMSkpXG4gICAgICAgICAgICAgIC5qb2luKCcnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGNvbXBvbmVudE5hbWUuc3RhcnRzV2l0aCgnQnRjJykgfHwgY29tcG9uZW50TmFtZS5zdGFydHNXaXRoKCdidGMtJykpIHtcbiAgICAgICAgICBjb25zdCBwYXNjYWxOYW1lID0gY29udmVydFRvUGFzY2FsQ2FzZShjb21wb25lbnROYW1lKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogcGFzY2FsTmFtZSxcbiAgICAgICAgICAgIGZyb206ICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJyxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIF0sXG4gICAgZHRzOiAnc3JjL2NvbXBvbmVudHMuZC50cycsXG4gICAgZGlycyxcbiAgICBleHRlbnNpb25zOiBbJ3Z1ZScsICd0c3gnXSwgLy8gXHU2NTJGXHU2MzAxIC52dWUgXHU1NDhDIC50c3ggXHU2NTg3XHU0RUY2XG4gICAgLy8gXHU1RjNBXHU1MjM2XHU5MUNEXHU2NUIwXHU2MjZCXHU2M0NGXHU3RUM0XHU0RUY2XG4gICAgZGVlcDogdHJ1ZSxcbiAgICAvLyBcdTUzMDVcdTU0MkJcdTYyNDBcdTY3MDkgQnRjIFx1NUYwMFx1NTkzNFx1NzY4NFx1N0VDNFx1NEVGNlxuICAgIGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC50c3gkLywgL0J0Y1tBLVpdLywgL2J0Yy1bYS16XS9dLFxuICB9KTtcbn1cbi8vIFVURi04IGVuY29kaW5nIGZpeFxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlLWFwcC1jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlLWFwcC1jb25maWcudHNcIjsvKipcbiAqIFZpdGUgXHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHU4Rjg1XHU1MkE5XHU1MUZEXHU2NTcwXG4gKiBcdTc1MjhcdTRFOEVcdTRFQ0VcdTdFREZcdTRFMDBcdTkxNERcdTdGNkVcdTRFMkRcdTgzQjdcdTUzRDZcdTVFOTRcdTc1MjhcdTc2ODRcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcbiAqL1xuXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBnZXRBcHBDb25maWcgfSBmcm9tICcuLi9wYWNrYWdlcy9zaGFyZWQtY29yZS9zcmMvY29uZmlncy9hcHAtZW52LmNvbmZpZyc7XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU1RTk0XHU3NTI4XHU5MTREXHU3RjZFXHVGRjA4XHU3NTI4XHU0RThFIHZpdGUuY29uZmlnLnRzXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRWaXRlQXBwQ29uZmlnKGFwcE5hbWU6IHN0cmluZyk6IHtcbiAgZGV2UG9ydDogbnVtYmVyO1xuICBkZXZIb3N0OiBzdHJpbmc7XG4gIHByZVBvcnQ6IG51bWJlcjtcbiAgcHJlSG9zdDogc3RyaW5nO1xuICBwcm9kSG9zdDogc3RyaW5nO1xuICBtYWluQXBwT3JpZ2luOiBzdHJpbmc7XG59IHtcbiAgY29uc3QgYXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnKGFwcE5hbWUpO1xuICBpZiAoIWFwcENvbmZpZykge1xuICAgIHRocm93IG5ldyBFcnJvcihgXHU2NzJBXHU2MjdFXHU1MjMwICR7YXBwTmFtZX0gXHU3Njg0XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFYCk7XG4gIH1cblxuICBjb25zdCBtYWluQXBwQ29uZmlnID0gZ2V0QXBwQ29uZmlnKCdtYWluLWFwcCcpO1xuICBjb25zdCBtYWluQXBwT3JpZ2luID0gbWFpbkFwcENvbmZpZ1xuICAgID8gYGh0dHA6Ly8ke21haW5BcHBDb25maWcucHJlSG9zdH06JHttYWluQXBwQ29uZmlnLnByZVBvcnR9YFxuICAgIDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NDE4MCc7XG5cbiAgcmV0dXJuIHtcbiAgICBkZXZQb3J0OiBwYXJzZUludChhcHBDb25maWcuZGV2UG9ydCwgMTApLFxuICAgIGRldkhvc3Q6IGFwcENvbmZpZy5kZXZIb3N0LFxuICAgIHByZVBvcnQ6IHBhcnNlSW50KGFwcENvbmZpZy5wcmVQb3J0LCAxMCksXG4gICAgcHJlSG9zdDogYXBwQ29uZmlnLnByZUhvc3QsXG4gICAgcHJvZEhvc3Q6IGFwcENvbmZpZy5wcm9kSG9zdCxcbiAgICBtYWluQXBwT3JpZ2luLFxuICB9O1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1N0M3Qlx1NTc4QlxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXG4gKiBAcmV0dXJucyBcdTVFOTRcdTc1MjhcdTdDN0JcdTU3OEJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcFR5cGUoYXBwTmFtZTogc3RyaW5nKTogJ21haW4nIHwgJ3N1YicgfCAnbGF5b3V0JyB8ICdtb2JpbGUnIHtcbiAgaWYgKGFwcE5hbWUgPT09ICdtYWluLWFwcCcpIHJldHVybiAnbWFpbic7XG4gIGlmIChhcHBOYW1lID09PSAnbGF5b3V0LWFwcCcpIHJldHVybiAnbGF5b3V0JztcbiAgaWYgKGFwcE5hbWUgPT09ICdtb2JpbGUtYXBwJykgcmV0dXJuICdtb2JpbGUnO1xuICByZXR1cm4gJ3N1Yic7IC8vIFx1NTE3Nlx1NEVENlx1OTBGRFx1NjYyRlx1NUI1MFx1NUU5NFx1NzUyOFxufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENiBiYXNlIFVSTFxuICogQHBhcmFtIGFwcE5hbWUgXHU1RTk0XHU3NTI4XHU1NDBEXHU3OUYwXG4gKiBAcGFyYW0gaXNQcmV2aWV3QnVpbGQgXHU2NjJGXHU1NDI2XHU0RTNBXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXG4gKiBAcmV0dXJucyBiYXNlIFVSTFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmFzZVVybChhcHBOYW1lOiBzdHJpbmcsIGlzUHJldmlld0J1aWxkOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcge1xuICBjb25zdCBhcHBDb25maWcgPSBnZXRBcHBDb25maWcoYXBwTmFtZSk7XG4gIGlmICghYXBwQ29uZmlnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBcdTY3MkFcdTYyN0VcdTUyMzAgJHthcHBOYW1lfSBcdTc2ODRcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVgKTtcbiAgfVxuICBcbiAgLy8gXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XG4gIGlmIChpc1ByZXZpZXdCdWlsZCkge1xuICAgIHJldHVybiBgaHR0cDovLyR7YXBwQ29uZmlnLnByZUhvc3R9OiR7YXBwQ29uZmlnLnByZVBvcnR9L2A7XG4gIH1cbiAgXG4gIC8vIFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1RkYxQVx1NEY3Rlx1NzUyOFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwOFx1OEJBOVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NjgzOVx1NjM2RVx1NTdERlx1NTQwRFx1ODFFQVx1NTJBOFx1ODlFM1x1Njc5MFx1RkYwOVxuICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTVCNTBcdTVFOTRcdTc1MjhcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTc2RjRcdTYzQTVcdTkwRThcdTdGNzJcdTUyMzBcdTVCNTBcdTU3REZcdTU0MERcdTY4MzlcdTc2RUVcdTVGNTVcdUZGMDhcdTU5ODIgcHJvZHVjdGlvbi5iZWxsaXMuY29tLmNuXHVGRjA5XG4gIHJldHVybiAnLyc7XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2IHB1YmxpY0RpciBcdThERUZcdTVGODRcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAqIEByZXR1cm5zIHB1YmxpY0RpciBcdThERUZcdTVGODRcdTYyMTYgZmFsc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFB1YmxpY0RpcihhcHBOYW1lOiBzdHJpbmcsIGFwcERpcjogc3RyaW5nKTogc3RyaW5nIHwgZmFsc2Uge1xuICAvLyBtYWluLWFwcFx1MzAwMWFkbWluLWFwcFx1MzAwMW1vYmlsZS1hcHAgXHU1NDhDIHN5c3RlbS1hcHAgXHU0RjdGXHU3NTI4XHU4MUVBXHU1REYxXHU3Njg0IHB1YmxpYyBcdTc2RUVcdTVGNTVcbiAgaWYgKGFwcE5hbWUgPT09ICdtYWluLWFwcCcgfHwgYXBwTmFtZSA9PT0gJ2FkbWluLWFwcCcgfHwgYXBwTmFtZSA9PT0gJ21vYmlsZS1hcHAnIHx8IGFwcE5hbWUgPT09ICdzeXN0ZW0tYXBwJykge1xuICAgIHJldHVybiByZXNvbHZlKGFwcERpciwgJ3B1YmxpYycpO1xuICB9XG4gIFxuICAvLyBcdTUxNzZcdTRFRDZcdTVFOTRcdTc1MjhcdTRGN0ZcdTc1MjhcdTUxNzFcdTRFQUJcdTc2ODQgcHVibGljIFx1NzZFRVx1NUY1NVxuICByZXR1cm4gcmVzb2x2ZShhcHBEaXIsICcuLi8uLi9wYWNrYWdlcy9zaGFyZWQtY29tcG9uZW50cy9wdWJsaWMnKTtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHNyY1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXHBhY2thZ2VzXFxcXHNoYXJlZC1jb3JlXFxcXHNyY1xcXFxjb25maWdzXFxcXGFwcC1lbnYuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL3BhY2thZ2VzL3NoYXJlZC1jb3JlL3NyYy9jb25maWdzL2FwcC1lbnYuY29uZmlnLnRzXCI7Ly8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU4RkQ5XHU5MUNDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IGxvZ2dlclx1RkYwQ1x1NTZFMFx1NEUzQVx1NUI1OFx1NTcyOFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1RkYxQVxuLy8gbG9nZ2VyIC0+IGVudi1pbmZvIC0+IHVuaWZpZWQtZW52LWNvbmZpZyAtPiBhcHAtZW52LmNvbmZpZyAtPiBsb2dnZXJcbi8vIFx1NTcyOFx1NkEyMVx1NTc1N1x1NTJBMFx1OEY3RFx1NzY4NFx1NjVFOVx1NjcxRlx1OTYzNlx1NkJCNVx1RkYwQ2xvZ2dlciBcdTUzRUZcdTgwRkRcdThGRDhcdTY3MkFcdTUyMURcdTU5Q0JcdTUzMTZcdUZGMENcdTYyNDBcdTRFRTVcdTc2RjRcdTYzQTVcdTRGN0ZcdTc1MjggY29uc29sZVxuLy8gY29uc29sZSBcdTY2MkZcdTUxNjhcdTVDNDBcdTVCRjlcdThDNjFcdUZGMENcdTU3MjhcdTZBMjFcdTU3NTdcdTUyQTBcdThGN0RcdTY1RjZcdTVDMzFcdTVERjJcdTdFQ0ZcdTVCNThcdTU3MjhcdUZGMENcdTRFMERcdTRGMUFcdTUzRDdcdTUyMzBcdTVGQUFcdTczQUZcdTRGOURcdThENTZcdTc2ODRcdTVGNzFcdTU0Q0Rcbi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwidml0ZS9jbGllbnRcIiAvPlxuXG4vKipcbiAqIFx1N0VERlx1NEUwMFx1NzY4NFx1NUU5NFx1NzUyOFx1NzNBRlx1NTg4M1x1OTE0RFx1N0Y2RVxuICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU3Njg0XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU5MEZEXHU0RUNFXHU4RkQ5XHU5MUNDXHU4QkZCXHU1M0Q2XHVGRjBDXHU5MDdGXHU1MTREXHU0RThDXHU0RTQ5XHU2MDI3XG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBBcHBFbnZDb25maWcge1xuICBhcHBOYW1lOiBzdHJpbmc7XG4gIGRldkhvc3Q6IHN0cmluZztcbiAgZGV2UG9ydDogc3RyaW5nO1xuICBwcmVIb3N0OiBzdHJpbmc7XG4gIHByZVBvcnQ6IHN0cmluZztcbiAgdGVzdEhvc3Q/OiBzdHJpbmc7IC8vIFx1NkQ0Qlx1OEJENVx1NzNBRlx1NTg4M1x1NEY3Rlx1NzUyOFx1NUI1MFx1NTdERlx1NTQwRFx1RkYwOFx1NTk4MiBhZG1pbi50ZXN0LmJlbGxpcy5jb20uY25cdUZGMDlcdUZGMENcdTRFMERcdTRGN0ZcdTc1MjhcdTdBRUZcdTUzRTNcbiAgcHJvZEhvc3Q6IHN0cmluZztcbn1cblxuLyoqXG4gKiBcdTRFM0JcdTVFOTRcdTc1MjhcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcbiAqL1xuY29uc3QgTUFJTl9BUFBfQ09ORklHOiBBcHBFbnZDb25maWcgPSB7XG4gIGFwcE5hbWU6ICdtYWluLWFwcCcsXG4gIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gIGRldlBvcnQ6ICc4MDgwJyxcbiAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gIHByZVBvcnQ6ICc0MTgwJyxcbiAgdGVzdEhvc3Q6ICd0ZXN0LmJlbGxpcy5jb20uY24nLFxuICBwcm9kSG9zdDogJ2JlbGxpcy5jb20uY24nLFxufTtcblxuLyoqXG4gKiBcdTRFMUFcdTUyQTFcdTVCNTBcdTVFOTRcdTc1MjhcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcdUZGMDhcdTYzMDlcdTVCNTdcdTZCQ0RcdTk4N0FcdTVFOEZcdUZGMDlcbiAqL1xuY29uc3QgQlVTSU5FU1NfQVBQX0NPTkZJR1M6IEFwcEVudkNvbmZpZ1tdID0gW1xuICB7XG4gICAgYXBwTmFtZTogJ2FkbWluLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MScsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODEnLFxuICAgIHRlc3RIb3N0OiAnYWRtaW4udGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ2FkbWluLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2Rhc2hib2FyZC1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODInLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTgyJyxcbiAgICB0ZXN0SG9zdDogJ2Rhc2hib2FyZC50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnZGFzaGJvYXJkLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2VuZ2luZWVyaW5nLWFwcCcsXG4gICAgZGV2SG9zdDogJzEwLjgwLjguMTk5JyxcbiAgICBkZXZQb3J0OiAnODA4MycsXG4gICAgcHJlSG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJlUG9ydDogJzQxODMnLFxuICAgIHRlc3RIb3N0OiAnZW5naW5lZXJpbmcudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ2VuZ2luZWVyaW5nLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2ZpbmFuY2UtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg0JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NCcsXG4gICAgdGVzdEhvc3Q6ICdmaW5hbmNlLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdmaW5hbmNlLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2xvZ2lzdGljcy1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODYnLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg2JyxcbiAgICB0ZXN0SG9zdDogJ2xvZ2lzdGljcy50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnbG9naXN0aWNzLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ29wZXJhdGlvbnMtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg4JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4OCcsXG4gICAgdGVzdEhvc3Q6ICdvcGVyYXRpb25zLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdvcGVyYXRpb25zLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ3BlcnNvbm5lbC1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwODknLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTg5JyxcbiAgICB0ZXN0SG9zdDogJ3BlcnNvbm5lbC50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAncGVyc29ubmVsLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ3Byb2R1Y3Rpb24tYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDk2JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5MCcsXG4gICAgdGVzdEhvc3Q6ICdwcm9kdWN0aW9uLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdwcm9kdWN0aW9uLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ3F1YWxpdHktYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDkxJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5MScsXG4gICAgdGVzdEhvc3Q6ICdxdWFsaXR5LnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdxdWFsaXR5LmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ3N5c3RlbS1hcHAnLFxuICAgIGRldkhvc3Q6ICcxMC44MC44LjE5OScsXG4gICAgZGV2UG9ydDogJzgwOTInLFxuICAgIHByZUhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIHByZVBvcnQ6ICc0MTkyJyxcbiAgICB0ZXN0SG9zdDogJ3N5c3RlbS50ZXN0LmJlbGxpcy5jb20uY24nLFxuICAgIHByb2RIb3N0OiAnc3lzdGVtLmJlbGxpcy5jb20uY24nLFxuICB9LFxuXTtcblxuLyoqXG4gKiBcdTcyNzlcdTZCOEFcdTVFOTRcdTc1MjhcdTczQUZcdTU4ODNcdTkxNERcdTdGNkVcdUZGMDhcdTYzMDlcdTVCNTdcdTZCQ0RcdTk4N0FcdTVFOEZcdUZGMDlcbiAqL1xuY29uc3QgU1BFQ0lBTF9BUFBfQ09ORklHUzogQXBwRW52Q29uZmlnW10gPSBbXG4gIHtcbiAgICBhcHBOYW1lOiAnZG9jcy1hcHAnLFxuICAgIGRldkhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIGRldlBvcnQ6ICc4MDkzJyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5MycsXG4gICAgdGVzdEhvc3Q6ICdkb2NzLnRlc3QuYmVsbGlzLmNvbS5jbicsXG4gICAgcHJvZEhvc3Q6ICdkb2NzLmJlbGxpcy5jb20uY24nLFxuICB9LFxuICB7XG4gICAgYXBwTmFtZTogJ2hvbWUtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg1JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NScsXG4gICAgdGVzdEhvc3Q6ICd3d3cudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ3d3dy5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdsYXlvdXQtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDk0JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE5NCcsXG4gICAgdGVzdEhvc3Q6ICdsYXlvdXQudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ2xheW91dC5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbiAge1xuICAgIGFwcE5hbWU6ICdtb2JpbGUtYXBwJyxcbiAgICBkZXZIb3N0OiAnMTAuODAuOC4xOTknLFxuICAgIGRldlBvcnQ6ICc4MDg3JyxcbiAgICBwcmVIb3N0OiAnbG9jYWxob3N0JyxcbiAgICBwcmVQb3J0OiAnNDE4NycsXG4gICAgdGVzdEhvc3Q6ICdtb2JpbGUudGVzdC5iZWxsaXMuY29tLmNuJyxcbiAgICBwcm9kSG9zdDogJ21vYmlsZS5iZWxsaXMuY29tLmNuJyxcbiAgfSxcbl07XG5cbi8qKlxuICogXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU3Njg0XHU3M0FGXHU1ODgzXHU5MTREXHU3RjZFXG4gKiBcdTU0MDhcdTVFNzZcdTRFM0JcdTVFOTRcdTc1MjhcdTMwMDFcdTRFMUFcdTUyQTFcdTVFOTRcdTc1MjhcdTU0OENcdTcyNzlcdTZCOEFcdTVFOTRcdTc1MjhcbiAqL1xuZXhwb3J0IGNvbnN0IEFQUF9FTlZfQ09ORklHUzogQXBwRW52Q29uZmlnW10gPSBbXG4gIE1BSU5fQVBQX0NPTkZJRyxcbiAgLi4uQlVTSU5FU1NfQVBQX0NPTkZJR1MsXG4gIC4uLlNQRUNJQUxfQVBQX0NPTkZJR1MsXG5dO1xuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1ODNCN1x1NTNENlx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnKGFwcE5hbWU6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcuYXBwTmFtZSA9PT0gYXBwTmFtZSk7XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU1RjAwXHU1M0QxXHU3QUVGXHU1M0UzXHU1MjE3XHU4ODY4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGxEZXZQb3J0cygpOiBzdHJpbmdbXSB7XG4gIC8vIFx1OTYzMlx1NUZBMVx1NjAyN1x1NjhDMFx1NjdFNVx1RkYxQVx1NEY3Rlx1NzUyOCB0cnktY2F0Y2ggXHU2MzU1XHU4M0I3XHU1M0VGXHU4MEZEXHU3Njg0IFREWiAoVGVtcG9yYWwgRGVhZCBab25lKSBcdTk1MTlcdThCRUZcbiAgLy8gXHU1OTgyXHU2NzlDIEFQUF9FTlZfQ09ORklHUyBcdThGRDhcdTZDQTFcdTY3MDlcdTUyMURcdTU5Q0JcdTUzMTZcdUZGMDhcdTc1MzFcdTRFOEVcdTVGQUFcdTczQUZcdTRGOURcdThENTZcdTYyMTZcdTZBMjFcdTU3NTdcdTUyQTBcdThGN0RcdTk4N0FcdTVFOEZcdUZGMDlcdUZGMENcdThGRDRcdTU2REVcdTdBN0FcdTY1NzBcdTdFQzRcbiAgdHJ5IHtcbiAgICByZXR1cm4gQVBQX0VOVl9DT05GSUdTLm1hcCgoY29uZmlnKSA9PiBjb25maWcuZGV2UG9ydCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgUmVmZXJlbmNlRXJyb3IgJiYgZXJyb3IubWVzc2FnZS5pbmNsdWRlcygnYmVmb3JlIGluaXRpYWxpemF0aW9uJykpIHtcbiAgICAgIGlmICh0eXBlb2YgaW1wb3J0Lm1ldGEgIT09ICd1bmRlZmluZWQnICYmIGltcG9ydC5tZXRhLmVudiAmJiBpbXBvcnQubWV0YS5lbnYuREVWKSB7XG4gICAgICAgIC8vIFx1NzZGNFx1NjNBNVx1NEY3Rlx1NzUyOCBjb25zb2xlLndhcm5cdUZGMENcdTkwN0ZcdTUxNERcdTVGQUFcdTczQUZcdTRGOURcdThENTZcbiAgICAgICAgY29uc29sZS53YXJuKCdbYXBwLWVudi5jb25maWddIEFQUF9FTlZfQ09ORklHUyBcdTY3MkFcdTUyMURcdTU5Q0JcdTUzMTZcdUZGMDhcdTUzRUZcdTgwRkRcdTY2MkZcdTVGQUFcdTczQUZcdTRGOURcdThENTZcdUZGMDlcdUZGMENcdThGRDRcdTU2REVcdTdBN0FcdTY1NzBcdTdFQzQnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgLy8gXHU1MTc2XHU0RUQ2XHU5NTE5XHU4QkVGXHU5MUNEXHU2NUIwXHU2MjlCXHU1MUZBXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTk4ODRcdTg5QzhcdTdBRUZcdTUzRTNcdTUyMTdcdTg4NjhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbFByZVBvcnRzKCk6IHN0cmluZ1tdIHtcbiAgLy8gXHU5NjMyXHU1RkExXHU2MDI3XHU2OEMwXHU2N0U1XHVGRjFBXHU0RjdGXHU3NTI4IHRyeS1jYXRjaCBcdTYzNTVcdTgzQjdcdTUzRUZcdTgwRkRcdTc2ODQgVERaIChUZW1wb3JhbCBEZWFkIFpvbmUpIFx1OTUxOVx1OEJFRlxuICAvLyBcdTU5ODJcdTY3OUMgQVBQX0VOVl9DT05GSUdTIFx1OEZEOFx1NkNBMVx1NjcwOVx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwOFx1NzUzMVx1NEU4RVx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1NjIxNlx1NkEyMVx1NTc1N1x1NTJBMFx1OEY3RFx1OTg3QVx1NUU4Rlx1RkYwOVx1RkYwQ1x1OEZENFx1NTZERVx1N0E3QVx1NjU3MFx1N0VDNFxuICB0cnkge1xuICAgIHJldHVybiBBUFBfRU5WX0NPTkZJR1MubWFwKChjb25maWcpID0+IGNvbmZpZy5wcmVQb3J0KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBSZWZlcmVuY2VFcnJvciAmJiBlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCdiZWZvcmUgaW5pdGlhbGl6YXRpb24nKSkge1xuICAgICAgaWYgKHR5cGVvZiBpbXBvcnQubWV0YSAhPT0gJ3VuZGVmaW5lZCcgJiYgaW1wb3J0Lm1ldGEuZW52ICYmIGltcG9ydC5tZXRhLmVudi5ERVYpIHtcbiAgICAgICAgLy8gXHU3NkY0XHU2M0E1XHU0RjdGXHU3NTI4IGNvbnNvbGUud2Fyblx1RkYwQ1x1OTA3Rlx1NTE0RFx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1NlxuICAgICAgICBjb25zb2xlLndhcm4oJ1thcHAtZW52LmNvbmZpZ10gQVBQX0VOVl9DT05GSUdTIFx1NjcyQVx1NTIxRFx1NTlDQlx1NTMxNlx1RkYwOFx1NTNFRlx1ODBGRFx1NjYyRlx1NUZBQVx1NzNBRlx1NEY5RFx1OEQ1Nlx1RkYwOVx1RkYwQ1x1OEZENFx1NTZERVx1N0E3QVx1NjU3MFx1N0VDNCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICAvLyBcdTUxNzZcdTRFRDZcdTk1MTlcdThCRUZcdTkxQ0RcdTY1QjBcdTYyOUJcdTUxRkFcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1N0FFRlx1NTNFM1x1ODNCN1x1NTNENlx1NUU5NFx1NzUyOFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwQ29uZmlnQnlEZXZQb3J0KHBvcnQ6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcuZGV2UG9ydCA9PT0gcG9ydCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBDb25maWdCeVByZVBvcnQocG9ydDogc3RyaW5nKTogQXBwRW52Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEFQUF9FTlZfQ09ORklHUy5maW5kKChjb25maWcpID0+IGNvbmZpZy5wcmVQb3J0ID09PSBwb3J0KTtcbn1cblxuLyoqXG4gKiBcdTY4MzlcdTYzNkVcdTZENEJcdThCRDVcdTczQUZcdTU4ODNcdTVCNTBcdTU3REZcdTU0MERcdTgzQjdcdTUzRDZcdTVFOTRcdTc1MjhcdTkxNERcdTdGNkVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcENvbmZpZ0J5VGVzdEhvc3QodGVzdEhvc3Q6IHN0cmluZyk6IEFwcEVudkNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBUFBfRU5WX0NPTkZJR1MuZmluZCgoY29uZmlnKSA9PiBjb25maWcudGVzdEhvc3QgPT09IHRlc3RIb3N0KTtcbn1cblxuLyoqXG4gKiBcdTUyMjRcdTY1QURcdTVFOTRcdTc1MjhcdTY2MkZcdTU0MjZcdTRFM0FcdTcyNzlcdTZCOEFcdTVFOTRcdTc1MjhcdUZGMDhcdTU3MjggU1BFQ0lBTF9BUFBfQ09ORklHUyBcdTRFMkRcdUZGMDlcbiAqIFx1NzI3OVx1NkI4QVx1NUU5NFx1NzUyOFx1NTMwNVx1NjJFQ1x1RkYxQWRvY3MtYXBwLCBob21lLWFwcCwgbGF5b3V0LWFwcCwgbW9iaWxlLWFwcFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTcGVjaWFsQXBwKGFwcE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gU1BFQ0lBTF9BUFBfQ09ORklHUy5zb21lKChjb25maWcpID0+IGNvbmZpZy5hcHBOYW1lID09PSBhcHBOYW1lKTtcbn1cblxuLyoqXG4gKiBcdTUyMjRcdTY1QURcdTVFOTRcdTc1MjhcdTY2MkZcdTU0MjZcdTRFM0FcdTRFMUFcdTUyQTFcdTVFOTRcdTc1MjhcdUZGMDhcdTU3MjggQlVTSU5FU1NfQVBQX0NPTkZJR1MgXHU0RTJEXHVGRjA5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0J1c2luZXNzQXBwKGFwcE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gQlVTSU5FU1NfQVBQX0NPTkZJR1Muc29tZSgoY29uZmlnKSA9PiBjb25maWcuYXBwTmFtZSA9PT0gYXBwTmFtZSk7XG59XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFXHU1RTk0XHU3NTI4IElEIFx1NTIyNFx1NjVBRFx1NjYyRlx1NTQyNlx1NEUzQVx1NzI3OVx1NkI4QVx1NUU5NFx1NzUyOFxuICogXHU1RTk0XHU3NTI4IElEIFx1NjYyRiBhcHBOYW1lIFx1NTNCQlx1NjM4OSAnLWFwcCcgXHU1NDBFXHU3RjAwXHU1NDBFXHU3Njg0XHU1MDNDXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1NwZWNpYWxBcHBCeUlkKGFwcElkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgYXBwTmFtZSA9IGAke2FwcElkfS1hcHBgO1xuICByZXR1cm4gaXNTcGVjaWFsQXBwKGFwcE5hbWUpO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxcYmFzZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL2Jhc2UuY29uZmlnLnRzXCI7LyoqXG4gKiBcdTU3RkFcdTc4NDBcdTkxNERcdTdGNkVcdTZBMjFcdTU3NTdcbiAqIFx1NjNEMFx1NEY5Qlx1NTE2Q1x1NTE3MVx1NzY4NFx1NTIyQlx1NTQwRFx1NTQ4QyByZXNvbHZlIFx1OTE0RFx1N0Y2RVxuICovXG5cbmltcG9ydCB0eXBlIHsgVXNlckNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhpc3RzU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IGNyZWF0ZVBhdGhIZWxwZXJzIH0gZnJvbSAnLi91dGlscy9wYXRoLWhlbHBlcnMnO1xuXG4vKipcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1Nzg0MFx1NTIyQlx1NTQwRFx1OTE0RFx1N0Y2RVxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFxuICogQHJldHVybnMgXHU1MjJCXHU1NDBEXHU5MTREXHU3RjZFXHU1QkY5XHU4QzYxXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCYXNlQWxpYXNlcyhcbiAgYXBwRGlyOiBzdHJpbmcsIFxuICBfYXBwTmFtZTogc3RyaW5nXG4pOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcbiAgY29uc3QgeyB3aXRoU3JjLCB3aXRoUm9vdCwgd2l0aENvbmZpZ3MsIHdpdGhQYWNrYWdlcyB9ID0gY3JlYXRlUGF0aEhlbHBlcnMoYXBwRGlyKTtcblxuICBjb25zdCBhbGlhc2VzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICdAJzogd2l0aFNyYygnc3JjJyksXG4gICAgJ0Btb2R1bGVzJzogd2l0aFNyYygnc3JjL21vZHVsZXMnKSxcbiAgICAnQHNlcnZpY2VzJzogd2l0aFNyYygnc3JjL3NlcnZpY2VzJyksXG4gICAgJ0Bjb21wb25lbnRzJzogd2l0aFNyYygnc3JjL2NvbXBvbmVudHMnKSxcbiAgICAnQHV0aWxzJzogd2l0aFNyYygnc3JjL3V0aWxzJyksXG4gICAgJ0BhdXRoJzogd2l0aFJvb3QoJ2F1dGgnKSxcbiAgICAnQGNvbmZpZ3MnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYy9jb25maWdzJyksXG4gICAgJ0BidGMvYXV0aC1zaGFyZWQnOiB3aXRoUm9vdCgnYXV0aC9zaGFyZWQnKSxcbiAgICAvLyBAYnRjLyogXHU1MzA1XHU1MjJCXHU1NDBEXHVGRjFBXHU2MjQwXHU2NzA5XHU1RTk0XHU3NTI4XHU5MEZEXHU2MjUzXHU1MzA1XHU4RkQ5XHU0RTlCXHU1MzA1XHVGRjBDXHU2MjQwXHU0RUU1XHU1OUNCXHU3RUM4XHU0RjdGXHU3NTI4XHU1MjJCXHU1NDBEXHU2MzA3XHU1NDExXHU2RTkwXHU3ODAxXG4gICAgJ0BidGMvc2hhcmVkLWNvcmUnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYycpLFxuICAgICdAYnRjL3NoYXJlZC1jb21wb25lbnRzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMnKSxcbiAgICAnQGJ0Yy9zaGFyZWQtcm91dGVyJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtcm91dGVyL3NyYycpLFxuICAgIC8vIFx1NTQxMVx1NTQwRVx1NTE3Q1x1NUJCOVx1RkYxQVx1NUU5Rlx1NUYwM1x1NTMwNVx1NzY4NFx1NTIyQlx1NTQwRFx1NjMwN1x1NTQxMVx1NUY1Mlx1NUU3Nlx1NTQwRVx1NzY4NFx1NEY0RFx1N0Y2RVxuICAgICdAYnRjL3NoYXJlZC11dGlscyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvcmUvc3JjL3V0aWxzJyksXG4gICAgJ0BidGMvc2hhcmVkLXBsdWdpbnMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9wbHVnaW5zJyksXG4gICAgJ0BidGMvaTE4bic6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2kxOG4nKSxcbiAgICAnQGJ0Yy9zdWJhcHAtbWFuaWZlc3RzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMvbWFuaWZlc3QnKSxcbiAgICAnQGJ0Yy9lbnYnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb3JlL3NyYy9lbnYnKSxcbiAgICBcbiAgICAvLyBzaGFyZWQtY29tcG9uZW50cyBcdTUxODVcdTkwRThcdTRGN0ZcdTc1MjhcdTc2ODRcdTUyMkJcdTU0MERcdUZGMDhcdTc1MjhcdTRFOEVcdTg5RTNcdTY3OTAgc2hhcmVkLWNvbXBvbmVudHMgXHU1MTg1XHU5MEU4XHU3Njg0XHU1QkZDXHU1MTY1XHVGRjA5XG4gICAgJ0BidGMtY29tbW9uJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY29tbW9uJyksXG4gICAgJ0BidGMtY29tcG9uZW50cyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMnKSxcbiAgICAnQGJ0Yy1jcnVkJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY3J1ZCcpLFxuICAgICdAYnRjLXN0eWxlcyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL3N0eWxlcycpLFxuICAgICdAYnRjLWxvY2FsZXMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9sb2NhbGVzJyksXG4gICAgJ0BidGMtYXNzZXRzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvYXNzZXRzJyksXG4gICAgJ0Bhc3NldHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9hc3NldHMnKSwgLy8gQGFzc2V0cyBcdTUyMkJcdTU0MERcdUZGMENcdTc1MjhcdTRFOEVcdTU2RkVcdTcyNDdcdThENDRcdTZFOTBcdTVCRkNcdTUxNjVcbiAgICAnQGJ0Yy11dGlscyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL3V0aWxzJyksXG4gICAgJ0BwbHVnaW5zJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvcGx1Z2lucycpLFxuICAgIFxuICAgIC8vIFx1NTZGRVx1ODg2OFx1NzZGOFx1NTE3M1x1NTIyQlx1NTQwRFxuICAgICdAY2hhcnRzLXV0aWxzL2Nzcy12YXInOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvY3NzLXZhcicpLFxuICAgICdAY2hhcnRzLXV0aWxzL2NvbG9yJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3V0aWxzL2NvbG9yJyksXG4gICAgJ0BjaGFydHMtdXRpbHMvZ3JhZGllbnQnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMvZ3JhZGllbnQnKSxcbiAgICAnQGNoYXJ0cy1jb21wb3NhYmxlcy91c2VDaGFydENvbXBvbmVudCc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy9jb21wb3NhYmxlcy91c2VDaGFydENvbXBvbmVudCcpLFxuICAgICdAY2hhcnRzLXR5cGVzJzogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29tcG9uZW50cy9zcmMvY2hhcnRzL3R5cGVzJyksXG4gICAgJ0BjaGFydHMtdXRpbHMnOiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9jaGFydHMvdXRpbHMnKSxcbiAgICAnQGNoYXJ0cy1jb21wb3NhYmxlcyc6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2NoYXJ0cy9jb21wb3NhYmxlcycpLFxuXG4gICAgLy8gRWxlbWVudCBQbHVzIFx1NTIyQlx1NTQwRFx1RkYwOFx1NTlDQlx1N0VDOFx1NEY3Rlx1NzUyOFx1RkYwOVxuICAgICdlbGVtZW50LXBsdXMvZXMnOiAnZWxlbWVudC1wbHVzL2VzJyxcbiAgICAnZWxlbWVudC1wbHVzL2Rpc3QnOiAnZWxlbWVudC1wbHVzL2Rpc3QnLFxuICB9O1xuXG4gIHJldHVybiBhbGlhc2VzO1xufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1Nzg0MCByZXNvbHZlIFx1OTE0RFx1N0Y2RVxuICogQHBhcmFtIGFwcERpciBcdTVFOTRcdTc1MjhcdTY4MzlcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcbiAqIEBwYXJhbSBhcHBOYW1lIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFxuICogQHJldHVybnMgcmVzb2x2ZSBcdTkxNERcdTdGNkVcdTVCRjlcdThDNjFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJhc2VSZXNvbHZlKFxuICBhcHBEaXI6IHN0cmluZywgXG4gIGFwcE5hbWU6IHN0cmluZ1xuKTogVXNlckNvbmZpZ1sncmVzb2x2ZSddIHtcbiAgY29uc3QgeyB3aXRoUGFja2FnZXMgfSA9IGNyZWF0ZVBhdGhIZWxwZXJzKGFwcERpcik7XG4gIGNvbnN0IGFsaWFzZXMgPSBjcmVhdGVCYXNlQWxpYXNlcyhhcHBEaXIsIGFwcE5hbWUpO1xuICBcbiAgLy8gXHU0RjdGXHU3NTI4XHU2NTcwXHU3RUM0XHU1RjYyXHU1RjBGXHU3Njg0XHU1MjJCXHU1NDBEXHVGRjBDXHU3ODZFXHU0RkREXHU2NkY0XHU1MTc3XHU0RjUzXHU3Njg0XHU1MjJCXHU1NDBEXHU0RjE4XHU1MTQ4XHU1MzM5XHU5MTREXG4gIC8vIFZpdGUgXHU0RjFBXHU2MzA5XHU2NTcwXHU3RUM0XHU5ODdBXHU1RThGXHU1MzM5XHU5MTREXHVGRjBDXHU3QjJDXHU0RTAwXHU0RTJBXHU1MzM5XHU5MTREXHU3Njg0XHU1MjJCXHU1NDBEXHU0RjFBXHU4OEFCXHU0RjdGXHU3NTI4XG4gIGNvbnN0IGFsaWFzQXJyYXk6IEFycmF5PHsgZmluZDogc3RyaW5nIHwgUmVnRXhwOyByZXBsYWNlbWVudDogc3RyaW5nIH0+ID0gW1xuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NUMwNiB1dGlsIFx1NjYyMFx1NUMwNFx1NTIzMCBucG0gXHU1MzA1XHVGRjBDXHU5NjMyXHU2QjYyIFZpdGUgXHU1QzA2XHU1MTc2XHU4OUM2XHU0RTNBIE5vZGUuanMgXHU1MTg1XHU3RjZFXHU2QTIxXHU1NzU3XHU1RTc2XHU1OTE2XHU5MEU4XHU1MzE2XG4gICAgLy8gXHU5NzAwXHU4OTgxXHU2N0U1XHU2MjdFIG5vZGVfbW9kdWxlcy91dGlsIFx1NzY4NFx1NUI5RVx1OTY0NVx1OERFRlx1NUY4NFx1RkYwOFx1NTNFRlx1ODBGRFx1NTcyOFx1NjgzOVx1NzZFRVx1NUY1NVx1NjIxNlx1NUU5NFx1NzUyOFx1NzZFRVx1NUY1NVx1RkYwOVxuICAgIHtcbiAgICAgIGZpbmQ6IC9edXRpbCQvLFxuICAgICAgcmVwbGFjZW1lbnQ6ICgoKSA9PiB7XG4gICAgICAgIC8vIFx1NUMxRFx1OEJENVx1NEVDRVx1NUU5NFx1NzUyOFx1NzZFRVx1NUY1NVx1NjdFNVx1NjI3RVxuICAgICAgICBjb25zdCBhcHBVdGlsUGF0aCA9IHJlc29sdmUoYXBwRGlyLCAnbm9kZV9tb2R1bGVzL3V0aWwnKTtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoYXBwVXRpbFBhdGgpKSB7XG4gICAgICAgICAgcmV0dXJuIGFwcFV0aWxQYXRoO1xuICAgICAgICB9XG4gICAgICAgIC8vIFx1NUMxRFx1OEJENVx1NEVDRVx1NjgzOVx1NzZFRVx1NUY1NVx1NjdFNVx1NjI3RVxuICAgICAgICBjb25zdCByb290VXRpbFBhdGggPSByZXNvbHZlKGFwcERpciwgJy4uLy4uL25vZGVfbW9kdWxlcy91dGlsJyk7XG4gICAgICAgIGlmIChleGlzdHNTeW5jKHJvb3RVdGlsUGF0aCkpIHtcbiAgICAgICAgICByZXR1cm4gcm9vdFV0aWxQYXRoO1xuICAgICAgICB9XG4gICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjI3RVx1NEUwRFx1NTIzMFx1RkYwQ1x1OEZENFx1NTZERVx1NTMwNVx1NTQwRFx1OEJBOSBWaXRlIFx1ODFFQVx1NTJBOFx1ODlFM1x1Njc5MFx1RkYwOFx1NUU5NFx1OEJFNVx1NTcyOCBvcHRpbWl6ZURlcHMuaW5jbHVkZSBcdTRFMkRcdUZGMDlcbiAgICAgICAgcmV0dXJuICd1dGlsJztcbiAgICAgIH0pKCksXG4gICAgfSxcbiAgICAvLyBsb2NhbGVzIFx1NUI1MFx1OERFRlx1NUY4NFx1NTIyQlx1NTQwRFx1RkYwOFx1NjI0MFx1NjcwOVx1NUU5NFx1NzUyOFx1OTBGRFx1NEY3Rlx1NzUyOFx1NTIyQlx1NTQwRFx1NjMwN1x1NTQxMVx1NkU5MFx1NzgwMVx1RkYwOVxuICAgIHtcbiAgICAgIGZpbmQ6ICdAYnRjL3NoYXJlZC1jb3JlL2xvY2FsZXMvemgtQ04nLFxuICAgICAgcmVwbGFjZW1lbnQ6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvcmUvc3JjL2J0Yy9wbHVnaW5zL2kxOG4vbG9jYWxlcy96aC1DTicpLFxuICAgIH0sXG4gICAge1xuICAgICAgZmluZDogJ0BidGMvc2hhcmVkLWNvcmUvbG9jYWxlcy9lbi1VUycsXG4gICAgICByZXBsYWNlbWVudDogd2l0aFBhY2thZ2VzKCdzaGFyZWQtY29yZS9zcmMvYnRjL3BsdWdpbnMvaTE4bi9sb2NhbGVzL2VuLVVTJyksXG4gICAgfSxcbiAgICB7XG4gICAgICBmaW5kOiAnQGJ0Yy9zaGFyZWQtY29tcG9uZW50cy9sb2NhbGVzL3poLUNOLmpzb24nLFxuICAgICAgcmVwbGFjZW1lbnQ6IHdpdGhQYWNrYWdlcygnc2hhcmVkLWNvbXBvbmVudHMvc3JjL2xvY2FsZXMvemgtQ04uanNvbicpLFxuICAgIH0sXG4gICAge1xuICAgICAgZmluZDogJ0BidGMvc2hhcmVkLWNvbXBvbmVudHMvbG9jYWxlcy9lbi1VUy5qc29uJyxcbiAgICAgIHJlcGxhY2VtZW50OiB3aXRoUGFja2FnZXMoJ3NoYXJlZC1jb21wb25lbnRzL3NyYy9sb2NhbGVzL2VuLVVTLmpzb24nKSxcbiAgICB9LFxuICAgIC8vIFx1NTE3Nlx1NEVENlx1NTIyQlx1NTQwRFx1RkYwOFx1NEVDRVx1NUJGOVx1OEM2MVx1OEY2Q1x1NjM2Mlx1NEUzQVx1NjU3MFx1N0VDNFx1NUY2Mlx1NUYwRlx1RkYwOVxuICAgIC4uLk9iamVjdC5lbnRyaWVzKGFsaWFzZXMpLm1hcCgoW2ZpbmQsIHJlcGxhY2VtZW50XSkgPT4gKHtcbiAgICAgIGZpbmQsXG4gICAgICByZXBsYWNlbWVudCxcbiAgICB9KSksXG4gIF07XG4gIFxuICByZXR1cm4ge1xuICAgIGFsaWFzOiBhbGlhc0FycmF5LFxuICAgIGRlZHVwZTogWyd2dWUnLCAndnVlLXJvdXRlcicsICdwaW5pYScsICdlbGVtZW50LXBsdXMnLCAnQGVsZW1lbnQtcGx1cy9pY29ucy12dWUnXSxcbiAgICBleHRlbnNpb25zOiBbJy5tanMnLCAnLmpzJywgJy5tdHMnLCAnLnRzJywgJy5qc3gnLCAnLnRzeCcsICcuanNvbicsICcudnVlJ10sXG4gICAgLy8gXHU3ODZFXHU0RkREIFZpdGUgXHU0RjE4XHU1MTQ4XHU0RjdGXHU3NTI4IHBhY2thZ2UuanNvbiBcdTc2ODQgZXhwb3J0cyBcdTkxNERcdTdGNkVcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTZERkJcdTUyQTAgJ2RldmVsb3BtZW50JyBcdTY3NjFcdTRFRjZcdUZGMENcdTc4NkVcdTRGRERcdTU3MjhcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFMkRcdTRGN0ZcdTc1MjhcdTZFOTBcdTc4MDFcbiAgICBjb25kaXRpb25zOiBbJ2RldmVsb3BtZW50JywgJ2ltcG9ydCcsICdtb2R1bGUnLCAnYnJvd3NlcicsICdkZWZhdWx0J10sXG4gIH07XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxjbGVhbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9jbGVhbi50c1wiOy8qKlxuICogXHU2RTA1XHU3NDA2XHU2Nzg0XHU1RUZBXHU3NkVFXHU1RjU1XHU2M0QyXHU0RUY2XG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1tjbGVhbl0nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW2NsZWFuXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW2NsZWFuXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbY2xlYW5dJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcm1TeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5cbi8qKlxuICogXHU1Qjg5XHU1MTY4XHU4RjkzXHU1MUZBXHU2NUU1XHU1RkQ3XHVGRjA4XHU5MDdGXHU1MTREIFdpbmRvd3MgXHU2M0E3XHU1MjM2XHU1M0YwXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XG4gKi9cbmZ1bmN0aW9uIHNhZmVMb2cobWVzc2FnZTogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgY29uc29sZS5pbmZvKG1lc3NhZ2UpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIFx1NTk4Mlx1Njc5Q1x1OEY5M1x1NTFGQVx1NTkzMVx1OEQyNVx1RkYwOFx1NTNFRlx1ODBGRFx1NjYyRlx1N0YxNlx1NzgwMVx1OTVFRVx1OTg5OFx1RkYwOVx1RkYwQ1x1NEY3Rlx1NzUyOFx1N0VBRlx1NjU4N1x1NjcyQ1x1OEY5M1x1NTFGQVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb250cm9sLXJlZ2V4XG4gICAgY29uc29sZS5pbmZvKG1lc3NhZ2UucmVwbGFjZSgvW15cXHgwMC1cXHg3Rl0vZywgJycpKTtcbiAgfVxufVxuXG4vKipcbiAqIFx1NUI4OVx1NTE2OFx1OEY5M1x1NTFGQVx1OEI2Nlx1NTQ0QVx1RkYwOFx1OTA3Rlx1NTE0RCBXaW5kb3dzIFx1NjNBN1x1NTIzNlx1NTNGMFx1N0YxNlx1NzgwMVx1OTVFRVx1OTg5OFx1RkYwOVxuICovXG5mdW5jdGlvbiBzYWZlV2FybihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gXHU1OTgyXHU2NzlDXHU4RjkzXHU1MUZBXHU1OTMxXHU4RDI1XHVGRjA4XHU1M0VGXHU4MEZEXHU2NjJGXHU3RjE2XHU3ODAxXHU5NUVFXHU5ODk4XHVGRjA5XHVGRjBDXHU0RjdGXHU3NTI4XHU3RUFGXHU2NTg3XHU2NzJDXHU4RjkzXHU1MUZBXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnRyb2wtcmVnZXhcbiAgICBjb25zb2xlLndhcm4obWVzc2FnZS5yZXBsYWNlKC9bXlxceDAwLVxceDdGXS9nLCAnJykpO1xuICB9XG59XG5cbi8qKlxuICogXHU2RTA1XHU3NDA2IGRpc3QgXHU3NkVFXHU1RjU1XHU2M0QyXHU0RUY2XG4gKiBcdTZERkJcdTUyQTBcdTkxQ0RcdThCRDVcdTY3M0FcdTUyMzZcdTRFRTVcdTU5MDRcdTc0MDYgV2luZG93cyBcdTRFMEFcdTc2ODRcdTY1ODdcdTRFRjZcdTk1MDFcdTVCOUFcdTk1RUVcdTk4OThcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuRGlzdFBsdWdpbihhcHBEaXI6IHN0cmluZyk6IFBsdWdpbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2NsZWFuLWRpc3QtcGx1Z2luJyxcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgY29uc3QgZGlzdERpciA9IHJlc29sdmUoYXBwRGlyLCAnZGlzdCcpO1xuICAgICAgaWYgKGV4aXN0c1N5bmMoZGlzdERpcikpIHtcbiAgICAgICAgc2FmZUxvZygnW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTZFMDVcdTc0MDZcdTY1RTdcdTc2ODQgZGlzdCBcdTc2RUVcdTVGNTUuLi4nKTtcblxuICAgICAgICAvLyBcdTZERkJcdTUyQTBcdTkxQ0RcdThCRDVcdTY3M0FcdTUyMzZcdUZGMENcdTU5MDRcdTc0MDYgV2luZG93cyBcdTRFMEFcdTc2ODRcdTY1ODdcdTRFRjZcdTk1MDFcdTVCOUFcdTk1RUVcdTk4OThcbiAgICAgICAgbGV0IHJldHJpZXMgPSA1OyAvLyBcdTU4OUVcdTUyQTBcdTkxQ0RcdThCRDVcdTZCMjFcdTY1NzBcbiAgICAgICAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcblxuICAgICAgICB3aGlsZSAocmV0cmllcyA+IDAgJiYgIXN1Y2Nlc3MpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcm1TeW5jKGRpc3REaXIsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICAgICAgc2FmZUxvZygnW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTI3MDUgZGlzdCBcdTc2RUVcdTVGNTVcdTVERjJcdTZFMDVcdTc0MDYnKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICByZXRyaWVzLS07XG4gICAgICAgICAgICBpZiAoZXJyb3IuY29kZSA9PT0gJ0VCVVNZJyB8fCBlcnJvci5jb2RlID09PSAnRU5PVEVNUFRZJykge1xuICAgICAgICAgICAgICBpZiAocmV0cmllcyA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCB3YWl0VGltZSA9ICg2IC0gcmV0cmllcykgKiAyMDA7IC8vIFx1OTAxMlx1NTg5RVx1N0I0OVx1NUY4NVx1NjVGNlx1OTVGNFx1RkYxQTIwMG1zLCA0MDBtcywgNjAwbXMsIDgwMG1zLCAxMDAwbXNcbiAgICAgICAgICAgICAgICBzYWZlV2FybihgW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTI2QTBcdUZFMEYgIFx1NzZFRVx1NUY1NVx1ODhBQlx1NTM2MFx1NzUyOFx1RkYwQ1x1N0I0OVx1NUY4NSAke3dhaXRUaW1lfW1zIFx1NTQwRVx1OTFDRFx1OEJENS4uLiAoXHU1MjY5XHU0RjU5ICR7cmV0cmllc30gXHU2QjIxKWApO1xuICAgICAgICAgICAgICAgIC8vIFx1NTQwQ1x1NkI2NVx1N0I0OVx1NUY4NVxuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICB3aGlsZSAoRGF0ZS5ub3coKSAtIHN0YXJ0IDwgd2FpdFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFx1NUZEOVx1N0I0OVx1NUY4NVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzYWZlV2FybignW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTI3NEMgXHU2NUUwXHU2Q0Q1XHU2RTA1XHU3NDA2IGRpc3QgXHU3NkVFXHU1RjU1XHVGRjA4XHU1M0VGXHU4MEZEXHU4OEFCXHU1MTc2XHU0RUQ2XHU3QTBCXHU1RThGXHU1MzYwXHU3NTI4XHVGRjA5Jyk7XG4gICAgICAgICAgICAgICAgc2FmZVdhcm4oJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHU2M0QwXHU3OTNBXHVGRjFBXHU4QkY3XHU1MTczXHU5NUVEXHU1M0VGXHU4MEZEXHU1MzYwXHU3NTI4XHU2NTg3XHU0RUY2XHU3Njg0XHU3QTBCXHU1RThGXHVGRjA4XHU1OTgyXHU2NTg3XHU0RUY2XHU4RDQ0XHU2RTkwXHU3QkExXHU3NDA2XHU1NjY4XHUzMDAxXHU3RjE2XHU4RjkxXHU1NjY4XHU3QjQ5XHVGRjA5Jyk7XG4gICAgICAgICAgICAgICAgc2FmZVdhcm4oJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHU2MjE2XHU4MDA1XHU2MjRCXHU1MkE4XHU1MjIwXHU5NjY0IGRpc3QgXHU3NkVFXHU1RjU1XHU1NDBFXHU5MUNEXHU2NUIwXHU2Nzg0XHU1RUZBJyk7XG4gICAgICAgICAgICAgICAgc2FmZVdhcm4oJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHU2Nzg0XHU1RUZBXHU1QzA2XHU3RUU3XHU3RUVEXHVGRjBDXHU0RjQ2XHU2NUU3XHU3Njg0XHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU0RTBEXHU0RjFBXHU4OEFCXHU2RTA1XHU3NDA2XHVGRjBDXHU1M0VGXHU4MEZEXHU1QkZDXHU4MUY0XHU5MUNEXHU1OTBEXHU2NTg3XHU0RUY2Jyk7XG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7IC8vIFx1N0VFN1x1N0VFRFx1Njc4NFx1NUVGQVx1RkYwQ1x1NEUwRFx1OTYzQlx1NTg1RVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgICAgICAgIC8vIFx1NzZFRVx1NUY1NVx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1NEUwRFx1OTcwMFx1ODk4MVx1NkUwNVx1NzQwNlxuICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFx1NTE3Nlx1NEVENlx1OTUxOVx1OEJFRlx1RkYwQ1x1NzZGNFx1NjNBNVx1NjI5Qlx1NTFGQVxuICAgICAgICAgICAgICBzYWZlV2FybignW2NsZWFuLWRpc3QtcGx1Z2luXSBcdTZFMDVcdTc0MDYgZGlzdCBcdTc2RUVcdTVGNTVcdTU5MzFcdThEMjU6ICcgKyBlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgc2FmZVdhcm4oJ1tjbGVhbi1kaXN0LXBsdWdpbl0gXHU2Nzg0XHU1RUZBXHU1QzA2XHU3RUU3XHU3RUVEXHVGRjBDXHU0RjQ2XHU2NUU3XHU3Njg0XHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU0RTBEXHU0RjFBXHU4OEFCXHU2RTA1XHU3NDA2Jyk7XG4gICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlOyAvLyBcdTdFRTdcdTdFRURcdTY3ODRcdTVFRkFcdUZGMENcdTRFMERcdTk2M0JcdTU4NUVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNhZmVMb2coJ1tjbGVhbi1kaXN0LXBsdWdpbl0gZGlzdCBcdTc2RUVcdTVGNTVcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTY1RTBcdTk3MDBcdTZFMDVcdTc0MDYnKTtcbiAgICAgIH1cbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXHVybC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy91cmwudHNcIjsvKipcbiAqIFVSTCBcdTc2RjhcdTUxNzNcdTYzRDJcdTRFRjZcbiAqIFx1Nzg2RVx1NEZERCBiYXNlIFVSTCBcdTZCNjNcdTc4NkVcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW3VybF0nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW3VybF0nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1t1cmxdJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1t1cmxdJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHR5cGUgeyBDaHVua0luZm8sIE91dHB1dE9wdGlvbnMsIE91dHB1dEJ1bmRsZSB9IGZyb20gJ3JvbGx1cCc7XG5pbXBvcnQgeyBleGlzdHNTeW5jLCByZWFkRmlsZVN5bmMgfSBmcm9tICdub2RlOmZzJztcbmltcG9ydCB7IHJlc29sdmUgYXMgcmVzb2x2ZVBhdGgsIGRpcm5hbWUgfSBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcblxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcbmNvbnN0IF9fZGlybmFtZSA9IGRpcm5hbWUoX19maWxlbmFtZSk7XG5cbmZ1bmN0aW9uIGdldEJ1aWxkVGltZXN0YW1wRm9yUXVlcnkoKTogc3RyaW5nIHtcbiAgLy8gXHU0RjE4XHU1MTQ4XHU0RjdGXHU3NTI4XHU1MTY4XHU5MUNGXHU2Nzg0XHU1RUZBXHU4MTFBXHU2NzJDXHU2Q0U4XHU1MTY1XHU3Njg0XHU2NUY2XHU5NUY0XHU2MjMzXHVGRjA4XHU0RTBFIGFkZFZlcnNpb25QbHVnaW4gXHU0RkREXHU2MzAxXHU0RTAwXHU4MUY0XHVGRjA5XG4gIGlmIChwcm9jZXNzLmVudi5CVENfQlVJTERfVElNRVNUQU1QKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52LkJUQ19CVUlMRF9USU1FU1RBTVA7XG4gIH1cbiAgLy8gXHU1MTc2XHU2QjIxXHU4QkZCXHU1M0Q2IC5idWlsZC10aW1lc3RhbXBcdUZGMDhcdTRFMEUgYWRkVmVyc2lvblBsdWdpbiBcdTc2ODRcdTVCOUVcdTczQjBcdTRFMDBcdTgxRjRcdUZGMDlcbiAgY29uc3QgdGltZXN0YW1wRmlsZSA9IHJlc29sdmVQYXRoKF9fZGlybmFtZSwgJy4uLy4uLy4uLy5idWlsZC10aW1lc3RhbXAnKTtcbiAgaWYgKGV4aXN0c1N5bmModGltZXN0YW1wRmlsZSkpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdHMgPSByZWFkRmlsZVN5bmModGltZXN0YW1wRmlsZSwgJ3V0Zi04JykudHJpbSgpO1xuICAgICAgaWYgKHRzKSByZXR1cm4gdHM7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBpZ25vcmVcbiAgICB9XG4gIH1cbiAgLy8gXHU2NzAwXHU1NDBFXHU1MTVDXHU1RTk1XHVGRjFBXHU3NTFGXHU2MjEwXHU0RTAwXHU0RTJBXHVGRjA4XHU0RTBEXHU1MTk5XHU1NkRFXHU2NTg3XHU0RUY2XHVGRjBDXHU5MDdGXHU1MTREXHU1MjZGXHU0RjVDXHU3NTI4XHVGRjA5XG4gIHJldHVybiBEYXRlLm5vdygpLnRvU3RyaW5nKDM2KTtcbn1cblxuLyoqXG4gKiBcdTc4NkVcdTRGREQgYmFzZSBVUkwgXHU2M0QyXHU0RUY2XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVCYXNlVXJsUGx1Z2luKGJhc2VVcmw6IHN0cmluZywgYXBwSG9zdDogc3RyaW5nLCBhcHBQb3J0OiBudW1iZXIsIG1haW5BcHBQb3J0OiBzdHJpbmcpOiBQbHVnaW4ge1xuICBjb25zdCBpc1ByZXZpZXdCdWlsZCA9IGJhc2VVcmwuc3RhcnRzV2l0aCgnaHR0cCcpO1xuICBjb25zdCBxaWFua3VuSW5kZXhJbXBvcnRSZWdleCA9IC9pbXBvcnRcXCgoWydcIl0pXFwvYXNzZXRzXFwvKGluZGV4fG1haW4pLShbXidcIl0rKVxcMVxcKS9nO1xuICBjb25zdCBidWlsZFRpbWVzdGFtcCA9IGdldEJ1aWxkVGltZXN0YW1wRm9yUXVlcnkoKTtcbiAgY29uc3QgcWlhbmt1bkluZGV4SW1wb3J0SW5IdG1sUmVnZXggPSAvaW1wb3J0XFwoXFxzKihbJ1wiXSkoXFwvYXNzZXRzXFwvKGluZGV4fG1haW4pLVteJ1wiXSspXFwxXFxzKlxcKS9nO1xuXG4gIC8qKlxuICAgKiBcdTRGRUVcdTU5MEQgdml0ZS1wbHVnaW4tcWlhbmt1biBcdTc1MUZcdTYyMTBcdTc2ODRcdTUzMDVcdTg4QzVcdTU2NjhcdTkxQ0NcdTRGN0ZcdTc1MjhcdTdFRERcdTVCRjlcdThERUZcdTVGODQgaW1wb3J0KCcvYXNzZXRzL2luZGV4LXh4eC5qcycpIFx1NzY4NFx1OTVFRVx1OTg5OFx1RkYxQVxuICAgKiAtIFx1NTcyOCBxaWFua3VuIFx1NkM5OVx1N0JCMVx1OTFDQ1x1RkYwQ1x1OEZEOVx1NEYxQVx1NjMwOVx1MjAxQ1x1NUJCRlx1NEUzQiBvcmlnaW5cdTIwMURcdTg5RTNcdTY3OTBcdUZGMENcdTVCRkNcdTgxRjRcdTVCNTBcdTVFOTRcdTc1MjhcdTUxNjVcdTUzRTMgY2h1bmsgXHU4OEFCXHU5NTE5XHU4QkVGXHU4QkY3XHU2QzQyXHU1MjMwIGxheW91dCBcdTU3REZcdTU0MERcbiAgICogLSBcdThGRDlcdTkxQ0NcdTY1MzlcdTRFM0FcdUZGMUFcdTRGMThcdTUxNDhcdTRGN0ZcdTc1MjggcWlhbmt1biBcdTZDRThcdTUxNjVcdTc2ODQgX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX19cdUZGMDhcdTkwMUFcdTVFMzhcdTRFM0FcdTVCNTBcdTVFOTRcdTc1Mjggb3JpZ2luXHVGRjA5XHVGRjBDXHU1NDI2XHU1MjE5XHU1NkRFXHU5MDAwXHU1MjMwIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW5cbiAgICovXG4gIGZ1bmN0aW9uIHBhdGNoUWlhbmt1bkluZGV4SW1wb3J0cyhjb2RlOiBzdHJpbmcpOiB7IGNvZGU6IHN0cmluZzsgbW9kaWZpZWQ6IGJvb2xlYW4gfSB7XG4gICAgaWYgKCFxaWFua3VuSW5kZXhJbXBvcnRSZWdleC50ZXN0KGNvZGUpKSB7XG4gICAgICByZXR1cm4geyBjb2RlLCBtb2RpZmllZDogZmFsc2UgfTtcbiAgICB9XG4gICAgcWlhbmt1bkluZGV4SW1wb3J0UmVnZXgubGFzdEluZGV4ID0gMDtcblxuICAgIGNvbnN0IGhlbHBlck5hbWUgPSAnX19idGNRaWFua3VuQXNzZXRPcmlnaW4nO1xuICAgIGNvbnN0IHRzTmFtZSA9ICdfX2J0Y0J1aWxkVic7XG4gICAgY29uc3QgaGVscGVyRGVjbCA9XG4gICAgICBgY29uc3QgJHtoZWxwZXJOYW1lfT0oKCk9Pnt0cnl7Y29uc3QgcD13aW5kb3cmJndpbmRvdy5fX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXztgICtcbiAgICAgIGBpZihwJiZ0eXBlb2YgcD09PSdzdHJpbmcnKXtjb25zdCBzPXAucmVwbGFjZSgvXFxcXC8kLywnJyk7YCArXG4gICAgICBgaWYocy5zdGFydHNXaXRoKCdodHRwJyl8fHMuc3RhcnRzV2l0aCgnLy8nKSlyZXR1cm4gcztgICtcbiAgICAgIGByZXR1cm4gKHdpbmRvdy5sb2NhdGlvbiYmd2luZG93LmxvY2F0aW9uLm9yaWdpbj93aW5kb3cubG9jYXRpb24ub3JpZ2luOicnKStzO31gICtcbiAgICAgIGB9Y2F0Y2h7fXJldHVybiAod2luZG93LmxvY2F0aW9uJiZ3aW5kb3cubG9jYXRpb24ub3JpZ2luKT93aW5kb3cubG9jYXRpb24ub3JpZ2luOicnO30pKCk7YDtcbiAgICBjb25zdCB0c0RlY2wgPSBgY29uc3QgJHt0c05hbWV9PScke2J1aWxkVGltZXN0YW1wfSc7YDtcblxuICAgIGxldCBuZXdDb2RlID0gY29kZS5yZXBsYWNlKHFpYW5rdW5JbmRleEltcG9ydFJlZ2V4LCAoX20sIF9xLCBfa2luZCwgcmVzdCkgPT4ge1xuICAgICAgLy8gcmVzdDogXCJ4eHh4LmpzXCIgXHU5MUNDXHU3Njg0XHU0RjU5XHU0RTBCXHU5MEU4XHU1MjA2XHVGRjA4aGFzaCArIC5qc1x1RkYwOVxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU4RkZEXHU1MkEwID92PSBcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdUZGMENcdTkwN0ZcdTUxNERcdTVCQkZcdTRFM0IvXHU2RDRGXHU4OUM4XHU1NjY4L0NETiBcdTU5MERcdTc1MjhcdTY1RTdcdTUxNjVcdTUzRTNcdTgxMUFcdTY3MkNcdTVCRkNcdTgxRjRcdTYzMDFcdTdFRURcdThCRjdcdTZDNDJcdTY1RTcgY2h1bmtcbiAgICAgIHJldHVybiBgaW1wb3J0KC8qIEB2aXRlLWlnbm9yZSAqLyAoJHtoZWxwZXJOYW1lfSArICcvYXNzZXRzLyR7X2tpbmR9LSR7cmVzdH0nICsgJz92PScgKyAke3RzTmFtZX0pKWA7XG4gICAgfSk7XG5cbiAgICBpZiAoIW5ld0NvZGUuaW5jbHVkZXMoaGVscGVyRGVjbCkpIHtcbiAgICAgIC8vIFx1NUMzRFx1OTFDRlx1NUMxMVx1NEZCNVx1NTE2NVx1RkYxQVx1NTNFQVx1NTcyOFx1OTcwMFx1ODk4MVx1NjVGNlx1NjNEMlx1NTE2NSBoZWxwZXJcdUZGMENcdTRFMDBcdTZCMjFcdTUzNzNcdTUzRUZcbiAgICAgIG5ld0NvZGUgPSBgJHt0c0RlY2x9XFxuJHtoZWxwZXJEZWNsfVxcbiR7bmV3Q29kZX1gO1xuICAgIH1cbiAgICByZXR1cm4geyBjb2RlOiBuZXdDb2RlLCBtb2RpZmllZDogdHJ1ZSB9O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnZW5zdXJlLWJhc2UtdXJsJyxcbiAgICByZW5kZXJDaHVuayhjb2RlOiBzdHJpbmcsIGNodW5rOiBDaHVua0luZm8sIF9vcHRpb25zOiBhbnkpIHtcbiAgICAgIC8vIFx1NEUwRFx1NTE4RFx1OERGM1x1OEZDNyB2ZW5kb3IgXHU3QjQ5XHU3QjJDXHU0RTA5XHU2NUI5XHU1RTkzXHVGRjBDXHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHU5MEZEXHU2QjYzXHU3ODZFXG4gICAgICAvLyBcdTU2RTBcdTRFM0EgdmVuZG9yIFx1N0I0OVx1NUU5M1x1NEUyRFx1NEU1Rlx1NTNFRlx1ODBGRFx1NTMwNVx1NTQyQlx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1NzY4NFx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFxuXG4gICAgICBsZXQgbmV3Q29kZSA9IGNvZGU7XG4gICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU0RkVFXHU1OTBEIHFpYW5rdW4gXHU1MzA1XHU4OEM1XHU1NjY4XHU3Njg0XHU3RUREXHU1QkY5IC9hc3NldHMvaW5kZXgteHh4LmpzIFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1RkYwOFx1OERFOFx1NTdERlx1NUJCRlx1NEUzQlx1NEYxQSA0MDRcdUZGMDlcbiAgICAgIHtcbiAgICAgICAgY29uc3QgcGF0Y2hlZCA9IHBhdGNoUWlhbmt1bkluZGV4SW1wb3J0cyhuZXdDb2RlKTtcbiAgICAgICAgaWYgKHBhdGNoZWQubW9kaWZpZWQpIHtcbiAgICAgICAgICBuZXdDb2RlID0gcGF0Y2hlZC5jb2RlO1xuICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgICAgY29uc3QgcmVsYXRpdmVQYXRoUmVnZXggPSAvKFtcIidgXSkoXFwvYXNzZXRzXFwvW15cIidgXFxzXSspKFxcP1teXCInYFxcc10qKT8vZztcbiAgICAgICAgaWYgKHJlbGF0aXZlUGF0aFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHJlbGF0aXZlUGF0aFJlZ2V4LCAoX21hdGNoLCBxdW90ZSwgcGF0aCwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGAke3F1b3RlfSR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRFx1OTUxOVx1OEJFRlx1NzY4NFx1N0FFRlx1NTNFM1x1RkYwOFx1NEUzQlx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFMyAtPiBcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcdUZGMDlcbiAgICAgIC8vIFx1NTMzOVx1OTE0RCBodHRwOi8vbG9jYWxob3N0OjQxODAvYXNzZXRzL3h4eCBcdTYyMTYgaHR0cDovLzEwLjgwLjguMTk5OjQxODAvYXNzZXRzL3h4eFxuICAgICAgY29uc3Qgd3JvbmdQb3J0SHR0cFJlZ2V4ID0gbmV3IFJlZ0V4cChgaHR0cDovLygke2FwcEhvc3R9fGxvY2FsaG9zdCk6JHttYWluQXBwUG9ydH0oL2Fzc2V0cy9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpO1xuICAgICAgaWYgKHdyb25nUG9ydEh0dHBSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uod3JvbmdQb3J0SHR0cFJlZ2V4LCAoX21hdGNoLCBob3N0LCBwYXRoLCBxdWVyeSA9ICcnKSA9PiB7XG4gICAgICAgICAgLy8gXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4IGJhc2VVcmxcdUZGMDhcdTUzMDVcdTU0MkJcdTVCOENcdTY1NzQgVVJMXHVGRjA5XG4gICAgICAgICAgaWYgKGlzUHJldmlld0J1aWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gYCR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFx1NUYwMFx1NTNEMVx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOFx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFM1xuICAgICAgICAgIHJldHVybiBgaHR0cDovLyR7aG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgIH0pO1xuICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTMzOVx1OTE0RCAvL2xvY2FsaG9zdDo0MTgwL2Fzc2V0cy94eHggXHU2MjE2IC8vMTAuODAuOC4xOTk6NDE4MC9hc3NldHMveHh4XG4gICAgICBjb25zdCB3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4ID0gbmV3IFJlZ0V4cChgLy8oJHthcHBIb3N0fXxsb2NhbGhvc3QpOiR7bWFpbkFwcFBvcnR9KC9hc3NldHMvW15cIidcXGBcXFxcc10rKShcXFxcP1teXCInXFxgXFxcXHNdKik/YCwgJ2cnKTtcbiAgICAgIGlmICh3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZSh3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4LCAoX21hdGNoLCBob3N0LCBwYXRoLCBxdWVyeSA9ICcnKSA9PiB7XG4gICAgICAgICAgLy8gXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4IGJhc2VVcmxcdUZGMDhcdTUzMDVcdTU0MkJcdTVCOENcdTY1NzQgVVJMXHVGRjA5XG4gICAgICAgICAgaWYgKGlzUHJldmlld0J1aWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gYCR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFx1NUYwMFx1NTNEMVx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOFx1NUY1M1x1NTI0RFx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFM1xuICAgICAgICAgIHJldHVybiBgLy8ke2hvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICB9KTtcbiAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwYXR0ZXJucyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKGAoaHR0cDovLykobG9jYWxob3N0fCR7YXBwSG9zdH0pOiR7bWFpbkFwcFBvcnR9KC9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpLFxuICAgICAgICAgIHJlcGxhY2VtZW50OiAoX21hdGNoOiBzdHJpbmcsIHByb3RvY29sOiBzdHJpbmcsIF9ob3N0OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYCR7cHJvdG9jb2x9JHthcHBIb3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVnZXg6IG5ldyBSZWdFeHAoYCgvLykobG9jYWxob3N0fCR7YXBwSG9zdH0pOiR7bWFpbkFwcFBvcnR9KC9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpLFxuICAgICAgICAgIHJlcGxhY2VtZW50OiAoX21hdGNoOiBzdHJpbmcsIHByb3RvY29sOiBzdHJpbmcsIF9ob3N0OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYCR7cHJvdG9jb2x9JHthcHBIb3N0fToke2FwcFBvcnR9JHtwYXRofSR7cXVlcnl9YDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcmVnZXg6IG5ldyBSZWdFeHAoYChbXCInXFxgXSkoaHR0cDovLykobG9jYWxob3N0fCR7YXBwSG9zdH0pOiR7bWFpbkFwcFBvcnR9KC9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpLFxuICAgICAgICAgIHJlcGxhY2VtZW50OiAoX21hdGNoOiBzdHJpbmcsIHF1b3RlOiBzdHJpbmcsIHByb3RvY29sOiBzdHJpbmcsIF9ob3N0OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYCR7cXVvdGV9JHtwcm90b2NvbH0ke2FwcEhvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICByZWdleDogbmV3IFJlZ0V4cChgKFtcIidcXGBdKSgvLykobG9jYWxob3N0fCR7YXBwSG9zdH0pOiR7bWFpbkFwcFBvcnR9KC9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpLFxuICAgICAgICAgIHJlcGxhY2VtZW50OiAoX21hdGNoOiBzdHJpbmcsIHF1b3RlOiBzdHJpbmcsIHByb3RvY29sOiBzdHJpbmcsIF9ob3N0OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYCR7cXVvdGV9JHtwcm90b2NvbH0ke2FwcEhvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdO1xuXG4gICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgcGF0dGVybnMpIHtcbiAgICAgICAgaWYgKHBhdHRlcm4ucmVnZXgudGVzdChuZXdDb2RlKSkge1xuICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2UocGF0dGVybi5yZWdleCwgcGF0dGVybi5yZXBsYWNlbWVudCBhcyBhbnkpO1xuICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTRGRUVcdTU5MERcdTRFODYgJHtjaHVuay5maWxlTmFtZX0gXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0ICgke21haW5BcHBQb3J0fSAtPiAke2FwcFBvcnR9KWApO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGNvZGU6IG5ld0NvZGUsXG4gICAgICAgICAgbWFwOiBudWxsLFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIGdlbmVyYXRlQnVuZGxlKF9vcHRpb25zOiBPdXRwdXRPcHRpb25zLCBidW5kbGU6IE91dHB1dEJ1bmRsZSkge1xuICAgICAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNodW5rXSBvZiBPYmplY3QuZW50cmllcyhidW5kbGUpKSB7XG4gICAgICAgIGNvbnN0IGM6IGFueSA9IGNodW5rO1xuICAgICAgICBpZiAoYy50eXBlID09PSAnY2h1bmsnICYmIGMuY29kZSkge1xuICAgICAgICAgIC8vIFx1NEUwRFx1NTE4RFx1OERGM1x1OEZDNyB2ZW5kb3IgXHU3QjQ5XHU3QjJDXHU0RTA5XHU2NUI5XHU1RTkzXHVGRjBDXHU3ODZFXHU0RkREXHU2MjQwXHU2NzA5XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHU5MEZEXHU2QjYzXHU3ODZFXG4gICAgICAgICAgbGV0IG5ld0NvZGUgPSBjLmNvZGU7XG4gICAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MEQgcWlhbmt1biBcdTUzMDVcdTg4QzVcdTU2NjhcdTc2ODRcdTdFRERcdTVCRjkgL2Fzc2V0cy9pbmRleC14eHguanMgXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHVGRjA4XHU4REU4XHU1N0RGXHU1QkJGXHU0RTNCXHU0RjFBIDQwNFx1RkYwOVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IHBhdGNoZWQgPSBwYXRjaFFpYW5rdW5JbmRleEltcG9ydHMobmV3Q29kZSk7XG4gICAgICAgICAgICBpZiAocGF0Y2hlZC5tb2RpZmllZCkge1xuICAgICAgICAgICAgICBuZXdDb2RlID0gcGF0Y2hlZC5jb2RlO1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGlzUHJldmlld0J1aWxkKSB7XG4gICAgICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGhSZWdleCA9IC8oW1wiJ2BdKShcXC9hc3NldHNcXC9bXlwiJ2BcXHNdKykoXFw/W15cIidgXFxzXSopPy9nO1xuICAgICAgICAgICAgaWYgKHJlbGF0aXZlUGF0aFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgICAgbmV3Q29kZSA9IG5ld0NvZGUucmVwbGFjZShyZWxhdGl2ZVBhdGhSZWdleCwgKF9tYXRjaDogc3RyaW5nLCBxdW90ZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtxdW90ZX0ke2Jhc2VVcmwucmVwbGFjZSgvXFwvJC8sICcnKX0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEZFRVx1NTkwRFx1OTUxOVx1OEJFRlx1NzY4NFx1N0FFRlx1NTNFM1x1RkYwOFx1NEUzQlx1NUU5NFx1NzUyOFx1N0FFRlx1NTNFMyAtPiBcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdTdBRUZcdTUzRTNcdUZGMDlcbiAgICAgICAgICAvLyBcdTUzMzlcdTkxNEQgaHR0cDovL2xvY2FsaG9zdDo0MTgwL2Fzc2V0cy94eHggXHU2MjE2IGh0dHA6Ly8xMC44MC44LjE5OTo0MTgwL2Fzc2V0cy94eHhcbiAgICAgICAgICBjb25zdCB3cm9uZ1BvcnRIdHRwUmVnZXggPSBuZXcgUmVnRXhwKGBodHRwOi8vKCR7YXBwSG9zdH18bG9jYWxob3N0KToke21haW5BcHBQb3J0fSgvYXNzZXRzL1teXCInXFxgXFxcXHNdKykoXFxcXD9bXlwiJ1xcYFxcXFxzXSopP2AsICdnJyk7XG4gICAgICAgICAgaWYgKHdyb25nUG9ydEh0dHBSZWdleC50ZXN0KG5ld0NvZGUpKSB7XG4gICAgICAgICAgICBuZXdDb2RlID0gbmV3Q29kZS5yZXBsYWNlKHdyb25nUG9ydEh0dHBSZWdleCwgKF9tYXRjaDogc3RyaW5nLCBob3N0OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOCBiYXNlVXJsXHVGRjA4XHU1MzA1XHU1NDJCXHU1QjhDXHU2NTc0IFVSTFx1RkYwOVxuICAgICAgICAgICAgICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gXHU1RjAwXHU1M0QxXHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzXG4gICAgICAgICAgICAgIHJldHVybiBgaHR0cDovLyR7aG9zdH06JHthcHBQb3J0fSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTUzMzlcdTkxNEQgLy9sb2NhbGhvc3Q6NDE4MC9hc3NldHMveHh4IFx1NjIxNiAvLzEwLjgwLjguMTk5OjQxODAvYXNzZXRzL3h4eFxuICAgICAgICAgIGNvbnN0IHdyb25nUG9ydFByb3RvY29sUmVnZXggPSBuZXcgUmVnRXhwKGAvLygke2FwcEhvc3R9fGxvY2FsaG9zdCk6JHttYWluQXBwUG9ydH0oL2Fzc2V0cy9bXlwiJ1xcYFxcXFxzXSspKFxcXFw/W15cIidcXGBcXFxcc10qKT9gLCAnZycpO1xuICAgICAgICAgIGlmICh3cm9uZ1BvcnRQcm90b2NvbFJlZ2V4LnRlc3QobmV3Q29kZSkpIHtcbiAgICAgICAgICAgIG5ld0NvZGUgPSBuZXdDb2RlLnJlcGxhY2Uod3JvbmdQb3J0UHJvdG9jb2xSZWdleCwgKF9tYXRjaDogc3RyaW5nLCBob3N0OiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFx1OTg4NFx1ODlDOFx1Njc4NFx1NUVGQVx1RkYxQVx1NEY3Rlx1NzUyOCBiYXNlVXJsXHVGRjA4XHU1MzA1XHU1NDJCXHU1QjhDXHU2NTc0IFVSTFx1RkYwOVxuICAgICAgICAgICAgICBpZiAoaXNQcmV2aWV3QnVpbGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7YmFzZVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7cGF0aH0ke3F1ZXJ5fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gXHU1RjAwXHU1M0QxXHU2Nzg0XHU1RUZBXHVGRjFBXHU0RjdGXHU3NTI4XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU3QUVGXHU1M0UzXG4gICAgICAgICAgICAgIHJldHVybiBgLy8ke2hvc3R9OiR7YXBwUG9ydH0ke3BhdGh9JHtxdWVyeX1gO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgICAoY2h1bmsgYXMgYW55KS5jb2RlID0gbmV3Q29kZTtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU1NzI4IGdlbmVyYXRlQnVuZGxlIFx1NEUyRFx1NEZFRVx1NTkwRFx1NEU4NiAke2ZpbGVOYW1lfSBcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdThERUZcdTVGODRgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoYy50eXBlID09PSAnYXNzZXQnICYmIGZpbGVOYW1lID09PSAnaW5kZXguaHRtbCcpIHtcbiAgICAgICAgICAvLyBcdTU5MDRcdTc0MDYgSFRNTCBcdTY1ODdcdTRFRjZcdTRFMkRcdTc2ODRcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcbiAgICAgICAgICAvLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU5ODJcdTY3OUMgVml0ZSBcdTkxNERcdTdGNkVcdTZCNjNcdTc4NkVcdUZGMDhiYXNlOiAnLycsIGFzc2V0c0RpcjogJ2Fzc2V0cycsIHJvbGx1cE9wdGlvbnMub3V0cHV0LmNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnXHVGRjA5XHVGRjBDXG4gICAgICAgICAgLy8gVml0ZSBcdTVFOTRcdThCRTVcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTBcdTZCNjNcdTc4NkVcdTc2ODRcdThERUZcdTVGODRcdUZGMENcdTRFMERcdTk3MDBcdTg5ODFcdTRGRUVcdTU5MERcdTMwMDJcbiAgICAgICAgICAvLyBcdThGRDlcdTkxQ0NcdTUzRUFcdTU5MDRcdTc0MDZcdTk4ODRcdTg5QzhcdTY3ODRcdTVFRkFcdTY1RjZcdTc2ODRcdTdBRUZcdTUzRTNcdTRGRUVcdTU5MERcdUZGMENcdTRFRTVcdTUzQ0FcdTRGRUVcdTU5MERcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTMwMDJcbiAgICAgICAgICBsZXQgaHRtbENvbnRlbnQgPSAoKGMgYXMgYW55KS5zb3VyY2UpIGFzIHN0cmluZztcbiAgICAgICAgICBsZXQgaHRtbE1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgICAvLyBcdTRGRUVcdTU5MERcdTc2RjhcdTVCRjlcdThERUZcdTVGODQgLi9hc3NldHMvIFx1NEUzQVx1N0VERFx1NUJGOVx1OERFRlx1NUY4NCAvYXNzZXRzL1x1RkYwOFx1NTk4Mlx1Njc5Q1x1NTFGQVx1NzNCMFx1RkYwOVxuICAgICAgICAgIGNvbnN0IHJlbGF0aXZlQXNzZXRSZWdleCA9IC8oaHJlZnxzcmMpPVtcIiddKFxcLlxcL2Fzc2V0c1xcL1teXCInXSspKFxcP1teXCInXSopP1tcIiddL2c7XG4gICAgICAgICAgaWYgKHJlbGF0aXZlQXNzZXRSZWdleC50ZXN0KGh0bWxDb250ZW50KSkge1xuICAgICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKHJlbGF0aXZlQXNzZXRSZWdleCwgKF9tYXRjaCwgYXR0ciwgcGF0aCwgcXVlcnkgPSAnJykgPT4ge1xuICAgICAgICAgICAgICAvLyBcdTVDMDZcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdThGNkNcdTYzNjJcdTRFM0FcdTdFRERcdTVCRjlcdThERUZcdTVGODRcbiAgICAgICAgICAgICAgY29uc3QgYWJzb2x1dGVQYXRoID0gcGF0aC5yZXBsYWNlKC9eXFwuLywgJycpO1xuICAgICAgICAgICAgICBodG1sTW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtYmFzZS11cmxdIFx1NEZFRVx1NTkwRFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NDogJHtwYXRofSAtPiAke2Fic29sdXRlUGF0aH1gKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJ9PVwiJHthYnNvbHV0ZVBhdGh9JHtxdWVyeX1cImA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MEQgdml0ZS1wbHVnaW4tcWlhbmt1biBcdTZDRThcdTUxNjVcdTUyMzAgaW5kZXguaHRtbCBcdTUxODVcdTgwNTRcdTgxMUFcdTY3MkNcdTRFMkRcdTc2ODQgaW1wb3J0KCcvYXNzZXRzL2luZGV4LXh4eC5qcycpXG4gICAgICAgICAgLy8gXHU4QkY0XHU2NjBFXHVGRjFBcWlhbmt1biBcdTRGMUFcdTYyOEFcdThCRTVcdTUxODVcdTgwNTRcdTgxMUFcdTY3MkMgZXZhbCBcdTYyMTAgVk0gXHU2MjY3XHU4ODRDXHVGRjFCXHU1OTgyXHU2NzlDXHU0RUNEXHU2NjJGIC9hc3NldHMvIFx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1RkYwQ1x1NUMzMVx1NEYxQVx1NjMwOVx1NUJCRlx1NEUzQlx1NTdERlx1NTQwRFx1ODlFM1x1Njc5MFx1RkYwOFx1NUJGQ1x1ODFGNCBsYXlvdXQgXHU1N0RGXHU1NDBEIDQwNFx1RkYwOVx1MzAwMlxuICAgICAgICAgIC8vIFx1OEZEOVx1OTFDQ1x1NjUzOVx1NEUzQVx1RkYxQVx1NEYxOFx1NTE0OFx1NzUyOCBfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fX1x1RkYwOFx1NUI1MFx1NUU5NFx1NzUyOCBwdWJsaWNQYXRoL29yaWdpblx1RkYwOVx1RkYwQ1x1NUU3Nlx1OEZGRFx1NTJBMCA/dj0gXHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHVGRjBDXHU5MDdGXHU1MTREXHU3RjEzXHU1QjU4XHU2NUU3XHU1MTY1XHU1M0UzXHUzMDAyXG4gICAgICAgICAgaWYgKHFpYW5rdW5JbmRleEltcG9ydEluSHRtbFJlZ2V4LnRlc3QoaHRtbENvbnRlbnQpKSB7XG4gICAgICAgICAgICBxaWFua3VuSW5kZXhJbXBvcnRJbkh0bWxSZWdleC5sYXN0SW5kZXggPSAwO1xuICAgICAgICAgICAgY29uc3Qgb3JpZ2luRXhwciA9XG4gICAgICAgICAgICAgIGAoKHR5cGVvZiBfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXyE9PSd1bmRlZmluZWQnJiZfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXylgICtcbiAgICAgICAgICAgICAgYD9uZXcgVVJMKF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fLCh0eXBlb2YgbG9jYXRpb24hPT0ndW5kZWZpbmVkJyYmbG9jYXRpb24ub3JpZ2luKXx8JycpLm9yaWdpbmAgK1xuICAgICAgICAgICAgICBgOigodHlwZW9mIGxvY2F0aW9uIT09J3VuZGVmaW5lZCcmJmxvY2F0aW9uLm9yaWdpbil8fCcnKSlgO1xuICAgICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKHFpYW5rdW5JbmRleEltcG9ydEluSHRtbFJlZ2V4LCAoX20sIF9xLCBhYnNQYXRoKSA9PiB7XG4gICAgICAgICAgICAgIGh0bWxNb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIHJldHVybiBgaW1wb3J0KC8qIEB2aXRlLWlnbm9yZSAqLyAoJHtvcmlnaW5FeHByfSArICcke2Fic1BhdGh9JyArICc/dj0ke2J1aWxkVGltZXN0YW1wfScpKWA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2Vuc3VyZS1iYXNlLXVybF0gXHU0RkVFXHU1OTBEIGluZGV4Lmh0bWwgXHU1MTg1XHU4MDU0IGltcG9ydCgvYXNzZXRzL2luZGV4LSouanMpIFx1NUU3Nlx1OEZGRFx1NTJBMCB2PSR7YnVpbGRUaW1lc3RhbXB9YCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU1OTgyXHU2NzlDXHU1MUZBXHU3M0IwXHU2ODM5XHU3NkVFXHU1RjU1XHU3Njg0XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHVGRjA4XHU1OTgyIC9pbmRleC5qc1x1RkYwOVx1RkYwQ1x1OEJGNFx1NjYwRVx1OTE0RFx1N0Y2RVx1NjcwOVx1OTVFRVx1OTg5OFx1RkYwQ1x1OEJCMFx1NUY1NVx1OEI2Nlx1NTQ0QVxuICAgICAgICAgIC8vIFx1NkI2M1x1NUUzOFx1NjBDNVx1NTFCNVx1NEUwQlx1RkYwQ1ZpdGUgXHU1RTk0XHU4QkU1XHU3NTFGXHU2MjEwIC9hc3NldHMvW25hbWVdLVtoYXNoXS5qcyBcdThGRDlcdTY4MzdcdTc2ODRcdThERUZcdTVGODRcbiAgICAgICAgICBjb25zdCByb290SnNSZWdleCA9IC8oaHJlZnxzcmMpPVtcIiddKFxcLyhbXi9dK1xcLihqc3xtanMpKSkoXFw/W15cIiddKik/W1wiJ10vZztcbiAgICAgICAgICBpZiAocm9vdEpzUmVnZXgudGVzdChodG1sQ29udGVudCkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBodG1sQ29udGVudC5tYXRjaChyb290SnNSZWdleCk7XG4gICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtlbnN1cmUtYmFzZS11cmxdIFx1MjZBMFx1RkUwRiAgXHU2OEMwXHU2RDRCXHU1MjMwXHU2ODM5XHU3NkVFXHU1RjU1XHU4RDQ0XHU2RTkwXHU4REVGXHU1Rjg0XHVGRjBDXHU4RkQ5XHU5MDFBXHU1RTM4XHU0RTBEXHU1RTk0XHU4QkU1XHU1MUZBXHU3M0IwXHUzMDAyXHU4QkY3XHU2OEMwXHU2N0U1IFZpdGUgXHU5MTREXHU3RjZFXHVGRjA4YmFzZSwgYXNzZXRzRGlyLCByb2xsdXBPcHRpb25zLm91dHB1dC5jaHVua0ZpbGVOYW1lc1x1RkYwOTpgLCBtYXRjaGVzKTtcbiAgICAgICAgICAgICAgLy8gXHU0RkVFXHU1OTBEXHU4RkQ5XHU0RTlCXHU4REVGXHU1Rjg0XHVGRjA4XHU0RjVDXHU0RTNBXHU1MTVDXHU1RTk1XHU2NUI5XHU2ODQ4XHVGRjA5XG4gICAgICAgICAgICAgIGh0bWxDb250ZW50ID0gaHRtbENvbnRlbnQucmVwbGFjZShyb290SnNSZWdleCwgKF9tYXRjaCwgYXR0ciwgcGF0aCwgZmlsZU5hbWUsIF9leHQsIHF1ZXJ5ID0gJycpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXBhdGguc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKSAmJiAhcGF0aC5zdGFydHNXaXRoKCcvZmF2aWNvbicpICYmICFwYXRoLnN0YXJ0c1dpdGgoJy9sb2dvJykgJiYgIXBhdGgubWF0Y2goL1xcLihwbmd8anBnfGpwZWd8Z2lmfHN2Z3xpY298anNvbikkLykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBgL2Fzc2V0cy8ke2ZpbGVOYW1lfWA7XG4gICAgICAgICAgICAgICAgICBodG1sTW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTRGRUVcdTU5MERcdTY4MzlcdTc2RUVcdTVGNTVcdThENDRcdTZFOTBcdThERUZcdTVGODRcdUZGMDhcdTUxNUNcdTVFOTVcdUZGMDk6ICR7cGF0aH0gLT4gJHtuZXdQYXRofWApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2F0dHJ9PVwiJHtuZXdQYXRofSR7cXVlcnl9XCJgO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gX21hdGNoO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCByb290Q3NzUmVnZXggPSAvKGhyZWZ8c3JjKT1bXCInXShcXC8oW14vXStcXC5jc3MpKShcXD9bXlwiJ10qKT9bXCInXS9nO1xuICAgICAgICAgIGlmIChyb290Q3NzUmVnZXgudGVzdChodG1sQ29udGVudCkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBodG1sQ29udGVudC5tYXRjaChyb290Q3NzUmVnZXgpO1xuICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbZW5zdXJlLWJhc2UtdXJsXSBcdTI2QTBcdUZFMEYgIFx1NjhDMFx1NkQ0Qlx1NTIzMFx1NjgzOVx1NzZFRVx1NUY1NSBDU1MgXHU4REVGXHU1Rjg0XHVGRjBDXHU4RkQ5XHU5MDFBXHU1RTM4XHU0RTBEXHU1RTk0XHU4QkU1XHU1MUZBXHU3M0IwXHUzMDAyXHU4QkY3XHU2OEMwXHU2N0U1IFZpdGUgXHU5MTREXHU3RjZFOmAsIG1hdGNoZXMpO1xuICAgICAgICAgICAgICAvLyBcdTRGRUVcdTU5MERcdThGRDlcdTRFOUJcdThERUZcdTVGODRcdUZGMDhcdTRGNUNcdTRFM0FcdTUxNUNcdTVFOTVcdTY1QjlcdTY4NDhcdUZGMDlcbiAgICAgICAgICAgICAgaHRtbENvbnRlbnQgPSBodG1sQ29udGVudC5yZXBsYWNlKHJvb3RDc3NSZWdleCwgKF9tYXRjaCwgYXR0ciwgcGF0aCwgZmlsZU5hbWUsIHF1ZXJ5ID0gJycpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXBhdGguc3RhcnRzV2l0aCgnL2Fzc2V0cy8nKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGAvYXNzZXRzLyR7ZmlsZU5hbWV9YDtcbiAgICAgICAgICAgICAgICAgIGh0bWxNb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtYmFzZS11cmxdIFx1NEZFRVx1NTkwRFx1NjgzOVx1NzZFRVx1NUY1NSBDU1MgXHU4REVGXHU1Rjg0XHVGRjA4XHU1MTVDXHU1RTk1XHVGRjA5OiAke3BhdGh9IC0+ICR7bmV3UGF0aH1gKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthdHRyfT1cIiR7bmV3UGF0aH0ke3F1ZXJ5fVwiYDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9tYXRjaDtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGh0bWxNb2RpZmllZCkge1xuICAgICAgICAgICAgKGNodW5rIGFzIGFueSkuc291cmNlID0gaHRtbENvbnRlbnQ7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oYFtlbnN1cmUtYmFzZS11cmxdIFx1NEZFRVx1NTkwRFx1NEU4NiBpbmRleC5odG1sIFx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NGApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcY29ycy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy9jb3JzLnRzXCI7LyoqXG4gKiBDT1JTIFx1NjNEMlx1NEVGNlxuICogXHU2NTJGXHU2MzAxIGNyZWRlbnRpYWxzIFx1NzY4NCBDT1JTIFx1NEUyRFx1OTVGNFx1NEVGNlxuICovXG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luLCBWaXRlRGV2U2VydmVyIH0gZnJvbSAndml0ZSc7XG5cbi8qKlxuICogQ09SUyBcdTYzRDJcdTRFRjZcdUZGMDhcdTY1MkZcdTYzMDEgY3JlZGVudGlhbHNcdUZGMDlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcnNQbHVnaW4oKTogUGx1Z2luIHtcbiAgY29uc3QgY29yc0Rldk1pZGRsZXdhcmUgPSAocmVxOiBhbnksIHJlczogYW55LCBuZXh0OiBhbnkpID0+IHtcbiAgICBjb25zdCBvcmlnaW4gPSByZXEuaGVhZGVycy5vcmlnaW47XG5cbiAgICBpZiAob3JpZ2luKSB7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCBvcmlnaW4pO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnLCAndHJ1ZScpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctUHJpdmF0ZS1OZXR3b3JrJywgJ3RydWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIE9yaWdpbiwgWC1UZW5hbnQtSWQnKTtcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LVByaXZhdGUtTmV0d29yaycsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1NYXgtQWdlJywgJzg2NDAwJyk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcsICcwJyk7XG4gICAgICByZXMuZW5kKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbmV4dCgpO1xuICB9O1xuXG4gIGNvbnN0IGNvcnNQcmV2aWV3TWlkZGxld2FyZSA9IChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xuICAgIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICAgIGNvbnN0IG9yaWdpbiA9IHJlcS5oZWFkZXJzLm9yaWdpbjtcblxuICAgICAgaWYgKG9yaWdpbikge1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCBvcmlnaW4pO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJyk7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgUEFUQ0gsIE9QVElPTlMnKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbiwgWC1SZXF1ZXN0ZWQtV2l0aCwgQWNjZXB0LCBPcmlnaW4sIFgtVGVuYW50LUlkJyk7XG4gICAgICB9XG5cbiAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtTWF4LUFnZScsICc4NjQwMCcpO1xuICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1MZW5ndGgnLCAnMCcpO1xuICAgICAgcmVzLmVuZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG9yaWdpbiA9IHJlcS5oZWFkZXJzLm9yaWdpbjtcbiAgICBpZiAob3JpZ2luKSB7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCBvcmlnaW4pO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnLCAndHJ1ZScpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBQQVRDSCwgT1BUSU9OUycpO1xuICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgT3JpZ2luLCBYLVRlbmFudC1JZCcpO1xuICAgIH1cblxuICAgIG5leHQoKTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjb3JzLXdpdGgtY3JlZGVudGlhbHMnLFxuICAgIGVuZm9yY2U6ICdwcmUnLFxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpIHtcbiAgICAgIGNvbnN0IHN0YWNrID0gKHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnkpLnN0YWNrO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc3RhY2spKSB7XG4gICAgICAgIGNvbnN0IGZpbHRlcmVkU3RhY2sgPSBzdGFjay5maWx0ZXIoKGl0ZW06IGFueSkgPT5cbiAgICAgICAgICBpdGVtLmhhbmRsZSAhPT0gY29yc0Rldk1pZGRsZXdhcmUgJiYgaXRlbS5oYW5kbGUgIT09IGNvcnNQcmV2aWV3TWlkZGxld2FyZVxuICAgICAgICApO1xuICAgICAgICAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2sgPSBbXG4gICAgICAgICAgeyByb3V0ZTogJycsIGhhbmRsZTogY29yc0Rldk1pZGRsZXdhcmUgfSxcbiAgICAgICAgICAuLi5maWx0ZXJlZFN0YWNrLFxuICAgICAgICBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShjb3JzRGV2TWlkZGxld2FyZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBjb25maWd1cmVQcmV2aWV3U2VydmVyKHNlcnZlcjogVml0ZURldlNlcnZlcikge1xuICAgICAgY29uc3Qgc3RhY2sgPSAoc2VydmVyLm1pZGRsZXdhcmVzIGFzIGFueSkuc3RhY2s7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShzdGFjaykpIHtcbiAgICAgICAgY29uc3QgZmlsdGVyZWRTdGFjayA9IHN0YWNrLmZpbHRlcigoaXRlbTogYW55KSA9PlxuICAgICAgICAgIGl0ZW0uaGFuZGxlICE9PSBjb3JzRGV2TWlkZGxld2FyZSAmJiBpdGVtLmhhbmRsZSAhPT0gY29yc1ByZXZpZXdNaWRkbGV3YXJlXG4gICAgICAgICk7XG4gICAgICAgIChzZXJ2ZXIubWlkZGxld2FyZXMgYXMgYW55KS5zdGFjayA9IFtcbiAgICAgICAgICB7IHJvdXRlOiAnJywgaGFuZGxlOiBjb3JzUHJldmlld01pZGRsZXdhcmUgfSxcbiAgICAgICAgICAuLi5maWx0ZXJlZFN0YWNrLFxuICAgICAgICBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShjb3JzUHJldmlld01pZGRsZXdhcmUpO1xuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcdmVyc2lvbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy92ZXJzaW9uLnRzXCI7LyoqXG4gKiBcdTcyNDhcdTY3MkNcdTUzRjdcdTYzRDJcdTRFRjZcbiAqIFx1NEUzQSBIVE1MIFx1NjU4N1x1NEVGNlx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1NkRGQlx1NTJBMFx1NTE2OFx1NUM0MFx1N0VERlx1NEUwMFx1NzY4NFx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1NzI0OFx1NjcyQ1x1NTNGN1xuICogXHU3NTI4XHU0RThFXHU2RDRGXHU4OUM4XHU1NjY4XHU3RjEzXHU1QjU4XHU2M0E3XHU1MjM2XHVGRjBDXHU2QkNGXHU2QjIxXHU2Nzg0XHU1RUZBXHU5MEZEXHU0RjFBXHU3NTFGXHU2MjEwXHU2NUIwXHU3Njg0XHU2NUY2XHU5NUY0XHU2MjMzXG4gKi9cbi8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1NTcyOCBWaXRlUHJlc3MgXHU5MTREXHU3RjZFXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QkZDXHU1MTY1IEBidGMvc2hhcmVkLWNvcmVcbi8vIFx1NEY3Rlx1NzUyOCBjb25zb2xlIFx1NjZGRlx1NEVFMyBsb2dnZXJcbmNvbnN0IGxvZ2dlciA9IHtcbiAgd2FybjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLndhcm4oJ1t2ZXJzaW9uXScsIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmVycm9yKCdbdmVyc2lvbl0nLCAuLi5hcmdzKSxcbiAgaW5mbzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmluZm8oJ1t2ZXJzaW9uXScsIC4uLmFyZ3MpLFxuICBkZWJ1ZzogKC4uLmFyZ3M6IGFueVtdKSA9PiBjb25zb2xlLmRlYnVnKCdbdmVyc2lvbl0nLCAuLi5hcmdzKSxcbn07XG5cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBleGlzdHNTeW5jLCByZWFkRmlsZVN5bmMsIHdyaXRlRmlsZVN5bmMgfSBmcm9tICdub2RlOmZzJztcbmltcG9ydCB7IHJlc29sdmUsIGRpcm5hbWUgfSBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcblxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcbmNvbnN0IF9fZGlybmFtZSA9IGRpcm5hbWUoX19maWxlbmFtZSk7XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU2MjE2XHU3NTFGXHU2MjEwXHU1MTY4XHU1QzQwXHU2Nzg0XHU1RUZBXHU2NUY2XHU5NUY0XHU2MjMzXHU3MjQ4XHU2NzJDXHU1M0Y3XG4gKiBcdTRGMThcdTUxNDhcdTRFQ0VcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdThCRkJcdTUzRDZcdUZGMENcdTU5ODJcdTY3OUNcdTZDQTFcdTY3MDlcdTUyMTlcdTRFQ0VcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdTY1ODdcdTRFRjZcdThCRkJcdTUzRDZcdUZGMENcdTkwRkRcdTZDQTFcdTY3MDlcdTUyMTlcdTc1MUZcdTYyMTBcdTY1QjBcdTc2ODRcbiAqL1xuZnVuY3Rpb24gZ2V0QnVpbGRUaW1lc3RhbXAoKTogc3RyaW5nIHtcbiAgLy8gMS4gXHU0RjE4XHU1MTQ4XHU0RUNFXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU4QkZCXHU1M0Q2XHVGRjA4XHU3NTMxXHU2Nzg0XHU1RUZBXHU4MTFBXHU2NzJDXHU4QkJFXHU3RjZFXHVGRjA5XG4gIGlmIChwcm9jZXNzLmVudi5CVENfQlVJTERfVElNRVNUQU1QKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52LkJUQ19CVUlMRF9USU1FU1RBTVA7XG4gIH1cblxuICAvLyAyLiBcdTRFQ0VcdTY3ODRcdTVFRkFcdTY1RjZcdTk1RjRcdTYyMzNcdTY1ODdcdTRFRjZcdThCRkJcdTUzRDZcdUZGMDhcdTU5ODJcdTY3OUNcdTVCNThcdTU3MjhcdUZGMDlcbiAgY29uc3QgdGltZXN0YW1wRmlsZSA9IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vLi4vLmJ1aWxkLXRpbWVzdGFtcCcpO1xuICBpZiAoZXhpc3RzU3luYyh0aW1lc3RhbXBGaWxlKSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB0aW1lc3RhbXAgPSByZWFkRmlsZVN5bmModGltZXN0YW1wRmlsZSwgJ3V0Zi04JykudHJpbSgpO1xuICAgICAgaWYgKHRpbWVzdGFtcCkge1xuICAgICAgICByZXR1cm4gdGltZXN0YW1wO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBcdTVGRkRcdTc1NjVcdThCRkJcdTUzRDZcdTk1MTlcdThCRUZcbiAgICB9XG4gIH1cblxuICAvLyAzLiBcdTc1MUZcdTYyMTBcdTY1QjBcdTc2ODRcdTY1RjZcdTk1RjRcdTYyMzNcdTVFNzZcdTRGRERcdTVCNThcdTUyMzBcdTY1ODdcdTRFRjZcdUZGMDhcdTc4NkVcdTRGRERcdTYyNDBcdTY3MDlcdTVFOTRcdTc1MjhcdTRGN0ZcdTc1MjhcdTU0MENcdTRFMDBcdTRFMkFcdUZGMDlcbiAgLy8gXHU0RjdGXHU3NTI4MzZcdThGREJcdTUyMzZcdTdGMTZcdTc4MDFcdUZGMENcdTc1MUZcdTYyMTBcdTY2RjRcdTc3RURcdTc2ODRcdTcyNDhcdTY3MkNcdTUzRjdcdUZGMDhcdTUzMDVcdTU0MkJcdTVCNTdcdTZCQ0RcdTU0OENcdTY1NzBcdTVCNTdcdUZGMENcdTU5ODIgbDNrMmoxaFx1RkYwOVxuICBjb25zdCB0aW1lc3RhbXAgPSBEYXRlLm5vdygpLnRvU3RyaW5nKDM2KTtcbiAgdHJ5IHtcbiAgICB3cml0ZUZpbGVTeW5jKHRpbWVzdGFtcEZpbGUsIHRpbWVzdGFtcCwgJ3V0Zi04Jyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gXHU1RkZEXHU3NTY1XHU1MTk5XHU1MTY1XHU5NTE5XHU4QkVGXG4gIH1cbiAgcmV0dXJuIHRpbWVzdGFtcDtcbn1cblxuLyoqXG4gKiBcdTRFM0EgSFRNTCBcdThENDRcdTZFOTBcdTVGMTVcdTc1MjhcdTZERkJcdTUyQTBcdTcyNDhcdTY3MkNcdTUzRjdcdTYzRDJcdTRFRjZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFZlcnNpb25QbHVnaW4oKTogUGx1Z2luIHtcbiAgY29uc3QgYnVpbGRUaW1lc3RhbXAgPSBnZXRCdWlsZFRpbWVzdGFtcCgpO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2FkZC12ZXJzaW9uJyxcbiAgICBhcHBseTogJ2J1aWxkJyxcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgY29uc29sZS5pbmZvKGBbYWRkLXZlcnNpb25dIFx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NjIzM1x1NzI0OFx1NjcyQ1x1NTNGNzogJHtidWlsZFRpbWVzdGFtcH1gKTtcbiAgICB9LFxuICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEY3Rlx1NzUyOCB0cmFuc2Zvcm1JbmRleEh0bWxcdUZGMDhWaXRlIFx1NTE4NVx1OTBFOFx1NjYyRlx1NTcyOFx1NTQwRVx1N0Y2RVx1OTYzNlx1NkJCNVx1NzUxRlx1NjIxMC9cdTUxOTlcdTUxNjUgaW5kZXguaHRtbFx1RkYwQ2dlbmVyYXRlQnVuZGxlIFx1NUY4OFx1NUJCOVx1NjYxM1x1NjJGRlx1NEUwRFx1NTIzMFx1NjcwMFx1N0VDOCBIVE1MXHVGRjA5XG4gICAgdHJhbnNmb3JtSW5kZXhIdG1sOiB7XG4gICAgICBvcmRlcjogJ3Bvc3QnLFxuICAgICAgaGFuZGxlcihodG1sKSB7XG4gICAgICAgIGxldCBuZXdIdG1sID0gaHRtbDtcbiAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgLy8gMCkgXHU3OUZCXHU5NjY0XHU3QTdBXHU3Njg0IDxzdHlsZT48L3N0eWxlPiBcdTY4MDdcdTdCN0VcbiAgICAgICAgLy8gXHU4QkY0XHU2NjBFXHVGRjFBXHU1NzI4XHU1RkFFXHU1MjREXHU3QUVGXHU2N0I2XHU2Nzg0XHU0RTBCXHVGRjBDXHU1QjUwXHU1RTk0XHU3NTI4XHU1NzI4XHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU4OEFCIHFpYW5rdW4gXHU1MkEwXHU4RjdEXHU2NUY2XHVGRjBDXHU0RTNCXHU1RTk0XHU3NTI4XHU1REYyXHU3RUNGXHU2M0QwXHU0RjlCXHU0RTg2IGxvYWRpbmdcdUZGMENcbiAgICAgICAgLy8gXHU1QjUwXHU1RTk0XHU3NTI4XHU3Njg0IHN0eWxlIFx1NjgwN1x1N0I3RVx1NTNFRlx1ODBGRFx1ODhBQlx1NTkwNFx1NzQwNlx1NjIxMFx1N0E3QVx1NzY4NFx1MzAwMlx1NzlGQlx1OTY2NFx1N0E3QVx1NjgwN1x1N0I3RVx1NTNFRlx1NEVFNVx1N0I4MFx1NTMxNiBIVE1MIFx1N0VEM1x1Njc4NFx1MzAwMlxuICAgICAgICAvLyBcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFMEJcdUZGMENcdTVCNTBcdTVFOTRcdTc1MjhcdTcyRUNcdTdBQ0JcdThGRDBcdTg4NENcdUZGMENzdHlsZSBcdTY4MDdcdTdCN0VcdTY3MDlcdTUxODVcdTVCQjlcdUZGMDhsb2FkaW5nIFx1NjgzN1x1NUYwRlx1RkYwOVx1RkYwQ1x1NEUwRFx1NEYxQVx1ODhBQlx1NzlGQlx1OTY2NFx1MzAwMlxuICAgICAgICBjb25zdCBlbXB0eVN0eWxlUmVnZXggPSAvPHN0eWxlPlxccyo8XFwvc3R5bGU+L2dpO1xuICAgICAgICBpZiAoZW1wdHlTdHlsZVJlZ2V4LnRlc3QobmV3SHRtbCkpIHtcbiAgICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKGVtcHR5U3R5bGVSZWdleCwgJycpO1xuICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDEpIFx1NEUzQSA8c2NyaXB0IHNyYz4gXHU2REZCXHU1MkEwL1x1NjZGNFx1NjVCMCB2XG4gICAgICAgIC8vXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NEUwRFx1ODk4MVx1N0VEOSBFU00gbW9kdWxlIHNjcmlwdFx1RkYwOHR5cGU9XCJtb2R1bGVcIlx1RkYwOVx1OEZGRFx1NTJBMCA/dlxuICAgICAgICAvLyBcdTU0MjZcdTUyMTlcdTU0MENcdTRFMDBcdTRFMkFcdTZBMjFcdTU3NTdcdTRGMUFcdTU0MENcdTY1RjZcdTRFRTVcdTMwMENcdTVFMjYgdlx1MzAwRFx1NTQ4Q1x1MzAwQ1x1NEUwRFx1NUUyNiB2XHUzMDBEXHVGRjA4XHU5NzU5XHU2MDAxIGltcG9ydCBcdTc1MUZcdTYyMTBcdTc2ODQgVVJMXHVGRjA5XHU0RTI0XHU1OTU3IFVSTCBcdTg4QUJcdTUyQTBcdThGN0RcdUZGMENcbiAgICAgICAgLy8gXHU1NzI4XHU1RkFFXHU1MjREXHU3QUVGL1x1OTFDRFx1NTkwRFx1NTJBMFx1OEY3RFx1NTE2NVx1NTNFM1x1ODExQVx1NjcyQ1x1NTczQVx1NjY2Rlx1NEUwQlx1NEYxQVx1NUJGQ1x1ODFGNFx1NkEyMVx1NTc1N1x1NjI2N1x1ODg0Q1x1NEUyNFx1NkIyMVx1RkYwQ1x1NEVDRVx1ODAwQ1x1ODlFNlx1NTNEMVx1N0M3Qlx1NEYzQyBFQ2hhcnRzIFx1NzY4NFx1OTFDRFx1NTkwRFx1NkNFOFx1NTE4Q1x1NjVBRFx1OEEwMFx1MzAwMlxuICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgIC8oPHNjcmlwdFtePl0qXFxzK3NyYz1bXCInXSkoW15cIiddKykoW1wiJ11bXj5dKj4pL2csXG4gICAgICAgICAgKG1hdGNoOiBzdHJpbmcsIHByZWZpeDogc3RyaW5nLCBzcmM6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlzTW9kdWxlU2NyaXB0ID0gL3R5cGVcXHMqPVxccypbXCInXW1vZHVsZVtcIiddL2kudGVzdChtYXRjaCk7XG4gICAgICAgICAgICBjb25zdCBpc0Fzc2V0cyA9IHNyYy5zdGFydHNXaXRoKCcvYXNzZXRzLycpIHx8IHNyYy5zdGFydHNXaXRoKCcuL2Fzc2V0cy8nKTtcblxuICAgICAgICAgICAgLy8gXHU1QkY5IG1vZHVsZSBzY3JpcHRcdUZGMUFcdTVGM0FcdTUyMzZcdTc5RkJcdTk2NjQgdlx1RkYwQ1x1NEZERFx1OEJDMSBVUkwgXHU0RTBFXHU2MjUzXHU1MzA1XHU0RUE3XHU3MjY5XHU1MTg1XHU5MEU4IGltcG9ydCBcdTRGRERcdTYzMDFcdTRFMDBcdTgxRjRcbiAgICAgICAgICAgIGlmIChpc01vZHVsZVNjcmlwdCAmJiBpc0Fzc2V0cykge1xuICAgICAgICAgICAgICBjb25zdCBjbGVhbmVkID0gc3JjLnJlcGxhY2UoL1s/Jl12PVteJidcIl0qL2csICcnKS5yZXBsYWNlKC9cXD8mLywgJz8nKS5yZXBsYWNlKC9bPyZdJC8sICcnKTtcbiAgICAgICAgICAgICAgaWYgKGNsZWFuZWQgIT09IHNyYykge1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2xlYW5lZH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNyYy5pbmNsdWRlcygnP3Y9JykgfHwgc3JjLmluY2x1ZGVzKCcmdj0nKSkge1xuICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkID0gc3JjLnJlcGxhY2UoL1s/Jl12PVteJidcIl0qL2csIGA/dj0ke2J1aWxkVGltZXN0YW1wfWApO1xuICAgICAgICAgICAgICBpZiAodXBkYXRlZCAhPT0gc3JjKSB7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHt1cGRhdGVkfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzQXNzZXRzKSB7XG4gICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgY29uc3Qgc2VwID0gc3JjLmluY2x1ZGVzKCc/JykgPyAnJicgOiAnPyc7XG4gICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtzcmN9JHtzZXB9dj0ke2J1aWxkVGltZXN0YW1wfSR7c3VmZml4fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyAyKSBcdTRFM0EgPGxpbmsgaHJlZj4gXHU2REZCXHU1MkEwL1x1NjZGNFx1NjVCMCB2XG4gICAgICAgIC8vXG4gICAgICAgIC8vIFx1NTQwQ1x1NEUwQVx1RkYxQW1vZHVsZXByZWxvYWQgXHU1QzVFXHU0RThFIEVTTSBcdTRGOURcdThENTZcdTU2RkVcdTc2ODRcdTRFMDBcdTkwRThcdTUyMDZcdUZGMENcdThGRkRcdTUyQTAgP3YgXHU0RjFBXHU4QkE5XHU5ODg0XHU1MkEwXHU4RjdEIFVSTCBcdTRFMEUgaW1wb3J0IFVSTCBcdTRFMERcdTRFMDBcdTgxRjRcdUZGMENcbiAgICAgICAgLy8gXHU5MDIwXHU2MjEwXHU5MUNEXHU1OTBEXHU4QkY3XHU2QzQyXHU3NTFBXHU4MUYzXHU5MUNEXHU1OTBEXHU2MjY3XHU4ODRDXHVGRjA4XHU1NzI4XHU2N0QwXHU0RTlCIGxvYWRlciBcdTU3M0FcdTY2NkZcdTRFMEJcdUZGMDlcdTMwMDJcbiAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShcbiAgICAgICAgICAvKDxsaW5rW14+XSpcXHMraHJlZj1bXCInXSkoW15cIiddKykoW1wiJ11bXj5dKj4pL2csXG4gICAgICAgICAgKG1hdGNoOiBzdHJpbmcsIHByZWZpeDogc3RyaW5nLCBocmVmOiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpc01vZHVsZVByZWxvYWQgPSAvXFxzcmVsXFxzKj1cXHMqW1wiJ11tb2R1bGVwcmVsb2FkW1wiJ10vaS50ZXN0KG1hdGNoKTtcbiAgICAgICAgICAgIGNvbnN0IGlzQXNzZXRzID0gaHJlZi5zdGFydHNXaXRoKCcvYXNzZXRzLycpIHx8IGhyZWYuc3RhcnRzV2l0aCgnLi9hc3NldHMvJyk7XG5cbiAgICAgICAgICAgIGlmIChpc01vZHVsZVByZWxvYWQgJiYgaXNBc3NldHMpIHtcbiAgICAgICAgICAgICAgY29uc3QgY2xlYW5lZCA9IGhyZWYucmVwbGFjZSgvWz8mXXY9W14mJ1wiXSovZywgJycpLnJlcGxhY2UoL1xcPyYvLCAnPycpLnJlcGxhY2UoL1s/Jl0kLywgJycpO1xuICAgICAgICAgICAgICBpZiAoY2xlYW5lZCAhPT0gaHJlZikge1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2xlYW5lZH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGhyZWYuaW5jbHVkZXMoJz92PScpIHx8IGhyZWYuaW5jbHVkZXMoJyZ2PScpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWQgPSBocmVmLnJlcGxhY2UoL1s/Jl12PVteJidcIl0qL2csIGA/dj0ke2J1aWxkVGltZXN0YW1wfWApO1xuICAgICAgICAgICAgICBpZiAodXBkYXRlZCAhPT0gaHJlZikge1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7dXBkYXRlZH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0Fzc2V0cykge1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbnN0IHNlcCA9IGhyZWYuaW5jbHVkZXMoJz8nKSA/ICcmJyA6ICc/JztcbiAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2hyZWZ9JHtzZXB9dj0ke2J1aWxkVGltZXN0YW1wfSR7c3VmZml4fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyAzKSBcdTUxNzNcdTk1MkVcdUZGMUFcdTRGRUVcdTU5MEQgcWlhbmt1biBcdTZDRThcdTUxNjVcdTc2ODRcdTUxODVcdTgwNTQgaW1wb3J0KCcvYXNzZXRzL2luZGV4LXh4eC5qcycpXHVGRjBDXHU5MDdGXHU1MTREXHU4OEFCXHU1QkJGXHU0RTNCXHU1N0RGXHU1NDBEXHU4OUUzXHU2NzkwXG4gICAgICAgIC8vIFx1NkNFOFx1NjEwRlx1RkYxQVx1OEZEOVx1OTFDQ1x1NEU1Rlx1NEUwRFx1ODk4MVx1OEZGRFx1NTJBMCA/dlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NUY2Mlx1NjIxMFx1MzAwQ1x1NUUyNiB2IC8gXHU0RTBEXHU1RTI2IHZcdTMwMERcdTRFMjRcdTU5NTdcdTUxNjVcdTUzRTMgVVJMXHVGRjBDXHU1QkZDXHU4MUY0XHU1MTY1XHU1M0UzXHU2QTIxXHU1NzU3XHU4OEFCXHU5MUNEXHU1OTBEXHU2MjY3XHU4ODRDXHUzMDAyXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTcyOCBxaWFua3VuIHNhbmRib3ggXHU0RTJEXHU2NkY0XHU1M0VGXHU5NzYwXHU3Njg0XHU1MTk5XHU2Q0Q1XHU2NjJGXHU3NkY0XHU2M0E1XHU4QkZCXHU1MTY4XHU1QzQwXHU1M0Q4XHU5MUNGIF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fXG4gICAgICAgIC8vIFx1ODAwQ1x1NEUwRFx1NjYyRiB3aW5kb3cuX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX19cdUZGMDh3aW5kb3cgXHU1M0VGXHU4MEZEXHU4OEFCIHByb3h5IFx1OTFDRFx1NTE5OS9cdTRFMERcdTUzMDVcdTU0MkIgbG9jYXRpb25cdUZGMDlcdTMwMDJcbiAgICAgICAgY29uc3Qgb3JpZ2luRXhwciA9XG4gICAgICAgICAgYCgodHlwZW9mIF9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fIT09J3VuZGVmaW5lZCcmJl9fSU5KRUNURURfUFVCTElDX1BBVEhfQllfUUlBTktVTl9fKWAgK1xuICAgICAgICAgIGA/bmV3IFVSTChfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXywodHlwZW9mIGxvY2F0aW9uIT09J3VuZGVmaW5lZCcmJmxvY2F0aW9uLm9yaWdpbil8fCcnKS5vcmlnaW5gICtcbiAgICAgICAgICBgOigodHlwZW9mIGxvY2F0aW9uIT09J3VuZGVmaW5lZCcmJmxvY2F0aW9uLm9yaWdpbil8fCcnKSlgO1xuICAgICAgICBuZXdIdG1sID0gbmV3SHRtbC5yZXBsYWNlKFxuICAgICAgICAgIC9pbXBvcnRcXChcXHMqKFsnXCJdKShcXC9hc3NldHNcXC8oaW5kZXh8bWFpbiktW14nXCJdKylcXDFcXHMqXFwpL2csXG4gICAgICAgICAgKF9tOiBzdHJpbmcsIF9xOiBzdHJpbmcsIGFic1BhdGg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGBpbXBvcnQoLyogQHZpdGUtaWdub3JlICovICgke29yaWdpbkV4cHJ9ICsgJyR7YWJzUGF0aH0nKSlgO1xuICAgICAgICAgIH0sXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgY29uc29sZS5pbmZvKGBbYWRkLXZlcnNpb25dIFx1NURGMlx1NEUzQSBpbmRleC5odG1sIFx1NEUyRFx1NzY4NFx1OEQ0NFx1NkU5MFx1NUYxNVx1NzUyOFx1NkRGQlx1NTJBMFx1NzI0OFx1NjcyQ1x1NTNGNzogdj0ke2J1aWxkVGltZXN0YW1wfWApO1xuICAgICAgICAgIHJldHVybiBuZXdIdG1sO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgICAgfSxcbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGNvcHktaWNvbnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvY29weS1pY29ucy50c1wiOy8qKlxuICogXHU1OTBEXHU1MjM2IGljb25zIFx1NzZFRVx1NUY1NVx1NjNEMlx1NEVGNlxuICogXHU3NTI4XHU0RThFXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU1OTBEXHU1MjM2IHB1YmxpYy9pY29ucyBcdTc2RUVcdTVGNTVcdTUyMzAgZGlzdC9pY29uc1xuICogXHU0RTNCXHU4OTgxXHU3NTI4XHU0RThFIGFkbWluLWFwcFx1RkYwQ1x1NTZFMFx1NEUzQVx1NUI4M1x1OTcwMFx1ODk4MVx1NjYzRVx1NzkzQVx1NTZGRVx1NjgwN1x1NTE4NVx1NUJCOVxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbY29weS1pY29uc10nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW2NvcHktaWNvbnNdJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbY29weS1pY29uc10nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW2NvcHktaWNvbnNdJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgUmVzb2x2ZWRDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIGNvcHlGaWxlU3luYywgbWtkaXJTeW5jLCByZWFkZGlyU3luYywgc3RhdFN5bmMsIHdyaXRlRmlsZVN5bmMsIHVubGlua1N5bmMgfSBmcm9tICdub2RlOmZzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHlJY29uc1BsdWdpbihhcHBEaXI6IHN0cmluZyk6IFBsdWdpbiB7XG4gIGxldCB2aXRlQ29uZmlnOiBSZXNvbHZlZENvbmZpZyB8IG51bGwgPSBudWxsO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2NvcHktaWNvbnMnLFxuICAgIGFwcGx5OiAnYnVpbGQnLCAvLyBcdTUzRUFcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTYyNjdcdTg4NENcblxuICAgIGNvbmZpZ1Jlc29sdmVkKGNvbmZpZzogUmVzb2x2ZWRDb25maWcpIHtcbiAgICAgIHZpdGVDb25maWcgPSBjb25maWc7XG4gICAgfSxcblxuICAgIGNsb3NlQnVuZGxlKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF2aXRlQ29uZmlnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgcm9vdCA9IHZpdGVDb25maWcucm9vdCB8fCBhcHBEaXI7XG4gICAgICAgIGNvbnN0IGljb25zU291cmNlRGlyID0gcmVzb2x2ZShyb290LCAncHVibGljL2ljb25zJyk7XG5cbiAgICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2RTkwXHU3NkVFXHU1RjU1XHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XG4gICAgICAgIGlmICghZXhpc3RzU3luYyhpY29uc1NvdXJjZURpcikpIHtcbiAgICAgICAgICByZXR1cm47IC8vIFx1NTk4Mlx1Njc5Q1x1NkU5MFx1NzZFRVx1NUY1NVx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1OTc1OVx1OUVEOFx1OERGM1x1OEZDN1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU4M0I3XHU1M0Q2XHU2Nzg0XHU1RUZBXHU4RjkzXHU1MUZBXHU3NkVFXHU1RjU1XG4gICAgICAgIGNvbnN0IG91dERpciA9IHZpdGVDb25maWcuYnVpbGQub3V0RGlyIHx8ICdkaXN0JztcbiAgICAgICAgY29uc3QgZGlzdERpciA9IHJlc29sdmUocm9vdCwgb3V0RGlyKTtcblxuICAgICAgICBpZiAoIWV4aXN0c1N5bmMoZGlzdERpcikpIHtcbiAgICAgICAgICByZXR1cm47IC8vIFx1NTk4Mlx1Njc5Q1x1OEY5M1x1NTFGQVx1NzZFRVx1NUY1NVx1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1OERGM1x1OEZDN1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaWNvbnNEZXN0RGlyID0gcmVzb2x2ZShkaXN0RGlyLCAnaWNvbnMnKTtcblxuICAgICAgICAvLyBcdTc4NkVcdTRGRERcdTc2RUVcdTY4MDdcdTc2RUVcdTVGNTVcdTVCNThcdTU3MjhcbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKGljb25zRGVzdERpcikpIHtcbiAgICAgICAgICBta2RpclN5bmMoaWNvbnNEZXN0RGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1NTkwRFx1NTIzNiBpY29ucyBcdTc2RUVcdTVGNTVcdTRFMkRcdTc2ODRcdTYyNDBcdTY3MDlcdTY1ODdcdTRFRjZcbiAgICAgICAgY29uc3QgZmlsZXMgPSByZWFkZGlyU3luYyhpY29uc1NvdXJjZURpcik7XG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgICAgIGNvbnN0IHNvdXJjZVBhdGggPSByZXNvbHZlKGljb25zU291cmNlRGlyLCBmaWxlKTtcbiAgICAgICAgICBjb25zdCBkZXN0UGF0aCA9IHJlc29sdmUoaWNvbnNEZXN0RGlyLCBmaWxlKTtcblxuICAgICAgICAgIGNvbnN0IHN0YXRzID0gc3RhdFN5bmMoc291cmNlUGF0aCk7XG4gICAgICAgICAgaWYgKHN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgICAgICBjb3B5RmlsZVN5bmMoc291cmNlUGF0aCwgZGVzdFBhdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1NEUwRFx1NTE4RFx1NTkwRFx1NTIzNiBmYXZpY29uLmljb1x1RkYwQ1x1N0VERlx1NEUwMFx1NEY3Rlx1NzUyOCBsb2dvLnBuZyBcdTRGNUNcdTRFM0EgZmF2aWNvblxuICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTRFMkRcdTVCNThcdTU3MjggZmF2aWNvbi5pY29cdUZGMENcdTUyMjBcdTk2NjRcdTVCODNcdUZGMDhcdTUzRUZcdTgwRkRcdTY2MkYgVml0ZSBcdTc2ODQgcHVibGljRGlyIFx1NTkwRFx1NTIzNlx1NzY4NFx1RkYwOVxuICAgICAgICBjb25zdCBmYXZpY29uRGVzdCA9IHJlc29sdmUoZGlzdERpciwgJ2Zhdmljb24uaWNvJyk7XG4gICAgICAgIGlmIChleGlzdHNTeW5jKGZhdmljb25EZXN0KSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB1bmxpbmtTeW5jKGZhdmljb25EZXN0KTtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgW2NvcHktaWNvbnNdIFx1NURGMlx1NTIyMFx1OTY2NFx1NEUwRFx1OTcwMFx1ODk4MVx1NzY4NCBmYXZpY29uLmljbzogJHtmYXZpY29uRGVzdH1gKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gXHU5NzU5XHU5RUQ4XHU1OTMxXHU4RDI1XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHU2OEMwXHU2N0U1XHU1RTc2XHU1OTBEXHU1MjM2IHNpdGUud2VibWFuaWZlc3RcdUZGMDhcdTU5ODJcdTY3OUNcdTVCNThcdTU3MjhcdUZGMDlcbiAgICAgICAgY29uc3QgbWFuaWZlc3RTb3VyY2UgPSByZXNvbHZlKHJvb3QsICdwdWJsaWMvaWNvbnMvc2l0ZS53ZWJtYW5pZmVzdCcpO1xuICAgICAgICBjb25zdCBtYW5pZmVzdERlc3QgPSByZXNvbHZlKGljb25zRGVzdERpciwgJ3NpdGUud2VibWFuaWZlc3QnKTtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMobWFuaWZlc3RTb3VyY2UpKSB7XG4gICAgICAgICAgY29weUZpbGVTeW5jKG1hbmlmZXN0U291cmNlLCBtYW5pZmVzdERlc3QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NEUwRFx1NUI1OFx1NTcyOFx1RkYwQ1x1NUMxRFx1OEJENVx1NEVDRSBwdWJsaWMgXHU2ODM5XHU3NkVFXHU1RjU1XHU1OTBEXHU1MjM2XG4gICAgICAgICAgY29uc3QgbWFuaWZlc3RTb3VyY2VSb290ID0gcmVzb2x2ZShyb290LCAncHVibGljL3NpdGUud2VibWFuaWZlc3QnKTtcbiAgICAgICAgICBpZiAoZXhpc3RzU3luYyhtYW5pZmVzdFNvdXJjZVJvb3QpKSB7XG4gICAgICAgICAgICBjb3B5RmlsZVN5bmMobWFuaWZlc3RTb3VyY2VSb290LCBtYW5pZmVzdERlc3QpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBcdTU5ODJcdTY3OUNcdTkwRkRcdTRFMERcdTVCNThcdTU3MjhcdUZGMENcdTc1MUZcdTYyMTBcdTRFMDBcdTRFMkFcdTU3RkFcdTY3MkNcdTc2ODQgc2l0ZS53ZWJtYW5pZmVzdFxuICAgICAgICAgICAgY29uc3QgbWFuaWZlc3QgPSB7XG4gICAgICAgICAgICAgIG5hbWU6ICdCVEMgU2hvcEZsb3cgQWRtaW4nLFxuICAgICAgICAgICAgICBzaG9ydF9uYW1lOiAnQlRDIEFkbWluJyxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCVEMgU2hvcEZsb3cgXHU3QkExXHU3NDA2XHU1RTk0XHU3NTI4JyxcbiAgICAgICAgICAgICAgc3RhcnRfdXJsOiAnLycsXG4gICAgICAgICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNmZmZmZmYnLFxuICAgICAgICAgICAgICB0aGVtZV9jb2xvcjogJyM0MDQwNDAnLFxuICAgICAgICAgICAgICBpY29uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHNyYzogJy9pY29ucy9hbmRyb2lkLWNocm9tZS0xOTJ4MTkyLnBuZycsXG4gICAgICAgICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBzcmM6ICcvaWNvbnMvYW5kcm9pZC1jaHJvbWUtNTEyeDUxMi5wbmcnLFxuICAgICAgICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgc3JjOiAnL2ljb25zL2Zhdmljb24tMzJ4MzIucG5nJyxcbiAgICAgICAgICAgICAgICAgIHNpemVzOiAnMzJ4MzInLFxuICAgICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBzcmM6ICcvaWNvbnMvZmF2aWNvbi0xNngxNi5wbmcnLFxuICAgICAgICAgICAgICAgICAgc2l6ZXM6ICcxNngxNicsXG4gICAgICAgICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMobWFuaWZlc3REZXN0LCBKU09OLnN0cmluZ2lmeShtYW5pZmVzdCwgbnVsbCwgMiksICd1dGYtOCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW2NvcHktaWNvbnNdIFx1NURGMlx1NTkwRFx1NTIzNiBpY29ucyBcdTc2RUVcdTVGNTVcdTUyMzA6ICR7aWNvbnNEZXN0RGlyfWApO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gXHU5NzU5XHU5RUQ4XHU1OTMxXHU4RDI1XHVGRjBDXHU5MDdGXHU1MTREXHU5NjNCXHU1ODVFXHU2Nzg0XHU1RUZBXG4gICAgICAgIGNvbnNvbGUud2FybignW2NvcHktaWNvbnNdIFx1NTkwRFx1NTIzNiBpY29ucyBcdTc2RUVcdTVGNTVcdTU5MzFcdThEMjU6JywgZXJyb3IpO1xuICAgICAgfVxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG1sdVxcXFxEZXNrdG9wXFxcXGJ0Yy1zaG9wZmxvd1xcXFxidGMtc2hvcGZsb3ctbW9ub3JlcG9cXFxcY29uZmlnc1xcXFx2aXRlXFxcXHBsdWdpbnNcXFxcdXBsb2FkLWljb25zLXRvLW9zcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWx1L0Rlc2t0b3AvYnRjLXNob3BmbG93L2J0Yy1zaG9wZmxvdy1tb25vcmVwby9jb25maWdzL3ZpdGUvcGx1Z2lucy91cGxvYWQtaWNvbnMtdG8tb3NzLnRzXCI7LyoqXG4gKiBcdTRFMEFcdTRGMjBcdTU2RkVcdTY4MDdcdTY1ODdcdTRFRjZcdTUyMzAgT1NTIFx1NzY4NCBWaXRlIFx1NjNEMlx1NEVGNlxuICogXHU1NzI4XHU3NTFGXHU0RUE3XHU2Nzg0XHU1RUZBXHU1QjhDXHU2MjEwXHU1NDBFXHVGRjBDXHU4MUVBXHU1MkE4XHU0RTBBXHU0RjIwXHU1NkZFXHU2ODA3XHU2NTg3XHU0RUY2XHU1MjMwIE9TU1x1RkYwOFx1NTdGQVx1NEU4RVx1NjU4N1x1NEVGNlx1NjMwN1x1N0VCOVx1NzY4NFx1NTg5RVx1OTFDRlx1NEUwQVx1NEYyMFx1RkYwOVxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbdXBsb2FkLWljb25zLXRvLW9zc10nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW3VwbG9hZC1pY29ucy10by1vc3NdJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbdXBsb2FkLWljb25zLXRvLW9zc10nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW3VwbG9hZC1pY29ucy10by1vc3NdJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgUmVzb2x2ZWRDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHNwYXduIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSByZXNvbHZlKF9fZmlsZW5hbWUsICcuLicpO1xuY29uc3QgcHJvamVjdFJvb3QgPSByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uLy4uJyk7XG5cbmZ1bmN0aW9uIHRyeUxvYWRPc3NDcmVkc0Zyb21XaW5kb3dzQ3JlZGVudGlhbE1hbmFnZXIoKTogdm9pZCB7XG4gIC8vIFx1NTNFQVx1NTcyOCBXaW5kb3dzIFx1NEUxNFx1N0YzQVx1NUMxMVx1NTFFRFx1OEJDMVx1NjVGNlx1NUMxRFx1OEJENVxuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ3dpbjMyJykgcmV0dXJuO1xuICBpZiAocHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQgJiYgcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUKSByZXR1cm47XG5cbiAgdHJ5IHtcbiAgICAvLyBcdTkwMUFcdThGQzcgUG93ZXJTaGVsbCArIENyZWRlbnRpYWxNYW5hZ2VyIFx1OEJGQlx1NTNENlx1RkYwOFx1NEUwRFx1OEY5M1x1NTFGQVx1NjYwRVx1NjU4N1x1NTIzMFx1NjVFNVx1NUZEN1x1RkYwOVxuICAgIGNvbnN0IHBzID0gW1xuICAgICAgYCRFcnJvckFjdGlvblByZWZlcmVuY2U9J1N0b3AnYCxcbiAgICAgIGBJbXBvcnQtTW9kdWxlIENyZWRlbnRpYWxNYW5hZ2VyYCxcbiAgICAgIGAkaWQ9KEdldC1TdG9yZWRDcmVkZW50aWFsIC1UYXJnZXQgJ0FsaWJhYmFDbG91ZCcgLUVycm9yQWN0aW9uIFNpbGVudGx5Q29udGludWUpLkdldE5ldHdvcmtDcmVkZW50aWFsKCkuUGFzc3dvcmRgLFxuICAgICAgYCRzZWM9KEdldC1TdG9yZWRDcmVkZW50aWFsIC1UYXJnZXQgJ0FsaWJhYmFDbG91ZFNlY3JldCcgLUVycm9yQWN0aW9uIFNpbGVudGx5Q29udGludWUpLkdldE5ldHdvcmtDcmVkZW50aWFsKCkuUGFzc3dvcmRgLFxuICAgICAgYCRvdXQ9W3BzY3VzdG9tb2JqZWN0XUB7IGlkPSRpZDsgc2VjcmV0PSRzZWMgfSB8IENvbnZlcnRUby1Kc29uIC1Db21wcmVzc2AsXG4gICAgICBgV3JpdGUtT3V0cHV0ICRvdXRgLFxuICAgIF0uam9pbignOyAnKTtcblxuICAgIGNvbnN0IHJhdyA9IGV4ZWNTeW5jKGBwb3dlcnNoZWxsIC1Ob1Byb2ZpbGUgLU5vbkludGVyYWN0aXZlIC1Db21tYW5kIFwiJHtwcy5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyl9XCJgLCB7XG4gICAgICBzdGRpbzogWydpZ25vcmUnLCAncGlwZScsICdpZ25vcmUnXSxcbiAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgfSk7XG5cbiAgICBjb25zdCBqc29uVGV4dCA9IChyYXcgfHwgJycpLnRyaW0oKTtcbiAgICBpZiAoIWpzb25UZXh0KSByZXR1cm47XG5cbiAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGpzb25UZXh0KSBhcyB7IGlkPzogc3RyaW5nOyBzZWNyZXQ/OiBzdHJpbmcgfTtcbiAgICBpZiAocGFyc2VkPy5pZCAmJiAhcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQpIHByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX0lEID0gcGFyc2VkLmlkO1xuICAgIGlmIChwYXJzZWQ/LnNlY3JldCAmJiAhcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUKSBwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQgPSBwYXJzZWQuc2VjcmV0O1xuICB9IGNhdGNoIHtcbiAgICAvLyBcdTk3NTlcdTlFRDhcdTU5MzFcdThEMjVcdUZGMUFcdTRFMERcdTk2M0JcdTU4NUVcdTY3ODRcdTVFRkFcdTZENDFcdTdBMEJcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBsb2FkSWNvbnNUb09zc1BsdWdpbigpOiBQbHVnaW4ge1xuICBsZXQgaXNQcm9kdWN0aW9uQnVpbGQgPSBmYWxzZTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICd1cGxvYWQtaWNvbnMtdG8tb3NzJyxcbiAgICBhcHBseTogJ2J1aWxkJywgLy8gXHU1M0VBXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU2MjY3XHU4ODRDXG5cbiAgICBjb25maWdSZXNvbHZlZChjb25maWc6IFJlc29sdmVkQ29uZmlnKSB7XG4gICAgICAvLyBWaXRlIFx1NzY4NCBpc1Byb2R1Y3Rpb24gXHU2NjJGXHU2NzAwXHU1M0VGXHU5NzYwXHU3Njg0XHU1MjI0XHU2NUFEXHVGRjA4XHU5MDdGXHU1MTREIE5PREVfRU5WIC8gREVWIFx1N0I0OVx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1NTcyOCBDSSBcdTRFMkRcdTRFMERcdTRFMDBcdTgxRjRcdUZGMDlcbiAgICAgIGlzUHJvZHVjdGlvbkJ1aWxkID0gISFjb25maWcuaXNQcm9kdWN0aW9uO1xuICAgIH0sXG5cbiAgICBhc3luYyBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgIC8vIFx1NTNFQVx1NTcyOFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1Njc4NFx1NUVGQVx1NjVGNlx1NEUwQVx1NEYyMFxuICAgICAgaWYgKCFpc1Byb2R1Y3Rpb25CdWlsZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFdpbmRvd3MgXHU2NzJDXHU1NzMwXHU2Nzg0XHU1RUZBXHVGRjFBXHU1OTgyXHU2NzlDXHU2NzJBXHU2NjNFXHU1RjBGXHU4QkJFXHU3RjZFIGVudi8uZW52Lm9zc1x1RkYwQ1x1NUMxRFx1OEJENVx1NEVDRVx1NTFFRFx1OEJDMVx1N0JBMVx1NzQwNlx1NTY2OFx1OEJGQlx1NTNENlxuICAgICAgdHJ5TG9hZE9zc0NyZWRzRnJvbVdpbmRvd3NDcmVkZW50aWFsTWFuYWdlcigpO1xuXG4gICAgICAvLyBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTY3MDkgT1NTIFx1OTE0RFx1N0Y2RVxuICAgICAgaWYgKCFwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9JRCB8fCAhcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUKSB7XG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOVx1NEUwQVx1NEYyMFx1RkYwQ2FsbC5iZWxsaXMuY29tLmNuIFx1NEVFM1x1NzQwNlx1NTIzMCBPU1MgXHU1QzA2XHU4RkQ0XHU1NkRFIE5vU3VjaEtleVx1RkYwOGxvZ28ucG5nIC8gaWNvbnMvKlx1RkYwOVxuICAgICAgICBjb25zb2xlLndhcm4oJ1t1cGxvYWQtaWNvbnMtdG8tb3NzXSBcdTI2QTBcdUZFMEYgIFx1OERGM1x1OEZDN1x1NEUwQVx1NEYyMFx1RkYwOFx1NjcyQVx1OTE0RFx1N0Y2RSBPU1MgXHU1MUVEXHU4QkMxXHVGRjA5XHUzMDAyXHU4RkQ5XHU0RjFBXHU1QkZDXHU4MUY0IGh0dHBzOi8vYWxsLmJlbGxpcy5jb20uY24vbG9nby5wbmcgXHU4RkQ0XHU1NkRFIE5vU3VjaEtleScpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTcyOCBDSSBcdTRFMkRcdTVGQzVcdTk4N0JcdTdCNDlcdTVGODVcdTRFMEFcdTRGMjBcdTVCOENcdTYyMTBcdUZGMENcdTU0MjZcdTUyMTlcdTY3ODRcdTVFRkFcdThGREJcdTdBMEJcdTkwMDBcdTUxRkFcdTRGMUFcdTc2RjRcdTYzQTVcdTdFQzhcdTZCNjJcdTVCNTBcdThGREJcdTdBMEJcdUZGMENcdTVCRkNcdTgxRjRcdTY1ODdcdTRFRjZcdTY3MkFcdTRFMEFcdTRGMjBcbiAgICAgIGNvbnN0IHVwbG9hZFNjcmlwdCA9IHJlc29sdmUocHJvamVjdFJvb3QsICdzY3JpcHRzL3VwbG9hZC1pY29ucy10by1vc3MubWpzJyk7XG4gICAgICBjb25zb2xlLmluZm8oJ1t1cGxvYWQtaWNvbnMtdG8tb3NzXSBcdUQ4M0RcdURFODAgXHU1RjAwXHU1OUNCXHU0RTBBXHU0RjIwXHU1NkZFXHU2ODA3XHU2NTg3XHU0RUY2XHU1MjMwIE9TUy4uLicpO1xuXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZVByb21pc2UsIHJlamVjdFByb21pc2UpID0+IHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBzcGF3bignbm9kZScsIFt1cGxvYWRTY3JpcHRdLCB7XG4gICAgICAgICAgc3RkaW86ICdpbmhlcml0JyxcbiAgICAgICAgICBzaGVsbDogdHJ1ZSxcbiAgICAgICAgICBlbnY6IHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNoaWxkLm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgICAgIHJlamVjdFByb21pc2UoZXJyb3IpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjaGlsZC5vbignZXhpdCcsIChjb2RlKSA9PiB7XG4gICAgICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnW3VwbG9hZC1pY29ucy10by1vc3NdIFx1MjcwNSBcdTU2RkVcdTY4MDdcdTY1ODdcdTRFRjZcdTRFMEFcdTRGMjBcdTVCOENcdTYyMTAnKTtcbiAgICAgICAgICAgIHJlc29sdmVQcm9taXNlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFx1OUVEOFx1OEJBNFx1NEUwRFx1OTYzQlx1NTg1RVx1Njc4NFx1NUVGQVx1RkYxQWxheW91dC1hcHAgZGlzdCBcdTkxQ0NcdTRFQ0RcdTY3MDkgaWNvbnMvbG9nbyBcdTRGNUNcdTRFM0FcdTY3MkNcdTU3MzBcdTU0MEVcdTU5MDdcdUZGMENcdTkwN0ZcdTUxNEQgNDA0XG4gICAgICAgICAgICAvLyBcdTU5ODJcdTk3MDBcdTRFMjVcdTY4M0NcdTU5MzFcdThEMjVcdUZGMDhDSSBcdTVGM0FcdTUyMzZcdTRFMEFcdTRGMjBcdTYyMTBcdTUyOUZcdUZGMDlcdUZGMENcdThCQkVcdTdGNkUgT1NTX1VQTE9BRF9TVFJJQ1Q9dHJ1ZVxuICAgICAgICAgICAgY29uc3Qgc3RyaWN0ID0gcHJvY2Vzcy5lbnYuT1NTX1VQTE9BRF9TVFJJQ1QgPT09ICd0cnVlJztcbiAgICAgICAgICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcihgW3VwbG9hZC1pY29ucy10by1vc3NdIFx1NEUwQVx1NEYyMFx1ODExQVx1NjcyQ1x1OTAwMFx1NTFGQVx1RkYwQ1x1NEVFM1x1NzgwMTogJHtjb2RlID8/ICd1bmtub3duJ31gKTtcbiAgICAgICAgICAgIGlmIChzdHJpY3QpIHtcbiAgICAgICAgICAgICAgcmVqZWN0UHJvbWlzZShlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZVByb21pc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcbiAgfSBhcyBQbHVnaW47XG59XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWx1XFxcXERlc2t0b3BcXFxcYnRjLXNob3BmbG93XFxcXGJ0Yy1zaG9wZmxvdy1tb25vcmVwb1xcXFxjb25maWdzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFx1cGxvYWQtY2RuLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tbHUvRGVza3RvcC9idGMtc2hvcGZsb3cvYnRjLXNob3BmbG93LW1vbm9yZXBvL2NvbmZpZ3Mvdml0ZS9wbHVnaW5zL3VwbG9hZC1jZG4udHNcIjsvKipcbiAqIFx1NEUwQVx1NEYyMFx1NUU5NFx1NzUyOFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NTIzMCBDRE4gXHU3Njg0IFZpdGUgXHU2M0QyXHU0RUY2XG4gKiBcdTU3MjhcdTc1MUZcdTRFQTdcdTY3ODRcdTVFRkFcdTVCOENcdTYyMTBcdTU0MEVcdUZGMENcdTgxRUFcdTUyQThcdTRFMEFcdTRGMjBcdTVFOTRcdTc1MjhcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTUyMzAgT1NTL0NETlx1RkYwOFx1NTdGQVx1NEU4RVx1NjU4N1x1NEVGNlx1NjMwN1x1N0VCOVx1NzY4NFx1NTg5RVx1OTFDRlx1NEUwQVx1NEYyMFx1RkYwOVxuICovXG4vLyBcdTZDRThcdTYxMEZcdUZGMUFcdTU3MjggVml0ZVByZXNzIFx1OTE0RFx1N0Y2RVx1NTJBMFx1OEY3RFx1NjVGNlx1RkYwQ1x1NEUwRFx1ODBGRFx1NzZGNFx1NjNBNVx1NUJGQ1x1NTE2NSBAYnRjL3NoYXJlZC1jb3JlXG4vLyBcdTRGN0ZcdTc1MjggY29uc29sZSBcdTY2RkZcdTRFRTMgbG9nZ2VyXG5jb25zdCBsb2dnZXIgPSB7XG4gIHdhcm46ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS53YXJuKCdbdXBsb2FkLWNkbl0nLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5lcnJvcignW3VwbG9hZC1jZG5dJywgLi4uYXJncyksXG4gIGluZm86ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5pbmZvKCdbdXBsb2FkLWNkbl0nLCAuLi5hcmdzKSxcbiAgZGVidWc6ICguLi5hcmdzOiBhbnlbXSkgPT4gY29uc29sZS5kZWJ1ZygnW3VwbG9hZC1jZG5dJywgLi4uYXJncyksXG59O1xuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgUmVzb2x2ZWRDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHNwYXduIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBfX2Rpcm5hbWUgPSByZXNvbHZlKF9fZmlsZW5hbWUsICcuLicpO1xuY29uc3QgcHJvamVjdFJvb3QgPSByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uLy4uJyk7XG5cbmZ1bmN0aW9uIHRyeUxvYWRPc3NDcmVkc0Zyb21XaW5kb3dzQ3JlZGVudGlhbE1hbmFnZXIoKTogdm9pZCB7XG4gIC8vIFx1NTNFQVx1NTcyOCBXaW5kb3dzIFx1NEUxNFx1N0YzQVx1NUMxMVx1NTFFRFx1OEJDMVx1NjVGNlx1NUMxRFx1OEJENVxuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ3dpbjMyJykgcmV0dXJuO1xuICBpZiAocHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQgJiYgcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUKSByZXR1cm47XG5cbiAgdHJ5IHtcbiAgICAvLyBcdTkwMUFcdThGQzcgUG93ZXJTaGVsbCArIENyZWRlbnRpYWxNYW5hZ2VyIFx1OEJGQlx1NTNENlx1RkYwOFx1NEUwRFx1OEY5M1x1NTFGQVx1NjYwRVx1NjU4N1x1NTIzMFx1NjVFNVx1NUZEN1x1RkYwOVxuICAgIGNvbnN0IHBzID0gW1xuICAgICAgYCRFcnJvckFjdGlvblByZWZlcmVuY2U9J1N0b3AnYCxcbiAgICAgIGBJbXBvcnQtTW9kdWxlIENyZWRlbnRpYWxNYW5hZ2VyYCxcbiAgICAgIGAkaWQ9KEdldC1TdG9yZWRDcmVkZW50aWFsIC1UYXJnZXQgJ0FsaWJhYmFDbG91ZCcgLUVycm9yQWN0aW9uIFNpbGVudGx5Q29udGludWUpLkdldE5ldHdvcmtDcmVkZW50aWFsKCkuUGFzc3dvcmRgLFxuICAgICAgYCRzZWM9KEdldC1TdG9yZWRDcmVkZW50aWFsIC1UYXJnZXQgJ0FsaWJhYmFDbG91ZFNlY3JldCcgLUVycm9yQWN0aW9uIFNpbGVudGx5Q29udGludWUpLkdldE5ldHdvcmtDcmVkZW50aWFsKCkuUGFzc3dvcmRgLFxuICAgICAgYCRvdXQ9W3BzY3VzdG9tb2JqZWN0XUB7IGlkPSRpZDsgc2VjcmV0PSRzZWMgfSB8IENvbnZlcnRUby1Kc29uIC1Db21wcmVzc2AsXG4gICAgICBgV3JpdGUtT3V0cHV0ICRvdXRgLFxuICAgIF0uam9pbignOyAnKTtcblxuICAgIGNvbnN0IHJhdyA9IGV4ZWNTeW5jKGBwb3dlcnNoZWxsIC1Ob1Byb2ZpbGUgLU5vbkludGVyYWN0aXZlIC1Db21tYW5kIFwiJHtwcy5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyl9XCJgLCB7XG4gICAgICBzdGRpbzogWydpZ25vcmUnLCAncGlwZScsICdpZ25vcmUnXSxcbiAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgfSk7XG5cbiAgICBjb25zdCBqc29uVGV4dCA9IChyYXcgfHwgJycpLnRyaW0oKTtcbiAgICBpZiAoIWpzb25UZXh0KSByZXR1cm47XG5cbiAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGpzb25UZXh0KSBhcyB7IGlkPzogc3RyaW5nOyBzZWNyZXQ/OiBzdHJpbmcgfTtcbiAgICBpZiAocGFyc2VkPy5pZCAmJiAhcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQpIHByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX0lEID0gcGFyc2VkLmlkO1xuICAgIGlmIChwYXJzZWQ/LnNlY3JldCAmJiAhcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfU0VDUkVUKSBwcm9jZXNzLmVudi5PU1NfQUNDRVNTX0tFWV9TRUNSRVQgPSBwYXJzZWQuc2VjcmV0O1xuICB9IGNhdGNoIHtcbiAgICAvLyBcdTk3NTlcdTlFRDhcdTU5MzFcdThEMjVcdUZGMUFcdTRFMERcdTk2M0JcdTU4NUVcdTY3ODRcdTVFRkFcdTZENDFcdTdBMEJcbiAgfVxufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBDRE4gXHU0RTBBXHU0RjIwXHU2M0QyXHU0RUY2XG4gKiBAcGFyYW0gYXBwTmFtZSBcdTVFOTRcdTc1MjhcdTU0MERcdTc5RjBcdUZGMDhcdTU5ODIgJ3N5c3RlbS1hcHAnXHVGRjA5XG4gKiBAcGFyYW0gYXBwRGlyIFx1NUU5NFx1NzUyOFx1NzZFRVx1NUY1NVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBsb2FkQ2RuUGx1Z2luKGFwcE5hbWU6IHN0cmluZywgX2FwcERpcjogc3RyaW5nKTogUGx1Z2luIHtcbiAgbGV0IGlzUHJvZHVjdGlvbkJ1aWxkID0gZmFsc2U7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAndXBsb2FkLWNkbicsXG4gICAgYXBwbHk6ICdidWlsZCcsIC8vIFx1NTNFQVx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NjI2N1x1ODg0Q1xuXG4gICAgY29uZmlnUmVzb2x2ZWQoY29uZmlnOiBSZXNvbHZlZENvbmZpZykge1xuICAgICAgLy8gVml0ZSBcdTc2ODQgaXNQcm9kdWN0aW9uIFx1NjYyRlx1NjcwMFx1NTNFRlx1OTc2MFx1NzY4NFx1NTIyNFx1NjVBRFx1RkYwOFx1OTA3Rlx1NTE0RCBOT0RFX0VOViAvIERFViBcdTdCNDlcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdTU3MjggQ0kgXHU0RTJEXHU0RTBEXHU0RTAwXHU4MUY0XHVGRjA5XG4gICAgICBpc1Byb2R1Y3Rpb25CdWlsZCA9ICEhY29uZmlnLmlzUHJvZHVjdGlvbjtcbiAgICB9LFxuXG4gICAgYXN5bmMgY2xvc2VCdW5kbGUoKSB7XG4gICAgICAvLyBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTU0MkZcdTc1MjggQ0ROIFx1NEUwQVx1NEYyMFxuICAgICAgaWYgKHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fVVBMT0FEICE9PSAndHJ1ZScpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdThERjNcdThGQzdcdTRFMEFcdTRGMjBcbiAgICAgIGlmIChwcm9jZXNzLmVudi5TS0lQX0NETl9VUExPQUQgPT09ICd0cnVlJykge1xuICAgICAgICBjb25zb2xlLmluZm8oYFt1cGxvYWQtY2RuXSBcdTIzRURcdUZFMEYgIFx1OERGM1x1OEZDNyAke2FwcE5hbWV9IFx1NzY4NCBDRE4gXHU0RTBBXHU0RjIwXHVGRjA4U0tJUF9DRE5fVVBMT0FEPXRydWVcdUZGMDlgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTUzRUFcdTU3MjhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTY3ODRcdTVFRkFcdTY1RjZcdTRFMEFcdTRGMjBcbiAgICAgIGlmICghaXNQcm9kdWN0aW9uQnVpbGQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBXaW5kb3dzIFx1NjcyQ1x1NTczMFx1Njc4NFx1NUVGQVx1RkYxQVx1NTk4Mlx1Njc5Q1x1NjcyQVx1NjYzRVx1NUYwRlx1OEJCRVx1N0Y2RSBlbnYvLmVudi5vc3NcdUZGMENcdTVDMURcdThCRDVcdTRFQ0VcdTUxRURcdThCQzFcdTdCQTFcdTc0MDZcdTU2NjhcdThCRkJcdTUzRDZcbiAgICAgIHRyeUxvYWRPc3NDcmVkc0Zyb21XaW5kb3dzQ3JlZGVudGlhbE1hbmFnZXIoKTtcblxuICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU2NzA5IE9TUyBcdTkxNERcdTdGNkVcbiAgICAgIGlmICghcHJvY2Vzcy5lbnYuT1NTX0FDQ0VTU19LRVlfSUQgfHwgIXByb2Nlc3MuZW52Lk9TU19BQ0NFU1NfS0VZX1NFQ1JFVCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYFt1cGxvYWQtY2RuXSBcdTI2QTBcdUZFMEYgIFx1OERGM1x1OEZDNyAke2FwcE5hbWV9IFx1NzY4NCBDRE4gXHU0RTBBXHU0RjIwXHVGRjA4XHU2NzJBXHU5MTREXHU3RjZFIE9TUyBcdTUxRURcdThCQzFcdUZGMDlgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTU3MjggQ0kgXHU0RTJEXHU1RkM1XHU5ODdCXHU3QjQ5XHU1Rjg1XHU0RTBBXHU0RjIwXHU1QjhDXHU2MjEwXHVGRjBDXHU1NDI2XHU1MjE5XHU2Nzg0XHU1RUZBXHU4RkRCXHU3QTBCXHU5MDAwXHU1MUZBXHU0RjFBXHU3NkY0XHU2M0E1XHU3RUM4XHU2QjYyXHU1QjUwXHU4RkRCXHU3QTBCXHVGRjBDXHU1QkZDXHU4MUY0XHU2NTg3XHU0RUY2XHU2NzJBXHU0RTBBXHU0RjIwXG4gICAgICBjb25zdCB1cGxvYWRTY3JpcHQgPSByZXNvbHZlKHByb2plY3RSb290LCAnc2NyaXB0cy91cGxvYWQtYXBwLXRvLWNkbi5tanMnKTtcbiAgICAgIGNvbnNvbGUuaW5mbyhgW3VwbG9hZC1jZG5dIFx1RDgzRFx1REU4MCBcdTVGMDBcdTU5Q0JcdTRFMEFcdTRGMjAgJHthcHBOYW1lfSBcdTUyMzAgQ0ROLi4uYCk7XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlUHJvbWlzZSwgcmVqZWN0UHJvbWlzZSkgPT4ge1xuICAgICAgICBjb25zdCBjaGlsZCA9IHNwYXduKCdub2RlJywgW3VwbG9hZFNjcmlwdCwgYXBwTmFtZV0sIHtcbiAgICAgICAgICBzdGRpbzogJ2luaGVyaXQnLFxuICAgICAgICAgIHNoZWxsOiB0cnVlLFxuICAgICAgICAgIGVudjoge1xuICAgICAgICAgICAgLi4ucHJvY2Vzcy5lbnYsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2hpbGQub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICAgICAgcmVqZWN0UHJvbWlzZShlcnJvcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNoaWxkLm9uKCdleGl0JywgKGNvZGUpID0+IHtcbiAgICAgICAgICBpZiAoY29kZSA9PT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBbdXBsb2FkLWNkbl0gXHUyNzA1ICR7YXBwTmFtZX0gXHU0RTBBXHU0RjIwXHU1QjhDXHU2MjEwYCk7XG4gICAgICAgICAgICByZXNvbHZlUHJvbWlzZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBcdTlFRDhcdThCQTRcdTRFMERcdTk2M0JcdTU4NUVcdTY3ODRcdTVFRkFcdUZGMUFcdTU5ODJcdTk3MDBcdTRFMjVcdTY4M0NcdTU5MzFcdThEMjVcdUZGMDhDSSBcdTVGM0FcdTUyMzZcdTRFMEFcdTRGMjBcdTYyMTBcdTUyOUZcdUZGMDlcdUZGMENcdThCQkVcdTdGNkUgT1NTX1VQTE9BRF9TVFJJQ1Q9dHJ1ZVxuICAgICAgICAgICAgY29uc3Qgc3RyaWN0ID0gcHJvY2Vzcy5lbnYuT1NTX1VQTE9BRF9TVFJJQ1QgPT09ICd0cnVlJztcbiAgICAgICAgICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcihgW3VwbG9hZC1jZG5dICR7YXBwTmFtZX0gXHU0RTBBXHU0RjIwXHU4MTFBXHU2NzJDXHU5MDAwXHU1MUZBXHVGRjBDXHU0RUUzXHU3ODAxOiAke2NvZGUgPz8gJ3Vua25vd24nfWApO1xuICAgICAgICAgICAgaWYgKHN0cmljdCkge1xuICAgICAgICAgICAgICByZWplY3RQcm9taXNlKGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICByZXNvbHZlUHJvbWlzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuICB9IGFzIFBsdWdpbjtcbn1cblxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtbHVcXFxcRGVza3RvcFxcXFxidGMtc2hvcGZsb3dcXFxcYnRjLXNob3BmbG93LW1vbm9yZXBvXFxcXGNvbmZpZ3NcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGNkbi1hc3NldHMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21sdS9EZXNrdG9wL2J0Yy1zaG9wZmxvdy9idGMtc2hvcGZsb3ctbW9ub3JlcG8vY29uZmlncy92aXRlL3BsdWdpbnMvY2RuLWFzc2V0cy50c1wiOy8qKlxuICogQ0ROIFx1OEQ0NFx1NkU5MFx1NTJBMFx1OTAxRlx1NjNEMlx1NEVGNlxuICogXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU0RkVFXHU2NTM5IEhUTUwgXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwIFVSTFx1RkYwQ1x1NUMwNlx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1OERFRlx1NUY4NFx1OEY2Q1x1NjM2Mlx1NEUzQSBDRE4gVVJMXG4gKiBcdTY1MkZcdTYzMDFcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdThENDRcdTZFOTAgKC9hc3NldHMvKSBcdTU0OENcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjhcdThENDRcdTZFOTAgKC9hc3NldHMvbGF5b3V0LylcbiAqL1xuLy8gXHU2Q0U4XHU2MTBGXHVGRjFBXHU1NzI4IFZpdGVQcmVzcyBcdTkxNERcdTdGNkVcdTUyQTBcdThGN0RcdTY1RjZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCRkNcdTUxNjUgQGJ0Yy9zaGFyZWQtY29yZVxuLy8gXHU0RjdGXHU3NTI4IGNvbnNvbGUgXHU2NkZGXHU0RUUzIGxvZ2dlclxuY29uc3QgbG9nZ2VyID0ge1xuICB3YXJuOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUud2FybignW2Nkbi1hc3NldHNdJywgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZXJyb3IoJ1tjZG4tYXNzZXRzXScsIC4uLmFyZ3MpLFxuICBpbmZvOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuaW5mbygnW2Nkbi1hc3NldHNdJywgLi4uYXJncyksXG4gIGRlYnVnOiAoLi4uYXJnczogYW55W10pID0+IGNvbnNvbGUuZGVidWcoJ1tjZG4tYXNzZXRzXScsIC4uLmFyZ3MpLFxufTtcblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuZXhwb3J0IGludGVyZmFjZSBDZG5Bc3NldHNQbHVnaW5PcHRpb25zIHtcbiAgLyoqXG4gICAqIFx1NUU5NFx1NzUyOFx1NTQwRFx1NzlGMFx1RkYwOFx1NTk4MiAnYWRtaW4tYXBwJ1x1RkYwOVxuICAgKi9cbiAgYXBwTmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4IENETiBcdTUyQTBcdTkwMUZcdUZGMDhcdTlFRDhcdThCQTRcdUZGMUFcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTU0MkZcdTc1MjhcdUZGMDlcbiAgICovXG4gIGVuYWJsZWQ/OiBib29sZWFuO1xuICAvKipcbiAgICogQ0ROIFx1NTdERlx1NTQwRFx1RkYwOFx1OUVEOFx1OEJBNFx1RkYxQWFsbC5iZWxsaXMuY29tLmNuXHVGRjA5XG4gICAqL1xuICBjZG5Eb21haW4/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQ0ROIFx1OEQ0NFx1NkU5MFx1NTJBMFx1OTAxRlx1NjNEMlx1NEVGNlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2RuQXNzZXRzUGx1Z2luKG9wdGlvbnM6IENkbkFzc2V0c1BsdWdpbk9wdGlvbnMpOiBQbHVnaW4ge1xuICBjb25zdCB7XG4gICAgYXBwTmFtZSxcbiAgICAvLyBcdTUxNzNcdTk1MkVcdUZGMUFcdTlFRDhcdThCQTRcdTU0MkZcdTc1MjhcdTY3NjFcdTRFRjZcdTVGQzVcdTk4N0JcdTY2MEVcdTc4NkVcdTY4QzBcdTY3RTUgRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXG4gICAgLy8gXHU1OTgyXHU2NzlDIEVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OIFx1ODhBQlx1OEJCRVx1N0Y2RVx1NEUzQSAnZmFsc2UnXHVGRjBDXHU1MjE5XHU3OTgxXHU3NTI4IENETlxuICAgIC8vIFx1NTNFQVx1NjcwOVx1NTcyOFx1NjYwRVx1Nzg2RVx1NTQyRlx1NzUyOFx1RkYwOEVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OPXRydWVcdUZGMDlcdTYyMTZcdTY3MkFcdThCQkVcdTdGNkVcdTRFMTRcdTY2MkZcdTc1MUZcdTRFQTdcdTY3ODRcdTVFRkFcdTY1RjZcdUZGMENcdTYyNERcdTU0MkZcdTc1MjggQ0ROXG4gICAgZW5hYmxlZCA9IHByb2Nlc3MuZW52LkVOQUJMRV9DRE5fQUNDRUxFUkFUSU9OID09PSAndHJ1ZScgfHwgXG4gICAgICAgICAgICAgIChwcm9jZXNzLmVudi5FTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiAhPT0gJ2ZhbHNlJyAmJiBcbiAgICAgICAgICAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgJiYgXG4gICAgICAgICAgICAgICBwcm9jZXNzLmVudi5WSVRFX1BSRVZJRVcgIT09ICd0cnVlJyksXG4gICAgY2RuRG9tYWluID0gJ2h0dHBzOi8vYWxsLmJlbGxpcy5jb20uY24nLFxuICB9ID0gb3B0aW9ucztcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjZG4tYXNzZXRzJyxcbiAgICBhcHBseTogJ2J1aWxkJyxcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgY29uc29sZS5pbmZvKGBbY2RuLWFzc2V0c10gQ0ROIFx1NTJBMFx1OTAxRlx1NURGMlx1NTQyRlx1NzUyOFx1RkYwQ1x1NUU5NFx1NzUyODogJHthcHBOYW1lfSwgQ0ROIFx1NTdERlx1NTQwRDogJHtjZG5Eb21haW59YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtjZG4tYXNzZXRzXSBDRE4gXHU1MkEwXHU5MDFGXHU1REYyXHU3OTgxXHU3NTI4YCk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0cmFuc2Zvcm1JbmRleEh0bWw6IHtcbiAgICAgIG9yZGVyOiAncG9zdCcsIC8vIFx1NTcyOCBhZGRWZXJzaW9uUGx1Z2luIFx1NEU0Qlx1NTQwRVx1NjI2N1x1ODg0Q1xuICAgICAgaGFuZGxlcihodG1sKSB7XG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTM3M1x1NEY3RiBDRE4gXHU2M0QyXHU0RUY2XHU4OEFCXHU3OTgxXHU3NTI4XHVGRjBDXHU1OTgyXHU2NzlDXHU2NjJGXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHVGRjBDXHU0RTVGXHU5NzAwXHU4OTgxXHU2Q0U4XHU1MTY1XHU2NUU5XHU2NzFGIFVSTCBcdThGNkNcdTYzNjJcdTgxMUFcdTY3MkNcbiAgICAgICAgLy8gXHU1NkUwXHU0RTNBXHU5ODg0XHU4OUM4XHU3M0FGXHU1ODgzXHU1M0VGXHU4MEZEXHU0RjdGXHU3NTI4XHU0RTRCXHU1MjREXHU2Nzg0XHU1RUZBXHU3Njg0XHU1MzA1XHU1NDJCIENETiBVUkwgXHU3Njg0XHU0RUE3XHU3MjY5XG4gICAgICAgIGNvbnN0IGlzUHJldmlld0J1aWxkID0gcHJvY2Vzcy5lbnYuVklURV9QUkVWSUVXID09PSAndHJ1ZSc7XG4gICAgICAgIGNvbnN0IG5lZWRzRWFybHlDb252ZXJ0ZXIgPSBpc1ByZXZpZXdCdWlsZCAmJiAhZW5hYmxlZDtcbiAgICAgICAgXG4gICAgICAgIGlmICghZW5hYmxlZCAmJiAhbmVlZHNFYXJseUNvbnZlcnRlcikge1xuICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG5ld0h0bWwgPSBodG1sO1xuICAgICAgICBsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAvLyAxKSBcdTU5MDRcdTc0MDYgPHNjcmlwdCBzcmM+IFx1NjgwN1x1N0I3RVx1RkYwOFx1NEVDNVx1NTcyOCBDRE4gXHU1NDJGXHU3NTI4XHU2NUY2XHU4RjZDXHU2MzYyXHVGRjA5XG4gICAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShcbiAgICAgICAgICAgIC8oPHNjcmlwdFtePl0qXFxzK3NyYz1bXCInXSkoW15cIiddKykoW1wiJ11bXj5dKj4pL2csXG4gICAgICAgICAgICAobWF0Y2g6IHN0cmluZywgcHJlZml4OiBzdHJpbmcsIHNyYzogc3RyaW5nLCBzdWZmaXg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXHVGRjFBL2Fzc2V0cy94eHguanNcbiAgICAgICAgICAgICAgaWYgKHNyYy5zdGFydHNXaXRoKCcvYXNzZXRzLycpICYmICFzcmMuc3RhcnRzV2l0aCgnL2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59LyR7YXBwTmFtZX0ke3NyY31gO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NUUwM1x1NUM0MFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFx1RkYxQS9hc3NldHMvbGF5b3V0L3h4eC5qc1xuICAgICAgICAgICAgICBpZiAoc3JjLnN0YXJ0c1dpdGgoJy9hc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS9sYXlvdXQtYXBwJHtzcmN9YDtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMUEuL2Fzc2V0cy94eHguanMgXHU2MjE2IGFzc2V0cy94eHguanNcbiAgICAgICAgICAgICAgaWYgKHNyYy5zdGFydHNXaXRoKCcuL2Fzc2V0cy8nKSB8fCBzcmMuc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBzcmMuc3RhcnRzV2l0aCgnLi8nKSA/IHNyYy5zdWJzdHJpbmcoMikgOiBzcmM7XG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRQYXRoLnN0YXJ0c1dpdGgoJ2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vbGF5b3V0LWFwcC8ke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChub3JtYWxpemVkUGF0aC5zdGFydHNXaXRoKCdhc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vJHthcHBOYW1lfS8ke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAyKSBcdTU5MDRcdTc0MDYgPGxpbmsgaHJlZj4gXHU2ODA3XHU3QjdFXHVGRjA4Q1NTXHUzMDAxbW9kdWxlcHJlbG9hZCBcdTdCNDlcdUZGMDlcdUZGMDhcdTRFQzVcdTU3MjggQ0ROIFx1NTQyRlx1NzUyOFx1NjVGNlx1OEY2Q1x1NjM2Mlx1RkYwOVxuICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgICAvKDxsaW5rW14+XSpcXHMraHJlZj1bXCInXSkoW15cIiddKykoW1wiJ11bXj5dKj4pL2csXG4gICAgICAgICAgICAobWF0Y2g6IHN0cmluZywgcHJlZml4OiBzdHJpbmcsIGhyZWY6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU1RjUzXHU1MjREXHU1RTk0XHU3NTI4XHU4RDQ0XHU2RTkwXHVGRjFBL2Fzc2V0cy94eHguY3NzXG4gICAgICAgICAgICAgIGlmIChocmVmLnN0YXJ0c1dpdGgoJy9hc3NldHMvJykgJiYgIWhyZWYuc3RhcnRzV2l0aCgnL2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59LyR7YXBwTmFtZX0ke2hyZWZ9YDtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3ByZWZpeH0ke2NkblVybH0ke3N1ZmZpeH1gO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTVFMDNcdTVDNDBcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcdUZGMUEvYXNzZXRzL2xheW91dC94eHguY3NzXG4gICAgICAgICAgICAgIGlmIChocmVmLnN0YXJ0c1dpdGgoJy9hc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2RuVXJsID0gYCR7Y2RuRG9tYWlufS9sYXlvdXQtYXBwJHtocmVmfWA7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XG4gICAgICAgICAgICAgIGlmIChocmVmLnN0YXJ0c1dpdGgoJy4vYXNzZXRzLycpIHx8IGhyZWYuc3RhcnRzV2l0aCgnYXNzZXRzLycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBocmVmLnN0YXJ0c1dpdGgoJy4vJykgPyBocmVmLnN1YnN0cmluZygyKSA6IGhyZWY7XG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRQYXRoLnN0YXJ0c1dpdGgoJ2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vbGF5b3V0LWFwcC8ke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChub3JtYWxpemVkUGF0aC5zdGFydHNXaXRoKCdhc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vJHthcHBOYW1lfS8ke25vcm1hbGl6ZWRQYXRofWA7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAzKSBcdTU5MDRcdTc0MDYgPGltZyBzcmM+IFx1NjgwN1x1N0I3RVx1RkYwOFx1NEVDNVx1NTcyOCBDRE4gXHU1NDJGXHU3NTI4XHU2NUY2XHU4RjZDXHU2MzYyXHVGRjA5XG4gICAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZShcbiAgICAgICAgICAgIC8oPGltZ1tePl0qXFxzK3NyYz1bXCInXSkoW15cIiddKykoW1wiJ11bXj5dKj4pL2csXG4gICAgICAgICAgICAobWF0Y2g6IHN0cmluZywgcHJlZml4OiBzdHJpbmcsIHNyYzogc3RyaW5nLCBzdWZmaXg6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAvLyBcdTU5MDRcdTc0MDZcdTVGNTNcdTUyNERcdTVFOTRcdTc1MjhcdThENDRcdTZFOTBcdUZGMUEvYXNzZXRzL3h4eC5wbmdcbiAgICAgICAgICAgICAgaWYgKHNyYy5zdGFydHNXaXRoKCcvYXNzZXRzLycpICYmICFzcmMuc3RhcnRzV2l0aCgnL2Fzc2V0cy9sYXlvdXQvJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZG5VcmwgPSBgJHtjZG5Eb21haW59LyR7YXBwTmFtZX0ke3NyY31gO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlZml4fSR7Y2RuVXJsfSR7c3VmZml4fWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIFx1NTkwNFx1NzQwNlx1NUUwM1x1NUM0MFx1NUU5NFx1NzUyOFx1OEQ0NFx1NkU5MFx1RkYxQS9hc3NldHMvbGF5b3V0L3h4eC5wbmdcbiAgICAgICAgICAgICAgaWYgKHNyYy5zdGFydHNXaXRoKCcvYXNzZXRzL2xheW91dC8nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNkblVybCA9IGAke2NkbkRvbWFpbn0vbGF5b3V0LWFwcCR7c3JjfWA7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHtjZG5Vcmx9JHtzdWZmaXh9YDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gNCkgXHU1OTA0XHU3NDA2XHU1MTg1XHU4MDU0XHU3Njg0IGltcG9ydCgpIFx1OEMwM1x1NzUyOFx1RkYwOFx1NTcyOCBIVE1MIFx1NkEyMVx1Njc3Rlx1NEUyRFx1RkYwOVxuICAgICAgICAvLyBcdTRGRUVcdTU5MEQgcWlhbmt1biBcdTZDRThcdTUxNjVcdTc2ODRcdTUxODVcdTgwNTQgaW1wb3J0KCcvYXNzZXRzL2luZGV4LXh4eC5qcycpXG4gICAgICAgIGNvbnN0IG9yaWdpbkV4cHIgPVxuICAgICAgICAgIGAoKHR5cGVvZiBfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXyE9PSd1bmRlZmluZWQnJiZfX0lOSkVDVEVEX1BVQkxJQ19QQVRIX0JZX1FJQU5LVU5fXylgICtcbiAgICAgICAgICBgP25ldyBVUkwoX19JTkpFQ1RFRF9QVUJMSUNfUEFUSF9CWV9RSUFOS1VOX18sKHR5cGVvZiBsb2NhdGlvbiE9PSd1bmRlZmluZWQnJiZsb2NhdGlvbi5vcmlnaW4pfHwnJykub3JpZ2luYCArXG4gICAgICAgICAgYDooKHR5cGVvZiBsb2NhdGlvbiE9PSd1bmRlZmluZWQnJiZsb2NhdGlvbi5vcmlnaW4pfHwnJykpYDtcbiAgICAgICAgXG4gICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoXG4gICAgICAgICAgL2ltcG9ydFxcKFxccyooWydcIl0pKFxcL2Fzc2V0c1xcLyhpbmRleHxtYWluKS1bXidcIl0rKVxcMVxccypcXCkvZyxcbiAgICAgICAgICAoX206IHN0cmluZywgX3E6IHN0cmluZywgYWJzUGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAvLyBcdTRGRERcdTYzMDFcdTUzOUZcdTY3MDlcdTkwM0JcdThGOTFcdUZGMENcdTRGNDZcdTc4NkVcdTRGRERcdThERUZcdTVGODRcdTZCNjNcdTc4NkVcbiAgICAgICAgICAgIHJldHVybiBgaW1wb3J0KC8qIEB2aXRlLWlnbm9yZSAqLyAoJHtvcmlnaW5FeHByfSArICcke2Fic1BhdGh9JykpYDtcbiAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIDUpIFx1NkNFOFx1NTE2NVx1OEQ0NFx1NkU5MFx1NTJBMFx1OEY3RFx1NTY2OFx1NTIxRFx1NTlDQlx1NTMxNlx1ODExQVx1NjcyQ1x1NTQ4Q1x1NjVFOVx1NjcxRiBVUkwgXHU4RjZDXHU2MzYyXHU4MTFBXHU2NzJDXG4gICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NTM3M1x1NEY3RiBDRE4gXHU2M0QyXHU0RUY2XHU4OEFCXHU3OTgxXHU3NTI4XHVGRjBDXHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHU2NUY2XHU0RTVGXHU5NzAwXHU4OTgxXHU2Q0U4XHU1MTY1XHU2NUU5XHU2NzFGIFVSTCBcdThGNkNcdTYzNjJcdTgxMUFcdTY3MkNcbiAgICAgICAgaWYgKCFuZXdIdG1sLmluY2x1ZGVzKCdfX0JUQ19SRVNPVVJDRV9MT0FERVJfXycpIHx8IG5lZWRzRWFybHlDb252ZXJ0ZXIpIHtcbiAgICAgICAgICAvLyBcdTY4MzlcdTYzNkUgRU5BQkxFX0NETl9BQ0NFTEVSQVRJT04gXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHU1MUIzXHU1QjlBXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4IENETlxuICAgICAgICAgIGNvbnN0IGNkbkVuYWJsZWQgPSBwcm9jZXNzLmVudi5FTkFCTEVfQ0ROX0FDQ0VMRVJBVElPTiAhPT0gJ2ZhbHNlJztcbiAgICAgICAgICBjb25zdCBpc1ByZXZpZXdCdWlsZCA9IHByb2Nlc3MuZW52LlZJVEVfUFJFVklFVyA9PT0gJ3RydWUnO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFx1NjVFOVx1NjcxRiBVUkwgXHU4RjZDXHU2MzYyXHU4MTFBXHU2NzJDXHVGRjA4XHU1NzI4XHU5ODg0XHU4OUM4XHU2Nzg0XHU1RUZBXHU2NUY2XHU2Q0U4XHU1MTY1XHVGRjBDXHU3NTI4XHU0RThFXHU1NzI4IEhUTUwgXHU4OUUzXHU2NzkwXHU1MjREXHU4RjZDXHU2MzYyIENETiBVUkxcdUZGMDlcbiAgICAgICAgICAvLyBcdTUzNzNcdTRGN0YgQ0ROIFx1NjNEMlx1NEVGNlx1ODhBQlx1Nzk4MVx1NzUyOFx1RkYwQ1x1OTg4NFx1ODlDOFx1NzNBRlx1NTg4M1x1NEU1Rlx1NTNFRlx1ODBGRFx1NEY3Rlx1NzUyOFx1NTMwNVx1NTQyQiBDRE4gVVJMIFx1NzY4NFx1NjVFN1x1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVxuICAgICAgICAgIGNvbnN0IGVhcmx5VXJsQ29udmVydGVyU2NyaXB0ID0gaXNQcmV2aWV3QnVpbGQgPyBgXG48c2NyaXB0PlxuICAoZnVuY3Rpb24oKSB7XG4gICAgLy8gXHU1MTczXHU5NTJFXHVGRjFBXHU1NzI4IEhUTUwgXHU4OUUzXHU2NzkwXHU0RTRCXHU1MjREXHU1QzMxXHU1OTA0XHU3NDA2IENETiBVUkxcdUZGMENcdTkwN0ZcdTUxNERcdTZENEZcdTg5QzhcdTU2NjhcdThCRjdcdTZDNDIgQ0ROIFx1OEQ0NFx1NkU5MFxuICAgIC8vIFx1OEZEOVx1NEUyQVx1ODExQVx1NjcyQ1x1NUZDNVx1OTg3Qlx1NTcyOFx1NjI0MFx1NjcwOVx1NTE3Nlx1NEVENiBzY3JpcHQgXHU1NDhDIGxpbmsgXHU2ODA3XHU3QjdFXHU0RTRCXHU1MjREXHU2MjY3XHU4ODRDXG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnN0IGNvbnZlcnRDZG5VcmwgPSAodXJsKSA9PiB7XG4gICAgICAgIGlmICghdXJsIHx8ICghdXJsLnN0YXJ0c1dpdGgoJ2h0dHA6Ly8nKSAmJiAhdXJsLnN0YXJ0c1dpdGgoJ2h0dHBzOi8vJykpKSB7XG4gICAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHVybE9iaiA9IG5ldyBVUkwodXJsKTtcbiAgICAgICAgICBpZiAodXJsT2JqLmhvc3RuYW1lLmluY2x1ZGVzKCdhbGwuYmVsbGlzLmNvbS5jbicpIHx8IFxuICAgICAgICAgICAgICB1cmxPYmouaG9zdG5hbWUuaW5jbHVkZXMoJ2JlbGxpczEub3NzLWNuLXNoZW56aGVuLmFsaXl1bmNzLmNvbScpKSB7XG4gICAgICAgICAgICAvLyBcdTYzRDBcdTUzRDZcdThERUZcdTVGODRcdTkwRThcdTUyMDZcdUZGMENcdTUzQkJcdTYzODlcdTVFOTRcdTc1MjhcdTUyNERcdTdGMDBcbiAgICAgICAgICAgIGxldCBwYXRoID0gdXJsT2JqLnBhdGhuYW1lO1xuICAgICAgICAgICAgaWYgKHBhdGguaW5jbHVkZXMoJy9hc3NldHMvJykpIHtcbiAgICAgICAgICAgICAgcGF0aCA9IHBhdGguc3Vic3RyaW5nKHBhdGguaW5kZXhPZignL2Fzc2V0cy8nKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhdGguaW5jbHVkZXMoJy9hc3NldHMvbGF5b3V0LycpKSB7XG4gICAgICAgICAgICAgIHBhdGggPSBwYXRoLnN1YnN0cmluZyhwYXRoLmluZGV4T2YoJy9hc3NldHMvbGF5b3V0LycpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NEZERFx1NzU1OVx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1NTQ4Q1x1NTRDOFx1NUUwQ1xuICAgICAgICAgICAgcmV0dXJuIHBhdGggKyAodXJsT2JqLnNlYXJjaCB8fCAnJykgKyAodXJsT2JqLmhhc2ggfHwgJycpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIFVSTCBcdTg5RTNcdTY3OTBcdTU5MzFcdThEMjVcdUZGMENcdThGRDRcdTU2REVcdTUzOUYgVVJMXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgIH07XG4gICAgICBcbiAgICAgIC8vIFx1NjJFNlx1NjIyQSBkb2N1bWVudC5jcmVhdGVFbGVtZW50XHVGRjBDXHU1NzI4XHU1MjFCXHU1RUZBIHNjcmlwdCBcdTU0OEMgbGluayBcdTY4MDdcdTdCN0VcdTY1RjZcdThGNkNcdTYzNjIgVVJMXG4gICAgICBjb25zdCBvcmlnaW5hbENyZWF0ZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50LmJpbmQoZG9jdW1lbnQpO1xuICAgICAgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCA9IGZ1bmN0aW9uKHRhZ05hbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IG9yaWdpbmFsQ3JlYXRlRWxlbWVudCh0YWdOYW1lLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKHRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3NjcmlwdCcgfHwgdGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnbGluaycpIHtcbiAgICAgICAgICBjb25zdCBvcmlnaW5hbFNldEF0dHJpYnV0ZSA9IGVsZW1lbnQuc2V0QXR0cmlidXRlLmJpbmQoZWxlbWVudCk7XG4gICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKChuYW1lID09PSAnc3JjJyB8fCBuYW1lID09PSAnaHJlZicpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgY29uc3QgY29udmVydGVkVXJsID0gY29udmVydENkblVybCh2YWx1ZSk7XG4gICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFNldEF0dHJpYnV0ZShuYW1lLCBjb252ZXJ0ZWRVcmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsU2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgICAgfTtcbiAgICAgIFxuICAgICAgLy8gXHU1OTA0XHU3NDA2XHU1REYyXHU1QjU4XHU1NzI4XHU3Njg0IHNjcmlwdCBcdTU0OEMgbGluayBcdTY4MDdcdTdCN0VcdUZGMDhcdTU5ODJcdTY3OUMgRE9NIFx1NURGMlx1N0VDRlx1OTBFOFx1NTIwNlx1ODlFM1x1Njc5MFx1RkYwOVxuICAgICAgY29uc3QgcHJvY2Vzc0V4aXN0aW5nVGFncyA9ICgpID0+IHtcbiAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwpIHtcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbc3JjXScpLmZvckVhY2goKHNjcmlwdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3JjID0gc2NyaXB0LmdldEF0dHJpYnV0ZSgnc3JjJyk7XG4gICAgICAgICAgICBpZiAoc3JjKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRlZFVybCA9IGNvbnZlcnRDZG5Vcmwoc3JjKTtcbiAgICAgICAgICAgICAgaWYgKGNvbnZlcnRlZFVybCAhPT0gc3JjKSB7XG4gICAgICAgICAgICAgICAgc2NyaXB0LnNldEF0dHJpYnV0ZSgnc3JjJywgY29udmVydGVkVXJsKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpbmtbaHJlZl0nKS5mb3JFYWNoKChsaW5rKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBocmVmID0gbGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICAgICAgICAgIGlmIChocmVmKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRlZFVybCA9IGNvbnZlcnRDZG5VcmwoaHJlZik7XG4gICAgICAgICAgICAgIGlmIChjb252ZXJ0ZWRVcmwgIT09IGhyZWYpIHtcbiAgICAgICAgICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZSgnaHJlZicsIGNvbnZlcnRlZFVybCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgLy8gXHU3QUNCXHU1MzczXHU1OTA0XHU3NDA2XHVGRjA4XHU1OTgyXHU2NzlDIERPTSBcdTVERjJcdTdFQ0ZcdTkwRThcdTUyMDZcdTg5RTNcdTY3OTBcdUZGMDlcbiAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2ludGVyYWN0aXZlJykge1xuICAgICAgICBwcm9jZXNzRXhpc3RpbmdUYWdzKCk7XG4gICAgICAgIC8vIFx1NzZEMVx1NTQyQyBET00gXHU1M0Q4XHU1MzE2XHVGRjBDXHU1OTA0XHU3NDA2XHU1NDBFXHU3RUVEXHU2REZCXHU1MkEwXHU3Njg0XHU2ODA3XHU3QjdFXG4gICAgICAgIGlmIChkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHByb2Nlc3NFeGlzdGluZ1RhZ3MpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9jZXNzRXhpc3RpbmdUYWdzKCk7XG4gICAgICB9XG4gICAgfVxuICB9KSgpO1xuPC9zY3JpcHQ+YCA6ICcnO1xuICAgICAgICAgIFxuICAgICAgICAgIGNvbnN0IGxvYWRlclNjcmlwdCA9IGBcbjxzY3JpcHQ+XG4gIChmdW5jdGlvbigpIHtcbiAgICAvLyBcdThENDRcdTZFOTBcdTUyQTBcdThGN0RcdTU2NjhcdTVDMDZcdTU3MjhcdThGRDBcdTg4NENcdTY1RjZcdTZBMjFcdTU3NTdcdTRFMkRcdTUyMURcdTU5Q0JcdTUzMTZcbiAgICAvLyBcdThGRDlcdTkxQ0NcdTUzRUFcdThCQkVcdTdGNkVcdTU3RkFcdTc4NDBcdTkxNERcdTdGNkVcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHdpbmRvdy5fX0JUQ19DRE5fQ09ORklHX18gPSB7XG4gICAgICAgIGFwcE5hbWU6ICcke2FwcE5hbWV9JyxcbiAgICAgICAgY2RuRG9tYWluOiAnJHtjZG5Eb21haW59JyxcbiAgICAgICAgb3NzRG9tYWluOiAnaHR0cHM6Ly9iZWxsaXMxLm9zcy1jbi1zaGVuemhlbi5hbGl5dW5jcy5jb20nLFxuICAgICAgICBlbmFibGVkOiAke2NkbkVuYWJsZWR9XG4gICAgICB9O1xuICAgIH1cbiAgfSkoKTtcbjwvc2NyaXB0PmA7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gXHU1NzI4IDwvaGVhZD4gXHU0RTRCXHU1MjREXHU2Q0U4XHU1MTY1XHVGRjA4XHU2NUU5XHU2NzFGIFVSTCBcdThGNkNcdTYzNjJcdTgxMUFcdTY3MkNcdTVGQzVcdTk4N0JcdTU3MjhcdTY3MDBcdTUyNERcdTk3NjJcdUZGMENcdTU3MjhcdTYyNDBcdTY3MDlcdTUxNzZcdTRFRDYgc2NyaXB0IFx1NTQ4QyBsaW5rIFx1NjgwN1x1N0I3RVx1NEU0Qlx1NTI0RFx1RkYwOVxuICAgICAgICAgIGlmIChuZXdIdG1sLmluY2x1ZGVzKCc8L2hlYWQ+JykpIHtcbiAgICAgICAgICAgIC8vIFx1NTE3M1x1OTUyRVx1RkYxQVx1NjVFOVx1NjcxRiBVUkwgXHU4RjZDXHU2MzYyXHU4MTFBXHU2NzJDXHU1RkM1XHU5ODdCXHU1NzI4IDxoZWFkPiBcdTc2ODRcdTY3MDBcdTUyNERcdTk3NjJcdUZGMENcdTU3MjhcdTYyNDBcdTY3MDlcdTUxNzZcdTRFRDZcdTY4MDdcdTdCN0VcdTRFNEJcdTUyNERcbiAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NURGMlx1N0VDRlx1NjcwOVx1NTE3Nlx1NEVENiBzY3JpcHQgXHU2ODA3XHU3QjdFXHVGRjBDXHU1NzI4XHU3QjJDXHU0RTAwXHU0RTJBIHNjcmlwdCBcdTY4MDdcdTdCN0VcdTRFNEJcdTUyNERcdTYzRDJcdTUxNjVcbiAgICAgICAgICAgIGlmIChlYXJseVVybENvbnZlcnRlclNjcmlwdCAmJiBuZXdIdG1sLmluY2x1ZGVzKCc8c2NyaXB0JykpIHtcbiAgICAgICAgICAgICAgLy8gXHU1NzI4XHU3QjJDXHU0RTAwXHU0RTJBIDxzY3JpcHQ+IFx1NjIxNiA8bGluaz4gXHU2ODA3XHU3QjdFXHU0RTRCXHU1MjREXHU2M0QyXHU1MTY1XHU2NUU5XHU2NzFGXHU4RjZDXHU2MzYyXHU4MTFBXHU2NzJDXG4gICAgICAgICAgICAgIGNvbnN0IGZpcnN0VGFnTWF0Y2ggPSBuZXdIdG1sLm1hdGNoKC88KHNjcmlwdHxsaW5rKVtePl0qPi9pKTtcbiAgICAgICAgICAgICAgaWYgKGZpcnN0VGFnTWF0Y2ggJiYgZmlyc3RUYWdNYXRjaC5pbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwuc2xpY2UoMCwgZmlyc3RUYWdNYXRjaC5pbmRleCkgKyBlYXJseVVybENvbnZlcnRlclNjcmlwdCArIG5ld0h0bWwuc2xpY2UoZmlyc3RUYWdNYXRjaC5pbmRleCk7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOVx1NjI3RVx1NTIzMCBzY3JpcHQgXHU2MjE2IGxpbmsgXHU2ODA3XHU3QjdFXHVGRjBDXHU1NzI4IDwvaGVhZD4gXHU0RTRCXHU1MjREXHU2M0QyXHU1MTY1XG4gICAgICAgICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZSgnPC9oZWFkPicsIGAke2Vhcmx5VXJsQ29udmVydGVyU2NyaXB0fVxcbjwvaGVhZD5gKTtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFx1NkNFOFx1NTE2NVx1OEQ0NFx1NkU5MFx1NTJBMFx1OEY3RFx1NTY2OFx1OTE0RFx1N0Y2RVx1ODExQVx1NjcyQ1xuICAgICAgICAgICAgaWYgKCFuZXdIdG1sLmluY2x1ZGVzKCdfX0JUQ19SRVNPVVJDRV9MT0FERVJfXycpKSB7XG4gICAgICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoJzwvaGVhZD4nLCBgJHtsb2FkZXJTY3JpcHR9XFxuPC9oZWFkPmApO1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChuZXdIdG1sLmluY2x1ZGVzKCc8L2JvZHk+JykpIHtcbiAgICAgICAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOSA8L2hlYWQ+XHVGRjBDXHU1NzI4IDwvYm9keT4gXHU0RTRCXHU1MjREXHU2Q0U4XHU1MTY1XG4gICAgICAgICAgICBpZiAoZWFybHlVcmxDb252ZXJ0ZXJTY3JpcHQpIHtcbiAgICAgICAgICAgICAgbmV3SHRtbCA9IG5ld0h0bWwucmVwbGFjZSgnPC9ib2R5PicsIGAke2Vhcmx5VXJsQ29udmVydGVyU2NyaXB0fVxcbjwvYm9keT5gKTtcbiAgICAgICAgICAgICAgbW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFuZXdIdG1sLmluY2x1ZGVzKCdfX0JUQ19SRVNPVVJDRV9MT0FERVJfXycpKSB7XG4gICAgICAgICAgICAgIG5ld0h0bWwgPSBuZXdIdG1sLnJlcGxhY2UoJzwvYm9keT4nLCBgJHtsb2FkZXJTY3JpcHR9XFxuPC9ib2R5PmApO1xuICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgY29uc29sZS5pbmZvKGBbY2RuLWFzc2V0c10gXHU1REYyXHU0RTNBIGluZGV4Lmh0bWwgXHU0RTJEXHU3Njg0XHU4RDQ0XHU2RTkwXHU1RjE1XHU3NTI4XHU4RjZDXHU2MzYyXHU0RTNBIENETiBVUkxgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG5ld0h0bWw7XG4gICAgICB9LFxuICAgIH0sXG4gIH0gYXMgUGx1Z2luO1xufVxuXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVaLFNBQVMsb0JBQW9CO0FBQ3BiLFNBQVMsaUJBQUFBLHNCQUFxQjs7O0FDTTlCLFNBQVMsV0FBQUMsZ0JBQWU7QUFDeEIsU0FBUyxjQUFBQyxhQUFZLGdCQUFBQyxlQUFjLFVBQUFDLFNBQVEsaUJBQUFDLHNCQUFxQjtBQUNoRSxPQUFPLFNBQVM7QUFDaEIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sYUFBYTtBQUNwQixPQUFPLFlBQVk7OztBQ1BuQixTQUFTLGVBQWU7QUFPakIsU0FBUyxrQkFBa0IsUUFBZ0I7QUFJaEQsUUFBTSxVQUFVLENBQUMsaUJBQXlCLFFBQVEsUUFBUSxZQUFZO0FBS3RFLFFBQU0sZUFBZSxDQUFDLGlCQUNwQixRQUFRLFFBQVEsa0JBQWtCLFlBQVk7QUFLaEQsUUFBTSxXQUFXLENBQUMsaUJBQ2hCLFFBQVEsUUFBUSxTQUFTLFlBQVk7QUFLdkMsUUFBTSxjQUFjLENBQUMsaUJBQ25CLFFBQVEsUUFBUSxpQkFBaUIsWUFBWTtBQUUvQyxTQUFPLEVBQUUsU0FBUyxjQUFjLFVBQVUsWUFBWTtBQUN4RDs7O0FEckJBLE9BQU8sbUJBQW1COzs7QUVaMUIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUywyQkFBMkI7QUFLN0IsU0FBUyx5QkFBeUI7QUFDdkMsU0FBTyxXQUFXO0FBQUEsSUFDaEIsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FB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QUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJ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QUNoQjtBQUNGOzs7QUR4c0JxUSxJQUFNSyw0Q0FBMkM7QUFLdFQsSUFBTyxzQkFBUTtBQUFBLEVBQ2IsMEJBQTBCO0FBQUEsSUFDeEIsU0FBUztBQUFBLElBQ1QsUUFBUUMsZUFBYyxJQUFJLElBQUksS0FBS0QseUNBQWUsQ0FBQztBQUFBLElBQ25ELGFBQWE7QUFBQSxJQUNiLGVBQWU7QUFBQTtBQUFBLE1BRWIsZ0JBQWdCQyxlQUFjLElBQUksSUFBSSxLQUFLRCx5Q0FBZSxDQUFDLENBQUM7QUFBQTtBQUFBLE1BRTVELHVCQUF1QjtBQUFBLElBQ3pCO0FBQUEsRUFDRixDQUFDO0FBQ0g7IiwKICAibmFtZXMiOiBbImZpbGVVUkxUb1BhdGgiLCAicmVzb2x2ZSIsICJleGlzdHNTeW5jIiwgInJlYWRGaWxlU3luYyIsICJybVN5bmMiLCAid3JpdGVGaWxlU3luYyIsICJyZXNvbHZlIiwgInJlc29sdmUiLCAicmVzb2x2ZSIsICJyZXNvbHZlIiwgInJlc29sdmUiLCAiZXhpc3RzU3luYyIsICJyZXNvbHZlIiwgImV4aXN0c1N5bmMiLCAib3JpZ2luIiwgImV4aXN0c1N5bmMiLCAicmVzb2x2ZSIsICJkaXJuYW1lIiwgImZpbGVVUkxUb1BhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCIsICJfX2ZpbGVuYW1lIiwgImZpbGVVUkxUb1BhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCIsICJfX2Rpcm5hbWUiLCAiZGlybmFtZSIsICJyZXNvbHZlIiwgImV4aXN0c1N5bmMiLCAidGltZXN0YW1wIiwgInJlc29sdmUiLCAiZXhpc3RzU3luYyIsICJ3cml0ZUZpbGVTeW5jIiwgInJlc29sdmUiLCAiZXhpc3RzU3luYyIsICJ3cml0ZUZpbGVTeW5jIiwgInJlc29sdmUiLCAiZmlsZVVSTFRvUGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgIl9fZmlsZW5hbWUiLCAiZmlsZVVSTFRvUGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgIl9fZGlybmFtZSIsICJyZXNvbHZlIiwgInNwYXduIiwgInJlc29sdmUiLCAiZmlsZVVSTFRvUGF0aCIsICJleGVjU3luYyIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgIl9fZmlsZW5hbWUiLCAiZmlsZVVSTFRvUGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgIl9fZGlybmFtZSIsICJyZXNvbHZlIiwgInByb2plY3RSb290IiwgInRyeUxvYWRPc3NDcmVkc0Zyb21XaW5kb3dzQ3JlZGVudGlhbE1hbmFnZXIiLCAiZXhlY1N5bmMiLCAic3Bhd24iLCAiaXNQcmV2aWV3QnVpbGQiLCAicmVzb2x2ZSIsICJleGlzdHNTeW5jIiwgInJlYWRGaWxlU3luYyIsICJybVN5bmMiLCAid3JpdGVGaWxlU3luYyIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgImZpbGVVUkxUb1BhdGgiXQp9Cg==
